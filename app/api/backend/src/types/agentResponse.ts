/**
 * Agent Response Type Definitions
 * Standard response formats for all agent interactions
 */

import type { ExtractionResult } from '../../../../lib/intelligence/SymbolExtractionEngine';
import type { IPersonalOracleAgent } from '../../../../lib/oracle/PersonalOracleAgent';

export interface AgentResponse {
  // Core fields
  content: string;              // primary field
  response?: string;            // backward compatibility alias
  confidence: number;
  metadata: any;
  
  // Additional fields
  success?: boolean;
  agent?: string;
  element?: string;
  archetype?: string;
  archetypes?: string[];
  
  // Model and provider information
  model?: string;
  provider?: string;
  
  // Emotional and spiritual context
  emotionalTone?: {
    primary: string;
    intensity: number;
    valence: number;
  };
  
  spiritualContext?: {
    element: string;
    phase: string;
    lesson?: string;
  };

  // Phenomenological markers (Phase 4.2c)
  consciousState?: 'regulated' | 'dysregulated' | 'integrated';
  presenceDepth?: number; // 0-1: degree of attunement/embodiment
  coherenceLevel?: number; // 0-1: semantic and affective coherence

  // Dialogical dynamics (Phase 4.2c)
  dialogicalField?: {
    selfTone: string;
    otherTone: string;
    mutuality: number; // 0-1: relational resonance
  };
  empathicTone?: 'neutral' | 'compassionate' | 'curious' | 'direct';
  mirroringPhase?: 'mirror' | 'bridge' | 'approximate' | 'arrival';

  // Integration bridges (Phase 4.2c)
  oracleContext?: IPersonalOracleAgent;
  extractionSnapshot?: ExtractionResult;
  timestamp?: string; // ISO 8601 temporal coherence marker

  // Additional data
  suggestions?: string[];
  resources?: any[];
  actions?: AgentAction[];
  error?: string;
}

export interface AgentAction {
  type: 'reflection' | 'ritual' | 'journal' | 'meditation' | 'exploration';
  description: string;
  element?: string;
  duration?: string;
  urgency?: 'immediate' | 'soon' | 'whenever';
}
