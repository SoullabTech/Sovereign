import { apiFetch } from '@/lib/http/apiBase';
import { occurrences } from '@/lib/manuscript/exactText';
import type { CurrentPostureRead } from '@/lib/sanctuary/currentClientPosture';
import type { ProposalPolicy } from '@/lib/manuscript/editorialScope/sequence';
import { readWorkingStyle } from '@/lib/writersStudio/workingStyle';

/**
 * SANCTUARY-EDITORIAL-PERSISTENCE-01 / E1 — POSTURE IS CARRIED, NEVER DEFAULTED.
 *
 * Opening a relationship and sending a turn are durable acts. Each helper that
 * performs one takes the member's CURRENT posture as a REQUIRED argument — the
 * caller reads it at the gesture with `readCurrentSanctuaryPosture()` and hands
 * it in. An unresolved posture never reaches the network: the helper refuses
 * with `posture_unresolved` and posts nothing. The server independently
 * requires the boolean and refuses Sanctuary with `sanctuary_unavailable`.
 */

export interface RebuildEditorialVersion {
  id: string;
  author: 'maia' | 'member';
  wording: string;
  supersedes: string | null;
  rationale: string | null;
}

export interface RebuildEditorialThread {
  application?: { authorizationId: string; versionId: string; resultingVersion: number; undone: boolean; canUndo: boolean } | null;
  threadId: string;
  chainId: string;
  locusText: string;
  targetSectionId: string | null;
  sectionLabel: string | null;
  legacyLocus: boolean;
  turns: readonly {
    turnIndex: number;
    speaker: 'author' | 'maia';
    body: string;
    at: string;
  }[];
  versions: readonly RebuildEditorialVersion[];
  headVersionId: string | null;
}

export type BoundThreadOutcome =
  | { ok: true; thread: RebuildEditorialThread }
  | { ok: false; reason: 'unavailable' | 'unreadable' | 'locus_mismatch' | 'posture_unresolved' | 'sanctuary_unavailable'; detail?: string };
export function threadMatchesVisibleSection(
  thread: Pick<RebuildEditorialThread, 'targetSectionId'>,
  visibleDraftSectionId: string,
): boolean {
  return thread.targetSectionId === visibleDraftSectionId;
}

export async function readBoundEditorialThread(
  threadId: string,
  visibleDraftSectionId: string,
): Promise<BoundThreadOutcome> {
  try {
    const res = await apiFetch(
      `/api/writers-studio/editorial/thread?threadId=${encodeURIComponent(threadId)}`,
      { method: 'GET' },
    );
    if (!res.ok) return { ok: false, reason: res.status === 404 ? 'unavailable' : 'unreadable' };
    const thread = (await res.json()) as RebuildEditorialThread;
    if (!thread?.threadId || !threadMatchesVisibleSection(thread, visibleDraftSectionId)) {
      return {
        ok: false,
        reason: 'locus_mismatch',
        detail: `visible=${visibleDraftSectionId} thread=${thread?.targetSectionId ?? 'none'}`,
      };
    }
    return { ok: true, thread };
  } catch {
    return { ok: false, reason: 'unavailable' };
  }
}
export async function openBoundEditorialThread(
  visibleDraftSectionId: string,
  posture: CurrentPostureRead,
): Promise<BoundThreadOutcome> {
  if (!posture.resolved) return { ok: false, reason: 'posture_unresolved' };
  try {
    const res = await apiFetch('/api/writers-studio/editorial/thread', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ sectionId: visibleDraftSectionId, sanctuary: posture.sanctuary }),
    });
    if (res.status === 409) {
      const why = await res.json().catch(() => null);
      if (why?.error === 'sanctuary_unavailable') return { ok: false, reason: 'sanctuary_unavailable' };
      return { ok: false, reason: 'unreadable' };
    }
    if (!res.ok) return { ok: false, reason: res.status === 404 ? 'unavailable' : 'unreadable' };
    const body = await res.json().catch(() => null);
    if (!body || typeof body.threadId !== 'string') return { ok: false, reason: 'unreadable' };
    return readBoundEditorialThread(body.threadId, visibleDraftSectionId);
  } catch {
    return { ok: false, reason: 'unavailable' };
  }
}

