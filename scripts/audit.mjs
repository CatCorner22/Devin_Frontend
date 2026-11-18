// The dependency audit of CI, with a short list of recorded exceptions.
//
// Why this script exists. `npm audit --audit-level=high` fails on every advisory of high or critical severity, with no
// way to say "the owner has seen this one". On 2026-11-18 an advisory appeared that no version repairs. This script
// keeps the audit and lets the owner record an exception for one advisory at a time (decision D59).
//
// What it checks, in two parts:
//   1. The packages that the Studio's page carries (`npm audit --omit=dev`): no advisory of high or critical severity,
//      and no exception applies here.
//   2. All packages: every advisory of high or critical severity must be in EXCEPTIONS below.
//
// What can go wrong. An exception hides an advisory after it starts to matter (a tool begins to read patterns that
// a stranger wrote). Each exception therefore carries its reason and a date on which it ends; after that date the
// audit fails again until a person looks at it. An exception whose advisory no longer appears also fails, so the list
// cannot keep dead rows.
import { execFileSync } from 'node:child_process';

const EXCEPTIONS = [
  {
    id: 'GHSA-fc5q-39xc-vjpf',
    package: 'picomatch',
    reason: 'A pattern with repeated extglobs can make matching very slow. Only the lint, boundary, build, and test tools use picomatch here, and every pattern they read is written in this repository. The page carries no copy. No patched version existed on 2026-11-18.',
    until: '2026-12-18'
  }
];

function audit(args) {
  try {
    return JSON.parse(execFileSync('npm', ['audit', '--json', ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit'] }));
  } catch (error) {
    // npm exits with 1 when it finds anything; the report is still on its standard output.
    if (error.stdout) return JSON.parse(error.stdout);
    throw error;
  }
}

/** The advisories of high or critical severity in a report: one row for each advisory, not for each package that inherits it. */
function serious(report) {
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

const today = new Date().toISOString().slice(0, 10);
const problems = [];

for (const a of serious(audit(['--omit=dev']))) problems.push(`In a package that the page carries: ${a.id} (${a.package}, ${a.severity}): ${a.title}`);

const all = serious(audit([]));
for (const a of all) {
  const exception = EXCEPTIONS.find((e) => e.id === a.id && e.package === a.package);
  if (!exception) problems.push(`${a.id} (${a.package}, ${a.severity}): ${a.title}`);
  else if (today > exception.until) problems.push(`The exception for ${a.id} ended on ${exception.until}. Look for a patched version, or record a new date in DECISIONS.md and here.`);
  else console.log(`Excepted until ${exception.until}: ${a.id} (${a.package}, ${a.severity}). ${exception.reason}`);
}
for (const e of EXCEPTIONS) if (!all.some((a) => a.id === e.id)) problems.push(`The exception for ${e.id} matches no advisory any more. Remove it from scripts/audit.mjs.`);

if (problems.length > 0) {
  console.error('Dependency audit failed:');
  for (const p of problems) console.error(`  - ${p}`);
  process.exit(1);
}
console.log('Dependency audit: no advisory of high or critical severity outside the recorded exceptions.');
