// The shapes that every part of the kit shares. A rule is a data record; a page check reads a drawn page and returns findings.
// Code in `data/` and `logic/` is pure: no browser, no network, no clock. Code in `page-checks/` works on one page and uses no network. A check is not a silent reader: `focusIsVisible` moves the focus to each control, so the page's own handlers run, and some checks add a style or a probe element and remove it again. Run the checks on a copy of the page that nobody uses, and run `focusIsVisible` last.
import { z } from 'zod';

/** How strong the evidence behind a rule is. The same three grades as the Catalog. */
export const EVIDENCE = ['measured', 'convention', 'expert-opinion'] as const;
/** How the builder knows what a source says: read the page itself, read only its abstract, saw only a search snippet, or the builder's own judgment. */
export const SOURCE_BASES = ['read', 'abstract', 'snippet', 'builder'] as const;
export const RULE_GROUPS = ['neuro', 'state', 'behavior', 'craft', 'tell', 'fit'] as const;
export const FINDING_STATUSES = ['fails', 'holds', 'not-applicable', 'could-not-measure'] as const;

export const sourceRefSchema = z.strictObject({
  title: z.string().min(3),
  url: z.url().optional(),
  section: z.string().min(1).optional(),
  basis: z.enum(SOURCE_BASES),
});

const checkSchema = z.discriminatedUnion('kind', [
  /** A program measures it on the drawn page: `fn` names a function in `page-checks/`. */
  /** `also` names further functions that measure the same rule in another way; a checker runs them all. */
  z.strictObject({ kind: z.literal('page-check'), fn: z.string().regex(/^[a-z][A-Za-z0-9]+$/), also: z.array(z.string().regex(/^[a-z][A-Za-z0-9]+$/)).optional() }),
  /** A program measures it by pressing keys: `walk` names a scripted walk in `data/walks.ts`. */
  z.strictObject({ kind: z.literal('walk'), walk: z.string().regex(/^[a-z][a-z0-9-]+$/) }),
  /** Only a person can judge it: `ask` is the question to put to that person. */
  z.strictObject({ kind: z.literal('person'), ask: z.string().min(10) }),
]);

export const ruleRecordSchema = z.strictObject({
  /** Stable and never reused. */
  id: z.string().regex(/^[a-z][a-z0-9]*(-[a-z0-9]+)*$/),
  group: z.enum(RULE_GROUPS),
  /** A floor cannot be switched off. A warning warns and never forbids. */
  level: z.enum(['floor', 'rule', 'warning']),
  /** The rule in plain words, one sentence. */
  plain: z.string().min(15),
  /** What goes wrong for a person without it. */
  why: z.string().min(15),
  appliesWhen: z.string().min(5).optional(),
  check: checkSchema,
  evidence: z.enum(EVIDENCE),
  sources: z.array(sourceRefSchema).min(1),
  /** The date on which the builder last compared the record with its sources (ISO). */
  reviewed: z.iso.date(),
});

export type Evidence = (typeof EVIDENCE)[number];
export type SourceBasis = (typeof SOURCE_BASES)[number];
export type RuleGroup = (typeof RULE_GROUPS)[number];
export type SourceRef = z.infer<typeof sourceRefSchema>;
export type RuleRecord = z.infer<typeof ruleRecordSchema>;

/** One result of one check. A check returns at least one finding, so that "holds" is a statement and not a silence. */
export interface Finding {
  ruleId: string;
  status: (typeof FINDING_STATUSES)[number];
  /** A short description of the element: tag, class, and the start of its text. */
  where?: string;
  /** The value found, with its unit. */
  measured?: string;
  /** The value required. */
  required?: string;
  /** One plain sentence for whoever repairs the page. */
  fix?: string;
}
export const findingSchema = z.strictObject({
  ruleId: z.string(),
  status: z.enum(FINDING_STATUSES),
  where: z.string().optional(),
  measured: z.string().optional(),
  required: z.string().optional(),
  fix: z.string().optional(),
});
