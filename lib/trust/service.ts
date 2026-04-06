/**
 * Trust Layer Service — Phase 1
 *
 * Consolidated service for meeting providers, privacy envelopes,
 * memory contracts, and artifact sharing.
 *
 * Uses query() from lib/db/postgres.ts.
 * Uses hashPassword/verifyPassword from lib/auth/passwordUtils.ts.
 * Follows fire-and-forget pattern for non-critical writes.
 */

import { query } from '@/lib/db/postgres';
import { hashPassword, verifyPassword } from '@/lib/auth/passwordUtils';
import type {
  MeetingProvider,
  MeetingMeta,
  PrivacyMode,
  ConsentLevel,
  VisibilityScope,
  MemoryDisposition,
  MemoryAppliesTo,
  MemoryContractRow,
  ArtifactShareRow,
  ShareScope,
  PrivacyGateResult,
  UpdateSessionMeeting,
  UpdateSessionPrivacy,
  CreateMemoryContract,
  CreateArtifactShare,
  ExposureLevel,
  DisplayTitleMode,
  CalendarDisclosureInput,
  CalendarDisclosure,
} from './types';
import { SHAREABLE_ARTIFACT_TYPES } from './types';

// ── Meeting Provider ────────────────────────────────────────

export async function setSessionMeeting(
  sessionId: string,
  input: UpdateSessionMeeting
): Promise<void> {
  await query(
    `UPDATE rl_sessions SET
       meeting_provider = $1::meeting_provider,
       meeting_url = $2,
       meeting_id = $3,
       meeting_meta = $4
     WHERE id = $5`,
    [
      input.meetingProvider,
      input.meetingUrl ?? null,
      input.meetingId ?? null,
      input.meetingMeta ? JSON.stringify(input.meetingMeta) : null,
      sessionId,
    ]
  );
}

export async function getSessionMeeting(sessionId: string): Promise<{
  meetingProvider: MeetingProvider;
  meetingUrl: string | null;
  meetingId: string | null;
  meetingMeta: MeetingMeta | null;
} | null> {
  const result = await query(
    `SELECT meeting_provider, meeting_url, meeting_id, meeting_meta
     FROM rl_sessions WHERE id = $1`,
    [sessionId]
  );
  if (result.rows.length === 0) return null;
  const row = result.rows[0];
  return {
    meetingProvider: row.meeting_provider,
    meetingUrl: row.meeting_url,
    meetingId: row.meeting_id,
    meetingMeta: row.meeting_meta,
  };
}

// ── Privacy Envelope ────────────────────────────────────────

/**
 * Update session privacy envelope.
 * IMPORTANT: Caller MUST verify session ownership before calling this function.
 * The practitioner session route does this via verifySessionAccess().
 */
export async function setSessionPrivacy(
  sessionId: string,
  input: UpdateSessionPrivacy
): Promise<void> {
  // App-layer invariant: confidential mode forces AI distillation off
  let allowAi = input.allowAiDistillation;
  if (input.privacyMode === 'confidential') {
    allowAi = false;
  }

  const updates: string[] = [];
  const values: unknown[] = [];
  let idx = 1;

  updates.push(`privacy_mode = $${idx++}::privacy_mode`);
  values.push(input.privacyMode);

  if (input.consentLevel !== undefined) {
    updates.push(`consent_level = $${idx++}::consent_level`);
    values.push(input.consentLevel);
  }
  if (input.visibilityScope !== undefined) {
    updates.push(`visibility_scope = $${idx++}::visibility_scope`);
    values.push(input.visibilityScope);
  }
  if (allowAi !== undefined) {
    updates.push(`allow_ai_distillation = $${idx++}`);
    values.push(allowAi);
  }
  if (input.allowExport !== undefined) {
    updates.push(`allow_export = $${idx++}`);
    values.push(input.allowExport);
  }

  values.push(sessionId);
  await query(
    `UPDATE rl_sessions SET ${updates.join(', ')} WHERE id = $${idx}`,
    values
  );
}

export async function getSessionPrivacy(sessionId: string): Promise<{
  privacyMode: PrivacyMode;
  consentLevel: ConsentLevel;
  visibilityScope: VisibilityScope;
  allowAiDistillation: boolean;
  allowExport: boolean;
} | null> {
  const result = await query(
    `SELECT privacy_mode, consent_level, visibility_scope,
            allow_ai_distillation, allow_export
     FROM rl_sessions WHERE id = $1`,
    [sessionId]
  );
  if (result.rows.length === 0) return null;
  const row = result.rows[0];
  return {
    privacyMode: row.privacy_mode,
    consentLevel: row.consent_level,
    visibilityScope: row.visibility_scope,
    allowAiDistillation: row.allow_ai_distillation,
    allowExport: row.allow_export,
  };
}

