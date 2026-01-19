/**
 * App Router 404 Not Found Page
 * Handles 404 errors for static export (Capacitor builds)
 */

import Link from 'next/link';

export const dynamic = 'force-static';
export const revalidate = false;

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0D0F12] via-[#1A1D26] to-[#0D0F12] flex flex-col items-center justify-center p-4">
      <div className="text-center space-y-6 max-w-md">
        {/* MAIA Logo/Icon */}
        <div className="w-20 h-20 mx-auto mb-4 opacity-60">
          <img
            src="/holoflower-amber.png"
            alt="MAIA"
            className="w-full h-full object-contain"
          />
        </div>

        <h1 className="text-4xl font-light text-amber-400/90" style={{ fontFamily: 'Spectral, Georgia, serif' }}>
          Path Not Found
        </h1>

        <p className="text-maia-ink-60 text-lg" style={{ fontFamily: 'Spectral, Georgia, serif' }}>
          This page doesn't exist in the current realm.
        </p>

        <Link
          href="/maia"
          className="inline-block mt-8 px-6 py-3 bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 rounded-full transition-all duration-300 border border-amber-500/30"
          style={{ fontFamily: 'Spectral, Georgia, serif' }}
        >
          Return to MAIA
        </Link>
      </div>
    </div>
  );
}
