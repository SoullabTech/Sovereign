import openGroundManifestSource from './manifests/open-ground-432-v1.json';
import nightGroundManifestSource from './manifests/night-ground-01-guided-arrival-v0.1.json';
import nightGroundNicoleFirstNightManifestSource from './manifests/night-ground-01-nicole-first-night-v0.1.json';
import nightGroundExtendedNightManifestSource from './manifests/night-ground-01-extended-night-v0.1.json';

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
    sequence?: readonly SoundExperienceMediaEdition[];
  };
  sourceEvidence: {
    listeningGuideSha256: string;
    listeningGuideSizeBytes: number;
    sourcePackageSha256: string;
    sourcePackageSizeBytes: number;
    technicalQualification: string;
  };
  script: null | {
    id: string;
    language: string;
    cueCount: number;
    delivery: string;
    hiddenOrReversedContent: boolean;
    finalCueEndBeforeMs: number;
  };
  voice: null | {
    provider: string;
    voiceId: string;
    displayName: string;
    speed: number;
    clonedVoice: boolean;
    mixRelativeToOrdinaryNarrationDb: number;
  };
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
  continuation?: {
    mode: 'loop_final_segment';
    repeatSegmentIndex: number;
    startsAfterMs: number;
    memberSelectedByExperience: boolean;
    label: string;
  };
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
export const NIGHT_GROUND_EXPERIENCE_MANIFEST =
  nightGroundManifestSource as unknown as SoundExperienceManifest;
export const NIGHT_GROUND_NICOLE_FIRST_NIGHT_EXPERIENCE_MANIFEST =
  nightGroundNicoleFirstNightManifestSource as unknown as SoundExperienceManifest;
export const NIGHT_GROUND_EXTENDED_NIGHT_EXPERIENCE_MANIFEST =
  nightGroundExtendedNightManifestSource as unknown as SoundExperienceManifest;

function validReviewMedia(media: SoundExperienceMediaEdition): boolean {
  return Boolean(media.bundled && media.path?.startsWith('/media/sound-studio/') &&
    /^[a-f0-9]{64}$/.test(media.sha256) && media.durationMs > 0 && media.channels === 2 &&
    (media.sampleRateHz === 44_100 || media.sampleRateHz === 48_000));
}

export function reviewMediaSequence(
  manifest: SoundExperienceManifest,
): readonly SoundExperienceMediaEdition[] | null {
  if (manifest.schema !== 'soullab.sound.experience-manifest.v1' ||
      manifest.status !== 'private_review' ||
      manifest.permissions.scope !== 'authenticated_founder_private_review' ||
      !manifest.permissions.onDemandReview || manifest.permissions.productionRelease ||
      typeof manifest.permissions.looping !== 'boolean' || manifest.permissions.aiAudioAnalysis ||
      manifest.authorship.thirdPartyAudio) return null;
  const sequence = manifest.editions.sequence?.length
    ? manifest.editions.sequence
    : [manifest.editions.defaultReview];
  if (!sequence.every(validReviewMedia)) return null;
  const total = sequence.reduce((sum, media) => sum + media.durationMs, 0);
  if (Math.abs(total - manifest.durationMs) > 250) return null;
  if (manifest.continuation) {
    const continuation = manifest.continuation;
    if (!manifest.permissions.looping || sequence.length < 2 ||
        continuation.mode !== 'loop_final_segment' ||
        continuation.repeatSegmentIndex !== sequence.length - 1 ||
        continuation.startsAfterMs !== manifest.durationMs ||
        !continuation.memberSelectedByExperience) return null;
  }
  return sequence;
}

export function reviewMediaEdition(
  manifest: SoundExperienceManifest,
): SoundExperienceMediaEdition | null {
  return reviewMediaSequence(manifest)?.[0] ?? null;
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
  fieldLabel?: string;
  immersiveQuestion?: string;
  qualityStatement?: string;
  durationLabel?: string;
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
  fieldLabel: 'FIELD 01 · MUSIC ONLY · PRIVATE REVIEW',
  immersiveQuestion: 'What can a sustained tonal world reveal when we give it time, subtle internal movement and a carefully composed return?',
  qualityStatement: 'EXACT REVIEWED AAC EDITION · 24-BIT MASTER PRESERVED · EXISTING PERSISTENT PLAYER · NO BIOMETRICS · NO HIDDEN ANALYSIS',
};

