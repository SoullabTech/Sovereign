'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useAtmosphere } from '@/app/writers-studio/atmosphere/StudioAtmosphere';
import { apiFetch } from '@/lib/http/apiBase';
import { useLivingWorks } from '@/app/writers-studio/useLivingWorks';
import { currentWork } from '@/app/writers-studio/workContext';
import { resolveSituatedWorkContext, studioHomeReturnSearch } from '@/app/writers-studio/situatedWork';
import { useHouseStudioH1WorkClaim } from '@/app/writers-studio/useHouseStudioH1WorkClaim';
import { h1AdmissionNeeded, resolveH1Arrival } from '@/app/writers-studio/h1Arrival';
import { chapterSpanFor, type RebuildSection } from '@/lib/writersStudio/rebuild/model';
import { SECTION_PARAM } from '@/lib/writersStudio/placeInWork';
import {
  fetchReading,
  fetchReadingSummaries,
  requestDevelopmentalReading,
  type ReadingPayload,
  type ReadingSummary,
} from '@/lib/writersStudio/developClient';
import { readingView, type ReadingView } from '@/lib/writersStudio/developPresentation';
import {
  actOnPreparation,
  fetchPreparation,
  preparationCopy,
  type DevelopPreparation,
} from '@/lib/writersStudio/developPreparationClient';
import { beginDraft, checkpointServerDraft, newIdempotencyKey } from '@/app/press/manuscript/workingDraftClient';
import { fetchLiveThemes, mutateTheme } from '@/lib/writersStudio/themes/client';
import type { LiveThemesPayload, ThemeMutation } from '@/lib/writersStudio/themes/liveTypes';
import type { DevelopmentalLens } from '@/lib/manuscript/developmentalReader/contract';
import type { ReadingScope } from '@/lib/manuscript/developmentalReading/scope';
import { sectionIdsOf } from '@/lib/manuscript/development/evidenceRef';
import { loadCanvasInsight } from '@/lib/writersStudio/insightCanvas';
import { runWholeManuscriptReview } from '@/lib/writersStudio/studio/wholeManuscriptReview';
import { requestAttentionMap } from '@/lib/writersStudio/attentionMapClient';
import type { AttentionItem, WholeManuscriptAttentionMap } from '@/lib/writersStudio/studio/attentionMap';
import {
  fetchWriterUnderstanding,
  saveWriterUnderstanding,
} from '@/lib/writersStudio/writerUnderstandingClient';
import type {
  WriterUnderstanding,
  WriterUnderstandingDraft,
} from '@/lib/writersStudio/writerUnderstanding';
import { requestIntellectualLineageOrientation } from '@/lib/writersStudio/intellectualLineageOrientationClient';
import {
  validIntellectualLineageOrientation,
  type IntellectualLineageOrientation,
} from '@/lib/writersStudio/intellectualLineageOrientation';
import { requestChapterLineageScan } from '@/lib/writersStudio/intellectualLineageChapterClient';
import {
  validChapterLineageScan,
  type ChapterLineageScan,
} from '@/lib/writersStudio/intellectualLineageChapter';
import { requestDevelopmentalOrientation } from '@/lib/writersStudio/developmentalOrientationClient';
import type { DevelopmentalOrientation } from '@/lib/writersStudio/developmentalOrientation';
import P4R1DevelopView, {
  DEVELOP_FIELDS,
  type DevelopField,
  type DevelopIntentKey,
  DEVELOP_INTENTS,
  type DevelopScopeChoice,
} from './P4R1DevelopView';

interface ContextReady {
  state: 'section_aware';
  manuscriptId: string;
  title: string | null;
  version: number;
  draftRevision: number | null;
  updatedAt: string;
  sections: RebuildSection[];
}
type ContextPayload = ContextReady | {
  state: 'no_draft' | 'continuous';
  manuscriptId: string;
  title: string | null;
};
type Phase = 'loading' | 'ready' | 'unauthorized' | 'error';

function fieldFrom(value: string | null): DevelopField {
  return DEVELOP_FIELDS.includes(value as DevelopField) ? value as DevelopField : 'overview';
}

function intentFrom(value: string | null): DevelopIntentKey | null {
  return DEVELOP_INTENTS.includes(value as DevelopIntentKey) ? value as DevelopIntentKey : null;
}

function summaryLens(summary: ReadingSummary): DevelopField | null {
  return DEVELOP_FIELDS.includes(summary.commissionedLens as DevelopField)
    ? summary.commissionedLens as DevelopField
    : null;
}

function sectionLabel(section: RebuildSection | undefined, index = 0): string {
  return section?.heading?.trim() || `Section ${index + 1}`;
}

