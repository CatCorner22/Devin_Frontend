import { BRIEF_STAGE, EMPTY_BRIEF, SAMPLE_CONTENT, isSampleContent, type BriefNotes, type MockupFocus, type SiteContent } from '@refraction/core';
import { placeholderIn } from '@refraction/kit';
import { useEffect, useId, useRef, useState } from 'react';
import { LargePreview, mockupHtml } from './preview';
import { DEVICE_WIDTH, useStudio } from './store';

const PAGE_FIELDS = [
  ['business', 'Business name'], ['tag', 'Short line above the headline'],
  ['headline', 'Headline'], ['headlineEmphasis', 'Phrase to highlight in the headline'],
  ['lede', 'Line under the headline'], ['primaryAction', 'Main button label'], ['secondaryAction', 'Second button label'],
  ['servicesTitle', 'Services heading'], ['servicesIntro', 'Services introduction'],
  ['feesTitle', 'Fee list heading'], ['aboutTitle', 'About heading'], ['aboutBody', 'About text'],
  ['promise', 'Promise'], ['contactTitle', 'Contact heading'], ['contactBody', 'Contact text'],
  ['phone', 'Phone'], ['address', 'Address'], ['hours', 'Hours'], ['footerNote', 'Footer note'],
] as const;

function avoids(text: string, words: string[]): boolean {
  return words.some((word) => word.trim() && new RegExp(`(^|[^\\p{L}\\p{N}])${word.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}($|[^\\p{L}\\p{N}])`, 'iu').test(text));
}

const itemText = (item: object | undefined, column: string): string => String(Object.entries(item ?? {}).find(([key]) => key === column)?.[1] ?? '');

function TextField({ label, value, sample, words, change, warning, max = 600 }: {
  label: string; value: string; sample?: string; words: string[]; change(value: string): void; warning?: string; max?: number;
}): React.JSX.Element {
  const id = useId();
  const placeholder = placeholderIn(value);
  const messages = [
    warning,
    value && sample === value ? 'This still holds the sample’s words. Replace them when you are ready.' : undefined,
    placeholder ? `This may be made-up or generic text (“${placeholder}”). Check that it is what you want.` : undefined,
    avoids(value, words) ? 'This uses a word or phrase on your words-to-avoid list.' : undefined,
  ].filter(Boolean);
  return <div className="brief-field">
    <label htmlFor={id}>{label}</label>
    <textarea id={id} rows={2} maxLength={max} value={value} onChange={(e) => change(e.target.value)} aria-describedby={`${id}-help`} />
    <small id={`${id}-help`}>Maximum {max} characters.{messages.map((message) => <span className="brief-warning" key={message}>{message} This does not stop saving.</span>)}</small>
  </div>;
}

