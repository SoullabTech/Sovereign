/**
 * Practice Field Types
 *
 * Practitioner-authored expression layer.
 * MAIA receives context — not instructions.
 * Constitutional behavior is invariant across all Practice Fields.
 *
 * Spec: docs/specs/PRACTICE_FIELD_SPEC.md
 */

export type PracticeFieldStatus = 'pending' | 'warning' | 'live';

/**
 * Governance containment — "may this go live?", independent of readiness.
 * Design + durable record: docs/design/practitioner-portal/GOVERNANCE_CONTAINMENT_2026-08-09.md
 */
export type ContainmentStatus = 'none' | 'contained';

/**
 * WHOSE act imposed the containment — and therefore whose act may lift it.
 *
 *   'holder'     — "I am withholding my own field." The field holder imposed it;
 *                  the field holder may release it. Entering carries leaving,
 *                  because the act was their own.
 *   'governance' — "This field is prohibited from going live pending a governance
 *                  decision." Imposed by an authority other than the holder. The
 *                  subject of a governance containment may NEVER release it
 *                  (GC-4); doing so would defeat the control.
 *
 * Same storage, different release authority. Precedent for this shape already
 * exists in the codebase: auth_sessions.revoked is written by four paths under
 * three different authorities, discriminated by revoked_reason.
 *
 * Evidence: CONTAINMENT_RELEASE_AUTHORITY_PRECEDENT_2026-08-09.md
 */
export type ContainmentAuthorityBasis = 'holder' | 'governance';
export type OrientationStyle = 'minimal' | 'guided' | 'relationship_first' | 'tour';

export interface PracticeFieldResource {
  id: string;
  title: string;
  type: 'text' | 'url' | 'file';
  content?: string;
  url?: string;
  note?: string;
}

/**
 * Layer 4 — Adaptive Guidance ("MAIA Guidance").
 * Practitioner preferences that NARROW or SPECIFY how MAIA engages within the
 * field. Narrow-only by invariant: may never relax constitutional safeguards or
 * widen MAIA's authority (enforced in lib/practiceField/fieldGuidance.ts).
 * All fields optional; an empty object means "no field-specific guidance".
 */
export interface FieldGuidance {
  tone?: string;                    // e.g. "warm, direct, unhurried; few words"
  preferred_language?: string;      // vocabulary/framework the practitioner works in (IFS, somatic, contemplative…)
  invitations?: string[];           // things MAIA may gently offer within this field
  boundaries?: string[];            // things MAIA should hold/avoid within this field
  forbidden_topics?: string[];      // topics MAIA must not raise or engage in this field
  forbidden_engagements?: string[]; // modes MAIA must not enact here (e.g. "do not give medical advice")
  custom_notes?: string;            // free-text field preferences
}

export interface PracticeField {
  id: string;
  practitioner_member_id: string;

  // Stable public identifier resolving a room's fieldContext URL param to this
  // field (migration 20260710000001). Nullable: no slug = not room-addressable.
  field_slug: string | null;

  // Layer 1: Identity
  welcome_message: string | null;
  welcome_video_url: string | null;
  about_practice: string | null;

  // Layer 2: Relationship (formation-snapshotted)
  how_we_work_together: string | null;
  how_maia_supports: string | null;
  professional_practice: string | null;
  orientation_style: OrientationStyle;

  // Layer 3: Practice
  resources: PracticeFieldResource[];

  // Active Field
  active_field_content: string | null;
  active_field_updated_at: string | null;

  // Layer 4: Adaptive Guidance ("MAIA Guidance") — live, not snapshotted
  maia_guidance: FieldGuidance;

  // State — READINESS. "Could this go live?" Computed from content by syncStatus.
  status: PracticeFieldStatus;
  status_reason: string | null;

  // State — CONTAINMENT. "May this go live?" An explicit governance act, never computed.
  // Independent of readiness: a field may be ready AND contained, and must then stay non-live.
  containment_status: ContainmentStatus;
  /** Whose act imposed this — and therefore whose act may lift it. NULL when not contained. */
  authority_basis: ContainmentAuthorityBasis | null;
  containment_reason: string | null;
  contained_at: string | null;
  /** NULL only for the 2026-08-03 legacy containment; new acts require an actor. */
  contained_by: string | null;
  containment_reference: string | null;
  released_at: string | null;
  released_by: string | null;

  created_at: string;
  updated_at: string;
}

