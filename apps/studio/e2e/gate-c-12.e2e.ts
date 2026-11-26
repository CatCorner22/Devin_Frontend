import { homedir } from 'node:os';
import { join } from 'node:path';
import { expect, it } from 'vitest';
import { visit } from './gate-support.js';

it('M5G-C-12: the Brief preview stays visible beside the edited field at 1024px', async () => {
  const { context, page } = await visit('#brief', 1024);
  try {
    await page.getByLabel('Business name', { exact: true }).fill('Spoke & Wheel');
    await expect.poll(() => page.frameLocator('.brief-preview iframe').locator('.brand').textContent()).toBe('Spoke & Wheel');
    const pane = await page.locator('.brief-preview').boundingBox();
    expect(pane!.y).toBeLessThan(720);
    expect(pane!.y + pane!.height).toBeGreaterThan(0);
    await page.screenshot({ path: join(homedir(), 'm5-gate-c12-after.png') });
  } finally { await context.close(); }
});
