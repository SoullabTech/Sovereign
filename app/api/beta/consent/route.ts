/**
 * WS-BETA-CONSENT-R2: verified-session consent-only entrance.
 *
 * Caddy may route ONLY this exact endpoint and /beta/consent ahead of
 * forward_auth. This handler is the security gate — all operations require
 * a verified session and a current, explicitly allowlisted beta candidate.
 * It does not grant access to manuscripts. Accepting or revoking an exact
 * approved policy is an append-only, self-member act.
 */
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import {
  writerStudioBetaPreConsentCandidate,
} from '@/lib/writersStudio/betaAccessServer';
import { restrictedBetaEnabled } from '@/lib/writersStudio/restrictedBetaAdmission';
import { verifiedBetaConsentNotice } from '@/lib/writersStudio/betaConsentNotice';
import { hasActiveWriterBetaConsent } from '@/lib/writersStudio/betaConsentGate';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
const NO_STORE = { 'Cache-Control': 'no-store' };
const BETA_HOST = 'beta.soullab.life';
function respond(body: Record<string, unknown>, status: number) {
  return NextResponse.json(body, { status, headers: NO_STORE });
}

async function verifiedCandidate(request: NextRequest, permitHistoricalWithdrawal = false) {
  if (!restrictedBetaEnabled(process.env.WRITERS_STUDIO_RESTRICTED_BETA)) {
    return { error: 404 };
  }
  if (request.headers.get('host')?.split(':',1)[0]?.toLowerCase() !== BETA_HOST) {
    return { error: 403 };
  }
  const memberId = await getMemberIdFromRequest(request);
  if (!memberId) return { error: 401 };
  if (await writerStudioBetaPreConsentCandidate(memberId)) return { memberId };
  if (permitHistoricalWithdrawal) {
    const past = await query<{ prior_accept: boolean }>(
      `SELECT EXISTS(
          SELECT 1 FROM writers_studio_beta_consent_events
           WHERE member_id=$1 AND actor_member_id=$1 AND decision='accept'
        ) AS prior_accept`,
      [memberId],
    );
    if (past.rows[0]?.prior_accept === true) return { memberId };
  }
  return { error: 403 };
}

export async function GET(request: NextRequest) {
  try {
    const candidate = await verifiedCandidate(request);
    if ('error' in candidate) return respond({ error: 'consent_unavailable' }, candidate.error!);
    const notice = verifiedBetaConsentNotice();
    if (!notice) return respond({ status: 'notice_pending', canAccept: false }, 503);

    const accepted = await hasActiveWriterBetaConsent(candidate.memberId!, {
      policyVersion: notice.version,
      policySHA256: notice.sha256,
    });
    return respond({
      status: accepted ? 'accepted' : 'awaiting_member_decision',
      canAccept: true,
      version: notice.version,
      sha256: notice.sha256,
      notice: notice.text,
      accepted,
    }, 200);
  } catch {
    return respond({ error: 'consent_authority_unavailable' }, 503);
  }
}

export async function POST(request: NextRequest) {
  // A session cookie is not an anti-CSRF token. Browser writes require a
  // trusted exact Origin in addition to the member's verified session.
  if (request.headers.get('origin') !== 'https://beta.soullab.life') {
    return respond({ error: 'origin_refused' }, 403);
  }
  try {
    let body: unknown;
    try { body = await request.json(); }
    catch { return respond({ error: 'invalid_json' }, 400); }
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return respond({ error: 'invalid_decision' }, 400);
    }
    const fields = body as Record<string, unknown>;
    const decision = fields.decision;
    if (decision !== 'accept' && decision !== 'revoke') {
      return respond({ error: 'invalid_decision' }, 400);
    }
    const actualKeys = Object.keys(fields).sort();
    const candidate = await verifiedCandidate(request, decision === 'revoke');
    if ('error' in candidate) return respond({ error: 'consent_unavailable' }, candidate.error!);
    if (decision === 'accept') {
      if (actualKeys.join(',') !== 'decision,policySHA256,policyVersion') {
        return respond({ error: 'exact_notice_confirmation_required' }, 400);
      }
      const notice = verifiedBetaConsentNotice();
      if (!notice) return respond({ error: 'approved_notice_missing' }, 503);
      if (fields.policyVersion !== notice.version || fields.policySHA256 !== notice.sha256) {
        return respond({ error: 'notice_changed_review_again' }, 409);
      }
      await query(
        `INSERT INTO writers_studio_beta_consent_events
         (member_id, actor_member_id, decision, policy_version, policy_sha256)
         VALUES($1,$1,'accept',$2,$3)`,
        [candidate.memberId, notice.version, notice.sha256],
      );
      return respond({ status: 'accepted' }, 200);
    }

    // Withdrawal is independent of whether the current notice remains
    // configured. A version rotation must never trap a member in consent.
    if (actualKeys.join(',') !== 'decision') return respond({ error: 'invalid_decision' }, 400);
    const prior = await query<{ decision: string; policy_version: string; policy_sha256: string }>(
      `SELECT decision, policy_version, policy_sha256
         FROM writers_studio_beta_consent_events
        WHERE member_id = $1 ORDER BY seq DESC LIMIT 1`,
      [candidate.memberId],
    );
    if (!prior.rows.length) return respond({ error: 'no_consent_to_withdraw' }, 404);
    if (prior.rows[0].decision === 'revoke') return respond({ status: 'revoked' }, 200);
    await query(
      `INSERT INTO writers_studio_beta_consent_events
       (member_id, actor_member_id, decision, policy_version, policy_sha256)
       VALUES($1,$1,'revoke',$2,$3)`,
      [candidate.memberId, prior.rows[0].policy_version, prior.rows[0].policy_sha256],
    );
    return respond({ status: 'revoked' }, 200);

  } catch {
    return respond({ error: 'consent_authority_unavailable' }, 503);
  }
}
