'use client';

import { useSearchParams } from 'next/navigation';
import P4R1HomeController from '../writers-studio-pc3-live/P4R1HomeController';
import P4R1WriteEditController from '../writers-studio-pc3-live/P4R1WriteEditController';
import P4R1DevelopController from '../writers-studio-pc3-live/P4R1DevelopController';
import P4R1ReviewController from '../writers-studio-pc3-live/P4R1ReviewController';

export type UnifiedStudioMode = 'home' | 'write' | 'develop' | 'review';

const MODES: readonly UnifiedStudioMode[] = ['home', 'write', 'develop', 'review'];

export function unifiedModeFrom(
  value: string | null | undefined,
  fallback: UnifiedStudioMode,
): UnifiedStudioMode {
  return MODES.includes(value as UnifiedStudioMode)
    ? value as UnifiedStudioMode
    : fallback;
}

export default function P4R1StudioHost({
  defaultMode = 'write',
}: {
  defaultMode?: UnifiedStudioMode;
}) {
  const params = useSearchParams();
  const mode = unifiedModeFrom(params?.get('mode'), defaultMode);

  if (mode === 'home') return <P4R1HomeController />;
  if (mode === 'develop') return <P4R1DevelopController />;
  if (mode === 'review') return <P4R1ReviewController />;
  return <P4R1WriteEditController />;
}
