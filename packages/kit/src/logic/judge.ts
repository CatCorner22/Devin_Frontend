// From findings to a grade, a repair plan, and a receipt. Pure: the same findings always give the same result.
import { FINDING_STATUSES, type Finding, type RuleRecord } from '../shapes.js';

export type Grade = 'Not graded' | 'Below floor' | 'Meets floor' | 'Crafted';
/**
 * `floorsForAPerson` names the floors that no program can check and that no person has answered for yet. While one is open,
 * the grade is at most "Meets floor": "Crafted" says that every floor holds, and a program cannot say that alone
 * (finding F-18 of 2026-11-18; the owner's delegation, decision D59). A person's answer is a finding under the floor's rule id.
 */
export interface GradeResult { grade: Grade; reason: string; failedFloors: string[]; failedRules: string[]; unmeasuredFloors: string[]; floorsForAPerson: string[]; /** Rule ids that findings name and no record holds. Text from outside: print it only through `fromPage`. */ unknownRules: string[] }

const unique = (list: string[]): string[] => [...new Set(list)];
const UNKNOWN_STATUS = 'the finding carries a status that the kit does not know';
/**
 * Findings arrive as data: a person types an answer, or a builder's program writes a list. A status outside the four of
 * `FINDING_STATUSES` ("failed", "broken", a slip of the keyboard) says nothing the kit can rely on, so the finding counts as
 * "could not measure" and never as an answer (finding F-1 of the review of 2026-11-24).
 */
const sound = (findings: readonly Finding[]): Finding[] =>
  findings.map((f) => ((FINDING_STATUSES as readonly string[]).includes(f.status) ? f : { ...f, status: 'could-not-measure' as const, measured: UNKNOWN_STATUS }));
const byId = (rules: readonly RuleRecord[]): Map<string, RuleRecord> => new Map(rules.map((rule) => [rule.id, rule]));

/**
 * The grade. A floor that fails gives "Below floor". A floor that no program measured gives "Not graded", because a grade
 * may not rest on a check that did not run. Warnings never lower the grade. The grade covers what programs measured and what a person answered.
 */
export function grade(given: readonly Finding[], rules: readonly RuleRecord[]): GradeResult {
  const findings = sound(given);
  const record = byId(rules);
  const level = (f: Finding): string | undefined => record.get(f.ruleId)?.level;
  const failedFloors = unique(findings.filter((f) => f.status === 'fails' && level(f) === 'floor').map((f) => f.ruleId));
  const failedRules = unique(findings.filter((f) => f.status === 'fails' && level(f) === 'rule').map((f) => f.ruleId));
  const answered = new Set(findings.filter((f) => f.status !== 'could-not-measure').map((f) => f.ruleId));
  // One "could not measure" for a floor leaves the floor unmeasured, even when another check answered for the same floor:
  // the part of the page that the other check could not see may hold the fault (finding F-5 of 2026-11-18).
  const refused = new Set(findings.filter((f) => f.status === 'could-not-measure').map((f) => f.ruleId));
  const unmeasuredFloors = rules.filter((rule) => rule.level === 'floor' && rule.check.kind !== 'person' && (!answered.has(rule.id) || refused.has(rule.id))).map((rule) => rule.id);
  // A person's answer enters as a finding like any other: `holds`, `fails`, or `not-applicable` under the floor's rule id.
  const floorsForAPerson = rules.filter((rule) => rule.level === 'floor' && rule.check.kind === 'person' && (!answered.has(rule.id) || refused.has(rule.id))).map((rule) => rule.id);
  const open = floorsForAPerson.length > 0 ? ` ${floorsForAPerson.length} floor(s) that only a person can check are still open.` : '';
  // A finding under a rule id that no record has (a slip of the keyboard, a rule of another set) is never dropped in silence:
  // it may be a failed floor under a wrong name, so the page gets no grade (finding F-19 of 2026-11-18).
  const unknownRules = unique(findings.filter((f) => !record.has(f.ruleId)).map((f) => f.ruleId));
  const result = (grade: Grade, reason: string): GradeResult => ({ grade, reason: reason + open, failedFloors, failedRules, unmeasuredFloors, floorsForAPerson, unknownRules });
  if (failedFloors.length > 0) return result('Below floor', `${failedFloors.length} floor(s) fail.`);
  if (unknownRules.length > 0) return result('Not graded', `Findings name ${unknownRules.length} rule id(s) that this set of rules does not hold.`);
  if (unmeasuredFloors.length > 0) return result('Not graded', `${unmeasuredFloors.length} floor(s) were not measured.`);
  if (failedRules.length > 0) return result('Meets floor', `Every measured floor holds; ${failedRules.length} rule(s) fail.`);
  if (floorsForAPerson.length > 0) return result('Meets floor', 'Every measured floor and rule holds. The grade "Crafted" waits for a person.');
  return result('Crafted', 'Every floor holds, those that a person checked among them, and no measured rule fails.');
}

