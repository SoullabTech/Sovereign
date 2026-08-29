/**
 * WS2-02B — the ground ramp, as a component.
 *
 * Depth in this room is carried by the ramp rather than by borders (see
 * GROUND in studioTheme.ts), so a surface names its level and lets the ramp
 * decide the colour. Nothing here accepts a raw hex.
 */
'use client';

import type { CSSProperties, ReactNode } from 'react';
import { GROUND, RADIUS, RULE } from '../studioTheme';

export type SurfaceLevel = 'deepest' | 'base' | 'field' | 'raised' | 'active';

export interface StudioSurfaceProps {
  level: SurfaceLevel;
  /** A hairline in the rule family. Emphasis is reserved for selection. */
  edge?: 'none' | 'soft' | 'default' | 'emphasis';
  radius?: keyof typeof RADIUS | 'none';
  style?: CSSProperties;
  children?: ReactNode;
}

const EDGE = {
  none: undefined,
  soft: RULE.soft,
  default: RULE.DEFAULT,
  emphasis: RULE.emphasis,
} as const;

export function StudioSurface({
  level,
  edge = 'none',
  radius = 'none',
  style,
  children,
}: StudioSurfaceProps) {
  const border = EDGE[edge];
  return (
    <div
      style={{
        background: GROUND[level],
        ...(border ? { border: `1px solid ${border}` } : {}),
        ...(radius !== 'none' ? { borderRadius: RADIUS[radius] } : {}),
        ...style,
      }}
    >
      {children}
    </div>
  );
}
