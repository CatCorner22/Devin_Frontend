# FRAMEWORK — kit repairs (pull request 9)

Form required by section 7. A superseded line is marked `(superseded <date> → <ID>)` and stays.

## 1. CRITERIA

See `AUDIT-LOG.md` entry E-19 (`CRITERIA`, `PROPOSED`, C1 to C12) and each later `CRITERIA` and `CRITERIA-CHANGE` entry. Those entries control.

## 2. Architecture decisions

| ID | Decision | Log entry |
|---|---|---|
| D-001 | The run starts on work that exists: the kit repairs on branch `devin/1795542703-kit-minors`. Reports of the 4 review sessions started before E-1 are inputs, not audits of this run. | E-8 |
| D-002 | No change to the DELIVERABLE between E-1 and the USER's answer to the S6 card, except work that no pending answer can change (rule 23.5). | E-8 |
| D-003 | The judge's report of the second review names what WU-1 repairs; this run's AUDITORS check the repairs. | E-18 |
| D-004 | Local runs with Chromium revision 1255 count as EVIDENCE; CI is the control. | E-18 |
| D-005 | The run covers WU-1 and WU-2 on pull request 9 and does not start M5. (superseded 2026-11-24 → E-59: the run covers one WORK UNIT, WU-1; within pull request 9 no milestone starts; after it, M5 to M7 start by the USER's approval) | E-18 |

## 3. Naming conventions

- The repository's defined terms (`CLAUDE.md`, table "Defined terms") keep their 1 meaning each.
- Findings of the repository's own log keep the IDs `KIT-<n>`; FINDINGS of this run are `F-<n>`. A row of `redteam/FINDINGS.md` that comes from the second review cites the judge's finding ID.
- A finding of a page check has 1 of 4 statuses, spelled as in `packages/kit/src/shapes.ts` line 10: `fails`, `holds`, `not-applicable`, `could-not-measure`. (superseded 2026-11-24 → E-37: the earlier line named 3 statuses in other spellings.)
- Dates are ISO (2026-11-24). Counts of tests are copied from command output.
- "Base" is commit 9e50434. "Audited commit" and "delivered commit" are defined in E-35.

## 4. Contracts

| Provider | Consumer | What is promised |
|---|---|---|
| `packages/kit/src/shapes.ts` | `src/data/`, `src/logic/`, `src/page-checks/` | the types of a rule and a finding, and the 4 statuses |
| `packages/kit/src/index.ts` | `apps/studio/e2e/kit.e2e.ts`, a later Fitter | the joined rules (`KIT_RULES`), the page checks, `grade`, `repairPlan`, `receipt` (superseded 2026-11-25 → E-144 to E-148) |
| `packages/kit/src/index.ts` | `apps/studio/e2e/kit.e2e.ts`, `packages/kit/test/`, a later Fitter | the joined rules (`KIT_RULES`), `grade`, `repairPlan`, `receipt`, `designId`, the Brief, duel and blind-test logic; no page check |
| `packages/kit/src/page-checks/index.ts` | `apps/studio/e2e/kit.e2e.ts`, `packages/kit/test/kit.test.ts`, `packages/kit/README.md` example | the page checks, imported from this file directly |
| `packages/kit/src/logic/designId.ts` | `packages/kit/src/index.ts` | the design ID of a set of tokens |
| `scripts/audit.mjs` | CI (`.github/workflows/ci.yml`), `scripts/test/audit.test.mjs` | exit code 0 only when `npm audit` lists no advisory of high or critical severity outside the exception list |
| `vitest.config.ts` | `npm test` | the list of unit-test files, with `scripts/test/` |
| `packages/kit/src/page-checks/` | `packages/kit/src/logic/judge.ts` (`grade`, `repairPlan`, `receipt`) | a list of findings, each with a rule ID and 1 of the 4 statuses |
| `packages/kit/fixtures/` | `apps/studio/e2e/kit.e2e.ts`, `packages/kit/README.md` example | 1 page built with care and pages with planted defects |
| `packages/kit` | `redteam/FINDINGS.md`, `PROGRESS.md`, pull request 9 text, `packages/kit/README.md` | behavior that each written statement describes |
| the judge report (`evidence/second-review/judge-report.md`) | WU-1, `redteam/FINDINGS.md` | the confirmed findings, each with an ID, a class and reproduction steps |

## 5. File ownership

| Path | BUILDER | AUDITORS |
|---|---|---|
| `packages/kit/**`, `apps/studio/e2e/kit.e2e.ts` | ORCHESTRATOR | the 8 roles of the audit round |
| `redteam/FINDINGS.md`, `PROGRESS.md`, `packages/kit/README.md`, pull request 9 text | ORCHESTRATOR | the 8 roles of the audit round |
| `hinshitsu/kit-repairs/**` | ORCHESTRATOR | final AUDITOR |
| `DECISIONS.md` (D63), `docs/owner-instructions.md`, `docs/research/11-north-star-gap-2026-11-24.md`, `redteam/reports/2026-11-24-kit2-charter.md` (added 2026-11-25 → E-144 to E-148) | ORCHESTRATOR | the 8 roles of the audit round |
| `.github/workflows/ci.yml`, `package.json`, `scripts/audit.mjs`, `scripts/test/audit.test.mjs`, `vitest.config.ts`, `apps/studio/e2e/studio.e2e.ts` (added 2026-11-25 → E-144 to E-148) | ORCHESTRATOR | the 8 roles of the audit round |

`DECISIONS.md` (superseded 2026-11-24 → E-37: removed from this table; the run adds no decision record of the repository). (superseded 2026-11-25 → E-144 to E-148): the run added D63, and the table above holds `DECISIONS.md` again.

## 6. WORK UNITS

| ID | Content | Status | LENS memo | Swarm reports |
|---|---|---|---|---|
| WU-1 | The module `packages/kit` with its browser test: repairs of what the second review confirms, 1 commit per repair with its test | pending | `memos/lens-recipient-experience-WU-1.md` | `audits/WU-1-*.md` (superseded 2026-11-25 → E-144 to E-148) |
| WU-2 | The records: `redteam/FINDINGS.md`, `PROGRESS.md`, `packages/kit/README.md`, pull request 9 text | pending | `memos/lens-minimal-viable-sequence-WU-2.md` | `audits/WU-2-*.md` (superseded 2026-11-25 → E-144 to E-148) |
| WU-1 | One WORK UNIT, as entry E-64 and the scopes in `prompts/WU1-*.md` define it: the module `packages/kit` with its browser test, the scripts and settings named in section 5, and the records. A repair and its test may lie in 2 commits; the row in `redteam/FINDINGS.md` names the commit of the repair. | under audit (S7) | `memos/lens-recipient-experience.md`, `memos/lens-minimal-viable-sequence.md` | `audits/WU1-*.md` (the spelling `WU1` is the one in use for file names) |

Order: the judge report is saved in the RUN FOLDER → the USER answers the S6 card → WU-1 → WU-2 → the head is frozen as the audited commit → C4, C5 and C6 are tested 1 time → delivery. WU-2 takes its counts from WU-1. (superseded 2026-11-25 → E-144 to E-148: the run holds one WORK UNIT. Present order: WU-1 → the audits and re-audits of WU-1 → the head is frozen as the audited commit → C4, C5 and C6 are tested 1 time → delivery.)

## 7. Existing implementations checked

| Looked for | Where | Result |
|---|---|---|
| a RUN FOLDER of an earlier hinshitsu run | `ls hinshitsu/` at the repository root | not found before this run |
| a findings log | `redteam/FINDINGS.md` | found; this run adds no second log of repository findings |

<!-- from the log: start -->
Rebuilt by `scripts/hinshitsu_log.py state`. Do not edit between the marks.
- Newest CRITERIA entry: E-60 (FROZEN)
<!-- from the log: end -->
