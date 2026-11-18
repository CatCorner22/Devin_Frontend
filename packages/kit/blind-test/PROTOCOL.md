# The blind test

## What it is

A test in which people judge pages without knowing who made them. Some pages were built from a Prescription by the Fitter; some were made by skilled people. Each reviewer says, for each page, "made by a person" or "made by AI", and rates the quality from 1 to 7.

## Why it exists

The aim of this tool is output that a skilled reviewer cannot tell apart from the best human work. No program can measure that. The checks in this kit remove measurable faults; only people can say whether what is left looks human-made. This test is the only measure of the aim itself.

## What it can and cannot show

- It can show that reviewers **do** tell the two kinds apart, and by how much.
- It can show that the test **found no difference**, and how large a difference it could have missed.
- It can never prove that the two kinds are the same. `blindScore` therefore never says "indistinguishable".

## The pages

1. At least 5 tool-built pages and at least 5 person-made pages. More is better.
2. Match them: same kind of business, same kind of page (a small-business home page against a small-business home page), similar amount of content.
3. Choose the person-made pages before you look at the tool-built ones, and write down why each was chosen. Otherwise you will pick weak human pages without meaning to.
4. Show every page the same way: the same browser, the same window width, a full-page picture or the live page with the address bar hidden. Remove footers that name the builder or the tool.
5. The tool-built pages use real content from a real Brief. A page with placeholder words gives itself away and tests nothing.

## The reviewers

1. At least 5 reviewers; 10 or more for a result you would act on.
2. They should be people whose eye you trust: working designers and frontend developers. If the audience of the pages includes people with ADHD, autism, or dyslexia, include reviewers from those groups and note it.
3. A reviewer must not have seen the pages before, and must not know how many pages of each kind there are.

## The session

1. Shuffle the pages separately for each reviewer.
2. For each page, ask two questions, in this order:
   - "Was this page made by a person or by AI?"
   - "How good is this page, from 1 (poor) to 7 (excellent)?"
3. Then ask, in the reviewer's own words: "What made you decide?" Write the answer down. These answers are the most useful result: each names a mark that a new rule could check.
4. Do not tell the reviewer whether an answer was right until the whole session is over.

## The count

Record one line per answer: reviewer, page, who made the page (`tool` or `person`), and whether the reviewer judged it person-made. Give the lines to `blindScore` (in `src/logic/blindTest.ts`). It returns, for each kind of page, the share judged person-made with its range of doubt, the difference between the two shares with its range, and one plain statement.

## What makes the result wrong

- **Too few answers.** Under 30 answers on each kind, or under 5 reviewers, the ranges are too wide to mean anything. The statement says so.
- **Answers that depend on each other.** One reviewer gives many answers, and they are alike. The range treats every answer as independent, so it is narrower than it should be. More reviewers help more than more pages.
- **Unmatched pages.** If the person-made pages are famous sites, reviewers recognize them.
- **A reviewer who knows the tool.** Someone who knows which Directions the Studio offers recognizes them.
- **The owner as a reviewer.** The owner made the Decisions and cannot be blind.

## What to do with the result

- Reviewers tell the kinds apart: read their reasons, turn each into a rule record or a repair of the Catalog, and run the test again with new pages.
- The test finds no clear difference: note how large a difference it could have missed, and repeat with more reviewers before relying on it.