// ── Calendar Disclosure ────────────────────────────────────

/**
 * Resolves the display title for a calendar event based on mode.
 */
function resolveDisplayTitle(
  mode: DisplayTitleMode,
  input: CalendarDisclosureInput
): string | null {
  switch (mode) {
    case 'hidden':
      return null;
    case 'generic':
      return 'Session';
    case 'full':
      return [input.serviceName, input.clientName]
        .filter(Boolean)
        .join(' — ') || 'Session';
  }
}

/**
 * Calendar disclosure: determines what session details are visible
 * in external calendars and to different viewers.
 *
 * Precedence:
 * 1. confidential privacy_mode → always free_busy_only (override)
 * 2. exposure_level on the session → controls detail level
 * 3. display_title_mode → controls title visibility within the level
 *
 * Returns a filtered view of the session suitable for external output.
 */
export async function getCalendarDisclosure(
  sessionId: string,
  input: CalendarDisclosureInput
): Promise<CalendarDisclosure> {
  const result = await query(
    `SELECT privacy_mode, exposure_level, display_title_mode
     FROM rl_sessions WHERE id = $1`,
    [sessionId]
  );

  // No rl_session row — default to moderate disclosure
  let exposureLevel: ExposureLevel = 'session_type';
  let displayTitleMode: DisplayTitleMode = 'generic';

  if (result.rows.length > 0) {
    const row = result.rows[0];

    // Confidential privacy_mode forces maximum restriction
    if (row.privacy_mode === 'confidential') {
      exposureLevel = 'free_busy_only';
      displayTitleMode = 'hidden';
    } else {
      exposureLevel = (row.exposure_level as ExposureLevel) || 'session_type';
      displayTitleMode = (row.display_title_mode as DisplayTitleMode) || 'generic';
    }
  }

  switch (exposureLevel) {
    case 'free_busy_only':
      return {
        visible: true,
        title: 'Busy',
        description: null,
        locationType: null,
        locationDetails: null,
      };

    case 'session_type':
      return {
        visible: true,
        title: resolveDisplayTitle(displayTitleMode, input),
        description: input.serviceName ? `Service: ${input.serviceName}` : null,
        locationType: input.locationType ?? null,
        locationDetails: null, // No specific location at this level
      };

    case 'full_details':
      return {
        visible: true,
        title: resolveDisplayTitle(displayTitleMode, input),
        description: buildDisclosedDescription(input),
        locationType: input.locationType ?? null,
        locationDetails: input.locationDetails ?? null,
      };
  }
}

/**
 * Builds a full description for calendar events (full_details mode only).
 */
function buildDisclosedDescription(input: CalendarDisclosureInput): string | null {
  const lines: string[] = [];
  if (input.clientName) lines.push(`Client: ${input.clientName}`);
  if (input.serviceName) lines.push(`Service: ${input.serviceName}`);
  if (input.locationType) {
    const label = {
      video: 'Video Call', phone: 'Phone',
      in_person: 'In Person', async: 'Async',
    }[input.locationType] || input.locationType;
    lines.push(`Location: ${label}`);
  }
  if (input.notes) {
    lines.push('');
    lines.push(input.notes);
  }
  lines.push('');
  lines.push('Managed by Soullab Studio');
  return lines.length > 1 ? lines.join('\n') : null;
}

/**
 * Privacy gate: determines whether AI generation/distillation is permitted.
 *
 * Precedence (waterfall):
 * 1. Session privacy_mode = 'confidential' → deny
 * 2. Session allow_ai_distillation = false → deny
 * 3. Active memory contract with disposition = 'keep_private' → deny
 * 4. Otherwise → permit
 *
 * Returns stable denial reasons for observability.
 */
