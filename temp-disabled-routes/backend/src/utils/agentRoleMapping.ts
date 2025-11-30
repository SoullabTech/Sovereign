// agentRoleMapping.ts - Maps agent types to voice routing roles

export enum AgentRole {
  ORACLE = "oracle",
  ELEMENTAL = "elemental",
  NARRATOR = "narrator",
}

export interface AgentMetadata {
  agentType: string;
  agentName?: string;
  context?: Record<string, any>;
}

/**
 * Determines the voice routing role based on agent metadata
 * @param metadata - Agent metadata containing type and context
 * @returns AgentRole for voice routing
 */
export function getAgentRole(metadata: AgentMetadata): AgentRole {
  const { agentType, context } = metadata;

  // Check for narrator-specific contexts
  if (
    context?.isNarration ||
    context?.type === "meditation" ||
    context?.type === "ceremony"
  ) {
    return AgentRole.NARRATOR;
  }

  // Map agent types to roles
  const agentTypeMap: Record<string, AgentRole> = {
    // Oracle agents
    MainOracleAgent: AgentRole.ORACLE,
    PersonalOracleAgent: AgentRole.ORACLE,
    EnhancedPersonalOracleAgent: AgentRole.ORACLE,
    PersonalizedOracleAgent: AgentRole.ORACLE,

    // Elemental agents
    FireAgent: AgentRole.ELEMENTAL,
    WaterAgent: AgentRole.ELEMENTAL,
    EarthAgent: AgentRole.ELEMENTAL,
    AirAgent: AgentRole.ELEMENTAL,
    AetherAgent: AgentRole.ELEMENTAL,
    ShadowAgent: AgentRole.ELEMENTAL,

    // Narrator agents (for static content)
    NarrationAgent: AgentRole.NARRATOR,
    MeditationGuide: AgentRole.NARRATOR,
    CeremonyFacilitator: AgentRole.NARRATOR,
    TeachingDeliverer: AgentRole.NARRATOR,
  };

  return agentTypeMap[agentType] || AgentRole.ORACLE;
}

/**
 * Helper to determine if content should use narrator voice
 * @param content - The text content being synthesized
 * @returns boolean indicating if narrator voice should be used
 */
export function isNarrationContent(content: string): boolean {
  const narrationKeywords = [
    "let us begin",
    "close your eyes",
    "take a deep breath",
    "imagine",
    "visualize",
    "sacred ceremony",
    "ancient wisdom teaches",
    "the teaching tells us",
  ];

  const lowerContent = content.toLowerCase();
  return narrationKeywords.some((keyword) => lowerContent.includes(keyword));
}
