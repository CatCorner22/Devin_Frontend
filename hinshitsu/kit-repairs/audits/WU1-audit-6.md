devin-f672a517b7da462facd758cdf2834a9d

# Last audit of pull request 9: commit `c9505fb6290fffbb5d8bf1e3d65fe968a30df48d`

Checked out: `c9505fb6290fffbb5d8bf1e3d65fe968a30df48d` (branch `devin/1795542703-kit-minors`). Scope: `git log 4f7aae9..c9505fb`, 5 commits.

| Item | Result | Evidence |
|---|---|---|
| 1. B1 (`Tel+44 1632 555-0142` blamed) | Trigger, 5 inputs: **no longer reproduces** (5 of 5 now `null`; `"555-0"` at `4f7aae9`). 2nd input, 7 of mine: **no longer reproduces**. | `out/unit-probe-df.txt` against `out/unit-probe-p0.txt` |
| 1. B2 (`+3`, `+12`, `+01` excuse the made-up number) | Trigger, 6 inputs: **no longer reproduces** (6 of 6 now `"555-0"`; `null` at `4f7aae9`). 2nd input, 11 of mine: **no longer reproduces**. The README line and the test comment now agree with the code, with two limits (N3, N4). | same files |
| 1. B3 (comment on a big integer) | Trigger: the sentence is changed and the 4 IDs are as before; for the trigger's two numbers the new sentence is true: **no longer reproduces**. 2nd input: **still reproduces** in another form: the new sentence is false for `12345678901234567000` and `36028797018963970` (N5). | same files |
| 2. `995e4d1`, six places | 6 faulty pages of mine: 6 **fail**, each with the right name. 6 sound pages: 6 **hold**. At `4f7aae9` all 12 hold. | `out/browser-probe-df.txt`, `out/browser-probe-p0.txt` |
| 2. README list of places not read | The 5 places I could test are in fact not read (true). The list is **not complete**: 4 more places are not read (N2), and 3 forms of the six new places are not read though the README says they are (N1). | same files |
| 3. Revert `56bb8bd` | `npm run check`: **1 fails**: `packages/kit/test/kit.test.ts` > the Brief > "blames no real name or real word, and finds filler across line breaks and in template forms (...)": `Tel+44 1632 555-0142: expected '555-0' to be null`. Kit browser tests pass (125). | `out/revert-56bb8bd-check.txt`, `out/revert-56bb8bd-kit-e2e.txt` |
| 3. Revert `7de126a` | **no test** (264 and 125 pass). The commit changes a comment; its 2 new assertions pass without it. Row `H-audit5-3` says so. | `out/revert-7de126a-check.txt`, `out/revert-7de126a-kit-e2e.txt` |
| 3. Revert `995e4d1` | Kit browser tests: **1 fails**: `kit.e2e.ts` > "Hinshitsu audit of WU-1, correctness finding 10: an off-design color on a text stroke, a column rule, a border fade, a drop shadow, a native control or a list marker fails": `expected [] to deeply equal [ Array(1) ]`. `npm run check` passes (264). | `out/revert-995e4d1-kit-e2e.txt`, `out/revert-995e4d1-check.txt` |
| 3. Revert `a8f8c69` | **no test** (264 and 125 pass). Row `H-forensic-5s-14` says "the existing tests of the repair plan cover the line": they run the line; none fails without the commit. | `out/revert-a8f8c69-check.txt`, `out/revert-a8f8c69-kit-e2e.txt` |
| 4. New faults | 8 findings: 5 DEFECT, 3 STYLE. No BLOCKER, no FRAGILITY. | `## Findings` |
| 5. `controlsHaveNames`, hidden target of `aria-labelledby` | 3 faulty pages **fail**, 3 sound pages **hold**; each result agrees with the name Chromium computes. | `out/browser-probe-df.txt` |
| 5. `noEndlessMotion`, placeholder animation | 3 faulty pages **fail**, 4 sound pages **hold**. | same file |
| 5. Row `R2-AR-24` | **True**, but for 1 inexact number ("2 new faults in them": 1 of the 2 entered with an older commit; N8). | `## Examined` |
| 6. `REFERENCES.md` | The 7 lines of the table are **true**. The sentence on `B-118` is **false**, and the file misses 9 references in 8 entries (N6). `sha256sum -c SHA256SUMS`: **10 of 10 OK**. | `out/references-check.txt` |
| 7. Counts | **Agree** with `PROGRESS.md` and `pr9-text.md`: 124 rows `H-*` (72 fixed, 58 of them with a test, 44 corrected, 5 open, 3 for the owner); 80 rows `R2-*` (64 fixed, 4 corrected, 12 open). | `out/counts.txt` |
| 7. Rows `H-reaudit-records-4` to `-8` | Each correction **is in the files** (5 of 5). | `## Examined` |
| 7. Pull request 9 | **Open, not merged.** Its description equals `pr9-text.md` of `c9505fb` letter for letter (52 lines), then the platform's footer. | `out/pr9-live-view.txt` |
| 8. `npm run check`, 1 run | exit 0; 8 test files, 264 tests passed. | `out/check-run1.txt` |
| 8. Kit browser tests, 1 run | exit 0; 125 passed, 316 s; Chromium revision 1255 (version 159.0.8154.6), already present; I installed nothing. | `out/kit-e2e-run1.txt` |

