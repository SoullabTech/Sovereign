/**
 * LIVING VOICE — the surface of one creative encounter.
 *
 * ── WHAT THE WRITER SEES, AND WHY IT IS SHAPED THIS WAY ───────────────────
 *
 * The passage comes FIRST, in the writer's own words, before any lens is
 * offered. That order is the ontology made visible: the writer establishes the
 * subject, and MAIA is looking at what they chose rather than at their Work.
 * Showing it back is also the only honest way to say what was offered.
 *
 * The five lenses are INVITATIONS TO LOOK, never classifications of the
 * passage. So they are phrased as things to attend to — see it, hear it — and
 * none of them names a fault, a level, or a kind of writing. There is no
 * "Simplify it" and no risk score: both would make MAIA the judge of prose she
 * was handed for one encounter.
 *
 * SILENCE HAS ITS OWN STATE and it is not styled as a failure. When MAIA has
 * nothing that holds to her own rules, the panel says so plainly. A retry
 * button here would be the interface arguing with a lawful outcome.
 *
 * ⛔ NOTHING IN THIS COMPONENT PERSISTS. No localStorage, no draft, no
 * "recent passages". Closing it is not a deletion — there is nothing to
 * delete. And nothing MAIA says is written into the manuscript: adoption is
 * the writer's separate act, in their own field, in their own words.
 */
'use client';

import { LENSES, LENS_INVITATION, LENS_LABEL } from '@/lib/writersStudio/livingVoice';
import type { LivingVoice } from '@/lib/writersStudio/useLivingVoice';
import { GROUND, INK, RADIUS, RULE, SPACE } from '../studioTheme';
import { StudioText } from '../studio/StudioType';

export interface LivingVoicePanelProps {
  voice: LivingVoice;
}

export default function LivingVoicePanel({ voice }: LivingVoicePanelProps) {
  if (voice.phase === 'closed' || !voice.offer) return null;

  const busy = voice.phase === 'asking';

  return (
    <aside
      data-living-voice
      aria-label="Living Voice"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: SPACE.base,
        padding: SPACE.comfortable,
        background: GROUND.raised,
        borderRadius: RADIUS.panel,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: SPACE.base }}>
        <StudioText role="panelLabel">Living Voice</StudioText>
        <button
          type="button"
          onClick={voice.close}
          data-living-voice-close
          style={{ background: 'transparent', border: 'none', color: INK.quiet, cursor: 'pointer', padding: 0 }}
        >
          <StudioText role="metadata" as="span" tone="quiet">Done</StudioText>
        </button>
      </div>

      {/* The passage the writer chose, shown back exactly as it was offered. */}
      <blockquote
        data-living-voice-passage
        style={{
          margin: 0,
          padding: `${SPACE.snug}px ${SPACE.base}px`,
          borderLeft: `2px solid ${RULE.soft}`,
          background: GROUND.field,
          borderRadius: RADIUS.sm,
          maxHeight: 220,
          overflowY: 'auto',
        }}
      >
        <StudioText role="prose" as="p" style={{ whiteSpace: 'pre-wrap' }}>
          {voice.offer.passage}
        </StudioText>
      </blockquote>

      {voice.phase === 'refused' ? (
        /* The offer itself was not accepted. Nothing was sent, and the writer's
           selection is untouched — they choose a smaller passage themselves. */
        <StudioText role="quiet" tone="secondary">{voice.note}</StudioText>
      ) : (
        <>
          <StudioText role="metadata" tone="muted">
            {voice.phase === 'offered'
              ? 'Choose how you would like to look at it.'
              : voice.lens
                ? LENS_INVITATION[voice.lens]
                : null}
          </StudioText>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: SPACE.snug }}>
            {LENSES.map((l) => {
              const chosen = voice.lens === l;
              return (
                <button
                  key={l}
                  type="button"
                  disabled={busy}
                  onClick={() => voice.ask(l)}
                  data-living-voice-lens={l}
                  style={{
                    background: chosen ? GROUND.active : 'transparent',
                    border: `1px solid ${chosen ? RULE.DEFAULT : RULE.quiet}`,
                    borderRadius: RADIUS.pill,
                    padding: `${SPACE.tight}px ${SPACE.base}px`,
                    color: chosen ? INK.primary : INK.secondary,
                    cursor: busy ? 'default' : 'pointer',
                  }}
                >
                  <StudioText role="metadata" as="span">{LENS_LABEL[l]}</StudioText>
                </button>
              );
            })}
          </div>

          {busy && <StudioText role="quiet" tone="muted">Looking…</StudioText>}

          {voice.phase === 'answered' && voice.response && (
            <StudioText role="maiaReading" as="p" data-living-voice-response>
              {voice.response}
            </StudioText>
          )}

          {voice.phase === 'silent' && (
            /* Lawful, and said as such. Not "try again", not "no results". */
            <StudioText role="quiet" tone="muted" data-living-voice-silent>
              Nothing to add to this one. The passage is yours as it stands.
            </StudioText>
          )}

          {voice.phase === 'error' && (
            <StudioText role="quiet" tone="secondary">{voice.note}</StudioText>
          )}
        </>
      )}
    </aside>
  );
}
