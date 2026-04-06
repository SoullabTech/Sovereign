/**
 * Trust Layer Types — Phase 1
 *
 * Meeting providers, privacy envelopes, memory contracts, artifact sharing.
 * Follows existing pattern from lib/circles/types.ts and lib/comms/types.ts
 */

import { z } from 'zod';

// ── Meeting Provider ────────────────────────────────────────

export const MEETING_PROVIDERS = [
  'none', 'livekit', 'jitsi', 'zoom', 'google_meet',
  'proton_meet', 'microsoft_teams', 'custom',
] as const;

export type MeetingProvider = (typeof MEETING_PROVIDERS)[number];

export const MeetingProviderSchema = z.enum(MEETING_PROVIDERS);

export const MEETING_PROVIDER_LABELS: Record<MeetingProvider, string> = {
  none: 'No Video',
  livekit: 'LiveKit',
  jitsi: 'Jitsi Meet',
  zoom: 'Zoom',
  google_meet: 'Google Meet',
  proton_meet: 'Proton Meet',
  microsoft_teams: 'Microsoft Teams',
  custom: 'Custom Link',
};

export const MeetingMetaSchema = z.object({
  passcode: z.string().optional(),
  waitingRoom: z.boolean().optional(),
  e2ee: z.boolean().optional(),
  recordingConsent: z.boolean().optional(),
  dialIn: z.string().optional(),
}).strict();

export type MeetingMeta = z.infer<typeof MeetingMetaSchema>;

// ── Privacy Envelope ────────────────────────────────────────

export const PRIVACY_MODES = ['private', 'standard', 'sensitive', 'confidential'] as const;
export const CONSENT_LEVELS = ['none', 'verbal', 'written', 'digital'] as const;
export const VISIBILITY_SCOPES = ['member_only', 'member_and_practitioner', 'care_team'] as const;

export type PrivacyMode = (typeof PRIVACY_MODES)[number];
export type ConsentLevel = (typeof CONSENT_LEVELS)[number];
export type VisibilityScope = (typeof VISIBILITY_SCOPES)[number];

export const PrivacyModeSchema = z.enum(PRIVACY_MODES);
export const ConsentLevelSchema = z.enum(CONSENT_LEVELS);
export const VisibilityScopeSchema = z.enum(VISIBILITY_SCOPES);

// ── Scheduling Disclosure ──────────────────────────────────

export const EXPOSURE_LEVELS = ['free_busy_only', 'session_type', 'full_details'] as const;
export const DISPLAY_TITLE_MODES = ['hidden', 'generic', 'full'] as const;

export type ExposureLevel = (typeof EXPOSURE_LEVELS)[number];
export type DisplayTitleMode = (typeof DISPLAY_TITLE_MODES)[number];

export const ExposureLevelSchema = z.enum(EXPOSURE_LEVELS);
export const DisplayTitleModeSchema = z.enum(DISPLAY_TITLE_MODES);

export interface CalendarDisclosureInput {
  clientName?: string;
  serviceName?: string;
  locationType?: string;
  locationDetails?: string;
  notes?: string;
}

export interface CalendarDisclosure {
  visible: boolean;
  title: string | null;
  description: string | null;
  locationType: string | null;
  locationDetails: string | null;
}

// ── Message Intelligence ──────────────────────────────────

export const MESSAGE_INTENTS = ['care', 'instruction', 'reflection', 'logistics', 'safety_followup'] as const;
export const MESSAGE_SENSITIVITIES = ['normal', 'sensitive', 'highly_sensitive'] as const;

export type MessageIntent = (typeof MESSAGE_INTENTS)[number];
export type MessageSensitivity = (typeof MESSAGE_SENSITIVITIES)[number];

export const MessageIntentSchema = z.enum(MESSAGE_INTENTS);
export const MessageSensitivitySchema = z.enum(MESSAGE_SENSITIVITIES);

// ── Memory Contracts ────────────────────────────────────────

export const MEMORY_DISPOSITIONS = [
  'keep_private', 'share_with_practitioner',
  'allow_maia_summary', 'allow_anonymized_patterns',
] as const;

export const MEMORY_CONTRACT_STATUSES = ['active', 'revoked', 'expired'] as const;
export const MEMORY_APPLIES_TO = ['session', 'transcript', 'artifact', 'journal_entry'] as const;

export type MemoryDisposition = (typeof MEMORY_DISPOSITIONS)[number];
export type MemoryContractStatus = (typeof MEMORY_CONTRACT_STATUSES)[number];
export type MemoryAppliesTo = (typeof MEMORY_APPLIES_TO)[number];

export const MemoryDispositionSchema = z.enum(MEMORY_DISPOSITIONS);
export const MemoryContractStatusSchema = z.enum(MEMORY_CONTRACT_STATUSES);
export const MemoryAppliesToSchema = z.enum(MEMORY_APPLIES_TO);

