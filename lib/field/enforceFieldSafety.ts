// backend — lib/field/enforceFieldSafety.ts

import { routePanconsciousField } from './panconsciousFieldRouter';
import { getFieldSafetyCopy } from './fieldSafetyCopy';
import type { CognitiveProfile } from '../consciousness/cognitiveProfileService';
import type { FieldRoutingDecision } from './panconsciousFieldRouter';

export type FieldSafetyDecision = {
  allowed: boolean;
  message?: string;
  elementalNote?: string;
  fieldRouting: FieldRoutingDecision;
};

export type FieldSafetyContext = 'maia' | 'oracle' | 'field' | 'between' | 'unknown';

/**
 * Enforce Field Safety
 *
 * Reusable guard function for checking if a user is safe for field/symbolic work.
 * Call this at the top of API routes, services, and agents before proceeding.
 *
 * @returns { allowed: true } if safe to proceed, { allowed: false, message } if blocked
 */
export function enforceFieldSafety(args: {
  cognitiveProfile: CognitiveProfile | null | undefined;
  element?: string | null;
  userName?: string | null;
  facet?: string | null;
  archetype?: string | null;
  bloomLevel?: number | null;
  context?: FieldSafetyContext;
}): FieldSafetyDecision {
  const {
    cognitiveProfile,
    element,
    userName,
    facet,
    archetype,
    bloomLevel,
    context = 'unknown',
  } = args;

  // Route field work based on cognitive capacity
  const fieldRouting = routePanconsciousField({
    cognitiveProfile,
    element,
    facet,
    archetype,
    bloomLevel,
  });

  // If field work is safe, allow
  if (fieldRouting.fieldWorkSafe) {
    return { allowed: true, fieldRouting };
  }

  // Otherwise, get mythic boundary message
  const copy = getFieldSafetyCopy({
    fieldRouting,
    element,
    userName,
  });

  console.log(
    `🛡️  [Field Safety Guard] Blocked ${context} request - ` +
      `fieldWorkSafe=false, realm=${fieldRouting.realm}, ` +
      `user=${userName || 'unknown'}`,
  );

  return {
    allowed: false,
    message: copy.message,
    elementalNote: copy.elementalNote,
    fieldRouting,
  };
}

/**
 * Quick check: is field work safe?
 * Use when you just need a boolean, not the full message.
 */
export function isFieldWorkSafe(
  cognitiveProfile: CognitiveProfile | null | undefined,
): boolean {
  if (!cognitiveProfile) return false;

  const fieldRouting = routePanconsciousField({ cognitiveProfile });
  return fieldRouting.fieldWorkSafe;
}

/**
 * Quick check: is deep symbolic work recommended?
 * Use when you need to know if upperworld access is granted.
 */
export function isDeepWorkRecommended(
  cognitiveProfile: CognitiveProfile | null | undefined,
): boolean {
  if (!cognitiveProfile) return false;

  const fieldRouting = routePanconsciousField({ cognitiveProfile });
  return fieldRouting.deepWorkRecommended;
}
