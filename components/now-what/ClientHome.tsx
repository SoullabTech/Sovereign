'use client';

/**
 * Now What? — Client Home v2: the CEO flourishing field.
 *
 * FOUNDER-APPROVED EXPERIENCE (2026-08-05): built exactly to the approved
 * mockup docs/design/now-what/mockups/CEO_FLOURISHING_HOME_MOCKUP_2026-08-05.html
 * ("this is moving in the exact right direction" → "this is exactly what I
 * was hoping for"). A private executive sanctuary for reflection,
 * integration, and the next level of a life worth living — organized as an
 * interrelated FIELD of active boxes, not a column, not a dashboard.
 *
 * Every box is a door: the whole surface is active and leads to a simple
 * field of engagement. Area labels are clear, visible, and primary.
 * Register: warm paper · ink · bronze · editorial serif.
 *
 * SUBSTRATE HONESTY (founder-ratified this session): only live substrate
 * renders. The mockup's calendar box, "Message Larry", and "leadership
 * circle" boxes are deliberately ABSENT here until their slices land —
 * the calendar needs a member-facing session read, messaging needs its own
 * lane (E-1 lineage + encrypted content tables), and group spaces carry an
 * unruled third-party-consent question. Absence is silent — no
 * placeholders, no "coming soon".
 *
 * WHAT THIS ROOM STILL REFUSES (structural, unchanged):
 *   - No score, streak, ranking, progress bar, completion count, metric.
 *     The flourishing lens is STATIC orientation copy — no member position.
 *   - No system-voiced finding; every member line is their words with its
 *     author shown. Slots render ONLY when the member's own kept material
 *     fills them.
 *   - No computed suggestion. All invitations are static strings.
 *   - Kept, not "recent" (E-2): presence from the keeping gesture; dates
 *     describe, never rank.
 *   - Bring-forward vocabulary only ("brought into your coaching").
 *   - MAIA helps you think. The coach helps you develop. The member
 *     remains the author.
 *
 * Data: unchanged — ONE member-scoped composition call (`/api/now-what/home`).
 * Opening this room writes nothing.
 */

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/http/apiBase';
import { NowWhatThreshold, useMemberSession } from '@/components/now-what/NowWhatShell';
import { RoomTrustCopy } from '@/components/now-what/RoomTrustCopy';

interface HomeThread {
  id: string;
  title: string;
  content: string | null;
  authorship: string;
  keptAt: string;
  sharedWithCoach: boolean;
  sessionRef: string | null;
}

interface JourneyRow {
  programSlug: string;
  programTitle: string | null;
  focalPoint: string;
  statedBy: string;
  confirmedAt: string | null;
}

interface SessionRow {
  ref: string;
  at: string;
  carried: number;
}

interface HomePayload {
  journey: JourneyRow[];
  coachName: string | null;
  decisions: HomeThread[];
  commitments: HomeThread[];
  questions: HomeThread[];
  reflections: HomeThread[];
  shared: HomeThread[];
  sessions: SessionRow[];
}

function dayLabel(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? ''
    : d.toLocaleDateString(undefined, { month: 'long', day: 'numeric' });
}

/** Whose act made this exist. Attribution is necessary, never decorative. */
function provenance(t: HomeThread): string {
  const who = t.authorship === 'member_authored' ? 'in your words' : 'you kept this';
  const when = dayLabel(t.keptAt);
  return when ? `${who} · ${when}` : who;
}

/*
 * The flourishing lens — static orientation copy, identical for every
 * member. It names dimensions this work attends to; it claims NOTHING about
 * this member. No member data may enter this structure without its own
 * ruling.
 */
/*
 * Larry's researched flourishing domains (talk alignment 2026-08-05,
 * docs/design/now-what/CLIENT_FIELD_TALK_ALIGNMENT_2026-08-05.md).
 * Invitations, never measurements.
 */
