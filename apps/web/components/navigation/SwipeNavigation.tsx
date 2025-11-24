'use client';

/**
 * SWIPE NAVIGATION - Sacred Compass System
 *
 * Gestural navigation between consciousnesses
 * Embodies the phenomenological journey through physical gesture
 *
 * Layout (Brain Hemisphere Mapping):
 *            ↑ SYZYGY
 *        (Integration)
 *
 * KAIROS ←  STATION  → MAIA
 * (Left)              (Right)
 *
 *            ↓ SHADOW
 *        (Subconscious)
 *
 * KEYBOARD SHORTCUTS:
 * - Arrow Keys: Navigate in respective directions
 * - Escape: Return to Consciousness Station
 */

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { motion } from 'framer-motion';

interface SwipeNavigationProps {
  currentPage: 'station' | 'maia' | 'kairos' | 'syzygy';
  children: React.ReactNode;
}

export function SwipeNavigation({ currentPage, children }: SwipeNavigationProps) {
  const router = useRouter();

  const handleSwipe = (direction: 'up' | 'down' | 'left' | 'right') => {
    const routes = {
      station: {
        up: '/unified',        // ↑ SYZYGY (integration)
        left: '/kairos',       // ← KAIROS (left brain)
        right: '/maia',        // → MAIA (right brain)
        down: null,            // ↓ TODO: Shadow/subconscious page
      },
      maia: {
        up: '/unified',        // ↑ SYZYGY
        left: '/kairos',       // ← KAIROS
        down: '/consciousness', // ↓ Return to Station
        right: null,
      },
      kairos: {
        up: '/unified',        // ↑ SYZYGY
        right: '/maia',        // → MAIA
        down: '/consciousness', // ↓ Return to Station
        left: null,
      },
      syzygy: {
        left: '/kairos',       // ← KAIROS
        right: '/maia',        // → MAIA
        down: '/consciousness', // ↓ Return to Station
        up: null,
      },
    };

    const destination = routes[currentPage][direction];
    if (destination) {
      router.push(destination);
    }
  };

  // Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input field
      if (e.target instanceof HTMLInputElement ||
          e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          handleSwipe('up');
          break;
        case 'ArrowDown':
          e.preventDefault();
          handleSwipe('down');
          break;
        case 'ArrowLeft':
          e.preventDefault();
          handleSwipe('left');
          break;
        case 'ArrowRight':
          e.preventDefault();
          handleSwipe('right');
          break;
        case 'Escape':
          e.preventDefault();
          router.push('/consciousness');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPage, router]);

  return (
    <motion.div
      className="min-h-screen"
      onPan={(event, info) => {
        // Prevent swipe navigation when user is selecting text
        const target = event.target as HTMLElement;

        // Check if user is interacting with text content
        const isTextElement = target.tagName === 'P' ||
                             target.tagName === 'SPAN' ||
                             target.tagName === 'DIV' ||
                             target.closest('p, span, div[class*="text"]');

        // Check if there's a text selection in progress
        const selection = window.getSelection();
        const hasSelection = selection && selection.toString().length > 0;

        // Don't trigger navigation if text is being selected
        if (hasSelection || isTextElement) {
          return;
        }

        const threshold = 150; // pixels to trigger navigation (increased from 100 to prevent accidental swipes)
        const velocity = 0.8; // minimum velocity (increased from 0.5 to require faster swipe)

        // Only trigger if fast enough swipe
        if (Math.abs(info.velocity.x) < velocity && Math.abs(info.velocity.y) < velocity) {
          return;
        }

        // Determine dominant direction
        if (Math.abs(info.offset.x) > Math.abs(info.offset.y)) {
          // Horizontal swipe
          if (info.offset.x > threshold) {
            handleSwipe('left');
          } else if (info.offset.x < -threshold) {
            handleSwipe('right');
          }
        } else {
          // Vertical swipe
          if (info.offset.y > threshold) {
            handleSwipe('down');
          } else if (info.offset.y < -threshold) {
            handleSwipe('up');
          }
        }
      }}
    >
      {children}
    </motion.div>
  );
}

/**
 * DIRECTIONAL HINTS - Subtle visual cues for swipe directions
 */
interface DirectionalHintsProps {
  availableDirections: {
    up?: { label: string; emoji: string };
    down?: { label: string; emoji: string };
    left?: { label: string; emoji: string };
    right?: { label: string; emoji: string };
  };
}

export function DirectionalHints({ availableDirections }: DirectionalHintsProps) {
  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      {/* UP */}
      {availableDirections.up && (
        <motion.div
          className="absolute top-0 left-1/2 -translate-x-1/2 pt-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 0.3, y: 0 }}
          transition={{ duration: 1, repeat: Infinity, repeatType: 'reverse' }}
        >
          <div className="text-center text-[#D4B896]/40 text-xs font-light tracking-widest">
            <div className="text-lg mb-1">{availableDirections.up.emoji}</div>
            <div>{availableDirections.up.label}</div>
          </div>
        </motion.div>
      )}

      {/* DOWN */}
      {availableDirections.down && (
        <motion.div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 pb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 0.3, y: 0 }}
          transition={{ duration: 1, repeat: Infinity, repeatType: 'reverse' }}
        >
          <div className="text-center text-[#D4B896]/40 text-xs font-light tracking-widest">
            <div className="text-lg mb-1">{availableDirections.down.emoji}</div>
            <div>{availableDirections.down.label}</div>
          </div>
        </motion.div>
      )}

      {/* LEFT */}
      {availableDirections.left && (
        <motion.div
          className="absolute left-0 top-1/2 -translate-y-1/2 pl-4"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 0.3, x: 0 }}
          transition={{ duration: 1, repeat: Infinity, repeatType: 'reverse' }}
        >
          <div className="text-center text-[#D4B896]/40 text-xs font-light tracking-widest">
            <div className="text-lg mb-1">{availableDirections.left.emoji}</div>
            <div className="writing-mode-vertical">{availableDirections.left.label}</div>
          </div>
        </motion.div>
      )}

      {/* RIGHT */}
      {availableDirections.right && (
        <motion.div
          className="absolute right-0 top-1/2 -translate-y-1/2 pr-4"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 0.3, x: 0 }}
          transition={{ duration: 1, repeat: Infinity, repeatType: 'reverse' }}
        >
          <div className="text-center text-[#D4B896]/40 text-xs font-light tracking-widest">
            <div className="text-lg mb-1">{availableDirections.right.emoji}</div>
            <div className="writing-mode-vertical">{availableDirections.right.label}</div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
