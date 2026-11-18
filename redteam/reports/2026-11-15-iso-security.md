# Security attacker report: commit 44ae932 ("Keep slow browser tests from changing later tests")

Lane: security attacker (hard rule 12). Target: github.com/CatCorner22/Devin_Frontend, branch `devin/1763223000-e2e-timeout-isolation`, commit `44ae9324dd47a94445c34aea393daf92a4481fd5`, base `claude/brave-mayer-sawqz9`. I pushed nothing, committed nothing, and posted nothing. I left the working tree clean.

## Machine and browsers

- Linux 6.8.0-1060-aws, 8 cores, 31 GB. Node v22.23.5. Vitest 5.1.0. Playwright 1.65.0 (`browsers.json` expects Chromium revision 1254, 158.0.8127.18).
- Main browser, used unless an attempt says otherwise: `~/.cache/ms-playwright/chromium-1255/chrome-linux64/chrome`, "Google Chrome for Testing 159.0.8154.6" (the revision the builder used).
- Also used: full Chrome revisions 1254 (158.0.8127.18, which I installed with `npx playwright install chromium`), 1248 (156.0.8078.4), 1243 (153.0.8010.12); the headless shell 1254 (Playwright's default when `PW_CHROMIUM` is unset) and the headless shell 1255 (159.0.8154.6).
- Budget used: 22 of 25 target runs, about 35 minutes of 2 hours.

## How I measured

I applied a local experiment patch to `apps/studio/e2e/visual.e2e.ts` (appendix A; file `instrument-v2.patch`). It changes no loop, assertion or threshold by default. It adds a log (`EXP_LOG=<file>`) and these switches, each off unless set:

- `EXP_PHONE_TIMEOUT=<ms>`: the timeout of the phone-width loop test (default 240000, unchanged).
- `EXP_HOOK_DELAY=<ms>`: a wait inside the `onTestFinished` function before `context.close()`.
- `EXP_TEL_TIMEOUT=<ms>`: a timeout for the telephone-number test (default: the suite's 90000).
- `EXP_TEL_FAIL=1`: makes the telephone-number test's assertion fail on its first pass through the loop (a stand-in for a real regression).

One run (A11) used a second patch on `studio.e2e.ts` (appendix B). Runs r1 to r19 used the patch without its last addition (the line that logs the screenshot size and `window.innerWidth`); that line only adds a log entry.

Common setup for every repro:

```
git checkout --detach 44ae9324dd47a94445c34aea393daf92a4481fd5
npm ci --ignore-scripts
git apply instrument-v2.patch
export PW_CHROMIUM=$HOME/.cache/ms-playwright/chromium-1255/chrome-linux64/chrome
V="npx vitest run --config vitest.e2e.config.ts apps/studio/e2e/visual.e2e.ts"
```

"Succeeded" below means: the attempt showed harm, or showed that a claim does not hold. "Failed" means the change held.

## Attempts

### A1. Does `onTestFinished` run after a timeout, and what happens to the running loop? (run r1) — attack failed

Input: `EXP_LOG=r1.log EXP_PHONE_TIMEOUT=5000 $V -t 'never makes the page wider|plain-start, region'`

Observed: `Tests  1 failed | 3 passed | 155 skipped (159)`; `Error: Test timed out in 5000ms.` Log:

```
    388 ms  loopPage: context opened; open contexts 2
   5386 ms  onTestFinished: start; test state "fail"; error "Test timed out in 5000ms. ..."; open contexts 2
   5404 ms  phone loop: show() threw at iteration 120: Error: page.setContent: Target page, context or browser has been closed
   5404 ms  onTestFinished: context.close() resolved after 18 ms; open contexts 1
   5578 ms  picture plain-start-top: mean 0.4008 share 0.5281% viewport 1280 contexts 1
   5764 ms  afterAll: open contexts 1; loop iterations 120; loop commands started after the test finished 0
```

The function ran after the timeout. `close()` resolved in 18 ms while `setContent` was in flight. The loop threw once and stopped. The log holds no "UNHANDLED REJECTION" line and Vitest printed no unhandled error. No context leaked. I did not catch a timeout that landed inside `page.evaluate` (not measured).

### A2. Does Vitest await the returned promise? (run r2) — attack failed

Input: `EXP_LOG=r2.log EXP_PHONE_TIMEOUT=5000 EXP_HOOK_DELAY=3000 $V -t 'never makes the page wider|plain-start, region'`

Observed: `Tests  1 failed | 3 passed | 155 skipped (159)`. Log:

```
   5198 ms  onTestFinished: start; test state "fail"; ...; open contexts 2
   5248 ms  phone loop: starts a command after the test finished (iteration 115)
   ... (31 such lines) ...
   8210 ms  phone loop: show() threw at iteration 145: Error: page.setContent: Target page, context or browser has been closed
   8211 ms  onTestFinished: context.close() resolved after 13 ms; open contexts 1
   8354 ms  picture plain-start-top: mean 0.4008 share 0.5281% viewport 1280 contexts 1
   8560 ms  afterAll: open contexts 1; loop iterations 145; loop commands started after the test finished 31
```

Vitest waited for the promise: the first stored-picture test started after `close()` resolved. During the 3 seconds that I added before `close()`, the loop issued 31 more commands to its own page. So the loop stops only when `close()` runs, not when the test times out.

### A3. The real 240-second timeout, whole visual file (run r14) — attack failed

Input: `EXP_LOG=r14.log $V --reporter=verbose` (no switch set; every timeout as committed).

Observed: `Tests  1 failed | 158 passed (159)`, `Duration  675.69s`, `Error: Test timed out in 240000ms.` Loop tests: phone width 240009 ms (timed out), other widths 82709 ms, headline 198040 ms. Log:

```
  99310 ms  loopPage: context opened; open contexts 2
 339304 ms  onTestFinished: start; test state "fail"; error "Test timed out in 240000ms. ..."; open contexts 2
 339310 ms  phone loop: show() threw at iteration 1076: Error: page.setContent: Target page, context or browser has been closed
 339312 ms  onTestFinished: context.close() resolved after 8 ms; open contexts 1
 674947 ms  afterAll: open contexts 1; loop iterations 1076; loop commands started after the test finished 0
```

All 117 stored-picture numbers (mean and share) equal the control run r9 exactly (`diff` of the two lists prints nothing). This matches the builder's "158 passed, 1 failed". Two further numbers from the same logs: the phone loop did 120 iterations in its first 5 seconds (r1) but 1076 in 240 seconds; the telephone-number test took 1916 ms in this run and 235 ms when run nearly alone (r7).

### A4. A timeout that lands before `loopPage()` registers its function (runs r3, r17) — attack succeeded, only with a 1 ms timeout

`loopPage()` awaits `browser.newContext()` and only then calls the global `onTestFinished`, which attaches to whatever test Vitest is running at that moment.

Input r3: `EXP_LOG=r3.log EXP_PHONE_TIMEOUT=1 $V -t 'never makes the page wider|plain-start, region'`

Observed r3: `Tests  1 failed | 3 passed | 155 skipped (159)`. Log:

```
    248 ms  loopPage: context opened; open contexts 2
    423 ms  picture plain-start-top: mean 0.4008 share 0.5281% viewport 1280 contexts 2
    423 ms  onTestFinished: start; test state "pass"; error "undefined"; open contexts 2
    432 ms  phone loop: show() threw at iteration 3: Error: page.setContent: Target page, context or browser has been closed
    433 ms  onTestFinished: context.close() resolved after 9 ms; open contexts 1
```

The function attached to the next test ("plain-start, region top", state "pass"), not to the loop test. The loop ran 3 iterations on its own page while that stored-picture test ran. The picture numbers did not change.

Input r17: `EXP_LOG=r17.log EXP_PHONE_TIMEOUT=1 $V -t 'never makes the page wider'`

Observed r17: `Tests  1 failed | 158 skipped (159)`. Log, complete:

```
    150 ms  afterAll: open contexts 1; loop iterations 0; loop commands started after the test finished 0
    162 ms  loopPage: context opened; open contexts 2
```

The context opened after `afterAll` had started; no `onTestFinished` line appears. I did not reach this state with the committed 240000 ms timeout (not measured; it needs `browser.newContext()` to take longer than the test's timeout).

### A5. Interference through time (runs r18, r19) — attack failed

Input r18: `EXP_LOG=r18.log EXP_PHONE_TIMEOUT=5000 taskset -c 0 $V -t 'never makes the page wider|matches its stored picture|keeps the measured style'` (Node and the browser share one core).

Input r19: the same, while six busy loops ran on the same core: `for i in 1 2 3 4 5 6; do taskset -c 0 sh -c 'while :; do :; done' & done`, then `kill $(jobs -p)` afterwards.

Control r9: `EXP_LOG=r9.log $V -t 'matches its stored picture|keeps the measured style'`.

Observed: r18 `Tests  1 failed | 118 passed | 40 skipped (159)`, `Duration  29.03s`; r19 the same counts, `Duration  125.62s` (control r9: 18.04 s). The one failure in each is the loop's forced timeout. In both, all 117 picture numbers equal r9 exactly. The loop threw once after `close()` (r19: `context.close() resolved after 48 ms`) and issued 0 commands afterwards. The real-timeout run A3 gave the same result.

### A6. Browser mismatch (runs r9 to r13, r15) — attack failed; one measured side fact

Input: `EXP_LOG=<run>.log $V -t 'matches its stored picture|keeps the measured style'`, with `PW_CHROMIUM` set as in the table (r10: `unset PW_CHROMIUM`).

| Run | Browser | Result | Largest mean | Largest share |
|---|---|---|---|---|
| r9 | full Chrome 1255 (159.0.8154.6) | 118 passed | 0.7174 | 1.0234% |
| r11 | full Chrome 1254 (158.0.8127.18) | 118 passed | 0.7174 | 1.0234% |
| r12 | full Chrome 1248 (156.0.8078.4) | 118 passed | 0.7174 | 1.0234% |
| r13 | full Chrome 1243 (153.0.8010.12) | 118 passed | 0.7174 | 1.0234% |
| r10 | headless shell 1254 (Playwright default, as CI) | 118 passed | 0.2341 | 0.0000% |
| r15 | headless shell 1255 via `PW_CHROMIUM` | 118 passed | 0.2341 | 0.0000% |

No stored-picture result and no measured-style result changed with the revision. All four full-Chrome runs gave identical numbers for all 117 pictures; both headless-shell runs gave identical numbers. The numbers differ between the two kinds of browser, not between revisions. With full Chrome, `long-conversation-top` reads `mean 0.7174 share 1.0234%`; the test's limit for share is 1.2% (`toBeLessThan(0.012)`). With the headless shell the same picture reads `mean 0.0000 share 0.0000%`. `PROGRESS.md` describes the builder's browser as "revision 1255 (159.0.8154.6), not the expected revision"; a `PW_CHROMIUM` path of the form `chromium-1255/chrome-linux64/chrome` is also a different kind of browser from the default headless shell.

### A7. Can `PW_CHROMIUM` run an arbitrary program? (run r16) — succeeded locally; no route found in CI

Input: a harmless script `fake-browser.sh` (appendix C) that writes one line to `~/attack/fake-browser-ran.txt` and exits. `PW_CHROMIUM=$HOME/attack/fake-browser.sh $V -t 'plain-start, region "top"'`

Observed: `Tests  159 skipped (159)`, `Error: browserType.launch: Target page, context or browser has been closed`. The marker file reads: `ran as ubuntu in /home/ubuntu/repos/Devin_Frontend with 46 arguments: --disable-field-trial-config --disable-background-networking`. The harness runs whatever file the variable names, with the tester's rights. Both `visual.e2e.ts` (line 43) and `studio.e2e.ts` (line 20) read it; this commit did not add or change that.

CI (read only, not run): `.github/workflows/ci.yml` sets no `env`, runs on `push` and `pull_request` with `permissions: contents: read`, and installs its own browser. I found no input that sets `PW_CHROMIUM` there. A pull request that can change the workflow or a test file can already run code in that job without the variable.

### A8. A failed shared-page test now fails every stored-picture test; before this commit it did not (runs r4, r5) — attack succeeded

The telephone-number test sets the shared page to 375 px wide and sets it back to 1280 only on its last line. Its assertion sits inside the loop, so a failure skips the last line. Before this commit the headline loop test ran next on the shared page and ended with `page.setViewportSize({ width: 1280, height: 800 })`. After this commit that line acts on the loop's own page.

Input r4 (the commit): `EXP_LOG=r4.log EXP_TEL_FAIL=1 $V -t 'telephone number|keeps the main headline|matches its stored picture'`

Observed r4: `Tests  118 failed | 1 passed | 40 skipped (159)`, `Duration  202.22s`. Log: `picture plain-start-top: mean 25.0949 share 18.3859% viewport 375 contexts 1`; 117 picture lines say `viewport 375`. First picture error: `AssertionError: mean difference per channel 25.09; share of clearly different pixels 18.39%: expected 25.094859374998016 to be less than 1.5`.

Input r5 (the base): `git checkout origin/claude/brave-mayer-sawqz9 -- apps/studio/e2e/visual.e2e.ts`, then change one line, `expect(shown, ...)` to `expect(false, ...)` in the telephone-number test, then `$V -t 'telephone number|keeps the main headline|matches its stored picture'` (no other patch).

Observed r5: `Tests  1 failed | 118 passed | 40 skipped (159)`, `Duration  296.68s`. The only failure is the telephone-number test.

Same forced failure, same filter: 1 failure on the base, 118 on the commit.

### A9. The same failure plus `UPDATE_BASELINES=1` overwrites every stored picture with a phone-width picture, and the picture tests pass (run r6) — attack succeeded

Input: `EXP_LOG=r6.log EXP_TEL_FAIL=1 UPDATE_BASELINES=1 $V -t 'telephone number|matches its stored picture'`, then `git status --short`, then `git checkout HEAD -- apps/studio/e2e/baselines`.

Observed: `Tests  1 failed | 117 passed | 41 skipped (159)`. `git status` listed 117 modified files under `apps/studio/e2e/baselines` (plus the patched test file). The log holds 117 lines of the form `picture plain-start-top: UPDATE writes a picture taken at viewport 375`. The only failure shown is the telephone-number test. I did not run the base with `UPDATE_BASELINES=1` (not measured); by r5 the base restores 1280 before the picture tests when the headline loop runs between.

### A10. A shared-page test that times out keeps changing the shared page under the stored-picture tests (runs r7, r8, r20, r22) — attack succeeded with a lowered timeout

The same class of bug as the one this commit repairs, on a test the commit did not move. The telephone-number test has the suite's default 90000 ms timeout and uses the shared `page`.

Input r7: `EXP_LOG=r7.log EXP_TEL_TIMEOUT=300 $V -t 'telephone number|matches its stored picture'`. Observed: `Tests  118 passed`; the test finished in 235 ms, so no timeout occurred. This try missed.

Input r8 and r20: `EXP_LOG=r20.log EXP_TEL_TIMEOUT=100 $V -t 'telephone number|matches its stored picture'`

Observed, both runs: `Tests  118 failed | 41 skipped (159)`. Log of r20:

```
    387 ms  telephone test: finished; state "fail"; 105 ms
    416 ms  telephone test: showed a page on the shared page; viewport 375
    508 ms  picture plain-start-top: screenshot 375x800; window.innerWidth 375
    509 ms  telephone test: showed a page on the shared page; viewport 375
    548 ms  picture plain-start-top: mean 17.4936 share 12.3328% viewport 375 contexts 1
    741 ms  picture plain-start-services: mean 218.9101 share 99.3094% viewport 375 contexts 1
    845 ms  telephone test: body ran to its end and set the shared page back to 1280
    940 ms  picture plain-start-contact: mean 216.9469 share 99.3281% viewport 1280 contexts 1
   1034 ms  picture graphite-precision-top: screenshot 1280x800; window.innerWidth 375
   ...
  17955 ms  picture plain-label-contact: screenshot 1280x800; window.innerWidth 375
  17975 ms  picture plain-label-contact: mean 10.0352 share 6.6016% viewport 1280 contexts 1
```

After the timeout the test body showed 11 more pages on the shared page while stored-picture tests ran. After the body ended and set 1280, Playwright reported a 1280 viewport and 1280x800 screenshots, but the page's own `window.innerWidth` stayed 375 to the end of the file, and all 117 stored-picture tests failed. I did not find why the width stays at 375 (not determined). No unhandled rejection appeared.

Input r22: `EXP_LOG=r22.log EXP_TEL_TIMEOUT=100 UPDATE_BASELINES=1 $V -t 'telephone number|matches its stored picture'`, then `git checkout HEAD -- apps/studio/e2e/baselines`. Observed: `Tests  1 failed | 117 passed | 41 skipped (159)`; 117 baseline files modified; 2 log lines say `window.innerWidth 375`, and in this run the width did not stay at 375 afterwards. So the stuck width of r8 and r20 does not occur on every run.

On this machine the committed 90000 ms limit is far away: the longest shared-page test in r14 took 10355 ms. I did not produce this timeout without lowering the limit (not measured). By reading: every test in the first three `describe` blocks, the telephone-number test, and the three tests after the stored pictures use the shared page the same way.

### A11. The same class in `studio.e2e.ts` (run r21) — attack failed

Input: `npm run build:page`; apply `instrument-studio.patch` (appendix B: a log, and a timeout switch on the test "keeps generated Directions while the person moves around"); `EXP_LOG=r21.log EXP_STUDIO_TIMEOUT=300 npx vitest run --config vitest.e2e.config.ts apps/studio/e2e/studio.e2e.ts -t 'keeps generated Directions|Decide later|a slider changes only its own value'`

Observed: `Tests  1 failed | 2 passed | 103 skipped (106)`, `Error: Test timed out in 300ms.` Log, complete:

```
    393 ms  afterEach: "keeps generated Directions while the person moves " state "fail"; open contexts 1
   1249 ms  Directions test: body reached its last line; it now closes its context
   2204 ms  afterEach: ""Decide later" changes nothing and records nothing" state "pass"; open contexts 0
   5068 ms  afterEach: "a slider changes only its own value, and the main " state "pass"; open contexts 0
   5068 ms  afterAll: open contexts 0
```

The timed-out test kept running for about 850 ms beside the next test, in its own context, and the next two tests passed. Each test in that file opens its own context through `open()`; I found no page shared between tests there. A test in that file closes its context on its last line only, so a test that fails early leaves its context open until `afterAll` (read from the code; the count after an early failure is not measured).

## Not tried

- A timeout that lands inside `page.evaluate` rather than `setContent`; a `context.close()` that hangs (the function then meets Vitest's 90000 ms hook limit). I had no way to force either without changing more than a timeout.
- A real (not lowered) 90-second timeout of a shared-page test. It needs a machine about nine times slower than mine; r19 (one core, six busy loops) slowed the stored-picture tests about seven times and none timed out.
- Full `npm run e2e` (both files). I ran the whole visual file once (A3) and three tests of `studio.e2e.ts` (A11).
- The targets test ("at least 24 by 24 pixels") failing at 375 px. By reading, the telephone-number test later restores 1280 when it passes, so I expect no cascade; not measured.
- The base with `UPDATE_BASELINES=1` (A9's comparison).
- The baseline folder path: `baselineDir + direction.id + '-' + focus + '.png'` is written under `UPDATE_BASELINES=1`. A Direction id that contains `../` would write outside the folder. I did not check whether the Catalog's tests forbid such an id, and did not try it.
- Three of 25 target runs remain unused.

## Appendix A: `instrument-v2.patch` (applies to commit 44ae932)

```diff
diff --git a/apps/studio/e2e/visual.e2e.ts b/apps/studio/e2e/visual.e2e.ts
index 55ee1a5..984667b 100644
--- a/apps/studio/e2e/visual.e2e.ts
+++ b/apps/studio/e2e/visual.e2e.ts
@@ -3,7 +3,7 @@
 // 2. One variable: a Step that changes paint only (color, finish) moves no element by even one pixel.
 // 3. No look changes by accident: each curated Direction is compared with a stored picture.
 //    After a deliberate change of look, store new pictures with `npm run visual:update` and review them before committing.
-import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
+import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
 import { createRequire } from 'node:module';
 import { fileURLToPath } from 'node:url';
 import { DEFAULT_PARAMS, DIRECTIONS, FONTS, SAMPLE_CONTENT, STEPS, deriveTokens, renderSmallBusiness, resolvePatch, type DesignParams, type FontId, type MockupFocus } from '@refraction/core';
@@ -13,6 +13,12 @@ import { afterAll, beforeAll, describe, expect, it, onTestFinished } from 'vites
 const require = createRequire(import.meta.url);
 const baselineDir = fileURLToPath(new URL('./baselines/', import.meta.url));
 const UPDATE = process.env['UPDATE_BASELINES'] === '1';
+// EXPERIMENT (never commit): a log, and switches read from the environment.
+const T0 = Date.now();
+const xlog = (text: string): void => { if (process.env['EXP_LOG']) appendFileSync(process.env['EXP_LOG'], `${String(Date.now() - T0).padStart(7)} ms  ${text}\n`); };
+const xnum = (name: string, fallback: number | undefined): number | undefined => (process.env[name] ? Number(process.env[name]) : fallback);
+process.on('unhandledRejection', (reason) => xlog(`UNHANDLED REJECTION: ${String(reason).slice(0, 200)}`));
+const xstate = { finished: false, commandsAfterFinish: 0, iterations: 0 };
 
 // The same font files that the Studio bundles, read from the installed packages.
 const FONT_FILES: Partial<Record<FontId, string>> = {
@@ -51,12 +57,22 @@ beforeAll(async () => {
   page = await context.newPage();
 });
 afterAll(async () => {
+  xlog(`afterAll: open contexts ${browser.contexts().length}; loop iterations ${xstate.iterations}; loop commands started after the test finished ${xstate.commandsAfterFinish}`);
   await browser.close();
 });
 
 async function loopPage(): Promise<Page> {
   const context = await browser.newContext({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1, reducedMotion: 'reduce' });
-  onTestFinished(() => context.close());
+  xlog(`loopPage: context opened; open contexts ${browser.contexts().length}`);
+  onTestFinished(async (ctx) => {
+    xstate.finished = true;
+    xlog(`onTestFinished: start; test state "${ctx.task.result?.state}"; error "${String(ctx.task.result?.errors?.[0]?.message).slice(0, 80)}"; open contexts ${browser.contexts().length}`);
+    const delay = xnum('EXP_HOOK_DELAY', 0)!;
+    if (delay) await new Promise((done) => setTimeout(done, delay));
+    const from = Date.now();
+    await context.close();
+    xlog(`onTestFinished: context.close() resolved after ${Date.now() - from} ms; open contexts ${browser.contexts().length}`);
+  });
   return context.newPage();
 }
 
@@ -191,7 +207,14 @@ describe('Mockup: fits a phone, and keeps the headline the largest text (campaig
     const wide: string[] = [];
     for (const direction of [{ name: 'plain start', params: DEFAULT_PARAMS }, ...DIRECTIONS]) {
       for (const design of reachable(direction.params)) {
-        await show(mockup(design.params, 'top'), page);
+        xstate.iterations++;
+        if (xstate.finished) { xstate.commandsAfterFinish++; xlog(`phone loop: starts a command after the test finished (iteration ${xstate.iterations})`); }
+        try {
+          await show(mockup(design.params, 'top'), page);
+        } catch (error) {
+          xlog(`phone loop: show() threw at iteration ${xstate.iterations}: ${String(error).slice(0, 160)}`);
+          throw error;
+        }
         const report = await page.evaluate(() => {
           const limit = document.documentElement.clientWidth;
           if (document.documentElement.scrollWidth <= limit) return null;
@@ -205,8 +228,9 @@ describe('Mockup: fits a phone, and keeps the headline the largest text (campaig
       }
     }
     await page.setViewportSize({ width: 1280, height: 800 });
+    xlog(`phone loop: ran to its end after ${xstate.iterations} iterations`);
     expect(wide).toEqual([]);
-  }, 240_000);
+  }, xnum('EXP_PHONE_TIMEOUT', 240_000));
 
   it('fits the window at other widths as well: a small phone, the width at which two columns begin, and wider (code review of 2026-11-13, finding "tokens 4")', async () => {
     const page = await loopPage();
@@ -240,20 +264,25 @@ describe('Mockup: fits a phone, and keeps the headline the largest text (campaig
   }, 600_000);
 
   it('shows the telephone number in the contact part on a phone, whatever the menu (code review of 2026-11-13, finding "tokens 1")', async () => {
+    const telStart = Date.now();
+    onTestFinished((ctx) => xlog(`telephone test: finished; state "${ctx.task.result?.state}"; ${Date.now() - telStart} ms`));
     await page.setViewportSize({ width: 375, height: 800 });
     const nav = STEPS.find((step) => step.id === 'nav')!;
     for (const base of [DEFAULT_PARAMS, ...['midnight-aurora', 'galactic-goth'].map((id) => DIRECTIONS.find((d) => d.id === id)!.params)]) {
       for (const option of nav.options) {
+        if (process.env['EXP_TEL_SLOW']) await new Promise((done) => setTimeout(done, Number(process.env['EXP_TEL_SLOW'])));
         await show(mockup({ ...base, ...resolvePatch(option, base) }, 'contact'));
+        xlog(`telephone test: showed a page on the shared page; viewport ${page.viewportSize()?.width}`);
         const shown = await page.evaluate(() => {
           const phone = document.querySelector<HTMLElement>('address .phone');
           return phone !== null && phone.getClientRects().length > 0 && (phone.textContent ?? '').trim().length > 0;
         });
-        expect(shown, `menu “${option.label}”`).toBe(true);
+        expect(process.env['EXP_TEL_FAIL'] ? false : shown, `menu “${option.label}”`).toBe(true);
       }
     }
     await page.setViewportSize({ width: 1280, height: 800 });
-  });
+    xlog('telephone test: body ran to its end and set the shared page back to 1280');
+  }, xnum('EXP_TEL_TIMEOUT', undefined));
 
   it('keeps the main headline the largest text: above the reading text and above every section heading, at phone, tablet, and desktop widths', async () => {
     const page = await loopPage();
@@ -327,7 +356,10 @@ describe('Mockup: no look changes by accident (decision D8)', () => {
     // that no stored picture showed it (code review of 2026-11-13, finding "gaps 2").
     for (const focus of ['top', 'services', 'contact'] as const) {
       it(`${direction.id}, region "${focus}" matches its stored picture`, async () => {
-        const current = await shrink(await shot(mockup(direction.params, focus)));
+        const raw = await shot(mockup(direction.params, focus));
+        xlog(`picture ${direction.id}-${focus}: screenshot ${raw.readUInt32BE(16)}x${raw.readUInt32BE(20)}; window.innerWidth ${await page.evaluate(() => window.innerWidth)}`);
+        const current = await shrink(raw);
+        if (UPDATE) xlog(`picture ${direction.id}-${focus}: UPDATE writes a picture taken at viewport ${page.viewportSize()?.width}`);
         const file = `${baselineDir}${direction.id}-${focus}.png`;
         if (UPDATE || !existsSync(file)) {
           expect(UPDATE, `no stored picture for ${direction.id}-${focus}; run "npm run visual:update" and review the new picture`).toBe(true);
@@ -336,6 +368,7 @@ describe('Mockup: no look changes by accident (decision D8)', () => {
           return;
         }
         const { mean, share } = await difference(readFileSync(file), current);
+        xlog(`picture ${direction.id}-${focus}: mean ${mean.toFixed(4)} share ${(share * 100).toFixed(4)}% viewport ${page.viewportSize()?.width} contexts ${browser.contexts().length}`);
         expect(mean, `mean difference per channel ${mean.toFixed(2)}; share of clearly different pixels ${(share * 100).toFixed(2)}%`).toBeLessThan(1.5);
         expect(share).toBeLessThan(0.012);
       });
```

## Appendix B: `instrument-studio.patch`

```diff
diff --git a/apps/studio/e2e/studio.e2e.ts b/apps/studio/e2e/studio.e2e.ts
index 6db9bf5..833798c 100644
--- a/apps/studio/e2e/studio.e2e.ts
+++ b/apps/studio/e2e/studio.e2e.ts
@@ -1,6 +1,6 @@
 // End-to-end tests: they drive the built Studio page in a real browser, the way a person would.
 // Run with `npm run e2e` (which builds the page first).
-import { readFileSync, writeFileSync } from 'node:fs';
+import { appendFileSync, readFileSync, writeFileSync } from 'node:fs';
 import { fileURLToPath } from 'node:url';
 import { createRequire } from 'node:module';
 import { CITED_NAMES, DIRECTIONS, FONTS, OVERLAYS, RESEARCH_RULES, STEPS, applyDirection, createProject, deriveTokens, findSkin, pick, researchReport, skinParams, skinsOf, tradeWordsOutsideBrackets, tune, vaguePhrasesIn, type Project } from '@refraction/core';
@@ -23,7 +23,12 @@ beforeAll(async () => {
   writeFileSync(fileURLToPath(blankUrl), '<!doctype html><title>Blank page for tests</title>');
   browser = await chromium.launch(LOCAL_BROWSER);
 });
+const X0 = Date.now();
+const xlog = (text: string): void => { if (process.env['EXP_LOG']) appendFileSync(process.env['EXP_LOG'], `${String(Date.now() - X0).padStart(7)} ms  ${text}\n`); };
+process.on('unhandledRejection', (reason) => xlog(`UNHANDLED REJECTION: ${String(reason).slice(0, 200)}`));
+afterEach((ctx) => xlog(`afterEach: "${ctx.task.name.slice(0, 50)}" state "${ctx.task.result?.state}"; open contexts ${browser.contexts().length}`));
 afterAll(async () => {
+  xlog(`afterAll: open contexts ${browser.contexts().length}`);
   await browser.close();
 });
 
@@ -286,8 +291,9 @@ describe('Studio: first screen', () => {
     await page.locator('.top-nav a', { hasText: 'Directions' }).click();
     await page.waitForSelector('.direction');
     expect(await page.locator('.direction').count()).toBe(DIRECTIONS.length + 6);
+    xlog('Directions test: body reached its last line; it now closes its context');
     await context.close();
-  });
+  }, process.env['EXP_STUDIO_TIMEOUT'] ? Number(process.env['EXP_STUDIO_TIMEOUT']) : undefined);
 });
 
 describe('Studio: the Step flow keeps the design the person chose', () => {
```

## Appendix C: `fake-browser.sh`

```sh
#!/bin/sh
# A harmless stand-in for a browser: it records that the test harness ran it, and with which arguments, then exits.
echo "ran as $(id -un) in $(pwd) with $# arguments: $1 $2" > "$HOME/attack/fake-browser-ran.txt"
exit 1
```
