'use client';

/**
 * Now What? — My Work. What am I living and cultivating right now?
 *
 * Consolidates two former rooms (ontology ratified 2026-08-05, see
 * docs/design/now-what/NOW_WHAT_ROOM_ONTOLOGY_CONSOLIDATION_2026-08-05.md §1-2):
 *   - `next` (practices the member chose to live, end-of-session) — RETIRED,
 *     folded in as "What you chose to live". Its commitments were previously
 *     duplicated on the calendar page; this is their one home now.
 *   - `cultivate` (the Flourishing Field, six domains) — MERGED as
 *     "What you are cultivating". Copy and behavior preserved exactly; it
 *     shipped and is founder-approved.
 *
 * One fetch of the member's field-note threads serves both sections:
 * practice-tagged threads (chosen commitments) and dimension-placed threads
 * (cultivation). Both are member-authored facts, never inferred, never
 * scored, never ranked.
 */

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { apiFetch } from '@/lib/http/apiBase';
import { NowWhatThreshold, useMemberSession } from '@/components/now-what/NowWhatShell';
import { PaperRoom, SERIF, INK_FAINT, RULE } from '@/components/now-what/PaperRoom';

interface Thread {
  id: string;
  title: string;
  created_at: string;
  spiralogic_phase: string | null;
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

function WorkInner() {
  const params = useSearchParams();
  const fieldContext = params?.get('fieldContext') ?? undefined;
  const ctx = fieldContext ? `?fieldContext=${encodeURIComponent(fieldContext)}` : '';
  const session = useMemberSession();

  /*
   * A single member-scoped read serves both sections of this room:
   *   - practices: threads tagged 'practice' — chosen at the end of a
   *     session, held open, never prescribed.
   *   - placed: threads the member PLACED under a flourishing dimension by
   *     entering the room through that dimension's door and keeping material.
   * Unplaced / untagged material never renders here. Non-fatal: a read
   * failure leaves the room quiet, not broken.
   */
  const [practices, setPractices] = useState<Thread[] | null>(null);
  const [placed, setPlaced] = useState<Record<string, Thread[]>>({});
  useEffect(() => {
    if (session !== 'in' || !fieldContext) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await apiFetch(`/api/now-what/field-note?fieldContext=${encodeURIComponent(fieldContext)}`);
        if (!res.ok) return;
        const json = await res.json().catch(() => ({}));
        const threads: Thread[] = json?.threads ?? [];
        if (cancelled) return;
        setPractices(threads.filter((t) => t.spiralogic_phase === 'practice'));
        const byDim: Record<string, Thread[]> = {};
        for (const t of threads) {
          if (t.flourishing_dimension) {
            (byDim[t.flourishing_dimension] ??= []).push(t);
          }
        }
        setPlaced(byDim);
      } catch {
        /* quiet room */
      }
    })();
    return () => { cancelled = true; };
  }, [session, fieldContext]);

  if (session === 'unknown') return null;
  if (session === 'out') {
    return (
      <NowWhatThreshold
        roomName="My Work"
        line="What you are living and cultivating right now — the practices you chose, and the dimensions of a flourishing life."
        fieldContext={fieldContext}
      />
    );
  }

  return (
    <PaperRoom location="My Work" homeHref={`/now-what${ctx}`}>
      <h1 className="nwp-h1">What you are living</h1>
      <p className="nwp-lede">
        The practices you chose to live, and the dimensions of a flourishing
        life you are cultivating. Nothing here measures you; this room simply
        holds what you placed in it.
      </p>

      <section className="nwp-sec">
        <p className="nwp-label">What you chose to live</p>
        {practices === null && (
          <p className="nwp-quiet" style={{ marginTop: 8 }}>Opening…</p>
        )}
        {practices !== null && practices.length === 0 && (
          <p className="nwp-quiet" style={{ marginTop: 8, fontFamily: SERIF, fontStyle: 'italic' }}>
            Nothing chosen yet. A practice is chosen in the room, never assigned.
          </p>
        )}
        {practices !== null && practices.length > 0 && (
          <div>
            {practices.map((t) => (
              <div key={t.id} style={{ marginTop: 12 }}>
                <p className="nwp-member" style={{ fontSize: 16 }}>{t.title}</p>
                <p className="nwp-prov">{dayLabel(t.created_at)}</p>
              </div>
            ))}
          </div>
        )}
        <p style={{ marginTop: 12 }}>
          <a className="nwp-door" href={`/now-what/room${ctx}${ctx ? '&' : '?'}entry=lived`}>
            Start a session &rarr;
          </a>
        </p>
      </section>

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
        A practice is chosen by you at the end of a session; a reflection is
        placed under its dimension by you. Both gestures are what let this
        room gather. Nothing is auto-categorized, and nothing here is a
        score.
      </p>
    </PaperRoom>
  );
}

export default function WorkPage() {
  return (
    <Suspense fallback={null}>
      <WorkInner />
    </Suspense>
  );
}
