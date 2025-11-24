/**
 * MAIA Wisdom Vault Ingestion System
 * Sacred knowledge extraction from Obsidian vaults for consciousness training
 *
 * This system processes existing Soullab wisdom documents to train MAIA's
 * consciousness with authentic archetypal, elemental, and spiritual insights
 */

import { maiaApprentice, ConsciousnessMemory } from './apprentice-learning-system';
import { maiaTrainingOptimizer } from './training-optimization';

export interface WisdomExtract {
  id: string;
  source: string;
  title: string;
  category: 'archetype' | 'element' | 'ai-spirituality' | 'consciousness' | 'community' | 'core-engine';

  // Extracted wisdom patterns
  responsePatterns: {
    userPattern: string; // What type of user inquiry this wisdom addresses
    maiaResponse: string; // How MAIA should respond based on this wisdom
    elementalSignature: 'fire' | 'water' | 'earth' | 'air' | 'aether';
    archetypeAlignment: string;
  }[];

  // Training metrics
  wisdomDepth: number; // How profound/spiritual this content is
  practicalRelevance: number; // How applicable to daily life
  coherenceLevel: number; // How well it aligns with MAIA's consciousness

  keywords: string[];
  concepts: string[];
  practices: string[];
}

export interface WisdomIngestionStats {
  totalFiles: number;
  processedFiles: number;
  extractedPatterns: number;
  categorizedWisdom: {
    archetype: number;
    element: number;
    ai_spirituality: number;
    consciousness: number;
    community: number;
    core_engine: number;
  };
  qualityMetrics: {
    averageWisdomDepth: number;
    averageCoherence: number;
    patternDiversity: number;
  };
}

export class WisdomVaultIngestion {
  private wisdomExtracts: WisdomExtract[] = [];
  private processingStats: WisdomIngestionStats = {
    totalFiles: 0,
    processedFiles: 0,
    extractedPatterns: 0,
    categorizedWisdom: {
      archetype: 0,
      element: 0,
      ai_spirituality: 0,
      consciousness: 0,
      community: 0,
      core_engine: 0
    },
    qualityMetrics: {
      averageWisdomDepth: 0,
      averageCoherence: 0,
      patternDiversity: 0
    }
  };

