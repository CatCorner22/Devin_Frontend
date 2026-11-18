// From findings to a grade, a repair plan, and a receipt. Pure: the same findings always give the same result.
import type { Finding, RuleRecord } from '../shapes.js';

export type Grade = 'Not graded' | 'Below floor' | 'Meets floor' | 'Crafted';
export interface GradeResult { grade: Grade; reason: string; failedFloors: string[]; failedRules: string[]; unmeasuredFloors: string[] }

const unique = (list: string[]): string[] => [...new Set(list)];
const byId = (rules: readonly RuleRecord[]): Map<string, RuleRecord> => new Map(rules.map((rule) => [rule.id, rule]));

/**
 * The grade. A floor that fails gives "Below floor". A floor that no program measured gives "Not graded", because a grade
 * may not rest on a check that did not run. Warnings never lower the grade. The grade covers only what programs measured.
 */
export function grade(findings: readonly Finding[], rules: readonly RuleRecord[]): GradeResult {
  const record = byId(rules);
  const level = (f: Finding): string | undefined => record.get(f.ruleId)?.level;
  const failedFloors = unique(findings.filter((f) => f.status === 'fails' && level(f) === 'floor').map((f) => f.ruleId));
  const failedRules = unique(findings.filter((f) => f.status === 'fails' && level(f) === 'rule').map((f) => f.ruleId));
  const answered = new Set(findings.filter((f) => f.status !== 'could-not-measure').map((f) => f.ruleId));
  const unmeasuredFloors = rules.filter((rule) => rule.level === 'floor' && rule.check.kind !== 'person' && !answered.has(rule.id)).map((rule) => rule.id);
  const result = (grade: Grade, reason: string): GradeResult => ({ grade, reason, failedFloors, failedRules, unmeasuredFloors });
  if (failedFloors.length > 0) return result('Below floor', `${failedFloors.length} floor(s) fail.`);
  if (unmeasuredFloors.length > 0) return result('Not graded', `${unmeasuredFloors.length} floor(s) were not measured.`);
  if (failedRules.length > 0) return result('Meets floor', `Every measured floor holds; ${failedRules.length} rule(s) fail.`);
  return result('Crafted', 'Every measured floor and rule holds. A person must still check what no program can.');
}

export const REPAIR_ROUNDS = 3;
export interface RepairItem { ruleId: string; where?: string; measured?: string; fix: string }
export interface RepairPlan { round: number; stop: boolean; reason: string; items: RepairItem[]; fixedSinceLastRound: string[]; stillOpen: string[] }

const key = (f: Finding): string => `${f.ruleId}|${f.where ?? ''}`;
const failing = (findings: readonly Finding[]): Finding[] => findings.filter((f) => f.status === 'fails');

/**
 * The repair plan for the next round. Order: failed floors, then mismatches with the design, then other rules, then warnings.
 * `rounds` holds the findings of every check so far, oldest first; the last entry is the newest check. An item counts as
 * fixed only when the newest check no longer reports it. After three repair rounds the plan stops and lists what is open.
 */
