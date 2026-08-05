'use client';

/**
 * Now What? — the Coaching Room. The human relationship's own room
 * (six-door constellation, founder-directed 2026-08-05).
 *
 * Holds: the coach · upcoming conversations (live sessions substrate) ·
 * previous conversations (derived from what the member carried out of them) ·
 * what the member brought forward (Bring Forward, live).
 *
 * HONEST ABSENCE: notes-from-coach and direct messaging do NOT render —
 * they arrive with the encrypted content lane (see
 * NOW_WHAT_HOME_DOOR_MAP_2026-08-05.md §9). No placeholders, no "coming
 * soon". Larry is the relationship anchor; MAIA does not appear in this room.
 */

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { apiFetch } from '@/lib/http/apiBase';
import { NowWhatThreshold, useMemberSession } from '@/components/now-what/NowWhatShell';
import { PaperRoom } from '@/components/now-what/PaperRoom';

interface HomeThread {
  id: string; title: string; authorship: string; keptAt: string;
  sharedWithCoach: boolean; sessionRef: string | null;
}
interface Payload {
  coachName: string | null;
  shared: HomeThread[];
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

function CoachingRoomInner() {
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
        roomName="Coaching Room"
        line="Your coaching relationship — its conversations, and what you chose to bring into it."
        fieldContext={fieldContext}
      />
    );
  }

  const coachName = data?.coachName ?? null;
  const coachFirst = coachName ? coachName.split(' ')[0] : null;
  const upcoming = data?.upcoming ?? [];
  const shared = data?.shared ?? [];
  const past = data?.sessions ?? [];

  return (
    <PaperRoom location="Coaching Room" homeHref={`/now-what${ctx}`}>
      {error && <p role="alert" className="nwp-quiet" style={{ color: '#8c2f22', marginTop: 24 }}>{error}</p>}

      <h1 className="nwp-h1">{coachName ? `Your work with ${coachFirst}` : 'Your coaching relationship'}</h1>
      {coachName && <p className="nwp-lede">{coachName} — the human relationship this environment extends.</p>}

      {/* Upcoming — live sessions substrate only; absent when none. */}
      {upcoming.length > 0 && (
        <section className="nwp-sec">
          <p className="nwp-label">Upcoming</p>
          {upcoming.map((u) => (
            <div key={u.start} style={{ marginTop: 14 }}>
              <p className="nwp-when">{whenLabel(u.start)}</p>
              <p className="nwp-quiet" style={{ marginTop: 4 }}>
                {coachFirst ? `With ${coachFirst}` : 'With your coach'}
                {u.locationType && HOW[u.locationType] ? ` · ${HOW[u.locationType]}` : ''}
              </p>
            </div>
          ))}
          <a className="nwp-door" href={`/now-what/room${ctx}${ctx ? '&' : '?'}entry=prepare`}>
            Prepare for your conversation &rarr;
          </a>
        </section>
      )}

      {/* What the member brought forward — their act, their words. */}
      <section className="nwp-sec">
        <p className="nwp-label">What you brought forward</p>
        {shared.length === 0 ? (
          <p className="nwp-quiet" style={{ marginTop: 12 }}>
            Nothing here reaches {coachFirst ?? 'your coach'} unless you bring
            it, one piece at a time. What you choose to bring forward helps
            make future conversations more meaningful.
          </p>
        ) : (
          <>
            {shared.map((t) => (
              <div key={t.id} style={{ marginTop: 14 }}>
                <p className="nwp-member">{t.title}</p>
                <p className="nwp-prov">
                  in your words · {dayLabel(t.keptAt)} ·{' '}
                  <span className="nwp-fwd">brought into your coaching</span>
                </p>
              </div>
            ))}
            <p className="nwp-quiet" style={{ marginTop: 16 }}>
              Anything brought into your coaching can be withdrawn, and
              withdrawing it tells no one.
            </p>
          </>
        )}
        <a className="nwp-door" href={`/now-what/field${ctx}`}>Everything you&rsquo;ve kept &rarr;</a>
      </section>

      {/* Previous conversations — derived from what the member carried out. */}
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

export default function CoachingRoomPage() {
  return (
    <Suspense fallback={null}>
      <CoachingRoomInner />
    </Suspense>
  );
}
