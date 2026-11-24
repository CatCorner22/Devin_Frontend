// Page checks for the marks of a machine-made page. They warn; they never forbid. A person may want any of these on purpose.
// Each function is self-contained (see neuro.ts).
import type { Finding } from '../shapes.js';

/** Placeholder words and stock marketing phrases. The list must equal PLACEHOLDER_PHRASES in data/placeholders.ts; a test compares the two. */
export function placeholderCopy(doc: Document): Finding[] {
  const ruleId = 'tell-placeholder-copy';
  const phrases = ['lorem ipsum', 'dolor sit amet', 'your tagline here', 'your headline here', 'insert text', 'john doe', 'jane doe', '555-0', 'welcome to our website', 'service 1', 'service one', 'description goes here', 'goes here', 'sample text', 'will appear in this space', 'address line 1', 'yourdomain', '000-000-0000', 'name@email.com', 'anytown, usa', 'empower your', 'unlock the power', 'unleash', 'elevate your', 'revolutionize', 'supercharge', 'seamlessly', 'cutting-edge', 'next-generation', 'game-changing', 'take your business to the next level', 'in today\'s fast-paced', 'your company', 'company name', 'business name', 'customer name', 'placeholder', 'example.com', 'acme', 'acme inc', 'acme corp', 'acme co', 'acme corporation'];
  // A phrase counts as whole words: "unleash" is not in "unleashed". Some phrases are also plain words of ordinary sentences
  // and of forms, so they count only in a short text (4 words or fewer) that is not the label or the hint of a form field.
  const slots = ['your company', 'company name', 'business name', 'customer name', 'placeholder', 'example.com'];
  // Others are also real names and real words ("Acme Plumbing"): they count only as the whole text. "TODO" counts only in capitals,
  // as the whole text or as "TODO:"; "todo" is the Spanish word for "all".
  const whole = ['acme', 'acme inc', 'acme corp', 'acme co', 'acme corporation'];
  const edge = '[^a-z0-9]';
  const found = (text: string, phrase: string): boolean => new RegExp(`(^|${edge})${phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}${phrase === '555-0' ? '' : `($|${edge})`}`).test(text);
  const described = new Set([...doc.querySelectorAll('[aria-describedby]')].flatMap((el) => (el.getAttribute('aria-describedby') ?? '').split(/\s+/)));
  const view = doc.defaultView;
  // The text is read block by block, not text node by text node: "Lorem <b>ipsum</b>" and a line break inside a paragraph
  // are one text to the reader (finding F-14 of the review of 2026-11-24). A block is the nearest part that is not inline.
  const inline = (el: Element): boolean => !view || /^(inline|contents)/.test(view.getComputedStyle(el).display);
  const formText = 'label, legend, option, form small, form [class*="hint" i], form [class*="help" i]';
  const blocks = new Set<Element>();
  const walker = doc.createTreeWalker(doc.body, 4);
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    let el = node.parentElement;
    if (!el || el.closest('script, style, code, pre, template, noscript') || (node.textContent ?? '').trim() === '') continue;
    // The label and the hint of a form field are texts of their own, also where they are drawn inline.
    while (el !== doc.body && el.parentElement && inline(el) && !el.matches(formText)) el = el.parentElement;
    blocks.add(el);
  }
  const textOf = (block: Element): string => {
    let text = '';
    const read = (el: Element): void => {
      for (const child of el.childNodes) {
        if (text.length > 2000) return;
        if (child.nodeType === 3) text += child.textContent ?? '';
        else if (child.nodeType === 1 && (child as Element).tagName === 'BR') text += ' ';
        else if (child.nodeType === 1 && !blocks.has(child as Element) && !(child as Element).matches('script, style, code, pre, template, noscript') && inline(child as Element)) read(child as Element);
        else text += ' ';
      }
    };
    read(block);
    return text.slice(0, 2000).replace(/\s+/g, ' ').trim();
  };
  const out: Finding[] = [];
  for (const block of blocks) {
    const given = textOf(block);
    if (given === '') continue;
    const text = given.toLowerCase().replace(/’/g, '\'');
    const short = text.split(' ').length <= 4 && !block.closest(formText) && !(block.id !== '' && described.has(block.id));
    const all = text.replace(/^[^a-z0-9]+|[^a-z0-9]+$/g, '');
    const hit = /(^|[^A-Za-z0-9])TODO:|^[^A-Za-z0-9]*TODO[^A-Za-z0-9]*$/.test(given) ? 'todo' : phrases.find((phrase) => (whole.includes(phrase) ? all === phrase : found(text, phrase) && (short || !slots.includes(phrase))));
    if (hit) out.push({ ruleId, status: 'fails', where: `${block.tagName.toLowerCase()}: "${given.slice(0, 40)}"`, measured: `the phrase "${hit}"`, required: 'the owner\'s own words', fix: 'Replace the phrase with the real content from the Brief.' });
  }
  return out.length > 0 ? out.slice(0, 8) : [{ ruleId, status: 'holds' }];
}

