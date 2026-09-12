/**
 * THE CONSTITUTED FOCUS CURRENCY RESOLVER — the one wiring.
 *
 * ⭐⭐ TWO DIFFERENT ACTS, and the boundary between them is the point.
 *
 *   FOCUS RESOLUTION   a member-facing host operation.
 *                      "Does this historical anchor still name current Work?"
 *                      ⛔ no MAIA · no cognition · no receipt · no content
 *                         returned to anyone.
 *
 *   FOCUS DISCLOSURE   the member presses Ask MAIA. Currency is re-established,
 *                      boundaries are established, authorized current bodies are
 *                      read, canonical cognition runs, receipts confirm at
 *                      handoff.
 *
 * This resolver may inspect the member's own current Work under the same
 * authenticated ownership that already lets the Canvas render it. It does not
 * send that Work into response-producing cognition, and it mints nothing.
 *
 *   Nothing enters MAIA because the Focus panel happened to open.
 *
 * ⛔ WHAT LEAVES THIS MODULE. Per member: an id, its section id, and one of four
 * words. Never the digest, never a body, never a length, never a diff. The
 * historical digest is read here and dies here — it reaches no browser, no URL
 * and no model.
 */

import { loadLiveWork } from '@/lib/manuscript/development/capture';
import { loadFrozenDevelopmentalReading } from '@/lib/manuscript/ask/frozenDevelopmentalReading';
import { memberRef } from '@/lib/privacy/memberRef';
import { focusAnchorsFor, type FocusAnchor } from '@/lib/writersStudio/focusAnchors';
import { resolveFocusCurrency, type FocusCurrency } from './focusCurrency';

export interface CurrencyRequest {
  memberId: string;
  workRef: string;
  readingId: string;
  observationKey: string;
  members: readonly { focusMemberId: string; sectionRef: string; range?: { start: number; end: number } }[];
}

/** The current working draft's version — the clock these answers are true of. */
async function draftVersion(workRef: string, memberId: string): Promise<number | null> {
  const { query } = await import('@/lib/db/postgres');
  const r = await query<{ version: string }>(
    `SELECT version FROM manuscript_working_drafts
      WHERE manuscript_id = $1 AND member_id = $2`, [workRef, memberId]);
  return r.rows[0] ? Number(r.rows[0].version) : null;
}

export async function focusCurrencyResolver(req: CurrencyRequest): Promise<FocusCurrency> {
  const unknown = (): FocusCurrency => ({
    /* ⛔ FAILURE TO ESTABLISH SAMENESS IS NOT EVIDENCE OF DIFFERENCE. Never
       `gone`, never `ready`, and no version — a resolution cannot name a state
       it did not inspect. */
    members: req.members.map((m) => ({
      focusMemberId: m.focusMemberId, sectionRef: m.sectionRef, currency: 'not_yet_known' as const,
    })),
    resolvedAgainstDraftVersion: null,
  });

  try {
    const reading = await loadFrozenDevelopmentalReading(req.workRef, req.readingId, req.memberId);
    if (!reading) return unknown();

    /* ⭐ THE ANCHORS ARE RE-DERIVED FROM THE FROZEN OBSERVATION, never taken
       from the request. The client names WHICH member is which; it does not get
       to say what the observation cited. A request claiming a passage the
       observation never declared resolves against nothing. */
    const observation = reading.observations.find((o) => o.key === req.observationKey);
    if (!observation) return unknown();
    const declared = focusAnchorsFor(observation.evidenceRefs);

    const anchors: (FocusAnchor & { focusMemberId: string })[] = [];
    for (const m of req.members) {
      const match = declared.find((a) => (
        a.sectionId === m.sectionRef
        && (a.kind === 'passage'
          ? !!m.range && a.range.start === m.range.start && a.range.end === m.range.end
          : !m.range)
      ));
      /* ⛔ A member the observation did not declare gets no currency of its own
         — it stays `not_yet_known`, which withholds. It is never given `ready`
         on the strength of the client having named it. */
      if (match) anchors.push({ ...match, focusMemberId: m.focusMemberId });
    }

    const [now, version] = await Promise.all([
      loadLiveWork(req.workRef, req.memberId),
      draftVersion(req.workRef, req.memberId),
    ]);

    const resolved = resolveFocusCurrency({
      anchors, readState: reading.readState, now, draftVersion: version,
    });

    /* Members the observation never declared are carried through as unknown, so
       the answer still has one row per member the caller asked about. */
    const byId = new Map(resolved.members.map((m) => [m.focusMemberId, m]));
    return {
      resolvedAgainstDraftVersion: resolved.resolvedAgainstDraftVersion,
      members: req.members.map((m) => byId.get(m.focusMemberId) ?? {
        focusMemberId: m.focusMemberId, sectionRef: m.sectionRef, currency: 'not_yet_known' as const,
      }),
    };
  } catch (err) {
    console.error('[FOCUS] currency could not be resolved', {
      memberRef: memberRef(req.memberId),
      error: err instanceof Error ? err.message : 'unknown',
    });
    return unknown();
  }
}
