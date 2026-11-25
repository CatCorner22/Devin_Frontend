import { applyDirection, closerOptions, createProject, deriveTokens, effectiveParams, findStep, keep, nextSliderValue, ownedValues, pick, pickValues, setReason, tune, type GeneratedOption, type Project } from '@refraction/core';
import { chromium, type Browser, type Page } from 'playwright';
import { afterAll, beforeAll, expect, it } from 'vitest';
import { appliedCardId, cardSelection, selectionCardId, selectionProject, standardSelection, type StepSelection } from '../src/selection.js';

const pageUrl = new URL('../dist/artifact/local-test.html', import.meta.url).href;
const key = 'refraction.project.v2';
const step = findStep('color-strategy')!;
const stored = (page: Page): Promise<Project | undefined> => page.evaluate((key) => (JSON.parse(localStorage.getItem(key) ?? 'null') as { project: Project } | null)?.project, key);
let browser: Browser;
beforeAll(async () => { browser = await chromium.launch(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {}); });
afterAll(async () => { await browser?.close(); });

it('Step selection: empty variation decks and unknown cards retain a safe, matching preview and choice', () => {
  const project = applyDirection(createProject(), 'sticker-pop');
  const named = { kind: 'named', optionId: step.options[0]!.id } as const;
  const empty: StepSelection = { kind: 'variation', optionId: 'as-it-was', origin: named, originValues: {}, options: [], round: 0 };
  expect(standardSelection(empty)).toEqual(named);
  expect(selectionCardId(project, step, empty)).toBe('as-it-was');
  expect(selectionProject(project, step, empty).params).toEqual(pick(project, step.id, named.optionId).params);
  expect(cardSelection(step, named, 'not-an-option')).toEqual({ kind: 'none' });
  const invalid = { kind: 'named', optionId: 'not-an-option' } as const;
  expect(selectionCardId(project, step, invalid)).toBe(appliedCardId(project, step));
  expect(selectionProject(project, step, invalid).params).toEqual(keep(project, step.id).params);
});

