/**
 * MAIA Songwriter — Poem Interpreter
 *
 * Converts raw human input (feeling, journal entry, phrase, memory)
 * into a structured PoemSeed: theme, draft poem, form, voice, core image.
 *
 * Same philosophy as the song interpreter: translate, don't replace.
 * The poem is a starting place — rough, alive, not finished.
 */

import Anthropic from '@anthropic-ai/sdk';
import { randomUUID } from 'crypto';
import type { PoemSeed } from './types';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

// ─── Prompt ───────────────────────────────────────────────────────────────────

function buildPoemPrompt(content: string): string {
  return `You are a thoughtful poetry collaborator working with someone finding their poetic voice.

Your job is NOT to write a finished poem. Your job is to give the writer a strong starting place — a draft they can shape, cut, and make their own. Leave room. Do not over-polish.

The writer has given you this:
"${content}"

CRITICAL CONSTRAINTS:
- Do not produce decorative, literary-journal-ready verse. This should feel like a real draft — alive but unfinished.
- Avoid forced metaphors, predictable rhymes, and abstract flourishes that float above experience.
- Write toward the particular, not the general. One true image is worth ten beautiful abstractions.
- Line breaks are decisions — make them count. Use \\n for line breaks within the poem.
- Leave space the writer can inhabit. Do not complete what they should complete.
- "Close" is better than "perfect." The writer finishes this. You start it.

Return ONLY a valid JSON object with this exact shape:

{
  "theme": "one clear phrase naming what the poem is really about",
  "titles": ["Title 1", "Title 2", "Title 3"],
  "form": "free verse",
  "poem": "The poem draft. 8–16 lines. Use actual \\n line breaks. Rough, alive, not finished.",
  "voice": "intimate",
  "coreImage": "The one image or moment the poem is built around — concrete, specific, not a summary",
  "coreStatement": "One sentence on what this poem is trying to hold — not a description, the actual stance the poem takes"
}

Notes on fields:
- form: one of "free verse", "short lines", or "prose poem" — choose what fits the energy of the input
- voice: one of "intimate", "observational", or "abstract" — choose honestly
- poem: this is the actual draft, written out in full with \\n as line separators
- coreImage: a specific, sensory anchor — the thing the poem keeps returning to`;
}

// ─── JSON extraction ──────────────────────────────────────────────────────────

function extractJSON(text: string): string {
  let json = text.trim();
  if (json.startsWith('```json')) {
    json = json.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim();
  } else if (json.startsWith('```')) {
    json = json.replace(/^```\n?/, '').replace(/\n?```$/, '').trim();
  }
  return json;
}

// ─── Fallback ─────────────────────────────────────────────────────────────────

function fallbackPoem(content: string): PoemSeed {
  return {
    id: randomUUID(),
    theme: 'unclear — try again with more detail',
    titles: ['Untitled'],
    form: 'free verse',
    poem: '',
    voice: 'intimate',
    coreImage: '',
    coreStatement: 'Something needs saying — but we need more to go on.',
  };
}

// ─── Public interface ─────────────────────────────────────────────────────────

/**
 * Interpret raw input and return a structured PoemSeed.
 *
 * This is the translation layer: inner experience → poetic starting place.
 * Not generation. The writer completes what this starts.
 */
export async function interpretPoem(content: string): Promise<PoemSeed> {
  const prompt = buildPoemPrompt(content);

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1500,
    temperature: 0.85,
    messages: [{ role: 'user', content: prompt }],
  });

  const block = response.content[0];
  if (block.type !== 'text') {
    console.error('[Poem] Unexpected response type:', block.type);
    return fallbackPoem(content);
  }

  try {
    const json = extractJSON(block.text);
    const raw = JSON.parse(json);
    return {
      ...raw,
      id: randomUUID(),
    } as PoemSeed;
  } catch (err) {
    console.error('[Poem] Failed to parse poem JSON:', err);
    console.error('[Poem] Raw response:', block.text.slice(0, 500));
    return fallbackPoem(content);
  }
}
