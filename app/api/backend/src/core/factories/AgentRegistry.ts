// AgentRegistry - Manages agent instances and creation

import { FireAgent } from '../../agents/FireAgent';
import { WaterAgent } from '../../agents/WaterAgent';
import { EarthAgent } from '../../agents/EarthAgent';
import { AirAgent } from '../../agents/AirAgent';
import { AetherAgent } from '../../agents/AetherAgent';
import { logger } from '../../utils/logger';

export class AgentRegistry {
  private static agents = new Map<string, any>();
  
  static register(name: string, agentInstance: any): void {
    this.agents.set(name, agentInstance);
  }
  
  static get(name: string): any {
    return this.agents.get(name);
  }
  
  static has(name: string): boolean {
    return this.agents.has(name);
  }
  
  static list(): string[] {
    return Array.from(this.agents.keys());
  }
  
  static clear(): void {
    this.agents.clear();
  }

  // Instance methods for backward compatibility
  createAgent(element: string): any {
    logger.info(`Creating agent for element: ${element}`);
    
    try {
      switch(element.toLowerCase()) {
        case 'fire':
          return new FireAgent();
        case 'water':
          return new WaterAgent();
        case 'earth':
          return new EarthAgent();
        case 'air':
          return new AirAgent();
        case 'aether':
          return new AetherAgent();
        default:
          logger.warn(`Unknown element: ${element}, returning mock agent`);
          return {
            processQuery: async (input: string) => ({
              content: `Mock response for ${element} element: ${input}`,
              confidence: 0.8,
              metadata: {
                archetype: element.charAt(0).toUpperCase() + element.slice(1),
                symbols: [element],
                phase: 'guidance'
              }
            })
          };
      }
    } catch (error) {
      logger.error(`Failed to create agent for element ${element}:`, error);
      // Return mock agent as fallback
      return {
        processQuery: async (input: string) => ({
          content: `[Fallback] Response for ${element} element: ${input}`,
          confidence: 0.5,
          metadata: {
            archetype: element.charAt(0).toUpperCase() + element.slice(1),
            symbols: [element],
            phase: 'guidance',
            error: true
          }
        })
      };
    }
  }
}