## Examined

Machine: Node v22.23.5, Playwright 1.65.0, Chromium revision 1255 at `$HOME/.cache/ms-playwright/chromium-1255/chrome-linux64/chrome`. Scratch clone `~/audit/df` at `c9505fb`; `git status --short` empty after all runs. Worktrees: `p0` (`4f7aae9`), and `r-56bb8bd`, `r-7de126a`, `r-995e4d1`, `r-a8f8c69`. Nothing pushed. No pull request opened, closed, merged or commented on. No file of the repository changed. `CatCorner22/Frontend` not touched. My probe files lie outside the clone (`probes/`), in the attached archive.

### Item 1: B1 to B3

Probe: `probes/unit.probe.test.ts`, run under Vitest against `df` and `p0`.

B1, trigger word for word (at `c9505fb`; at `4f7aae9` each gave `"555-0"`):

```
placeholderIn("Tel+44 1632 555-0142")          -> null
placeholderIn("Whatsapp+44 1632 555-0142")     -> null
placeholderIn("x+44 1632 555-0142")            -> null
placeholderIn("9+44 1632 555-0142")            -> null
placeholderIn("Version 1.0+44 1632 555-0142")  -> null
```

B1, 2nd input (mine; each `"555-0"` at `4f7aae9`, `null` now): `Fax+353 1234 555-0142`, `Mobil+49 1512 555-0142`, `Büro+43 6641 555-0142`, `T+61 491 555-0142`, `2+7 4951 555-0142`, `tel+81 3123 555-0142`, `Tel+971 5012 555-0142`.

B2, trigger word for word (at `4f7aae9` each gave `null`):

```
placeholderIn("Total 5 +3 2024 555-0100") -> "555-0"
placeholderIn("Gain +12 2024 555-0100")   -> "555-0"
placeholderIn("Call +11 212 555-0142")    -> "555-0"
placeholderIn("Call +12 125 555-0142")    -> "555-0"
placeholderIn("Call +19 123 555-0142")    -> "555-0"
placeholderIn("Call +01 212 555-0142")    -> "555-0"
```

B2, 2nd input (mine; each `null` at `4f7aae9`, `"555-0"` now): `Net +5 2024 555-0100`, `Up +28 2024 555-0100`, `Rate +83 2024 555-0100`, `Call +0 2024 555-0100`, `Call +00 2024 555-0100`, `Add +2 1234 555-0100`, `Temp +38 2024 555-0100`, `Call +100 2024 555-0100`, `Score +4 2024 555-0100`, `Call +89 2024 555-0100`, `Call +69 2024 555-0100`.

Results kept from `4f7aae9` (21 inputs, the same at both commits): the `+1` forms are blamed; `Call +44 1632 555-0142`, `Tel. +353 1234 555-0142`, `Ring +44.1632.555-0142`, `(+44 1632 555-0142)`, `Call +7 4212 555-0142`, `Call +61 491 555-0142`, `Call (0113) 555-0142` pass; `Call (212) 555-0142` and `Year 2024 555-0100 is our line` are blamed.

The pattern of country codes: I put every code of 1 to 3 digits that I know to be given out (216 codes) after a `+`: 0 of 216 is blamed. I put every text of 1 to 3 digits after a `+`: the pattern excuses 285 of them; 69 of these are no country code (N4).

B3, trigger word for word, and 2nd input:

