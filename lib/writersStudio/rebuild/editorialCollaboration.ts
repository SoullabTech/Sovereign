import { apiFetch } from '@/lib/http/apiBase';
import { occurrences } from '@/lib/manuscript/exactText';
import type { CurrentPostureRead } from '@/lib/sanctuary/currentClientPosture';
import type { ProposalPolicy } from '@/lib/manuscript/editorialScope/sequence';
import type { DispatchObservation } from '@/lib/ai/structured/dispatch';
import type { EditorialDepth } from '@/lib/writersStudio/editorialDepth';

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
  /** Verified server read includes the owning manuscript Work; older client fixtures may omit it. */
  workId?: string;
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
  | { ok: false; reason: 'unavailable' | 'unreadable' | 'locus_mismatch' | 'posture_unresolved' | 'sanctuary_unavailable' | 'relationship_required' | 'origin_unavailable'; detail?: string };
export function threadMatchesVisibleSection(
  thread: Pick<RebuildEditorialThread, 'targetSectionId'>,
  visibleDraftSectionId: string,
): boolean {
  return thread.targetSectionId === visibleDraftSectionId;
}

export async function readBoundEditorialThread(
  threadId: string,
  visibleDraftSectionId: string,
  relationshipId: string | null,
): Promise<BoundThreadOutcome> {
  if (!relationshipId) return { ok: false, reason: 'relationship_required' };
  try {
    const res = await apiFetch(
      `/api/writers-studio/editorial/thread?threadId=${encodeURIComponent(threadId)}&relationshipId=${encodeURIComponent(relationshipId)}`,
      { method: 'GET' },
    );
    const body = await res.json().catch(() => null);
    if (!res.ok) {
      const reason = body?.error === 'origin_unavailable' ? 'origin_unavailable'
        : body?.error === 'relationship_required' ? 'relationship_required'
          : res.status === 404 ? 'unavailable' : 'unreadable';
      return { ok: false, reason };
    }
    const thread = body as RebuildEditorialThread;
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
  relationshipId: string | null,
): Promise<BoundThreadOutcome> {
  if (!posture.resolved) return { ok: false, reason: 'posture_unresolved' };
  if (!relationshipId) return { ok: false, reason: 'relationship_required' };
  try {
    const res = await apiFetch('/api/writers-studio/editorial/thread', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ sectionId: visibleDraftSectionId, sanctuary: posture.sanctuary, relationshipId }),
    });
    const body = await res.json().catch(() => null);
    if (!res.ok) {
      if (body?.error === 'sanctuary_unavailable') return { ok: false, reason: 'sanctuary_unavailable' };
      if (body?.error === 'relationship_required') return { ok: false, reason: 'relationship_required' };
      if (body?.error === 'origin_unavailable') return { ok: false, reason: 'origin_unavailable' };
      return { ok: false, reason: res.status === 404 ? 'unavailable' : 'unreadable' };
    }
    if (!body || typeof body.threadId !== 'string') return { ok: false, reason: 'unreadable' };
    return readBoundEditorialThread(body.threadId, visibleDraftSectionId, relationshipId);
  } catch {
    return { ok: false, reason: 'unavailable' };
  }
}

