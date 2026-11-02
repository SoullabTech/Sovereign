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
import { getMemberIdFromRequest, getMemberIdFromSessionToken } from '@/lib/auth/getMemberFromRequest';
import { query } from '@/lib/db/postgres';
import { calculateBirthChart, type BirthChart } from '@/lib/astrology/proEphemerisCalculator';
import { admitProCalculation, PRO_SUPPORTED_HOUSE_SYSTEMS } from '@/lib/astrology/proCalculationPolicy';
import { proMemberAllowed, proPreviewEnabled } from '@/lib/astrology/proAccess';

const RESPONSE_HEADERS = {
  'Cache-Control': 'private, no-store',
  'X-Content-Type-Options': 'nosniff',
} as const;


/**
 * R9 review-only: tie a private chart POST to an exact approved target origin
 * independently of member identity, rather than comparing browser Origin to
 * an internal Next.js reverse-proxy URL. Host and forwarding headers do NOT
 * prove a request travelled through Caddy; verified auth_sessions is the
 * separate membership authority. The shared ingress must still be reviewed.
 */
const APPROVED_PRO_WEB_ORIGINS = new Set([
  'https://soullab.life',
  'https://maia.soullab.life',
]);

function expectedProWebOrigin(request: NextRequest): string | null {
  try {
    const target = new URL(request.url);
    const host = request.headers.get('host');
    const forwardedProto = request.headers.get('x-forwarded-proto');
    const localDev = process.env.NODE_ENV === 'development' &&
      target.protocol === 'http:' &&
      (target.hostname === 'localhost' || target.hostname === '127.0.0.1') &&
      (!host || host === target.host);
    if (forwardedProto !== null && forwardedProto !== 'https' &&
        !(localDev && forwardedProto === 'http')) return null;

    if (host) {
      const exactPublicTarget = 'https://' + host;
      if (APPROVED_PRO_WEB_ORIGINS.has(exactPublicTarget)) {
        if (APPROVED_PRO_WEB_ORIGINS.has(target.origin) &&
            target.origin !== exactPublicTarget) return null;
        return exactPublicTarget;
      }
    } else if (APPROVED_PRO_WEB_ORIGINS.has(target.origin)) {
      return target.origin;
    }

    if (process.env.NODE_ENV === 'development' &&
        target.protocol === 'http:' &&
        (target.hostname === 'localhost' || target.hostname === '127.0.0.1') &&
        (!host || host === target.host) &&
        (forwardedProto === null || forwardedProto === 'http')) {
      return target.origin;
    }
  } catch {
    // A malformed request target is never a source of origin authority.
  }
  return null;
}

async function proChartWriteOriginAllowed(request: NextRequest, memberId: string): Promise<boolean> {
  const site = request.headers.get('sec-fetch-site');
  if (site === 'cross-site') return false;
  const expected = expectedProWebOrigin(request);
  if (!expected) return false;

  const origin = request.headers.get('origin');
  if (origin !== null) {
    try {
      // Do not accept paths, case variants or opaque origins as exact Origin.
      return origin === expected && new URL(origin).origin === expected;
    } catch { return false; }
  }

  // Browsers may omit Origin for a same-origin request. Identity is still
  // resolved from a server-issued session, never from this metadata.
  if (site === 'same-origin') return true;

  // Native Capacitor may attach BOTH an auth cookie and header bearer.
  // An originless write requires a bearer verified independently through
  // the existing SQL auth_sessions authority for the SAME member.
  const headerToken = request.headers.get('x-session-token');
  if (typeof headerToken !== 'string' || headerToken.trim() === '') return false;
  const cookie = request.headers.get('cookie') || '';
  const hasSessionCookie = /(?:^|;)\s*maia_session\s*=/.test(cookie);
  if (!hasSessionCookie) return true; // Primary auth resolver verified this token.
  try {
    const headerMemberId = await getMemberIdFromSessionToken(headerToken);
    return headerMemberId !== null && headerMemberId === memberId;
  } catch {
    // Failure of the additional session lookup fails closed without logging.
    return false;
  }
}

