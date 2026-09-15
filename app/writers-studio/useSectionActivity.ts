'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/http/apiBase';
import type { SectionActivity } from '@/lib/writersStudio/sectionActivity';

/**
 * RETURN-LOCUS-01 — where this Work was last touched, if that is a place.
 *
 * ⭐ Asked for ONE manuscript, not the shelf. The Return hero is the only
 * surface that needs it, and a list-wide read would make the Studio ask about
 * places the member is not going.
 *
 * ⛔ While it is loading the answer is `null`, and the caller must render the
 * SAME link it renders for `undifferentiated` — never a disabled control and
 * never a delayed one. A writer must not wait on a read that only ever adds
 * precision to a link that already works.
 */
export function useSectionActivity(manuscriptId: string | null): SectionActivity | null {
  const [activity, setActivity] = useState<SectionActivity | null>(null);

  useEffect(() => {
    if (!manuscriptId) { setActivity(null); return; }
    let cancelled = false;
    setActivity(null);
    (async () => {
      try {
        const res = await apiFetch(
          `/api/sovereign/manuscripts/${encodeURIComponent(manuscriptId)}/locus`,
          { method: 'GET' });
        if (cancelled || !res.ok) return;
        const body = (await res.json()) as SectionActivity;
        if (!cancelled) setActivity(body);
      } catch {
        /* ⛔ Silent. A failed read means the link stays Work-scoped, which is
           exactly today's behaviour — never an error in front of the writer. */
      }
    })();
    return () => { cancelled = true; };
  }, [manuscriptId]);

  return activity;
}
