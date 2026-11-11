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

/* "here" scope (the passage the writer is at, or chapters named): the G6 limits, unchanged. */
export const MAX_CARRIED_READINGS = 3;
export const MAX_OBSERVATIONS_PER_READING = 8;
export const MAX_OBSERVATION_CHARS = 600;

/**
 * WS-WHOLE-BOOK-CONVERSATION (founder approval 2026-11-10, "Approve as recommended", design D1–D4).
 *
 * `whole_book` scope is DECLARED by the writer (the conversation's "About" control), never inferred from the question. In it she carries
 * her complete account: the latest reading per lens — a complete one in preference to a partial one — with every observation, uncut.
 * The only ceiling is on the whole account (D2); over it, whole readings drop oldest-first and she is told which. ⛔ It still never
 * supplies chapter TEXT, never grounds a quotation, and carries nothing in Sanctuary (the caller does not call this there).
 */
export type CarryScope = 'here' | 'whole_book';
export const WHOLE_BOOK_CARRY_CHARS = 200_000;

export interface CarriedObservation {
  readonly text: string;
  readonly doesNotEstablish: readonly string[];
  /** Whole-book scope: headings of the sections her evidence pointed to (headings only, never the text). */
  readonly where?: readonly string[];
  /** Whole-book scope: the observation's place in the book (section position), for manuscript order. */
  readonly place?: number;
}

export interface CarriedReading {
  readonly id: string;
  readonly lens: string;
  readonly revisionNumber: number;
  readonly frozenAt: string;
  /** The chapters this reading read in full, and whether each has changed since (null = cannot tell). */
  readonly chapters: readonly { id: string; label: string | null; changedSince: boolean | null }[];
  readonly observations: readonly CarriedObservation[];
  /** How many observations the reading holds (only the first MAX_OBSERVATIONS_PER_READING are carried in "here" scope). */
  readonly observationsTotal: number;
  /** Whether any carried observation was cut at MAX_OBSERVATION_CHARS ("here" scope only). */
  readonly cut: boolean;
  /** Whole-book scope: how many of the Work's current sections this reading read in full. */
  readonly coverage?: { read: number; of: number };
}

/** What she was given, and what exists but was left out, so her memory is never silently partial. */
export interface CarriedSet {
  readonly readings: readonly CarriedReading[];
  /** Readings of the chapters in play that exist (among the most recent searched). */
  readonly relevant: number;
  /** True when the search window was full, so more may exist than `relevant` counts. */
  readonly searchFull: boolean;
  /** Which scope produced this set. Absent = "here" (older callers). */
  readonly scope?: CarryScope;
  /** Whole-book scope: readings left out because the account would have exceeded WHOLE_BOOK_CARRY_CHARS. */
  readonly dropped?: readonly { lens: string; frozenAt: string }[];
  /** The current draft revision, when known, so an older reading can say so. */
  readonly currentRevision?: number;
}

export type ReadingRow = { id: string; commissioned_lens: string; revision_number: number; read_state: { sections?: Record<string, { digest?: string }> }; coverage: { sections?: Record<string, string> }; observations: unknown; frozen_at: Date | string };
type Row = ReadingRow;
type Shaped = { row: ReadingRow; lens: string; frozenAt: string; bodySectionIds: readonly string[] };

/**
 * PURE: which readings to carry for a scope.
 * - here: latest per lens among readings that read a chapter in play; at most three (G6, unchanged).
 * - whole_book: per lens, the latest COMPLETE reading (every current section in body); only when none is complete, the latest partial one.
 *   No lens cap. A reading that read no chapter text is never carried in either scope.
 */
export function selectCarried<T extends { lens: string; frozenAt: string; bodySectionIds: readonly string[] }>(
  readings: readonly T[], scope: CarryScope, inPlay: readonly string[], currentSectionIds: readonly string[],
): T[] {
  if (scope === 'here') return pickCarried(readings, inPlay);
  const read = readings.filter((r) => r.bodySectionIds.length > 0);
  const current = new Set(currentSectionIds);
  const isComplete = (r: T) => current.size > 0 && [...current].every((id) => r.bodySectionIds.includes(id));
  const newestFirst = [...read].sort((a, b) => b.frozenAt.localeCompare(a.frozenAt));
  const byLens = new Map<string, T>();
  for (const r of newestFirst) if (!byLens.has(r.lens) && isComplete(r)) byLens.set(r.lens, r);
  for (const r of newestFirst) if (!byLens.has(r.lens)) byLens.set(r.lens, r);
  return [...byLens.values()].sort((a, b) => b.frozenAt.localeCompare(a.frozenAt));
}

