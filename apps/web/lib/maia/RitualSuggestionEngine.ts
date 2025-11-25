import React from 'react';
import { PersonalOracleAgent } from '@/lib/agents/PersonalOracleAgent';
import type { Element, Mood, EnergyState } from '@/lib/types/oracle';
import { supabase } from '@/lib/supabaseClient';

// Ritual types and their properties
export interface Ritual {
  id: string;
  name: string;
  type: 'transformation' | 'grounding' | 'elevation' | 'integration' | 'release';
  element: Element;
  duration: number; // minutes
  intensity: 'gentle' | 'moderate' | 'intense';
  description: string;
  benefits: string[];
  requirements: {
    minTrust?: number;
    phases?: string[];
    moods?: Mood[];
    elements?: Element[];
    timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'night';
  };
  steps: string[];
  affirmations: string[];
}

export interface RitualSuggestion {
  ritual: Ritual;
  reason: string;
  timing: 'now' | 'later' | 'tomorrow';
  priority: 'urgent' | 'recommended' | 'optional';
  confidence: number; // 0-100
}

export interface UserRitualHistory {
  ritualId: string;
  completedAt: Date;
  effectiveness: number; // 0-100
  notes?: string;
}

export class RitualSuggestionEngine {
  private rituals: Ritual[] = [
    // Air Element Rituals
    {
      id: 'breath-of-clarity',
      name: 'Breath of Clarity',
      type: 'elevation',
      element: 'air',
      duration: 10,
      intensity: 'gentle',
      description: 'A breathing ritual to clear mental fog and invite fresh perspective',
      benefits: ['Mental clarity', 'Stress relief', 'Enhanced focus'],
      requirements: {
        phases: ['dense', 'emerging'],
        moods: ['anxious', 'confused', 'stuck']
      },
      steps: [
        'Find a quiet space and sit comfortably',
        'Close your eyes and take three deep breaths',
        'Inhale for 4 counts, hold for 4, exhale for 8',
        'Visualize breathing in clear light, exhaling grey mist',
        'Continue for 10 cycles'
      ],
      affirmations: [
        'My mind is clear and open',
        'I breathe in possibility',
        'Clarity flows through me'
      ]
    },
    
    // Fire Element Rituals
    {
      id: 'phoenix-transformation',
      name: 'Phoenix Transformation',
      type: 'transformation',
      element: 'fire',
      duration: 20,
      intensity: 'intense',
      description: 'Burn away what no longer serves to make space for renewal',
      benefits: ['Release old patterns', 'Catalyze change', 'Empower action'],
      requirements: {
        minTrust: 60,
        phases: ['emerging', 'radiant'],
        moods: ['stuck', 'ready']
      },
      steps: [
        'Write down three things you wish to release',
        'Light a candle as witness to transformation',
        'Read each item aloud, then safely burn the paper',
        'As it burns, speak: "I release this with gratitude"',
        'Write three intentions for what will replace them',
        'Keep intentions visible for 7 days'
      ],
      affirmations: [
        'I am transformed by sacred fire',
        'I release the old to welcome the new',
        'My power ignites positive change'
      ]
    },
    
    // Water Element Rituals
    {
      id: 'flow-state-immersion',
      name: 'Flow State Immersion',
      type: 'integration',
      element: 'water',
      duration: 15,
      intensity: 'gentle',
      description: 'Enter a state of fluid awareness and emotional integration',
      benefits: ['Emotional balance', 'Intuitive insights', 'Inner peace'],
      requirements: {
        phases: ['emerging', 'radiant'],
        moods: ['neutral', 'contemplative', 'receptive']
      },
      steps: [
        'Fill a bowl with water',
        'Add a few drops of essential oil if available',
        'Gaze into the water, letting your vision soften',
        'Notice any images, feelings, or insights that arise',
        'When complete, touch the water to your forehead',
        'Pour the water onto earth or plants as offering'
      ],
      affirmations: [
        'I flow with life\'s currents',
        'My emotions are sacred messengers',
        'I trust my intuitive wisdom'
      ]
    },
    
    // Earth Element Rituals
    {
      id: 'root-and-ground',
      name: 'Root and Ground',
      type: 'grounding',
      element: 'earth',
      duration: 12,
      intensity: 'gentle',
      description: 'Connect with earth energy for stability and presence',
      benefits: ['Grounding', 'Stability', 'Physical presence'],
      requirements: {
        phases: ['dense', 'emerging'],
        moods: ['anxious', 'scattered', 'ungrounded']
      },
      steps: [
        'Stand barefoot on earth if possible, or visualize roots',
        'Feel or imagine roots growing from your feet',
        'Let them extend deep into the earth',
        'Draw up earth\'s steady, nurturing energy',
        'Feel it filling your body with stability',
        'Place hands on ground and give thanks'
      ],
      affirmations: [
        'I am rooted and stable',
        'Earth\'s wisdom flows through me',
        'I am present in my body'
      ]
    },
    
    // Aether Element Rituals
    {
      id: 'void-meditation',
      name: 'Void Meditation',
      type: 'integration',
      element: 'aether',
      duration: 25,
      intensity: 'moderate',
      description: 'Enter the space between thoughts to access deeper wisdom',
      benefits: ['Expanded awareness', 'Spiritual connection', 'Deep peace'],
      requirements: {
        minTrust: 70,
        phases: ['radiant'],
        moods: ['contemplative', 'receptive']
      },
      steps: [
        'Sit in complete darkness or use an eye mask',
        'Focus on the space between your thoughts',
        'When thoughts arise, gently return to the space',
        'Expand awareness to include all of existence',
        'Rest in the vastness for as long as comfortable',
        'Return slowly, bringing insights with you'
      ],
      affirmations: [
        'I am one with the infinite',
        'In emptiness, I find fullness',
        'I trust the mystery'
      ]
    },
    
    // Multi-Element Rituals
    {
      id: 'elemental-balance',
      name: 'Elemental Balance',
      type: 'integration',
      element: 'aether', // Aether contains all
      duration: 30,
      intensity: 'moderate',
      description: 'Harmonize all five elements within yourself',
      benefits: ['Complete balance', 'Holistic integration', 'Energetic alignment'],
      requirements: {
        minTrust: 50,
        phases: ['emerging', 'radiant']
      },
      steps: [
        'Create a sacred space with representations of each element',
        'Begin with Earth: Feel your physical presence',
        'Move to Water: Connect with your emotions',
        'Invoke Fire: Ignite your will and passion',
        'Breathe Air: Expand your mental clarity',
        'Rest in Aether: Experience the unity of all',
        'Thank each element and close the ritual'
      ],
      affirmations: [
        'I am balanced in all elements',
        'I embody the full spectrum of existence',
        'I am whole and complete'
      ]
    },
    
    // Morning Rituals
    {
      id: 'sunrise-activation',
      name: 'Sunrise Activation',
      type: 'elevation',
      element: 'fire',
      duration: 8,
      intensity: 'gentle',
      description: 'Activate your energy for the day ahead',
      benefits: ['Energy boost', 'Positive mindset', 'Clear intention'],
      requirements: {
        timeOfDay: 'morning'
      },
      steps: [
        'Face the rising sun or visualize golden light',
        'Stretch your arms wide, welcoming the day',
        'State three intentions for your day',
        'Take three energizing breaths',
        'Smile and step forward into your day'
      ],
      affirmations: [
        'I greet this day with joy',
        'My energy is renewed',
        'I am ready for today\'s gifts'
      ]
    },
    
    // Evening Rituals
    {
      id: 'twilight-release',
      name: 'Twilight Release',
      type: 'release',
      element: 'water',
      duration: 10,
      intensity: 'gentle',
      description: 'Release the day\'s energy and prepare for rest',
      benefits: ['Stress release', 'Better sleep', 'Emotional clearing'],
      requirements: {
        timeOfDay: 'evening'
      },
      steps: [
        'Light a candle to mark the transition',
        'Review your day without judgment',
        'Breathe out any tension or unfinished energy',
        'Wash your hands and face mindfully',
        'Thank yourself for today\'s efforts',
        'Blow out the candle, releasing the day'
      ],
      affirmations: [
        'I release today with gratitude',
        'My body and mind find peace',
        'I welcome restorative rest'
      ]
    }
  ];
  
