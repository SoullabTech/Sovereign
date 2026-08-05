'use client';

/**
 * Now What? — the Practice Workspace. The field holder's own room.
 *
 * Familiar doorway, different room. The nouns are the ones any practitioner
 * already carries — Doors, Sessions, Commitments, Notes — but they behave
 * differently here:
 *
 *   Sessions     are not meeting history      → what has happened in the relationship
 *   Commitments  are not tasks assigned       → what we are tending together
 *   Notes        are not documentation        → what helps continuity
 *
 * What this room deliberately does NOT contain, because each one changes the
 * relationship rather than supporting it: progress percentages, completion
 * states, rankings, scores, "insights" presented as truth, diagnoses, or
 * suggested next steps framed as decisions.
 *
 * The load-bearing element is the closing band. A practitioner does not need
 * to understand the access model; they need to correctly answer "what is mine
 * to accompany, and what is intentionally not mine?" That is role legibility,
 * and it is not a privacy explainer — it names the relationship, not the
 * mechanism.
 *
 * Live data: the doors, from the field the member holds. Everything else is
 * named and empty on purpose. Absence of features is not unfinishedness — the
 * first version is powerful precisely because it shows the boundary.
 */

import { useEffect, useState, Suspense } from 'react';
import { apiFetch } from '@/lib/http/apiBase';
import { NowWhatShell, NowWhatThreshold, useMemberSession } from '@/components/now-what/NowWhatShell';

interface Program {
  program_slug: string;
  kind: string;
  title: string;
  current_focal_point: string | null;
}

const KIND_LABELS: Record<string, string> = {
  coaching: 'One to one',
  workshop: 'Group',
  course: 'Course',
  retreat: 'Retreat',
};

/** A named section that is honestly empty. The copy says what will live here. */
function Held({ eyebrow, children }: { eyebrow: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3 [&:not(:first-child)]:mt-6">
      <h2 className="text-[11px] uppercase tracking-[0.3em] text-slate-400 mb-3">{eyebrow}</h2>
      {children}
    </section>
  );
}

function PracticeWorkspace() {
  const [programs, setPrograms] = useState<Program[] | null>(null);
  const [fieldSlug, setFieldSlug] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await apiFetch('/api/practitioner/programs');
        if (!res.ok) {
          if (!cancelled) setError(res.status === 403
            ? 'This room belongs to the field holder.'
            : 'Could not open the room right now.');
          return;
        }
        const data = await res.json();
        if (cancelled) return;
        setPrograms(data.programs ?? []);
        setFieldSlug(data.fieldSlug ?? null);
      } catch {
        if (!cancelled) setError('Could not open the room right now.');
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const ctx = fieldSlug ? `?fieldContext=${encodeURIComponent(fieldSlug)}` : '';

  return (
    <div className="min-h-screen bg-[#1f1b16] text-slate-200">
      <NowWhatShell current="Practice" fieldContext={fieldSlug ?? undefined} />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_35%_at_50%_0%,rgba(196,164,110,0.08),transparent_70%)]" />

      <div className="relative max-w-2xl mx-auto px-4 py-10 space-y-6">
        <header>
          <h1 className="text-slate-100 text-2xl font-extralight tracking-wide mb-2">Your practice</h1>
          <p className="text-slate-400 text-sm font-light leading-relaxed">
            The people you are supporting, and the work that is alive between conversations.
          </p>
        </header>

        {error && <p className="text-red-400 text-sm font-light">{error}</p>}

        {/* ── Doors — the only live data in this slice ───────────────────── */}
        <Held eyebrow="Doors">
          {programs === null && !error && (
            <p className="text-slate-500 text-sm font-light">Opening…</p>
          )}
          {programs?.length === 0 && (
            <p className="text-slate-500 text-sm font-light leading-relaxed">
              No doors yet. A door is how someone arrives already knowing what you are doing together.
            </p>
          )}
          {programs && programs.length > 0 && (
            <div className="relative rounded-xl border border-white/10 p-6 bg-gradient-to-b from-white/[0.06] to-white/[0.02] shadow-[0_0_50px_rgba(255,226,122,0.07)]">
              <ul className="relative border-l border-[#ffe27a]/25 pl-5 space-y-4">
                {programs.map((p) => (
                  <li key={p.program_slug} className="relative">
                    <span className="absolute -left-[23px] top-1.5 w-1.5 h-1.5 rounded-full bg-[#ffe27a]/80 shadow-[0_0_10px_rgba(255,226,122,0.55)]" />
                    <div className="text-slate-100 text-sm font-light leading-relaxed">
                      {p.title}
                      <span className="ml-2 text-slate-500 text-xs uppercase tracking-widest">
                        {KIND_LABELS[p.kind] ?? p.kind}
                      </span>
                    </div>
                    {p.current_focal_point && (
                      <div className="text-slate-400 text-sm font-light leading-relaxed">
                        {p.current_focal_point}
                      </div>
                    )}
                    <a
                      href={`/now-what/room${ctx}${ctx ? '&' : '?'}program=${encodeURIComponent(p.program_slug)}`}
                      className="text-[#ffe27a]/70 text-xs font-light hover:text-[#ffe27a] transition-colors"
                    >
                      open this door
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Held>

        {/* ── The other nouns: named, honestly empty ─────────────────────── */}
        <Held eyebrow="Sessions">
          <p className="text-slate-500 text-sm font-light leading-relaxed">
            What has happened in the relationship. Nothing yet.
          </p>
        </Held>

        <Held eyebrow="Commitments">
          <p className="text-slate-500 text-sm font-light leading-relaxed">
            What you are tending together. Nothing yet.
          </p>
        </Held>

        <Held eyebrow="Notes">
          <p className="text-slate-500 text-sm font-light leading-relaxed">
            Your own notes, for continuity. Yours alone — the people you work with never see these.
          </p>
        </Held>

        {/* ── Role legibility. Names the relationship, not the mechanism. ── */}
        <div className="relative rounded-xl border border-white/10 p-6 bg-gradient-to-b from-white/[0.06] to-white/[0.02] mt-10">
          <h2 className="text-[11px] uppercase tracking-[0.3em] text-slate-400 mb-4">
            What this room is for
          </h2>
          <ul className="space-y-2 text-slate-100 text-sm font-light leading-relaxed">
            <li>You can accompany.</li>
            <li>You can prepare.</li>
            <li>You can reflect on the work between you.</li>
          </ul>
          <p className="text-slate-400 text-sm font-light leading-relaxed mt-4">
            What each person carries in their own field stays theirs. They choose, item by item,
            what is ever shared with you — and nothing is, by default.
          </p>
          <p className="relative text-slate-600 text-sm font-light italic pt-4">
            Their inner work is not yours to hold. That is what makes it safe for them to do it here.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function PracticePage() {
  const session = useMemberSession();
  if (session === 'unknown') {
    return <div className="min-h-screen bg-[#1f1b16]" />;
  }
  if (session === 'out') {
    return (
      <NowWhatThreshold
        roomName="Your practice"
        line="The people you are supporting, and the work that is alive between conversations."
      />
    );
  }
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#1f1b16]" />}>
      <PracticeWorkspace />
    </Suspense>
  );
}