export default function P4R1DevelopController() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname() ?? '/dev/writers-studio-p4r1';
  const manuscriptId = params?.get('m') ?? null;
  const requestedSectionId = params?.get(SECTION_PARAM) ?? null;
  const selectedReadingId = params?.get('r') ?? null;
  const field = fieldFrom(params?.get('developField') ?? null);
  const intent = intentFrom(params?.get('developIntent') ?? null);
  const selectedAttentionItemId = params?.get('attentionItem') ?? null;
  const selectedDevelopmentalMovementId = params?.get('developmentalMovement') ?? null;
  const selectedLineageChapterId = params?.get('lineageChapter') ?? null;
  const selectedLineageCandidateId = params?.get('lineageCandidate') ?? null;
  const { id: appearance } = useAtmosphere();

  // H1 · R2: the seam produces the arrival; the hook only supplies the admission fact.
  const h1 = useHouseStudioH1WorkClaim(h1AdmissionNeeded(params));
  const { workId: carriedWorkId } = resolveH1Arrival(params, h1);

  const [phase, setPhase] = useState<Phase>('loading');
  const [context, setContext] = useState<ContextReady | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const { phase: worksPhase, works } = useLivingWorks();

  const [summaries, setSummaries] = useState<ReadingSummary[]>([]);
  const [summariesLoading, setSummariesLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  const [readingPayload, setReadingPayload] = useState<ReadingPayload | null>(null);
  const [readingLoading, setReadingLoading] = useState(false);
  const [readingError, setReadingError] = useState<string | null>(null);

  const [prep, setPrep] = useState<DevelopPreparation | null>(null);
  const [prepError, setPrepError] = useState<string | null>(null);
  const [preparing, setPreparing] = useState(false);

  const [scope, setScope] = useState<DevelopScopeChoice>({ kind: 'whole' });
  const [commissioning, setCommissioning] = useState(false);
  const [commissionError, setCommissionError] = useState<string | null>(null);

  const [attentionMap, setAttentionMap] = useState<WholeManuscriptAttentionMap | null>(null);
  const [attentionBusy, setAttentionBusy] = useState(false);
  const [attentionError, setAttentionError] = useState<string | null>(null);
  const [attentionProgress, setAttentionProgress] = useState<string | null>(null);

  const [chapterReview, setChapterReview] = useState<WholeManuscriptAttentionMap | null>(null);
  const [chapterReviewBusy, setChapterReviewBusy] = useState(false);
  const [chapterReadPending, setChapterReadPending] = useState(false);
  const [chapterNeedsCheckpoint, setChapterNeedsCheckpoint] = useState(false);
  const [chapterReviewError, setChapterReviewError] = useState<string | null>(null);
  const [chapterReviewProgress, setChapterReviewProgress] = useState<string | null>(null);
  const [chapterScorecard, setChapterScorecard] = useState<WholeManuscriptAttentionMap | null>(null);
  const [previousChapterScorecard, setPreviousChapterScorecard] = useState<WholeManuscriptAttentionMap | null>(null);
  const [previousChapterScoreRevision, setPreviousChapterScoreRevision] = useState<number | null>(null);
  const [chapterScoreBusy, setChapterScoreBusy] = useState(false);
  const [chapterScoreError, setChapterScoreError] = useState<string | null>(null);
  const [chapterMinimalPath, setChapterMinimalPath] = useState<WholeManuscriptAttentionMap | null>(null);
  const [chapterMinimalPathBusy, setChapterMinimalPathBusy] = useState(false);
  const [chapterMinimalPathError, setChapterMinimalPathError] = useState<string | null>(null);
  const [chapterBookFit, setChapterBookFit] = useState<WholeManuscriptAttentionMap | null>(null);
  const [chapterBookFitBusy, setChapterBookFitBusy] = useState(false);
  const [chapterBookFitError, setChapterBookFitError] = useState<string | null>(null);
  const [chapterMovement, setChapterMovement] = useState<WholeManuscriptAttentionMap | null>(null);
  const [chapterMovementBusy, setChapterMovementBusy] = useState(false);
  const [chapterMovementError, setChapterMovementError] = useState<string | null>(null);

  const [writerUnderstanding, setWriterUnderstanding] = useState<WriterUnderstanding | null>(null);
  const [writerUnderstandingBusy, setWriterUnderstandingBusy] = useState(false);
  const [writerUnderstandingError, setWriterUnderstandingError] = useState<string | null>(null);

  const [developmentalOrientation, setDevelopmentalOrientation] = useState<DevelopmentalOrientation | null>(null);
  const [developmentalOrientationBusy, setDevelopmentalOrientationBusy] = useState(false);
  const [developmentalOrientationError, setDevelopmentalOrientationError] = useState<string | null>(null);

  const [lineageOrientation, setLineageOrientation] = useState<IntellectualLineageOrientation | null>(null);
  const [lineageBusy, setLineageBusy] = useState(false);
  const [lineageError, setLineageError] = useState<string | null>(null);
  const [chapterLineage, setChapterLineage] = useState<ChapterLineageScan | null>(null);
  const [chapterLineageBusy, setChapterLineageBusy] = useState(false);
  const [chapterLineageError, setChapterLineageError] = useState<string | null>(null);

  const [themes, setThemes] = useState<LiveThemesPayload | null | undefined>(undefined);
  const [themeBusy, setThemeBusy] = useState(false);
  const [themeError, setThemeError] = useState<string | null>(null);

  const loadContext = useCallback(async () => {
    if (!manuscriptId) {
      setPhase('error');
      setMessage('Open Writer’s Studio with a specific manuscript.');
      return;
    }
    setPhase('loading');
    setMessage(null);
    try {
      const response = await apiFetch(
        '/api/writers-studio/rebuild/context?manuscriptId=' + encodeURIComponent(manuscriptId),
      );
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
      setPhase('ready');
    } catch {
      setPhase('error');
      setMessage('Develop could not open this Work just now. Nothing has changed.');
    }
  }, [manuscriptId]);

  const loadSummaries = useCallback(async () => {
    if (!manuscriptId) return;
    setSummariesLoading(true);
    const result = await fetchReadingSummaries(manuscriptId);
    if (result.ok) {
      setSummaries(result.readings);
      setListError(null);
    } else {
      setSummaries([]);
      setListError('Saved readings could not be reached just now.');
    }
    setSummariesLoading(false);
  }, [manuscriptId]);

  const loadPrep = useCallback(async () => {
    if (!manuscriptId) return;
    const result = await fetchPreparation(manuscriptId);
    if (result.ok) {
      setPrep(result.state);
      setPrepError(null);
    } else {
      setPrep(null);
      setPrepError('Preparation state could not be established.');
    }
  }, [manuscriptId]);

  const loadThemes = useCallback(async () => {
    if (!manuscriptId) return;
    setThemes(undefined);
    const result = await fetchLiveThemes(manuscriptId);
    if (result.ok) {
      setThemes(result.payload);
      setThemeError(null);
    } else {
      setThemes(null);
      setThemeError('Themes could not be reached just now.');
    }
  }, [manuscriptId]);

  useEffect(() => { void loadContext(); }, [loadContext]);
  useEffect(() => {
    if (!manuscriptId) return;
    void loadSummaries();
    void loadPrep();
  }, [manuscriptId, loadSummaries, loadPrep]);

  useEffect(() => {
    if (field === 'themes' && manuscriptId) void loadThemes();
  }, [field, manuscriptId, loadThemes]);

  useEffect(() => {
    if (!selectedReadingId || !manuscriptId) {
      setReadingPayload(null);
      setReadingError(null);
      setReadingLoading(false);
      return;
    }
    let cancelled = false;
    setReadingLoading(true);
    setReadingError(null);
    void fetchReading(manuscriptId, selectedReadingId).then((result) => {
      if (cancelled) return;
      setReadingLoading(false);
      if (!result.ok) {
        setReadingPayload(null);
        setReadingError('That saved reading could not be opened. It has not changed.');
        return;
      }
      setReadingPayload(result.payload);
    });
    return () => { cancelled = true; };
  }, [manuscriptId, selectedReadingId]);

  const currentSectionId = useMemo(() => {
    if (!context?.sections.length) return null;
    if (requestedSectionId && context.sections.some((section) => section.draftSectionId === requestedSectionId)) {
      return requestedSectionId;
    }
    return context.sections[0]?.draftSectionId ?? null;
  }, [context, requestedSectionId]);

  const currentSection = useMemo(
    () => context?.sections.find((section) => section.draftSectionId === currentSectionId) ?? null,
    [context, currentSectionId],
  );

  const currentChapter = useMemo(
    () => context && currentSectionId ? chapterSpanFor(context.sections, currentSectionId) : null,
    [context, currentSectionId],
  );
  const currentChapterRootId = currentChapter?.root.draftSectionId ?? null;
  const currentChapterFirstSectionId = currentChapter?.sections[0]?.draftSectionId ?? null;
  const previousChapterRootRef = useRef<string | null>(null);

  useEffect(() => {
    const previous = previousChapterRootRef.current;
    previousChapterRootRef.current = currentChapterRootId;
    if (!previous || previous === currentChapterRootId) return;

    /* A chapter is a distinct developmental subject. Never let one chapter's
       presentation-only expansions or error state masquerade as another's. */
    setChapterReview(null);
    setChapterReviewError(null);
    setChapterReviewProgress(null);
    setChapterNeedsCheckpoint(false);
    setChapterReadPending(false);
    setChapterBookFit(null);
    setChapterBookFitError(null);
    setChapterMovement(null);
    setChapterMovementError(null);
  }, [currentChapterRootId]);

  useEffect(() => {
    if (!context || !currentChapterFirstSectionId || typeof window === 'undefined') {
      setChapterReview(null);
      return;
    }
    const key = `writers-studio:chapter-review:v1:${context.manuscriptId}:${currentChapterFirstSectionId}`;
    try {
      const raw = window.localStorage.getItem(key) ?? window.sessionStorage.getItem(key);
      if (!raw) {
        setChapterReview(null);
        return;
      }
      const cached = JSON.parse(raw) as { draftRevision?: number; map?: WholeManuscriptAttentionMap };
      if (
        context.draftRevision !== null
        && cached.draftRevision === context.draftRevision
        && cached.map?.manuscriptId === context.manuscriptId
      ) {
        setChapterReview(cached.map);
        setChapterReviewError(null);
        setChapterReviewProgress(null);
        window.localStorage.setItem(key, raw);
      } else {
        setChapterReview(null);
      }
    } catch {
      window.localStorage.removeItem(key);
      window.sessionStorage.removeItem(key);
      setChapterReview(null);
    }
  }, [context?.manuscriptId, context?.draftRevision, currentChapterFirstSectionId]);

  useEffect(() => {
    if (!context || !currentChapterRootId || typeof window === 'undefined') {
      setChapterScorecard(null);
      setPreviousChapterScorecard(null);
      setPreviousChapterScoreRevision(null);
      setChapterMinimalPath(null);
      return;
    }

    const currentKey = `writers-studio:chapter-scorecard:v1:${context.manuscriptId}:${currentChapterRootId}`;
    const previousKey = `writers-studio:chapter-scorecard-previous:v1:${context.manuscriptId}:${currentChapterRootId}`;
    const minimalKey = `writers-studio:chapter-minimal-path:v2:${context.manuscriptId}:${currentChapterRootId}`;

    const parseSnapshot = (raw: string | null) => {
      if (!raw) return null;
      try {
        const parsed = JSON.parse(raw) as { draftRevision?: number; map?: WholeManuscriptAttentionMap };
        return Number.isInteger(parsed.draftRevision)
          && parsed.map?.manuscriptId === context.manuscriptId
          ? { draftRevision: parsed.draftRevision as number, map: parsed.map }
          : null;
      } catch {
        return null;
      }
    };

    const current = parseSnapshot(window.sessionStorage.getItem(currentKey));
    const previous = parseSnapshot(window.sessionStorage.getItem(previousKey));

    if (current && context.draftRevision !== null && current.draftRevision === context.draftRevision) {
      setChapterScorecard(current.map);
      setPreviousChapterScorecard(previous?.map ?? null);
      setPreviousChapterScoreRevision(previous?.draftRevision ?? null);
    } else {
      if (current && (context.draftRevision === null || current.draftRevision !== context.draftRevision)) {
        window.sessionStorage.setItem(previousKey, JSON.stringify(current));
        setPreviousChapterScorecard(current.map);
        setPreviousChapterScoreRevision(current.draftRevision);
      } else {
        setPreviousChapterScorecard(previous?.map ?? null);
        setPreviousChapterScoreRevision(previous?.draftRevision ?? null);
      }
      setChapterScorecard(null);
    }

    const minimal = parseSnapshot(window.sessionStorage.getItem(minimalKey));
    setChapterMinimalPath(
      minimal && context.draftRevision !== null && minimal.draftRevision === context.draftRevision
        ? minimal.map
        : null,
    );
  }, [context?.manuscriptId, context?.draftRevision, currentChapterRootId]);

  useEffect(() => {
    if (!context || !currentSection) return;
    setScope((previous) => {
      if (previous.kind === 'whole' || previous.kind === 'range') return previous;
      if (previous.kind === 'chapter' && currentChapter?.sections.length) {
        return {
          kind: 'chapter',
          label: currentChapter.root.heading?.trim() || 'Current chapter',
          fromSectionId: currentChapter.sections[0]!.draftSectionId,
          toSectionId: currentChapter.sections[currentChapter.sections.length - 1]!.draftSectionId,
        };
      }
      return {
        kind: 'section',
        sectionId: currentSection.draftSectionId,
        label: currentSection.heading?.trim() || 'Current section',
      };
    });
  }, [context?.manuscriptId, currentSectionId]);

  useEffect(() => {
    if (!context || !currentSection) return;
    const chapter = currentChapter;
    if (chapter?.sections.length) {
      setScope({
        kind: 'chapter',
        label: chapter.root.heading?.trim() || 'Current chapter',
        fromSectionId: chapter.sections[0]!.draftSectionId,
        toSectionId: chapter.sections[chapter.sections.length - 1]!.draftSectionId,
      });
    } else {
      setScope({
        kind: 'section',
        sectionId: currentSection.draftSectionId,
        label: currentSection.heading?.trim() || 'Current section',
      });
    }
  }, [context?.manuscriptId]);

  // HOUSE-STUDIO-CIRCULATION-01R1: a carried Work is honoured only while it validates.
  const workContext = resolveSituatedWorkContext(
    worksPhase, works, context?.manuscriptId ?? manuscriptId, carriedWorkId,
  );
  const work = currentWork(workContext);
  const workTitle = work?.title ?? context?.title ?? 'This Work';

  useEffect(() => {
    let cancelled = false;
    if (!work?.id) {
      setWriterUnderstanding(null);
      setWriterUnderstandingError(null);
      return;
    }
    setWriterUnderstandingError(null);
    void fetchWriterUnderstanding(work.id).then((result) => {
      if (cancelled) return;
      if (!result.ok) {
        setWriterUnderstanding(null);
        setWriterUnderstandingError('MAIA’s understanding of your writing could not be opened just now.');
        return;
      }
      setWriterUnderstanding(result.understanding);
    });
    return () => { cancelled = true; };
  }, [work?.id]);

  const updateQuery = useCallback((mutate: (query: URLSearchParams) => void) => {
    const next = new URLSearchParams(params?.toString() ?? '');
    mutate(next);
    const query = next.toString();
    router.push(`${pathname}${query ? `?${query}` : ''}`);
  }, [params, pathname, router]);

  const saveUnderstanding = useCallback(async (draft: WriterUnderstandingDraft) => {
    if (!work?.id || writerUnderstandingBusy) return;
    setWriterUnderstandingBusy(true);
    setWriterUnderstandingError(null);
    try {
      const result = await saveWriterUnderstanding(work.id, draft);
      if (!result.ok) {
        setWriterUnderstandingError('Your writing context was not saved. Nothing else changed.');
        return;
      }
      setWriterUnderstanding(result.understanding);
    } finally {
      setWriterUnderstandingBusy(false);
    }
  }, [work?.id, writerUnderstandingBusy]);

  const reflectDevelopmentalProcess = useCallback(async () => {
    if (!context || developmentalOrientationBusy) return;
    setDevelopmentalOrientationBusy(true);
    setDevelopmentalOrientationError(null);
    try {
      const result = await requestDevelopmentalOrientation(context.manuscriptId);
      if (!result.ok) {
        setDevelopmentalOrientationError(
          result.refusal === 'current_whole_manuscript_readings_required'
            ? 'MAIA needs a current whole-manuscript reading before reflecting on the Work’s larger developmental process.'
            : 'MAIA could not reflect on the larger developmental process just now. Nothing in the Work changed.',
        );
        return;
      }
      setDevelopmentalOrientation(result.orientation);
      if (typeof window !== 'undefined' && context.draftRevision !== null) {
        window.sessionStorage.setItem(
          `writers-studio:developmental-orientation:${context.manuscriptId}`,
          JSON.stringify({
            draftRevision: context.draftRevision,
            orientation: result.orientation,
          }),
        );
      }
    } finally {
      setDevelopmentalOrientationBusy(false);
    }
  }, [context, developmentalOrientationBusy]);

  const orientLineage = useCallback(async () => {
    if (!context || lineageBusy) return;
    setLineageBusy(true);
    setLineageError(null);
    try {
      const result = await requestIntellectualLineageOrientation(context.manuscriptId);
      if (!result.ok) {
        setLineageError('MAIA could not orient to the intellectual field just now. Nothing in the manuscript or bibliography changed.');
        return;
      }
      setLineageOrientation(result.orientation);
      if (typeof window !== 'undefined' && context.draftRevision !== null) {
        window.sessionStorage.setItem(
          `writers-studio:lineage-orientation:${context.manuscriptId}`,
          JSON.stringify({
            draftRevision: context.draftRevision,
            orientation: result.orientation,
          }),
        );
      }
    } finally {
      setLineageBusy(false);
    }
  }, [context, lineageBusy]);

  const investigateChapterLineage = useCallback(async (chapterRootId: string) => {
    if (!context || chapterLineageBusy) return;
    updateQuery((query) => {
      query.set('mode', 'develop');
      query.set('developField', 'overview');
      query.set('lineageChapter', chapterRootId);
    });
    setChapterLineageBusy(true);
    setChapterLineageError(null);
    try {
      const result = await requestChapterLineageScan(context.manuscriptId, chapterRootId);
      if (!result.ok) {
        setChapterLineageError('MAIA could not complete that chapter lineage investigation just now. Nothing in the manuscript or bibliography changed.');
        return;
      }
      setChapterLineage(result.scan);
      if (typeof window !== 'undefined' && context.draftRevision !== null) {
        window.sessionStorage.setItem(
          `writers-studio:lineage-chapter:${context.manuscriptId}:${chapterRootId}`,
          JSON.stringify({
            draftRevision: context.draftRevision,
            scan: result.scan,
          }),
        );
      }
    } finally {
      setChapterLineageBusy(false);
    }
  }, [context, chapterLineageBusy, updateQuery]);

  const selectLineageCandidate = useCallback((
    chapterRootId: string,
    candidateId: string,
  ) => {
    updateQuery((query) => {
      query.set('mode', 'develop');
      query.set('developField', 'overview');
      query.set('lineageChapter', chapterRootId);
      query.set('lineageCandidate', candidateId);
    });
  }, [updateQuery]);

  const showLineageCandidate = useCallback((
    chapterRootId: string,
    candidateId: string,
    sectionId: string,
  ) => {
    updateQuery((query) => {
      query.set('mode', 'write');
      query.set(SECTION_PARAM, sectionId);
      query.set('developField', 'overview');
      query.set('lineageChapter', chapterRootId);
      query.set('lineageCandidate', candidateId);
      query.delete('attentionItem');
      query.delete('insightReading');
      query.delete('insightObservation');
      query.delete('insightAction');
    });
  }, [updateQuery]);

  const projectedReading: ReadingView | null = useMemo(() => {
    if (!readingPayload) return null;
    return readingView(
      readingPayload.reading,
      readingPayload.assessment,
      readingPayload.sections,
    );
  }, [readingPayload]);

  const observationTargets = useMemo(() => {
    const targets: Record<string, string> = {};
    const reading = readingPayload?.reading;
    if (!reading || reading.outcome !== 'reading') return targets;
    for (const observation of reading.observations) {
      for (const ref of observation.evidenceRefs) {
        const sectionId = sectionIdsOf(ref)[0];
        if (sectionId) {
          targets[observation.key] = sectionId;
          break;
        }
      }
    }
    return targets;
  }, [readingPayload]);

  /* Editorial focus is stricter than orientation: only an exact passage
     reference may become a "Work with this" locus. Section-only evidence can
     still orient the member with "Show me where" but is never silently widened. */
  const observationWorkTargets = useMemo(() => {
    const targets: Record<string, string> = {};
    const reading = readingPayload?.reading;
    if (!reading || reading.outcome !== 'reading') return targets;
    for (const observation of reading.observations) {
      for (const ref of observation.evidenceRefs) {
        if (ref.kind !== 'passage') continue;
        const sectionId = sectionIdsOf(ref)[0];
        if (sectionId) {
          targets[observation.key] = sectionId;
          break;
        }
      }
    }
    return targets;
  }, [readingPayload]);

  const onField = useCallback((nextField: DevelopField) => {
    updateQuery((query) => {
      query.set('mode', 'develop');
      if (nextField === 'overview') {
        query.delete('developField');
        query.delete('developIntent');
      } else {
        query.set('developField', nextField);
        query.delete('developIntent');
      }
      query.delete('r');
    });
  }, [updateQuery]);

  const onIntent = useCallback((
    nextIntent: DevelopIntentKey,
    nextField: Exclude<DevelopField, 'overview'>,
  ) => {
    updateQuery((query) => {
      query.set('mode', 'develop');
      query.set('developField', nextField);
      query.set('developIntent', nextIntent);
      query.delete('r');
    });
  }, [updateQuery]);

  const onDevelopmentalMovement = useCallback((movementId: string | null) => {
    updateQuery((query) => {
      query.set('mode', 'develop');
      query.set('developField', 'overview');
      if (movementId) query.set('developmentalMovement', movementId);
      else query.delete('developmentalMovement');
    });
  }, [updateQuery]);

  const onMode = useCallback((mode: 'home' | 'write' | 'develop' | 'review') => {
    if (mode === 'home') {
      const query = studioHomeReturnSearch(params?.toString() ?? '');
      router.push(`${pathname}${query ? `?${query}` : ''}`);
      return;
    }
    updateQuery((query) => {
      query.set('mode', mode);
      if (mode !== 'develop') {
        query.delete('developField');
        query.delete('developIntent');
        query.delete('r');
      }
      if (mode !== 'review') {
        query.delete('reviewRun');
        query.delete('reviewFinding');
      }
    });
  }, [params, pathname, router, updateQuery]);

  const onSection = useCallback((sectionId: string) => {
    if (!context) return;
    const selected = context.sections.find((section) => section.draftSectionId === sectionId);
    if (!selected) return;

    /* Choosing a place in the manuscript is also choosing the developmental
       scope. Do not leave the center/right field pretending the whole Work is
       still selected after the writer has explicitly chosen a chapter/section. */
    const chapter = chapterSpanFor(context.sections, sectionId);
    if (chapter?.root.draftSectionId === sectionId && chapter.sections.length) {
      setScope({
        kind: 'chapter',
        label: chapter.root.heading?.trim() || 'Current chapter',
        fromSectionId: chapter.sections[0]!.draftSectionId,
        toSectionId: chapter.sections[chapter.sections.length - 1]!.draftSectionId,
      });
    } else {
      setScope({
        kind: 'section',
        sectionId,
        label: selected.heading?.trim() || 'Current section',
      });
    }

    updateQuery((query) => {
      query.set('mode', 'develop');
      query.set(SECTION_PARAM, sectionId);

      /* Selecting a new manuscript place is a new Develop subject. Return to
         its Overview rather than inheriting another chapter's lens/read/thread. */
      query.delete('developField');
      query.delete('developIntent');
      query.delete('r');
      query.delete('attentionItem');
      query.delete('insightReading');
      query.delete('insightObservation');
      query.delete('insightAction');
      query.delete('editorialThread');
      query.delete('relationship');
    });
  }, [context, updateQuery]);

  const onReading = useCallback((readingId: string) => {
    const summary = summaries.find((candidate) => candidate.id === readingId);
    const lens = summary ? summaryLens(summary) : null;
    updateQuery((query) => {
      query.set('mode', 'develop');
      query.set('r', readingId);
      if (lens && lens !== 'overview') query.set('developField', lens);
    });
  }, [summaries, updateQuery]);

  const prepare = useCallback(async () => {
    if (!manuscriptId || !prep || preparing) return;
    const copy = preparationCopy(prep);
    if (!copy?.act) return;
    setPreparing(true);
    setPrepError(null);
    try {
      if (copy.act === 'begin_draft') {
        const begun = await beginDraft(apiFetch, manuscriptId);
        if (begun.kind !== 'ok' && begun.kind !== 'exists') {
          setPrepError('The working draft could not be prepared. Nothing has changed.');
          return;
        }
      } else {
        const digest = prep.kind === 'exact'
          ? prep.stateDigest
          : prep.kind === 'diverged'
            ? prep.disclosureDigest
            : null;
        if (!digest) return;
        const done = await actOnPreparation(manuscriptId, copy.act, digest);
        if (!done.ok) {
          setPrepError('The preparation state changed before the act completed. Nothing was guessed.');
          await loadPrep();
          return;
        }
      }
      await Promise.all([loadPrep(), loadContext()]);
    } finally {
      setPreparing(false);
    }
  }, [manuscriptId, prep, preparing, loadPrep, loadContext]);

  const readingScope = useCallback((): ReadingScope | null => {
    if (!context) return null;
    if (scope.kind === 'whole') return { kind: 'whole' };
    if (scope.kind === 'section') return { kind: 'section', sectionId: scope.sectionId };
    if (scope.kind === 'chapter') {
      return {
        kind: 'range',
        fromSectionId: scope.fromSectionId,
        toSectionId: scope.toSectionId,
      };
    }
    const from = context.sections[scope.fromIndex];
    const to = context.sections[scope.toIndex];
    if (!from || !to || scope.fromIndex > scope.toIndex) return null;
    return {
      kind: 'range',
      fromSectionId: from.draftSectionId,
      toSectionId: to.draftSectionId,
    };
  }, [context, scope]);

  const commission = useCallback(async () => {
    if (!manuscriptId || field === 'overview' || commissioning) return;
    if (prep?.kind !== 'ready') {
      setCommissionError('Prepare this Work for Develop before asking MAIA to read it.');
      return;
    }
    const chosen = readingScope();
    if (!chosen) {
      setCommissionError('Choose a valid reading scope first.');
      return;
    }
    setCommissioning(true);
    setCommissionError(null);
    try {
      const result = await requestDevelopmentalReading(
        manuscriptId,
        field as DevelopmentalLens,
        chosen,
      );
      if (!result.ok) {
        setCommissionError(
          result.refusal === 'ceiling_exceeded'
            ? 'That scope is larger than MAIA reads in one sitting. Choose a smaller range.'
            : 'MAIA did not create a reading. Nothing about your Work changed.',
        );
        return;
      }
      await loadSummaries();
      if (field === 'themes') await loadThemes();
      updateQuery((query) => {
        query.set('mode', 'develop');
        query.set('developField', field);
        query.set('r', result.readingId);
      });
    } finally {
      setCommissioning(false);
    }
  }, [
    manuscriptId,
    field,
    commissioning,
    prep,
    readingScope,
    loadSummaries,
    loadThemes,
    updateQuery,
  ]);

  const onThemeMutation = useCallback(async (mutation: ThemeMutation) => {
    if (!manuscriptId || themeBusy) return;
    setThemeBusy(true);
    setThemeError(null);
    try {
      const result = await mutateTheme(manuscriptId, mutation);
      if (!result.ok) {
        setThemeError('That Theme change was not saved. Nothing else changed.');
        return;
      }
      await loadThemes();
    } finally {
      setThemeBusy(false);
    }
  }, [manuscriptId, themeBusy, loadThemes]);

  const onGoToObservation = useCallback((
    readingId: string,
    observationKey: string,
    sectionId: string,
  ) => {
    updateQuery((query) => {
      query.set('mode', 'write');
      query.set(SECTION_PARAM, sectionId);
      query.set('insightReading', readingId);
      query.set('insightObservation', observationKey);
      query.delete('insightAction');
      /* Preserve developField / developIntent / r as the semantic return address.
         Write ignores them; Develop restores the exact exploration when the
         member returns. */
    });
  }, [updateQuery]);

  const onWorkWithObservation = useCallback((
    readingId: string,
    observationKey: string,
    sectionId: string,
  ) => {
    updateQuery((query) => {
      query.set('mode', 'write');
      query.set(SECTION_PARAM, sectionId);
      query.set('insightReading', readingId);
      query.set('insightObservation', observationKey);
      query.set('insightAction', 'focus');
      /* Keep developField / developIntent / r as the exact return address. */
    });
  }, [updateQuery]);

  useEffect(() => {
    if (!context || typeof window === 'undefined') return;
    const key = `writers-studio:developmental-orientation:${context.manuscriptId}`;
    const raw = window.sessionStorage.getItem(key);
    if (!raw) return;
    try {
      const cached = JSON.parse(raw) as {
        draftRevision?: number;
        orientation?: DevelopmentalOrientation;
      };
      if (
        context.draftRevision !== null
        && cached.draftRevision === context.draftRevision
        && cached.orientation?.manuscriptId === context.manuscriptId
      ) {
        setDevelopmentalOrientation(cached.orientation);
      }
    } catch {
      window.sessionStorage.removeItem(key);
    }
  }, [context?.manuscriptId, context?.draftRevision]);

  useEffect(() => {
    if (!context || typeof window === 'undefined') return;
    const key = `writers-studio:lineage-orientation:${context.manuscriptId}`;
    const raw = window.sessionStorage.getItem(key);
    if (!raw) return;
    try {
      const cached = JSON.parse(raw) as {
        draftRevision?: number;
        orientation?: IntellectualLineageOrientation;
      };
      if (
        context.draftRevision !== null
        && cached.draftRevision === context.draftRevision
        && validIntellectualLineageOrientation(cached.orientation)
        && cached.orientation.manuscriptId === context.manuscriptId
      ) {
        setLineageOrientation(cached.orientation);
      } else {
        window.sessionStorage.removeItem(key);
      }
    } catch {
      window.sessionStorage.removeItem(key);
    }
  }, [context?.manuscriptId, context?.draftRevision]);

  useEffect(() => {
    if (!context || typeof window === 'undefined') return;
    if (!selectedLineageChapterId) {
      setChapterLineage(null);
      return;
    }
    const key = `writers-studio:lineage-chapter:${context.manuscriptId}:${selectedLineageChapterId}`;
    const raw = window.sessionStorage.getItem(key);
    if (!raw) return;
    try {
      const cached = JSON.parse(raw) as {
        draftRevision?: number;
        scan?: ChapterLineageScan;
      };
      if (
        context.draftRevision !== null
        && cached.draftRevision === context.draftRevision
        && validChapterLineageScan(cached.scan)
        && cached.scan.manuscriptId === context.manuscriptId
        && cached.scan.chapterRootId === selectedLineageChapterId
      ) {
        setChapterLineage(cached.scan);
      } else {
        window.sessionStorage.removeItem(key);
      }
    } catch {
      window.sessionStorage.removeItem(key);
    }
  }, [
    context?.manuscriptId,
    context?.draftRevision,
    selectedLineageChapterId,
  ]);

  useEffect(() => {
    if (!context || typeof window === 'undefined') return;
    const key = `writers-studio:editorial-pass:v1:${context.manuscriptId}`;
    const raw = window.sessionStorage.getItem(key);
    if (!raw) return;
    try {
      const cached = JSON.parse(raw) as { draftRevision?: number; map?: WholeManuscriptAttentionMap };
      if (
        context.draftRevision !== null
        && cached.draftRevision === context.draftRevision
        && cached.map?.manuscriptId === context.manuscriptId
      ) {
        setAttentionMap(cached.map);
      }
    } catch {
      window.sessionStorage.removeItem(key);
    }
  }, [context?.manuscriptId, context?.draftRevision]);

  const performChapterRead = useCallback(async (revisionNumber: number) => {
    if (!context || !currentChapter?.sections.length || chapterReviewBusy) return;
    const chapterIds = currentChapter.sections.map((section) => section.draftSectionId);
    const chapterScope: ReadingScope = {
      kind: 'range',
      fromSectionId: chapterIds[0]!,
      toSectionId: chapterIds[chapterIds.length - 1]!,
    };

    setChapterReviewBusy(true);
    setChapterNeedsCheckpoint(false);
    setChapterReviewError(null);
    setChapterReviewProgress('MAIA is reading the chapter…');
    try {
      let overviewReadingId: string | null = null;
      for (const summary of summaries) {
        if (summary.commissionedLens !== 'overview') continue;
        const fetched = await fetchReading(context.manuscriptId, summary.id);
        if (!fetched.ok) continue;
        if (fetched.payload.reading.outcome !== 'reading') continue;
        if (fetched.payload.reading.readState.revisionNumber !== revisionNumber) continue;
        const frozenScope = fetched.payload.reading.scope.bodyScope;
        if (frozenScope.length !== chapterIds.length
          || frozenScope.some((id, index) => id !== chapterIds[index])) continue;
        overviewReadingId = summary.id;
        break;
      }

      if (!overviewReadingId) {
        const commissioned = await requestDevelopmentalReading(
          context.manuscriptId,
          'overview',
          chapterScope,
        );
        await loadSummaries();

        if (!commissioned.ok) {
          if (commissioned.stage === 'capture' && commissioned.refusal === 'revision_not_current') {
            setChapterNeedsCheckpoint(true);
            setChapterReviewProgress(null);
            return;
          }
          setChapterReviewError('MAIA could not finish the chapter reading. Nothing in your writing changed.');
          setChapterReviewProgress(null);
          return;
        }
        if (commissioned.outcome === 'none') {
          setChapterReviewError('MAIA completed the chapter reading but returned no usable observations. Nothing in your writing changed. Please try the reading again.');
          setChapterReviewProgress(null);
          return;
        }
        overviewReadingId = commissioned.readingId;
      }

      setChapterReviewProgress('MAIA has finished reading. Gathering her impressions…');
      const synthesized = await requestAttentionMap(
        context.manuscriptId,
        [overviewReadingId],
        [
          'Respond directly to the writer as a perceptive, encouraging editor who has just read this chapter closely. Use "you" and "your"; never refer to them as "the author".',
          'Relationship comes first. Before any problem, friction, or recommendation, let the writer feel accurately seen in the living intelligence of the chapter. Name what is working and worth protecting; what you genuinely appreciate; what feels inspiring, generative, original, or full of possibility; and, only if the evidence truly earns it, what is unusually brilliant or genius. Never flatter and never manufacture praise.',
          'The opening reflection may carry several connected strengths when that is what the chapter earns. Be conversational, warm without gush, clear, and specific. Problems come only after this reflection has established that you understand and value the Work.',
          'Keep each item compact: label no more than 8 words, notice no more than 3 short sentences, whyItMatters no more than 2 short sentences. Put examples and quotations in evidence, not in the main response unless one very short phrase is essential.',
          'Name friction as something worth looking at together, not as an indictment. Avoid adversarial phrasing such as "fails", "denies", "undermines", or "contradicts" unless the textual evidence truly requires that exact claim.',
          'Return exactly four evidenced items, using the attention bands in this order:',
          'begin-here: What is working — begin positively and specifically. Show that you understood the writing before you analyze it.',
          'next: What I think this chapter is doing — a concise grasp of its movement and purpose.',
          'later: What may need attention — the most useful friction or opportunity, without jargon or grading.',
          'watch: Where I would start — one clear, manageable next editorial focus.',
          'Use chapter scale unless a smaller scale is necessary to ground the point. Do not rewrite the prose. Do not use technical editorial vocabulary unless unavoidable.',
        ].join('\n'),
      );
      if (!synthesized.ok) {
        setChapterReviewError('MAIA read the chapter but could not gather her impressions just now. The reading is saved and your writing is unchanged.');
        return;
      }
      setChapterReview(synthesized.map);
      setChapterReviewProgress(null);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(
          `writers-studio:chapter-review:v1:${context.manuscriptId}:${chapterIds[0]}`,
          JSON.stringify({ draftRevision: revisionNumber, map: synthesized.map }),
        );
      }
    } finally {
      setChapterReviewBusy(false);
    }
  }, [context, currentChapter, chapterReviewBusy, loadSummaries, summaries]);

  const readCurrentChapter = useCallback(async () => {
    if (!context || !currentChapter?.sections.length || chapterReviewBusy) return;
    if (prep?.kind !== 'ready') {
      const copy = prep ? preparationCopy(prep) : null;
      if (!copy?.act) {
        setChapterReviewError('MAIA cannot establish a safe chapter reading yet. Nothing has changed.');
        return;
      }
      setChapterReadPending(true);
      setChapterReviewProgress('Preparing the chapter for MAIA…');
      await prepare();
      return;
    }
    if (context.draftRevision === null) {
      setChapterNeedsCheckpoint(true);
      setChapterReviewError(null);
      return;
    }
    await performChapterRead(context.draftRevision);
  }, [context, currentChapter, chapterReviewBusy, prep, prepare, performChapterRead]);

  const checkpointCurrentChapterAndRead = useCallback(async () => {
    if (!context || chapterReviewBusy) return;
    setChapterReviewBusy(true);
    setChapterReviewError(null);
    setChapterReviewProgress('Saving the current draft for this reading…');
    const result = await checkpointServerDraft(apiFetch, context.manuscriptId, {
      baseRevisionId: context.version,
      idempotencyKey: newIdempotencyKey(),
    });
    if (result.kind !== 'ok' || result.revisionCount === null) {
      setChapterReviewBusy(false);
      setChapterReviewProgress(null);
      setChapterReviewError(
        result.kind === 'conflict'
          ? 'The draft moved while MAIA was preparing to read it. Reload the chapter, then try again.'
          : 'The current draft could not be saved for reading just now. Your writing is unchanged.',
      );
      return;
    }
    const revisionNumber = result.revisionCount;
    setContext((previous) => previous ? {
      ...previous,
      version: result.revisionId ?? previous.version,
      draftRevision: revisionNumber,
    } : previous);
    setChapterNeedsCheckpoint(false);
    setChapterReviewBusy(false);
    await performChapterRead(revisionNumber);
  }, [context, chapterReviewBusy, performChapterRead]);

  const readChapterInBook = useCallback(async () => {
    if (!context || !chapterReview || chapterBookFitBusy || context.draftRevision === null) return;
    setChapterBookFitBusy(true);
    setChapterBookFitError(null);
    try {
      const wholeSectionIds = context.sections.map((section) => section.draftSectionId);
      let wholeReadingId: string | null = null;
      for (const summary of summaries.filter((candidate) => candidate.commissionedLens === 'overview')) {
        const frozen = await fetchReading(context.manuscriptId, summary.id);
        if (!frozen.ok) continue;
        const reading = frozen.payload.reading;
        if (reading.readState.revisionNumber !== context.draftRevision) continue;
        if (
          reading.scope.bodyScope.length !== wholeSectionIds.length
          || !reading.scope.bodyScope.every((id, index) => id === wholeSectionIds[index])
        ) continue;
        wholeReadingId = reading.id;
        break;
      }

      if (!wholeReadingId) {
        const whole = await requestDevelopmentalReading(
          context.manuscriptId,
          'overview',
          { kind: 'whole' },
        );
        if (!whole.ok) {
          setChapterBookFitError(
            whole.refusal === 'revision_not_current'
              ? 'The book changed since its last reading snapshot. Save the current draft, then ask again.'
              : 'MAIA could not read enough of the book to place this chapter confidently. Nothing in the manuscript changed.',
          );
          return;
        }
        wholeReadingId = whole.readingId;
        await loadSummaries();
      }

      const out = await requestAttentionMap(
        context.manuscriptId,
        [wholeReadingId],
        [
          'The writer has asked how the currently reviewed chapter fits into the whole book.',
          'Respond as a perceptive book editor. Be concise, conversational, specific, and encouraging before naming friction.',
          'Use exactly four evidenced items, in this order:',
          'begin-here: What this chapter contributes to the whole book — name its distinctive job and what it makes possible.',
          'next: Why this placement works — identify the strongest evidence that the reader is prepared for it here.',
          'later: What the placement asks of the chapter — name any burden, repetition, missing bridge, or integration problem created by what comes before or after.',
          'watch: What I would protect or change first — one practical macro-level recommendation, not a rewrite.',
          'Distinguish chapter evidence from whole-book evidence. Do not pretend a placement is wrong merely because another placement is imaginable.',
        ].join('\n'),
      );
      if (!out.ok) {
        setChapterBookFitError('MAIA read the book context but could not gather the placement reflection just now. Nothing changed.');
        return;
      }
      setChapterBookFit(out.map);
    } finally {
      setChapterBookFitBusy(false);
    }
  }, [context, chapterReview, chapterBookFitBusy, summaries, loadSummaries]);

  const readChapterMovement = useCallback(async () => {
    if (!context || !chapterReview || chapterMovementBusy) return;
    setChapterMovementBusy(true);
    setChapterMovementError(null);
    try {
      const out = await requestAttentionMap(
        context.manuscriptId,
        chapterReview.readingIds,
        [
          'Stay inside this chapter and describe its movement as an editor helping the writer strengthen what is already here.',
          'Be conversational and specific. Begin with what is alive and working before naming imbalance.',
          'Use exactly four evidenced items, in this order:',
          'begin-here: The chapter\'s strongest movement — where experience, idea, story, or image carries the reader naturally.',
          'next: The chapter\'s current shape — describe the sequence and proportions in ordinary language.',
          'later: Where energy or clarity thins — identify repetition, density, abstraction, transition, or imbalance without grading the writing.',
          'watch: The smallest structural move with the most leverage — one thing to strengthen, compress, move, bridge, or let breathe before touching sentences.',
          'Pay particular attention to the relation among lived material, examples or story, conceptual explanation, formal architecture, lineage, and integration. Do not rewrite prose.',
        ].join('\n'),
      );
      if (!out.ok) {
        setChapterMovementError('MAIA could not gather the chapter movement reflection just now. The chapter review is unchanged.');
        return;
      }
      setChapterMovement(out.map);
    } finally {
      setChapterMovementBusy(false);
    }
  }, [context, chapterReview, chapterMovementBusy]);

  const scoreCurrentChapter = useCallback(async () => {
    if (!context || !chapterReview || chapterScoreBusy) return;
    setChapterScoreBusy(true);
    setChapterScoreError(null);
    try {
      const out = await requestAttentionMap(
        context.manuscriptId,
        chapterReview.readingIds,
        [
          'Create an optional writer-facing chapter scorecard from these same frozen chapter readings. Do not reread the manuscript.',
          'Use exactly five evidenced items: Clarity, Coherence, Reader orientation, Voice, and Momentum.',
          'For each item, put the score at the start of notice in the form "N/5 — ..." where N is an integer 1 through 5.',
          'Explain the score in plain language and use whyItMatters to say the smallest concrete change that could improve it by one level.',
          'Treat this as a transparent craft rubric, not a verdict on the writer or the value of the work. Do not score book-level placement because this reading is chapter-bounded.',
        ].join('\n'),
      );
      if (!out.ok) {
        setChapterScoreError('MAIA could not prepare the scorecard just now. The chapter review is unchanged.');
        return;
      }
      setChapterScorecard(out.map);
      if (typeof window !== 'undefined' && context.draftRevision !== null && currentChapterRootId) {
        window.sessionStorage.setItem(
          `writers-studio:chapter-scorecard:v1:${context.manuscriptId}:${currentChapterRootId}`,
          JSON.stringify({ draftRevision: context.draftRevision, map: out.map }),
        );
      }
    } finally {
      setChapterScoreBusy(false);
    }
  }, [context, chapterReview, chapterScoreBusy, currentChapterRootId]);

  const minimalPathCurrentChapter = useCallback(async () => {
    if (!context || !chapterReview || chapterMinimalPathBusy) return;
    setChapterMinimalPathBusy(true);
    setChapterMinimalPathError(null);
    try {
      const scoreSnapshot = chapterScorecard
        ? chapterScorecard.items.map((item) => `${item.label}: ${item.notice}`).join('\n')
        : 'No scorecard requested. Work directly from the frozen chapter reading.';
      const out = await requestAttentionMap(
        context.manuscriptId,
        chapterReview.readingIds,
        [
          chapterScorecard
            ? 'Create a writer-facing Minimal path to 5/5 from these same frozen chapter readings and the current optional scorecard. Do not reread the manuscript.'
            : 'Create a writer-facing minimal strengthening path from these same frozen chapter readings. Do not reread the manuscript and do not invent a scorecard.',
          chapterScorecard
            ? 'The goal is not to guarantee perfect scores. Identify the smallest set of high-leverage changes most likely to materially improve the weaker dimensions while protecting what already works.'
            : 'Identify the smallest set of high-leverage changes most likely to materially improve the chapter while protecting what already works.',
          'Prefer light and moderate edits: compression, clarification, transition, reader signposting, local reordering, or removing unnecessary repetition. A major rewrite is exceptional and must not be proposed while smaller interventions could plausibly solve the issue.',
          'Return exactly four evidenced items, ordered by leverage, using begin-here, next, later, watch.',
          'Begin each notice with [Light], [Moderate], or [Heavy]. Use [Heavy] only when the evidence shows a smaller move is insufficient.',
          'For each item, describe one concrete editorial move without writing replacement prose.',
          chapterScorecard
            ? 'In whyItMatters, name which current scorecard dimensions the move is likely to help and what must be protected.'
            : 'In whyItMatters, explain the concrete reader or chapter-level benefit and what must be protected. Do not mention a scorecard or scoring dimensions because none was requested.',
          'If the chapter appears improvable without a major rewrite, make the watch item explicitly say so.',
          chapterScorecard ? 'Current scorecard:' : 'Scorecard status:',
          scoreSnapshot,
        ].join('\n'),
      );
      if (!out.ok) {
        setChapterMinimalPathError('MAIA could not prepare the minimal path just now. The scorecard and chapter are unchanged.');
        return;
      }
      setChapterMinimalPath(out.map);
      if (typeof window !== 'undefined' && context.draftRevision !== null && currentChapterRootId) {
        window.sessionStorage.setItem(
          `writers-studio:chapter-minimal-path:v2:${context.manuscriptId}:${currentChapterRootId}`,
          JSON.stringify({ draftRevision: context.draftRevision, map: out.map }),
        );
      }
    } finally {
      setChapterMinimalPathBusy(false);
    }
  }, [context, chapterReview, chapterScorecard, chapterMinimalPathBusy, currentChapterRootId]);

  useEffect(() => {
    if (!chapterReadPending || prep?.kind !== 'ready' || chapterReviewBusy) return;
    setChapterReadPending(false);
    void readCurrentChapter();
  }, [chapterReadPending, prep?.kind, chapterReviewBusy, readCurrentChapter]);

  const commissionAttentionMap = useCallback(async () => {
    if (!context || attentionBusy) return;
    if (context.draftRevision === null) {
      setAttentionError('The current draft could not be established safely, so MAIA did not begin the editorial pass.');
      return;
    }
    if (prep?.kind !== 'ready') {
      setAttentionError('Prepare this Work for Develop before asking MAIA to make an editorial pass.');
      return;
    }
    setAttentionBusy(true);
    setAttentionError(null);
    setAttentionProgress('MAIA is reading through the manuscript for edit opportunities…');
    try {
      const bundle = await runWholeManuscriptReview(
        context.manuscriptId,
        (done, total, lens) => setAttentionProgress(
          done >= total ? 'Eight readings complete. Preparing edit suggestions…'
            : `Reading ${done + 1} of ${total}: ${lens}…`,
        ),
        {
          revisionNumber: context.draftRevision,
          sectionIds: context.sections.map((section) => section.draftSectionId),
        },
      );
      await loadSummaries();
      if (bundle.failures.length > 0 || bundle.remaining.length > 0 || bundle.readingIds.length !== 8) {
        setAttentionError('MAIA did not finish reading the whole manuscript, so the editorial pass is incomplete. The readings she completed are still available.');
        return;
      }
      setAttentionProgress('Preparing the editorial pass…');
      const synthesized = await requestAttentionMap(
        context.manuscriptId,
        bundle.readingIds,
        'Make an editorial pass through this whole manuscript from macro to micro. Identify the evidenced places where a concrete editorial move may help: clarification, compression, expansion, transition, reordering, repetition, voice, pacing, or another text-level change supported by the frozen readings. Do not rewrite the prose yet. Order the opportunities from Begin here through Next, Later, and Watch. For each item, say plainly what may be worth editing and why, while preserving the author’s intention, voice, subject, and intentional ambiguity. Ground every item in the frozen observations.',
      );
      if (!synthesized.ok) {
        setAttentionError('MAIA finished the readings, but could not prepare the editorial pass just now. The readings remain available and nothing in the manuscript changed.');
        return;
      }
      setAttentionMap(synthesized.map);
      if (typeof window !== 'undefined') {
        const key = `writers-studio:editorial-pass:v1:${context.manuscriptId}`;
        window.sessionStorage.setItem(
          key,
          JSON.stringify({ draftRevision: context.draftRevision, map: synthesized.map }),
        );
      }
      setAttentionProgress(null);
    } finally {
      setAttentionBusy(false);
    }
  }, [context, attentionBusy, prep, loadSummaries]);

  const openAttentionSection = useCallback((itemId: string, sectionId: string) => {
    updateQuery((query) => {
      query.set('mode', 'write');
      query.set(SECTION_PARAM, sectionId);
      query.set('developField', 'overview');
      query.set('attentionItem', itemId);
      query.delete('insightAction');
      query.delete('insightReading');
      query.delete('insightObservation');
    });
  }, [updateQuery]);

  const discussAttentionItem = useCallback((item: AttentionItem) => {
    updateQuery((query) => {
      query.set('mode', 'develop');
      query.set('developField', 'overview');
      query.set('attentionItem', item.id);
      query.delete('insightAction');
      query.delete('insightReading');
      query.delete('insightObservation');
    });
  }, [updateQuery]);

  const workWithAttentionItem = useCallback(async (
    itemId: string,
    sectionId: string,
    source: 'chapter-review' | 'minimal-path' | 'attention-map',
  ) => {
    const sourceMap = source === 'minimal-path'
      ? chapterMinimalPath
      : source === 'chapter-review'
        ? chapterReview
        : attentionMap;
    const item = sourceMap?.items.find((candidate) => candidate.id === itemId);
    if (!item || !context) return;

    /* A synthesis can be structurally evidence-bound yet cite the wrong frozen
       observation for a semantically specific refinement. Before crossing into
       Write, compare the claim against every frozen observation in the same
       reading and prefer a clearly stronger textual match. The frozen reading
       remains the authority; no new model call is used to repair the citation. */
    const claimTokens = new Set(
      [item.label, item.notice, item.whyItMatters]
        .join(' ')
        .toLowerCase()
        .match(/[a-z][a-z-]{3,}/g)
        ?.filter((token) => ![
          'this','that','with','from','into','than','then','they','them','their',
          'what','when','where','which','while','would','could','should','about',
          'chapter','scorecard','dimensions','reader','reading','work','protect',
          'light','moderate','heavy','edit','edits','improve','improving',
        ].includes(token)) ?? [],
    );
    const normalizeToken = (token: string) => token
      .replace(/(ing|ed|es|s)$/u, '')
      .slice(0, 12);
    const normalizedClaimTokens = [...claimTokens].map(normalizeToken).filter((token) => token.length >= 4);
    const overlapScore = (text: string) => {
      const normalizedText = (text.toLowerCase().match(/[a-z][a-z-]{3,}/g) ?? [])
        .map(normalizeToken);
      let score = 0;
      for (const token of normalizedClaimTokens) {
        if (normalizedText.some((candidate) => candidate === token || candidate.startsWith(token) || token.startsWith(candidate))) {
          score += 1;
        }
      }
      return score;
    };

    const evidenceCandidates = [...item.evidence];
    for (const readingId of [...new Set(item.evidence.map((evidence) => evidence.readingId))]) {
      const frozen = await fetchReading(context.manuscriptId, readingId);
      if (!frozen.ok) continue;
      const ranked = frozen.payload.reading.observations
        .map((observation) => ({ observation, score: overlapScore(observation.observation) }))
        .sort((a, b) => b.score - a.score);
      const best = ranked[0];
      const citedKeys = new Set(
        item.evidence.filter((evidence) => evidence.readingId === readingId)
          .map((evidence) => evidence.observationKey),
      );
      const citedScore = ranked
        .filter(({ observation }) => citedKeys.has(observation.key))
        .reduce((max, candidate) => Math.max(max, candidate.score), 0);
      if (best && best.score >= 2 && best.score > citedScore && !citedKeys.has(best.observation.key)) {
        const recoveredSectionIds: string[] = Array.from(
          new Set<string>(best.observation.evidenceRefs.flatMap((ref) => [...sectionIdsOf(ref)])),
        );
        if (recoveredSectionIds.length > 0) {
          evidenceCandidates.unshift({
            readingId,
            observationKey: best.observation.key,
            sectionIds: recoveredSectionIds,
            lens: best.observation.lens,
            observation: best.observation.observation,
          });
        }
      }
    }

    /* C11R2 — use the same verifier that Write/Focus uses. A model-visible
       passage ref is not sufficient: it must still resolve CURRENT, VERIFIED,
       EDITABLE and BODY-ADDRESSABLE against the present manuscript. */
    for (const evidence of evidenceCandidates) {
      const insight = await loadCanvasInsight(
        context.manuscriptId,
        evidence.readingId,
        evidence.observationKey,
      );
      const passage = insight?.passages.find(
        (candidate) => candidate.verified && candidate.editable && candidate.range,
      );
      if (passage?.range) {
        updateQuery((query) => {
          query.set('mode', 'write');
          query.set(SECTION_PARAM, passage.sectionId);
          query.set('developField', 'overview');
          query.set('attentionItem', itemId);
          query.set('insightReading', evidence.readingId);
          query.set('insightObservation', evidence.observationKey);
          query.set('insightAction', source === 'chapter-review' ? 'try-revision' : 'focus');
        });
        return;
      }

      /* If the richer canvas resolver cannot establish an editable range, recover
         from the frozen reading itself before falling back to synthesized sectionIds.
         This keeps a Work-on-this handoff tied to the observation MAIA actually
         cited instead of whichever generic section happened to sort first. */
      const frozen = await fetchReading(context.manuscriptId, evidence.readingId);
      if (frozen.ok) {
        const observation = frozen.payload.reading.observations.find(
          (candidate) => candidate.key === evidence.observationKey,
        );
        const citedSection = observation?.evidenceRefs
          .flatMap((ref) => sectionIdsOf(ref))
          .find(Boolean);
        if (citedSection) {
          updateQuery((query) => {
            query.set('mode', 'write');
            query.set(SECTION_PARAM, citedSection);
            query.set('developField', 'overview');
            query.set('attentionItem', itemId);
            query.set('insightReading', evidence.readingId);
            query.set('insightObservation', evidence.observationKey);
            if (source === 'chapter-review') query.set('insightAction', 'choose-revision-passage');
            else query.delete('insightAction');
          });
          return;
        }
      }
    }

    /* A revision request may not silently invent a passage. When the frozen
       observation names only a section we hand passage choice to the writer;
       if even that section cannot be established, the revision stops here. */
    if (source === 'chapter-review') {
      setChapterReviewError(
        'This observation does not identify one exact editable passage yet. Choose the wording you want to revise, or open the passage in Write first.',
      );
      return;
    }

    /* Other Work-on-this actions may still orient to an evidenced section and
       leave exact passage choice to the writer. */
    openAttentionSection(itemId, sectionId);
  }, [attentionMap, chapterReview, chapterMinimalPath, context, openAttentionSection, updateQuery]);

  const sectionScope = useMemo<Extract<DevelopScopeChoice, { kind: 'section' }> | null>(() => {
    if (!currentSection) return null;
    return {
      kind: 'section',
      sectionId: currentSection.draftSectionId,
      label: sectionLabel(currentSection),
    };
  }, [currentSection]);

  const chapterScope = useMemo<Extract<DevelopScopeChoice, { kind: 'chapter' }> | null>(() => {
    if (!currentChapter?.sections.length) return null;
    return {
      kind: 'chapter',
      label: currentChapter.root.heading?.trim() || 'Current chapter',
      fromSectionId: currentChapter.sections[0]!.draftSectionId,
      toSectionId: currentChapter.sections[currentChapter.sections.length - 1]!.draftSectionId,
    };
  }, [currentChapter]);

  if (phase !== 'ready' || !context) {
    return (
      <main className="fr-root" data-p4r1-develop-phase={phase}>
        <div style={{ padding: 32 }}>
          {phase === 'loading' ? 'Opening Develop…' : null}
          {phase === 'unauthorized' ? 'Sign in to open Develop.' : null}
          {phase === 'error' ? (message ?? 'Develop could not be opened.') : null}
        </div>
      </main>
    );
  }

  return (
    <P4R1DevelopView
      manuscriptId={context.manuscriptId}
      work={work}
      workTitle={workTitle}
      appearance={appearance}
      field={field}
      intent={intent}
      sections={context.sections}
      currentSectionId={currentSectionId}
      summaries={summaries}
      summariesLoading={summariesLoading}
      reading={projectedReading}
      readingLoading={readingLoading}
      readingError={readingError ?? listError}
      observationTargets={observationTargets}
      observationWorkTargets={observationWorkTargets}
      prep={prep}
      prepError={prepError}
      preparing={preparing}
      commissioning={commissioning}
      commissionError={commissionError}
      attentionMap={attentionMap}
      attentionBusy={attentionBusy}
      attentionError={attentionError}
      attentionProgress={attentionProgress}
      selectedAttentionItemId={selectedAttentionItemId}
      chapterReview={chapterReview}
      chapterReviewBusy={chapterReviewBusy}
      chapterNeedsCheckpoint={chapterNeedsCheckpoint}
      chapterReviewError={chapterReviewError}
      chapterReviewProgress={chapterReviewProgress}
      chapterScorecard={chapterScorecard}
      previousChapterScorecard={previousChapterScorecard}
      previousChapterScoreRevision={previousChapterScoreRevision}
      chapterScoreBusy={chapterScoreBusy}
      chapterScoreError={chapterScoreError}
      chapterMinimalPath={chapterMinimalPath}
      chapterMinimalPathBusy={chapterMinimalPathBusy}
      chapterMinimalPathError={chapterMinimalPathError}
      chapterBookFit={chapterBookFit}
      chapterBookFitBusy={chapterBookFitBusy}
      chapterBookFitError={chapterBookFitError}
      chapterMovement={chapterMovement}
      chapterMovementBusy={chapterMovementBusy}
      chapterMovementError={chapterMovementError}
      writerUnderstanding={writerUnderstanding}
      writerUnderstandingBusy={writerUnderstandingBusy}
      writerUnderstandingError={writerUnderstandingError}
      developmentalOrientation={developmentalOrientation}
      developmentalOrientationBusy={developmentalOrientationBusy}
      developmentalOrientationError={developmentalOrientationError}
      selectedDevelopmentalMovementId={selectedDevelopmentalMovementId}
      lineageOrientation={lineageOrientation}
      lineageBusy={lineageBusy}
      lineageError={lineageError}
      chapterLineage={chapterLineage}
      chapterLineageBusy={chapterLineageBusy}
      chapterLineageError={chapterLineageError}
      selectedLineageCandidateId={selectedLineageCandidateId}
      scope={scope}
      sectionScope={sectionScope}
      chapterScope={chapterScope}
      themes={themes}
      themeBusy={themeBusy}
      themeError={themeError}
      onField={onField}
      onIntent={onIntent}
      onMode={onMode}
      onSection={onSection}
      onReading={onReading}
      onScope={setScope}
      onCommission={() => void commission()}
      onReadChapter={() => void readCurrentChapter()}
      onCheckpointAndReadChapter={() => void checkpointCurrentChapterAndRead()}
      onReadChapterInBook={() => void readChapterInBook()}
      onReadChapterMovement={() => void readChapterMovement()}
      onScoreChapter={() => void scoreCurrentChapter()}
      onMinimalPathChapter={() => void minimalPathCurrentChapter()}
      onCommissionAttentionMap={() => void commissionAttentionMap()}
      onShowAttentionItem={openAttentionSection}
      onWorkWithAttentionItem={workWithAttentionItem}
      onDiscussAttentionItem={discussAttentionItem}
      onSaveWriterUnderstanding={(draft) => void saveUnderstanding(draft)}
      onReflectDevelopmentalProcess={() => void reflectDevelopmentalProcess()}
      onDevelopmentalMovement={onDevelopmentalMovement}
      onScanLineage={() => void orientLineage()}
      onInvestigateChapterLineage={(chapterRootId) => void investigateChapterLineage(chapterRootId)}
      onSelectLineageCandidate={selectLineageCandidate}
      onShowLineageCandidate={showLineageCandidate}
      onPrepare={() => void prepare()}
      onGoToObservation={onGoToObservation}
      onWorkWithObservation={onWorkWithObservation}
      onThemeMutation={(mutation) => void onThemeMutation(mutation)}
    />
  );
}
