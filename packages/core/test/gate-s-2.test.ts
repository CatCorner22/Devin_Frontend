import { expect, it } from 'vitest';
import { createProject, parseProject } from '../src/index.js';

it('M5G-S-2: discloses removal of direction-changing controls from project names without changing ordinary RTL letters', () => {
  for (const name of ['Invoice \u202efdp.exe', 'عيادة שלום', '']) {
    const parsed = parseProject({ ...createProject(), name });
    if (!parsed.ok) throw new Error(parsed.error);
    expect(parsed.project.name).toBe(name.replace(/\p{Bidi_Control}/gu, ''));
    expect(parsed.notes.some((note) => note.includes('project name'))).toBe(name.includes('\u202e'));
  }
  expect(parseProject({ ...createProject(), name: 12 }).ok).toBe(false);
});
