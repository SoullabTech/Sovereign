/**
 * Element Node Generator
 *
 * Generates candidate case_element_nodes from existing case data.
 * Nodes are system-proposed (confirmed_by_practitioner = false) by default.
 * Practitioners confirm, revise, or reject via the board UI.
 *
 * Generation sources by role:
 *   marker   → case_memories (element_tags + significance) + case_notes (element_focus)
 *   goal     → missions (if case has linked member)
 *   grounding → Earth memories with high significance + repeated pattern (low confidence)
 *
 * State valence is estimated from text content but always provisional.
 */

import db from '@/lib/db/postgres';
import {
  FACET_REGISTRY,
  FacetKey,
  CaseElementNode,
  NodeRole,
  StateValence,
  NodeSourceType,
  BoardRegion,
  detectFacet,
  scoreValence,
  facetFromElementPhase,
  coerceLegacyFacetKeyWithMeta,
  SpiralogicElement,
} from './facetRegistry';

// ─── Types ────────────────────────────────────────────────────────────────

interface GenerationResult {
  inserted: number;
  skipped: number;   // duplicates
  nodes: CaseElementNode[];
}

// ─── Internal helpers ─────────────────────────────────────────────────────

/** Map element tag strings from DB to SpiralogicElement */
function normalizeElement(raw: string): SpiralogicElement | null {
  const lower = raw.toLowerCase().trim();
  if (['fire','water','earth','air','aether'].includes(lower)) {
    return lower as SpiralogicElement;
  }
  // Common variant names
  const aliases: Record<string, SpiralogicElement> = {
    'Fire': 'fire', 'Water': 'water', 'Earth': 'earth',
    'Air': 'air', 'Aether': 'aether',
    'ether': 'aether', 'spirit': 'aether',
  };
  return aliases[raw] ?? null;
}

/** Convert element + optional phase hint into a facet key */
function inferFacet(element: SpiralogicElement, phaseHint: number | null, text: string): FacetKey {
  // If we have a phase index, use it directly
  if (phaseHint !== null && phaseHint >= 1 && phaseHint <= 3) {
    return facetFromElementPhase(element, phaseHint as 1 | 2 | 3);
  }
  // Otherwise try to detect from text
  const detected = detectFacet(text);
  if (detected && FACET_REGISTRY[detected.facet].element === element) {
    return detected.facet;
  }
  // Fall back to phase 1
  return facetFromElementPhase(element, 1);
}

/** Parse spiral_movement like "WATER-2" or "water_2" into element + phaseIndex */
function parseSpiralMovement(sm: string | null): { element: SpiralogicElement; phaseIndex: 1 | 2 | 3 } | null {
  if (!sm) return null;
  const m = sm.match(/^(fire|water|earth|air|aether)[_\-]([123])$/i);
  if (!m) return null;
  return {
    element: m[1].toLowerCase() as SpiralogicElement,
    phaseIndex: parseInt(m[2]) as 1 | 2 | 3,
  };
}

/** Insert a candidate node, skipping true duplicates (same case+facet+role+sourceId) */
async function insertCandidate(
  caseId: string,
  practitionerId: string,
  facet: FacetKey,
  role: NodeRole,
  stateValence: StateValence | null,
  confidence: number,
  sourceType: NodeSourceType,
  sourceId: string | null,
  sessionContext: string | null,
): Promise<CaseElementNode | null> {
  const def = FACET_REGISTRY[facet];

  // Deduplication: skip if this (case, facet, role, source) already exists.
  // ON CONFLICT DO NOTHING is not viable here because there is no unique
  // constraint covering the nullable source_id column.
  const existing = await db.query(
    `SELECT id FROM case_element_nodes
     WHERE case_id = $1 AND facet = $2 AND role = $3
       AND ($4::uuid IS NULL AND source_id IS NULL OR source_id = $4::uuid)
     LIMIT 1`,
    [caseId, facet, role, sourceId],
  );
  if (existing.rows.length > 0) return null;

  const result = await db.query(
    `INSERT INTO case_element_nodes
       (case_id, practitioner_id, facet, element, phase_index,
        role, state_valence, confidence, source_type, source_id,
        session_context, confirmed_by_practitioner)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,false)
     RETURNING *`,
    [
      caseId, practitionerId, facet, def.element, def.phaseIndex,
      role, stateValence, confidence, sourceType, sourceId,
      sessionContext,
    ],
  );
  return rowToNode(result.rows[0]);
}

