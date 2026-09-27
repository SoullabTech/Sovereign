import type { TransactionClient } from '@/lib/db/postgres';
import { query } from '@/lib/db/postgres';
import { getCapsuleById } from '@/lib/capsules';

export type CarrySourceFacet = 'journal' | 'reflections';
export type CarryTargetFacet = 'changes' | 'decisions';

export type FacetCarrySource = {
  facet: CarrySourceFacet;
  refId: string;
  label: string;
  excerpt: string;
  createdAt: string | null;
  returnHref: string;
};

export type FacetCrossingRef = {
  crossingId: string;
  sourceFacet: CarrySourceFacet;
  sourceRefId: string;
};

const ALLOWED_CROSSINGS: Record<
  string,
  { source: CarrySourceFacet; target: CarryTargetFacet }
> = {
  'journal-name-as-change': { source: 'journal', target: 'changes' },
  'reflection-name-as-change': { source: 'reflections', target: 'changes' },
  'journal-consider-decision': { source: 'journal', target: 'decisions' },
  'reflection-consider-decision': { source: 'reflections', target: 'decisions' },
};

function excerpt(text: string, max = 900): string {
  const clean = text.trim();
  return clean.length <= max ? clean : clean.slice(0, max).trimEnd() + '…';
}

function journalLabel(content: string): string {
  const first = content.split(/\n/)[0]?.trim() || '';
  if (!first) return 'Journal entry';
  return first.length <= 90 ? first : first.slice(0, 90).trimEnd() + '…';
}

export function crossingIsAllowed(
  crossingId: string,
  sourceFacet: string,
  targetFacet: CarryTargetFacet,
): sourceFacet is CarrySourceFacet {
  const allowed = ALLOWED_CROSSINGS[crossingId];
  return Boolean(allowed && allowed.source === sourceFacet && allowed.target === targetFacet);
}

export async function resolveFacetCarrySource(
  memberId: string,
  sourceFacet: CarrySourceFacet,
  sourceRefId: string,
): Promise<FacetCarrySource | null> {
  if (!sourceRefId) return null;

  if (sourceFacet === 'journal') {
    const result = await query<{
      id: string;
      content: string;
      created_at: string;
    }>(
      `SELECT q.id::text AS id, q.content, q.created_at::text AS created_at
         FROM quick_journal_entries q
        WHERE q.id::text = $1
          AND q.user_id IN (
            $2::text,
            COALESCE((SELECT username FROM members WHERE id = $3::uuid), ''),
            COALESCE((SELECT username || '-nezat' FROM members WHERE id = $3::uuid), '')
          )
        LIMIT 1`,
      [sourceRefId, memberId, memberId],
    );
    const row = result.rows[0];
    if (!row) return null;
    return {
      facet: 'journal',
      refId: row.id,
      label: journalLabel(row.content),
      excerpt: excerpt(row.content),
      createdAt: row.created_at,
      returnHref: '/journal?entry=' + encodeURIComponent(row.id),
    };
  }

  const capsule = await getCapsuleById({
    userId: memberId,
    capsuleId: sourceRefId,
  });
  if (!capsule) return null;

  return {
    facet: 'reflections',
    refId: capsule.id,
    label: capsule.title || 'Reflection',
    excerpt: excerpt(capsule.summary || capsule.sourceExcerpt || ''),
    createdAt: capsule.createdAt || null,
    returnHref: '/reflections/' + encodeURIComponent(capsule.id),
  };
}

export async function validateFacetCrossingSource(args: {
  memberId: string;
  targetFacet: CarryTargetFacet;
  sourceRef: FacetCrossingRef;
}): Promise<FacetCarrySource | null> {
  if (!crossingIsAllowed(args.sourceRef.crossingId, args.sourceRef.sourceFacet, args.targetFacet)) {
    return null;
  }
  return resolveFacetCarrySource(
    args.memberId,
    args.sourceRef.sourceFacet,
    args.sourceRef.sourceRefId,
  );
}

export async function recordFacetCrossing(
  client: TransactionClient,
  args: {
    memberId: string;
    crossingId: string;
    sourceFacet: CarrySourceFacet;
    sourceRefId: string;
    targetFacet: CarryTargetFacet;
    targetRefId: string;
  },
): Promise<void> {
  await client.query(
    `INSERT INTO member_facet_crossings
      (member_id, crossing_id, source_facet, source_ref_id, target_facet, target_ref_id)
     VALUES ($1,$2,$3,$4,$5,$6)
     ON CONFLICT (
       member_id, crossing_id, source_facet, source_ref_id, target_facet, target_ref_id
     ) DO NOTHING`,
    [
      args.memberId,
      args.crossingId,
      args.sourceFacet,
      args.sourceRefId,
      args.targetFacet,
      args.targetRefId,
    ],
  );
}
