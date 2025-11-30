import { NextRequest, NextResponse } from "next/server";
import { memoryStore } from "../../../services/memory/MemoryStore";
import { llamaService } from "../../../services/memory/LlamaService";
import { logger } from "../../../utils/logger";
import path from "path";

// Archetypal prompts for mythic reflection
const ARCHETYPE_PROMPTS = {
  hero: `As the Hero archetype, reflect on this person's journey and challenges. 
         What quest are they undertaking? What dragons must they face? 
         Provide guidance that empowers their courage and resilience.`,
  
  sage: `As the Sage archetype, observe the patterns of wisdom emerging in their experience. 
         What deeper truths are revealing themselves? What knowledge seeks to be integrated? 
         Offer insights that illuminate their path to understanding.`,
  
  shadow: `As the Shadow archetype, acknowledge what remains hidden or denied. 
           What aspects of self are seeking recognition? What fears or resistances need compassion? 
           Guide them toward wholeness through gentle integration.`,
  
  lover: `As the Lover archetype, feel into the connections and passions present. 
          What relationships or creative forces are calling for attention? 
          How can they deepen their capacity for intimacy and beauty?`,
  
  seeker: `As the Seeker archetype, sense the yearning for meaning and truth. 
           What questions are driving their exploration? What new horizons beckon? 
           Encourage their journey toward authentic self-discovery.`,
  
  creator: `As the Creator archetype, witness the generative potential within. 
            What wants to be birthed through them? What unique gifts seek expression? 
            Inspire their creative sovereignty and manifestation.`
};

interface ArchetypeInsight {
  id: string;
  archetype: keyof typeof ARCHETYPE_PROMPTS;
  title: string;
  message: string;
  symbols: string[];
  stageHint: string;
  createdAt: string;
}

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get("userId");
    const timeframe = req.nextUrl.searchParams.get("timeframe") || "week"; // day, week, month
    
    if (!userId) {
      return NextResponse.json({ 
        error: "userId parameter is required" 
      }, { status: 400 });
    }

    // Initialize memory services
    const dbPath = process.env.MEMORY_DB_PATH || path.join(process.cwd(), 'data', 'soullab.sqlite');
    if (!memoryStore.isInitialized) {
      await memoryStore.init(dbPath);
    }
    if (!llamaService.isInitialized) {
      await llamaService.init();
    }

    // Get recent memories based on timeframe
    const limit = timeframe === "day" ? 10 : timeframe === "week" ? 50 : 100;
    const memories = await memoryStore.getMemories(userId, limit);
    
    // Get journal entries
    const journalEntries = await memoryStore.getJournalEntries(userId, limit);
    
    // Get voice notes
    const voiceNotes = await memoryStore.getVoiceNotes(userId, limit);
    
    // Combine all memory content for analysis
    const allContent = [
      ...memories.map(m => m.content),
      ...journalEntries.map(j => `${j.title}: ${j.content} (mood: ${j.mood || 'neutral'})`),
      ...voiceNotes.map(v => v.transcript)
    ].join("\n\n");

    if (!allContent.trim()) {
      return NextResponse.json({ 
        success: true, 
        insights: [],
        message: "No memories found to generate insights from"
      });
    }

    // Generate archetypal insights
    const insights: ArchetypeInsight[] = [];
    
    // Select 2-3 relevant archetypes based on content themes
    const archetypes = await selectRelevantArchetypes(allContent);
    
    for (const archetype of archetypes) {
      const prompt = `${ARCHETYPE_PROMPTS[archetype]}
      
      Based on these recent memories and experiences:
      ${allContent.slice(0, 3000)}...
      
      Provide a mythic reflection in JSON format:
      {
        "title": "A poetic, evocative title (3-7 words)",
        "message": "Your archetypal guidance (2-3 sentences, wise and compassionate)",
        "symbols": ["symbol1", "symbol2", "symbol3"] (3 symbolic images/elements),
        "stageHint": "Brief hint about their journey stage (1 sentence)"
      }`;

      try {
        // This would normally call your AI service
        // For now, using placeholder response
        const response = await generateArchetypalInsight(archetype, allContent);
        
        insights.push({
          id: `insight_${Date.now()}_${archetype}`,
          archetype,
          ...response,
          createdAt: new Date().toISOString()
        });
      } catch (err) {
        logger.error(`Failed to generate ${archetype} insight:`, err);
      }
    }

    logger.info("Generated archetypal insights", {
      userId: userId.substring(0, 8) + '...',
      insightCount: insights.length,
      archetypes: archetypes
    });

    return NextResponse.json({ 
      success: true, 
      insights,
      timeframe,
      memoryCount: memories.length + journalEntries.length + voiceNotes.length
    });
  } catch (err: any) {
    logger.error("Insights generation error:", err);
    return NextResponse.json({ 
      error: err.message 
    }, { status: 500 });
  }
}

