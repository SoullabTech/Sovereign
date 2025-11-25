/**
 * Conversation Flow Tracker
 * Simplified version of ConversationalFlowEngine for web app
 * Tracks conversation arc: Opening → Building → Peak → Integration
 */

export interface FlowState {
  energy: 'opening' | 'building' | 'peak' | 'integrating' | 'closing';
  pace: 'slow' | 'medium' | 'quick';
  turnCount: number;
  depth: number; // 0-10 scale
}

export interface ResponseGuidance {
  style: 'questioning' | 'reflecting' | 'affirming' | 'challenging' | 'witnessing';
  shouldBeBrief: boolean;
  shouldDeepen: boolean;
  shouldGround: boolean;
}

export class ConversationFlowTracker {
  private turnCount: number = 0;
  private currentDepth: number = 0;
  private recentWordCounts: number[] = [];
  private recentIntensity: ('low' | 'medium' | 'high')[] = [];

  constructor() {
    this.reset();
  }

  /**
   * Update flow state based on user input
   */
  updateWithUserInput(userInput: string): FlowState {
    this.turnCount++;

    // Track word count (indicates engagement)
    const wordCount = userInput.trim().split(/\s+/).length;
    this.recentWordCounts.push(wordCount);
    if (this.recentWordCounts.length > 5) {
      this.recentWordCounts.shift();
    }

    // Detect intensity from language
    const intensity = this.detectIntensity(userInput);
    this.recentIntensity.push(intensity);
    if (this.recentIntensity.length > 3) {
      this.recentIntensity.shift();
    }

    // Update depth based on patterns
    this.updateDepth(userInput, wordCount, intensity);

    return this.assessFlowState();
  }

  /**
   * Get guidance for how MAIA should respond
   */
  getResponseGuidance(): ResponseGuidance {
    const flowState = this.assessFlowState();

    // Opening: warm, brief, inviting
    if (flowState.energy === 'opening') {
      return {
        style: 'reflecting',
        shouldBeBrief: true,
        shouldDeepen: false,
        shouldGround: false
      };
    }

    // Building: curious, exploring
    if (flowState.energy === 'building') {
      return {
        style: 'questioning',
        shouldBeBrief: false,
        shouldDeepen: true,
        shouldGround: false
      };
    }

    // Peak: direct, witnessing
    if (flowState.energy === 'peak') {
      const needsGrounding = this.recentIntensity.filter(i => i === 'high').length >= 2;
      return {
        style: needsGrounding ? 'witnessing' : 'challenging',
        shouldBeBrief: true,
        shouldDeepen: !needsGrounding,
        shouldGround: needsGrounding
      };
    }

    // Integrating: affirming, spacious
    if (flowState.energy === 'integrating') {
      return {
        style: 'affirming',
        shouldBeBrief: false,
        shouldDeepen: false,
        shouldGround: true
      };
    }

    // Default
    return {
      style: 'reflecting',
      shouldBeBrief: false,
      shouldDeepen: false,
      shouldGround: false
    };
  }

  /**
   * Get current flow state
   */
  getFlowState(): FlowState {
    return this.assessFlowState();
  }

  /**
   * Reset for new conversation
   */
  reset(): void {
    this.turnCount = 0;
    this.currentDepth = 0;
    this.recentWordCounts = [];
    this.recentIntensity = [];
  }

  // Private methods

  private assessFlowState(): FlowState {
    let energy: FlowState['energy'] = 'building';
    let pace: FlowState['pace'] = 'medium';

    // Opening phase (turns 1-3)
    if (this.turnCount <= 3) {
      energy = 'opening';
      pace = 'slow';
    }
    // Building phase (depth 2-5)
    else if (this.currentDepth > 1 && this.currentDepth <= 5) {
      energy = 'building';
      pace = 'medium';
    }
    // Peak phase (depth 5-8)
    else if (this.currentDepth > 5 && this.currentDepth <= 8) {
      energy = 'peak';
      pace = 'quick';
    }
    // Integration phase (depth 8+)
    else if (this.currentDepth > 8) {
      energy = 'integrating';
      pace = 'slow';
    }

    return {
      energy,
      pace,
      turnCount: this.turnCount,
      depth: this.currentDepth
    };
  }

  private detectIntensity(text: string): 'low' | 'medium' | 'high' {
    const lower = text.toLowerCase();

    // High intensity indicators
    const highIntensity = [
      'feel', 'felt', 'feeling', 'scared', 'afraid', 'anxious', 'overwhelmed',
      'lost', 'confused', 'angry', 'frustrated', 'desperate', 'crisis',
      'amazing', 'incredible', 'wonderful', 'breakthrough', '!!!', '!!'
    ];

    // Count high intensity words
    const intensityCount = highIntensity.filter(word => lower.includes(word)).length;

    if (intensityCount >= 3) return 'high';
    if (intensityCount >= 1) return 'medium';
    return 'low';
  }

  private updateDepth(input: string, wordCount: number, intensity: 'low' | 'medium' | 'high'): void {
    // Long messages increase depth
    if (wordCount > 50) {
      this.currentDepth = Math.min(10, this.currentDepth + 1);
    }

    // High intensity increases depth
    if (intensity === 'high') {
      this.currentDepth = Math.min(10, this.currentDepth + 0.5);
    }

    // Questions maintain or slightly reduce depth
    if (input.includes('?')) {
      this.currentDepth = Math.max(0, this.currentDepth - 0.2);
    }

    // Very short messages reduce depth
    if (wordCount < 5) {
      this.currentDepth = Math.max(0, this.currentDepth - 0.5);
    }

    // Natural decay over time (conversations naturally cycle)
    if (this.turnCount % 10 === 0) {
      this.currentDepth = Math.max(0, this.currentDepth - 1);
    }
  }
}

// Export singleton instance
export const conversationFlowTracker = new ConversationFlowTracker();
