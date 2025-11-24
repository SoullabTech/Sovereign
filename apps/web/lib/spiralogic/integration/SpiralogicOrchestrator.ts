/**
 * Spiralogic Orchestrator - Integrates all Spiralogic components
 * Coordinates between MaiaAgent, elemental states, spiral processes, and UI
 */

import { MaiaAgent, MaiaResponse } from '../agents/MaiaAgent';
import { 
  Element,
  ElementalState,
  createInitialElementalState,
  detectElement
} from '../core/elementalOperators';
import { 
  SpiralState,
  initializeSpiral,
  spiralStep
} from '../core/spiralProcess';
import { 
  fractalResponse,
  FractalPattern
} from '../core/fractalRecursion';

export interface SpiralogicSession {
  userId: string;
  maiaAgent: MaiaAgent;
  elementalState: ElementalState;
  spiralState: SpiralState;
  currentElement: Element;
  isProcessing: boolean;
  lastResponse?: MaiaResponse;
  sessionStart: Date;
  interactionCount: number;
}

export interface SpiralogicEvent {
  type: 'element_change' | 'spiral_step' | 'breakthrough' | 'evolution' | 'completion';
  data: any;
  timestamp: Date;
}

export class SpiralogicOrchestrator {
  private sessions: Map<string, SpiralogicSession> = new Map();
  private eventListeners: ((event: SpiralogicEvent) => void)[] = [];
  
  /**
   * Initialize or get existing session for user
   */
  getOrCreateSession(userId: string): SpiralogicSession {
    if (!this.sessions.has(userId)) {
      const session: SpiralogicSession = {
        userId,
        maiaAgent: new MaiaAgent(),
        elementalState: createInitialElementalState(),
        spiralState: initializeSpiral(),
        currentElement: 'Fire',
        isProcessing: false,
        sessionStart: new Date(),
        interactionCount: 0
      };
      
      this.sessions.set(userId, session);
    }
    
    return this.sessions.get(userId)!;
  }
  
  /**
   * Process user input through the complete Spiralogic flow
   */
  async processInput(userId: string, input: string): Promise<{
    response: MaiaResponse;
    elementalState: ElementalState;
    spiralState: SpiralState;
    fractalPattern?: FractalPattern;
  }> {
    const session = this.getOrCreateSession(userId);
    
    // Set processing state
    session.isProcessing = true;
    
    try {
      // 1. Detect element from input
      const element = detectElement(input, session.elementalState);
      if (element !== session.currentElement) {
        session.currentElement = element;
        this.emitEvent({
          type: 'element_change',
          data: { element, previousElement: session.currentElement },
          timestamp: new Date()
        });
      }
      
      // 2. Progress spiral
      const spiral = spiralStep(session.spiralState, input);
      session.spiralState = spiral.state;
      this.emitEvent({
        type: 'spiral_step',
        data: spiral,
        timestamp: new Date()
      });
      
      // 3. Get Maia's response
      const maiaResponse = await session.maiaAgent.respond(userId, input);
      session.lastResponse = maiaResponse;
      
      // 4. Check for breakthroughs or evolution
      if (maiaResponse.ritualSuggestion) {
        this.emitEvent({
          type: 'breakthrough',
          data: { ritual: maiaResponse.ritualSuggestion },
          timestamp: new Date()
        });
      }
      
      // 5. Get fractal pattern if trust is sufficient
      let fractalPattern: FractalPattern | undefined;
      if (session.interactionCount > 5) {
        const fractal = fractalResponse(input, spiral.state.cycles);
        fractalPattern = fractal.pattern;
      }
      
      // 6. Check for completion/graduation
      if (maiaResponse.exitProtocol) {
        this.emitEvent({
          type: 'completion',
          data: { userId, message: session.maiaAgent.celebrateGraduation(userId) },
          timestamp: new Date()
        });
      }
      
      // Update session
      session.interactionCount++;
      session.isProcessing = false;
      
      return {
        response: maiaResponse,
        elementalState: session.elementalState,
        spiralState: session.spiralState,
        fractalPattern
      };
      
    } catch (error) {
      session.isProcessing = false;
      throw error;
    }
  }
  
  /**
   * Manually change element (from UI interaction)
   */
  changeElement(userId: string, element: Element): void {
    const session = this.getOrCreateSession(userId);
    session.currentElement = element;
    
    this.emitEvent({
      type: 'element_change',
      data: { element },
      timestamp: new Date()
    });
  }
  
  /**
   * Get current session state
   */
  getSessionState(userId: string): SpiralogicSession | undefined {
    return this.sessions.get(userId);
  }
  
  /**
   * Subscribe to Spiralogic events
   */
  addEventListener(listener: (event: SpiralogicEvent) => void): void {
    this.eventListeners.push(listener);
  }
  
  /**
   * Remove event listener
   */
  removeEventListener(listener: (event: SpiralogicEvent) => void): void {
    const index = this.eventListeners.indexOf(listener);
    if (index > -1) {
      this.eventListeners.splice(index, 1);
    }
  }
  