export async function isAiPermitted(sessionId: string): Promise<PrivacyGateResult> {
  // Step 1 & 2: Check session-level privacy
  const privacy = await getSessionPrivacy(sessionId);
  if (!privacy) {
    // Session not found — fail closed
    return { permitted: false, reason: 'session_not_found' };
  }

  if (privacy.privacyMode === 'confidential') {
    console.log(`[Trust] AI denied for session ${sessionId}: privacy_mode_blocks_ai`);
    return { permitted: false, reason: 'privacy_mode_blocks_ai' };
  }

  if (!privacy.allowAiDistillation) {
    console.log(`[Trust] AI denied for session ${sessionId}: session_ai_disabled`);
    return { permitted: false, reason: 'session_ai_disabled' };
  }

  // Step 3: Check memory contracts (strongest veto first)
  const contractResult = await query(
    `SELECT disposition, never_use_for_ai, expires_at FROM memory_contracts
     WHERE session_id = $1 AND status = 'active'
     ORDER BY created_at DESC`,
    [sessionId]
  );

  for (const contract of contractResult.rows) {
    // 3a. Skip expired contracts — they no longer govern anything
    if (contract.expires_at && new Date(contract.expires_at) < new Date()) {
      continue;
    }

    // 3b. never_use_for_ai is the strongest active veto — overrides
    // even permissive dispositions like allow_maia_summary
    if (contract.never_use_for_ai) {
      console.log(`[Trust] AI denied for session ${sessionId}: memory_contract_never_use_for_ai`);
      return { permitted: false, reason: 'memory_contract_never_use_for_ai' };
    }

    // 3c. Active, non-expired contract with keep_private blocks summaries
    if ((contract.disposition as MemoryDisposition) === 'keep_private') {
      console.log(`[Trust] AI denied for session ${sessionId}: memory_contract_blocks_summary`);
      return { permitted: false, reason: 'memory_contract_blocks_summary' };
    }
  }

  // Step 4: Permit
  return { permitted: true };
}

// ── Memory Contracts ────────────────────────────────────────

export async function createMemoryContract(
  memberId: string,
  input: CreateMemoryContract
): Promise<MemoryContractRow> {
  const result = await query(
    `INSERT INTO memory_contracts
       (member_id, session_id, container_id, disposition, applies_to, consent_method, never_use_for_ai, expires_at)
     VALUES ($1, $2, $3, $4::memory_disposition, $5, $6::consent_level, $7, $8)
     RETURNING *`,
    [
      memberId,
      input.sessionId ?? null,
      input.containerId ?? null,
      input.disposition,
      input.appliesTo,
      input.consentMethod,
      input.neverUseForAi ?? false,
      input.expiresAt ?? null,
    ]
  );
  return result.rows[0] as MemoryContractRow;
}

export async function getActiveContracts(
  memberId: string,
  opts?: { sessionId?: string; containerId?: string }
): Promise<MemoryContractRow[]> {
  let sql = `SELECT * FROM memory_contracts
     WHERE member_id = $1 AND status = 'active'
       AND (expires_at IS NULL OR expires_at > NOW())`;
  const params: unknown[] = [memberId];
  let idx = 2;

  if (opts?.sessionId) {
    sql += ` AND session_id = $${idx++}`;
    params.push(opts.sessionId);
  }
  if (opts?.containerId) {
    sql += ` AND container_id = $${idx++}`;
    params.push(opts.containerId);
  }

  sql += ' ORDER BY created_at DESC';
  const result = await query(sql, params);
  return result.rows as MemoryContractRow[];
}

/**
 * Resolve the most restrictive active disposition for a member+session.
 * Ordering: keep_private > share_with_practitioner > allow_maia_summary > allow_anonymized_patterns
 *
 * If no contract exists, returns null (session defaults govern).
 */
export async function getEffectiveDisposition(
  memberId: string,
  sessionId: string
): Promise<MemoryDisposition | null> {
  const contracts = await getActiveContracts(memberId, { sessionId });
  if (contracts.length === 0) return null;

  const priority: MemoryDisposition[] = [
    'keep_private',
    'share_with_practitioner',
    'allow_maia_summary',
    'allow_anonymized_patterns',
  ];

  let mostRestrictive: MemoryDisposition = 'allow_anonymized_patterns';
  for (const contract of contracts) {
    const contractIdx = priority.indexOf(contract.disposition);
    const currentIdx = priority.indexOf(mostRestrictive);
    if (contractIdx < currentIdx) {
      mostRestrictive = contract.disposition;
    }
  }
  return mostRestrictive;
}

export async function revokeContract(
  contractId: string,
  memberId: string,
  reason?: string
): Promise<boolean> {
  const result = await query(
    `UPDATE memory_contracts
     SET status = 'revoked'::memory_contract_status,
         revoked_at = NOW(),
         revoked_reason = $3
     WHERE id = $1 AND member_id = $2 AND status = 'active'
     RETURNING id`,
    [contractId, memberId, reason ?? null]
  );
  return result.rows.length > 0;
}

