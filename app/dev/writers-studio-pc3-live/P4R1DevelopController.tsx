'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
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
import { beginDraft } from '@/app/press/manuscript/workingDraftClient';
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
      query.set(SECTION_PARAM, sectionId);
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
    const key = `writers-studio:attention-map:${context.manuscriptId}`;
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

  const commissionAttentionMap = useCallback(async () => {
    if (!context || attentionBusy) return;
    if (context.draftRevision === null) {
      setAttentionError('The current working-draft revision could not be established, so MAIA did not begin a whole-manuscript review.');
      return;
    }
    if (prep?.kind !== 'ready') {
      setAttentionError('Prepare this Work for Develop before asking MAIA to review the whole manuscript.');
      return;
    }
    setAttentionBusy(true);
    setAttentionError(null);
    setAttentionProgress('Beginning whole-manuscript review…');
    try {
      const bundle = await runWholeManuscriptReview(
        context.manuscriptId,
        (done, total, lens) => setAttentionProgress(
          done >= total ? 'Eight readings complete. Synthesizing…'
            : `Reading ${done + 1} of ${total}: ${lens}…`,
        ),
        {
          revisionNumber: context.draftRevision,
          sectionIds: context.sections.map((section) => section.draftSectionId),
        },
      );
      await loadSummaries();
      if (bundle.failures.length > 0 || bundle.remaining.length > 0 || bundle.readingIds.length !== 8) {
        setAttentionError('The eight-lens review did not complete, so MAIA did not synthesize an Attention Map. Completed readings remain available.');
        return;
      }
      setAttentionProgress('Synthesizing macro → micro attention…');
      const synthesized = await requestAttentionMap(
        context.manuscriptId,
        bundle.readingIds,
        'Review this whole manuscript from macro to micro. Show me where my attention would have the most leverage, from Begin here through Next, Later, and Watch. Ground every placement in the frozen observations.',
      );
      if (!synthesized.ok) {
        setAttentionError('The readings completed, but the Attention Map could not be synthesized. The frozen readings remain available.');
        return;
      }
      setAttentionMap(synthesized.map);
      if (typeof window !== 'undefined') {
        const key = `writers-studio:attention-map:${context.manuscriptId}`;
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

  const workWithAttentionItem = useCallback(async (itemId: string, sectionId: string) => {
    const item = attentionMap?.items.find((candidate) => candidate.id === itemId);
    if (!item || !context) return;

    /* C11R2 — use the same verifier that Write/Focus uses. A model-visible
       passage ref is not sufficient: it must still resolve CURRENT, VERIFIED,
       EDITABLE and BODY-ADDRESSABLE against the present manuscript. */
    for (const evidence of item.evidence) {
      const insight = await loadCanvasInsight(
        context.manuscriptId,
        evidence.readingId,
        evidence.observationKey,
      );
      const passage = insight?.passages.find(
        (candidate) => candidate.verified && candidate.editable && candidate.range,
      );
      if (!passage?.range) continue;

      updateQuery((query) => {
        query.set('mode', 'write');
        query.set(SECTION_PARAM, passage.sectionId);
        query.set('developField', 'overview');
        query.set('attentionItem', itemId);
        query.set('insightReading', evidence.readingId);
        query.set('insightObservation', evidence.observationKey);
        query.set('insightAction', 'focus');
      });
      return;
    }

    /* No cited observation can lawfully become an editable locus. Orient to an
       evidenced section and leave passage selection to the writer. */
    openAttentionSection(itemId, sectionId);
  }, [attentionMap, context, openAttentionSection, updateQuery]);

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
