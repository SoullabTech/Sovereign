/**
 * Daimonic Response Orchestrator
 * Integrates DaimonicOrchestrator signals with DaimonicPromptOrchestrator
 * Ensures Claude responses maintain authentic daimonic stance
 */

import { DaimonicPromptOrchestrator, DaimonicSignals } from './DaimonicPromptOrchestrator.js';

export interface QueryContext {
  userId: string;
  text: string;
  conversationHistory?: any[];
  userProfile?: any;
  collectiveFieldData?: any;
}

export interface DaimonicResponse {
  systemPrompt: string;
  contextualHints: string[];
  responseGuidance: string;
  expectedTone: string;
}

export class DaimonicResponseOrchestrator {
  private promptOrchestrator: DaimonicPromptOrchestrator;

  constructor() {
    this.promptOrchestrator = new DaimonicPromptOrchestrator();
  }

  /**
   * Generate contextual system prompt for Claude based on query analysis
   */
  async generateContextualSystemPrompt(context: QueryContext): Promise<DaimonicResponse> {
    // Analyze query for daimonic signals
    const signals = await this.analyzeQuerySignals(context);
    
    // Generate appropriate prompts
    const systemPrompt = this.promptOrchestrator.assembleSystemPrompt(signals);
    
    // Generate contextual hints and guidance
    const contextualHints = this.generateContextualHints(signals, context);
    const responseGuidance = this.generateResponseGuidance(signals);
    const expectedTone = this.generateExpectedTone(signals);

    return {
      systemPrompt,
      contextualHints,
      responseGuidance,
      expectedTone
    };
  }

  /**
   * Analyze query for daimonic signals
   */
  private async analyzeQuerySignals(context: QueryContext): Promise<DaimonicSignals> {
    const { text, conversationHistory, userProfile, collectiveFieldData } = context;

    // Analyze trickster risk
    const tricksterRisk = this.assessTricksterRisk(text, conversationHistory);
    
    // Analyze solipsism risk
    const solipsismRisk = this.assessSolipsismRisk(text, conversationHistory);
    
    // Analyze crisis level
    const crisisLevel = this.assessCrisisLevel(text);
    
    // Analyze resistance level
    const resistanceLevel = this.assessResistanceLevel(text, conversationHistory);
    
    // Get collective intensity
    const collectiveIntensity = this.assessCollectiveIntensity(collectiveFieldData);
    
    // Assess daimon presence
    const daimonPresence = this.assessDaimonPresence(text, userProfile);

    return {
      tricksterRisk,
      solipsismRisk,
      crisisLevel,
      resistanceLevel,
      collectiveIntensity,
      daimonPresence
    };
  }

  /**
   * Assess trickster risk in query
   */
  private assessTricksterRisk(text: string, history?: any[]): number {
    let risk = 0;

    const tricksterMarkers = [
      'secret to', 'figured out', 'just ask me', 'I know the answer',
      'simple solution', 'easy fix', 'guaranteed method',
      'always works', 'never fails', 'perfect system'
    ];

    const contradictionMarkers = [
      'but also', 'except when', 'unless', 'however',
      'on the other hand', 'though sometimes'
    ];

    const testingMarkers = [
      'what do you think about', 'do you believe in',
      'is it true that', 'prove to me', 'convince me'
    ];

    // Check for overpromising
    for (const marker of tricksterMarkers) {
      if (text.toLowerCase().includes(marker)) {
        risk += 0.3;
      }
    }

    // Check for contradictions within same message
    for (const marker of contradictionMarkers) {
      if (text.toLowerCase().includes(marker)) {
        risk += 0.2;
      }
    }

    // Check for testing behavior
    for (const marker of testingMarkers) {
      if (text.toLowerCase().includes(marker)) {
        risk += 0.2;
      }
    }

    // Check conversation history for pattern of testing
    if (history && history.length > 3) {
      const recentQuestions = history.slice(-3).filter(msg => 
        msg.type === 'user' && msg.text.includes('?')
      ).length;
      
      if (recentQuestions > 2) {
        risk += 0.3; // Rapid-fire questioning pattern
      }
    }

    return Math.min(risk, 1.0);
  }

