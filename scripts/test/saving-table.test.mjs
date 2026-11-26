import { readFileSync } from 'node:fs';
import { expect, it } from 'vitest';
import { checkSavingTable, declaredTests, savingReferences } from '../test-source-names.mjs';

const cite = (name, file = 'apps/studio/e2e/example.e2e.ts') => `[${name}](../../${file}#test=${encodeURIComponent(name)})`;

it('every saving-table test exists under its exact declared title or explicit title template in the named file', () => {
  const markdown = readFileSync('docs/reference/saving-table.md', 'utf8');
  expect(savingReferences(markdown).length).toBeGreaterThan(0);
  expect(checkSavingTable(markdown, (file) => readFileSync(file, 'utf8'))).toEqual([]);
});

it('finds literal, parameterized and interpolated titles without executing test code', () => {
  const source = "it('plain', () => {}); it.each([])('contract: $id', () => {}); it(`case ${item.name}`, () => {}); describe('not a test', () => {});";
  expect(declaredTests(source)).toEqual(['plain', 'contract: $id', 'case ${item.name}']);
  for (const name of declaredTests(source)) expect(checkSavingTable(cite(name), () => source)).toEqual([]);
  let reads = 0;
  expect(checkSavingTable(cite('plain') + '\n' + cite('contract: $id'), () => { reads++; return source; })).toEqual([]);
  expect(reads).toBe(1);
  expect(declaredTests('')).toEqual([]);
});

it('rejects stale titles, wrong or missing files, missing links, empty coverage and misleading labels', () => {
  expect(checkSavingTable(cite('missing'), () => "it('present', () => {})")).not.toEqual([]);
  expect(checkSavingTable(cite('present', 'apps/../outside.e2e.ts'), () => "it('present', () => {})")).not.toEqual([]);
  expect(checkSavingTable(cite('present'), () => { throw new Error('missing file'); })).not.toEqual([]);
  expect(checkSavingTable('| Event | Test |\n|---|---|\n| reload | "a title without a file link" |', () => '')).not.toEqual([]);
  expect(checkSavingTable('', () => '')).not.toEqual([]);
  expect(checkSavingTable(cite('present').replace('[present]', '[misleading]'), () => "it('present', () => {})")).not.toEqual([]);
});
