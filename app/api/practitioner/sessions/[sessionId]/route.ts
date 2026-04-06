export const dynamic = 'force-dynamic';

/**
 * Single Session API
 * GET   - Get session details with notes
 * PATCH - Update session
 */

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { getAuthenticatedMember, verifySessionAccess } from '@/lib/practitioner/auth';

type RouteContext = { params: Promise<{ sessionId: string }> };

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { sessionId } = await context.params;
    const member = await getAuthenticatedMember(request);
    if (!member) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!await verifySessionAccess(sessionId, member.id)) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    const sessionResult = await query(
      `SELECT s.*, c.scope as container_scope, c.type as container_type
       FROM rl_sessions s
       JOIN rl_containers c ON c.id = s.container_id
       WHERE s.id = $1`,
      [sessionId]
    );

    const session = sessionResult.rows[0];

    // Get notes for this session
    const notesResult = await query(
      `SELECT id, visibility, content, created_at, updated_at
       FROM rl_notes
       WHERE session_id = $1
       ORDER BY created_at DESC`,
      [sessionId]
    );

    return NextResponse.json({
      session: {
        id: session.id,
        containerId: session.container_id,
        containerScope: session.container_scope,
        containerType: session.container_type,
        sessionType: session.session_type,
        scheduledStartAt: session.scheduled_start_at,
        scheduledEndAt: session.scheduled_end_at,
        status: session.status,
        location: session.location,
        // Trust Layer: meeting provider
        meetingProvider: session.meeting_provider,
        meetingUrl: session.meeting_url,
        meetingId: session.meeting_id,
        meetingMeta: session.meeting_meta,
        // Trust Layer: privacy envelope
        privacyMode: session.privacy_mode,
        consentLevel: session.consent_level,
        visibilityScope: session.visibility_scope,
        allowAiDistillation: session.allow_ai_distillation,
        allowExport: session.allow_export,
        createdAt: session.created_at,
        updatedAt: session.updated_at
      },
      notes: notesResult.rows.map(n => ({
        id: n.id,
        visibility: n.visibility,
        content: n.content,
        createdAt: n.created_at,
        updatedAt: n.updated_at
      }))
    });
  } catch (error) {
    console.error('[SESSION] Get error:', error);
    return NextResponse.json({ error: 'Failed to get session' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { sessionId } = await context.params;
    const member = await getAuthenticatedMember(request);
    if (!member) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!await verifySessionAccess(sessionId, member.id)) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    const body = await request.json();
    const updates: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    if (body.sessionType !== undefined) {
      updates.push(`session_type = $${paramIndex++}::rl_session_type`);
      values.push(body.sessionType);
    }
    if (body.scheduledStartAt !== undefined) {
      updates.push(`scheduled_start_at = $${paramIndex++}`);
      values.push(body.scheduledStartAt);
    }
    if (body.scheduledEndAt !== undefined) {
      updates.push(`scheduled_end_at = $${paramIndex++}`);
      values.push(body.scheduledEndAt);
    }
    if (body.location !== undefined) {
      updates.push(`location = $${paramIndex++}::session_location`);
      values.push(body.location);
    }
    if (body.status !== undefined) {
      updates.push(`status = $${paramIndex++}::rl_session_status`);
      values.push(body.status);
    }
    // Trust Layer: meeting provider fields
    if (body.meetingProvider !== undefined) {
      updates.push(`meeting_provider = $${paramIndex++}::meeting_provider`);
      values.push(body.meetingProvider);
    }
    if (body.meetingUrl !== undefined) {
      updates.push(`meeting_url = $${paramIndex++}`);
      values.push(body.meetingUrl);
    }
    if (body.meetingId !== undefined) {
      updates.push(`meeting_id = $${paramIndex++}`);
      values.push(body.meetingId);
    }
    if (body.meetingMeta !== undefined) {
      updates.push(`meeting_meta = $${paramIndex++}`);
      values.push(body.meetingMeta ? JSON.stringify(body.meetingMeta) : null);
    }
    // Trust Layer: privacy envelope fields
    if (body.privacyMode !== undefined) {
      updates.push(`privacy_mode = $${paramIndex++}::privacy_mode`);
      values.push(body.privacyMode);
      // App-layer invariant: confidential forces AI distillation off
      if (body.privacyMode === 'confidential') {
        updates.push(`allow_ai_distillation = $${paramIndex++}`);
        values.push(false);
      }
    }
    if (body.consentLevel !== undefined) {
      updates.push(`consent_level = $${paramIndex++}::consent_level`);
      values.push(body.consentLevel);
    }
    if (body.visibilityScope !== undefined) {
      updates.push(`visibility_scope = $${paramIndex++}::visibility_scope`);
      values.push(body.visibilityScope);
    }
    if (body.allowAiDistillation !== undefined) {
      updates.push(`allow_ai_distillation = $${paramIndex++}`);
      values.push(body.allowAiDistillation);
    }
    if (body.allowExport !== undefined) {
      updates.push(`allow_export = $${paramIndex++}`);
      values.push(body.allowExport);
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No updates provided' }, { status: 400 });
    }

    values.push(sessionId);
    const result = await query(
      `UPDATE rl_sessions SET ${updates.join(', ')}
       WHERE id = $${paramIndex}
       RETURNING *`,
      values
    );

    return NextResponse.json({ success: true, session: result.rows[0] });
  } catch (error) {
    console.error('[SESSION] Update error:', error);
    return NextResponse.json({ error: 'Failed to update session' }, { status: 500 });
  }
}
