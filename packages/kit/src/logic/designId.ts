/**
 * A short fingerprint of a design's tokens. The same tokens always give the same ID; one changed value gives another.
 * The ID is not secret and proves nothing about who built a page: anyone can copy it. It only links a build to a design.
 * Two different designs can share an ID by chance (about one pair in four billion).
 */
export function designId(tokens: Readonly<Record<string, string>>): string {
  const text = Object.keys(tokens).sort().map((key) => JSON.stringify([key.trim(), (tokens[key] ?? '').trim().toLowerCase().replace(/\s+/g, ' ')])).join('');
  // FNV-1a, 32 bits: a public, simple way to turn a text into a number.
  let hash = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    const unit = text.charCodeAt(i);
    hash = Math.imul(hash ^ (unit & 0xff), 0x01000193) >>> 0;
    hash = Math.imul(hash ^ (unit >>> 8), 0x01000193) >>> 0;
  }
  return `rx-${hash.toString(16).padStart(8, '0')}`;
}
