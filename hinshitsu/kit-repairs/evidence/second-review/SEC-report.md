# SEC lane report: repairs to `packages/kit`, commit `83eced7`

Reviewer: security attacker (lane SEC). Target: `CatCorner22/Devin_Frontend`, branch `devin/1795542703-kit-minors`, commit `83eced713f3e4ec4a16c639b1f1e71304999ca69`, compared with `2466cbb`. I worked in a local clone only. I pushed nothing and read no other reviewer's report. The clone is clean again (`git status` shows no change).

## Environment

- OS: Ubuntu 22.04.5 LTS, kernel 6.8.0-1060-aws, x86_64.
- Node v22.23.5, npm 10.9.9. `npm ci --ignore-scripts`, then `npx playwright install chromium`.
- Browser: Playwright 1.65.0's own Chromium, version 158.0.8127.18, build 1254. Playwright starts the headless build: `/home/ubuntu/.cache/ms-playwright/chromium_headless_shell-1254/chrome-headless-shell-linux64/chrome-headless-shell` (the full build is `/home/ubuntu/.cache/ms-playwright/chromium-1254/chrome-linux64/chrome`). `PW_CHROMIUM` was not set.
- The typeface Georgia is not installed on this machine (this matters for SEC-29).

## How the attempts run

- Pure functions: a small Vitest file, `packages/kit/test/sec.test.ts`, whose full text is in each attempt. It writes `sec-out.txt`.
- Page checks: one runner, `apps/studio/e2e/sec-run.e2e.ts`, whose full text is in each page attempt. It sends each check into the page as text, the way `apps/studio/e2e/kit.e2e.ts` does. Every page is inline, except two large pages, for which the attempt gives the one-line command that writes them.
- Every "observed" text is the output of a run on this machine. Times differ by machine.
- Unless an attempt says otherwise, pages hold no script.

## Claimed findings (28)

### A failed or unmeasured floor ends in a pass, or the plan says "stop" or "fixed"

| Attempt | What happens |
|---|---|
| SEC-1 | Every floor carries the status `"failed"` (a typing slip or a forged finding). `grade` returns "Crafted", the receipt says "Crafted", `repairPlan` says "The newest check reports no failure." `grade` never checks the status against the five allowed values. |
| SEC-5 | In a first round where every check could not measure (or crashed, so no finding exists), `repairPlan` returns `stop: true` with "The newest check reports no failure." KIT-02 names this fault and says "Fixed". |
| SEC-4 | A page that only renames the failing element between rounds gets its old entry listed in `fixedSinceLastRound`. Nothing was repaired. |

### Text from a page, a finding, or a Brief reaches the reader unmarked (hard rule 10, KIT-04)

| Attempt | What happens |
|---|---|
| SEC-2 | For an unknown rule id, `receipt` prints the finding's status word for word. One forged finding writes its own "MEASURED BY A PROGRAM … Every floor of this page holds. Grade: Crafted." section into `receiptText`. |
| SEC-3 | `repairPlan().stillOpen` and `.fixedSinceLastRound` carry the page's `where` text unmarked, line breaks included. Only `items[].where` goes through `fromPage`. KIT-04 says page text is marked "before it enters the receipt or the plan". |
| SEC-13 | `checkBrief` prints an unknown field name and a word of `wordsToAvoid` word for word, with line breaks, inside its problem sentences. |

### A page check misses the fault its floor names (each with a control page that fails)

| Attempt | Floor | The page |
|---|---|---|
| SEC-20 | motion can stop | Endless animation on a `::before` part. |
| SEC-21 | motion can stop | Endless SVG `<animate>`. |
| SEC-22 | motion can stop | Endless animation plus a `data-pause-motion` button that is invisible, off the page, one pixel, and does nothing. The check reports "a pause control is in view". The README sentence "Only a visible button … counts" and the comment in `neuro.ts` line 31 are false. |
| SEC-23 | reflow at 320 px | A 1,000-pixel table in the ordinary flow, cut by `overflow:hidden` on the `div` around it. KIT-12's repair covers only `html` and `body`. |
| SEC-24 | focus visible | Outline removed; focus shown by a transparent outline, or by a color change of 1/255. |
| SEC-25 | control name | A button named only by CSS text inside its `svg`; names made of blank letters (U+2800, U+3164). |
| SEC-26 | visible label | A label with `color: transparent` counts as visible. (Opacity 0 and off-page are caught.) |
| SEC-32 | target size | 4-by-9-pixel links packed in a `nav` are exempt once one word stands before them. KIT-48 (6) names this fault and says "Fixed". |

### `tokenFit`

