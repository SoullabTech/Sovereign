export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database/postgres';
import { z } from 'zod';
import { getCurrentSession } from '@/lib/auth/serverSessions';

// ═══════════════════════════════════════════════════════════════════════════════
// SCHEMA
// ═══════════════════════════════════════════════════════════════════════════════

const SubmissionSchema = z.object({
  submitted_by_name: z.string().min(1).max(200),
  submitted_by_email: z.string().email().max(320).optional().or(z.literal('')),
  source_title: z.string().min(1).max(500),
  author: z.string().max(300).optional().or(z.literal('')),
  tradition_or_domain: z.string().min(1).max(300),
  url: z.string().url().max(2000).optional().or(z.literal('')),
  rationale: z.string().min(1).max(5000),
  category: z.enum([
    'wisdom_tradition', 'psychology', 'philosophy',
    'consciousness', 'ritual_practice', 'other',
  ]).default('other'),
  is_self_submission: z.boolean().default(false),
  // Honeypot — must be empty
  website: z.string().max(0).optional().or(z.literal('')),
});

// ═══════════════════════════════════════════════════════════════════════════════
// POST /api/wisdom-keepers/submit
// ═══════════════════════════════════════════════════════════════════════════════

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Honeypot check — bots fill hidden fields
    if (body.website && body.website.length > 0) {
      // Return 200 to not tip off bots, but do nothing
      return NextResponse.json({ ok: true });
    }

    const parsed = SubmissionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const data = parsed.data;

    // Derive member_id from session only — never from client
    let memberId: string | null = null;
    try {
      const session = await getCurrentSession();
      memberId = session?.memberId ?? null;
    } catch {
      // No session — anonymous submission is fine
    }

    // Clean optional fields: empty strings → null
    const email = data.submitted_by_email || null;
    const author = data.author || null;
    const url = data.url || null;

    const result = await query(
      `INSERT INTO wisdom_submissions (
        member_id, submitted_by_name, submitted_by_email,
        source_title, author, tradition_or_domain, url,
        rationale, category, is_self_submission
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
      RETURNING id, created_at`,
      [
        memberId,
        data.submitted_by_name,
        email,
        data.source_title,
        author,
        data.tradition_or_domain,
        url,
        data.rationale,
        data.category,
        data.is_self_submission,
      ],
    );

    console.info('[wisdom-submission]', {
      id: result.rows[0]?.id,
      category: data.category,
      memberId: memberId ?? 'anonymous',
    });

    return NextResponse.json({
      ok: true,
      id: result.rows[0]?.id,
    });
  } catch (error) {
    console.error('[wisdom-submission] Error:', error);
    return NextResponse.json(
      { error: 'Failed to submit' },
      { status: 500 },
    );
  }
}
