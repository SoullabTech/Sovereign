// @ts-nocheck - Prototype file, not type-checked
/**
 * MAIA Intervention Flows
 * Concrete implementation of many-armed framework deployments
 * Starting with IPP Parenting Repair Moment as specified
 */

import { v4 as uuidv4 } from 'uuid';
import {
  Element,
  Phase,
  SpiralogicCell,
  FieldEvent,
  createSpiralogicCell,
  createFieldEvent
} from './spiralogic-core';

// ===== INTERVENTION FLOW TYPES =====

export interface InterventionStep {
  stepId: string;
  stepNumber: number;
  title: string;
  maiaPhrasing: MAIAPrompt;
  uiConfiguration: StepUIConfig;
  spiralogicMapping: {
    element: Element;
    phase: Phase;
    psychologicalProcess: string;
  };
  dataCapture: DataField[];
  transitions: StepTransition[];
}

export interface MAIAPrompt {
  systemContext: string;
  mainPrompt: string;
  tone: 'gentle_authority' | 'warm_curiosity' | 'grounding_presence';
  boundaries: string[];
  personalization: {
    traumaSensitive: boolean;
    culturallyAdaptive: boolean;
    autonomyRespecting: boolean;
  };
}

export interface StepUIConfig {
  layout: 'single_focus' | 'guided_reflection' | 'choice_presentation';
  fields: UIField[];
  quickActions?: QuickActionButton[];
  visualElements?: VisualGuidance[];
}

export interface UIField {
  fieldId: string;
  label: string;
  type: 'multi_line_text' | 'short_text' | 'quick_tags' | 'scale' | 'choice';
  placeholder?: string;
  validation: {
    required: boolean;
    minLength?: number;
    emotionalSafetyCheck?: boolean;
  };
  quickTagOptions?: string[];
}

export interface QuickActionButton {
  label: string;
  value: string;
  style: 'primary' | 'secondary' | 'gentle';
  triggers?: string; // which field it auto-fills
}

export interface VisualGuidance {
  type: 'breathing_space' | 'centering_reminder' | 'progress_indicator';
  duration?: number;
  message?: string;
}

export interface StepTransition {
  condition: 'always' | 'if_complete' | 'if_skip_requested';
  nextStepId: string;
  dataProcessing?: string[];
}

export interface InterventionFlow {
  flowId: string;
  name: string;
  description: string;
  framework: string; // 'IPP', 'CBT', etc.
  spiralogicJourney: SpiralogicTransition[];
  estimatedDuration: number; // minutes
  steps: InterventionStep[];
  dataSchema: InterventionDataSchema;
  completionActions: CompletionAction[];
}

export interface SpiralogicTransition {
  from: { element: Element; phase: Phase };
  to: { element: Element; phase: Phase };
  description: string;
  psychologicalShift: string;
}

export interface InterventionDataSchema {
  schemaId: string;
  requiredFields: string[];
  outputFormat: 'structured_json' | 'narrative_summary';
  storageLocation: 'field_events' | 'user_profile' | 'both';
}

export interface CompletionAction {
  actionType: 'save_to_field' | 'schedule_reminder' | 'suggest_follow_up';
  configuration: Record<string, any>;
  userChoice: boolean; // whether user gets to choose
}

// ===== IPP PARENTING REPAIR MOMENT FLOW =====

