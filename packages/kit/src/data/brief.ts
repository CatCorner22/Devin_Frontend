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
/** Text of the Brief that a problem sentence repeats (a key, a word to avoid): on one line, without control characters, at most 60 letters. */
const flat = (text: string): string => { const one = text.replace(/[\u0000-\u001f\u007f\u2028\u2029\u200e\u200f\u202a-\u202e\u2066-\u2069]+/g, ' ').replace(/\s+/g, ' ').trim(); return one.length > 60 ? `${one.slice(0, 60)}…` : one; };
const wholeWord = (text: string, word: string): boolean => new RegExp(`(^|[^\\p{L}\\p{N}])${word.trim().toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}($|[^\\p{L}\\p{N}])`, 'u').test(text.toLowerCase());

/** One problem of the schema in plain words. */
function plain(issue: z.core.$ZodIssue, input: unknown): string {
  if (issue.code === 'invalid_type') return at(input, issue.path) === undefined ? 'This is missing.' : `This must be ${issue.expected === 'string' ? 'text' : issue.expected === 'array' ? 'a list' : issue.expected === 'object' ? 'a group of fields' : `of the kind "${issue.expected}"`}.`;
  if (issue.code === 'too_small') return issue.origin === 'array' ? `Give at least ${String(issue.minimum)} of these.` : `This is too short: write at least ${String(issue.minimum)} letters.`;
  if (issue.code === 'too_big') return issue.origin === 'array' ? `Give at most ${String(issue.maximum)} of these.` : `This is too long: write at most ${String(issue.maximum)} letters.`;
  if (issue.code === 'unrecognized_keys') return `The Brief has no field named ${issue.keys.map((key) => `"${flat(key)}"`).join(', ')} here.`;
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
  // The Brief allows at most 30 entries of words to avoid, each of 2 to 40 characters. An entry beyond that is reported by the
  // schema and not searched for.
  const banned = Array.isArray(avoid) ? avoid.slice(0, 30).filter((word): word is string => typeof word === 'string' && word.trim().length >= 2 && word.length <= 40) : [];
  // The second pass reads at most 400 texts, at most 8 levels deep. No valid Brief comes near either number; a file that
  // passes them gets one problem that says so, in place of minutes of work or a crash (finding F-27 of 2026-11-24).
  let read = 0;
  let tooMuch = false;
  const look = (field: string, value: unknown, depth = 0): void => {
    if (tooMuch) return;
    if (depth > 8 || read >= 400) { tooMuch = true; problems.push({ field, problem: 'The Brief holds more here than a Brief can hold, so the rest was not read for placeholder wording or words to avoid.' }); return; }
    if (typeof value === 'string') {
      read++;
      const hit = placeholderIn(value);
      if (hit) problems.push({ field, problem: `This still holds placeholder or stock wording ("${hit}"). Write your own words.` });
      const word = banned.find((candidate) => wholeWord(value, candidate));
      if (word) problems.push({ field, problem: `This uses "${flat(word)}", which is on your list of words to avoid.` });
    } else if (Array.isArray(value)) { for (let i = 0; i < value.length && !tooMuch; i++) look(`${field}.${i}`, value[i], depth + 1); }
    else if (typeof value === 'object' && value !== null) { for (const [key, item] of Object.entries(value)) { if (tooMuch) break; look(`${field}.${key}`, item, depth + 1); } }
  };
  for (const field of ['businessName', 'whatItDoes', 'audience', 'mainJob', 'headline', 'services', 'contact', 'proof']) look(field, at(input, [field]));
  return problems;
}
