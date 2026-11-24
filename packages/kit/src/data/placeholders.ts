/**
 * Placeholder words and stock marketing phrases, in lower case with straight apostrophes. The Brief's check and the page check
 * both use these three lists. The lists hold the common forms of filler; no list can know every filler, so a text that passes
 * is not shown to be the owner's own words.
 */
export const PLACEHOLDER_PHRASES: readonly string[] = ['lorem ipsum', 'dolor sit amet', 'your tagline here', 'your headline here', 'insert text', 'john doe', 'jane doe', '555-0', 'welcome to our website', 'service 1', 'service one', 'description goes here', 'goes here', 'sample text', 'will appear in this space', 'address line 1', 'yourdomain', '000-000-0000', 'name@email.com', 'anytown, usa', 'empower your', 'unlock the power', 'unleash', 'elevate your', 'revolutionize', 'supercharge', 'seamlessly', 'cutting-edge', 'next-generation', 'game-changing', 'take your business to the next level', 'in today\'s fast-paced', 'your company', 'company name', 'business name', 'customer name', 'placeholder', 'example.com', 'acme', 'acme inc', 'acme corp', 'acme co', 'acme corporation'];

/** Phrases that are also plain words of ordinary sentences. They count only in a short text (4 words or fewer). */
export const SHORT_PHRASES: readonly string[] = ['your company', 'company name', 'business name', 'customer name', 'placeholder', 'example.com'];

/**
 * Phrases that are also real names and real words ("Acme Plumbing" is a business; "todo" is Spanish for "all"). The names count only
 * when they are the whole text. "TODO" counts only in capitals, a note of the builder to itself: as the whole text, or as "TODO:" anywhere.
 * A street address such as "123 Main Street" is on no list: real businesses have that address (review of 2026-11-24, F-13).
 */
export const WHOLE_PHRASES: readonly string[] = ['acme', 'acme inc', 'acme corp', 'acme co', 'acme corporation'];

/** The first placeholder phrase in a text, or null. A phrase counts as whole words: "unleash" is not in "unleashed". Every run of white space, a line break and a no-break space among them, reads as one space. */
export function placeholderIn(text: string): string | null {
  const given = text.slice(0, 2000).replace(/\s+/g, ' ').trim();
  if (/(^|[^A-Za-z0-9])TODO:|^[^A-Za-z0-9]*TODO[^A-Za-z0-9]*$/.test(given)) return 'todo';
  const plain = given.toLowerCase().replace(/’/g, '\'');
  const short = plain.split(' ').length <= 4;
  const all = plain.replace(/^[^a-z0-9]+|[^a-z0-9]+$/g, '');
  const found = (phrase: string): boolean => new RegExp(`(^|[^a-z0-9])${phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}${phrase === '555-0' ? '' : '($|[^a-z0-9])'}`).test(plain);
  return PLACEHOLDER_PHRASES.find((phrase) => (WHOLE_PHRASES.includes(phrase) ? all === phrase : found(phrase) && (short || !SHORT_PHRASES.includes(phrase)))) ?? null;
}
