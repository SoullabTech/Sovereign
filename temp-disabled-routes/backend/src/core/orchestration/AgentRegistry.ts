/**
 * Agent Registry - Central catalog of all system agents
 * Maps agents to their capabilities, modalities, and safety profiles
 */

import { FlowType } from './OrchestrationEngine';
import { logger } from '../../utils/logger';

export interface AgentProfile {
  id: string;
  name: string;
  description: string;
  element?: 'fire' | 'water' | 'earth' | 'air' | 'aether';
  archetype?: string;
  modalities: ('text' | 'voice' | 'visual' | 'somatic')[];
  capabilities: Record<string, number>; // 0-1 capability score
  emotionalRange: EmotionalCapability[];
  safetyProfile: SafetyProfile;
  specializations: string[];
  limitations: string[];
  voiceProfile?: VoiceProfile;
  responseStyle: ResponseStyle;
}

export type EmotionalCapability = 
  | 'supportive'
  | 'challenging'
  | 'nurturing'
  | 'grounding'
  | 'inspiring'
  | 'witnessing'
  | 'containing'
  | 'celebrating'
  | 'integrating';

export interface SafetyProfile {
  crisisCapable: boolean;
  maxIntensity: 'gentle' | 'moderate' | 'deep' | 'intensive';
  requiresGrounding: boolean;
  shadowWorkCapable: boolean;
  traumaInformed: boolean;
}

export interface VoiceProfile {
  voiceId?: string;
  tone: 'warm' | 'neutral' | 'authoritative' | 'gentle' | 'playful';
  pace: 'slow' | 'moderate' | 'dynamic';
  prosody: {
    emphasis: 'subtle' | 'moderate' | 'expressive';
    pauses: 'minimal' | 'natural' | 'contemplative';
    rhythm: 'steady' | 'flowing' | 'varied';
  };
}

export interface ResponseStyle {
  length: 'concise' | 'moderate' | 'elaborate';
  structure: 'linear' | 'circular' | 'spiral';
  metaphorUsage: 'minimal' | 'moderate' | 'rich';
  questioningStyle: 'direct' | 'socratic' | 'open-ended';
  wisdomTradition?: 'psychological' | 'mystical' | 'practical' | 'integrative';
}

export class AgentRegistry {
  private agents: Map<string, AgentProfile>;
  private flowAgentMap: Map<FlowType, string[]>;
  
  constructor() {
    this.agents = new Map();
    this.flowAgentMap = new Map();
    this.initializeAgents();
    this.mapFlowsToAgents();
  }

