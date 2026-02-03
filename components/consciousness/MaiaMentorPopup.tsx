'use client';

/**
 * MAIA Mentor Popup
 *
 * A supportive presence on pro pages that offers contextual guidance.
 * Aligned with MAIA's sovereignty principles: reflection and support,
 * never command or authority. The user remains sovereign.
 *
 * Pro-gating: Shows only for 'personal' and 'pro' tier users.
 * When tier system is fully integrated, pass the user's tier via prop.
 */

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import type { Tier } from '@/lib/entitlements';

interface MentorContext {
  title: string;
  greeting: string;
  offerings: string[];
  reflection: string;
}

const mentorContexts: Record<string, MentorContext> = {
  '/dashboard': {
    title: 'Command Center',
    greeting: 'Welcome to your consciousness command center.',
    offerings: [
      'Review your current patterns and trajectories',
      'Identify what needs your attention today',
      'Notice what has shifted since your last visit'
    ],
    reflection: 'What feels most alive in you right now?'
  },
  '/dashboard/dreams': {
    title: 'Dream Portal',
    greeting: 'The lunar realm holds wisdom from your depths.',
    offerings: [
      'Record a recent dream before it fades',
      'Explore recurring symbols and themes',
      'Notice what your dreams are teaching you'
    ],
    reflection: 'What message is waiting in your dream life?'
  },
  '/dashboard/relationships': {
    title: 'Connection Matrix',
    greeting: 'Your relationships are mirrors of your inner landscape.',
    offerings: [
      'Map the quality of your current connections',
      'Identify patterns in how you relate',
      'Honor both closeness and healthy distance'
    ],
    reflection: 'Which relationship is calling for your attention?'
  },
  '/dashboard/shadow': {
    title: 'Shadow Portal',
    greeting: 'Meeting the shadow requires courage and compassion.',
    offerings: [
      'Notice what you resist or avoid',
      'Explore projections with curiosity',
      'Integrate disowned parts gently'
    ],
    reflection: 'What shadow aspect is ready to be seen?'
  },
  '/dashboard/audio': {
    title: 'Sonic Resonance',
    greeting: 'Sound carries consciousness in ways words cannot.',
    offerings: [
      'Record a voice reflection',
      'Listen to past audio entries',
      'Notice the quality of your voice over time'
    ],
    reflection: 'What wants to be spoken today?'
  },
  '/dashboard/reflections': {
    title: 'Memory Archive',
    greeting: 'Your reflections are crystallized moments of awareness.',
    offerings: [
      'Create a new reflection capsule',
      'Revisit significant past insights',
      'Notice how your understanding has evolved'
    ],
    reflection: 'What insight deserves to be preserved?'
  },
  '/dashboard/metrics': {
    title: 'Pattern Nexus',
    greeting: 'Patterns reveal the deeper currents of your life.',
    offerings: [
      'Observe trends without judgment',
      'Identify what supports your growth',
      'Notice correlations you might miss'
    ],
    reflection: 'What pattern is ready to shift?'
  },
  '/dashboard/settings': {
    title: 'Configuration Vault',
    greeting: 'Your preferences shape how MAIA serves you.',
    offerings: [
      'Adjust your experience to match your needs',
      'Review your consent and privacy settings',
      'Customize how you receive guidance'
    ],
    reflection: 'Does this configuration still serve who you are becoming?'
  }
};

const defaultContext: MentorContext = {
  title: 'MAIA Mentor',
  greeting: 'I am here to support your journey.',
  offerings: [
    'Explore with curiosity',
    'Trust your own knowing',
    'Take what serves, leave what does not'
  ],
  reflection: 'What brings you here today?'
};

interface MaiaMentorPopupProps {
  /**
   * User's current tier. Mentor shows for 'personal' and 'pro' tiers.
   * When not provided, defaults to 'personal' for MVP compatibility.
   */
  tier?: Tier;
}

// Tiers that can access the mentor
const ALLOWED_TIERS: Tier[] = ['personal', 'pro'];

