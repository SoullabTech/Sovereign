export const dynamic = 'force-dynamic';

/**
 * Client Inquiry Prompt Sets API
 *
 * GET — returns built-in prompt sets (and eventually practitioner-created ones)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentPractitioner } from '@/lib/auth/getCurrentPractitioner';
import { BUILT_IN_PROMPT_SETS, getPromptSet } from '@/lib/studio/practitioner/promptSets';

export async function GET(request: NextRequest) {
  try {
    const identity = await getCurrentPractitioner(request);
    if (!identity) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (id) {
      const set = getPromptSet(id);
      if (!set) return NextResponse.json({ error: 'Prompt set not found' }, { status: 404 });
      return NextResponse.json({ promptSet: set });
    }

    return NextResponse.json({ promptSets: BUILT_IN_PROMPT_SETS });
  } catch (error) {
    console.error('[Prompt Sets] GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch prompt sets' }, { status: 500 });
  }
}
