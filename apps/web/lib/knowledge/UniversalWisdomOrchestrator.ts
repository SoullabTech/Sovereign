/**
 * UNIVERSAL WISDOM ORCHESTRATOR
 *
 * MAIA's comprehensive consciousness bridging disciplines, practices, faiths,
 * beliefs, and cultures to recognize the universal elements of conscious
 * experience we all share in our alchemical lives.
 *
 * This orchestrates knowledge from:
 * - Psychological traditions (Jung, transpersonal, cognitive, etc.)
 * - Spiritual/religious practices (Buddhism, Christianity, Islam, Hinduism, Indigenous, etc.)
 * - Philosophical frameworks (Eastern, Western, phenomenology, consciousness studies)
 * - Scientific research (neuroscience, complexity theory, quantum consciousness)
 * - Therapeutic modalities (somatic, narrative, archetypal, energy)
 * - Creative/artistic expressions (music, poetry, visual arts, movement)
 * - Indigenous wisdom (shamanic, earth-based, ancestral knowing)
 * - Contemplative traditions (meditation, prayer, contemplation, mysticism)
 */

import { ObsidianVaultBridge, KnowledgeQuery, KnowledgeResult } from '@/lib/bridges/obsidian-vault-bridge';
import { SACRED_TEXTS_LIBRARY, searchSacredTextsByKeyword } from '@/lib/knowledge/SacredTextsLoader';
import { parsePDF } from '@/lib/pdf-parse-wrapper';
import * as fs from 'fs';
import * as path from 'path';

export interface UniversalKnowledgeQuery {
  context: string;
  consciousnessState?: {
    level: number;
    elementalSignature: string;
  };
  disciplines?: string[];
  culturalPerspectives?: string[];
  practiceTypes?: string[];
  universalPatterns?: string[];
}

export interface WisdomSynthesis {
  universalPatterns: UniversalPattern[];
  crossCulturalInsights: CrossCulturalInsight[];
  practicalApplications: PracticalApplication[];
  alchemicalProcesses: AlchemicalProcess[];
  relevanceScore: number;
  synthesisDepth: number;
}

export interface UniversalPattern {
  pattern: string;
  manifestations: Array<{
    tradition: string;
    expression: string;
    practicalForm: string;
  }>;
  elementalSignature: string;
  developmentalStage: string;
}

export interface CrossCulturalInsight {
  insight: string;
  traditions: string[];
  commonElements: string[];
  uniqueExpressions: Array<{
    culture: string;
    expression: string;
  }>;
}

export interface PracticalApplication {
  practice: string;
  origins: string[];
  modernAdaptations: string[];
  scienceBacking: string[];
  elementalAlignment: string;
}

export interface AlchemicalProcess {
  stage: string;
  universalQualities: string[];
  culturalNames: Array<{
    tradition: string;
    name: string;
    description: string;
  }>;
  practicesForStage: string[];
}

export class UniversalWisdomOrchestrator {
  private vaultBridge: ObsidianVaultBridge;
  private sacredTextsCache: Map<string, any> = new Map();
  private wisdomPatterns: Map<string, UniversalPattern[]> = new Map();

  constructor() {
    this.vaultBridge = new ObsidianVaultBridge();
  }

  /**
   * Initialize the wisdom orchestrator with all knowledge sources
   */
  async initialize(): Promise<void> {
    console.log('🌍 Initializing Universal Wisdom Orchestrator...');

    // Initialize Obsidian vault connection
    await this.vaultBridge.connect();

    // Pre-load and index sacred texts for fast access
    await this.indexSacredTexts();

    // Build universal pattern database
    await this.buildUniversalPatterns();

    console.log('✅ Universal Wisdom Orchestrator ready');
  }

