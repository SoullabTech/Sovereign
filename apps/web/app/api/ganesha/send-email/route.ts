import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';import { ganeshaEmail } from '@/lib/services/emailService';

/**
 * Ganesha Autonomous Email API
 * Enables voice commands like: "Ganesha, send the consciousness revolution email to beta testers"
 */

export async function POST(request: NextRequest) {
  try {
    const { templateId, recipients, action } = await request.json();

    // Validate required fields
    if (!templateId || !recipients) {
      return NextResponse.json({
        success: false,
        error: 'templateId and recipients are required'
      }, { status: 400 });
    }

    // Handle preview action
    if (action === 'preview') {
      const preview = await ganeshaEmail.previewCampaign(templateId, recipients);
      return NextResponse.json({
        success: true,
        action: 'preview',
        ...preview
      });
    }

    // Handle send action
    const result = await ganeshaEmail.sendEmail({
      templateId,
      recipients
    });

    return NextResponse.json({
      success: result.success,
      messageId: result.messageId,
      recipients: result.recipients,
      error: result.error,
      message: result.success
        ? `🚀 Consciousness revolution email sent to ${result.recipients} beta testers!`
        : `❌ Failed to send email: ${result.error}`
    });

  } catch (error) {
    console.error('❌ [Ganesha Email API] Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// GET endpoint for Ganesha to check available templates and recipients
export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      availableTemplates: [
        {
          id: 'consciousness-revolution',
          name: 'Consciousness Revolution Announcement',
          description: 'The breakthrough discovery about consciousness architecture and MAIA platform announcement'
        }
      ],
      availableRecipients: [
        'beta-testers',
        'all'
      ],
      usage: {
        send: 'POST /api/ganesha/send-email with { templateId, recipients }',
        preview: 'POST /api/ganesha/send-email with { templateId, recipients, action: "preview" }'
      }
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to get email service info'
    }, { status: 500 });
  }
}