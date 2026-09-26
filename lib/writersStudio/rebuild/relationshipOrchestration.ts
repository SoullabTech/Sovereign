import { apiFetch } from '@/lib/http/apiBase';

export interface A2RelationshipSummary {
  readonly id: string;
  readonly livingWorkId: string;
  readonly manuscriptId: string;
  readonly createdAt: string;
  readonly episodeCount: number;
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
    const relationship = summaryOf(body?.relationship,
      Array.isArray(body?.episodes) ? body.episodes.length : undefined);
    return relationship
      ? { ok: true, relationship }
      : { ok: false, reason: 'unreadable' };
  } catch {
    return { ok: false, reason: 'unavailable' };
  }
}

