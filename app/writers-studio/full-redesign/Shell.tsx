import type { ReactNode } from 'react';
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
};

export function Shell(props: ShellProps) {
  const { mode, appearance, geometry } = props;
  const oneRoom = props.manuscript === undefined && props.maia === undefined;
  const style = { ...appearanceVars(appearance), ...geometryVars(geometry) } as React.CSSProperties;

  return (
    <div
      className="fr-shell"
      data-appearance={appearance}
      data-mode={mode}
      data-work-panel={geometry.workPanel ? 'framed' : 'ground'}
      style={style}
    >
      <header className="fr-bar" data-region="topbar">
        <div className="fr-brand">
          <SoullabMark />
          <span>Soullab</span>
        </div>
        <nav className="fr-nav" aria-label="Studio">
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
        <div className="fr-avatar" aria-hidden="true">
          {props.memberInitial}
        </div>
        <div className="fr-more" aria-hidden="true">
          •••
        </div>
      </header>

      <div className={oneRoom ? 'fr-room fr-room-single' : 'fr-room'}>
        {oneRoom ? null : (
          <aside className="fr-region fr-panel fr-manuscript" data-region="manuscript" aria-label="Manuscript">
            {props.manuscript}
          </aside>
        )}
        <main className="fr-region fr-work" data-region="work" aria-label="The Work">
          {props.work}
        </main>
        {oneRoom ? null : (
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
