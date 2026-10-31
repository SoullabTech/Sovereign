'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useAtmosphere } from '@/app/writers-studio/atmosphere/StudioAtmosphere';
import { Shell } from '@/app/writers-studio/full-redesign/Shell';
import { HOME_GEOMETRY } from '@/app/writers-studio/full-redesign/tokens';
import type { StudioMode } from '@/app/writers-studio/full-redesign/types';
import P4R1ProducePanel from './P4R1ProducePanel';
import P4R1InteriorProof from './P4R1InteriorProof';
import P4R1CoverStudy from './P4R1CoverStudy';
import { studioNavigationBase } from '@/lib/writersStudio/studioNavigationBase';
import { useWriterReleaseCapabilities } from '@/lib/writersStudio/useWriterReleaseCapabilities';
import { useLivingWorks } from '@/app/writers-studio/useLivingWorks';
import { resolveSituatedWorkContext } from '@/app/writers-studio/situatedWork';
import { useHouseStudioH1WorkClaim } from '@/app/writers-studio/useHouseStudioH1WorkClaim';
import { h1AdmissionNeeded, resolveH1Arrival } from '@/app/writers-studio/h1Arrival';

export default function P4R1PublishRoom() {
  const params = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const { id: appearance } = useAtmosphere();
  const manuscriptId = params?.get('m') ?? '';
  const localReviewArtifacts = params?.get('localReview') === '1';
  const { phase: worksPhase, works } = useLivingWorks();
  const h1 = useHouseStudioH1WorkClaim(h1AdmissionNeeded(params));
  const { workId: carriedWorkId, pending: h1AdmissionChecking } = resolveH1Arrival(params, h1);
  const workContext = resolveSituatedWorkContext(worksPhase, works, manuscriptId, carriedWorkId);
  const currentWork = workContext.kind === 'work' ? workContext.work : null;
  const previewKey = manuscriptId + ':' + (currentWork?.id ?? '');
  const releaseCapabilities = useWriterReleaseCapabilities();
  const exportsCertified =
    releaseCapabilities.authority.exportsCertified.pdf &&
    releaseCapabilities.authority.exportsCertified.epub;

  const changeMode = (mode: StudioMode) => {
    const next = new URLSearchParams(params?.toString() ?? '');
    next.set('mode', mode);
    next.delete('publish');
    router.push(studioNavigationBase(pathname, localReviewArtifacts) + '?' + next.toString());
  };

  return (
    <Shell
      mode="publish"
      appearance={appearance}
      geometry={HOME_GEOMETRY}
      memberInitial=""
      workTitle={currentWork?.title ?? undefined}
      onSelectMode={changeMode}
      work={
        manuscriptId ? (
          <div data-publish-studio-room>
            {worksPhase === 'loading' || h1AdmissionChecking ? <p role="status">Opening your Work…</p> : <>
              <P4R1InteriorProof key={previewKey} manuscriptId={manuscriptId} workTitle={currentWork?.title} />
              <P4R1CoverStudy key={'cover-' + previewKey} manuscriptId={manuscriptId} workTitle={currentWork?.title} />
            </>}
            <P4R1ProducePanel
              manuscriptId={manuscriptId}
              exportsCertified={exportsCertified}
              localReviewArtifacts={localReviewArtifacts}
              onClose={() => changeMode('review')}
            />
          </div>
        ) : (
          <section className="p4r1-produce p4r1-publish-missing" data-publish-studio-room>
            <header>
              <div>
                <span className="p4r1-eyebrow">Publish</span>
                <h3>Open a manuscript before preparing an edition.</h3>
              </div>
            </header>
            <p>Publish stays bound to one identified manuscript. Nothing has been inferred or submitted.</p>
            <button type="button" onClick={() => changeMode('home')}>Return Home</button>
          </section>
        )
      }
    />
  );
}