const LENS = [
  { name: 'Relationships', facets: 'connection · belonging · love' },
  { name: 'Meaning & purpose', facets: 'what your life is for' },
  { name: 'Presence', facets: 'experiencing the life you built' },
  { name: 'Health & energy', facets: 'movement · sleep · vitality' },
  { name: 'Contribution', facets: 'what you give beyond yourself' },
  { name: 'Time', facets: 'enough of it for what matters' },
];

/** Primary area label — clear, visible, first thing in every box. */
function AreaLabel({ title, go }: { title: string; go?: string }) {
  return (
    <div className="nwh-arealabel">
      <span className="nwh-arealabel-t">{title}</span>
      <span className="nwh-arealabel-go">{go ?? '→'}</span>
    </div>
  );
}

/** One member-authored continuity slot: frame, member words, provenance. */
function SlotBox({ frame, item, href }: { frame: string; item: HomeThread; href: string }) {
  return (
    <a className="nwh-box nwh-slot" href={href}>
      <AreaLabel title={frame} />
      <p className="nwh-serif nwh-words">{item.title}</p>
      <p className="nwh-prov">
        {provenance(item)}
        {/* The member's ACT, never a visibility claim. */}
        {item.sharedWithCoach && <span className="nwh-fwd">brought into your coaching</span>}
      </p>
    </a>
  );
}

// ── The room ─────────────────────────────────────────────────────────────

