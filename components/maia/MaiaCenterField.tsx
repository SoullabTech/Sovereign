'use client';

/**
 * MaiaCenterField — The living conversational presence
 *
 * This is not a widget. It is the place where the user feels:
 * received, accompanied, oriented, in contact.
 *
 * Voice state drives the atmospheric effects:
 *   idle       → gentle ambient drift (current behavior)
 *   listening  → particles drift toward center, opacity rises with amplitude
 *   processing → glow shifts toward teal, subtle orbital shimmer
 *   responding → particles pulse outward, warm gold glow intensifies
 *
 * OracleConversation is passed as children — page.tsx retains ownership.
 */

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useVoiceState } from '@/lib/maia/voiceStateContext';
import { isFeatureEnabled } from '@/lib/utils/feature-flags';

/**
 * The base field stays the ORIGINAL warm gradient. A static navy base was tried
 * (Step 2) and reverted at founder direction: it flattened the living field —
 * the atmosphere is meant to shift with who is speaking (listening / processing /
 * responding drive the glow below), and a hard cosmos base dampened that read.
 * The `arrival-field` class remains only to scope typography, never the field.
 */
/** Respect prefers-reduced-motion for accessibility */
function usePrefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false;
}

interface MaiaCenterFieldProps {
  children: React.ReactNode;
}

/** Particle behavior per voice state */
function useParticleConfig(presenceState: string, amplitude: number) {
  return useMemo(() => {
    const baseOpacity = 0.2 + amplitude * 0.3;

    switch (presenceState) {
      case 'listening':
        return {
          // Drift toward center — convergence
          yRange: [-15, 15] as [number, number],
          xDrift: 0,
          opacity: [baseOpacity, baseOpacity + 0.2, baseOpacity] as [number, number, number],
          scale: [1, 1.2, 1] as [number, number, number],
          duration: 2.5,
          glowColor: 'from-[#D4B896]/35',
        };
      case 'processing':
        return {
          // Subtle orbital — thinking
          yRange: [-10, 10] as [number, number],
          xDrift: 5,
          opacity: [0.15, 0.3, 0.15] as [number, number, number],
          scale: [1, 1.1, 1] as [number, number, number],
          duration: 3,
          glowColor: 'from-[#2dd4bf]/25', // teal shift
        };
      case 'responding':
        return {
          // Pulse outward — speaking
          yRange: [-40, 0] as [number, number],
          xDrift: 0,
          opacity: [baseOpacity, baseOpacity + 0.3, baseOpacity] as [number, number, number],
          scale: [1, 1.5 + amplitude * 0.5, 1] as [number, number, number],
          duration: 2 + amplitude,
          glowColor: 'from-[#f59e0b]/30', // warm gold
        };
      default: // idle
        return {
          yRange: [-30, 0] as [number, number],
          xDrift: 0,
          opacity: [0.2, 0.5, 0.2] as [number, number, number],
          scale: [1, 1.5, 1] as [number, number, number],
          duration: 3.5,
          glowColor: 'from-[#3d2817]/30',
        };
    }
  }, [presenceState, amplitude]);
}

export function MaiaCenterField({ children }: MaiaCenterFieldProps) {
  const { presenceState, amplitude } = useVoiceState();
  const particleConfig = useParticleConfig(presenceState, amplitude);
  const reducedMotion = usePrefersReducedMotion();
  const [arrivalField, setArrivalField] = useState(false);
  useEffect(() => setArrivalField(isFeatureEnabled('arrivalField')), []);

  return (
    <div
      className={`h-full relative overflow-hidden flex flex-col bg-gradient-to-br from-stone-950 via-stone-900 to-stone-950 ${
        arrivalField ? 'arrival-field' : ''
      }`}
    >
      {/* Atmospheric Particles — voice-reactive (disabled for reduced motion) */}
      {!reducedMotion && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          {[...Array(30)].map((_, i) => {
            const seededX = (i * 17.3) % 100;
            const seededY = (i * 23.7) % 100;
            const seededDuration = particleConfig.duration + ((i * 7.1) % 2);
            const seededDelay = (i * 11.3) % 2;

            return (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-[#D4B896]/20 rounded-full"
                style={{ left: `${seededX}%`, top: `${seededY}%` }}
                animate={{
                  y: [particleConfig.yRange[0], particleConfig.yRange[1], particleConfig.yRange[0]],
                  x: particleConfig.xDrift ? [0, particleConfig.xDrift, -particleConfig.xDrift, 0] : undefined,
                  opacity: particleConfig.opacity,
                  scale: particleConfig.scale,
                }}
                transition={{
                  duration: seededDuration,
                  repeat: Infinity,
                  delay: seededDelay,
                }}
              />
            );
          })}
        </div>
      )}

      {/* Atmospheric Glow — static in reduced motion mode */}
      <div className={`absolute bottom-0 left-0 right-0 h-96 bg-gradient-to-t ${reducedMotion ? 'from-[#3d2817]/30' : particleConfig.glowColor} via-transparent to-transparent pointer-events-none z-0 ${reducedMotion ? '' : 'transition-colors duration-1000'}`} />

      {/* Center field content (OracleConversation as children) */}
      <div className="flex-1 relative z-10 overflow-hidden">
        {children}
      </div>

      {/* SOULLAB Logo - Bottom Center */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.8 }}
        className="absolute bottom-2 left-0 right-0 flex justify-center z-50 pointer-events-none"
      >
        <div className="flex items-center gap-3 px-4 py-2 bg-black/40 backdrop-blur-md border border-amber-500/20 rounded-full pointer-events-auto">
          <img src="/logo_flower 2.png" alt="Holoflower" className="w-6 h-6 opacity-100" />
          <h1 className="text-lg font-light text-amber-300/90 tracking-wider">SOULLAB</h1>
        </div>
      </motion.div>
    </div>
  );
}
