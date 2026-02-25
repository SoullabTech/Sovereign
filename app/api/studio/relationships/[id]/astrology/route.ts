export const dynamic = 'force-dynamic';

/**
 * GET /api/studio/relationships/[id]/astrology
 *
 * Compute or return cached astrology snapshot for this relationship.
 * Uses calculateBirthChart from lib/astrology/ephemerisCalculator.ts
 * Caches in relationship_astrology_snapshots table (24h expiry)
 * If no birth data on relationship record → returns { hasBirthData: false }
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentPractitioner } from '@/lib/auth/getCurrentPractitioner';
import db from '@/lib/db/postgres';
import { calculateBirthChart, calculateTransits } from '@/lib/astrology/ephemerisCalculator';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic();

const SIGN_ORDER = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
];

function toLng(sign: string, deg: number): number {
  return SIGN_ORDER.indexOf(sign) * 30 + deg;
}

function aspectName(diff: number): { aspect: string; orb: number } | null {
  const targets = [
    { angle: 0, name: 'conjunct', orb: 8 },
    { angle: 60, name: 'sextile', orb: 5 },
    { angle: 90, name: 'square', orb: 7 },
    { angle: 120, name: 'trine', orb: 7 },
    { angle: 150, name: 'quincunx', orb: 4 },
    { angle: 180, name: 'oppose', orb: 8 },
  ];
  for (const t of targets) {
    const orb = Math.abs(diff - t.angle);
    const orbAlt = Math.abs(360 - diff - t.angle);
    const minOrb = Math.min(orb, orbAlt);
    if (minOrb <= t.orb) return { aspect: t.name, orb: minOrb };
  }
  return null;
}

interface TransitHit {
  planet: string;
  aspect: string;
  natalPoint: string;
  orb: number;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const practitioner = await getCurrentPractitioner(request);
    if (!practitioner) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const { practitionerId } = practitioner;

    // Verify ownership
    const relRes = await db.query(
      `SELECT id, person_name, birth_date, birth_time, birth_location_lat, birth_location_lng, birth_timezone, age_years, role
       FROM studio_relationships WHERE id = $1 AND practitioner_id = $2`,
      [id, practitionerId]
    );
    if (relRes.rows.length === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    const rel = relRes.rows[0];

    // If no birth data
    if (!rel.birth_date || !rel.birth_location_lat || !rel.birth_location_lng) {
      return NextResponse.json({
        snapshot: {
          id: null,
          relationshipId: id,
          natalSummary: null,
          activeTransits: [],
          synastryNarrative: null,
          computedAt: new Date().toISOString(),
          expiresAt: new Date().toISOString(),
          hasBirthData: false,
        }
      });
    }

    // Check cache
    const cacheRes = await db.query(
      `SELECT * FROM relationship_astrology_snapshots
       WHERE relationship_id = $1 AND expires_at > NOW()
       ORDER BY computed_at DESC LIMIT 1`,
      [id]
    );
    if (cacheRes.rows.length > 0) {
      const cached = cacheRes.rows[0];
      return NextResponse.json({
        snapshot: {
          id: cached.id,
          relationshipId: cached.relationship_id,
          natalSummary: cached.natal_summary_json,
          activeTransits: cached.active_transits_json || [],
          synastryNarrative: cached.synastry_narrative,
          computedAt: cached.computed_at,
          expiresAt: cached.expires_at,
          hasBirthData: true,
        }
      });
    }

    // Compute natal chart
    const birthDateStr = rel.birth_date instanceof Date
      ? rel.birth_date.toISOString().split('T')[0]
      : String(rel.birth_date).split('T')[0];

    const birthData = {
      date: birthDateStr,
      time: rel.birth_time || '12:00',
      location: {
        lat: parseFloat(rel.birth_location_lat),
        lng: parseFloat(rel.birth_location_lng),
        timezone: rel.birth_timezone || 'UTC',
      },
    };

    let chart: Awaited<ReturnType<typeof calculateBirthChart>>;
    try {
      chart = await calculateBirthChart(birthData);
    } catch (err) {
      console.error('[astrology] chart calc failed:', err);
      return NextResponse.json({ error: 'Ephemeris calculation failed' }, { status: 500 });
    }

    // Compute transits
    let transitsRaw: Awaited<ReturnType<typeof calculateTransits>>;
    try {
      transitsRaw = await calculateTransits(new Date());
    } catch (err) {
      console.error('[astrology] transit calc failed:', err);
      transitsRaw = {} as Awaited<ReturnType<typeof calculateTransits>>;
    }

    // Build natal summary
    const natalSummary = {
      sun: { sign: chart.sun.sign, house: chart.sun.house },
      moon: { sign: chart.moon.sign, house: chart.moon.house },
      rising: chart.ascendant.sign,
      keyHouses: [2, 4, 7, 8].map(h => ({
        house: h,
        planets: (Object.entries({
          sun: chart.sun, moon: chart.moon, mercury: chart.mercury,
          venus: chart.venus, mars: chart.mars, saturn: chart.saturn,
          jupiter: chart.jupiter, chiron: chart.chiron,
        }) as [string, { house: number }][])
          .filter(([, p]) => p.house === h)
          .map(([name]) => name.charAt(0).toUpperCase() + name.slice(1)),
      })).filter(h => h.planets.length > 0),
      attachmentSignature: '', // filled by MAIA below
    };

    // Compute top transits to personal points (Sun, Moon, ASC, North Node, Saturn)
    const personalPoints: Record<string, { sign: string; degree: number }> = {
      Sun: { sign: chart.sun.sign, degree: chart.sun.degree },
      Moon: { sign: chart.moon.sign, degree: chart.moon.degree },
      Ascendant: { sign: chart.ascendant.sign, degree: chart.ascendant.degree },
      'North Node': { sign: chart.northNode.sign, degree: chart.northNode.degree },
      Saturn: { sign: chart.saturn.sign, degree: chart.saturn.degree },
    };

    const transitHits: TransitHit[] = [];
    for (const [tPlanet, tPos] of Object.entries(transitsRaw)) {
      if (!tPos || !('sign' in tPos)) continue;
      const pos = tPos as { sign: string; degree: number };
      const tLng = toLng(pos.sign, pos.degree);
      for (const [pointName, pointPos] of Object.entries(personalPoints)) {
        const nLng = toLng(pointPos.sign, pointPos.degree);
        let diff = Math.abs(tLng - nLng);
        if (diff > 180) diff = 360 - diff;
        const hit = aspectName(diff);
        if (hit) {
          transitHits.push({ planet: tPlanet, aspect: hit.aspect, natalPoint: pointName, orb: hit.orb });
        }
      }
    }
    // Sort by tightest orb, take top 3
    transitHits.sort((a, b) => a.orb - b.orb);
    const topTransits = transitHits.slice(0, 3);

    // Generate MAIA narrative via Haiku
    const chartDesc = `${rel.person_name} (${rel.role}, ${rel.age_years ? rel.age_years + ' years old' : 'age unknown'}):
Sun in ${chart.sun.sign} (house ${chart.sun.house}), Moon in ${chart.moon.sign} (house ${chart.moon.house}), Rising ${chart.ascendant.sign}.
Key house emphasis: ${natalSummary.keyHouses.map(h => `${h.planets.join('/')} in house ${h.house}`).join('; ') || 'no strong house cluster'}.
Top transits: ${topTransits.map(t => `${t.planet} ${t.aspect} natal ${t.natalPoint}`).join(', ') || 'none significant'}.`;

    let attachmentSignature = '';
    let activeTransits: {
      planet: string;
      aspect: string;
      natalPoint: string;
      theme: string;
      watchFor: string;
      supportMove: string;
      intensity: 'low' | 'medium' | 'high';
    }[] = [];
    let synastryNarrative = '';

    try {
      const maiaRes = await anthropic.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 800,
        system: `You are MAIA — a sovereign companion supporting a practitioner in understanding a loved one's astrological signature.
Write brief, grounded, non-deterministic interpretations. No jargon walls. Use plain language.
Never diagnose. Never label. Speak to support and awareness, not fate.
Return ONLY valid JSON, no markdown fences.`,
        messages: [{
          role: 'user',
          content: `Based on this chart data, return JSON with exactly these fields:
{
  "attachmentSignature": "1-2 sentences on their emotional/relational wiring (nervous system, attachment style without clinical terms)",
  "transits": [
    {
      "planet": "...",
      "aspect": "...",
      "natalPoint": "...",
      "theme": "one sentence on the theme activated",
      "watchFor": "one sentence on what might manifest",
      "supportMove": "one sentence on how to support",
      "intensity": "low|medium|high"
    }
  ],
  "synastryNarrative": "2-3 sentences on the relational dynamic suggested by this placement pattern"
}

Chart data:
${chartDesc}
Transit hits (planet aspect natal-point):
${topTransits.map(t => `${t.planet} ${t.aspect} ${t.natalPoint} (orb ${t.orb.toFixed(1)}°)`).join('\n') || 'None within orb'}`,
        }],
      });

      const raw = maiaRes.content[0].type === 'text' ? maiaRes.content[0].text : '';
      const parsed = JSON.parse(raw);
      attachmentSignature = parsed.attachmentSignature || '';
      activeTransits = (parsed.transits || []).map((t: {
        planet?: string;
        aspect?: string;
        natalPoint?: string;
        theme?: string;
        watchFor?: string;
        supportMove?: string;
        intensity?: string;
      }) => ({
        planet: t.planet || '',
        aspect: t.aspect || '',
        natalPoint: t.natalPoint || '',
        theme: t.theme || '',
        watchFor: t.watchFor || '',
        supportMove: t.supportMove || '',
        intensity: (t.intensity || 'medium') as 'low' | 'medium' | 'high',
      }));
      synastryNarrative = parsed.synastryNarrative || '';
    } catch (err) {
      console.error('[astrology] MAIA narrative failed:', err);
      attachmentSignature = `${chart.moon.sign} Moon (house ${chart.moon.house}) — emotionally oriented toward ${chart.moon.house <= 6 ? 'inner/personal' : 'outer/relational'} experience.`;
    }

    natalSummary.attachmentSignature = attachmentSignature;

    // Cache in DB
    let snapshotId: string | null = null;
    try {
      const insertRes = await db.query(
        `INSERT INTO relationship_astrology_snapshots
           (relationship_id, practitioner_id, natal_chart, natal_summary_json, active_transits_json, synastry_narrative, expires_at)
         VALUES ($1, $2, $3::jsonb, $4::jsonb, $5::jsonb, $6, NOW() + INTERVAL '24 hours')
         RETURNING id`,
        [
          id,
          practitionerId,
          JSON.stringify(chart),
          JSON.stringify(natalSummary),
          JSON.stringify(activeTransits),
          synastryNarrative,
        ]
      );
      snapshotId = insertRes.rows[0]?.id || null;
    } catch (err) {
      console.error('[astrology] cache insert failed:', err);
    }

    return NextResponse.json({
      snapshot: {
        id: snapshotId,
        relationshipId: id,
        natalSummary,
        activeTransits,
        synastryNarrative,
        computedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 86400000).toISOString(),
        hasBirthData: true,
      }
    });
  } catch (error) {
    console.error('[astrology] GET error:', error);
    return NextResponse.json({ error: 'Failed to compute astrology snapshot' }, { status: 500 });
  }
}