/** Emoji used as icons in headings, buttons, and links. */
export function emojiAsIcons(doc: Document): Finding[] {
  const ruleId = 'tell-emoji-icons';
  const out: Finding[] = [];
  // ©, ® and ™ are marks of text, not pictures; a sign drawn as text (with the text selector U+FE0E) is none either.
  const emoji = /(?![©®™])\p{Extended_Pictographic}(?!\uFE0E)/u;
  const atEdge = (text: string): boolean => { const marks = [...text]; return emoji.test(marks.slice(0, 2).join('')) || emoji.test(marks.slice(-2).join('')); };
  const seen = new Set<Element>();
  const report = (el: Element, text: string): void => { if (!seen.has(el)) { seen.add(el); out.push({ ruleId, status: 'fails', where: `${el.tagName.toLowerCase()}: "${text.slice(0, 30)}"`, measured: 'an emoji used as an icon', required: 'one drawn icon set, or no icon', fix: 'Replace the emoji with an icon from one icon set (inline SVG), or remove it.' }); } };
  for (const el of doc.querySelectorAll<HTMLElement>('h1, h2, h3, h4, button, a, [class*="icon" i]')) {
    const text = (el.textContent ?? '').trim();
    if (el.getClientRects().length > 0 && atEdge(text)) report(el, text);
  }
  // An element that holds nothing but one or two emoji, directly before a heading: an icon above a card's title.
  for (const heading of doc.querySelectorAll<HTMLElement>('h2, h3, h4')) {
    const before = heading.previousElementSibling;
    const text = (before?.textContent ?? '').trim();
    if (before && before.getClientRects().length > 0 && text !== '' && [...text].length <= 4 && emoji.test(text) && !/[\p{L}\p{N}]/u.test(text)) report(before, text);
  }
  return out.length > 0 ? out.slice(0, 8) : [{ ruleId, status: 'holds' }];
}

