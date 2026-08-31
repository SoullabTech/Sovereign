/**
 * Direct Recall Resolver — headless, read-only retrieval verb.
 * Spec: docs/specs/DIRECT_RECALL_RESOLVER_SPEC_2026-06-04.md
 */

export {
  locateMemoryObjects,
  materializeMemoryObject,
  isDirectRecallEnabled,
} from './resolver';
export { ADAPTERS, validateAdapters } from './adapters';
export type {
  MemorySource,
  MemoryObjectRef,
  MaterializedMemoryObject,
  Eligibility,
  Provenance,
  RecallContext,
  SourceAdapter,
} from './types';
