'use client';

/**
 * Now What? — My Story. The integrative room (ontology ratified 2026-08-05,
 * docs/design/now-what/NOW_WHAT_ROOM_ONTOLOGY_CONSOLIDATION_2026-08-05.md §1,
 * row 4).
 *
 * Human question: "What is becoming, over time?" Primary gesture: see what
 * is becoming. This room is integrative by ARRANGEMENT, never by synthesis —
 * every line here is something the member authored or chose to keep, grouped
 * only by month. No interpretation, no scores, no MAIA-narrated arc.
 *
 * D-C (open, founder-ruled criteria only): the gesture that would promote a
 * kept thing to a marked "turning point" is NOT yet ruled — the wording is
 * still open. Until it is, this room stays exactly what the current
 * substrate proves: the month-grouped kept-things timeline. No marking UI,
 * no chapters, no recency language, no "who you are becoming" framing.
 *
 * Query params:
 *   fieldContext — optional; scopes the timeline to one field (e.g. now-what-demo)
 */

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { apiFetch } from '@/lib/http/apiBase';
import { NowWhatThreshold, useMemberSession } from '@/components/now-what/NowWhatShell';
import { PaperRoom } from '@/components/now-what/PaperRoom';
import { WithdrawVisibility } from '@/components/now-what/WithdrawVisibility';

interface Thread {
  id: string;
  title: string;
  authorship: string;
  member_decision: string | null;
  spiralogic_phase: string | null;
  can_be_shown_to_practitioner: boolean;
  field_context: string | null;
  created_at: string;
}

// Plain words only — the tag types the evidence, never the person. Arc-phase
// codes (fire_1..air_3, unsolicited, closure) are deliberately NOT surfaced
// here: they would read as a score, which this room never renders.
const TAG_LABELS: Record<string, string> = {
  practice: 'practice',
  offering: 'offering',
  question: 'question',
  decision: 'decision',
};

function monthKey(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
}

function dayLabel(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function MyStoryInner() {
  const params = useSearchParams();
  const fieldContext = params?.get('fieldContext') ?? undefined;
  const ctx = fieldContext ? `?fieldContext=${encodeURIComponent(fieldContext)}` : '';
  const session = useMemberSession();
  const [threads, setThreads] = useState<Thread[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch only once the session fact is known and says 'in' — a
    // signed-out visitor must never fire this request (it was previously
    // firing before the gate and drawing a 401 for every signed-out visit).
    if (session !== 'in') return;
    let cancelled = false;
    (async () => {
      try {
        const res = await apiFetch(`/api/now-what/field-note${ctx}`);
        const json = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(json?.error || 'Could not open your story right now.');
        if (!cancelled) setThreads(json.threads ?? []);
      } catch (e: any) {
        if (!cancelled) setError(e.message);
      }
    })();
    return () => { cancelled = true; };
  }, [session, ctx]);

  if (session === 'unknown') return null;
  if (session === 'out') {
    return (
      <NowWhatThreshold
        roomName="My Story"
        line="What you kept, in your own words, gathered over time."
        fieldContext={fieldContext}
      />
    );
  }

  const roomHref = `/now-what/room${ctx}`;

  // Group by month, newest first (threads arrive newest-first from the API).
  const groups: { month: string; items: Thread[] }[] = [];
  for (const t of threads ?? []) {
    const key = monthKey(t.created_at);
    const last = groups[groups.length - 1];
    if (last && last.month === key) last.items.push(t);
    else groups.push({ month: key, items: [t] });
  }

  return (
    <PaperRoom location="My Story" homeHref={`/now-what${ctx}`}>
      {error && <p role="alert" className="nwp-quiet" style={{ color: '#8c2f22', marginTop: 24 }}>{error}</p>}

      <h1 className="nwp-h1">Your story</h1>
      <p className="nwp-lede">What you kept, in your own words, gathered over time.</p>

      <section className="nwp-sec">
        <p className="nwp-label">What you&rsquo;ve kept</p>

        {threads === null && !error && (
          <p className="nwp-quiet" style={{ marginTop: 12 }}>Opening your story&hellip;</p>
        )}

        {threads !== null && threads.length === 0 && (
          <p className="nwp-quiet" style={{ marginTop: 12 }}>
            Your story fills only through your own gestures — what you keep at
            the end of a session gathers here, in your words. Nothing is here
            yet.
          </p>
        )}

        {groups.map((group) => (
          <div key={group.month} style={{ marginTop: 24 }}>
            <p className="nwp-when">{group.month}</p>
            {group.items.map((t) => (
              <div key={t.id} style={{ marginTop: 14 }}>
                <p className="nwp-member">{t.title}</p>
                <p className="nwp-prov">
                  {dayLabel(t.created_at)}
                  {t.spiralogic_phase && TAG_LABELS[t.spiralogic_phase] && (
                    <> &middot; {TAG_LABELS[t.spiralogic_phase]}</>
                  )}
                  {t.can_be_shown_to_practitioner && <WithdrawVisibility threadId={t.id} />}
                </p>
              </div>
            ))}
          </div>
        ))}
      </section>

      <section className="nwp-sec">
        <p className="nwp-quiet">
          Nothing here is interpreted, scored, or arranged into a summary — the
          arrangement is only by month. What it adds up to is yours to
          recognize.
        </p>
        <a className="nwp-door" href={roomHref}>
          {threads !== null && threads.length === 0 ? 'Enter the session room →' : 'Return to the room →'}
        </a>
      </section>
    </PaperRoom>
  );
}

export default function NowWhatFieldPage() {
  return (
    <Suspense fallback={null}>
      <MyStoryInner />
    </Suspense>
  );
}
