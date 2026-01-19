/**
 * @maia/shared
 *
 * Shared utilities, types, and database client for MAIA platform.
 *
 * Used by:
 * - @maia/api (MAIA API Service)
 * - maia-web (Next.js frontend, server-side only)
 * - Future apps and services
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 * ARCHITECTURE INVARIANT: MAIA-First Hierarchy
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * This package contains shared code for the MAIA platform.
 * AIN-specific code belongs in @maia/ain-engine, not here.
 * ═══════════════════════════════════════════════════════════════════════════════
 */

// Database
export * from './db/index.js';

// Types
export * from './types/index.js';

// Utilities
export * from './utils/index.js';
