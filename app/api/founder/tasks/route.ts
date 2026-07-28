export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { listTasks, createTask } from '@/lib/founder/queries';
import type { CreateTaskInput } from '@/lib/founder/types';
import { requireFounder } from '@/lib/founder/founderAuth';

export async function GET(req: NextRequest) {
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
    const url = new URL(req.url);
    const tasks = await listTasks({
      status: url.searchParams.get('status') || undefined,
      category: url.searchParams.get('category') || undefined,
      owner: url.searchParams.get('owner') || undefined,
      limit: Number(url.searchParams.get('limit')) || 100,
    });
    return NextResponse.json({ tasks });
  } catch (err) {
    console.error('[founder/tasks] GET error:', err);
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
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
    const body = await req.json() as CreateTaskInput;
    if (!body.title?.trim()) {
      return NextResponse.json({ error: 'title is required' }, { status: 400 });
    }
    const task = await createTask(body);
    return NextResponse.json({ task }, { status: 201 });
  } catch (err) {
    console.error('[founder/tasks] POST error:', err);
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
  }
}
