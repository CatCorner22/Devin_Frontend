import { describe, expect, it } from 'vitest';
import { DIRECTIONS, SKIN_COLOR_KEYS, STEPS, applyDirection, createProject, deriveTokens, effectiveParams, findStep, keep, parseProject, pick, previewParams, projectTokens, revert, setReason, setSkin, skinsOf, startPlain, tune, type Project } from '../src/index.js';

const start = (): Project => {
  let p = applyDirection(createProject('Owner colors'), 'soft-daylight');
  p = pick(p, 'accent', 'ink-blue');
  p = setReason(p, 'accent', 'The owner’s reason');
  return { ...p, overlays: ['sticky-call'], content: { ...p.content, business: 'Owner business' } };
};
const reopen = (p: Project): Project => {
  const result = parseProject(JSON.parse(JSON.stringify(p)));
  expect(result.ok).toBe(true);
  if (!result.ok) throw new Error(result.error);
  expect(result.notes).toEqual([]);
  return result.project;
};

describe('in-project Skin changes', () => {
  it('changes only color tokens and preserves every saved parameter, Decision, reason and word', () => {
    const before = start();
    const after = setSkin(before, 'ember');
    expect(after.params).toBe(before.params);
    expect(after.base).toBe(before.base);
    expect(after.decisions).toBe(before.decisions);
    expect(after.content).toBe(before.content);
    expect(after.overlays).toBe(before.overlays);
    expect(after.a11y).toBe(before.a11y);
    expect(effectiveParams(after).accentHue).not.toBe(before.params.accentHue);
    const original = projectTokens(before).css;
    const colored = projectTokens(after).css;
    for (const key of Object.keys(original)) {
      if (!/#[\da-f]{6}|rgb\(/i.test(original[key]!) && key !== '--marker-alpha') expect(colored[key], key).toBe(original[key]);
    }
    expect(reopen(after)).toEqual(after);
    expect(setSkin(after, null)).toEqual(before);
  });

  it('keeps the underlying Decisions through successive Skins, no Skin, and file round trips', () => {
    const before = start();
    for (const id of ['berry', 'ember', 'graphite', null]) {
      const changed = reopen(setSkin(before, id));
      expect(changed.decisions).toEqual(before.decisions);
      expect(changed.params).toEqual(before.params);
      expect(changed.content).toEqual(before.content);
      expect(effectiveParams(changed)).toEqual(effectiveParams(setSkin(before, id)));
    }
  });

  it('preserves all non-color tokens and Decisions for every offered Direction and Skin', () => {
    for (const direction of DIRECTIONS) for (const skin of skinsOf(direction)) {
      const before = pick(pick(applyDirection(start(), direction), 'accent', 'ink-blue'), 'radius', 'pill');
      const after = setSkin(before, skin.id);
      expect(after.params).toBe(before.params);
      expect(after.decisions).toBe(before.decisions);
      expect(after.content).toBe(before.content);
      const old = projectTokens(before).css;
      const next = projectTokens(after).css;
      for (const key of Object.keys(old)) {
        if (key !== '--marker-alpha' && !/#[\da-f]{6}|rgb\(/i.test(old[key]! + next[key]!)) expect(next[key], `${direction.id}/${skin.id}/${key}`).toBe(old[key]);
      }
    }
  });

  it('rejects unknown or unoffered Skins and handles a plain start and empty no-Skin change', () => {
    const empty = createProject();
    expect(setSkin(empty, null)).toBe(empty);
    expect(() => setSkin(empty, 'ocean')).toThrow('does not offer');
    expect(() => setSkin(start(), 'unknown')).toThrow('does not offer');
    expect(() => setSkin(applyDirection(empty, 'ink-and-seal'), 'berry')).toThrow('does not offer');
    const colored = setSkin(start(), 'ember');
    expect(startPlain(colored).skinLayer).toBeUndefined();
    const changed = applyDirection(colored, 'ink-and-seal');
    expect(changed.skin).toBeUndefined();
    expect(changed.skinLayer).toBeUndefined();
  });

  it('lets a later color choice, slider, keep and put-back win only for its Step', () => {
    const colored = setSkin(start(), 'ember');
    const chosen = pick(colored, 'accent', 'ink-blue');
    expect(effectiveParams(chosen).accentHue).toBe(chosen.params.accentHue);
    expect(effectiveParams(chosen).neutralHue).toBe(effectiveParams(colored).neutralHue);
    expect(previewParams(colored, 'accent', 'ink-blue')).toEqual(effectiveParams(chosen));
    const tuned = tune(colored, 'accent', 'accentHue', 100);
    expect(effectiveParams(tuned).accentHue).toBe(100);
    const tint = tune(colored, 'neutral', 'neutralChroma', 0.02);
    expect(effectiveParams(tint).neutralHue).toBe(effectiveParams(colored).neutralHue);
    expect(effectiveParams(tint).neutralChroma).toBe(0.02);
    const kept = keep(colored, 'accent');
    expect(effectiveParams(kept)).toEqual(effectiveParams(colored));
    expect(kept).toBe(colored);
    const back = revert(colored, 'accent');
    expect(effectiveParams(back).accentHue).toBe(back.base.accentHue);
    for (const p of [chosen, tuned, tint, kept, back]) expect(effectiveParams(reopen(p))).toEqual(effectiveParams(p));
    expect(effectiveParams(setSkin(chosen, 'ember'))).toEqual(effectiveParams(colored));
  });

  it('keeps following-color Options relative to the visible main color in either choice order', () => {
    const step = findStep('color-strategy')!;
    const option = step.options.find((o) => o.derive)!;
    for (const accentFirst of [true, false]) {
      let p = setSkin(start(), 'ember');
      if (accentFirst) p = pick(p, 'accent', 'ink-blue');
      p = pick(p, step.id, option.id);
      if (!accentFirst) p = pick(p, 'accent', 'ink-blue');
      const shown = effectiveParams(p);
      expect(shown.accent2Hue).toBe((shown.accentHue + option.derive!.turn + 360) % 360);
      expect(effectiveParams(reopen(p))).toEqual(shown);
      expect(reopen(setSkin(p, null)).decisions).toEqual(p.decisions);
    }
  });

  it('validates color layers and normalizes only invalid exception references, not Decisions', () => {
    const p = setSkin(start(), 'ember');
    const unavailable = parseProject({ ...p, skin: 'future-skin' });
    expect(unavailable.ok).toBe(true);
    if (unavailable.ok) expect(effectiveParams(unavailable.project)).toEqual(effectiveParams(p));
    for (const colors of [{ ...p.skinLayer!.colors, accentHue: -1 }, { ...p.skinLayer!.colors, fontHeading: 'inter' }, { accentHue: 30 }]) {
      expect(parseProject({ ...p, skinLayer: { ...p.skinLayer, colors } }).ok).toBe(false);
    }
    const result = parseProject({ ...p, skin: 'future-skin', skinLayer: { ...p.skinLayer, overrides: ['accent', 'accent', 'unknown', 'layout'] } });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.project.skin).toBeUndefined();
    expect(result.project.skinLayer!.overrides).toEqual(['accent']);
    expect(result.project.decisions).toEqual(p.decisions);
    expect(result.notes.join(' ')).toContain('colors are unchanged');
    expect(result.notes.join(' ')).toContain('Those entries were left out');
    const old = start();
    expect(reopen(old)).toEqual(old);
    expect(SKIN_COLOR_KEYS.every((key) => STEPS.some((step) => step.owns.includes(key)))).toBe(true);
    expect(deriveTokens(effectiveParams(p), p.a11y).pairs.every((pair) => pair.passes)).toBe(true);
  });
});
