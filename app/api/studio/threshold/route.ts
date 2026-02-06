export const dynamic = 'force-dynamic';
export async function generateStaticParams() { return []; }

/**
 * THRESHOLD PASSAGE API
 *
 * Manages a helper's passage through the Soullab Threshold.
 *
 * GET  - Retrieve current passage state and reflections
 * POST - Begin passage (creates record with consent)
 * PUT  - Advance week, save reflection, or withdraw
 *
 * All reflections are owned by the member. Exportable. Deletable.
 */

import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db/postgres';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { THRESHOLD_WEEK_META, THRESHOLD_WEEKS_ORDERED, getNextThresholdWeek } from '@/lib/maia/thresholdContext';
import type { ThresholdWeek } from '@/lib/maia/thresholdContext';

// ─── DB Row Types ──────────────────────────────────────────────────────

interface ThresholdRow {
  id: string;
  member_id: string;
  current_week: string;
  cohort_group_id: string | null;
  reflections: Record<string, any>;
  accountability_statement: string | null;
  consent_given_at: string | null;
  completed_at: string | null;
  withdrew_at: string | null;
  started_at: string | null;
  created_at: string;
}

interface GroupSessionRow {
  id: string;
  title: string | null;
  scheduled_start: string;
  scheduled_end: string;
  location_type: string;
  location_details: string | null;
  session_number: number | null;
}

interface MemberRow {
  id: string;
  tier: string;
  name: string | null;
}

// ─── GET: Current passage state ────────────────────────────────────────

