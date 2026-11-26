import { expect, it } from 'vitest';
import { visit } from './gate-support.js';

it('M5R-2: Summary discloses the same mixed sample words as Directions', async () => {
  const { context, page } = await visit();
  try {
    await page.getByLabel('What your business does', { exact: true }).fill('We fix bicycles.');
    await page.getByLabel('Business name', { exact: true }).fill('Spoke & Wheel');
    await page.getByRole('link', { name: 'Continue to Directions', exact: true }).click();
    await page.getByRole('heading', { name: 'Pick a Direction: a complete starting look', exact: true }).waitFor();
    const copy = 'Some page fields still match the sample for a made-up dental practice. Check them in the Brief.';
    expect(await page.locator('main').innerText()).toContain(copy);
    await page.getByRole('link', { name: '4. Summary', exact: true }).click();
    await page.getByRole('heading', { name: 'Your Decisions, read back', exact: true }).waitFor();
    expect(await page.locator('main').innerText()).toContain(copy);
  } finally { await context.close(); }
});
