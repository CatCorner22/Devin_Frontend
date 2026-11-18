// The kit's page checks, run in a real browser against two pages: one built with care, one with one planted defect for every check.
// Each check travels into the page as text, which proves that it uses nothing from outside its own body.
import { pathToFileURL } from 'node:url';
import { join } from 'node:path';
import { chromium, type Browser, type Page } from 'playwright';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { KIT_RULES, dialogWalk, grade, receipt, repairPlan, tabOrderWalk, tabsWalk, type Finding, type Walk } from '../../../packages/kit/src/index.js';
import * as checks from '../../../packages/kit/src/page-checks/index.js';

const LOCAL_BROWSER = process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {};
const fixture = (name: string): string => pathToFileURL(join(import.meta.dirname, '..', '..', '..', 'packages', 'kit', 'fixtures', name)).href;
const TOKENS = { '--ink': '#1a1a1a', '--paper': '#ffffff', '--accent': '#0b5fff', '--line': '#d0d5dd', '--radius': '8px', '--radius-in': '4px', '--font-body': 'Georgia, serif' };
const CHECKS = checks as unknown as Record<string, (...args: never[]) => unknown>;
const PAGE_RULES = KIT_RULES.filter((rule) => rule.check.kind === 'page-check');

let browser: Browser;
async function open(name: string, width = 1280): Promise<Page> {
  const context = await browser.newContext({ viewport: { width, height: 800 }, deviceScaleFactor: 1 });
  const page = await context.newPage();
  await page.goto(fixture(name), { waitUntil: 'load' });
  await page.waitForTimeout(400); // the flawed page moves its content 100 ms after it loads
  return page;
}
/** Runs one check by sending its text into the page. */
async function run(page: Page, fn: string): Promise<Finding[]> {
  const source = String(CHECKS[fn]);
  return page.evaluate(`(${source})(document${fn === 'tokenFit' ? `, ${JSON.stringify(TOKENS)}` : ''})`) as Promise<Finding[]>;
}
async function runAll(page: Page): Promise<Finding[]> {
  const all: Finding[] = [];
  for (const fn of Object.keys(CHECKS)) all.push(...await run(page, fn));
  return all;
}
/** Every check at the present width, with the reflow floor measured where its record says: at 320 pixels. */
async function runAllWithReflow(page: Page): Promise<Finding[]> {
  const findings = (await runAll(page)).filter((f) => f.ruleId !== 'neuro-reflow');
  const size = page.viewportSize() ?? { width: 1280, height: 800 };
  await page.setViewportSize({ width: 320, height: size.height });
  findings.push(...await run(page, 'noSidewaysScroll'));
  await page.setViewportSize(size);
  return findings;
}
/** Runs a scripted walk. Returns null when every step holds, or a description of the first step that does not. */
async function walk(page: Page, w: Walk): Promise<string | null> {
  for (const [i, step] of w.steps.entries()) {
    if (step.do === 'focus') { await page.focus(step.on); continue; }
    if (step.do === 'press') { await page.keyboard.press(step.key); continue; }
    const ok = await page.evaluate((s) => {
      const el = document.querySelector<HTMLElement>(s.on);
      if (!el) return false;
      const shown = el.getClientRects().length > 0;
      if (s.do === 'expect-focus-on') return document.activeElement === el;
      if (s.do === 'expect-focus-inside') return el !== document.activeElement && el.contains(document.activeElement);
      if (s.do === 'expect-focus-not-behind') return el.contains(document.activeElement) || document.activeElement === document.body;
      if (s.do === 'expect-visible') return shown;
      if (s.do === 'expect-hidden') return !shown;
      return el.getAttribute(s.name) === s.value;
    }, step);
    if (!ok) return `step ${i + 1} (${step.do} ${step.on})`;
  }
  return null;
}

beforeAll(async () => { browser = await chromium.launch(LOCAL_BROWSER); });
afterAll(async () => { await browser?.close(); });

