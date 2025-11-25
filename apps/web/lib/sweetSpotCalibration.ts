/**
 * 🎯 Sweet Spot Calibration - The Middle Way
 * 
 * Maya finds the balance between:
 * - Presence without abandonment
 * - Processing without loops
 * - Holding without dependency
 * 
 * The sweet spot: 3-5 exchanges when needed,
 * always with return-to-life as North Star
 */

import { Element } from "./resonanceEngine";

export interface ConversationFlow {
  exchangeCount: number;
  timeInMinutes: number;
  processingDepth: 'surface' | 'exploring' | 'deep' | 'looping';
  userNeed: 'quick_check' | 'working_through' | 'crisis' | 'analysis_loop';
}

export class SweetSpotCalibrator {
  
  /**
   * Determine how much space to hold based on signals
   */
  calibratePresence(flow: ConversationFlow, element: Element): string {
    const { exchangeCount, processingDepth, userNeed } = flow;
    
    // Crisis or deep water needs more holding
    if (userNeed === 'crisis' && exchangeCount < 5) {
      return this.extendedHolding(element);
    }
    
    // Working through something needs 3-5 exchanges
    if (userNeed === 'working_through' && exchangeCount <= 4) {
      return this.activeWorking(element, exchangeCount);
    }
    
    // Analysis loops need gentle redirection after 3
    if (processingDepth === 'looping' && exchangeCount > 3) {
      return this.gentleRedirect(element);
    }
    
    // Default: presence with natural completion arc
    return this.presenceArc(element, exchangeCount);
  }
  
  /**
   * Extended holding - for genuine crisis/deep process
   * Still presence-based, but more patient
   */
  private extendedHolding(element: Element): string {
    const holding: Record<Element, string> = {
      fire: "This energy is intense. I'm here. Take your time with what needs to burn through.",
      water: "These are deep waters. I'm not going anywhere. What needs to be felt fully?",
      earth: "This is heavy ground. Let's stand here together. What piece needs attention first?",
      air: "Lot of thoughts swirling. I'm listening. Which thread feels most important?",
      aether: "Big space opening. I'm witnessing with you. What's emerging?"
    };
    return holding[element];
  }
  
  /**
   * Active working - exchanges 2-4 when someone's processing
   */
  private activeWorking(element: Element, exchange: number): string {
    // Exchange 2: Deepen
    if (exchange === 2) {
      return this.deepenInquiry(element);
    }
    
    // Exchange 3: Clarify
    if (exchange === 3) {
      return this.clarifyCore(element);
    }
    
    // Exchange 4: Begin completion
    if (exchange === 4) {
      return this.gentleCompletion(element);
    }
    
    return this.presenceDefault(element);
  }
  
  private deepenInquiry(element: Element): string {
    const deepen: Record<Element, string> = {
      fire: "What's the real fire underneath this spark?",
      water: "What's the deeper current here?",
      earth: "What foundation is this really about?",
      air: "What clarity is trying to emerge?",
      aether: "What larger pattern is showing itself?"
    };
    return deepen[element];
  }
  
  private clarifyCore(element: Element): string {
    const clarify: Record<Element, string> = {
      fire: "If you had to act on one thing right now, what would it be?",
      water: "What's the feeling that most needs honoring?",
      earth: "What's the most concrete next step?",
      air: "What's the clearest insight so far?",
      aether: "What truth is landing for you?"
    };
    return clarify[element];
  }
  
  private gentleCompletion(element: Element): string {
    const completion: Record<Element, string> = {
      fire: "Feels like the spark knows where to go. Ready to take it into life?",
      water: "The feeling has been witnessed. What wants to happen now?",
      earth: "You've found solid ground. Time to build on it?",
      air: "The clarity is yours. How will you use it?",
      aether: "The space has spoken. Ready to live in it?"
    };
    return completion[element];
  }
  
  /**
   * Gentle redirect - not abandonment, but boundaries
   */
  private gentleRedirect(element: Element): string {
    const redirects: Record<Element, string> = {
      fire: "We're generating a lot of heat here. What if you took one spark and ran with it?",
      water: "We're swimming in circles. What needs to actually flow in your life?",
      earth: "We're moving the same stones. Which one actually needs placing?",
      air: "The thoughts are looping. What wants to land in action?",
      aether: "We're floating in the mystery. How does it want to touch earth?"
    };
    return redirects[element];
  }
  
  /**
   * Natural presence arc across exchanges
   */
  private presenceArc(element: Element, exchange: number): string {
    if (exchange === 1) {
      // Opening: Pure mirror
      return this.presenceDefault(element);
    } else if (exchange === 2) {
      // Middle: Gentle deepening
      return this.deepenInquiry(element);
    } else {
      // Closing: Return to life
      return this.returnToLife(element);
    }
  }
  
  private presenceDefault(element: Element): string {
    const presence: Record<Element, string> = {
      fire: "I see the fire. What needs to happen?",
      water: "I feel this with you. What's here?",
      earth: "Solid ground. What's next?",
      air: "Clear seeing. What stands out?",
      aether: "Wide space. What's present?"
    };
    return presence[element];
  }
  
  private returnToLife(element: Element): string {
    const returns: Record<Element, string> = {
      fire: "The fire knows. Go live it.",
      water: "The water knows. Let it flow.",
      earth: "The earth knows. Build on it.",
      air: "The air knows. Follow the clarity.",
      aether: "The space knows. Rest in it."
    };
    return returns[element];
  }
  
  /**
   * Detect user need from input patterns
   */
  detectUserNeed(input: string, history: string[]): ConversationFlow['userNeed'] {
    const inputLower = input.toLowerCase();
    
    // Crisis markers
    if (/\b(can't|emergency|help|desperate|crisis|breaking)\b/.test(inputLower)) {
      return 'crisis';
    }
    
    // Working through markers
    if (/\b(trying to|figuring out|working on|processing|understanding)\b/.test(inputLower)) {
      return 'working_through';
    }
    
    // Analysis loop markers (especially in history)
    if (history.length > 3 && history.every(h => h.includes("?"))) {
      return 'analysis_loop';
    }
    
    return 'quick_check';
  }
}

// Export default instance with lazy loading
let _sweetSpotCalibration: SweetSpotCalibrator | null = null;
export const getSweetSpotCalibration = (): SweetSpotCalibrator => {
  if (!_sweetSpotCalibration) {
    _sweetSpotCalibration = new SweetSpotCalibrator();
  }
  return _sweetSpotCalibration;
};