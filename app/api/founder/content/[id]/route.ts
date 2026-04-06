export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getContentItem, updateContent } from '@/lib/founder/queries';
import type { UpdateContentInput } from '@/lib/founder/types';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ error: 'Not available in static build' }, { status: 501 });
  }

  try {
    const { id } = await params;
    const item = await getContentItem(id);
    if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ item });
  } catch (err) {
    console.error('[founder/content/[id]] GET error:', err);
    return NextResponse.json({ error: 'Failed to fetch content item' }, { status: 500 });
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
    const body = await req.json() as UpdateContentInput;
    const item = await updateContent(id, body);
    if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ item });
  } catch (err) {
    console.error('[founder/content/[id]] PATCH error:', err);
    return NextResponse.json({ error: 'Failed to update content item' }, { status: 500 });
  }
}
