// Content Pipeline: Content Transformer
// Transforms extracted passages into multiple distribution formats

import Anthropic from '@anthropic-ai/sdk';
import type { ExtractedContent, TransformedContent } from './types';

const anthropic = new Anthropic();

const TRANSFORMATION_PROMPT = `Transform the following passages into multiple content formats.

CRITICAL CONSTRAINTS:
- This is Kelly Nezat's authored work. You are a scribe, not a co-author.
- Do NOT add inspirational filler, hashtag energy, or call-to-action language.
- Do NOT smooth rough edges. If the original is fierce, keep it fierce.
- Do NOT add "you can do this" or "remember that" wrappers.
- Each output must sound like it was written by the same person who wrote the input.
- If you can't make a good version of a format from a passage, skip it. Empty array > weak output.

Return ONLY valid JSON, no markdown fencing.

PASSAGES:
{PASSAGES}

QUOTES:
{QUOTES}

OUTPUT FORMAT:
{
  "shortPosts": ["concise expressions — one idea, clearly stated, under 280 chars"],
  "longPosts": ["reflective pieces — 2-4 paragraphs, deeper engagement with one idea"],
  "poeticPosts": ["symbolic, compressed — the meaning distilled into image or metaphor"],
  "audioScripts": ["natural spoken tone — as if reading aloud to one person in a room"]
}

QUALITY STANDARD:
- shortPosts: would you stop scrolling for this? If no, don't include it.
- longPosts: does this teach or reveal something? If it just summarizes, cut it.
- poeticPosts: does this carry weight in few words? If it's decorative, cut it.
- audioScripts: does this sound like a real person talking? If it sounds like a podcast intro, cut it.`;

export async function transformContent(extracted: ExtractedContent): Promise<TransformedContent> {
  const prompt = TRANSFORMATION_PROMPT
    .replace('{PASSAGES}', JSON.stringify(extracted.passages, null, 2))
    .replace('{QUOTES}', JSON.stringify(extracted.quotes, null, 2));

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-5',
    max_tokens: 8192,
    // Sonnet 5 defaults to adaptive thinking; disable so content[0] stays text.
    // Cast: installed @anthropic-ai/sdk 0.27.3 types predate the thinking param.
    thinking: { type: 'disabled' },
    messages: [{ role: 'user', content: prompt }],
  } as any);

  const text = response.content[0].type === 'text' ? response.content[0].text : '';

  try {
    return JSON.parse(text) as TransformedContent;
  } catch {
    console.error('[ContentPipeline] Transform parse failed, raw response:', text.slice(0, 200));
    throw new Error('Transformation produced invalid JSON');
  }
}