/** Exported for testing. Maps a raw DB row to a CaseElementNode, normalizing legacy facet keys. */
export function rowToNode(row: Record<string, unknown>): CaseElementNode {
  // Coerce with provenance — canonical rows return meta=undefined (zero cost).
  // Legacy / invalid rows return normalizationMeta so downstream consumers can
  // treat them as historically ambiguous without losing the original value.
  const { facet, meta: normalizationMeta } = coerceLegacyFacetKeyWithMeta(row.facet as string);
  const def = FACET_REGISTRY[facet];
  return {
    id: row.id as string,
    caseId: row.case_id as string,
    practitionerId: row.practitioner_id as string,
    facet,
    element: def.element,
    phaseIndex: (row.phase_index as 1 | 2 | 3) ?? def.phaseIndex,
    role: row.role as NodeRole,
    stateValence: (row.state_valence as StateValence) ?? null,
    confidence: row.confidence != null ? parseFloat(row.confidence as string) : null,
    sourceType: (row.source_type as NodeSourceType) ?? null,
    sourceId: (row.source_id as string) ?? null,
    sessionContext: (row.session_context as string) ?? null,
    confirmedByPractitioner: row.confirmed_by_practitioner as boolean,
    confirmedAt: row.confirmed_at ? new Date(row.confirmed_at as string) : null,
    confirmedBy: (row.confirmed_by as string) ?? null,
    practitionerNote: (row.practitioner_note as string) ?? null,
    createdAt: new Date(row.created_at as string),
    updatedAt: new Date(row.updated_at as string),
    ...(normalizationMeta !== undefined && { normalizationMeta }),
  };
}

// ─── Main generator ───────────────────────────────────────────────────────