export interface PracticeFieldUpdate {
  welcome_message?: string | null;
  welcome_video_url?: string | null;
  about_practice?: string | null;
  how_we_work_together?: string | null;
  how_maia_supports?: string | null;
  professional_practice?: string | null;
  orientation_style?: OrientationStyle;
  resources?: PracticeFieldResource[];
  active_field_content?: string | null;
  maia_guidance?: FieldGuidance;
}

export interface PracticeFieldSnapshot {
  id: string;
  practice_field_id: string;
  space_id: string;
  welcome_message: string | null;
  about_practice: string | null;
  how_we_work_together: string | null;
  how_maia_supports: string | null;
  professional_practice: string | null;
  orientation_style: string | null;
  resources: PracticeFieldResource[];
  field_status: string;
  snapshotted_at: string;
}

/** Context object passed to MAIA — context not instructions */
export interface PracticeFieldContext {
  practitioner_name: string;
  how_we_work_together: string | null;
  how_maia_supports: string | null;
  about_practice: string | null;
  active_field_content: string | null;
  resources_available: boolean;
  orientation_style: OrientationStyle;
  /** Layer 4 — narrow-only field preferences (null when none set). */
  maia_guidance: FieldGuidance | null;
}

/** PENDING → LIVE readiness check */
export interface PracticeFieldReadiness {
  is_live: boolean;
  missing: string[];
}

export function checkPracticeFieldReadiness(field: Partial<PracticeField>): PracticeFieldReadiness {
  const missing: string[] = [];
  if (!field.welcome_message?.trim()) missing.push('Welcome message');
  if (!field.how_we_work_together?.trim()) missing.push('How We Work Together');
  if (!field.how_maia_supports?.trim()) missing.push('How MAIA Supports Our Work');
  if (!field.professional_practice?.trim()) missing.push('Professional Practice declarations');
  return { is_live: missing.length === 0, missing };
}

/**
 * Is an explicit governance containment currently in force?
 *
 * Independent of readiness. A field that satisfies every readiness requirement may still be
 * contained, and must then remain non-live (GC-2).
 */
export function isContained(field: Partial<PracticeField>): boolean {
  return field.containment_status === 'contained';
}

/**
 * GC-2 — effective liveness is a CONJUNCTION:
 *
 *     effective_live := (status = 'live') AND (containment_status = 'none')
 *
 * Every gate that would otherwise test `status` alone must test this instead. Readiness
 * answers "could this go live?"; containment answers "may it?". Neither alone is sufficient.
 *
 * Callers that need to explain a refusal must distinguish the two reasons — an incomplete
 * field and a contained field are different facts and must never render identically.
 */
export function isEffectivelyLive(field: Partial<PracticeField>): boolean {
  return field.status === 'live' && !isContained(field);
}

export type HolderReleaseRefusal =
  /** The actor does not hold this field. */
  | 'not_holder'
  /** There is nothing to release. */
  | 'not_contained'
  /** A governance containment. The subject may never lift it through this path. */
  | 'governance_authority';

export type HolderReleaseCheck =
  | { allowed: true }
  | { allowed: false; refusal: HolderReleaseRefusal };

/**
 * GC-4 — MAY THIS ACTOR RELEASE THIS CONTAINMENT THROUGH THE ORDINARY HOLDER PATH?
 *
 * Release authority is determined by the KIND of containment, never by the actor's
 * relationship to the resource. Being the field holder is necessary but not sufficient:
 * a holder may lift what they themselves imposed, and may not lift what an outside
 * authority imposed on them.
 *
 * The dangerous case this exists to refuse: the subject of a governance containment
 * clearing it because they happen to own the row. That would make the representation
 * durable while leaving the prohibition defeasible — restraint in name only.
 *
 * `authority_basis` missing on a contained field is treated as GOVERNANCE. Fail closed:
 * an unclassifiable hold is not a self-imposed pause, and the safe direction for an
 * unknown restraint is the more restrictive one. (This is also the legacy 2026-08-03
 * case, whose imposing actor is unrecoverable from evidence.)
 *
 * This function is the single source of truth for the holder release decision — the route
 * calls it rather than re-deriving the rule, so the tests exercise the real logic.
 */
export function holderReleaseCheck(
  field: Partial<PracticeField>,
  actorMemberId: string,
): HolderReleaseCheck {
  if (field.practitioner_member_id !== actorMemberId) {
    return { allowed: false, refusal: 'not_holder' };
  }
  if (!isContained(field)) {
    return { allowed: false, refusal: 'not_contained' };
  }
  if (field.authority_basis !== 'holder') {
    return { allowed: false, refusal: 'governance_authority' };
  }
  return { allowed: true };
}
