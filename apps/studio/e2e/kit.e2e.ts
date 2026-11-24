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
const TOKENS = { '--ink': '#1a1a1a', '--paper': '#ffffff', '--accent': '#0b5fff', '--line': '#d0d5dd', '--radius': '8px', '--radius-in': '4px', '--font-body': 'serif' };
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
  it('second review, F-33: every rule that a page check measures has an element marked with its id in the drawn page', async () => {
    // A browser keeps only the first of two attributes of one name, so each element names its defects in one attribute, apart by spaces.
    const page = await open('flawed.html');
    const marked = await page.evaluate(() => [...document.querySelectorAll('[data-defect]')].flatMap((el) => (el.getAttribute('data-defect') ?? '').split(/\s+/)));
    await page.context().close();
    // One defect is an absence (a color of the design that no element uses), so no element can carry its mark.
    expect(PAGE_RULES.map((rule) => rule.id).filter((id) => !marked.includes(id))).toEqual(['fit-unused-color']);
  });
  for (const rule of PAGE_RULES) {
    it(`finds the planted defect: ${rule.id}`, () => {
      expect(findings.filter((f) => f.ruleId === rule.id && f.status === 'fails').length, rule.plain).toBeGreaterThan(0);
    });
  }
  it('every failure says where, what was found, what is required, and how to repair it', () => {
    for (const f of findings.filter((x) => x.status === 'fails')) {
      expect(f.where, f.ruleId).toBeTruthy();
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
  it('F-33: the planted line itself is what three checks report, and the tab-order walk has a planted defect', async () => {
    const at = (ruleId: string): (string | undefined)[] => findings.filter((f) => f.ruleId === ruleId && f.status === 'fails').map((f) => f.where);
    expect(at('fit-radii')).toContain('p.off');
    expect(at('fit-unused-color')).toEqual(['--line']);
    // Without the planted wide box, the page no longer scrolls sideways at 320 pixels.
    const narrow = await open('flawed.html', 320);
    expect((await run(narrow, 'noSidewaysScroll')).map((f) => f.status)).toContain('fails');
    await narrow.evaluate(() => document.querySelector('[data-defect="neuro-reflow"]')?.remove());
    expect((await run(narrow, 'noSidewaysScroll')).map((f) => f.status)).not.toContain('fails');
    await narrow.context().close();
    const page = await open('flawed.html');
    expect(await walk(page, tabOrderWalk('#order-a', ['#order-b', '#order-c']))).toMatch(/^step \d+/);
    await page.context().close();
  });
  it('F-32: a color in one border, in a shadow, and in a fade is read; a typeface that is named and not drawn fails; a pill holds', async () => {
    const page = await open('good.html');
    const fit = async (): Promise<string[]> => (await run(page, 'tokenFit')).filter((f) => f.status === 'fails').map((f) => `${f.ruleId}: ${f.measured ?? ''}`);
    expect(await fit()).toEqual([]);
    const add = (style: string) => page.evaluate((css) => { const p = document.createElement('p'); p.id = 'probe'; p.textContent = 'A probe paragraph.'; p.setAttribute('style', css); document.querySelector('main, body')?.append(p); }, style);
    const drop = () => page.evaluate(() => document.getElementById('probe')?.remove());
    await add('border-left: 4px solid #ff69b4');
    expect((await fit()).join('|')).toMatch(/fit-colors: border color/);
    await drop(); await add('box-shadow: 0 0 12px oklch(0.9 0.3 130)');
    expect((await fit()).join('|')).toMatch(/fit-colors: shadow color/);
    await drop(); await add('background-image: linear-gradient(#ff8800, #ffaa00)');
    expect((await fit()).join('|')).toMatch(/fit-colors: background fade color/);
    // A picture's address is no color: the part after # in it is not read as one.
    await drop(); await add('background-image: url("sprite.svg#abc"), linear-gradient(#1a1a1a, #0b5fff)');
    expect(await fit()).toEqual([]);
    await drop(); await add('border-radius: 9999px; padding: 4px 16px');
    expect(await fit()).toEqual([]);
    await drop(); await add('border-radius: 13px');
    expect((await fit()).join('|')).toMatch(/fit-radii/);
    await drop();
    const source = String(CHECKS.tokenFit);
    const missing = await page.evaluate(`(() => { document.body.style.fontFamily = '"No Such Face 4711", serif'; return (${source})(document, ${JSON.stringify({ ...TOKENS, '--font-body': '"No Such Face 4711", serif' })}); })()`) as Finding[];
    expect(missing.filter((f) => f.ruleId === 'fit-fonts' && f.status === 'fails').map((f) => f.measured).join('|')).toMatch(/draws another in its place/);
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

    it('second review, F-27: a page of 20,000 buttons, and a text of 600,000 letters, get an answer and no crash', async () => {
      const started = Date.now();
      expect(await statuses('<button>x</button>'.repeat(20000), 'targetSize')).toEqual(['could-not-measure']);
      // 2,500 small buttons are under the limit, and each one is still found.
      const small = await statuses('<button style="font-size:6px;padding:0;border:0;margin:0">x</button>'.repeat(2500), 'targetSize');
      expect(small).toHaveLength(2500);
      expect(new Set(small)).toEqual(new Set(['fails']));
      const page = await pageOf(`<p style="width: 2ch; overflow-wrap: anywhere">${'ab'.repeat(300000)}</p>`);
      const comfort = await run(page, 'readingComfort');
      await page.context().close();
      expect(comfort.length).toBeGreaterThan(0);
      expect(comfort.some((f) => f.ruleId === 'neuro-line-length' && f.status === 'fails')).toBe(false);
      expect(Date.now() - started).toBeLessThan(40000);
    }, 60000);

    it('second review, F-23: a notice that leaves the page in use needs no aria-modal; a window that blocks the page does', async () => {
      const text = '<h1>Shop</h1><p>Bread, baked here every morning.</p>';
      const bar = 'position:fixed;left:16px;right:16px;bottom:16px;padding:12px;background:#fff;border:1px solid #333';
      expect(await statuses(`${text}<div class="cookies" role="dialog" aria-label="Cookies" style="${bar}">We use one cookie. <button>Fine</button></div>`, 'dialogsAreMarked')).toEqual(['holds']);
      expect(await statuses(`${text}<div role="dialog" aria-labelledby="h" style="position:fixed;right:16px;bottom:16px;width:280px;padding:12px;background:#fff"><h2 id="h">Chat with us</h2><button>Close</button></div>`, 'dialogsAreMarked')).toEqual(['holds']);
      // The name is still asked of the notice.
      expect(await statuses(`${text}<div role="dialog" style="${bar}">We use one cookie.</div>`, 'dialogsAreMarked')).toEqual(['fails']);
      const box = 'position:fixed;top:30%;left:30%;width:40%;padding:16px;background:#fff';
      const blocking = [
        `<div style="position:fixed;inset:0;background:rgba(0,0,0,.5)"><div role="dialog" aria-label="Basket" style="${box}">Your basket</div></div>`,
        `<div style="position:fixed;inset:0;background:rgba(0,0,0,.5)"></div><div role="dialog" aria-label="Basket" style="${box}">Your basket</div>`,
        `<div role="dialog" aria-label="Basket" style="position:fixed;inset:0;background:#fff">Your basket</div>`,
      ];
      for (const layer of blocking) expect(await statuses(`${text}${layer}`, 'dialogsAreMarked'), layer).toEqual(['fails']);
      expect(await statuses(`<main inert>${text}</main><div role="dialog" aria-label="Basket" style="${box}">Your basket</div>`, 'dialogsAreMarked')).toEqual(['fails']);
      expect(await statuses(`${text}${blocking[0]!.replace('role="dialog"', 'role="dialog" aria-modal="true"')}`, 'dialogsAreMarked')).toEqual(['holds']);
    });

    it('second review, F-22: the blue-to-purple fade is found on the root of the page and on a ::before or ::after', async () => {
      const fade = 'linear-gradient(135deg,#667eea,#764ba2)';
      const text = '<h1>Shop</h1><p>Bread, baked here every morning.</p>';
      const where = async (body: string, style: string): Promise<(string | undefined)[]> => { const page = await pageOf(body, style); const out = (await run(page, 'purpleGradient')).map((f) => f.where); await page.context().close(); return out; };
      expect(await where(text, `html{min-height:100%;background:${fade}}`)).toEqual(['html']);
      expect(await where(`<div class="hero">${text}</div>`, `.hero{position:relative;height:400px} .hero::before{content:"";position:absolute;inset:0;background:${fade}}`)).toEqual(['div.hero::before']);
      expect(await where(`<div class="hero">${text}</div>`, `.hero{position:relative;height:400px} .hero::after{content:"";display:block;width:600px;height:300px;background-image:${fade}}`)).toEqual(['div.hero::after']);
      // A fade on a ::before that is not drawn, a small one, and one in the colors of a design all hold.
      expect(await statuses(`<div class="hero">${text}</div>`, 'purpleGradient', `.hero::before{position:absolute;inset:0;background:${fade}}`)).toEqual(['holds']);
      expect(await statuses(`<div class="hero">${text}</div>`, 'purpleGradient', `.hero::before{content:"";display:inline-block;width:40px;height:4px;background:${fade}}`)).toEqual(['holds']);
      expect(await statuses(text, 'purpleGradient', 'html{min-height:100%;background:linear-gradient(#fff7ed,#fed7aa)}')).toEqual(['holds']);
    });

    it('C14-8, C14-9: a color inside the address of a picture, or inside a picture given as data, is no color of the page', async () => {
      const colors = async (style: string): Promise<(string | undefined)[]> => { const page = await pageOf('<div class="hero"><h1>Shop</h1></div>', `body{color:#1a1a1a;background:#ffffff} .hero{height:300px;${style}}`); const out = (await run(page, 'tokenFit')).filter((f) => f.ruleId === 'fit-colors' && f.status === 'fails').map((f) => f.measured); await page.context().close(); return out; };
      const fade = 'linear-gradient(#ffffff,#d0d5dd)';
      const picture = (q: string): string => `data:image/svg+xml,<svg xmlns=${q}http://www.w3.org/2000/svg${q} width=${q}8${q} height=${q}8${q}><rect width=${q}8${q} height=${q}8${q} fill=${q}hotpink${q} style=${q}stroke:rgb(255,0,170)${q}/></svg>`;
      expect(await colors(`background-image:url('${picture('"')}'), ${fade}`)).toEqual([]);
      expect(await colors(`background-image:url("${picture("'")}"), ${fade}`)).toEqual([]);
      expect(await colors(`background-image:url("a\\")#ff00aa.png"), linear-gradient(#ffffff,#ffffff)`)).toEqual([]);
      expect(await colors(`background-image:url(a\\)rgb(255,0,170).png), ${fade}`)).toEqual([]);
      // A color of the fade itself that the design does not name is still found, also behind a picture.
      expect(await colors(`background-image:url('${picture('"')}'), linear-gradient(#ffffff,#ff00aa)`)).toEqual(['background fade color rgb(255, 0, 170)']);
    });

    it('second review, F-19: a color inside a token for a border or a shadow is a color of the design', async () => {
      const page = await pageOf('<div class="card"><p>Bread</p></div>', 'body{color:#1a1a1a;background:#ffffff} .card{border:1px solid #d0d5dd;box-shadow:0 1px 3px rgba(0,0,0,0.12), 0 0 0 1px navy;padding:8px}');
      const fit = async (tokens: Record<string, string>): Promise<string[]> => (await page.evaluate(`(${String(CHECKS.tokenFit)})(document, ${JSON.stringify(tokens)})`) as Finding[]).filter((f) => f.ruleId === 'fit-colors' && f.status === 'fails').map((f) => f.measured ?? '');
      const base = { '--ink': '#1a1a1a', '--paper': '#ffffff' };
      expect(await fit({ ...base, '--border': '1px solid #d0d5dd', '--shadow': '0 1px 3px rgba(0,0,0,0.12), 0 0 0 1px navy' })).toEqual([]);
      // Without the two tokens the same page fails for the three colors, so the check still reads them.
      expect((await fit(base)).sort()).toEqual(['border color rgb(208, 213, 221)', 'shadow color rgb(0, 0, 128)', 'shadow color rgba(0, 0, 0, 0.12)']);
      // The name of a typeface that is also the name of a color adds no color to the design.
      expect(await fit({ ...base, '--font-body': 'Tan, navy, serif', '--border': '1px solid #d0d5dd' })).toEqual(['shadow color rgba(0, 0, 0, 0.12)', 'shadow color rgb(0, 0, 128)']);
      await page.context().close();
    });

    it('second review, F-20: an off-design color on an outline, a text line, a text shadow, a text fill, a ::before, or a shape of a drawing fails; so does one odd corner', async () => {
      const fails = async (body: string, style: string, rule = 'fit-colors'): Promise<(string | undefined)[]> => { const page = await pageOf(body, `body{color:#1a1a1a;background:#ffffff;font-family:serif} ${style}`); const out = (await run(page, 'tokenFit')).filter((f) => f.ruleId === rule && f.status === 'fails').map((f) => f.measured); await page.context().close(); return out; };
      const pink = 'rgb(255, 0, 170)';
      expect(await fails('<p class="a">Bread</p>', '.a{outline:2px solid #ff00aa}')).toEqual([`outline color ${pink}`]);
      expect(await fails('<p class="a">Bread</p>', '.a{text-decoration:underline #ff00aa}')).toEqual([`text line color ${pink}`]);
      expect(await fails('<p class="a">Bread</p>', '.a{text-shadow:0 1px 0 #ff00aa}')).toEqual([`text shadow color ${pink}`]);
      expect(await fails('<p class="a">Bread</p>', '.a{-webkit-text-fill-color:#ff00aa}')).toEqual([`text fill color ${pink}`]);
      expect(await fails('<p class="a">Bread</p>', '.a::before{content:"New";color:#ff00aa}')).toEqual([`::before text color ${pink}`]);
      expect(await fails('<p class="a">Bread</p>', '.a::after{content:"";display:block;height:4px;background:#ff00aa}')).toEqual([`::after background color ${pink}`]);
      expect(await fails('<svg width="24" height="24"><circle cx="12" cy="12" r="10" fill="#ff00aa" stroke="hotpink" stroke-width="2"/></svg>', '')).toEqual([`fill color ${pink}`, 'line color rgb(255, 105, 180)']);
      expect(await fails('<div class="card">Bread</div>', '.card{width:200px;height:80px;border-radius:0 13px 13px 13px}', 'fit-radii')).toEqual(['corner radius 13 px']);
      expect(await fails('<div class="card">Bread</div>', '.card{width:200px;height:80px;border-radius:calc(13px + 0%)}', 'fit-radii')).toEqual(['corner radius 13 px']);
      // The same parts in the colors and the radii of the design hold, and so does the ring that the browser draws on focus.
      const sound = '<p class="a">Bread</p><div class="card">Rolls</div><button id="b">Order</button><svg width="24" height="24"><path d="M2 12h20" fill="none" stroke="#0b5fff" stroke-width="2"/><circle cx="12" cy="12" r="4" fill="#1a1a1a"/></svg><script>document.getElementById("b").focus();</script>';
      const style = '.a{outline:2px solid #0b5fff;text-decoration:underline #0b5fff;text-shadow:0 1px 0 #d0d5dd} .a::before{content:"New";color:#0b5fff} .card{border-radius:0 8px 8px 4px} button{color:#1a1a1a;background:#ffffff;border:1px solid #d0d5dd;border-radius:4px;font-family:serif}';
      expect(await fails(sound, style)).toEqual([]);
      expect(await fails(sound, style, 'fit-radii')).toEqual([]);
    });

    it('second review, F-11: a focus mark in a clear color, or a color that moves by one step, is no visible focus mark', async () => {
      const controls = '<a href="/a">Menu</a> <button>Order</button>';
      const base = 'a{text-decoration:none} a,button{outline:none;color:#000000;background:#ffffff;border:1px solid #333333}';
      const unseen = ['a:focus,button:focus{outline:1px solid transparent}', 'a:focus,button:focus{color:#000001}', 'a:focus,button:focus{box-shadow:0 0 0 3px transparent}', 'a:focus,button:focus{box-shadow:0 0 0 3px rgba(0,0,0,0.02)}', 'a:focus,button:focus{border-color:#333334}', 'a:focus,button:focus{background:#fffffe}', 'a:focus,button:focus{outline:3px solid rgba(0,0,255,0.05)}'];
      for (const style of unseen) expect(await statuses(controls, 'focusIsVisible', `${base} ${style}`), style).toEqual(['fails', 'fails']);
      const seen = ['a:focus-visible,button:focus-visible{outline:2px solid #0b5fff}', 'a:focus,button:focus{box-shadow:0 0 0 3px #0b5fff}', 'a:focus,button:focus{background:#ffe08a}', 'a:focus,button:focus{border-color:#0b5fff}', 'a:focus,button:focus{text-decoration:underline}', 'a:focus,button:focus{color:#0b5fff}'];
      for (const style of seen) expect(await statuses(controls, 'focusIsVisible', `${base} ${style}`), style).toEqual(['holds']);
      // The ring that the browser itself draws still counts.
      expect(await statuses(controls, 'focusIsVisible')).toEqual(['holds']);
    });

    it('second review, F-12: a label in a clear color is no visible label', async () => {
      const wheres = async (body: string): Promise<(string | undefined)[]> => { const page = await pageOf(body); const out = (await run(page, 'visibleLabels')).filter((f) => f.status === 'fails').map((f) => f.where); await page.context().close(); return out; };
      expect(await wheres('<label for="e" style="color:transparent">Email</label><input id="e" type="email">')).toEqual(['input#e']);
      expect(await wheres('<label for="e" style="color:rgba(0,0,0,0)">Email</label><input id="e" type="email"><label for="f">Phone</label><input id="f" type="tel">')).toEqual(['input#e']);
      expect(await wheres('<label for="e" style="-webkit-text-fill-color:transparent">Email</label><input id="e" type="email">')).toEqual(['input#e']);
      expect(await wheres('<label for="e" style="color:rgba(0,0,0,0.6)">Email</label><input id="e" type="email">')).toEqual([]);
    });

    it('second review, F-16: an empty sub-list, an empty list in a menu, and one with its sentence directly before it hold', async () => {
      const style = 'ul{min-height:24px}';
      expect(await statuses('<nav><ul><li><a href="#history">History</a><ul id="history-sublist"></ul></li></ul></nav>', 'emptyStatesExplain', style)).toEqual(['holds']);
      expect(await statuses('<ul><li><a href="#history">History</a><ul id="history-sublist"></ul></li></ul>', 'emptyStatesExplain')).toEqual(['holds']);
      expect(await statuses('<nav><ul id="menu"></ul></nav>', 'emptyStatesExplain')).toEqual(['holds']);
      // An empty list with no height is the usual shape of the fault, and still fails.
      expect(await statuses('<h1>Orders</h1><ul id="orders" style="min-height:0;margin:0;padding:0"></ul>', 'emptyStatesExplain')).toEqual(['fails']);
      expect(await statuses('<p>You have no orders yet. <a href="/shop">Browse the shop</a> to place your first order.</p><ul id="orders"></ul>', 'emptyStatesExplain', style)).toEqual(['holds']);
      // An empty list that takes room, with a heading before it and nothing after it, still fails.
      expect(await statuses('<h2>Your orders</h2><ul id="orders"></ul>', 'emptyStatesExplain', style)).toEqual(['fails']);
      expect(await statuses('<p style="visibility:hidden">You have no orders yet.</p><ul id="orders"></ul>', 'emptyStatesExplain', style)).toEqual(['fails']);
      expect(await statuses('<div role="dialog" aria-label="Basket"><p>A window about something else.</p></div><ul id="orders"></ul>', 'emptyStatesExplain', style)).toEqual(['fails']);
    });

    it('second review, F-17: a heading that holds a logo and no text, and one whose lines are broken by hand, are not blamed', async () => {
      const gif = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
      expect(await statuses(`<h1><a href="/"><img src="${gif}" width="240" height="80" alt="Corner Bakery"></a></h1>`, 'balancedHeadings')).toEqual(['not-applicable']);
      expect(await statuses('<h2>Fresh bread every morning.<br>Baked here since 1998.</h2>', 'balancedHeadings')).toEqual(['not-applicable']);
      // A heading that the browser wraps over two lines still fails, also with a large logo beside its words and with tall padding.
      const long = 'A heading that is long enough to run over two lines in this narrow box';
      expect(await statuses(`<div style="width:300px"><h2>${long}</h2></div>`, 'balancedHeadings')).toEqual(['fails']);
      expect(await statuses(`<div style="width:300px"><h2><img src="${gif}" width="40" height="120" alt=""> ${long}</h2></div>`, 'balancedHeadings')).toEqual(['fails']);
      expect(await statuses(`<div style="width:300px"><h2 style="text-wrap:balance">${long}</h2></div>`, 'balancedHeadings')).toEqual(['holds']);
      expect(await statuses('<h2 style="padding:60px 0">Short</h2>', 'balancedHeadings')).toEqual(['not-applicable']);
    });

    it('second review, F-18: a card picture with a fixed height and a width that comes from the card is not blamed', async () => {
      const gif = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
      const size = async (style: string): Promise<string[]> => { const page = await pageOf(`<div class="card" style="width:320px"><img src="${gif}" alt=""></div>`, style); const out = (await run(page, 'pictures')).filter((f) => f.ruleId === 'craft-picture-size').map((f) => f.status); await page.context().close(); return out; };
      expect(await size('.card img{display:block;width:100%;height:200px;object-fit:cover}')).toEqual(['holds']);
      expect(await size('.card img{display:block;width:50%;height:12rem}')).toEqual(['holds']);
      // A height that is a share, or a width left to the file, keeps no room.
      expect(await size('.card img{display:block;width:100%;height:auto}')).toEqual(['fails']);
      expect(await size('.card img{display:block;height:200px}')).toEqual(['fails']);
      expect(await size('.card img{display:block;width:100%;height:50%}')).toEqual(['fails']);
    });

    it('second review, F-21: text in columns is measured by the line of one column', async () => {
      const text = 'The bakery opens at seven each morning and the first loaves leave the oven a little before that. '.repeat(12);
      const length = async (style: string): Promise<string[]> => { const page = await pageOf(`<div class="story"><p>${text}</p></div>`, style); const out = (await run(page, 'readingComfort')).filter((f) => f.ruleId === 'neuro-line-length').map((f) => f.status); await page.context().close(); return out; };
      const base = 'body{font:16px/1.6 Arial} ';
      expect(await length(base + '.story{width:760px;column-count:2;column-gap:40px}')).toEqual(['holds']);
      expect(await length(base + '.story{width:1000px;column-width:300px}')).toEqual(['holds']);
      expect(await length(base + '.story p{width:760px;columns:2}')).toEqual(['holds']);
      // Columns that are each too wide still fail, and so does the same text in one column.
      expect(await length(base + '.story{width:2400px;column-count:2;column-gap:40px}')).toEqual(['fails']);
      expect(await length(base + '.story{width:1200px}')).toEqual(['fails']);
    });

    it('automated review of 2026-11-24, round 1: a corner radius written as a difference is read as a difference', async () => {
      const radii = async (radius: string): Promise<string[]> => { const page = await pageOf(`<div style="width:100px;height:60px;border-radius:${radius};background:#ffffff">Box</div>`); const out = ((await page.evaluate(`(${String(CHECKS['tokenFit'])})(document, ${JSON.stringify({ ...TOKENS, 'radius-test': '15px' })})`)) as Finding[]).filter((f) => f.ruleId === 'fit-radii').map((f) => f.status); await page.context().close(); return out; };
      expect(await radii('calc(20% - 5px)')).toEqual(['holds']);
      expect(await radii('calc(10% + 5px)')).toEqual(['holds']);
      expect(await radii('calc(20% + 5px)')).toEqual(['fails']);
    });

    it('automated review of 2026-11-24, round 1: a pause button named through aria-labelledby counts', async () => {
      const moving = '<style>@keyframes spin { to { transform: rotate(360deg); } } .spin { width: 40px; height: 40px; background: #333333; animation: spin 2s linear infinite; }</style><div class="spin"></div>';
      const icon = '<svg aria-hidden="true" width="24" height="24"><rect width="24" height="24"/></svg>';
      expect(await statuses(`${moving}<span id="p">Pause the animation</span><button data-pause-motion aria-labelledby="p">${icon}</button>`, 'noEndlessMotion')).toEqual(['holds']);
      expect(await statuses(`${moving}<button data-pause-motion aria-labelledby="missing">${icon}</button>`, 'noEndlessMotion')).toEqual(['fails']);
    });

    it('automated review of 2026-11-24, round 1: a drawing whose animation ends at a stated time is not endless', async () => {
      const svg = (attrs: string): string => `<svg width="40" height="40"><rect width="20" height="20"><animate attributeName="x" from="0" to="20" dur="1s" repeatCount="indefinite" ${attrs}/></rect></svg>`;
      expect(await statuses(svg('end="3s"'), 'noEndlessMotion')).toEqual(['holds']);
      expect(await statuses(svg('begin="1s" end="5s"'), 'noEndlessMotion')).toEqual(['holds']);
      expect(await statuses(svg('end="20s"'), 'noEndlessMotion')).toEqual(['fails']);
      expect(await statuses(svg(''), 'noEndlessMotion')).toEqual(['fails']);
    });

    it('automated review of 2026-11-24, round 1: the label "Address line 1" over a real field is no filler; the same words as a line of text are', async () => {
      expect(await statuses('<form><label for="a">Address line 1</label><input id="a" autocomplete="address-line1"><label for="b">Address line 2</label><input id="b"></form>', 'placeholderCopy')).toEqual(['holds']);
      expect(await statuses('<footer><p>Business Name</p><p>Address line 1</p></footer>', 'placeholderCopy')).toContain('fails');
    });

    it('automated review of 2026-11-24, round 1: a paragraph that only introduces an empty list does not explain it', async () => {
      const style = 'ul{min-height:24px}';
      expect(await statuses('<p>Your recent orders are listed below.</p><ul id="orders"></ul>', 'emptyStatesExplain', style)).toEqual(['fails']);
      expect(await statuses('<p>You haven’t placed an order. Browse the shop to start.</p><ul id="orders"></ul>', 'emptyStatesExplain', style)).toEqual(['holds']);
      expect(await statuses('<p>Nothing here so far. Add your first item.</p><ul id="orders"></ul>', 'emptyStatesExplain', style)).toEqual(['holds']);
    });

    it('automated review of 2026-11-24, round 1: a hidden field that the Tab key still reaches is no spam trap', async () => {
      const trap = (tab: string): string => `<label for="n">Name</label><input id="n"><div aria-hidden="true" style="position:absolute;left:-9999px"><input name="website" ${tab} autocomplete="off"></div>`;
      expect(await statuses(trap('tabindex="-1"'), 'visibleLabels')).toEqual(['holds']);
      expect(await statuses(trap(''), 'visibleLabels')).toEqual(['fails']);
    });

    it('second review, F-7: links in a row behind one word are targets; links among the words of a sentence stay exempt', async () => {
      const links = [1, 2, 3, 4, 5].map((n) => `<a href="/${n}">${n}</a>`);
      expect(await statuses(`<nav aria-label="Pages">Page ${links.join(' ')}</nav>`, 'targetSize')).toEqual(['fails', 'fails', 'fails', 'fails', 'fails']);
      expect(await statuses(`<style>nav a{font-size:8px;line-height:8px}</style><nav aria-label="Pages">Page ${links.join('')}</nav>`, 'targetSize')).toEqual(['fails', 'fails', 'fails', 'fails', 'fails']);
      expect(await statuses('<p>Tags: <a href="/a">a</a> | <a href="/b">b</a></p>', 'targetSize')).toEqual(['fails', 'fails']);
      expect(await statuses('<p>Read the <a href="/t">terms</a> and the <a href="/p">privacy note</a> before you <a href="/o">order</a>.</p>', 'targetSize')).toEqual(['holds']);
    });

    it('second review, C14-1 to C14-3: a mouse-only control in an open window inside an inert part, or under an inert mark on an <svg>, fails', async () => {
      const open = '<script>document.getElementById("d").showModal();</script>';
      const cases = [
        `<main inert><dialog id="d" aria-label="Basket"><button class="del" tabindex="-1">Delete</button><button>Close</button></dialog></main>${open}`,
        `<main inert><dialog id="d" aria-label="Basket"><div class="del" style="cursor:pointer">Delete</div><button>Close</button></dialog></main>${open}<script>document.querySelector(".del").addEventListener("click", () => { document.title = "clicked"; });</script>`,
        `<style>dialog{width:0;height:0;padding:0;border:0} dialog::backdrop{display:none} .panel{position:fixed;top:20px;left:20px}</style><main inert><dialog id="d" aria-label="Basket"><div class="panel"><div class="del" onclick="document.title='clicked'">Delete</div><button>Close</button></div></dialog></main>${open}`,
        `<style>dialog{position:fixed;inset:0;width:100vw;height:100vh;max-width:none;max-height:none;pointer-events:none} .del{pointer-events:auto}</style><main inert><dialog id="d" aria-label="Basket"><div class="del" onclick="document.title='clicked'">Delete</div></dialog></main>${open}`,
        `<svg class="del" inert role="button" width="40" height="40" onclick="document.title='clicked'"><rect width="40" height="40"/></svg>`,
        `<svg inert width="120" height="40"><foreignObject width="120" height="40"><div xmlns="http://www.w3.org/1999/xhtml" class="del" onclick="document.title='clicked'">Delete</div></foreignObject></svg>`,
      ];
      for (const html of cases) {
        const page = await pageOf(html);
        expect((await run(page, 'keyboardReachable')).filter((f) => f.status === 'fails').map((f) => f.where), html).toEqual([expect.stringContaining('.del')]);
        // A real click of the mouse at the middle of the control: the page answers it, so the control is live.
        const at = await page.evaluate(() => { const b = document.querySelector('.del')!.getBoundingClientRect(); return { x: b.left + b.width / 2, y: b.top + b.height / 2 }; });
        await page.mouse.click(at.x, at.y);
        if (html.includes('clicked')) expect(await page.title(), html).toBe('clicked');
        await page.context().close();
      }
      // The mark still silences what it does switch off: a part marked inert with no open window in it.
      expect(await statuses('<main inert><div class="del" onclick="1">Delete</div><button tabindex="-1">Close</button></main>', 'keyboardReachable')).toEqual(['holds']);
      // A window under another open window stays blocked.
      expect(await statuses('<main inert><dialog id="d" aria-label="A"><div class="del" onclick="1">Delete</div></dialog></main><dialog id="e" aria-label="B" style="position:fixed;inset:0;width:100vw;height:100vh;max-width:none;max-height:none"><button>Close</button></dialog><script>document.getElementById("d").showModal();document.getElementById("e").showModal();</script>', 'keyboardReachable')).toEqual(['holds']);
    }, 60000);

    it('second review, F-24: a pause button that says so in its name counts without the mark; a name that merely holds the word does not', async () => {
      const turn = '<style>@keyframes t { to { transform: rotate(360deg); } } .b { display: inline-block; animation: t 1s linear infinite; }</style><p class="b">Round and round</p>';
      for (const control of ['<button type="button">Pause the moving text</button>', '<button>Pause</button>', '<button>Stop animation</button>', '<button aria-label="Pause slideshow"><svg width="16" height="16"></svg></button>', '<span role="button" tabindex="0">Turn off motion</span>']) expect(await statuses(`${turn}${control}`, 'noEndlessMotion'), control).toEqual(['holds']);
      for (const control of ['<button>Bus stop finder</button>', '<button>Stop smoking today</button>', '<button>Stop</button>', '<a href="#">Pause the moving text</a>', '<button style="opacity:0">Pause the moving text</button>', '<button>Play video</button>']) expect(await statuses(`${turn}${control}`, 'noEndlessMotion'), control).toEqual(['fails']);
    }, 60000);

    it('second review, F-10: a pause control that nobody can see or reach does not switch the motion floor off', async () => {
      const turn = '<style>@keyframes t { to { transform: rotate(360deg); } } .b { display: inline-block; animation: t 1s linear infinite; }</style><p class="b">Round and round</p>';
      const hidden = [
        '<button data-pause-motion style="opacity:0;position:absolute;left:-9999px;width:1px;height:1px" tabindex="-1" aria-hidden="true"></button>',
        '<button data-pause-motion style="opacity:0">Pause</button>',
        '<div style="opacity:0"><button data-pause-motion>Pause</button></div>',
        '<button data-pause-motion style="position:absolute;left:-9999px">Pause</button>',
        '<button data-pause-motion style="width:1px;height:1px;padding:0;border:0;overflow:hidden">Pause</button>',
        '<button data-pause-motion tabindex="-1">Pause</button>',
        '<button data-pause-motion></button>',
        '<button data-pause-motion disabled>Pause</button>',
        '<div aria-hidden="true"><button data-pause-motion>Pause</button></div>',
        '<span role="button" data-pause-motion>Pause</span>',
      ];
      for (const control of hidden) expect(await statuses(`${turn}${control}`, 'noEndlessMotion'), control).toEqual(['fails']);
      for (const control of ['<button data-pause-motion>Pause</button>', '<button data-pause-motion aria-label="Pause the movement"><svg width="16" height="16"></svg></button>', '<span role="button" tabindex="0" data-pause-motion>Pause</span>']) expect(await statuses(`${turn}${control}`, 'noEndlessMotion'), control).toEqual(['holds']);
      // The check of movement that a script drives reads the control in the same way.
      const page = await pageOf('<p id="s">Offer 0</p><button data-pause-motion style="opacity:0">Pause</button><script>let n = 0; setInterval(() => { document.getElementById("s").textContent = "Offer " + (++n); }, 700);</script>');
      expect((await run(page, 'noScriptedMotion')).map((f) => f.status)).toEqual(['fails']);
      await page.context().close();
    }, 60000);

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
    // Tabs that are all switched off answer no click and need no Tab stop (second automated review of pull request 9).
    expect(await statuses('<div role="tablist"><button role="tab" tabindex="-1" disabled>One</button><button role="tab" tabindex="-1" disabled>Two</button></div>', 'keyboardReachable')).not.toContain('fails');
    expect(await statuses('<div role="tablist" inert><button role="tab" tabindex="-1">One</button><button role="tab" tabindex="-1">Two</button></div>', 'keyboardReachable')).not.toContain('fails');
    expect(await statuses('<div inert><dialog id="d"><div role="tablist"><button role="tab" tabindex="-1">One</button><button role="tab" tabindex="-1">Two</button></div><button>Close</button></dialog></div><script>document.getElementById("d").showModal()</script>', 'keyboardReachable')).toContain('fails');
    expect(await statuses('<div inert><dialog id="d"><div role="tablist"><button role="tab" tabindex="-1">One</button><button role="tab" tabindex="-1">Two</button></div></dialog></div><dialog id="top"><button>Close</button></dialog><script>document.getElementById("d").showModal(); document.getElementById("top").showModal()</script>', 'keyboardReachable')).not.toContain('fails');
    // The mark aria-disabled switches no click off: tabs that carry it and have no way in still fail.
    expect(await statuses('<div role="tablist"><button role="tab" tabindex="-1" aria-disabled="true">One</button><button role="tab" tabindex="-1" aria-disabled="true">Two</button></div>', 'keyboardReachable')).toContain('fails');
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

    it('second review F-5: a spam-trap field that no person meets is not blamed; a field that people can see or reach still is', async () => {
      const form = (trap: string): string => `<form><label for="mail">Email</label><input id="mail" type="email">${trap}<button>Send</button></form>`;
      const both = async (body: string, style = ''): Promise<string[][]> => {
        const page = await pageOf(body, `button, input { min-height: 44px; min-width: 44px; } ${style}`);
        const out = [(await run(page, 'visibleLabels')).map((f) => f.status), (await run(page, 'keyboardReachable')).map((f) => f.status)];
        await page.context().close();
        return out;
      };
      const field = '<input type="text" name="website" tabindex="-1" autocomplete="off">';
      expect(await both(form(`<div class="hp" aria-hidden="true">${field}</div>`), '.hp { position: absolute; left: -9999px; }')).toEqual([['holds'], ['holds']]);
      expect(await both(form(`<div aria-hidden="true" style="position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0)">${field}</div>`))).toEqual([['holds'], ['holds']]);
      expect(await both(form(`<div aria-hidden="true" style="opacity: 0; position: absolute">${field}</div>`))).toEqual([['holds'], ['holds']]);
      // One sign alone is not enough. Off the page without the mark: a screen reader still meets the field.
      expect(await both(form(`<div class="hp">${field}</div>`), '.hp { position: absolute; left: -9999px; }')).toEqual([['fails'], ['fails']]);
      // The mark without the move: a person sees a field with no label and cannot reach it by keyboard.
      expect(await both(form(`<div aria-hidden="true">${field}</div>`))).toEqual([['fails'], ['fails']]);
    });

    it('second review F-6: a box that hides an ornament over its edge is not blamed for cut-off text; a box that cuts words still is', async () => {
      const spacing = async (body: string, style = ''): Promise<[string, string | undefined][]> => {
        const page = await pageOf(body, style);
        const out = (await run(page, 'survivesTextSpacing')).map((f): [string, string | undefined] => [f.status, f.where]);
        await page.context().close();
        return out;
      };
      const hero = '.hero { position: relative; overflow: hidden; padding: 24px; } .dot { position: absolute; right: -80px; top: -40px; width: 240px; height: 240px; border-radius: 50%; background: #dde; }';
      expect(await spacing('<section class="hero"><div class="dot"></div><h1>Fresh bread every morning</h1><p>Baked on the spot since 1987.</p></section>', hero)).toEqual([['holds', undefined]]);
      // An ornament below the fold of the box, and a picture that is cropped on purpose.
      expect(await spacing('<section class="hero" style="height: 200px"><h1>Fresh bread</h1><div class="dot" style="top: 120px"></div></section>', hero)).toEqual([['holds', undefined]]);
      expect(await spacing('<figure style="overflow: hidden; width: 200px; height: 100px; margin: 0"><img alt="" width="400" height="300" src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="></figure><p>Our shop.</p>')).toEqual([['holds', undefined]]);
      // Words that are cut still fail: at the bottom, at the side, and in the same box as an ornament.
      expect(await spacing('<div id="card" style="height: 20px; width: 120px; overflow: hidden">These words need several full lines of room to be read</div>')).toEqual([['fails', 'div#card']]);
      expect(await spacing('<div id="row" style="width: 120px; overflow: hidden; white-space: nowrap">These words need more room than one short line has</div>')).toEqual([['fails', 'div#row']]);
      expect(await spacing('<section class="hero" style="height: 40px; padding: 0"><div class="dot"></div><p>Baked on the spot since 1987, and sold in three shops in the old town every day.</p><p>Second paragraph.</p></section>', hero)).toEqual([['fails', 'section.hero']]);
    });

    it('second review F-8: style text inside a drawing and blank letters are no name for a control; a title or text in the drawing is', async () => {
      const names = async (body: string): Promise<[string, string | undefined][]> => {
        const page = await pageOf(body, 'button, a { min-width: 44px; min-height: 44px; display: inline-block; }');
        const out = (await run(page, 'controlsHaveNames')).map((f): [string, string | undefined] => [f.status, f.where]);
        await page.context().close();
        return out;
      };
      const path = '<path class="a" d="M4 4L20 20M20 4L4 20"/>';
      expect(await names(`<button id="x"><svg width="24" height="24"><style>.a{fill:#1a1a1a}</style>${path}</svg></button>`)).toEqual([['fails', 'button#x']]);
      expect(await names(`<button id="x"><svg width="24" height="24"><defs><symbol id="s"><title>Close</title></symbol><text>Close</text></defs><script>var a = 1;</script>${path}</svg></button>`)).toEqual([['fails', 'button#x']]);
      for (const blank of ['\u2800', '\u3164', '\u115f', '\u1160', '\uffa0', '\u2800 \u3164']) expect(await names(`<button id="x">${blank}</button>`)).toEqual([['fails', 'button#x']]);
      expect(await names(`<a id="x" href="#a" aria-label="\u3164"></a>`)).toEqual([['fails', 'a#x']]);
      // A drawing that names itself, and a drawing with a style sheet beside a real name, hold.
      expect(await names(`<button><svg width="24" height="24"><title>Close</title><style>.a{fill:#1a1a1a}</style>${path}</svg></button>`)).toEqual([['holds', undefined]]);
      expect(await names(`<button><svg width="24" height="24"><text x="0" y="16">OK</text></svg></button>`)).toEqual([['holds', undefined]]);
      expect(await names(`<button><svg width="24" height="24" aria-hidden="true"><style>.a{fill:#1a1a1a}</style>${path}</svg> Close</button>`)).toEqual([['holds', undefined]]);
    });

    it('second review F-4: endless movement drawn by ::before or ::after, or written into an SVG drawing, fails; short movement holds', async () => {
      const spin = '@keyframes spin { to { transform: rotate(360deg); } }';
      const motion = async (body: string, style = ''): Promise<[string, string | undefined][]> => {
        const page = await pageOf(`<h1>Shop</h1>${body}`, style);
        const out = (await run(page, 'noEndlessMotion')).map((f): [string, string | undefined] => [f.status, f.where]);
        await page.context().close();
        return out;
      };
      const loader = '<div class="loader">Loading</div>';
      expect(await motion(loader, `${spin} .loader::after { content: ""; display: inline-block; width: 16px; height: 16px; border: 2px solid; animation: spin 1s linear infinite; }`)).toEqual([['fails', 'div.loader::after']]);
      expect(await motion(loader, `${spin} .loader::before { content: "*"; display: inline-block; animation: spin 2s linear 4; }`)).toEqual([['fails', 'div.loader::before']]);
      const svg = (inner: string): string => `<svg id="art" width="40" height="40" viewBox="0 0 40 40"><circle cx="20" cy="20" r="10">${inner}</circle></svg>`;
      expect(await motion(svg('<animate attributeName="r" values="10;14;10" dur="1s" repeatCount="indefinite"/>'))).toEqual([['fails', 'svg#art animate']]);
      expect(await motion(svg('<animateTransform attributeName="transform" type="rotate" from="0 20 20" to="360 20 20" dur="2s" repeatDur="indefinite"/>'))).toEqual([['fails', 'svg#art animateTransform']]);
      expect(await motion(svg('<animate attributeName="r" values="10;14;10" dur="2s" repeatCount="3"/>'))).toEqual([['fails', 'svg#art animate']]);
      // Sound pages: movement that ends within five seconds, a pseudo-element that is not drawn, a hidden drawing, and a pause control.
      expect(await motion(loader, `${spin} .loader::after { content: ""; display: inline-block; animation: spin 1s linear 3; }`)).toEqual([['holds', undefined]]);
      expect(await motion(loader, `${spin} .loader::after { animation: spin 1s linear infinite; }`)).toEqual([['holds', undefined]]);
      expect(await motion(svg('<animate attributeName="r" values="10;14;10" dur="1s" repeatCount="2"/>'))).toEqual([['holds', undefined]]);
      expect(await motion(svg('<animate attributeName="r" values="10;14;10" dur="1s" repeatCount="indefinite" repeatDur="4s"/>'))).toEqual([['holds', undefined]]);
      expect(await motion(`<div hidden>${svg('<animate attributeName="r" values="10;14;10" dur="1s" repeatCount="indefinite"/>')}</div>`)).toEqual([['holds', undefined]]);
      expect(await motion(`${svg('<animate attributeName="r" values="10;14;10" dur="1s" repeatCount="indefinite"/>')}<button data-pause-motion>Pause</button>`)).toEqual([['holds', undefined]]);
    }, 60_000);

    it('second review F-3: a carousel that a script scrolls, and one that a script animates, fail', async () => {
      const track = '<h1>Shop</h1><div id="track" style="width: 300px; overflow: hidden; white-space: nowrap"><span style="display: inline-block; width: 600px">One</span><span style="display: inline-block; width: 600px">Two</span><span style="display: inline-block; width: 600px">Three</span></div>';
      const scrolls = await pageOf(track);
      await scrolls.evaluate(() => { let i = 0; setInterval(() => { const el = document.getElementById('track'); if (el) el.scrollLeft = (++i % 3) * 600; }, 3000); });
      expect((await run(scrolls, 'noScriptedMotion')).map((f) => [f.status, f.where])).toEqual([['fails', 'div#track']]);
      await scrolls.context().close();
      const animates = await pageOf('<h1>Shop</h1><div style="overflow: hidden; width: 300px"><div id="belt" style="width: 900px">One Two Three</div></div>');
      await animates.evaluate(() => { document.getElementById('belt')?.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-600px)' }], { duration: 4000, iterations: Infinity }); });
      expect((await run(animates, 'noScriptedMotion')).map((f) => [f.status, f.where])).toEqual([['fails', 'div#belt']]);
      await animates.context().close();
      // Again and again, each time for less than a second: still a show.
      const again = await pageOf('<h1>Shop</h1><p id="pulse">New</p>');
      await again.evaluate(() => { setInterval(() => { document.getElementById('pulse')?.animate([{ opacity: 1 }, { opacity: 0.2 }, { opacity: 1 }], { duration: 600 }); }, 2000); });
      expect((await run(again, 'noScriptedMotion')).map((f) => f.status)).toEqual(['fails']);
      await again.context().close();
    }, 60_000);

    it('second review F-3: one scroll to a place and one short animation hold, and so does a scrolling carousel with a pause control', async () => {
      const track = '<h1>Shop</h1><div id="track" style="width: 300px; overflow: hidden; white-space: nowrap"><span style="display: inline-block; width: 600px">One</span><span style="display: inline-block; width: 600px">Two</span><span style="display: inline-block; width: 600px">Three</span></div>';
      const once = await pageOf(track);
      await once.evaluate(() => { setTimeout(() => { const el = document.getElementById('track'); if (el) el.scrollLeft = 600; }, 6000); });
      expect((await run(once, 'noScriptedMotion')).map((f) => f.status)).toEqual(['holds']);
      await once.context().close();
      const fade = await pageOf('<h1>Shop</h1><p id="in">Welcome</p>');
      await fade.evaluate(() => { setTimeout(() => { document.getElementById('in')?.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 3000 }); }, 4000); });
      expect((await run(fade, 'noScriptedMotion')).map((f) => f.status)).toEqual(['holds']);
      await fade.context().close();
      // With a pause control in view the floor holds, as for every other movement.
      const paused = await pageOf(`${track}<button data-pause-motion>Pause</button>`);
      await paused.evaluate(() => { let i = 0; setInterval(() => { const el = document.getElementById('track'); if (el) el.scrollLeft = (++i % 3) * 600; }, 3000); });
      expect((await run(paused, 'noScriptedMotion')).map((f) => f.status)).toEqual(['holds']);
      await paused.context().close();
    }, 60_000);

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

    it('second review F-2: at 320 pixels, columns cut off by a wrapper that hides its overflow fail; an ellipsis and a scrolling box hold', async () => {
      const narrow = async (body: string, style = ''): Promise<string[]> => {
        const page = await pageOf(body, style);
        await page.setViewportSize({ width: 320, height: 800 });
        const out = (await run(page, 'noSidewaysScroll')).map((f) => f.status);
        await page.context().close();
        return out;
      };
      const table = '<table><tr><td style="min-width: 150px">Name</td><td style="min-width: 150px">Price</td><td style="min-width: 150px">Stock</td><td style="min-width: 150px">Notes</td></tr></table>';
      expect(await narrow(`<div style="overflow: hidden">${table}</div>`)).toEqual(['fails']);
      expect(await narrow(`<div class="page-wrapper"><main>${table}</main></div>`, '.page-wrapper { overflow-x: hidden; }')).toEqual(['fails']);
      expect(await narrow(`<div style="overflow-x: clip"><p style="width: 600px">A line of text that is set wider than the window and cannot be reached.</p></div>`)).toEqual(['fails']);
      // The same table in a box that scrolls sideways can be reached, and a title cut with an ellipsis is cut on purpose.
      expect(await narrow(`<div style="overflow-x: auto">${table}</div>`)).toEqual(['holds']);
      expect(await narrow('<p style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap"><span>A long title that the page shortens with three dots at the end of the line on purpose</span></p>')).toEqual(['holds']);
      expect(await narrow('<div style="overflow: hidden"><p>Text that wraps inside the window.</p></div>')).toEqual(['holds']);
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
    it('F-23: text sizes one pixel apart fail; a scale with clear steps holds', async () => {
      const sizes = (list: number[]) => list.map((n) => `<p style="font-size: ${n}px">Text at ${n} pixels for the test.</p>`).join('');
      expect(await statuses(sizes([14, 15, 16, 17]), 'oneTypeScale')).toContain('fails');
      expect(await statuses(sizes([14, 16, 20, 28, 40]), 'oneTypeScale')).not.toContain('fails');
    });
    it('F-25: a hidden empty list is not judged; a sentence shown after an empty list explains it; an empty list alone fails', async () => {
      expect(await statuses('<ul id="menu" style="display: none"></ul><p>Text.</p>', 'emptyStatesExplain')).not.toContain('fails');
      expect(await statuses('<ul id="orders" style="min-height: 20px"></ul><p>You have no orders yet. Place your first order from the shop.</p>', 'emptyStatesExplain')).not.toContain('fails');
      expect(await statuses('<div><ul id="orders" style="min-height: 20px"></ul></div><p>Other text of the page that stands elsewhere.</p>', 'emptyStatesExplain')).toContain('fails');
      // A heading after the list opens the next part, and a sentence that is not drawn explains nothing (second automated review of pull request 9).
      expect(await statuses('<ul id="orders" style="min-height: 20px"></ul><h2>Our opening hours</h2>', 'emptyStatesExplain')).toContain('fails');
      expect(await statuses('<ul id="orders" style="min-height: 20px"></ul><p style="visibility: hidden">You have no orders yet. Place one.</p>', 'emptyStatesExplain')).toContain('fails');
    });
    it('F-26: five checks no longer blame a sound page, and still find the fault', async () => {
      // A heading of one line with padding is one line.
      expect(await statuses('<h1 style="padding: 40px 0; font-size: 32px; line-height: 1.2">Short</h1>', 'balancedHeadings')).not.toContain('fails');
      // A picture that the style sheet sizes keeps its room.
      const png = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
      expect(await statuses(`<img alt="A chair" src="${png}" style="width: 100px; height: 100px">`, 'pictures')).not.toContain('fails');
      expect((await (async () => { const page = await pageOf(`<img alt="A chair" src="${png}">`); const out = await run(page, 'pictures'); await page.context().close(); return out; })()).filter((f) => f.ruleId === 'craft-picture-size').map((f) => f.status)).toContain('fails');
      // A round portrait in a card is no fault of the radii.
      expect(await statuses(`<div style="border-radius: 12px; padding: 16px; border: 1px solid #999"><img alt="Dana" src="${png}" style="width: 48px; height: 48px; border-radius: 50%"></div>`, 'nestedRadii')).not.toContain('fails');
      // Digits of a font whose digits are of one width need no setting; digits of unequal width fail.
      const cell = (font: string) => `<table><tr><td style="font-family: ${font}">1,111.00</td></tr><tr><td style="font-family: ${font}">8,888.00</td></tr></table>`;
      expect(await statuses(cell('monospace'), 'tabularNumerals')).not.toContain('fails');
      // Spaces in the source that the browser draws as one are no fault; a straight quotation mark is.
      expect(await statuses('<p>One sentence.\n      The next  sentence of the paragraph.</p>', 'typographicMarks')).not.toContain('fails');
      expect(await statuses('<p>She said "now" and left.</p>', 'typographicMarks')).toContain('fails');
    });
    it('F-27: a stock phrase counts as whole words; a field label and a sentence of ordinary words hold', async () => {
      expect(await statuses('<p>Our dogs run unleashed, and we keep the books of your company in order.</p><label>Company name <input></label>', 'placeholderCopy')).not.toContain('fails');
      expect(await statuses('<h1>Unleash your team</h1>', 'placeholderCopy')).toContain('fails');
      expect(await statuses('<h2>Your Company</h2>', 'placeholderCopy')).toContain('fails');
    });
    it('second review, F-13 to F-15, C14-4, C14-5: real names and words hold; filler split by a line break or a tag, and template forms, fail', async () => {
      for (const sound of ['<h2>Todo para tu desayuno</h2>', '<h2>Todo</h2>', '<h1>Acme Plumbing &amp; Heating</h1>', '<address>Corner Bakery<br>123 Main Street<br>Leeds LS1 4AB</address>', '<table><tr><td>123 Main Street</td></tr></table>', '<h1>Anytown Music School</h1>', '<p>Our business name is painted on every van.</p>']) expect(await statuses(sound, 'placeholderCopy'), sound).toEqual(['holds']);
      for (const filler of ['<p>Lorem\nipsum</p>', '<p>Lorem <b>ipsum</b></p>', '<p>Lorem&nbsp;ipsum</p>', '<h1>Headline goes here</h1>', '<p>Sample text</p>', '<h2>Business Name</h2>', '<h3>Service One</h3>', '<p>123 Main Street, Anytown, USA</p>', '<p>TODO: write this part</p>', '<h1>Acme</h1>']) expect(await statuses(filler, 'placeholderCopy'), filler).toEqual(['fails']);
      // One block gives one finding, and a block inside a block is read once.
      expect(await statuses('<div>Intro <div><p>Lorem <i>ipsum</i> dolor</p></div></div>', 'placeholderCopy')).toEqual(['fails']);
    });
    it('F-28: the marks of a trademark and of copyright are no emoji; an emoji before a heading is found in any element', async () => {
      expect(await statuses('<h2>Harbor™ pipes</h2><p>© 2026 Harbor Street Plumbing®</p>', 'emojiAsIcons')).not.toContain('fails');
      // The three cases of the first review, each where the check looks: at the edge of a heading or of a link. Without
      // the repair each one fails (finding F-32 of the review of 2026-11-24).
      expect(await statuses('<h2>BrightSmile™</h2>', 'emojiAsIcons')).not.toContain('fails');
      expect(await statuses('<p><a href="/terms">Sold under licence ®</a></p>', 'emojiAsIcons')).not.toContain('fails');
      expect(await statuses('<h3>© Crown copyright</h3>', 'emojiAsIcons')).not.toContain('fails');
      expect(await statuses('<section><div>🚀</div><h3>Fast</h3></section><section><div>🔒</div><h3>Safe</h3></section><section><div>💡</div><h3>Smart</h3></section>', 'emojiAsIcons')).toContain('fails');
    });
    it('F-29: a purple fade written in oklch or hsl is found; a fade of greys is not', async () => {
      const fade = (a: string, b: string) => `<div style="height: 200px; background: linear-gradient(90deg, ${a}, ${b})">Hello</div>`;
      expect(await statuses(fade('oklch(0.5 0.2 255)', 'oklch(0.5 0.25 300)'), 'purpleGradient')).toContain('fails');
      expect(await statuses(fade('hsl(225 80% 55%)', 'hsl(280 80% 60%)'), 'purpleGradient')).toContain('fails');
      expect(await statuses(fade('#2563eb', '#7c3aed'), 'purpleGradient')).toContain('fails');
      expect(await statuses(fade('oklch(0.9 0 0)', 'oklch(0.6 0 0)'), 'purpleGradient')).not.toContain('fails');
    });
    it('F-38: a page with a very long text does not hold the checks for long', async () => {
      const page = await pageOf('<table><tr><td id="big"></td></tr></table><p id="long"></p>');
      await page.evaluate(() => { document.getElementById('big')!.textContent = '1'.repeat(2_000_000); document.getElementById('long')!.textContent = 'word  "x" '.repeat(300_000); });
      const started = Date.now();
      for (const fn of ['tabularNumerals', 'typographicMarks', 'placeholderCopy', 'emojiAsIcons']) await run(page, fn);
      expect(Date.now() - started).toBeLessThan(10_000);
      await page.context().close();
    });
    it('second review, F-32: each check that reads a text reads its first 2,000 letters and no more', async () => {
      // The limit is told by what lies past it: a fault after letter 2,000 of one run of text is not read. A test by the
      // clock alone passed with the limit removed.
      const filler = 'word '.repeat(500);
      expect(await statuses(`<p>${filler}He said "no" to that.</p>`, 'typographicMarks')).not.toContain('fails');
      expect(await statuses('<p>He said "no" to that.</p>', 'typographicMarks')).toContain('fails');
      expect(await statuses(`<p>${filler}Lorem ipsum dolor sit amet.</p>`, 'placeholderCopy')).not.toContain('fails');
      expect(await statuses('<p>Lorem ipsum dolor sit amet.</p>', 'placeholderCopy')).toContain('fails');
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
