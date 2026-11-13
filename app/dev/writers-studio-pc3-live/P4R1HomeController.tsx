'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import { freeWorkLimitFrom, workLimitMessageOr } from '@/lib/writersStudio/workLimitShared';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useAtmosphere } from '@/app/writers-studio/atmosphere/StudioAtmosphere';
import { apiFetch } from '@/lib/http/apiBase';
import { useLivingWorks } from '@/app/writers-studio/useLivingWorks';
import { useCurrentManuscript } from '@/app/writers-studio/useCurrentManuscript';
import { useMarkedLines } from '@/app/writers-studio/useMarkedLines';
import { useStudioHistory } from '@/app/writers-studio/useStudioHistory';
import { useSectionActivity } from '@/app/writers-studio/useSectionActivity';
import { arrivalFor, manuscriptIdOf, modeEntryTarget } from '@/app/writers-studio/homeState';
import P4R1HomeView from './P4R1HomeView';
import P4R1WorkArrival from './P4R1WorkArrival';
import P4R1ImportManuscript from './P4R1ImportManuscript';
import { Shell } from '@/app/writers-studio/full-redesign/Shell';
import { HOME_GEOMETRY } from '@/app/writers-studio/full-redesign/tokens';
import {
  FROM_HOUSE,
  resolveStudioArrival,
  resolveStudioHomeReturnWork,
} from '@/app/writers-studio/situatedWork';
import { useHouseStudioH1WorkClaim } from '@/app/writers-studio/useHouseStudioH1WorkClaim';
import { h1AdmissionNeeded, resolveH1Arrival, withoutStudioWork } from '@/app/writers-studio/h1Arrival';
import { useWriterReleaseCapabilities } from '@/lib/writersStudio/useWriterReleaseCapabilities';
import { reReadAll, runDeleteWork, runRemoveWork } from '@/lib/writersStudio/deleteWork';
import { readCurrentSanctuaryPosture } from '@/lib/sanctuary/currentClientPosture';
import { CARRY_COPY, shouldShowInspirationDoor } from '@/lib/writersStudio/inspirationOpening';
import StudioInspirationOpening from './StudioInspirationOpening';

function idFrom(payload: Record<string, unknown>): string | null {
  const direct = typeof payload.id === 'string' ? payload.id : null;
  const nested = payload.work && typeof payload.work === 'object'
    ? (payload.work as Record<string, unknown>).id
    : null;
  return direct ?? (typeof nested === 'string' ? nested : null);
}

