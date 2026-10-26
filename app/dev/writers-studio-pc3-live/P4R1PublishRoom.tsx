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

export default function P4R1PublishRoom() {
  const params = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const { id: appearance } = useAtmosphere();
  const manuscriptId = params?.get('m') ?? '';
  const localReviewArtifacts = params?.get('localReview') === '1';

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
      onSelectMode={changeMode}
      work={
        manuscriptId ? (
          <div data-publish-studio-room>
            <P4R1InteriorProof key={manuscriptId} manuscriptId={manuscriptId} />
            <P4R1CoverStudy key={'cover-' + manuscriptId} manuscriptId={manuscriptId} />
            <P4R1ProducePanel
              manuscriptId={manuscriptId}
              exportsCertified={false}
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
