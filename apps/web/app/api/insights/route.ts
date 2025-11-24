import { NextRequest, NextResponse } from "next/server";

export const dynamic = 'force-dynamic';import { v4 as uuid } from "uuid";
import { calculateMotionState, MotionState } from "@/lib/motion-schema";

// Stub imports for now - will wire to real libs later
const anthropic = {
  messages: {
    create: async ({ model, max_tokens, messages }: any) => {
      // Stub response for development
      const content = {
        userCheckin: [
          { 
            petal: "creativity", 
            essence: "Creative Expression", 
            keywords: ["innovation", "art", "flow"], 
            feeling: "Like colors dancing in your mind", 
            ritual: "Draw one thing without lifting your pen" 
          }
        ],
        oracleReading: {
          elementalBalance: { fire: 0.7, water: 0.5, earth: 0.3, air: 0.8, aether: 0.4 },
          spiralStage: { element: "fire", stage: 2 },
          reflection: "You are in a phase of passionate creation",
          practice: "Channel your fire through focused work sessions",
          archetype: "The Creator-Destroyer"
        },
        mergedInsight: {
          alignment: "Both point to creative fire energy",
          tension: "Mind seeks structure while heart wants freedom",
          synthesis: "Dance between discipline and spontaneity"
        }
      };
      
      // Return appropriate section based on prompt content
      const promptText = messages[0].content;
      if (promptText.includes("Holoflower Interpreter")) {
        return { content: [{ text: JSON.stringify({ userCheckin: content.userCheckin }) }] };
      } else if (promptText.includes("Spiralogic Oracle")) {
        return { content: [{ text: JSON.stringify({ oracleReading: content.oracleReading }) }] };
      } else {
        return { content: [{ text: JSON.stringify({ mergedInsight: content.mergedInsight }) }] };
      }
    }
  }
};

const supabase = {
  from: (table: string) => ({
    insert: async (data: any) => {
      console.log(`[Supabase Stub] Would insert into ${table}:`, data);
      return { data, error: null };
    }
  })
};

// Generate motion state from Oracle reading
async function generateMotionFromOracle(
  oracleReading: any,
  mergedInsight: any,
  userCheckin: any
): Promise<MotionState> {
  // Calculate coherence from synthesis
  let coherenceValue = 0.5;
  if (mergedInsight?.mergedInsight?.synthesis) {
    const synthesis = mergedInsight.mergedInsight.synthesis.toLowerCase();
    
    // Keywords indicating different coherence levels
    if (synthesis.includes("breakthrough") || synthesis.includes("clarity") || synthesis.includes("aligned")) {
      coherenceValue = 0.9;
    } else if (synthesis.includes("tension") || synthesis.includes("conflict") || synthesis.includes("stuck")) {
      coherenceValue = 0.3;
    } else if (synthesis.includes("emerging") || synthesis.includes("developing")) {
      coherenceValue = 0.6;
    }
  }
  
  // Detect shadow petals from tension
  const shadowPetals: string[] = [];
  if (mergedInsight?.mergedInsight?.tension) {
    // Extract petal names mentioned in tension
    const petalNames = ["creativity", "intuition", "courage", "love", "wisdom", "vision", 
                       "grounding", "flow", "power", "healing", "mystery", "joy"];
    petalNames.forEach(petal => {
      if (mergedInsight.mergedInsight.tension.toLowerCase().includes(petal)) {
        shadowPetals.push(petal);
      }
    });
  }
  
  // Check for Aether state
  const hasAether = oracleReading?.oracleReading?.spiralStage?.element === "aether";
  const aetherStage = hasAether ? oracleReading.oracleReading.spiralStage.stage : undefined;
  
  // Determine emotional tone from oracle archetype
  let emotionalTone: MotionState['voiceSync']['emotion'] = "calm";
  if (oracleReading?.oracleReading?.archetype) {
    const archetype = oracleReading.oracleReading.archetype.toLowerCase();
    if (archetype.includes("creator") || archetype.includes("destroyer")) {
      emotionalTone = "intense";
    } else if (archetype.includes("witness") || archetype.includes("sage")) {
      emotionalTone = "reflective";
    } else if (archetype.includes("mystic") || archetype.includes("void")) {
      emotionalTone = "expansive";
    }
  }
  
  // Get elemental balance from oracle
  const elementalBalance = oracleReading?.oracleReading?.elementalBalance || {
    fire: 0.5, water: 0.5, earth: 0.5, air: 0.5, aether: 0
  };
  
  // Calculate motion state
  const motionState = calculateMotionState(
    coherenceValue,
    shadowPetals,
    hasAether,
    { emotion: emotionalTone, amplitude: 0.5, tempo: 60, pattern: "steady" },
    elementalBalance
  );
  
  // Override with Aether stage if present
  if (aetherStage) {
    motionState.aetherStage = aetherStage;
    motionState.aetherIntensity = 0.8;
    
    // Adjust animation for Aether
    if (aetherStage === 1) { // Expansive
      motionState.momentum = "accelerating";
      motionState.animation.pulseSpeed = 8;
      motionState.animation.pulseIntensity = 1.2;
    } else if (aetherStage === 2) { // Contractive
      motionState.momentum = "decelerating";
      motionState.animation.pulseSpeed = 10;
      motionState.animation.pulseIntensity = 0.9;
    } else if (aetherStage === 3) { // Stillness
      motionState.momentum = "paused";
      motionState.animation.pulseSpeed = 15;
      motionState.animation.pulseIntensity = 1.0;
    }
  }
  
  // Check for breakthrough
  if (coherenceValue > 0.85 && mergedInsight?.mergedInsight?.synthesis?.includes("dance")) {
    motionState.coherence = "breakthrough";
    motionState.animation.ripple = true;
    motionState.animation.glow = 1;
  }
  
  return motionState;
}

