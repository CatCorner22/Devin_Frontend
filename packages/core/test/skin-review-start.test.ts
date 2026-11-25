import { expect, it } from 'vitest';
import { applyDirection, createProject, effectiveParams, findDirection, findSkin, parseProject, setSkin, skinParams } from '../src/index.js';

it('review 3: new starting Skins are removable layers while old saved colors retain their meaning', () => {
  const direction = findDirection('soft-daylight')!;
  const skin = findSkin('berry')!;
  const started = applyDirection(createProject(), direction, skin.id);
  expect(started.skinLayer).toBeDefined();
  expect(started.params).toEqual(direction.params);
  expect(started.base).toEqual(skinParams(direction, skin));
  expect(effectiveParams(started)).toEqual(skinParams(direction, skin));
  expect(setSkin(started, null).params).toEqual(direction.params);
  const old = { ...applyDirection(createProject(), direction), skin: skin.id, params: skinParams(direction, skin), base: skinParams(direction, skin) };
  const parsed = parseProject(JSON.parse(JSON.stringify(old)));
  expect(parsed.ok).toBe(true);
  if (parsed.ok) {
    expect(parsed.project.skinLayer).toBeUndefined();
    expect(setSkin(parsed.project, null).params).toEqual(old.params);
  }
});