export async function openBoundEditorialPassage(
  visibleDraftSectionId: string,
  range: { start: number; end: number },
  revisionNumber: number,
  posture: CurrentPostureRead,
): Promise<BoundThreadOutcome & { refusal?: string }> {
  if (!posture.resolved) return { ok: false, reason: 'posture_unresolved' };
  try {
    const res = await apiFetch('/api/writers-studio/rebuild/editorial/thread', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ sectionId: visibleDraftSectionId, range, revisionNumber, sanctuary: posture.sanctuary }),
    });
    const body = await res.json().catch(() => null);
    if (res.status === 409 && body?.error === 'sanctuary_unavailable') {
      return { ok: false, reason: 'sanctuary_unavailable' };
    }
    if (!res.ok) {
      return {
        ok: false,
        reason: res.status === 404 ? 'unavailable' : 'unreadable',
        detail: typeof body?.error === 'string' ? body.error : undefined,
        refusal: typeof body?.error === 'string' ? body.error : undefined,
      };
    }
    if (!body || typeof body.threadId !== 'string') return { ok: false, reason: 'unreadable' };
    return readBoundEditorialThread(body.threadId, visibleDraftSectionId);
  } catch {
    return { ok: false, reason: 'unavailable' };
  }
}

/** ⭐ What a suggestion brought in that is not the writer's. ⛔ Never a verdict. */
export interface VoiceNotice {
  note: string; unfamiliar: string[]; sampleWords: number;
}

export interface EditorialCarrySelection {
  readonly kind: 'prior_maia_editorial_turn';
  readonly sourceEpisodeSequence: number;
}

export type EditorialTurnOutcome =
  | {
      ok: true; thread: RebuildEditorialThread; producedVersionId: string | null;
      /** ⭐ Carried on SUCCESS — noticing in time IS the protection. */
      voice: VoiceNotice | null;
    }
  | {
      ok: false;
      reason: 'unavailable' | 'unreadable' | 'locus_mismatch' | 'turn_refused' | 'scope_refused'
        | 'posture_unresolved' | 'sanctuary_unavailable';
      detail?: string;
      voice?: VoiceNotice;
      /** ⭐ Counts only, present on a scope refusal. ⛔ Never the refused wording. */
      scope?: {
        authorWords: number; wouldRemoveWords: number;
        longestUnbrokenCut: number; wholeParagraphsRemoved: number;
        wouldPassAtLatitude: number | null;
      };
    };

