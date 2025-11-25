/**
 * 🌊 Maya Conversational Flow Control
 * 
 * Manages conversation dynamics, pacing, and natural closure points.
 * Ensures conversations stay catalytic without becoming endless loops.
 */

import type {
  ConversationState,
  MayaRole,
  ElementType,
  SoulLabMetadata
} from './types/soullab-metadata';

import { conversationQueries } from './supabase/soullab-queries';
// Note: sweetSpotCalibration import removed as it was unused

export type FlowState = 'opening' | 'building' | 'sustaining' | 'completing' | 'closing';
export type FlowAction = 'continue' | 'deepen' | 'redirect' | 'complete' | 'close';
export type ConversationMode = 'mirror' | 'journal' | 'story' | 'reliving' | 'weaving';

export interface FlowContext {
  sessionId: string;
  userId: string;
  exchangeCount: number;
  currentMode: ConversationMode;
  momentum: 'building' | 'sustaining' | 'completing';
  lastElement?: ElementType;
  energyLevel: number; // 0-1 scale
  depthLevel: number; // 0-1 scale
}

export interface FlowDecision {
  action: FlowAction;
  reason: string;
  suggestion?: string;
  modeShift?: ConversationMode;
}

export interface ConversationTransition {
  from: ConversationMode;
  to: ConversationMode;
  prompt: string;
}

/**
 * Conversation flow templates
 */
const FLOW_TEMPLATES = {
  opening: {
    prompts: [
      "What's alive for you right now?",
      "What brings you here today?",
      "What's calling for attention?",
      "Where shall we begin?"
    ],
    energy: 0.3,
    depth: 0.2
  },
  
  building: {
    prompts: [
      "Tell me more about that.",
      "What else is here?",
      "How does that land in your body?",
      "What's the feeling beneath that?"
    ],
    energy: 0.5,
    depth: 0.4
  },
  
  sustaining: {
    prompts: [
      "Let's stay with this a moment.",
      "What's emerging as we explore this?",
      "Notice what's shifting.",
      "What pattern do you see?"
    ],
    energy: 0.7,
    depth: 0.6
  },
  
  completing: {
    prompts: [
      "What's becoming clear?",
      "What are you taking from this?",
      "How has this shifted?",
      "What experiment might you try?"
    ],
    energy: 0.5,
    depth: 0.7
  },
  
  closing: {
    prompts: [
      "This feels like a natural pause.",
      "Let's let this settle.",
      "Take this with you.",
      "Until we meet again."
    ],
    energy: 0.2,
    depth: 0.5
  }
};

/**
 * Mode transition templates
 */
const MODE_TRANSITIONS: Record<string, ConversationTransition> = {
  'mirror-journal': {
    from: 'mirror',
    to: 'journal',
    prompt: "This feels worth capturing. Want to make this a journal entry?"
  },
  'mirror-story': {
    from: 'mirror',
    to: 'story',
    prompt: "There's a story here. Would you like to tell it?"
  },
  'mirror-reliving': {
    from: 'mirror',
    to: 'reliving',
    prompt: "Let's go deeper into that moment. Close your eyes and bring it back."
  },
  'journal-weaving': {
    from: 'journal',
    to: 'weaving',
    prompt: "This connects to something you wrote before. Shall we weave these threads?"
  },
  'story-weaving': {
    from: 'story',
    to: 'weaving',
    prompt: "This story echoes through your journey. Want to see the pattern?"
  }
};

/**
 * Maya Conversation Flow Controller
 */
export class MayaConversationFlow {
  private context: FlowContext;
  private state?: ConversationState;
  private flowHistory: FlowDecision[] = [];
  
  constructor(context: FlowContext) {
    this.context = context;
  }
  
  /**
   * Initialize flow controller
   */
  async initialize() {
    this.state = await conversationQueries.getOrCreate(
      this.context.userId,
      this.context.sessionId
    );
    
    // Update context from state
    this.context.exchangeCount = this.state.exchange_count;
    this.context.momentum = this.state.momentum;
    this.context.lastElement = this.state.last_element as ElementType;
  }
  
