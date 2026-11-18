// Page check for the fit of a built page to its design: does the page use the design's token values and nothing else?
// Self-contained (see neuro.ts). It takes the tokens as a second argument: custom property name to value, as in tokens.css.
import type { Finding } from '../shapes.js';

export function tokenFit(doc: Document, tokens: Record<string, string>): Finding[] {
  const view = doc.defaultView;
  const ids = ['fit-colors', 'fit-fonts', 'fit-radii', 'fit-unused-color'] as const;
  if (!view) return ids.map((ruleId) => ({ ruleId, status: 'could-not-measure' as const, measured: 'the page has no window' }));
  const canvas = doc.createElement('canvas');
  canvas.width = canvas.height = 1;
  const pen = canvas.getContext('2d', { willReadFrequently: true });
  if (!pen) return ids.map((ruleId) => ({ ruleId, status: 'could-not-measure' as const, measured: 'the browser gave no canvas to compare colors on' }));
  const known = new Map<string, string | null>();
  // Every way of writing a color becomes the same four numbers, by painting one pixel with it.
  const paint = (value: string): string | null => {
    const cached = known.get(value);
    if (cached !== undefined) return cached;
    let result: string | null = null;
    if (view.CSS.supports('color', value)) {
      pen.clearRect(0, 0, 1, 1);
      pen.fillStyle = value;
      pen.fillRect(0, 0, 1, 1);
      const [r, g, b, a] = pen.getImageData(0, 0, 1, 1).data;
      result = a === 0 ? 'clear' : `${r},${g},${b},${a}`;
    }
    known.set(value, result);
    return result;
  };
  const name = (el: Element): string => `${el.tagName.toLowerCase()}${el.id ? '#' + el.id : ''}${el.classList[0] ? '.' + el.classList[0] : ''}`;
  const family = (text: string): string => (text.split(',')[0] ?? '').trim().replace(/^["']|["']$/g, '').toLowerCase();

  const tokenColors = new Map<string, string>();
  const tokenFamilies = new Set<string>();
  const tokenLengths = new Set<number>();
  for (const [token, value] of Object.entries(tokens)) {
    const color = paint(value.trim());
    if (color && color !== 'clear') tokenColors.set(color, token);
    else if (/^-?[\d.]+(px|rem)$/.test(value.trim())) tokenLengths.add(parseFloat(value) * (value.trim().endsWith('rem') ? parseFloat(view.getComputedStyle(doc.documentElement).fontSize) : 1));
    else if (/font|family/i.test(token) && /[a-z]/i.test(value)) tokenFamilies.add(family(value));
  }
  const fails: Finding[] = [];
  const seenColors = new Set<string>();
  const reported = new Set<string>();
  const once = (finding: Finding): void => { const key = `${finding.ruleId}|${finding.measured}`; if (!reported.has(key)) { reported.add(key); fails.push(finding); } };
  for (const el of doc.querySelectorAll<HTMLElement>('body, body *')) {
    if (el.getClientRects().length === 0 || el.closest('svg')) continue;
    const style = view.getComputedStyle(el);
    const hasText = [...el.childNodes].some((node) => node.nodeType === 3 && (node.textContent ?? '').trim() !== '');
    const colors: [string, string][] = [['background', style.backgroundColor]];
    if (hasText) colors.push(['text', style.color]);
    if (parseFloat(style.borderTopWidth) > 0 && style.borderTopStyle !== 'none') colors.push(['border', style.borderTopColor]);
    for (const [part, value] of colors) {
      const color = paint(value);
      if (!color || color === 'clear') continue;
      seenColors.add(color);
      if (tokenColors.size > 0 && !tokenColors.has(color)) once({ ruleId: 'fit-colors', status: 'fails', where: name(el), measured: `${part} color ${value}`, required: 'a color of the design', fix: 'Replace the color with the design token (a custom property from tokens.css) that has this job.' });
    }
    if (hasText && tokenFamilies.size > 0 && !tokenFamilies.has(family(style.fontFamily))) once({ ruleId: 'fit-fonts', status: 'fails', where: name(el), measured: `typeface ${family(style.fontFamily)}`, required: `one of: ${[...tokenFamilies].join(', ')}`, fix: 'Set font-family from the design token.' });
    const radius = parseFloat(style.borderTopLeftRadius);
    const box = el.getBoundingClientRect();
    const round = radius >= Math.min(box.width, box.height) / 2;
    if (radius > 0 && !round && !style.borderTopLeftRadius.includes('%') && tokenLengths.size > 0 && ![...tokenLengths].some((length) => Math.abs(length - radius) <= 0.5)) once({ ruleId: 'fit-radii', status: 'fails', where: name(el), measured: `corner radius ${radius} px`, required: 'a radius of the design', fix: 'Set border-radius from the design token.' });
  }
  for (const [color, token] of tokenColors) if (!seenColors.has(color)) fails.push({ ruleId: 'fit-unused-color', status: 'fails', where: token, measured: `the page never uses the color of ${token}`, required: 'every color of the design is used, or the page has no part that needs it', fix: 'Check whether a part that should carry this color has another color.' });
  const empty: Record<(typeof ids)[number], boolean> = { 'fit-colors': tokenColors.size === 0, 'fit-fonts': tokenFamilies.size === 0, 'fit-radii': tokenLengths.size === 0, 'fit-unused-color': tokenColors.size === 0 };
  return ids.flatMap((ruleId) => { const found = fails.filter((f) => f.ruleId === ruleId); return found.length > 0 ? found.slice(0, 10) : [{ ruleId, status: empty[ruleId] ? 'not-applicable' as const : 'holds' as const }]; });
}
