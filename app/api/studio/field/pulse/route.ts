export const dynamic = 'force-dynamic';
export async function generateStaticParams() { return []; }

/**
 * FIELD PULSE — "What is alive right now?"
 *
 * Product principle: Field surfaces what matters; it never creates pressure to act.
 *
 * Aggregates questions and next-edge candidates from:
 * - Active changes (questions[], follow_up_intention)
 * - Active decisions (questions_for_leader[])
 * - Recent threshold events
 * - Current kairos state
 *
 * No new tables. Pure derivation from existing data.
 */

import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db/postgres';
import { getCurrentPractitioner } from '@/lib/auth/getCurrentPractitioner';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface Question {
  id: string;
  source: 'change' | 'decision' | 'threshold';
  sourceId: string;
  sourceTitle: string;
  text: string;
  urgency?: string;
  status: string;
  createdAt: string;
}

interface EdgeCandidate {
  id: string;
  type: 'change' | 'decision';
  title: string;
  description: string;
  reason: string;
  urgency?: string;
  status: string;
  createdAt: string;
  priority: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Priority scoring — governance constants
//
// GOVERNANCE ARTIFACT — not just tuning knobs.
// Each constant protects a specific aspect of Field's posture.
// Change values here; read the worldview comment before changing logic.
// ─────────────────────────────────────────────────────────────────────────────

const IDENTITY_BONUS       = 100;  // naming / draft — identity not yet formed
const STALENESS_BONUS      =  50;  // naming / draft stuck > STALENESS_DAYS
const STALENESS_DAYS       =   3;  // when "stuck" begins for naming/draft

const PARKED_CASTING_BONUS =  25;  // casting forgotten > PARKED_CASTING_DAYS
const PARKED_CASTING_DAYS  =   7;  // when "parked" begins for casting

const HEALTH_WINDOW_DAYS   =  14;  // rolling window for all post-launch metrics

const URGENCY_SCORES: Record<string, number> = {
  acute: 80,
  urgent: 80,
  high: 60,
  medium: 40,
  low: 20,
  none: 0,
};

// Minimum urgency score for the parked-casting nudge to fire.
// If urgency is undeclared, the system treats it as non-signal —
// Field does not manufacture importance.
const PARKED_CASTING_MIN_URGENCY = URGENCY_SCORES.medium; // 40

/**
 * NEXT EDGE SCORING — worldview decision, not optimisation target.
 *
 * Field is a living instrument, not an engagement engine.
 * Next Edge surfaces what is genuinely stuck or unattended,
 * never what is merely recent or numerous.
 *
 * Scoring posture:
 *   naming / draft  → +IDENTITY_BONUS  (identity not yet formed — push it)
 *   casting         → +0 normally; +PARKED_CASTING_BONUS only if parked AND urgent
 *   consulting+     → not in candidate pool (already in motion)
 *
 * Key property: no casting item can outrank a naming/draft item at equal urgency.
 * This is structural, not accidental — do not "optimise" it away.
 *
 * Status enums (source of truth — from migrations):
 *   Changes:   naming → casting → consulting → active → integrating → complete → archived
 *   Decisions: draft → consulting → active → complete → archived
 *
 * Post-launch health metrics (rolling HEALTH_WINDOW_DAYS per practitioner):
 *   1. Casting follow-through: % reaching consulting within PARKED_CASTING_DAYS.
 *      If <70%, urgency defaults or ritual UX needs attention.
 *   2. Next Edge churn: how often the top item changes between refreshes per user/day.
 *      If high, ranking is unstable — check tie-breakers or data volatility.
 *   3. Edge starvation: nextEdge === null while stillAlive.length > 0.
 *      If frequent, candidate pool rules are too strict or urgency defaults are missing.
 *   4. Null-urgency rate at creation: % of changes/decisions created without urgency.
 *      If high, Field appears calm even when work is accumulating — a data-hygiene signal.
 */
function calculatePriority(
  status: string,
  urgency: string | null,
  createdAt: string,
): number {
  let score = 0;
  const urgencyScore = URGENCY_SCORES[urgency || 'none'] || 0;

  // Items still being named/drafted need the most attention
  if (status === 'naming' || status === 'draft') score += IDENTITY_BONUS;

  // Urgency weight
  score += urgencyScore;

  const daysSince =
    (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24);

  // Staleness: items in naming/draft for >STALENESS_DAYS get a nudge
  if ((status === 'naming' || status === 'draft') && daysSince > STALENESS_DAYS) {
    score += STALENESS_BONUS;
  }

  // Parked ritual nudge: casting items stale >PARKED_CASTING_DAYS surface gently,
  // but ONLY if urgency ≥ medium. This prevents forgotten low-signal casts
  // from cluttering a quiet field. Keeps casting below naming/draft at all times.
  if (
    status === 'casting' &&
    daysSince > PARKED_CASTING_DAYS &&
    urgencyScore >= PARKED_CASTING_MIN_URGENCY
  ) {
    score += PARKED_CASTING_BONUS;
  }

  return score;
}

function urgencyRank(urgency: string | null): number {
  return URGENCY_SCORES[urgency || 'none'] || 0;
}

// ─────────────────────────────────────────────────────────────────────────────
// Handler
// ─────────────────────────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  try {
    const identity = await getCurrentPractitioner(request);
    if (!identity) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { practitionerId, memberId } = identity;