export const IPP_PARENTING_REPAIR_FLOW: InterventionFlow = {
  flowId: 'ipp_parenting_repair_v1',
  name: 'Parenting Repair Moment',
  description: 'IPP-informed reflection for when a parent feels they "messed up"',
  framework: 'IPP',
  spiralogicJourney: [
    {
      from: { element: 'Water', phase: 2 },
      to: { element: 'Water', phase: 3 },
      description: 'Inner descent, then repair',
      psychologicalShift: 'From shame/rupture to self-compassion'
    },
    {
      from: { element: 'Water', phase: 3 },
      to: { element: 'Earth', phase: 1 },
      description: 'From repair to structure',
      psychologicalShift: 'From understanding to concrete action'
    },
    {
      from: { element: 'Earth', phase: 1 },
      to: { element: 'Earth', phase: 2 },
      description: 'From pattern to practice',
      psychologicalShift: 'From intention to sustainable integration'
    }
  ],
  estimatedDuration: 8,
  steps: [
    {
      stepId: 'step_0_opening',
      stepNumber: 0,
      title: 'MAIA opens the panel',
      maiaPhrasing: {
        systemContext: 'User is experiencing parenting shame/guilt. Approach with gentle authority and normalize the repair process.',
        mainPrompt: 'Let\'s treat this as a repair moment, not a verdict on you as a parent. I\'ll ask a few gentle questions to help you move from shame toward connection and repair.',
        tone: 'gentle_authority',
        boundaries: [
          'No judgment about parenting choices',
          'Focus on repair, not perfectionism',
          'Honor the parent\'s autonomy'
        ],
        personalization: {
          traumaSensitive: true,
          culturallyAdaptive: true,
          autonomyRespecting: true
        }
      },
      uiConfiguration: {
        layout: 'single_focus',
        fields: [],
        quickActions: [
          { label: 'Begin', value: 'begin', style: 'primary' }
        ],
        visualElements: [
          { type: 'centering_reminder', message: 'Take a breath. You\'re not alone in this.' }
        ]
      },
      spiralogicMapping: {
        element: 'Water',
        phase: 2,
        psychologicalProcess: 'Entry into repair space'
      },
      dataCapture: [],
      transitions: [
        { condition: 'always', nextStepId: 'step_1_name_moment' }
      ]
    },

    {
      stepId: 'step_1_name_moment',
      stepNumber: 1,
      title: 'Name the moment (Water 2: clarify rupture)',
      maiaPhrasing: {
        systemContext: 'Help parent name what happened without shame spiral. Keep it factual and compassionate.',
        mainPrompt: 'First, let\'s name what happened in simple, honest language. What was the moment that is hurting you the most right now?',
        tone: 'warm_curiosity',
        boundaries: [
          'No need for detailed trauma narratives',
          'Stay present-focused',
          'Normalize parenting struggles'
        ],
        personalization: {
          traumaSensitive: true,
          culturallyAdaptive: true,
          autonomyRespecting: true
        }
      },
      uiConfiguration: {
        layout: 'guided_reflection',
        fields: [
          {
            fieldId: 'what_happened',
            label: 'What happened?',
            type: 'multi_line_text',
            placeholder: 'Describe the moment that feels difficult...',
            validation: {
              required: true,
              minLength: 10,
              emotionalSafetyCheck: true
            }
          }
        ],
        quickActions: [
          { label: 'I yelled', value: 'I raised my voice', style: 'secondary', triggers: 'what_happened' },
          { label: 'I shut down', value: 'I emotionally withdrew', style: 'secondary', triggers: 'what_happened' },
          { label: 'I said something harsh', value: 'I spoke from frustration', style: 'secondary', triggers: 'what_happened' },
          { label: 'I withdrew', value: 'I disconnected', style: 'secondary', triggers: 'what_happened' },
          { label: 'Other', value: '', style: 'gentle' }
        ]
      },
      spiralogicMapping: {
        element: 'Water',
        phase: 2,
        psychologicalProcess: 'Honest witnessing of rupture'
      },
      dataCapture: [
        {
          fieldId: 'what_happened',
          label: 'What happened',
          type: 'multi_line_text',
          validation: { required: true }
        }
      ],
      transitions: [
        { condition: 'if_complete', nextStepId: 'step_2_inner_state' }
      ]
    },

    {
      stepId: 'step_2_inner_state',
      stepNumber: 2,
      title: 'Your inner state (Water 2: self-compassion door)',
      maiaPhrasing: {
        systemContext: 'Guide parent to underlying feelings/needs beneath the behavior. This is key IPP move - understanding the parent\'s inner experience.',
        mainPrompt: 'Now let\'s bring some compassion to you. What were you feeling or needing in that moment—underneath the behavior?',
        tone: 'warm_curiosity',
        boundaries: [
          'Normalize all feelings as human',
          'Distinguish feelings from actions',
          'No advice-giving yet'
        ],
        personalization: {
          traumaSensitive: true,
          culturallyAdaptive: true,
          autonomyRespecting: true
        }
      },
      uiConfiguration: {
        layout: 'guided_reflection',
        fields: [
          {
            fieldId: 'parent_feeling',
            label: 'I was feeling...',
            type: 'multi_line_text',
            placeholder: 'overwhelmed / scared / powerless / ashamed...',
            validation: {
              required: true,
              emotionalSafetyCheck: true
            }
          },
          {
            fieldId: 'parent_need',
            label: 'If I could name one unmet need I had in that moment, it would be...',
            type: 'short_text',
            placeholder: 'support, space, understanding...',
            validation: {
              required: true
            }
          }
        ]
      },
      spiralogicMapping: {
        element: 'Water',
        phase: 2,
        psychologicalProcess: 'Self-compassion and need recognition'
      },
      dataCapture: [
        {
          fieldId: 'parent_feeling',
          label: 'Parent feeling',
          type: 'multi_line_text',
          validation: { required: true }
        },
        {
          fieldId: 'parent_need',
          label: 'Parent need',
          type: 'short_text',
          validation: { required: true }
        }
      ],
      transitions: [
        {
          condition: 'if_complete',
          nextStepId: 'step_3_child_experience',
          dataProcessing: ['normalize_parent_experience']
        }
      ]
    },

    {
      stepId: 'step_3_child_experience',
      stepNumber: 3,
      title: 'The child\'s experience (IPP lens: ideal parent reflection)',
      maiaPhrasing: {
        systemContext: 'Help parent imagine child\'s experience without self-attack. This is core IPP - perspective-taking with compassion.',
        mainPrompt: 'Now, from a gentle distance, let\'s imagine this through your child\'s eyes. You\'re not blaming yourself—you\'re just seeing.',
        tone: 'grounding_presence',
        boundaries: [
          'No parent-blaming or guilt amplification',
          'Focus on child\'s experience, not parent\'s failure',
          'Maintain both/and perspective'
        ],
        personalization: {
          traumaSensitive: true,
          culturallyAdaptive: true,
          autonomyRespecting: true
        }
      },
      uiConfiguration: {
        layout: 'guided_reflection',
        fields: [
          {
            fieldId: 'child_experience',
            label: 'If I imagine this from my child\'s perspective, they might have felt...',
            type: 'multi_line_text',
            placeholder: 'scared, confused, disconnected...',
            validation: {
              required: true,
              emotionalSafetyCheck: true
            }
          },
          {
            fieldId: 'child_need',
            label: 'What do I sense they most needed from me in that moment?',
            type: 'short_text',
            placeholder: 'safety, connection, understanding...',
            validation: {
              required: false
            }
          }
        ],
        visualElements: [
          {
            type: 'centering_reminder',
            message: 'This is the heart of ideal parenting: not perfection, but seeing what the child needed, even when we couldn\'t give it in the moment.'
          }
        ]
      },
      spiralogicMapping: {
        element: 'Water',
        phase: 3,
        psychologicalProcess: 'Perspective-taking and empathy development'
      },
      dataCapture: [
        {
          fieldId: 'child_experience',
          label: 'Child experience',
          type: 'multi_line_text',
          validation: { required: true }
        },
        {
          fieldId: 'child_need',
          label: 'Child need',
          type: 'short_text',
          validation: { required: false }
        }
      ],
      transitions: [
        { condition: 'if_complete', nextStepId: 'step_4_ideal_response' }
      ]
    },

    {
      stepId: 'step_4_ideal_response',
      stepNumber: 4,
      title: 'Ideal Parent Response (IPP-informed corrective imagination)',
      maiaPhrasing: {
        systemContext: 'Guide parent to imagine ideal response - this creates new neural pathways and gives the system a direction to grow toward.',
        mainPrompt: 'Now we imagine the *ideal parent* response—not to punish you, but to give your nervous system and your child a new pattern to lean on.',
        tone: 'gentle_authority',
        boundaries: [
          'Frame as growth direction, not failure comparison',
          'Keep realistic and human',
          'Focus on internal shifts, not perfect behavior'
        ],
        personalization: {
          traumaSensitive: true,
          culturallyAdaptive: true,
          autonomyRespecting: true
        }
      },
      uiConfiguration: {
        layout: 'guided_reflection',
        fields: [
          {
            fieldId: 'ideal_parent_response',
            label: 'If I imagine my "ideal parent self" in that same situation, they would...',
            type: 'multi_line_text',
            placeholder: 'kneel down and speak softly... take a break and come back... name their feelings... apologize...',
            validation: {
              required: true,
              minLength: 20
            }
          }
        ],
        visualElements: [
          {
            type: 'centering_reminder',
            message: 'Beautiful. This is not a standard you failed—it\'s a direction your system can grow toward. This image itself is medicine.'
          }
        ]
      },
      spiralogicMapping: {
        element: 'Earth',
        phase: 1,
        psychologicalProcess: 'Corrective imagination and new pattern seeding'
      },
      dataCapture: [
        {
          fieldId: 'ideal_parent_response',
          label: 'Ideal parent response',
          type: 'multi_line_text',
          validation: { required: true }
        }
      ],
      transitions: [
        { condition: 'if_complete', nextStepId: 'step_5_concrete_repair' }
      ]
    },

    {
      stepId: 'step_5_concrete_repair',
      stepNumber: 5,
      title: 'Concrete repair & next step (Earth 1–2)',
      maiaPhrasing: {
        systemContext: 'Help parent translate insights into concrete action. Both repair for child and self-care for parent.',
        mainPrompt: 'Let\'s translate this into one small real-world move—repair for your child, and care for you.',
        tone: 'grounding_presence',
        boundaries: [
          'Keep actions small and achievable',
          'Include both child-focused and self-care elements',
          'No perfectionist pressure'
        ],
        personalization: {
          traumaSensitive: true,
          culturallyAdaptive: true,
          autonomyRespecting: true
        }
      },
      uiConfiguration: {
        layout: 'guided_reflection',
        fields: [
          {
            fieldId: 'repair_plan',
            label: 'One simple repair I could offer my child is...',
            type: 'multi_line_text',
            placeholder: 'An apology, naming what happened, reassurance...',
            validation: {
              required: true,
              minLength: 10
            }
          },
          {
            fieldId: 'self_care_plan',
            label: 'One small way I can care for myself as a parent after this is...',
            type: 'multi_line_text',
            placeholder: 'rest, support, boundary, time, etc.',
            validation: {
              required: true,
              minLength: 10
            }
          }
        ],
        visualElements: [
          {
            type: 'centering_reminder',
            message: 'This is a repair moment: You\'ve seen what happened, felt your own humanity, imagined what your child needed, and named a next step. That is what good-enough parenting looks like in real life.'
          }
        ]
      },
      spiralogicMapping: {
        element: 'Earth',
        phase: 2,
        psychologicalProcess: 'Concrete manifestation and integration'
      },
      dataCapture: [
        {
          fieldId: 'repair_plan',
          label: 'Repair plan',
          type: 'multi_line_text',
          validation: { required: true }
        },
        {
          fieldId: 'self_care_plan',
          label: 'Self-care plan',
          type: 'multi_line_text',
          validation: { required: true }
        }
      ],
      transitions: [
        { condition: 'if_complete', nextStepId: 'completion_choice' }
      ]
    },

    {
      stepId: 'completion_choice',
      stepNumber: 6,
      title: 'Save to Field & Optional Reminder',
      maiaPhrasing: {
        systemContext: 'Offer field storage and optional reminder without pressure.',
        mainPrompt: 'Would you like a reminder later to follow through on your repair, or shall we just let this live quietly in your Field?',
        tone: 'gentle_authority',
        boundaries: [
          'No pressure to set reminders',
          'Honor user autonomy',
          'Normalize either choice'
        ],
        personalization: {
          traumaSensitive: true,
          culturallyAdaptive: true,
          autonomyRespecting: true
        }
      },
      uiConfiguration: {
        layout: 'choice_presentation',
        fields: [],
        quickActions: [
          { label: 'Set Reminder', value: 'set_reminder', style: 'primary' },
          { label: 'No Reminder', value: 'no_reminder', style: 'secondary' }
        ]
      },
      spiralogicMapping: {
        element: 'Earth',
        phase: 2,
        psychologicalProcess: 'Integration and future support planning'
      },
      dataCapture: [
        {
          fieldId: 'reminder_choice',
          label: 'Reminder preference',
          type: 'choice',
          validation: { required: true }
        }
      ],
      transitions: [
        { condition: 'always', nextStepId: 'flow_complete' }
      ]
    }
  ],
  dataSchema: {
    schemaId: 'ipp_parenting_repair_v1',
    requiredFields: ['what_happened', 'parent_feeling', 'parent_need', 'child_experience', 'ideal_parent_response', 'repair_plan', 'self_care_plan'],
    outputFormat: 'structured_json',
    storageLocation: 'both'
  },
  completionActions: [
    {
      actionType: 'save_to_field',
      configuration: {
        eventType: 'intervention_complete',
        framework: 'IPP',
        spiralogicJourney: 'Water-2 → Water-3 → Earth-1 → Earth-2'
      },
      userChoice: false
    },
    {
      actionType: 'schedule_reminder',
      configuration: {
        reminderType: 'repair_action',
        defaultDelay: '4 hours',
        message: 'Gentle reminder about your repair intention'
      },
      userChoice: true
    }
  ]
};

