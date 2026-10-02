'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useAtmosphere } from '@/app/writers-studio/atmosphere/StudioAtmosphere';
import { apiFetch } from '@/lib/http/apiBase';
import { Shell } from '@/app/writers-studio/full-redesign/Shell';
import {
  LiveMaiaReview, LiveReviewChapter, LiveReviewRail,
  type Pc3LiveReviewFinding,
} from '@/app/writers-studio/full-redesign/LiveReviewRoom';
import { projectPc3LiveReview } from '@/app/writers-studio/full-redesign/liveReviewAdapter';
import { STATE_GEOMETRY } from '@/app/writers-studio/full-redesign/tokens';
import { useLivingWorks } from '@/app/writers-studio/useLivingWorks';
import { useWorkVisual } from '@/app/writers-studio/useWorkVisual';
import { currentWork } from '@/app/writers-studio/workContext';
import { resolveSituatedWorkContext, studioHomeReturnSearch } from '@/app/writers-studio/situatedWork';
import { useHouseStudioH1WorkClaim } from '@/app/writers-studio/useHouseStudioH1WorkClaim';
import { h1AdmissionNeeded, resolveH1Arrival } from '@/app/writers-studio/h1Arrival';
import { hostFactsFrom } from '@/app/writers-studio/rebuild/liveReview';
import { listChapterReviewManifests, loadChapterReviewManifestById, saveChapterReviewManifest, type ChapterReviewManifest } from '@/lib/writersStudio/rebuild/chapterReviewManifest';
import { rehydrateChapterReview, runChapterReview } from '@/lib/writersStudio/rebuild/chapterReview';
import { requestDevelopmentalReading } from '@/lib/writersStudio/developClient';
import { requestAttentionMap } from '@/lib/writersStudio/attentionMapClient';
import type { WholeManuscriptAttentionMap } from '@/lib/writersStudio/studio/attentionMap';
import { mapWholeReview } from '@/lib/writersStudio/studio/wholeReview';
import type { DurableObservationTruth } from '@/lib/writersStudio/studio/realReview';
import { chapterSpanFor, type RebuildSection } from '@/lib/writersStudio/rebuild/model';
import {
  commissionReviewDiscuss, REVIEW_DISCUSS_COPY,
  type ReviewDiscussionState,
} from '@/lib/writersStudio/rebuild/reviewDiscuss';
import { readCurrentSanctuaryPosture } from '@/lib/sanctuary/currentClientPosture';
import { relationshipIdFrom } from '@/app/writers-studio/canvasIdentity';
import { readA2Relationship, type A2RelationshipSummary } from '@/lib/writersStudio/rebuild/relationshipOrchestration';
import { readRelationshipReturnClient } from '@/lib/writersStudio/rebuild/returnStateClient';
import WorkConversation from '@/app/writers-studio/canvas/WorkConversation';
import { checkpointServerDraft, newIdempotencyKey } from '@/app/press/manuscript/workingDraftClient';

interface ContextReady {
  state: 'section_aware';
  manuscriptId: string;
  title: string | null;
  version: number;
  draftRevision: number | null;
  updatedAt: string;
  sections: RebuildSection[];
}
type ContextPayload =
  | ContextReady
  | { state: 'no_draft' | 'continuous'; manuscriptId: string; title: string | null };
type ReviewPhase = 'loading' | 'idle' | 'ready' | 'unavailable' | 'unauthorized' | 'error';

