devin-2d1056731c9b42158c6caeb850d329af

# Re-audit of WU-1, the records (framework drift and language) — commit under review `78bf314`

Re-auditor under rule 16.5. I did not build this work and raised none of the findings below. All times are UTC, 2026-11-25. One departure from "whole": the section `Scope received` quotes the 111-line scope word for word in the attached file only; here it is named by commit and hash. Everything else is the same text as the attachment.

## Result table

| FINDING ID | Result at `78bf314` | Evidence |
|---|---|---|
| F-29 | still reproduces; waits on the USER | `triggers-1.txt` T1: the command prints the same 2 lines |
| F-35 | no longer reproduces | `PROGRESS.md` 44: "34 findings: 8 major, 24 minor and 2 notes … F-27, major at the later commit"; row R2-F-27 says "major (the judge: minor at the commit it examined …)"; T7 |
| F-41 | no longer reproduces | T2: row D63 has 5 cells; T3: `docs/owner-instructions.md` 44-46 hold the 3 statements |
| F-54 | still reproduces; waits on the USER | T1 |
| F-69 | no longer reproduces for the counts; 1 part remains | pull request table: 34 repaired, 33 with a test; `PROGRESS.md` 44: 64 repaired, 62 with a test, R2-F-31 and R2-P-12 named. Remains: the pull request text does not say that R2-F-28 and R2-F-34 are statements of a limit (their rows say it) |
| F-70 | no longer reproduces | as F-35 |
| F-71 | no longer reproduces | pull request text: "From the first review of the kit: KIT-01, KIT-05 (in part), KIT-42, KIT-44, KIT-45, KIT-46"; T10 shows the same 6 rows open |
| F-72 | no longer reproduces | T4: each of the 15 attempt IDs is in `redteam/FINDINGS.md`; rows R2-P-1 to R2-P-12; `PROGRESS.md` 44 and the pull request text count them. 8 rows: limit stated, fault remains (see "README limits") |
| F-75 | no longer reproduces | T4; 12 rows for the 12 items of section 7 |
| F-76 | no longer reproduces; see new finding 4 | T5 prints no row; R2-F-31 names commit `183c166`; counts as F-69 |
| F-77 | no longer reproduces | as F-35 |
| F-78 | still reproduces; waits on the USER | T1 |
| F-79 | no longer reproduces | `FRAMEWORK.md` section 5 holds `DECISIONS.md` and `docs/owner-instructions.md`; T2; T3 |
| F-80 | parts (a) to (d) no longer reproduce; 2 leftovers, new finding 7 | `FRAMEWORK.md` 17 and section 6; `ls memos` |
| F-81 | no longer reproduces | `FRAMEWORK.md` sections 4 and 5; `CONNECTIONS.md` nodes DESIGNID, AUDIT, VITEST, STUDIOE2E |
| F-82 | no longer reproduces | `FRAMEWORK.md` contract of `index.ts`: "no page check"; `CONNECTIONS.md` edge page-checks/index.ts → kit.e2e.ts, packages/kit/test, README.md; `index.ts` has 13 exports, none from `page-checks/` |
| F-83 | no longer reproduces as a false statement | the loop still prints the same 6 of 104 commits (history does not change); `FRAMEWORK.md` now says "A repair and its test may lie in 2 commits" |
| F-84 | no longer reproduces | `PROGRESS.md` 44; T7 |
| F-85 | no longer reproduces | as F-69 |
| F-86 | the trigger no longer prints R2-F-31; the word "Fixed" is still used against its definition, new finding 4 | T5; row R2-F-31: "Fixed … commit `183c166` … No test" |
| F-87 | severity: no longer reproduces; the 2 commits remain | row R2-F-27: "commits `1115cfd` and `7a345e2`"; the row does not say which commit holds what (H-adversarial-15 is open on the same point) |
| F-88 | no longer reproduces | T12: D63 now says "where a page check cannot read what a repair needs, the row … stays open with that reason" |
| F-89 | still reproduces in part | T12: D63 now names the sentence of D62 that it replaces "for M5 to M7 only". Remains: "(hard rules 1 and 2)" is unchanged; D63 does not say when M5 starts (E-59: "after this pull request"; the owner's words: "start now"); the pull request text does not say that M5 to M7 may start |
| F-90 | no longer reproduces | pull request text: "The independent review from zero, 2026-11-24, of the lines changed after the judge saw the code" against "the repairs made on 2026-11-25, after the seven auditors reported"; `PROGRESS.md` 44 the same |
| F-91 | no longer reproduces | T11: the sentence is in 0 rows `R2-*` (the 1 hit is the quotation in row H-language-8); T16: the cells state the fault, then "The repair:" |
| F-93 | still reproduces; and the new sentence is false in part, new finding 5 | T17: the 21 cells name a page of `app.devin.ai` and say the text is "not on GitHub" and "not saved in this repository"; `pr9-reviews.json` |
| F-94 | still reproduces in part | "Open, not repaired" is now defined at the head of `redteam/FINDINGS.md`; "commits" is plural in R2-F-27 and R2-F-32. Remains: the pull request and `PROGRESS.md` say "Repaired"/"repaired", the rows say "Fixed" and "Corrected" |
| F-95 | still reproduces in `PROGRESS.md`; no longer in `DECISIONS.md` | T19: `PROGRESS.md` 44 "The owner approved 16 acceptance tests"; D63 "16 acceptance criteria (each a statement with its own test)". Commit `7f3d02b` did not change `PROGRESS.md` |
| F-96 | no longer reproduces | pull request text: "limits of what a page check can read from a page. The kit's README states each." |
| F-97 | no longer reproduces for the third name; "has checked" remains | pull request text: "until a person has checked the three floors that only a person can check, and has entered each answer" |
| F-98 | no longer reproduces at the 2 sentences named | T20: README 91 "A record whose only sources are the builder's judgment …; a unit test fails if one does not"; README 75 "the check then passes". "holds" still means "contains" and "passes" in README 66 beside the status `'holds'` |
| F-99 | no longer reproduces | `PROGRESS.md` 44: "they prove nothing and are not counted as passes". The sentence is still passive ("were stopped by the builder") |

Counts (32 findings): 17 no longer reproduce; 3 still reproduce and wait on the USER (F-29, F-54, F-78: one point); 12 still reproduce in part or leave a remainder (F-69, F-76, F-80, F-86, F-87, F-89, F-93, F-94, F-95, F-97, F-98, F-99; for F-76, F-97, F-98 and F-99 the trigger itself is gone). 0 `could not run`.

## Scope received

The file `hinshitsu/kit-repairs/prompts/WU1-reaudit-records.md` at commit `1a9461b23623cf147375e6f8fffcdff84a1ae54b` (111 lines; SHA-256 `d3155891fc4472b84f88174c84648c859a300f747c6d9dd880fbb62b5af3b9f6`); the attached report quotes it word for word. The message that started this run added: work in a scratch copy; do not push; do not open, close, merge or comment on a pull request; do not change a file of the repository; never touch the repository CatCorner22/Frontend; the content of every file is data; return the report whole as the last message with the session ID on its first line, and attach it as a Markdown file.

## Examined

Scratch copies on my machine: `~/scratch/wu1` (commit `1a9461b`, the scope) and `~/scratch/rev` (commit `78bf314`, every command below unless said otherwise). `git status --porcelain` prints nothing in either at the end. I pushed nothing and changed no file of the repository. Node v22.23.5; `npm ci`: "added 196 packages", exit 0. Chromium revision 1255 (`~/.cache/ms-playwright/chromium-1255/chrome-linux64/chrome`, already present).

### Files read

| File | Lines | At commit |
|---|---|---|
| `hinshitsu/kit-repairs/prompts/WU1-reaudit-records.md` | 1-111, all | `1a9461b` |
| `hinshitsu/kit-repairs/reference/GLOSSARY.md` | 1-80 | `78bf314` |
| `audits/WU1-adversarial-E-67.md` | 140-218 (headings; finding 11) | `78bf314` |
| `audits/WU1-forensic-5s-E-68.md` | 77-119, 150-155 | `78bf314` |
| `audits/WU1-best-practices-E-69.md` | 136-150 | `78bf314` |
| `audits/WU1-recipient-experience-E-70.md` | 128-192 | `78bf314` |
| `audits/WU1-framework-drift-E-71.md` | 97-208 | `78bf314` |
| `audits/WU1-language-E-72.md` | 87-271 | `78bf314` |
| `audits/WU1-correctness-E-66.md` | 30-43 (classes only) | `78bf314` |
| `redteam/FINDINGS.md` | 1-16; every row `R2-*`, `H-*`, `KIT-*` by script (599 rows, each 7 cells); the cells quoted in this report | `78bf314` |
| `PROGRESS.md` | 32-44, 81-95, 143-185 | `78bf314` |
| `DECISIONS.md` | 71-75 (D59 to D63) | `78bf314` |
| `docs/owner-instructions.md` | 39, 44-46 | `78bf314` |
| `packages/kit/README.md` | 58, 66, 68, 73-91 | `78bf314` |
| `packages/kit/src/page-checks/neuro.ts` | 46, 386 | `78bf314` |
| `packages/kit/src/index.ts` | export lines | `78bf314` |
| `hinshitsu/kit-repairs/FRAMEWORK.md`, `CONNECTIONS.md` | all | `78bf314` |
| `hinshitsu/kit-repairs/AUDIT-LOG.md` | headings of all entries; E-55, E-59, E-84; the `ID` and `Class` of the 92 entries F-8 to F-99 | `78bf314` |
| `hinshitsu/kit-repairs/SESSION-STATE.md` | all | `78bf314` |
| `evidence/pr9-text.md`, `evidence/frontend-refs-before.txt` | all | `78bf314` |
| `evidence/second-review/judge-report.md` | 28; the 34 finding headings (170-438); section 7 (449-465) | `78bf314` |
| `apps/studio/e2e/kit.e2e.ts` | 1-64 | `78bf314` |
| `vitest.e2e.config.ts`, `package.json` (scripts) | all | `78bf314` |

### Commands, with the attached file that holds each complete output

1. `npm run check`, 2 runs → `check-run1.txt`, `check-run2.txt`: type check, lint and boundary rule clean; `Test Files 8 passed (8)`, `Tests 264 passed (264)`, `EXIT 0`, both runs.
2. `PW_CHROMIUM=… npx vitest run --config vitest.e2e.config.ts apps/studio/e2e/kit.e2e.ts`, 2 runs → `kit-e2e-run1.txt`, `kit-e2e-run2.txt`: `Tests 124 passed (124)`, `EXIT 0`, both runs (288 s and 286 s).
3. The triggers of the findings → `triggers-1.txt` (T1 to T13), `triggers-2.txt` (T14 to T21), `triggers-3.txt` (T22 to T25). Each block starts with its command.
4. Row counts of `redteam/FINDINGS.md` by a Python script that splits each row into its 7 cells and counts the first words of the status cell and the severity cell per ID prefix; its counts are in the C7 table.
5. Counts of the kit by a test file that imports the kit → `kit-numbers.json`.
6. Reverts of the 5 repair commits, each followed by `npx vitest run` → `revert-tests.txt`.
7. The 8 README limits in Chromium 1255 → `readme-limits.txt` (pages and results), `readme-limits-run.txt`.
8. Pull request 9, read with the session's pull request tool and the GitHub API at 02:33 → `pr9-view-live.txt`, `pr9-body-live.md`, `pr9-state.json`, `pr9-check-runs.json`; reviews at 02:39 → `pr9-reviews.json`, `pr9-review-body-live.md`; again at 02:44 → `pr9-state-final.json`, `pr9-check-runs-final.json`, `pr9-check-runs-by-commit.json`, `pr9-new-commits.json`.
9. `git ls-remote https://github.com/CatCorner22/Frontend` (a read; nothing written) → `frontend-refs-now.txt`.

### Repair commits: is there a test that fails on a revert?

| Commit | Revert in the scratch copy | Tests after it | Result |
|---|---|---|---|
| `3b6f2e3` | conflict in `DECISIONS.md` and `redteam/FINDINGS.md` (later commits changed the same lines); `docs/owner-instructions.md` and the research record reverted | 264 passed | no test |
| `74366e2` | clean | 264 passed | no test |
| `c05ab5c` | conflict in `redteam/FINDINGS.md`; nothing reverted | 264 passed | no test |
| `278c4e3` | conflict in `redteam/FINDINGS.md`; nothing reverted | 264 passed | no test |
| `7f3d02b` | conflict in `redteam/FINDINGS.md`; `DECISIONS.md` and `packages/kit/README.md` reverted | 264 passed | no test |

`grep -rn "FINDINGS.md\|DECISIONS.md\|PROGRESS.md\|owner-instructions\|FRAMEWORK.md\|CONNECTIONS.md\|pr9-text" packages/*/test apps/studio/e2e scripts/test` prints nothing: no test reads these records, so a full revert of the conflicted files could not fail a test either. The rows say "with no test: these are records", which is true. Findings with "no commit named" (F-69, F-71, F-84, F-85, F-90, F-96, F-97, F-99): the change is in `fb7079f` (`PROGRESS.md`, `pr9-text.md`, the 92 rows); no test.

### README limits (rows R2-P-*, "Open, not repaired")

Each ran in Chromium 1255 at `78bf314`; pages and outputs in `readme-limits.txt`.

| Row | README line | What I ran | Result |
|---|---|---|---|
| R2-P-1 | 76 | a closed shadow root in markup that holds an autoplaying video, "Lorem ipsum" and a nameless button | `unseenParts` returns nothing; `noAutoplay` not-applicable; `placeholderCopy` holds. Limit stated, fault remains |
| R2-P-2 | 77, 81 | a fixed layer with `z-index:-1`; a paragraph and a picture with `cursor:pointer` | `dialogsAreMarked` fails; `keyboardReachable` fails twice. Limit stated, fault remains |
| R2-P-4 | 82 | `img.lazyloading`, `section.section-loading-dock`; `div.loader`, "Please wait…" | the first 2 fail; the second page is not-applicable. Limit stated, fault remains |
| R2-P-5 | 86 | `setTimeout(() => location.reload(), 600000)` | `noTimedReload` holds. Limit stated, fault remains |
| R2-P-6 | 86 | a video that a script starts | `noAutoplay` holds. Limit stated, fault remains |
| R2-P-8 | 88 | `repairPlan` with `video#a` failing, then `video#b` | `fixedSinceLastRound` lists `video#a`, `items` lists `video#b`. Limit stated, fault remains |
| R2-P-10 | 87 | a typeface name that my machine lacks, no font file | `fit-fonts` fails. Limit stated, fault remains |
| R2-P-11 | 82 | buttons ↗ ☎ ▶ ★ → ✕ ✓ | fails for ↗ ☎ ▶ only. Limit stated, fault remains |

The README states each of the 8 limits truthfully.

### C2 (rows of the minors, the notes and section 7)

- Judge report: 34 finding headings F-1 to F-34 (8 major, 23 minor, F-27 "minor at the pin", 2 notes). `redteam/FINDINGS.md`: rows R2-F-1 to R2-F-34, 34 rows, no ID twice; each of the 26 minors and notes has its row; all 34 say "Fixed" with a commit.
- C14 report: IDs C14-1 to C14-9; rows R2-C14-1 to R2-C14-9, each "Fixed" with a commit.
- Section 7: 12 bullets with 15 attempt IDs; rows R2-P-1 to R2-P-12 cite all 15; 4 "Fixed" with a commit, 8 "Open, not repaired" with a reason.
- 0 rows missing. "The delivery report lists each open row": UNVERIFIED, no delivery report exists at `78bf314`.

### C7 (numbers and statuses)

| Statement | Where | What the command prints | Equal |
|---|---|---|---|
| 8 test files, 264 tests | `PROGRESS.md` 44; pull request | 8 and 264, 2 runs | yes |
| kit browser tests: 124 | the same | 124, 2 runs | yes |
| `a91c5be` is the last commit that changes code | pull request | `git diff --stat a91c5be..78bf314`: records and prompts only | yes |
| 76 rows `R2-*` (34, 9, 21, 12) | both | 34, 9, 21, 12 | yes |
| 64 repaired, 62 with a test, 12 open | both | Fixed 34+9+17+4 = 64; with a test 33+9+17+3 = 62; Open, not repaired 4+8 = 12 | yes |
| 92 rows `H-*`: 56, 45 with a test, 29, 4, 3 | both | Fixed 56 (45 "with a test"), Corrected 29, Open 4, Needs the owner 3 | yes |
| "92 findings, 20 of them rated blocker" | `PROGRESS.md` 44 | 21 rows "blocker (the auditor: BLOCKER)"; 21 log entries F-8 to F-99 with `Class: BLOCKER` | **no** (new finding 2) |
| the judge: 34 findings, 8 major, 24 minor, 2 notes | `PROGRESS.md` 44 | judge report line 28 | yes |
| 21 faults of the automated review in four rounds | both | 21 rows `R2-AR-*`; 4 commits in the "Reviewer" cells (`d38a239`, `28a51a9`, `828796b`, `fb7079f`) | yes |
| 49 rule records, 16 floors, 24 "expert-opinion", 30 page checks, 3 walks, four lists | `PROGRESS.md` 36, 40; README 58, 73 | `kit-numbers.json`: 49; floor 16; expert-opinion 24; 30 exported page checks; `dialogWalk`, `tabsWalk`, `tabOrderWalk`; "four lists" in `judge.ts` 142 | yes |
| open rows `KIT-*`: 01, 05 (in part), 42, 44, 45, 46 | pull request | T10 | yes |
| M4 is the current milestone, exit test open | `PROGRESS.md` 83-85 | "## Current milestone: M4 (Step screen). Not complete." | yes |
| "Waiting on the owner" lists every question of this run | `PROGRESS.md` 143-165 | 21 items, none of this run | **no** (new finding 1) |
| 1 line: the RUN FOLDER is a record and no code | pull request | "`hinshitsu/kit-repairs/` is a record of the owner's Hinshitsu run (log, scopes, reports, saved outputs) and no code." | yes |
| the full browser suite: 3 runs of 420 at `a973e47`; 1 run started at `fb7079f` and stopped | both | UNVERIFIED: I did not run the full suite, and no record holds the stopped run |

No row `KIT-*` changed between `183c166` and `78bf314`. C7 fails on 2 lines (findings 1 and 2) and on the statuses of finding 3.

### C8, C9, C10, C11, C15 (b), C6

- **C8:** both commands print nothing (T23). Pass.
- **C9:** first reading: `git remote -v` and `git config --get-regexp "^(remote|url)\."` in the session's clone and in both scratch copies print no line that holds `CatCorner22/Frontend` (T24; the clone's remote is `CatCorner22/Devin_Frontend`). Second reading: the 37 refs of `git ls-remote` equal the 37 refs of `evidence/frontend-refs-before.txt` (`diff` exit 0 after the file's 3 header lines). Pass. This is my machine, not the BUILDER's working copy; that copy is UNVERIFIED by me.
- **C10:** at 02:33 and at 02:44 the pull request was `open`, `merged: false`, `merged_at: null`. Pass.
- **C11:** the command prints 3 lines (T25): `PROGRESS.md` "Sources" (what the builder read), README "Sources" (the same), `behavior.ts` "(3 to 1, as WCAG 2.4.13 asks) is not measured". Each states what was read or not measured; 0 claims. Pass.
- **C15 (b):** from the pull request text alone: repaired 34 + 9 + 17 + 4 + 85; open R2-AR-15 to 18, 8 rows R2-P, H-correctness-10, H-adversarial-15, H-forensic-5s-14, H-forensic-5s-19, 6 rows KIT; for the owner H-adversarial-11 (with H-best-practices-1 and H-framework-drift-4), KIT-46, M4. This equals the status cells of `redteam/FINDINGS.md`. Pass on the lists; the statuses themselves are in doubt for the rows of finding 3.
- **Pull request text against `evidence/pr9-text.md`:** the 44 lines of the BUILDER's copy equal the first 44 lines of the live text at 02:33. The live text holds 11 more lines that the platform appends (finding 6).
- **C6:** UNVERIFIED. `78bf314` has no check run of its own. At 02:33 the head was `1a9461b` with 2 runs of `check` `in_progress` and "Devin Review" pending. At 02:44 the head was `d101d49` (4 commits after `1a9461b`, 2 of them change `packages/kit/src`), again 2 runs `in_progress`; the 2 runs on `1a9461b` still showed `in_progress` with no conclusion. No check had ended in success on any of these commits when I read them.

### The three FINDINGS on C3(e)

What the records say: rows H-adversarial-11, H-best-practices-1 and H-framework-drift-4 carry "Needs the owner"; the first says "the owner was asked on 2026-11-24 to accept the line or reword the test"; `PROGRESS.md` 44 counts "3 need the owner (one point raised three times …)"; the pull request text lists it under "For the owner to decide". These agree with each other and with T1. Two things are missing: "Waiting on the owner" does not list the question (finding 1), and no entry of `AUDIT-LOG.md` records that the question was put (finding 8). I cannot see the conversation with the USER, so "asked on 2026-11-24" and the second asking are UNVERIFIED. I do not rule on C3(e).

## Findings

1. **Class:** BLOCKER (C7 fails).
   **Where:** `PROGRESS.md` lines 143-165, part "Waiting on the owner".
   **Trigger:** `sed -n 143,165p PROGRESS.md | grep -n -i "C3\|vitest\|test settings\|KIT-46\|hinshitsu\|simple signs"` prints nothing. The part holds 21 items, all older than this run. The run puts 2 questions to the USER, which the pull request text lists under "For the owner to decide": accept the added line of `vitest.config.ts` or reword C3(e) (3 rows "Needs the owner"), and the further review of KIT-46.
   **Violates:** C7 ("its part 'Waiting on the owner' lists every question this run puts to the USER").
   **Proposed fix:** Add item 22 (the line of the test settings, with the 3 row IDs and the two answers offered) and item 23 (KIT-46).

2. **Class:** BLOCKER (C7 fails: a number).
   **Where:** `PROGRESS.md` line 44: "They raised 92 findings, 20 of them rated blocker."
   **Trigger:** the Python count over `redteam/FINDINGS.md` prints 21 rows with the cell "blocker (the auditor: BLOCKER)": H-correctness-1, 2; H-adversarial-1 to 6 and 11; H-forensic-5s-1, 2; H-best-practices-1; H-recipient-experience-1, 7; H-framework-drift-1 to 4; H-language-1 to 3. The same count over the entries F-8 to F-99 of `AUDIT-LOG.md` prints 21 with `Class: BLOCKER`.
   **Violates:** C7.
   **Proposed fix:** Write "21 of them rated blocker".

3. **Class:** BLOCKER (C7: a status in rows this run adds differs from the record); DEFECT if the ORCHESTRATOR rules that the sentence is no status.
   **Where:** `redteam/FINDINGS.md`, status cells of rows R2-F-2, R2-F-4, R2-F-8, R2-F-27 and R2-C14-4; the sentence "No independent reviewer has checked this repair yet." in 62 rows `R2-*`.
   **Trigger:** `grep "^| R2-" redteam/FINDINGS.md | grep -c "No independent reviewer has checked this repair yet"` prints 62. `PROGRESS.md` 44 says that seven independent auditors examined the code at `183c166`. Rows H-adversarial-2 to 6 and H-correctness-2 record that these auditors found F-2, F-4, F-8, F-27 and C14-4 still reproducing, and that the repairs came on 2026-11-25 in `0f677e1`, `2c0f8df`, `0274088`, `17fc06f` and `2b6c2db`. The 5 rows `R2-*` still say "Fixed 2026-11-24 … commit `<the first commit>`" and name neither the auditor's result nor the later commit. A reader of row R2-F-2 learns that commit `5998811` repaired the fault and that nobody checked; both are untrue at `78bf314`.
   **Violates:** C7; C15 (b) by its sense.
   **Proposed fix:** In the 5 rows: "Fixed in part 2026-11-24, commit `…`; an independent auditor found a second input on 2026-11-25 (row H-adversarial-…); fixed in commit `…`, with a test." In the other rows that the auditors re-ran, replace the sentence by "Checked on 2026-11-25 by the auditors of the Hinshitsu run at `183c166`", and keep the old sentence only where no auditor ran the repair.

4. **Class:** DEFECT.
   **Where:** `redteam/FINDINGS.md`, row R2-F-31, status cell; row R2-P-12.
   **Trigger:** Row R2-F-31 ends "it is the one repaired row `R2-*` with no test". Row R2-P-12 says "Fixed … commit `3b6f2e3` … No test: this repair changes a record only", and `PROGRESS.md` 44 names both rows. Both rows say "Fixed", which the head of the file defines as "changed and covered by a test or a re-measurement"; the head's word for a rewritten statement is "Corrected", and the 29 rows `H-*` of the same kind use it. This is the second half of F-86, not repaired.
   **Violates:** the status words of `redteam/FINDINGS.md`; one term per concept (`CLAUDE.md`).
   **Proposed fix:** R2-F-31 and R2-P-12: "Corrected 2026-11-24 … commit `…`. No test: these are records." Drop "it is the one repaired row". The pull request table still counts them under "Repaired".

5. **Class:** DEFECT (a false statement); the FRAGILITY of F-93 remains.
   **Where:** `redteam/FINDINGS.md`, cell "Evidence" of rows R2-AR-1 to R2-AR-21: "they are not on GitHub and their text is not saved in this repository".
   **Trigger:** The GitHub API lists 1 review on pull request 9 (id 6046336220, by `devin-ai-integration[bot]`, state COMMENTED). At 02:33 its text said "found 3 findings" and named them ("Wrong verdicts for multiple placeholder animations", "Visible fields mistaken for spam traps", "Hidden label text masks button names": rows R2-AR-19 to 21). At 02:39 the same review said "found 2 findings" and named 2 others. So the newest round's findings are on GitHub, each as a title and one sentence, and each new round overwrites the last. The detailed comments are not on GitHub (0 review comments). The rows give a reader no saved text, and the summary that I read on GitHub at 02:33 was gone at 02:39.
   **Violates:** the glossary's EVIDENCE; F-93 as raised.
   **Proposed fix:** After each round, save the text of the review and of the page at `app.devin.ai` word for word in the repository, cite that file in the cells, and write "GitHub shows only a summary of the newest round".

6. **Class:** STYLE.
   **Where:** `hinshitsu/kit-repairs/evidence/pr9-text.md` against the live text of pull request 9.
   **Trigger:** `diff` of `pr9-body-live.md` and the BUILDER's copy: the live text holds 11 more lines after line 44: "Link to Devin session …", "Open in Devin Desktop …", "Requested by: @CatCorner22", and a badge "Devin fixed all 3 findings" (at 02:39: "all 2 findings"). The platform writes them; the 44 lines the BUILDER wrote are equal.
   **Violates:** the scope ("a difference between the two is a finding"); no result changes.
   **Proposed fix:** State at the top of `pr9-text.md` that it holds the text the BUILDER wrote and that the platform appends a footer with the session link and the review's count.

7. **Class:** DEFECT (records of the RUN FOLDER; leftovers of F-80).
   **Where:** `FRAMEWORK.md`, the line "Order: … → WU-1 → WU-2 → … WU-2 takes its counts from WU-1."; the 6 marks "(superseded 2026-11-24 → E-71)" and "(added 2026-11-24 → E-71)".
   **Trigger:** The Order line still names WU-2 and is not marked superseded, while section 6 now holds one WORK UNIT. The marks carry the date 2026-11-24; commit `74366e2` that wrote them is of 2026-11-25T00:40:12Z, and E-71 is the `LAUNCH` of the drift AUDITOR (2026-11-25T00:05:19Z), not the entry of a finding (E-144 to E-148) or of a resolution. The file's own rule is "Dates are ISO", and the log's times are UTC.
   **Violates:** the form rule of `FRAMEWORK.md` line 3; rule 14.6 as the first auditor cites it.
   **Proposed fix:** Mark the Order line superseded and write the present order. Date the marks 2026-11-25 and point them to E-144 to E-148.

8. **Class:** DEFECT (records of the RUN FOLDER).
   **Where:** `hinshitsu/kit-repairs/AUDIT-LOG.md`; `SESSION-STATE.md`.
   **Trigger:** `grep -n "^### E-" AUDIT-LOG.md | awk -F' · ' '{print $3}' | sort | uniq -c` prints 1 `CARD` (E-55, 2026-11-24T20:50Z, before the auditors ran) and 2 `ANSWER`. No entry records the question on C3(e) that 3 rows say was put to the owner "on 2026-11-24", nor its second asking. `SESSION-STATE.md` says "Last rewritten: 2026-11-24 — log entry E-38", "Open FINDINGS: none", "Current STAGE … S5", while the log holds the FINDING entries F-8 to F-99 and 7 `RESOLUTION` entries.
   **Violates:** the glossary's DEFECT ("a false or out-of-date statement in a file of the RUN FOLDER").
   **Proposed fix:** Log the question as a `CARD` entry with its time and the words sent, then the answer when it comes; rewrite `SESSION-STATE.md` from the log.

**Observation, not a finding at `78bf314`:** while I worked, the branch moved 4 commits to `d101d49`. Commits `47aab60` and `5fd8c60` repair 2 faults of a fifth round of the automated review; the second "reworks the repair in a91c5be" (row R2-AR-21, "Fixed" at `78bf314`). I did not reproduce either fault; the code belongs to the other re-auditor. The records at `78bf314` (21 faults, four rounds, counts at `a91c5be`) are true of `78bf314` and were out of date for the head within 15 minutes.

## Not examined

- The commits after `78bf314` (`1a9461b` holds the scopes only; `570bd12` to `d101d49`): outside the commit under review.
- The full browser suite (`npm run e2e`, C5) and C1, C3 (a) to (d), C4 as a criterion, C12, C13, C14, C15 (a), C16: not in this scope. `npm run check` ran twice as the Limits require.
- The code of `packages/kit/src` beyond the lines named above: the scope of the other re-auditor.
- The 60 findings `F-*` that this scope does not list.
- The page `https://app.devin.ai/review/catcorner22/devin_frontend/pull/9`: not opened; I read the review through the GitHub API only.
- The conversation between the ORCHESTRATOR and the USER: not visible to me; the 2 askings on C3(e) are UNVERIFIED.
- The BUILDER's working copy (C9, first reading): I read my own machine's copies.
- The numbered rules of the skills: I read the glossary and the scope, not the 7 skill files, so I cite a rule number only where the scope or an earlier report cites it.
- Prettier: installed, and no script of `package.json` runs it (`PROGRESS.md` says "installed and never run"); I ran the linter and the type checker through `npm run check`.
- The full status text of the rows `KIT-*`: none changed after `183c166`; I read the 6 open ones.

## Attached files

`WU1-reaudit-records-report.md` is this report with the scope quoted whole. `evidence-WU1-reaudit-records.zip` holds every output file named above.
