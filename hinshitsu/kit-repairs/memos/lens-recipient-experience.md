8323a0e4e6d14590bcbf71ca9817df03
identifier: devin-8323a0e4e6d14590bcbf71ca9817df03 (session 8323a0e4e6d14590bcbf71ca9817df03)

Read at commit 6b0c2f8. Line numbers are those of the file named. I ran 1 check: the README example, word for word, on `packages/kit/fixtures/good.html` (Vitest, Chromium revision 1255). I did not run `npm run check` or `npm run e2e`.

## What breaks

1. **R2 and R3 cannot reach a grade.** I ran `packages/kit/README.md` lines 38-56 on the page built with care. Result: `"grade":"Not graded"`, `unmeasuredFloors:["behavior-dialog-keys"]`, 30 checks, 11.4 seconds. The program that runs a walk exists only in the test file (`apps/studio/e2e/kit.e2e.ts` line 45); `packages/kit/src/index.ts` exports the walk data, not a runner. README line 64 states the result but names no way out. Reproduce: run the example on `good.html`. No CRITERION tests the example; C7 covers "each number and status" only, though `CONNECTIONS.md` line 29 names this edge.
2. **R1 reads a pull request text that contradicts the records.** The text of pull request 9 says "Minors KIT-25 and KIT-27 to KIT-41 are open" and gives 238 and 371 tests at `b88e6fb`. `PROGRESS.md` line 43 says those minors are repaired and gives 244 and 380. Reproduce: read both. C7 catches this only at delivery; D-002 (`FRAMEWORK.md` line 14) freezes the text until the S6 answer, and O3 (E-12) records 2 unanswered questions, so R1 may decide on the stale text.
3. **R1 gets no promise of a report R1 can use.** E-12 maps O4 ("short reports with links", no code, no path) to C12. C12 tests the record and the script, not length, plain words or links. C1 to C7 name tests that only an AUDITOR can run. Reproduce: read C12 for the words "short", "plain" or "link"; none is there.
4. **Findings that only R1 can settle have no CRITERION.** C1 and C2 cover blocker, major and minor. The first judge also returned "needs human review" rows (`redteam/FINDINGS.md` lines 74-77, KIT-42 to KIT-45). A second-review item of that class may get no row and never reach R1.
5. **R2's first-read section stays stale.** `PROGRESS.md` line 80 ("What the next session should do first") cites CI runs of 2026-11-14; "Waiting on the owner" (lines 142-150) lists neither the merge of pull request 9 nor the milestone-order question. C7 checks only that M4 is current.
6. **R1 and R3 read 1 rule 2 times in the receipt.** "Anything that moves for more than five seconds…" prints 2 times under "MEASURED BY A PROGRAM" (my run's output). No CRITERION covers the receipt text.

## What to cut

- The `docs/research/11…` presence test in C7: the file exists at 6b0c2f8 and the run does not touch it.
- G8's "about 40 files" in the pull request R1 reads (E-13): keep the RUN FOLDER, but the pull request text must tell R1 in 1 line to skip it.

## What to add

- C2: add the class "note / needs human review", each with 1 row marked "Needs the owner" (status word of `redteam/FINDINGS.md` line 9).
- C7: the pull request text is corrected at each push that changes a count or status, not only at delivery; "Waiting on the owner" lists every question the run puts to R1.
- C12: the delivery message holds at most a stated number of words, 1 link per claim, and no step that needs a command.
- An S6 card with 1 default per question (A-3, A-4, G12), so a silent USER does not stall R1's pull request.

## The 1 change this lens insists on

Add a CRITERION of use, 1 test per RECIPIENT, run by an AUDITOR who gets only what that RECIPIENT gets:
- R2 and R3: the README example, run word for word on `good.html`, ends in the grade the README states for it, and the README names the exported way to count the walks (or states that none exists).
- R1: from the pull request text alone, the AUDITOR lists what is repaired, what is open and what R1 must decide; the list equals `redteam/FINDINGS.md`.

## Checked and found sound

- The README example runs to its end with a TypeScript-aware runner, as line 60 says, and the 11 seconds match line 58.
- "Not graded" rather than a pass when a floor did not run (README line 64) held in my run.
- The receipt separates measured, not measured and "a person must still check", and claims no standard.
- C10 matches O1; the status words of C2 match `redteam/FINDINGS.md` line 9.
- `git diff 86287c2..6b0c2f8` outside the RUN FOLDER is empty, so 86287c2 is a fair baseline for C3, C8 and C11.