it.each([{ seed: 7, skin: undefined }, { seed: 19, skin: 'lagoon' }, { seed: 31, skin: undefined }, { seed: 43, skin: 'lagoon' }])('Step selection: random UI actions save the selection shown before Pick (seed $seed/$skin)', async ({ seed, skin }) => {
  let random = seed;
  const next = (length: number): number => {
    random = (Math.imul(random, 1664525) + 1013904223) >>> 0;
    return random % length;
  };
  let project = setReason(pick(applyDirection(createProject(), 'sticker-pop', skin), step.id, step.options.find((option) => option.derive)!.id), step.id, 'The two colors belong together.');
  type Choice = (project: Project) => Project;
  type Variation = { origin: Choice; back: Choice; values: ReturnType<typeof ownedValues>; options: GeneratedOption[]; round: number };
  const keepChoice: Choice = (project) => keep(project, step.id);
  let choice: Choice = keepChoice;
  let variation: Variation | null = null;
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  const faults: string[] = [];
  page.on('pageerror', (error) => faults.push(String(error)));
  await page.addInitScript(({ key, project }) => {
    if (window.top === window) localStorage.setItem(key, JSON.stringify({ savedAt: '2026-11-25T12:00:00.000Z', project }));
  }, { key, project });
  const enter = async (): Promise<void> => {
    await page.locator(`a[href="#${step.id}"]`).first().press('Enter');
    await page.waitForFunction((title) => document.querySelector('#step-title')?.textContent === title, step.title);
  };
  const back = async (): Promise<void> => {
    if (!variation) return;
    await page.getByRole('button', { name: 'Back to the standard Options', exact: true }).press('Enter');
    choice = variation.back;
    variation = null;
  };
  const decision = (project: Project | undefined) => {
    const value = project?.decisions[step.id];
    return value ? { kind: value.kind, optionId: value.optionId ?? null, values: value.values ?? null, rejected: value.rejected, reason: value.reason ?? null } : null;
  };
  const commit = async (label: string): Promise<void> => {
    const expected = choice(project);
    const css = deriveTokens(effectiveParams(expected), expected.a11y).css;
    const authored = () => page.frameLocator('.large-preview iframe').locator('body').evaluate((_body, keys) => {
      const root = [...document.styleSheets].flatMap((sheet) => [...sheet.cssRules]).find((rule): rule is CSSStyleRule => rule instanceof CSSStyleRule && rule.selectorText === ':root');
      return Object.fromEntries(keys.map((key) => [key, root?.style.getPropertyValue(key).trim()]));
    }, Object.keys(css));
    const read = () => page.frameLocator('.large-preview iframe').locator('body').evaluate((body, keys) => {
      const style = getComputedStyle(body);
      return Object.fromEntries(keys.map((key) => [key, style.getPropertyValue(key).trim()]));
    }, Object.keys(css));
    await expect.poll(authored, { message: label }).toEqual(css);
    const before = await read();
    await page.locator('.actions.sticky .primary').press('Enter');
    await expect.poll(async () => {
      const actual = await stored(page);
      return { params: actual?.params, profile: actual?.a11y, decision: decision(actual) };
    }, { message: label }).toEqual({ params: expected.params, profile: expected.a11y, decision: decision(expected) });
    project = (await stored(page))!;
    choice = keepChoice;
    variation = null;
    await enter();
    await expect.poll(read, { message: `${label}: committed preview` }).toEqual(before);
  };
  const actions = ['select', 'variation', 'variant', 'finer', 'back', 'slider', 'contrast', 'pick'] as const;
  const prefix = ['select', 'contrast', 'variation', 'pick', 'select', 'variation', 'variant', 'contrast', 'pick', 'slider', 'variation', 'finer', 'variant', 'back', 'pick'] as const;
  const seen = new Set<string>();
  try {
    await page.goto(`${pageUrl}#${step.id}`);
    await page.locator('.cards').waitFor();
    for (let index = 0; index < 63; index++) {
      const action = index < prefix.length ? prefix[index]! : actions[next(actions.length)]!;
      seen.add(action);
      const label = `seed ${seed}, action ${index}/${action}`;
      if (action === 'select') {
        await back();
        const options = step.options.filter((option) => option.derive);
        const option = options[next(options.length)]!;
        await page.locator(`[id="option-${option.id}"]`).click();
        choice = (project) => pick(project, step.id, option.id);
      } else if (action === 'variation' || action === 'finer') {
        const previous = variation as Variation | null;
        const round: number = previous ? previous.round + 1 : 0;
        const values = ownedValues(step, effectiveParams(choice(project)));
        const options = closerOptions({ ...project, params: { ...project.params, ...values } }, step.id, round);
        await page.getByRole('button', { name: variation ? /^Show finer variations of/ : /^Show small variations of/ }).press('Enter');
        variation = { origin: choice, back: previous?.back ?? choice, values, options, round };
      } else if (action === 'variant') {
        if (!variation) continue;
        const option = variation.options[next(variation.options.length)];
        const values = option ? { ...variation.values, ...option.values } : undefined;
        await page.locator(`[id="option-${option?.id ?? 'as-it-was'}"]`).click();
        choice = values ? (project) => pickValues(project, step.id, values) : variation.origin;
      } else if (action === 'back') await back();
      else if (action === 'slider') {
        await back();
        const tunable = step.tunables![next(step.tunables!.length)]!;
        const current = effectiveParams(project)[tunable.key] as number;
        const value = nextSliderValue(tunable, current, 1);
        if (await page.locator('.tune').getAttribute('open') === null) await page.locator('.tune summary').press('Enter');
        await page.locator(`[id="tune-${String(tunable.key)}"]`).press('ArrowRight');
        if (value !== current) {
          project = tune(project, step.id, tunable.key, value);
          choice = keepChoice;
        }
      } else if (action === 'contrast') {
        const profile = (['off', 'advise', 'enforce'] as const)[next(3)]!;
        await page.getByLabel('Contrast checks', { exact: true }).selectOption(profile);
        project = { ...project, a11y: profile };
      } else await commit(label);
    }
    await commit(`seed ${seed}: final choice`);
    expect([...seen].sort()).toEqual([...actions].sort());
    expect(faults).toEqual([]);
  } finally { await context.close(); }
});
