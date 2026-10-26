/**
 * LISTEN-50 · First eight Focus Field channel production packages.
 *
 * This module names and constrains the first eight intended Focus Field
 * channels. It does not contain recordings, media URLs, provider identifiers,
 * rights holders, entitlements, or a playback grant. Every candidate remains
 * fail-closed until independently verified rights and media custody issue an
 * admitted, short-lived delivery authority outside this model.
 */

import {
  FOCUS_MUSICAL_WORLDS,
  FOCUS_NEEDS,
  FOCUS_STIMULATION_LEVELS,
  FOCUS_TASK_KINDS,
  type FocusMusicalWorld,
  type FocusNeed,
  type FocusStimulation,
  type FocusTaskKind,
} from './focusFieldSession';

export const FOCUS_CHANNEL_CATALOG_FORMAT = 'SOULLAB_FOCUS_CHANNEL_CATALOG_V1' as const;
export const FOCUS_CHANNEL_EVIDENCE_FORMAT = 'SOULLAB_FOCUS_CHANNEL_EVIDENCE_V1' as const;
export const FOCUS_CHANNEL_MEDIA_AUTHORITY = 'none' as const;
export const FOCUS_CHANNEL_PLAYBACK_STATE = 'blocked' as const;

export const FOCUS_CHANNEL_IDS = [
  'deep-classical',
  'piano-concentration',
  'ambient-stillness',
  'cinematic-momentum',
  'organic-attention',
  'downtempo-flow',
  'nature-current',
  'high-stimulation-focus',
] as const;
export type FocusChannelId = typeof FOCUS_CHANNEL_IDS[number];

export const FOCUS_CHANNEL_RIGHTS_RECEIPTS = [
  'master',
  'composition',
  'performer',
  'sample-status',
  'territory',
  'license-term',
  'private-on-demand',
  'timed-focus-session',
  'cross-route-playback',
  'background-playback',
  'mobile-playback',
  'editing-looping',
  'credits-attribution',
  'withdrawal-revocation',
] as const;
export type FocusChannelRightsReceiptKind = typeof FOCUS_CHANNEL_RIGHTS_RECEIPTS[number];

export const FOCUS_CHANNEL_EXCLUDED_USES = [
  'download',
  'offline-cabin',
  'public-broadcast',
  'shared-session',
  'unbounded-remix',
  'stem-isolation',
  'ai-analysis',
  'model-training',
  'voice-imitation',
] as const;
export type FocusChannelExcludedUse = typeof FOCUS_CHANNEL_EXCLUDED_USES[number];

export const FOCUS_CHANNEL_SESSION_ARCS = [25, 50, 90] as const;
export type FocusChannelSessionArc = typeof FOCUS_CHANNEL_SESSION_ARCS[number];

export interface FocusChannelProductionBrief {
  readonly humanAuthoredRequired: true;
  readonly lexicalVocals: 'none';
  readonly suddenEvents: 'avoid';
  readonly startupBlast: 'prohibited';
  readonly loopPolicy: 'seamless-and-explicitly-authorized-only';
  readonly variationPolicy: 'artist-authorized-only';
  readonly sessionArcsMinutes: readonly FocusChannelSessionArc[];
  readonly untimedContinuation: true;
  readonly sonicBrief: string;
  readonly attentionBrief: string;
  readonly avoid: readonly string[];
}

export interface FocusChannelCandidate {
  readonly format: typeof FOCUS_CHANNEL_CATALOG_FORMAT;
  readonly id: FocusChannelId;
  readonly title: string;
  readonly musicalWorld: FocusMusicalWorld;
  readonly focusNeeds: readonly FocusNeed[];
  readonly taskKinds: readonly FocusTaskKind[];
  readonly stimulation: readonly FocusStimulation[];
  readonly defaultStimulation: FocusStimulation;
  readonly production: FocusChannelProductionBrief;
  readonly requestedReceipts: readonly FocusChannelRightsReceiptKind[];
  readonly excludedUses: readonly FocusChannelExcludedUse[];
  readonly admission: 'production-brief-only';
  readonly mediaFingerprint: null;
  readonly mediaUrl: null;
  readonly playable: false;
}

