import { supabase } from './supabase/client';

export interface EscapeHatchTrigger {
  userId: string;
  sessionId: string;
  timestamp: Date;
  triggerType: 'explicit-request' | 'crisis-language' | 'repeated-confusion' | 'timeout';
  userMessage: string;
  contextBefore: string[];
  mayaResponse: string;
  resolution: 'returned-to-witness' | 'provided-direction' | 'ended-session' | 'resources-given';
  densityPreference?: string;
  depthAtTrigger?: string;
}

export interface DirectivePattern {
  pattern: RegExp;
  urgency: 'high' | 'medium' | 'low';
  category: 'direction-seeking' | 'crisis' | 'confusion' | 'frustration';
}

const directivePatterns: DirectivePattern[] = [
  // High urgency - explicit demands
  {
    pattern: /just tell me what to do/i,
    urgency: 'high',
    category: 'direction-seeking'
  },
  {
    pattern: /i need (an answer|advice|help) (right )?now/i,
    urgency: 'high',
    category: 'direction-seeking'
  },
  {
    pattern: /stop asking questions.*tell me/i,
    urgency: 'high',
    category: 'frustration'
  },
  {
    pattern: /(i'm in crisis|emergency|can't handle this)/i,
    urgency: 'high',
    category: 'crisis'
  },
  
  // Medium urgency - strong preference for direction
  {
    pattern: /what should i do/i,
    urgency: 'medium',
    category: 'direction-seeking'
  },
  {
    pattern: /give me (advice|guidance|direction)/i,
    urgency: 'medium',
    category: 'direction-seeking'
  },
  {
    pattern: /i don't understand.*help/i,
    urgency: 'medium',
    category: 'confusion'
  },
  
  // Low urgency - mild confusion or preference
  {
    pattern: /i'm confused/i,
    urgency: 'low',
    category: 'confusion'
  },
  {
    pattern: /what do you think i should/i,
    urgency: 'low',
    category: 'direction-seeking'
  }
];

export class RefinedEscapeHatch {
  private sessionContext: Map<string, {
    escapeCount: number;
    lastEscape: Date | null;
    preferredMode: 'witness' | 'structured' | null;
  }> = new Map();

  async evaluateNeed(
    message: string,
    sessionId: string,
    userId: string,
    contextHistory: string[]
  ): Promise<{
    triggered: boolean;
    urgency: 'high' | 'medium' | 'low' | null;
    response: string;
    shouldTrack: boolean;
  }> {
    
    // Check for pattern matches
    let highestUrgency: 'high' | 'medium' | 'low' | null = null;
    let matchedCategory: string | null = null;
    
    for (const pattern of directivePatterns) {
      if (pattern.pattern.test(message)) {
        if (!highestUrgency || 
            (pattern.urgency === 'high') ||
            (pattern.urgency === 'medium' && highestUrgency === 'low')) {
          highestUrgency = pattern.urgency;
          matchedCategory = pattern.category;
        }
      }
    }
    
    if (!highestUrgency) {
      return {
        triggered: false,
        urgency: null,
        response: '',
        shouldTrack: false
      };
    }

    // Get session context
    const session = this.sessionContext.get(sessionId) || {
      escapeCount: 0,
      lastEscape: null,
      preferredMode: null
    };

    // Generate appropriate response based on urgency and category
    let response = '';
    
    if (highestUrgency === 'high' && matchedCategory === 'crisis') {
      response = this.getCrisisResponse();
    } else if (highestUrgency === 'high' && matchedCategory === 'direction-seeking') {
      response = this.getHighUrgencyDirectiveResponse(session.escapeCount);
    } else if (highestUrgency === 'medium') {
      response = this.getMediumUrgencyResponse(matchedCategory!, session.escapeCount);
    } else {
      response = this.getLowUrgencyResponse(matchedCategory!);
    }

    // Update session context
    session.escapeCount++;
    session.lastEscape = new Date();
    this.sessionContext.set(sessionId, session);

    // Track in database for analysis
    if (highestUrgency === 'high' || session.escapeCount > 2) {
      await this.trackEscapeHatch({
        userId,
        sessionId,
        timestamp: new Date(),
        triggerType: 'explicit-request',
        userMessage: message,
        contextBefore: contextHistory.slice(-3),
        mayaResponse: response,
        resolution: 'provided-direction'
      });
    }

    return {
      triggered: true,
      urgency: highestUrgency,
      response,
      shouldTrack: true
    };
  }

