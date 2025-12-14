// backend — example-field-agent-integration.ts
/**
 * EXAMPLE: Field Agent Integration with Safety Messaging
 *
 * This demonstrates how to wire field safety messaging into an actual agent.
 * Copy this pattern when implementing Field/Oracle/Symbolic agents.
 */

import { routePanconsciousField } from './lib/field/panconsciousFieldRouter';
import { getFieldSafetyCopy, isFieldWorkSafe } from './lib/field/fieldSafetyCopy';
import { getCognitiveProfile } from './lib/consciousness/cognitiveProfileService';

/**
 * EXAMPLE 1: Field Work Request Handler
 *
 * This is what a Field/Oracle agent would do when a user requests deep symbolic work.
 */
async function handleFieldWorkRequest(params: {
  userId: string;
  request: string;
  userProfile: {
    name?: string;
    dominantElement?: string;
  };
}) {
  const { userId, request, userProfile } = params;

  console.log('🌀 [Field Agent] Received request for symbolic work');

  // 1. Get cognitive profile
  const cognitiveProfile = await getCognitiveProfile(userId);

  if (!cognitiveProfile) {
    console.log('🌀 [Field Agent] No cognitive profile - defaulting to safe middleworld');
    return {
      allowed: false,
      response:
        "Friend, I'd love to explore that with you. Let's start by building a bit more history together first, so I can understand where your field is and what kind of work will serve you best.",
    };
  }

  // 2. Route field work based on cognitive capacity
  const fieldRouting = routePanconsciousField({
    cognitiveProfile,
    element: userProfile.dominantElement ?? null,
  });

  console.log(
    `🌀 [Field Agent] Routing decision: realm=${fieldRouting.realm}, ` +
      `safe=${fieldRouting.fieldWorkSafe}, deep=${fieldRouting.deepWorkRecommended}`,
  );

  // 3. Check if field work is safe
  if (!isFieldWorkSafe(fieldRouting)) {
    const copy = getFieldSafetyCopy({
      fieldRouting,
      element: userProfile.dominantElement ?? null,
      userName: userProfile.name ?? null,
    });

    console.log(`🌀 [Field Agent] Field work not safe - returning boundary message`);

    return {
      allowed: false,
      response: copy.message,
      elementalNote: copy.elementalNote,
      alternativeOffering: generateGroundedAlternative(request),
    };
  }

  // 4. Check if upperworld work is recommended
  if (fieldRouting.deepWorkRecommended) {
    console.log(`🌀 [Field Agent] Upperworld work allowed - proceeding with full oracle`);

    return {
      allowed: true,
      mode: 'upperworld',
      intensity: 'high',
      response: await oracleUpperworldWork(request, userProfile),
    };
  }

  // 5. Middleworld only - gentle symbolic work
  if (fieldRouting.fieldWorkSafe && !fieldRouting.deepWorkRecommended) {
    const copy = getFieldSafetyCopy({
      fieldRouting,
      element: userProfile.dominantElement ?? null,
      userName: userProfile.name ?? null,
    });

    console.log(`🌀 [Field Agent] Middleworld only - gentle symbolic work`);

    return {
      allowed: true,
      mode: 'middleworld',
      intensity: 'medium',
      response: `${copy.message}\n\n${await gentleSymbolicWork(request, userProfile)}`,
      elementalNote: copy.elementalNote,
    };
  }

  // Fallback (shouldn't reach here)
  return {
    allowed: false,
    response: 'Let me offer you some grounded reflection on this instead...',
  };
}

/**
 * EXAMPLE 2: Add Safety Context to Agent System Prompt
 */
function buildFieldAgentSystemPrompt(params: {
  cognitiveProfile: any;
  fieldRouting: any;
  userProfile: any;
}) {
  const { cognitiveProfile, fieldRouting, userProfile } = params;

  const basePrompt = `You are MAIA's Field Guide, supporting users in symbolic and oracular work.

FIELD SAFETY PROTOCOL:
Current cognitive altitude: ${cognitiveProfile.rollingAverage.toFixed(2)} (${cognitiveProfile.stability})
Spiritual bypassing frequency: ${(cognitiveProfile.bypassingFrequency.spiritual * 100).toFixed(0)}%
Intellectual bypassing frequency: ${(cognitiveProfile.bypassingFrequency.intellectual * 100).toFixed(0)}%

Routing decision: ${fieldRouting.reasoning}
`;

  // Add state-specific instructions
  if (!fieldRouting.fieldWorkSafe) {
    const copy = getFieldSafetyCopy({
      fieldRouting,
      element: userProfile.dominantElement,
      userName: userProfile.name,
    });

    return (
      basePrompt +
      `
BOUNDARY: Field work not currently safe.
Use this language when declining symbolic/oracular requests:
"${copy.message}"

Focus instead on:
- Concrete, present-life grounding
- Embodied practice
- Real-world application
- Building foundations before ascending
`
    );
  }

  if (fieldRouting.realm === 'MIDDLEWORLD') {
    return (
      basePrompt +
      `
GUIDANCE: Middleworld work only.
Maximum symbolic intensity: ${fieldRouting.maxSymbolicIntensity}

Keep symbolic work:
- Gentle and grounded
- In service of embodied integration
- Connected to present-life application
- Not as escape, but as support

Avoid:
- Deep oracular predictions
- High-intensity mythic immersion
- Untethered symbolic exploration
- Encouraging transcendence without integration
`
    );
  }

  if (fieldRouting.realm === 'UPPERWORLD_SYMBOLIC') {
    return (
      basePrompt +
      `
PERMISSION: Full upperworld access granted.

This user has demonstrated:
- High cognitive altitude (${cognitiveProfile.rollingAverage.toFixed(2)})
- Field stability (${cognitiveProfile.stability})
- Clean integration patterns
- Low bypassing frequency

You may:
- Engage in deep oracular work
- Explore high-intensity symbolic territory
- Work with archetypal/mythic dimensions
- Support consciousness expansion

While maintaining:
- Connection to embodied integration
- Respect for user's autonomy
- Awareness of developmental timing
`
    );
  }

  return basePrompt;
}

