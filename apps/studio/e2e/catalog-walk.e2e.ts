import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { chromium, type Browser, type ElementHandle, type Frame, type Page } from 'playwright';
import { afterAll, beforeAll, expect, it } from 'vitest';
import { catalogWalk, WALK_SCENARIOS, walkKey } from '../../../packages/core/test/catalog-walk.js';

const pageUrl = new URL('../dist/artifact/local-test.html', import.meta.url).href;
const axeSource = readFileSync(createRequire(import.meta.url).resolve('axe-core/axe.min.js'), 'utf8');
const walk = catalogWalk();
let browser: Browser;
beforeAll(async () => { browser = await chromium.launch(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {}); });
afterAll(async () => { await browser?.close(); });

async function audit(surface: Page | Frame): Promise<string[]> {
  await surface.evaluate(axeSource);
  return surface.evaluate(async () => {
    const axe = (window as unknown as { axe: { run: (root: Document, options: unknown) => Promise<{ violations: { id: string; impact: string | null; nodes: { target: unknown[]; failureSummary?: string }[] }[] }> } }).axe;
    const result = await axe.run(document, { iframes: false, resultTypes: ['violations'] });
    return result.violations.filter((finding) => finding.impact === 'serious' || finding.impact === 'critical')
      .map((finding) => `${finding.id}: ${finding.nodes.map((node) => `${String(node.target)} ${node.failureSummary ?? ''}`).join('; ')}`);
  });
}

async function enter(page: Page, step: (typeof walk)[number]): Promise<void> {
  await page.locator(`a[href="#${step.id}"]`).first().press('Enter');
  await page.waitForFunction((title) => document.querySelector('#step-title')?.textContent === title, step.title);
}

async function choose(page: Page, step: (typeof walk)[number], optionId: string): Promise<void> {
  const radio = page.locator(`[id="option-${optionId}"]`);
  const index = await page.locator('.cards input').evaluateAll((inputs, id) => inputs.findIndex((input) => (input as HTMLInputElement).value === id), optionId);
  if (index < 9) await page.keyboard.press(String(index + 1));
  else await radio.press('Space');
  expect(await page.locator('.actions.sticky .primary').innerText(), `${step.id}/${optionId}: explicit named pick`).toMatch(/^Pick /);
  await page.locator('.actions.sticky .primary').press('Enter');
  await page.goBack();
  await page.waitForFunction((title) => document.querySelector('#step-title')?.textContent === title, step.title);
  expect(await page.locator(`.option[data-in-use] input[value="${optionId}"]`).count(), `${step.id}/${optionId}: committed through the UI`).toBe(1);
}

