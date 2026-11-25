import { expect, it } from 'vitest';
import { applyDirection, createProject, effectiveParams, parseProject, pick, revert, setSkin } from '../src/index.js';

it('review: putting a Step back restores its starting Skin, without making No Skin destructive', () => {
  const started = applyDirection(createProject(), 'soft-daylight', 'berry');
  const first = effectiveParams(started);
  const changed = pick(setSkin(started, 'ember'), 'accent', 'ink-blue');
  const reset = revert(changed, 'accent');
  expect(effectiveParams(reset).accentHue).toBe(first.accentHue);
  const loaded = parseProject(JSON.parse(JSON.stringify(reset)));
  expect(loaded.ok).toBe(true);
  if (loaded.ok) expect(effectiveParams(loaded.project)).toEqual(effectiveParams(reset));
  expect(effectiveParams(setSkin(started, null))).toEqual(started.params);
});

it('review: after No Skin and a main-color reset, a saved opposite choice follows the visible hue', () => {
  const started = applyDirection(createProject(), 'sticker-pop', 'lagoon');
  const paired = pick(started, 'color-strategy', 'duo-complement');
  const reset = revert(setSkin(paired, null), 'accent');
  const visible = effectiveParams(reset);
  expect(visible.accent2Hue).toBe((visible.accentHue + 180) % 360);
});

it('validates starting layers, reset references, and off state without exposing those colors underneath', () => {
  const started = applyDirection(createProject(), 'soft-daylight', 'berry');
  for (const invalid of [{ startColors: { accentHue: 20 } }, { off: 'yes' }, { resets: 'accent' }, { keys: ['fontHeading'] }, { keys: 'accentHue' }]) {
    expect(parseProject({ ...started, skinLayer: { ...started.skinLayer, ...invalid } }).ok).toBe(false);
  }
  const off = setSkin(started, null);
  expect(effectiveParams(off)).toEqual(started.params);
  const reset = revert(off, 'accent');
  expect(effectiveParams(reset).accentHue).toBe(effectiveParams(started).accentHue);
  expect(reset.params).toEqual(off.params);
  expect(effectiveParams(setSkin(reset, null))).toEqual(started.params);
  const loaded = parseProject({ ...reset, skinLayer: { ...reset.skinLayer, resets: ['accent', 'accent', 'unknown'] } });
  expect(loaded.ok).toBe(true);
  if (loaded.ok) {
    expect(loaded.project.skinLayer?.resets).toEqual(['accent']);
    expect(loaded.notes.join(' ')).toContain('starting-Skin reset');
  }
});

it('review: a starting Lagoon layer never changes Sticker Pop’s underlying one-third-turn pairing', () => {
  const started = applyDirection(createProject(), 'sticker-pop', 'lagoon');
  const bare = applyDirection(createProject(), 'sticker-pop');
  const changed = pick(started, 'accent', 'ink-blue');
  const expected = pick(bare, 'accent', 'ink-blue');
  expect(changed.params).toEqual(expected.params);
  expect(setSkin(changed, null).params).toEqual(expected.params);
});
