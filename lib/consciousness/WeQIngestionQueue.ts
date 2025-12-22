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
import { query } from '@/lib/db/postgres';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

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
      // 1. Fetch file content from database
      const fileResult = await query(
        'SELECT content FROM user_files WHERE file_path = $1',
        [job.filePath]
      );

      if (!fileResult.rows || fileResult.rows.length === 0) {
        throw new Error(`File not found: ${job.filePath}`);
      }

      // 2. Extract content
      const text = fileResult.rows[0].content || '';

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
      // Note: Requires pgvector extension and custom function
      const similarDocsResult = await query(`
        SELECT id, file_name, content, key_topics,
               1 - (embedding <=> $1::vector) as similarity
        FROM weq_documents
        WHERE user_id = $2
          AND 1 - (embedding <=> $1::vector) > $3
        ORDER BY similarity DESC
        LIMIT $4
      `, [JSON.stringify(embedding), job.userId, 0.7, 10]);

      const similarDocs = similarDocsResult.rows;

      if (!similarDocs || similarDocs.length === 0) {
        console.log('   No cross-document resonances found');
        return [];
      }

      // Analyze type of relationship
      const resonances: DocumentResonance[] = await Promise.all(
        similarDocs.map(async (doc: any) => {
          const relationType = await this.classifyRelationship(text, doc.content);

          return {
            documentId: doc.id,
            fileName: doc.file_name,
            resonanceScore: doc.similarity,
            sharedThemes: doc.key_topics?.filter((topic: string) =>
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
      const currentBalanceResult = await query(
        'SELECT elemental_balance FROM library_metadata WHERE user_id = $1',
        [job.userId]
      );

      const balance: LibraryElementalBalance = currentBalanceResult.rows[0]?.elemental_balance || {
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
      await query(`
        INSERT INTO library_metadata (user_id, elemental_balance, updated_at)
        VALUES ($1, $2, $3)
        ON CONFLICT (user_id) DO UPDATE SET
          elemental_balance = $2,
          updated_at = $3
      `, [job.userId, JSON.stringify(balance), new Date().toISOString()]);

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
        await query(`
          INSERT INTO knowledge_graph_nodes (
            concept_name, introduced_by_document, contributor_id, contributor_name, element, created_at
          ) VALUES ($1, $2, $3, $4, $5, $6)
          ON CONFLICT (concept_name) DO UPDATE SET
            introduced_by_document = $2,
            contributor_id = $3,
            contributor_name = $4,
            element = $5
        `, [
          concept,
          job.fileName,
          job.userId,
          job.contributor.contributorName,
          analysis.elementalResonance,
          new Date().toISOString()
        ]);
      }

      // Create edges for concepts referenced
      for (const concept of analysis.conceptsReferenced) {
        await query(`
          INSERT INTO knowledge_graph_edges (
            from_document, to_concept, relationship_type, created_at
          ) VALUES ($1, $2, $3, $4)
        `, [
          job.fileName,
          concept,
          'references',
          new Date().toISOString()
        ]);
      }

      // Create practice connections
      for (const practice of analysis.practicesDescribed) {
        await query(`
          INSERT INTO knowledge_graph_practices (
            practice_name, source_document, element, contributor_id, created_at
          ) VALUES ($1, $2, $3, $4, $5)
          ON CONFLICT (practice_name) DO UPDATE SET
            source_document = $2,
            element = $3,
            contributor_id = $4
        `, [
          practice,
          job.fileName,
          analysis.elementalResonance,
          job.userId,
          new Date().toISOString()
        ]);
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

    await query(`
      INSERT INTO weq_documents (
        user_id, file_name, file_path, file_type, file_size, content, embedding,
        summary, key_topics, emotional_tone, elemental_resonance, elemental_breakdown,
        cross_document_resonances, detected_traditions, rosetta_stone_parallels,
        concepts_introduced, concepts_referenced, practices_described, archetypes_activated,
        contributor_id, contributor_name, contributor_role, contributor_gifts,
        privacy_level, consent_to_collective, source, uploaded_at, created_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15,
        $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28
      )
    `, [
      job.userId,
      job.fileName,
      job.filePath,
      job.fileType,
      job.fileSize,
      text,
      JSON.stringify(embedding),
      analysis.summary,
      JSON.stringify(analysis.keyTopics),
      analysis.emotionalTone,
      analysis.elementalResonance,
      JSON.stringify(analysis.elementalBreakdown),
      JSON.stringify(analysis.crossDocumentResonances),
      JSON.stringify(analysis.detectedTraditions),
      JSON.stringify(analysis.rosettaStoneParallels),
      JSON.stringify(analysis.conceptsIntroduced),
      JSON.stringify(analysis.conceptsReferenced),
      JSON.stringify(analysis.practicesDescribed),
      JSON.stringify(analysis.archetypesActivated),
      job.contributor.userId,
      job.contributor.contributorName,
      job.contributor.contributorRole,
      JSON.stringify(job.contributor.uniqueGifts),
      job.contributor.privacyLevel,
      job.contributor.consentToCollective,
      job.metadata.source,
      job.metadata.uploadedAt,
      new Date().toISOString()
    ]);
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
      const result = await query(
        'SELECT elemental_balance FROM library_metadata WHERE user_id = $1',
        [userId]
      );

      return result.rows[0]?.elemental_balance || null;
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
