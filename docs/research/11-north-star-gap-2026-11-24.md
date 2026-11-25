# What still separates the output from the best human work (2026-11-24)

The owner asked on 2026-11-24 for research that moves the tool closer to the North Star: built pages that people cannot tell from the work of the best human coders. This record adds only what records 04, 05, and 08 do not already hold. It ranks what to do next.

## How the sources were read

| Mark | Meaning |
|---|---|
| [R] | The builder opened the page and read the part cited. |
| [S] | The builder saw only a search summary. Treat the claim as a lead, not a fact. |

No source here was read end to end. No claim here was tested by the builder. Nothing in this record is a rule yet: hard rule 5 requires a Catalog record with a source, an evidence grade, and a review date before any of it reaches a Prescription.

## Finding 1. People, in blind pairs, are the only accepted measure

- UI-Bench (Jung, Garcinuno, Mateega; arXiv 2508.20410) ranks 10 text-to-app tools on 300 generated sites with more than 4,000 judgments. Expert designers see two sites, blind, and choose one. The authors reject automatic picture scores as the main measure, because such scores can rank against human preference. They cite earlier work that found only moderate agreement between raters of visual quality. [R: abstract and sections 1 and 2]
- DesignArena ranks models from pairwise votes with a Bradley-Terry rating. [S]
- Design2Code (NAACL 2025) asked 5 paid annotators per question and took the majority. [S]

**What this means here.** The kit's blind test asks "which page did a program make?" The field instead asks "which of these two is better?" The second question needs fewer answers for a stable result and measures the thing the North Star names. The kit already holds Duels for one design decision; the same pairwise form fits the exit test.

**Proposed change (needs the owner's approval, M8).** Add a pairwise arm to `packages/kit/blind-test/PROTOCOL.md`: each reviewer sees one of the tool's pages beside one human-made page for the same kind of business, blind, in random left-right order, and picks the better one. The target is a preference share whose range includes 50%. Keep the present "which is machine-made" question as a second arm.

## Finding 2. The published lists of machine-made signs are longer than the kit's

The kit warns on five signs: placeholder copy, emoji icons, purple gradients, universal centering, identical cards.

- Adrian Krebs scored 1,590 Show HN pages against 16 signs with fixed page checks in a headless browser: 22% showed four or more, 46% showed one or none. He estimates 5 to 10% false alarms and says one sign alone proves nothing. [S; two independent summaries agree on the numbers. Record 04 notes that his README and his post disagree on the tier boundary.]
- Impeccable (Paul Bakaus, Apache-2.0) ships detector rules that run with no model. [R: README. The rule list itself was not read, so this record gives no count: an earlier version said 59, and one reviewer read 62.]

Signs that those lists name and the kit does not check:

| Sign | Could a page check measure it? |
|---|---|
| A pill badge above a centered headline | Yes: a small rounded element directly before the `h1` |
| A colored border on only the top or left edge of a card | Yes |
| A row of large statistics ("500+ customers") | Partly: the layout yes, whether the numbers are true no |
| One neutral typeface for everything | Yes; `tokenFit` covers it when the Prescription names a typeface |
| Frosted-glass panels and colored glows | Yes: `backdrop-filter`, and a `box-shadow` with a saturated color and a large blur |
| Dark page with mid-gray body text | Yes: the contrast floor already measures it |
| All-capitals section labels above every heading | Yes |
| Numbered "1, 2, 3" step rows | Partly |
| A card inside a card | Yes |
| Bounce easing | Yes, from the timing function |
| Copy that fits any business ("Your all-in-one solution") | No. The Brief check covers the owner's own words; a person must judge the rest |
| No brand: default favicon, "My App" title | Yes |

**Caution.** Every one of these is a practitioner's opinion. A human designer may choose any of them on purpose. They belong at the level "warning", as the five present signs do, and only a count of several together is meaningful.

**Proposed change (M5, inside the craft layer).** Add about ten warning records with page checks, each with a planted defect and a sound page that must not be blamed. Report the count, not each sign, in the grade's reason.

## Finding 3. Looking at the rendered page, one repair at a time, is what improves machine output

- WebGen-Agent (arXiv 2509.22644): feeding the agent a description of its own screenshot, plus the result of an agent that clicks through the page, raised task accuracy for one model from 26.4% to 51.9% and its appearance score from 3.0 to 3.9 on WebGen-Bench. It keeps the best step and backs out of worse ones. [R: abstract]
- RubSE (arXiv 2608.24138): a repair of one visual fault often damages a region that was right. Choosing one scoped repair target per round, and keeping a history of earlier targets, gave steadier improvement than free self-repair across six models. [R: abstract, cut short]
- UI2Code^N (arXiv 2511.08195): results kept improving over repeated render-and-inspect rounds. [R: abstract]

**What this means here.** The Fitter's plan (build, render, measure, repair, three rounds) matches the published direction. Three details in these papers are not yet in the plan or the kit:

1. **Keep the best round, not the last.** `repairPlan` orders repairs; nothing stores the grade of each round and returns to the best one.
2. **One repair target per round**, with the earlier targets carried along, to avoid breaking what held. The kit's plan lists every failure at once.
3. **Use the page, not only look at it.** An agent that clicks through the build finds faults that a screenshot does not. The kit's three keyboard walks are the start of this.

**Proposed change (M7).** Record these three as requirements of the Fitter's repair loop. The first two are small changes to `repairPlan` and can be built and tested in the kit now if the owner wants them early.

## Finding 4. For neurodivergent visitors, the evidence favors choice over one "best" setting

- A systematic review of 29 empirical studies on cognitive disabilities (Universal Access in the Information Society, 2014, doi 10.1007/s10209-014-0351-6) calls the evidence thin and the needs diverse. It reports that letting people choose their own text and background colors is better supported than maximizing contrast, and that in two controlled trials people with dyslexia and with autism did better on text-only interfaces. [S]
- The AASPIRE guidelines for autistic web users were written with autistic people at every stage and evaluated with 170 autistic users. [R: abstract. The guideline items were not read.]

**What this means here.** The kit's four questions fix one setting per design. The stronger evidence is for letting the visitor change the setting on the built page.

**Proposed change (needs the owner's approval; M5 for the Step, M7 for the build).**
1. Read the AASPIRE guideline items in full and compare them with the kit's 16 floors. Do this before adding any rule.
2. Add an Option that makes the built page carry a small, remembered "reading settings" control (text size, spacing, calmer colors, motion off), and a page check that the control exists and works.
3. Keep the receipt's statement that only people with the condition can confirm that a page works for them.

## Ranked list

| Rank | Change | Why first | Where |
|---|---|---|---|
| 1 | Build the export and the Fitter loop with best-round keeping, one target per round, and click-through checks | Largest measured effect in the literature read; nothing today turns a design into a measured page | M6, M7 |
| 2 | Pairwise blind arm in the exit test | It is how the field measures the North Star | M8 |
| 3 | Visitor-controlled reading settings; AASPIRE comparison | Best-supported neurodivergence measure found | M5, M7 |
| 4 | About ten more machine-made signs as warnings | Cheap, deterministic, already counted on 1,590 real pages | M5 |

## What this record does not settle

- No source measures whether pages built under rules like the kit's are preferred by people. Only the owner's blind test can.
- The three repair-loop papers measure matching a given picture or passing task tests, not taste.
- The builder did not reread records 04, 05, and 08 in full for this record; it read their headings, the rule list of 04, and the skills and checks sections of 05.
- Hosting: the owner said on 2026-11-24 not to use Neon or Vercel. The repository uses neither service. Three craft rules cite Vercel's published interface guidelines as a source.
