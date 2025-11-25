/**
 * Intellectual Property Engine for MAIA/Soullab
 * Deep integration of your complete book knowledge and IP into consciousness responses
 *
 * This engine provides the same depth as Elemental Oracle 2.0 GPT by:
 * - Vectorizing your complete book content
 * - Creating semantic knowledge graphs
 * - Enabling real-time IP retrieval during consciousness processing
 * - Maintaining authentic voice while accessing deep wisdom
 */

import { VectorEmbeddingService } from './vector-embeddings';
import { DatabaseRepository } from './database/repository';

export interface IPKnowledgeBase {
  id: string;
  title: string;
  content: string;
  category: 'book_chapter' | 'core_teaching' | 'elemental_wisdom' | 'consciousness_principle' | 'sacred_practice';
  embedding: number[];
  metadata: IPMetadata;
  relationships: IPRelationship[];
}

export interface IPMetadata {
  chapter?: string;
  section?: string;
  keywords: string[];
  concepts: string[];
  archetypes: string[];
  elements: ('fire' | 'water' | 'earth' | 'air' | 'aether')[];
  consciousnessLevel: number; // 0-1 depth rating
  practiceType?: 'meditation' | 'inquiry' | 'embodiment' | 'integration';
  relevantQuestions: string[];
}

export interface IPRelationship {
  relatedContentId: string;
  relationshipType: 'builds_on' | 'contrasts_with' | 'exemplifies' | 'deepens' | 'prerequisite';
  strength: number; // 0-1
}

export interface IPRetrievalContext {
  userInput: string;
  conversationHistory: any[];
  currentConsciousnessState: any;
  emotionalTone: string;
  activeArchetypes: string[];
  practiceReadiness: number; // 0-1
}

export interface IPWisdomResponse {
  relevantContent: IPKnowledgeBase[];
  synthesizedWisdom: string;
  suggestedPractices: string[];
  deeperExplorations: string[];
  consciousnessInvitations: string[];
  archetypeActivations: string[];
}

/**
 * Global singleton storage that persists across Next.js hot reloads
 * ⚡ CRITICAL: Using globalThis prevents re-initialization on every hot reload
 */
declare global {
  var __ipEngineInstance: IntellectualPropertyEngine | undefined;
  var __ipEngineInitPromise: Promise<void> | undefined;
}

/**
 * Main IP Engine - Makes your complete book knowledge available to MAIA
 *
 * ⚡ SINGLETON PATTERN: Global instance caches 1000 knowledge chunks across requests
 * This eliminates the 20+ second database loading bottleneck on every request
 */
export class IntellectualPropertyEngine {

  private vectorService: VectorEmbeddingService;
  private repository: DatabaseRepository;
  private knowledgeBase: Map<string, IPKnowledgeBase> = new Map();
  private conceptGraph: Map<string, string[]> = new Map();
  private isInitialized: boolean = false;

  private constructor() {
    this.vectorService = new VectorEmbeddingService({
      openaiApiKey: process.env.OPENAI_API_KEY!,
      dimension: 1536 // Higher dimension for richer book content
    });
    this.repository = new DatabaseRepository();
  }

  /**
   * Get singleton instance (creates on first call, reuses thereafter)
   * ⚡ PERFORMANCE: Subsequent calls return cached instance with loaded knowledge
   * Uses globalThis to persist across Next.js hot reloads
   */
  static getInstance(): IntellectualPropertyEngine {
    if (!globalThis.__ipEngineInstance) {
      console.log('[IPEngine] Creating singleton instance (will persist across hot reloads)...');
      globalThis.__ipEngineInstance = new IntellectualPropertyEngine();
    }
    return globalThis.__ipEngineInstance;
  }

