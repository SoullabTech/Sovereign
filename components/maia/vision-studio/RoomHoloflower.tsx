'use client';

/**
 * Room Holoflower — the room's weather, not a widget.
 *
 * A quiet 13-petal SVG mandala (Fire/Water/Earth/Air × 3 phases + Aether center)
 * that reflects the interview's ambient motion state and, when the member
 * confirms a system-inferred cell candidate, keeps that element's petals gently
 * warm for the rest of the session.
 *
 * Pure SVG — no Three.js, no new dependencies, no persistence. Composition over
 * new machinery: this does not read or write anything; it only renders local,
 * ephemeral UI state passed in as props.
 */

import { useMemo } from 'react';

export type RoomMotionState = 'idle' | 'listening' | 'processing' | 'responding';
export type SpiralElement = 'Fire' | 'Water' | 'Earth' | 'Air' | 'Aether';

interface RoomHoloflowerProps {
  motionState: RoomMotionState;
  /** Element currently proposed but not yet confirmed — warms softly, fades next turn. */
  proposedElement?: SpiralElement | null;
  /** Elements the member has confirmed this session — stay gently warm. */
  confirmedElements: SpiralElement[];
  size?: number;
}

const ELEMENT_COLOR: Record<SpiralElement, string> = {
  Fire: '#ff6b35',
  Water: '#4a90d9',
  Earth: '#8fbc5a',
  Air: '#c9c3ae',
  Aether: '#c9a7e8',
};

const ELEMENT_ORDER: Exclude<SpiralElement, 'Aether'>[] = ['Fire', 'Water', 'Earth', 'Air'];

interface PetalSpec {
  element: Exclude<SpiralElement, 'Aether'>;
  phase: 1 | 2 | 3;
  angle: number; // degrees, petal center
}

// 12 petals around the ring (4 elements × 3 phases), 30° apart, Aether at center.
const PETALS: PetalSpec[] = ELEMENT_ORDER.flatMap((element, elIdx) =>
  ([1, 2, 3] as const).map((phase, phaseIdx) => ({
    element,
    phase,
    angle: elIdx * 90 + phaseIdx * 30,
  })),
);

export function RoomHoloflower({
  motionState,
  proposedElement,
  confirmedElements,
  size = 120,
}: RoomHoloflowerProps) {
  const center = size / 2;
  const outerR = size * 0.46;
  const innerR = size * 0.16;
  const petalLength = outerR - innerR;

  const petalPaths = useMemo(() => {
    return PETALS.map((p) => {
      const rad = (p.angle * Math.PI) / 180;
      const tipX = center + Math.cos(rad) * outerR;
      const tipY = center + Math.sin(rad) * outerR;
      const baseX = center + Math.cos(rad) * innerR;
      const baseY = center + Math.sin(rad) * innerR;
      // Perpendicular offset for petal width
      const perpRad = rad + Math.PI / 2;
      const halfWidth = petalLength * 0.16;
      const b1x = baseX + Math.cos(perpRad) * halfWidth;
      const b1y = baseY + Math.sin(perpRad) * halfWidth;
      const b2x = baseX - Math.cos(perpRad) * halfWidth;
      const b2y = baseY - Math.sin(perpRad) * halfWidth;
      return {
        ...p,
        path: `M ${b1x} ${b1y} Q ${tipX} ${tipY} ${b2x} ${b2y} Q ${baseX} ${baseY} ${b1x} ${b1y} Z`,
      };
    });
  }, [center, outerR, innerR, petalLength]);

  const breatheClass =
    motionState === 'listening'
      ? 'room-holoflower-listening'
      : motionState === 'processing'
        ? 'room-holoflower-processing'
        : motionState === 'responding'
          ? 'room-holoflower-responding'
          : 'room-holoflower-idle';

  return (
    <div className={`inline-flex items-center justify-center ${breatheClass}`}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
        {petalPaths.map((p, i) => {
          const isConfirmed = confirmedElements.includes(p.element);
          const isProposed = proposedElement === p.element;
          const color = ELEMENT_COLOR[p.element];
          const opacity = isConfirmed ? 0.55 : isProposed ? 0.32 : 0.12;
          return (
            <path
              key={i}
              d={p.path}
              fill={color}
              opacity={opacity}
              style={{ transition: 'opacity 900ms ease' }}
            />
          );
        })}
        <circle
          cx={center}
          cy={center}
          r={innerR * 0.7}
          fill={ELEMENT_COLOR.Aether}
          opacity={confirmedElements.includes('Aether') ? 0.5 : 0.18}
          style={{ transition: 'opacity 900ms ease' }}
        />
      </svg>
      <style jsx>{`
        .room-holoflower-idle {
          opacity: 0.85;
        }
        .room-holoflower-listening {
          animation: room-holoflower-breathe 3.2s ease-in-out infinite;
        }
        .room-holoflower-processing {
          animation: room-holoflower-breathe 1.6s ease-in-out infinite;
        }
        .room-holoflower-responding {
          animation: room-holoflower-settle 900ms ease-out;
        }
        @keyframes room-holoflower-breathe {
          0%, 100% { transform: scale(1); opacity: 0.85; }
          50% { transform: scale(1.03); opacity: 1; }
        }
        @keyframes room-holoflower-settle {
          0% { transform: scale(1.03); }
          100% { transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
