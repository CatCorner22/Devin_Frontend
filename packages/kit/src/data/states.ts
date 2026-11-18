// States and behavior: what each part of a page must show in each state, and what it must do for a keyboard.
import type { RuleRecord, SourceRef } from '../shapes.js';

// Basis: the builder read the text of each WCAG criterion named here on 2026-11-18, and the keyboard section of the two patterns of the guide.
const wcag = (section: string): SourceRef => ({ title: 'Web Content Accessibility Guidelines (WCAG) 2.2', url: 'https://www.w3.org/TR/WCAG22/', section, basis: 'read' });
const apg = (section: string): SourceRef => ({ title: 'ARIA Authoring Practices Guide (W3C)', url: 'https://www.w3.org/WAI/ARIA/apg/', section, basis: 'abstract' });
const own: SourceRef = { title: 'The builder\'s judgment of common practice', basis: 'builder' };
const reviewed = '2026-11-18';

export const STATES = ['rest', 'hover', 'focus', 'pressed', 'disabled', 'loading', 'error', 'empty', 'selected'] as const;
export type State = (typeof STATES)[number];

/** What a person must be able to see in each state. One sentence each; a part lists only the states it has. */
export const STATE_LOOK: Record<State, string> = {
  rest: 'The part looks like what it is: a button looks pressable, a link looks like a link, a field looks fillable.',
  hover: 'The part changes a little under the pointer, so that the person sees it will answer. Nothing is shown on hover alone that a keyboard cannot reach.',
  focus: 'A clear mark, at least 2 px, surrounds the part when the keyboard reaches it. The mark stands out from the part and from the background.',
  pressed: 'The part changes at once when pressed (darker, or moved by a pixel), before any result arrives.',
  disabled: 'The part is visibly paler and does not answer; a word nearby says why, or the part is left out.',
  loading: 'The part says that it is working and keeps its size, so that nothing jumps when the result arrives. A second press does nothing.',
  error: 'A message next to the part says what is wrong and how to put it right. Color alone does not carry the message.',
  empty: 'A sentence says what belongs here and offers the next action.',
  selected: 'The chosen item differs from the others by more than color: a mark, a weight, or a line.',
};

/** The state sheet: every common part and the states it must have. */
export const STATE_SHEET: Readonly<Record<string, readonly State[]>> = {
  button: ['rest', 'hover', 'focus', 'pressed', 'disabled', 'loading'],
  link: ['rest', 'hover', 'focus', 'pressed'],
  'text field': ['rest', 'hover', 'focus', 'disabled', 'error'],
  select: ['rest', 'hover', 'focus', 'disabled', 'error'],
  checkbox: ['rest', 'hover', 'focus', 'disabled', 'selected', 'error'],
  radio: ['rest', 'hover', 'focus', 'disabled', 'selected'],
  switch: ['rest', 'hover', 'focus', 'disabled', 'selected'],
  tab: ['rest', 'hover', 'focus', 'selected'],
  menu: ['rest', 'hover', 'focus', 'selected', 'disabled'],
  dialog: ['rest', 'focus', 'loading', 'error'],
  tooltip: ['rest'],
  notice: ['rest', 'error'],
  'table row': ['rest', 'hover', 'focus', 'selected', 'empty', 'loading'],
  card: ['rest', 'hover', 'focus', 'loading', 'empty'],
};

