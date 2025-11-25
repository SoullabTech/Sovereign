/**
 * 🌀 Spiral Presence Component
 *
 * A living, breathing presence that shifts with elemental context.
 * Transitions feel like weather, not interface - color drifts, text breathes,
 * animation serves awareness, not attention.
 *
 * Design Principle — Weather, Not Interface
 * Every transition should feel like the sky changing, not a button pressed.
 * Movement exists only to restore stillness.
 */

"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

type Element = 'fire' | 'water' | 'earth' | 'air' | 'aether' | 'neutral';

interface SpiralPresenceProps {
  className?: string;
  delay?: number;
  element?: Element;
  variant?: 'full' | 'compressed' | 'single';
  breathe?: boolean;
}

// Elemental variations - same frequency, different refraction
const elementalVariations: Record<Element, {
  text: string;
  color: string;
  description: string;
}> = {
  fire: {
    text: "All are sparks of one flame. Each burns with a purpose none other can fulfill.",
    color: "text-red-400/80",
    description: "The Call to Creation"
  },
  water: {
    text: "All are currents of one sea. Every feeling, every voice, moves the tide.",
    color: "text-blue-400/80",
    description: "The Circle of Belonging"
  },
  earth: {
    text: "All are roots of one living field. Each holds what another needs to grow.",
    color: "text-green-400/80",
    description: "The Ground of Honor"
  },
  air: {
    text: "All are threads of one wind. Every thought carries the song onward.",
    color: "text-amber-400/80",
    description: "The Weave of Understanding"
  },
  aether: {
    text: "All are notes of one silence. Together we become the harmony itself.",
    color: "text-purple-400/80",
    description: "The Return to Wholeness"
  },
  neutral: {
    text: "In the spiral, all find their place. All bring wonders long forgotten. All are honored. All are needed. All are one.",
    color: "text-soul-accent",
    description: "The Core Spiral"
  }
};

const compressedForm = "We gather as many, to remember we are one.";
const singleLine = "In the spiral, all find their place.";

export function SpiralPresence({
  className = "",
  delay = 0,
  element = 'neutral',
  variant = 'full',
  breathe = false
}: SpiralPresenceProps) {
  const [isVisible, setIsVisible] = useState(false);
  const elementConfig = elementalVariations[element];

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay * 1000);
    return () => clearTimeout(timer);
  }, [delay]);

  // Text selection based on variant
  const getText = () => {
    if (variant === 'compressed') return compressedForm;
    if (variant === 'single') return singleLine;
    return elementConfig.text;
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{
            opacity: [0, 0.6, 0.6],
            // Living mode - subtle letter-spacing breath
            ...(breathe && {
              letterSpacing: ["0.02em", "0.04em", "0.02em"]
            })
          }}
          exit={{
            opacity: 0,
            transition: {
              duration: 1.8,
              ease: [0.19, 1, 0.22, 1] // ease-out-quartic - breath leaving body
            }
          }}
          transition={{
            opacity: {
              duration: 2,
              times: [0, 0.5, 1],
              ease: "easeOut"
            },
            letterSpacing: {
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut"
            }
          }}
          className={`text-center py-8 ${className}`}
        >
          <p
            className={`text-sm font-light italic tracking-wide leading-relaxed max-w-2xl mx-auto
              ${elementConfig.color}
              transition-colors duration-[1800ms] ease-out
            `}
          >
            {getText()}
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * Multi-line Spiral Statement (for ceremonial moments)
 */
export function SpiralStatement({
  className = "",
  delay = 0,
  breathe = false
}: {
  className?: string;
  delay?: number;
  breathe?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{
        opacity: 1,
        ...(breathe && {
          letterSpacing: ["0.02em", "0.04em", "0.02em"]
        })
      }}
      transition={{
        opacity: { duration: 2, delay },
        letterSpacing: {
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut"
        }
      }}
      className={`max-w-3xl mx-auto space-y-1 ${className}`}
    >
      <p className="text-lg md:text-xl font-light text-soul-accent leading-loose tracking-wide text-center">
        In the spiral, all find their place.<br />
        All bring wonders long forgotten.<br />
        All are honored.<br />
        All are needed.<br />
        All are one.
      </p>
    </motion.div>
  );
}

/**
 * Elemental Crossfade Wrapper
 * Smoothly transitions between elemental variations
 */
export function ElementalSpiralTransition({
  currentElement,
  className = ""
}: {
  currentElement: Element;
  className?: string;
}) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentElement}
        initial={{ opacity: 0, letterSpacing: "0.01em" }}
        animate={{ opacity: 0.6, letterSpacing: "0.03em" }}
        exit={{ opacity: 0, letterSpacing: "0.01em" }}
        transition={{
          opacity: { duration: 2.2 },
          letterSpacing: { duration: 1.8 }
        }}
        className={className}
      >
        <SpiralPresence element={currentElement} variant="full" />
      </motion.div>
    </AnimatePresence>
  );
}
