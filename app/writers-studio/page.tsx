'use client';

import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/http/apiBase';
import { CANVAS_HREF } from './studioMap';
import { canvasForManuscript } from './canvasIdentity';
import { useCurrentManuscript } from './useCurrentManuscript';
import { useLivingWorks } from './useLivingWorks';
import HomeView from './HomeView';

/**
 * Writer's Studio — Home. Wiring only.
 *
 * The experience lives in HomeView, a pure function of the writer's own
 * facts. This file supplies those facts and performs the acts that mutate.
 *
 * ── Why "begin" is more than one call ─────────────────────────────────────
 * The first version created a living_work and pushed the writer to the bare
 * Canvas. The Canvas, finding no manuscript, answered "Nothing is on the
 * table yet." So a first-time writer pressed "Begin a new work" and arrived
 * somewhere they could not write — a button naming an outcome it did not
 * produce, the exact defect this room was rebuilt to end.
 *
 * Beginning a work therefore means all of: the work exists · somewhere to
 * write exists · the two are declared to belong together · and the writer
 * lands in THAT manuscript by identity. Anything less is a false door.
 */
export default function WritersStudioHome() {
  const router = useRouter();
  const { phase: worksPhase, works, reload: reloadWorks } = useLivingWorks();
  const { phase: msPhase, manuscripts, reload: reloadManuscripts } = useCurrentManuscript();

  const post = async (url: string, body?: unknown) => {
    const res = await apiFetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body ?? {}),
    });
    if (!res.ok) throw new Error(`${url} ${res.status}`);
    return (await res.json().catch(() => ({}))) as Record<string, unknown>;
  };

  const idFrom = (payload: Record<string, unknown>): string | null => {
    const direct = typeof payload.id === 'string' ? payload.id : null;
    const nested =
      payload.work && typeof payload.work === 'object'
        ? ((payload.work as Record<string, unknown>).id as string | undefined)
        : undefined;
    return direct ?? (typeof nested === 'string' ? nested : null);
  };

  /** Declares a manuscript as an expression of a work. */
  const declare = (workId: string, manuscriptId: string) =>
    post(`/api/sovereign/living-works/${workId}/expressions`, {
      expressionType: 'manuscript',
      expressionId: manuscriptId,
    });

  const refresh = () => Promise.all([reloadWorks(), reloadManuscripts()]);

  const onBegin = async (title: string) => {
    const workId = idFrom(await post('/api/sovereign/living-works', title ? { title } : {}));
    if (!workId) throw new Error('living-works returned no id');

    /* Partial-failure honesty: if the manuscript or the belonging fails, the
       work already exists. Refresh so Home shows the true state rather than
       silently orphaning it, then let HomeView report that nothing else
       changed. The writer sees what is real, not what was intended. */
    try {
      const manuscriptId = idFrom(await post('/api/sovereign/manuscripts/blank'));
      if (!manuscriptId) throw new Error('blank manuscript returned no id');
      await declare(workId, manuscriptId);
      await refresh();
      router.push(canvasForManuscript(CANVAS_HREF, manuscriptId));
    } catch (err) {
      await refresh();
      throw err;
    }
  };

  const onMakeWork = async (manuscriptId: string, title: string | null) => {
    const workId = idFrom(await post('/api/sovereign/living-works', title ? { title } : {}));
    if (!workId) throw new Error('living-works returned no id');
    try {
      await declare(workId, manuscriptId);
    } finally {
      await refresh();
    }
  };

  /**
   * Withdraw a work declaration. The manuscripts and materials that were
   * declared into it keep their own homes — this removes the member's
   * declaration, never their writing.
   */
  const onWithdraw = async (workId: string) => {
    try {
      const res = await apiFetch(`/api/sovereign/living-works/${workId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(`withdraw ${res.status}`);
    } finally {
      await refresh();
    }
  };

  const onAddToWork = async (manuscriptId: string, workId: string) => {
    try {
      await declare(workId, manuscriptId);
    } finally {
      await refresh();
    }
  };

  return (
    <HomeView
      loading={worksPhase === 'loading' || msPhase === 'loading'}
      works={works}
      manuscripts={manuscripts}
      onBegin={onBegin}
      onMakeWork={onMakeWork}
      onAddToWork={onAddToWork}
      onWithdraw={onWithdraw}
    />
  );
}
