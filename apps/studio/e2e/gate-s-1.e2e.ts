import { expect, it } from 'vitest';
import { SAMPLE_CONTENT } from '@refraction/core';
import { saved, visit } from './gate-support.js';

it('M5G-S-1: owner bidi controls do not reverse the address in the rendered footer', async () => {
  const { context, page } = await visit();
  try {
    for (const name of ['Acme\u202e', 'Acme\u2069\u202e']) {
      await page.getByLabel('Business name', { exact: true }).fill(name);
      const footer = page.frameLocator('.brief-preview iframe').locator('.site-footer .wrap > span').first();
      await expect.poll(() => footer.textContent()).toContain(name);
      const positions = await footer.evaluate((element, address) => {
        const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
        const nodes: Text[] = [];
        for (let node = walker.nextNode(); node; node = walker.nextNode()) nodes.push(node as Text);
        const text = nodes.map((node) => node.data).join('');
        const start = text.indexOf(address);
        const x = (index: number): number => {
          for (const node of nodes) {
            if (index < node.length) {
              const range = document.createRange(); range.setStart(node, index); range.setEnd(node, index + 1);
              return range.getBoundingClientRect().x;
            }
            index -= node.length;
          }
          throw new Error('Address character not found');
        };
        return [x(start), x(start + address.length - 1)];
      }, SAMPLE_CONTENT.address);
      expect(positions[0], JSON.stringify([...name].map((character) => character.codePointAt(0)))).toBeLessThan(positions[1]!);
      await expect.poll(async () => (await saved(page))?.content.business).toBe(name);
    }
  } finally { await context.close(); }
});
