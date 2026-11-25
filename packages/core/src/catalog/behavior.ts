import type { Option, SourceRef, Step } from './types.js';

const reviewed = '2026-11-25';
const source = (section: string): SourceRef[] => [{ text: `Repository research record 02, ${section}. Read here as a summary, not rechecked against the original sources. The concrete choices are the assistant's examples, not tested rankings.`, basis: 'abstract', record: 'docs/research/02-your-files-pdfs-and-documents.md' }];
const motion = source('Phase 8: motion, and reference rule 40.03');
const focus = source('the critique prompt on contrast and focus, and the form and state matrix');
const states = source('empty and error states, forms, and the state matrix');
const voice = source('the voice glossary, banned phrases, and Brief and content-truth gates');
const option = (id: string, label: string, what: string, chooseWhen: string, risk: string, patch: Option['patch'], sources: SourceRef[]): Option => ({ id, label, what, chooseWhen, risk, patch, sources, evidence: 'expert-opinion', reviewed });
const common = { stage: 'behavior', evidence: 'expert-opinion', reviewed } as const;

export const BEHAVIOR_STEPS: Step[] = [
  { ...common, id: 'motion-timing', name: 'Motion timing', title: 'How does a change start and settle?', teach: 'The Motion Step sets how much moves. This Step sets the speed and how that speed changes (the motion curve). Compare a quick start, a steady pace, and a gentle start and finish. No motion still means no motion, and the device setting for less motion always wins. The still pictures show timing diagrams, not a recording.', variable: 'The pace of a change', owns: ['motionTiming'], focus: 'timing', thumb: { width: 600, note: 'The dots mark roughly the quarter-time position. Play the large preview to see movement; No motion and the device setting for less motion stop it.' }, defaultOptionId: 'settle', sources: motion, options: [
    option('settle', 'Quick start, soft stop', 'Starts quickly and settles; ordinary changes take 200 milliseconds.', 'Frequent presses that need a quick answer.', 'The quick start can feel abrupt.', { motionTiming: 'settle' }, motion),
    option('steady', 'Steady pace', 'Moves at an even speed; ordinary changes take 160 milliseconds.', 'Small, direct changes.', 'The stop can feel sudden.', { motionTiming: 'steady' }, motion),
    option('gentle', 'Gentle start and stop', 'Builds speed and slows again; ordinary changes take 280 milliseconds.', 'Less frequent changes that need a softer pace.', 'Repeated use can feel slower.', { motionTiming: 'gentle' }, motion),
  ] },
  { ...common, id: 'focus-style', name: 'Keyboard focus', title: 'How do you see where the keyboard is?', teach: 'A keyboard user needs to see which control will answer the next key (keyboard focus). Every choice keeps a mark with contrast of at least 3 to 1 against the adjacent ground. The marked field is a static example; the Fitter must still check real keyboard travel and that no part hides the mark.', variable: 'The shape of the focus mark', owns: ['focusStyle'], focus: 'focus', thumb: { width: 600 }, defaultOptionId: 'outline', sources: focus, options: [
    option('outline', 'Solid line', 'A three-pixel solid line surrounds the control.', 'A simple, continuous mark.', 'A person must check that nearby edges do not hide it.', { focusStyle: 'outline' }, focus),
    option('dashed', 'Dashed line', 'A four-pixel dashed line surrounds the control.', 'A mark distinct from solid box edges.', 'A person must check the gaps on small controls.', { focusStyle: 'dashed' }, focus),
    option('double', 'Two lines', 'A six-pixel double line surrounds the control.', 'A stronger mark with room around controls.', 'The wider mark needs clear space.', { focusStyle: 'double' }, focus),
  ] },
  { ...common, id: 'empty-state', name: 'Empty list', title: 'What helps when a list has nothing in it?', teach: 'An empty list should explain what happened and what a person can do next. The preview shows a demonstration, not your real services. Your saved service text does not change. The Fitter must decide which real empty situations need different messages.', variable: 'The help beside an empty list', owns: ['emptyState'], focus: 'empty', thumb: { width: 600 }, defaultOptionId: 'guide', sources: states, options: [
    option('guide', 'Next action first', 'A short explanation leads straight to the next action.', 'The next action is clear.', 'Too little explanation may confuse a first visit.', { emptyState: 'guide' }, states),
    option('example', 'Show an example', 'A clearly marked example teaches what could go here.', 'A new visitor may not know what belongs in the list.', 'An example must never pass for real work.', { emptyState: 'example' }, states),
    option('explain', 'Explain before asking', 'A fuller explanation comes before the next action.', 'An empty result could look like lost work.', 'The extra reading can get in the way.', { emptyState: 'explain' }, states),
  ] },
  { ...common, id: 'error-state', name: 'Form errors', title: 'Where does a form explain a mistake?', teach: 'An error names the problem and how to put it right without clearing the person’s work. The preview shows an invalid phone field without sending anything. Every choice names the error in words, not color alone. The Fitter must implement focus movement and announce new errors on the built page.', variable: 'Where the error explanation sits', owns: ['errorState'], focus: 'error', thumb: { width: 600 }, defaultOptionId: 'inline', sources: states, options: [
    option('inline', 'Beside the field', 'The explanation sits immediately below the phone field.', 'A short form with one mistake.', 'A mistake far down a longer form can be missed.', { errorState: 'inline' }, states),
    option('summary', 'At the start', 'A summary at the start links to the invalid phone field.', 'A visitor needs an overview before correcting the form.', 'The Fitter must move focus to the summary after a failed send.', { errorState: 'summary' }, states),
    option('both', 'Overview and field', 'A linked overview and a field explanation work together.', 'A longer form or several mistakes.', 'Repeated text needs careful writing.', { errorState: 'both' }, states),
  ] },
  { ...common, id: 'voice', name: 'Voice and tone', title: 'How does the page’s own help speak?', teach: 'These choices write the same voice settings as the Brief, not a second copy. They change only the Template’s own labels and help, never your words. The Brief can set other combinations; those appear here as Your design now. Changing this Step replaces the Brief’s three voice settings. Putting it back uses Friendly and brief, not an earlier Brief draft; Undo can restore the draft.', variable: 'The voice of fixed help', owns: [], briefVoice: true, focus: 'voice', thumb: { width: 600 }, defaultOptionId: 'friendly', sources: voice, options: [
    { ...option('friendly', 'Friendly and brief', 'Friendly, brief and modest help.', 'A short, welcoming exchange.', 'Some tasks need more explanation.', {}, voice), voice: { tone: 'friendly', length: 'brief', stance: 'modest' } },
    { ...option('formal', 'Formal and direct', 'Formal, brief and confident help.', 'A businesslike task.', 'It can feel distant.', {}, voice), voice: { tone: 'formal', length: 'brief', stance: 'confident' } },
    { ...option('detailed', 'Friendly and detailed', 'Friendly, detailed and modest help.', 'A first visit that needs more guidance.', 'More words take longer to read.', {}, voice), voice: { tone: 'friendly', length: 'detailed', stance: 'modest' } },
  ] },
];