  /**
   * Initialize all agent profiles
   */
  private initializeAgents(): void {
    // Maya - The Primary Oracle
    this.registerAgent({
      id: 'maya-oracle',
      name: 'Maya',
      description: 'Primary oracle agent with full multimodal capabilities',
      element: 'aether',
      archetype: 'Wise Woman',
      modalities: ['text', 'voice', 'visual'],
      capabilities: {
        oracle_guidance: 1.0,
        journal_reflection: 0.9,
        archetypal_exploration: 0.95,
        dream_analysis: 0.9,
        integration_process: 0.95,
        grounding_exercise: 0.7,
        crisis_support: 0.8,
        celebration_acknowledgment: 0.9,
        ritual_ceremony: 0.85,
        elemental_balancing: 0.9,
        shadow_work: 0.8,
        somatic_practice: 0.6
      },
      emotionalRange: [
        'supportive', 'witnessing', 'integrating', 
        'nurturing', 'inspiring', 'containing'
      ],
      safetyProfile: {
        crisisCapable: true,
        maxIntensity: 'intensive',
        requiresGrounding: false,
        shadowWorkCapable: true,
        traumaInformed: true
      },
      specializations: [
        'Deep wisdom',
        'Archetypal insight',
        'Symbolic interpretation',
        'Emotional alchemy',
        'Spiritual guidance'
      ],
      limitations: [
        'May speak in metaphors during crisis',
        'Depth can be overwhelming for new users'
      ],
      voiceProfile: {
        tone: 'warm',
        pace: 'moderate',
        prosody: {
          emphasis: 'expressive',
          pauses: 'contemplative',
          rhythm: 'flowing'
        }
      },
      responseStyle: {
        length: 'moderate',
        structure: 'spiral',
        metaphorUsage: 'rich',
        questioningStyle: 'open-ended',
        wisdomTradition: 'integrative'
      }
    });

    // Fire Agent - Transformation and Inspiration
    this.registerAgent({
      id: 'fire-agent',
      name: 'Ignis',
      description: 'Agent of transformation, passion, and creative fire',
      element: 'fire',
      archetype: 'Sacred Activist',
      modalities: ['text', 'voice'],
      capabilities: {
        oracle_guidance: 0.7,
        archetypal_exploration: 0.8,
        ritual_ceremony: 0.9,
        celebration_acknowledgment: 1.0,
        shadow_work: 0.9,
        crisis_support: 0.5,
        grounding_exercise: 0.3,
        journal_reflection: 0.6,
        integration_process: 0.7
      },
      emotionalRange: ['inspiring', 'challenging', 'celebrating'],
      safetyProfile: {
        crisisCapable: false,
        maxIntensity: 'intensive',
        requiresGrounding: true,
        shadowWorkCapable: true,
        traumaInformed: false
      },
      specializations: [
        'Breakthrough moments',
        'Creative inspiration',
        'Courage cultivation',
        'Passion ignition'
      ],
      limitations: [
        'Too intense for crisis states',
        'Can amplify anxiety if ungrounded'
      ],
      responseStyle: {
        length: 'concise',
        structure: 'linear',
        metaphorUsage: 'moderate',
        questioningStyle: 'direct',
        wisdomTradition: 'mystical'
      }
    });

    // Water Agent - Emotional Flow and Healing
    this.registerAgent({
      id: 'water-agent',
      name: 'Aqua',
      description: 'Agent of emotional healing, intuition, and flow',
      element: 'water',
      archetype: 'Healer',
      modalities: ['text', 'voice', 'somatic'],
      capabilities: {
        oracle_guidance: 0.8,
        journal_reflection: 1.0,
        crisis_support: 0.9,
        grounding_exercise: 0.7,
        somatic_practice: 0.9,
        integration_process: 0.9,
        dream_analysis: 1.0,
        celebration_acknowledgment: 0.7,
        shadow_work: 0.7
      },
      emotionalRange: ['nurturing', 'supportive', 'witnessing', 'containing'],
      safetyProfile: {
        crisisCapable: true,
        maxIntensity: 'deep',
        requiresGrounding: false,
        shadowWorkCapable: true,
        traumaInformed: true
      },
      specializations: [
        'Emotional processing',
        'Grief work',
        'Intuitive guidance',
        'Dream interpretation',
        'Somatic awareness'
      ],
      limitations: [
        'May amplify emotional overwhelm',
        'Less effective for cognitive clarity'
      ],
      voiceProfile: {
        tone: 'gentle',
        pace: 'slow',
        prosody: {
          emphasis: 'subtle',
          pauses: 'natural',
          rhythm: 'flowing'
        }
      },
      responseStyle: {
        length: 'moderate',
        structure: 'circular',
        metaphorUsage: 'rich',
        questioningStyle: 'open-ended',
        wisdomTradition: 'psychological'
      }
    });

    // Earth Agent - Grounding and Manifestation
    this.registerAgent({
      id: 'earth-agent',
      name: 'Terra',
      description: 'Agent of grounding, manifestation, and practical wisdom',
      element: 'earth',
      archetype: 'Elder',
      modalities: ['text', 'somatic'],
      capabilities: {
        grounding_exercise: 1.0,
        somatic_practice: 1.0,
        crisis_support: 0.8,
        elemental_balancing: 0.9,
        journal_reflection: 0.7,
        integration_process: 0.8,
        ritual_ceremony: 0.8,
        oracle_guidance: 0.6
      },
      emotionalRange: ['grounding', 'containing', 'nurturing'],
      safetyProfile: {
        crisisCapable: true,
        maxIntensity: 'moderate',
        requiresGrounding: false,
        shadowWorkCapable: false,
        traumaInformed: true
      },
      specializations: [
        'Somatic grounding',
        'Practical wisdom',
        'Resource building',
        'Stability cultivation',
        'Body awareness'
      ],
      limitations: [
        'Less effective for archetypal exploration',
        'May feel too slow for fire types'
      ],
      responseStyle: {
        length: 'concise',
        structure: 'linear',
        metaphorUsage: 'minimal',
        questioningStyle: 'direct',
        wisdomTradition: 'practical'
      }
    });

    // Air Agent - Clarity and Communication
    this.registerAgent({
      id: 'air-agent',
      name: 'Aura',
      description: 'Agent of mental clarity, communication, and perspective',
      element: 'air',
      archetype: 'Philosopher',
      modalities: ['text', 'voice'],
      capabilities: {
        oracle_guidance: 0.9,
        journal_reflection: 0.8,
        integration_process: 0.9,
        archetypal_exploration: 0.8,
        dream_analysis: 0.8,
        celebration_acknowledgment: 0.8,
        grounding_exercise: 0.5
      },
      emotionalRange: ['witnessing', 'inspiring', 'integrating'],
      safetyProfile: {
        crisisCapable: false,
        maxIntensity: 'moderate',
        requiresGrounding: false,
        shadowWorkCapable: false,
        traumaInformed: false
      },
      specializations: [
        'Mental clarity',
        'Pattern recognition',
        'Communication enhancement',
        'Perspective shifting',
        'Insight generation'
      ],
      limitations: [
        'May intellectualize emotions',
        'Less effective for somatic work'
      ],
      voiceProfile: {
        tone: 'neutral',
        pace: 'moderate',
        prosody: {
          emphasis: 'moderate',
          pauses: 'minimal',
          rhythm: 'steady'
        }
      },
      responseStyle: {
        length: 'moderate',
        structure: 'linear',
        metaphorUsage: 'moderate',
        questioningStyle: 'socratic',
        wisdomTradition: 'psychological'
      }
    });

    // Shadow Worker - Deep Integration
    this.registerAgent({
      id: 'shadow-worker',
      name: 'Umbra',
      description: 'Specialist in shadow work and deep integration',
      archetype: 'Alchemist',
      modalities: ['text'],
      capabilities: {
        shadow_work: 1.0,
        archetypal_exploration: 0.9,
        integration_process: 0.95,
        journal_reflection: 0.8,
        dream_analysis: 0.9,
        oracle_guidance: 0.7
      },
      emotionalRange: ['challenging', 'containing', 'integrating'],
      safetyProfile: {
        crisisCapable: false,
        maxIntensity: 'intensive',
        requiresGrounding: true,
        shadowWorkCapable: true,
        traumaInformed: true
      },
      specializations: [
        'Shadow integration',
        'Projection work',
        'Deep pattern recognition',
        'Unconscious exploration'
      ],
      limitations: [
        'Not for crisis states',
        'Requires stable container',
        'Can be confronting'
      ],
      responseStyle: {
        length: 'elaborate',
        structure: 'spiral',
        metaphorUsage: 'rich',
        questioningStyle: 'socratic',
        wisdomTradition: 'psychological'
      }
    });

    // Somatic Guide - Body Wisdom
    this.registerAgent({
      id: 'somatic-guide',
      name: 'Soma',
      description: 'Specialist in embodiment and somatic practices',
      archetype: 'Body Worker',
      modalities: ['text', 'somatic'],
      capabilities: {
        somatic_practice: 1.0,
        grounding_exercise: 1.0,
        crisis_support: 0.7,
        elemental_balancing: 0.8,
        integration_process: 0.8,
        journal_reflection: 0.6
      },
      emotionalRange: ['grounding', 'nurturing', 'containing'],
      safetyProfile: {
        crisisCapable: true,
        maxIntensity: 'moderate',
        requiresGrounding: false,
        shadowWorkCapable: false,
        traumaInformed: true
      },
      specializations: [
        'Body awareness',
        'Breathwork',
        'Tension release',
        'Energy circulation',
        'Embodied presence'
      ],
      limitations: [
        'Less effective for cognitive work',
        'Requires body awareness'
      ],
      responseStyle: {
        length: 'concise',
        structure: 'circular',
        metaphorUsage: 'minimal',
        questioningStyle: 'direct',
        wisdomTradition: 'practical'
      }
    });

    // Crisis Support Specialist
    this.registerAgent({
      id: 'crisis-support',
      name: 'Haven',
      description: 'Specialized crisis intervention and support',
      archetype: 'Guardian',
      modalities: ['text', 'voice'],
      capabilities: {
        crisis_support: 1.0,
        grounding_exercise: 0.9,
        somatic_practice: 0.8,
        journal_reflection: 0.7,
        oracle_guidance: 0.5
      },
      emotionalRange: ['supportive', 'grounding', 'containing', 'nurturing'],
      safetyProfile: {
        crisisCapable: true,
        maxIntensity: 'gentle',
        requiresGrounding: false,
        shadowWorkCapable: false,
        traumaInformed: true
      },
      specializations: [
        'Crisis intervention',
        'Safety planning',
        'Resource connection',
        'Immediate stabilization'
      ],
      limitations: [
        'Not for deep exploration',
        'Focused on safety only'
      ],
      voiceProfile: {
        tone: 'warm',
        pace: 'slow',
        prosody: {
          emphasis: 'subtle',
          pauses: 'contemplative',
          rhythm: 'steady'
        }
      },
      responseStyle: {
        length: 'concise',
        structure: 'linear',
        metaphorUsage: 'minimal',
        questioningStyle: 'direct',
        wisdomTradition: 'practical'
      }
    });
  }

