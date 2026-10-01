import {
  currentCabinContextRuntime,
} from './contextRuntime';
import type { CabinContextPackage } from './contextPackage';

export const CABIN_EXPERIENCE_CONTEXT_SCHEMA =
  'soullab.cabin.experience-context.v1' as const;

export type CabinExperienceAvailability = 'present' | 'empty';

export type CabinExperienceContext = {
  schema: typeof CABIN_EXPERIENCE_CONTEXT_SCHEMA;
  source: {
    kind: 'cabin-mounted';
  };
  state: 'unavailable' | 'empty' | 'mounted';
  availability: {
    work: CabinExperienceAvailability;
    relationship: CabinExperienceAvailability;
    memory: CabinExperienceAvailability;
  };
  work: CabinContextPackage['works'];
  relationships: CabinContextPackage['relationships'];
  memories: CabinContextPackage['memories'];
};

function availability(
  values: readonly unknown[],
): CabinExperienceAvailability {
  return values.length > 0 ? 'present' : 'empty';
}

/**
 * Read the currently mounted Cabin continuity field for a server-side
 * experience.
 *
 * This is deliberately a shape-preserving bridge. It does not fetch the
 * artifact, query the database, or interpret the references.
 */
export function readCabinExperienceContext(): CabinExperienceContext {
  const runtime = currentCabinContextRuntime();

  if (!runtime) {
    return {
      schema: CABIN_EXPERIENCE_CONTEXT_SCHEMA,
      source: { kind: 'cabin-mounted' },
      state: 'unavailable',
      availability: {
        work: 'empty',
        relationship: 'empty',
        memory: 'empty',
      },
      work: [],
      relationships: [],
      memories: [],
    };
  }

  const packageValue = runtime.package;

  return {
    schema: CABIN_EXPERIENCE_CONTEXT_SCHEMA,
    source: { kind: 'cabin-mounted' },
    state: runtime.state,
    availability: {
      work: availability(packageValue.works),
      relationship: availability(packageValue.relationships),
      memory: availability(packageValue.memories),
    },
    work: packageValue.works,
    relationships: packageValue.relationships,
    memories: packageValue.memories,
  };
}
