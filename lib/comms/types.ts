/**
 * COMMS SPINE: TypeScript Types
 *
 * Type definitions for the unified communication platform layer.
 * These mirror the database schema in 20260122_comms_spine.sql
 *
 * @module lib/comms/types
 */

// ─────────────────────────────────────────────────────────────────────────────
// DOMAIN TYPES
// ─────────────────────────────────────────────────────────────────────────────

/** The three communication domains */
export type CommsDomain = 'clinical' | 'ops' | 'community';

/** Channel types for message delivery */
export type CommsChannelType = 'in_app' | 'email' | 'sms' | 'push' | 'video' | 'voice';

/** Provider implementations */
export type CommsProvider = 'internal' | 'resend' | 'twilio' | 'livekit' | 'jitsi';

/** Channel operational status */
export type CommsChannelStatus = 'active' | 'paused' | 'degraded' | 'disabled';

/** Identity owner types (polymorphic) */
export type CommsOwnerType = 'member' | 'client' | 'contact';

/** Identity address status */
export type CommsIdentityStatus = 'active' | 'bounced' | 'unsubscribed' | 'invalid';

/** Thread types by domain */
export type CommsThreadType =
  // Clinical
  | 'between_session'
  | 'session_prep'
  | 'safety_followup'
  // Ops
  | 'appointment'
  | 'billing'
  | 'logistics'
  // Community
  | 'cohort'
  | 'campaign'
  | 'announcement';

/** Thread status */
export type CommsThreadStatus = 'active' | 'archived' | 'closed';

/** Message sender types */
export type CommsSenderType = 'practitioner' | 'client' | 'system' | 'maia';

/** Message classification types */
export type CommsMessageType =
  | 'reflection'
  | 'question'
  | 'win'
  | 'struggle'
  | 'logistics'
  | 'reply'
  | 'reminder'
  | 'confirmation'
  | 'announcement';

/** Message urgency levels */
export type CommsUrgency = 'normal' | 'time_sensitive' | 'safety_concern';

/** Message delivery status */
export type CommsDeliveryStatus = 'queued' | 'sent' | 'delivered' | 'read' | 'failed' | 'bounced';

/** Quick response types */
export type CommsQuickResponseType = 'noted' | 'discuss_next_session' | 'acknowledged';

/** Safety flag severity */
export type CommsSafetySeverity = 'yellow' | 'red' | 'crisis';

/** Safety detection source */
export type CommsSafetyDetector = 'client_reported' | 'maia_detected' | 'practitioner_flagged';

/** Notification status */
export type CommsNotificationStatus = 'pending' | 'sent' | 'failed' | 'skipped';

/** Consent source */
export type CommsConsentSource = 'signup' | 'settings' | 'api' | 'import' | 'verbal';

// ─────────────────────────────────────────────────────────────────────────────
// ENTITY INTERFACES
// ─────────────────────────────────────────────────────────────────────────────

