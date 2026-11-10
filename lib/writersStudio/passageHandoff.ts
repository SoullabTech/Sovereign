/**
 * DESIGN 1B AMENDMENT 2 (founder, 2026-11-09, "Yes, amend it") · `open-desk` — the passage the writer is discussing with MAIA, handed
 * to Write's passage desk. Develop leaves the chapter id and the writer's OWN selected words; Write reads them once and holds that exact
 * passage only if the words occur once, in a saved chapter. Otherwise it opens the chapter and says why. Nothing is changed by the hand-off:
 * the desk proposes, the writer decides there.
 */
import { locateAnchor } from './developmentPlan';

export const PASSAGE_HANDOFF_EVENT = 'ws-passage-handoff';
export const PASSAGE_HANDOFF_KEY = (manuscriptId: string): string => `ws-passage:${manuscriptId}`;

export type PassageHandoff = { sectionId: string; text: string };

export function encodePassageHandoff(h: PassageHandoff): string { return JSON.stringify({ sectionId: h.sectionId, text: h.text }); }
export function decodePassageHandoff(raw: string | null): PassageHandoff | null {
  if (!raw) return null;
  try {
    const j = JSON.parse(raw) as Partial<PassageHandoff>;
    return typeof j.sectionId === 'string' && typeof j.text === 'string' && j.text.trim() ? { sectionId: j.sectionId, text: j.text } : null;
  } catch { return null; }
}

export type PassageHandoffDecision =
  | { kind: 'hold'; sectionId: string; start: number; end: number; text: string }
  | { kind: 'refuse'; reason: keyof typeof PASSAGE_HANDOFF_REFUSAL_COPY; focusSectionId?: string };

export const PASSAGE_HANDOFF_REFUSAL_COPY = {
  no_section: 'That chapter could not be found in this Work. Nothing was changed.',
  not_ready: 'The chapter is still opening here. Choose “Open the passage desk” again in a moment. Nothing was changed.',
  unsaved: 'This chapter has changes that are not saved yet. Let it save, then choose “Open the passage desk” again. Nothing was changed.',
  missing: 'Those words are not in this chapter as they were. The chapter is open; select the passage you mean. Nothing was changed.',
  ambiguous: 'Those words appear more than once in this chapter. The chapter is open; select the passage you mean. Nothing was changed.',
} as const;

/** Pure: may Write hold this passage? Only exact, unique words in a saved chapter. */
export function decidePassageHandoff(i: {
  handoff: PassageHandoff;
  sectionIds: readonly string[];
  saveStateOf: (sectionId: string) => string | undefined;
  bodyOf: (sectionId: string) => string | undefined;
}): PassageHandoffDecision {
  const sid = i.handoff.sectionId;
  if (!i.sectionIds.includes(sid)) return { kind: 'refuse', reason: 'no_section' };
  const save = i.saveStateOf(sid);
  const body = i.bodyOf(sid);
  if (save === undefined || body === undefined) return { kind: 'refuse', reason: 'not_ready', focusSectionId: sid };
  if (save !== 'clean') return { kind: 'refuse', reason: 'unsaved', focusSectionId: sid };
  const found = locateAnchor(body, i.handoff.text);
  if (!found.ok) return { kind: 'refuse', reason: found.reason, focusSectionId: sid };
  return { kind: 'hold', sectionId: sid, start: found.start, end: found.end, text: found.text };
}
