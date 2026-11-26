import { expect, it } from 'vitest';
import { SAMPLE_CONTENT } from '../src/index.js';
import { render } from './gate-render.js';

it('M5G-S-1: isolates directional controls inside each HTML field and does not let them affect the title', () => {
  for (const business of ['Acme\u202e', 'Acme\u2069\u202e']) {
    const html = render('contact', business);
    expect(html).toContain(`<bdi class="bidi-field">${business}</bdi> · ${SAMPLE_CONTENT.address}`);
    expect(html.match(/<title>(.*?)<\/title>/)?.[1]).not.toMatch(/\p{Bidi_Control}/u);
  }
  expect(render('contact', 'عيادة שלום')).toContain('عيادة שלום');
});
