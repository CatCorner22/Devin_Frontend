import { expect, it } from 'vitest';
import { visit } from './gate-support.js';

it('M5G-C-5: partly edited content is labelled as a mixture, not wholly owner words or wholly sample', async () => {
  const { context, page } = await visit();
  try {
    await page.getByLabel('Business name', { exact: true }).fill('Spoke & Wheel');
    expect(await page.locator('.brief-editor').innerText()).toContain('Some page fields still match the sample');
    expect(await page.locator('.sample-tag').innerText()).not.toBe('Sample website');
    await page.locator('.top-nav a[href="#directions"]').press('Enter');
    expect(await page.locator('.intro').innerText()).toContain('Some page fields still match the sample');
  } finally { await context.close(); }
});
