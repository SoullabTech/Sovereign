/**
 * SOCIAL CONTENT API
 *
 * MAIA-generated social media content
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getSocialContent,
  createSocialContent,
  type ContentPlatform,
} from '@/lib/stellium/marketing';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const practitionerId = searchParams.get('practitionerId');

    if (!practitionerId) {
      return NextResponse.json(
        { error: 'practitionerId is required' },
        { status: 400 }
      );
    }

    const options = {
      platform: searchParams.get('platform') as ContentPlatform | undefined,
      status: searchParams.get('status') || undefined,
      startDate: searchParams.get('startDate') ? new Date(searchParams.get('startDate')!) : undefined,
      endDate: searchParams.get('endDate') ? new Date(searchParams.get('endDate')!) : undefined,
      limit: parseInt(searchParams.get('limit') || '50'),
      offset: parseInt(searchParams.get('offset') || '0'),
    };

    const content = await getSocialContent(practitionerId, options);

    return NextResponse.json({ content });
  } catch (error) {
    console.error('Failed to get content:', error);
    return NextResponse.json(
      { error: 'Failed to get content' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { practitionerId, ...data } = body;

    if (!practitionerId || !data.content_text) {
      return NextResponse.json(
        { error: 'practitionerId and content_text are required' },
        { status: 400 }
      );
    }

    const content = await createSocialContent(practitionerId, data);

    return NextResponse.json({ content }, { status: 201 });
  } catch (error) {
    console.error('Failed to create content:', error);
    return NextResponse.json(
      { error: 'Failed to create content' },
      { status: 500 }
    );
  }
}
