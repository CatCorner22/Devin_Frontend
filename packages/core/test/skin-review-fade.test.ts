import { expect, it } from 'vitest';
import { applyDirection, createProject, effectiveParams, findSkin, findStep, pick, setSkin } from '../src/index.js';

it('review 4: applying a fade Skin covers an earlier painted first screen, and a later painted choice wins', () => {
  const step = findStep('color-strategy')!;
  const painted = step.options.find((option) => option.patch.colorStrategy === 'color-block')!;
  const before = pick(applyDirection(createProject(), 'midnight-aurora'), step.id, painted.id);
  const colored = setSkin(before, 'lagoon');
  expect(effectiveParams(colored).colorStrategy).toBe('duo');
  expect(effectiveParams(colored).accent2Hue).toBe(findSkin('lagoon')!.accent2Hue);
  expect(colored.params).toBe(before.params);
  expect(colored.decisions).toBe(before.decisions);
  expect(effectiveParams(pick(colored, step.id, painted.id)).colorStrategy).toBe('color-block');
});