  constructor(private agent: PersonalOracleAgent) {}
  
  // Analyze user state and suggest appropriate rituals
  async suggestRituals(
    context: {
      currentMood?: Mood;
      currentEnergy?: EnergyState;
      recentActivity?: any[];
      explicitRequest?: string;
    }
  ): Promise<RitualSuggestion[]> {
    const suggestions: RitualSuggestion[] = [];
    const profile = this.agent.getUserProfile();
    const state = this.agent.getState();
    const now = new Date();
    const hour = now.getHours();
    
    // Determine time of day
    const timeOfDay = hour < 6 ? 'night' :
                     hour < 12 ? 'morning' :
                     hour < 17 ? 'afternoon' :
                     hour < 21 ? 'evening' : 'night';
    
    // Get user's ritual history
    const history = await this.getUserRitualHistory(profile.userId);
    
    for (const ritual of this.rituals) {
      let score = 0;
      let reasons: string[] = [];
      
      // Check requirements
      if (ritual.requirements.minTrust && profile.trustLevel < ritual.requirements.minTrust) {
        continue; // Skip if trust level too low
      }
      
      // Time of day matching
      if (ritual.requirements.timeOfDay) {
        if (ritual.requirements.timeOfDay === timeOfDay) {
          score += 30;
          reasons.push('Perfect timing');
        } else {
          continue; // Skip if wrong time
        }
      }
      
      // Phase matching
      if (ritual.requirements.phases) {
        if (ritual.requirements.phases.includes(profile.currentPhase)) {
          score += 25;
          reasons.push('Matches your current phase');
        }
      }
      
      // Mood matching
      if (ritual.requirements.moods && context.currentMood) {
        if (ritual.requirements.moods.includes(context.currentMood)) {
          score += 35;
          reasons.push('Addresses your current mood');
        }
      }
      
      // Element alignment
      if (ritual.element === profile.element) {
        score += 20;
        reasons.push('Resonates with your element');
      }
      
      // Check if recently performed
      const lastPerformed = history.find(h => h.ritualId === ritual.id);
      if (lastPerformed) {
        const daysSince = this.daysSince(lastPerformed.completedAt);
        if (daysSince < 1) {
          continue; // Skip if done today
        } else if (daysSince < 3) {
          score -= 20; // Reduce score if done recently
        } else if (daysSince > 7) {
          score += 10; // Boost if not done in a while
          reasons.push('Time to revisit');
        }
      }
      
      // Energy state matching
      if (context.currentEnergy) {
        if (context.currentEnergy === 'dense' && ritual.type === 'grounding') {
          score += 15;
          reasons.push('Helps process density');
        } else if (context.currentEnergy === 'emerging' && ritual.type === 'elevation') {
          score += 15;
          reasons.push('Supports your emergence');
        } else if (context.currentEnergy === 'radiant' && ritual.type === 'integration') {
          score += 15;
          reasons.push('Integrates your radiance');
        }
      }
      
      // Explicit request matching
      if (context.explicitRequest) {
        const request = context.explicitRequest.toLowerCase();
        if (ritual.name.toLowerCase().includes(request) ||
            ritual.description.toLowerCase().includes(request) ||
            ritual.benefits.some(b => b.toLowerCase().includes(request))) {
          score += 50;
          reasons.push('Matches your request');
        }
      }
      
      // Create suggestion if score is high enough
      if (score >= 30) {
        const confidence = Math.min(100, score);
        const priority = confidence > 70 ? 'urgent' :
                        confidence > 50 ? 'recommended' : 'optional';
        const timing = priority === 'urgent' ? 'now' :
                      timeOfDay === 'night' ? 'tomorrow' : 'later';
        
        suggestions.push({
          ritual,
          reason: this.formatReason(reasons, ritual),
          timing,
          priority,
          confidence
        });
      }
    }
    
    // Sort by confidence
    suggestions.sort((a, b) => b.confidence - a.confidence);
    
    // Return top 3
    return suggestions.slice(0, 3);
  }
  
