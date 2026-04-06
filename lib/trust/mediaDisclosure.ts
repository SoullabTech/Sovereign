/**
 * Media Disclosure — Trust Seam for Media Studio
 *
 * Single insertion point called before any output leaves Media Studio:
 * exports, Descript links, shares, publishes.
 *
 * Reuses existing trust layer functions (isAiPermitted, getSessionPrivacy)
 * and extends them with media-specific meaning classification.
 */

import { query } from '@/lib/db/postgres';
import { isAiPermitted, getSessionPrivacy } from './service';
import type {
  MediaDisclosureInput,
  MediaDisclosureResult,
  MeaningExpansionLevel,
} from './types';

/**
 * Evaluate whether a media action is permitted.
 *
 * Gate order:
 * 1. Session inheritance (if source_session_id exists)
 * 2. Privacy level gates
 * 3. Consent gates
 * 4. Feature-specific gates (publishing, external editing)
 * 5. Meaning expansion scrutiny (high expansion + outward action)
 * 6. Redaction check
 */
export async function evaluateMediaDisclosure(
  input: MediaDisclosureInput
): Promise<MediaDisclosureResult> {
  // Load project row
  const result = await query(
    `SELECT privacy_level, contains_sensitive_content, client_consent_status,
            external_editing_allowed, publishing_allowed, redaction_required,
            ai_processing_allowed, inference_type, expansion_level,
            source_session_id
     FROM media_projects WHERE id = $1`,
    [input.projectId]
  );

  if (result.rows.length === 0) {
    return {
      allowed: false,
      reason: 'project_not_found',
      redactionRequired: false,
      privacyLevel: 'private',
      consentStatus: 'not_required',
    };
  }

  const project = result.rows[0];
  let effectivePrivacy = project.privacy_level;
  const consentStatus = project.client_consent_status;

  // ── 1. Session inheritance ───────────────────────────────

  if (project.source_session_id) {
    const sessionPrivacy = await getSessionPrivacy(project.source_session_id);

    if (sessionPrivacy) {
      // Session privacy overrides project privacy
      if (sessionPrivacy.privacyMode === 'confidential') {
        effectivePrivacy = 'confidential';
      } else if (sessionPrivacy.privacyMode === 'sensitive' && effectivePrivacy !== 'confidential') {
        effectivePrivacy = 'sensitive';
      }

      // Session export gate
      if (!sessionPrivacy.allowExport) {
        console.log(`[Trust] media-disclosure BLOCKED { projectId: ${input.projectId}, action: ${input.action}, reason: session_export_disabled }`);
        return {
          allowed: false,
          reason: 'session_export_disabled',
          redactionRequired: project.redaction_required,
          privacyLevel: effectivePrivacy,
          consentStatus,
        };
      }
    }

    // AI permission check for AI-generated outputs
    if (input.action === 'export' || input.action === 'publish') {
      const aiResult = await isAiPermitted(project.source_session_id);
      if (!aiResult.permitted) {
        console.log(`[Trust] media-disclosure BLOCKED { projectId: ${input.projectId}, action: ${input.action}, reason: ${aiResult.reason} }`);
        return {
          allowed: false,
          reason: `session_ai_blocked:${aiResult.reason}`,
          redactionRequired: project.redaction_required,
          privacyLevel: effectivePrivacy,
          consentStatus,
        };
      }
    }
  }

  // ── 2. Privacy level gates ───────────────────────────────

  if (effectivePrivacy === 'confidential') {
    console.log(`[Trust] media-disclosure BLOCKED { projectId: ${input.projectId}, action: ${input.action}, reason: confidential_privacy }`);
    return {
      allowed: false,
      reason: 'confidential_privacy',
      redactionRequired: project.redaction_required,
      privacyLevel: effectivePrivacy,
      consentStatus,
    };
  }

  // ── 3. Consent gates ─────────────────────────────────────

  if (consentStatus === 'denied') {
    console.log(`[Trust] media-disclosure BLOCKED { projectId: ${input.projectId}, action: ${input.action}, reason: consent_denied }`);
    return {
      allowed: false,
      reason: 'consent_denied',
      redactionRequired: project.redaction_required,
      privacyLevel: effectivePrivacy,
      consentStatus,
    };
  }

  if (consentStatus === 'pending' && input.action === 'publish') {
    console.log(`[Trust] media-disclosure BLOCKED { projectId: ${input.projectId}, action: ${input.action}, reason: consent_pending_publish }`);
    return {
      allowed: false,
      reason: 'consent_pending_publish',
      redactionRequired: project.redaction_required,
      privacyLevel: effectivePrivacy,
      consentStatus,
    };
  }

  // ── 4. Feature-specific gates ────────────────────────────

  if (!project.publishing_allowed && input.action === 'publish') {
    console.log(`[Trust] media-disclosure BLOCKED { projectId: ${input.projectId}, action: ${input.action}, reason: publishing_not_allowed }`);
    return {
      allowed: false,
      reason: 'publishing_not_allowed',
      redactionRequired: project.redaction_required,
      privacyLevel: effectivePrivacy,
      consentStatus,
    };
  }

  if (!project.external_editing_allowed && input.action === 'descript_link') {
    console.log(`[Trust] media-disclosure BLOCKED { projectId: ${input.projectId}, action: ${input.action}, reason: external_editing_not_allowed }`);
    return {
      allowed: false,
      reason: 'external_editing_not_allowed',
      redactionRequired: project.redaction_required,
      privacyLevel: effectivePrivacy,
      consentStatus,
    };
  }

  // ── 5. Meaning expansion scrutiny ────────────────────────

  const expansionLevel = (input.expansionLevel || project.expansion_level || 'none') as MeaningExpansionLevel;

  // High expansion + outward actions get extra scrutiny
  if (expansionLevel === 'high' && (input.action === 'publish' || input.action === 'share')) {
    // For high expansion outward actions, sensitive content requires consent
    if (project.contains_sensitive_content && consentStatus !== 'obtained') {
      console.log(`[Trust] media-disclosure BLOCKED { projectId: ${input.projectId}, action: ${input.action}, reason: high_expansion_sensitive_no_consent, expansionLevel: ${expansionLevel} }`);
      return {
        allowed: false,
        reason: 'high_expansion_sensitive_no_consent',
        redactionRequired: true,
        privacyLevel: effectivePrivacy,
        consentStatus,
        expansionLevel,
      };
    }
  }

  // ── 6. Allowed ───────────────────────────────────────────

  console.log(`[Trust] media-disclosure ALLOWED { projectId: ${input.projectId}, action: ${input.action}, privacyLevel: ${effectivePrivacy}, expansionLevel: ${expansionLevel} }`);

  return {
    allowed: true,
    redactionRequired: project.redaction_required,
    privacyLevel: effectivePrivacy,
    consentStatus,
    expansionLevel,
  };
}