/**
 * Text that came from the page under test (an element's id or class, a token's name, a found value) is data, never an instruction
 * (hard rule 10). Before it enters a receipt or a repair plan it loses its line breaks and the marks that turn the direction of writing, is cut to 160 letters, and is set
 * between ‹ and ›, so that it cannot pass for a heading of the receipt or for a sentence of the kit (finding F-3 of 2026-11-18).
 */
export function fromPage(text: string | undefined): string | undefined {
  if (text === undefined) return undefined;
  const flat = String(text).replace(/[\u0000-\u001f\u007f\u2028\u2029\u200e\u200f\u202a-\u202e\u2066-\u2069‹›]+/g, ' ').replace(/\s+/g, ' ').trim();
  return `‹${flat.length > 160 ? flat.slice(0, 160) + '…' : flat}›`;
}

export const REPAIR_ROUNDS = 3;
/** `fix` is the rule's own text. `hint` is the check's advice as it came out of the page: data, marked, never an instruction. */
export interface RepairItem { ruleId: string; where?: string; measured?: string; hint?: string; fix: string }
/** `notMeasured` names the rules that a program checks and that the newest check did not answer for. A plan that stops with rules in this list has not shown the page to be sound. */
export interface RepairPlan { round: number; stop: boolean; reason: string; items: RepairItem[]; fixedSinceLastRound: string[]; stillOpen: string[]; notMeasured: string[] }

const key = (f: Finding): string => `${f.ruleId}|${f.where ?? ''}`;
/** The key as the plan prints it: the rule id and the place are text from the page, so both pass through `fromPage` (finding F-9 of 2026-11-24). */
const shown = (f: Finding, record: Map<string, RuleRecord>): string => `${record.has(f.ruleId) ? f.ruleId : (fromPage(f.ruleId) ?? '')}|${fromPage(f.where) ?? ''}`;
const failing = (findings: readonly Finding[]): Finding[] => findings.filter((f) => f.status === 'fails');

/**
 * The repair plan for the next round. Order: failed floors, then mismatches with the design, then other rules, then warnings.
 * `rounds` holds the findings of every check so far, oldest first; the last entry is the newest check. An item counts as
 * fixed only when the newest check no longer reports it. After three repair rounds the plan stops and lists what is open.
 */