export function repairPlan(rounds: readonly (readonly Finding[])[], rules: readonly RuleRecord[]): RepairPlan {
  const record = byId(rules);
  const now = failing(rounds[rounds.length - 1] ?? []);
  const before = failing(rounds[rounds.length - 2] ?? []);
  const openKeys = new Set(now.map(key));
  // Fixed means measured again and found to hold. A rule that the newest check did not answer (its check crashed, did not run,
  // or could not measure) is not fixed: its item stays open (finding F-1 of the review of 2026-11-18).
  const newest = rounds[rounds.length - 1] ?? [];
  const answeredNow = new Set(newest.filter((f) => f.status === 'holds' || f.status === 'not-applicable' || f.status === 'fails').map((f) => f.ruleId));
  const unanswered = before.filter((f) => !answeredNow.has(f.ruleId));
  const fixedSinceLastRound = unique(before.filter((f) => !openKeys.has(key(f)) && answeredNow.has(f.ruleId)).map(key));
  const rank = (f: Finding): number => { const rule = record.get(f.ruleId); return rule?.level === 'floor' ? 0 : rule?.group === 'fit' && rule.level === 'rule' ? 1 : rule?.level === 'rule' ? 2 : 3; };
  const carried = unanswered.filter((f) => !openKeys.has(key(f))).map((f) => ({ ...f, measured: `not measured again in the newest check (before: ${f.measured ?? 'failed'})` }));
  const ordered = [...now, ...carried].map((f, index) => ({ f, index })).sort((a, b) => rank(a.f) - rank(b.f) || a.index - b.index).map(({ f }) => f);
  const items = ordered.map((f) => ({ ruleId: f.ruleId, where: f.where, measured: f.measured, fix: f.fix ?? record.get(f.ruleId)?.plain ?? 'Make this rule hold.' }));
  const stillOpen = unique(ordered.map(key));
  const repairsDone = Math.max(0, rounds.length - 1);
  if (rounds.length === 0) return { round: 0, stop: true, reason: 'No check has run, so there is nothing to repair.', items: [], fixedSinceLastRound: [], stillOpen: [] };
  if (ordered.length === 0) return { round: repairsDone, stop: true, reason: 'The newest check reports no failure.', items: [], fixedSinceLastRound, stillOpen };
  if (repairsDone >= REPAIR_ROUNDS) return { round: repairsDone, stop: true, reason: `${REPAIR_ROUNDS} repair rounds are used up; ${stillOpen.length} item(s) stay open for a person.`, items: [], fixedSinceLastRound, stillOpen };
  return { round: repairsDone + 1, stop: false, reason: `${stillOpen.length} item(s) to repair, most important first.`, items, fixedSinceLastRound, stillOpen };
}

/** What a person must always check, whatever the programs measured. */
export const ALWAYS_FOR_A_PERSON: readonly string[] = [
  'Read the page aloud. Does every sentence make sense, and is every statement true?',
  'Use the page with a screen reader. Can you find and do the main task?',
  'Use the page with the keyboard only. Can you do the main task without a mouse?',
  'Ask people from the intended audience, including people with ADHD, autism, or dyslexia if they belong to it, to do the main task. Where do they stop or go wrong?',
  'Look at the whole page. Does it look intended, and does it look like this owner and no one else?',
];

export interface ReceiptLine { ruleId: string; plain: string; result: string }
export interface Receipt { measured: ReceiptLine[]; notMeasured: ReceiptLine[]; forAPerson: string[]; grade: GradeResult }

/** The honest receipt: what programs measured, what they could not measure, and what a person must still check. The three lists never mix. */
export function receipt(findings: readonly Finding[], rules: readonly RuleRecord[]): Receipt {
  const measured: ReceiptLine[] = [];
  const notMeasured: ReceiptLine[] = [];
  const forAPerson: string[] = [];
  for (const rule of rules) {
    if (rule.check.kind === 'person') { forAPerson.push(rule.check.ask); continue; }
    const own = findings.filter((f) => f.ruleId === rule.id);
    const answered = own.filter((f) => f.status !== 'could-not-measure');
    if (answered.length === 0) { notMeasured.push({ ruleId: rule.id, plain: rule.plain, result: own[0]?.measured ?? 'The check did not run.' }); continue; }
    for (const f of answered) {
      const detail = [f.where, f.measured && `found: ${f.measured}`, f.required && `required: ${f.required}`].filter(Boolean).join('; ');
      measured.push({ ruleId: rule.id, plain: rule.plain, result: `${f.status === 'fails' ? 'Fails' : f.status === 'holds' ? 'Holds' : 'Does not apply to this page'}${detail ? ` (${detail})` : ''}` });
    }
  }
  return { measured, notMeasured, forAPerson: [...forAPerson, ...ALWAYS_FOR_A_PERSON], grade: grade(findings, rules) };
}

/** The receipt as plain text. */
export function receiptText(r: Receipt): string {
  const lines = (title: string, rows: string[]): string => `${title}\n${rows.length > 0 ? rows.map((row) => `- ${row}`).join('\n') : '- Nothing.'}`;
  return [
    `Grade of the measured part: ${r.grade.grade}. ${r.grade.reason}`,
    lines('MEASURED BY A PROGRAM', r.measured.map((line) => `${line.plain} ${line.result}.`)),
    lines('NOT MEASURED', r.notMeasured.map((line) => `${line.plain} ${line.result}`)),
    lines('A PERSON MUST STILL CHECK', r.forAPerson),
    'This receipt states what was checked. It does not state that the page meets any standard.',
  ].join('\n\n');
}
