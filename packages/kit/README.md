# The kit: rules and checks toward the North Star

## What it is

A package of pure data and small programs that say, for a built page, which known faults it has. It covers what skilled people do without being asked: reading comfort, protection for people who are easily distracted or overloaded, every state of every control, keyboard behavior, small craft details, and the marks that give a page away as machine-made.

The kit is not yet connected to anything. The Studio does not ask its questions and the Fitter does not run its checks; that belongs to milestones M5 and M7 (decision D58).

## What it is not

It does not make a page good, and it does not show that a page works for any person. It removes measurable faults and lists what a person must still check. It never states that a page meets a standard.

## The parts

| Folder | What it holds | May use |
|---|---|---|
| `src/data/` | Rule records, the questions on reading comfort, the state sheet, the keyboard walks, the Brief | Nothing but `zod` |
| `src/logic/` | Design ID, grade, repair plan, receipt, picture comparison, duels, blind-test count | Nothing |
| `src/page-checks/` | Programs that read a drawn page and return findings | The browser's page only |
| `fixtures/` | Two test pages: one built with care, one with one planted defect for every check | |
| `blind-test/` | How to run a blind test with people | |
| `test/` | Unit tests | |

The browser test lives in `apps/studio/e2e/kit.e2e.ts`, because that is where this repository runs browser tests.

## A rule record

Every rule is one record (`src/shapes.ts`): its text in plain words, what goes wrong without it, how it is checked, its evidence grade, its sources, and the date of the last comparison with those sources. A rule has one of three levels:

- **floor**: cannot be switched off. A failed floor gives the grade "Below floor".
- **rule**: a failed rule keeps the grade at "Meets floor".
- **warning**: warns and never lowers the grade. Every mark of a machine-made page is a warning, because a person may want it on purpose.

A rule is checked in one of three ways: by a **page check** (a program reads the page), by a **walk** (a program presses keys and looks where the focus goes), or by a **person** (the record holds the question to ask).

## How to use it

```ts
import { KIT_RULES, grade, receipt, receiptText, repairPlan, designId, type Finding } from '@refraction/kit';
import * as pageChecks from '@refraction/kit/src/page-checks/index.js';

const checks = pageChecks as unknown as Record<string, (...args: never[]) => unknown>;

// In a browser page (Playwright): send each check into the page as text, so that it runs there.
// `tokenFit` also takes the design's tokens. `noSidewaysScroll` answers only when the window is 320 pixels wide.
// `focusIsVisible` moves the focus to each control, which sets off the page's own handlers, so it runs last.
const order = [...Object.keys(checks).filter((fn) => fn !== 'focusIsVisible'), 'focusIsVisible'];
const findings: Finding[] = [];
for (const fn of order) {
  if (fn === 'noSidewaysScroll') await page.setViewportSize({ width: 320, height: 800 });
  const more = fn === 'tokenFit' ? `, ${JSON.stringify(tokens)}` : '';
  findings.push(...(await page.evaluate(`(${checks[fn]})(document${more})`) as Finding[]));
  if (fn === 'noSidewaysScroll') await page.setViewportSize({ width: 1280, height: 800 });
}

grade(findings, KIT_RULES);               // { grade: 'Below floor' | 'Meets floor' | 'Crafted' | 'Not graded', ... }
repairPlan([findings], KIT_RULES);        // what to repair next, floors first; stops after 3 rounds
receiptText(receipt(findings, KIT_RULES)); // four lists: measured / answered by a person / not measured / a person must still check
designId(tokens);                         // 'rx-1a2b3c4d5e6f7a8b': links a build to a design; not secret, proves nothing about authorship
```

`tokenFit` takes a second argument, the design's tokens. `noSidewaysScroll` answers only in a window 320 pixels wide, where the reflow floor is defined; at any other width it reports "could not measure", and the grade is then "Not graded". `layoutShift` and `noScriptedMotion` return a promise; `noScriptedMotion` takes 11 seconds unless a pause button is in view. `unseenParts` belongs to no single rule (`WHOLE_PAGE_CHECKS`); run it with the others, as the loop above does. A rule record may name further checks under `also`.

On `fixtures/good.html` the example prints the grade "Not graded" with `unmeasuredFloors: ['behavior-dialog-keys']`. That is the right answer and no fault of the setup: the example runs no walk, and one floor is checked by a walk.