    // ── Scope filter (Cut A: field shifts by team/co-lab) ──────────────────
    // Personal scope            → team_id IS NULL
    // Co-lab scope              → team_id = <teamId>
    // Co-lab + includePersonal  → team_id = <teamId> OR team_id IS NULL
    // Only studio_changes / studio_decisions are team-scoped here; threshold_events
    // and state_vectors stay member-scoped (a co-lab has no threshold/state of its own).
    const teamId = request.nextUrl.searchParams.get('teamId') || null;
    const includePersonal = request.nextUrl.searchParams.get('includePersonal') !== 'false'; // default true
    const teamScope: { clause: string; params: string[] } = !teamId
      ? { clause: 'AND team_id IS NULL', params: [] }
      : includePersonal
        ? { clause: 'AND (team_id = $2 OR team_id IS NULL)', params: [teamId] }
        : { clause: 'AND team_id = $2', params: [teamId] };

    // Parallel queries — all from existing tables
    const [changesResult, decisionsResult, thresholdsResult, kairosResult] =
      await Promise.all([
        // Active changes with questions (team-scoped)
        db.query(
          `SELECT id, title, description, questions, follow_up_intention,
                  urgency, status, created_at
           FROM studio_changes
           WHERE practitioner_id = $1
             ${teamScope.clause}
             AND status IN ('naming', 'casting', 'consulting', 'active')
           ORDER BY created_at DESC
           LIMIT 50`,
          [practitionerId, ...teamScope.params],
        ),

        // Active decisions with questions (team-scoped)
        db.query(
          `SELECT id, title, context, questions_for_leader,
                  time_pressure, status, created_at
           FROM studio_decisions
           WHERE practitioner_id = $1
             ${teamScope.clause}
             AND status IN ('draft', 'consulting', 'active')
           ORDER BY created_at DESC
           LIMIT 50`,
          [practitionerId, ...teamScope.params],
        ),

        // Recent threshold events (last 30 days)
        db.query(
          `SELECT id, event_type, summary, intensity, created_at
           FROM threshold_events
           WHERE member_id = $1
             AND created_at >= NOW() - INTERVAL '30 days'
           ORDER BY created_at DESC
           LIMIT 10`,
          [memberId],
        ),

        // Latest kairos reading
        db.query(
          `SELECT kairos_assessment, kairos_description, created_at
           FROM state_vectors
           WHERE member_id = $1
           ORDER BY created_at DESC
           LIMIT 1`,
          [memberId],
        ),
      ]);

    // ─── Extract questions ──────────────────────────────────────────────

    const questions: Question[] = [];

    // From active changes
    for (const change of changesResult.rows) {
      const changeQuestions: string[] = change.questions || [];
      for (let i = 0; i < changeQuestions.length; i++) {
        if (changeQuestions[i]?.trim()) {
          questions.push({
            id: `change-${change.id}-${i}`,
            source: 'change',
            sourceId: change.id,
            sourceTitle: change.title,
            text: changeQuestions[i].trim(),
            urgency: change.urgency,
            status: change.status,
            createdAt: change.created_at,
          });
        }
      }
      if (change.follow_up_intention?.trim()) {
        questions.push({
          id: `change-${change.id}-followup`,
          source: 'change',
          sourceId: change.id,
          sourceTitle: change.title,
          text: change.follow_up_intention.trim(),
          urgency: change.urgency,
          status: change.status,
          createdAt: change.created_at,
        });
      }
    }