  /**
   * Determine next flow action
   */
  async determineFlow(
    userInput: string,
    metadata: SoulLabMetadata
  ): Promise<FlowDecision> {
    // Update exchange count
    await conversationQueries.incrementExchange(this.context.sessionId);
    this.context.exchangeCount++;
    
    // Analyze conversation energy
    const energy = this.calculateEnergy(userInput, metadata);
    const depth = this.calculateDepth(metadata);
    
    this.context.energyLevel = energy;
    this.context.depthLevel = depth;
    
    // Determine flow state
    const flowState = this.determineFlowState();
    
    // Check for natural closure
    if (this.shouldClose(flowState)) {
      return {
        action: 'close',
        reason: 'Natural completion point reached',
        suggestion: this.getClosingMessage()
      };
    }
    
    // Check for redirection need
    if (this.shouldRedirect(flowState)) {
      return {
        action: 'redirect',
        reason: 'Energy shifting, new direction needed',
        suggestion: this.getRedirectionPrompt()
      };
    }
    
    // Check for mode shift opportunity
    const modeShift = this.detectModeShift(userInput, metadata);
    if (modeShift) {
      return {
        action: 'deepen',
        reason: 'Opportunity to deepen through mode shift',
        modeShift: modeShift.to,
        suggestion: modeShift.prompt
      };
    }
    
    // Check for completion signals
    if (this.detectCompletion(userInput)) {
      return {
        action: 'complete',
        reason: 'User signaling completion',
        suggestion: this.getCompletionPrompt()
      };
    }
    
    // Default: continue
    return {
      action: 'continue',
      reason: 'Conversation flowing naturally',
      suggestion: this.getContinuationPrompt(flowState)
    };
  }
  
  /**
   * Generate contextual prompt based on flow
   */
  async generatePrompt(
    role: MayaRole,
    metadata: SoulLabMetadata
  ): Promise<string> {
    const flowState = this.determineFlowState();
    const templates = FLOW_TEMPLATES[flowState];
    
    // Select prompt based on role and context
    let prompt = templates.prompts[
      Math.floor(Math.random() * templates.prompts.length)
    ];
    
    // Customize based on role
    if (role.active === 'teacher') {
      prompt = this.teacherVariation(prompt);
    } else if (role.active === 'guide') {
      prompt = this.guideVariation(prompt);
    } else if (role.active === 'consultant') {
      prompt = this.consultantVariation(prompt);
    } else if (role.active === 'coach') {
      prompt = this.coachVariation(prompt);
    }
    
    // Add elemental flavor
    if (metadata.elemental.dominant) {
      prompt = this.addElementalFlavor(prompt, metadata.elemental.dominant);
    }
    
    return prompt;
  }
  
  /**
   * Manage conversation modes
   */
  async switchMode(newMode: ConversationMode): Promise<string> {
    const oldMode = this.context.currentMode;
    this.context.currentMode = newMode;
    
    const transitionKey = `${oldMode}-${newMode}`;
    const transition = MODE_TRANSITIONS[transitionKey];
    
    if (transition) {
      return transition.prompt;
    }
    
    // Generic transition
    return this.genericModeTransition(oldMode, newMode);
  }
  
  /**
   * Check if conversation should naturally pause
   */
  shouldPause(): boolean {
    // Natural pause points
    if (this.context.exchangeCount >= 8 && this.context.energyLevel < 0.4) {
      return true;
    }
    
    if (this.context.exchangeCount >= 12) {
      return true;
    }
    
    if (this.context.depthLevel > 0.8 && this.context.energyLevel < 0.3) {
      return true;
    }
    
    return false;
  }
  
