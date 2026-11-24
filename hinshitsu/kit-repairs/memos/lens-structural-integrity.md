48b82c9696d94c8c9bc230295bd9f9a4
identifier: 48b82c9696d94c8c9bc230295bd9f9a4

Checked at commit 6b0c2f8. Read-only; no file changed.

## What breaks

1. **Status names do not match the code** — breaks for every AUDITOR who tests the edge "findings with status". <ref_file file="/home/ubuntu/repos/Devin_Frontend/hinshitsu/kit-repairs/FRAMEWORK.md" live="true"/> line 23 names 3 statuses: `holds`, `fails`, `could not measure`. The code has 4, spelled differently: `packages/kit/src/shapes.ts` line 10 (`fails`, `holds`, `not-applicable`, `could-not-measure`). Reproduce: `grep -n FINDING_STATUSES packages/kit/src/shapes.ts`. G1 (E-13) rests on "a status the grade does not know", so the plan's own list must be right.
2. **Contract names 3 files that do not exist** — breaks for the framework-drift AUDITOR. <ref_file file="/home/ubuntu/repos/Devin_Frontend/hinshitsu/kit-repairs/FRAMEWORK.md" live="true"/> line 31 names `grade.ts`, `repairPlan.ts`, `receipt.ts`. All 3 functions live in `packages/kit/src/logic/judge.ts` (lines 19, 68, 118). Reproduce: `ls packages/kit/src/logic`.
3. **The shared shape has no node** — breaks for anyone tracing an edge. <ref_file file="/home/ubuntu/repos/Devin_Frontend/hinshitsu/kit-repairs/CONNECTIONS.md" live="true"/> lines 9–11 draw DATA→LOGIC and CHECKS→LOGIC. In code, neither `logic/` nor `page-checks/` imports `data/`; both import only `../shapes.js`, and `src/index.ts` line 24 joins the rules. Reproduce: `grep -rn "from '\.\./" packages/kit/src/logic packages/kit/src/page-checks`. A change to `shapes.ts` breaks 3 nodes and the map shows none.
4. **The browser test's edge from LOGIC is missing** — `apps/studio/e2e/kit.e2e.ts` line 7 imports `grade`, `receipt`, `repairPlan`, `KIT_RULES`; line 11 reads `packages/kit/fixtures`. <ref_file file="/home/ubuntu/repos/Devin_Frontend/hinshitsu/kit-repairs/CONNECTIONS.md" live="true"/> draws only CHECKS→E2E (line 12). A repair in `judge.ts` can turn the browser test red with no edge to predict it.
5. **The judge report has no edge and no path** — breaks C1 and C2 for the correctness and drift AUDITORS. It is a node "outside the DELIVERABLE" (<ref_file file="/home/ubuntu/repos/Devin_Frontend/hinshitsu/kit-repairs/CONNECTIONS.md" live="true"/>, last table) with no edge to WU-1 or RECORDS, though D-003 makes it the source of both. E-19 says "saved whole in the RUN FOLDER" with no file name; the reviewer inputs sit outside the repository (A-5). C1 and C2 name no join key between a judge finding and a `KIT-<n>` row.
6. **C3's baseline may not hold the repairs** — `git diff --stat 86287c2..6b0c2f8 -- . ':!hinshitsu'` prints nothing, and D-001 says repairs exist already. Repairs made before 86287c2 have no "repair commit" for the adversarial AUDITOR to revert. (Inference: I did not date each repair.)
7. **`SESSION-STATE.md` contradicts itself** — lines 7–8 say CRITERIA E-19 and S5; items 2 and 4 say "none written yet" and "S2". A resumed ORCHESTRATOR reads the wrong state. `COVERAGE-LEDGER.md` line 3 also says "No CRITERION exists yet".
8. **WORK UNITS exceed the glossary** — `GLOSSARY.md` line 31 allows "at most 1 component". WU-1 is 1 module plus 1 test file in another package; WU-2 is 3 documents plus the pull request text (<ref_file file="/home/ubuntu/repos/Devin_Frontend/hinshitsu/kit-repairs/FRAMEWORK.md" live="true"/> lines 47–48).

## What to cut

- `DECISIONS.md` from the ownership table (<ref_file file="/home/ubuntu/repos/Devin_Frontend/hinshitsu/kit-repairs/FRAMEWORK.md" live="true"/> line 40), or add it to WU-2 and C7. It is owned but in no WORK UNIT and no CRITERION.
- The C3 `grep` as written: it already prints 2 lines at both commits (CSS class `.skip`, `kit.e2e.ts` lines 225, 248). Use `\b(it|test|describe)\.(skip|only|todo)`.

## What to add

- Nodes `shapes.ts`, `src/index.ts`, `fixtures/`, CI, and the judge report, each with edges and a "broken when".
- A "CI → RECORDS" edge: C6 and C7 depend on it; the map has no CI node.
- To C1 and C2: the judge report's file path, and the rule that each row cites the judge's finding ID (existing rows do: `redteam/FINDINGS.md` lines 34–40).

## The 1 change this lens insists on

Rewrite <ref_file file="/home/ubuntu/repos/Devin_Frontend/hinshitsu/kit-repairs/FRAMEWORK.md" live="true"/> sections 3–4 and <ref_file file="/home/ubuntu/repos/Devin_Frontend/hinshitsu/kit-repairs/CONNECTIONS.md" live="true"/> from the code: 4 statuses as spelled in `shapes.ts` line 10, `judge.ts` as the consumer, `shapes.ts` as the hub node.

## Checked and found sound

- Severity words in C1 and C2 (blocker, major, minor) match `redteam/FINDINGS.md` line 7.
- `grade` treats `could-not-measure` as unmeasured, `not-applicable` as answered (`judge.ts` lines 24–27, 88).
- The test named on the DATA→CHECKS edge exists (`packages/kit/test/kit.test.ts` line 90).
- `npm run check` and `npm run e2e` exist (`package.json` lines 20, 23). I did not run them.
- 86287c2 is an ancestor of the commit under review.
- C8 and C11 diffs print nothing now.
- `PROGRESS.md` line 82 names M4, not complete; research file 11 is present.
