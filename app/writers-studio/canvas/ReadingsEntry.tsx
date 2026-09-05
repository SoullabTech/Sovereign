/**
 * WS2-05B - the way into a reading, from the column it is about.
 *
 * NOTHING WHERE THERE IS NOTHING. With no stored reading this renders NULL -
 * not a placeholder, not "MAIA hasn't read this yet", not a button that would
 * produce one. No interpreter runs in production, and a surface that implied
 * one does would be the static-UI-claim failure: the room would advertise a
 * capability the system does not have.
 *
 * IT NAMES WHAT IT OPENS. "A reading of this Work" - a thing MAIA offered, that
 * the member may look at. Not "Structure", which would read as the Work's
 * structure rather than a proposal about it, and not "Organise", which would
 * promise the room does something to the book. It does not.
 */
'use client';

import { useEffect, useState } from 'react';
import { INK, RADIUS, RULE, SPACE } from '../studioTheme';
import { StudioText } from '../studio/StudioType';
import { fetchProposalSummaries, type ProposalSummary } from '@/lib/writersStudio/reviewClient';

/** The reading a member means when they have not said which. */
export function currentReading(all: readonly ProposalSummary[]): ProposalSummary | null {
  const adopted = all.find((p) => p.adoptedAt !== null);
  return adopted ?? all[0] ?? null;
}

export default function ReadingsEntry({
  manuscriptId, onOpen,
}: { manuscriptId: string; onOpen: (proposalId: string) => void }) {
  const [readings, setReadings] = useState<ProposalSummary[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    void fetchProposalSummaries(manuscriptId).then((r) => {
      if (!cancelled) setReadings(r);
    });
    return () => { cancelled = true; };
  }, [manuscriptId]);

  const reading = readings ? currentReading(readings) : null;
  if (!reading) return null;

  return (
    <div data-readings-entry={reading.id}
      style={{ marginTop: SPACE.comfortable, paddingTop: SPACE.base,
        borderTop: `1px solid ${RULE.quiet}` }}>
      <button
        type="button"
        onClick={() => onOpen(reading.id)}
        style={{
          background: 'none', border: `1px solid ${RULE.quiet}`,
          borderRadius: RADIUS.base, color: INK.secondary,
          padding: `${SPACE.tight} ${SPACE.base}`, cursor: 'pointer',
          font: 'inherit', textAlign: 'left', width: '100%',
        }}
      >
        A reading of this Work
      </button>
      {/* Her account, in her words, so the member knows what they are opening
          before they open it. Truncation would be the surface editing her. */}
      <StudioText role="metadata" tone="quiet"
        style={{ display: 'block', marginTop: SPACE.tight }}>
        {reading.account}
      </StudioText>
      {readings && readings.length > 1 && (
        <StudioText role="metadata" tone="quiet" style={{ display: 'block' }}>
          {readings.length} readings have been made of this Work.
        </StudioText>
      )}
    </div>
  );
}
