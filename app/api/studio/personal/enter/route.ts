export const dynamic = 'force-dynamic';

/**
 * POST /api/studio/personal/enter
 *
 * Creates a minimal practitioner record for personal (non-practitioner) Studio access.
 * If the member already has a practitioner record, just sets studio_mode = 'personal'.
 *
 * No request body needed — member identity comes from auth (header or cookie).
 */

import { NextRequest, NextResponse } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { query, transaction } from '@/lib/db/postgres';
import { v4 as uuid } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    const memberId = await getMemberIdFromRequest(request);

    if (!memberId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if member exists
    const memberResult = await query<{ id: string; name: string }>(
      'SELECT id, name FROM members WHERE id = $1',
      [memberId]
    );

    if (memberResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Member not found' },
        { status: 404 }
      );
    }

    // Check if already a practitioner
    const existing = await query<{ id: string }>(
      'SELECT id FROM practitioners WHERE member_id = $1 AND status = $2',
      [memberId, 'active']
    );

    if (existing.rows.length > 0) {
      // Already a practitioner — just switch to personal mode
      await query(
        'UPDATE members SET studio_mode = $1 WHERE id = $2',
        ['personal', memberId]
      );
      return NextResponse.json({ ok: true, existed: true });
    }

    // Create minimal personal practitioner record
    const slug = `personal-${memberId.slice(0, 8)}`;
    const personalModules = ['decisions', 'changes', 'maia', 'vault', 'threshold', 'tools'];

    await transaction(async (client) => {
      const practitionerId = uuid();
      const now = new Date().toISOString();

      // Create practitioner record
      await client.query(
        `INSERT INTO practitioners (
          id, member_id, slug, name, email, portal_type, status,
          enabled_modules, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [
          practitionerId, memberId, slug, 'Personal Studio',
          `${slug}@soullab.life`, 'personal', 'active',
          JSON.stringify(personalModules), now, now,
        ]
      );

      // Keep members.is_practitioner in sync with the authoritative practitioners row.
      await client.query(
        `UPDATE members SET is_practitioner = true, updated_at = NOW() WHERE id = $1`,
        [memberId]
      );

      // Create default theme record
      const themeId = uuid();
      const defaultTheme = {
        identity: {
          practiceName: 'Personal Studio',
          practitionerName: memberResult.rows[0].name || '',
        },
        theme: {
          colors: {
            primary: '#B8860B',
            secondary: '#2D3748',
            accent: '#D4AF37',
            background: '#1A1A2E',
            surface: '#16213E',
            text: '#E2E8F0',
            textMuted: '#A0AEC0',
            border: '#2D3748',
          },
          typography: {
            heading: 'Cormorant Garamond',
            body: 'Open Sans',
          },
        },
        ai: { name: 'MAIA', tone: 'warm', persona: '' },
        features: {
          voice: true,
          textChat: true,
          dreamJournal: false,
          birthChart: false,
          sessionNotes: false,
          progressTracking: false,
          resourceLibrary: false,
          communityForum: false,
        },
      };

      await client.query(
        `INSERT INTO practitioner_themes (
          id, practitioner_id, theme_json, version, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6)`,
        [themeId, practitionerId, JSON.stringify(defaultTheme), 1, now, now]
      );

      // Set member to personal mode
      await client.query(
        'UPDATE members SET studio_mode = $1 WHERE id = $2',
        ['personal', memberId]
      );
    });

    return NextResponse.json({ ok: true, existed: false });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[Studio Personal Enter] Error:', message, error);
    return NextResponse.json(
      { error: 'Failed to enter personal mode', detail: message },
      { status: 500 }
    );
  }
}
