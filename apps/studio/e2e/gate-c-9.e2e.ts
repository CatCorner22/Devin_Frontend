import { expect, it } from 'vitest';
import { visit } from './gate-support.js';

it('M5G-C-9: Undo describes a page-text edit without claiming to replace the project', async () => {
  const { context, page } = await visit();
  try {
    await page.getByLabel('What your business does', { exact: true }).fill('We fix bikes');
    await page.getByLabel('Business name', { exact: true }).fill('Spoke & Wheel');
    await page.getByRole('button', { name: 'Undo', exact: true }).click();
    expect(await page.locator('.banner').innerText()).toContain('page text');
    expect(await page.getByLabel('What your business does', { exact: true }).inputValue()).toBe('We fix bikes');
  } finally { await context.close(); }
});
