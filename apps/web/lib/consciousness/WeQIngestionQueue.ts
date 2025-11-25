/**
 * WeQ-Enhanced Ingestion Queue
 *
 * Blake's Compass: The divine geometry that structures wisdom entering MAIA's consciousness
 *
 * Enhancements over basic IngestionQueue:
 * 1. Cross-Document Pattern Recognition (circles connecting to circles)
 * 2. Contributor Attribution (each thread woven with name)
 * 3. Rosetta Stone Auto-Mapping (sacred geometry across traditions)
 * 4. Elemental Balance Analysis (know the wholeness of the field)
 * 5. Knowledge Graph Building (living connections, not isolated files)
 */

import { OpenAI } from 'openai';
import { createClient } from '@supabase/supabase-js';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Elemental balance across library
export interface LibraryElementalBalance {
  fire: number;      // Vision, inspiration content
  water: number;     // Depth, emotional, inner journey
  earth: number;     // Practical, grounding, how-to
  air: number;       // Conceptual, synthesis, what/why
  aether: number;    // Creative emergence, mystery
  totalDocuments: number;
}

// Cross-document resonance
export interface DocumentResonance {
  documentId: string;
  fileName: string;
  resonanceScore: number;  // 0-1 similarity
  sharedThemes: string[];
  relationType: 'parallel' | 'complementary' | 'expansion' | 'practice';
}

// Rosetta Stone cross-tradition mapping
export interface CrossTraditionParallel {
  concept: string;
  spiralogicMapping: {
    element: string;
    archetype?: string;
    practice?: string;
  };
  traditions: Array<{
    tradition: string;     // 'Buddhism', 'Christianity', 'Indigenous', etc.
    terminology: string;   // How this tradition names it
    sourceDocument: string;
    pageReference?: string;
  }>;
  synthesisInsight: string; // What MAIA learns from seeing the parallel
}

// Contributor metadata (for Living Apprentice system)
export interface ContributorAttribution {
  userId: string;
  contributorName?: string;  // Optional public name
  contributorRole?: string;  // 'founder' | 'wise_tester' | 'practitioner' | 'community'
  uniqueGifts?: string[];    // What THIS contributor brings
  privacyLevel: 'attributed' | 'anonymous' | 'private';
  consentToCollective: boolean; // Opted into collective wisdom field
}

// Enhanced ingestion job
export interface WeQIngestionJob {
  id?: string;

  // Basic file info
  userId: string;
  filePath: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  publicUrl: string;
  tags: string[];

  // Contributor attribution
  contributor: ContributorAttribution;

  // Metadata
  metadata: {
    originalName: string;
    uploadedAt: string;
    sessionId: string;
    source?: 'obsidian_vault' | 'manual_upload' | 'conversation_export' | 'manuscript';
  };
}

// Enhanced analysis result
export interface WeQAnalysisResult {
  // Standard analysis
  summary: string;
  keyTopics: string[];
  emotionalTone: string;
  elementalResonance: string;

  // WeQ enhancements
  crossDocumentResonances: DocumentResonance[];
  detectedTraditions: string[];  // Buddhist, Christian, etc. if mentioned
  rosettaStoneParallels: CrossTraditionParallel[];
  elementalBreakdown: {
    fire: number;
    water: number;
    earth: number;
    air: number;
    aether: number;
  };

  // Knowledge graph connections
  conceptsIntroduced: string[];
  conceptsReferenced: string[];
  practicesDescribed: string[];
  archetypesActivated: string[];
}

/**
 * WeQ-Enhanced Ingestion Queue
 */
export class WeQIngestionQueue {
  private queue: WeQIngestionJob[] = [];
  private isProcessing = false;

