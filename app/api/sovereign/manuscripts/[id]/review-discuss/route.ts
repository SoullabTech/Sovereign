import { NextRequest, NextResponse } from 'next/server';
import { createHash, randomUUID } from 'node:crypto';

import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { memberOwnsWork } from '@/lib/manuscript/ask/frozenReading';
import { loadFrozenDevelopmentalReading } from '@/lib/manuscript/ask/frozenDevelopmentalReading';
import { checkObservationAnchor, selectObservation } from '@/lib/manuscript/ask/developmentalAnchor';
import { deriveBodyRequirement } from '@/lib/manuscript/ask/bodyRequirement';
import { loadRevisionContent, loadLiveWork } from '@/lib/manuscript/development/capture';
import { assembleDevelopmentalContext, developmentalStaleness } from '@/lib/manuscript/ask/developmentalContext';
import { requirementOf } from '@/lib/manuscript/development/evidenceRef';
import { canonicalFingerprint } from '@/lib/manuscript/structure/canonicalFingerprint';
import { openThread, appendTurn, appendTurnWithClient } from '@/lib/manuscript/ask/threadStore';
import { mintAct, claimAct, recordCompletionWithClient } from '@/lib/disclosure/authorizationAct';
import { establishDisclosureBoundary, mayCrossBoundary } from '@/lib/disclosure/disclosureBoundary';
import { confirmDisclosureCrossedWithClient } from '@/lib/disclosure/contextDisclosureReceipt';
import { TurnPosture } from '@/lib/sanctuary/turnPosture';
import { transaction } from '@/lib/db/postgres';
import { runReviewDiscuss, REVIEW_DISCUSS_READER_VERSION } from '@/lib/manuscript/ask/reviewDiscussReader';

export const dynamic = 'force-dynamic';
const MAX_QUESTION = 4000;
const ACT_TTL_MINUTES = 30;

