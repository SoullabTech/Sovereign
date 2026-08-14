'use client';

import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/http/apiBase';
import { CANVAS_HREF } from './studioMap';
import { useCurrentManuscript } from './useCurrentManuscript';
import { useLivingWorks } from './useLivingWorks';
import HomeView from './HomeView';

/**
 * Writer's Studio — Home. Wiring only.
 *
 * The experience lives in HomeView, a pure function of the writer's own
 * facts. This file supplies those facts and performs the one act that
 * mutates: beginning a work, which ends INSIDE the Canvas rather than back
 * on the doorway.
 *
 * Rebuilt 2026-08-14 under founder ruling after the Studio Home walk FAILED.
 * See HomeView.tsx for what was wrong and what governs the replacement.
 */
export default function WritersStudioHome() {
  const router = useRouter();
  const { phase: worksPhase, works, reload: reloadWorks } = useLivingWorks();
  const { phase: msPhase, manuscripts } = useCurrentManuscript();

  const onBegin = async (title: string) => {
    const res = await apiFetch('/api/sovereign/living-works', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(title ? { title } : {}),
    });
    if (!res.ok) throw new Error(String(res.status));
    await reloadWorks();
    router.push(CANVAS_HREF);
  };

  return (
    <HomeView
      loading={worksPhase === 'loading' || msPhase === 'loading'}
      works={works}
      manuscripts={manuscripts}
      onBegin={onBegin}
    />
  );
}
