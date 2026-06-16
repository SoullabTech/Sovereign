export const dynamic = 'force-dynamic';
export async function generateStaticParams() { return []; }

/**
 * FIELD PULSE — the Orientation Floor (Slice 1)
 *
 * The Personal Field as an orientation space, not a portal to tools.
 * See docs/specs/PERSONAL_FIELD_REDESIGN_2026-06-15.md §0.5.
 *
 * The floor surfaces the person's OWN authored content through four questions.
 * It never computes significance: no priority score, no ranking, no "top" item.
 *   alive    → your open questions
 *   asking   → items YOU flagged high-urgency (person-set), shown with the date as a fact
 *   emerging → what you've recently begun (naming / casting / draft)
 *   tending  → what you're actively working (consulting / active)
 *
 * Ordering is transparent (the urgency you set, then recency). Every item is
 * traceable to something you authored, so the four-question review holds:
 *   why shown?                → it is your content, matching this question
 *   why NOT shown?            → you haven't authored it, or it doesn't match the question
 *   how ordered?              → the urgency you set, then recency
 *   who decided significance? → you did
 *
 * Intentionally NOT surfaced in v1: system-inferred state (kairos / state_vectors)
 * and detected events (threshold_events). The floor holds room for the person's
 * own attention; it does not contribute the system's inferences. (Deep-responsive
 * — remembering revealed attention over time — is a later slice, gated on continuity.)
 *
 * No new tables. Pure derivation from studio_changes + studio_decisions.
 */

import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db/postgres';
import { getCurrentPractitioner } from '@/lib/auth/getCurrentPractitioner';

type Source = 'change' | 'decision';

interface FloorItem {
  id: string;
  source: Source;
  sourceId: string;
  title: string;     // the surfaced text — a question, or the item's own title
  context?: string;  // transparent attribution only — never a significance claim
  href: string;
  createdAt: string;
}

// Person-set urgency → a rank for TRANSPARENT ORDERING ONLY. These labels are
// assigned by the person; the system never invents or weights significance.
const URGENCY_RANK: Record<string, number> = {
  acute: 5, urgent: 5, high: 4, medium: 3, low: 2, none: 1,
};
const rank = (u: string | null | undefined) => URGENCY_RANK[u || 'none'] || 1;

// "Asking" = items the person THEMSELVES marked high-urgency or above.
const ASKING_MIN_RANK = URGENCY_RANK.high; // 4

function daysSince(iso: string): number {
  return Math.floor((Date.now() - new Date(iso).getTime()) / (1000 * 60 * 60 * 24));
}

