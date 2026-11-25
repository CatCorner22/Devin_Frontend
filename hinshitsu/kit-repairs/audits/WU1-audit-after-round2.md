devin-3f245d962bf94040a190bae7818930cd

# Third re-audit of the kit repairs: commit `fae1b7830080e8dd4bb1d071a0c659856969e432`

| Finding | Result | Evidence |
|---|---|---|
| 1 (escaped names, `@import`) | Trigger: **no longer reproduces** (4 of 4 now `fails`). 2nd input: **still reproduces** (a name with a comma, the name `"none"`: `holds`, opacity 0.30 to 0.99). No limit stated for these. | `probe-log.txt`, cases 1a to 1d, 1-2a, 1-2g |
| 2 (a still placeholder blamed) | Trigger (b), (c): **no longer reproduces**. Trigger (a): **limit stated, fault remains** (README statement is true). 2nd input: **still reproduces** (`<style media="print">`, a disabled sheet: `fails`, opacity 1.00). No limit stated for these. | `probe-log.txt`, cases 2a to 2c, 2-2a, 2-2e, 2-2g |
| 3 (`visibility: collapse`) | Trigger: **no longer reproduces**. 2nd input: **no longer reproduces** (3 inputs). | `probe-log.txt`, cases 3, 3-2a, 3-2b |
| 4 (`designId`, big integer) | Trigger: **still reproduces**; **limit stated, fault remains**. 2nd input: **still reproduces** inside an object; the stated limit is **false** for a big integer that is itself a token's value (new finding N2). | `probe-log.txt`, "finding 4" |
| 5 (records out of date) | Trigger: **no longer reproduces** (`grep -c` prints 0). 2nd input: **no longer reproduces**; but the new sentence counts "five commits" where the range holds 4 (new finding N3). | grep outputs below |
| 6 (number after 4 digits) | Trigger: **no longer reproduces** (3 of 3 now `"555-0"`). 2nd input: **still reproduces** (`'Ref 0423 555-0100'` → `null`). No limit stated in the README; the code comment states the rule. | `probe-log.txt`, "finding 6" |
| 7 (README, text spacing) | Trigger: **no longer reproduces** (the README sentence is now true). 2nd input: **no longer reproduces** (4 inputs agree with the sentence). | `probe-log.txt`, cases 7, 7-2a to 7-2d |
| N1 (new) | DEFECT: `7435de9` makes `noEndlessMotion` miss 6 kinds of moving placeholder that the commit before it caught. | `probe-log.txt` against `probe-log-a6aa7e9.txt`, cases N-a to N-e, N-l |
| N2 (new) | DEFECT: the sentence that `42c2f90` adds to `designId.ts` is false for a top-level value. | `probe-log.txt` |
| N3 (new) | STYLE: "five commits `7435de9` to `42c2f90`": the range holds 4. | `git rev-list --count` |
| N4 (new) | DEFECT: `623f09d` blames an international number that the commit before it passed. | `probe-log.txt` against `probe-log-a6aa7e9.txt` |
| N5 (new) | STYLE: `PROGRESS.md` line 44 lacks a comma or "and" between two counts. | read |
| Revert `7435de9` | Test fails: `kit.e2e.ts` "automated review of 2026-11-25: of several animations on a placeholder, each is read with its own duration, count and state" | `revert-src-7435de9-kit-e2e.txt` |
| Revert `282e12c` | Test fails: `kit.e2e.ts` "Hinshitsu audit of WU-1, adversarial finding 12: a field in a one-pixel part that cuts nothing off is drawn, and is judged like any other field" | `revert-src-282e12c-kit-e2e.txt` |
| Revert `623f09d` | Test fails: `kit.test.ts` "the Brief > blames no real name or real word, and finds filler across line breaks and in template forms (…)" | `revert-src-623f09d-check.txt` |
| Revert `42c2f90` | **no test** (264 unit tests and 124 kit browser tests pass) | `revert-42c2f90-*.txt` |
| Counts of rows `H-*` | Agree with `PROGRESS.md` and `pr9-text.md` | script output below |
| Pull request 9 | Open, unmerged; description equals `pr9-text.md` before the footer | `pr9-live-view.txt` |
| `npm run check`, 2 runs | 8 files, 264 tests passed, exit 0, both runs | `check-run1.txt`, `check-run2.txt` |
| Kit browser tests, 2 runs | 124 passed, exit 0, both runs; Chromium revision 1255 | `kit-e2e-run1.txt`, `kit-e2e-run2.txt` |

