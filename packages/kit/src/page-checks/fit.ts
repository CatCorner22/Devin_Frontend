// Page check for the fit of a built page to its design: does the page use the design's token values and nothing else?
// Self-contained (see neuro.ts). It takes the tokens as a second argument: custom property name to value, as in tokens.css.
import type { Finding } from '../shapes.js';

export function tokenFit(doc: Document, tokens: Record<string, string>): Finding[] {
  // A color as CSS writes it. A color function that holds another bracket (color-mix) is not matched.
  const colorsIn = /#[0-9a-f]{3,8}\b|\b(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch|color)\([^()]*\)/gi;
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

  // Is a typeface drawn here? A browser gives no list of its typefaces. The check measures one line of text with the family
  // before each of two fallbacks; when both widths equal those of the fallbacks alone, the browser drew the fallbacks (F-32).
  // A typeface with exactly the widths of both fallbacks would be missed. Generic names (serif, system-ui) always count as drawn.
  const drawnCache = new Map<string, boolean>();
  const drawn = (face: string): boolean => {
    if (/^(serif|sans-serif|monospace|cursive|fantasy|system-ui|ui-serif|ui-sans-serif|ui-monospace|ui-rounded|math|emoji|fangsong)$/.test(face) || /["\\;{}]/.test(face)) return true;
    const cached = drawnCache.get(face);
    if (cached !== undefined) return cached;
    const width = (font: string): number => { pen.font = `72px ${font}`; return pen.measureText('mmmmmmmmlli Wgq 0123').width; };
    const result = width(`"${face}", monospace`) !== width('monospace') || width(`"${face}", serif`) !== width('serif');
    drawnCache.set(face, result);
    return result;
  };

  // The text of a style value with every url(...) taken out, so that a color written inside the address of a picture, or
  // inside a picture given as data, is not read as a color of the page. It reads from left to right: inside quotes a
  // backslash keeps the next letter, and the quote that opened the address closes it (findings C14-8 and C14-9 of 2026-11-24).
  const withoutUrls = (text: string): string => {
    let out = '';
    let i = 0;
    while (i < text.length) {
      if (text.slice(i, i + 4).toLowerCase() !== 'url(') { out += text[i]; i += 1; continue; }
      i += 4;
      while (text[i] === ' ') i += 1;
      const quote = text[i] === '"' || text[i] === "'" ? text[i] : '';
      if (quote !== '') {
        i += 1;
        while (i < text.length && text[i] !== quote) i += text[i] === '\\' ? 2 : 1;
        i += 1;
      }
      while (i < text.length && text[i] !== ')') i += text[i] === '\\' ? 2 : 1;
      i += 1;
      out += ' ';
    }
    return out;
  };
  const tokenColors = new Map<string, string>();
  const tokenFamilies = new Set<string>();
  const tokenLengths = new Set<number>();
  for (const [token, raw] of Object.entries(tokens ?? {})) {
    // A value that is not text (a number, a list) is read as text, so that one odd token cannot stop the whole check.
    const value = String(raw);
    const color = paint(value.trim());
    if (color && color !== 'clear') tokenColors.set(color, token);
    // A token for a border or a shadow holds a color among other words ("1px solid #d0d5dd"). That color is a color of the
    // design too (finding F-19 of the review of 2026-11-24). A token for a typeface is not read: "Tan" names a face there.
    else if (!/font|family/i.test(token) && /[\s,]/.test(value.trim())) {
      const text = withoutUrls(value.slice(0, 2000));
      const parts = [...(text.match(colorsIn) ?? []), ...(text.replace(/[a-z-]+\([^()]*\)/gi, ' ').match(/\b[a-z]{3,20}\b/gi) ?? []).filter((word) => !/^(inherit|initial|unset|revert|currentcolor)$/i.test(word))];
      for (const part of parts) { const inner = paint(part); if (inner && inner !== 'clear' && !tokenColors.has(inner)) tokenColors.set(inner, token); }
    }
    else if (/^-?[\d.]+(px|rem)$/.test(value.trim())) tokenLengths.add(parseFloat(value) * (value.trim().endsWith('rem') ? parseFloat(view.getComputedStyle(doc.documentElement).fontSize) : 1));
    else if (/font|family/i.test(token) && /[a-z]/i.test(value)) tokenFamilies.add(family(value));
  }
  const fails: Finding[] = [];
  const seenColors = new Set<string>();
  const reported = new Set<string>();
  const once = (finding: Finding): void => { const key = `${finding.ruleId}|${finding.measured}`; if (!reported.has(key)) { reported.add(key); fails.push(finding); } };
  for (const el of doc.querySelectorAll<HTMLElement>('body, body *')) {
    if (el.getClientRects().length === 0) continue;
    const style = view.getComputedStyle(el);
    // Inside a drawing (<svg>), the colors are those that fill a shape and those that draw its line (finding F-20 of 2026-11-24).
    if (el.closest('svg')) {
      if (!/^(path|rect|circle|ellipse|line|polyline|polygon|text|tspan)$/i.test(el.tagName) || style.visibility !== 'visible') continue;
      const inks: [string, string][] = [];
      if (!/^line$/i.test(el.tagName)) inks.push(['fill', style.fill]);
      if (parseFloat(style.strokeWidth) > 0) inks.push(['line', style.stroke]);
      for (const [part, value] of inks) {
        const color = paint(value);
        if (!color || color === 'clear') continue;
        seenColors.add(color);
        if (tokenColors.size > 0 && !tokenColors.has(color)) once({ ruleId: 'fit-colors', status: 'fails', where: name(el), measured: `${part} color ${value}`, required: 'a color of the design', fix: 'Replace the color with the design token (a custom property from tokens.css) that has this job.' });
      }
      continue;
    }
    const hasText = [...el.childNodes].some((node) => node.nodeType === 3 && (node.textContent ?? '').trim() !== '');
    const colors: [string, string][] = [['background', style.backgroundColor]];
    if (hasText) colors.push(['text', style.color]);
    for (const side of ['Top', 'Right', 'Bottom', 'Left'] as const) if (parseFloat(style[`border${side}Width`]) > 0 && style[`border${side}Style`] !== 'none') colors.push(['border', style[`border${side}Color`]]);
    // The colors inside a shadow and inside a fade, however the style sheet writes them (F-32). Only the first 2,000 letters are read.
    for (const [part, text] of [['shadow', style.boxShadow], ['background fade', style.backgroundImage.includes('gradient') ? withoutUrls(style.backgroundImage) : '']] as const) {
      for (const color of text.slice(0, 2000).match(colorsIn) ?? []) colors.push([part, color]);
    }
    // More places where a page carries a color (finding F-20 of 2026-11-24): the outline, the line under or through text, the
    // shadow of text, the fill of text, and the ::before and ::after of the element. The ring that the browser itself draws
    // around the focused control (outline-style: auto) is not the page's color.
    if (parseFloat(style.outlineWidth) > 0 && style.outlineStyle !== 'none' && style.outlineStyle !== 'auto') colors.push(['outline', style.outlineColor]);
    if (hasText) {
      if (style.textDecorationLine !== 'none') colors.push(['text line', style.textDecorationColor]);
      colors.push(['text fill', style.getPropertyValue('-webkit-text-fill-color')]);
      for (const color of style.textShadow.slice(0, 2000).match(colorsIn) ?? []) colors.push(['text shadow', color]);
    }
    for (const pseudo of ['::before', '::after']) {
      const extra = view.getComputedStyle(el, pseudo);
      if (extra.content === 'none' || extra.content === 'normal' || extra.display === 'none' || extra.visibility !== 'visible') continue;
      colors.push([`${pseudo} background`, extra.backgroundColor]);
      if (/^"[^"]/.test(extra.content)) colors.push([`${pseudo} text`, extra.color]);
      for (const edge of ['Top', 'Right', 'Bottom', 'Left'] as const) if (parseFloat(extra[`border${edge}Width`]) > 0 && extra[`border${edge}Style`] !== 'none') colors.push([`${pseudo} border`, extra[`border${edge}Color`]]);
      for (const text of [extra.boxShadow, extra.backgroundImage.includes('gradient') ? withoutUrls(extra.backgroundImage) : '']) for (const color of text.slice(0, 2000).match(colorsIn) ?? []) colors.push([`${pseudo} background`, color]);
    }
    for (const [part, value] of colors) {
      const color = paint(value);
      if (!color || color === 'clear') continue;
      seenColors.add(color);
      if (tokenColors.size > 0 && !tokenColors.has(color)) once({ ruleId: 'fit-colors', status: 'fails', where: name(el), measured: `${part} color ${value}`, required: 'a color of the design', fix: 'Replace the color with the design token (a custom property from tokens.css) that has this job.' });
    }
    if (hasText && tokenFamilies.size > 0 && tokenFamilies.has(family(style.fontFamily)) && !drawn(family(style.fontFamily))) once({ ruleId: 'fit-fonts', status: 'fails', where: name(el), measured: `typeface ${family(style.fontFamily)} is named, and this browser draws another in its place`, required: 'the typeface of the design, drawn', fix: 'Ship the font file with the page (see FONTS.md), or check the spelling of the family name.' });
    else if (hasText && tokenFamilies.size > 0 && !tokenFamilies.has(family(style.fontFamily))) once({ ruleId: 'fit-fonts', status: 'fails', where: name(el), measured: `typeface ${family(style.fontFamily)}`, required: `one of: ${[...tokenFamilies].join(', ')}`, fix: 'Set font-family from the design token.' });
    const box = el.getBoundingClientRect();
    // A round shape needs no radius of the design: a pill (a radius far larger than the box) or a circle (F-32).
    // Each of the four corners is read by itself, and a radius written as a sum (calc(13px + 0%)) is worked out in pixels;
    // a radius written as a plain percentage is not judged (finding F-20 of 2026-11-24).
    const side = Math.min(box.width, box.height);
    for (const corner of ['TopLeft', 'TopRight', 'BottomRight', 'BottomLeft'] as const) {
      // The computed value names the radius across and, when it differs, the radius down; the first is read.
      const written = /^(calc\([^()]*(?:\([^()]*\)[^()]*)*\)|\S+)/.exec(style[`border${corner}Radius`])?.[0] ?? '';
      if (/^-?[\d.]+%$/.test(written)) continue;
      let radius = 0;
      // A term behind a minus sign is taken away, as CSS does: calc(20% - 5px) on a box 100 px wide is 15 px.
      for (const term of written.matchAll(/(?:([+-])\s+)?(-?[\d.]+)(px|%)/g)) radius += (term[1] === '-' ? -1 : 1) * (term[3] === '%' ? (parseFloat(term[2] ?? '0') / 100) * box.width : parseFloat(term[2] ?? '0'));
      const round = radius >= 999 || (Math.abs(box.width - box.height) <= side * 0.1 && radius >= side / 2);
      if (radius > 0 && !round && tokenLengths.size > 0 && ![...tokenLengths].some((length) => Math.abs(length - radius) <= 0.5)) once({ ruleId: 'fit-radii', status: 'fails', where: name(el), measured: `corner radius ${Math.round(radius * 10) / 10} px`, required: 'a radius of the design', fix: 'Set border-radius from the design token.' });
    }
  }
  for (const [color, token] of tokenColors) if (!seenColors.has(color)) fails.push({ ruleId: 'fit-unused-color', status: 'fails', where: token, measured: `the page never uses the color of ${token}`, required: 'every color of the design is used, or the page has no part that needs it', fix: 'Check whether a part that should carry this color has another color.' });
  const empty: Record<(typeof ids)[number], boolean> = { 'fit-colors': tokenColors.size === 0, 'fit-fonts': tokenFamilies.size === 0, 'fit-radii': tokenLengths.size === 0, 'fit-unused-color': tokenColors.size === 0 };
  return ids.flatMap((ruleId) => { const found = fails.filter((f) => f.ruleId === ruleId); return found.length > 0 ? found.slice(0, 10) : [{ ruleId, status: empty[ruleId] ? 'not-applicable' as const : 'holds' as const }]; });
}
