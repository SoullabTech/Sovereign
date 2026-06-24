/**
 * Media Studio Types — Build A
 *
 * Types, enums, and Zod schemas for the sovereign media pipeline.
 * Reuses PrivacyMode from lib/trust/types.ts.
 */

import { z } from 'zod';

// ── Enums ──────────────────────────────────────────────────

export const MEDIA_TYPES = ['audio', 'video', 'image', 'document'] as const;
export type MediaType = (typeof MEDIA_TYPES)[number];

export const PROJECT_STATUSES = ['uploading', 'processing', 'ready', 'error', 'archived'] as const;
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

export const PROJECT_SOURCES = ['upload', 'recording', 'import', 'voice_note'] as const;
export type ProjectSource = (typeof PROJECT_SOURCES)[number];

export const CONSENT_STATUSES = ['not_required', 'pending', 'obtained', 'denied'] as const;
export type ConsentStatus = (typeof CONSENT_STATUSES)[number];

export const ASSET_TYPES = ['original', 'thumbnail', 'waveform', 'audio_extract', 'caption_file', 'processed'] as const;
export type AssetType = (typeof ASSET_TYPES)[number];

export const JOB_TYPES = ['validate', 'inspect', 'thumbnail', 'waveform', 'audio_extract', 'transcribe', 'classify', 'summarize'] as const;
export type JobType = (typeof JOB_TYPES)[number];

export const JOB_STATUSES = ['queued', 'processing', 'done', 'failed', 'skipped'] as const;
export type JobStatus = (typeof JOB_STATUSES)[number];

export const TRANSCRIPT_STATUSES = ['pending', 'processing', 'completed', 'failed'] as const;
export type TranscriptStatus = (typeof TRANSCRIPT_STATUSES)[number];

export const EXPORT_TYPES = ['transcript_txt', 'transcript_srt', 'transcript_vtt', 'audio_mp3', 'audio_wav', 'video_mp4'] as const;
export type ExportType = (typeof EXPORT_TYPES)[number];

export const INTEGRATION_SERVICES = ['descript', 'heygen', 'canva'] as const;
export type IntegrationService = (typeof INTEGRATION_SERVICES)[number];

export const SYNC_STATUSES = ['linked', 'syncing', 'synced', 'error'] as const;
export type SyncStatus = (typeof SYNC_STATUSES)[number];

export const PUBLISH_PLATFORMS = ['youtube', 'spotify', 'podcast_rss', 'website', 'social', 'nostr'] as const;
export type PublishPlatform = (typeof PUBLISH_PLATFORMS)[number];

export const PUBLISH_STATUSES = ['draft', 'scheduled', 'published', 'failed', 'removed'] as const;
export type PublishStatus = (typeof PUBLISH_STATUSES)[number];

// ── Row Types ──────────────────────────────────────────────