export async function generateCandidateNodes(
  caseId: string,
  practitionerId: string,
): Promise<GenerationResult> {
  let inserted = 0;
  let skipped = 0;
  const nodes: CaseElementNode[] = [];

  const record = (node: CaseElementNode | null) => {
    if (node) { nodes.push(node); inserted++; }
    else skipped++;
  };

  // ── 1. Marker candidates from case_memories ───────────────────────────
  // element_tags[] + significance → marker nodes
  const memories = await db.query(
    `SELECT id, element_tags, significance, memory_type, content
     FROM case_memories
     WHERE case_id = $1 AND element_tags IS NOT NULL AND array_length(element_tags, 1) > 0
     ORDER BY significance DESC NULLS LAST`,
    [caseId],
  );

  for (const mem of memories.rows) {
    const significance = parseFloat(mem.significance ?? '0');
    if (significance < 0.5) continue;

    const text = (mem.content as string) ?? '';

    for (const rawTag of (mem.element_tags as string[])) {
      const element = normalizeElement(rawTag);
      if (!element) continue;

      const facet = inferFacet(element, null, text);
      const valence = text ? scoreValence(text, facet) : null;

      const node = await insertCandidate(
        caseId, practitionerId,
        facet, 'marker', valence,
        Math.min(significance, 0.95),
        'case_memory', mem.id as string,
        mem.memory_type as string | null,
      );
      record(node);
    }
  }

  // ── 2. Marker candidates from case_notes (element_focus field) ────────
  const notes = await db.query(
    `SELECT id, element_focus, spiral_movement, content, themes_observed
     FROM case_notes
     WHERE case_id = $1 AND element_focus IS NOT NULL`,
    [caseId],
  );

  for (const note of notes.rows) {
    const element = normalizeElement(note.element_focus as string);
    if (!element) continue;

    const parsed = parseSpiralMovement(note.spiral_movement as string | null);
    const phaseIndex = parsed?.element === element ? parsed.phaseIndex : null;
    const text = ((note.content as string) ?? '') + ' ' + JSON.stringify(note.themes_observed ?? []);
    const facet = inferFacet(element, phaseIndex, text);
    const valence = text ? scoreValence(text, facet) : null;

    const node = await insertCandidate(
      caseId, practitionerId,
      facet, 'marker', valence,
      0.6,   // case_notes have no significance score — fixed at 0.6
      'case_note', note.id as string,
      null,
    );
    record(node);
  }

  // ── 3. Goal candidates from missions (if member linked to case) ───────
  // practitioner_cases.client_id → practitioner_clients.email → members.id
  // Any step may be null (case not linked, client not registered as member, etc.)
  const caseRow = await db.query(
    `SELECT m.id AS member_id
     FROM practitioner_cases cas
     LEFT JOIN practitioner_clients pc ON pc.id = cas.client_id
     LEFT JOIN members m ON LOWER(m.email) = LOWER(pc.email)
     WHERE cas.id = $1`,
    [caseId],
  );
  const memberId = (caseRow.rows[0]?.member_id as string) ?? null;

  if (memberId) {
    const missions = await db.query(
      `SELECT id, title, description, house, status
       FROM missions
       WHERE user_id = $1 AND status IN ('emerging','active')`,
      [memberId],
    );

    // House → element mapping (astrological houses → Spiralogic elements)
    const houseToElement: Record<number, SpiralogicElement> = {
      1: 'fire', 2: 'earth', 3: 'air', 4: 'water',
      5: 'fire', 6: 'earth', 7: 'air', 8: 'water',
      9: 'fire', 10: 'earth', 11: 'air', 12: 'aether',
    };

    for (const mission of missions.rows) {
      const element = houseToElement[mission.house as number] ?? 'earth';
      const text = `${mission.title ?? ''} ${mission.description ?? ''}`;
      const facet = inferFacet(element, null, text);
      const valence = text ? scoreValence(text, facet) : 'neutral';

      const node = await insertCandidate(
        caseId, practitionerId,
        facet, 'goal', valence,
        0.7,
        'mission', mission.id as string,
        `Mission: ${mission.title ?? ''}`,
      );
      record(node);
    }
  }

  // ── 4. Grounding candidates (low-confidence) ──────────────────────────
  // Earth memories with high significance appearing 2+ times → grounding node
  // Count total earth-tagged high-significance memories (not distinct tag arrays).
  // Grounding candidate fires when earth appears in 2+ separate memories,
  // regardless of whether those memories share the same element_tags array.
  const earthMemories = await db.query(
    `SELECT COUNT(*)::int AS count
     FROM case_memories
     WHERE case_id = $1
       AND element_tags::text[] && ARRAY['earth','Earth']
       AND significance >= 0.7`,
    [caseId],
  );

  if ((earthMemories.rows[0]?.count ?? 0) >= 2) {
    const node = await insertCandidate(
      caseId, practitionerId,
      'earth_2', 'grounding', null,
      0.45,  // deliberately low — practitioner should confirm
      'case_memory', null,
      'Repeated Earth-coded memories with high significance',
    );
    record(node);
  }

  return { inserted, skipped, nodes };
}

// ─── List nodes for a case ────────────────────────────────────────────────

export async function listCaseNodes(caseId: string): Promise<CaseElementNode[]> {
  const result = await db.query(
    `SELECT * FROM case_element_nodes
     WHERE case_id = $1
     ORDER BY confirmed_by_practitioner DESC, confidence DESC NULLS LAST, created_at ASC`,
    [caseId],
  );
  return result.rows.map(rowToNode);
}

// ─── Provenance analytics ─────────────────────────────────────────────────

