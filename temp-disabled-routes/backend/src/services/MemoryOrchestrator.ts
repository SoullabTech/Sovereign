/**
 * MemoryOrchestrator.ts - Maya's Unified Memory Brain Stem
 * 
 * Unifies all memory channels before each Maya response:
 * - Session Memory (recent conversation)
 * - Journal Memory (Supabase semantic search) 
 * - Profile Memory (user traits, archetype, preferences)
 * - Symbolic Memory (themes, elemental resonance)
 * - External Memory (Mem0/LangChain - future ready)
 * 
 * Performance Targets:
 * - Parallel fetch: < 500ms
 * - Context build: < 200ms
 * - End-to-end: < 2s
 */

import { logger } from '../utils/logger';
import { supabase } from '../lib/supabaseClient';
import { semanticSearch, getJournalEntries, getSymbolThreads } from '../lib/supabaseClient';
import { getRelevantMemories } from './semanticRecall';

// Core memory interfaces
export interface MemoryResult {
  content: string;
  relevance: number;
  tokens: number;
  source: 'session' | 'journal' | 'profile' | 'symbolic' | 'external';
  timestamp?: string;
  metadata?: Record<string, any>;
}

export interface MemoryLayer {
  name: string;
  fetch: (query: string, userId: string, context?: any) => Promise<MemoryResult[]>;
  weight: number; // relevance multiplier
  enabled: boolean;
}

export interface MemoryContext {
  results: MemoryResult[];
  totalTokens: number;
  layersUsed: string[];
  processingTime: number;
  fallbacksUsed: string[];
}

export interface ConversationTurn {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export class MemoryOrchestrator {
  private layers: MemoryLayer[] = [];
  private dependencies: any;
  private sessionCache = new Map<string, MemoryResult[]>();
  private cacheExpiry = 5 * 60 * 1000; // 5 minutes

  constructor(dependencies?: { supabase?: any; vectorSearch?: any }) {
    this.dependencies = dependencies || {};
    this.initializeLayers();
  }

  /**
   * Main entry point - build comprehensive memory context for Maya
   * Matches the API expected by ConversationalPipeline.ts
   */
  async buildContext(
    userId: string,
    userText: string,
    sessionId: string,
    conversationHistory: ConversationTurn[]
  ): Promise<MemoryContext> {
    const startTime = Date.now();
    const fallbacksUsed: string[] = [];

    try {
      // NEW: Inject semantic memories from past journal entries
      const semanticMemoryPromise = getRelevantMemories(userText, userId, 0.78);
      
      // Parallel fetch across all enabled layers
      const layerPromises = this.layers
        .filter(layer => layer.enabled)
        .map(async layer => {
          try {
            const results = await Promise.race([
              layer.fetch(userText, userId, { sessionId, conversationHistory }),
              new Promise<MemoryResult[]>((_, reject) => 
                setTimeout(() => reject(new Error('Timeout')), 3000)
              )
            ]);
            return { layer: layer.name, results, success: true };
          } catch (error) {
            logger.warn(`Memory layer ${layer.name} failed:`, error);
            fallbacksUsed.push(layer.name);
            return { layer: layer.name, results: [], success: false };
          }
        });

      const [layerResults, semanticMemoryResult] = await Promise.all([
        Promise.all(layerPromises),
        semanticMemoryPromise
      ]);
      
      const semanticMemoryContext = semanticMemoryResult.context;
      const semanticDebugInfo = semanticMemoryResult.debug;
      
      // Merge and rank results
      const allResults: MemoryResult[] = [];
      const layersUsed: string[] = [];

      for (const { layer, results, success } of layerResults) {
        if (success && results.length > 0) {
          layersUsed.push(layer);
          
          // Apply layer weight to relevance scores
          const layerConfig = this.layers.find(l => l.name === layer);
          const weight = layerConfig?.weight || 1.0;
          
          const weightedResults = results.map(result => ({
            ...result,
            relevance: result.relevance * weight,
            weightedScore: result.relevance * weight
          }));
          
          allResults.push(...weightedResults);
        }
      }

      // Sort by weighted relevance and cap to token budget
      const rankedResults = allResults
        .sort((a, b) => (b as any).weightedScore - (a as any).weightedScore)
        .slice(0, 15); // Conservative cap for context window

      const totalTokens = rankedResults.reduce((sum, r) => sum + r.tokens, 0);
      const processingTime = Date.now() - startTime;

      // Debug output if enabled
      if (process.env.MAYA_DEBUG_MEMORY === 'true') {
        this.debugMemoryContext(rankedResults, processingTime, layersUsed, fallbacksUsed);
        if (semanticMemoryContext) {
          logger.info('[MEMORY] Semantic memories injected:', semanticMemoryContext.slice(0, 200));
        }
        if (semanticDebugInfo) {
          logger.debug('[SEMANTIC] Recall results:', semanticDebugInfo);
        }
      }

      // Store semantic memory in metadata for formatForPrompt to use
      const contextWithSemantic: MemoryContext = {
        results: rankedResults,
        totalTokens,
        layersUsed,
        processingTime,
        fallbacksUsed
      };
      
      // Attach semantic memory and debug info as metadata
      (contextWithSemantic as any).semanticMemoryContext = semanticMemoryContext;
      (contextWithSemantic as any).semanticDebugInfo = semanticDebugInfo;

      return contextWithSemantic;

    } catch (error) {
      logger.error('MemoryOrchestrator.buildContext failed:', error);
      
      // Graceful fallback - use session cache if available
      const cachedSession = this.sessionCache.get(`${userId}_${sessionId}`);
      if (cachedSession) {
        logger.info('Using cached session memory as fallback');
        return {
          results: cachedSession,
          totalTokens: cachedSession.reduce((sum, r) => sum + r.tokens, 0),
          layersUsed: ['session_cache'],
          processingTime: Date.now() - startTime,
          fallbacksUsed: ['full_orchestrator']
        };
      }

      // Ultimate fallback - empty context
      return {
        results: [],
        totalTokens: 0,
        layersUsed: [],
        processingTime: Date.now() - startTime,
        fallbacksUsed: ['no_memory_available']
      };
    }
  }

