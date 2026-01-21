/**
 * PHI Accessors
 *
 * HIPAA Sprint 7 Phase 2A
 *
 * Each table with PHI columns has a dedicated accessor module
 * that handles encryption/decryption with proper context binding.
 *
 * Import pattern:
 *   import { getEncryptedColumnsForInsert } from '@/lib/security/phiAccessors/clientMessages';
 *
 * Or use the barrel export:
 *   import { clientMessages } from '@/lib/security/phiAccessors';
 */

export * as clientMessages from './clientMessages';
