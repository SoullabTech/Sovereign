'use client';

import { useCallback, useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { apiFetch } from '@/lib/http/apiBase';
import { Shell } from '@/app/writers-studio/full-redesign/Shell';
import {
  WriteManuscriptRail,
  WriteRoom,
} from '@/app/writers-studio/full-redesign/WriteRoom';
import { WRITE_COPY } from '@/app/writers-studio/full-redesign/fixtures';
import { WRITE_GEOMETRY } from '@/app/writers-studio/full-redesign/tokens';
import { projectPc3LiveWrite } from '@/app/writers-studio/full-redesign/liveWriteAdapter';
import { useLivingWorks } from '@/app/writers-studio/useLivingWorks';
import { currentWork, resolveWorkContext } from '@/app/writers-studio/workContext';
import RebuildWritingBoundary from '@/app/writers-studio/rebuild/RebuildWritingBoundary';
import type { RebuildSection } from '@/lib/writersStudio/rebuild/model';
import type { SectionWriting } from '@/lib/writersStudio/useSectionWriting';
import type { Appearance } from '@/app/writers-studio/full-redesign/types';
import {
  locationForSection,
  replacePlaceAddress,
  SECTION_PARAM,
} from '@/lib/writersStudio/placeInWork';
interface ContextReady {
  state: 'section_aware';
  manuscriptId: string;
  title: string | null;
  version: number;
  updatedAt: string;
  sections: RebuildSection[];
}
type ContextPayload =
  | ContextReady
  | { state: 'no_draft' | 'continuous'; manuscriptId: string; title: string | null };
type Phase = 'loading' | 'ready' | 'unauthorized' | 'error';

function LiveWriteView(props: {
  context: ContextReady;
  writing: SectionWriting;
  workTitle: string | null;
  appearance: Appearance;
  initialSearch: string;
  pathname: string;
  initial: string;
}) {
  const { context, writing, workTitle, appearance, initialSearch, pathname, initial } = props;
  const [canvas, setCanvas] = useState(false);
  const projection = projectPc3LiveWrite({
    sections: context.sections,
    activeId: writing.activeId,
    bodyOf: writing.bodyOf,
    statusOf: writing.statusOf,
    workTitle,
    manuscriptTitle: context.title,
  });

  const go = useCallback((sectionId: string | null) => {
    if (!sectionId || sectionId === writing.activeId) return;
    writing.goToSection(sectionId);
    const search = typeof window === 'undefined' ? initialSearch : window.location.search;
    replacePlaceAddress(locationForSection(pathname, search, sectionId));
  }, [initialSearch, pathname, writing]);

  useEffect(() => {
    if (!writing.activeId || initial === writing.activeId) return;
    const search = typeof window === 'undefined' ? initialSearch : window.location.search;
    replacePlaceAddress(locationForSection(pathname, search, writing.activeId));
  }, [initial, initialSearch, pathname, writing.activeId]);

  if (!projection) {
    return (
      <main className="fr-root">
        <div style={{ padding: 32 }}>This manuscript has no editable place to open.</div>
      </main>
    );
  }
  return (
    <Shell
      mode="write"
      appearance={appearance}
      geometry={WRITE_GEOMETRY}
      workTitle={workTitle ?? undefined}
      memberInitial=""
      canvas={canvas}
      manuscript={
        <WriteManuscriptRail
          fixture={projection.data}
          onOpenChapter={go}
        />
      }
      work={
        <WriteRoom
          fixture={projection.data}
          copy={WRITE_COPY}
          canvas={canvas}
          onCanvasChange={setCanvas}
          live={{
            saveState: projection.data.saveState,
            onEditBody: writing.edit,
            onPrevious: () => go(projection.previousId),
            onNext: () => go(projection.nextId),
            onOpenChapter: go,
          }}
        />
      }
    />
  );
}
export default function Pc3LiveWriteHost() {
  const params = useSearchParams();
  const pathname = usePathname() ?? '/dev/writers-studio-pc3-live';
  const manuscriptId = params?.get('m') ?? null;
  const requestedSection = params?.get(SECTION_PARAM) ?? null;
  const appearance: Appearance = params?.get('appearance') === 'night' ? 'evening' : 'day';
  const initialSearch = params && params.toString() ? `?${params.toString()}` : '';
  const { phase: worksPhase, works } = useLivingWorks();

  const [phase, setPhase] = useState<Phase>('loading');
  const [context, setContext] = useState<ContextReady | null>(null);
  const [openingSectionId, setOpeningSectionId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setPhase('loading');
      setMessage(null);
      if (!manuscriptId) {
        setPhase('error');
        setMessage('Open the live PC3 Studio with a specific manuscript.');
        return;
      }
      try {
        const res = await apiFetch(
          `/api/writers-studio/rebuild/context?manuscriptId=${encodeURIComponent(manuscriptId)}`,
        );
        if (cancelled) return;
        if (res.status === 401) {
          setPhase('unauthorized');
          return;
        }
        if (!res.ok) throw new Error('context');
        const body = await res.json() as ContextPayload;
        if (body.state !== 'section_aware') {
          setPhase('error');
          setMessage('This manuscript is not section-addressable yet. The Studio will not guess at its structure.');
          return;
        }

        const requested = requestedSection
          ? body.sections.find((s) => s.draftSectionId === requestedSection) ?? null
          : null;
        const initial = requested ?? body.sections[0] ?? null;
        setContext(body);
        setOpeningSectionId(initial?.draftSectionId ?? null);
        if (!requested && initial && typeof window !== 'undefined') {
          replacePlaceAddress(
            locationForSection(window.location.pathname, window.location.search, initial.draftSectionId),
          );
        }
        setPhase('ready');
      } catch {
        if (cancelled) return;
        setPhase('error');
        setMessage('The Studio could not read this manuscript just now. Nothing has changed.');
      }
    };
    void load();
    return () => { cancelled = true; };
  }, [manuscriptId, requestedSection]);

  if (phase !== 'ready' || !context || !openingSectionId) {
    return (
      <main className="fr-root" data-pc3-live-phase={phase}>
        <div style={{ padding: 32 }}>
          {phase === 'loading' && 'Opening your Writer’s Studio…'}
          {phase === 'unauthorized' && 'Sign in to open your Writer’s Studio.'}
          {phase === 'error' && (message ?? 'The Studio could not be opened.')}
        </div>
      </main>
    );
  }

  const workContext = resolveWorkContext(worksPhase, works, context.manuscriptId);
  const work = currentWork(workContext);

  return (
    <RebuildWritingBoundary
      key={`${context.manuscriptId}:pc3-live`}
      manuscriptId={context.manuscriptId}
      version={context.version}
      sections={context.sections}
      initialSectionId={openingSectionId}
      epoch={0}
    >
      {(writing) => (
        <LiveWriteView
          context={context}
          writing={writing}
          workTitle={work?.title ?? null}
          appearance={appearance}
          pathname={pathname}
          initialSearch={initialSearch}
          initial={openingSectionId}
        />
      )}
    </RebuildWritingBoundary>
  );
}
