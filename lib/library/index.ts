/**
 * Library Intelligence — "Jeeves" Pattern
 *
 * Behind-the-scenes wisdom archive that MAIA can consult silently.
 * All outputs include provenance. MAIA remains the only voice.
 *
 * Usage:
 *   import { libraryService, LIBRARY_TRIGGERS } from '@/lib/library';
 *
 *   // Check if query should trigger consultation
 *   if (libraryService.shouldConsultLibrary(userMessage)) {
 *     const context = await libraryService.search(userMessage);
 *     const promptAddition = libraryService.formatForPrompt(context);
 *   }
 */

export {
  libraryService,
  LibraryService,
  LIBRARY_TRIGGERS,
  type LibrarySource,
  type LibraryChunk,
  type LibraryDistillate,
  type DistillatePayload,
  type LibrarySearchResult,
  type LibraryContext,
} from './LibraryService';