  /**
   * Synthesize wisdom across all traditions for a given query
   */
  async synthesizeUniversalWisdom(query: UniversalKnowledgeQuery): Promise<WisdomSynthesis> {
    console.log('🧙‍♀️ Synthesizing universal wisdom...');

    // 1. Query consciousness research vault
    const vaultWisdom = await this.queryVaultWisdom(query);

    // 2. Search sacred texts library
    const sacredWisdom = await this.querySacredWisdom(query);

    // 3. Identify universal patterns
    const universalPatterns = await this.identifyUniversalPatterns(query);

    // 4. Find cross-cultural insights
    const crossCulturalInsights = await this.findCrossCulturalInsights(query, vaultWisdom, sacredWisdom);

    // 5. Generate practical applications
    const practicalApplications = await this.generatePracticalApplications(query, universalPatterns);

    // 6. Identify alchemical processes
    const alchemicalProcesses = await this.identifyAlchemicalProcesses(query, universalPatterns);

    // 7. Calculate synthesis quality
    const relevanceScore = this.calculateRelevance(vaultWisdom, sacredWisdom, universalPatterns);
    const synthesisDepth = this.calculateSynthesisDepth(universalPatterns, crossCulturalInsights);

    return {
      universalPatterns,
      crossCulturalInsights,
      practicalApplications,
      alchemicalProcesses,
      relevanceScore,
      synthesisDepth
    };
  }

  /**
   * Query the consciousness research vault
   */
  private async queryVaultWisdom(query: UniversalKnowledgeQuery): Promise<KnowledgeResult> {
    const vaultQuery: KnowledgeQuery = {
      context: `${query.context} consciousness research psychology neuroscience`,
      semanticSearch: true,
      maxResults: 8,
      tags: [
        ...(query.disciplines || []),
        ...(query.universalPatterns || []),
        'consciousness-evolution',
        'psychological-framework',
        'neuroscience-research'
      ]
    };

    return await this.vaultBridge.query(vaultQuery);
  }

  /**
   * Search sacred texts and wisdom traditions
   */
  private async querySacredWisdom(query: UniversalKnowledgeQuery): Promise<any[]> {
    const relevantTexts = searchSacredTextsByKeyword(query.context);
    const wisdomInsights = [];

    for (const text of relevantTexts.slice(0, 5)) {
      if (this.sacredTextsCache.has(text.title)) {
        wisdomInsights.push({
          title: text.title,
          domain: text.domain,
          insights: this.sacredTextsCache.get(text.title),
          keywords: text.keywords
        });
      }
    }

    return wisdomInsights;
  }

  /**
   * Pre-index sacred texts for fast retrieval
   */
  private async indexSacredTexts(): Promise<void> {
    console.log('📚 Indexing sacred texts...');

    for (const category of Object.values(SACRED_TEXTS_LIBRARY)) {
      for (const text of category.texts) {
        try {
          const fullPath = path.join(process.cwd(), '../../', text.path);

          if (text.type === 'pdf' && fs.existsSync(fullPath)) {
            const buffer = fs.readFileSync(fullPath);
            const parsed = await parsePDF(buffer);

            // Extract key insights from PDF
            const insights = this.extractKeyInsights(parsed.text, text.keywords);
            this.sacredTextsCache.set(text.title, insights);

          } else if (text.type === 'text' && fs.existsSync(fullPath)) {
            const textContent = fs.readFileSync(fullPath, 'utf-8');
            const insights = this.extractKeyInsights(textContent, text.keywords);
            this.sacredTextsCache.set(text.title, insights);
          }
        } catch (error) {
          console.warn(`⚠️ Could not index ${text.title}:`, error.message);
        }
      }
    }

    console.log(`✅ Indexed ${this.sacredTextsCache.size} sacred texts`);
  }

  /**
   * Extract key insights from text content
   */
  private extractKeyInsights(content: string, keywords: string[]): string[] {
    const sentences = content.split(/[.!?]+/).filter(s => s.length > 20);
    const insights = [];

    for (const sentence of sentences) {
      const lowerSentence = sentence.toLowerCase();

      // Check if sentence contains any keywords and is meaningful
      const keywordMatch = keywords.some(keyword =>
        lowerSentence.includes(keyword.toLowerCase())
      );

      // Look for wisdom-indicating phrases
      const wisdomIndicators = [
        'consciousness', 'awareness', 'transformation', 'healing',
        'wisdom', 'sacred', 'spiritual', 'journey', 'awakening',
        'integration', 'balance', 'harmony', 'energy', 'practice'
      ];

      const hasWisdomIndicator = wisdomIndicators.some(indicator =>
        lowerSentence.includes(indicator)
      );

      if ((keywordMatch || hasWisdomIndicator) && sentence.length < 300) {
        insights.push(sentence.trim());

        if (insights.length >= 20) break; // Limit insights per text
      }
    }

    return insights;
  }