## Examined

**Setup.** Scratch clone `/home/ubuntu/scratch/audit`, `git rev-parse HEAD` = `fae1b7830080e8dd4bb1d071a0c659856969e432`; `git ls-remote` gives the same hash for `refs/heads/devin/1795542703-kit-minors` and `refs/pull/9/head`. Node v22.23.5, `npm ci`. Chromium was present: `~/.cache/ms-playwright/chromium-1255/chrome-linux64/chrome`, revision 1255. `git status --short` in the clone at the end: 0 lines. All outputs are in the attached `audit-outputs.tgz`.

**How I ran the triggers.** One probe file, `probe.e2e.ts` (in the archive), in a second scratch copy at the same commit. It builds each page as `kit.e2e.ts` does, runs the named check, and for a placeholder reads the computed opacity 12 times, 90 ms apart. Command:

```
PROBE_OUT=~/scratch/out/probe-log.txt PW_CHROMIUM=$HOME/.cache/ms-playwright/chromium-1255/chrome-linux64/chrome npx vitest run --config vitest.e2e.config.ts apps/studio/e2e/probe.e2e.ts
→ Test Files 1 passed (1), Tests 8 passed (8)   (the probe asserts nothing; it writes the log)
```

I ran the same file at `a6aa7e9` (the commit before the 4 repairs) to tell a new fault from an old one: `probe-log-a6aa7e9.txt`. The field is `<label for="q">Search</label><input id="q" placeholder="words">` unless stated.

### Finding 1

Trigger, word for word:

| Style | `noEndlessMotion` at `a6aa7e9` | at `fae1b78` | Opacity read |
|---|---|---|---|
| (a) `@keyframes a\.b { 50% { opacity: 0.3 } } input::placeholder { animation: a\.b 1s infinite; }` | holds | fails `@input#q::placeholder [moves without end]` | 0.30 to 0.99 |
| (b) the name `"q n"` | holds | fails | 0.30 to 0.99 |
| (c) the name `\31 up` | holds | fails | 0.30 to 0.99 |
| (d) keyframes `far` in `@import url("data:text/css,…")` | holds | fails | 0.30 to 0.99 |

Result: **no longer reproduces**.

Second inputs (mine):

| Style | at `fae1b78` | Opacity read | Result |
|---|---|---|---|
| `@keyframes "a,b" { 50% { opacity: 0.3 } } input::placeholder { animation: "a,b" 1s infinite; }` | holds | 0.30 to 0.99 | **still reproduces** |
| `@keyframes "none" { 50% { opacity: 0.3 } } input::placeholder { animation: "none" 1s infinite; }` | holds | 0.30 to 0.99 | **still reproduces** |
| name `größe`; name `"it's"`; an import inside an import; import with `screen`, with `layer(base)`, with `supports(display: grid)` | fails (6 of 6) | 0.30 to 0.99 | no longer reproduces |

Cause of the two that remain, in lines the diff does not change: line 105 splits the list of names at every comma, and line 110 takes the text `none` for "no animation"; the computed style writes `a\,b` and `"none"`. Both held at `a6aa7e9` too, so the repair did not bring them. The README states no limit for them.

### Finding 2

| Style | at `a6aa7e9` | at `fae1b78` | Opacity read | Result |
|---|---|---|---|---|
| (a) `@keyframes base { to { opacity: 1 } } input::placeholder { opacity: 1; animation: base 1s infinite; }` | fails | fails | 1.00 | **limit stated, fault remains** |
| (b) two rules `dup`, the last still | fails | holds | 1.00 | no longer reproduces |
| (c) `@media print { @keyframes pr … }` | fails | holds | 1.00 | no longer reproduces |

