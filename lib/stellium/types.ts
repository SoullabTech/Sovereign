/**
 * STELLIUM TYPES
 *
 * Type definitions for the practitioner layer
 * Clients, sessions, personas, resources, FAQs
 */

// ============================================
// CLIENT TYPES (Astrology-Enhanced)
// ============================================

export type BirthTimeAccuracy = 'exact' | 'approximate' | 'rectified' | 'unknown';

export interface KeyPlacements {
  sun_sign?: string;
  moon_sign?: string;
  rising_sign?: string;
  saturn_sign?: string;
  saturn_house?: number;
  north_node_sign?: string;
}

export interface PractitionerClient {
  id: string;
  practitioner_id: string;

  // Basic info
  name: string;
  email?: string;
  phone?: string;
  preferred_name?: string;
  pronouns?: string;

  // Birth data (for astrology)
  birth_date?: string;
  birth_time?: string;
  birth_location?: string;
  birth_latitude?: number;
  birth_longitude?: number;
  birth_timezone?: string;
  birth_time_accuracy?: BirthTimeAccuracy;
  has_chart?: boolean;
  chart_image_url?: string;
  key_placements?: KeyPlacements;

  // Intake and notes
  intake_data?: Record<string, any>;
  private_notes?: string;
  themes?: string[];

  // Status
  status: 'active' | 'inactive' | 'archived' | 'waitlist';
  tags?: string[];

  // Relationship
  first_session?: string;
  last_session?: string;
  total_sessions: number;
  next_session?: string;
  total_revenue?: number;

  // Portal access (client claiming chart access)
  portal_email?: string;
  portal_claimed_at?: string;

  // Timestamps
  created_at: string;
  updated_at: string;
}

export interface CreateClientInput {
  name: string;
  email?: string;
  phone?: string;
  preferred_name?: string;
  pronouns?: string;
  birth_date?: string;
  birth_time?: string;
  birth_location?: string;
  birth_timezone?: string;
  birth_time_accuracy?: BirthTimeAccuracy;
  intake_data?: Record<string, any>;
  private_notes?: string;
  tags?: string[];
  status?: 'active' | 'inactive' | 'archived' | 'waitlist';
}

export interface UpdateClientInput extends Partial<CreateClientInput> {
  themes?: string[];
  chart_image_url?: string;
  key_placements?: KeyPlacements;
}

// ============================================
// SESSION TYPES
// ============================================

export type SessionStatus = 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
export type LocationType = 'video' | 'phone' | 'in_person' | 'async';
export type Modality = 'astrology' | 'therapy' | 'bodywork' | 'coaching' | 'shamanic' | 'other';

// Astrology-specific session types
export type AstrologySessionType =
  | 'natal_chart'
  | 'transit_reading'
  | 'solar_return'
  | 'synastry'
  | 'composite'
  | 'progressed_chart'
  | 'electional'
  | 'follow_up'
  | 'other';

export interface PractitionerSession {
  id: string;
  practitioner_id: string;
  client_id: string;

  // Session type
  session_type: string;
  modality?: Modality;

  // Scheduling
  scheduled_at?: string;
  duration_minutes: number;
  status: SessionStatus;

  // Location
  location_type: LocationType;
  location_details?: string;

  // MAIA preparation
  maia_prep?: MaiaSessionPrep;
  prep_generated_at?: string;

  // Notes
  prep_notes?: string;
  session_notes?: string;
  follow_up_notes?: string;
  follow_up_sent: boolean;
  follow_up_sent_at?: string;

  // Themes
  themes?: string[];
  insights?: string[];

  // Payment
  fee?: number;
  paid: boolean;
  payment_method?: string;

  // Timestamps
  created_at: string;
  updated_at: string;
  completed_at?: string;

  // Joined data (optional)
  client?: PractitionerClient;
}

export interface MaiaSessionPrep {
  summary: string;
  client_history: string;
  recent_themes: string[];
  relevant_context: string;
  suggested_focus: string[];
  transit_context?: string;  // For astrology
  open_threads?: string[];
  generated_at: string;
}

export interface CreateSessionInput {
  client_id: string;
  session_type: string;
  modality?: Modality;
  scheduled_at?: string;
  duration_minutes?: number;
  location_type?: LocationType;
  location_details?: string;
  fee?: number;
}

export interface UpdateSessionInput {
  session_type?: string;
  scheduled_at?: string;
  duration_minutes?: number;
  status?: SessionStatus;
  location_type?: LocationType;
  location_details?: string;
  prep_notes?: string;
  session_notes?: string;
  follow_up_notes?: string;
  themes?: string[];
  insights?: string[];
  fee?: number;
  paid?: boolean;
  payment_method?: string;
}

// ============================================
// PERSONA TYPES
// ============================================

export interface PractitionerPersona {
  id: string;
  practitioner_id: string;

  // Identity
  persona_name: string;
  modality: Modality;

  // Voice
  voice_patterns: VoicePatterns;

  // Framework
  framework: PractitionerFramework;

  // Boundaries
  boundaries: PersonaBoundaries;

  // Knowledge
  materials_indexed: string[];
  books_referenced: string[];
  training_transcripts: number;

  // Status
  is_active: boolean;

  // Timestamps
  created_at: string;
  updated_at: string;
  last_trained_at?: string;
}

export interface VoicePatterns {
  tone?: string;
  phrases?: string[];
  avoids?: string[];
  style?: string;
  warmth_level?: 'warm' | 'neutral' | 'professional';
  formality?: 'casual' | 'balanced' | 'formal';
}

export interface PractitionerFramework {
  primary?: string;
  secondary?: string;
  authors?: string[];
  traditions?: string[];
  specialties?: string[];
}