  /**
   * Generate invitation for next session
   */
  generateContinuationInvite(): string {
    const lastElement = this.context.lastElement;
    
    const invites = {
      fire: "When the fire calls again, we'll be here.",
      water: "Let this flow settle. We can return when the waters move.",
      earth: "Let this take root. We'll check the garden when you return.",
      air: "Let these insights breathe. New perspectives await.",
      aether: "Rest in the unity. The field remains open."
    };
    
    return invites[lastElement || 'fire'] || "Until next time.";
  }
  
  // === Private Helper Methods ===
  
  private calculateEnergy(input: string, metadata: SoulLabMetadata): number {
    // Base energy from input length and punctuation
    let energy = Math.min(input.length / 500, 0.5);
    
    // Exclamation marks increase energy
    const exclamations = (input.match(/!/g) || []).length;
    energy += exclamations * 0.1;
    
    // Questions increase energy
    const questions = (input.match(/\?/g) || []).length;
    energy += questions * 0.05;
    
    // Elemental intensity adds energy
    energy += metadata.elemental.intensity * 0.3;
    
    // Fire element naturally higher energy
    if (metadata.elemental.dominant === 'fire') {
      energy += 0.2;
    }
    
    return Math.min(energy, 1);
  }
  
  private calculateDepth(metadata: SoulLabMetadata): number {
    let depth = 0;
    
    // Consciousness level indicates depth
    const consciousnessDepth = {
      ego: 0.2,
      soul: 0.5,
      cosmic: 0.8,
      universal: 1.0
    };
    depth += consciousnessDepth[metadata.consciousness.level];
    
    // Shadow work increases depth
    if (metadata.consciousness.shadowIndicators?.length) {
      depth += 0.2;
    }
    
    // Water and earth elements tend toward depth
    if (metadata.elemental.dominant === 'water' || 
        metadata.elemental.dominant === 'earth') {
      depth += 0.1;
    }
    
    return Math.min(depth, 1);
  }
  
  private determineFlowState(): FlowState {
    const { exchangeCount, energyLevel, depthLevel, momentum } = this.context;
    
    if (exchangeCount <= 2) {
      return 'opening';
    }
    
    if (exchangeCount <= 4 && energyLevel < 0.6) {
      return 'building';
    }
    
    if (exchangeCount <= 8 && energyLevel >= 0.6) {
      return 'sustaining';
    }
    
    if (exchangeCount > 8 || momentum === 'completing') {
      return 'completing';
    }
    
    if (energyLevel < 0.3 && depthLevel > 0.7) {
      return 'closing';
    }
    
    return 'sustaining';
  }
  
  private shouldClose(flowState: FlowState): boolean {
    return flowState === 'closing' || 
           (this.context.exchangeCount > 15) ||
           (this.context.energyLevel < 0.2 && this.context.exchangeCount > 8);
  }
  
  private shouldRedirect(flowState: FlowState): boolean {
    // Check if stuck in repetition
    if (this.flowHistory.length >= 3) {
      const recent = this.flowHistory.slice(-3);
      const allSame = recent.every(f => f.action === recent[0].action);
      if (allSame) return true;
    }
    
    // Low energy in sustaining phase
    if (flowState === 'sustaining' && this.context.energyLevel < 0.4) {
      return true;
    }
    
    return false;
  }
  
  private detectModeShift(
    input: string,
    metadata: SoulLabMetadata
  ): ConversationTransition | null {
    const inputLower = input.toLowerCase();
    
    // Journal signals
    if (inputLower.match(/write|journal|capture|record|note/)) {
      return MODE_TRANSITIONS['mirror-journal'];
    }
    
    // Story signals
    if (inputLower.match(/story|tell|narrative|once upon|happened/)) {
      return MODE_TRANSITIONS['mirror-story'];
    }
    
    // Reliving signals
    if (inputLower.match(/remember|recall|that moment|back then|relive/)) {
      return MODE_TRANSITIONS['mirror-reliving'];
    }
    
    // Weaving signals (high resonance with past)
    if (metadata.collectiveResonance && metadata.collectiveResonance > 0.7) {
      if (this.context.currentMode === 'journal') {
        return MODE_TRANSITIONS['journal-weaving'];
      }
      if (this.context.currentMode === 'story') {
        return MODE_TRANSITIONS['story-weaving'];
      }
    }
    
    return null;
  }
  