export type FocusChannelReceiptState =
  | 'missing'
  | 'pending'
  | 'verified'
  | 'rejected'
  | 'expired';

export interface FocusChannelEvidenceReceipt {
  readonly kind: FocusChannelRightsReceiptKind;
  readonly state: FocusChannelReceiptState;
  /** Opaque reference only. This model never treats the string as proof. */
  readonly evidenceRef: string | null;
  readonly verifiedAt: string | null;
  readonly expiresAt: string | null;
}

export interface FocusChannelMediaEvidence {
  readonly sha256: string;
  readonly bytes: number;
  readonly format: 'wav' | 'flac';
  readonly sampleRateHz: 44100 | 48000 | 96000;
  readonly bitDepth: 16 | 24;
  readonly durationSeconds: number;
}

export interface FocusChannelEvidencePackage {
  readonly format: typeof FOCUS_CHANNEL_EVIDENCE_FORMAT;
  readonly channelId: FocusChannelId;
  readonly media: FocusChannelMediaEvidence | null;
  readonly receipts: readonly FocusChannelEvidenceReceipt[];
}

export interface FocusChannelReadiness {
  readonly channelId: FocusChannelId;
  readonly structurallyReadyForIndependentAdmission: boolean;
  readonly playable: false;
  readonly mediaAuthority: typeof FOCUS_CHANNEL_MEDIA_AUTHORITY;
  readonly reasons: readonly string[];
}

const SHARED_PRODUCTION_RULES = {
  humanAuthoredRequired: true,
  lexicalVocals: 'none',
  suddenEvents: 'avoid',
  startupBlast: 'prohibited',
  loopPolicy: 'seamless-and-explicitly-authorized-only',
  variationPolicy: 'artist-authorized-only',
  sessionArcsMinutes: FOCUS_CHANNEL_SESSION_ARCS,
  untimedContinuation: true,
} as const;

const SHARED_EXCLUDED_USES = [...FOCUS_CHANNEL_EXCLUDED_USES] as const;
const SHARED_RECEIPTS = [...FOCUS_CHANNEL_RIGHTS_RECEIPTS] as const;

