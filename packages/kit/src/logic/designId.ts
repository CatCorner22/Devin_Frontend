/**
 * A short fingerprint of a design's tokens. The same tokens always give the same ID. A changed value gives another ID, with
 * these exceptions, which the ID treats as the same design: space around a name or a value, a run of spaces inside a value,
 * and capital or small letters outside quotation marks and outside url(). Inside those two, every letter counts
 * ("Hero.png" and "hero.png" are two files).
 * The ID is not secret and proves nothing about who built a page: anyone can copy it. It only links a build to a design.
 * Two different designs can share an ID by chance; with 64 bits that takes about four billion designs to become likely.
 */
export function designId(tokens: Readonly<Record<string, string>>): string {
  // One pass from left to right, and no pattern that can back up: the time grows with the length of the value and no faster
  // (finding F-27 of the review of 2026-11-24: a pattern here took 192 seconds for one value of 16,000 letters).
  const tidy = (given: string): string => {
    const value = String(given).trim();
    let out = '';
    // A search for a closing mark that failed from one place fails from every later place too, and is not made again.
    const noneFrom: Record<string, number> = {};
    const find = (mark: string, from: number): number => {
      if (from >= (noneFrom[mark] ?? Infinity)) return -1;
      const at = value.indexOf(mark, from);
      if (at < 0) noneFrom[mark] = from;
      return at;
    };
    for (let i = 0; i < value.length; ) {
      const ch = value.charAt(i);
      let end = -1;
      if ((ch === 'u' || ch === 'U') && value.slice(i, i + 4).toLowerCase() === 'url(') {
        let j = i + 4;
        while (j < value.length && /\s/.test(value.charAt(j))) j++;
        const quote = value.charAt(j);
        const closed = quote === '"' || quote === "'" ? find(quote, j + 1) : -1;
        end = closed >= 0 ? find(')', closed + 1) : -1;
        if (end < 0) end = find(')', j);
      } else if (ch === '"' || ch === "'") {
        end = find(ch, i + 1);
      }
      if (end >= 0) { out += value.slice(i, end + 1); i = end + 1; continue; }
      if (/\s/.test(ch)) { while (i < value.length && /\s/.test(value.charAt(i))) i++; out += ' '; continue; }
      out += ch.toLowerCase();
      i++;
    }
    return out;
  };
  const text = Object.keys(tokens).sort().map((key) => JSON.stringify([key.trim(), tidy(tokens[key] ?? '')])).join('');
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
