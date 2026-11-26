import type { SiteContent } from '../templates/smallBusiness.js';
import { SAMPLE_CONTENT, contactPageContent } from '../templates/smallBusiness.js';
import type { Voice } from '../params.js';

export const BRIEF_STAGE = {
  id: 'brief',
  name: 'Brief',
  teach: 'Write notes for the Fitter, then edit the page text used in the pictures. Page text updates the previews as you type; Fitter notes do not appear on the website. You can leave a field empty and return later.',
  sources: [{ text: 'The owner’s Brief requirements for M5, unit 1; PLAN.md section 4.3.', basis: 'owner-file', record: 'PLAN.md' }],
  evidence: 'expert-opinion',
  reviewed: '2026-11-25',
} as const;

export interface BriefNotes {
  whatItDoes: string;
  audience: string;
  mainJob: string;
  voice: Voice;
  wordsToAvoid: string[];
}

export const EMPTY_BRIEF: BriefNotes = {
  whatItDoes: '', audience: '', mainJob: '',
  voice: { tone: 'friendly', length: 'brief', stance: 'modest' }, wordsToAvoid: [],
};

export function isSampleContent(content: SiteContent): boolean {
  return (!content.contactPage || JSON.stringify(content.contactPage) === JSON.stringify(contactPageContent(SAMPLE_CONTENT))) && (Object.keys(SAMPLE_CONTENT) as (keyof SiteContent)[]).every((key) => JSON.stringify(content[key]) === JSON.stringify(SAMPLE_CONTENT[key]));
}

export function hasSampleWords(content: SiteContent): boolean {
  const matches = (value: unknown, sample: unknown): boolean => {
    if (typeof sample === 'string') return sample.length > 0 && value === sample;
    if (typeof sample !== 'object' || sample === null || typeof value !== 'object' || value === null) return false;
    return Object.entries(sample).some(([key, item]) => matches((value as Record<string, unknown>)[key], item));
  };
  return matches({ ...content, contactPage: contactPageContent(content) }, { ...SAMPLE_CONTENT, contactPage: contactPageContent(SAMPLE_CONTENT) });
}
