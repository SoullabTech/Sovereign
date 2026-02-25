export const dynamic = 'force-dynamic';

/**
 * POST /api/studio/relationships/[id]/divination/council
 *
 * Consult the AIN Council for multi-perspective insight about this relationship.
 * Pulls in recent check-ins and any cached astrology snapshot for context.
 * Uses lib/ain/consultation.ts consult() function.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentPractitioner } from '@/lib/auth/getCurrentPractitioner';
import db from '@/lib/db/postgres';
import { consult } from '@/lib/ain/consultation';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const practitioner = await getCurrentPractitioner(request);
    if (!practitioner) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const { practitionerId } = practitioner;

    // Verify ownership + get relationship context
    const relRes = await db.query(
      `SELECT id, person_name, role, age_years FROM studio_relationships
       WHERE id = $1 AND practitioner_id = $2`,
      [id, practitionerId]
    );
    if (relRes.rows.length === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    const rel = relRes.rows[0];

    const body = await request.json().catch(() => ({})) as { question?: string };
    const question: string = body.question
      || `What perspective would serve me most right now in my relationship with ${rel.person_name}?`;

    // Get recent check-ins
    const checkinsRes = await db.query(
      `SELECT what_happened, child_state, parent_need, maia_response->>'framing' as framing
       FROM relationship_checkins
       WHERE relationship_id = $1 ORDER BY created_at DESC LIMIT 5`,
      [id]
    );

    // Get latest astrology snapshot if available
    const astroRes = await db.query(
      `SELECT natal_summary_json, active_transits_json, synastry_narrative
       FROM relationship_astrology_snapshots
       WHERE relationship_id = $1 AND expires_at > NOW()
       ORDER BY computed_at DESC LIMIT 1`,
      [id]
    );
    const astro = astroRes.rows[0] || null;

    // Build rich context
    const contextParts: string[] = [
      `Relationship: ${rel.person_name} (${rel.role}${rel.age_years ? `, ${rel.age_years} years old` : ''})`,
      `Question: ${question}`,
    ];

    if (checkinsRes.rows.length > 0) {
      contextParts.push(
        `Recent check-ins:\n${checkinsRes.rows.map((c: {
          what_happened: string;
          child_state?: string;
          framing?: string;
        }) =>
          `- "${c.what_happened}"${c.child_state ? ` [${c.child_state}]` : ''}${c.framing ? ` → ${c.framing}` : ''}`
        ).join('\n')}`
      );
    }

    if (astro?.natal_summary_json) {
      const natal = astro.natal_summary_json as {
        sun?: { sign: string; house: number };
        moon?: { sign: string; house: number };
        rising?: string;
      };
      contextParts.push(
        `Astrology: Sun ${natal.sun?.sign} h${natal.sun?.house}, Moon ${natal.moon?.sign} h${natal.moon?.house}, Rising ${natal.rising}.`
      );
      if (astro.synastry_narrative) {
        contextParts.push(`Relational signature: ${astro.synastry_narrative}`);
      }
      if (astro.active_transits_json?.length) {
        const transits = astro.active_transits_json as { planet: string; aspect: string; natalPoint: string }[];
        contextParts.push(
          `Active transits: ${transits.slice(0, 2).map(t => `${t.planet} ${t.aspect} ${t.natalPoint}`).join(', ')}`
        );
      }
    }

    const fullContext = contextParts.join('\n\n');

    // Consult AIN Council
    let councilResult;
    try {
      councilResult = await consult({
        council: 'deliberation',
        question: `${question}\n\nContext:\n${fullContext}`,
        context: {
          urgency: 'medium',
          topicHints: ['relationship', 'parenting', rel.role, 'support', 'guidance'],
        },
        constraints: {
          maxFramings: 4,
          preferDomains: ['human', 'foundational'],
        },
      });
    } catch (err) {
      console.error('[council] consult failed:', err);
      return NextResponse.json({ error: 'Council consultation failed' }, { status: 500 });
    }

    const resultForStorage = {
      insights: councilResult.insights,
      tensions: councilResult.tensions,
      risks: councilResult.risks,
      recommendation: councilResult.recommendation,
      framingsUsed: councilResult.framingsUsed,
      confidence: councilResult.confidence,
    };

    // Store divination
    const insertRes = await db.query(
      `INSERT INTO relationship_divinations
         (relationship_id, practitioner_id, divination_type, question, context_json, council_result)
       VALUES ($1, $2, 'council', $3, $4::jsonb, $5::jsonb)
       RETURNING id, created_at`,
      [
        id,
        practitionerId,
        question,
        JSON.stringify({ checkinCount: checkinsRes.rows.length, hasAstro: !!astro }),
        JSON.stringify(resultForStorage),
      ]
    );

    const row = insertRes.rows[0];

    return NextResponse.json({
      divination: {
        id: row.id,
        relationshipId: id,
        divinationType: 'council',
        question,
        ichingResult: null,
        councilResult: resultForStorage,
        createdAt: row.created_at,
      }
    });
  } catch (error) {
    console.error('[council] POST error:', error);
    return NextResponse.json({ error: 'Failed to run council consultation' }, { status: 500 });
  }
}
