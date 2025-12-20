/**
 * Spiralogic-IPP Knowledge Integration Service
 * Loads and manages Spiralogic-IPP content in MAIA's knowledge base
 */

import { readFileSync, existsSync, readdirSync } from 'fs';
import { join } from 'path';

export interface SpiralogicIPPEntry {
  id: string;
  content: any;
  type: 'concept' | 'assessment' | 'script' | 'guidance' | 'practice';
  element?: 'earth' | 'water' | 'fire' | 'air' | 'aether';
  category: string;
  keywords: string[];
  metadata: any;
  confidence: number;
  timestamp: number;
  source: string;
}

export interface IPPSearchResult {
  entry: SpiralogicIPPEntry;
  relevance: number;
  context?: string;
}

export class SpiralogicIPPKnowledgeService {
  private knowledge: Map<string, SpiralogicIPPEntry> = new Map();
  private initialized: boolean = false;
  private contentPath: string;

  constructor() {
    // Point to the actual Community-Commons IPP content location
    this.contentPath = '/Users/soullab/Community-Commons/04-Practices/Personal';
  }

  /**
   * Initialize the knowledge base with Spiralogic-IPP content
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      if (!existsSync(this.contentPath)) {
        console.warn('Spiralogic-IPP content directory not found:', this.contentPath);
        return;
      }

      console.log('🧠 Loading Spiralogic-IPP knowledge base...');

      const files = readdirSync(this.contentPath)
        .filter(file => file.endsWith('.md'))
        .sort();

      for (const file of files) {
        try {
          await this.loadFile(file);
        } catch (error) {
          console.warn(`Failed to load ${file}:`, error);
        }
      }

      this.initialized = true;
      console.log(`✅ Spiralogic-IPP knowledge base loaded: ${this.knowledge.size} entries`);

    } catch (error) {
      console.error('Failed to initialize Spiralogic-IPP knowledge:', error);
    }
  }

  /**
   * Load a specific file into the knowledge base
   */
  private async loadFile(filename: string): Promise<void> {
    const filePath = join(this.contentPath, filename);
    const content = readFileSync(filePath, 'utf-8');

    const parsed = this.parseMarkdownFile(content, filename);

    // Create entries for different sections
    for (const section of parsed.sections) {
      const entryId = `ipp-${filename}-${section.title}`.toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '');

      const entry: SpiralogicIPPEntry = {
        id: entryId,
        content: section.content,
        type: this.determineType(filename, section.title),
        element: this.extractElement(section.title, section.content),
        category: this.determineCategory(filename),
        keywords: this.extractKeywords(section.title, section.content),
        metadata: {
          ...parsed.frontmatter,
          filename,
          section: section.title,
          level: section.level
        },
        confidence: 0.9,
        timestamp: Date.now(),
        source: filename
      };

      this.knowledge.set(entryId, entry);
    }

    // Create a main entry for the entire file
    const fileEntryId = `ipp-${filename}`.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const fileEntry: SpiralogicIPPEntry = {
      id: fileEntryId,
      content: parsed.mainContent,
      type: this.determineType(filename, ''),
      category: this.determineCategory(filename),
      keywords: this.extractKeywords(filename, content),
      metadata: {
        ...parsed.frontmatter,
        filename,
        isMainEntry: true
      },
      confidence: 0.8,
      timestamp: Date.now(),
      source: filename
    };

