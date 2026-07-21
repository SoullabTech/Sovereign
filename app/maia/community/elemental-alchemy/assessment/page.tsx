import React from 'react';

/**
 * TEMPORARY GATE — EA Assessment (ruling E0.2, gated 2026-07-21).
 *
 * The interactive assessment computed and presented a system-authored
 * elemental identity (dominant element, scored percentages, essence and
 * shadow claims, assigned paths). That is a constitutional mismatch under
 * ELEMENTAL_E0_RULINGS_2026-07-21.md §E0.2 and is gated pending redesign
 * as a contextual, revisable invitation rather than an identity verdict.
 *
 * The original page is preserved intact in git history at commit
 * cd03493c9 (app/maia/community/elemental-alchemy/assessment/page.tsx).
 * Scoring/content in lib/elemental-alchemy/assessmentQuestions.ts is
 * untouched. Evidence: docs/architecture/EA_ASSESSMENT_LIVE_EVIDENCE_2026-07-21.md.
 */
export default function ElementAssessmentGatePage() {
  return (
    <div className="min-h-screen bg-[#0b0e14] flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center space-y-6 py-16">
        <div className="text-3xl" aria-hidden="true">
          ✦
        </div>
        <h1 className="text-xl font-semibold text-white">
          This reflection is being revised.
        </h1>
        <p className="text-white/70 leading-relaxed">
          We are reshaping this experience so that it helps you explore what
          may be useful in your life right now without defining who you are.
        </p>
        <p className="text-white/70 leading-relaxed">
          The Elemental Alchemy teachings and chapters remain available in the
          main hub.
        </p>
        <a
          href="/maia/community/elemental-alchemy"
          className="inline-block mt-2 px-6 py-3 rounded-xl bg-white/10 text-white hover:bg-white/15 transition-colors"
        >
          Return to Elemental Alchemy
        </a>
      </div>
    </div>
  );
}
