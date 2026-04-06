/**
 * Unified Trust Middleware — checkAccess()
 *
 * The single load-bearing seam through which all meaning-moving operations pass.
 * Orchestrates existing governance logic rather than reimplementing it.
 *
 * One seam, many callers. No new permissions framework.
 *
 * Checks (in order):
 * 1. Actor identity validation
 * 2. Relationship/ownership verification (via lib/practitioner/auth.ts)
 * 3. Privacy envelope compatibility (via lib/trust/service.ts)
 * 4. Meaning expansion boundary (generate/send actions)
 * 5. AI permission (via isAiPermittedAdapter)
 * 6. Inference classification (Phase 3)
 * 7. Meaning expansion scoring (Phase 3)
 * 8. Disclosure policy (Phase 3 — context-shaped, deterministic)
 * 9. Expression profile (Phase 3)
 */

import type {
  CheckAccessInput,
  CheckAccessResult,
  VisibilityScope,
  PrivacyMode,
} from './types';
import { MEANING_EXPANDING_ACTIONS } from './types';
import { getSessionPrivacy } from './service';
import { resolveAiPermission } from './isAiPermittedAdapter';
import { classifyInference } from './classifyInference';
import { getMeaningExpansionLevel } from './getMeaningExpansionLevel';
import { getDisclosurePolicy } from './getDisclosurePolicy';
import { getExpressionProfile } from './getExpressionProfile';
import { verifySessionAccess, verifyContainerAccess } from '@/lib/practitioner/auth';

/**
 * Central trust decision. All protected routes call this before:
 * - reading relational/private data
 * - synthesizing meaning across boundaries
 * - sending communication outward
 * - exposing memory-derived content to AI
 */
