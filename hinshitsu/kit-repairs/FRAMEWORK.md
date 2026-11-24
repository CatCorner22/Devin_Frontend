# FRAMEWORK — kit repairs (pull request 9)

Form required by section 7. A superseded line is marked `(superseded <date> → <ID>)` and stays.

## 1. CRITERIA

No `CRITERIA` entry exists yet. The CRITERIA are written as `PROPOSED` at S4 and the entry that freezes them at S6 controls.

## 2. Architecture decisions

| ID | Decision | Log entry |
|---|---|---|
| D-001 | The run starts on work that exists: the kit repairs on branch `devin/1795542703-kit-minors`. Reports of the 4 review sessions started before E-1 are inputs, not audits of this run. | E-2 |
| D-002 | No change to the DELIVERABLE between E-1 and the USER's answer to the S6 card, except work that no pending answer can change (rule 23.5). | E-7 |

## 3. Naming conventions

- The repository's defined terms (`CLAUDE.md`, table "Defined terms") keep their 1 meaning each.
- Findings of the repository's own log keep the IDs `KIT-<n>`; FINDINGS of this run are `F-<n>`.
- A page check returns findings with the status `holds`, `fails` or `could not measure`.
- Dates are ISO (2026-11-24). Counts of tests are copied from command output.

## 4. Contracts

| Provider | Consumer | What is promised |
|---|---|---|
| `packages/kit/src/data/` | `packages/kit/src/logic/`, `packages/kit/src/page-checks/` | rule records with id, kind (floor or not), how measured |
| `packages/kit/src/page-checks/` | `packages/kit/src/logic/grade.ts`, `repairPlan.ts`, `receipt.ts` | a list of findings, each with rule id and status |
| `packages/kit/src/page-checks/` | `apps/studio/e2e/kit.e2e.ts` | functions that take a `Document` and run inside a page |
| `packages/kit` | `redteam/FINDINGS.md`, `PROGRESS.md`, pull request 9 text, `packages/kit/README.md` | behavior that each written statement describes |

## 5. File ownership

| Path | BUILDER | AUDITORS |
|---|---|---|
| `packages/kit/**`, `apps/studio/e2e/kit.e2e.ts` | ORCHESTRATOR | the 8 roles of section 13 |
| `redteam/FINDINGS.md`, `PROGRESS.md`, `DECISIONS.md`, `packages/kit/README.md`, pull request 9 text | ORCHESTRATOR | the 8 roles of section 13 |
| `hinshitsu/kit-repairs/**` | ORCHESTRATOR | final AUDITOR (section 17) |

## 6. WORK UNITS

| ID | Content | Status | LENS memo | Swarm reports |
|---|---|---|---|---|
| WU-1 | The module `packages/kit` with its browser test: repairs of what the second review confirms | pending | `memos/` (S5) | `audits/WU-1-*.md` |
| WU-2 | The records: `redteam/FINDINGS.md`, `PROGRESS.md`, `packages/kit/README.md`, pull request 9 text | pending | `memos/` (S5) | `audits/WU-2-*.md` |

## 7. Existing implementations checked

| Looked for | Where | Result |
|---|---|---|
| a RUN FOLDER of an earlier hinshitsu run | `ls hinshitsu/` at the repository root | not found before this run |
| a findings log | `redteam/FINDINGS.md` | found; this run adds no second log of repository findings |

<!-- from the log: start -->
Rebuilt by `scripts/hinshitsu_log.py state`. Do not edit between the marks.
- Newest CRITERIA entry: E-19 (PROPOSED)
<!-- from the log: end -->
