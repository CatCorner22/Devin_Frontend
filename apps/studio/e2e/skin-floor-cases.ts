import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { DIRECTIONS, FLOORS, FONTS, SKINS, createProject, deriveTokens, renderSmallBusiness, skinParams, skinsOf } from '@refraction/core';
import { type Finding } from '../../../packages/kit/src/index.js';
import * as checks from '../../../packages/kit/src/page-checks/index.js';
import { chromium, type Browser } from 'playwright';
import { afterAll, beforeAll, expect, it } from 'vitest';

const require = createRequire(import.meta.url);
const axe = readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');
const fonts = Object.entries(FONTS).filter(([id]) => !id.startsWith('system-')).map(([name, font]) => `@font-face{font-family:${font.stack.split(',')[0]};src:url("data:font/woff2;base64,${readFileSync(require.resolve(`@fontsource-variable/${name}/files/${name}-latin-wght-normal.woff2`)).toString('base64')}") format("woff2");font-weight:100 900;font-style:normal}`).join('\n');
const functions = checks as unknown as Record<string, (...args: never[]) => unknown>;
const order = [...Object.keys(functions).filter((name) => name !== 'focusIsVisible'), 'focusIsVisible'];
const floorIds = new Set(FLOORS.map((entry) => entry.rule.id));
let browser: Browser;
beforeAll(async () => { browser = await chromium.launch(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {}); });
afterAll(async () => { await browser?.close(); });

export function registerSkinFloors(pageName: 'home' | 'contact', theme: 'light' | 'dark'): void {
  for (const [index, skin] of SKINS.entries()) for (const width of [375, 1280]) {
    it(`Skin floors: ${skin.id}/${theme}/${pageName}/${width}: kit and axe`, async () => {
      const offered = DIRECTIONS.filter((direction) => skinsOf(direction).some((s) => s.id === skin.id));
      const direction = skin.id === 'lagoon' ? DIRECTIONS.find((d) => d.id === 'midnight-aurora')! : offered[(index * 7) % offered.length]!;
      const params = { ...skinParams(direction, skin), theme };
      const tokens = deriveTokens(params, 'advise').css;
      const context = await browser.newContext({ viewport: { width, height: 800 }, colorScheme: theme });
      try {
        const page = await context.newPage();
        await page.setContent(renderSmallBusiness({ params, tokens, page: pageName, content: createProject().content, fontFaceCss: fonts, still: true, links: 'inert' }));
        await page.evaluate(() => document.fonts.ready);
        const findings: Finding[] = [];
        for (const name of order) findings.push(...await page.evaluate(`(${String(functions[name])})(document${name === 'tokenFit' ? `, ${JSON.stringify(tokens)}` : ''})`) as Finding[]);
        expect(findings.filter((finding) => floorIds.has(finding.ruleId) && finding.status === 'fails'), `${direction.id}/${skin.id}`).toEqual([]);
        await page.evaluate(axe);
        const violations = await page.evaluate(async () => {
          const engine = (window as unknown as { axe: { run: (doc: Document, options: unknown) => Promise<{ violations: { id: string; impact: string | null; nodes: unknown[] }[] }> } }).axe;
          return (await engine.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] } })).violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
        });
        expect(violations, `${direction.id}/${skin.id}`).toEqual([]);
      } finally { await context.close(); }
    });
  }
}
