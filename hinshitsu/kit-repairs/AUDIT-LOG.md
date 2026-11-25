# AUDIT-LOG

Append-only (rule 9.6). Written by `scripts/hinshitsu_log.py`.

### E-1 · 2026-11-24T19:59:51Z · LAUNCH · ORCHESTRATOR

- Role: capability probe (rule 0.2)
- Scope: prompts/capability-probe.md
- Commit under review: 3e0a97972b02e80e9fb1a0b5a05c51afd6f942a4
- SUB-AGENT identifier: 8694a10570204f93b16215c4c38b6bbd, https://app.devin.ai/sessions/8694a10570204f93b16215c4c38b6bbd
- Report: evidence/capability-probe.md

Live probe of parts 2, 4 and 5 of SWARM-CAPABLE. Written after the runtime returned the identifier and before the reply was read.

### E-2 · 2026-11-24T20:00:14Z · CAPABILITY · ORCHESTRATOR

Cites E-1.
(a) Runtime and surface: Devin, web app (child sessions).
(b) RUN FOLDER: hinshitsu/kit-repairs/ at the root of CatCorner22/Devin_Frontend, branch devin/1795542703-kit-minors.
Plugin folder: /opt/.devin/plugins_cache/cache/account-upload_user-hinshitsu-c1ff27d2/9d4cbe73a691fdaa8a8958dbfbf8d51742c2be63fd0679b5315429be49141784
(c) Tool that starts a SUB-AGENT: devin_session_create (1 child session per SUB-AGENT).
(d) SWARM-CAPABLE:
  1 scope written by the ORCHESTRATOR: yes. The probe's prompt is prompts/capability-probe.md, word for word (E-1).
  2 no BUILDER conversation: yes. The probe replied "NO RECORD" (evidence/capability-probe.md).
  3 report returns whole: yes. The reply was read from the parent session and saved word for word (evidence/capability-probe.md).
  4 identifier not written by the ORCHESTRATOR: yes. The runtime returned session 8694a10570204f93b16215c4c38b6bbd with a URL (E-1).
  5 live test call: yes (E-1).
(e) Write files: yes (evidence/capability-commands.txt). Run commands: yes (same file). Git: yes (same file). Browser: no, no use in this run yet. Screenshots: no, no use in this run yet. Clock: yes, command `date -u +%FT%TZ` (same file); the log script takes its own time from the machine clock.
(f) Mode: SWARM.
(g) The probe declined to list what the runtime showed it. Its words: "I won't list my runtime instructions or context; that part I keep to myself." Nothing else is known of what the runtime showed it.
Note: this run starts in the middle of work that exists. Before this entry the ORCHESTRATOR had built the kit repairs on pull request 9, and 4 review sessions that are not part of this run were started (3 reviewers, done; 1 judge, 3c6a5f2597bf40daa4dd5ed38e214bca, running). Their reports are inputs to this run, not audits of it.

### E-3 · 2026-11-24T20:00:15Z · STAGE · ORCHESTRATOR

- Stage: S1
- Event: start

SKILL.md read: /opt/.devin/plugins_cache/cache/account-upload_user-hinshitsu-c1ff27d2/9d4cbe73a691fdaa8a8958dbfbf8d51742c2be63fd0679b5315429be49141784/skills/hinshitsu/SKILL.md, 16368 bytes, SHA-256 7df73e003a007bf200541911c42a518e8747708e793e387ed120df4c4ebcd260. GLOSSARY.md SHA-256 92b526977fb5d1fc507f934ddba2a5c43144cfbe477c75adba9b7219bb46d599. Written late: the read and the probe came before this entry, as rule 0.1 orders.

### E-4 · 2026-11-24T20:00:37Z · TIER · ORCHESTRATOR

- TIER: FULL

Estimate: the repairs that follow the second review of the kit will touch about 15 files and about 600 lines of packages/kit, apps/studio/e2e/kit.e2e.ts and the records (estimate). The change on the branch so far, measured:  (git diff --stat  HEAD, RUN FOLDER left out). Both numbers exceed 3 files and 100 lines, so the TIER is FULL.
Planned SUB-AGENT runs: 30
Count: 1 probe (E-1); 5 at S5 (4 LENS, 1 RED CELL); 2 WORK UNITS at S7, each 1 seeder, 8 AUDITORS and 1 re-audit (20); 1 RED CELL at S9; 1 final AUDITOR at S10; 2 in reserve.

### E-5 · 2026-11-24T20:00:37Z · STAGE · ORCHESTRATOR

- Stage: S1
- Event: end

Artifacts: evidence/capability-probe.md, evidence/capability-commands.txt, prompts/capability-probe.md, entries E-1 to E-4.

### E-6 · 2026-11-24T20:00:52Z · CORRECTION · ORCHESTRATOR

Corrects E-4. The measured number in E-4 is blank because the command that found the base commit failed. Measured now against origin/claude/brave-mayer-sawqz9 (base 9e504344b5fab5403c2f24f2753affdd0b552758): 30 files changed, 780 insertions(+), 149 deletions(-) (evidence/tier-diffstat.txt). The TIER stays FULL and the planned number stays 30.

### E-7 · 2026-11-24T20:01:02Z · STAGE · ORCHESTRATOR

- Stage: S2
- Event: start

SKILL.md read whole: /opt/.devin/plugins_cache/cache/account-upload_user-hinshitsu-c1ff27d2/9d4cbe73a691fdaa8a8958dbfbf8d51742c2be63fd0679b5315429be49141784/skills/hinshitsu-record/SKILL.md, 11152 bytes, SHA-256 4177d39314f3f9c613de9312a2bcfb3026bf328188c254bb5e5dd803ad756f74. Conductor SKILL.md SHA-256 7df73e003a007bf200541911c42a518e8747708e793e387ed120df4c4ebcd260. GLOSSARY.md SHA-256 92b526977fb5d1fc507f934ddba2a5c43144cfbe477c75adba9b7219bb46d599.

### E-8 · 2026-11-24T20:01:52Z · DECISION · ORCHESTRATOR

D-001: the run starts on work that exists (E-2). D-002: no change to the DELIVERABLE between E-1 and the USER's answer to the S6 card, except work that no pending answer can change (rule 23.5). WORK UNITS declared: WU-1, the module packages/kit with its browser test; WU-2, the records. No earlier DECISION entry exists in this log, so nothing is reversed (rule 8.4).

### E-9 · 2026-11-24T20:01:52Z · STAGE · ORCHESTRATOR

- Stage: S2
- Event: end

Artifacts: FRAMEWORK.md, CONNECTIONS.md, COVERAGE-LEDGER.md, MINDMAP.md, SESSION-STATE.md.

### E-10 · 2026-11-24T20:02:11Z · CORRECTION · ORCHESTRATOR

Corrects E-1. E-1 wrote its 2 paths without backticks and put a comma after the identifier, so `scripts/hinshitsu_check.py` reports "E-1 LAUNCH scope file is missing" and "E-1 LAUNCH has no saved report". Both files exist: Scope: `prompts/capability-probe.md`; Report: `evidence/capability-probe.md`; SUB-AGENT identifier: 8694a10570204f93b16215c4c38b6bbd. E-1 stays as written (rule 9.6); if the script still fails on E-1 at delivery, the delivery report states it.

### E-11 · 2026-11-24T20:03:55Z · STAGE · ORCHESTRATOR

- Stage: S3
- Event: start

SKILL.md read whole: /opt/.devin/plugins_cache/cache/account-upload_user-hinshitsu-c1ff27d2/9d4cbe73a691fdaa8a8958dbfbf8d51742c2be63fd0679b5315429be49141784/skills/hinshitsu-baby-bird-plan/SKILL.md, 10810 bytes, SHA-256 a78531ae274b8f69e947ce88e41a213c84c58983ae2907006a2b4b355092319c. Conductor SKILL.md SHA-256 7df73e003a007bf200541911c42a518e8747708e793e387ed120df4c4ebcd260. GLOSSARY.md SHA-256 92b526977fb5d1fc507f934ddba2a5c43144cfbe477c75adba9b7219bb46d599.

### E-12 · 2026-11-24T20:03:55Z · VOC · ORCHESTRATOR

1. RECIPIENTS
R1 The owner of the repository (the USER, GitHub name CatCorner22). Reads pull request 9 and the records in a web browser on GitHub and in the Devin web app, decides whether to merge, and later runs the Studio on a desktop browser.
R2 A later coding session (an AI agent or a person) that continues the milestones. Reads `PROGRESS.md`, `redteam/FINDINGS.md`, `DECISIONS.md` and `packages/kit/README.md`, and imports `packages/kit` from Node 22 with `npm`.
R3 The Fitter of milestone M7 (not built). It will call the page checks of `packages/kit` inside a Chromium page through Playwright and read the grade, the repair plan and the receipt.

2. Verbatim needs
V1 "First, please use Hinshitsu." (USER, 2026-11-24 14:58 EST)
V2 "Please also edit and audit your code as you work." (USER, 2026-11-24 13:43 EST)
V3 "Please complete all milestones." (USER, 2026-11-24 13:42 EST)
V4 "continue.  Also, I do not want to use Neon or Vercel." (USER, 2026-11-24 12:50 EST)
V5 "Please also do research to get use closer to the North Star (indistinguishable vibe-coding for frontend UI and UX that is indistinguishable from the best human coders)." (USER, 2026-11-24 12:51 EST)
V6 "I trust you.  I defer to you.  Decide for me.  Proceed." (USER, 2026-11-18 12:00 EST)
V7 "You go ahead and make the changes.  Please conduct a full review." (USER, 2026-11-18 05:55 EST)
V8 "Create a new repo with the same files, but do not touch or otherwise alter the repo Frontend" (USER, start of the session; quoted from the session summary, the first message is no longer in view)
V9 "indistinguishable from the best, world-class human, talented coders for UI, UX, neurodivergence, etc." (USER, 2026-11-17 06:39 EST)

3. Observed-workflow needs
O1 The USER merges with 1 word after a report of green checks: "merge" (2026-11-18 12:07 EST); pull requests 5 and 6 were then merged. Pull request 9 is open (evidence/s3-facts.txt).
O2 The USER watches the cost of the session: "please pause for now.  I am at 90% of usage (10% remaining) and I really need the hinshitsu skill pack done" (2026-11-18 12:18 EST).
O3 The USER has sent no answer to the Studio trial of milestone M4 and no answer to the question on milestone order (asked 2026-11-24, 2 times). `PROGRESS.md` names M4 as the current milestone (evidence/s3-facts.txt).
O4 The USER reads short reports with links and decides from them; no message of the USER quotes code or a file path. Looked in: the messages of this session from 2026-11-17 to 2026-11-24.
O5 The USER's rules in `CLAUDE.md` (2026-11-14): run `npm run check` after a code change and `npm run e2e` after a change to the Studio's screens; never weaken a test; never write "WCAG compliant", "ADA compliant" or "accessible" as a claim about output.
V3 and O3 disagree in part: V3 asks for all milestones, and O3 shows that the trial that closes M4 has not been done. Past behavior controls: this run does not start M5.

4. Translation
| Customer language | Technical requirement | CRITERION |
|---|---|---|
| V1 "First, please use Hinshitsu." | The remaining work on pull request 9 runs through the 12 STAGES, with independent audits and a saved record | C12 |
| V2 "edit and audit your code as you work" | Each confirmed finding of the second review is logged, and each blocker and major is repaired with a test that fails without the repair | C1, C2, C3 |
| V3 "Please complete all milestones." | The unit in flight on pull request 9 ends with green checks; M5 does not start in this run (O3) | C4, C5, C6 |
| V4 "I do not want to use Neon or Vercel." | No dependency, configuration file or network call for Neon or Vercel | C8 |
| V5 research toward the North Star | The research record of 2026-11-24 stays in the pull request with its source marks | C7 |
| V6 "Decide for me." | Choices that are not the USER's alone are made by the AGENT and listed | C12 |
| V7 "Please conduct a full review." | The second review (3 reviewers and a judge) is closed: each of its 125 attempts has a ruling and each confirmed finding a row in `redteam/FINDINGS.md` | C1, C2 |
| V8 "do not touch or otherwise alter the repo Frontend" | No push to CatCorner22/Frontend | C9 |
| V9 "indistinguishable from the best ... human ... coders" | A page check neither passes a page with the fault a confirmed finding names, nor blames the sound page a confirmed finding names | C1 |
| O1 merges on the USER's word | Pull request 9 stays open until the USER says to merge | C10 |
| O2 cost | The number of SUB-AGENT runs is stated before they start and is not passed without the USER's word | C12 |
| O3 M4 open | `PROGRESS.md` still names M4 as current and its exit test as open | C7 |
| O4 short reports | The delivery message is short, in plain words, with links | C12 |
| O5 the USER's rules | No test is skipped, removed or weakened; no claim of compliance | C3, C11 |

5. VOC-ASSUMED
VA1 "Use Hinshitsu" covers the work in flight on pull request 9 (the second review and its repairs), not a restart of earlier merged work and not the milestones M5 to M12. Guess made: yes. A wrong guess changes the CRITERIA, so the S6 card asks.
VA2 The USER accepts about 30 SUB-AGENT runs for this run. Guess made: yes. Spending belongs to the USER, so the S6 card asks.
VA3 R2 and R3 run Node 22 and Chromium, as the repository's `CLAUDE.md` states for the stack. Guess made: yes; source is the repository, not the USER.

### E-13 · 2026-11-24T20:03:55Z · GAP · ORCHESTRATOR

G1 What happens on error. Gap: a page check that throws, or a result with a status the grade does not know, has to end as "could not measure" or "fails", never as a pass; the reviewers claim 2 paths where it ends as a pass. Answer: cover under C1 once the judge rules. Reason: a wrong pass is the worst outcome of a check. Cost: part of WU-1. Decides: AGENT. Assumed.
G2 Empty, huge and invalid input. Gap: an empty page, a page of 10,000 or more elements and a malformed finding list are named in reviewer claims. Answer: repair what the judge confirms as blocker or major; log the rest. Cost: part of WU-1. Decides: AGENT. Assumed.
G3 Small screens and other devices. Gap: the browser tests run in Chromium only; Firefox and Safari are not tested. Answer: leave as is and state it in the delivery report as not checked. Reason: the repository pins 1 browser and a second is a change of stack. Cost: none. Decides: AGENT. Assumed.
G4 Who may use it and who must not. No gap: the tool is for the owner alone (`CLAUDE.md`), the kit has no account and no network call.
G5 Secrets and private data. No gap: the run reads and writes no secret; reviewer reports are saved whole and hold none (the ORCHESTRATOR reads each before saving it in the repository).
G6 Backup and undo. No gap: every change is a commit on a feature branch of pull request 9; `git revert` undoes each.
G7 Cost to run. Gap: the run spends SUB-AGENT runs, each a Devin session. Answer: 30 planned (E-4), stated on the S6 card. Decides: USER.
G8 Upkeep and who maintains it. Gap: the RUN FOLDER `hinshitsu/kit-repairs/` adds files to the pull request that no code uses. Answer: keep it in the repository, as the adapter directs, so R2 can read the record. Cost: about 40 files of text. Decides: AGENT. Assumed.
G9 What the RECIPIENT sees when it breaks. Gap: R1 sees a red CI run on the pull request; R3 gets a finding with the status "could not measure". The intermittent failure of 4 Studio tests (KIT-41) has no known cause. Answer: C5 runs the browser suite 3 times; a failure is reported, not hidden. Cost: about 45 minutes of machine time. Decides: AGENT. Assumed.
G10 Licenses and legal terms. No gap: the run adds no dependency. The hinshitsu plugin stays outside the repository; only the record it produces is committed.
G11 How the RECIPIENT gets it and opens it. Gap: R1 gets pull request 9 and a delivery report; the report is a file in the RUN FOLDER and is also attached to the delivery message. No other gap.
G12 Milestone order. Gap: M4 waits on the USER's own trial, and V3 asks for all milestones. Answer: keep M4 open, finish this unit, and ask on the S6 card whether M5 to M7 start while M4 waits. Decides: USER.
G13 The judge of the second review was started before this run and is not an AUDITOR of this run. Answer: treat its report as an input that names what to repair; this run's own AUDITORS check the repairs. Cost: none. Decides: AGENT. Assumed.
G14 Devin Review (an automated reviewer) starts on each push and its findings arrive during the run. Answer: handle them inside WU-1 as inputs, as before. Decides: AGENT. Assumed.

### E-14 · 2026-11-24T20:03:55Z · STAGE · ORCHESTRATOR

- Stage: S3
- Event: end

Artifacts: entries VOC and GAP, evidence/s3-facts.txt.

### E-15 · 2026-11-24T20:03:55Z · STAGE · ORCHESTRATOR

- Stage: S4
- Event: start

SKILL.md read whole: /opt/.devin/plugins_cache/cache/account-upload_user-hinshitsu-c1ff27d2/9d4cbe73a691fdaa8a8958dbfbf8d51742c2be63fd0679b5315429be49141784/skills/hinshitsu-baby-bird-plan/SKILL.md, 10810 bytes, SHA-256 a78531ae274b8f69e947ce88e41a213c84c58983ae2907006a2b4b355092319c. Conductor SKILL.md SHA-256 7df73e003a007bf200541911c42a518e8747708e793e387ed120df4c4ebcd260. GLOSSARY.md SHA-256 92b526977fb5d1fc507f934ddba2a5c43144cfbe477c75adba9b7219bb46d599.

### E-16 · 2026-11-24T20:04:47Z · CORRECTION · ORCHESTRATOR

Corrects E-12 (VOC), part O1. The 3 `gh api` commands in evidence/s3-facts.txt failed with "Bad credentials (HTTP 401)", so that file does not show the state of pull request 9. Replaced by evidence/pr9-refs.txt: GitHub serves `refs/pull/9/merge`, a ref it keeps only for a pull request that is open, and `refs/pull/9/head` equals the branch head. The refs of CatCorner22/Frontend at this time are saved whole in evidence/frontend-refs-before.txt as the baseline for the CRITERION on that repository.

### E-17 · 2026-11-24T20:04:47Z · ASSUMPTION · ORCHESTRATOR