  private getCrisisResponse(): string {
    return `I hear that you're in crisis. Your safety is important.

For immediate support:
• Crisis hotline: 988 (US)
• Emergency services: 911
• Crisis Text Line: Text HOME to 741741

I'm here to witness what you're experiencing, though I'm not equipped for crisis intervention.

Would you like me to stay present with you while you reach out for support?`;
  }

  private getHighUrgencyDirectiveResponse(escapeCount: number): string {
    if (escapeCount === 0) {
      return `I hear you wanting clear direction. 

I can offer more structured reflection if that would help - though I'm designed to witness rather than direct. 

What specific guidance are you seeking? I can help you explore your own knowing about this.`;
    } else if (escapeCount === 1) {
      return `I understand you need something more concrete right now.

Let me offer this: What outcome would feel most aligned for you? If you can name it, we can explore the path together.

[After you respond, I'll return to witnessing mode while holding what you've shared.]`;
    } else {
      // After multiple requests, provide ONE directive response
      return `I hear the urgency. Here's what I notice might help:

[Single, specific reflection based on their context]

Now that we've named that directly - what does this clarity reveal to you?`;
    }
  }

  private getMediumUrgencyResponse(category: string, escapeCount: number): string {
    if (category === 'confusion') {
      return `I notice confusion arising. 

Rather than me explaining, what if we slow down? What part feels most unclear? 

Sometimes confusion is wisdom in disguise - it shows us where something new wants to emerge.`;
    } else if (category === 'direction-seeking') {
      if (escapeCount === 0) {
        return `I hear you seeking direction.

What does your body tell you about this? Often our knowing lives there first, before words.

What possibility feels most alive, even if uncertain?`;
      } else {
        return `You're really wanting guidance. I hear that.

What would you tell a dear friend facing this same situation? 

Sometimes we already know, we just need to hear ourselves say it.`;
      }
    } else {
      return `I'm witnessing your frustration.

What needs to be acknowledged here? What wants to be heard?`;
    }
  }

  private getLowUrgencyResponse(category: string): string {
    if (category === 'confusion') {
      return `Confusion can be a doorway. What's becoming less clear? What's becoming more clear?`;
    } else {
      return `I notice you're curious about my perspective. What draws you to want that? What would it offer?`;
    }
  }

  async trackEscapeHatch(trigger: EscapeHatchTrigger): Promise<void> {
    try {
      await supabase.from('escape_hatch_triggers').insert({
        user_id: trigger.userId,
        session_id: trigger.sessionId,
        timestamp: trigger.timestamp,
        trigger_type: trigger.triggerType,
        user_message: trigger.userMessage,
        context_before: trigger.contextBefore,
        maya_response: trigger.mayaResponse,
        resolution: trigger.resolution,
        density_preference: trigger.densityPreference,
        depth_at_trigger: trigger.depthAtTrigger
      });
    } catch (error) {
      console.error('Failed to track escape hatch:', error);
    }
  }

  // Analysis methods for beta review
  async analyzeEscapePatterns(startDate: Date, endDate: Date) {
    const { data, error } = await supabase
      .from('escape_hatch_triggers')
      .select('*')
      .gte('timestamp', startDate.toISOString())
      .lte('timestamp', endDate.toISOString());

    if (error) {
      console.error('Failed to fetch escape patterns:', error);
      return null;
    }

    // Analyze patterns
    const analysis = {
      totalTriggers: data.length,
      byTriggerType: {} as Record<string, number>,
      byResolution: {} as Record<string, number>,
      averageSessionTime: 0,
      commonPhrases: [] as string[],
      cohortPatterns: {} as Record<string, any>
    };

    data.forEach(trigger => {
      analysis.byTriggerType[trigger.trigger_type] = 
        (analysis.byTriggerType[trigger.trigger_type] || 0) + 1;
      
      analysis.byResolution[trigger.resolution] = 
        (analysis.byResolution[trigger.resolution] || 0) + 1;
    });

    return analysis;
  }

  // Method to check if user needs different support
  shouldSuggestAlternative(sessionId: string): boolean {
    const session = this.sessionContext.get(sessionId);
    
    // Suggest alternative if:
    // - More than 3 escape hatches in one session
    // - Multiple high-urgency triggers
    // - Pattern of confusion/frustration
    
    return session ? session.escapeCount > 3 : false;
  }

  getAlternativeResourceSuggestion(): string {
    return `I notice we're having trouble finding our rhythm together.

Maya works best for open exploration and witnessing. You might be better served by:

• A therapist for structured guidance
• An AI assistant designed for advice-giving
• A coach for action-oriented support

Would you like resources for any of these alternatives?`;
  }
}