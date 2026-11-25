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
