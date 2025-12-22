// API Route: List improvement candidates
import { NextResponse } from "next/server";
import { z } from "zod";
import { pool } from "@/lib/db/postgres";

const QuerySchema = z.object({
  status: z.string().optional(),
  risk: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(200).optional(),
});

export async function GET(req: Request) {
  const url = new URL(req.url);
  const parsed = QuerySchema.safeParse({
    status: url.searchParams.get("status") ?? undefined,
    risk: url.searchParams.get("risk") ?? undefined,
    limit: url.searchParams.get("limit") ?? undefined,
  });

  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: parsed.error.flatten() }, { status: 400 });
  }

  const { status, risk, limit } = parsed.data;

  const client = await pool.connect();
  try {
    const where: string[] = [];
    const params: any[] = [];

    if (status) {
      params.push(status);
      where.push(`status = $${params.length}`);
    }
    if (risk) {
      params.push(risk);
      where.push(`risk_class = $${params.length}`);
    }

    params.push(limit ?? 50);

    const sql = `
      SELECT *
      FROM improvement_candidates
      ${where.length ? "WHERE " + where.join(" AND ") : ""}
      ORDER BY proposed_at DESC
      LIMIT $${params.length}
    `;

    const { rows } = await client.query(sql, params);
    return NextResponse.json({ ok: true, improvements: rows });
  } catch (error: any) {
    console.error("[co-evolution/improvements GET] Error:", error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  } finally {
    client.release();
  }
}
