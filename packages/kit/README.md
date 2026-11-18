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
const findings = [];
for (const fn of Object.keys(checks)) findings.push(...await page.evaluate(`(${checks[fn]})(document)`));

grade(findings, KIT_RULES);               // { grade: 'Below floor' | 'Meets floor' | 'Crafted' | 'Not graded', ... }
repairPlan([findings], KIT_RULES);        // what to repair next, floors first; stops after 3 rounds
receiptText(receipt(findings, KIT_RULES)); // measured / not measured / a person must still check
designId(tokens);                         // 'rx-1a2b3c4d': links a build to a design; not secret, proves nothing about authorship
```

`tokenFit` takes a second argument, the design's tokens. `noSidewaysScroll` measures at the present window width; set the window to 320 pixels first for the reflow floor. `layoutShift` returns a promise.

## What can go wrong

- **A floor that did not run.** The grade is then "Not graded", never a pass. The window walk (`behavior-dialog-keys`) is a floor: a checker that runs only the page checks gets "Not graded".
- **A check that judges by a simple sign.** The loading check looks for class names that contain "loading", "spinner", or "skeleton". The purple-fade check looks only at CSS color fades, not at pictures. A page can pass a check and still have the fault.
- **A check that depends on the browser.** `balancedHeadings` and `layoutShift` report "could not measure" in a browser that lacks the feature. They were tested in Chromium only.
- **Stricter than the source.** Some rules ask for more than the standard they cite. The record's source line says so each time.
- **Sources.** The builder read the text of each WCAG criterion cited, the summaries of the COGA objectives, and the keyboard sections of two patterns of the ARIA guide. It did not read the longer explanatory pages. Records whose only source is "the builder's judgment" carry the grade "expert-opinion".
- **The design ID** is a short public fingerprint. Anyone can copy it onto any page.

## How to test it

`npm run check` runs the unit tests. `npm run e2e` runs the browser test with all the others.