export const FOCUS_CHANNEL_CANDIDATES: readonly FocusChannelCandidate[] = [
  {
    format: FOCUS_CHANNEL_CATALOG_FORMAT,
    id: 'deep-classical',
    title: 'Deep Classical',
    musicalWorld: 'classical',
    focusNeeds: ['deep', 'steady'],
    taskKinds: ['writing', 'reading', 'studying', 'thinking'],
    stimulation: ['low', 'medium'],
    defaultStimulation: 'medium',
    production: {
      ...SHARED_PRODUCTION_RULES,
      sonicBrief: 'Long-breath chamber and orchestral writing with restrained thematic change, clear acoustic space and stable forward motion.',
      attentionBrief: 'Support sustained language and conceptual work without demanding narrative attention.',
      avoid: ['virtuosic display', 'abrupt cadences', 'large dynamic shocks', 'recognizable dramatic quotations'],
    },
    requestedReceipts: SHARED_RECEIPTS,
    excludedUses: SHARED_EXCLUDED_USES,
    admission: 'production-brief-only',
    mediaFingerprint: null,
    mediaUrl: null,
    playable: false,
  },
  {
    format: FOCUS_CHANNEL_CATALOG_FORMAT,
    id: 'piano-concentration',
    title: 'Piano Concentration',
    musicalWorld: 'classical',
    focusNeeds: ['steady', 'deep', 'create'],
    taskKinds: ['writing', 'reading', 'thinking', 'creative-work'],
    stimulation: ['low', 'medium'],
    defaultStimulation: 'low',
    production: {
      ...SHARED_PRODUCTION_RULES,
      sonicBrief: 'Human-played solo or lightly prepared piano with spacious phrasing, low repetition fatigue and gentle harmonic continuity.',
      attentionBrief: 'Offer a familiar acoustic anchor while leaving enough silence for reading and composition.',
      avoid: ['showpiece repertoire', 'melodic hooks that solicit recall', 'hard attacks', 'mechanical quantization'],
    },
    requestedReceipts: SHARED_RECEIPTS,
    excludedUses: SHARED_EXCLUDED_USES,
    admission: 'production-brief-only',
    mediaFingerprint: null,
    mediaUrl: null,
    playable: false,
  },
  {
    format: FOCUS_CHANNEL_CATALOG_FORMAT,
    id: 'ambient-stillness',
    title: 'Ambient Stillness',
    musicalWorld: 'ambient',
    focusNeeds: ['arrive', 'deep', 'reset'],
    taskKinds: ['reading', 'thinking', 'open-work', 'writing'],
    stimulation: ['low'],
    defaultStimulation: 'low',
    production: {
      ...SHARED_PRODUCTION_RULES,
      sonicBrief: 'Slow harmonic fields, organic resonance and near-silence with no foreground melody or compulsory pulse.',
      attentionBrief: 'Reduce sonic demand and provide a quiet perceptual horizon for settling and long-form thought.',
      avoid: ['high-frequency shimmer fatigue', 'sudden spatial movement', 'short obvious loops', 'healing-frequency claims'],
    },
    requestedReceipts: SHARED_RECEIPTS,
    excludedUses: SHARED_EXCLUDED_USES,
    admission: 'production-brief-only',
    mediaFingerprint: null,
    mediaUrl: null,
    playable: false,
  },
  {
    format: FOCUS_CHANNEL_CATALOG_FORMAT,
    id: 'cinematic-momentum',
    title: 'Cinematic Momentum',
    musicalWorld: 'cinematic',
    focusNeeds: ['activate', 'create', 'deep'],
    taskKinds: ['creative-work', 'writing', 'administration', 'thinking'],
    stimulation: ['medium', 'high'],
    defaultStimulation: 'medium',
    production: {
      ...SHARED_PRODUCTION_RULES,
      sonicBrief: 'Evolving orchestral and textural arcs with measured pulse, scale and lift but no trailer-style climax.',
      attentionBrief: 'Provide emotional propulsion for generative or difficult work without becoming a foreground story.',
      avoid: ['heroic drops', 'jump-scare percussion', 'cinematic dialogue', 'rapid cue changes'],
    },
    requestedReceipts: SHARED_RECEIPTS,
    excludedUses: SHARED_EXCLUDED_USES,
    admission: 'production-brief-only',
    mediaFingerprint: null,
    mediaUrl: null,
    playable: false,
  },
  {
    format: FOCUS_CHANNEL_CATALOG_FORMAT,
    id: 'organic-attention',
    title: 'Organic Attention',
    musicalWorld: 'organic',
    focusNeeds: ['steady', 'create', 'arrive'],
    taskKinds: ['writing', 'creative-work', 'open-work', 'reading'],
    stimulation: ['low', 'medium'],
    defaultStimulation: 'medium',
    production: {
      ...SHARED_PRODUCTION_RULES,
      sonicBrief: 'Acoustic instruments, hand-played textures and subtle human timing with warmth, breath and uncluttered arrangement.',
      attentionBrief: 'Keep a sense of living presence and tactility during creative or reflective work.',
      avoid: ['busy solos', 'lyrical vocals', 'folkloric borrowing without custody', 'over-compressed intimacy'],
    },
    requestedReceipts: SHARED_RECEIPTS,
    excludedUses: SHARED_EXCLUDED_USES,
    admission: 'production-brief-only',
    mediaFingerprint: null,
    mediaUrl: null,
    playable: false,
  },
  {
    format: FOCUS_CHANNEL_CATALOG_FORMAT,
    id: 'downtempo-flow',
    title: 'Downtempo Flow',
    musicalWorld: 'electronic',
    focusNeeds: ['steady', 'activate', 'create'],
    taskKinds: ['coding', 'administration', 'creative-work', 'open-work'],
    stimulation: ['medium', 'high'],
    defaultStimulation: 'medium',
    production: {
      ...SHARED_PRODUCTION_RULES,
      sonicBrief: 'Deep restrained electronic rhythm, warm bass and slowly changing texture with worldly downtempo atmosphere.',
      attentionBrief: 'Support momentum and repetition-heavy work while keeping melodic demand low.',
      avoid: ['club drops', 'advertising-style stingers', 'vocal hooks', 'fatiguing sub-bass'],
    },
    requestedReceipts: SHARED_RECEIPTS,
    excludedUses: SHARED_EXCLUDED_USES,
    admission: 'production-brief-only',
    mediaFingerprint: null,
    mediaUrl: null,
    playable: false,
  },
  {
    format: FOCUS_CHANNEL_CATALOG_FORMAT,
    id: 'nature-current',
    title: 'Nature Current',
    musicalWorld: 'nature',
    focusNeeds: ['arrive', 'reset', 'deep'],
    taskKinds: ['reading', 'thinking', 'open-work', 'studying'],
    stimulation: ['low', 'medium'],
    defaultStimulation: 'low',
    production: {
      ...SHARED_PRODUCTION_RULES,
      sonicBrief: 'Ethically captured natural sound integrated with restrained musical texture rather than pasted on as a decorative loop.',
      attentionBrief: 'Offer environmental spaciousness and gentle continuity for settling, study and reflective thought.',
      avoid: ['stock-library clichés', 'short repeating wildlife calls', 'unverified field-recording provenance', 'nature-as-therapy claims'],
    },
    requestedReceipts: SHARED_RECEIPTS,
    excludedUses: SHARED_EXCLUDED_USES,
    admission: 'production-brief-only',
    mediaFingerprint: null,
    mediaUrl: null,
    playable: false,
  },
  {
    format: FOCUS_CHANNEL_CATALOG_FORMAT,
    id: 'high-stimulation-focus',
    title: 'High-Stimulation Focus',
    musicalWorld: 'rhythmic',
    focusNeeds: ['activate', 'steady'],
    taskKinds: ['coding', 'administration', 'studying', 'open-work'],
    stimulation: ['high'],
    defaultStimulation: 'high',
    production: {
      ...SHARED_PRODUCTION_RULES,
      sonicBrief: 'Strong but controlled pulse, layered percussion and bounded novelty with stable loudness and no verbal interruption.',
      attentionBrief: 'Provide enough movement for members who find quiet sound under-stimulating, without diagnosing why.',
      avoid: ['startling breaks', 'competitive loudness', 'rapid genre switching', 'ADHD treatment claims'],
    },
    requestedReceipts: SHARED_RECEIPTS,
    excludedUses: SHARED_EXCLUDED_USES,
    admission: 'production-brief-only',
    mediaFingerprint: null,
    mediaUrl: null,
    playable: false,
  },
] as const;