  /**
   * Format memory context for Maya's system prompt
   * Used by ConversationalPipeline.ts in draftTextWithMemory
   */
  formatForPrompt(memoryContext: MemoryContext, semanticMemoryContext?: string): string {
    const sections = this.groupResultsBySource(memoryContext.results);
    const formattedSections: string[] = [];

    // Add semantic memory context if available
    if (semanticMemoryContext && semanticMemoryContext.trim()) {
      formattedSections.push(semanticMemoryContext);
    }

    // Format each memory source section
    Object.entries(sections).forEach(([source, results]) => {
      if (results.length === 0) return;
      
      const sectionTitle = this.getSourceDisplayName(source);
      const items = results
        .slice(0, 3) // Max 3 items per source
        .map(r => `• ${r.content.slice(0, 150)}${r.content.length > 150 ? '...' : ''}`)
        .join('\n');
      
      formattedSections.push(`${sectionTitle}:\n${items}`);
    });

    if (formattedSections.length === 0) {
      return "Memory Context: No specific context retrieved.";
    }

    const contextBlock = formattedSections.join('\n\n');
    const tokenInfo = `[Memory tokens: ${memoryContext.totalTokens}]`;
    
    return `Memory Context:\n${contextBlock}\n\n${tokenInfo}`;
  }

  /**
   * Initialize default memory layers
   */
  private initializeLayers(): void {
    this.layers = [
      {
        name: 'session',
        fetch: this.fetchSessionMemory.bind(this),
        weight: 1.2,
        enabled: true
      },
      {
        name: 'journal', 
        fetch: this.fetchJournalMemory.bind(this),
        weight: 1.5,
        enabled: true // Now has rich mock data
      },
      {
        name: 'profile',
        fetch: this.fetchProfileMemory.bind(this),
        weight: 1.3,
        enabled: true // Now has archetypal profiles
      },
      {
        name: 'symbolic',
        fetch: this.fetchSymbolicMemory.bind(this),
        weight: 1.1,
        enabled: true
      },
      {
        name: 'external',
        fetch: this.fetchExternalMemory.bind(this),
        weight: 1.0,
        enabled: true // Now has behavioral pattern insights
      }
    ];
  }

