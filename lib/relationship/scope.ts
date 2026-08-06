/**
 * Relationship scope boundaries — the executable form of the shared developmental
 * commitment architecture.
 *
 * Founder direction, 2026-08-06 (recorded in
 * `docs/design/now-what/THREE_FIELDS_AND_THE_RELATIONSHIP_2026-08-06.md`):
 *
 *   "If a feature cannot answer 'which field is this reading?' then it probably
 *    violates the architecture."
 *
 * There are four scopes and they never merge:
 *
 *   member_field           — the member's own place. Theirs alone.
 *   commitment             — the shared developmental commitment. Neither party owns it.
 *   practitioner_practice  — the practitioner's private reflection WITHIN one specific
 *                            commitment. Relationship-bound. ⛔ never directly offerable.
 *   practitioner_wisdom    — the practitioner's general body of authored understanding,
 *                            no longer about a particular person. May be offerable.
 *
 * ⭐⭐⭐ The practice→wisdom distinction is load-bearing. Relationship-bound reflection is
 * never directly offerable; wisdom may be, because the practitioner has RE-AUTHORED it
 * beyond the individual relationship. That movement is not sharing, not redaction, not
 * removing a name, not toggling visibility — it is a NEW AUTHORSHIP ACT:
 *
 *   Private practice inquiry
 *         ↓ practitioner develops / re-authors  (explicit gesture; never MAIA)
 *   Practitioner wisdom object
 *         ↓ deliberate offer
 *   Shared developmental commitment
 *
 * The original reflection remains private and unchanged. The wisdom expression is a
 * DISTINCT object whose provenance runs back to the practitioner's own inquiry — never
 * to the member's material.
 *
 * ⭐⭐ Without the fourth scope the system eventually smuggles a transformation of meaning
 * into a permission flag. The type system makes that category error impossible.
 *
 * ⭐⭐ Practitioner wisdom is AUTHORED through reflection on practice. It is never COMPUTED
 * from members. The fourth scope is not permission for cross-client analysis.
 *
 * MAIA owns none of them; it knows the boundaries. Every read declares exactly one
 * scope, and the actor must be entitled to that scope from the role they hold.
 *
 * ⛔ This module deliberately has NO storage, NO schema, and NO UI. It exists so the
 * boundary can be pinned by tests before anything is built on top of it. The
 * commitment object itself is UNBUILT — see the doc's Blockers section.
 */

/** The four scopes. A read resolves to exactly one; they never merge. */
export type ReadScope =
  | 'member_field'
  | 'commitment'
  | 'practitioner_practice'
  | 'practitioner_wisdom';

/** A role held *within* a commitment — not a global identity. */
export type Role = 'member' | 'practitioner';

/** Who is acting. MAIA is an actor for refusal purposes; it authors nothing. */
export type Actor = Role | 'maia';

/**
 * The founder's questions, as scoped queries. Each binds exactly one scope.
 * New queries must declare their scope here or they cannot be answered.
 */
export type ScopedQuery =
  /** Member: "What have I been carrying?" */
  | 'member_carrying'
  /** Practitioner: "What has become alive since our last conversation?" */
  | 'commitment_alive'
  /** Practitioner: "What have I been wondering about them?" */
  | 'practice_wondering'
  /** Practitioner: "How is my own understanding evolving through this practice?" */
  | 'wisdom_evolving';

const QUERY_SCOPE: Record<ScopedQuery, { scope: ReadScope; role: Role }> = {
  member_carrying: { scope: 'member_field', role: 'member' },
  commitment_alive: { scope: 'commitment', role: 'practitioner' },
  practice_wondering: { scope: 'practitioner_practice', role: 'practitioner' },
  wisdom_evolving: { scope: 'practitioner_wisdom', role: 'practitioner' },
};

export class ScopeViolation extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ScopeViolation';
  }
}

/**
 * Raised when code reaches for a distinction the founder has not ruled.
 * Refusing at the boundary is the point: unruled ground must not be silently built on.
 */
export class Unruled extends Error {
  constructor(message: string) {
    super(`UNRULED — ${message}`);
    this.name = 'Unruled';
  }
}

/**
 * Resolve which single scope a query reads, asserting the actor's role may ask it.
 * A practitioner cannot ask a member_field question; a member cannot ask a
 * practitioner-side question. There is no scope a caller can read "all" of.
 */
