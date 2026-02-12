/**
 * Field Records API
 * POST /api/field/records
 *
 * Creates a Stage 1 (Observation) field record from an oracle reading
 * or other experience. The offering bowl — where alcove experiences
 * return to the hearth.
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { requireMemberId } from '@/lib/auth/session';
import { FieldRecordsRepo } from '@/lib/field-protocol/storage/FieldRecordsRepo';

export async function POST(request: NextRequest) {
  try {
    let userId: string;
    try {
      userId = await requireMemberId();
    } catch {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { source, phenomena, tags, triggerEvent, sourceRef } = body as {
      source: string;       // e.g. 'iching', 'tarot', 'dream', 'session'
      phenomena: string;    // The raw description of what happened
      tags?: string[];      // e.g. ['iching', 'hexagram-29', 'water']
      triggerEvent?: string; // What prompted this (the question asked)
      sourceRef?: {         // Structured reference for echo detection
        oracleType?: string;  // 'iching' | 'tarot' | 'runes'
        oracleKey?: string;   // e.g. '29' (hexagram number)
        oracleName?: string;  // e.g. 'The Abysmal'
        relatingKey?: string; // e.g. '7' (transformed hexagram)
        elementHint?: string; // e.g. 'water' (dominant element)
        keyword?: string;     // e.g. 'danger' (hexagram keyword)
      };
    };

    if (!source || !phenomena) {
      return NextResponse.json(
        { success: false, error: 'Missing source or phenomena' },
        { status: 400 }
      );
    }

    // Create a Stage 1 (Observation) field record
    // Naming, interpretation, integration come later — at the member's pace
    //
    // sourceRef is the canonical structured reference for echo detection.
    // Stored as a real JSON object (not a string) so Postgres JSONB
    // operators work without casting. One location only.
    const record = await FieldRecordsRepo.upsert(
      {
        observation: {
          timestamp: new Date(),
          phenomena,
          sensoryData: sourceRef ? { energetic: sourceRef } : {},
          triggerEvent: triggerEvent || undefined,
          precedingActivity: source,
          // sourceRef lives here — canonical location for echo queries:
          //   observation->'sourceRef'->>'oracleKey'
          sourceRef: sourceRef || undefined,
        },
        tags: [source, ...(tags || [])],
        privacyLevel: 'private',
      },
      userId
    );

    if (!record) {
      return NextResponse.json(
        { success: false, error: 'Failed to create field record' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      record: {
        id: record.id,
        completionStage: record.completionStage,
        createdAt: record.createdAt,
      },
    });
  } catch (error) {
    console.error('[API] Error creating field record:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
