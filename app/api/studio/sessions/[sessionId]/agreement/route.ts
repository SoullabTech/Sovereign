import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { getPractitionerIdForMember } from '@/lib/studio/getPractitionerIdForMember';
import { queryOne, transaction } from '@/lib/db/postgres';
import {
  AGREEMENT_MODES,
  VIDEO_PROVIDERS,
  CURRENT_AGREEMENT_VERSION,
  type AgreementMode,
  type VideoProvider,
  type CustomFlags,
  generateAgreementStatements,
  resolveRetentionProfile,
  validateVideoLink,
} from '@/lib/session/SessionAgreements';
import { generateRawToken, hashToken } from '@/lib/session/joinTokenStore';

/**
 * Practitioner agreement API — Session Room consent flow, step 1 of the gate.
 *
 * Spec:  docs/specs/SESSION_ROOM_VIDEO_SPEC_2026-06-14.md (§3 agreements, §4 provider boundary)
 * Scope: docs/specs/SESSION_ROOM_VIDEO_PHASE1_SCOPE_2026-06-14.md (gates 1–2, 6)
 *
 * POST: the practitioner chooses the agreement + provider, freezes the plain-language
 *       statements with the current agreement_version, records their own consent
 *       (consent_practitioner_at) and a `set` event in the consent ledger.
 *       It does NOT reveal the video link to the client — video_link_reveal_allowed
 *       stays false until the client accepts (gate 7, enforced in the client/join API).
 * GET:  read the current agreement for this session (practitioner view).
 *
 * Practitioner-gated and ownership-checked: the session's member_id must be the caller.
 */

interface SessionOwnerRow {
  member_id: string;
  room_state: string;
  client_id: string | null;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await params;

  const memberId = await getMemberIdFromRequest(request);
  if (!memberId) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const practitionerId = await getPractitionerIdForMember(memberId);
  if (!practitionerId) return NextResponse.json({ error: 'not a practitioner' }, { status: 403 });