export async function sendBoundEditorialTurn(
  threadId: string,
  visibleDraftSectionId: string,
  text: string,
  /** E1 — the member's CURRENT posture, read at the gesture. Required. */
  posture: CurrentPostureRead,
  /**
   * ⭐ THE AUTHOR'S EDITING LATITUDE for this exchange (WS-EDITORIAL-SCOPE-01).
   *
   * ⛔ Optional here so no caller is silently broken — and omitting it sends
   * nothing, which the server reads as the most protective setting. A caller
   * that forgets the slider gets "Touch" and no paragraph removal, never a
   * permission it did not ask for.
   */
  scope?: {
    latitude: number; mayRemoveParagraphs: boolean;
    /** ⭐ The per-Work release of the discuss-first order. ⛔ Default false. */
    mayProposeImmediately?: boolean;
  },
  options?: {
    /** Exploratory turns may close the outcome vocabulary to reply_only. */
    proposalPolicy?: ProposalPolicy;
    /** Selected durable Work-level editorial relationship, when carrying one. */
    relationshipId?: string;
    /** One explicitly selected prior MAIA editorial response from this relationship. */
    carry?: EditorialCarrySelection;
    /** R8G — source Work conversation to carry into the Craft turn; server re-resolves exact turns. */
    workConversationThreadId?: string;
    workConversationMaiaTurnIndex?: number;
    craftPassThreadId?: string;
    craftPassTurnIndex?: number;
  } | string,
): Promise<EditorialTurnOutcome> {
  if (!posture.resolved) return { ok: false, reason: 'posture_unresolved' };
  const proposalPolicy = typeof options === 'string' ? undefined : options?.proposalPolicy;
  const relationshipId = typeof options === 'string' ? options : options?.relationshipId;
  const carry = typeof options === 'string' ? undefined : options?.carry;
  const workConversationThreadId = typeof options === 'string' ? undefined : options?.workConversationThreadId;
  const craftPassThreadId = typeof options === 'string' ? undefined : options?.craftPassThreadId;
  const craftPassTurnIndex = typeof options === 'string' ? undefined : options?.craftPassTurnIndex;
  const workConversationMaiaTurnIndex = typeof options === 'string' ? undefined : options?.workConversationMaiaTurnIndex;
  try {
    const res = await apiFetch('/api/writers-studio/editorial/turn', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        threadId, act: { act: 'discourse', text, refersTo: null },
        sanctuary: posture.sanctuary,
        workingStyle: readWorkingStyle(),
        ...(scope ? { scope } : {}),
        ...(proposalPolicy ? { proposalPolicy } : {}),
        ...(relationshipId ? { relationshipId } : {}),
        ...(carry ? { carry } : {}),
        ...(workConversationThreadId ? { workConversationThreadId } : {}),
        ...(craftPassThreadId ? { craftPassThreadId, craftPassTurnIndex } : {}),
        ...(workConversationMaiaTurnIndex !== undefined ? { workConversationMaiaTurnIndex } : {}),
      }),
    });
    const body = await res.json().catch(() => null);
    if (!res.ok) {
      /* E1 — Sanctuary is a refusal in the member's terms, never a fault. */
      if (res.status === 409 && body?.error === 'sanctuary_unavailable') {
        return { ok: false, reason: 'sanctuary_unavailable' };
      }
      /* ⭐⭐ A SCOPE REFUSAL IS A RESULT, NOT A FAILURE. The server held the
         author's latitude. The surface must say what happened in the author's
         terms — ⛔ never surface `scope_removes_paragraphs` as a raw error
         code, and never imply the request broke. */
      if (res.status === 409 && body?.error === 'proposal_policy_reply_only') {
        return {
          ok: false,
          reason: 'turn_refused',
          detail: typeof body?.detail === 'string'
            ? body.detail
            : 'MAIA stayed in exploration. Nothing was added to the revision options.',
        };
      }
      if (res.status === 409 && body?.error === 'proposal_policy_requires_proposal') {
        return {
          ok: false,
          reason: 'turn_refused',
          detail: typeof body?.detail === 'string'
            ? body.detail
            : 'You asked for wording, but MAIA did not return a bounded proposal. Nothing was added to the marked copy.',
        };
      }
      if (res.status === 409 && body?.error === 'noop_editorial_adjustment') {
        return {
          ok: false,
          reason: 'turn_refused',
          detail: typeof body?.detail === 'string'
            ? body.detail
            : 'That adjustment repeated the existing proposal unchanged. Nothing new was added.',
        };
      }
      if (res.status === 409 && (body?.scope || body?.voice || body?.error === 'sequence_discussion_first')) {
        return {
          ok: false, reason: 'scope_refused',
          detail: typeof body?.detail === 'string' ? body.detail : undefined,
          ...(body?.scope ? { scope: body.scope } : {}),
          ...(body?.voice ? { voice: body.voice } : {}),
        };
      }
      return {
        ok: false,
        reason: res.status === 404 ? 'unavailable' : 'turn_refused',
        detail: typeof body?.error === 'string' ? body.error : undefined,
      };
    }
    const producedVersionId = typeof body?.version?.id === 'string' ? body.version.id : null;
    const voice: VoiceNotice | null = body?.voice && typeof body.voice.note === 'string'
      ? { note: body.voice.note, unfamiliar: body.voice.unfamiliar ?? [],
          sampleWords: Number(body.voice.sampleWords) || 0 }
      : null;
    const reread = await readBoundEditorialThread(threadId, visibleDraftSectionId);
    if (!reread.ok) return reread;
    return { ok: true, thread: reread.thread, producedVersionId, voice };
  } catch {
    return { ok: false, reason: 'unavailable' };
  }
}

