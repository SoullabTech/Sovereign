export type UnifiedStudioMode = 'home' | 'write' | 'develop' | 'review' | 'listen';

const MODES: readonly UnifiedStudioMode[] = ['home', 'write', 'develop', 'review', 'listen'];

export function unifiedModeFrom(
  value: string | null | undefined,
  fallback: UnifiedStudioMode,
): UnifiedStudioMode {
  return MODES.includes(value as UnifiedStudioMode)
    ? value as UnifiedStudioMode
    : fallback;
}
