import React from 'react';
import { PersonalOracleAgent } from '@/lib/agents/PersonalOracleAgent';
import type { Element, Mood, EnergyState } from '@/lib/types/oracle';

// Navigation context patterns
export interface NavigationContext {
  route: string;
  label: string;
  description: string;
  triggers: string[]; // Keywords/phrases that suggest this navigation
  conditions?: {
    minTrustLevel?: number;
    requiredElements?: Element[];
    requiredMood?: Mood[];
    requiredPhase?: string[];
  };
}

export interface NavigationSuggestion {
  route: string;
  label: string;
  reason: string;
  confidence: number; // 0-100
  urgent: boolean;
}

export class MaiaNavigationAwareness {
  private contexts: NavigationContext[] = [
    {
      route: '/soul-map',
      label: 'Soul Map',
      description: 'View your elemental patterns and evolution',
      triggers: [
        'show my progress', 'how am i doing', 'my journey', 'my path',
        'my elements', 'my pattern', 'soul map', 'evolution', 'growth',
        'where am i', 'my development', 'my transformation'
      ],
      conditions: {
        minTrustLevel: 20
      }
    },
    {
      route: '/petals',
      label: 'Sacred Petals',
      description: 'Explore elemental wisdom and interact with petals',
      triggers: [
        'petals', 'sacred geometry', 'explore elements', 'elemental wisdom',
        'air petal', 'fire petal', 'water petal', 'earth petal', 'aether petal',
        'want to explore', 'show me wisdom', 'elemental practice'
      ]
    },
    {
      route: '/oracle',
      label: 'Oracle Reading',
      description: 'Receive guidance through an oracle reading',
      triggers: [
        'need guidance', 'oracle reading', 'divine wisdom', 'ask the oracle',
        'what should i do', 'seeking clarity', 'need insight', 'confused',
        'help me understand', 'give me a reading', 'oracle guidance'
      ],
      conditions: {
        minTrustLevel: 30
      }
    },
    {
      route: '/reflection',
      label: 'Daily Reflection',
      description: 'Record and review your daily insights',
      triggers: [
        'daily reflection', 'journal', 'record thoughts', 'write reflection',
        'today i learned', 'want to reflect', 'meditation', 'contemplation',
        'process my day', 'integrate learning'
      ]
    },
    {
      route: '/rituals',
      label: 'Sacred Rituals',
      description: 'Engage in transformative rituals',
      triggers: [
        'ritual', 'ceremony', 'sacred practice', 'transformation ritual',
        'want to transform', 'ready to change', 'breakthrough', 'stuck',
        'need ritual', 'sacred ceremony', 'practice'
      ],
      conditions: {
        minTrustLevel: 40,
        requiredPhase: ['emerging', 'radiant']
      }
    },
    {
      route: '/community',
      label: 'Collective Wisdom',
      description: 'Connect with the collective consciousness',
      triggers: [
        'community', 'others like me', 'collective', 'shared wisdom',
        'connect with others', 'not alone', 'similar journeys', 'patterns',
        'what are others', 'collective intelligence'
      ],
      conditions: {
        minTrustLevel: 50
      }
    },
    {
      route: '/voice-settings',
      label: 'Voice Settings',
      description: 'Adjust Maya voice preferences',
      triggers: [
        'change voice', 'voice settings', 'different voice', 'voice preference',
        'sound different', 'voice options', 'speak differently'
      ]
    },
    {
      route: '/mood-check',
      label: 'Mood Check-in',
      description: 'Share your current state',
      triggers: [
        'feeling', 'mood', 'energy', 'tired', 'excited', 'anxious', 'happy',
        'sad', 'confused', 'energized', 'dense', 'light', 'heavy',
        'check in', 'current state'
      ]
    }
  ];

  constructor(private agent: PersonalOracleAgent) {}