export interface AdoptionWireOutcome {
  kind: 'applied' | 'work_moved' | 'system_refusal' | 'legacy_locus'
    | 'protected_quotation' | 'relationship_refusal';
  resultingVersion?: number;
  reason?: string;
  byThisGesture?: boolean;
}

export async function adoptBoundEditorialVersion(
  threadId: string,
  visibleDraftSectionId: string,
  versionId: string,
): Promise<{ ok: true; outcome: AdoptionWireOutcome } | { ok: false; reason: string }> {
  const before = await readBoundEditorialThread(threadId, visibleDraftSectionId);
  if (!before.ok) return { ok: false, reason: before.reason };
  if (!before.thread.versions.some((v) => v.id === versionId)) {
    return { ok: false, reason: 'version_not_in_bound_thread' };
  }
  try {
    const res = await apiFetch('/api/writers-studio/editorial/adoption', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ threadId, versionId }),
    });
    const body = await res.json().catch(() => null);
    if (!body || typeof body.kind !== 'string') {
      return { ok: false, reason: 'unreadable_outcome' };
    }
    return { ok: true, outcome: body as AdoptionWireOutcome };
  } catch {
    return { ok: false, reason: 'unavailable' };
  }
}

export function exactVersion(
  thread: RebuildEditorialThread,
  versionId: string | null,
): RebuildEditorialVersion | null {
  if (!versionId) return null;
  return thread.versions.find((v) => v.id === versionId) ?? null;
}

/**
 * The wording that may lawfully anchor a resumed editorial relationship.
 *
 * The proposal chain's `locusText` remains immutable custody of the words the
 * relationship began against. After an explicit Apply, those words may no
 * longer exist in the live Work. While the server still reports that exact
 * application as undoable, return may orient to the exact applied version
 * named by the durable receipt. No other version and no inferred wording may
 * replace the frozen locus.
 */
export function returnLocusText(thread: RebuildEditorialThread): string {
  const application = thread.application;
  if (application && !application.undone && application.canUndo) {
    const applied = exactVersion(thread, application.versionId);
    if (applied) return applied.wording;
  }
  return thread.locusText;
}

export interface ChangeSpan {
  before: string;
  changed: string;
  after: string;
}

export function changedSpan(current: string, proposed: string): ChangeSpan {
  let prefix = 0;
  const limit = Math.min(current.length, proposed.length);
  while (prefix < limit && current[prefix] === proposed[prefix]) prefix += 1;

  let suffix = 0;
  while (
    suffix < current.length - prefix && suffix < proposed.length - prefix
    && current[current.length - 1 - suffix] === proposed[proposed.length - 1 - suffix]
  ) suffix += 1;

  return {
    before: proposed.slice(0, prefix),
    changed: proposed.slice(prefix, proposed.length - suffix),
    after: suffix === 0 ? '' : proposed.slice(proposed.length - suffix),
  };
}

export interface RebuildEditorialRelationship {
  threadId: string;
  chainId: string;
  sectionId: string;
  sectionLabel: string | null;
  locusText: string;
  openedAt: string;
  lastSpokeAt: string | null;
  turnCount: number;
  versionCount: number;
  legacyLocus: boolean;
}

export type RelationshipDiscovery =
  | { ok: true; relationships: readonly RebuildEditorialRelationship[] }
  | { ok: false; reason: 'unavailable' | 'unreadable' };

