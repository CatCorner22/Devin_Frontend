devin-d820860c5b1a40f1b23945dd57a15940

# Audit of the repairs after the third audit: commit `0144deb2d5ac2e1eb30354323bc6575711c7684e`

| Finding | Result | Evidence |
|---|---|---|
| N1 (last rule of the name) | Trigger (a) to (f): **no longer reproduces** (6 of 6 now `fails`). 2nd input (6 inputs): **no longer reproduces**. | `probe-log-p0.txt` against `probe-log-pf.txt`, cases N1a to N1f, N1-2a to N1-2f |
| N2 (comment on the big integer) | Trigger: **no longer reproduces** (the 4 IDs are as before; the new sentence agrees with them). 2nd input: the new sentence is **false** for a big integer of 22 digits (new finding A3). **No limit stated.** | `unit-probe-p0.txt` |
| N3 ("five commits") | Trigger: **no longer reproduces** (`rev-list --count` prints 4; both texts say "four"). 2nd input: **no longer reproduces** (the other counts of the sentence agree). | commands below |
| N4 (`+44 1632 555-0142` blamed) | Trigger: **no longer reproduces** (3 of 3 now `null`). 2nd input: **still reproduces** for 5 other ways of writing; **limit stated, fault remains** (the README statement is true). The repair also excuses the made-up number itself after `+1` (new finding A2). | `unit-probe-p0.txt` against `unit-probe-pf.txt` |
| N5 (two counts run together) | Trigger: **no longer reproduces** (the comma is there). 2nd input: one more form fault in the same sentence (a note, no finding). | `PROGRESS.md` line 44 |
| Revert `df68556` | 1 test fails: `kit.e2e.ts`, "automated review of 2026-11-25: of several animations on a placeholder, each is read with its own duration, count and state". | `revert-r1-kit-e2e.txt` |
| Revert `d8829e3` | 1 test fails: `kit.test.ts`, "the Brief > blames no real name or real word, and finds filler across line breaks and in template forms (review of 2026-11-24, F-13, F-14, F-15, C14-4, C14-5)". | `revert-r2-check.txt` |
| Revert `aa53c6c` | **no test** (264 and 124 pass). | `revert-r3-check.txt`, `revert-r3-kit-e2e.txt` |
| A1 (new) | DEFECT: `df68556` makes `noEndlessMotion` miss a moving placeholder whose animation name ends in a backslash and is followed by another animation; `fae1b78` caught it. | `probe2-log-p0.txt` against `probe2-log-pf.txt`, H1 to H4 |
| A2 (new) | DEFECT: `d8829e3` makes `placeholderIn` miss the made-up North American number written with `+1`; `fae1b78` caught it. No limit stated. | `unit-probe-p0.txt` against `unit-probe-pf.txt` |
| A3 (new) | DEFECT (narrow): the sentence that `aa53c6c` adds to `designId.ts` is false from 10^21 up. | `unit-probe-p0.txt` |
| Counts of rows `H-*` | Agree with `PROGRESS.md` and with the table in `pr9-text.md`. | script output below |
| Pull request 9 | Description equals `pr9-text.md` letter for letter (footer aside). Open, not merged; head is `0144deb`. | `pr9-live-view.txt`, `ls-remote.txt` |
| `npm run check`, 1 run | exit 0; 8 files, 264 tests passed. | `check-run1.txt` |
| Kit browser tests, 1 run | exit 0; 124 passed; Chromium revision 1255 (already present). | `kit-e2e-run1.txt` |

All evidence files named here are in `/home/ubuntu/audit/out/` on the auditor's machine; they are not in the repository.

## Examined

Scratch clone `/home/ubuntu/audit/wu` at `0144deb` (clean after every run; `git status --short` prints nothing), with worktrees at `0144deb` (`p0`) and `fae1b78` (`pf`) for the probes and `r1`, `r2`, `r3` for the reverts. Node v22.23.5, `npm ci`. Nothing was pushed, and no file of the repository was changed.

The probes are scratch test files (`probe.e2e.ts`, `probe2.e2e.ts`, `unit.probe.test.ts`, copied into the worktrees and run with vitest). The browser probes build the field `<label for="q">Search</label><input id="q" placeholder="words">`, call `noEndlessMotion(document)` in Chromium 1255, and then read the placeholder's computed opacity 12 times.

### N1

Trigger, word for word (inputs (a) to (f) of the earlier report), at `0144deb`:

