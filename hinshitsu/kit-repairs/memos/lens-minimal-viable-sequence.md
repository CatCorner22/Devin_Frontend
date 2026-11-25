d2852c9f69794449a9aa8912f68dabd6
identifier: d2852c9f69794449a9aa8912f68dabd6

Checks I ran at 6b0c2f8: the 3 greps of C8 and C11 over `git diff 86287c2..6b0c2f8` outside the RUN FOLDER, and that diff's file list. I did not run `npm run check`, `npm run e2e`, or `hinshitsu_check.py`.

## What breaks

1. **WU-1 has no content yet, for the USER (R1).** The judge is still running (A-1, E-17; CONNECTIONS.md "judge running"). C1 and C2 have no list, yet the S6 card asks the USER to accept 30 runs (A-4), 10 of them for WU-1 (E-4). Reproduce: `ls hinshitsu/kit-repairs` shows no judge report.
2. **C5 has no WORK UNIT behind it, for the ORCHESTRATOR.** Four Studio tests failed once in a full run, cause unknown (`redteam/FINDINGS.md` row KIT-41; A-8). WU-1 is `packages/kit` and WU-2 is records (FRAMEWORK.md lines 47-48), so no planned work can turn a red C5 green. Reproduce: run `npm run e2e` 3 times, as C5 says.
3. **C12's test is already red, for the final AUDITOR.** E-10 records that `hinshitsu_check.py` reports E-1 as missing its scope and report, and the log is append-only. Reproduce: run the command in C12.
4. **C3 needs 1 commit per repair, and the plan does not say so.** "Reverts each repair commit" fails if 2 repairs share a commit. FRAMEWORK.md section 6 and D-003 are silent on this.
5. **C7 has no edge, for the framework-drift AUDITOR.** `redteam/FINDINGS.md` holds rows back to 2026-11-13 (SEC-01 onward), and "that describes the kit" does not say which rows count.

## What to cut

1. **WU-2's full swarm.** E-4 gives the records unit 1 seeder, 8 AUDITORS and 1 re-audit. C2, C7 and C11 name only 2 roles (framework-drift, language); add correctness. That is 3 AUDITORS and saves about 6 runs.
2. **WU-1's swarm, if the judge confirms 0 blockers and majors.** C1 and C3 are then empty and WU-1 holds only Devin Review inputs (G14). The 2026-11-18 judge confirmed no blocker (`PROGRESS.md` line 40).
3. **C5 and C4 runs per WORK UNIT.** Both test "the delivered commit" only. Run them once, at the final head; each `npm run e2e` takes about 760 seconds (`PROGRESS.md` line 37).
4. **The research-file clause of C7.** `docs/research/11-north-star-gap-2026-11-24.md` is present and no WORK UNIT touches it. Keep it as a 1-line check, not an AUDITOR task.

## What to add

1. **An order line in FRAMEWORK.md section 6:** judge report saved → S6 card → WU-1 (1 commit per repair, test in the same commit) → WU-2 → freeze the head → C4, C5, C6 once → delivery. WU-2 depends on WU-1's counts (CONNECTIONS.md lines 91-92), and any later commit moves "the delivered commit".
2. **An exit for C5 on a failure outside the kit:** state FAIL with the failing test names, or the USER decides. A-8 names the risk; no CRITERION names the exit.
3. **A bound for C7:** rows KIT-* and the rows this run adds.
4. **A stated outcome for C12** given E-10: either the script's E-1 lines are named as known, or C12 is reported FAIL.

## The 1 change this lens insists on

Do not send the S6 card or start WU-1 until the judge report is saved in the RUN FOLDER. Then size WU-1 and the run count from its confirmed list (A-1, D-003, E-4). Until then the plan orders auditors for work of unknown size, possibly none.

## Checked and found sound

- **2 WORK UNITS, no M5** (D-005) is the smallest scope that fits `CLAUDE.md` hard rule 1.
- **D-003:** reusing the 125 attempts instead of a fresh audit saves about 8 runs (E-18).
- **D-004:** CI as the control avoids installing revision 1254.
- **Baseline 86287c2** is an ancestor of 6b0c2f8, and the DELIVERABLE diff between them is empty, so D-002 holds so far.
- **C8 and C11 greps** print nothing at 6b0c2f8, and 0 added lines hold "accessible".
- **C9 and C10** each cost 1 command.
