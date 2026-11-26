import { readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export function e2eFiles(directory = 'apps/studio/e2e') {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? e2eFiles(path) : entry.isFile() && entry.name.endsWith('.e2e.ts') ? [path] : [];
  }).sort();
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const files = e2eFiles();
  if (!files.length) throw new Error('No browser test files were found.');
  console.log(JSON.stringify(files));
}
