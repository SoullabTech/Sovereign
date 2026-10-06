'use client';

import { useCallback, useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react';
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
  /** Optional line beneath the regions (#23 carries one). */
  footer?: ReactNode;
  /** Optional words set above the MAIA region (#23). */
  maiaAbove?: ReactNode;
  /**
   * R8B — serious MAIA conversation may become a resizable workspace instead
   * of being trapped in the fixed utility rail. This changes presentation only;
   * the manuscript/Work/MAIA identities and their authority are untouched.
   */
  maiaResizable?: boolean;
  /** Initial share of the Work+MAIA conversation area given to MAIA. */
  maiaDefaultShare?: number;
  /**
   * PC3-S3 Full Canvas. A presentation state of the SAME room: the product bar
   * and the manuscript context recede; the Work region — and whatever editor it
   * holds — stays exactly where it is in the tree, so nothing inside it remounts.
   * Omitted by every S1/S2 state, whose output is unchanged.
   */
  canvas?: boolean;
};

export function Shell(props: ShellProps) {
  const { mode, appearance, geometry } = props;
  const searchParams = useSearchParams();
  const fromCabin = isCabinOrigin(searchParams);
  const oneRoom = props.manuscript === undefined && props.maia === undefined;
  const canvas = props.canvas === true;
  const style = { ...appearanceVars(appearance), ...geometryVars(geometry) } as React.CSSProperties;
  const resizableMaia = props.maiaResizable === true && props.maia !== undefined && !canvas;
  const clampMaiaShare = useCallback((value: number) => Math.min(62, Math.max(28, value)), []);
  const [maiaShare, setMaiaShare] = useState(() => clampMaiaShare(props.maiaDefaultShare ?? 44));
  const roomRef = useRef<HTMLDivElement | null>(null);
  const maiaDrag = useRef<{ startX: number; startShare: number; width: number } | null>(null);

  useEffect(() => {
    if (!resizableMaia || typeof window === 'undefined') return;
    const key = `writers-studio:${mode}:maia-share`;
    const raw = window.sessionStorage.getItem(key);
    if (raw !== null) {
      const parsed = Number(raw);
      if (Number.isFinite(parsed)) setMaiaShare(clampMaiaShare(parsed));
    }
  }, [mode, resizableMaia, clampMaiaShare]);

  useEffect(() => {
    if (!resizableMaia || typeof window === 'undefined') return;
    try {
      window.sessionStorage.setItem(`writers-studio:${mode}:maia-share`, String(maiaShare));
    } catch {
      // Presentation preference failure must never block the writing room.
    }
  }, [mode, resizableMaia, maiaShare]);

  const beginMaiaResize = useCallback((event: ReactPointerEvent<HTMLButtonElement>) => {
    if (!roomRef.current) return;
    maiaDrag.current = {
      startX: event.clientX,
      startShare: maiaShare,
      width: roomRef.current.getBoundingClientRect().width,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  }, [maiaShare]);

  const moveMaiaResize = useCallback((event: ReactPointerEvent<HTMLButtonElement>) => {
    if (!maiaDrag.current) return;
    const delta = event.clientX - maiaDrag.current.startX;
    const next = maiaDrag.current.startShare - (delta / maiaDrag.current.width) * 100;
    setMaiaShare(clampMaiaShare(next));
  }, [clampMaiaShare]);

  const endMaiaResize = useCallback((event: ReactPointerEvent<HTMLButtonElement>) => {
    maiaDrag.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }, []);

  const keyMaiaResize = useCallback((event: ReactKeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      setMaiaShare((value) => clampMaiaShare(value + 3));
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      setMaiaShare((value) => clampMaiaShare(value - 3));
    } else if (event.key === 'Home') {
      event.preventDefault();
      setMaiaShare(62);
    } else if (event.key === 'End') {
      event.preventDefault();
      setMaiaShare(28);
    }
  }, [clampMaiaShare]);

  const roomStyle = resizableMaia ? {
    '--fr-live-work-fr': `${100 - maiaShare}fr`,
    '--fr-live-maia-fr': `${maiaShare}fr`,
  } as React.CSSProperties : undefined;

  return (
    <div
      className="fr-shell"
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
          {props.workTitle !== undefined ? (
            <div className="fr-workpick" aria-label="Current Work">
              <DocIcon />
              <span>{props.workTitle}</span>
              <ChevronDown />
            </div>
          ) : (
            <span className="fr-bar-spacer" aria-hidden="true" />
          )}
          <div className="fr-topbar-accessories" data-studio-topbar-accessories aria-label="Studio controls" />
          <div className="fr-avatar" aria-hidden="true">
            {props.memberInitial}
          </div>
          <div className="fr-more" aria-hidden="true">
            •••
          </div>
        </header>
      )}

      <div
        ref={roomRef}
        className={oneRoom
          ? 'fr-room fr-room-single'
          : props.maia === undefined
            ? 'fr-room fr-room-no-maia'
            : 'fr-room'}
        data-resizable-maia={resizableMaia ? 'true' : undefined}
        style={roomStyle}
      >
        {oneRoom || canvas ? null : (
          <aside className="fr-region fr-panel fr-manuscript" data-region="manuscript" aria-label="Manuscript">
            {props.manuscript}
          </aside>
        )}
        <main className="fr-region fr-work" data-region="work" aria-label="The Work">
          {props.work}
        </main>
        {resizableMaia ? (
          <button
            type="button"
            className="fr-maia-divider"
            role="separator"
            aria-label="Resize Work and MAIA conversation"
            aria-valuemin={28}
            aria-valuemax={62}
            aria-valuenow={Math.round(maiaShare)}
            onPointerDown={beginMaiaResize}
            onPointerMove={moveMaiaResize}
            onPointerUp={endMaiaResize}
            onPointerCancel={endMaiaResize}
            onDoubleClick={() => setMaiaShare(clampMaiaShare(props.maiaDefaultShare ?? 44))}
            onKeyDown={keyMaiaResize}
            title="Drag to resize · double-click to balance"
          >
            <span aria-hidden="true" />
          </button>
        ) : null}
        {oneRoom || props.maia === undefined ? null : (
          <aside className="fr-region fr-panel fr-maia" data-region="maia" aria-label="MAIA">
            {props.maiaAbove ? <div className="fr-maia-above">{props.maiaAbove}</div> : null}
            {props.maia}
          </aside>
        )}
      </div>
      {props.footer ? <div className="fr-footline">{props.footer}</div> : null}
    </div>
  );
}

export function SoullabMark() {
  return (
    <svg className="fr-mark" viewBox="0 0 26 26" fill="none" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" aria-hidden="true">
      <circle cx="13" cy="13" r="2.6" />
      <path d="M13 3.2c1.6 2 1.6 4.2 0 6.2-1.6-2-1.6-4.2 0-6.2zM13 16.6c1.6 2 1.6 4.2 0 6.2-1.6-2-1.6-4.2 0-6.2zM3.2 13c2-1.6 4.2-1.6 6.2 0-2 1.6-4.2 1.6-6.2 0zM16.6 13c2-1.6 4.2-1.6 6.2 0-2 1.6-4.2 1.6-6.2 0zM6.1 6.1c2.5.3 4 1.8 4.3 4.3-2.5-.3-4-1.8-4.3-4.3zM15.6 15.6c2.5.3 4 1.8 4.3 4.3-2.5-.3-4-1.8-4.3-4.3zM19.9 6.1c-.3 2.5-1.8 4-4.3 4.3.3-2.5 1.8-4 4.3-4.3zM10.4 15.6c-.3 2.5-1.8 4-4.3 4.3.3-2.5 1.8-4 4.3-4.3z" />
    </svg>
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
