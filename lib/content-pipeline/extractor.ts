// Content Pipeline: Manuscript Extractor
// Extracts structured meaning from raw manuscript text

import Anthropic from '@anthropic-ai/sdk';
import type { ContentSource, ExtractedContent } from './types';

const anthropic = new Anthropic();

const EXTRACTION_PROMPT = `You are extracting meaningful structure from a manuscript by Kelly Nezat.

CRITICAL CONSTRAINTS:
- You are preserving an author's voice, not improving it
- Do NOT polish, smooth, or professionalize the language
- Do NOT add marketing energy, uplift language, or motivational tone
- Do NOT genericize specific, unusual, or rough-edged phrasing
- Preserve the author's rhythm, cadence, and word choices exactly
- If something sounds raw, keep it raw. That is the voice.

Return ONLY valid JSON, no markdown fencing.

INPUT:
{TEXT}

OUTPUT FORMAT:
{
  "summary": "2-3 sentence distillation of the core meaning (in author's voice, not yours)",
  "passages": ["5-10 meaningful sections that carry weight — each should be a complete thought"],
  "quotes": ["short, impactful lines that stand alone — the kind you'd underline in a book"]
}

SELECTION CRITERIA:
- passages: sections where the author is saying something that matters, not transitional filler
- quotes: lines with density — where meaning is compressed into few words
- summary: what this chapter is ABOUT at the level of human experience, not topic description`;

export async function extractContent(source: ContentSource): Promise<ExtractedContent> {
  const prompt = EXTRACTION_PROMPT.replace('{TEXT}', source.body);

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-5',
    max_tokens: 4096,
    // Sonnet 5 defaults to adaptive thinking; disable so content[0] stays text.
    // Cast: installed @anthropic-ai/sdk 0.27.3 types predate the thinking param.
    thinking: { type: 'disabled' },
    messages: [{ role: 'user', content: prompt }],
  } as any);

  const text = response.content[0].type === 'text' ? response.content[0].text : '';

  try {
    return JSON.parse(text) as ExtractedContent;
  } catch {
    console.error('[ContentPipeline] Extraction parse failed, raw response:', text.slice(0, 200));
    throw new Error('Extraction produced invalid JSON');
  }
}