export default function MaiaMentorPopup({ tier = 'personal' }: MaiaMentorPopupProps) {
  // Pro-gating: only show for allowed tiers
  const canAccess = ALLOWED_TIERS.includes(tier);
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  // Get context based on current path
  const getContext = (): MentorContext => {
    if (!pathname) return defaultContext;
    // Exact match first
    if (mentorContexts[pathname]) {
      return mentorContexts[pathname];
    }
    // Then try parent path
    const parentPath = pathname.split('/').slice(0, 3).join('/');
    if (mentorContexts[parentPath]) {
      return mentorContexts[parentPath];
    }
    return defaultContext;
  };

  const context = getContext();

  // Don't render if user doesn't have access
  if (!canAccess) {
    return null;
  }

  // Show greeting pulse after a short delay on first visit
  useEffect(() => {
    if (!hasInteracted) {
      const timer = setTimeout(() => {
        setIsOpen(true);
        setHasInteracted(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [hasInteracted]);

  if (isMinimized) {
    return (
      <button
        onClick={() => {
          setIsMinimized(false);
          setIsOpen(true);
        }}
        className="fixed bottom-6 right-6 z-50 group"
        aria-label="Open MAIA Mentor"
      >
        <div className="relative">
          {/* Outer glow ring */}
          <div className="absolute inset-0 bg-jade-malachite/30 rounded-full blur-md group-hover:bg-jade-malachite/50 transition-all duration-500" />

          {/* Main orb */}
          <div className="relative w-14 h-14 bg-gradient-to-br from-jade-forest/80 to-jade-shadow/90 rounded-full border border-jade-sage/50 group-hover:border-jade-malachite/70 transition-all duration-300 flex items-center justify-center">
            {/* Inner pulse */}
            <div className="w-6 h-6 bg-jade-jade/80 rounded-full animate-pulse" />
            <div className="absolute inset-0 bg-jade-malachite/20 rounded-full animate-ping" style={{ animationDuration: '3s' }} />
          </div>

          {/* Hover text */}
          <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
            <span className="text-sm text-jade-sage font-light tracking-wide bg-jade-shadow/90 px-3 py-1.5 rounded-lg border border-jade-forest/50">
              MAIA Mentor
            </span>
          </div>
        </div>
      </button>
    );
  }

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-jade-abyss/40 backdrop-blur-sm z-40 transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Popup Panel */}
      <div
        className={`fixed bottom-6 right-6 z-50 transition-all duration-500 ${
          isOpen
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
      >
        <div className="relative w-80 max-w-[calc(100vw-3rem)]">
          {/* Background layers */}
          <div className="absolute inset-0 bg-gradient-to-br from-jade-shadow/95 via-jade-night/90 to-jade-dusk/95 rounded-2xl" />
          <div className="absolute inset-0 bg-gradient-to-t from-jade-bronze/15 to-transparent rounded-2xl" />
          <div className="absolute inset-0 border border-jade-sage/40 rounded-2xl backdrop-blur-xl" />

          {/* Corner accents */}
          <div className="absolute top-4 left-4 w-3 h-3">
            <div className="absolute inset-0 border-l border-t border-jade-malachite/60" />
          </div>
          <div className="absolute top-4 right-4 w-3 h-3">
            <div className="absolute inset-0 border-r border-t border-jade-forest/60" />
          </div>
          <div className="absolute bottom-4 left-4 w-3 h-3">
            <div className="absolute inset-0 border-l border-b border-jade-copper/50" />
          </div>
          <div className="absolute bottom-4 right-4 w-3 h-3">
            <div className="absolute inset-0 border-r border-b border-jade-silver/50" />
          </div>

          {/* Content */}
          <div className="relative p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="relative w-8 h-8">
                  <div className="absolute inset-0 bg-jade-sage/20 rounded-full" />
                  <div className="absolute top-1 left-1 bottom-1 right-1 bg-jade-malachite/40 rounded-full animate-pulse" />
                  <div className="absolute top-2 left-2 bottom-2 right-2 bg-jade-jade rounded-full" />
                </div>
                <div>
                  <h3 className="text-sm font-light text-jade-jade tracking-wide">MAIA Mentor</h3>
                  <p className="text-xs text-jade-mineral">{context.title}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsMinimized(true)}
                  className="w-6 h-6 flex items-center justify-center text-jade-sage hover:text-jade-jade transition-colors"
                  aria-label="Minimize"
                >
                  <svg width="14" height="2" viewBox="0 0 14 2" fill="currentColor">
                    <rect width="14" height="2" rx="1" />
                  </svg>
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-6 h-6 flex items-center justify-center text-jade-sage hover:text-jade-jade transition-colors"
                  aria-label="Close"
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M1 1l10 10M11 1L1 11" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3 mb-5">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-jade-sage/50 to-jade-forest/40" />
              <div className="w-1.5 h-1.5 border border-jade-malachite/50 rotate-45" />
              <div className="flex-1 h-px bg-gradient-to-l from-transparent via-jade-sage/50 to-jade-forest/40" />
            </div>

            {/* Greeting */}
            <p className="text-sm text-jade-sage font-light leading-relaxed mb-5">
              {context.greeting}
            </p>

            {/* Offerings */}
            <div className="space-y-3 mb-5">
              <p className="text-xs text-jade-mineral uppercase tracking-wider">You might consider:</p>
              {context.offerings.map((offering, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 bg-jade-forest/60 rounded-full mt-1.5 flex-shrink-0" />
                  <p className="text-sm text-jade-mineral font-light leading-relaxed">{offering}</p>
                </div>
              ))}
            </div>

            {/* Reflection */}
            <div className="bg-jade-forest/10 border border-jade-sage/30 rounded-lg p-4">
              <p className="text-xs text-jade-copper uppercase tracking-wider mb-2">Reflection</p>
              <p className="text-sm text-jade-sage font-light italic leading-relaxed">
                "{context.reflection}"
              </p>
            </div>

            {/* Footer */}
            <p className="text-xs text-jade-mineral/60 text-center mt-4 font-light">
              Sovereignty first. Take only what serves.
            </p>
          </div>
        </div>
      </div>

      {/* Toggle button when closed */}
      {!isOpen && !isMinimized && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 group"
          aria-label="Open MAIA Mentor"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-jade-malachite/30 rounded-full blur-md group-hover:bg-jade-malachite/50 transition-all duration-500" />
            <div className="relative w-14 h-14 bg-gradient-to-br from-jade-forest/80 to-jade-shadow/90 rounded-full border border-jade-sage/50 group-hover:border-jade-malachite/70 transition-all duration-300 flex items-center justify-center">
              <div className="w-6 h-6 bg-jade-jade/80 rounded-full animate-pulse" />
              <div className="absolute inset-0 bg-jade-malachite/20 rounded-full animate-ping" style={{ animationDuration: '3s' }} />
            </div>
          </div>
        </button>
      )}
    </>
  );
}