type RawObs = { key?: unknown; observation?: unknown; doesNotEstablish?: unknown; position?: { sectionPosition?: unknown; codePointStart?: unknown } | null;
  admissionIndex?: unknown; evidenceRefs?: unknown };

const sectionIdsOfRefs = (refs: unknown): string[] => {
  if (!Array.isArray(refs)) return [];
  const ids: string[] = [];
  for (const r of refs as { sectionId?: unknown; sectionIds?: unknown }[]) {
    if (typeof r?.sectionId === 'string') ids.push(r.sectionId);
    if (Array.isArray(r?.sectionIds)) for (const x of r.sectionIds) if (typeof x === 'string') ids.push(x);
  }
  return [...new Set(ids)];
};
const num = (v: unknown, d: number) => (typeof v === 'number' && Number.isFinite(v) ? v : d);
const accountChars = (r: CarriedReading) => r.observations.reduce((n, o) => n + o.text.length + o.doesNotEstablish.join(', ').length, 0);

/** PURE: shape the picked readings into what she is given, applying the scope's limits. */
export function buildCarriedSet(picked: readonly Shaped[], o: {
  scope: CarryScope; sections: readonly SectionHeadLite[]; currentSectionIds: readonly string[];
  dismissed: ReadonlySet<string>; nowDigests: ReadonlyMap<string, string>; relevant: number; searchFull: boolean; currentRevision?: number;
}): CarriedSet {
  const label = (id: string) => o.sections.find((s) => s.id === id)?.heading ?? null;
  const whole = o.scope === 'whole_book';
  const current = new Set(o.currentSectionIds);
  let readings: CarriedReading[] = picked.map((p) => {
    /* The contract's field is `observation` (DevelopmentalObservation, "the reader's claim text, VERBATIM"). A real walk found the
       loader reading `text`, which no real reading has: she would have been told she read a chapter, with none of what she noticed. */
    const obs = Array.isArray(p.row.observations) ? (p.row.observations as RawObs[]) : [];
    const real = obs.filter((x) => typeof x.observation === 'string' && (x.observation as string).trim()
      && !(typeof x.key === 'string' && o.dismissed.has(`${p.row.id}:${x.key}`)));
    const dne = (x: RawObs) => (Array.isArray(x.doesNotEstablish) ? (x.doesNotEstablish as unknown[]).filter((y): y is string => typeof y === 'string') : []);
    const chapters = p.bodySectionIds.map((id) => {
      const was = p.row.read_state?.sections?.[id]?.digest;
      const is = o.nowDigests.get(id);
      /* removed since = changed; no stored digest = cannot tell */
      return { id, label: label(id), changedSince: !was ? null : is === undefined ? true : is !== was };
    });
    const base = { id: p.row.id, lens: p.lens, revisionNumber: p.row.revision_number, frozenAt: p.frozenAt, chapters, observationsTotal: real.length };
    if (!whole) {
      return { ...base,
        observations: real.slice(0, MAX_OBSERVATIONS_PER_READING)
          .map((x) => ({ text: (x.observation as string).trim().slice(0, MAX_OBSERVATION_CHARS), doesNotEstablish: dne(x) })),
        cut: real.slice(0, MAX_OBSERVATIONS_PER_READING).some((x) => (x.observation as string).trim().length > MAX_OBSERVATION_CHARS) };
    }
    /* Manuscript order (section position, then offset, then admission) — never importance. */
    const ordered = [...real].sort((a, b) =>
      num(a.position?.sectionPosition, Infinity) - num(b.position?.sectionPosition, Infinity)
      || num(a.position?.codePointStart, 0) - num(b.position?.codePointStart, 0)
      || num(a.admissionIndex, 0) - num(b.admissionIndex, 0));
    return { ...base,
      observations: ordered.map((x) => ({
        text: (x.observation as string).trim(), doesNotEstablish: dne(x),
        where: sectionIdsOfRefs(x.evidenceRefs).map(label).filter((h): h is string => h !== null),
        ...(typeof x.position?.sectionPosition === 'number' ? { place: x.position.sectionPosition } : {}),
      })),
      cut: false,
      coverage: { read: p.bodySectionIds.filter((id) => current.has(id)).length, of: current.size } };
  });

  /* D2 · the ceiling is on the whole account. Over it, whole readings drop OLDEST-first and are named; nothing is cut mid-observation.
     A single reading that alone exceeds the ceiling keeps whole observations from the start of the book and says how many it shows. */
  const dropped: { lens: string; frozenAt: string }[] = [];
  if (whole) {
    readings = [...readings].sort((a, b) => b.frozenAt.localeCompare(a.frozenAt));
    while (readings.length > 1 && readings.reduce((n, r) => n + accountChars(r), 0) > WHOLE_BOOK_CARRY_CHARS) {
      const out = readings.pop()!;
      dropped.push({ lens: out.lens, frozenAt: out.frozenAt });
    }
    if (readings.length === 1 && accountChars(readings[0]!) > WHOLE_BOOK_CARRY_CHARS) {
      const r = readings[0]!;
      const kept: CarriedObservation[] = [];
      let n = 0;
      for (const ob of r.observations) { const c = ob.text.length + ob.doesNotEstablish.join(', ').length; if (n + c > WHOLE_BOOK_CARRY_CHARS) break; kept.push(ob); n += c; }
      readings = [{ ...r, observations: kept }];
    }
  }
  return { readings, relevant: o.relevant, searchFull: o.searchFull,
    ...(whole ? { scope: 'whole_book' as const, dropped } : {}),
    ...(o.currentRevision !== undefined ? { currentRevision: o.currentRevision } : {}) };
}