export default function ClientHome({ fieldContext }: { fieldContext?: string }) {
  const session = useMemberSession();
  const [data, setData] = useState<HomePayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState<string | null>(null);

  // Session fact only: the member's own stored session, never an inference.
  useEffect(() => {
    try {
      const raw = localStorage.getItem('beta_user');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.name && typeof parsed.name === 'string') setName(parsed.name.split(' ')[0]);
      }
    } catch {
      /* a missing name is not an error — the room greets plainly */
    }
  }, []);

  useEffect(() => {
    if (session !== 'in') return;
    let cancelled = false;
    (async () => {
      try {
        const qs = fieldContext ? `?fieldContext=${encodeURIComponent(fieldContext)}` : '';
        const res = await apiFetch(`/api/now-what/home${qs}`);
        const json = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(json?.error || 'Could not open your space right now.');
        if (!cancelled) setData(json);
      } catch (e: any) {
        if (!cancelled) setError(e.message);
      }
    })();
    return () => { cancelled = true; };
  }, [session, fieldContext]);

  const ctx = fieldContext ? `?fieldContext=${encodeURIComponent(fieldContext)}` : '';
  const roomHref = `/now-what/room${ctx}`;
  const fieldHref = `/now-what/field${ctx}`;
  const positionHref = `/now-what/position${ctx}`;
  const mapHref = `/now-what/map${ctx}`;

  if (session === 'unknown') return null;
  if (session === 'out') {
    return (
      <NowWhatThreshold
        roomName="Your space"
        line="Your own private thoughts and insights, between conversations with your coach."
        fieldContext={fieldContext}
      />
    );
  }

  const coachName = data?.coachName ?? null;
  const coachFirst = coachName ? coachName.split(' ')[0] : null;
  const shared = data?.shared ?? [];
  const journey = data?.journey ?? [];
  const focal = journey[0] ?? null;

  /*
   * Continuity slots — each is the member's OWN most recently kept item of
   * that nature. A slot with no kept material is absent, not placeholdered.
   * The living question takes questions[0]; the exploring slot takes the
   * next distinct kept question.
   */
  const livingQuestion = data?.questions?.[0] ?? null;
  const noticed = data?.reflections?.[0] ?? null;
  const livingCommitment = data?.commitments?.[0] ?? null;
  const exploring = data?.questions?.[1] ?? null;

  return (
    <div className="nwh-root">
      <div className="nwh-frame">
        {/* The room's own quiet header — wordmark and exit, nothing else. */}
        <div className="nwh-top">
          <a className="nwh-wordmark" href={mapHref}>Now What?</a>
          <span className="nwh-loc">Home</span>
        </div>

        {error && (
          <p role="alert" className="nwh-error">{error}</p>
        )}

        {/* ── Arrival — whose environment, then the person ── */}
        <div className="nwh-arrive">
          {coachName && <p className="nwh-brand">{coachName} · Executive Coaching</p>}
          <h1 className="nwh-h1">{name ? `Welcome back, ${name}.` : 'Welcome back.'}</h1>
          <p className="nwh-subtitle">
            A private space for what comes next — your life, your meaning,
            your flourishing as a human being.
          </p>
        </div>

        {/* ── The field ── */}
        <div className="nwh-field">

          {/* The living question — dominant, warm. Door: the reflection room. */}
          <a className="nwh-box nwh-living" href={roomHref}>
            <div>
              <AreaLabel title="The question you are carrying" />
              {focal && <p className="nwh-serif nwh-focal">{focal.focalPoint}</p>}
              {livingQuestion && (
                <p className="nwh-serif nwh-question">&ldquo;{livingQuestion.title}&rdquo;</p>
              )}
              {(livingQuestion || focal) ? (
                <p className="nwh-prov">
                  {livingQuestion?.sessionRef
                    ? 'captured from your coaching conversation'
                    : null}
                  {livingQuestion?.sessionRef && focal ? ' · ' : null}
                  {focal
                    ? focal.statedBy === 'practitioner_seeded'
                      ? 'placed by your coach — yours when you say so'
                      : 'named in your own words'
                    : null}
                </p>
              ) : (
                <p className="nwh-quiet">
                  What are you working through today? What you name in your
                  reflections gathers here, in your words.
                </p>
              )}
            </div>
            <div>
              <span className="nwh-cta">Continue this reflection</span>
            </div>
          </a>

          {/* The relationship — quiet, persistent. Door: what you've brought. */}
          <a className="nwh-box nwh-relate" href={fieldHref}>
            <AreaLabel title="Your coaching relationship" />
            {coachName && <p className="nwh-serif nwh-coach">{coachName}</p>}
            <p className="nwh-quiet">
              {shared.length > 0
                ? `These are your own private thoughts and insights. You have brought ${
                    shared.length === 1 ? 'one piece' : `${shared.length} pieces`
                  } into your coaching with ${coachFirst ?? 'your coach'}.`
                : `These are your own private thoughts and insights. You choose what to bring into your coaching with ${coachFirst ?? 'your coach'}.`}
            </p>
          </a>

          {/* MAIA — thinking partner, never the coach. Door: the room. */}
          <a className="nwh-box nwh-maia" href={roomHref}>
            <AreaLabel title="A place to think" />
            <p className="nwh-quiet">
              A quiet space with MAIA — clarify a decision, explore a tension,
              listen to yourself think before anything needs to be certain.
            </p>
            <p className="nwh-triad">
              MAIA helps you think. {coachFirst ?? 'Your coach'} helps you
              grow. You remain the author.
            </p>
          </a>

          {/* Continuity slots — only the ones the member's material fills. */}
          {noticed && <SlotBox frame="What you noticed" item={noticed} href={fieldHref} />}
          {livingCommitment && (
            <SlotBox frame="What you are living" item={livingCommitment} href={fieldHref} />
          )}
          {exploring && <SlotBox frame="What you are exploring" item={exploring} href={fieldHref} />}

          {/* Programs — membership is live data; stages arrive with their
              substrate, never invented. Door: the position room. */}
          {journey.length > 0 && (
            <a className="nwh-box nwh-programs" href={positionHref}>
              <AreaLabel title={coachName ? `Your work with ${coachFirst}` : 'Your work'} />
              {journey.map((p) => (
                <div key={`${p.programSlug}-${p.focalPoint}`} className="nwh-prog">
                  <p className="nwh-serif nwh-pname">
                    {p.programTitle ?? p.programSlug}
                  </p>
                  {coachName && <p className="nwh-pwith">with {coachName}</p>}
                  <p className="nwh-quiet nwh-pfocal">
                    {p.focalPoint}
                    <span className="nwh-pnote">
                      {' — '}
                      {p.statedBy === 'practitioner_seeded'
                        ? 'placed by your coach'
                        : 'named in your own words'}
                    </span>
                  </p>
                </div>
              ))}
            </a>
          )}

          {/* Leadership story — the living archive. Door: everything kept. */}
          <a className="nwh-box nwh-story" href={fieldHref}>
            <AreaLabel title="Your story" go="Everything you’ve kept →" />
            <p className="nwh-quiet">
              How you are becoming — as a human being, first. Realizations,
              turning points, commitments, lessons. In your own words, over
              time.
            </p>
          </a>

          {/* Flourishing lens — static orientation, never a measure. */}
          <a className="nwh-box nwh-lens" href={roomHref}>
            <AreaLabel title="What you are cultivating" />
            <p className="nwh-quiet nwh-lensintro">
              The dimensions of a flourishing life.
            </p>
            {LENS.map((d) => (
              <p key={d.name} className="nwh-dim">
                <b>{d.name}</b> {d.facets}
              </p>
            ))}
          </a>

          {/* Boundary — stated once, part of the field. */}
          <div className="nwh-box nwh-trust">
            <RoomTrustCopy
              holds="What you authored in this environment — the decisions you are working through, your commitments, your questions, and what you chose to keep."
              doesNotHold="No scores, rankings, progress measures, assessments or summaries of you. No record of how often you come here, and no interpretation of your material by anyone but you."
              whoSees="You. Your coach receives a piece only if you explicitly brought it into your coaching, one piece at a time — never automatically, and never because you were active here."
              control="Everything here exists because of a gesture you made. Opening this room writes nothing. Anything brought into your coaching can be withdrawn, and withdrawing it tells no one."
            />
          </div>
        </div>
      </div>

      <style>{`
        .nwh-root {
          min-height: 100vh;
          font-family: -apple-system, 'Helvetica Neue', 'Segoe UI', sans-serif;
          color: #29231c;
          background:
            radial-gradient(ellipse 90% 45% at 50% -5%, rgba(196,164,110,0.16), transparent 60%),
            linear-gradient(#f8f5ef, #f3eee5);
          -webkit-font-smoothing: antialiased;
        }
        .nwh-frame { max-width: 80rem; margin: 0 auto; padding: 26px 40px 80px; }
        .nwh-serif { font-family: 'Iowan Old Style', 'Palatino Linotype', Palatino, Georgia, serif; font-weight: 400; }

        .nwh-top { display: flex; justify-content: space-between; align-items: baseline; }
        .nwh-wordmark { font-size: 13px; letter-spacing: 0.35em; text-transform: uppercase; color: #8a6a35; text-decoration: none; }
        .nwh-loc { font-size: 12px; color: #8f8474; font-weight: 300; }
        .nwh-error { margin-top: 24px; color: #8c2f22; font-size: 14px; font-weight: 300; }

        .nwh-arrive { margin-top: 34px; }
        .nwh-brand { font-size: 11px; letter-spacing: 0.4em; text-transform: uppercase; color: #8f8474; }
        .nwh-h1 {
          font-family: 'Iowan Old Style', 'Palatino Linotype', Palatino, Georgia, serif;
          font-size: clamp(30px, 4vw, 40px); font-weight: 400; letter-spacing: -0.01em; margin-top: 14px;
        }
        .nwh-subtitle { font-size: 16.5px; font-weight: 300; color: #57503f; margin-top: 8px; max-width: 46rem; line-height: 1.6; }

        .nwh-field { margin-top: 34px; display: grid; grid-template-columns: repeat(12, 1fr); gap: 16px; }
        .nwh-box {
          display: block;
          border: 1px solid rgba(90,76,58,0.16);
          background: rgba(255,253,248,0.78);
          border-radius: 16px;
          padding: 24px 26px;
          text-decoration: none;
          color: #29231c;
          transition: transform .18s ease, box-shadow .18s ease, border-color .18s ease;
        }
        a.nwh-box:hover {
          transform: translateY(-2px);
          box-shadow: 0 14px 34px rgba(64,52,36,0.12);
          border-color: rgba(138,106,53,0.4);
        }

        .nwh-arealabel { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; margin-bottom: 14px; }
        .nwh-arealabel-t {
          font-family: 'Iowan Old Style', 'Palatino Linotype', Palatino, Georgia, serif;
          font-size: 19px; font-weight: 400; color: #29231c;
        }
        .nwh-arealabel-go { font-size: 14px; color: #8a6a35; white-space: nowrap; font-weight: 300; }

        .nwh-prov { font-size: 12px; font-weight: 300; color: #8f8474; margin-top: 10px; }
        .nwh-fwd { color: #8a6a35; margin-left: 8px; }
        .nwh-quiet { font-size: 14px; font-weight: 300; color: #57503f; line-height: 1.65; }

        .nwh-living {
          grid-column: 1 / span 7; grid-row: span 2;
          background: rgba(240,229,209,0.6);
          display: flex; flex-direction: column; justify-content: space-between;
          min-height: 300px;
        }
        .nwh-focal { font-size: 27px; line-height: 1.28; }
        .nwh-question { font-size: 19px; font-style: italic; color: #57503f; margin-top: 12px; line-height: 1.5; }
        .nwh-cta {
          display: inline-block; margin-top: 20px; background: #29231c; color: #f6f2ea;
          border-radius: 999px; padding: 12px 28px; font-size: 14.5px;
          box-shadow: 0 8px 26px rgba(64,52,36,0.18);
        }

        .nwh-relate { grid-column: 8 / span 5; }
        .nwh-coach { font-size: 18px; margin-bottom: 6px; }
        .nwh-maia { grid-column: 8 / span 5; }
        .nwh-triad { font-size: 12.5px; font-weight: 300; color: #8f8474; margin-top: 10px; line-height: 1.6; }

        .nwh-slot { grid-column: span 4; }
        .nwh-words { font-size: 16.5px; line-height: 1.5; }

        .nwh-programs { grid-column: 1 / span 7; }
        .nwh-prog { padding: 12px 0 14px; }
        .nwh-prog + .nwh-prog { border-top: 1px solid rgba(90,76,58,0.16); }
        .nwh-pname { font-size: 18px; }
        .nwh-pwith { font-size: 12.5px; font-weight: 300; color: #8f8474; margin-top: 3px; }
        .nwh-pfocal { margin-top: 8px; }
        .nwh-pnote { color: #8f8474; font-size: 12px; }

        .nwh-story { grid-column: 8 / span 5; }
        .nwh-lens { grid-column: 1 / span 7; }
        .nwh-lensintro { margin-bottom: 12px; }
        .nwh-dim { font-size: 13.5px; line-height: 1.9; font-weight: 300; color: #8f8474; }
        .nwh-dim b {
          font-family: 'Iowan Old Style', 'Palatino Linotype', Palatino, Georgia, serif;
          font-weight: 400; color: #29231c; margin-right: 8px;
        }

        .nwh-trust { grid-column: 1 / -1; background: transparent; border-style: dashed; }
        .nwh-trust, .nwh-trust * { color: #57503f !important; border-color: rgba(90,76,58,0.25) !important; }
        .nwh-trust [class*="bg-"] { background: rgba(90,76,58,0.05) !important; }

        @media (max-width: 980px) {
          .nwh-field > * { grid-column: 1 / -1 !important; }
          .nwh-living { min-height: unset; }
        }
      `}</style>
    </div>
  );
}