/**
 * Counts and segments a node list by facet normalization origin.
 *
 * Use this in analytics, admin views, and transition graphs to separate
 * historically unambiguous records from those reconstructed from legacy data.
 *
 * The three coercion classes represent distinct failure origins — not just
 * severity gradations. Each one implies different remediation:
 *
 *   canonical
 *     Node had a valid canonical FacetKey in the DB. Safe for all analytics.
 *
 *   coercedFromAetherSingleton
 *     DB stored the pre-triadic singleton 'aether', written before Aether was
 *     differentiated into three facets. Semantically coherent but ontologically
 *     under-specified. These are expected in older cases and can be practitioner-reviewed.
 *
 *   coercedFromInvalidString
 *     DB stored a non-canonical, non-empty string (e.g. 'FIRE', 'fire_phase2',
 *     data from a bug or import bypass). These indicate data corruption or
 *     write-path bypass and should be investigated separately.
 *
 *   coercedFromEmptyOrNull
 *     DB stored an empty string or null. These indicate incomplete data at write
 *     time — typically missing enum values or failed form submissions. Highest
 *     priority for cleanup.
 *
 * Invariants:
 *   legacyCoerced = coercedFromAetherSingleton + coercedFromInvalidString + coercedFromEmptyOrNull
 *   total = canonical + legacyCoerced
 */
export interface NodeProvenanceStats {
  total: number;
  /** Rows with a canonical FacetKey already in the DB — no coercion occurred */
  canonical: number;
  /** All rows where facet was reconstructed from a non-canonical DB value */
  legacyCoerced: number;
  /** Original value was the pre-triadic singleton 'aether' — ontologically under-specified */
  coercedFromAetherSingleton: number;
  /** Original value was a non-canonical, non-empty string — likely data corruption or bypass */
  coercedFromInvalidString: number;
  /** Original value was empty string or null/undefined — incomplete data at write time */
  coercedFromEmptyOrNull: number;
}

export function nodeProvenanceStats(nodes: CaseElementNode[]): NodeProvenanceStats {
  let canonical = 0;
  let coercedFromAetherSingleton = 0;
  let coercedFromInvalidString = 0;
  let coercedFromEmptyOrNull = 0;

  for (const node of nodes) {
    if (!node.normalizationMeta) {
      canonical++;
    } else {
      const orig = node.normalizationMeta.originalFacetValue;
      if (orig === 'aether') {
        coercedFromAetherSingleton++;
      } else if (orig === '' || orig == null) {
        coercedFromEmptyOrNull++;
      } else {
        coercedFromInvalidString++;
      }
    }
  }

  const legacyCoerced = coercedFromAetherSingleton + coercedFromInvalidString + coercedFromEmptyOrNull;
  return {
    total: nodes.length,
    canonical,
    legacyCoerced,
    coercedFromAetherSingleton,
    coercedFromInvalidString,
    coercedFromEmptyOrNull,
  };
}

// ─── Field analytics ──────────────────────────────────────────────────────

/**
 * Per-facet count split by canonical vs coerced origin.
 * Use canonical counts for frequency analysis and transition graphs.
 * Use legacyCoerced to understand historical ambiguity for that facet.
 */
export interface FacetFrequency {
  facet: FacetKey;
  element: SpiralogicElement;
  boardRegion: BoardRegion;
  canonical: number;
  legacyCoerced: number;
}

/** A single directed facet transition (from → to) with occurrence count */
export interface FacetTransition {
  from: FacetKey;
  to: FacetKey;
  count: number;
}

/**
 * Facet transitions across time, separated into three provenance lanes.
 *
 * Nodes are sorted by createdAt to derive temporal sequence.
 * Each consecutive pair forms a transition; the lane depends on both nodes' provenance.
 *
 * Lanes:
 *   canonical    both nodes are canonical — safe for movement graphs and sequence analysis
 *   mixed        one node canonical, one coerced — ontological identity is ambiguous
 *   coerced      both nodes are legacy-coerced — for integrity analysis only
 *
 * ─── Usage Policy ────────────────────────────────────────────────────────────
 *
 *   canonicalTransitions  → practitioner-facing movement charts, developmental sequence graphs,
 *                           transition frequency analysis. These are ontologically clean.
 *
 *   mixedTransitions      → debug / review panels only. Do not render in practitioner views
 *                           without explicit labelling. One endpoint is unreliable.
 *
 *   coercedTransitions    → integrity monitoring and repair workflows. Not for developmental
 *                           interpretation. Use to identify sequences of historical ambiguity.
 *
 *   hasLegacyTransitions  → trigger caution badge or admin notice. When true, the movement
 *                           graph may be incomplete and should not be treated as canonical.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Do NOT add mixed or coerced transition counts to canonical totals.
 * sum(canonical.count) + sum(mixed.count) + sum(coerced.count) === totalPairs
 */
