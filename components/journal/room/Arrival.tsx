'use client';

/**
 * Journal Room — State 1: Arrival.
 *
 * Approved reference:
 *   JOURNAL · What is here today? · Begin writing · Or note something
 *   member writing before organization · Browse secondary
 *
 * MUST NOT appear here (contract §4 state 1): search · filters · category tabs ·
 * entry counts · streaks · stats · card grid · date pickers · MAIA.
 *
 * Every element below traces to the reference or to navigation necessity
 * (Work Unit §13). Nothing is here "because the existing component had it."
 */

import { type, color, space, focus, motion, hit, hitStack, quiet, spine, roomMaterial } from './tokens';
import { Return, type ReturnPiece } from './Return';

export interface ArrivalProps {
  onBeginWriting: () => void;
  onNoteSomething: () => void;
  onBrowse: () => void;
  /** The single older piece, or null when there is nothing to return to. */
  returnPiece: ReturnPiece | null;
  onOpenReturn: (entryId: string) => void;
  /** False until the member's entries have loaded — avoids a flash of "nothing". */
  ready: boolean;
}

export function Arrival({
  onBeginWriting,
  onNoteSomething,
  onBrowse,
  returnPiece,
  onOpenReturn,
  ready,
}: ArrivalProps) {
  return (
    <main
      className={`min-h-[100dvh] ${color.field} ${space.room} flex flex-col`}
      style={roomMaterial as React.CSSProperties}
      aria-labelledby="journal-question"
    >
      {/* Room marker. Small, quiet — orients without explaining. On the spine,
          so it belongs to the same composition as the writing. */}
      <div className={`${spine} pt-8 sm:pt-10 ${type.marker} ${color.muted}`}>Journal</div>

      {/* The question is the largest thing in the room, and most of the
          viewport stays empty. Nothingness is allowed. */}
      <div className={`flex-1 flex flex-col justify-center ${spine} py-16`}>
        <h1 id="journal-question" className={`${type.question} ${color.human}`}>
          What is here today?
        </h1>

        <div className={space.breathing}>
          <button
            type="button"
            onClick={onBeginWriting}
            className={`${type.writing} ${color.accent} ${focus} ${hitStack} text-left ${quiet}`}
          >
            Begin writing
          </button>

          <button
            type="button"
            onClick={onNoteSomething}
            className={`mt-3 ${type.meta} ${color.secondary} ${focus} ${hitStack} text-left ${quiet}`}
          >
            Or note something
          </button>
        </div>

        {/* Return — one actual older piece, on the arrival surface, beneath the
            writing invitation so writing stays primary. */}
        {ready && returnPiece && (
          <div className={`${motion} mt-16 sm:mt-20`}>
            <Return piece={returnPiece} onOpen={onOpenReturn} />
          </div>
        )}
      </div>

      {/* Browse is tertiary and visually recessive — the reference makes it
          secondary to writing, never a navigation bar. */}
      <div className={`${spine} pb-10 sm:pb-12`}>
        <button
          type="button"
          onClick={onBrowse}
          className={`${type.meta} ${color.muted} ${focus} ${hit} ${quiet}`}
        >
          Browse
        </button>
      </div>
    </main>
  );
}
