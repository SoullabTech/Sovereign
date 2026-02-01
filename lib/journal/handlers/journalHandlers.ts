/**
 * Journal Handlers - Thin orchestration layer between routes and services
 * Routes lazy-import these handlers to avoid module-load issues
 */

import { z } from 'zod';
import { journalService } from '@/lib/services/journalService';
import type { NextRequest } from 'next/server';

// Input validation schemas
const CreateJournalEntrySchema = z.object({
  userId: z.string().min(1),
  intention: z.string().optional(),
  configuration_method: z.string().default('manual'),
  petal_intensities: z.record(z.number()).optional(),
  spiral_stage: z.any().optional(),
  archetype: z.string().optional(),
  shadow_archetype: z.string().optional(),
  conversation_messages: z.array(z.any()).optional(),
  tags: z.array(z.string()).optional(),
  is_favorite: z.boolean().optional(),
  visibility: z.enum(['private', 'shared', 'public']).optional(),
});

const UpdateJournalEntrySchema = z.object({
  entryId: z.string().min(1),
  intention: z.string().optional(),
  petal_intensities: z.record(z.number()).optional(),
  spiral_stage: z.any().optional(),
  archetype: z.string().optional(),
  shadow_archetype: z.string().optional(),
  conversation_messages: z.array(z.any()).optional(),
  tags: z.array(z.string()).optional(),
  is_favorite: z.boolean().optional(),
  visibility: z.enum(['private', 'shared', 'public']).optional(),
});

/**
 * Create a new journal entry
 */
export async function createJournalEntryHandler(raw: unknown) {
  const input = CreateJournalEntrySchema.parse(raw);

  const entry = await journalService.saveJournalEntry(
    {
      intention: input.intention,
      configuration_method: input.configuration_method,
      petal_intensities: input.petal_intensities || {},
      spiral_stage: input.spiral_stage,
      archetype: input.archetype,
      shadow_archetype: input.shadow_archetype,
      conversation_messages: input.conversation_messages || [],
      tags: input.tags,
      is_favorite: input.is_favorite,
      visibility: input.visibility,
    },
    input.userId
  );

  if (!entry) {
    throw new Error('Failed to create journal entry');
  }

  return {
    ok: true,
    entry,
  };
}

/**
 * Update an existing journal entry
 */
export async function updateJournalEntryHandler(raw: unknown) {
  const input = UpdateJournalEntrySchema.parse(raw);

  const { entryId, ...updates } = input;
  const entry = await journalService.updateJournalEntry(entryId, updates);

  if (!entry) {
    throw new Error('Failed to update journal entry or entry not found');
  }

  return {
    ok: true,
    entry,
  };
}

/**
 * List journal entries for a user
 */
export async function listJournalEntriesHandler(req: NextRequest) {
  const url = new URL(req.url);
  const userId = url.searchParams.get('userId');
  const limit = parseInt(url.searchParams.get('limit') || '50', 10);

  if (!userId) {
    throw new Error('userId parameter is required');
  }

  const entries = await journalService.getJournalEntries(userId, limit);

  return {
    ok: true,
    entries,
    count: entries.length,
  };
}

/**
 * Get a single journal entry
 */
export async function getJournalEntryHandler(entryId: string) {
  const entry = await journalService.getJournalEntry(entryId);

  if (!entry) {
    throw new Error('Journal entry not found');
  }

  return {
    ok: true,
    entry,
  };
}

/**
 * Delete a journal entry
 */
export async function deleteJournalEntryHandler(entryId: string) {
  const success = await journalService.deleteJournalEntry(entryId);

  if (!success) {
    throw new Error('Failed to delete journal entry');
  }

  return {
    ok: true,
    deleted: true,
  };
}

/**
 * Get soul patterns for a user
 */
export async function getSoulPatternsHandler(userId: string) {
  const patterns = await journalService.getSoulPatterns(userId);

  return {
    ok: true,
    patterns,
    count: patterns.length,
  };
}

/**
 * Search entries by tags
 */
export async function searchByTagsHandler(userId: string, tags: string[]) {
  const entries = await journalService.searchByTags(userId, tags);

  return {
    ok: true,
    entries,
    count: entries.length,
  };
}

/**
 * Get favorite entries
 */
export async function getFavoritesHandler(userId: string) {
  const entries = await journalService.getFavorites(userId);

  return {
    ok: true,
    entries,
    count: entries.length,
  };
}
