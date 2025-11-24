import { PrismaClient } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';
import { searchUserFiles } from '../../backend/src/services/IngestionQueue';
import { OpenAI } from 'openai';

const prisma = new PrismaClient();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface MemoryContext {
  session: ConversationTurn[];       // Last N turns
  journals: JournalEntry[];          // Relevant recent entries
  files: FileEntry[];                // Uploaded file content
  longTerm: UserProfile;             // Persistent profile from Mem0
  symbolic: ArchetypalContext | null; // Sesame enrichment
  shadow: ShadowEntry[] | null;      // Shadow work if relevant
  metadata: {
    timestamp: Date;
    phase: SpiralogicPhase;
    emotionalState: EmotionalVector;
    memoryQuality: 'full' | 'partial' | 'minimal';
  };
}

export interface ConversationTurn {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface JournalEntry {
  id: string;
  date: Date;
  content: string;
  summary: string;
  sentiment: string;
  relevanceScore?: number;
}

export interface FileEntry {
  id: string;
  fileName: string;
  content: string;
  summary: string;
  keyTopics: string[];
  emotionalTone: string;
  elementalResonance: string;
  relevanceScore?: number;
  uploadedAt: Date;
  citation?: FileCitation;
}

export interface FileCitation {
  fileName: string;
  uploadDate: string;
  relevantSection: string;
  confidence: number;
  pageNumber?: number;
  sectionTitle?: string;
}

export interface UserProfile {
  id: string;
  currentPhase: string;
  preferences: Record<string, any>;
  oracleHistory: any[];
}

export interface ArchetypalContext {
  dominantArchetype: string;
  elementalResonance: string[];
  geometricPattern: string;
  collectiveTheme: string;
}

export interface ShadowEntry {
  id: string;
  content: string;
  triggers: string[];
}

export interface EmotionalVector {
  valence: number;    // -1 to 1 (negative to positive)
  arousal: number;    // 0 to 1 (calm to excited)
  dominance: number;  // 0 to 1 (submissive to dominant)
}

export interface SpiralogicPhase {
  name: string;
  stage: number;
  description: string;
}

interface MemoryOptions {
  maxSessionTurns?: number;
  maxJournalEntries?: number;
  maxFileEntries?: number;
  includeShadow?: boolean;
  priorityWeights?: {
    recency: number;
    relevance: number;
    emotional: number;
    frequency: number;
  };
}

export class MemoryOrchestrator {
  private weights = {
    recency: 0.4,
    relevance: 0.3,
    emotional: 0.2,
    frequency: 0.1
  };

  async buildContext(
    userId: string,
    userInput: string,
    options?: MemoryOptions
  ): Promise<MemoryContext> {
    const startTime = Date.now();

    try {
      // Generate query embedding for file/journal search
      const queryEmbedding = await this.generateQueryEmbedding(userInput);

      // Parallel fetch from all sources with error handling
      const [session, journals, files, profile, symbolic] = await Promise.allSettled([
        this.getSessionContext(userId, options?.maxSessionTurns),
        this.getRelevantJournals(userId, queryEmbedding, options?.maxJournalEntries),
        this.getRelevantFiles(userId, userInput, queryEmbedding, options?.maxFileEntries),
        this.getLongTermProfile(userId),
        this.getSymbolicEnrichment(userId, userInput)
      ]);

      // Extract successful results
      const contextData = {
        session: session.status === 'fulfilled' ? session.value : [],
        journals: journals.status === 'fulfilled' ? journals.value : [],
        files: files.status === 'fulfilled' ? files.value : [],
        profile: profile.status === 'fulfilled' ? profile.value : null,
        symbolic: symbolic.status === 'fulfilled' ? symbolic.value : null
      };

      // Rank and filter content
      const filtered = this.rankAndFilter(contextData, options);

      // Check for shadow relevance if enabled
      const shadow = options?.includeShadow 
        ? await this.checkShadowRelevance(userInput, filtered)
        : null;

      const processingTime = Date.now() - startTime;
      console.log(`Memory context built in ${processingTime}ms`);

      return {
        session: filtered.session,
        journals: filtered.journals,
        files: filtered.files,
        longTerm: filtered.profile,
        symbolic: filtered.symbolic,
        shadow,
        metadata: {
          timestamp: new Date(),
          phase: this.inferSpiralogicPhase(filtered),
          emotionalState: this.detectEmotionalState(userInput, filtered),
          memoryQuality: this.assessMemoryQuality([
            session,
            journals, 
            files,
            profile,
            symbolic
          ])
        }
      };

    } catch (error) {
      console.error('Memory orchestration error:', error);
      return this.getFallbackContext(userId, userInput);
    }
  }