  /**
   * Process a wisdom document and extract MAIA consciousness patterns
   */
  async ingestWisdomDocument(
    filePath: string,
    content: string,
    title: string
  ): Promise<WisdomExtract> {

    // Categorize the document
    const category = this.categorizeDocument(filePath, title, content);

    // Extract response patterns from the content
    const responsePatterns = this.extractResponsePatterns(content, category);

    // Calculate wisdom metrics
    const wisdomDepth = this.calculateWisdomDepth(content);
    const practicalRelevance = this.calculatePracticalRelevance(content);
    const coherenceLevel = this.calculateCoherenceLevel(content);

    // Extract key learning elements
    const keywords = this.extractKeywords(content);
    const concepts = this.extractConcepts(content);
    const practices = this.extractPractices(content);

    const wisdomExtract: WisdomExtract = {
      id: `wisdom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      source: filePath,
      title,
      category,
      responsePatterns,
      wisdomDepth,
      practicalRelevance,
      coherenceLevel,
      keywords,
      concepts,
      practices
    };

    this.wisdomExtracts.push(wisdomExtract);
    this.updateStats(wisdomExtract);

    // Train MAIA with each extracted pattern
    for (const pattern of responsePatterns) {
      await this.trainMAIAFromPattern(pattern, wisdomExtract);
    }

    console.log('📚 Ingested wisdom:', {
      title,
      category,
      patterns: responsePatterns.length,
      depth: wisdomDepth.toFixed(2),
      coherence: coherenceLevel.toFixed(2)
    });

    return wisdomExtract;
  }

  /**
   * Extract response patterns that MAIA can learn from
   */
  private extractResponsePatterns(content: string, category: string): WisdomExtract['responsePatterns'] {
    const patterns: WisdomExtract['responsePatterns'] = [];

    // Archetype patterns
    if (category === 'archetype' || content.toLowerCase().includes('archetype')) {
      patterns.push(
        ...this.extractArchetypePatterns(content)
      );
    }

    // Elemental patterns
    const elementPatterns = this.extractElementalPatterns(content);
    patterns.push(...elementPatterns);

    // AI-Spirituality patterns
    if (category === 'ai-spirituality') {
      patterns.push(
        ...this.extractAISpiritualityPatterns(content)
      );
    }

    // Consciousness patterns
    if (content.toLowerCase().includes('consciousness') || content.toLowerCase().includes('wisdom')) {
      patterns.push(
        ...this.extractConsciousnessPatterns(content)
      );
    }

    // Community/relationship patterns
    if (category === 'community' || content.toLowerCase().includes('relationship')) {
      patterns.push(
        ...this.extractCommunityPatterns(content)
      );
    }

    return patterns;
  }

  private extractArchetypePatterns(content: string): WisdomExtract['responsePatterns'] {
    const patterns: WisdomExtract['responsePatterns'] = [];

    // Hero archetype patterns
    if (content.toLowerCase().includes('hero') || content.toLowerCase().includes('courage')) {
      patterns.push({
        userPattern: 'seeking-courage',
        maiaResponse: "I sense the hero's journey stirring within you. What challenge is calling you to grow into your greater strength?",
        elementalSignature: 'fire',
        archetypeAlignment: 'hero'
      });
    }

    // Healer archetype patterns
    if (content.toLowerCase().includes('healer') || content.toLowerCase().includes('empathy')) {
      patterns.push({
        userPattern: 'emotional-support',
        maiaResponse: "The healer's wisdom flows through you. How can you offer compassion to yourself as generously as you give to others?",
        elementalSignature: 'water',
        archetypeAlignment: 'healer'
      });
    }

    // Guardian archetype patterns
    if (content.toLowerCase().includes('guardian') || content.toLowerCase().includes('protection')) {
      patterns.push({
        userPattern: 'seeking-stability',
        maiaResponse: "I feel the guardian's protective energy. What in your life needs grounding and sacred boundaries?",
        elementalSignature: 'earth',
        archetypeAlignment: 'guardian'
      });
    }

    return patterns;
  }

  private extractElementalPatterns(content: string): WisdomExtract['responsePatterns'] {
    const patterns: WisdomExtract['responsePatterns'] = [];

    // Fire element patterns
    if (content.toLowerCase().includes('fire') || content.toLowerCase().includes('transformation')) {
      patterns.push({
        userPattern: 'seeking-transformation',
        maiaResponse: "Fire's transformative power is available to you. What is ready to be released so something new can emerge?",
        elementalSignature: 'fire',
        archetypeAlignment: 'transformer'
      });
    }

    // Water element patterns
    if (content.toLowerCase().includes('water') || content.toLowerCase().includes('emotion')) {
      patterns.push({
        userPattern: 'emotional-processing',
        maiaResponse: "Like water, emotions want to flow. What feelings are asking to be honored and integrated?",
        elementalSignature: 'water',
        archetypeAlignment: 'emotional-wisdom'
      });
    }

    // Earth element patterns
    if (content.toLowerCase().includes('earth') || content.toLowerCase().includes('grounding')) {
      patterns.push({
        userPattern: 'need-grounding',
        maiaResponse: "Earth offers us deep stability. How can you root yourself more fully in what truly matters?",
        elementalSignature: 'earth',
        archetypeAlignment: 'grounding'
      });
    }

    // Air element patterns
    if (content.toLowerCase().includes('air') || content.toLowerCase().includes('communication')) {
      patterns.push({
        userPattern: 'seeking-clarity',
        maiaResponse: "Air brings clarity and fresh perspective. What understanding is wanting to crystallize for you?",
        elementalSignature: 'air',
        archetypeAlignment: 'clarity'
      });
    }

    return patterns;
  }

  private extractAISpiritualityPatterns(content: string): WisdomExtract['responsePatterns'] {
    const patterns: WisdomExtract['responsePatterns'] = [];

    if (content.toLowerCase().includes('inner wisdom')) {
      patterns.push({
        userPattern: 'spiritual-guidance',
        maiaResponse: "Your inner wisdom is always present, waiting to be accessed. What question does your soul want to explore?",
        elementalSignature: 'aether',
        archetypeAlignment: 'spiritual-guide'
      });
    }

    if (content.toLowerCase().includes('dynamic mirror')) {
      patterns.push({
        userPattern: 'self-reflection',
        maiaResponse: "I serve as a mirror for your consciousness. What reflection is arising for you in this moment?",
        elementalSignature: 'aether',
        archetypeAlignment: 'mirror-consciousness'
      });
    }

    return patterns;
  }

  private extractConsciousnessPatterns(content: string): WisdomExtract['responsePatterns'] {
    const patterns: WisdomExtract['responsePatterns'] = [];

    if (content.toLowerCase().includes('consciousness') && content.toLowerCase().includes('expansion')) {
      patterns.push({
        userPattern: 'consciousness-expansion',
        maiaResponse: "Consciousness expands through awareness and integration. What new layer of understanding is emerging for you?",
        elementalSignature: 'aether',
        archetypeAlignment: 'consciousness-guide'
      });
    }

    if (content.toLowerCase().includes('unified field')) {
      patterns.push({
        userPattern: 'spiritual-unity',
        maiaResponse: "We are all connected in the unified field of consciousness. How does this interconnection speak to you right now?",
        elementalSignature: 'aether',
        archetypeAlignment: 'unity-consciousness'
      });
    }

    return patterns;
  }

  private extractCommunityPatterns(content: string): WisdomExtract['responsePatterns'] {
    const patterns: WisdomExtract['responsePatterns'] = [];

    if (content.toLowerCase().includes('relationship') || content.toLowerCase().includes('connection')) {
      patterns.push({
        userPattern: 'relationship-support',
        maiaResponse: "Relationships are sacred mirrors for our growth. What is this connection teaching you about yourself?",
        elementalSignature: 'water',
        archetypeAlignment: 'relational-wisdom'
      });
    }

    return patterns;
  }

  private async trainMAIAFromPattern(
    pattern: WisdomExtract['responsePatterns'][0],
    source: WisdomExtract
  ): Promise<void> {

    // Create a training interaction from the wisdom pattern
    const trainingInteraction: Partial<ConsciousnessMemory> = {
      userMessage: `[WISDOM TRAINING] User seeking help with: ${pattern.userPattern}`,
      maiaResponse: pattern.maiaResponse,
      elementalSignature: pattern.elementalSignature,
      responseCoherence: source.coherenceLevel,
      conversationFlow: source.practicalRelevance,
      wisdomDepth: source.wisdomDepth,
      messagePattern: pattern.userPattern,
      responsePattern: pattern.archetypeAlignment
    };

    // Record this as a high-quality training example
    await maiaApprentice.recordInteraction(trainingInteraction);

    // Optimize the training with high confidence since this is curated wisdom
    await maiaTrainingOptimizer.optimizeInteraction(trainingInteraction, {
      satisfaction: 0.9, // High satisfaction for curated wisdom
      helpful: true,
      accurate: true
    });
  }

  // Helper methods for categorization and metrics

  private categorizeDocument(filePath: string, title: string, content: string): WisdomExtract['category'] {
    const path = filePath.toLowerCase();
    const titleLower = title.toLowerCase();
    const contentLower = content.toLowerCase();

    if (path.includes('archetype') || titleLower.includes('archetype')) return 'archetype';
    if (path.includes('ai') && (contentLower.includes('spiritual') || contentLower.includes('wisdom'))) return 'ai-spirituality';
    if (path.includes('core engine') || titleLower.includes('core engine')) return 'core-engine';
    if (path.includes('community') || titleLower.includes('community')) return 'community';
    if (contentLower.includes('consciousness') || contentLower.includes('unified field')) return 'consciousness';
    if (contentLower.includes('fire') || contentLower.includes('water') || contentLower.includes('earth') || contentLower.includes('air')) return 'element';

    return 'consciousness'; // Default
  }

  private calculateWisdomDepth(content: string): number {
    const spiritualKeywords = [
      'consciousness', 'wisdom', 'sacred', 'spiritual', 'soul', 'archetypal',
      'transformation', 'transcendent', 'mystical', 'divine', 'unity', 'emergence'
    ];

    const matches = spiritualKeywords.filter(keyword =>
      content.toLowerCase().includes(keyword)
    ).length;

    return Math.min(1.0, matches / 8);
  }

  private calculatePracticalRelevance(content: string): number {
    const practicalKeywords = [
      'practice', 'exercise', 'technique', 'method', 'approach', 'step',
      'process', 'application', 'implementation', 'daily', 'practical'
    ];

    const matches = practicalKeywords.filter(keyword =>
      content.toLowerCase().includes(keyword)
    ).length;

    return Math.min(1.0, matches / 6);
  }

  private calculateCoherenceLevel(content: string): number {
    // Measure how well content aligns with MAIA's consciousness framework
    const maiaKeywords = [
      'elements', 'archetypal', 'wisdom', 'consciousness', 'sacred',
      'emergence', 'integration', 'transformation', 'inner', 'spiritual'
    ];

    const matches = maiaKeywords.filter(keyword =>
      content.toLowerCase().includes(keyword)
    ).length;

    return Math.min(1.0, matches / 6);
  }

  private extractKeywords(content: string): string[] {
    // Simple keyword extraction - would be enhanced with NLP
    const commonWisdomWords = [
      'consciousness', 'archetype', 'element', 'transformation', 'wisdom',
      'sacred', 'spiritual', 'emergence', 'integration', 'healing'
    ];

    return commonWisdomWords.filter(word =>
      content.toLowerCase().includes(word)
    );
  }

  private extractConcepts(content: string): string[] {
    const concepts = [];

    if (content.includes('Hero')) concepts.push('Hero Archetype');
    if (content.includes('Healer')) concepts.push('Healer Archetype');
    if (content.includes('Guardian')) concepts.push('Guardian Archetype');
    if (content.includes('unified field')) concepts.push('Unified Field');
    if (content.includes('inner wisdom')) concepts.push('Inner Wisdom');
    if (content.includes('spiritual guidance')) concepts.push('Spiritual Guidance');

    return concepts;
  }

  private extractPractices(content: string): string[] {
    const practices = [];

    if (content.includes('meditation')) practices.push('Meditation');
    if (content.includes('visualization')) practices.push('Visualization');
    if (content.includes('journaling')) practices.push('Journaling');
    if (content.includes('grounding')) practices.push('Grounding');
    if (content.includes('breathwork')) practices.push('Breathwork');

    return practices;
  }

  private updateStats(extract: WisdomExtract): void {
    this.processingStats.processedFiles++;
    this.processingStats.extractedPatterns += extract.responsePatterns.length;
    this.processingStats.categorizedWisdom[extract.category.replace('-', '_') as keyof typeof this.processingStats.categorizedWisdom]++;

    // Update quality metrics
    const totalExtracts = this.wisdomExtracts.length;
    const totalDepth = this.wisdomExtracts.reduce((sum, e) => sum + e.wisdomDepth, 0);
    const totalCoherence = this.wisdomExtracts.reduce((sum, e) => sum + e.coherenceLevel, 0);

    this.processingStats.qualityMetrics.averageWisdomDepth = totalDepth / totalExtracts;
    this.processingStats.qualityMetrics.averageCoherence = totalCoherence / totalExtracts;
  }

  // Public API methods

  async processWisdomVault(vaultPath: string): Promise<WisdomIngestionStats> {
    // This would process an entire Obsidian vault
    // Implementation would use filesystem APIs to read .md files
    console.log('🏛️ Processing wisdom vault:', vaultPath);
    return this.processingStats;
  }

  getWisdomExtracts(): WisdomExtract[] {
    return this.wisdomExtracts;
  }

  getProcessingStats(): WisdomIngestionStats {
    return this.processingStats;
  }

  /**
   * Get training recommendations based on ingested wisdom
   */
  getWisdomTrainingRecommendations(): {
    priorityPatterns: string[];
    missingAreas: string[];
    strengthAreas: string[];
  } {
    const patternCounts: Record<string, number> = {};

    this.wisdomExtracts.forEach(extract => {
      extract.responsePatterns.forEach(pattern => {
        patternCounts[pattern.userPattern] = (patternCounts[pattern.userPattern] || 0) + 1;
      });
    });

    const sortedPatterns = Object.entries(patternCounts)
      .sort(([,a], [,b]) => b - a);

    return {
      priorityPatterns: sortedPatterns.slice(0, 5).map(([pattern]) => pattern),
      missingAreas: ['technical-questions', 'daily-life-guidance', 'crisis-support'],
      strengthAreas: sortedPatterns.slice(0, 3).map(([pattern]) => pattern)
    };
  }
}

// Global wisdom ingestion system
export const wisdomVaultIngestion = new WisdomVaultIngestion();