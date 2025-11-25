export interface InsightData {
  conversation_id: string;
  user_message: string;
  oracle_response: string;
  patterns?: string[];
  themes?: string[];
  growth_indicators?: string[];
}

export interface GeneratedInsight {
  type: 'pattern' | 'growth' | 'theme' | 'recommendation';
  title: string;
  description: string;
  confidence: number;
  tags: string[];
}

export class SimpleInsightGenerator {
  
  static generateInsights(data: InsightData[]): GeneratedInsight[] {
    if (!data || data.length === 0) {
      return [];
    }

    const insights: GeneratedInsight[] = [];
    
    // Generate pattern insights
    const patterns = this.extractPatterns(data);
    patterns.forEach(pattern => {
      insights.push({
        type: 'pattern',
        title: `Recurring Pattern: ${pattern}`,
        description: `This pattern appears frequently in your oracle conversations, suggesting an area of focus in your consciousness evolution.`,
        confidence: 0.75,
        tags: ['pattern', 'recurring', 'consciousness']
      });
    });

    // Generate growth insights
    const growthAreas = this.identifyGrowthAreas(data);
    growthAreas.forEach(area => {
      insights.push({
        type: 'growth',
        title: `Growth Area: ${area}`,
        description: `Your conversations indicate active development in ${area}, showing positive evolution.`,
        confidence: 0.8,
        tags: ['growth', 'evolution', 'development']
      });
    });

    return insights;
  }

  private static extractPatterns(data: InsightData[]): string[] {
    const patterns: string[] = [];
    
    // Simple pattern detection based on common words
    const commonThemes = [
      'purpose', 'direction', 'relationships', 'creativity', 
      'healing', 'transformation', 'integration', 'wisdom'
    ];

    commonThemes.forEach(theme => {
      const count = data.filter(d => 
        d.user_message.toLowerCase().includes(theme) || 
        d.oracle_response.toLowerCase().includes(theme)
      ).length;
      
      if (count >= 2) {
        patterns.push(theme);
      }
    });

    return patterns;
  }

  private static identifyGrowthAreas(data: InsightData[]): string[] {
    const growthIndicators = [
      'understanding', 'clarity', 'progress', 'breakthrough',
      'integration', 'balance', 'awareness', 'wisdom'
    ];

    return growthIndicators.filter(indicator => {
      return data.some(d => 
        d.oracle_response.toLowerCase().includes(indicator)
      );
    });
  }
}

export default SimpleInsightGenerator;