import type { SavedCraftVersionReference } from './craftSaveContractR1';
import type { RebuildSection } from './rebuild/model';
import type { RebuildEditorialVersion } from './rebuild/editorialCollaboration';
import { locateUniquePresentationPassage } from './rebuild/editorialCollaboration';
import type { CraftDecision } from './craftWorkingCopy';
import { typesetProseBlocks } from '@/app/writers-studio/full-redesign/manuscriptTypesetting';

/** Focus changes attention, never manuscript content. Every target carries the
 * exact canonical interval that must still match at the user's Work here act. */
export interface CraftFocusTarget {
  sectionId: string;
  start: number;
  end: number;
  text: string;
  revisionNumber: number;
  label: string;
  sectionLabel: string;
  source: 'writer' | 'maia';
  quote?: string;
}
export interface CraftKeptSpan { start: number; end: number; text: string }
export interface CraftTableSnapshot {
  key: string;
  candidateVersion: RebuildEditorialVersion | null;
  decisions: readonly (readonly [number, CraftDecision])[];
  manualText: string | null;
  manualFromVersionId: string | null;
  directDraft: string;
  directEditing: boolean;
  customDraft: string;
  customEditId: number | null;
  writerHasActed: boolean;
  activeEditId: number | null;
  view: 'markup' | 'preview';
  notation: 'guided' | 'professional';
  kept: readonly CraftKeptSpan[];
  workingText: string;
  original: string;
}
export interface CraftCanvasReceipt {
  ok: boolean;
  message: string;
  settled?: CraftKeptSpan;
  reopened?: CraftKeptSpan;
}
export interface CraftTablePort {
  snapshot: () => CraftTableSnapshot | null;
  keepOriginal: (word: string, action?: 'keep' | 'restore') => CraftCanvasReceipt;
  replaceWorking: (from: string, to: string) => CraftCanvasReceipt;
  setView: (view: 'markup' | 'preview') => CraftCanvasReceipt;
}

const points = (text: string) => Array.from(text);
const flat = (text: string) => text.replace(/\s+/gu, ' ').trim();

export function craftTargetKey(target: Pick<CraftFocusTarget, 'sectionId' | 'start' | 'end' | 'text'>): string {
  return JSON.stringify([target.sectionId, target.start, target.end, target.text]);
}

export function craftParagraphLabel(text: string): string {
  const shown = flat(text);
  // A label is navigation, not a finding. Retain an explicitly named movement
  // when the author supplies one; otherwise use the paragraph's opening words.
  const named = /^[^.?!]{0,70}\bmoves?\s+(?:into|toward)\s+([A-Z][\p{L}-]+)/u.exec(shown);
  if (named?.[1]) return named[1];
  return shown.length > 72 ? shown.slice(0, 69).trimEnd() + '…' : shown;
}

export function makeCraftTarget(
  section: RebuildSection, body: string, selectedText: string,
  revisionNumber: number, source: CraftFocusTarget['source'],
): CraftFocusTarget | null {
  const located = locateUniquePresentationPassage(body, selectedText);
  if (!located) return null;
  const text = points(body).slice(located.start, located.end).join('');
  return { sectionId: section.draftSectionId, ...located, text, revisionNumber,
    label: craftParagraphLabel(text), sectionLabel: section.heading || 'Untitled section', source };
}

export function targetStillMatches(target: CraftFocusTarget, body: string, revisionNumber: number): boolean {
  return revisionNumber === target.revisionNumber
    && Number.isSafeInteger(target.start) && Number.isSafeInteger(target.end)
    && target.start >= 0 && target.end > target.start && target.end <= points(body).length
    && points(body).slice(target.start, target.end).join('') === target.text;
}

