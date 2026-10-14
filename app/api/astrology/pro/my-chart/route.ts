/**
 * ASTRO-PRO-04 — member-sovereign calculated natal chart.
 *
 * Unlike the legacy generic calculator, this endpoint never accepts a birth
 * record or target member id from the client. Subject identity and birth
 * inputs come strictly from the authenticated member's own database row.
 *
 * Requires existing astrology_consent=opted_in and an explicit member POST.
 * Calculation confidence is limited (minor-body approximations); neither
 * relationship/identity inference nor MAIA writes are permitted here.
 *
 * Beta candidate ONLY. No paid entitlement has been wired or approved.
 */
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { query } from '@/lib/db/postgres';
import { calculateBirthChart, type BirthChart } from '@/lib/astrology/ephemerisCalculator';
import { admitProCalculation } from '@/lib/astrology/proCalculationPolicy';

const RESPONSE_HEADERS = {
  'Cache-Control': 'private, no-store',
  'X-Content-Type-Options': 'nosniff',
} as const;

type Consent = 'opted_in' | 'declined' | 'unknown' | null;

interface OwnBirthRow {
  birth_date: string | null;
  birth_time: string | null;
  birth_location_lat: string | number | null;
  birth_location_lng: string | number | null;
  birth_timezone: string | null;
  astrology_consent: Consent;
  tester: boolean | null;
}

function bad(status: number, error: string) {
  return NextResponse.json({ error }, { status, headers: RESPONSE_HEADERS });
}

// Preview is disabled by default; the beta eligibility source is either a
// founder-selected explicit allowlist or the existing beta tester cohort,
// enabled separately by server-only configuration. Neither constitutes
// authentication, consent, or a paid membership entitlement.
function previewEnabled(): boolean {
  return process.env.ASTRO_PRO_PREVIEW_ENABLED === 'true';
}
function memberAllowed(memberId: string): boolean {
  const configured = process.env.ASTRO_PRO_PREVIEW_ALLOWED_MEMBERS || '';
  return configured.split(',').map(value => value.trim()).filter(Boolean).includes(memberId);
}
function testerCohortEnabled(): boolean {
  return process.env.ASTRO_PRO_BETA_TESTER_COHORT === 'true';
}
function possiblyEligible(memberId: string): boolean {
  return memberAllowed(memberId) || testerCohortEnabled();
}
function betaEligible(memberId: string, tester: boolean | null | undefined): boolean {
  return memberAllowed(memberId) || (testerCohortEnabled() && tester === true);
}

function dateString(input: unknown): string | null {
  return typeof input === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(input)
    ? input : null;
}
function wallClock(input: unknown): string | null {
  if (typeof input !== 'string') return null;
  // PostgreSQL TIME commonly produces HH:MM:SS. We permit trimming only when
  // nonzero seconds would not be silently discarded.
  const value = input.trim();
  const match = value.match(/^(\d{2}:\d{2})(?::00(?:\.0+)?)?$/);
  return match ? match[1] : null;
}
function coords(row: OwnBirthRow): { lat: number; lng: number } | null {
  const lat = row.birth_location_lat;
  const lng = row.birth_location_lng;
  if (lat === null || lat === undefined || lng === null || lng === undefined ||
      String(lat).trim() === '' || String(lng).trim() === '') return null;
  const nlat = typeof lat === 'number' ? lat : Number(lat);
  const nlng = typeof lng === 'number' ? lng : Number(lng);
  return Number.isFinite(nlat) && Number.isFinite(nlng) ? { lat: nlat, lng: nlng } : null;
}

export async function GET(request: NextRequest) {
  // Used to clear stale chart state on visibility/focus/session changes.
  // No birth data or chart calculations on this method; also rechecks consent.
  if (!previewEnabled()) return bad(404, 'preview_unavailable');
  try {
    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) return bad(401, 'session_required');
    if (!possiblyEligible(memberId)) return bad(403, 'preview_access_required');
    const consent = await query<{ astrology_consent: Consent; tester: boolean | null }>(
      'SELECT astrology_consent, tester FROM members WHERE id = $1 LIMIT 1', [memberId],
    );
    if (!betaEligible(memberId, consent.rows[0]?.tester)) return bad(403, 'preview_access_required');
    if (consent.rows[0]?.astrology_consent !== 'opted_in') {
      return bad(403, 'astrology_consent_required');
    }
    return NextResponse.json({ memberId, verified: true }, { headers: RESPONSE_HEADERS });
  } catch {
    return bad(503, 'session_verification_unavailable');
  }
}

