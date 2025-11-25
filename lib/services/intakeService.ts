import { createClient } from '@/lib/supabase';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export interface IntakeEnrichment {
  focusAreaInsights?: string[];
  elementalBalance?: {
    fire: number;
    water: number;
    earth: number;
    air: number;
  };
  dominantElement?: string;
  suggestedPractices?: string[];
}

export class IntakeService {
  /**
   * Calculate natal chart when birth data is complete
   */
  static async calculateNatalChart(userId: string, birthData: {
    date: string;
    time?: string;
    place?: string;
  }) {
    try {
      // Call your astrology service API
      const response = await fetch('/api/astrology/natal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          birthDate: birthData.date,
          birthTime: birthData.time,
          birthPlace: birthData.place
        })
      });

      if (!response.ok) throw new Error('Failed to calculate natal chart');

      const chartData = await response.json();

      // Store the calculated chart
      await supabase.from('natal_charts').upsert({
        user_id: userId,
        chart_data: chartData,
        planetary_positions: chartData.planets,
        house_cusps: chartData.houses,
        aspects: chartData.aspects,
        elemental_balance: chartData.elementalBalance,
        dominant_element: chartData.dominantElement,
        sun_sign: chartData.sunSign,
        moon_sign: chartData.moonSign,
        rising_sign: chartData.risingSign,
        calculated_at: new Date().toISOString()
      });

      return chartData;
    } catch (error) {
      console.error('Error calculating natal chart:', error);
      return null;
    }
  }

  /**
   * Analyze focus areas to determine elemental resonance
   */
  static analyzeFocusAreas(focusAreas: string[]): IntakeEnrichment {
    const elementalMapping: Record<string, string> = {
      'purpose': 'fire',
      'relationships': 'water',
      'creativity': 'air',
      'spirituality': 'water',
      'career': 'earth',
      'healing': 'fire',
      'shadow': 'earth',
      'wisdom': 'air'
    };

    const elementCounts = { fire: 0, water: 0, earth: 0, air: 0 };
    
    focusAreas.forEach(area => {
      const element = elementalMapping[area];
      if (element) {
        elementCounts[element as keyof typeof elementCounts]++;
      }
    });

    // Calculate percentages
    const total = focusAreas.length || 1;
    const elementalBalance = {
      fire: (elementCounts.fire / total) * 100,
      water: (elementCounts.water / total) * 100,
      earth: (elementCounts.earth / total) * 100,
      air: (elementCounts.air / total) * 100
    };

    // Find dominant element
    const dominantElement = Object.entries(elementCounts)
      .sort(([,a], [,b]) => b - a)[0][0];

    // Suggest practices based on elemental balance
    const suggestedPractices = this.getSuggestedPractices(dominantElement);

    // Generate insights
    const focusAreaInsights = this.generateFocusInsights(focusAreas, dominantElement);

    return {
      elementalBalance,
      dominantElement,
      suggestedPractices,
      focusAreaInsights
    };
  }

  /**
   * Get suggested spiritual practices based on dominant element
   */
  static getSuggestedPractices(element: string): string[] {
    const practiceMap: Record<string, string[]> = {
      fire: [
        'Kundalini Yoga',
        'Breathwork',
        'Candle Meditation',
        'Dynamic Movement',
        'Creative Expression'
      ],
      water: [
        'Flow Yoga',
        'Emotional Release Work',
        'Water Meditation',
        'Dream Journaling',
        'Sound Healing'
      ],
      earth: [
        'Grounding Meditation',
        'Walking in Nature',
        'Body Scan Practice',
        'Garden Meditation',
        'Crystal Work'
      ],
      air: [
        'Pranayama',
        'Mindfulness Meditation',
        'Journaling',
        'Visualization',
        'Mantra Practice'
      ]
    };

    return practiceMap[element] || [];
  }

  /**
   * Generate personalized insights based on focus areas
   */
  static generateFocusInsights(focusAreas: string[], dominantElement: string): string[] {
    const insights: string[] = [];

    if (focusAreas.includes('purpose') && focusAreas.includes('career')) {
      insights.push('Your soul seeks alignment between purpose and profession');
    }

    if (focusAreas.includes('relationships') && focusAreas.includes('healing')) {
      insights.push('Healing patterns in relationships appears central to your journey');
    }

    if (focusAreas.includes('spirituality') && focusAreas.includes('shadow')) {
      insights.push("You're ready for deep spiritual work that embraces all aspects of self");
    }

    if (focusAreas.includes('creativity')) {
      insights.push('Creative expression is calling as a path to self-discovery');
    }

    // Add element-specific insight
    const elementInsights: Record<string, string> = {
      fire: 'Your journey calls for transformation and inspired action',
      water: 'Emotional wisdom and intuitive flow guide your path',
      earth: 'Grounding and manifestation are your current teachers',
      air: 'Mental clarity and communication open new perspectives'
    };

    insights.push(elementInsights[dominantElement]);

    return insights;
  }

  /**
   * Check if user needs Part 2 intake
   */
  static async checkPart2Eligibility(userId: string): Promise<boolean> {
    try {
      const { data: intake } = await supabase
        .from('beta_intake')
        .select('intake_part1_completed_at, intake_part2_completed_at')
        .eq('user_id', userId)
        .single();

      if (!intake || !intake.intake_part1_completed_at || intake.intake_part2_completed_at) {
        return false;
      }

      const part1Date = new Date(intake.intake_part1_completed_at);
      const oneWeekLater = new Date(part1Date.getTime() + 7 * 24 * 60 * 60 * 1000);
      const now = new Date();

      return now >= oneWeekLater;
    } catch (error) {
      console.error('Error checking Part 2 eligibility:', error);
      return false;
    }
  }

  /**
   * Save Part 2 deep dive data
   */
  static async savePart2Data(userId: string, part2Data: any) {
    try {
      await supabase
        .from('beta_intake')
        .update({
          elemental_resonance: part2Data.elementalResonance,
          archetype_connections: part2Data.archetypeConnections,
          synchronicity_patterns: part2Data.synchronicityPatterns,
          dream_themes: part2Data.dreamThemes,
          ancestral_connections: part2Data.ancestralConnections,
          intake_part2_completed_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      // Update beta metrics
      await supabase
        .from('beta_metrics')
        .upsert({
          user_id: userId,
          elemental_shift_patterns: part2Data.elementalResonance,
          archetypal_evolution: part2Data.archetypeConnections,
          synchronicity_frequency: part2Data.synchronicityPatterns ? 1 : 0
        });

      return true;
    } catch (error) {
      console.error('Error saving Part 2 data:', error);
      return false;
    }
  }
}