export async function GET(request: NextRequest) {
  try {
    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const passage = await db.queryOne<ThresholdRow>(`
      SELECT
        id,
        member_id,
        current_week,
        cohort_group_id,
        reflections,
        accountability_statement,
        consent_given_at,
        completed_at,
        withdrew_at,
        started_at,
        created_at
      FROM threshold_passages
      WHERE member_id = $1
    `, [memberId]);

    if (!passage) {
      return NextResponse.json({
        passage: null,
        weekMeta: THRESHOLD_WEEK_META,
        weeksOrdered: THRESHOLD_WEEKS_ORDERED,
      });
    }

    // Include the next circle session if a cohort group is linked
    let nextCircle = null;
    if (passage.cohort_group_id) {
      nextCircle = await db.queryOne<GroupSessionRow>(`
        SELECT
          id, title, scheduled_start, scheduled_end,
          location_type, location_details, session_number
        FROM group_sessions
        WHERE group_id = $1
          AND status IN ('scheduled', 'confirmed')
          AND scheduled_start > NOW()
        ORDER BY scheduled_start ASC
        LIMIT 1
      `, [passage.cohort_group_id]);
    }

    return NextResponse.json({
      passage: {
        id: passage.id,
        currentWeek: passage.current_week,
        reflections: passage.reflections || {},
        accountabilityStatement: passage.accountability_statement,
        consentGivenAt: passage.consent_given_at,
        completedAt: passage.completed_at,
        withdrewAt: passage.withdrew_at,
        startedAt: passage.started_at,
      },
      nextCircle: nextCircle ? {
        id: nextCircle.id,
        title: nextCircle.title,
        scheduledStart: nextCircle.scheduled_start,
        scheduledEnd: nextCircle.scheduled_end,
        locationType: nextCircle.location_type,
        locationDetails: nextCircle.location_details,
        sessionNumber: nextCircle.session_number,
      } : null,
      weekMeta: THRESHOLD_WEEK_META,
      weeksOrdered: THRESHOLD_WEEKS_ORDERED,
    });

  } catch (error) {
    console.error('[THRESHOLD] GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ─── POST: Begin a passage ─────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if they already have a passage
    const existing = await db.queryOne<ThresholdRow>(
      'SELECT id, current_week FROM threshold_passages WHERE member_id = $1',
      [memberId]
    );

    if (existing) {
      return NextResponse.json({
        error: 'Passage already exists',
        currentWeek: existing.current_week,
      }, { status: 409 });
    }

    // Check member is Pro tier
    const member = await db.queryOne<MemberRow>(
      'SELECT id, tier, name FROM members WHERE id = $1',
      [memberId]
    );

    if (!member || member.tier !== 'pro') {
      return NextResponse.json({
        error: 'The Threshold requires an active Pro membership',
      }, { status: 403 });
    }

    const body = await request.json();
    const { cohortGroupId } = body;

    const passage = await db.insertOne('threshold_passages', {
      member_id: memberId,
      current_week: 'week_0',
      cohort_group_id: cohortGroupId || null,
      consent_given_at: new Date().toISOString(),
      started_at: new Date().toISOString(),
    });

    return NextResponse.json({
      passage: {
        id: passage.id,
        currentWeek: passage.current_week,
        reflections: {},
        startedAt: passage.started_at,
      },
    }, { status: 201 });

  } catch (error) {
    console.error('[THRESHOLD] POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ─── PUT: Update passage (advance, reflect, withdraw) ──────────────────

export async function PUT(request: NextRequest) {
  try {
    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const passage = await db.queryOne<ThresholdRow>(
      'SELECT * FROM threshold_passages WHERE member_id = $1',
      [memberId]
    );

    if (!passage) {
      return NextResponse.json({ error: 'No active passage' }, { status: 404 });
    }

    if (passage.completed_at || passage.withdrew_at) {
      return NextResponse.json({ error: 'Passage is already concluded' }, { status: 400 });
    }

    const body = await request.json();
    const { action } = body;

    // ── Save a reflection ──────────────────────────────────────────
    if (action === 'save_reflection') {
      const { week, text } = body;
      if (!week || !text) {
        return NextResponse.json({ error: 'Week and text required' }, { status: 400 });
      }

      const reflections = passage.reflections || {};
      reflections[week] = {
        text: text.trim(),
        saved_at: new Date().toISOString(),
      };

      await db.updateOne('threshold_passages', passage.id, {
        reflections: JSON.stringify(reflections),
      });

      return NextResponse.json({ success: true, reflections });
    }

    // ── Save accountability statement (week 6) ─────────────────────
    if (action === 'save_statement') {
      const { statement } = body;
      if (!statement?.trim()) {
        return NextResponse.json({ error: 'Statement required' }, { status: 400 });
      }

      await db.updateOne('threshold_passages', passage.id, {
        accountability_statement: statement.trim(),
      });

      return NextResponse.json({ success: true });
    }

    // ── Advance to next week ───────────────────────────────────────
    if (action === 'advance') {
      const currentWeek = passage.current_week as ThresholdWeek;
      const nextWeek = getNextThresholdWeek(currentWeek);

      if (nextWeek === 'completed') {
        await db.updateOne('threshold_passages', passage.id, {
          current_week: 'completed',
          completed_at: new Date().toISOString(),
        });

        return NextResponse.json({
          success: true,
          currentWeek: 'completed',
          completedAt: new Date().toISOString(),
        });
      }

      await db.updateOne('threshold_passages', passage.id, {
        current_week: nextWeek,
      });

      return NextResponse.json({
        success: true,
        currentWeek: nextWeek,
      });
    }

    // ── Withdraw ───────────────────────────────────────────────────
    if (action === 'withdraw') {
      const { reason } = body;

      await db.updateOne('threshold_passages', passage.id, {
        current_week: 'withdrew',
        withdrew_at: new Date().toISOString(),
        withdrawal_reason: reason?.trim() || null,
      });

      return NextResponse.json({
        success: true,
        withdrew: true,
      });
    }

    // ── Delete reflection ──────────────────────────────────────────
    if (action === 'delete_reflection') {
      const { week } = body;
      if (!week) {
        return NextResponse.json({ error: 'Week required' }, { status: 400 });
      }

      const reflections = passage.reflections || {};
      delete reflections[week];

      await db.updateOne('threshold_passages', passage.id, {
        reflections: JSON.stringify(reflections),
      });

      return NextResponse.json({ success: true, reflections });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });

  } catch (error) {
    console.error('[THRESHOLD] PUT error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