export async function discoverEditorialRelationships(
  visibleDraftSectionId: string,
): Promise<RelationshipDiscovery> {
  try {
    const res = await apiFetch(
      `/api/writers-studio/editorial/relationships?sectionId=${encodeURIComponent(visibleDraftSectionId)}`,
      { method: 'GET' },
    );
    if (!res.ok) return { ok: false, reason: res.status === 404 ? 'unavailable' : 'unreadable' };
    const body = await res.json().catch(() => null);
    if (!body || !Array.isArray(body.relationships)) return { ok: false, reason: 'unreadable' };
    return { ok: true, relationships: body.relationships as RebuildEditorialRelationship[] };
  } catch {
    return { ok: false, reason: 'unavailable' };
  }
}

export function locateUniquePassage(
  body: string, expected: string,
): { start: number; end: number } | null {
  if (!expected || occurrences(body, expected) !== 1) return null;
  const unitIndex = body.indexOf(expected);
  if (unitIndex < 0) return null;
  const start = [...body.slice(0, unitIndex)].length;
  return { start, end: start + [...expected].length };
}

const PRINT_FOLIO_LINE = /^\d{1,4}$/;

function comparablePoints(text: string): string[] {
  const out: string[] = [];
  let pendingSpace = false;
  for (const point of Array.from(text.trim())) {
    if (/\s/u.test(point)) {
      pendingSpace = true;
      continue;
    }
    if (pendingSpace && out.length > 0) out.push(' ');
    out.push(point);
    pendingSpace = false;
  }
  return out;
}

function bodyComparable(body: string): { points: string[]; rawOffsets: number[] } {
  const points: string[] = [];
  const rawOffsets: number[] = [];
  const lines = body.replace(/\r\n?/g, '\n').split('\n');
  let rawOffset = 0;
  let pendingSpace = false;

  for (const line of lines) {
    const linePoints = Array.from(line);
    if (!PRINT_FOLIO_LINE.test(line.trim())) {
      for (let i = 0; i < linePoints.length; i += 1) {
        const point = linePoints[i]!;
        if (/\s/u.test(point)) {
          pendingSpace = true;
          continue;
        }
        if (pendingSpace && points.length > 0) {
          points.push(' ');
          rawOffsets.push(rawOffset + i);
        }
        points.push(point);
        rawOffsets.push(rawOffset + i);
        pendingSpace = false;
      }
      pendingSpace = true; // a source line break is semantic whitespace
    }
    rawOffset += linePoints.length + 1; // + source newline
  }
  return { points, rawOffsets };
}

/**
 * Locate text selected from the semantic Edit projection back in the canonical
 * section body. It collapses extraction whitespace and skips standalone print
 * folios in the comparison space, but still requires ONE unique match and
 * returns canonical code-point coordinates. No fuzzy wording match is allowed.
 */
export function locateUniquePresentationPassage(
  body: string,
  expected: string,
): { start: number; end: number } | null {
  /* Uniqueness is judged in the same whitespace/folio-collapsed space the
     writer is looking at. An exact raw occurrence is not enough when another
     visually identical occurrence exists only because one is soft-wrapped. */
  const needle = comparablePoints(expected);
  if (needle.length === 0) return null;
  const comparable = bodyComparable(body);
  const hits: number[] = [];
  for (let start = 0; start <= comparable.points.length - needle.length; start += 1) {
    let match = true;
    for (let j = 0; j < needle.length; j += 1) {
      if (comparable.points[start + j] !== needle[j]) { match = false; break; }
    }
    if (match) hits.push(start);
    if (hits.length > 1) return null;
  }
  if (hits.length !== 1) return null;
  const startIndex = hits[0]!;
  const rawStart = comparable.rawOffsets[startIndex];
  const rawEndPoint = comparable.rawOffsets[startIndex + needle.length - 1];
  if (rawStart === undefined || rawEndPoint === undefined) return null;
  return { start: rawStart, end: rawEndPoint + 1 };
}