export default function P4R1HomeController() {
  const router = useRouter();
  const pathname = usePathname() ?? '/dev/writers-studio-p4r1';
  const params = useSearchParams();
  const { id: appearance } = useAtmosphere();
  const importRequested = params?.get('import') === '1';
  // Presentation hint only. The server-side review route independently requires
  // a loopback host and WS_FOUNDER_LOCAL_REVIEW=1 on every request.
  const localReviewRequested = params?.get('localReview') === '1';
  const releaseCapabilities = useWriterReleaseCapabilities();

  const { phase: worksPhase, works, reload: reloadWorks } = useLivingWorks();
  const { phase: manuscriptPhase, manuscripts, reload: reloadManuscripts } = useCurrentManuscript();
  const { lines: markedLines } = useMarkedLines();
  const { acts: historyActs, reload: reloadHistory } = useStudioHistory();

  const arrival = useMemo(() => arrivalFor(works, manuscripts), [works, manuscripts]);
  const resumeManuscriptId = arrival.resume ? manuscriptIdOf(arrival.resume) : null;
  const resumeActivity = useSectionActivity(resumeManuscriptId);
  const returnManuscriptId = params?.get('m') ?? null;
  const publishRequested = params?.get('publish') === '1';
  const returnActivity = useSectionActivity(returnManuscriptId);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* F6 — "create a Work, then place writing in it" is two requests. If the
     second fails the Work already exists, empty. A retry of the SAME gesture
     reuses that Work instead of creating another. Keyed by the gesture (which
     writing, or which title), cleared when the gesture completes, and held only
     in this view: a reload forgets it. Nothing is stored or inferred. */
  const createdWorkForGesture = useRef(new Map<string, string>());

  const post = useCallback(async (url: string, body?: unknown) => {
    const response = await apiFetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body ?? {}),
    });
    if (!response.ok) throw (await freeWorkLimitFrom(response)) ?? new Error(url + ':' + response.status);
    return await response.json().catch(() => ({})) as Record<string, unknown>;
  }, []);

  const declare = useCallback(async (workId: string, manuscriptId: string) => {
    await post('/api/sovereign/living-works/' + workId + '/expressions', {
      expressionType: 'manuscript',
      expressionId: manuscriptId,
    });
  }, [post]);

  // One member gesture, one server transaction: the blank manuscript and its
  // Work declaration are born together. This is deliberately separate from
  // `declare`, which remains the explicit "Add existing writing to Work" act.
  const startWritingInWork = useCallback(async (workId: string) => {
    const manuscriptId = idFrom(await post(
      '/api/sovereign/living-works/' + workId + '/start-writing',
    ));
    if (!manuscriptId) throw new Error('manuscript id');
    return manuscriptId;
  }, [post]);

  /* JARVIS-WRITERS-STUDIO-INSPIRATION-OPENING-01 — a held spark reaches the Work ONLY through the existing member-act
     PATCH, with the exact words the writer chose to hold (sparkCommitPlan decided that, never this function). */
  const setPurpose = useCallback(async (workId: string, purpose: string) => {
    const response = await apiFetch('/api/sovereign/living-works/' + workId, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ purpose }),
    });
    if (!response.ok) throw new Error('purpose:' + response.status);
  }, []);

  // Resolves false when either list could not be read: the delete flow must not tell the member the page is current then.
  const refresh = useCallback(() => reReadAll([reloadWorks, reloadManuscripts, reloadHistory]), [reloadWorks, reloadManuscripts, reloadHistory]);

  const open = useCallback((manuscriptId: string, sectionId?: string, newImport = false) => {
    const search = params?.toString() ?? '';
    // A newly declared Work cannot inherit a different Work's arrival claim.
    const next = new URLSearchParams(newImport ? withoutStudioWork(search) : search);
    if (newImport) next.delete('from');
    next.set('mode', 'write');
    next.set('m', manuscriptId);
    next.delete('publish');
    // Import is a threshold, not durable room state. Once a manuscript opens,
    // Home must mean Studio Home rather than reopening the completed threshold.
    next.delete('import');
    next.delete('developField');
    next.delete('r');
    next.delete('reviewRun');
    next.delete('reviewFinding');
    if (sectionId) next.set('s', sectionId);
    else next.delete('s');
    router.push(pathname + '?' + next.toString());
  }, [params, pathname, router]);

  const openImport = useCallback(() => {
    const next = new URLSearchParams(withoutStudioWork(params?.toString() ?? ''));
    next.delete('from');
    next.set('mode', 'home');
    next.set('import', '1');
    next.delete('m');
    next.delete('s');
    next.delete('developField');
    next.delete('r');
    next.delete('reviewRun');
    next.delete('reviewFinding');
    router.push(pathname + '?' + next.toString());
  }, [params, pathname, router]);

  const closeImport = useCallback(() => {
    const next = new URLSearchParams(params?.toString() ?? '');
    next.set('mode', 'home');
    next.delete('import');
    next.delete('m');
    next.delete('s');
    router.push(pathname + (next.toString() ? '?' + next.toString() : ''));
  }, [params, pathname, router]);

  /* A spark held at the door and carried into "Bring what I've written". Held in this view only; a reload forgets it. */
  const pendingSpark = useRef<string | null>(null);
  const [sparkCarryFailed, setSparkCarryFailed] = useState<string | null>(null);
  /* C · Bring What You Carry (S4): the import asks MAIA's question before anyone reads a word. Optional, skippable. */
  const [carryStep, setCarryStep] = useState<'invite' | 'asking' | 'held' | 'not_held' | 'skipped'>('invite');

  const completeImport = useCallback(async (manuscriptId: string) => {
    // Refresh is useful for the real member path and harmless in the bounded
    // founder fixture. A transient list failure must not strand a successfully
    // created manuscript, so identity navigation remains the final authority.
    await refresh().catch(() => undefined);
    const spark = pendingSpark.current;
    if (spark !== null) {
      try {
        const listing = await apiFetch('/api/sovereign/living-works');
        const body = await listing.json().catch(() => null) as { works?: { id: string; expressions?: { expressionId: string }[] }[] } | null;
        const work = body?.works?.find((w) => (w.expressions ?? []).some((e) => e.expressionId === manuscriptId));
        if (!work) throw new Error('work for import');
        await setPurpose(work.id, spark);
        pendingSpark.current = null;
      } catch {
        // Told plainly, never silently dropped: the manuscript is saved; the spark is not yet.
        setSparkCarryFailed(manuscriptId);
        return;
      }
    }
    open(manuscriptId, undefined, true);
  }, [refresh, open, setPurpose]);

  /* H1-R2 — a mode request with no Work carried. A single manuscript (in the
     Continue Work, or in the whole Studio when there is none) is a place to go;
     several are the member's choice, scoped to the Continue Work when known.
     ⛔ Never `manuscripts[0]`: the list is recency-ordered. Nothing is stored. */
  const [pendingMode, setPendingMode] = useState<{
    mode: 'write' | 'develop' | 'review' | 'publish' | 'listen';
    manuscriptIds: string[];
  } | null>(null);

  const navigateMode = useCallback((mode: 'write' | 'develop' | 'review' | 'publish' | 'listen', manuscriptId: string) => {
    const next = new URLSearchParams(params?.toString() ?? '');
    next.set('mode', mode);
    next.set('m', manuscriptId);
    next.delete('publish');
    next.delete('import');
    if (mode !== 'develop') {
      next.delete('developField');
      next.delete('r');
    }
    if (mode !== 'review') {
      next.delete('reviewRun');
      next.delete('reviewFinding');
    }
    router.push(pathname + '?' + next.toString());
  }, [params, pathname, router]);

  const onMode = useCallback((mode: 'home' | 'write' | 'develop' | 'review' | 'publish' | 'listen') => {
    if (mode === 'home') {
      setPendingMode(null);
      if (publishRequested) {
        const next = new URLSearchParams(params?.toString() ?? '');
        next.delete('publish');
        router.push(pathname + (next.size ? '?' + next.toString() : ''));
      }
      return;
    }
    const target = modeEntryTarget(arrival.resume ?? null, manuscripts);
    if (target.kind === 'open') {
      setPendingMode(null);
      navigateMode(mode, target.manuscriptId);
      return;
    }
    setPendingMode(target.kind === 'choose' ? { mode, manuscriptIds: target.manuscriptIds } : null);
  }, [arrival.resume, manuscripts, navigateMode, params, pathname, publishRequested, router]);

  const onChooseManuscript = useCallback((mode: 'write' | 'develop' | 'review' | 'publish' | 'listen', manuscriptId: string) => {
    setPendingMode(null);
    navigateMode(mode, manuscriptId);
  }, [navigateMode]);

  const onBegin = useCallback(async (title: string, spark: string | null = null) => {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const gesture = 'begin:' + title.trim() + (spark !== null ? ':spark' : '');
      const workId = createdWorkForGesture.current.get(gesture)
        ?? idFrom(await post('/api/sovereign/living-works', title.trim() ? { title: title.trim() } : {}));
      if (!workId) throw new Error('work id');
      createdWorkForGesture.current.set(gesture, workId);
      if (spark !== null) await setPurpose(workId, spark);
      const manuscriptId = await startWritingInWork(workId);
      createdWorkForGesture.current.delete(gesture);
      await refresh();
      open(manuscriptId);
    } catch (e) {
      setError(workLimitMessageOr(e, 'Could not begin your Work just now. Anything already created remains intact.'));
    } finally {
      setBusy(false);
    }
  }, [busy, post, setPurpose, startWritingInWork, refresh, open]);

  /* "I don't know yet — let me look around" with a held spark: the Work is begun (unnamed) so the spark the writer chose
     to hold has somewhere to live. Without a held spark nothing is created (HomeView sets the door aside instead). */
  const onDoorLookWithSpark = useCallback(async (purpose: string) => {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const gesture = 'door-look';
      const workId = createdWorkForGesture.current.get(gesture) ?? idFrom(await post('/api/sovereign/living-works', {}));
      if (!workId) throw new Error('work id');
      createdWorkForGesture.current.set(gesture, workId);
      await setPurpose(workId, purpose);
      createdWorkForGesture.current.delete(gesture);
      await refresh();
    } catch (e) {
      setError(workLimitMessageOr(e, 'Your spark could not be kept just now. Anything already created remains intact. Try again.'));
    } finally {
      setBusy(false);
    }
  }, [busy, post, setPurpose, refresh]);

  const onStartWriting = useCallback(async (workId: string) => {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      /* C7 — begin a writing expression for an EXISTING Work. The Work-scoped
         server transaction owns both the blank writing place and declaration.
         No material is copied, read, or promoted. */
      const manuscriptId = await startWritingInWork(workId);
      await refresh();
      open(manuscriptId);
    } catch (e) {
      setError(workLimitMessageOr(e, 'Could not begin writing for this Work just now. The Work and everything feeding it remain unchanged.'));
    } finally {
      setBusy(false);
    }
  }, [busy, startWritingInWork, refresh, open]);

  const onMakeWork = useCallback(async (manuscriptId: string, title: string | null) => {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const gesture = 'make:' + manuscriptId;
      const workId = createdWorkForGesture.current.get(gesture)
        ?? idFrom(await post('/api/sovereign/living-works', title?.trim() ? { title: title.trim() } : {}));
      if (!workId) throw new Error('work id');
      createdWorkForGesture.current.set(gesture, workId);
      await declare(workId, manuscriptId);
      createdWorkForGesture.current.delete(gesture);
      await refresh();
    } catch (e) {
      setError(workLimitMessageOr(e, 'That writing could not be placed in a new Work just now. The writing itself has not changed.'));
    } finally {
      setBusy(false);
    }
  }, [busy, post, declare, refresh]);

  // The author's own permanent deletion of one writing, through the product's governed erase. No optimistic success: the member is
  // told only what the server said. The page is re-read BEFORE any outcome is reported (a delete, "removed, custody not yet
  // confirmed", a refusal, an outcome that could not be learned), and the outcome goes to the PAGE, not to the card that asked,
  // because that re-read may already have removed the card. What the server said is mapped to what the page does in runDeleteWork
  // (lib/writersStudio/deleteWork.ts), where it is tested at runtime.
  const onDeleteWriting = useCallback(
    (manuscriptId: string) => runDeleteWork({ workId: null, manuscriptId }, (url, init) => apiFetch(url, init), refresh),
    [refresh],
  );

  // A Work is deleted with its manuscript in ONE server-side erase (WS-DELETE-01); a Work with no manuscript is withdrawn. The
  // request names the Work, so a stale card is refused server-side.
  const onDeleteWork = useCallback(
    (workId: string, manuscriptId: string | null) => runDeleteWork({ workId, manuscriptId }, (url, init) => apiFetch(url, init), refresh),
    [refresh],
  );

  // The container-only act: remove one Work, leave its writing(s) where they are. Offered only from the shared-writing refusal and
  // for a Work that holds several writings, where the member is told exactly what goes and what stays.
  const onRemoveWork = useCallback(
    (workId: string) => runRemoveWork(workId, (url, init) => apiFetch(url, init), refresh),
    [refresh],
  );

  const onAddToWork = useCallback(async (manuscriptId: string, workId: string) => {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      await declare(workId, manuscriptId);
      await refresh();
    } catch {
      setError('That writing could not be added to the Work just now. The writing itself has not changed.');
    } finally {
      setBusy(false);
    }
  }, [busy, declare, refresh]);

  /* HOUSE-STUDIO-CIRCULATION-01R1 · H1-3 — explicit Work > member choice >
     fallback. With a Work carried, the recency pick above is never consulted. */
  // H1 · R2: the seam produces the arrival; the hook only supplies the admission fact.
  // `pending` is presentation timing ("Opening…"), not authority: workId is already null.
  const h1 = useHouseStudioH1WorkClaim(h1AdmissionNeeded(params));
  const { workId: carriedWorkId, pending: h1AdmissionChecking } = resolveH1Arrival(params, h1);
  const studioArrival = resolveStudioArrival(
    worksPhase, works, manuscriptPhase, manuscripts, carriedWorkId,
  );
  const arrivedFromHouse = params?.get('from') === FROM_HOUSE;
  const returningInsideStudio = params?.get('mode') === 'home' && Boolean(returnManuscriptId) && !arrivedFromHouse;
  const returnWork = returningInsideStudio
    ? resolveStudioHomeReturnWork(worksPhase, works, returnManuscriptId, carriedWorkId)
    : null;

  if (h1AdmissionChecking || worksPhase === 'loading' || manuscriptPhase === 'loading' || studioArrival.kind === 'unknown') {
    return <main className="fr-root"><div style={{ padding: 32 }}>Opening Writer’s Studio…</div></main>;
  }

  if (worksPhase === 'unauthorized' || manuscriptPhase === 'unauthorized') {
    return <main className="fr-root"><div style={{ padding: 32 }}>Sign in to open your Writer’s Studio.</div></main>;
  }

  if (importRequested) {
    return (
      <Shell
        mode="home"
        appearance={appearance}
        geometry={HOME_GEOMETRY}
        memberInitial=""
        onSelectMode={onMode}
        work={
          <>
            {pendingSpark.current !== null || carryStep === 'held' ? (
              <p className="wsio-note wsio-carry-note" data-carry-held>{CARRY_COPY.held}</p>
            ) : carryStep === 'invite' ? (
              <section className="wsio-carry-invite" data-carry-invite>
                <p className="wsio-maia wsio-small">{CARRY_COPY.invite}</p>
                <p className="wsio-note">{CARRY_COPY.inviteHint}</p>
                <div className="wsio-row">
                  <button type="button" className="fr-home-quiet" onClick={() => setCarryStep('asking')}>Tell MAIA first</button>
                  <button type="button" className="wsio-link" onClick={() => setCarryStep('skipped')}>Skip</button>
                </div>
              </section>
            ) : carryStep === 'asking' ? (
              <StudioInspirationOpening
                variant="carry"
                busy={busy}
                error={null}
                onCarry={(purpose) => {
                  pendingSpark.current = purpose;
                  setCarryStep(purpose !== null ? 'held' : 'not_held');
                }}
              />
            ) : carryStep === 'not_held' ? (
              <p className="wsio-note wsio-carry-note">{CARRY_COPY.notHeld}</p>
            ) : null}
            <P4R1ImportManuscript
              localReview={localReviewRequested}
              sourceIntakeReleased={releaseCapabilities.authority.sourceIntakeReleased}
              onCancel={closeImport}
              onComplete={completeImport}
            />
          </>
        }
        footer={sparkCarryFailed ? (
          <div className="p4r1-error" role="alert" data-spark-carry-failed>
            <p>Your manuscript is saved. The spark you chose to hold could not be added to its Work just now.</p>
            <div className="wsio-row">
              <button type="button" className="fr-home-primary" onClick={() => { const id = sparkCarryFailed; setSparkCarryFailed(null); void completeImport(id); }}>Try again</button>
              <button type="button" className="fr-home-quiet" onClick={() => { const id = sparkCarryFailed; pendingSpark.current = null; setSparkCarryFailed(null); open(id, undefined, true); }}>Open my manuscript without it</button>
            </div>
          </div>
        ) : undefined}
      />
    );
  }

  const ordinaryNow = () => {
    const read = readCurrentSanctuaryPosture();
    return read.resolved && !read.sanctuary;
  };
  const inspirationDoor = worksPhase === 'ready'
    && (manuscriptPhase === 'ready' || manuscriptPhase === 'none')
    && shouldShowInspirationDoor({ works: works.length, manuscripts: manuscripts.length });

  if (arrivedFromHouse && studioArrival.kind !== 'fallback') {
    const withoutWork = () => {
      const query = withoutStudioWork(params?.toString() ?? '');
      router.push(pathname + (query ? '?' + query : ''));
    };
    // A mode change from the arrival never guesses: only a single declared
    // manuscript is a place to go without asking.
    const onArrivalMode = (mode: 'home' | 'write' | 'develop' | 'review' | 'publish' | 'listen') => {
      if (mode === 'home' || studioArrival.kind !== 'one') return;
      const next = new URLSearchParams(params?.toString() ?? '');
      next.set('mode', mode);
      next.set('m', studioArrival.manuscript.id);
      router.push(pathname + '?' + next.toString());
    };
    return (
      <Shell
        mode="home"
        appearance={appearance}
        geometry={HOME_GEOMETRY}
        memberInitial=""
        onSelectMode={onArrivalMode}
        work={
          <P4R1WorkArrival
            arrival={studioArrival}
            busy={busy}
            error={error}
            onOpen={(id) => open(id)}
            onBegin={(workId) => void onStartWriting(workId)}
            onReturn={() => (arrivedFromHouse ? router.push('/home') : withoutWork())}
            onStudioHome={withoutWork}
          />
        }
      />
    );
  }

  return (
    <P4R1HomeView
      appearance={appearance}
      arrival={arrival}
      works={works}
      manuscripts={manuscripts}
      resumeActivity={resumeActivity}
      returnWork={returnWork}
      returnActivity={returnActivity}
      markedLines={markedLines}
      historyActs={historyActs}
      busy={busy}
      error={error}
      publishRequested={publishRequested}
      pendingMode={pendingMode}
      onMode={onMode}
      onChooseManuscript={onChooseManuscript}
      onBegin={(title) => void onBegin(title)}
      onOpen={open}
      onMakeWork={(manuscriptId, title) => void onMakeWork(manuscriptId, title)}
      onAddToWork={(manuscriptId, workId) => void onAddToWork(manuscriptId, workId)}
      onDeleteWriting={onDeleteWriting}
      onDeleteWork={onDeleteWork}
      onRemoveWork={onRemoveWork}
      onStartWriting={(workId) => void onStartWriting(workId)}
      onImport={openImport}
      inspirationDoor={inspirationDoor}
      onDoorBegin={(destination, purpose) => {
        if (destination === 'write') { void onBegin('', purpose); return; }
        pendingSpark.current = purpose;
        openImport();
      }}
      onDoorLookWithSpark={(purpose) => void onDoorLookWithSpark(purpose)}
      // Q3: the one-line spark on a later new Work is kept only in a readable Ordinary session, never in Sanctuary.
      onBeginWithSpark={(title, spark) => void onBegin(title, ordinaryNow() ? spark : null)}
      onSources={() => router.push('/writers-studio/sources')}
    />
  );
}
