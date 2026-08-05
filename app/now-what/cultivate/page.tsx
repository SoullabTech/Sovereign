'use client';

/**
 * Now What? — the Flourishing Field. A landscape, not a chat (founder
 * ruling 2026-08-05: "What you are cultivating should open to a field of
 * contributions, not another gate to chat").
 *
 * Six living areas — Larry's researched flourishing domains
 * (CLIENT_FIELD_TALK_ALIGNMENT_2026-08-05.md). Each area offers two
 * gestures: Add a reflection (opens the Reflection Room framed by the
 * dimension the member chose — the click is the gesture) and Explore
 * (their kept material). No scores, no assessments, no progress.
 *
 * Per-dimension GATHERING waits on the member's placing gesture (a
 * reflection is placed under a dimension by the member, never
 * auto-categorized) — until that gesture exists, this landscape shows the
 * areas and their doors, and claims nothing about what lives in each.
 */

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { apiFetch } from '@/lib/http/apiBase';
import { NowWhatThreshold, useMemberSession } from '@/components/now-what/NowWhatShell';
import { PaperRoom, SERIF, INK_FAINT, RULE } from '@/components/now-what/PaperRoom';

interface PlacedThread {
  id: string;
  title: string;
  created_at: string;
  flourishing_dimension: string | null;
}

function dayLabel(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString(undefined, { month: 'long', day: 'numeric' });
}

const DOMAINS = [
  { slug: 'relationships', name: 'Relationships', facets: 'connection · belonging · love',
    line: 'People who matter. Conversations that shaped you. Moments of connection.' },
  { slug: 'meaning', name: 'Meaning & purpose', facets: 'what your life is for',
    line: 'What matters now. What you are devoted to. What outlasts you.' },
  { slug: 'presence', name: 'Presence', facets: 'experiencing the life you built',
    line: 'Moments you were fully there. What you savored. What you noticed.' },
  { slug: 'health', name: 'Health & energy', facets: 'movement · sleep · vitality',
    line: 'How you are caring for the foundation beneath everything else.' },
  { slug: 'contribution', name: 'Contribution', facets: 'what you give beyond yourself',
    line: 'Where your gifts serve something larger. Who you are helping become.' },
  { slug: 'time', name: 'Time', facets: 'enough of it for what matters',
    line: 'Do you own your time, or does your schedule own you?' },
];

function CultivateInner() {
  const params = useSearchParams();
  const fieldContext = params?.get('fieldContext') ?? undefined;
  const ctx = fieldContext ? `?fieldContext=${encodeURIComponent(fieldContext)}` : '';
  const session = useMemberSession();

  /*
   * The field GATHERS: threads the member PLACED under a dimension (by
   * entering the room through that dimension's door and keeping material).
   * Unplaced material never renders here — the placing gesture is the only
   * way in. Non-fatal: a read failure leaves the landscape quiet.
   */
  const [placed, setPlaced] = useState<Record<string, PlacedThread[]>>({});
  useEffect(() => {
    if (session !== 'in' || !fieldContext) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await apiFetch(`/api/now-what/field-note?fieldContext=${encodeURIComponent(fieldContext)}`);
        if (!res.ok) return;
        const json = await res.json().catch(() => ({}));
        const threads: PlacedThread[] = json?.threads ?? [];
        const byDim: Record<string, PlacedThread[]> = {};
        for (const t of threads) {
          if (t.flourishing_dimension) {
            (byDim[t.flourishing_dimension] ??= []).push(t);
          }
        }
        if (!cancelled) setPlaced(byDim);
      } catch {
        /* quiet landscape */
      }
    })();
    return () => { cancelled = true; };
  }, [session, fieldContext]);

  if (session === 'unknown') return null;
  if (session === 'out') {
    return (
      <NowWhatThreshold
        roomName="Flourishing Field"
        line="The dimensions of a flourishing life — and the field where your own contributions to them gather."
        fieldContext={fieldContext}
      />
    );
  }

  return (
    <PaperRoom location="Flourishing Field" homeHref={`/now-what${ctx}`}>
      <h1 className="nwp-h1">What you are cultivating</h1>
      <p className="nwp-lede">
        The dimensions of a flourishing life — each a living area for your
        reflections, moments, and contributions. Nothing here measures you;
        the field simply holds what you place in it.
      </p>

      {DOMAINS.map((d) => (
        <section key={d.slug} className="nwp-sec">
          <p className="nwp-label">
            {d.name}{' '}
            <span style={{ fontSize: 12, color: INK_FAINT, fontFamily: 'inherit', fontWeight: 300 }}>
              {d.facets}
            </span>
          </p>
          <p className="nwp-quiet" style={{ marginTop: 8, fontFamily: SERIF, fontStyle: 'italic' }}>
            {d.line}
          </p>
          {(placed[d.slug] ?? []).slice(0, 4).map((t) => (
            <div key={t.id} style={{ marginTop: 12 }}>
              <p className="nwp-member" style={{ fontSize: 16 }}>{t.title}</p>
              <p className="nwp-prov">in your words · {dayLabel(t.created_at)} · placed here by you</p>
            </div>
          ))}
          <p style={{ marginTop: 4 }}>
            <a
              className="nwp-door"
              style={{ marginRight: 22 }}
              href={`/now-what/room${ctx}${ctx ? '&' : '?'}entry=cultivate&dimension=${d.slug}`}
            >
              Add a reflection &rarr;
            </a>
            <a className="nwp-door" href={`/now-what/field${ctx}`}>
              Explore &rarr;
            </a>
          </p>
        </section>
      ))}

      <p
        className="nwp-quiet"
        style={{ marginTop: 34, paddingTop: 22, borderTop: `1px dashed ${RULE}`, fontSize: 12.5, color: INK_FAINT }}
      >
        A reflection added here is placed under its dimension by you — that
        placing gesture is what lets the field gather. Nothing is
        auto-categorized, and nothing here is a score.
      </p>
    </PaperRoom>
  );
}

export default function CultivatePage() {
  return (
    <Suspense fallback={null}>
      <CultivateInner />
    </Suspense>
  );
}
