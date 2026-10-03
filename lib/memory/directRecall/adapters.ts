/**
 * Direct Recall Resolver — source adapters.
 *
 * Spec: docs/specs/DIRECT_RECALL_RESOLVER_SPEC_2026-06-04.md §5–§6
 *
 * Each adapter is read-only and member-scoped IN ITS OWN SQL. Owner-scoping and
 * the eligibility gate live here, not at the route — this is the one surface
 * where a cross-member or sanctuary leak would enter. Identifiers in the SQL are
 * static config (never user input); only `memberId` and the per-token query
 * patterns are parameterized.
 *
 * Matching (v1): the query is tokenized; a row is a candidate if ANY token
 * appears in ANY search column (token-OR). Confidence is the fraction of query
 * tokens present in the title+excerpt, so multi-token matches rank above
 * single-token ones. (The CeCe fixture proves why: the idea title carries only
 * "cece", while the reflection block carries both "cece" and "facilitator" — an
 * AND matcher would miss the idea, a contiguous-phrase matcher misses both.)
 *
 * Confirmed sources (spec §5): idea, idea_block, breakthrough, conversation_turn,
 * episode, atom (pointer-follow), maia_turn (session→member linkage).
 * Deferred: decision, change (no confirmed backing table).
 */

import { query } from '@/lib/db/postgres';
import type {
  Eligibility,
  MaterializedMemoryObject,
  MemoryObjectRef,
  MemorySource,
  RecallContext,
  SourceAdapter,
} from './types';

const DEFAULT_LIMIT = 10;
const EXCERPT_MAX = 280;

const STOPWORDS = new Set([
  'the', 'a', 'an', 'about', 'my', 'that', 'this', 'these', 'those', 'what',
  'did', 'do', 'does', 'i', 'to', 'of', 'on', 'in', 'is', 'it', 'for', 'me',
  'show', 'find', 'pull', 'up', 'was', 'were', 'you', 'your', 'our', 'and',
  'with', 'from', 'note', 'notes', 'keep', 'saved', 'save',
]);

/** Split a query into distinct, meaningful lowercase tokens. */
function tokenize(q: string): string[] {
  return Array.from(
    new Set(
      q
        .toLowerCase()
        .split(/[^a-z0-9]+/i)
        .map((s) => s.trim())
        .filter((s) => s.length >= 2 && !STOPWORDS.has(s)),
    ),
  );
}

function snippet(v: unknown): string | undefined {
  if (v === null || v === undefined) return undefined;
  const s = String(v).trim();
  return s ? s.slice(0, EXCERPT_MAX) : undefined;
}

/** Deterministic confidence: fraction of query tokens present in title+excerpt. */
function scoreConfidence(tokens: string[], title?: string, excerpt?: string): number {
  if (!tokens.length) return 0;
  const hay = `${title ?? ''} ${excerpt ?? ''}`.toLowerCase();
  const matched = tokens.filter((t) => hay.includes(t)).length;
  return Math.min(0.95, 0.4 + 0.5 * (matched / tokens.length));
}

interface TokenSearch {
  whereSql: string;
  params: string[];
  nextIndex: number;
}

/** Build a token-OR WHERE fragment over the given columns. */
function buildTokenSearch(
  searchColumns: string[],
  tokens: string[],
  firstParamIndex: number,
): TokenSearch {
  const params: string[] = [];
  const ors: string[] = [];
  tokens.forEach((tok, i) => {
    const idx = firstParamIndex + i;
    params.push(`%${tok}%`);
    for (const col of searchColumns) ors.push(`${col} ILIKE $${idx}`);
  });
  return { whereSql: `(${ors.join(' OR ')})`, params, nextIndex: firstParamIndex + tokens.length };
}

// ════════════════════════════════════════════════════════════════════════════
// Config-driven text adapter (covers the column-shaped sources)
// ════════════════════════════════════════════════════════════════════════════

