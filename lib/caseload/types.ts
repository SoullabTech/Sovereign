/**
 * PRACTITIONER CASELOAD TYPES
 *
 * Types for the caseload management system where practitioners
 * manage client cases with MAIA as consultation partner.
 */

// ================================================
// CASE TYPES
// ================================================

export type CaseStatus = 'active' | 'paused' | 'completed' | 'transferred' | 'archived';
export type PrivacyMode = 'private' | 'transparent' | 'consent_based';
export type Element = 'earth' | 'water' | 'fire' | 'air' | 'aether';

export interface PractitionerCase {
  id: string;
  practitioner_id: string;
  client_identifier: string;
  client_name_encrypted?: string;
  presenting_concerns: string[];
  intake_date: string;
  case_status: CaseStatus;
  primary_element?: Element;
  spiral_stage?: string;
  facet_code?: string;
  privacy_mode: PrivacyMode;
  consent_captured_at?: string;
  consent_notes?: string;
  created_at: string;
  updated_at: string;
  closed_at?: string;
}

export interface CreateCaseInput {
  client_identifier: string;
  client_name_encrypted?: string;
  presenting_concerns?: string[];
  intake_date?: string;
  primary_element?: Element;
  spiral_stage?: string;
  facet_code?: string;
  privacy_mode?: PrivacyMode;
  consent_notes?: string;
}

export interface UpdateCaseInput {
  client_identifier?: string;
  client_name_encrypted?: string;
  presenting_concerns?: string[];
  case_status?: CaseStatus;
  primary_element?: Element;
  spiral_stage?: string;
  facet_code?: string;
  privacy_mode?: PrivacyMode;
  consent_captured_at?: string;
  consent_notes?: string;
}

// ================================================
// CASE NOTE TYPES
// ================================================

export type NoteType = 'session' | 'observation' | 'consultation' | 'progress' | 'intake' | 'discharge' | 'supervision';

export interface CaseNote {
  id: string;
  case_id: string;
  practitioner_id: string;
  note_type: NoteType;
  session_date: string;
  session_duration_minutes?: number;
  content: string;
  interventions_used: string[];
  themes_observed: string[];
  element_focus?: Element;
  spiral_movement?: string;
  maia_analysis?: MaiaAnalysis;
  pattern_markers: string[];
  linked_capture_session_id?: string;
  created_at: string;
  updated_at: string;
}

export interface MaiaAnalysis {
  patterns_observed?: string[];
  elemental_assessment?: {
    dominant: Element;
    secondary?: Element;
    balance_notes?: string;
  };
  spiral_observations?: string;
  suggested_focus?: string[];
  analyzed_at: string;
}

export interface CreateNoteInput {
  note_type: NoteType;
  session_date?: string;
  session_duration_minutes?: number;
  content: string;
  interventions_used?: string[];
  themes_observed?: string[];
  element_focus?: Element;
  spiral_movement?: string;
  linked_capture_session_id?: string;
  request_maia_analysis?: boolean;
}

export interface UpdateNoteInput {
  note_type?: NoteType;
  session_date?: string;
  session_duration_minutes?: number;
  content?: string;
  interventions_used?: string[];
  themes_observed?: string[];
  element_focus?: Element;
  spiral_movement?: string;
}

// ================================================
// CASE MEMORY TYPES
// ================================================

export type CaseMemoryType =
  | 'pattern'
  | 'breakthrough'
  | 'stuck_point'
  | 'spiral_transition'
  | 'intervention_outcome'
  | 'hypothesis'
  | 'supervision_insight';

export interface CaseMemory {
  id: string;
  case_id: string;
  practitioner_id: string;
  memory_type: CaseMemoryType;
  content: string;
  significance: number;
  facet_code?: string;
  element_tags: Element[];
  source_note_id?: string;
  source_consultation_id?: string;
  vector_embedding?: number[];
  formed_at: string;
  last_recalled_at?: string;
  recall_count: number;
}

// ================================================
// CONSULTATION TYPES
// ================================================

export type ConsultationType =
  | 'case_formulation'
  | 'intervention_planning'
  | 'pattern_analysis'
  | 'stuck_point'
  | 'supervision'
  | 'spiralogic_mapping';

export interface MaiaConsultation {
  id: string;
  practitioner_id: string;
  case_id?: string;
  consultation_type: ConsultationType;
  practitioner_query: string;
  context_provided?: ConsultationContext;
  maia_response: string;
  practitioner_rating?: number;
  practitioner_feedback?: string;
  model_used: string;
  tokens_used?: number;
  created_at: string;
}

export interface ConsultationContext {
  client_identifier: string;
  intake_date: string;
  presenting_concerns: string[];
  spiral_stage?: string;
  primary_element?: Element;
  privacy_mode: PrivacyMode;
  session_count: number;
  recent_notes: {
    date: string;
    type: NoteType;
    content: string;
  }[];
  key_memories: {
    type: CaseMemoryType;
    content: string;
    significance: number;
  }[];
  session_summary?: string;
}

export interface CreateConsultationInput {
  case_id?: string;
  consultation_type: ConsultationType;
  query: string;
}

// ================================================
// CAPTURE LINK TYPES
// ================================================

export interface CaseCaptureLink {
  id: string;
  case_id: string;
  capture_session_id: string;
  linked_at: string;
  linked_by: string;
  generated_note_id?: string;
}

// ================================================
// LIST/FILTER TYPES
// ================================================

export interface CaseListFilters {
  status?: CaseStatus;
  element?: Element;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface CaseWithStats extends PractitionerCase {
  note_count: number;
  last_session_date?: string;
  memory_count: number;
}

export interface NoteListFilters {
  type?: NoteType;
  element?: Element;
  from_date?: string;
  to_date?: string;
  limit?: number;
  offset?: number;
}
