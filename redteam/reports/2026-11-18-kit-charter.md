# Charter: review of the North Star kit (KIT review)

Written 2026-11-18 by the lead, before any reviewer ran. The owner asked for this review on 2026-11-18 ("Please conduct a full review.", decision D58).

**A conflict the owner must know.** The lead wrote the code under review. In the method's words, the lead is "Blue". Each reviewer receives only its role, the things to probe, the rules of engagement, and the report format: no statement of where the lead thinks the work is sound. A separate judge, who does not attack, reproduces each claimed result before it counts. The lead never judges.

## 1. Exam question

Does `packages/kit` (and the Studio repair for ISO-15) do what `packages/kit/README.md`, `PROGRESS.md` (section "The North Star kit"), decision D58, and pull request #6 say it does, do only that, and describe itself truthfully; does each page check find the fault its rule record names and stay silent where the fault is absent; can a page, a set of tokens, a Brief, or a set of findings make the kit report a wrong result, hide a failure, or do harm on the machine that runs it; and does each rule record say what its cited source says?

## 2. Target pin

- Repository `CatCorner22/Devin_Frontend`, branch `devin/1794999329-north-star-kit`, pull request #6, at the commit that adds this charter. Base of the work: commit `38c453a` (the head of pull request #5).
- Changed: `packages/kit/**` (new), `apps/studio/e2e/kit.e2e.ts` (new), `apps/studio/src/store.ts` (the ISO-15 repair), `package.json`, `package-lock.json`, `.dependency-cruiser.cjs`, `CLAUDE.md`, `PROGRESS.md`, `DECISIONS.md`, `docs/owner-instructions.md`, `redteam/FINDINGS.md`.
- Browser: whatever Chromium each reviewer's machine holds; each reviewer reports its path and version. Playwright 1.65.0 expects revision 1254.

## 3. Reviewers (one lane each, hard rule 12)

| Lane | Role | What it probes |
|---|---|---|
| SEC | Security attacker | Hostile pages, tokens, Briefs, and findings fed to the kit: code execution, network access, hangs, one rule's result changed through another, a failed or unmeasured floor that ends in a pass, the design ID, the self-containment tests; the ISO-15 change in `store.ts` |
| USR | Confused first-time user | Follows `packages/kit/README.md` literally on a fresh machine; writes ordinary pages a real person would write and looks for checks that miss an obvious fault or blame a sound page; reads every rule, question, fix sentence, and receipt cold for undefined terms and false promises |
| TRU | Drift and truth auditor | Every number and sentence in the new text; each rule record against the text of its cited source; each claim of "read"; the planted-defect test (does each planted defect really prove its check?); hard rules 1, 2, 3, 5, 7, 8, 11, 12, 13 and the verification rules; whether the ISO-15 repair changes any other behavior |

Each reviewer runs in its own session on its own machine and may run any test or experiment locally. No reviewer pushes, commits, or writes to the pull request. No reviewer sees another reviewer's work. Budget per reviewer: 2 hours of wall-clock time. One round.

## 4. Judge

A fourth session receives the reviewers' attempts stripped to `{id, input, observed, repro_steps}`: no lane names, no reviewer prose, no `claimed_success`. It reproduces each attempt on the pinned commit and classifies it: confirmed, observed once, not a finding, or out of scope (collateral). Severity follows `redteam/FINDINGS.md`: blocker, major, minor, note.

## 5. Finding definition

A finding is a reproduced behavior or a quoted statement that: (a) makes a page check miss a fault its rule names on a page a careful person would call faulty in that way, or report a fault on a page that plainly lacks it; (b) makes `grade`, `repairPlan`, `receipt`, `designId`, `comparePixels`, `checkBrief`, `preferences`, or `blindScore` return a result that contradicts its own documentation, or lets a failed or unmeasured floor end in a pass; (c) lets content of a page, of tokens, or of a Brief run code, reach the network, write outside the page under test, hang the checker, or change what the checker reports about another rule; (d) is a factual statement in the new text (README, PROGRESS, DECISIONS, FINDINGS, the pull request, a rule record, a code comment) that cannot be reproduced, that contradicts another statement in the repository, or that misstates its cited source; (e) breaks a rule in `CLAUDE.md`. "I would have written it differently" is not a finding.

## 6. What happens with the findings

Every confirmed finding gets a row in `redteam/FINDINGS.md`. The lead repairs blockers and majors inside this unit of work. Observed-once and collateral items are logged as notes. Nothing is deleted or downgraded without a judge entry giving the reason. The owner reads the log; the owner owns the remaining risk.
