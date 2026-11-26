import { expect, it } from 'vitest';
import { SAMPLE_CONTENT, hasSampleWords, isSampleContent, type SiteContent } from '../src/index.js';

it('M5G-C-5: distinguishes complete sample matches, mixed fields and empty owner drafts without inferring authorship', () => {
  expect(isSampleContent(SAMPLE_CONTENT)).toBe(true);
  expect(hasSampleWords(SAMPLE_CONTENT)).toBe(true);
  const edited = { ...SAMPLE_CONTENT, business: 'Spoke & Wheel' };
  expect(isSampleContent(edited)).toBe(false);
  expect(hasSampleWords(edited)).toBe(true);
  expect(isSampleContent({ ...SAMPLE_CONTENT, footerNote: 'Owner footer' })).toBe(false);
  const empty = JSON.parse(JSON.stringify(SAMPLE_CONTENT), (_key, value: unknown) => typeof value === 'string' ? '' : value) as SiteContent;
  expect(hasSampleWords(empty)).toBe(false);
  expect(hasSampleWords({ ...empty, footerNote: SAMPLE_CONTENT.footerNote })).toBe(true);
  expect(hasSampleWords({ ...empty, business: SAMPLE_CONTENT.address })).toBe(false);
});
