'use client';

/**
 * Now What? — the Calendar Room. The continuity spine: the timeline of the
 * developmental relationship, never a productivity system (Continuity
 * Calendar directive, NOW_WHAT_CONTINUITY_CALENDAR_2026-08-05.md).
 *
 * Answers: "when does this relationship continue?" — never "what tasks do
 * I have?" Holds: conversations (live sessions substrate) · commitments
 * (member-created, never assigned) · previous conversations. Member-marked
 * moments arrive with the marking gesture — absent until then.
 */

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { apiFetch } from '@/lib/http/apiBase';
import { NowWhatThreshold, useMemberSession } from '@/components/now-what/NowWhatShell';
import { PaperRoom } from '@/components/now-what/PaperRoom';

interface HomeThread { id: string; title: string; keptAt: string }
interface Payload {
  coachName: string | null;
  commitments: HomeThread[];
  sessions: { ref: string; at: string; carried: number }[];
  upcoming?: { start: string; end: string; status: string; locationType: string | null }[];
}

function whenLabel(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })
    + ' · ' + d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}
function dayLabel(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString(undefined, { month: 'long', day: 'numeric' });
}
const HOW: Record<string, string> = { video: 'video', phone: 'phone', in_person: 'in person' };

function CalendarInner() {
  const params = useSearchParams();
  const fieldContext = params?.get('fieldContext') ?? undefined;
  const ctx = fieldContext ? `?fieldContext=${encodeURIComponent(fieldContext)}` : '';
  const session = useMemberSession();
  const [data, setData] = useState<Payload | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (session !== 'in') return;
    let cancelled = false;
    (async () => {
      try {
        const res = await apiFetch(`/api/now-what/home${ctx}`);
        const json = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(json?.error || 'Could not open this room right now.');
        if (!cancelled) setData(json);
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
        roomName="My Calendar"
        line="When your relationship and your work continue — the timeline, not a task list."
        fieldContext={fieldContext}
      />
    );
  }

  const coachFirst = data?.coachName ? data.coachName.split(' ')[0] : null;
  const upcoming = data?.upcoming ?? [];
  const commitments = data?.commitments ?? [];
  const past = data?.sessions ?? [];

  return (
    <PaperRoom location="My Calendar" homeHref={`/now-what${ctx}`}>
      {error && <p role="alert" className="nwp-quiet" style={{ color: '#8c2f22', marginTop: 24 }}>{error}</p>}

      <h1 className="nwp-h1">My calendar</h1>
      <p className="nwp-lede">
        When this relationship and this work continue. The calendar is the
        bridge between moments — the center remains your work.
      </p>

      <section className="nwp-sec">
        <p className="nwp-label">Conversations</p>
        {upcoming.length === 0 ? (
          <p className="nwp-quiet" style={{ marginTop: 12 }}>
            Nothing is scheduled right now. When a conversation
            {coachFirst ? ` with ${coachFirst}` : ''} is set, it appears here.
          </p>
        ) : (
          upcoming.map((u) => (
            <div key={u.start} style={{ marginTop: 14 }}>
              <p className="nwp-when">{whenLabel(u.start)}</p>
              <p className="nwp-quiet" style={{ marginTop: 4 }}>
                {coachFirst ? `Conversation with ${coachFirst}` : 'Coaching conversation'}
                {u.locationType && HOW[u.locationType] ? ` · ${HOW[u.locationType]}` : ''}
              </p>
              <a className="nwp-door" href={`/now-what/room${ctx}${ctx ? '&' : '?'}entry=prepare`}>
                Prepare &rarr;
              </a>
            </div>
          ))
        )}
      </section>

      <section className="nwp-sec">
        <p className="nwp-label">Your commitments</p>
        {commitments.length === 0 ? (
          <p className="nwp-quiet" style={{ marginTop: 12 }}>
            What you choose to live gathers here — created by you, never
            assigned.
          </p>
        ) : (
          commitments.slice(0, 5).map((c) => (
            <div key={c.id} style={{ marginTop: 12 }}>
              <p className="nwp-member" style={{ fontSize: 16 }}>{c.title}</p>
              <p className="nwp-prov">in your words · {dayLabel(c.keptAt)} · never assigned</p>
            </div>
          ))
        )}
      </section>

      {past.length > 0 && (
        <section className="nwp-sec">
          <p className="nwp-label">Previous conversations</p>
          {past.slice(0, 6).map((s) => (
            <p key={s.ref} className="nwp-quiet" style={{ marginTop: 10 }}>
              {dayLabel(s.at)} — you carried{' '}
              {s.carried === 1 ? 'one thing' : `${s.carried} things`} forward.
            </p>
          ))}
        </section>
      )}
    </PaperRoom>
  );
}

export default function CalendarRoomPage() {
  return (
    <Suspense fallback={null}>
      <CalendarInner />
    </Suspense>
  );
}
