/**
 * POST /api/studio/session-followup/generate
 *
 * Generates a parent-facing session update draft from session content.
 * Saves draft to session_artifacts. Returns structured blocks for editing.
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { query } from '@/lib/db/postgres';
import { generateText } from '@/lib/ai/modelService';
import { loadSessionData } from '@/lib/studio/followups/sessionDataLoader';
import {
  GenerateFollowupRequestSchema,
  ParentUpdateBlocksSchema,
  type GenerateFollowupRequest,
  type ParentUpdateBlocks,
} from '@/lib/studio/followups/schema';
import { buildFollowupPrompt, buildRepairPrompt } from '@/lib/studio/followups/prompts';
import { validateFollowupContent, hasMinimumFollowupContent } from '@/lib/studio/followups/contentGuards';
import { parseDraftJsonWithRepair } from '@/lib/studio/followups/parseDraftJsonWithRepair';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';

export const runtime = 'nodejs';

function json(status: number, body: unknown) {
  return NextResponse.json(body, { status });
}

export async function POST(req: NextRequest) {
  try {
    const memberId = await getMemberIdFromRequest(req);
    if (!memberId) {
      return json(401, { error: 'Not authenticated' });
    }

    const raw = await req.json();
    const input: GenerateFollowupRequest = GenerateFollowupRequestSchema.parse(raw);

    // Load session data
    const sessionData = await loadSessionData({
      sessionId: input.sessionId,
      caseId: input.clientId ?? null,
    });

    if (!sessionData) {
      return json(404, { error: 'Session not found' });
    }

    if (!sessionData.reviewableContentExists) {
      return json(400, { error: 'No reviewable content available for follow-up generation' });
    }

    // Build prompt
    const { systemPrompt, userPrompt } = buildFollowupPrompt({
      sessionData,
      tone: input.tone,
      clientName: input.clientName,
      practitionerName: input.practitionerName,
      goals: input.goals,
    });

    // Generate via Claude
    const result = await generateText({
      systemPrompt,
      userInput: userPrompt,
      meta: { source: 'session-followup-generate', sessionId: input.sessionId },
    });

    // Parse + validate with one-shot repair
    let draft: ParentUpdateBlocks = await parseDraftJsonWithRepair({
      rawText: result.text,
      schema: ParentUpdateBlocksSchema,
      repair: async ({ rawText, zodError }) => {
        const repair = buildRepairPrompt({ rawText, zodError });
        const repaired = await generateText({
          systemPrompt: repair.systemPrompt,
          userInput: repair.userPrompt,
          meta: { source: 'session-followup-repair' },
        });
        return repaired.text;
      },
    });

    // Content quality check
    if (!hasMinimumFollowupContent(draft)) {
      return json(422, { error: 'Generated draft did not meet minimum content requirements' });
    }

    const contentCheck = validateFollowupContent(draft, input.tone);

    // If content validation fails, try one regeneration
    if (!contentCheck.ok && contentCheck.shouldRegenerate) {
      const { systemPrompt: retrySystem, userPrompt: retryUser } = buildFollowupPrompt({
        sessionData,
        tone: input.tone,
        clientName: input.clientName,
        practitionerName: input.practitionerName,
        goals: input.goals,
        regenerationContext: contentCheck.reasons,
      });

      const retryResult = await generateText({
        systemPrompt: retrySystem,
        userInput: retryUser,
        meta: { source: 'session-followup-regenerate' },
      });

      draft = await parseDraftJsonWithRepair({
        rawText: retryResult.text,
        schema: ParentUpdateBlocksSchema,
        repair: async ({ rawText, zodError }) => {
          const repair = buildRepairPrompt({ rawText, zodError });
          const repaired = await generateText({
            systemPrompt: repair.systemPrompt,
            userInput: repair.userPrompt,
            meta: { source: 'session-followup-repair-2' },
          });
          return repaired.text;
        },
      });
    }

    // Save draft to session_artifacts
    const artifactResult = await query(
      `INSERT INTO session_artifacts (
        session_id, client_id, practitioner_id, artifact_type, draft_content, created_by
      ) VALUES ($1, $2, $3, 'parent_update', $4, $5)
      RETURNING id, created_at`,
      [input.sessionId, input.clientId ?? null, memberId, JSON.stringify(draft), memberId],
    );

    const artifact = artifactResult.rows[0];

    return json(200, {
      ok: true,
      artifact: {
        id: artifact.id,
        blocks: draft,
        tone: input.tone,
        meta: {
          sessionId: input.sessionId,
          generatedAt: artifact.created_at,
          turnCount: sessionData.transcript.length,
          durationMinutes: sessionData.durationMinutes,
        },
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return json(400, { error: 'Invalid request', issues: error.flatten() });
    }

    console.error('[session-followup/generate] failed', error);
    return json(500, { error: 'Failed to generate follow-up draft' });
  }
}
