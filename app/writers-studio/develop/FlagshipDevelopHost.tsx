'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { apiFetch } from '@/lib/http/apiBase';
import { SECTION_PARAM } from '@/lib/writersStudio/placeInWork';
import type { RebuildSection } from '@/lib/writersStudio/rebuild/model';
import { useLivingWorks } from '../useLivingWorks';
import { useMemberIdentity } from '../useMemberIdentity';
import { currentWork, resolveWorkContext } from '../workContext';
import { DevelopRoom, LIVE_DEVELOP_CAPABILITIES, type LensId } from '../flagship/DevelopReview';
import type { DevelopLensLiveState } from '../flagship/DevelopLensReading';
import { StudioShell, type MemberIdentity, type ProjectIdentity } from '../flagship/StudioChrome';
import type { NavActions } from '../flagship/flagshipTokens';
import { factsOnlyDevelopOverview } from './liveDevelopOverview';
import { fetchLiveThemes, mutateTheme } from '@/lib/writersStudio/themes/client';
import type { LiveThemesPayload, ThemeMutation } from '@/lib/writersStudio/themes/liveTypes';
import { fetchReading, fetchReadingSummaries, requestDevelopmentalReading } from '@/lib/writersStudio/developClient';
import { isLiveReadingLens, lensReadingChoices, projectLiveDevelopReading, type LiveReadingLens } from '@/lib/writersStudio/develop/liveLens';

interface ContextReady {
  state: 'section_aware';
  manuscriptId: string;
  title: string | null;
  version: number;
  updatedAt: string;
  sections: RebuildSection[];
}
type ContextPayload = ContextReady | { state: 'no_draft' | 'continuous'; manuscriptId: string; title: string | null };
type Phase = 'loading' | 'ready' | 'unauthorized' | 'unavailable';

const DEVELOP_LENS_IDS: readonly LensId[] = [
  'structure', 'development', 'arc', 'continuity', 'themes', 'coherence', 'voice', 'reader',
];

function requestedDevelopLens(value: string): LensId | 'overview' {
  return (DEVELOP_LENS_IDS as readonly string[]).includes(value) ? value as LensId : 'overview';
}

function memberForShell(identity: ReturnType<typeof useMemberIdentity>): MemberIdentity | undefined {
  if (identity.phase !== 'ready' || !identity.name?.trim()) return undefined;
  const name = identity.name.trim();
  const initials = name.split(/\s+/).filter(Boolean).slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '').join('');
  return { name, initials: initials || name.slice(0, 2).toUpperCase() };
}