```
N1a layer                              check: fails @input#q::placeholder [moves without end]   opacity 0.30 to 0.99
N1b layer order                        check: fails @input#q::placeholder [moves without end]   opacity 0.30 to 0.99
N1c prefix                             check: fails @input#q::placeholder [moves without end]   opacity 0.30 to 0.99
N1d later style media=print            check: fails @input#q::placeholder [moves without end]   opacity 0.30 to 0.99
N1e later style disabled by script     check: fails @input#q::placeholder [moves without end]   (disabled in the page: opacity 0.30 to 0.99)
N1f later alternate stylesheet         check: fails @input#q::placeholder [moves without end]   opacity 0.30 to 0.99
```

At `fae1b78` all 6 print `check: holds`. Result: **no longer reproduces**.

2nd input (mine): a still rule in an `@import … layer(base)`; nested layers; a later `<style media="(min-width: 99999px)">`; a later `<link disabled>`; a moving rule in a layer declared later; a `textarea` with 3 rules that move `letter-spacing`. All 6 print `fails` at `0144deb`. Result: **no longer reproduces**.

The second inputs of the earlier report (a name with a comma, the name `"none"`) and 12 more escaped or quoted names (`"a,b"`, `"x, y"`, `\2c x`, `"initial"`, `a\,b\,c`, `"a\\,b"`, `\1F600 z`, and others) all print `fails` at `0144deb` while the opacity runs 0.30 to 0.99.

The price of the repair, which the README states: a still placeholder fails where any rule of the name moves. I ran 9 such inputs (two rules of one name with the last one still; the only rule in `@media print`, in `@supports (display: nope)`, in `@media (min-width: 99999px)`, in `@media (prefers-reduced-motion: reduce)`, in `@container`, in a `<style media="print">`, in a sheet disabled at parse time, in an alternate sheet). All print `fails` with opacity 1.00 to 1.00, and `holds` at `fae1b78`. **Limit stated, fault remains**; the README statement ("fails where any of them moves, also one in a block for print or in a switched-off sheet") is true. The other 4 statements of that README sentence are also true as tested: one keyframe at the resting value → `fails`; same keyframes that differ from rest → `holds` (opacity 0.30 to 1.00); an unreadable sheet → `fails`; keyframes in a web component → `holds` (opacity 0.31 to 1.00).

### N2

```
designId({ t: 1n })        -> rx-9cfb75862a337cca
designId({ t: '1n' })      -> rx-b2259b036dec37bc
designId({ t: '1' })       -> rx-9cfb75862a337cca
designId({ t: 1 })         -> rx-9cfb75862a337cca
designId({ t: {a:1n} })    -> rx-7797ba0f6d65cfe9
designId({ t: {a:'1n'} })  -> rx-7797ba0f6d65cfe9
designId({ t: [1n] })      -> rx-24f7c1dd414c450a
designId({ t: ['1n'] })    -> rx-24f7c1dd414c450a
```

The IDs are the same at `fae1b78`; the sentence now tells the two cases apart and agrees with these outputs. Result: **no longer reproduces**.

2nd input: `-5n` and `-5` share an ID, `{a:[1n]}` and `{a:['1n']}` share one (the sentence holds). `10n**21n` and the number `1e21` do not (finding A3).

### N3

```
$ git rev-list --count 7435de9^..42c2f90
4
$ grep -c "five commits" PROGRESS.md hinshitsu/kit-repairs/evidence/pr9-text.md
PROGRESS.md:0
hinshitsu/kit-repairs/evidence/pr9-text.md:0
$ grep -o "the four commits \`7435de9\` to \`42c2f90\`" PROGRESS.md hinshitsu/kit-repairs/evidence/pr9-text.md
PROGRESS.md:the four commits `7435de9` to `42c2f90`
hinshitsu/kit-repairs/evidence/pr9-text.md:the four commits `7435de9` to `42c2f90`
```

Result: **no longer reproduces**. The live description of pull request 9 holds the same words. 2nd input: the other counts of the same sentence (117 rows, 66, 38, 10, 3, 55 with a test; 264 and 124 tests) agree with my count and my runs. **No longer reproduces.**

### N4

```
placeholderIn("Call +44 1632 555-0142") -> null      (fae1b78: "555-0")
placeholderIn("Call +44 113 555-0142")  -> null      (fae1b78: "555-0")
placeholderIn("Call (0113) 555-0142")   -> null      (fae1b78: "555-0")
```

Result: **no longer reproduces**.

2nd input: `"Tel. +353 1234 555-0142"`, `"Ring +44.1632.555-0142"`, `"Ring +44-113-555-0142"`, `"Office (01632) 555-0142"` → `null`. Still blamed (`"555-0"`): `"Call +44 (0)113 555-0142"`, `"Call +441632 555-0142"`, `"Call 0044 113 555-0142"`, `"Call +44 20 555-0142"`, `"Call +49 30 555-0142"`. The README says "a real number written another way is read as filler". **Limit stated, fault remains**; the statement is true.