it('M5 exit: walks every Catalog Step and Option through the Studio, auditing both pages and themes', async () => {
  const started = performance.now();
  const failures: string[] = [];
  const visited: string[] = [];
  const screens: string[] = [];
  const themeStep = walk.find((step) => step.ownsTheme)!;
  await Promise.all(WALK_SCENARIOS.map(async (scenario, lane) => {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: scenario.theme });
    const page = await context.newPage();
    await page.addInitScript(() => {
      if (window.top !== window) return;
      const authored = new WeakMap<HTMLIFrameElement, string>();
      (window as unknown as { m5AuthoredSandbox: WeakMap<HTMLIFrameElement, string> }).m5AuthoredSandbox = authored;
      const setAttribute = Element.prototype.setAttribute;
      // Record the sandbox React authored, then grant only the test frame the permission axe's asynchronous checks need.
      Element.prototype.setAttribute = function (name, value) {
        if (this instanceof HTMLIFrameElement && this.title.startsWith('Large preview of ') && name === 'sandbox' && value === '') {
          authored.set(this, value);
          return setAttribute.call(this, name, 'allow-scripts');
        }
        return setAttribute.call(this, name, value);
      };
    });
    const faults: string[] = [];
    page.on('pageerror', (error) => faults.push(String(error)));
    page.on('console', (message) => { if (message.type() === 'error') faults.push(message.text()); });
    page.on('request', (request) => { if (!/^(file|data|about|blob):/.test(request.url())) faults.push(`Remote request: ${request.url()}`); });
    const restoreTheme = async (): Promise<void> => {
      await enter(page, themeStep);
      await choose(page, themeStep, themeStep.options.find((option) => option.theme === scenario.theme)!.id);
    };
    let current = `${scenario.page}/${scenario.theme}: opening`;
    try {
      await page.goto(pageUrl);
      await page.getByRole('button', { name: 'Start from Soft Daylight', exact: true }).click();
      expect(await page.locator('.rail ol a').evaluateAll((links) => links.map((link) => link.getAttribute('href')))).toEqual(walk.map((step) => `#${step.id}`));
      await page.getByLabel('Show the layout only, in gray', { exact: true }).uncheck();
      await page.getByRole('combobox', { name: 'Preview page', exact: true }).selectOption(scenario.page);
      await restoreTheme();
      for (const [stepIndex, step] of walk.entries()) {
        await enter(page, step);
        for (const [index, option] of step.options.entries()) {
          current = walkKey(step.id, option.id, scenario.page, scenario.theme);
          await choose(page, step, option.id);
          const target = page.locator('.large-preview iframe');
          let mounted: { handle: ElementHandle<HTMLIFrameElement>; frame: Frame } | undefined;
          await expect.poll(async () => {
            const handle = await target.elementHandle() as ElementHandle<HTMLIFrameElement> | null;
            const frame = await handle?.contentFrame();
            if (!handle || !frame || frame.isDetached()) return false;
            try {
              await frame.waitForURL('about:srcdoc', { waitUntil: 'load' });
              if (!await handle.evaluate((element) => element.isConnected)) return false;
              mounted = { handle, frame };
              return true;
            } catch (error) {
              if (frame.isDetached()) return false;
              throw error;
            }
          }).toBe(true);
          const { handle, frame } = mounted!;
          expect(await handle.evaluate((element) => (window as unknown as { m5AuthoredSandbox: WeakMap<HTMLIFrameElement, string> }).m5AuthoredSandbox.get(element)), current).toBe('');
          expect(await handle.getAttribute('sandbox'), current).toBe('allow-scripts');
          expect(await frame.evaluate(() => document.scripts.length), current).toBe(0);
          const html = await handle.getAttribute('srcdoc');
          await frame.evaluate(async () => {
            await document.fonts.ready;
            const finite = document.getAnimations().filter((animation) => Number.isFinite(animation.effect?.getComputedTiming().endTime));
            for (const animation of finite) animation.finish();
            await Promise.all(finite.map((animation) => animation.finished));
          });
          const actual = await frame.evaluate(() => ({ page: document.body.dataset.page ?? 'home', theme: document.body.dataset.theme, scripts: document.scripts.length }));
          expect(actual, current).toEqual({ page: scenario.page, theme: step.ownsTheme ? option.theme : scenario.theme, scripts: 0 });
          const violations = await audit(frame);
          expect(await handle.getAttribute('srcdoc'), current).toBe(html);
          await handle.dispose();
          failures.push(...violations.map((violation) => `${current} (rendered ${actual.theme}): ${violation}`));
          visited.push(current);
          if (index === 0 && stepIndex % WALK_SCENARIOS.length === lane) {
            expect(await page.getByRole('region', { name: 'About the selected Option', exact: true }).evaluate((element) => element.tabIndex), current).toBe(0);
            failures.push(...(await audit(page)).map((violation) => `${current}/Studio: ${violation}`));
            screens.push(step.id);
          }
        }
        if (step.ownsTheme) await restoreTheme();
        console.log(`${scenario.page}/${scenario.theme}: audited ${step.id}; ${((performance.now() - started) / 1000).toFixed(2)}s`);
      }
      expect(faults, `${scenario.page}/${scenario.theme}: browser faults`).toEqual([]);
    } catch (error) {
      throw new Error(`${current}: ${String(error)}`, { cause: error });
    } finally { await context.close(); }
  }));
  const expected = WALK_SCENARIOS.flatMap(({ page, theme }) => walk.flatMap((step) => step.options.map((option) => walkKey(step.id, option.id, page, theme))));
  expect(visited.sort()).toEqual(expected.sort());
  expect(screens.sort()).toEqual(walk.map((step) => step.id).sort());
  console.log(`M5 exit walk: ${walk.length} Steps, ${expected.length / 4} Options, ${visited.length} Mockup audits, ${screens.length} Studio audits, ${failures.length} serious/critical findings; ${((performance.now() - started) / 1000).toFixed(2)}s.`);
  expect(failures).toEqual([]);
});