The README limit ("it counts an animation with one keyframe as movement even where that keyframe says what the words already show") is true: (a) and my input `@keyframes base { 50% { opacity: 1 } }` both answer `fails` with opacity 1.00. Row `H-reaudit2-2` says "Fixed in part" and names this; that is exact.

Second inputs (mine), nothing moves in any:

| Input | at `fae1b78` | Result |
|---|---|---|
| keyframes in `<style media="print">`, the animation in the page's sheet | fails, opacity 1.00 | **still reproduces** |
| keyframes in a `<style>` whose sheet a script disabled | fails, opacity 1.00 | **still reproduces** |
| `@supports (display: nonsense) { @keyframes … }`; `@media screen { @media print { … } }`; three rules of one name, the last still; `@import … print`; `@import … supports(display: nonsense)` | holds (5 of 5), opacity 1.00 | no longer reproduces |

The two that remain: `read` asks the condition of an `@media` rule and of an `@import` rule, and never the `media` or `disabled` of the sheet itself (line 99). The README states no limit for them.

The second README limit ("it does not find keyframes written inside a web component") is true as far as I ran it: a field and its moving keyframes inside an open shadow root → `holds`, opacity 0.30 to 0.99 (`probe2-log.txt`, W-a). The earlier auditor noted the same fault as older than its diff.

### Finding 3

```
visibleLabels  <form><textarea name="comment2" tabindex="-1" style="visibility:collapse"></textarea><button>Send</button></form>
  a6aa7e9: fails @textarea[name=comment2] [no visible name]      fae1b78: not-applicable
```

Result: **no longer reproduces**. Second inputs: a `<select>` in a wrapper with class `.trap { visibility: collapse }` → `not-applicable`; an `<input>` in `<tr style="visibility:collapse">` → `not-applicable` (both `fails` at `a6aa7e9`): **no longer reproduces**. Controls: a visible field with no label → `fails @input[name=city] [no visible name]`; a field with `visibility:visible` inside a collapsed wrapper, no label → `fails`. No sound page newly passed that I could find.

### Finding 4

```
designId({ t: { a: 1n } })   → rx-7797ba0f6d65cfe9      designId({ t: { a: '1n' } }) → rx-7797ba0f6d65cfe9
designId({ t: [1n] })        → rx-24f7c1dd414c450a      designId({ t: ['1n'] })      → rx-24f7c1dd414c450a
```

Result: **still reproduces**; the builder states it in the comment and the doc block instead of repairing it: **limit stated, fault remains**. Second inputs: `{ t: { a: 255n } }` and `{ t: { a: '255n' } }` → both `rx-50d43f060b5f85fa`; `-7n` and `'-7n'` → both `rx-36f3a1463cf36b32`: **still reproduces**, as the limit says. For a big integer that is the token's own value the limit is false: see N2.

### Finding 5

```
$ grep -c "A re-auditor is checking the second repair" redteam/FINDINGS.md
0
```

`PROGRESS.md` line 44 and `pr9-text.md` line 43 now say: "No independent reviewer has yet checked the five commits `7435de9` to `42c2f90`, which repair what the second re-auditor found; one more auditor checks them before delivery." Rows `H-correctness-11` and `H-adversarial-7` no longer open with "No independent reviewer has checked this row yet"; each ends with the second re-auditor's result. Result: **no longer reproduces**.

Second input (mine): `grep` in the 3 files for "is checking", "checks them next", "not yet checked", "is examining" → 0 lines. "No independent reviewer" → `PROGRESS.md` lines 41 and 43 and `FINDINGS.md` lines 78 and 80 (each dated history of 2026-11-18 or 2026-11-24, marked as such), and line 44 above. **No longer reproduces.** The 8 rows `H-reaudit2-*` each end "No independent reviewer has checked this row yet"; that was true until this audit.

### Finding 6

