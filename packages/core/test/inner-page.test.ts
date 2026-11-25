import { describe, expect, it } from 'vitest';
import { DEFAULT_PARAMS, SAMPLE_CONTENT, STEPS, contactPageContent, createProject, deriveTokens, isSampleContent, parseProject, pick, renderSmallBusiness, type MockupFocus, type Project } from '../src/index.js';

const render = (project: Project, focus: MockupFocus = 'top') => renderSmallBusiness({ page: 'contact', params: project.params, tokens: deriveTokens(project.params, project.a11y).css, content: project.content, voice: project.brief?.voice, focus, links: 'inert' });

describe('contact inner page', () => {
  it('old content stays unchanged and supplies the contact defaults', () => {
    const old = createProject();
    old.content.contactTitle = 'Meet our repair team';
    old.content.contactBody = 'Ask us about your old windows.';
    old.content.address = '7 Moss Lane';
    const parsed = parseProject(JSON.parse(JSON.stringify(old)));
    if (!parsed.ok) throw new Error(parsed.error);
    expect(parsed.project).toEqual(old);
    expect(parsed.notes).toEqual([]);
    expect(parsed.project.content).not.toHaveProperty('contactPage');
    expect(contactPageContent(old.content)).toEqual({ title: 'Meet our repair team', intro: 'Ask us about your old windows.', directions: '7 Moss Lane' });
    expect(render(old)).toContain('<h1>Meet our repair team</h1>');
    expect(render(old)).not.toContain('data-page="home"');
    expect(contactPageContent(SAMPLE_CONTENT).title).toBe(SAMPLE_CONTENT.contactTitle);
  });
  it('validates optional content, permits empty drafts and round-trips owner text', () => {
    for (const text of ['', 'Arrange a visit']) {
      const project = createProject();
      project.content.contactPage = { title: text, intro: text, directions: text };
      expect(parseProject(JSON.parse(JSON.stringify(project)))).toMatchObject({ ok: true, project });
    }
    for (const bad of [null, {}, { title: 3, intro: '', directions: '' }, { title: '', intro: false, directions: '' }, { title: '', intro: '', directions: 'x'.repeat(601) }]) {
      const project = createProject();
      expect(parseProject({ ...project, content: { ...project.content, contactPage: bad } }).ok).toBe(false);
    }
  });
  it('escapes inner text, has no script or remote resources and shares the token sheet', () => {
    const project = createProject();
    project.content.contactPage = { title: '<img src=x onerror=alert(1)>', intro: '<script>bad()</script>', directions: '"<&' };
    const html = render(project);
    expect(html).toContain('&lt;img src=x onerror=alert(1)&gt;');
    expect(html).toContain('&lt;script&gt;bad()&lt;/script&gt;');
    expect(html).not.toMatch(/<script|<img|(?:src|href)="https?:/i);
    expect(isSampleContent(project.content)).toBe(false);
    const home = renderSmallBusiness({ params: DEFAULT_PARAMS, tokens: deriveTokens(DEFAULT_PARAMS, project.a11y).css, content: project.content });
    expect(html.match(/<style>([\s\S]*?)<\/style>/)?.[1]).toBe(home.match(/<style>([\s\S]*?)<\/style>/)?.[1]);
  });
  it('uses all behavior presets on the inner page without changing owner words', () => {
    const before = createProject();
    for (const step of STEPS.filter((s) => s.stage === 'behavior')) {
      const examples = step.options.map((option) => {
        const project = pick(before, step.id, option.id);
        expect(project.content).toEqual(before.content);
        const html = render(project, step.focus);
        expect(html).toContain('data-page="contact"');
        return html;
      });
      expect(new Set(examples).size, step.id).toBe(step.options.length);
    }
  });
});
