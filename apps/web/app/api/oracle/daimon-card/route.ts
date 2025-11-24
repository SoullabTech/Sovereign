import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
interface DaimonCard {
  id: string;
  title: string;
  symbol: string;
  message: string;
  archetype: string;
  element: 'fire' | 'water' | 'air' | 'earth' | 'aether';
  intensity: 'subtle' | 'moderate' | 'intense';
  guidance: string[];
  timestamp: string;
}

interface DaimonTrigger {
  emotional_intensity: number; // 0-1
  archetypal_resonance: number; // 0-1  
  content: string;
  archetype?: string;
  valence?: number;
  arousal?: number;
  dominance?: number;
}

export async function POST(request: NextRequest) {
  try {
    const { userId, trigger }: { userId: string; trigger: DaimonTrigger } = await request.json();
    
    if (!userId || !trigger) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing userId or trigger data' 
      }, { status: 400 });
    }

    // Check if daimonic encounter should be triggered
    const shouldTrigger = calculateDaimonicTrigger(trigger);
    
    if (!shouldTrigger.triggered) {
      return NextResponse.json({
        success: true,
        triggered: false,
        threshold_info: shouldTrigger.reason
      });
    }

    // Generate daimonic encounter card
    const daimonCard = generateDaimonCard(trigger, shouldTrigger.intensity);
    
    return NextResponse.json({
      success: true,
      triggered: true,
      card: daimonCard
    });

  } catch (error) {
    console.error('Daimon card generation error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to generate daimon encounter' 
    }, { status: 500 });
  }
}

function calculateDaimonicTrigger(trigger: DaimonTrigger): { triggered: boolean; intensity: 'subtle' | 'moderate' | 'intense'; reason: string } {
  const { emotional_intensity, archetypal_resonance, valence, arousal, dominance } = trigger;
  
  // High emotional intensity threshold
  if (emotional_intensity > 0.8 && archetypal_resonance > 0.7) {
    return { triggered: true, intensity: 'intense', reason: 'High emotional and archetypal resonance' };
  }
  
  // Strong emotional contrast (very high or low valence with high arousal)
  if (arousal && arousal > 0.8 && valence && (valence > 0.6 || valence < -0.6)) {
    return { triggered: true, intensity: 'moderate', reason: 'Intense emotional contrast detected' };
  }
  
  // Shadow work threshold (low valence, high dominance paradox)
  if (valence && valence < -0.4 && dominance && dominance > 0.7) {
    return { triggered: true, intensity: 'subtle', reason: 'Shadow integration opportunity' };
  }
  
  // Breakthrough moments (high dominance + high arousal)
  if (dominance && dominance > 0.8 && arousal && arousal > 0.7) {
    return { triggered: true, intensity: 'moderate', reason: 'Empowerment breakthrough detected' };
  }
  
  return { triggered: false, intensity: 'subtle', reason: 'Below daimonic threshold' };
}