export const STATE_RULES: readonly RuleRecord[] = [
  { id: 'behavior-keyboard-reach', group: 'behavior', level: 'floor', plain: 'The Tab key reaches everything that answers a click, in the order of the page.', why: 'A person who cannot use a mouse cannot use a control that only a mouse reaches.', check: { kind: 'page-check', fn: 'keyboardReachable' }, evidence: 'convention', sources: [wcag('2.1.1 Keyboard'), wcag('2.4.3 Focus Order')], reviewed },
  { id: 'behavior-focus-visible', group: 'behavior', level: 'floor', plain: 'A control changes its look when the keyboard reaches it.', why: 'Without a mark, a keyboard user cannot tell where on the page they are.', check: { kind: 'page-check', fn: 'focusIsVisible' }, evidence: 'convention', sources: [wcag('2.4.7 Focus Visible'), wcag('2.4.13 Focus Appearance (level AAA)')], reviewed },
  { id: 'behavior-target-size', group: 'behavior', level: 'floor', plain: 'Everything that can be tapped is at least 24 by 24 pixels, or has 24 pixels of room around its center.', why: 'A small target is missed by an unsteady hand or a thumb, and the neighbor is hit instead.', check: { kind: 'page-check', fn: 'targetSize' }, evidence: 'convention', sources: [wcag('2.5.8 Target Size (Minimum) (the criterion has five exceptions; the program applies two, a link inside a sentence and a target with 24 pixels of room around its center, and not the other three: a control sized by the browser, an equivalent control elsewhere, and a size that is essential. For a checkbox or radio button it measures the label)')], reviewed },
  { id: 'behavior-control-name', group: 'behavior', level: 'floor', plain: 'Every button and link has a name that says what it does.', why: 'A screen reader says only "button" for a button that holds nothing but an icon.', check: { kind: 'page-check', fn: 'controlsHaveNames' }, evidence: 'convention', sources: [wcag('4.1.2 Name, Role, Value')], reviewed },
  { id: 'behavior-dialog-marked', group: 'behavior', level: 'floor', plain: 'A window over the page is marked as one and has a name.', why: 'Otherwise a screen reader keeps reading the page behind the window, and the person does not know a window opened.', check: { kind: 'page-check', fn: 'dialogsAreMarked' }, evidence: 'convention', sources: [apg('Dialog (Modal) Pattern')], reviewed },
  { id: 'behavior-dialog-keys', group: 'behavior', level: 'floor', plain: 'A window over the page takes the keyboard focus, keeps it inside, closes on Escape, and gives the focus back to the control that opened it.', why: 'If the focus stays behind the window, a keyboard user is typing into a page they cannot see.', check: { kind: 'walk', walk: 'dialog-walk' }, evidence: 'convention', sources: [apg('Dialog (Modal) Pattern')], reviewed },
  { id: 'behavior-tabs-keys', group: 'behavior', level: 'rule', plain: 'In a row of tabs the arrow keys move from tab to tab, and Home and End jump to the first and last.', why: 'People who use a keyboard expect this, and pressing Tab through every tab is slow.', check: { kind: 'walk', walk: 'tabs-walk' }, evidence: 'convention', sources: [apg('Tabs Pattern (the guide calls Home and End optional; the kit asks for them)')], reviewed },
  { id: 'behavior-tab-order', group: 'behavior', level: 'rule', plain: 'The Tab key visits the controls in the order in which a person reads them.', why: 'A focus that jumps about the page is hard to follow.', check: { kind: 'walk', walk: 'tab-order-walk' }, evidence: 'convention', sources: [wcag('2.4.3 Focus Order')], reviewed },
  { id: 'state-empty-explained', group: 'state', level: 'rule', plain: 'An empty list says what belongs in it and offers the next action.', why: 'A blank area looks broken, and the person does not know whether to wait or to act.', check: { kind: 'page-check', fn: 'emptyStatesExplain' }, evidence: 'expert-opinion', sources: [own], reviewed },
  { id: 'state-loading-announced', group: 'state', level: 'rule', plain: 'A part that is loading says so, also to a screen reader.', why: 'A person who cannot see the spinner hears nothing and does not know the page is working.', check: { kind: 'page-check', fn: 'loadingIsAnnounced' }, evidence: 'convention', sources: [wcag('4.1.3 Status Messages')], reviewed },
  { id: 'state-loading-keeps-size', group: 'state', level: 'rule', plain: 'A part that is loading has the size of the finished part, so that nothing jumps when the content arrives.', why: 'When the page jumps, the person loses their place or taps the wrong thing.', check: { kind: 'page-check', fn: 'layoutShift' }, evidence: 'convention', sources: [{ title: 'Cumulative Layout Shift (web.dev)', url: 'https://web.dev/articles/cls', basis: 'builder' }], reviewed },
  { id: 'state-pressed-feedback', group: 'state', level: 'rule', plain: 'A button changes its look while it is pressed.', why: 'Without an answer the person presses again, and the action runs twice.', check: { kind: 'person', ask: 'Press and hold each button. Does it look different while held?' }, evidence: 'expert-opinion', sources: [own], reviewed },
  { id: 'state-undo', group: 'state', level: 'rule', plain: 'An action that destroys something can be undone, or asks first.', why: 'One slip otherwise costs the person their work.', check: { kind: 'person', ask: 'Delete or clear something on each screen. Could you get it back, or were you asked first?' }, evidence: 'convention', sources: [wcag('3.3.4 Error Prevention (Legal, Financial, Data) (the criterion covers legal, financial, and data actions; the kit asks it of every destructive action)')], reviewed },
  { id: 'state-all-states-drawn', group: 'state', level: 'rule', plain: 'Every part has every state that the state sheet lists for it.', why: 'A state that nobody designed appears in the browser\'s default look, which gives the page away as unfinished.', check: { kind: 'person', ask: 'Go through the state sheet part by part. Can you bring each part into each listed state, and does each look intended?' }, evidence: 'expert-opinion', sources: [own], reviewed },
];
