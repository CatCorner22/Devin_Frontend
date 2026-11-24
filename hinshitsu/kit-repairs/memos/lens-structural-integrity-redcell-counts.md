48b82c9696d94c8c9bc230295bd9f9a4
identifier: 48b82c9696d94c8c9bc230295bd9f9a4

Read at commit 19fbe2f. E-17 is the only `ASSUMPTION` entry; A-1 to A-8 are unchanged. No file changed.

**Marked "Listed: no"**

- P1: `counts`. Absent from A-1 to A-8. Concrete: the final AUDITOR runs C11's test and it fails. EVIDENCE pasted; I re-ran the C11 grep and it prints 2 lines. I did not re-run `hinshitsu_check.py`, so the C12 half rests on the report alone.
- P2: `counts`. Absent. Concrete: a test weakened before 86287c2 passes every diff test and the USER merges it. EVIDENCE pasted; I re-ran both diffs from `9e50434`: 10 removed `expect` lines, 4 added "Neon/Vercel" lines.
- P7: `counts`. Absent. Concrete: dependabot or the USER moves 1 ref of `Frontend`, and C9 fails with no fault of the run. Names the settling test. I confirmed 6 dependabot refs in the baseline file and that the working copy has no `Frontend` remote.
- P8: `counts`. Absent. Concrete: each log commit moves the head, so C7's "delivered commit" has no fixed meaning. EVIDENCE pasted; I re-ran `git ls-remote`: the head is now `173a748`, a 4th value.

**Marked "listed in part"** (ruled on the unlisted part only)

- P3: `counts`. A-7 covers the start state, not what C8's tests detect. Way 2 is concrete with EVIDENCE: `PROGRESS.md` line 42 holds "Neon", confirmed. Way 1 was not seeded, by the report's own words.
- P5: `counts`. A-1 and A-5 cover arrival and completeness, not the judge's pin. Way 2 is concrete with EVIDENCE; I re-ran it: 5 files, 24 insertions, 9 deletions after `83eced7`.

**Marked listed** (P4, P6, P9, P10): not ruled; outside this scope.

At least 1 counts: yes
