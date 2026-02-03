/**
 * PHI Accessors
 *
 * HIPAA Sprint 7 Phase 2A + Phase 3A
 *
 * Each table with PHI columns has a dedicated accessor module
 * that handles encryption/decryption with proper context binding.
 *
 * Import pattern:
 *   import { getEncryptedColumnsForInsert } from '@/lib/security/phiAccessors/clientMessages';
 *   import { decryptTranscriptSegments } from '@/lib/security/phiAccessors/transcripts';
 *
 * Or use the barrel export:
 *   import { clientMessages, transcripts } from '@/lib/security/phiAccessors';
 */

export * as clientMessages from './clientMessages';
export * as transcripts from './transcripts';