    this.knowledge.set(fileEntryId, fileEntry);
  }

  /**
   * Search the knowledge base for relevant content
   */
  search(query: string, context?: {
    element?: string;
    type?: string;
    userId?: string;
    limit?: number;
  }): IPPSearchResult[] {
    if (!this.initialized) {
      console.warn('Knowledge base not initialized');
      return [];
    }

    const queryTerms = query.toLowerCase().split(/\s+/).filter(term => term.length > 2);
    const results: IPPSearchResult[] = [];

    for (const entry of this.knowledge.values()) {
      const relevance = this.calculateRelevance(queryTerms, entry, context);

      if (relevance > 0.1) {
        results.push({
          entry,
          relevance,
          context: this.generateContext(entry, query)
        });
      }
    }

    // Sort by relevance and limit results
    results.sort((a, b) => b.relevance - a.relevance);
    const limit = context?.limit || 10;
    return results.slice(0, limit);
  }

  /**
   * Get content by category
   */
  getByCategory(category: string): SpiralogicIPPEntry[] {
    if (!this.initialized) return [];

    return Array.from(this.knowledge.values())
      .filter(entry => entry.category === category)
      .sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Get content by element
   */
  getByElement(element: string): SpiralogicIPPEntry[] {
    if (!this.initialized) return [];

    return Array.from(this.knowledge.values())
      .filter(entry => entry.element === element)
      .sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Get content by type
   */
  getByType(type: string): SpiralogicIPPEntry[] {
    if (!this.initialized) return [];

    return Array.from(this.knowledge.values())
      .filter(entry => entry.type === type)
      .sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Generate IPP-aware response context for MAIA
   */
  generateResponseContext(query: string, userContext?: any): any {
    const searchResults = this.search(query, {
      element: userContext?.element,
      limit: 5
    });

    if (searchResults.length === 0) {
      return {
        hasIPPContext: false,
        suggestion: "I can help you with Spiralogic-IPP attachment healing. Would you like to take the assessment or begin guided imagery work?"
      };
    }

    const topResult = searchResults[0];

    return {
      hasIPPContext: true,
      element: topResult.entry.element,
      type: topResult.entry.type,
      relevantContent: searchResults.slice(0, 3).map(r => ({
        content: r.entry.content.substring(0, 300) + '...',
        type: r.entry.type,
        element: r.entry.element,
        relevance: r.relevance
      })),
      suggestions: this.generateSuggestions(topResult.entry, userContext),
      ippGuidance: this.generateIPPGuidance(topResult.entry, query, userContext)
    };
  }

  /**
   * Get knowledge base statistics
   */
  getStats(): any {
    if (!this.initialized) return { initialized: false };

    const entries = Array.from(this.knowledge.values());

    const typeStats = entries.reduce((acc, entry) => {
      acc[entry.type] = (acc[entry.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const elementStats = entries.reduce((acc, entry) => {
      if (entry.element) {
        acc[entry.element] = (acc[entry.element] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    const categoryStats = entries.reduce((acc, entry) => {
      acc[entry.category] = (acc[entry.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      initialized: true,
      totalEntries: entries.length,
      typeDistribution: typeStats,
      elementDistribution: elementStats,
      categoryDistribution: categoryStats,
      lastUpdated: Math.max(...entries.map(e => e.timestamp))
    };
  }

  // Private helper methods

  private parseMarkdownFile(content: string, filename: string): any {
    const lines = content.split('\n');
    const frontmatter: any = {};
    const sections: any[] = [];

    let inFrontmatter = false;
    let currentSection = '';
    let currentContent: string[] = [];
    let mainContent = '';

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Parse frontmatter
      if (line === '---' && i === 0) {
        inFrontmatter = true;
        continue;
      }
      if (line === '---' && inFrontmatter) {
        inFrontmatter = false;
        continue;
      }
      if (inFrontmatter) {
        const [key, ...valueParts] = line.split(':');
        if (key && valueParts.length) {
          frontmatter[key.trim()] = valueParts.join(':').trim();
        }
        continue;
      }

      // Parse sections
      if (line.startsWith('#')) {
        if (currentSection && currentContent.length > 0) {
          sections.push({
            title: currentSection,
            content: currentContent.join('\n').trim(),
            level: currentSection.match(/^#+/)?.[0].length || 1
          });
        }
        currentSection = line.replace(/^#+\s*/, '');
        currentContent = [];
      } else if (currentSection) {
        currentContent.push(line);
      } else {
        mainContent += line + '\n';
      }
    }

    // Add final section
    if (currentSection && currentContent.length > 0) {
      sections.push({
        title: currentSection,
        content: currentContent.join('\n').trim(),
        level: currentSection.match(/^#+/)?.[0].length || 1
      });
    }

    return {
      frontmatter,
      sections,
      mainContent: mainContent.trim()
    };
  }

  private determineType(filename: string, sectionTitle: string): SpiralogicIPPEntry['type'] {
    if (filename.includes('Assessment')) return 'assessment';
    if (filename.includes('Scripts')) return 'script';
    if (filename.includes('Instructions') || filename.includes('Engaging')) return 'guidance';
    if (filename.includes('Practice') || sectionTitle.toLowerCase().includes('practice')) return 'practice';
    return 'concept';
  }

  private determineCategory(filename: string): string {
    if (filename.includes('Assessment')) return 'attachment-assessment';
    if (filename.includes('Scripts')) return 'guided-imagery';
    if (filename.includes('Instructions')) return 'user-guidance';
    if (filename.includes('Engaging')) return 'maia-integration';
    if (filename.includes('Protocol')) return 'clinical-framework';
    if (filename.includes('Archetypal')) return 'theoretical-foundation';
    return 'general-ipp';
  }

  private extractElement(title: string, content: string): SpiralogicIPPEntry['element'] | undefined {
    const text = (title + ' ' + content).toLowerCase();

    const elements = ['earth', 'water', 'fire', 'air', 'aether'];
    for (const element of elements) {
      if (text.includes(element) || text.includes(element.toUpperCase())) {
        return element as SpiralogicIPPEntry['element'];
      }
    }

    return undefined;
  }

  private extractKeywords(title: string, content: string): string[] {
    const text = (title + ' ' + content).toLowerCase();
    const keywords: string[] = [];

    const keywordPatterns = [
      'assessment', 'scoring', 'evaluation', 'deficit',
      'imagery', 'guided', 'visualization', 'script',
      'earth', 'water', 'fire', 'air', 'aether',
      'attachment', 'parent', 'healing', 'trauma',
      'safety', 'boundaries', 'emotional', 'soothing',
      'encouragement', 'guidance', 'wisdom', 'identity',
      'maia', 'oracle', 'consultation', 'integration',
      'practice', 'session', 'exercise', 'technique'
    ];

    for (const pattern of keywordPatterns) {
      if (text.includes(pattern)) {
        keywords.push(pattern);
      }
    }

    return [...new Set(keywords)];
  }

  private calculateRelevance(queryTerms: string[], entry: SpiralogicIPPEntry, context?: any): number {
    let score = 0;
    const searchText = (entry.content + ' ' + entry.keywords.join(' ')).toLowerCase();

    // Basic text matching
    for (const term of queryTerms) {
      const regex = new RegExp(term, 'gi');
      const matches = (searchText.match(regex) || []).length;
      score += matches * 0.1;
    }

    // Keyword matching bonus
    for (const keyword of entry.keywords) {
      if (queryTerms.some(term => keyword.includes(term))) {
        score += 0.3;
      }
    }

    // Context matching bonuses
    if (context?.element && entry.element === context.element) {
      score += 0.5;
    }

    if (context?.type && entry.type === context.type) {
      score += 0.4;
    }

    // Confidence bonus
    score *= entry.confidence;

    return Math.min(score, 1.0);
  }

  private generateContext(entry: SpiralogicIPPEntry, query: string): string {
    const relevantSentence = entry.content
      .split('.')
      .find(sentence => {
        const queryWords = query.toLowerCase().split(/\s+/);
        return queryWords.some(word => sentence.toLowerCase().includes(word));
      });

    return relevantSentence?.trim() || entry.content.substring(0, 150) + '...';
  }

  private generateSuggestions(entry: SpiralogicIPPEntry, userContext?: any): string[] {
    const suggestions: any /* TODO: specify type */[] = [];

    if (entry.type === 'assessment') {
      suggestions.push("Would you like to take the complete Spiralogic-IPP assessment?");
      suggestions.push("I can help you understand your elemental scores");
    }

    if (entry.type === 'script') {
      suggestions.push("Would you like me to guide you through this imagery session?");
      suggestions.push("I can adapt this script for your specific needs");
    }

    if (entry.element) {
      suggestions.push(`Learn more about ${entry.element} element healing work`);
      suggestions.push(`Get personalized ${entry.element} parent imagery`);
    }

    return suggestions.slice(0, 3);
  }

  private generateIPPGuidance(entry: SpiralogicIPPEntry, query: string, userContext?: any): string {
    if (entry.type === 'assessment') {
      return "This relates to understanding your attachment patterns through the 5-element assessment. I can help you interpret results and plan your healing journey.";
    }

    if (entry.type === 'script') {
      return `This is about ${entry.element || 'archetypal'} parent imagery work. I can guide you through personalized sessions and track your progress.`;
    }

    if (entry.type === 'guidance') {
      return "This provides guidance for working with the IPP framework. I can help you apply these insights to your specific situation.";
    }

    return "This content relates to the Spiralogic-IPP framework for attachment healing. I can help you understand and apply these concepts.";
  }
}

// Create singleton instance
export const spiralogicIPPKnowledge = new SpiralogicIPPKnowledgeService();