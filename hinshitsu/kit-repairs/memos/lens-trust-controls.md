85444c6e73da484193cca6c1990e78f0
identifier: 85444c6e73da484193cca6c1990e78f0 (https://app.devin.ai/sessions/85444c6e73da484193cca6c1990e78f0)

LENS: Trust and controls · Stage: plan · Commit read: 6b0c2f896a287ee2e0f7646a133b2d5955c160da

## What breaks

1. **The audited commit is not the delivered commit.** For R1. E-19 defines "delivered commit" as the branch head that the delivery report names; the ORCHESTRATOR writes that report and is also the BUILDER of every path (FRAMEWORK.md §5, lines 39-41). Saving audit reports adds commits after each audit, so the head moves by design. Reproduce: `evidence/pr9-refs.txt` shows head 9fa8935; the commit under review is already 6b0c2f8. No CRITERION limits what the later commits touch.
2. **C3's baseline hides the BUILDER's pre-run test and CI edits.** For R1 and R2. C3 diffs against 86287c2, but `git diff 86287c2..6b0c2f8 --stat` shows RUN FOLDER files only. The repairs sit in 9e50434..86287c2 (E-6: 30 files, 780 insertions, 149 deletions). I ran `git diff 9e50434..86287c2 -- '*.test.ts' '*.e2e.ts' | grep -c '^-.*expect'`: 10 removed lines. In that range `.github/workflows/ci.yml` changes its audit step from `npm audit --audit-level=high` to `node scripts/audit.mjs`. No AUDITOR is asked to read either.
3. **The judge report has 1 custodian, and that custodian is the BUILDER.** For R1. C1 and C2 test against a report that the ORCHESTRATOR saves (E-19 preamble). The judge's scope is not logged under this run (E-18, D-003 rejected option b). The 6 reviewer files sit outside the repository (E-17, A-5); G5 (E-13) says they are saved in it. Reproduce: `git ls-files | grep kitrt` prints nothing; `/home/ubuntu/kitrt2/raw` does not exist on a fresh machine.
4. **C6 and C10 name EVIDENCE that the run cannot fetch.** For R1. E-16 records that all 3 `gh api` calls returned HTTP 401. `refs/pull/9/merge` shows "open" only; it cannot show CI status (C6) or the pull request's text (C7, C11).
5. **The pull request's text is unpinned.** For R1. C7 and C11 audit it, but C11's test greps `git diff`, which never holds it. The ORCHESTRATOR can edit it alone after the last audit.
6. **Nothing stops a history rewrite.** For R2. AUDIT-LOG.md line 3 says "append-only"; a force-push to the feature branch defeats it, and no CRITERION tests ancestry.
7. **C8's test is narrower than C8.** `"(@neondatabase|@vercel|vercel)` misses `"neon…` names and tests no lockfile and no network address in pre-run commits.

## What to cut

- C10's merge-ref test as proof of "not merged"; replace it with the saved pull request state (point 4).
- C12's "30 planned" as a control. It reports a number and stops nothing (E-12, row O2).

## What to add

- C3 and C8 baseline: 9e50434. An AUDITOR reads each removed `expect` line and the `ci.yml` change, and names each as sound or weakened.
- SHA-256 of the judge report, the judge's scope and the 6 reviewer files, saved in the RUN FOLDER with the judge's session link. An AUDITOR opens the link and compares.
- Pull request text and CI status saved whole as EVIDENCE at delivery, by an AUDITOR and with a working credential.
- `git merge-base --is-ancestor 6b0c2f8 <delivered commit>` exits 0.
- C12: a run above 30 needs a quoted USER message.

## The 1 change this lens insists on

Add a CRITERION: `git diff --stat <last audited commit>..<delivered commit>` lists only paths under `hinshitsu/kit-repairs/`, and the final AUDITOR, not the ORCHESTRATOR, runs it and names both commits.

## Checked and found sound

- CI runs type check, lint, boundaries, unit tests and `npm run e2e` on every push, with actions pinned by hash (`.github/workflows/ci.yml` lines 19-41). C6 is a real control once its EVIDENCE can be fetched.
- No retry setting hides a flaky test: `vitest.e2e.config.ts` line 5 and `vitest.config.ts` set none. C5 means 3 true passes.
- `evidence/frontend-refs-before.txt` holds 40 lines with its command and time. C9's baseline exists.
- E-1 gives the probe's session link, so a third party can check a saved report against its source.
- `hinshitsu_check.py` is readable from a child session. I ran it at 6b0c2f8: 18 failures, including E-1's 2 path failures that E-10 predicts.

Not checked: the content of `scripts/audit.mjs`, the 10 removed lines one by one, pull request 9 itself, and CI results.
