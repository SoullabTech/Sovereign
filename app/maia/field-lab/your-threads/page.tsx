'use client';

/**
 * Your Threads — inside Field Lab.
 *
 * The exit side of the crossing: the member's authored threads, where they can
 * return, revise, and release. Released threads leave this surface (honored
 * history, never deleted, never used as current self-understanding).
 *
 * Spec: docs/specs/FIELD_LAB_CONVERSATIONAL_INTERVIEW_SPEC_2026-06-26.md
 */

import { FieldLabFrame } from '@/components/maia/field-lab/FieldLabFrame';
import { YourThreads } from '@/components/maia/field-lab/YourThreads';

export default function YourThreadsPage() {
  return (
    <FieldLabFrame
      title="Your Threads"
      status="Experimental · Yours to revise and release · Member-authored only"
      exploring="What can be authored can also be released. This is where the threads you carried live — to return to, reshape, or let go of when they no longer express what is alive in you now."
    >
      <YourThreads />
    </FieldLabFrame>
  );
}