export const NIGHT_GROUND_EXTENDED_NIGHT: SoundStudioWork = {
  id: NIGHT_GROUND_EXTENDED_NIGHT_EXPERIENCE_MANIFEST.experienceId,
  title: NIGHT_GROUND_EXTENDED_NIGHT_EXPERIENCE_MANIFEST.title,
  subtitle: NIGHT_GROUND_EXTENDED_NIGHT_EXPERIENCE_MANIFEST.subtitle,
  durationMs: NIGHT_GROUND_EXTENDED_NIGHT_EXPERIENCE_MANIFEST.durationMs,
  durationLabel: '109 min, then until Stop',
  state: 'review',
  kind: 'Dream Field extended-night meditation · core-only continuation',
  description: 'Nicole opens the field once. Arrival and descent play once; after the first 109 minutes only the continuous music core repeats until you Stop.',
  mood: 'rest',
  frequencies: [72, 144, 216],
  qualities: ['Nicole once', 'Core repeats', 'Until Stop', 'No automatic dawn return'],
  primaryDoor: 'experience',
  passages: NIGHT_GROUND_EXTENDED_NIGHT_EXPERIENCE_MANIFEST.passages,
  manifest: NIGHT_GROUND_EXTENDED_NIGHT_EXPERIENCE_MANIFEST,
  fieldLabel: 'DREAM FIELD 01 · EXTENDED NIGHT · PRIVATE REVIEW',
  immersiveQuestion: 'What becomes possible when guidance opens the threshold once, then only the continuous night field remains?',
  qualityStatement: 'EXACT NICOLE FIRST-NIGHT SEQUENCE · FINAL MUSIC CORE CONTINUES UNTIL STOP · VOICE NEVER REPEATS · RELEASE HOLD',
};

export const NIGHT_GROUND_NICOLE_FIRST_NIGHT: SoundStudioWork = {
  id: NIGHT_GROUND_NICOLE_FIRST_NIGHT_EXPERIENCE_MANIFEST.experienceId,
  title: NIGHT_GROUND_NICOLE_FIRST_NIGHT_EXPERIENCE_MANIFEST.title,
  subtitle: NIGHT_GROUND_NICOLE_FIRST_NIGHT_EXPERIENCE_MANIFEST.subtitle,
  durationMs: NIGHT_GROUND_NICOLE_FIRST_NIGHT_EXPERIENCE_MANIFEST.durationMs,
  state: 'review',
  kind: 'Dream Field first-night meditation · two-part exact review sequence',
  description: 'Nicole appears only in the opening. After twelve minutes the voice is gone and the same Night Ground field continues through the night without returning to guidance.',
  mood: 'rest',
  frequencies: [72, 144, 216],
  qualities: ['Nicole / Kokoro', '109 minutes', 'Voice once', 'No automatic loop'],
  primaryDoor: 'experience',
  passages: NIGHT_GROUND_NICOLE_FIRST_NIGHT_EXPERIENCE_MANIFEST.passages,
  manifest: NIGHT_GROUND_NICOLE_FIRST_NIGHT_EXPERIENCE_MANIFEST,
  fieldLabel: 'DREAM FIELD 01 · NICOLE FIRST NIGHT · PRIVATE REVIEW',
  immersiveQuestion: 'What changes when guidance appears only long enough to open the threshold, then disappears for the rest of the night field?',
  qualityStatement: 'EXACT 109-MINUTE PRIVATE REVIEW · NICOLE ONCE · TWO CONTIGUOUS AAC SEGMENTS · ORIGINAL 48 KHZ NIGHT GROUND SOURCE PRESERVED · RELEASE HOLD',
};

export const NIGHT_GROUND: SoundStudioWork = {
  id: NIGHT_GROUND_EXPERIENCE_MANIFEST.experienceId,
  title: NIGHT_GROUND_EXPERIENCE_MANIFEST.title,
  subtitle: NIGHT_GROUND_EXPERIENCE_MANIFEST.subtitle,
  durationMs: NIGHT_GROUND_EXPERIENCE_MANIFEST.durationMs,
  state: 'review',
  kind: 'Dream Field guided arrival · exact reviewed media edition',
  description: 'A sparse guided entrance into Night Ground. Bella speaks five quiet cues, then leaves the field without hidden suggestion or automatic continuation.',
  mood: 'rest',
  frequencies: [72, 144, 216],
  qualities: ['A4 = 432 Hz reference', 'Bella / Kokoro', '12 minutes', 'Guidance does not loop'],
  primaryDoor: 'experience',
  passages: NIGHT_GROUND_EXPERIENCE_MANIFEST.passages,
  manifest: NIGHT_GROUND_EXPERIENCE_MANIFEST,
  fieldLabel: 'DREAM FIELD 01 · GUIDED ARRIVAL · PRIVATE REVIEW',
  immersiveQuestion: 'What changes when a voice offers only enough orientation to let the night field become self-sustaining?',
  qualityStatement: 'EXACT GUIDED AAC EDITION · 24-BIT MASTER PRESERVED · BELLA / KOKORO · NO HIDDEN SUGGESTION · LOOP HELD',
};

export const SOUND_STUDIO_WORKS: readonly SoundStudioWork[] = [
  OPEN_GROUND,
  NIGHT_GROUND_EXTENDED_NIGHT,
  NIGHT_GROUND_NICOLE_FIRST_NIGHT,
  NIGHT_GROUND,
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
