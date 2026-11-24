import type { RuleRecord, SourceRef } from '../shapes.js';

const own: SourceRef = { title: 'The plan of this tool (PLAN.md, section 4.5: token fit)', basis: 'builder' };
const reviewed = '2026-11-18';

export const FIT_RULES: readonly RuleRecord[] = [
  { id: 'fit-colors', group: 'fit', level: 'rule', plain: 'Every color on the page is a color of the design.', why: 'A color from outside the design is where a build starts to drift from what the owner chose.', check: { kind: 'page-check', fn: 'tokenFit' }, evidence: 'expert-opinion', sources: [own], reviewed },
  { id: 'fit-fonts', group: 'fit', level: 'rule', plain: 'Every typeface on the page is a typeface of the design.', why: 'A fallback typeface changes the whole character of the page, often without anyone noticing why.', check: { kind: 'page-check', fn: 'tokenFit' }, evidence: 'expert-opinion', sources: [own], reviewed },
  { id: 'fit-radii', group: 'fit', level: 'rule', plain: 'Every corner radius on the page is a radius of the design.', why: 'Corners of many sizes make the parts look as if they came from different pages.', check: { kind: 'page-check', fn: 'tokenFit' }, evidence: 'expert-opinion', sources: [own], reviewed },
  { id: 'fit-unused-color', group: 'fit', level: 'warning', plain: 'The page uses every color of the design.', why: 'A color that is never used may mean that a part carries the wrong color.', check: { kind: 'page-check', fn: 'tokenFit' }, evidence: 'expert-opinion', sources: [own], reviewed },
];