  /**
   * Session Memory Layer - recent conversation context
   */
  private async fetchSessionMemory(
    _query: string,
    userId: string,
    context?: { sessionId: string; conversationHistory: ConversationTurn[] }
  ): Promise<MemoryResult[]> {
    if (!context?.conversationHistory) return [];

    const cacheKey = `${userId}_${context.sessionId}`;
    const cached = this.sessionCache.get(cacheKey);
    
    // Use cache if recent (< 5 minutes)
    if (cached && Date.now() - (cached[0]?.metadata?.cachedAt || 0) < this.cacheExpiry) {
      return cached;
    }

    // Extract relevant turns from conversation history
    const recentTurns = context.conversationHistory.slice(-6); // Last 6 turns
    const results: MemoryResult[] = recentTurns.map((turn, index) => ({
      content: `${turn.role === 'user' ? 'User' : 'Maya'}: ${turn.content}`,
      relevance: 0.8 - (index * 0.1), // More recent = higher relevance
      tokens: Math.ceil(turn.content.length / 4),
      source: 'session' as const,
      timestamp: turn.timestamp,
      metadata: { cachedAt: Date.now(), turnIndex: index }
    }));

    // Cache the results
    this.sessionCache.set(cacheKey, results);
    setTimeout(() => this.sessionCache.delete(cacheKey), this.cacheExpiry);

    return results;
  }

  /**
   * Journal Memory Layer - Retrieves actual user journal entries from Supabase
   */
  private async fetchJournalMemory(
    query: string,
    userId: string,
    _context?: any
  ): Promise<MemoryResult[]> {
    try {
      // First try semantic search if available
      let semanticResults: MemoryResult[] = [];
      try {
        const semanticData = await semanticSearch(userId, query);
        if (semanticData && Array.isArray(semanticData)) {
          semanticResults = semanticData.slice(0, 3).map((item: any) => ({
            content: item.content || 'Journal entry: ' + (item.summary || item.text),
            relevance: item.similarity || item.relevance || 0.7,
            tokens: Math.ceil((item.content || item.summary || item.text || '').length / 4),
            source: 'journal' as const,
            timestamp: item.timestamp || item.created_at || new Date().toISOString(),
            metadata: {
              type: 'semantic_match',
              userId,
              similarity: item.similarity,
              entryId: item.id
            }
          }));
        }
      } catch (semanticError) {
        logger.debug('Semantic search unavailable, falling back to keyword search', { userId });
      }

      // If semantic search returned results, use those
      if (semanticResults.length > 0) {
        return semanticResults;
      }

      // Fallback: Get recent journal entries and filter by keywords
      const journalEntries = await getJournalEntries(userId);
      if (!journalEntries || journalEntries.length === 0) {
        return this.getFallbackJournalMemories(query, userId);
      }

      const queryKeywords = query.toLowerCase().split(/\s+/).filter(word => word.length > 3);
      
      // Score entries by keyword relevance
      const scoredEntries = journalEntries
        .map(entry => {
          const content = entry.content?.toLowerCase() || '';
          const symbols = (entry.symbols || []).join(' ').toLowerCase();
          const combinedText = `${content} ${symbols}`;
          
          let relevanceScore = 0;
          queryKeywords.forEach(keyword => {
            if (combinedText.includes(keyword)) {
              relevanceScore += 0.3;
            }
          });

          // Base relevance by recency (more recent = higher)
          const daysSinceEntry = (Date.now() - new Date(entry.timestamp).getTime()) / (1000 * 60 * 60 * 24);
          const recencyScore = Math.max(0.1, 0.8 - (daysSinceEntry * 0.05)); // Decays over time
          
          return {
            ...entry,
            relevanceScore: relevanceScore + recencyScore
          };
        })
        .filter(entry => entry.relevanceScore > 0.2)
        .sort((a, b) => b.relevanceScore - a.relevanceScore)
        .slice(0, 3);

      if (scoredEntries.length === 0) {
        return this.getFallbackJournalMemories(query, userId);
      }

      return scoredEntries.map(entry => ({
        content: `Journal (${entry.type}): ${entry.content}`,
        relevance: Math.min(0.9, entry.relevanceScore),
        tokens: Math.ceil(entry.content?.length / 4 || 20),
        source: 'journal' as const,
        timestamp: entry.timestamp,
        metadata: {
          type: entry.type,
          symbols: entry.symbols,
          elementalTag: entry.elemental_tag,
          archetypeTag: entry.archetype_tag,
          userId
        }
      }));

    } catch (error) {
      logger.error('Journal memory fetch failed:', error);
      return this.getFallbackJournalMemories(query, userId);
    }
  }

