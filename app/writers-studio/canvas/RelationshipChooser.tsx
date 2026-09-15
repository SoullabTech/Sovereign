'use client';
/**
 * RETURN-RELATIONSHIP · PHASE B — what the room shows before a conversation
 * exists on screen.
 *
 * ⭐⭐ THE DEFECT THIS CLOSES, in the room's own former words: *"a reload starts
 * a new one, because asking 'which conversation was this Work's?' is a
 * most-recent question and this lane refuses those."* ⭐ The refusal was right;
 * the conclusion was not. The lawful answer was never *guess*, and it was never
 * *forget* — it is **find them all and let her choose**.
 *
 * ⛔ THE DECISION IS NOT MADE HERE. `resumeDecision` already holds it — pure,
 * proven, and written for the observation subject — including the state that
 * refuses to round *could not find out* to *there are none*. ⛔ A second copy of
 * that law is a second thing that can drift.
 *
 * ── ⭐ FOUR STATES, AND THE FOURTH IS THE DANGEROUS ONE ───────────────────
 *
 *     fresh        discovery SUCCEEDED and found nothing → starting is lawful
 *     resume       exactly one → OFFER it; ⛔ never resume without her gesture
 *     choose       several → she picks; ⛔ the room does not
 *     unavailable  discovery FAILED → ⛔⛔ STARTING IS BLOCKED, because a
 *                  transient GET failure must not silently author a duplicate
 *
 * ⛔ AND PLURALITY IS NOT A PROBLEM TO SOLVE. Two exchanges on one chapter may
 * freeze different passages or pursue different questions; the substrate has
 * always permitted it. What stops is opening another one BY ACCIDENT.
 */
import { useCallback, useEffect, useState } from 'react';
import { apiFetch } from '@/lib/http/apiBase';
import { GROUND, INK, RADIUS, RULE, SPACE } from '../studioTheme';
import { StudioText, typeStyle } from '../studio/StudioType';
import {
  resumeDecision, type ResumeDecision, type ThreadDiscovery,
} from '@/lib/writersStudio/observationDialogueResume';

export interface Relationship {
  threadId: string;
  chainId: string;
  sectionId: string;
  sectionLabel: string | null;
  locusText: string;
  openedAt: string;
  lastSpokeAt: string | null;
  turnCount: number;
  versionCount: number;
  legacyLocus: boolean;
}

export interface RelationshipChooserProps {
  /** ⛔ `null` means no passage is open; there is nothing to discover. */
  sectionId: string | null;
  opening: boolean;
  refusal: string | null;
  onResume: (threadId: string) => void;
  /** ⭐ Starting another is an EXPLICIT act, never a consequence of arriving. */
  onStartNew: () => void;
}

/** ⛔ No ids in the writer's view. A UUID is not something to recognise. */
const said = (r: Relationship) =>
  r.turnCount === 0 ? 'nothing said yet'
    : r.turnCount === 1 ? '1 turn' : `${r.turnCount} turns`;
const wrote = (r: Relationship) =>
  r.versionCount === 0 ? 'no wording yet'
    : r.versionCount === 1 ? '1 version' : `${r.versionCount} versions`;

