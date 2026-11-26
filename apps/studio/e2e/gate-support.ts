import { chromium, type Browser, type Page } from 'playwright';
import { afterAll, beforeAll } from 'vitest';

export const pageUrl = new URL('../dist/artifact/local-test.html', import.meta.url).href;
export let browser: Browser;
beforeAll(async () => { browser = await chromium.launch(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {}); });
afterAll(async () => { await browser?.close(); });
export const saved = (page: Page) => page.evaluate(() => JSON.parse(localStorage.getItem('refraction.project.v2') ?? 'null')?.project);

export async function visit(hash = '#brief', width = 1440) {
  const context = await browser.newContext({ viewport: { width, height: 720 } });
  const page = await context.newPage();
  await page.goto(`${pageUrl}${hash}`);
  await page.locator('#project-name:enabled').waitFor();
  return { context, page };
}
