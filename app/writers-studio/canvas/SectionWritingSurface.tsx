/**
 * WS2-04B — the writing surface for a section-addressable draft.
 *
 * A SIBLING of WritingSurface, not a rewrite of it. That component edits one
 * continuous string and remains correct for every draft that has not been
 * converted — which today is all of them. Branching between the two is the
 * Canvas's job; neither knows about the other.
 *
 * WHAT THIS COMPONENT DOES NOT DECIDE. Identity, authority, versioning and the
 * save lifecycle are all settled below it and it must not reinterpret any of
 * them:
 *
 *   which text to show     staged → queued → persisted → loaded, from the hook
 *   what a row is called   manuscript_draft_sections.id, from the server
 *   when a save happens    the debounce and the queue, never a keystroke
 *   what a status means    resolveSectionStatus, not a local guess
 *
 * THE WRITING SESSION IS LIFTED, not owned here. The outline and the canvas
 * must be the same session — one queue, one active id, one set of statuses —
 * or clicking a row would navigate a hook the canvas is not rendering from.
 * So the Canvas calls useSectionWriting and hands the result to both.
 *
 * HEADINGS ARE READ-ONLY in this cut. The heading is rendered structurally
 * above the field; the field holds body text only. Rename, split and merge are
 * explicit structure operations later rather than hidden behaviour inside a
 * text box.
 */
'use client';

import { useEffect, useRef, useState } from 'react';
import { apiFetch } from '@/lib/http/apiBase';
import type { SectionWriting } from '@/lib/writersStudio/useSectionWriting';
import type { SaveFn } from '@/lib/writersStudio/sectionSaveQueue';
import { GROUND, INK, RADIUS, RULE, SPACE } from '../studioTheme';
import { checkpointServerDraft, newIdempotencyKey } from '@/app/press/manuscript/workingDraftClient';
import { StudioText } from '../studio/StudioType';

export interface SectionWritingSurfaceProps {
  /** The shared writing session — see the header. */
  writing: SectionWriting;
  /** The Work being written. Required to keep a version of it. */
  manuscriptId: string;
  /** Told after a version is kept, so the room's version list can refresh. */
  onCheckpointed?: () => void;
}

/**
 * KEEP A VERSION — the writer's own act, carried into section-native writing.
 *
 * When writing moved from the continuous Worktable to section-native editing,
 * this gesture did not come with it: sections autosave, but nothing set a
 * version down. The consequence only showed at the far end of the Studio —
 * Develop refuses to read a Work that has moved past its last kept version,
 * sends the writer to Write to keep one, and Write had no way to do it. The
 * loop dead-ended at exactly the boundary it exists to protect.
 *
 * ── WHAT THE FIRST ATTEMPT GOT WRONG ──────────────────────────────────────
 * It built the checkpoint payload from `writing.sections`, which are the
 * MOUNT-TIME bodies, and sent that as the Work. Keeping a version therefore
 * rewrote the draft from a client snapshot: on the founder's walk the flattened
 * content went 496 → 485 bytes, the section headings vanished and a leading
 * space appeared. No sentence was lost, but the Work was altered by an act
 * whose entire promise is that it alters nothing — and every observation then
 * correctly superseded against a change the member had not made.
 *
 * ── THE CONTRACT NOW ──────────────────────────────────────────────────────
 * Keep a version checkpoints SERVER TRUTH. It never reconstructs the
 * manuscript from anything the client holds, and it sends NO manuscript body.
 *
 *   1  settle the pending autosave, or refuse
 *   2  read the save queue's latest server-acknowledged draft version
 *   3  POST that guard to /draft/checkpoint with NO request body
 *   4  the server freezes the section rows it already owns
 *   5  a moved revision is a refusal, never a retry
 *
 * The first section-native checkpoint round-tripped all sections through the
 * browser. That was textually safe but transport-unsafe for a real book: the
 * 381 KB JSON body passed through Next middleware and could die in
 * fromNodeNextRequest before this route ran. The bodyless checkpoint makes the
 * stronger rule structural: a Keep gesture cannot send manuscript prose at all.
 *
 * Step 1 matters for the opposite reason: a version that silently omits the
 * sentence typed two seconds ago is worse than no version, because the member
 * has been told their work is held. If the queue will not settle we refuse
 * rather than keep a partial state.
 *
 * NOT A NEW VERSIONING SYSTEM. The transport command is now a dedicated
 * bodyless POST, but it writes the SAME append-only revision store and advances
 * the SAME draft version/revision counters. Nothing decides when to keep except
 * the member: no autosave-as-version, no silent checkpoint. A version the
 * writer did not set down is not a version they chose.
 */
/**
 * Build the save call for a manuscript.
 *
 * `witnessDelayMs` is development-only and only when the witness asks: it holds
 * the RESPONSE so a section can be seen still saving while the next one opens.
 * The mutation commits at the same moment either way.
 */
