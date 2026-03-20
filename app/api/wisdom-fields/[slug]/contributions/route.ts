export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { getFieldBySlug, listContributions, postContribution } from '@/lib/wisdom-fields/fieldService';
import { postContributionSchema } from '@/lib/wisdom-fields/types';
import type { ContributionType } from '@/lib/wisdom-fields/types';

/**
 * GET /api/wisdom-fields/[slug]/contributions
 * List active contributions for a field. Requires membership.
 * Optional query param: ?type=reflection|question|integration|application
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const result = await getFieldBySlug(slug);
    if (!result) {
      return NextResponse.json({ error: 'Field not found' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') as ContributionType | null;

    const contributions = await listContributions(result.field.id, memberId, type ?? undefined);
    return NextResponse.json({ contributions });
  } catch (error: any) {
    if (error?.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Field membership required' }, { status: 403 });
    }
    if (error?.message === 'NOT_FOUND') {
      return NextResponse.json({ error: 'Field not found' }, { status: 404 });
    }
    console.error('[WisdomFields] GET contributions error:', error);
    return NextResponse.json({ error: 'Failed to load contributions' }, { status: 500 });
  }
}

/**
 * POST /api/wisdom-fields/[slug]/contributions
 * Post a contribution. Requires membership.
 * All contributions must be human-authored — AI-generated content is prohibited.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = postContributionSchema.parse(await request.json());

    const result = await getFieldBySlug(slug);
    if (!result) {
      return NextResponse.json({ error: 'Field not found' }, { status: 404 });
    }

    const contribution = await postContribution(result.field.id, memberId, {
      contributionType: body.contributionType,
      title: body.title ?? null,
      body: body.body,
      workId: body.workId ?? null,
    });

    return NextResponse.json({ contribution }, { status: 201 });
  } catch (error: any) {
    if (error?.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }
    if (error?.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Field membership required' }, { status: 403 });
    }
    if (error?.message === 'NOT_FOUND') {
      return NextResponse.json({ error: 'Field not found' }, { status: 404 });
    }
    console.error('[WisdomFields] POST contributions error:', error);
    return NextResponse.json({ error: 'Failed to post contribution' }, { status: 500 });
  }
}
