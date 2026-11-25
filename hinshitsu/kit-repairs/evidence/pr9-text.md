## Summary

This pull request repairs the North Star kit (`packages/kit`, the rules and page checks merged in #6) after two rounds of review, and adds research record 11. It is not merged; the owner decides when.

**What is in it**

- The repairs that missed #6 (KIT-48), the 21 minors of the first review (KIT-21 to KIT-41), and the stricter grade (KIT-19): a page can't be "Crafted" until a person has checked the three floors that only a person can check, and has entered each answer.
- The repairs of the second review (three reviewers and a judge, 2026-11-24) and of the Hinshitsu audit (seven independent auditors, 2026-11-25). `redteam/FINDINGS.md` holds one row for each finding:

| Source | Rows | Repaired | Of these, with a test | Open | Needs the owner |
|---|---|---|---|---|---|
| The judge of the second review (`R2-F-*`) | 34 | 34 | 33 | 0 | 0 |
| The independent review from zero, 2026-11-24, of the lines changed after the judge saw the code (`R2-C14-*`) | 9 | 9 | 9 | 0 | 0 |
| The automated review of this pull request, four rounds (`R2-AR-*`) | 21 | 17 | 17 | 4 | 0 |
| Items the judge left for a person (`R2-P-*`) | 12 | 4 | 3 | 8 | 0 |
| The seven auditors of the Hinshitsu run (`H-*`) | 92 | 85 | 45 | 4 | 3 |

- A row without a test is a correction of a record, a comment or the README, where no test can fail.
- **Open, with the reason in each row:**
  - R2-AR-15 to R2-AR-18 and R2-P-1, R2-P-2, R2-P-4, R2-P-5, R2-P-6, R2-P-8, R2-P-10, R2-P-11: limits of what a page check can read from a page. The kit's README states each.
  - H-correctness-10: the check of fit does not read some places a color can sit (for example a list's bullet); the README lists them.
  - H-adversarial-15, H-forensic-5s-14, H-forensic-5s-19: matters of form that change nothing a test proves.
  - From the first review of the kit: KIT-01, KIT-05 (in part), KIT-42, KIT-44, KIT-45, KIT-46.
- **For the owner to decide:**
  - H-adversarial-11 (also H-best-practices-1 and H-framework-drift-4): the test settings gained one line, which adds the tests of the dependency-audit script and removes none. Acceptance test C3(e) as worded forbids any change to that line. Accept the line, or reword the test.
  - KIT-46: a further review of two simple signs needs the owner's approval.
  - M4 still waits on the owner's trial of the Studio (`docs/trial-guide.md`).
- Research record `docs/research/11-north-star-gap-2026-11-24.md`: four ranked proposals toward the North Star, none built.
- Decisions D59 to D63 in `DECISIONS.md`. The repository uses neither Neon nor Vercel (D60).
- `hinshitsu/kit-repairs/` is a record of the owner's Hinshitsu run (log, scopes, reports, saved outputs) and no code.

**What the tests show** (the builder's machine, commit `c264167`; Chromium revision 1255 through `PW_CHROMIUM`)

- `npm run check`: 8 test files, 264 tests passed.
- The kit's browser tests (`apps/studio/e2e/kit.e2e.ts`): 122 passed.
- `npm run e2e`, the full browser suite: not yet run on this commit. It last ran three times in a row at the older commit `a973e47`: 420 tests passed in each (outputs in `hinshitsu/kit-repairs/evidence/final-runs/`).

**What a reviewer should know**

- No independent reviewer has yet checked the repairs made on 2026-11-25, after the seven auditors reported. A second, different auditor checks them next.
- Only Chromium is tested. Firefox and Safari are not checked.
- One earlier full browser run failed four Studio tests once; the cause is not found (KIT-41). Three passing runs do not settle it.
- The kit is not connected to the Studio or the Fitter. A page's own script can still deceive a page check; the defense belongs to M7 (see `packages/kit/README.md`).
- The page checks state what they measured. They do not show that a page meets any standard; a person must still check what the receipt lists.