```
designId({ t: 9007199254740993n })    -> rx-983ccc68728de0af
designId({ t: 9007199254740993 })     -> rx-745fa49b601d7b76   (String gives 9007199254740992)
designId({ t: 12345678901234567890n }) -> rx-dc83c9752d7133b3
designId({ t: 12345678901234567890 })  -> rx-47703b4e0096b8c2  (String gives 12345678901234567000)
2nd input:
designId({ t: 12345678901234567000n }) -> rx-47703b4e0096b8c2
designId({ t: 12345678901234567000 })  -> rx-47703b4e0096b8c2  (the number's exact value is 12345678901234567168)
designId({ t: 36028797018963970n })    -> rx-2c47fd96982b9966
designId({ t: 36028797018963970 })     -> rx-2c47fd96982b9966  (the number's exact value is 36028797018963968)
```

The IDs are the same at both commits. The new sentence ("it does so only for a whole number below 10^21 that it can hold exactly") is true for the trigger and false for the 2nd input (N5).

### Item 2: the six places of `995e4d1`

Probe: `probes/browser.probe.e2e.ts`. Tokens as in `kit.e2e.ts`. Off-design color `#ff00aa`. For each page the probe also counts the pixels near that color in a screenshot, to show whether the browser draws it.

| Place | Faulty page (mine) | Result at `c9505fb` | Sound page | Result | At `4f7aae9` |
|---|---|---|---|---|---|
| Text stroke | `<h2>` with `-webkit-text-stroke: 2px #ff00aa` | fails, `text stroke color rgb(255, 0, 170)` | the same with `#0b5fff` | holds | both hold |
| Column rule | `columns: 3; column-rule: 3px dashed #ff00aa` | fails, `column rule color …` | `#d0d5dd` | holds | both hold |
| Border fade | `border: 6px solid #d0d5dd; border-image: conic-gradient(#ff00aa, #0b5fff) 1` | fails, `border fade color …` | `conic-gradient(#d0d5dd, #0b5fff)` | holds | both hold |
| Drop shadow | `<img>` with `filter: blur(0px) drop-shadow(6px 6px 0 #ff00aa)` | fails, `drop shadow color …` | `#1a1a1a` | holds | both hold |
| Accent | a checked radio button and a `<progress>` with `accent-color: #ff00aa` | fails, `accent color …` | `#0b5fff` | holds | both hold |
| List marker | `<ol>` with `li::marker { color: #ff00aa }` | fails, `list marker color …` | `#0b5fff` | holds | both hold |

The fixtures `good.html` and `flawed.html` give the same `tokenFit` findings at both commits. A plain page with lists, a `<details>`, a checked checkbox, a slider, a progress bar and two columns, all in default colors, holds (page S14).

README list of places not read ("the corner radius of a pseudo-element, a `::first-letter`, the `::selection`, a `border-image` that is a picture file, the stops of an SVG gradient, or a drawing brought in by SVG `use`"): pages R1, R3, R4, R5 carry `#ff00aa` in that place only, draw it (230 to 20,000 pixels) and hold: true. `::selection` holds (no pixel without a selection). The corner radius of a pseudo-element: not run. The list is not complete: see N1 and N2.

### Item 3: the 4 code commits, reverted

In each worktree at `c9505fb`: `git show <commit> -- packages/kit/src | git apply -R` (the tests and the README of `c9505fb` stay), then `npm run check` and the kit browser command.

| Reverted | File that differs | `npm run check` | Kit browser tests | Test that fails |
|---|---|---|---|---|
| `56bb8bd` | `placeholders.ts` | 1 failed, 263 passed | 125 passed | `kit.test.ts` > the Brief > "blames no real name or real word, …" |
| `7de126a` | `designId.ts` (1 comment line) | 264 passed | 125 passed | **no test** |
| `995e4d1` | `fit.ts` (6 lines) | 264 passed | 1 failed, 124 passed | `kit.e2e.ts` > "Hinshitsu audit of WU-1, correctness finding 10: …" |
| `a8f8c69` | `judge.ts` (1 line) | 264 passed | 125 passed | **no test** |

The test of `995e4d1` stops at its first failed assertion (the text stroke). I did not revert the 6 lines one by one, so "each line has an assertion that fails without it" is UNVERIFIED; the test holds one assertion for each place.

### Item 5: two page checks

`controlsHaveNames` (commit `5fd8c60`). The button or link holds only a drawing marked `aria-hidden`.