export default function FlagshipDevelopHost() {
  const params = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const manuscriptId = params?.get('m') ?? null;
  const sectionId = params?.get(SECTION_PARAM) ?? null;
  const selectedReadingId = params?.get('reading') ?? null;
  const requestedLens = params?.get('lens') ?? 'overview';
  const lens = requestedDevelopLens(requestedLens);
  const readingLens: LiveReadingLens | null = lens !== 'overview' && isLiveReadingLens(lens) ? lens : null;
  const [phase, setPhase] = useState<Phase>('loading');
  const [context, setContext] = useState<ContextReady | null>(null);
  const [themes, setThemes] = useState<LiveThemesPayload | null | undefined>(undefined);
  const [themeBusy, setThemeBusy] = useState(false);
  const [themeError, setThemeError] = useState<string | null>(null);
  const [readingState, setReadingState] = useState<DevelopLensLiveState>({ kind: 'idle' });
  const [readingBusy, setReadingBusy] = useState(false);
  const [readingError, setReadingError] = useState<string | null>(null);
  const { phase: worksPhase, works } = useLivingWorks();
  const identity = useMemberIdentity();

  const loadThemes = useCallback(async () => {
    if (!manuscriptId) return;
    setThemes(undefined);
    const out = await fetchLiveThemes(manuscriptId);
    if (out.ok) {
      setThemes(out.payload);
      setThemeError(null);
    } else {
      setThemes(null);
      setThemeError(`Themes could not be loaded (${out.refusal}).`);
    }
  }, [manuscriptId]);

  useEffect(() => {
    if (lens === 'themes' && manuscriptId) void loadThemes();
  }, [lens, manuscriptId, loadThemes]);

  useEffect(() => {
    let cancelled = false;
    if (!manuscriptId || !readingLens) {
      setReadingState({ kind: 'idle' });
      setReadingError(null);
      return () => { cancelled = true; };
    }
    setReadingState({ kind: 'loading' });
    setReadingError(null);
    void (async () => {
      const listed = await fetchReadingSummaries(manuscriptId);
      if (cancelled) return;
      if (!listed.ok) { setReadingState({ kind: 'unavailable' }); return; }
      const choices = lensReadingChoices(listed.readings, readingLens);
      if (!selectedReadingId) { setReadingState({ kind: 'choices', readings: choices }); return; }
      const summary = choices.find((item) => item.id === selectedReadingId);
      if (!summary) { setReadingState({ kind: 'unavailable' }); return; }
      const fetched = await fetchReading(manuscriptId, selectedReadingId);
      if (cancelled) return;
      if (!fetched.ok) { setReadingState({ kind: 'unavailable' }); return; }
      const projected = projectLiveDevelopReading(readingLens, fetched.payload);
      if (!projected.ok
        || projected.reading.id !== summary.id
        || projected.reading.outcome !== summary.outcome
        || projected.reading.frozenAt !== summary.frozenAt
        || projected.reading.observations.length !== summary.observationCount) {
        setReadingState({ kind: 'unavailable' });
        return;
      }
      setReadingState({ kind: 'ready', reading: projected.reading });
    })();
    return () => { cancelled = true; };
  }, [manuscriptId, readingLens, selectedReadingId]);

  useEffect(() => {
    let cancelled = false;
    if (!manuscriptId) {
      setContext(null);
      setPhase('unavailable');
      return () => { cancelled = true; };
    }
    setPhase('loading');
    void (async () => {
      try {
        const res = await apiFetch(
          `/api/writers-studio/rebuild/context?manuscriptId=${encodeURIComponent(manuscriptId)}`,
          { method: 'GET' },
        );
        if (cancelled) return;
        if (res.status === 401) { setPhase('unauthorized'); return; }
        if (!res.ok) { setPhase('unavailable'); return; }
        const body = await res.json() as ContextPayload;
        if (cancelled) return;
        if (body.state !== 'section_aware' || !Array.isArray(body.sections)) {
          setPhase('unavailable');
          return;
        }
        setContext(body);
        setPhase('ready');
      } catch {
        if (!cancelled) setPhase('unavailable');
      }
    })();
    return () => { cancelled = true; };
  }, [manuscriptId]);

  const workContext = resolveWorkContext(worksPhase, works, context?.manuscriptId ?? manuscriptId);
  const work = currentWork(workContext);
  const member = useMemo(() => memberForShell(identity), [identity]);

  if (phase !== 'ready' || !context) {
    return (
      <main className="fs-tokens fsw-state" data-develop-phase={phase}>
        {phase === 'loading' && 'Opening Develop…'}
        {phase === 'unauthorized' && 'Sign in to open Develop.'}
        {phase === 'unavailable' && 'Develop cannot open this Work here yet. Nothing about your Work has changed.'}
      </main>
    );
  }

  const view = factsOnlyDevelopOverview({
    manuscriptTitle: context.title,
    workTitle: work?.title ?? null,
    workForm: work?.form ?? null,
    sections: context.sections,
  });

  const writeParams = new URLSearchParams({ m: context.manuscriptId });
  if (sectionId && context.sections.some((section) => section.draftSectionId === sectionId)) {
    writeParams.set(SECTION_PARAM, sectionId);
  }
  const writeHref = `/writers-studio/rebuild?${writeParams.toString()}`;
  const nav: NavActions = {
    write: { kind: 'link', href: writeHref },
  };
  const project: ProjectIdentity | undefined = view.work === 'This work'
    ? undefined
    : { workTitle: view.work, ...(work?.form ? { workKind: work.form } : {}) };
  const onLens = (nextLens: LensId | 'overview') => {
    const next = new URLSearchParams(params?.toString() ?? '');
    next.delete('reading');
    if (nextLens === 'overview') next.delete('lens');
    else next.set('lens', nextLens);
    const q = next.toString();
    router.push(`${pathname ?? '/writers-studio/develop'}${q ? `?${q}` : ''}`);
  };
  const structureNavigation = {
    hrefFor: (targetSectionId: string) => {
      const target = new URLSearchParams({ m: context.manuscriptId, [SECTION_PARAM]: targetSectionId });
      return `/writers-studio/rebuild?${target.toString()}`;
    },
    onGo: (_targetSectionId: string, href: string) => router.push(href),
  };
  const themeNavigation = {
    hrefFor: (targetSectionId: string) => {
      if (!context.sections.some((section) => section.draftSectionId === targetSectionId)) return null;
      const target = new URLSearchParams({ m: context.manuscriptId, [SECTION_PARAM]: targetSectionId });
      return `/writers-studio/rebuild?${target.toString()}`;
    },
    onGo: (_targetSectionId: string, href: string) => router.push(href),
  };

  const runThemeMutation = async (mutation: ThemeMutation) => {
    if (themeBusy) return;
    setThemeBusy(true);
    setThemeError(null);
    const out = await mutateTheme(context.manuscriptId, mutation);
    if (!out.ok) setThemeError(`That theme change was not saved (${out.refusal}).`);
    else await loadThemes();
    setThemeBusy(false);
  };

  const commissionThemes = async () => {
    if (themeBusy) return;
    setThemeBusy(true);
    setThemeError(null);
    const out = await requestDevelopmentalReading(context.manuscriptId, 'themes');
    if (!out.ok) {
      setThemeError(`MAIA did not create a Themes reading (${out.refusal}).`);
    } else {
      await loadThemes();
    }
    setThemeBusy(false);
  };

  const themeActions = {
    busy: themeBusy,
    error: themeError,
    onCommission: commissionThemes,
    onDeclare: (label: string) => void runThemeMutation({ action: 'declare', label }),
    onAcceptCandidate: (candidate: { readingId: string; observationId: string }) =>
      void runThemeMutation({ action: 'accept-candidate', readingId: candidate.readingId, observationId: candidate.observationId }),
    onRenameCandidate: (candidate: { readingId: string; observationId: string }, label: string) =>
      void runThemeMutation({ action: 'rename-candidate', readingId: candidate.readingId, observationId: candidate.observationId, label }),
    onRejectCandidate: (candidate: { readingId: string; observationId: string }) =>
      void runThemeMutation({ action: 'reject-candidate', readingId: candidate.readingId, observationId: candidate.observationId }),
    onRenameTheme: (theme: { id: string }, label: string) =>
      void runThemeMutation({ action: 'rename-theme', themeId: theme.id, label }),
    onRejectTheme: (theme: { id: string }) =>
      void runThemeMutation({ action: 'reject-theme', themeId: theme.id }),
    onRestoreTheme: (theme: { id: string }) =>
      void runThemeMutation({ action: 'restore-theme', themeId: theme.id }),
  };

  const selectReading = (readingId: string | null) => {
    const next = new URLSearchParams(params?.toString() ?? '');
    if (readingId) next.set('reading', readingId);
    else next.delete('reading');
    router.push(`${pathname ?? '/writers-studio/develop'}?${next.toString()}`);
  };
  const commissionReading = async () => {
    if (!readingLens || readingBusy) return;
    setReadingBusy(true);
    setReadingError(null);
    const out = await requestDevelopmentalReading(context.manuscriptId, readingLens);
    if (!out.ok) {
      setReadingError(`MAIA did not create this reading (${out.refusal}).`);
      setReadingBusy(false);
      return;
    }
    setReadingBusy(false);
    selectReading(out.readingId);
  };
  const readingActions = readingLens ? {
    busy: readingBusy,
    error: readingError,
    onChoose: (readingId: string) => selectReading(readingId),
    onChooseAnother: () => selectReading(null),
    onCommission: () => void commissionReading(),
  } : undefined;

  return (
    <StudioShell
      current="develop"
      destinations={['write', 'develop', 'review']}
      affordance="orientation"
      nav={nav}
      project={project}
      member={member}
    >
      <DevelopRoom
        view={view}
        lens={lens}
        capabilities={LIVE_DEVELOP_CAPABILITIES}
        onLens={onLens}
        structureNavigation={structureNavigation}
        themes={themes}
        themeActions={themeActions}
        themeNavigation={themeNavigation}
        readingState={readingState}
        readingActions={readingActions}
        readingNavigation={themeNavigation}
      />
    </StudioShell>
  );
}
