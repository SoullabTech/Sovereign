/**
 * WS2-02B — MAIA's language, in the treatment screen 04 gives it.
 *
 * Violet, and set in sans rather than the manuscript's serif. That is the
 * design contract's choice; D-019 is why holding it matters — member material
 * stays distinguishable from MAIA interpretation. Neither decrees the other,
 * so an accessible re-treatment that preserved the distinction differently
 * would be legitimate work, not a violation.
 *
 * The evidence line is a count of citations a member can open. It is not a
 * confidence figure and there is nowhere to put one: the props carry no
 * numeric field but `evidenceCount`, so a score cannot reach the member
 * through this component.
 */
'use client';

import { INK, MAIA_ACCENT, RADIUS, RULE, SPACE, TYPE } from '../studioTheme';
import { StudioText } from './StudioType';
import { StudioInsightChip, type InsightKind } from './StudioInsightChip';

/**
 * MAIA's posture row, as 04 draws it: Reflect · Question · Notice · Connect,
 * in a 2x2 of quiet outlined cells beneath the greeting. Not gold — these are
 * MAIA's offers, and gold marks the member's own work.
 *
 * INERT DEPICTION. Each cell is a div with no handler, and deliberately not a
 * <button>: a control that cannot be pressed should not present itself as one
 * to a screen reader either. The fixture may show the form of a MAIA capability
 * without implying the capability works — that is the whole permission an inert
 * fixture carries, and it stops exactly at appearance.
 */
export const MAIA_POSTURES = ['Reflect', 'Question', 'Notice', 'Connect'] as const;

export function MaiaPostureRow() {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: SPACE.snug,
        marginTop: SPACE.comfortable,
      }}
    >
      {MAIA_POSTURES.map((label) => (
        <div
          key={label}
          data-posture={label.toLowerCase()}
          style={{
            border: `1px solid ${RULE.soft}`,
            borderRadius: RADIUS.base,
            padding: `${SPACE.snug}px ${SPACE.base}px`,
            color: INK.secondary,
            fontFamily: TYPE.navItem.family,
            fontSize: `${TYPE.navItem.size}rem`,
            textAlign: 'center',
          }}
        >
          {label}
        </div>
      ))}
    </div>
  );
}

export function MaiaVoice({ children }: { children: string }) {
  return (
    <StudioText role="maiaReading" style={{ color: MAIA_ACCENT.voice }}>
      {children}
    </StudioText>
  );
}

export interface MaiaInsightCardProps {
  kind: InsightKind;
  reading: string;
  /** Citations the member can open. Never a rating — see maiaOffering.ts. */
  evidenceCount: number;
  evidenceNoun?: 'passages' | 'suggestions';
}

export function MaiaInsightCard({
  kind,
  reading,
  evidenceCount,
  evidenceNoun = 'passages',
}: MaiaInsightCardProps) {
  return (
    <article
      style={{
        border: `1px solid ${RULE.soft}`,
        borderRadius: RADIUS.base,
        padding: SPACE.base,
        display: 'flex',
        flexDirection: 'column',
        gap: SPACE.snug,
      }}
    >
      <div>
        <StudioInsightChip kind={kind} />
      </div>
      <StudioText role="maiaReading" tone="secondary">
        {reading}
      </StudioText>
      <StudioText role="metadata" style={{ color: INK.muted }}>
        {evidenceCount} {evidenceNoun}
      </StudioText>
    </article>
  );
}