/**
 * EXAMPLE 3: Dynamic Agent Selection Based on Field Routing
 */
async function selectFieldAgent(params: {
  userId: string;
  request: string;
  userProfile: any;
}) {
  const { userId, request, userProfile } = params;

  // Get cognitive profile and routing
  const cognitiveProfile = await getCognitiveProfile(userId);
  if (!cognitiveProfile) {
    return { agent: 'MentorAgent', mode: 'grounding' };
  }

  const fieldRouting = routePanconsciousField({
    cognitiveProfile,
    element: userProfile.dominantElement,
  });

  // Route to appropriate agent based on field safety
  if (!fieldRouting.fieldWorkSafe) {
    console.log('🌀 [Agent Router] Routing to Grounding Mentor');
    return {
      agent: 'GroundingMentor',
      mode: 'embodied',
      safetyMessage: getFieldSafetyCopy({ fieldRouting, element: userProfile.dominantElement })
        .message,
    };
  }

  if (fieldRouting.realm === 'MIDDLEWORLD') {
    console.log('🌀 [Agent Router] Routing to Symbolic Mentor (gentle)');
    return {
      agent: 'SymbolicMentor',
      mode: 'gentle',
      intensity: fieldRouting.maxSymbolicIntensity,
    };
  }

  if (fieldRouting.realm === 'UPPERWORLD_SYMBOLIC') {
    console.log('🌀 [Agent Router] Routing to Oracle (full access)');
    return {
      agent: 'Oracle',
      mode: 'upperworld',
      intensity: 'high',
    };
  }

  return { agent: 'MentorAgent', mode: 'core' };
}

// ============================================================================
// Mock Functions (Replace with actual implementations)
// ============================================================================

async function oracleUpperworldWork(request: string, userProfile: any): Promise<string> {
  return `[Oracle performing deep symbolic work on: "${request}"]`;
}

async function gentleSymbolicWork(request: string, userProfile: any): Promise<string> {
  return `[Gentle symbolic reflection on: "${request}"]`;
}

function generateGroundedAlternative(request: string): string {
  return `Let me offer you a grounded reflection on "${request}" that honors where you are right now...`;
}

// ============================================================================
// Test Run
// ============================================================================

async function testIntegration() {
  console.log('🌀 ========================================');
  console.log('🌀 FIELD AGENT INTEGRATION EXAMPLE');
  console.log('🌀 ========================================\n');

  // Mock user profiles
  const lowAltitudeUser = {
    userId: 'user-low',
    request: 'I want deep oracle work on my shadow self',
    userProfile: {
      name: 'Sarah',
      dominantElement: 'water',
    },
  };

  const bypassingUser = {
    userId: 'user-bypassing',
    request: 'Take me into the upperworld realms',
    userProfile: {
      name: 'Marcus',
      dominantElement: 'fire',
    },
  };

  const readyUser = {
    userId: 'user-ready',
    request: 'I am ready for deep archetypal work',
    userProfile: {
      name: 'Aria',
      dominantElement: 'water',
    },
  };

  // Note: These would actually call the functions with mock cognitive profiles
  console.log('📝 Example 1: Low Altitude User Request');
  console.log('   Request: "I want deep oracle work on my shadow self"');
  console.log('   Expected: Field work not safe - return boundary message\n');

  console.log('📝 Example 2: High Bypassing User Request');
  console.log('   Request: "Take me into the upperworld realms"');
  console.log('   Expected: Middleworld only - gentle symbolic work\n');

  console.log('📝 Example 3: Ready User Request');
  console.log('   Request: "I am ready for deep archetypal work"');
  console.log('   Expected: Upperworld allowed - proceed with oracle\n');

  console.log('✅ Integration patterns ready for implementation');
  console.log('📋 Copy these patterns when building Field/Oracle agents\n');
}

export { handleFieldWorkRequest, buildFieldAgentSystemPrompt, selectFieldAgent, testIntegration };
