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
  const seconds = (text: string): number => (text.endsWith('ms') ? parseFloat(text) / 1000 : parseFloat(text));
  const out: Finding[] = [];
  for (const el of doc.querySelectorAll('marquee, blink')) out.push({ ruleId, status: 'fails', where: name(el), measured: 'text that moves or blinks without end', required: 'still text', fix: 'Replace the moving text with still text.' });
  // A pause control counts only if a person can see it.
  // Only a visible button that the builder marked for this job counts. A label that merely holds the word "stop" does not (finding F-6).
  const hasPause = [...doc.querySelectorAll('button[data-pause-motion], [role="button"][data-pause-motion]')].some((el) => el.getClientRects().length > 0 && view.getComputedStyle(el).visibility === 'visible');
  const required = 'at most 5 s, or a control that pauses it';
  const fix = 'End the movement within 5 seconds, or add a visible button that pauses it and mark it with the attribute data-pause-motion.';
  for (const el of doc.querySelectorAll('body *')) {
    const own = view.getComputedStyle(el);
    // A part that is not drawn (itself or a part around it has `display: none`) moves nothing that a person sees.
    if (own.display === 'none' || own.visibility === 'hidden' || (el.getClientRects().length === 0 && own.display !== 'contents')) continue;
    // The usual loading spinner is drawn by `::before` or `::after`, which no selector reaches; each has a style of its own
    // (finding F-4 of the review of 2026-11-24). A pseudo-element without content is not drawn.
    const styles: [string, CSSStyleDeclaration][] = [['', own]];
    for (const pseudo of ['::before', '::after']) {
      const style = view.getComputedStyle(el, pseudo);
      if (style.content !== 'none' && style.content !== 'normal' && style.display !== 'none' && style.visibility !== 'hidden') styles.push([pseudo, style]);
    }
    for (const [pseudo, style] of styles) {
      if (style.animationName === 'none') continue;
      const names = style.animationName.split(',');
      const durations = style.animationDuration.split(',').map((t) => seconds(t.trim()));
      const counts = style.animationIterationCount.split(',').map((t) => t.trim());
      let found = false;
      for (let i = 0; i < names.length && !found; i++) {
        if ((names[i] ?? '').trim() === 'none') continue;
        const duration = durations[i % durations.length] ?? 0;
        const count = counts[i % counts.length] ?? '1';
        const total = count === 'infinite' ? Infinity : duration * parseFloat(count);
        if (duration > 0 && total > 5 && !hasPause) {
          out.push({ ruleId, status: 'fails', where: name(el) + pseudo, measured: total === Infinity ? 'moves without end' : `moves for ${total.toFixed(1)} s`, required, fix });
          found = true;
        }
      }
      if (found) break;
    }
  }
  // Movement written into a drawing itself: the animation elements of SVG. No style sheet names them (finding F-4 as well).
  const clock = (text: string | null): number => {
    const t = (text ?? '').trim();
    if (t === 'indefinite') return Infinity;
    if (/^[\d.]+(ms|s|min|h)?$/.test(t)) return parseFloat(t) * (t.endsWith('ms') ? 0.001 : t.endsWith('min') ? 60 : t.endsWith('h') ? 3600 : 1);
    const parts = t.split(':').map(Number);
    return parts.length >= 2 && parts.every((n) => !Number.isNaN(n)) ? parts.reduce((sum, n) => sum * 60 + n, 0) : NaN;
  };
  for (const el of doc.querySelectorAll('svg animate, svg animateTransform, svg animateMotion')) {
    const drawing = el.closest('svg');
    const target = el.parentElement;
    if (!drawing || drawing.getClientRects().length === 0 || view.getComputedStyle(drawing).visibility === 'hidden' || !target || (target !== drawing && target.getClientRects().length === 0)) continue;
    const dur = clock(el.getAttribute('dur'));
    const repeatDur = el.getAttribute('repeatDur') === null ? NaN : clock(el.getAttribute('repeatDur'));
    const repeatCount = el.getAttribute('repeatCount') === 'indefinite' ? Infinity : parseFloat(el.getAttribute('repeatCount') ?? '1');
    // Without a duration the animation does not run. `repeatDur` bounds the whole; otherwise the whole is duration times count.
    if (Number.isNaN(dur) || dur <= 0) continue;
    const total = !Number.isNaN(repeatDur) ? (el.getAttribute('repeatCount') === null ? repeatDur : Math.min(repeatDur, dur * repeatCount)) : dur * (Number.isNaN(repeatCount) ? 1 : repeatCount);
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
    for (const node of el.childNodes) {
      if (node.nodeType !== 3) continue;
      range.selectNodeContents(node);
      for (const rect of range.getClientRects()) { lines.set(Math.round(rect.top), (lines.get(Math.round(rect.top)) ?? 0) + rect.width); drawn += rect.width; }
    }
    const letter = drawn / ownText(el).length;
    const letters = letter > 0 ? Math.round(Math.max(...lines.values()) / letter) : 0;
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
  const seen = (el: Element): boolean => el.getClientRects().length > 0 && !tiny(el) && view.getComputedStyle(el).visibility === 'visible' && parseFloat(view.getComputedStyle(el).opacity) > 0 && (el.textContent ?? '').trim().length > 0;
  const fields = [...doc.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>('input, select, textarea')].filter((el) => !['hidden', 'submit', 'button', 'reset', 'image'].includes(el.getAttribute('type') ?? '') && el.getClientRects().length > 0);
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
  const style = doc.createElement('style');
  style.textContent = '* { line-height: 1.5 !important; letter-spacing: 0.12em !important; word-spacing: 0.16em !important; } p { margin-bottom: 2em !important; }';
  doc.head.appendChild(style);
  const out: Finding[] = [];
  const seen = new Set<HTMLElement>();
  for (const el of doc.querySelectorAll<HTMLElement>('body *')) {
    // Every element that holds text of its own, also beside a line break or another element.
    if (el.getClientRects().length === 0 || ![...el.childNodes].some((node) => node.nodeType === 3 && (node.textContent ?? '').trim() !== '')) continue;
    const hides = (value: string): boolean => value === 'hidden' || value === 'clip';
    // The box that cuts the text off is the text's own box or one around it.
    let box: HTMLElement | null = el;
    let cutAcross = false;
    let cutDown = false;
    for (; box && box !== doc.body && !cutAcross && !cutDown; box = cutAcross || cutDown ? box : box.parentElement) {
      const computed: CSSStyleDeclaration = view.getComputedStyle(box);
      cutAcross = hides(computed.overflowX) && box.scrollWidth > box.clientWidth + 1;
      cutDown = hides(computed.overflowY) && box.scrollHeight > box.clientHeight + 1;
    }
    if (box && box !== doc.body && (cutAcross || cutDown) && !tiny(box) && !tiny(el) && !seen.has(box) && seen.add(box)) out.push({ ruleId, status: 'fails', where: name(box), measured: `text cut off ${cutAcross ? 'at the side' : 'at the bottom'} with wider spacing`, required: 'all text stays visible', fix: 'Remove the fixed height or width, or let the box grow with its text.' });
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
  const clips = (el: Element): boolean => ['hidden', 'clip'].includes(view?.getComputedStyle(el).overflowX ?? '');
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
    const holdsContent = (el: Element): boolean => ['IMG', 'INPUT', 'BUTTON', 'SELECT', 'TEXTAREA', 'VIDEO'].includes(el.tagName) || [...el.childNodes].some((node) => node.nodeType === 3 && (node.textContent ?? '').trim() !== '');
    const lost = [...doc.querySelectorAll('body *')].filter((el) => el.getClientRects().length > 0 && el.getBoundingClientRect().right > limit + 0.5 && holdsContent(el) && inFlow(el) && cutBy(el)).slice(0, 3);
    if (lost.length > 0) return [{ ruleId, status: 'fails', where: lost.map(name).join(', '), measured: `content lies beyond the right edge of a window of ${limit} px, and the page hides it instead of scrolling`, required: 'all content within the width of the window', fix: 'Let the named parts wrap or shrink. Do not hide the overflow of the page: it cuts content off.' }];
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
  const view = doc.defaultView as (Window & { MutationObserver?: typeof MutationObserver }) | null;
  if (!view || !view.MutationObserver) return Promise.resolve([{ ruleId, status: 'could-not-measure', measured: 'the page has no window' }]);
  const hasPause = [...doc.querySelectorAll('button[data-pause-motion], [role="button"][data-pause-motion]')].some((el) => el.getClientRects().length > 0 && view.getComputedStyle(el).visibility === 'visible');
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
  const sample = (): void => {
    const now = (view.performance.now() - start) / 1000;
    for (const el of scrollers) {
      const at = `${el.scrollLeft}|${el.scrollTop}`;
      if (at !== lastScroll.get(el)) { lastScroll.set(el, at); if (isDrawn(el)) note(scrolled, el, now); }
    }
    for (const animation of typeof doc.getAnimations === 'function' ? doc.getAnimations() : []) {
      const target = (animation.effect as KeyframeEffect | null)?.target ?? null;
      // `CSSAnimation` and `CSSTransition` come from the style sheet; a plain `Animation` comes from a script.
      if (target && animation.playState === 'running' && animation.constructor.name === 'Animation' && isDrawn(target)) note(animated, target, now);
    }
  };
  const sampler = view.setInterval(sample, 250);
  observer.observe(doc.body, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ['style', 'class', 'src', 'hidden'] });
  return new Promise((resolve) => {
    view.setTimeout(() => {
      observer.disconnect();
      view.clearInterval(sampler);
      sample();
      const required = 'at most 5 s, or a control that pauses it';
      const fix = 'End the movement within 5 seconds, or add a visible button that pauses it and mark it with the attribute data-pause-motion.';
      const last = (moments: number[]): number => moments[moments.length - 1] ?? 0;
      // One smooth scroll to a place takes well under two seconds; a box that scrolls again two seconds later and after the 5-second mark is a show.
      const slid = [...scrolled].find(([, moments]) => moments.length >= 2 && last(moments) > 5 && last(moments) - (moments[0] ?? 0) >= 2);
      // An animation that a script runs, or starts again and again, over more than five seconds.
      const ran = [...animated].find(([, moments]) => last(moments) - (moments[0] ?? 0) > 5);
      if (slid) { resolve([{ ruleId, status: 'fails', where: name(slid[0]), measured: `a script moved the scroll position of this part at ${slid[1].length} moments in 11 s, the last after ${last(slid[1]).toFixed(1)} s`, required, fix }]); return; }
      if (ran) { resolve([{ ruleId, status: 'fails', where: name(ran[0]), measured: `a script kept an animation running on this part for more than 5 s`, required, fix }]); return; }
      const moving = [...momentsOf].find(([, moments]) => moments.length >= 2 && (moments[moments.length - 1] ?? 0) > 5);
      if (moving) resolve([{ ruleId, status: 'fails', where: name(moving[0]), measured: `a script changed this part at ${moving[1].length} moments in 11 s, the last after ${(moving[1][moving[1].length - 1] ?? 0).toFixed(1)} s`, required: 'at most 5 s, or a control that pauses it', fix: 'End the movement within 5 seconds, or add a visible button that pauses it and mark it with data-pause-motion.' }]);
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