    // From active decisions
    for (const decision of decisionsResult.rows) {
      const decisionQuestions: string[] = decision.questions_for_leader || [];
      for (let i = 0; i < decisionQuestions.length; i++) {
        if (decisionQuestions[i]?.trim()) {
          questions.push({
            id: `decision-${decision.id}-${i}`,
            source: 'decision',
            sourceId: decision.id,
            sourceTitle: decision.title,
            text: decisionQuestions[i].trim(),
            urgency: decision.time_pressure,
            status: decision.status,
            createdAt: decision.created_at,
          });
        }
      }
    }

    // From kairos — if at threshold or collapse-risk, that itself is a question
    const latestKairos = kairosResult.rows[0];
    if (
      latestKairos &&
      (latestKairos.kairos_assessment === 'threshold' ||
        latestKairos.kairos_assessment === 'collapse-risk')
    ) {
      questions.push({
        id: 'kairos-current',
        source: 'threshold',
        sourceId: 'current-state',
        sourceTitle: 'Current State',
        text:
          latestKairos.kairos_description || 'Something is crossing. What is it?',
        status: latestKairos.kairos_assessment,
        createdAt: latestKairos.created_at,
      });
    }

    // Sort questions: urgency desc, then recency
    questions.sort((a, b) => {
      const urgDiff = urgencyRank(b.urgency || null) - urgencyRank(a.urgency || null);
      if (urgDiff !== 0) return urgDiff;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    // ─── Compute Next Edge ──────────────────────────────────────────────

    const candidates: EdgeCandidate[] = [];

    // Changes in early status
    for (const change of changesResult.rows) {
      if (change.status === 'naming' || change.status === 'casting') {
        const daysSince =
          (Date.now() - new Date(change.created_at).getTime()) / (1000 * 60 * 60 * 24);
        candidates.push({
          id: change.id,
          type: 'change',
          title: change.title,
          description: change.description,
          reason:
            change.status === 'naming'
              ? daysSince > 3
                ? `In naming phase for ${Math.floor(daysSince)} days — needs attention`
                : 'Still being named'
              : 'Ready for casting',
          urgency: change.urgency,
          status: change.status,
          createdAt: change.created_at,
          priority: calculatePriority(change.status, change.urgency, change.created_at),
        });
      }
    }

    // Decisions in draft
    for (const decision of decisionsResult.rows) {
      if (decision.status === 'draft') {
        const daysSince =
          (Date.now() - new Date(decision.created_at).getTime()) / (1000 * 60 * 60 * 24);
        candidates.push({
          id: decision.id,
          type: 'decision',
          title: decision.title,
          description: decision.context || '',
          reason:
            daysSince > 3
              ? `In draft for ${Math.floor(daysSince)} days — needs attention`
              : 'Waiting for consultation',
          urgency: decision.time_pressure,
          status: decision.status,
          createdAt: decision.created_at,
          priority: calculatePriority(decision.status, decision.time_pressure, decision.created_at),
        });
      }
    }

    // Sort by priority descending, with deterministic tie-breakers
    // (recency then id) to prevent shimmer between equal-scored items
    candidates.sort((a, b) => {
      const priDiff = b.priority - a.priority;
      if (priDiff !== 0) return priDiff;
      const timeDiff = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (timeDiff !== 0) return timeDiff;
      return b.id > a.id ? 1 : b.id < a.id ? -1 : 0;
    });

    const topEdge = candidates[0] || null;
    const alternatives = candidates.slice(1, 4);

    // Strip priority from response (internal scoring detail)
    const cleanEdge = topEdge
      ? {
          id: topEdge.id,
          type: topEdge.type,
          title: topEdge.title,
          description: topEdge.description,
          reason: topEdge.reason,
          urgency: topEdge.urgency,
          status: topEdge.status,
          createdAt: topEdge.createdAt,
        }
      : null;

    const cleanAlternatives = alternatives.map(({ priority: _p, ...rest }) => rest);

    return NextResponse.json({
      stillAlive: { questions },
      nextEdge: {
        item: cleanEdge,
        alternatives: cleanAlternatives,
      },
    });
  } catch (error) {
    console.error('[Field Pulse] GET error:', error);
    return NextResponse.json(
      { error: 'Failed to load field pulse' },
      { status: 500 },
    );
  }
}
