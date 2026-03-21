export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';

export interface CreationSummary {
  id: string;
  type: 'song' | 'poem';
  title: string;
  inputEcho: string;
  draft: string;
  updatedAt: string;
}

export async function GET(req: NextRequest) {
  try {
    const memberId = req.nextUrl.searchParams.get('memberId');

    if (!memberId) {
      return NextResponse.json({ error: 'memberId is required' }, { status: 400 });
    }

    const result = await query<{
      id: string;
      type: string;
      title: string;
      input_echo: string;
      draft: string;
      updated_at: Date;
    }>(
      `SELECT id, type, title, input_echo, draft, updated_at
       FROM member_creations
       WHERE member_id = $1
       ORDER BY updated_at DESC
       LIMIT 20`,
      [memberId]
    );

    const creations: CreationSummary[] = result.rows.map(row => ({
      id: row.id,
      type: row.type as 'song' | 'poem',
      title: row.title,
      inputEcho: row.input_echo,
      draft: row.draft,
      updatedAt: row.updated_at.toISOString(),
    }));

    return NextResponse.json({ creations });
  } catch (err) {
    console.error('[GET /api/songwriter/list]', err);
    return NextResponse.json({ error: 'Could not load creations.' }, { status: 500 });
  }
}