const SHA256 = /^[a-f0-9]{64}$/;
const ISO_TIME = /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d+)?Z$/;

function isChoice<T extends string>(value: unknown, choices: readonly T[]): value is T {
  return typeof value === 'string' && choices.includes(value as T);
}

function validTime(value: unknown): value is string {
  return typeof value === 'string' && ISO_TIME.test(value) && Number.isFinite(Date.parse(value));
}

export function focusChannelById(id: FocusChannelId): FocusChannelCandidate {
  const channel = FOCUS_CHANNEL_CANDIDATES.find(candidate => candidate.id === id);
  if (!channel) throw new Error('Focus channel is not part of the admitted production set.');
  return channel;
}

export function emptyFocusChannelEvidence(channelId: FocusChannelId): FocusChannelEvidencePackage {
  focusChannelById(channelId);
  return {
    format: FOCUS_CHANNEL_EVIDENCE_FORMAT,
    channelId,
    media: null,
    receipts: FOCUS_CHANNEL_RIGHTS_RECEIPTS.map(kind => ({
      kind,
      state: 'missing' as const,
      evidenceRef: null,
      verifiedAt: null,
      expiresAt: null,
    })),
  };
}

export function assessFocusChannelEvidence(
  input: FocusChannelEvidencePackage,
  atValue: string | Date,
): FocusChannelReadiness {
  const now = atValue instanceof Date ? new Date(atValue.getTime()) : new Date(atValue);
  if (!Number.isFinite(now.getTime())) throw new Error('Assessment time is invalid.');
  const channel = focusChannelById(input.channelId);
  const reasons: string[] = [];

  if (input.format !== FOCUS_CHANNEL_EVIDENCE_FORMAT)
    reasons.push('EVIDENCE_FORMAT_INVALID');

  const media = input.media;
  if (!media) reasons.push('MEDIA_MISSING');
  else {
    if (!SHA256.test(media.sha256)) reasons.push('MEDIA_FINGERPRINT_INVALID');
    if (!Number.isSafeInteger(media.bytes) || media.bytes <= 0) reasons.push('MEDIA_SIZE_INVALID');
    if (!['wav', 'flac'].includes(media.format)) reasons.push('MEDIA_FORMAT_INVALID');
    if (![44100, 48000, 96000].includes(media.sampleRateHz)) reasons.push('MEDIA_SAMPLE_RATE_INVALID');
    if (![16, 24].includes(media.bitDepth)) reasons.push('MEDIA_BIT_DEPTH_INVALID');
    if (!Number.isFinite(media.durationSeconds) || media.durationSeconds < 5 * 60)
      reasons.push('MEDIA_DURATION_TOO_SHORT');
  }

  const receipts = new Map<FocusChannelRightsReceiptKind, FocusChannelEvidenceReceipt>();
  for (const receipt of input.receipts ?? []) {
    if (!isChoice(receipt?.kind, FOCUS_CHANNEL_RIGHTS_RECEIPTS)) {
      reasons.push('RIGHTS_RECEIPT_KIND_INVALID');
      continue;
    }
    if (receipts.has(receipt.kind)) {
      reasons.push(`RIGHTS_RECEIPT_DUPLICATE:${receipt.kind}`);
      continue;
    }
    receipts.set(receipt.kind, receipt);
  }

  for (const kind of channel.requestedReceipts) {
    const receipt = receipts.get(kind);
    if (!receipt) {
      reasons.push(`RIGHTS_RECEIPT_MISSING:${kind}`);
      continue;
    }
    if (receipt.state !== 'verified') {
      reasons.push(`RIGHTS_RECEIPT_NOT_VERIFIED:${kind}`);
      continue;
    }
    if (!receipt.evidenceRef?.trim()) reasons.push(`RIGHTS_EVIDENCE_REF_MISSING:${kind}`);
    if (!validTime(receipt.verifiedAt) || Date.parse(receipt.verifiedAt) > now.getTime())
      reasons.push(`RIGHTS_VERIFIED_TIME_INVALID:${kind}`);
    if (receipt.expiresAt !== null &&
        (!validTime(receipt.expiresAt) || Date.parse(receipt.expiresAt) <= now.getTime()))
      reasons.push(`RIGHTS_RECEIPT_EXPIRED:${kind}`);
  }

  const structurallyReadyForIndependentAdmission = reasons.length === 0;
  return {
    channelId: channel.id,
    structurallyReadyForIndependentAdmission,
    playable: false,
    mediaAuthority: FOCUS_CHANNEL_MEDIA_AUTHORITY,
    reasons: structurallyReadyForIndependentAdmission
      ? ['INDEPENDENT_MEDIA_AUTHORITY_REQUIRED']
      : reasons,
  };
}
