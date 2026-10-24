'use client';

import { useSearchParams } from 'next/navigation';
import P4R1HomeController from '../writers-studio-pc3-live/P4R1HomeController';
import P4R1WriteEditController from '../writers-studio-pc3-live/P4R1WriteEditController';
import P4R1DevelopController from '../writers-studio-pc3-live/P4R1DevelopController';
import P4R1ReviewController from '../writers-studio-pc3-live/P4R1ReviewController';
import ListenPilot from '../writers-studio-pc3-live/ListenPilot';
import P4R1ThemeMenu from './P4R1ThemeMenu';
import P4R1BetaFeedback from './P4R1BetaFeedback';
import WriterStudioBetaPlanNotice from './WriterStudioBetaPlanNotice';
import { ConstellationArrival } from '../../writers-studio/ConstellationArrival';
import { unifiedModeFrom, type UnifiedStudioMode } from './studioMode';

export default function P4R1StudioHost({
  defaultMode = 'write',
}: {
  defaultMode?: UnifiedStudioMode;
}) {
  const params = useSearchParams();
  const mode = unifiedModeFrom(params?.get('mode'), defaultMode);

  const room = mode === 'listen' ? <ListenPilot />
    : mode === 'home' ? <P4R1HomeController />
    : mode === 'develop' ? <P4R1DevelopController />
      : mode === 'review' ? <P4R1ReviewController />
        : <P4R1WriteEditController />;

  return (
    <>
      <P4R1ThemeMenu />
      <P4R1BetaFeedback mode={mode} />
      <WriterStudioBetaPlanNotice />
      {mode === 'home' && <ConstellationArrival />}
      {room}
    </>
  );
}
