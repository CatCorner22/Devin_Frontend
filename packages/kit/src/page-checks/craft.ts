// Page checks for the craft layer: details that nobody asks for and that separate careful work from quick work.
// Each function is self-contained (see neuro.ts).
import type { Finding } from '../shapes.js';

/** Numbers in a table column that do not line up, because each digit has its own width. */
export function tabularNumerals(doc: Document): Finding[] {
  const ruleId = 'craft-tabular-numerals';
  const view = doc.defaultView;
  if (!view) return [{ ruleId, status: 'could-not-measure', measured: 'the page has no window' }];
  const name = (el: Element): string => `${el.tagName.toLowerCase()}${el.id ? '#' + el.id : ''}${el.classList[0] ? '.' + el.classList[0] : ''}`;
  const cells = [...doc.querySelectorAll<HTMLElement>('td, [data-number]')].filter((el) => el.getClientRects().length > 0 && (el.textContent ?? '').length <= 200 && /^[\s$€£+\-−(]*\d[\d\s.,:%]*\)?\s*\S{0,3}$/.test(el.textContent ?? ''));
  if (cells.length === 0) return [{ ruleId, status: 'not-applicable' }];
  const out: Finding[] = [];
  // Many typefaces draw every digit at one width without being asked. The check draws two rows of digits in the cell's typeface, off the page, and compares their widths.
  const pen = doc.createElement('canvas').getContext('2d');
  const equalByNature = (style: CSSStyleDeclaration): boolean => {
    if (!pen) return false;
    pen.font = `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
    return Math.abs(pen.measureText('1111111111').width - pen.measureText('8888888888').width) < 0.01;
  };
  for (const el of cells) {
    const style = view.getComputedStyle(el);
    if (!style.fontVariantNumeric.includes('tabular-nums') && !/mono|courier/i.test(style.fontFamily) && !equalByNature(style)) out.push({ ruleId, status: 'fails', where: name(el), measured: `"${(el.textContent ?? '').trim()}" in digits of unequal width`, required: 'digits of equal width', fix: 'Set font-variant-numeric: tabular-nums on number cells.' });
  }
  return out.length > 0 ? out.slice(0, 5) : [{ ruleId, status: 'holds' }];
}

/** A heading that runs over two or more lines without balanced line lengths. */
export function balancedHeadings(doc: Document): Finding[] {
  const ruleId = 'craft-balanced-headings';
  const view = doc.defaultView;
  if (!view) return [{ ruleId, status: 'could-not-measure', measured: 'the page has no window' }];
  if (!view.CSS.supports('text-wrap', 'balance')) return [{ ruleId, status: 'could-not-measure', measured: 'this browser does not know text-wrap: balance' }];
  const name = (el: Element): string => `${el.tagName.toLowerCase()}${el.id ? '#' + el.id : ''}${el.classList[0] ? '.' + el.classList[0] : ''}`;
  const headings = [...doc.querySelectorAll<HTMLElement>('h1, h2, h3')].filter((el) => el.getClientRects().length > 0);
  const out: Finding[] = [];
  let wrapped = 0;
  for (const el of headings) {
    const style = view.getComputedStyle(el);
    // The lines are counted from where the letters themselves lie, so a logo in a heading is no line of text. A heading
    // whose lines the writer broke by hand (<br>) is not judged: text-wrap: balance cannot move such a break
    // (finding F-17 of the review of 2026-11-24).
    if (el.querySelector('br')) continue;
    const tops: number[] = [];
    const walker = doc.createTreeWalker(el, 4);
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      if ((node.textContent ?? '').trim() === '') continue;
      const range = doc.createRange();
      range.selectNodeContents(node);
      for (const rect of range.getClientRects()) if (rect.width > 0 && !tops.some((top) => Math.abs(top - rect.top) < rect.height / 2)) tops.push(rect.top);
    }
    const lines = tops.length;
    if (lines < 2) continue;
    wrapped++;
    const wrap = `${style.getPropertyValue('text-wrap')} ${style.getPropertyValue('text-wrap-style')}`;
    if (!wrap.includes('balance')) out.push({ ruleId, status: 'fails', where: name(el), measured: `a heading of ${lines} lines without balanced lines`, required: 'lines of about equal length', fix: 'Set text-wrap: balance on headings.' });
  }
  if (wrapped === 0) return [{ ruleId, status: 'not-applicable', measured: 'no heading runs over one line at this width' }];
  return out.length > 0 ? out : [{ ruleId, status: 'holds' }];
}

/** A rounded box inside a rounded box whose corner is not the outer corner less the gap between them. */
export function nestedRadii(doc: Document): Finding[] {
  const ruleId = 'craft-nested-radii';
  const view = doc.defaultView;
  if (!view) return [{ ruleId, status: 'could-not-measure', measured: 'the page has no window' }];
  const name = (el: Element): string => `${el.tagName.toLowerCase()}${el.id ? '#' + el.id : ''}${el.classList[0] ? '.' + el.classList[0] : ''}`;
  const out: Finding[] = [];
  let pairs = 0;
  for (const outer of doc.querySelectorAll<HTMLElement>('body *')) {
    const outerText = view.getComputedStyle(outer).borderTopLeftRadius;
    const outerRadius = parseFloat(outerText);
    if (!(outerRadius > 0) || outerText.includes('%') || outer.getClientRects().length === 0) continue;
    const outerBox = outer.getBoundingClientRect();
    if (outerRadius >= Math.min(outerBox.width, outerBox.height) / 2) continue;
    for (const inner of outer.children) {
      const innerText = view.getComputedStyle(inner).borderTopLeftRadius;
      const innerRadius = parseFloat(innerText);
      if (!(innerRadius > 0) || inner.getClientRects().length === 0) continue;
      const innerBox = inner.getBoundingClientRect();
      // A round shape follows no outer corner: a radius in percent, a pill (a radius far larger than the box), or a circle
      // (a box about as wide as it is high, with a radius of half its side or more).
      const side = Math.min(innerBox.width, innerBox.height);
      const square = Math.abs(innerBox.width - innerBox.height) <= side * 0.1;
      if (innerText.includes('%') || innerRadius >= 999 || (square && innerRadius >= side / 2)) continue;
      const gap = Math.min(innerBox.left - outerBox.left, innerBox.top - outerBox.top);
      if (gap <= 0 || gap >= outerRadius) continue;
      pairs++;
      const wanted = outerRadius - gap;
      if (Math.abs(innerRadius - wanted) > 2) out.push({ ruleId, status: 'fails', where: `${name(inner)} inside ${name(outer)}`, measured: `inner corner ${innerRadius} px; outer corner ${outerRadius} px; gap ${Math.round(gap)} px`, required: `inner corner about ${Math.round(wanted)} px (outer less gap)`, fix: 'Set the inner radius to the outer radius minus the padding between the two boxes.' });
    }
  }
  if (pairs === 0) return [{ ruleId, status: 'not-applicable' }];
  return out.length > 0 ? out : [{ ruleId, status: 'holds' }];
}

/** A control whose change of look takes so long that the page feels slow. */
export function shortTransitions(doc: Document): Finding[] {
  const ruleId = 'craft-short-transitions';
  const view = doc.defaultView;
  if (!view) return [{ ruleId, status: 'could-not-measure', measured: 'the page has no window' }];
  const name = (el: Element): string => `${el.tagName.toLowerCase()}${el.id ? '#' + el.id : ''}${el.classList[0] ? '.' + el.classList[0] : ''}`;
  const seconds = (text: string): number => (text.trim().endsWith('ms') ? parseFloat(text) / 1000 : parseFloat(text));
  const controls = [...doc.querySelectorAll<HTMLElement>('a[href], button, input, select, textarea, summary, [role="button"], [role="tab"]')].filter((el) => el.getClientRects().length > 0);
  if (controls.length === 0) return [{ ruleId, status: 'not-applicable' }];
  const out: Finding[] = [];
  for (const el of controls) {
    const longest = Math.max(0, ...view.getComputedStyle(el).transitionDuration.split(',').map(seconds));
    if (longest > 0.3) out.push({ ruleId, status: 'fails', where: name(el), measured: `changes its look over ${Math.round(longest * 1000)} ms`, required: 'at most 300 ms', fix: 'Set the transition of controls to between 100 and 200 ms with ease-out.' });
  }
  return out.length > 0 ? out : [{ ruleId, status: 'holds' }];
}

/** More text sizes than one scale holds. */
export function oneTypeScale(doc: Document): Finding[] {
  const ruleId = 'craft-one-type-scale';
  const view = doc.defaultView;
  if (!view) return [{ ruleId, status: 'could-not-measure', measured: 'the page has no window' }];
  // Each size, with the first element that shows it, so that a failure can say where to look.
  const first = new Map<number, string>();
  for (const el of doc.querySelectorAll<HTMLElement>('body *')) {
    if (el.getClientRects().length === 0) continue;
    const hasOwnText = [...el.childNodes].some((node) => node.nodeType === 3 && (node.textContent ?? '').trim() !== '');
    if (!hasOwnText) continue;
    const size = Math.round(parseFloat(view.getComputedStyle(el).fontSize) * 2) / 2;
    if (!first.has(size)) first.set(size, `${el.tagName.toLowerCase()}${el.id ? '#' + el.id : ''}${el.classList[0] ? '.' + el.classList[0] : ''}`);
  }
  const sizes = new Set(first.keys());
  const where = (list: number[]): string => list.slice(0, 4).map((size) => `${first.get(size) ?? '?'} (${size} px)`).join(', ');
  const list = [...sizes].sort((a, b) => a - b);
  if (list.length === 0) return [{ ruleId, status: 'not-applicable' }];
  if (list.length > 8) return [{ ruleId, status: 'fails', where: where(list), measured: `${list.length} text sizes: ${list.join(', ')} px`, required: 'at most 8', fix: 'Take every text size from one scale of tokens, and remove the sizes that are off the scale.' }];
  // Steps of a scale stand apart. Two or more pairs of neighbors less than a tenth apart are sizes that no scale holds.
  const closeOnes = list.filter((size, i) => i > 0 && size / (list[i - 1] ?? size) < 1.1);
  const close = closeOnes.length;
  if (close >= 2) return [{ ruleId, status: 'fails', where: where(closeOnes), measured: `${list.length} text sizes, ${close} of them less than a tenth above the next smaller one: ${list.join(', ')} px`, required: 'steps of one scale, each at least a tenth above the one below', fix: 'Take every text size from one scale of tokens, and remove the sizes that are off the scale.' }];
  return [{ ruleId, status: 'holds', measured: `${list.length} text sizes` }];
}

/** A picture with no stated size (the page jumps when it loads), a stretched picture, or a picture with no text alternative. */
export function pictures(doc: Document): Finding[] {
  const view = doc.defaultView;
  const ids = ['craft-picture-size', 'craft-picture-not-stretched', 'craft-picture-alt'] as const;
  if (!view) return ids.map((ruleId) => ({ ruleId, status: 'could-not-measure' as const, measured: 'the page has no window' }));
  const name = (el: Element): string => `${el.tagName.toLowerCase()}${el.id ? '#' + el.id : ''}${el.classList[0] ? '.' + el.classList[0] : ''}`;
  const images = [...doc.querySelectorAll<HTMLImageElement>('img')];
  if (images.length === 0) return ids.map((ruleId) => ({ ruleId, status: 'not-applicable' as const }));
  const fails: Finding[] = [];
  // A width and a height that the style sheet states in fixed units keep the room as the attributes do.
  const fixedInCss = (el: Element): boolean => {
    const map = (el as Element & { computedStyleMap?: () => { get(name: string): unknown } }).computedStyleMap?.();
    const fixed = (value: unknown): boolean => typeof (value as { unit?: unknown } | undefined)?.unit === 'string' && (value as { unit: string }).unit !== 'percent';
    // A fixed height with a width that is a share of the box around it (the usual card picture) keeps the room as well:
    // the height is known before the file arrives, and the width comes from the card (finding F-18 of the review of 2026-11-24).
    const stated = (value: unknown): boolean => typeof (value as { unit?: unknown } | undefined)?.unit === 'string';
    return map !== undefined && stated(map.get('width')) && fixed(map.get('height'));
  };
  for (const el of images) {
    const style = view.getComputedStyle(el);
    if (!(el.hasAttribute('width') && el.hasAttribute('height')) && style.aspectRatio === 'auto' && !fixedInCss(el)) fails.push({ ruleId: 'craft-picture-size', status: 'fails', where: name(el), measured: 'no width and height, and no aspect ratio', required: 'a stated size, so that the page keeps room for the picture', fix: 'Add the width and height attributes with the picture\'s real pixel size.' });
    const box = el.getBoundingClientRect();
    if (el.naturalWidth > 0 && el.naturalHeight > 0 && box.width > 0 && box.height > 0 && style.objectFit === 'fill') {
      const drift = (box.width / box.height) / (el.naturalWidth / el.naturalHeight);
      if (drift > 1.03 || drift < 0.97) fails.push({ ruleId: 'craft-picture-not-stretched', status: 'fails', where: name(el), measured: `drawn ${Math.round(box.width)} by ${Math.round(box.height)} px; the file is ${el.naturalWidth} by ${el.naturalHeight} px`, required: 'the proportions of the file', fix: 'Set height: auto, or object-fit: cover, on the picture.' });
    }
    if (!el.hasAttribute('alt')) fails.push({ ruleId: 'craft-picture-alt', status: 'fails', where: name(el), measured: 'no alt attribute', required: 'alt text that says what the picture shows, or alt="" for decoration', fix: 'Add an alt attribute: a description, or an empty one if the picture is decoration.' });
  }
  return ids.flatMap((ruleId) => { const found = fails.filter((f) => f.ruleId === ruleId); return found.length > 0 ? found : [{ ruleId, status: 'holds' as const }]; });
}

/** Typewriter marks in running text: straight quotation marks, two hyphens for a dash, three periods, two spaces. Two spaces count only where the browser draws both. The check reads the first 2,000 letters of each run of text. */
export function typographicMarks(doc: Document): Finding[] {
  const ruleId = 'craft-typographic-marks';
  const skip = 'code, pre, kbd, samp, script, style, textarea, input, [data-code]';
  const out: Finding[] = [];
  const walker = doc.createTreeWalker(doc.body, 4);
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const parent = node.parentElement;
    const text = (node.textContent ?? '').slice(0, 2000);
    if (!parent || parent.closest(skip) || parent.getClientRects().length === 0 || text.trim() === '') continue;
    const found = /["']/.test(text) ? 'a straight quotation mark or apostrophe' : /--/.test(text) ? 'two hyphens for a dash' : /\.\.\./.test(text) ? 'three periods for an ellipsis' : /\u00a0{2}/.test(text) || (/\S {2,}\S/.test(text) && ['pre-wrap', 'break-spaces'].includes(doc.defaultView?.getComputedStyle(parent).whiteSpace ?? '')) ? 'two spaces in a row' : null;
    if (found) out.push({ ruleId, status: 'fails', where: `${parent.tagName.toLowerCase()}: "${text.trim().slice(0, 40)}"`, measured: found, required: 'typographic marks: curly quotation marks and apostrophes, a real dash, a real ellipsis, single spaces', fix: 'Replace the typewriter mark with the typographic one.' });
  }
  return out.length > 0 ? out.slice(0, 8) : [{ ruleId, status: 'holds' }];
}

/** Parts of the page that jumped after it first drew. The browser records each jump; the function sums them (the measure called cumulative layout shift). */
export function layoutShift(doc: Document): Promise<Finding[]> {
  const ruleId = 'state-loading-keeps-size';
  const view = doc.defaultView as (Window & { PerformanceObserver?: typeof PerformanceObserver }) | null;
  const supported = view?.PerformanceObserver?.supportedEntryTypes?.includes('layout-shift') ?? false;
  if (!view || !view.PerformanceObserver || !supported) return Promise.resolve([{ ruleId, status: 'could-not-measure', measured: 'this browser does not record layout shifts' }]);
  const Observer = view.PerformanceObserver;
  return new Promise((resolve) => {
    let total = 0;
    const moved: string[] = [];
    const observer = new Observer((list) => { for (const entry of list.getEntries() as (PerformanceEntry & { value: number; hadRecentInput: boolean; sources?: { node?: Node | null }[] })[]) {
      if (entry.hadRecentInput) continue;
      total += entry.value;
      // The browser names the parts that moved, when they are still in the page.
      for (const source of entry.sources ?? []) if (source.node && source.node.nodeType === 1 && moved.length < 3) { const el = source.node as Element; const label = `${el.tagName.toLowerCase()}${el.id ? '#' + el.id : ''}${el.classList[0] ? '.' + el.classList[0] : ''}`; if (!moved.includes(label)) moved.push(label); }
    } });
    observer.observe({ type: 'layout-shift', buffered: true });
    view.setTimeout(() => {
      observer.disconnect();
      resolve(total > 0.1
        ? [{ ruleId, status: 'fails', where: moved.length > 0 ? moved.join(', ') : 'the page (the browser did not name the part that moved)', measured: `layout shift ${total.toFixed(3)}`, required: 'at most 0.1', fix: 'Keep room for content that arrives late: give pictures a size and give loading parts the height of the finished part.' }]
        : [{ ruleId, status: 'holds', measured: `layout shift ${total.toFixed(3)}` }]);
    }, 300);
  });
}
