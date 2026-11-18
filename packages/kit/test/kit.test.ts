import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  KIT_RULES, NEURO_QUESTIONS, PLACEHOLDER_PHRASES, REPAIR_ROUNDS, STATE_LOOK, STATE_SHEET, STATES,
  blindScore, checkBrief, comparePixels, designId, dialogWalk, differences, grade, isFairDuel, placeholderIn, preferences,
  receipt, receiptText, repairPlan, ruleRecordSchema, shareOf, tabOrderWalk, tabsWalk,
  type BlindAnswer, type Finding, type RuleRecord,
} from '../src/index.js';
import * as pageChecks from '../src/page-checks/index.js';

const root = join(import.meta.dirname, '..', 'src');
const files = (dir: string): string[] => readdirSync(dir).flatMap((name) => { const path = join(dir, name); return statSync(path).isDirectory() ? files(path) : [path]; });
const sources = files(root).map((path) => ({ path: path.slice(root.length + 1), text: readFileSync(path, 'utf8') }));
const checkNames = Object.keys(pageChecks);

describe('rule records', () => {
  it('every record has the required shape', () => {
    for (const rule of KIT_RULES) expect(ruleRecordSchema.safeParse(rule).error?.issues ?? [], rule.id).toEqual([]);
  });
  it('no two records share an id', () => {
    const ids = KIT_RULES.map((rule) => rule.id);
    expect(ids.filter((id, i) => ids.indexOf(id) !== i)).toEqual([]);
  });
  it('the id of a record starts with the name of its group', () => {
    const prefix: Record<string, string[]> = { neuro: ['neuro-'], state: ['state-'], behavior: ['behavior-'], craft: ['craft-'], tell: ['tell-'], fit: ['fit-'] };
    for (const rule of KIT_RULES) expect(prefix[rule.group]?.some((p) => rule.id.startsWith(p)), rule.id).toBe(true);
  });
  it('every page check that a record names exists, and every page check is named by a record', () => {
    const named = new Set(KIT_RULES.flatMap((rule) => (rule.check.kind === 'page-check' ? [rule.check.fn] : [])));
    expect([...named].filter((fn) => !checkNames.includes(fn))).toEqual([]);
    expect(checkNames.filter((fn) => !named.has(fn))).toEqual([]);
  });
  it('every walk that a record names exists', () => {
    const walks = [dialogWalk('#a', '#b'), tabsWalk(['#a', '#b']), tabOrderWalk('#a', ['#b'])];
    for (const rule of KIT_RULES) if (rule.check.kind === 'walk') { const name = rule.check.walk; expect(walks.find((w) => w.id === name)?.ruleId, rule.id).toBe(rule.id); }
  });
  it('a warning is never a floor, and a tell is always a warning', () => {
    for (const rule of KIT_RULES) if (rule.group === 'tell') expect(rule.level, rule.id).toBe('warning');
  });
  it('no record claims that a source was read unless it names where', () => {
    for (const rule of KIT_RULES) for (const source of rule.sources) if (source.basis === 'read') expect(source.url, rule.id).toBeDefined();
  });
  it('the questions each change one thing and offer 3 or 4 choices', () => {
    expect(NEURO_QUESTIONS.length).toBe(4);
    for (const q of NEURO_QUESTIONS) { expect(q.choices.length, q.id).toBeGreaterThanOrEqual(3); expect(q.choices.length, q.id).toBeLessThanOrEqual(4); expect(new Set(q.choices.map((c) => c.id)).size, q.id).toBe(q.choices.length); }
  });
  it('the state sheet uses only known states, and every state has a look', () => {
    for (const [part, states] of Object.entries(STATE_SHEET)) for (const state of states) expect(STATES, part).toContain(state);
    for (const state of STATES) expect(STATE_LOOK[state].length).toBeGreaterThan(20);
  });
});

