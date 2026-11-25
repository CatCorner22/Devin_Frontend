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
    let startedWithSkin = firstSkin !== undefined;
    let project = applyDirection(createProject(), direction, firstSkin?.id);
    let withoutSkin = applyDirection(createProject(), direction);
    const seen = new Set<string>();
    for (let index = 0; index < 49; index++) {
      const action = actions[index < actions.length ? index : next(actions.length)]!;
      seen.add(action);
      const before = project;
      const step = colorSteps[next(colorSteps.length)]!;
      const label = `${start.id}/${firstSkin?.id ?? 'bare'}/${index}/${action}/${step.id}`;
      expect(project.base, label).toEqual(direction.params);
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
        withoutSkin = keep(withoutSkin, step.id);
        const layer = before.skinLayer;
        if (layer && (layer.resets?.includes(step.id) || (!layer.off && !layer.overrides.includes(step.id)))) expect(project, label).toBe(before);
        expect(project.params, label).toEqual(before.params);
      } else if (action === 'pick') {
        const option = step.options[next(step.options.length)]!;
        project = pick(project, step.id, option.id);
        withoutSkin = pick(withoutSkin, step.id, option.id);
        if (project.skinLayer) expect(project.skinLayer.overrides, label).toContain(step.id);
        expect(matchingOptionId(effectiveParams(project), step), label).toBe(option.id);
      } else if (action === 'reset') {
        project = revert(project, step.id);
        withoutSkin = revert(withoutSkin, step.id);
        const expected = ownedValues(step, baseline);
        const follows = step.options.find((option) => option.id === matchingOptionId(baseline, step))?.derive;
        if (follows && !startedWithSkin) Object.assign(expected, { [follows.key]: ((effectiveParams(project)[follows.from] + follows.turn) % 360 + 360) % 360 });
        expect(ownedValues(step, effectiveParams(project)), label).toEqual(expected);
        expect(project.decisions[step.id], label).toBeUndefined();
      } else if (action === 'direction') {
        direction = DIRECTIONS[next(DIRECTIONS.length)]!;
        const skins = skinsOf(direction);
        const skin = next(2) === 0 || skins.length === 0 ? undefined : skins[next(skins.length)];
        baseline = skin ? skinParams(direction, skin) : direction.params;
        startedWithSkin = skin !== undefined;
        project = applyDirection(project, direction, skin?.id);
        withoutSkin = applyDirection(withoutSkin, direction);
        expect(effectiveParams(project), label).toEqual(baseline);
        expect(project.decisions, label).toEqual({});
      } else {
        const loaded = parseProject(JSON.parse(JSON.stringify(project)));
        const bareLoaded = parseProject(JSON.parse(JSON.stringify(withoutSkin)));
        expect(bareLoaded.ok, label).toBe(true);
        if (bareLoaded.ok) withoutSkin = bareLoaded.project;
        expect(loaded.ok, label).toBe(true);
        if (loaded.ok) {
          project = loaded.project;
          expect(project, label).toEqual(before);
          expect(effectiveParams(project), label).toEqual(effectiveParams(before));
        }
      }
      expect(project.base, label).toEqual(direction.params);
      expect(project.params, `${label}: no-Skin replay`).toEqual(withoutSkin.params);
    }
    expect(seen.size).toBe(actions.length);
  }
});
