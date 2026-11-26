import { expect, it } from 'vitest';
import { browser, pageUrl, saved } from './gate-support.js';

it('M5G-C-1: keeps owner footer words even when they equal the sample', async () => {
  const context = await browser.newContext();
  const page = await context.newPage();
  try {
    await page.goto(`${pageUrl}#brief`);
    await page.getByLabel('Business name', { exact: true }).fill('Spoke & Wheel');
    const footer = page.getByLabel('Footer note', { exact: true });
    await footer.fill('Testing changes during design.');
    await footer.fill('Sample content for design preview.');
    await expect.poll(async () => (await saved(page))?.content.footerNote).toBe('Sample content for design preview.');
    expect(await footer.inputValue()).toBe('Sample content for design preview.');
    await page.reload();
    expect(await footer.inputValue()).toBe('Sample content for design preview.');
    await footer.fill('');
    await expect.poll(async () => (await saved(page))?.content.footerNote).toBe('');
    await page.reload();
    expect(await footer.inputValue()).toBe('');
  } finally { await context.close(); }
});