export async function checkAccess(input: CheckAccessInput): Promise<CheckAccessResult> {
  const now = new Date().toISOString();
  const {
    actorId,
    memberId,
    resourceType,
    resourceId,
    action,
    channel,
    useAI = false,
    relationshipContext,
    requestedScope,
  } = input;

  // ── 1. Actor identity ──────────────────────────────────────
  if (!actorId) {
    return {
      allowed: false,
      reasonCode: 'no_actor',
      humanMessage: 'Authentication required.',
      trustCheckedAt: now,
    };
  }

  // ── 2. Relationship / ownership check ──────────────────────
  // Only enforce for resource types that have relational ownership
  if (relationshipContext?.sessionId && (resourceType === 'session' || resourceType === 'artifact' || resourceType === 'transcript')) {
    const hasAccess = await verifySessionAccess(relationshipContext.sessionId, actorId);
    if (!hasAccess) {
      // Check if the actor IS the member (member accessing own session)
      const isMemberSelf = memberId && actorId === memberId;
      if (!isMemberSelf) {
        return {
          allowed: false,
          reasonCode: 'no_relationship',
          humanMessage: 'You do not have access to this resource.',
          trustCheckedAt: now,
        };
      }
    }
  }

  if (relationshipContext?.containerId) {
    const hasAccess = await verifyContainerAccess(relationshipContext.containerId, actorId);
    if (!hasAccess) {
      const isMemberSelf = memberId && actorId === memberId;
      if (!isMemberSelf) {
        return {
          allowed: false,
          reasonCode: 'no_container_access',
          humanMessage: 'You do not have access to this container.',
          trustCheckedAt: now,
        };
      }
    }
  }

  // ── 3. Privacy envelope ────────────────────────────────────
  let allowedScope: VisibilityScope | undefined;
  const sessionId = relationshipContext?.sessionId || resourceId;

  if (sessionId && (resourceType === 'session' || resourceType === 'artifact' || resourceType === 'transcript')) {
    try {
      const privacy = await getSessionPrivacy(sessionId);
      if (privacy) {
        allowedScope = privacy.visibilityScope;

        // Check requested scope against allowed scope
        if (requestedScope) {
          const scopeOrder: VisibilityScope[] = ['member_only', 'member_and_practitioner', 'care_team'];
          const requestedIdx = scopeOrder.indexOf(requestedScope);
          const allowedIdx = scopeOrder.indexOf(privacy.visibilityScope);

          if (requestedIdx > allowedIdx) {
            return {
              allowed: false,
              reasonCode: 'scope_exceeds_envelope',
              humanMessage: 'The requested visibility exceeds this session\'s privacy settings.',
              allowedScope: privacy.visibilityScope,
              trustCheckedAt: now,
            };
          }
        }
      }
    } catch {
      // Session may not exist in rl_sessions (e.g. regular MAIA chat).
      // Fail open — the gate only blocks when explicitly configured.
    }
  }

  // ── 4. Meaning expansion boundary ─────────────────────────
  const meaningExpansion = MEANING_EXPANDING_ACTIONS.includes(action);

  // ── 5. AI permission ───────────────────────────────────────
  let aiPermitted = true;
  let aiDenialReason: string | undefined;

  if (useAI || meaningExpansion) {
    const aiResult = await resolveAiPermission({
      memberId: memberId || actorId,
      sessionId: relationshipContext?.sessionId || resourceId,
      resourceType,
      resourceId,
    });

    aiPermitted = aiResult.permitted;
    aiDenialReason = aiResult.reason;
  }

  // ── 6. Inference classification (Phase 3) ──────────────────
  const outwardBound = channel === 'comms' || action === 'send' || action === 'share';
  const multiSource = !!relationshipContext && (resourceType === 'session' || resourceType === 'transcript');

  const inferenceType = classifyInference({
    action,
    channel,
    resourceType,
    aiAssisted: useAI && aiPermitted,
    multiSource,
    outwardBound,
    purpose: input.purpose,
  });

  // ── 7. Meaning expansion scoring (Phase 3) ────────────────
  const meaningExpansionLevel = getMeaningExpansionLevel({
    inferenceType,
    channel,
    multiSource,
    outwardBound,
  });

  // ── 8. Disclosure policy (Phase 3) ────────────────────────
  // Resolve privacy mode for disclosure policy
  let privacyMode: PrivacyMode | undefined;
  if (sessionId) {
    try {
      const privacy = await getSessionPrivacy(sessionId);
      if (privacy) privacyMode = privacy.privacyMode;
    } catch {
      // Already checked above, safe to ignore here
    }
  }

  // Determine relationship type from context
  const relationship = memberId && actorId !== memberId
    ? 'practitioner_to_client' as const
    : 'self' as const;

  const disclosure = getDisclosurePolicy({
    channel,
    inferenceType,
    expansionLevel: meaningExpansionLevel,
    relationship,
    privacyMode,
    aiAssisted: useAI && aiPermitted,
    sessionDerived: resourceType === 'session' || resourceType === 'transcript',
  });

  // ── 9. Expression profile (Phase 3) ───────────────────────
  const expressionProfile = getExpressionProfile({
    channel,
    inferenceType,
    expansionLevel: meaningExpansionLevel,
    relationship,
    privacyMode,
    aiPermitted,
  });

  // Log high-expansion outward cases for observation.
  // Structured for post-deploy pattern analysis:
  // "Where are high-expansion events happening, and are they handled correctly?"
  if (meaningExpansionLevel === 'high' && outwardBound) {
    console.log('[Trust] High-expansion outward event', JSON.stringify({
      route: channel,
      inferenceType,
      expansionLevel: meaningExpansionLevel,
      expressionProfile,
      relationshipType: relationship,
      disclosureApplied: disclosure.required,
      disclosureReason: disclosure.reason,
    }));
  }

  // ── Result ─────────────────────────────────────────────────
  return {
    allowed: true,
    reasonCode: 'permitted',
    aiPermitted,
    aiDenialReason,
    allowedScope,
    disclosureRequired: disclosure.required,
    disclosureText: disclosure.text || undefined,
    meaningExpansion,
    trustCheckedAt: now,
    // Phase 3 fields
    inferenceType,
    meaningExpansionLevel,
    expressionProfile,
  };
}
