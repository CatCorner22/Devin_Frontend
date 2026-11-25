// The dependency audit of CI, with a short list of recorded exceptions.
//
// Why this script exists. `npm audit --audit-level=high` fails on every advisory of high or critical severity, with no
// way to say "the owner has seen this one". On 2026-11-18 an advisory appeared that no version repairs. This script
// keeps the audit and lets the owner record an exception for one advisory at a time (decision D59).
//
// What it checks, in two parts:
//   1. The packages that the Studio's page carries (`npm audit --omit=dev`): no advisory of high or critical severity,
//      and no exception applies here.
//   2. All packages: every advisory of high or critical severity must be in EXCEPTIONS below. The script names every
//      kind of package itself (--include=dev and the others), so that a setting from outside (NODE_ENV=production,
//      or omit=dev in .npmrc) cannot leave the tools out (finding F-30 of the review of 2026-11-24).
//
// What can go wrong. An exception hides an advisory after it starts to matter (a tool begins to read patterns that
// a stranger wrote). Each exception therefore carries its reason and a date on which it ends; after that date the
// audit fails again until a person looks at it. An exception whose advisory no longer appears also fails, so the list
// cannot keep dead rows.
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

// No exception is in force. The one of 2026-11-18 (GHSA-fc5q-39xc-vjpf against picomatch, decision D59) was removed on
// 2026-11-24: `npm audit` no longer lists that advisory for picomatch 4.0.7. A row has the form
// { id: 'GHSA-...', package: 'name', reason: 'why it does not matter here', until: 'YYYY-MM-DD' }.
const EXCEPTIONS = [];

/** The arguments of part 2: every kind of package, whatever npm is set to outside this script. */
export const ALL_PACKAGES = ['--include=dev', '--include=optional', '--include=peer'];

const npm = (args) => execFileSync('npm', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit'] });

/** One run of `npm audit`. `run` starts npm; a test hands in its own. */
export function audit(args, run = npm) {
  let report;
  try {
    report = JSON.parse(run(['audit', '--json', ...args]));
  } catch (error) {
    // npm exits with 1 when it finds anything; the report is still on its standard output.
    if (!error.stdout) throw error;
    report = JSON.parse(error.stdout);
  }
  // A report of an error (no network, no lock file) lists no advisory. It is no clean result: the audit did not run.
  if (report.error || typeof report.vulnerabilities !== 'object' || report.vulnerabilities === null) throw new Error(`npm audit ${args.join(' ')} gave no result: ${JSON.stringify(report.error ?? report).slice(0, 300)}`);
  return report;
}

/** The advisories of high or critical severity in a report: one row for each advisory, not for each package that inherits it. */
export function serious(report) {
  const found = new Map();
  for (const entry of Object.values(report.vulnerabilities ?? {})) {
    for (const via of entry.via) {
      if (typeof via !== 'object' || (via.severity !== 'high' && via.severity !== 'critical')) continue;
      const id = String(via.url).split('/').pop();
      found.set(id, { id, package: via.name, severity: via.severity, title: via.title });
    }
  }
  return [...found.values()];
}

/** Both parts of the audit. It returns the problems and the lines to print; an empty list of problems is a pass. */
export function check(run = npm, exceptions = EXCEPTIONS, today = new Date().toISOString().slice(0, 10)) {
  const problems = [];
  const notes = [];
  for (const a of serious(audit(['--omit=dev'], run))) problems.push(`In a package that the page carries: ${a.id} (${a.package}, ${a.severity}): ${a.title}`);
  const all = serious(audit(ALL_PACKAGES, run));
  for (const a of all) {
    const exception = exceptions.find((e) => e.id === a.id && e.package === a.package);
    if (!exception) problems.push(`${a.id} (${a.package}, ${a.severity}): ${a.title}`);
    else if (today > exception.until) problems.push(`The exception for ${a.id} ended on ${exception.until}. Look for a patched version, or record a new date in DECISIONS.md and here.`);
    else notes.push(`Excepted until ${exception.until}: ${a.id} (${a.package}, ${a.severity}). ${exception.reason}`);
  }
  for (const e of exceptions) if (!all.some((a) => a.id === e.id && a.package === e.package)) problems.push(`The exception for ${e.id} matches no advisory any more. Remove it from scripts/audit.mjs.`);
  return { problems, notes };
}

// The audit runs when this file is started as a script, not when a test imports it.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const { problems, notes } = check();
  for (const note of notes) console.log(note);
  if (problems.length > 0) {
    console.error('Dependency audit failed:');
    for (const p of problems) console.error(`  - ${p}`);
    process.exit(1);
  }
  console.log('Dependency audit: no advisory of high or critical severity outside the recorded exceptions.');
}