| Attempt | What happens |
|---|---|
| SEC-28 | Pink and lime outside the design pass `fit-colors` when drawn by `-webkit-text-fill-color`, a `::before` part, an underline, a text shadow, an outline, or an `svg` fill. A 13-pixel radius passes `fit-radii` when written `0 13px 13px 13px` (only the top-left corner is read) or `calc(13px + 0%)`. KIT-34 says only a pill or a circle is exempt. |
| SEC-29 | The page declares its own `@font-face` named like the design's typeface and points it at another font. `fit-fonts` holds. |
| SEC-30 | A token value `{"toString": null}` (valid JSON) makes `tokenFit` throw. KIT-02 says it "reads a value that is not text as text". |

### `designId`

| Attempt | What happens |
|---|---|
| SEC-8 | A number value (`{"--radius": 8}`) makes `designId` throw `value.trim is not a function`: the crash KIT-02 repaired in `tokenFit` only. `null` and `""` share an ID. |
| SEC-9 | One value that repeats `url(`: 80,000 letters take 1 s, 160,000 take 4 s, 320,000 take 17.5 s (time grows with the square). No limit applies. |
| SEC-10 | Different designs share an ID, against the comment "Inside those two, every letter counts": a quoted name with an escaped quotation mark, a quoted `url("A)B.png")`, an unclosed quotation mark, and `var(--Brand)` against `var(--brand)`. |
| SEC-11 | One design, two IDs: `URL(a.png)` and `url(a.png)`. |

### Placeholders and the Brief

| Attempt | What happens |
|---|---|
| SEC-12 | `placeholderIn` and `checkBrief` miss "Lorem ipsum" when a line break, two spaces, or a no-break space splits it, or when 2,000 spaces come first. |
| SEC-33 | On a page, `placeholderCopy` misses the same splits, a split by `<b>`, and placeholder text inside a `<pre>` styled as running text. |
| SEC-14 | A Brief with 4,000 words to avoid and 4,000 short texts holds `checkBrief` for 11.7 s (2,000 of each: 3.8 s). The schema rejects such a Brief, and the scan still runs. A Brief nested 200,000 deep throws `RangeError`. |

### Checks that hang or crash

| Attempt | What happens |
|---|---|
| SEC-38 | The README (line 66) tells a checker to run with "JavaScript switched off for the page". Then the page's timers never fire, and `noScriptedMotion` (a floor) and `layoutShift` never answer, even on the kit's own `good.html`. Followed to the letter, the README's advice gives "Not graded" for every page. |
| SEC-35 | A paragraph of 600,000 letters in a narrow column makes `readingComfort` throw `RangeError: Maximum call stack size exceeded`. |
| SEC-36 | 20,000 small buttons (640 KB, no script): `targetSize` gives no answer in 30 s (none in 60 s in an earlier run). KIT-39 says "Fixed" and also admits "Other checks were not measured against very large pages"; the judge may count this as a stated limit. |

### The dependency audit

| Attempt | What happens |
|---|---|
| SEC-39 | `scripts/audit.mjs` reads a high advisory in a devDependency as clean when npm is set to omit dev packages from outside: `NODE_ENV=production`, `npm_config_omit=dev`, or `omit=dev` in `.npmrc`. Part 2 ("All packages") then audits the same packages as part 1. Shown in a probe project with an unchanged copy of the script. |

## Attempts that found nothing, or that I do not claim (7)

- SEC-6: `fromPage` cannot be broken out of with its own marks, U+0085, or length. A look-alike mark and a right-to-left override pass through, inside the marks.
- SEC-7: `grade` gives "Not graded" for a missing floor and for a floor that holds and could not measure; "Below floor" for a floor that holds and fails; "Meets floor" while the person-only floors are open. A floor that failed stays open through a round that could not measure it.
- SEC-27: a closed shadow root written in the markup hides every fault with no script. Not claimed: the README states that a closed root goes unreported. Note that "JavaScript switched off" is no defence here.
- SEC-31: token values that name network addresses cause no request.
- SEC-34: `!important` in the page does not beat the text-spacing check.
- SEC-37: 20,000 fixed layers do not slow the four checks I ran.
- SEC-40: the self-containment tests pass with a double-quoted Node import, a dynamic import, a network call spelled in two parts, `sendBeacon`, and an inserted script element. Not claimed: KIT-45 already logs this as an open note.

## What I did not try

- A real 64-bit collision of `designId` by search (about 2^32 work); I showed collisions that follow from the rules instead.
- Pages with script that work against the checks: the README states that the kit does not defend against them.
- Frames, `display: contents`, a `<meta refresh>` that swaps the page during a check, XHTML pages with content outside `body`.
- `comparePixels`, `preferences`, `blindScore`, and the scripted walks (dialog, tabs, tab order).
- The full `npm run check` and `npm run e2e`; I ran only the kit's "stands alone" unit tests and my own probes.
- A line-by-line truth check of `PROGRESS.md`, `DECISIONS.md` D59 to D62, and the text of pull request #9. I checked only the sentences of `redteam/FINDINGS.md`, the README and code comments that the attempts quote.
- Other browsers; a machine with Georgia installed.
- Runtime of the remaining checks on very large pages (only `targetSize`, `readingComfort`, and the four checks of SEC-37).
