// Tests of the dependency audit (scripts/audit.mjs) with canned reports in the place of npm.
import { describe, expect, it } from 'vitest';
import { ALL_PACKAGES, audit, check, serious } from '../audit.mjs';

const clean = { vulnerabilities: {} };
const high = { vulnerabilities: { lodash: { via: [{ name: 'lodash', severity: 'high', url: 'https://github.com/advisories/GHSA-35jh-r3h4-6jhm', title: 'Command Injection in lodash' }, 'other-package'] }, wrapper: { via: ['lodash'] } } };
const low = { vulnerabilities: { tiny: { via: [{ name: 'tiny', severity: 'moderate', url: 'https://github.com/advisories/GHSA-aaaa-bbbb-cccc', title: 'Small' }] } } };
/** A stand-in for npm: the report for the page's packages, the report for all packages, and a record of the calls. */
const npmOf = (page, all, calls = []) => (args) => { calls.push(args); return JSON.stringify(args.includes('--omit=dev') ? page : all); };

describe('the dependency audit', () => {
  it('second review, F-30: part 2 names every kind of package itself, so a setting from outside cannot leave the tools out', () => {
    const calls = [];
    check(npmOf(clean, clean, calls));
    expect(calls).toEqual([['audit', '--json', '--omit=dev'], ['audit', '--json', '--include=dev', '--include=optional', '--include=peer']]);
    expect(ALL_PACKAGES).toContain('--include=dev');
  });

  it('second review, F-32: a high advisory in a tool fails; a recorded exception lets it pass until its date', () => {
    expect(check(npmOf(clean, clean)).problems).toEqual([]);
    expect(check(npmOf(clean, low)).problems).toEqual([]);
    expect(check(npmOf(clean, high)).problems).toEqual(['GHSA-35jh-r3h4-6jhm (lodash, high): Command Injection in lodash']);
    expect(check(npmOf(high, high)).problems[0]).toMatch(/^In a package that the page carries: GHSA-35jh-r3h4-6jhm/);
    const exception = [{ id: 'GHSA-35jh-r3h4-6jhm', package: 'lodash', reason: 'A tool only.', until: '2026-12-31' }];
    expect(check(npmOf(clean, high), exception, '2026-12-01')).toEqual({ problems: [], notes: ['Excepted until 2026-12-31: GHSA-35jh-r3h4-6jhm (lodash, high). A tool only.'] });
    expect(check(npmOf(clean, high), exception, '2027-01-01').problems[0]).toMatch(/ended on 2026-12-31/);
    // An exception never covers a package that the page carries, and a dead exception fails.
    expect(check(npmOf(high, high), exception, '2026-12-01').problems).toHaveLength(1);
    expect(check(npmOf(clean, clean), exception, '2026-12-01').problems[0]).toMatch(/matches no advisory any more/);
  });

  it('second review, F-32: one advisory that many packages inherit is one row', () => {
    expect(serious(high)).toEqual([{ id: 'GHSA-35jh-r3h4-6jhm', package: 'lodash', severity: 'high', title: 'Command Injection in lodash' }]);
  });

  it('second review, F-32: a report of an error is no clean result, and npm\'s exit with findings is still read', () => {
    expect(() => audit([], () => JSON.stringify({ error: { code: 'ENOLOCK', summary: 'no lock file' } }))).toThrow(/gave no result/);
    expect(() => audit([], () => JSON.stringify({}))).toThrow(/gave no result/);
    expect(() => audit([], () => { throw new Error('no network'); })).toThrow(/no network/);
    expect(serious(audit([], () => { throw Object.assign(new Error('exit 1'), { stdout: JSON.stringify(high) }); }))).toHaveLength(1);
  });
});
