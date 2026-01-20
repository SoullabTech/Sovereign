'use client';

/**
 * Sacred Journaling - Consciousness-informed journaling with symbolic integration
 *
 * Soullab aesthetic: warm off-white, refined typography, geometric symbols
 */

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

// Geometric symbol for journaling
const JournalSymbol = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 40 40" className={className} fill="none" stroke="currentColor" strokeWidth="1.5">
    {/* Open book / pages symbol */}
    <path d="M8 10 Q20 8 20 20 Q20 32 8 30" />
    <path d="M32 10 Q20 8 20 20 Q20 32 32 30" />
    <line x1="20" y1="8" x2="20" y2="32" />
  </svg>
);

export default function SacredJournalPage() {
  const router = useRouter();

  return (
    <div
      className="min-h-screen"
      style={{ background: 'linear-gradient(180deg, #f8f7f5 0%, #f4f3f0 50%, #f0efec 100%)' }}
    >
      <div className="max-w-2xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-12">
          <button
            onClick={() => router.push('/labtools')}
            className="flex items-center gap-2 text-stone-400 hover:text-stone-600 transition-colors text-[13px] tracking-wide"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to LabTools</span>
          </button>
        </div>

        {/* Content */}
        <div className="text-center space-y-8">
          {/* Symbol */}
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-xl bg-[#5a7a6f]/10 flex items-center justify-center">
              <JournalSymbol className="w-8 h-8 text-[#5a7a6f]" />
            </div>
          </div>

          {/* Title */}
          <div>
            <h1 className="text-2xl font-light tracking-wide text-stone-800 mb-3">
              Sacred Journaling
            </h1>
            <p className="text-stone-500 text-[14px] tracking-wide leading-relaxed max-w-md mx-auto">
              Consciousness-informed journaling with symbolic integration, oracle connections, and awareness tracking.
            </p>
          </div>

          {/* Coming Soon Notice */}
          <div className="bg-white/60 border border-stone-200/60 rounded-xl p-6 max-w-md mx-auto">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-[#8a7a5a]/10 flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-4 h-4 text-[#8a7a5a]" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="12" cy="12" r="8" />
                  <path d="M12 8v4l2 2" />
                </svg>
              </div>
              <h3 className="text-[13px] font-medium tracking-wide text-stone-700">Coming Soon</h3>
            </div>
            <ul className="text-stone-500 text-[13px] tracking-wide space-y-2 text-left">
              <li className="flex items-start gap-2">
                <span className="text-[#5a7a6f] mt-1">·</span>
                <span>Consciousness-guided journal prompts</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#5a7a6f] mt-1">·</span>
                <span>Integration with oracle readings and insights</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#5a7a6f] mt-1">·</span>
                <span>Symbolic pattern recognition in personal writings</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#5a7a6f] mt-1">·</span>
                <span>Elemental awareness tracking</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#5a7a6f] mt-1">·</span>
                <span>Sacred timing and moon phase journaling</span>
              </li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-center gap-4 pt-4">
            <button
              onClick={() => router.push('/oracle')}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#5a7a6f] hover:bg-[#4a6a5f] text-white rounded-xl text-[13px] tracking-wide transition-colors"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="12" r="10" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              <span>Explore Oracle Tools</span>
            </button>
            <button
              onClick={() => router.push('/labtools')}
              className="px-5 py-2.5 text-stone-500 hover:text-stone-700 hover:bg-stone-100 rounded-xl text-[13px] tracking-wide transition-colors"
            >
              Return to LabTools
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
