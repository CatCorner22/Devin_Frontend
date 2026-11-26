import { expect, it } from 'vitest';
import { createProject, deriveTokens, renderSmallBusiness } from '../src/index.js';

it('M5G-C-2: form help does not invent callback hours in any voice on either page', () => {
  for (const page of ['home', 'contact'] as const) {
    const project = createProject();
    for (const hours of ['', 'Sunday only, noon to 2']) for (const voice of [{ tone: 'friendly', length: 'brief' }, { tone: 'formal', length: 'brief' }, { tone: 'friendly', length: 'detailed' }] as const) {
      const html = renderSmallBusiness({ page, content: { ...project.content, hours }, params: project.params, tokens: deriveTokens(project.params, project.a11y).css, voice: { ...voice, stance: 'modest' } });
      if (hours) expect(html).toContain(hours);
      expect(html).not.toMatch(/working days|8 (?:and|to) 5/);
    }
  }
});