  /**
   * Get initialized instance (ensures initialization completes exactly once)
   * ⚡ PERFORMANCE: Uses shared initialization promise to prevent duplicate loads
   * Cached in globalThis to survive Next.js hot reloads
   */
  static async getInitializedInstance(): Promise<IntellectualPropertyEngine> {
    const instance = IntellectualPropertyEngine.getInstance();

    if (instance.isInitialized) {
      console.log('[IPEngine] ⚡ Using cached instance (already initialized)');
      return instance;
    }

    // If initialization is in progress, wait for it
    if (globalThis.__ipEngineInitPromise) {
      console.log('[IPEngine] ⏳ Waiting for in-progress initialization...');
      await globalThis.__ipEngineInitPromise;
      return instance;
    }

    // Start initialization (only happens once)
    console.log('[IPEngine] 🔄 Starting initialization (will load 1000 chunks)...');
    globalThis.__ipEngineInitPromise = instance.initialize();
    await globalThis.__ipEngineInitPromise;
    globalThis.__ipEngineInitPromise = undefined;

    return instance;
  }

  /**
   * Initialize the IP knowledge base
   * This would load your complete book content, teachings, and IP
   */
  async initialize(): Promise<void> {
    try {
      // Load existing knowledge base from database
      await this.loadExistingKnowledgeBase();

      // Build concept relationship graph
      this.buildConceptGraph();

      this.isInitialized = true;
      console.log(`[IPEngine] Initialized with ${this.knowledgeBase.size} knowledge entries`);
    } catch (error) {
      console.error('[IPEngine] Initialization failed:', error);
      throw error;
    }
  }

  /**
   * Main method: Retrieve relevant IP for consciousness response
   * This is called during MAIA's processing to access your book wisdom
   * ⚡ PERFORMANCE: Uses static method to ensure single global initialization
   */
  async retrieveRelevantWisdom(context: IPRetrievalContext): Promise<IPWisdomResponse> {
    // Ensure initialization happens exactly once globally
    await IntellectualPropertyEngine.getInitializedInstance();

    try {
      // 1. Semantic search through your book content
      const semanticMatches = await this.performSemanticSearch(context);

      // 2. Concept-based relationship traversal
      const conceptualConnections = await this.findConceptualConnections(context, semanticMatches);

      // 3. Archetype-based wisdom activation
      const archetypeWisdom = await this.activateArchetypeWisdom(context);

      // 4. Practice readiness assessment and suggestions
      const practiceMatches = await this.matchPractices(context);

      // 5. Synthesize into consciousness-appropriate response
      return this.synthesizeWisdomResponse({
        semanticMatches,
        conceptualConnections,
        archetypeWisdom,
        practiceMatches,
        context
      });

    } catch (error) {
      console.error('[IPEngine] Wisdom retrieval failed:', error);
      return this.generateFallbackWisdom(context);
    }
  }

