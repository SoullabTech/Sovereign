/**
 * Event Arc — type definitions
 *
 * A continuity layer around transformation.
 * Separate primitive from services/sessions.
 */

export type EventStatus = 'draft' | 'open' | 'closed' | 'archived';
export type EventVisibility = 'public' | 'private' | 'invite_only';
export type EventLocationType = 'in_person' | 'virtual' | 'hybrid';
export type EventPhase = 'pre' | 'during' | 'post';
export type AttendeeStatus =
  | 'invited'
  | 'registered'
  | 'confirmed'
  | 'cancelled'
  | 'active'
  | 'completed';

export interface EventRecord {
  id: string;
  practitioner_id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  location_type: EventLocationType;
  location_details: string | null;
  start_date: string; // YYYY-MM-DD
  end_date: string; // YYYY-MM-DD
  start_time: string | null;
  end_time: string | null;
  timezone: string;
  capacity: number | null;
  status: EventStatus;
  visibility: EventVisibility;
  price_cents: number | null;
  currency: string;
  requires_application: boolean;
  created_at: string;
  updated_at: string;
}

export interface EventAttendeeRecord {
  id: string;
  event_id: string;
  member_id: string | null;
  email: string;
  full_name: string | null;
  status: AttendeeStatus;
  joined_at: string;
  application_data: Record<string, unknown> | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface EventPhaseState {
  id: string;
  event_id: string;
  member_id: string;
  phase: EventPhase;
  started_at: string;
  completed_at: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

/**
 * The interpretive bridge that makes MAIA behave differently.
 * This is the shape passed into the oracle prompt assembly.
 */
export interface ActiveEventContext {
  eventId: string;
  title: string;
  phase: EventPhase;
  startDate: string;
  endDate: string;
  practitionerId: string;
}
