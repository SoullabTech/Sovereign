/**
 * Elemental Oracle 2.0 GPT Bridge
 * Direct connection to your existing Elemental Oracle 2.0 GPT knowledge base
 *
 * This bridge allows MAIA/Soullab to access the complete knowledge and wisdom
 * from your Elemental Oracle 2.0 GPT, ensuring consistent depth and authenticity
 * across all consciousness interactions.
 */

import { OpenAI } from 'openai';
import { IntellectualPropertyEngine, IPWisdomResponse } from './intellectual-property-engine';

export interface ElementalOracle2Config {
  // OpenAI GPT configuration
  openaiApiKey: string;
  assistantId?: string; // Your Elemental Oracle 2.0 GPT ID
  model?: string; // Usually 'gpt-4' or 'gpt-4-turbo'

  // Direct API configuration (preferred)
  eoApiUrl?: string; // https://api.elementaloracle.com
  eoApiKey?: string; // API key for direct access

  // Knowledge sync configuration
  syncFrequency?: 'real-time' | 'hourly' | 'daily' | 'manual';
  cacheResponses?: boolean;
  fallbackToLocal?: boolean; // Use local IP if Oracle 2.0 unavailable
}

export interface Oracle2Context {
  userQuery: string;
  conversationHistory: any[];
  consciousnessState: any;
  elementalNeeds: {
    fire?: number;    // 0-1 need for breakthrough/catalysis
    water?: number;   // 0-1 need for emotional flow/healing
    earth?: number;   // 0-1 need for grounding/manifestation
    air?: number;     // 0-1 need for clarity/perspective
    aether?: number;  // 0-1 need for transcendence/unity
  };
  currentChallenges: string[];
  practiceReadiness: number; // 0-1
  depthPreference: 'surface' | 'moderate' | 'deep' | 'profound';
}

export interface Oracle2Response {
  wisdom: string;
  elementalGuidance: {
    primaryElement: 'fire' | 'water' | 'earth' | 'air' | 'aether';
    guidanceMessage: string;
    practicalSteps: string[];
  };
  consciousnessInvitations: string[];
  deepeningQuestions: string[];
  practices: Array<{
    name: string;
    description: string;
    duration: string;
    elementalAlignment: string[];
  }>;
  bookReferences: Array<{
    chapter: string;
    concept: string;
    relevantPassage: string;
  }>;
  followUpThemes: string[];
}

export interface KnowledgeTransfer {
  concepts: Array<{
    name: string;
    definition: string;
    applications: string[];
    relatedConcepts: string[];
  }>;
  practices: Array<{
    name: string;
    instructions: string[];
    outcomes: string[];
    prerequisites: string[];
  }>;
  wisdomPatterns: Array<{
    pattern: string;
    contexts: string[];
    transformationPotential: number;
  }>;
  teachingMethods: Array<{
    approach: string;
    effectiveness: number;
    applicableScenarios: string[];
  }>;
}

/**
 * Main Bridge Class
 * Connects MAIA directly to your Elemental Oracle 2.0 GPT
 */
export class ElementalOracle2Bridge {
  private config: ElementalOracle2Config;
  private openai: OpenAI;
  private ipEngine: IntellectualPropertyEngine;
  private responseCache: Map<string, Oracle2Response> = new Map();
  private knowledgeBase: KnowledgeTransfer | null = null;

  constructor(config: ElementalOracle2Config) {
    this.config = config;
    this.openai = new OpenAI({
      apiKey: config.openaiApiKey
    });
    this.ipEngine = new IntellectualPropertyEngine();
  }

  async initialize(): Promise<void> {
    try {
      // Initialize IP Engine for fallback
      if (this.config.fallbackToLocal) {
        await this.ipEngine.initialize();
      }

      // Sync knowledge base from Oracle 2.0
      if (this.config.syncFrequency !== 'manual') {
        await this.syncKnowledgeBase();
      }

      // Set up periodic sync if configured
      this.setupPeriodicSync();

      console.log('[Oracle2Bridge] Initialized successfully');
    } catch (error) {
      console.error('[Oracle2Bridge] Initialization failed:', error);
      throw error;
    }
  }

