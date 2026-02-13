/**
 * Field Echoes API
 * GET /api/field/echoes?tags=hexagram-29,water&exclude=<record_id>
 *
 * Finds prior field records that echo the given tags or sourceRef keys.
 * Returns matches ranked by resonance strength:
 *   1. oracleKey match (exact hexagram/card)
 *   2. relatingKey match (transformation target)
 *   3. elementHint match (same element family)
 *   4. keyword match (thematic echo)
 *   5. tag overlap (general resonance)
 *
 * The first "surprise engine": recognition, not explanation.
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { requireMemberId } from '@/lib/auth/session';
import { query } from '@/lib/db/postgres';

interface EchoMatch {
  id: string;
  created_at: string;
  phenomena: string;
  trigger_event: string | null;
  tags: string[];
  source_ref: Record<string, string> | null;
  resonance_type: 'oracle_key' | 'relating_key' | 'element' | 'keyword' | 'tag';
  resonance_strength: number; // 1-5, higher = stronger match
}

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const tagsParam = searchParams.get('tags');
    const excludeId = searchParams.get('exclude');
    const oracleKey = searchParams.get('oracleKey');
    const elementHint = searchParams.get('element');
    const keyword = searchParams.get('keyword');
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 25);

    if (!tagsParam && !oracleKey && !elementHint && !keyword) {
      return NextResponse.json(
        { success: false, error: 'Provide tags, oracleKey, element, or keyword' },
        { status: 400 }
      );
    }

    const tags = tagsParam ? tagsParam.split(',').map(t => t.trim()).filter(Boolean) : [];
    const echoes: EchoMatch[] = [];
    const seenIds = new Set<string>();

    // Priority 1: Exact oracleKey match (strongest echo)
    if (oracleKey) {
      const res = await query(
        `SELECT id, created_at, observation, tags
         FROM field_records
         WHERE user_id = $1
           AND (observation->'sourceRef'->>'oracleKey') = $2
           ${excludeId ? 'AND id != $3' : ''}
         ORDER BY created_at DESC
         LIMIT $${excludeId ? '4' : '3'}`,
        excludeId
          ? [userId, oracleKey, excludeId, limit]
          : [userId, oracleKey, limit]
      );
      for (const row of res.rows || []) {
        if (!seenIds.has(row.id)) {
          seenIds.add(row.id);
          echoes.push(toEchoMatch(row, 'oracle_key', 5));
        }
      }
    }

    // Priority 2: Element match
    if (elementHint) {
      const res = await query(
        `SELECT id, created_at, observation, tags
         FROM field_records
         WHERE user_id = $1
           AND (observation->'sourceRef'->>'elementHint') = $2
           ${excludeId ? 'AND id != $3' : ''}
         ORDER BY created_at DESC
         LIMIT $${excludeId ? '4' : '3'}`,
        excludeId
          ? [userId, elementHint, excludeId, limit]
          : [userId, elementHint, limit]
      );
      for (const row of res.rows || []) {
        if (!seenIds.has(row.id)) {
          seenIds.add(row.id);
          echoes.push(toEchoMatch(row, 'element', 3));
        }
      }
    }

    // Priority 3: Keyword match
    if (keyword) {
      const res = await query(
        `SELECT id, created_at, observation, tags
         FROM field_records
         WHERE user_id = $1
           AND (observation->'sourceRef'->>'keyword') = $2
           ${excludeId ? 'AND id != $3' : ''}
         ORDER BY created_at DESC
         LIMIT $${excludeId ? '4' : '3'}`,
        excludeId
          ? [userId, keyword, excludeId, limit]
          : [userId, keyword, limit]
      );
      for (const row of res.rows || []) {
        if (!seenIds.has(row.id)) {
          seenIds.add(row.id);
          echoes.push(toEchoMatch(row, 'keyword', 2));
        }
      }
    }

    // Priority 4: Tag overlap (broadest, lowest confidence)
    if (tags.length > 0) {
      const res = await query(
        `SELECT id, created_at, observation, tags
         FROM field_records
         WHERE user_id = $1
           AND tags ?| $2
           ${excludeId ? 'AND id != $3' : ''}
         ORDER BY created_at DESC
         LIMIT $${excludeId ? '4' : '3'}`,
        excludeId
          ? [userId, tags, excludeId, limit]
          : [userId, tags, limit]
      );
      for (const row of res.rows || []) {
        if (!seenIds.has(row.id)) {
          seenIds.add(row.id);
          echoes.push(toEchoMatch(row, 'tag', 1));
        }
      }
    }

    // Sort by resonance strength (descending), then recency
    echoes.sort((a, b) => {
      if (b.resonance_strength !== a.resonance_strength) {
        return b.resonance_strength - a.resonance_strength;
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    return NextResponse.json({
      success: true,
      echoes: echoes.slice(0, limit),
      count: echoes.length,
    });
  } catch (error) {
    console.error('[API] Error finding echoes:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function toEchoMatch(
  row: Record<string, unknown>,
  resonanceType: EchoMatch['resonance_type'],
  strength: number
): EchoMatch {
  const obs = row.observation as Record<string, unknown> | null;
  return {
    id: row.id as string,
    created_at: row.created_at as string,
    phenomena: (obs?.phenomena as string) || '',
    trigger_event: (obs?.triggerEvent as string) || null,
    tags: (row.tags as string[]) || [],
    source_ref: (obs?.sourceRef as Record<string, string>) || null,
    resonance_type: resonanceType,
    resonance_strength: strength,
  };
}
