/**
 * Placeholder words and stock marketing phrases, in lower case with straight apostrophes. The Brief's check and the page check
 * both use these three lists. The lists hold the common forms of filler; no list can know every filler, so a text that passes
 * is not shown to be the owner's own words.
 */
export const PLACEHOLDER_PHRASES: readonly string[] = ['lorem ipsum', 'dolor sit amet', 'your tagline here', 'your headline here', 'insert text', 'john doe', 'jane doe', '555-0', 'welcome to our website', 'service 1', 'service one', 'description goes here', 'headline goes here', 'title goes here', 'text goes here', 'content goes here', 'copy goes here', 'image goes here', 'logo goes here', 'name goes here', 'sample text', 'will appear in this space', 'address line 1', 'yourdomain', '000-000-0000', 'name@email.com', 'anytown, usa', 'empower your', 'unlock the power', 'unleash the power', 'unleash your potential', 'unleash your team', 'unleash your business', 'unleash the full', 'elevate your', 'revolutionize', 'supercharge', 'seamlessly', 'cutting-edge', 'next-generation', 'game-changing', 'take your business to the next level', 'in today\'s fast-paced', 'your company', 'company name', 'business name', 'customer name', 'placeholder', 'example.com', 'acme', 'acme inc', 'acme corp', 'acme co', 'acme corporation'];

/** Phrases that are also plain words of ordinary sentences. They count only in a short text (4 words or fewer). */
export const SHORT_PHRASES: readonly string[] = ['your company', 'company name', 'business name', 'customer name', 'placeholder', 'example.com'];

/**
 * Phrases that are also real names and real words ("Acme Plumbing" is a business; "todo" is Spanish for "all"). The names count only
 * when they are the whole text. "TODO" counts only in capitals, a note of the builder to itself: as the whole text, or as "TODO:" anywhere.
 * "Service 1" and "Address line 1" are also plain words ("Bus service 1 runs to the centre"; the row of a table of addresses), so
 * they too count only as the whole text (Hinshitsu audit of WU-1, adversarial finding 6).
 * A street address such as "123 Main Street" is on no list: real businesses have that address (review of 2026-11-24, F-13).
 */
export const WHOLE_PHRASES: readonly string[] = ['acme', 'acme inc', 'acme corp', 'acme co', 'acme corporation', 'service 1', 'address line 1'];

/** The first placeholder phrase in a text, or null. A phrase counts as whole words: "sample text" is not in "sample textile". Every run of white space, a line break and a no-break space among them, reads as one space. */
export function placeholderIn(text: string): string | null {
  const given = text.slice(0, 2000).replace(/\s+/g, ' ').trim();
  if (/(^|[^A-Za-z0-9])TODO:|^[^A-Za-z0-9]*TODO[^A-Za-z0-9]*$/.test(given)) return 'todo';
  const plain = given.toLowerCase().replace(/’/g, '\'');
  const short = plain.split(' ').length <= 4;
  const all = plain.replace(/^[^a-z0-9]+|[^a-z0-9]+$/g, '');
  // "555-0" is the made-up number of North America, which follows an area code of three digits or none: "0113 555-0142" is a
  // number of another country (Hinshitsu audit of WU-1, correctness finding 9).
  // It is written with a leading 0, with that in brackets, or with "+" and a country code other than 1 before 3 or 4 digits ("+1" is North America itself).
  // Such a number is taken out whole before the made-up number is looked for, so it excuses only itself.
  const local = plain.replace(/(?:(?<!\d)0\d{3,4}|\(0\d{3,4}\)|(?<![a-z0-9])\+(?!1[ .-])\d{1,3}[ .-]\d{3,4})[ .-]555-0\d{3}(?!\d)/g, ' ');
  const found = (phrase: string): boolean => new RegExp(`(^|[^a-z0-9])${phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}${phrase === '555-0' ? '' : '($|[^a-z0-9])'}`).test(phrase === '555-0' ? local : plain);
  return PLACEHOLDER_PHRASES.find((phrase) => (WHOLE_PHRASES.includes(phrase) ? all === phrase : found(phrase) && (short || !SHORT_PHRASES.includes(phrase)))) ?? null;
}