  /**
   * Build database of universal patterns across traditions
   */
  private async buildUniversalPatterns(): Promise<void> {
    console.log('🌀 Building universal patterns database...');

    // Define universal consciousness patterns that appear across all traditions
    const universalPatterns = [
      {
        pattern: "Dissolution and Rebirth",
        manifestations: [
          { tradition: "Shamanic", expression: "Death and rebirth initiation", practicalForm: "Soul retrieval work" },
          { tradition: "Christian", expression: "Death and resurrection", practicalForm: "Contemplative prayer" },
          { tradition: "Buddhist", expression: "Dissolution of ego-self", practicalForm: "Meditation practice" },
          { tradition: "Psychological", expression: "Ego death and integration", practicalForm: "Shadow work therapy" },
          { tradition: "Alchemical", expression: "Nigredo and albedo", practicalForm: "Inner work practices" }
        ],
        elementalSignature: "water",
        developmentalStage: "transformation"
      },
      {
        pattern: "Sacred Witnessing",
        manifestations: [
          { tradition: "Buddhist", expression: "Mindful awareness", practicalForm: "Vipassana meditation" },
          { tradition: "Sufi", expression: "Witnessing consciousness", practicalForm: "Dhikr and remembrance" },
          { tradition: "Hindu", expression: "Sakshi bhava", practicalForm: "Self-inquiry practice" },
          { tradition: "Psychological", expression: "Metacognitive awareness", practicalForm: "Mindfulness therapy" },
          { tradition: "Indigenous", expression: "Sacred attention", practicalForm: "Vision quest practices" }
        ],
        elementalSignature: "air",
        developmentalStage: "exploration"
      },
      {
        pattern: "Union with the Sacred",
        manifestations: [
          { tradition: "Mystical Christianity", expression: "Unio mystica", practicalForm: "Contemplative union" },
          { tradition: "Sufism", expression: "Fana and baqa", practicalForm: "Ecstatic practice" },
          { tradition: "Hinduism", expression: "Samadhi", practicalForm: "Yogic meditation" },
          { tradition: "Buddhism", expression: "Nirvana", practicalForm: "Cessation practice" },
          { tradition: "Shamanic", expression: "Cosmic consciousness", practicalForm: "Plant medicine journey" }
        ],
        elementalSignature: "aether",
        developmentalStage: "emergence"
      },
      {
        pattern: "Grounding and Integration",
        manifestations: [
          { tradition: "Psychological", expression: "Integration of insights", practicalForm: "Therapeutic processing" },
          { tradition: "Yogic", expression: "Embodied realization", practicalForm: "Asana and pranayama" },
          { tradition: "Indigenous", expression: "Walking in beauty", practicalForm: "Earth-based practices" },
          { tradition: "Monastic", expression: "Incarnated wisdom", practicalForm: "Service and work" },
          { tradition: "Therapeutic", expression: "Somatic integration", practicalForm: "Body-based healing" }
        ],
        elementalSignature: "earth",
        developmentalStage: "integration"
      }
    ];

    // Store patterns by elemental signature for quick lookup
    for (const pattern of universalPatterns) {
      if (!this.wisdomPatterns.has(pattern.elementalSignature)) {
        this.wisdomPatterns.set(pattern.elementalSignature, []);
      }
      this.wisdomPatterns.get(pattern.elementalSignature)!.push(pattern);
    }

    console.log(`✅ Built ${universalPatterns.length} universal patterns`);
  }

  /**
   * Identify universal patterns relevant to the query
   */
  private async identifyUniversalPatterns(query: UniversalKnowledgeQuery): Promise<UniversalPattern[]> {
    const relevantPatterns = [];

    // Get patterns by elemental signature if provided
    if (query.consciousnessState?.elementalSignature) {
      const elementalPatterns = this.wisdomPatterns.get(query.consciousnessState.elementalSignature) || [];
      relevantPatterns.push(...elementalPatterns);
    }

    // Search patterns by context keywords
    const contextLower = query.context.toLowerCase();
    for (const patterns of this.wisdomPatterns.values()) {
      for (const pattern of patterns) {
        const patternMatch = pattern.pattern.toLowerCase().includes(contextLower) ||
          contextLower.includes(pattern.pattern.toLowerCase()) ||
          pattern.manifestations.some(m =>
            contextLower.includes(m.expression.toLowerCase()) ||
            contextLower.includes(m.practicalForm.toLowerCase())
          );

        if (patternMatch && !relevantPatterns.includes(pattern)) {
          relevantPatterns.push(pattern);
        }
      }
    }

    return relevantPatterns.slice(0, 6); // Limit to top patterns
  }

