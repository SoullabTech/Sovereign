import openGroundManifestSource from './manifests/open-ground-432-v1.json';

export type SoundStudioDoorID = 'experience' | 'explore' | 'create' | 'professional';

export type SoundStudioDoor = {
  id: SoundStudioDoorID;
  eyebrow: string;
  title: string;
  invitation: string;
  possibilities: readonly string[];
};

export type SoundExperiencePassage = {
  id: string;
  label: string;
  startMs: number;
  endMs: number;
  invitation: string;
};

export type SoundExperiencePlayback = {
  id: string;
  title: string;
  subtitle: string;
  durationMs: number;
  passages: readonly SoundExperiencePassage[];
};

export type SoundExperienceMediaEdition = {
  id: string;
  role: 'mobile_listening_review' | 'preservation_master';
  path: string | null;
  mimeType: string;
  codecLabel: string;
  sha256: string;
  sizeBytes: number;
  sampleRateHz: number;
  channels: number;
  durationMs: number;
  bundled: boolean;
  custody?: string;
};

export type SoundExperienceManifest = {
  schema: 'soullab.sound.experience-manifest.v1';
  manifestId: string;
  experienceId: string;
  version: string;
  title: string;
  subtitle: string;
  status: 'private_review';
  ownerLane: string;
  durationMs: number;
  authorship: {
    creativeDirection: string;
    composition: string;
    performers: readonly string[];
    thirdPartyAudio: boolean;
    learnedAudioModel: boolean;
  };
  editions: {
    defaultReview: SoundExperienceMediaEdition;
    preservationMaster: SoundExperienceMediaEdition;
  };
  sourceEvidence: {
    listeningGuideSha256: string;
    listeningGuideSizeBytes: number;
    sourcePackageSha256: string;
    sourcePackageSizeBytes: number;
    technicalQualification: string;
  };
  script: null;
  voice: null;
  techniques: {
    tuningReferenceHz: number;
    tonalCenterHz: number;
    rootHz: number;
    pitchSystem: string;
    regularBeat: boolean;
    designedBinauralProtocol: boolean;
    designedIsochronicProtocol: boolean;
    fadeInSeconds: number;
    fadeOutSeconds: number;
  };
  passages: readonly SoundExperiencePassage[];
  permissions: {
    scope: 'authenticated_founder_private_review';
    onDemandReview: boolean;
    productionRelease: boolean;
    download: boolean;
    offlineCabin: boolean;
    shaping: boolean;
    looping: boolean;
    aiAudioAnalysis: boolean;
    thirdPartyRights: 'none_present';
    rightsAuthority: string;
  };
  acceptance: Record<string, string>;
};

export const OPEN_GROUND_EXPERIENCE_MANIFEST =
  openGroundManifestSource as unknown as SoundExperienceManifest;

export function reviewMediaEdition(
  manifest: SoundExperienceManifest,
): SoundExperienceMediaEdition | null {
  const media = manifest.editions.defaultReview;
  if (manifest.schema !== 'soullab.sound.experience-manifest.v1' ||
      manifest.status !== 'private_review' ||
      manifest.permissions.scope !== 'authenticated_founder_private_review' ||
      !manifest.permissions.onDemandReview ||
      manifest.permissions.productionRelease ||
      typeof manifest.permissions.looping !== 'boolean' ||
      manifest.permissions.aiAudioAnalysis ||
      manifest.authorship.thirdPartyAudio ||
      !media.bundled || !media.path?.startsWith('/media/sound-studio/') ||
      !/^[a-f0-9]{64}$/.test(media.sha256) ||
      media.durationMs !== manifest.durationMs ||
      media.channels !== 2 || media.sampleRateHz !== 48_000) return null;
  return media;
}

export type SoundStudioWork = SoundExperiencePlayback & {
  state: 'review' | 'study' | 'proposed';
  kind: string;
  description: string;
  mood: 'focus' | 'create' | 'drift' | 'rest';
  frequencies: readonly [number, number, number];
  qualities: readonly string[];
  primaryDoor: SoundStudioDoorID;
  manifest?: SoundExperienceManifest;
};

export const SOUND_STUDIO_DOORS: readonly SoundStudioDoor[] = [
  {
    id: 'experience',
    eyebrow: 'RECEIVE',
    title: 'Experience',
    invitation: 'Listen, focus, meditate, rest, prepare or return to a field you know.',
    possibilities: ['Personal listening', 'Guided thresholds', 'Focus Field', 'Sound Shelf'],
  },
  {
    id: 'explore',
    eyebrow: 'INQUIRE',
    title: 'Explore',
    invitation: 'Compare versions, investigate sound and learn through careful listening.',
    possibilities: ['A/B listening', 'Tuning and pulse', 'Deep listening', 'Research questions'],
  },
  {
    id: 'create',
    eyebrow: 'MAKE',
    title: 'Create',
    invitation: 'Compose a journey, shape permitted layers and develop work through return.',
    possibilities: ['Journey design', 'Voice and silence', 'Versioning', 'Private creation'],
  },
  {
    id: 'professional',
    eyebrow: 'REFINE',
    title: 'Professional / Research',
    invitation: 'Bring musicianship, engineering, cultural stewardship and disciplined inquiry.',
    possibilities: ['Stems and provenance', 'Artist collaboration', 'Technical evidence', 'Neuropod studies'],
  },
] as const;

