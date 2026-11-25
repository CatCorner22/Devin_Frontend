import { describe, expect, it } from 'vitest';
import { BEHAVIOR_DEFAULTS, DEFAULT_PARAMS, DIRECTIONS, EMPTY_BRIEF, STEPS, craftFor, createProject, deriveTokens, findStep, keep, matchingOptionId, parseProject, pick, renderSmallBusiness, revert, type DesignParams } from '../src/index.js';
import { contrastHex, fixture, repoFileExists } from './helpers.js';

const steps = STEPS.filter((step) => step.stage === 'behavior');
const render = (params: DesignParams, focus: typeof steps[number]['focus'], voice = EMPTY_BRIEF.voice) => renderSmallBusiness({ params, focus, voice, content: createProject().content, tokens: deriveTokens(params, 'off').css, links: 'inert' });

describe('behavior choices', () => {
  it('review: reverting an old focus choice restores exact parameters and colors', () => {
    const old = createProject();
    old.params = { ...DIRECTIONS.find((d) => d.id === 'sticker-pop')!.params };
    old.base = { ...old.params };
    delete old.params.focusStyle;
    delete old.base.focusStyle;
    const restored = revert(pick(old, 'focus-style', 'double'), 'focus-style');
    expect(restored).toEqual(old);
    expect(deriveTokens(restored.params, 'off')).toEqual(deriveTokens(old.params, 'off'));
  });
  it('adds only the five missing Steps, with distinct Options and explicit provenance', () => {
    expect(steps.map((s) => s.id)).toEqual(['motion-timing', 'focus-style', 'empty-state', 'error-state', 'voice']);
    expect(STEPS.filter((s) => s.id === 'motion')).toHaveLength(1);
    for (const step of steps) {
      expect(step.options.length).toBeGreaterThanOrEqual(3);
      expect(step.options.length).toBeLessThanOrEqual(4);
      for (const option of step.options) {
        expect(option.sources).toEqual(step.sources);
        expect(option.evidence).toBe('expert-opinion');
        expect(option.reviewed).toBe('2026-11-25');
        for (const source of option.sources!) expect(repoFileExists(source.record!)).toBe(true);
      }
      const pictures = step.options.map((o) => render({ ...DEFAULT_PARAMS, ...o.patch }, step.focus, o.voice));
      expect(new Set(pictures).size, step.id).toBe(step.options.length);
      for (const html of pictures) expect(html).not.toMatch(/<script|\son[a-z]+=/i);
    }
  });
  it('opens old parameters without adding behavior fields or Decisions', () => {
    const old = createProject();
    for (const key of Object.keys(BEHAVIOR_DEFAULTS) as (keyof typeof BEHAVIOR_DEFAULTS)[]) { delete old.params[key]; delete old.base[key]; }
    const parsed = parseProject(JSON.parse(JSON.stringify(old)));
    expect(parsed).toMatchObject({ ok: true, project: old, notes: [] });
    if (parsed.ok) expect(parsed.project).toEqual(old);
    expect(deriveTokens(old.params, 'advise').css).toEqual(deriveTokens(DEFAULT_PARAMS, 'advise').css);
    for (const step of steps.filter((s) => !s.briefVoice)) expect(matchingOptionId(old.params, step)).toBe(step.defaultOptionId);
  });
  it('round-trips every pick and refuses unknown behavior values', () => {
    for (const step of steps) for (const option of step.options) {
      const project = pick(createProject(), step.id, option.id);
      const parsed = parseProject(JSON.parse(JSON.stringify(project)));
      expect(parsed, `${step.id}/${option.id}`).toMatchObject({ ok: true, project, notes: [] });
      expect(project.decisions[step.id]?.optionId).toBe(option.id);
    }
    for (const key of Object.keys(BEHAVIOR_DEFAULTS)) expect(parseProject({ ...createProject(), params: { ...DEFAULT_PARAMS, [key]: '<script>' } }).ok).toBe(false);
    expect(() => pick(createProject(), 'voice', 'missing')).toThrow();
  });
  it('keeping an implied default in an old file matches the shown Option', () => {
    const old = createProject();
    for (const key of Object.keys(BEHAVIOR_DEFAULTS) as (keyof typeof BEHAVIOR_DEFAULTS)[]) { delete old.params[key]; delete old.base[key]; }
    for (const step of steps.filter((s) => !s.briefVoice)) {
      const kept = keep(old, step.id);
      const picked = pick(old, step.id, step.defaultOptionId);
      expect(kept.params).toEqual(picked.params);
      expect(deriveTokens(kept.params, 'off').css).toEqual(deriveTokens(picked.params, 'off').css);
      expect(kept.base).toEqual(old.base);
    }
  });
  it('keeps voice only in the Brief and renders help without editing owner text', () => {
    const before = createProject();
    expect(render(before.params, 'voice')).toBe(renderSmallBusiness({ params: before.params, tokens: deriveTokens(before.params, 'off').css, content: before.content, focus: 'voice', links: 'inert' }));
    for (const option of findStep('voice')!.options) {
      const project = pick(before, 'voice', option.id);
      expect(project.brief?.voice).toEqual(option.voice);
      expect(project.params).toEqual(before.params);
      expect(project.decisions['voice']?.values).toEqual({});
      expect(project.content).toBe(before.content);
      expect(render(project.params, 'voice', project.brief!.voice)).toContain(before.content.contactBody);
      expect(revert(project, 'voice').brief?.voice).toEqual(EMPTY_BRIEF.voice);
    }
    expect(matchingOptionId(DEFAULT_PARAMS, findStep('voice')!, { tone: 'formal', length: 'detailed', stance: 'modest' })).toBeNull();
  });
  it('derives different timing curves and durations, with no durations when motion is off', () => {
    const variants = findStep('motion-timing')!.options.map((o) => deriveTokens({ ...DEFAULT_PARAMS, ...o.patch }, 'off').css);
    expect(new Set(variants.map((v) => v['--ease-out'])).size).toBe(3);
    expect(variants.map((v) => v['--dur'])).toEqual(['200ms', '160ms', '280ms']);
    for (const option of findStep('motion-timing')!.options) {
      const project = pick(createProject(), 'motion-timing', option.id);
      expect(craftFor(project).some((entry) => entry.rule.id === 'craft-short-transitions')).toBe(true);
      expect(craftFor(pick(project, 'motion', 'none')).some((entry) => entry.rule.id === 'craft-short-transitions')).toBe(false);
      const tokens = deriveTokens({ ...DEFAULT_PARAMS, ...option.patch, motion: 'none' }, 'off').css;
      for (const key of ['--dur-fast', '--dur', '--dur-slow']) expect(tokens[key]).toBe('0ms');
    }
  });
  it('keeps every focus shape above 3 to 1 on every ground in light and dark, even with contrast checks off', () => {
    for (const direction of DIRECTIONS) for (const option of findStep('focus-style')!.options) {
      const { hex, css } = deriveTokens({ ...direction.params, ...option.patch }, 'off');
      for (const ground of ['--bg', '--card-surface', '--surface', '--surface-2']) expect(contrastHex(hex['--focus']!, hex[ground]!), `${direction.id} ${ground}`).toBeGreaterThanOrEqual(3);
      expect(contrastHex(hex['--focus-hero']!, hex['--hero-bg']!)).toBeGreaterThanOrEqual(3);
      expect(css['--focus-style']).toBe(option.id === 'outline' ? 'solid' : option.id);
    }
  });
  it('shows empty and error examples without deleting real work', () => {
    expect(render(DEFAULT_PARAMS, 'empty')).toContain('This is a demonstration, not your service list.');
    for (const option of findStep('error-state')!.options) {
      const html = render({ ...DEFAULT_PARAMS, ...option.patch }, 'error');
      expect(html).toContain('aria-invalid="true" value="12"');
      expect(html).toContain('value="Alex"');
      expect(html.includes('class="error-summary"')).toBe(option.id !== 'inline');
      expect(html.includes('id="m-phone-error"')).toBe(option.id !== 'summary');
    }
  });
  it('still opens an original saved fixture', () => {
    expect(parseProject(fixture('project-v1-plain.json')).ok).toBe(true);
  });
});
