/**
 * PRACTITIONER CASELOAD SYSTEM
 *
 * Enables practitioners to manage client cases with MAIA
 * as a clinical consultation partner.
 *
 * Components:
 * - CaseStore: Database operations for cases, notes, capture links
 * - types: TypeScript types for the caseload system
 *
 * API Routes:
 * - GET/POST /api/caseload - List/create cases
 * - GET/PATCH/DELETE /api/caseload/[caseId] - Case operations
 * - GET/POST /api/caseload/[caseId]/notes - Note operations
 *
 * Database Tables:
 * - practitioner_cases: Client cases with Spiralogic positioning
 * - case_notes: Session documentation
 * - case_memories: MAIA's case-scoped memories
 * - maia_consultations: Consultation dialogues
 * - case_capture_links: Links Note mode recordings to cases
 */

export * from './types';
export { CaseStore } from './CaseStore';
