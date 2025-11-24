import { NextRequest, NextResponse } from "next/server";

export const dynamic = 'force-dynamic';import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Archetypal analysis templates
const ARCHETYPE_PROMPT = `You are Maya, a wise oracle who interprets human experiences through the lens of mythic archetypes. 

Analyze the following memories and content through archetypal patterns. Consider these primary archetypes:
- Hero: Journey, courage, overcoming challenges, transformation through trials
- Sage: Wisdom, knowledge, teaching, inner knowing, enlightenment  
- Shadow: Hidden aspects, repressed fears, unconscious patterns, inner darkness
- Lover: Passion, connection, beauty, relationships, emotional depth
- Trickster: Change, humor, breaking patterns, disruption, creative chaos
- Caregiver: Nurturing, service, compassion, healing others
- Creator: Innovation, imagination, artistic expression, bringing forth new things
- Innocent: Hope, faith, optimism, pure intentions, new beginnings
- Magician: Transformation, manifestation, mystical understanding, alchemical change
- Ruler: Leadership, responsibility, creating order, wielding power wisely

Return a JSON response with exactly this structure:
{
  "archetype": "Primary archetype name",
  "confidence": 0.85,
  "reflection": "2-3 sentence archetypal interpretation of their journey",
  "symbols": ["symbol1", "symbol2", "symbol3"],
  "theme": "Core mythic theme (1-2 words)",
  "guidance": "Brief archetypal guidance or invitation"
}

Content to analyze:`;

interface ArchetypalInsight {
  archetype: string;
  confidence: number;
  reflection: string;
  symbols: string[];
  theme: string;
  guidance: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, memoryContent } = body;

    if (!memoryContent || !memoryContent.trim()) {
      return NextResponse.json(
        { error: "Memory content is required for archetypal analysis" },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OpenAI API key not configured" },
        { status: 500 }
      );
    }

    // Generate archetypal insight using GPT-4
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: ARCHETYPE_PROMPT
        },
        {
          role: "user", 
          content: memoryContent
        }
      ],
      temperature: 0.7,
      max_tokens: 500
    });

    const responseText = completion.choices[0]?.message?.content;
    
    if (!responseText) {
      throw new Error("No response from OpenAI");
    }

    // Parse the JSON response
    let insight: ArchetypalInsight;
    try {
      insight = JSON.parse(responseText);
    } catch (parseError) {
      // Fallback parsing if JSON isn't perfect
      console.warn("Failed to parse JSON, using fallback:", responseText);
      
      // Extract archetype (first word after "archetype":)
      const archetypeMatch = responseText.match(/"archetype":\s*"([^"]+)"/i);
      const reflectionMatch = responseText.match(/"reflection":\s*"([^"]+)"/i);
      const symbolsMatch = responseText.match(/"symbols":\s*\[([^\]]+)\]/i);
      
      insight = {
        archetype: archetypeMatch?.[1] || "Sage",
        confidence: 0.75,
        reflection: reflectionMatch?.[1] || "Your journey shows patterns of growth and transformation.",
        symbols: symbolsMatch?.[1]?.split(',').map(s => s.trim().replace(/"/g, '')) || ["growth", "journey", "wisdom"],
        theme: "Transformation",
        guidance: "Trust the process of your unfolding."
      };
    }

    // Validate the insight structure
    if (!insight.archetype || !insight.reflection) {
      throw new Error("Invalid insight structure received");
    }

    // Store the insight (in production, this would go to the memory system)
    console.log('Storing archetype insight:', {
      userId: userId?.substring(0, 8) + '...',
      archetype: insight.archetype,
      theme: insight.theme
    });

    return NextResponse.json({
      success: true,
      insight,
      generatedAt: new Date().toISOString()
    });

  } catch (error: any) {
    console.error("Archetypal insight generation failed:", error);
    
    return NextResponse.json(
      { 
        error: "Failed to generate archetypal insight",
        details: error.message 
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json(
      { error: "userId parameter is required" },
      { status: 400 }
    );
  }

  // In production, this would fetch stored insights from the memory system
  // For now, return a sample insight
  const sampleInsight: ArchetypalInsight = {
    archetype: "Hero",
    confidence: 0.85,
    reflection: "Your recent entries show the classic Hero's journey - facing challenges, seeking wisdom, and emerging transformed.",
    symbols: ["journey", "courage", "transformation"],
    theme: "Quest",
    guidance: "Trust in your ability to navigate the unknown path ahead."
  };

  return NextResponse.json({
    success: true,
    insights: [sampleInsight],
    totalCount: 1
  });
}