/**
 * ASTRO-R4F: private server-issued SEND RECEIPT, not MAIA delivery.
 * Deliberately feature-OFF and not linked from the chart UI until all
 * retrieval, derivative, browser and R20 boundaries have passed review.
 */
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { query } from '@/lib/db/postgres';
import { issueR4fGrant, R4fDenied } from '@/lib/maia/astrologyConsent/r4fGrantStore';
import { isValidMemberPassage } from '@/lib/maia/astrologyConsent/r4fPolicy';

const HEADERS = {
  'Cache-Control': 'private, no-store, max-age=0',
  'X-Content-Type-Options': 'nosniff',
} as const;
const MAX_BODY_BYTES = 16_384;
// Release protection: source/tests may be reviewed; no chart can be sent.
// Independent privacy, R20 and transport acceptance must replace this gate.
export const R4F_MAIA_SEND_ACTIVATION_APPROVED = false as const;
function reply(error: string, status: number) {
  return NextResponse.json({ error }, { status, headers: HEADERS });
}
function listed(memberId: string): boolean {
  return (process.env.ASTRO_PRO_PREVIEW_ALLOWED_MEMBERS || '')
    .split(',').map(s => s.trim()).filter(Boolean).includes(memberId);
}
async function readLimitedJson(req: NextRequest): Promise<unknown> {
  const len = Number(req.headers.get('content-length'));
  if (Number.isFinite(len) && len > MAX_BODY_BYTES) return null;
  if (!req.body) return null;
  const reader = req.body.getReader();
  let size = 0;
  const parts: Uint8Array[] = [];
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_BODY_BYTES) return null;
      parts.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  const buffer = Buffer.concat(parts);
  try { return JSON.parse(buffer.toString('utf8')); } catch { return null; }
}

export async function POST(request: NextRequest) {
  // Unlike ordinary chart viewing, this irreversible transport capability
  // remains disabled unless specifically configured after independent review.
  if (!R4F_MAIA_SEND_ACTIVATION_APPROVED ||
      process.env.ASTRO_R4F_GRANTS_ENABLED !== 'true' ||
      process.env.ASTRO_PRO_PREVIEW_ENABLED !== 'true') {
    return reply('transfer_unavailable', 404);
  }
  if (request.headers.get('sec-fetch-site') === 'cross-site')
    return reply('cross_site_request_refused', 403);

  const memberId = await getMemberIdFromRequest(request).catch(() => null);
  if (!memberId) return reply('session_required', 401);

  const possibleCohort = process.env.ASTRO_PRO_BETA_TESTER_COHORT === 'true';
  if (!listed(memberId) && !possibleCohort)
    return reply('preview_access_required', 403);

  const data = await readLimitedJson(request);
  if (!data || typeof data !== 'object' || !('text' in data))
    return reply('invalid_request', 400);
  const text = (data as { text?: unknown }).text;
  if (!isValidMemberPassage(text)) return reply('invalid_request', 400);

  try {
    const eligible = await query<{ astrology_consent: string | null; tester: boolean | null }>(
      'SELECT astrology_consent, tester FROM members WHERE id = $1 LIMIT 1',
      [memberId],
    );
    if (!listed(memberId) && !(possibleCohort && eligible.rows[0]?.tester === true))
      return reply('preview_access_required', 403);
    if (eligible.rows[0]?.astrology_consent !== 'opted_in')
      return reply('astrology_consent_required', 403);
    const rechecked = await getMemberIdFromRequest(request);
    if (rechecked !== memberId) return reply('session_changed', 401);

    const issued = await issueR4fGrant(memberId, text);
    // Isolated issuance only: the token must not be used in production until
    // the MAIA accepting route and EVERY retrieval writer/reader are governed.
    return NextResponse.json({
      ...issued, issuedOnly: true, modelDeliveryEnabled: false,
    }, { status: 201, headers: HEADERS });
  } catch (err) {
    if (err instanceof R4fDenied)
      return reply(err.code, err.code === 'chart_consent_required' ? 403 : 400);
    // Never log birth data, reviewed text, digest, member id or bearer receipt.
    return reply('transfer_unavailable', 503);
  }
}