function generateDaimonCard(trigger: DaimonTrigger, intensity: 'subtle' | 'moderate' | 'intense'): DaimonCard {
  const { content, archetype, valence, arousal, dominance } = trigger;
  
  // Select archetypal theme
  const archetypalTheme = archetype || detectArchetypeFromContent(content);
  
  // Generate appropriate daimon encounter
  const encounters = getDaimonEncounters(archetypalTheme, intensity, valence, arousal, dominance);
  const selected = encounters[Math.floor(Math.random() * encounters.length)];
  
  return {
    id: `daimon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
    intensity,
    ...selected
  };
}

function detectArchetypeFromContent(content: string): string {
  const text = content.toLowerCase();
  
  if (text.includes('journey') || text.includes('path') || text.includes('quest')) return 'Hero';
  if (text.includes('wisdom') || text.includes('understand') || text.includes('learn')) return 'Sage';
  if (text.includes('create') || text.includes('build') || text.includes('make')) return 'Creator';
  if (text.includes('love') || text.includes('connect') || text.includes('relationship')) return 'Lover';
  if (text.includes('fear') || text.includes('dark') || text.includes('difficult')) return 'Shadow';
  
  return 'Seeker';
}

function getDaimonEncounters(archetype: string, intensity: string, valence?: number, arousal?: number, dominance?: number): Omit<DaimonCard, 'id' | 'timestamp' | 'intensity'>[] {
  
  const encounters: Record<string, Omit<DaimonCard, 'id' | 'timestamp' | 'intensity'>[]> = {
    Hero: [
      {
        title: "The Threshold Guardian",
        symbol: "⚔️",
        message: "A threshold appears before you. What you've called obstacle is actually invitation.",
        archetype: "Hero",
        element: "fire",
        guidance: ["Trust your inner warrior", "Face the challenge directly", "Remember: courage grows with action"]
      },
      {
        title: "The Inner Dragon",
        symbol: "🐉",
        message: "The dragon you must slay lives within. It guards your greatest treasure.",
        archetype: "Hero",
        element: "fire",
        guidance: ["Look within for the real battle", "Your fears guard your gifts", "Transformation requires sacrifice"]
      }
    ],
    
    Sage: [
      {
        title: "The Midnight Teacher",
        symbol: "🧙‍♀️",
        message: "In the darkness of not-knowing, the deepest wisdom is born.",
        archetype: "Sage",
        element: "air",
        guidance: ["Embrace the mystery", "Questions matter more than answers", "Wisdom comes through experience"]
      },
      {
        title: "The Ancient Mirror",
        symbol: "🪞",
        message: "What you seek to understand is already understanding itself through you.",
        archetype: "Sage",
        element: "aether",
        guidance: ["You are both observer and observed", "Knowledge and knower are one", "Look beyond concepts"]
      }
    ],
    
    Shadow: [
      {
        title: "The Dark Companion",
        symbol: "🌑",
        message: "I am the part of you that you've refused to see. Shall we dance?",
        archetype: "Shadow",
        element: "earth",
        guidance: ["What you resist persists", "Integration, not elimination", "Your shadow holds power"]
      },
      {
        title: "The Wounded Healer",
        symbol: "⚡",
        message: "Your deepest wounds are becoming your greatest medicine.",
        archetype: "Shadow",
        element: "water",
        guidance: ["Pain transforms into compassion", "Heal by helping others", "Your struggles have purpose"]
      }
    ],
    
    Lover: [
      {
        title: "The Heart's Compass",
        symbol: "💝",
        message: "What you love is loving itself through you. Follow this magnetic pull.",
        archetype: "Lover",
        element: "water",
        guidance: ["Trust what draws you", "Love is recognition, not attachment", "Connection transcends form"]
      },
      {
        title: "The Sacred Union",
        symbol: "♾️",
        message: "You are both the lover and the beloved. End the search by beginning the dance.",
        archetype: "Lover",
        element: "aether",
        guidance: ["Love yourself first", "Unity consciousness", "Dissolve the subject-object divide"]
      }
    ],
    
    Creator: [
      {
        title: "The Divine Spark",
        symbol: "✨",
        message: "You are creativity itself, temporarily forgetting its infinite nature.",
        archetype: "Creator",
        element: "fire",
        guidance: ["Create from emptiness", "You are the canvas and the artist", "Trust the creative process"]
      },
      {
        title: "The Cosmic Craftsperson",
        symbol: "🎨",
        message: "Every creation is the universe expressing itself through your unique aperture.",
        archetype: "Creator",
        element: "air",
        guidance: ["You are a channel, not the source", "Create to discover who you are", "Art is spiritual practice"]
      }
    ],
    
    Seeker: [
      {
        title: "The Pathless Path",
        symbol: "🧭",
        message: "You are looking for what is looking. The seeker is the sought.",
        archetype: "Seeker",
        element: "aether",
        guidance: ["Stop seeking and start being", "You already have what you seek", "The journey IS the destination"]
      },
      {
        title: "The Eternal Student",
        symbol: "🔄",
        message: "Every ending is a beginning. Every answer births new questions.",
        archetype: "Seeker",
        element: "air",
        guidance: ["Embrace beginner's mind", "Uncertainty is freedom", "Growth never ends"]
      }
    ]
  };
  
  return encounters[archetype] || encounters.Seeker;
}