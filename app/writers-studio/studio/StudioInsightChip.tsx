/**
 * WS2-02B — the type chip on a developmental insight.
 *
 * Kind only. The component's props make severity unrepresentable rather than
 * merely discouraged: there is no `level`, no `priority`, no colour override.
 * A red "critical" chip would be a machine judgement wearing the costume of a
 * category — the same line maiaOffering.ts draws in data, held here in form.
 *
 * Both references show the discipline: the only figures beside an insight are
 * "3 passages" and "2 suggestions", which are citations a member can open.
 */
'use client';

import { INSIGHT_CHIP, RADIUS, SPACE, TYPE } from '../studioTheme';

export type InsightKind = keyof typeof INSIGHT_CHIP;

const LABEL: Record<InsightKind, string> = {
  theme: 'Theme',
  structure: 'Structure',
  continuity: 'Continuity',
  readerExperience: 'Reader experience',
};

export function StudioInsightChip({ kind }: { kind: InsightKind }) {
  const c = INSIGHT_CHIP[kind];
  const t = TYPE.metadata;
  return (
    <span
      data-insight-kind={kind}
      style={{
        display: 'inline-block',
        background: c.bg,
        color: c.ink,
        borderRadius: RADIUS.sm,
        padding: `${SPACE.hairline}px ${SPACE.snug}px`,
        fontFamily: t.family,
        fontSize: `${t.size}rem`,
        fontWeight: 600,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
      }}
    >
      {LABEL[kind]}
    </span>
  );
}
