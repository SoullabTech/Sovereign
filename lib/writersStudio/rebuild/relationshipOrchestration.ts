import { apiFetch } from '@/lib/http/apiBase';
import {
  exactVersion,
  locateUniquePassage,
  type RebuildEditorialThread,
} from './editorialCollaboration';

export interface A2RelationshipSummary {
  readonly id: string;
  readonly livingWorkId: string;
  readonly manuscriptId: string;
  readonly createdAt: string;
  readonly episodeCount: number;
  /**
   * Present only after the protected relationship-detail read. This is derived
   * from the newest server-owned EDITORIAL_TURN episode; list/create responses
   * carry no thread authority and therefore leave it absent.
   */
  readonly latestEditorialThreadId?: string | null;
}

export type RelationshipListOutcome =
  | { readonly ok: true; readonly relationships: readonly A2RelationshipSummary[] }
  | { readonly ok: false; readonly reason: 'unavailable' | 'unreadable' };

export type RelationshipCreateOutcome =
  | { readonly ok: true; readonly relationship: A2RelationshipSummary }
  | { readonly ok: false; readonly reason: 'unavailable' | 'refused' };

export type RelationshipReadOutcome =
  | { readonly ok: true; readonly relationship: A2RelationshipSummary }
  | { readonly ok: false; readonly reason: 'not_found' | 'unavailable' | 'unreadable' };

function summaryOf(raw: any, episodeCount?: number): A2RelationshipSummary | null {
  if (!raw || typeof raw.id !== 'string' || typeof raw.livingWorkId !== 'string'
      || typeof raw.manuscriptId !== 'string') return null;
  const createdAt = typeof raw.createdAt === 'string'
    ? raw.createdAt
    : raw.createdAt instanceof Date
      ? raw.createdAt.toISOString()
      : '';
  const count = episodeCount ?? Number(raw.episodeCount);
  return {
    id: raw.id,
    livingWorkId: raw.livingWorkId,
    manuscriptId: raw.manuscriptId,
    createdAt,
    episodeCount: Number.isFinite(count) ? count : 0,
  };
}

export async function listA2Relationships(
  livingWorkId: string,
  manuscriptId: string,
): Promise<RelationshipListOutcome> {
  try {
    const q = new URLSearchParams({ livingWorkId, manuscriptId });
    const res = await apiFetch(`/api/writers-studio/relationships?${q.toString()}`);
    if (!res.ok) return { ok: false, reason: 'unavailable' };
    const body = await res.json().catch(() => null);
    if (!body || !Array.isArray(body.relationships)) return { ok: false, reason: 'unreadable' };
    const relationships = body.relationships
      .map((raw: unknown) => summaryOf(raw))
      .filter((x: A2RelationshipSummary | null): x is A2RelationshipSummary => x !== null);
    if (relationships.length !== body.relationships.length) return { ok: false, reason: 'unreadable' };
    return { ok: true, relationships };
  } catch {
    return { ok: false, reason: 'unavailable' };
  }
}

export async function createA2Relationship(
  livingWorkId: string,
  manuscriptId: string,
): Promise<RelationshipCreateOutcome> {
  try {
    const res = await apiFetch('/api/writers-studio/relationships', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ livingWorkId, manuscriptId }),
    });
    const body = await res.json().catch(() => null);
    if (!res.ok) return { ok: false, reason: 'refused' };
    const relationship = summaryOf(body?.relationship, 0);
    return relationship
      ? { ok: true, relationship }
      : { ok: false, reason: 'unavailable' };
  } catch {
    return { ok: false, reason: 'unavailable' };
  }
}

type ReturnEpisodeParse =
  | { readonly ok: true; readonly latestEditorialThreadId: string | null }
  | { readonly ok: false };

/**
 * Parse only the minimum server-owned episode facts needed to recover a
 * relationship-bound editorial thread. Any schema drift fails closed; the
 * client never falls back to URL, localStorage, prose similarity or position.
 */
export function parseReturnEditorialEpisode(raw: unknown): ReturnEpisodeParse {
  if (!Array.isArray(raw)) return { ok: false };
  let latest: { sequence: number; threadId: string } | null = null;
  const sequences = new Set<number>();
  for (const item of raw) {
    if (!item || typeof item !== 'object' || Array.isArray(item)) return { ok: false };
    const episode = item as Record<string, unknown>;
    const sequence = episode.sequence;
    if (!Number.isInteger(sequence) || Number(sequence) < 1 || sequences.has(Number(sequence))) {
      return { ok: false };
    }
    sequences.add(Number(sequence));
    if (episode.childKind === 'REVIEW_DISCUSS') {
      if (episode.continuationAuthorized !== false) return { ok: false };
      continue;
    }
    if (episode.childKind !== 'EDITORIAL_TURN'
      || episode.continuationAuthorized !== true
      || episode.authorityClass !== 'EDITORIAL_CHAIN'
      || typeof episode.threadId !== 'string'
      || episode.threadId.length < 1
      || episode.threadId.length > 200
      || /[\u0000-\u001f]/.test(episode.threadId)) {
      return { ok: false };
    }
    if (!latest || Number(sequence) > latest.sequence) {
      latest = { sequence: Number(sequence), threadId: episode.threadId };
    }
  }
  return { ok: true, latestEditorialThreadId: latest?.threadId ?? null };
}

export interface EditorialReturnBinding {
  readonly source: 'original_locus' | 'active_application';
  readonly text: string;
  readonly start: number;
  readonly end: number;
}

