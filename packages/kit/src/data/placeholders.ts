/** Placeholder words and stock marketing phrases, in lower case with straight apostrophes. The Brief's check and the page check both use this list. */
export const PLACEHOLDER_PHRASES: readonly string[] = ['lorem ipsum', 'dolor sit amet', 'your tagline here', 'your headline here', 'your company', 'company name', 'insert text', 'placeholder', 'john doe', 'jane doe', 'example.com', '555-0', 'empower your', 'unlock the power', 'unleash', 'elevate your', 'revolutionize', 'supercharge', 'seamlessly', 'cutting-edge', 'next-generation', 'game-changing', 'take your business to the next level', 'in today\'s fast-paced'];

/** The first placeholder phrase in a text, or null. */
export function placeholderIn(text: string): string | null {
  const plain = text.toLowerCase().replace(/’/g, '\'');
  return PLACEHOLDER_PHRASES.find((phrase) => plain.includes(phrase)) ?? null;
}
