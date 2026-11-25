import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { FLOORS, createProject, deriveTokens, pick, renderSmallBusiness } from '@refraction/core';
import { type Finding } from '../../../packages/kit/src/index.js';
import * as checks from '../../../packages/kit/src/page-checks/index.js';
import { chromium, type Browser } from 'playwright';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

const require = createRequire(import.meta.url);
const axe = readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');
const fonts = [['DM Sans', 'dm-sans'], ['Outfit', 'outfit']].map(([family, name]) => `@font-face{font-family:"${family}";src:url("data:font/woff2;base64,${readFileSync(require.resolve(`@fontsource-variable/${name}/files/${name}-latin-wght-normal.woff2`)).toString('base64')}") format("woff2");font-weight:100 900;font-style:normal}`).join('\n');
const functions = checks as unknown as Record<string, (...args: never[]) => unknown>;
const order = [...Object.keys(functions).filter((name) => name !== 'focusIsVisible'), 'focusIsVisible'];
const floorIds = new Set(FLOORS.map((entry) => entry.rule.id));
let browser: Browser;
beforeAll(async () => { browser = await chromium.launch(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {}); });
afterAll(async () => { await browser?.close(); });

describe('inner page: generated pages', () => {
  it('PR13: Contact sections show the form or explain the home-only fallback', async () => {
    const context = await browser.newContext({ viewport: { width: 375, height: 800 } });
    try {
      const page = await context.newPage();
      const project = createProject();
      const input = { page: 'contact' as const, params: project.params, content: project.content, tokens: deriveTokens(project.params, project.a11y).css, links: 'inert' as const, still: true };
      await page.setContent(renderSmallBusiness({ ...input, focus: 'contact' }));
      expect(await page.locator('.inner-intro').isVisible()).toBe(false);
      expect(await page.locator('.contact').evaluate((el) => el.getBoundingClientRect().top)).toBeLessThan(10);
      expect(await page.locator('form').isVisible()).toBe(true);
      for (const focus of ['facts', 'services', 'fees', 'about', 'buttons', 'box'] as const) {
        await page.setContent(renderSmallBusiness({ ...input, focus }));
        expect(await page.locator('.preview-fallback').innerText()).toContain('only on the home page');
        expect(await page.locator('.inner-intro').isVisible()).toBe(true);
        expect(await page.locator('body').getAttribute('data-focus')).toBe('top');
      }
    } finally { await context.close(); }
  });

  for (const pageName of ['home', 'contact'] as const) for (const width of [375, 1280]) for (const theme of ['light', 'dark'] as const) {
    it(`${pageName}, ${width}px, ${theme}: kit checks have no failing machine floor and axe has no serious finding`, async () => {
      const context = await browser.newContext({ viewport: { width, height: 800 }, colorScheme: theme });
      try {
        const page = await context.newPage();
        const requests: string[] = [];
        page.on('request', (request) => { if (/^https?:/.test(request.url())) requests.push(request.url()); });
        const project = pick(createProject(), 'theme', theme);
        const tokens = deriveTokens(project.params, project.a11y).css;
        const html = renderSmallBusiness({ page: pageName, params: project.params, tokens, content: project.content, fontFaceCss: fonts, still: true, links: 'inert' });
        expect(html).not.toMatch(/<script[\s>]|\son(?:click|load|error)=/i);
        await page.setContent(html);
        await page.evaluate(async () => { await Promise.all([...document.fonts].map((font) => font.load())); await document.fonts.ready; });
        const findings: Finding[] = [];
        for (const name of order) {
          findings.push(...await page.evaluate(`(${String(functions[name])})(document${name === 'tokenFit' ? `, ${JSON.stringify(tokens)}` : ''})`) as Finding[]);
          if (name === 'noSidewaysScroll') {
            await page.setViewportSize({ width: 320, height: 800 });
            findings.push(...await page.evaluate(`(${String(functions[name])})(document)`) as Finding[]);
            await page.setViewportSize({ width, height: 800 });
          }
        }
        expect(findings.filter((finding) => floorIds.has(finding.ruleId) && finding.status === 'fails')).toEqual([]);
        const measuredFloors = FLOORS.filter((entry) => entry.rule.check.kind === 'page-check');
        expect(measuredFloors.filter((entry) => !findings.some((finding) => finding.ruleId === entry.rule.id))).toEqual([]);
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
        await page.evaluate(axe);
        const violations = await page.evaluate(async () => {
          const engine = (window as unknown as { axe: { run: (doc: Document, options: unknown) => Promise<{ violations: { id: string; impact: string | null; nodes: unknown[] }[] }> } }).axe;
          return (await engine.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] } })).violations.filter((violation) => violation.impact === 'serious' || violation.impact === 'critical');
        });
        expect(violations).toEqual([]);
        expect(requests).toEqual([]);
      } finally {
        await context.close();
      }
    });
  }
  it('contact entrance honors reduced motion for every timing preset', async () => {
    const context = await browser.newContext();
    try {
      const page = await context.newPage();
      for (const option of ['settle', 'steady', 'gentle']) {
        const project = pick(pick(createProject(), 'motion', 'expressive'), 'motion-timing', option);
        const html = renderSmallBusiness({ page: 'contact', params: project.params, content: project.content, tokens: deriveTokens(project.params, project.a11y).css, links: 'inert' });
        await page.emulateMedia({ reducedMotion: 'no-preference' });
        await page.setContent(html);
        expect(await page.locator('.inner-intro').evaluate((el) => getComputedStyle(el).animationName)).toBe('rise');
        await page.emulateMedia({ reducedMotion: 'reduce' });
        expect(await page.locator('.inner-intro').evaluate((el) => getComputedStyle(el).animationName)).toBe('none');
      }
    } finally {
      await context.close();
    }
  });
});