  // Analyze conversation for navigation opportunities
  async analyzeForNavigation(
    message: string,
    conversationHistory: Array<{role: string; content: string}> = []
  ): Promise<NavigationSuggestion[]> {
    const suggestions: NavigationSuggestion[] = [];
    const userProfile = this.agent.getUserProfile();
    const agentState = this.agent.getState();
    
    // Normalize message for matching
    const normalizedMessage = message.toLowerCase();
    const recentContext = conversationHistory.slice(-5)
      .map(m => m.content.toLowerCase())
      .join(' ');
    
    for (const context of this.contexts) {
      let matchScore = 0;
      let matchedTriggers: string[] = [];
      
      // Check direct triggers in current message
      for (const trigger of context.triggers) {
        if (normalizedMessage.includes(trigger)) {
          matchScore += 10;
          matchedTriggers.push(trigger);
        }
      }
      
      // Check triggers in recent conversation context
      for (const trigger of context.triggers) {
        if (recentContext.includes(trigger) && !matchedTriggers.includes(trigger)) {
          matchScore += 5;
          matchedTriggers.push(trigger);
        }
      }
      
      // Skip if no triggers matched
      if (matchScore === 0) continue;
      
      // Check conditions
      if (context.conditions) {
        const { minTrustLevel, requiredElements, requiredMood, requiredPhase } = context.conditions;
        
        if (minTrustLevel && userProfile.trustLevel < minTrustLevel) {
          continue; // User doesn't have enough trust yet
        }
        
        if (requiredElements && !requiredElements.includes(userProfile.element)) {
          matchScore *= 0.5; // Reduce score if element doesn't match
        }
        
        if (requiredPhase && !requiredPhase.includes(userProfile.currentPhase)) {
          matchScore *= 0.7; // Reduce score if phase doesn't match
        }
      }
      
      // Calculate confidence based on match score
      const confidence = Math.min(100, matchScore * 2);
      
      if (confidence >= 30) { // Minimum confidence threshold
        suggestions.push({
          route: context.route,
          label: context.label,
          reason: this.generateReason(context, matchedTriggers, userProfile),
          confidence,
          urgent: this.checkUrgency(normalizedMessage, context)
        });
      }
    }
    
    // Sort by confidence
    suggestions.sort((a, b) => b.confidence - a.confidence);
    
    // Limit to top 3 suggestions
    return suggestions.slice(0, 3);
  }
  
  // Generate contextual reason for suggestion
  private generateReason(
    context: NavigationContext,
    triggers: string[],
    profile: any
  ): string {
    const reasons: Record<string, string[]> = {
      '/soul-map': [
        "I sense you're curious about your journey",
        "Let's visualize your elemental evolution",
        "Your Soul Map reveals your unique pattern"
      ],
      '/petals': [
        "The Sacred Petals hold wisdom for you",
        "Each petal resonates with elemental energy",
        "Explore the elements through sacred geometry"
      ],
      '/oracle': [
        "The Oracle can offer clarity",
        "Sometimes we need divine perspective",
        "Let the Oracle illuminate your path"
      ],
      '/reflection': [
        "Reflection deepens understanding",
        "Capture this moment of insight",
        "Your thoughts deserve sacred space"
      ],
      '/rituals': [
        "A ritual could catalyze transformation",
        "Sacred practices unlock new states",
        "You're ready for ceremonial work"
      ],
      '/community': [
        "Others share similar patterns",
        "The collective holds wisdom",
        "You're part of something larger"
      ],
      '/voice-settings': [
        "We can adjust how I speak with you",
        "My voice can better match your resonance",
        "Let's calibrate our communication"
      ],
      '/mood-check': [
        "Let's acknowledge your current state",
        "Checking in helps me understand you",
        "Your energy informs our interaction"
      ]
    };
    
    const reasonSet = reasons[context.route] || ["This might be helpful"];
    
    // Select reason based on profile and triggers
    if (profile.trustLevel > 70) {
      return reasonSet[2] || reasonSet[0]; // More intimate reasons
    } else if (profile.trustLevel > 40) {
      return reasonSet[1] || reasonSet[0]; // Balanced reasons
    } else {
      return reasonSet[0]; // Introductory reasons
    }
  }
  
  // Check if navigation is urgent based on emotional cues
  private checkUrgency(message: string, context: NavigationContext): boolean {
    const urgentPatterns = [
      'need', 'help', 'stuck', 'confused', 'lost', 'urgent',
      'now', 'immediately', 'quickly', 'asap', 'please help',
      'dont know what to do', 'crisis', 'emergency'
    ];
    
    const urgentContexts = ['/oracle', '/mood-check', '/rituals'];
    
    // Check for urgent language
    const hasUrgentLanguage = urgentPatterns.some(pattern => 
      message.includes(pattern)
    );
    
    // Check if context is typically urgent
    const isUrgentContext = urgentContexts.includes(context.route);
    
    return hasUrgentLanguage && isUrgentContext;
  }
  