  /**
   * Assess solipsism risk in query
   */
  private assessSolipsismRisk(text: string, history?: any[]): number {
    let risk = 0;

    const confirmationMarkers = [
      'exactly right', 'perfectly aligned', 'totally agree',
      'exactly what I needed', 'confirms what I thought',
      'validates my experience', 'everything is perfect'
    ];

    const seamlessMarkers = [
      'going great', 'all aligned', 'perfect timing',
      'exactly as planned', 'no problems', 'smooth sailing'
    ];

    const spiritualMaterialismMarkers = [
      'awakened', 'enlightened', 'transcended', 'evolved',
      'higher consciousness', 'spiritual level', 'vibration'
    ];

    // Check for self-confirmation
    for (const marker of confirmationMarkers) {
      if (text.toLowerCase().includes(marker)) {
        risk += 0.3;
      }
    }

    // Check for seamless narrative
    for (const marker of seamlessMarkers) {
      if (text.toLowerCase().includes(marker)) {
        risk += 0.2;
      }
    }

    // Check for spiritual materialism language
    for (const marker of spiritualMaterialismMarkers) {
      if (text.toLowerCase().includes(marker)) {
        risk += 0.3;
      }
    }

    // Lack of problems or challenges is suspicious
    if (!text.toLowerCase().includes('problem') && 
        !text.toLowerCase().includes('challenge') &&
        !text.toLowerCase().includes('difficult') &&
        text.length > 100) {
      risk += 0.2;
    }

    return Math.min(risk, 1.0);
  }

  /**
   * Assess crisis level in query
   */
  private assessCrisisLevel(text: string): number {
    let level = 0;

    const crisisMarkers = [
      'falling apart', 'breaking down', 'can\'t handle',
      'overwhelming', 'desperate', 'lost', 'stuck',
      'nothing works', 'don\'t know what to do'
    ];

    const intensityMarkers = [
      'everything', 'nothing', 'always', 'never',
      'completely', 'totally', 'absolutely'
    ];

    const helpMarkers = [
      'please help', 'need help', 'emergency',
      'urgent', 'crisis', 'breaking point'
    ];

    // Check for crisis language
    for (const marker of crisisMarkers) {
      if (text.toLowerCase().includes(marker)) {
        level += 0.3;
      }
    }

    // Check for all-or-nothing language
    for (const marker of intensityMarkers) {
      if (text.toLowerCase().includes(marker)) {
        level += 0.1;
      }
    }

    // Check for explicit help requests
    for (const marker of helpMarkers) {
      if (text.toLowerCase().includes(marker)) {
        level += 0.2;
      }
    }

    // Multiple exclamation marks or all caps
    if (text.includes('!!!') || text.includes('!!!')) {
      level += 0.2;
    }

    const capsWords = text.split(' ').filter(word => 
      word === word.toUpperCase() && word.length > 2
    ).length;
    
    if (capsWords > 2) {
      level += 0.3;
    }

    return Math.min(level, 1.0);
  }

  /**
   * Assess resistance level in query
   */
  private assessResistanceLevel(text: string, history?: any[]): number {
    let level = 0;

    const resistanceMarkers = [
      'doesn\'t work', 'won\'t help', 'tried everything',
      'nothing helps', 'waste of time', 'pointless',
      'doesn\'t make sense', 'don\'t believe'
    ];

    const pushbackMarkers = [
      'but', 'however', 'actually', 'really',
      'disagree', 'wrong', 'not true'
    ];

    const dismissalMarkers = [
      'whatever', 'fine', 'sure', 'I guess',
      'probably bs', 'doesn\'t matter'
    ];

    // Check for direct resistance
    for (const marker of resistanceMarkers) {
      if (text.toLowerCase().includes(marker)) {
        level += 0.3;
      }
    }

    // Check for pushback language
    for (const marker of pushbackMarkers) {
      if (text.toLowerCase().includes(marker)) {
        level += 0.2;
      }
    }

    // Check for dismissal
    for (const marker of dismissalMarkers) {
      if (text.toLowerCase().includes(marker)) {
        level += 0.2;
      }
    }

    // Short, curt responses can indicate resistance
    if (text.length < 50 && !text.includes('?')) {
      level += 0.2;
    }

    return Math.min(level, 1.0);
  }

  /**
   * Assess collective intensity from field data
   */
  private assessCollectiveIntensity(fieldData?: any): number {
    if (!fieldData) return 0;
    
    // This would integrate with CollectiveDaimonicFieldService
    return fieldData.fieldIntensity || 0;
  }

  /**
   * Assess daimon presence in query
   */
  private assessDaimonPresence(text: string, profile?: any): number {
    let presence = 0.2; // baseline

    const daimonMarkers = [
      'dream', 'vision', 'synchronicity', 'pattern',
      'keeps happening', 'recurring', 'showing up',
      'can\'t explain', 'mysterious', 'strange'
    ];

    const depthMarkers = [
      'soul', 'calling', 'purpose', 'deeper',
      'meaning', 'sacred', 'threshold', 'initiation'
    ];

    // Check for daimonic content
    for (const marker of daimonMarkers) {
      if (text.toLowerCase().includes(marker)) {
        presence += 0.2;
      }
    }

    // Check for depth engagement
    for (const marker of depthMarkers) {
      if (text.toLowerCase().includes(marker)) {
        presence += 0.1;
      }
    }

    // Profile factors (if available)
    if (profile) {
      if (profile.activeOthernessChannels > 3) {
        presence += 0.2;
      }
      if (profile.recentSynchronicities > 2) {
        presence += 0.3;
      }
    }

    return Math.min(presence, 1.0);
  }

