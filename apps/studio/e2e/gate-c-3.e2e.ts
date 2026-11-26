import { expect, it } from 'vitest';
import { visit } from './gate-support.js';

it('M5G-C-3: the Contact group explains exactly when all three fields stop following', async () => {
  const { context, page } = await visit();
  try {
    const group = page.getByRole('group', { name: 'Contact page', exact: true });
    const before = await group.innerText();
    await page.getByLabel('Contact heading', { exact: true }).fill('Shared heading A');
    await page.getByLabel('Contact page introduction', { exact: true }).fill('Book your repair here.');
    await page.getByLabel('Contact heading', { exact: true }).fill('Shared heading B');
    expect(await page.getByLabel('Contact page heading', { exact: true }).inputValue()).toBe('Shared heading A');
    expect(before).toContain('Editing any one of these fields makes separate copies of all three');
    expect(await group.innerText()).toContain('All three fields now have separate values');
  } finally { await context.close(); }
});
