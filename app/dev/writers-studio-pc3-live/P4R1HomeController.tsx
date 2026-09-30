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
import P4R1HomeView from './P4R1HomeView';
import P4R1WorkIntake from './P4R1WorkIntake';
import {
  WORK_INTAKE_PARAM,
  intakeInputFrom,
  requestedWorkIdFrom,
  resolveWorkIntake,
} from '@/app/writers-studio/workIntake';

/* H1-R1 D-01…D-03 — a refused Work says nothing about whether it exists. */
const INTAKE_REFUSED_LINE = 'That Work isn’t available here. Your Studio is below.';

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

  /* H1-R1 — a Work chosen at the House threshold. Resolved before Home's own
     "Continue" pick can substitute a different Work: explicit present intention
     outranks inferred continuity. Derived every render, stored nowhere. */
  const requestedWorkId = requestedWorkIdFrom(params);
  const intake = useMemo(() => resolveWorkIntake(intakeInputFrom({
    worksPhase,
    manuscriptPhase,
    works,
    manuscripts,
    requestedWorkId,
  })), [worksPhase, manuscriptPhase, works, manuscripts, requestedWorkId]);

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

  const navigateToManuscript = useCallback((manuscriptId: string, sectionId: string | undefined, replace: boolean) => {
    const next = new URLSearchParams(params?.toString() ?? '');
    // The House choice has been honoured once the writing opens; it is not carried further.
    next.delete(WORK_INTAKE_PARAM);
    next.set('mode', 'write');
    next.set('m', manuscriptId);
    next.delete('developField');
    next.delete('r');
    next.delete('reviewRun');
    next.delete('reviewFinding');
    if (sectionId) next.set('s', sectionId);
    else next.delete('s');
    const href = pathname + '?' + next.toString();
    if (replace) router.replace(href);
    else router.push(href);
  }, [params, pathname, router]);

  const open = useCallback((manuscriptId: string, sectionId?: string) => {
    navigateToManuscript(manuscriptId, sectionId, false);
  }, [navigateToManuscript]);

  /* Exactly one piece of writing → open it without asking twice (HS-F7).
     `replace`, so Back returns to the House rather than to this hand-off. */
  const intakeOpened = useRef<string | null>(null);
  useEffect(() => {
    if (intake.kind !== 'open') return;
    if (intakeOpened.current === intake.manuscriptId) return;
    intakeOpened.current = intake.manuscriptId;
    navigateToManuscript(intake.manuscriptId, undefined, true);
  }, [intake, navigateToManuscript]);

  const leaveIntake = useCallback(() => {
    const next = new URLSearchParams(params?.toString() ?? '');
    next.delete(WORK_INTAKE_PARAM);
    const query = next.toString();
    router.replace(query ? pathname + '?' + query : pathname);
  }, [params, pathname, router]);

  const onMode = useCallback((mode: 'home' | 'write' | 'develop' | 'review') => {
    if (mode === 'home') return;
    const manuscriptId = resumeManuscriptId ?? manuscripts[0]?.id ?? null;
    if (!manuscriptId) return;
    const next = new URLSearchParams(params?.toString() ?? '');
    next.delete(WORK_INTAKE_PARAM);
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

  const onStartWriting = useCallback(async (workId: string, openAfter = true) => {
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
      /* Inside an H1-R1 Work intake the refreshed declarations resolve to
         exactly one manuscript and the intake opens it — opening here too
         would navigate twice. */
      if (openAfter) open(manuscriptId);
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

  if (worksPhase === 'loading' || manuscriptPhase === 'loading') {
    return <main className="fr-root"><div style={{ padding: 32 }}>Opening Writer’s Studio…</div></main>;
  }

  if (worksPhase === 'unauthorized' || manuscriptPhase === 'unauthorized') {
    return <main className="fr-root"><div style={{ padding: 32 }}>Sign in to open your Writer’s Studio.</div></main>;
  }

  if (intake.kind === 'open') {
    return <main className="fr-root"><div style={{ padding: 32 }}>Opening your Work…</div></main>;
  }

  if (intake.kind === 'choose' || intake.kind === 'no-writing') {
    const work = works.find((w) => w.id === intake.workId) ?? null;
    return (
      <P4R1WorkIntake
        workTitle={work?.title ?? null}
        manuscripts={intake.kind === 'choose'
          ? intake.manuscriptIds.map((id) => ({ id, title: manuscripts.find((m) => m.id === id)?.title ?? null }))
          : []}
        busy={busy}
        error={error}
        onOpen={(manuscriptId) => open(manuscriptId)}
        onBeginManuscript={() => void onStartWriting(intake.workId, false)}
        onStudioHome={leaveIntake}
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
      markedLines={markedLines}
      historyActs={historyActs}
      busy={busy}
      error={error ?? (intake.kind === 'refused' ? INTAKE_REFUSED_LINE : null)}
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
