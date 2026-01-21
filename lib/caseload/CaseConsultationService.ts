/**
 * CASE CONSULTATION SERVICE
 *
 * Generates MAIA consultations for practitioner cases using:
 * - Case patterns (themes, interventions, elements)
 * - Recent memory chunks
 * - Semantic search hits
 *
 * Uses local Ollama model for sovereignty compliance.
 */

import { query } from '@/lib/db/postgres';
import { generateWithLocalModel } from '@/lib/ai/localModelClient';
import { CaseStore } from './CaseStore';
import { CaseMemoryService } from './CaseMemoryService';
import { CasePatternService } from './CasePatternService';
import { getSpiralogicContext, analyzeThemesThroughSpiralogic } from './SpiralogicConsultationContext';
import {
  encryptConsultationCreate,
  encryptConsultationFeedback,
  sanitizeConsultationRow,
  sanitizeConsultationRows,
  isPHIEncryptionEnabled,
} from '@/lib/security/phiAccessors/maiaConsultations';

// Valid consultation types per DB constraint
export type ConsultationType =
  | 'case_formulation'
  | 'intervention_planning'
  | 'pattern_analysis'
  | 'stuck_point'
  | 'supervision'
  | 'spiralogic_mapping';

export interface ConsultationResult {
  case_summary: string;
  themes_emerging: string[];
  working_hypotheses: string[];
  next_session_focus: string[];
  suggested_interventions: string[];
  questions_to_ask: string[];
  risks_or_watchouts: string[];
  elemental_reflection?: {
    element_focus?: string;
    facet_code?: string;
    core_movement?: string;
    shadow_pattern?: string;
    gold_medicine?: string;
    spiral_movement?: string;
    transition_readiness?: string;
    note?: string; // Legacy field for backwards compatibility
  };
}

export interface ConsultationRow {
  id: string;
  practitioner_id: string;
  case_id: string | null;
  consultation_type: ConsultationType;
  practitioner_query: string;
  context_provided: Record<string, unknown> | null;
  maia_response: string;
  practitioner_rating: number | null;
  practitioner_feedback: string | null;
  model_used: string | null;
  tokens_used: number | null;
  created_at: string;
}

function safeJsonParse<T>(text: string): T {
  // Strip markdown code blocks if present
  const cleaned = text
    .trim()
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();
  return JSON.parse(cleaned) as T;
}

