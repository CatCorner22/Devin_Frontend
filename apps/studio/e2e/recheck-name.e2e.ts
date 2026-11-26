import { expect, it } from 'vitest';
import { createProject } from '../../../packages/core/src/index.js';
import { saved, visit } from './gate-support.js';

it('M5R-1: opening and saving an old name preserves hidden formatting characters', async () => {
  const { context, page } = await visit('#summary');
  const name = 'Invoice \u202efdp.exe';
  try {
    const project = { ...createProject(), name };
    await page.locator('#project-file').setInputFiles({ name: 'old.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(project)) });
    await expect.poll(async () => (await saved(page))?.name).toBe(name);
    expect(await page.locator('body').innerText()).toContain('The saved name is unchanged.');
    expect(await page.locator('#project-name').inputValue()).toBe('Invoice fdp.exe');
    await page.reload();
    await page.locator('#project-name:enabled').waitFor();
    expect((await saved(page)).name).toBe(name);
    expect(await page.locator('#project-name').inputValue()).toBe('Invoice fdp.exe');
  } finally { await context.close(); }
});
