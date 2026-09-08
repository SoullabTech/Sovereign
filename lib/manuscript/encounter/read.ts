/**
 * WS2-ENCOUNTER-01 · E2 — the Encounter act.
 *
 * Founder ruling 2026-09-08, narrowly authorized:
 *
 *   explicit member gesture → server-owned read → continuous current Working
 *   Draft → Encounter vocabulary only → 0..N anchored MAIA notices → ephemeral
 *   response → nothing automatically persisted or carried forward
 *
 * ── WHAT IS DELIBERATELY ABSENT ───────────────────────────────────────────
 *
 *   no lens          DEVELOP's commission takes one; a lens parameter is the door
 *                    a developmental lens would arrive through wearing this name
 *   no hierarchy     no sections, no structure, no section_addressable_at —
 *                    section-addressability is itself an interpretation of the
 *                    Work, and requiring it would decide the book's shape before
 *                    the writer saw it again
 *   no Source read   the Working Draft answers "what is the Work now"; a silent
 *                    Source fallback would change the object being encountered
 *                    without telling the writer. PT-3 does not forbid reading
 *                    Source — this act simply has no reason to cross that line
 *   no persistence   nothing is written. There is no encounters table
 *   no carry-forward nothing here is reachable by a later intention act
 *
 * ── THE GENERATOR IS A PORT ───────────────────────────────────────────────
 *
 * Notices are proposed by an injected `NoticeGenerator` and every proposal is
 * screened before it can become a `MaiaNotice`. The default generator is silent,
 * so the act's lawful floor — an Encounter that says nothing — is also its
 * default. Wiring a model-backed generator is a separate act; the constitutional
 * work is the screen, and the screen does not care what proposed the text.
 */
import { createHash } from 'crypto';
import { query } from '@/lib/db/postgres';
import { screenCandidate } from './vocabulary';
import { traverseWhole, type ReadWindow } from './traversal';
import type {
  Anchor,
  CandidateNotice,
  EncounterResult,
  EncounterSnapshot,
  MaiaNotice,
} from './contract';

const sha256 = (v: string) => createHash('sha256').update(v).digest('hex');

export interface NoticeGenerator {
  (input: {
    readonly snapshot: EncounterSnapshot;
    readonly windows: readonly ReadWindow[];
  }): Promise<readonly CandidateNotice[]>;
}

/** The lawful floor: an Encounter with nothing to say is a complete Encounter. */
export const silentGenerator: NoticeGenerator = async () => [];

export interface CapturedDraft {
  readonly snapshot: EncounterSnapshot;
  readonly text: string;
}

/**
 * Server-owned capture of the current Working Draft. Member-scoped in the WHERE
 * clause: there is no path that reads the text before confirming whose it is.
 *
 * Deliberately selects neither `section_addressable_at` nor any structure: this
 * act must work identically on a draft that has never been segmented.
 */
export async function captureDraft(
  manuscriptId: string,
  memberId: string,
): Promise<CapturedDraft | null> {
  const res = await query<{ id: string; content: string; version: string }>(
    `SELECT d.id, d.content, d.version
       FROM manuscript_working_drafts d
       JOIN member_manuscripts m ON m.id = d.manuscript_id
      WHERE d.manuscript_id = $1 AND d.member_id = $2 AND m.member_id = $2`,
    [manuscriptId, memberId],
  );
  const row = res.rows[0];
  if (!row) return null;

  const text = row.content ?? '';
  return {
    text,
    snapshot: {
      draftId: row.id,
      manuscriptId,
      revisionNumber: Number(row.version),
      wholeDraftDigest: sha256(text),
      length: Array.from(text).length,
    },
  };
}

/** An anchor is honest only if its span still hashes to what it claims. */
export function anchorMatches(text: string, a: Anchor): boolean {
  const points = Array.from(text);
  if (a.startCodePoint < 0 || a.endCodePoint > points.length) return false;
  if (a.endCodePoint <= a.startCodePoint) return false;
  return sha256(points.slice(a.startCodePoint, a.endCodePoint).join('')) === a.spanDigest;
}

/**
 * Whether a notice's anchors still point into the Work as it is now.
 *
 * E2 §1B: if the draft changes while an Encounter is open, its anchors become
 * STALE rather than quietly relocating themselves onto new prose.
 */
export function anchorsAreCurrent(
  taken: EncounterSnapshot,
  currentWholeDraftDigest: string,
): boolean {
  return taken.wholeDraftDigest === currentWholeDraftDigest;
}

export async function encounter(
  manuscriptId: string,
  memberId: string,
  generate: NoticeGenerator = silentGenerator,
): Promise<EncounterResult> {
  const captured = await captureDraft(manuscriptId, memberId);
  /* No Working Draft is a refusal, NOT a Source read. */
  if (!captured) return { ok: false, refusal: 'not_readable' };

  const traversal = traverseWhole(captured.text);
  /* Refuse honestly rather than sampling invisibly (§1A). */
  if (!traversal.complete) return { ok: false, refusal: 'not_traversable' };

  let candidates;
  try {
    candidates = await generate({ snapshot: captured.snapshot, windows: traversal.windows });
  } catch (err) {
    /* C7. A perceiving act that did not complete is a typed refusal, never an
       empty notice list — the one substitution that would let a provider outage
       look like MAIA having considered the Work and found nothing to say. */
    if (err instanceof Error && err.name === 'CognitionUnavailable') {
      return { ok: false, refusal: 'cognition_unavailable' };
    }
    throw err;
  }

  const notices: MaiaNotice[] = [];
  for (const c of candidates) {
    /* Fail closed toward silence: an unlawful proposal is dropped, never
       repaired, and never reported — telling the writer something was withheld
       would make the system's silence into information about their book. */
    if (screenCandidate(c).length > 0) continue;
    if (!c.anchors.every((a) => anchorMatches(captured.text, a))) continue;
    notices.push({
      authoredBy: 'maia',
      family: c.family as MaiaNotice['family'],
      text: c.text,
      anchors: c.anchors,
    });
  }

  return {
    ok: true,
    snapshot: captured.snapshot,
    notices,
    /* The writer's own return enters through the writer, never through here. */
    recollections: [],
  };
}
