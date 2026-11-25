import { expect, it } from 'vitest';
import { SKIN_COLOR_KEYS, effectiveParams, parseProject, type DesignParams } from '../src/index.js';
import { fixture } from './helpers.js';

const colors = (params: DesignParams) => Object.fromEntries([...SKIN_COLOR_KEYS, 'accentLightness', 'neutralChroma', 'theme', 'contrast'].map((key) => [key, params[key as keyof DesignParams]]));

it.each([1, 2])('preserves saved effective colors when opening a version-%i main-only legacy fixture', (version) => {
  const saved = fixture(`project-v${version}-sticker-main.json`) as { params: DesignParams };
  const loaded = parseProject(saved);
  expect(loaded.ok).toBe(true);
  if (!loaded.ok) return;
  expect(colors(loaded.project.params)).toEqual(colors(saved.params));
  expect(colors(effectiveParams(loaded.project))).toEqual(colors(saved.params));
  const again = parseProject(JSON.parse(JSON.stringify(loaded.project)));
  expect(again.ok).toBe(true);
  if (again.ok) expect(colors(effectiveParams(again.project))).toEqual(colors(saved.params));
});
