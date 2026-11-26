# Skin contrast, M5 unit 5

This is a measured repair, not a compliance claim. No Skin or Direction was hidden, removed or recolored in the Catalog. The saved Contrast checks setting, color parameters and Decisions stay unchanged. Fixed floors apply when tokens are derived, before the selected reporting profile runs.

## Before the repair

The builder measured 38 Directions in light and dark (76 cases), then all 148 offered Direction/Skin combinations in light and dark (296 cases). Each pair below is counted once per design/theme, not once per page. The same tokens feed Home and Contact.

| Failing pairs | Text, 4.5:1 | Large text, 3:1 | Non-text, 3:1 | Total |
|---|---:|---:|---:|---:|
| Direction alone, without a Skin | 38 | 0 | 56 | 94 |
| Skin cases: the same pair also fails in the Direction's own colors, in the same theme | 174 | 0 | 208 | 382 |
| Skin cases: the Direction's own colors pass that pair | 18 | 0 | 0 | 18 |
| All Skin-case failures | 192 | 0 | 208 | 400 |

“Inherited” above means the pair already fails, not that the ratio is identical. A different hue can worsen or improve that ratio. Text pairs keep their existing pinned requirements, including conservative 4.5:1 checks where a particular rendering might qualify as large text.

| Pair | Failures among the 296 Skin cases |
|---|---:|
| Field border against card | 104 |
| Field border against field | 104 |
| Link on card | 70 |
| Link on page | 67 |
| Band labels | 21 |
| Outline button on page | 10 |
| Outline button on card | 10 |
| Solid-band labels | 10 |
| Introduction on hero | 4 |

### What axe found

The baseline browser probe rendered both pages at 1280px with the bundled fonts and Advise: 744 documents (372 design/theme cases × two pages). Axe reported serious `color-contrast` findings on 85 Skin Home documents, 10 Skin Contact documents, 17 Direction-only Home documents and two Direction-only Contact documents: 114 documents, or 102 distinct design/theme cases. No other serious or critical rule failed in that probe.

The flagged text included service links, fact labels, outline-button labels, service numbers and short hero labels. Axe did not identify the failing field-border pairs; those need independent non-text contrast math. It also returned `color-contrast` items needing review on 470 documents. An item needing review is not a pass. Fades and other painted backgrounds still need more than an axe result.

## Root cause and repair

The default project uses Advise. `mockupHtml` calls `deriveTokens` with that saved profile. Previously `basePalette` brought link ink only to 3:1 although the link pairs require 4.5:1. It guessed field-border lightness from the contrast slider without enforcing 3:1. Fixed-opacity small labels could also fall short. `applyProfile` repaired such pairs only under Enforce. Headline-fade endpoint protection was also gated on Enforce.

The Direction-only failures disprove individual Skin data as the primary cause. An independent WCAG 2.x calculation and Chromium's computed colors reproduced Midnight Aurora/Lagoon/dark at **2.937950:1** for the phone field border against its field, on both pages, against the 3:1 floor.

`applyFloors` now runs before `applyProfile`. It moves only the lightness of the palette color assigned to move by the existing pair specification. It searches both lighter and darker, retaining hue, chroma and text opacity, and chooses the nearer passing lightness while checking every pair sharing that token. It retains the existing safety margin for emitted colors and the existing thresholds. It repeats for shared aliases. Highlight-stroke opacity and headline endpoints receive their fixed large-text floor too. The returned `floorRepairs` distinguishes these mandatory repairs from profile notes; the Studio explains that fixed floors always apply.

The search minimizes lightness movement with those constraints; it does not claim a global minimum over every possible hue, chroma, opacity and background redesign.

### How far colors moved

Distances below use OKLab on the emitted sRGB colors: 0 means no change, 1 is roughly the black-to-white lightness distance. They are color distances, not contrast ratios.

- Largest opaque token movement across Directions and Skins: **0.106005**, Before Dawn, forced light theme, link ink `#e76d00` → `#b95600`.
- Largest opaque token movement within offered Skin cases: **0.104028**, Gold on Sticker Pop, Motel Neon or Mall Sunset in light, link ink `#ba8800` → `#956b00`.
- Largest headline-gradient endpoint movement: **0.176344**, Sunlit Studio/Lagoon/light, second endpoint `#9cc7ff` → `#4592f1`. Its first endpoint moves from `#00a1a2` to `#008081`.
- 271 opaque token entries changed across the 372 audited cases, counting shared aliases separately. No authored Skin hue was edited.

## Checks and remaining work

The previous Skin allowance test ignored a failing pair if the Direction also failed it. It now requires **zero failed pairs**, in both themes and all three profiles. The token tests independently remeasure emitted colors for every offered combination; headline endpoints are checked in all profiles. Unit 5 adds browser kit/axe cases for every Skin on both pages at 375 and 1280px, using varied offered Directions. The exhaustive 1280px probe after repair found no serious or critical axe finding in its 744 documents. No audited combination remains below a measured pair floor.

Stored pictures are updated only for Directions whose native-theme color output changed; measured-style changes must be colors, not geometry. No picture tolerance, contrast threshold, profile setting or machine floor is relaxed.

This does not replace a person's check of fades, outline lettering, atmospheric backgrounds, focus visibility during real keyboard use, meaning conveyed by color, or the other person-only floors. M5 remains open pending its required reviews and exit checks.