export async function GET(request: NextRequest) {
  try {
    const identity = await getCurrentPractitioner(request);
    if (!identity) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { practitionerId } = identity;

    // ── Scope (Cut A): personal = team_id IS NULL; co-lab = team_id = $2 ──
    const teamId = request.nextUrl.searchParams.get('teamId') || null;
    const includePersonal =
      request.nextUrl.searchParams.get('includePersonal') !== 'false'; // default true
    const teamScope: { clause: string; params: string[] } = !teamId
      ? { clause: 'AND team_id IS NULL', params: [] }
      : includePersonal
        ? { clause: 'AND (team_id = $2 OR team_id IS NULL)', params: [teamId] }
        : { clause: 'AND team_id = $2', params: [teamId] };

    const [changesResult, decisionsResult] = await Promise.all([
      db.query(
        `SELECT id, title, questions, follow_up_intention, urgency, status, created_at
           FROM studio_changes
          WHERE practitioner_id = $1 ${teamScope.clause}
            AND status IN ('naming','casting','consulting','active')
          ORDER BY created_at DESC
          LIMIT 50`,
        [practitionerId, ...teamScope.params],
      ),
      db.query(
        `SELECT id, title, questions_for_leader, time_pressure, status, created_at
           FROM studio_decisions
          WHERE practitioner_id = $1 ${teamScope.clause}
            AND status IN ('draft','consulting','active')
          ORDER BY created_at DESC
          LIMIT 50`,
        [practitionerId, ...teamScope.params],
      ),
    ]);

    const changes = changesResult.rows;
    const decisions = decisionsResult.rows;

    const byRecency = (a: FloorItem, b: FloorItem) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();

    // ── alive: your open questions (person-authored text) ──────────────
    // carries person-set urgency for transparent ordering; stripped before response
    const aliveRaw: (FloorItem & { urgency: string | null })[] = [];
    for (const c of changes) {
      const qs: string[] = c.questions || [];
      for (let i = 0; i < qs.length; i++) {
        const t = qs[i]?.trim();
        if (t) aliveRaw.push({ id: `change-${c.id}-q${i}`, source: 'change', sourceId: c.id, title: t, context: c.title, href: '/studio/changes', createdAt: c.created_at, urgency: c.urgency });
      }
      if (c.follow_up_intention?.trim()) {
        aliveRaw.push({ id: `change-${c.id}-followup`, source: 'change', sourceId: c.id, title: c.follow_up_intention.trim(), context: c.title, href: '/studio/changes', createdAt: c.created_at, urgency: c.urgency });
      }
    }
    for (const d of decisions) {
      const qs: string[] = d.questions_for_leader || [];
      for (let i = 0; i < qs.length; i++) {
        const t = qs[i]?.trim();
        if (t) aliveRaw.push({ id: `decision-${d.id}-q${i}`, source: 'decision', sourceId: d.id, title: t, context: d.title, href: '/studio/decisions', createdAt: d.created_at, urgency: d.time_pressure });
      }
    }
    aliveRaw.sort((a, b) => {
      const diff = rank(b.urgency) - rank(a.urgency); // the urgency YOU set
      if (diff !== 0) return diff;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    const alive: FloorItem[] = aliveRaw.map(({ urgency: _urgency, ...rest }) => rest);

    // ── asking: items YOU marked high-urgency or above (person-set) ────
    const asking: FloorItem[] = [];
    for (const c of changes) {
      if (rank(c.urgency) >= ASKING_MIN_RANK) {
        const ds = daysSince(c.created_at);
        asking.push({ id: `asking-change-${c.id}`, source: 'change', sourceId: c.id, title: c.title, context: ds > 0 ? `you marked this ${c.urgency} · ${ds}d ago` : `you marked this ${c.urgency}`, href: '/studio/changes', createdAt: c.created_at });
      }
    }
    for (const d of decisions) {
      if (rank(d.time_pressure) >= ASKING_MIN_RANK) {
        const ds = daysSince(d.created_at);
        asking.push({ id: `asking-decision-${d.id}`, source: 'decision', sourceId: d.id, title: d.title, context: ds > 0 ? `you marked this ${d.time_pressure} · ${ds}d ago` : `you marked this ${d.time_pressure}`, href: '/studio/decisions', createdAt: d.created_at });
      }
    }
    asking.sort(byRecency);

    // ── emerging: what you've recently begun (naming / casting / draft) ─
    const emerging: FloorItem[] = [];
    for (const c of changes) {
      if (c.status === 'naming' || c.status === 'casting') {
        emerging.push({ id: `emerging-change-${c.id}`, source: 'change', sourceId: c.id, title: c.title, context: c.status === 'naming' ? 'still being named' : 'casting', href: '/studio/changes', createdAt: c.created_at });
      }
    }
    for (const d of decisions) {
      if (d.status === 'draft') {
        emerging.push({ id: `emerging-decision-${d.id}`, source: 'decision', sourceId: d.id, title: d.title, context: 'in draft', href: '/studio/decisions', createdAt: d.created_at });
      }
    }
    emerging.sort(byRecency);

    // ── tending: what you're actively working (consulting / active) ────
    const tending: FloorItem[] = [];
    for (const c of changes) {
      if (c.status === 'consulting' || c.status === 'active') {
        tending.push({ id: `tending-change-${c.id}`, source: 'change', sourceId: c.id, title: c.title, context: c.status, href: '/studio/changes', createdAt: c.created_at });
      }
    }
    for (const d of decisions) {
      if (d.status === 'consulting' || d.status === 'active') {
        tending.push({ id: `tending-decision-${d.id}`, source: 'decision', sourceId: d.id, title: d.title, context: d.status, href: '/studio/decisions', createdAt: d.created_at });
      }
    }
    tending.sort(byRecency);

    return NextResponse.json({ alive, asking, emerging, tending });
  } catch (error) {
    console.error('[Field Floor] GET error:', error);
    return NextResponse.json({ error: 'Failed to load field' }, { status: 500 });
  }
}