  // Format reason for suggestion
  private formatReason(reasons: string[], ritual: Ritual): string {
    if (reasons.length === 0) {
      return `The ${ritual.name} could be beneficial`;
    } else if (reasons.length === 1) {
      return reasons[0];
    } else {
      return `${reasons[0]} and ${reasons.slice(1).join(', ').toLowerCase()}`;
    }
  }
  
  // Get user's ritual history
  private async getUserRitualHistory(userId: string): Promise<UserRitualHistory[]> {
    try {
      const { data } = await supabase
        .from('ritual_completions')
        .select('*')
        .eq('user_id', userId)
        .order('completed_at', { ascending: false })
        .limit(50);
      
      return data?.map(d => ({
        ritualId: d.ritual_id,
        completedAt: new Date(d.completed_at),
        effectiveness: d.effectiveness || 50,
        notes: d.notes
      })) || [];
    } catch (error) {
      console.error('Error fetching ritual history:', error);
      return [];
    }
  }
  
  // Record ritual completion
  async recordCompletion(
    ritualId: string,
    effectiveness: number,
    notes?: string
  ): Promise<void> {
    const profile = this.agent.getUserProfile();
    
    try {
      await supabase
        .from('ritual_completions')
        .insert({
          user_id: profile.userId,
          ritual_id: ritualId,
          completed_at: new Date().toISOString(),
          effectiveness,
          notes
        });
      
      // Update user's energy based on ritual effectiveness
      if (effectiveness > 70) {
        await this.agent.updateEnergy('emerging');
      }
    } catch (error) {
      console.error('Error recording ritual completion:', error);
    }
  }
  