export function resolveReadScope(query: ScopedQuery, actorRole: Role): ReadScope {
  const binding = QUERY_SCOPE[query];
  if (!binding) {
    throw new ScopeViolation(`unknown query "${query}" — every read must declare its scope`);
  }
  if (binding.role !== actorRole) {
    throw new ScopeViolation(
      `${actorRole} may not ask "${query}" (bound to ${binding.role} · ${binding.scope})`,
    );
  }
  return binding.scope;
}

/**
 * Which scopes a role may read at all. A member may read the commitment (offerings,
 * programs, shared questions) but a practitioner may NEVER read `member_field` — that
 * asymmetry is the sovereignty boundary, not an oversight.
 */
const READABLE: Record<Role, readonly ReadScope[]> = {
  member: ['member_field', 'commitment'],
  practitioner: ['commitment', 'practitioner_practice', 'practitioner_wisdom'],
};

export function canRead(actorRole: Role, scope: ReadScope): boolean {
  return READABLE[actorRole].includes(scope);
}

/**
 * Does this scope require a single commitment context to be meaningful?
 * `practitioner_practice` is relationship-bound; `practitioner_wisdom` must NOT be, or
 * it is still practice wearing a different label.
 */
export function requiresCommitmentContext(scope: ReadScope): boolean {
  return scope === 'commitment' || scope === 'practitioner_practice';
}

// ─────────────────────────────────────────────────────────────────────────────
// Practitioner-authored objects: practice reflection vs wisdom
// ─────────────────────────────────────────────────────────────────────────────

/** Larry's private reflection about one commitment. Never directly offerable. */
export interface PracticeReflection {
  scope: 'practitioner_practice';
  id: string;
  /** Required: a practice reflection without a commitment context is incoherent. */
  commitmentId: string;
  body: string;
  /** Whether identifying details have been stripped. ⛔ Irrelevant to offerability. */
  identifiersRemoved?: boolean;
}

/** Larry's re-authored understanding. Not about a particular person. */
export interface WisdomObject {
  scope: 'practitioner_wisdom';
  id: string;
  body: string;
  /**
   * Provenance runs to the practitioner's OWN inquiry, never to the member's material.
   * Optional: wisdom may also be authored from nothing but the practitioner's thought.
   */
  authoredFromReflectionId?: string;
  /** The explicit gesture that created it. Absent = not a wisdom object. */
  authorshipGesture: PractitionerAuthorshipGesture;
}

/**
 * The deliberate act by which a practitioner re-authors private inquiry into wisdom.
 * ⛔ There is no automatic, inferred, or assisted variant.
 */
export interface PractitionerAuthorshipGesture {
  kind: 'develop_into_wisdom';
  /** Must be the practitioner. MAIA may never perform this. */
  by: Actor;
}

export type PractitionerObject = PracticeReflection | WisdomObject;

/**
 * May this practitioner-authored object be offered into a commitment?
 *
 * ⛔⛔ A relationship-bound reflection is NEVER directly offerable — offering it would
 * hand the member the practitioner's assessment of them. Only a re-authored wisdom
 * object is eligible, and eligibility is not the offer itself.
 */
export function isOfferable(object: PractitionerObject): boolean {
  return object.scope === 'practitioner_wisdom';
}

/**
 * Re-author a private reflection into a wisdom object.
 *
 * Returns a NEW object. ⛔ Never mutates the source — the original reflection remains
 * private and unchanged, and remains non-offerable afterwards.
 */
export function developIntoWisdom(
  source: PracticeReflection,
  reAuthoredBody: string,
  gesture: PractitionerAuthorshipGesture,
  newId: string,
): WisdomObject {
  if (gesture?.kind !== 'develop_into_wisdom') {
    throw new ScopeViolation(
      'practice → wisdom requires an explicit practitioner authorship gesture',
    );
  }
  if (gesture.by !== 'practitioner') {
    throw new ScopeViolation(
      `only the practitioner may re-author their inquiry into wisdom (got "${gesture.by}") — ` +
        'wisdom is authored through reflection on practice, never computed',
    );
  }
  // ⚠️ MINIMUM GESTURE TEST — not proof of substantive authorship.
  // This check can only prove DIFFERENCE, never genuine re-authoring: a one-character
  // mutation passes it. That is an honest technical floor, and the function does not
  // claim semantic proof. Substantive re-authorship is the practitioner's responsibility
  // and is not machine-checkable; ⛔ do not let a future caller read a pass here as a
  // system attestation that the material is genuinely no longer about a person.
  if (!reAuthoredBody || reAuthoredBody === source.body) {
    throw new ScopeViolation(
      're-authoring must produce new text — copying the reflection is not authorship',
    );
  }
  return {
    scope: 'practitioner_wisdom',
    id: newId,
    body: reAuthoredBody,
    authoredFromReflectionId: source.id,
    authorshipGesture: gesture,
  };
}