export async function openBoundEditorialPassage(
  visibleDraftSectionId: string,
  range: { start: number; end: number },
  revisionNumber: number,
  posture: CurrentPostureRead,
  relationshipId: string | null,
): Promise<BoundThreadOutcome & { refusal?: string }> {
  if (!posture.resolved) return { ok: false, reason: 'posture_unresolved' };
  if (!relationshipId) return { ok: false, reason: 'relationship_required', refusal: 'relationship_required' };
  try {
    const res = await apiFetch('/api/writers-studio/rebuild/editorial/thread', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ sectionId: visibleDraftSectionId, range, revisionNumber, sanctuary: posture.sanctuary, relationshipId }),
    });
    const body = await res.json().catch(() => null);
    if (res.status === 409 && body?.error === 'sanctuary_unavailable') {
      return { ok: false, reason: 'sanctuary_unavailable' };
    }
    if (!res.ok) {
      const reason = body?.error === 'relationship_required' ? 'relationship_required'
        : body?.error === 'origin_unavailable' ? 'origin_unavailable'
          : res.status === 404 ? 'unavailable' : 'unreadable';
      return {
        ok: false,
        reason,
        detail: typeof body?.error === 'string' ? body.error : undefined,
        refusal: typeof body?.error === 'string' ? body.error : undefined,
      };
    }
    if (!body || typeof body.threadId !== 'string') return { ok: false, reason: 'unreadable' };
    return readBoundEditorialThread(body.threadId, visibleDraftSectionId, relationshipId);
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
      /** Exact persisted pair indexes, matched against the owned thread reread. */
      memberTurnIndex: number;
      maiaTurnIndex: number;
      /** ⭐ Carried on SUCCESS — noticing in time IS the protection. */
      voice: VoiceNotice | null;
    }
  | {
      ok: false;
      /** The existing server can commit the member act before MAIA fails.
       * A field here is a claimed act identity, NOT a durable UI display-text
       * receipt, cross-Work permission, or successful MAIA delivery. */
      memberTurnIndex?: number;
      /** Only the three defined dispatch observations can cross this seam.
       * 'unknown' must remain genuinely unknown; no retry is implied. */
      dispatch?: DispatchObservation;
      reason: 'unavailable' | 'unreadable' | 'locus_mismatch' | 'turn_refused' | 'scope_refused'
        | 'accountability_unresolved'
        | 'posture_unresolved' | 'sanctuary_unavailable' | 'relationship_required' | 'origin_unavailable';
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
    /** Explicit author-chosen explanation depth; never writer skill or edit authority. */
    responseDepth?: EditorialDepth;
    /** Selected durable Work-level editorial relationship, when carrying one. */
    relationshipId?: string;
    /** One explicitly selected prior MAIA editorial response from this relationship. */
    carry?: EditorialCarrySelection;
  } | string,
): Promise<EditorialTurnOutcome> {
  if (!posture.resolved) return { ok: false, reason: 'posture_unresolved' };
  const proposalPolicy = typeof options === 'string' ? undefined : options?.proposalPolicy;
  const responseDepth = typeof options === 'string' ? undefined : options?.responseDepth;
  const relationshipId = typeof options === 'string' ? options : options?.relationshipId;
  const carry = typeof options === 'string' ? undefined : options?.carry;
  if (!relationshipId) return { ok: false, reason: 'scope_refused', detail: 'relationship_required' };
  try {
    const res = await apiFetch('/api/writers-studio/editorial/turn', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        threadId, act: { act: 'discourse', text, refersTo: null },
        sanctuary: posture.sanctuary,
        ...(scope ? { scope } : {}),
        ...(proposalPolicy ? { proposalPolicy } : {}),
        ...(responseDepth ? { responseDepth } : {}),
        relationshipId,
        ...(carry ? { carry } : {}),
      }),
    });
    const body = await res.json().catch(() => null);
    // Only carry an act receipt for the EXACT thread named in this request.
    // No response is proof of current member/Work permission: the protected
    // server boundary owns that, while the caller rechecks active UI scope.
    const savedMemberIndex = body?.threadId === threadId
      && body?.persisted !== false
      && Number.isSafeInteger(body?.memberTurnIndex)
      && body.memberTurnIndex >= 0
      ? body.memberTurnIndex as number : null;
    const safeDispatch: DispatchObservation | undefined =
      body?.dispatch === 'response_observed'
      || body?.dispatch === 'no_response_observed'
      || body?.dispatch === 'unknown'
        ? body.dispatch as DispatchObservation : undefined;
    const priorAct = savedMemberIndex === null ? {} : {
      memberTurnIndex: savedMemberIndex,
      ...(safeDispatch ? { dispatch: safeDispatch } : {}),
    };
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
          ...priorAct,
          reason: 'turn_refused',
          detail: typeof body?.detail === 'string'
            ? body.detail
            : 'MAIA stayed in exploration. Nothing was added to the revision options.',
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
      if (res.status === 500 && body?.error === 'disclosure_confirmation_unresolved') {
        return {
          ok: false,
          ...priorAct,
          reason: 'accountability_unresolved',
          detail: 'MAIA may have received the passage, but Soullab could not confirm the disclosure record. The response was withheld. Nothing was applied, and this request will not be retried automatically.',
        };
      }
      if (res.status === 409 && (body?.scope || body?.voice || body?.error === 'sequence_discussion_first')) {
        return {
          ok: false, reason: 'scope_refused',
          ...priorAct,
          detail: typeof body?.detail === 'string' ? body.detail : undefined,
          ...(body?.scope ? { scope: body.scope } : {}),
          ...(body?.voice ? { voice: body.voice } : {}),
        };
      }
      return {
        ok: false,
        ...priorAct,
        reason: res.status === 404 ? 'unavailable' : 'turn_refused',
        detail: typeof body?.error === 'string' ? body.error : undefined,
      };
    }
    const producedVersionId = typeof body?.version?.id === 'string' ? body.version.id : null;
    const voice: VoiceNotice | null = body?.voice && typeof body.voice.note === 'string'
      ? { note: body.voice.note, unfamiliar: body.voice.unfamiliar ?? [],
          sampleWords: Number(body.voice.sampleWords) || 0 }
      : null;
    const reread = await readBoundEditorialThread(threadId, visibleDraftSectionId, relationshipId);
    if (!reread.ok) {
      // The server's matching, bounded 200 act index is still evidence that
      // *some composite member act was recorded*, even when a later GET fails.
      // This is NOT an authenticated current-Work grant, verified human-only
      // display copy, or confirmed MAIA reply. Never expose maiaTurnIndex or
      // automatically retry on an unreadable/possibly already-written act.
      return { ...reread, ...priorAct };
    }

    // HTTP 200 and a readable thread do not prove which *particular* author
    // act and MAIA reply this request produced. Require both server-named
    // turn indexes and EXACT speaker/body identity from the owned reread.
    // This comparison does not authorize a new Work or interpret prompt
    // scaffolding as human-display-safe writer wording.
    const memberTurnIndex = savedMemberIndex;
    const maiaTurnIndex = Number.isSafeInteger(body?.maiaTurnIndex)
      && body.maiaTurnIndex >= 0 ? body.maiaTurnIndex as number : null;
    const stored = reread.thread.turns;
    const writerTurns = Array.isArray(stored) && memberTurnIndex !== null
      ? stored.filter(turn => turn.turnIndex === memberTurnIndex && turn.speaker === 'author')
      : [];
    const maiaTurns = Array.isArray(stored) && maiaTurnIndex !== null
      ? stored.filter(turn => turn.turnIndex === maiaTurnIndex && turn.speaker === 'maia')
      : [];
    if (body?.threadId !== threadId
      || reread.thread.threadId !== threadId
      || memberTurnIndex === null || maiaTurnIndex === null
      || maiaTurnIndex <= memberTurnIndex
      || typeof body?.response !== 'string'
      || writerTurns.length !== 1 || writerTurns[0]?.body !== text
      || maiaTurns.length !== 1 || maiaTurns[0]?.body !== body.response) {
      return {
        ok: false, reason: 'unreadable',
        detail: 'The submitted writer act and MAIA reply could not be matched to exact persisted turn identities.',
      };
    }
    return { ok: true, thread: reread.thread, producedVersionId, voice,
      memberTurnIndex, maiaTurnIndex };
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
  relationshipId: string | null,
): Promise<{ ok: true; outcome: AdoptionWireOutcome } | { ok: false; reason: string }> {
  if (!relationshipId) return { ok: false, reason: 'relationship_required' };
  const before = await readBoundEditorialThread(threadId, visibleDraftSectionId, relationshipId);
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

/** Exact presentation-to-Source mapping remains an independently testable pure helper. */
export { locateUniquePresentationPassage } from '../presentationPassageLocator';