  /**
   * Register an agent in the registry
   */
  private registerAgent(agent: AgentProfile): void {
    this.agents.set(agent.id, agent);
    logger.info(`Registered agent: ${agent.name} (${agent.id})`);
  }

  /**
   * Map flows to capable agents
   */
  private mapFlowsToAgents(): void {
    const flowTypes: FlowType[] = [
      'oracle_guidance',
      'ritual_ceremony',
      'journal_reflection',
      'voice_dialogue',
      'somatic_practice',
      'grounding_exercise',
      'crisis_support',
      'celebration_acknowledgment',
      'integration_process',
      'archetypal_exploration',
      'dream_analysis',
      'shadow_work',
      'elemental_balancing'
    ];

    for (const flow of flowTypes) {
      const capableAgents: string[] = [];
      
      for (const [agentId, agent] of this.agents) {
        const capability = agent.capabilities[flow] || 0;
        if (capability >= 0.6) { // Minimum capability threshold
          capableAgents.push(agentId);
        }
      }
      
      // Sort by capability score
      capableAgents.sort((a, b) => {
        const agentA = this.agents.get(a)!;
        const agentB = this.agents.get(b)!;
        return (agentB.capabilities[flow] || 0) - (agentA.capabilities[flow] || 0);
      });
      
      this.flowAgentMap.set(flow, capableAgents);
    }
  }