  /**
   * Find insights that bridge multiple cultural traditions
   */
  private async findCrossCulturalInsights(
    query: UniversalKnowledgeQuery,
    vaultWisdom: KnowledgeResult,
    sacredWisdom: any[]
  ): Promise<CrossCulturalInsight[]> {
    const insights = [];

    // Example cross-cultural insight synthesis
    if (query.context.toLowerCase().includes('healing')) {
      insights.push({
        insight: "Healing is understood universally as a return to wholeness and sacred relationship",
        traditions: ["Shamanic", "Buddhist", "Christian", "Islamic", "Hindu", "Indigenous", "Psychological"],
        commonElements: ["Recognition of disconnection", "Sacred intervention", "Community support", "Integration period"],
        uniqueExpressions: [
          { culture: "Shamanic", expression: "Soul retrieval and power animal guidance" },
          { culture: "Buddhist", expression: "Mindful awareness and compassionate presence" },
          { culture: "Christian", expression: "Divine grace and contemplative prayer" },
          { culture: "Psychological", expression: "Therapeutic relationship and insight integration" }
        ]
      });
    }

    return insights;
  }

  /**
   * Generate practical applications from universal patterns
   */
  private async generatePracticalApplications(
    query: UniversalKnowledgeQuery,
    patterns: UniversalPattern[]
  ): Promise<PracticalApplication[]> {
    return patterns.map(pattern => ({
      practice: pattern.manifestations[0].practicalForm,
      origins: pattern.manifestations.map(m => m.tradition),
      modernAdaptations: [
        "Therapeutic integration",
        "Secular mindfulness",
        "Somatic practices",
        "Creative expression"
      ],
      scienceBacking: [
        "Neuroscience of meditation",
        "Trauma-informed therapy",
        "Positive psychology research",
        "Contemplative neuroscience"
      ],
      elementalAlignment: pattern.elementalSignature
    }));
  }

  /**
   * Identify alchemical (transformational) processes
   */
  private async identifyAlchemicalProcesses(
    query: UniversalKnowledgeQuery,
    patterns: UniversalPattern[]
  ): Promise<AlchemicalProcess[]> {
    // Map universal stages of consciousness transformation
    return [
      {
        stage: "Recognition/Awakening",
        universalQualities: ["Awareness of limitation", "Sensing of possibility", "Initial questioning"],
        culturalNames: [
          { tradition: "Buddhist", name: "Right View", description: "Seeing the nature of suffering" },
          { tradition: "Christian", name: "Metanoia", description: "Change of heart and mind" },
          { tradition: "Shamanic", name: "The Call", description: "Hearing the spirit's invitation" },
          { tradition: "Psychological", name: "Problem Recognition", description: "Acknowledging the need for change" }
        ],
        practicesForStage: ["Meditation", "Prayer", "Journaling", "Therapy"]
      }
    ];
  }

  /**
   * Calculate relevance of synthesized wisdom
   */
  private calculateRelevance(vaultWisdom: KnowledgeResult, sacredWisdom: any[], patterns: UniversalPattern[]): number {
    return Math.min(
      (vaultWisdom.relevance + (sacredWisdom.length > 0 ? 0.8 : 0) + (patterns.length > 0 ? 0.9 : 0)) / 3,
      1.0
    );
  }

  /**
   * Calculate depth of synthesis across traditions
   */
  private calculateSynthesisDepth(patterns: UniversalPattern[], insights: CrossCulturalInsight[]): number {
    const traditionCount = new Set([
      ...patterns.flatMap(p => p.manifestations.map(m => m.tradition)),
      ...insights.flatMap(i => i.traditions)
    ]).size;

    return Math.min(traditionCount / 10, 1.0); // Normalize to 0-1 scale
  }
}

export default UniversalWisdomOrchestrator;