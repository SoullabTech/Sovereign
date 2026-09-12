'use client';

/**
 * THE FOCUS SET, as the writer meets it.
 *
 *   FOCUS · recurrence · from a reading of version 7
 *
 *   §45  ┐
 *   §56  │   five places
 *   §57  │   active target — none yet
 *   §58  │
 *   §62  ┘
 *
 * ⭐ U4 MADE VISIBLE. Five places are declared; none of them is the edit
 * target until the writer says which. The panel's most important sentence is
 * the one it says before they choose: "no place chosen yet — click one".
 *
 * ⛔ THIS PANEL PERFORMS NO ACT ON THE WORK. It navigates nothing, fetches
 * nothing, calls no model and changes no text. Choosing a member sets local
 * state and nothing else. Ask MAIA is deliberately ABSENT here: that crossing
 * is `/api/writers-studio/focus`, it is a different boundary with its own
 * consent architecture, and collapsing the two would let a navigation acquire
 * a crossing's authority by sitting next to it.
 *
 * ⛔ IT DOES NOT REPAIR A MEMBER. A stale or missing place is reported in the
 * writer's language and left alone. The panel has no "fix" control because the
 * system has no standing to decide where a moved passage went.
 */

import { useState } from 'react';
import { PRESS } from '../pressTheme';
import {
  MEMBER_STATE_NOTE, activeMember, withActive,
  type FocusMember, type FocusSet,
} from './focusSet';

const STATE_TONE: Record<FocusMember['state'], number> = {
  current: 1, unverified: 0.75, stale: 0.5, gone: 0.4,
};

function memberName(m: FocusMember): string {
  const where = m.position === null ? 'a section no longer here' : `Section ${m.position}`;
  const named = m.heading ? `${where} · “${m.heading}”` : where;
  return m.anchor.kind === 'passage' ? `${named}, a passage` : named;
}

export default function FocusSetPanel({
  set, onSet, onRelease,
}: {
  set: FocusSet;
  onSet: (next: FocusSet) => void;
  onRelease: () => void;
}) {
  const [openNotes, setOpenNotes] = useState(false);
  const active = activeMember(set);
  const usable = set.members.filter((m) => m.focus !== null).length;
  const unsure = set.members.filter((m) => m.state !== 'current').length;

  return (
    <section
      data-focus-set
      data-focus-set-active={set.activeIndex === null ? 'none' : String(set.activeIndex)}
      className="border-t px-5 py-3 text-[12.5px]"
      style={{ borderColor: PRESS.ruleSoft }}
    >
      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
        <span className="uppercase tracking-[0.18em] text-[10.5px]" style={{ color: PRESS.accent }}>
          Focus
        </span>
        <span className="opacity-80">{set.label}</span>
        <span className="opacity-50">
          {set.members.length} {set.members.length === 1 ? 'place' : 'places'}
        </span>
        {/* ⭐ The U4 sentence. It says NONE until the writer says otherwise. */}
        <span className="opacity-60" data-focus-set-target>
          {active
            ? `working on ${memberName(active)}`
            : 'no place chosen yet — click one to work on it'}
        </span>
        <button
          type="button"
          onClick={onRelease}
          data-focus-set-release
          className="ml-auto uppercase tracking-[0.15em] text-[10.5px] opacity-55 hover:opacity-90"
        >
          Release
        </button>
      </div>

      <ol className="mt-2 flex flex-wrap gap-2">
        {set.members.map((m, i) => {
          const chosen = set.activeIndex === i;
          const usableMember = m.focus !== null;
          return (
            <li key={`${m.anchor.sectionId}-${i}`}>
              <button
                type="button"
                disabled={!usableMember}
                aria-pressed={chosen}
                data-focus-member={String(i)}
                data-focus-member-state={m.state}
                onClick={() => onSet(withActive(set, chosen ? null : i))}
                title={MEMBER_STATE_NOTE[m.state]}
                className="border px-2 py-1 rounded-sm"
                style={{
                  borderColor: chosen ? PRESS.accent : PRESS.ruleSoft,
                  opacity: STATE_TONE[m.state],
                  cursor: usableMember ? 'pointer' : 'not-allowed',
                }}
              >
                {memberName(m)}
                {m.state !== 'current' && <span className="ml-1 opacity-70">·</span>}
              </button>
            </li>
          );
        })}
      </ol>

      {unsure > 0 && (
        <div className="mt-2">
          <button
            type="button"
            onClick={() => setOpenNotes((v) => !v)}
            aria-expanded={openNotes}
            data-focus-set-notes
            className="uppercase tracking-[0.15em] text-[10.5px] opacity-55 underline underline-offset-4"
          >
            {unsure} of {set.members.length} cannot be vouched for
          </button>
          {openNotes && (
            <ul className="mt-1 list-disc pl-4 opacity-60">
              {set.members.map((m, i) => (m.state === 'current' ? null : (
                <li key={i}>
                  {memberName(m)} — {MEMBER_STATE_NOTE[m.state]}
                </li>
              )))}
            </ul>
          )}
        </div>
      )}

      {usable === 0 && (
        <p className="mt-2 opacity-60">
          None of the places this finding rests on can be shown in the work as it is now.
          The finding is still true about the version it read.
        </p>
      )}
    </section>
  );
}

/** What the room says when it was sent an origin it cannot make sense of. */
export function FocusSetRefused({ why, onRelease }: { why: string; onRelease: () => void }) {
  return (
    <section
      data-focus-set-refused
      className="border-t px-5 py-3 text-[12.5px] opacity-70"
      style={{ borderColor: PRESS.ruleSoft }}
    >
      A finding was sent here from a reading, but {why}. Nothing has been framed, and your
      work is unchanged.{' '}
      <button type="button" onClick={onRelease} className="underline underline-offset-4">
        Dismiss
      </button>
    </section>
  );
}
