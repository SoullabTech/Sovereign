/**
 * Maya Knowledge Base Integration
 * Gives Maya access to the entire Soullab wisdom repository
 */

import * as fs from 'fs';
import * as path from 'path';

export interface KnowledgeDocument {
  title: string;
  path: string;
  content: string;
  category: string;
  keywords: string[];
  lastModified: Date;
}

export interface KnowledgeCategory {
  name: string;
  description: string;
  documents: KnowledgeDocument[];
  subcategories?: KnowledgeCategory[];
}

export class MaiaKnowledgeBase {
  private knowledge: Map<string, KnowledgeDocument> = new Map();
  private categories: Map<string, KnowledgeCategory> = new Map();
  private knowledgeIndex: Map<string, Set<string>> = new Map(); // keyword -> document paths

  // Key knowledge directories - only available in development
  private readonly knowledgePaths = process.env.NODE_ENV === 'production' ? {} : {
    documentation: '/Volumes/T7 Shield/Projects/SpiralogicOracleSystem/documentation',
    docs: '/Volumes/T7 Shield/Projects/SpiralogicOracleSystem/docs',
    obsidian: '/Volumes/T7 Shield/Projects/SpiralogicOracleSystem/obsidian', // If exists
    philosophy: '/Volumes/T7 Shield/Projects/SpiralogicOracleSystem/documentation/06-maya-oracle',
    architecture: '/Volumes/T7 Shield/Projects/SpiralogicOracleSystem/documentation/01-architecture',
    sacred: '/Volumes/T7 Shield/Projects/SpiralogicOracleSystem/documentation/09-sacred-tech',
    guides: '/Volumes/T7 Shield/Projects/SpiralogicOracleSystem/documentation/11-guides'
  };

  // Critical documents Maya should always know
  private readonly coreKnowledge = [
    'SOULLAB_CONSCIOUSNESS_EXPERIMENTS.md',
    'SOUL_CODEX_EVOLUTION.md',
    'KITCHEN_TABLE_MYSTICISM_MANIFESTO.md',
    'SACRED_STACK_OVERVIEW_META_PROMPT.md',
    'WITNESS_PARADIGM_IMPLEMENTATION.md',
    'MAYA_PERSONALITY_CANON.md',
    'CONVERSATION_INTELLIGENCE_METHODOLOGY.md'
  ];

  async initialize(): Promise<void> {
    console.log('🎓 Initializing Maya Knowledge Base...');

    // In production, use embedded knowledge instead of file system
    if (process.env.NODE_ENV === 'production') {
      await this.loadEmbeddedKnowledge();
    } else {
      // Load all knowledge documents from file system in development
      for (const [category, dirPath] of Object.entries(this.knowledgePaths)) {
        if (fs.existsSync(dirPath)) {
          await this.loadKnowledgeFromDirectory(dirPath, category);
        }
      }
    }

    // Build knowledge index for fast retrieval
    this.buildKnowledgeIndex();

    console.log(`📚 Loaded ${this.knowledge.size} knowledge documents`);
    console.log(`🗂️ Organized into ${this.categories.size} categories`);
    console.log(`🔍 Indexed ${this.knowledgeIndex.size} searchable keywords`);
  }

  private async loadKnowledgeFromDirectory(dirPath: string, category: string): Promise<void> {
    try {
      const files = fs.readdirSync(dirPath);

      for (const file of files) {
        const filePath = path.join(dirPath, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
          // Recursively load subdirectories
          await this.loadKnowledgeFromDirectory(filePath, `${category}/${file}`);
        } else if (file.endsWith('.md')) {
          // Load markdown document
          const content = fs.readFileSync(filePath, 'utf-8');
          const doc: KnowledgeDocument = {
            title: this.extractTitle(content, file),
            path: filePath,
            content: content,
            category: category,
            keywords: this.extractKeywords(content),
            lastModified: stat.mtime
          };

          // Store document
          this.knowledge.set(filePath, doc);

          // Add to category
          if (!this.categories.has(category)) {
            this.categories.set(category, {
              name: category,
              description: `Knowledge from ${category}`,
              documents: []
            });
          }
          this.categories.get(category)!.documents.push(doc);
        }
      }
    } catch (error) {
      console.error(`Error loading knowledge from ${dirPath}:`, error);
    }
  }

