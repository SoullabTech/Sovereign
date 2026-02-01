/**
 * Dream Analysis Handler
 * Returns stable analysis contract - works now, upgrades later
 * Optionally stores analysis if dreamId is provided
 */
import { AnalyzeDreamInput } from './types';
import { extractDreamSymbols } from './symbolExtract';
import { z } from 'zod';

// Extended input that allows dreamId for storing analysis
const AnalyzeDreamInputExtended = AnalyzeDreamInput.extend({
  dreamId: z.string().uuid().optional(),
});

type DreamAnalysis = {
  summary: string;
  symbols: { term: string; count: number }[];
  motifs: string[];
  archetypes: string[];
  inquiries: string[];
  practices: string[];
};

/**
 * Analyze a dream and return structured insights
 * If dreamId is provided, stores the analysis for future reference
 */
export async function analyzeDreamHandler(raw: unknown) {
  const input = AnalyzeDreamInputExtended.parse(raw);

  const { top, motifs, archetypes } = extractDreamSymbols(input.dreamText);

  // Generate contextual summary based on what's detected
  let summary: string;

  if (motifs.length > 0 && archetypes.length > 0) {
    summary = `Dominant motifs: ${motifs.join(', ')}. Archetypal presences: ${archetypes.join(', ')}. The dream is emphasizing process over explanation—watch what repeats.`;
  } else if (motifs.length > 0) {
    summary = `Dominant motifs: ${motifs.join(', ')}. The dream is emphasizing process over explanation—watch what repeats.`;
  } else if (archetypes.length > 0) {
    summary = `Archetypal presences: ${archetypes.join(', ')}. These figures carry psychological weight—consider what they represent in your current life.`;
  } else {
    summary = `Key symbols cluster around: ${top.slice(0, 6).map(s => s.term).join(', ')}. Let the image lead the meaning.`;
  }

  // Generate contextual inquiries based on motifs
  const inquiries: string[] = [
    'Where in waking life does this feeling show up first—in body, relationship, or work?',
    'What part of the dream felt most "charged," even if it seemed minor?',
    'If one symbol could speak one sentence, what would it say?',
  ];

  // Add motif-specific inquiries
  if (motifs.includes('pursuit')) {
    inquiries.push('What are you running from—or toward—in your waking life?');
  }
  if (motifs.includes('water')) {
    inquiries.push('What emotions have been rising or flooding in lately?');
  }
  if (motifs.includes('house')) {
    inquiries.push('What part of your psyche or life does this room/house represent?');
  }
  if (motifs.includes('death-rebirth')) {
    inquiries.push('What is ending in your life that needs to end?');
  }
  if (motifs.includes('transformation')) {
    inquiries.push('What version of yourself is asking to emerge?');
  }

  // Generate practices
  const practices: string[] = [
    'Write a 6-line dream poem: one line per scene shift.',
    'Name the "threshold moment" in the dream—what changed right before it?',
    'Pick one symbol and embody it for 30 seconds (posture + breath).',
  ];

  // Add archetype-specific practices
  if (archetypes.includes('The Shadow')) {
    practices.push('Dialogue with the shadow figure: ask what it protects, what it needs.');
  }
  if (archetypes.includes('The Hero')) {
    practices.push('Identify the quest: what are you being called to confront or achieve?');
  }
  if (archetypes.includes('The Great Mother')) {
    practices.push('Notice where you need more nurturing—or where you over-nurture.');
  }

  const analysis: DreamAnalysis = {
    summary,
    symbols: top,
    motifs,
    archetypes,
    inquiries: inquiries.slice(0, 5), // Limit to 5
    practices: practices.slice(0, 4), // Limit to 4
  };

  // If dreamId provided, persist analysis to database
  let stored = false;
  if (input.dreamId) {
    try {
      const { dreamService } = await import('@/lib/dreams/services/dreamService');
      stored = await dreamService.storeAnalysis(input.dreamId, analysis);
    } catch (err) {
      console.warn('[Dreams] Analysis storage failed:', err);
    }
  }

  return {
    ok: true,
    analysis,
    stored,
    meta: {
      userId: input.userId,
      dreamId: input.dreamId ?? null,
      title: input.title ?? null,
      tags: input.tags ?? [],
    },
  };
}
