export const dynamic = 'force-dynamic';

// app/api/feedback/route.ts
// API endpoint for general platform feedback (problems, challenges, strengths, features, questions)

import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/database/postgres';
import { z } from 'zod';
import { sendEmail } from '@/lib/email/sendEmail';

const KELLY_EMAIL = 'kelly@soullab.life';
const KELLY_PHONE = '+15044539009';
const PROBLEM_EMAIL = 'problem@soullab.life';

async function notifyKelly(category: string, categoryLabel: string, message: string, userName: string) {
  const from = userName || 'Anonymous';
  const preview = message.length > 160 ? message.substring(0, 157) + '...' : message;
  const recipient = category === 'problem' ? PROBLEM_EMAIL : KELLY_EMAIL;

  // Email. Deliberately fire-and-forget: feedback submission must not fail
  // because an internal notification did. But the OUTCOME is still inspected —
  // `sendEmail` never throws, so a bare `.catch()` here would have logged
  // nothing at all for a provider refusal.
  void sendEmail({
    purpose: 'feedback:submission',
    from: 'MAIA Feedback <noreply@soullab.life>',
    to: recipient,
    subject: `[${categoryLabel}] from ${from}`,
    html: `<p><strong>${categoryLabel}</strong> from <strong>${from}</strong></p><p>${message.replace(/\n/g, '<br>')}</p>`,
    metadata: { category },
  }).then((r) => {
    if (!r.success) {
      console.error(
        `[Feedback] Email notify REFUSED failureKind=${r.failureKind ?? 'unclassified'} providerCode=${r.providerCode ?? 'unnamed'}`
      );
    }
  });

  // SMS via Twilio (fire-and-forget)
  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_FROM_NUMBER) {
    const body = `MAIA ${categoryLabel} from ${from}: ${preview}`;
    const auth = Buffer.from(`${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`).toString('base64');
    fetch(`https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Messages.json`, {
      method: 'POST',
      headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ From: process.env.TWILIO_FROM_NUMBER, To: KELLY_PHONE, Body: body }).toString(),
    }).catch((e: unknown) => console.error('[Feedback] SMS notify failed:', e));
  }
}

const PlatformFeedbackSchema = z.object({
  category: z.enum(['problem', 'challenge', 'strength', 'feature', 'question']),
  message: z.string().min(1).max(5000),
  userName: z.string().optional(),
  userId: z.string().optional(),
  userAgent: z.string().optional(),
  url: z.string().optional()
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validatedData = PlatformFeedbackSchema.parse(body);

    // Insert feedback record
    const feedbackData = await queryOne<{ id: number }>(
      `INSERT INTO platform_feedback (category, message, user_id, user_name, user_agent, url)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id`,
      [
        validatedData.category,
        validatedData.message,
        validatedData.userId || null,
        validatedData.userName || null,
        validatedData.userAgent || null,
        validatedData.url || null
      ]
    );

    if (!feedbackData) {
      console.error('Failed to save platform feedback: no data returned');
      return NextResponse.json(
        { error: 'Failed to save feedback' },
        { status: 500 }
      );
    }

    const categoryLabels: Record<string, string> = {
      problem: 'Problem Report',
      challenge: 'Challenge',
      strength: 'Positive Feedback',
      feature: 'Feature Request',
      question: 'Question'
    };

    const categoryLabel = categoryLabels[validatedData.category];
    const userName = validatedData.userName || 'Anonymous';
    console.log(`[Feedback] ${categoryLabel} from ${userName}: ${validatedData.message.substring(0, 100)}...`);

    notifyKelly(validatedData.category, categoryLabel, validatedData.message, userName);

    return NextResponse.json({
      success: true,
      feedbackId: feedbackData.id,
      message: 'Feedback recorded successfully'
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Invalid feedback data:', error.errors);
      return NextResponse.json(
        { error: 'Invalid feedback data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Feedback recording failed:', error);
    return NextResponse.json(
      { error: 'Failed to record feedback' },
      { status: 500 }
    );
  }
}

// Get feedback entries (for admin dashboard)
export async function GET(request: NextRequest) {
  // Static export: return stub response during pre-rendering
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ stub: true });
  }
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const status = searchParams.get('status') || 'new';
    const limit = parseInt(searchParams.get('limit') || '50');

    let sqlQuery = `
      SELECT id, category, message, user_id, user_name, status, created_at
      FROM platform_feedback
      WHERE 1=1
    `;
    const params: (string | number)[] = [];
    let paramIndex = 1;

    if (category) {
      sqlQuery += ` AND category = $${paramIndex}`;
      params.push(category);
      paramIndex++;
    }

    if (status !== 'all') {
      sqlQuery += ` AND status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    sqlQuery += ` ORDER BY created_at DESC LIMIT $${paramIndex}`;
    params.push(limit);

    const feedback = await query(sqlQuery, params);

    // Get counts by category
    const counts = await query(`
      SELECT category, COUNT(*) as count
      FROM platform_feedback
      WHERE status = 'new'
      GROUP BY category
    `);

    return NextResponse.json({
      success: true,
      feedback,
      counts: counts.reduce((acc, row) => {
        acc[row.category] = parseInt(row.count);
        return acc;
      }, {} as Record<string, number>)
    });

  } catch (error) {
    console.error('Failed to fetch feedback:', error);
    return NextResponse.json(
      { error: 'Failed to fetch feedback' },
      { status: 500 }
    );
  }
}
