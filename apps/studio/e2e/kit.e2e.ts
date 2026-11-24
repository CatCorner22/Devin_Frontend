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
  const findings: Finding[] = [];
  for (const fn of Object.keys(CHECKS)) if (fn !== 'noSidewaysScroll') findings.push(...await run(page, fn));
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
  it('grades "Meets floor" once the walks are counted, and "Crafted" only after a person answers for the three person-only floors (D59)', async () => {
    const page = await open('good.html');
    const findings = [...await runAllWithReflow(page), { ruleId: 'behavior-dialog-keys', status: 'holds' as const }];
    expect(grade(findings, KIT_RULES)).toMatchObject({ grade: 'Meets floor', failedFloors: [], failedRules: [], unmeasuredFloors: [], floorsForAPerson: ['neuro-no-flashing', 'neuro-reduced-motion', 'neuro-error-recovery'] });
    const person = ['neuro-no-flashing', 'neuro-reduced-motion', 'neuro-error-recovery'].map((ruleId) => ({ ruleId, status: 'holds' as const }));
    expect(grade([...findings, ...person], KIT_RULES)).toMatchObject({ grade: 'Crafted', failedFloors: [], unmeasuredFloors: [], floorsForAPerson: [] });
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
  describe('cases that the red-team review of 2026-11-18 confirmed', () => {
    const sr = '.sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; } .skip { position: absolute; left: -9999px; } .skip:focus { left: 8px; top: 8px; padding: 12px; }';
    const pageOf = async (body: string, style = ''): Promise<Page> => {
      const page = await (await browser.newContext({ viewport: { width: 1280, height: 800 } })).newPage();
      await page.setContent(`<!doctype html><html lang="en"><head><title>t</title><style>body { font: 16px/1.5 Arial, sans-serif; margin: 24px; } ${sr} ${style}</style></head><body>${body}</body></html>`);
      return page;
    };
    const statuses = async (body: string, fn: string, style = ''): Promise<string[]> => {
      const page = await pageOf(body, style);
      const out = (await run(page, fn)).map((f) => f.status);
      await page.context().close();
      return out;
    };

    it('F-12: a label hidden for screen readers only is not a visible label; a label in view is', async () => {
      expect(await statuses('<label class="sr" for="e">Email</label><input id="e" placeholder="Email">', 'visibleLabels')).toEqual(['fails']);
      expect(await statuses('<label for="e">Email</label><input id="e" placeholder="Email">', 'visibleLabels')).toEqual(['holds']);
    });

    it('F-13: text hidden on purpose for screen readers, and a skip link, fail neither the spacing floor nor the size floor', async () => {
      const body = '<a class="skip" href="#main">Skip to the main part</a><p id="main">Read <span class="sr">this hidden note for screen readers, which is long enough to be cut</span> on.</p>';
      expect(await statuses(body, 'survivesTextSpacing')).toEqual(['holds']);
      expect(await statuses(body, 'targetSize')).toEqual(['holds']);
      // A skip link that stays too small when it has the focus still fails.
      expect(await statuses('<a class="skip" style="font-size: 8px" href="#m">Skip</a><button style="position: absolute; left: 8px; top: 20px; height: 44px">Go</button>', 'targetSize', '.skip:focus { padding: 0; }')).toEqual(['fails']);
    });

    it('F-14: a small target with 24 pixels of room around its center holds; small targets packed together fail', async () => {
      expect(await statuses('<ul style="list-style: none"><li style="margin: 12px 0"><a href="#a">About</a></li><li style="margin: 12px 0"><a href="#b">Prices</a></li><li style="margin: 12px 0"><a href="#c">Contact</a></li></ul>', 'targetSize')).toEqual(['holds']);
      expect(await statuses('<ul style="list-style: none; line-height: 1"><li><a href="#a">About</a></li><li><a href="#b">Prices</a></li><li><a href="#c">Contact</a></li></ul>', 'targetSize')).toEqual(['fails', 'fails', 'fails']);
    });

    it('F-15: menu items with tabindex -1 inside a menu follow the ARIA guide and hold; the same items outside a menu fail', async () => {
      expect(await statuses('<button>Actions</button><ul role="menu" style="list-style: none"><li role="menuitem" tabindex="-1">Rename</li><li role="menuitem" tabindex="-1">Delete</li></ul>', 'keyboardReachable')).toEqual(['holds']);
      expect(await statuses('<ul style="list-style: none"><li role="menuitem" tabindex="-1">Rename</li></ul>', 'keyboardReachable')).toEqual(['fails']);
    });

    it('F-5: a frame or a web component leaves every measured floor unmeasured, so the grade cannot be a pass', async () => {
      const page = await pageOf('<h1>Shop</h1><x-card></x-card><iframe title="Map" style="max-width: 100%" srcdoc="<video autoplay></video>"></iframe>');
      await page.evaluate(() => {
        const host = document.querySelector('x-card');
        host?.attachShadow({ mode: 'open' }).appendChild(document.createElement('marquee'));
      });
      const found = await run(page, 'unseenParts');
      expect(found.every((f) => f.status === 'could-not-measure')).toBe(true);
      expect(found.map((f) => f.ruleId).sort()).toEqual(KIT_RULES.filter((r) => r.level === 'floor' && r.check.kind === 'page-check').map((r) => r.id).sort());
      const all = [...await runAllWithReflow(page), { ruleId: 'behavior-dialog-keys', status: 'holds' as const }];
      // Other checks answer "holds" for these floors on the part of the page they can see; the floors stay unmeasured all the same.
      const result = grade(all, KIT_RULES);
      expect(result.unmeasuredFloors.sort()).toEqual(found.map((f) => f.ruleId).sort());
      expect(['Crafted', 'Meets floor']).not.toContain(result.grade);
      // With the faults of this bare page's colors and typeface left out, nothing fails, and the grade is "Not graded".
      expect(grade(all.filter((f) => !f.ruleId.startsWith('fit-') || f.status !== 'fails'), KIT_RULES)).toMatchObject({ grade: 'Not graded', failedFloors: [] });
      await page.context().close();
      expect(await statuses('<h1>Shop</h1><p>Plain page.</p>', 'unseenParts')).toEqual([]);
      // A web component that keeps its content in the page hides nothing from the other checks.
      const light = await pageOf('<h1>Shop</h1><x-note><p>Read by every check.</p></x-note>');
      await light.evaluate(() => customElements.define('x-note', class extends HTMLElement {}));
      expect(await run(light, 'unseenParts')).toEqual([]);
      await light.context().close();
    });

    it('F-8: a layer that covers the page with no window mark fails; a marked window and a full-window shell hold', async () => {
      const layer = 'position: fixed; inset: 0; background: rgba(0, 0, 0, 0.5)';
      expect(await statuses(`<h1>Shop</h1><p>Text of the page.</p><div style="${layer}"><div style="background: #fff; margin: 80px; padding: 24px"><h2>Join our list</h2><button>Close</button></div></div>`, 'dialogsAreMarked')).toEqual(['fails']);
      expect(await statuses(`<h1>Shop</h1><p>Text of the page.</p><div style="${layer}"><div role="dialog" aria-modal="true" aria-label="Join our list" style="background: #fff; margin: 80px; padding: 24px"><button>Close</button></div></div>`, 'dialogsAreMarked')).toEqual(['holds']);
      expect(await statuses(`<div style="position: fixed; inset: 0"><h1>App</h1><p>Everything lives in this shell.</p></div>`, 'dialogsAreMarked')).toEqual(['not-applicable']);
      expect(await statuses(`<h1>Shop</h1><p>Text.</p><div style="${layer}; pointer-events: none; z-index: -1"></div>`, 'dialogsAreMarked')).toEqual(['not-applicable']);
    });

    it('F-21, F-22: reading text in a div is judged; a line is counted in letters of the text itself', async () => {
      const text = 'The shop opens at nine each weekday and closes at five, and on Saturday the doors stay open until one in the afternoon for callers. '.repeat(4);
      const comfort = async (body: string): Promise<Record<string, string>> => {
        const page = await pageOf(body);
        const out = Object.fromEntries((await run(page, 'readingComfort')).map((f) => [f.ruleId, f.status]));
        await page.context().close();
        return out;
      };
      expect(await comfort(`<div style="font-size:10px;line-height:1;text-align:justify;max-width:300px">${text}</div>`)).toMatchObject({ 'neuro-line-height': 'fails', 'neuro-text-size': 'fails', 'neuro-no-justified-text': 'fails' });
      // About 110 letters of Arial in a line: wider than 80, though the box is narrower than 80 zeros.
      expect((await comfort(`<p style="width:780px;line-height:1.6">${text}</p>`))['neuro-line-length']).toBe('fails');
      // A list item whose paragraph is 60 letters wide: the paragraph is measured, not the item around it.
      expect((await comfort(`<ul style="width:1100px"><li><p style="max-width:60ch;line-height:1.6">${text}</p></li></ul>`))['neuro-line-length']).toBe('holds');
    });

    it('automated review, round 9: parts that are not shown are not judged; packed links and a tab group with no way in are', async () => {
      // A closed <dialog> without a name is no window that a visitor meets.
      expect(await statuses('<h1>Shop</h1><p>Text.</p><dialog><p>Later.</p></dialog>', 'dialogsAreMarked')).not.toContain('fails');
      // A web component and an endless animation inside a hidden part.
      const hidden = await pageOf('<h1>Shop</h1><div hidden><x-box id="box"></x-box><p class="spin">x</p></div>', '@keyframes turn { to { transform: rotate(360deg); } } .spin { animation: turn 1s linear infinite; }');
      await hidden.evaluate(() => { document.getElementById('box')?.attachShadow({ mode: 'open' }); });
      expect(await run(hidden, 'unseenParts')).toEqual([]);
      expect((await run(hidden, 'noEndlessMotion')).map((f) => f.status)).not.toContain('fails');
      await hidden.context().close();
      // Small links side by side in a nav are targets, not words of a sentence; a link inside a sentence is still exempt.
      expect(await statuses('<nav style="font-size:8px;line-height:1"><a href="#a">Home</a><a href="#b">Shop</a><a href="#c">Help</a></nav>', 'targetSize')).toContain('fails');
      expect(await statuses('<p>Read the <a href="#a">terms</a> before you order.</p>', 'targetSize')).not.toContain('fails');
      // Tabs that all carry tabindex -1: the Tab key finds no way into the group.
      const tabs = (first: string) => `<div role="tablist"><span role="tab" tabindex="${first}" style="display:inline-block;padding:12px">One</span><span role="tab" tabindex="-1" style="display:inline-block;padding:12px">Two</span></div>`;
      expect(await statuses(tabs('-1'), 'keyboardReachable')).toContain('fails');
      expect(await statuses(tabs('0'), 'keyboardReachable')).not.toContain('fails');
    // The same group built from native buttons (automated review of pull request 9).
    const buttons = (first: string) => `<div role="tablist"><button role="tab" tabindex="${first}">One</button><button role="tab" tabindex="-1">Two</button></div>`;
    expect(await statuses(buttons('-1'), 'keyboardReachable')).toContain('fails');
    expect(await statuses(buttons('0'), 'keyboardReachable')).not.toContain('fails');
    // A web component with no box of its own (display: contents) whose shadow content is drawn still hides that content from the checks.
    const boxless = await pageOf('<h1>Shop</h1><x-box id="box" style="display: contents"></x-box>');
    await boxless.evaluate(() => { const root = document.getElementById('box')?.attachShadow({ mode: 'open' }); const button = document.createElement('button'); button.textContent = 'Buy'; root?.append(button); });
    expect((await run(boxless, 'unseenParts')).length).toBeGreaterThan(0);
    await boxless.context().close();
    });

    it('F-24: a button made with input and a button named by a letter that draws nothing have no name', async () => {
      const where = async (html: string): Promise<(string | undefined)[]> => {
        const page = await pageOf(html);
        const out = (await run(page, 'controlsHaveNames')).filter((f) => f.status === 'fails').map((f) => f.where);
        await page.context().close();
        return out;
      };
      const gif = 'data:image/gif;base64,R0lGODlhAQABAAAAACw=';
      expect(await where(`<input type="image" id="pic" src="${gif}" style="width:30px;height:30px"><input type="button" id="bare" style="width:30px;height:30px"><button id="zw">\u200b</button>`)).toEqual(['input#pic', 'input#bare', 'button#zw']);
      expect(await where(`<input type="image" alt="Search" src="${gif}" style="width:30px;height:30px"><input type="button" value="Add"><input type="submit"><input type="reset">`)).toEqual([]);
    });

    it('F-9: a banner that a script turns every two seconds fails; a still page and a page with a pause button hold', async () => {
      const turn = () => { let n = 0; setInterval(() => { const el = document.getElementById('slide'); if (el) el.textContent = `Offer ${++n}`; }, 2000); };
      const page = await pageOf('<h1>Shop</h1><p id="slide">Offer 0</p>');
      await page.evaluate(turn);
      expect((await run(page, 'noScriptedMotion')).map((f) => [f.status, f.where])).toEqual([['fails', 'p#slide']]);
      await page.context().close();
      const paused = await pageOf('<h1>Shop</h1><p id="slide">Offer 0</p><button data-pause-motion>Pause</button>');
      await paused.evaluate(turn);
      expect((await run(paused, 'noScriptedMotion')).map((f) => f.status)).toEqual(['holds']);
      await paused.context().close();
      expect(await statuses('<h1>Shop</h1><p>Still.</p>', 'noScriptedMotion')).toEqual(['holds']);
    }, 60_000);

    it('F-9: a show of slides and a banner without a box are movement; a part that stays hidden is not (each case watches 11 seconds)', async () => {
      // A show of three slides, one at a time, every four seconds: no slide is shown twice in 11 seconds, and it is still movement.
      const slides = await pageOf('<h1>Shop</h1><div id="show"><p class="s">One</p><p class="s" hidden>Two</p><p class="s" hidden>Three</p></div>');
      await slides.evaluate(() => { let i = 0; const all = [...document.querySelectorAll<HTMLElement>('.s')]; setInterval(() => { i = (i + 1) % all.length; all.forEach((el, n) => { el.hidden = n !== i; }); }, 4000); });
      expect((await run(slides, 'noScriptedMotion')).map((f) => f.status)).toEqual(['fails']);
      await slides.context().close();
      // A part that stays hidden and is written to again and again shows nothing, and is not movement.
      const unseen = await pageOf('<h1>Shop</h1><div><p id="count" hidden>0</p></div>');
      await unseen.evaluate(() => { let n = 0; setInterval(() => { const c = document.getElementById('count'); if (c) c.textContent = String(++n); }, 2000); });
      expect((await run(unseen, 'noScriptedMotion')).map((f) => f.status)).toEqual(['holds']);
      await unseen.context().close();
      // A banner with `display: contents` has no box of its own; its words are drawn, and they change every two seconds.
      const boxless = await pageOf('<h1>Shop</h1><div id="banner" style="display:contents">Offer 0</div>');
      await boxless.evaluate(() => { let n = 0; setInterval(() => { const b = document.getElementById('banner'); if (b) b.textContent = `Offer ${++n}`; }, 2000); });
      expect((await run(boxless, 'noScriptedMotion')).map((f) => f.status)).toEqual(['fails']);
      await boxless.context().close();
    }, 60_000);

    it('F-9: a change out of sight, and late content that arrives once, are not movement', async () => {
      // A panel is hidden at four seconds; what it holds changes at two and at six. The second change is out of sight.
      const panel = await pageOf('<h1>Shop</h1><div id="panel"><p id="inner">0</p></div>');
      await panel.evaluate(() => { const set = (t: string) => { const i = document.getElementById('inner'); if (i) i.textContent = t; }; setTimeout(() => set('1'), 2000); setTimeout(() => { const p = document.getElementById('panel'); if (p) p.hidden = true; }, 4000); setTimeout(() => set('2'), 6000); });
      expect((await run(panel, 'noScriptedMotion')).map((f) => f.status)).toEqual(['holds']);
      await panel.context().close();
      // A panel is hidden at two seconds and shown again at four; a part inside it is hidden at six and shown at nine: movement.
      const back = await pageOf('<h1>Shop</h1><div id="panel"><p id="inner">Offer</p></div>');
      await back.evaluate(() => { const hide = (id: string, hidden: boolean, ms: number) => setTimeout(() => { const el = document.getElementById(id); if (el) el.hidden = hidden; }, ms); hide('panel', true, 2000); hide('panel', false, 4000); hide('inner', true, 6000); hide('inner', false, 9000); });
      expect((await run(back, 'noScriptedMotion')).map((f) => f.status)).toEqual(['fails']);
      await back.context().close();
      // Two parts that each fill in once, at one and at six seconds, are late content, not movement.
      const late = await pageOf('<h1>Shop</h1><p id="a">…</p><p id="b">…</p>');
      await late.evaluate(() => { setTimeout(() => { const a = document.getElementById('a'); if (a) a.textContent = 'Prices'; }, 1000); setTimeout(() => { const b = document.getElementById('b'); if (b) b.textContent = 'Reviews'; }, 6000); });
      expect((await run(late, 'noScriptedMotion')).map((f) => f.status)).toEqual(['holds']);
      await late.context().close();
    }, 60_000);

    it('F-11: at 320 pixels, columns cut off by a page that hides its overflow fail; a drawer that waits beside the page holds', async () => {
      const narrow = async (body: string, style: string): Promise<string[]> => {
        const page = await pageOf(body, style);
        await page.setViewportSize({ width: 320, height: 800 });
        const out = (await run(page, 'noSidewaysScroll')).map((f) => f.status);
        await page.context().close();
        return out;
      };
      const table = '<table><tr><td style="min-width: 150px">Name</td><td style="min-width: 150px">Price</td><td style="min-width: 150px">Stock</td><td style="min-width: 150px">Notes</td></tr></table>';
      expect(await narrow(table, 'html, body { overflow-x: hidden; }')).toEqual(['fails']);
      expect(await narrow(table, '')).toEqual(['fails']);
      expect(await narrow('<p>Text.</p><nav style="position: fixed; top: 0; right: 0; width: 240px; transform: translateX(100%)"><a href="#a">About</a></nav>', 'html, body { overflow-x: hidden; }')).toEqual(['holds']);
    });

    it('F-7: an element that shows the hand pointer and has no Tab stop fails, also when a script attached its click', async () => {
      const page = await pageOf('<div id="card" style="cursor: pointer; padding: 12px"><span>Open the report</span></div>');
      await page.evaluate(() => document.getElementById('card')?.addEventListener('click', () => undefined));
      const found = await run(page, 'keyboardReachable');
      expect(found.map((f) => [f.status, f.where])).toEqual([['fails', 'div#card']]);
      await page.context().close();
      // A card that holds a real link, a button, and a label show the same pointer and hold.
      expect(await statuses('<div style="cursor: pointer"><a href="#r">Open the report</a></div><button style="cursor: pointer">Go</button><label style="cursor: pointer">Name <input></label>', 'keyboardReachable')).toEqual(['holds']);
    });
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
