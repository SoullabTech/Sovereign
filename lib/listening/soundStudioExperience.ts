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

export type SoundStudioWork = SoundExperiencePlayback & {
  state: 'review' | 'study' | 'proposed';
  kind: string;
  description: string;
  mood: 'focus' | 'create' | 'drift' | 'rest';
  frequencies: readonly [number, number, number];
  qualities: readonly string[];
  primaryDoor: SoundStudioDoorID;
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
  id: 'open-ground-432-v1',
  title: 'Open Ground',
  subtitle: 'A sustained tonal world',
  durationMs: 6 * 60 * 1000,
  state: 'review',
  kind: 'Drone study · procedural review edition',
  description: 'A low foundation, slowly changing overtones and a quiet field of air. Nothing to achieve; enough time to notice what becomes perceptible.',
  mood: 'drift',
  frequencies: [72, 144, 216],
  qualities: ['A4 = 432 Hz reference', 'No regular beat', 'Music only', 'Six minutes'],
  primaryDoor: 'experience',
  passages: [
    { id: 'arrival', label: 'Arrival', startMs: 0, endMs: 60_000, invitation: 'Let the tonal center meet the room around you.' },
    { id: 'opening', label: 'Opening', startMs: 60_000, endMs: 150_000, invitation: 'Intervals and overtone color become perceptible.' },
    { id: 'dwelling', label: 'Dwelling', startMs: 150_000, endMs: 270_000, invitation: 'Remain with the field while small changes keep it alive.' },
    { id: 'return', label: 'Return', startMs: 270_000, endMs: 360_000, invitation: 'Let the material gather and make room for what follows.' },
  ],
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
