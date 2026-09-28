import type { TransactionClient } from '@/lib/db/postgres';
import { query } from '@/lib/db/postgres';
import { getCapsuleById } from '@/lib/capsules';
import { resolveDivinationSymbolicSourcePacket } from '@/lib/house/symbolicSource.server';

export type CarrySourceFacet = 'journal' | 'dream' | 'reflections' | 'ideas' | 'relationships' | 'changes' | 'decisions' | 'divination';
export type CarryTargetFacet = 'changes' | 'decisions' | 'journal' | 'anchor';
export type RelationSourceFacet = CarrySourceFacet | 'astrology';
export type RelationTargetFacet = CarryTargetFacet | 'reflections';
export type FlowFacet = RelationSourceFacet | RelationTargetFacet;

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
  facet: FlowFacet;
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
    facet: RelationSourceFacet;
    refId: string;
    label: string;
    excerpt: string;
    href: string;
  };
  target: {
    facet: RelationTargetFacet;
    refId: string;
    label: string;
    excerpt: string;
    href: string;
  };
  createdAt: string;
};

const ALLOWED_CROSSINGS: Record<
  string,
  { source: CarrySourceFacet; target: CarryTargetFacet; ideaBlockType?: 'decision' | 'change' }
> = {
  'journal-name-as-change': { source: 'journal', target: 'changes' },
  'reflection-name-as-change': { source: 'reflections', target: 'changes' },
  'journal-consider-decision': { source: 'journal', target: 'decisions' },
  'reflection-consider-decision': { source: 'reflections', target: 'decisions' },
  'idea-shift-to-changes': { source: 'ideas', target: 'changes', ideaBlockType: 'change' },
  'idea-decision-to-decisions': { source: 'ideas', target: 'decisions', ideaBlockType: 'decision' },
  'relationship-name-change': { source: 'relationships', target: 'changes' },
  'relationship-consider-decision': { source: 'relationships', target: 'decisions' },
  'relationship-write-journal': { source: 'relationships', target: 'journal' },
  'change-carry-to-anchor': { source: 'changes', target: 'anchor' },
  'decision-hold-today': { source: 'decisions', target: 'anchor' },
  'reflection-carry-today': { source: 'reflections', target: 'anchor' },
  'dream-carry-today': { source: 'dream', target: 'anchor' },
  'divination-write-journal': { source: 'divination', target: 'journal' },
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

  if (sourceFacet === 'dream') {
    const result = await query<{
      id: string;
      content: string;
      created_at: string;
    }>(
      `SELECT q.id::text AS id, q.content, q.created_at::text AS created_at
         FROM quick_journal_entries q
        WHERE q.id::text = $1
          AND q.entry_type = 'dream'
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
      facet: 'dream',
      refId: row.id,
      label: journalLabel(row.content),
      excerpt: excerpt(row.content),
      createdAt: row.created_at,
      returnHref: '/dream?dream=' + encodeURIComponent(row.id) + '&from=anchor',
    };
  }

  if (sourceFacet === 'divination') {
    const packet = await resolveDivinationSymbolicSourcePacket(memberId, sourceRefId);
    if (!packet) return null;
    const sourceFacts = packet.fields
      .filter((field) => field.epistemicClass === 'source_fact')
      .map((field) => field.label + ': ' + field.value)
      .join('\n');
    return {
      facet: 'divination',
      refId: packet.sourceRefId,
      label: packet.label,
      excerpt: excerpt(sourceFacts),
      createdAt: null,
      returnHref: packet.returnHref,
    };
  }

  if (sourceFacet === 'changes') {
    const result = await query<{
      id: string;
      title: string;
      description: string;
      created_at: string;
    }>(
      `SELECT id::text AS id, title, description, created_at::text AS created_at
         FROM studio_changes
        WHERE id::text = $1
          AND member_id = $2::uuid
          AND status <> 'archived'
        LIMIT 1`,
      [sourceRefId, memberId],
    );
    const row = result.rows[0];
    if (!row) return null;
    return {
      facet: 'changes',
      refId: row.id,
      label: row.title,
      excerpt: excerpt(row.description),
      createdAt: row.created_at,
      returnHref: '/changes?change=' + encodeURIComponent(row.id),
    };
  }

  if (sourceFacet === 'decisions') {
    const result = await query<{
      id: string;
      title: string;
      context: string;
      created_at: string;
    }>(
      `SELECT id::text AS id, title, context, created_at::text AS created_at
         FROM studio_decisions
        WHERE id::text = $1
          AND decision_scope = 'personal'
          AND personal_member_id = $2::uuid
          AND status <> 'archived'
        LIMIT 1`,
      [sourceRefId, memberId],
    );
    const row = result.rows[0];
    if (!row) return null;
    return {
      facet: 'decisions',
      refId: row.id,
      label: row.title,
      excerpt: excerpt(row.context),
      createdAt: row.created_at,
      returnHref: '/decisions/' + encodeURIComponent(row.id),
    };
  }

  if (sourceFacet === 'relationships') {
    const result = await query<{
      id: string;
      name: string;
      realm: string;
      bond_type: string | null;
      created_at: string;
    }>(
      `SELECT id::text AS id, name, realm, bond_type,
              created_at::text AS created_at
         FROM member_relationships
        WHERE id::text = $1
          AND member_id = $2::uuid
          AND archived_at IS NULL
        LIMIT 1`,
      [sourceRefId, memberId],
    );
    const row = result.rows[0];
    if (!row) return null;
    const descriptor = [row.realm, row.bond_type].filter(Boolean).join(' · ');
    return {
      facet: 'relationships',
      refId: row.id,
      label: descriptor ? `${row.name} · ${descriptor}` : row.name,
      excerpt: '',
      createdAt: row.created_at,
      returnHref: '/relationships/' + encodeURIComponent(row.id),
    };
  }

  if (sourceFacet === 'ideas') {
    const result = await query<{
      block_id: string;
      block_type: 'decision' | 'change';
      content: string;
      created_at: string;
      idea_id: string;
      idea_title: string;
    }>(
      `SELECT b.id::text AS block_id, b.block_type, b.content,
              b.created_at::text AS created_at,
              i.id::text AS idea_id, i.title AS idea_title
         FROM member_idea_blocks b
         JOIN member_ideas i ON i.id = b.idea_id
        WHERE b.id::text = $1
          AND b.member_id = $2::uuid
          AND i.member_id = $2::uuid
          AND b.block_type IN ('decision', 'change')
        LIMIT 1`,
      [sourceRefId, memberId],
    );
    const row = result.rows[0];
    if (!row) return null;
    return {
      facet: 'ideas',
      refId: row.block_id,
      label: `${row.idea_title} · ${row.block_type === 'decision' ? 'Decision' : 'Shift'}`,
      excerpt: excerpt(row.content),
      createdAt: row.created_at,
      returnHref:
        '/maia/ideas/' +
        encodeURIComponent(row.idea_id) +
        '?block=' +
        encodeURIComponent(row.block_id),
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

type AstrologySourceRef = {
  zodiacMode: 'tropical' | 'sidereal';
  houseSystem: 'porphyry' | 'placidus' | 'whole-sign' | 'equal' | 'koch';
  ayanamsa: string | null;
};

function parseAstrologyRef(value: string): AstrologySourceRef | null {
  const [kind, zodiacMode, houseSystem, ayanamsa] = value.split(':');
  if (kind !== 'natal') return null;
  if (zodiacMode !== 'tropical' && zodiacMode !== 'sidereal') return null;
  if (!['porphyry', 'placidus', 'whole-sign', 'equal', 'koch'].includes(houseSystem)) return null;
  if (ayanamsa && !/^[a-z0-9_-]{1,40}$/i.test(ayanamsa)) return null;
  return {
    zodiacMode,
    houseSystem: houseSystem as AstrologySourceRef['houseSystem'],
    ayanamsa: ayanamsa || null,
  };
}

function titleCaseLens(value: string): string {
  return value
    .split(/[-_]/)
    .map((part) => part ? part.charAt(0).toUpperCase() + part.slice(1) : part)
    .join(' ');
}

async function resolveAstrologySource(
  memberId: string,
  sourceRefId: string,
): Promise<FacetFlowEvidence['source'] | null> {
  const parsed = parseAstrologyRef(sourceRefId);
  if (!parsed) return null;

  const owner = await query<{ id: string }>(
    `SELECT id::text AS id
       FROM members
      WHERE id = $1::uuid
        AND birth_date IS NOT NULL
      LIMIT 1`,
    [memberId],
  );
  if (!owner.rows[0]) return null;

  const zodiacLabel = parsed.zodiacMode === 'tropical'
    ? 'Tropical'
    : `Sidereal${parsed.ayanamsa ? ' · ' + titleCaseLens(parsed.ayanamsa) : ''}`;
  const houseLabel = titleCaseLens(parsed.houseSystem);

  return {
    facet: 'astrology',
    refId: sourceRefId,
    label: `Natal chart · ${zodiacLabel} · ${houseLabel}`,
    excerpt: `Member-owned natal chart viewed through the ${zodiacLabel} zodiac and ${houseLabel} house lens.`,
    href: '/astrology',
  };
}

type DivinationKind = 'iching' | 'tarot' | 'runes';

function parseDivinationRef(value: string): { kind: DivinationKind; id: string } | null {
  const split = value.indexOf(':');
  if (split <= 0) return null;
  const kind = value.slice(0, split);
  const id = value.slice(split + 1);
  if ((kind !== 'iching' && kind !== 'tarot' && kind !== 'runes') || !id) return null;
  return { kind, id };
}

function divinationLabel(kind: DivinationKind, fallback: string, question?: string | null): string {
  const q = question?.trim();
  if (q) {
    const short = q.length <= 82 ? q : q.slice(0, 82).trimEnd() + '…';
    return `${kind === 'iching' ? 'I Ching' : kind === 'tarot' ? 'Tarot' : 'Runes'} · ${short}`;
  }
  return fallback;
}

export async function resolveDivinationSource(
  memberId: string,
  sourceRefId: string,
): Promise<FacetFlowEvidence['source'] | null> {
  const parsed = parseDivinationRef(sourceRefId);
  if (!parsed) return null;

  if (parsed.kind === 'iching') {
    const result = await query<{
      id: string;
      question: string | null;
      primary_hex: number;
      primary_hex_name: string;
      interpretation_text: string | null;
      guidance_text: string | null;
    }>(
      `SELECT id::text AS id, question, primary_hex, primary_hex_name,
              interpretation_text, guidance_text
         FROM divination_iching_readings
        WHERE id::text = $1 AND user_id = $2
        LIMIT 1`,
      [parsed.id, memberId],
    );
    const row = result.rows[0];
    if (!row) return null;
    const detail = [
      row.question ? 'Question: ' + row.question : '',
      `Hexagram ${row.primary_hex}: ${row.primary_hex_name}`,
      row.interpretation_text || '',
      row.guidance_text ? 'Guidance: ' + row.guidance_text : '',
    ].filter(Boolean).join('\n\n');
    return {
      facet: 'divination',
      refId: sourceRefId,
      label: divinationLabel('iching', `I Ching · Hexagram ${row.primary_hex}: ${row.primary_hex_name}`, row.question),
      excerpt: excerpt(detail),
      href: '/oracle/reflections?reading=' + encodeURIComponent(sourceRefId),
    };
  }

  if (parsed.kind === 'tarot') {
    const result = await query<{
      id: string;
      question: string | null;
      spread_type: string;
      cards_json: Array<{ card?: string; position?: string; reversed?: boolean }> | string;
      interpretation_text: string | null;
      guidance_text: string | null;
    }>(
      `SELECT id::text AS id, question, spread_type, cards_json,
              interpretation_text, guidance_text
         FROM divination_tarot_readings
        WHERE id::text = $1 AND user_id = $2
        LIMIT 1`,
      [parsed.id, memberId],
    );
    const row = result.rows[0];
    if (!row) return null;
    const cards = typeof row.cards_json === 'string' ? JSON.parse(row.cards_json) : row.cards_json;
    const cardLine = Array.isArray(cards)
      ? cards.slice(0, 6).map((card) =>
          `${card.card || 'Card'}${card.reversed ? ' (reversed)' : ''}${card.position ? ' — ' + card.position : ''}`
        ).join('; ')
      : '';
    const detail = [
      row.question ? 'Question: ' + row.question : '',
      cardLine ? 'Cards: ' + cardLine : '',
      row.interpretation_text || '',
      row.guidance_text ? 'Guidance: ' + row.guidance_text : '',
    ].filter(Boolean).join('\n\n');
    const spread = row.spread_type.replace(/_/g, ' ');
    return {
      facet: 'divination',
      refId: sourceRefId,
      label: divinationLabel('tarot', 'Tarot · ' + spread, row.question),
      excerpt: excerpt(detail),
      href: '/oracle/reflections?reading=' + encodeURIComponent(sourceRefId),
    };
  }

  const result = await query<{
    id: string;
    question: string | null;
    cast_type: string;
    runes_json: Array<{ rune?: string; position?: string; reversed?: boolean }> | string;
    wyrd_message: string | null;
    interpretation_text: string | null;
    guidance_text: string | null;
  }>(
    `SELECT id::text AS id, question, cast_type, runes_json, wyrd_message,
            interpretation_text, guidance_text
       FROM divination_runes_readings
      WHERE id::text = $1 AND user_id = $2
      LIMIT 1`,
    [parsed.id, memberId],
  );
  const row = result.rows[0];
  if (!row) return null;
  const runes = typeof row.runes_json === 'string' ? JSON.parse(row.runes_json) : row.runes_json;
  const runeLine = Array.isArray(runes)
    ? runes.slice(0, 6).map((rune) =>
        `${rune.rune || 'Rune'}${rune.reversed ? ' (merkstave)' : ''}${rune.position ? ' — ' + rune.position : ''}`
      ).join('; ')
    : '';
  const detail = [
    row.question ? 'Question: ' + row.question : '',
    runeLine ? 'Runes: ' + runeLine : '',
    row.wyrd_message ? 'Wyrd: ' + row.wyrd_message : '',
    row.interpretation_text || '',
    row.guidance_text ? 'Guidance: ' + row.guidance_text : '',
  ].filter(Boolean).join('\n\n');
  return {
    facet: 'divination',
    refId: sourceRefId,
    label: divinationLabel('runes', 'Runes · ' + row.cast_type.replace(/_/g, ' '), row.question),
    excerpt: excerpt(detail),
    href: '/oracle/reflections?reading=' + encodeURIComponent(sourceRefId),
  };
}

export async function resolveFacetFlowSource(
  memberId: string,
  sourceFacet: RelationSourceFacet,
  sourceRefId: string,
): Promise<FacetFlowEvidence['source'] | null> {
  if (sourceFacet === 'astrology') {
    return resolveAstrologySource(memberId, sourceRefId);
  }
  if (sourceFacet === 'divination') {
    return resolveDivinationSource(memberId, sourceRefId);
  }
  const source = await resolveFacetCarrySource(memberId, sourceFacet, sourceRefId);
  return source
    ? {
        facet: source.facet,
        refId: source.refId,
        label: source.label,
        excerpt: source.excerpt,
        href: source.returnHref,
      }
    : null;
}

export async function validateFacetCrossingSource(args: {
  memberId: string;
  targetFacet: CarryTargetFacet;
  sourceRef: FacetCrossingRef;
}): Promise<FacetCarrySource | null> {
  if (!crossingIsAllowed(args.sourceRef.crossingId, args.sourceRef.sourceFacet, args.targetFacet)) {
    return null;
  }

  const allowed = ALLOWED_CROSSINGS[args.sourceRef.crossingId];
  if (args.sourceRef.sourceFacet === 'ideas' && allowed?.ideaBlockType) {
    const typeCheck = await query<{ ok: number }>(
      `SELECT 1 AS ok
         FROM member_idea_blocks b
         JOIN member_ideas i ON i.id = b.idea_id
        WHERE b.id::text = $1
          AND b.member_id = $2::uuid
          AND i.member_id = $2::uuid
          AND b.block_type = $3
        LIMIT 1`,
      [args.sourceRef.sourceRefId, args.memberId, allowed.ideaBlockType],
    );
    if (!typeCheck.rows[0]) return null;
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
    sourceFacet: RelationSourceFacet;
    sourceRefId: string;
    targetFacet: RelationTargetFacet;
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

const CARRY_SOURCE_FACETS = new Set<CarrySourceFacet>(['journal', 'dream', 'reflections', 'ideas', 'relationships', 'changes', 'decisions', 'divination']);
const CARRY_TARGET_FACETS = new Set<CarryTargetFacet>(['changes', 'decisions', 'journal', 'anchor']);
const FLOW_SOURCE_FACETS = new Set<RelationSourceFacet>(['journal', 'dream', 'reflections', 'ideas', 'relationships', 'changes', 'decisions', 'divination', 'astrology']);
const FLOW_TARGET_FACETS = new Set<RelationTargetFacet>(['changes', 'decisions', 'journal', 'anchor', 'reflections']);

function isCarrySourceFacet(value: string): value is CarrySourceFacet {
  return CARRY_SOURCE_FACETS.has(value as CarrySourceFacet);
}

function isCarryTargetFacet(value: string): value is CarryTargetFacet {
  return CARRY_TARGET_FACETS.has(value as CarryTargetFacet);
}

function isFlowSourceFacet(value: string): value is RelationSourceFacet {
  return FLOW_SOURCE_FACETS.has(value as RelationSourceFacet);
}

function isFlowTargetFacet(value: string): value is RelationTargetFacet {
  return FLOW_TARGET_FACETS.has(value as RelationTargetFacet);
}

export async function resolveFacetTarget(
  memberId: string,
  targetFacet: RelationTargetFacet,
  targetRefId: string,
): Promise<FacetFlowEndpoint | null> {
  if (!targetRefId) return null;

  if (targetFacet === 'anchor') {
    const result = await query<{ id: string; anchor_date: string }>(
      `SELECT id::text AS id, anchor_date::text AS anchor_date
         FROM member_daily_anchors
        WHERE id::text = $1
          AND member_id = $2::uuid
        LIMIT 1`,
      [targetRefId, memberId],
    );
    const row = result.rows[0];
    return row
      ? {
          facet: 'anchor',
          refId: row.id,
          label: 'Daily Anchor · ' + row.anchor_date,
          href: '/maia/anchor?from=house',
        }
      : null;
  }

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

  if (targetFacet === 'decisions') {
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

  if (targetFacet === 'journal') {
    const result = await query<{ id: string; content: string }>(
      `SELECT id::text AS id, content
         FROM quick_journal_entries
        WHERE id::text = $1
          AND user_id = $2::text
        LIMIT 1`,
      [targetRefId, memberId],
    );
    const row = result.rows[0];
    return row
      ? {
          facet: 'journal',
          refId: row.id,
          label: journalLabel(row.content),
          href: '/journal?entry=' + encodeURIComponent(row.id),
        }
      : null;
  }

  const capsule = await getCapsuleById({
    userId: memberId,
    capsuleId: targetRefId,
  });
  return capsule
    ? {
        facet: 'reflections',
        refId: capsule.id,
        label: capsule.title,
        href: '/reflections/' + encodeURIComponent(capsule.id),
      }
    : null;
}

async function resolveFacetTargetEvidence(
  memberId: string,
  targetFacet: RelationTargetFacet,
  targetRefId: string,
): Promise<FacetFlowEvidence['target'] | null> {
  if (targetFacet === 'anchor') {
    const result = await query<{ id: string; anchor_date: string; response: string }>(
      `SELECT id::text AS id, anchor_date::text AS anchor_date, response
         FROM member_daily_anchors
        WHERE id::text = $1
          AND member_id = $2::uuid
        LIMIT 1`,
      [targetRefId, memberId],
    );
    const row = result.rows[0];
    return row
      ? {
          facet: 'anchor',
          refId: row.id,
          label: 'Daily Anchor · ' + row.anchor_date,
          excerpt: excerpt(row.response),
          href: '/maia/anchor?from=house',
        }
      : null;
  }

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

  if (targetFacet === 'decisions') {
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

  if (targetFacet === 'journal') {
    const result = await query<{ id: string; content: string }>(
      `SELECT id::text AS id, content
         FROM quick_journal_entries
        WHERE id::text = $1
          AND user_id = $2::text
        LIMIT 1`,
      [targetRefId, memberId],
    );
    const row = result.rows[0];
    return row
      ? {
          facet: 'journal',
          refId: row.id,
          label: journalLabel(row.content),
          excerpt: excerpt(row.content),
          href: '/journal?entry=' + encodeURIComponent(row.id),
        }
      : null;
  }

  const capsule = await getCapsuleById({
    userId: memberId,
    capsuleId: targetRefId,
  });
  return capsule
    ? {
        facet: 'reflections',
        refId: capsule.id,
        label: capsule.title,
        excerpt: excerpt(capsule.summary || capsule.sourceExcerpt || ''),
        href: '/reflections/' + encodeURIComponent(capsule.id),
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
  if (!row || !isFlowSourceFacet(row.source_facet) || !isFlowTargetFacet(row.target_facet)) {
    return null;
  }

  const [source, target] = await Promise.all([
    resolveFacetFlowSource(memberId, row.source_facet, row.source_ref_id),
    resolveFacetTargetEvidence(memberId, row.target_facet, row.target_ref_id),
  ]);
  if (!source || !target) return null;

  return {
    flowId: row.id,
    crossingId: row.crossing_id,
    source,
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
      const source = isFlowSourceFacet(row.source_facet)
        ? await resolveFacetFlowSource(memberId, row.source_facet, row.source_ref_id)
        : null;
      const target = isFlowTargetFacet(row.target_facet)
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
              href: source.href,
            }
          : null,
        target,
        createdAt: row.created_at,
      };
    }),
  );
}
