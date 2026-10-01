import type {
  CrystallizedMemory,
  MemberResponseStatus,
  MemoryAtomStatus,
  ReturnPreference,
} from '@/lib/psyche/types';
import type { MemoryScope } from '@/lib/maia/memoryAtomsLoader';

export const CABIN_MEMORY_PROJECTION_SCHEMA =
  'soullab.cabin.memory-reference.v1' as const;

export type CabinMemoryCandidate = CrystallizedMemory & {
  memoryScope: MemoryScope;
};

export type CabinMemoryRecallStanding =
  | 'member_pulled'
  | 'contextual_doorway'
  | 'ritual_review_opt_in'
  | 'blocked';

export type CabinMemoryProjection = {
  schema: typeof CABIN_MEMORY_PROJECTION_SCHEMA;
  source: {
    kind: 'member_memory_atoms';
    id: string;
    sourceType: CrystallizedMemory['sourceType'];
    sourceId: string | null;
    keptAt: string;
  };
  permission: {
    scope: 'member';
    basis: 'member_kept' | 'member_confirmed_observation';
  };
  memory: {
    id: string;
    title: string;
    body: string | null;
    sourceType: CrystallizedMemory['sourceType'];
    sourceId: string | null;
    primaryRegister: CrystallizedMemory['primaryRegister'];
    registers: string[];
    elementalLenses: string[];
    status: MemoryAtomStatus;
    returnPreference: ReturnPreference;
    keptAt: string;
  };
  recall: {
    standing: CabinMemoryRecallStanding;
    basis: 'return_preference' | 'status' | 'sacred_protected';
  };
};

function recallStanding(
  status: MemoryAtomStatus,
  returnPreference: ReturnPreference,
  registers: string[],
): CabinMemoryProjection['recall'] {
  if (status === 'protected' || status === 'archived' || status === 'set_aside') {
    return { standing: 'blocked', basis: 'status' };
  }

  if (registers.includes('sacred_protected')) {
    return { standing: 'blocked', basis: 'sacred_protected' };
  }

  return {
    standing: returnPreference,
    basis: 'return_preference',
  };
}

function observationAccepted(
  sourceType: CrystallizedMemory['sourceType'],
  response: MemberResponseStatus | null,
): boolean {
  if (sourceType !== 'practitioner_observation') return true;
  return response === 'confirmed' || response === 'modified';
}

/**
 * Project one personal member-memory atom into a portable Cabin reference.
 *
 * Storage eligibility and recall eligibility are intentionally separate.
 * member_pulled material may remain in the member's Cabin without becoming
 * ambient MAIA context; protected/archived/set-aside material remains present
 * as record but is recall-blocked.
 */
export function projectMemoryForCabin(
  candidate: CabinMemoryCandidate,
): CabinMemoryProjection | null {
  if (candidate.memoryScope !== 'personal') return null;
  if (!candidate.memberId || !candidate.id) return null;
  if (candidate.memberResponseStatus === 'rejected') return null;
  if (!observationAccepted(candidate.sourceType, candidate.memberResponseStatus)) {
    return null;
  }
  if (candidate.reverberationGuard.crossingAllowed !== false) return null;

  const recall = recallStanding(
    candidate.status,
    candidate.returnPreference,
    candidate.registers,
  );

  return {
    schema: CABIN_MEMORY_PROJECTION_SCHEMA,
    source: {
      kind: 'member_memory_atoms',
      id: candidate.id,
      sourceType: candidate.sourceType,
      sourceId: candidate.sourceId,
      keptAt: candidate.keptAt,
    },
    permission: {
      scope: 'member',
      basis:
        candidate.sourceType === 'practitioner_observation'
          ? 'member_confirmed_observation'
          : 'member_kept',
    },
    memory: {
      id: candidate.id,
      title: candidate.title,
      // Source-backed atoms keep their native source content out of the
      // projection. Spontaneous atoms are the member-authored content channel.
      body: candidate.sourceType === 'spontaneous' ? candidate.body : null,
      sourceType: candidate.sourceType,
      sourceId: candidate.sourceId,
      primaryRegister: candidate.primaryRegister,
      registers: [...candidate.registers],
      elementalLenses: [...candidate.elementalLenses],
      status: candidate.status,
      returnPreference: candidate.returnPreference,
      keptAt: candidate.keptAt,
    },
    recall,
  };
}

export function serializeCabinMemoryProjection(
  projection: CabinMemoryProjection,
): string {
  return JSON.stringify(projection);
}