  private async generateQueryEmbedding(text: string): Promise<number[]> {
    try {
      const response = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: text.substring(0, 8000),
      });
      return response.data[0].embedding;
    } catch (error) {
      console.error('Query embedding error:', error);
      return [];
    }
  }

  private async getSessionContext(
    userId: string, 
    maxTurns: number = 10
  ): Promise<ConversationTurn[]> {
    try {
      // In production, fetch from Redis or session store
      // For now, return mock data structure
      return [];
    } catch (error) {
      console.error('Session context error:', error);
      return [];
    }
  }

  private async getRelevantJournals(
    userId: string,
    queryEmbedding: number[],
    limit: number = 5
  ): Promise<JournalEntry[]> {
    try {
      if (queryEmbedding.length === 0) {
        return [];
      }

      // Use pgvector for semantic search in journals
      const results = await prisma.$queryRaw`
        SELECT 
          id,
          content,
          summary,
          sentiment,
          "createdAt" as date,
          1 - (embedding <=> ${queryEmbedding}::vector) as relevanceScore
        FROM "JournalEntry"
        WHERE "userId" = ${userId}
        ORDER BY embedding <=> ${queryEmbedding}::vector
        LIMIT ${limit}
      ` as JournalEntry[];

      return results;
    } catch (error) {
      console.error('Journal retrieval error:', error);
      return [];
    }
  }

  private async getRelevantFiles(
    userId: string,
    userInput: string,
    queryEmbedding: number[],
    limit: number = 3
  ): Promise<FileEntry[]> {
    try {
      // Use the file search function from IngestionQueue
      const fileResults = await searchUserFiles(userId, userInput, limit);
      
      return fileResults.map(file => {
        const uploadDate = new Date(file.createdAt).toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short', 
          day: 'numeric'
        });

        // Create citation information
        const citation: FileCitation = {
          fileName: file.fileName,
          uploadDate,
          relevantSection: this.extractRelevantSection(file.content, userInput),
          confidence: file.similarity,
          // TODO: Add page number extraction for PDFs
          pageNumber: undefined,
          sectionTitle: undefined
        };

        return {
          id: file.id,
          fileName: file.fileName,
          content: file.content,
          summary: file.summary,
          keyTopics: file.keyTopics || [],
          emotionalTone: file.emotionalTone,
          elementalResonance: file.elementalResonance,
          relevanceScore: file.similarity,
          uploadedAt: file.createdAt,
          citation
        };
      });
    } catch (error) {
      console.error('File retrieval error:', error);
      return [];
    }
  }

  private async getLongTermProfile(userId: string): Promise<UserProfile | null> {
    try {
      // In production, fetch from Mem0
      // For now, return basic structure
      return {
        id: userId,
        currentPhase: 'exploration',
        preferences: {},
        oracleHistory: []
      };
    } catch (error) {
      console.error('Long-term profile error:', error);
      return null;
    }
  }

  private async getSymbolicEnrichment(
    userId: string,
    userInput: string
  ): Promise<ArchetypalContext | null> {
    try {
      // In production, call Sesame for archetypal analysis
      // For now, return null (graceful degradation)
      return null;
    } catch (error) {
      console.error('Symbolic enrichment error:', error);
      return null;
    }
  }

  private rankAndFilter(
    contextData: any,
    options?: MemoryOptions
  ): any {
    const weights = { ...this.weights, ...options?.priorityWeights };

    // Rank journals by combined score
    const rankedJournals = contextData.journals
      .map(journal => ({
        ...journal,
        combinedScore: this.calculateCombinedScore(journal, weights)
      }))
      .sort((a, b) => b.combinedScore - a.combinedScore)
      .slice(0, options?.maxJournalEntries || 5);

    // Rank files by combined score  
    const rankedFiles = contextData.files
      .map(file => ({
        ...file,
        combinedScore: this.calculateCombinedScore(file, weights)
      }))
      .sort((a, b) => b.combinedScore - a.combinedScore)
      .slice(0, options?.maxFileEntries || 3);

    return {
      session: contextData.session.slice(-(options?.maxSessionTurns || 10)),
      journals: rankedJournals,
      files: rankedFiles,
      profile: contextData.profile,
      symbolic: contextData.symbolic
    };
  }

  private calculateCombinedScore(
    item: JournalEntry | FileEntry,
    weights: any
  ): number {
    const recencyScore = this.getRecencyScore(item.uploadedAt || item.date);
    const relevanceScore = item.relevanceScore || 0;
    const emotionalScore = this.getEmotionalIntensityScore(item);
    const frequencyScore = 0.5; // Placeholder

    return (
      recencyScore * weights.recency +
      relevanceScore * weights.relevance +
      emotionalScore * weights.emotional +
      frequencyScore * weights.frequency
    );
  }

  private getRecencyScore(date: Date): number {
    const now = new Date();
    const daysDiff = (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24);
    
    // Exponential decay: full score for today, half score after 7 days
    return Math.exp(-daysDiff / 10);
  }

  private getEmotionalIntensityScore(item: JournalEntry | FileEntry): number {
    if ('emotionalTone' in item) {
      // File has explicit emotional tone
      const intensity = {
        'contemplative': 0.6,
        'energetic': 0.9,
        'melancholic': 0.8,
        'hopeful': 0.7,
        'neutral': 0.3
      };
      return intensity[item.emotionalTone] || 0.5;
    }

    if ('sentiment' in item) {
      // Journal has sentiment analysis
      const sentiment = item.sentiment?.toLowerCase() || 'neutral';
      return sentiment.includes('positive') || sentiment.includes('negative') ? 0.8 : 0.3;
    }

    return 0.5;
  }

  private async checkShadowRelevance(
    userInput: string,
    context: any
  ): Promise<ShadowEntry[] | null> {
    // Shadow work is sensitive - only activate on explicit triggers
    const shadowTriggers = [
      'shadow', 'repressed', 'unconscious', 'hidden', 'avoid', 
      'fear', 'anger', 'shame', 'guilt', 'resist'
    ];

    const hasTrigger = shadowTriggers.some(trigger => 
      userInput.toLowerCase().includes(trigger)
    );

    if (!hasTrigger) {
      return null;
    }

    try {
      // In production, search encrypted shadow entries
      return [];
    } catch (error) {
      console.error('Shadow relevance check error:', error);
      return null;
    }
  }

  private inferSpiralogicPhase(context: any): SpiralogicPhase {
    // Analyze context to infer current phase
    return {
      name: 'Exploration',
      stage: 1,
      description: 'Beginning the journey of self-discovery'
    };
  }

  private detectEmotionalState(
    userInput: string,
    context: any
  ): EmotionalVector {
    // Simple emotional analysis - in production use more sophisticated NLP
    const positive = ['good', 'great', 'happy', 'love', 'joy', 'excited'];
    const negative = ['bad', 'sad', 'angry', 'hate', 'fear', 'worried'];
    const high_arousal = ['excited', 'angry', 'stressed', 'energetic'];

    const text = userInput.toLowerCase();
    
    let valence = 0;
    positive.forEach(word => { if (text.includes(word)) valence += 0.2; });
    negative.forEach(word => { if (text.includes(word)) valence -= 0.2; });

    let arousal = 0.3; // baseline
    high_arousal.forEach(word => { if (text.includes(word)) arousal += 0.3; });

    return {
      valence: Math.max(-1, Math.min(1, valence)),
      arousal: Math.max(0, Math.min(1, arousal)),
      dominance: 0.5 // neutral baseline
    };
  }

  private assessMemoryQuality(results: PromiseSettledResult<any>[]): 'full' | 'partial' | 'minimal' {
    const successful = results.filter(r => r.status === 'fulfilled').length;
    const total = results.length;
    
    if (successful >= 4) return 'full';
    if (successful >= 2) return 'partial';
    return 'minimal';
  }

  private extractRelevantSection(content: string, query: string): string {
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 10);
    
    // Simple relevance scoring based on keyword overlap
    const queryWords = query.toLowerCase().split(' ').filter(w => w.length > 2);
    
    let bestSentence = sentences[0] || '';
    let bestScore = 0;
    
    for (const sentence of sentences.slice(0, 20)) { // Check first 20 sentences
      const sentenceWords = sentence.toLowerCase().split(' ');
      const score = queryWords.reduce((acc, word) => {
        return acc + (sentenceWords.some(sw => sw.includes(word)) ? 1 : 0);
      }, 0);
      
      if (score > bestScore) {
        bestScore = score;
        bestSentence = sentence;
      }
    }
    
    // Clean and truncate
    const cleaned = bestSentence.trim();
    return cleaned.length > 200 
      ? cleaned.substring(0, 200) + '...' 
      : cleaned;
  }

  private async getFallbackContext(
    userId: string,
    userInput: string
  ): Promise<MemoryContext> {
    return {
      session: [],
      journals: [],
      files: [],
      longTerm: null,
      symbolic: null,
      shadow: null,
      metadata: {
        timestamp: new Date(),
        phase: { name: 'Unknown', stage: 0, description: 'Context unavailable' },
        emotionalState: { valence: 0, arousal: 0.5, dominance: 0.5 },
        memoryQuality: 'minimal'
      }
    };
  }

  /**
   * Store new conversation turn for future context
   */
  async updateSessionMemory(
    userId: string,
    userMessage: string,
    assistantResponse: string
  ): Promise<void> {
    try {
      // In production, store in Redis/session store
      console.log(`Updating session memory for user ${userId}`);
    } catch (error) {
      console.error('Session memory update error:', error);
    }
  }

  /**
   * Build system prompt from memory context with citations
   */
  buildSystemPrompt(context: MemoryContext, basePrompt: string): string {
    const sections = [
      basePrompt,
      
      context.longTerm && `User Profile:
- Phase: ${context.longTerm.currentPhase}  
- Oracle Sessions: ${context.longTerm.oracleHistory?.length || 0}`,

      context.files.length > 0 && `Recently Uploaded Files (cite when referencing):
${context.files.map(f => `- "${f.fileName}" (uploaded ${f.citation?.uploadDate}): ${f.summary}
  Most relevant section: "${f.citation?.relevantSection}"
  Confidence: ${((f.citation?.confidence || 0) * 100).toFixed(0)}%`).join('\n')}
Key Topics: ${Array.from(new Set(context.files.flatMap(f => f.keyTopics))).join(', ')}

CITATION FORMAT: When referencing uploaded files, use:
"In your [fileName] (uploaded [date]), you mentioned [relevant content]..."
Example: "In your research-notes.pdf (uploaded Mon, Jan 15), you explored the concept of flow states..."`,
      
      context.journals.length > 0 && `Recent Journal Entries:
${context.journals.map(j => `- ${j.date.toLocaleDateString()}: ${j.summary}`).join('\n')}`,
      
      context.session.length > 0 && `Conversation History:
${context.session.slice(-5).map(t => `${t.role}: ${t.content}`).join('\n')}`,
      
      context.symbolic && `Archetypal Context:
- Dominant: ${context.symbolic.dominantArchetype}
- Elemental: ${context.symbolic.elementalResonance}`,
      
      `Current Emotional State: Valence ${context.metadata.emotionalState.valence.toFixed(1)}, Arousal ${context.metadata.emotionalState.arousal.toFixed(1)}`,
      `Memory Quality: ${context.metadata.memoryQuality}`
    ];
    
    return sections.filter(Boolean).join('\n\n---\n\n');
  }
}

// Singleton instance
export const memoryOrchestrator = new MemoryOrchestrator();