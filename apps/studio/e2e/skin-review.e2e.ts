import { DIRECTIONS, STEPS, activeTunables, applyDirection, createProject, deriveTokens, effectiveParams, findDirection, findSkin, findStep, matchingOptionId, pick, setReason, setSkin, skinCoversStep, skinParams, skinsOf, tune, type Project } from '@refraction/core';
import { chromium, type Browser, type Page } from 'playwright';
import { afterAll, beforeAll, expect, it } from 'vitest';

const pageUrl = new URL('../dist/artifact/local-test.html', import.meta.url).href;
const key = 'refraction.project.v2';
let browser: Browser;
beforeAll(async () => { browser = await chromium.launch(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {}); });
afterAll(async () => { await browser?.close(); });
const stored = (page: Page): Promise<Project | undefined> => page.evaluate((key) => (JSON.parse(localStorage.getItem(key) ?? 'null') as { project: Project } | null)?.project, key);
async function open(project?: Project, hash = '#summary') {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  const faults: string[] = [];
  page.on('pageerror', (error) => faults.push(String(error)));
  if (project) await page.addInitScript(({ key, project }) => {
    if (window.top === window) localStorage.setItem(key, JSON.stringify({ savedAt: '2026-11-25T12:00:00.000Z', project }));
  }, { key, project });
  await page.goto(`${pageUrl}${hash}`);
  await page.locator(hash === '#summary' ? '#project-skin' : hash === '#directions' ? '.direction' : '.cards').first().waitFor();
  return { context, page, faults };
}

it('Skin review: Continue preserves the covered Decision and reason, including after No Skin', async () => {
  const before = setReason(pick(applyDirection(createProject(), 'soft-daylight'), 'accent', 'ink-blue'), 'accent', 'Keep the owner’s blue');
  const { context, page, faults } = await open(setSkin(before, 'ember'), '#accent');
  try {
    await page.locator('.actions.sticky .primary').click();
    await page.locator('.rail a[href="#summary"]').click();
    await page.getByLabel('Project Skin', { exact: true }).selectOption('');
    await expect.poll(async () => (await stored(page))?.skin).toBeUndefined();
    await expect.poll(async () => (await stored(page))?.params).toEqual(before.params);
    expect((await stored(page))?.decisions.accent).toEqual(before.decisions.accent);
    expect(faults).toEqual([]);
  } finally { await context.close(); }
});

it('Skin review: explicitly picking a covered named Option adopts it instead of merely continuing', async () => {
  const step = findStep('display-treatment')!;
  const fade = step.options.find((option) => option.patch.displayTreatment === 'accent-gradient')!;
  const solid = step.options.find((option) => option.patch.displayTreatment === 'solid')!;
  const before = pick(applyDirection(createProject(), 'soft-daylight'), step.id, fade.id);
  const { context, page, faults } = await open(setSkin(before, 'ember'), `#${step.id}`);
  try {
    await page.locator(`[id="option-${solid.id}"]`).click();
    expect(await page.locator('.actions.sticky .primary').innerText()).toMatch(/^Pick /);
    await page.locator('.actions.sticky .primary').click();
    await expect.poll(async () => (await stored(page))?.skinLayer?.overrides).toContain(step.id);
    expect((await stored(page))?.params.displayTreatment).toBe('solid');
    expect(faults).toEqual([]);
  } finally { await context.close(); }
});

it('Skin review: a Skin chosen on Directions is removable after saving and reloading', async () => {
  const { context, page, faults } = await open(undefined, '#directions');
  try {
    const card = page.locator('.direction', { has: page.getByRole('heading', { name: 'Soft Daylight', exact: true }) });
    await card.locator('.skin', { hasText: 'Berry' }).click();
    await card.getByRole('button', { name: 'Start from Soft Daylight', exact: true }).click();
    await expect.poll(async () => (await stored(page))?.skin).toBe('berry');
    await page.reload();
    await page.locator('.rail a[href="#summary"]').click();
    await page.getByLabel('Project Skin', { exact: true }).selectOption('');
    await expect.poll(async () => (await stored(page))?.skin).toBeUndefined();
    expect((await stored(page))?.params).toEqual(findDirection('soft-daylight')!.params);
    expect(faults).toEqual([]);
  } finally { await context.close(); }
});

