// API Route: Get and update relational profiles
import { NextResponse } from "next/server";
import { z } from "zod";
import { pool } from "@/lib/db/postgres";

const GetSchema = z.object({ userId: z.string().min(1) });

const PutSchema = z.object({
  userId: z.string().min(1),
  patch: z.object({
    warmth_precision: z.number().optional(),
    gentle_direct: z.number().optional(),
    spacious_efficient: z.number().optional(),
    reflective_actionable: z.number().optional(),
    mythic_plainspoken: z.number().optional(),
    autonomy_coaching: z.number().optional(),
    emotional_attunement: z.number().optional(),
    ritual_density: z.number().optional(),
    agent_weights: z.any().optional(),
  }),
});

const clamp01 = (x: number) => Math.max(0, Math.min(1, x));

export async function GET(req: Request) {
  const url = new URL(req.url);
  const parsed = GetSchema.safeParse({ userId: url.searchParams.get("userId") });
  if (!parsed.success) return NextResponse.json({ ok: false }, { status: 400 });

  const { userId } = parsed.data;

  const client = await pool.connect();
  try {
    // Ensure profile exists
    await client.query(
      `INSERT INTO relational_profiles (member_id)
       VALUES ($1)
       ON CONFLICT (member_id) DO NOTHING`,
      [userId]
    );

    const { rows } = await client.query(
      `SELECT *
       FROM relational_profiles
       WHERE member_id = $1`,
      [userId]
    );

    return NextResponse.json({ ok: true, profile: rows[0] });
  } catch (error: any) {
    console.error("[co-evolution/relational-profile GET] Error:", error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  } finally {
    client.release();
  }
}

export async function PUT(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = PutSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: parsed.error.flatten() }, { status: 400 });
  }

  const { userId, patch } = parsed.data;

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Ensure profile exists
    await client.query(
      `INSERT INTO relational_profiles (member_id)
       VALUES ($1)
       ON CONFLICT (member_id) DO NOTHING`,
      [userId]
    );

    // Get current profile
    const current = await client.query(
      `SELECT * FROM relational_profiles WHERE member_id = $1`,
      [userId]
    );

    const c = current.rows[0];
    if (!c) throw new Error("Failed to create relational profile");

    // Merge patch with current values
    const next = {
      warmth_precision: clamp01(patch.warmth_precision ?? Number(c.warmth_precision)),
      gentle_direct: clamp01(patch.gentle_direct ?? Number(c.gentle_direct)),
      spacious_efficient: clamp01(patch.spacious_efficient ?? Number(c.spacious_efficient)),
      reflective_actionable: clamp01(patch.reflective_actionable ?? Number(c.reflective_actionable)),
      mythic_plainspoken: clamp01(patch.mythic_plainspoken ?? Number(c.mythic_plainspoken)),
      autonomy_coaching: clamp01(patch.autonomy_coaching ?? Number(c.autonomy_coaching)),
      emotional_attunement: clamp01(patch.emotional_attunement ?? Number(c.emotional_attunement)),
      ritual_density: clamp01(patch.ritual_density ?? Number(c.ritual_density)),
      agent_weights: patch.agent_weights ?? c.agent_weights,
    };

    // Update profile
    const { rows } = await client.query(
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
         agent_weights=$10,
         version = version + 1,
         last_explicit_update = NOW(),
         updated_at = NOW()
       WHERE member_id = $1
       RETURNING *`,
      [
        userId,
        next.warmth_precision,
        next.gentle_direct,
        next.spacious_efficient,
        next.reflective_actionable,
        next.mythic_plainspoken,
        next.autonomy_coaching,
        next.emotional_attunement,
        next.ritual_density,
        JSON.stringify(next.agent_weights),
      ]
    );

    await client.query("COMMIT");

    return NextResponse.json({ ok: true, profile: rows[0] });
  } catch (error: any) {
    await client.query("ROLLBACK");
    console.error("[co-evolution/relational-profile PUT] Error:", error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  } finally {
    client.release();
  }
}