describe('the kit on a page built with care', () => {
  it('no check reports a failure at desktop width, and every check gives an answer for each of its rules', async () => {
    const page = await open('good.html');
    // At 1280 pixels the reflow floor refuses to answer: it is defined at 320 (review of 2026-11-18, F-2).
    expect((await run(page, 'noSidewaysScroll')).map((f) => f.status)).toEqual(['could-not-measure']);
    const findings = await runAllWithReflow(page);
    expect(findings.filter((f) => f.status === 'fails')).toEqual([]);
    expect(findings.filter((f) => f.status === 'could-not-measure')).toEqual([]);
    expect(PAGE_RULES.filter((rule) => !findings.some((f) => f.ruleId === rule.id)).map((rule) => rule.id)).toEqual([]);
    await page.context().close();
  });
  it('no check reports a failure at 320 pixels, the width of the reflow floor', async () => {
    const page = await open('good.html', 320);
    expect((await runAll(page)).filter((f) => f.status === 'fails')).toEqual([]);
    await page.context().close();
  });
  it('the keyboard walks hold: the window, the tabs, the order of the Tab key', async () => {
    const page = await open('good.html');
    expect(await walk(page, dialogWalk('#open', '#box', 4))).toBeNull();
    expect(await walk(page, tabsWalk(['#tab-a', '#tab-b', '#tab-c']))).toBeNull();
    expect(await walk(page, tabOrderWalk('#name', ['#phone', '#send']))).toBeNull();
    await page.context().close();
  });
  it('grades "Crafted" once the walks are counted, and the receipt still lists what a person must check', async () => {
    const page = await open('good.html');
    const findings = [...await runAllWithReflow(page), { ruleId: 'behavior-dialog-keys', status: 'holds' as const }];
    expect(grade(findings, KIT_RULES)).toMatchObject({ grade: 'Crafted', failedFloors: [], unmeasuredFloors: [] });
    expect(receipt(findings, KIT_RULES).forAPerson.length).toBeGreaterThan(8);
    await page.context().close();
  });
  it('without the walk the grade is "Not graded": a floor that did not run is not a pass', async () => {
    const page = await open('good.html');
    expect(grade(await runAllWithReflow(page), KIT_RULES)).toMatchObject({ grade: 'Not graded', unmeasuredFloors: ['behavior-dialog-keys'] });
    // And at desktop width alone the reflow floor is unmeasured too.
    expect(grade(await runAll(page), KIT_RULES).unmeasuredFloors).toEqual(['neuro-reflow', 'behavior-dialog-keys']);
    await page.context().close();
  });
});

describe('the kit on a page with one planted defect for every check', () => {
  let findings: Finding[];
  beforeAll(async () => {
    const page = await open('flawed.html');
    findings = (await runAll(page)).filter((f) => f.ruleId !== 'neuro-reflow');
    await page.context().close();
    // The reflow floor is measured at 320 pixels, as its record says.
    const narrow = await open('flawed.html', 320);
    findings.push(...await run(narrow, 'noSidewaysScroll'));
    await narrow.context().close();
  });
  for (const rule of PAGE_RULES) {
    it(`finds the planted defect: ${rule.id}`, () => {
      expect(findings.filter((f) => f.ruleId === rule.id && f.status === 'fails').length, rule.plain).toBeGreaterThan(0);
    });
  }
  it('every failure says where, what was found, what is required, and how to repair it', () => {
    for (const f of findings.filter((x) => x.status === 'fails')) {
      expect(f.measured, f.ruleId).toBeTruthy();
      expect(f.required, f.ruleId).toBeTruthy();
      expect(f.fix, f.ruleId).toBeTruthy();
    }
  });
  it('the false window fails the window walk, and the tabs without arrow keys fail the tabs walk', async () => {
    const page = await open('flawed.html');
    expect(await walk(page, dialogWalk('#open', '#fake', 2))).toMatch(/^step \d+/);
    expect(await walk(page, tabsWalk(['#tab-a', '#tab-b']))).toMatch(/^step 3 /);
    await page.context().close();
  });
  it('grades "Below floor", and the repair plan puts every floor before every other item', () => {
    expect(grade(findings, KIT_RULES).grade).toBe('Below floor');
    const level = (id: string): string => KIT_RULES.find((rule) => rule.id === id)?.level ?? '';
    const order = repairPlan([findings], KIT_RULES).items.map((item) => level(item.ruleId));
    expect(order.lastIndexOf('floor')).toBeLessThan(order.findIndex((l) => l !== 'floor'));
    expect(order.indexOf('warning')).toBeGreaterThan(order.lastIndexOf('rule'));
  });
});

