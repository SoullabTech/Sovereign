'use client';

import { useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react';
import { useSearchParams } from 'next/navigation';
import { isCabinOrigin, cabinReturnPath } from '@/lib/cabin/doorway';
import { appearanceVars, geometryVars } from './tokens';
import { PRIMARY_MODES, type Appearance, type ShellGeometry, type StudioMode } from './types';

/**
 * PC3-S1 — the canonical Light Shell.
 *
 * Four regions in a fixed order: product bar · manuscript context · the Work ·
 * MAIA in relation. Appearance swaps colour roles only; geometry, region order,
 * navigation and capability are identical in every appearance (PC1 VS-06).
 *
 * The shell holds no authority. It renders what it is handed and reports a
 * mode choice upward; it never fetches, saves, commissions or navigates.
 */
export type ShellProps = {
  mode: StudioMode;
  appearance: Appearance;
  geometry: ShellGeometry;
  /** The current Work, when there is one. Home-at-begin has none, and no picker pretends otherwise. */
  workTitle?: string;
  memberInitial: string;
  onSelectMode?: (mode: StudioMode) => void;
  /**
   * The manuscript context and MAIA regions. Develop and Review pass both.
   * Home passes neither: it is one room, with no manuscript rail and no resident
   * MAIA (PC3-S2 §6) — the accepted bar and family, not the Develop geometry.
   */
  manuscript?: ReactNode;
  work: ReactNode;
  maia?: ReactNode;
  /** In Write, MAIA can be summoned before a passage has been selected. */
  onOpenMaia?: () => void;
  /** Optional line beneath the regions (#23 carries one). */
  footer?: ReactNode;
  /** Optional words set above the MAIA region (#23). */
  maiaAbove?: ReactNode;
  /**
   * PC3-S3 Full Canvas. A presentation state of the SAME room: the product bar
   * and the manuscript context recede; the Work region — and whatever editor it
   * holds — stays exactly where it is in the tree, so nothing inside it remounts.
   * Omitted by every S1/S2 state, whose output is unchanged.
   */
  canvas?: boolean;
};

type Side = 'left' | 'right';
type DragState = { side: Side; startX: number; startWidth: number };

const PANEL_MIN = { left: 176, right: 250 } as const;
const PANEL_MAX = { left: 560, right: 590 } as const;
const CENTRE_MIN = 340;
const PANEL_STORAGE_KEY = (mode: StudioMode) => 'soullab.studio.panel-layout.v1.' + mode;

/**
 * Presentation-only layout state. Regions never get unmounted by these controls:
 * active editorial conversations, selection, drafts and scroll remain in place.
 */
export function Shell(props: ShellProps) {
  const { mode, appearance, geometry } = props;
  const searchParams = useSearchParams();
  const fromCabin = isCabinOrigin(searchParams);
  const oneRoom = props.manuscript === undefined && props.maia === undefined;
  const canvas = props.canvas === true;
  const shellRef = useRef<HTMLDivElement>(null);
  const drag = useRef<DragState | null>(null);
  const [leftExpanded, setLeftExpanded] = useState(true);
  const [rightExpanded, setRightExpanded] = useState(true);
  const [leftWidth, setLeftWidth] = useState(geometry.manuscriptWidth);
  const [rightWidth, setRightWidth] = useState(geometry.maiaWidth);
  const [restored, setRestored] = useState(false);
  const hasLeft = !oneRoom && !canvas && props.manuscript !== undefined;
  const hasRight = !oneRoom && !canvas && props.maia !== undefined;
  const leftVisible = hasLeft && leftExpanded;
  const rightVisible = hasRight && rightExpanded;

  useEffect(() => {
    setRestored(false);
    let parsed: Record<string, unknown> | null = null;
    try {
      const raw = window.localStorage.getItem(PANEL_STORAGE_KEY(mode));
      if (raw) parsed = JSON.parse(raw) as Record<string, unknown>;
    } catch { /* Private browsing may disable storage; controls still function. */ }
    setLeftExpanded(typeof parsed?.leftExpanded === 'boolean' ? parsed.leftExpanded : true);
    setRightExpanded(typeof parsed?.rightExpanded === 'boolean' ? parsed.rightExpanded : true);
    const valid = (v: unknown, side: Side): v is number =>
      typeof v === 'number' && Number.isFinite(v) && v >= PANEL_MIN[side] && v <= PANEL_MAX[side];
    setLeftWidth(valid(parsed?.leftWidth, 'left') ? parsed.leftWidth : geometry.manuscriptWidth);
    setRightWidth(valid(parsed?.rightWidth, 'right') ? parsed.rightWidth : geometry.maiaWidth);
    setRestored(true);
  }, [mode, geometry.manuscriptWidth, geometry.maiaWidth]);

  useEffect(() => {
    if (!restored) return;
    try {
      window.localStorage.setItem(PANEL_STORAGE_KEY(mode), JSON.stringify({
        leftExpanded, rightExpanded, leftWidth, rightWidth,
      }));
    } catch { /* State remains fully usable without persistence. */ }
  }, [mode, leftExpanded, rightExpanded, leftWidth, rightWidth, restored]);

  const constrain = (side: Side, requested: number): number => {
    const bounds = shellRef.current?.getBoundingClientRect().width ?? window.innerWidth;
    const other = side === 'left'
      ? (rightVisible ? rightWidth : 0)
      : (leftVisible ? leftWidth : 0);
    const space = geometry.padLeft + geometry.padRight
      + (leftVisible ? geometry.gapLeft : 0) + (rightVisible ? geometry.gapRight : 0);
    const maximum = Math.max(PANEL_MIN[side], Math.min(PANEL_MAX[side], bounds - space - other - CENTRE_MIN));
    return Math.round(Math.min(maximum, Math.max(PANEL_MIN[side], requested)));
  };

  const movePanel = (side: Side, next: number) => {
    const width = constrain(side, next);
    if (side === 'left') setLeftWidth(width);
    else setRightWidth(width);
  };

  const pointerDown = (side: Side, event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    drag.current = { side, startX: event.clientX, startWidth: side === 'left' ? leftWidth : rightWidth };
    event.currentTarget.setPointerCapture(event.pointerId);
    event.preventDefault();
  };
  const pointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!drag.current) return;
    const { side, startX, startWidth } = drag.current;
    movePanel(side, startWidth + (event.clientX - startX) * (side === 'left' ? 1 : -1));
  };
  const pointerStop = (event: ReactPointerEvent<HTMLDivElement>) => {
    drag.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  };
  const keyboardResize = (side: Side, event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight' && event.key !== 'Home') return;
    event.preventDefault();
    const direction = event.key === 'ArrowLeft' ? -1 : event.key === 'ArrowRight' ? 1 : 0;
    const current = side === 'left' ? leftWidth : rightWidth;
    movePanel(side, direction === 0 ? PANEL_MIN[side] : current + direction * (side === 'left' ? 24 : -24));
  };

  const style = {
    ...appearanceVars(appearance), ...geometryVars(geometry),
    '--fr-ms-w': leftVisible ? `${constrain('left', leftWidth)}px` : '0px',
    '--fr-maia-w': rightVisible ? `${constrain('right', rightWidth)}px` : '0px',
  } as React.CSSProperties;

  return (
    <div
      ref={shellRef}
      className="fr-shell"
      data-left-open={leftVisible ? 'true' : 'false'}
      data-right-open={rightVisible ? 'true' : 'false'}
      data-appearance={appearance}
      data-mode={mode}
      data-work-panel={geometry.workPanel ? 'framed' : 'ground'}
      data-canvas={props.canvas === undefined ? undefined : canvas ? 'full' : 'resting'}
      style={style}
    >
      {canvas ? null : (
        <header className="fr-bar" data-region="topbar">
          <div className="fr-brand">
            <SoullabMark />
            <span>Soullab</span>
          </div>
          <nav className="fr-nav" aria-label="Studio">
            {fromCabin ? (
              <a href={cabinReturnPath()} className="fr-nav-item" aria-label="Return to Cabin">
                ← Cabin
              </a>
            ) : null}
            {PRIMARY_MODES.map((m) => (
              <button
                key={m.id}
                type="button"
                className="fr-nav-item"
                aria-current={m.id === mode ? 'page' : undefined}
                data-mode={m.id}
                onClick={() => props.onSelectMode?.(m.id)}
              >
                {m.label}
              </button>
            ))}
          </nav>
          {!oneRoom && !canvas ? (
            <div className="fr-panel-controls" aria-label="Studio panels">
              {props.manuscript !== undefined ? (
                <button type="button" className="fr-panel-toggle" aria-label={leftExpanded ? 'Hide manuscript panel' : 'Show manuscript panel'}
                  aria-pressed={leftExpanded} onClick={() => setLeftExpanded((v) => !v)}>
                  <span aria-hidden="true">{leftExpanded ? '‹' : '›'}</span> Manuscript
                </button>
              ) : null}
              {props.maia !== undefined ? (
                <button type="button" className="fr-panel-toggle" aria-label={rightExpanded ? 'Hide MAIA panel' : 'Show MAIA panel'}
                  aria-pressed={rightExpanded} onClick={() => setRightExpanded((v) => !v)}>
                  MAIA <span aria-hidden="true">{rightExpanded ? '›' : '‹'}</span>
                </button>
              ) : props.onOpenMaia ? (
                <button type="button" className="fr-panel-toggle" aria-label="Open MAIA panel" onClick={props.onOpenMaia}>
                  Open MAIA <span aria-hidden="true">›</span>
                </button>
              ) : null}
            </div>
          ) : null}
          {props.workTitle !== undefined ? (
            <div className="fr-workpick" aria-label="Current Work">
              <DocIcon />
              <span>{props.workTitle}</span>
              <ChevronDown />
            </div>
          ) : (
            <span className="fr-bar-spacer" aria-hidden="true" />
          )}
          <div className="fr-avatar" aria-hidden="true">
            {props.memberInitial}
          </div>
          <div className="fr-more" aria-hidden="true">
            •••
          </div>
        </header>
      )}

      <div className={oneRoom ? 'fr-room fr-room-single' : 'fr-room'}>
        {oneRoom || canvas ? null : (
          <aside className="fr-region fr-panel fr-manuscript" data-region="manuscript" aria-label="Manuscript" aria-hidden={!leftVisible}>
            {props.manuscript}
          </aside>
        )}
        <main className="fr-region fr-work" data-region="work" aria-label="The Work">
          {props.work}
        </main>
        {oneRoom || props.maia === undefined ? null : (
          <aside className="fr-region fr-panel fr-maia" data-region="maia" aria-label="MAIA" aria-hidden={!rightVisible}>
            {props.maiaAbove ? <div className="fr-maia-above">{props.maiaAbove}</div> : null}
            {props.maia}
          </aside>
        )}
        {hasLeft && leftVisible ? (
          <div className="fr-panel-splitter fr-panel-splitter-left" role="separator" tabIndex={0}
            aria-orientation="vertical" aria-label="Resize manuscript panel" aria-valuemin={PANEL_MIN.left}
            aria-valuemax={PANEL_MAX.left} aria-valuenow={Math.round(leftWidth)}
            title="Drag to resize the manuscript panel · double-click to reset"
            onPointerDown={(e) => pointerDown('left', e)} onPointerMove={pointerMove}
            onPointerUp={pointerStop} onPointerCancel={pointerStop}
            onKeyDown={(e) => keyboardResize('left', e)}
            onDoubleClick={() => setLeftWidth(geometry.manuscriptWidth)}
          />
        ) : null}
        {hasRight && rightVisible ? (
          <div className="fr-panel-splitter fr-panel-splitter-right" role="separator" tabIndex={0}
            aria-orientation="vertical" aria-label="Resize MAIA panel" aria-valuemin={PANEL_MIN.right}
            aria-valuemax={PANEL_MAX.right} aria-valuenow={Math.round(rightWidth)}
            title="Drag to resize MAIA · double-click to reset"
            onPointerDown={(e) => pointerDown('right', e)} onPointerMove={pointerMove}
            onPointerUp={pointerStop} onPointerCancel={pointerStop}
            onKeyDown={(e) => keyboardResize('right', e)}
            onDoubleClick={() => setRightWidth(geometry.maiaWidth)}
          />
        ) : null}
      </div>
      {props.footer ? <div className="fr-footline">{props.footer}</div> : null}
    </div>
  );
}

export function SoullabMark() {
  return (
    <img
      className="fr-mark"
      src="/logo_flower%202.png"
      width={28}
      height={28}
      alt=""
      aria-hidden="true"
    />
  );
}

function DocIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden="true">
      <path d="M3.5 1.5h6l3 3v10h-9z" />
      <path d="M5.5 7h5M5.5 9.5h5M5.5 12h3" />
    </svg>
  );
}

export function ChevronDown() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
      <path d="M3 4.5l3 3 3-3" />
    </svg>
  );
}
