import { effectiveParams, keep, matchingOptionId, pick, pickValues, type DesignParams, type GeneratedOption, type Project, type Step } from '@refraction/core';

export const CURRENT = 'current';

/** A variation retains its origin's intent; only a generated card fixes values. Preview and commit use selectionProject. */
export type StepSelection =
  | { kind: 'none' }
  | { kind: 'named'; optionId: string }
  | { kind: 'slider' }
  | { kind: 'variation'; optionId: string; origin: StepSelection; originValues: Partial<DesignParams>; options: GeneratedOption[]; round: number };

export function appliedCardId(project: Project, step: Step): string {
  return matchingOptionId(effectiveParams(project), step, project.brief?.voice) ?? CURRENT;
}

export function selectionCardId(project: Project, step: Step, selection: StepSelection): string {
  if (selection.kind === 'named' && step.options.some((option) => option.id === selection.optionId)) return selection.optionId;
  if (selection.kind === 'variation') return selection.options.some((option) => option.id === selection.optionId) ? selection.optionId : 'as-it-was';
  return appliedCardId(project, step);
}

export function selectionProject(project: Project, step: Step, selection: StepSelection): Project {
  if (selection.kind === 'named' && step.options.some((option) => option.id === selection.optionId)) return pick(project, step.id, selection.optionId);
  if (selection.kind === 'variation') {
    const option = selection.options.find((option) => option.id === selection.optionId);
    return option ? pickValues(project, step.id, { ...selection.originValues, ...option.values }) : selectionProject(project, step, selection.origin);
  }
  return keep(project, step.id);
}

export function standardSelection(selection: StepSelection): StepSelection {
  return selection.kind === 'variation' ? standardSelection(selection.origin) : selection;
}

export function cardSelection(step: Step, selection: StepSelection, cardId: string): StepSelection {
  if (selection.kind === 'variation' && (cardId === 'as-it-was' || selection.options.some((option) => option.id === cardId))) return { ...selection, optionId: cardId };
  if (step.options.some((option) => option.id === cardId)) return { kind: 'named', optionId: cardId };
  return { kind: 'none' };
}