/** A color fade from blue to purple behind a large area: the commonest look of a generated page. */
export function purpleGradient(doc: Document): Finding[] {
  const ruleId = 'tell-purple-gradient';
  const view = doc.defaultView;
  if (!view) return [{ ruleId, status: 'could-not-measure', measured: 'the page has no window' }];
  const hueOf = (r: number, g: number, b: number): number | null => {
    const max = Math.max(r, g, b), min = Math.min(r, g, b), spread = max - min;
    if (spread < 40) return null;
    const hue = max === r ? ((g - b) / spread) % 6 : max === g ? (b - r) / spread + 2 : (r - g) / spread + 4;
    return (hue * 60 + 360) % 360;
  };
  const pen = doc.createElement('canvas').getContext('2d', { willReadFrequently: true });
  if (!pen) return [{ ruleId, status: 'could-not-measure', measured: 'this browser gives no canvas to read colors with' }];
  const drawn = (color: string): [number, number, number] | null => {
    pen.clearRect(0, 0, 1, 1);
    pen.fillStyle = '#000';
    pen.fillStyle = color;
    pen.fillRect(0, 0, 1, 1);
    const pixel = pen.getImageData(0, 0, 1, 1).data;
    return (pixel[3] ?? 0) < 128 ? null : [pixel[0] ?? 0, pixel[1] ?? 0, pixel[2] ?? 0];
  };
  const out: Finding[] = [];
  // The fade is read on every element, on the page's root (<html>), and on the ::before and ::after of an element, where
  // a hero often carries it (finding F-22 of the review of 2026-11-24).
  for (const el of doc.querySelectorAll<HTMLElement>('html, body, body *')) {
    for (const pseudo of ['', '::before', '::after']) {
      const computed = view.getComputedStyle(el, pseudo === '' ? null : pseudo);
      const image = computed.backgroundImage;
      if (!image.includes('gradient')) continue;
      if (pseudo !== '' && (computed.content === 'none' || computed.display === 'none')) continue;
      if (computed.visibility !== 'visible') continue;
      const box = el.getBoundingClientRect();
      // The root paints the whole window. A ::before or ::after has no box that a script can ask for; its computed size is read.
      const area = el === doc.documentElement ? view.innerWidth * view.innerHeight : pseudo === '' ? box.width * box.height : (parseFloat(computed.width) || 0) * (parseFloat(computed.height) || 0);
      if (area < 40_000) continue;
      // A style sheet can write a color in many ways (hex, rgb, hsl, oklch, a name). The check paints each color of the fade on a
      // canvas, off the page, and reads the drawn pixel back.
      const stops = image.slice(0, 4000).match(/#[0-9a-f]{3,8}\b|\b(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch|color)\([^()]*\)/gi) ?? [];
      const hues = stops.map((stop) => { const rgb = drawn(stop); return rgb ? hueOf(rgb[0], rgb[1], rgb[2]) : null; }).filter((h): h is number => h !== null);
      if (hues.some((h) => h >= 200 && h < 250) && hues.some((h) => h >= 250 && h <= 310)) out.push({ ruleId, status: 'fails', where: `${el.tagName.toLowerCase()}${el.classList[0] ? '.' + el.classList[0] : ''}${pseudo}`, measured: 'a fade from blue to purple over a large area', required: 'the colors of the design', fix: 'Use the background that the design names; if it names a fade, use its two colors.' });
    }
  }
  return out.length > 0 ? out : [{ ruleId, status: 'holds' }];
}

/** Nearly every heading and paragraph centered: on the whole page, or within one part of it that holds six or more. */
export function everythingCentered(doc: Document): Finding[] {
  const ruleId = 'tell-all-centered';
  const view = doc.defaultView;
  if (!view) return [{ ruleId, status: 'could-not-measure', measured: 'the page has no window' }];
  const isBlock = (el: Element): boolean => ['H1', 'H2', 'H3', 'P'].includes(el.tagName) && el.getClientRects().length > 0 && (el.textContent ?? '').trim() !== '';
  const groups: { where: string; blocks: Element[] }[] = [{ where: 'the whole page', blocks: [...doc.querySelectorAll('h1, h2, h3, p')].filter(isBlock) }];
  for (const part of doc.querySelectorAll('body, body *')) {
    const own = [...part.children].filter(isBlock);
    if (own.length >= 6) groups.push({ where: `${part.tagName.toLowerCase()}${part.id ? '#' + part.id : ''}${part.classList[0] ? '.' + part.classList[0] : ''}`, blocks: own });
  }
  if ((groups[0]?.blocks.length ?? 0) < 6 && groups.length === 1) return [{ ruleId, status: 'not-applicable', measured: 'fewer than 6 headings and paragraphs' }];
  const out: Finding[] = [];
  for (const group of groups) {
    if (group.blocks.length < 6) continue;
    const centered = group.blocks.filter((el) => view.getComputedStyle(el).textAlign === 'center').length;
    if (centered / group.blocks.length > 0.8) out.push({ ruleId, status: 'fails', where: group.where, measured: `${centered} of ${group.blocks.length} headings and paragraphs are centered`, required: 'centered text only where the design asks for it', fix: 'Align reading text to the start; keep centering for the one place the design names.' });
  }
  return out.length > 0 ? out : [{ ruleId, status: 'holds' }];
}

/** A row of exactly three cards of the same build: icon, heading, one paragraph. */
export function threeSameCards(doc: Document): Finding[] {
  const ruleId = 'tell-three-icon-cards';
  const shape = (el: Element): string => [...el.children].map((child) => child.tagName).join('>');
  const out: Finding[] = [];
  for (const row of doc.querySelectorAll<HTMLElement>('body *')) {
    const cards = [...row.children].filter((card) => card.getClientRects().length > 0);
    const first = cards[0];
    if (cards.length !== 3 || !first) continue;
    const want = shape(first);
    if (!/^(SVG|IMG|SPAN|DIV|I)>H[2-4]>P$/i.test(want) || !cards.every((card) => shape(card) === want)) continue;
    const tops = cards.map((card) => Math.round(card.getBoundingClientRect().top));
    if (tops.every((top) => top === tops[0])) out.push({ ruleId, status: 'fails', where: `${row.tagName.toLowerCase()}${row.classList[0] ? '.' + row.classList[0] : ''}`, measured: 'a row of three cards of the same build: icon, heading, paragraph', required: 'the list of services that the design names', fix: 'Build this section as the design\'s Structure names it, with the real content of the Brief.' });
  }
  return out.length > 0 ? out : [{ ruleId, status: 'holds' }];
}