type Consent = 'opted_in' | 'declined' | 'unknown' | null;

interface OwnBirthRow {
  birth_date: string | null;
  birth_time: string | null;
  birth_location_lat: string | number | null;
  birth_location_lng: string | number | null;
  birth_timezone: string | null;
  astrology_consent: Consent;
  astrology_birth_revision: string | null;
}

function verifiedBirthRevision(value: unknown): value is string {
  // Server-owned PG BIGINT projected as text. A missing, negative, malformed
  // or out-of-range revision is not permission to release a private chart.
  return typeof value === 'string' &&
    /^(0|[1-9][0-9]*)$/.test(value) &&
    value.length <= 19 && BigInt(value) <= BigInt('9223372036854775807');
}

function bad(status: number, error: string) {
  return NextResponse.json({ error }, { status, headers: RESPONSE_HEADERS });
}

// One access decision (lib/astrology/proAccess.ts): the founder, plus audited
// tester grants only in the 'tester-grant' phase. A stale cohort flag or a
// multi-member allowlist never admits anyone.
function previewEnabled(): boolean {
  return proPreviewEnabled(process.env);
}
function memberAllowed(memberId: string): Promise<boolean> {
  return proMemberAllowed(memberId, process.env);
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
function requestedHouseSystem(request: NextRequest): 'porphyry' | 'whole-sign' | 'equal' | null {
  // House method is the only accepted client choice. A default/no-query POST
  // remains Porphyry; no birth record, identity, or chart object comes from the browser.
  try {
    const params = new URL(request.url).searchParams;
    const names = Array.from(params.keys());
    if (names.length === 0) return 'porphyry';
    if (names.length !== 1 || names[0] !== 'houseSystem') return null;
    const selected = params.get('houseSystem');
    return selected && PRO_SUPPORTED_HOUSE_SYSTEMS.includes(selected as 'porphyry' | 'whole-sign' | 'equal')
      ? selected as 'porphyry' | 'whole-sign' | 'equal' : null;
  } catch { return null; }
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
    if (!(await memberAllowed(memberId))) return bad(403, 'preview_access_required');
    const consent = await query<{ astrology_consent: Consent; astrology_birth_revision: string | null }>(
      'SELECT astrology_consent, astrology_birth_revision::text AS astrology_birth_revision FROM members WHERE id = $1 LIMIT 1', [memberId],
    );
    if (consent.rows[0]?.astrology_consent !== 'opted_in') {
      return bad(403, 'astrology_consent_required');
    }
    const currentRevision = consent.rows[0]?.astrology_birth_revision;
    if (!verifiedBirthRevision(currentRevision)) {
      return bad(503, 'chart_source_revision_unavailable');
    }
    // A focus/visibility recheck must not certify a session that changed
    // while the consent query was in flight.
    if (await getMemberIdFromRequest(request) !== memberId)
      return bad(401, 'session_changed');
    if (!previewEnabled() || !(await memberAllowed(memberId)))
      return bad(403, 'preview_access_required');
    return NextResponse.json({ memberId, verified: true, sourceRevision: currentRevision }, { headers: RESPONSE_HEADERS });
  } catch {
    return bad(503, 'session_verification_unavailable');
  }
}

