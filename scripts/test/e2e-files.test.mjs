import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { expect, it } from 'vitest';
import { e2eFiles } from '../e2e-files.mjs';

it('the CI matrix discovers every browser test recursively, in stable order, including future files', () => {
  const root = mkdtempSync(join(tmpdir(), 'refraction-e2e-files-'));
  try {
    mkdirSync(join(root, 'nested'));
    for (const name of ['z.e2e.ts', 'a.e2e.ts', 'helper.ts', 'nested/future.e2e.ts']) writeFileSync(join(root, name), '');
    expect(e2eFiles(root)).toEqual(['a.e2e.ts', 'nested/future.e2e.ts', 'z.e2e.ts'].map((name) => join(root, name)));
    expect(e2eFiles(join(root, 'nested'))).toHaveLength(1);
    mkdirSync(join(root, 'empty'));
    expect(e2eFiles(join(root, 'empty'))).toEqual([]);
    expect(() => e2eFiles(join(root, 'missing'))).toThrow();
  } finally { rmSync(root, { recursive: true, force: true }); }
});

it('CI audits before the complete browser matrix, preserves the job limit and fails the required check on any shard failure', () => {
  const workflow = readFileSync('.github/workflows/ci.yml', 'utf8');
  expect(workflow.indexOf('npm run audit:deps')).toBeLessThan(workflow.indexOf('\n  browser:'));
  expect(workflow).toContain('node scripts/e2e-files.mjs');
  expect(workflow).toContain('fromJSON(needs.quality.outputs.browser-files)');
  expect(workflow).toContain('fail-fast: false');
  expect(workflow).toContain('npx vitest run --config vitest.e2e.config.ts "$E2E_FILE"');
  expect(workflow).not.toMatch(/timeout-minutes:\s*(?:2[6-9]|[3-9]\d|\d{3})|--exclude|--testTimeout/);
  expect(workflow).toContain('needs: [quality, browser]');
  expect(workflow).toContain('needs.browser.result');
});

it('the split Skin floor files register all four page/theme scenarios exactly once', () => {
  const scenarios = e2eFiles().flatMap((file) => [...readFileSync(file, 'utf8').matchAll(/registerSkinFloors\('([^']+)', '([^']+)'\)/g)].map((match) => `${match[1]}/${match[2]}`));
  expect(scenarios.sort()).toEqual(['contact/dark', 'contact/light', 'home/dark', 'home/light']);
});
