# SEC lane report: `packages/kit` at commit `2466cbbd2b84b32c6c394b6c64557e4948f864da` (pull request #6)

Reviewer lane: SEC (a security attacker). One round. Every attempt, with full page and script text and steps, is in `attempts.json`.

## Environment

- OS: Ubuntu 22.04, `Linux 6.8.0-1060-aws x86_64`.
- Node: `v22.23.5`. Dependencies: `npm ci --ignore-scripts`. Playwright package 1.65.0.
- Browser: `/home/ubuntu/.cache/ms-playwright/chromium-1255/chrome-linux64/chrome`, "Google Chrome for Testing 159.0.8154.6", headless, passed through `PW_CHROMIUM`.
- Clone: checked out detached at the pinned commit. I made no commit, no push, and no comment anywhere. My experiment files were local and are removed.
- Two local harness files did the work (full text in each attempt): `apps/studio/e2e/sec.e2e.ts` sends each page check into a page as text, exactly as `kit.e2e.ts` does, and then calls `grade`; `packages/kit/test/sec.test.ts` calls the pure functions.

## Baseline (SEC-21, SEC-22; not findings)

`npm run check` passes (7 files, 230 tests). `kit.e2e.ts` passes (44 tests). 49 rule records and 28 page checks exist, as stated. My harness gives "Crafted" on `good.html` and "Below floor, 11 floors" on `flawed.html`, as the kit's own test does.

## Claimed findings

A failed floor that ends in a pass:

- **SEC-18.** A page with no `<script>` element breaks ten floors in plain sight and gets **"Crafted"** with no failure at all. Each floor check has a narrow sign that a page can step around: any `aria-label` that contains "stop" (even on a hidden element) switches off the motion floor; `onmousedown` in place of `onclick`; a label with opacity 0; a focus style that changes white to `#fffffe`; a zero-width space as a button's name; `role="link"` left out of the size check; `<input type="image">` left out of both the name check and the picture check; `clip-path` in place of `overflow: hidden`; an overlay that is not marked as a dialog (the check for "not marked" only looks at elements that are marked); an inner scrolling box at 320 pixels.
- **SEC-1.** The same faults inside a declarative shadow root (no script): every floor reads "holds" or "not-applicable"; grade **"Crafted"**.
- **SEC-14.** The same faults inside an `<iframe srcdoc>`: no floor fails; grade **"Meets floor"**. No check reports "could-not-measure" for a frame it did not read.
- **SEC-2.** The kit's own flawed fixture plus one script that replaces `Document.prototype.querySelectorAll`, `querySelector`, `createTreeWalker` and `PerformanceObserver`: eleven failed floors become **"Crafted"**. The checks run inside the page and trust the page's own objects.
- **SEC-5.** A finding with status "fails" and an unknown rule id (a space after the id is enough) is dropped by `grade` and by `receipt` without a word; the grade is **"Crafted"**.

Hang or crash of the checker:

- **SEC-3.** A page that replaces `window.setTimeout` makes `layoutShift` never answer.
- **SEC-4.** A page with no script and one table cell of 240,000 spaces holds `tabularNumerals` for 43.5 s and `typographicMarks` for 62.8 s (2.8 s and 4.2 s at 60,000): the time grows with the square of the text.
- **SEC-16.** One token whose value is a number makes `tokenFit` throw (`value.trim is not a function`).

Content that changes what the kit reports, or that addresses the reader of the report:

- **SEC-7.** The text of a finding forges the receipt's headings ("NOT MEASURED", "A PERSON MUST STILL CHECK") inside the first list. This contradicts "The three lists never mix" (`judge.ts`, PROGRESS). `repairPlan` passes a finding's `fix` sentence on word for word.
- **SEC-13, SEC-17.** No forged finding is needed: an element's `id` (SEC-13) or a token's name (SEC-17) is copied with its line breaks into `where`, and so into the repair plan and receipt that an automated builder is meant to read.
- **SEC-8.** `repairPlan` reports a floor as fixed when the newest round is empty (a checker that crashed or hung, see SEC-3, SEC-4, SEC-16), and when the page only renames the faulty element, because an item's identity is `ruleId|where`.

Statements that do not hold:

- **SEC-10.** `designId`: "one changed value gives another" is false for values that differ only in case (`url(A.png)` and `url(a.png)`); two designs with the same ID were found in 0.4 s over one color token, which a reader of "about one pair in four billion" would not expect.
- **SEC-11.** `checkBrief` returns no problem for a Brief made only of stock wording ("Welcome to our website", "Description goes here.", "TODO write this later", `name@email.com`, `000-000-0000`), and for "Lorem ipsum" with a soft hyphen or look-alike letters. Its comment says the check "refuses placeholders" and that an empty list "means the Brief is usable".
- **SEC-19.** The self-containment tests can be passed by code that breaks every rule they state. A file in `src/logic/` that reads the clock, draws chance, calls the network and runs text as code, and a page check that sets `innerHTML`, calls `sendBeacon` and `document.write`, pass the whole of `npm run check`. (Imports of Node modules in double quotes pass the kit's own test but are stopped by the type check and the boundary rule.)

A note for the judge: the README says "A page can pass a check and still have the fault" and names two examples. SEC-1, SEC-14 and SEC-18 are within that sentence in the widest reading; I claim them because the grade printed is "Crafted" with no "could not measure" and no word of doubt, for pages that break floors in ways a careful person sees at once, and because the charter asks whether each check finds the fault its record names.

## Tried, no finding claimed

- SEC-6: "fails" beats "holds"; no findings gives "Not graded".
- SEC-9: `comparePixels` ignores alpha (its comment says "color channel"); a `NaN` tolerance gives a changed share of 0 for fully different pictures (not validated; not claimed).
- SEC-12: a Brief with 5 MB strings and 200,000 services is refused in 37 ms.
- SEC-15: a page's own script can tell which check is running and can call the network while it is checked. The kit promises no sandbox, so I do not claim it; the README does not tell the caller to block script or network either.
- SEC-16 (part): empty tokens give "not-applicable"; odd color and length values did nothing wrong.
- A paragraph of 60,000 spaces was not slow.
- No page content was seen to run code in the checker's own process (Node), and no check wrote outside the page.

## Not tried

- The full `npm run e2e` (about 11 minutes); only `kit.e2e.ts` was run.
- The Studio repair for ISO-15 in a browser. SEC-20 is a reading only: an "echo" entry still resets the card on show and scrolls to the top while the focus now stays put. Not reproduced, not claimed.
- Whether each rule record says what its cited source says (the truth auditor's ground).
- `preferences`, `blindScore`, `differences`, `isFairDuel`; the three keyboard walks; `blind-test/PROTOCOL.md`.
- Firefox and WebKit; pages that change by timers between two checks; pages of many megabytes of elements; `display: contents` alone (SEC-18 uses other routes).
- The text of pull request #6 beyond the counts that PROGRESS.md repeats.
