/**
 * WS2-03B — MAIA, adjacent to the Work and not its owner.
 *
 * The reference draws this column full: a greeting, four postures, three
 * developmental insights with evidence counts, "view all insights". Exactly
 * one of those has substrate on this surface — none. There is no reflection
 * endpoint here and no insight store anywhere, so what this column holds is
 * MAIA's PLACE in the room and an accurate account of what she can do in it.
 *
 * That is not a smaller version of 04's panel. It is the honest one:
 *
 *   · No insight cards. An invented reading of a member's manuscript is the
 *     single worst thing this room could fabricate — it would be the system
 *     interpreting their book and signing MAIA's name to it.
 *   · No postures. Reflect · Question · Notice · Connect are offers; an offer
 *     that cannot be accepted is a control that does nothing.
 *   · No count beside anything.
 *
 * ── D-019, HELD IN THE RENDER ──────────────────────────────────────────────
 *
 * Member material must stay distinguishable from MAIA's interpretation. Here
 * that is structural, not stylistic: this column contains NO member text at
 * all. It names the Work by title when the member's own declaration resolved
 * one, and otherwise says nothing about the work. The manuscript's words live
 * in the writing field, in serif, on the field ground; MAIA speaks in violet
 * sans on a raised panel and never quotes across that line.
 *
 * ── WHY CONVERSATIONS IS STILL CLOSED ──────────────────────────────────────
 *
 * The Studio side of the handoff is built and proven (workContext.ts:
 * assertRoundTripPreservesWork). The MAIA side is not: /maia is a generic
 * conversational surface that does not read a Work. Opening the door because
 * our half is ready would hand the member an exchange that has forgotten what
 * they are writing — the substitution failure again, one room over.
 */
'use client';

import { MAIA_ACCENT, RULE, SPACE } from '../studioTheme';
import { StudioText } from '../studio/StudioType';
import { MaiaVoice } from '../studio/MaiaReading';
import type { WorkContext } from '../workContext';

export const REFLECTION_SENTENCE =
  'Reflection with MAIA will become available when this Work can carry its context into the exchange and back.';

export default function MaiaColumn({ context }: { context: WorkContext }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: SPACE.comfortable }}>
      <MaiaVoice>{REFLECTION_SENTENCE}</MaiaVoice>

      <div
        style={{
          borderTop: `1px solid ${RULE.soft}`,
          paddingTop: SPACE.comfortable,
          display: 'flex',
          flexDirection: 'column',
          gap: SPACE.snug,
        }}
      >
        <StudioText role="panelLabel">In relation to</StudioText>
        {context.kind === 'work' ? (
          <>
            <StudioText role="navItem" tone="secondary">
              {context.work.title ?? 'your work'}
            </StudioText>
            <StudioText role="metadata" style={{ opacity: 0.75 }}>
              Declared by you. An exchange here would be situated in this Work —
              not in whatever was open most recently.
            </StudioText>
          </>
        ) : context.kind === 'ambiguous' ? (
          <StudioText role="metadata" style={{ opacity: 0.8 }}>
            You have declared this manuscript in {context.works.length} works. MAIA
            will not choose between them.
          </StudioText>
        ) : context.kind === 'unknown' ? (
          <StudioText role="metadata">reading your declarations…</StudioText>
        ) : (
          <StudioText role="metadata" style={{ opacity: 0.8 }}>
            No work is declared for what is on the table, so there is no Work
            context to carry.
          </StudioText>
        )}
      </div>

      <div
        style={{
          borderTop: `1px solid ${RULE.soft}`,
          paddingTop: SPACE.comfortable,
        }}
      >
        <StudioText role="metadata" style={{ color: MAIA_ACCENT.voice, opacity: 0.7 }}>
          MAIA reads; she does not hold your material. Nothing in this column is
          written by her into your manuscript.
        </StudioText>
      </div>
    </div>
  );
}
