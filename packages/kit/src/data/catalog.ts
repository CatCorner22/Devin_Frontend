import { z } from 'zod';
import { ruleRecordSchema, type RuleRecord } from '../shapes.js';
import { CRAFT_RULES } from './craft.js';
import { NEURO_RULES } from './neuro.js';
import { STATE_RULES } from './states.js';

export const catalogEntrySchema = z.strictObject({
  rule: ruleRecordSchema,
  layer: z.enum(['craft', 'floor']),
  floorKind: z.enum(['accessibility', 'security', 'search', 'performance']).optional(),
  publicOnly: z.boolean().optional(),
  setBy: z.array(z.strictObject({ stepId: z.string().min(1), optionIds: z.array(z.string().min(1)).min(1).optional() })).optional(),
  notChecked: z.string().min(20),
}).superRefine((entry, ctx) => {
  if ((entry.layer === 'floor') !== (entry.rule.level === 'floor') || (entry.layer === 'floor') !== (entry.floorKind !== undefined)) ctx.addIssue({ code: 'custom', message: 'A floor has a floor kind and cannot become advice.' });
  if (entry.layer === 'floor' && entry.setBy !== undefined) ctx.addIssue({ code: 'custom', message: 'A Decision cannot remove a floor.' });
});

export type CatalogEntry = z.infer<typeof catalogEntrySchema>;

const reviewed = '2026-11-25';
const local = (file: string, section: string) => ({ title: `Repository research record: ${file}`, section: `${section}; read here, not rechecked against the original sources`, basis: 'abstract' as const });
const deployment = (id: string, plain: string, why: string, ask: string, source: ReturnType<typeof local>): RuleRecord => ({ id, group: 'fit', level: 'floor', plain, why, check: { kind: 'person', ask }, evidence: 'expert-opinion', sources: [source], reviewed });

export const DEPLOYMENT_FLOORS: readonly CatalogEntry[] = [
  { layer: 'floor', floorKind: 'security', rule: deployment('fit-untrusted-text', 'Text from a file or visitor stays text, never instructions or page code.', 'Treating outside text as code can give someone control of the page or mislead the Fitter.', 'Have the Fitter inspect every path from outside text to the page and try text that looks like code. Review the evidence before release.', local('docs/research/01-your-files-master-guide-blueprint-guardrails.md', 'Section 16: script injection defenses')), notChecked: 'A source review and hostile-text trials do not prove that every attack is blocked. A person must review the data paths and any server code.' },
  { layer: 'floor', floorKind: 'security', rule: deployment('fit-security-review', 'Before release, inspect secrets, dependencies and access to stored data.', 'A page that looks correct can still expose private information.', 'Have the Fitter run secret and dependency scans and review who can read or change stored data. A person reviews the results and any untested paths.', local('docs/research/02-your-files-pdfs-and-documents.md', 'Section E: release checks, security scans and data-layer review')), notChecked: 'Scans cannot prove that access rules match the business. A person must review permissions, hosting settings and any server code.' },
  { layer: 'floor', floorKind: 'search', publicOnly: true, rule: deployment('fit-public-search', 'A public page has a descriptive title, a short description, one main heading and its main content in the delivered page.', 'A visitor or search service needs to understand the page before running any page code.', 'Have the Fitter inspect the delivered page: a title of 50 to 60 characters, a description of 150 to 160 characters, one main heading, and the main content. A person reviews whether the words describe the page.', local('docs/research/07-your-five-links.md', 'Section 2: search practices')), notChecked: 'The length targets are advice adopted as a project floor, not a ranking guarantee. A person must check meaning, publication intent and whether search services can reach the deployed page.' },
  { layer: 'floor', floorKind: 'search', publicOnly: true, rule: deployment('fit-public-links', 'A public page has descriptive links and names its preferred public address.', 'Unclear links and several addresses for the same page make the site harder to find and understand.', 'Have the Fitter inspect internal links and the preferred-address mark (canonical tag) on the deployed page. A person confirms the preferred address and any structured facts.', local('docs/research/07-your-five-links.md', 'Section 2: internal links and canonical tags')), notChecked: 'No local page check proves indexing or rank. A person confirms public addresses, crawl permissions and that structured facts are true.' },
  { layer: 'floor', floorKind: 'performance', rule: deployment('fit-page-speed', 'The main content appears within 2.5 seconds, input responds within 200 milliseconds, and layout shifts total no more than 0.1.', 'Slow responses and moving content interrupt reading and make presses land in the wrong place.', 'Have the Fitter gather loading, input and layout-shift evidence (LCP, INP, CLS). A person compares the 75th percentile of real visits with the limits; local trials are provisional, not field results.', local('docs/research/02-your-files-pdfs-and-documents.md', 'Section 7: performance metrics')), notChecked: 'Local measurements do not cover real networks, devices or the 75th percentile of visits. A person must review field measurements after release; until then the field result is not measured.' },
];

