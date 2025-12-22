// API Route: Approve improvement candidate (admin only)
import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db/postgres";

type Candidate = {
  id: string;
  change_type: "relational_profile" | "router_weight" | "spiralogic_rule" | "agent_coordination" | "phase_threshold";
  scope: "member" | "cohort" | "global" | "core";
  scope_id: string | null;
  risk_class: "safe" | "guarded" | "core";
  status: "proposed" | "testing" | "deployed" | "rejected" | "rolled_back";
  proposed_config: any;
};

function requireAdmin(req: NextRequest) {
  const expected = process.env.COEVO_ADMIN_KEY;
  if (!expected) throw new Error("Missing COEVO_ADMIN_KEY");
  const got = req.headers.get("x-admin-key");
  if (!got || got !== expected) {
    return { ok: false as const, status: 401, message: "Unauthorized" };
  }
  return { ok: true as const };
}

async function applyCandidate(client: any, c: Candidate) {
  if (c.change_type === "relational_profile") {
    if (!c.scope_id) throw new Error("Missing scope_id for relational_profile");

    await client.query(
      `UPDATE relational_profiles
       SET
         warmth_precision = COALESCE($2, warmth_precision),
         gentle_direct = COALESCE($3, gentle_direct),
         spacious_efficient = COALESCE($4, spacious_efficient),
         reflective_actionable = COALESCE($5, reflective_actionable),
         mythic_plainspoken = COALESCE($6, mythic_plainspoken),
         autonomy_coaching = COALESCE($7, autonomy_coaching),
         emotional_attunement = COALESCE($8, emotional_attunement),
         ritual_density = COALESCE($9, ritual_density),
         agent_weights = COALESCE($10::jsonb, agent_weights),
         version = version + 1,
         last_auto_update = NOW(),
         updated_at = NOW()
       WHERE member_id = $1`,
      [
        c.scope_id,
        c.proposed_config?.warmth_precision ?? null,
        c.proposed_config?.gentle_direct ?? null,
        c.proposed_config?.spacious_efficient ?? null,
        c.proposed_config?.reflective_actionable ?? null,
        c.proposed_config?.mythic_plainspoken ?? null,
        c.proposed_config?.autonomy_coaching ?? null,
        c.proposed_config?.emotional_attunement ?? null,
        c.proposed_config?.ritual_density ?? null,
        c.proposed_config?.agent_weights ? JSON.stringify(c.proposed_config.agent_weights) : null,
      ]
    );
    return;
  }

  if (c.change_type === "router_weight") {
    // global scoped for now (simple)
    const { rows } = await client.query<{ id: string; version: number }>(
      `SELECT id, version
       FROM router_weights
       WHERE scope='global' AND active=true
       LIMIT 1`
    );
    if (!rows[0]) throw new Error("No active global router_weights row");

    await client.query(
      `UPDATE router_weights
       SET facet_weights = COALESCE($2::jsonb, facet_weights),
           agent_priority = COALESCE($3::jsonb, agent_priority),
           version = version + 1,
           updated_at = NOW()
       WHERE id = $1`,
      [
        rows[0].id,
        c.proposed_config?.facet_weights ? JSON.stringify(c.proposed_config.facet_weights) : null,
        c.proposed_config?.agent_priority ? JSON.stringify(c.proposed_config.agent_priority) : null,
      ]
    );
    return;
  }

  // CORE changes handled after replay/certification elsewhere
  throw new Error(`applyCandidate: unsupported change_type ${c.change_type}`);
}

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const auth = requireAdmin(req);
  if (!auth.ok) return NextResponse.json({ ok: false, error: auth.message }, { status: auth.status });

  const { id } = await ctx.params;

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const { rows } = await client.query<Candidate>(
      `SELECT id, change_type, scope, scope_id, risk_class, status, proposed_config
       FROM improvement_candidates
       WHERE id = $1
       LIMIT 1`,
      [id]
    );
    const c = rows[0];
    if (!c) throw new Error("Candidate not found");

    // CORE must be in testing (certified) before approval
    if (c.risk_class === "core" && c.status !== "testing") {
      throw new Error("CORE candidate must be 'testing' (certified) before approval");
    }

    if (c.risk_class === "guarded") {
      // mark approved + launch canary
      await client.query(
        `UPDATE improvement_candidates
         SET status='approved', approved_by='admin', approved_at=NOW()
         WHERE id=$1`,
        [id]
      );

      await client.query(
        `INSERT INTO canary_deployments (
           improvement_candidate_id, scope, percentage, rollback_threshold, started_at
         ) VALUES ($1, $2, $3, $4::jsonb, NOW())`,
        [id, "global", 0.10, JSON.stringify({ avg_score_drop: 0.03, unresolved_rate_increase: 0.10 })],
      );

      await client.query("COMMIT");
      return NextResponse.json({ ok: true, mode: "canary" });
    }

    // SAFE auto-apply immediately
    await client.query(
      `UPDATE improvement_candidates
       SET status='approved', approved_by='admin', approved_at=NOW()
       WHERE id=$1`,
      [id]
    );

    await applyCandidate(client, c);

    await client.query(
      `UPDATE improvement_candidates
       SET deployed_at=NOW()
       WHERE id=$1`,
      [id]
    );

    await client.query("COMMIT");
    return NextResponse.json({ ok: true, mode: "applied" });
  } catch (error: any) {
    await client.query("ROLLBACK");
    console.error("[co-evolution/improvements/approve] Error:", error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  } finally {
    client.release();
  }
}
