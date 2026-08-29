/**
 * WS2-02B — typography as a named role, never as a size.
 *
 * Components ask for `role="prose"`, not for 19px. That is the whole point:
 * TYPE in studioTheme.ts carries DERIVED sizes that the first real composition
 * is expected to correct, and a correction is only cheap if it lands in one
 * place. A component that hard-codes a size has quietly forked the system and
 * will survive the correction unchanged.
 */
'use client';

import { createElement, type CSSProperties, type ElementType, type ReactNode } from 'react';
import { INK, TYPE } from '../studioTheme';

export type TypeRoleName = keyof typeof TYPE;

export function typeStyle(role: TypeRoleName): CSSProperties {
  const t = TYPE[role];
  return {
    fontFamily: t.family,
    fontSize: `${t.size}rem`,
    lineHeight: t.lineHeight,
    fontWeight: t.weight,
    ...(t.tracking ? { letterSpacing: `${t.tracking}em` } : {}),
    ...(t.uppercase ? { textTransform: 'uppercase' as const } : {}),
  };
}

export interface StudioTextProps {
  role: TypeRoleName;
  as?: ElementType;
  /** A token from INK. Defaults per role rather than per call site. */
  tone?: keyof typeof INK;
  style?: CSSProperties;
  children?: ReactNode;
}

const DEFAULT_TONE: Partial<Record<TypeRoleName, keyof typeof INK>> = {
  prose: 'primary',
  chapterTitle: 'primary',
  chapterSubtitle: 'primary',
  workIdentity: 'primary',
  bandLabel: 'muted',
  panelLabel: 'muted',
  metadata: 'muted',
  quiet: 'quiet',
  navItem: 'secondary',
  maiaReading: 'secondary',
};

export function StudioText({ role, as, tone, style, children }: StudioTextProps) {
  const inkKey = tone ?? DEFAULT_TONE[role] ?? 'secondary';
  // createElement rather than <Tag>: a dynamic ElementType collapses its props
  // to `never` under the union, and the tag here is genuinely per-call-site.
  return createElement(
    as ?? 'div',
    { style: { ...typeStyle(role), color: INK[inkKey], margin: 0, ...style } },
    children,
  );
}
