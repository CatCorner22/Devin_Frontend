import { expect, it } from 'vitest';
import { createProject, parseProject } from '../src/index.js';

it('M5G-S-2: discloses hidden direction controls while preserving every saved name character', () => {
  for (const name of ['Invoice \u202efdp.exe', 'عيادة שלום', '']) {
    const parsed = parseProject({ ...createProject(), name });
    if (!parsed.ok) throw new Error(parsed.error);
    expect(parsed.project.name).toBe(name);
    const reopened = parseProject(JSON.parse(JSON.stringify(parsed.project)));
    expect(reopened.ok && reopened.project.name).toBe(name);
    expect(parsed.notes.some((note) => note.includes('project name'))).toBe(name.includes('\u202e'));
  }
  expect(parseProject({ ...createProject(), name: 12 }).ok).toBe(false);
});
