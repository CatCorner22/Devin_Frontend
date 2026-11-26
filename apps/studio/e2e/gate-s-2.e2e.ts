import { expect, it } from 'vitest';
import { saved, visit } from './gate-support.js';

it('M5G-S-2: typing a spoofed project name hides controls without deleting stored text', async () => {
  const { context, page } = await visit();
  try {
    await page.getByLabel('Project name', { exact: true }).fill('Invoice \u202efdp.exe');
    await expect.poll(async () => (await saved(page))?.name).toBe('Invoice \u202efdp.exe');
    expect(await page.getByLabel('Project name', { exact: true }).inputValue()).toBe('Invoice fdp.exe');
  } finally { await context.close(); }
});
