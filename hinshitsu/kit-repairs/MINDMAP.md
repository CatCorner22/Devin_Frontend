# MINDMAP — kit repairs (pull request 9)

## Hierarchy

- **Goal:** "First, please use Hinshitsu." on the kit repairs of pull request 9
  - **C1** confirmed blockers and majors no longer reproduce
    - **WU-1** the module `packages/kit` with its browser test
  - **C3** each repair has a test; no test weakened
    - **WU-1** the module `packages/kit` with its browser test
  - **C4** npm run check exits 0
    - **WU-1** the module `packages/kit` with its browser test
  - **C5** npm run e2e exits 0, 3 times
    - **WU-1** the module `packages/kit` with its browser test
  - **C6** CI green on pull request 9
    - **WU-1** the module `packages/kit` with its browser test
  - **C8** no Neon, no Vercel
    - **WU-1** the module `packages/kit` with its browser test
  - **C2** confirmed minors each have a row
    - **WU-2** the records
  - **C7** records equal command output
    - **WU-2** the records
  - **C9** CatCorner22/Frontend unchanged
    - **WU-2** the records
  - **C10** pull request 9 not merged
    - **WU-2** the records
  - **C11** no claim of compliance
    - **WU-2** the records
  - **C12** full record of the run
    - **WU-2** the records
  - Decisions: **D-001** the run starts on work that exists; **D-002** no change before the S6 answer; **D-003** the judge report names the repairs; **D-004** local Chromium 1255 counts, CI is the control; **D-005** 2 WORK UNITS, M5 not started

## Diagram

```mermaid
graph TD
  G["Goal: use Hinshitsu on the kit repairs of pull request 9"]
  G --> C1["C1 confirmed blockers and majors no longer reproduce"]
  C1 --> WU1
  G --> C2["C2 confirmed minors each have a row"]
  C2 --> WU2
  G --> C3["C3 each repair has a test; no test weakened"]
  C3 --> WU1
  G --> C4["C4 npm run check exits 0"]
  C4 --> WU1
  G --> C5["C5 npm run e2e exits 0, 3 times"]
  C5 --> WU1
  G --> C6["C6 CI green on pull request 9"]
  C6 --> WU1
  G --> C7["C7 records equal command output"]
  C7 --> WU2
  G --> C8["C8 no Neon, no Vercel"]
  C8 --> WU1
  G --> C9["C9 CatCorner22/Frontend unchanged"]
  C9 --> WU2
  G --> C10["C10 pull request 9 not merged"]
  C10 --> WU2
  G --> C11["C11 no claim of compliance"]
  C11 --> WU2
  G --> C12["C12 full record of the run"]
  C12 --> WU2
  WU1["WU-1 packages/kit and its browser test"]
  WU2["WU-2 the records"]
  WU1 --> D001["D-001 the run starts on work that exists"]
  WU1 --> D002["D-002 no change before the S6 answer"]
  WU1 --> D003["D-003 the judge report names the repairs"]
  WU1 --> D004["D-004 local Chromium 1255 counts; CI is the control"]
  WU1 --> D005["D-005 2 WORK UNITS; M5 not started"]
```

## Node check

| Kind | Count in `AUDIT-LOG.md` | Count in this map |
|---|---|---|
| CRITERIA | 12 | 12 |
| WORK UNITS | 2 | 2 |
| Decisions | 5 | 5 |
| FINDINGS | 0 | 0 |

<!-- from the log: start -->
Rebuilt by `scripts/hinshitsu_log.py state`. Do not edit between the marks.
- no FINDING is logged
<!-- from the log: end -->
