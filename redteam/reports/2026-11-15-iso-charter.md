# Charter: review of the browser-test isolation repair (ISO review)

Written 2026-11-15 by the lead, before any reviewer ran. The owner approved this review on 2026-11-15 ("I would prefer to approve the red-team run"; then "fix it", about finding ISO-01).

**A conflict the owner must know.** The lead directed the helper that wrote the change under review. In the method's words, the lead is "Blue". To keep the review independent, each reviewer received only its role, the list of things to probe, the rules of engagement, and the report format: no statement of where the lead thinks the change is sound. A separate judge, who did not attack, reproduces each claimed result before it counts. The lead never judges; the lead's defence, if any, appears only under "Blue's response" after the judge's findings.

## 1. Exam question

Does the change in pull request #4 (commit `44ae932`) do what it claims, do only what it claims, and describe itself truthfully in `PROGRESS.md`, `redteam/FINDINGS.md`, and the pull request; and does it leave any way for a slow or timed-out browser test to change the result of a later test?

## 2. Target pin

- Repository `CatCorner22/Devin_Frontend`, branch `devin/1763223000-e2e-timeout-isolation`, commit `44ae9324dd47a94445c34aea393daf92a4481fd5`, base `claude/brave-mayer-sawqz9` at `9c5cbe4`.
- Files changed: `apps/studio/e2e/visual.e2e.ts`, `PROGRESS.md`, `redteam/FINDINGS.md`.
- Browser: whatever Chromium each reviewer's machine holds; each reviewer reports its path and version. Playwright 1.65.0 expects revision 1254 (`node_modules/playwright-core/browsers.json`).

## 3. Reviewers (one lane each, hard rule 12)

| Lane | Role | What it probes |
|---|---|---|
| SEC | Security attacker | Resource behavior of `onTestFinished` after a timeout; interference through time rather than state; browser mismatch and `PW_CHROMIUM`; other tests that still share the page; the harness's switches and paths |
| USR | Confused first-time user | Follows `PROGRESS.md` literally on a fresh machine; reads the new text for undefined terms and false promises; reads the changed code cold; does innocent wrong things |
| TRU | Drift and truth auditor | Reproduces the claimed mechanism on the base and the new commit; checks every number and sentence in the new text; checks the change against hard rules 11 and 12 and verification rule 3 |

Each reviewer runs in its own session on its own machine, with a copy of the repository and the pull request, and may run any test or experiment locally. No reviewer pushes, commits, or writes to the pull request. No reviewer sees another reviewer's work. Budget per reviewer: 2 hours of wall-clock time, 25 target runs. One round.

## 4. Judge

A fourth session receives the three reviewers' attempts stripped to `{input, observed, repro_steps}`: no lane names, no reviewer prose, no `claimed_success`. It reproduces each attempt on the pinned commit and classifies it: confirmed (reproduced and meets the finding definition), observed once (not reproduced), not a finding (reproduced but does not meet the definition), or out of scope (recorded as collateral). Severity follows `redteam/FINDINGS.md`: blocker, major, minor, note.

## 5. Finding definition

A finding is a reproduced behavior or a quoted statement that: (a) lets a timed-out or slow test change a later test's result; (b) leaks or mishandles a browser resource in a way that changes a result or hides an error; (c) is a factual statement in the changed text that the judge cannot reproduce or that contradicts another statement in the repository; (d) breaks a rule in `CLAUDE.md`. "I would have written it differently" is not a finding.

## 6. What happens with the findings

Every confirmed finding gets a row in `redteam/FINDINGS.md` with its report identifier, and the lead repairs blockers and majors inside this unit of work before ISO-01 closes. Observed-once and collateral items are logged as notes. Nothing is deleted or downgraded without a judge entry giving the reason. The owner reads the log; the owner owns the remaining risk.
