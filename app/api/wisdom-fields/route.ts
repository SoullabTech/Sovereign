export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { listFields } from '@/lib/wisdom-fields/fieldService';

/**
 * GET /api/wisdom-fields
 * List all active fields. Public — no auth required.
 * Optional query param: ?type=wisdom_keeper|masters_field
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') as 'wisdom_keeper' | 'masters_field' | null;

    const fields = await listFields(type ?? undefined);
    return NextResponse.json({ fields });
  } catch (error) {
    console.error('[WisdomFields] GET /api/wisdom-fields error:', error);
    return NextResponse.json({ error: 'Failed to list fields' }, { status: 500 });
  }
}