export interface CaseTransitionAnalytics {
  canonicalTransitions: FacetTransition[];
  mixedTransitions: FacetTransition[];
  coercedTransitions: FacetTransition[];
  /** Total consecutive node pairs analyzed */
  totalPairs: number;
  /** Quick flag: any transition involves a coerced node */
  hasLegacyTransitions: boolean;
}

/**
 * Provenance-aware analytics summary for a case's element field.
 *
 * All distribution fields expose { canonical, legacyCoerced } pairs explicitly.
 * Canonical counts are safe for use in transition graphs and frequency analysis.
 * LegacyCoerced counts must be handled separately or excluded from canonical stats.
 *
 * Design principle:
 *   Canonical behavior may use coerced nodes operationally.
 *   Canonical interpretation should know when they were coerced.
 */
export interface CaseFieldAnalytics {
  /** Raw provenance stats — source of truth for coercion breakdown */
  provenance: NodeProvenanceStats;

  /** Quick flag: any legacyCoerced nodes exist in this case */
  hasLegacyNodes: boolean;

  /**
   * Facet frequency distribution.
   * Only facets that appear at least once are included.
   * Sort by canonical DESC for frequency charts.
   */
  facetFrequency: FacetFrequency[];

  /**
   * Node counts by role, split by provenance.
   * Use canonical.* for analytics; legacyCoerced.* for integrity reporting.
   */
  roleDistribution: Record<NodeRole, { canonical: number; legacyCoerced: number }>;

  /**
   * Ring (fire/water/earth/air) vs center (aether) node distribution.
   * Useful for understanding whether a case is primarily elemental or threshold-oriented.
   */
  boardRegionDistribution: Record<BoardRegion, { canonical: number; legacyCoerced: number }>;

  /**
   * Confirmed-only counts for the practitioner's own view of what is meaningful.
   * These are always canonical (manual confirmation enforces canonical write-path).
   */
  confirmedCount: number;

  /**
   * Temporal facet transitions in three provenance lanes.
   * Use transitions.canonicalTransitions for movement graph rendering.
   * Do not mix lanes in developmental interpretation.
   */
  transitions: CaseTransitionAnalytics;
}

/** Accumulate a directed transition count into a key→count map */
function accumulateTransition(
  map: Map<string, number>,
  from: FacetKey,
  to: FacetKey,
): void {
  const key = `${from}::${to}`;
  map.set(key, (map.get(key) ?? 0) + 1);
}

function mapToFacetTransitions(map: Map<string, number>): FacetTransition[] {
  return Array.from(map.entries()).map(([key, count]) => {
    const sep = key.indexOf('::');
    return {
      from: key.slice(0, sep) as FacetKey,
      to: key.slice(sep + 2) as FacetKey,
      count,
    };
  });
}

/**
 * Compute directed facet transitions from temporal node sequence, partitioned
 * into three provenance lanes so movement graphs stay honest.
 *
 * Exported separately so timeline views can call it without the full
 * caseFieldAnalytics overhead when only transitions are needed.
 */