export async function POST(request: NextRequest) {
  if (!previewEnabled()) return bad(404, 'preview_unavailable');
  // Early reject explicit cross-site provenance before any chart operation.
  if (request.headers.get('sec-fetch-site') === 'cross-site')
    return bad(403, 'cross_site_request_refused');
  const houseSystem = requestedHouseSystem(request);
  if (!houseSystem) return bad(400, 'house_system_unsupported');

  let memberId: string | null;
  try {
    memberId = await getMemberIdFromRequest(request);
  } catch {
    return bad(503, 'session_verification_unavailable');
  }
  if (!memberId) return bad(401, 'session_required');
  if (!(await memberAllowed(memberId))) return bad(403, 'preview_access_required');
  if (!(await proChartWriteOriginAllowed(request, memberId)))
    return bad(403, 'cross_origin_request_refused');

  try {
    const sql = [
      'SELECT birth_date::text AS birth_date,',
      'birth_time::text AS birth_time,',
      'birth_location_lat::text AS birth_location_lat,',
      'birth_location_lng::text AS birth_location_lng,',
      'birth_timezone, astrology_consent,',
      'astrology_birth_revision::text AS astrology_birth_revision',
      'FROM members WHERE id = $1 LIMIT 1',
    ].join(' ');
    const result = await query<OwnBirthRow>(sql, [memberId]);
    const row = result.rows[0];
    if (!row) return bad(404, 'member_not_found');
    if (row.astrology_consent !== 'opted_in') return bad(403, 'astrology_consent_required');
    if (!verifiedBirthRevision(row.astrology_birth_revision)) {
      return bad(503, 'chart_source_revision_unavailable');
    }
    const sourceRevision = row.astrology_birth_revision;

    const date = dateString(row.birth_date);
    const time = wallClock(row.birth_time);
    const location = coords(row);
    if (!date || !time || !location || !row.birth_timezone) {
      return bad(422, 'complete_birth_details_required');
    }
    const admission = admitProCalculation({
      date, time,
      location: { ...location, timezone: row.birth_timezone },
      houseSystem,
    });
    if (!admission.ok) return bad(422, admission.error);

    const chart: BirthChart = await calculateBirthChart(admission.birthData);

    // Avoid returning a chart if the authenticated session was revoked,
    // replaced or invalidated while the calculation was in progress.
    const currentMemberId = await getMemberIdFromRequest(request);
    if (!currentMemberId || currentMemberId !== memberId) return bad(401, 'session_changed');
    if (!previewEnabled() || !(await memberAllowed(memberId))) return bad(403, 'preview_access_required');
    // A private chart is valid only for the same *current* member-owned birth
    // source, not just for whichever profile happened to be read at start.
    // Reuse the identical SQL projection so canonical text values can be
    // compared without introducing a client-trusted birth record or cache.
    const latest = await query<OwnBirthRow>(sql, [memberId]);
    const latestBirth = latest.rows[0];
    if (!latestBirth) return bad(409, 'chart_source_changed');
    if (latestBirth.astrology_consent !== 'opted_in') {
      return bad(403, 'astrology_consent_required');
    }
    const birthFields = [
      'birth_date', 'birth_time', 'birth_location_lat',
      'birth_location_lng', 'birth_timezone',
    ] as const;
    if (!birthFields.every(field => latestBirth[field] === row[field])) {
      return bad(409, 'chart_source_changed');
    }
    if (!verifiedBirthRevision(latestBirth.astrology_birth_revision)) {
      return bad(503, 'chart_source_revision_unavailable');
    }
    if (latestBirth.astrology_birth_revision !== sourceRevision) {
      // Even a temporary A→B→A edit invalidates the in-flight calculation.
      return bad(409, 'chart_source_changed');
    }

    // The prior session proof precedes a database await. Never authorize a
    // response on that stale proof: the final awaited operation is another
    // server-issued member check, after the last database snapshot.
    const finalMemberId = await getMemberIdFromRequest(request);
    if (!finalMemberId || finalMemberId !== memberId) {
      return bad(401, 'session_changed');
    }
    if (!previewEnabled() || !(await memberAllowed(memberId))) {
      return bad(403, 'preview_access_required');
    }

    const uncertainMotionBodies = ([
      'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto',
    ] as const).filter(body => chart[body]?.motionStatus === 'stationary-uncertain');

    return NextResponse.json({
      memberId: finalMemberId,
      sourceRevision,
      data: chart,
      calculationQuality: {
        profile: 'strict-core',
        method: admission.actualHouseSystem,
        housePlacementConvention: 'five-degree-pre-angular-cusp',
        lunarNodeMethod: 'approximate-mean-node',
        birthTimeSource: 'not-recorded-in-this-workflow',
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
