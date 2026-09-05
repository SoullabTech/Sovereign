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
 *   GOALS       NO SUBSTRATE. There is no way for a member to declare a goal
 *               and nothing stores one, so the region says exactly that and
 *               draws no bars. 04's three gold progress bars were the single
 *               most tempting thing in the reference to fake: they are
 *               beautiful, they are trivial to hard-code, and they would have
 *               invented a measurement of a member's writing — the precise
 *               failure maiaOffering.ts exists to prevent.
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
import { StudioText } from '../studio/StudioType';
import { formatWhen, pageEstimate, type RevisionSummary } from '../../press/manuscript/workingDraftClient';

/** The structural surfaces 04 bands together. Only Outline exists. */
export const STRUCTURE_SURFACES = [
  { id: 'outline', label: 'Outline', available: true },
  { id: 'threads', label: 'Threads', available: false },
  { id: 'timeline', label: 'Timeline', available: false },
  { id: 'word-web', label: 'Word Web', available: false },
] as const;

export interface StudioLowerBandProps {
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
  revisions,
  wordCount,
  sectionCount,
  outlineOpen,
  onShowOutline,
  onDismiss,
}: StudioLowerBandProps) {
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
      <section style={{ minWidth: 220 }} data-region="goals" data-state="unavailable">
        <StudioText role="panelLabel" tone="quiet" style={{ marginBottom: SPACE.base }}>
          Goals
        </StudioText>
        <StudioText role="metadata" style={{ maxWidth: '22ch', opacity: 0.7 }}>
          A goal is yours to set. There is no way to declare one here yet, so
          nothing is measured.
        </StudioText>
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
