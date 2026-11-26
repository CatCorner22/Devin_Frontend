import { describe, expect, it } from 'vitest';
import { STEPS } from '../src/index.js';
import { catalogWalk, catalogWalkBatches, catalogWalkCases, WALK_SCENARIOS, walkKey } from './catalog-walk.js';

describe('M5 exit walk inventory', () => {
  it('covers every Catalog Step and Option, with no repeated or extra entry', () => {
    const walk = catalogWalk();
    const batches = catalogWalkBatches();
    expect(batches.flat()).toEqual(walk);
    expect(batches.every((batch) => batch.length === 1)).toBe(true);
    expect(walk.map((step) => step.id)).toEqual(STEPS.map((step) => step.id));
    expect(new Set(walk.map((step) => step.id)).size).toBe(STEPS.length);
    for (const step of STEPS) {
      const planned = walk.find((entry) => entry.id === step.id)!;
      expect(planned.options.map((option) => option.id), step.id).toEqual(step.options.map((option) => option.id));
      expect(new Set(planned.options.map((option) => option.id)).size).toBe(step.options.length);
    }
    const cases = WALK_SCENARIOS.flatMap(({ page, theme }) => walk.flatMap((step) => step.options.map((option) => walkKey(step.id, option.id, page, theme))));
    const planned = catalogWalkCases();
    expect(planned).toHaveLength(STEPS.length * WALK_SCENARIOS.length);
    expect(planned.flatMap(({ steps, scenario }) => steps.flatMap((step) => step.options.map((option) => walkKey(step.id, option.id, scenario.page, scenario.theme)))).sort()).toEqual([...cases].sort());
    expect(planned.flatMap(({ steps, lane }) => steps.filter((step) => walk.findIndex((entry) => entry.id === step.id) % WALK_SCENARIOS.length === lane).map((step) => step.id))).toEqual(walk.map((step) => step.id));
    expect(new Set(cases).size).toBe(STEPS.reduce((count, step) => count + step.options.length, 0) * 4);
    expect(WALK_SCENARIOS).toEqual([{ page: 'home', theme: 'light' }, { page: 'home', theme: 'dark' }, { page: 'contact', theme: 'light' }, { page: 'contact', theme: 'dark' }]);
  });

  it('includes newly added Steps and Options automatically, and accepts an empty Catalog', () => {
    expect(catalogWalk([])).toEqual([]);
    expect(catalogWalkBatches([])).toEqual([]);
    expect(catalogWalkCases([])).toEqual([]);
    for (const size of [0, -1, 1.5]) expect(() => catalogWalkBatches([], size)).toThrow(RangeError);
    const first = STEPS[0]!;
    const added = { ...first, id: 'future-step', options: [...first.options, { ...first.options[0]!, id: 'future-option' }] };
    const walk = catalogWalk([...STEPS, added]);
    expect(walk.find((step) => step.id === added.id)?.options.map((option) => option.id)).toContain('future-option');
    expect(walk).toHaveLength(STEPS.length + 1);
    expect(catalogWalkBatches([...STEPS, added]).flat()).toEqual(walk);
    expect(catalogWalkCases([...STEPS, added]).filter(({ steps }) => steps[0]?.id === added.id)).toHaveLength(WALK_SCENARIOS.length);
  });
});
