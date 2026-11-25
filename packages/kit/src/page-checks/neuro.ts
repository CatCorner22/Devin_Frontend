// Page checks for reading comfort and for the floors that protect people who are easily distracted, overloaded, or slowed by a page.
// Each function is self-contained: a checker sends its text into a browser page, so it may use nothing from outside its own body.
import type { Finding } from '../shapes.js';

/** Sound or video that starts by itself. */
export function noAutoplay(doc: Document): Finding[] {
  const ruleId = 'neuro-no-autoplay';
  const name = (el: Element): string => `${el.tagName.toLowerCase()}${el.id ? '#' + el.id : ''}${el.classList[0] ? '.' + el.classList[0] : ''}`;
  const media = [...doc.querySelectorAll<HTMLMediaElement>('video, audio')];
  if (media.length === 0) return [{ ruleId, status: 'not-applicable' }];
  const out: Finding[] = [];
  for (const el of media) {
    const silentVideo = el.tagName === 'VIDEO' && el.muted;
    // The record says that nothing starts by itself, so a silent video with controls fails too (finding F-10).
    if (el.autoplay && silentVideo && !(el.loop && !el.controls)) out.push({ ruleId, status: 'fails', where: name(el), measured: 'silent video that starts by itself', required: 'starts only when the person asks', fix: 'Remove the autoplay attribute, so that the person starts the video.' });
    else if (el.autoplay && !silentVideo) out.push({ ruleId, status: 'fails', where: name(el), measured: 'starts by itself, with sound', required: 'starts only when the person asks', fix: 'Remove the autoplay attribute, so that the person starts the sound or video.' });
    else if (el.autoplay && el.loop && !el.controls) out.push({ ruleId, status: 'fails', where: name(el), measured: 'silent video that starts by itself, repeats, and has no controls', required: 'a way to pause it', fix: 'Add the controls attribute, or remove autoplay and loop.' });
  }
  return out.length > 0 ? out : [{ ruleId, status: 'holds' }];
}

