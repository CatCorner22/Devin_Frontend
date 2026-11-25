import { describe, expect, it } from 'vitest';
import { STEPS } from '../src/index.js';
import { catalogWalk, WALK_SCENARIOS, walkKey } from './catalog-walk.js';

describe('M5 exit walk inventory', () => {
  it('covers every Catalog Step and Option, with no repeated or extra entry', () => {
    const walk = catalogWalk();
    expect(walk.map((step) => step.id)).toEqual(STEPS.map((step) => step.id));
    expect(new Set(walk.map((step) => step.id)).size).toBe(STEPS.length);
    for (const step of STEPS) {
      const planned = walk.find((entry) => entry.id === step.id)!;
      expect(planned.options.map((option) => option.id), step.id).toEqual(step.options.map((option) => option.id));
      expect(new Set(planned.options.map((option) => option.id)).size).toBe(step.options.length);
    }
    const cases = WALK_SCENARIOS.flatMap(({ page, theme }) => walk.flatMap((step) => step.options.map((option) => walkKey(step.id, option.id, page, theme))));
    expect(new Set(cases).size).toBe(STEPS.reduce((count, step) => count + step.options.length, 0) * 4);
    expect(WALK_SCENARIOS).toEqual([{ page: 'home', theme: 'light' }, { page: 'home', theme: 'dark' }, { page: 'contact', theme: 'light' }, { page: 'contact', theme: 'dark' }]);
  });

  it('includes newly added Steps and Options automatically, and accepts an empty Catalog', () => {
    expect(catalogWalk([])).toEqual([]);
    const first = STEPS[0]!;
    const added = { ...first, id: 'future-step', options: [...first.options, { ...first.options[0]!, id: 'future-option' }] };
    const walk = catalogWalk([...STEPS, added]);
    expect(walk.find((step) => step.id === added.id)?.options.map((option) => option.id)).toContain('future-option');
    expect(walk).toHaveLength(STEPS.length + 1);
  });
});
