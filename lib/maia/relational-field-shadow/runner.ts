import { createHash } from 'node:crypto';
import { renderCurrentTurnBasisEnvelope } from '../../../scripts/research/structural-standing/current-turn-basis-envelope';
import { StandingEnvelopeRefused } from '../../../scripts/research/structural-standing/standing-envelope';
import {
  buildCurrentActProjection,
  H8_CURRENT_ACT_ARCHITECTURE_VERSION,
  H8_CURRENT_ACT_MODEL_NAME,
} from './currentActProjection';
import { assembleRelationalFieldPacket, loadPriorMemberTurns } from './fieldAssembler';
import { persistRelationalFieldShadowEvidence } from './evidenceStore';
import { deterministicShadowSeed, generateRelationalFieldPlan } from './ollamaProvider';
import {
  PRIMARY_CAPTURE_STAGE,
  RELATIONAL_FIELD_SHADOW_ARCHITECTURE_VERSION,
  type RelationalFieldShadowLaunch,
  type ShadowEvidenceRow,
} from './types';

const sha256 = (value: string): string => createHash('sha256').update(value).digest('hex');

export function configuredRelationalFieldShadowMemberIds(): string[] {
  if (process.env.MAIA_RELATIONAL_FIELD_SHADOW !== '1') return [];
  return (process.env.MAIA_RELATIONAL_FIELD_SHADOW_MEMBER_IDS || '')
    .split(',').map((s) => s.trim()).filter(Boolean);
}

export function configuredRelationalFieldShadowModels(): string[] {
  if (process.env.MAIA_RELATIONAL_FIELD_SHADOW !== '1') return [];
  return (process.env.MAIA_RELATIONAL_FIELD_SHADOW_MODELS || '')
    .split(',').map((s) => s.trim()).filter(Boolean);
}

export function configuredH8CurrentActShadow(): boolean {
  return process.env.MAIA_RELATIONAL_FIELD_SHADOW === '1'
    && process.env.MAIA_RELATIONAL_FIELD_H8 === '1';
}

export function launchRelationalFieldShadow(input: RelationalFieldShadowLaunch): void {
  const models = configuredRelationalFieldShadowModels();
  const h8Enabled = configuredH8CurrentActShadow();
  const allowedMembers = configuredRelationalFieldShadowMemberIds();
  if ((!h8Enabled && models.length === 0) || !input.memberId || !allowedMembers.includes(input.memberId)) return;
  // SH-F7 / H8-F1: launch after the live response exists, never await from the serving path.
  setImmediate(() => {
    void runRelationalFieldShadow(input, models).catch((err) => {
      console.warn('[RELATIONAL-FIELD-SHADOW] background run failed', err instanceof Error ? err.name : typeof err);
    });
  });
}

async function persistH8Projection(
  input: RelationalFieldShadowLaunch,
  packet: ReturnType<typeof assembleRelationalFieldPacket>,
  primaryDigest: string,
): Promise<void> {
  const started = Date.now();
  try {
    const projection = buildCurrentActProjection(packet);
    const row: ShadowEvidenceRow = {
      turnId: input.turnId,
      exchangeId: input.exchangeId,
      architectureVersion: H8_CURRENT_ACT_ARCHITECTURE_VERSION,
      modelName: H8_CURRENT_ACT_MODEL_NAME,
      deterministicSeed: 0,
      status: 'rendered',
      processingProfile: input.processingProfile,
      originRoute: input.originRoute,
      primaryStage: PRIMARY_CAPTURE_STAGE,
      primaryResponseSha256: primaryDigest,
      primaryResponseText: input.primaryResponse,
      currentEvidenceId: packet.currentEvidenceId,
      evidenceManifest: packet.manifest,
      packetDigest: packet.packetDigest,
      basisEvidenceIds: [...projection.selectedEvidenceIds],
      rawPlan: projection,
      rawPlanSha256: projection.projectionDigest,
      renderedDigest: projection.projectionDigest,
      generationMs: 0,
      totalMs: Date.now() - started,
    };
    await persistRelationalFieldShadowEvidence(row);
  } catch (err) {
    const errorRow: ShadowEvidenceRow = {
      turnId: input.turnId,
      exchangeId: input.exchangeId,
      architectureVersion: H8_CURRENT_ACT_ARCHITECTURE_VERSION,
      modelName: H8_CURRENT_ACT_MODEL_NAME,
      deterministicSeed: 0,
      status: 'error',
      processingProfile: input.processingProfile,
      originRoute: input.originRoute,
      primaryStage: PRIMARY_CAPTURE_STAGE,
      primaryResponseSha256: primaryDigest,
      primaryResponseText: input.primaryResponse,
      currentEvidenceId: packet.currentEvidenceId,
      evidenceManifest: packet.manifest,
      packetDigest: packet.packetDigest,
      basisEvidenceIds: [],
      errorCode: err instanceof Error ? err.name : 'unknown_error',
      totalMs: Date.now() - started,
    };
    try {
      await persistRelationalFieldShadowEvidence(errorRow);
    } catch (storeErr) {
      console.warn('[RELATIONAL-FIELD-SHADOW][H8] evidence persist failed', storeErr instanceof Error ? storeErr.name : typeof storeErr);
    }
  }
}