```
placeholderIn("0113 555-0142\n555-0100")            a6aa7e9: null    fae1b78: "555-0"
placeholderIn("Year 2024 555-0100 is our line")     a6aa7e9: null    fae1b78: "555-0"
placeholderIn("Order 20245 555-0100")               a6aa7e9: null    fae1b78: "555-0"
placeholderIn("Call 555-0100 or, in Leeds, 0113 555-0142") → "555-0"   (control)
```

Result: **no longer reproduces**. Second input (mine): `placeholderIn("Ref 0423 555-0100")` → `null`; `placeholderIn("PIN 00113 555-0142")` → `null`. A made-up number after 4 or 5 digits that begin with 0 is still excused: **still reproduces**, narrower. The code comment at line 29 says such a number "is taken out whole"; a reference number that begins with 0 has the same form as the number of another country, so the code cannot tell them apart. The README states no limit. Sound inputs still pass: `"Call 0113 555-0142"`, `"Call 01632 555-0142."`, `"Leeds 0113.555-0142, York 01904-555-0177"`, `"Fax 0113-555-0142"` → `null`.

### Finding 7

```
survivesTextSpacing @320  <h1>Shop</h1> + the 3 slides of 300px of E-67 7(b)  → holds
noSidewaysScroll   @320  the same                                             → fails @p, p
```

README line 80 now reads "The text-spacing check spares a slide that lies wholly beside the box and fails one that lies partly in view." The trigger agrees with it: **no longer reproduces**. Second inputs (mine): slides of 200 px with `flex:none`, the second partly in view → `fails @div [text cut off at the side with wider spacing]`; 4 slides of 400 px → `holds`; a grid of 3 columns of 272 px → `holds`; a waiting slide with `white-space:nowrap` → `holds`. All 4 agree with the sentence: **no longer reproduces**. The "partly in view" half has no test in `kit.e2e.ts` (the earlier auditor proposed one); row `H-reaudit2-7` says "No test" and names the older test for the first half.

### The 4 commits, reverted

In 4 worktrees of the scratch clone: `git revert -n <commit>`, then `git checkout fae1b78 -- apps/studio/e2e/kit.e2e.ts packages/kit/test/kit.test.ts` so that the tests stay and only the source goes back; then `npm run check` and the kit browser command. (A first pass that also reverted the tests passed everything, as it must; its outputs are `revert-<commit>-*.txt`.)

| Commit | `npm run check` | Kit browser tests | Failing test |
|---|---|---|---|
| `7435de9` | 264 passed | 1 failed, 123 passed | "automated review of 2026-11-25: of several animations on a placeholder, each is read with its own duration, count and state": `AssertionError: a\.b: expected [ 'holds' ] to deeply equal [ 'fails' ]`, `kit.e2e.ts:794` |
| `282e12c` | 264 passed | 1 failed, 123 passed | "Hinshitsu audit of WU-1, adversarial finding 12: a field in a one-pixel part that cuts nothing off is drawn, and is judged like any other field": `expected [ 'fails' ] to deeply equal [ 'not-applicable' ]`, `kit.e2e.ts:839` |
| `623f09d` | 1 failed, 263 passed | 124 passed | "the Brief > blames no real name or real word, and finds filler across line breaks and in template forms (review of 2026-11-24, F-13, F-14, F-15, C14-4, C14-5)": `AssertionError: 0113 555-0142`, `kit.test.ts:560` |
| `42c2f90` | 264 passed | 124 passed | **no test** (a comment and a doc block only; row `H-reaudit2-4` says "No test") |

The README sentence of finding 7 lives in `7435de9`; no test fails for it alone.

### The diff `a6aa7e9..fae1b78 -- . ':!hinshitsu'`

8 files, 55 insertions, 18 deletions. I read every added line. Branches of `changes` in `neuro.ts` (lines 88 to 102) and what I ran against each:

