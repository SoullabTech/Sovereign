/**
 * QUANTUM FIELD PERSISTENCE LAYER
 * Integrates Consciousness Field Engine with Qdrant Vector Database
 *
 * Qdrant serves as "Mycelial Network = Field Memory" - the substrate where
 * consciousness field states persist and can be retrieved for resonance analysis
 */

import { QdrantClient } from '@qdrant/js-client-rest';
import {
  ConsciousnessField,
  ConsciousnessFieldState,
  FieldInterference,
  ArchetypalGate
} from './ConsciousnessFieldEngine';

export interface FieldSearchResult {
  field: ConsciousnessField;
  similarity: number;
  resonanceAnalysis: {
    constructive: number;
    destructive: number;
    standingWaves: number[][];
  };
}

/**
 * Quantum Field Persistence - Qdrant integration for consciousness field storage
 */
export class QuantumFieldPersistence {
  private client: QdrantClient;
  private collectionName: string = 'consciousness_fields';

  constructor(qdrantUrl: string = 'http://localhost:6333') {
    this.client = new QdrantClient({ url: qdrantUrl });
  }

  /**
   * Initialize field collection in Qdrant
   */
  async initializeFieldCollection(): Promise<void> {
    try {
      // Check if collection exists
      const collections = await this.client.getCollections();
      const exists = collections.collections?.some(c => c.name === this.collectionName);

      if (!exists) {
        await this.client.createCollection(this.collectionName, {
          vectors: {
            size: 1536, // Standard embedding dimension
            distance: 'Cosine' // Perfect for consciousness field similarity
          }
        });

        console.log(`🧠 Consciousness field collection '${this.collectionName}' created`);
      }
    } catch (error) {
      console.error('Failed to initialize field collection:', error);
      throw error;
    }
  }

  /**
   * Store consciousness field in quantum substrate
   */
  async storeField(field: ConsciousnessField): Promise<void> {
    try {
      const payload = {
        id: field.id,
        resonanceFrequency: field.resonanceFrequency,
        coherenceLevel: field.coherenceLevel,
        timestamp: field.timestamp.toISOString(),
        participantId: field.participantId,
        archetypalElement: field.archetypalElement,
        patternSignatureCount: field.patternSignatures.length
      };

      await this.client.upsert(this.collectionName, {
        wait: true,
        points: [
          {
            id: field.id,
            vector: Array.from(field.vectorSpace),
            payload
          }
        ]
      });

      console.log(`✨ Field ${field.id} stored in quantum substrate`);
    } catch (error) {
      console.error(`Failed to store field ${field.id}:`, error);
      throw error;
    }
  }

  /**
   * Retrieve field by ID from quantum substrate
   */
  async retrieveField(fieldId: string): Promise<ConsciousnessField | null> {
    try {
      const response = await this.client.retrieve(this.collectionName, {
        ids: [fieldId],
        with_payload: true,
        with_vector: true
      });

      if (response.length === 0) return null;

      const point = response[0];
      const payload = point.payload as any;

      // Reconstruct consciousness field
      const fieldState: ConsciousnessFieldState = {
        id: point.id as string,
        vectorSpace: new Float32Array(point.vector as number[]),
        resonanceFrequency: payload.resonanceFrequency,
        coherenceLevel: payload.coherenceLevel,
        patternSignatures: [], // Pattern signatures not stored in vector DB
        timestamp: new Date(payload.timestamp),
        participantId: payload.participantId,
        archetypalElement: payload.archetypalElement
      };

      return new ConsciousnessField(fieldState);
    } catch (error) {
      console.error(`Failed to retrieve field ${fieldId}:`, error);
      return null;
    }
  }

  /**
   * Find resonant fields in consciousness substrate
   */
  async findResonantFields(
    queryField: ConsciousnessField,
    limit: number = 10,
    minSimilarity: number = 0.3
  ): Promise<FieldSearchResult[]> {
    try {
      const response = await this.client.search(this.collectionName, {
        vector: Array.from(queryField.vectorSpace),
        limit: limit,
        score_threshold: minSimilarity,
        with_payload: true,
        with_vector: true
      });

      const results: FieldSearchResult[] = [];

      for (const point of response) {
        const payload = point.payload as any;

        // Reconstruct field
        const fieldState: ConsciousnessFieldState = {
          id: point.id as string,
          vectorSpace: new Float32Array(point.vector as number[]),
          resonanceFrequency: payload.resonanceFrequency,
          coherenceLevel: payload.coherenceLevel,
          patternSignatures: [],
          timestamp: new Date(payload.timestamp),
          participantId: payload.participantId,
          archetypalElement: payload.archetypalElement
        };

        const resonantField = new ConsciousnessField(fieldState);

        // Analyze field interference
        const interferenceAnalysis = FieldInterference.analyze(queryField, resonantField);

        results.push({
          field: resonantField,
          similarity: point.score || 0,
          resonanceAnalysis: {
            constructive: interferenceAnalysis.constructiveStrength,
            destructive: interferenceAnalysis.destructiveStrength,
            standingWaves: interferenceAnalysis.standingWaves
          }
        });
      }

      console.log(`🌊 Found ${results.length} resonant fields for ${queryField.id}`);
      return results;
    } catch (error) {
      console.error(`Failed to search resonant fields:`, error);
      return [];
    }
  }

