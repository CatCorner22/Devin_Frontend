// Page checks for the marks of a machine-made page. They warn; they never forbid. A person may want any of these on purpose.
// Each function is self-contained (see neuro.ts).
import type { Finding } from '../shapes.js';

/** Placeholder words and stock marketing phrases. The list must equal PLACEHOLDER_PHRASES in data/placeholders.ts; a test compares the two. */
export function placeholderCopy(doc: Document): Finding[] {
  const ruleId = 'tell-placeholder-copy';
  const phrases = ['lorem ipsum', 'dolor sit amet', 'your tagline here', 'your headline here', 'your company', 'company name', 'insert text', 'placeholder', 'john doe', 'jane doe', 'example.com', '555-0', 'empower your', 'unlock the power', 'unleash', 'elevate your', 'revolutionize', 'supercharge', 'seamlessly', 'cutting-edge', 'next-generation', 'game-changing', 'take your business to the next level', 'in today\'s fast-paced'];
  const out: Finding[] = [];
  const walker = doc.createTreeWalker(doc.body, 4);
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const parent = node.parentElement;
    const text = (node.textContent ?? '').toLowerCase().replace(/’/g, '\'');
    if (!parent || parent.closest('script, style, code, pre') || text.trim() === '') continue;
    const hit = phrases.find((phrase) => text.includes(phrase));
    if (hit) out.push({ ruleId, status: 'fails', where: `${parent.tagName.toLowerCase()}: "${text.trim().slice(0, 40)}"`, measured: `the phrase "${hit}"`, required: 'the owner\'s own words', fix: 'Replace the phrase with the real content from the Brief.' });
  }
  return out.length > 0 ? out.slice(0, 8) : [{ ruleId, status: 'holds' }];
}

/** Emoji used as icons in headings, buttons, and links. */
export function emojiAsIcons(doc: Document): Finding[] {
  const ruleId = 'tell-emoji-icons';
  const out: Finding[] = [];
  for (const el of doc.querySelectorAll<HTMLElement>('h1, h2, h3, h4, button, a, [class*="icon" i]')) {
    const text = (el.textContent ?? '').trim();
    if (el.getClientRects().length > 0 && /^\p{Extended_Pictographic}|\p{Extended_Pictographic}$/u.test(text)) out.push({ ruleId, status: 'fails', where: `${el.tagName.toLowerCase()}: "${text.slice(0, 30)}"`, measured: 'an emoji used as an icon', required: 'one drawn icon set, or no icon', fix: 'Replace the emoji with an icon from one icon set (inline SVG), or remove it.' });
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
  const out: Finding[] = [];
  for (const el of doc.querySelectorAll<HTMLElement>('body, body *')) {
    const image = view.getComputedStyle(el).backgroundImage;
    const box = el.getBoundingClientRect();
    if (!image.includes('gradient') || box.width * box.height < 40_000) continue;
    const hues = [...image.matchAll(/rgba?\((\d+),\s*(\d+),\s*(\d+)/g)].map((m) => hueOf(Number(m[1]), Number(m[2]), Number(m[3]))).filter((h): h is number => h !== null);
    if (hues.some((h) => h >= 200 && h < 250) && hues.some((h) => h >= 250 && h <= 310)) out.push({ ruleId, status: 'fails', where: `${el.tagName.toLowerCase()}${el.classList[0] ? '.' + el.classList[0] : ''}`, measured: 'a fade from blue to purple over a large area', required: 'the colors of the design', fix: 'Use the background that the design names; if it names a fade, use its two colors.' });
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
