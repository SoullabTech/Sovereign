'use client';

import { MotionConfig } from 'framer-motion';
import type { ReactNode } from 'react';

/**
 * App-wide reduced-motion backstop for framer-motion (DESIGN.md §Motion).
 * With reducedMotion="user", transform/layout animations are skipped when the
 * member's OS asks for reduced motion. Opacity-only loops are NOT covered and
 * must still gate themselves on prefers-reduced-motion.
 */
export function ReducedMotionProvider({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
