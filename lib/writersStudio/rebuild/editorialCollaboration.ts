import { apiFetch } from '@/lib/http/apiBase';
import { occurrences } from '@/lib/manuscript/exactText';

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
  | { ok: false; reason: 'unavailable' | 'unreadable' | 'locus_mismatch'; detail?: string };
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
): Promise<BoundThreadOutcome> {
  try {
    const res = await apiFetch('/api/writers-studio/editorial/thread', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ sectionId: visibleDraftSectionId }),
    });
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
): Promise<BoundThreadOutcome & { refusal?: string }> {
  try {
    const res = await apiFetch('/api/writers-studio/rebuild/editorial/thread', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ sectionId: visibleDraftSectionId, range, revisionNumber }),
    });
    const body = await res.json().catch(() => null);
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

export type EditorialTurnOutcome =
  | { ok: true; thread: RebuildEditorialThread; producedVersionId: string | null }
  | { ok: false; reason: 'unavailable' | 'unreadable' | 'locus_mismatch' | 'turn_refused'; detail?: string };

export async function sendBoundEditorialTurn(
  threadId: string,
  visibleDraftSectionId: string,
  text: string,
): Promise<EditorialTurnOutcome> {
  try {
    const res = await apiFetch('/api/writers-studio/editorial/turn', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ threadId, act: { act: 'discourse', text, refersTo: null } }),
    });
    const body = await res.json().catch(() => null);
    if (!res.ok) {
      return {
        ok: false,
        reason: res.status === 404 ? 'unavailable' : 'turn_refused',
        detail: typeof body?.error === 'string' ? body.error : undefined,
      };
    }
    const producedVersionId = typeof body?.version?.id === 'string' ? body.version.id : null;
    const reread = await readBoundEditorialThread(threadId, visibleDraftSectionId);
    if (!reread.ok) return reread;
    return { ok: true, thread: reread.thread, producedVersionId };
  } catch {
    return { ok: false, reason: 'unavailable' };
  }
}

export interface AdoptionWireOutcome {
  kind: 'applied' | 'work_moved' | 'system_refusal' | 'legacy_locus' | 'relationship_refusal';
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
