import { expect, it } from 'vitest';
import { render } from './gate-render.js';

it('M5G-C-4: page markers are never inferred from the position of editable menu labels', () => {
  for (const page of ['home', 'contact'] as const) expect(render(page).match(/<nav[\s\S]*?<\/nav>/)?.[0]).not.toContain('aria-current="page"');
});
