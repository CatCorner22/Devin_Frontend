/**
 * A short fingerprint of a design's tokens. The same tokens always give the same ID. A changed value gives another ID, with
 * these exceptions, which the ID treats as the same design: space around a name or a value, a run of spaces inside a value,
 * and capital or small letters outside quotation marks and outside url(). Inside those two, every letter counts
 * ("Hero.png" and "hero.png" are two files).
 * The ID is not secret and proves nothing about who built a page: anyone can copy it. It only links a build to a design.
 * Two different designs can share an ID by chance; with 64 bits that takes about four billion designs to become likely.
 */
export function designId(tokens: Readonly<Record<string, string>>): string {
  const tidy = (value: string): string => value.trim().replace(/url\(\s*(?:"[^"]*"|'[^']*'|[^)]*)[^)]*\)|"[^"]*"|'[^']*'|[^"'u]+|[\s\S]/gi, (part) => (/^(url\(|"|')/i.test(part) ? part : part.toLowerCase().replace(/\s+/g, ' ')));
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
