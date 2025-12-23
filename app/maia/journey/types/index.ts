/**
 * Journey Page - TypeScript Types
 *
 * Type definitions for all five Spiralogic elements in the Journey Page.
 * Includes API responses, component props, and state shapes.
 *
 * Phase: 4.4-C (Five-Element Integration)
 * Created: December 23, 2024
 */

// ============================================================================
// Base Types
// ============================================================================

export type FacetCode =
  | 'W1' | 'W2' | 'W3'  // Water: Safety, Shadow, Compassion
  | 'F1' | 'F2' | 'F3'  // Fire: Spark, Flame, Forge
  | 'E1' | 'E2' | 'E3'  // Earth: Seed, Root, Harvest
  | 'A1' | 'A2' | 'A3'  // Air: Breath, Voice, Wisdom
  | 'Æ1' | 'Æ2' | 'Æ3'; // Aether: Intuition, Union, Emergence

export type ElementType = 'earth' | 'water' | 'fire' | 'air' | 'aether';

// ============================================================================
// 🫀 Earth Layer (Embodied Awareness)
// ============================================================================

export interface BiofieldMetrics {
  hrv: number;               // Heart rate variability (RMSSD)
  coherence: number;         // 0-1 cardiac coherence score
  voiceProsody: number;      // 0-1 voice affect score
  breathRate: number;        // Breaths per minute
  timestamp: string;
}

export interface BiofieldDataPoint {
  timestamp: string;
  hrv: number;
  coherence: number;
  voiceProsody: number;
}

// ============================================================================
// 💧 Water Layer (Emotional Flow)
// ============================================================================

export interface NarrativeThread {
  id: number;
  title: string;
  summary: string;
  facet: FacetCode;
  element: ElementType;
  coherenceScore: number;    // 0-1 resonance strength
  fragmentCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ThreadFragment {
  id: number;
  threadId: number;
  content: string;
  timestamp: string;
  biofieldSnapshot: BiofieldMetrics;
}

// ============================================================================
// 🔥 Fire Layer (Expression & Sovereignty)
// ============================================================================

export interface CoAuthorEdit {
  threadId: number;
  action: 'rename' | 'hide' | 'annotate' | 'merge';
  value: string;
  timestamp: string;
}

export interface SovereigntyControls {
  canRename: boolean;
  canHide: boolean;
  canAnnotate: boolean;
  canMerge: boolean;
}

// ============================================================================
// 🌬️ Air Layer (Reflection & Insight)
// ============================================================================

export interface Insight {
  id: string;
  type: 'pattern' | 'reflection' | 'question';
  text: string;
  confidence: number;        // 0-1 semantic confidence
  relatedThreadIds: number[];
  timestamp: string;
}

export interface Symbol {
  id: string;
  label: string;             // "Renewal", "Shadow", "Integration"
  archetype: string;         // Jungian archetype or Spiralogic motif
  frequency: number;         // How often this symbol appears
  threadIds: number[];       // Threads tagged with this symbol
  color: string;             // Hex color for visualization
}

export interface VoiceReflection {
  id: string;
  audioUrl: string;          // URL to audio file (local or blob)
  transcript: string;
  duration: number;          // Duration in seconds
  timestamp: string;
}

// API Response: GET /api/bardic/insights
export interface InsightsResponse {
  insights: Insight[];
  count: number;
}

// API Response: GET /api/bardic/symbols
export interface SymbolsResponse {
  symbols: Symbol[];
  count: number;
}

// ============================================================================
// ✨ Aether Layer (Integration & Meta-Awareness)
// ============================================================================

export interface Motif {
  id: string;
  pattern: string;           // "Fire → Water → Earth cycle"
  description: string;
  threadIds: number[];
  frequency: number;         // How many times this pattern repeats
  significance: number;      // 0-1 archetypal weight
}

export interface Cycle {
  id: string;
  name: string;              // "Weekly renewal rhythm"
  period: number;            // Duration in days
  amplitude: number;         // 0-1 strength of cycle
  phase: number;             // Current phase (0-1)
  nextPeak: string;          // ISO timestamp of next peak
}

export interface SynthesisReport {
  motifs: Motif[];
  cycles: Cycle[];
  growthArc: string;         // Prose summary of long-term trajectory
  coherenceTrend: number;    // -1 to 1 (declining → stable → rising)
  timestamp: string;
}

export interface CollectiveCoherence {
  groupCoherence: number;    // 0-1 anonymized group metric
  participantCount: number;
  trend: 'rising' | 'stable' | 'declining';
  timestamp: string;
}

// API Response: GET /api/bardic/synthesis?thread_ids={ids}
export interface SynthesisResponse {
  report: SynthesisReport;
  threadCount: number;
}

// API Response: GET /api/collective/coherence
export interface CollectiveCoherenceResponse {
  coherence: CollectiveCoherence;
}

// ============================================================================
// Spiral Visualization
// ============================================================================

export interface SpiralNode {
  threadId: number;
  position: { x: number; y: number; z: number };
  size: number;              // Based on coherence score
  color: string;             // Element color
  element: ElementType;
  facet: FacetCode;
}

export interface SpiralEdge {
  from: number;              // Thread ID
  to: number;                // Thread ID
  strength: number;          // 0-1 semantic similarity
  type: 'temporal' | 'thematic' | 'embodied';
}

// ============================================================================
// Component Props
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

export interface AetherFieldProps {
  coherence: number;         // 0-1 overall coherence
  animated: boolean;
}

export interface SynthesisPanelProps {
  visible: boolean;
  threadIds: number[];
  onClose: () => void;
}

export interface CollectiveCoherenceMeterProps {
  visible: boolean;
  coherence: CollectiveCoherence;
}

// ============================================================================
// Hooks Return Types
// ============================================================================

export interface UseThreadsResult {
  threads: NarrativeThread[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export interface UseInsightsResult {
  insights: Insight[];
  isLoading: boolean;
  error: Error | null;
}

export interface UseSynthesisResult {
  report: SynthesisReport | null;
  isLoading: boolean;
  error: Error | null;
}

export interface UseCollectiveResult {
  coherence: CollectiveCoherence | null;
  isLoading: boolean;
  error: Error | null;
}

export interface UseSymbolsResult {
  symbols: Symbol[];
  isLoading: boolean;
  error: Error | null;
}