const setBy: Record<string, CatalogEntry['setBy']> = {
  'craft-tabular-numerals': [{ stepId: 'numerals', optionIds: ['tabular', 'mono'] }],
  'craft-balanced-headings': [{ stepId: 'heading-treatment' }],
  'craft-nested-radii': [{ stepId: 'radius' }],
  'craft-short-transitions': [{ stepId: 'motion', optionIds: ['subtle', 'expressive'] }],
  'craft-one-type-scale': [{ stepId: 'size-scale' }],
  'craft-dark-theme-designed': [{ stepId: 'theme', optionIds: ['dark'] }],
};

const personChecks: Record<string, string> = {
  'neuro-no-autoplay': 'Try sound and video on real devices. A page scan cannot hear sound started by page code or judge whether a visitor expected it.',
  'neuro-motion-can-stop': 'Try every moving part and its pause control. A scan cannot prove the control stops all movement or find every movement started later.',
  'neuro-no-time-limit': 'Try slow completion, sign-in expiry and server time limits. The page check finds timed reloads only.',
  'neuro-visible-label': 'Read each label and instruction. The program cannot decide whether they explain what the person should enter.',
  'neuro-text-spacing': 'Widen text spacing in the real browser and read every state. A scan cannot prove nothing meaningful disappeared.',
  'neuro-reflow': 'Check all states at enlarged text sizes and on real devices. No sideways scrolling alone does not prove content is readable or complete.',
  'behavior-keyboard-reach': 'Use only the keyboard through every task. The program cannot judge whether the order makes sense or every action works.',
  'behavior-focus-visible': 'Follow the focus through every state. A style change alone does not prove the focus mark is clear or unobscured.',
  'behavior-target-size': 'Try touch controls on a real device. The program cannot judge every exception or whether nearby targets cause mistakes.',
  'behavior-control-name': 'Listen with a screen reader. A nonempty name alone does not prove the name explains the action.',
  'behavior-dialog-marked': 'Listen with a screen reader when the window opens. Marks and a name do not prove its contents and task make sense.',
  'behavior-dialog-keys': 'Try each window with keyboard and screen reader. A scripted walk covers only the controls and states selected for that walk.',
  'craft-picture-alt': 'Review every picture and its text alternative in context. The program cannot decide whether the description is useful or decoration is truly decorative.',
};

export const CATALOG_ENTRIES: readonly CatalogEntry[] = [
  ...[...NEURO_RULES, ...STATE_RULES, ...CRAFT_RULES].filter((rule) => rule.level === 'floor' || rule.group === 'craft').map((rule): CatalogEntry => ({
    rule,
    layer: rule.level === 'floor' ? 'floor' : 'craft',
    ...(rule.level === 'floor' ? { floorKind: 'accessibility' as const } : { setBy: setBy[rule.id] }),
    notChecked: personChecks[rule.id] ?? (rule.check.kind === 'person' ? rule.check.ask : 'A person must inspect the result in context. A page measurement cannot judge meaning, visual balance or whether the detail suits the business.'),
  })),
  ...DEPLOYMENT_FLOORS,
];