  private detectCompletion(input: string): boolean {
    const completionSignals = [
      'thank you', 'thanks', 'that helps', 'i see now',
      'makes sense', 'got it', 'understood', 'clear now',
      'goodbye', 'bye', 'see you', 'until next'
    ];
    
    const inputLower = input.toLowerCase();
    return completionSignals.some(signal => inputLower.includes(signal));
  }
  
  private getClosingMessage(): string {
    const templates = FLOW_TEMPLATES.closing.prompts;
    return templates[Math.floor(Math.random() * templates.length)];
  }
  
  private getRedirectionPrompt(): string {
    const prompts = [
      "Let's shift perspective. What else is present?",
      "There's another angle here. What haven't we touched?",
      "The energy is shifting. Where does it want to go?",
      "New territory is calling. What's emerging?"
    ];
    
    return prompts[Math.floor(Math.random() * prompts.length)];
  }
  
  private getCompletionPrompt(): string {
    const prompts = [
      "What will you take with you?",
      "How will you carry this forward?",
      "What experiment emerges from this?",
      "What's your next step?"
    ];
    
    return prompts[Math.floor(Math.random() * prompts.length)];
  }
  
  private getContinuationPrompt(flowState: FlowState): string {
    const templates = FLOW_TEMPLATES[flowState].prompts;
    return templates[Math.floor(Math.random() * templates.length)];
  }
  
  private teacherVariation(prompt: string): string {
    const variations: Record<string, string> = {
      "What's alive for you right now?": "What concept or pattern is calling for understanding?",
      "Tell me more about that.": "Let's unpack that concept further.",
      "What's emerging as we explore this?": "What framework is becoming clear?"
    };
    
    return variations[prompt] || prompt;
  }
  
  private guideVariation(prompt: string): string {
    const variations: Record<string, string> = {
      "What's alive for you right now?": "What part of your journey needs witnessing?",
      "Tell me more about that.": "Follow that thread deeper.",
      "What's emerging as we explore this?": "What wisdom is revealing itself?"
    };
    
    return variations[prompt] || prompt;
  }
  
  private consultantVariation(prompt: string): string {
    const variations: Record<string, string> = {
      "What's alive for you right now?": "What challenge needs solving?",
      "Tell me more about that.": "What are the practical constraints?",
      "What's emerging as we explore this?": "What solution is taking shape?"
    };
    
    return variations[prompt] || prompt;
  }
  
  private coachVariation(prompt: string): string {
    const variations: Record<string, string> = {
      "What's alive for you right now?": "What action wants to happen?",
      "Tell me more about that.": "What's the specific goal?",
      "What's emerging as we explore this?": "What commitment is forming?"
    };
    
    return variations[prompt] || prompt;
  }
  
  private addElementalFlavor(prompt: string, element: ElementType): string {
    const flavors = {
      fire: prompt + " Notice the spark.",
      water: prompt + " Feel into the flow.",
      earth: prompt + " Ground into this.",
      air: prompt + " Let it breathe.",
      aether: prompt + " Sense the unity."
    };
    
    return flavors[element] || prompt;
  }
  
  private genericModeTransition(from: ConversationMode, to: ConversationMode): string {
    const transitions = {
      journal: "Let's capture this.",
      story: "Tell me the story.",
      reliving: "Go back to that moment.",
      weaving: "Let's weave these threads.",
      mirror: "Let's return to presence."
    };
    
    return transitions[to] || "Let's shift our focus.";
  }
}

/**
 * Factory function
 */
export function createConversationFlow(context: FlowContext) {
  return new MayaConversationFlow(context);
}