it('Skin review: old starting-Skin files explain why No Skin cannot remove saved colors', async () => {
  const direction = findDirection('soft-daylight')!;
  const params = skinParams(direction, findSkin('berry')!);
  const old = { ...applyDirection(createProject(), direction), params, base: params, skin: 'berry' };
  const { context, page, faults } = await open(old);
  try {
    expect(await page.locator('[aria-labelledby="project-skin-title"]').innerText()).toContain('No Skin removes the name, but cannot remove those saved colors');
    await page.getByLabel('Project Skin', { exact: true }).selectOption('');
    expect(await page.locator('.banner').innerText()).toContain('No Skin removed the name, but cannot remove those saved colors');
    await expect.poll(async () => (await stored(page))?.skin).toBeUndefined();
    expect((await stored(page))?.params).toEqual(params);
    expect(faults).toEqual([]);
  } finally { await context.close(); }
});

it('Skin review: Lagoon replaces a painted first screen with its promised fade on both pages', async () => {
  const step = findStep('color-strategy')!;
  const painted = step.options.find((option) => option.patch.colorStrategy === 'color-block')!;
  const before = pick(applyDirection(createProject(), 'midnight-aurora'), step.id, painted.id);
  const expected = deriveTokens(effectiveParams(setSkin(before, 'lagoon')), before.a11y).css['--display-fill'];
  const { context, page, faults } = await open(before);
  try {
    await page.getByLabel('Project Skin', { exact: true }).selectOption('lagoon');
    for (const name of ['home', 'contact']) {
      await page.getByRole('combobox', { name: 'Preview page', exact: true }).selectOption(name);
      const frame = page.frameLocator('.summary-side iframe');
      await expect.poll(() => frame.locator('body').getAttribute('data-strategy')).toBe('duo');
      expect(await frame.locator('body').evaluate((body) => getComputedStyle(body).getPropertyValue('--display-fill').trim())).toBe(expected);
      expect(await frame.locator('h1').evaluate((title) => getComputedStyle(title).backgroundImage)).not.toBe('none');
    }
    expect(faults).toEqual([]);
  } finally { await context.close(); }
});

it('Skin review: returning from unpicked variations restores the untouched standard-card selection', async () => {
  const examples = DIRECTIONS.flatMap((direction) => skinsOf(direction).flatMap((skin) => {
    const project = setSkin(applyDirection(createProject(), direction), skin.id);
    return STEPS.filter((step) => skinCoversStep(project, step.id) && matchingOptionId(effectiveParams(project), step) !== null && activeTunables(step, effectiveParams(project)).length > 0).map((step) => ({ project, step }));
  }));
  expect(examples.length).toBeGreaterThan(0);
  const { project, step } = examples[0]!;
  const { context, page, faults } = await open(project, `#${step.id}`);
  try {
    await page.getByRole('button', { name: /^Show small variations of/ }).click();
    await page.locator('.cards input').nth(1).click();
    await page.getByRole('button', { name: 'Back to the standard Options', exact: true }).click();
    expect(await page.locator('.actions.sticky .primary').innerText()).not.toMatch(/^Pick /);
    await page.locator('.actions.sticky .primary').click();
    await page.locator('.rail a[href="#summary"]').click();
    await page.getByLabel('Project Skin', { exact: true }).selectOption('');
    await expect.poll(async () => (await stored(page))?.skin).toBeUndefined();
    expect((await stored(page))?.params).toEqual(project.params);
    expect((await stored(page))?.decisions).toEqual(project.decisions);
    expect(faults).toEqual([]);
  } finally { await context.close(); }
});

