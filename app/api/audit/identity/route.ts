/**
 * Identity Audit API
 *
 * POST /api/audit/identity
 *
 * Accepts intake form fields, runs a structured identity audit via Claude,
 * stores the result fire-and-forget, and returns the structured IdentityAuditResult.
 *
 * Auth: session cookie OR x-member-id header. Anonymous access allowed (v1 — marketing entry point).
 * DB:   lib/db/postgres.ts only. Never Supabase.
 */

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 60;

import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { MultiLLMProvider } from '@/lib/consciousness/LLMProvider';
import { query } from '@/lib/db/postgres';
import { getCurrentSession } from '@/lib/auth/serverSessions';
import {
  buildIdentityAuditPrompt,
  type IdentityAuditIntake,
  type IdentityAuditResult,
} from '@/lib/maia/prompts/identityAuditPrompt';
import {
  buildPartnershipAuditPrompt,
  type PartnershipAuditIntake,
  type PartnershipAuditResult,
} from '@/lib/maia/prompts/partnershipAuditPrompt';
import {
  buildTeamAuditPrompt,
  type TeamAuditIntake,
  type TeamAuditResult,
} from '@/lib/maia/prompts/teamAuditPrompt';
import type { AuditFieldContext } from '@/lib/maia/prompts/auditTypes';

// ═══════════════════════════════════════════════════════════════
// Request body
// ═══════════════════════════════════════════════════════════════

type AuditMode = 'individual' | 'partnership' | 'team';

interface AuditRequestBody extends IdentityAuditIntake, PartnershipAuditIntake, TeamAuditIntake {
  // Optional — client may pass member ID for cross-device use
  memberId?: string;
  // Audit mode — defaults to 'individual' for backwards compatibility
  auditMode?: AuditMode;
  // Optional field context
  fieldSlug?: string;
  fieldContext?: AuditFieldContext;
}

// ═══════════════════════════════════════════════════════════════
// Fire-and-forget result storage
// ═══════════════════════════════════════════════════════════════

type AnyAuditResult = IdentityAuditResult | PartnershipAuditResult | TeamAuditResult;
type AnyAuditIntake = IdentityAuditIntake | PartnershipAuditIntake | TeamAuditIntake;

/**
 * Store audit result without blocking the response.
 * Same pattern as upsertSpiralState / storeThemeSignal.
 * auditMode is stored inside the result JSONB (as auditType field) — no separate column needed.
 */
function storeAuditResult(
  auditId: string,
  memberId: string | null,
  intake: AnyAuditIntake,
  result: AnyAuditResult
): void {
  const sql = `
    INSERT INTO audit_results (id, member_id, intake, result, summary_signal, element_dominant, created_at)
    VALUES ($1, $2, $3, $4, $5, $6, NOW())
  `;

  const summarySignal = 'summarySignal' in result ? result.summarySignal : null;
  const elementDominant =
    'elementalState' in result && result.elementalState
      ? result.elementalState.dominant
      : null;

  query(sql, [
    auditId,
    memberId ?? null,
    JSON.stringify(intake),
    JSON.stringify(result),
    summarySignal ?? null,
    elementDominant ?? null,
  ]).catch((err) => {
    // Swallow — storage must never break the response
    console.warn('[identity-audit] Failed to store result:', {
      auditId,
      error: err instanceof Error ? err.message : String(err),
    });
  });
}

// ═══════════════════════════════════════════════════════════════
// POST handler
// ═══════════════════════════════════════════════════════════════

