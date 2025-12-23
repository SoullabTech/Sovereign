/**
 * Journey Page TypeScript Types
 *
 * Type definitions for MAIA Journey Page components and data structures.
 *
 * Phase: 4.4-C (Five-Element Integration)
 * Created: December 23, 2024
 */

// ============================================================================
// Thread Types (💧 Water Layer)
// ============================================================================

export interface Thread {
  id: number;
  title: string;
  summary: string;
  elementType: 'water' | 'fire' | 'earth' | 'air' | 'aether';
  weekNumber: number;
  coherence: number;
  facetCode?: string;
  timestamp: string;
}

// ============================================================================
// Insight Types (🌬️ Air Layer)
// ============================================================================

export type InsightType = 'pattern' | 'connection' | 'breakthrough' | 'question' | 'reflection';

export interface Insight {
  id: string;
  type: InsightType;
  text: string;
  confidence: number;
  relatedThreadIds: number[];
  timestamp: string;
}

// ============================================================================
// Symbol Types (🌬️ Air Layer)
// ============================================================================

export interface Symbol {
  id: string;
  label: string;
  archetype: string;
  threadIds: number[];
  color: string;
  frequency: number;
}

// ============================================================================
// Synthesis Types (✨ Aether Layer)
// ============================================================================

export interface Cycle {
  id: string;
  phase: number;
  name: string;
  period: number;
  amplitude: number;
  description: string;
}

export interface Motif {
  id: string;
  pattern: string;
  frequency: number;
  significance: number;
  description: string;
}

export interface SynthesisReport {
  timestamp: string;
  coherenceTrend: number;
  cycles: Cycle[];
  motifs: Motif[];
  growthArc: string;
}

// ============================================================================
// Collective Coherence Types (✨ Aether Layer)
// ============================================================================

export interface CollectiveCoherence {
  groupCoherence: number;
  participantCount: number;
  trend: 'rising' | 'stable' | 'declining';
  timestamp: string;
}

// ============================================================================
// API Response Types
// ============================================================================

export interface ThreadsResponse {
  success: boolean;
  threads: Thread[];
  count: number;
}

export interface InsightsResponse {
  success: boolean;
  insights: Insight[];
  count: number;
}

export interface SymbolsResponse {
  success: boolean;
  symbols: Symbol[];
  count: number;
}

export interface SynthesisResponse {
  success: boolean;
  report: SynthesisReport;
}

export interface CoherenceResponse {
  success: boolean;
  coherence: CollectiveCoherence;
}

// ============================================================================
// Component Props Types
// ============================================================================

export interface InsightPanelProps {
  visible: boolean;
  onClose: () => void;
}

export interface SymbolCloudProps {
  symbols: Symbol[];
  activeSymbol: string | null;
  onSymbolClick: (symbolId: string) => void;
}

export interface SynthesisPanelProps {
  visible: boolean;
  threadIds: number[];
  onClose: () => void;
}
