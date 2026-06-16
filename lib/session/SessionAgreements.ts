/**
 * Session Room agreement model + plain-language statement generator.
 *
 * Spec:      docs/specs/SESSION_ROOM_VIDEO_SPEC_2026-06-14.md (§3 agreements, §4 provider boundary)
 * Scope:     docs/specs/SESSION_ROOM_VIDEO_PHASE1_SCOPE_2026-06-14.md (consent flow)
 * Migration: database/migrations/20260614000001_session_agreements.sql
 *
 * Pure logic — no IO. Produces the two statements shown at the consent gate:
 *   - maiaRetention: what MAIA will and won't keep (sovereign, true for any provider)
 *   - providerNotice: that the call runs on a third party with its own policies
 *     (undefined for Soullab Video, where the media is sovereign too)
 *
 * Ratified (Kelly 2026-06-14): default = notes; never market external as sovereign video;
 * Notes is practitioner-only (no MAIA memory). The statements are frozen on the session
 * record together with CURRENT_AGREEMENT_VERSION so every past consent stays auditable.
 */

export type AgreementMode = 'sanctuary' | 'notes' | 'reflection' | 'learning' | 'custom';
export type VideoProvider = 'soullab' | 'zoom' | 'meet' | 'doxy' | 'simplepractice' | 'custom';
export type TranscriptRetention = 'none' | 'temporary' | 'kept';

/** Resolved retention profile — what the session is permitted to keep. Stored as consent_flags jsonb. */
export interface RetentionProfile {
  practitionerNotes: boolean; // private notes, markers, follow-ups
  recording: boolean;         // raw A/V recording captured
  transcript: TranscriptRetention;
  summary: boolean;           // session summary + themes
  memory: boolean;            // enters the client continuity record / MAIA long-term
  videoArchive: boolean;      // a stored copy of the video
}

/** Custom-mode toggles (Kelly's custom agreement: recording / transcript / summary / memory / video archive). */
export interface CustomFlags {
  recording?: boolean;
  transcript?: boolean;
  summary?: boolean;
  memory?: boolean;
  videoArchive?: boolean;
}

export interface AgreementStatements {
  maiaRetention: string;
  providerNotice?: string;
  version: string;
}

/** Bump when any statement template or preset profile changes. Pairs with frozen snapshots. */
export const CURRENT_AGREEMENT_VERSION = '2026-06-14.1';

/** Ratified default agreement (Kelly 2026-06-14). */
export const DEFAULT_AGREEMENT_MODE: AgreementMode = 'notes';

/** Runtime lists for request validation (single source of truth with the types above). */
export const AGREEMENT_MODES: readonly AgreementMode[] = ['sanctuary', 'notes', 'reflection', 'learning', 'custom'];
export const VIDEO_PROVIDERS: readonly VideoProvider[] = ['soullab', 'zoom', 'meet', 'doxy', 'simplepractice', 'custom'];

const PRESET_PROFILES: Record<Exclude<AgreementMode, 'custom'>, RetentionProfile> = {
  sanctuary:  { practitionerNotes: false, recording: false, transcript: 'none',      summary: false, memory: false, videoArchive: false },
  notes:      { practitionerNotes: true,  recording: false, transcript: 'none',      summary: false, memory: false, videoArchive: false },
  reflection: { practitionerNotes: true,  recording: false, transcript: 'temporary', summary: true,  memory: true,  videoArchive: false },
  learning:   { practitionerNotes: true,  recording: true,  transcript: 'kept',      summary: true,  memory: true,  videoArchive: true  },
};

/** Display name for the provider notice; null = sovereign (no third-party notice needed). */
const PROVIDER_NAMES: Record<VideoProvider, string | null> = {
  soullab: null,
  zoom: 'Zoom',
  meet: 'Google Meet',
  doxy: 'Doxy.me',
  simplepractice: 'SimplePractice',
  custom: 'the external video link you chose',
};

/** Resolve the retention profile for an agreement mode (custom reads the toggles). */
export function resolveRetentionProfile(mode: AgreementMode, customFlags?: CustomFlags): RetentionProfile {
  if (mode !== 'custom') return { ...PRESET_PROFILES[mode] };
  const f = customFlags ?? {};
  return {
    practitionerNotes: true, // practitioner notes are theirs to keep; turn off via sanctuary
    recording: !!f.recording,
    transcript: f.transcript ? 'kept' : 'none',
    summary: !!f.summary,
    memory: !!f.memory,
    videoArchive: !!f.videoArchive,
  };
}

