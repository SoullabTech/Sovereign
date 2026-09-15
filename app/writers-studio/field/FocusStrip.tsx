'use client';

/**
 * THE FOCUS STRIP.
 *
 * ⭐ The mark in the manuscript is WHERE the writer's attention is; this is the
 * SAME attention carried into the conversation. Two manifestations of one
 * thing, so they share the treatment's focus mark and read as related.
 *
 * ⛔ It is never a permanent band. No focus, no strip — a band that is always
 * there is chrome, and chrome is the gravitational centre this room exists to
 * avoid.
 */

import { GOLD, INK, RADIUS, RULE, SPACE } from '../studioTheme';
import { StudioText } from '../studio/StudioType';
import { label, quote, type BodyOf, type HeldFocus, type SectionRef } from './heldFocus';

export interface FocusStripProps {
  focus: HeldFocus;
  sections: SectionRef[];
  bodyOf: BodyOf;
  canWiden: boolean;
  canNarrow: boolean;
  onWiden: () => void;
  onNarrow: () => void;
  onRelease: () => void;
  /**
   * The one gesture that carries the held focus into the conversation.
   *
   * ⛔ EXPLICIT ONLY. Nothing is sent, and no conversation is opened, because
   * the writer selected text. Framing is not asking.
   */
  onAsk: () => void;
}

export default function FocusStrip({
  focus, sections, bodyOf, canWiden, canNarrow, onWiden, onNarrow, onRelease, onAsk,
}: FocusStripProps) {
  const name = label(focus, sections);
  const said = quote(focus, bodyOf);
  return (
    <div
      data-field-focus
      data-field-focus-scale={focus.scale}
      style={{ display: 'flex', alignItems: 'flex-end', gap: SPACE.base, minWidth: 0 }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <StudioText role="metadata" as="span">
          <span style={{
            display: 'block', color: GOLD.text, letterSpacing: '0.13em',
            textTransform: 'uppercase',
          }}>
            Focus · {name}
          </span>
        </StudioText>
        <StudioText role="quiet" as="span">
          <span style={{
            display: 'block', overflow: 'hidden', textOverflow: 'ellipsis',
            whiteSpace: 'nowrap', color: INK.secondary,
          }}>
            {said ? `“${said}”` : ''}
          </span>
        </StudioText>
      </div>
      <span style={{ display: 'flex', gap: SPACE.tight, flex: '0 0 auto' }}>
        {/* The aperture, changed by the writer and no one else. */}
        <Quiet onClick={onWiden} disabled={!canWiden} label="Wider" />
        <Quiet onClick={onNarrow} disabled={!canNarrow} label="Narrower" />
        <Quiet onClick={onRelease} label="Release" />
        <Quiet onClick={onAsk} label="Ask MAIA" accent />
      </span>
    </div>
  );
}

function Quiet({
  onClick, label: text, disabled, accent,
}: { onClick: () => void; label: string; disabled?: boolean; accent?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      data-field-focus-act={text.toLowerCase().replace(/\s+/g, '-')}
      style={{
        background: 'transparent',
        border: `1px solid ${accent ? GOLD.edge : RULE.quiet}`,
        color: disabled ? INK.quiet : accent ? GOLD.text : INK.secondary,
        opacity: disabled ? 0.45 : 1,
        borderRadius: RADIUS.sm, font: 'inherit', fontSize: 11,
        padding: `${SPACE.tight}px ${SPACE.snug}px`, minHeight: 32,
        cursor: disabled ? 'default' : 'pointer',
      }}
    >
      {text}
    </button>
  );
}