export default function RelationshipChooser({
  sectionId, opening, refusal, onResume, onStartNew,
}: RelationshipChooserProps) {
  const [decision, setDecision] = useState<ResumeDecision | null>(null);
  const [found, setFound] = useState<readonly Relationship[]>([]);

  const discover = useCallback(async (id: string) => {
    setDecision(null);
    let discovery: ThreadDiscovery;
    let rows: readonly Relationship[] = [];
    try {
      const res = await apiFetch(
        `/api/writers-studio/editorial/relationships?sectionId=${encodeURIComponent(id)}`);
      if (!res.ok) {
        /* ⛔⛔ NOT `[]`. The transport failing and the passage having no
           relationships are different facts, and only one is safe to act on. */
        discovery = { kind: 'unavailable', reason: `status ${res.status}` };
      } else {
        const body = await res.json();
        rows = Array.isArray(body?.relationships) ? body.relationships as Relationship[] : [];
        discovery = {
          kind: 'threads',
          /* ⭐ The projection the shared law consumes. The full records stay
             here for the writer to recognise; ⛔ the law is not re-typed to
             carry them. */
          threads: rows.map((r) => ({
            id: r.threadId, openedAt: r.openedAt, turnCount: r.turnCount,
          })),
        };
      }
    } catch {
      discovery = { kind: 'unavailable', reason: 'unreachable' };
    }
    setFound(rows);
    setDecision(resumeDecision(discovery));
  }, []);

  useEffect(() => {
    if (!sectionId) { setDecision(null); setFound([]); return; }
    void discover(sectionId);
  }, [sectionId, discover]);

  const card = (r: Relationship, cta: string) => (
    <div key={r.threadId} data-relationship={r.threadId}
      style={{ display: 'flex', flexDirection: 'column', gap: SPACE.hairline,
               border: `1px solid ${RULE.soft}`, borderRadius: RADIUS.sm,
               padding: SPACE.snug, background: GROUND.base }}>
      {/* ⭐⭐ THE FROZEN PASSAGE IS WHAT SHE RECOGNISES. Two exchanges on one
          chapter differ by the words they are about, not by their timestamps. */}
      <StudioText role="metadata" style={{ color: INK.quiet }}>About this passage</StudioText>
      <blockquote style={{ ...typeStyle('maiaReading'), margin: 0, color: INK.secondary,
                           borderLeft: `2px solid ${RULE.soft}`, paddingLeft: SPACE.snug }}>
        {r.locusText}
      </blockquote>
      <StudioText role="metadata" style={{ color: INK.quiet }}>
        {`${said(r)} · ${wrote(r)}`}
      </StudioText>
      {/* ⚠️ SAID, NOT HIDDEN. A pre-alignment relationship stays readable and
          comparable; only adoption is unavailable, and she is told which. */}
      {r.legacyLocus && (
        <StudioText role="metadata" style={{ color: INK.quiet }} data-relationship-legacy={r.threadId}>
          Readable and comparable. This older relationship can&rsquo;t be adopted
          into the manuscript.
        </StudioText>
      )}
      <button type="button" data-resume={r.threadId} onClick={() => onResume(r.threadId)}
        style={{ ...typeStyle('panelLabel'), alignSelf: 'flex-start', marginTop: SPACE.tight,
                 background: 'none', border: `1px solid ${RULE.soft}`, borderRadius: RADIUS.sm,
                 padding: `${SPACE.tight}px ${SPACE.snug}px`, color: INK.primary, cursor: 'pointer' }}>
        {cta}
      </button>
    </div>
  );

  const startNew = (label: string) => (
    <button type="button" data-start-new onClick={onStartNew} disabled={opening}
      style={{ ...typeStyle('panelLabel'), alignSelf: 'flex-start', background: 'none',
               border: 'none', color: INK.muted, cursor: 'pointer', padding: 0 }}>
      {opening ? 'Opening…' : label}
    </button>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: SPACE.snug }}>
      <StudioText role="panelLabel">MAIA · conversation</StudioText>

      {refusal && (
        <StudioText role="maiaReading" style={{ color: INK.muted }}>{refusal}</StudioText>
      )}

      {!sectionId && (
        <StudioText role="maiaReading" style={{ color: INK.muted }}>
          Open a passage in the manuscript, then ask for a conversation about it.
        </StudioText>
      )}

      {sectionId && decision === null && (
        <StudioText role="metadata" style={{ color: INK.muted }} data-discovery="pending">
          Looking for earlier conversations about this passage…
        </StudioText>
      )}

      {/* ⛔⛔ AND HERE THE ROOM DOES NOT OFFER TO START. Rounding a failed
          discovery to "there are none" is the one rounding that WRITES. */}
      {decision?.kind === 'unavailable' && (
        <StudioText role="maiaReading" style={{ color: INK.muted }} data-discovery="unavailable">
          Earlier conversations about this passage couldn&rsquo;t be looked up just
          now, so the Studio won&rsquo;t start a new one and risk leaving the first
          behind. Try again in a moment.
        </StudioText>
      )}

      {decision?.kind === 'fresh' && (
        <div data-discovery="fresh" style={{ display: 'flex', flexDirection: 'column', gap: SPACE.snug }}>
          <StudioText role="maiaReading" style={{ color: INK.muted }}>
            No conversation about this passage yet.
          </StudioText>
          {startNew('Start a conversation about this passage')}
        </div>
      )}

      {decision?.kind === 'resume' && (
        <div data-discovery="resume" style={{ display: 'flex', flexDirection: 'column', gap: SPACE.snug }}>
          {found.filter((r) => r.threadId === decision.threadId)
            .map((r) => card(r, 'Continue this conversation'))}
          {/* ⭐ Plurality survives — starting another stays possible, and stays
              an explicit act rather than what happens when she arrives. */}
          {startNew('Start a separate conversation about this passage')}
        </div>
      )}

      {decision?.kind === 'choose' && (
        <div data-discovery="choose" style={{ display: 'flex', flexDirection: 'column', gap: SPACE.snug }}>
          <StudioText role="maiaReading" style={{ color: INK.muted }}>
            {`You have ${found.length} conversations about this passage.`}
          </StudioText>
          {found.map((r) => card(r, 'Continue this one'))}
          {startNew('Start another conversation about this passage')}
        </div>
      )}
    </div>
  );
}
