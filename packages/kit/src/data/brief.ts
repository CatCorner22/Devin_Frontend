// The Brief: the owner's own content. Generic words are the clearest mark of a machine-made page, so the check refuses placeholders.
import { z } from 'zod';
import { placeholderIn } from './placeholders.js';

const words = (min: number, max: number) => z.string().trim().min(min).max(max);

export const briefSchema = z.strictObject({
  businessName: words(2, 80),
  /** What the business does, in one sentence. */
  whatItDoes: words(15, 200),
  /** Who the page is for. */
  audience: words(5, 200),
  /** The one thing a visitor should do on the page. */
  mainJob: words(5, 120),
  headline: words(5, 120),
  services: z.array(z.strictObject({ name: words(2, 60), description: words(10, 240) })).min(3).max(8),
  contact: z.strictObject({ phone: words(5, 30).optional(), email: z.email().optional(), address: words(5, 200).optional() }).refine((c) => c.phone !== undefined || c.email !== undefined || c.address !== undefined, 'Give at least one way to reach the business.'),
  /** Real proof: a customer's words, a number, a client's name. */
  proof: z.array(z.strictObject({ text: words(10, 300), from: words(2, 80).optional() })).min(1).max(6),
  voice: z.strictObject({ tone: z.enum(['formal', 'friendly']), length: z.enum(['brief', 'detailed']), stance: z.enum(['modest', 'confident']) }),
  wordsToAvoid: z.array(words(2, 40)).max(30),
});
export type Brief = z.infer<typeof briefSchema>;

export interface BriefProblem { field: string; problem: string }

const at = (input: unknown, path: readonly PropertyKey[]): unknown => path.reduce<unknown>((value, key) => (typeof value === 'object' && value !== null ? (value as Record<PropertyKey, unknown>)[key] : undefined), input);
const wholeWord = (text: string, word: string): boolean => new RegExp(`(^|[^\\p{L}\\p{N}])${word.trim().toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}($|[^\\p{L}\\p{N}])`, 'u').test(text.toLowerCase());

/** One problem of the schema in plain words. */
function plain(issue: z.core.$ZodIssue, input: unknown): string {
  if (issue.code === 'invalid_type') return at(input, issue.path) === undefined ? 'This is missing.' : `This must be ${issue.expected === 'string' ? 'text' : issue.expected === 'array' ? 'a list' : issue.expected === 'object' ? 'a group of fields' : `of the kind "${issue.expected}"`}.`;
  if (issue.code === 'too_small') return issue.origin === 'array' ? `Give at least ${String(issue.minimum)} of these.` : `This is too short: write at least ${String(issue.minimum)} letters.`;
  if (issue.code === 'too_big') return issue.origin === 'array' ? `Give at most ${String(issue.maximum)} of these.` : `This is too long: write at most ${String(issue.maximum)} letters.`;
  if (issue.code === 'unrecognized_keys') return `The Brief has no field named ${issue.keys.map((key) => `"${key}"`).join(', ')} here.`;
  if (issue.code === 'invalid_format') return 'This is not an email address.';
  if (issue.code === 'invalid_value') return `This must be one of: ${issue.values.map(String).join(', ')}.`;
  return issue.message;
}

/**
 * Checks a Brief. The result lists every field that is missing or malformed, and every text that still holds a placeholder or a
 * word from the owner's own list of words to avoid. The second pass reads whatever text is there, even when another field is
 * wrong, so one visit shows every problem. An empty list means the Brief is usable.
 */
export function checkBrief(input: unknown): BriefProblem[] {
  const parsed = briefSchema.safeParse(input);
  const problems: BriefProblem[] = parsed.success ? [] : parsed.error.issues.map((issue) => ({ field: issue.path.join('.') || 'brief', problem: plain(issue, input) }));
  const avoid = at(input, ['wordsToAvoid']);
  const banned = Array.isArray(avoid) ? avoid.filter((word): word is string => typeof word === 'string' && word.trim().length >= 2) : [];
  const look = (field: string, value: unknown): void => {
    if (typeof value === 'string') {
      const hit = placeholderIn(value);
      if (hit) problems.push({ field, problem: `This still holds placeholder or stock wording ("${hit}"). Write your own words.` });
      const word = banned.find((candidate) => wholeWord(value, candidate));
      if (word) problems.push({ field, problem: `This uses "${word}", which is on your list of words to avoid.` });
    } else if (Array.isArray(value)) value.forEach((item, i) => { look(`${field}.${i}`, item); });
    else if (typeof value === 'object' && value !== null) for (const [key, item] of Object.entries(value)) look(`${field}.${key}`, item);
  };
  for (const field of ['businessName', 'whatItDoes', 'audience', 'mainJob', 'headline', 'services', 'contact', 'proof']) look(field, at(input, [field]));
  return problems;
}
