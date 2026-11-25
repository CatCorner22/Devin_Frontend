import { describe, expect, it } from 'vitest';
import { applyDirection, createProject, effectiveParams, findDirection, findStep, keep, parseProject, pick, setReason, setSkin, skinCoversStep, tune } from '../src/index.js';

describe('PR 14 Skin review', () => {
  it('does not carry a Skin-added second-color adjustment reason into a one-color pick', () => {
    const single = findStep('color-strategy')!.options.find((option) => option.id === 'single-accent')!;
    const raw = pick(applyDirection(createProject(), 'midnight-aurora'), 'color-strategy', single.id);
    const edited = setReason(tune(setSkin(raw, 'lagoon'), 'color-strategy', 'accent2Hue', 42), 'color-strategy', 'This second hue contrasts with the first.');
    expect(edited.params.colorStrategy).toBe(single.patch.colorStrategy);
    expect(effectiveParams(edited).colorStrategy).toBe('duo');
    const loaded = parseProject(JSON.parse(JSON.stringify(edited)));
    expect(loaded.ok).toBe(true);
    for (const project of loaded.ok ? [edited, loaded.project] : [edited]) {
      const picked = pick(project, 'color-strategy', single.id);
      expect(picked.decisions['color-strategy']!.reason).toBeUndefined();
      expect(effectiveParams(picked).colorStrategy).toBe(single.patch.colorStrategy);
    }
  });
  it('review 1: continuing a covered color Step preserves its saved values and reason', () => {
    const before = setReason(pick(applyDirection(createProject(), 'soft-daylight'), 'accent', 'ink-blue'), 'accent', 'The owner chose blue');
    const covered = setSkin(before, 'ember');
    const continued = keep(covered, 'accent');
    expect(skinCoversStep(before, 'accent')).toBe(false);
    expect(skinCoversStep(covered, 'accent')).toBe(true);
    expect(skinCoversStep(pick(covered, 'accent', 'ink-blue'), 'accent')).toBe(false);
    expect(() => skinCoversStep(covered, 'unknown')).toThrow('Unknown Step');
    expect(continued.params).toEqual(before.params);
    expect(continued.decisions).toEqual(before.decisions);
    expect(continued.skinLayer).toEqual(covered.skinLayer);
    expect(setSkin(continued, null)).toEqual(before);
    const fresh = setSkin(applyDirection(createProject(), 'soft-daylight'), 'ember');
    expect(keep(fresh, 'accent')).toEqual(fresh);
  });

  it('review 2: continuing a Skin fixed second color does not turn it into the starting relationship', () => {
    const direction = findDirection('midnight-aurora')!;
    const params = { ...direction.params, colorStrategy: 'duo' as const, accent2Hue: (direction.params.accentHue + 180) % 360 };
    const covered = setSkin(applyDirection(createProject(), { ...direction, params }), 'lagoon');
    const fixed = effectiveParams(covered).accent2Hue;
    const changed = pick(keep(covered, 'color-strategy'), 'accent', 'ink-blue');
    expect(effectiveParams(changed).accent2Hue).toBe(fixed);
    const loaded = parseProject(JSON.parse(JSON.stringify(changed)));
    expect(loaded.ok).toBe(true);
    if (loaded.ok) expect(effectiveParams(loaded.project).accent2Hue).toBe(fixed);
  });

});
