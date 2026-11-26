import { homedir } from 'node:os';
import { join } from 'node:path';
import { expect, it } from 'vitest';
import { visit } from './gate-support.js';

it('Brief viewing help opens beside its control inside the desktop viewport', async () => {
  const { context, page } = await visit('#brief');
  try {
    const summary = page.locator('.brief-preview .view-help summary');
    await summary.click();
    const help = page.locator('.brief-preview .view-help p');
    expect(await help.innerText()).toContain('Reload returns to Home and the in-use choice');
    const box = await help.boundingBox();
    const control = await summary.boundingBox();
    expect(box!.y).toBeGreaterThanOrEqual(control!.y);
    expect(box!.y + box!.height).toBeLessThanOrEqual(720);
    expect(box!.x).toBeGreaterThanOrEqual(0);
    expect(box!.x + box!.width).toBeLessThanOrEqual(1440);
    await page.screenshot({ path: join(homedir(), 'm5-brief-help-after.png') });
    await summary.click();
    expect(await help.isVisible()).toBe(false);
  } finally { await context.close(); }
});