export const OPEN_GROUND: SoundStudioWork = {
  id: OPEN_GROUND_EXPERIENCE_MANIFEST.experienceId,
  title: OPEN_GROUND_EXPERIENCE_MANIFEST.title,
  subtitle: OPEN_GROUND_EXPERIENCE_MANIFEST.subtitle,
  durationMs: OPEN_GROUND_EXPERIENCE_MANIFEST.durationMs,
  state: 'review',
  kind: 'Original procedural composition · exact reviewed media edition',
  description: 'A low foundation, slowly changing overtones and a quiet field of air. Nothing to achieve; enough time to notice what becomes perceptible.',
  mood: 'drift',
  frequencies: [72, 144, 216],
  qualities: ['A4 = 432 Hz reference', 'AAC review edition', '24-bit master preserved', 'Six minutes'],
  primaryDoor: 'experience',
  passages: OPEN_GROUND_EXPERIENCE_MANIFEST.passages,
  manifest: OPEN_GROUND_EXPERIENCE_MANIFEST,
};
export const SOUND_STUDIO_WORKS: readonly SoundStudioWork[] = [
  OPEN_GROUND,
  {
    id: 'still-current-study-01',
    title: 'Still Current',
    subtitle: 'Spacious ambient attention',
    durationMs: 25 * 60 * 1000,
    state: 'study',
    kind: 'Original soundscape study',
    description: 'Evolving harmony, quiet texture and sparse musical detail for unhurried attention.',
    mood: 'rest',
    frequencies: [110, 164.81, 220],
    qualities: ['Ambient', '25 minutes', 'Music only'],
    primaryDoor: 'experience',
    passages: [
      { id: 'arrival', label: 'Arrival', startMs: 0, endMs: 150_000, invitation: 'Establish space and a gentle center.' },
      { id: 'presence', label: 'Steady presence', startMs: 150_000, endMs: 420_000, invitation: 'Allow restrained detail to emerge.' },
      { id: 'middle', label: 'Open middle', startMs: 420_000, endMs: 840_000, invitation: 'Stay with gradual harmonic change.' },
      { id: 'return', label: 'Return', startMs: 840_000, endMs: 1_500_000, invitation: 'Let intensity recede toward silence.' },
    ],
  },
  {
    id: 'organic-attention-softer-pulse-v1',
    title: 'Organic Attention',
    subtitle: 'Warm continuity for meaningful work',
    durationMs: 30 * 60 * 1000,
    state: 'study',
    kind: 'Focus soundscape study',
    description: 'Warm harmony with a restrained pulse for writing, reading, making and sustained ordinary work.',
    mood: 'focus',
    frequencies: [110, 165, 220],
    qualities: ['Soft pulse', '30 minutes', 'Focus'],
    primaryDoor: 'experience',
    passages: [
      { id: 'arrival', label: 'Arrival', startMs: 0, endMs: 120_000, invitation: 'Let the tonal space establish itself.' },
      { id: 'settling', label: 'Settling', startMs: 120_000, endMs: 300_000, invitation: 'Allow the pulse to enter gently.' },
      { id: 'attention', label: 'Sustained attention', startMs: 300_000, endMs: 1_500_000, invitation: 'Let movement support the work without demanding it.' },
      { id: 'return', label: 'Return', startMs: 1_500_000, endMs: 1_800_000, invitation: 'Let rhythm withdraw and make room for completion.' },
    ],
  },
  {
    id: 'clear-voice-v1',
    title: 'Clear Voice',
    subtitle: 'Presence before a consequential conversation',
    durationMs: 23 * 60 * 1000,
    state: 'study',
    kind: 'Guided threshold experience',
    description: 'A practice of regulation, retrieval and confidence: hear, pause, find, speak, stop.',
    mood: 'focus',
    frequencies: [110, 164.81, 220],
    qualities: ['Guided', '23 minutes', 'Preparation'],
    primaryDoor: 'experience',
    passages: [
      { id: 'arrive', label: 'Arrive', startMs: 0, endMs: 180_000, invitation: 'Let the body and room become available.' },
      { id: 'voice', label: 'Natural voice', startMs: 180_000, endMs: 420_000, invitation: 'Speak slowly enough to hear yourself.' },
      { id: 'retrieval', label: 'Retrieval', startMs: 420_000, endMs: 930_000, invitation: 'Let lived experience carry the answer.' },
      { id: 'practice', label: 'Interview rhythm', startMs: 930_000, endMs: 1_260_000, invitation: 'Hear, pause, find, speak, stop.' },
      { id: 'return', label: 'Return', startMs: 1_260_000, endMs: 1_380_000, invitation: 'Remember what remains available to you.' },
    ],
  },
] as const;

export function soundPassageAt(
  passages: readonly SoundExperiencePassage[],
  elapsedMs: number,
): SoundExperiencePassage | null {
  if (!passages.length) return null;
  const elapsed = Math.max(0, elapsedMs);
  return passages.find(passage => elapsed >= passage.startMs && elapsed < passage.endMs)
    ?? passages[passages.length - 1];
}

export function soundProgress(durationMs: number | null | undefined, elapsedMs: number): number {
  if (!durationMs || durationMs <= 0) return 0;
  return Math.max(0, Math.min(1, elapsedMs / durationMs));
}

export function formatExperienceTime(milliseconds: number): string {
  const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));
  return `${Math.floor(totalSeconds / 60)}:${String(totalSeconds % 60).padStart(2, '0')}`;
}
