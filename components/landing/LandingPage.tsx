'use client';

import { useState, useRef } from 'react';
import { LandingHero } from './LandingHero';
import { LandingPromise } from './LandingPromise';
import { LandingSovereignty } from './LandingSovereignty';
import { LandingTiers } from './LandingTiers';
import { LandingEntry } from './LandingEntry';

export function LandingPage() {
  const [showEntry, setShowEntry] = useState(false);
  const learnMoreRef = useRef<HTMLDivElement>(null);

  const handleEnter = () => {
    setShowEntry(true);
  };

  const handleLearnMore = () => {
    learnMoreRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleBegin = () => {
    setShowEntry(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a3a3a] via-[#0f2929] to-[#0a1f1f] overflow-x-hidden">
      {/* Hero section */}
      <LandingHero onEnter={handleEnter} onLearnMore={handleLearnMore} />

      {/* Learn more sections */}
      <div ref={learnMoreRef}>
        <LandingPromise />
        <LandingSovereignty />
        <LandingTiers onBegin={handleBegin} />
      </div>

      {/* Footer */}
      <footer className="py-12 px-6 text-center border-t border-white/5">
        <p className="text-white/30 text-sm">
          Soullab — Consciousness technology for transformation
        </p>
        <p className="text-white/20 text-xs mt-2">
          Self-hosted. Sovereign. Yours.
        </p>
      </footer>

      {/* Entry modal */}
      {showEntry && (
        <div onClick={(e) => {
          if (e.target === e.currentTarget) setShowEntry(false);
        }}>
          <LandingEntry />
        </div>
      )}
    </div>
  );
}
