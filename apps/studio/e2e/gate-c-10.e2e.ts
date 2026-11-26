import { expect, it } from 'vitest';
import { visit } from './gate-support.js';

it('M5G-C-10: Contact controls cannot retain a Home-only section', async () => {
  const { context, page } = await visit('#directions');
  try {
    await page.getByRole('button', { name: 'Start from Soft Daylight', exact: true }).click();
    const region = page.locator('#preview-region');
    await region.selectOption('services');
    await page.getByRole('combobox', { name: 'Preview page', exact: true }).selectOption('contact');
    expect(await region.inputValue()).toBe('top');
    expect(await region.locator('option[value="services"]').count()).toBe(0);
  } finally { await context.close(); }
});
