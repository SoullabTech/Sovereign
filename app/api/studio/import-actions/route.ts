/**
 * POST-IMPORT ACTIONS API
 *
 * After a successful import, apply structured actions to newly created clients.
 * Actions: tag, create cohort, queue reports.
 * Each action is independent — partial success is reported per action.
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentPractitioner } from '@/lib/auth/getCurrentPractitioner';
import { query } from '@/lib/db/postgres';
import {
  applyTagsToClients,
  createCohortForClients,
  queueReportsForClients,
  type ImportActionsResult,
} from '@/lib/studio/importActionsService';

export async function POST(req: NextRequest) {
  try {
    const identity = await getCurrentPractitioner(req);
    if (!identity) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { clientIds, actions } = body as {
      clientIds?: string[];
      actions?: {
        tags?: string[];
        cohortName?: string;
        queueSpiralogicReport?: boolean;
      };
    };

    // Validate payload
    if (!clientIds || !Array.isArray(clientIds) || clientIds.length === 0) {
      return NextResponse.json({ error: 'clientIds required' }, { status: 400 });
    }

    if (!actions || Object.keys(actions).length === 0) {
      return NextResponse.json({ error: 'At least one action required' }, { status: 400 });
    }

    // Verify all client IDs belong to this practitioner
    const ownershipResult = await query(
      `SELECT id FROM practitioner_clients
       WHERE id = ANY($1::uuid[])
         AND practitioner_id = $2`,
      [clientIds, identity.practitionerId]
    );

    const ownedIds = ownershipResult.rows.map(r => r.id);
    if (ownedIds.length === 0) {
      return NextResponse.json({ error: 'No valid clients found' }, { status: 404 });
    }

    // Execute actions independently
    const results: ImportActionsResult = {
      tagged: 0,
      reportsQueued: 0,
    };

    // 1. Apply tags
    if (actions.tags && actions.tags.length > 0) {
      results.tagged = await applyTagsToClients(
        identity.practitionerId,
        ownedIds,
        actions.tags
      );
    }

    // 2. Create cohort group
    if (actions.cohortName && actions.cohortName.trim()) {
      results.cohortCreated = await createCohortForClients(
        identity.practitionerId,
        ownedIds,
        actions.cohortName
      );
    }

    // 3. Queue reports
    if (actions.queueSpiralogicReport) {
      results.reportsQueued = await queueReportsForClients(
        identity.practitionerId,
        ownedIds,
        'spiralogic'
      );
    }

    return NextResponse.json({ success: true, results });
  } catch (err) {
    console.error('[Import Actions] Error:', err);
    return NextResponse.json(
      { error: 'Failed to apply import actions' },
      { status: 500 }
    );
  }
}