describe('the kit: cases that the automated review of pull request 6 named', () => {
  const css = '<style>button, input { min-width: 44px; min-height: 44px; } @keyframes turn { to { transform: rotate(360deg); } } .turn { width: 20px; height: 20px; animation: turn 2s linear infinite; }</style>';
  const cases: [string, string, string, string, string][] = [
    ['a native button that the Tab key cannot reach', 'keyboardReachable', 'behavior-keyboard-reach', '<button tabindex="-1">Save</button>', '<div role="tablist"><button role="tab" tabindex="0">One</button><button role="tab" tabindex="-1">Two</button></div>'],
    ['cut-off text beside a line break', 'survivesTextSpacing', 'neuro-text-spacing', '<div style="height: 20px; width: 120px; overflow: hidden">These words need<br>several full lines of room to be read</div>', '<div style="width: 120px">These words need<br>several full lines of room</div>'],
    ['a label that nobody can see', 'visibleLabels', 'neuro-visible-label', '<label for="a" style="visibility: hidden">Name</label><input id="a"><span id="e"></span><input aria-labelledby="e">', '<label for="a">Name</label><input id="a"><span id="e">City</span><input aria-labelledby="e">'],
    ['a button whose only text is hidden from screen readers', 'controlsHaveNames', 'behavior-control-name', '<button><svg aria-hidden="true" width="24" height="24"><title>Close</title></svg></button>', '<button><svg width="24" height="24"><title>Close</title></svg></button>'],
    ['a label that merely holds the word "stop" (F-6)', 'noEndlessMotion', 'neuro-motion-can-stop', '<div class="turn"></div><a href="#" aria-label="Bus stop finder">Map</a>', '<div class="turn"></div><button data-pause-motion>Pause</button>'],
    ['a silent video that starts by itself (F-10)', 'noAutoplay', 'neuro-no-autoplay', '<video autoplay muted controls></video>', '<video muted controls></video>'],
    ['a pause control that nobody can see', 'noEndlessMotion', 'neuro-motion-can-stop', '<div class="turn"></div><button data-pause-motion hidden>Pause</button>', '<div class="turn"></div><button data-pause-motion>Pause</button>'],
  ];
  for (const [name, fn, ruleId, faulty, sound] of cases) {
    it(`${name} fails, and the sound form of the same page holds`, async () => {
      const page = await (await browser.newContext({ viewport: { width: 1280, height: 800 } })).newPage();
      await page.setContent(`<!doctype html><html lang="en"><head><title>t</title>${css}</head><body>${faulty}</body></html>`);
      expect((await run(page, fn)).filter((f) => f.ruleId === ruleId).map((f) => f.status)).toContain('fails');
      await page.setContent(`<!doctype html><html lang="en"><head><title>t</title>${css}</head><body>${sound}</body></html>`);
      expect((await run(page, fn)).filter((f) => f.ruleId === ruleId).map((f) => f.status)).toEqual(['holds']);
      await page.context().close();
    });
  }
  it('a loading mark inside a hidden part is not judged (F-16)', async () => {
    const page = await (await browser.newContext({ viewport: { width: 1280, height: 800 } })).newPage();
    await page.setContent(`<!doctype html><html lang="en"><head><title>t</title>${css}</head><body><div hidden><div class="spinner">Wait</div></div><div style="visibility: hidden"><div class="spinner">Wait</div></div></body></html>`);
    expect((await run(page, 'loadingIsAnnounced')).map((f) => f.status)).toEqual(['not-applicable']);
    await page.context().close();
  });
  it('sound pages that the second automated review named hold: text in a boxless wrapper names its button; a hidden or switched-off control needs no Tab stop', async () => {
    const page = await (await browser.newContext({ viewport: { width: 1280, height: 800 } })).newPage();
    await page.setContent(`<!doctype html><html lang="en"><head><title>t</title>${css}</head><body><button><span style="display: contents">Save</span></button><button><span hidden>Save</span></button></body></html>`);
    expect((await run(page, 'controlsHaveNames')).map((f) => f.status)).toEqual(['fails']);
    await page.setContent(`<!doctype html><html lang="en"><head><title>t</title>${css}</head><body><button><span style="display: contents">Save</span></button></body></html>`);
    expect((await run(page, 'controlsHaveNames')).map((f) => f.status)).toEqual(['holds']);
    await page.setContent(`<!doctype html><html lang="en"><head><title>t</title>${css}</head><body><button tabindex="-1" style="visibility: hidden">A</button><fieldset disabled><button tabindex="-1">B</button></fieldset></body></html>`);
    expect((await run(page, 'keyboardReachable')).map((f) => f.status)).toEqual(['holds']);
    await page.context().close();
  });
  it('a control that holds the keyboard focus when the check starts is judged like any other, and keeps the focus', async () => {
    const page = await (await browser.newContext({ viewport: { width: 1280, height: 800 } })).newPage();
    await page.setContent(`<!doctype html><html lang="en"><head><title>t</title>${css}</head><body><button id="a">One</button><button id="b" style="outline: none">Two</button></body></html>`);
    await page.keyboard.press('Tab');
    const findings = await run(page, 'focusIsVisible');
    expect(findings.filter((f) => f.status === 'fails').map((f) => f.where)).toEqual(['button#b']);
    expect(await page.evaluate(() => document.activeElement?.id)).toBe('a');
    await page.context().close();
  });
});