interface TextAdapterConfig {
  source: MemorySource;
  table: string;
  /** SQL FROM clause; primary table aliased `t`. */
  fromSql?: string;
  ownerColumn: 'member_id' | 'user_id';
  ownerScoping: string;
  idColumn?: string;
  createdAtColumn?: string;
  /** SQL expressions (alias-qualified) selected AS title/excerpt/body. */
  titleSql: string;
  excerptSql: string;
  bodySql: string;
  /** Alias-qualified columns to ILIKE against each query token. */
  searchColumns: string[];
  /** Extra alias-qualified selects feeding eligibility/provenance. */
  extraSelect?: string;
  sourceKind: string;
  /** Computes eligibility from a returned row. */
  eligibility: (row: Record<string, any>) => Eligibility;
}

function toRef(
  cfg: TextAdapterConfig,
  row: Record<string, any>,
  tokens: string[],
): MemoryObjectRef {
  const excerpt = snippet(row.excerpt);
  return {
    source: cfg.source,
    sourceId: String(row.source_id),
    memberId: String(row.member_id),
    title: row.title ?? undefined,
    excerpt,
    createdAt: new Date(row.created_at),
    provenance: {
      sourceTable: cfg.table,
      sourceKind: cfg.sourceKind,
      sessionId: row.session_id ? String(row.session_id) : undefined,
      parentId: row.parent_id ? String(row.parent_id) : undefined,
    },
    eligibility: cfg.eligibility(row),
    confidence: scoreConfidence(tokens, row.title ?? undefined, excerpt),
  };
}

function makeTextAdapter(cfg: TextAdapterConfig): SourceAdapter {
  const idCol = cfg.idColumn ?? 'id';
  const createdCol = cfg.createdAtColumn ?? 'created_at';
  const from = cfg.fromSql ?? `${cfg.table} t`;
  const extra = cfg.extraSelect ? `,\n             ${cfg.extraSelect}` : '';

  async function locate(
    memberId: string,
    q: string,
    ctx: RecallContext,
  ): Promise<MemoryObjectRef[]> {
    if (!memberId) return [];
    const tokens = tokenize(q);
    if (!tokens.length) return [];
    const limit = ctx.limitPerSource ?? DEFAULT_LIMIT;
    const ts = buildTokenSearch(cfg.searchColumns, tokens, 2); // $1 = memberId
    const limitParam = `$${ts.nextIndex}`;
    const sql = `
      SELECT t.${idCol}::text AS source_id,
             t.${cfg.ownerColumn}::text AS member_id,
             ${cfg.titleSql} AS title,
             ${cfg.excerptSql} AS excerpt,
             t.${createdCol} AS created_at${extra}
      FROM ${from}
      WHERE t.${cfg.ownerColumn} = $1
        AND ${ts.whereSql}
      ORDER BY t.${createdCol} DESC
      LIMIT ${limitParam}`;
    const res = await query(sql, [memberId, ...ts.params, limit]);
    const refs: MemoryObjectRef[] = [];
    for (const row of res.rows) {
      if (!cfg.eligibility(row).directRecall) continue; // fail-closed at egress
      refs.push(toRef(cfg, row, tokens));
    }
    return refs;
  }

  async function materialize(
    memberId: string,
    ref: MemoryObjectRef,
  ): Promise<MaterializedMemoryObject | null> {
    if (!memberId || ref.memberId !== memberId) return null; // ownership re-check
    const sql = `
      SELECT ${cfg.titleSql} AS title,
             ${cfg.bodySql} AS body,
             t.${createdCol} AS created_at${extra}
      FROM ${from}
      WHERE t.${idCol}::text = $1 AND t.${cfg.ownerColumn} = $2
      LIMIT 1`;
    const res = await query(sql, [ref.sourceId, memberId]);
    const row = res.rows[0];
    if (!row) return null;
    if (!cfg.eligibility(row).directRecall) return null;
    return {
      ref,
      title: row.title ?? undefined,
      body: row.body ? String(row.body) : '',
      createdAt: new Date(row.created_at),
      provenance: ref.provenance,
    };
  }

  return { source: cfg.source, ownerScoping: cfg.ownerScoping, locate, materialize };
}

