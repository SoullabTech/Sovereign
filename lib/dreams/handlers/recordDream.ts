/**
 * Dream Recording Handler
 * Records dreams with persistence to MAIA's memory
 */
import { RecordDreamInput } from './types';
import { extractDreamSymbols } from './symbolExtract';

/**
 * Record a dream entry
 * Persists to database and updates pattern tracking
 */
export async function recordDreamHandler(raw: unknown) {
  const input = RecordDreamInput.parse(raw);

  // Extract symbols for immediate feedback and persistence
  const { top, motifs, archetypes } = extractDreamSymbols(input.dreamText);
  const symbolTerms = top.slice(0, 10).map(s => s.term);

  // Lazy import service to avoid module-load issues
  const { dreamService } = await import('@/lib/dreams/services/dreamService');

  // Persist to database
  const savedDream = await dreamService.recordDream({
    userId: input.userId,
    title: input.title,
    dreamText: input.dreamText,
    occurredAt: input.occurredAt,
    symbols: symbolTerms,
    motifs,
    archetypes,
    tags: input.tags,
  });

  if (!savedDream) {
    // Fallback: return success with extracted data even if DB fails
    // This ensures the UI gets immediate feedback
    console.warn('[Dreams] DB write failed, returning extracted data only');
    return {
      ok: true,
      saved: false,
      note: 'Dream analyzed but not persisted (database unavailable)',
      dream: {
        userId: input.userId,
        title: input.title ?? null,
        tags: input.tags ?? [],
        occurredAt: input.occurredAt ?? new Date().toISOString(),
        length: input.dreamText.length,
        symbolPreview: symbolTerms.slice(0, 5),
        motifs,
        archetypes,
      },
    };
  }

  return {
    ok: true,
    saved: true,
    dream: {
      id: savedDream.id,
      userId: savedDream.user_id,
      title: savedDream.title,
      tags: savedDream.tags,
      occurredAt: savedDream.occurred_at,
      length: input.dreamText.length,
      symbolPreview: symbolTerms.slice(0, 5),
      motifs,
      archetypes,
    },
  };
}
