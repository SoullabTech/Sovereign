'use client';

/**
 * DepthBoundary — A perceptual horizon.
 *
 * Not a paywall. Not a CTA. The edge of what's currently visible.
 * v1: purely atmospheric. No buttons, no gating logic.
 * The action layer comes in Phase 2 after observing what's alive.
 */

interface DepthBoundaryProps {
  message: string;
}

export function DepthBoundary({ message }: DepthBoundaryProps) {
  return (
    <div className="mt-16 pt-8 border-t border-white/5 text-center pb-12">
      <p className="text-amber-200/25 text-sm italic">
        {message}
      </p>
    </div>
  );
}
