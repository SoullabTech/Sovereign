'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useAtmosphere } from '@/app/writers-studio/atmosphere/StudioAtmosphere';
import { apiFetch } from '@/lib/http/apiBase';
import { useLivingWorks } from '@/app/writers-studio/useLivingWorks';
import { useCurrentManuscript } from '@/app/writers-studio/useCurrentManuscript';
import { useMarkedLines } from '@/app/writers-studio/useMarkedLines';
import { useStudioHistory } from '@/app/writers-studio/useStudioHistory';
import { useSectionActivity } from '@/app/writers-studio/useSectionActivity';
import { arrivalFor, manuscriptIdOf } from '@/app/writers-studio/homeState';
import { IMPORT_HREF } from '@/app/writers-studio/studioMap';
import { HOUSE_WORK_PARAM, resolveHouseArrival } from '@/app/writers-studio/houseArrival';
import P4R1HomeView from './P4R1HomeView';

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

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* HOUSE → STUDIO — the Work the member pointed at in the House (houseArrival.ts).
     Resolved only against the member's own Works; opens only a single declared
     manuscript, never a guessed one. `replace`, so Back returns to the House. */
  const houseArrival = useMemo(
    () => resolveHouseArrival(params?.get(HOUSE_WORK_PARAM), worksPhase, works),
    [params, worksPhase, works],
  );
  const houseArrivalActed = useRef(false);
  useEffect(() => {
    if (houseArrival.kind !== 'open' || houseArrivalActed.current) return;
    houseArrivalActed.current = true;
    const next = new URLSearchParams(params?.toString() ?? '');
    next.delete(HOUSE_WORK_PARAM);
    next.set('mode', 'write');
    next.set('m', houseArrival.manuscriptId);
    router.replace(pathname + '?' + next.toString());
  }, [houseArrival, params, pathname, router]);

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

  const onMode = useCallback((mode: 'home' | 'write' | 'develop' | 'review') => {
    if (mode === 'home') return;
    const manuscriptId = resumeManuscriptId ?? manuscripts[0]?.id ?? null;
    if (!manuscriptId) return;
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
  }, [resumeManuscriptId, manuscripts, params, pathname, router]);

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

  if (houseArrival.kind === 'open') {
    return <main className="fr-root"><div style={{ padding: 32 }}>Opening your Work…</div></main>;
  }

  if (worksPhase === 'loading' || manuscriptPhase === 'loading') {
    return <main className="fr-root"><div style={{ padding: 32 }}>Opening Writer’s Studio…</div></main>;
  }

  if (worksPhase === 'unauthorized' || manuscriptPhase === 'unauthorized') {
    return <main className="fr-root"><div style={{ padding: 32 }}>Sign in to open your Writer’s Studio.</div></main>;
  }

  return (
    <P4R1HomeView
      appearance={appearance}
      arrival={arrival}
      works={works}
      manuscripts={manuscripts}
      resumeActivity={resumeActivity}
      markedLines={markedLines}
      historyActs={historyActs}
      busy={busy}
      error={error}
      onMode={onMode}
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
