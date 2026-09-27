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

export type FacetFlowEndpoint = {
  facet: CarrySourceFacet | CarryTargetFacet;
  refId: string;
  label: string;
  href: string;
};

export type FacetFlowProjection = {
  id: string;
  crossingId: string;
  source: FacetFlowEndpoint | null;
  target: FacetFlowEndpoint | null;
  createdAt: string;
};

export type FacetFlowEvidence = {
  flowId: string;
  crossingId: string;
  source: {
    facet: CarrySourceFacet;
    refId: string;
    label: string;
    excerpt: string;
    href: string;
  };
  target: {
    facet: CarryTargetFacet;
    refId: string;
    label: string;
    excerpt: string;
    href: string;
  };
  createdAt: string;
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

const CARRY_SOURCE_FACETS = new Set<CarrySourceFacet>(['journal', 'reflections']);
const CARRY_TARGET_FACETS = new Set<CarryTargetFacet>(['changes', 'decisions']);

function isCarrySourceFacet(value: string): value is CarrySourceFacet {
  return CARRY_SOURCE_FACETS.has(value as CarrySourceFacet);
}

function isCarryTargetFacet(value: string): value is CarryTargetFacet {
  return CARRY_TARGET_FACETS.has(value as CarryTargetFacet);
}

export async function resolveFacetTarget(
  memberId: string,
  targetFacet: CarryTargetFacet,
  targetRefId: string,
): Promise<FacetFlowEndpoint | null> {
  if (!targetRefId) return null;

  if (targetFacet === 'changes') {
    const result = await query<{ id: string; title: string }>(
      `SELECT id::text AS id, title
         FROM studio_changes
        WHERE id::text = $1
          AND member_id = $2::uuid
        LIMIT 1`,
      [targetRefId, memberId],
    );
    const row = result.rows[0];
    return row
      ? {
          facet: 'changes',
          refId: row.id,
          label: row.title,
          href: '/changes?change=' + encodeURIComponent(row.id),
        }
      : null;
  }

  const result = await query<{ id: string; title: string }>(
    `SELECT id::text AS id, title
       FROM studio_decisions
      WHERE id::text = $1
        AND decision_scope = 'personal'
        AND personal_member_id = $2::uuid
      LIMIT 1`,
    [targetRefId, memberId],
  );
  const row = result.rows[0];
  return row
    ? {
        facet: 'decisions',
        refId: row.id,
        label: row.title,
        href: '/decisions/' + encodeURIComponent(row.id),
      }
    : null;
}

async function resolveFacetTargetEvidence(
  memberId: string,
  targetFacet: CarryTargetFacet,
  targetRefId: string,
): Promise<FacetFlowEvidence['target'] | null> {
  if (targetFacet === 'changes') {
    const result = await query<{ id: string; title: string; description: string }>(
      `SELECT id::text AS id, title, description
         FROM studio_changes
        WHERE id::text = $1
          AND member_id = $2::uuid
        LIMIT 1`,
      [targetRefId, memberId],
    );
    const row = result.rows[0];
    return row
      ? {
          facet: 'changes',
          refId: row.id,
          label: row.title,
          excerpt: excerpt(row.description),
          href: '/changes?change=' + encodeURIComponent(row.id),
        }
      : null;
  }

  const result = await query<{ id: string; title: string; context: string }>(
    `SELECT id::text AS id, title, context
       FROM studio_decisions
      WHERE id::text = $1
        AND decision_scope = 'personal'
        AND personal_member_id = $2::uuid
      LIMIT 1`,
    [targetRefId, memberId],
  );
  const row = result.rows[0];
  return row
    ? {
        facet: 'decisions',
        refId: row.id,
        label: row.title,
        excerpt: excerpt(row.context),
        href: '/decisions/' + encodeURIComponent(row.id),
      }
    : null;
}

export async function loadFacetFlowEvidence(
  memberId: string,
  flowId: string,
): Promise<FacetFlowEvidence | null> {
  const result = await query<{
    id: string;
    crossing_id: string;
    source_facet: string;
    source_ref_id: string;
    target_facet: string;
    target_ref_id: string;
    created_at: string;
  }>(
    `SELECT id::text AS id, crossing_id, source_facet, source_ref_id,
            target_facet, target_ref_id, created_at::text AS created_at
       FROM member_facet_crossings
      WHERE id::text = $1
        AND member_id = $2::uuid
      LIMIT 1`,
    [flowId, memberId],
  );
  const row = result.rows[0];
  if (!row || !isCarrySourceFacet(row.source_facet) || !isCarryTargetFacet(row.target_facet)) {
    return null;
  }

  const [source, target] = await Promise.all([
    resolveFacetCarrySource(memberId, row.source_facet, row.source_ref_id),
    resolveFacetTargetEvidence(memberId, row.target_facet, row.target_ref_id),
  ]);
  if (!source || !target) return null;

  return {
    flowId: row.id,
    crossingId: row.crossing_id,
    source: {
      facet: source.facet,
      refId: source.refId,
      label: source.label,
      excerpt: source.excerpt,
      href: source.returnHref,
    },
    target,
    createdAt: row.created_at,
  };
}

export async function loadRecentFacetFlows(
  memberId: string,
  limit = 8,
): Promise<FacetFlowProjection[]> {
  const boundedLimit = Math.min(Math.max(limit, 1), 20);
  const result = await query<{
    id: string;
    crossing_id: string;
    source_facet: string;
    source_ref_id: string;
    target_facet: string;
    target_ref_id: string;
    created_at: string;
  }>(
    `SELECT id::text AS id, crossing_id, source_facet, source_ref_id,
            target_facet, target_ref_id, created_at::text AS created_at
       FROM member_facet_crossings
      WHERE member_id = $1::uuid
      ORDER BY created_at DESC
      LIMIT $2`,
    [memberId, boundedLimit],
  );

  return Promise.all(
    result.rows.map(async (row) => {
      const source = isCarrySourceFacet(row.source_facet)
        ? await resolveFacetCarrySource(memberId, row.source_facet, row.source_ref_id)
        : null;
      const target = isCarryTargetFacet(row.target_facet)
        ? await resolveFacetTarget(memberId, row.target_facet, row.target_ref_id)
        : null;

      return {
        id: row.id,
        crossingId: row.crossing_id,
        source: source
          ? {
              facet: source.facet,
              refId: source.refId,
              label: source.label,
              href: source.returnHref,
            }
          : null,
        target,
        createdAt: row.created_at,
      };
    }),
  );
}