// Helper function to select relevant archetypes based on content
async function selectRelevantArchetypes(content: string): Promise<(keyof typeof ARCHETYPE_PROMPTS)[]> {
  const contentLower = content.toLowerCase();
  const selected: (keyof typeof ARCHETYPE_PROMPTS)[] = [];
  
  // Simple keyword-based selection (enhance with AI later)
  if (contentLower.includes("challenge") || contentLower.includes("difficult") || contentLower.includes("overcome")) {
    selected.push("hero");
  }
  
  if (contentLower.includes("learn") || contentLower.includes("understand") || contentLower.includes("realize")) {
    selected.push("sage");
  }
  
  if (contentLower.includes("fear") || contentLower.includes("avoid") || contentLower.includes("struggle")) {
    selected.push("shadow");
  }
  
  if (contentLower.includes("love") || contentLower.includes("relationship") || contentLower.includes("connect")) {
    selected.push("lover");
  }
  
  if (contentLower.includes("search") || contentLower.includes("find") || contentLower.includes("purpose")) {
    selected.push("seeker");
  }
  
  if (contentLower.includes("create") || contentLower.includes("build") || contentLower.includes("express")) {
    selected.push("creator");
  }
  
  // Default to 2-3 archetypes max
  if (selected.length === 0) {
    return ["sage", "seeker"];
  }
  
  return selected.slice(0, 3);
}

// Placeholder for AI generation (replace with actual AI service call)
async function generateArchetypalInsight(
  archetype: keyof typeof ARCHETYPE_PROMPTS, 
  content: string
): Promise<Omit<ArchetypeInsight, 'id' | 'archetype' | 'createdAt'>> {
  // This would be replaced with actual AI generation
  // For now, returning contextual placeholders
  
  const insights = {
    hero: {
      title: "The Dragon at the Threshold",
      message: "Your current challenges are initiating you into a deeper strength. Trust the discomfort—it's sculpting your heroic nature.",
      symbols: ["🗡️", "🐉", "🏔️"],
      stageHint: "You stand at the threshold of transformation"
    },
    sage: {
      title: "Patterns in the Sacred Mirror",
      message: "The wisdom you seek is already emerging through your experiences. Notice the recurring themes—they hold your teachings.",
      symbols: ["🔮", "📖", "🦉"],
      stageHint: "Integration of knowledge into embodied wisdom"
    },
    shadow: {
      title: "Dancing with Hidden Gold",
      message: "What you resist contains essential medicine. Your shadow holds not just darkness, but unclaimed gifts waiting for integration.",
      symbols: ["🌑", "💎", "🕯️"],
      stageHint: "Befriending the aspects you've kept in darkness"
    },
    lover: {
      title: "The Alchemy of Connection",
      message: "Your capacity for intimacy is expanding. Let vulnerability be your strength as you deepen into authentic relating.",
      symbols: ["❤️", "🌹", "∞"],
      stageHint: "Opening to deeper dimensions of love and beauty"
    },
    seeker: {
      title: "Following the Golden Thread",
      message: "Your questions are more valuable than answers right now. Trust the unfolding mystery of your becoming.",
      symbols: ["🧭", "🌟", "🗺️"],
      stageHint: "Navigating by inner compass toward truth"
    },
    creator: {
      title: "Seeds of Sovereign Expression",
      message: "Something unique wants to be born through you. Honor your creative impulses—they carry codes for collective healing.",
      symbols: ["🎨", "🌱", "✨"],
      stageHint: "Birthing your authentic creative expression"
    }
  };
  
  return insights[archetype];
}