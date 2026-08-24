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
import {
  decideProvisioning, classifyCollision, isUniqueViolation, personalSlugFor,
  type PractitionerRow,
} from '@/lib/studio/personalStudioProvisioning';

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

    // Does this member have a practitioner AT ALL?
    //
    // This predicate used to read `AND status = 'active'`, which made a
    // SUSPENDED practitioner indistinguishable from no practitioner and caused
    // the route to mint a duplicate (717da53c, 2026-08-21). Existence and
    // eligibility are different questions; this one asks existence only.
    const existing = await query<PractitionerRow>(
      'SELECT id, status FROM practitioners WHERE member_id = $1',
      [memberId]
    );

    const decision = decideProvisioning(existing.rows);

    if (decision.action === 'use_existing') {
      await query(
        'UPDATE members SET studio_mode = $1 WHERE id = $2',
        ['personal', memberId]
      );
      return NextResponse.json({ ok: true, existed: true, practitionerId: decision.practitionerId });
    }

    if (decision.action === 'refuse_suspended') {
      // Named refusal. A replacement here is precisely the defect.
      return NextResponse.json({
        ok: false,
        state: 'practitioner_suspended',
        practitionerId: decision.practitionerId,
        error: 'This account\'s Studio is suspended.',
        detail: 'A practitioner record exists for this member but is suspended. It was not replaced. Restoring it is an operator act.',
      }, { status: 409 });
    }

    if (decision.action === 'refuse_state') {
      return NextResponse.json({
        ok: false,
        state: 'practitioner_unavailable',
        practitionerId: decision.practitionerId,
        practitionerStatus: decision.status,
        error: `This account's Studio is not active (status: ${decision.status}).`,
        detail: 'A practitioner record exists for this member in a non-active state. It was not replaced.',
      }, { status: 409 });
    }

    // decision.action === 'create'
    const slug = personalSlugFor(memberId);
    const personalModules = ['decisions', 'changes', 'maia', 'vault', 'threshold', 'tools'];

    const runCreation = async () => await transaction(async (client) => {
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

    // The slug is deterministic, so a retry or a concurrent request can collide
    // on practitioners_slug_key. That used to surface as an unexplained 500.
    // Re-read what the member ACTUALLY owns and classify it; only an
    // unreconcilable slug is a real conflict.
    try {
      await runCreation();
    } catch (err) {
      if (!isUniqueViolation(err)) throw err;

      const reread = await query<PractitionerRow>(
        'SELECT id, status FROM practitioners WHERE member_id = $1',
        [memberId]
      );
      const after = classifyCollision(reread.rows);

      if (after.action === 'use_existing') {
        await query('UPDATE members SET studio_mode = $1 WHERE id = $2', ['personal', memberId]);
        return NextResponse.json({ ok: true, existed: true, practitionerId: after.practitionerId, recovered: true });
      }
      if (after.action === 'refuse_suspended' || after.action === 'refuse_state') {
        return NextResponse.json({
          ok: false, state: 'practitioner_unavailable', practitionerId: after.practitionerId,
          error: 'A practitioner already exists for this member and is not active.',
        }, { status: 409 });
      }
      return NextResponse.json({
        ok: false, state: 'slug_conflict', slug,
        error: 'The personal Studio address for this member is already taken by another record.',
        detail: 'This is a naming conflict that cannot be reconciled to this member, not a transient failure.',
      }, { status: 409 });
    }

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