export function caseTransitionAnalytics(nodes: CaseElementNode[]): CaseTransitionAnalytics {
  // Sort by creation time — transitions are temporal, not confidence-ordered
  const sorted = [...nodes].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

  const canonicalMap = new Map<string, number>();
  const mixedMap     = new Map<string, number>();
  const coercedMap   = new Map<string, number>();

  for (let i = 0; i < sorted.length - 1; i++) {
    const from = sorted[i];
    const to   = sorted[i + 1];
    const fromCoerced = !!from.normalizationMeta;
    const toCoerced   = !!to.normalizationMeta;

    if (!fromCoerced && !toCoerced) {
      accumulateTransition(canonicalMap, from.facet, to.facet);
    } else if (fromCoerced && toCoerced) {
      accumulateTransition(coercedMap, from.facet, to.facet);
    } else {
      accumulateTransition(mixedMap, from.facet, to.facet);
    }
  }

  const totalPairs = Math.max(sorted.length - 1, 0);
  return {
    canonicalTransitions: mapToFacetTransitions(canonicalMap),
    mixedTransitions:     mapToFacetTransitions(mixedMap),
    coercedTransitions:   mapToFacetTransitions(coercedMap),
    totalPairs,
    hasLegacyTransitions: mixedMap.size > 0 || coercedMap.size > 0,
  };
}

export function caseFieldAnalytics(nodes: CaseElementNode[]): CaseFieldAnalytics {
  const provenance = nodeProvenanceStats(nodes);

  // ── Facet frequency ───────────────────────────────────────────────────
  const facetMap = new Map<FacetKey, { canonical: number; legacyCoerced: number }>();
  for (const node of nodes) {
    const existing = facetMap.get(node.facet) ?? { canonical: 0, legacyCoerced: 0 };
    if (node.normalizationMeta) {
      facetMap.set(node.facet, { ...existing, legacyCoerced: existing.legacyCoerced + 1 });
    } else {
      facetMap.set(node.facet, { ...existing, canonical: existing.canonical + 1 });
    }
  }
  const facetFrequency: FacetFrequency[] = Array.from(facetMap.entries()).map(([facet, counts]) => {
    const def = FACET_REGISTRY[facet];
    return { facet, element: def.element, boardRegion: def.boardRegion, ...counts };
  });

  // ── Role distribution ─────────────────────────────────────────────────
  const roleDistribution: CaseFieldAnalytics['roleDistribution'] = {
    marker:    { canonical: 0, legacyCoerced: 0 },
    goal:      { canonical: 0, legacyCoerced: 0 },
    grounding: { canonical: 0, legacyCoerced: 0 },
  };
  for (const node of nodes) {
    const bucket = node.normalizationMeta ? 'legacyCoerced' : 'canonical';
    roleDistribution[node.role][bucket]++;
  }

  // ── Board region distribution ─────────────────────────────────────────
  const boardRegionDistribution: CaseFieldAnalytics['boardRegionDistribution'] = {
    ring:   { canonical: 0, legacyCoerced: 0 },
    center: { canonical: 0, legacyCoerced: 0 },
  };
  for (const node of nodes) {
    const region = FACET_REGISTRY[node.facet].boardRegion;
    const bucket = node.normalizationMeta ? 'legacyCoerced' : 'canonical';
    boardRegionDistribution[region][bucket]++;
  }

  // ── Confirmed count ───────────────────────────────────────────────────
  const confirmedCount = nodes.filter(n => n.confirmedByPractitioner).length;

  return {
    provenance,
    hasLegacyNodes: provenance.legacyCoerced > 0,
    facetFrequency,
    roleDistribution,
    boardRegionDistribution,
    confirmedCount,
    transitions: caseTransitionAnalytics(nodes),
  };
}

// ─── Admin integrity summary ──────────────────────────────────────────────

/**
 * Repair urgency classification for a case's element-node dataset.
 *
 *   high    coercedFromEmptyOrNull > 0 OR coercedFromInvalidString > 0
 *             → incomplete or corrupted data; most urgent to address
 *   medium  coercedFromAetherSingleton > 0
 *             → pre-triadic ontology residue; historical, awaiting practitioner review
 *   clean   legacyCoerced === 0
 *             → no normalization occurred; safe for all analytics
 */
export type RepairPriority = 'high' | 'medium' | 'clean';