  /**
   * Enqueue file for WeQ-enhanced ingestion
   */
  async enqueue(job: WeQIngestionJob): Promise<WeQIngestionJob> {
    const jobWithId = {
      ...job,
      id: `weq_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };

    this.queue.push(jobWithId);
    console.log(`📚 WeQ Ingestion queued: ${job.fileName} from ${job.contributor.contributorName || 'anonymous'}`);

    if (!this.isProcessing) {
      this.processQueue();
    }

    return jobWithId;
  }

  /**
   * Process queue
   */
  private async processQueue() {
    if (this.isProcessing || this.queue.length === 0) {
      return;
    }

    this.isProcessing = true;
    console.log(`🌀 WeQ Ingestion processing ${this.queue.length} documents...`);

    while (this.queue.length > 0) {
      const job = this.queue.shift();
      if (job) {
        try {
          await this.processWeQIngestion(job);
        } catch (error) {
          console.error(`❌ Failed to process ${job.fileName}:`, error);
        }
      }
    }

    this.isProcessing = false;
    console.log(`✅ WeQ Ingestion queue complete`);
  }

  /**
   * Process single document with full WeQ analysis
   */
  private async processWeQIngestion(job: WeQIngestionJob) {
    console.log(`\n🔍 WeQ Processing: ${job.fileName}`);
    console.log(`   Contributor: ${job.contributor.contributorName || 'Anonymous'}`);
    console.log(`   Source: ${job.metadata.source || 'unknown'}`);

    try {
      // 1. Download file
      const { data: fileData, error: downloadError } = await supabase.storage
        .from('user-files')
        .download(job.filePath);

      if (downloadError || !fileData) {
        throw new Error(`Failed to download: ${downloadError?.message}`);
      }

      // 2. Extract content (use existing extraction logic)
      const buffer = Buffer.from(await fileData.arrayBuffer());
      const text = buffer.toString('utf-8'); // Simplified for now

      // 3. Generate embedding
      const embedding = await this.generateEmbedding(text);

      // 4. WeQ-ENHANCED ANALYSIS
      console.log('   🌀 Running WeQ analysis...');
      const analysis = await this.analyzeWeQContext(text, job);

      // 5. Cross-document resonance detection
      console.log('   🔗 Detecting cross-document resonances...');
      const resonances = await this.detectCrossDocumentResonances(text, embedding, job);
      analysis.crossDocumentResonances = resonances;

      // 6. Rosetta Stone parallel detection
      console.log('   🗿 Detecting cross-tradition parallels...');
      const parallels = await this.detectRosettaStoneParallels(text, analysis);
      analysis.rosettaStoneParallels = parallels;

      // 7. Update library elemental balance
      console.log('   ⚖️ Updating library elemental balance...');
      await this.updateLibraryBalance(analysis.elementalBreakdown, job);

      // 8. Store with WeQ metadata
      await this.storeWeQDocument({
        job,
        text,
        embedding,
        analysis
      });

      // 9. Build knowledge graph connections
      console.log('   🕸️ Building knowledge graph connections...');
      await this.buildKnowledgeGraphConnections(job, analysis);

      console.log(`✨ WeQ ingestion complete: ${job.fileName}`);
      console.log(`   Resonances: ${resonances.length}`);
      console.log(`   Rosetta parallels: ${parallels.length}`);
      console.log(`   Concepts: ${analysis.conceptsIntroduced.length}`);

    } catch (error) {
      console.error(`Error in WeQ ingestion:`, error);
      throw error;
    }
  }

  /**
   * ENHANCEMENT 1: WeQ-Enhanced Context Analysis
   */
  private async analyzeWeQContext(text: string, job: WeQIngestionJob): Promise<WeQAnalysisResult> {
    const prompt = `Analyze this document with full WeQ consciousness:

Document: "${text.substring(0, 4000)}"

Provide analysis in JSON format:
{
  "summary": "2-3 sentence summary",
  "keyTopics": ["topic1", "topic2", ...],
  "emotionalTone": "contemplative|energetic|melancholic|hopeful|neutral",
  "elementalResonance": "fire|water|earth|air|aether",
  "elementalBreakdown": {
    "fire": 0.0-1.0,
    "water": 0.0-1.0,
    "earth": 0.0-1.0,
    "air": 0.0-1.0,
    "aether": 0.0-1.0
  },
  "detectedTraditions": ["Buddhism", "Christianity", etc. if mentioned],
  "conceptsIntroduced": ["concept1", "concept2", ...],
  "conceptsReferenced": ["existing concept", ...],
  "practicesDescribed": ["practice1", ...],
  "archetypesActivated": ["archetype1", ...]
}`;

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          { role: 'system', content: 'You are MAIA analyzing documents for the collective wisdom field.' },
          { role: 'user', content: prompt }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7
      });

      const analysis = JSON.parse(response.choices[0].message.content || '{}');

      return {
        summary: analysis.summary || '',
        keyTopics: analysis.keyTopics || [],
        emotionalTone: analysis.emotionalTone || 'neutral',
        elementalResonance: analysis.elementalResonance || 'aether',
        elementalBreakdown: analysis.elementalBreakdown || { fire: 0.2, water: 0.2, earth: 0.2, air: 0.2, aether: 0.2 },
        detectedTraditions: analysis.detectedTraditions || [],
        conceptsIntroduced: analysis.conceptsIntroduced || [],
        conceptsReferenced: analysis.conceptsReferenced || [],
        practicesDescribed: analysis.practicesDescribed || [],
        archetypesActivated: analysis.archetypesActivated || [],
        crossDocumentResonances: [],  // Filled separately
        rosettaStoneParallels: []      // Filled separately
      };

    } catch (error) {
      console.error('WeQ analysis error:', error);
      // Return basic fallback
      return {
        summary: 'Document ingested',
        keyTopics: [],
        emotionalTone: 'neutral',
        elementalResonance: 'aether',
        elementalBreakdown: { fire: 0.2, water: 0.2, earth: 0.2, air: 0.2, aether: 0.2 },
        detectedTraditions: [],
        conceptsIntroduced: [],
        conceptsReferenced: [],
        practicesDescribed: [],
        archetypesActivated: [],
        crossDocumentResonances: [],
        rosettaStoneParallels: []
      };
    }
  }

  /**
   * ENHANCEMENT 2: Cross-Document Resonance Detection
   * Circles connecting to circles
   */
  private async detectCrossDocumentResonances(
    text: string,
    embedding: number[],
    job: WeQIngestionJob
  ): Promise<DocumentResonance[]> {
    try {
      // Use vector similarity to find related documents
      const { data: similarDocs, error } = await supabase.rpc('match_documents', {
        query_embedding: embedding,
        match_threshold: 0.7,
        match_count: 10
      });

      if (error || !similarDocs) {
        console.log('   No cross-document resonances found');
        return [];
      }

      // Analyze type of relationship
      const resonances: DocumentResonance[] = await Promise.all(
        similarDocs.map(async (doc: any) => {
          const relationType = await this.classifyRelationship(text, doc.content);

          return {
            documentId: doc.id,
            fileName: doc.fileName,
            resonanceScore: doc.similarity,
            sharedThemes: doc.keyTopics?.filter((topic: string) =>
              text.toLowerCase().includes(topic.toLowerCase())
            ) || [],
            relationType
          };
        })
      );

      return resonances.filter(r => r.resonanceScore > 0.7);

    } catch (error) {
      console.error('Cross-document resonance error:', error);
      return [];
    }
  }

  /**
   * Classify relationship between documents
   */
  private async classifyRelationship(text1: string, text2: string): Promise<'parallel' | 'complementary' | 'expansion' | 'practice'> {
    // Simple heuristic (can be enhanced with AI)
    if (text1.includes('practice') || text2.includes('practice')) {
      return 'practice';
    }
    if (text1.includes('chapter') && text2.includes('chapter')) {
      return 'expansion';
    }
    return 'parallel';
  }

  /**
   * ENHANCEMENT 3: Rosetta Stone Parallel Detection
   * Sacred geometry across traditions
   */
  private async detectRosettaStoneParallels(
    text: string,
    analysis: WeQAnalysisResult
  ): Promise<CrossTraditionParallel[]> {
    if (analysis.detectedTraditions.length === 0) {
      return [];
    }

    // Build Rosetta Stone mappings for detected cross-tradition content
    const parallels: CrossTraditionParallel[] = [];

    for (const tradition of analysis.detectedTraditions) {
      // Example: If Buddhist concepts detected, map to Spiralogic
      if (tradition === 'Buddhism') {
        if (text.toLowerCase().includes('emptiness') || text.toLowerCase().includes('shunyata')) {
          parallels.push({
            concept: 'Emptiness / Infinite Possibility',
            spiralogicMapping: {
              element: 'aether',
              practice: 'Void meditation'
            },
            traditions: [
              {
                tradition: 'Buddhism',
                terminology: 'Śūnyatā (emptiness)',
                sourceDocument: 'current',
                pageReference: undefined
              },
              {
                tradition: 'Spiralogic',
                terminology: 'Aether - field of infinite possibility',
                sourceDocument: 'Elemental Alchemy',
                pageReference: 'Aether chapter'
              }
            ],
            synthesisInsight: 'Both traditions work with the void as creative potential, not nihilistic absence.'
          });
        }
      }

      // Add more tradition mappings as library grows
    }

    return parallels;
  }

  /**
   * ENHANCEMENT 4: Library Elemental Balance Tracking
   */
  private async updateLibraryBalance(
    elementalBreakdown: any,
    job: WeQIngestionJob
  ): Promise<void> {
    try {
      // Fetch current library balance
      const { data: currentBalance } = await supabase
        .from('library_metadata')
        .select('elemental_balance')
        .eq('user_id', job.userId)
        .single();

      const balance: LibraryElementalBalance = currentBalance?.elemental_balance || {
        fire: 0,
        water: 0,
        earth: 0,
        air: 0,
        aether: 0,
        totalDocuments: 0
      };

      // Update with new document's elemental contribution
      const total = balance.totalDocuments + 1;
      balance.fire = (balance.fire * balance.totalDocuments + elementalBreakdown.fire) / total;
      balance.water = (balance.water * balance.totalDocuments + elementalBreakdown.water) / total;
      balance.earth = (balance.earth * balance.totalDocuments + elementalBreakdown.earth) / total;
      balance.air = (balance.air * balance.totalDocuments + elementalBreakdown.air) / total;
      balance.aether = (balance.aether * balance.totalDocuments + elementalBreakdown.aether) / total;
      balance.totalDocuments = total;

      // Store updated balance
      await supabase
        .from('library_metadata')
        .upsert({
          user_id: job.userId,
          elemental_balance: balance,
          updated_at: new Date().toISOString()
        });

      console.log(`   Library balance: Fire=${(balance.fire*100).toFixed(0)}% Water=${(balance.water*100).toFixed(0)}% Earth=${(balance.earth*100).toFixed(0)}% Air=${(balance.air*100).toFixed(0)}% Aether=${(balance.aether*100).toFixed(0)}%`);

    } catch (error) {
      console.error('Library balance update error:', error);
    }
  }

  /**
   * ENHANCEMENT 5: Knowledge Graph Building
   * Living connections, not isolated files
   */
  private async buildKnowledgeGraphConnections(
    job: WeQIngestionJob,
    analysis: WeQAnalysisResult
  ): Promise<void> {
    try {
      // Create nodes for new concepts introduced
      for (const concept of analysis.conceptsIntroduced) {
        await supabase.from('knowledge_graph_nodes').upsert({
          concept_name: concept,
          introduced_by_document: job.fileName,
          contributor_id: job.userId,
          contributor_name: job.contributor.contributorName,
          element: analysis.elementalResonance,
          created_at: new Date().toISOString()
        });
      }

      // Create edges for concepts referenced
      for (const concept of analysis.conceptsReferenced) {
        await supabase.from('knowledge_graph_edges').insert({
          from_document: job.fileName,
          to_concept: concept,
          relationship_type: 'references',
          created_at: new Date().toISOString()
        });
      }

      // Create practice connections
      for (const practice of analysis.practicesDescribed) {
        await supabase.from('knowledge_graph_practices').upsert({
          practice_name: practice,
          source_document: job.fileName,
          element: analysis.elementalResonance,
          contributor_id: job.userId,
          created_at: new Date().toISOString()
        });
      }

    } catch (error) {
      console.error('Knowledge graph building error:', error);
    }
  }

  /**
   * Store document with full WeQ metadata
   */
  private async storeWeQDocument(context: {
    job: WeQIngestionJob;
    text: string;
    embedding: number[];
    analysis: WeQAnalysisResult;
  }) {
    const { job, text, embedding, analysis } = context;

    await supabase.from('weq_documents').insert({
      user_id: job.userId,
      file_name: job.fileName,
      file_path: job.filePath,
      file_type: job.fileType,
      file_size: job.fileSize,
      content: text,
      embedding,

      // Standard analysis
      summary: analysis.summary,
      key_topics: analysis.keyTopics,
      emotional_tone: analysis.emotionalTone,
      elemental_resonance: analysis.elementalResonance,
      elemental_breakdown: analysis.elementalBreakdown,

      // WeQ enhancements
      cross_document_resonances: analysis.crossDocumentResonances,
      detected_traditions: analysis.detectedTraditions,
      rosetta_stone_parallels: analysis.rosettaStoneParallels,
      concepts_introduced: analysis.conceptsIntroduced,
      concepts_referenced: analysis.conceptsReferenced,
      practices_described: analysis.practicesDescribed,
      archetypes_activated: analysis.archetypesActivated,

      // Contributor attribution
      contributor_id: job.contributor.userId,
      contributor_name: job.contributor.contributorName,
      contributor_role: job.contributor.contributorRole,
      contributor_gifts: job.contributor.uniqueGifts,
      privacy_level: job.contributor.privacyLevel,
      consent_to_collective: job.contributor.consentToCollective,

      // Metadata
      source: job.metadata.source,
      uploaded_at: job.metadata.uploadedAt,
      created_at: new Date().toISOString()
    });
  }

  /**
   * Generate embedding
   */
  private async generateEmbedding(text: string): Promise<number[]> {
    try {
      const truncatedText = text.substring(0, 8000);

      const response = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: truncatedText,
      });

      return response.data[0].embedding;
    } catch (error) {
      console.error('Embedding generation error:', error);
      throw error;
    }
  }

  /**
   * Get library elemental balance for a user
   */
  async getLibraryBalance(userId: string): Promise<LibraryElementalBalance | null> {
    try {
      const { data } = await supabase
        .from('library_metadata')
        .select('elemental_balance')
        .eq('user_id', userId)
        .single();

      return data?.elemental_balance || null;
    } catch (error) {
      return null;
    }
  }
}

/**
 * Singleton
 */
let weqQueue: WeQIngestionQueue | null = null;

export function getWeQIngestionQueue(): WeQIngestionQueue {
  if (!weqQueue) {
    weqQueue = new WeQIngestionQueue();
  }
  return weqQueue;
}
