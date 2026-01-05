import { NextResponse } from "next/server";
import { query } from "@/lib/db/postgres";

export const dynamic = 'force-static';
export const revalidate = false;

// Required for static export
export function generateStaticParams() {
  return [{ id: 'default' }];
}

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const preludeId = params.id;

  const responseRes = await query(
    `SELECT *
     FROM partners_prelude_responses
     WHERE prelude_id = $1
     ORDER BY created_at DESC
     LIMIT 1`,
    [preludeId]
  );

  const invitesRes = await query(
    `SELECT *
     FROM partners_invites
     WHERE prelude_id = $1
     ORDER BY created_at DESC`,
    [preludeId]
  );

  return NextResponse.json({
    response: responseRes.rows[0] ?? null,
    invites: invitesRes.rows ?? [],
  });
}