export async function POST(req: NextRequest) {
  try {
    const { text, userCheckin } = await req.json();
    const sessionId = uuid();
    const timestamp = new Date().toISOString();

    // ----------------
    // Step 1. User Check-In
    // ----------------
    let userCheckinResult = null;
    if (userCheckin) {
      const promptCheckin = `
You are the Holoflower Interpreter.

Input: ${JSON.stringify(userCheckin, null, 2)}

Interpret this as an intuitive check-in.
For each petal >0.3:
- Name its Essence + Keywords (from Petal Chart)
- Describe what it might feel like
- Suggest one symbolic ritual

Respond in JSON as:
{ "userCheckin": [ { "petal": "...", "essence": "...", "keywords": ["..."], "feeling": "...", "ritual": "..." } ] }
`;
      const res = await anthropic.messages.create({
        model: "claude-3-opus-20240229",
        max_tokens: 800,
        messages: [{ role: "user", content: promptCheckin }],
      });
      userCheckinResult = JSON.parse(res.content[0].text);
    }

    // ----------------
    // Step 2. Oracle Reading
    // ----------------
    let oracleReadingResult = null;
    if (text) {
      const promptOracle = `
You are the Spiralogic Oracle.

Input: ${text}

Process in 5 layers:
1. Ontological reasoning (Fire, Water, Earth, Air, or Aether)
   - Fire = Vision/Expression/Expansion
   - Water = Heart/Healing/Holiness
   - Earth = Mission/Means/Medicine
   - Air = Connection/Community/Consciousness
   - Aether = Transcendence (Expansive, Contractive, Stillness)
2. Temporal expansion (past/present/future influences)
3. Implicit detection (explicit, implied, emergent, shadow, resonant)
4. Spiralogic mapping (Recognition → Integration)
5. Output shaping (reflection, micro-practice, archetypal image)

Rules:
- If the input mentions mystical states, non-duality, silence, vastness, or liminality → consider Aether1–3.
- Otherwise, map to Fire/Water/Earth/Air stages 1–3.

Respond ONLY in JSON:
{
  "oracleReading": {
    "elementalBalance": { "fire":0.xx,"water":0.xx,"earth":0.xx,"air":0.xx,"aether":0.xx },
    "spiralStage": { "element":"fire"|"water"|"earth"|"air"|"aether", "stage":1|2|3 },
    "reflection":"...",
    "practice":"...",
    "archetype":"..."
  }
}`;
      const res = await anthropic.messages.create({
        model: "claude-3-opus-20240229",
        max_tokens: 800,
        messages: [{ role: "user", content: promptOracle }],
      });
      oracleReadingResult = JSON.parse(res.content[0].text);
    }

    // ----------------
    // Step 3. Merge
    // ----------------
    let mergedInsightResult = null;
    if (userCheckinResult && oracleReadingResult) {
      const promptMerge = `
Input:
- userCheckin: ${JSON.stringify(userCheckinResult, null, 2)}
- oracleReading: ${JSON.stringify(oracleReadingResult, null, 2)}

Compare:
- Where do they align?
- Where do they diverge?
- If oracle shows Aether, how does it relate to the user's petal energies?
- Offer 1 synthesis statement bridging both perspectives.

Special handling for Aether:
- Aether1 (Expansive) = vastness meeting personal patterns
- Aether2 (Contractive) = witnessing without pushing forward
- Aether3 (Stillness) = perfect pause between breaths

Respond in JSON:
{
  "mergedInsight": {
    "alignment": "...",
    "tension": "...",
    "synthesis": "..."
  }
}`;
      const res = await anthropic.messages.create({
        model: "claude-3-opus-20240229",
        max_tokens: 500,
        messages: [{ role: "user", content: promptMerge }],
      });
      mergedInsightResult = JSON.parse(res.content[0].text);
    }

    // ----------------
    // Final Payload
    // ----------------
    const payload = {
      sessionId,
      timestamp,
      ...userCheckinResult,
      ...oracleReadingResult,
      ...mergedInsightResult,
    };

    // Persist
    await supabase.from("oracle_sessions").insert(payload);

    // Generate motion state from oracle response
    const motionState = await generateMotionFromOracle(
      oracleReadingResult,
      mergedInsightResult,
      userCheckinResult
    );

    return NextResponse.json({
      success: true,
      ...payload,
      motionState
    });

  } catch (error: any) {
    console.error("Insights API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to process insights",
        details: error.message
      },
      { status: 500 }
    );
  }
}
