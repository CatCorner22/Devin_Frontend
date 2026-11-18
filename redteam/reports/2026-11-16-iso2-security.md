# SEC lane report: the second isolation repair (commit 6a600aa and its records)

Reviewer: security attacker and reliability saboteur. One round. Nothing was pushed, committed, or posted. I did not read other reviewers' reports.

## Environment

- OS: Ubuntu 22.04.5 LTS, Linux 6.8.0-1060-aws, x86_64, 8 processors, 31 GB memory.
- Node v22.23.5; Vitest 5.1.0; Playwright 1.65.0 (`npm ci --ignore-scripts`).
- Browser: `~/.cache/ms-playwright/chromium-1255/chrome-linux64/chrome`, "Google Chrome for Testing 159.0.8154.6", named through `PW_CHROMIUM`. Playwright 1.65.0 expects revision 1254; I did not install it, because a browser was present.
- Commit under test: `9106b9492241cb00007bcb0847037f6d58d895eb`. Base: `5fb7458`.
- Browser-test runs used: 15 of 25 (14 short runs of the visual file with a `-t` filter, 1 full `npm run e2e`).

## Short answer

The changed code held against every attack that used only a forced failure or a forced time limit. I found no leaked context, no cascade, and no wrongly stored picture that way. I claim three findings:

1. **SEC-6** (code comment and pull request, finding types a and d). The sentence "the stopped test's code can never reach the new page" is true only while every wait in a shared-page test is a call on the page. One inserted timer wait breaks it: a later stored-picture test then fails falsely, and with `UPDATE_BASELINES=1` a wrong picture is stored while its test passes. This needs an edit to a test, so the judge must decide its weight.
2. **SEC-7** (records, type d). I could not reproduce "before `13 failed | 113 passed`". Three runs on the base file gave 9, 10, and 10 failures. No file records the command.
3. **SEC-8** (records, type d). Four pairs of statements contradict each other at the pinned commit.

## What I tried

| Attempt | Attack | Result |
|---|---|---|
| SEC-1 | Nine paint-only tests forced to 100 ms, then the 117 stored-picture tests | `9 failed \| 117 passed \| 71 skipped`. Only the forced tests fail. The repair works as claimed. |
| SEC-2 | Headline loop forced to 1 ms, so it times out while `loopPage()` still waits for its context | No leak: 1 open context at the first stored-picture test and at the end; the leftover loop never finished. The `afterEach` hook waits long enough for `loopPage()` to store its context before the cleanup runs. |
| SEC-3 | `UPDATE_BASELINES=1` with nine forced timeouts before the stored-picture tests | The stored pictures are byte-identical to a control `UPDATE_BASELINES=1` run without failures. The replacement page draws the same pictures. |
| SEC-4 | All 117 stored-picture tests forced to time out at 60 ms (117 page replacements in a row) | The four later shared-page tests pass; 1 open context at the end; no stored picture changed. |
| SEC-5 | `PW_CHROMIUM=/nonexistent` (failure in `beforeAll`) | 197 tests skipped, exit 1, the true error first, then a second `TypeError` from `afterAll`. Known (ISO-08 note 2). The new hook does not run. |
| SEC-6 | A timed-out shared-page test whose leftover code waits on a timer, not on the page | **Claimed.** See below. |
| SEC-7 | Reproduce the ISO-03 proof figures | **Claimed** for the "before" figure. See below. |
| SEC-8 | Read the changed records against each other | **Claimed.** See below. |
| SEC-9 | `npm run check`, `npm run e2e`, unedited | `190 passed`; `303 passed (303)` in 692.94 s. Both claims reproduce. |

I also read the code for these paths and found no fault, without running an experiment:

