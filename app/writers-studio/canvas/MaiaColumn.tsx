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
 * ── WS2-03B CORRECTION 4: VIOLET IS HER VOICE, NOT HER COLUMN ──────────────
 *
 * At the authenticated capture every line in this column was violet, and it
 * pulled harder than the manuscript did. Gold is meant to be the scarcest
 * emphasis in the Studio; MAIA's accent had quietly become the strongest
 * chromatic element in the body.
 *
 * The rule now: violet marks MAIA SPEAKING and nothing else. One sentence.
 * Everything else here — the Work she would be in relation to, the note about
 * what she does not hold — is the room describing her, not her voice, so it
 * is set in the room's own muted ink. She stays unmistakably distinguishable
 * from the member's serif prose (D-019 holds; the guard still passes) while
 * no longer competing with it.
 *
 * The token is untouched. MAIA_ACCENT.voice is SAMPLED from 04 and is not
 * this correction's to re-cut — what changed is how much of the column is
 * allowed to wear it.
 *
 * ── WHAT THIS COLUMN IS NOW ────────────────────────────────────────────────
 *
 * At WS2-03B it was a folded hinge. At 03C it was a truthful placeholder while
 * Conversations pointed away to /maia. At 03D it is the RESTING state of a
 * surface that becomes a real conversation in place: the member opens
 * Conversations and this region expands into the canonical exchange without
 * leaving the manuscript.
 *
 * The founder's ruling, and the reason: MAIA is adjacent to the Work, not a
 * destination the writer must abandon their book to reach.
 */
'use client';

import { RULE, SPACE } from '../studioTheme';
import { StudioText } from '../studio/StudioType';
import { MaiaVoice } from '../studio/MaiaReading';
import type { WorkContext } from '../workContext';

/**
 * WS2-03D — the resting state, corrected.
 *
 * This used to read "Reflection with MAIA will become available when this Work
 * can carry its context into the exchange and back." That sentence was true
 * when it was written and went FALSE the moment WS2-03C opened Conversations —
 * the Work does carry its context now. A promise that has been kept and still
 * reads as pending is not a small copy problem: it tells the member the room
 * cannot do the thing it is at that moment doing.
 *
 * Two resting states now, because there are two real situations.
 */
export const REFLECTION_READY =
  'Open Conversations to speak with MAIA here, beside your manuscript.';
export const REFLECTION_NEEDS_WORK =
  'MAIA can speak with you about a declared Work. Declare one in “This work” and Conversations opens.';

export default function MaiaColumn({ context }: { context: WorkContext }) {
  /* Which resting sentence is true right now. Conversations is available
     exactly when one Work is declared, so that is the condition. */
  const ready = context.kind === 'work';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: SPACE.comfortable }}>
      <MaiaVoice>{ready ? REFLECTION_READY : REFLECTION_NEEDS_WORK}</MaiaVoice>

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
        {/* The room describing MAIA — not MAIA speaking. Muted ink. */}
        <StudioText role="metadata" tone="quiet">
          MAIA reads; she does not hold your material. Nothing in this column is
          written by her into your manuscript.
        </StudioText>
      </div>
    </div>
  );
}