export interface MemoryContractRow {
  id: string;
  member_id: string;
  session_id: string | null;
  container_id: string | null;
  disposition: MemoryDisposition;
  status: MemoryContractStatus;
  applies_to: MemoryAppliesTo;
  consent_method: ConsentLevel;
  consent_given_at: string;
  never_use_for_ai: boolean;
  revoked_at: string | null;
  revoked_reason: string | null;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

// ── Artifact Shares ─────────────────────────────────────────

export const SHARE_SCOPES = ['link', 'named_recipient', 'member_and_practitioner'] as const;
export type ShareScope = (typeof SHARE_SCOPES)[number];
export const ShareScopeSchema = z.enum(SHARE_SCOPES);

// Hard-limited artifact types allowed for sharing in Phase 1
export const SHAREABLE_ARTIFACT_TYPES = ['parent_update', 'client_summary', 'integration_note'] as const;
export type ShareableArtifactType = (typeof SHAREABLE_ARTIFACT_TYPES)[number];

export interface ArtifactShareRow {
  id: string;
  artifact_id: string;
  share_scope: ShareScope;
  share_token: string;
  password_hash: string | null;
  expires_at: string | null;
  view_count: number;
  last_viewed_at: string | null;
  created_by: string;
  revoked_at: string | null;
  created_at: string;
  updated_at: string;
}

// ── Privacy Gate Result ─────────────────────────────────────

export interface PrivacyGateResult {
  permitted: boolean;
  reason?: string;
}

// ── Zod Request Schemas ─────────────────────────────────────

export const UpdateSessionMeetingSchema = z.object({
  meetingProvider: MeetingProviderSchema,
  meetingUrl: z.string().url().optional().nullable(),
  meetingId: z.string().max(255).optional().nullable(),
  meetingMeta: MeetingMetaSchema.optional().nullable(),
}).strict();

export const UpdateSessionPrivacySchema = z.object({
  privacyMode: PrivacyModeSchema,
  consentLevel: ConsentLevelSchema.optional(),
  visibilityScope: VisibilityScopeSchema.optional(),
  allowAiDistillation: z.boolean().optional(),
  allowExport: z.boolean().optional(),
}).strict();

export const CreateMemoryContractSchema = z.object({
  sessionId: z.string().uuid().optional().nullable(),
  containerId: z.string().uuid().optional().nullable(),
  disposition: MemoryDispositionSchema.default('keep_private'),
  appliesTo: MemoryAppliesToSchema.default('session'),
  consentMethod: ConsentLevelSchema.default('digital'),
  neverUseForAi: z.boolean().default(false),
  expiresAt: z.string().datetime().optional().nullable(),
}).strict();

export const RevokeMemoryContractSchema = z.object({
  contractId: z.string().uuid(),
  reason: z.string().max(500).optional(),
}).strict();

export const CreateArtifactShareSchema = z.object({
  artifactId: z.string().uuid(),
  shareScope: ShareScopeSchema.default('link'),
  recipientEmail: z.string().email().optional().nullable(),
  password: z.string().min(4).max(128).optional(),
  expiresAt: z.string().datetime().optional().nullable(),
}).strict();

export type UpdateSessionMeeting = z.infer<typeof UpdateSessionMeetingSchema>;
export type UpdateSessionPrivacy = z.infer<typeof UpdateSessionPrivacySchema>;
export type CreateMemoryContract = z.infer<typeof CreateMemoryContractSchema>;
export type RevokeMemoryContract = z.infer<typeof RevokeMemoryContractSchema>;
export type CreateArtifactShare = z.infer<typeof CreateArtifactShareSchema>;

// ── Media Disclosure ──────────────────────────────────────

export const MEDIA_DISCLOSURE_ACTIONS = ['export', 'descript_link', 'share', 'publish'] as const;
export type MediaDisclosureAction = (typeof MEDIA_DISCLOSURE_ACTIONS)[number];

/**
 * Meaning classification types for media content.
 * Populated by the `classify` job after transcription.
 * These will align with conversation trust layer inference types
 * when that system lands.
 */
export const MEDIA_INFERENCE_TYPES = [
  'informational',           // factual, educational content
  'relational_inference',    // content about relationships, therapeutic work
  'sensitive_synthesis',     // synthesized sensitive material
  'outward_recommendation',  // actionable guidance being externalized
  'personal_disclosure',     // personal/intimate content
] as const;
export type MediaInferenceType = (typeof MEDIA_INFERENCE_TYPES)[number];

export const MEANING_EXPANSION_LEVELS = ['none', 'low', 'moderate', 'high'] as const;
export type MeaningExpansionLevel = (typeof MEANING_EXPANSION_LEVELS)[number];

export interface MediaDisclosureInput {
  projectId: string;
  action: MediaDisclosureAction;
  targetPlatform?: string;
  /** Loaded from project row if available */
  inferenceType?: MediaInferenceType;
  expansionLevel?: MeaningExpansionLevel;
}

export interface MediaDisclosureResult {
  allowed: boolean;
  reason?: string;
  redactionRequired: boolean;
  privacyLevel: string;
  consentStatus: string;
  expansionLevel?: MeaningExpansionLevel;
}