export async function POST(request: NextRequest): Promise<NextResponse> {
  let body: AuditRequestBody;

  try {
    body = (await request.json()) as AuditRequestBody;
  } catch {
    return NextResponse.json(
      { success: false, error: 'Invalid JSON body' },
      { status: 400 }
    );
  }

  // ── Resolve audit mode ────────────────────────────────────────
  const auditMode: AuditMode = body.auditMode ?? 'individual';

  // ── Validate required fields per mode ────────────────────────
  if (auditMode === 'individual') {
    const { whoAndBuilding, biggestTension, stuckSplitOverextended } = body;
    if (!whoAndBuilding?.trim() || !biggestTension?.trim() || !stuckSplitOverextended?.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: whoAndBuilding, biggestTension, stuckSplitOverextended',
        },
        { status: 400 }
      );
    }
  } else if (auditMode === 'partnership') {
    const { personARole, personBRole, sharedPurpose, primaryTension } = body;
    if (!personARole?.trim() || !personBRole?.trim() || !sharedPurpose?.trim() || !primaryTension?.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: personARole, personBRole, sharedPurpose, primaryTension',
        },
        { status: 400 }
      );
    }
  } else if (auditMode === 'team') {
    const { whatBuilding, primaryTension, energyDrain } = body;
    if (!whatBuilding?.trim() || !primaryTension?.trim() || !energyDrain?.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: whatBuilding, primaryTension, energyDrain',
        },
        { status: 400 }
      );
    }
  }

  // ── Resolve member ID (optional — anonymous allowed) ─────────
  let resolvedMemberId: string | null = null;

  try {
    // Prefer server-side session (most trustworthy)
    const serverSession = await getCurrentSession();
    if (serverSession?.memberId) {
      resolvedMemberId = serverSession.memberId;
    } else {
      // iOS / Capacitor fallback: x-member-id header
      const headerMemberId = request.headers.get('x-member-id');
      if (headerMemberId) {
        resolvedMemberId = headerMemberId;
      } else if (body.memberId) {
        // Last resort: client-supplied (untrusted but acceptable for anonymous audit)
        resolvedMemberId = body.memberId;
      }
    }
  } catch {
    // Graceful — anonymous audit proceeds without session
    resolvedMemberId = null;
  }

  // ── Resolve field context ─────────────────────────────────────
  const fieldContext: AuditFieldContext | undefined = body.fieldContext;

  // ── Build intake object and prompt per mode ───────────────────
  let intake: AnyAuditIntake;
  let systemPrompt: string;
  let expectedAuditType: string;

  if (auditMode === 'partnership') {
    const partnershipIntake: PartnershipAuditIntake = {
      ...(body.personAName?.trim() ? { personAName: body.personAName.trim() } : {}),
      personARole: body.personARole ?? '',
      personAStrength: body.personAStrength ?? '',
      personAEdge: body.personAEdge ?? '',
      ...(body.personBName?.trim() ? { personBName: body.personBName.trim() } : {}),
      personBRole: body.personBRole ?? '',
      personBStrength: body.personBStrength ?? '',
      personBEdge: body.personBEdge ?? '',
      sharedPurpose: body.sharedPurpose ?? '',
      primaryTension: body.primaryTension ?? '',
      whatWorksWell: body.whatWorksWell ?? '',
      whatDoesnt: body.whatDoesnt ?? '',
      ...(body.patternSignals?.length ? { patternSignals: body.patternSignals as PartnershipAuditIntake['patternSignals'] } : {}),
      ...(body.journalEntry ? { journalEntry: body.journalEntry } : {}),
    };
    intake = partnershipIntake;
    systemPrompt = buildPartnershipAuditPrompt(partnershipIntake, fieldContext);
    expectedAuditType = 'partnership_audit';
  } else if (auditMode === 'team') {
    const teamIntake: TeamAuditIntake = {
      ...(body.teamName?.trim() ? { teamName: body.teamName.trim() } : {}),
      teamSize: body.teamSize ?? '',
      whatBuilding: body.whatBuilding ?? '',
      collectiveStrength: body.collectiveStrength ?? '',
      primaryTension: body.primaryTension ?? '',
      energyDrain: body.energyDrain ?? '',
      underexpressed: body.underexpressed ?? '',
      ...(body.leadershipPattern?.trim() ? { leadershipPattern: body.leadershipPattern.trim() } : {}),
      ...(body.patternSignals?.length ? { patternSignals: body.patternSignals as TeamAuditIntake['patternSignals'] } : {}),
      ...(body.journalEntry ? { journalEntry: body.journalEntry } : {}),
    };
    intake = teamIntake;
    systemPrompt = buildTeamAuditPrompt(teamIntake, fieldContext);
    expectedAuditType = 'team_audit';
  } else {
    // Default: individual
    const individualIntake: IdentityAuditIntake = {
      whoAndBuilding: body.whoAndBuilding,
      biggestTension: body.biggestTension,
      stuckSplitOverextended: body.stuckSplitOverextended,
      whatPeopleRelyOnYouFor: body.whatPeopleRelyOnYouFor ?? '',
      underexpressed: body.underexpressed ?? '',
      creatingNow: body.creatingNow ?? '',
      ...(body.birthData ? { birthData: body.birthData } : {}),
      ...(body.journalEntry ? { journalEntry: body.journalEntry } : {}),
    };
    intake = individualIntake;
    systemPrompt = buildIdentityAuditPrompt(individualIntake);
    expectedAuditType = 'identity_audit';
  }

  // ── Call LLM ──────────────────────────────────────────────────
  let rawText: string;

  try {
    const llmProvider = new MultiLLMProvider();

    const llmResponse = await llmProvider.generate({
      systemPrompt,
      userInput: 'Run the identity audit. Return only the JSON object.',
      level: 3, // Sonnet — structured analytical output, no DEEP required
      forceClaude: true,
      maxTokensOverride: 2000,
    });

    rawText = llmResponse.text;
  } catch (err) {
    console.error('[identity-audit] LLM call failed:', err);
    return NextResponse.json(
      { success: false, error: 'Audit generation failed. Please try again.' },
      { status: 503 }
    );
  }

  // ── Parse JSON result ─────────────────────────────────────────
  let result: AnyAuditResult;

  try {
    // Strip any accidental markdown fences before parsing
    const cleaned = rawText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
    const parsed = JSON.parse(cleaned) as AnyAuditResult;

    if (parsed.auditType !== expectedAuditType) {
      throw new Error(`Unexpected auditType in response: expected ${expectedAuditType}, got ${parsed.auditType}`);
    }

    result = parsed;
  } catch (err) {
    console.error('[identity-audit] Failed to parse LLM JSON output:', {
      error: err instanceof Error ? err.message : String(err),
      rawText: rawText.slice(0, 300),
    });
    return NextResponse.json(
      { success: false, error: 'Audit result could not be parsed. Please try again.' },
      { status: 500 }
    );
  }

  // ── Store result (fire-and-forget) ────────────────────────────
  const auditId = randomUUID();
  storeAuditResult(auditId, resolvedMemberId, intake, result);

  // ── Return ────────────────────────────────────────────────────
  return NextResponse.json({
    success: true,
    result,
    auditId,
  });
}
