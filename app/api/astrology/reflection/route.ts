export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { requireMemberId } from '@/lib/auth/session';
import { transaction } from '@/lib/db/postgres';
import { createCapsule } from '@/lib/capsules/capsuleService';
import { recordFacetCrossing } from '@/lib/house/facetCrossing.server';

const HOUSE_SYSTEMS = new Set(['porphyry', 'placidus', 'whole-sign', 'equal', 'koch']);
const ZODIAC_MODES = new Set(['tropical', 'sidereal']);

function shortTitle(text: string, activationLabel?: string | null): string {
  const first = text.split(/[\n.!?]/)[0]?.trim() || text.trim();
  const clipped = first.length <= 72 ? first : first.slice(0, 72).trimEnd() + '…';
  if (!activationLabel) return 'Astrology · ' + clipped;
  const label = activationLabel.length <= 72
    ? activationLabel
    : activationLabel.slice(0, 72).trimEnd() + '…';
  return `Astrology · ${label} · ${clipped}`;
}

function sourceRef(args: {
  scope: 'natal' | 'transit';
  zodiacMode: 'tropical' | 'sidereal';
  houseSystem: string;
  ayanamsa?: string | null;
  activationId?: string | null;
}): string {
  const parts = args.scope === 'transit'
    ? ['transit', args.activationId || 'unknown', args.zodiacMode, args.houseSystem]
    : ['natal', args.zodiacMode, args.houseSystem];
  if (args.zodiacMode === 'sidereal' && args.ayanamsa) parts.push(args.ayanamsa);
  return parts.join(':');
}

export async function POST(request: NextRequest) {
  try {
    const memberId = await requireMemberId();
    const body = await request.json().catch(() => null) as {
      text?: unknown;
      zodiacMode?: unknown;
      houseSystem?: unknown;
      ayanamsa?: unknown;
      scope?: unknown;
      activation?: unknown;
    } | null;

    const text = typeof body?.text === 'string' ? body.text.trim() : '';
    const zodiacMode = typeof body?.zodiacMode === 'string' ? body.zodiacMode : '';
    const houseSystem = typeof body?.houseSystem === 'string' ? body.houseSystem : '';
    const ayanamsa = typeof body?.ayanamsa === 'string' ? body.ayanamsa.trim() : '';
    const requestedScope = body?.scope;
    if (requestedScope !== undefined && requestedScope !== 'natal' && requestedScope !== 'transit') {
      return NextResponse.json({ error: 'Invalid astrology reflection scope.' }, { status: 400 });
    }
    const scope: 'natal' | 'transit' = requestedScope === 'transit' ? 'transit' : 'natal';
    const activation = body?.activation && typeof body.activation === 'object'
      ? body.activation as { id?: unknown; label?: unknown }
      : null;
    const activationId = typeof activation?.id === 'string' ? activation.id.trim() : '';
    const activationLabel = typeof activation?.label === 'string' ? activation.label.trim() : '';

    if (!text) {
      return NextResponse.json({ error: 'Reflection text is required.' }, { status: 400 });
    }
    if (text.length > 4000) {
      return NextResponse.json({ error: 'Reflection text must be 4000 characters or fewer.' }, { status: 400 });
    }
    if (!ZODIAC_MODES.has(zodiacMode) || !HOUSE_SYSTEMS.has(houseSystem)) {
      return NextResponse.json({ error: 'Invalid astrology lens.' }, { status: 400 });
    }
    if (ayanamsa && !/^[a-z0-9_-]{1,40}$/i.test(ayanamsa)) {
      return NextResponse.json({ error: 'Invalid ayanamsa.' }, { status: 400 });
    }
    if (scope === 'transit') {
      if (!/^[a-z0-9-]{3,120}$/i.test(activationId) || !activationLabel || activationLabel.length > 160) {
        return NextResponse.json({ error: 'Invalid transit activation.' }, { status: 400 });
      }
    }

    const normalizedMode = zodiacMode as 'tropical' | 'sidereal';
    const astrologyRef = sourceRef({
      scope,
      zodiacMode: normalizedMode,
      houseSystem,
      ayanamsa: ayanamsa || null,
      activationId: scope === 'transit' ? activationId : null,
    });

    const result = await transaction(async (client) => {
      const ownedChart = await client.query<{ id: string }>(
        `SELECT id::text AS id
           FROM members
          WHERE id = $1::uuid
            AND birth_date IS NOT NULL
          LIMIT 1`,
        [memberId],
      );
      if (!ownedChart.rows[0]) {
        return { kind: 'no_chart' as const };
      }

      const capsule = await createCapsule({
        userId: memberId,
        sourceType: 'astrology',
        sourceId: astrologyRef,
        title: shortTitle(text, scope === 'transit' ? activationLabel : null),
        // Member authorship boundary: the kept artifact contains only their words.
        // Calculated geometry and symbolic interpretation remain source context.
        summary: text,
        goldLines: [],
        decisions: [],
        nextSteps: [],
        practices: [],
        patterns: [],
        signals: { facet: 'astrology', tone: 'member-recognition' },
        // Transit provenance is carried by sourceId + title + tag; signals has a
        // deliberately narrow schema and is not widened for this feature.
        tags: scope === 'transit'
          ? ['member-kept', 'astrology', 'transit-reflection']
          : ['member-kept', 'astrology', 'chart-recognition'],
        sourceExcerpt: null,
        draft: false,
        client,
      });

      await recordFacetCrossing(client, {
        memberId,
        crossingId: scope === 'transit'
          ? 'astrology-transit-keep-as-reflection'
          : 'astrology-keep-as-reflection',
        sourceFacet: 'astrology',
        sourceRefId: astrologyRef,
        targetFacet: 'reflections',
        targetRefId: capsule.id,
      });

      return { kind: 'kept' as const, capsule };
    });

    if (result.kind === 'no_chart') {
      return NextResponse.json(
        { error: 'A member-owned birth chart is required before keeping an Astrology reflection.' },
        { status: 409 },
      );
    }

    return NextResponse.json({
      success: true,
      reflection: result.capsule,
      href: '/reflections/' + encodeURIComponent(result.capsule.id),
    }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === 'AUTH_REQUIRED') {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    console.error('[Astrology→Reflections] keep failed');
    return NextResponse.json({ error: 'Could not keep this reflection.' }, { status: 500 });
  }
}
