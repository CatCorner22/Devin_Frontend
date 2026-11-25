import { describe, expect, it } from 'vitest';
import { applyDirection, createProject, effectiveParams, findDirection, keep, parseProject, pick, setReason, setSkin, skinCoversStep } from '../src/index.js';

describe('PR 14 Skin review', () => {
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
