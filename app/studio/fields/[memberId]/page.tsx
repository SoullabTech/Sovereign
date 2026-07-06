/**
 * Studio — Living Field facilitator view.
 *
 * A practitioner's read of a member's Vision Studio field evidence, organized by
 * Spiralogic phase. Surfaces member-authored threads in the order they were
 * carried — no interpretation, no profile, no conclusions. The practitioner
 * sees what the participant chose to carry, organized by where in the arc it arose.
 *
 * Governance note: threads surface here only because can_be_shown_to_practitioner
 * was set TRUE at save time (explicit practitioner-facilitated context, per
 * Vision Studio field-note route). This is the consented facilitator view.
 */

import { notFound, redirect } from 'next/navigation';
import { query } from '@/lib/db/postgres';
import { getCurrentSession } from '@/lib/auth/serverSessions';
import Link from 'next/link';

const PHASE_ORDER = [
  'fire_1', 'fire_2', 'fire_3',
  'water_1', 'water_2', 'water_3',
  'earth_1', 'earth_2', 'earth_3',
  'air_1', 'air_2', 'air_3',
  'aether_1', 'aether_2', 'aether_3',
  'unsolicited', 'closure',
];

const PHASE_LABELS: Record<string, string> = {
  fire_1: 'Fire I — Vision',
  fire_2: 'Fire II — Expression',
  fire_3: 'Fire III — Illumination',
  water_1: 'Water I — Feeling',
  water_2: 'Water II — Transformation',
  water_3: 'Water III — Inner Wisdom',
  earth_1: 'Earth I — Grounding',
  earth_2: 'Earth II — Building',
  earth_3: 'Earth III — Embodiment',
  air_1: 'Air I — Understanding',
  air_2: 'Air II — Dialogue',
  air_3: 'Air III — Contribution',
  aether_1: 'Aether I — Mystery',
  aether_2: 'Aether II — Vocation',
  aether_3: 'Aether III — Presence',
  unsolicited: 'Unsolicited — Between Sessions',
  closure: 'Closure — What Surprised',
};

interface Thread {
  id: string;
  title: string;
  authorship: string;
  member_decision: string | null;
  spiralogic_phase: string | null;
  created_at: string;
}

interface Member {
  id: string;
  name: string;
  username: string;
}

async function getFieldEvidence(memberId: string): Promise<Thread[]> {
  const res = await query<Thread>(
    `SELECT id, title, authorship, member_decision, spiralogic_phase, created_at
       FROM member_field_note_threads
      WHERE member_id = $1
        AND released_at IS NULL
        AND can_be_shown_to_practitioner = TRUE
      ORDER BY
        CASE WHEN spiralogic_phase IS NULL THEN 1 ELSE 0 END,
        created_at ASC
      LIMIT 500`,
    [memberId],
  );
  return res.rows;
}

async function getMember(memberId: string): Promise<Member | null> {
  const res = await query<Member>(
    `SELECT id, name, username FROM members WHERE id = $1 LIMIT 1`,
    [memberId],
  );
  return res.rows[0] ?? null;
}

export default async function FieldFacilitatorPage({
  params,
  searchParams,
}: {
  params: { memberId: string };
  searchParams: { fieldContext?: string };
}) {
  const session = await getCurrentSession();
  if (!session?.memberId) {
    return (
      <div className="p-8 text-stone-400 text-sm">
        Sign in to view field evidence.
      </div>
    );
  }

  // Gate: only active practitioners may view another member's field evidence.
  const practitionerCheck = await query(
    `SELECT id FROM practitioners WHERE member_id = $1 AND status = 'active' LIMIT 1`,
    [session.memberId],
  );
  if (practitionerCheck.rows.length === 0) {
    redirect('/studio');
  }

  const [threads, member] = await Promise.all([
    getFieldEvidence(params.memberId),
    getMember(params.memberId),
  ]);

  if (!member) return notFound();

  // Group by phase, preserving PHASE_ORDER
  const byPhase: Record<string, Thread[]> = {};
  for (const t of threads) {
    const key = t.spiralogic_phase ?? 'no_phase';
    if (!byPhase[key]) byPhase[key] = [];
    byPhase[key].push(t);
  }

  const orderedPhases = [
    ...PHASE_ORDER.filter(p => byPhase[p]),
    ...Object.keys(byPhase).filter(k => !PHASE_ORDER.includes(k) && byPhase[k]),
  ];

  const totalThreads = threads.length;

  return (
    <div className="min-h-screen bg-stone-950 text-stone-200">
      <div className="max-w-2xl mx-auto px-6 py-12 space-y-10">
        {/* Header */}
        <div className="space-y-2">
          <Link href="/studio" className="text-stone-600 text-xs hover:text-stone-400 underline underline-offset-2">
            ← Studio
          </Link>
          <h1 className="text-lg font-light text-stone-200">{member.name}</h1>
          <p className="text-stone-500 text-sm font-light">Living Field — Facilitator View</p>
        </div>

        {/* Field summary */}
        <div className="text-stone-500 text-xs font-light space-y-1">
          <p>{totalThreads} thread{totalThreads === 1 ? '' : 's'} in the field</p>
          <p>{orderedPhases.length} phase{orderedPhases.length === 1 ? '' : 's'} active</p>
          {searchParams.fieldContext && (
            <p>Field: {searchParams.fieldContext}</p>
          )}
        </div>

        {/* Vision Studio link for this member */}
        <div className="text-stone-600 text-xs font-light">
          <p>Share with {member.name}:</p>
          <code className="text-stone-500">
            /maia/vision-studio?fieldContext={member.id.slice(0, 8)}
          </code>
        </div>

        {totalThreads === 0 ? (
          <div className="py-12 text-center">
            <p className="text-stone-600 text-sm font-light italic">
              No threads in the field yet. {member.name} has not yet carried anything from a Vision Studio session.
            </p>
          </div>
        ) : (
          <div className="space-y-10">
            {orderedPhases.map(phase => {
              const phaseThreads = byPhase[phase] ?? [];
              const label = PHASE_LABELS[phase] ?? phase;
              return (
                <section key={phase} className="space-y-4">
                  <div className="flex items-baseline gap-3">
                    <h2 className="text-xs uppercase tracking-widest text-stone-500">{label}</h2>
                    <span className="text-stone-700 text-xs">{phaseThreads.length}</span>
                  </div>
                  <ul className="space-y-3">
                    {phaseThreads.map(t => (
                      <li key={t.id} className="border-l-2 border-stone-800 pl-4 space-y-1">
                        <p className="text-stone-200 text-sm font-light leading-relaxed">{t.title}</p>
                        <div className="flex gap-3 text-xs text-stone-600">
                          <span>{t.authorship === 'member_authored' ? 'member-authored' : 'member-confirmed'}</span>
                          <span>{new Date(t.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </section>
              );
            })}
          </div>
        )}

        {/* Facilitation guidance */}
        <div className="border-t border-stone-900 pt-8 space-y-3 text-stone-600 text-xs font-light leading-relaxed">
          <p>What you see here is what {member.name} chose to carry — not a transcript, not an assessment, not a profile.</p>
          <p>Threads marked "member-authored" were originated by them directly. Threads marked "member-confirmed" were proposed by MAIA and kept.</p>
          <p>The field accumulates. The in-person interview follows what has become alive in it.</p>
        </div>
      </div>
    </div>
  );
}