### N5

`PROGRESS.md` line 44 now reads "92 rows `H-*` for the seven auditors, 12 rows `H-reaudit-*` for the two re-auditors". Result: **no longer reproduces**. 2nd input: I read the rest of the sentence; see the notes.

### The 3 commits, reverted

In each worktree: `git revert -n <commit>`, then `git checkout 0144deb -- apps/studio/e2e/kit.e2e.ts packages/kit/test/kit.test.ts` (the tests stay as delivered), `npm ci`, `npm run check`, and the kit browser tests.

| Commit | `npm run check` | Kit browser tests | Failing test |
|---|---|---|---|
| `df68556` | 264 passed | 1 failed, 123 passed | `AssertionError: a\,b: expected [ 'holds' ] to deeply equal [ 'fails' ]` at `kit.e2e.ts:794` |
| `d8829e3` | 1 failed, 263 passed | 124 passed | `AssertionError: Call +44 1632 555-0142: expected '555-0' to be null` at `kit.test.ts:556` |
| `aa53c6c` | 264 passed | 124 passed | no test |

`aa53c6c` changes only comments in `designId.ts`; the 2 assertions it adds test the IDs, which the commit does not change.

### Counts of the rows `H-*`

| Group | Rows | Fixed | Corrected | Open | Needs owner | With a test |
|---|---|---|---|---|---|---|
| `H-*`, seven auditors | 92 | 56 | 29 | 4 | 3 | 45 |
| `H-reaudit-*` | 12 | 4 | 3 | 5 | 0 | 4 |
| `H-reaudit2-*` | 8 | 3 | 4 | 1 | 0 | 3 |
| `H-audit3-*` | 5 | 3 | 2 | 0 | 0 | 3 |
| All | 117 | 66 | 38 | 10 | 3 | 55 |

`PROGRESS.md` says "Of the 117 rows, 66 are repaired in code or in the README (55 with a test), 38 are corrections of records, 10 are open with a reason, and 3 need the owner": it agrees. The table in `pr9-text.md` gives one "Repaired" number per group (85, 7, 7, 5), which is Fixed plus Corrected: it agrees.

### Pull request 9

The description, read with the platform's pull request tool, begins with the 4,691 characters of `pr9-text.md` letter for letter; only the footer follows (session link, desktop link, "Requested by"). State: open; "Mergeable (no conflicts)"; not merged. `git ls-remote` gives `0144deb…` for both `refs/heads/devin/1795542703-kit-minors` and `refs/pull/9/head`. The tool also showed the checks at the time of reading: 0 passed, 1 failed ("Devin Review"), 1 pending ("check").

### The two commands, 1 run each

- `npm run check`: exit 0; 8 test files, 264 tests passed.
- `PW_CHROMIUM=$HOME/.cache/ms-playwright/chromium-1255/chrome-linux64/chrome npx vitest run --config vitest.e2e.config.ts apps/studio/e2e/kit.e2e.ts`: exit 0; 124 passed. Chromium revision 1255 was present; nothing was installed.

## Findings

### A1. A name that ends in a backslash swallows the comma after it: a moving placeholder passes

- **Class:** DEFECT (a wrong result: a false `holds`; `fae1b78` caught it, `df68556` misses it).
- **Where:** `packages/kit/src/page-checks/neuro.ts`, line 107: `const list = (text: string): string[] => text.split(/(?<!\\),/).map((t) => t.trim());`
- **Trigger:** the field above with `@keyframes a\\ { 50% { opacity: 0.3 } } input::placeholder { animation: a\\ 1s infinite, nothing 1s infinite; }`. The browser reports the names as `a\\, nothing`. At `0144deb`: `check: holds`, opacity 0.30 to 0.99 in 12 readings. At `fae1b78`: `check: fails @input#q::placeholder [moves without end]`. The same with `animation-name: a\\, once` (H2) and with the quoted name `"b\\"` followed by `none` (H3). A single name `a\\` (H4) fails at both commits.
- **Violates:** the rule of the check (movement of more than 5 seconds with no pause control fails); the scope's "a fault that `fae1b78` caught and this commit misses". The README names no such limit. Cause: the pattern takes a comma after one backslash as escaped, also where that backslash is itself the second half of `\\`; the two names are then read as the one name `a\\, nothing`, which has no keyframes.
- **Proposed fix:** split on a comma that follows an even number of backslashes, for example `text.split(/(?<=(?<!\\)(?:\\\\)*),/)`, or walk the text once and skip the character after each backslash. Add H1 to the test at `kit.e2e.ts` line 794.

### A2. The made-up North American number passes when it is written with `+1`