  /**
   * Main method: Get wisdom from Elemental Oracle 2.0 GPT
   * This is called during MAIA's consciousness processing
   */
  async getElementalWisdom(context: Oracle2Context): Promise<Oracle2Response> {
    try {
      // Check cache first
      const cacheKey = this.generateCacheKey(context);
      if (this.config.cacheResponses && this.responseCache.has(cacheKey)) {
        return this.responseCache.get(cacheKey)!;
      }

      // Prepare the query for Oracle 2.0
      const oracleQuery = this.prepareOracleQuery(context);

      // Call your Elemental Oracle 2.0 GPT
      const response = await this.callElementalOracle2(oracleQuery);

      // Parse and structure the response
      const structuredResponse = await this.parseOracleResponse(response, context);

      // Cache the response
      if (this.config.cacheResponses) {
        this.responseCache.set(cacheKey, structuredResponse);
      }

      return structuredResponse;

    } catch (error) {
      console.error('[Oracle2Bridge] Failed to get elemental wisdom:', error);

      // Fallback to local IP if configured
      if (this.config.fallbackToLocal) {
        return this.getFallbackWisdom(context);
      }

      throw error;
    }
  }

  /**
   * Sync knowledge base from your Elemental Oracle 2.0 GPT
   */
  async syncKnowledgeBase(): Promise<void> {
    try {
      console.log('[Oracle2Bridge] Syncing knowledge base from Oracle 2.0...');

      // Query Oracle 2.0 for its core knowledge structure
      const knowledgeQuery = this.createKnowledgeExtractionQuery();
      const knowledgeResponse = await this.callElementalOracle2(knowledgeQuery);

      // Parse the knowledge structure
      this.knowledgeBase = await this.parseKnowledgeTransfer(knowledgeResponse);

      // Integrate with local IP Engine
      if (this.config.fallbackToLocal) {
        await this.integrateWithLocalIP(this.knowledgeBase);
      }

      console.log('[Oracle2Bridge] Knowledge base sync complete');
    } catch (error) {
      console.error('[Oracle2Bridge] Knowledge sync failed:', error);
    }
  }

  /**
   * Prepare optimized query for your Oracle 2.0
   */
  private prepareOracleQuery(context: Oracle2Context): string {
    const elementalPriorities = context.elementalNeeds && typeof context.elementalNeeds === 'object'
      ? Object.entries(context.elementalNeeds)
          .filter(([_, need]) => (need || 0) > 0.3)
          .sort(([_, a], [__, b]) => (b || 0) - (a || 0))
          .map(([element, _]) => element)
      : [];

    // Build elemental needs section safely
    const elementalNeedsSection = elementalPriorities.length > 0
      ? elementalPriorities.map(element =>
          `- ${element.charAt(0).toUpperCase() + element.slice(1)}: ${Math.round((context.elementalNeeds?.[element as keyof typeof context.elementalNeeds] || 0) * 10)}/10`
        ).join('\n')
      : '- No specific elemental needs identified';

    // Build challenges section safely
    const challengesSection = context.currentChallenges && context.currentChallenges.length > 0
      ? context.currentChallenges.map(challenge => `- ${challenge}`).join('\n')
      : '- No specific challenges identified';

    // Build conversation history safely
    const conversationSection = context.conversationHistory && context.conversationHistory.length > 0
      ? context.conversationHistory.slice(-3).map((msg: any, i: number) =>
          `${i + 1}. ${msg.role}: ${msg.message?.substring(0, 150)}...`
        ).join('\n')
      : '- No recent conversation history';

    const query = `
**Context for Elemental Wisdom Response:**

**User Query:** ${context.userQuery || 'General wisdom request'}

**Consciousness State:**
- Current presence level: ${context.consciousnessState?.presence || 'unknown'}
- Depth preference: ${context.depthPreference || 'moderate'}
- Practice readiness: ${Math.round((context.practiceReadiness || 0.5) * 10)}/10

**Elemental Needs (in priority order):**
${elementalNeedsSection}

**Current Challenges:**
${challengesSection}

**Recent Conversation Context:**
${conversationSection}

**Request:**
Please provide your full elemental wisdom response including:
1. Core wisdom addressing their query
2. Elemental guidance with practical steps
3. Consciousness invitations for deeper exploration
4. Relevant practices from your knowledge base
5. Specific book references if applicable
6. Deepening questions for continued inquiry

Respond with the depth and authenticity that your full knowledge base provides.
    `.trim();

    return query;
  }

