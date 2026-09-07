/**
 * WS2-03B — the lower Studio band: Versions · Structure · Goals · Statistics.
 *
 * 04's footer carries four regions, and the founder's instruction is to
 * realize the structural capacity they represent while exposing only what
 * exists. Region by region, that is:
 *
 *   VERSIONS    REAL. Kept revisions, read from the draft's revision list —
 *               the same rows the History drawer showed, now standing where
 *               04 puts them. "Keep a version" at the table still creates
 *               them; nothing here checkpoints on the member's behalf.
 *
 *   STRUCTURE   Outline is REAL and satisfied in this room (the outline
 *               column). Threads · Timeline · Word Web have no substrate and
 *               are drawn unavailable — present, unpressable, unpromised.
 *               04 draws these as TABS. A tab that cannot switch anything is
 *               a control that does nothing, so they are not tabs here.
 *
 *   GOALS       REAL as of Goals v1 — and STILL NO BARS. The member can now
 *               declare a goal and the system counts against it, which D-003
 *               authorized ("goal progress against a writer-declared target").
 *               What has not changed is the refusal underneath the original
 *               note: 04's three gold progress bars stay unbuilt. A bar is a
 *               shape that says how full you are; "2,140 / 3,000 words" says
 *               what was counted. The figure is arithmetic about the work; the
 *               bar is a feeling about the writer.
 *
 *               This region is a DOOR, not the owner (Q-D — ownership is not
 *               reachability). It renders the same list the rail panel does,
 *               read once by the room. A second Goals system here is the
 *               named mistake.
 *
 *   STATISTICS  REAL, and only the figures that are counted rather than
 *               judged: words in the draft, sections in the manuscript,
 *               versions kept. No reading time (a rate would be invented),
 *               no comments (no substrate), no completion of any kind.
 *
 * The band is dismissible because PANELS marks versions/goals/statistics
 * contextual, and a contextual surface may not become permanent furniture.
 *
 * ── WS2-03B CORRECTION 3: AIR, AND A HIERARCHY WITHIN THE BAND ─────────────
 *
 * At the authenticated capture this read as a status dashboard: four regions
 * competing on one baseline at one weight, every figure equally loud. 04's
 * band is quieter and more spatial than that.
 *
 * The content is unchanged — nothing was removed to make it calmer. What
 * changed is air and rank: the band breathes vertically, region labels get
 * room above their contents, and the metadata that does not need immediate
 * attention (a revision's date, a secondary figure) drops to `quiet` so the
 * one thing worth seeing at a glance in each region can carry `secondary`.
 */
'use client';

import { GOLD, GROUND, INK, RADIUS, RULE, SPACE } from '../studioTheme';
import { capabilityOf, isBuilt } from '../studioMap';
import { progressFor, progressLabel, type Measurable, type WriterGoal } from '@/lib/writersStudio/goalsClient';
import { StudioText } from '../studio/StudioType';
import { formatWhen, pageEstimate, type RevisionSummary } from '../../press/manuscript/workingDraftClient';

/**
 * The structural surfaces 04 bands together — now a PROJECTION, not a claim.
 *
 * D3. This array used to carry its own `available` flags, which made a lower
 * band one of three places that could independently decide whether a capability
 * existed. Worse, `threads` was declared ONLY here: a ratified Structure concept
 * (FIELD-MAP §3, §4) whose sole trace in the product was a boolean in a band,
 * which is how the census came to read it as an orphan and propose removing it.
 *
 * Availability is now read from studioMap.ts, the single authority — through
 * `capabilityOf`, which answers for placed destinations and for ratified ones
 * that have no place in the rail grammar yet (Threads). This file
 * keeps what it legitimately owns — that these four surfaces are banded
 * together, and in what order — and asks the map whether each one exists.
 *
 * `outline` is the band's name for the destination the map calls `structure`;
 * the two are the same capability seen from two rooms.
 */
const STRUCTURE_BAND: readonly { id: string; label: string; destinationId: string }[] = [
  { id: 'outline', label: 'Outline', destinationId: 'structure' },
  { id: 'threads', label: 'Threads', destinationId: 'threads' },
  { id: 'timeline', label: 'Timeline', destinationId: 'timeline' },
  { id: 'word-web', label: 'Word Web', destinationId: 'word-web' },
];

