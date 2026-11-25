# TRU lane: drift and truth audit of the kit repairs

Target: `CatCorner22/Devin_Frontend`, branch `devin/1795542703-kit-minors` (pull request #9), commit `83eced713f3e4ec4a16c639b1f1e71304999ca69`, against `2466cbb`.

I changed nothing on the remote. Every local edit was undone with `git checkout -- packages`; `git status` was clean at the end.

## Environment

- OS: Ubuntu 22.04.5 LTS, kernel 6.8.0-1060-aws, x86_64.
- Node: v22.23.5. Playwright 1.65.0. Vitest 5.1.0.
- Browser: `/home/ubuntu/.cache/ms-playwright/chromium-1255/chrome-linux64/chrome`, which reports `Google Chrome for Testing 159.0.8154.6`, passed through `PW_CHROMIUM`. Playwright 1.65 itself asks for revision 1254 (158.0.8127.18); that one was not on the machine. PROGRESS.md names revision 1255 too.
- Setup: `npm ci --ignore-scripts`.

## Runs at the pin

- `npm run check`: 7 test files, 244 tests passed (TRU-1). Matches PROGRESS.md.
- `npm run e2e`: 3 test files, 380 tests passed, 863.43 s (TRU-2). Matches PROGRESS.md. One run only; the four Studio failures of KIT-41 did not show.

## Claimed findings

Ordered by weight, heaviest first.

1. **TRU-3: a forged finding still writes into the receipt. KIT-04 says "Fixed".** `receipt` prints the status of a finding with an unknown rule id without `fromPage` (`judge.ts` line 142). A status that holds line breaks adds a second heading "MEASURED BY A PROGRAM" and a line of its own to the receipt. KIT-04's original fault named a forged finding (A-085). Kinds (b), (c), (d).
2. **TRU-4: an unknown status counts as an answer, so an unmeasured floor ends in "Crafted".** A finding `{ ruleId: 'neuro-reflow', status: 'broken' }` gives grade "Crafted" with `unmeasuredFloors: []`. Kind (b). TypeScript forbids the status; data from a page run does not pass through TypeScript.
3. **TRU-8: the test named for KIT-30 does not hold the repair.** With `(?![©®™])` taken out, test F-28 and the whole kit browser test still pass, and the judge's three cases ("BrightSmile™", "Sold under licence ®", "© Crown copyright") fail again. The repair is present and works; "Fixed ... with a test" is unsupported for the ©®™ half. Kind (d).
4. **TRU-14: the text of pull request #9 describes commit `b88e6fb`, not its head.** It says 238 and 371 tests and "Minors KIT-25 and KIT-27 to KIT-41 are open"; FINDINGS.md and PROGRESS.md on the same branch say they are fixed in this pull request, with 244 and 380 tests. Kind (d).
5. **TRU-15: PROGRESS.md line 39 says 15 records carry "expert-opinion"; the code holds 24.** The repair of KIT-36 changed the number; the sentence stayed. Kind (d).
6. **TRU-5: a person's answers stand under the heading "MEASURED BY A PROGRAM".** The comment in `judge.ts` says a person's answer is "never" listed "as a measurement of the program" and that "the three lists never mix". Each line does say "A person answered", so KIT-19's own sentence is true. Kinds (b), (d).
7. **TRU-13: four planted markers do not exist in the drawn page.** `flawed.html` lines 53 and 69 repeat the attribute `data-defect` on one element; the browser keeps the first only. In my removal run over all 36 records, 28 fall silent when their marked element goes. Four have no marker (`neuro-line-height`, `neuro-text-size`, `neuro-no-justified-text`, `craft-picture-alt`). Three more (`behavior-keyboard-reach`, `fit-colors`, `fit-radii`) still fail at elements planted for other records; KIT-35 states that the builder did not repeat the removal run, so those three sit inside the logged limit. Kind (d), against "one planted defect for every check".
8. **TRU-18: KIT-48 says the audit-script fault was "fixed with tests"; no test names `scripts/audit.mjs`.** The repair itself works (TRU-17). Kind (d).
9. **TRU-16: PROGRESS.md says both "open" and "repaired" for the same minors, and "CI fails at the dependency audit" where the audit passes today.** Lines 40 and 42 carry dates and a later bullet corrects them; lines 37 and 41 carry none. Lesser. Kind (d).
10. **TRU-9: the test for KIT-39 passes with the 2,000-letter cap removed from two of the four checks.** The row's sentences are true; the test does not hold that part of the repair. Lesser. Kind (d).
11. **TRU-6: `URL(Hero.png)` and `url(Hero.png)` give two design IDs.** The comment and KIT-33 say capitals outside quotation marks and outside `url()` do not count. Small. Kind (b).

## Tried, nothing found

- TRU-7: `placeholderIn` on 12 texts behaves as KIT-29 says.
- TRU-10, TRU-11, TRU-12: repairs taken out for KIT-25, KIT-27, KIT-29, KIT-31, KIT-33, KIT-34, KIT-21 and the `where` and rule-id parts of KIT-04; a named test fails each time.
- TRU-17: D61 is true today. `scripts/audit.mjs` holds no exception, exits 0 on the lockfile, and exits 1 when `npm audit` errors.
- TRU-19: no test skipped or weakened since `2466cbb`.
- TRU-20: hard rules 1, 2, 7, 8, 11, 12, 13: no new break.
- TRU-21: counts in README and PROGRESS.md (49 records, 16 floors, 30 checks, 36 covered records, 10 for a person, 3 walks) match the code.
- TRU-22: research record 11 against four arXiv abstracts, one arXiv HTML page, and one PubMed abstract: no mismatch I claim.
- TRU-23: changed rule records and `PROTOCOL.md`: no fault claimed.

## Not tried, or tried in part

- FINDINGS.md rows: I read all of KIT-02 to KIT-48. I took the repair out for KIT-04 (in part), 21, 25, 27, 29, 30, 31, 33, 34, 39 (in part). I did not do so for KIT-02, 03, 06 to 18, 20, 22 to 24, 26, 28, 32, 35 to 38, 40, 41, or for the seven faults of KIT-48. For those I checked only that the code and a named test exist and that the full suites pass.
- I did not reproduce each fault of the judge's report one by one; I reran the cases of F-3, F-18, F-25, F-27, F-28, F-29, F-31, F-33.
- Research record 11: not opened: DesignArena, Design2Code, the Adrian Krebs post, the 2014 UAIS review (the record marks all four as search summaries). The record says Impeccable has 59 detector rules; its README says 62 today. I could not read the README's history (GitHub rate limit), so I do not claim it.
- Rule records against WCAG text: I read the diff only and did not open the WCAG pages again.
- `docs/owner-instructions.md`: not audited sentence by sentence; I saw its diff only.
- CI: two checks on the pull request were pending when I looked; I did not wait for them.
- One browser only (Chromium 159). One full browser run only.
- A probe of mine found an `oklch` purple fade on a small box that holds `tell-purple-gradient`; the check has a size threshold and test F-29 passes, so I did not follow it and do not claim it.
- `comparePixels`, `checkBrief`, `preferences`, `blindScore`: not attacked beyond the unit tests; that is the other lanes' ground.
- I did not read any other reviewer's report.
