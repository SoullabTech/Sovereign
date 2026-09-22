/**
 * WRITER'S STUDIO — CENTRAL CAPABILITY RESOLVER
 *
 * `JARVIS-WRITERS-STUDIO-COMPLETE-01 / B0`, internal checkpoint B1.
 *
 * ⭐ Capability honesty is STRUCTURAL, not editorial. One resolver decides
 * whether an action is LIVE, PARTIAL, GATED or ABSENT, and the Studio machine
 * refuses events whose capability is not reachable. The room therefore cannot
 * render a convincing dead interface and explain afterwards that the feature is
 * disabled — an unreachable action is never offered in the first place.
 *
 * ⛔ This file confers no authority. It RECORDS standing that was established
 * elsewhere (a ratified lane, a built substrate, an absent one). Adding an entry
 * here does not make a capability live; it states what is already true.
 */

/** What the room may do with a capability. */
export type Standing =
  /** Substrate exists, is reachable, and the action is fully supported. */
  | 'live'
  /** Substrate exists but the member-facing half does not yet. Offerable only
   *  where the partial form is itself honest about what it does not do. */
  | 'partial'
  /** Substrate exists and is deliberately withheld by a governing act.
   *  ⛔ Never offered. The reason names the act. */
  | 'gated'
  /** No substrate. ⛔ Never offered, never named in a menu, never an empty state.
   *  `assertStudioMapHonest()` binds a promise about the member's book at least
   *  as hard as it binds a nav item. */
  | 'absent';

export interface Capability {
  readonly id: CapabilityId;
  readonly standing: Standing;
  /** Why it stands where it stands. For `gated` and `absent` this must name the
   *  governing act or the missing substrate — ⛔ never a vague "coming soon". */
  readonly because: string;
}

export type CapabilityId =
  | 'manuscript.read'
  | 'passage.hold'
  | 'observation.read'
  | 'observation.reasoning'
  | 'observation.challenge'
  | 'observation.teaching'
  | 'observation.standing.by-key'
  | 'observation.standing.by-id'
  | 'alternatives.offer'
  | 'alternatives.read-in-context'
  | 'revision.apply'
  | 'revision.undo'
  | 'revision.history'
  | 'coverage.display'
  | 'overlay.outline'
  | 'overlay.review'
  | 'overlay.history'
  | 'overlay.related'
  | 'structure.restructure'
  | 'source.verify'
  | 'similarity.search'
  | 'material.cluster'
  | 'idea.develop'
  | 'edition.compare';

