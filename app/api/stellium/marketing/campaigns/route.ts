/**
 * MARKETING CAMPAIGNS API
 *
 * Email sequences and broadcast campaigns
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getCampaigns,
  createCampaign,
  type CampaignType,
  type CampaignStatus,
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
      type: searchParams.get('type') as CampaignType | undefined,
      status: searchParams.get('status') as CampaignStatus | undefined,
      limit: parseInt(searchParams.get('limit') || '50'),
      offset: parseInt(searchParams.get('offset') || '0'),
    };

    const result = await getCampaigns(practitionerId, options);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Failed to get campaigns:', error);
    return NextResponse.json(
      { error: 'Failed to get campaigns' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { practitionerId, ...data } = body;

    if (!practitionerId || !data.name || !data.type) {
      return NextResponse.json(
        { error: 'practitionerId, name, and type are required' },
        { status: 400 }
      );
    }

    const campaign = await createCampaign(practitionerId, data);

    return NextResponse.json({ campaign }, { status: 201 });
  } catch (error) {
    console.error('Failed to create campaign:', error);
    return NextResponse.json(
      { error: 'Failed to create campaign' },
      { status: 500 }
    );
  }
}