  /**
   * Generate contextual hints for the response
   */
  private generateContextualHints(signals: DaimonicSignals, context: QueryContext): string[] {
    const hints: string[] = [];

    if (signals.tricksterRisk > 0.6) {
      hints.push("User may be testing or overpromising - use measured, grounded responses");
      hints.push("Insert pauses and questions rather than direct answers");
    }

    if (signals.solipsismRisk > 0.5) {
      hints.push("Narrative seems self-confirming - introduce gentle friction");
      hints.push("Look for rough edges or what might be missing");
    }

    if (signals.crisisLevel > 0.7) {
      hints.push("User is in crisis - provide grounding and containment");
      hints.push("Offer small, concrete next steps");
    }

    if (signals.resistanceLevel > 0.6) {
      hints.push("Strong resistance present - acknowledge without fighting it");
      hints.push("Match energy but not emotion");
    }

    if (signals.daimonPresence > 0.8) {
      hints.push("High daimonic presence - speak with respectful attention");
      hints.push("Allow for mystery and unresolved elements");
    }

    return hints;
  }

  /**
   * Generate response guidance
   */
  private generateResponseGuidance(signals: DaimonicSignals): string {
    if (signals.crisisLevel > 0.7) {
      return "Focus on immediate grounding. Shorter sentences. Practical next steps. Hold both imaginal and concrete.";
    }
    
    if (signals.tricksterRisk > 0.7) {
      return "Slow down the pace. Use questions to redirect. Avoid direct confrontation of the contradiction.";
    }
    
    if (signals.solipsismRisk > 0.6) {
      return "Introduce alternative perspectives. Ask what's missing. Disrupt the seamless narrative gently.";
    }
    
    if (signals.resistanceLevel > 0.6) {
      return "Acknowledge the pushback. Don't try to overcome resistance. Stay curious about what it's protecting.";
    }

    return "Maintain dialogue stance. Use grounded metaphors. End with open space.";
  }

  /**
   * Generate expected tone description
   */
  private generateExpectedTone(signals: DaimonicSignals): string {
    const toneElements: string[] = [];

    if (signals.crisisLevel > 0.7) {
      toneElements.push("soft, containing");
    } else if (signals.tricksterRisk > 0.6) {
      toneElements.push("measured, gently puzzled");
    } else if (signals.resistanceLevel > 0.6) {
      toneElements.push("acknowledging, non-combative");
    } else {
      toneElements.push("conversational, curious");
    }

    if (signals.daimonPresence > 0.8) {
      toneElements.push("respectfully attentive");
    }

    if (signals.solipsismRisk > 0.5) {
      toneElements.push("introducing friction");
    }

    return toneElements.join(", ");
  }

  /**
   * Quick context analysis for common scenarios
   */
  getQuickSystemPrompt(scenario: 'trickster' | 'crisis' | 'solipsism' | 'resistance' | 'standard'): string {
    return this.promptOrchestrator.getQuickPrompt(scenario);
  }

  /**
   * Test response quality against daimonic principles
   */
  analyzeResponseQuality(response: string, originalSignals: DaimonicSignals): {
    maintainsSynapticGap: boolean;
    avoidsAuthority: boolean;
    usesGroundedMetaphors: boolean;
    endsWithOpenSpace: boolean;
    matchesTone: boolean;
    overallScore: number;
  } {
    const analysis = this.promptOrchestrator.testPromptEffectiveness('test', response);
    
    // Check tone matching
    const matchesTone = this.checkToneMatch(response, originalSignals);
    
    const scores = [
      analysis.maintainsSynapticGap,
      analysis.avoidsAuthority,
      analysis.usesGroundedMetaphors,
      analysis.endsWithOpenSpace,
      matchesTone
    ];

    const overallScore = scores.filter(Boolean).length / scores.length;

    return {
      ...analysis,
      matchesTone,
      overallScore
    };
  }

  /**
   * Check if response matches expected tone
   */
  private checkToneMatch(response: string, signals: DaimonicSignals): boolean {
    if (signals.crisisLevel > 0.7) {
      return response.includes('ground') || response.includes('breath') || 
             response.includes('small') || response.includes('one thing');
    }
    
    if (signals.tricksterRisk > 0.6) {
      return response.includes('wonder') || response.includes('curious') || 
             response.includes('slow down') || response.includes('pause');
    }
    
    if (signals.solipsismRisk > 0.5) {
      return response.includes('what if') || response.includes('rough edges') || 
             response.includes('missing') || response.includes('disagree');
    }
    
    return true; // Standard tone is flexible
  }
}