| Branch | Inputs run | Result |
|---|---|---|
| `CSS.escape(rule.name) === animation` | `a\.b`, `"q n"`, `\31 up`, `größe`, `"it's"` | right |
| `said =` (the last rule replaces the earlier ones) | two and three rules; a rule in a later `@layer`; a later `@-webkit-keyframes`; a later sheet for print, disabled, or alternate | **wrong in 6 cases: N1** |
| `CSSImportRule`, `rule.styleSheet`, `mediaText` | import plain, nested, `screen`, `print`, `layer()`, `supports()` true and false | right |
| `CSSMediaRule`, `matchMedia(conditionText)` | `print`, nested, `(width >= 100px)` | right |
| `CSSSupportsRule`, `CSS.supports(conditionText)` | a false condition, `selector(:has(a))`, `not (…)` | right |
| other grouping rules | `@layer`, `@container (min-width: 99999px)` (Chromium runs these keyframes; the check says `fails`; right) | right, but see N1 for `@layer` |
| `said ?? []`, one frame, several frames | no rule of the name; one frame; equal frames | as the README states |

`visibility === 'visible'` (line 263): finding 3 above. `placeholders.ts` line 30: finding 6 and N4. `designId.ts`: finding 4 and N2. Test lines: they assert what the commits say and nothing weaker; no test was removed or loosened in the diff.

### Counts of the rows `H-*`

A script over the last cell of each row of `redteam/FINDINGS.md` that starts `| H-`:

| Group | Rows | Fixed | Fixed in part | Corrected | Open | Needs the owner | "with a test" |
|---|---|---|---|---|---|---|---|
| `H-*` (seven auditors) | 92 | 56 | 0 | 29 | 4 | 3 | 45 |
| `H-reaudit-*` | 12 | 4 | 0 | 3 | 5 | 0 | 4 |
| `H-reaudit2-*` | 8 | 3 | 1 | 4 | 0 | 0 | 4 |
| All | 112 | 63 | 1 | 36 | 9 | 3 | 53 |

`PROGRESS.md` line 44: "Of the 112 rows, 64 are repaired in code or in the README (53 with a test), 36 are corrections of records, 9 are open with a reason, and 3 need the owner". 63 + 1 = 64: **agrees**. `pr9-text.md` lines 16 to 18: 92 / 85 / 45 / 4 / 3; 12 / 7 / 4 / 5 / 0; 8 / 8 / 4 / 0 / 0 (its "Repaired" adds Fixed and Corrected: 56 + 29, 4 + 3, 4 + 4): **agrees**. The 8 of `H-reaudit2-*` counts the row "Fixed in part" as repaired; the row itself says what is not repaired.

### Pull request 9

Read once with the platform's pull request tool at about 04:09 UTC on 2026-11-25 (`pr9-live-view.txt`): `State: open`, `Merge status: Mergeable (no conflicts)`, branch `devin/1795542703-kit-minors` → `claude/brave-mayer-sawqz9`; head `fae1b78` by `git ls-remote`. **Open and unmerged.** The live description begins with the whole text of `pr9-text.md`, letter for letter; after it stand only the platform's lines (session links, "Requested by"). **Equal.** Finding 8 of the earlier report does not reproduce. The text carries the "five commits" of N3.

### The suites, 2 times each

| Command | Run 1 | Run 2 |
|---|---|---|
| `npm run check` | exit 0; 8 test files, 264 tests passed | exit 0; 8 test files, 264 tests passed |
| `PW_CHROMIUM=…/chromium-1255/chrome-linux64/chrome npx vitest run --config vitest.e2e.config.ts apps/studio/e2e/kit.e2e.ts` | exit 0; 124 passed, 286.86 s | exit 0; 124 passed, 286.71 s |

## Findings

### N1. The "last rule of the name" misses 6 kinds of placeholder that move without end, all caught before the repair