// ── Eligibility helpers ──────────────────────────────────────────────────────

const REMOVED_STATUSES = new Set(['deleted', 'archived', 'removed', 'discarded']);

function statusEligibility(row: Record<string, any>): Eligibility {
  const status = row.status ?? row.parent_status ?? null;
  const ok = status === null || !REMOVED_STATUSES.has(String(status));
  return {
    directRecall: ok,
    associativeRecall: ok,
    sanctuaryExcluded: false,
    reason: ok ? undefined : `status=${status}`,
  };
}

function alwaysEligible(): Eligibility {
  return { directRecall: true, associativeRecall: true, sanctuaryExcluded: false };
}

function visibilityEligibility(row: Record<string, any>): Eligibility {
  // Member-scoped already; 'private' is owner-only and therefore fine for the
  // owner. Unknown/other visibilities fail closed.
  const vis = row.visibility ?? null;
  const ok = vis === null || vis === 'private' || vis === 'shared';
  return {
    directRecall: ok,
    associativeRecall: ok,
    sanctuaryExcluded: false,
    reason: ok ? undefined : `visibility=${vis}`,
  };
}

// ── Column-shaped adapters ───────────────────────────────────────────────────

const ideaAdapter = makeTextAdapter({
  source: 'idea',
  table: 'member_ideas',
  ownerColumn: 'member_id',
  ownerScoping: 'member_ideas.member_id = member',
  titleSql: 't.title',
  excerptSql: 't.framing',
  bodySql: 't.framing',
  searchColumns: ['t.title', 't.framing'],
  extraSelect: 't.status AS status',
  sourceKind: 'idea',
  eligibility: statusEligibility,
});

const ideaBlockAdapter = makeTextAdapter({
  source: 'idea_block',
  table: 'member_idea_blocks',
  fromSql: 'member_idea_blocks t JOIN member_ideas mi ON mi.id = t.idea_id',
  ownerColumn: 'member_id',
  ownerScoping: 'member_idea_blocks.member_id = member',
  titleSql: 'mi.title',
  excerptSql: 't.content',
  bodySql: 't.content',
  searchColumns: ['t.content', 'mi.title'],
  extraSelect: 'mi.status AS parent_status, t.idea_id::text AS parent_id',
  sourceKind: 'idea_block',
  eligibility: statusEligibility,
});

const breakthroughAdapter = makeTextAdapter({
  source: 'breakthrough',
  table: 'breakthrough_moments',
  ownerColumn: 'user_id',
  ownerScoping: 'breakthrough_moments.user_id = member',
  titleSql: 'left(t.insight, 120)',
  excerptSql: 't.insight',
  bodySql: 't.insight',
  searchColumns: ['t.insight'],
  sourceKind: 'breakthrough',
  eligibility: alwaysEligible,
});

const conversationTurnAdapter = makeTextAdapter({
  source: 'conversation_turn',
  table: 'conversation_turns',
  ownerColumn: 'user_id',
  ownerScoping: 'conversation_turns.user_id = member',
  titleSql: 'left(t.content, 120)',
  excerptSql: 't.content',
  bodySql: 't.content',
  searchColumns: ['t.content'],
  extraSelect: 't.visibility AS visibility, t.session_id::text AS session_id',
  sourceKind: 'conversation_turn',
  eligibility: visibilityEligibility,
});

const episodeAdapter = makeTextAdapter({
  source: 'episode',
  table: 'episodic_memories',
  ownerColumn: 'user_id',
  ownerScoping: 'episodic_memories.user_id = member',
  titleSql: 't.experience_title',
  excerptSql: 't.experience_description',
  bodySql: 'COALESCE(t.verbatim_text, t.experience_description)',
  searchColumns: ['t.experience_title', 't.experience_description', 't.verbatim_text'],
  sourceKind: 'episode',
  eligibility: alwaysEligible,
});

