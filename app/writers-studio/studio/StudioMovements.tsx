'use client';

/**
 * WS-CONVERGENCE-01 · C4 — Work · Review · Ask MAIA.
 *
 * ⛔ Renders only what `workingMovements()` returned, and that function returns
 * only reachable movements. ⭐ So an unreachable movement is ABSENT rather than
 * disabled: there is no control to imply a readiness the system lacks.
 */

import { INK, SPACE } from '../studioTheme';
import { StudioText } from './StudioType';
import type { StudioMovement, StudioMovementId } from '../studioMap';

export function StudioMovements({
  movements, current, onSelect,
}: {
  movements: readonly StudioMovement[];
  current: StudioMovementId;
  onSelect: (id: StudioMovementId) => void;
}) {
  return (
    <nav data-studio-movements aria-label="Work" style={{ display: 'flex', gap: SPACE.snug }}>
      {movements.map((m) => (
        <button
          key={m.id}
          type="button"
          data-movement={m.id}
          aria-current={current === m.id ? 'page' : undefined}
          title={m.note}
          onClick={() => onSelect(m.id)}
          style={{ background: 'transparent', border: 'none', cursor: 'pointer',
                   color: current === m.id ? INK.primary : INK.secondary, padding: 0 }}
        >
          <StudioText role="metadata">{m.label}</StudioText>
        </button>
      ))}
    </nav>
  );
}
