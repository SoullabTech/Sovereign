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
  /**
   * `data-*` attributes, forwarded.
   *
   * They were silently DROPPED. Every hook a surface attached to a StudioText -
   * `data-no-structure`, `data-coverage`, `data-review-delta`,
   * `data-review-unrenderable` - was absent from the DOM, and the browser found
   * it: a check for "the none screen names itself" failed against a screen that
   * was rendering correctly and had simply lost its handle.
   *
   * The dangerous half is the inverse. An assertion written as "this attribute
   * is NOT present" would have passed for a surface that had never been able to
   * emit it - a green check standing on a prop that goes nowhere. Anything
   * type-checked and unrendered is exactly the kind of lie this programme keeps
   * finding, so it is closed at the component rather than worked around at the
   * call sites.
   *
   * Deliberately `data-` only. Forwarding arbitrary props would let a call site
   * set className, onClick or role and quietly leave the type system.
   */
  [dataAttribute: `data-${string}`]: unknown;
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

export function StudioText({ role, as, tone, style, children, ...rest }: StudioTextProps) {
  const inkKey = tone ?? DEFAULT_TONE[role] ?? 'secondary';
  const data = Object.fromEntries(
    Object.entries(rest).filter(([k]) => k.startsWith('data-')));
  // createElement rather than <Tag>: a dynamic ElementType collapses its props
  // to `never` under the union, and the tag here is genuinely per-call-site.
  return createElement(
    as ?? 'div',
    { ...data, style: { ...typeStyle(role), color: INK[inkKey], margin: 0, ...style } },
    children,
  );
}
