import type { SiteContent } from '../templates/smallBusiness.js';
import { SAMPLE_CONTENT } from '../templates/smallBusiness.js';

export const BRIEF_STAGE = {
  id: 'brief',
  name: 'Brief',
  teach: 'Write what your business does, who the page is for, and what you want a visitor to do. Every preview uses your words as you type. You can leave a field empty and return later.',
  sources: [{ text: 'The owner’s Brief requirements for M5, unit 1; PLAN.md section 4.3.', basis: 'owner-file', record: 'PLAN.md' }],
  evidence: 'expert-opinion',
  reviewed: '2026-11-25',
} as const;

export interface BriefNotes {
  whatItDoes: string;
  audience: string;
  mainJob: string;
  voice: { tone: 'formal' | 'friendly'; length: 'brief' | 'detailed'; stance: 'modest' | 'confident' };
  wordsToAvoid: string[];
}

export const EMPTY_BRIEF: BriefNotes = {
  whatItDoes: '', audience: '', mainJob: '',
  voice: { tone: 'friendly', length: 'brief', stance: 'modest' }, wordsToAvoid: [],
};

export function isSampleContent(content: SiteContent): boolean {
  return (Object.keys(SAMPLE_CONTENT) as (keyof SiteContent)[]).every((key) => key === 'footerNote' || JSON.stringify(content[key]) === JSON.stringify(SAMPLE_CONTENT[key]));
}