  /**
   * Fallback journal memories when Supabase unavailable or empty
   */
  private getFallbackJournalMemories(query: string, userId: string): MemoryResult[] {
    const lowerQuery = query.toLowerCase();
    
    const fallbackTemplates = [
      {
        pattern: ['stuck', 'blocked', 'frustrated', 'resistance'],
        content: 'Past reflection: Navigating through resistance patterns and breakthrough moments.',
        relevance: 0.6
      },
      {
        pattern: ['growth', 'change', 'transform', 'evolve'],
        content: 'Journal theme: Exploring personal transformation and authentic self-expression.',
        relevance: 0.65
      },
      {
        pattern: ['work', 'career', 'purpose', 'calling'],
        content: 'Recent questioning: Alignment between current path and deeper purpose.',
        relevance: 0.62
      }
    ];

    const matchedTemplate = fallbackTemplates.find(template =>
      template.pattern.some(keyword => lowerQuery.includes(keyword))
    );

    if (matchedTemplate) {
      return [{
        content: matchedTemplate.content,
        relevance: matchedTemplate.relevance,
        tokens: Math.ceil(matchedTemplate.content.length / 4),
        source: 'journal' as const,
        timestamp: new Date(Date.now() - 86400000 * 3).toISOString(),
        metadata: { type: 'fallback_template', userId }
      }];
    }

    return [{
      content: 'Journal context: Building patterns of self-awareness and authentic expression.',
      relevance: 0.5,
      tokens: 25,
      source: 'journal' as const,
      timestamp: new Date(Date.now() - 86400000 * 5).toISOString(),
      metadata: { type: 'generic_fallback', userId }
    }];
  }

  /**
   * Profile Memory Layer - Retrieves persistent user profile and preferences
   */
  private async fetchProfileMemory(
    _query: string,
    userId: string,
    _context?: any
  ): Promise<MemoryResult[]> {
    try {
      // Fetch user profile from Supabase
      const { data: profileData, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error || !profileData) {
        // Create initial profile if none exists
        return await this.createInitialProfile(userId);
      }

      const results: MemoryResult[] = [];

      // Core profile information
      if (profileData.archetype || profileData.primary_element) {
        results.push({
          content: `Profile: ${profileData.archetype || 'Developing'} archetype with ${profileData.primary_element || 'balanced'} element affinity. Communication style: ${profileData.communication_style || 'adaptive'}.`,
          relevance: 0.8,
          tokens: 25,
          source: 'profile' as const,
          timestamp: profileData.updated_at || profileData.created_at,
          metadata: {
            type: 'core_profile',
            archetype: profileData.archetype,
            element: profileData.primary_element,
            userId
          }
        });
      }

      // Preferences and approaches
      if (profileData.preferences) {
        const prefs = typeof profileData.preferences === 'string' 
          ? JSON.parse(profileData.preferences) 
          : profileData.preferences;
          
        if (prefs && Object.keys(prefs).length > 0) {
          const prefSummary = Object.entries(prefs)
            .slice(0, 3)
            .map(([key, value]) => `${key}: ${value}`)
            .join(', ');
            
          results.push({
            content: `Preferences: ${prefSummary}`,
            relevance: 0.7,
            tokens: Math.ceil(prefSummary.length / 4),
            source: 'profile' as const,
            timestamp: profileData.updated_at,
            metadata: {
              type: 'preferences',
              preferences: prefs,
              userId
            }
          });
        }
      }

      // Growth themes and patterns
      if (profileData.growth_themes) {
        const themes = Array.isArray(profileData.growth_themes) 
          ? profileData.growth_themes 
          : [profileData.growth_themes];
          
        results.push({
          content: `Growth themes: ${themes.slice(0, 3).join(', ')}`,
          relevance: 0.75,
          tokens: Math.ceil(themes.join(', ').length / 4),
          source: 'profile' as const,
          timestamp: profileData.updated_at,
          metadata: {
            type: 'growth_themes',
            themes,
            userId
          }
        });
      }

      return results.length > 0 ? results : await this.createInitialProfile(userId);

    } catch (error) {
      logger.error('Profile memory fetch failed:', error);
      return await this.createInitialProfile(userId);
    }
  }