/** Kept / not-kept item lists for the closing ritual. */
export function keptAndNotKept(profile: RetentionProfile): { kept: string[]; notKept: string[] } {
  const kept: string[] = [];
  const notKept: string[] = [];

  if (profile.practitionerNotes) kept.push('notes, markers, follow-ups');
  if (profile.summary) kept.push('session summary');
  if (profile.memory) kept.push('themes for the continuity record');
  if (profile.recording) kept.push('video recording');
  if (profile.transcript === 'kept') kept.push('transcript');
  if (profile.videoArchive) kept.push('video archive');

  if (!profile.recording) notKept.push('video');
  if (profile.transcript !== 'kept') notKept.push('raw transcript');

  if (kept.length === 0) return { kept: ['date and duration only'], notKept };
  return { kept, notKept };
}

// Frozen copy (Kelly review 2026-06-14). Changing any line requires bumping CURRENT_AGREEMENT_VERSION.
const PRESET_STATEMENTS: Record<Exclude<AgreementMode, 'custom'>, string> = {
  sanctuary:
    "This session won't be remembered. Only basic session metadata is kept, such as date, duration, and consent events. Nothing said here is recorded, transcribed, stored, or added to MAIA's memory.",
  notes:
    "MAIA will keep practitioner notes, markers, and follow-ups for this session. No recording, transcript, or summary is stored, and no session content is added to MAIA's memory unless explicitly marked later.",
  reflection:
    "MAIA will create a summary, themes, and action items for the continuity record. No video is recorded. The live transcript is used only to create the session reflection, then discarded.",
  learning:
    "This learning session keeps the recording, transcript, and summary. It requires explicit consent from both practitioner and client.",
};

function customStatement(profile: RetentionProfile): string {
  const { kept, notKept } = keptAndNotKept(profile);
  if (kept.length === 1 && kept[0] === 'date and duration only') {
    return PRESET_STATEMENTS.sanctuary;
  }
  const keptClause = `MAIA will keep ${joinList(kept)}.`;
  const notKeptClause = notKept.length ? ` It will not keep ${joinList(notKept)}.` : '';
  return keptClause + notKeptClause;
}

function joinList(items: string[]): string {
  if (items.length <= 1) return items[0] ?? '';
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(', ')}, and ${items[items.length - 1]}`;
}

/**
 * Generate the consent-gate statements. The provider notice keeps §4 honest at the point of
 * consent: MAIA governs the retention envelope; the external provider governs the media transport.
 */
export function generateAgreementStatements(input: {
  mode: AgreementMode;
  provider: VideoProvider;
  customFlags?: CustomFlags;
  version?: string;
}): AgreementStatements {
  const { mode, provider, customFlags } = input;
  const version = input.version ?? CURRENT_AGREEMENT_VERSION;

  const maiaRetention =
    mode === 'custom' ? customStatement(resolveRetentionProfile('custom', customFlags)) : PRESET_STATEMENTS[mode];

  const providerName = PROVIDER_NAMES[provider];
  const providerNotice = providerName
    ? `The video call itself opens in ${providerName}, which has its own privacy and retention policies outside MAIA's control.`
    : undefined;

  return { maiaRetention, providerNotice, version };
}

export interface VideoLinkValidation {
  ok: boolean;
  /** The link to persist — null for providers that supply their own room (soullab). */
  videoLink: string | null;
  error?: string;
}

/**
 * Validate a practitioner-set video link at the WRITE point (spec §4). External providers must
 * supply a secure https:// URL; an invalid, non-https, or missing external link is rejected and
 * never persisted. Soullab (native, Phase 3) supplies its own room, so no external URL is stored.
 * Defense-in-depth alongside the client-side https allowlist in SovereignLobby.
 */
export function validateVideoLink(provider: VideoProvider, rawLink: string | null): VideoLinkValidation {
  // Native/internal provider supplies its own room — never persist an external URL for it.
  if (provider === 'soullab') return { ok: true, videoLink: null };

  const link = typeof rawLink === 'string' ? rawLink.trim() : '';
  if (!link) return { ok: false, videoLink: null, error: 'videoLink required for external providers' };

  let parsed: URL;
  try {
    parsed = new URL(link);
  } catch {
    return { ok: false, videoLink: null, error: 'external videoLink must be a valid https:// URL' };
  }
  if (parsed.protocol !== 'https:') {
    return { ok: false, videoLink: null, error: 'external videoLink must use https://' };
  }
  return { ok: true, videoLink: link };
}