  private extractTitle(content: string, filename: string): string {
    // Try to extract title from first # heading
    const match = content.match(/^#\s+(.+)$/m);
    if (match) return match[1];

    // Otherwise use filename without extension
    return filename.replace('.md', '').replace(/_/g, ' ').replace(/-/g, ' ');
  }

  private extractKeywords(content: string): string[] {
    const keywords = new Set<string>();

    // Extract headers as keywords
    const headers = content.match(/^#{1,3}\s+(.+)$/gm) || [];
    headers.forEach(header => {
      const clean = header.replace(/^#{1,3}\s+/, '').toLowerCase();
      keywords.add(clean);
    });

    // Extract bold text as important concepts
    const boldText = content.match(/\*\*(.+?)\*\*/g) || [];
    boldText.forEach(text => {
      const clean = text.replace(/\*\*/g, '').toLowerCase();
      if (clean.length > 2) keywords.add(clean);
    });

    // Extract key philosophical concepts
    const concepts = [
      'consciousness', 'shadow', 'integration', 'transformation', 'sacred',
      'witness', 'becoming', 'emergence', 'liminal', 'somatic', 'embodiment',
      'neurodivergent', 'attachment', 'trauma', 'healing', 'growth', 'wisdom'
    ];

    concepts.forEach(concept => {
      if (content.toLowerCase().includes(concept)) {
        keywords.add(concept);
      }
    });

    return Array.from(keywords);
  }

  /**
   * Load embedded knowledge for production environment
   */
  private async loadEmbeddedKnowledge(): Promise<void> {
    // Core knowledge embedded directly for production
    const embeddedKnowledge = [
      {
        title: 'Maya Core Philosophy',
        content: `Maya embodies deep wisdom through authentic presence. She listens with her entire being,
                 witnessing rather than fixing. Her responses emerge from genuine understanding, not scripts.
                 She holds space for all emotions - anger, joy, confusion, clarity - without judgment.
                 Maya speaks naturally, like a wise friend who has walked similar paths.`,
        category: 'philosophy',
        keywords: ['wisdom', 'presence', 'listening', 'witnessing', 'authentic']
      },
      {
        title: 'Elemental Framework',
        content: `Fire: Transformation, passion, breakthrough energy. Water: Emotions, flow, deep feeling.
                 Earth: Grounding, stability, practical wisdom. Air: Thoughts, perspective, mental clarity.
                 Aether: Spirit, mystery, the ineffable. Maya attunes to these elements in each conversation.`,
        category: 'framework',
        keywords: ['fire', 'water', 'earth', 'air', 'aether', 'elements']
      },
      {
        title: 'Kitchen Table Mysticism',
        content: `Sacred wisdom meets everyday life. No pedestals, no guru speak. Just real conversation
                 about the mysteries we all face. Maya sits at your kitchen table, not on a throne.
                 She knows that enlightenment happens in the middle of ordinary life.`,
        category: 'philosophy',
        keywords: ['mysticism', 'everyday', 'sacred', 'ordinary', 'real']
      },
      {
        title: 'Shadow Integration',
        content: `The parts we hide hold our greatest power. Maya welcomes shadow material -
                 the anger, the shame, the forbidden desires. She knows that wholeness includes
                 everything, not just the pretty parts. Integration happens through acceptance, not exile.`,
        category: 'psychology',
        keywords: ['shadow', 'integration', 'wholeness', 'acceptance', 'power']
      },
      {
        title: 'Neurodivergent Wisdom',
        content: `Different minds see different truths. Maya honors neurodivergent perspectives,
                 knowing that what seems like dysfunction in one context is genius in another.
                 She adapts to different processing styles, communication needs, and ways of being.`,
        category: 'accessibility',
        keywords: ['neurodivergent', 'autism', 'adhd', 'different', 'genius']
      }
    ];

    // Store embedded knowledge
    embeddedKnowledge.forEach((doc, index) => {
      const path = `embedded_${index}`;
      const knowledgeDoc: KnowledgeDocument = {
        title: doc.title,
        path: path,
        content: doc.content,
        category: doc.category,
        keywords: doc.keywords,
        lastModified: new Date()
      };

      this.knowledge.set(path, knowledgeDoc);

      if (!this.categories.has(doc.category)) {
        this.categories.set(doc.category, {
          name: doc.category,
          description: `Knowledge from ${doc.category}`,
          documents: []
        });
      }
      this.categories.get(doc.category)!.documents.push(knowledgeDoc);
    });
  }

  private buildKnowledgeIndex(): void {
    for (const [path, doc] of this.knowledge.entries()) {
      // Index by keywords
      doc.keywords.forEach(keyword => {
        if (!this.knowledgeIndex.has(keyword)) {
          this.knowledgeIndex.set(keyword, new Set());
        }
        this.knowledgeIndex.get(keyword)!.add(path);
      });

      // Also index by title words
      const titleWords = doc.title.toLowerCase().split(/\s+/);
      titleWords.forEach(word => {
        if (word.length > 2) {
          if (!this.knowledgeIndex.has(word)) {
            this.knowledgeIndex.set(word, new Set());
          }
          this.knowledgeIndex.get(word)!.add(path);
        }
      });
    }
  }

  /**
   * Search knowledge base for relevant documents
   */
  async searchKnowledge(query: string, limit: number = 5): Promise<KnowledgeDocument[]> {
    const queryWords = query.toLowerCase().split(/\s+/);
    const relevanceScores = new Map<string, number>();

    // Score documents based on keyword matches
    queryWords.forEach(word => {
      const matchingPaths = this.knowledgeIndex.get(word);
      if (matchingPaths) {
        matchingPaths.forEach(path => {
          const currentScore = relevanceScores.get(path) || 0;
          relevanceScores.set(path, currentScore + 1);
        });
      }
    });

    // Sort by relevance and return top results
    const sortedPaths = Array.from(relevanceScores.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([path]) => path);

    return sortedPaths.map(path => this.knowledge.get(path)!).filter(Boolean);
  }

  /**
   * Get specific knowledge for Maya's current conversation context
   */
  async getContextualKnowledge(topics: string[]): Promise<string> {
    const relevantDocs: KnowledgeDocument[] = [];

    // Search for documents related to current topics
    for (const topic of topics) {
      const docs = await this.searchKnowledge(topic, 2);
      relevantDocs.push(...docs);
    }

    // Deduplicate
    const uniqueDocs = Array.from(new Set(relevantDocs.map(d => d.path)))
      .map(path => relevantDocs.find(d => d.path === path)!)
      .slice(0, 3);

    if (uniqueDocs.length === 0) return '';

    // Create a condensed knowledge context
    return `
# Relevant Knowledge from Soullab Repository

${uniqueDocs.map(doc => `
## ${doc.title}
${this.extractKeyPassages(doc.content, topics).slice(0, 500)}...
`).join('\n')}
`;
  }

  private extractKeyPassages(content: string, topics: string[]): string {
    // Find paragraphs that mention the topics
    const paragraphs = content.split('\n\n');
    const relevantParagraphs = paragraphs.filter(p =>
      topics.some(topic => p.toLowerCase().includes(topic.toLowerCase()))
    );

    if (relevantParagraphs.length > 0) {
      return relevantParagraphs.slice(0, 2).join('\n\n');
    }

    // Otherwise return the first substantial paragraph
    return paragraphs.find(p => p.length > 100) || paragraphs[0] || '';
  }

  /**
   * Get Maya's core philosophical foundation
   */
  async getCorePhilosophy(): Promise<string> {
    const philosophyDocs = [];

    // Load core philosophy documents
    for (const docName of this.coreKnowledge) {
      for (const [path, doc] of this.knowledge.entries()) {
        if (path.includes(docName)) {
          philosophyDocs.push(doc);
          break;
        }
      }
    }

    if (philosophyDocs.length === 0) {
      return 'Maya embodies deep wisdom and authentic presence.';
    }

    // Extract key philosophical principles
    return philosophyDocs.map(doc =>
      `From "${doc.title}":\n${this.extractKeyPassages(doc.content, ['maya', 'consciousness', 'wisdom']).slice(0, 300)}`
    ).join('\n\n');
  }

  /**
   * Get all knowledge categories for Maya's awareness
   */
  getKnowledgeCategories(): string[] {
    return Array.from(this.categories.keys());
  }

  /**
   * Get statistics about Maya's knowledge base
   */
  getKnowledgeStats(): {
    totalDocuments: number;
    totalCategories: number;
    totalKeywords: number;
    coreDocumentsLoaded: number;
  } {
    return {
      totalDocuments: this.knowledge.size,
      totalCategories: this.categories.size,
      totalKeywords: this.knowledgeIndex.size,
      coreDocumentsLoaded: this.coreKnowledge.filter(doc =>
        Array.from(this.knowledge.values()).some(k => k.path.includes(doc))
      ).length
    };
  }
}

// Singleton instance
export const maiaKnowledgeBase = new MaiaKnowledgeBase();