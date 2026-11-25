# Review of the kit repairs, lane USR (confused first-time user)

Target: CatCorner22/Devin_Frontend, commit 83eced713f3e4ec4a16c639b1f1e71304999ca69 (pull request #9), repairs since 2466cbb. One round. Nothing was pushed, committed, or posted. I did not read any other reviewer's report.

## Environment

- OS: Ubuntu Linux, x86_64. Node v22.23.5. `npm ci --ignore-scripts` succeeded.
- Browser used for every page attempt: Playwright's own Chromium headless shell, **Chrome Headless Shell 158.0.8127.18** (Playwright build chromium_headless_shell-1254), at `/home/ubuntu/.cache/ms-playwright/chromium_headless_shell-1254/chrome-headless-shell-linux64/chrome-headless-shell`. It was absent at first; `npx playwright install chromium` fetched it. `PW_CHROMIUM` was not set. (A Chrome for Testing 156.0.8078.47 at `/home/ubuntu/.local/bin/google-chrome` was on the machine and was not used.)
- Viewport 1280 by 800 (320 wide for `noSidewaysScroll`), as the README example does.
- The only local edit to the repository: one added pattern in `vitest.e2e.config.ts` so that Vitest runs my scripts in `usr/`.

## What I tried

67 attempts, 31 claimed. Every attempt carries its full page or script.

1. The README example, copied literally (USR-1). It runs to its end. No finding.
2. 44 ordinary pages, one fault or one sound pattern each, written the way a person or a common library writes them, for the motion, reflow, pop-up, label, spacing, keyboard, empty-list, picture, heading, corner, type-size, numeral, mark, placeholder, emoji, fade and token checks.
3. Every page check except `noScriptedMotion` on six live public pages (USR-66).
4. `checkBrief` on seven Briefs; `blindScore` on six answer sets built to the protocol's minimum; `grade`, `receipt`, `repairPlan`, `designId`, `comparePixels`, `preferences` on small inputs.
5. The `fix` sentences and the rule text for the motion floor, read against the README (USR-67).

## Claimed findings

Each is one reproduced result on the pinned commit. "Floor" means the wrong answer changes the grade.

### A. A repaired check still misses the plain fault

| Attempt | Check (finding row) | What a careful person sees | What the kit says |
|---|---|---|---|
| USR-2 | `noEndlessMotion`, floor (KIT-07, KIT-10) | A CSS spinner and a scrolling line drawn on `::after`/`::before`, no pause | holds |
| USR-40 | `noEndlessMotion`, floor | Text scrolled without end by SVG `<animate>` | holds |
| USR-29 | `noScriptedMotion`, floor (KIT-10 "the usual carousel") | Carousel that advances every 3 s by `scrollLeft` | holds |
| USR-30 | both motion checks, floor (KIT-10) | Carousel that slides every 3 s by `element.animate()` | holds |
| USR-4 | `noSidewaysScroll`, floor (KIT-12) | `overflow-x:hidden` on the page's wrapper `div`; two table columns unreachable at 320 px | holds |
| USR-19, USR-20 | `purpleGradient` (KIT-31) | The classic #667eea to #764ba2 fade on `html`, or on a full-size `::before` | holds |
| USR-34 | `placeholderCopy` (KIT-29) | "Headline goes here", "Sample text", "Coming soon" | holds (and it blames a task board's "Todo" heading) |

None of these limits is in the README's "What can go wrong". The README names canvas and rare changes for motion, and parts outside the flow for reflow; these cases are neither.

### B. A repaired check blames a sound page

| Attempt | Check (finding row) | The sound page | The blame |
|---|---|---|---|
| USR-13 | `visibleLabels` and `keyboardReachable`, two floors (KIT-13, KIT-16) | Standard off-screen spam-trap field, `aria-hidden`, `tabindex=-1` | "no visible name"; "Remove the negative tabindex" |
| USR-23 | `keyboardReachable`, floor (KIT-16, KIT-48) | Off-stage carousel slide, `aria-hidden`, link `tabindex=-1` | "tabindex -1 keeps the Tab key from reaching this control" |
| USR-15 | `survivesTextSpacing`, floor (KIT-14) | Hero with `overflow:hidden` that clips only a decorative circle | "text cut off at the side" |
| USR-7 | `dialogsAreMarked`, floor (KIT-09) | Fixed decorative background, no pop-up on the page | "a layer covers the page, and nothing marks a window" |
| USR-8 | `dialogsAreMarked`, floor (KIT-09, KIT-48) | Small non-blocking cookie notice, `role="dialog"` with a name | demands `aria-modal="true"` / `showModal()` |
| USR-22 | `readingComfort` (KIT-24) | Text in two columns of about 48 letters | "about 102 letters in a line" |
| USR-16 | `emptyStatesExplain` (KIT-27) | Explaining sentence with a link directly before the empty list | "an empty list with no explanation" |
| USR-39, USR-66 | `emptyStatesExplain` (KIT-27, marked fixed, names Wikipedia) | Empty sub-list in a table of contents; live Wikipedia article | fails (11 times on the live page) |
| USR-9 | `pictures` (KIT-28) | `width:100%; height:200px; object-fit:cover` | "no width and height, and no aspect ratio" |
| USR-10, USR-11 | `balancedHeadings` (KIT-28) | Heading that holds only a logo picture; heading broken by hand with `<br>` | "a heading of 2 lines without balanced lines" |
| USR-17, USR-34 | `placeholderCopy` (KIT-29) | Spanish "todo"; a "Todo" column | "the phrase \"todo\"" |
| USR-18 | `emojiAsIcons` (KIT-30) | "Find us on the map ↗", "☎ 01632 960123", "▶ Watch the film" | "an emoji used as an icon" |
| USR-21 | `tokenFit` (KIT-34) | Page uses only the design's custom properties; two hold compound values (`--shadow`, `--border`) | border and shadow colours "not a color of the design" |
| USR-36 | `tokenFit` (KIT-34) | Tints mixed from the tokens; browser-default border of an unstyled `input` and `hr`; Georgia absent on the checking machine | `fit-colors` fails four times; `fit-fonts` fails |

`USR-7` falls under the general warning already logged in KIT-46 (the fixed-layer sign "can blame"); I claim it because it is a concrete sound page and its `fix` sentence cannot be followed. The judge may rule it already logged.

### C. Advice that a person cannot act on

- USR-3, USR-67: the motion floor's `fix` says "add a visible button that pauses it". A page with a visible, working Pause button still fails with the same sentence. Only a button that carries `data-pause-motion` counts (README line 69); no `fix`, `required`, or record text says so. With the attribute the page holds (USR-41, control).
- Several blames in table B come with a `fix` that would harm the page if followed: "Remove the negative tabindex" (USR-13, USR-23), "Build the window with the <dialog> element" (USR-7), "Add the width and height attributes with the picture's real pixel size" (USR-9), "Replace the color with the design token" when the colour already is the token (USR-21).

### D. `checkBrief`

- USR-46: refuses a sound Brief. "Acme Plumbing & Heating" and "123 Main Street, Leeds LS1 4AB" are called "placeholder or stock wording ... Write your own words."
- USR-49: refuses a Spanish shop's name and headline for "todo".
- USR-47, USR-48: accepts a Brief made only of template filler ("Business Name", "Headline goes here", "Service One", "you@yourdomain.com", "Customer Name") and one made of "asdf" and "xxxxx". Both return the empty list, which `brief.ts` defines as "the Brief is usable".

### E. `blindScore`

- USR-55: the protocol says to record "whether the reviewer judged it person-made" and does not say how. A recorder who writes the answer as the words the protocol uses ("person" / "AI") gets every answer counted as "person". A set in which every reviewer was right on every page reports "The test found no clear difference". No row is refused or named. A TypeScript caller is protected by the type; a person loading a sheet is not.

## Tried, no finding

README example; `grade` with a mistyped status, with a fail and a hold on one floor; receipt and repair-plan text (page text stays bracketed); `designId`; `comparePixels` on empty input; `preferences`; `blindScore` at the protocol's minimum (the statement keeps its doubt, so KIT-18 and KIT-40 hold); nested corners with a wide gap; an ordinary type scale with `sup`, `sub`, `code`; `aria-labelledby` and floating labels; `marquee`; a squashed picture; a fade on `body`. No check threw or hung on any page; the slowest was `targetSize` on Wikipedia at about 1.8 s.

Recorded and not claimed, because the README or FINDINGS already states the limit: the backdrop-plus-sibling pop-up passes unseen (USR-6); a `div` button without the hand pointer passes (USR-26); a picture or paragraph with the hand pointer is blamed (USR-25); class names `lazyloading` and `loading-dock` are blamed (USR-32); "Crafted" when every rule is not-applicable (USR-58, KIT-45).

Recorded and not claimed, weak or a matter of taste: media started by script `play()` holds, but my media files did not exist (USR-27); a script reload after 5 minutes holds (USR-37); feet and inch marks blamed as straight quotes (USR-33); `aria-label` search field beside a visible "Search" button blamed (USR-14).

## What I did not try

- I did not run any page on the base commit 2466cbb, so I cannot say which false blames are new since the first review and which were there before.
- I did not run `npm run check`, `npm run e2e`, the kit's own browser test, or `scripts/audit.mjs`.
- I did not read `PROGRESS.md`, `DECISIONS.md` D59 to D62, the pull request text, `docs/research/11-north-star-gap-2026-11-24.md`, or `docs/owner-instructions.md` for truth; of the changed prose I read only the README, the protocol, the FINDINGS rows KIT-07 to KIT-48, the motion and Brief messages, and the receipt.
- `focusIsVisible`, `targetSize`, `shortTransitions`, `layoutShift`, `unseenParts`, `controlsHaveNames`, `tabularNumerals`, `nestedRadii`, `typographicMarks`, `everythingCentered`, `threeSameCards` and `noTimedReload` got one or two pages each, not a sound and a faulty pair.
- The three keyboard walks (`dialogWalk`, `tabsWalk`, `tabOrderWalk`) were not run.
- Hostile pages, tokens, or Briefs (code execution, network, hanging the checker) were not tried; that is another lane.
- The public pages were read live on 2026-11-24, not saved, so their counts may differ on another day. On gov.uk and w3.org I did not confirm by eye whether text is really cut off.
- Chromium only. No animated GIF, no canvas, no frame, no web component of my own.
