import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';

export const dynamic = 'force-dynamic';

function checkAdminAuth(req: NextRequest): boolean {
  const adminPassword = process.env.LABTOOLS_ADMIN_PASSWORD;
  if (!adminPassword) return false;
  const authHeader = req.headers.get('x-admin-password') ?? req.headers.get('authorization');
  if (!authHeader) return false;
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
  return token === adminPassword;
}

interface DirectiveRow {
  id: string;
  directive_key: string;
  signal_type: string;
  observation_period_start: string;
  title: string;
  summary: string;
  evidence_payload: Record<string, unknown>;
  recommendation: string;
  priority: 'high' | 'medium' | 'low';
  status: 'open' | 'acknowledged' | 'resolved' | 'dismissed';
  opened_at: string;
  condition_cleared_at: string | null;
  resolved_at: string | null;
  acknowledged_by: string | null;
  notes: string | null;
}

// ---------------------------------------------------------------------------
// GET — all open + acknowledged directives, high priority first
// ---------------------------------------------------------------------------
export async function GET(req: NextRequest) {
  if (!checkAdminAuth(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await query<DirectiveRow>(
      `SELECT
         id, directive_key, signal_type, observation_period_start,
         title, summary, evidence_payload, recommendation,
         priority, status,
         opened_at, condition_cleared_at, resolved_at, acknowledged_by, notes
       FROM system_directives
       WHERE status IN ('open', 'acknowledged')
       ORDER BY
         CASE priority WHEN 'high' THEN 1 WHEN 'medium' THEN 2 ELSE 3 END,
         opened_at DESC`,
      []
    );

    return NextResponse.json({
      directives: result.rows,
      generatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error('[Research/Directives GET] Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// PATCH — update directive status (acknowledge / resolve / dismiss)
// ---------------------------------------------------------------------------
export async function PATCH(req: NextRequest) {
  if (!checkAdminAuth(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: {
    id?: string;
    status?: string;
    acknowledged_by?: string;
    notes?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { id, status, acknowledged_by, notes } = body;

  if (!id) {
    return NextResponse.json({ error: 'id is required' }, { status: 400 });
  }
  if (!status || !['acknowledged', 'resolved', 'dismissed'].includes(status)) {
    return NextResponse.json(
      { error: "status must be one of: acknowledged, resolved, dismissed" },
      { status: 400 }
    );
  }
  if ((status === 'acknowledged' || status === 'resolved') && !acknowledged_by) {
    return NextResponse.json(
      { error: 'acknowledged_by is required for acknowledged and resolved status' },
      { status: 400 }
    );
  }

  // Fetch current directive
  const existing = await query<{
    id: string;
    status: 'open' | 'acknowledged' | 'resolved' | 'dismissed';
  }>(
    `SELECT id, status FROM system_directives WHERE id = $1`,
    [id]
  );

  if (existing.rows.length === 0) {
    return NextResponse.json({ error: 'Directive not found' }, { status: 404 });
  }

  const current = existing.rows[0];
  if (current.status === 'resolved' || current.status === 'dismissed') {
    return NextResponse.json(
      { error: `Cannot update a directive that is already ${current.status}` },
      { status: 409 }
    );
  }

  // Build update
  let updateResult: Awaited<ReturnType<typeof query>>;

  if (status === 'acknowledged') {
    updateResult = await query(
      `UPDATE system_directives
          SET status = 'acknowledged',
              acknowledged_by = $2,
              notes = COALESCE($3, notes)
        WHERE id = $1
        RETURNING id, status, acknowledged_by, resolved_at, notes`,
      [id, acknowledged_by, notes ?? null]
    );
  } else if (status === 'resolved') {
    updateResult = await query(
      `UPDATE system_directives
          SET status = 'resolved',
              resolved_at = now(),
              acknowledged_by = $2,
              notes = COALESCE($3, notes)
        WHERE id = $1
        RETURNING id, status, acknowledged_by, resolved_at, notes`,
      [id, acknowledged_by, notes ?? null]
    );
  } else {
    // dismissed
    updateResult = await query(
      `UPDATE system_directives
          SET status = 'dismissed',
              notes = COALESCE($2, notes)
        WHERE id = $1
        RETURNING id, status, acknowledged_by, resolved_at, notes`,
      [id, notes ?? null]
    );
  }

  const updated = updateResult.rows[0] as {
    id: string;
    status: string;
    acknowledged_by: string | null;
    resolved_at: string | null;
    notes: string | null;
  };

  return NextResponse.json({ success: true, directive: updated });
}
