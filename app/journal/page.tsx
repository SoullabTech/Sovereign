'use client';

/**
 * Journal — the member's Journal.
 *
 * This is the CANONICAL member Journal route. It lives outside /labtools on
 * purpose: app/labtools/layout.tsx applies requireFounder(), so anything under
 * it — however member-shaped its own code is — resolves to a founder refusal
 * for an ordinary member.
 *
 * Before 2026-07-28 this file was `redirect('/labtools/journal')`, which made
 * the House's Journal doorway a disguised path into that gate. The redirect is
 * gone.
 *
 * CUTOVER (founder authorization, 2026-08-11). This route now serves the
 * Journal Room. It previously served UnifiedJournalView — a competent records
 * surface that greeted the member with search, category pills and repeated
 * cards before their own writing. The Room was built from the approved
 * experiential reference, walked, corrected three times under founder ruling
 * (paper material · one compositional axis · Browse continuity), measured for
 * accessibility, and accepted.
 *
 * WHAT THE MEMBER KEEPS. The cutover is a change of experience, not of
 * capability. The Room's Browse carries the whole corpus the old surface
 * carried — journal entries, exact search, Captures, Scribe sessions, Changes
 * and Decisions — behind a quiet secondary doorway, so writing holds the front
 * door without anything being taken away. Same APIs, same storage decisions,
 * same auth, same data.
 *
 * WHAT REMAINS. components/journal/UnifiedJournalView is still the
 * implementation behind /labtools/journal, so nothing is deleted by this
 * cutover and founders keep the old view for comparison. Retiring it is a
 * separate decision with its own evidence.
 *
 * Guarded by lib/navigation/__tests__/journalReachability.test.ts.
 *
 * @see docs/design/contracts/journal-room.md
 */

import { JournalRoom } from '@/components/journal/room/JournalRoom';

export default function JournalPage() {
  return <JournalRoom />;
}
