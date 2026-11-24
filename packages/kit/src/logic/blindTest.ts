// The blind test: reviewers see pages one at a time, not knowing which were built from a Prescription and which by skilled people,
// and say for each "made by a person" or "made by AI". This file counts the answers. See blind-test/PROTOCOL.md.
export interface BlindAnswer { reviewer: string; page: string; madeBy: 'tool' | 'person'; judgedPerson: boolean }
export interface Share { answers: number; judgedPerson: number; share: number; low: number; high: number }
export interface BlindScore { tool: Share; person: Share; difference: number; differenceLow: number; differenceHigh: number; reviewers: number; pages: number; statement: string }

const Z = 1.96; // 95 in 100

/** A share with its range of doubt (the Wilson interval, 95 in 100). */
export function shareOf(judgedPerson: number, answers: number): Share {
  if (!Number.isInteger(judgedPerson) || !Number.isInteger(answers) || judgedPerson < 0 || answers < 0 || judgedPerson > answers) throw new RangeError('shareOf needs whole numbers with 0 <= judgedPerson <= answers');
  if (answers === 0) return { answers, judgedPerson, share: 0, low: 0, high: 1 };
  const p = judgedPerson / answers;
  const denominator = 1 + (Z * Z) / answers;
  const middle = (p + (Z * Z) / (2 * answers)) / denominator;
  const half = (Z * Math.sqrt((p * (1 - p)) / answers + (Z * Z) / (4 * answers * answers))) / denominator;
  return { answers, judgedPerson, share: p, low: Math.max(0, middle - half), high: Math.min(1, middle + half) };
}

/**
 * The score. "Indistinguishable" is never proven; the most a test can say is that it found no difference and how large a
 * difference it could have missed. The range treats each answer as independent, which overstates certainty when few reviewers
 * give many answers each; the statement says so.
 */
export function blindScore(answers: readonly BlindAnswer[]): BlindScore {
  const group = (madeBy: 'tool' | 'person'): Share => { const own = answers.filter((a) => a.madeBy === madeBy); return shareOf(own.filter((a) => a.judgedPerson).length, own.length); };
  const tool = group('tool');
  const person = group('person');
  const reviewers = new Set(answers.map((a) => a.reviewer)).size;
  const pages = new Set(answers.map((a) => a.page)).size;
  const difference = person.share - tool.share;
  // The range of the difference is built from the two Wilson ranges (Newcombe's method). Unlike the simpler formula, it keeps
  // its width when a share is 0% or 100%, so a few unanimous answers cannot pass for certainty (finding F-17 of 2026-11-18).
  const both = tool.answers > 0 && person.answers > 0;
  const differenceLow = both ? Math.max(-1, difference - Math.hypot(person.share - person.low, tool.high - tool.share)) : -1;
  const differenceHigh = both ? Math.min(1, difference + Math.hypot(person.high - person.share, tool.share - tool.low)) : 1;
  const pct = (n: number): string => `${Math.round(n * 100)}%`;
  const tooFew = tool.answers < 30 || person.answers < 30 || reviewers < 5;
  const statement = tool.answers === 0 || person.answers === 0
    ? 'The test needs answers on both kinds of page.'
    : `${tooFew ? 'Too few answers or reviewers for a firm result (at least 5 reviewers and 30 answers on each kind of page). ' : ''}Reviewers judged ${pct(tool.share)} of the tool-built pages and ${pct(person.share)} of the person-made pages to be made by a person. ${differenceLow > 0 ? `${tooFew ? 'In these answers the reviewers' : 'They'} told the two apart: the difference is between ${pct(differenceLow)} and ${pct(differenceHigh)}.` : differenceHigh < 0 ? 'They judged the tool-built pages to be person-made more often than the person-made ones.' : `The test found no clear difference; the true difference could be as large as ${Math.max(1, Math.ceil(Math.max(Math.abs(differenceLow), Math.abs(differenceHigh)) * 100))}%. This does not show that the two kinds are the same.`} The range treats every answer as independent, so it is too narrow when few reviewers give many answers.`;
  return { tool, person, difference, differenceLow, differenceHigh, reviewers, pages, statement };
}
