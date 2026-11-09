/**
 * G6 — MAIA's own completed readings, carried into the Work conversation (founder ruling 2026-11-09, "Yes, on those terms").
 *
 * TERMS: her account (observations, labelled with the lens and the revision she read) is carried on the consent the writer gave when
 * commissioning the reading. ⛔ It never supplies chapter TEXT: text still needs the standing reading permission. ⛔ Sanctuary carries
 * nothing (the caller does not call this). ⛔ Readings are per lens and coexist by design: a newer reading under another lens does NOT
 * supersede an older one, so the latest reading PER LENS is carried, never "the latest reading".
 *
 * Every statement here is a SELECT. "Has the chapter changed since she read it" is answered by the database digesting the current text
 * (sha256 of the stored section text, the same bytes her reading digested), so no chapter text is loaded into the app to answer it.
 */
import { query } from '@/lib/db/postgres';
import { selectSections, type SectionHeadLite } from './workReadScope';

export const MAX_CARRIED_READINGS = 3;
export const MAX_OBSERVATIONS_PER_READING = 8;
export const MAX_OBSERVATION_CHARS = 600;

export interface CarriedReading {
  readonly id: string;
  readonly lens: string;
  readonly revisionNumber: number;
  readonly frozenAt: string;
  /** The chapters this reading read in full, and whether each has changed since (null = cannot tell). */
  readonly chapters: readonly { id: string; label: string | null; changedSince: boolean | null }[];
  readonly observations: readonly { text: string; doesNotEstablish: readonly string[] }[];
  /** How many observations the reading holds (only the first MAX_OBSERVATIONS_PER_READING are carried). */
  readonly observationsTotal: number;
  /** Whether any carried observation was cut at MAX_OBSERVATION_CHARS. */
  readonly cut: boolean;
}

/** What she was given, and what exists but was left out, so her memory is never silently partial. */
export interface CarriedSet {
  readonly readings: readonly CarriedReading[];
  /** Readings of the chapters in play that exist (among the most recent searched). */
  readonly relevant: number;
  /** True when the search window was full, so more may exist than `relevant` counts. */
  readonly searchFull: boolean;
}

type Row = { id: string; commissioned_lens: string; revision_number: number; read_state: { sections?: Record<string, { digest?: string }> }; coverage: { sections?: Record<string, string> }; observations: unknown; frozen_at: Date };

/** PURE: which readings to carry. Latest per lens, among those that read (in full) one of the chapters in play; max three. */
export function pickCarried<T extends { lens: string; frozenAt: string; bodySectionIds: readonly string[] }>(readings: readonly T[], inPlay: readonly string[]): T[] {
  const want = new Set(inPlay);
  const relevant = want.size === 0 ? readings : readings.filter((r) => r.bodySectionIds.some((id) => want.has(id)));
  const byLens = new Map<string, T>();
  for (const r of [...relevant].sort((a, b) => b.frozenAt.localeCompare(a.frozenAt))) if (!byLens.has(r.lens)) byLens.set(r.lens, r);
  return [...byLens.values()].sort((a, b) => b.frozenAt.localeCompare(a.frozenAt)).slice(0, MAX_CARRIED_READINGS);
}

/** PURE: the chapters in play for a question: where the writer is, chapters named in the question, or all of them for a whole-book question. */
export function chaptersInPlay(question: string, locusId: string | null, sections: readonly SectionHeadLite[]): string[] {
  return [...selectSections({ level: 'work', question, locusId, sections, sizes: new Map() }).ids];
}

export const READINGS_SEARCHED = 30;

export async function loadCarriedReadings(manuscriptId: string, memberId: string, inPlay: readonly string[], sections: readonly SectionHeadLite[]): Promise<CarriedSet> {
  let rows: Row[];
  try {
    rows = (await query<Row>(
      `SELECT id, commissioned_lens, revision_number, read_state, coverage, observations, frozen_at
         FROM developmental_readings
        WHERE manuscript_id = $1 AND member_id = $2 AND outcome = 'reading'
        ORDER BY frozen_at DESC, id DESC LIMIT ${READINGS_SEARCHED}`, [manuscriptId, memberId])).rows;
  } catch (e) { if ((e as { code?: string })?.code === '42P01') return { readings: [], relevant: 0, searchFull: false }; throw e; }
  const shaped = rows.map((r) => ({
    row: r, lens: r.commissioned_lens, frozenAt: new Date(r.frozen_at).toISOString(),
    bodySectionIds: Object.entries(r.coverage?.sections ?? {}).filter(([, d]) => d === 'body').map(([id]) => id),
  }));
  const want = new Set(inPlay);
  const relevant = want.size === 0 ? shaped.length : shaped.filter((r) => r.bodySectionIds.some((id) => want.has(id))).length;
  const searchFull = rows.length >= READINGS_SEARCHED;
  const picked = pickCarried(shaped, inPlay);
  if (picked.length === 0) return { readings: [], relevant, searchFull };

  const ids = [...new Set(picked.flatMap((p) => p.bodySectionIds))];
  const now = new Map((await query<{ id: string; digest: string }>(
    `SELECT s.id, encode(sha256(convert_to(s.text, 'UTF8')), 'hex') AS digest
       FROM manuscript_draft_sections s JOIN manuscript_working_drafts d ON d.id = s.draft_id
      WHERE d.manuscript_id = $1 AND d.member_id = $2 AND s.id = ANY($3::uuid[])`, [manuscriptId, memberId, ids])).rows.map((x) => [x.id, x.digest]));
  const label = (id: string) => sections.find((s) => s.id === id)?.heading ?? null;

  const readings = picked.map((p) => {
    const obs = Array.isArray(p.row.observations) ? (p.row.observations as { text?: unknown; doesNotEstablish?: unknown }[]) : [];
    const real = obs.filter((o) => typeof o.text === 'string' && (o.text as string).trim());
    return {
      id: p.row.id, lens: p.lens, revisionNumber: p.row.revision_number, frozenAt: p.frozenAt,
      chapters: p.bodySectionIds.map((id) => {
        const was = p.row.read_state?.sections?.[id]?.digest;
        const is = now.get(id);
        /* removed since = changed; no stored digest = cannot tell */
        return { id, label: label(id), changedSince: !was ? null : is === undefined ? true : is !== was };
      }),
      observations: real.slice(0, MAX_OBSERVATIONS_PER_READING)
        .map((o) => ({ text: (o.text as string).trim().slice(0, MAX_OBSERVATION_CHARS),
          doesNotEstablish: Array.isArray(o.doesNotEstablish) ? (o.doesNotEstablish as unknown[]).filter((x): x is string => typeof x === 'string') : [] })),
      observationsTotal: real.length,
      cut: real.slice(0, MAX_OBSERVATIONS_PER_READING).some((o) => (o.text as string).trim().length > MAX_OBSERVATION_CHARS),
    };
  });
  return { readings, relevant, searchFull };
}