/** Channel configuration */
export interface CommsChannel {
  id: string;
  type: CommsChannelType;
  provider: CommsProvider;
  status: CommsChannelStatus;
  config: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

/** Identity (person ↔ channel address mapping) */
export interface CommsIdentity {
  id: string;
  owner_type: CommsOwnerType;
  owner_id: string;
  channel_type: CommsChannelType;
  address: string;
  verified: boolean;
  verified_at: string | null;
  is_primary: boolean;
  status: CommsIdentityStatus;
  bounce_count: number;
  last_bounce_at: string | null;
  created_at: string;
  updated_at: string;
}

/** Thread (conversation container) */
export interface CommsThread {
  id: string;
  domain: CommsDomain;
  thread_type: CommsThreadType;
  participants: Record<string, unknown>;
  practitioner_id: string | null;
  client_id: string | null;
  case_id: string | null;
  status: CommsThreadStatus;
  subject: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  last_message_at: string | null;
}

/** Message */
export interface CommsMessage {
  id: string;
  thread_id: string;
  sender_type: CommsSenderType;
  sender_id: string | null;
  channel_type: CommsChannelType;
  body: string;
  message_type: CommsMessageType | null;
  urgency: CommsUrgency;
  delivery_status: CommsDeliveryStatus;
  queued_at: string;
  sent_at: string | null;
  delivered_at: string | null;
  read_at: string | null;
  reply_to_id: string | null;
  is_quick_response: boolean;
  quick_response_type: CommsQuickResponseType | null;
  maia_analysis: CommsMAIAAnalysis | null;
  used_suggestion_id: string | null; // Phase 4: links to suggestion that produced this message
  created_at: string;
  updated_at: string;
}

/** MAIA analysis result (stored on message) */
export interface CommsMAIAAnalysis {
  classification: CommsMessageType | null;
  suggested_urgency: CommsUrgency;
  safety_cues: string[];
  sentiment: number; // -1 to 1
  confidence: number; // 0 to 1
  analyzed_at: string;
}

/** Event (append-only audit log) */
export interface CommsEvent {
  id: string;
  event_type: CommsEventType;
  thread_id: string | null;
  message_id: string | null;
  identity_id: string | null;
  actor_type: CommsSenderType | null;
  actor_id: string | null;
  data: Record<string, unknown>;
  created_at: string;
}

/** Consent record */
export interface CommsConsent {
  id: string;
  identity_id: string;
  domain: CommsDomain;
  channel_type: CommsChannelType;
  consented: boolean;
  consented_at: string | null;
  withdrawn_at: string | null;
  consent_source: CommsConsentSource | null;
  allow_sensitive_content: boolean;
  created_at: string;
  updated_at: string;
}

/** Policy (communication boundaries) */
export interface CommsPolicy {
  id: string;
  practitioner_id: string;
  client_id: string | null;
  domain: CommsDomain;
  check_days: string[];
  check_window_start: string;
  check_window_end: string;
  timezone: string;
  max_response_hours: number;
  crisis_copy: string;
  boundary_message: string | null;
  allow_inbound: boolean;
  allow_outbound: boolean;
  is_active: boolean;
  emergency_contact_id: string | null;
  created_at: string;
  updated_at: string;
}

/** Safety flag */
export interface CommsSafetyFlag {
  id: string;
  message_id: string;
  thread_id: string;
  severity: CommsSafetySeverity;
  detected_by: CommsSafetyDetector;
  detection_confidence: number | null;
  detected_cues: string[] | null;
  recommended_action: string | null;
  maia_rationale: string | null;
  notification_status: CommsNotificationStatus;
  notification_channel: string | null;
  notified_at: string | null;
  acknowledged_at: string | null;
  acknowledged_by: string | null;
  review_note: string | null;
  escalated: boolean;
  escalated_at: string | null;
  escalated_to: string | null;
  resolved_at: string | null;
  created_at: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// EVENT TYPES
// ─────────────────────────────────────────────────────────────────────────────

export type CommsEventType =
  // Message lifecycle
  | 'message.created'
  | 'message.queued'
  | 'message.sent'
  | 'message.delivered'
  | 'message.read'
  | 'message.failed'
  | 'message.bounced'
  | 'message.archived'
  // Thread lifecycle
  | 'thread.created'
  | 'thread.participant_added'
  | 'thread.participant_removed'
  | 'thread.archived'
  | 'thread.reopened'
  // Safety events
  | 'safety.flagged'
  | 'safety.notification_sent'
  | 'safety.acknowledged'
  | 'safety.escalated'
  | 'safety.resolved'
  // Consent events
  | 'consent.granted'
  | 'consent.withdrawn'
  | 'consent.updated'
  // Policy events
  | 'policy.created'
  | 'policy.updated'
  | 'policy.violated'
  // Identity events
  | 'identity.created'
  | 'identity.verified'
  | 'identity.bounced'
  | 'identity.unsubscribed'
  // MAIA events
  | 'maia.message_classified'
  | 'maia.safety_detected'
  | 'maia.drift_detected'
  | 'maia.suggestion_generated'
  // Ops events (Ganesha bridge)
  | 'ops.appointment_scheduled'
  | 'ops.appointment_confirmed'
  | 'ops.appointment_reminded'
  | 'ops.appointment_cancelled'
  | 'ops.payment_received'
  | 'ops.invoice_sent'
  // Community events
  | 'community.member_joined'
  | 'community.cohort_enrolled'
  | 'community.campaign_sent'
  | 'community.newsletter_delivered';

// ─────────────────────────────────────────────────────────────────────────────
// API TYPES: Request/Response shapes
// ─────────────────────────────────────────────────────────────────────────────

/** Inbox query options */
export interface InboxQueryOptions {
  domain?: CommsDomain | 'all';
  filter?: 'unread' | 'safety' | 'unanswered' | 'all';
  limit?: number;
  offset?: number;
}

/** Inbox thread item (summary for list view) */
export interface InboxThreadItem {
  thread_id: string;
  domain: CommsDomain;
  thread_type: CommsThreadType;
  // Participant info
  client_id: string | null;
  client_name: string | null;
  client_preferred_name: string | null;
  // Counts
  unread_count: number;
  safety_count: number;
  // Latest message
  latest_message_at: string;
  latest_message_preview: string;
  latest_message_type: CommsMessageType | null;
  latest_urgency: CommsUrgency;
  // Safety
  has_unacknowledged_safety: boolean;
}

/** Inbox response */
export interface InboxResponse {
  threads: InboxThreadItem[];
  summary: {
    total_unread: number;
    total_safety_concerns: number;
    by_domain: {
      clinical: { unread: number; safety: number };
      ops: { unread: number; safety: number };
      community: { unread: number; safety: number };
    };
  };
}

/** Thread context (for right rail) */
export interface ThreadContext {
  client?: {
    id: string;
    name: string;
    preferred_name: string | null;
    case_id: string | null;
    spiral_stage: string | null;
    primary_element: string | null;
    last_session: string | null;
  };
  policy: {
    check_days_formatted: string;
    check_window: string;
    timezone: string;
    max_response_hours: number;
    crisis_copy: string;
    boundary_message: string | null;
  };
}

/** Thread response */
export interface ThreadResponse {
  thread: CommsThread;
  context: ThreadContext;
  messages: CommsMessageWithSafety[];
  unread_count: number;
}

/** Message with joined safety flag */
export interface CommsMessageWithSafety extends CommsMessage {
  safety_flag?: {
    id: string;
    severity: CommsSafetySeverity;
    detected_cues: string[] | null;
    acknowledged_at: string | null;
  } | null;
}

/** Send message input */
export interface SendMessageInput {
  body: string;
  channel_type?: CommsChannelType;
  message_type?: CommsMessageType;
  urgency?: CommsUrgency;
  is_quick_response?: boolean;
  quick_response_type?: CommsQuickResponseType;
  reply_to_id?: string;
  suggestion_id?: string; // Phase 4: if message came from a suggestion
  // Trust Layer Phase 2: per-message trust metadata
  ai_assist_mode?: 'none' | 'structure_only' | 'draft_allowed';
  disclosure_mode?: 'none' | 'manual' | 'automatic';
  disclosure_text?: string;
  trust_scope?: 'direct_only' | 'session_context' | 'relational_context';
  ai_permitted?: boolean;
  contains_relational_inference?: boolean;
  trust_checked_at?: string;
}

/** Safety flag response (for dashboard) */
export interface SafetyFlagItem {
  id: string;
  thread_id: string;
  message_id: string;
  severity: CommsSafetySeverity;
  detected_by: CommsSafetyDetector;
  detected_cues: string[] | null;
  recommended_action: string | null;
  client_name: string;
  message_preview: string;
  created_at: string;
  notification_status: CommsNotificationStatus;
  acknowledged_at: string | null;
}

/** Safety dashboard response */
export interface SafetyDashboardResponse {
  flags: SafetyFlagItem[];
  counts: {
    total: number;
    crisis: number;
    red: number;
    yellow: number;
    unacknowledged: number;
  };
}

/** Acknowledge safety request */
export interface AcknowledgeSafetyInput {
  review_note?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// QUICK RESPONSE TEMPLATES
// ─────────────────────────────────────────────────────────────────────────────

export const QUICK_RESPONSE_TEMPLATES: Record<CommsQuickResponseType, { label: string; body: string }> = {
  noted: {
    label: 'Noted',
    body: "Thank you for sharing this. I've noted it and we can discuss further in our next session.",
  },
  discuss_next_session: {
    label: 'Discuss Next Session',
    body: "Thank you for this. Let's discuss this in depth during our next session together.",
  },
  acknowledged: {
    label: 'Acknowledged',
    body: 'Received and acknowledged. Thank you for keeping me informed.',
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// HELPER FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────

/** Format check days for display */
export function formatCheckDays(days: string[]): string {
  const dayAbbrev: Record<string, string> = {
    monday: 'Mon',
    tuesday: 'Tue',
    wednesday: 'Wed',
    thursday: 'Thu',
    friday: 'Fri',
    saturday: 'Sat',
    sunday: 'Sun',
  };
  return days.map(d => dayAbbrev[d] || d).join(', ');
}

/** Format time window for display */
export function formatTimeWindow(start: string, end: string): string {
  return `${start} - ${end}`;
}

/** Get severity color */
export function getSeverityColor(severity: CommsSafetySeverity): string {
  switch (severity) {
    case 'crisis':
      return 'red';
    case 'red':
      return 'red';
    case 'yellow':
      return 'yellow';
    default:
      return 'gray';
  }
}

/** Check if thread is clinical */
export function isClinicalThread(type: CommsThreadType): boolean {
  return ['between_session', 'session_prep', 'safety_followup'].includes(type);
}

/** Check if thread is ops */
export function isOpsThread(type: CommsThreadType): boolean {
  return ['appointment', 'billing', 'logistics'].includes(type);
}

/** Check if thread is community */
export function isCommunityThread(type: CommsThreadType): boolean {
  return ['cohort', 'campaign', 'announcement'].includes(type);
}
