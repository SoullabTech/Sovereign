'use client';

/**
 * FR-D step 3 — OBJECT-LOCAL EXPLANATION. The object explains itself.
 *
 * ── Why this exists, and why it is not a help system ──────────────────────
 *
 * The founder's first unaided gesture, walking production on 2026-09-07, was
 * to HOVER a label looking for meaning. Nothing answered. They then searched
 * the rail for instructions, searched it again for MAIA, and tried other
 * controls — the signature of hunting for what an act MEANS, not of missing a
 * button. W-05b: the failure is semantic discoverability.
 *
 * ⭐ THE CONSTRAINT THAT SHAPED THIS COMPONENT. A complete answer already
 * existed on that screen. `MaiaColumn` said "Declare one in 'This work' and
 * Conversations opens." — three columns away from the control it names. The
 * writer read the adjacent state and stayed blocked. So the census's ruling
 * constraint is: a help architecture that only ADDS SENTENCES ELSEWHERE ON
 * THE PAGE has already been tested by that walk, and it failed. The answer
 * must arrive AT the object, or it does not arrive.
 *
 * ── What this is NOT ──────────────────────────────────────────────────────
 *
 * The FR-D census found NO control needing more than object-local
 * explanation: steps 4 and 5 of the disclosure order came back empty, and the
 * founder accepted that finding. R-1 "Help section" is NOT REQUIRED. So this
 * is deliberately not a help framework — no registry, no ontology, no
 * provider, no tour. It is one small disclosure, used at the few controls the
 * census actually named.
 *
 * ⛔ It may not be attached to a control the census marked NO CHANGE. Home,
 * Manuscript, Export, outline rows, Begin, Import, Continue and the whole
 * Develop lens surface are already understood, and help there is the clutter
 * the ruling forbids.
 *
 * ── HELP ≠ STATE ──────────────────────────────────────────────────────────
 *
 * ⛔ Nothing constitutionally important goes in here. Availability, consent,
 * refusal, and consequence are STATE: they must be perceptible without being
 * requested, and they are rendered at rest by the rail and the mode bar. A
 * writer must never have to ask a control whether it is allowed to act.
 *
 * ── Input independence is a requirement, not a nicety ─────────────────────
 *
 *   pointer    hover opens; click pins it open
 *   keyboard   focus opens; Escape closes
 *   touch      tap opens; tap-away closes
 *
 * The hover gesture is what the walk EVIDENCED, not what the walk RULED. A
 * writer on iPhone has no hover state and is owed the same meaning, so the
 * disclosure is driven by an open/closed state that three different inputs
 * can reach — never by a CSS :hover rule, which only one of them can.
 */

import { useEffect, useId, useRef, useState } from 'react';
import { GROUND, INK, RADIUS, RULE, SPACE } from '../studioTheme';
import { StudioText } from './StudioType';

export interface StudioHintProps {
  /** What the object says about itself. One or two short sentences. */
  children: string;
  /** Accessible name for the disclosure control. */
  label: string;
  /** The control being explained. */
  anchor: React.ReactNode;
  style?: React.CSSProperties;
}

export function StudioHint({ children, label, anchor, style }: StudioHintProps) {
  const [open, setOpen] = useState(false);
  /* PINNED survives pointer-leave. Without it a writer who reaches toward the
     text to read it dismisses the thing they were reading. */
  const [pinned, setPinned] = useState(false);
  const id = useId();
  const wrap = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    if (!open && !pinned) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        setPinned(false);
      }
    };
    /* Touch and pointer both dismiss by acting elsewhere. `pointerdown`
       covers mouse, pen and touch in one listener rather than guessing the
       input from a media query. */
    const onDown = (e: PointerEvent) => {
      if (wrap.current && !wrap.current.contains(e.target as Node)) {
        setOpen(false);
        setPinned(false);
      }
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onDown);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onDown);
    };
  }, [open, pinned]);

  const shown = open || pinned;

  return (
    <span
      ref={wrap}
      data-studio-hint={shown ? 'open' : 'closed'}
      style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', gap: 6, ...style }}
      onPointerEnter={() => setOpen(true)}
      onPointerLeave={() => setOpen(false)}
    >
      {anchor}
      <button
        type="button"
        aria-label={label}
        aria-expanded={shown}
        aria-describedby={shown ? id : undefined}
        data-hint-trigger
        onClick={(e) => {
          e.stopPropagation();
          setPinned((p) => !p);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        style={{
          all: 'unset',
          cursor: 'pointer',
          /* A 24px target. Smaller is unreachable by thumb, which would make
             touch a second-class input in the one component whose whole point
             is that it is not. */
          width: 24,
          height: 24,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: RADIUS.pill,
          color: shown ? INK.secondary : INK.quiet,
          fontSize: 12,
          lineHeight: 1,
        }}
      >
        <span aria-hidden="true">?</span>
      </button>
      {shown && (
        <span
          id={id}
          role="note"
          data-hint-body
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: 0,
            zIndex: 40,
            maxWidth: 260,
            padding: `${SPACE.snug}px ${SPACE.base}px`,
            borderRadius: RADIUS.base,
            border: `1px solid ${RULE.quiet}`,
            background: GROUND.raised,
            boxShadow: '0 6px 20px rgba(0,0,0,0.35)',
          }}
        >
          <StudioText role="quiet" as="span" tone="secondary">
            {children}
          </StudioText>
        </span>
      )}
    </span>
  );
}
