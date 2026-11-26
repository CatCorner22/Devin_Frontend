import { expect, it } from 'vitest';
import { visit } from './gate-support.js';

it('M5G-C-8: distinguishes transient page and comparison controls from saved Decisions', async () => {
  const { context, page } = await visit('#directions');
  try {
    await page.getByRole('button', { name: 'Start from Soft Daylight', exact: true }).click();
    expect(await page.locator('.view-help').count()).toBe(1);
    await page.locator('.view-help summary').click();
    expect(await page.locator('.view-help').innerText()).toContain('Reload returns to Home and the in-use choice');
    await page.locator('.view-help summary').click();
    await page.getByRole('combobox', { name: 'Preview page', exact: true }).selectOption('contact');
    await page.locator('.cards input').nth(1).press('Space');
    expect(await page.locator('.actions.sticky .primary').innerText()).toMatch(/^Pick /);
    await page.reload();
    expect(await page.getByRole('combobox', { name: 'Preview page', exact: true }).inputValue()).toBe('home');
    expect(await page.locator('.option[data-in-use] input:checked').count()).toBe(1);
  } finally { await context.close(); }
});
