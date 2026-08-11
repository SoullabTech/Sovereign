'use client';

/**
 * Journal — the member's Journal room.
 *
 * This is the CANONICAL member Journal route. It lives outside /labtools on
 * purpose: app/labtools/layout.tsx applies requireFounder(), so anything under
 * it — however member-shaped its own code is — resolves to a founder refusal
 * for an ordinary member.
 *
 * CUTOVER (2026-08-11): this route now renders the Journal Room, the founder-
 * accepted room built from the experiential reference at
 * docs/design/references/JOURNAL_EXPERIENTIAL_REFERENCE_2026-08-10.md and
 * frozen for deployment at docs/design/references/JOURNAL_DEPLOYMENT_CLOSURE_2026-08-10.md
 * (frozen candidate 250d08714). It previously rendered UnifiedJournalView.
 *
 * UnifiedJournalView is NOT deleted — it still backs /labtools/journal, the
 * founder/practitioner Lab Tools entry point, which this cutover does not
 * touch. "Preserve rollback capability" (cutover unit §3): reverting this file
 * alone restores the prior member-facing behavior.
 *
 * app/journal/room/page.tsx renders the identical component and is kept as a
 * second entry point for the same reason.
 *
 * Guarded by lib/navigation/__tests__/journalReachability.test.ts, updated in
 * this same commit to assert the new shape.
 */

import { JournalRoom } from '@/components/journal/room/JournalRoom';

export default function JournalPage() {
  return <JournalRoom />;
}
