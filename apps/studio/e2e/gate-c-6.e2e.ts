import { expect, it } from 'vitest';
import { visit } from './gate-support.js';

it('M5G-C-6: Directions describes the immediate switch when there are no Decisions', async () => {
  const { context, page } = await visit('#directions');
  try {
    await page.getByRole('button', { name: 'Start from Soft Daylight', exact: true }).click();
    await page.locator('.top-nav a[href="#directions"]').press('Enter');
    expect(await page.locator('.intro').innerText()).toContain('switches immediately');
    await page.getByRole('button', { name: 'Start from Graphite Precision', exact: true }).click();
    await page.locator('#step-title').waitFor();
    expect(await page.getByRole('dialog').count()).toBe(0);
  } finally { await context.close(); }
});