/**
 * Classify media content meaning after transcription.
 * Stores inference_type and expansion_level on the project.
 *
 * Heuristic classification based on transcript content.
 * Will be replaced by the full inference pipeline when
 * conversation trust Phase 3 lands.
 */
export async function classifyMediaContent(
  projectId: string,
  transcriptText: string
): Promise<{ inferenceType: string; expansionLevel: MeaningExpansionLevel }> {
  // Heuristic classification
  const lower = transcriptText.toLowerCase();

  let inferenceType = 'informational';
  let expansionLevel: MeaningExpansionLevel = 'low';

  // Detect sensitive/therapeutic content
  const sensitiveMarkers = [
    'therapy', 'session', 'client', 'diagnosis', 'treatment',
    'trauma', 'anxiety', 'depression', 'suicide', 'self-harm',
    'abuse', 'medication', 'confidential',
  ];
  const relationalMarkers = [
    'relationship', 'family', 'partner', 'parent', 'child',
    'attachment', 'boundary', 'trust', 'intimacy',
  ];
  const personalMarkers = [
    'i feel', 'my experience', 'personally', 'my story',
    'i struggle', 'i remember', 'when i was',
  ];

  const sensitiveCount = sensitiveMarkers.filter(m => lower.includes(m)).length;
  const relationalCount = relationalMarkers.filter(m => lower.includes(m)).length;
  const personalCount = personalMarkers.filter(m => lower.includes(m)).length;

  if (sensitiveCount >= 3) {
    inferenceType = 'sensitive_synthesis';
    expansionLevel = 'high';
  } else if (relationalCount >= 2) {
    inferenceType = 'relational_inference';
    expansionLevel = 'moderate';
  } else if (personalCount >= 2) {
    inferenceType = 'personal_disclosure';
    expansionLevel = 'moderate';
  } else if (sensitiveCount >= 1 || relationalCount >= 1) {
    expansionLevel = 'low';
    inferenceType = relationalCount > 0 ? 'relational_inference' : 'informational';
  }

  // Store on project
  await query(
    `UPDATE media_projects SET inference_type = $1, expansion_level = $2, updated_at = NOW()
     WHERE id = $3`,
    [inferenceType, expansionLevel, projectId]
  );

  console.log(`[Trust] media-classify { projectId: ${projectId}, inferenceType: ${inferenceType}, expansionLevel: ${expansionLevel} }`);

  return { inferenceType, expansionLevel };
}
