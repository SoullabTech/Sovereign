'use client';

/**
 * App Router Error Boundary
 * Handles runtime errors for static export (Capacitor builds)
 */

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error for debugging
    console.error('App error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0D0F12] via-[#1A1D26] to-[#0D0F12] flex flex-col items-center justify-center p-4">
      <div className="text-center space-y-6 max-w-md">
        {/* MAIA Logo/Icon */}
        <div className="w-20 h-20 mx-auto mb-4 opacity-60">
          <img
            src="/logo_flower 2.png"
            alt="MAIA"
            className="w-full h-full object-contain"
          />
        </div>

        <h1 className="text-4xl font-light text-amber-400/90" style={{ fontFamily: 'Spectral, Georgia, serif' }}>
          Something Went Wrong
        </h1>

        <p className="text-maia-ink-60 text-lg" style={{ fontFamily: 'Spectral, Georgia, serif' }}>
          An unexpected error has occurred.
        </p>

        <div className="flex gap-4 justify-center mt-8">
          <button
            onClick={() => reset()}
            className="px-6 py-3 bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 rounded-full transition-all duration-300 border border-amber-500/30"
            style={{ fontFamily: 'Spectral, Georgia, serif' }}
          >
            Try Again
          </button>

          <a
            href="/maia"
            className="px-6 py-3 bg-transparent hover:bg-amber-500/10 text-amber-400/70 rounded-full transition-all duration-300 border border-amber-500/20"
            style={{ fontFamily: 'Spectral, Georgia, serif' }}
          >
            Return to MAIA
          </a>
        </div>
      </div>
    </div>
  );
}