const hash = (value: unknown): string =>
  createHash('sha256').update(JSON.stringify(value)).digest('hex');

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (process.env.WRITERS_STUDIO_REVIEW_DISCUSS_ENABLED !== '1') {
    return NextResponse.json({ refusal: 'not_available' }, { status: 404 });
  }

  const { id: manuscriptId } = await params;
  const memberId = await getMemberIdFromRequest(req);
  if (!memberId) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });

  if (!(await memberOwnsWork(manuscriptId, memberId))) {
    return NextResponse.json({ refusal: 'not_found' }, { status: 404 });
  }

  let raw: unknown;
  try { raw = await req.json(); } catch {
    return NextResponse.json({ refusal: 'malformed' }, { status: 400 });
  }
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return NextResponse.json({ refusal: 'malformed' }, { status: 400 });
  }
  const body = raw as Record<string, unknown>;
  const keys = Object.keys(body).sort().join(',');
  if (keys !== 'observationKey,question,readingId,sanctuary') {
    return NextResponse.json({ refusal: 'malformed' }, { status: 400 });
  }

  const readingId = typeof body.readingId === 'string' && body.readingId.length > 0 ? body.readingId : null;
  const observationKey = typeof body.observationKey === 'string' && body.observationKey.length > 0 ? body.observationKey : null;
  const question = typeof body.question === 'string' ? body.question.trim() : '';
  if (!readingId || !observationKey || !question) {
    return NextResponse.json({ refusal: 'malformed' }, { status: 400 });
  }
  if (question.length > MAX_QUESTION) {
    return NextResponse.json({ refusal: 'question_too_long' }, { status: 413 });
  }

  /* R2-2 Sanctuary is a pre-open refusal: no R2 custody exists yet. */
  if (typeof body.sanctuary !== 'boolean') {
    return NextResponse.json({ refusal: 'posture_unresolved' }, { status: 409 });
  }
  if (body.sanctuary) {
    return NextResponse.json({ refusal: 'sanctuary_unavailable' }, { status: 409 });
  }
  const posture = TurnPosture.resolve({ sanctuary: body.sanctuary });

  const reading = await loadFrozenDevelopmentalReading(manuscriptId, readingId, memberId);
  const anchor = { on: 'observation' as const, readingId, observationKey };
  const check = checkObservationAnchor(anchor, reading);
  if (!check.ok || !reading) {
    return NextResponse.json({ refusal: 'finding_unavailable' }, { status: 404 });
  }
  const observation = selectObservation(reading, observationKey);
  if (!observation) {
    return NextResponse.json({ refusal: 'finding_unavailable' }, { status: 404 });
  }

  const bodyReq = deriveBodyRequirement(observation.evidenceRefs);
  if (!bodyReq.required || bodyReq.sections.length === 0) {
    return NextResponse.json({ refusal: 'historical_evidence_unavailable' }, { status: 422 });
  }

  let canonicalAtOpen: string;
  try {
    canonicalAtOpen = await canonicalFingerprint(manuscriptId);
  } catch {
    return NextResponse.json({ refusal: 'canonical_unmeasurable' }, { status: 503 });
  }

  const now = await loadLiveWork(manuscriptId, memberId);
  const requestId = randomUUID();

  const threadId = await openThread({
    manuscriptId,
    memberId,
    anchor: check.anchor,
    reading: {
      kind: 'review_discuss_r2_1',
      readingId: reading.id,
      observationKey,
      draftId: reading.readState.draftId,
      revisionNumber: reading.readState.revisionNumber,
      inputFingerprint: reading.readState.inputFingerprint,
      commissionedLens: reading.scope.commissionedLens,
      readerProvenance: reading.provenance.reader,
    },
    canonicalAtOpen,
    initiatedBy: 'author',
  });

  const contextWithoutBody = assembleDevelopmentalContext({
    reading,
    observation,
    revisionContent: null,
    now,
  });
  const preStaleness = developmentalStaleness(
    contextWithoutBody,
    { state: 'unmeasured' },
  );

  await appendTurn({
    threadId,
    memberId,
    speaker: 'author',
    body: question,
    staleness: preStaleness,
  });

  const authorizationRef = await mintAct({
    memberId,
    manuscriptId,
    threadId,
    readingId,
    observationKey,
  }, ACT_TTL_MINUTES);

  const claim = await claimAct(authorizationRef, memberId, requestId);
  if (claim.kind !== 'claimed') {
    return NextResponse.json({ refusal: 'authorization_unavailable', threadId }, { status: 409 });
  }
  const c = claim.act;
  if (
    c.memberId !== memberId ||
    c.manuscriptId !== manuscriptId ||
    c.threadId !== threadId ||
    c.readingId !== readingId ||
    c.observationKey !== observationKey
  ) {
    return NextResponse.json({ refusal: 'authorization_not_for_this_discuss', threadId }, { status: 409 });
  }

  const crossings: { disclosureId: string; receiptId: string }[] = [];
  for (const sectionRef of bodyReq.sections) {
    const boundary = await establishDisclosureBoundary({
      requestId,
      posture,
      memberId,
      sessionId: threadId,
      disclosure: {
        disclosureId: randomUUID(),
        boundary: 'writers_studio.review_discuss->maia_cognition',
        sourceClass: 'work',
        participationBasis: 'member_invoked',
        sourceRef: manuscriptId,
        scopeKind: 'section',
        sectionRef,
        gesture: 'discuss_finding',
      },
    });
    if (!mayCrossBoundary(boundary)) {
      return NextResponse.json({ refusal: 'disclosure_unavailable', threadId }, { status: 503 });
    }
    crossings.push({ disclosureId: boundary.disclosureId, receiptId: boundary.receiptId });
  }

  /* Historical prose is not reachable until all required boundaries are established. */
  const revisionContent = await loadRevisionContent(
    reading.readState.draftId,
    reading.readState.revisionNumber,
  );
  const ctx = assembleDevelopmentalContext({ reading, observation, revisionContent, now });

  const bodyEvidence = ctx.evidence.filter((e) => requirementOf(e.ref) === 'body');
  const verified =
    bodyEvidence.length > 0 && bodyEvidence.every((e) => e.kind === 'verified');
  if (!verified) {
    return NextResponse.json(
      { refusal: 'historical_evidence_unavailable', threadId },
      { status: 409 },
    );
  }

  const inputManifest = {
    entries: [
      { role: 'FINDING', inputClass: 'DURABLE_READING_OUTPUT', authoredBy: 'maia' },
      { role: 'THEN', inputClass: 'MEMBER_WORK_TEXT', authoredBy: 'member' },
      { role: 'PROVENANCE', inputClass: 'READING_PROVENANCE', authoredBy: 'system' },
    ],
  } as const;

  const historicalEvidenceIdentity = {
    revisionNumber: reading.readState.revisionNumber,
    revisionDigest: reading.readState.revisionDigest,
    evidenceRefs: observation.evidenceRefs,
  };

  const authorization = {
    kind: 'R2_REVIEW_DISCUSS_ACT',
    ref: authorizationRef,
    anchor: { readingId, observationKey },
    posture: 'AS_READ',
    inputManifest,
    historicalEvidenceIdentity,
  } as const;

  const cognitionInputFingerprint = hash({
    finding: {
      readingId,
      observationKey,
      observation: observation.observation,
      doesNotEstablish: observation.doesNotEstablish,
      phenomenon: observation.phenomenon ?? null,
      structureDependency: observation.structureDependency,
    },
    historical_evidence: historicalEvidenceIdentity,
    posture: 'AS_READ',
    current_location: ctx.location,
    input_manifest: inputManifest,
    instructions: REVIEW_DISCUSS_READER_VERSION,
    question,
  });

  const outcome = await runReviewDiscuss(ctx, question);
  if (!outcome.ok) {
    return NextResponse.json(
      { refusal: outcome.refusal, threadId, posture: 'AS_READ', location: ctx.location },
      { status: 502 },
    );
  }

  const staleness = developmentalStaleness(ctx, { state: 'unmeasured' });
  const answerProvenance = {
    contractVersion: 'R2-1',
    provenanceAuthority: 'SERVER',
    posture: 'AS_READ',
    anchor: { readingId, observationKey },
    historicalEvidence: {
      identity: `${readingId}:${reading.readState.revisionNumber}:${observationKey}`,
      refs: observation.evidenceRefs,
    },
    currentLocation: ctx.location,
    inputManifest,
    authorization,
    authorizationRef,
    disclosureReceiptRefs: crossings.map((x) => x.receiptId),
    historyPolicy: 'NONE',
    provider: outcome.provenance.provider,
    model: outcome.provenance.model,
    reportedModel: outcome.provenance.reportedModel,
    modelAgreement: outcome.provenance.modelAgreement,
    answeredAt: outcome.provenance.answeredAt,
    readerVersion: outcome.provenance.readerVersion,
    cognitionInputFingerprint,
    durableEffect: 'NONE',
  } as const;

  let turnIndex: number;
  try {
    turnIndex = await transaction(async (client) => {
      const index = await appendTurnWithClient(client, {
        threadId,
        memberId,
        speaker: 'maia',
        body: outcome.answer,
        staleness,
        answerProvenance,
      });
      for (const crossing of crossings) {
        await confirmDisclosureCrossedWithClient(client, crossing.disclosureId);
      }
      await recordCompletionWithClient(client, authorizationRef, `${threadId}:${index}`);
      return index;
    });
  } catch {
    console.error('[R2-2] Review Discuss post-cognition tail rolled back');
    return NextResponse.json(
      { refusal: 'answer_not_recorded', threadId },
      { status: 500 },
    );
  }

  return NextResponse.json({
    threadId,
    turnIndex,
    posture: 'AS_READ',
    location: ctx.location,
    answer: outcome.answer,
    provenance: answerProvenance,
  });
}
