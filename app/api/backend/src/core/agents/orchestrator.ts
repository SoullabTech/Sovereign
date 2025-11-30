import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { LLMChain } from "langchain/chains";
import axios from "axios";
import { logger } from '../../utils/logger';
import { safetyService } from '../../services/SafetyModerationService';

/**
 * Workflow step definition for orchestrated journeys
 */
export interface WorkflowStep {
  id: string;
  name: string;
  type: 'agent_call' | 'memory_store' | 'reflection' | 'ritual' | 'pause';
  agentElement?: 'air' | 'fire' | 'water' | 'earth' | 'aether';
  config: Record<string, any>;
  nextSteps?: string[];
  conditions?: Record<string, any>;
}

/**
 * Sacred journey workflow templates
 */
export interface JourneyTemplate {
  id: string;
  name: string;
  description: string;
  steps: WorkflowStep[];
  estimatedDuration: string;
  triggers: string[];
}

/**
 * Orchestrator for managing multi-step spiritual workflows
 */
export class SacredOrchestrator {
  private workflows: Map<string, JourneyTemplate> = new Map();
  private activeJourneys: Map<string, any> = new Map();

  constructor() {
    this.initializeWorkflowTemplates();
  }

  /**
   * Initialize pre-built workflow templates
   */
  private initializeWorkflowTemplates() {
    // Morning Reflection Journey
    this.workflows.set('morning_reflection', {
      id: 'morning_reflection',
      name: 'Sacred Morning Reflection',
      description: 'Gentle awakening into intentional presence',
      estimatedDuration: '10-15 minutes',
      triggers: ['morning', 'intention_setting', 'new_day'],
      steps: [
        {
          id: 'air_greeting',
          name: 'Conscious Awakening',
          type: 'agent_call',
          agentElement: 'air',
          config: {
            prompt: 'Guide a gentle morning awakening with breath awareness',
            voice_optimized: true
          },
          nextSteps: ['pause_breathe']
        },
        {
          id: 'pause_breathe',
          name: 'Conscious Breathing',
          type: 'pause',
          config: {
            duration: 30,
            instruction: 'Take three conscious breaths'
          },
          nextSteps: ['water_emotions']
        },
        {
          id: 'water_emotions',
          name: 'Emotional Check-in',
          type: 'agent_call',
          agentElement: 'water',
          config: {
            prompt: 'Invite gentle exploration of current emotional landscape'
          },
          nextSteps: ['fire_intentions']
        },
        {
          id: 'fire_intentions',
          name: 'Daily Intention Setting',
          type: 'agent_call',
          agentElement: 'fire',
          config: {
            prompt: 'Support creation of clear daily intentions'
          },
          nextSteps: ['earth_grounding']
        },
        {
          id: 'earth_grounding',
          name: 'Embodied Grounding',
          type: 'agent_call',
          agentElement: 'earth',
          config: {
            prompt: 'Offer grounding practice for embodied presence'
          },
          nextSteps: ['memory_capture']
        },
        {
          id: 'memory_capture',
          name: 'Journey Documentation',
          type: 'memory_store',
          config: {
            type: 'ritual_completion',
            metadata: { workflow: 'morning_reflection' }
          }
        }
      ]
    });

    // Crisis Support Journey
    this.workflows.set('crisis_support', {
      id: 'crisis_support',
      name: 'Immediate Crisis Support',
      description: 'Compassionate crisis intervention with resource connection',
      estimatedDuration: '5-10 minutes',
      triggers: ['crisis', 'distress', 'emergency'],
      steps: [
        {
          id: 'immediate_safety',
          name: 'Safety Assessment & Resources',
          type: 'agent_call',
          agentElement: 'air',
          config: {
            prompt: 'Provide immediate crisis support with clear resources',
            safety_priority: true,
            include_resources: true
          },
          nextSteps: ['grounding_support']
        },
        {
          id: 'grounding_support',
          name: 'Stabilizing Presence',
          type: 'agent_call',
          agentElement: 'earth',
          config: {
            prompt: 'Offer gentle grounding techniques for immediate stabilization'
          },
          nextSteps: ['water_validation']
        },
        {
          id: 'water_validation',
          name: 'Emotional Validation',
          type: 'agent_call',
          agentElement: 'water',
          config: {
            prompt: 'Provide compassionate emotional validation and witnessing'
          },
          nextSteps: ['resource_connection']
        },
        {
          id: 'resource_connection',
          name: 'Professional Resource Connection',
          type: 'agent_call',
          agentElement: 'air',
          config: {
            prompt: 'Connect to appropriate professional support resources',
            force_human_resources: true
          },
          nextSteps: ['safety_followup']
        },
        {
          id: 'safety_followup',
          name: 'Safety Plan Creation',
          type: 'memory_store',
          config: {
            type: 'safety_plan',
            metadata: { workflow: 'crisis_support', priority: 'critical' }
          }
        }
      ]
    });

    // Shadow Work Integration
    this.workflows.set('shadow_integration', {
      id: 'shadow_integration',
      name: 'Shadow Integration Journey',
      description: 'Compassionate exploration and integration of shadow aspects',
      estimatedDuration: '20-30 minutes',
      triggers: ['shadow', 'integration', 'darkness', 'rejected_parts'],
      steps: [
        {
          id: 'earth_preparation',
          name: 'Grounded Preparation',
          type: 'agent_call',
          agentElement: 'earth',
          config: {
            prompt: 'Create safe, grounded container for shadow work'
          },
          nextSteps: ['water_invitation']
        },
        {
          id: 'water_invitation',
          name: 'Emotional Invitation',
          type: 'agent_call',
          agentElement: 'water',
          config: {
            prompt: 'Gently invite exploration of rejected emotions/aspects'
          },
          nextSteps: ['reflection_pause']
        },
        {
          id: 'reflection_pause',
          name: 'Inner Reflection',
          type: 'pause',
          config: {
            duration: 120,
            instruction: 'Allow whatever arises to be witnessed with compassion'
          },
          nextSteps: ['fire_transformation']
        },
        {
          id: 'fire_transformation',
          name: 'Alchemical Transformation',
          type: 'agent_call',
          agentElement: 'fire',
          config: {
            prompt: 'Support alchemical integration of shadow material'
          },
          nextSteps: ['air_understanding']
        },
        {
          id: 'air_understanding',
          name: 'Cognitive Integration',
          type: 'agent_call',
          agentElement: 'air',
          config: {
            prompt: 'Facilitate understanding and meaning-making from shadow work'
          },
          nextSteps: ['aether_synthesis']
        },
        {
          id: 'aether_synthesis',
          name: 'Spiritual Synthesis',
          type: 'agent_call',
          agentElement: 'aether',
          config: {
            prompt: 'Support spiritual synthesis and wisdom integration'
          },
          nextSteps: ['integration_memory']
        },
        {
          id: 'integration_memory',
          name: 'Integration Documentation',
          type: 'memory_store',
          config: {
            type: 'shadow_integration',
            metadata: { workflow: 'shadow_integration', archetypal_pattern: 'shadow' }
          }
        }
      ]
    });
  }