| Page (mine) | Result | Name Chromium computes |
|---|---|---|
| Faulty: target `<p id="n">` is shown; its only text is in a `display:none` span | fails, "no name" | "" |
| Faulty: target is `hidden` and holds only a `<style>` | fails | "" |
| Faulty: target is shown; its text is in a span marked `aria-hidden` | fails | "" |
| Sound: target `<span id="n" hidden>Delete the order</span>` | holds | "Delete the order" |
| Sound: target `visibility:hidden` inside an `aria-hidden` wrapper | holds | "Open the cart" |
| Sound: two targets, one shown, one `display:none` | holds | "Remove rye loaf" |

`noEndlessMotion` (commit `47aab60` and later repairs). Page: `<label for="q">Search</label><input id="q" placeholder="words">`.

| Style on `input::placeholder` (mine) | Result | Opacity in 12 readings |
|---|---|---|
| Faulty: `animation: fade 1.2s ease-in-out infinite` | fails, "moves without end" | 0.20 to 1.00 |
| Faulty: `animation: still 0s infinite, fade 2s infinite` | fails | 0.20 to 1.00 |
| Faulty: longhand, `one, two`; `1s, 1.5s`; `1, infinite` | fails | 0.25 to 1.00 |
| Sound: `animation: fade 0.3s 2` (ends) | holds | ends at 1.00 |
| Sound: `animation: fade 0s infinite` | holds | 1.00 |
| Sound: no animation; a transition on the field | holds | 1.00 |
| Sound: `animation: fade 1s infinite paused` | holds | 1.00 |

The results are the same at `4f7aae9`.

Row `R2-AR-24`, the builder's account:

- "The scope file lacked the addition that the orchestrator sent … by message after the launch": the scope file's lines 1 to 138 do not hold it. I cannot see the message itself; the re-auditor's report quotes it. True as far as the files show.
- "the report quotes it (line 242)": true (`WU1-reaudit-code-E-165.md`, lines 238 to 243).
- "and examined both commits (`47aab60`, `5fd8c60`) at `d101d49`": true (report lines 5, 255, 269, 270, 336, 337).
- "where it found 2 new faults in them": inexact. Finding 1 entered with `5fd8c60`. Finding 2 (a placeholder animation with no keyframes) "entered with the repair of F-21 (`2c0f8df`, changed again by `a91c5be`)", the report says, and is the same at `78bf314` and `d101d49`; it is not in `47aab60` (N8).
- "The scope file now ends with that addition, marked as added later": true; the diff adds 7 lines and removes none.
- "a `CORRECTION` entry of the log says so": true (E-203).
- "Three later auditors examined the same two checks": true (`WU1-reaudit-round2.md` lines 34, 35; `WU1-audit-after-round2.md` lines 19, 47; `WU1-audit-4.md` lines 12, 15).

So the automated review's statement, that the re-audit could not verify the two repairs, does not hold: the re-audit examined them, and I ran both checks again above.

### Item 6: `REFERENCES.md`

`judge-attempts.json`: 125 entries, `B-001` to `B-125`, fields `id`, `input`, `observed`, `repro_steps`. `id-map.json`: 125 keys, the same IDs, 125 different values.

The 7 lines of the table: for each, the entry maps to the reviewer's number given, the text holds the reference as written, and the "blind entry to open" maps to the number the reference means. 7 of 7 true. A search of all 3 text fields of all 125 entries for `attempt-N` finds these 7 and no other.

A search for other references finds 11 that use the label of a page (`a02`, `c03`, …) or the words "real-pages attempt". The label is the first part of the file name in the `input` of another entry (`usr/pages/a02-pause-advice.html`), so each names an entry of the file:

| Entry | Reviewer's number | Reference as written | Entry it means |
|---|---|---|---|
| `B-008` | `USR-5` | "Control for a03" | `B-068` (`USR-4`) |
| `B-015` | `USR-66` | "the c01 attempt" | `B-023` (`USR-39`) |
| `B-015` | `USR-66` | "see a12" | `B-062` (`USR-15`) |
| `B-023` | `USR-39` | "see the real-pages attempt" | `B-015` (`USR-66`) |
| `B-038` | `USR-17` | "See also b08" | `B-065` (`USR-34`) |
| `B-062` | `USR-15` | "USR real-page attempt" | `B-015` (`USR-66`) |
| `B-075` | `USR-42` | "Control for a16" | `B-004` (`USR-19`) |
| `B-089` | `USR-41` | "Control for a02" | `B-094` (`USR-3`) |
| `B-094` | `USR-3` | "see c03" | `B-089` (`USR-41`) |
| `B-118` | `USR-67` | "attempts a02 … and c03" | `B-094`, `B-089` |