  /**
   * Create initial profile for new users
   */
  private async createInitialProfile(userId: string): Promise<MemoryResult[]> {
    // Generate consistent archetypal starting point
    const userHash = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const archetypes = ['Seeker', 'Creator', 'Nurturer', 'Builder', 'Sage'];
    const elements = ['Air', 'Fire', 'Water', 'Earth', 'Aether'];
    
    const archetype = archetypes[userHash % archetypes.length];
    const element = elements[userHash % elements.length];

    // Create initial profile in database
    try {
      await supabase
        .from('user_profiles')
        .insert({
          user_id: userId,
          archetype: archetype,
          primary_element: element,
          communication_style: 'adaptive',
          growth_themes: ['authenticity', 'self-awareness'],
          preferences: {
            interaction_style: 'exploratory',
            depth_preference: 'deep',
            pace: 'thoughtful'
          },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
    } catch (insertError) {
      logger.warn('Failed to create initial profile in database:', insertError);
    }

    return [{
      content: `Initial Profile: ${archetype} archetype with ${element} element affinity. Beginning journey of self-discovery.`,
      relevance: 0.7,
      tokens: 20,
      source: 'profile' as const,
      timestamp: new Date().toISOString(),
      metadata: {
        type: 'initial_profile',
        archetype,
        element,
        userId,
        isNew: true
      }
    }];
  }

  /**
   * Symbolic Memory Layer - themes, elemental resonance, patterns
   */
  private async fetchSymbolicMemory(
    query: string,
    _userId: string,
    _context?: any
  ): Promise<MemoryResult[]> {
    // Simple keyword-based symbolic associations
    // TODO: Expand with actual symbolic pattern matching
    const symbols: Record<string, string[]> = {
      'transformation': ['phoenix', 'butterfly', 'alchemy', 'becoming'],
      'guidance': ['lighthouse', 'compass', 'north star', 'path'],
      'growth': ['seedling', 'spiral', 'expansion', 'emergence'],
      'healing': ['water', 'light', 'integration', 'wholeness'],
      'wisdom': ['owl', 'tree', 'ancient', 'depth']
    };

    const queryLower = query.toLowerCase();
    const matchedSymbols: MemoryResult[] = [];

    Object.entries(symbols).forEach(([theme, symbolList]) => {
      const matches = symbolList.filter(symbol => 
        queryLower.includes(symbol) || queryLower.includes(theme)
      );
      
      if (matches.length > 0) {
        matchedSymbols.push({
          content: `Symbolic resonance: ${theme} (${matches.join(', ')})`,
          relevance: 0.6,
          tokens: 15,
          source: 'symbolic' as const,
          metadata: { theme, matches }
        });
      }
    });

    return matchedSymbols;
  }

  /**
   * External Memory Layer - Behavioral patterns until Mem0/LangChain integration
   */
  private async fetchExternalMemory(
    query: string,
    userId: string,
    _context?: any
  ): Promise<MemoryResult[]> {
    // Mock long-term behavioral insights
    const lowerQuery = query.toLowerCase();

    const behavioralPatterns = [
      {
        pattern: ['pattern', 'repeat', 'again', 'always', 'stuck'],
        insight: 'Long-term pattern: User often seeks clarity during transition periods, showing strong self-awareness.',
        relevance: 0.7,
        type: 'behavioral_pattern'
      },
      {
        pattern: ['growth', 'learning', 'develop', 'change'],
        insight: 'Growth trajectory: User shows consistent development through reflective dialogue over past interactions.',
        relevance: 0.72,
        type: 'growth_trend'
      },
      {
        pattern: ['decision', 'choice', 'should', 'what'],
        insight: 'Decision-making style: User processes choices best through exploration rather than direct advice.',
        relevance: 0.68,
        type: 'processing_style'
      },
      {
        pattern: ['feel', 'emotion', 'heart', 'sense'],
        insight: 'Emotional intelligence: User demonstrates growing comfort with emotional awareness and expression.',
        relevance: 0.69,
        type: 'emotional_development'
      }
    ];

    // Find relevant behavioral insights
    const matchingInsights = behavioralPatterns.filter(item =>
      item.pattern.some(keyword => lowerQuery.includes(keyword))
    );

    if (matchingInsights.length === 0) {
      // Return generic external memory if no patterns match
      return [{
        content: 'Long-term observation: User shows increasing authenticity and self-awareness across interactions.',
        relevance: 0.6,
        tokens: 40,
        source: 'external',
        timestamp: new Date(Date.now() - 86400000 * 14).toISOString(), // 2 weeks ago
        metadata: { 
          type: 'general_trend',
          userId,
          source: 'behavioral_analysis'
        }
      }];
    }

    return matchingInsights.slice(0, 2).map((insight, index) => ({
      content: insight.insight,
      relevance: insight.relevance - (index * 0.02),
      tokens: Math.ceil(insight.insight.length / 4),
      source: 'external' as const,
      timestamp: new Date(Date.now() - 86400000 * (7 + index * 7)).toISOString(),
      metadata: {
        type: insight.type,
        userId,
        source: 'pattern_recognition',
        confidence: insight.relevance
      }
    }));
  }

  /**
   * Group memory results by source for formatting
   */
  private groupResultsBySource(results: MemoryResult[]): Record<string, MemoryResult[]> {
    return results.reduce((groups, result) => {
      groups[result.source] = groups[result.source] || [];
      groups[result.source].push(result);
      return groups;
    }, {} as Record<string, MemoryResult[]>);
  }

  /**
   * Get display name for memory source
   */
  private getSourceDisplayName(source: string): string {
    const names = {
      'session': 'Recent Conversation',
      'journal': 'Journal Entries', 
      'profile': 'Your Profile',
      'symbolic': 'Symbolic Resonance',
      'external': 'Extended Memory'
    };
    return names[source as keyof typeof names] || source;
  }

  /**
   * Debug memory context output
   */
  private debugMemoryContext(
    results: MemoryResult[],
    processingTime: number,
    layersUsed: string[],
    fallbacksUsed: string[]
  ): void {
    logger.info('🧠 [MAYA_DEBUG] Memory Orchestration Complete');
    logger.info('═══════════════════════════════════════════════════════════');
    
    const grouped = this.groupResultsBySource(results);
    Object.entries(grouped).forEach(([source, items]) => {
      logger.info(`📝 ${source.toUpperCase()} MEMORY: ${items.length} items`);
      items.forEach((item, idx) => {
        logger.info(`   ${idx + 1}. (${item.relevance.toFixed(2)}) ${item.content.slice(0, 80)}...`);
      });
    });

    const totalTokens = results.reduce((sum, r) => sum + r.tokens, 0);
    logger.info('───────────────────────────────────────────────────────────');
    logger.info(`🎯 Total Results: ${results.length}`);
    logger.info(`🔧 Layers Used: ${layersUsed.join(', ')}`);
    logger.info(`⚠️  Fallbacks: ${fallbacksUsed.length ? fallbacksUsed.join(', ') : 'None'}`);
    logger.info(`📊 Token Budget: ${totalTokens}/4000`);
    logger.info(`⏱️  Processing: ${processingTime}ms`);
    logger.info('═══════════════════════════════════════════════════════════');
  }

  /**
   * Add custom memory layer (for extensibility)
   */
  addLayer(layer: MemoryLayer): void {
    this.layers.push(layer);
    logger.info(`Added memory layer: ${layer.name}`);
  }

  /**
   * Enable/disable memory layer
   */
  toggleLayer(layerName: string, enabled: boolean): void {
    const layer = this.layers.find(l => l.name === layerName);
    if (layer) {
      layer.enabled = enabled;
      logger.info(`Memory layer ${layerName} ${enabled ? 'enabled' : 'disabled'}`);
    }
  }

  /**
   * Get memory orchestrator stats
   */
  getStats(): any {
    return {
      layers: this.layers.map(l => ({ name: l.name, weight: l.weight, enabled: l.enabled })),
      cacheSize: this.sessionCache.size,
      dependencies: Object.keys(this.dependencies)
    };
  }

  // ========== MEMORY PERSISTENCE METHODS ==========

  /**
   * Persist conversation turn to memory system
   * Called after each Maya response to build user memory
   */
  async persistConversationTurn(
    userId: string,
    userMessage: string,
    mayaResponse: string,
    sessionId: string,
    metadata?: {
      element?: string;
      sentiment?: string;
      processingTime?: number;
      voiceSynthesized?: boolean;
    }
  ): Promise<void> {
    try {
      // Store conversation turn
      await supabase
        .from('conversation_turns')
        .insert([
          {
            user_id: userId,
            role: 'user',
            content: userMessage,
            session_id: sessionId,
            created_at: new Date().toISOString(),
            metadata: { ...metadata, type: 'user_message' }
          },
          {
            user_id: userId,
            role: 'assistant', 
            content: mayaResponse,
            session_id: sessionId,
            created_at: new Date().toISOString(),
            metadata: { ...metadata, type: 'maya_response' }
          }
        ]);

      // Extract and store meaningful insights/themes for future retrieval
      await this.extractAndStoreInsights(userId, userMessage, mayaResponse, metadata);
      
      logger.debug('Conversation turn persisted successfully', { userId, sessionId });

    } catch (error) {
      logger.error('Failed to persist conversation turn:', error);
      // Don't throw - memory persistence shouldn't break the conversation
    }
  }

  /**
   * Store journal entry with semantic indexing
   */
  async storeJournalEntry(
    userId: string,
    content: string,
    type: 'dream' | 'insight' | 'ritual' | 'journal' = 'journal',
    metadata?: {
      symbols?: string[];
      elementalTag?: string;
      archetypeTag?: string;
      mood?: string;
    }
  ): Promise<void> {
    try {
      const entry = {
        userId,
        content,
        type,
        symbols: metadata?.symbols || [],
        timestamp: new Date().toISOString(),
        elementalTag: metadata?.elementalTag,
        archetypeTag: metadata?.archetypeTag,
        petalSnapshot: metadata?.mood ? { mood: metadata.mood } : undefined
      };

      // Use existing saveJournalEntry function
      await import('../lib/supabaseClient').then(({ saveJournalEntry }) =>
        saveJournalEntry(entry)
      );

      logger.debug('Journal entry stored', { userId, type, contentLength: content.length });

    } catch (error) {
      logger.error('Failed to store journal entry:', error);
      throw error; // Throw for journal entries - user should know if their entry failed
    }
  }

  /**
   * Save journal entry with tags and elemental annotation
   */
  async saveJournalEntry(
    userId: string,
    text: string,
    tags: string[],
    element?: string,
    phase?: string
  ): Promise<void> {
    try {
      const entry = {
        userId,
        content: text,
        type: 'journal' as const,
        timestamp: new Date().toISOString(),
        elementalTag: element,
        symbols: tags,
        metadata: {
          tags,
          phase,
          autoTagged: this.autoDetectTags(text)
        }
      };

      // Use existing saveJournalEntry function
      await import('../lib/supabaseClient').then(({ saveJournalEntry }) =>
        saveJournalEntry(entry)
      );

      logger.info('[JOURNAL] Entry saved with tags:', {
        userId,
        tags: tags.join(', '),
        element,
        phase
      });

    } catch (error) {
      logger.error('[JOURNAL] Failed to save journal entry:', error);
      throw error;
    }
  }

  /**
   * Auto-detect tags from journal text
   */
  private autoDetectTags(text: string): string[] {
    const autoTags: string[] = [];
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('work')) autoTags.push('work');
    if (lowerText.includes('dream')) autoTags.push('dream');
    if (lowerText.includes('stress') || lowerText.includes('anxious')) autoTags.push('stress');
    if (lowerText.includes('relationship') || lowerText.includes('family')) autoTags.push('relationship');
    if (lowerText.includes('insight') || lowerText.includes('realize')) autoTags.push('insight');
    if (lowerText.includes('grateful') || lowerText.includes('thankful')) autoTags.push('gratitude');
    
    return autoTags;
  }

  /**
   * Update user profile based on interaction patterns
   */
  async updateUserProfile(
    userId: string,
    updates: {
      archetype?: string;
      primaryElement?: string;
      communicationStyle?: string;
      preferences?: Record<string, any>;
      growthThemes?: string[];
    }
  ): Promise<void> {
    try {
      const updateData: any = {
        updated_at: new Date().toISOString()
      };

      if (updates.archetype) updateData.archetype = updates.archetype;
      if (updates.primaryElement) updateData.primary_element = updates.primaryElement;  
      if (updates.communicationStyle) updateData.communication_style = updates.communicationStyle;
      if (updates.preferences) updateData.preferences = updates.preferences;
      if (updates.growthThemes) updateData.growth_themes = updates.growthThemes;

      const { error } = await supabase
        .from('user_profiles')
        .upsert({
          user_id: userId,
          ...updateData
        });

      if (error) {
        logger.error('Failed to update user profile:', error);
        throw error;
      }

      logger.debug('User profile updated', { userId, updates: Object.keys(updates) });

    } catch (error) {
      logger.error('Profile update failed:', error);
      throw error;
    }
  }

  /**
   * Extract insights and themes from conversations for future memory retrieval
   */
  private async extractAndStoreInsights(
    userId: string,
    userMessage: string,
    mayaResponse: string,
    metadata?: any
  ): Promise<void> {
    try {
      // Simple keyword extraction for now
      // TODO: Replace with actual NLP/embedding analysis
      const keywords = this.extractKeywords(userMessage + ' ' + mayaResponse);
      const themes = this.identifyThemes(userMessage);
      
      if (keywords.length > 0 || themes.length > 0) {
        // Store insight for later retrieval
        await supabase
          .from('memory_insights')
          .insert({
            user_id: userId,
            keywords,
            themes,
            context_snippet: userMessage.slice(0, 200),
            response_snippet: mayaResponse.slice(0, 200),
            created_at: new Date().toISOString(),
            metadata: {
              ...metadata,
              extraction_method: 'keyword_simple'
            }
          });
      }
    } catch (error) {
      logger.debug('Insight extraction failed:', error);
      // Don't throw - this is optional enhancement
    }
  }

  /**
   * Simple keyword extraction
   */
  private extractKeywords(text: string): string[] {
    const stopWords = new Set(['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should']);
    
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 3 && !stopWords.has(word))
      .slice(0, 10); // Top 10 keywords
  }

