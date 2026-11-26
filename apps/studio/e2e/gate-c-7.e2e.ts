import { expect, it } from 'vitest';
import { saved, visit } from './gate-support.js';

it('M5G-C-7: tells the owner how to add a reason before the first Pick', async () => {
  const { context, page } = await visit('#directions');
  try {
    await page.getByRole('button', { name: 'Start from Soft Daylight', exact: true }).click();
    expect(await page.locator('.options').innerText()).toContain('To add an optional reason after picking, return to this Step');
    const stepHash = new URL(page.url()).hash;
    await page.locator('.cards input').first().press('Space');
    await page.locator('.actions.sticky .primary').press('Enter');
    await page.waitForFunction((hash) => location.hash !== hash, stepHash);
    await page.locator(`a[href="${stepHash}"]`).first().press('Enter');
    await page.locator('#decision-reason').fill('Visitors use phones.');
    await expect.poll(async () => (await saved(page))?.decisions[stepHash.slice(1)]?.reason).toBe('Visitors use phones.');
  } finally { await context.close(); }
});
