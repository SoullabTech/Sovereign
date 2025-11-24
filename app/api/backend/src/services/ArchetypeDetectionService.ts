import { logger } from "../utils/logger";

export interface Archetype {
  name: string;
  symbol: string;
  description: string;
  keywords: string[];
  color: string;
  energy: "light" | "shadow" | "neutral";
}

export interface ArchetypeInsight {
  archetype: Archetype;
  confidence: number;
  excerpt: string;
  interpretation: string;
  growthPrompt?: string;
}

export class ArchetypeDetectionService {
  private archetypes: Archetype[] = [
    {
      name: "The Hero",
      symbol: "⚔️",
      description: "Courage, determination, overcoming challenges",
      keywords: ["challenge", "overcome", "fight", "struggle", "achieve", "goal", "win", "succeed", "brave", "courage"],
      color: "red",
      energy: "light"
    },
    {
      name: "The Sage",
      symbol: "🦉",
      description: "Wisdom, knowledge, understanding, truth-seeking",
      keywords: ["learn", "understand", "know", "wisdom", "truth", "think", "analyze", "research", "study", "discover"],
      color: "purple",
      energy: "light"
    },
    {
      name: "The Shadow",
      symbol: "🌑",
      description: "Hidden aspects, repressed emotions, unconscious patterns",
      keywords: ["fear", "anxiety", "dark", "hidden", "secret", "shame", "guilt", "repress", "avoid", "deny"],
      color: "gray",
      energy: "shadow"
    },
    {
      name: "The Lover",
      symbol: "💝",
      description: "Connection, passion, intimacy, relationships",
      keywords: ["love", "connect", "relationship", "intimate", "passion", "desire", "heart", "feel", "emotion", "care"],
      color: "pink",
      energy: "light"
    },
    {
      name: "The Creator",
      symbol: "🎨",
      description: "Innovation, imagination, artistic expression",
      keywords: ["create", "build", "make", "design", "imagine", "art", "innovate", "express", "craft", "vision"],
      color: "orange",
      energy: "light"
    },
    {
      name: "The Caregiver",
      symbol: "🤲",
      description: "Nurturing, protecting, helping others",
      keywords: ["help", "care", "protect", "nurture", "support", "give", "serve", "heal", "comfort", "compassion"],
      color: "green",
      energy: "light"
    },
    {
      name: "The Trickster",
      symbol: "🃏",
      description: "Playfulness, humor, breaking rules, transformation",
      keywords: ["play", "joke", "laugh", "trick", "change", "transform", "rebel", "chaos", "fun", "spontaneous"],
      color: "yellow",
      energy: "neutral"
    },
    {
      name: "The Wanderer",
      symbol: "🧭",
      description: "Seeking, exploring, freedom, independence",
      keywords: ["search", "explore", "journey", "travel", "free", "independent", "discover", "wander", "quest", "adventure"],
      color: "blue",
      energy: "neutral"
    },
    {
      name: "The Sovereign",
      symbol: "👑",
      description: "Leadership, responsibility, order, authority",
      keywords: ["lead", "control", "order", "rule", "power", "responsible", "authority", "decide", "command", "organize"],
      color: "gold",
      energy: "neutral"
    },
    {
      name: "The Innocent",
      symbol: "🕊️",
      description: "Purity, trust, optimism, new beginnings",
      keywords: ["pure", "trust", "hope", "optimistic", "simple", "fresh", "new", "begin", "faith", "believe"],
      color: "white",
      energy: "light"
    }
  ];

  /**
   * Detect archetypes present in user's text
   */
  detectArchetypes(text: string): ArchetypeInsight[] {
    const lowercaseText = text.toLowerCase();
    const insights: ArchetypeInsight[] = [];

    for (const archetype of this.archetypes) {
      let matchCount = 0;
      const matchedKeywords: string[] = [];

      // Count keyword matches
      for (const keyword of archetype.keywords) {
        if (lowercaseText.includes(keyword)) {
          matchCount++;
          matchedKeywords.push(keyword);
        }
      }

      // Calculate confidence (0-1)
      const confidence = Math.min(matchCount / 3, 1); // 3 keywords = full confidence

      if (confidence > 0.3) {
        // Extract relevant excerpt
        const excerpt = this.extractExcerpt(text, matchedKeywords[0] || archetype.keywords[0]);
        
        insights.push({
          archetype,
          confidence,
          excerpt,
          interpretation: this.generateInterpretation(archetype, matchedKeywords, confidence),
          growthPrompt: confidence > 0.6 ? this.generateGrowthPrompt(archetype) : undefined
        });
      }
    }

    // Sort by confidence
    return insights.sort((a, b) => b.confidence - a.confidence).slice(0, 3);
  }