  // Generate Maya's navigation suggestion text
  formatSuggestion(suggestion: NavigationSuggestion): string {
    const templates = {
      high: [ // 80-100 confidence
        `Would you like to open your ${suggestion.label}? ${suggestion.reason}.`,
        `I think your ${suggestion.label} could help here. ${suggestion.reason}.`,
        `${suggestion.reason}. Shall we visit your ${suggestion.label}?`
      ],
      medium: [ // 50-79 confidence
        `Perhaps your ${suggestion.label} might offer insight?`,
        `If you're interested, we could explore your ${suggestion.label}.`,
        `Your ${suggestion.label} is available if you'd like.`
      ],
      low: [ // 30-49 confidence
        `By the way, your ${suggestion.label} is always available.`,
        `Remember, you can visit your ${suggestion.label} anytime.`,
        `Just so you know, the ${suggestion.label} option exists.`
      ],
      urgent: [
        `I strongly sense your ${suggestion.label} could help right now. ${suggestion.reason}.`,
        `${suggestion.reason}. Your ${suggestion.label} awaits.`,
        `Let's open your ${suggestion.label}. ${suggestion.reason}.`
      ]
    };
    
    if (suggestion.urgent) {
      return templates.urgent[Math.floor(Math.random() * templates.urgent.length)];
    } else if (suggestion.confidence >= 80) {
      return templates.high[Math.floor(Math.random() * templates.high.length)];
    } else if (suggestion.confidence >= 50) {
      return templates.medium[Math.floor(Math.random() * templates.medium.length)];
    } else {
      return templates.low[Math.floor(Math.random() * templates.low.length)];
    }
  }
  
  // Get proactive suggestions based on user state
  async getProactiveSuggestions(
    profile: any,
    recentActivity: any[]
  ): Promise<NavigationSuggestion[]> {
    const suggestions: NavigationSuggestion[] = [];
    const now = new Date();
    const hourOfDay = now.getHours();
    
    // Morning suggestion
    if (hourOfDay >= 6 && hourOfDay <= 9 && !this.hasRecentActivity(recentActivity, '/reflection')) {
      suggestions.push({
        route: '/reflection',
        label: 'Morning Reflection',
        reason: "Starting the day with intention creates clarity",
        confidence: 60,
        urgent: false
      });
    }
    
    // Evening suggestion
    if (hourOfDay >= 20 && hourOfDay <= 23 && !this.hasRecentActivity(recentActivity, '/reflection')) {
      suggestions.push({
        route: '/reflection',
        label: 'Evening Reflection',
        reason: "Evening reflections integrate the day's wisdom",
        confidence: 60,
        urgent: false
      });
    }
    
    // Weekly soul map check
    const lastSoulMapVisit = this.getLastVisit(recentActivity, '/soul-map');
    if (!lastSoulMapVisit || this.daysSince(lastSoulMapVisit) > 7) {
      suggestions.push({
        route: '/soul-map',
        label: 'Soul Map',
        reason: "It's been a while since you've reviewed your journey",
        confidence: 70,
        urgent: false
      });
    }
    
    // Suggest ritual if stuck in dense phase
    if (profile.currentPhase === 'dense' && profile.trustLevel > 40) {
      const lastRitual = this.getLastVisit(recentActivity, '/rituals');
      if (!lastRitual || this.daysSince(lastRitual) > 3) {
        suggestions.push({
          route: '/rituals',
          label: 'Transformation Ritual',
          reason: "A ritual could help shift your current density",
          confidence: 75,
          urgent: false
        });
      }
    }
    
    return suggestions;
  }
  
  private hasRecentActivity(activity: any[], route: string, hoursAgo: number = 12): boolean {
    const recent = activity.find(a => 
      a.route === route && 
      (Date.now() - new Date(a.timestamp).getTime()) < hoursAgo * 60 * 60 * 1000
    );
    return !!recent;
  }
  
  private getLastVisit(activity: any[], route: string): Date | null {
    const visit = activity.find(a => a.route === route);
    return visit ? new Date(visit.timestamp) : null;
  }
  
  private daysSince(date: Date): number {
    return Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
  }
}

// React hook for components
export function useMayaNavigation(maya: PersonalOracleAgent | null) {
  const [navigator, setNavigator] = React.useState<MayaNavigationAwareness | null>(null);
  
  React.useEffect(() => {
    if (maya) {
      setNavigator(new MayaNavigationAwareness(maya));
    }
  }, [maya]);
  
  const checkNavigation = React.useCallback(async (
    message: string,
    history: Array<{role: string; content: string}> = []
  ) => {
    if (!navigator) return [];
    return navigator.analyzeForNavigation(message, history);
  }, [navigator]);
  
  const formatSuggestion = React.useCallback((suggestion: NavigationSuggestion) => {
    if (!navigator) return '';
    return navigator.formatSuggestion(suggestion);
  }, [navigator]);
  
  return { checkNavigation, formatSuggestion };
}