export function BriefView({ children }: { children: React.ReactNode }): React.JSX.Element {
  const s = useStudio();
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => { heading.current?.focus(); }, [s.focusTick]);
  const c = s.project.content;
  const notes = s.project.brief ?? EMPTY_BRIEF;
  const words = notes.wordsToAvoid;
  const [previewFocus, setPreviewFocus] = useState<MockupFocus>('top');
  const html = mockupHtml(s.project, s.project.params, { wireframe: false, focus: previewFocus, still: true });
  const field = (key: (typeof PAGE_FIELDS)[number][0], label: string): React.JSX.Element => <TextField
    key={key} label={label} value={c[key]} sample={SAMPLE_CONTENT[key]} words={words}
    warning={key === 'headlineEmphasis' && c.headlineEmphasis && !c.headline.includes(c.headlineEmphasis) ? 'The highlighted phrase must occur in the headline. Until it does, the preview shows the headline without a highlight.' : key === 'primaryAction' && s.project.overlays?.includes('sticky-call') ? 'The phone’s fixed action shows one line with an ellipsis (…) when the label is too long. The full label stays in the first screen’s button. Use a short label so the fixed action is clear.' : undefined}
    change={(value) => {
      setPreviewFocus(key.startsWith('services') ? 'services' : key.startsWith('fees') ? 'fees' : key.startsWith('about') || key === 'promise' ? 'about' : ['contactTitle', 'contactBody', 'phone', 'address', 'hours', 'footerNote'].includes(key) ? 'contact' : 'top');
      s.setContent({ ...c, [key]: value }, key);
    }} />;
  const note = (key: 'whatItDoes' | 'audience' | 'mainJob', label: string): React.JSX.Element => <TextField
    label={label} value={notes[key]} words={words} change={(value) => s.setBrief({ ...notes, [key]: value }, key)} />;

  const items = <K extends 'services' | 'facts' | 'fees'>(key: K, title: string, columns: readonly [keyof SiteContent[K][number] & string, string][], max: number, blank: SiteContent[K][number]): React.JSX.Element => <fieldset>
    <legend>{title}</legend>
    <p>The preview shows all {c[key].length} entries below. You can have up to {max}.</p>
    {c[key].map((item, index) => <fieldset key={index}>
      <legend>{title} {index + 1}</legend>
      {columns.map(([column, label]) => <TextField key={column} label={`${title} ${index + 1}: ${label}`} value={itemText(item, column)} words={words}
        sample={itemText(SAMPLE_CONTENT[key][index], column)}
        change={(value) => { setPreviewFocus(key); s.setContent({ ...c, [key]: c[key].map((old, at) => at === index ? { ...old, [column]: value } : old) }, `${key}:${index}:${column}`); }} />)}
      <button type="button" onClick={() => s.setContent({ ...c, [key]: c[key].filter((_, at) => at !== index) })}>Remove {title.toLowerCase()} {index + 1}</button>
    </fieldset>)}
    <button type="button" disabled={c[key].length >= max} onClick={() => s.setContent({ ...c, [key]: [...c[key], { ...blank }] })}>Add {title.toLowerCase()}</button>
  </fieldset>;

  return <div className="work">
    {children}
    <main id="main" className="brief-main" tabIndex={-1}>
      <div className="brief-editor">
        <p className="eyebrow">Stage 1 · Brief · Your words before layout</p>
        <h1 ref={heading} tabIndex={-1}>Your Brief</h1>
        <p>{BRIEF_STAGE.teach}</p>
        <p>Warnings only warn. They never stop saving. Text fields accept up to 600 characters. The status line above tells you whether saving worked.</p>
        <p>The preview follows the page section you edit.</p>
        {isSampleContent(c) && <p className="note">This is sample content for a made-up dental practice, not your content.</p>}
        <fieldset><legend>Notes for the Fitter (the AI coding assistant that will build your page)</legend>
          <p>These notes travel in the project file. They do not appear as text on the page.</p>
          {note('whatItDoes', 'What your business does')}{note('audience', 'Who the page is for')}{note('mainJob', 'The one thing a visitor should do')}
          {([['tone', 'Voice: formal or friendly', ['formal', 'friendly']], ['length', 'Voice: brief or detailed', ['brief', 'detailed']], ['stance', 'Voice: modest or confident', ['modest', 'confident']]] as const).map(([key, label, choices]) => <label className="brief-field" key={key}>{label}<select value={notes.voice[key]} onChange={(e) => s.setBrief({ ...notes, voice: { ...notes.voice, [key]: e.target.value } } as BriefNotes, `voice:${key}`)}>{choices.map((choice) => <option key={choice} value={choice}>{choice}</option>)}</select></label>)}
          <TextField label="Words to avoid (one word or phrase per line)" value={words.join('\n')} words={[]} max={1229} change={(value) => s.setBrief({ ...notes, wordsToAvoid: value.split('\n').slice(0, 30).map((word) => word.slice(0, 40)) }, 'wordsToAvoid')} />
          <p>Up to 30 lines, 40 characters each. Extra lines and characters on a line are left out as you type. Checks match whole words, without regard to capitals; they cannot find every generic phrase.</p>
        </fieldset>
        <fieldset><legend>Page text</legend>{PAGE_FIELDS.map(([key, label]) => field(key, label))}</fieldset>
        {items('services', 'Service', [['title', 'Name'], ['body', 'Description']], 12, { title: '', body: '' })}
        {items('facts', 'Fact', [['value', 'Value'], ['label', 'Label']], 8, { value: '', label: '' })}
        {items('fees', 'Fee', [['item', 'Item'], ['price', 'Price']], 12, { item: '', price: '' })}
        <fieldset><legend>Menu labels</legend>{c.nav.map((value, index) => <TextField key={index} label={`Menu label ${index + 1}`} value={value} sample={SAMPLE_CONTENT.nav[index]} words={words} change={(text) => { setPreviewFocus('top'); s.setContent({ ...c, nav: c.nav.map((old, at) => at === index ? text : old) }, `nav:${index}`); }} />)}</fieldset>
        <button type="button" onClick={() => s.requestSample()}>Restore sample content</button>
        <p>You will be asked first. Undo can bring your words back until you close or reload this page, within the last 100 Undo steps.</p>
        <a className="btn primary" href="#directions">Continue to Directions</a>
      </div>
      <aside className="brief-preview" aria-label="Your words as a picture">
        <h2>Your page as you type</h2>
        <LargePreview html={html.html} width={DEVICE_WIDTH[s.device]} title="Large preview of your Brief" />
      </aside>
    </main>
  </div>;
}
