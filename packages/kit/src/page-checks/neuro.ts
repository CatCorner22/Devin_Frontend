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
    if (el.autoplay && !silentVideo) out.push({ ruleId, status: 'fails', where: name(el), measured: 'starts by itself, with sound', required: 'starts only when the person asks', fix: 'Remove the autoplay attribute, so that the person starts the sound or video.' });
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
  const hasPause = doc.querySelector('[data-pause-motion], [aria-label*="pause" i], [aria-label*="stop" i]') !== null;
  for (const el of doc.querySelectorAll('body *')) {
    const style = view.getComputedStyle(el);
    if (style.animationName === 'none' || style.display === 'none' || style.visibility === 'hidden') continue;
    const names = style.animationName.split(',');
    const durations = style.animationDuration.split(',').map((t) => seconds(t.trim()));
    const counts = style.animationIterationCount.split(',').map((t) => t.trim());
    for (let i = 0; i < names.length; i++) {
      const duration = durations[i % durations.length] ?? 0;
      const count = counts[i % counts.length] ?? '1';
      const total = count === 'infinite' ? Infinity : duration * parseFloat(count);
      if (duration > 0 && total > 5 && !hasPause) {
        out.push({ ruleId, status: 'fails', where: name(el), measured: total === Infinity ? 'moves without end' : `moves for ${total.toFixed(1)} s`, required: 'at most 5 s, or a control that pauses it', fix: 'End the movement within 5 seconds, or add a visible button that pauses it.' });
        break;
      }
    }
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
  const blocks = [...doc.querySelectorAll<HTMLElement>('p, li, dd, blockquote')].filter((el) => (el.textContent ?? '').trim().length >= 120 && el.getClientRects().length > 0);
  const ids = ['neuro-line-length', 'neuro-line-height', 'neuro-text-size', 'neuro-no-justified-text'] as const;
  if (blocks.length === 0) return ids.map((ruleId) => ({ ruleId, status: 'not-applicable' as const }));
  const fails: Finding[] = [];
  const probe = doc.createElement('span');
  probe.textContent = '0000000000';
  probe.style.visibility = 'hidden';
  probe.style.position = 'absolute';
  for (const el of blocks) {
    const style = view.getComputedStyle(el);
    const size = parseFloat(style.fontSize);
    el.appendChild(probe);
    const letter = probe.getBoundingClientRect().width / 10;
    probe.remove();
    const width = el.getBoundingClientRect().width - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
    const letters = letter > 0 ? Math.round(width / letter) : 0;
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
  const fields = [...doc.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>('input, select, textarea')].filter((el) => !['hidden', 'submit', 'button', 'reset', 'image'].includes(el.getAttribute('type') ?? '') && el.getClientRects().length > 0);
  if (fields.length === 0) return [{ ruleId, status: 'not-applicable' }];
  const out: Finding[] = [];
  for (const el of fields) {
    const labels = [...(el.labels ?? [])].filter((label) => label.getClientRects().length > 0 && (label.textContent ?? '').trim().length > 0);
    const byId = (el.getAttribute('aria-labelledby') ?? '').split(/\s+/).filter(Boolean).map((id) => doc.getElementById(id)).filter((ref) => ref !== null && ref.getClientRects().length > 0);
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
  const style = doc.createElement('style');
  style.textContent = '* { line-height: 1.5 !important; letter-spacing: 0.12em !important; word-spacing: 0.16em !important; } p { margin-bottom: 2em !important; }';
  doc.head.appendChild(style);
  const out: Finding[] = [];
  const seen = new Set<HTMLElement>();
  for (const el of doc.querySelectorAll<HTMLElement>('body *')) {
    if (el.getClientRects().length === 0 || el.children.length > 0 || (el.textContent ?? '').trim() === '') continue;
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
    if (box && box !== doc.body && (cutAcross || cutDown) && !seen.has(box) && seen.add(box)) out.push({ ruleId, status: 'fails', where: name(box), measured: `text cut off ${cutAcross ? 'at the side' : 'at the bottom'} with wider spacing`, required: 'all text stays visible', fix: 'Remove the fixed height or width, or let the box grow with its text.' });
  }
  style.remove();
  return out.length > 0 ? out : [{ ruleId, status: 'holds' }];
}

/** Sideways scrolling at the present window width. The checker sets the width (320 pixels for the reflow floor) before it calls this. */
export function noSidewaysScroll(doc: Document): Finding[] {
  const ruleId = 'neuro-reflow';
  const root = doc.documentElement;
  const limit = root.clientWidth;
  if (root.scrollWidth <= limit) return [{ ruleId, status: 'holds', measured: `${limit} px wide` }];
  const name = (el: Element): string => `${el.tagName.toLowerCase()}${el.id ? '#' + el.id : ''}${el.classList[0] ? '.' + el.classList[0] : ''}`;
  const culprits = [...doc.querySelectorAll('body *')].filter((el) => el.getClientRects().length > 0 && el.getBoundingClientRect().right > limit + 0.5).slice(0, 3);
  return [{ ruleId, status: 'fails', where: culprits.map(name).join(', '), measured: `the page is ${root.scrollWidth} px wide in a window of ${limit} px`, required: 'no sideways scrolling', fix: 'Let the named parts wrap or shrink: remove fixed widths and add max-width: 100%.' }];
}
