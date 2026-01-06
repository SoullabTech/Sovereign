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
    spiral_movement?: string;
    note?: string;
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
      recent_memory_count: recentMem.length,
      semantic_hits_count: topHits.length,
    };

    // Build prompt
    const systemPrompt = `You are MAIA assisting a licensed practitioner with a private case consultation.
You must be practical, grounded, and avoid diagnosis claims. Use tentative language.
Return ONLY valid JSON matching this schema:

{
  "case_summary": "string - brief overview of case dynamics",
  "themes_emerging": ["array of key themes you observe"],
  "working_hypotheses": ["clinical hypotheses to consider"],
  "next_session_focus": ["recommended areas for next session"],
  "suggested_interventions": ["practical interventions to try"],
  "questions_to_ask": ["questions that might deepen inquiry"],
  "risks_or_watchouts": ["things to monitor or be cautious about"],
  "elemental_reflection": {
    "element_focus": "primary element at play (earth/water/fire/air/aether)",
    "spiral_movement": "any spiral stage transitions observed",
    "note": "brief elemental/spiralogic insight"
  }
}

Guidelines:
- Honor the practitioner's clinical judgment
- Offer observations, not prescriptions
- Ask questions that deepen inquiry
- Ground insights in the Spiralogic framework when relevant
- Be a peer consultant, not the therapist`;

    const userInput = `CASE CONTEXT:
${JSON.stringify(contextProvided.case, null, 2)}

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
        created_at
      ) VALUES ($1, $2, $3, $4, $5::jsonb, $6, $7, NOW())
      RETURNING *`,
      [
        memberId,
        caseId,
        consultationType,
        practitionerQuery,
        JSON.stringify(contextProvided),
        JSON.stringify(parsedResponse),
        result.provider?.model || 'unknown',
      ]
    );

    return rows[0];
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

    return rows;
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

    return rows[0] || null;
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

    const { rows } = await query(
      `UPDATE maia_consultations
       SET practitioner_rating = $1,
           practitioner_feedback = $2
       WHERE id = $3
         AND practitioner_id = $4
       RETURNING *`,
      [rating, feedback || null, consultationId, memberId]
    );

    return rows[0] || null;
  }
}
