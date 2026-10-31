/**
 * Member-requested PRESENTATION preferences, never member identity, manuscript
 * interpretation, privacy consent, editorial authorization, or AI instructions.
 *
 * Narrow local-only rules deliberately REFUSE ambiguous language. Any approved
 * change needs an explicit confirmation gesture; no conversation is posted,
 * no original manuscript bytes stored, and no hidden profiling.
 */
import {
  DEFAULT_WORKING_STYLE,
  type WriterWorkingStyle,
} from './workingStyle';
import type { StudioReadingSize } from './readingSizePreference';

export type StudioDepth = 'focused' | 'guided' | 'full';
export interface StudioPresentation { depth: StudioDepth }
export const PRESENTATION_STORAGE_KEY = 'writers-studio:presentation:v1';
export const PRESENTATION_EVENT = 'writers-studio:presentation-changed';
export const DEFAULT_PRESENTATION: StudioPresentation = { depth: 'focused' };

export function isStudioDepth(v: unknown): v is StudioDepth {
  return v === 'focused' || v === 'guided' || v === 'full';
}
export function parseStudioPresentation(raw: string | null): StudioPresentation {
  if (!raw) return DEFAULT_PRESENTATION;
  try {
    const data: unknown = JSON.parse(raw);
    if (typeof data === 'object' && data !== null && 'depth' in data) {
      const depth = (data as {depth?: unknown}).depth;
      if (isStudioDepth(depth)) return { depth };
    }
  } catch { /* A malformed preference is never a product error. */ }
  return DEFAULT_PRESENTATION;
}
export function readStudioPresentation(): StudioPresentation {
  if (typeof window === 'undefined') return DEFAULT_PRESENTATION;
  try { return parseStudioPresentation(window.localStorage.getItem(PRESENTATION_STORAGE_KEY)); }
  catch { return DEFAULT_PRESENTATION; }
}
export function writeStudioPresentation(presentation: StudioPresentation): void {
  if (!isStudioDepth(presentation.depth) || typeof window === 'undefined') return;
  try { window.localStorage.setItem(PRESENTATION_STORAGE_KEY, JSON.stringify(presentation)); }
  catch { /* Browser privacy mode still permits an in-session choice. */ }
  window.dispatchEvent(new CustomEvent<StudioPresentation>(PRESENTATION_EVENT, { detail: presentation }));
}
export function subscribeStudioPresentation(onChange: (next: StudioPresentation) => void): () => void {
  if (typeof window === 'undefined') return () => {};
  const local = (event: Event) => {
    const data = (event as CustomEvent<StudioPresentation>).detail;
    if (data && isStudioDepth(data.depth)) onChange(data);
  };
  const storage = (event: StorageEvent) => {
    if (event.key === PRESENTATION_STORAGE_KEY) onChange(parseStudioPresentation(event.newValue));
  };
  window.addEventListener(PRESENTATION_EVENT, local);
  window.addEventListener('storage', storage);
  return () => {
    window.removeEventListener(PRESENTATION_EVENT, local);
    window.removeEventListener('storage', storage);
  };
}
export type SafePresentationProposal = {
  label: string;
  explanation: string;
  style: WriterWorkingStyle;
  depth: StudioDepth | null;
  readingSize: StudioReadingSize | null;
};
/** Allow very explicit, ordinary language; don't guess from literary text. */
export function proposePresentationRequest(
  raw: string,
  currentStyle: WriterWorkingStyle = DEFAULT_WORKING_STYLE,
): SafePresentationProposal | null {
  const text = raw.trim().toLowerCase().replace(/^(maia[,.:!]?\s*)/, '').trim();
  if (!text || text.length > 150 || /[\n\r][\s\S]+/.test(text)) return null;
  // A direct, intentional request—not quoted dialogue, fiction, or an editorial
  // instruction that merely happens to CONTAIN a command phrase.
  if (!/^(?:(?:please|can you|could you|would you|i want you to|i would like you to)\s+)?(?:show|give|make|use|explain|guide|walk|keep|simplify|focus|talk|go deeper|more depth|deeper reasoning|expert language|full view|full workspace|fewer choices|fewer options|less clutter|less overwhelm|less busy|larger text|larger type|bigger text|step.by.step|a little more guidance)\b/.test(text)) return null;
  // A command with negation or a contradictory request is not safe to infer.
  if (/\b(don't|do not|never|not|without|unless|instead of)\b/.test(text)) return null;
  const make = (label: string, explanation: string, style: WriterWorkingStyle,
    depth: StudioDepth | null, readingSize: StudioReadingSize | null = null): SafePresentationProposal =>
    ({ label, explanation, style, depth, readingSize });
  if (/\b(fewer (choices|options|buttons)|less (clutter|busy|overwhelm)|simplif(y|ied)|one (thing|step) at a time|keep it simple|focus (the|my) (screen|view))\b/.test(text)
    && !/\b(all|more|full|expert)\b/.test(text)) {
    return make('A quieter Studio', 'Show three human-language choices first and respond plainly.',
      { pace:'intimate', explanation:'plain' }, 'focused');
  }
  if (/\b(walk me through|step[ -]by[ -]step|guide me|help me gradually|a little more guidance)\b/.test(text)
    && !/\b(all|full|expert)\b/.test(text)) {
    return make('Gentle guidance', 'Offer a little more structure as you choose each step.',
      { pace:'guided', explanation:'guided' }, 'guided');
  }
  if (/\b(show (me )?(all|the full|every) (the )?(tools|options|views|controls)|full (view|workspace|toolset)|give me the full (view|map))\b/.test(text)
    && !/\b(fewer|less|simple)\b/.test(text)) {
    return make('Full editorial view', 'Reveal the expert navigation and preserve all existing tools.',
      { ...currentStyle, pace:'mapped' }, 'full');
  }
  if (/\b(talk (to me|with me) (like|as) an expert|use (expert|professional|technical) (language|terms)|expert language)\b/.test(text)) {
    return make('Expert language', 'Use professional terminology without extra introductory explanation.',
      { ...currentStyle, explanation:'expert' }, null);
  }
  if (/\b(use (plain|everyday|simple) language|explain (it |this )?in plain (english|language)|less jargon)\b/.test(text)) {
    return make('Plain language', 'Use everyday language and explain one idea at a time.',
      { ...currentStyle, explanation:'plain' }, null);
  }
  if (/\b(go deeper|more depth|deeper reasoning|explain (more|in depth))\b/.test(text)) {
    return make('Deeper explanations', 'Offer more reasoning without automatically showing more controls.',
      { ...currentStyle, explanation:'deep' }, null);
  }
  if (/\b(make (the )?(text|writing|type) larger|larger (text|type|print)|bigger (text|type|print))\b/.test(text)) {
    return make('Larger reading text', 'Increase reading size without changing the writing itself.',
      currentStyle, null, 'larger');
  }
  return null;
}
