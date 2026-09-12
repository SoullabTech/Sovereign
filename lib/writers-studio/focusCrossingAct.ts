/**
 * THE FOCUS CROSSING ACT — writing and reading the provenance of one gesture.
 *
 * ⭐⭐ THE IDEMPOTENCY LAW:
 *
 *   Retries may repeat transport. They may not create a second human act.
 *
 * So a second arrival under the same `actId` either CONTINUES the act it
 * already opened, or — if it describes a materially different one — is a
 * CONTRADICTION and is refused. It is never reconciled. Silently accepting a
 * changed member set, a changed order, a changed active target or a changed
 * Work would make the record say the writer asked something they never asked,
 * and the record's only purpose is to be the thing that cannot say that.
 *
 *   If the same actId arrives with a different Focus Set, that is not a retry.
 *   It is a contradiction.
 *
 * ⛔ A NEW WRITER CHOICE IS A NEW ACT. Choosing a different place to work on is
 * a real human act and gets its own identity. That is why A4 refuses rather
 * than updating: an act record that could be edited to match the present would
 * lose the only fact it exists to hold.
 *
 * ⛔ AND THIS IS NOT THE FOCUS PERSISTENCE STORE. Nothing here mutates
 * membership after the act opens; there is no setActive, no addMember, no
 * removeMember. U2 — where the living Focus Set lives — is a separate question
 * and must stay one.
 */

import { query, transaction } from '@/lib/db/postgres';

export type MemberCurrencyState = 'current' | 'unverified' | 'unavailable';

export interface FocusActMember {
  readonly focusMemberId: string;
  readonly ordinal: number;
  readonly currencyState: MemberCurrencyState;
  readonly bodyAvailable: boolean;
  readonly disclosureReceiptId: string | null;
}

export interface FocusCrossingActRecord {
  readonly actId: string;
  readonly memberId: string;
  readonly workId: string;
  /**
   * ⭐ WHAT EXACT STATE OF THE MANUSCRIPT WAS MAIA LOOKING AT?
   *
   * Founder ruling 2026-09-12. Content-free provenance: the working draft and
   * the version its bodies came from. This is what lets a later
   * RevisionProposal refuse itself — *a proposal built against version 37 may
   * not be silently applied to version 38.* Nullable only for acts recorded
   * before this was added.
   */
  readonly workingDraftId: string | null;
  readonly workingDraftVersion: number | null;
  readonly activeMemberId: string | null;
  readonly canonicalTurnId: string | null;
  readonly members: FocusActMember[];
}

export interface OpenFocusActInput {
  readonly actId: string;
  readonly memberId: string;
  readonly workId: string;
  readonly workingDraftId: string;
  readonly workingDraftVersion: number;
  readonly members: readonly FocusActMember[];
  readonly activeMemberId: string | null;
}

export type OpenActOutcome =
  /** The act is now recorded. This gesture had not been seen before. */
  | { kind: 'opened'; act: FocusCrossingActRecord }
  /** The same gesture, arriving again, describing the same act. */
  | { kind: 'continued'; act: FocusCrossingActRecord }
  /** ⛔ The same actId describing a DIFFERENT act. Nothing was written. */
  | { kind: 'contradiction'; why: string }
  /** ⛔ An act that could not be true. Nothing was written. */
  | { kind: 'refused'; why: string }
  /** The record could not be established. ⛔ Never reported as an act. */
  | { kind: 'unavailable' };

export type CompleteActOutcome =
  | { kind: 'completed' }
  | { kind: 'refused'; why: string }
  | { kind: 'unavailable' };

/**
 * A5 · A6 · A7 — the shapes an act may not have, checked BEFORE any row exists.
 *
 * ⛔ Refused here means nothing is written at all. A record that had to be
 * cleaned up afterwards would be a record that briefly stated an impossible act.
 */
