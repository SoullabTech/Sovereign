// Content Pipeline: Quality Filter
// Filters out weak/generic outputs before they reach the distribution board

import Anthropic from '@anthropic-ai/sdk';
import type { TransformedContent, QualityScore } from './types';

const anthropic = new Anthropic();

const QUALITY_PROMPT = `You are a quality filter for authored content. Score each piece on a 1-10 scale.

SCORING CRITERIA:
- Voice authenticity: Does this sound like a specific person, or like "an AI writing about spirituality"?
- Density: Is every sentence doing work, or is there filler?
- Distinctiveness: Would this stand out, or could anyone have written it?
- Integrity: Does this preserve the original meaning without distortion?

AUTOMATIC FAIL (score 0-3):
- Contains "remember that you are..." or similar motivational wrappers
- Sounds like a LinkedIn post or wellness influencer
- Uses "journey", "embrace", "empower" without specific context
- Generic spiritual platitudes with no edge or specificity

Return ONLY valid JSON, no markdown fencing.

CONTENT TO SCORE:
{CONTENT}

OUTPUT FORMAT:
[
  { "index": 0, "score": 7, "passed": true, "reason": "specific, carries the author's edge" },
  { "index": 1, "score": 3, "passed": false, "reason": "too polished, lost the raw tone" }
]

Threshold: score >= 6 passes. Be strict. Less content that's real > more content that's generic.`;

interface ScoredItem {
  index: number;
  score: number;
  passed: boolean;
  reason: string;
}

async function scoreItems(items: string[], formatLabel: string): Promise<ScoredItem[]> {
  if (items.length === 0) return [];

  const content = items.map((item, i) => `[${i}] ${item}`).join('\n\n---\n\n');
  const prompt = QUALITY_PROMPT.replace('{CONTENT}', `Format: ${formatLabel}\n\n${content}`);

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-5',
    max_tokens: 2048,
    // Sonnet 5 defaults to adaptive thinking; disable so content[0] stays text.
    // Cast: installed @anthropic-ai/sdk 0.27.3 types predate the thinking param.
    thinking: { type: 'disabled' },
    messages: [{ role: 'user', content: prompt }],
  } as any);

  const text = response.content[0].type === 'text' ? response.content[0].text : '';

  try {
    return JSON.parse(text) as ScoredItem[];
  } catch {
    console.warn(`[ContentPipeline] Quality filter parse failed for ${formatLabel}, passing all items`);
    return items.map((_, i) => ({ index: i, score: 6, passed: true, reason: 'filter parse fallback' }));
  }
}

function filterByScores<T>(items: T[], scores: ScoredItem[]): T[] {
  const passedIndices = new Set(scores.filter(s => s.passed).map(s => s.index));
  return items.filter((_, i) => passedIndices.has(i));
}

export async function filterContent(transformed: TransformedContent): Promise<TransformedContent> {
  const [shortScores, longScores, poeticScores, audioScores] = await Promise.all([
    scoreItems(transformed.shortPosts, 'short post'),
    scoreItems(transformed.longPosts, 'long post'),
    scoreItems(transformed.poeticPosts, 'poetic post'),
    scoreItems(transformed.audioScripts, 'audio script'),
  ]);

  const filtered: TransformedContent = {
    shortPosts: filterByScores(transformed.shortPosts, shortScores),
    longPosts: filterByScores(transformed.longPosts, longScores),
    poeticPosts: filterByScores(transformed.poeticPosts, poeticScores),
    audioScripts: filterByScores(transformed.audioScripts, audioScores),
  };

  const totalBefore = transformed.shortPosts.length + transformed.longPosts.length +
    transformed.poeticPosts.length + transformed.audioScripts.length;
  const totalAfter = filtered.shortPosts.length + filtered.longPosts.length +
    filtered.poeticPosts.length + filtered.audioScripts.length;

  console.log(`[ContentPipeline] Quality filter: ${totalBefore} → ${totalAfter} items (${totalBefore - totalAfter} removed)`);

  return filtered;
}
