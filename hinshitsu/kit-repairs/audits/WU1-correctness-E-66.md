# Report of the correctness auditor of WU-1 (entry E-66)

Session: https://app.devin.ai/sessions/c09608166fa742f79da7b6ae7a16a70e

This file holds the auditor's final message, word for word. The auditor's whole report (648 lines) and its evidence are attachments of that session; their addresses stand at the end of the message.

---

devin-c09608166fa742f79da7b6ae7a16a70e

**C1 fails in both versions.** The whole report (648 lines: scope word for word, every command with its output, 12 numbered findings, Not examined) is the attached Markdown file; it is too long to paste here in full, so this message holds the criteria results and the findings in short. Nothing was pushed, no repository file was changed, and pull request 9 was only read.

"k3" is `audit/wu1-k3` at `94a24b2`; "p7" is `audit/wu1-p7` at `79f4f8e`. They differ in 1 line: `packages/kit/src/logic/judge.ts` line 87 reads `given.slice(0, -1)` in k3 and `rounds.slice(0, -1)` in p7.

| CRITERION | k3 | p7 |
|---|---|---|
| C1, 1 row per major entry | holds, 17 rows | holds, 17 rows |
| C1, the judge's and E-58's own reproductions | FAIL: F-1 and F-8 reproduce | FAIL: F-8 reproduces |
| C4 `npm run check` | exit 0, 2 runs, 257 tests each | exit 0, 2 runs, 257 tests each |
| C5 `npm run e2e`, Chromium 1255 | 3 runs in a row, exit 0, 420 tests each | 3 runs in a row, exit 0, 420 tests each |
| C6 | 2 checks passed, 0 failed, 0 pending; "at the delivered commit" UNVERIFIED | the same |
| C8 | both commands print nothing | the same |
| C9 | no `CatCorner22/Frontend` line; 37 refs, none differs | the same |
| C10 | open, not merged when I read it | the same |

C6 is UNVERIFIED in part because my tool prints each check's state and not the commit it ran on; the branch head was `02befa6` when I read it.

**Findings**

1. **BLOCKER, k3 only (C1, R2-F-1).** `repairPlan([[reflow fails], [reflow status "fixed"], []])` returns `stop: true` with no item and nothing still open; p7 keeps the item. An earlier round with an unknown status erases an open failed floor. Fix: line 87 as in p7.
2. **BLOCKER, both (C1, R2-F-8).** The judge's input (2), `<button aria-label="&#x2800;">&#x2715;</button>` alone, still gives `controlsHaveNames: holds`. `behavior.ts` line 244 joins `aria-label` with the text before removing blank letters, so the "✕" counts as the name. The judge's other F-8 inputs now fail as they should.
3. **FRAGILITY, both (C3, not my duty).** No test guards line 87: k3 passes all 257 unit tests and all 420 browser tests with the fault of finding 1.
4. **DEFECT, both — second inputs of F-8.** SVG `<metadata>` text, undrawn SVG `<text>`, U+180E, U+034F, U+FE0F, U+E0020 and a private-use icon letter each count as a name.
5. **DEFECT, both — F-3.** A carousel moved by a data attribute, `aria-hidden`, a CSS variable on `<html>`, a radio's `.checked`, or a style-sheet rule passes both movement checks (`neuro.ts` line 392 watches 4 attributes on `body` only).
6. **DEFECT, both — F-4.** Endless SVG animations that start each other, and endless `::first-letter`, `::marker`, `::backdrop` animations hold; a paused animation that runs only on hover fails.
7. **DEFECT, both — F-2.** `white-space: nowrap` text cut by an `overflow: hidden` or `contain: paint` parent holds at 320 px (`neuro.ts` line 295 reads element boxes only).
8. **DEFECT, both — F-24.** Working pause controls are not seen (`input type="button"`, a labelled checkbox, "Pause banner", "Freeze the banner", Spanish "Pausar la animación"); a pause button inside a closed `details` counts.
9. **DEFECT, both — F-13 and C14-4.** Sound text blamed as filler: Spanish `TODO: pan, dulces y café`, Portuguese `TODO`, a firm named "Acme", "Unleash your dog", "The parcel goes here", "0113 555-0142".
10. **DEFECT, both — F-20.** Off-design colors hold in `::marker`, `::first-letter`, `-webkit-text-stroke`, `column-rule`, `border-image`, `drop-shadow`, SVG gradient stops, SVG `use`, `::selection`, `accent-color`; an off-design radius on a pseudo-element holds.
11. **FRAGILITY, both — single narrow cases.** An SVG-drawn purple hero holds; a `visibility: hidden` spam trap is blamed; a decorative 300 px bullet is blamed as cut text; `grade` throws on a `null` finding; `fromPage` keeps U+0085.
12. **No finding.** The other major rows no longer reproduce with the judge's and E-58's inputs (16 rows in p7, 15 in k3).

Findings 4 to 10 use second inputs I wrote; that test belongs to the adversarial auditor, so I classed them DEFECT. If they are counted under C1, they are BLOCKER.

**Not examined**
- I did not read every function and branch: only `judge.ts` and `placeholders.ts` whole, and the functions the 17 major rows touch.
- `PLAN.md` and `DECISIONS.md` were not read; C2, C3, C7 and C11 to C16 were not tested.
- Minor and note rows were not reproduced.
- For finding 2, I reasoned from how a browser builds a name; I did not read the accessibility tree.
- Run 1 of k3's browser tests ran while my own reproduction pages ran on the same machine; it passed.
- My runs do not settle KIT-41.

The zip holds every saved output, the 43 extracted pages, my 126 second-input pages and the scripts.

ATTACHMENT:{"url":"https://app.devin.ai/attachments/578f4208-a503-4edd-a9ed-ecb0ab3ffa87/WU1-correctness-report.md","fileSize":72879}
ATTACHMENT:{"url":"https://app.devin.ai/attachments/2d5ddfab-9670-4733-b45e-761edcb840cd/wu1-correctness-evidence.zip","fileSize":160686}