/**
 * Strip identifying details from a reflection.
 *
 * ⛔⛔ This does NOT convert practice into wisdom. De-identification is a redaction;
 * re-authoring is an authorship act. The result is still `practitioner_practice`, still
 * commitment-bound, still not offerable. Provided explicitly so the distinction is
 * testable rather than assumed.
 */
export function removeIdentifiers(reflection: PracticeReflection): PracticeReflection {
  return { ...reflection, identifiersRemoved: true };
}

/**
 * May a wisdom object carry member material?
 *
 * ⛔⛔ Not ruled. Citing or exposing a member's material inside practitioner wisdom
 * requires a provenance mechanism that does not exist and has not been decided.
 */
export function wisdomMayCiteMemberMaterial(): never {
  throw new Unruled(
    'practitioner wisdom citing member material requires a ruled provenance mechanism — see ' +
      'docs/design/now-what/THREE_FIELDS_AND_THE_RELATIONSHIP_2026-08-06.md §7',
  );
}

/**
 * ⭐⭐⭐ SYSTEM-INITIATED DRAW — may the system retrieve or derive material held in
 * `from` for use in `into`, with **no person's gesture involved**?
 *
 * ⛔ This is NOT the question "may this material end up there." A person-authored
 * crossing (`admitsToCommitment`) may legitimately permit a movement this function
 * forbids — a member declaring their own question into the commitment is exactly that.
 * The two operations are different acts and are allowed to differ; see
 * `admitsToCommitment` for the person-initiated counterpart.
 *
 * ⛔⛔ Nothing is ever drawn from `member_field`: it is a sovereign space that the system
 * may not read across into any other scope. Only the member's own gesture moves material
 * out of it, and that path is a crossing, not a draw.
 */
export function maySystemDraw(into: ReadScope, from: ReadScope): boolean {
  if (into === 'member_field') return from === 'member_field';
  if (from === 'member_field') return false;
  if (into === 'practitioner_wisdom')
    return from === 'practitioner_practice' || from === 'practitioner_wisdom';
  if (into === 'practitioner_practice') return from === 'practitioner_practice';
  if (into === 'commitment') return from !== 'practitioner_practice';
  return false;
}

// ─────────────────────────────────────────────────────────────────────────────
// Crossing into the commitment: declarations only, never observations
// ─────────────────────────────────────────────────────────────────────────────

/**
 * How an item came to be known.
 *
 *   declared — a person performed an act aimed at the commitment
 *   observed — the system noticed something about a person
 *
 * ⭐ Only `declared` may cross. "She returned twice" is observed; "the question she
 * chose to carry into our work" is declared. The two look alike in a mockup and are
 * opposite in kind.
 */
export type CrossingBasis = 'declared' | 'observed';

/**
 * ⭐⭐⭐ PERSON-INITIATED CROSSING — a person deliberately carries, declares, places, or
 * offers material across a boundary. Distinct from `maySystemDraw`, which covers
 * system-initiated retrieval with no gesture behind it.
 *
 * A crossing must answer BOTH questions, never just one:
 *   1. who is initiating the act?          → `declaredBy`
 *   2. what relationship does the material  → `sourceScope`
 *      already belong to?
 *
 * ⛔⛔ A person's gesture does not erase source scope. Declaring something does not
 * re-author it, and initiating authority is not the same as owning the material.
 */
export interface PersonCrossing {
  /**
   * The scope the material ALREADY belongs to. Required: a crossing evaluated without
   * provenance can admit material the rest of the architecture forbids.
   */
  sourceScope: ReadScope;
  /** What kind of act produced this. */
  basis: CrossingBasis;
  /** Who performed the declaring act, if any. */
  declaredBy?: Role;
  /**
   * True only for a member's private carrying act (a Keep). A Keep says "I want to
   * carry this"; a share says "I want US to carry this." They are different human acts.
   */
  isPrivateCarry?: boolean;
}

/**
 * Which source scopes a given person may declare INTO the commitment.
 * A person may only carry across material that is already theirs.
 */
const CROSSING_SOURCES: Record<Role, readonly ReadScope[]> = {
  // The member's own field. ⛔ The practitioner may never declare the member's material.
  member: ['member_field'],
  // ⛔⛔ practitioner_practice is absent by construction: relationship-bound reflection
  // never crosses, no matter who declares it. Only re-authored wisdom may.
  practitioner: ['practitioner_wisdom'],
};

