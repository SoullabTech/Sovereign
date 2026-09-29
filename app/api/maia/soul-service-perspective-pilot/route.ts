import { NextRequest, NextResponse } from 'next/server';
import { generateText } from '@/lib/ai/modelService';
import {
  SOUL_SERVICE_PERSPECTIVE_SYSTEM_PROMPT,
  buildPerspectiveAbstention,
  buildPerspectiveUserInput,
  normalizeCurrentFrame,
  normalizePerspective,
  normalizePerspectiveSource,
  parseModelPerspectiveQuestion,
  validateModelPerspectiveQuestion,
} from '@/lib/maia/soul-service/perspectiveMobility';

export const dynamic = 'force-dynamic';
export const revalidate = false;

export async function POST(req: NextRequest) {
  if (process.env.SOUL_SERVICE_RUNTIME_PILOT !== '1') {
    return NextResponse.json({ error: 'PILOT_DISABLED' }, { status: 404 });
  }

  const body = await req.json().catch(() => ({}));
  const source = normalizePerspectiveSource((body as Record<string, unknown>)?.source);
  const perspective = normalizePerspective((body as Record<string, unknown>)?.perspective);
  const rawFrame = (body as Record<string, unknown>)?.currentFrame;
  const currentFrame =
    rawFrame == null || rawFrame === ''
      ? null
      : normalizeCurrentFrame(rawFrame);

  if (!source) {
    return NextResponse.json({ error: 'INVALID_SOURCE' }, { status: 400 });
  }

  if (!perspective) {
    return NextResponse.json({ error: 'INVALID_PERSPECTIVE' }, { status: 400 });
  }

  if (rawFrame != null && rawFrame !== '' && !currentFrame) {
    return NextResponse.json({ error: 'INVALID_CURRENT_FRAME' }, { status: 400 });
  }

  const modelResult = await generateText({
    systemPrompt: SOUL_SERVICE_PERSPECTIVE_SYSTEM_PROMPT,
    userInput: buildPerspectiveUserInput({ source, perspective, currentFrame }),
    meta: {
      routeTag: 'soul-service-runtime-02',
      ephemeral: true,
      noPersistence: true,
      currentTurnOnly: true,
      memberSelectedPerspective: perspective,
    },
  });

  const parsed = parseModelPerspectiveQuestion(modelResult.text);
  const validation = parsed
    ? validateModelPerspectiveQuestion(parsed, perspective, source)
    : null;

  const response = validation?.ok
    ? validation.response
    : buildPerspectiveAbstention(perspective);

  return NextResponse.json({
    source,
    currentFrame,
    response,
    standing: {
      perspective: 'member_selected',
      currentFrame: currentFrame ? 'member_current_turn' : 'none',
      generatedContent: 'maia_hypothesis',
    },
    validation: {
      accepted: validation?.ok === true,
      reasons:
        validation && !validation.ok
          ? validation.reasons
          : parsed
            ? []
            : ['unparseable-model-output'],
      disposition: validation?.ok ? 'offered' : 'abstained',
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
