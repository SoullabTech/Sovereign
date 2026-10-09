'use client';

import { useCallback, useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
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
   * The manuscript rail may be widened, narrowed, or collapsed without
   * remounting the Work. Presentation only; manuscript authority is unchanged.
   */
  manuscriptResizable?: boolean;
  /** Initial open width of the manuscript rail in pixels. */
  manuscriptDefaultWidth?: number;
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
  const currentPathname = usePathname();
  const listeningRoute = currentPathname === '/writers-studio' && searchParams?.get('mode') === 'listen';
  const listenHref = currentPathname === '/writers-studio' && searchParams?.get('m')
    ? '/writers-studio?' + (() => { const next = new URLSearchParams(searchParams.toString()); next.set('mode', 'listen'); return next.toString(); })()
    : null;
  const fromCabin = isCabinOrigin(searchParams);
  const oneRoom = props.manuscript === undefined && props.maia === undefined;
  const canvas = props.canvas === true;
  const style = { ...appearanceVars(appearance), ...geometryVars(geometry) } as React.CSSProperties;
  const resizableMaia = props.maiaResizable === true && props.maia !== undefined && !canvas;
  const resizableManuscript = props.manuscriptResizable === true && props.manuscript !== undefined && !canvas;
  const clampMaiaShare = useCallback((value: number) => Math.min(62, Math.max(28, value)), []);
  const clampManuscriptWidth = useCallback((value: number) => Math.min(480, Math.max(180, value)), []);
  const [maiaShare, setMaiaShare] = useState(() => clampMaiaShare(props.maiaDefaultShare ?? 44));
  const [maiaSizingHydrated, setMaiaSizingHydrated] = useState(false);
  const [maiaCollapsed, setMaiaCollapsed] = useState(false);
  const lastOpenMaiaShare = useRef(maiaShare);
  const [manuscriptWidth, setManuscriptWidth] = useState(() =>
    clampManuscriptWidth(props.manuscriptDefaultWidth ?? geometry.manuscriptWidth ?? 300));
  const [manuscriptCollapsed, setManuscriptCollapsed] = useState(false);
  const [manuscriptSizingHydrated, setManuscriptSizingHydrated] = useState(false);
  const lastOpenManuscriptWidth = useRef(manuscriptWidth);
  const roomRef = useRef<HTMLDivElement | null>(null);
  const maiaDrag = useRef<{ startX: number; startShare: number; width: number } | null>(null);
  const manuscriptDrag = useRef<{ startX: number; startWidth: number; moved: boolean } | null>(null);

  useEffect(() => {
    if (!resizableMaia || typeof window === 'undefined') {
      setMaiaSizingHydrated(false);
      return;
    }
    const key = `writers-studio:${mode}:maia-share`;
    try {
      const raw = window.sessionStorage.getItem(key);
      if (raw !== null) {
        const parsed = Number(raw);
        if (Number.isFinite(parsed)) {
          const share = clampMaiaShare(parsed); setMaiaShare(share); lastOpenMaiaShare.current = share;
        }
      }
      setMaiaCollapsed(window.sessionStorage.getItem(`writers-studio:${mode}:maia-collapsed`) === '1');
    } catch { /* Storage restrictions must not prevent writing. */ }
    setMaiaSizingHydrated(true);
  }, [mode, resizableMaia, clampMaiaShare]);

  useEffect(() => {
    if (!resizableMaia || !maiaSizingHydrated || typeof window === 'undefined') return;
    try {
      window.sessionStorage.setItem(`writers-studio:${mode}:maia-share`, String(maiaShare));
      window.sessionStorage.setItem(`writers-studio:${mode}:maia-collapsed`, maiaCollapsed ? '1' : '0');
    } catch {
      // Presentation preference failure must never block the writing room.
    }
  }, [mode, resizableMaia, maiaSizingHydrated, maiaShare, maiaCollapsed]);

  useEffect(() => {
    if (!resizableManuscript || typeof window === 'undefined') {
      setManuscriptSizingHydrated(false);
      return;
    }
    const widthKey = `writers-studio:${mode}:manuscript-width`;
    const collapsedKey = `writers-studio:${mode}:manuscript-collapsed`;
    try {
    const rawWidth = window.sessionStorage.getItem(widthKey);
    if (rawWidth !== null) {
      const parsed = Number(rawWidth);
      if (Number.isFinite(parsed)) {
        const next = clampManuscriptWidth(parsed);
        setManuscriptWidth(next);
        lastOpenManuscriptWidth.current = next;
      }
    }
    setManuscriptCollapsed(window.sessionStorage.getItem(collapsedKey) === '1');
    } catch { /* Storage restrictions must not prevent writing. */ }
    setManuscriptSizingHydrated(true);
  }, [mode, resizableManuscript, clampManuscriptWidth]);

  useEffect(() => {
    if (!resizableManuscript || !manuscriptSizingHydrated || typeof window === 'undefined') return;
    try {
      window.sessionStorage.setItem(`writers-studio:${mode}:manuscript-width`, String(manuscriptWidth));
      window.sessionStorage.setItem(`writers-studio:${mode}:manuscript-collapsed`, manuscriptCollapsed ? '1' : '0');
    } catch {
      // Presentation preference failure must never block the writing room.
    }
  }, [mode, resizableManuscript, manuscriptSizingHydrated, manuscriptWidth, manuscriptCollapsed]);

  const toggleMaia = useCallback(() => {
    if (maiaCollapsed) setMaiaShare(clampMaiaShare(lastOpenMaiaShare.current));
    else lastOpenMaiaShare.current = maiaShare;
    setMaiaCollapsed(value => !value);
  }, [maiaCollapsed, maiaShare, clampMaiaShare]);

  const beginMaiaResize = useCallback((event: ReactPointerEvent<HTMLButtonElement>) => {
    if (!roomRef.current) return;
    maiaDrag.current = {
      startX: event.clientX,
      startShare: maiaShare,
      // Shares apply to Work + MAIA, not to the manuscript rail beside them.
      width: Array.from(roomRef.current.querySelectorAll<HTMLElement>(':scope > .fr-work, :scope > .fr-maia')).reduce((width, panel) => width + panel.getBoundingClientRect().width, 0),
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  }, [maiaShare]);

  const moveMaiaResize = useCallback((event: ReactPointerEvent<HTMLButtonElement>) => {
    if (!maiaDrag.current) return;
    const delta = event.clientX - maiaDrag.current.startX;
    const next = maiaDrag.current.startShare - (delta / maiaDrag.current.width) * 100;
    setMaiaCollapsed(false);
    setMaiaShare(clampMaiaShare(next));
  }, [clampMaiaShare]);

  const endMaiaResize = useCallback((event: ReactPointerEvent<HTMLButtonElement>) => {
    maiaDrag.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }, []);

  const keyMaiaResize = useCallback((event: ReactKeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault(); toggleMaia();
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      setMaiaCollapsed(false);
      setMaiaShare((value) => clampMaiaShare(value + 3));
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      setMaiaCollapsed(false);
      setMaiaShare((value) => clampMaiaShare(value - 3));
    } else if (event.key === 'Home') {
      event.preventDefault();
      setMaiaCollapsed(false);
      setMaiaShare(62);
    } else if (event.key === 'End') {
      event.preventDefault();
      setMaiaCollapsed(false);
      setMaiaShare(28);
    }
  }, [clampMaiaShare, toggleMaia]);

  const toggleManuscript = useCallback(() => {
    setManuscriptCollapsed((collapsed) => {
      if (collapsed) {
        setManuscriptWidth(clampManuscriptWidth(lastOpenManuscriptWidth.current));
        return false;
      }
      lastOpenManuscriptWidth.current = manuscriptWidth;
      return true;
    });
  }, [clampManuscriptWidth, manuscriptWidth]);

  const beginManuscriptResize = useCallback((event: ReactPointerEvent<HTMLButtonElement>) => {
    manuscriptDrag.current = {
      startX: event.clientX,
      startWidth: manuscriptCollapsed ? 0 : manuscriptWidth,
      moved: false,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  }, [manuscriptCollapsed, manuscriptWidth]);

  const moveManuscriptResize = useCallback((event: ReactPointerEvent<HTMLButtonElement>) => {
    const drag = manuscriptDrag.current;
    if (!drag) return;
    const delta = event.clientX - drag.startX;
    if (Math.abs(delta) > 3) drag.moved = true;
    if (!drag.moved) return;
    const raw = drag.startWidth + delta;
    if (raw < 90) {
      setManuscriptCollapsed(true);
      return;
    }
    const next = clampManuscriptWidth(raw);
    lastOpenManuscriptWidth.current = next;
    setManuscriptWidth(next);
    setManuscriptCollapsed(false);
  }, [clampManuscriptWidth]);

  const endManuscriptResize = useCallback((event: ReactPointerEvent<HTMLButtonElement>) => {
    const drag = manuscriptDrag.current;
    manuscriptDrag.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    if (drag && !drag.moved) toggleManuscript();
  }, [toggleManuscript]);

  const keyManuscriptResize = useCallback((event: ReactKeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      toggleManuscript();
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      if (manuscriptCollapsed) return;
      const next = manuscriptWidth - 24;
      if (next < 180) setManuscriptCollapsed(true);
      else setManuscriptWidth(clampManuscriptWidth(next));
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      const next = clampManuscriptWidth((manuscriptCollapsed ? lastOpenManuscriptWidth.current : manuscriptWidth) + 24);
      lastOpenManuscriptWidth.current = next;
      setManuscriptWidth(next);
      setManuscriptCollapsed(false);
    } else if (event.key === 'Home') {
      event.preventDefault();
      setManuscriptCollapsed(true);
    } else if (event.key === 'End') {
      event.preventDefault();
      lastOpenManuscriptWidth.current = 480;
      setManuscriptWidth(480);
      setManuscriptCollapsed(false);
    }
  }, [clampManuscriptWidth, manuscriptCollapsed, manuscriptWidth, toggleManuscript]);

  const roomStyle = (resizableMaia || resizableManuscript) ? {
    ...(resizableMaia ? {
      '--fr-live-work-fr': `${maiaCollapsed ? 100 : 100 - maiaShare}fr`,
      '--fr-live-maia-fr': maiaCollapsed ? '0px' : `${maiaShare}fr`,
      '--fr-live-maia-min': maiaCollapsed ? '0px' : '300px',
    } : {}),
    ...(resizableManuscript ? {
      '--fr-live-ms-w': manuscriptCollapsed ? '0px' : `${manuscriptWidth}px`,
    } : {}),
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
                aria-current={m.id === mode && !listeningRoute ? 'page' : undefined}
                data-mode={m.id}
                onClick={() => props.onSelectMode?.(m.id)}
              >
                {m.label}
              </button>
            ))}
            {listenHref ? listeningRoute ? <span className="fr-nav-item" data-writers-listen-entry aria-current="page" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', whiteSpace: 'nowrap' }}>Listen</span> : <a className="fr-nav-item" href={listenHref} data-writers-listen-entry style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', whiteSpace: 'nowrap' }}>Listen</a> : null}
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

      {(resizableManuscript || resizableMaia) ? (
        <div className="fr-column-controls" role="group" aria-label="Workspace panels">
          {resizableManuscript ? <button type="button" aria-expanded={!manuscriptCollapsed}
            onClick={toggleManuscript}>{manuscriptCollapsed ? 'Show manuscript' : 'Hide manuscript'}</button> : null}
          {resizableMaia ? <button type="button" aria-expanded={!maiaCollapsed}
            onClick={toggleMaia}>{maiaCollapsed ? 'Show MAIA' : 'Hide MAIA'}</button> : null}
        </div>
      ) : null}

      <div
        ref={roomRef}
        className={oneRoom
          ? 'fr-room fr-room-single'
          : props.maia === undefined
            ? 'fr-room fr-room-no-maia'
            : 'fr-room'}
        data-resizable-maia={resizableMaia ? 'true' : undefined}
        data-resizable-manuscript={resizableManuscript ? 'true' : undefined}
        data-maia-collapsed={resizableMaia && maiaCollapsed ? 'true' : undefined}
        data-manuscript-collapsed={resizableManuscript && manuscriptCollapsed ? 'true' : undefined}
        style={roomStyle}
      >
        {oneRoom || canvas ? null : (
          <aside className="fr-region fr-panel fr-manuscript" data-region="manuscript" aria-label="Manuscript"
            aria-hidden={resizableManuscript && manuscriptCollapsed || undefined}
            inert={resizableManuscript && manuscriptCollapsed || undefined}>
            {props.manuscript}
          </aside>
        )}
        {resizableManuscript ? (
          <button
            type="button"
            className="fr-manuscript-divider"
            role="separator"
            aria-label={manuscriptCollapsed ? 'Expand manuscript rail' : 'Resize or collapse manuscript rail'}
            aria-orientation="vertical"
            aria-valuemin={0}
            aria-valuemax={480}
            aria-valuenow={manuscriptCollapsed ? 0 : Math.round(manuscriptWidth)}
            aria-expanded={!manuscriptCollapsed}
            onPointerDown={beginManuscriptResize}
            onPointerMove={moveManuscriptResize}
            onPointerUp={endManuscriptResize}
            onPointerCancel={(event) => { manuscriptDrag.current = null; if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId); }}
            onKeyDown={keyManuscriptResize}
            title={manuscriptCollapsed
              ? 'Click or press Enter to reopen manuscript'
              : 'Drag to resize · click to hide manuscript'}
          >
            <span aria-hidden="true" />
          </button>
        ) : null}
        <main className="fr-region fr-work" data-region="work" aria-label="The Work">
          {props.work}
        </main>
        {resizableMaia ? (
          <button
            type="button"
            className="fr-maia-divider"
            role="separator"
            aria-label={maiaCollapsed ? "Expand MAIA panel" : "Resize Work and MAIA conversation"}
            aria-orientation="vertical"
            aria-expanded={!maiaCollapsed}
            aria-valuemin={0}
            aria-valuemax={62}
            aria-valuenow={maiaCollapsed ? 0 : Math.round(maiaShare)}
            onPointerDown={beginMaiaResize}
            onPointerMove={moveMaiaResize}
            onPointerUp={endMaiaResize}
            onPointerCancel={endMaiaResize}
            onDoubleClick={() => { setMaiaCollapsed(false); setMaiaShare(clampMaiaShare(props.maiaDefaultShare ?? 44)); }}
            onKeyDown={keyMaiaResize}
            title="Drag to resize · Enter to hide or show · double-click to balance"
          >
            <span aria-hidden="true" />
          </button>
        ) : null}
        {oneRoom || props.maia === undefined ? null : (
          <aside className="fr-region fr-panel fr-maia" data-region="maia" aria-label="MAIA"
            aria-hidden={resizableMaia && maiaCollapsed || undefined}
            inert={resizableMaia && maiaCollapsed || undefined}>
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