export const STRUCTURE_SURFACES = STRUCTURE_BAND.map((s) => {
  const capability = capabilityOf(s.destinationId);
  if (capability === null) {
    throw new Error(
      `Lower band: "${s.label}" names capability "${s.destinationId}", which studioMap.ts does not record.`,
    );
  }
  return { id: s.id, label: s.label, available: isBuilt(capability) };
});

export interface StudioLowerBandProps {
  /** The room's ONE reading of the writer's goals. Never fetched here. */
  goals: WriterGoal[] | null;
  goalCounts: Measurable;
  /** Opens the Goals panel — this band shows, the panel is where they are made. */
  onOpenGoals: () => void;
  revisions: RevisionSummary[] | null;
  /** Words in the draft on the table right now. Counted, not estimated. */
  wordCount: number | null;
  sectionCount: number | null;
  /** Whether the outline column is currently showing. */
  outlineOpen: boolean;
  onShowOutline: () => void;
  onDismiss: () => void;
}

export default function StudioLowerBand({
  goals,
  goalCounts,
  onOpenGoals,
  revisions,
  wordCount,
  sectionCount,
  outlineOpen,
  onShowOutline,
  onDismiss,
}: StudioLowerBandProps) {
  /* Open goals only: a tally of everything ever declared would read as a score
     of the writer rather than a picture of what they are working toward. */
  const openGoals = (goals ?? []).filter((g) => g.standing === 'open');

  return (
    <footer
      data-band="studio-lower"
      style={{
        display: 'flex',
        gap: SPACE.band,
        alignItems: 'flex-start',
        padding: `${SPACE.roomy}px ${SPACE.roomy}px ${SPACE.comfortable}px`,
        borderTop: `1px solid ${RULE.soft}`,
        background: GROUND.raised,
        flexShrink: 0,
        overflowX: 'auto',
      }}
    >
      {/* ── Versions ──────────────────────────────────────────────────── */}
      <section style={{ minWidth: 210 }}>
        <StudioText role="panelLabel" style={{ marginBottom: SPACE.base }}>
          Versions
        </StudioText>
        {revisions === null ? (
          <StudioText role="metadata">reading…</StudioText>
        ) : revisions.length === 0 ? (
          <StudioText role="metadata">
            None kept yet. “Keep a version” sets one down.
          </StudioText>
        ) : (
          revisions.slice(0, 4).map((r) => (
            <div
              key={r.revisionNumber}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: SPACE.roomy,
                marginBottom: SPACE.tight,
              }}
            >
              <StudioText role="metadata" tone="secondary" as="span">
                {r.note ? r.note : `Version ${r.revisionNumber}`}
              </StudioText>
              <StudioText role="metadata" tone="quiet" as="span">
                {formatWhen(r.createdAt)}
              </StudioText>
            </div>
          ))
        )}
        {revisions && revisions.length > 0 && (
          <StudioText role="metadata" tone="quiet" style={{ marginTop: SPACE.snug }}>
            ~{pageEstimate(revisions[0].contentChars)} page
            {pageEstimate(revisions[0].contentChars) === 1 ? '' : 's'} at the latest keep
          </StudioText>
        )}
      </section>

      {/* ── Structure ─────────────────────────────────────────────────── */}
      <section style={{ minWidth: 240 }}>
        <div style={{ display: 'flex', gap: SPACE.comfortable, marginBottom: SPACE.base }}>
          {STRUCTURE_SURFACES.map((t) => {
            const on = t.id === 'outline' && outlineOpen;
            if (!t.available) {
              return (
                <span
                  key={t.id}
                  data-surface={t.id}
                  data-state="unavailable"
                  aria-disabled
                  style={{ opacity: 0.45 }}
                >
                  <StudioText role="panelLabel" tone="quiet" as="span">
                    {t.label}
                  </StudioText>
                </span>
              );
            }
            return (
              <button
                key={t.id}
                type="button"
                data-surface={t.id}
                data-state={on ? 'selected' : 'rest'}
                onClick={onShowOutline}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  paddingBottom: 2,
                  cursor: 'pointer',
                  ...(on ? { boxShadow: `0 2px 0 ${GOLD.DEFAULT}` } : {}),
                }}
              >
                <StudioText role="panelLabel" tone={on ? 'secondary' : 'muted'} as="span">
                  {t.label}
                </StudioText>
              </button>
            );
          })}
        </div>
        <StudioText role="metadata">
          {sectionCount === null
            ? '—'
            : sectionCount === 0
              ? 'One continuous draft — no sections.'
              : `${sectionCount} section${sectionCount === 1 ? '' : 's'} in the manuscript.`}
        </StudioText>
      </section>

      {/* ── Goals ─────────────────────────────────────────────────────── */}
      <section
        style={{ minWidth: 220 }}
        data-region="goals"
        data-state={goals === null ? 'unavailable' : 'available'}
      >
        <StudioText role="panelLabel" style={{ marginBottom: SPACE.base }}>
          Goals
        </StudioText>
        {goals === null ? (
          <StudioText role="metadata" style={{ maxWidth: '22ch', opacity: 0.7 }}>
            reading…
          </StudioText>
        ) : openGoals.length === 0 ? (
          <StudioText role="metadata" style={{ maxWidth: '22ch', opacity: 0.7 }}>
            A goal is yours to set.{' '}
            <button
              type="button"
              onClick={onOpenGoals}
              style={{ background: 'none', border: 0, padding: 0, cursor: 'pointer',
                       color: 'inherit', textDecoration: 'underline', textUnderlineOffset: 4 }}
            >
              Declare one
            </button>
            , or don't — nothing here needs one.
          </StudioText>
        ) : (
          <>
            {openGoals.slice(0, 3).map((g) => {
              const figure = progressLabel(progressFor(g, goalCounts));
              return (
                <div key={g.id} style={{ marginBottom: SPACE.snug }} data-goal-row={g.kind}>
                  <StudioText role="metadata" style={{ maxWidth: '24ch', opacity: 0.8 }}>
                    {g.statement}
                  </StudioText>
                  {/* The counted figure, never a bar and never a rate (FR-10). */}
                  {figure && (
                    <StudioText role="metadata" style={{ opacity: 0.5 }} data-goal-figure>
                      {figure}
                    </StudioText>
                  )}
                </div>
              );
            })}
            {openGoals.length > 3 && (
              <StudioText role="metadata" style={{ opacity: 0.4 }}>
                {openGoals.length - 3} more
              </StudioText>
            )}
          </>
        )}
      </section>

      {/* ── Statistics ────────────────────────────────────────────────── */}
      <section style={{ minWidth: 190 }}>
        <StudioText role="panelLabel" style={{ marginBottom: SPACE.base }}>
          Statistics
        </StudioText>
        <StudioText
          role="workIdentity"
          style={{ color: INK.primary, marginBottom: SPACE.snug }}
        >
          {wordCount === null ? '—' : `${wordCount.toLocaleString()} words`}
        </StudioText>
        {[
          ['Sections', sectionCount === null ? '—' : String(sectionCount)],
          ['Versions kept', revisions === null ? '—' : String(revisions.length)],
        ].map(([k, v]) => (
          <div
            key={k}
            style={{ display: 'flex', justifyContent: 'space-between', gap: SPACE.roomy }}
          >
            <StudioText role="metadata" tone="quiet" as="span">
              {k}
            </StudioText>
            <StudioText role="metadata" tone="quiet" as="span">
              {v}
            </StudioText>
          </div>
        ))}
      </section>

      <span style={{ flex: 1 }} />
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss the lower band"
        style={{
          background: 'none',
          border: `1px solid ${RULE.soft}`,
          borderRadius: RADIUS.sm,
          cursor: 'pointer',
          padding: `${SPACE.tight}px ${SPACE.snug}px`,
          color: INK.quiet,
        }}
      >
        <StudioText role="metadata" as="span">
          ✕
        </StudioText>
      </button>
    </footer>
  );
}