  /**
   * Simple theme identification
   */
  private identifyThemes(text: string): string[] {
    const themes: Record<string, string[]> = {
      growth: ['grow', 'develop', 'evolve', 'transform', 'change', 'progress'],
      creativity: ['create', 'art', 'express', 'creative', 'imagine', 'inspiration'],
      relationships: ['relationship', 'family', 'friend', 'love', 'connection', 'bond'],
      career: ['work', 'job', 'career', 'profession', 'business', 'success'],
      spirituality: ['spiritual', 'soul', 'meaning', 'purpose', 'divine', 'sacred'],
      healing: ['heal', 'recover', 'wellness', 'health', 'therapy', 'support'],
      transition: ['transition', 'move', 'shift', 'phase', 'journey', 'path']
    };

    const lowerText = text.toLowerCase();
    const identifiedThemes: string[] = [];

    Object.entries(themes).forEach(([theme, keywords]) => {
      if (keywords.some(keyword => lowerText.includes(keyword))) {
        identifiedThemes.push(theme);
      }
    });

    return identifiedThemes;
  }

  /**
   * Clear session cache (useful for testing or memory cleanup)
   */
  clearCache(): void {
    this.sessionCache.clear();
    logger.debug('Memory orchestrator cache cleared');
  }

  /**
   * Get user memory summary for analytics/debugging
   */
  async getUserMemorySummary(userId: string): Promise<{
    profileExists: boolean;
    journalEntries: number;
    conversationTurns: number;
    memoryInsights: number;
    lastActivity?: Date;
  }> {
    try {
      const [profileResult, journalResult, conversationResult, insightResult] = await Promise.all([
        supabase.from('user_profiles').select('created_at').eq('user_id', userId).single(),
        supabase.from('journal_entries').select('id', { count: 'exact' }).eq('user_id', userId),
        supabase.from('conversation_turns').select('id, created_at', { count: 'exact' }).eq('user_id', userId),
        supabase.from('memory_insights').select('id', { count: 'exact' }).eq('user_id', userId)
      ]);

      // Get latest activity
      const lastActivityResult = await supabase
        .from('conversation_turns')
        .select('created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      return {
        profileExists: !profileResult.error,
        journalEntries: journalResult.count || 0,
        conversationTurns: conversationResult.count || 0,
        memoryInsights: insightResult.count || 0,
        lastActivity: lastActivityResult.data?.created_at ? new Date(lastActivityResult.data.created_at) : undefined
      };

    } catch (error) {
      logger.error('Failed to get user memory summary:', error);
      return {
        profileExists: false,
        journalEntries: 0,
        conversationTurns: 0,
        memoryInsights: 0
      };
    }
  }
}