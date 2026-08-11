'use client';

/**
 * Journal Room — Slice 1.
 *
 * The first implementation built from the approved Journal experiential
 * reference. Additive by ruling (founder, 2026-08-10): `/journal` continues to
 * serve UnifiedJournalView untouched, and whether this room takes `/journal` is
 * a separate ruling, deliberately not decided inside Slice 1.
 *
 * IMPLEMENTATION LINEAGE: NEW — begins with this commit. No prior Journal code
 * lineage was recoverable from committed refs, worktrees, or in-repo design
 * studies; this is a build from the durable experiential reference, NOT a
 * restoration, recovery, or reinstatement of previous code.
 *
 * @see docs/design/references/JOURNAL_EXPERIENTIAL_REFERENCE_2026-08-10.md
 * @see docs/design/references/JOURNAL_SLICE1_IMPLEMENTATION_CONTRACT.md
 * @see docs/design/contracts/journal-room.md
 */

import { JournalRoom } from '@/components/journal/room/JournalRoom';

export default function JournalRoomPage() {
  return <JournalRoom />;
}
