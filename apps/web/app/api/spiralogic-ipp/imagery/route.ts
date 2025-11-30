import { NextRequest, NextResponse } from 'next/server';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

export const dynamic = 'force-dynamic';

// Spiralogic-IPP Guided Imagery API - Provides imagery scripts and interactive guidance
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const element = searchParams.get('element'); // 'earth', 'water', 'fire', 'air', 'aether'
    const type = searchParams.get('type') || 'full'; // 'full', 'abbreviated', 'intro', 'integration'
    const personalization = searchParams.get('personalization'); // Custom adaptations

    if (!element) {
      return NextResponse.json({
        error: 'Element parameter required',
        availableElements: ['earth', 'water', 'fire', 'air', 'aether'],
        example: '/api/spiralogic-ipp/imagery?element=earth&type=full'
      }, { status: 400 });
    }

    // Load guided imagery scripts
    const scriptsPath = join(process.cwd(), 'apps', 'web', 'docs', 'community-library', 'spiralogic-ipp', 'Spiralogic-IPP-Guided-Imagery-Scripts.md');

    if (!existsSync(scriptsPath)) {
      return NextResponse.json({
        error: 'Guided imagery scripts not found',
        path: scriptsPath
      }, { status: 404 });
    }

    const scriptsContent = readFileSync(scriptsPath, 'utf-8');
    const scripts = parseImageryScripts(scriptsContent);

    const elementScript = scripts[element.toLowerCase()];
    if (!elementScript) {
      return NextResponse.json({
        error: `No imagery script found for element: ${element}`,
        availableElements: Object.keys(scripts)
      }, { status: 404 });
    }

    // Adapt script based on type requested
    const adaptedScript = adaptScript(elementScript, type, personalization);

    return NextResponse.json({
      success: true,
      element: element.toLowerCase(),
      type,
      script: adaptedScript,
      metadata: {
        duration: getDuration(type),
        phase: getPhaseInstructions(element.toLowerCase()),
        preparation: getPreparationInstructions(),
        integration: getIntegrationInstructions()
      }
    });

  } catch (error) {
    console.error('Imagery GET error:', error);
    return NextResponse.json({
      error: 'Failed to retrieve imagery script',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// POST endpoint for guided imagery sessions with personalization
export async function POST(request: NextRequest) {
  try {
    const {
      element,
      userId,
      sessionId,
      personalizations,
      culturalAdaptations,
      traumaSensitive,
      difficultyLevel
    } = await request.json();

    if (!element) {
      return NextResponse.json({
        error: 'Element is required for personalized imagery session'
      }, { status: 400 });
    }

    // Load base script
    const scriptsPath = join(process.cwd(), 'apps', 'web', 'docs', 'community-library', 'spiralogic-ipp', 'Spiralogic-IPP-Guided-Imagery-Scripts.md');
    const scriptsContent = readFileSync(scriptsPath, 'utf-8');
    const scripts = parseImageryScripts(scriptsContent);

    const baseScript = scripts[element.toLowerCase()];
    if (!baseScript) {
      return NextResponse.json({
        error: `No imagery script found for element: ${element}`
      }, { status: 404 });
    }

    // Create personalized session
    const personalizedScript = createPersonalizedScript(baseScript, {
      personalizations,
      culturalAdaptations,
      traumaSensitive,
      difficultyLevel,
      userId
    });

    // Create session tracking
    const session = {
      sessionId: sessionId || `imagery-${element}-${Date.now()}`,
      userId: userId || 'anonymous',
      element: element.toLowerCase(),
      timestamp: new Date().toISOString(),
      script: personalizedScript,
      status: 'active',
      adaptations: {
        personalizations,
        culturalAdaptations,
        traumaSensitive,
        difficultyLevel
      }
    };

    return NextResponse.json({
      success: true,
      session,
      guidance: {
        beforeStarting: getPreSessionGuidance(traumaSensitive),
        duringSession: getSessionGuidance(element.toLowerCase()),
        afterSession: getPostSessionGuidance(),
        emergencyGrounding: getEmergencyGrounding()
      }
    });

  } catch (error) {
    console.error('Imagery POST error:', error);
    return NextResponse.json({
      error: 'Failed to create personalized imagery session',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Helper functions
function parseImageryScripts(content: string) {
  const scripts: any = {};
  const lines = content.split('\n');
  let currentElement = '';
  let currentSection = '';
  let scriptContent: string[] = [];

  for (const line of lines) {
    // Detect element sections
    if (line.includes('🌍') && line.includes('EARTH')) {
      if (currentElement && scriptContent.length) {
        scripts[currentElement] = processScript(scriptContent.join('\n'));
      }
      currentElement = 'earth';
      scriptContent = [];
    } else if (line.includes('💧') && line.includes('WATER')) {
      if (currentElement && scriptContent.length) {
        scripts[currentElement] = processScript(scriptContent.join('\n'));
      }
      currentElement = 'water';
      scriptContent = [];
    } else if (line.includes('🔥') && line.includes('FIRE')) {
      if (currentElement && scriptContent.length) {
        scripts[currentElement] = processScript(scriptContent.join('\n'));
      }
      currentElement = 'fire';
      scriptContent = [];
    } else if (line.includes('💨') && line.includes('AIR')) {
      if (currentElement && scriptContent.length) {
        scripts[currentElement] = processScript(scriptContent.join('\n'));
      }
      currentElement = 'air';
      scriptContent = [];
    } else if (line.includes('✨') && line.includes('AETHER')) {
      if (currentElement && scriptContent.length) {
        scripts[currentElement] = processScript(scriptContent.join('\n'));
      }
      currentElement = 'aether';
      scriptContent = [];
    }

    if (currentElement) {
      scriptContent.push(line);
    }
  }

  // Process the last script
  if (currentElement && scriptContent.length) {
    scripts[currentElement] = processScript(scriptContent.join('\n'));
  }

  return scripts;
}

function processScript(content: string) {
  const lines = content.split('\n');
  const sections: any = {
    title: '',
    introduction: [],
    grounding: [],
    imagery: [],
    integration: [],
    closing: [],
    variations: []
  };

  let currentSection = '';

  for (const line of lines) {
    if (line.includes('Introduction') || line.includes('**Grounding**')) {
      currentSection = line.includes('Grounding') ? 'grounding' : 'introduction';
    } else if (line.includes('**Imagery**') || line.includes('**Meeting')) {
      currentSection = 'imagery';
    } else if (line.includes('**Integration**')) {
      currentSection = 'integration';
    } else if (line.includes('**Closing**')) {
      currentSection = 'closing';
    } else if (line.includes('**Variations**') || line.includes('**Cultural')) {
      currentSection = 'variations';
    } else if (line.includes('🌍') || line.includes('💧') || line.includes('🔥') || line.includes('💨') || line.includes('✨')) {
      sections.title = line.trim();
    } else if (currentSection && line.trim()) {
      sections[currentSection].push(line.trim());
    }
  }

  return sections;
}

function adaptScript(script: any, type: string, personalization?: string) {
  const adaptations: Record<string, any> = {
    full: script,
    abbreviated: {
      ...script,
      grounding: script.grounding.slice(0, 2),
      imagery: script.imagery.slice(0, Math.ceil(script.imagery.length / 2)),
      integration: script.integration.slice(0, 2)
    },
    intro: {
      title: script.title,
      introduction: script.introduction,
      grounding: script.grounding.slice(0, 1),
      imagery: script.imagery.slice(0, 2),
      integration: [],
      closing: ['Take a few deep breaths and slowly return to your day.']
    },
    integration: {
      title: `Integration: ${script.title}`,
      introduction: ['This is a follow-up integration session.'],
      grounding: script.grounding.slice(0, 1),
      imagery: script.integration,
      integration: script.integration,
      closing: script.closing
    }
  };

  const adapted = adaptations[type] || script;

  // Apply personalization if provided
  if (personalization) {
    // This would implement personalization logic
    // For now, just add a note
    adapted.personalization = personalization;
  }

  return adapted;
}

function createPersonalizedScript(baseScript: any, options: any) {
  let script = { ...baseScript };

  // Apply trauma-sensitive adaptations
  if (options.traumaSensitive) {
    script.grounding = [
      "Begin by placing your feet on the ground and feeling your body in the chair.",
      "Notice you have complete control over this experience.",
      "You can pause, adjust, or stop at any time.",
      "Take three easy breaths, allowing each exhale to release any tension.",
      ...script.grounding.slice(0, 2)
    ];

    script.safeguards = [
      "If any uncomfortable feelings arise, simply return to feeling your feet on the ground.",
      "Remember: you are safe in this present moment.",
      "This is imagination - you can change anything that doesn't feel right."
    ];
  }

  // Apply cultural adaptations
  if (options.culturalAdaptations) {
    script.culturalNotes = options.culturalAdaptations;
  }

  // Apply difficulty level
  if (options.difficultyLevel) {
    switch (options.difficultyLevel) {
      case 'beginner':
        script.imagery = script.imagery.slice(0, Math.ceil(script.imagery.length / 3));
        break;
      case 'intermediate':
        script.imagery = script.imagery.slice(0, Math.ceil(script.imagery.length * 2 / 3));
        break;
      case 'advanced':
        // Include additional advanced elements
        script.imagery.push(
          "Allow this archetypal parent energy to integrate into your cellular memory.",
          "Feel how this energy affects your nervous system and energy field."
        );
        break;
    }
  }

  return script;
}

function getDuration(type: string): string {
  const durations: Record<string, string> = {
    full: "15-20 minutes",
    abbreviated: "10-12 minutes",
    intro: "5-7 minutes",
    integration: "12-15 minutes"
  };
  return durations[type] || "15-20 minutes";
}

function getPhaseInstructions(element: string) {
  const phases: Record<string, any> = {
    earth: {
      focus: "Safety, grounding, protection",
      goal: "Install sense of safety and reliable structure",
      duration: "4-8 weeks minimum",
      progressSigns: "Increased calm, better boundaries, less anxiety"
    },
    water: {
      focus: "Emotional attunement, soothing, nurturing",
      goal: "Install capacity for self-comfort and emotional connection",
      duration: "4-8 weeks minimum",
      progressSigns: "Better emotional regulation, increased self-compassion"
    },
    fire: {
      focus: "Encouragement, confidence, creative expression",
      goal: "Install inner support for initiative and self-worth",
      duration: "4-8 weeks minimum",
      progressSigns: "More courage, better self-advocacy, increased creativity"
    },
    air: {
      focus: "Clarity, wisdom, communication",
      goal: "Install inner guidance and perspective",
      duration: "4-8 weeks minimum",
      progressSigns: "Clearer thinking, better decisions, improved communication"
    },
    aether: {
      focus: "Soul recognition, unconditional love, identity",
      goal: "Install sense of inherent worth and authentic self",
      duration: "4-8 weeks minimum",
      progressSigns: "Stronger identity, less people-pleasing, spiritual connection"
    }
  };
  return phases[element];
}

function getPreparationInstructions() {
  return [
    "Find a quiet, comfortable space where you won't be interrupted",
    "Sit in a supportive chair with feet on the ground",
    "Have tissues nearby if emotions arise",
    "Set intention to receive what you're ready for",
    "Remember you can pause or stop at any time"
  ];
}

function getIntegrationInstructions() {
  return [
    "Sit quietly for a few minutes after the imagery",
    "Journal about any insights, feelings, or images that came up",
    "Notice how your body feels different",
    "Carry a sense of your internal parent with you through the day",
    "Practice accessing this energy when you feel triggered"
  ];
}

function getPreSessionGuidance(traumaSensitive: boolean) {
  const basic = [
    "This is a safe, controlled experience in your imagination",
    "You maintain complete control throughout",
    "Feel free to adapt imagery to what feels right for you"
  ];

  if (traumaSensitive) {
    return [
      ...basic,
      "Start with shorter sessions (5-10 minutes) until comfortable",
      "Keep your eyes open if closing them feels unsafe",
      "Have a grounding object (stone, pillow) in your hands",
      "If overwhelmed, focus on your breath and body in the chair"
    ];
  }

  return basic;
}

function getSessionGuidance(element: string) {
  return [
    `Keep the focus on receiving ${element} parent energy`,
    "Don't worry about 'doing it right' - intention matters most",
    "If your mind wanders, gently return to the imagery",
    "Let whatever comes up be welcome",
    "Trust your inner wisdom to guide the experience"
  ];
}

function getPostSessionGuidance() {
  return [
    "Take time to integrate what you experienced",
    "Drink water and move gently back into your day",
    "Practice calling on this internal parent throughout the week",
    "Notice any shifts in how you relate to yourself and others",
    "Be patient with the process - healing happens gradually"
  ];
}

function getEmergencyGrounding() {
  return [
    "Place both feet firmly on the ground",
    "Name 5 things you can see, 4 you can hear, 3 you can touch",
    "Take slow, deep breaths counting 4 in, 6 out",
    "Remind yourself: 'I am safe in this moment'",
    "If distress continues, seek support from a trusted person"
  ];
}