/**
 * Soul Portraits — the practitioner's Return surface (body of work).
 *
 * The "Return" of Create → Steward → Return: the practitioner revisits and sees
 * their portraits accumulating, threaded by subject. Owner-scoped by member — the
 * Grade-A refusal Stage 1 rests on (no unscoped read path). Drafts only; nothing
 * here is published, delivered, or client-facing.
 *
 * Stage 1 / review pilot — internal, practitioner-side of the consent boundary.
 */

import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getCurrentSession } from '@/lib/auth/serverSessions';
import { query } from '@/lib/db/postgres';
import { PractitionerReviewPanel } from '@/components/soulPortrait/PractitionerReviewPanel';

export const dynamic = 'force-dynamic';

interface PortraitRow {
  id: string;
  slug: string;
  portrait_kind: string;
  consent_state: string;
  published_at: string | null;
  created_at: string;
  subject_person_id: string | null;
  subject_name: string | null;
}

const KIND_LABEL: Record<string, string> = {
  gift: 'Gift', self: 'Self', parent_child: 'Parent–child', legacy: 'Legacy',
};

function titleOf(r: PortraitRow): string {
  return r.subject_name || r.slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export default async function SoulPortraitsReturnPage() {
  const session = await getCurrentSession();
  if (!session?.memberId) redirect('/signin');
  const memberId = session.memberId;

  const res = await query<PortraitRow>(
    `SELECT sp.id, sp.slug, sp.portrait_kind, sp.consent_state, sp.published_at,
            sp.created_at, sp.subject_person_id, stp.name AS subject_name
       FROM soul_portraits sp
       LEFT JOIN studio_people stp ON stp.id = sp.subject_person_id
      WHERE sp.owner_member_id = $1
      ORDER BY COALESCE(stp.name, sp.slug) ASC, sp.created_at DESC`,
    [memberId],
  );
  const portraits = res.rows;

  // Thread by subject: linked people group under their name; unlinked drafts gather
  // under one heading. Order: named subjects first (alpha), then the unlinked bucket.
  const groups = new Map<string, { label: string; items: PortraitRow[] }>();
  for (const p of portraits) {
    const key = p.subject_person_id ?? '__unlinked__';
    const label = p.subject_person_id ? (p.subject_name || titleOf(p)) : 'Not linked to a person';
    if (!groups.has(key)) groups.set(key, { label, items: [] });
    groups.get(key)!.items.push(p);
  }
  const ordered = [...groups.values()].sort((a, b) => {
    if (a.label === 'Not linked to a person') return 1;
    if (b.label === 'Not linked to a person') return -1;
    return a.label.localeCompare(b.label);
  });

  return (
    <div className="min-h-screen bg-stone-950 text-stone-200 px-6 py-10">
      <div className="max-w-3xl mx-auto space-y-8">
        <header className="space-y-2">
          <p className="text-xs uppercase tracking-widest text-stone-500">Studio · Soul Portraits</p>
          <h1 className="text-2xl font-light text-stone-100">Your body of work</h1>
          <p className="text-stone-400 text-sm font-light leading-relaxed">
            The portraits you&rsquo;ve created, threaded by who they&rsquo;re about. Every one is a private
            draft — nothing here is published, delivered, or shared. This is your workspace to revisit and refine.
          </p>
          <div className="pt-2">
            <Link
              href="/soul-portrait/generate"
              className="inline-block text-stone-100 hover:text-white text-sm underline underline-offset-4"
            >
              + Create a new portrait
            </Link>
          </div>
        </header>

        {portraits.length === 0 ? (
          <p className="text-stone-500 text-sm font-light italic border-l-2 border-stone-800 pl-4">
            No portraits yet. When you create one, it will appear here — and grow into a body of work as you return.
          </p>
        ) : (
          <div className="space-y-8">
            {ordered.map((g) => (
              <section key={g.label} className="space-y-3">
                <h2 className="text-xs uppercase tracking-widest text-stone-500">{g.label}</h2>
                <ul className="space-y-2">
                  {g.items.map((p) => (
                    <li key={p.id}>
                      <Link
                        href={`/soul-portrait/preview/${p.id}`}
                        className="flex items-baseline justify-between gap-4 border-l-2 border-stone-700 hover:border-stone-500 pl-4 py-2 transition-colors group"
                      >
                        <span className="text-stone-200 group-hover:text-white text-sm font-light">{titleOf(p)}</span>
                        <span className="text-stone-500 text-xs font-light shrink-0">
                          {KIND_LABEL[p.portrait_kind] ?? p.portrait_kind}
                          {' · '}
                          {p.published_at ? 'published' : 'draft'}
                          {' · '}
                          {new Date(p.created_at).toLocaleDateString()}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}

        <div className="border-t border-stone-900 pt-8">
          <PractitionerReviewPanel />
        </div>
      </div>
    </div>
  );
}