`REFERENCES.md` names only the last and says of it that the labels "name no entry of the attempts file". That is false (N6).

`sha256sum -c SHA256SUMS` in the folder: 10 lines, 10 OK. `REFERENCES.md` and `SHA256SUMS` themselves are not in the list.

### Item 7: records

Counted by the first words of the status cell of `redteam/FINDINGS.md` ("Fixed in part" as fixed; "Open in part" as open). "With a test" by the words "with a test" or "with N tests" in a fixed row, less `H-audit3-2` (its test "passes also without this commit").

| Group | Rows | Fixed | Corrected | Fixed, with a test | Open | Needs the owner |
|---|---|---|---|---|---|---|
| `H-*` of the seven auditors | 92 | 56 | 29 | 45 | 4 | 3 |
| `H-reaudit-*` | 12 | 4 | 8 | 4 | 0 | 0 |
| `H-reaudit2-*` | 8 | 3 | 4 | 3 | 1 | 0 |
| `H-audit3-*` | 5 | 3 | 2 | 2 | 0 | 0 |
| `H-audit4-*` | 3 | 3 | 0 | 2 | 0 | 0 |
| `H-audit5-*` | 4 | 3 | 1 | 2 | 0 | 0 |
| Total `H-*` | 124 | 72 | 44 | 58 | 5 | 3 |
| `R2-F-*` | 34 | 33 | 1 | 33 | 0 | 0 |
| `R2-C14-*` | 9 | 9 | 0 | 9 | 0 | 0 |
| `R2-AR-*` | 25 | 19 | 2 | 19 | 4 | 0 |
| `R2-P-*` | 12 | 3 | 1 | 3 | 8 | 0 |
| Total `R2-*` | 80 | 64 | 4 | 64 | 12 | 0 |

`PROGRESS.md` line 44: "80 rows `R2-*`: 68 are repaired or corrected (64 with a test …), and 12 are open"; "Of the 124 rows, 72 are repaired in code or in the README (58 with a test), 44 are corrections of records, 5 are open with a reason …, and 3 need the owner". **Agrees.** Its test counts (264; 125) agree with my runs.

`pr9-text.md`, the table: 34/34/33/0/0, 9/9/9/0/0, 25/21/19/4/0, 12/4/3/8/0, 92/85/45/4/3, 12/12/4/0/0, 8/7/3/1/0, 5/5/2/0/0, 3/3/2/0/0, 4/4/2/0/0. **Agrees** (Repaired = Fixed + Corrected).

The rows `H-reaudit-records-4` to `-8`:

| Row | Correction it describes | In the files? |
|---|---|---|
| `-4` | Rows `R2-F-31` and `R2-P-12` say "Corrected" | Yes: both cells begin "Corrected 2026-11-24". |
| `-5` | The cells of the rows `R2-AR` say what GitHub shows | Yes: 23 rows (`R2-AR-1` to `-23`) say "GitHub shows only a summary of the newest round …"; `R2-AR-24` and `-25` quote their findings. The words "not on GitHub" remain only where rows quote the old fault. |
| `-6` | `pr9-text.md` ends with a line on the platform's footer | Yes (last line). The live footer I saw holds the session link, a second link and the requester; the tool shows the review's count apart from the text. |
| `-7` | `FRAMEWORK.md`: "Order" is marked superseded and gives the present order; 6 marks carry 2026-11-25 and point at E-144 to E-148 | Yes: line 63; marks at lines 32, 51, 53, 59, 60, 63; E-144 to E-148 are `FINDING` entries. |
| `-8` | A `CARD` entry for the question on C3(e); `SESSION-STATE.md` rewritten from the log | Yes: E-204 (`CARD`), E-205 (`ANSWER`); `SESSION-STATE.md` says "Last rewritten: 2026-11-25 — log entry E-205". |

Rows `H-audit5-1` to `-4`: `-1` true (revert fails). `-2` true for "with a test"; "only the country codes that exist excuse" is inexact (N4). `-3`: "the comment names the numbers exactly" is false (N5); "Its test guards the IDs, not the comment" is true. `-4` true: the description equals `pr9-text.md`.

