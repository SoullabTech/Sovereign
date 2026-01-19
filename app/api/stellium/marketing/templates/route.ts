export const dynamic = 'force-static';

/**
 * EMAIL TEMPLATES API
 *
 * Reusable email templates with MAIA voice
 */

import { NextRequest, NextResponse } from 'next/server';
import { getEmailTemplates, createEmailTemplate } from '@/lib/stellium/marketing';

export async function GET(request: NextRequest) {
  // Static export: return stub response during pre-rendering
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ stub: true });
  }
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
      category: searchParams.get('category') || undefined,
      status: searchParams.get('status') || undefined,
    };

    const templates = await getEmailTemplates(practitionerId, options);

    return NextResponse.json({ templates });
  } catch (error) {
    console.error('Failed to get templates:', error);
    return NextResponse.json(
      { error: 'Failed to get templates' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { practitionerId, ...data } = body;

    if (!practitionerId || !data.name || !data.subject || !data.body_html) {
      return NextResponse.json(
        { error: 'practitionerId, name, subject, and body_html are required' },
        { status: 400 }
      );
    }

    const template = await createEmailTemplate(practitionerId, data);

    return NextResponse.json({ template }, { status: 201 });
  } catch (error) {
    console.error('Failed to create template:', error);
    return NextResponse.json(
      { error: 'Failed to create template' },
      { status: 500 }
    );
  }
}
