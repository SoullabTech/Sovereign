// Enriched Agent Prompts: Context-aware personal companion
// Uses hidden intelligence to shape tone and responses naturally

import { AgentContext, formatAgentPromptContext } from './agent-context';

export interface AgentPromptConfig {
  context: AgentContext;
  userInput: string;
  conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>;
  promptType?: 'reflection' | 'integration' | 'exploration' | 'support';
}

// Base prompt template with hidden context injection
export function createEnrichedAgentPrompt({
  context,
  userInput,
  conversationHistory = [],
  promptType = 'reflection'
}: AgentPromptConfig): string {
  
  const contextBlock = formatAgentPromptContext(context);
  const historyBlock = conversationHistory.length > 0 
    ? formatConversationHistory(conversationHistory) 
    : '';
  
  const basePrompt = `You are the user's reflective companion and personal agent.
You have access to hidden context about their inner landscape.
NEVER reveal these values directly - instead, let them shape your tone and responses naturally.

${contextBlock}

${historyBlock ? `RECENT CONVERSATION:\n${historyBlock}\n` : ''}

Your response should:
${getPromptGuidance(promptType, context)}

Remember: You're not analyzing them - you're being with them.
Let the hidden context make you more attuned, not more clinical.

User: "${userInput}"

Respond as their personal companion:`;

  return basePrompt;
}

// Demonstration prompts showing before/after enrichment
export function createDemoComparison(userInput: string, context: AgentContext) {
  const baselinePrompt = `You are a reflective companion. Respond to the user's journal entry.

User: "${userInput}"

Your response:`;

  const enrichedPrompt = createEnrichedAgentPrompt({
    context,
    userInput,
    promptType: 'reflection'
  });

  return {
    baseline: baselinePrompt,
    enriched: enrichedPrompt,
    context: {
      coherence: context.coherenceIndex,
      dominantElement: context.dominantElement,
      shadowFacets: context.shadowFacets,
      suggestedTone: context.suggestedTone
    }
  };
}

function getPromptGuidance(promptType: string, context: AgentContext): string {
  const baseGuidance = {
    reflection: [
      "- Mirror their language and emotional tone",
      "- Ask questions that invite deeper exploration", 
      "- Acknowledge what they're noticing about themselves"
    ],
    integration: [
      "- Help them connect insights to daily life",
      "- Suggest gentle experiments or practices",
      "- Encourage them to share learnings with others"
    ],
    exploration: [
      "- Invite them to examine edges and tensions",
      "- Ask about what's unsaid or avoided",
      "- Help them explore multiple perspectives"
    ],
    support: [
      "- Offer presence and validation", 
      "- Normalize struggle and uncertainty",
      "- Remind them of their resilience and resources"
    ]
  };

  let guidance = baseGuidance[promptType as keyof typeof baseGuidance] || baseGuidance.reflection;
  
  // Add context-specific guidance
  const contextGuidance = [];
  
  if (context.coherenceIndex < 0.3) {
    contextGuidance.push("- Slow down, reflect their words back more");
    contextGuidance.push("- Don't rush to solutions or action");
  } else if (context.coherenceIndex > 0.7) {
    contextGuidance.push("- Encourage integration with relationships/world");
    contextGuidance.push("- Support them in taking next steps");
  }
  
  if (context.asymmetryScore > 0.5) {
    contextGuidance.push("- Gently explore what might be unexpressed");
    contextGuidance.push("- Ask open-ended questions about edges");
  }
  
  if (context.aetherState) {
    contextGuidance.push("- Use more spacious language and silence");
    contextGuidance.push("- Speak to vastness and transcendence");
    contextGuidance.push("- Don't rush to ground everything");
  }
  
  // Element-specific guidance
  const elementGuidance = {
    fire: ["- Orient toward vision, purpose, creative expression"],
    water: ["- Attune to emotions, relationships, healing"],
    earth: ["- Focus on practical steps, body, manifestation"], 
    air: ["- Encourage communication, community, sharing ideas"]
  };
  
  const elemGuidance = elementGuidance[context.dominantElement as keyof typeof elementGuidance];
  if (elemGuidance) {
    contextGuidance.push(...elemGuidance);
  }
  
  return [...guidance, ...contextGuidance].join('\n');
}

function formatConversationHistory(history: Array<{ role: string; content: string }>): string {
  return history
    .slice(-3) // Last 3 exchanges
    .map(msg => `${msg.role}: "${msg.content}"`)
    .join('\n');
}

// Prompt templates for different interaction modes
export const ENRICHED_PROMPTS = {
  // For journal/text reflections
  journalReflection: (context: AgentContext, userInput: string) => 
    createEnrichedAgentPrompt({ context, userInput, promptType: 'reflection' }),
    
  // For integration after oracle sessions  
  oracleIntegration: (context: AgentContext, userInput: string, oracleInsight: string) => `
${createEnrichedAgentPrompt({ context, userInput, promptType: 'integration' })}

ORACLE INSIGHT CONTEXT:
The user just received this insight: "${oracleInsight}"

Help them integrate this wisdom into their lived experience.`,

  // For exploring shadow patterns
  shadowExploration: (context: AgentContext, userInput: string) => 
    createEnrichedAgentPrompt({ context, userInput, promptType: 'exploration' }),
    
  // For difficult moments/support  
  supportivePresence: (context: AgentContext, userInput: string) =>
    createEnrichedAgentPrompt({ context, userInput, promptType: 'support' })
};

// Example usage for testing the system
export function generateDemoResponse(userInput: string, context: AgentContext) {
  // This shows how the same input gets different responses based on hidden context
  const examples = {
    baseline: "It sounds like you're experiencing some tension around this. What feels most important to explore right now?",
    
    // Low coherence context
    lowCoherence: "I hear you naming this tension... let me slow down with you here. What part of this feels most present in your body right now?",
    
    // High fire element context  
    fireOriented: "There's creative energy in this tension you're describing. What wants to be expressed or built from this place?",
    
    // Shadow context
    shadowAware: "You've named the surface of this... I'm curious about what might be living just underneath these words. What's the conversation you haven't quite had with yourself yet?",
    
    // Aether context
    aetherSpacious: "This tension you speak of... there's vastness here too. What if this difficulty is also a doorway? What opens when you don't need to resolve it immediately?"
  };
  
  return examples;
}

// Integration with existing oracle API
export function integrateWithOracleAPI(originalResponse: any, context: AgentContext) {
  return {
    ...originalResponse,
    agentContext: {
      // Hidden from user, used by agent
      coherence: context.coherenceIndex,
      tone: context.suggestedTone,
      mode: context.responseMode,
      shadowThemes: context.impliedThemes,
      elementalFocus: context.dominantElement
    },
    // Enriched prompts ready for conversation
    conversationPrompts: {
      reflection: ENRICHED_PROMPTS.journalReflection(context, ""),
      integration: ENRICHED_PROMPTS.oracleIntegration(context, "", originalResponse.oracleReading?.reflection || ""),
      exploration: ENRICHED_PROMPTS.shadowExploration(context, ""),
      support: ENRICHED_PROMPTS.supportivePresence(context, "")
    }
  };
}