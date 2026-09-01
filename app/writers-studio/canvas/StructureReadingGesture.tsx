'use client';

/**
 * WS2-05½ — the member asks MAIA to read the Work.
 *
 * IT LIVES IN THE STRUCTURE DRAWER, AND THE READING LIVES ELSEWHERE. The
 * distinction is experiential and deliberate:
 *
 *   Canvas            I am working on my book.
 *   Structure drawer  I want another perspective on its shape.
 *   Structure Review  I am considering MAIA's reading.
 *
 * Turning the Canvas into a review surface would collapse the middle one.
 *
 * ONE GESTURE, ONE ARRIVAL. There is no second "view the reading" button after
 * success. Asking for the reading already expressed the intent; arriving at it
 * is the completion of that act, not a separate decision.
 *
 * THE BOUNDARY IS SAID BEFORE THE MODEL RUNS, not after. "Nothing changes until
 * you decide" is on the screen while the member is still deciding whether to
 * ask — which is the only moment it can inform anything.
 *
 * ACCENT WOULD INVERT THE HIERARCHY. The first walk drew this in PRESS.accent
 * and the gold made MAIA's offer the brightest thing in the drawer — brighter
 * than "14 sections, carried in with your import," which is the member's own
 * authored fact. In this room accent marks live state (the active tab, the
 * drafting line), and spending it here would say the machine's offer is the
 * event. It is not. The invitation sits as a peer of "Read them in the Source":
 * findable, not first.
 *
 * A FAILURE IS NOT A READING. On failure this stays in the drawer, renders no
 * proposal card, invents no interpretation, and does not navigate. "MAIA
 * couldn't complete the reading" and "MAIA found no structure" are different
 * facts about a person's book, and only one of them is about the book.
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { requestStructureReading } from '@/lib/writersStudio/reviewClient';

export default function StructureReadingGesture({ manuscriptId }: { manuscriptId: string }) {
  const router = useRouter();
  const [reading, setReading] = useState(false);
  const [failed, setFailed] = useState(false);

  const ask = async () => {
    setReading(true);
    setFailed(false);
    const outcome = await requestStructureReading(manuscriptId);
    if (outcome.ok) {
      /* Straight through to the reading. Deliberately no setReading(false)
         first: the button must not flicker back to its resting state during
         the navigation, as though the asking had come to nothing. */
      router.push(outcome.reviewPath);
      return;
    }
    setReading(false);
    setFailed(true);
  };

  return (
    <div className="mt-4">
      <button
        disabled={reading}
        onClick={() => void ask()}
        className="text-[13px] underline underline-offset-4 opacity-80 hover:opacity-100 disabled:opacity-45 disabled:no-underline"
      >
        {reading ? 'MAIA is reading…' : 'Ask MAIA to read the structure'}
      </button>

      <p className="mt-2 text-[12.5px] leading-relaxed opacity-55">
        MAIA will bring back a reading of how the work seems to be organized.
        Nothing changes until you decide.
      </p>

      {failed && (
        <p className="mt-2 text-[12.5px] leading-relaxed opacity-70">
          MAIA couldn’t complete the reading. Your work hasn’t changed.
        </p>
      )}
    </div>
  );
}
