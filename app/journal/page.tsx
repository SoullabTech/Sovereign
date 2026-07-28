'use client';

/**
 * Journal — the member's Journal room.
 *
 * This is the CANONICAL member Journal route. It lives outside /labtools on
 * purpose: app/labtools/layout.tsx applies requireFounder(), so anything under
 * it — however member-shaped its own code is — resolves to a founder refusal
 * for an ordinary member.
 *
 * Before 2026-07-28 this file was `redirect('/labtools/journal')`, which made
 * the House's Journal doorway a disguised path into that gate. The redirect is
 * gone. /journal now renders the Journal itself.
 *
 * The implementation is shared with /labtools/journal — one view, one set of
 * APIs, two entry points. See components/journal/UnifiedJournalView.
 *
 * Guarded by lib/navigation/__tests__/journalReachability.test.ts.
 */

import { UnifiedJournalView } from '@/components/journal/UnifiedJournalView';

export default function JournalPage() {
  return <UnifiedJournalView backHref="/maia" backLabel="MAIA" />;
}
