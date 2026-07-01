export interface LivingField {
  id: string | null
  field_key: string
  label: string
  current_expression: string | null
  status: 'gathering' | 'active' | 'resting'
  updated_at: string | null
  sources_count: number
}

export interface FieldVersion {
  id: string
  expression: string
  change_note: string | null
  authored_by: 'member' | 'maia_candidate'
  created_at: string
}

export interface FieldSource {
  id: string
  source_type: string
  source_id: string | null
  source_excerpt: string | null
  created_at: string
}

export interface ParticipantConsent {
  id: string
  participant_member_id: string | null
  participant_label: string | null
  participant_type: string
  consent_scope: string
  granted_at: string
  paused_at: string | null
  silenced_at: string | null
  revoked_at: string | null
  removed_at: string | null
  access_note: string | null
}

export type ConsentStatus = 'active' | 'paused' | 'silenced' | 'revoked' | 'removed'

export function deriveConsentStatus(c: ParticipantConsent): ConsentStatus {
  if (c.removed_at) return 'removed'
  if (c.revoked_at) return 'revoked'
  if (c.silenced_at) return 'silenced'
  if (c.paused_at) return 'paused'
  return 'active'
}

export interface PersonalSpiral {
  id: string
  title: string
  description: string | null
  status: 'active' | 'integrating' | 'complete' | 'dormant'
  phase: string | null
  created_at: string
  updated_at: string
}

export interface PersonalState {
  id: string
  state_key: string
  label: string
  intensity: number | null
  source_type: string | null
  created_at: string
}

export interface SpiralState {
  dominant_element: string | null
  phase: number | null
  motion: string | null
  intensity: number | null
  relational_phase: number | null
  autonomy_streak: number | null
  return_count: number | null
}
