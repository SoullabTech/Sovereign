/**
 * PRACTITIONER CASELOAD SYSTEM
 *
 * Enables practitioners to manage client cases with MAIA
 * as a clinical consultation partner.
 *
 * Components:
 * - CaseStore: Database operations for cases, notes, capture links
 * - CaseMemoryService: Semantic memory with embeddings
 * - CasePatternService: Pattern aggregation and analysis
 * - types: TypeScript types for the caseload system
 *
 * API Routes:
 * - GET/POST /api/caseload - List/create cases
 * - GET/PATCH/DELETE /api/caseload/[caseId] - Case operations
 * - GET/POST /api/caseload/[caseId]/notes - Note operations
 * - GET/POST /api/caseload/[caseId]/memories - Memory operations
 * - POST /api/caseload/[caseId]/memories/search - Semantic search
 * - GET /api/caseload/[caseId]/patterns - Pattern recompute
 *
 * Database Tables:
 * - practitioner_cases: Client cases with Spiralogic positioning
 * - case_notes: Session documentation
 * - case_memories: MAIA's case-scoped memories
 * - case_memory_chunks: Chunked text with embeddings
 * - case_patterns: Precomputed pattern aggregations
 * - maia_consultations: Consultation dialogues
 * - case_capture_links: Links Note mode recordings to cases
 */

export * from './types';
export { CaseStore } from './CaseStore';
export { CaseMemoryService } from './CaseMemoryService';
export { CasePatternService } from './CasePatternService';
export { CaseConsultationService } from './CaseConsultationService';
