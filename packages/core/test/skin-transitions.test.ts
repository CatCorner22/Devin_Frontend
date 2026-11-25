import { expect, it } from 'vitest';
import { DIRECTIONS, SKIN_COLOR_KEYS, STEPS, applyDirection, createProject, effectiveParams, keep, matchingOptionId, ownedValues, parseProject, pick, revert, setSkin, skinParams, skinsOf } from '../src/index.js';

const colorSteps = STEPS.filter((step) => step.owns.some((key) => (SKIN_COLOR_KEYS as readonly string[]).includes(key)));
const actions = ['set', 'clear', 'keep', 'pick', 'reset', 'direction', 'reload'] as const;

it.each(DIRECTIONS)('Skin transition contracts: $id', (start) => {
  for (const firstSkin of [undefined, ...skinsOf(start)]) {
    let random = 117 + DIRECTIONS.indexOf(start) * 71 + (firstSkin?.accentHue ?? 0);
    const next = (length: number): number => {
      random = (Math.imul(random, 1664525) + 1013904223) >>> 0;
      return random % length;
    };
    let direction = start;
    let baseline = firstSkin ? skinParams(direction, firstSkin) : direction.params;
    let project = applyDirection(createProject(), direction, firstSkin?.id);
    const seen = new Set<string>();
    for (let index = 0; index < 49; index++) {
      const action = actions[index < actions.length ? index : next(actions.length)]!;
      seen.add(action);
      const before = project;
      const step = colorSteps[next(colorSteps.length)]!;
      const label = `${start.id}/${firstSkin?.id ?? 'bare'}/${index}/${action}/${step.id}`;
      expect(project.base, label).toEqual(baseline);
      if (action === 'set') {
        const offers = skinsOf(direction);
        if (offers.length) {
          project = setSkin(project, offers[next(offers.length)]!.id);
          expect(project.params, label).toBe(before.params);
          expect(project.decisions, label).toBe(before.decisions);
          expect(project.content, label).toBe(before.content);
          expect(project.skinLayer?.overrides, label).toEqual([]);
        }
      } else if (action === 'clear') {
        project = setSkin(project, null);
        expect(project.params, label).toBe(before.params);
        expect(project.decisions, label).toBe(before.decisions);
        expect(effectiveParams(project), label).toEqual(before.params);
      } else if (action === 'keep') {
        project = keep(project, step.id);
        if (before.skinLayer && !before.skinLayer.overrides.includes(step.id)) expect(project, label).toBe(before);
        expect(project.params, label).toEqual(before.params);
      } else if (action === 'pick') {
        const option = step.options[next(step.options.length)]!;
        project = pick(project, step.id, option.id);
        if (project.skinLayer) expect(project.skinLayer.overrides, label).toContain(step.id);
        expect(matchingOptionId(effectiveParams(project), step), label).toBe(option.id);
      } else if (action === 'reset') {
        project = revert(project, step.id);
        const expected = ownedValues(step, baseline);
        const follows = step.options.find((option) => option.id === matchingOptionId(baseline, step))?.derive;
        if (follows) Object.assign(expected, { [follows.key]: ((effectiveParams(project)[follows.from] + follows.turn) % 360 + 360) % 360 });
        expect(ownedValues(step, effectiveParams(project)), label).toEqual(expected);
        expect(project.decisions[step.id], label).toBeUndefined();
      } else if (action === 'direction') {
        direction = DIRECTIONS[next(DIRECTIONS.length)]!;
        const skins = skinsOf(direction);
        const skin = next(2) === 0 || skins.length === 0 ? undefined : skins[next(skins.length)];
        baseline = skin ? skinParams(direction, skin) : direction.params;
        project = applyDirection(project, direction, skin?.id);
        expect(effectiveParams(project), label).toEqual(baseline);
        expect(project.decisions, label).toEqual({});
      } else {
        const loaded = parseProject(JSON.parse(JSON.stringify(project)));
        expect(loaded.ok, label).toBe(true);
        if (loaded.ok) {
          project = loaded.project;
          expect(project, label).toEqual(before);
          expect(effectiveParams(project), label).toEqual(effectiveParams(before));
        }
      }
      expect(project.base, label).toEqual(baseline);
    }
    expect(seen.size).toBe(actions.length);
  }
});
