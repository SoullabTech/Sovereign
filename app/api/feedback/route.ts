export const dynamic = 'force-dynamic';

// app/api/feedback/route.ts
// API endpoint for general platform feedback (problems, challenges, strengths, features, questions)

import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/database/postgres';
import { z } from 'zod';

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

    console.log(`[Feedback] ${categoryLabels[validatedData.category]} from ${validatedData.userName || 'Anonymous'}: ${validatedData.message.substring(0, 100)}...`);

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
