'use client';

/**
 * BUILD-07D — the Develop room's door.
 *
 * `?m=<manuscript>` names the Work; `&r=<reading>` names a reading by its
 * durable identity, so a reading can be returned to by link after the room
 * that showed it has closed (INV-3). Neither identity originates here.
 */

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { PRESS, SERIF } from '../pressTheme';
import { SECTION_PARAM } from '@/lib/writersStudio/placeInWork';
import DevelopRoom from './DevelopRoom';

function Body() {
  const params = useSearchParams();
  const manuscriptId = params?.get('m') ?? null;
  const readingId = params?.get('r') ?? null;
  const sectionId = params?.get(SECTION_PARAM) ?? null;

  if (!manuscriptId) {
    return (
      <p className="text-[13px] opacity-60" data-develop-missing-params>
        This room needs a Work: ?m=&lt;manuscript&gt;
      </p>
    );
  }
  return (
    <DevelopRoom
      manuscriptId={manuscriptId}
      requestedReadingId={readingId}
      requestedSectionId={sectionId}
    />
  );
}

export default function DevelopPage() {
  return (
    <main
      data-panel-role="develop"
      className="min-h-screen"
      style={{ background: PRESS.bg, color: PRESS.text, fontFamily: SERIF }}
    >
      <Suspense fallback={<p className="px-6 py-8 text-[13px] opacity-40">opening…</p>}>
        <Body />
      </Suspense>
    </main>
  );
}