// ── Artifact Sharing ────────────────────────────────────────

export async function createArtifactShare(
  memberId: string,
  input: CreateArtifactShare
): Promise<ArtifactShareRow> {
  // Verify artifact exists, is owned by member, and is a shareable type
  const artifactResult = await query(
    `SELECT id, artifact_type, created_by FROM session_artifacts WHERE id = $1`,
    [input.artifactId]
  );

  if (artifactResult.rows.length === 0) {
    throw new Error('Artifact not found');
  }

  const artifact = artifactResult.rows[0];
  if (artifact.created_by !== memberId) {
    throw new Error('Not authorized to share this artifact');
  }

  if (!SHAREABLE_ARTIFACT_TYPES.includes(artifact.artifact_type)) {
    throw new Error(
      `Artifact type "${artifact.artifact_type}" is not shareable. Allowed: ${SHAREABLE_ARTIFACT_TYPES.join(', ')}`
    );
  }

  // Hash password if provided
  const passwordHash = input.password ? await hashPassword(input.password) : null;

  const result = await query(
    `INSERT INTO artifact_shares
       (artifact_id, share_scope, password_hash, expires_at, created_by)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [
      input.artifactId,
      input.shareScope,
      passwordHash,
      input.expiresAt ?? null,
      memberId,
    ]
  );

  // Fire-and-forget: increment share count on artifact
  query(
    `UPDATE session_artifacts
     SET share_count = share_count + 1, last_shared_at = NOW()
     WHERE id = $1`,
    [input.artifactId]
  ).catch(err => console.error('[Trust] Failed to update share_count:', err));

  return result.rows[0] as ArtifactShareRow;
}

/**
 * Resolve a share token. Returns the artifact content if valid.
 * Checks: token exists, not revoked, not expired.
 * If password-protected, password must be provided and verified.
 */
export async function resolveShareToken(
  token: string,
  password?: string
): Promise<{
  share: ArtifactShareRow;
  artifact: { id: string; artifact_type: string; content: unknown };
} | { error: string; status: number }> {
  const result = await query(
    `SELECT s.*, a.artifact_type,
            COALESCE(a.final_content, a.draft_content) as content
     FROM artifact_shares s
     JOIN session_artifacts a ON a.id = s.artifact_id
     WHERE s.share_token = $1`,
    [token]
  );

  if (result.rows.length === 0) {
    return { error: 'Share link not found', status: 404 };
  }

  const row = result.rows[0];

  if (row.revoked_at) {
    return { error: 'This share link has been revoked', status: 403 };
  }

  if (row.expires_at && new Date(row.expires_at) < new Date()) {
    return { error: 'This share link has expired', status: 403 };
  }

  // Hard-limit: only allowed artifact types
  if (!SHAREABLE_ARTIFACT_TYPES.includes(row.artifact_type)) {
    return { error: 'Artifact type not shareable', status: 403 };
  }

  // Password check
  if (row.password_hash) {
    if (!password) {
      return { error: 'Password required', status: 401 };
    }
    const { ok } = await verifyPassword(password, row.password_hash);
    if (!ok) {
      return { error: 'Invalid password', status: 401 };
    }
  }

  // Fire-and-forget: increment view count
  query(
    `UPDATE artifact_shares
     SET view_count = view_count + 1, last_viewed_at = NOW()
     WHERE id = $1`,
    [row.id]
  ).catch(err => console.error('[Trust] Failed to update view_count:', err));

  return {
    share: {
      id: row.id,
      artifact_id: row.artifact_id,
      share_scope: row.share_scope,
      share_token: row.share_token,
      password_hash: row.password_hash,
      expires_at: row.expires_at,
      view_count: row.view_count,
      last_viewed_at: row.last_viewed_at,
      created_by: row.created_by,
      revoked_at: row.revoked_at,
      created_at: row.created_at,
      updated_at: row.updated_at,
    },
    artifact: {
      id: row.artifact_id,
      artifact_type: row.artifact_type,
      content: row.content,
    },
  };
}

export async function revokeShare(
  shareId: string,
  memberId: string
): Promise<boolean> {
  const result = await query(
    `UPDATE artifact_shares
     SET revoked_at = NOW()
     WHERE id = $1 AND created_by = $2 AND revoked_at IS NULL
     RETURNING id`,
    [shareId, memberId]
  );
  return result.rows.length > 0;
}
