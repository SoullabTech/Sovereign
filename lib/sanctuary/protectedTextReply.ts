/**
 * RF01 S1-C: minimal, test-isolated protected text-only response seam.
 *
 * Not the complete MAIA pipeline. No memory/context retrieval, automatic
 * profiles, relationship inference, name changes, TTS/STT, diagrams, secondary
 * writers, cross-provider fallback, telemetry, or automatic retry.
 *
 * This is intentionally NOT wired to the public conversation route yet.
 * S1-A remains the live hard refusal. A successful fictional test cannot
 * activate Sanctuary in production, even if deployment flags are set there.
 */
import { generateText } from '@/lib/ai/modelService';
import { requireExistingOwnedSession } from '@/lib/sovereign/memberSessionOwnership';
import { verifyExplicitTurnConsent, validExchangeId } from './explicitTurnConsent';
import { verifyAnthropicTurnGrant } from './externalProcessingGrant';

const PROTECTED_SINGLE_TURN_SYSTEM = [
  'You are MAIA, the single voice of Soullab.',
  'Respond to the member\'s present words with attentive, grounded care.',
  'This is a Sanctuary encounter. No past conversation, memories, profile,',
  'third-party background material, or developmental interpretation is available.',
  'Never imply that you have remembered or saved earlier conversations.',
  'Do not assert a diagnosis or impose meaning on the member.',
  'Ask at most one brief follow-up when genuinely needed.',
  'Do not request identity, credentials, or sensitive personal information.',
].join(' ');

export const S1C_TEXT_MESSAGE_LIMIT = 8000;
type ProtectedReplyBody =
  | {
      message: string;
      sanctuary: true;
      audio: null;
      provider: 'anthropic';
      exchangeId: string;
      sessionId: string;
    }
  | {
      error: string;
      action?: string;
    };
export type ProtectedReplyOutcome = {
  ok: boolean;
  status: 200 | 400 | 409 | 428 | 503;
  body: ProtectedReplyBody;
};

const refuse = (error: string, status: 400 | 409 | 428 | 503): ProtectedReplyOutcome =>
  ({ ok: false, status, body: { error } });

export async function produceFictionalProtectedTextReply(input: {
  verifiedMemberId: unknown;
  sessionId: unknown;
  exchangeId: unknown;
  memberText: unknown;
  sanctuary: boolean;
  includeAudio?: unknown;
  outsideContext?: unknown;
}): Promise<ProtectedReplyOutcome> {
  // TWO separate fixture-only requirements. A test cannot silently become a
  // production feature by setting a provider key or a release flag.
  if (process.env.NODE_ENV !== 'test' ||
      process.env.RF01_S1C_FICTIONAL_RESPONSE_ENABLED !== '1') {
    return refuse('PROTECTED_PROCESSING_STILL_HELD', 503);
  }

  if (input.sanctuary !== true) return refuse('PROTECTED_POSTURE_REQUIRED', 400);
  if (input.includeAudio !== undefined && input.includeAudio !== false) {
    return refuse('PROTECTED_VOICE_NOT_AUTHORIZED', 428);
  }
  if (input.outsideContext != null) return refuse('OUTSIDE_CONTEXT_NOT_AUTHORIZED', 400);
  if (typeof input.verifiedMemberId !== 'string' ||
      !input.verifiedMemberId.trim() ||
      typeof input.sessionId !== 'string' || !input.sessionId.trim() ||
      input.sessionId.length > 200 || !validExchangeId(input.exchangeId) ||
      typeof input.memberText !== 'string' ||
      !input.memberText.trim() || input.memberText.length > S1C_TEXT_MESSAGE_LIMIT) {
    return refuse('INVALID_PROTECTED_TURN', 400);
  }

  try {
    // Session, posture and provider permissions are three independent,
    // awaited database preconditions. Never infer one from another.
    await requireExistingOwnedSession(input.sessionId, input.verifiedMemberId);
    const posture = await verifyExplicitTurnConsent({
      memberId: input.verifiedMemberId,
      sessionId: input.sessionId,
      exchangeId: input.exchangeId,
      sanctuary: true,
    });
    if (!posture.ok) return refuse('PROTECTED_PRIVACY_NOT_VERIFIED', 428);

    const grant = await verifyAnthropicTurnGrant({
      memberId: input.verifiedMemberId,
      sessionId: input.sessionId,
      exchangeId: input.exchangeId,
    });
    if (!grant.ok) return refuse('EXTERNAL_PROCESSOR_NOT_AUTHORIZED', 428);

    // No data-bearing caller-provided metadata is forwarded. Only the
    // server-verified identifiers and fixed Sanctuary posture reach routing.
    const generated = await generateText({
      systemPrompt: PROTECTED_SINGLE_TURN_SYSTEM,
      userInput: input.memberText,
      meta: {
        sanctuary: true,
        userId: input.verifiedMemberId,
        sessionId: input.sessionId,
        exchangeId: input.exchangeId,
      },
    });

    const serving = generated.servingTruth;
    if (generated.provider?.provider !== 'anthropic' ||
        serving?.routingContract !== 'rf01_explicit_anthropic' ||
        serving.serviceState !== 'served_model' ||
        serving.served?.kind !== 'model' ||
        serving.served.provider !== 'anthropic' ||
        serving.served.domain !== 'external' ||
        !generated.text || typeof generated.text !== 'string') {
      return refuse('PROTECTED_PROVIDER_NOT_VERIFIED', 503);
    }
    return {
      ok: true,
      status: 200,
      body: {
        message: generated.text,
        sanctuary: true,
        audio: null,
        provider: 'anthropic',
        exchangeId: input.exchangeId,
        sessionId: input.sessionId,
      },
    };
  } catch {
    // An uncertain egress is intentionally not retried: the atomic provider
    // reservation is already consumed. Never reveal provider error strings.
    return refuse('PROTECTED_TURN_UNAVAILABLE_NO_AUTOMATIC_RETRY', 503);
  }
}
