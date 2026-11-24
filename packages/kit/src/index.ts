// The pure part of the kit: rule records and logic. The page checks live in `page-checks/` and are imported from there,
// because they need a browser's types and this part does not.
import { CRAFT_RULES, TELL_RULES } from './data/craft.js';
import { FIT_RULES } from './data/fit.js';
import { NEURO_RULES } from './data/neuro.js';
import { STATE_RULES } from './data/states.js';
import type { RuleRecord } from './shapes.js';

export * from './shapes.js';
export * from './data/neuro.js';
export * from './data/states.js';
export * from './data/craft.js';
export * from './data/fit.js';
export * from './data/walks.js';
export * from './data/placeholders.js';
export * from './data/brief.js';
export * from './logic/designId.js';
export * from './logic/judge.js';
export * from './logic/pixels.js';
export * from './logic/duels.js';
export * from './logic/blindTest.js';

/** Every rule of the kit. */
export const KIT_RULES: readonly RuleRecord[] = [...NEURO_RULES, ...STATE_RULES, ...CRAFT_RULES, ...TELL_RULES, ...FIT_RULES];