Pull request 9, read with the platform's read-only tool (`out/pr9-live-view.txt`): **State: open**; `devin/1795542703-kit-minors` → `claude/brave-mayer-sawqz9`; mergeable. `git ls-remote`: `refs/pull/9/head` and the branch are `c9505fb…`; the base is `9e50434…`; `git merge-base --is-ancestor c9505fb <base>` exits 1. **Open and not merged.** The first 52 lines of the live description equal `pr9-text.md` of `c9505fb` letter for letter; 3 footer lines follow.

### Item 8

- `npm run check` → exit 0; `Test Files 8 passed (8)`, `Tests 264 passed (264)`.
- `PW_CHROMIUM=$HOME/.cache/ms-playwright/chromium-1255/chrome-linux64/chrome npx vitest run --config vitest.e2e.config.ts apps/studio/e2e/kit.e2e.ts` → exit 0; `Test Files 1 passed (1)`, `Tests 125 passed (125)`, 316.06 s.

## Findings

### N1. The six new lines of `fit.ts` blame a sound page where the browser draws nothing, and miss the color in 3 forms of the same places

- **Class:** DEFECT (wrong results, both narrow; a false sentence in a line the commit adds).
- **Where:** `packages/kit/src/page-checks/fit.ts`, the 6 lines after the comment "Six more places …"; the comment's last sentence "Each is read only where the browser draws it"; `packages/kit/README.md` line 83 ("It also reads the color … of a rule between columns, … of a `drop-shadow` filter, of `accent-color` on … a meter, and of a list item's bullet or number").
- **Trigger (a), sound pages blamed.** Each page declares `#ff00aa` in one of the places, the screenshot holds 0 pixels of it, and `tokenFit` fails `fit-colors`; each holds at `4f7aae9`:
  - `<p class="c">Bread</p>` with `.c{column-count:2;column-rule:3px solid #ff00aa}` (one line, so one column and no rule);
  - `<p class="b">Bread</p>` with `.b{border-image:linear-gradient(#ff00aa, #ff00aa) 1}` (no border);
  - `<meter class="m" value="0.6">` with `.m{accent-color:#ff00aa}` (Chromium does not color a meter by `accent-color`);
  - a checked checkbox with `appearance:none; accent-color:#ff00aa`;
  - `<li class="m">` with `.m::marker{content:none;color:#ff00aa}`, with `content:""`, with `list-style-type:""`, or with a picture as bullet (`list-style-image`) and `::marker{color:#ff00aa}`;
  - a checkbox that is not checked (the color shows once a person checks it, so this one is arguable).
- **Trigger (b), faults missed.** Each page draws `#ff00aa` (74 to 864 pixels) and holds:
  - `<svg class="s" …>` with `.s{filter:drop-shadow(6px 6px 0 #ff00aa)}` (the loop leaves an `<svg>` element before the new lines; the same filter on an `<img>` fails);
  - `.c{column-width:200px;column-rule:3px solid #ff00aa}` (the line asks for a `column-count`, which is `auto` here);
  - `<li>` with `display: inline list-item` and `::marker{color:#ff00aa}`.
- **Violates:** the scope's rules "a sound page now blamed" and "a false statement in a line the commits add". The faults of (b) were missed at `4f7aae9` too; what is new is the README sentence that says the place is read.
- **Proposed fix:** read the column rule when `column-count` or `column-width` is set; read the filter of an `<svg>` element before the loop leaves it; take `meter` out of the line and the README; skip a control with `appearance: none`, a border fade where all 4 border widths are 0, and a marker whose `content` is `none` or empty or whose bullet is a picture. Or keep the code and state these cases in the README, and strike "Each is read only where the browser draws it".

### N2. The README's list of places not read is not complete

- **Class:** DEFECT (a false statement in a line the commit adds, repeated in 2 records).
- **Where:** `packages/kit/README.md` line 83, "It does not read …"; `redteam/FINDINGS.md` row `H-correctness-10` ("Not read, and stated in the README"); `pr9-text.md` ("the README lists the places it still does not read").
- **Trigger:** each page draws `#ff00aa` and `tokenFit` holds: `.i::placeholder{color:#ff00aa;opacity:1}` (677 pixels); `.p::first-line{color:#ff00aa}` (701); `.p{text-emphasis:filled circle #ff00aa}` (277); `.p::before{content:"x";text-decoration:underline #ff00aa;outline:3px solid #ff00aa}` (194). Also the 3 forms of N1 (b).
- **Violates:** the reader takes the list for whole. These 4 places were not read at `4f7aae9` either; the commit rewrote the sentence and left them out.
- **Proposed fix:** add "a `::placeholder`, a `::first-line`, emphasis marks, the outline and text line of a pseudo-element", or begin the list with "among others".

