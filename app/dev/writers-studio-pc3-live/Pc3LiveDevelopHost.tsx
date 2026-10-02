'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { apiFetch } from '@/lib/http/apiBase';
import { Shell } from '@/app/writers-studio/full-redesign/Shell';
import {
  LiveDevelopMaia,
  LiveDevelopManuscript,
  LiveDevelopWork,
  type LiveDevelopRoomProps,
  type Pc3DevelopTab,
} from '@/app/writers-studio/full-redesign/LiveDevelopRoom';
import { STATE_GEOMETRY } from '@/app/writers-studio/full-redesign/tokens';
import { useLivingWorks } from '@/app/writers-studio/useLivingWorks';
import { currentWork, resolveWorkContext } from '@/app/writers-studio/workContext';
import { factsOnlyDevelopOverview } from '@/app/writers-studio/develop/liveDevelopOverview';
import {
  fetchReading,
  fetchReadingSummaries,
  requestDevelopmentalReading,
  type ReadingSummary,
} from '@/lib/writersStudio/developClient';
import {
  lensReadingChoices,
  projectLiveDevelopReading,
  type LiveDevelopReading,
  type LiveReadingLens,
} from '@/lib/writersStudio/develop/liveLens';
import { fetchLiveThemes } from '@/lib/writersStudio/themes/client';
import type { LiveThemesPayload } from '@/lib/writersStudio/themes/liveTypes';
import type { RebuildSection } from '@/lib/writersStudio/rebuild/model';

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

const PARAM_TO_TAB: Record<string, Pc3DevelopTab> = {
  overview: 'Overview',
  structure: 'Structure',
  themes: 'Themes',
  voice: 'Voice',
  continuity: 'Continuity',
  reader: 'Reader Perspective',
};

const TAB_TO_PARAM: Record<Pc3DevelopTab, string> = {
  Overview: 'overview',
  Structure: 'structure',
  Themes: 'themes',
  Voice: 'voice',
  Continuity: 'continuity',
  'Reader Perspective': 'reader',
};

const TAB_TO_READING_LENS: Partial<Record<Pc3DevelopTab, LiveReadingLens>> = {
  Voice: 'voice',
  Continuity: 'continuity',
  'Reader Perspective': 'reader',
};

function initialTab(value: string | null): Pc3DevelopTab {
  return value && PARAM_TO_TAB[value] ? PARAM_TO_TAB[value]! : 'Themes';
}