/**
 * May this item enter the shared commitment?
 *
 * ⛔⛔ A Keep never crosses on its own. Declaring a kept thing into the commitment is a
 * second, separate consent event — the crossing IS the consent event. Merging them
 * would make every private act implicitly social, and people self-censor when that is
 * true. (`can_be_shown_to_practitioner` is the existing flag that holds this line.)
 *
 * ⛔⛔ A practitioner declaring their own private practice reflection is REFUSED here,
 * exactly as `isOfferable` and `maySystemDraw` refuse it. The three functions must never
 * disagree about the same act.
 */
export function admitsToCommitment(crossing: PersonCrossing): boolean {
  if (crossing.basis !== 'declared') return false;
  if (crossing.isPrivateCarry) return false;
  const declarer = crossing.declaredBy;
  if (declarer !== 'member' && declarer !== 'practitioner') return false;
  return CROSSING_SOURCES[declarer].includes(crossing.sourceScope);
}

// ─────────────────────────────────────────────────────────────────────────────
// The verb rule: contribution, never editing
// ─────────────────────────────────────────────────────────────────────────────

/** Member-authored rooms a practitioner may perceive through the commitment. */
export type MemberObject = 'my_question' | 'my_work' | 'my_story' | 'my_coaching';

export type PractitionerVerb =
  | 'reflect'
  | 'offer_question'
  | 'offer_observation'
  | 'offer_encouragement'
  | 'attach_resource'
  | 'suggest_practice'
  | 'ask_about'
  | 'bring_to_session'
  | 'prepare'
  | 'schedule'
  | 'place_program'
  | 'private_reflection'
  | 'develop_into_wisdom'
  | 'offer'
  /** A first-class option, not the absence of one. */
  | 'do_nothing'
  /** Never permitted on a member-authored object, in any room. */
  | 'edit';

const PRACTITIONER_VERBS: Record<MemberObject, readonly PractitionerVerb[]> = {
  my_question: ['reflect', 'offer_question', 'attach_resource', 'bring_to_session', 'do_nothing'],
  my_work: ['offer_encouragement', 'suggest_practice', 'ask_about', 'do_nothing'],
  my_story: ['private_reflection', 'offer_observation', 'ask_about', 'do_nothing'],
  // The bridge room — it exists for practitioner contribution.
  my_coaching: [
    'schedule',
    'place_program',
    'attach_resource',
    'prepare',
    'offer_question',
    'reflect',
    'do_nothing',
  ],
};

/**
 * May the practitioner perform this verb on this member-authored object?
 * Authority attaches to the verb, not to visibility: seeing Maya's question does not
 * grant a write path to it. `edit` is absent from every list by construction.
 */
export function practitionerMay(object: MemberObject, verb: PractitionerVerb): boolean {
  return PRACTITIONER_VERBS[object]?.includes(verb) ?? false;
}

/** Every object must offer "do nothing" — a surface offering only actions manufactures intervention. */
export function offersDoNothing(object: MemberObject): boolean {
  return practitionerMay(object, 'do_nothing');
}

/**
 * What the practitioner may do with their OWN authored object. "Do nothing" is present
 * on both sides of the transformation: leaving an inquiry unworked is a legitimate
 * outcome, and so is never offering a wisdom object.
 */
export function optionsForOwnObject(object: PractitionerObject): readonly PractitionerVerb[] {
  return object.scope === 'practitioner_practice'
    ? ['private_reflection', 'develop_into_wisdom', 'do_nothing']
    : ['offer', 'private_reflection', 'do_nothing'];
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIA relationship awareness — UNRULED, refuses at the boundary
// ─────────────────────────────────────────────────────────────────────────────

export type AwarenessClass =
  /** State of an object the practitioner themselves authored (e.g. their unopened offering). */
  | 'own_offering_state'
  /** Requires the member's declaring act (e.g. "this became part of her work"). */
  | 'member_declared_uptake'
  /** A pattern claim about a person, delivered to a third party. */
  | 'member_pattern_claim';

/**
 * Whether MAIA may surface an awareness item to the practitioner.
 *
 * ⛔⛔ Not ruled. Every class throws until the founder rules the table in the doc's
 * "MAIA's relationship awareness" section. "Not as alerts, as relationship awareness"
 * governs tone; it does not settle admissibility. This refusal is a HOLD, not a final
 * disposition.
 */
export function mayaSurfaceAwareness(cls: AwarenessClass): never {
  throw new Unruled(
    `MAIA awareness class "${cls}" is not ruled — see ` +
      `docs/design/now-what/THREE_FIELDS_AND_THE_RELATIONSHIP_2026-08-06.md §7`,
  );
}