### N3. A made-up number after a sum or a word that touches a `+` and a real country code is now missed

- **Class:** DEFECT (filler missed that `4f7aae9` caught; the README states the limit in general words).
- **Where:** `packages/kit/src/data/placeholders.ts` line 32: `56bb8bd` takes out `(?<![a-z0-9])` before the `+`.
- **Trigger:** `placeholderIn("Total 5+44 2024 555-0100")`, `("a+7 800 555-0100")`, `("x+20 2024 555-0100")`, `("Step 3+30 2024 555-0100")` → `null` at `c9505fb`, `"555-0"` at `4f7aae9`.
- **Violates:** the scope's rule "a fault now missed". It is the price of the repair of B1: the code cannot tell `Tel+44 1632 555-0142` from `5+44 2024 555-0100`. The README line 84 covers it ("a "+", digits that are a country code, and 3 or 4 digits") but gives only the example with a space, which `4f7aae9` missed as well.
- **Proposed fix:** none in code. Add the touching form to the README's example, so the owner sees that the limit grew.

### N4. The pattern excuses 69 texts of digits that are no country code; the comment and row `H-audit5-2` say it holds only codes that exist

- **Class:** DEFECT (a narrow wrong result; a false statement in a code comment and in a row).
- **Where:** `placeholders.ts` lines 29 to 32 ("the pattern holds the codes of one to three digits that the numbering plan of the telephone union gives out"); `redteam/FINDINGS.md` row `H-audit5-2` ("only the country codes that exist excuse").
- **Trigger:** `placeholderIn("Call +210 2024 555-0100")` → `null`; the same for `+259`, `+295`, `+384`, `+422`, `+854`, `+801`, `+884`, `+990`, `+969`. The whole list: 210, 214, 215, 217, 219, 259, 280 to 289, 292 to 296, 384, 388, 422, 424 to 429, 671, 684, 693 to 699, 801 to 807, 809, 851, 854, 857 to 859, 871 to 877, 879, 884, 885, 887, 889, 969, 978, 990, 997, 999. The pattern writes whole tens (`2[1-689]\d`, `42\d`, `8[0578]\d`, …). My source for "not given out" is Wikipedia's list of telephone country codes (read 2026-11-25, saved in `out/wiki-country-codes.txt`), not the union's own list.
- **Violates:** the scope's rule on a false statement in an added line. All 69 were excused at `4f7aae9` too, so no result is worse.
- **Proposed fix:** write "the pattern holds every code that the plan gives out, and some unused numbers in the same tens" in the comment and the row; or list the codes one by one.

### N5. The new comment on big integers is still false for a number that JavaScript cannot hold exactly

- **Class:** STYLE (form only; no ID changes).
- **Where:** `packages/kit/src/logic/designId.ts` line 9, the sentence `7de126a` adds: "it does so only for a whole number below 10^21 that it can hold exactly"; row `H-audit5-3` ("the comment names the numbers exactly").
- **Trigger:** `designId({ t: 12345678901234567000n })` and `designId({ t: 12345678901234567000 })` are both `rx-47703b4e0096b8c2`. JavaScript writes the number with the same digits, yet holds it as 12345678901234567168. The same for `36028797018963970` (held as 36028797018963968; both IDs `rx-2c47fd96982b9966`).
- **Violates:** the scope's rule on a false statement in an added line. The builder took the sentence from the fifth auditor's proposed fix, which was wrong in the same way.
- **Proposed fix:** "(and so with a number whose text, as JavaScript writes it, is the same digits; that is so for every whole number it holds exactly below 10^21, and for some above 2^53 that it rounds)".

### N6. `REFERENCES.md` says the labels in `B-118` name no entry; they name 2, and the file misses 9 more references of that kind