const REGISTRY: Readonly<Record<CapabilityId, Capability>> = {
  'manuscript.read': {
    id: 'manuscript.read', standing: 'live',
    because: 'manuscript_sections + working_draft_revisions; section-addressable since WS2-05A.',
  },
  'passage.hold': {
    id: 'passage.hold', standing: 'live',
    because: 'EvidenceRef carries code-point ranges; section_addressable_at gates addressability.',
  },
  'observation.read': {
    id: 'observation.read', standing: 'live',
    because: 'developmentalTurn() over the seven lenses; freezeReading() admits the observation.',
  },
  'observation.reasoning': {
    id: 'observation.reasoning', standing: 'live',
    because: 'The reading carries its own rationale; disclosing it adds no capability.',
  },
  'observation.challenge': {
    id: 'observation.challenge', standing: 'live',
    because: 'Re-reading under a member-declared purpose. A declared purpose is not an inference.',
  },
  'observation.teaching': {
    id: 'observation.teaching', standing: 'live',
    because: 'Craft description drawn from the covered text. ⚠️ That it DESCRIBES rather than '
      + 'PRESCRIBES is UNKNOWN — REQUIRES HUMAN WITNESS (FACETS-01 §X). ⛔ Never reported proved.',
  },
  'observation.standing.by-key': {
    id: 'observation.standing.by-key', standing: 'live',
    because: 'developmental_observation_standing keyed (member_id, reading_id, observation_key). '
      + 'Ratified as AUTHORITATIVE until separately reconciled.',
  },
  'observation.standing.by-id': {
    id: 'observation.standing.by-id', standing: 'gated',
    because: '⛔ WRITERS-STUDIO-OBSERVATION-ADDRESS-01 is open. Facet implementation may not create '
      + 'member actions against observation_id until that lane closes. Use the by-key address.',
  },
  'alternatives.offer': {
    id: 'alternatives.offer', standing: 'live',
    because: 'editorialApproaches + the existing proposal chain; unranked by construction here.',
  },
  'alternatives.read-in-context': {
    id: 'alternatives.read-in-context', standing: 'live',
    because: 'editorialDiff renders a candidate against the current revision without mutating it.',
  },
  'revision.apply': {
    id: 'revision.apply', standing: 'live',
    because: 'working_draft_revisions is append-only; adoption is an explicit member act.',
  },
  'revision.undo': {
    id: 'revision.undo', standing: 'live',
    because: 'Undo appends a further revision. ⛔ It never deletes the act it reverses.',
  },
  'revision.history': {
    id: 'revision.history', standing: 'live',
    because: 'working_draft_revisions carries the full authored sequence.',
  },
  'coverage.display': {
    id: 'coverage.display', standing: 'partial',
    because: 'Coverage is COMPUTED by the reader and has NO member-facing surface yet. '
      + 'L8 makes it a law of the room, so B6 owes one. Offerable only as what was read.',
  },
  'overlay.outline': {
    id: 'overlay.outline', standing: 'live',
    because: 'WS2-08 08A authored structure; heading_depth 1..3 confirmed via the 06A path.',
  },
  'overlay.review': {
    id: 'overlay.review', standing: 'live',
    because: 'Frozen chapter-review findings across DEVELOPMENTAL_LENSES.',
  },
  'overlay.history': {
    id: 'overlay.history', standing: 'live', because: 'Same substrate as revision.history.',
  },
  'overlay.related': {
    id: 'overlay.related', standing: 'live',
    because: 'Evidence refs already bind observations to sections. ⛔ This is NOT similarity search.',
  },
  'structure.restructure': {
    id: 'structure.restructure', standing: 'absent',
    because: '⛔ WS2-08 08C (split/merge/rename) was never opened. No command anywhere splits a draft section.',
  },
  'source.verify': {
    id: 'source.verify', standing: 'absent',
    because: '⛔ No substrate. Explicitly out of WRITERS-STUDIO-CONVERGENCE-01 scope; needs its own lane.',
  },
  'similarity.search': {
    id: 'similarity.search', standing: 'absent',
    because: '⛔ No substrate. Manuscript semantic-similarity/repetition search is a later lane.',
  },
  'material.cluster': {
    id: 'material.cluster', standing: 'absent',
    because: '⛔ No substrate. Material clustering is a later lane.',
  },
  'idea.develop': {
    id: 'idea.develop', standing: 'absent',
    because: '⛔ No substrate. Idea-development intelligence is a later lane.',
  },
  'edition.compare': {
    id: 'edition.compare', standing: 'absent',
    because: '⛔ No substrate. Older-edition comparison is a later lane.',
  },
};

export function resolveCapability(id: CapabilityId): Capability {
  const found = REGISTRY[id];
  /* ⛔ Fail closed. An id the registry does not know is ABSENT, never assumed live. */
  return found ?? { id, standing: 'absent', because: 'Unknown capability. Fail-closed.' };
}

/** May the room offer an action requiring this capability at all? */
export function isOfferable(id: CapabilityId): boolean {
  const s = resolveCapability(id).standing;
  return s === 'live' || s === 'partial';
}

export function allCapabilities(): readonly Capability[] {
  return Object.values(REGISTRY);
}

/** Every capability the room must never name, in any menu, offer or empty state. */
export function unofferable(): readonly Capability[] {
  return allCapabilities().filter((c) => !isOfferable(c.id));
}