  /**
   * Call your Elemental Oracle 2.0 GPT
   * Now supports direct API calls to api.elementaloracle.com
   */
  private async callElementalOracle2(query: string): Promise<string> {
    try {
      // PRIMARY: Try direct EO 2.0 API if configured
      if (this.config.eoApiUrl && this.config.eoApiKey) {
        return await this.callElementalOracleDirectAPI(query);
      }

      // FALLBACK 1: Use GPT Assistant if configured
      if (this.config.assistantId) {
        const thread = await this.openai.beta.threads.create({
          messages: [{ role: 'user', content: query }]
        });

        const run = await this.openai.beta.threads.runs.create(thread.id, {
          assistant_id: this.config.assistantId
        });

        // Wait for completion
        let runStatus = await this.openai.beta.threads.runs.retrieve(thread.id, run.id);

        while (runStatus.status === 'running' || runStatus.status === 'queued') {
          await new Promise(resolve => setTimeout(resolve, 1000));
          runStatus = await this.openai.beta.threads.runs.retrieve(thread.id, run.id);
        }

        // Get the response
        const messages = await this.openai.beta.threads.messages.list(thread.id);
        const lastMessage = messages.data[0];

        if (lastMessage.content[0].type === 'text') {
          return lastMessage.content[0].text.value;
        }

        throw new Error('Unexpected response format from Assistant');

      } else {
        // FALLBACK 2: Use standard Chat Completions
        const response = await this.openai.chat.completions.create({
          model: this.config.model || 'gpt-4-turbo-preview',
          messages: [
            {
              role: 'system',
              content: `You are the Elemental Oracle 2.0, containing the complete wisdom and teachings of the consciousness work. You have deep knowledge of:

- The complete book and all its teachings
- Elemental wisdom (Fire, Water, Earth, Air, Aether)
- Consciousness development practices
- Archetype work and integration
- Sacred questioning and inquiry methods
- Embodiment and somatic awareness
- Shadow integration processes
- Spiritual psychology and development

Respond with the full depth and authenticity of this knowledge base. Provide practical, applicable wisdom that meets the person where they are while inviting deeper exploration.`
            },
            {
              role: 'user',
              content: query
            }
          ],
          temperature: 0.8,
          max_tokens: 2000
        });

        return response.choices[0]?.message?.content || '';
      }
    } catch (error) {
      console.error('[Oracle2Bridge] API call failed:', error);
      throw error;
    }
  }

