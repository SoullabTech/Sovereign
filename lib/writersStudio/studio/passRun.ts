/**
 * WS-RELATIONAL-ARCHITECTURE step 4 — an editorial pass that survives closing the page (founder ruling 2026-11-11: "Let it run on its
 * own"). The writer's click creates a run; the server advances it one lens at a time with no page open.
 *
 * Laws held here:
 *  - One run per manuscript at a time. A ceiling on runs per writer per day (MAIA_PASS_RUNS_PER_DAY, default 3 — a PLACEHOLDER until
 *    the founder sets the number).
 *  - Before EACH reading the server re-checks the writer's whole-Work read permission and their account's Sanctuary default; if either
 *    fails, the run stops (`stopped`) and nothing more is read.
 *  - A lens reading already frozen for this exact draft and section set is reused, never paid for twice.
 *  - A refused reading is tried once more; a second refusal fails the run at that lens. A refusal is never counted as done.
 *  - The synthesis is the SAME function the attention-map route calls. The letter is kept through the same store.
 *  - The writer can cancel; a cancelled run reads nothing more.
 */
import { query } from '@/lib/db/postgres';
import { commissionReading } from '@/lib/manuscript/developmentalReading/commission';
import { loadReading } from '@/lib/manuscript/developmentalReading/store';
import { loadActiveGrant } from '@/lib/disclosure/workReadScopeRead';
import { livingWorkIdForManuscript } from '@/lib/manuscript/ask/workOfManuscript';
import { LENS_ORDER } from '@/lib/writersStudio/developPresentation';
import { synthesizeAttentionMap } from '@/lib/writersStudio/studio/synthesizeAttentionMap';
import { EDITORIAL_PASS_REQUEST } from '@/lib/writersStudio/studio/editorialPassRequest';
import { saveLetter } from '@/lib/writersStudio/letter/letterStore';
import type { DevelopmentalLens } from '@/lib/manuscript/developmentalReader/contract';

export type RunState = 'queued' | 'reading' | 'lens_done' | 'lens_refused' | 'synthesizing' | 'done' | 'failed' | 'stopped' | 'cancelled';
const FINAL: ReadonlySet<RunState> = new Set(['done', 'failed', 'stopped', 'cancelled']);
export const runsPerDay = () => Math.max(0, Number(process.env.MAIA_PASS_RUNS_PER_DAY ?? 3) || 0);

export interface RunView {
  id: string;
  draftRevision: number;
  state: RunState;
  done: number;
  total: number;
  lens: string | null;
  refusal: string | null;
  letterId: string | null;
  createdAt: string;
}

/* ── seams (replaceable in tests) ─────────────────────────────────────────────────────────────────────────────────────────────── */
export interface RunDeps {
  q: typeof query;
  commission: typeof commissionReading;
  load: typeof loadReading;
  grant: (memberId: string, manuscriptId: string) => Promise<'work' | 'chapter' | null>;
  sanctuaryDefault: (memberId: string) => Promise<boolean | null>;
  synthesize: typeof synthesizeAttentionMap;
  keepLetter: typeof saveLetter;
}
export const defaultDeps: RunDeps = {
  q: query,
  commission: commissionReading,
  load: loadReading,
  grant: async (memberId, manuscriptId) => {
    const workId = await livingWorkIdForManuscript(manuscriptId, memberId);
    if (!workId) return null;
    return (await loadActiveGrant(memberId, workId))?.level ?? null;
  },
  sanctuaryDefault: async (memberId) => {
    try {
      const r = await query<{ mode: string | null }>(`SELECT default_memory_mode AS mode FROM member_settings WHERE member_id = $1`, [memberId]);
      return r.rows[0]?.mode === 'sanctuary';
    } catch { return null; }
  },
  synthesize: synthesizeAttentionMap,
  keepLetter: saveLetter,
};

/* ── reading the run ───────────────────────────────────────────────────────────────────────────────────────────────────────────── */
export async function viewRun(memberId: string, manuscriptId: string, deps: RunDeps = defaultDeps): Promise<RunView | null> {
  const run = (await deps.q<{ id: string; draft_revision: number; created_at: Date }>(
    `SELECT id, draft_revision, created_at FROM editorial_pass_runs WHERE member_id = $1 AND manuscript_id = $2 ORDER BY created_at DESC LIMIT 1`,
    [memberId, manuscriptId])).rows[0];
  if (!run) return null;
  const events = (await deps.q<{ state: RunState; lens: string | null; refusal: string | null; letter_id: string | null }>(
    `SELECT state, lens, refusal, letter_id FROM editorial_pass_run_events WHERE run_id = $1 ORDER BY id ASC`, [run.id])).rows;
  const last = events[events.length - 1];
  const doneLenses = new Set(events.filter((e) => e.state === 'lens_done').map((e) => e.lens));
  return {
    id: run.id, draftRevision: Number(run.draft_revision), state: last?.state ?? 'queued',
    done: doneLenses.size, total: LENS_ORDER.length, lens: last?.lens ?? null, refusal: last?.refusal ?? null,
    letterId: events.find((e) => e.letter_id)?.letter_id ?? null, createdAt: run.created_at.toISOString(),
  };
}