// ── Atom adapter (bespoke: pointer-follow on materialize) ────────────────────

const ATOM_ACTIVE = new Set(['active', 'still_alive']);

function atomEligibility(row: Record<string, any>): Eligibility {
  const sacred = Array.isArray(row.registers) && row.registers.includes('sacred_protected');
  const active = ATOM_ACTIVE.has(String(row.status));
  const direct = active && !sacred;
  const assoc =
    direct && ['contextual_doorway', 'ritual_review_opt_in'].includes(String(row.return_preference));
  return {
    directRecall: direct,
    associativeRecall: assoc,
    sanctuaryExcluded: false,
    reason: direct ? undefined : sacred ? 'sacred_protected' : `status=${row.status}`,
  };
}

/** Follow an atom pointer to its native source table (owner-scoped). */
async function followAtomPointer(
  memberId: string,
  sourceType: string,
  pointerId: string,
): Promise<string | null> {
  if (!pointerId) return null;
  let sql: string | null = null;
  if (sourceType === 'idea') {
    sql = `SELECT framing AS body FROM member_ideas WHERE id::text = $1 AND member_id = $2 LIMIT 1`;
  } else if (sourceType === 'idea_block') {
    sql = `SELECT content AS body FROM member_idea_blocks WHERE id::text = $1 AND member_id = $2 LIMIT 1`;
  }
  if (!sql) return null; // unknown source type → fail closed
  const res = await query(sql, [pointerId, memberId]);
  return res.rows[0]?.body ? String(res.rows[0].body) : null;
}

const atomAdapter: SourceAdapter = {
  source: 'atom',
  ownerScoping: 'member_memory_atoms.member_id = member',
  async locate(memberId, q, ctx) {
    if (!memberId) return [];
    const tokens = tokenize(q);
    if (!tokens.length) return [];
    const limit = ctx.limitPerSource ?? DEFAULT_LIMIT;
    const ts = buildTokenSearch(['title', 'body'], tokens, 2);
    const res = await query(
      `SELECT id::text AS source_id, member_id::text AS member_id, title, body,
              source_type, source_id::text AS pointer_id, status, return_preference, registers, kept_at
       FROM member_memory_atoms
       WHERE member_id = $1 AND ${ts.whereSql}
       ORDER BY kept_at DESC
       LIMIT $${ts.nextIndex}`,
      [memberId, ...ts.params, limit],
    );
    const refs: MemoryObjectRef[] = [];
    for (const row of res.rows) {
      const elig = atomEligibility(row);
      if (!elig.directRecall) continue;
      const excerpt = snippet(row.body);
      refs.push({
        source: 'atom',
        sourceId: String(row.source_id),
        memberId: String(row.member_id),
        title: row.title ?? undefined,
        excerpt,
        createdAt: new Date(row.kept_at),
        provenance: {
          sourceTable: 'member_memory_atoms',
          sourceKind: row.source_type ? `keep:${row.source_type}` : 'keep',
          parentId: row.pointer_id ? String(row.pointer_id) : undefined,
        },
        eligibility: elig,
        confidence: scoreConfidence(tokens, row.title ?? undefined, excerpt),
      });
    }
    return refs;
  },
  async materialize(memberId, ref) {
    if (!memberId || ref.memberId !== memberId) return null;
    const res = await query(
      `SELECT title, body, source_type, source_id::text AS pointer_id, status, registers, kept_at
       FROM member_memory_atoms
       WHERE id::text = $1 AND member_id = $2
       LIMIT 1`,
      [ref.sourceId, memberId],
    );
    const a = res.rows[0];
    if (!a) return null;
    if (!atomEligibility(a).directRecall) return null;
    let body = a.body ? String(a.body) : '';
    if (a.source_type !== 'spontaneous' && a.pointer_id) {
      // Atoms are pointers by design — fetch the actual source content, not the
      // title (spec §3, §5). Keep whatever body exists on a miss (fail closed).
      const followed = await followAtomPointer(memberId, String(a.source_type), String(a.pointer_id));
      if (followed) body = followed;
    }
    return {
      ref,
      title: a.title ?? undefined,
      body,
      createdAt: new Date(a.kept_at),
      provenance: ref.provenance,
    };
  },
};