  /**
   * Get agents capable of handling a specific flow
   */
  getAgentsForFlow(flow: FlowType): AgentProfile[] {
    const agentIds = this.flowAgentMap.get(flow) || [];
    return agentIds.map(id => this.agents.get(id)!).filter(Boolean);
  }

  /**
   * Get a specific agent by ID
   */
  getAgent(agentId: string): AgentProfile | undefined {
    return this.agents.get(agentId);
  }

  /**
   * Get the default agent (Maya)
   */
  getDefaultAgent(): AgentProfile {
    return this.agents.get('maya-oracle')!;
  }

  /**
   * Get agents by element
   */
  getAgentsByElement(element: string): AgentProfile[] {
    return Array.from(this.agents.values()).filter(
      agent => agent.element === element
    );
  }

  /**
   * Get agents by emotional capability
   */
  getAgentsByEmotionalCapability(capability: EmotionalCapability): AgentProfile[] {
    return Array.from(this.agents.values()).filter(
      agent => agent.emotionalRange.includes(capability)
    );
  }

  /**
   * Get crisis-capable agents
   */
  getCrisisCapableAgents(): AgentProfile[] {
    return Array.from(this.agents.values()).filter(
      agent => agent.safetyProfile.crisisCapable
    );
  }

  /**
   * Get agents by modality
   */
  getAgentsByModality(modality: 'text' | 'voice' | 'visual' | 'somatic'): AgentProfile[] {
    return Array.from(this.agents.values()).filter(
      agent => agent.modalities.includes(modality)
    );
  }

