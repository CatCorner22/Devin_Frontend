import { STEPS, type Step } from '../src/index.js';

export function catalogWalk(steps: readonly Step[] = STEPS) {
  return [...new Set(steps.map((step) => step.stage))].flatMap((stage) =>
    steps.filter((step) => step.stage === stage).map((step) => ({
      id: step.id,
      name: step.name,
      title: step.title,
      ownsTheme: step.owns.includes('theme'),
      options: step.options.map((option) => ({ id: option.id, theme: option.patch.theme })),
    })),
  );
}

export const WALK_SCENARIOS = (['home', 'contact'] as const).flatMap((page) =>
  (['light', 'dark'] as const).map((theme) => ({ page, theme })),
);

export const walkKey = (step: string, option: string, page: string, theme: string): string => `${step}/${option}/${page}/${theme}`;
