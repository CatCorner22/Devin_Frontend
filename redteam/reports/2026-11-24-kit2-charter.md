# Charter: second review of the North Star kit (KIT2 review: the repairs)

Written 2026-11-24 by the lead, before any reviewer ran. The owner delegated this review on 2026-11-18 (decision D59) and asked the builder to audit its code as it works on 2026-11-24 (D62).

**A conflict the owner must know.** The lead wrote the repairs under review. Each reviewer receives only its role, the things to probe, the rules of engagement, and the report format: no statement of where the lead thinks the work is sound. A separate judge, who does not attack, reproduces each claimed result before it counts. The lead never judges.

## 1. Exam question

Do the repairs made to `packages/kit` since the first kit review (commit `2466cbb`) do what `redteam/FINDINGS.md` (rows KIT-02 to KIT-48), `PROGRESS.md` (sections on the kit), decisions D59 to D62, and pull request #9 say they do; does each repaired page check now find the fault its finding named and stay silent on a sound page, without a new miss or a new false blame; can a page, a set of tokens, a Brief, or a set of findings still make the kit report a wrong result, hide a failure, or do harm on the machine that runs it; and is every sentence written about the repairs true?

## 2. Target pin

- Repository `CatCorner22/Devin_Frontend`, branch `devin/1795542703-kit-minors`, pull request #9, at the commit that adds this charter. Base of the work: commit `2466cbb` (the pin of the first kit review). Pull request #6, merged by the owner, holds the first part of the repairs; pull request #9 holds the rest.
- Changed since the base: `packages/kit/**`, `apps/studio/e2e/kit.e2e.ts`, `apps/studio/e2e/studio.e2e.ts`, `scripts/audit.mjs`, `docs/research/11-north-star-gap-2026-11-24.md`, and the records (`PROGRESS.md`, `DECISIONS.md`, `docs/owner-instructions.md`, `redteam/FINDINGS.md`, `redteam/reports/2026-11-18-kit-*`).
- Browser: whatever Chromium each reviewer's machine holds; each reviewer reports its path and version. Playwright 1.65.0 expects revision 1254.

## 3. Reviewers (one lane each, hard rule 12)

| Lane | Role | What it probes |
|---|---|---|
| SEC | Security attacker | The repairs of the hostile-input findings (text from the page in the receipt and the repair plan, unseen frames and web components, crashed or unmeasured floors, the runtime limits, the 64-bit design ID, the Brief check, `scripts/audit.mjs`); any path that remains from a failed or unmeasured floor to a pass |
| USR | Confused first-time user | Follows `packages/kit/README.md` and `blind-test/PROTOCOL.md` literally on a fresh machine; writes ordinary pages a real person would write and looks for repaired checks that still miss an obvious fault or blame a sound page; reads every changed rule, fix sentence, validation message, and receipt cold |
| TRU | Drift and truth auditor | Every status in `redteam/FINDINGS.md` rows KIT-02 to KIT-48 against the code and the tests (is it repaired, does the named test exist, does the test fail without the repair?); every number in `PROGRESS.md` and pull request #9; the research record's claims against its sources; D59 to D62 against the owner's words; hard rules 1, 2, 3, 5, 7, 8, 11, 12, 13 and the verification rules |

Each reviewer runs in its own session on its own machine and may run any test or experiment locally. No reviewer pushes, commits, or writes to the pull request. No reviewer sees another reviewer's work. Budget per reviewer: 2 hours of wall-clock time. One round.

## 4. Judge

A fourth session receives the reviewers' attempts stripped to `{id, input, observed, repro_steps}`: no lane names, no reviewer prose, no `claimed_success`. It reproduces each attempt on the pinned commit and classifies it: confirmed, observed once, not a finding, or out of scope (collateral). Severity follows `redteam/FINDINGS.md`: blocker, major, minor, note.

## 5. Finding definition

A finding is a reproduced behavior or a quoted statement that: (a) makes a page check miss a fault its rule names on a page a careful person would call faulty in that way, or report a fault on a page that plainly lacks it; (b) makes `grade`, `repairPlan`, `receipt`, `designId`, `comparePixels`, `checkBrief`, `preferences`, or `blindScore` return a result that contradicts its own documentation, or lets a failed or unmeasured floor end in a pass; (c) lets content of a page, of tokens, or of a Brief run code, reach the network, write outside the page under test, hang the checker, or change what the checker reports about another rule; (d) is a factual statement in the new text (README, PROGRESS, DECISIONS, FINDINGS, the pull request, a rule record, a code comment) that cannot be reproduced, that contradicts another statement in the repository, or that misstates its cited source; (e) breaks a rule in `CLAUDE.md`. "I would have written it differently" is not a finding. A finding already logged as open in `redteam/FINDINGS.md`, with its limit stated truthfully there, is not a new finding; a row that says "fixed" for a fault that still reproduces is one.

## 6. What happens with the findings

Every confirmed finding gets a row in `redteam/FINDINGS.md`. The lead repairs blockers and majors inside this unit of work. Observed-once and collateral items are logged as notes. Nothing is deleted or downgraded without a judge entry giving the reason. The owner reads the log; the owner owns the remaining risk.
