/**
 * AI Permission Adapter
 *
 * Bridges the unified trust middleware to the existing memory governance
 * and AI veto path. Does NOT reimplement policy — delegates to isAiPermitted()
 * in service.ts and supplements with member-level contract checks.
 *
 * Accepts expanded input (not just sessionId) because trust decisions
 * are not always session-bound — artifacts, messages, and memory all
 * have independent governance.
 */

import { isAiPermitted as isAiPermittedForSession, getActiveContracts } from './service';
import type { AiPermissionResult, TrustResourceType } from './types';

export interface AiPermissionInput {
  memberId?: string;
  sessionId?: string;
  resourceType: TrustResourceType;
  resourceId?: string;
}

/**
 * Resolve whether AI may participate in processing this data path.
 *
 * Precedence:
 * 1. Session-level gate (existing waterfall in service.ts) — if sessionId provided
 * 2. Member-level contracts with never_use_for_ai — if memberId provided
 * 3. Default: permit (fail open for paths without governance)
 */
export async function resolveAiPermission(input: AiPermissionInput): Promise<AiPermissionResult> {
  const { memberId, sessionId, resourceType } = input;

  // 1. Session-level gate — delegates to existing waterfall
  if (sessionId) {
    try {
      const sessionGate = await isAiPermittedForSession(sessionId);
      if (!sessionGate.permitted) {
        return { permitted: false, reason: sessionGate.reason };
      }
    } catch {
      // isAiPermitted fails when session doesn't exist in rl_sessions
      // (e.g. regular MAIA chat). Fail open — the gate only blocks
      // when a session explicitly opts out.
    }
  }

  // 2. Member-level contracts — check for blanket AI veto
  if (memberId) {
    try {
      const contracts = await getActiveContracts(memberId, {
        sessionId: sessionId ?? undefined,
      });

      for (const contract of contracts) {
        if (contract.never_use_for_ai) {
          return {
            permitted: false,
            reason: 'member_contract_never_use_for_ai',
          };
        }
      }
    } catch {
      // Contract lookup failure — fail open, don't block the member
    }
  }

  // 3. Default: permit
  return { permitted: true };
}
