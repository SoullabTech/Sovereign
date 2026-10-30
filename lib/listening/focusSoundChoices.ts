// Sound for a Focus session. Choosing a sound starts nothing: Play is a separate member action and goes
// through the one persistent player. The Focus session itself has no media authority (LISTEN-48/49).
export const FOCUS_SOUND_IDS = ['none', 'soundscape', 'open-ground', 'deep-focus', 'creative-flow'] as const;
export type FocusSoundId = typeof FOCUS_SOUND_IDS[number];

export const FOCUS_SOUND_OPTIONS: ReadonlyArray<{ id: FocusSoundId; label: string; line: string }> = [
  { id: 'none', label: 'No sound', line: 'A silent timer' },
  { id: 'soundscape', label: 'Your soundscape', line: 'Built from your choices below, and it changes as you change them' },
  { id: 'open-ground', label: 'Open Ground', line: 'A sustained tonal world, 6 minutes' },
  { id: 'deep-focus', label: 'Deep focus', line: 'A synthesized study at low volume' },
  { id: 'creative-flow', label: 'Creative flow', line: 'A synthesized study at low volume' },
];

// The same low-volume synthesized studies offered in Lab.
export const FOCUS_SOUND_SKETCHES = {
  'deep-focus': { mood: 'focus' as const, frequencies: [110, 164.81, 220] as const },
  'creative-flow': { mood: 'create' as const, frequencies: [130.81, 196, 261.63] as const },
} as const;

export function focusSoundLabel(id: FocusSoundId): string {
  return FOCUS_SOUND_OPTIONS.find(option => option.id === id)?.label ?? 'No sound';
}
