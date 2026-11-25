import { expect, it } from 'vitest';
import { DIRECTIONS, SKIN_COLOR_KEYS, STEPS, applyDirection, createProject, effectiveParams, keep, matchingOptionId, ownedValues, parseProject, pick, pickValues, revert, setReason, setSkin, skinParams, skinsOf, tune } from '../src/index.js';

const colorSteps = STEPS.filter((step) => step.owns.some((key) => (SKIN_COLOR_KEYS as readonly string[]).includes(key)));
const actions = ['set', 'clear', 'keep', 'pick', 'reset', 'direction', 'reload', 'main', 'fixed', 'restore'] as const;
const mainStep = STEPS.find((step) => step.owns.includes('accentHue'))!;
const pairingStep = STEPS.find((step) => step.options.some((option) => option.derive))!;

function checkEffectivePairing(project: ReturnType<typeof createProject>, label: string): void {
  const visible = effectiveParams(project);
  for (const step of STEPS.filter((step) => step.options.some((option) => option.derive))) {
    const layer = project.skinLayer;
    const key = step.options.find((option) => option.derive)!.derive!.key;
    const starting = layer?.startColors && layer.resets?.includes(step.id) && !layer.keys?.includes(key);
    const current = layer && !layer.off && !layer.overrides.includes(step.id) && !layer.keys?.includes(key);
    const decision = project.decisions[step.id];
    const option = decision?.kind === 'picked' ? step.options.find((option) => option.id === decision.optionId)
      : step.options.find((option) => option.derive && Object.entries(option.patch).every(([key, value]) => project.base[key as keyof typeof project.base] === value)
        && project.base[option.derive.key] === (project.base[option.derive.from] + option.derive.turn) % 360);
    const derive = step.options.find((option) => option.derive)!.derive!;
    if (starting) expect(visible[derive.key], `${label}: fixed starting pair`).toBe(layer!.startColors![derive.key]);
    else if (current) expect(visible[derive.key], `${label}: fixed current pair`).toBe(layer!.colors[derive.key]);
    else if (decision?.kind !== 'tuned' && option?.derive && Object.entries(option.patch).every(([key, value]) => visible[key as keyof typeof visible] === value)) {
      expect(visible[option.derive.key], `${label}: following visible pair`).toBe((visible[option.derive.from] + option.derive.turn) % 360);
    } else expect(visible[derive.key], `${label}: fixed recipe or Decision pair`).toBe(project.params[derive.key]);
  }
}

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
    for (let index = 0; index < 96; index++) {
      const action = actions[index < actions.length ? index : next(actions.length)]!;
      seen.add(action);
      const before = project;
      const available = action === 'restore' ? colorSteps.filter((step) => step.tunables?.length) : colorSteps;
      const step = available[next(available.length)]!;
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
      } else if (action === 'main') {
        const hue = next(360);
        project = tune(project, mainStep.id, 'accentHue', hue);
        withoutSkin = tune(withoutSkin, mainStep.id, 'accentHue', hue);
        expect(project.params.accentHue, label).toBe(hue);
      } else if (action === 'fixed') {
        const key = pairingStep.options.find((option) => option.derive)!.derive!.key;
        const hue = next(360);
        project = tune(project, pairingStep.id, key, hue);
        withoutSkin = tune(withoutSkin, pairingStep.id, key, hue);
        expect(effectiveParams(project)[key], label).toBe(hue);
      } else if (action === 'pick') {
        const option = step.options[next(step.options.length)]!;
        project = pick(project, step.id, option.id);
        withoutSkin = pick(withoutSkin, step.id, option.id);
        if (project.skinLayer) expect(project.skinLayer.overrides, label).toContain(step.id);
        expect(matchingOptionId(effectiveParams(project), step), label).toBe(option.id);
        expect(project.decisions[step.id]!.kind, label).toBe('picked');
        if (before.decisions[step.id]?.kind === 'tuned') expect(project.decisions[step.id]!.reason, label).toBeUndefined();
      } else if (action === 'restore') {
        const option = step.options[next(step.options.length)]!;
        project = setReason(pick(project, step.id, option.id), step.id, label);
        withoutSkin = setReason(pick(withoutSkin, step.id, option.id), step.id, label);
        const values = ownedValues(step, project.params);
        const tunable = step.tunables![next(step.tunables!.length)]!;
        const value = project.params[tunable.key] as number;
        const moved = value + tunable.step <= tunable.max ? value + tunable.step : value - tunable.step;
        project = tune(project, step.id, tunable.key, moved);
        withoutSkin = tune(withoutSkin, step.id, tunable.key, moved);
        expect(project.decisions[step.id]!.reason, `${label}: slider reason`).toBe(label);
        project = pickValues(project, step.id, values);
        withoutSkin = pickValues(withoutSkin, step.id, values);
        expect(project.decisions[step.id]!.kind, `${label}: variation intent`).toBe('tuned');
        expect(project.decisions[step.id]!.reason, `${label}: variation reason`).toBe(label);
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
      expect(project.skinLayer?.startColors, label).toEqual(startedWithSkin ? Object.fromEntries(SKIN_COLOR_KEYS.map((key) => [key, baseline[key]])) : undefined);
      checkEffectivePairing(project, label);
      expect(project.params, `${label}: no-Skin replay`).toEqual(withoutSkin.params);
    }
    expect(seen.size).toBe(actions.length);
  }
});
