/**
 * JARVIS-KP-01 · I2 — component-scoped adoption (ACT 11A §2).
 *
 *   ADOPTION MAY CHANGE AUTHORSHIP OR STANDING ONLY WITHIN THE ADOPTER'S
 *   EPISTEMIC JURISDICTION.
 *
 * Member authority over lived meaning is strong and must not be suppressed by
 * boundary law (ACT 12A §6). It is also not jurisdiction-free: confirming a
 * sentence does not establish another person's motive, a diagnosis, a causal
 * mechanism, or a scientific claim that happened to travel inside it.
 *
 * Pure. No clock, no randomness, no I/O.
 */

import {
  MEMBER_AUTHORITATIVE_KINDS,
  type AdoptionAct,
  type AuthorityRole,
  type ComponentId,
  type ComponentKind,
  type Refusal,
  type SemanticComponent,
} from './types';

export interface AdoptionOutcome {
  readonly componentId: ComponentId;
  /** Roles whose adoption actually reached this component. */
  readonly adoptedBy: readonly AuthorityRole[];
  /** True when adoption may raise this component's standing. */
  readonly elevationPermitted: boolean;
  readonly refusals: readonly Refusal[];
}

export interface AdoptionResolution {
  readonly byComponentId: ReadonlyMap<ComponentId, AdoptionOutcome>;
  /** Refusals that belong to the adoption act rather than to one component. */
  readonly actRefusals: readonly Refusal[];
}

const refusal = (code: Refusal['code'], invariant: string, detail: string): Refusal => ({ code, invariant, detail });

/**
 * Whether an adopter in `role` holds epistemic authority over `kind`.
 *
 * A member holds authority over their own experience, meaning, values,
 * preferences, intentions, and interpretations — and over nothing else here.
 * A practitioner authors interpretation within practice. Neither reaches an
 * external motive, a diagnosis, a causal mechanism, science, history,
 * metaphysics, or a universal law (ACT 11A §2.3).
 */
export function authorityReaches(role: AuthorityRole, kind: ComponentKind): boolean {
  if (role === 'member') return MEMBER_AUTHORITATIVE_KINDS.includes(kind);
  if (role === 'practitioner') return kind === 'practitioner_interpretation';
  // MAIA and JARVIS may propose; proposing is not adopting. No agent role can
  // impersonate a human adoption act (INV-11).
  return false;
}

/**
 * Resolve which components each adoption act legitimately reached.
 *
 * Adoption provenance is checked here rather than assumed: an act that has lost
 * its original proposer or the proposition as put cannot be read as adoption at
 * all, because the record could no longer distinguish
 * `MAIA_PROPOSED -> MEMBER_CONFIRMED_WITHIN_SCOPE` from
 * `MEMBER_AUTHORED_EXTERNAL_FACT` (ACT 11A §2.5).
 */
export function resolveAdoption(
  components: readonly SemanticComponent[],
  adoptionActs: readonly AdoptionAct[],
): AdoptionResolution {
  const componentsById = new Map(components.map((c) => [c.componentId, c] as const));
  const adoptedBy = new Map<ComponentId, AuthorityRole[]>();
  const componentRefusals = new Map<ComponentId, Refusal[]>();
  const actRefusals: Refusal[] = [];

  const pushComponentRefusal = (componentId: ComponentId, entry: Refusal): void => {
    const bucket = componentRefusals.get(componentId) ?? [];
    bucket.push(entry);
    componentRefusals.set(componentId, bucket);
  };

  for (const act of adoptionActs) {
    if (!act.originalProposer.authorRef.trim() || !act.propositionAsPut.trim()) {
      actRefusals.push(
        refusal(
          'adoption_provenance_lost',
          'A11A-INV-10',
          `adoption act ${act.actId} does not preserve the original proposer and the proposition as put`,
        ),
      );
      continue;
    }

    const role = act.adopter.roleExercised;

    for (const componentId of act.adoptedComponentIds) {
      const component = componentsById.get(componentId);
      if (component === undefined) {
        actRefusals.push(
          refusal('adoption_component_unknown', 'A11A-INV-07', `adopted component ${componentId} is not in the envelope`),
        );
        continue;
      }

      if (!authorityReaches(role, component.kind)) {
        pushComponentRefusal(
          componentId,
          refusal(
            'adoption_outside_adopter_jurisdiction',
            'A11A-INV-09',
            `role "${role}" holds no authority over component kind "${component.kind}"; ` +
              'this component retains whatever standing its own warrant supports',
          ),
        );
        continue;
      }

      const roles = adoptedBy.get(componentId) ?? [];
      if (!roles.includes(role)) roles.push(role);
      adoptedBy.set(componentId, roles);
    }
  }

  const byComponentId = new Map<ComponentId, AdoptionOutcome>();
  for (const component of components) {
    const roles = adoptedBy.get(component.componentId) ?? [];
    byComponentId.set(component.componentId, {
      componentId: component.componentId,
      adoptedBy: roles,
      elevationPermitted: roles.length > 0,
      refusals: componentRefusals.get(component.componentId) ?? [],
    });
  }

  return { byComponentId, actRefusals };
}
