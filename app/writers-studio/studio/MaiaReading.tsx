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

import { INK, MAIA_ACCENT, RADIUS, RULE, SPACE } from '../studioTheme';
import { StudioText } from './StudioType';
import { StudioInsightChip, type InsightKind } from './StudioInsightChip';

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