/** PURE: which readings to carry. Latest per lens, among those that read (in full) one of the chapters in play; max three. */
export function pickCarried<T extends { lens: string; frozenAt: string; bodySectionIds: readonly string[] }>(readings: readonly T[], inPlay: readonly string[]): T[] {
  const want = new Set(inPlay);
  // A reading that read no chapter text is not a reading of the writing (G6 × D5 ruling 2026-11-09): never carried.
  const read = readings.filter((r) => r.bodySectionIds.length > 0);
  const relevant = want.size === 0 ? read : read.filter((r) => r.bodySectionIds.some((id) => want.has(id)));
  const byLens = new Map<string, T>();
  for (const r of [...relevant].sort((a, b) => b.frozenAt.localeCompare(a.frozenAt))) if (!byLens.has(r.lens)) byLens.set(r.lens, r);
  return [...byLens.values()].sort((a, b) => b.frozenAt.localeCompare(a.frozenAt)).slice(0, MAX_CARRIED_READINGS);
}

/** PURE: the chapters in play for a question: where the writer is, chapters named in the question, or all of them for a whole-book question. */
export function chaptersInPlay(question: string, locusId: string | null, sections: readonly SectionHeadLite[]): string[] {
  return [...selectSections({ level: 'work', question, locusId, sections, sizes: new Map() }).ids];
}

export const READINGS_SEARCHED = 30;

/** Which observations (`readingId:key`) the writer dismissed, for the given readings. Supplied by the caller; this module reads no standing. */
export type SetAsideLookup = (readingIds: readonly string[]) => Promise<ReadonlySet<string>>;

export async function loadCarriedReadings(manuscriptId: string, memberId: string, inPlay: readonly string[], sections: readonly SectionHeadLite[], setAside?: SetAsideLookup,
  opts: { scope?: CarryScope; currentRevision?: number } = {}): Promise<CarriedSet> {
  const scope: CarryScope = opts.scope ?? 'here';
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
  const withText = shaped.filter((r) => r.bodySectionIds.length > 0);
  const relevant = scope === 'whole_book' || want.size === 0 ? withText.length : withText.filter((r) => r.bodySectionIds.some((id) => want.has(id))).length;
  const searchFull = rows.length >= READINGS_SEARCHED;
  const currentSectionIds = sections.map((s) => s.id);
  const picked = selectCarried(shaped, scope, inPlay, currentSectionIds);
  if (picked.length === 0) return { readings: [], relevant, searchFull, ...(scope === 'whole_book' ? { scope, dropped: [] } : {}) };

  /* G6 × D5: an observation the writer dismissed is left out of her reading here; it reaches her only as set aside (D5 exception). */
  const dismissed = setAside ? await setAside(picked.map((p) => p.row.id)) : new Set<string>();
  const ids = [...new Set(picked.flatMap((p) => p.bodySectionIds))];
  const now = new Map((await query<{ id: string; digest: string }>(
    `SELECT s.id, encode(sha256(convert_to(s.text, 'UTF8')), 'hex') AS digest
       FROM manuscript_draft_sections s JOIN manuscript_working_drafts d ON d.id = s.draft_id
      WHERE d.manuscript_id = $1 AND d.member_id = $2 AND s.id = ANY($3::uuid[])`, [manuscriptId, memberId, ids])).rows.map((x) => [x.id, x.digest]));
  return buildCarriedSet(picked, { scope, sections, currentSectionIds, dismissed, nowDigests: now, relevant, searchFull,
    ...(opts.currentRevision !== undefined ? { currentRevision: opts.currentRevision } : {}) });
}
