import { NextRequest, NextResponse } from 'next/server';
import { generateText } from '@/lib/ai/modelService';
import {
  SOUL_SERVICE_FRAME_SYSTEM_PROMPT,
  buildSoulServiceAbstentionProposal,
  buildSoulServiceFrameUserInput,
  normalizeSoulServiceSource,
  parseSoulServiceFrameProposal,
  validateSoulServiceFrameProposal,
} from '@/lib/maia/soul-service/frameDetection';

export const dynamic = 'force-dynamic';
export const revalidate = false;

export async function POST(req: NextRequest) {
  if (process.env.SOUL_SERVICE_RUNTIME_PILOT !== '1') {
    return NextResponse.json({ error: 'PILOT_DISABLED' }, { status: 404 });
  }

  const body = await req.json().catch(() => ({}));
  const source = normalizeSoulServiceSource((body as Record<string, unknown>)?.source);
  if (!source) {
    return NextResponse.json(
      {
        error: 'INVALID_SOURCE',
        message: 'Source must be a non-empty string of at most 4000 characters.',
      },
      { status: 400 },
    );
  }

  const modelResult = await generateText({
    systemPrompt: SOUL_SERVICE_FRAME_SYSTEM_PROMPT,
    userInput: buildSoulServiceFrameUserInput(source),
    meta: {
      routeTag: 'soul-service-runtime-01',
      ephemeral: true,
      noPersistence: true,
      currentTurnOnly: true,
    },
  });

  const parsed = parseSoulServiceFrameProposal(modelResult.text);
  const validation = parsed ? validateSoulServiceFrameProposal(parsed) : null;

  if (!parsed || !validation?.ok) {
    return NextResponse.json({
      source,
      proposal: buildSoulServiceAbstentionProposal(),
      standing: {
        possibleFrame: 'maia_hypothesis',
        alternativeFrame: 'maia_hypothesis',
      },
      validation: {
        accepted: false,
        reasons: validation && !validation.ok ? validation.reasons : ['unparseable-model-output'],
        disposition: 'abstained',
      },
      persistence: 'none',
      currentTurnOnly: true,
      provider: {
        provider: modelResult.provider?.provider ?? 'unknown',
        model: modelResult.provider?.model ?? null,
        mode: modelResult.provider?.mode ?? null,
      },
    });
  }

  return NextResponse.json({
    source,
    proposal: validation.proposal,
    standing: {
      possibleFrame: 'maia_hypothesis',
      alternativeFrame: 'maia_hypothesis',
    },
    validation: {
      accepted: true,
      reasons: [],
      disposition: 'offered',
    },
    persistence: 'none',
    currentTurnOnly: true,
    provider: {
      provider: modelResult.provider?.provider ?? 'unknown',
      model: modelResult.provider?.model ?? null,
      mode: modelResult.provider?.mode ?? null,
    },
  });
}