export function paragraphTargets(
  sections: readonly RebuildSection[], bodyOf: (sectionId: string) => string,
  revisionNumber: number,
): CraftFocusTarget[] {
  const targets: CraftFocusTarget[] = [];
  for (const section of sections) {
    const body = bodyOf(section.draftSectionId);
    // Use the same paragraph projection the writer sees, including imported
    // print wraps. Projection never grants coordinates: each block must still
    // map uniquely to exact canonical source before becoming a focus candidate.
    for (const block of typesetProseBlocks(body)) {
      if (block.kind !== 'paragraph' && block.kind !== 'epigraph' && block.kind !== 'list') continue;
      const target = makeCraftTarget(section, body, block.text, revisionNumber, 'writer');
      if (target) targets.push(target);
    }
  }
  return targets;
}

/** A quoted reference licenses a doorway, not an edit. Unquoted thematic
 * resemblance is deliberately insufficient. No first-match or fuzzy fallback. */
export function referencedCraftTargets(
  targets: readonly CraftFocusTarget[], maiaBody: string,
): CraftFocusTarget[] {
  const quotes = [...maiaBody.matchAll(/[“"]([^”"\n]{18,600})[”"]/gu)]
    .map(match => flat(match[1]!));
  const matches = new Map<string, string>();
  for (const quote of quotes) {
    const candidates = targets.filter(target => flat(target.text).includes(quote));
    if (candidates.length === 1) matches.set(craftTargetKey(candidates[0]!), quote);
  }
  // Preserve manuscript order. This is not a ranked attention map.
  return targets.filter(target => matches.has(craftTargetKey(target)))
    .map(target => ({ ...target, source: 'maia', quote: matches.get(craftTargetKey(target))! }));
}

export function resolveNamedCraftTarget(
  targets: readonly CraftFocusTarget[], name: string,
): CraftFocusTarget | null {
  const needle = flat(name).replace(/[.!?]+$/u, '').replace(/^the\s+/iu, '')
    .replace(/\s+(?:paragraph|passage|section)(?:\s+(?:you\s+)?(?:identified|mentioned))?$/iu, '').toLocaleLowerCase();
  if (needle.length < 3) return null;
  const exact = targets.filter(t => t.label.toLocaleLowerCase() === needle);
  if (exact.length === 1) return exact[0]!;
  if (exact.length > 1) return null;
  const quoted = targets.filter(t => flat(t.text).toLocaleLowerCase().startsWith(needle));
  return quoted.length === 1 ? quoted[0]! : null;
}

/** Manuscript-order navigation is independent of model recommendations. A
 * partial selection advances beyond its containing paragraph, not into it. */
export function adjacentCraftTarget(
  targets: readonly CraftFocusTarget[], current: CraftFocusTarget | null,
  direction: 'previous' | 'next', unit: 'passage' | 'section' = 'passage',
): CraftFocusTarget | null {
  if (!current) return null;
  const indices = targets.map((target, index) => ({ target, index }))
    .filter(({ target }) => target.sectionId === current.sectionId
      && (unit === 'section' || (target.start < current.end && target.end > current.start)))
    .map(({ index }) => index);
  if (!indices.length) return null;
  const index = direction === 'next' ? indices[indices.length - 1]! + 1 : indices[0]! - 1;
  return targets[index] ?? null;
}

export type CraftCanvasCommand =
  | { kind: 'keep'; word: string; remainder: string }
  | { kind: 'restore'; word: string }
  | { kind: 'replace'; from: string; to: string }
  | { kind: 'focus'; name: string }
  | { kind: 'step'; direction: 'previous' | 'next'; unit: 'passage' | 'section' }
  | { kind: 'stay' }
  | { kind: 'view'; view: 'markup' | 'preview' };

/** Only the writer's visible utterance is parsed, never a model reply or
 * internal prompt. Apply/Save are intentionally absent from this vocabulary. */
export function parseCraftCanvasCommand(request: string): CraftCanvasCommand | null {
  const text = request.trim().replace(/^please\s+/iu, '');
  // Restoring named original words is the same bounded writer-owned operation
  // as Keep mine, not permission for a fresh AI proposal. Bare yes/it/that,
  // questions, future conditions and additional operations are not commands.
  const restoreText = text.replace(/^yes(?:,\s*|\s+)/iu, '').replace(/^please\s+/iu, '');
  const namedWords = String.raw`(?:"([^"\n]{1,160})"|“([^”\n]{1,160})”|'([^'\n]{1,160})'|‘([^’\n]{1,160})’|([\p{L}\p{M}\p{N}_]+(?:[-’'][\p{L}\p{M}\p{N}_]+)*))`;
  const restoreEnd = String.raw`(?:\s+in\s+(?:my|the)\s+working\s+copy)?(?:\s+and\s+leave\s+(?:the\s+)?rest\s+as\s+it\s+is)?[.!]?$`;
  const restore = new RegExp(String.raw`^put\s+${namedWords}\s+back${restoreEnd}`, 'iu').exec(restoreText)
    ?? new RegExp(String.raw`^restore\s+${namedWords}${restoreEnd}`, 'iu').exec(restoreText);
  if (restore) {
    const word = restore.slice(1).find(value => value !== undefined)?.trim();
    if (!word || (restore[5] !== undefined && /^(?:it|this|that|them|everything|all)$/iu.test(word))) return null;
    return { kind: 'restore', word };
  }
  const keep = /^keep\s+[“"']([^”"'\n]{1,160})[”"'](?:\s+(?:and\s+)?(?:treat\s+(?:that|this)\s+choice\s+as\s+settled\s+for\s+this\s+pass|settle\s+(?:it|this)(?:\s+for\s+this\s+pass)?))?[.!]?\s*/iu.exec(text);
  if (keep) {
    const suffix = text.slice(keep[0].length).trim();
    // A question or condition is not an immediate command. The keep clause
    // must finish before a separate discussion/read request can follow.
    const clauseEnded = /[.!]\s*$/u.test(keep[0]);
    if (suffix && !clauseEnded) return null;
    return { kind: 'keep', word: keep[1]!, remainder: suffix };
  }
  const replace = /^replace\s+[“"']([^”"'\n]+)[”"']\s+with\s+[“"']([^”"'\n]*)[”"']\s+in\s+(?:my|the)\s+working\s+copy[.!]?$/iu.exec(text);
  if (replace) return { kind: 'replace', from: replace[1]!, to: replace[2]! };
  const step = /^(?:(?:go|move)(?:\s+us)?\s+to\s+(?:the\s+)?|let['’]s\s+)?(next|previous)\s+(passage|paragraph|section)[.!]?$/iu.exec(text);
  if (step) return { kind: 'step', direction: step[1]!.toLowerCase() as 'previous' | 'next', unit: step[2]!.toLowerCase() === 'section' ? 'section' : 'passage' };
  const move = /^(?:move\s+(?:us\s+)?to|focus\s+on|work\s+on|let['’]s\s+work\s+on)\s+([^\n.!?]+)[.!]?$/iu.exec(text);
  if (move) return { kind: 'focus', name: move[1]! };
  if (/^(?:let['’]s\s+)?(?:stay\s+here|keep\s+working\s+here)[.!]?$/iu.test(text)) return { kind: 'stay' };
  if (/^(?:show\s+(?:me\s+)?(?:the\s+)?(?:clean\s+)?)?preview(?:\s+this)?[.!]?$/iu.test(text)) return { kind: 'view', view: 'preview' };
  if (/^(?:show\s+(?:me\s+)?(?:the\s+)?)?markup[.!]?$/iu.test(text)) return { kind: 'view', view: 'markup' };
  return null;
}

export interface CraftFocusBinding {
  savedVersions?: readonly SavedCraftVersionReference[];
  savedVersionsUnavailable?: boolean;
  onResumeSaved?: (saved: SavedCraftVersionReference) => void;
  current: CraftFocusTarget | null;
  restoreSnapshot: CraftTableSnapshot | null;
  receipt: string | null;
  suggestions: readonly CraftFocusTarget[];
  earlier: readonly CraftFocusTarget[];
  onMove: (target: CraftFocusTarget) => boolean;
  onMoveAndSuggest?: (target: CraftFocusTarget) => boolean;
  onStay: () => void;
  onAsk: () => void;
  onConnect: (port: CraftTablePort | null) => void;
  onReceipt: (receipt: CraftCanvasReceipt) => void;
}