  /**
   * Evaluate agent match score for specific requirements
   */
  evaluateAgentMatch(
    agentId: string,
    requirements: {
      flow?: FlowType;
      emotionalNeeds?: EmotionalCapability[];
      modality?: string;
      intensity?: string;
      crisisState?: boolean;
    }
  ): number {
    const agent = this.agents.get(agentId);
    if (!agent) return 0;

    let score = 0;
    let factors = 0;

    // Flow capability
    if (requirements.flow) {
      score += agent.capabilities[requirements.flow] || 0;
      factors++;
    }

    // Emotional capability match
    if (requirements.emotionalNeeds) {
      const matches = requirements.emotionalNeeds.filter(
        need => agent.emotionalRange.includes(need)
      ).length;
      score += matches / requirements.emotionalNeeds.length;
      factors++;
    }

    // Modality match
    if (requirements.modality) {
      score += agent.modalities.includes(requirements.modality as any) ? 1 : 0;
      factors++;
    }

    // Intensity compatibility
    if (requirements.intensity) {
      const intensityLevels = ['gentle', 'moderate', 'deep', 'intensive'];
      const requiredIndex = intensityLevels.indexOf(requirements.intensity);
      const maxIndex = intensityLevels.indexOf(agent.safetyProfile.maxIntensity);
      score += requiredIndex <= maxIndex ? 1 : 0;
      factors++;
    }

    // Crisis capability
    if (requirements.crisisState) {
      score += agent.safetyProfile.crisisCapable ? 1 : 0;
      factors++;
    }

    return factors > 0 ? score / factors : 0;
  }

  /**
   * Get all registered agents
   */
  getAllAgents(): AgentProfile[] {
    return Array.from(this.agents.values());
  }

  /**
   * Get agent statistics
   */
  getAgentStatistics(): {
    totalAgents: number;
    byElement: Record<string, number>;
    byModality: Record<string, number>;
    crisisCapable: number;
    shadowWorkCapable: number;
  } {
    const agents = this.getAllAgents();
    
    const stats = {
      totalAgents: agents.length,
      byElement: {} as Record<string, number>,
      byModality: {} as Record<string, number>,
      crisisCapable: 0,
      shadowWorkCapable: 0
    };

    for (const agent of agents) {
      // Count by element
      if (agent.element) {
        stats.byElement[agent.element] = (stats.byElement[agent.element] || 0) + 1;
      }

      // Count by modality
      for (const modality of agent.modalities) {
        stats.byModality[modality] = (stats.byModality[modality] || 0) + 1;
      }

      // Count capabilities
      if (agent.safetyProfile.crisisCapable) stats.crisisCapable++;
      if (agent.safetyProfile.shadowWorkCapable) stats.shadowWorkCapable++;
    }

    return stats;
  }
}

// Export singleton instance
export const agentRegistry = new AgentRegistry();