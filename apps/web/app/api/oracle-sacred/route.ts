import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';import { voiceToIntentPrompt, VoiceIntent } from '@/lib/prompts/sacred-portal/voice-to-intent';
import { oracleMotionPrompt, OracleMotion, coherenceToMotion, elementToFrequency } from '@/lib/prompts/sacred-portal/oracle-motion';
import { v4 as uuid } from 'uuid';

// Stub Claude client for now
const callClaude = async (prompt: string): Promise<any> => {
  // This will be replaced with actual Claude API call
  // For now, return mock responses based on prompt type
  
  if (prompt.includes("Sacred Voice Oracle")) {
    // Mock voice intent response
    return {
      emotion: "reflective",
      breath: "steady",
      element: "water",
      stage: 2,
      shadowPetals: ["power", "courage"],
      coherence: 0.65,
      impliedThemes: ["self-discovery", "emotional processing"],
      sacredMoment: false
    } as VoiceIntent;
  }
  
  if (prompt.includes("Sacred Oracle")) {
    // Mock oracle motion response
    return {
      oracleResponse: "The water within you seeks its own level. What remains unspoken flows beneath, waiting for your courage to give it voice.",
      motionState: "responding",
      highlight: {
        element: "water",
        stage: 2,
        petals: ["love", "wisdom", "vision"]
      },
      aetherStage: null,
      frequency: 528,
      breathPattern: "exhale",
      luminosity: 0.7,
      rippleEffect: false
    } as OracleMotion;
  }
  
  return {};
};

export async function POST(req: NextRequest) {
  try {
    const { transcript, audioFeatures } = await req.json();
    
    if (!transcript) {
      return NextResponse.json(
        { error: 'No transcript provided' },
        { status: 400 }
      );
    }
    
    const sessionId = uuid();
    const timestamp = new Date().toISOString();
    
    // Step 1: Process voice input to detect intent
    console.log('[Sacred Portal] Processing voice intent...');
    const intentPrompt = voiceToIntentPrompt(transcript);
    const intent = await callClaude(intentPrompt) as VoiceIntent;
    
    // Step 2: Generate oracle response with motion mapping
    console.log('[Sacred Portal] Generating oracle response...');
    const oraclePrompt = oracleMotionPrompt(intent, transcript);
    const oracle = await callClaude(oraclePrompt) as OracleMotion;
    
    // Step 3: Enhance motion state with coherence dynamics
    const coherenceMotion = coherenceToMotion(intent.coherence);
    const enhancedOracle = {
      ...oracle,
      ...coherenceMotion,
      frequency: oracle.frequency || elementToFrequency(intent.element)
    };
    
    // Step 4: Build unified sacred response
    const sacredResponse = {
      sessionId,
      timestamp,
      transcript,
      intent,
      oracle: enhancedOracle,
      motion: {
        state: enhancedOracle.motionState,
        highlight: enhancedOracle.highlight,
        aetherStage: enhancedOracle.aetherStage,
        coherence: intent.coherence,
        shadowPetals: intent.shadowPetals,
        frequency: enhancedOracle.frequency,
        breathPattern: enhancedOracle.breathPattern,
        luminosity: enhancedOracle.luminosity,
        rippleEffect: enhancedOracle.rippleEffect
      },
      sacred: {
        moment: intent.sacredMoment,
        element: intent.element,
        stage: intent.stage,
        themes: intent.impliedThemes
      }
    };
    
    // Step 5: Store session (stub for now)
    console.log('[Sacred Portal] Session created:', sessionId);
    // await supabase.from('sacred_sessions').insert(sacredResponse);
    
    return NextResponse.json({
      success: true,
      ...sacredResponse
    });
    
  } catch (error: any) {
    console.error('[Sacred Portal] Error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to process sacred oracle session',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

// GET endpoint for testing the sacred portal
export async function GET(req: NextRequest) {
  const testTranscripts = [
    "I feel lost between who I was and who I'm becoming",
    "There's a fire in me that I'm afraid to let burn",
    "The silence holds something I'm not ready to hear",
    "I'm standing at the edge of something vast and unknown",
    "My heart knows the answer but my mind keeps questioning"
  ];
  
  const randomTranscript = testTranscripts[Math.floor(Math.random() * testTranscripts.length)];
  
  // Process test transcript
  const response = await POST(
    new NextRequest('http://localhost:3000/api/oracle-sacred', {
      method: 'POST',
      body: JSON.stringify({ transcript: randomTranscript })
    })
  );
  
  const data = await response.json();
  
  return NextResponse.json({
    test: true,
    transcript: randomTranscript,
    response: data,
    description: "Sacred Portal test response"
  });
}