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
import { getValidMemberId } from '@/lib/http/apiBase';

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
/*
 * WS-DEVELOP density views (spec §10 R2, §11.4, §13.1, 2026-11-09):
 * - The preference belongs to ONE signed-in writer: the key carries the member id, so a
 *   second writer on the same browser never inherits it. No member id → default, no write.
 * - The legacy unscoped key (PRESENTATION_STORAGE_KEY) has no verifiable owner, so it is
 *   never read and never adopted. It is left untouched, not deleted.
 * - A temporary choice "just for this Work" lives in sessionStorage: it survives refresh and
 *   chapter changes and ends with the browser session, or when cleared.
 * - Precedence: Work override > writer default > 'focused'.
 * Stored values stay 'focused' | 'guided' | 'full'; only on-screen labels change elsewhere.
 */
export const PRESENTATION_OVERRIDE_PREFIX = 'writers-studio:presentation-override:v1';
export type PresentationScope = { workId?: string | null };

let memberResolver: () => string | null = () => getValidMemberId();
/** Test seam only: replace how the signed-in member is resolved. */
export function __setPresentationMemberResolver(resolve: (() => string | null) | null): void {
  memberResolver = resolve ?? (() => getValidMemberId());
}
function currentMember(): string | null {
  try { const id = memberResolver(); return id && id.trim() ? id : null; } catch { return null; }
}
export function presentationKeyFor(memberId: string): string {
  return `${PRESENTATION_STORAGE_KEY}:${memberId}`;
}
export function presentationOverrideKeyFor(memberId: string, workId: string): string {
  return `${PRESENTATION_OVERRIDE_PREFIX}:${memberId}:${workId}`;
}
function readKey(store: 'localStorage' | 'sessionStorage', key: string): string | null {
  try { return window[store].getItem(key); } catch { return null; }
}
function hasDepth(raw: string | null): boolean {
  if (!raw) return false;
  try { const d: unknown = JSON.parse(raw); return typeof d === 'object' && d !== null && isStudioDepth((d as {depth?: unknown}).depth); }
  catch { return false; }
}

export function readStudioPresentation(scope: PresentationScope = {}): StudioPresentation {
  if (typeof window === 'undefined') return DEFAULT_PRESENTATION;
  const member = currentMember();
  if (!member) return DEFAULT_PRESENTATION;
  if (scope.workId) {
    const override = readKey('sessionStorage', presentationOverrideKeyFor(member, scope.workId));
    if (hasDepth(override)) return parseStudioPresentation(override);
  }
  return parseStudioPresentation(readKey('localStorage', presentationKeyFor(member)));
}
/** True when this Work has a temporary choice in effect for the signed-in writer. */
export function hasWorkPresentationOverride(workId: string | null | undefined): boolean {
  if (typeof window === 'undefined' || !workId) return false;
  const member = currentMember();
  return member ? hasDepth(readKey('sessionStorage', presentationOverrideKeyFor(member, workId))) : false;
}
/** In-tab change notice. It carries the choice itself, so a choice that could not be
 * stored (no signed-in writer, blocked storage) still holds for this session. */
export type PresentationChange = StudioPresentation & { workId: string | null; temporary: boolean };
function announce(presentation: StudioPresentation, workId: string | null = null, temporary = false): void {
  window.dispatchEvent(new CustomEvent<PresentationChange>(PRESENTATION_EVENT, {
    detail: { depth: presentation.depth, workId, temporary },
  }));
}
/**
 * Default: sets the writer's own default. With `{ workId, temporary: true }`: a choice for
 * this Work only, for this browser session.
 */
export function writeStudioPresentation(
  presentation: StudioPresentation,
  options: { workId?: string | null; temporary?: boolean } = {},
): void {
  if (!isStudioDepth(presentation.depth) || typeof window === 'undefined') return;
  const member = currentMember();
  if (member) {
    try {
      if (options.temporary && options.workId) {
        window.sessionStorage.setItem(presentationOverrideKeyFor(member, options.workId), JSON.stringify(presentation));
      } else {
        window.localStorage.setItem(presentationKeyFor(member), JSON.stringify(presentation));
      }
    } catch { /* Browser privacy mode still permits an in-session choice. */ }
  }
  const temporary = Boolean(options.temporary && options.workId);
  announce(presentation, temporary ? options.workId ?? null : null, temporary);
}
/** Ends the temporary choice for this Work; the writer's default applies again. */
export function clearWorkPresentationOverride(workId: string | null | undefined): void {
  if (typeof window === 'undefined' || !workId) return;
  const member = currentMember();
  if (member) {
    try { window.sessionStorage.removeItem(presentationOverrideKeyFor(member, workId)); } catch { /* nothing held */ }
  }
  announce(readStudioPresentation({ workId }), workId, true);
}
/**
 * Precedence holds for subscribers too: a temporary choice reaches only its own Work; a
 * change of default does not reach a Work whose temporary choice is still in effect.
 * Cross-tab changes are read back only from the signed-in writer's own key.
 */
export function subscribeStudioPresentation(
  onChange: (next: StudioPresentation) => void,
  scope: PresentationScope = {},
): () => void {
  if (typeof window === 'undefined') return () => {};
  const local = (event: Event) => {
    const change = (event as CustomEvent<Partial<PresentationChange>>).detail;
    if (!change || !isStudioDepth(change.depth)) return;
    if (change.temporary) {
      if (change.workId && change.workId === scope.workId) onChange({ depth: change.depth });
      return;
    }
    if (scope.workId && hasWorkPresentationOverride(scope.workId)) return;
    onChange({ depth: change.depth });
  };
  const storage = (event: StorageEvent) => {
    const member = currentMember();
    if (member && event.key === presentationKeyFor(member)) onChange(readStudioPresentation(scope));
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
