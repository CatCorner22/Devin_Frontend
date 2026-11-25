# References inside the blinded entries of the second review

Added 2026-11-25 (row R2-AR-25 of `redteam/FINDINGS.md`). The files beside this one are evidence, listed with their checksums in `SHA256SUMS`, and are not changed.

`judge-attempts.json` holds the reviewers' 125 attempts under the blind numbers `B-001` to `B-125` that the judge received; `id-map.json` gives the reviewer's own number for each (`TRU-17` is attempt 17 of the drift and truth auditor). The reviewers wrote their texts before the renumbering. Where a text says `attempt-N`, it means attempt N of the same reviewer, and no entry of `judge-attempts.json` has that ID. The table gives the entry that each such reference means.

| Entry that holds the reference | Its number in the reviewer's file | Reference as written | Means | Blind entry to open |
|---|---|---|---|---|
| `B-061` | `TRU-12` | `attempt-3` | `TRU-3` | `B-045` |
| `B-067` | `TRU-18` | `attempt-17` | `TRU-17` | `B-086` |
| `B-069` | `TRU-16` | `attempt-17` | `TRU-17` | `B-086` |
| `B-069` | `TRU-16` | `attempt-15` | `TRU-15` | `B-076` |
| `B-082` | `TRU-9` | `attempt-11` | `TRU-11` | `B-115` |
| `B-082` | `TRU-9` | `attempt-8` | `TRU-8` | `B-047` |
| `B-119` | `TRU-21` | `attempt-15` | `TRU-15` | `B-076` |

7 references in 5 entries. One more entry, `B-118` (`USR-67`), names "attempts a02" and "c03"; those are labels of that reviewer's own working notes inside `USR-report.md` and name no entry of the attempts file.
