'use client';

/**
 * Now What? — the room. Isolated reference embodiment (founder direction
 * 2026-07-06): the client experience lives in its own namespace
 * (app/now-what/*, /api/now-what/*) and does not modify framework surfaces.
 * The workshop loop here may earn its way into the shared architecture
 * through observation, not by direct integration.
 *
 * Query params:
 *   phase        — Spiralogic arc phase for the guided conversation (default fire_1)
 *   fieldContext — opaque field identifier (drives return detection + facilitator grouping)
 *   program      — program door within the field (catalog spec: the retreat link
 *                  carries the retreat door). Scopes the position block only;
 *                  the whole field stays composed either way.
 *   entry        — which Home door the member came through (question | cultivate |
 *                  prepare | think). Frames the arrival; never seeds content.
 *   thread       — opaque thread id for entry=question (the member's own carried
 *                  question, resolved member-scoped — the text never rides the URL).
 *   dimension    — flourishing dimension slug for entry=cultivate (static copy only).
 */

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { NowWhatRoom } from '@/components/now-what/NowWhatRoom';
import { NowWhatShell, NowWhatThreshold, useMemberSession } from '@/components/now-what/NowWhatShell';

function NowWhatRoomInner() {
  const params = useSearchParams();
  const phase = params?.get('phase') ?? 'fire_1';
  const fieldContext = params?.get('fieldContext') ?? undefined;
  const program = params?.get('program') ?? undefined;
  const entry = params?.get('entry') ?? undefined;
  const entryThread = params?.get('thread') ?? undefined;
  const entryDimension = params?.get('dimension') ?? undefined;
  // Session fact only (shell rider 2): signed in before, or not.
  const session = useMemberSession();

  return (
    <div className="min-h-screen bg-[#1f1b16] text-slate-200">
      {session === 'out' && (
        // The threshold: sign-in met at the door, in the field's register —
        // not as a red API error inside a room that half-opened.
        <NowWhatThreshold
          roomName="The Room"
          line="Sit with MAIA. Bring the actual thing — work with it until a next real step appears."
          fieldContext={fieldContext}
        />
      )}
      {session === 'in' && (
        <>
          {/* Shell recedes mid-session (quiet): the room stays a room. */}
          <NowWhatShell current="The Room" fieldContext={fieldContext} variant="quiet" />
          <NowWhatRoom
            phase={phase}
            fieldContext={fieldContext}
            program={program}
            entry={entry}
            entryThread={entryThread}
            entryDimension={entryDimension}
          />
        </>
      )}
    </div>
  );
}

export default function NowWhatRoomPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#1f1b16] flex items-center justify-center">
        <p className="text-slate-500 text-sm font-light">Opening the room…</p>
      </div>
    }>
      <NowWhatRoomInner />
    </Suspense>
  );
}