it('Skin review: Put this Step back restores the colors shown by the starting Skin', async () => {
  const { context, page, faults } = await open(undefined, '#directions');
  try {
    const card = page.locator('.direction', { has: page.getByRole('heading', { name: 'Soft Daylight', exact: true }) });
    await card.locator('.skin', { hasText: 'Berry' }).click();
    await card.getByRole('button', { name: 'Start from Soft Daylight', exact: true }).click();
    await page.locator('.rail a[href="#accent"]').click();
    await page.locator('#option-ink-blue').click();
    await page.locator('.actions.sticky .primary').click();
    await page.locator('.rail a[href="#accent"]').click();
    await page.getByRole('button', { name: 'Put this Step back to how the project started', exact: true }).click();
    await expect.poll(async () => (await stored(page))?.skinLayer?.resets).toContain('accent');
    expect((await stored(page))?.params.accentHue).toBe(findDirection('soft-daylight')!.params.accentHue);
    const expected = deriveTokens(skinParams(findDirection('soft-daylight')!, findSkin('berry')!), 'advise').css['--action'];
    await expect.poll(() => page.frameLocator('.large-preview iframe').locator('body').evaluate((body) => getComputedStyle(body).getPropertyValue('--action').trim())).toBe(expected);
    expect((await stored(page))?.decisions.accent).toBeUndefined();
    expect(faults).toEqual([]);
  } finally { await context.close(); }
});

it('Skin review: reset after No Skin keeps starting colors removable without changing the underlying recipe', async () => {
  const started = applyDirection(createProject(), 'soft-daylight', 'berry');
  const { context, page, faults } = await open(started);
  try {
    await page.getByLabel('Project Skin', { exact: true }).selectOption('');
    await page.locator('a[href="#accent"]').click();
    await page.getByRole('button', { name: 'Put this Step back to how the project started', exact: true }).click();
    await page.locator('.rail a[href="#summary"]').click();
    expect(await page.getByLabel('Project Skin', { exact: true }).inputValue()).toBe('starting-colors');
    expect(await page.locator('#project-skin-meaning').innerText()).toContain('starting Skin colors');
    await page.getByLabel('Project Skin', { exact: true }).selectOption('');
    await expect.poll(async () => (await stored(page))?.skinLayer?.resets).toBeUndefined();
    expect((await stored(page))?.params).toEqual(started.params);
    expect(faults).toEqual([]);
  } finally { await context.close(); }
});

it('Skin review: a slider changes only its raw value and leaves unmoved Skin controls on the layer', async () => {
  const pair = DIRECTIONS.flatMap((direction) => skinsOf(direction).map((skin) => ({ direction, skin })))
    .find(({ direction, skin }) => skin.accentChroma !== undefined && skin.accentChroma !== direction.params.accentChroma)!;
  const started = applyDirection(createProject(), pair.direction, pair.skin.id);
  const before = effectiveParams(started);
  const { context, page, faults } = await open(started, '#accent');
  try {
    await page.getByText('Adjust with sliders', { exact: true }).click();
    const hue = findStep('accent')!.tunables!.find((tunable) => tunable.key === 'accentHue')!;
    await page.getByRole('slider', { name: hue.label, exact: true }).press('ArrowRight');
    await expect.poll(async () => (await stored(page))?.decisions.accent?.kind).toBe('tuned');
    const changed = (await stored(page))!;
    expect(effectiveParams(changed).accentHue).not.toBe(before.accentHue);
    expect(effectiveParams(changed).accentChroma).toBe(before.accentChroma);
    expect(effectiveParams(changed).accentLightness).toBe(before.accentLightness);
    expect(changed.params.accentChroma).toBe(started.params.accentChroma);
    expect(changed.skinLayer?.keys).toContain('accentHue');
    expect(faults).toEqual([]);
  } finally { await context.close(); }
});

it('Skin review: choosing one color after a second-color adjustment removes the earlier reason with a recovery action', async () => {
  const raw = pick(applyDirection(createProject(), 'midnight-aurora'), 'color-strategy', 'single-accent');
  const edited = setReason(tune(setSkin(raw, 'lagoon'), 'color-strategy', 'accent2Hue', 42), 'color-strategy', 'This second hue contrasts with the first.');
  const { context, page, faults } = await open(edited, '#color-strategy');
  try {
    await page.locator('[id="option-single-accent"]').press('Space');
    await page.locator('[id="option-single-accent"]').press('Enter');
    await expect.poll(async () => (await stored(page))?.decisions['color-strategy']?.kind).toBe('picked');
    expect((await stored(page))!.decisions['color-strategy']!.reason).toBeUndefined();
    const recover = page.getByRole('button', { name: 'Keep that reason for the new choice', exact: true });
    await recover.click();
    await expect.poll(async () => (await stored(page))?.decisions['color-strategy']?.reason).toBe('This second hue contrasts with the first.');
    expect(faults).toEqual([]);
  } finally { await context.close(); }
});
