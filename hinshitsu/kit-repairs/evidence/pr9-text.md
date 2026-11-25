## Summary

This pull request repairs the North Star kit (`packages/kit`, the rules and page checks merged in #6) after two rounds of review, and adds research record 11. It is not merged; the owner decides when.

**What is in it**

- The repairs that missed #6 (KIT-48), the 21 minors of the first review (KIT-21 to KIT-41), and the stricter grade (KIT-19): a page can't be "Crafted" until a person has checked the three person-only floors.
- The repairs of the second review. `redteam/FINDINGS.md` holds one row for each finding, 61 rows `R2-*`:

| Source | Rows | Repaired, each with a test | Open |
|---|---|---|---|
| The judge of the second review (`R2-F-*`) | 34 | 34 | 0 |
| The independent review from zero of the lines changed after that review (`R2-C14-*`) | 9 | 9 | 0 |
| The automated review of this pull request, three rounds (`R2-AR-*`) | 18 | 14 | 4 |

- **Open, with the reason in each row:** R2-AR-15, R2-AR-16, R2-AR-17, R2-AR-18. Each is a limit of what a page check can read from the page (a click-taking `::before` under a click-through wrapper; an SVG animation that waits for a script; a field in a `dialog` opened with `showModal()` under an inert part; a sentence that holds "n't" before an empty list).
- **For the owner to decide:** nothing in the `R2-*` rows. M4 still waits on the owner's trial of the Studio (`docs/trial-guide.md`).
- Research record `docs/research/11-north-star-gap-2026-11-24.md`: four ranked proposals toward the North Star, none built.
- Decisions D59 to D63 in `DECISIONS.md`. The repository uses neither Neon nor Vercel (D60).
- `hinshitsu/kit-repairs/` is a record of the owner's Hinshitsu run (log, scopes, reports, saved outputs) and no code.

**What the tests show** (the builder's machine, commit `a973e47`, the last commit that changes code; Chromium revision 1255 through `PW_CHROMIUM`; outputs saved in `hinshitsu/kit-repairs/evidence/final-runs/`)

- `npm run check`: 8 test files, 257 tests passed.
- `npm run e2e`, three runs in a row: 3 test files, 420 tests passed in each.

**What a reviewer should know**

- No independent reviewer has yet checked the repairs made after the second review. The Hinshitsu audits run next, and their findings will be added here.
- Only Chromium is tested. Firefox and Safari are not checked.
- One earlier full browser run failed four Studio tests once; the cause is not found (KIT-41). Three passing runs do not settle it.
- The kit is not connected to the Studio or the Fitter. A page's own script can still deceive a page check; the defense belongs to M7 (see `packages/kit/README.md`).
- The page checks state what they measured. They do not show that a page meets any standard; a person must still check what the receipt lists.