- **Class:** DEFECT (a wrong result: a false `holds`; a fault now missed, brought by `7435de9`).
- **Where:** `packages/kit/src/page-checks/neuro.ts`, line 93 (`said = […]`, where the old line pushed every rule's frames) and line 99 (the loop over the sheets), function `changes`; the comment at lines 85 to 87 ("As the browser does, this reads the last rule of the name").
- **Trigger:** the field above with each input. Every one answers `holds` at `fae1b78` and `fails` at `a6aa7e9`; in every one the opacity runs from 0.30 to 0.99 in 12 readings.
  - (a) `@keyframes x { 50% { opacity: 0.3 } } @layer late { @keyframes x { from { opacity: 1 } to { opacity: 1 } } } input::placeholder { animation: x 1s infinite; }` (the browser prefers the rule outside a layer).
  - (b) `@layer one, two; @layer two { @keyframes x { 50% { opacity: 0.3 } } } @layer one { @keyframes x { from { opacity: 1 } to { opacity: 1 } } }` and the same animation (the browser prefers the later layer, not the later text).
  - (c) `@keyframes x { 50% { opacity: 0.3 } } @-webkit-keyframes x { from { opacity: 1 } to { opacity: 1 } }` (the browser prefers the unprefixed rule).
  - (d) the moving rule in the page's sheet, and after the field `<style media="print">@keyframes x { from { opacity: 1 } to { opacity: 1 } }</style>`.
  - (e) the same with the later `<style>` disabled by a script (`sheet.disabled = true`).
  - (f) the same with a later `<link rel="alternate stylesheet" title="alt" href="data:text/css,…">` that holds the still rule.
- **Violates:** the rule of the check (movement of more than 5 seconds with no pause control fails); C1 by its sense; the comment's own claim "As the browser does"; the scope's instruction to report a fault now missed. The same cause blames a still page in the two second inputs of finding 2 (those are older than the repair).
- **Proposed fix:** skip a sheet whose `disabled` is true or whose `media` does not match; among rules of one name prefer, as CSS does, an unprefixed rule over a prefixed one and order layers by the cascade (or, simpler and safe: where more than one applicable rule carries the name and they differ, answer "moves"). Add the 6 inputs to the test at `kit.e2e.ts` line 793. Or state the cases in the README as a limit; then the comment must not say "As the browser does".

### N2. The new sentence on the big integer is false where the big integer is the token's own value

- **Class:** DEFECT (a false statement, added by `42c2f90`; no result changes).
- **Where:** `packages/kit/src/logic/designId.ts`, line 9 ("A big integer shares an ID with the text of its digits and the letter n.") and line 13.
- **Trigger:** `designId({ t: 1n })` → `rx-9cfb75862a337cca`; `designId({ t: '1n' })` → `rx-b2259b036dec37bc`; `designId({ t: '1' })` and `designId({ t: 1 })` → `rx-9cfb75862a337cca`. A top-level big integer goes through `String`, not through `asText`: it shares its ID with the digits alone and with the number, and not with the digits and n. The sentence holds only inside an object or a list.
- **Violates:** hard rule 13 of `CLAUDE.md`; the scope's "a false statement". Row `H-reaudit2-4` ("the comment states the shared ID") is true only for the nested case.
- **Proposed fix:** write "A big integer inside a list or an object shares an ID with the text of its digits and the letter n; a big integer that is a token's own value shares one with the number of the same digits." Add both pairs to the test at `kit.test.ts`. Older words on the same changed line: "a value that holds itself as the text "[object Object]"" is not so for a list that holds itself (`rx-14f00297685a0673`, not the ID of `'[object Object]'`, `rx-f1f73fd0350a67bd`).

### N3. "the five commits `7435de9` to `42c2f90`": the range holds 4

- **Class:** STYLE (a wrong count in a record; no result and no criterion depends on it). If the pull request text counts as part of the delivery report, the glossary's clause (d) of BLOCKER would apply to a false statement in its summary; I do not judge that it does, because the sentence names the commits by hash and the hashes are right.
- **Where:** `PROGRESS.md` line 44; `hinshitsu/kit-repairs/evidence/pr9-text.md` line 43; the live description of pull request 9.
- **Trigger:** `git rev-list --count 7435de9^..42c2f90` prints `4` (`7435de9`, `282e12c`, `623f09d`, `42c2f90`). With `fae1b78` there are 5, but `fae1b78` is outside the range the sentence names.
- **Violates:** C7 (records agree with the repository); hard rule 13.
- **Proposed fix:** write "the four commits `7435de9` to `42c2f90`".

### N4. An international number of another country is now blamed where it passed before

- **Class:** DEFECT (a sound text blamed, brought by `623f09d`; narrow).
- **Where:** `packages/kit/src/data/placeholders.ts`, line 30: the pattern excuses only a number that begins with 0.
- **Trigger:** `placeholderIn("Call +44 1632 555-0142")` → `"555-0"` at `fae1b78`, `null` at `a6aa7e9`. It is the international form of `01632 555-0142`, which the same function passes (`null`). `"Call +44 113 555-0142"` and `"Call (0113) 555-0142"` → `"555-0"` at both commits (older than the repair).
- **Violates:** the function's own rule at lines 27 to 28 (a number of another country is not the made-up number); the scope's "a sound page now blamed".
- **Proposed fix:** let the pattern also take `\+\d{1,3}[ .-]\d{3,4}[ .-]555-0\d{3}` and an area code in brackets; add the 3 inputs to the test at `kit.test.ts` line 556. Or state in the README that only the national form with a leading 0 is excused.

### N5. Two counts run together in `PROGRESS.md`

- **Class:** STYLE.
- **Where:** `PROGRESS.md` line 44: "92 rows `H-*` for the seven auditors 12 rows `H-reaudit-*` for the two re-auditors".
- **Trigger:** read the sentence.
- **Violates:** the writing style of `CLAUDE.md` (plain sentences).
- **Proposed fix:** put a comma after "auditors".

### Notes that are no finding

- Second inputs that still reproduce (finding 1: a comma in the name, the name `"none"`; finding 2: a sheet for print, a disabled sheet; finding 6: 4 digits that begin with 0) are older than the 4 commits. Rows `H-reaudit2-1` and `H-reaudit2-6` say "Fixed" without a limit; the README names none of them.
- Two keyframes with the same text that differ from the value at rest (`0% { opacity: 0.3 } 50% { opacity: 0.3 }`) → `holds` while the opacity runs 0.30 to 0.99; the same at `a6aa7e9`. Older than the diff.
- A linked sheet that cannot be read (`https://example.invalid/a.css`) → `fails` with opacity 1.00: the `catch { return true }` branch, older than the diff.
- No test gave 2 different results in my runs.

## Not examined

- Finding 8 of the earlier report beyond the one comparison above: I read the pull request once; the result describes that moment.
- Whether pull request 9 has been merged is read from `State: open`; the tool showed no separate "merged" field.
- The checks and reviews of the pull request (CI, the automated review): not in this scope.
- Code of `packages/kit/src` outside the lines of the diff, beyond what I had to read to follow them.
- The full browser suite (`npm run e2e`); browsers other than Chromium revision 1255; machines other than mine.
- Acceptance criteria C1 to C16 as criteria: only as the findings cite them.
- Whether the 45 + 4 + 4 rows that say "with a test" each have a test that fails on revert: I counted the words and reverted only the 4 commits.
- A closed shadow root, a frame, and adopted sheets beyond one input (an adopted still rule after a moving document rule → `holds`, opacity 1.00: right).
- UNVERIFIED: that the 6 cases of N1 behave the same in a browser other than Chromium.
- `CatCorner22/Frontend`: not touched.
- The conversation between the orchestrator and the owner: not visible to me.

I pushed nothing, changed no file of the repository, and did not open, close, merge or comment on a pull request.

ATTACHMENT:{"url":"https://app.devin.ai/attachments/82813c35-8a16-42ab-8958-837ad382becf/WU1-reaudit-round3-report.md","fileSize":25428}
ATTACHMENT:{"url":"https://app.devin.ai/attachments/65dac36b-431d-469c-9bee-e1f0a614d957/audit-outputs.tgz","fileSize":19517}