  /**
   * Analyze patterns across multiple memories
   */
  analyzeArchetypalJourney(memories: Array<{ content: string; timestamp: string }>): {
    dominantArchetype: Archetype;
    journey: Array<{ archetype: Archetype; timestamp: string }>;
    insights: string;
  } | null {
    if (memories.length < 3) return null;

    const archetypeHistory: Map<string, number> = new Map();
    const journey: Array<{ archetype: Archetype; timestamp: string }> = [];

    // Analyze each memory
    for (const memory of memories) {
      const insights = this.detectArchetypes(memory.content);
      if (insights.length > 0) {
        const dominant = insights[0].archetype;
        archetypeHistory.set(dominant.name, (archetypeHistory.get(dominant.name) || 0) + 1);
        journey.push({ archetype: dominant, timestamp: memory.timestamp });
      }
    }

    // Find dominant archetype
    let dominantArchetype: Archetype | null = null;
    let maxCount = 0;
    
    archetypeHistory.forEach((count, name) => {
      if (count > maxCount) {
        maxCount = count;
        dominantArchetype = this.archetypes.find(a => a.name === name) || null;
      }
    });

    if (!dominantArchetype) return null;

    return {
      dominantArchetype,
      journey: journey.slice(-5), // Last 5 entries
      insights: this.generateJourneyInsights(dominantArchetype, journey)
    };
  }

  private extractExcerpt(text: string, keyword: string): string {
    const index = text.toLowerCase().indexOf(keyword.toLowerCase());
    if (index === -1) return text.slice(0, 100) + "...";

    const start = Math.max(0, index - 50);
    const end = Math.min(text.length, index + keyword.length + 50);
    
    return (start > 0 ? "..." : "") + 
           text.slice(start, end) + 
           (end < text.length ? "..." : "");
  }

  private generateInterpretation(archetype: Archetype, keywords: string[], confidence: number): string {
    const intensity = confidence > 0.7 ? "really" : confidence > 0.5 ? "clearly" : "gently";
    
    const interpretations: Record<string, string> = {
      "The Hero": `I notice you're ${intensity} in growth mode right now - taking on challenges and pushing through resistance.`,
      "The Sage": `There's a ${intensity} reflective quality to what you're sharing - you're processing and making sense of things.`,
      "The Shadow": `You're ${intensity} exploring some deeper territory here - the parts of life that aren't always comfortable but hold important insights.`,
      "The Lover": `Connection seems ${intensity} alive in what you're expressing - whether to others, to beauty, or to what matters most.`,
      "The Creator": `Your creative essence is ${intensity} coming through - there's something wanting to be expressed or brought into being.`,
      "The Caregiver": `I can sense your caring nature ${intensity} - you're naturally oriented toward nurturing and supporting.`,
      "The Trickster": `There's a ${intensity} playful, transformative energy here - you're not afraid to shake things up when needed.`,
      "The Wanderer": `You're in ${intensity} exploratory mode - seeking, questioning, not quite ready to settle into fixed answers.`,
      "The Sovereign": `Your natural leadership is showing ${intensity} - you're thinking about responsibility, impact, and how to create positive change.`,
      "The Innocent": `There's a ${intensity} fresh, hopeful quality to your perspective - you're approaching things with openness and trust.`
    };

    return interpretations[archetype.name] || `There's something meaningful stirring in what you're sharing.`;
  }

  private generateGrowthPrompt(archetype: Archetype): string {
    const prompts: Record<string, string> = {
      "The Hero": "What's the real challenge asking for your attention right now? Where do you feel ready to step up?",
      "The Sage": "What are you learning about yourself through this experience? What patterns are you starting to see?",
      "The Shadow": "What's one thing you've been avoiding that might actually be worth exploring? What would happen if you faced it?",
      "The Lover": "What brings you most alive right now? How can you create more connection - with others or with what you care about?",
      "The Creator": "What wants to be expressed through you? What would you make if you knew it would turn out beautifully?",
      "The Caregiver": "How are you taking care of yourself while supporting others? What do you need right now?",
      "The Trickster": "What would happen if you approached this situation with more lightness? Where could you use less seriousness and more play?",
      "The Wanderer": "What are you really searching for? What would it feel like to trust the journey even without knowing the destination?",
      "The Sovereign": "Where in your life are you ready to take more ownership? What positive change do you want to create?",
      "The Innocent": "What would it look like to approach this with fresh eyes? What possibilities open up when you trust the process?"
    };

    return prompts[archetype.name] || "What's alive in this for you? What wants your attention?";
  }

  private generateJourneyInsights(dominant: Archetype, journey: Array<{ archetype: Archetype; timestamp: string }>): string {
    const recentArchetypes = journey.slice(-3).map(j => j.archetype.name).join(" → ");
    
    return `Your archetypal journey shows a strong connection to ${dominant.name}. ` +
           `Recently, you've moved through: ${recentArchetypes}. ` +
           `This progression suggests ${dominant.energy === 'shadow' ? 'deep inner work' : 'active growth'} ` +
           `in the realm of ${dominant.description.toLowerCase()}.`;
  }
}

export const archetypeService = new ArchetypeDetectionService();