- **Class:** DEFECT (a false statement in a file of the run folder; row `R2-AR-25` rests on it).
- **Where:** `hinshitsu/kit-repairs/evidence/second-review/REFERENCES.md`, last paragraph; `redteam/FINDINGS.md` row `R2-AR-25`.
- **Trigger:** `judge-attempts.json`, entry `B-094` (`USR-3`): `input` begins `usr/pages/a02-pause-advice.html`; entry `B-089` (`USR-41`): `usr/pages/c03-pause-marked.html`. So "a02" and "c03" in `B-118` mean `B-094` and `B-089`. The 9 others are in the table of item 6 (`B-008`, `B-015` twice, `B-023`, `B-038`, `B-062`, `B-075`, `B-089`, `B-094`).
- **Violates:** the file's purpose (to give, for each reference inside a blinded entry, the entry to open). The row's count "7 such references in 5 entries" is true only for the form `attempt-N`.
- **Proposed fix:** add the 11 lines of the table in item 6 and strike "name no entry of the attempts file". A judge could follow these by the file name in `input`, which `attempt-N` did not allow; so the harm is small.

### N7. The repair plan now tells a false thing about a rule record that lacks its sentence

- **Class:** STYLE (reachable only with a record that breaks the schema).
- **Where:** `packages/kit/src/logic/judge.ts` line 116, as `a8f8c69` leaves it.
- **Trigger:** `repairPlan([[{ ruleId: 'neuro-no-autoplay', status: 'fails', where: 'p' }]], [{ ...KIT_RULES[0], plain: undefined }])` → `fix: "This finding names a rule that the kit does not know. A person must look at it."` with `ruleId: "neuro-no-autoplay"`. At `4f7aae9`: `"Make this rule hold."` The kit does know the rule.
- **Violates:** nothing a test or a criterion holds; the schema asks for `plain` (15 letters or more), and `repairPlan` does not check its records.
- **Proposed fix:** none needed; or keep the two cases apart (`record.has(...) ? record.get(...)?.plain ?? … : …`), which is the line the commit removed.

### N8. Row `R2-AR-24` says the re-audit found "2 new faults in them"; 1 of the 2 is older

- **Class:** STYLE (one number; the row's account is otherwise true).
- **Where:** `redteam/FINDINGS.md` row `R2-AR-24`.
- **Trigger:** `WU1-reaudit-code-E-165.md` line 347: finding 1 "Entered with commit `5fd8c60`"; line 358: finding 2 "Entered with the repair of F-21 (`2c0f8df`, changed again by `a91c5be`). The same at `78bf314` and at `d101d49`".
- **Proposed fix:** "where it found 1 new fault in `5fd8c60` and 1 older fault in the placeholder part of the motion check".

## Notes

- B1 and B2 are repaired as the builder states. No number of another country that passed at `4f7aae9` is blamed now among my inputs.
- Item 5: I found no fault in either check with my 13 pages.
- `7de126a` and `a8f8c69` have no test that fails without them. The rows say so for the first; for the second the row's word "cover" can be read as "guard", which would be false.
- Pre-existing, not new: `tokenFit` also blames a color on a part that is not drawn (`opacity: 0`, `visibility: hidden`); the new lines follow the same habit (pages S12, S13).
- The pull-request tool reports checks "0 passed, 1 failed, 1 pending" ("Failed: Devin Review"; "Pending: check"). Outside the scope; not examined.
- `SESSION-STATE.md` says of itself that its list of open findings from the log names many that are repaired. It states this; I did not check the list.
- I wrote no entry in the Hinshitsu log: the scope forbids a change to a file of the repository.

## Not examined

- `npm run e2e` (the full browser suite): not asked for; UNVERIFIED at this commit. `PROGRESS.md` says the same.
- Any browser other than Chromium revision 1255.
- Stability: each command ran 1 time, as the scope says.
- The corner radius of a pseudo-element (one of the README's 6 places not read): not run.
- A revert of each of the 6 new lines of `fit.ts` by itself.
- The orchestrator's message to the re-auditor (row `R2-AR-24`): I saw only the report's quotation of it.
- The pull request's merge state through the GitHub API field `merged`: it rests on the platform's tool ("open") and on `git ls-remote`.
- The raw body of the pull request on GitHub: I saw it through the platform's tool, which may shape the footer.
- Lines outside `git diff 4f7aae9..c9505fb -- . ':!hinshitsu'` for new faults; within `hinshitsu/` only the files the scope names.
- The list of country codes against the telephone union's own publication (I used Wikipedia's list).
