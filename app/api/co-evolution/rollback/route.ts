// API Route: Rollback to previous config version (admin only)
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { pool } from "@/lib/db/postgres";

const BodySchema = z.object({
  configType: z.enum(["relational_profile", "router_weights", "spiralogic_rule", "agent_coordination", "phase_thresholds"]),
  configKey: z.string().min(1), // e.g., "member:user123", "global"
  versionId: z.string().uuid(), // config_versions.id
});

function requireAdmin(req: NextRequest) {
  const expected = process.env.COEVO_ADMIN_KEY;
  if (!expected) throw new Error("Missing COEVO_ADMIN_KEY");
  const got = req.headers.get("x-admin-key");
  if (!got || got !== expected) {
    return { ok: false as const, status: 401, message: "Unauthorized" };
  }
  return { ok: true as const };
}

export async function POST(req: NextRequest) {
  const auth = requireAdmin(req);
  if (!auth.ok) return NextResponse.json({ ok: false, error: auth.message }, { status: auth.status });

  const json = await req.json().catch(() => null);
  const parsed = BodySchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ ok: false, error: parsed.error.flatten() }, { status: 400 });

  const { configType, configKey, versionId } = parsed.data;

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Deactivate current
    await client.query(
      `UPDATE config_versions
       SET active=false, deactivated_at=NOW()
       WHERE config_type=$1 AND config_key=$2 AND active=true`,
      [configType, configKey]
    );

    // Activate target
    const { rows } = await client.query<{ config_snapshot: any }>(
      `UPDATE config_versions
       SET active=true, activated_at=NOW()
       WHERE id=$1 AND config_type=$2 AND config_key=$3
       RETURNING config_snapshot`,
      [versionId, configType, configKey]
    );

    if (!rows[0]) throw new Error("Version not found for rollback");

    const snap = rows[0].config_snapshot;

    // Apply snapshot back onto live config
    if (configType === "relational_profile") {
      // Extract member_id from config_key (format: "member:user123")
      const memberId = configKey.replace("member:", "");

      await client.query(
        `UPDATE relational_profiles
         SET
           warmth_precision=$2,
           gentle_direct=$3,
           spacious_efficient=$4,
           reflective_actionable=$5,
           mythic_plainspoken=$6,
           autonomy_coaching=$7,
           emotional_attunement=$8,
           ritual_density=$9,
           agent_weights=$10::jsonb,
           updated_at=NOW()
         WHERE member_id=$1`,
        [
          memberId,
          snap.warmth_precision,
          snap.gentle_direct,
          snap.spacious_efficient,
          snap.reflective_actionable,
          snap.mythic_plainspoken,
          snap.autonomy_coaching,
          snap.emotional_attunement,
          snap.ritual_density,
          JSON.stringify(snap.agent_weights ?? {}),
        ]
      );
    } else if (configType === "router_weights") {
      // configKey is "global" for simplicity
      const { rows: rw } = await client.query<{ id: string }>(
        `SELECT id FROM router_weights WHERE scope='global' AND active=true LIMIT 1`
      );
      if (!rw[0]) throw new Error("No active global router_weights row");

      await client.query(
        `UPDATE router_weights
         SET facet_weights=$2::jsonb,
             agent_priority=$3::jsonb,
             updated_at=NOW()
         WHERE id=$1`,
        [rw[0].id, JSON.stringify(snap.facet_weights ?? {}), JSON.stringify(snap.agent_priority ?? {})]
      );
    } else {
      throw new Error(`Rollback apply not implemented for ${configType}`);
    }

    await client.query("COMMIT");
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    await client.query("ROLLBACK");
    console.error("[co-evolution/rollback] Error:", error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  } finally {
    client.release();
  }
}