describe('the kit stands alone', () => {
  it('imports nothing but zod and its own files', () => {
    const bad: string[] = [];
    for (const { path, text } of sources) for (const match of text.matchAll(/from\s+'([^']+)'/g)) { const from = match[1] ?? ''; if (from !== 'zod' && !(from.startsWith('.') && !from.includes('../../'))) bad.push(`${path}: ${from}`); }
    expect(bad).toEqual([]);
  });
  it('the pure part names no browser object, no network call, no clock, and no chance', () => {
    const bad: string[] = [];
    for (const { path, text } of sources) {
      if (path.startsWith('page-checks')) continue;
      const code = text.split('\n').filter((line) => !/^\s*(\/\/|\*|\/\*)/.test(line)).join('\n');
      for (const word of ['document.', 'window.', 'Document', 'fetch(', 'Date.now', 'new Date', 'Math.random', 'localStorage', 'process.']) if (code.includes(word)) bad.push(`${path}: ${word}`);
    }
    expect(bad).toEqual([]);
  });
  it('no file turns text into markup or into code, and no page check calls the network', () => {
    const bad: string[] = [];
    for (const { path, text } of sources) for (const word of ['innerHTML', 'outerHTML', 'insertAdjacentHTML', 'eval(', 'new Function', 'fetch(', 'XMLHttpRequest', 'apca']) if (text.includes(word)) bad.push(`${path}: ${word}`);
    expect(bad).toEqual([]);
  });
  it('no rule text claims that output meets a standard', () => {
    const bad = KIT_RULES.filter((rule) => /\b(accessible|compliant|compliance)\b/i.test(`${rule.plain} ${rule.why}`)).map((rule) => rule.id);
    expect(bad).toEqual([]);
    expect(receiptText(receipt([], KIT_RULES))).not.toMatch(/\b(is accessible|compliant)\b/i);
  });
  it('a page check file imports types only, so each function can travel into a page as text', () => {
    for (const { path, text } of sources) if (path.startsWith('page-checks') && !path.endsWith('index.ts')) for (const line of text.split('\n')) if (/^import\s/.test(line)) expect(line, path).toMatch(/^import type /);
  });
  it('the placeholder list of the page check equals the list of the Brief', () => {
    const text = sources.find((s) => s.path === join('page-checks', 'tells.ts'))?.text ?? '';
    const list = /const phrases = \[(.*)\];/.exec(text)?.[1] ?? '';
    const inCheck = [...list.matchAll(/'((?:[^'\\]|\\.)*)'/g)].map((m) => (m[1] ?? '').replace(/\\'/g, '\''));
    expect(inCheck).toEqual([...PLACEHOLDER_PHRASES]);
  });
});

const rule = (id: string, level: RuleRecord['level'], group: RuleRecord['group'] = 'craft', kind: 'page-check' | 'person' = 'page-check'): RuleRecord => ({
  id, group, level, plain: `The rule ${id} in plain words.`, why: 'Something goes wrong without it.',
  check: kind === 'person' ? { kind, ask: 'Does it look right to you?' } : { kind, fn: 'someCheck' },
  evidence: 'expert-opinion', sources: [{ title: 'A test record', basis: 'builder' }], reviewed: '2026-11-18',
});
const RULES = [rule('floor-a', 'floor'), rule('floor-b', 'floor'), rule('fit-a', 'rule', 'fit'), rule('craft-a', 'rule'), rule('tell-a', 'warning', 'tell'), rule('person-a', 'floor', 'neuro', 'person')];
const holds = (ruleId: string): Finding => ({ ruleId, status: 'holds' });
const fails = (ruleId: string, where = 'p'): Finding => ({ ruleId, status: 'fails', where, fix: `Fix ${ruleId}.` });
const allHold = RULES.filter((r) => r.check.kind !== 'person').map((r) => holds(r.id));

describe('grade', () => {
  it('a failed floor gives "Below floor", whatever else holds', () => {
    expect(grade([...allHold, fails('floor-a')], RULES).grade).toBe('Below floor');
  });
  it('an unmeasured floor gives "Not graded", never a pass', () => {
    expect(grade([], RULES).grade).toBe('Not graded');
    expect(grade([holds('floor-a'), { ruleId: 'floor-b', status: 'could-not-measure' }], RULES)).toMatchObject({ grade: 'Not graded', unmeasuredFloors: ['floor-b'] });
  });
  it('a failed rule gives "Meets floor"; a failed warning leaves "Crafted"', () => {
    expect(grade([...allHold, fails('craft-a')], RULES).grade).toBe('Meets floor');
    expect(grade([...allHold, fails('tell-a')], RULES).grade).toBe('Crafted');
    expect(grade(allHold, RULES).grade).toBe('Crafted');
  });
  it('a floor that only a person can check does not block the grade, and the reason says a person must still check', () => {
    expect(grade(allHold, RULES).reason).toMatch(/person must still check/);
  });
});