const record = (deps: RunDeps, runId: string, state: RunState, extra: { lens?: string; readingId?: string; refusal?: string; letterId?: string } = {}) =>
  deps.q(`INSERT INTO editorial_pass_run_events (run_id, state, lens, reading_id, refusal, letter_id) VALUES ($1, $2, $3, $4, $5, $6)`,
    [runId, state, extra.lens ?? null, extra.readingId ?? null, extra.refusal?.slice(0, 200) ?? null, extra.letterId ?? null]);

/* ── starting ──────────────────────────────────────────────────────────────────────────────────────────────────────────────────── */
export type StartOutcome =
  | { ok: true; runId: string; resumed: boolean }
  | { ok: false; refusal: 'not_permitted' | 'sanctuary' | 'draft_not_established' | 'daily_limit' };

/** Create a run, or resume the newest unfinished one for the same draft. Never two active runs on one manuscript. */
export async function startRun(memberId: string, manuscriptId: string, deps: RunDeps = defaultDeps): Promise<StartOutcome> {
  if ((await deps.grant(memberId, manuscriptId)) !== 'work') return { ok: false, refusal: 'not_permitted' };
  if ((await deps.sanctuaryDefault(memberId)) !== false) return { ok: false, refusal: 'sanctuary' };
  const draft = (await deps.q<{ id: string; rev: number | null; sections: string[] | null }>(
    `SELECT d.id,
            (SELECT max(r.revision_number) FROM working_draft_revisions r WHERE r.draft_id = d.id) AS rev,
            (SELECT array_agg(s.id ORDER BY s.position) FROM manuscript_draft_sections s WHERE s.draft_id = d.id) AS sections
       FROM manuscript_working_drafts d
      WHERE d.manuscript_id = $1 AND d.member_id = $2 AND d.section_addressable_at IS NOT NULL`,
    [manuscriptId, memberId])).rows[0];
  if (!draft || draft.rev === null || !draft.sections?.length) return { ok: false, refusal: 'draft_not_established' };
  const current = await viewRun(memberId, manuscriptId, deps);
  if (current && !FINAL.has(current.state) && current.draftRevision === Number(draft.rev)) return { ok: true, runId: current.id, resumed: true };
  if (current && (current.state === 'failed' || current.state === 'stopped') && current.draftRevision === Number(draft.rev)) {
    await record(deps, current.id, 'queued');
    return { ok: true, runId: current.id, resumed: true };
  }
  const today = (await deps.q<{ n: string }>(
    `SELECT count(*)::text AS n FROM editorial_pass_runs WHERE member_id = $1 AND created_at > NOW() - INTERVAL '1 day'`, [memberId])).rows[0];
  if (Number(today?.n ?? 0) >= runsPerDay()) return { ok: false, refusal: 'daily_limit' };
  const run = (await deps.q<{ id: string }>(
    `INSERT INTO editorial_pass_runs (member_id, manuscript_id, draft_revision) VALUES ($1, $2, $3) RETURNING id`,
    [memberId, manuscriptId, Number(draft.rev)])).rows[0]!;
  await record(deps, run.id, 'queued');
  return { ok: true, runId: run.id, resumed: false };
}

export async function cancelRun(memberId: string, manuscriptId: string, deps: RunDeps = defaultDeps): Promise<boolean> {
  const current = await viewRun(memberId, manuscriptId, deps);
  if (!current || FINAL.has(current.state)) return false;
  await record(deps, current.id, 'cancelled');
  return true;
}

/* ── advancing (server-side, no page needed) ───────────────────────────────────────────────────────────────────────────────────── */
const inFlight = new Set<string>();

