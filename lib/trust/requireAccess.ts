/**
 * Route-level trust helper
 *
 * Thin wrapper around checkAccess() for API route handlers.
 * Resolves actorId from request, calls checkAccess, and returns
 * standardized error responses when denied.
 *
 * Does NOT parse business logic, build disclosure, or alter behavior.
 * Only: resolve actor → check → respond if denied → return result.
 */

import { NextResponse } from 'next/server';
import { checkAccess } from './checkAccess';
import type { CheckAccessInput, CheckAccessResult } from './types';
import { requireMemberId } from '@/lib/auth/session';

type RequireAccessInput = Omit<CheckAccessInput, 'actorId'>;

type RequireAccessSuccess = {
  ok: true;
  actorId: string;
  result: CheckAccessResult;
};

type RequireAccessDenied = {
  ok: false;
  response: NextResponse;
};

export type RequireAccessOutcome = RequireAccessSuccess | RequireAccessDenied;

/**
 * Resolve actor from session, run checkAccess, return standardized response if denied.
 *
 * Usage in route:
 *   const access = await requireAccess({ resourceType: 'session', action: 'generate', ... });
 *   if (!access.ok) return access.response;
 *   // access.result is the full CheckAccessResult
 */
export async function requireAccess(input: RequireAccessInput): Promise<RequireAccessOutcome> {
  let actorId: string;
  try {
    actorId = await requireMemberId();
  } catch {
    return {
      ok: false,
      response: NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      ),
    };
  }

  const result = await checkAccess({ ...input, actorId });

  if (!result.allowed) {
    const status = result.reasonCode === 'no_actor' ? 401
      : result.reasonCode === 'scope_exceeds_envelope' ? 409
      : 403;

    return {
      ok: false,
      response: NextResponse.json(
        {
          error: result.humanMessage || 'Access denied',
          reasonCode: result.reasonCode,
          ...(result.allowedScope && { allowedScope: result.allowedScope }),
          ...(result.disclosureRequired && { disclosureRequired: true }),
        },
        { status }
      ),
    };
  }

  return { ok: true, actorId, result };
}
