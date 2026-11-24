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
import { KIT_RULES, grade, receipt, receiptText, repairPlan, designId } from '@refraction/kit';
import * as checks from '@refraction/kit/src/page-checks/index.js';

// In a browser page (Playwright): send each check into the page as text, so that it runs there.
// `tokenFit` also takes the design's tokens. `noSidewaysScroll` answers only when the window is 320 pixels wide.
const findings = [];
for (const fn of Object.keys(checks)) {
  if (fn === 'noSidewaysScroll') await page.setViewportSize({ width: 320, height: 800 });
  const more = fn === 'tokenFit' ? `, ${JSON.stringify(tokens)}` : '';
  findings.push(...await page.evaluate(`(${checks[fn]})(document${more})`));
  if (fn === 'noSidewaysScroll') await page.setViewportSize({ width: 1280, height: 800 });
}

grade(findings, KIT_RULES);               // { grade: 'Below floor' | 'Meets floor' | 'Crafted' | 'Not graded', ... }
repairPlan([findings], KIT_RULES);        // what to repair next, floors first; stops after 3 rounds
receiptText(receipt(findings, KIT_RULES)); // measured / not measured / a person must still check
designId(tokens);                         // 'rx-1a2b3c4d5e6f7a8b': links a build to a design; not secret, proves nothing about authorship
```

`tokenFit` takes a second argument, the design's tokens. `noSidewaysScroll` answers only in a window 320 pixels wide, where the reflow floor is defined; at any other width it reports "could not measure", and the grade is then "Not graded". `layoutShift` and `noScriptedMotion` return a promise; `noScriptedMotion` takes 11 seconds unless a pause button is in view. `unseenParts` belongs to no single rule (`WHOLE_PAGE_CHECKS`); run it with the others, as the loop above does. A rule record may name further checks under `also`.

The example needs a TypeScript-aware runner (Playwright's own, Vitest, or `tsx`): the package ships TypeScript source and has no build step, so plain `node` cannot import it. `checks` holds every page check by name; pass the tokens to `tokenFit` as the example in `apps/studio/e2e/kit.e2e.ts` does (`run`).

## What can go wrong

- **A floor that did not run.** If a floor that a program checks (by a page check or a walk) did not run or could not measure, the grade is "Not graded", never a pass. The window walk (`behavior-dialog-keys`) is such a floor: a checker that runs only the page checks gets "Not graded".
- **Floors that only a person can check.** Three of the 16 floors (no flashing, reduced motion honored, error recovery) are checked by no program. While one of them is open, the grade is at most "Meets floor"; "Crafted" waits for a person (decision D59). A person's answer enters as a finding under the floor's rule id (`{ ruleId: 'neuro-no-flashing', status: 'holds' }`). The grade's result names the open ones in `floorsForAPerson`, and the receipt lists them under "a person must still check". The kit takes the person's word: it cannot tell whether anyone looked.
- **A page that works against the check.** A page check runs inside the page, beside the page's own scripts. A script in the page can replace the browser functions that a check calls, and so hide every fault or keep a check from ever answering. The kit does not defend against this. A checker that grades a page it does not trust must run the checks where the page's scripts cannot reach them (Playwright: with JavaScript switched off for the page, or in a separate script world), must put a time limit on each check, and must record "could not measure" for a check that ran out of time.
- **Parts that no check looks into.** No check looks inside a frame or inside the shadow root of a web component. `unseenParts` reports a frame and an open shadow root (a closed one cannot be seen from outside and goes unreported), every floor that a page check measures is then "could not measure", and the grade is "Not graded".
- **Clicks that a script attached.** The keyboard floor cannot read them. It takes an element that shows the hand pointer (`cursor: pointer`), is no control, and has no Tab stop for one. A mouse-only control without that pointer passes; an element that shows the pointer and answers no click fails.
- **Movement that a script drives.** `noScriptedMotion` watches the page for 11 seconds and takes the 11 seconds each time. It misses movement drawn on a canvas and a change that comes less often than every 5 seconds. Only a visible button marked `data-pause-motion` counts as a pause control.
- **Overflow that the page hides.** At 320 pixels the reflow check also fails content that lies beyond the edge of a page that hides its overflow. It skips parts placed outside the ordinary flow (a drawer, a slide), so it can miss content lost there.
- **A window with no mark.** The check takes a fixed layer that covers the window, with page content beside it, for a window. A window built another way passes unseen.
- **A check that judges by a simple sign.** The loading check looks for class names that contain "loading", "spinner", or "skeleton". The purple-fade check looks only at CSS color fades, not at pictures. A page can pass a check and still have the fault.
- **A check that depends on the browser.** `balancedHeadings` and `layoutShift` report "could not measure" in a browser that lacks the feature. They were tested in Chromium only.
- **Stricter than the source.** Some rules ask for more than the standard they cite. The record's source line says so for each such rule that the review of 2026-11-18 found (finding F-35); a person who compares the remaining records with their sources may find more.
- **Sources.** The builder read the text of each WCAG criterion cited, the summaries of the COGA objectives, and the keyboard sections of two patterns of the ARIA guide. It did not read the longer explanatory pages. A record that cites no source the builder read (its judgment, this tool's plan, or a page it did not open) carries the grade "expert-opinion"; a unit test holds this.
- **The design ID** is a short public fingerprint. Anyone can copy it onto any page.

## How to test it

`npm run check` runs the unit tests. `npm run e2e` runs the browser test with all the others.
