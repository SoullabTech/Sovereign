import { NextRequest, NextResponse } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { requireChannelAccess } from '@/lib/team/permissions';
import { query } from '@/lib/db/postgres';
import { randomUUID } from 'crypto';

export const dynamic = 'force-dynamic';

// "Make task" from a team decision — closes assign → execute.
// Light by design (title + optional assignee). Same channel-scope rule as capture:
// if a member can participate in the decision's source channel, they may make a task from it.

function mapTask(row: any) {
  return { id: row.id, title: row.title, assignee: row.assignee, status: row.status };
}

/**
 * POST /api/team/decisions/:decisionId/tasks  { title?, assignee? }
 * Creates a studio_tasks row linked back to the decision (and its message/channel).
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ decisionId: string }> }
) {
  const memberId = await getMemberIdFromRequest(request);
  if (!memberId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { decisionId } = await params;

  const dRes = await query(
    `SELECT id, title, source_message_id, source_channel_id FROM studio_decisions WHERE id = $1`,
    [decisionId]
  );
  const decision = dRes.rows[0];
  if (!decision) return NextResponse.json({ error: 'decision_not_found' }, { status: 404 });
  if (!decision.source_channel_id) {
    return NextResponse.json({ error: 'not_a_team_decision' }, { status: 400 });
  }

  // Channel-scope authorization (mirrors capture): participate → may make a task
  const access = await requireChannelAccess(decision.source_channel_id, memberId);
  if (!access.allowed) {
    return NextResponse.json(
      { error: access.reason ?? 'Forbidden' },
      { status: access.reason === 'not_found' ? 404 : 403 }
    );
  }

  const { title, assignee } = await request.json().catch(() => ({}));
  const taskTitle =
    typeof title === 'string' && title.trim() ? title.trim() : (decision.title || 'Task');
  const taskAssignee =
    typeof assignee === 'string' && assignee.trim() ? assignee.trim() : null;

  const id = randomUUID();
  const ins = await query(
    `INSERT INTO studio_tasks
       (id, member_id, title, status, assignee, source_decision_id, source_message_id, source_channel_id)
     VALUES ($1, $2, $3, 'todo', $4, $5, $6, $7)
     RETURNING id, title, assignee, status`,
    [id, memberId, taskTitle, taskAssignee, decisionId, decision.source_message_id, decision.source_channel_id]
  );

  console.log(
    `[Co-lab/decision-task] { taskId: '${id.slice(0, 8)}', decisionId: '${decisionId.slice(0, 8)}', ` +
    `byMember: '${memberId.slice(0, 8)}', assignee: ${taskAssignee ? `'${taskAssignee.slice(0, 24)}'` : 'null'} }`
  );

  return NextResponse.json({ task: mapTask(ins.rows[0]) }, { status: 201 });
}
