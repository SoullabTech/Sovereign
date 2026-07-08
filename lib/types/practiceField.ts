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

  // State
  status: PracticeFieldStatus;
  status_reason: string | null;

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