  /**
   * Start a sacred journey workflow
   */
  async startJourney(workflowId: string, userId: string, context: any = {}): Promise<{
    journeyId: string;
    workflow: JourneyTemplate;
    nextStep: WorkflowStep;
  }> {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      throw new Error(`Workflow '${workflowId}' not found`);
    }

    const journeyId = `${userId}_${workflowId}_${Date.now()}`;
    const journeyState = {
      id: journeyId,
      userId,
      workflowId,
      context,
      currentStepIndex: 0,
      startedAt: new Date(),
      status: 'active',
      stepHistory: []
    };

    this.activeJourneys.set(journeyId, journeyState);

    logger.info(`Started journey ${journeyId} for user ${userId}`);

    return {
      journeyId,
      workflow,
      nextStep: workflow.steps[0]
    };
  }

  /**
   * Execute the next step in an active journey
   */
  async executeNextStep(journeyId: string, userInput?: string): Promise<{
    stepResult: any;
    nextStep?: WorkflowStep;
    journeyComplete: boolean;
  }> {
    const journey = this.activeJourneys.get(journeyId);
    if (!journey) {
      throw new Error(`Journey '${journeyId}' not found`);
    }

    const workflow = this.workflows.get(journey.workflowId);
    if (!workflow) {
      throw new Error(`Workflow '${journey.workflowId}' not found`);
    }

    const currentStep = workflow.steps[journey.currentStepIndex];
    if (!currentStep) {
      return {
        stepResult: { message: 'Journey completed' },
        journeyComplete: true
      };
    }

    // Execute current step
    const stepResult = await this.executeWorkflowStep(currentStep, journey, userInput);

    // Update journey state
    journey.stepHistory.push({
      step: currentStep,
      result: stepResult,
      executedAt: new Date(),
      userInput
    });
    journey.currentStepIndex++;

    // Check if journey is complete
    const journeyComplete = journey.currentStepIndex >= workflow.steps.length;
    if (journeyComplete) {
      journey.status = 'completed';
      journey.completedAt = new Date();
    }

    const nextStep = journeyComplete ? undefined : workflow.steps[journey.currentStepIndex];

    logger.info(`Executed step ${currentStep.id} for journey ${journeyId}`);

    return {
      stepResult,
      nextStep,
      journeyComplete
    };
  }

  /**
   * Execute a single workflow step
   */
  private async executeWorkflowStep(
    step: WorkflowStep,
    journey: any,
    userInput?: string
  ): Promise<any> {
    switch (step.type) {
      case 'agent_call':
        return await this.executeAgentStep(step, journey, userInput);
      
      case 'pause':
        return {
          type: 'pause',
          duration: step.config.duration || 30,
          instruction: step.config.instruction || 'Take a moment to pause and breathe',
          stepId: step.id
        };
      
      case 'memory_store':
        return await this.executeMemoryStep(step, journey);
      
      case 'reflection':
        return {
          type: 'reflection_prompt',
          prompt: step.config.prompt || 'What are you noticing right now?',
          stepId: step.id
        };
      
      default:
        return {
          type: 'unknown_step',
          message: `Step type '${step.type}' not implemented`,
          stepId: step.id
        };
    }
  }

  /**
   * Execute agent-based workflow step
   */
  private async executeAgentStep(
    step: WorkflowStep,
    journey: any,
    userInput?: string
  ): Promise<any> {
    try {
      // Safety check first
      if (userInput) {
        const safety = await safetyService.moderateInput(userInput, journey.userId);
        if (!safety.safe) {
          return {
            type: 'safety_intervention',
            message: safety.response,
            resources: safety.supportResources,
            stepId: step.id
          };
        }
      }

      // Construct agent prompt with workflow context
      const contextPrompt = `${step.config.prompt}

Workflow Context:
- Journey: ${journey.workflowId}
- Step: ${step.name}
- User Input: ${userInput || 'No specific input'}
- Previous Steps: ${journey.stepHistory.length} completed`;

      // Use LangChain for response generation
      const response = await runLangChain(contextPrompt);

      return {
        type: 'agent_response',
        element: step.agentElement,
        message: response,
        stepId: step.id,
        voiceOptimized: step.config.voice_optimized || false
      };

    } catch (error) {
      logger.error(`Agent step execution failed for ${step.id}:`, error);
      return {
        type: 'agent_error',
        message: '🤗 I encountered a moment of silence. How are you feeling right now?',
        stepId: step.id
      };
    }
  }

  /**
   * Execute memory storage step
   */
  private async executeMemoryStep(step: WorkflowStep, journey: any): Promise<any> {
    try {
      // Store workflow completion or milestone
      const memoryEntry = {
        userId: journey.userId,
        type: step.config.type || 'workflow_milestone',
        content: `Completed workflow step: ${step.name}`,
        metadata: {
          ...step.config.metadata,
          workflowId: journey.workflowId,
          journeyId: journey.id,
          stepId: step.id,
          timestamp: new Date().toISOString()
        }
      };

      // In a full implementation, this would call the Soul Memory Service
      logger.info(`Storing memory for journey ${journey.id}: ${step.name}`);

      return {
        type: 'memory_stored',
        message: 'Sacred moment captured in your journey',
        stepId: step.id
      };

    } catch (error) {
      logger.error(`Memory step execution failed for ${step.id}:`, error);
      return {
        type: 'memory_error',
        message: 'The memory keeper was quiet this time, but your journey continues',
        stepId: step.id
      };
    }
  }

  /**
   * Get available workflow templates
   */
  getAvailableWorkflows(): JourneyTemplate[] {
    return Array.from(this.workflows.values());
  }

  /**
   * Get workflow by triggers/keywords
   */
  getWorkflowByTrigger(trigger: string): JourneyTemplate | undefined {
    for (const workflow of this.workflows.values()) {
      if (workflow.triggers.some(t => 
        trigger.toLowerCase().includes(t.toLowerCase())
      )) {
        return workflow;
      }
    }
    return undefined;
  }

  /**
   * Get active journey status
   */
  getJourneyStatus(journeyId: string): any {
    return this.activeJourneys.get(journeyId);
  }

  /**
   * Pause or resume a journey
   */
  pauseJourney(journeyId: string): boolean {
    const journey = this.activeJourneys.get(journeyId);
    if (journey) {
      journey.status = journey.status === 'paused' ? 'active' : 'paused';
      return true;
    }
    return false;
  }

  /**
   * Cancel an active journey
   */
  cancelJourney(journeyId: string): boolean {
    const journey = this.activeJourneys.get(journeyId);
    if (journey) {
      journey.status = 'cancelled';
      journey.cancelledAt = new Date();
      return true;
    }
    return false;
  }
}

