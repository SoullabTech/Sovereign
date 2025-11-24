/**
 * Agent Response Type Definitions
 * Standard response formats for all agent interactions
 */

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
