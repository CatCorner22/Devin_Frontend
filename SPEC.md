# Specification: the work in hand on "Refraction"

**What this file is.** The definition of done for the features now being built under the verified build loop (decision D56). `PLAN.md` is the one plan; each requirement below names the section of `PLAN.md` behind it. When a new piece of work starts, it gets a numbered requirement here first.

## 1. Purpose

The owner alone uses the Studio to choose a design step by step. The Studio must never lose the owner's work without a word, and it must ship only material that it may ship. (`PLAN.md` sections 1 and 7.)

## 2. Requirements

### 2.1 A save that another tab replaces in the same moment is not lost (finding C4-F18)

- What the user does: works in two or more tabs of the Studio and closes them, or sends them to the background, within 2 seconds after a change was saved.
- What the system does in response: a tab that closes or goes to the background within 2 seconds after its own save writes its work into a storage entry of its own, and does not write the saved project again. The next opening removes the entry when the saved project holds the same work. Otherwise the entry becomes a kept copy, and the Studio says so in a notice.
- Edge cases this requirement must handle:
  - The tab's last save is older than 2 seconds, or the tab never saved: nothing is written and nothing is kept.
  - The tab goes to the background within 2 seconds and lives on: the entry is removed once storage still holds the tab's work.
  - The tab goes to the background, another tab replaces the save, and the owner comes back: the tab stops saving and says so; its work stays on screen.
  - Storage has no room for the entry: the tab behaves as before, and nothing fails (a stated limit).
- How to test it end to end: the three tests named in `docs/reference/saving-table.md`, section "Saved", for the rows "within 2 seconds after its own save".
- Behind it: `PLAN.md` section 7 (the saving table; design before code); decision D55.

### 2.2 No bundled typeface reserves its name

- What the user does: picks the Option "Elegant thick-and-thin headings" or "Letters with small feet throughout", or starts from a Direction that uses one of them; opens a project that was saved with the typeface "Playfair Display" or "Source Serif 4".
- What the system does in response: draws headings in Playfair (the file with the size axis) and reading text in Literata. No shipped font file declares a Reserved Font Name. A saved project that names a replaced typeface opens with the replacement, a notice names both typefaces, and the project as it was is first kept as a copy.
- Edge cases this requirement must handle:
  - A project file that the owner opens by hand names a replaced typeface: the same swap and notice; the file on disk stays untouched.
  - A project names both replaced typefaces: one notice names both swaps.
  - The second opening of a swapped project says nothing more.
  - The licence notices (`THIRD_PARTY_NOTICES.md` and the Licences screen) list the new fonts and no longer list the replaced ones.
  - The Studio's script stays within its size budget (1,600 KB).
- How to test it end to end: a unit test reads the copyright notice inside every shipped font file and fails on the words "Reserved Font Name"; a browser test opens a stored project that names both replaced typefaces and reads the notice, the kept copy, and the drawn font family.
- Behind it: `PLAN.md` section 6; `docs/research/10-font-reserved-names.md`; decision D55.

## 3. Out of scope

- The Direction Creator (`PLAN.md` section 4.7, milestone M4D): it gets its requirement here when its place in the milestone order is approved.
- Milestones M5 and later.
- Any browser other than Chromium; the real private page with its database.

## 4. Constraints

The hard rules and verification rules of `CLAUDE.md`: no React and no browser API in `packages/core`; text renders as text; exact dependency versions, each at least 7 days old and recorded in `DECISIONS.md`; no test is skipped or weakened; anything that stores data is first a cell in the saving table.

## 5. Definition of done

A feature is done when its entry in `feature_list.json` has `"passes": true`, `npm run check` and `npm run e2e` pass, and the records (`PROGRESS.md`, `redteam/FINDINGS.md`, the guarantees reference) say what is true.
