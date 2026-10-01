'use client';

import { useCallback, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useAtmosphere } from '@/app/writers-studio/atmosphere/StudioAtmosphere';
import { apiFetch } from '@/lib/http/apiBase';
import { useLivingWorks } from '@/app/writers-studio/useLivingWorks';
import { useCurrentManuscript } from '@/app/writers-studio/useCurrentManuscript';
import { useMarkedLines } from '@/app/writers-studio/useMarkedLines';
import { useStudioHistory } from '@/app/writers-studio/useStudioHistory';
import { useSectionActivity } from '@/app/writers-studio/useSectionActivity';
import { arrivalFor, manuscriptIdOf, modeEntryTarget } from '@/app/writers-studio/homeState';
import { IMPORT_HREF } from '@/app/writers-studio/studioMap';
import P4R1HomeView from './P4R1HomeView';
import P4R1WorkArrival from './P4R1WorkArrival';
import { Shell } from '@/app/writers-studio/full-redesign/Shell';
import { HOME_GEOMETRY } from '@/app/writers-studio/full-redesign/tokens';
import {
  FROM_HOUSE,
  resolveStudioArrival,
  resolveStudioHomeReturnWork,
} from '@/app/writers-studio/situatedWork';
import { useHouseStudioH1WorkClaim } from '@/app/writers-studio/useHouseStudioH1WorkClaim';
import { h1AdmissionNeeded, resolveH1Arrival, withoutStudioWork } from '@/app/writers-studio/h1Arrival';

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

  const { phase: worksPhase, works, reload: reloadWorks } = useLivingWorks();
  const { phase: manuscriptPhase, manuscripts, reload: reloadManuscripts } = useCurrentManuscript();
  const { lines: markedLines } = useMarkedLines();
  const { acts: historyActs } = useStudioHistory();

  const arrival = useMemo(() => arrivalFor(works, manuscripts), [works, manuscripts]);
  const resumeManuscriptId = arrival.resume ? manuscriptIdOf(arrival.resume) : null;
  const resumeActivity = useSectionActivity(resumeManuscriptId);
  const returnManuscriptId = params?.get('m') ?? null;
  const returnActivity = useSectionActivity(returnManuscriptId);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const post = useCallback(async (url: string, body?: unknown) => {
    const response = await apiFetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body ?? {}),
    });
    if (!response.ok) throw new Error(url + ':' + response.status);
    return await response.json().catch(() => ({})) as Record<string, unknown>;
  }, []);

  const declare = useCallback(async (workId: string, manuscriptId: string) => {
    await post('/api/sovereign/living-works/' + workId + '/expressions', {
      expressionType: 'manuscript',
      expressionId: manuscriptId,
    });
  }, [post]);

  const refresh = useCallback(async () => {
    await Promise.all([reloadWorks(), reloadManuscripts()]);
  }, [reloadWorks, reloadManuscripts]);

  const open = useCallback((manuscriptId: string, sectionId?: string) => {
    const next = new URLSearchParams(params?.toString() ?? '');
    next.set('mode', 'write');
    next.set('m', manuscriptId);
    next.delete('developField');
    next.delete('r');
    next.delete('reviewRun');
    next.delete('reviewFinding');
    if (sectionId) next.set('s', sectionId);
    else next.delete('s');
    router.push(pathname + '?' + next.toString());
  }, [params, pathname, router]);

  /* H1-R2 — a mode request with no Work carried. A single manuscript (in the
     Continue Work, or in the whole Studio when there is none) is a place to go;
     several are the member's choice, scoped to the Continue Work when known.
     ⛔ Never `manuscripts[0]`: the list is recency-ordered. Nothing is stored. */
  const [pendingMode, setPendingMode] = useState<{
    mode: 'write' | 'develop' | 'review';
    manuscriptIds: string[];
  } | null>(null);

  const navigateMode = useCallback((mode: 'write' | 'develop' | 'review', manuscriptId: string) => {
    const next = new URLSearchParams(params?.toString() ?? '');
    next.set('mode', mode);
    next.set('m', manuscriptId);
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

  const onMode = useCallback((mode: 'home' | 'write' | 'develop' | 'review') => {
    if (mode === 'home') {
      setPendingMode(null);
      return;
    }
    const target = modeEntryTarget(arrival.resume ?? null, manuscripts);
    if (target.kind === 'open') {
      setPendingMode(null);
      navigateMode(mode, target.manuscriptId);
      return;
    }
    setPendingMode(target.kind === 'choose' ? { mode, manuscriptIds: target.manuscriptIds } : null);
  }, [arrival.resume, manuscripts, navigateMode]);

  const onChooseManuscript = useCallback((mode: 'write' | 'develop' | 'review', manuscriptId: string) => {
    setPendingMode(null);
    navigateMode(mode, manuscriptId);
  }, [navigateMode]);

  const onBegin = useCallback(async (title: string) => {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const workId = idFrom(await post('/api/sovereign/living-works', title.trim() ? { title: title.trim() } : {}));
      if (!workId) throw new Error('work id');
      const manuscriptId = idFrom(await post('/api/sovereign/manuscripts/blank'));
      if (!manuscriptId) throw new Error('manuscript id');
      await declare(workId, manuscriptId);
      await refresh();
      open(manuscriptId);
    } catch {
      setError('Could not begin your Work just now. Anything already created remains intact.');
    } finally {
      setBusy(false);
    }
  }, [busy, post, declare, refresh, open]);

  const onStartWriting = useCallback(async (workId: string) => {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      /* C7 — begin a writing expression for an EXISTING Work. The blank
         manuscript route owns blank-writing creation; the declaration route
         owns Work membership. No material is copied, read, or promoted. */
      const manuscriptId = idFrom(await post('/api/sovereign/manuscripts/blank'));
      if (!manuscriptId) throw new Error('manuscript id');
      await declare(workId, manuscriptId);
      await refresh();
      open(manuscriptId);
    } catch {
      setError('Could not begin writing for this Work just now. The Work and everything feeding it remain unchanged.');
    } finally {
      setBusy(false);
    }
  }, [busy, post, declare, refresh, open]);

  const onMakeWork = useCallback(async (manuscriptId: string, title: string | null) => {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const workId = idFrom(await post('/api/sovereign/living-works', title?.trim() ? { title: title.trim() } : {}));
      if (!workId) throw new Error('work id');
      await declare(workId, manuscriptId);
      await refresh();
    } catch {
      setError('That writing could not be placed in a new Work just now. The writing itself has not changed.');
    } finally {
      setBusy(false);
    }
  }, [busy, post, declare, refresh]);

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

  if (arrivedFromHouse && studioArrival.kind !== 'fallback') {
    const withoutWork = () => {
      const query = withoutStudioWork(params?.toString() ?? '');
      router.push(pathname + (query ? '?' + query : ''));
    };
    // A mode change from the arrival never guesses: only a single declared
    // manuscript is a place to go without asking.
    const onArrivalMode = (mode: 'home' | 'write' | 'develop' | 'review') => {
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
      pendingMode={pendingMode}
      onMode={onMode}
      onChooseManuscript={onChooseManuscript}
      onBegin={(title) => void onBegin(title)}
      onOpen={open}
      onMakeWork={(manuscriptId, title) => void onMakeWork(manuscriptId, title)}
      onAddToWork={(manuscriptId, workId) => void onAddToWork(manuscriptId, workId)}
      onStartWriting={(workId) => void onStartWriting(workId)}
      onImport={() => window.location.assign(IMPORT_HREF)}
      onSources={() => router.push('/writers-studio/sources')}
    />
  );
}