// ── MAIA-turn adapter (bespoke: ownership via session linkage, fail closed) ──

const maiaTurnAdapter: SourceAdapter = {
  source: 'maia_turn',
  ownerScoping:
    'maia_turns has no owner column — ownership proven via EXISTS conversation_turns(session_id, user_id=member); fail closed if unlinked',
  async locate(memberId, q, ctx) {
    if (!memberId) return [];
    const tokens = tokenize(q);
    if (!tokens.length) return [];
    const limit = ctx.limitPerSource ?? DEFAULT_LIMIT;
    const ts = buildTokenSearch(['t.user_text', 't.maia_text'], tokens, 2); // $1 = memberId
    const res = await query(
      `SELECT t.id::text AS source_id, t.session_id::text AS session_id,
              left(COALESCE(t.maia_text, t.user_text), 120) AS title,
              COALESCE(t.maia_text, t.user_text) AS excerpt, t.created_at
       FROM maia_turns t
       WHERE EXISTS (
               SELECT 1 FROM conversation_turns ct
               WHERE ct.session_id::text = t.session_id::text AND ct.user_id = $1
             )
         AND ${ts.whereSql}
       ORDER BY t.created_at DESC
       LIMIT $${ts.nextIndex}`,
      [memberId, ...ts.params, limit],
    );
    return res.rows.map((row) => {
      const excerpt = snippet(row.excerpt);
      return {
        source: 'maia_turn' as MemorySource,
        sourceId: String(row.source_id),
        memberId,
        title: row.title ?? undefined,
        excerpt,
        createdAt: new Date(row.created_at),
        provenance: {
          sourceTable: 'maia_turns',
          sourceKind: 'maia_turn',
          sessionId: row.session_id ? String(row.session_id) : undefined,
        },
        eligibility: { directRecall: true, associativeRecall: false, sanctuaryExcluded: false },
        confidence: scoreConfidence(tokens, row.title ?? undefined, excerpt),
      };
    });
  },
  async materialize(memberId, ref) {
    if (!memberId || ref.memberId !== memberId) return null;
    const res = await query(
      `SELECT COALESCE(t.maia_text, t.user_text) AS body, t.created_at
       FROM maia_turns t
       WHERE t.id::text = $1
         AND EXISTS (
               SELECT 1 FROM conversation_turns ct
               WHERE ct.session_id::text = t.session_id::text AND ct.user_id = $2
             )
       LIMIT 1`,
      [ref.sourceId, memberId],
    );
    const row = res.rows[0];
    if (!row) return null;
    return {
      ref,
      body: row.body ? String(row.body) : '',
      createdAt: new Date(row.created_at),
      provenance: ref.provenance,
    };
  },
};

// ════════════════════════════════════════════════════════════════════════════
// Registry
// ════════════════════════════════════════════════════════════════════════════

export const ADAPTERS: SourceAdapter[] = [
  ideaAdapter,
  ideaBlockAdapter,
  breakthroughAdapter,
  conversationTurnAdapter,
  episodeAdapter,
  atomAdapter,
  maiaTurnAdapter,
];

/**
 * Invariant #1 enforcement (spec §6): refuse to register any adapter that does
 * not declare how it proves ownership. Called at resolver module load.
 */
export function validateAdapters(adapters: SourceAdapter[] = ADAPTERS): void {
  for (const a of adapters) {
    if (!a.ownerScoping || !a.ownerScoping.trim()) {
      throw new Error(
        `[DirectRecall] adapter "${a.source}" declares no owner-scoping — refusing to register`,
      );
    }
  }
}
