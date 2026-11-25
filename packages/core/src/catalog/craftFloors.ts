import { CATALOG_ENTRIES } from '@refraction/kit';
import { effectiveParams, matchingOptionId, type Project } from '../engine.js';
import { findStep } from './steps.js';

export { CATALOG_ENTRIES, catalogEntrySchema, type CatalogEntry } from '@refraction/kit';

export const CRAFT_LAYER = CATALOG_ENTRIES.filter((entry) => entry.layer === 'craft');
export const FLOORS = CATALOG_ENTRIES.filter((entry) => entry.layer === 'floor');

export function craftFor(project: Project): typeof CRAFT_LAYER {
  return CRAFT_LAYER.filter((entry) => (entry.setBy ?? []).every((ref) => {
    const step = findStep(ref.stepId);
    return step !== undefined && (!ref.optionIds || ref.optionIds.includes(matchingOptionId(effectiveParams(project), step) ?? ''));
  }));
}