describe('repair plan', () => {
  it('orders failed floors first, then mismatches with the design, then other rules, then warnings', () => {
    const plan = repairPlan([[fails('tell-a'), fails('craft-a'), fails('fit-a'), fails('floor-b')]], RULES);
    expect(plan.items.map((item) => item.ruleId)).toEqual(['floor-b', 'fit-a', 'craft-a', 'tell-a']);
    expect(plan).toMatchObject({ round: 1, stop: false });
  });
  it('counts an item as fixed only when the newest check no longer reports it', () => {
    const plan = repairPlan([[fails('floor-a'), fails('craft-a')], [fails('craft-a')]], RULES);
    expect(plan.fixedSinceLastRound).toEqual(['floor-a|p']);
    expect(plan.stillOpen).toEqual(['craft-a|p']);
    expect(plan.round).toBe(2);
  });
  it(`stops after ${REPAIR_ROUNDS} repair rounds and lists what is open`, () => {
    const rounds = Array.from({ length: REPAIR_ROUNDS + 1 }, () => [fails('craft-a')]);
    const plan = repairPlan(rounds, RULES);
    expect(plan).toMatchObject({ stop: true, items: [], stillOpen: ['craft-a|p'] });
    expect(repairPlan(rounds.slice(0, REPAIR_ROUNDS), RULES).stop).toBe(false);
  });
  it('stops when nothing fails, and when no check has run', () => {
    expect(repairPlan([allHold], RULES)).toMatchObject({ stop: true, items: [] });
    expect(repairPlan([], RULES)).toMatchObject({ stop: true, round: 0 });
  });
});

describe('receipt', () => {
  it('keeps the three lists apart', () => {
    const r = receipt([fails('floor-a'), holds('fit-a'), { ruleId: 'craft-a', status: 'could-not-measure', measured: 'No window.' }], RULES);
    expect(r.measured.map((line) => line.ruleId)).toEqual(['floor-a', 'fit-a']);
    expect(r.notMeasured.map((line) => line.ruleId)).toEqual(['floor-b', 'craft-a', 'tell-a']);
    expect(r.forAPerson[0]).toBe('Does it look right to you?');
    expect(r.forAPerson.length).toBeGreaterThan(3);
    const text = receiptText(r);
    expect(text.indexOf('MEASURED BY A PROGRAM')).toBeLessThan(text.indexOf('NOT MEASURED'));
    expect(text).toMatch(/does not state that the page meets any standard/);
  });
  it('a check that did not run is listed as not measured, not as held', () => {
    expect(receipt([], RULES).measured).toEqual([]);
  });
});

describe('design ID', () => {
  it('is stable, ignores order and spacing, and changes with one value', () => {
    const a = designId({ '--color-ink': '#111', '--radius': '8px' });
    expect(a).toMatch(/^rx-[0-9a-f]{8}$/);
    expect(designId({ '--radius': ' 8px', '--color-ink': '#111 ' })).toBe(a);
    expect(designId({ '--color-ink': '#112', '--radius': '8px' })).not.toBe(a);
    expect(designId({})).toMatch(/^rx-[0-9a-f]{8}$/);
  });
  it('keeps a name and its value apart', () => {
    expect(designId({ a: 'b:c' })).not.toBe(designId({ 'a:b': 'c' }));
  });
});

describe('picture comparison', () => {
  it('finds no difference between equal pictures and a full difference between black and white', () => {
    const black = new Uint8Array([0, 0, 0, 255, 0, 0, 0, 255]);
    const white = new Uint8Array([255, 255, 255, 255, 255, 255, 255, 255]);
    expect(comparePixels(black, black)).toEqual({ meanDifference: 0, changedShare: 0 });
    expect(comparePixels(black, white)).toEqual({ meanDifference: 255, changedShare: 1 });
    expect(comparePixels(black, new Uint8Array([0, 0, 0, 255, 255, 255, 255, 255])).changedShare).toBe(0.5);
  });
  it('refuses pictures of different size, and accepts empty ones', () => {
    expect(() => comparePixels(new Uint8Array(4), new Uint8Array(8))).toThrow(/differ in size/);
    expect(() => comparePixels(new Uint8Array(3), new Uint8Array(3))).toThrow(/four bytes/);
    expect(comparePixels(new Uint8Array(0), new Uint8Array(0)).changedShare).toBe(0);
  });
});

describe('duels', () => {
  it('a fair duel differs in exactly one decision', () => {
    expect(isFairDuel({ corners: 'round', color: 'blue' }, { corners: 'square', color: 'blue' })).toBe(true);
    expect(isFairDuel({ corners: 'round', color: 'blue' }, { corners: 'square', color: 'red' })).toBe(false);
    expect(isFairDuel({ corners: 'round' }, { corners: 'round' })).toBe(false);
    expect(differences({ a: 1 }, { a: 1, b: 2 })).toEqual(['b']);
  });
  it('counts wins and losses for each value', () => {
    const p = preferences([{ decision: 'corners', picked: 'round', rejected: 'square' }, { decision: 'corners', picked: 'round', rejected: 'square' }, { decision: 'corners', picked: 'square', rejected: 'round' }]);
    expect(p).toEqual([{ decision: 'corners', value: 'round', wins: 2, losses: 1, share: 2 / 3 }, { decision: 'corners', value: 'square', wins: 1, losses: 2, share: 1 / 3 }]);
    expect(preferences([])).toEqual([]);
    expect(() => preferences([{ decision: 'corners', picked: 'round', rejected: 'round' }])).toThrow();
  });
});