A-1 The judge session 3c6a5f2597bf40daa4dd5ed38e214bca ends with a report that rules on each of the 125 attempts. Rests on it: D-003 (the judge report names what WU-1 repairs). EVIDENCE: not verified; the judge is running. If false: the ORCHESTRATOR sends the USER a card, because C1 and C2 then have no list to test against.
A-2 Chromium revision 1255, used on this machine through `PW_CHROMIUM`, gives the same test results as revision 1254, which Playwright 1.65.0 expects and CI installs. Rests on it: D-004 (local browser runs count as EVIDENCE for C4 and C5). EVIDENCE: not verified by a side-by-side run; CI is the control (C6). If false: a local pass is not a pass in CI, and C6 fails.
A-3 "First, please use Hinshitsu." covers the work in flight on pull request 9 and not the milestones M5 to M12 (VA1). Rests on it: D-005 (scope of the run is 2 WORK UNITS). EVIDENCE: not verified; the S6 card asks. If false: the CRITERIA and the planned number of SUB-AGENT runs change.
A-4 The USER accepts 30 SUB-AGENT runs (VA2). Rests on it: D-005. EVIDENCE: not verified; the S6 card asks. If false: the TIER or the number of AUDITORS per WORK UNIT changes by the USER's word only.
A-5 The 3 reviewer reports of the second review are complete as saved. Rests on it: D-003. EVIDENCE: 6 files in /home/ubuntu/kitrt2/raw/ (SEC, TRU, USR; each 1 report and 1 attempts file), 125 attempts in the combined input; the files are outside the repository. If false: a claim is lost before the judge sees it.
A-6 Pull request 9 is open and its head is the branch head. Rests on it: D-005. EVIDENCE: evidence/pr9-refs.txt. Verified.
A-7 The repository has no dependency or configuration for Neon or Vercel now. Rests on it: C8 starts from a clean state. EVIDENCE: evidence/s3-facts.txt (0 matches in the 4 package.json files; the 20 files that hold either word are documents, records and 2 Catalog files that cite Vercel's published guidelines as a source). Verified for the package files; the 2 Catalog files were read earlier in the session, before this run.
A-8 The intermittent failure of 4 Studio tests (KIT-41) is not caused by the kit. Rests on it: D-004. EVIDENCE: not verified; the cause is unknown. If false: C5 fails and the failure is a FINDING.
Sent to: the 4 LENS SUB-AGENTS and the RED CELL at S5 (in each scope); A-3 and A-4 to the USER on the S6 card.

### E-18 · 2026-11-24T20:04:47Z · DECISION · ORCHESTRATOR

D-003 The judge's report of the second review is the list of what WU-1 repairs; this run's own AUDITORS, not the judge, check the repairs. Rests on A-1, A-5. Reason: the review was started on the USER's delegation ("Decide for me.") before V1, and a second reproduction of 125 attempts would spend runs for no new facts. Rejected: (a) discard the review and audit the kit from zero under this run, about 8 more runs and the loss of 125 saved attempts; (b) treat the judge as an AUDITOR of this run, rejected because its scope was not written and logged under this run.
D-004 Local runs with Chromium revision 1255 count as EVIDENCE, and CI on the pull request is the control. Rests on A-2, A-8. Reason: revision 1254 is absent on this machine. Rejected: install revision 1254, rejected because CI already runs it on each push.
D-005 The run covers 2 WORK UNITS on pull request 9 (WU-1 the module `packages/kit` with its browser test, WU-2 the records) and does not start M5. Rests on A-3, A-4, A-6. Reason: `CLAUDE.md` hard rule 1 and O3. Rejected: fold M5 to M7 into this run, rejected because milestone order belongs to the USER.
Cites the ASSUMPTION entry directly above.

### E-19 · 2026-11-24T20:04:47Z · CRITERIA · ORCHESTRATOR

- Status: PROPOSED

"Delivered commit" means the head of branch `devin/1795542703-kit-minors` named in the delivery report. "Judge report" means the report of session 3c6a5f2597bf40daa4dd5ed38e214bca, saved whole in the RUN FOLDER.
C1 Each finding the judge report confirms with the class blocker or major has 1 row in `redteam/FINDINGS.md`, and its reproduction steps no longer produce the faulty output at the delivered commit. Test: the correctness AUDITOR runs each confirmed reproduction at the delivered commit and saves the output; 0 reproduce.
C2 Each finding the judge report confirms with the class minor has 1 row in `redteam/FINDINGS.md` that states either the repair with its commit or the words "open" with a reason. Test: the framework-drift AUDITOR compares the judge report with the file, row by row; 0 missing.
C3 Each repair under C1 has a test that fails when the repair is removed, and no test is skipped, deleted or weakened. Test: the seeder removes or breaks 1 repair in a copy and the swarm's test run goes red; the adversarial AUDITOR reverts each repair commit in a scratch copy and records which test fails; `git diff` of the test files against commit 86287c2 shows no removed assertion and `grep -rn "\.skip\|\.only\|\.todo"` over the test files prints nothing new.
C4 `npm run check` exits with code 0 at the delivered commit. Test: an AUDITOR runs it and saves the output.
C5 `npm run e2e` exits with code 0 at the delivered commit 3 times in a row. Test: an AUDITOR runs it 3 times and saves the 3 outputs.
C6 Every CI check on pull request 9 at the delivered commit ends in success. Test: the CI status of the pull request, saved as EVIDENCE.
C7 Each number and status in `PROGRESS.md`, `packages/kit/README.md`, `redteam/FINDINGS.md` and the text of pull request 9 that describes the kit equals what a command prints at the delivered commit; `PROGRESS.md` names M4 as the current milestone with its exit test open; `docs/research/11-north-star-gap-2026-11-24.md` is present. Test: the framework-drift AUDITOR lists each number and status with the command that confirms it; 0 mismatches.
C8 The repository holds no dependency, configuration file or network address for Neon or Vercel. Test: `grep -c -i -E "\"(@neondatabase|@vercel|vercel)"` over every package.json prints 0 for each; no `vercel.json`, `.vercel` or `neon` configuration file exists; `git diff 86287c2..<delivered commit>` adds no line that holds "neon" or "vercel" outside the RUN FOLDER.
C9 The repository CatCorner22/Frontend has the same refs after the run as before it. Test: `git ls-remote https://github.com/CatCorner22/Frontend` at delivery equals evidence/frontend-refs-before.txt.
C10 Pull request 9 is open and not merged at delivery, unless the USER has written an instruction to merge during the run. Test: `git ls-remote origin 'refs/pull/9/*'` shows the merge ref, and the pull request's state is saved as EVIDENCE.
C11 No line added by the run states that output is "WCAG compliant", "ADA compliant" or "accessible". Test: `git diff 86287c2..<delivered commit> | grep -i -E "^\+.*(WCAG compliant|ADA compliant)"` prints nothing, and the language AUDITOR reads each added line that holds "accessible".
C12 The RUN FOLDER holds the full record of the run: each of the 12 STAGES has a start entry and an end or skipped entry, each SUB-AGENT run has its scope and its whole report saved, and the delivery report states for every CRITERION one of VERIFIED, FAIL or UNVERIFIED and states the number of SUB-AGENT runs used against 30 planned. Test: `python3 <plugin folder>/scripts/hinshitsu_check.py hinshitsu/kit-repairs` and the final AUDITOR's reading.

### E-20 · 2026-11-24T20:04:47Z · STAGE · ORCHESTRATOR

- Stage: S4
- Event: end

Artifacts: entries ASSUMPTION, DECISION (D-003 to D-005), CRITERIA (PROPOSED), CORRECTION; evidence/pr9-refs.txt, evidence/frontend-refs-before.txt.

### E-21 · 2026-11-24T20:05:17Z · STAGE · ORCHESTRATOR

- Stage: S5
- Event: start

SKILL.md read whole: /opt/.devin/plugins_cache/cache/account-upload_user-hinshitsu-c1ff27d2/9d4cbe73a691fdaa8a8958dbfbf8d51742c2be63fd0679b5315429be49141784/skills/hinshitsu-challenge/SKILL.md, 8654 bytes, SHA-256 48369af037a95b914cf5cdee9b7185c58ea0754a76a92ab60aa7160af3c3e444. Conductor SKILL.md SHA-256 7df73e003a007bf200541911c42a518e8747708e793e387ed120df4c4ebcd260. GLOSSARY.md SHA-256 92b526977fb5d1fc507f934ddba2a5c43144cfbe477c75adba9b7219bb46d599. A copy of GLOSSARY.md is saved at reference/GLOSSARY.md, because a child session cannot read the plugin folder.

### E-22 · 2026-11-24T20:06:09Z · LAUNCH · ORCHESTRATOR

- Role: LENS recipient experience (plan)
- Scope: `prompts/S5-lens-recipient-experience.md`
- Commit under review: 6b0c2f896a287ee2e0f7646a133b2d5955c160da
- SUB-AGENT identifier: 8323a0e4e6d14590bcbf71ca9817df03 https://app.devin.ai/sessions/8323a0e4e6d14590bcbf71ca9817df03
- Report: `memos/lens-recipient-experience.md`

Started at S5 in parallel with the 4 other S5 runs. Written when the runtime returned the identifier and before any reply was read.

### E-23 · 2026-11-24T20:06:09Z · LAUNCH · ORCHESTRATOR

- Role: LENS minimal viable sequence (plan)
- Scope: `prompts/S5-lens-minimal-viable-sequence.md`
- Commit under review: 6b0c2f896a287ee2e0f7646a133b2d5955c160da
- SUB-AGENT identifier: d2852c9f69794449a9aa8912f68dabd6 https://app.devin.ai/sessions/d2852c9f69794449a9aa8912f68dabd6
- Report: `memos/lens-minimal-viable-sequence.md`

Started at S5 in parallel with the 4 other S5 runs. Written when the runtime returned the identifier and before any reply was read.

### E-24 · 2026-11-24T20:06:09Z · LAUNCH · ORCHESTRATOR

- Role: LENS structural integrity (plan)
- Scope: `prompts/S5-lens-structural-integrity.md`
- Commit under review: 6b0c2f896a287ee2e0f7646a133b2d5955c160da
- SUB-AGENT identifier: 48b82c9696d94c8c9bc230295bd9f9a4 https://app.devin.ai/sessions/48b82c9696d94c8c9bc230295bd9f9a4
- Report: `memos/lens-structural-integrity.md`

Started at S5 in parallel with the 4 other S5 runs. Written when the runtime returned the identifier and before any reply was read.

### E-25 · 2026-11-24T20:06:09Z · LAUNCH · ORCHESTRATOR

- Role: LENS trust and controls (plan)
- Scope: `prompts/S5-lens-trust-controls.md`
- Commit under review: 6b0c2f896a287ee2e0f7646a133b2d5955c160da
- SUB-AGENT identifier: 85444c6e73da484193cca6c1990e78f0 https://app.devin.ai/sessions/85444c6e73da484193cca6c1990e78f0
- Report: `memos/lens-trust-controls.md`

Started at S5 in parallel with the 4 other S5 runs. Written when the runtime returned the identifier and before any reply was read.

### E-26 · 2026-11-24T20:06:09Z · LAUNCH · ORCHESTRATOR

- Role: RED CELL full attack on the plan
- Scope: `prompts/S5-redcell-plan.md`
- Commit under review: 6b0c2f896a287ee2e0f7646a133b2d5955c160da
- SUB-AGENT identifier: fce95ac069464b2eb6ca91aebeec3348 https://app.devin.ai/sessions/fce95ac069464b2eb6ca91aebeec3348
- Report: `audits/redcell-plan.md`

Started at S5 in parallel with the 4 other S5 runs. Written when the runtime returned the identifier and before any reply was read.

### E-27 · 2026-11-24T20:25:29Z · LAUNCH · ORCHESTRATOR

- Role: LENS structural integrity, ruling on the RED CELL's unlisted PREMISES
- Scope: `prompts/S5-redcell-counts.md`
- Commit under review: 19fbe2f2dca2b89a655183492564dc0cb436259a
- SUB-AGENT identifier: 48b82c9696d94c8c9bc230295bd9f9a4 https://app.devin.ai/sessions/48b82c9696d94c8c9bc230295bd9f9a4
- Report: `memos/lens-structural-integrity-redcell-counts.md`

A second message to the session of E-24, not a new session. Counted as 1 SUB-AGENT run all the same: 7 of 30 used.

### E-28 · 2026-11-24T20:25:50Z · FINDING · auditor: RED CELL

- ID: F-1
- Class: BLOCKER
- Where: E-19, test of C11
- Trigger: Run `git diff 86287c2..HEAD | grep -i -E "^\+.*(WCAG compliant|ADA compliant)"`; it prints 2 lines from the RUN FOLDER
- Violates: C11's own test; the CRITERION cannot be VERIFIED as written
- Raised by: RED CELL, LAUNCH E-26, `audits/redcell-plan.md`, finding F-1
- Lens: structural integrity
- Forward work stopped: yes — BLOCKER

### E-29 · 2026-11-24T20:25:50Z · FINDING · auditor: RED CELL

- ID: F-2
- Class: BLOCKER
- Where: E-19, test of C12; E-1, E-2
- Trigger: Run `hinshitsu_check.py hinshitsu/kit-repairs`; 8 failures sit in entries that the append-only log forbids rewriting
- Violates: C12's own test
- Raised by: RED CELL, LAUNCH E-26, `audits/redcell-plan.md`, finding F-2
- Lens: trust and controls
- Forward work stopped: yes — BLOCKER

### E-30 · 2026-11-24T20:25:50Z · FINDING · auditor: RED CELL

- ID: F-3
- Class: BLOCKER
- Where: E-19, baseline 86287c2 of C3, C8, C11
- Trigger: Run the 2 diffs from 9e50434; 10 removed assertion lines and 4 added lines that hold Neon or Vercel lie outside every test
- Violates: C3 ("no test is ... weakened"), CLAUDE.md hard rule 3
- Raised by: RED CELL, LAUNCH E-26, `audits/redcell-plan.md`, finding F-3
- Lens: trust and controls
- Forward work stopped: yes — BLOCKER

### E-31 · 2026-11-24T20:25:51Z · FINDING · auditor: RED CELL

- ID: F-4
- Class: BLOCKER
- Where: D-003, C1
- Trigger: `git diff --stat 83eced7..86287c2 -- packages/kit/src` prints 5 files, 24 insertions, 9 deletions made after the commit the judge reproduces at
- Violates: CLAUDE.md hard rule 12; the pattern KIT-46 records
- Raised by: RED CELL, LAUNCH E-26, `audits/redcell-plan.md`, finding F-4
- Lens: trust and controls
- Forward work stopped: yes — BLOCKER

### E-32 · 2026-11-24T20:25:51Z · FINDING · auditor: RED CELL

- ID: F-5
- Class: BLOCKER
- Where: E-19, C5; A-2
- Trigger: Unset PW_CHROMIUM and run the kit browser test: 77 skipped, 1 file failed
- Violates: C5 is not repeatable as written
- Raised by: RED CELL, LAUNCH E-26, `audits/redcell-plan.md`, finding F-5
- Lens: recipient experience
- Forward work stopped: yes — BLOCKER

### E-33 · 2026-11-24T20:25:51Z · FINDING · auditor: RED CELL

- ID: F-6
- Class: BLOCKER
- Where: E-19, C8
- Trigger: Edit PROGRESS.md line 42 as WU-2 must; the diff rule of C8 then fails
- Violates: C8 and C7 cannot both pass
- Raised by: RED CELL, LAUNCH E-26, `audits/redcell-plan.md`, finding F-6
- Lens: structural integrity
- Forward work stopped: yes — BLOCKER

### E-34 · 2026-11-24T20:25:51Z · FINDING · auditor: RED CELL

- ID: F-7
- Class: BLOCKER
- Where: E-19, C1 to C3
- Trigger: A judge report with 0 blockers and 0 majors, as on 2026-11-18
- Violates: V2 and V9: delivery VERIFIED with 0 repairs
- Raised by: RED CELL, LAUNCH E-26, `audits/redcell-plan.md`, finding F-7
- Lens: minimal viable sequence
- Forward work stopped: yes — BLOCKER

### E-35 · 2026-11-24T20:26:37Z · CRITERIA · ORCHESTRATOR

- Status: PROPOSED
- Approval: approval: pending

Replaces the text of E-19 after the S5 challenge (4 memos under `memos/`, `audits/redcell-plan.md`). E-19 stays as written.
Terms. "Base" is commit 9e50434, the base of pull request 9. "Audited commit" is the commit named in the scopes of the last audit round. "Delivered commit" is the head of branch `devin/1795542703-kit-minors` named in the delivery report. "Judge report" is the report of session 3c6a5f2597bf40daa4dd5ed38e214bca, saved whole at `evidence/second-review/judge-report.md` with its SHA-256. "RUN FOLDER" is `hinshitsu/kit-repairs/`.
C1 Each finding the judge report confirms with the class blocker or major has 1 row in `redteam/FINDINGS.md` that cites the judge's finding ID, and the fault no longer appears at the audited commit. Test: the correctness AUDITOR runs each confirmed reproduction and saves the output, 0 reproduce; the adversarial AUDITOR runs a 2nd input of the same fault for each, 0 reproduce. If the judge confirms 0 blockers and 0 majors, the delivery report says so in its summary and C14 still applies.
C2 Each finding the judge report confirms with the class minor, and each item it marks for a person to settle, has 1 row in `redteam/FINDINGS.md` that cites the judge's finding ID and states the repair with its commit, or "open" with a reason, or "Needs the owner". Test: the framework-drift AUDITOR compares the judge report with the file row by row, 0 missing; the delivery report lists every "open" and "Needs the owner" row by ID for the USER.
C3 Each repair under C1 is 1 commit that holds the repair and a test that fails without it, and no test between the base and the delivered commit is skipped, deleted or weakened. Test: the seeder breaks 1 repair in a copy and the test run goes red; the adversarial AUDITOR reverts each repair commit in a scratch copy and names the test that fails; an AUDITOR reads every removed assertion line of `git diff 9e50434..<audited commit>` over the test files and rules each sound or weakened, 0 weakened; `grep -rnE "\b(it|test|describe)\.(skip|only|todo|fails|skipIf|runIf)"` over the test files prints nothing; `vitest.config.ts` and `vitest.e2e.config.ts` hold no retry setting and no timeout above the one at the base.
C4 `npm run check` exits with code 0 at the audited commit. Test: an AUDITOR runs it and saves the output.
C5 `PW_CHROMIUM=$HOME/.cache/ms-playwright/chromium-1255/chrome-linux64/chrome npm run e2e` exits with code 0 at the audited commit 3 times in a row. Test: an AUDITOR runs it and saves every output. Every run started is counted; a red run is a FINDING and no later run erases it. If a test outside `kit.e2e.ts` fails, C5 is reported FAIL with the names of the tests and the USER decides. 3 green runs do not settle the unknown cause of KIT-41, and the delivery report says so.
C6 Every CI check on pull request 9 at the delivered commit ends in success. Test: an AUDITOR reads the status of the pull request and saves it.
C7 Each number and status that describes the kit in `PROGRESS.md`, `packages/kit/README.md`, the rows KIT-* of `redteam/FINDINGS.md`, the rows this run adds, and the text of pull request 9 equals what a command prints at the audited commit; `PROGRESS.md` names M4 as the current milestone with its exit test open, and its part "Waiting on the owner" lists every question this run puts to the USER; the text of pull request 9 says in 1 line that the RUN FOLDER is a record and no code. Test: the framework-drift AUDITOR lists each number and status with the command that confirms it, 0 mismatches, and saves the text of the pull request whole.
C8 The repository holds no dependency, configuration file or network address for Neon or Vercel. Test: `grep -n -i -E "\"(@neondatabase/|@neon|neon|@vercel/|vercel)[^\"]*\" *:|neon\.tech|vercel\.app|vercel\.com/api"` over every `package.json`, `package-lock.json`, `.github/workflows/*` and `.env*` prints nothing; no `vercel.json` and no `.vercel` exist. Lines of record that state decision D60 or cite Vercel's published guidelines as a source are allowed.
C9 The run pushes nothing to CatCorner22/Frontend. Test: `git remote -v` in the working copy names no remote of that repository, and no command in the EVIDENCE pushes to it; as a 2nd reading, `git ls-remote https://github.com/CatCorner22/Frontend` is compared with `evidence/frontend-refs-before.txt` and each ref that differs is named with who moved it.
C10 Pull request 9 is open and not merged at delivery, unless the USER has written an instruction to merge during the run. Test: an AUDITOR reads the state of the pull request and saves it.
C11 No line added between the base and the delivered commit, outside the RUN FOLDER, claims that output meets a standard. Test: `git diff 9e50434..<delivered commit> -- . ':!hinshitsu' | grep -n -i -E "^\+.*(WCAG|ADA |accessib)"`; the language AUDITOR reads each line printed and rules it a claim or no claim, 0 claims.
C12 The RUN FOLDER holds the full record of the run. Test: `python3 <plugin folder>/scripts/hinshitsu_check.py hinshitsu/kit-repairs` reports no failure except the 8 that sit in E-1 and E-2, which the append-only log forbids rewriting and which the entries E-10 and a later `CORRECTION` of E-2 answer; the final AUDITOR confirms each of the 8 against those entries. A SUB-AGENT run above 30 exists only after a quoted message of the USER that allows it.
C13 The delivered commit differs from the audited commit only inside the RUN FOLDER, and no history is rewritten. Test: the final AUDITOR runs `git diff --stat <audited commit>..<delivered commit>`, every path starts with `hinshitsu/kit-repairs/`; `git merge-base --is-ancestor 6b0c2f8 <delivered commit>` exits 0; the final AUDITOR names both commits.
C14 The lines of `packages/kit/src` that changed after the commit the second review saw are reviewed from zero, and the judge's classes are spot-checked. Test: 1 AUDITOR reads `git diff 83eced7..<audited commit> -- packages/kit/src` with no report of the BUILDER and reports each fault with a reproduction; the same AUDITOR re-rates 10 findings that the judge rated minor or rejected and names each one it rates higher.
C15 Each RECIPIENT can use what is delivered. Test: the recipient-experience AUDITOR (a) runs the example of `packages/kit/README.md` word for word on `packages/kit/fixtures/good.html` and gets the grade the README states for it, and finds in the README the exported way to run the keyboard walks or the statement that none exists; (b) from the text of pull request 9 alone, lists what is repaired, what is open and what the owner decides, and the list equals `redteam/FINDINGS.md`.
C16 The delivery message to the USER holds at most 250 words, explains each technical term at first use, links each claim to the pull request, a session or a file, and asks the USER for no command. Test: the language AUDITOR reads the message and counts.

### E-36 · 2026-11-24T20:27:31Z · ASSUMPTION · ORCHESTRATOR

PREMISES the RED CELL attacked that are not FINDINGS (`audits/redcell-plan.md`, P6 to P10), logged as the challenge rules direct. The ruling `memos/lens-structural-integrity-redcell-counts.md` records "At least 1 counts: yes" (P1, P2, P3, P5, P7, P8 count).
A-9 The ref `refs/pull/9/merge` shows that pull request 9 is open (P6). EVIDENCE: not verified for a closed, unmerged pull request. Answer: C10 of E-35 reads the state of the pull request; the ref is no longer the test. A-6 is corrected by this line: the RED CELL read "State: open" through the pull request view.
A-10 Unchanged refs of CatCorner22/Frontend prove the run did not touch it (P7). False when another party moves a ref. Answer: C9 of E-35 tests what the run did.
A-11 C7 can be met while the branch moves (P8). Answer: E-35 defines audited commit and delivered commit, and C13 binds them.
A-12 The USER reads this run as the unit on pull request 9 only, not as progress on a milestone or on the North Star (P9). EVIDENCE: not verified. Answer: the S6 card says in plain words that this run starts no milestone and does not connect the kit to the Studio.
A-13 30 runs is the whole cost (P10). False: 4 review sessions were started before E-1. Answer: the S6 card states both numbers.
Sent to: the USER on the S6 card (A-12, A-13); the re-audit SUB-AGENT of the plan FINDINGS.

### E-37 · 2026-11-24T20:27:32Z · RECONCILIATION · ORCHESTRATOR

Memos: SI = `memos/lens-structural-integrity.md`, MVS = `memos/lens-minimal-viable-sequence.md`, TC = `memos/lens-trust-controls.md`, RX = `memos/lens-recipient-experience.md`, RC = `audits/redcell-plan.md`. "E-35" means the revised `PROPOSED` CRITERIA. "maps" means FRAMEWORK.md and CONNECTIONS.md, rewritten in the commit that follows this entry.

| Point | LENS | Result | CRITERION or decision changed | Reason |
|---|---|---|---|---|
| SI breaks 1, status names | structural integrity | ACCEPTED | maps | `packages/kit/src/shapes.ts` line 10 holds 4 statuses |
| SI breaks 2, 3 files that do not exist | structural integrity | ACCEPTED | maps | the 3 functions are in `logic/judge.ts` |
| SI breaks 3, shapes.ts has no node | structural integrity | ACCEPTED | maps | both folders import `../shapes.js` |
| SI breaks 4, edge LOGIC to browser test | structural integrity | ACCEPTED | maps | `kit.e2e.ts` line 7 imports grade, receipt, repairPlan |
| SI breaks 5, judge report has no edge, path or join key | structural integrity | ACCEPTED | C1, C2, maps | E-35 names the path and the judge's finding ID |
| SI breaks 6, baseline of C3 | structural integrity | ACCEPTED | C3 | base 9e50434 |
| SI breaks 7, SESSION-STATE and ledger stale | structural integrity | ACCEPTED | none | files rewritten |
| SI breaks 8, WORK UNITS exceed 1 component | structural integrity | REJECTED | none | Testable: every CRITERION of WU-1 tests the module through its 1 browser test file, and the 4 records of WU-2 state the same counts; splitting them gives 6 WORK UNITS and about 40 more runs against a budget of 30 |
| SI cut 1, DECISIONS.md owned but in no unit | structural integrity | ACCEPTED | maps | removed from the ownership table; this run adds no decision record of the repository |
| SI cut 2, grep of C3 | structural integrity | ACCEPTED | C3 | new pattern |
| SI add 1 to 3, nodes, CI edge, path and ID rule | structural integrity | ACCEPTED | C1, C2, maps | as above |
| SI insists, rewrite sections 3 and 4 and the map from the code | structural integrity | ACCEPTED | maps | as above |
| MVS breaks 1, WU-1 has no content yet | minimal viable sequence | ACCEPTED | none | see MVS insists |
| MVS breaks 2, C5 has no WORK UNIT behind it | minimal viable sequence | ACCEPTED | C5 | exit stated: FAIL with test names, the USER decides |
| MVS breaks 3, C12's test is red | minimal viable sequence | ACCEPTED | C12 | 8 named failures |
| MVS breaks 4, 1 commit per repair | minimal viable sequence | ACCEPTED | C3 | stated |
| MVS breaks 5, bound of C7 | minimal viable sequence | ACCEPTED | C7 | rows KIT-* and rows this run adds |
| MVS cut 1, WU-2 full swarm | minimal viable sequence | REJECTED | none | Testable: the audit rules of a FULL run name 8 roles per WORK UNIT and give the ORCHESTRATOR no leave to drop one; only the USER can waive it, and the card offers that choice |
| MVS cut 2, WU-1 swarm if 0 blockers and majors | minimal viable sequence | REJECTED | C14 | F-4 and F-7: lines changed after the judge's pin need review even then |
| MVS cut 3, run C4 and C5 once | minimal viable sequence | ACCEPTED | C4, C5 | both test the audited commit, 1 time at the end |
| MVS cut 4, research clause | minimal viable sequence | ACCEPTED | C7 | clause removed; the file is outside both WORK UNITS |
| MVS add 1, order line | minimal viable sequence | ACCEPTED | FRAMEWORK.md section 6 | order written |
| MVS add 2 to 4 | minimal viable sequence | ACCEPTED | C5, C7, C12 | as above |
| MVS insists, no S6 card before the judge report is saved | minimal viable sequence | REJECTED | none | Testable against O2 and O3 in E-12: the USER has 2 questions open and watches cost, and the judge has up to 3 more hours; the card states 30 as a ceiling and that C1 may be empty; WU-1 does not start before the report is saved (order line), which meets the second half of the demand |
| TC breaks 1, audited commit is not delivered commit | trust and controls | ACCEPTED | C13 | new CRITERION |
| TC breaks 2, baseline hides test and CI edits | trust and controls | ACCEPTED | C3 | base 9e50434; removed assertions read 1 by 1; the change of `ci.yml` is in that diff and the same AUDITOR reads it |
| TC breaks 3, judge report has 1 custodian | trust and controls | ACCEPTED | C1, C14 | reviewer files and hashes saved in `evidence/second-review/`; judge session link in E-35; spot-check in C14 |
| TC breaks 4, C6 and C10 EVIDENCE cannot be fetched | trust and controls | ACCEPTED | C6, C10 | an AUDITOR reads the pull request; the RED CELL showed the pull request view works |
| TC breaks 5, pull request text unpinned | trust and controls | ACCEPTED | C7 | text saved whole by the AUDITOR |
| TC breaks 6, history rewrite | trust and controls | ACCEPTED | C13 | ancestry test |
| TC breaks 7, C8 narrower than C8 | trust and controls | ACCEPTED | C8 | wider pattern and files |
| TC cut 1, merge-ref test | trust and controls | ACCEPTED | C10 | state of the pull request |
| TC cut 2, "30 planned" as a control | trust and controls | ACCEPTED | C12 | a run above 30 needs a quoted message of the USER |
| TC add 1 to 5 | trust and controls | ACCEPTED | C3, C8, C12, C13 | as above |
| TC insists, diff audited to delivered only in the RUN FOLDER, run by the final AUDITOR | trust and controls | ACCEPTED | C13 | new CRITERION |
| RX breaks 1, README example ends "Not graded" | recipient experience | ACCEPTED | C15 | new CRITERION |
| RX breaks 2, pull request text contradicts the records | recipient experience | ACCEPTED | C7, C15 | the text is corrected in WU-2; correcting it before the S6 answer is work the answer can change, so not earlier |
| RX breaks 3, no promise of a usable report | recipient experience | ACCEPTED | C16 | new CRITERION |
| RX breaks 4, items only the owner can settle | recipient experience | ACCEPTED | C2 | "Needs the owner" rows |
| RX breaks 5, first-read part of PROGRESS.md stale | recipient experience | ACCEPTED | C7 | "Waiting on the owner" lists each question |
| RX breaks 6, 1 rule printed 2 times in the receipt | recipient experience | ACCEPTED | none | logged for WU-1 as an input beside the judge report; the correctness AUDITOR of WU-1 gets the reproduction |
| RX cut 1, research presence test | recipient experience | ACCEPTED | C7 | removed |
| RX cut 2, tell the reader to skip the RUN FOLDER | recipient experience | ACCEPTED | C7 | 1 line in the pull request text |
| RX add 1 to 4 | recipient experience | ACCEPTED | C2, C7, C16 | the card gives 1 recommended answer per question; a silent USER still stops the work, because no reply is not an answer |
| RX insists, CRITERION of use per RECIPIENT | recipient experience | ACCEPTED | C15 | new CRITERION |
| RC change 1 (F-1) | structural integrity | ACCEPTED | C11 | RUN FOLDER left out, base 9e50434, wider pattern |
| RC change 2 (F-2) | trust and controls | ACCEPTED | C12 | 8 named failures, each with a CORRECTION entry |
| RC change 3 (F-3) | trust and controls | ACCEPTED | C3 | base, removed assertions, config files |
| RC change 4 (F-6) | structural integrity | ACCEPTED | C8 | dependency, configuration, address; record lines allowed |
| RC change 5 (F-5) | recipient experience | ACCEPTED | C5 | PW_CHROMIUM named; every run counted |
| RC change 6 (F-4) | trust and controls | ACCEPTED | C14 | new CRITERION; files saved |
| RC change 7 | trust and controls | ACCEPTED | C1 | 2nd input per fault |
| RC change 8 (F-7) | minimal viable sequence | ACCEPTED | C1, C2 | stated; open rows listed for the USER |
| RC change 9 | trust and controls | ACCEPTED | C10 | state of the pull request |
| RC change 10 | trust and controls | ACCEPTED | C9 | what the run did |
| RC change 11 | structural integrity | ACCEPTED | C13 | audited and delivered commit |
| RC change 12 | recipient experience | ACCEPTED | S6 card | 4 earlier sessions and "no milestone" stated |
| RC "The cheating agent" | trust and controls | ACCEPTED | C1, C3 | 2nd input; retry and timeout in the config files tested |

### E-38 · 2026-11-24T20:28:21Z · CORRECTION · ORCHESTRATOR

- Corrects: E-2
- What was wrong: E-2 states the 5 parts and the mode in a form that `scripts/hinshitsu_check.py` does not read, so the script reports 6 failures on E-2 ("does not answer SWARM-CAPABLE part 1" to "part 5", "states no mode").
- What is true: the content of E-2 stands, restated here in the script's form, with the same EVIDENCE (`evidence/capability-probe.md`, E-1).
SWARM-CAPABLE part 1 (scope written by the ORCHESTRATOR): yes
SWARM-CAPABLE part 2 (no BUILDER conversation): yes
SWARM-CAPABLE part 3 (report returns whole): yes
SWARM-CAPABLE part 4 (identifier not written by the ORCHESTRATOR): yes
SWARM-CAPABLE part 5 (live test call): yes
- Mode: SWARM

### E-39 · 2026-11-24T20:28:46Z · CORRECTION · ORCHESTRATOR

- Corrects: E-22, E-23, E-24, E-25, E-26, E-27, and the paths that E-35, E-36 and E-37 cite
- What was wrong: the 6 report files had names that did not hold the ID of their LAUNCH entry.
- What is true: the files were renamed with `git mv`, content unchanged: `memos/E-22-lens-recipient-experience.md`, `memos/E-23-lens-minimal-viable-sequence.md`, `memos/E-24-lens-structural-integrity.md`, `memos/E-25-lens-trust-controls.md`, `audits/E-26-redcell-plan.md`, `memos/E-27-lens-structural-integrity-redcell-counts.md`. The LAUNCH entries keep the old paths, because the log is append-only.

### E-40 · 2026-11-24T20:29:11Z · CORRECTION · ORCHESTRATOR

- Corrects: E-39
- What was wrong: after the rename of E-39 the check script found no report at the paths the 6 LAUNCH entries name, and reported 10 failures where it had reported 6.
- What is true: the rename is undone with `git mv`; the 6 files are again at the paths that E-22 to E-27 name, content unchanged. 6 failures of the form "file name does not hold" the LAUNCH ID stay for these 6 files and cannot be cleared, because the LAUNCH entries cannot be rewritten. Each later report path holds the ID of its LAUNCH entry.

### E-41 · 2026-11-24T20:29:44Z · CORRECTION · ORCHESTRATOR

- Corrects: E-35, the test of C12 (the CRITERIA are `PROPOSED`, so this is a correction of a proposal and no change of a frozen CRITERION)
- What was wrong: C12 names 8 failures of the check script that cannot be cleared. The script reports 14 such failures.
- What is true: the 14 are: 2 on E-1 (scope path and report path written without the form the script reads; E-10 answers them), 6 on E-2 (parts 1 to 5 and the mode; E-38 answers them), 6 of the form "file name does not hold" the LAUNCH ID for the reports of E-22 to E-27 (E-40 answers them). C12 reads: "`hinshitsu_check.py` reports no failure except these 14, and the final AUDITOR confirms each of the 14 against E-10, E-38 and E-40." The rest of C12 stands. EVIDENCE: output of the script at commit b2ece8e, saved as `evidence/check-script-b2ece8e.txt`.

### E-42 · 2026-11-24T20:30:00Z · LAUNCH · ORCHESTRATOR

- Role: AUDITOR, re-audit of the plan FINDINGS F-1 to F-7
- Scope: `prompts/S5-reaudit-plan-findings.md`
- Commit under review: e811b4c2f555b84475bf1d422b7b8907c1b9c7ef
- SUB-AGENT identifier: 816cf8bacd4848718d9df03d8a46027e https://app.devin.ai/sessions/816cf8bacd4848718d9df03d8a46027e
- Report: `audits/E-42-reaudit-plan-findings.md`

8 of 30 SUB-AGENT runs used.

### E-43 · 2026-11-24T20:46:54Z · CRITERIA · ORCHESTRATOR

- Status: PROPOSED
- Approval: approval: pending

Replaces the text of E-35 and E-41 after the re-audit `audits/E-42-reaudit-plan-findings.md` (6 FIXED, F-7 NOT FIXED, 6 new faults in the text). E-35 and E-41 stay as written.
Terms. "Base" is commit 9e50434, the base of pull request 9. "Audited commit" is the commit named in the scopes of the last audit round. "Delivered commit" is the head of branch `devin/1795542703-kit-minors` named in the delivery report. "RUN FOLDER" is `hinshitsu/kit-repairs/`. "Second review" is the review of 2026-11-24 by 3 reviewer sessions and 1 judge session, charter `redteam/reports/2026-11-24-kit2-charter.md`. "Judge report" is `evidence/second-review/judge-report.md` in the RUN FOLDER (SHA-256 in `evidence/second-review/SHA256SUMS`); it confirms 8 findings of the class major, 24 minor, 2 notes, 0 blocker, and lists items for a person in its section 7. "Test files" are `packages/*/test/**`, `apps/studio/e2e/**`, `vitest.config.ts` and `vitest.e2e.config.ts`. "Seeder" is the SUB-AGENT that plants 1 defect in a copy before an audit round. "Plugin folder" is the folder of the installed Hinshitsu plugin that holds `scripts/hinshitsu_check.py`. "Confirmed list" is: each finding of the judge report, and each fault or higher rating that C14 adds.
C1 Each entry of the confirmed list with the class blocker or major has 1 row in `redteam/FINDINGS.md` that cites its ID, and the fault no longer appears at the audited commit. Test: the correctness AUDITOR runs each reproduction and saves the output, 0 reproduce; the adversarial AUDITOR runs a 2nd, different input of the same fault for each, 0 reproduce. Fail: 1 or more reproduce, or 1 row is missing.
C2 Each entry of the confirmed list with the class minor or note, and each item of section 7 of the judge report, has 1 row in `redteam/FINDINGS.md` that cites its ID and states: repaired with its commit, or "open" with a reason, or "Needs the owner". Test: the framework-drift AUDITOR compares the lists row by row, 0 missing; the delivery report lists each "open" and each "Needs the owner" row by ID.
C3 Each repair under C1 is 1 commit that holds the repair and a test that fails without it, and no test between the base and the audited commit is skipped, deleted or weakened. Test: (a) the adversarial AUDITOR reverts each repair commit in a scratch copy and names the test that then fails; a repair with no such test fails C3. (b) An AUDITOR reads every line that `git diff 9e50434..<audited commit> -- <test files> | grep -E "^-.*expect"` prints. A removed line is "weakened" unless the AUDITOR names the assertion at the audited commit that tests the same behavior with the same or a stricter condition, or names the rule record that made the old assertion wrong; 0 weakened. (c) `grep -rnE "\b(it|test|describe)\.(skip|only|todo|fails|skipIf|runIf)" packages/*/test apps/studio/e2e` prints nothing. (d) `git diff 9e50434..<audited commit> -- <test files> | grep -n -i -E "^\+.*(retry|retries|timeout)"`: the AUDITOR reads each line printed; 0 lines add a retry, and 0 lines set a time limit above 90,000 ms, the limit at the base.
C4 `npm run check` exits with code 0 at the audited commit. Test: an AUDITOR runs it and saves the output.
C5 `PW_CHROMIUM=$HOME/.cache/ms-playwright/chromium-1255/chrome-linux64/chrome npm run e2e` exits with code 0 at the audited commit 3 times in a row. Test: an AUDITOR runs it and saves every output. Every run started is counted; a red run is a FINDING and no later run erases it. If a test outside `kit.e2e.ts` fails, C5 is reported FAIL with the names of the tests, and the USER decides. 3 green runs do not settle the unknown cause of KIT-41, and the delivery report says so.
C6 Every CI check on pull request 9 at the delivered commit ends in success. Test: an AUDITOR reads the checks of the pull request and saves them.
C7 Each number and status that describes the kit in `PROGRESS.md`, `packages/kit/README.md`, the rows KIT-* of `redteam/FINDINGS.md`, the rows this run adds, and the text of pull request 9 equals what a command prints at the audited commit; `PROGRESS.md` names M4 as the current milestone with its exit test open, and its part "Waiting on the owner" lists every question this run puts to the USER; the text of pull request 9 says in 1 line that the RUN FOLDER is a record and no code. Test: the framework-drift AUDITOR lists each number and status with the command that confirms it, 0 mismatches, and saves the text of the pull request whole.
C8 No dependency and no configuration for Neon or Vercel exists. Test: `grep -n -i -E "\"(@neondatabase/|@neon|neon|@vercel/|vercel)[^\"]*\" *:|neon\.tech|vercel\.app" $(git ls-files | grep -E "(^|/)(package\.json|package-lock\.json)$|^\.github/workflows/|(^|/)\.env")` prints nothing; `git ls-files | grep -E "(^|/)(vercel\.json|\.vercel/)"` prints nothing. C8 tests these files only; a line of record that states D60, cites Vercel's published guidelines, or lists `vercel.com` as a host that research could read, is outside C8.
C9 The run pushes nothing to CatCorner22/Frontend. Test: in the working copy, `git remote -v` and `git config --get-regexp "^(remote|url)\."` print no line that holds `CatCorner22/Frontend`; as a 2nd reading, `git ls-remote https://github.com/CatCorner22/Frontend` is compared with `evidence/frontend-refs-before.txt`, and each ref that differs is named with the account that moved it. Fail: a ref moved by this session's account.
C10 Pull request 9 is open and not merged at delivery, unless the USER has written an instruction to merge during the run. Test: an AUDITOR reads the state of the pull request and saves it.
C11 No line added between the base and the delivered commit, outside the RUN FOLDER, claims that output meets a standard. Test: `git diff 9e50434..<delivered commit> -- . ':!hinshitsu' | grep -n -E "^\+.*(WCAG|\bADA\b|[Aa]ccessib)"`; the language AUDITOR reads each line printed and rules it a claim or no claim, 0 claims.
C12 The RUN FOLDER holds the full record of the run. Test: the final AUDITOR runs `python3 <plugin folder>/scripts/hinshitsu_check.py hinshitsu/kit-repairs` and, for each failure printed, names the `CORRECTION` entry that answers it; 0 failures without such an entry. `grep -c "· LAUNCH ·" hinshitsu/kit-repairs/AUDIT-LOG.md` prints at most 30, or at most the number in the last `ANSWER` entry that holds a line "Planned SUB-AGENT runs".
C13 The delivered commit differs from the audited commit only inside the RUN FOLDER, and no history is rewritten. Test: the final AUDITOR runs `git diff --stat <audited commit>..<delivered commit>`, every path starts with `hinshitsu/kit-repairs/`; `git merge-base --is-ancestor 6b0c2f8 <delivered commit>` exits 0; the final AUDITOR names both commits.
C14 The lines of `packages/kit/src` that changed after the commit the second review saw are reviewed from zero, and the judge's classes are spot-checked. Test: before WU-1 starts, 1 AUDITOR reads `git diff 83eced7..86287c2 -- packages/kit/src` with no report of the BUILDER, and re-rates 10 findings that the judge rated minor (the judge report holds 24). Pass: the report is saved, and each fault it reports with a reproduction, and each finding it rates major or blocker, is on the confirmed list with that class and passes C1 or C2. Fail: 1 such entry is absent from `redteam/FINDINGS.md`.
C15 Each RECIPIENT can use what is delivered. Test: the recipient-experience AUDITOR (a) runs the example of `packages/kit/README.md` word for word on `packages/kit/fixtures/good.html` and gets the grade the README states for it, and finds in the README the exported way to run the keyboard walks or the statement that none exists; (b) from the text of pull request 9 alone, lists what is repaired, what is open and what the owner decides, and the list equals `redteam/FINDINGS.md`.
C16 The delivery message to the USER holds at most 250 words, asks the USER for no command, and links each claim to the pull request, a session or a file. In it, each word in code formatting, each abbreviation in capitals and each term of the Hinshitsu glossary has its meaning in the same sentence at first use. Test: the language AUDITOR counts the words and lists each such term with its meaning, 0 without.

### E-44 · 2026-11-24T20:47:11Z · LAUNCH · ORCHESTRATOR

- Role: AUDITOR, second re-audit of the plan FINDINGS (F-7 and the faults of the first re-audit)
- Scope: `prompts/S5-reaudit-round2.md`
- Commit under review: d95e8b735afcae467e96c351c44049da4380d008
- SUB-AGENT identifier: c22a19a1d983409e8ca2152b7f710092 https://app.devin.ai/sessions/c22a19a1d983409e8ca2152b7f710092
- Report: `audits/E-44-reaudit-round2.md`

9 of 30 SUB-AGENT runs used.

### E-45 · 2026-11-24T20:47:11Z · RESOLUTION · ORCHESTRATOR

- Finding: F-1
- Result: FIXED
- Change: text of the CRITERIA, E-35 with E-41, carried into E-43 (commit d95e8b7)
- Re-audit: `audits/E-42-reaudit-plan-findings.md` by AUDITOR, 816cf8bacd4848718d9df03d8a46027e

### E-46 · 2026-11-24T20:47:11Z · RESOLUTION · ORCHESTRATOR

- Finding: F-2
- Result: FIXED
- Change: text of the CRITERIA, E-35 with E-41, carried into E-43 (commit d95e8b7)
- Re-audit: `audits/E-42-reaudit-plan-findings.md` by AUDITOR, 816cf8bacd4848718d9df03d8a46027e

### E-47 · 2026-11-24T20:47:11Z · RESOLUTION · ORCHESTRATOR

- Finding: F-3
- Result: FIXED
- Change: text of the CRITERIA, E-35 with E-41, carried into E-43 (commit d95e8b7)
- Re-audit: `audits/E-42-reaudit-plan-findings.md` by AUDITOR, 816cf8bacd4848718d9df03d8a46027e

### E-48 · 2026-11-24T20:47:11Z · RESOLUTION · ORCHESTRATOR

- Finding: F-4
- Result: FIXED
- Change: text of the CRITERIA, E-35 with E-41, carried into E-43 (commit d95e8b7)
- Re-audit: `audits/E-42-reaudit-plan-findings.md` by AUDITOR, 816cf8bacd4848718d9df03d8a46027e

### E-49 · 2026-11-24T20:47:12Z · RESOLUTION · ORCHESTRATOR

- Finding: F-5
- Result: FIXED
- Change: text of the CRITERIA, E-35 with E-41, carried into E-43 (commit d95e8b7)
- Re-audit: `audits/E-42-reaudit-plan-findings.md` by AUDITOR, 816cf8bacd4848718d9df03d8a46027e

### E-50 · 2026-11-24T20:47:12Z · RESOLUTION · ORCHESTRATOR

- Finding: F-6
- Result: FIXED
- Change: text of the CRITERIA, E-35 with E-41, carried into E-43 (commit d95e8b7)
- Re-audit: `audits/E-42-reaudit-plan-findings.md` by AUDITOR, 816cf8bacd4848718d9df03d8a46027e

### E-51 · 2026-11-24T20:50:17Z · CRITERIA · ORCHESTRATOR

- Status: PROPOSED
- Approval: approval: pending

Replaces the text of E-43 after the second re-audit `audits/E-44-reaudit-round2.md` (F-7 FIXED; 9 faults named in the text of E-43, each answered here). E-43 stays as written. No SUB-AGENT has re-audited this text; the pre-delivery RED CELL and the final AUDITOR read it.
Terms. "Base" is commit 9e50434, the base of pull request 9. "Audited commit" is the commit named in the scopes of the last audit round. "Delivered commit" is the head of branch `devin/1795542703-kit-minors` named in the delivery report. "RUN FOLDER" is `hinshitsu/kit-repairs/`. "Second review" is the review of 2026-11-24 by 3 reviewer sessions and 1 judge session, charter `redteam/reports/2026-11-24-kit2-charter.md`. "Judge report" is `evidence/second-review/judge-report.md` in the RUN FOLDER (SHA-256 in `evidence/second-review/SHA256SUMS`); it confirms 8 findings of the class major, 24 minor, 2 notes, 0 blocker, and lists items for a person in its section 7. "Test files" are `packages/*/test/**`, `apps/studio/e2e/**`, `vitest.config.ts` and `vitest.e2e.config.ts`. "Seeder" is the SUB-AGENT that plants 1 defect in a copy before an audit round. "Plugin folder" is the folder of the installed Hinshitsu plugin that holds `scripts/hinshitsu_check.py`. "Confirmed list" is: each finding of the judge report, with the class the judge gives it, or the higher class where the judge states one for commit 86287c2 (F-27 of the judge report is major by this rule, so the list holds 9 majors); and each entry that C14 adds. "Rule record" is the record of a rule in `packages/kit/src/data/`.
C1 Each entry of the confirmed list with the class blocker or major has 1 row in `redteam/FINDINGS.md` that cites its ID, and the fault no longer appears at the audited commit. Test: the correctness AUDITOR runs each reproduction and saves the output, 0 reproduce; the adversarial AUDITOR runs a 2nd, different input of the same fault for each, 0 reproduce. Fail: 1 or more reproduce, or 1 row is missing.
C2 Each entry of the confirmed list with the class minor or note, and each item of section 7 of the judge report, has 1 row in `redteam/FINDINGS.md` that cites its ID and states: repaired with its commit, or "open" with a reason, or "Needs the owner". Test: the framework-drift AUDITOR compares the lists row by row, 0 missing; the delivery report lists each "open" and each "Needs the owner" row by ID.
C3 Each repair under C1 is 1 commit that holds the repair and a test that fails without it, and no test between the base and the audited commit is skipped, deleted or weakened. Test: (a) the adversarial AUDITOR reverts each repair commit in a scratch copy and names the test that then fails; a repair with no such test fails C3. (b) An AUDITOR reads every line that `git diff 9e50434..<audited commit> -- <test files> | grep -E "^-.*expect"` prints. A removed line is "weakened" unless the AUDITOR names the assertion at the audited commit that tests the same behavior with the same or a stricter condition, or names the rule record that made the old assertion wrong; 0 weakened. (c) `grep -rnE "\b(x?it|x?test|x?describe)(\.[a-zA-Z]+)*\.(skip|only|todo|fails|skipIf|runIf)\b|\bx(it|test|describe)\(" packages/*/test apps/studio/e2e` prints nothing. (d) The same AUDITOR reads the whole of `git diff 9e50434..<audited commit> -- <test files>` and lists each added retry and each time limit that is new or raised, written as a named setting or as a bare number; 0 retries, and 0 limits above the highest limit at the base, 120,000 ms (`apps/studio/e2e/studio.e2e.ts`). (e) `git diff 9e50434..<audited commit> -- vitest.config.ts vitest.e2e.config.ts | grep -E "^[-+].*(include|exclude)"` prints nothing.
C4 `npm run check` exits with code 0 at the audited commit. Test: an AUDITOR runs it and saves the output.
C5 `PW_CHROMIUM=$HOME/.cache/ms-playwright/chromium-1255/chrome-linux64/chrome npm run e2e` exits with code 0 at the audited commit 3 times in a row. Test: an AUDITOR runs it and saves every output. Every run started is counted; a red run is a FINDING and no later run erases it. If a test outside `kit.e2e.ts` fails, C5 is reported FAIL with the names of the tests, and the USER decides. 3 green runs do not settle the unknown cause of KIT-41, and the delivery report says so.
C6 Every CI check on pull request 9 at the delivered commit ends in success. Test: an AUDITOR reads the checks of the pull request and saves them.
C7 Each number and status that describes the kit in `PROGRESS.md`, `packages/kit/README.md`, the rows KIT-* of `redteam/FINDINGS.md`, the rows this run adds, and the text of pull request 9 equals what a command prints at the audited commit; `PROGRESS.md` names M4 as the current milestone with its exit test open, and its part "Waiting on the owner" lists every question this run puts to the USER; the text of pull request 9 says in 1 line that the RUN FOLDER is a record and no code. Test: the framework-drift AUDITOR lists each number and status with the command that confirms it, 0 mismatches, and saves the text of the pull request whole.
C8 No dependency and no configuration for Neon or Vercel exists. Test: `grep -n -i -E "\"(@neondatabase/|@neon|neon|@vercel/|vercel)[^\"]*\" *:|neon\.tech|vercel\.app" $(git ls-files | grep -E "(^|/)(package\.json|package-lock\.json)$|^\.github/workflows/|(^|/)\.env")` prints nothing; `git ls-files | grep -E "(^|/)(vercel\.json|\.vercel/)"` prints nothing. C8 tests these files only; a line of record that states D60, cites Vercel's published guidelines, or lists `vercel.com` as a host that research could read, is outside C8.
C9 The run pushes nothing to CatCorner22/Frontend. Test: in the working copy, `git remote -v` and `git config --get-regexp "^(remote|url)\."` print no line that holds `CatCorner22/Frontend`; as a 2nd reading, `git ls-remote https://github.com/CatCorner22/Frontend` is compared with `evidence/frontend-refs-before.txt`, and each ref that differs is named. Fail: the first reading prints a line. A ref that differs in the 2nd reading is reported to the USER and is no failure by itself, because `git ls-remote` does not show who moved a ref.
C10 Pull request 9 is open and not merged at delivery, unless the USER has written an instruction to merge during the run. Test: an AUDITOR reads the state of the pull request and saves it.
C11 No line added between the base and the delivered commit, outside the RUN FOLDER, claims that output meets a standard. Test: `git diff 9e50434..<delivered commit> -- . ':!hinshitsu' | grep -n -E "^\+.*(WCAG|\bADA\b|[Aa]ccessib)"`; the language AUDITOR reads each line printed and rules it a claim or no claim, 0 claims.
C12 The RUN FOLDER holds the full record of the run. Test: the final AUDITOR runs `python3 <plugin folder>/scripts/hinshitsu_check.py hinshitsu/kit-repairs` and, for each failure printed, names the `CORRECTION` entry that answers it; 0 failures without such an entry. A `CORRECTION` entry answers a failure only where the failure sits in the text of an entry, or in the path that an entry names, and only a rewrite of that entry could clear it; a missing file, a missing entry and an open FINDING cannot be answered this way. `grep -c -E "^### E-[0-9]+ · [^·]+ · LAUNCH · " hinshitsu/kit-repairs/AUDIT-LOG.md` prints at most the number in the last `TIER` or `ANSWER` entry that holds a line "Planned SUB-AGENT runs". The 4 sessions of the second review ran before E-1 and are outside this count; the delivery report states them.
C13 The delivered commit differs from the audited commit only inside the RUN FOLDER, and no history is rewritten. Test: the final AUDITOR runs `git diff --stat <audited commit>..<delivered commit>`, every path starts with `hinshitsu/kit-repairs/`; `git merge-base --is-ancestor 6b0c2f8 <delivered commit>` exits 0; the final AUDITOR names both commits.
C14 The lines of `packages/kit/src` that changed after the commit the second review saw are reviewed from zero, and the judge's classes are spot-checked. Test: before WU-1 starts, 1 AUDITOR reads `git diff 83eced7..86287c2 -- packages/kit/src` with no report of the BUILDER, and re-rates 10 findings that the judge rated minor (the judge report holds 24). The AUDITOR gives each fault an ID `C14-<n>` and a class by the class definitions of the charter of the second review. Pass: the report is saved; each fault it reports with a reproduction, and each finding it rates major or blocker, is on the confirmed list with that ID and class and passes C1 or C2; and the delivery report lists each `C14-<n>` with its class for the USER. Fail: 1 such entry is absent from `redteam/FINDINGS.md`.
C15 Each RECIPIENT can use what is delivered. Test: the recipient-experience AUDITOR (a) runs the example of `packages/kit/README.md` word for word on `packages/kit/fixtures/good.html` and gets the grade the README states for it, and finds in the README the exported way to run the keyboard walks or the statement that none exists; (b) from the text of pull request 9 alone, lists what is repaired, what is open and what the owner decides, and the list equals `redteam/FINDINGS.md`.
C16 The delivery message to the USER holds at most 250 words, asks the USER for no command, and links each claim to the pull request, a session or a file. In it, each word in code formatting, each abbreviation in capitals and each term of the Hinshitsu glossary has its meaning in the same sentence at first use. Test: the language AUDITOR counts the words and lists each such term with its meaning, 0 without.

### E-52 · 2026-11-24T20:50:17Z · RESOLUTION · ORCHESTRATOR

- Finding: F-7
- Result: FIXED
- Change: text of the CRITERIA, E-43 (commit d95e8b7)
- Re-audit: `audits/E-44-reaudit-round2.md` by AUDITOR, c22a19a1d983409e8ca2152b7f710092

### E-53 · 2026-11-24T20:50:36Z · STAGE · ORCHESTRATOR

- Stage: S5
- Event: end

4 LENS memos, 1 RED CELL report, 1 ruling, 2 re-audits; RECONCILIATION E-37; F-1 to F-7 FIXED; CRITERIA  in E-51.

### E-54 · 2026-11-24T20:50:36Z · STAGE · ORCHESTRATOR

- Stage: S6
- Event: start

### E-55 · 2026-11-24T20:50:37Z · CARD · ORCHESTRATOR

**Decision card: 3 answers needed before any repair starts**

This is the Hinshitsu step where you set the tests the work must pass. Nothing has been repaired since you asked for Hinshitsu. This run covers only the kit repairs on https://github.com/CatCorner22/Devin_Frontend/pull/9. It starts no milestone and does not connect the kit to the Studio.

**1. The tests the work must pass**
- **Question:** Do you approve the 16 tests listed below as the definition of finished for this pull request?
- **I recommend yes:** five independent reviewers attacked the first draft and found 7 faults in it, and two more re-checked the rewrite; the last wording changes after the second re-check have not been re-checked.
- **If yes:** repairs start on the judge's list (9 major faults, 23 minor, no blocker), and I can't loosen a test later without asking you. **If no:** tell me which to change, and nothing is built meanwhile.
- **Reply:** "1 yes", or "1 change" with what to change.

**2. The cost**
- **Question:** May this run use up to 40 separate Devin sessions as independent checkers?
- **I recommend yes:** I first planned 30, and re-checking the plan itself took more than I counted; each repair is checked by sessions that didn't write it, which is the point of Hinshitsu.
- **If yes:** 9 are used and up to 31 remain; the 4 review sessions that ran before Hinshitsu are extra and already spent. **If you keep 30 or name less:** I stop at that number and report whatever is left as not checked.
- **Reply:** "2 yes", or "2" with a number.

**3. The milestone order**
- **Question:** After this pull request, do I wait for your trial of the Studio (M4) before starting the full Catalog (M5)?
- **I recommend starting M5 to M7 now:** your trial needs your time, and the export and the builder are the largest step toward your goal.
- **If start now:** work continues, and your trial answers may force rework of some screens. **If trial first:** no rework, and everything after this pull request waits for you.
- **Reply:** "3 start now" or "3 trial first".

If you don't reply, I do no repair.

**The 16 tests, in plain words**
1. Each of the 9 major faults (8 the judge rated major, and 1 it said became major on the current code), and any that test 14 adds, is logged and no longer reproduces, also on a second, different input.
2. Every minor fault, and every item only you can settle, is logged as repaired, open with a reason, or waiting on you.
3. Each repair is one commit with a test that fails without it. No test is skipped, deleted or weakened since the pull request began.
4. The code checks (`npm run check`) pass.
5. The browser tests pass 3 times in a row. A failed run is reported and not erased by a later pass.
6. The automatic checks on the pull request (CI) pass.
7. Every number and status in the records and the pull request text matches what the commands print.
8. No Neon or Vercel dependency, configuration or address.
9. Nothing is pushed to your original `Frontend` repository.
10. The pull request stays unmerged unless you say merge.
11. No added line claims the output meets an accessibility standard.
12. The full Hinshitsu record is saved. The log can't be edited after the fact, so 14 form errors in early entries stay; each has a written correction, and so must any later one.
13. Nothing but the record changes after the last independent check.
14. Before repairs start, an independent session reviews from zero the kit lines changed after the earlier review saw the code, and re-rates 10 of the judge's minor rulings. Whatever it finds or rates higher joins the repair list.
15. The README example runs as written, and the pull request text alone tells you what is repaired, open and yours to decide.
16. My final message to you is at most 250 words, in plain words, with links.

**Choices I made that you can reverse**
- Faults the judge rates minor are logged and may stay open.
- Only Chromium is tested; Firefox and Safari are reported as not checked.
- The Hinshitsu record stays in the repository, about 60 text files and no code.
- The cause of the four Studio tests that failed once (KIT-41) stays unknown; three passing runs don't settle it.
- The judge's report is the list of what to repair; this run's own checkers verify the repairs.
- Findings from the automated reviewer are handled with the repairs.
- This run changes no milestone record: M4 stays open.

Working assumption while the card is open: the recommended answers (1 yes, 2 yes with 40, 3 start now). No repair, no SUB-AGENT run and no change of a milestone record takes place before an `ANSWER` entry quotes the USER. Planned SUB-AGENT runs asked for: 40 (first plan, E-4: 30; used: 9). The full text of the 16 CRITERIA is E-51; the card states each in plain words.

### E-56 · 2026-11-24T20:50:46Z · CORRECTION · ORCHESTRATOR

- Corrects: E-53
- What was wrong: the shell removed 1 word; the last clause reads "CRITERIA  in E-51".
- What is true: the clause reads "CRITERIA PROPOSED in E-51".

### E-57 · 2026-11-24T21:05:18Z · ANSWER · ORCHESTRATOR

- Card: E-55
- The USER's reply, word for word: "Please fix all issues that Hinshitsu found and continue to complete all milestones" (2026-11-24 16:04 EST)
- Effect: Question 3 is answered: start M5 to M7 after this pull request while M4 stays open. The choice "minors may stay open" is reversed: each confirmed finding of every class is repaired. Questions 1 and 2 are not answered: the reply names neither the CRITERIA nor the number of SUB-AGENT runs, so the CRITERIA stay PROPOSED (E-51) and the limit stays 30 (E-4). The BUILDER starts the repairs, which the reply orders; no WORK UNIT is reported VERIFIED while the CRITERIA are not FROZEN.

### E-58 · 2026-11-24T21:05:45Z · LAUNCH · ORCHESTRATOR

- Role: AUDITOR, review from zero of the lines changed after the second review (C14)
- Scope: `prompts/C14-review-from-zero.md`
- Commit under review: 86287c272976e354d3d35129f590a7fb05e78352
- SUB-AGENT identifier: c93f618beb8743c7ae47eaada891c7bf https://app.devin.ai/sessions/c93f618beb8743c7ae47eaada891c7bf
- Report: `audits/E-58-c14-review-from-zero.md`

10 of 30 SUB-AGENT runs used.

### E-59 · 2026-11-24T21:06:26Z · ANSWER · ORCHESTRATOR

- Card: E-55
- The USER's reply, word for word: "1. Yes; 2. Yes; 3 start now" (2026-11-24 16:06 EST)
- Effect: Question 1: the 16 CRITERIA of E-51 are approved. Question 2: the limit of SUB-AGENT runs is 40. Question 3: start M5 to M7 after this pull request while M4 stays open. E-57 stands for the repair of every class of finding.

Planned SUB-AGENT runs: 40

### E-60 · 2026-11-24T21:06:26Z · CRITERIA · ORCHESTRATOR

- Status: FROZEN
- Approval: "1. Yes; 2. Yes; 3 start now" (2026-11-24 16:06 EST)

The text of E-51, word for word, now FROZEN. By E-57 the USER also ordered the repair of every confirmed finding of every class; under C2 the state "open" is therefore used only where a repair is not possible in this unit, with the reason, and the delivery report lists each such row.
Terms. "Base" is commit 9e50434, the base of pull request 9. "Audited commit" is the commit named in the scopes of the last audit round. "Delivered commit" is the head of branch `devin/1795542703-kit-minors` named in the delivery report. "RUN FOLDER" is `hinshitsu/kit-repairs/`. "Second review" is the review of 2026-11-24 by 3 reviewer sessions and 1 judge session, charter `redteam/reports/2026-11-24-kit2-charter.md`. "Judge report" is `evidence/second-review/judge-report.md` in the RUN FOLDER (SHA-256 in `evidence/second-review/SHA256SUMS`); it confirms 8 findings of the class major, 24 minor, 2 notes, 0 blocker, and lists items for a person in its section 7. "Test files" are `packages/*/test/**`, `apps/studio/e2e/**`, `vitest.config.ts` and `vitest.e2e.config.ts`. "Seeder" is the SUB-AGENT that plants 1 defect in a copy before an audit round. "Plugin folder" is the folder of the installed Hinshitsu plugin that holds `scripts/hinshitsu_check.py`. "Confirmed list" is: each finding of the judge report, with the class the judge gives it, or the higher class where the judge states one for commit 86287c2 (F-27 of the judge report is major by this rule, so the list holds 9 majors); and each entry that C14 adds. "Rule record" is the record of a rule in `packages/kit/src/data/`.
C1 Each entry of the confirmed list with the class blocker or major has 1 row in `redteam/FINDINGS.md` that cites its ID, and the fault no longer appears at the audited commit. Test: the correctness AUDITOR runs each reproduction and saves the output, 0 reproduce; the adversarial AUDITOR runs a 2nd, different input of the same fault for each, 0 reproduce. Fail: 1 or more reproduce, or 1 row is missing.
C2 Each entry of the confirmed list with the class minor or note, and each item of section 7 of the judge report, has 1 row in `redteam/FINDINGS.md` that cites its ID and states: repaired with its commit, or "open" with a reason, or "Needs the owner". Test: the framework-drift AUDITOR compares the lists row by row, 0 missing; the delivery report lists each "open" and each "Needs the owner" row by ID.
C3 Each repair under C1 is 1 commit that holds the repair and a test that fails without it, and no test between the base and the audited commit is skipped, deleted or weakened. Test: (a) the adversarial AUDITOR reverts each repair commit in a scratch copy and names the test that then fails; a repair with no such test fails C3. (b) An AUDITOR reads every line that `git diff 9e50434..<audited commit> -- <test files> | grep -E "^-.*expect"` prints. A removed line is "weakened" unless the AUDITOR names the assertion at the audited commit that tests the same behavior with the same or a stricter condition, or names the rule record that made the old assertion wrong; 0 weakened. (c) `grep -rnE "\b(x?it|x?test|x?describe)(\.[a-zA-Z]+)*\.(skip|only|todo|fails|skipIf|runIf)\b|\bx(it|test|describe)\(" packages/*/test apps/studio/e2e` prints nothing. (d) The same AUDITOR reads the whole of `git diff 9e50434..<audited commit> -- <test files>` and lists each added retry and each time limit that is new or raised, written as a named setting or as a bare number; 0 retries, and 0 limits above the highest limit at the base, 120,000 ms (`apps/studio/e2e/studio.e2e.ts`). (e) `git diff 9e50434..<audited commit> -- vitest.config.ts vitest.e2e.config.ts | grep -E "^[-+].*(include|exclude)"` prints nothing.
C4 `npm run check` exits with code 0 at the audited commit. Test: an AUDITOR runs it and saves the output.
C5 `PW_CHROMIUM=$HOME/.cache/ms-playwright/chromium-1255/chrome-linux64/chrome npm run e2e` exits with code 0 at the audited commit 3 times in a row. Test: an AUDITOR runs it and saves every output. Every run started is counted; a red run is a FINDING and no later run erases it. If a test outside `kit.e2e.ts` fails, C5 is reported FAIL with the names of the tests, and the USER decides. 3 green runs do not settle the unknown cause of KIT-41, and the delivery report says so.
C6 Every CI check on pull request 9 at the delivered commit ends in success. Test: an AUDITOR reads the checks of the pull request and saves them.
C7 Each number and status that describes the kit in `PROGRESS.md`, `packages/kit/README.md`, the rows KIT-* of `redteam/FINDINGS.md`, the rows this run adds, and the text of pull request 9 equals what a command prints at the audited commit; `PROGRESS.md` names M4 as the current milestone with its exit test open, and its part "Waiting on the owner" lists every question this run puts to the USER; the text of pull request 9 says in 1 line that the RUN FOLDER is a record and no code. Test: the framework-drift AUDITOR lists each number and status with the command that confirms it, 0 mismatches, and saves the text of the pull request whole.
C8 No dependency and no configuration for Neon or Vercel exists. Test: `grep -n -i -E "\"(@neondatabase/|@neon|neon|@vercel/|vercel)[^\"]*\" *:|neon\.tech|vercel\.app" $(git ls-files | grep -E "(^|/)(package\.json|package-lock\.json)$|^\.github/workflows/|(^|/)\.env")` prints nothing; `git ls-files | grep -E "(^|/)(vercel\.json|\.vercel/)"` prints nothing. C8 tests these files only; a line of record that states D60, cites Vercel's published guidelines, or lists `vercel.com` as a host that research could read, is outside C8.
C9 The run pushes nothing to CatCorner22/Frontend. Test: in the working copy, `git remote -v` and `git config --get-regexp "^(remote|url)\."` print no line that holds `CatCorner22/Frontend`; as a 2nd reading, `git ls-remote https://github.com/CatCorner22/Frontend` is compared with `evidence/frontend-refs-before.txt`, and each ref that differs is named. Fail: the first reading prints a line. A ref that differs in the 2nd reading is reported to the USER and is no failure by itself, because `git ls-remote` does not show who moved a ref.
C10 Pull request 9 is open and not merged at delivery, unless the USER has written an instruction to merge during the run. Test: an AUDITOR reads the state of the pull request and saves it.
C11 No line added between the base and the delivered commit, outside the RUN FOLDER, claims that output meets a standard. Test: `git diff 9e50434..<delivered commit> -- . ':!hinshitsu' | grep -n -E "^\+.*(WCAG|\bADA\b|[Aa]ccessib)"`; the language AUDITOR reads each line printed and rules it a claim or no claim, 0 claims.
C12 The RUN FOLDER holds the full record of the run. Test: the final AUDITOR runs `python3 <plugin folder>/scripts/hinshitsu_check.py hinshitsu/kit-repairs` and, for each failure printed, names the `CORRECTION` entry that answers it; 0 failures without such an entry. A `CORRECTION` entry answers a failure only where the failure sits in the text of an entry, or in the path that an entry names, and only a rewrite of that entry could clear it; a missing file, a missing entry and an open FINDING cannot be answered this way. `grep -c -E "^### E-[0-9]+ · [^·]+ · LAUNCH · " hinshitsu/kit-repairs/AUDIT-LOG.md` prints at most the number in the last `TIER` or `ANSWER` entry that holds a line "Planned SUB-AGENT runs". The 4 sessions of the second review ran before E-1 and are outside this count; the delivery report states them.
C13 The delivered commit differs from the audited commit only inside the RUN FOLDER, and no history is rewritten. Test: the final AUDITOR runs `git diff --stat <audited commit>..<delivered commit>`, every path starts with `hinshitsu/kit-repairs/`; `git merge-base --is-ancestor 6b0c2f8 <delivered commit>` exits 0; the final AUDITOR names both commits.
C14 The lines of `packages/kit/src` that changed after the commit the second review saw are reviewed from zero, and the judge's classes are spot-checked. Test: before WU-1 starts, 1 AUDITOR reads `git diff 83eced7..86287c2 -- packages/kit/src` with no report of the BUILDER, and re-rates 10 findings that the judge rated minor (the judge report holds 24). The AUDITOR gives each fault an ID `C14-<n>` and a class by the class definitions of the charter of the second review. Pass: the report is saved; each fault it reports with a reproduction, and each finding it rates major or blocker, is on the confirmed list with that ID and class and passes C1 or C2; and the delivery report lists each `C14-<n>` with its class for the USER. Fail: 1 such entry is absent from `redteam/FINDINGS.md`.
C15 Each RECIPIENT can use what is delivered. Test: the recipient-experience AUDITOR (a) runs the example of `packages/kit/README.md` word for word on `packages/kit/fixtures/good.html` and gets the grade the README states for it, and finds in the README the exported way to run the keyboard walks or the statement that none exists; (b) from the text of pull request 9 alone, lists what is repaired, what is open and what the owner decides, and the list equals `redteam/FINDINGS.md`.
C16 The delivery message to the USER holds at most 250 words, asks the USER for no command, and links each claim to the pull request, a session or a file. In it, each word in code formatting, each abbreviation in capitals and each term of the Hinshitsu glossary has its meaning in the same sentence at first use. Test: the language AUDITOR counts the words and lists each such term with its meaning, 0 without.

### E-61 · 2026-11-24T21:06:26Z · STAGE · ORCHESTRATOR

- Stage: S6
- Event: end

### E-62 · 2026-11-24T21:06:26Z · STAGE · ORCHESTRATOR

- Stage: S7
- Event: start

### E-63 · 2026-11-24T21:39:54Z · STAGE · orchestrator

- Stage: S7
- Event: progress

C14 report received from LAUNCH E-58 and saved whole at `audits/E-58-c14-review-from-zero.md`. It names 9 faults in the changed lines: C14-1, C14-4 and C14-8 with the class major, C14-2, C14-3, C14-5, C14-6, C14-7 and C14-9 with the class minor. It rates 6 of the judge's minors higher, as major: F-7, F-13, F-20, F-22, F-23 and F-24 of the judge report. By C14 all 15 join the confirmed list; the list of majors under C1 now holds 9 + 3 + 6 = 18 entries. The judge's F-12 did not reproduce for the AUDITOR at 86287c2. C14-6 and C14-7 name faults that commits 1115cfd and 63709e2 changed before the report arrived; no AUDITOR has re-run them.

### E-64 · 2026-11-25T00:02:00Z · STAGE · ORCHESTRATOR

- Stage: S7
- Event: progress

WU-1 is the whole change of pull request 9 outside the RUN FOLDER, `git diff 9e50434..183c166 -- . ':!hinshitsu'`: the repairs to `packages/kit`, their tests, and the records. The last commit that changes code is a973e47; 183c166 adds records and the saved outputs `evidence/final-runs/` (`npm run check` 257 passed; 3 runs of the browser command of C5, 420 passed each, exit 0). 3 earlier full runs on older commits were stopped by the BUILDER before they ended and are counted as started, not as passed: `/home/ubuntu/e2e-runs/aborted-28a51a9`, `aborted-828796b` and `pre-d38a239.log` on the BUILDER's machine. The plan of E-4 named 2 WORK UNITS; the repairs were built as 1 set, so 1 WORK UNIT is audited in 1 round, which spends fewer SUB-AGENT runs. The automated reviewer of the pull request raised 18 faults in 3 rounds (rows R2-AR-1 to R2-AR-18 of `redteam/FINDINGS.md`): 14 repaired, 4 open with a reason.

### E-65 · 2026-11-25T00:02:00Z · LAUNCH · ORCHESTRATOR

- Role: seeder for WU-1 (rule 16.7)
- Scope: `prompts/WU1-seeder.md`
- Commit under review: 183c1660d0e39f719262064aed5a1481c747553c
- SUB-AGENT identifier: e4a15aea8e8f4dc4b3d9a9ca53c47e1e https://app.devin.ai/sessions/e4a15aea8e8f4dc4b3d9a9ca53c47e1e
- Report: `audits/WU1-seed-E-65.md`

13 of 40 SUB-AGENT runs used (12 LAUNCH entries before this one and the probe E-1 are counted as the log counts them).

### E-66 · 2026-11-25T00:05:19Z · LAUNCH · ORCHESTRATOR

- Role: AUDITOR, correctness, WU-1
- Scope: `prompts/WU1-correctness.md`
- Commit under review: 183c1660d0e39f719262064aed5a1481c747553c
- SUB-AGENT identifier: c09608166fa742f79da7b6ae7a16a70e https://app.devin.ai/sessions/c09608166fa742f79da7b6ae7a16a70e
- Report: `audits/WU1-correctness-E-66.md`

15 of 40 SUB-AGENT runs used. The correctness and adversarial AUDITORS receive 2 versions (branches `audit/wu1-k3` and `audit/wu1-p7`, rule 16.7); the other roles receive the commit.

### E-67 · 2026-11-25T00:05:19Z · LAUNCH · ORCHESTRATOR

- Role: AUDITOR, adversarial, WU-1
- Scope: `prompts/WU1-adversarial.md`
- Commit under review: 183c1660d0e39f719262064aed5a1481c747553c
- SUB-AGENT identifier: ba7d0e50924d40d7a6d486d90aec3d8b https://app.devin.ai/sessions/ba7d0e50924d40d7a6d486d90aec3d8b
- Report: `audits/WU1-adversarial-E-67.md`

16 of 40 SUB-AGENT runs used. The correctness and adversarial AUDITORS receive 2 versions (branches `audit/wu1-k3` and `audit/wu1-p7`, rule 16.7); the other roles receive the commit.

### E-68 · 2026-11-25T00:05:19Z · LAUNCH · ORCHESTRATOR

- Role: AUDITOR, forensic-5s, WU-1
- Scope: `prompts/WU1-forensic-5s.md`
- Commit under review: 183c1660d0e39f719262064aed5a1481c747553c
- SUB-AGENT identifier: fd36457d64de4504b9a70791c0c882e5 https://app.devin.ai/sessions/fd36457d64de4504b9a70791c0c882e5
- Report: `audits/WU1-forensic-5s-E-68.md`

17 of 40 SUB-AGENT runs used. The correctness and adversarial AUDITORS receive 2 versions (branches `audit/wu1-k3` and `audit/wu1-p7`, rule 16.7); the other roles receive the commit.

### E-69 · 2026-11-25T00:05:19Z · LAUNCH · ORCHESTRATOR

- Role: AUDITOR, best-practices, WU-1
- Scope: `prompts/WU1-best-practices.md`
- Commit under review: 183c1660d0e39f719262064aed5a1481c747553c
- SUB-AGENT identifier: a885399ca5e241db9ad3f27ade416eb0 https://app.devin.ai/sessions/a885399ca5e241db9ad3f27ade416eb0
- Report: `audits/WU1-best-practices-E-69.md`

18 of 40 SUB-AGENT runs used. The correctness and adversarial AUDITORS receive 2 versions (branches `audit/wu1-k3` and `audit/wu1-p7`, rule 16.7); the other roles receive the commit.

### E-70 · 2026-11-25T00:05:19Z · LAUNCH · ORCHESTRATOR

- Role: AUDITOR, recipient-experience, WU-1
- Scope: `prompts/WU1-recipient-experience.md`
- Commit under review: 183c1660d0e39f719262064aed5a1481c747553c
- SUB-AGENT identifier: 8e874c44caaf49a4a01175433408feab https://app.devin.ai/sessions/8e874c44caaf49a4a01175433408feab
- Report: `audits/WU1-recipient-experience-E-70.md`

19 of 40 SUB-AGENT runs used. The correctness and adversarial AUDITORS receive 2 versions (branches `audit/wu1-k3` and `audit/wu1-p7`, rule 16.7); the other roles receive the commit.

### E-71 · 2026-11-25T00:05:19Z · LAUNCH · ORCHESTRATOR

- Role: AUDITOR, framework-drift, WU-1
- Scope: `prompts/WU1-framework-drift.md`
- Commit under review: 183c1660d0e39f719262064aed5a1481c747553c
- SUB-AGENT identifier: f677367614f449a5a07c9c1819075c47 https://app.devin.ai/sessions/f677367614f449a5a07c9c1819075c47
- Report: `audits/WU1-framework-drift-E-71.md`

20 of 40 SUB-AGENT runs used. The correctness and adversarial AUDITORS receive 2 versions (branches `audit/wu1-k3` and `audit/wu1-p7`, rule 16.7); the other roles receive the commit.

### E-72 · 2026-11-25T00:05:19Z · LAUNCH · ORCHESTRATOR

- Role: AUDITOR, language, WU-1
- Scope: `prompts/WU1-language.md`
- Commit under review: 183c1660d0e39f719262064aed5a1481c747553c
- SUB-AGENT identifier: ddf1ecce7aae4f04a5d8053feb265a4d https://app.devin.ai/sessions/ddf1ecce7aae4f04a5d8053feb265a4d
- Report: `audits/WU1-language-E-72.md`

21 of 40 SUB-AGENT runs used. The correctness and adversarial AUDITORS receive 2 versions (branches `audit/wu1-k3` and `audit/wu1-p7`, rule 16.7); the other roles receive the commit.

### E-73 · 2026-11-25T02:17:44Z · FINDING · auditor: CORRECTNESS

- ID: F-8
- Class: BLOCKER
- Where: see finding 1 of `audits/WU1-correctness-E-66.md`
- Trigger: **BLOCKER, k3 only (C1, R2-F-1).** `repairPlan([[reflow fails], [reflow status "fixed"], []])` returns `stop: true` with no item and nothing still open; p7 keeps the item. An earlier round with an unknown status erases an open failed floor. Fix: line 87 as in p7.
- Violates: as finding 1 of the report states
- Raised by: AUDITOR, LAUNCH E-66, `audits/WU1-correctness-E-66.md`, finding 1
- Lens: correctness
- Forward work stopped: yes — BLOCKER

### E-74 · 2026-11-25T02:17:51Z · FINDING · auditor: CORRECTNESS

- ID: F-9
- Class: BLOCKER
- Where: see finding 2 of `audits/WU1-correctness-E-66.md`
- Trigger: **BLOCKER, both (C1, R2-F-8).** The judge's input (2), `<button aria-label="&#x2800;">&#x2715;</button>` alone, still gives `controlsHaveNames: holds`. `behavior.ts` line 244 joins `aria-label` with the text before removing blank letters, so the "✕" counts as the name. The judge's other F-8 inputs …
- Violates: as finding 2 of the report states
- Raised by: AUDITOR, LAUNCH E-66, `audits/WU1-correctness-E-66.md`, finding 2
- Lens: correctness
- Forward work stopped: yes — BLOCKER

### E-75 · 2026-11-25T02:17:51Z · FINDING · auditor: CORRECTNESS

- ID: F-10
- Class: FRAGILITY
- Where: see finding 3 of `audits/WU1-correctness-E-66.md`
- Trigger: **FRAGILITY, both (C3, not my duty).** No test guards line 87: k3 passes all 257 unit tests and all 420 browser tests with the fault of finding 1.
- Violates: as finding 3 of the report states
- Raised by: AUDITOR, LAUNCH E-66, `audits/WU1-correctness-E-66.md`, finding 3
- Lens: correctness
- Forward work stopped: no

### E-76 · 2026-11-25T02:17:51Z · FINDING · auditor: CORRECTNESS

- ID: F-11
- Class: DEFECT
- Where: see finding 4 of `audits/WU1-correctness-E-66.md`
- Trigger: **DEFECT, both — second inputs of F-8.** SVG `<metadata>` text, undrawn SVG `<text>`, U+180E, U+034F, U+FE0F, U+E0020 and a private-use icon letter each count as a name.
- Violates: as finding 4 of the report states
- Raised by: AUDITOR, LAUNCH E-66, `audits/WU1-correctness-E-66.md`, finding 4
- Lens: correctness
- Forward work stopped: no

### E-77 · 2026-11-25T02:17:51Z · FINDING · auditor: CORRECTNESS

- ID: F-12
- Class: DEFECT
- Where: see finding 5 of `audits/WU1-correctness-E-66.md`
- Trigger: **DEFECT, both — F-3.** A carousel moved by a data attribute, `aria-hidden`, a CSS variable on `<html>`, a radio's `.checked`, or a style-sheet rule passes both movement checks (`neuro.ts` line 392 watches 4 attributes on `body` only).
- Violates: as finding 5 of the report states
- Raised by: AUDITOR, LAUNCH E-66, `audits/WU1-correctness-E-66.md`, finding 5
- Lens: correctness
- Forward work stopped: no

### E-78 · 2026-11-25T02:17:51Z · FINDING · auditor: CORRECTNESS

- ID: F-13
- Class: DEFECT
- Where: see finding 6 of `audits/WU1-correctness-E-66.md`
- Trigger: **DEFECT, both — F-4.** Endless SVG animations that start each other, and endless `::first-letter`, `::marker`, `::backdrop` animations hold; a paused animation that runs only on hover fails.
- Violates: as finding 6 of the report states
- Raised by: AUDITOR, LAUNCH E-66, `audits/WU1-correctness-E-66.md`, finding 6
- Lens: correctness
- Forward work stopped: no

### E-79 · 2026-11-25T02:17:52Z · FINDING · auditor: CORRECTNESS

- ID: F-14
- Class: DEFECT
- Where: see finding 7 of `audits/WU1-correctness-E-66.md`
- Trigger: **DEFECT, both — F-2.** `white-space: nowrap` text cut by an `overflow: hidden` or `contain: paint` parent holds at 320 px (`neuro.ts` line 295 reads element boxes only).
- Violates: as finding 7 of the report states
- Raised by: AUDITOR, LAUNCH E-66, `audits/WU1-correctness-E-66.md`, finding 7
- Lens: correctness
- Forward work stopped: no

### E-80 · 2026-11-25T02:17:52Z · FINDING · auditor: CORRECTNESS

- ID: F-15
- Class: DEFECT
- Where: see finding 8 of `audits/WU1-correctness-E-66.md`
- Trigger: **DEFECT, both — F-24.** Working pause controls are not seen (`input type="button"`, a labelled checkbox, "Pause banner", "Freeze the banner", Spanish "Pausar la animación"); a pause button inside a closed `details` counts.
- Violates: as finding 8 of the report states
- Raised by: AUDITOR, LAUNCH E-66, `audits/WU1-correctness-E-66.md`, finding 8
- Lens: correctness
- Forward work stopped: no

### E-81 · 2026-11-25T02:17:52Z · FINDING · auditor: CORRECTNESS

- ID: F-16
- Class: DEFECT
- Where: see finding 9 of `audits/WU1-correctness-E-66.md`
- Trigger: **DEFECT, both — F-13 and C14-4.** Sound text blamed as filler: Spanish `TODO: pan, dulces y café`, Portuguese `TODO`, a firm named "Acme", "Unleash your dog", "The parcel goes here", "0113 555-0142".
- Violates: as finding 9 of the report states
- Raised by: AUDITOR, LAUNCH E-66, `audits/WU1-correctness-E-66.md`, finding 9
- Lens: correctness
- Forward work stopped: no

### E-82 · 2026-11-25T02:17:52Z · FINDING · auditor: CORRECTNESS

- ID: F-17
- Class: DEFECT
- Where: see finding 10 of `audits/WU1-correctness-E-66.md`
- Trigger: **DEFECT, both — F-20.** Off-design colors hold in `::marker`, `::first-letter`, `-webkit-text-stroke`, `column-rule`, `border-image`, `drop-shadow`, SVG gradient stops, SVG `use`, `::selection`, `accent-color`; an off-design radius on a pseudo-element holds.
- Violates: as finding 10 of the report states
- Raised by: AUDITOR, LAUNCH E-66, `audits/WU1-correctness-E-66.md`, finding 10
- Lens: correctness
- Forward work stopped: no

### E-83 · 2026-11-25T02:17:52Z · FINDING · auditor: CORRECTNESS

- ID: F-18
- Class: FRAGILITY
- Where: see finding 11 of `audits/WU1-correctness-E-66.md`
- Trigger: **FRAGILITY, both — single narrow cases.** An SVG-drawn purple hero holds; a `visibility: hidden` spam trap is blamed; a decorative 300 px bullet is blamed as cut text; `grade` throws on a `null` finding; `fromPage` keeps U+0085.
- Violates: as finding 11 of the report states
- Raised by: AUDITOR, LAUNCH E-66, `audits/WU1-correctness-E-66.md`, finding 11
- Lens: correctness
- Forward work stopped: no

### E-84 · 2026-11-25T02:17:52Z · FINDING · auditor: ADVERSARIAL

- ID: F-19
- Class: BLOCKER
- Where: `packages/kit/src/logic/judge.ts:87` in `audit/wu1-k3`.
- Trigger: `repairPlan([[{ruleId:'neuro-no-autoplay',status:'fails',where:'p'}],[{ruleId:'neuro-no-autoplay',status:'fixed',where:'p'}],[]], KIT_RULES)`. K3 prints `{"stop":true,"reason":"Nothing was measured in the newest check, so there is nothing to repair and nothing is shown to hold.","open":[],"items":0…
- Violates: C1 (second input of F-1 reproduces).
- Raised by: AUDITOR, LAUNCH E-67, `audits/WU1-adversarial-E-67.md`, finding 1
- Lens: adversarial testing
- Forward work stopped: yes — BLOCKER

### E-85 · 2026-11-25T02:17:52Z · FINDING · auditor: ADVERSARIAL

- ID: F-20
- Class: BLOCKER
- Where: `packages/kit/src/page-checks/neuro.ts:286–298` (`noSidewaysScroll`).
- Trigger: window 320 px wide, each alone: (a) `<article style="overflow:hidden"><div><pre>npm install --save-exact some-very-long-package-name@1.2.3 another-long-package-name@4.5.6 third@7</pre></div></article>`; (b) `<div style="overflow:hidden"><canvas width="900" height="100" aria-label="Chart"></canvas><…
- Violates: C1.
- Raised by: AUDITOR, LAUNCH E-67, `audits/WU1-adversarial-E-67.md`, finding 2
- Lens: adversarial testing
- Forward work stopped: yes — BLOCKER

### E-86 · 2026-11-25T02:17:52Z · FINDING · auditor: ADVERSARIAL

- ID: F-21
- Class: BLOCKER
- Where: `packages/kit/src/page-checks/neuro.ts:23–60` (`noEndlessMotion`).
- Trigger: each alone answers `holds`: `li::marker{animation:blink 1s infinite}`; `input::placeholder{animation:blink 1s infinite}`; `<animate href="#c" attributeName="r" values="10;40;10" dur="1s" repeatDur="indefinite"/>` inside `<defs>`; two `<animate>` that restart each other (`begin="0s;b.end"`, `begin="…
- Violates: C1.
- Raised by: AUDITOR, LAUNCH E-67, `audits/WU1-adversarial-E-67.md`, finding 3
- Lens: adversarial testing
- Forward work stopped: yes — BLOCKER

### E-87 · 2026-11-25T02:17:52Z · FINDING · auditor: ADVERSARIAL

- ID: F-22
- Class: BLOCKER
- Where: `packages/kit/src/page-checks/behavior.ts:211–260` (`controlsHaveNames`).
- Trigger: each alone answers `holds`: a button that holds only an svg with `<metadata><rdf:RDF>…<dc:format>image/svg+xml</dc:format>…</metadata>` (the form Inkscape exports); an svg with `<text display="none">icon-close-24</text>`; an svg with `<sodipodi:namedview>layer1</sodipodi:namedview>`; `aria-label="&…
- Violates: C1.
- Raised by: AUDITOR, LAUNCH E-67, `audits/WU1-adversarial-E-67.md`, finding 4
- Lens: adversarial testing
- Forward work stopped: yes — BLOCKER

### E-88 · 2026-11-25T02:17:52Z · FINDING · auditor: ADVERSARIAL

- ID: F-23
- Class: BLOCKER
- Where: `packages/kit/src/page-checks/behavior.ts:85–130` (`focusIsVisible`); `packages/kit/src/logic/designId.ts` (`tidy`).
- Trigger: (a) `<p>` + `'<a href="/x">x</a> '.repeat(20000)`, then `focusIsVisible(document)`: no answer after 120 s, in both versions (`out/atk-focus-p7.log`, `-k3.log`). 5,000 links need 28 to 30 s; 20,000 `<input>` need 26 s. (b) a token value nested 200,000 arrays deep: `designId` throws `RangeError: Maxi…
- Violates: C1. The row R2-F-27 says fixed.
- Raised by: AUDITOR, LAUNCH E-67, `audits/WU1-adversarial-E-67.md`, finding 5
- Lens: adversarial testing
- Forward work stopped: yes — BLOCKER

### E-89 · 2026-11-25T02:17:52Z · FINDING · auditor: ADVERSARIAL

- ID: F-24
- Class: BLOCKER
- Where: `packages/kit/src/data/placeholders.ts:6–27` (`address line 1`, `service 1`); `packages/kit/src/page-checks/tells.ts:6–60`.
- Trigger: `<table><tr><th scope="row">Address line 1</th><td>4 Mill Lane</td></tr></table>` fails with `the phrase "address line 1"`; `<p>Bus service 1 runs to the centre every ten minutes.</p><h2>Service 1</h2>` fails twice with `the phrase "service 1"`. At the base both pages hold (`out/atk-page-base.log`,…
- Violates: C1.
- Raised by: AUDITOR, LAUNCH E-67, `audits/WU1-adversarial-E-67.md`, finding 6
- Lens: adversarial testing
- Forward work stopped: yes — BLOCKER

### E-90 · 2026-11-25T02:17:52Z · FINDING · auditor: ADVERSARIAL

- ID: F-25
- Class: DEFECT
- Where: `packages/kit/src/page-checks/neuro.ts:282–296`.
- Trigger: at 320 px, (a) `<div style="overflow:hidden;height:120px"><img alt="" src="…" style="width:900px;height:120px;max-width:none"></div><p>Bread, baked each morning.</p>` fails `neuro-reflow` at `img`; (b) a carousel `<div style="overflow:hidden;width:100%"><div style="display:flex;width:900px"><p styl…
- Violates: hard rule 13 of `CLAUDE.md` in effect (row R2-F-2 says fixed and names no such cost); the README limit "It skips parts placed outside the ordinary flow (a drawer, a slide)" is false for a slide in a flex row.
- Raised by: AUDITOR, LAUNCH E-67, `audits/WU1-adversarial-E-67.md`, finding 7
- Lens: adversarial testing
- Forward work stopped: no

### E-91 · 2026-11-25T02:17:52Z · FINDING · auditor: ADVERSARIAL

- ID: F-26
- Class: DEFECT
- Where: `packages/kit/src/page-checks/neuro.ts:308–432` (`noScriptedMotion`; the observer filters attributes to `style`, `class`, `src`, `hidden` and watches `body` only).
- Trigger: every 2 s a script (a) moves `data-on` from one slide to the next, with `#c p[data-on]{display:block}`; (b) sets `.checked` on the next radio button of a CSS carousel; (c) changes `sheet.cssRules[i].style.transform`; (d) sets a custom property on `<html>`; also `adoptedStyleSheets`, `img.srcset`, a…
- Violates: C1 if the ORCHESTRATOR rules these the same fault as F-3 (a script-driven carousel that holds both checks); I class them apart because the mechanism differs from the two that F-3 names. In any case the README names only canvas and slow changes as limits, so its statement of limits is incomplete (ha…
- Raised by: AUDITOR, LAUNCH E-67, `audits/WU1-adversarial-E-67.md`, finding 8
- Lens: adversarial testing
- Forward work stopped: no

### E-92 · 2026-11-25T02:17:52Z · FINDING · auditor: ADVERSARIAL

- ID: F-27
- Class: DEFECT
- Where: `packages/kit/test/kit.test.ts`, design ID tests (the test `reads a value of many unclosed url( in little time…`, line 314).
- Trigger: revert `1115cfd` in a scratch copy and run `npx vitest run packages/kit/test`. The run stood at 100 % of 1 processor for 21 min 45 s without a result, and I stopped it; a second run under `timeout` ended with exit code 124 and no test result (`out/rev-1115cfd-unit.log`, `out/rev-1115cfd-unit-one.lo…
- Violates: C3(a) as worded ("names the test that then fails"): the run does not become red, it never ends. A CI job would end only at its own limit, with no test named.
- Raised by: AUDITOR, LAUNCH E-67, `audits/WU1-adversarial-E-67.md`, finding 9
- Lens: adversarial testing
- Forward work stopped: no

### E-93 · 2026-11-25T02:17:52Z · FINDING · auditor: ADVERSARIAL

- ID: F-28
- Class: DEFECT
- Where: `packages/kit/test/kit.test.ts`, test `a status outside the four counts as "could not measure"…`: its `repairPlan` case puts the unknown status in the newest round only.
- Trigger: `npm run check` in K3: 257 passed, exit 0 (`out/check-k3.log`), with the fault of finding 1 present.
- Violates: C3 ("a test that fails without it") for the part of the F-1 repair that reads older rounds.
- Raised by: AUDITOR, LAUNCH E-67, `audits/WU1-adversarial-E-67.md`, finding 10
- Lens: adversarial testing
- Forward work stopped: no

### E-94 · 2026-11-25T02:17:52Z · FINDING · auditor: ADVERSARIAL

- ID: F-29
- Class: BLOCKER
- Where: `vitest.config.ts:2`.
- Trigger: command 7 above.
- Violates: C3(e).
- Raised by: AUDITOR, LAUNCH E-67, `audits/WU1-adversarial-E-67.md`, finding 11
- Lens: adversarial testing
- Forward work stopped: yes — BLOCKER

### E-95 · 2026-11-25T02:17:52Z · FINDING · auditor: ADVERSARIAL

- ID: F-30
- Class: FRAGILITY
- Where: `packages/kit/src/page-checks/neuro.ts:174–215` (`visibleLabels`), `behavior.ts:6–84` (`keyboardReachable`).
- Trigger: `<form><div aria-hidden="true" style="height:1px"><input name="card" tabindex="-1" placeholder="Card number" style="height:30px"></div><br><br><button>Pay</button></form>`. The field is drawn, 30 px high, and takes a click. `visibleLabels`: `not-applicable`; `keyboardReachable`: `holds`. Cases F5-h…
- Violates: the floors `neuro-visible-labels` and `behavior-keyboard-reach` as the README words them.
- Raised by: AUDITOR, LAUNCH E-67, `audits/WU1-adversarial-E-67.md`, finding 12
- Lens: adversarial testing
- Forward work stopped: no

### E-96 · 2026-11-25T02:17:52Z · FINDING · auditor: ADVERSARIAL

- ID: F-31
- Class: DEFECT
- Where: `packages/kit/src/page-checks/neuro.ts:23–60`.
- Trigger: each fails `moves without end`: `.x{animation:spin 1s linear infinite paused}`; `.x{animation:nothere 1s linear infinite}` with no such `@keyframes`; `@keyframes same{from{opacity:1}to{opacity:1}}`; an svg that holds one `<animate … repeatCount="3"/>` and one `<animate … repeatCount="indefinite" be…
- Violates: the floor's own text (movement that cannot stop); a sound page drops to "Below floor".
- Raised by: AUDITOR, LAUNCH E-67, `audits/WU1-adversarial-E-67.md`, finding 13
- Lens: adversarial testing
- Forward work stopped: no

### E-97 · 2026-11-25T02:17:52Z · FINDING · auditor: ADVERSARIAL

- ID: F-32
- Class: FRAGILITY
- Where: `packages/kit/src/logic/judge.ts`, `sound()`.
- Trigger: `grade([null], KIT_RULES)`: `TypeError: Cannot read properties of null (reading 'status')`; the same for `receipt` and `repairPlan`.
- Violates: the intent of the F-1 repair (findings arrive as data); no CRITERION by itself.
- Raised by: AUDITOR, LAUNCH E-67, `audits/WU1-adversarial-E-67.md`, finding 14
- Lens: adversarial testing
- Forward work stopped: no

### E-98 · 2026-11-25T02:17:52Z · FINDING · auditor: ADVERSARIAL

- ID: F-33
- Class: STYLE
- Where: `redteam/FINDINGS.md:107` (commits `1115cfd` and `7a345e2`).
- Trigger: read the row.
- Violates: the letter of C3 ("Each repair under C1 is 1 commit").
- Raised by: AUDITOR, LAUNCH E-67, `audits/WU1-adversarial-E-67.md`, finding 15
- Lens: adversarial testing
- Forward work stopped: no

### E-99 · 2026-11-25T02:17:52Z · FINDING · auditor: FORENSIC 5S

- ID: F-34
- Class: BLOCKER
- Where: `PROGRESS.md` line 36 ("a receipt in three lists that never mix"); the same count in `packages/kit/test/kit.test.ts` line 220 (test title "keeps the three lists apart") and `packages/kit/README.md` line 54 (comment "measured / not measured / a person must still check").
- Trigger: `grep -n "three lists" PROGRESS.md packages/kit/test/kit.test.ts` and `grep -n "four lists" packages/kit/src/logic/judge.ts`. The unit added `byAPerson` to `Receipt` and changed the comment at `judge.ts` line 135 to "The four lists never mix"; the 3 other places still say three.
- Violates: C7 (a number that describes the kit in `PROGRESS.md` does not equal the code).
- Raised by: AUDITOR, LAUNCH E-68, `audits/WU1-forensic-5s-E-68.md`, finding 1
- Lens: forensic 5S
- Forward work stopped: yes — BLOCKER

### E-100 · 2026-11-25T02:17:52Z · FINDING · auditor: FORENSIC 5S

- ID: F-35
- Class: BLOCKER
- Where: `PROGRESS.md` line 44 ("the judge confirmed 9 major and 23 minor findings"); `redteam/FINDINGS.md` line 107 (row R2-F-27, class "minor").
- Trigger: command 11: the judge report says "8 major, 24 minor, 2 notes" and rates F-27 "minor at the pin". E-60 makes F-27 major on the confirmed list. `PROGRESS.md` gives the judge the count 9 and 23 and leaves out the 2 notes; the row R2-F-27 says "minor". The 3 records give 3 different readings of 1 fact.
- Violates: C7; the class of R2-F-27 also bears on C1 (its row must show the class major).
- Raised by: AUDITOR, LAUNCH E-68, `audits/WU1-forensic-5s-E-68.md`, finding 2
- Lens: forensic 5S
- Forward work stopped: yes — BLOCKER

### E-101 · 2026-11-25T02:17:52Z · FINDING · auditor: FORENSIC 5S

- ID: F-36
- Class: DEFECT
- Where: `packages/kit/src/logic/judge.ts` line 25 (comment of `grade`: "The grade covers only what programs measured.") and line 170 (`Grade of the measured part:`).
- Trigger: command 13: after a person's answer the receipt prints "Grade of the measured part: Crafted. Every floor and rule holds, those that a person checked among them." Since D59 a person's answer enters the grade, so both texts are false.
- Violates: rule 14.6 as the glossary states it under DEFECT (a false statement in the DELIVERABLE); hard rule 13 of `CLAUDE.md`.
- Raised by: AUDITOR, LAUNCH E-68, `audits/WU1-forensic-5s-E-68.md`, finding 3
- Lens: forensic 5S
- Forward work stopped: no

### E-102 · 2026-11-25T02:17:52Z · FINDING · auditor: FORENSIC 5S

- ID: F-37
- Class: DEFECT
- Where: `packages/kit/src/page-checks/neuro.ts` line 408, against lines 51-52 and 398-399.
- Trigger: read the 3 failures of `noScriptedMotion`. The unit added the constants `required` and `fix` and uses them for the scroll and the animation failure. The third failure (a script changes a part) keeps its own literal with the old advice: "…add a visible button that pauses it and mark it with data-pau…
- Violates: the scope's hunt list (copy-paste drift).
- Raised by: AUDITOR, LAUNCH E-68, `audits/WU1-forensic-5s-E-68.md`, finding 4
- Lens: forensic 5S
- Forward work stopped: no

### E-103 · 2026-11-25T02:17:52Z · FINDING · auditor: FORENSIC 5S

- ID: F-38
- Class: DEFECT
- Where: `packages/kit/src/page-checks/neuro.ts` lines 31-32 (comments left above the new `hasPause`).
- Trigger: read lines 31-36. "Only a visible button that the builder marked for this job counts. A label that merely holds the word 'stop' does not" stands directly above the new comment and the code that accept a button by its name alone.
- Violates: the glossary's DEFECT (a false statement in the DELIVERABLE).
- Raised by: AUDITOR, LAUNCH E-68, `audits/WU1-forensic-5s-E-68.md`, finding 5
- Lens: forensic 5S
- Forward work stopped: no

### E-104 · 2026-11-25T02:17:52Z · FINDING · auditor: FORENSIC 5S

- ID: F-39
- Class: DEFECT
- Where: `packages/kit/src/data/brief.ts` lines 50-51.
- Trigger: command 13. The comment says words beyond 40 letters "are reported by the schema and not searched for"; the filter keeps words up to 200 letters, so a 50-letter word is reported by the schema and searched for as well.
- Violates: the scope's hunt list (hardcoded value that does not match its comment and the schema's `words(2, 40)`).
- Raised by: AUDITOR, LAUNCH E-68, `audits/WU1-forensic-5s-E-68.md`, finding 6
- Lens: forensic 5S
- Forward work stopped: no

### E-105 · 2026-11-25T02:17:52Z · FINDING · auditor: FORENSIC 5S

- ID: F-40
- Class: DEFECT
- Where: `apps/studio/e2e/kit.e2e.ts` lines 891-893.
- Trigger: read the lines. The comment says "digits of unequal width fail", and no assertion checks that. The only case is `cell('monospace')`, which the old test `/mono|courier/i` already passed, so the new `equalByNature` (`page-checks/craft.ts`) is never reached by this test. `grep -n equalByNature apps/st…
- Violates: the scope's hunt list (a name that does not match what the thing does). It bears on C3 only if the repair of KIT-28 counts under C1.
- Raised by: AUDITOR, LAUNCH E-68, `audits/WU1-forensic-5s-E-68.md`, finding 7
- Lens: forensic 5S
- Forward work stopped: no

### E-106 · 2026-11-25T02:17:52Z · FINDING · auditor: FORENSIC 5S

- ID: F-41
- Class: DEFECT
- Where: `DECISIONS.md` line 75 (row D63); `docs/owner-instructions.md`.
- Trigger: commands 8 and 9. Row D63 has 4 cells where every other row has 5: the last column (who decided) is missing. D63 quotes 3 statements of the owner ("First, please use Hinshitsu." and 2 more); `docs/owner-instructions.md` has a row for each owner statement up to D62 and none for these.
- Violates: hard rule 2 of `CLAUDE.md` (the approval is recorded) in form; the glossary's DEFECT (an out-of-date record).
- Raised by: AUDITOR, LAUNCH E-68, `audits/WU1-forensic-5s-E-68.md`, finding 8
- Lens: forensic 5S
- Forward work stopped: no

### E-107 · 2026-11-25T02:17:52Z · FINDING · auditor: FORENSIC 5S

- ID: F-42
- Class: DEFECT
- Where: `packages/kit/src/data/craft.ts` line 6, `fit.ts` line 4, `neuro.ts` line 11, `states.ts` line 8 (`const reviewed = '2026-11-18'`).
- Trigger: the unit changed 10 records on 2026-11-24 (9 evidence grades, the text of `neuro-motion-can-stop`, `appliesWhen` of `neuro-no-surprise`); each still carries the review date 2026-11-18.
- Violates: hard rule 5 of `CLAUDE.md` (a record carries a review date); UNVERIFIED whether the project means the date of the last change, so the ORCHESTRATOR may rule this STYLE.
- Raised by: AUDITOR, LAUNCH E-68, `audits/WU1-forensic-5s-E-68.md`, finding 9
- Lens: forensic 5S
- Forward work stopped: no

### E-108 · 2026-11-25T02:17:52Z · FINDING · auditor: FORENSIC 5S

- ID: F-43
- Class: FRAGILITY
- Where: `packages/kit/src/page-checks/behavior.ts` line 63 and `neuro.ts` line 188 (2 copies of `unmet`); the 4 tests of "is this `::before` drawn" in `behavior.ts` line 114, `fit.ts` line 126, `neuro.ts` line 62, `tells.ts` line 112.
- Trigger: read the copies side by side. The copy in `neuro.ts` has a third condition (the Tab order) and the copy in `behavior.ts` does not; `behavior.ts` falls back on the global `window` (line 67) where every other line uses `doc.defaultView`. The 4 pseudo-element tests differ: `content` "none" only (`tell…
- Violates: the scope's hunt list (2 copies of 1 thing that no longer match). It fails when the next repair changes 1 copy only; no test compares the copies, as one does for the placeholder lists.
- Raised by: AUDITOR, LAUNCH E-68, `audits/WU1-forensic-5s-E-68.md`, finding 10
- Lens: forensic 5S
- Forward work stopped: no

### E-109 · 2026-11-25T02:17:52Z · FINDING · auditor: FORENSIC 5S

- ID: F-44
- Class: FRAGILITY
- Where: `packages/kit/src/page-checks/behavior.ts` line 287 (`.slice(0, 200)`, `.slice(0, 50)`); `neuro.ts` lines 36 and 315 (`.slice(0, 2000)`).
- Trigger: read the lines. `dialogsAreMarked` reads at most 200 neighbors and 50 parts inside each; `hasPause` reads the first 2,000 buttons. Beyond the cap the check answers "holds" or "fails" as if it had read all, where `targetSize` (line 158) says "could not measure".
- Violates: the scope's hunt list (hardcoded values); it fails on a larger page.
- Raised by: AUDITOR, LAUNCH E-68, `audits/WU1-forensic-5s-E-68.md`, finding 11
- Lens: forensic 5S
- Forward work stopped: no

### E-110 · 2026-11-25T02:17:52Z · FINDING · auditor: FORENSIC 5S

- ID: F-45
- Class: FRAGILITY
- Where: `packages/kit/test/kit.test.ts` lines 318, 344, 437, 443; `apps/studio/e2e/kit.e2e.ts` lines 263 and 930.
- Trigger: read the lines. 6 assertions compare wall-clock time with a bare number (2,000 to 40,000 ms). They passed here; on a slower or loaded machine they fail with no fault in the code.
- Violates: the scope's hunt list (hardcoded values); glossary BLOCKER (f) would apply only if a run gave 2 results, which I did not observe.
- Raised by: AUDITOR, LAUNCH E-68, `audits/WU1-forensic-5s-E-68.md`, finding 12
- Lens: forensic 5S
- Forward work stopped: no

### E-111 · 2026-11-25T02:17:52Z · FINDING · auditor: FORENSIC 5S

- ID: F-46
- Class: FRAGILITY
- Where: `scripts/audit.mjs` lines 66 and 71.
- Trigger: command 12. An exception matches an advisory by ID and package (line 66); the test for a dead exception matches by ID alone (line 71). An exception with the right ID and the wrong package excepts nothing and is never reported as dead.
- Violates: the file's own comment, lines 15-17 ("An exception whose advisory no longer appears also fails").
- Raised by: AUDITOR, LAUNCH E-68, `audits/WU1-forensic-5s-E-68.md`, finding 13
- Lens: forensic 5S
- Forward work stopped: no

### E-112 · 2026-11-25T02:17:52Z · FINDING · auditor: FORENSIC 5S

- ID: F-47
- Class: STYLE
- Where: `packages/kit/src/logic/judge.ts` line 109 (`?? 'Make this rule hold.'`); `page-checks/behavior.ts` line 166 (`?? measure(el)`).
- Trigger: read the lines. Both fallbacks cannot run: `plain` is a required field of a record that `record.has` just found, and every element of `targets` is in `boxes`.
- Violates: the scope's hunt list (dead code).
- Raised by: AUDITOR, LAUNCH E-68, `audits/WU1-forensic-5s-E-68.md`, finding 14
- Lens: forensic 5S
- Forward work stopped: no

### E-113 · 2026-11-25T02:17:52Z · FINDING · auditor: FORENSIC 5S

- ID: F-48
- Class: STYLE
- Where: `packages/kit/src/logic/judge.ts` lines 13-18 and line 46.
- Trigger: read them; command 13. The comment block that explains `sound` sits above the constant `UNKNOWN_STATUS`. The reason "N finding(s) name a rule…" counts rule ids, not findings: 3 findings under 1 unknown id print "1 finding(s)".
- Violates: the scope's hunt list (names that do not match).
- Raised by: AUDITOR, LAUNCH E-68, `audits/WU1-forensic-5s-E-68.md`, finding 15
- Lens: forensic 5S
- Forward work stopped: no

### E-114 · 2026-11-25T02:17:52Z · FINDING · auditor: FORENSIC 5S

- ID: F-49
- Class: STYLE
- Where: `packages/kit/src/page-checks/fit.ts` lines 80, 113, 122, 130; `behavior.ts` line 106; `tells.ts` line 120. Also `brief.ts` line 12 and `placeholders.ts` line 28; `tells.ts` lines 51 and 54; `behavior.ts` lines 100-104.
- Trigger: `grep -n "oklab|oklch|color)" -r packages/kit/src/page-checks`. The pattern that finds a color in a text is written out 6 times, 4 of them inside `tokenFit`; the cap beside it is 2,000 letters in 5 places and 4,000 in `tells.ts`. The pattern that escapes a phrase is written twice. `tells.ts` works …
- Violates: the scope's hunt list (copy-paste, hardcoded values).
- Raised by: AUDITOR, LAUNCH E-68, `audits/WU1-forensic-5s-E-68.md`, finding 16
- Lens: forensic 5S
- Forward work stopped: no

### E-115 · 2026-11-25T02:17:53Z · FINDING · auditor: FORENSIC 5S

- ID: F-50
- Class: STYLE
- Where: `packages/kit/src/page-checks/behavior.ts` line 316 (`nextTells`); `tells.ts` line 5; `neuro.ts` lines 184-190.
- Trigger: read them. `nextTells` is also true for the paragraph before the list. The comment of `placeholderCopy` says "The list must equal PLACEHOLDER_PHRASES"; there are now 3 lists, and the test compares all 3. In `unmet`, "Both signs are needed" is followed by "A third sign is needed".
- Violates: the scope's hunt list (names and comments that do not match).
- Raised by: AUDITOR, LAUNCH E-68, `audits/WU1-forensic-5s-E-68.md`, finding 17
- Lens: forensic 5S
- Forward work stopped: no

### E-116 · 2026-11-25T02:17:53Z · FINDING · auditor: FORENSIC 5S

- ID: F-51
- Class: STYLE
- Where: `packages/kit/src/page-checks/behavior.ts` line 90; `apps/studio/e2e/kit.e2e.ts` lines 637-652 and line 869; `craft.ts` lines 126 and 201.
- Trigger: read them. The comment at `behavior.ts` line 90 starts in column 1 inside a function. 16 lines of the test "automated review, round 9" are indented 4 spaces where the block has 6, and the test at line 869 has no blank line before it. `oneTypeScale` and `layoutShift` write the element-name pattern o…
- Violates: the scope's hunt list (sloppiness of form). Lint passes, because no formatter runs in `npm run check`.
- Raised by: AUDITOR, LAUNCH E-68, `audits/WU1-forensic-5s-E-68.md`, finding 18
- Lens: forensic 5S
- Forward work stopped: no

### E-117 · 2026-11-25T02:17:53Z · FINDING · auditor: FORENSIC 5S

- ID: F-52
- Class: STYLE
- Where: `apps/studio/e2e/kit.e2e.ts` lines 374, 386, 662 (`gif`, 2 different pictures under 1 name); 528 and 534 (`turn`); 746 and 763 (`track`); the list of the 3 person-only floors written twice in 1 test (lines 94-95); `packages/kit/test/kit.test.ts` line 508.
- Trigger: read them. The same constant is pasted into neighboring tests. The README test stands inside `describe('walks')`. Test titles name their source in 5 forms ("second review, F-5", "second review F-5", "F-33:", "C14-8, C14-9:", "automated review, round 9"), and a bare "F-24" means the first review in …
- Violates: the scope's hunt list (copy-paste; names).
- Raised by: AUDITOR, LAUNCH E-68, `audits/WU1-forensic-5s-E-68.md`, finding 19
- Lens: forensic 5S
- Forward work stopped: no

### E-118 · 2026-11-25T02:17:53Z · FINDING · auditor: FORENSIC 5S

- ID: F-53
- Class: STYLE
- Where: `package.json` line 25 (`"audit:deps"`).
- Trigger: command 10. Nothing calls the script: CI runs `node scripts/audit.mjs` directly, and no record names it.
- Violates: the scope's hunt list (a thing that nothing references).
- Raised by: AUDITOR, LAUNCH E-68, `audits/WU1-forensic-5s-E-68.md`, finding 20
- Lens: forensic 5S
- Forward work stopped: no

### E-119 · 2026-11-25T02:17:53Z · FINDING · auditor: BEST PRACTICES

- ID: F-54
- Class: BLOCKER
- Where: `vitest.config.ts` line 2 (commit `f2ef274`).
- Trigger: `git diff 9e50434..183c166 -- vitest.config.ts vitest.e2e.config.ts | grep -E "^[-+].*(include|exclude)"` prints: ``` -export default defineConfig({ test: { include: ['packages/**/test/**/*.test.ts'], environment: 'node' } }); +export default defineConfig({ test: { include: ['packages/**/test/**/*.…
- Violates: C3(e).
- Raised by: AUDITOR, LAUNCH E-69, `audits/WU1-best-practices-E-69.md`, finding 1
- Lens: best practices
- Forward work stopped: yes — BLOCKER

### E-120 · 2026-11-25T02:17:53Z · FINDING · auditor: BEST PRACTICES

- ID: F-55
- Class: DEFECT
- Where: `packages/kit/src/logic/judge.ts` line 50; also the comment at line 25 and the heading at line 170.
- Trigger: `grade()` with a finding `holds` for each of the 16 floors and no finding for any other rule (probe P1). Output: `grade=Crafted reason=Every floor and rule holds, those that a person checked among them.` 26 rules that a program checks had no finding. At the base the sentence was "Every **measured**…
- Violates: `CLAUDE.md` hard rule 13 ("Report outcomes faithfully") and the defined term "Honest receipt"; C7 in spirit (a status that describes the kit). No CRITERION names this sentence.
- Raised by: AUDITOR, LAUNCH E-69, `audits/WU1-best-practices-E-69.md`, finding 2
- Lens: best practices
- Forward work stopped: no

### E-121 · 2026-11-25T02:17:53Z · FINDING · auditor: BEST PRACTICES

- ID: F-56
- Class: DEFECT
- Where: `packages/kit/src/shapes.ts` line 2 (added); `packages/kit/README.md` lines 45–50 (changed in this unit); `apps/studio/e2e/kit.e2e.ts` `runAll` and `runAllWithReflow` (lines 29–44).
- Trigger: probe P5 prints the order of `Object.keys(checks)`: `… unseenParts, keyboardReachable, focusIsVisible, targetSize, controlsHaveNames, dialogsAreMarked, …, tokenFit`. The README loop and both helpers use that order. The README does not hold the word `focusIsVisible` (`grep -n -i focusIsVisible packa…
- Violates: `CLAUDE.md`, "Writing style for anything the owner reads" (state what can go wrong) and hard rule 13; the README is the document a RECIPIENT follows (C15).
- Raised by: AUDITOR, LAUNCH E-69, `audits/WU1-best-practices-E-69.md`, finding 3
- Lens: best practices
- Forward work stopped: no

### E-122 · 2026-11-25T02:17:53Z · FINDING · auditor: BEST PRACTICES

- ID: F-57
- Class: DEFECT
- Where: `packages/kit/src/logic/designId.ts` line 16; comment at line 8; test comment "A value that is not text is read as its text, and does not throw" in `packages/kit/test/kit.test.ts`.
- Trigger: probe P2: `designId({ t: { a: 1n } })` → `TypeError: Do not know how to serialize a BigInt`; a value that holds itself → `TypeError: Converting circular structure to JSON`.
- Violates: TypeScript practice: a parameter typed `unknown` promises to handle any value; the function's own comment.
- Raised by: AUDITOR, LAUNCH E-69, `audits/WU1-best-practices-E-69.md`, finding 4
- Lens: best practices
- Forward work stopped: no

### E-123 · 2026-11-25T02:17:53Z · FINDING · auditor: BEST PRACTICES

- ID: F-58
- Class: FRAGILITY
- Where: `packages/kit/src/page-checks/behavior.ts` line 67: `(view ?? window).getComputedStyle(at)`; line 68 `view?.scrollY ?? 0`.
- Trigger: read. Every other check in the 5 files takes the window from `doc.defaultView` and returns `could-not-measure` ("the page has no window") when there is none (e.g. `behavior.ts` line 88). Here a document with no window falls through to a global that need not exist, and the check throws a `ReferenceE…
- Violates: the convention of the surrounding file; `shapes.ts` line 2 ("works on one page").
- Raised by: AUDITOR, LAUNCH E-69, `audits/WU1-best-practices-E-69.md`, finding 5
- Lens: best practices
- Forward work stopped: no

### E-124 · 2026-11-25T02:17:53Z · FINDING · auditor: BEST PRACTICES

- ID: F-59
- Class: FRAGILITY
- Where: `behavior.ts` line 114 (content matches `none|normal|""|''`, or `display: none`, or not visible, or opacity 0); `fit.ts` lines 124–126 (`none` or `normal`, `display`, `visibility !== 'visible'`); `neuro.ts` lines 60–62 (`none`, `normal`, `display`, `visibility !== 'hidden'`); `tells.ts` line 112 (`…
- Trigger: read. All 4 are added in this unit. `tells.ts` alone does not treat `content: normal` as "not drawn". I did not run a browser other than Chromium 1255, so whether another browser reports `normal` there is UNVERIFIED; the fragility named is "another browser".
- Violates: one concept, one test (the spirit of `CLAUDE.md` "one term per concept"); maintainability.
- Raised by: AUDITOR, LAUNCH E-69, `audits/WU1-best-practices-E-69.md`, finding 6
- Lens: best practices
- Forward work stopped: no

### E-125 · 2026-11-25T02:17:53Z · FINDING · auditor: BEST PRACTICES

- ID: F-60
- Class: STYLE
- Where: `/#[0-9a-f]{3,8}\b|\b(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch|color)\([^()]*\)/gi` at `fit.ts` lines 80, 113, 122, 130 (4 times inside the one function `tokenFit`), `behavior.ts` line 106, `tells.ts` line 120.
- Trigger: `grep -n "oklab|oklch|color)" packages/kit/src/page-checks/*.ts` prints those 6 lines.
- Violates: common TypeScript practice (name a repeated literal once). Copies across functions are forced by the convention that each check is one self-contained function; the 4 copies inside `tokenFit` are not.
- Raised by: AUDITOR, LAUNCH E-69, `audits/WU1-best-practices-E-69.md`, finding 7
- Lens: best practices
- Forward work stopped: no

### E-126 · 2026-11-25T02:17:53Z · FINDING · auditor: BEST PRACTICES

- ID: F-61
- Class: FRAGILITY
- Where: `packages/kit/test/kit.test.ts` lines 318 (`< 2000` ms, `Date.now()`), 344 (`< 5000`), 437 and 443 (`< 3000`, `performance.now()`); `apps/studio/e2e/kit.e2e.ts` lines 263 (`< 40000`) and 930 (`< 10_000`).
- Trigger: read; on this machine all pass with a wide margin (the e2e test of line 263 took 1,637 ms; that of line 930 took 531 ms). Change that breaks them: a slower or busier machine (a CI runner under load). The suite has shown one unexplained red run before (KIT-41).
- Violates: Vitest practice: a test's time limit belongs in the test's timeout, and a speed claim in a benchmark; a clock assertion makes the same check give 2 results on 2 machines.
- Raised by: AUDITOR, LAUNCH E-69, `audits/WU1-best-practices-E-69.md`, finding 8
- Lens: best practices
- Forward work stopped: no

### E-127 · 2026-11-25T02:17:53Z · FINDING · auditor: BEST PRACTICES

- ID: F-62
- Class: FRAGILITY
- Where: `apps/studio/e2e/kit.e2e.ts` lines 264, 525, 531, 553 (`60000`) and 743, 760, 777 (`60_000`); default `testTimeout: 90_000` in `vitest.e2e.config.ts`.
- Trigger: read, and run 4: "second review F-3: a carousel that a script scrolls…" took 33,212 ms, of which 33 s is fixed waiting (3 pages × 11 s); "F-3: one scroll…" took 22,299 ms. The limit reads like a raise and is in fact a cut of 30 s. The base file did the same in 3 tests, so this follows a habit of th…
- Violates: nothing in C3(d) (no limit is above 120,000 ms). Vitest practice: pass a per-test timeout only to raise it.
- Raised by: AUDITOR, LAUNCH E-69, `audits/WU1-best-practices-E-69.md`, finding 9
- Lens: best practices
- Forward work stopped: no

### E-128 · 2026-11-25T02:17:53Z · FINDING · auditor: BEST PRACTICES

- ID: F-63
- Class: FRAGILITY
- Where: `packages/kit/src/page-checks/neuro.ts` lines 36 and 315: `.slice(0, 2000)` on the buttons searched for a pause control. Compare `behavior.ts` line 157: `MOST = 3000`, above which `targetSize` returns `could-not-measure`.
- Trigger: read. On a page with more than 2,000 buttons whose pause button comes later in the page, the motion floor fails with no word that the search stopped. Not run in a browser: UNVERIFIED as a reproduction. The 15 lines that define `hasPause` are also identical in both functions (`diff` of lines 36–50 a…
- Violates: the kit's own rule that a check which did not look says so (`could-not-measure`; README "What can go wrong").
- Raised by: AUDITOR, LAUNCH E-69, `audits/WU1-best-practices-E-69.md`, finding 10
- Lens: best practices
- Forward work stopped: no

### E-129 · 2026-11-25T02:17:53Z · FINDING · auditor: BEST PRACTICES

- ID: F-64
- Class: FRAGILITY
- Where: `packages/kit/src/page-checks/neuro.ts` line 388: `animation.constructor.name === 'Animation'`.
- Trigger: read; passes in Chromium 1255 (run 3). Change that breaks it: a page or tool that subclasses `Animation`, or a bundler that renames classes in the page.
- Violates: documented platform practice (MDN, Web Animations API): test with `instanceof CSSAnimation` and `instanceof CSSTransition`.
- Raised by: AUDITOR, LAUNCH E-69, `audits/WU1-best-practices-E-69.md`, finding 11
- Lens: best practices
- Forward work stopped: no

### E-130 · 2026-11-25T02:17:53Z · FINDING · auditor: BEST PRACTICES

- ID: F-65
- Class: STYLE
- Where: see finding 12 of `audits/WU1-best-practices-E-69.md`
- Trigger: Small matters of form in the added lines - **Class:** STYLE (5 items, 1 finding). - **Where and trigger:** 1. `packages/kit/src/data/brief.ts` lines 50–51: the comment says words longer than the Brief allows are "not searched for"; the filter admits words up to 200 letters, and the schema's limit i…
- Violates: `CLAUDE.md` "One term per concept"; the conventions of the files around the change.
- Raised by: AUDITOR, LAUNCH E-69, `audits/WU1-best-practices-E-69.md`, finding 12
- Lens: best practices
- Forward work stopped: no

### E-131 · 2026-11-25T02:17:53Z · FINDING · auditor: RECIPIENT EXPERIENCE

- ID: F-66
- Class: BLOCKER
- Where: `packages/kit/README.md`, section "How to use it", lines 36-60; also line 64.
- Trigger: `grep -n -i walk packages/kit/README.md` prints lines 17, 34 and 64 only. A builder session that follows the example gets "Not graded" for a sound page (run 3), reads in line 64 that the window walk must run, and finds no name to import and no statement that it must write the runner. The answer exi…
- Violates: C15 (a), second half.
- Raised by: AUDITOR, LAUNCH E-70, `audits/WU1-recipient-experience-E-70.md`, finding 1
- Lens: recipient experience
- Forward work stopped: yes — BLOCKER

### E-132 · 2026-11-25T02:17:53Z · FINDING · auditor: RECIPIENT EXPERIENCE

- ID: F-67
- Class: DEFECT
- Where: `packages/kit/README.md` line 60 ("Playwright's own, Vitest, or `tsx`"), with lines 40 and 48.
- Trigger: (i) `npx tsx recipient/readme-example.ts`, versions 4.20.6 and 4.23.15: `page.evaluate: ReferenceError: __name is not defined at balancedHeadings` (runs 2 and 2b). My reading of the cause, not tested further: `tsx` rewrites named inner functions to call a helper `__name`; line 48 sends the function…
- Violates: C15 (the builder session cannot use the example as told); C7 by its sense (a statement about the kit that a command contradicts).
- Raised by: AUDITOR, LAUNCH E-70, `audits/WU1-recipient-experience-E-70.md`, finding 2
- Lens: recipient experience
- Forward work stopped: no

### E-133 · 2026-11-25T02:17:53Z · FINDING · auditor: RECIPIENT EXPERIENCE

- ID: F-68
- Class: DEFECT
- Where: `packages/kit/README.md` lines 44 and 48.
- Trigger: `npx tsc -p recipient/tsconfig.json` (the settings of `tsconfig.e2e.json`): `TS2488: Type 'unknown' must have a '[Symbol.iterator]()' method` and `TS7053: ... expression of type 'string' can't be used to index type 'typeof import(".../page-checks/index")'` (run 4). A builder session that puts the e…
- Violates: C15 (the builder session).
- Raised by: AUDITOR, LAUNCH E-70, `audits/WU1-recipient-experience-E-70.md`, finding 3
- Lens: recipient experience
- Forward work stopped: no

### E-134 · 2026-11-25T02:17:53Z · FINDING · auditor: RECIPIENT EXPERIENCE

- ID: F-69
- Class: DEFECT
- Where: `pr9-text.md` line 10 (table header) and line 12 (34 of 34); `PROGRESS.md` line 44 ("57 are repaired, each with a test"); against `redteam/FINDINGS.md` row R2-F-31.
- Trigger: `grep "^| R2-F-31 " redteam/FINDINGS.md` ends: "Fixed 2026-11-24: the three bullets of `PROGRESS.md` are marked as history ... No test: these are records." The owner's list from the pull request says 57 repairs with a test; the log holds 56 (`grep "^| R2-" redteam/FINDINGS.md | grep -c "No test"` p…
- Violates: C15 (b); C7.
- Raised by: AUDITOR, LAUNCH E-70, `audits/WU1-recipient-experience-E-70.md`, finding 4
- Lens: recipient experience
- Forward work stopped: no

### E-135 · 2026-11-25T02:17:53Z · FINDING · auditor: RECIPIENT EXPERIENCE

- ID: F-70
- Class: DEFECT
- Where: `PROGRESS.md` line 44 ("the judge confirmed 9 major and 23 minor findings, no blocker"); judge report line 28 ("63 attempts confirmed, merged into 34 findings: 8 major, 24 minor, 2 notes. No blocker.") and line 380 ("F-27 | minor at the pin"); `redteam/FINDINGS.md` line 107 (R2-F-27, severity "mino…
- Trigger: `grep "^| R2-F-" redteam/FINDINGS.md`, severity cell: 14 rows start with "major", 18 "minor", 2 "note". Of the 14, 8 are plain "major" (R2-F-1 to 6, 8, 9) and 6 say "major (the judge: minor; the review from zero rated ...)" (R2-F-7, 13, 20, 22, 23, 24). R2-F-27 is "minor" with no such note. So no c…
- Violates: C7 (a number in `PROGRESS.md` that no command prints); it bears on C1, which is decided by class. I did not run C1 or C7 as a whole.
- Raised by: AUDITOR, LAUNCH E-70, `audits/WU1-recipient-experience-E-70.md`, finding 5
- Lens: recipient experience
- Forward work stopped: no

### E-136 · 2026-11-25T02:17:53Z · FINDING · auditor: RECIPIENT EXPERIENCE

- ID: F-71
- Class: DEFECT
- Where: `pr9-text.md` lines 16-17; `redteam/FINDINGS.md` lines 33, 37, 74, 76, 77, 78.
- Trigger: The script's output (`b1-findings-r2-rows.txt`) shows: KIT-01 "Open: the commits stay in the history"; KIT-05 "Open in part: Not repaired in code"; KIT-42 "Decided (D59 ...) Open until then"; KIT-44 "Open: the builder did not record the command"; KIT-45 "Open (notes)"; KIT-46 "Open: a further revie…
- Violates: C15 (b); C7 (status of the rows `KIT-*`).
- Raised by: AUDITOR, LAUNCH E-70, `audits/WU1-recipient-experience-E-70.md`, finding 6
- Lens: recipient experience
- Forward work stopped: no

### E-137 · 2026-11-25T02:17:53Z · FINDING · auditor: RECIPIENT EXPERIENCE

- ID: F-72
- Class: BLOCKER
- Where: judge report, section 7, lines 450-463 (12 bullets, 15 attempt IDs); `redteam/FINDINGS.md`; `PROGRESS.md`; `pr9-text.md`.
- Trigger: `for b in B-014 B-079 B-113 B-001 B-042 B-092 B-019 B-099 B-006 B-049 B-093 B-120 B-080 B-044 B-013; do grep -c "$b" redteam/FINDINGS.md PROGRESS.md; done` prints 0 for each ID in each file. `grep -n -i "section 7" redteam/FINDINGS.md` prints nothing. The pull request says "For the owner to decide:…
- Violates: C2; C15 (b) (the owner's list of what the owner decides cannot hold items that no record names).
- Raised by: AUDITOR, LAUNCH E-70, `audits/WU1-recipient-experience-E-70.md`, finding 7
- Lens: recipient experience
- Forward work stopped: yes — BLOCKER

### E-138 · 2026-11-25T02:17:53Z · FINDING · auditor: RECIPIENT EXPERIENCE

- ID: F-73
- Class: STYLE
- Where: `packages/kit/README.md` lines 52-64.
- Trigger: `grep -n "good.html" packages/kit/README.md` prints nothing; the fixture appears only as "one built with care" (line 20). The builder session must combine line 64 with the example to know that "Not graded" is the right answer and not a fault of its setup.
- Violates: C15 (a) by its wording ("the grade the README states for it"); no result changes.
- Raised by: AUDITOR, LAUNCH E-70, `audits/WU1-recipient-experience-E-70.md`, finding 8
- Lens: recipient experience
- Forward work stopped: no

### E-139 · 2026-11-25T02:17:53Z · FINDING · auditor: RECIPIENT EXPERIENCE

- ID: F-74
- Class: STYLE
- Where: output of `receiptText(receipt(findings, KIT_RULES))`, list "MEASURED BY A PROGRAM", lines 2 and 3 (`a3-vitest-good.log` lines 38-39).
- Trigger: Run 3. "Anything that moves for more than five seconds has a visible button that pauses it. ..." appears once with "Holds." and once with "Holds (found: ‹no repeated change in 11 s›)." The receipt does not say which check gave which line.
- Violates: nothing in the CRITERIA; the builder session reads a doubled line.
- Raised by: AUDITOR, LAUNCH E-70, `audits/WU1-recipient-experience-E-70.md`, finding 9
- Lens: recipient experience
- Forward work stopped: no

### E-140 · 2026-11-25T02:17:53Z · FINDING · auditor: FRAMEWORK DRIFT

- ID: F-75
- Class: BLOCKER
- Where: `redteam/FINDINGS.md` (whole file); judge report section 7, lines 450–463.
- Trigger: `for id in B-014 B-079 B-113 B-001 B-042 B-092 B-019 B-099 B-006 B-049 B-093 B-120 B-080 B-044 B-013; do echo "$id $(grep -c -- "$id" redteam/FINDINGS.md)"; done` prints 0 for all 15 IDs. Searches for the items' words ("section 7", "blindScore", "U+202E", "lazyloading", "59 detector") find no `R2-*…
- Violates: C2.
- Raised by: AUDITOR, LAUNCH E-71, `audits/WU1-framework-drift-E-71.md`, finding 1
- Lens: framework drift
- Forward work stopped: yes — BLOCKER

### E-141 · 2026-11-25T02:17:53Z · FINDING · auditor: FRAMEWORK DRIFT

- ID: F-76
- Class: BLOCKER
- Where: `redteam/FINDINGS.md` line 111 (`R2-F-31`); `PROGRESS.md` line 44; `evidence/pr9-text.md` lines 10–12.
- Trigger: ``grep -E "^\| *R2-" redteam/FINDINGS.md | grep -vE "commit \`[0-9a-f]{7}\`" | cut -c1-12`` prints `| R2-F-31 |`. The row says "Fixed 2026-11-24 … No test: these are records." and names no commit. `grep -c "with a test"` over the `R2-*` rows prints 56. `PROGRESS.md` says "57 are repaired, each with…
- Violates: C2 ("repaired with its commit"); C7 (number does not equal the command's output).
- Raised by: AUDITOR, LAUNCH E-71, `audits/WU1-framework-drift-E-71.md`, finding 2
- Lens: framework drift
- Forward work stopped: yes — BLOCKER

### E-142 · 2026-11-25T02:17:53Z · FINDING · auditor: FRAMEWORK DRIFT

- ID: F-77
- Class: BLOCKER
- Where: `PROGRESS.md` line 44; `redteam/FINDINGS.md` line 107 (`R2-F-27`).
- Trigger: (a) `PROGRESS.md` says "the judge confirmed 9 major and 23 minor findings". Judge report line 28: "63 attempts confirmed, merged into 34 findings: 8 major, 24 minor, 2 notes." The 9 comes from the rule in the terms of E-60 (F-27 counts as major), not from the judge; the 2 notes are left out. (b) Th…
- Violates: C7; rule 14.6 for the row's class.
- Raised by: AUDITOR, LAUNCH E-71, `audits/WU1-framework-drift-E-71.md`, finding 3
- Lens: framework drift
- Forward work stopped: yes — BLOCKER

### E-143 · 2026-11-25T02:17:53Z · FINDING · auditor: FRAMEWORK DRIFT

- ID: F-78
- Class: BLOCKER
- Where: `vitest.config.ts` line 1.
- Trigger: `git diff 9e50434..183c166 -- vitest.config.ts vitest.e2e.config.ts | grep -E "^[-+].*(include|exclude)"` prints 2 lines: the `include` list gains `'scripts/test/**/*.test.mjs'`. C3 (e) says the command "prints nothing". The change adds tests and removes none.
- Violates: C3 (e).
- Raised by: AUDITOR, LAUNCH E-71, `audits/WU1-framework-drift-E-71.md`, finding 4
- Lens: framework drift
- Forward work stopped: yes — BLOCKER

### E-144 · 2026-11-25T02:17:53Z · FINDING · auditor: FRAMEWORK DRIFT

- ID: F-79
- Class: DEFECT
- Where: `FRAMEWORK.md` line 46; `DECISIONS.md` line 75 (D63); `docs/owner-instructions.md` lines 40–43.
- Trigger: `FRAMEWORK.md` 46 says "the run adds no decision record of the repository" and removes `DECISIONS.md` from the ownership table. WU-1 adds D63, a decision about this run, and my scope names `DECISIONS.md` as part of WU-1. So the file has no owner and no reviewer in the framework. Also: `sed -n 75p D…
- Violates: rule 14.6 (false statement in `FRAMEWORK.md`); C7 (status of a record row); the repository's hard rule 2 (approval recorded).
- Raised by: AUDITOR, LAUNCH E-71, `audits/WU1-framework-drift-E-71.md`, finding 5
- Lens: framework drift
- Forward work stopped: no

### E-145 · 2026-11-25T02:17:53Z · FINDING · auditor: FRAMEWORK DRIFT

- ID: F-80
- Class: DEFECT
- Where: `FRAMEWORK.md` lines 17, 52, 53, 55.
- Trigger: (a) Lines 52–53 split the work into WU-1 (`packages/kit` and its browser test) and WU-2 (the records), both "pending". My scope and E-64 define 1 WORK UNIT, WU-1, that holds the records too, and it is under audit, not pending. (b) Lines 52–53 name `memos/lens-recipient-experience-WU-1.md` and `memo…
- Violates: rule 14.6; the form rule in `FRAMEWORK.md` line 3 (a superseded line is marked and stays).
- Raised by: AUDITOR, LAUNCH E-71, `audits/WU1-framework-drift-E-71.md`, finding 6
- Lens: framework drift
- Forward work stopped: no

### E-146 · 2026-11-25T02:17:53Z · FINDING · auditor: FRAMEWORK DRIFT

- ID: F-81
- Class: DEFECT
- Where: `FRAMEWORK.md` sections 4 to 6 (lines 28–53); `CONNECTIONS.md` lines 8–48.
- Trigger: `git diff --stat 9e50434..183c166 -- . ':!hinshitsu'` lists 32 files. These parts of WU-1 appear in no contract, ownership row, node or edge: `.github/workflows/ci.yml`, `package.json`, `scripts/audit.mjs`, `scripts/test/audit.test.mjs`, `vitest.config.ts`, `apps/studio/e2e/studio.e2e.ts` (3 lines)…
- Violates: the scope's duty "parts of the work that the framework does not record"; rule 14.6.
- Raised by: AUDITOR, LAUNCH E-71, `audits/WU1-framework-drift-E-71.md`, finding 7
- Lens: framework drift
- Forward work stopped: no

### E-147 · 2026-11-25T02:17:53Z · FINDING · auditor: FRAMEWORK DRIFT

- ID: F-82
- Class: DEFECT
- Where: `FRAMEWORK.md` line 32; `CONNECTIONS.md` lines 16, 39, 42.
- Trigger: The framework says `index.ts` provides "the page checks" and draws the edge page-checks → `index.ts` ("an exported check is absent or renamed"). `grep -n "^export" packages/kit/src/index.ts` shows 13 exports, none from `page-checks/`; lines 1–2 of the file say the page checks "are imported from the…
- Violates: rule 14.6.
- Raised by: AUDITOR, LAUNCH E-71, `audits/WU1-framework-drift-E-71.md`, finding 8
- Lens: framework drift
- Forward work stopped: no

### E-148 · 2026-11-25T02:17:53Z · FINDING · auditor: FRAMEWORK DRIFT

- ID: F-83
- Class: DEFECT
- Where: `FRAMEWORK.md` line 52 ("1 commit per repair with its test").
- Trigger: The loop in `commands-and-outputs.md` (commits of `9e50434..183c166` that change `packages/kit/src/` and neither `kit.e2e.ts` nor `packages/kit/test/`) prints 6 of 104 commits: `786f1f7`, `06795d2`, `fe756aa`, `cb8d768`, `d3e409e`, `37b7c53`. 5 of them are repairs after the automated review. I did …
- Violates: `FRAMEWORK.md` section 6 as written; C3 touches the same point for repairs under C1 (not my duty; UNVERIFIED by me).
- Raised by: AUDITOR, LAUNCH E-71, `audits/WU1-framework-drift-E-71.md`, finding 9
- Lens: framework drift
- Forward work stopped: no

### E-149 · 2026-11-25T02:17:53Z · FINDING · auditor: LANGUAGE

- ID: F-84
- Class: BLOCKER
- Where: `PROGRESS.md`, line 44: "the judge confirmed 9 major and 23 minor findings, no blocker".
- Trigger: `sed -n '28p' hinshitsu/kit-repairs/evidence/second-review/judge-report.md` prints "63 attempts confirmed, merged into 34 findings: 8 major, 24 minor, 2 notes. No blocker." The bullet gives 9 and 23, leaves out the 2 notes, and its sum is 32, while the next sentences and the text of pull request 9 …
- Violates: C7 (a number that describes the kit in `PROGRESS.md` differs from what a command prints). Adams: conflict between 2 statements.
- Raised by: AUDITOR, LAUNCH E-72, `audits/WU1-language-E-72.md`, finding 1
- Lens: contract language
- Forward work stopped: yes — BLOCKER

### E-150 · 2026-11-25T02:17:53Z · FINDING · auditor: LANGUAGE

- ID: F-85
- Class: BLOCKER
- Where: `hinshitsu/kit-repairs/evidence/pr9-text.md`, lines 10 and 12 (column "Repaired, each with a test", value 34 for `R2-F-*`); `PROGRESS.md`, line 44: "57 are repaired, each with a test".
- Trigger: `grep 'R2-' redteam/FINDINGS.md | grep -c 'with a test'` prints 56; `grep 'R2-' redteam/FINDINGS.md | grep -c 'No test'` prints 1. Row R2-F-31 (line 111) says: "No test: these are records." So 33 of the judge's rows have a test, not 34, and 56 of all rows, not 57.
- Violates: C7; C15(b) (the list a reader draws from the text of the pull request does not equal `redteam/FINDINGS.md`). Adams: conflict between 2 statements.
- Raised by: AUDITOR, LAUNCH E-72, `audits/WU1-language-E-72.md`, finding 2
- Lens: contract language
- Forward work stopped: yes — BLOCKER

### E-151 · 2026-11-25T02:17:54Z · FINDING · auditor: LANGUAGE

- ID: F-86
- Class: BLOCKER
- Where: `redteam/FINDINGS.md`, line 111, row R2-F-31, cell "Status": "Fixed 2026-11-24: the three bullets of `PROGRESS.md` are marked as history …".
- Trigger: ``grep 'R2-' redteam/FINDINGS.md | grep -v 'commit `' | cut -c1-12`` prints `| R2-F-31 |`. It is the 1 row of the 57 repaired rows that names no commit. C2 asks each row to state "repaired with its commit". The file's own head (line 9) defines "Fixed" as "the cell names the commit", and gives anoth…
- Violates: C2, by its statement. The test that C2 names (0 rows missing) does not catch this; the ORCHESTRATOR rules whether the statement or the test governs. Adams: inconsistency (the word "Fixed" used against its definition).
- Raised by: AUDITOR, LAUNCH E-72, `audits/WU1-language-E-72.md`, finding 3
- Lens: contract language
- Forward work stopped: yes — BLOCKER

### E-152 · 2026-11-25T02:17:54Z · FINDING · auditor: LANGUAGE

- ID: F-87
- Class: DEFECT
- Where: `redteam/FINDINGS.md`, line 107, row R2-F-27, cell "Severity": "minor"; cell "Status": "commit `1115cfd` and `7a345e2`".
- Trigger: The Terms of E-60 say: "F-27 of the judge report is major by this rule, so the list holds 9 majors". The judge report, record F-27, says at `86287c2`: "I would rate that major at `86287c2`". The row says "minor" with no note. `grep 'R2-' redteam/FINDINGS.md | awk -F'|' '{print $5}' | sort | uniq -c…
- Violates: The Terms of E-60 ("Confirmed list"); C7 (a status differs from the record). Whether C3 fails on the 2 commits belongs to the adversarial AUDITOR; I did not test it.
- Raised by: AUDITOR, LAUNCH E-72, `audits/WU1-language-E-72.md`, finding 4
- Lens: contract language
- Forward work stopped: no

### E-153 · 2026-11-25T02:17:54Z · FINDING · auditor: LANGUAGE

- ID: F-88
- Class: DEFECT
- Where: `DECISIONS.md`, line 75, row D63: "so the minors are repaired and not left open".
- Trigger: `grep 'R2-' redteam/FINDINGS.md | grep -c '| Open'` prints 4. Rows R2-AR-15 to R2-AR-18 are minors and are "Open, not repaired". The text of pull request 9 (line 16) and `PROGRESS.md` (line 44) say the same 4 are open.
- Violates: Adams: conflict between 2 statements; undue generality ("the minors"). GLOSSARY, DEFECT: a false statement in a part of the DELIVERABLE.
- Raised by: AUDITOR, LAUNCH E-72, `audits/WU1-language-E-72.md`, finding 5
- Lens: contract language
- Forward work stopped: no

### E-154 · 2026-11-25T02:17:54Z · FINDING · auditor: LANGUAGE

- ID: F-89
- Class: DEFECT
- Where: `DECISIONS.md`, line 75, row D63: "approves starting M5 to M7 while M4 stays open. This changes the milestone order (hard rules 1 and 2)."
- Trigger: Read D63 beside D62 (line 74: "Hard rule 1 stays: a milestone starts only when the exit test of the one before it passes") and beside hard rule 1 of `CLAUDE.md` ("Do not start the next milestone until the current exit test passes"). D63 lets M5 start while the exit test of M4 is open. It does not s…
- Violates: Adams: conflict between 2 statements; lexical ambiguity. `CLAUDE.md`, hard rule 2 (a change to the milestone order is recorded in `DECISIONS.md`): the record does not say what the rule now is.
- Raised by: AUDITOR, LAUNCH E-72, `audits/WU1-language-E-72.md`, finding 6
- Lens: contract language
- Forward work stopped: no

### E-155 · 2026-11-25T02:17:54Z · FINDING · auditor: LANGUAGE

- ID: F-90
- Class: DEFECT
- Where: `hinshitsu/kit-repairs/evidence/pr9-text.md`, line 13 ("The independent review from zero of the lines changed after that review") against line 29 ("No independent reviewer has yet checked the repairs made after the second review"); the same 2 statements in `PROGRESS.md`, line 44.
- Trigger: Read the 2 lines one after the other. "After the second review" names 2 different spans: (a) the lines changed between the commit the second review saw (`83eced7`) and `86287c2`, which an independent session did review; (b) the repairs of the 61 rows, made after that session, which nobody independe…
- Violates: Adams: lexical ambiguity (1 phrase for 2 things); it reads as a conflict between 2 statements. C15(b) rests on the text of the pull request alone.
- Raised by: AUDITOR, LAUNCH E-72, `audits/WU1-language-E-72.md`, finding 7
- Lens: contract language
- Forward work stopped: no

### E-156 · 2026-11-25T02:17:54Z · FINDING · auditor: LANGUAGE

- ID: F-91
- Class: DEFECT
- Where: `redteam/FINDINGS.md`, lines 81-123, cell "Finding" of 42 rows (R2-F-1 to R2-F-30, R2-F-32 to R2-F-34, R2-C14-1 to R2-C14-9).
- Trigger: `grep 'R2-' redteam/FINDINGS.md | grep -c 'The fault is described in the report named in the next column'` prints 42. The column is headed "Finding", and these 42 cells do not state the finding; they state the repair. 1 repair sentence serves several different faults: 5 rows share "the placeholder …
- Violates: `CLAUDE.md`, "Writing style for anything the owner reads" ("state what a thing is, why it exists, and what can go wrong with it"). Adams: vagueness; inconsistency. I cannot see the numbered rules of the skills, so I name no rule number.
- Raised by: AUDITOR, LAUNCH E-72, `audits/WU1-language-E-72.md`, finding 8
- Lens: contract language
- Forward work stopped: no

### E-157 · 2026-11-25T02:17:54Z · FINDING · auditor: LANGUAGE

- ID: F-92
- Class: DEFECT
- Where: `packages/kit/README.md`, added line 70: "or says what it does in its name ("Pause", "Pause the moving text", "Stop animation")".
- Trigger: `sed -n 49p packages/kit/src/page-checks/neuro.ts` shows a closed list: the name must be "pause", "play/pause" or "pause/play", or start with "pause", "stop", "turn off", "switch off", "disable" or "reduce" and, within 40 letters, hold 1 of 13 words ("motion", "movement", "moving", "animation", "sl…
- Violates: Adams: vagueness; a rule that a third party cannot test. The scope of this role.
- Raised by: AUDITOR, LAUNCH E-72, `audits/WU1-language-E-72.md`, finding 9
- Lens: contract language
- Forward work stopped: no

### E-158 · 2026-11-25T02:17:54Z · FINDING · auditor: LANGUAGE

- ID: F-93
- Class: FRAGILITY
- Where: `redteam/FINDINGS.md`, lines 124-141, cell "Evidence" of the 18 rows `R2-AR-*`: "The review's comments on pull request #9"; cell "Reviewer": "Automated review of commit `…`"; `pr9-text.md`, line 14.
- Trigger: Take row R2-AR-5 and look for its evidence. The cell gives no link, no comment number and no saved file, and pull request 9 holds the comments of 3 rounds. "Automated review" names no actor: the reader cannot tell which program reviewed. The 43 other rows cite a file in the repository with an ID. T…
- Violates: Adams: vagueness; a rule that a third party cannot test. GLOSSARY, EVIDENCE ("a file in the RUN FOLDER that a third party can open").
- Raised by: AUDITOR, LAUNCH E-72, `audits/WU1-language-E-72.md`, finding 10
- Lens: contract language
- Forward work stopped: no

### E-159 · 2026-11-25T02:17:54Z · FINDING · auditor: LANGUAGE

- ID: F-94
- Class: STYLE
- Where: `pr9-text.md`, lines 10-16 ("Repaired", "Open"); `PROGRESS.md`, line 44 ("repaired", "open with a reason"); `redteam/FINDINGS.md`, lines 81-141 ("Fixed", "Open, not repaired"), line 112 and line 107 ("commit `f2ef274` and `3ccf966`").
- Trigger: Read the table of the pull request, then the rows. 1 state has 2 names: "Repaired" in the pull request, `PROGRESS.md` and C2; "Fixed" in the rows and in the status words at the head of `FINDINGS.md`. The 4 open rows say "Open, not repaired", and the head defines "Open" as "not yet addressed"; these…
- Violates: Adams: inconsistency (1 thing with 2 names; 1 name for 2 things). `CLAUDE.md`: "One term per concept".
- Raised by: AUDITOR, LAUNCH E-72, `audits/WU1-language-E-72.md`, finding 11
- Lens: contract language
- Forward work stopped: no

### E-160 · 2026-11-25T02:17:54Z · FINDING · auditor: LANGUAGE

- ID: F-95
- Class: STYLE
- Where: `PROGRESS.md`, line 44: "The owner approved 16 acceptance tests and up to 40 helper sessions"; `DECISIONS.md`, line 75: "its 16 acceptance tests", "the 16 tests", "The exact wording of the 16 tests is entry E-60".
- Trigger: Read line 44 from its start. "Tests" means the 257 unit tests and the 420 browser tests in 1 sentence, and the 16 CRITERIA of E-60 a few sentences later. E-60 and the Hinshitsu record call the 16 "CRITERIA", and each CRITERION holds a "Test:" of its own. 1 name serves 3 things.
- Violates: Adams: inconsistency (1 name for 2 things). `CLAUDE.md`: "One term per concept".
- Raised by: AUDITOR, LAUNCH E-72, `audits/WU1-language-E-72.md`, finding 12
- Lens: contract language
- Forward work stopped: no

### E-161 · 2026-11-25T02:17:54Z · FINDING · auditor: LANGUAGE

- ID: F-96
- Class: STYLE
- Where: `pr9-text.md`, line 16: "(a click-taking `::before` under a click-through wrapper; an SVG animation that waits for a script; a field in a `dialog` opened with `showModal()` under an inert part; a sentence that holds "n't" before an empty list)".
- Trigger: Read the line as the owner, who is not a programmer (this scope; `VOC` O4). `::before`, "click-through wrapper", "SVG animation", `dialog`, `showModal()` and "inert part" are used with no meaning given. The same line is where the owner learns what stays open.
- Violates: `CLAUDE.md`, writing style: "explain each technical term at first use". The duty of this scope ("The owner is not a programmer").
- Raised by: AUDITOR, LAUNCH E-72, `audits/WU1-language-E-72.md`, finding 13
- Lens: contract language
- Forward work stopped: no

### E-162 · 2026-11-25T02:17:54Z · FINDING · auditor: LANGUAGE

- ID: F-97
- Class: STYLE
- Where: `pr9-text.md`, line 7: "a page can't be "Crafted" until a person has checked the three person-only floors".
- Trigger: Read it beside the README's added line 65: "A person's answer enters as a finding … The kit takes the person's word: it cannot tell whether anyone looked." The pull request says "has checked"; the kit can only know that an answer was entered. "Person-only floors" is a third name for what the README…
- Violates: Adams: vagueness; inconsistency (1 thing with 3 names).
- Raised by: AUDITOR, LAUNCH E-72, `audits/WU1-language-E-72.md`, finding 14
- Lens: contract language
- Forward work stopped: no

### E-163 · 2026-11-25T02:17:54Z · FINDING · auditor: LANGUAGE

- ID: F-98
- Class: STYLE
- Where: `packages/kit/README.md`, added line 76: "A record that cites no source the builder read (its judgment, this tool's plan, or a page it did not open) carries the grade "expert-opinion"; a unit test holds this." Added line 67: "the check then holds". Added line 65: "`status: 'holds'`".
- Trigger: Read line 76: "its judgment" can point to the record or to the builder (the builder is meant); "a page it did not open" has the same doubt. "Holds" has 3 senses in the added lines: a status value of a finding (line 65), "the check passes" (line 67), and "a unit test enforces this" (line 76).
- Violates: Adams: syntactic ambiguity (the antecedent of a pronoun); inconsistency (1 name for 3 things).
- Raised by: AUDITOR, LAUNCH E-72, `audits/WU1-language-E-72.md`, finding 15
- Lens: contract language
- Forward work stopped: no

### E-164 · 2026-11-25T02:17:54Z · FINDING · auditor: LANGUAGE

- ID: F-99
- Class: STYLE
- Where: `PROGRESS.md`, line 44: "Three earlier full runs were started on older commits and stopped by the builder before they ended, because new repairs followed; they count for nothing."
- Trigger: Read it beside C5: "Every run started is counted; a red run is a FINDING and no later run erases it." C5 speaks of the AUDITOR's runs at the audited commit and the bullet of the builder's runs on older commits, so the 2 do not conflict; a reader who knows C5 still meets "started … count for nothing…
- Violates: Adams: it reads as a conflict between 2 statements. `CLAUDE.md`, writing style: active voice.
- Raised by: AUDITOR, LAUNCH E-72, `audits/WU1-language-E-72.md`, finding 16
- Lens: contract language
- Forward work stopped: no

### E-165 · 2026-11-25T02:31:49Z · LAUNCH · orchestrator

- Role: AUDITOR, re-audit of the code (rule 16.5), WU-1
- Scope: `prompts/WU1-reaudit-code.md`
- Commit under review: 78bf3149ba8952c478a7f0b9318d376dd42227d8
- SUB-AGENT identifier: 92b0b26d37c6462681df4ea4417ce545 https://app.devin.ai/sessions/92b0b26d37c6462681df4ea4417ce545
- Report: `audits/WU1-reaudit-code-E-165.md`

22 of 40 SUB-AGENT runs used. First fix-and-re-audit round of WU-1 (rule 14.5).

### E-166 · 2026-11-25T02:31:49Z · LAUNCH · orchestrator

- Role: AUDITOR, re-audit of the records (rule 16.5), WU-1
- Scope: `prompts/WU1-reaudit-records.md`
- Commit under review: 78bf3149ba8952c478a7f0b9318d376dd42227d8
- SUB-AGENT identifier: 2d1056731c9b42158c6caeb850d329af https://app.devin.ai/sessions/2d1056731c9b42158c6caeb850d329af
- Report: `audits/WU1-reaudit-records-E-166.md`

23 of 40 SUB-AGENT runs used. First fix-and-re-audit round of WU-1 (rule 14.5).

### E-167 · 2026-11-25T02:50:13Z · FINDING · auditor: RE-AUDIT RECORDS

- ID: F-100
- Class: BLOCKER
- Where: `PROGRESS.md`, part "Waiting on the owner"
- Trigger: The part lists none of the 2 questions this run puts to the USER (C3(e); KIT-46). The complete trigger is in the report.
- Violates: C7
- Raised by: AUDITOR, LAUNCH E-166, `audits/WU1-reaudit-records-E-166.md`, new finding 1
- Lens: framework drift and contract language
- Forward work stopped: yes

### E-168 · 2026-11-25T02:50:13Z · FINDING · auditor: RE-AUDIT RECORDS

- ID: F-101
- Class: BLOCKER
- Where: `PROGRESS.md` line 44
- Trigger: "20 of them rated blocker"; the rows and the log entries F-8 to F-99 count 21. The complete trigger is in the report.
- Violates: C7
- Raised by: AUDITOR, LAUNCH E-166, `audits/WU1-reaudit-records-E-166.md`, new finding 2
- Lens: framework drift and contract language
- Forward work stopped: yes

### E-169 · 2026-11-25T02:50:13Z · FINDING · auditor: RE-AUDIT RECORDS

- ID: F-102
- Class: BLOCKER
- Where: `redteam/FINDINGS.md`, rows R2-F-2, R2-F-4, R2-F-8, R2-F-27, R2-C14-4, and the sentence "No independent reviewer has checked this repair yet." in 62 rows
- Trigger: The 5 rows name neither the auditor's result nor the later commit; the sentence is untrue after the audit at `183c166`. The complete trigger is in the report.
- Violates: C7; C15 (b)
- Raised by: AUDITOR, LAUNCH E-166, `audits/WU1-reaudit-records-E-166.md`, new finding 3
- Lens: framework drift and contract language
- Forward work stopped: yes

### E-170 · 2026-11-25T02:50:13Z · FINDING · auditor: RE-AUDIT RECORDS

- ID: F-103
- Class: DEFECT
- Where: `redteam/FINDINGS.md`, rows R2-F-31 and R2-P-12
- Trigger: Both say "Fixed" with no test; the head of the file defines "Corrected" for a rewritten statement. The complete trigger is in the report.
- Violates: the status words of the file
- Raised by: AUDITOR, LAUNCH E-166, `audits/WU1-reaudit-records-E-166.md`, new finding 4
- Lens: framework drift and contract language
- Forward work stopped: no

### E-171 · 2026-11-25T02:50:13Z · FINDING · auditor: RE-AUDIT RECORDS

- ID: F-104
- Class: DEFECT
- Where: `redteam/FINDINGS.md`, cell "Evidence" of rows R2-AR-1 to R2-AR-21
- Trigger: "not on GitHub": GitHub holds a summary of the newest round; no text of a round is saved in the repository. The complete trigger is in the report.
- Violates: EVIDENCE (glossary); F-93
- Raised by: AUDITOR, LAUNCH E-166, `audits/WU1-reaudit-records-E-166.md`, new finding 5
- Lens: framework drift and contract language
- Forward work stopped: no

### E-172 · 2026-11-25T02:50:13Z · FINDING · auditor: RE-AUDIT RECORDS

- ID: F-105
- Class: STYLE
- Where: `evidence/pr9-text.md` against the live pull request text
- Trigger: The platform appends 11 lines that the file does not hold. The complete trigger is in the report.
- Violates: the scope of the re-audit
- Raised by: AUDITOR, LAUNCH E-166, `audits/WU1-reaudit-records-E-166.md`, new finding 6
- Lens: framework drift and contract language
- Forward work stopped: no

### E-173 · 2026-11-25T02:50:13Z · FINDING · auditor: RE-AUDIT RECORDS

- ID: F-106
- Class: DEFECT
- Where: `FRAMEWORK.md`, the line "Order" and 6 marks
- Trigger: The line still names WU-2; the marks carry the date 2026-11-24 and point at a LAUNCH entry. The complete trigger is in the report.
- Violates: the form rule of `FRAMEWORK.md`
- Raised by: AUDITOR, LAUNCH E-166, `audits/WU1-reaudit-records-E-166.md`, new finding 7
- Lens: framework drift and contract language
- Forward work stopped: no

### E-174 · 2026-11-25T02:50:13Z · FINDING · auditor: RE-AUDIT RECORDS

- ID: F-107
- Class: DEFECT
- Where: `AUDIT-LOG.md`; `SESSION-STATE.md`
- Trigger: No CARD entry records the question on C3(e); `SESSION-STATE.md` is of E-38. The complete trigger is in the report.
- Violates: DEFECT (glossary)
- Raised by: AUDITOR, LAUNCH E-166, `audits/WU1-reaudit-records-E-166.md`, new finding 8
- Lens: framework drift and contract language
- Forward work stopped: no

### E-175 · 2026-11-25T03:34:21Z · FINDING · auditor: RE-AUDIT CODE

- ID: F-108
- Class: DEFECT
- Where: `packages/kit/src/page-checks/behavior.ts`, function `lent` (entered with `5fd8c60`)
- Trigger: A hidden target of `aria-labelledby` that holds only a style sheet or a script names the button: `controlsHaveNames` holds. The complete trigger is in the report.
- Violates: the rule of the check; C1 in spirit
- Raised by: AUDITOR, LAUNCH E-165, `audits/WU1-reaudit-code-E-165.md`, new finding 1
- Lens: correctness and adversarial
- Forward work stopped: no

### E-176 · 2026-11-25T03:34:21Z · FINDING · auditor: RE-AUDIT CODE

- ID: F-109
- Class: DEFECT
- Where: `packages/kit/src/page-checks/neuro.ts`, `noEndlessMotion`, the part on `::placeholder`
- Trigger: A placeholder animation that names no keyframes, or whose keyframes all say the same, fails as endless movement. The complete trigger is in the report.
- Violates: the result that F-31 asked for
- Raised by: AUDITOR, LAUNCH E-165, `audits/WU1-reaudit-code-E-165.md`, new finding 2
- Lens: correctness and adversarial
- Forward work stopped: no

### E-177 · 2026-11-25T03:34:21Z · FINDING · auditor: RE-AUDIT CODE

- ID: F-110
- Class: DEFECT
- Where: `packages/kit/src/logic/designId.ts`, `asText` and its comment
- Trigger: Different values that hold a big integer or hold themselves get one ID. The complete trigger is in the report.
- Violates: the function's own statement
- Raised by: AUDITOR, LAUNCH E-165, `audits/WU1-reaudit-code-E-165.md`, new finding 3
- Lens: correctness and adversarial
- Forward work stopped: no

### E-178 · 2026-11-25T03:34:21Z · FINDING · auditor: RE-AUDIT CODE

- ID: F-111
- Class: DEFECT
- Where: `packages/kit/src/data/placeholders.ts`, `placeholderIn`
- Trigger: One telephone number of another country switches off the check of the made-up number for the whole text. The complete trigger is in the report.
- Violates: the rule of the check
- Raised by: AUDITOR, LAUNCH E-165, `audits/WU1-reaudit-code-E-165.md`, new finding 4
- Lens: correctness and adversarial
- Forward work stopped: no

### E-179 · 2026-11-25T03:40:46Z · LAUNCH · orchestrator

- Role: AUDITOR, second re-audit (rule 16.5, round 2 of 2), WU-1
- Scope: `prompts/WU1-reaudit-round2.md`
- Commit under review: 9c652a9520066125be6cff82011a5cb0ad1b33f4
- SUB-AGENT identifier: 1d5d7c137fe34b5e99aaa1f9cd32f052 https://app.devin.ai/sessions/1d5d7c137fe34b5e99aaa1f9cd32f052
- Report: `audits/WU1-reaudit-round2.md`

24 of 40 SUB-AGENT runs used. Second and last fix-and-re-audit round of WU-1 (rule 14.5).

### E-180 · 2026-11-25T04:01:06Z · FINDING · auditor: RE-AUDIT ROUND 2

- ID: F-112
- Class: DEFECT
- Where: `packages/kit/src/page-checks/neuro.ts`, function `changes` (commit `1617e2e`)
- Trigger: A placeholder whose keyframes carry a name that CSS escapes, or sit in a sheet brought in by @import, moves without end and holds. The complete trigger is in the report.
- Violates: as the report states (C1 by a 2nd input, or C7)
- Raised by: AUDITOR, LAUNCH E-179, `audits/WU1-reaudit-round2.md`, finding 1
- Lens: re-audit
- Forward work stopped: no

### E-181 · 2026-11-25T04:01:06Z · FINDING · auditor: RE-AUDIT ROUND 2

- ID: F-113
- Class: DEFECT
- Where: `packages/kit/src/page-checks/neuro.ts`, function `changes`
- Trigger: A placeholder that moves nothing is blamed where one keyframe says the value at rest, where two rules share a name, and where the keyframes sit in a block for print. The complete trigger is in the report.
- Violates: as the report states (C1 by a 2nd input, or C7)
- Raised by: AUDITOR, LAUNCH E-179, `audits/WU1-reaudit-round2.md`, finding 2
- Lens: re-audit
- Forward work stopped: no

### E-182 · 2026-11-25T04:01:06Z · FINDING · auditor: RE-AUDIT ROUND 2

- ID: F-114
- Class: FRAGILITY
- Where: `packages/kit/src/page-checks/neuro.ts`, `visibleLabels`
- Trigger: A field with `visibility: collapse` is blamed. The complete trigger is in the report.
- Violates: as the report states (C1 by a 2nd input, or C7)
- Raised by: AUDITOR, LAUNCH E-179, `audits/WU1-reaudit-round2.md`, finding 3
- Lens: re-audit
- Forward work stopped: no

### E-183 · 2026-11-25T04:01:06Z · FINDING · auditor: RE-AUDIT ROUND 2

- ID: F-115
- Class: DEFECT
- Where: `packages/kit/src/logic/designId.ts`
- Trigger: A big integer and the text of its digits with n share an ID; the comment is not exact. The complete trigger is in the report.
- Violates: as the report states (C1 by a 2nd input, or C7)
- Raised by: AUDITOR, LAUNCH E-179, `audits/WU1-reaudit-round2.md`, finding 4
- Lens: re-audit
- Forward work stopped: no

### E-184 · 2026-11-25T04:01:06Z · FINDING · auditor: RE-AUDIT ROUND 2

- ID: F-116
- Class: DEFECT
- Where: `PROGRESS.md`, `evidence/pr9-text.md`, 7 rows of `redteam/FINDINGS.md`
- Trigger: Sentences still say that nobody has checked repairs that the first re-audit checked. The complete trigger is in the report.
- Violates: as the report states (C1 by a 2nd input, or C7)
- Raised by: AUDITOR, LAUNCH E-179, `audits/WU1-reaudit-round2.md`, finding 5
- Lens: re-audit
- Forward work stopped: no

### E-185 · 2026-11-25T04:01:06Z · FINDING · auditor: RE-AUDIT ROUND 2

- ID: F-117
- Class: DEFECT
- Where: `packages/kit/src/data/placeholders.ts`
- Trigger: A made-up number that follows any group of 4 digits is missed. The complete trigger is in the report.
- Violates: as the report states (C1 by a 2nd input, or C7)
- Raised by: AUDITOR, LAUNCH E-179, `audits/WU1-reaudit-round2.md`, finding 6
- Lens: re-audit
- Forward work stopped: no

### E-186 · 2026-11-25T04:01:06Z · FINDING · auditor: RE-AUDIT ROUND 2

- ID: F-118
- Class: DEFECT
- Where: `packages/kit/README.md`, line 80
- Trigger: The README says the text-spacing check fails the waiting slides; with slides wholly beside the box it holds. The complete trigger is in the report.
- Violates: as the report states (C1 by a 2nd input, or C7)
- Raised by: AUDITOR, LAUNCH E-179, `audits/WU1-reaudit-round2.md`, finding 7
- Lens: re-audit
- Forward work stopped: no

### E-187 · 2026-11-25T04:01:06Z · FINDING · auditor: RE-AUDIT ROUND 2

- ID: F-119
- Class: STYLE
- Where: pull request 9, description
- Trigger: The live text was not the text of `evidence/pr9-text.md` at the time of reading. The complete trigger is in the report.
- Violates: as the report states (C1 by a 2nd input, or C7)
- Raised by: AUDITOR, LAUNCH E-179, `audits/WU1-reaudit-round2.md`, finding 8
- Lens: re-audit
- Forward work stopped: no

### E-188 · 2026-11-25T04:07:00Z · LAUNCH · orchestrator

- Role: AUDITOR, check of the repairs that followed the second re-audit, WU-1
- Scope: the prompt of the session, saved in `prompts/WU1-audit-after-round2.md`
- Commit under review: fae1b7830080e8dd4bb1d071a0c659856969e432
- SUB-AGENT identifier: 3f245d962bf94040a190bae7818930cd https://app.devin.ai/sessions/3f245d962bf94040a190bae7818930cd
- Report: `audits/WU1-audit-after-round2.md`

25 of 40 SUB-AGENT runs used. Rule 14.5 allows 2 fix-and-re-audit rounds; the second found 0 BLOCKER and 8 smaller faults. By E-57 the USER ordered the repair of every finding, so the ORCHESTRATOR repaired them and has this AUDITOR check those repairs; the USER is told.