/** Movement that runs for more than five seconds, or without end, with no way to stop it. */
export function noEndlessMotion(doc: Document): Finding[] {
  const ruleId = 'neuro-motion-can-stop';
  const view = doc.defaultView;
  if (!view) return [{ ruleId, status: 'could-not-measure', measured: 'the page has no window' }];
  const name = (el: Element): string => `${el.tagName.toLowerCase()}${el.id ? '#' + el.id : ''}${el.classList[0] ? '.' + el.classList[0] : ''}`;
  const out: Finding[] = [];
  for (const el of doc.querySelectorAll('marquee, blink')) out.push({ ruleId, status: 'fails', where: name(el), measured: 'text that moves or blinks without end', required: 'still text', fix: 'Replace the moving text with still text.' });
  // A pause control counts only where a person can see it and reach it: drawn, not transparent, at least 8 by 8 pixels and
  // inside the page, with a name, with a keyboard stop, not disabled, and not hidden from screen readers
  // (finding F-10 of the review of 2026-11-24). Its size as a target is the business of the target-size rule.
  const hasPause = [...doc.querySelectorAll<HTMLElement>('button[data-pause-motion], input[type="button"][data-pause-motion], [role="button"][data-pause-motion]'), ...doc.querySelectorAll<HTMLElement>('button, input[type="button"], [role="button"]')].slice(0, 2000).some((el) => {
    if (el.getClientRects().length === 0 || view.getComputedStyle(el).visibility !== 'visible' || (typeof el.checkVisibility === 'function' && !el.checkVisibility())) return false;
    for (let up: Element | null = el; up; up = up.parentElement) if (parseFloat(view.getComputedStyle(up).opacity) < 0.1) return false;
    const box = el.getBoundingClientRect();
    const wide = Math.max(doc.documentElement.scrollWidth, view.innerWidth);
    if (box.width < 8 || box.height < 8 || box.right + view.scrollX <= 0 || box.bottom + view.scrollY <= 0 || box.left + view.scrollX >= wide) return false;
    if (el.closest('[aria-hidden="true"], [inert]') || el.matches(':disabled, [aria-disabled="true"]') || el.tabIndex < 0) return false;
    const named = `${el.getAttribute('aria-label') ?? ''}${el.tagName === 'INPUT' ? (el as HTMLInputElement).value : ''}${el.getAttribute('title') ?? ''}${el.textContent ?? ''}${[...el.querySelectorAll('img[alt]')].map((img) => img.getAttribute('alt') ?? '').join('')}${(el.getAttribute('aria-labelledby') ?? '').split(/\s+/).filter(Boolean).map((id) => doc.getElementById(id)?.textContent ?? '').join(' ')}`;
    // The mark data-pause-motion says it, and so does a name that says it in words: "Pause", or "Pause the moving text",
    // "Stop animation", "Turn off motion". A name that merely holds the word ("Bus stop finder", "Stop smoking") does not
    // (finding F-24 of the review of 2026-11-24; finding F-6 of the first review).
    const says = named.replace(/\s+/g, ' ').trim().toLowerCase();
    if (says === '') return false;
    return el.hasAttribute('data-pause-motion') || /^(pause|play ?\/ ?pause|pause ?\/ ?play)$/.test(says) || /^(pause|stop|freeze|halt|turn off|switch off|disable|reduce)\b.{0,40}\b(motion|movement|moving|animations?|slideshow|slides?|carousel|banner|ticker|video|autoplay|auto-play|scrolling|rotation)\b/.test(says);
  });
  const required = 'at most 5 s, or a control that pauses it';
  const fix = 'End the movement within 5 seconds, or add a visible button that pauses it, and name it for what it does ("Pause the movement") or mark it with the attribute data-pause-motion.';
  // The browser itself lists every animation that a style sheet started: on a part, on `body`, on any pseudo-element (the usual
  // loading spinner is drawn by `::before`; a list's `::marker` and a field's `::placeholder` blink the same way), and inside
  // an open shadow root (finding F-4 of the review of 2026-11-24; Hinshitsu audit of WU-1, adversarial finding 3). It lists
  // none for a part that is not drawn or for keyframes that do not exist. An animation that stands paused, or whose
  // keyframes change no value, moves nothing (adversarial finding 13).
  const CssAnimation = (view as Window & { CSSAnimation?: typeof CSSAnimation }).CSSAnimation;
  if (typeof doc.getAnimations !== 'function' || CssAnimation === undefined) return [{ ruleId, status: 'could-not-measure', measured: 'this browser does not list the animations of a page' }];
  const moving = new Set<string>();
  // The list of the page leaves out what runs inside a shadow root; each open root has a list of its own.
  const lists: Animation[] = [...doc.getAnimations()];
  const roots = (within: Document | ShadowRoot): void => {
    for (const el of within.querySelectorAll('*')) if (el.shadowRoot) { lists.push(...el.shadowRoot.getAnimations()); roots(el.shadowRoot); }
  };
  roots(doc);
  for (const animation of lists) {
    const effect = animation.effect;
    if (!(animation instanceof CssAnimation) || !(effect instanceof (view as Window & typeof globalThis).KeyframeEffect) || !effect.target || animation.playState !== 'running') continue;
    const el = effect.target;
    const pseudo = effect.pseudoElement ?? '';
    const style = view.getComputedStyle(el, pseudo === '' ? null : pseudo);
    if (style.visibility === 'hidden' || (el.getClientRects().length === 0 && view.getComputedStyle(el).display !== 'contents')) continue;
    const frames = effect.getKeyframes();
    const changes = [...new Set(frames.flatMap((frame) => Object.keys(frame)))].some((key) => !['offset', 'computedOffset', 'easing', 'composite'].includes(key) && new Set(frames.map((frame) => String(frame[key]))).size > 1);
    if (!changes) continue;
    const timing = effect.getComputedTiming();
    const duration = typeof timing.duration === 'number' ? timing.duration / 1000 : 0;
    const total = timing.iterations === Infinity ? Infinity : duration * (timing.iterations ?? 1);
    const where = name(el) + pseudo;
    if (duration > 0 && total > 5 && !hasPause && !moving.has(where) && moving.add(where)) out.push({ ruleId, status: 'fails', where, measured: total === Infinity ? 'moves without end' : `moves for ${total.toFixed(1)} s`, required, fix });
  }
  // The browser does not list the animation of a field's `::placeholder`; its style is read instead. The words show only
  // while the field is empty.
  for (const el of doc.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('input[placeholder], textarea[placeholder]')) {
    const style = view.getComputedStyle(el, '::placeholder');
    if (el.value !== '' || el.getClientRects().length === 0 || style.animationName === 'none' || style.animationPlayState.split(',').every((state) => state.trim() === 'paused')) continue;
    const counts = style.animationIterationCount.split(',').map((t) => t.trim());
    const total = Math.max(...style.animationDuration.split(',').map((t, i) => { const d = t.trim().endsWith('ms') ? parseFloat(t) / 1000 : parseFloat(t); const count = counts[i % counts.length] ?? '1'; return d > 0 && count === 'infinite' ? Infinity : d * parseFloat(count); }));
    if (total > 5 && !hasPause) out.push({ ruleId, status: 'fails', where: name(el) + '::placeholder', measured: total === Infinity ? 'moves without end' : `moves for ${total.toFixed(1)} s`, required, fix });
  }
  // Movement written into a drawing itself: the animation elements of SVG. No style sheet names them (finding F-4 as well).
  const clock = (text: string | null): number => {
    const t = (text ?? '').trim();
    if (t === 'indefinite') return Infinity;
    if (/^[\d.]+(ms|s|min|h)?$/.test(t)) return parseFloat(t) * (t.endsWith('ms') ? 0.001 : t.endsWith('min') ? 60 : t.endsWith('h') ? 3600 : 1);
    const parts = t.split(':').map(Number);
    return parts.length >= 2 && parts.every((n) => !Number.isNaN(n)) ? parts.reduce((sum, n) => sum * 60 + n, 0) : NaN;
  };
  const timed = [...doc.querySelectorAll('svg animate, svg animateTransform, svg animateMotion, svg set')];
  // An animation that begins when another one ends, and that the other one waits for in turn, runs in a ring without end
  // (Hinshitsu audit of WU-1, adversarial finding 3). `a.end` names the animation with the id `a`.
  const waitsFor = (el: Element): string[] => [...(el.getAttribute('begin') ?? '').matchAll(/([A-Za-z_][\w-]*)\.(?:end|begin|repeat)/g)].map((m) => m[1] ?? '');
  const inRing = (el: Element): boolean => {
    const seen = new Set<Element>();
    const walk = (at: Element): boolean => waitsFor(at).some((id) => {
      const next = doc.getElementById(id);
      if (!next || !timed.includes(next)) return false;
      if (next === el) return true;
      if (seen.has(next)) return false;
      seen.add(next);
      return walk(next);
    });
    return walk(el);
  };
  for (const el of timed) {
    const drawing = el.closest('svg');
    // The part that moves is the one that `href` names, or else the one that holds the animation.
    const ref = (el.getAttribute('href') ?? el.getAttribute('xlink:href') ?? '').replace(/^#/, '');
    const target = ref !== '' ? doc.getElementById(ref) : el.parentElement;
    if (!drawing || drawing.getClientRects().length === 0 || view.getComputedStyle(drawing).visibility === 'hidden' || !target || ((target as Element) !== drawing && target.getClientRects().length === 0)) continue;
    // An animation whose only beginning is "indefinite" waits for a script or for a link that names it. On a page that holds
    // neither, nothing starts it (adversarial finding 13). Where a script is present the check cannot know, and counts it.
    if ((el.getAttribute('begin') ?? '').trim() === 'indefinite' && doc.scripts.length === 0 && (el.id === '' || ![...doc.querySelectorAll('a')].some((a) => (a.getAttribute('href') ?? a.getAttribute('xlink:href')) === '#' + el.id))) continue;
    const ring = inRing(el);
    const dur = clock(el.getAttribute('dur'));
    const repeatDur = el.getAttribute('repeatDur') === null ? NaN : clock(el.getAttribute('repeatDur'));
    const repeatCount = el.getAttribute('repeatCount') === 'indefinite' ? Infinity : parseFloat(el.getAttribute('repeatCount') ?? '1');
    // Without a duration the animation does not run. `repeatDur` bounds the whole; otherwise the whole is duration times count.
    if (Number.isNaN(dur) || dur <= 0) continue;
    // An `end` written as a time stops the animation then, whatever its count says. "indefinite" names no time.
    const end = clock(el.getAttribute('end'));
    const begin = clock(el.getAttribute('begin'));
    const lasts = ring ? Infinity : !Number.isNaN(repeatDur) ? (el.getAttribute('repeatCount') === null ? repeatDur : Math.min(repeatDur, dur * repeatCount)) : dur * (Number.isNaN(repeatCount) ? 1 : repeatCount);
    const total = Number.isFinite(end) && end >= 0 ? Math.min(lasts, Math.max(0, end - (Number.isFinite(begin) ? begin : 0))) : lasts;
    if (total > 5 && !hasPause) out.push({ ruleId, status: 'fails', where: `${name(drawing)} ${el.tagName}`, measured: total === Infinity ? 'a drawing that moves without end' : `a drawing that moves for ${total.toFixed(1)} s`, required, fix });
  }
  return out.length > 0 ? out : [{ ruleId, status: 'holds' }];
}

/** A page that reloads or moves the person elsewhere on a timer. */
export function noTimedReload(doc: Document): Finding[] {
  const ruleId = 'neuro-no-time-limit';
  const refresh = doc.querySelector('meta[http-equiv="refresh" i]');
  if (!refresh) return [{ ruleId, status: 'holds' }];
  return [{ ruleId, status: 'fails', where: 'meta[http-equiv="refresh"]', measured: `the page reloads or moves by itself (${refresh.getAttribute('content') ?? ''})`, required: 'no time limit, or a limit that the person can extend', fix: 'Remove the timed reload, so that the person decides when to move on.' }];
}

/** Reading text: size, line height, line length, and alignment. */
export function readingComfort(doc: Document): Finding[] {
  const view = doc.defaultView;
  if (!view) return [{ ruleId: 'neuro-line-length', status: 'could-not-measure', measured: 'the page has no window' }];
  const name = (el: Element): string => `${el.tagName.toLowerCase()}${el.id ? '#' + el.id : ''}${el.classList[0] ? '.' + el.classList[0] : ''}`;
  // Reading text: any part that holds 120 letters or more of its own (not counting what its children hold), whatever its tag.
  // Builders put text in a `div` as often as in a `p` (finding F-21 of 2026-11-18).
  const ownText = (el: Element): string => [...el.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent ?? '').join(' ').replace(/\s+/g, ' ').trim();
  const blocks = [...doc.querySelectorAll<HTMLElement>('body *:not(script):not(style):not(textarea):not(option):not(pre):not(code):not(svg *)')].filter((el) => el.getClientRects().length > 0 && ownText(el).length >= 120);
  const ids = ['neuro-line-length', 'neuro-line-height', 'neuro-text-size', 'neuro-no-justified-text'] as const;
  if (blocks.length === 0) return ids.map((ruleId) => ({ ruleId, status: 'not-applicable' as const }));
  const fails: Finding[] = [];
  for (const el of blocks) {
    const style = view.getComputedStyle(el);
    const size = parseFloat(style.fontSize);
    // The letters of the longest drawn line: the width of that line, divided by the mean width of a letter of this very text
    // (the width of all lines over the count of letters). This measures the text, not its box (finding F-22 of 2026-11-18).
    const lines = new Map<number, number>();
    const range = doc.createRange();
    let drawn = 0;
    // Text set in columns: a line ends at the edge of its column, so two pieces at one height in two columns are two lines
    // (finding F-21 of the review of 2026-11-24). The columns are told apart by their place across the box that makes them.
    let columns: Element | null = el;
    while (columns && view.getComputedStyle(columns).columnCount === 'auto' && view.getComputedStyle(columns).columnWidth === 'auto') columns = columns.parentElement;
    const column = (left: number): number => {
      if (!columns) return 0;
      const made = view.getComputedStyle(columns);
      const gap = made.columnGap === 'normal' ? parseFloat(made.fontSize) : parseFloat(made.columnGap) || 0;
      const inner = columns.clientWidth - parseFloat(made.paddingLeft) - parseFloat(made.paddingRight);
      const asked = parseFloat(made.columnWidth);
      const count = Math.max(1, Math.min(parseInt(made.columnCount, 10) || Infinity, asked > 0 ? Math.floor((inner + gap) / (asked + gap)) : Infinity));
      if (!Number.isFinite(count) || count < 2) return 0;
      const start = columns.getBoundingClientRect().left + parseFloat(made.borderLeftWidth) + parseFloat(made.paddingLeft);
      return Math.max(0, Math.min(count - 1, Math.floor((left - start + gap / 2) / ((inner + gap) / count))));
    };
    for (const node of el.childNodes) {
      if (node.nodeType !== 3) continue;
      range.selectNodeContents(node);
      for (const rect of range.getClientRects()) { const key = Math.round(rect.top) + column(rect.left) * 1e6; lines.set(key, (lines.get(key) ?? 0) + rect.width); drawn += rect.width; }
    }
    const letter = drawn / ownText(el).length;
    // The longest line is found in a loop: a text of many thousand lines is too long to hand to Math.max at once
    // (finding F-27 of the review of 2026-11-24).
    let longest = 0;
    for (const width of lines.values()) if (width > longest) longest = width;
    const letters = letter > 0 ? Math.round(longest / letter) : 0;
    if (letters > 80) fails.push({ ruleId: 'neuro-line-length', status: 'fails', where: name(el), measured: `about ${letters} letters in a line`, required: 'at most 80', fix: 'Give the text a max-width of about 65ch.' });
    const lineHeight = style.lineHeight === 'normal' ? 1.2 : parseFloat(style.lineHeight) / size;
    if (lineHeight < 1.5) fails.push({ ruleId: 'neuro-line-height', status: 'fails', where: name(el), measured: `line height ${lineHeight.toFixed(2)}${style.lineHeight === 'normal' ? ' (the browser\'s default, taken as 1.2)' : ''}`, required: 'at least 1.5', fix: 'Set line-height to 1.5 or more on reading text.' });
    if (size < 16) fails.push({ ruleId: 'neuro-text-size', status: 'fails', where: name(el), measured: `${size} px`, required: 'at least 16 px', fix: 'Set reading text to 1rem or larger.' });
    if (style.textAlign === 'justify') fails.push({ ruleId: 'neuro-no-justified-text', status: 'fails', where: name(el), measured: 'justified text', required: 'text aligned to one side', fix: 'Set text-align to start.' });
  }
  return ids.flatMap((ruleId) => { const found = fails.filter((f) => f.ruleId === ruleId); return found.length > 0 ? found : [{ ruleId, status: 'holds' as const }]; });
}

/** A field whose only name is the pale text inside it, which disappears at the first letter typed. */
export function visibleLabels(doc: Document): Finding[] {
  const ruleId = 'neuro-visible-label';
  const name = (el: Element): string => `${el.tagName.toLowerCase()}${el.id ? '#' + el.id : ''}${el.getAttribute('name') ? '[name=' + el.getAttribute('name') + ']' : ''}`;
  const view = doc.defaultView;
  if (!view) return [{ ruleId, status: 'could-not-measure', measured: 'the page has no window' }];
  // Text that a builder hides on purpose for screen readers: a box of one pixel, clipped away, or moved off the page (F-12, F-13).
  const tiny = (el: Element): boolean => {
    const box = el.getBoundingClientRect();
    const computed = view.getComputedStyle(el);
    return box.width <= 1.5 || box.height <= 1.5 || box.right <= 0 || box.bottom + view.scrollY <= 0 || /^rect\(0(px)?,? 0(px)?,? 0(px)?,? 0(px)?\)$/.test(computed.clip) || /inset\((50|100)%/.test(computed.clipPath);
  };
  // The usual spam trap: a field that no person meets. It sits inside a part marked aria-hidden="true", and it is moved off
  // the page, shrunk to a pixel, or clipped away, so neither the eye nor a screen reader finds it; only a program fills it in
  // (finding F-5 of the review of 2026-11-24). All three signs are needed: a field that people can see is judged like any other.
  // A part around the field that is shrunk to a pixel hides the field only where it also cuts off what reaches past its edge:
  // without that the field is drawn in full and a person meets it (Hinshitsu audit of WU-1, adversarial finding 12).
  const cuts = (computed: CSSStyleDeclaration): boolean => [computed.overflowX, computed.overflowY].every((o) => o === 'hidden' || o === 'clip');
  const unmet = (el: Element): boolean => {
    // The third sign: the trap is out of the Tab order. A field that the Tab key still reaches is met by a person;
    // inside an inert part the Tab key reaches nothing, whatever the field's tabindex says.
    if (!el.closest('[aria-hidden="true"]') || ((el as HTMLElement).tabIndex >= 0 && !el.closest('[inert]'))) return false;
    for (let at: Element | null = el; at && at !== doc.body; at = at.parentElement) {
      const box = at.getBoundingClientRect();
      const computed = view.getComputedStyle(at);
      if (((box.width <= 1.5 || box.height <= 1.5) && (at === el || cuts(computed))) || box.right <= 0 || box.bottom + view.scrollY <= 0 || parseFloat(computed.opacity) === 0 || /^rect\(0(px)?,? 0(px)?,? 0(px)?,? 0(px)?\)$/.test(computed.clip) || /inset\((50|100)%/.test(computed.clipPath)) return true;
    }
    return false;
  };
  // A label written in a clear color is drawn and cannot be read (finding F-12 of the review of 2026-11-24). The computed
  // color names its own share of ink last: "rgba(0, 0, 0, 0)", or "... / 0)" in the newer ways of writing a color.
  // A label in the very color of the ground behind it is not caught here; the contrast rule answers for that.
  const clear = (color: string): boolean => { const share = /^rgba\([^)]*,\s*([\d.]+)\)$/.exec(color)?.[1] ?? /\/\s*([\d.]+)(%?)\)$/.exec(color)?.[1]; return share !== undefined && parseFloat(share) < (/%\)$/.test(color) ? 10 : 0.1); };
  const seen = (el: Element): boolean => { const computed = view.getComputedStyle(el); return el.getClientRects().length > 0 && !tiny(el) && computed.visibility === 'visible' && parseFloat(computed.opacity) > 0 && !clear(computed.color) && !clear(computed.getPropertyValue('-webkit-text-fill-color')) && (el.textContent ?? '').trim().length > 0; };
  const fields = [...doc.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>('input, select, textarea')].filter((el) => !['hidden', 'submit', 'button', 'reset', 'image'].includes(el.getAttribute('type') ?? '') && el.getClientRects().length > 0 && !unmet(el));
  if (fields.length === 0) return [{ ruleId, status: 'not-applicable' }];
  const out: Finding[] = [];
  for (const el of fields) {
    const labels = [...(el.labels ?? [])].filter(seen);
    const byId = (el.getAttribute('aria-labelledby') ?? '').split(/\s+/).filter(Boolean).map((id) => doc.getElementById(id)).filter((ref) => ref !== null && seen(ref));
    if (labels.length === 0 && byId.length === 0) out.push({ ruleId, status: 'fails', where: name(el), measured: el.getAttribute('placeholder') ? 'only pale text inside the field names it' : 'no visible name', required: 'a visible label that stays while the person types', fix: 'Add a <label> element with visible text and tie it to the field with for and id.' });
  }
  return out.length > 0 ? out : [{ ruleId, status: 'holds' }];
}

