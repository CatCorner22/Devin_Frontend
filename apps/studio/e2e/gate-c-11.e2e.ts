import { expect, it } from 'vitest';
import { visit } from './gate-support.js';

it('M5G-C-11: expanded checks explain the work without program names or unexplained metrics', async () => {
  const { context, page } = await visit('#summary');
  try {
    for (const id of ['craft-tabular-numerals', 'fit-public-links', 'fit-page-speed']) {
      const rule = page.locator(`[data-rule-id="${id}"]`);
      await rule.locator('summary').click();
      expect((await rule.locator('p').allTextContents()).join('\n')).not.toMatch(/tabularNumerals|canonical tag|LCP|INP|CLS|75th percentile|field results/);
    }
  } finally { await context.close(); }
});