  /**
   * Find fields by archetypal element
   */
  async findFieldsByArchetype(
    element: 'Fire' | 'Water' | 'Earth' | 'Air' | 'Aether',
    limit: number = 20
  ): Promise<ConsciousnessField[]> {
    try {
      const response = await this.client.scroll(this.collectionName, {
        filter: {
          must: [
            {
              key: 'archetypalElement',
              match: { value: element }
            }
          ]
        },
        limit,
        with_payload: true,
        with_vector: true
      });

      const fields: ConsciousnessField[] = [];

      for (const point of response.points) {
        const payload = point.payload as any;

        const fieldState: ConsciousnessFieldState = {
          id: point.id as string,
          vectorSpace: new Float32Array(point.vector as number[]),
          resonanceFrequency: payload.resonanceFrequency,
          coherenceLevel: payload.coherenceLevel,
          patternSignatures: [],
          timestamp: new Date(payload.timestamp),
          participantId: payload.participantId,
          archetypalElement: payload.archetypalElement
        };

        fields.push(new ConsciousnessField(fieldState));
      }

      console.log(`${element === 'Fire' ? '🔥' : element === 'Water' ? '🌊' : element === 'Earth' ? '🌍' : element === 'Air' ? '💨' : '✨'} Found ${fields.length} ${element} fields`);
      return fields;
    } catch (error) {
      console.error(`Failed to find ${element} fields:`, error);
      return [];
    }
  }

  /**
   * Get field statistics from quantum substrate
   */
  async getFieldStatistics(): Promise<{
    totalFields: number;
    averageCoherence: number;
    averageFrequency: number;
    archetypeDistribution: Record<string, number>;
  }> {
    try {
      // Get total count
      const countResponse = await this.client.count(this.collectionName);
      const totalFields = countResponse.count;

      // Sample fields for statistics
      const sampleResponse = await this.client.scroll(this.collectionName, {
        limit: Math.min(1000, totalFields), // Sample up to 1000 fields
        with_payload: true
      });

      let totalCoherence = 0;
      let totalFrequency = 0;
      const archetypeDistribution: Record<string, number> = {
        Fire: 0, Water: 0, Earth: 0, Air: 0, Aether: 0, Unknown: 0
      };

      for (const point of sampleResponse.points) {
        const payload = point.payload as any;

        totalCoherence += payload.coherenceLevel || 0;
        totalFrequency += payload.resonanceFrequency || 0;

        const archetype = payload.archetypalElement || 'Unknown';
        archetypeDistribution[archetype] = (archetypeDistribution[archetype] || 0) + 1;
      }

      const sampleSize = sampleResponse.points.length;

      return {
        totalFields,
        averageCoherence: sampleSize > 0 ? totalCoherence / sampleSize : 0,
        averageFrequency: sampleSize > 0 ? totalFrequency / sampleSize : 0,
        archetypeDistribution
      };
    } catch (error) {
      console.error('Failed to get field statistics:', error);
      return {
        totalFields: 0,
        averageCoherence: 0,
        averageFrequency: 0,
        archetypeDistribution: { Fire: 0, Water: 0, Earth: 0, Air: 0, Aether: 0, Unknown: 0 }
      };
    }
  }

  /**
   * Clear all fields (use with caution)
   */
  async clearAllFields(): Promise<void> {
    try {
      await this.client.deleteCollection(this.collectionName);
      await this.initializeFieldCollection();
      console.log(`🧹 All consciousness fields cleared from quantum substrate`);
    } catch (error) {
      console.error('Failed to clear fields:', error);
      throw error;
    }
  }

  /**
   * Health check for field persistence system
   */
  async healthCheck(): Promise<{ healthy: boolean; details: any }> {
    try {
      const collections = await this.client.getCollections();
      const fieldCollection = collections.collections?.find(c => c.name === this.collectionName);

      if (!fieldCollection) {
        return {
          healthy: false,
          details: { error: 'Consciousness field collection not found' }
        };
      }

      const stats = await this.getFieldStatistics();

      return {
        healthy: true,
        details: {
          collection: fieldCollection,
          statistics: stats,
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      return {
        healthy: false,
        details: { error: error instanceof Error ? error.message : 'Unknown error' }
      };
    }
  }
}