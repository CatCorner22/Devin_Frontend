## Summary

This pull request repairs the North Star kit (`packages/kit`, the rules and page checks merged in #6) after two rounds of review, and adds research record 11. It is not merged; the owner decides when.

**What is in it**

- The repairs that missed #6 (KIT-48), the 21 minors of the first review (KIT-21 to KIT-41), and the stricter grade (KIT-19): a page can't be "Crafted" until a person has checked the three floors that only a person can check, and has entered each answer.
- The repairs of the second review (three reviewers and a judge, 2026-11-24) and of the Hinshitsu audit (seven independent auditors, 2026-11-25). `redteam/FINDINGS.md` holds one row for each finding:

| Source | Rows | Repaired | Of these, with a test | Open | Needs the owner |
|---|---|---|---|---|---|
| The judge of the second review (`R2-F-*`) | 34 | 34 | 33 | 0 | 0 |
| The independent review from zero, 2026-11-24, of the lines changed after the judge saw the code (`R2-C14-*`) | 9 | 9 | 9 | 0 | 0 |
| The automated review of this pull request, five rounds on the code and one on the records (`R2-AR-*`) | 25 | 21 | 19 | 4 | 0 |
| Items the judge left for a person (`R2-P-*`) | 12 | 4 | 3 | 8 | 0 |
| The seven auditors of the Hinshitsu run (`H-*`) | 92 | 85 | 45 | 4 | 3 |
| The two re-auditors of the Hinshitsu run (`H-reaudit-*`) | 12 | 12 | 4 | 0 | 0 |
| The second re-auditor of the Hinshitsu run (`H-reaudit2-*`) | 8 | 7 | 3 | 1 | 0 |
| The third auditor of the Hinshitsu run (`H-audit3-*`) | 5 | 5 | 2 | 0 | 0 |
| The fourth auditor of the Hinshitsu run (`H-audit4-*`) | 3 | 3 | 2 | 0 | 0 |
| The fifth auditor of the Hinshitsu run (`H-audit5-*`) | 4 | 4 | 2 | 0 | 0 |

- A row without a test is a correction of a record, a comment or the README, where no test can fail.
- **Open, with the reason in each row:**
  - R2-AR-15 to R2-AR-18 and R2-P-1, R2-P-2, R2-P-4, R2-P-5, R2-P-6, R2-P-8, R2-P-10, R2-P-11: limits of what a page check can read from a page. The kit's README states each.
  - H-correctness-10 (in part): the check of fit now reads six more places a color can sit (for example a list's bullet); the README lists the places it still does not read (for example a first letter).
  - H-adversarial-15, H-forensic-5s-14 (in part), H-forensic-5s-19: matters of form that change nothing a test proves.
  - H-reaudit2-2: the motion check blames a still placeholder in three narrow cases. A repair of it made the check miss moving placeholders and was taken back; the README states the limit.
  - From the first review of the kit: KIT-01, KIT-05 (in part), KIT-42, KIT-44, KIT-45, KIT-46.
- **For the owner to decide:**
  - H-adversarial-11 (also H-best-practices-1 and H-framework-drift-4): the test settings gained one line, which adds the tests of the dependency-audit script and removes none. Acceptance test C3(e) as worded forbids any change to that line. The owner accepted the line on 2026-11-25 ("accept"), so these 3 rows, counted under "Needs the owner" in the table, are settled.
  - KIT-46: a further review of two simple signs needs the owner's approval.
  - M4 still waits on the owner's trial of the Studio (`docs/trial-guide.md`).
- Research record `docs/research/11-north-star-gap-2026-11-24.md`: four ranked proposals toward the North Star, none built.
- Decisions D59 to D63 in `DECISIONS.md`. The repository uses neither Neon nor Vercel (D60).
- `hinshitsu/kit-repairs/` is a record of the owner's Hinshitsu run (log, scopes, reports, saved outputs) and no code.

**What the tests show** (the builder's machine, commit `a8f8c69`, the last commit that changes code; Chromium revision 1255 through `PW_CHROMIUM`)

- `npm run check`: 8 test files, 264 tests passed.
- The kit's browser tests (`apps/studio/e2e/kit.e2e.ts`): 125 passed.
- `npm run e2e`, the full browser suite: not yet run on this commit. It last ran three times in a row at the older commit `a973e47`: 420 tests passed in each (outputs in `hinshitsu/kit-repairs/evidence/final-runs/`).

**What a reviewer should know**

- Two re-auditors and then a second re-auditor checked the repairs made on 2026-11-25 up to commit `a6aa7e9`. No independent reviewer has yet checked the four code commits `56bb8bd`, `7de126a`, `995e4d1` and `a8f8c69`, nor the corrections of records made with them: the first two repair what the fifth auditor found, and the last two repair parts of two older findings that the owner asked to reopen on 2026-11-25. One last independent review examines them; by the owner's word of the same day the builder repairs nothing after it and reports what it finds. a third, a fourth and a fifth auditor checked every commit before them on 2026-11-25 (`hinshitsu/kit-repairs/audits/WU1-audit-after-round2.md`, `WU1-audit-4.md` and `WU1-audit-5.md`), and each found faults that the repair before it had brought.
- Only Chromium is tested. Firefox and Safari are not checked.
- One earlier full browser run failed four Studio tests once; the cause is not found (KIT-41). Three passing runs do not settle it.
- The kit is not connected to the Studio or the Fitter. A page's own script can still deceive a page check; the defense belongs to M7 (see `packages/kit/README.md`).
- The page checks state what they measured. They do not show that a page meets any standard; a person must still check what the receipt lists.

This is the text the builder wrote. Below it the platform appends a footer of its own (the session link, the requester, and the automated review's count).
