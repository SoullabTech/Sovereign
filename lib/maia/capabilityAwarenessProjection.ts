/**
 * Capability Awareness Projection — O4R1.
 *
 * Pure reduction from the full authority descriptor into the minimum
 * non-operational awareness record authorized by O4.
 *
 * This module imports TYPES ONLY. It does not import the registry value,
 * member context, access rules, routes, voice, cognition events, or UI.
 */
import type {
  ArchitecturalSpecies,
  AuthorityGateStanding,
  CapabilityAuthorityDescriptor,
  CapabilityAuthorityId,
  CapabilityLifecycle,
  ResearchDependency,
} from './capabilityAuthorityRegistry';

export interface CapabilityAwarenessRecord {
  readonly id: CapabilityAuthorityId;
  readonly domain: string;
  readonly humanMovement: string;
  readonly species: ArchitecturalSpecies;
  readonly lifecycle: CapabilityLifecycle;
  readonly authorityGateStanding: AuthorityGateStanding;
  readonly researchDependency: ResearchDependency;
}

/**
 * Project descriptive awareness only.
 *
 * No filtering, ranking, availability inference, labeling, aliasing, member
 * context, I/O, or authority evaluation occurs here.
 */
export function projectCapabilityAwareness(
  registry: readonly CapabilityAuthorityDescriptor[],
): readonly CapabilityAwarenessRecord[] {
  return registry.map((descriptor) => ({
    id: descriptor.id,
    domain: descriptor.domain,
    humanMovement: descriptor.humanMovement,
    species: descriptor.species,
    lifecycle: descriptor.lifecycle,
    authorityGateStanding: descriptor.authorityGateStanding,
    researchDependency: descriptor.researchDependency,
  }));
}
