// @ts-nocheck
/**
 * SOVEREIGNTY: OpenAI memory compression removed.
 *
 * Previously used gpt-3.5-turbo for summarization and theme extraction.
 * Now delegates entirely to SimpleCompressor — local, dependency-free.
 *
 * SimpleCompressor uses extractive summarization (sentence scoring by
 * word frequency + position) and requires no external API calls.
 *
 * See lib/ai/openaiPolicy.ts for the zero-access doctrine.
 * See lib/memory/compression/SimpleCompressor.ts for the implementation.
 */

export { SimpleCompressor as MemoryCompressorService } from './SimpleCompressor';
