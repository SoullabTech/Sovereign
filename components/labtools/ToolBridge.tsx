'use client';

/**
 * ToolBridge — Cross-domain doorway between tools.
 *
 * A faint observational line that fades in after a delay,
 * linking one tool's completion to another's entry.
 * Not a recommendation. Not a call to action. Just a path.
 *
 * Canonical pattern:
 *   Completion -> 2s pause -> faint observational doorway -> optional link
 *
 * Usage:
 *   <ToolBridge
 *     text="You may notice something more clearly now."
 *     href="/labtools/parts-check-in"
 *   />
 */

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface ToolBridgeProps {
  /** Where the doorway leads */
  href: string;
  /** The observational line — not advice, not coaching, just a doorway */
  text: string;
  /** Delay before appearing (milliseconds). Default: 2000 */
  delayMs?: number;
  /** Optional extra classes */
  className?: string;
}

export function ToolBridge({
  href,
  text,
  delayMs = 2000,
  className = '',
}: ToolBridgeProps) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const t = window.setTimeout(() => setReady(true), delayMs);
    return () => window.clearTimeout(t);
  }, [delayMs]);

  if (!ready) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.5 }}
      className={className}
    >
      <Link
        href={href}
        className="text-[11px] text-white/15 hover:text-white/30 transition-colors"
      >
        {text}
      </Link>
    </motion.div>
  );
}
