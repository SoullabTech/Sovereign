/**
 * Soul Portrait — Consent Access Helper (Path B, Gate 3).
 *
 * The permission primitive: given a portrait, read the append-only
 * `soul_portrait_consents` ledger and answer "is this portrait consent-live?" —
 * authoritatively from the ledger, never from the `soul_portraits.consent_state`
 * denormalized cache.
 *
 * READ-ONLY. No writes, no cache updates. This module only reads and decides; the
 * write path (recording consent, flipping the cache) is a separate concern (Gate 4).
 * INERT: nothing calls this yet — route enforcement wires it in later. Zero runtime
 * effect on merge.
 *
 * Liveness rule (docs/architecture/SOUL_PORTRAIT_PATH_B_SPEC.md §4.163):
 *   A portrait is consent-live iff the LATEST governing accept/set for the current
 *   agreement_version has NO later refuse/revoke by that actor.
 *
 * Governing actor (resolved here, per the ratified decision):
 *   adult subject → the subject's consent governs
 *   minor subject → the guardian's consent governs (via member_guardians);
 *                   no guardian on record ⇒ never live (minor hard rule, §4.169)
 *
 * Fails closed: any missing/ambiguous state resolves to NOT live.
 */

import { query } from '@/lib/db/postgres';

/**
 * The consent statement version currently in force. Liveness is scoped to it, so
 * bumping this constant forces re-consent — prior-version accepts no longer count.
 * v1 source of truth; may later become config or a per-portrait column.
 */
export const CURRENT_CONSENT_AGREEMENT_VERSION = 'path-b-v1';

export type ConsentAction = 'set' | 'accept' | 'refuse' | 'change' | 'revoke';
export type ConsentActorType = 'guardian' | 'subject' | 'system';
export type GoverningActor = 'subject' | 'guardian';

export interface ConsentEvent {
  action: ConsentAction;
  actor_type: ConsentActorType;
  agreement_version: string;
  created_at: string | Date;
}

export type ConsentLivenessReason =
  | 'live'
  | 'portrait_not_found'
  | 'minor_no_guardian_on_record'
  | 'no_governing_accept'
  | 'later_refuse_or_revoke';

export interface ConsentLiveness {
  live: boolean;
  governingActor: GoverningActor;
  agreementVersion: string;
  latestAction: ConsentAction | null;
  reason: ConsentLivenessReason;
}

/**
 * PURE liveness computation — no I/O, fully unit-testable. This is the
 * constitutional heart; the DB functions below are thin loaders around it.
 */
export function computeConsentLiveness(input: {
  subjectIsMinor: boolean;
  hasGuardianOnRecord: boolean;
  events: ConsentEvent[];
  currentVersion: string;
}): ConsentLiveness {
  const governingActor: GoverningActor = input.subjectIsMinor ? 'guardian' : 'subject';
  const agreementVersion = input.currentVersion;

  // Minor hard rule (§4.169): no guardian on record ⇒ never serves.
  if (input.subjectIsMinor && !input.hasGuardianOnRecord) {
    return { live: false, governingActor, agreementVersion, latestAction: null, reason: 'minor_no_guardian_on_record' };
  }

  // Scope to the current agreement_version and the governing actor type, oldest → newest.
  const governing = input.events
    .filter((e) => e.agreement_version === input.currentVersion && e.actor_type === governingActor)
    .slice()
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

  // Latest accept/set index.
  let latestAcceptIdx = -1;
  for (let i = 0; i < governing.length; i++) {
    const a = governing[i].action;
    if (a === 'accept' || a === 'set') latestAcceptIdx = i;
  }
  if (latestAcceptIdx === -1) {
    return { live: false, governingActor, agreementVersion, latestAction: null, reason: 'no_governing_accept' };
  }

  // Any refuse/revoke strictly after the latest accept/set kills liveness (latest-wins).
  const laterKill = governing
    .slice(latestAcceptIdx + 1)
    .some((e) => e.action === 'refuse' || e.action === 'revoke');
  if (laterKill) {
    return { live: false, governingActor, agreementVersion, latestAction: 'revoke', reason: 'later_refuse_or_revoke' };
  }

  return { live: true, governingActor, agreementVersion, latestAction: governing[latestAcceptIdx].action, reason: 'live' };
}

interface PortraitRow {
  id: string;
  subject_member_id: string | null;
  subject_is_minor: boolean;
}

/**
 * Authoritative consent liveness for a portrait, read from the ledger. READ-ONLY.
 * Fails closed (not live) on any missing/ambiguous state.
 */
export async function getPortraitConsentLiveness(portraitId: string): Promise<ConsentLiveness> {
  const portraitRes = await query<PortraitRow>(
    'SELECT id, subject_member_id, subject_is_minor FROM soul_portraits WHERE id = $1',
    [portraitId],
  );
  const portrait = portraitRes.rows[0];
  if (!portrait) {
    return {
      live: false,
      governingActor: 'subject',
      agreementVersion: CURRENT_CONSENT_AGREEMENT_VERSION,
      latestAction: null,
      reason: 'portrait_not_found',
    };
  }

  // Minor hard rule needs a guardian on record. v1 resolves guardians via the minor's
  // member id; a minor without an account (no subject_member_id) cannot be resolved yet
  // and therefore fails closed (never live) — the minor_ref linkage is a later crossing.
  let hasGuardianOnRecord = false;
  if (portrait.subject_is_minor && portrait.subject_member_id) {
    const gRes = await query(
      'SELECT 1 FROM member_guardians WHERE minor_member_id = $1 LIMIT 1',
      [portrait.subject_member_id],
    );
    hasGuardianOnRecord = gRes.rows.length > 0;
  }

  const eventsRes = await query<ConsentEvent>(
    `SELECT action, actor_type, agreement_version, created_at
       FROM soul_portrait_consents
      WHERE portrait_id = $1
      ORDER BY created_at ASC`,
    [portraitId],
  );

  return computeConsentLiveness({
    subjectIsMinor: portrait.subject_is_minor,
    hasGuardianOnRecord,
    events: eventsRes.rows,
    currentVersion: CURRENT_CONSENT_AGREEMENT_VERSION,
  });
}

/** Thin boolean wrapper over getPortraitConsentLiveness. READ-ONLY. */
export async function isPortraitConsentLive(portraitId: string): Promise<boolean> {
  return (await getPortraitConsentLiveness(portraitId)).live;
}