export default function Pc3LiveDevelopHost() {
  const params = useSearchParams();
  const pathname = usePathname() ?? '/dev/writers-studio-pc3-live';
  const manuscriptId = params?.get('m') ?? null;
  const appearance = params?.get('appearance') === 'night' ? 'evening' : 'day';
  const requestedSection = params?.get('s') ?? null;
  const requestedReading = params?.get('reading') ?? null;
  const [tab, setTabState] = useState<Pc3DevelopTab>(() => initialTab(params?.get('develop') ?? null));
  const { phase: worksPhase, works } = useLivingWorks();

  const [phase, setPhase] = useState<Phase>('loading');
  const [message, setMessage] = useState<string | null>(null);
  const [context, setContext] = useState<ContextReady | null>(null);
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [summaries, setSummaries] = useState<ReadingSummary[]>([]);
  const [selectedReadingId, setSelectedReadingId] = useState<string | null>(requestedReading);
  const [reading, setReading] = useState<LiveDevelopReading | null>(null);
  const [readingBusy, setReadingBusy] = useState(false);
  const [readingRefusal, setReadingRefusal] = useState<string | null>(null);
  const [themes, setThemes] = useState<LiveThemesPayload | null>(null);
  const [themesState, setThemesState] = useState<'loading' | 'ready' | 'unavailable'>('loading');
  const [selectedThemeId, setSelectedThemeId] = useState<string | null>(null);

  const workContext = context
    ? resolveWorkContext(worksPhase, works, context.manuscriptId)
    : { kind: 'unknown' as const };
  const work = currentWork(workContext);

  const replaceAddress = useCallback((mutate: (query: URLSearchParams) => void) => {
    if (typeof window === 'undefined') return;
    const query = new URLSearchParams(window.location.search);
    mutate(query);
    window.history.replaceState(window.history.state, '', pathname + '?' + query.toString());
  }, [pathname]);

  const refreshThemes = useCallback(async (mid: string) => {
    setThemesState('loading');
    const out = await fetchLiveThemes(mid);
    if (!out.ok) {
      setThemes(null);
      setThemesState('unavailable');
      return;
    }
    setThemes(out.payload);
    setThemesState('ready');
    setSelectedThemeId((current) =>
      current && out.payload.themes.some((theme) => theme.id === current)
        ? current
        : out.payload.themes.find((theme) => theme.standing !== 'rejected')?.id ?? null
    );
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setPhase('loading');
      setMessage(null);
      if (!manuscriptId) {
        setPhase('error');
        setMessage('Open Develop with a specific manuscript.');
        return;
      }
      try {
        const response = await apiFetch(
          '/api/writers-studio/rebuild/context?manuscriptId=' + encodeURIComponent(manuscriptId),
        );
        if (cancelled) return;
        if (response.status === 401) {
          setPhase('unauthorized');
          return;
        }
        if (!response.ok) throw new Error('context');
        const body = await response.json() as ContextPayload;
        if (body.state !== 'section_aware') {
          setPhase('error');
          setMessage('This manuscript is not section-addressable yet. Develop will not guess at its structure.');
          return;
        }
        setContext(body);
        const requested = requestedSection
          ? body.sections.find((section) => section.draftSectionId === requestedSection) ?? null
          : null;
        const first = requested ?? body.sections[0] ?? null;
        setActiveSectionId(first?.draftSectionId ?? null);

        const listed = await fetchReadingSummaries(body.manuscriptId);
        if (cancelled) return;
        setSummaries(listed.ok ? listed.readings : []);
        await refreshThemes(body.manuscriptId);
        if (cancelled) return;
        setPhase('ready');
      } catch {
        if (!cancelled) {
          setPhase('error');
          setMessage('Develop could not open this manuscript just now. Nothing about the Work has changed.');
        }
      }
    }
    void load();
    return () => { cancelled = true; };
  }, [manuscriptId, requestedSection, refreshThemes]);

  const readingLens = TAB_TO_READING_LENS[tab] ?? null;
  const readingChoices = useMemo(
    () => readingLens ? lensReadingChoices(summaries, readingLens) : [],
    [readingLens, summaries],
  );

  const loadReading = useCallback(async (id: string, lens: LiveReadingLens) => {
    if (!context) return;
    setReadingBusy(true);
    setReadingRefusal(null);
    const out = await fetchReading(context.manuscriptId, id);
    if (!out.ok) {
      setReading(null);
      setReadingRefusal('That saved reading is not available here.');
      setReadingBusy(false);
      return;
    }
    const projected = projectLiveDevelopReading(lens, out.payload);
    if (!projected.ok) {
      setReading(null);
      setReadingRefusal('That reading does not belong to this Develop lens.');
      setReadingBusy(false);
      return;
    }
    setReading(projected.reading);
    setReadingBusy(false);
  }, [context]);

  useEffect(() => {
    if (!readingLens || !selectedReadingId) {
      setReading(null);
      return;
    }
    if (!readingChoices.some((choice) => choice.id === selectedReadingId)) {
      setReading(null);
      setReadingRefusal('No saved reading with that identity belongs to this lens.');
      return;
    }
    void loadReading(selectedReadingId, readingLens);
  }, [loadReading, readingChoices, readingLens, selectedReadingId]);

  const setTab = useCallback((next: Pc3DevelopTab) => {
    setTabState(next);
    setSelectedReadingId(null);
    setReading(null);
    setReadingRefusal(null);
    replaceAddress((query) => {
      query.set('develop', TAB_TO_PARAM[next]);
      query.delete('reading');
    });
  }, [replaceAddress]);

  const openSection = useCallback((sectionId: string) => {
    setActiveSectionId(sectionId);
    replaceAddress((query) => query.set('s', sectionId));
  }, [replaceAddress]);

  const selectReading = useCallback((readingId: string) => {
    setSelectedReadingId(readingId);
    replaceAddress((query) => query.set('reading', readingId));
  }, [replaceAddress]);

  const readForLens = useCallback(async () => {
    if (!context) return;
    const lens = tab === 'Themes' ? 'themes' : TAB_TO_READING_LENS[tab];
    if (!lens) return;
    setReadingBusy(true);
    setReadingRefusal(null);
    const out = await requestDevelopmentalReading(context.manuscriptId, lens);
    if (!out.ok) {
      setReadingBusy(false);
      setReadingRefusal('MAIA did not create a reading: ' + out.refusal + '.');
      return;
    }
    const listed = await fetchReadingSummaries(context.manuscriptId);
    if (listed.ok) setSummaries(listed.readings);
    if (lens === 'themes') {
      await refreshThemes(context.manuscriptId);
      setReadingBusy(false);
      return;
    }
    setSelectedReadingId(out.readingId);
    replaceAddress((query) => query.set('reading', out.readingId));
    await loadReading(out.readingId, lens);
  }, [context, loadReading, refreshThemes, replaceAddress, tab]);

  const goWrite = useCallback((sectionId?: string) => {
    if (typeof window === 'undefined') return;
    const query = new URLSearchParams(window.location.search);
    query.set('mode', 'write');
    if (sectionId) query.set('s', sectionId);
    query.delete('reviewRun');
    query.delete('reviewFinding');
    window.location.assign(pathname + '?' + query.toString());
  }, [pathname]);

  if (phase !== 'ready' || !context) {
    const copy = phase === 'loading' ? 'Opening Develop…'
      : phase === 'unauthorized' ? 'Sign in to open your Writer’s Studio.'
        : message ?? 'Develop could not be opened.';
    return <main className="fr-root" data-pc3-develop-phase={phase}><div style={{ padding: 32 }}>{copy}</div></main>;
  }

  const overview = factsOnlyDevelopOverview({
    manuscriptTitle: context.title,
    workTitle: work?.title ?? null,
    workForm: work?.form ?? null,
    sections: context.sections,
  });

  const roomProps: LiveDevelopRoomProps = {
    tab,
    onTab: setTab,
    sections: context.sections,
    activeSectionId,
    onOpenSection: openSection,
    overview,
    themes,
    themesState,
    selectedThemeId,
    onSelectTheme: setSelectedThemeId,
    onOpenThemeEvidence: goWrite,
    reading,
    readingChoices,
    selectedReadingId,
    onSelectReading: selectReading,
    onReadForLens: readForLens,
    readingBusy,
    readingRefusal,
    onOpenReadingEvidence: goWrite,
  };

  const geometry = tab === 'Themes'
    ? STATE_GEOMETRY['develop-themes']
    : STATE_GEOMETRY['develop-manuscript'];

  return (
    <Shell
      mode="develop"
      appearance={appearance}
      geometry={geometry}
      workTitle={work?.title ?? context.title ?? undefined}
      memberInitial=""
      onSelectMode={(mode) => {
        if (mode === 'write') goWrite(activeSectionId ?? undefined);
        if (mode === 'review' && typeof window !== 'undefined') {
          const query = new URLSearchParams(window.location.search);
          query.set('mode', 'review');
          window.location.assign(pathname + '?' + query.toString());
        }
      }}
      manuscript={<LiveDevelopManuscript {...roomProps} />}
      work={<LiveDevelopWork {...roomProps} />}
      maia={<LiveDevelopMaia {...roomProps} />}
    />
  );
}