- **Hooks or helpers that hold the old page.** `show`, `shot`, `geometry`, `shrink`, `difference`, and `measureStyles` all read the variable `page` at the moment of each call. None keeps a copy.
- **The split (finding type c).** The loop body, the 375-pixel width, the list from `reachable()`, the report text, and `expect(wide).toEqual([])` are unchanged. Each Direction now gets a fresh context; the single test used one. I saw no check that depends on that.
- **Order of cleanup in `loopPage()`.** If the test times out during `newPage()`, the registered cleanup closes the context and `newPage()` rejects.

## Claimed findings

### SEC-6: leftover code that waits on anything but the page reaches the new page

`visual.e2e.ts` lines 54-55 say: "The old page closes before `page` names the new one, so the stopped test's code can never reach the new page." Pull request #5 says the leftover code "never reaches the new page."

The mechanism stops leftover code only when that code is waiting on the old page. Leftover code that is waiting on something else wakes up later, reads the variable `page`, and gets the new page.

I added one line to the "radius" paint-only test (`await new Promise((resolve) => setTimeout(resolve, 400))`) and gave that one test a 100 ms limit.

- Without `UPDATE_BASELINES`: `2 failed | 124 passed`. The second failure was a stored-picture test (`plain-start, region "contact"` in run 1, `graphite-precision, region "top"` in run 2) with "mean difference per channel 12.41". That is a false fail.
- With `UPDATE_BASELINES=1`: `1 failed | 125 passed`. All 117 stored-picture tests passed, and `graphite-precision-top.png` differed from the control picture. That is a wrongly stored picture behind a passing test.

Honest limit: at the pinned commit no shared-page test waits on anything but the page, so the unedited suite is not exposed. The fault is that the guarantee is stated without its condition, and nothing enforces the condition. The first future test or helper that waits on a timer, a file, or the network reopens ISO-03 silently.

### SEC-7: "before `13 failed | 113 passed`" does not reproduce

`PROGRESS.md` line 26, `FINDINGS.md` row ISO-03, and pull request #5 give this figure. On the base commit's file with the same forced limit I measured `9 failed | 117 passed`, `10 failed | 116 passed`, `10 failed | 116 passed`. The "after" figure reproduces. No file records the command or the filter, and both quoted lines drop the skipped count (`71 skipped (197)` after, `33 skipped (159)` before). The number depends on the machine; the records present it as a fixed fact.

### SEC-8: statements that contradict each other at the pinned commit

- `PROGRESS.md` line 27 ("the owner has not yet approved a run for it") and `FINDINGS.md` row ISO-09 ("Needs the owner's approval to run them") contradict `DECISIONS.md` D57 ("the owner answered "run it"").
- Pull request #5 says "GitHub Actions is not enabled for this repository, so CI did not check this"; `PROGRESS.md` line 28 says the owner turned Actions on and both first runs passed.
- Pull request #5 says the review of `6a600aa` "needs the owner's approval" and lists "D55 and D56"; D57 exists.
- `PROGRESS.md` line 82 says CI runs "265 browser tests"; line 25 says 303. The change did not touch line 82, but the change made it false.

## What I did not try

- **A slow or failing `afterEach` hook.** If the hook itself exceeds its 90-second limit, its leftover code can still assign `page` during a later test. I could produce this only by editing the hook, so I did not run it.
- **A browser crash in the middle of a run.** The hook would throw at `newContext`, and every later shared-page test would fail. I did not kill the browser.
- **Vitest command-line switches** (`--retry`, `--sequence.shuffle`, `--sequence.concurrent`, `--bail`) combined with a failure.
- **Real machine load.** I forced limits; I did not slow the machine. A full run under heavy load is untested.
- **`studio.e2e.ts`.** The change does not touch it, and I did not attack it.
- **Interrupting a run** (Ctrl-C) and two runs at once: the first-time-user lane.
- **Revision 1254 and the headless shell.** I used full Chrome, revision 1255, only.
- **The comments on pull request #5.** I read the description, not every comment.
- **The CI claim** (runs 43893704086 and 43893721730). I did not open them.

## Files

`attempts.json` holds every attempt with its exact diff, command, output, and steps.