export interface PersonaBoundaries {
  no_predictions?: boolean;
  no_diagnosis?: boolean;
  no_medical_advice?: boolean;
  escalate_crisis?: boolean;
  refer_to_professional?: boolean;
  custom_rules?: string[];
}

export interface CreatePersonaInput {
  persona_name: string;
  modality: Modality;
  voice_patterns?: VoicePatterns;
  framework?: PractitionerFramework;
  boundaries?: PersonaBoundaries;
}

export interface UpdatePersonaInput extends Partial<CreatePersonaInput> {
  materials_indexed?: string[];
  books_referenced?: string[];
}

// ============================================
// RESOURCE TYPES
// ============================================

export type ResourceType = 'pdf' | 'video' | 'audio' | 'link' | 'document' | 'image';
export type ResourceVisibility = 'private' | 'all_clients' | 'specific_clients';

export interface PractitionerResource {
  id: string;
  practitioner_id: string;

  name: string;
  description?: string;
  resource_type: ResourceType;
  url?: string;
  file_path?: string;

  visibility: ResourceVisibility;
  shared_with?: string[];

  tags?: string[];

  created_at: string;
  updated_at: string;
}

// ============================================
// FAQ TYPES
// ============================================

export type FAQCategory =
  | 'about_sessions'
  | 'booking_scheduling'
  | 'astrology_questions'
  | 'payments'
  | 'about_practitioner'
  | 'general';

export interface PractitionerFAQ {
  id: string;
  practitioner_id: string;
  question: string;
  answer: string;
  category: FAQCategory;
  display_order: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateFAQInput {
  question: string;
  answer: string;
  category: FAQCategory;
  display_order?: number;
  is_published?: boolean;
}

export interface UpdateFAQInput extends Partial<CreateFAQInput> {}

// ============================================
// CLIENT PORTAL TYPES
// ============================================

export interface ClientPortalToken {
  id: string;
  client_id: string;
  practitioner_id: string;
  token: string;
  permissions: PortalPermissions;
  expires_at?: string;
  last_accessed_at?: string;
  is_active: boolean;
  created_at: string;
}

export interface PortalPermissions {
  view_chart: boolean;
  view_sessions: boolean;
  view_resources: boolean;
  message: boolean;
}

// ============================================
// DASHBOARD TYPES
// ============================================

export interface PractitionerDashboard {
  total_clients: number;
  active_clients: number;
  upcoming_sessions: PractitionerSession[];
  recent_sessions: PractitionerSession[];
  sessions_this_week: number;
  sessions_this_month: number;
  revenue_this_month?: number;
  clients_needing_follow_up: PractitionerClient[];
  draft_sessions: PractitionerSession[];
}

export interface ClientTimeline {
  client: PractitionerClient;
  sessions: PractitionerSession[];
  themes_over_time: { date: string; themes: string[] }[];
  maia_insights?: string[];
}

// ============================================
// ADMIN NAVIGATION
// ============================================

export interface AdminNavItem {
  path: string;
  label: string;
  icon: string;
  badge?: string;
  children?: AdminNavItem[];
}

// ============================================
// PRACTITIONER TYPES
// ============================================

export interface Practitioner {
  id: string;
  member_id?: string;
  slug: string;
  name: string;
  email: string;
  modality: Modality;
  brand?: {
    name: string;
    tagline?: string;
    logo_url?: string;
    primary_color?: string;
    secondary_color?: string;
  };
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ============================================
// SETTINGS TYPES
// ============================================

export interface PractitionerProfile {
  id: string;
  slug: string;
  name: string;
  email: string;
  business_name?: string;
  tagline?: string;
  bio?: string;
  status: string;
}

export interface SessionDefaults {
  default_duration_minutes: number;
  default_location_type: LocationType;
  default_session_type: string;
  default_fee?: number;
  buffer_between_sessions: number;
  booking_advance_days: number;
  cancellation_policy?: string;
  confirmation_template?: string;
  follow_up_template?: string;
}

export interface NotificationSettings {
  email_new_booking: boolean;
  email_booking_reminder: boolean;
  email_follow_up_reminder: boolean;
  email_payment_received: boolean;
  reminder_hours_before: number;
  follow_up_days_after: number;
}

export interface PracticeSettings {
  timezone: string;
  currency: string;
  working_hours?: Record<string, { start: string; end: string } | null>;
  booking_enabled: boolean;
  payments_enabled: boolean;
}

export interface PractitionerSettings {
  profile: PractitionerProfile;
  sessionDefaults: SessionDefaults;
  notifications: NotificationSettings;
  practice: PracticeSettings;
}

export interface UpdatePractitionerProfileInput {
  name?: string;
  email?: string;
  business_name?: string;
  tagline?: string;
  bio?: string;
}

export interface UpdateSessionDefaultsInput {
  default_duration_minutes?: number;
  default_location_type?: LocationType;
  default_session_type?: string;
  default_fee?: number;
  buffer_between_sessions?: number;
  booking_advance_days?: number;
  cancellation_policy?: string;
  confirmation_template?: string;
  follow_up_template?: string;
}

export interface UpdateNotificationSettingsInput {
  email_new_booking?: boolean;
  email_booking_reminder?: boolean;
  email_follow_up_reminder?: boolean;
  email_payment_received?: boolean;
  reminder_hours_before?: number;
  follow_up_days_after?: number;
}

export interface UpdatePracticeSettingsInput {
  timezone?: string;
  currency?: string;
  working_hours?: Record<string, { start: string; end: string } | null>;
  booking_enabled?: boolean;
  payments_enabled?: boolean;
}
