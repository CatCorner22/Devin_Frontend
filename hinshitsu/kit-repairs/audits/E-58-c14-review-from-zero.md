devin-c93f618beb8743c7ae47eaada891c7bf

**Setup.** Scratch clone at `86287c2`; Chromium revision 1255 (159.0.8154.6). The judge used 1254. The judge report is absent at `86287c2`; I read it from `b564007`. Every result below ran 3 times with the same output.

## 1. Faults in the changed lines

| ID | Class | Input | Output |
|---|---|---|---|
| C14-1 | major | `<main inert><dialog id="d" aria-label="Basket"><button class="del" tabindex="-1">Delete</button><button>Close</button></dialog></main>` + `d.showModal()`; also `<div class="del" style="cursor:pointer">` with a script click listener | `keyboardReachable`: holds; a real click sets title `clicked`. Without `inert`: fails. |
| C14-2 | minor | Same shape, `onclick` div in `.panel{position:fixed}`, `dialog{width:0;height:0}` `::backdrop{display:none}`; or a full-window dialog with `pointer-events:none` | holds; click works. Default dialog box: fails. |
| C14-3 | minor | `<svg class="del" inert role="button" onclick="document.title='clicked'">`; also a div in `foreignObject` under `svg[inert]` | holds; click works. Without `inert`: fails. |
| C14-4 | major | `<address>Corner Bakery<br>123 Main Street<br>Leeds LS1 4AB</address>`; `<td>123 Main Street</td>` | `placeholderCopy`: fails "123 main street". The filler `<p>123 Main Street, Springfield, USA</p>` holds. |
| C14-5 | minor | `<h1>Anytown Music School</h1>` | fails "anytown" (blames a real name). |
| C14-6 | minor | `designId({'--bg':'url('.repeat(2000)})` | 21–23 s; base `83eced7` regex 0.01 s. 4000 repeats: 167–172 s. |
| C14-7 | minor | `url("a\")B.png")` vs `url("a\")b.png")` | same ID for two file names. |
| C14-8 | major | `.hero{background-image:url('data:image/svg+xml,<svg … fill="hotpink" … rgb(255,0,170) …>'), <fade of design colors>}` (single-quoted CSS url, double-quoted SVG attributes) | `tokenFit`: fails "background fade color rgb(255,0,170)", a color of the picture. The same color in a picture with single-quoted attributes holds. |
| C14-9 | minor | `url("a\")#ff00aa.png"),linear-gradient(#ffffff,#ffffff)` | fails "background fade color #ff00aa". |

C14-1 and C14-8 are major by my reading that these pages are ordinary; C14-4 because an ordinary sound page is blamed.

## 2. Spot-check of the judge's minors

| Judge ID | My class | Reason |
|---|---|---|
| F-7 (B-040) | **major, higher** | An ordinary 16 px pager "Page 1 2 3 4 5" holds; without the word it fails at 8 by 17 px. |
| F-10 (B-007) | minor | Needs a hidden pause control: a hostile page. |
| F-11 (B-097) | minor | Transparent outline and #000001 hold; a builder's trick. |
| F-13 (B-038) | **major, higher** | Sound Spanish page blamed for "todo". |
| F-14 (B-052) | minor | Only "lorem ipsum" split across lines escapes; the full sentence fails. |
| F-20 (B-124) | **major, higher** | Off-design `::before`, outline, text-shadow and SVG colors all hold; written plainly they fail. |
| F-22 (B-004, B-108) | **major, higher** | Purple fade on `html` or a hero `::before` holds; both are ordinary. |
| F-23 (B-070) | **major, higher** | Sound non-modal cookie bar blamed. |
| F-24 (B-094) | **major, higher** | Sound page with a working pause button blamed. |
| F-28 (B-088) | minor | No answer after 30 s only with JavaScript off: a runner setting. |

F-12 (B-111) did not reproduce: the attack page now fails `visibleLabels`. I gave it no class.

## Skipped

- The `aria-disabled` change: I have no recorded run, so I report nothing.
- Chromium 1254: not installed; I used 1255 as instructed.
- F-13's `checkBrief` reproduction (B-054) and the other 13 judge minors: not re-run.
- `npm run check` and the repository's own e2e suite: not run; no repository file changed.
- `PLAN.md`, `PROGRESS.md`, `DECISIONS.md`: I have no record of reading them.

No file in the repository changed; nothing pushed; no pull-request action. Two runner files exist only in the scratch clone.
