# The saving table: what the Studio does with your work, in every situation

**What this is.** One table of everything that can happen to the work on screen: the five situations a tab can be in, the events that can occur, and what the Studio must do in each case. Each cell names the automatic test that checks it.

**Why it exists.** Six of the serious findings of the break-it campaign (F-1, F-2, F-10, F-12, F-16, F-18) came from this one area. Each was repaired as a single case. A table shows the missing cases at once; a case-by-case repair shows only the case in front of it. Writing this table on 2026-11-14 showed five cells without a test, and one of them was a real fault (the first row below).

**How to read it.** Find the row of the tab's situation, then the event. "Test" is the exact name of a test in `apps/studio/e2e/studio.e2e.ts`. "No automatic test" is stated where it is so, with the reason.

**What can go wrong with this file.** It can fall behind the code. The drift and truth auditor checks it at each review; the test names in it must exist word for word.

## The five situations of a tab

| Situation | What it means | What the status line says |
|---|---|---|
| Opening | The Studio is still looking for the saved project. The screen holds a placeholder. | "Opening your project…" |
| Saved | The screen shows exactly what is stored. | "Saved in this browser, on this computer", or "Saved on this page" on the private page; "Nothing to save yet" before the first change of a new project |
| Change pending | The owner changed something less than 0.3 seconds ago, or a save is under way. | "Saving…" |
| Save failed | The last save was refused: storage is full or blocked. The work is on screen only. (One case differs: after an Undo back to exactly what is stored, the line still says "Cannot save here" until "Try to save again" is pressed or the next change saves; the judge's retest of finding F-23 on 2026-11-14 recorded this.) | "Cannot save here: …", with the button "Try to save again" |
| Not saving | The Studio has stopped saving until the owner decides: another tab changed the project, the saved copy cannot be read, or a copy could not be kept. | "Not saving: see the notice at the top of the page" |

## Opening

| Event | What must happen | Test |
|---|---|---|
| The owner types or clicks | Nothing is recorded; the name field and the Contrast checks list are switched off | "saves nothing while the saved project is still opening: leaving, a tab switch, and typing change no copy (finding "saving 0")" |
| The tab goes to the background, or closes | Nothing is written and nothing is kept: the placeholder is nobody's work | the same test |
| Another tab saves | When this tab finishes opening, it must not show the older project under "Saved": it shows what storage holds, or it stops saving and says so | "opening, and another tab saves meanwhile: the tab does not say "Saved" over a project that storage no longer holds" (new on 2026-11-14; it failed before the repair) |
| The page's database answers late, with a newer copy | The copy is kept before any save can replace it; if it cannot be kept, saving stops | "keeps a copy that the page database hands over late, before any save can replace it (findings "saving 2" and "gaps 3")" |
| The saved copy cannot be read | It is kept, never overwritten, and offered as a download; saving stops until the owner decides | "never overwrites a saved project that it cannot read, and offers it as a download (findings SEC-03, P-05)" |
| Opening changes the saved copy (an older form, a detail that cannot stand) | The original is kept first; the project as opened is stored; the next opening says nothing | "stores the project as opened once the original is kept, so that the next opening changes nothing and says nothing" |

## Saved

| Event | What must happen | Test |
|---|---|---|
| The owner changes something | The tab goes to "Change pending"; the change is saved 0.3 seconds later | "saves to both stores on the private page and says so" |
| The tab goes to the background | Nothing is written and nothing is kept | "saved, and the tab goes to the background: nothing is written and nothing is kept" (new on 2026-11-14) |
| The owner comes back to the tab | The Studio looks at storage; if another tab saved meanwhile, it stops saving and says so | "notices another tab’s save when the owner comes back to the tab, even if no storage event arrived (finding F-12)" |
| Another tab saves | The tab stops saving and says so, with two choices | "stops saving, and says so, when another tab changed the project (finding SEC-06)" |
| The tab closes or reloads | Nothing is written: storage already holds the work | covered by the next opening in "stores the project as opened once the original is kept, so that the next opening changes nothing and says nothing" |
| The owner replaces the project (another Direction, a file, a new project) | The Studio asks first, keeps a copy of the replaced project, and Undo brings it back within its stated reach | "keeps the project that "Start again" replaces, so that it survives a reload (finding U2-01)"; "asks before a file replaces work, and Undo brings the work back (findings FTU-25, SEC-06)" |

## Change pending

| Event | What must happen | Test |
|---|---|---|
| 0.3 seconds pass and the save succeeds | "Saved" | "saves to both stores on the private page and says so" |
| The save is refused (storage full) | "Cannot save here", with the button "Try to save again" | "offers to try the save again after it failed, and saves once storage has room" |
| The save finds another tab's save in storage | The tab stops saving, also when both saves carry the same save time | "takes a save with the same save time but another mark for another tab’s save, and stops saving (finding F-12)" |
| The tab goes to the background | The work goes into an entry of the page's own, then into the saved project; once the save has succeeded and the page lives, the entry is removed | "saves at once when the page goes to the background (finding P-06)"; "removes the entry of its own when the page lives on and has saved" |
| The tab closes or reloads | The same two writes; the next opening removes the entry when the saved project holds the same work, and keeps it for good otherwise | "puts unsaved work into an entry of the page’s own before a closing page writes the saved project, and settles it at the next opening"; "keeps for good, and reports, the work of a closing page that another page’s save replaced in the same moment" |
| Undo brings the screen back to what is stored | The status line settles; it does not stay at "Saving…" | "settles the status line when a save has nothing to write, and keeps saying that storage is full while it is (finding F-7)" |

## Save failed

| Event | What must happen | Test |
|---|---|---|
| The owner changes something more | Each change tries again; the statement stays while storage is full | "settles the status line when a save has nothing to write, and keeps saying that storage is full while it is (finding F-7)" |
| The owner presses "Try to save again" | A real attempt, also when the screen is back at what was saved last | "really tries when "Try to save again" is pressed after an Undo back to the saved state" |
| The tab goes to the background | The work stays on screen; the statement stays true | "a save failed, and the tab goes to the background or is asked to close: the work stays on screen, the status stays true, and the browser is asked to ask" (new on 2026-11-14) |
| The tab is asked to close | The work is neither saved nor kept, so the Studio asks the browser to put its own "leave this page?" question | the same test. No automatic test covers the browser's question itself: the test browser answers it by itself. |
| The owner replaces the project | No copy can be kept, so the Studio asks once more and says what is at stake | "asks once more before it replaces a project whose copy it cannot keep, because storage is full (finding S3-01)" |

## Not saving

| Event | What must happen | Test |
|---|---|---|
| The owner goes on working | Nothing is saved; the work stays on screen; the notice with its buttons stays | "keeps the notice of a stopped save through Undo and a change of screen: a second tab (finding F-1)" |
| The tab goes to the background | The unsaved work is kept as one running copy, which a newer one replaces | "keeps one running copy for a tab that is not saving, however often the tab goes to the background (finding "saving 7")" |
| The tab closes or reloads | The unsaved work is kept as a copy; the next opening says so | "keeps unsaved work as a copy when a tab that is not saving closes or reloads" |
| Two such tabs close in the same moment | Both copies are kept | "keeps both copies when two tabs that are not saving close in the same moment (finding F-10)" |
| The other tab saves a second time | The tab stays as it is; a later "Keep this tab’s copy" keeps the other tab's newest copy | "not saving, and the other tab saves a second time: "Keep this tab’s copy" keeps the other tab’s newest copy, not its first" (new on 2026-11-14) |
| The owner presses "Keep this tab’s copy" | The other copy is kept first; this tab's work is saved | "stops saving, and says so, when another tab changed the project (finding SEC-06)" |
| The owner presses "Reload to see the other copy" | This tab's copy is kept first; if it cannot be kept, the Studio asks | "keeps this tab’s copy before "Reload to see the other copy" reloads (finding F-2)"; "asks before "Reload to see the other copy" discards a tab’s copy that it cannot keep, because storage is full (finding F-2)" |
| The owner presses "Go on" or "Start a new project" | What another tab saved meanwhile is kept first; saving resumes at once | "saves at once after "Go on: let the Studio save over it", also when nothing changed on screen (finding F-15)"; "keeps what another tab saved before "Start a new project" in a stopped tab replaces it (finding "saving 4")" |
| The owner starts again from another Direction | The replaced project is kept for good, also when the tab's running copy held the same text | "keeps the replaced project for good when a stopped tab starts again, although the tab’s running copy held the same text" |

## Brief content and builder notes (M5, unit 1: design before code)

The Brief changes the same project as a design choice. Content and the optional builder notes travel together through the saving rules above. No warning stops a save. These cases name the additional tests in `apps/studio/e2e/studio.e2e.ts`.

| Situation and event | What must happen | Test |
|---|---|---|
| Opening: the owner tries to type | No Brief editor appears until the saved project opens; nothing is written | "Brief: opening writes nothing" |
| Saved: the owner types, then reloads | Content and builder notes save together and reappear | "Brief: words reach every preview and survive reload and a file" |
| Change pending: the tab goes to the background | The current content and builder notes save at once | "Brief: pending words flush on background" |
| Saved: the private page accepts a change | Both stores receive content and builder notes | "Brief: words save to both stores" |
| Save failed: the owner types again | Words stay on screen; the failure stays visible; retry saves both fields | "Brief: failed saves keep words and retry" |
| Not saving: the owner types, then reloads | The stored project stays untouched; a kept copy holds content and builder notes | "Brief: held words stay in a kept copy" |
| Saved: another tab saves | This tab stops saving, keeps its words on screen, and offers the existing two choices | "Brief: another tab stops saving" |
| Replacing content: restore the sample | Ask first; say what changed and offer Undo; Undo restores content and builder notes | "Brief: warnings never block and the sample has a way back" |

## Behavior Steps (M5, unit 3)

Motion timing, keyboard focus, empty-list help, and form-error placement use the existing `params` and `base` objects and Decisions. Their fields are optional on import; missing fields keep the old rendering and do not appear in the saved copy until the owner picks or keeps that new Step. Keeping an implied default writes that Step's value so the saved result matches its card; the starting values stay unchanged. Voice uses only `brief.voice`; its Decision names an Option but carries no copied voice values.

| Situation and event | What must happen | Test |
|---|---|---|
| Saved: pick a behavior Option and reload | The choice, card picture, and Summary agree; the saved choice survives reload | "behavior: picks every Motion timing Option, including its card picture and saved Summary"; the equivalent tests for Keyboard focus, Empty list, Form errors, and Voice and tone |
| Replacing a voice Decision through the Brief | Say that the earlier Decision and reason were removed; Undo restores the earlier voice and Decision | "behavior: Brief voice stays in sync, keeps owner text, and offers Undo after replacing a Decision" |
| Opening an old file | Do not insert behavior Decisions or optional fields; keep the old tokens | Unit test "opens old parameters without adding behavior fields or Decisions" |

## Contact inner page (M5, unit 4)

The optional `content.contactPage` holds its heading, introduction and visit directions. Until edited, these read from the existing contact heading, contact text and address; opening an old file does not insert a copy or sample words. The same project saving and tab rules apply.

| Situation and event | What must happen | Test |
|---|---|---|
| Saved: edit contact-page text and reload | The words survive, including through a project-file round trip | "inner page: owner words survive reload and a file" |
| Opening an old file | Keep the new field absent; use that owner's existing contact words | Unit test "old content stays unchanged and supplies the contact defaults" |
| Switching preview pages | Change no Decision or project content; keep the view across Studio screens in this tab, return to Home on reload | "inner page: switch pages without changing the project" |
| Restoring the sample | The existing confirmation clears the optional contact text too; Undo restores it | "inner page: owner words survive reload and a file" |

## In-project Skins (M5, unit 5)

`skinLayer` optionally holds six color values and the Steps chosen after the Skin. `params`, `base`, content and earlier Decisions stay underneath it. No Skin removes the layer without rewriting that recipe. Older files add no layer on opening. The named browser tests below live in `apps/studio/e2e/studio.e2e.ts`.

| Situation and event | What must happen | Test |
|---|---|---|
| Opening: the owner tries to change Skin | Do not show an editable placeholder control or write anything | "Skin: opening records nothing and pending changes flush on background" |
| Saved: choose a Skin | Save the layer to both stores without changing earlier Decisions | "Skin: changes save to both stores" |
| Saved: reload or project-file round trip | Keep the effective colors on both pages and every color preview | "Skin: colors reach both pages and every preview, persist through reload and a file, and leave Decisions alone" |
| Saved/change pending: another Skin or Undo | Each Skin change is one history entry; later color choices win for their Step | "Skin: each change is one Undo step and later color choices win for their Step"; "Skin: a variation can choose a covered underlying color"; "Skin: variation controls use the visible second color, not the covered one-color recipe" |
| Covered color Step: Continue without choosing a card | Preserve the underlying Decision and reason; No Skin restores its saved colors | "Skin review: Continue preserves the covered Decision and reason, including after No Skin" |
| New starting Skin / old file's starting Skin | New starts have a removable layer after reload; older baked-in colors stay, with a plain explanation before and after No Skin | "Skin review: a Skin chosen on Directions is removable after saving and reloading"; "Skin review: old starting-Skin files explain why No Skin cannot remove saved colors" |
| Starting Skin: change a color Step, then Put this Step back | Restore the starting appearance, Skin included, and remove that Step's Decision | "Skin review: Put this Step back restores the colors shown by the starting Skin" |
| Compare a small variation, return to standard Options without picking, then Continue | No new color adoption, saved value, Decision or Skin exception | "Skin review: returning from unpicked variations restores the untouched standard-card selection" |
| Change pending: background | Flush the current layer at once, not the old colors | "Skin: opening records nothing and pending changes flush on background" |
| Save failed: continue, then retry | Keep the selected Skin on screen and save it once storage has room | "Skin: failed saves keep the choice and retry" |
| Not saving: another tab saved; owner changes Skin and backgrounds | Preserve the other tab's saved copy, keep this tab's new layer in a kept copy | "Skin: another tab stops saving and preserves the unsaved choice in a kept copy" |
| Replace Direction with one not offering the Skin | Explain the loss and clear its name and layer | "Skin: a Direction that does not offer the current Skin says so and unsets it" |
| Open old file, malformed layer or unavailable Skin | Old files add nothing; reject invalid colors; retain valid anonymous colors and explain unavailable names | Unit tests in `skin-change.test.ts`: "validates color layers and normalizes only invalid exception references, not Decisions" and "rejects unknown or unoffered Skins and handles a plain start and empty no-Skin change" |

## What no test covers (stated plainly)

- The browser's own "leave this page?" question. The Studio can only ask the browser to put it; the test browser answers it by itself.
- A browser that ends a tab without running the page's last code (a crash, a forced quit). Work from the last 0.3 seconds is then lost.
- A closing page when storage has no room for the entry of its own: it writes the saved project as before, and two pages that close in the same instant can then still lose one change.
- Any browser other than Chromium, and the real private page with its real database.
