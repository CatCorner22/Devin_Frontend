# Charter: review of the second browser-test isolation repair (ISO-2 review)

Written 2026-11-16 by the lead, before any reviewer ran. The owner approved this review on 2026-11-16 ("run it", decision D57). It answers finding ISO-09.

**A conflict the owner must know.** The lead wrote the change under review. In the method's words, the lead is "Blue". To keep the review independent, each reviewer receives only its role, the list of things to probe, the rules of engagement, and the report format: no statement of where the lead thinks the change is sound. A separate judge, who does not attack, reproduces each claimed result before it counts. The lead never judges; the lead's defence, if any, appears only under "Blue's response" after the judge's findings.

## 1. Exam question

Does the second isolation repair (commit `6a600aa`, and the records written after it) do what it claims, do only what it claims, and describe itself truthfully in `PROGRESS.md`, `DECISIONS.md`, `docs/owner-instructions.md`, `docs/reference/guarantees.md`, `redteam/FINDINGS.md`, and pull request #5; does the split of the phone-width test keep every check the single test made; and does any way remain for a failed, slow, or timed-out browser test to change the result of a later test?

## 2. Target pin

- Repository `CatCorner22/Devin_Frontend`, branch `devin/1794769950-iso-review-findings`, pull request #5, at the commit that adds this charter. Base of the repair: commit `5fb7458`. Code commit: `6a600aa`.
- Files changed since `5fb7458`: `apps/studio/e2e/visual.e2e.ts`, `PROGRESS.md`, `DECISIONS.md`, `docs/owner-instructions.md`, `docs/reference/guarantees.md`, `redteam/FINDINGS.md`.
- Browser: whatever Chromium each reviewer's machine holds; each reviewer reports its path and version. Playwright 1.65.0 expects revision 1254.

## 3. Reviewers (one lane each, hard rule 12)

| Lane | Role | What it probes |
|---|---|---|
| SEC | Security attacker | The `afterEach` that replaces the shared page: races between a timed-out test's leftover code and the next test, failure of the hook itself, leaked contexts, hooks that still hold the old page; `loopPage()` cleanup order; any shared-page test that can still hand a changed page to a later test; the harness's switches (`UPDATE_BASELINES`, `PW_CHROMIUM`) combined with a failure |
| USR | Confused first-time user | Follows `PROGRESS.md` and the pull request literally on a fresh machine; reads the new text and code comments cold for undefined terms and false promises; does innocent wrong things (interrupts a run, runs one test alone, runs twice at once) |
| TRU | Drift and truth auditor | Checks that the 39 tests make the same checks, on the same designs, as the one test at `5fb7458`; reproduces the forced-timeout numbers and the 303 and 190 counts; checks every number and sentence in the new text, the CI claim, and the change against hard rules 2, 3, 11, 12 and the verification rules |

Each reviewer runs in its own session on its own machine, with a copy of the repository and the pull request, and may run any test or experiment locally. No reviewer pushes, commits, or writes to the pull request. No reviewer sees another reviewer's work. Budget per reviewer: 2 hours of wall-clock time, 25 target runs. One round.

## 4. Judge

A fourth session receives the three reviewers' attempts stripped to `{input, observed, repro_steps}`: no lane names, no reviewer prose, no `claimed_success`. It reproduces each attempt on the pinned commit and classifies it: confirmed (reproduced and meets the finding definition), observed once (not reproduced), not a finding (reproduced but does not meet the definition), or out of scope (recorded as collateral). Severity follows `redteam/FINDINGS.md`: blocker, major, minor, note.

## 5. Finding definition

A finding is a reproduced behavior or a quoted statement that: (a) lets a failed, timed-out, or slow test change a later test's result; (b) leaks or mishandles a browser resource in a way that changes a result or hides an error; (c) shows the split tests check less, or something different, than the single test did; (d) is a factual statement in the changed text that the judge cannot reproduce or that contradicts another statement in the repository; (e) breaks a rule in `CLAUDE.md`. "I would have written it differently" is not a finding.

## 6. What happens with the findings

Every confirmed finding gets a row in `redteam/FINDINGS.md` with its report identifier, and the lead repairs blockers and majors inside this unit of work before ISO-09 closes. Observed-once and collateral items are logged as notes. Nothing is deleted or downgraded without a judge entry giving the reason. The owner reads the log; the owner owns the remaining risk.
