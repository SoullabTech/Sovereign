export const dynamic = 'force-dynamic';

/**
 * /maia — Field-First Personal Home
 *
 * The primary experience surface for MAIA. Server-rendered.
 *
 * Shows: what's present, what's emerging, what's unfinished.
 * Chat is one doorway via /maia/chat, not the whole ontology.
 *
 * Philosophy: Recognition, not explanation. Continuity, not chat history.
 * Emergence, not diagnosis. Sovereignty, not system assertion.
 */

import { redirect } from 'next/navigation';
import { getCurrentSession } from '@/lib/auth/serverSessions';
import { getMaiaFieldSummary } from '@/lib/field/getMaiaFieldSummary';
import { FirstVisitOrientation } from '@/components/field/FirstVisitOrientation';
import { FieldHero } from '@/components/field/FieldHero';
import { CurrentStatePanel } from '@/components/field/CurrentStatePanel';
import { EmergingThemesPanel } from '@/components/field/EmergingThemesPanel';
import { OpenThreadsPanel } from '@/components/field/OpenThreadsPanel';
import { FieldFooterNav } from '@/components/field/FieldFooterNav';

export default async function MaiaFieldPage() {
  // Auth — server-side session check
  const session = await getCurrentSession();
  if (!session) {
    redirect('/signin');
  }

  // Fetch field summary — direct call, no HTTP round-trip
  let summary;
  try {
    summary = await getMaiaFieldSummary(session.memberId);
  } catch (error) {
    console.error('[maia] Failed to load field summary:', error);
    // Graceful degradation: show zero state
    summary = {
      currentState: {
        fieldState: 'flicker' as const,
        activeElement: null,
        motion: null,
        orientingLine: 'Welcome. MAIA is here.',
      },
      emergingThemes: [],
      openThreads: [],
    };
  }

  const { currentState, emergingThemes, openThreads } = summary;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a1a2e] via-[#16162a] to-[#121226] text-white/90">
      <main className="max-w-2xl mx-auto px-6 py-12 space-y-12">
        {/* Temporary orientation for first-time visitors */}
        <FirstVisitOrientation />

        {/* Hero: orienting line + CTA */}
        <FieldHero
          orientingLine={currentState.orientingLine}
          fieldState={currentState.fieldState}
          currentElement={currentState.activeElement}
          hasOpenThread={openThreads.length > 0}
        />

        {/* Current state: element + motion */}
        <CurrentStatePanel
          currentElement={currentState.activeElement}
          motion={currentState.motion}
          fieldState={currentState.fieldState}
        />

        {/* Emerging themes: what keeps returning */}
        <EmergingThemesPanel themes={emergingThemes} />

        {/* Open threads: what's unfinished */}
        <OpenThreadsPanel threads={openThreads} />

        {/* Footer nav: MAIA / Fields / Build */}
        <FieldFooterNav />
      </main>
    </div>
  );
}