function impossible(input: OpenFocusActInput): string | null {
  const { members, activeMemberId } = input;
  if (!members.length) return 'an act must declare at least one place';

  const seen = new Set<string>();
  for (const m of members) {
    if (seen.has(m.focusMemberId)) return `duplicate member ${m.focusMemberId}`;
    seen.add(m.focusMemberId);
    /* A7 · the two authorities, kept apart. A member whose body did not cross
       cannot hold the receipt that says it did. */
    if (m.bodyAvailable !== (m.currencyState === 'current')) {
      return `member ${m.focusMemberId}: bodyAvailable disagrees with its currency state`;
    }
    if (m.disclosureReceiptId !== null && !m.bodyAvailable) {
      return `member ${m.focusMemberId}: an unreadable member carries a disclosure receipt`;
    }
  }
  const ordinals = members.map((m) => m.ordinal);
  if (ordinals.some((o, i) => o !== i + 1)) return 'ordinals are not the writer’s order';

  if (activeMemberId !== null) {
    const target = members.find((m) => m.focusMemberId === activeMemberId);
    /* ⛔ A5/A6 · ONE MESSAGE, NAMING NO OTHER MEMBER. A refusal that suggested
       a readable alternative would be proposing the substitution A6 forbids. */
    if (!target) return 'the active target is not a member of this set';
    if (!target.bodyAvailable) return 'the active target is not readable';
  }
  return null;
}

/** ⭐ Exactly what makes two arrivals the same act. Order included. */
function differsFrom(stored: FocusCrossingActRecord, input: OpenFocusActInput): string | null {
  if (stored.memberId !== input.memberId) return 'it belongs to a different writer';
  if (stored.workId !== input.workId) return 'it named a different work';
  /* ⭐ A retry that read a DIFFERENT draft version is not the same act: MAIA
     would be reasoning from prose the first attempt never saw. */
  if (stored.workingDraftId !== null && stored.workingDraftId !== input.workingDraftId) {
    return 'it read a different working draft';
  }
  if (stored.workingDraftVersion !== null && stored.workingDraftVersion !== input.workingDraftVersion) {
    return 'the work has changed since that act — a new version is a new act';
  }
  if (stored.activeMemberId !== input.activeMemberId) {
    /* A4 · choosing a different place to work on is a NEW writer act. */
    return 'it named a different active target — a new choice is a new act';
  }
  if (stored.members.length !== input.members.length) return 'it declared a different number of places';
  for (let i = 0; i < stored.members.length; i += 1) {
    const a = stored.members[i];
    const b = input.members[i];
    if (a.focusMemberId !== b.focusMemberId || a.ordinal !== b.ordinal) {
      return 'it declared different places, or in a different order';
    }
  }
  return null;
}

export async function readFocusCrossingAct(actId: string): Promise<FocusCrossingActRecord | null> {
  const a = await query<{
    act_id: string; member_id: string; work_id: string;
    working_draft_id: string | null; working_draft_version: string | null;
    active_member_id: string | null; canonical_turn_id: string | null;
  }>(
    `SELECT act_id, member_id, work_id, working_draft_id, working_draft_version,
            active_member_id, canonical_turn_id
       FROM focus_crossing_acts WHERE act_id = $1`, [actId]);
  const row = a.rows[0];
  if (!row) return null;

  const m = await query<{
    focus_member_id: string; ordinal: number; currency_state: MemberCurrencyState;
    body_available: boolean; disclosure_receipt_id: string | null;
  }>(
    `SELECT focus_member_id, ordinal, currency_state, body_available, disclosure_receipt_id
       FROM focus_crossing_act_members WHERE act_id = $1 ORDER BY ordinal ASC`, [actId]);

  return {
    actId: row.act_id, memberId: row.member_id, workId: row.work_id,
    workingDraftId: row.working_draft_id,
    workingDraftVersion: row.working_draft_version === null ? null : Number(row.working_draft_version),
    activeMemberId: row.active_member_id, canonicalTurnId: row.canonical_turn_id,
    members: m.rows.map((r) => ({
      focusMemberId: r.focus_member_id, ordinal: r.ordinal,
      currencyState: r.currency_state, bodyAvailable: r.body_available,
      disclosureReceiptId: r.disclosure_receipt_id,
    })),
  };
}

/**
 * Open the act, or recognise the gesture that already opened it.
 *
 * ⭐ A12 · ONE TRANSACTION. The act and its members are written together or not
 * at all: a torn write would leave an act declaring fewer places than the writer
 * declared, which is the single most misleading state this record could reach.
 */
