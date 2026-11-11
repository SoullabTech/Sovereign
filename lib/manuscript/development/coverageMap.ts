/**
 * WS-RELATIONAL-ARCHITECTURE step 1 — THE COVERAGE MAP: what MAIA has read of this book, and whether it is still current.
 * (Design: docs/programme/WS-RELATIONAL-ARCHITECTURE_DESIGN_CONCEPT_DRAFT_2026-11-11.md §9; founder rulings §6a.)
 *
 * Derived, never stored. The source of truth is what every frozen reading already holds: per section, the depth it was read at
 * (`coverage.sections`, position | body) and a SHA-256 digest of the exact text read (`read_state.sections[id].digest`).
 *
 * Per section of the CURRENT draft:
 *   read           a body-depth reading of THIS draft whose digest equals the section's current text
 *   changed        a body-depth reading exists, but the text has changed since (no current digest matches)
 *   position_only  read only for its place in the structure, never its prose
 *   not_read       no reading covers it
 *
 * ⛔ No prose in or out: ids, states, lens names and times only. ⛔ A position-only reading is never "read". ⛔ A reading of another
 * draft (or another member's — excluded at the query) never counts. ⛔ Nothing is inferred: a section is "read" only by digest equality.
 */
import { createHash } from 'node:crypto';
import { transaction } from '@/lib/db/postgres';

export type SectionCoverageState = 'read' | 'changed' | 'position_only' | 'not_read';

export interface CoverageReading {
  id: string;
  lens: string;
  frozenAt: string;
  draftId: string;
  /** read_state.sections: digest per section id */
  digests: Readonly<Record<string, string | undefined>>;
  /** coverage.sections: depth per section id */
  depths: Readonly<Record<string, string | undefined>>;
}

export interface SectionCoverage {
  sectionId: string;
  state: SectionCoverageState;
  /** newest reading that supports the state (read: newest matching; changed: newest body reading), else null */
  readAt: string | null;
  /** lenses whose reading matches the current text (read) — empty otherwise */
  lenses: string[];
}

export interface CoverageMap {
  draftRevision: number;
  sections: SectionCoverage[];
  whole: { read: number; changed: number; positionOnly: number; notRead: number; total: number };
  /** lenses whose readings match the current text of EVERY section */
  lensesCurrentForWholeDraft: string[];
}

const sha256 = (s: string) => createHash('sha256').update(s, 'utf8').digest('hex');

/** Pure. `live` is the current draft, in order; `readings` any order. */
export function deriveCoverage(input: {
  draftId: string;
  draftRevision: number;
  live: readonly { id: string; text: string }[];
  readings: readonly CoverageReading[];
}): CoverageMap {
  const own = input.readings.filter((r) => r.draftId === input.draftId);
  const newest = (xs: CoverageReading[]) => xs.reduce<string | null>((m, r) => (m === null || r.frozenAt > m ? r.frozenAt : m), null);
  const sections: SectionCoverage[] = input.live.map((s) => {
    const digest = sha256(s.text);
    const body = own.filter((r) => r.depths[s.id] === 'body');
    const matching = body.filter((r) => r.digests[s.id] === digest);
    if (matching.length > 0) {
      return { sectionId: s.id, state: 'read', readAt: newest(matching), lenses: [...new Set(matching.map((r) => r.lens))].sort() };
    }
    if (body.length > 0) return { sectionId: s.id, state: 'changed', readAt: newest(body), lenses: [] };
    if (own.some((r) => r.depths[s.id] === 'position')) return { sectionId: s.id, state: 'position_only', readAt: null, lenses: [] };
    return { sectionId: s.id, state: 'not_read', readAt: null, lenses: [] };
  });
  const count = (st: SectionCoverageState) => sections.filter((x) => x.state === st).length;
  const allLenses = [...new Set(own.map((r) => r.lens))];
  const lensesCurrentForWholeDraft = sections.length === 0 ? [] : allLenses
    .filter((lens) => sections.every((x) => x.state === 'read' && x.lenses.includes(lens)))
    .sort();
  return {
    draftRevision: input.draftRevision,
    sections,
    whole: { read: count('read'), changed: count('changed'), positionOnly: count('position_only'), notRead: count('not_read'), total: sections.length },
    lensesCurrentForWholeDraft,
  };
}

export type CoverageOutcome = { ok: true; coverage: CoverageMap } | { ok: false; refusal: 'draft_not_established' };

/** Server-side: the member's own draft and readings only (ownership is in every predicate). */
export async function loadCoverage(manuscriptId: string, memberId: string): Promise<CoverageOutcome> {
  return transaction(async (tx) => {
    await tx.query('SET TRANSACTION ISOLATION LEVEL REPEATABLE READ');
    const draft = await tx.query<{ id: string; section_addressable_at: string | null }>(
      `SELECT id, section_addressable_at FROM manuscript_working_drafts WHERE manuscript_id = $1 AND member_id = $2`,
      [manuscriptId, memberId]);
    const d = draft.rows[0];
    if (!d || d.section_addressable_at === null) return { ok: false, refusal: 'draft_not_established' } as const;
    const rev = await tx.query<{ revision_number: number }>(
      `SELECT revision_number FROM working_draft_revisions WHERE draft_id = $1 ORDER BY revision_number DESC LIMIT 1`, [d.id]);
    if (rev.rows.length !== 1) return { ok: false, refusal: 'draft_not_established' } as const;
    const live = await tx.query<{ id: string; text: string }>(
      `SELECT id, text FROM manuscript_draft_sections WHERE draft_id = $1 ORDER BY position ASC`, [d.id]);
    const rows = await tx.query<{ id: string; commissioned_lens: string; frozen_at: Date; draft_id: string; digests: Record<string, string> | null; depths: Record<string, string> | null }>(
      `SELECT id, commissioned_lens, frozen_at, draft_id,
              (SELECT jsonb_object_agg(k, v->>'digest') FROM jsonb_each(read_state->'sections') AS e(k, v)) AS digests,
              coverage->'sections' AS depths
         FROM developmental_readings
        WHERE manuscript_id = $1 AND member_id = $2`,
      [manuscriptId, memberId]);
    return {
      ok: true,
      coverage: deriveCoverage({
        draftId: d.id,
        draftRevision: Number(rev.rows[0]!.revision_number),
        live: live.rows,
        readings: rows.rows.map((r) => ({
          id: r.id, lens: r.commissioned_lens, frozenAt: r.frozen_at.toISOString(), draftId: r.draft_id,
          digests: r.digests ?? {}, depths: r.depths ?? {},
        })),
      }),
    } as const;
  });
}