// ===== INTERVENTION FLOW ENGINE =====

export class InterventionFlowEngine {
  private currentFlow?: InterventionFlow;
  private currentStepIndex: number = 0;
  private collectedData: Record<string, any> = {};
  private flowStartTime?: Date;

  async startFlow(flowId: string, userId: string, initialContext?: any): Promise<InterventionStep> {
    // In a real implementation, this would load from a registry
    if (flowId === 'ipp_parenting_repair_v1') {
      this.currentFlow = IPP_PARENTING_REPAIR_FLOW;
    } else {
      throw new Error(`Unknown flow: ${flowId}`);
    }

    this.currentStepIndex = 0;
    this.collectedData = { userId, initialContext };
    this.flowStartTime = new Date();

    return this.getCurrentStep();
  }

  async processStepSubmission(stepData: Record<string, any>): Promise<InterventionStep | null> {
    if (!this.currentFlow) {
      throw new Error('No active flow');
    }

    const currentStep = this.getCurrentStep();

    // Store step data
    Object.assign(this.collectedData, stepData);

    // Process transitions
    const transition = currentStep.transitions.find(t =>
      t.condition === 'if_complete' || t.condition === 'always'
    );

    if (transition && transition.nextStepId !== 'flow_complete') {
      this.currentStepIndex = this.currentFlow.steps.findIndex(s => s.stepId === transition.nextStepId);
      return this.getCurrentStep();
    }

    // Flow complete
    await this.completeFlow();
    return null;
  }