export async function openFocusCrossingAct(input: OpenFocusActInput): Promise<OpenActOutcome> {
  const why = impossible(input);
  if (why) return { kind: 'refused', why };

  try {
    /* ⭐ The act and its members commit together or not at all. A torn write
       would leave an act declaring fewer places than the writer declared —
       the single most misleading state this record could reach. */
    const opened = await transaction(async (tx) => {
      const ins = await tx.query(
        `INSERT INTO focus_crossing_acts
           (act_id, member_id, work_id, working_draft_id, working_draft_version, active_member_id)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (act_id) DO NOTHING
         RETURNING act_id`,
        [input.actId, input.memberId, input.workId,
         input.workingDraftId, input.workingDraftVersion, input.activeMemberId],
      );
      if (ins.rowCount === 0) return false;
      for (const m of input.members) {
        await tx.query(
          `INSERT INTO focus_crossing_act_members
             (act_id, focus_member_id, ordinal, currency_state, body_available, disclosure_receipt_id)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [input.actId, m.focusMemberId, m.ordinal, m.currencyState, m.bodyAvailable, m.disclosureReceiptId],
        );
      }
      return true;
    });

    if (!opened) {
      /* ⭐ THE GESTURE IS ALREADY RECORDED. Whether this is a retry or a
         contradiction is decided by comparing what it says to what was stored —
         never by overwriting. */
      const stored = await readFocusCrossingAct(input.actId);
      if (!stored) return { kind: 'unavailable' };
      const diff = differsFrom(stored, input);
      return diff ? { kind: 'contradiction', why: diff } : { kind: 'continued', act: stored };
    }

    return {
      kind: 'opened',
      act: {
        actId: input.actId, memberId: input.memberId, workId: input.workId,
        workingDraftId: input.workingDraftId,
        workingDraftVersion: input.workingDraftVersion,
        activeMemberId: input.activeMemberId, canonicalTurnId: null,
        members: input.members.map((m) => ({ ...m })),
      },
    };
  } catch (err) {
    /* ⛔ An act that could not be recorded must not be reported as one. */
    console.error('[FOCUS/act] could not record the writer’s act', {
      error: err instanceof Error ? err.message : 'unknown',
    });
    return { kind: 'unavailable' };
  }
}

/**
 * A8 · A9 — name the one canonical turn this act produced.
 *
 * ⛔ A readable member without its receipt blocks completion: the act would
 * claim a crossing that nothing in the record evidences.
 * ⛔ A second, DIFFERENT turn refuses. One gesture, one MAIA turn. The same turn
 * arriving again is a retry and is idempotent.
 */
export async function completeFocusCrossingAct(
  actId: string, canonicalTurnId: string,
): Promise<CompleteActOutcome> {
  try {
    const act = await readFocusCrossingAct(actId);
    if (!act) return { kind: 'refused', why: 'no such act' };

    const unreceipted = act.members.filter((m) => m.bodyAvailable && m.disclosureReceiptId === null);
    if (unreceipted.length > 0) {
      return { kind: 'refused', why: 'a member whose body crossed carries no receipt' };
    }
    if (act.canonicalTurnId !== null) {
      return act.canonicalTurnId === canonicalTurnId
        ? { kind: 'completed' }
        : { kind: 'refused', why: 'this act already names a canonical turn' };
    }

    const r = await query(
      `UPDATE focus_crossing_acts
          SET canonical_turn_id = $1, completed_at = now()
        WHERE act_id = $2 AND canonical_turn_id IS NULL`,
      [canonicalTurnId, actId],
    );
    return r.rowCount === 1 ? { kind: 'completed' } : { kind: 'refused', why: 'the act already completed' };
  } catch (err) {
    console.error('[FOCUS/act] could not complete the writer’s act', {
      error: err instanceof Error ? err.message : 'unknown',
    });
    /* ⛔ A12 · unavailable is NOT completed. A crossing did occur; the record of
       it is incomplete, and saying otherwise would be the one untruth here that
       later revision provenance would silently inherit. */
    return { kind: 'unavailable' };
  }
}
