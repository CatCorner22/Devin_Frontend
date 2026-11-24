/** Placeholder words and stock marketing phrases, in lower case with straight apostrophes. The Brief's check and the page check both use this list. */
export const PLACEHOLDER_PHRASES: readonly string[] = ['lorem ipsum', 'dolor sit amet', 'your tagline here', 'your headline here', 'your company', 'company name', 'insert text', 'placeholder', 'john doe', 'jane doe', 'example.com', '555-0', 'acme', 'welcome to our website', 'service 1', 'description goes here', 'todo', '000-000-0000', 'name@email.com', '123 main street', 'empower your', 'unlock the power', 'unleash', 'elevate your', 'revolutionize', 'supercharge', 'seamlessly', 'cutting-edge', 'next-generation', 'game-changing', 'take your business to the next level', 'in today\'s fast-paced'];

/** The five phrases that are also plain words of ordinary sentences. They count only in a short text (4 words or fewer). */
const SLOT_PHRASES: readonly string[] = ['your company', 'company name', 'placeholder', 'example.com', 'acme'];

/** The first placeholder phrase in a text, or null. A phrase counts as whole words: "unleash" is not in "unleashed". */
export function placeholderIn(text: string): string | null {
  const plain = text.slice(0, 2000).toLowerCase().replace(/’/g, '\'');
  const short = plain.trim().split(/\s+/).length <= 4;
  const found = (phrase: string): boolean => new RegExp(`(^|[^a-z0-9])${phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}${phrase === '555-0' ? '' : '($|[^a-z0-9])'}`).test(plain);
  return PLACEHOLDER_PHRASES.find((phrase) => found(phrase) && (short || !SLOT_PHRASES.includes(phrase))) ?? null;
}
