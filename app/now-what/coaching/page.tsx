'use client';

/**
 * Now What? — My Coaching. The human relationship's own room
 * (six-door constellation, founder-directed 2026-08-05).
 *
 * The room's name is the registry's (`lib/nowWhat/rooms.ts`), not a local
 * string. Member-facing names are authored in ONE place; see the note on
 * NowWhatThreshold about why this room's threshold once said "Coaching Room"
 * while the map said "My Coaching".
 *
 * Holds: the coach · upcoming conversations (live sessions substrate) ·
 * previous conversations (derived from what the member carried out of them) ·
 * what the member brought forward (Bring Forward, live) · where you are
 * (program placement, member-declared — absorbed from the position room per
 * NOW_WHAT_ROOM_ONTOLOGY_CONSOLIDATION_2026-08-05.md D-B).
 *
 * HONEST ABSENCE: notes-from-coach and direct messaging do NOT render —
 * they arrive with the encrypted content lane (see
 * NOW_WHAT_HOME_DOOR_MAP_2026-08-05.md §9). No placeholders, no "coming
 * soon". Larry is the relationship anchor; MAIA does not appear in this room.
 *
 * "Where you are" reads field_program_positions (member-scoped GET) and
 * nothing else — no inference, no scoring, no sequence progress. Programs
 * the member never entered do not appear. Only rendered when a fieldContext
 * is present; absent otherwise, one honest line when empty.
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
interface PositionRow {
  programSlug: string;
  programTitle: string | null;
  focalPoint: string;
  statedBy: 'member_confirmed' | 'member_stated' | 'practitioner_seeded';
  footing: 'confirmed-current' | 'assumed-from-last-known';
  confirmedAt: string | null;
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

// The register each row speaks in — who said this, and does it still stand.
function footingLine(p: PositionRow): string {
  if (p.statedBy === 'practitioner_seeded') {
    return 'placed by your practitioner — not yet yours until you say so';
  }
  if (p.footing === 'confirmed-current') {
    return p.statedBy === 'member_stated'
      ? `in your own words · ${dayLabel(p.confirmedAt ?? '')}`
      : `you confirmed this · ${dayLabel(p.confirmedAt ?? '')}`;
  }
  return `last known — not reconfirmed since ${dayLabel(p.confirmedAt ?? '')}`;
}

function CoachingRoomInner() {
  const params = useSearchParams();
  const fieldContext = params?.get('fieldContext') ?? undefined;
  const ctx = fieldContext ? `?fieldContext=${encodeURIComponent(fieldContext)}` : '';
  const session = useMemberSession();
  const [data, setData] = useState<Payload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [positions, setPositions] = useState<PositionRow[] | null>(null);

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

  // Program placement — member-declared only. Absent without a fieldContext;
  // quiet on read failure (no separate error UI — an honest absence is enough).
  useEffect(() => {
    if (session !== 'in' || !fieldContext) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await apiFetch(
          `/api/now-what/program-position?fieldContext=${encodeURIComponent(fieldContext)}`,
        );
        const json = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(json?.error || 'unavailable');
        if (!cancelled) setPositions(json.positions ?? []);
      } catch {
        if (!cancelled) setPositions([]);
      }
    })();
    return () => { cancelled = true; };
  }, [session, fieldContext]);

  if (session === 'unknown') return null;
  if (session === 'out') {
    return (
      <NowWhatThreshold
        roomName="My Coaching"
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
    <PaperRoom location="My Coaching" homeHref={`/now-what${ctx}`}>
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

      {/* Where you are — program placement, as the member declared it.
          Only you can say where you are; absent without a fieldContext. */}
      {fieldContext && (
        <section className="nwp-sec">
          <p className="nwp-label">Where you are</p>
          {positions === null && <p className="nwp-quiet" style={{ marginTop: 12 }}>Opening&hellip;</p>}
          {positions !== null && positions.length === 0 && (
            <p className="nwp-quiet" style={{ marginTop: 12 }}>
              You haven&rsquo;t placed yourself in a program here yet — only you
              can say where you are, and nothing appears until you do.
            </p>
          )}
          {positions !== null && positions.length > 0 && (
            <>
              {positions.map((p) => (
                <div key={p.programSlug} style={{ marginTop: 14 }}>
                  <p className="nwp-prov" style={{ marginTop: 0 }}>{p.programTitle ?? 'This field'}</p>
                  <p className="nwp-member">
                    {p.statedBy === 'member_stated' ? `“${p.focalPoint}”` : p.focalPoint}
                  </p>
                  <p className="nwp-prov">{footingLine(p)}</p>
                </div>
              ))}
            </>
          )}
        </section>
      )}

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