function exactReturnBinding(
  liveText: string,
  expectedText: string,
  source: EditorialReturnBinding['source'],
): EditorialReturnBinding | null {
  const located = locateUniquePassage(liveText, expectedText);
  return located ? { source, text: expectedText, ...located } : null;
}

/**
 * Recover the exact visible locus for a protected editorial thread.
 *
 * The original locus remains the first authority when it still appears once.
 * After an explicit Apply, the original may correctly be absent. In that case
 * only the server-owned current application may nominate a replacement: it
 * must still be undoable, must name an exact saved version in this protected
 * thread, and that exact wording must appear once in the current section.
 * Head/latest versions, URL state, prose similarity and client memory confer
 * no return authority.
 */
export function resolveEditorialReturnBinding(
  thread: RebuildEditorialThread,
  liveText: string,
): EditorialReturnBinding | null {
  const original = exactReturnBinding(liveText, thread.locusText, 'original_locus');
  if (original) return original;

  const application = thread.application;
  if (!application || application.undone || application.canUndo !== true) return null;
  const appliedVersion = exactVersion(thread, application.versionId);
  if (!appliedVersion) return null;
  return exactReturnBinding(liveText, appliedVersion.wording, 'active_application');
}

export async function readA2Relationship(
  relationshipId: string,
): Promise<RelationshipReadOutcome> {
  try {
    const res = await apiFetch(
      `/api/writers-studio/relationships/${encodeURIComponent(relationshipId)}`
    );
    if (res.status === 404) return { ok: false, reason: 'not_found' };
    if (!res.ok) return { ok: false, reason: 'unavailable' };
    const body = await res.json().catch(() => null);
    const episodes = parseReturnEditorialEpisode(body?.episodes);
    if (!episodes.ok) return { ok: false, reason: 'unreadable' };
    const relationship = summaryOf(body?.relationship, body.episodes.length);
    return relationship
      ? { ok: true, relationship: {
          ...relationship,
          latestEditorialThreadId: episodes.latestEditorialThreadId,
        } }
      : { ok: false, reason: 'unreadable' };
  } catch {
    return { ok: false, reason: 'unavailable' };
  }
}


export interface EligibleCarrySource {
  readonly kind: 'prior_maia_editorial_turn';
  readonly sourceEpisodeSequence: number;
  readonly sourceScope: 'passage' | 'section';
  readonly admittedAt: string;
  readonly excerpt: string;
  readonly excerptTruncated: boolean;
}

export type CarrySourceReadOutcome =
  | { readonly ok: true; readonly sources: readonly EligibleCarrySource[] }
  | { readonly ok: false; readonly reason: 'unavailable' | 'unreadable' | 'receiver_refused' };

const LIST_KEYS = ['relationshipId', 'receiverThreadId', 'sources'] as const;
const SOURCE_KEYS = [
  'kind', 'sourceEpisodeSequence', 'sourceScope', 'admittedAt', 'excerpt', 'excerptTruncated',
] as const;

function exactKeys(value: Record<string, unknown>, keys: readonly string[]): boolean {
  const actual = Object.keys(value).sort();
  const expected = [...keys].sort();
  return actual.length === expected.length && actual.every((key, index) => key === expected[index]);
}

function parseEligibleCarrySource(raw: unknown): EligibleCarrySource | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const source = raw as Record<string, unknown>;
  if (!exactKeys(source, SOURCE_KEYS)) return null;
  if (source.kind !== 'prior_maia_editorial_turn') return null;
  if (!Number.isInteger(source.sourceEpisodeSequence) || Number(source.sourceEpisodeSequence) < 1) return null;
  if (!(source.sourceScope === 'passage' || source.sourceScope === 'section')) return null;
  if (typeof source.admittedAt !== 'string' || !Number.isFinite(Date.parse(source.admittedAt))) return null;
  if (typeof source.excerpt !== 'string' || Array.from(source.excerpt).length > 320) return null;
  if (typeof source.excerptTruncated !== 'boolean') return null;
  return {
    kind: 'prior_maia_editorial_turn',
    sourceEpisodeSequence: Number(source.sourceEpisodeSequence),
    sourceScope: source.sourceScope,
    admittedAt: source.admittedAt,
    excerpt: source.excerpt,
    excerptTruncated: source.excerptTruncated,
  };
}

export async function readEligibleCarrySources(
  relationshipId: string,
  receiverThreadId: string,
): Promise<CarrySourceReadOutcome> {
  try {
    const query = new URLSearchParams({ receiverThreadId });
    const res = await apiFetch(
      `/api/writers-studio/relationships/${encodeURIComponent(relationshipId)}/carry-sources?${query.toString()}`,
      { method: 'GET' },
    );
    if (!res.ok) {
      return { ok: false, reason: res.status === 409 ? 'receiver_refused' : 'unavailable' };
    }
    const body = await res.json().catch(() => null);
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return { ok: false, reason: 'unreadable' };
    }
    const record = body as Record<string, unknown>;
    if (!exactKeys(record, LIST_KEYS)) return { ok: false, reason: 'unreadable' };
    if (record.relationshipId !== relationshipId || record.receiverThreadId !== receiverThreadId) {
      return { ok: false, reason: 'unreadable' };
    }
    if (!Array.isArray(record.sources)) return { ok: false, reason: 'unreadable' };
    const sources = record.sources.map(parseEligibleCarrySource);
    if (sources.some((source) => source === null)) return { ok: false, reason: 'unreadable' };
    return { ok: true, sources: sources as readonly EligibleCarrySource[] };
  } catch {
    return { ok: false, reason: 'unavailable' };
  }
}