**The walks.** The kit exports three builders of walks: `dialogWalk(opener, dialog)`, `tabsWalk(tabs)` and `tabOrderWalk(start, order)`. Each returns a plain list of steps (focus this, press that key, expect the focus here) for parts that the caller names by CSS selector. The kit holds no program that runs the steps: the checker runs them. The function `walk` in `apps/studio/e2e/kit.e2e.ts` is a runner of 20 lines to copy. When every step of a walk holds, the checker adds a finding under the walk's `ruleId`, for example `{ ruleId: 'behavior-dialog-keys', status: 'holds' }`; when a step does not, the same with `status: 'fails'`. With the window walk counted, `fixtures/good.html` grades "Meets floor".

**The runner.** Run the example under Vitest, as this repository's browser tests do. The package ships TypeScript source and has no build step, so plain `node` cannot import it. Two other runners were tried on 2026-11-24 and do not work as the example is written: `tsx` rewrites the checks so that they call a helper that does not exist inside the page, and Playwright's own test runner does not find the second import (a relative path to `packages/kit/src/page-checks/index.ts` works there). `checks` holds every page check by name; pass the tokens to `tokenFit` as the example in `apps/studio/e2e/kit.e2e.ts` does (`run`).

## What can go wrong

- **A floor that did not run.** If a floor that a program checks (by a page check or a walk) did not run or could not measure, the grade is "Not graded", never a pass. The window walk (`behavior-dialog-keys`) is such a floor: a checker that runs only the page checks gets "Not graded".
- **Floors that only a person can check.** Three of the 16 floors (no flashing, reduced motion honored, error recovery) are checked by no program. While one of them is open, the grade is at most "Meets floor"; "Crafted" waits for a person (decision D59). A person's answer enters as a finding under the floor's rule id (`{ ruleId: 'neuro-no-flashing', status: 'holds' }`). The grade's result names the open ones in `floorsForAPerson`, and the receipt lists them under "a person must still check". The kit takes the person's word: it cannot tell whether anyone looked.
- **A page that works against the check.** A page check runs inside the page, beside the page's own scripts. A script in the page can replace the browser functions that a check calls, and so hide every fault or keep a check from ever answering. The kit does not defend against this. A checker that grades a page it does not trust must run the checks where the page's scripts cannot reach them (Playwright: in a separate script world), must put a time limit on each check, and must record "could not measure" for a check that ran out of time. Switching JavaScript off for the page is no way to do this: the two timed checks, `noScriptedMotion` and `layoutShift`, wait on the page's own timers, which then never fire, so neither check answers and every page ends "Not graded".
- **A typeface under a borrowed name.** `tokenFit` knows a typeface by its name and by the width of text drawn in it. A page's own `@font-face` rule can give the design's name to another font file; the check then passes. An honest page ships the real file under that name in the same way, so the check cannot tell the two apart. A person who looks at the page can.
- **Parts that no check looks into.** No check looks inside a frame or inside the shadow root of a web component. `unseenParts` reports a frame and an open shadow root (a closed one cannot be seen from outside and goes unreported; a page can write one in plain markup, with no script, and so hide a whole part from every check. A checker that grades a page it does not trust must look for closed roots from outside the page, with the browser's own tools), every floor that a page check measures is then "could not measure", and the grade is "Not graded".
- **Clicks that a script attached.** The keyboard floor cannot read them. It takes an element that shows the hand pointer (`cursor: pointer`), is no control, and has no Tab stop for one. A mouse-only control without that pointer passes; an element that shows the pointer and answers no click fails (a picture or a paragraph with `cursor: pointer`, for example).
- **Movement that the page itself declares.** `noEndlessMotion` reads the animations that the browser lists for the page and the timing written into SVG drawings. It does not see: a moving picture loaded as a file (an animated GIF or SVG in `<img>`), a `dialog`'s `::backdrop` while the dialog is closed, anything inside a closed shadow root, an animation on a first letter (Chromium, the one browser tested, runs none; another browser may), and an animation that stands paused until the pointer is over it. An SVG animation that begins only when asked (`begin="indefinite"`) counts where the page holds a script or a link that names it, and not otherwise.
- **Movement that a script drives.** `noScriptedMotion` watches the page for 11 seconds and takes the 11 seconds each time. It hears a change of the page's parts and text, of a class, a style, a picture's address, a `data-` attribute and an ARIA state, a scroll position that moves, and an animation that a script starts. It misses movement drawn on a canvas, a change that a script makes to a property alone (a radio button's `checked`) or to a rule of the style sheet, and a change that comes less often than every 5 seconds. It counts a change that it hears and that nobody sees (a `data-` attribute that a script rewrites every second on a part that is drawn), and so can blame such a page. A pause control is a button (`<button>`, `<input type="button">` or `role="button"`) that a person can see and reach, and that either carries the mark `data-pause-motion` or has a name that is "Pause" or "Play/Pause", or that starts with "Pause", "Stop", "Freeze", "Halt", "Turn off", "Switch off", "Disable" or "Reduce" and then names what moves ("motion", "animation", "slideshow", "carousel", "video", "scrolling" and the like; the whole list is in `src/page-checks/neuro.ts`). Another wording ("Hold the pictures still"), a name in another language ("Pausar la animación"), and a control of another kind (a checkbox, a link) do not count; put the mark `data-pause-motion` on a button instead. The check reads the name and the mark; it does not press the button, so a button that does nothing still counts.
- **Overflow that the page hides.** At 320 pixels the reflow check also fails content that lies beyond the edge of a page that hides its overflow. It measures text by its letters, and counts controls, drawings, frames, and pictures whose `alt` is not empty. It skips parts that are positioned or moved by a transform (a drawer, a slide moved that way), so it can miss content lost there. It fails slides that wait in a row beside the one in view, though a button brings them in: it cannot tell a slide from content that is lost.
- **A window with no mark.** The check takes a fixed layer that covers the window, with page content beside it, for a window. A window built another way passes unseen. A sound page can also be blamed: a fixed layer that covers the window and lies behind the content (a background, `z-index: -1`) fails this check.
- **A check that judges by a simple sign.** The loading check looks for class names that contain "loading", "spinner", or "skeleton". The purple-fade check looks only at CSS color fades, not at pictures. The loading check so blames a part named `lazyloading` or `loading-dock` and does not see one named `loader` or the words "Please wait". The emoji check blames some plain signs (↗, ☎, ▶) and lets others pass (★, →, ✕, ✓). A page can pass a check and still have the fault.
- **A very large page.** The focus check measures at most 1,000 controls and the size check at most 3,000; beyond that each answers "could not measure", and the page gets "Not graded". Three checks stop reading at a fixed number and judge by what they read: the pause control is looked for among the buttons that carry `data-pause-motion` and then the other buttons, 2,000 in all, and the window check reads at most 200 neighbors of a layer and 50 parts inside each. On a page beyond those numbers a check can answer "holds" or "fails" for a part it did not read.
- **What a script does later.** The autoplay check reads the `autoplay` attribute only: sound or video that a script starts is not read. The time-limit check reads the page's `meta` refresh only: a reload or a redirect that a script sets is not read.
- **A typeface that the checking machine lacks.** `tokenFit` fails the typeface rule when the design's typeface is not installed on the machine that checks and the page ships no file for it. The result then depends on the machine.
- **A part that the page renames.** The repair plan knows a part by the name the check gave it. If a part fails, and the next round finds the same fault under a new id or class, the plan lists the old name as fixed and the new name as a new fault.
- **A check that depends on the browser.** `balancedHeadings` and `layoutShift` report "could not measure" in a browser that lacks the feature. They were tested in Chromium only.
- **Stricter than the source.** Some rules ask for more than the standard they cite. The record's source line says so for each such rule that the review of 2026-11-18 found (finding F-35); a person who compares the remaining records with their sources may find more.
- **Sources.** The builder read the text of each WCAG criterion cited, the summaries of the COGA objectives, and the keyboard sections of two patterns of the ARIA guide. It did not read the longer explanatory pages. A record whose only sources are the builder's judgment, this tool's plan, or a page that the builder did not open carries the grade "expert-opinion"; a unit test fails if one does not.
- **The design ID** is a short public fingerprint. Anyone can copy it onto any page.

## How to test it

`npm run check` runs the unit tests. `npm run e2e` runs the browser test with all the others.