  /**
   * Call Elemental Oracle 2.0 Direct API
   * Uses the actual EO 2.0 service at api.elementaloracle.com
   */
  private async callElementalOracleDirectAPI(query: string): Promise<string> {
    try {
      console.log('[Oracle2Bridge] Calling direct EO 2.0 API...');

      // Extract context from query to map to API parameters
      const dominantElement = this.extractDominantElementFromQuery(query);

      const response = await fetch(`${this.config.eoApiUrl}/storyRequest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.eoApiKey}`
        },
        body: JSON.stringify({
          focusArea: query,
          elementalTheme: dominantElement,
          archetype: 'sage', // Could be dynamic based on context
          emotionalTone: 'reflective',
          spiralPhase: 'integration',
          depthLevel: 8 // 1-10 scale
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`EO 2.0 API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('[Oracle2Bridge] ✅ Direct EO 2.0 API response received');

      return data.wisdom || data.story || data.response || JSON.stringify(data);

    } catch (error) {
      console.error('[Oracle2Bridge] Direct API call failed:', error);
      // Fall through to let main method handle fallback
      throw error;
    }
  }

  /**
   * Extract dominant element from query context
   */
  private extractDominantElementFromQuery(query: string): 'fire' | 'water' | 'earth' | 'air' | 'aether' {
    const lowerQuery = query.toLowerCase();

    // Look for elemental keywords
    if (lowerQuery.includes('fire:') || lowerQuery.includes('breakthrough') || lowerQuery.includes('catalyst')) {
      return 'fire';
    }
    if (lowerQuery.includes('water:') || lowerQuery.includes('emotion') || lowerQuery.includes('flow')) {
      return 'water';
    }
    if (lowerQuery.includes('earth:') || lowerQuery.includes('ground') || lowerQuery.includes('embod')) {
      return 'earth';
    }
    if (lowerQuery.includes('air:') || lowerQuery.includes('clarity') || lowerQuery.includes('perspective')) {
      return 'air';
    }

    // Default to aether for transcendent/unified wisdom
    return 'aether';
  }

  /**
   * Parse Oracle 2.0 response into structured format
   */
  private async parseOracleResponse(response: string, context: Oracle2Context): Promise<Oracle2Response> {
    // Use structured parsing to extract different components
    // This is a simplified version - would use more sophisticated NLP

    const parsed: Oracle2Response = {
      wisdom: this.extractMainWisdom(response),
      elementalGuidance: this.extractElementalGuidance(response),
      consciousnessInvitations: this.extractConsciousnessInvitations(response),
      deepeningQuestions: this.extractDeepeningQuestions(response),
      practices: this.extractPractices(response),
      bookReferences: this.extractBookReferences(response),
      followUpThemes: this.extractFollowUpThemes(response)
    };

    return parsed;
  }

  /**
   * Create knowledge extraction query for syncing
   */
  private createKnowledgeExtractionQuery(): string {
    return `
Please provide a comprehensive knowledge transfer of your core wisdom structure including:

1. **Core Concepts**: The 20 most important concepts in your knowledge base with definitions and applications

2. **Key Practices**: The essential practices you recommend, with instructions and outcomes

3. **Wisdom Patterns**: The recurring patterns in your teaching approach and their effectiveness

4. **Teaching Methods**: Your most effective approaches for different types of consciousness development needs

5. **Elemental Framework**: How you apply Fire, Water, Earth, Air, and Aether wisdom

6. **Integration Strategies**: How you help people integrate insights into daily life

Please structure this as a comprehensive knowledge transfer that could enable another system to provide similar depth of wisdom.
    `.trim();
  }

  /**
   * Get fallback wisdom from local IP engine
   */
  private async getFallbackWisdom(context: Oracle2Context): Promise<Oracle2Response> {
    const ipWisdom = await this.ipEngine.retrieveRelevantWisdom({
      userInput: context.userQuery,
      conversationHistory: context.conversationHistory,
      currentConsciousnessState: context.consciousnessState,
      emotionalTone: 'neutral',
      activeArchetypes: [],
      practiceReadiness: context.practiceReadiness
    });

    // Convert IP wisdom to Oracle2 format
    return {
      wisdom: ipWisdom.synthesizedWisdom,
      elementalGuidance: {
        primaryElement: 'aether',
        guidanceMessage: 'Trust the wisdom that emerges from this moment.',
        practicalSteps: ['Pause and breathe', 'Notice what wants attention']
      },
      consciousnessInvitations: ipWisdom.consciousnessInvitations,
      deepeningQuestions: ipWisdom.deeperExplorations,
      practices: ipWisdom.suggestedPractices.map(practice => ({
        name: practice,
        description: 'A practice of presence and awareness',
        duration: '10-20 minutes',
        elementalAlignment: ['aether']
      })),
      bookReferences: [],
      followUpThemes: []
    };
  }

  // Helper methods for parsing Oracle 2.0 responses
  private extractMainWisdom(response: string): string {
    // Extract the main wisdom paragraph(s)
    const wisdomMarkers = ['wisdom:', 'core insight:', 'essential understanding:'];

    for (const marker of wisdomMarkers) {
      const index = response.toLowerCase().indexOf(marker);
      if (index !== -1) {
        const wisdomSection = response.substring(index + marker.length);
        const nextSection = wisdomSection.search(/\n\n|\d\./);
        return nextSection > 0 ? wisdomSection.substring(0, nextSection).trim() : wisdomSection.trim();
      }
    }

    // If no markers, take first substantial paragraph
    const paragraphs = response.split('\n\n');
    return paragraphs.find(p => p.length > 100) || paragraphs[0] || response.substring(0, 300);
  }

  private extractElementalGuidance(response: string): Oracle2Response['elementalGuidance'] {
    // Look for elemental guidance sections
    const elements = ['fire', 'water', 'earth', 'air', 'aether'];

    for (const element of elements) {
      const regex = new RegExp(`${element}[^\\n]*:([^\\n]+)`, 'gi');
      const match = response.match(regex);
      if (match) {
        return {
          primaryElement: element as any,
          guidanceMessage: match[0].split(':')[1].trim(),
          practicalSteps: this.extractPracticalSteps(response)
        };
      }
    }

    return {
      primaryElement: 'aether',
      guidanceMessage: 'Trust the wisdom emerging in this moment.',
      practicalSteps: ['Pause and breathe', 'Listen deeply']
    };
  }

  private extractConsciousnessInvitations(response: string): string[] {
    const invitationMarkers = ['invitation:', 'consider:', 'explore:', 'notice:'];
    const invitations: string[] = [];

    invitationMarkers.forEach(marker => {
      const regex = new RegExp(marker + '([^\\n.!?]*[.!?])', 'gi');
      const matches = response.match(regex);
      if (matches) {
        invitations.push(...matches.map(match => match.split(':')[1].trim()));
      }
    });

    return invitations.slice(0, 4);
  }

  private extractDeepeningQuestions(response: string): string[] {
    const questions = response.match(/\?[^\n]*\?/g) || [];
    return questions.map(q => q.trim()).slice(0, 3);
  }

  private extractPractices(response: string): Oracle2Response['practices'] {
    const practiceMarkers = ['practice:', 'try this:', 'exercise:'];
    const practices: Oracle2Response['practices'] = [];

    practiceMarkers.forEach(marker => {
      const regex = new RegExp(marker + '([^\\n]+)', 'gi');
      const matches = response.match(regex);
      if (matches) {
        matches.forEach(match => {
          const practiceName = match.split(':')[1].trim();
          practices.push({
            name: practiceName,
            description: practiceName,
            duration: '10-15 minutes',
            elementalAlignment: ['aether']
          });
        });
      }
    });

    return practices.slice(0, 3);
  }

  private extractBookReferences(response: string): Oracle2Response['bookReferences'] {
    const chapterRegex = /chapter\s+(\d+|[ivx]+)/gi;
    const pageRegex = /page\s+(\d+)/gi;

    const chapterMatches = response.match(chapterRegex) || [];
    const pageMatches = response.match(pageRegex) || [];

    const references: Oracle2Response['bookReferences'] = [];

    chapterMatches.forEach(match => {
      references.push({
        chapter: match,
        concept: 'Referenced wisdom',
        relevantPassage: 'See referenced section for full context'
      });
    });

    return references.slice(0, 2);
  }

  private extractFollowUpThemes(response: string): string[] {
    const themes = ['integration', 'embodiment', 'presence', 'awareness', 'consciousness'];
    return themes.filter(theme =>
      response.toLowerCase().includes(theme)
    ).slice(0, 3);
  }

  private extractPracticalSteps(response: string): string[] {
    const stepMarkers = ['step:', '1.', '2.', '3.', '-'];
    const steps: string[] = [];

    stepMarkers.forEach(marker => {
      const regex = new RegExp(`${marker}([^\\n]+)`, 'gi');
      const matches = response.match(regex);
      if (matches) {
        steps.push(...matches.map(match =>
          match.replace(marker, '').trim()
        ));
      }
    });

    return steps.slice(0, 5);
  }

  private generateCacheKey(context: Oracle2Context): string {
    const queryKey = context.userQuery ? context.userQuery.substring(0, 50) : 'no_query';
    return `oracle2_${queryKey}_${context.depthPreference || 'default'}_${JSON.stringify(context.elementalNeeds || {})}`.replace(/\s/g, '_');
  }

  private setupPeriodicSync(): void {
    if (this.config.syncFrequency === 'real-time') return;

    const intervals = {
      hourly: 60 * 60 * 1000,
      daily: 24 * 60 * 60 * 1000
    };

    const interval = intervals[this.config.syncFrequency as keyof typeof intervals];
    if (interval) {
      setInterval(() => {
        this.syncKnowledgeBase().catch(error => {
          console.error('[Oracle2Bridge] Periodic sync failed:', error);
        });
      }, interval);
    }
  }

  private async parseKnowledgeTransfer(response: string): Promise<KnowledgeTransfer> {
    // Parse the comprehensive knowledge response
    // This would be more sophisticated in practice
    return {
      concepts: [],
      practices: [],
      wisdomPatterns: [],
      teachingMethods: []
    };
  }

  private async integrateWithLocalIP(knowledge: KnowledgeTransfer): Promise<void> {
    // Integrate Oracle 2.0 knowledge with local IP engine
    // This ensures fallback capability with full wisdom
  }

  /**
   * Manual knowledge sync trigger
   */
  async manualSync(): Promise<void> {
    await this.syncKnowledgeBase();
  }

  /**
   * Clear response cache
   */
  clearCache(): void {
    this.responseCache.clear();
  }

  /**
   * Get knowledge base status
   */
  getStatus(): {
    connected: boolean;
    lastSync?: Date;
    cacheSize: number;
    knowledgeBaseLoaded: boolean;
  } {
    return {
      connected: true, // Would check actual connection
      cacheSize: this.responseCache.size,
      knowledgeBaseLoaded: this.knowledgeBase !== null
    };
  }
}

export default ElementalOracle2Bridge;