  /**
   * Emit event to all listeners
   */
  private emitEvent(event: SpiralogicEvent): void {
    this.eventListeners.forEach(listener => listener(event));
  }
  
  /**
   * Get UI state based on current session
   */
  getUIState(userId: string): {
    elementalTheme: Element;
    animationSpeed: number;
    colorPalette: Record<string, string>;
    shouldPause: boolean;
    spiralDepth: number;
  } {
    const session = this.getOrCreateSession(userId);
    
    const elementalThemes: Record<Element, Record<string, string>> = {
      Fire: {
        primary: '#FF6B35',
        secondary: '#FCA311',
        background: '#FFF3E0',
        text: '#5D4037'
      },
      Water: {
        primary: '#4A90E2',
        secondary: '#7EC8E3',
        background: '#E3F2FD',
        text: '#1A237E'
      },
      Earth: {
        primary: '#7B4F3A',
        secondary: '#A0826D',
        background: '#EFEBE9',
        text: '#3E2723'
      },
      Air: {
        primary: '#A8DADC',
        secondary: '#E0FBFC',
        background: '#F0F4F8',
        text: '#37474F'
      },
      Aether: {
        primary: '#9B59B6',
        secondary: '#BF7FBF',
        background: '#F3E5F5',
        text: '#4A148C'
      }
    };
    
    return {
      elementalTheme: session.currentElement,
      animationSpeed: session.spiralState.velocity,
      colorPalette: elementalThemes[session.currentElement],
      shouldPause: session.spiralState.polarity === 'stillness',
      spiralDepth: session.spiralState.depth
    };
  }
  
  /**
   * Generate session insights
   */
  generateSessionInsights(userId: string): {
    dominantElement: Element;
    spiralProgress: string;
    evolutionStage: string;
    recommendations: string[];
  } {
    const session = this.getOrCreateSession(userId);
    
    const evolutionStage = 
      session.elementalState.evolution < 0.3 ? 'Beginning' :
      session.elementalState.evolution < 0.6 ? 'Developing' :
      session.elementalState.evolution < 0.9 ? 'Integrating' :
      'Mastering';
    
    const spiralProgress = 
      session.spiralState.cycles === 0 ? 'First cycle' :
      session.spiralState.cycles < 3 ? 'Early spirals' :
      session.spiralState.cycles < 7 ? 'Deepening journey' :
      'Advanced spiral work';
    
    const recommendations = this.generateRecommendations(session);
    
    return {
      dominantElement: session.currentElement,
      spiralProgress,
      evolutionStage,
      recommendations
    };
  }
  
  /**
   * Generate personalized recommendations
   */
  private generateRecommendations(session: SpiralogicSession): string[] {
    const recommendations: string[] = [];
    
    // Element-based recommendations
    const elementBalance = session.elementalState.balance;
    const lowestElement = Object.entries(elementBalance)
      .sort(([, a], [, b]) => a - b)[0][0] as Element;
    
    recommendations.push(`Explore more ${lowestElement} energy to balance your elemental nature`);
    
    // Spiral-based recommendations
    if (session.spiralState.polarity === 'expansion') {
      recommendations.push('You are in expansion - embrace new possibilities');
    } else if (session.spiralState.polarity === 'contraction') {
      recommendations.push('Time for integration - reflect on recent insights');
    }
    
    // Evolution-based recommendations
    if (session.elementalState.evolution > 0.7) {
      recommendations.push('You are approaching mastery - trust your inner knowing');
    } else if (session.elementalState.evolution > 0.4) {
      recommendations.push('Continue exploring - deeper layers are revealing themselves');
    }
    
    return recommendations;
  }
  
  /**
   * Clear session (for logout or reset)
   */
  clearSession(userId: string): void {
    this.sessions.delete(userId);
  }
  
  /**
   * Export session data for persistence
   */
  exportSession(userId: string): string {
    const session = this.sessions.get(userId);
    if (!session) return '{}';
    
    return JSON.stringify({
      userId: session.userId,
      elementalState: session.elementalState,
      spiralState: session.spiralState,
      currentElement: session.currentElement,
      sessionStart: session.sessionStart,
      interactionCount: session.interactionCount
    });
  }
  
  /**
   * Import session data
   */
  importSession(data: string): void {
    try {
      const parsed = JSON.parse(data);
      const session = this.getOrCreateSession(parsed.userId);
      
      Object.assign(session, {
        elementalState: parsed.elementalState,
        spiralState: parsed.spiralState,
        currentElement: parsed.currentElement,
        sessionStart: new Date(parsed.sessionStart),
        interactionCount: parsed.interactionCount
      });
    } catch (error) {
      console.error('Failed to import session:', error);
    }
  }
}

// Singleton instance
export const spiralogicOrchestrator = new SpiralogicOrchestrator();