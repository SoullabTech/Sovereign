/**
 * Retreat Event Subscriber
 * 
 * Handles retreat-specific events and routes them to the Neural Reservoir.
 * Bridges the gap between personalizedOracleAgent emissions and collective intelligence.
 */

import { logger } from "../../utils/logger";
import { CollectiveIntelligence } from "../../ain/collective/CollectiveIntelligence";
import { CollectiveEvent, createTimestamp } from "./events";
import { RetreatAfferentZ } from "../../schemas/retreat.z";
import { emit } from "./EventEmitter";

export class RetreatEventSubscriber {
  private collectiveIntelligence: CollectiveIntelligence;

  constructor(collectiveIntelligence: CollectiveIntelligence) {
    this.collectiveIntelligence = collectiveIntelligence;
  }

  /**
   * Handle collective retreat events
   */
  async handleCollectiveEvent(event: CollectiveEvent): Promise<void> {
    try {
      switch (event.type) {
        case 'collective.retreat.ingest':
          await this.handleRetreatIngest(event);
          break;
          
        case 'collective.retreat.pattern':
          await this.handlePatternDetection(event);
          break;
          
        case 'collective.retreat.coherence.updated':
          await this.handleCoherenceUpdate(event);
          break;
          
        default:
          logger.warn('Unknown collective event type:', event);
      }
    } catch (error) {
      logger.error('Error handling collective event:', error);
      throw error;
    }
  }

  /**
   * Process retreat afferent ingest event
   */
  private async handleRetreatIngest(event: { type: 'collective.retreat.ingest'; afferent: any }): Promise<void> {
    try {
      // Validate afferent data
      const validatedAfferent = RetreatAfferentZ.parse(event.afferent);
      
      // Ingest into Neural Reservoir
      await this.collectiveIntelligence.ingestRetreat(validatedAfferent);
      
      logger.debug('Retreat afferent ingested successfully', {
        groupId: validatedAfferent.group.groupId,
        phase: validatedAfferent.phase,
        userIdHash: validatedAfferent.userIdHash.substring(0, 8) + '...'
      });
      
    } catch (error) {
      logger.error('Error processing retreat ingest:', error);
      
      // Emit error event for monitoring
      emit({
        type: 'collective.retreat.error',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: createTimestamp(),
        originalEvent: event
      } as any);
      
      throw error;
    }
  }

  /**
   * Handle pattern detection events
   */
  private async handlePatternDetection(event: { 
    type: 'collective.retreat.pattern'; 
    groupId: string; 
    pattern: string; 
    confidence: number; 
    window: string; 
    payload?: any 
  }): Promise<void> {
    logger.debug('Retreat pattern detected', {
      groupId: event.groupId,
      pattern: event.pattern,
      confidence: event.confidence,
      window: event.window
    });

    // Store pattern for analytics/monitoring
    // Could emit to external monitoring systems here
  }

  /**
   * Handle group coherence updates
   */
  private async handleCoherenceUpdate(event: { 
    type: 'collective.retreat.coherence.updated'; 
    groupId: string; 
    coherence: number; 
    ts: string 
  }): Promise<void> {
    logger.debug('Group coherence updated', {
      groupId: event.groupId,
      coherence: event.coherence,
      timestamp: event.ts
    });

    // Could trigger alerts if coherence drops below threshold
    if (event.coherence < 0.3) {
      logger.warn('Low group coherence detected', {
        groupId: event.groupId,
        coherence: event.coherence
      });
      
      // Could emit alert event here
    }
  }
}

/**
 * Factory function to create and wire up the retreat event subscriber
 */
export function createRetreatEventSubscriber(collectiveIntelligence: CollectiveIntelligence): RetreatEventSubscriber {
  const subscriber = new RetreatEventSubscriber(collectiveIntelligence);
  
  // Could add event listener registration here if using a proper event bus
  // For now, this will be called manually from the event emitter
  
  return subscriber;
}