// Export singleton orchestrator
export const sacredOrchestrator = new SacredOrchestrator();

/**
 * Generates a poetic and thoughtful response using LangChain + OpenAI.
 */
export async function runLangChain(query: string): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY environment variable is not set");
  }

  const model = new ChatOpenAI({
    openAIApiKey: apiKey,
    temperature: 0.7,
    modelName: "gpt-3.5-turbo",
  });

  const prompt = PromptTemplate.fromTemplate(
    "You are a wise oracle. Provide a poetic and thoughtful response to: {query}",
  );

  const chain = new LLMChain({
    llm: model,
    prompt,
  });

  try {
    const result = await chain.invoke({ query });
    return result.text?.trim() || "🌀 The oracle was silent this time.";
  } catch (error) {
    console.error("❌ Error in runLangChain:", error);
    throw new Error("Failed to generate response from LangChain");
  }
}

/**
 * Triggers an external Prefect flow with the provided payload.
 */
export async function triggerPrefectFlow(
  payload: Record<string, any>,
): Promise<any> {
  const prefectApiUrl =
    process.env.PREFECT_API_URL ||
    "https://your-prefect-server/api/flows/trigger";

  try {
    const response = await axios.post(prefectApiUrl, payload);
    return response.data;
  } catch (error: any) {
    console.error(
      "❌ Error triggering Prefect flow:",
      error?.response?.data || error.message,
    );
    throw new Error("Failed to trigger Prefect flow");
  }
}