export function makeSectionSave(manuscriptId: string, witnessDelayMs?: number): SaveFn {
  return async (sectionId, body, baseVersion) => {
    const q = witnessDelayMs ? `?witnessDelayMs=${witnessDelayMs}` : '';
    const res = await apiFetch(
      `/api/sovereign/manuscripts/${manuscriptId}/sections/${sectionId}${q}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body, baseVersion }),
      },
    );
    if (res.ok) {
      const data = await res.json();
      return { ok: true, version: data.version };
    }
    /* A 409 is a version conflict and must stay one: the latch depends on
       telling "the draft moved elsewhere" apart from "the save did not
       arrive". Anything else is an unknown outcome. */
    if (res.status === 409) return { ok: false, refusal: 'stale_base' };
    return { ok: false, refusal: 'error' };
  };
}

const SETTLE_TIMEOUT_MS = 4000;
const SETTLE_POLL_MS = 50;

function KeepAVersion({
  writing, manuscriptId, onCheckpointed,
}: {
  writing: SectionWriting;
  manuscriptId: string;
  onCheckpointed?: () => void;
}) {
  const [phase, setPhase] = useState<
    'idle' | 'keeping' | 'kept' | 'moved' | 'unsettled' | 'error'
  >('idle');

  const keep = async () => {
    if (phase === 'keeping') return;
    setPhase('keeping');

    /* 1 — the writer's last keystroke belongs in the version they are keeping. */
    writing.flushPending();
    const deadline = Date.now() + SETTLE_TIMEOUT_MS;
    while (writing.hasUnsavedWork()) {
      if (Date.now() > deadline) { setPhase('unsettled'); return; }
      await new Promise((r) => setTimeout(r, SETTLE_POLL_MS));
    }

    /* 2, 3, 4 — the queue knows the last server-acknowledged version. The
       checkpoint request carries that guard and NO manuscript body; the server
       freezes the sections it already holds. */
    const res = await checkpointServerDraft(apiFetch, manuscriptId, {
      baseRevisionId: writing.currentRevisionId(),
      idempotencyKey: newIdempotencyKey(),
    });

    /* 5 — a moved revision means someone else wrote after our last acknowledged
       save. Retrying against a newer base would cross an authorship boundary. */
    if (res.kind === 'ok') { setPhase('kept'); onCheckpointed?.(); return; }
    setPhase(res.kind === 'conflict' ? 'moved' : 'error');
  };

  const note =
    phase === 'moved'
      ? 'This work moved somewhere else while the version was being kept. Nothing was changed. Reload, then keep a version.'
      : phase === 'unsettled'
        ? 'Your last edits are still saving. Nothing was kept, so nothing is missing from a version. Try again in a moment.'
        : phase === 'error'
          ? 'The version could not be kept just now. Your writing is unchanged.'
          : phase === 'kept'
            ? 'version kept'
            : null;

  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: SPACE.base, justifyContent: 'flex-end' }}>
      {note && <StudioText role="metadata" tone="quiet">{note}</StudioText>}
      <button
        type="button"
        onClick={keep}
        disabled={phase === 'keeping'}
        data-keep-a-version
        style={{
          background: 'transparent',
          border: `1px solid ${RULE.quiet}`,
          borderRadius: RADIUS.pill,
          padding: `${SPACE.tight}px ${SPACE.base}px`,
          color: INK.secondary,
          cursor: phase === 'keeping' ? 'default' : 'pointer',
        }}
      >
        <StudioText role="metadata" as="span">
          {phase === 'keeping' ? 'keeping…' : 'Keep a version'}
        </StudioText>
      </button>
    </div>
  );
}

export default function SectionWritingSurface({
  writing, manuscriptId, onCheckpointed,
}: SectionWritingSurfaceProps) {
  const fieldRef = useRef<HTMLTextAreaElement | null>(null);
  const activeId = writing.activeId;

  /* Focus follows the writer, so keyboard navigation lands in the prose rather
     than leaving them somewhere they have to hunt for. */
  useEffect(() => {
    if (activeId) fieldRef.current?.focus();
  }, [activeId]);

  /* GROW TO CONTENT, exactly as the continuous field does.
     A fixed height here was wrong for this room: the field became taller than
     the outline beside it, the sibling panels ended early, and the ground
     below them showed through. WritingSurface sizes itself to its text and
     lets <main> scroll — one scroll for the whole room — and the geometry was
     measured for that. This is the same strategy, not a new one. */
  const body = writing.activeBody;
  useEffect(() => {
    const el = fieldRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, [body, activeId]);

  const active = writing.active;
  if (!active) {
    return <StudioText role="metadata">This draft has no sections to write in.</StudioText>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: SPACE.base }}>
      <KeepAVersion
        writing={writing}
        manuscriptId={manuscriptId}
        onCheckpointed={onCheckpointed}
      />
      {active.heading !== null && (
        <StudioText role="chapterTitle" as="h2">
          {active.heading}
        </StudioText>
      )}

      {!active.editable ? (
        <div
          style={{
            padding: SPACE.base,
            borderRadius: RADIUS.sm,
            background: GROUND.raised,
          }}
        >
          {/* A section whose shape this cut cannot split is shown whole and
              read-only. Offering a text box here would invite an edit the
              server is guaranteed to refuse. */}
          <StudioText role="metadata" style={{ marginBottom: SPACE.snug }}>
            This section can be read here but not yet edited.
          </StudioText>
          <StudioText role="prose" as="pre" style={{ whiteSpace: 'pre-wrap', margin: 0 }}>
            {active.body}
          </StudioText>
        </div>
      ) : (
        <textarea
          ref={fieldRef}
          value={writing.activeBody}
          onChange={(e) => writing.edit(e.target.value)}
          spellCheck
          aria-label={active.heading ?? `Section ${active.position + 1}`}
          rows={1}
          style={{
            width: '100%',
            resize: 'none',
            overflow: 'hidden',
            border: 'none',
            outline: 'none',
            background: 'transparent',
            font: 'inherit',
            lineHeight: 1.7,
            color: 'inherit',
          }}
        />
      )}
    </div>
  );
}