  private getCurrentStep(): InterventionStep {
    if (!this.currentFlow) {
      throw new Error('No active flow');
    }
    return this.currentFlow.steps[this.currentStepIndex];
  }

  private async completeFlow(): Promise<void> {
    if (!this.currentFlow) return;

    // Create final field event with complete journey
    const spiralogicCell = createSpiralogicCell(
      'Earth',
      2,
      'parenting',
      0.9
    );

    const fieldEvent = createFieldEvent(
      this.collectedData.userId,
      'IPP Parenting Repair Moment Completed',
      spiralogicCell
    );

    fieldEvent.frameworksUsed = ['IPP'];
    fieldEvent.agentsInvolved = ['MAIA'];
    fieldEvent.contextDomain = 'parenting';
    fieldEvent.aiResponseType = 'structured_repair';

    // Store the complete intervention data
    (fieldEvent as any).interventionData = {
      flowId: this.currentFlow.flowId,
      completedData: this.collectedData,
      spiralogicJourney: this.currentFlow.spiralogicJourney,
      duration: this.flowStartTime ? Date.now() - this.flowStartTime.getTime() : 0
    };

    // Execute completion actions
    for (const action of this.currentFlow.completionActions) {
      await this.executeCompletionAction(action);
    }
  }

  private async executeCompletionAction(action: CompletionAction): Promise<void> {
    switch (action.actionType) {
      case 'save_to_field':
        // Save to field events system
        console.log('Saving to field events:', this.collectedData);
        break;
      case 'schedule_reminder':
        if (this.collectedData.reminder_choice === 'set_reminder') {
          console.log('Scheduling reminder:', action.configuration);
        }
        break;
    }
  }

  getProgress(): { current: number; total: number; percentage: number } {
    if (!this.currentFlow) return { current: 0, total: 0, percentage: 0 };

    return {
      current: this.currentStepIndex + 1,
      total: this.currentFlow.steps.length,
      percentage: ((this.currentStepIndex + 1) / this.currentFlow.steps.length) * 100
    };
  }
}

// ===== DATA FIELD INTERFACE =====

export interface DataField {
  fieldId: string;
  label: string;
  type: string;
  validation: {
    required: boolean;
    minLength?: number;
    emotionalSafetyCheck?: boolean;
  };
}

// ===== EXPORTS =====

export {
  IPP_PARENTING_REPAIR_FLOW,
  InterventionFlowEngine
};

export type {
  InterventionFlow,
  InterventionStep,
  MAIAPrompt,
  StepUIConfig,
  SpiralogicTransition
};