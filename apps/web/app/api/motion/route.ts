import { NextRequest, NextResponse } from "next/server";

export const dynamic = 'force-dynamic';import { calculateMotionState, MotionState } from "@/lib/motion-schema";
import { detectShadow, getElementalShadow } from "@/lib/shadow-insight";
import { detectAetherResonance } from "@/lib/aether-facets";
import { calculateCoherence } from "@/lib/agent-context";

// Real-time motion state orchestration
// Translates journal/voice/check-in into embodied feedback

export async function POST(req: NextRequest) {
  try {
    const { journalText, checkIns, voiceData, previousState } = await req.json();
    
    // Step 1: Analyze journal for emotional tone and themes
    const emotionalTone = analyzeEmotionalTone(journalText);
    
    // Step 2: Detect shadow facets (what's avoided/hidden)
    const shadowInsight = detectShadow(journalText, checkIns || {});
    const shadowPetals = shadowInsight.avoidedFacets;
    
    // Step 3: Check for Aether resonance (transcendent states)
    const hasAether = detectAetherResonance(journalText);
    
    // Step 4: Calculate elemental balance
    const elementalBalance = getElementalShadow(checkIns || {});
    
    // Step 5: Calculate coherence between text and check-ins
    const coherenceValue = calculateCoherence(
      checkIns || {},
      journalText,
      Object.entries(elementalBalance).reduce((a, b) => a[1] > b[1] ? a : b)[0]
    );
    
    // Step 6: Process voice data if present
    const processedVoice = voiceData ? {
      amplitude: voiceData.amplitude || 0.5,
      tempo: voiceData.tempo || 60,
      emotion: emotionalTone,
      pattern: detectBreathingPattern(voiceData)
    } : undefined;
    
    // Step 7: Calculate motion state
    const motionState = calculateMotionState(
      coherenceValue,
      shadowPetals,
      hasAether,
      processedVoice,
      elementalBalance
    );
    
    // Step 8: Add special breakthrough detection
    if (detectBreakthrough(journalText, coherenceValue)) {
      motionState.coherence = "breakthrough";
      motionState.animation.ripple = true;
      motionState.animation.glow = 1;
    }
    
    // Step 9: Handle Oracle-triggered motion states
    const oracleMotion = detectOracleMotion(journalText);
    if (oracleMotion) {
      motionState.aetherStage = oracleMotion.stage;
      motionState.momentum = oracleMotion.momentum;
    }
    
    return NextResponse.json({
      success: true,
      motionState,
      metadata: {
        coherenceValue,
        shadowCount: shadowPetals.length,
        hasAether,
        emotionalTone,
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error: any) {
    console.error("Motion orchestration error:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to calculate motion state",
        fallbackState: getDefaultMotionState()
      },
      { status: 500 }
    );
  }
}

// Analyze emotional tone from text
function analyzeEmotionalTone(text: string): MotionState['voiceSync']['emotion'] {
  const lower = text.toLowerCase();
  
  // Keywords for different emotional tones
  const tonePatterns = {
    calm: ["peace", "quiet", "still", "gentle", "soft", "serene"],
    intense: ["urgent", "desperate", "passionate", "fierce", "burning", "explosive"],
    reflective: ["thinking", "wondering", "considering", "pondering", "remembering"],
    expansive: ["infinite", "vast", "open", "free", "boundless", "cosmic"],
    contracted: ["tight", "closed", "stuck", "trapped", "frozen", "paralyzed"]
  };
  
  let maxScore = 0;
  let detectedTone: MotionState['voiceSync']['emotion'] = "calm";
  
  for (const [tone, keywords] of Object.entries(tonePatterns)) {
    const score = keywords.filter(keyword => lower.includes(keyword)).length;
    if (score > maxScore) {
      maxScore = score;
      detectedTone = tone as MotionState['voiceSync']['emotion'];
    }
  }
  
  return detectedTone;
}

// Detect breathing pattern from voice data
function detectBreathingPattern(voiceData: any): MotionState['voiceSync']['pattern'] {
  if (!voiceData) return "steady";
  
  const amplitude = voiceData.amplitude || 0.5;
  const variability = voiceData.variability || 0.5;
  
  if (amplitude < 0.3) return "shallow";
  if (amplitude > 0.7) return "deep";
  if (variability > 0.7) return "held";
  if (variability < 0.3) return "released";
  return "steady";
}

// Detect breakthrough moments
function detectBreakthrough(text: string, coherence: number): boolean {
  const breakthroughKeywords = [
    "realize", "understand now", "breakthrough", "clarity",
    "it all makes sense", "i see", "revelation", "epiphany",
    "finally", "discovered", "unlocked"
  ];
  
  const hasBreakthroughLanguage = breakthroughKeywords.some(keyword => 
    text.toLowerCase().includes(keyword)
  );
  
  return hasBreakthroughLanguage && coherence > 0.8;
}

// Detect Oracle-triggered motion states
function detectOracleMotion(text: string): { stage: 1 | 2 | 3; momentum: MotionState['momentum'] } | null {
  const lower = text.toLowerCase();
  
  // Expansion triggers
  if (lower.includes("expand") || lower.includes("vastness") || lower.includes("infinite")) {
    return { stage: 1, momentum: "accelerating" };
  }
  
  // Contraction triggers
  if (lower.includes("contract") || lower.includes("witness") || lower.includes("pause")) {
    return { stage: 2, momentum: "decelerating" };
  }
  
  // Stillness triggers
  if (lower.includes("still") || lower.includes("silence") || lower.includes("void")) {
    return { stage: 3, momentum: "paused" };
  }
  
  return null;
}

// Default motion state for fallback
function getDefaultMotionState(): MotionState {
  return {
    coherence: "medium",
    coherenceValue: 0.5,
    shadowPetals: [],
    shadowIntensity: 0,
    elementalCurrent: {
      primary: "fire",
      transition: false
    },
    animation: {
      pulseSpeed: 4,
      pulseIntensity: 1.05,
      jitter: 0.1,
      glow: 0.5,
      ripple: false
    },
    momentum: "steady",
    phase: "inhale"
  };
}

// GET endpoint for testing motion states
export async function GET(req: NextRequest) {
  const testStates = {
    low: calculateMotionState(0.2, ["creativity", "wisdom"], false),
    medium: calculateMotionState(0.5, ["power"], false),
    high: calculateMotionState(0.8, [], false),
    breakthrough: calculateMotionState(0.95, [], false),
    aether: calculateMotionState(0.6, [], true)
  };
  
  return NextResponse.json({
    success: true,
    testStates,
    description: "Sample motion states for different coherence levels"
  });
}