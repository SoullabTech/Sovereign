/**
 * Master Intelligence Build System — Types
 *
 * The build layer for the federated multi-master architecture.
 * Each master has a distinct intelligence bundle (voice, stance, knowledge,
 * perception, method) that layers ON TOP of MAIA's substrate.
 *
 * MAIA stays responsible for: reasoning, continuity, safety, memory.
 * Masters provide: voice, stance, method, perceptual framing.
 *
 * This is not "many AIs." This is one intelligence expressing through many.
 */

// ═══════════════════════════════════════════════════════════════
// Extraction Types — the intelligence fragments extracted from source material
// ═══════════════════════════════════════════════════════════════

export type ExtractionType =
  | 'voice'             // how they sound — cadence, tone, rhetorical habits
  | 'knowledge'         // what they know — concepts, frameworks, definitions
  | 'perception'        // how they organize experience — what they notice first
  | 'method'            // what they actually do — sequences, interventions, practices
  | 'constraint'        // what they refuse or avoid
  | 'distortion'        // what they correct against — common errors
  | 'sequence'          // their process ordering — step-by-step flows
  | 'language_pattern'; // signature phrases, cadence markers

// ═══════════════════════════════════════════════════════════════
// Build Status — lifecycle of a compiled intelligence artifact
// ═══════════════════════════════════════════════════════════════

export type BuildStatus = 'draft' | 'validated' | 'active' | 'retired';

// ═══════════════════════════════════════════════════════════════
// Master Build — the compiled intelligence artifact
// ═══════════════════════════════════════════════════════════════

export interface MasterBuild {
  id: string;
  master_id: string;
  build_version: string;       // semver-ish: "1.0.0", "1.1.0"
  voice_block: string;         // compiled prompt block
  stance_block: string;        // compiled prompt block
  knowledge_block: string;     // compiled prompt block
  perceptual_block: string;    // compiled prompt block
  method_block?: string;       // compiled prompt block (optional — not all masters are method-led)
  safety_block?: string;       // master-specific safety (layered on canon, never overrides)
  status: BuildStatus;
  validation_notes?: string;
  created_by?: string;
  activated_by?: string;
  created_at: string;
  activated_at?: string;
  metadata: MasterBuildMetadata;
}

export interface MasterBuildMetadata {
  source_counts: Record<string, number>;
  validated_by?: string;
  total_tokens_estimate?: number;
  platform_services?: {
    astrology?: boolean;
    memoryPalace?: boolean;
    anamnesis?: boolean;
  };
}

/**
 * ResolvedMasterBuild — what the oracle route actually uses at runtime.
 * Includes the master's identity alongside the build content.
 */
export interface ResolvedMasterBuild extends MasterBuild {
  master_slug: string;
  master_display_name: string;
}

// ═══════════════════════════════════════════════════════════════
// Master Record — the identity registry
// ═══════════════════════════════════════════════════════════════

export type MasterStatus = 'draft' | 'active' | 'suspended';

export interface MasterRecord {
  id: string;
  slug: string;
  display_name: string;
  domain?: string;             // e.g. 'somatic therapy', 'EFT'
  modality?: string;           // e.g. 'one-on-one', 'group', 'training'
  active_build_id?: string;
  field_slug?: string;         // links to existing MasterField config for portal UI
  status: MasterStatus;
  created_at: string;
  updated_at: string;
}

// ═══════════════════════════════════════════════════════════════
// Master Document — source material (books, transcripts, sessions)
// ═══════════════════════════════════════════════════════════════

export type DocumentFormat = 'markdown' | 'transcript' | 'pdf' | 'audio' | 'video' | 'json';
export type ProcessingStatus = 'pending' | 'processing' | 'extracted' | 'failed';

export interface MasterDocument {
  id: string;
  master_id: string;
  title: string;
  source_type: string;         // 'book' | 'transcript' | 'interview' | 'video' | 'article'
  format: DocumentFormat;
  raw_content: string;
  content_hash: string;        // SHA256 for dedup
  source_url?: string;
  uploaded_by?: string;
  processing_status: ProcessingStatus;
  created_at: string;
}

// ═══════════════════════════════════════════════════════════════
// Master Extraction — intelligence fragments from documents
// ═══════════════════════════════════════════════════════════════

export interface MasterExtraction {
  id: string;
  master_id: string;
  document_id: string;
  extraction_type: ExtractionType;
  content: string;
  confidence: number;          // 0-1
  tags: string[];
  section_ref?: string;        // page/timestamp/heading ref back to source
  created_at: string;
}

// ═══════════════════════════════════════════════════════════════
// Master Correction — feedback from the master (co-training loop)
// ═══════════════════════════════════════════════════════════════

export type CorrectionType = 'thumbs' | 'felt_like_me' | 'rewrite' | 'note';
export type CorrectionSignal = 'positive' | 'negative' | 'neutral';

export interface MasterCorrection {
  id: string;
  master_id: string;
  member_id: string;
  turn_id?: string;
  correction_type: CorrectionType;
  original_content?: string;
  corrected_content?: string;  // highest value when correction_type = 'rewrite'
  signal: CorrectionSignal;
  context?: string;
  created_at: string;
}
