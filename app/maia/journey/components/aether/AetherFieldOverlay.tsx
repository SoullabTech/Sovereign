/**
 * AetherFieldOverlay - Aether Layer Component
 *
 * ✨ Aurora-like coherence shimmer overlay.
 * Always present, varies by overall system coherence.
 * Positioned as full-page background layer behind all content.
 *
 * Phase: 4.4-C (Five-Element Integration)
 * Status: Phase 1 Placeholder (CSS gradient, WebGL in Phase 3)
 * Created: December 23, 2024
 */

'use client';

import { motion } from 'framer-motion';

export interface AetherFieldProps {
  coherence: number; // 0-1 overall coherence score
  animated?: boolean;
}

export function AetherFieldOverlay({ coherence, animated = true }: AetherFieldProps) {
  // Phase 1: CSS gradient animation
  // Phase 3: Replace with WebGL shader or canvas animation

  const opacity = 0.15 + coherence * 0.25; // 0.15-0.40 range
  const hue = 260 + coherence * 20; // Purple (260) to blue-purple (280)

  return (
    <motion.div
      className="fixed inset-0 pointer-events-none z-0"
      animate={{
        opacity: animated ? [opacity * 0.8, opacity * 1.2, opacity * 0.8] : opacity,
      }}
      transition={{
        duration: 8,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
      style={{
        background: `
          radial-gradient(
            ellipse at 30% 20%,
            hsl(${hue}, 70%, 85%) 0%,
            transparent 40%
          ),
          radial-gradient(
            ellipse at 70% 60%,
            hsl(${hue + 10}, 60%, 80%) 0%,
            transparent 45%
          ),
          radial-gradient(
            ellipse at 50% 80%,
            hsl(${hue - 10}, 65%, 82%) 0%,
            transparent 50%
          )
        `,
      }}
    >
      {/* Shimmer animation layer */}
      {animated && (
        <motion.div
          className="absolute inset-0"
          animate={{
            background: [
              `radial-gradient(circle at 20% 30%, rgba(198, 160, 232, 0.2) 0%, transparent 40%)`,
              `radial-gradient(circle at 80% 70%, rgba(198, 160, 232, 0.2) 0%, transparent 40%)`,
              `radial-gradient(circle at 50% 50%, rgba(198, 160, 232, 0.2) 0%, transparent 40%)`,
              `radial-gradient(circle at 20% 30%, rgba(198, 160, 232, 0.2) 0%, transparent 40%)`,
            ],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      )}

      {/* Phase 1 indicator (remove in production) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute bottom-4 right-4 text-xs text-purple-400/50 italic
                        bg-white/50 px-2 py-1 rounded">
          Aether Field • Phase 1: CSS • WebGL in Phase 3
        </div>
      )}
    </motion.div>
  );
}
