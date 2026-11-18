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

/** Checks a Brief. The result lists every field that is missing, malformed, or still holds a placeholder. An empty list means the Brief is usable. */
export function checkBrief(input: unknown): BriefProblem[] {
  const parsed = briefSchema.safeParse(input);
  if (!parsed.success) return parsed.error.issues.map((issue) => ({ field: issue.path.join('.') || 'brief', problem: issue.message }));
  const problems: BriefProblem[] = [];
  const look = (field: string, text: string | undefined): void => {
    const hit = text === undefined ? null : placeholderIn(text);
    if (hit) problems.push({ field, problem: `This still holds placeholder or stock wording ("${hit}"). Write your own words.` });
  };
  const b = parsed.data;
  look('businessName', b.businessName); look('whatItDoes', b.whatItDoes); look('audience', b.audience); look('mainJob', b.mainJob); look('headline', b.headline);
  b.services.forEach((s, i) => { look(`services.${i}.name`, s.name); look(`services.${i}.description`, s.description); });
  look('contact.phone', b.contact.phone); look('contact.email', b.contact.email); look('contact.address', b.contact.address);
  b.proof.forEach((p, i) => { look(`proof.${i}.text`, p.text); look(`proof.${i}.from`, p.from); });
  for (const [field, text] of [['headline', b.headline], ['whatItDoes', b.whatItDoes]] as const) {
    const banned = b.wordsToAvoid.find((word) => text.toLowerCase().includes(word.toLowerCase()));
    if (banned) problems.push({ field, problem: `This uses "${banned}", which is on your list of words to avoid.` });
  }
  return problems;
}