export class CaseConsultationService {
  /**
   * Generate a new MAIA consultation for a case
   */
  static async generate(params: {
    caseId: string;
    memberId: string;
    consultationType?: ConsultationType;
    focus?: string; // Optional practitioner query/focus
  }): Promise<ConsultationRow> {
    const {
      caseId,
      memberId,
      consultationType = 'pattern_analysis',
      focus,
    } = params;

    // Gather context
    const caseData = await CaseStore.getCase(caseId, memberId);
    if (!caseData) {
      throw new Error('Case not found');
    }

    const patternsRow = await CasePatternService.get(caseId);
    const recentMem = await CaseMemoryService.listRecent({ caseId, limit: 18 });

    // Build semantic query
    const practitionerQuery = focus?.trim()
      ? focus.trim()
      : 'Summarize the case themes, risks, and best next-session focus with suggested interventions.';

    // Get semantic hits
    const topHits = await CaseMemoryService.searchSimilar({
      caseId,
      query: practitionerQuery,
      topK: 10,
    });

    // Build Spiralogic context from case data
    const spiralogicContext = getSpiralogicContext({
      facetCode: caseData.facet_code,
      primaryElement: caseData.primary_element,
      spiralStage: caseData.spiral_stage,
    });

    // Analyze themes through Spiralogic if patterns exist
    const patternThemes = patternsRow?.summary?.themesTop?.map(t => t.value) || [];
    const themeAnalysis = analyzeThemesThroughSpiralogic(patternThemes);

    // Build context for MAIA
    const contextProvided = {
      case: {
        id: caseData.id,
        client_identifier: caseData.client_identifier,
        case_status: caseData.case_status,
        privacy_mode: caseData.privacy_mode,
        presenting_concerns: caseData.presenting_concerns,
        primary_element: caseData.primary_element,
        spiral_stage: caseData.spiral_stage,
        facet_code: caseData.facet_code,
      },
      patterns: patternsRow?.summary || null,
      spiralogic: {
        currentFacet: spiralogicContext.currentFacet?.code || null,
        coreMovement: spiralogicContext.coreMovement,
        coreQuestion: spiralogicContext.coreQuestion,
        themeAnalysis: themeAnalysis.reasoning,
      },
      recent_memory_count: recentMem.length,
      semantic_hits_count: topHits.length,
    };

    // Build prompt with Spiralogic integration
    const systemPrompt = `You are MAIA assisting a licensed practitioner with a private case consultation.
You must be practical, grounded, and avoid diagnosis claims. Use tentative language.

You are deeply grounded in the SPIRALOGIC FRAMEWORK - a 12-phase elemental alchemy system:
- Four Elements cycle: Fire (initiation/action) → Water (feeling/descent) → Earth (form/embodiment) → Air (meaning/transmission)
- Each element has 3 phases: Cardinal (1 - opening), Fixed (2 - deepening), Mutable (3 - integration/transition)
- Facet codes: F1-F3 (Fire), W1-W3 (Water), E1-E3 (Earth), A1-A3 (Air)

Return ONLY valid JSON matching this schema:

{
  "case_summary": "string - brief overview of case dynamics through Spiralogic lens",
  "themes_emerging": ["array of key themes you observe"],
  "working_hypotheses": ["clinical hypotheses grounded in elemental patterns"],
  "next_session_focus": ["recommended areas for next session"],
  "suggested_interventions": ["practical interventions aligned with current facet"],
  "questions_to_ask": ["questions that might deepen inquiry - include canonical questions for the facet"],
  "risks_or_watchouts": ["things to monitor, including shadow patterns for current facet"],
  "elemental_reflection": {
    "element_focus": "primary element at play (fire/water/earth/air)",
    "facet_code": "current facet code if identifiable (F1, W2, E3, etc.)",
    "core_movement": "what movement is being asked of this person",
    "shadow_pattern": "shadow patterns to watch for",
    "gold_medicine": "therapeutic direction/gold medicine",
    "spiral_movement": "any phase transitions observed or approaching",
    "transition_readiness": "is the client ready to move to next phase? what signs?"
  }
}

Guidelines:
- Honor the practitioner's clinical judgment
- Offer observations, not prescriptions
- Ask questions that deepen inquiry - USE THE CANONICAL QUESTIONS for the current facet
- Ground ALL insights in the Spiralogic framework
- Watch for shadow patterns specific to the facet
- Point toward the gold medicine (therapeutic direction)
- Be a peer consultant, not the therapist`;

    const userInput = `CASE CONTEXT:
${JSON.stringify(contextProvided.case, null, 2)}

${spiralogicContext.spiralogicPromptSection}

${themeAnalysis.suggestedElement ? `\nTHEME ANALYSIS: ${themeAnalysis.reasoning}` : ''}

PATTERN SUMMARY:
${JSON.stringify(patternsRow?.summary || 'No patterns computed yet', null, 2)}

RECENT MEMORY (chronological, newest first):
${recentMem
  .slice(0, 10)
  .map((m) => `- [${m.source_type}] ${m.occurred_at}: ${m.content.slice(0, 350)}`)
  .join('\n') || 'No recent memories'}

SEMANTIC HITS (most relevant to query):
${topHits
  .map((m) => `- (${((m.similarity || 0) * 100).toFixed(0)}%) [${m.source_type}] ${m.occurred_at}: ${m.content.slice(0, 400)}`)
  .join('\n') || 'No semantic hits'}

PRACTITIONER QUERY:
${practitionerQuery}

CONSULTATION TYPE: ${consultationType}`;

    // Generate with local model
    const result = await generateWithLocalModel({
      systemPrompt,
      userInput,
    });

    let parsedResponse: ConsultationResult;
    try {
      parsedResponse = safeJsonParse<ConsultationResult>(result.text);
    } catch (parseErr) {
      // If JSON parsing fails, wrap raw text in a basic structure
      console.warn('[CaseConsultation] JSON parse failed, using raw response');
      parsedResponse = {
        case_summary: result.text.slice(0, 500),
        themes_emerging: [],
        working_hypotheses: [],
        next_session_focus: [],
        suggested_interventions: [],
        questions_to_ask: [],
        risks_or_watchouts: [],
      };
    }

    // SECURITY: Dual-write encrypted columns if PHI encryption is enabled
    const tempId = crypto.randomUUID();
    let encryptedColumns: {
      practitioner_query_enc?: string;
      practitioner_query_enc_meta?: string;
      context_provided_enc?: string;
      context_provided_enc_meta?: string;
      maia_response_enc?: string;
      maia_response_enc_meta?: string;
    } = {};

    if (isPHIEncryptionEnabled()) {
      encryptedColumns = encryptConsultationCreate(
        {
          practitioner_query: practitionerQuery,
          context_provided: contextProvided,
          maia_response: JSON.stringify(parsedResponse),
        },
        { rowId: tempId, practitionerId: memberId }
      );
    }

    // Store in maia_consultations table
    const { rows } = await query(
      `INSERT INTO maia_consultations (
        practitioner_id,
        case_id,
        consultation_type,
        practitioner_query,
        context_provided,
        maia_response,
        model_used,
        practitioner_query_enc,
        practitioner_query_enc_meta,
        context_provided_enc,
        context_provided_enc_meta,
        maia_response_enc,
        maia_response_enc_meta,
        created_at
      ) VALUES ($1, $2, $3, $4, $5::jsonb, $6, $7, $8, $9, $10, $11, $12, $13, NOW())
      RETURNING *`,
      [
        memberId,
        caseId,
        consultationType,
        practitionerQuery,
        JSON.stringify(contextProvided),
        JSON.stringify(parsedResponse),
        result.provider?.model || 'unknown',
        encryptedColumns.practitioner_query_enc || null,
        encryptedColumns.practitioner_query_enc_meta || null,
        encryptedColumns.context_provided_enc || null,
        encryptedColumns.context_provided_enc_meta || null,
        encryptedColumns.maia_response_enc || null,
        encryptedColumns.maia_response_enc_meta || null,
      ]
    );

    // SECURITY: Sanitize before returning to strip *_enc columns
    return sanitizeConsultationRow(rows[0]);
  }

