// API Route: Record user feedback signals
import { NextResponse } from "next/server";
import { z } from "zod";
import { pool } from "@/lib/db/postgres";

const FeedbackSchema = z.object({
  userId: z.string().min(1),
  sessionId: z.string().min(1),
  signalType: z.enum([
    "thumbs_up",
    "thumbs_down",
    "too_verbose",
    "too_brief",
    "too_cold",
    "too_warm",
    "missed_point",
    "spot_on",
    "too_complex",
    "too_simple",
    "too_mythic",
    "too_plain",
    "adjust_warmth",
    "adjust_directness",
    "custom",
  ]),
  responseText: z.string().optional(),
  userComment: z.string().optional(),
  dimensionAdjustment: z.record(z.number()).optional(), // e.g. {"warmth_precision": 0.03}
  consciousnessFeedbackId: z.string().optional(),
});

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = FeedbackSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: parsed.error.flatten() }, { status: 400 });
  }

  const { userId, sessionId, signalType, responseText, userComment, dimensionAdjustment, consciousnessFeedbackId } =
    parsed.data;

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const { rows } = await client.query<{ id: string }>(
      `INSERT INTO feedback_signals (
         member_id, session_id, signal_type,
         message_text, dimension_adjustment,
         consciousness_feedback_id
       ) VALUES ($1,$2,$3,$4,$5,$6)
       RETURNING id`,
      [
        userId,
        sessionId,
        signalType,
        userComment ?? null,
        dimensionAdjustment ? JSON.stringify(dimensionAdjustment) : null,
        consciousnessFeedbackId ?? null,
      ],
    );

    await client.query("COMMIT");

    return NextResponse.json({ ok: true, feedbackSignalId: rows[0]?.id });
  } catch (error: any) {
    await client.query("ROLLBACK");
    console.error("[co-evolution/feedback] Error:", error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  } finally {
    client.release();
  }
}