export async function POST(request: NextRequest) {
  if (!previewEnabled()) return bad(404, 'preview_unavailable');
  // Explicit same-site interaction only. Never admit cross-origin browser
  // submissions into a private member chart operation.
  const fetchSite = request.headers.get('sec-fetch-site');
  if (fetchSite === 'cross-site') return bad(403, 'cross_site_request_refused');

  let memberId: string | null;
  try {
    memberId = await getMemberIdFromRequest(request);
  } catch {
    return bad(503, 'session_verification_unavailable');
  }
  if (!memberId) return bad(401, 'session_required');
  if (!possiblyEligible(memberId)) return bad(403, 'preview_access_required');

  try {
    const sql = [
      'SELECT birth_date::text AS birth_date,',
      'birth_time::text AS birth_time,',
      'birth_location_lat::text AS birth_location_lat,',
      'birth_location_lng::text AS birth_location_lng,',
      'birth_timezone, astrology_consent, tester',
      'FROM members WHERE id = $1 LIMIT 1',
    ].join(' ');
    const result = await query<OwnBirthRow>(sql, [memberId]);
    const row = result.rows[0];
    if (!row) return bad(404, 'member_not_found');
    if (!betaEligible(memberId, row.tester)) return bad(403, 'preview_access_required');
    if (row.astrology_consent !== 'opted_in') return bad(403, 'astrology_consent_required');

    const date = dateString(row.birth_date);
    const time = wallClock(row.birth_time);
    const location = coords(row);
    if (!date || !time || !location || !row.birth_timezone) {
      return bad(422, 'complete_birth_details_required');
    }
    const admission = admitProCalculation({
      date, time,
      location: { ...location, timezone: row.birth_timezone },
      houseSystem: 'porphyry',
    });
    if (!admission.ok) return bad(422, admission.error);

    const chart: BirthChart = await calculateBirthChart(admission.birthData);

    // Avoid returning a chart if the authenticated session was revoked,
    // replaced or invalidated while the calculation was in progress.
    const currentMemberId = await getMemberIdFromRequest(request);
    if (!currentMemberId || currentMemberId !== memberId) return bad(401, 'session_changed');
    if (!previewEnabled() || !possiblyEligible(memberId)) return bad(403, 'preview_access_required');
    const latestConsent = await query<{ astrology_consent: Consent; tester: boolean | null }>(
      'SELECT astrology_consent, tester FROM members WHERE id = $1 LIMIT 1', [memberId],
    );
    if (!betaEligible(memberId, latestConsent.rows[0]?.tester)) return bad(403, 'preview_access_required');
    if (latestConsent.rows[0]?.astrology_consent !== 'opted_in') {
      return bad(403, 'astrology_consent_required');
    }

    const uncertainMotionBodies = ([
      'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto',
    ] as const).filter(body => chart[body]?.motionStatus === 'stationary-uncertain');

    return NextResponse.json({
      memberId: currentMemberId,
      data: chart,
      calculationQuality: {
        profile: 'strict-core',
        method: admission.actualHouseSystem,
        utcSource: 'iana',
        independentlyCertified: false,
        approximateBodies: ['chiron', 'northNode', 'southNode', 'lilith', 'ceres', 'pallas', 'juno', 'vesta'],
        motionMethod: 'provisional-geocentric-station-guard',
        uncertainMotionBodies,
        warnings: ['minor_bodies_approximate', 'precision_review_pending',
          ...(uncertainMotionBodies.length ? ['near_station_motion_uncertain'] : [])],
      },
    }, { headers: RESPONSE_HEADERS });
  } catch {
    // A raw error from DB, time conversion or astronomy may contain birth
    // inputs. Neither exception text nor personal values belong in logs.
    return bad(503, 'chart_temporarily_unavailable');
  }
}