describe('blind test', () => {
  const answers = (madeBy: 'tool' | 'person', yes: number, total: number): BlindAnswer[] => Array.from({ length: total }, (_, i) => ({ reviewer: `r${i % 6}`, page: `${madeBy}-${i % 5}`, madeBy, judgedPerson: i < yes }));
  it('gives a share with a range of doubt that holds the share', () => {
    const s = shareOf(8, 10);
    expect(s.share).toBe(0.8);
    expect(s.low).toBeGreaterThan(0.44); expect(s.low).toBeLessThan(0.55);
    expect(s.high).toBeGreaterThan(0.9); expect(s.high).toBeLessThan(1);
    expect(shareOf(0, 0)).toMatchObject({ low: 0, high: 1 });
  });
  it('says so when reviewers tell the two kinds apart', () => {
    const score = blindScore([...answers('tool', 6, 60), ...answers('person', 54, 60)]);
    expect(score.differenceLow).toBeGreaterThan(0);
    expect(score.statement).toMatch(/told the two apart/);
  });
  it('never says "indistinguishable"; it says how large a difference it could have missed', () => {
    const score = blindScore([...answers('tool', 30, 60), ...answers('person', 31, 60)]);
    expect(score.statement).toMatch(/found no clear difference; the true difference could be as large as \d+%/);
    expect(score.statement).not.toMatch(/indistinguishable/i);
  });
  it('warns when there are too few answers, and asks for both kinds of page', () => {
    expect(blindScore([...answers('tool', 2, 4), ...answers('person', 2, 4)]).statement).toMatch(/^Too few/);
    expect(blindScore(answers('tool', 2, 4)).statement).toMatch(/both kinds/);
    expect(blindScore([]).reviewers).toBe(0);
  });
});

describe('the Brief', () => {
  const good = {
    businessName: 'Harbor Street Plumbing', whatItDoes: 'We repair and install pipes, heaters, and drains in homes around Portland.', audience: 'Homeowners with an urgent leak', mainJob: 'Call us for a repair today', headline: 'A plumber at your door within two hours',
    services: [{ name: 'Leak repair', description: 'We find the leak and stop it the same day.' }, { name: 'Water heaters', description: 'We replace a broken heater within one working day.' }, { name: 'Drains', description: 'We clear blocked drains without digging up the yard.' }],
    contact: { phone: '503 867 5309' }, proof: [{ text: 'They came at midnight and the floor was dry by one.', from: 'Dana R., Sellwood' }],
    voice: { tone: 'friendly', length: 'brief', stance: 'confident' }, wordsToAvoid: ['solutions'],
  };
  it('accepts real content', () => { expect(checkBrief(good)).toEqual([]); });
  it('names the field that still holds a placeholder', () => {
    expect(checkBrief({ ...good, headline: 'Your tagline here' })).toMatchObject([{ field: 'headline' }]);
    expect(checkBrief({ ...good, services: [...good.services.slice(0, 2), { name: 'More', description: 'Lorem ipsum dolor sit amet.' }] })).toMatchObject([{ field: 'services.2.description' }]);
    expect(placeholderIn('In today’s fast-paced world')).toBe('in today\'s fast-paced');
    expect(placeholderIn('A plumber at your door')).toBeNull();
  });
  it('names missing and malformed fields, and a word the owner banned', () => {
    expect(checkBrief({}).length).toBeGreaterThan(5);
    expect(checkBrief(null)).toMatchObject([{ field: 'brief' }]);
    expect(checkBrief({ ...good, contact: {} })).toMatchObject([{ field: 'contact' }]);
    expect(checkBrief({ ...good, services: good.services.slice(0, 2) })).toMatchObject([{ field: 'services' }]);
    expect(checkBrief({ ...good, headline: 'Plumbing solutions at your door' })).toMatchObject([{ field: 'headline', problem: expect.stringContaining('solutions') }]);
    expect(checkBrief({ ...good, extra: 1 }).length).toBe(1);
  });
});

describe('walks', () => {
  it('a dialog walk opens, stays inside, closes, and returns', () => {
    const steps = dialogWalk('#open', '#box', 2).steps;
    expect(steps[0]).toEqual({ do: 'focus', on: '#open' });
    expect(steps.at(-1)).toEqual({ do: 'expect-focus-on', on: '#open' });
    expect(steps.filter((s) => s.do === 'expect-focus-inside').length).toBe(4);
  });
  it('a tabs walk needs two tabs and wraps round', () => {
    expect(() => tabsWalk(['#a'])).toThrow();
    expect(tabsWalk(['#a', '#b']).steps).toContainEqual({ do: 'expect-attribute', on: '#a', name: 'aria-selected', value: 'true' });
  });
});
