import { homedir } from 'node:os';
import { join } from 'node:path';
import { expect, it } from 'vitest';
import { browser, pageUrl } from './gate-support.js';

it('the Brief keeps a visible live picture on a landscape touch phone', async () => {
  const context = await browser.newContext({ viewport: { width: 640, height: 360 }, isMobile: true, hasTouch: true });
  const page = await context.newPage();
  try {
    await page.goto(`${pageUrl}#brief`);
    await page.locator('#project-name:enabled').waitFor();
    await page.getByLabel('Business name', { exact: true }).fill('Landscape workshop');
    await expect.poll(() => page.frameLocator('.brief-preview iframe').locator('.brand').textContent()).toBe('Landscape workshop');
    const picture = page.locator('.brief-preview .large-preview');
    await picture.scrollIntoViewIfNeeded();
    const box = await picture.boundingBox();
    expect(box!.height).toBeGreaterThanOrEqual(128);
    expect(box!.y).toBeGreaterThanOrEqual(0);
    expect(box!.y + box!.height).toBeLessThanOrEqual(360);
    await page.screenshot({ path: join(homedir(), 'm5-brief-landscape-after.png') });
  } finally { await context.close(); }
});
