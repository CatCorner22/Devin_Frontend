/**
 * A short fingerprint of a design's tokens. The same tokens always give the same ID. A changed value gives another ID, with
 * these exceptions, which the ID treats as the same design: space around a name or a value, a run of spaces inside a value,
 * and capital or small letters outside quotation marks, outside url(), and outside the name of a custom property. Inside
 * those three, every letter counts ("Hero.png" and "hero.png" are two files; `var(--Brand)` and `var(--brand)` are two
 * variables). The function name `url` itself may be written in capitals. A backslash inside quotation marks keeps the next
 * letter from ending them. Quotation marks that are never closed keep every letter to the end of the value.
 * A value that is not text (a number in a token file) is read as its text; a missing value is read as the empty text.
 * A value that cannot be written as text at all (one nested many thousands deep) is read as one fixed word, and a value that holds itself as the text "[object Object]", so two such values share an ID. A big integer inside a list or an object shares an ID with the text of its digits and the letter n; a big integer that is a token's own value shares one with the text of its digits alone (and so with a number that JavaScript writes with the same digits; it does so only for a whole number below 10^21 that it can hold exactly).
 * The ID is not secret and proves nothing about who built a page: anyone can copy it. It only links a build to a design.
 * Two different designs can share an ID by chance; with 64 bits that takes about four billion designs to become likely.
 */
// A big integer is written as its digits and the letter n, so inside a list or an object it shares an ID with the text of just that (1n and "1n"); a token's own value goes through String. A value that JSON cannot write (it holds itself, or is nested too deep) is read as the text that String
// gives it. Where String cannot write it either, it is read as one fixed word: no token file holds such a value, and the ID
// must not throw (Hinshitsu audit of WU-1, adversarial finding 5).
const asText = (given: object): string => {
  try {
    return JSON.stringify(given, (_key, value: unknown) => (typeof value === 'bigint' ? `${value}n` : value)) ?? '';
  } catch {
    try {
      return String(given);
    } catch {
      return '(a value that cannot be written)';
    }
  }
};
export function designId(tokens: Readonly<Record<string, unknown>>): string {
  // One pass from left to right, and no pattern that can back up: the time grows with the length of the value and no faster
  // (finding F-27 of the review of 2026-11-24: a pattern here took 192 seconds for one value of 16,000 letters).
  const tidy = (given: unknown): string => {
    const value = (given === undefined || given === null ? '' : typeof given === 'string' ? given : typeof given === 'object' ? asText(given) : String(given as number | boolean | bigint)).trim();
    let out = '';
    // A search for a closing mark that failed from one place fails from every later place too, and is not made again.
    const noneFrom: Record<string, number> = {};
    const find = (mark: string, from: number): number => {
      if (from >= (noneFrom[mark] ?? Infinity)) return -1;
      const at = value.indexOf(mark, from);
      if (at < 0) noneFrom[mark] = from;
      return at;
    };
    // The end of a text in quotation marks that opens at `from`: a backslash takes the letter after it along.
    const closing = (quote: string, from: number): number => {
      for (let at = find(quote, from + 1); at >= 0; at = find(quote, at + 1)) {
        let slashes = 0;
        while (at - 1 - slashes > from && value.charAt(at - 1 - slashes) === '\\') slashes++;
        if (slashes % 2 === 0) return at;
      }
      return -1;
    };
    for (let i = 0; i < value.length; ) {
      const ch = value.charAt(i);
      if ((ch === 'u' || ch === 'U') && value.slice(i, i + 4).toLowerCase() === 'url(') {
        let j = i + 4;
        while (j < value.length && /\s/.test(value.charAt(j))) j++;
        const quote = value.charAt(j);
        const closed = quote === '"' || quote === "'" ? closing(quote, j) : -1;
        let end = closed >= 0 ? find(')', closed + 1) : -1;
        if (end < 0) end = find(')', j);
        if (end >= 0) { out += 'url(' + value.slice(i + 4, end + 1); i = end + 1; continue; }
      } else if (ch === '"' || ch === "'") {
        const end = closing(ch, i);
        // Never closed: every letter to the end counts.
        out += end >= 0 ? value.slice(i, end + 1) : value.slice(i);
        i = end >= 0 ? end + 1 : value.length;
        continue;
      } else if (ch === '-' && value.charAt(i + 1) === '-') {
        let j = i + 2;
        while (j < value.length && /[^\s()"',;:/]/.test(value.charAt(j))) j++;
        out += value.slice(i, j);
        i = j;
        continue;
      }
      if (/\s/.test(ch)) { while (i < value.length && /\s/.test(value.charAt(i))) i++; out += ' '; continue; }
      out += ch.toLowerCase();
      i++;
    }
    return out;
  };
  const text = Object.keys(tokens).sort().map((key) => JSON.stringify([key.trim(), tidy(tokens[key])])).join('');
  // FNV-1a, 64 bits: a public, simple way to turn a text into a number.
  let hash = 0xcbf29ce484222325n;
  const step = (byte: number): void => { hash = BigInt.asUintN(64, (hash ^ BigInt(byte)) * 0x100000001b3n); };
  for (let i = 0; i < text.length; i++) {
    const unit = text.charCodeAt(i);
    step(unit & 0xff);
    step(unit >>> 8);
  }
  return `rx-${hash.toString(16).padStart(16, '0')}`;
}
