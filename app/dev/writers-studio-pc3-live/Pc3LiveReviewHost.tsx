'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
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
import { currentWork, resolveWorkContext } from '@/app/writers-studio/workContext';
import { hostFactsFrom } from '@/app/writers-studio/rebuild/liveReview';
import { loadChapterReviewManifestById } from '@/lib/writersStudio/rebuild/chapterReviewManifest';
import { rehydrateChapterReview, runChapterReview } from '@/lib/writersStudio/rebuild/chapterReview';
import { saveChapterReviewManifest } from '@/lib/writersStudio/rebuild/chapterReviewManifest';
import { chapterSpanFor } from '@/lib/writersStudio/rebuild/model';
import { SECTION_PARAM } from '@/lib/writersStudio/placeInWork';
import { checkpointServerDraft, newIdempotencyKey } from '@/app/press/manuscript/workingDraftClient';
import { mapWholeReview, REVIEW_DEVELOPMENTAL_LENSES } from '@/lib/writersStudio/studio/wholeReview';
import type { DurableObservationTruth } from '@/lib/writersStudio/studio/realReview';
import type { RebuildSection } from '@/lib/writersStudio/rebuild/model';import {
  commissionReviewDiscuss, REVIEW_DISCUSS_COPY,
  type ReviewDiscussionState,
} from '@/lib/writersStudio/rebuild/reviewDiscuss';
import { readCurrentSanctuaryPosture } from '@/lib/sanctuary/currentClientPosture';

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
  const pathname = usePathname() ?? '/dev/writers-studio-pc3-live';
  const manuscriptId = params?.get('m') ?? null;
  const requestedSectionId = params?.get(SECTION_PARAM) ?? null;
  const reviewRunId = params?.get('reviewRun') ?? null;
  const requestedFindingId = params?.get('reviewFinding') ?? null;
  const appearance = params?.get('appearance') === 'night' ? 'evening' : 'day';
  const { phase: worksPhase, works } = useLivingWorks();

  const [phase, setPhase] = useState<ReviewPhase>('loading');
  const [context, setContext] = useState<ContextReady | null>(null);
  const [review, setReview] = useState<ReadyReview | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [filter, setFilter] = useState('All');
  const [tab, setTab] = useState('Overview');
  const [selectedFindingId, setSelectedFindingId] = useState<string | null>(requestedFindingId);
  const [discussion, setDiscussion] = useState<ReviewDiscussionState | null>(null);
  const [rereadBusy, setRereadBusy] = useState(false);
  const [rereadNeedsCheckpoint, setRereadNeedsCheckpoint] = useState(false);
  const [rereadProgress, setRereadProgress] = useState<string | null>(null);
  const [rereadError, setRereadError] = useState<string | null>(null);
  const discussGen = useRef(0);

  const workContext = context
    ? resolveWorkContext(worksPhase, works, context.manuscriptId)
    : { kind: 'unknown' as const };
  const work = currentWork(workContext);
  const visual = useWorkVisual(work?.id ?? null);
  const reviewChapter = useMemo(() => {
    if (!context?.sections.length) return null;
    const sectionId = requestedSectionId
      && context.sections.some((section) => section.draftSectionId === requestedSectionId)
      ? requestedSectionId
      : context.sections[0]!.draftSectionId;
    return chapterSpanFor(context.sections, sectionId);
  }, [context, requestedSectionId]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setPhase('loading');
      setReview(null);
      setMessage(null);
      setDiscussion(null);
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
        setContext(body);        if (!reviewRunId) {
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
          currentRevision: body.draftRevision ?? -1,
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
  }, [manuscriptId, reviewRunId, requestedFindingId, work?.title, work?.form]);

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
        undefined,
        REVIEW_DEVELOPMENTAL_LENSES,
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
      if (typeof window !== 'undefined') {
        const q = new URLSearchParams(window.location.search);
        q.set('mode', 'review');
        q.set(SECTION_PARAM, reviewChapter.root.draftSectionId);
        q.set('reviewRun', kept.run.id);
        q.delete('reviewFinding');
        window.location.assign(pathname + '?' + q.toString());
      }
    } finally {
      setRereadBusy(false);
      setRereadProgress(null);
    }
  }, [context, reviewChapter, rereadBusy, pathname]);

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

  const goWrite = useCallback((sectionId?: string) => {
    if (typeof window === 'undefined') return;
    const q = new URLSearchParams(window.location.search);
    q.set('mode', 'write');
    q.delete('reviewRun');
    q.delete('reviewFinding');
    if (sectionId) q.set('s', sectionId);
    window.location.assign(pathname + '?' + q.toString());
  }, [pathname]);

  const openFinding = useCallback((finding: Pc3LiveReviewFinding) => {
    if (!review || typeof window === 'undefined') return;
    setSelectedFindingId(finding.id);
    const q = new URLSearchParams(window.location.search);
    q.set('mode', 'write');
    q.set('s', finding.sectionId);
    q.set('reviewRun', review.runId);
    q.set('reviewFinding', finding.id);
    q.delete('insightReading');
    q.delete('insightObservation');
    q.delete('insightAction');
    window.location.assign(pathname + '?' + q.toString());
  }, [pathname, review]);

  const workWithFinding = useCallback((finding: Pc3LiveReviewFinding) => {
    if (!review || typeof window === 'undefined') return;
    const truth = review.durable[finding.id];
    if (!truth) return;
    const exact = truth.evidenceRefs.find((ref) =>
      ref.kind === 'passage' && ref.sectionId === finding.sectionId);
    if (!exact) return;

    setSelectedFindingId(finding.id);
    const q = new URLSearchParams(window.location.search);
    q.set('mode', 'write');
    q.set('s', finding.sectionId);
    q.set('reviewRun', review.runId);
    q.set('reviewFinding', finding.id);
    q.set('insightReading', truth.address.readingId);
    q.set('insightObservation', truth.address.observationKey);
    q.set('insightAction', 'focus');
    window.location.assign(pathname + '?' + q.toString());
  }, [pathname, review]);

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
  }, [context, review]);  const data = useMemo(() => {
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

  if (phase === 'idle' && context && reviewChapter) {
    return (
      <main className="fr-root" data-pc3-review-phase="idle">
        <section className="fr-card p4r1-review-reread" data-review-reread>
          <span className="p4r1-eyebrow">Review</span>
          <h2>How does the chapter hold now?</h2>
          <p>
            MAIA can reread this revised chapter as a reader and editor. She’ll look for what improved,
            what stayed strong, what still needs attention, and whether a change introduced a new tradeoff.
          </p>
          <p className="p4r1-review-reread-boundary">
            Review does not change your writing. It reads the current saved chapter and keeps this Review as a new frozen reference point.
          </p>
          {rereadNeedsCheckpoint ? (
            <>
              <p className="p4r1-review-reread-boundary">
                This chapter has changed since its last saved reading state. Save the current draft so MAIA rereads exactly what is here now. Your words will not change.
              </p>
              <button type="button" disabled={rereadBusy} onClick={() => void checkpointAndReread()}>
                {rereadBusy ? (rereadProgress ?? 'Saving the current draft…') : 'Save current draft & reread'}
              </button>
            </>
          ) : (
            <button type="button" disabled={rereadBusy} onClick={() => void rereadChapter()}>
              {rereadBusy ? (rereadProgress ?? 'MAIA is rereading the chapter…') : 'Reread this chapter'}
            </button>
          )}
          {rereadError ? <p className="p4r1-error" role="status">{rereadError}</p> : null}
        </section>
      </main>
    );
  }

  if (phase !== 'ready' || !review || !context || !data) {
    const copy = phase === 'loading' ? 'Opening this Review…'
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
      onSelectMode={(mode) => { if (mode === 'write') goWrite(review.rootId); }}
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
        <LiveMaiaReview
          data={data}
          selectedFinding={selectedFinding}
          discussion={discussion}
          onSubmit={submitDiscussion}
          onClose={closeDiscussion}
        />
      }
      maiaAbove={<span className="fr-matters">Your work matters. ✦</span>}
      footer={<span>A deeper you. A more human world.</span>}
    />
  );
}