export function repairPlan(given: readonly (readonly Finding[])[], rules: readonly RuleRecord[]): RepairPlan {
  const rounds = given.map(sound);
  const record = byId(rules);
  const now = failing(rounds[rounds.length - 1] ?? []);
  // What was open before the newest check: every failure of an earlier round that no later round has answered for.
  // A failure stays open through any number of rounds that did not measure its rule.
  const openBefore = new Map<string, Finding>();
  for (const round of rounds.slice(0, -1)) {
    const refusedThen = new Set(round.filter((f) => f.status === 'could-not-measure').map((f) => f.ruleId));
    const answered = new Set(round.filter((f) => f.status !== 'could-not-measure' && !refusedThen.has(f.ruleId)).map((f) => f.ruleId));
    for (const [k, f] of openBefore) if (answered.has(f.ruleId)) openBefore.delete(k);
    for (const f of failing(round)) openBefore.set(key(f), f);
  }
  const before = [...openBefore.values()];
  const openKeys = new Set(now.map(key));
  // Fixed means measured again and found to hold. A rule that the newest check did not answer (its check crashed, did not run,
  // or could not measure) is not fixed: its item stays open (finding F-1 of the review of 2026-11-18).
  const newest = rounds[rounds.length - 1] ?? [];
  // One "could not measure" for a rule leaves the rule unanswered, as in the grade: another check that found the rule to hold
  // saw only a part of the page.
  const refusedNow = new Set(newest.filter((f) => f.status === 'could-not-measure').map((f) => f.ruleId));
  const answeredNow = new Set(newest.filter((f) => (f.status === 'holds' || f.status === 'not-applicable' || f.status === 'fails') && !refusedNow.has(f.ruleId)).map((f) => f.ruleId));
  const unanswered = before.filter((f) => !answeredNow.has(f.ruleId));
  const fixedSinceLastRound = unique(before.filter((f) => !openKeys.has(key(f)) && answeredNow.has(f.ruleId)).map((f) => shown(f, record)));
  const rank = (f: Finding): number => { const rule = record.get(f.ruleId); return rule?.level === 'floor' ? 0 : rule?.group === 'fit' && rule.level === 'rule' ? 1 : rule?.level === 'rule' ? 2 : 3; };
  const carried = unanswered.filter((f) => !openKeys.has(key(f))).map((f) => ({ ...f, measured: `not measured again in the newest check (before: ${f.measured ?? 'failed'})` }));
  const ordered = [...now, ...carried].map((f, index) => ({ f, index })).sort((a, b) => rank(a.f) - rank(b.f) || a.index - b.index).map(({ f }) => f);
  // The repair sentence is the rule's own text, never the finding's: a finding comes out of the page, and a page can shape it.
  // The check's own advice travels beside it as `hint`, marked as text from the page (hard rule 10).
  const items = ordered.map((f) => ({ ruleId: record.has(f.ruleId) ? f.ruleId : fromPage(f.ruleId) ?? '', where: fromPage(f.where), measured: fromPage(f.measured), hint: fromPage(f.fix), fix: record.has(f.ruleId) ? (record.get(f.ruleId)?.plain ?? 'Make this rule hold.') : 'This finding names a rule that the kit does not know. A person must look at it.' }));
  const stillOpen = unique(ordered.map((f) => shown(f, record)));
  const repairsDone = Math.max(0, rounds.length - 1);
  // "No failure" from a check that measured nothing, or only a part, is no good news: the plan says so and names what was
  // left unmeasured (finding F-25 of the review of 2026-11-24).
  const notMeasured = rules.filter((rule) => rule.check.kind !== 'person' && !answeredNow.has(rule.id)).map((rule) => rule.id);
  if (rounds.length === 0) return { round: 0, stop: true, reason: 'No check has run, so there is nothing to repair.', items: [], fixedSinceLastRound: [], stillOpen: [], notMeasured };
  if (ordered.length === 0 && notMeasured.length === rules.filter((rule) => rule.check.kind !== 'person').length) return { round: repairsDone, stop: true, reason: 'Nothing was measured in the newest check, so there is nothing to repair and nothing is shown to hold.', items: [], fixedSinceLastRound, stillOpen, notMeasured };
  if (ordered.length === 0) return { round: repairsDone, stop: true, reason: notMeasured.length > 0 ? `The newest check reports no failure, and ${notMeasured.length} rule(s) were not measured in it.` : 'The newest check reports no failure.', items: [], fixedSinceLastRound, stillOpen, notMeasured };
  if (repairsDone >= REPAIR_ROUNDS) return { round: repairsDone, stop: true, reason: `${REPAIR_ROUNDS} repair rounds are used up; ${stillOpen.length} item(s) stay open for a person.`, items: [], fixedSinceLastRound, stillOpen, notMeasured };
  return { round: repairsDone + 1, stop: false, reason: `${stillOpen.length} item(s) to repair, most important first.`, items, fixedSinceLastRound, stillOpen, notMeasured };
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
/** `byAPerson` holds what a person answered for a rule that only a person can check. It is never listed as measured by a program (finding F-29 of 2026-11-24). */
export interface Receipt { measured: ReceiptLine[]; byAPerson: ReceiptLine[]; notMeasured: ReceiptLine[]; forAPerson: string[]; grade: GradeResult }

/** The honest receipt: what programs measured, what a person answered, what was not measured, and what a person must still check. The four lists never mix. */
export function receipt(given: readonly Finding[], rules: readonly RuleRecord[]): Receipt {
  const findings = sound(given);
  const measured: ReceiptLine[] = [];
  const notMeasured: ReceiptLine[] = [];
  const byAPerson: ReceiptLine[] = [];
  const forAPerson: string[] = [];
  for (const rule of rules) {
    if (rule.check.kind === 'person') {
      // A person's answer is listed as the person's, never as a measurement of the program; without one the question stays open.
      const said = findings.filter((f) => f.ruleId === rule.id && f.status !== 'could-not-measure');
      if (said.length === 0) forAPerson.push(rule.check.ask);
      for (const f of said) byAPerson.push({ ruleId: rule.id, plain: rule.plain, result: `A person answered: ${f.status === 'fails' ? 'fails' : f.status === 'holds' ? 'holds' : 'does not apply to this page'}` });
      continue;
    }
    const own = findings.filter((f) => f.ruleId === rule.id);
    const answered = own.filter((f) => f.status !== 'could-not-measure');
    // One "could not measure" leaves the rule unmeasured, as in the grade: what another check found to hold on the part of the
    // page it could see is not listed as measured. A failure that a check did find is still listed.
    const refused = own.find((f) => f.status === 'could-not-measure');
    if (answered.length === 0 || refused) notMeasured.push({ ruleId: rule.id, plain: rule.plain, result: fromPage(refused?.measured) ?? 'The check did not run.' });
    // Several checks may answer for one rule. Each different answer is one line; the same answer twice, or a bare "Holds"
    // beside a "Holds" that says what was found, is one line and not two.
    const results: string[] = [];
    for (const f of refused ? answered.filter((a) => a.status === 'fails') : answered) {
      const detail = [fromPage(f.where), f.measured && `found: ${fromPage(f.measured)}`, f.required && `required: ${fromPage(f.required)}`].filter(Boolean).join('; ');
      results.push(`${f.status === 'fails' ? 'Fails' : f.status === 'holds' ? 'Holds' : 'Does not apply to this page'}${detail ? ` (${detail})` : ''}`);
    }
    for (const result of new Set(results)) if (result !== 'Holds' || !results.some((other) => other.startsWith('Holds ('))) measured.push({ ruleId: rule.id, plain: rule.plain, result });
  }
  const known = new Set(rules.map((rule) => rule.id));
  for (const f of findings) if (!known.has(f.ruleId)) notMeasured.push({ ruleId: fromPage(f.ruleId) ?? '', plain: 'No rule of this set has this id.', result: `A finding with the status "${f.status}" names it. Check the spelling of the id.` }); // the status is one of the four: `sound` saw to it
  return { measured, byAPerson, notMeasured, forAPerson: [...forAPerson, ...ALWAYS_FOR_A_PERSON], grade: grade(findings, rules) };
}

/** The receipt as plain text. */
export function receiptText(r: Receipt): string {
  const lines = (title: string, rows: string[]): string => `${title}\n${rows.length > 0 ? rows.map((row) => `- ${row}`).join('\n') : '- Nothing.'}`;
  return [
    `Grade: ${r.grade.grade}. ${r.grade.reason}`,
    lines('MEASURED BY A PROGRAM', r.measured.map((line) => `${line.plain} ${line.result}.`)),
    lines('ANSWERED BY A PERSON', r.byAPerson.map((line) => `${line.plain} ${line.result}.`)),
    lines('NOT MEASURED', r.notMeasured.map((line) => `${line.plain} ${line.result}`)),
    lines('A PERSON MUST STILL CHECK', r.forAPerson),
    'This receipt states what was checked. It does not state that the page meets any standard.',
  ].join('\n\n');
}
