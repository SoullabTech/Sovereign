/**
 * WS2-02B — a contextual surface with a dismiss control.
 *
 * The panel contract lives in PANELS (studioTheme.ts) and this component reads
 * it rather than restating it: pass a role, and whether the panel may be
 * dismissed is a fact about the design contract, not a prop a call site can
 * decide. That is what keeps §2's rule — a contextual panel may not become
 * permanent furniture — from being lost one convenient render at a time.
 *
 * A panel is chrome around content. It does not decide what the content means,
 * and it confers no ownership on what it holds: per D-019 a region is
 * presentation, and the object model is settled elsewhere.
 */
'use client';

import type { CSSProperties, ReactNode } from 'react';
import { GROUND, PANELS, RADIUS, RULE, SPACE, type PanelRole } from '../studioTheme';
import { StudioText } from './StudioType';

export interface StudioPanelProps {
  role: PanelRole;
  /** Uppercase band label, as both references set it. */
  label?: string;
  /** Shown beside the label — a count, never a score. */
  count?: number;
  /**
   * Supplied only when the surrounding composition can actually dismiss the
   * panel. Absent means no control is drawn — never a control that does
   * nothing.
   */
  onDismiss?: () => void;
  style?: CSSProperties;
  children?: ReactNode;
}

/** Whether this role may be dismissed at all. Read from the contract. */
export function isDismissible(role: PanelRole): boolean {
  return PANELS.find((p) => p.role === role)?.dismissible ?? false;
}

export function StudioPanel({
  role,
  label,
  count,
  onDismiss,
  style,
  children,
}: StudioPanelProps) {
  const canDismiss = isDismissible(role) && Boolean(onDismiss);

  return (
    <section
      data-panel-role={role}
      style={{
        background: GROUND.raised,
        /* WS2-03B correction 2. The ramp separates this panel from the page
           ground; a visible outline on top of that made every panel compete
           with the writing field, which keeps the row's only real border. */
        border: `1px solid ${RULE.quiet}`,
        borderRadius: RADIUS.panel,
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
        ...style,
      }}
    >
      {label && (
        <header
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: SPACE.snug,
            padding: `${SPACE.base}px ${SPACE.comfortable}px`,
            borderBottom: `1px solid ${RULE.soft}`,
          }}
        >
          <StudioText role="panelLabel">{label}</StudioText>
          {typeof count === 'number' && (
            <StudioText role="metadata" as="span">
              {count}
            </StudioText>
          )}
          <span style={{ flex: 1 }} />
          {canDismiss && (
            <button
              type="button"
              onClick={onDismiss}
              aria-label={`Dismiss ${label ?? role}`}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                lineHeight: 1,
              }}
            >
              <StudioText role="metadata" as="span">
                ✕
              </StudioText>
            </button>
          )}
        </header>
      )}
      <div style={{ padding: SPACE.comfortable, overflow: 'auto', minHeight: 0 }}>{children}</div>
    </section>
  );
}