  /**
   * List consultations for a case
   */
  static async list(params: {
    caseId: string;
    memberId: string;
    limit?: number;
  }): Promise<ConsultationRow[]> {
    const { caseId, memberId, limit = 10 } = params;

    const { rows } = await query(
      `SELECT *
       FROM maia_consultations
       WHERE case_id = $1
         AND practitioner_id = $2
       ORDER BY created_at DESC
       LIMIT $3`,
      [caseId, memberId, limit]
    );

    // SECURITY: Sanitize before returning to strip *_enc columns
    return sanitizeConsultationRows(rows);
  }

  /**
   * Get a single consultation by ID
   */
  static async get(params: {
    consultationId: string;
    memberId: string;
  }): Promise<ConsultationRow | null> {
    const { consultationId, memberId } = params;

    const { rows } = await query(
      `SELECT *
       FROM maia_consultations
       WHERE id = $1
         AND practitioner_id = $2`,
      [consultationId, memberId]
    );

    if (!rows[0]) return null;

    // SECURITY: Sanitize before returning to strip *_enc columns
    return sanitizeConsultationRow(rows[0]);
  }

  /**
   * Rate a consultation
   */
  static async rate(params: {
    consultationId: string;
    memberId: string;
    rating: number;
    feedback?: string;
  }): Promise<ConsultationRow | null> {
    const { consultationId, memberId, rating, feedback } = params;

    if (rating < 1 || rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }

    // SECURITY: Dual-write encrypted columns if PHI encryption is enabled
    let encryptedColumns: {
      practitioner_feedback_enc?: string;
      practitioner_feedback_enc_meta?: string;
    } = {};

    if (isPHIEncryptionEnabled() && feedback) {
      encryptedColumns = encryptConsultationFeedback(
        { practitioner_feedback: feedback },
        { rowId: consultationId, practitionerId: memberId }
      );
    }

    const { rows } = await query(
      `UPDATE maia_consultations
       SET practitioner_rating = $1,
           practitioner_feedback = $2,
           practitioner_feedback_enc = $3,
           practitioner_feedback_enc_meta = $4
       WHERE id = $5
         AND practitioner_id = $6
       RETURNING *`,
      [
        rating,
        feedback || null,
        encryptedColumns.practitioner_feedback_enc || null,
        encryptedColumns.practitioner_feedback_enc_meta || null,
        consultationId,
        memberId,
      ]
    );

    if (!rows[0]) return null;

    // SECURITY: Sanitize before returning to strip *_enc columns
    return sanitizeConsultationRow(rows[0]);
  }
}
