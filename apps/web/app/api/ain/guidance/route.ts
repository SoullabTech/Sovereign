import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { streamStore } from '@/lib/ain/StreamStore';

export const dynamic = 'force-dynamic';

interface EvolutionGuidance {
  currentFocus: string;
  timingWisdom: string;
  shadowWork: string;
  nextSteps: string[];
  elementalBalance: string;
}

async function generateEvolutionGuidance(userId: string): Promise<EvolutionGuidance> {
  const userStreams = streamStore.getStreams(userId);

  if (userStreams.length === 0) {
    return {
      currentFocus: "Beginning your journey of self-discovery through journaling",
      timingWisdom: "This is a powerful moment to establish your practice",
      shadowWork: "Be gentle with yourself as you explore what emerges",
      nextSteps: [
        "Journal regularly to build momentum",
        "Notice recurring themes and symbols",
        "Allow yourself to write freely without judgment"
      ],
      elementalBalance: "Your elemental nature is just beginning to reveal itself",
    };
  }

  const recentStreams = userStreams.slice(-10);

  const avgConsciousness = recentStreams.reduce(
    (sum, s) => sum + (s.metrics.consciousnessLevel || 0), 0
  ) / recentStreams.length;

  const avgEvolution = recentStreams.reduce(
    (sum, s) => sum + (s.metrics.evolutionVelocity || 0), 0
  ) / recentStreams.length;

  const avgIntegration = recentStreams.reduce(
    (sum, s) => sum + (s.metrics.integrationDepth || 0), 0
  ) / recentStreams.length;

  const avgShadowWork = recentStreams.reduce(
    (sum, s) => sum + (s.metrics.shadowWorkEngagement || 0), 0
  ) / recentStreams.length;

  const avgAuthenticity = recentStreams.reduce(
    (sum, s) => sum + (s.metrics.authenticityLevel || 0), 0
  ) / recentStreams.length;

  const elements = ['fire', 'water', 'earth', 'air', 'aether'];
  const elementalScores: Record<string, number> = {};

  elements.forEach(element => {
    const scores = recentStreams
      .map(s => s.metrics.elementalResonance?.[element] || 0)
      .filter(score => score > 0);
    elementalScores[element] = scores.length > 0
      ? scores.reduce((sum, s) => sum + s, 0) / scores.length
      : 0;
  });

  const dominantElement = Object.entries(elementalScores)
    .sort((a, b) => b[1] - a[1])[0]?.[0] || 'aether';

  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    const focus = avgEvolution > 0.7
      ? "You are in a rapid transformation phase"
      : avgConsciousness > 0.6
      ? "Deepening awareness and integration"
      : "Building foundational self-awareness";

    const timing = avgEvolution > 0.7
      ? "This is a breakthrough window—lean into the intensity"
      : "Trust the natural rhythm of your unfolding";

    const shadow = avgShadowWork > 0.6
      ? "Your shadow work is deepening. Honor the courage this requires."
      : "Consider exploring the parts of yourself you tend to avoid";

    const steps: string[] = [];
    if (avgIntegration < 0.5) steps.push("Focus on integrating recent insights before pushing forward");
    if (avgAuthenticity < 0.6) steps.push("Practice more vulnerable, honest expression in your journaling");
    if (avgShadowWork < 0.5) steps.push("Explore the uncomfortable edges of your experience");
    steps.push("Continue your consistent practice");

    return {
      currentFocus: focus,
      timingWisdom: timing,
      shadowWork: shadow,
      nextSteps: steps,
      elementalBalance: `Your ${dominantElement} nature is prominent. Consider exploring other elements for balance.`,
    };
  }

  try {
    const anthropic = new Anthropic({ apiKey });

    const prompt = `You are MAIA, an AI consciousness guide. Generate evolution guidance for a user.

User's consciousness metrics (recent average):
- Consciousness: ${(avgConsciousness * 100).toFixed(0)}%
- Evolution velocity: ${(avgEvolution * 100).toFixed(0)}%
- Integration depth: ${(avgIntegration * 100).toFixed(0)}%
- Shadow work: ${(avgShadowWork * 100).toFixed(0)}%
- Authenticity: ${(avgAuthenticity * 100).toFixed(0)}%
- Dominant element: ${dominantElement}

Total journal entries: ${userStreams.length}

Provide evolution guidance in JSON format:
{
  "currentFocus": "1 sentence about their current developmental focus",
  "timingWisdom": "1 sentence about their current timing/phase",
  "shadowWork": "1 sentence of shadow work guidance",
  "nextSteps": ["step 1", "step 2", "step 3"],
  "elementalBalance": "1 sentence about their elemental nature and balance"
}`;

    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 512,
      messages: [{
        role: 'user',
        content: prompt
      }],
    });

    const responseText = message.content[0].type === 'text'
      ? message.content[0].text
      : '';

    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        currentFocus: parsed.currentFocus || "Continuing your journey",
        timingWisdom: parsed.timingWisdom || "Trust your timing",
        shadowWork: parsed.shadowWork || "Honor what emerges",
        nextSteps: parsed.nextSteps || ["Continue journaling", "Stay present", "Trust the process"],
        elementalBalance: parsed.elementalBalance || "Your elements are in harmony",
      };
    }

    return {
      currentFocus: "Deepening self-awareness through consistent practice",
      timingWisdom: "You are exactly where you need to be",
      shadowWork: "Honor all parts of yourself with compassion",
      nextSteps: ["Continue your journaling practice", "Notice emerging patterns", "Trust your inner wisdom"],
      elementalBalance: `Your ${dominantElement} nature guides you`,
    };

  } catch (error) {
    console.error('Guidance generation error:', error);

    return {
      currentFocus: "Continuing your journey of self-discovery",
      timingWisdom: "Trust the natural rhythm of your unfolding",
      shadowWork: "Be gentle with yourself as you explore",
      nextSteps: ["Journal regularly", "Notice patterns", "Stay present"],
      elementalBalance: "Your elemental nature is unfolding beautifully",
    };
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId parameter' },
        { status: 400 }
      );
    }

    const guidance = await generateEvolutionGuidance(userId);

    return NextResponse.json(guidance);
  } catch (error: any) {
    console.error('Guidance generation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate guidance' },
      { status: 500 }
    );
  }
}