export async function runRelationalFieldShadow(
  input: RelationalFieldShadowLaunch,
  models = configuredRelationalFieldShadowModels(),
): Promise<void> {
  const allowedMembers = configuredRelationalFieldShadowMemberIds();
  if (input.turnId <= 0 || !input.memberId || !allowedMembers.includes(input.memberId)) return;

  const h8Enabled = configuredH8CurrentActShadow();
  if (!h8Enabled && models.length === 0) return;

  const priorMemberTurns = await loadPriorMemberTurns(input.sessionId, input.exchangeId);
  const packet = assembleRelationalFieldPacket({
    exchangeId: input.exchangeId,
    userInput: input.userInput,
    priorMemberTurns,
  });
  const primaryDigest = sha256(input.primaryResponse);

  // H8 is deterministic, model-independent and observation-only. It may run with
  // an empty generative-model list and writes only the existing research evidence table.
  if (h8Enabled) {
    await persistH8Projection(input, packet, primaryDigest);
  }

  if (models.length === 0) return;

  // Sequential on purpose: background inference must not create avoidable local-model
  // contention with the live serving path. Model set is explicit; there is no winner.
  for (const modelName of models) {
    const started = Date.now();
    const seed = deterministicShadowSeed(input.exchangeId, modelName, RELATIONAL_FIELD_SHADOW_ARCHITECTURE_VERSION);
    let row: ShadowEvidenceRow;
    try {
      const generated = await generateRelationalFieldPlan({
        packet,
        modelName,
        exchangeId: input.exchangeId,
        architectureVersion: RELATIONAL_FIELD_SHADOW_ARCHITECTURE_VERSION,
      });
      const rawPlanSha256 = sha256(generated.rawText);
      try {
        const rendered = renderCurrentTurnBasisEnvelope(packet.evidence, generated.rawPlan, packet.currentEvidenceId);
        row = {
          turnId: input.turnId,
          exchangeId: input.exchangeId,
          architectureVersion: RELATIONAL_FIELD_SHADOW_ARCHITECTURE_VERSION,
          modelName,
          deterministicSeed: generated.seed,
          status: 'rendered',
          processingProfile: input.processingProfile,
          originRoute: input.originRoute,
          primaryStage: PRIMARY_CAPTURE_STAGE,
          primaryResponseSha256: primaryDigest,
          primaryResponseText: input.primaryResponse,
          currentEvidenceId: packet.currentEvidenceId,
          evidenceManifest: packet.manifest,
          packetDigest: packet.packetDigest,
          promptSha256: generated.promptSha256,
          basisEvidenceIds: rendered.trace.synthesis.flatMap((s) => [...s.basisEvidenceIds]),
          rawPlan: generated.rawPlan,
          rawPlanSha256,
          shadowResponseText: rendered.text,
          renderedDigest: rendered.digest,
          generationMs: generated.generationMs,
          totalMs: Date.now() - started,
        };
      } catch (err) {
        if (!(err instanceof StandingEnvelopeRefused)) throw err;
        row = {
          turnId: input.turnId,
          exchangeId: input.exchangeId,
          architectureVersion: RELATIONAL_FIELD_SHADOW_ARCHITECTURE_VERSION,
          modelName,
          deterministicSeed: generated.seed,
          status: 'refused',
          processingProfile: input.processingProfile,
          originRoute: input.originRoute,
          primaryStage: PRIMARY_CAPTURE_STAGE,
          primaryResponseSha256: primaryDigest,
          primaryResponseText: input.primaryResponse,
          currentEvidenceId: packet.currentEvidenceId,
          evidenceManifest: packet.manifest,
          packetDigest: packet.packetDigest,
          promptSha256: generated.promptSha256,
          basisEvidenceIds: generated.rawPlan.synthesis.flatMap((s) => [...s.basisEvidenceIds]),
          rawPlan: generated.rawPlan,
          rawPlanSha256,
          refusalCode: err.code,
          generationMs: generated.generationMs,
          totalMs: Date.now() - started,
        };
      }
    } catch (err) {
      row = {
        turnId: input.turnId,
        exchangeId: input.exchangeId,
        architectureVersion: RELATIONAL_FIELD_SHADOW_ARCHITECTURE_VERSION,
        modelName,
        deterministicSeed: seed,
        status: 'error',
        processingProfile: input.processingProfile,
        originRoute: input.originRoute,
        primaryStage: PRIMARY_CAPTURE_STAGE,
        primaryResponseSha256: primaryDigest,
        primaryResponseText: input.primaryResponse,
        currentEvidenceId: packet.currentEvidenceId,
        evidenceManifest: packet.manifest,
        packetDigest: packet.packetDigest,
        basisEvidenceIds: [],
        errorCode: err instanceof Error ? err.name : 'unknown_error',
        totalMs: Date.now() - started,
      };
    }
    try {
      await persistRelationalFieldShadowEvidence(row);
    } catch (storeErr) {
      console.warn('[RELATIONAL-FIELD-SHADOW] evidence persist failed', storeErr instanceof Error ? storeErr.name : typeof storeErr);
    }
  }
}
