import { expect, it } from 'vitest';
import { createProject, parseProject } from '../src/index.js';

it('M5G-S-3: counts every discarded Decision including prototype-looking keys without prototype pollution', () => {
  const empty = parseProject(createProject());
  expect(empty.ok && empty.notes).toEqual([]);
  for (const keys of [['__proto__'], ['__proto__', 'constructor'], ['a', 'b']]) {
    const project = createProject();
    const decisions = Object.fromEntries(keys.map((key) => [key, { stepId: key, optionId: null, kind: 'kept', rejected: [], values: {}, at: '2026-11-25T00:00:00.000Z' }]));
    const parsed = parseProject(JSON.parse(JSON.stringify({ ...project, decisions })));
    if (!parsed.ok) throw new Error(parsed.error);
    expect(Object.keys(parsed.project.decisions)).toEqual([]);
    expect(parsed.notes).toContain(keys.length === 1 ? 'One Decision in the file belongs to a Step that this version of the Studio does not have. It was left out.' : '2 Decisions in the file belong to Steps that this version of the Studio does not have. They were left out.');
    expect(Object.prototype).not.toHaveProperty('stepId');
  }
  const malformed = parseProject({ ...createProject(), decisions: JSON.parse('{"__proto__":null}') as unknown });
  expect(malformed.ok && malformed.notes).toEqual(['One Decision in the file belongs to a Step that this version of the Studio does not have. It was left out.']);
});