/** The text-spacing test of WCAG 1.4.12: with wider spacing set by the reader, no text may be cut off. The function sets the spacing, measures, and removes it. */
export function survivesTextSpacing(doc: Document): Finding[] {
  const ruleId = 'neuro-text-spacing';
  const view = doc.defaultView;
  if (!view) return [{ ruleId, status: 'could-not-measure', measured: 'the page has no window' }];
  const name = (el: Element): string => `${el.tagName.toLowerCase()}${el.id ? '#' + el.id : ''}${el.classList[0] ? '.' + el.classList[0] : ''}`;
  // Text that a builder hides on purpose for screen readers: a box of one pixel, clipped away, or moved off the page (F-12, F-13).
  const tiny = (el: Element): boolean => {
    const box = el.getBoundingClientRect();
    const computed = view.getComputedStyle(el);
    return box.width <= 1.5 || box.height <= 1.5 || box.right <= 0 || box.bottom + view.scrollY <= 0 || /^rect\(0(px)?,? 0(px)?,? 0(px)?,? 0(px)?\)$/.test(computed.clip) || /inset\((50|100)%/.test(computed.clipPath);
  };
  const hides = (value: string): boolean => value === 'hidden' || value === 'clip';
  // The box that cuts the text off is the text's own box or one around it. What counts is where the letters themselves lie:
  // a box that hides an ornament which reaches over its edge, while every word stays inside, cuts no text
  // (finding F-6 of the review of 2026-11-24).
  type Cut = { box: HTMLElement; across: boolean; beside: boolean };
  const cutOf = (el: HTMLElement): Cut | null => {
    const letters: DOMRect[] = [];
    for (const node of el.childNodes) {
      if (node.nodeType !== 3 || (node.textContent ?? '').trim() === '') continue;
      const range = doc.createRange();
      range.selectNodeContents(node);
      letters.push(...range.getClientRects());
    }
    for (let box: HTMLElement | null = el; box && box !== doc.body; box = box.parentElement) {
      const computed = view.getComputedStyle(box);
      if (!hides(computed.overflowX) && !hides(computed.overflowY)) continue;
      const outer = box.getBoundingClientRect();
      const left = outer.left + box.clientLeft;
      const top = outer.top + box.clientTop;
      const right = left + box.clientWidth;
      const bottom = top + box.clientHeight;
      const across = hides(computed.overflowX) && letters.some((r) => r.width > 0 && (r.right > right + 1 || r.left < left - 1));
      const down = hides(computed.overflowY) && letters.some((r) => r.height > 0 && (r.bottom > bottom + 1 || r.top < top - 1));
      if (across || down) return { box, across, beside: letters.every((r) => r.left >= right || r.right <= left) };
    }
    return null;
  };
  // Every element that holds text of its own, also beside a line break or another element.
  const texts = [...doc.querySelectorAll<HTMLElement>('body *')].filter((el) => el.getClientRects().length > 0 && [...el.childNodes].some((node) => node.nodeType === 3 && (node.textContent ?? '').trim() !== ''));
  // Text that lay wholly to the left or right of the same box before the spacing grew is not this floor's fault: a slide that
  // waits beside the one in view (Hinshitsu audit of WU-1, adversarial finding 7). Text that was cut in part, or that lay
  // below the box, still fails: a box of fixed height that loses its last lines is the fault this floor names.
  const before = new Map<HTMLElement, Cut | null>(texts.map((el) => [el, cutOf(el)]));
  const style = doc.createElement('style');
  style.textContent = '* { line-height: 1.5 !important; letter-spacing: 0.12em !important; word-spacing: 0.16em !important; } p { margin-bottom: 2em !important; }';
  doc.head.appendChild(style);
  const out: Finding[] = [];
  const seen = new Set<HTMLElement>();
  for (const el of texts) {
    const cut = cutOf(el);
    const was = before.get(el);
    if (!cut || (was && was.box === cut.box && was.beside)) continue;
    if (!tiny(cut.box) && !tiny(el) && !seen.has(cut.box) && seen.add(cut.box)) out.push({ ruleId, status: 'fails', where: name(cut.box), measured: `text cut off ${cut.across ? 'at the side' : 'at the bottom'} with wider spacing`, required: 'all text stays visible', fix: 'Remove the fixed height or width, or let the box grow with its text.' });
  }
  style.remove();
  return out.length > 0 ? out : [{ ruleId, status: 'holds' }];
}

/** Sideways scrolling at the present window width. The checker sets the width (320 pixels for the reflow floor) before it calls this. */
export function noSidewaysScroll(doc: Document): Finding[] {
  const ruleId = 'neuro-reflow';
  const root = doc.documentElement;
  const limit = root.clientWidth;
  // The floor is defined at 320 pixels. At any other width the answer would say nothing about it (finding F-2 of 2026-11-18).
  const windowWidth = doc.defaultView?.innerWidth ?? 0;
  if (windowWidth !== 320) return [{ ruleId, status: 'could-not-measure', measured: `the window is ${windowWidth} px wide; this floor is measured at 320 px` }];
  const name = (el: Element): string => `${el.tagName.toLowerCase()}${el.id ? '#' + el.id : ''}${el.classList[0] ? '.' + el.classList[0] : ''}`;
  const view = doc.defaultView;
  // A page that hides its sideways overflow does not scroll, and what lies beyond the edge is lost instead (finding F-11).
  // Only parts in the ordinary flow count: a drawer or a slide that waits beside the page is placed there on purpose.
  // A box cuts its content off when it hides its overflow, or when `contain` tells the browser to paint nothing past its edge.
  const clips = (el: Element): boolean => { const computed = view?.getComputedStyle(el); return ['hidden', 'clip'].includes(computed?.overflowX ?? '') || /\b(paint|strict|content)\b/.test(computed?.contain ?? ''); };
  // The part that hides it may be the page itself or any box around the content: a wrapper `div` with `overflow: hidden` is as
  // common as the rule on `body` (finding F-2 of the review of 2026-11-24). A box that cuts its own text with an ellipsis on
  // purpose is not counted.
  const cutBy = (el: Element): boolean => {
    for (let at: Element | null = el.parentElement; at; at = at.parentElement) if (clips(at) && view?.getComputedStyle(at).textOverflow !== 'ellipsis') return true;
    return false;
  };
  if (view && root.scrollWidth <= limit) {
    const inFlow = (el: Element): boolean => {
      for (let at: Element | null = el; at && at !== doc.body; at = at.parentElement) {
        const computed = view.getComputedStyle(at);
        if (computed.position === 'absolute' || computed.position === 'fixed' || computed.transform !== 'none' || computed.visibility !== 'visible' || (at !== el && ['auto', 'scroll'].includes(computed.overflowX))) return false;
      }
      return true;
    };
    // Content is a control, a picture that says something (an empty alt marks an ornament), a drawing, a frame, or text. Text
    // is measured by its letters and not by its box: a line that will not wrap runs out of a box that is itself narrow enough,
    // and a box pulled to the left loses its first words there (Hinshitsu audit of WU-1, adversarial findings 2 and 7).
    const holdsContent = (el: Element): boolean => ['input', 'button', 'select', 'textarea', 'video', 'canvas', 'svg', 'iframe', 'object'].includes(el.tagName.toLowerCase()) || (el.tagName === 'IMG' && el.getAttribute('alt') !== '');
    const lettersLost = (el: Element): boolean => [...el.childNodes].some((node) => {
      if (node.nodeType !== 3 || (node.textContent ?? '').trim() === '') return false;
      const range = doc.createRange();
      range.selectNodeContents(node);
      return [...range.getClientRects()].some((r) => r.width > 0 && (r.right > limit + 0.5 || (r.left < -0.5 && r.right > 0.5)));
    });
    const lost = [...doc.querySelectorAll('body *')].filter((el) => el.getClientRects().length > 0 && ((holdsContent(el) && el.getBoundingClientRect().right > limit + 0.5) || lettersLost(el)) && inFlow(el) && cutBy(el)).slice(0, 3);
    if (lost.length > 0) return [{ ruleId, status: 'fails', where: lost.map(name).join(', '), measured: `content lies beyond the edge of a window of ${limit} px, and the page hides it instead of scrolling`, required: 'all content within the width of the window', fix: 'Let the named parts wrap or shrink. Do not hide the overflow of the page: it cuts content off.' }];
  }
  if (root.scrollWidth <= limit) return [{ ruleId, status: 'holds', measured: `${limit} px wide` }];
  const culprits = [...doc.querySelectorAll('body *')].filter((el) => el.getClientRects().length > 0 && el.getBoundingClientRect().right > limit + 0.5).slice(0, 3);
  return [{ ruleId, status: 'fails', where: culprits.map(name).join(', '), measured: `the page is ${root.scrollWidth} px wide in a window of ${limit} px`, required: 'no sideways scrolling', fix: 'Let the named parts wrap or shrink: remove fixed widths and add max-width: 100%.' }];
}

/**
 * Movement that a script drives (the usual carousel) leaves no mark in the style sheet. This check watches the page for 11 seconds
 * and fails when parts of the page change at two moments or more, the last of them after the 5-second mark, and no pause control is in view
 * (finding F-9 of 2026-11-18). It cannot see movement drawn on a canvas, or a change that comes less often than every 5 seconds.
 */
export function noScriptedMotion(doc: Document): Promise<Finding[]> {
  const ruleId = 'neuro-motion-can-stop';
  const view = doc.defaultView as (Window & { MutationObserver?: typeof MutationObserver; CSSAnimation?: typeof CSSAnimation; CSSTransition?: typeof CSSTransition }) | null;
  if (!view || !view.MutationObserver) return Promise.resolve([{ ruleId, status: 'could-not-measure', measured: 'the page has no window' }]);
  // A pause control counts only where a person can see it and reach it: drawn, not transparent, at least 8 by 8 pixels and
  // inside the page, with a name, with a keyboard stop, not disabled, and not hidden from screen readers
  // (finding F-10 of the review of 2026-11-24). Its size as a target is the business of the target-size rule.
  const hasPause = [...doc.querySelectorAll<HTMLElement>('button[data-pause-motion], input[type="button"][data-pause-motion], [role="button"][data-pause-motion]'), ...doc.querySelectorAll<HTMLElement>('button, input[type="button"], [role="button"]')].slice(0, 2000).some((el) => {
    if (el.getClientRects().length === 0 || view.getComputedStyle(el).visibility !== 'visible' || (typeof el.checkVisibility === 'function' && !el.checkVisibility())) return false;
    for (let up: Element | null = el; up; up = up.parentElement) if (parseFloat(view.getComputedStyle(up).opacity) < 0.1) return false;
    const box = el.getBoundingClientRect();
    const wide = Math.max(doc.documentElement.scrollWidth, view.innerWidth);
    if (box.width < 8 || box.height < 8 || box.right + view.scrollX <= 0 || box.bottom + view.scrollY <= 0 || box.left + view.scrollX >= wide) return false;
    if (el.closest('[aria-hidden="true"], [inert]') || el.matches(':disabled, [aria-disabled="true"]') || el.tabIndex < 0) return false;
    const named = `${el.getAttribute('aria-label') ?? ''}${el.tagName === 'INPUT' ? (el as HTMLInputElement).value : ''}${el.getAttribute('title') ?? ''}${el.textContent ?? ''}${[...el.querySelectorAll('img[alt]')].map((img) => img.getAttribute('alt') ?? '').join('')}${(el.getAttribute('aria-labelledby') ?? '').split(/\s+/).filter(Boolean).map((id) => doc.getElementById(id)?.textContent ?? '').join(' ')}`;
    // The mark data-pause-motion says it, and so does a name that says it in words: "Pause", or "Pause the moving text",
    // "Stop animation", "Turn off motion". A name that merely holds the word ("Bus stop finder", "Stop smoking") does not
    // (finding F-24 of the review of 2026-11-24; finding F-6 of the first review).
    const says = named.replace(/\s+/g, ' ').trim().toLowerCase();
    if (says === '') return false;
    return el.hasAttribute('data-pause-motion') || /^(pause|play ?\/ ?pause|pause ?\/ ?play)$/.test(says) || /^(pause|stop|freeze|halt|turn off|switch off|disable|reduce)\b.{0,40}\b(motion|movement|moving|animations?|slideshow|slides?|carousel|banner|ticker|video|autoplay|auto-play|scrolling|rotation)\b/.test(says);
  });
  if (hasPause) return Promise.resolve([{ ruleId, status: 'holds', measured: 'a pause control is in view' }]);
  const name = (el: Element): string => `${el.tagName.toLowerCase()}${el.id ? '#' + el.id : ''}${el.classList[0] ? '.' + el.classList[0] : ''}`;
  const start = view.performance.now();
  // Movement is one part that changes again and again. Two parts that each change once (content that arrives late) are not movement.
  const momentsOf = new Map<Element, number[]>();
  const wasDrawn = new Set<Element>();
  // Drawn: the part has a box, or (a part with `display: contents` has none) what it holds has one.
  const isDrawn = (el: Element): boolean => {
    if (el.getClientRects().length > 0) return true;
    const range = doc.createRange();
    range.selectNodeContents(el);
    return range.getClientRects().length > 0;
  };
  for (const el of doc.querySelectorAll('body *')) if (isDrawn(el)) wasDrawn.add(el);
  const observer = new view.MutationObserver((records) => {
    const now = (view.performance.now() - start) / 1000;
    const seenNow = new Set<Element>();
    for (const r of records) {
      // A carousel is turned by whatever its style sheet reads: a class, a style, a picture's address, and as often a data
      // attribute, an ARIA state, or a custom property on the root (Hinshitsu audit of WU-1, adversarial finding 8). Another
      // attribute (an id, a title, a value) changes nothing that the style sheet of an ordinary page draws by.
      if (r.type === 'attributes' && !/^(style|class|src|srcset|hidden|open|data-.+|aria-.+)$/.test(r.attributeName ?? '')) continue;
      const el = r.target.nodeType === 1 ? (r.target as Element) : r.target.parentElement;
      // A part that a script has just hidden counts too: a slide that is shown at one moment and hidden at the next has changed
      // twice, and so a show of slides is found even when no slide is shown twice. A part that was hidden before the change
      // and is hidden after it has changed nothing that a person sees, and does not count.
      const drawnNow = el !== null && isDrawn(el);
      const drawn = el !== null && (drawnNow || wasDrawn.has(el));
      // A part that is hidden takes all that it holds out of sight with it, and brings it back when it is shown again.
      if (el && drawnNow !== wasDrawn.has(el)) {
        if (drawnNow) { wasDrawn.add(el); for (const inner of el.querySelectorAll('*')) if (isDrawn(inner)) wasDrawn.add(inner); }
        else { wasDrawn.delete(el); for (const inner of el.querySelectorAll('*')) wasDrawn.delete(inner); }
      }
      if (!el || seenNow.has(el) || !drawn || el.tagName === 'STYLE' || el.tagName === 'SCRIPT' || el.tagName === 'HEAD') continue;
      seenNow.add(el);
      const moments = momentsOf.get(el) ?? [];
      if (moments.length === 0 || now - (moments[moments.length - 1] ?? 0) >= 0.9) moments.push(now);
      momentsOf.set(el, moments);
    }
  });
  // Two kinds of movement leave no mark in the page's tree, so the observer above never hears of them: a script that moves
  // the scroll position of a box (the usual sliding carousel), and a script that starts an animation through `element.animate()`
  // (finding F-3 of the review of 2026-11-24). No person uses the page during the check, so every such change is the page's own.
  // The check looks four times a second. Movement that the style sheet declares belongs to `noEndlessMotion` and is left to it.
  const scrolled = new Map<Element, number[]>();
  const animated = new Map<Element, number[]>();
  const scrollers = [...doc.querySelectorAll('body *'), doc.scrollingElement ?? doc.documentElement].filter((el) => isDrawn(el) && (el.scrollWidth > el.clientWidth + 1 || el.scrollHeight > el.clientHeight + 1));
  const lastScroll = new Map<Element, string>(scrollers.map((el) => [el, `${el.scrollLeft}|${el.scrollTop}`]));
  const note = (into: Map<Element, number[]>, el: Element, now: number): void => {
    const moments = into.get(el) ?? [];
    if (moments.length === 0 || now - (moments[moments.length - 1] ?? 0) >= 0.9) moments.push(now);
    into.set(el, moments);
  };
  // An animation that the style sheet made (noEndlessMotion judges those). A browser without these two classes has no such animation to tell apart.
  const fromStyleSheet = (animation: Animation): boolean => (view.CSSAnimation !== undefined && animation instanceof view.CSSAnimation) || (view.CSSTransition !== undefined && animation instanceof view.CSSTransition);
  const sample = (): void => {
    const now = (view.performance.now() - start) / 1000;
    for (const el of scrollers) {
      const at = `${el.scrollLeft}|${el.scrollTop}`;
      if (at !== lastScroll.get(el)) { lastScroll.set(el, at); if (isDrawn(el)) note(scrolled, el, now); }
    }
    for (const animation of typeof doc.getAnimations === 'function' ? doc.getAnimations() : []) {
      const target = (animation.effect as KeyframeEffect | null)?.target ?? null;
      // `CSSAnimation` and `CSSTransition` come from the style sheet; a plain `Animation` comes from a script.
      if (target && animation.playState === 'running' && !fromStyleSheet(animation) && isDrawn(target)) note(animated, target, now);
    }
  };
  const sampler = view.setInterval(sample, 250);
  observer.observe(doc.documentElement, { subtree: true, childList: true, characterData: true, attributes: true });
  return new Promise((resolve) => {
    view.setTimeout(() => {
      observer.disconnect();
      view.clearInterval(sampler);
      sample();
      const required = 'at most 5 s, or a control that pauses it';
      const fix = 'End the movement within 5 seconds, or add a visible button that pauses it, and name it for what it does ("Pause the movement") or mark it with the attribute data-pause-motion.';
      const last = (moments: number[]): number => moments[moments.length - 1] ?? 0;
      // One smooth scroll to a place takes well under two seconds; a box that scrolls again two seconds later and after the 5-second mark is a show.
      const slid = [...scrolled].find(([, moments]) => moments.length >= 2 && last(moments) > 5 && last(moments) - (moments[0] ?? 0) >= 2);
      // An animation that a script runs, or starts again and again, over more than five seconds.
      const ran = [...animated].find(([, moments]) => last(moments) - (moments[0] ?? 0) > 5);
      if (slid) { resolve([{ ruleId, status: 'fails', where: name(slid[0]), measured: `a script moved the scroll position of this part at ${slid[1].length} moments in 11 s, the last after ${last(slid[1]).toFixed(1)} s`, required, fix }]); return; }
      if (ran) { resolve([{ ruleId, status: 'fails', where: name(ran[0]), measured: `a script kept an animation running on this part for more than 5 s`, required, fix }]); return; }
      const moving = [...momentsOf].find(([, moments]) => moments.length >= 2 && (moments[moments.length - 1] ?? 0) > 5);
      if (moving) resolve([{ ruleId, status: 'fails', where: name(moving[0]), measured: `a script changed this part at ${moving[1].length} moments in 11 s, the last after ${(moving[1][moving[1].length - 1] ?? 0).toFixed(1)} s`, required, fix }]);
      else resolve([{ ruleId, status: 'holds', measured: 'no repeated change in 11 s' }]);
    }, 11000);
  });
}

/**
 * Parts of the page that no check of this kit looks into: a frame, and the inside of a web component (a shadow root).
 * A fault there is invisible to every other check, so this check answers "could not measure" for every floor that a page check
 * measures, and the grade is then "Not graded" (finding F-5 of 2026-11-18).
 */
export function unseenParts(doc: Document): Finding[] {
  const floors = ['neuro-no-autoplay', 'neuro-motion-can-stop', 'neuro-no-time-limit', 'neuro-visible-label', 'neuro-text-spacing', 'neuro-reflow', 'behavior-keyboard-reach', 'behavior-focus-visible', 'behavior-target-size', 'behavior-control-name', 'behavior-dialog-marked', 'craft-picture-alt'];
  const name = (el: Element): string => `${el.tagName.toLowerCase()}${el.id ? '#' + el.id : ''}`;
  const parts: string[] = [];
  for (const el of doc.querySelectorAll('iframe, frame, object, embed')) if (el.getClientRects().length > 0) parts.push(name(el));
  // Only a part that the other checks cannot read counts. A web component without a shadow root keeps its content in the page,
  // where every check reads it. A closed shadow root cannot be told from none; a component that uses one goes unreported.
  // A component in a part that is not drawn shows nothing, and hides nothing from the checks. A component with no box of its own
  // (display: contents) still counts when something inside it is drawn.
  for (const el of doc.querySelectorAll('body *')) if (el.shadowRoot && (el.getClientRects().length > 0 || [...el.shadowRoot.querySelectorAll('*')].some((inner) => inner.getClientRects().length > 0))) parts.push(name(el));
  if (parts.length === 0) return [];
  const measured = `the checks cannot see inside ${parts.slice(0, 5).join(', ')}${parts.length > 5 ? ` and ${parts.length - 5} more` : ''}`;
  return floors.map((ruleId) => ({ ruleId, status: 'could-not-measure' as const, where: parts[0], measured }));
}
