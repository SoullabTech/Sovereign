'use client';

/**
 * WRITING-STATE-ANNOUNCE-01 · WHAT KIND OF DRAFT THIS IS — said where the
 * writer is.
 *
 * ⭐⭐ THE GOVERNING LAW, FOUNDER RULING:
 *
 *     The system may decide whether an act is technically AVAILABLE.
 *     The member decides whether an act that durably changes the STRUCTURE
 *     of their Work is TAKEN.
 *
 * The server can prove conversion is lossless — `convertDraft` partitions the
 * existing text without moving a character and `assertRoundTrip` rolls the
 * transaction back rather than commit a loss. ⛔ That settles the TEXTUAL
 * question and not the STRUCTURAL one: conversion makes section structure
 * durable, which changes what MAIA can point at in the member's book. So
 * availability is computed and the act is still offered, never performed.
 *
 * ── ⚠️ WHY THIS COMPONENT EXISTS AT ALL ───────────────────────────────────
 *
 * The truth was already written, and written well — `SECTION_BREAKS_COPY` names
 * the state, explains the consequence, and keeps a separate sentence for the
 * case with no act on offer. ⛔ It was attached to the OUTLINE panel, which is
 * dismissible and opens only when the SOURCE has sections, while the state it
 * describes belongs to the DRAFT. A Work begun in the Studio therefore met the
 * Worktable with no explanation anywhere.
 *
 * ⭐ So this is a RELOCATION, not a new vocabulary. The copy, the five states
 * and the availability gate are all unchanged; what changes is that the writing
 * field carries them and nothing needs opening to learn them.
 *
 * ⛔ AND IT SAYS NOTHING ABOUT SECTION VS WHOLE. Those are two creative scales,
 * ruled a WRITING decision. This component removes decisions about Soullab's
 * internal state; it does not erase decisions about how someone wants to work.
 */

import { SECTION_BREAKS_COPY } from '@/lib/writersStudio/confirmSectionBreaks';
import type { WriteMount, WriteState } from '@/lib/writersStudio/writeStateClient';
import { StudioText } from '../studio/StudioType';
import { INK, RULE, SPACE } from '../studioTheme';

export interface DraftStateNoticeProps {
  /** ⭐ The SERVER'S state, never the mount — the mount collapses three of them. */
  writeState: WriteState | null;
  writeMount: WriteMount;
  onConfirmSectionBreaks: () => void;
  confirming: boolean;
  canConfirm: boolean;
}

/**
 * ⭐ THE MEMBER-FACING SENTENCE FOR EACH SERVER STATE, and the act only where
 * the server proved one exists.
 *
 * ⛔ `section_aware` returns null: the normal Studio explains itself by working,
 * and a banner over a room that is behaving correctly is noise, not honesty.
 */
export function DraftStateNotice({
  writeState, writeMount, onConfirmSectionBreaks, confirming, canConfirm,
}: DraftStateNoticeProps) {
  /* Nothing is claimed while the answer is unknown, and nothing is claimed when
     the surface could not be prepared — `unavailable` already carries its own
     truthful sentence and must not acquire a second. */
  if (writeMount.mount === 'pending' || writeMount.mount === 'unavailable') return null;
  if (writeMount.mount === 'sections') return null;

  const mode = writeState?.mode ?? null;
  /* ⭐ The server's OWN reason comes first where it has one — it is more
     specific than anything written here. */
  const title = writeMount.notice?.title
    ?? (mode === 'no_draft' ? 'This Work has no draft yet.' : SECTION_BREAKS_COPY.title);
  const body = writeMount.notice?.body
    ?? (mode === 'continuous' ? SECTION_BREAKS_COPY.body
      : mode === 'no_draft' ? 'Start writing and it becomes the Work’s draft. '
        + 'Section navigation can come later, once there are sections to name.'
      : SECTION_BREAKS_COPY.bodyNotConvertible);

  /* ⛔⛔ THE ACT IS GATED ON THE SERVER STATE, NEVER THE MOUNT. `planConversion`
     refuses unless the draft matches the source-derived partition, so offering
     this on `continuous_unprovable` would render a control structurally
     incapable of succeeding — and `no_draft` has nothing to convert. */
  const actAvailable = mode === 'continuous';

  return (
    <div
      data-draft-state={mode ?? 'unknown'}
      data-draft-act={actAvailable ? 'available' : 'none'}
      style={{
        maxWidth: '44ch', marginBottom: SPACE.roomy,
        paddingBottom: SPACE.base, borderBottom: `1px solid ${RULE.quiet}`,
      }}
    >
      <StudioText role="metadata" style={{ marginBottom: SPACE.tight }}>{title}</StudioText>
      <StudioText role="quiet" style={{ color: INK.quiet }}>{body}</StudioText>
      {actAvailable && (
        <button
          type="button"
          onClick={onConfirmSectionBreaks}
          disabled={confirming || !canConfirm}
          data-action="confirm-section-breaks"
          style={{
            marginTop: SPACE.base, padding: '8px 14px', background: 'transparent',
            border: `1px solid ${RULE.soft}`, borderRadius: 6, color: 'inherit',
            font: 'inherit', cursor: confirming ? 'default' : 'pointer',
            opacity: confirming ? 0.6 : 1,
          }}
        >
          {confirming ? SECTION_BREAKS_COPY.working : SECTION_BREAKS_COPY.action}
        </button>
      )}
    </div>
  );
}