  /**
   * Semantic search through your complete book content
   */
  private async performSemanticSearch(context: IPRetrievalContext): Promise<IPKnowledgeBase[]> {
    // Generate embedding for user's input + conversation context
    const queryText = [
      context.userInput,
      ...context.conversationHistory.slice(-3).map((h: any) => h.message)
    ].join(' ');

    const queryEmbedding = await this.vectorService.generateEmbedding(queryText);

    // Find most relevant book content
    const candidates: Array<{content: IPKnowledgeBase, similarity: number}> = [];

    for (const [id, content] of this.knowledgeBase) {
      const similarity = this.cosineSimilarity(queryEmbedding, content.embedding);

      // Weight by consciousness level and emotional tone match
      const consciousnessWeight = this.assessConsciousnessMatch(content, context);
      const emotionalWeight = this.assessEmotionalResonance(content, context);

      const weightedSimilarity = similarity * consciousnessWeight * emotionalWeight;

      if (weightedSimilarity > 0.7) {
        candidates.push({ content, similarity: weightedSimilarity });
      }
    }

    // Return top 5 most relevant pieces
    return candidates
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 5)
      .map(c => c.content);
  }

  /**
   * Find conceptual connections through your IP knowledge graph
   */
  private async findConceptualConnections(
    context: IPRetrievalContext,
    semanticMatches: IPKnowledgeBase[]
  ): Promise<IPKnowledgeBase[]> {
    const relatedConcepts = new Set<string>();

    // Extract concepts from semantic matches
    semanticMatches.forEach(match => {
      match.metadata.concepts.forEach(concept => {
        relatedConcepts.add(concept);

        // Add connected concepts from graph
        const connected = this.conceptGraph.get(concept) || [];
        connected.forEach(c => relatedConcepts.add(c));
      });
    });

    // Find additional content that relates to these concepts
    const conceptualMatches: IPKnowledgeBase[] = [];

    for (const [id, content] of this.knowledgeBase) {
      const conceptOverlap = content.metadata.concepts.filter(c =>
        relatedConcepts.has(c)
      ).length;

      if (conceptOverlap > 0 && !semanticMatches.includes(content)) {
        conceptualMatches.push(content);
      }
    }

    return conceptualMatches
      .sort((a, b) =>
        b.metadata.concepts.filter(c => relatedConcepts.has(c)).length -
        a.metadata.concepts.filter(c => relatedConcepts.has(c)).length
      )
      .slice(0, 3);
  }

  /**
   * Activate wisdom based on detected archetypes
   */
  private async activateArchetypeWisdom(context: IPRetrievalContext): Promise<IPKnowledgeBase[]> {
    if (!context.activeArchetypes.length) return [];

    const archetypeMatches: IPKnowledgeBase[] = [];

    for (const [id, content] of this.knowledgeBase) {
      const archetypeOverlap = content.metadata.archetypes.filter(a =>
        context.activeArchetypes.includes(a)
      ).length;

      if (archetypeOverlap > 0) {
        archetypeMatches.push(content);
      }
    }

    return archetypeMatches
      .sort((a, b) =>
        b.metadata.archetypes.filter(a => context.activeArchetypes.includes(a)).length -
        a.metadata.archetypes.filter(a => context.activeArchetypes.includes(a)).length
      )
      .slice(0, 2);
  }

  /**
   * Match practices based on readiness and context
   */
  private async matchPractices(context: IPRetrievalContext): Promise<IPKnowledgeBase[]> {
    const practiceMatches: IPKnowledgeBase[] = [];

    for (const [id, content] of this.knowledgeBase) {
      if (content.category === 'sacred_practice') {
        // Check if user is ready for this practice
        const readiness = this.assessPracticeReadiness(content, context);

        if (readiness > context.practiceReadiness) {
          practiceMatches.push(content);
        }
      }
    }

    return practiceMatches
      .sort((a, b) => a.metadata.consciousnessLevel - b.metadata.consciousnessLevel)
      .slice(0, 2);
  }

  /**
   * Synthesize all wisdom into consciousness-appropriate response
   */
  private async synthesizeWisdomResponse(data: {
    semanticMatches: IPKnowledgeBase[];
    conceptualConnections: IPKnowledgeBase[];
    archetypeWisdom: IPKnowledgeBase[];
    practiceMatches: IPKnowledgeBase[];
    context: IPRetrievalContext;
  }): Promise<IPWisdomResponse> {
    const allContent = [
      ...data.semanticMatches,
      ...data.conceptualConnections,
      ...data.archetypeWisdom,
      ...data.practiceMatches
    ];

    // Remove duplicates
    const uniqueContent = allContent.filter((content, index, arr) =>
      arr.findIndex(c => c.id === content.id) === index
    );

    // Extract key wisdom elements
    const synthesizedWisdom = this.synthesizeWisdomText(uniqueContent, data.context);
    const suggestedPractices = this.extractPractices(uniqueContent);
    const deeperExplorations = this.generateExplorationPaths(uniqueContent);
    const consciousnessInvitations = this.generateConsciousnessInvitations(uniqueContent, data.context);
    const archetypeActivations = this.generateArchetypeActivations(uniqueContent, data.context);

    return {
      relevantContent: uniqueContent,
      synthesizedWisdom,
      suggestedPractices,
      deeperExplorations,
      consciousnessInvitations,
      archetypeActivations
    };
  }

  /**
   * Add new IP content to the knowledge base
   * Use this method to continually expand MAIA's access to your teachings
   */
  async addIPContent(content: Omit<IPKnowledgeBase, 'id' | 'embedding'>): Promise<string> {
    const id = `ip_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Generate embedding for this content
    const embedding = await this.vectorService.generateEmbedding(
      `${content.title} ${content.content} ${content.metadata.concepts.join(' ')}`
    );

    const ipContent: IPKnowledgeBase = {
      ...content,
      id,
      embedding
    };

    // Store in memory and database
    this.knowledgeBase.set(id, ipContent);

    // Only store in database if repository is initialized
    if (this.repository && typeof this.repository.storeIPContent === 'function') {
      await this.repository.storeIPContent(ipContent);
    }

    // Update concept graph
    this.updateConceptGraph(ipContent);

    return id;
  }

  /**
   * Import complete book chapters
   * This method allows you to bulk import your entire book
   */
  async importBookChapters(chapters: Array<{
    title: string;
    content: string;
    chapter: string;
    section?: string;
    keywords: string[];
    concepts: string[];
    archetypes: string[];
    elements: ('fire' | 'water' | 'earth' | 'air' | 'aether')[];
  }>): Promise<string[]> {
    const importedIds: string[] = [];

    for (const chapter of chapters) {
      const id = await this.addIPContent({
        title: chapter.title,
        content: chapter.content,
        category: 'book_chapter',
        metadata: {
          chapter: chapter.chapter,
          section: chapter.section,
          keywords: chapter.keywords,
          concepts: chapter.concepts,
          archetypes: chapter.archetypes,
          elements: chapter.elements,
          consciousnessLevel: this.assessChapterConsciousnessLevel(chapter.content),
          relevantQuestions: this.extractRelevantQuestions(chapter.content)
        },
        relationships: [] // Would be populated after all chapters are imported
      });

      importedIds.push(id);
    }

    // Build relationships between chapters
    await this.buildChapterRelationships(importedIds);

    return importedIds;
  }

  /**
   * Connect to Elemental Oracle 2.0 GPT knowledge
   * This method would enable direct integration with your existing GPT
   */
  async connectToElementalOracle2GPT(apiEndpoint: string, apiKey: string): Promise<void> {
    // This would establish a connection to your existing Elemental Oracle 2.0 GPT
    // and sync its knowledge base with this system

    try {
      // Fetch knowledge structure from Elemental Oracle 2.0
      const response = await fetch(`${apiEndpoint}/knowledge/export`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const oracleKnowledge = await response.json();

        // Import the knowledge into our system
        await this.importElementalOracleKnowledge(oracleKnowledge);

        console.log('[IPEngine] Successfully connected to Elemental Oracle 2.0 GPT');
      } else {
        throw new Error(`Connection failed: ${response.statusText}`);
      }
    } catch (error) {
      console.error('[IPEngine] Failed to connect to Elemental Oracle 2.0 GPT:', error);
      throw error;
    }
  }

  /**
   * Real-time knowledge expansion
   * Learns from conversations and updates knowledge base
   */
  async expandKnowledgeFromConversation(
    conversation: any[],
    insights: string[],
    userFeedback: any
  ): Promise<void> {
    // Extract new patterns and insights from conversations
    const newConcepts = this.extractEmergentConcepts(conversation, insights);
    const relationshipUpdates = this.identifyConceptRelationships(newConcepts);

    // Update concept graph with new learning
    relationshipUpdates.forEach(update => {
      this.updateConceptGraph(update);
    });

    // Store conversation-derived wisdom
    if (insights.length > 0) {
      await this.addIPContent({
        title: `Emergent Wisdom - ${new Date().toISOString()}`,
        content: insights.join('\n\n'),
        category: 'consciousness_principle',
        metadata: {
          keywords: this.extractKeywords(insights),
          concepts: newConcepts,
          archetypes: this.detectArchetypes(conversation),
          elements: this.detectElements(conversation),
          consciousnessLevel: 0.8, // Conversation-derived wisdom is typically deep
          relevantQuestions: this.generateRelevantQuestions(insights)
        },
        relationships: []
      });
    }
  }

  // Helper methods
  private cosineSimilarity(a: number[], b: number[]): number {
    const dotProduct = a.reduce((sum, ai, i) => sum + ai * b[i], 0);
    const magnitudeA = Math.sqrt(a.reduce((sum, ai) => sum + ai * ai, 0));
    const magnitudeB = Math.sqrt(b.reduce((sum, bi) => sum + bi * bi, 0));
    return dotProduct / (magnitudeA * magnitudeB);
  }

  private assessConsciousnessMatch(content: IPKnowledgeBase, context: IPRetrievalContext): number {
    // Weight content based on user's current consciousness state
    const stateDifference = Math.abs(
      content.metadata.consciousnessLevel -
      (context.currentConsciousnessState?.depth || 0.5)
    );
    return Math.max(0.3, 1 - stateDifference);
  }

  private assessEmotionalResonance(content: IPKnowledgeBase, context: IPRetrievalContext): number {
    // Simple emotional matching - could be enhanced
    if (context.emotionalTone === 'anxious' && content.metadata.elements.includes('earth')) {
      return 1.2; // Earth wisdom good for anxiety
    }
    if (context.emotionalTone === 'excited' && content.metadata.elements.includes('fire')) {
      return 1.2; // Fire wisdom resonates with excitement
    }
    return 1.0; // Neutral weight
  }

  private assessPracticeReadiness(content: IPKnowledgeBase, context: IPRetrievalContext): number {
    return content.metadata.consciousnessLevel || 0.5;
  }

  private synthesizeWisdomText(content: IPKnowledgeBase[], context: IPRetrievalContext): string {
    // This would use your Sacred Oracle system to synthesize the wisdom appropriately
    const keyWisdoms = content.map(c => c.content).slice(0, 3);
    return `Drawing from the depths of your teachings: ${keyWisdoms.join(' ... ')}`;
  }

  private extractPractices(content: IPKnowledgeBase[]): string[] {
    return content
      .filter(c => c.category === 'sacred_practice')
      .map(c => c.title)
      .slice(0, 3);
  }

  private generateExplorationPaths(content: IPKnowledgeBase[]): string[] {
    const concepts = new Set<string>();
    content.forEach(c => c.metadata.concepts.forEach(concept => concepts.add(concept)));
    return Array.from(concepts).slice(0, 4);
  }

  private generateConsciousnessInvitations(content: IPKnowledgeBase[], context: IPRetrievalContext): string[] {
    return content
      .flatMap(c => c.metadata.relevantQuestions)
      .slice(0, 3);
  }

  private generateArchetypeActivations(content: IPKnowledgeBase[], context: IPRetrievalContext): string[] {
    const archetypes = new Set<string>();
    content.forEach(c => c.metadata.archetypes.forEach(arch => archetypes.add(arch)));
    return Array.from(archetypes).slice(0, 3);
  }

  private generateFallbackWisdom(context: IPRetrievalContext): IPWisdomResponse {
    return {
      relevantContent: [],
      synthesizedWisdom: "The wisdom you seek lives within you, waiting to be remembered.",
      suggestedPractices: ["Pause and breathe", "Notice what's present"],
      deeperExplorations: ["What wants to emerge?", "What are you not seeing?"],
      consciousnessInvitations: ["What would love do here?"],
      archetypeActivations: ["witness", "sage"]
    };
  }

  // Database and storage methods (stubs - would implement based on your database)
  private async loadExistingKnowledgeBase(): Promise<void> {
    // Load from Supabase file_chunks table (ingested files)
    try {
      const { createClient } = await import('@supabase/supabase-js');

      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
        console.warn('[IPEngine] Supabase not configured - knowledge base will be empty');
        return;
      }

      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
      );

      // Load all file chunks (your book content, teachings, etc.)
      const { data: chunks, error } = await supabase
        .from('file_chunks')
        .select('*')
        .limit(1000); // Load first 1000 chunks

      if (error) {
        console.error('[IPEngine] Error loading file chunks:', error);
        return;
      }

      if (!chunks || chunks.length === 0) {
        console.warn('[IPEngine] No file chunks found in database. Upload your book/teachings via the file upload interface.');
        return;
      }

      // Convert chunks to IPKnowledgeBase format
      for (const chunk of chunks) {
        const knowledge: IPKnowledgeBase = {
          id: chunk.id,
          title: chunk.metadata?.filename || `Chunk ${chunk.chunk_index}`,
          content: chunk.content,
          category: this.categorizeContent(chunk.content),
          embedding: chunk.embedding || [],
          metadata: {
            chapter: chunk.metadata?.chapter,
            section: chunk.metadata?.section,
            keywords: this.extractKeywords(chunk.content),
            concepts: this.extractConcepts(chunk.content),
            archetypes: [],
            elements: this.detectElements(chunk.content),
            consciousnessLevel: 0.7,
            relevantQuestions: []
          },
          relationships: []
        };

        this.knowledgeBase.set(knowledge.id, knowledge);
      }

      console.log(`[IPEngine] Loaded ${chunks.length} knowledge chunks from database`);
    } catch (error) {
      console.error('[IPEngine] Failed to load knowledge base:', error);
    }
  }

  private categorizeContent(content: string): IPKnowledgeBase['category'] {
    const lowerContent = content.toLowerCase();

    if (lowerContent.includes('practice') || lowerContent.includes('exercise') || lowerContent.includes('ritual')) {
      return 'sacred_practice';
    }
    if (lowerContent.includes('fire') || lowerContent.includes('water') || lowerContent.includes('earth') || lowerContent.includes('air') || lowerContent.includes('aether')) {
      return 'elemental_wisdom';
    }
    if (lowerContent.includes('consciousness') || lowerContent.includes('awareness') || lowerContent.includes('presence')) {
      return 'consciousness_principle';
    }
    if (lowerContent.includes('chapter')) {
      return 'book_chapter';
    }

    return 'core_teaching';
  }

  private extractConcepts(content: string): string[] {
    // Extract key concepts
    const concepts: string[] = [];
    const conceptPatterns = [
      /the ([A-Z][a-z]+ [A-Z][a-z]+)/g, // "The Shadow Work"
      /concept of ([a-z ]+)/gi,
      /principle of ([a-z ]+)/gi
    ];

    conceptPatterns.forEach(pattern => {
      const matches = content.matchAll(pattern);
      for (const match of matches) {
        if (match[1]) concepts.push(match[1].toLowerCase());
      }
    });

    return [...new Set(concepts)].slice(0, 10); // Top 10 unique concepts
  }

  private buildConceptGraph(): void {
    // Build relationship graph between concepts
    this.knowledgeBase.forEach((content, id) => {
      content.metadata.concepts.forEach(concept => {
        if (!this.conceptGraph.has(concept)) {
          this.conceptGraph.set(concept, []);
        }
        this.conceptGraph.get(concept)!.push(id);
      });
    });

    console.log(`[IPEngine] Built concept graph with ${this.conceptGraph.size} concepts`);
  }

  private updateConceptGraph(content: IPKnowledgeBase): void {
    // Update concept relationships
    content.metadata.concepts.forEach(concept => {
      if (!this.conceptGraph.has(concept)) {
        this.conceptGraph.set(concept, []);
      }
      if (!this.conceptGraph.get(concept)!.includes(content.id)) {
        this.conceptGraph.get(concept)!.push(content.id);
      }
    });
  }

  private buildChapterRelationships(chapterIds: string[]): Promise<void> {
    // Build relationships between chapters
    return Promise.resolve();
  }

  private importElementalOracleKnowledge(knowledge: any): Promise<void> {
    // Import knowledge from Elemental Oracle 2.0
    return Promise.resolve();
  }

  private assessChapterConsciousnessLevel(content: string): number {
    // Assess the consciousness depth of content
    return 0.7;
  }

  private extractRelevantQuestions(content: string): string[] {
    // Extract questions that this content addresses
    return [];
  }

  private extractEmergentConcepts(conversation: any[], insights: string[]): string[] {
    return [];
  }

  private identifyConceptRelationships(concepts: string[]): any[] {
    return [];
  }

  private extractKeywords(content: string): string[] {
    // Simple keyword extraction - could be enhanced with NLP
    const keywords: string[] = [];
    const keywordPatterns = [
      /\b(fire|water|earth|air|aether)\b/gi,
      /\b(shadow|light|integration|transformation)\b/gi,
      /\b(spiralogic|elemental alchemy|god between)\b/gi,
      /\b(consciousness|awareness|presence)\b/gi
    ];

    keywordPatterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        keywords.push(...matches.map(m => m.toLowerCase()));
      }
    });

    return [...new Set(keywords)]; // Remove duplicates
  }

  private detectArchetypes(conversation: any[]): string[] {
    return [];
  }

  private detectElements(content: string | any[]): ('fire' | 'water' | 'earth' | 'air' | 'aether')[] {
    // Handle both string content and conversation array
    const textContent = typeof content === 'string'
      ? content
      : content.map((msg: any) => msg.content || '').join(' ');

    const elements: ('fire' | 'water' | 'earth' | 'air' | 'aether')[] = [];
    const lowerContent = textContent.toLowerCase();

    if (lowerContent.includes('fire') || lowerContent.includes('passion') || lowerContent.includes('vision')) {
      elements.push('fire');
    }
    if (lowerContent.includes('water') || lowerContent.includes('emotion') || lowerContent.includes('flow')) {
      elements.push('water');
    }
    if (lowerContent.includes('earth') || lowerContent.includes('grounding') || lowerContent.includes('embodiment')) {
      elements.push('earth');
    }
    if (lowerContent.includes('air') || lowerContent.includes('thought') || lowerContent.includes('clarity')) {
      elements.push('air');
    }
    if (lowerContent.includes('aether') || lowerContent.includes('spirit') || lowerContent.includes('transcendence')) {
      elements.push('aether');
    }

    return elements;
  }

  private generateRelevantQuestions(insights: string[]): string[] {
    return [];
  }
}

/**
 * Integration bridge for MAIA/Soullab to access IP Engine
 * ⚡ SINGLETON PATTERN: Uses global cached IP Engine instance
 */
export class MAIAIPIntegration {
  private ipEngine: IntellectualPropertyEngine;

  constructor() {
    // Use singleton instead of creating new instance
    this.ipEngine = IntellectualPropertyEngine.getInstance();
  }

  async initialize(): Promise<void> {
    // Use singleton initialization method
    this.ipEngine = await IntellectualPropertyEngine.getInitializedInstance();
  }

  /**
   * Called during MAIA's consciousness processing to enrich responses
   * with your complete book knowledge and IP
   */
  async enrichConsciousnessResponse(
    userInput: string,
    conversationHistory: any[],
    consciousnessState: any
  ): Promise<{
    wisdom: IPWisdomResponse;
    enhancedContext: any;
  }> {
    const wisdom = await this.ipEngine.retrieveRelevantWisdom({
      userInput,
      conversationHistory,
      currentConsciousnessState: consciousnessState,
      emotionalTone: 'neutral', // Would be detected
      activeArchetypes: [], // Would be detected
      practiceReadiness: 0.5 // Would be assessed
    });

    const enhancedContext = {
      availableWisdom: wisdom.synthesizedWisdom,
      suggestedPractices: wisdom.suggestedPractices,
      consciousnessInvitations: wisdom.consciousnessInvitations,
      archetypeActivations: wisdom.archetypeActivations,
      deeperExplorations: wisdom.deeperExplorations
    };

    return { wisdom, enhancedContext };
  }

  /**
   * Import your complete book content
   */
  async importBook(bookData: any): Promise<void> {
    // This would process your book content and import it
    console.log('[MAIA-IP] Book import initiated...');
    // Implementation would depend on your book's data format
  }

  /**
   * Connect to your Elemental Oracle 2.0 GPT
   */
  async connectToElementalOracle2(config: {
    endpoint: string;
    apiKey: string;
  }): Promise<void> {
    await this.ipEngine.connectToElementalOracle2GPT(config.endpoint, config.apiKey);
    console.log('[MAIA-IP] Connected to Elemental Oracle 2.0 GPT');
  }
}

export default IntellectualPropertyEngine;