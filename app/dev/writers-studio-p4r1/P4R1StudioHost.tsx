'use client';

import { useSearchParams } from 'next/navigation';
import P4R1HomeController from '../writers-studio-pc3-live/P4R1HomeController';
import P4R1WriteEditController from '../writers-studio-pc3-live/P4R1WriteEditController';
import P4R1DevelopController from '../writers-studio-pc3-live/P4R1DevelopController';
import P4R1ReviewController from '../writers-studio-pc3-live/P4R1ReviewController';
import P4R1ThemeMenu from './P4R1ThemeMenu';
import P4R1MaiaSettings from './P4R1MaiaSettings';
import P4R1BetaFeedback from './P4R1BetaFeedback';
import { ConstellationArrival } from '../../writers-studio/ConstellationArrival';

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
  const developCraft = mode === 'develop' && params?.get('developCraft') === '1';

  const room = mode === 'home' ? <P4R1HomeController />
    : mode === 'develop'
      ? (developCraft ? <P4R1WriteEditController surfaceMode="develop-craft" /> : <P4R1DevelopController />)
      : mode === 'review' ? <P4R1ReviewController />
        : <P4R1WriteEditController />;

  return (
    <>
      {mode === 'write' || mode === 'develop' || mode === 'review' ? <P4R1MaiaSettings /> : null}
      <P4R1ThemeMenu />
      <P4R1BetaFeedback mode={mode} />
      {mode === 'home' && <ConstellationArrival />}
      {room}
    </>
  );
}