  // Get ritual by ID
  getRitual(id: string): Ritual | undefined {
    return this.rituals.find(r => r.id === id);
  }
  
  // Get rituals by element
  getRitualsByElement(element: Element): Ritual[] {
    return this.rituals.filter(r => r.element === element);
  }
  
  // Helper: days since date
  private daysSince(date: Date): number {
    return Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
  }
  
  // Generate personalized ritual
  async generatePersonalizedRitual(
    intention: string,
    duration?: number
  ): Promise<Ritual> {
    const profile = this.agent.getUserProfile();
    const element = profile.element;
    
    // Create a custom ritual based on user's intention and element
    return {
      id: `custom-${Date.now()}`,
      name: `Personal ${intention} Ritual`,
      type: this.inferRitualType(intention),
      element,
      duration: duration || 15,
      intensity: 'moderate',
      description: `A personalized ritual for ${intention}`,
      benefits: [`Addresses ${intention}`, 'Personalized to your energy', 'Aligned with your element'],
      requirements: {},
      steps: this.generateSteps(intention, element),
      affirmations: this.generateAffirmations(intention, element)
    };
  }
  
  private inferRitualType(intention: string): Ritual['type'] {
    const lower = intention.toLowerCase();
    if (lower.includes('release') || lower.includes('let go')) return 'release';
    if (lower.includes('ground') || lower.includes('calm')) return 'grounding';
    if (lower.includes('transform') || lower.includes('change')) return 'transformation';
    if (lower.includes('elevate') || lower.includes('raise')) return 'elevation';
    return 'integration';
  }
  
  private generateSteps(intention: string, element: Element): string[] {
    const baseSteps = [
      'Create sacred space and set your intention',
      `Connect with ${element} energy through breath`,
      `Focus on ${intention} while holding elemental awareness`,
      'Allow insights and feelings to arise naturally',
      'Thank the element and close the ritual'
    ];
    
    return baseSteps;
  }
  
  private generateAffirmations(intention: string, element: Element): string[] {
    const elementAffirmations: Record<Element, string> = {
      air: 'I am clear and free',
      fire: 'I am empowered and transforming',
      water: 'I flow with grace and wisdom',
      earth: 'I am grounded and strong',
      aether: 'I am connected to all that is'
    };
    
    return [
      `I embrace ${intention}`,
      elementAffirmations[element],
      'I trust my journey'
    ];
  }
}

// React hook for components
export function useRitualSuggestions(maya: PersonalOracleAgent | null) {
  const [engine, setEngine] = React.useState<RitualSuggestionEngine | null>(null);
  const [suggestions, setSuggestions] = React.useState<RitualSuggestion[]>([]);
  const [loading, setLoading] = React.useState(false);
  
  React.useEffect(() => {
    if (maya) {
      setEngine(new RitualSuggestionEngine(maya));
    }
  }, [maya]);
  
  const getSuggestions = React.useCallback(async (context: {
    currentMood?: Mood;
    currentEnergy?: EnergyState;
    explicitRequest?: string;
  }) => {
    if (!engine) return [];
    
    setLoading(true);
    const results = await engine.suggestRituals(context);
    setSuggestions(results);
    setLoading(false);
    
    return results;
  }, [engine]);
  
  const recordCompletion = React.useCallback(async (
    ritualId: string,
    effectiveness: number,
    notes?: string
  ) => {
    if (!engine) return;
    await engine.recordCompletion(ritualId, effectiveness, notes);
  }, [engine]);
  
  return { suggestions, loading, getSuggestions, recordCompletion };
}