export function repairPriority(stats: NodeProvenanceStats): RepairPriority {
  if (stats.coercedFromEmptyOrNull > 0 || stats.coercedFromInvalidString > 0) return 'high';
  if (stats.coercedFromAetherSingleton > 0) return 'medium';
  return 'clean';
}

/**
 * Per-case integrity summary for the admin repair queue.
 */
export interface CaseIntegrityEntry {
  caseId: string;
  totalNodes: number;
  provenance: NodeProvenanceStats;
  repairPriority: RepairPriority;
  /** True if any transition involves a coerced node — movement graph may be incomplete */
  hasLegacyTransitions: boolean;
}

/**
 * Aggregate integrity summary across all cases in a practitioner's caseload.
 */
export interface IntegritySummary {
  /** Per-case entries, sorted by priority (high → medium → clean) then caseId */
  cases: CaseIntegrityEntry[];
  totals: {
    totalCases: number;
    /** Cases with high or medium priority */
    casesNeedingAttention: number;
    totalLegacyNodes: number;
    totalCanonicalNodes: number;
  };
}

// ─── Confirm / revise a node ──────────────────────────────────────────────

export async function confirmNode(
  nodeId: string,
  practitionerId: string,
  updates: {
    confirmed?: boolean;
    facet?: FacetKey;
    role?: NodeRole;
    stateValence?: StateValence;
    practitionerNote?: string;
  },
): Promise<CaseElementNode | null> {
  const sets: string[] = [];
  const values: unknown[] = [];
  let idx = 1;

  if (updates.confirmed === true) {
    sets.push(`confirmed_by_practitioner = true`);
    sets.push(`confirmed_at = NOW()`);
    sets.push(`confirmed_by = $${idx++}`);
    values.push(practitionerId);
  }
  if (updates.facet !== undefined) {
    const def = FACET_REGISTRY[updates.facet];
    sets.push(`facet = $${idx++}`);
    values.push(updates.facet);
    sets.push(`element = $${idx++}`);
    values.push(def.element);
    sets.push(`phase_index = $${idx++}`);
    values.push(def.phaseIndex);
  }
  if (updates.role !== undefined) {
    sets.push(`role = $${idx++}`);
    values.push(updates.role);
  }
  if (updates.stateValence !== undefined) {
    sets.push(`state_valence = $${idx++}`);
    values.push(updates.stateValence);
  }
  if (updates.practitionerNote !== undefined) {
    sets.push(`practitioner_note = $${idx++}`);
    values.push(updates.practitionerNote);
  }

  if (!sets.length) return null;

  values.push(nodeId);
  const result = await db.query(
    `UPDATE case_element_nodes SET ${sets.join(', ')}
     WHERE id = $${idx} RETURNING *`,
    values,
  );
  return result.rows.length ? rowToNode(result.rows[0]) : null;
}

// ─── Delete (reject) a node ───────────────────────────────────────────────

export async function deleteNode(nodeId: string): Promise<boolean> {
  const result = await db.query(
    `DELETE FROM case_element_nodes WHERE id = $1`,
    [nodeId],
  );
  return (result.rowCount ?? 0) > 0;
}

// ─── Create manual node ───────────────────────────────────────────────────

export async function createManualNode(
  caseId: string,
  practitionerId: string,
  facet: FacetKey,
  role: NodeRole,
  stateValence: StateValence | null,
  practitionerNote: string | null,
): Promise<CaseElementNode> {
  const def = FACET_REGISTRY[facet];
  const result = await db.query(
    `INSERT INTO case_element_nodes
       (case_id, practitioner_id, facet, element, phase_index,
        role, state_valence, confidence, source_type,
        confirmed_by_practitioner, confirmed_at, confirmed_by, practitioner_note)
     VALUES ($1,$2,$3,$4,$5,$6,$7,1.0,'manual',true,NOW(),$8,$9)
     RETURNING *`,
    [
      caseId, practitionerId, facet, def.element, def.phaseIndex,
      role, stateValence,
      practitionerId, practitionerNote,
    ],
  );
  return rowToNode(result.rows[0]);
}
