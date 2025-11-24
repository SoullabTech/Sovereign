'use client';

import { useEffect } from 'react';
import { SessionManager } from '../lib/sessionManager';

// Root Page - Sacred Pathway Detection and Routing
// Automatically detects user state and routes to appropriate experience

export default function RootPage() {
  useEffect(() => {
    const detectAndRoute = async () => {
      try {
        // Get user's current pathway
        const sessionState = SessionManager.getUserPathway();

        console.log('🧘 Sacred pathway detection:', sessionState.pathway);

        // Route based on pathway
        switch (sessionState.pathway) {
          case 'PATHWAY_3_CONTINUOUS':
            // Active session - direct to MAIA
            SessionManager.trackInteraction('root_direct_to_maia');
            SessionManager.redirectToMaia();
            break;

          case 'PATHWAY_2_RETURNING':
          case 'PATHWAY_1_INITIATION':
          default:
            // Need onboarding or returning user flow
            SessionManager.trackInteraction('root_to_welcome', {
              pathway: sessionState.pathway,
              isFirstVisit: sessionState.isFirstVisit
            });
            window.location.href = '/welcome';
            break;
        }

      } catch (error) {
        console.error('Sacred pathway detection error:', error);

        // Fallback to welcome page
        window.location.href = '/welcome';
      }
    };

    // Small delay to ensure clean page transition
    const timer = setTimeout(detectAndRoute, 300);

    return () => clearTimeout(timer);
  }, []);

  // Pathway detection loading screen
  return (
    <div className="min-h-screen bg-gradient-to-br from-sage-50 via-teal-50 to-sage-100 flex items-center justify-center">

      {/* Sacred loading animation */}
      <div className="text-center space-y-8">

        {/* Sacred holoflower loading */}
        <div className="relative w-32 h-32 mx-auto">
          <svg
            className="w-full h-full"
            viewBox="0 0 128 128"
            style={{
              animation: 'var(--sacred-rotation)'
            }}
          >
            <defs>
              <radialGradient id="loadingGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="var(--aether-400)" stopOpacity="0.8" />
                <stop offset="50%" stopColor="var(--sage-400)" stopOpacity="0.6" />
                <stop offset="100%" stopColor="var(--teal-400)" stopOpacity="0.3" />
              </radialGradient>
            </defs>

            {/* Sacred holoflower petals */}
            <g transform="translate(64,64)">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <path
                  key={i}
                  d="M0,-30 Q-15,-20 -20,0 Q-15,20 0,30 Q15,20 20,0 Q15,-20 0,-30"
                  fill="url(#loadingGlow)"
                  transform={`rotate(${i * 60})`}
                  style={{
                    animation: `var(--sacred-pulse)`,
                    animationDelay: `${i * 0.2}s`
                  }}
                />
              ))}

              {/* Center consciousness point */}
              <circle
                cx="0"
                cy="0"
                r="3"
                fill="var(--aether-500)"
                style={{
                  animation: `var(--sacred-pulse)`
                }}
              />
            </g>
          </svg>
        </div>

        {/* Loading text */}
        <div className="space-y-3">
          <h1 className="text-2xl font-light text-sage-800 font-ceremony tracking-wide">
            Detecting consciousness pathway...
          </h1>

          <p className="text-sage-600 font-light text-sm">
            Preparing your sacred space
          </p>
        </div>

        {/* Loading dots animation */}
        <div className="flex justify-center space-x-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 bg-sage-400 rounded-full"
              style={{
                animation: `var(--sacred-pulse)`,
                animationDelay: `${i * 0.5}s`
              }}
            />
          ))}
        </div>

      </div>

      {/* Background subtle sacred geometry */}
      <div className="absolute inset-0 overflow-hidden opacity-20">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96"
          style={{
            background: 'radial-gradient(circle, var(--sage-200) 0%, transparent 70%)',
            animation: `var(--sacred-breathe)`
          }}
        />

        <div
          className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-64 h-64"
          style={{
            background: 'radial-gradient(circle, var(--teal-200) 0%, transparent 70%)',
            animation: `var(--sacred-breathe)`,
            animationDelay: '2s'
          }}
        />

        <div
          className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-48 h-48"
          style={{
            background: 'radial-gradient(circle, var(--aether-200) 0%, transparent 70%)',
            animation: `var(--sacred-breathe)`,
            animationDelay: '4s'
          }}
        />
      </div>

    </div>
  );
}