  const session = await queryOne<SessionOwnerRow>(
    'SELECT member_id, room_state, client_id FROM scribe_sessions WHERE id = $1',
    [sessionId]
  );
  if (!session) return NextResponse.json({ error: 'session not found' }, { status: 404 });
  if (session.member_id !== memberId) return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  if (session.room_state !== 'pre') {
    return NextResponse.json(
      { error: 'agreement can only be set before the session begins; use the change flow' },
      { status: 409 }
    );
  }
  // A client join token binds to a client_id — don't create orphan consent links.
  if (!session.client_id) {
    return NextResponse.json(
      { error: 'assign a client to this session before setting the agreement' },
      { status: 409 }
    );
  }

  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 });
  }

  const mode = body?.agreementMode as AgreementMode;
  const provider = body?.videoProvider as VideoProvider;
  const customFlags = body?.customFlags as CustomFlags | undefined;

  if (!AGREEMENT_MODES.includes(mode)) {
    return NextResponse.json({ error: 'invalid agreementMode' }, { status: 400 });
  }
  if (!VIDEO_PROVIDERS.includes(provider)) {
    return NextResponse.json({ error: 'invalid videoProvider' }, { status: 400 });
  }
  // Validate the external video link at the write point — only https is accepted; an invalid,
  // non-https, or missing external link is rejected here and never persisted (defense-in-depth
  // with the client-side allowlist in SovereignLobby). Soullab supplies its own room (no URL).
  const linkValidation = validateVideoLink(provider, typeof body?.videoLink === 'string' ? body.videoLink : null);
  if (!linkValidation.ok) {
    return NextResponse.json({ error: linkValidation.error }, { status: 400 });
  }
  const videoLink = linkValidation.videoLink;

  // Per-set agreement version (template prefix + unique suffix) so each set/revise is a distinct
  // version — old tokens go stale by version mismatch, not only by revocation.
  const agreementVersion = `${CURRENT_AGREEMENT_VERSION}.${crypto.randomBytes(4).toString('hex')}`;
  const statements = generateAgreementStatements({ mode, provider, customFlags, version: agreementVersion });
  const flagsJson = JSON.stringify(resolveRetentionProfile(mode, customFlags));

  // Re-setting the agreement invalidates any prior client consent and re-closes the link gate.
  const rawJoinToken = generateRawToken();
  const joinTokenHash = hashToken(rawJoinToken);

  await transaction(async (client) => {
    await client.query(
      `UPDATE scribe_sessions SET
         agreement_mode = $1,
         agreement_version = $2,
         agreement_text_snapshot = $3,
         external_provider_notice_snapshot = $4,
         consent_flags = $5::jsonb,
         video_provider = $6,
         video_link = $7,
         consent_practitioner_at = NOW(),
         consent_client_at = NULL,
         consent_revoked_at = NULL,
         video_link_reveal_allowed = false,
         room_state = 'pre'
       WHERE id = $8 AND member_id = $9`,
      [
        mode,
        statements.version,
        statements.maiaRetention,
        statements.providerNotice ?? null,
        flagsJson,
        provider,
        videoLink,
        sessionId,
        memberId,
      ]
    );

    await client.query(
      `INSERT INTO session_consent_events
         (session_id, actor_type, actor_id, action, agreement_mode, agreement_version, flags)
       VALUES ($1, 'practitioner', $2, 'set', $3, $4, $5::jsonb)`,
      [sessionId, memberId, mode, statements.version, flagsJson]
    );

    // New agreement version => new client join token; revoke any prior active tokens.
    await client.query(
      `UPDATE session_join_tokens SET status = 'revoked' WHERE session_id = $1 AND status = 'active'`,
      [sessionId]
    );
    await client.query(
      `INSERT INTO session_join_tokens (session_id, client_id, agreement_version, token_hash, expires_at)
       VALUES ($1, $2, $3, $4, NOW() + make_interval(days => 7))`,
      [sessionId, session.client_id, statements.version, joinTokenHash]
    );
  });

  return NextResponse.json({
    ok: true,
    joinToken: rawJoinToken,
    joinUrl: `/session/join/${rawJoinToken}`,
    agreement: {
      mode,
      version: statements.version,
      provider,
      videoLink, // practitioner-visible; withheld from the client until they accept
      statements: {
        maiaRetention: statements.maiaRetention,
        providerNotice: statements.providerNotice ?? null,
      },
      consentClientAt: null,
      videoLinkRevealAllowed: false,
    },
  });
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await params;

  const memberId = await getMemberIdFromRequest(request);
  if (!memberId) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const practitionerId = await getPractitionerIdForMember(memberId);
  if (!practitionerId) return NextResponse.json({ error: 'not a practitioner' }, { status: 403 });

  const row = await queryOne<any>(
    `SELECT member_id, agreement_mode, agreement_version, agreement_text_snapshot,
            external_provider_notice_snapshot, video_provider, video_link,
            consent_practitioner_at, consent_client_at, consent_revoked_at,
            video_link_reveal_allowed, room_state
       FROM scribe_sessions WHERE id = $1`,
    [sessionId]
  );
  if (!row) return NextResponse.json({ error: 'session not found' }, { status: 404 });
  if (row.member_id !== memberId) return NextResponse.json({ error: 'forbidden' }, { status: 403 });

  return NextResponse.json({
    ok: true,
    agreement: {
      mode: row.agreement_mode,
      version: row.agreement_version,
      provider: row.video_provider,
      videoLink: row.video_link,
      statements: {
        maiaRetention: row.agreement_text_snapshot,
        providerNotice: row.external_provider_notice_snapshot,
      },
      consentPractitionerAt: row.consent_practitioner_at,
      consentClientAt: row.consent_client_at,
      consentRevokedAt: row.consent_revoked_at,
      videoLinkRevealAllowed: row.video_link_reveal_allowed,
      roomState: row.room_state,
    },
  });
}
