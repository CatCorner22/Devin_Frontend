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
    const findings = await runAll(page);
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
    const findings = [...await runAll(page), { ruleId: 'behavior-dialog-keys', status: 'holds' as const }];
    expect(grade(findings, KIT_RULES)).toMatchObject({ grade: 'Crafted', failedFloors: [], unmeasuredFloors: [] });
    expect(receipt(findings, KIT_RULES).forAPerson.length).toBeGreaterThan(8);
    await page.context().close();
  });
  it('without the walk the grade is "Not graded": a floor that did not run is not a pass', async () => {
    const page = await open('good.html');
    expect(grade(await runAll(page), KIT_RULES)).toMatchObject({ grade: 'Not graded', unmeasuredFloors: ['behavior-dialog-keys'] });
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