export interface MediaProjectRow {
  id: string;
  practitioner_id: string;
  title: string;
  description: string | null;
  media_type: MediaType;
  status: ProjectStatus;
  duration_seconds: number | null;
  width: number | null;
  height: number | null;
  file_size_bytes: number | null;
  mime_type: string | null;
  tags: string[];
  privacy_level: string;
  contains_sensitive_content: boolean;
  client_consent_status: ConsentStatus;
  external_editing_allowed: boolean;
  publishing_allowed: boolean;
  redaction_required: boolean;
  ai_processing_allowed: boolean;
  inference_type: string | null;
  expansion_level: string | null;
  source: ProjectSource;
  source_session_id: string | null;
  source_voice_note_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface MediaAssetRow {
  id: string;
  project_id: string;
  asset_type: AssetType;
  storage_path: string;
  mime_type: string;
  file_size_bytes: number | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface MediaTranscriptRow {
  id: string;
  project_id: string;
  engine: string;
  language: string;
  full_text: string | null;
  segments: TranscriptSegment[] | null;
  speaker_count: number | null;
  word_count: number | null;
  summary: string | null;
  summary_model: string | null;
  status: TranscriptStatus;
  created_at: string;
  updated_at: string;
}

export interface TranscriptSegment {
  start: number;
  end: number;
  text: string;
  speaker?: string;
  confidence?: number;
}

export interface MediaJobRow {
  id: string;
  project_id: string;
  job_type: JobType;
  status: JobStatus;
  is_critical: boolean;
  priority: number;
  attempts: number;
  max_attempts: number;
  last_error: string | null;
  claimed_by: string | null;
  claimed_at: string | null;
  heartbeat_at: string | null;
  depends_on: string | null;
  input_data: Record<string, unknown>;
  output_data: Record<string, unknown>;
  queued_at: string;
  started_at: string | null;
  finished_at: string | null;
}

export interface MediaExportRow {
  id: string;
  project_id: string;
  export_type: ExportType;
  storage_path: string;
  file_size_bytes: number | null;
  format_options: Record<string, unknown>;
  version: number;
  created_at: string;
}

export interface MediaIntegrationRow {
  id: string;
  project_id: string;
  service: IntegrationService;
  external_id: string | null;
  external_url: string | null;
  sync_status: SyncStatus;
  last_synced_at: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface MediaPublishTargetRow {
  id: string;
  project_id: string;
  platform: PublishPlatform;
  status: PublishStatus;
  external_url: string | null;
  published_at: string | null;
  scheduled_for: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

// ── Zod Schemas ────────────────────────────────────────────

export const CreateProjectSchema = z.object({
  title: z.string().min(1).max(500),
  description: z.string().max(5000).optional(),
  mediaType: z.enum(MEDIA_TYPES),
  source: z.enum(PROJECT_SOURCES).default('upload'),
  sourceSessionId: z.string().uuid().optional(),
  sourceVoiceNoteId: z.string().uuid().optional(),
  tags: z.array(z.string().max(100)).max(20).default([]),
  privacyLevel: z.enum(['private', 'standard', 'sensitive', 'confidential']).default('private'),
  containsSensitiveContent: z.boolean().default(false),
  clientConsentStatus: z.enum(CONSENT_STATUSES).default('not_required'),
  externalEditingAllowed: z.boolean().default(false),
  publishingAllowed: z.boolean().default(false),
  redactionRequired: z.boolean().default(false),
  aiProcessingAllowed: z.boolean().default(true),
}).strict();

export type CreateProject = z.infer<typeof CreateProjectSchema>;

export const UpdateProjectSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  description: z.string().max(5000).optional().nullable(),
  tags: z.array(z.string().max(100)).max(20).optional(),
  privacyLevel: z.enum(['private', 'standard', 'sensitive', 'confidential']).optional(),
  containsSensitiveContent: z.boolean().optional(),
  clientConsentStatus: z.enum(CONSENT_STATUSES).optional(),
  externalEditingAllowed: z.boolean().optional(),
  publishingAllowed: z.boolean().optional(),
  redactionRequired: z.boolean().optional(),
  aiProcessingAllowed: z.boolean().optional(),
}).strict();

export type UpdateProject = z.infer<typeof UpdateProjectSchema>;

export const ListProjectsSchema = z.object({
  q: z.string().max(200).optional(),
  type: z.enum(MEDIA_TYPES).optional(),
  status: z.enum(PROJECT_STATUSES).optional(),
  sort: z.enum(['created_at', 'updated_at', 'title', 'duration_seconds']).default('created_at'),
  order: z.enum(['asc', 'desc']).default('desc'),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type ListProjects = z.infer<typeof ListProjectsSchema>;

export const CreateExportSchema = z.object({
  exportType: z.enum(EXPORT_TYPES),
  formatOptions: z.record(z.unknown()).default({}),
}).strict();

export type CreateExport = z.infer<typeof CreateExportSchema>;

export const CreateIntegrationSchema = z.object({
  service: z.enum(INTEGRATION_SERVICES),
  externalUrl: z.string().url().optional(),
  externalId: z.string().max(500).optional(),
}).strict();

export type CreateIntegration = z.infer<typeof CreateIntegrationSchema>;

// ── Accepted upload mime types ─────────────────────────────

export const ACCEPTED_AUDIO_MIMES = [
  'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/x-wav',
  'audio/mp4', 'audio/m4a', 'audio/x-m4a', 'audio/aac',
  'audio/ogg', 'audio/webm', 'audio/flac',
] as const;

export const ACCEPTED_VIDEO_MIMES = [
  'video/mp4', 'video/quicktime', 'video/webm',
  'video/x-msvideo', 'video/x-matroska',
] as const;

export const ACCEPTED_IMAGE_MIMES = [
  'image/jpeg', 'image/png', 'image/webp', 'image/gif',
] as const;

export const ALL_ACCEPTED_MIMES = [
  ...ACCEPTED_AUDIO_MIMES,
  ...ACCEPTED_VIDEO_MIMES,
  ...ACCEPTED_IMAGE_MIMES,
] as const;

export function detectMediaType(mimeType: string): MediaType | null {
  if ((ACCEPTED_AUDIO_MIMES as readonly string[]).includes(mimeType)) return 'audio';
  if ((ACCEPTED_VIDEO_MIMES as readonly string[]).includes(mimeType)) return 'video';
  if ((ACCEPTED_IMAGE_MIMES as readonly string[]).includes(mimeType)) return 'image';
  return null;
}

// ── Upload constants ───────────────────────────────────────

export const DEFAULT_MAX_UPLOAD_BYTES = 4 * 1024 * 1024 * 1024; // 4GB
export const CHUNK_SIZE = 10 * 1024 * 1024; // 10MB
export const MIN_DISK_SPACE_BYTES = 1024 * 1024 * 1024; // 1GB minimum free
