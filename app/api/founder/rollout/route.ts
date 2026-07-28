export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import type { RolloutSummary, PipelineStage } from '@/lib/founder/types';
import { requireFounder } from '@/lib/founder/founderAuth';

const PIPELINE_STAGES: PipelineStage[] = ['new', 'contacted', 'exploring', 'committed', 'active', 'churned'];

export async function GET() {
  // Founder authorization is enforced HERE, not only in middleware. Middleware is
  // routing/UX defence; this handler must reject an unauthorized caller reached
  // directly. See lib/founder/founderAuth (verified session + server-held allowlist,
  // fails closed when FOUNDER_MEMBER_IDS is unset).
  const __auth = await requireFounder();
  if (!__auth.ok) {
    return NextResponse.json({ error: __auth.error }, { status: __auth.status });
  }
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ error: 'Not available in static build' }, { status: 501 });
  }

  try {
    const [funnelResult, stalledResult, recentResult] = await Promise.all([
      // Funnel: count beta_testers by pipeline stage
      query(
        `SELECT pipeline_stage, COUNT(*) as count
         FROM ops_contacts
         WHERE deleted_at IS NULL AND contact_type = 'beta_tester'
         GROUP BY pipeline_stage
         ORDER BY
           CASE pipeline_stage
             WHEN 'new' THEN 0 WHEN 'contacted' THEN 1 WHEN 'exploring' THEN 2
             WHEN 'committed' THEN 3 WHEN 'active' THEN 4 WHEN 'churned' THEN 5
           END`,
      ),
      // Stalled: beta_testers with no contact in 7+ days, not active/churned
      query(
        `SELECT id, name, email, contact_type, pipeline_stage, source, intent, member_id, notes, last_contacted, next_action, next_action_date, metadata, deleted_at, created_at, updated_at
         FROM ops_contacts
         WHERE deleted_at IS NULL
           AND contact_type = 'beta_tester'
           AND pipeline_stage NOT IN ('active', 'churned')
           AND (last_contacted IS NULL OR last_contacted < NOW() - INTERVAL '7 days')
         ORDER BY last_contacted ASC NULLS FIRST
         LIMIT 20`,
      ),
      // Recent activations: beta_testers who reached 'active' in last 30 days
      query(
        `SELECT id, name, email, contact_type, pipeline_stage, source, intent, member_id, notes, last_contacted, next_action, next_action_date, metadata, deleted_at, created_at, updated_at
         FROM ops_contacts
         WHERE deleted_at IS NULL
           AND contact_type = 'beta_tester'
           AND pipeline_stage = 'active'
           AND updated_at > NOW() - INTERVAL '30 days'
         ORDER BY updated_at DESC
         LIMIT 10`,
      ),
    ]);

    // Fill in missing stages with 0
    const funnelMap = new Map(funnelResult.rows.map((r: { pipeline_stage: string; count: string }) => [r.pipeline_stage, Number(r.count)]));
    const funnel = PIPELINE_STAGES.map(stage => ({
      stage,
      count: funnelMap.get(stage) || 0,
    }));

    const summary: RolloutSummary = {
      funnel,
      stalled: stalledResult.rows,
      recent_activations: recentResult.rows,
    };

    return NextResponse.json(summary);
  } catch (err) {
    console.error('[founder/rollout] GET error:', err);
    return NextResponse.json({ error: 'Failed to fetch rollout data' }, { status: 500 });
  }
}
