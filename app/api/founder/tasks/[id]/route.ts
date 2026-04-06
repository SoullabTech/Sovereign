export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getTask, updateTask, softDeleteTask } from '@/lib/founder/queries';
import type { UpdateTaskInput } from '@/lib/founder/types';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ error: 'Not available in static build' }, { status: 501 });
  }

  try {
    const { id } = await params;
    const task = await getTask(id);
    if (!task) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ task });
  } catch (err) {
    console.error('[founder/tasks/[id]] GET error:', err);
    return NextResponse.json({ error: 'Failed to fetch task' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ error: 'Not available in static build' }, { status: 501 });
  }

  try {
    const { id } = await params;
    const body = await req.json() as UpdateTaskInput;
    const task = await updateTask(id, body);
    if (!task) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ task });
  } catch (err) {
    console.error('[founder/tasks/[id]] PATCH error:', err);
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ error: 'Not available in static build' }, { status: 501 });
  }

  try {
    const { id } = await params;
    const deleted = await softDeleteTask(id);
    if (!deleted) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[founder/tasks/[id]] DELETE error:', err);
    return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 });
  }
}