- **Class:** DEFECT (a wrong result: filler missed; `fae1b78` caught it, `d8829e3` misses it).
- **Where:** `packages/kit/src/data/placeholders.ts`, line 31, the part `\+\d{1,3}[ .-]\d{3,4}`; the comment at lines 27 to 30; `packages/kit/README.md` line 84.
- **Trigger:** `placeholderIn("Call +1 212 555-0142")` → `null` at `0144deb`, `"555-0"` at `fae1b78`. The same for `"Call us on +1 415 555-0100 today"` and `"Call +1-212-555-0199"`. `+1` is the country code of North America, so this is the made-up number itself in its international form. Because nothing is required before the `+`, `"Total 5+3 2024 555-0100"` and `"a+1 800 555-0100"` also changed from `"555-0"` to `null`.
- **Violates:** the function's rule (the made-up number of North America is filler); the scope's "a fault that `fae1b78` caught and this commit misses". **No limit stated**: the README names as missed only "a made-up number that follows four digits beginning with 0", and says the number is excused "only inside a whole number of another country", which is false for `+1`. Related and only partly stated: `"Invoice (0423) 555-0100"` and `"Ref (04231) 555-0100"` also changed to `null` (the README gives the form without brackets).
- **Proposed fix:** exclude the code 1: `\+(?!1[ .-])\d{1,3}[ .-]\d{3,4}`, and require that no letter or digit stands before the `+`. Add `'Call +1 212 555-0142'` to the list that must return `"555-0"` in `kit.test.ts`. Or state the case in the README.

### A3. "shares one with the number of the same digits" is false from 10^21 up

- **Class:** DEFECT (a false statement in a line that `aa53c6c` adds; no result changes; narrow). The earlier auditor classed the same kind of fault (N2) so.
- **Where:** `packages/kit/src/logic/designId.ts`, the documentation line "a big integer that is a token's own value shares one with the number of the same digits".
- **Trigger:** `designId({ t: 10n**21n })` → `rx-103502d8f5055572`; `designId({ t: 1e21 })` → `rx-561b3ebb4cf2dc67`; `designId({ t: '1000000000000000000000' })` → `rx-103502d8f5055572`. The number 1e21 is exactly 10^21, but `String` writes it as `1e+21`. The big integer shares its ID with the text of its digits, always; with the number only below 10^21.
- **Violates:** hard rule 13 of `CLAUDE.md`; the scope's "a false statement in a line the commits add".
- **Proposed fix:** write "shares one with the text of its digits (and so with the number of the same digits, below 10^21)".

## Notes

- `H-audit3-2` says "Fixed … with a test". The test exists and passes, but it passes also with `aa53c6c` reverted: it guards the IDs, not the comment. The count "55 with a test" includes it.
- `H-audit3-1` and `H-audit3-4` say "Fixed" and name no limit; A1 and A2 lie inside those repairs.
- `PROGRESS.md` line 44: "5 faults, 3 of them in code, 2 of which the repairs themselves had brought". The earlier report says of all 3 faults in code (N1, N2, N4) that a repair commit brought them. I did not judge which reading the builder meant.
- `PROGRESS.md` line 44, form only: the list of row groups now reads "…, 12 rows …, and 8 rows …, and 5 rows …", with "and" twice.
- `PROGRESS.md` and the pull request text give the test numbers "at commit `aa53c6c`"; I measured the same numbers at `0144deb`, which changes records only.
- Older than the diff, unchanged: a name that differs only in case (`@keyframes Blink`, `animation: blink`) → `holds` at both commits, and the placeholder does not move (correct). An only rule in `@import … print` → `holds` at both commits (correct, though the README's "also one in a block for print" does not cover it).
- A sheet disabled by a script after the animation has started keeps animating from its old keyframes in Chromium 1255; my first readings of N1e differed for that reason. Disabled while the page loads, the readings are as the table says.
- No test gave 2 different results in my runs.

## Not examined

- `npm run e2e`, the full browser suite: not run (the scope names only the kit file). UNVERIFIED at `0144deb`.
- Firefox and Safari: not run; only Chromium revision 1255.
- Each required command ran once, so I did not test stability by repetition.
- The 2 failing or pending checks on pull request 9: I read their state, not their logs.
- Lines outside `git diff fae1b78..0144deb -- . ':!hinshitsu'`, and the files under `hinshitsu/` other than those the scope names.
- `PLAN.md` and `DECISIONS.md`: not read in full.
- The repository CatCorner22/Frontend: not touched.

ATTACHMENT:{"url":"https://app.devin.ai/attachments/049cc208-9864-4a31-a2e5-53c4dc040b0a/WU1-audit-after-round3.md","fileSize":16967}