type ReadyReview = {
  runId: string;
  rootId: string;
  view: ReturnType<typeof mapWholeReview> extends infer T
    ? T extends { kind: 'ready'; view: infer V } ? V : never
    : never;
  durable: Readonly<Record<string, DurableObservationTruth>>;
};export default function Pc3LiveReviewHost() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname() ?? '/dev/writers-studio-p4r1';
  const manuscriptId = params?.get('m') ?? null;
  const reviewRunId = params?.get('reviewRun') ?? null;
  const requestedFindingId = params?.get('reviewFinding') ?? null;
  const requestedSectionId = params?.get('s') ?? null;
  const requestedRelationship = params ? relationshipIdFrom(params) : null;
  const { id: appearance } = useAtmosphere();
  const { phase: worksPhase, works } = useLivingWorks();
  // H1 · R2: the seam produces the arrival; the hook only supplies the admission fact.
  const h1 = useHouseStudioH1WorkClaim(h1AdmissionNeeded(params));
  const { workId: carriedWorkId } = resolveH1Arrival(params, h1);

  const [phase, setPhase] = useState<ReviewPhase>('loading');
  const [context, setContext] = useState<ContextReady | null>(null);
  const [review, setReview] = useState<ReadyReview | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [filter, setFilter] = useState('All');
  const [tab, setTab] = useState('Overview');
  const [selectedFindingId, setSelectedFindingId] = useState<string | null>(requestedFindingId);
  const [discussion, setDiscussion] = useState<ReviewDiscussionState | null>(null);
  const [workTalking, setWorkTalking] = useState(false);
  const [availableRuns, setAvailableRuns] = useState<ChapterReviewManifest[]>([]);
  const [availableRootId, setAvailableRootId] = useState<string | null>(null);
  const [quickReview, setQuickReview] = useState<WholeManuscriptAttentionMap | null>(null);
  const [quickReviewBusy, setQuickReviewBusy] = useState(false);
  const [quickReviewNeedsCheckpoint, setQuickReviewNeedsCheckpoint] = useState(false);
  const [quickReviewError, setQuickReviewError] = useState<string | null>(null);
  const [rereadBusy, setRereadBusy] = useState(false);
  const [rereadNeedsCheckpoint, setRereadNeedsCheckpoint] = useState(false);
  const [rereadProgress, setRereadProgress] = useState<string | null>(null);
  const [rereadError, setRereadError] = useState<string | null>(null);
  const [a2Relationship, setA2Relationship] = useState<A2RelationshipSummary | null>(null);
  const discussGen = useRef(0);

  const workContext = context
    // HOUSE-STUDIO-CIRCULATION-01R1: a carried Work is honoured only while it validates.
    ? resolveSituatedWorkContext(
      worksPhase, works, context.manuscriptId, carriedWorkId,
    )
    : { kind: 'unknown' as const };
  const work = currentWork(workContext);
  const visual = useWorkVisual(work?.id ?? null);
  const reviewChapter = useMemo(() => {
    if (!context?.sections.length) return null;
    const sectionId = requestedSectionId
      && context.sections.some((section) => section.draftSectionId === requestedSectionId)
      ? requestedSectionId
      : availableRootId
        && context.sections.some((section) => section.draftSectionId === availableRootId)
        ? availableRootId
        : context.sections[0]!.draftSectionId;
    return chapterSpanFor(context.sections, sectionId);
  }, [context, requestedSectionId, availableRootId]);

  useEffect(() => {
    if (!context || workContext.kind !== 'work' || !work) {
      setA2Relationship(null);
      return;
    }

    let cancelled = false;
    void (async () => {
      let relationshipId = requestedRelationship;
      if (!relationshipId) {
        const saved = await readRelationshipReturnClient({
          livingWorkId: work.id,
          manuscriptId: context.manuscriptId,
        });
        if (cancelled) return;
        relationshipId = saved.ok ? saved.relationshipId : null;
      }
      if (!relationshipId) {
        setA2Relationship(null);
        return;
      }
      const read = await readA2Relationship(relationshipId);
      if (cancelled) return;
      if (
        !read.ok
        || read.relationship.livingWorkId !== work.id
        || read.relationship.manuscriptId !== context.manuscriptId
      ) {
        setA2Relationship(null);
        return;
      }
      setA2Relationship(read.relationship);
    })();

    return () => { cancelled = true; };
  }, [context, requestedRelationship, work, workContext.kind]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setPhase('loading');
      setReview(null);
      setMessage(null);
      setDiscussion(null);
      setWorkTalking(false);
      discussGen.current += 1;
      if (!manuscriptId) {
        setPhase('error');
        setMessage('Open Review with a specific manuscript.');
        return;
      }
      try {
        const contextRes = await apiFetch(
          '/api/writers-studio/rebuild/context?manuscriptId=' + encodeURIComponent(manuscriptId),
        );
        if (cancelled) return;
        if (contextRes.status === 401) {
          setPhase('unauthorized');
          return;
        }
        if (!contextRes.ok) throw new Error('context');
        const body = await contextRes.json() as ContextPayload;
        if (body.state !== 'section_aware') {
          setPhase('error');
          setMessage('This manuscript is not section-addressable yet. Review will not guess at its structure.');
          return;
        }
        setContext(body);
        if (!reviewRunId) {
          const requested = requestedSectionId
            ? body.sections.find((section) => section.draftSectionId === requestedSectionId) ?? null
            : null;
          const focus = requested ?? body.sections[0] ?? null;
          const span = focus ? chapterSpanFor(body.sections, focus.draftSectionId) : null;
          const rootId = span?.root.draftSectionId ?? focus?.draftSectionId ?? null;
          setAvailableRootId(rootId);

          const listed = await listChapterReviewManifests(body.manuscriptId);
          if (cancelled) return;
          setAvailableRuns(listed.ok ? listed.runs : []);
          setPhase('idle');
          return;
        }
        const loaded = await loadChapterReviewManifestById(body.manuscriptId, reviewRunId);
        if (cancelled) return;
        if (!loaded.ok || !loaded.run || loaded.run.id !== reviewRunId) {
          setPhase('unavailable');
          return;
        }
        const root = body.sections.find((section) =>
          section.draftSectionId === loaded.run!.chapterRootSectionId);
        if (!root) {
          setPhase('unavailable');
          return;
        }
        const restored = await rehydrateChapterReview(body.manuscriptId, loaded.run);
        if (cancelled) return;
        if (!restored.ok) {
          setPhase('unavailable');
          return;
        }
        const host = hostFactsFrom({
          manuscriptId: body.manuscriptId,
          workTitle: work?.title ?? body.title,
          workKind: work?.form ?? null,
          sections: body.sections,
          focusId: root.draftSectionId,
        });        const mapped = mapWholeReview({
          manifest: loaded.run,
          payloads: restored.bundle.payloads,
          host,
          currentRevision: body.version,
        });
        if (cancelled) return;
        if (mapped.kind !== 'ready') {
          setPhase('unavailable');
          return;
        }
        const selected = requestedFindingId
          && mapped.view.findings.some((finding) => finding.id === requestedFindingId)
          ? requestedFindingId : null;
        setSelectedFindingId(selected);
        setReview({
          runId: reviewRunId,
          rootId: root.draftSectionId,
          view: selected ? { ...mapped.view, selectedFindingId: selected } : mapped.view,
          durable: mapped.durable,
        });
        setFilter('All');
        setTab('Overview');
        setPhase('ready');
      } catch {
        if (!cancelled) {
          setPhase('error');
          setMessage('This Review could not be opened just now. Nothing about your Work has changed.');
        }
      }
    };
    void load();
    return () => { cancelled = true; };
  }, [manuscriptId, reviewRunId, requestedFindingId, requestedSectionId, work?.title, work?.form]);

  const performQuickReread = useCallback(async () => {
    if (!context || !reviewChapter?.sections.length || quickReviewBusy) return;
    setQuickReviewBusy(true);
    setQuickReviewNeedsCheckpoint(false);
    setQuickReviewError(null);
    try {
      const ids = reviewChapter.sections.map((section) => section.draftSectionId);
      const commissioned = await requestDevelopmentalReading(
        context.manuscriptId,
        'overview',
        { kind: 'range', fromSectionId: ids[0]!, toSectionId: ids[ids.length - 1]! },
      );
      if (!commissioned.ok) {
        if (commissioned.stage === 'capture' && commissioned.refusal === 'revision_not_current') {
          setQuickReviewNeedsCheckpoint(true);
          return;
        }
        setQuickReviewError('MAIA could not reread the chapter just now. Nothing in the writing changed.');
        return;
      }
      const synthesis = await requestAttentionMap(
        context.manuscriptId,
        [commissioned.readingId],
        [
          'Give the writer a quick reread of this chapter after revision.',
          'This is a light editorial check, not a full Review. Do not imply that all developmental lenses were run.',
          'Return exactly four evidenced items using begin-here, next, later, watch.',
          'begin-here: What is working now — start with one specific strength worth protecting.',
          'next: What feels clearer or more settled now — only if the current text establishes it; otherwise say what holds together now.',
          'later: What still catches — the most useful remaining friction.',
          'watch: Where I would look next — one manageable next move, or say the chapter can rest if nothing meaningful needs attention.',
          'Be conversational and concise. Do not rewrite the prose. Keep any reader-effect language hypothetical.',
        ].join('\n'),
      );
      if (!synthesis.ok) {
        setQuickReviewError('MAIA reread the chapter but could not gather the quick review just now.');
        return;
      }
      setQuickReview(synthesis.map);
    } finally {
      setQuickReviewBusy(false);
    }
  }, [context, reviewChapter, quickReviewBusy]);

  const checkpointAndQuickReread = useCallback(async () => {
    if (!context || quickReviewBusy) return;
    setQuickReviewBusy(true);
    setQuickReviewError(null);
    const kept = await checkpointServerDraft(apiFetch, context.manuscriptId, {
      baseRevisionId: context.version,
      idempotencyKey: newIdempotencyKey(),
    });
    if (kept.kind !== 'ok' || kept.revisionCount === null) {
      setQuickReviewBusy(false);
      setQuickReviewError(
        kept.kind === 'conflict'
          ? 'The draft moved while MAIA was preparing to reread it. Reload, then try again.'
          : 'The current draft could not be saved for rereading just now. Your writing is unchanged.',
      );
      return;
    }
    setContext((previous) => previous ? {
      ...previous,
      version: kept.revisionId ?? previous.version,
      draftRevision: kept.revisionCount,
    } : previous);
    setQuickReviewNeedsCheckpoint(false);
    setQuickReviewBusy(false);
    await performQuickReread();
  }, [context, quickReviewBusy, performQuickReread]);

  const performReread = useCallback(async (draftRevision: number) => {
    if (!context || !reviewChapter?.sections.length || rereadBusy) return;
    setRereadBusy(true);
    setRereadNeedsCheckpoint(false);
    setRereadError(null);
    setRereadProgress('MAIA is rereading the chapter…');
    try {
      const bundle = await runChapterReview(
        context.manuscriptId,
        reviewChapter.sections,
        (done, total, lens) => setRereadProgress(
          done >= total ? 'MAIA has finished rereading. Preparing Review…'
            : `Reading ${done + 1} of ${total}: ${lens}…`,
        ),
      );
      if (bundle.readingIds.length === 0) {
        const stale = bundle.failures.some((failure) => failure.refusal === 'revision_not_current');
        if (stale) {
          setRereadNeedsCheckpoint(true);
          setRereadProgress(null);
          return;
        }
        setRereadError('MAIA could not complete a new chapter Review just now. Nothing in the writing changed.');
        return;
      }
      const kept = await saveChapterReviewManifest(context.manuscriptId, {
        chapterRootSectionId: reviewChapter.root.draftSectionId,
        sectionIds: reviewChapter.sections.map((section) => section.draftSectionId),
        draftRevision,
        readingIds: bundle.readingIds,
        failures: bundle.failures,
      });
      if (!kept.ok) {
        setRereadError('MAIA finished the readings, but the new Review could not be kept as one set. Nothing in the writing changed.');
        return;
      }
      const next = new URLSearchParams(params?.toString() ?? '');
      next.set('mode', 'review');
      next.set('s', reviewChapter.root.draftSectionId);
      next.set('reviewRun', kept.run.id);
      next.delete('reviewFinding');
      router.push(`${pathname}?${next.toString()}`);
    } finally {
      setRereadBusy(false);
      setRereadProgress(null);
    }
  }, [context, reviewChapter, rereadBusy, params, pathname, router]);

  const rereadChapter = useCallback(async () => {
    if (!context || rereadBusy) return;
    if (context.draftRevision === null) {
      setRereadNeedsCheckpoint(true);
      setRereadError(null);
      return;
    }
    await performReread(context.draftRevision);
  }, [context, rereadBusy, performReread]);

  const checkpointAndReread = useCallback(async () => {
    if (!context || rereadBusy) return;
    setRereadBusy(true);
    setRereadError(null);
    setRereadProgress('Saving the current draft for this Review…');
    const kept = await checkpointServerDraft(apiFetch, context.manuscriptId, {
      baseRevisionId: context.version,
      idempotencyKey: newIdempotencyKey(),
    });
    if (kept.kind !== 'ok' || kept.revisionCount === null) {
      setRereadBusy(false);
      setRereadProgress(null);
      setRereadError(
        kept.kind === 'conflict'
          ? 'The draft moved while Review was preparing. Reload the chapter, then try again.'
          : 'The current draft could not be saved for Review just now. Your writing is unchanged.',
      );
      return;
    }
    const draftRevision = kept.revisionCount;
    setContext((previous) => previous ? {
      ...previous,
      version: kept.revisionId ?? previous.version,
      draftRevision,
    } : previous);
    setRereadNeedsCheckpoint(false);
    setRereadBusy(false);
    await performReread(draftRevision);
  }, [context, rereadBusy, performReread]);

  const openAvailableReview = useCallback((run: ChapterReviewManifest) => {
    const next = new URLSearchParams(params?.toString() ?? '');
    next.set('mode', 'review');
    next.set('reviewRun', run.id);
    next.set('s', run.chapterRootSectionId);
    next.delete('reviewFinding');
    router.push(`${pathname}?${next.toString()}`);
  }, [params, pathname, router]);

  const goMode = useCallback((mode: 'home' | 'write' | 'develop' | 'review', sectionId?: string) => {
    if (mode === 'home') {
      const query = studioHomeReturnSearch(params?.toString() ?? '');
      router.push(`${pathname}${query ? `?${query}` : ''}`);
      return;
    }
    const next = new URLSearchParams(params?.toString() ?? '');
    next.set('mode', mode);
    if (sectionId) next.set('s', sectionId);
    if (mode !== 'review') {
      next.delete('reviewRun');
      next.delete('reviewFinding');
    }
    if (mode !== 'develop') {
      next.delete('developField');
      next.delete('r');
    }
    router.push(`${pathname}?${next.toString()}`);
  }, [params, pathname, router]);

  const goWrite = useCallback((sectionId?: string) => {
    goMode('write', sectionId);
  }, [goMode]);

  const openFinding = useCallback((finding: Pc3LiveReviewFinding) => {
    if (!review) return;
    setSelectedFindingId(finding.id);
    const next = new URLSearchParams(params?.toString() ?? '');
    next.set('mode', 'write');
    next.set('s', finding.sectionId);
    next.set('reviewRun', review.runId);
    next.set('reviewFinding', finding.id);
    next.delete('insightReading');
    next.delete('insightObservation');
    next.delete('insightAction');
    router.push(`${pathname}?${next.toString()}`);
  }, [params, pathname, review, router]);

  const workWithFinding = useCallback((finding: Pc3LiveReviewFinding) => {
    if (!review) return;
    const truth = review.durable[finding.id];
    if (!truth) return;
    const exact = truth.evidenceRefs.find((ref) =>
      ref.kind === 'passage' && ref.sectionId === finding.sectionId);
    if (!exact) return;

    setSelectedFindingId(finding.id);
    const next = new URLSearchParams(params?.toString() ?? '');
    next.set('mode', 'write');
    next.set('s', finding.sectionId);
    next.set('reviewRun', review.runId);
    next.set('reviewFinding', finding.id);
    next.set('insightReading', truth.address.readingId);
    next.set('insightObservation', truth.address.observationKey);
    next.set('insightAction', 'focus');
    router.push(`${pathname}?${next.toString()}`);
  }, [params, pathname, review, router]);

  const discussFinding = useCallback((finding: Pc3LiveReviewFinding) => {
    setSelectedFindingId(finding.id);
    setDiscussion({ kind: 'composing', findingId: finding.id });
  }, []);

  const closeDiscussion = useCallback(() => {
    discussGen.current += 1;
    setDiscussion(null);
  }, []);  const submitDiscussion = useCallback((findingId: string, text: string) => {
    if (!review || !context || !text.trim()) return;
    const truth = review.durable[findingId];
    if (!truth) return;
    const ask = text.trim();
    const gen = ++discussGen.current;
    setDiscussion({ kind: 'pending', findingId, ask, gen });
    void commissionReviewDiscuss({
      manuscriptId: context.manuscriptId,
      readingId: truth.address.readingId,
      observationKey: truth.address.observationKey,
      question: ask,
      ...(a2Relationship ? { relationshipId: a2Relationship.id } : {}),
    }, readCurrentSanctuaryPosture()).then((outcome) => {
      if (gen !== discussGen.current) return;
      if (outcome.ok) {
        setDiscussion({
          kind: 'answered', findingId, ask, reply: outcome.reply,
          threadId: outcome.threadId, posture: outcome.posture,
        });
        return;
      }
      const copy = outcome.reason === 'posture_unresolved' ? REVIEW_DISCUSS_COPY.posture
        : outcome.reason === 'sanctuary_unavailable' ? REVIEW_DISCUSS_COPY.sanctuary
          : REVIEW_DISCUSS_COPY.failed;
      setDiscussion({ kind: 'refused', findingId, ask, copy });
    });
  }, [context, review, a2Relationship]);

  const data = useMemo(() => {
    if (!review || !context) return null;
    const view = selectedFindingId
      && review.view.findings.some((finding) => finding.id === selectedFindingId)
      ? { ...review.view, selectedFindingId }
      : review.view;
    const projected = projectPc3LiveReview({
      view,
      sections: context.sections,
      chapterRootSectionId: review.rootId,
      heroSrc: visual.src,
    });
    return {
      ...projected,
      findings: projected.findings.map((finding) => {
        const truth = review.durable[finding.id];
        const canWorkWith = Boolean(truth?.evidenceRefs.some((ref) =>
          ref.kind === 'passage' && ref.sectionId === finding.sectionId));
        return canWorkWith ? { ...finding, canWorkWith: true } : finding;
      }),
    };
  }, [review, context, selectedFindingId, visual.src]);

  if (phase === 'idle' && context) {
    const root = availableRootId
      ? context.sections.find((section) => section.draftSectionId === availableRootId) ?? null
      : null;
    return (
      <Shell
        mode="review"
        appearance={appearance}
        geometry={STATE_GEOMETRY['review-chapter']}
        workTitle={work?.title ?? context.title ?? undefined}
        memberInitial=""
        onSelectMode={(mode) => goMode(mode, availableRootId ?? undefined)}
        manuscript={
          <div className="fr-ms fr-ms-review">
            <div className="fr-work-id">
              <div>
                <b>{work?.title ?? context.title ?? 'This Work'}</b>
                <span>Manuscript</span>
              </div>
            </div>
            <div className="fr-part-group">
              <p className="fr-part-h"><b>Current place</b></p>
              <ol>
                <li className="fr-current">
                  <span className="fr-n">1</span>
                  {root?.heading?.trim() || 'Current section'}
                </li>
              </ol>
            </div>
          </div>
        }
        work={
          <div className="fr-rev p4r1-review-entry">
            <div className="fr-rev-head">
              <h1>Review <span className="fr-crumb">›</span> <em>{root?.heading?.trim() || 'Current place'}</em></h1>
            </div>
            <p className="fr-rev-sub">
              Review opens saved readings. Entering this room does not ask MAIA to read anything again.
            </p>
            <section className="fr-card p4r1-review-reread" data-review-reread>
              <span className="p4r1-eyebrow">After revision</span>
              <h2>How does the chapter hold now?</h2>
              <p>
                Start light. MAIA can reread the chapter once and tell you what is working now,
                what still catches, and where she would look next.
              </p>
              <p className="p4r1-review-reread-boundary">
                Nothing happens until you ask. Quick reread is not a full multi-lens Review and never changes your writing.
              </p>
              {quickReviewNeedsCheckpoint ? (
                <>
                  <p className="p4r1-review-reread-boundary">
                    This chapter has changed since its last saved reading state. Save the current draft so MAIA rereads exactly what is here now. Your words will not change.
                  </p>
                  <button type="button" disabled={quickReviewBusy} onClick={() => void checkpointAndQuickReread()}>
                    {quickReviewBusy ? 'Saving the current draft…' : 'Save current draft & quick reread'}
                  </button>
                </>
              ) : (
                <button type="button" disabled={quickReviewBusy} onClick={() => void performQuickReread()}>
                  {quickReviewBusy ? 'MAIA is rereading the chapter…' : 'Quick reread'}
                </button>
              )}
              {quickReviewError ? <p className="p4r1-error" role="status">{quickReviewError}</p> : null}
              {quickReview ? (
                <div className="p4r1-review-quick-result" data-review-quick-result>
                  {quickReview.items.map((item) => (
                    <article key={item.id}>
                      <b>{item.label}</b>
                      <p>{item.notice}</p>
                    </article>
                  ))}
                </div>
              ) : null}
              <details className="p4r1-review-deep">
                <summary>Deep Review</summary>
                <p className="p4r1-review-reread-boundary">
                  Run the full governed multi-lens Review when you want a durable chapter-level evidence set and deeper comparison.
                </p>
                {rereadNeedsCheckpoint ? (
                  <button type="button" disabled={rereadBusy} onClick={() => void checkpointAndReread()}>
                    {rereadBusy ? (rereadProgress ?? 'Saving the current draft…') : 'Save current draft & run deep Review'}
                  </button>
                ) : (
                  <button type="button" disabled={rereadBusy} onClick={() => void rereadChapter()}>
                    {rereadBusy ? (rereadProgress ?? 'MAIA is running the deep Review…') : 'Run deep Review'}
                  </button>
                )}
                {rereadError ? <p className="p4r1-error" role="status">{rereadError}</p> : null}
              </details>
            </section>
            <section className="fr-card p4r1-review-entry-card">
              <h3>Saved Reviews</h3>
              {availableRuns.length > 0 ? (
                <div className="p4r1-review-list">
                  {availableRuns.map((run) => {
                    const chapter = context.sections.find((section) =>
                      section.draftSectionId === run.chapterRootSectionId);
                    const current = run.chapterRootSectionId === availableRootId;
                    return (
                      <button
                        key={run.id}
                        type="button"
                        className="p4r1-review-run"
                        data-current-place={current ? 'true' : undefined}
                        onClick={() => openAvailableReview(run)}
                      >
                        <span>
                          <b>{chapter?.heading?.trim() || 'Saved Review'}</b>
                          {current ? <small>Current place</small> : null}
                        </span>
                        <span>{new Date(run.createdAt).toLocaleDateString()}</span>
                        <span>
                          {run.readingIds.length} completed
                          {run.failures.length ? ` · ${run.failures.length} refusal${run.failures.length === 1 ? '' : 's'} recorded` : ''}
                        </span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <p className="fr-obsb">
                  There are no saved Reviews for this manuscript yet. Nothing has been inferred in their place.
                </p>
              )}
            </section>
          </div>
        }
        maia={
          work && workTalking ? (
            <div className="fr-maia-inner p4r1-work-conversation" data-review-work-conversation>
              <div className="fr-maia-head fr-maia-head-lg">
                <div className="fr-orb fr-orb-lg" aria-hidden="true" />
                <div className="fr-maia-name"><h2>MAIA</h2><span>In relation to your Work</span></div>
              </div>
              <div className="fr-mbody">
                <WorkConversation
                  work={work}
                  manuscriptId={context.manuscriptId}
                  sectionId={availableRootId}
                  onClose={() => setWorkTalking(false)}
                />
              </div>
            </div>
          ) : (
            <div className="fr-maia-inner">
              <div className="fr-maia-head fr-maia-head-lg">
                <div className="fr-orb fr-orb-lg" aria-hidden="true" />
                <div className="fr-maia-name"><h2>MAIA</h2><span>In relation to Review</span></div>
              </div>
              <div className="fr-mbody">
                <div className="fr-say fr-say-rev">
                  <p>I’ll stay with what has already been read here. Opening Review does not commission a new reading.</p>
                </div>
                {work ? (
                  <button type="button" className="fr-open" data-action="talk-work" onClick={() => setWorkTalking(true)}>
                    Talk about the larger Work
                  </button>
                ) : null}
              </div>
              <div className="fr-foot">Review is a return to what was noticed, not an automatic reread.</div>
            </div>
          )
        }
      />
    );
  }

  if (phase !== 'ready' || !review || !context || !data) {
    const copy = phase === 'loading' ? 'Opening this Review…'
      : phase === 'idle' ? 'No saved Review is selected. Opening Review does not read your Work.'
        : phase === 'unauthorized' ? 'Sign in to open your Writer’s Studio.'
          : phase === 'unavailable' ? 'This Review is not available to show here. Nothing about your Work has changed.'
            : message ?? 'Review could not be opened.';
    return (
      <main className="fr-root" data-pc3-review-phase={phase}>
        <div style={{ padding: 32 }}>{copy}</div>
      </main>
    );
  }  const selectedFinding = data.findings.find((finding) =>
    finding.id === selectedFindingId) ?? null;

  return (
    <Shell
      mode="review"
      appearance={appearance}
      geometry={STATE_GEOMETRY['review-chapter']}
      workTitle={work?.title ?? context.title ?? undefined}
      memberInitial=""
      onSelectMode={(mode) => goMode(mode, review.rootId)}
      manuscript={<LiveReviewRail data={data} />}
      work={
        <LiveReviewChapter
          data={data}
          filter={filter}
          onFilter={setFilter}
          tab={tab}
          onTab={setTab}
          onBack={() => goWrite(review.rootId)}
          onOpenFinding={openFinding}
          onWorkWith={workWithFinding}
          onDiscuss={discussFinding}
        />
      }
      maia={
        work && workTalking ? (
          <div className="fr-maia-inner p4r1-work-conversation" data-review-work-conversation>
            <div className="fr-maia-head fr-maia-head-lg">
              <div className="fr-orb fr-orb-lg" aria-hidden="true" />
              <div className="fr-maia-name"><h2>MAIA</h2><span>In relation to your Work</span></div>
            </div>
            <div className="fr-mbody">
              <WorkConversation
                work={work}
                manuscriptId={context.manuscriptId}
                sectionId={selectedFinding?.sectionId ?? review.rootId}
                onClose={() => setWorkTalking(false)}
              />
            </div>
          </div>
        ) : (
          <LiveMaiaReview
            data={data}
            selectedFinding={selectedFinding}
            discussion={discussion}
            onSubmit={submitDiscussion}
            onClose={closeDiscussion}
            onTalkWork={work ? () => setWorkTalking(true) : undefined}
          />
        )
      }
      maiaAbove={<span className="fr-matters">Your work matters. ✦</span>}
      footer={<span>A deeper you. A more human world.</span>}
    />
  );
}