/** Advance a run to its end. Safe to call again: a run already advancing in this process is not doubled. */
export async function advanceRun(memberId: string, manuscriptId: string, deps: RunDeps = defaultDeps): Promise<RunView | null> {
  const key = `${memberId}:${manuscriptId}`;
  if (inFlight.has(key)) return viewRun(memberId, manuscriptId, deps);
  inFlight.add(key);
  try {
    let run = await viewRun(memberId, manuscriptId, deps);
    if (!run || FINAL.has(run.state)) return run;
    const draft = (await deps.q<{ sections: string[] | null; rev: number | null }>(
      `SELECT (SELECT array_agg(s.id ORDER BY s.position) FROM manuscript_draft_sections s WHERE s.draft_id = d.id) AS sections,
              (SELECT max(r.revision_number) FROM working_draft_revisions r WHERE r.draft_id = d.id) AS rev
         FROM manuscript_working_drafts d WHERE d.manuscript_id = $1 AND d.member_id = $2`,
      [manuscriptId, memberId])).rows[0];
    if (!draft?.sections?.length || Number(draft.rev) !== run.draftRevision) {
      await record(deps, run.id, 'stopped', { refusal: 'draft_changed' });
      return viewRun(memberId, manuscriptId, deps);
    }
    const sectionIds = draft.sections;
    const withStructure = Number((await deps.q<{ n: string }>(
      `SELECT count(*)::text AS n FROM manuscript_structure_units WHERE manuscript_id = $1`, [manuscriptId])).rows[0]?.n ?? 0) > 0;

    const readingIds = new Map<DevelopmentalLens, string>();
    for (const lens of LENS_ORDER) {
      run = await viewRun(memberId, manuscriptId, deps);
      if (!run || run.state === 'cancelled') return run;
      /* re-check permission and Sanctuary before every reading */
      if ((await deps.grant(memberId, manuscriptId)) !== 'work') { await record(deps, run.id, 'stopped', { lens, refusal: 'permission_withdrawn' }); return viewRun(memberId, manuscriptId, deps); }
      if ((await deps.sanctuaryDefault(memberId)) !== false) { await record(deps, run.id, 'stopped', { lens, refusal: 'sanctuary' }); return viewRun(memberId, manuscriptId, deps); }

      const reused = await frozenFor(deps, memberId, manuscriptId, lens, run.draftRevision, sectionIds);
      if (reused) { readingIds.set(lens, reused); await record(deps, run.id, 'lens_done', { lens, readingId: reused }); continue; }

      let made: string | null = null;
      let lastRefusal = '';
      for (let attempt = 0; attempt < 2 && !made; attempt += 1) {
        await record(deps, run.id, 'reading', { lens });
        const out = await deps.commission({ manuscriptId, memberId, lens, bodyScope: sectionIds, withStructure });
        if (out.outcome === 'frozen') made = out.reading.id;
        else { lastRefusal = `${out.stage}:${out.refusal}`; await record(deps, run.id, 'lens_refused', { lens, refusal: lastRefusal }); }
      }
      if (!made) { await record(deps, run.id, 'failed', { lens, refusal: lastRefusal }); return viewRun(memberId, manuscriptId, deps); }
      readingIds.set(lens, made);
      await record(deps, run.id, 'lens_done', { lens, readingId: made });
    }

    await record(deps, run!.id, 'synthesizing');
    const deep = LENS_ORDER.filter((l) => l !== 'overview').map((l) => readingIds.get(l)!);
    const synthesis = await deps.synthesize(memberId, manuscriptId, deep, EDITORIAL_PASS_REQUEST);
    if (!synthesis.ok) { await record(deps, run!.id, 'failed', { refusal: `synthesis:${synthesis.error}` }); return viewRun(memberId, manuscriptId, deps); }
    if ((await deps.sanctuaryDefault(memberId)) !== false) { await record(deps, run!.id, 'stopped', { refusal: 'sanctuary' }); return viewRun(memberId, manuscriptId, deps); }
    const letterId = await deps.keepLetter(memberId, manuscriptId, synthesis.revisionNumber, synthesis.map);
    await record(deps, run!.id, 'done', { letterId });
    return viewRun(memberId, manuscriptId, deps);
  } finally {
    inFlight.delete(key);
  }
}

/** A reading of this lens frozen for this exact revision and section set, if one exists (the member's own). */
async function frozenFor(deps: RunDeps, memberId: string, manuscriptId: string, lens: DevelopmentalLens, revision: number, sectionIds: readonly string[]): Promise<string | null> {
  const rows = (await deps.q<{ id: string }>(
    `SELECT id FROM developmental_readings
      WHERE manuscript_id = $1 AND member_id = $2 AND commissioned_lens = $3 AND revision_number = $4
      ORDER BY frozen_at DESC LIMIT 5`,
    [manuscriptId, memberId, lens, revision])).rows;
  for (const row of rows) {
    const reading = await deps.load(row.id, memberId);
    if (reading && JSON.stringify(reading.scope.bodyScope) === JSON.stringify(sectionIds)) return reading.id;
  }
  return null;
}
