import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';

const ALLOWED_CATEGORIES = new Set([
  'wisdom_tradition',
  'psychology',
  'philosophy',
  'consciousness',
  'ritual_practice',
  'other',
]);

function clean(value: unknown, max = 2000): string {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, max);
}

function isValidEmail(email: string): boolean {
  if (!email) return true;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Honeypot
    if (clean(body.website, 200)) {
      return NextResponse.json(
        { ok: false, error: 'Submission rejected.' },
        { status: 400 },
      );
    }

    const submitted_by_name = clean(body.submitted_by_name, 120);
    const submitted_by_email = clean(body.submitted_by_email, 200);
    const source_title = clean(body.source_title, 300);
    const author = clean(body.author, 200);
    const tradition_or_domain = clean(body.tradition_or_domain, 200);
    const url = clean(body.url, 500);
    const rationale = clean(body.rationale, 4000);
    const category = clean(body.category, 64) || 'other';
    const is_self_submission = Boolean(body.is_self_submission);

    if (!submitted_by_name || !source_title || !rationale) {
      return NextResponse.json(
        { ok: false, error: 'Name, source title, and why it matters are required.' },
        { status: 400 },
      );
    }

    if (rationale.length < 10) {
      return NextResponse.json(
        { ok: false, error: 'Please share a bit more about why this source matters (at least 10 characters).' },
        { status: 400 },
      );
    }

    if (!ALLOWED_CATEGORIES.has(category)) {
      return NextResponse.json(
        { ok: false, error: 'Invalid category.' },
        { status: 400 },
      );
    }

    if (!isValidEmail(submitted_by_email)) {
      return NextResponse.json(
        { ok: false, error: 'Please enter a valid email address.' },
        { status: 400 },
      );
    }

    if (url) {
      try {
        const parsed = new URL(url);
        if (!['http:', 'https:'].includes(parsed.protocol)) {
          throw new Error('bad protocol');
        }
      } catch {
        return NextResponse.json(
          { ok: false, error: 'Please enter a valid link.' },
          { status: 400 },
        );
      }
    }

    // Session-derived member_id only — never from request body
    const member_id = await getMemberIdFromRequest(req);

    await query(
      `INSERT INTO wisdom_submissions (
        member_id, submitted_by_name, submitted_by_email,
        source_title, author, tradition_or_domain, url,
        rationale, category, is_self_submission, status
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,'pending')`,
      [
        member_id || null,
        submitted_by_name,
        submitted_by_email || null,
        source_title,
        author || null,
        tradition_or_domain || null,
        url || null,
        rationale,
        category,
        is_self_submission,
      ],
    );

    return NextResponse.json({
      ok: true,
      message: 'Thank you. Your submission will be reviewed.',
    });
  } catch (error) {
    console.error('[wisdom-submit]', error);
    return NextResponse.json(
      { ok: false, error: 'Unable to submit right now.' },
      { status: 500 },
    );
  }
}
