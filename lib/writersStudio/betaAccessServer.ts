import { query } from '@/lib/db/postgres';
import { activeBetaGrant, betaGrantMode, type BetaGrantDecision, type BetaGrantMode } from './betaGrants';
import { freeAdmissionOpen, proGateEnabled } from './freeAdmission';

/**
 * SMALL-BETA-01 / B4 — server-side cohort membership.
 *
 * A query flag is presentation intent, never entitlement. The pilot consists of
 * active, member-linked founder-ops beta testers who are ALSO explicitly marked
 * for the Writer's Studio pilot (ops_contacts.metadata.writers_studio_beta = true).
 * Being a beta tester for another lane is not Writer's Studio admission; an
 * unmarked contact fails closed. Founder/CTO may enter for
 * witness/support without being represented as a beta tester.
 *
 * Dated beta grants (founder rulings 2026-11-13, #1800; lib/writersStudio/betaGrants.ts):
 * WS_BETA_GRANT_MODE chooses the source of beta standing.
 *   'legacy' (default) — the boolean above only. Exactly today's single query; the grant table is never read.
 *   'transition'       — an active dated grant admits; the boolean admits ONLY members with no dated-grant history.
 *                        Once a member has any grant event, the grant alone decides (the boolean cannot re-admit as Pro).
 *   'dated'            — an active dated grant only; the boolean no longer admits.
 * A grant lookup failure throws (callers fail closed), never reads as "no grant".
 *
 * TWO ANSWERS, ONE OWNER (founder rulings 2026-11-13 on #1800; design #2263):
 *   writersStudioStanding()   — may this member be in the Studio, and on which plan? Studio admission reads this.
 *   writersStudioBetaAccess() — does this member hold complimentary beta Pro? `writing.wholeWork` reads this.
 * When a dated grant expires OR is revoked, the member keeps the Free Studio (`grant_lapsed` / `grant_revoked`) and
 * loses only Pro. That Free standing:
 *   - is reachable only from the member's OWN recorded grant history — a member never granted stays out;
 *   - exists only while WS_PRO_GATE_ENABLED is exactly "true". With the gate off everyone holds `writing.wholeWork`,
 *     so admitting an ended grant would hand back Pro; with the gate off an ended grant stays out, as before.
 */
export type WritersStudioBetaAccess =
  | { eligible: true; basis: 'active_beta_tester' | 'founder_witness' }
  | { eligible: true; basis: 'dated_beta_grant'; expiresAt: string }
  | { eligible: false; basis: 'not_in_pilot' };

export type WritersStudioStanding =
  | { admitted: true; plan: 'pro'; basis: 'active_beta_tester' | 'founder_witness' }
  | { admitted: true; plan: 'pro'; basis: 'dated_beta_grant'; expiresAt: string }
  | { admitted: true; plan: 'free'; basis: 'grant_lapsed' | 'grant_revoked'; endedAt: string | null }
  | { admitted: false; plan: null; basis: 'not_in_pilot' };

const OUT: WritersStudioStanding = { admitted: false, plan: null, basis: 'not_in_pilot' };

/** Pure decision, so every rule is testable without a database. `grant` is null when the grant log was not read. */
export function decideStanding(input: {
  founder: boolean;
  legacyBeta: boolean;
  mode: BetaGrantMode;
  grant: BetaGrantDecision | null;
  gateOn: boolean;
}): WritersStudioStanding {
  if (input.founder) return { admitted: true, plan: 'pro', basis: 'founder_witness' };

  if (input.mode !== 'legacy' && input.grant) {
    const grant = input.grant;
    if (grant.active) {
      return { admitted: true, plan: 'pro', basis: 'dated_beta_grant', expiresAt: grant.expiresAt.toISOString() };
    }
    if (grant.hasHistory) {
      // The grant alone decides now, in transition mode too: the legacy boolean never lifts an ended grant back to Pro.
      if (!input.gateOn) return OUT;
      return {
        admitted: true,
        plan: 'free',
        basis: grant.ended === 'revoked' ? 'grant_revoked' : 'grant_lapsed',
        endedAt: grant.endedAt ? grant.endedAt.toISOString() : null,
      };
    }
    if (input.mode === 'dated') return OUT;
  }

  if (input.legacyBeta) return { admitted: true, plan: 'pro', basis: 'active_beta_tester' };
  return OUT;
}

/** Beta Pro, projected from standing. A Free standing is not beta Pro. */
export function betaAccessFromStanding(standing: WritersStudioStanding): WritersStudioBetaAccess {
  if (!standing.admitted || standing.plan !== 'pro') return { eligible: false, basis: 'not_in_pilot' };
  if (standing.basis === 'dated_beta_grant') {
    return { eligible: true, basis: 'dated_beta_grant', expiresAt: standing.expiresAt };
  }
  return { eligible: true, basis: standing.basis };
}

export async function writersStudioStanding(
  memberId: string,
  env: Record<string, string | undefined> = process.env,
): Promise<WritersStudioStanding> {
  const result = await query<{ beta: boolean; founder: boolean }>(
    `SELECT
       EXISTS (
         SELECT 1 FROM ops_contacts c
          WHERE c.member_id = $1
            AND c.deleted_at IS NULL
            AND c.contact_type = 'beta_tester'
            AND c.pipeline_stage = 'active'
            AND c.metadata @> '{"writers_studio_beta": true}'::jsonb
       ) AS beta,
       EXISTS (
         SELECT 1 FROM members m
          WHERE m.id = $1 AND m.admin_role IN ('founder','cto')
       ) AS founder`,
    [memberId],
  );
  const row = result.rows[0];
  const founder = Boolean(row?.founder);
  const mode = betaGrantMode(env);
  // Founder/CTO and legacy mode never read the grant log.
  const grant = !founder && mode !== 'legacy' ? await activeBetaGrant(memberId) : null;
  return decideStanding({ founder, legacyBeta: Boolean(row?.beta), mode, grant, gateOn: proGateEnabled(env) });
}

export async function writersStudioBetaAccess(memberId: string): Promise<WritersStudioBetaAccess> {
  return betaAccessFromStanding(await writersStudioStanding(memberId));
}

/**
 * Is this member admitted to the Studio? Their standing (beta Pro, or Free after their own dated grant ended — design
 * #2263), or — while Free admission is open (step B, founder ruling 2026-11-02 "ADMIT FREE NOW"; ./freeAdmission.ts) —
 * any signed-in member on the Free plan. Same decision as admissionServer.writerStudioAdmissionForMember, for routes
 * that resolve access themselves. Accepts a standing (`admitted`) or a beta access answer (`eligible`).
 */
export function admittedToStudio(access: { admitted: boolean } | { eligible: boolean }): boolean {
  return ('admitted' in access ? access.admitted : access.eligible) || freeAdmissionOpen();
}

