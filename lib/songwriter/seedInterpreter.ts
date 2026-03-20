/**
 * MAIA Songwriter — Seed Interpreter
 *
 * Converts raw human input (feeling, journal entry, phrase, memory)
 * into a structured SongSeed: theme, interpretation, lyrics, chords, structure.
 *
 * This is the intelligence contract the entire songwriter experience rests on.
 *
 * Internal flow:
 *   parseInput → detectTheme → detectEmotionalTone → determinePerspective
 *   → generateLyrics → generateChords → assembleStructure
 *
 * All of this is currently a single LLM call. The modular naming is intentional —
 * each function represents a concern that can be split out as the system matures.
 */

import Anthropic from '@anthropic-ai/sdk';
import { randomUUID } from 'crypto';
import type { SeedInput, SongSeed } from './types';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

// ─── Prompt ───────────────────────────────────────────────────────────────────

function buildSeedPrompt(input: SeedInput): string {
  const vocalHint = input.vocalRange
    ? `The songwriter has a ${input.vocalRange} vocal range — keep key suggestions within comfortable reach.`
    : 'Suggest keys that work well for a standard mid-range acoustic singer.';

  const styleHint = input.playingStyle
    ? `Their playing style is ${input.playingStyle} — let this shape the chord voicing and strumming feel descriptions.`
    : 'Assume fingerpicked or light strummed acoustic guitar.';

  return `You are a thoughtful songwriting collaborator working with an acoustic singer-songwriter.

Your job is NOT to write a finished song. Your job is to give the songwriter a strong starting place — a sketch they can shape, edit, and make their own. Leave room. Do not over-polish.

The songwriter has given you this:
"${input.content}"

${vocalHint}
${styleHint}

CRITICAL CONSTRAINTS:
- Do not produce generic, radio-ready, or overly polished lyrics. These should feel like a real draft — alive but unfinished.
- Do not use clichés: avoid "broken wings", "you left me alone", "tears in the rain", "heart of stone", and similar worn phrases.
- Write lyrics that a real person could sing — natural phrasing, human breath, no forced rhymes.
- The verse should have conversational weight. The chorus should have lift without being sentimental.
- Chord progressions must be playable on acoustic guitar — no jazz voicings, no extended chords unless clearly indicated.
- The structure should be simple and singable. This is not a concept album.
- "Close" is better than "perfect." The songwriter completes this. You start it.

Your task:

1. parseInput — understand what they're actually talking about (not just the surface)
2. detectTheme — name the real subject beneath the surface statement
3. detectEmotionalTone — identify the emotional texture (not just sad/happy — be precise)
4. determinePerspective — who is speaking in the song?
5. generateLyrics — write verse 1 and chorus as rough drafts
6. generateChords — suggest a progression that fits the tone
7. assembleStructure — propose the section order

Return ONLY a valid JSON object with this exact shape:

{
  "interpretation": {
    "theme": "one clear phrase naming the real subject",
    "emotionalTone": "precise texture — e.g. 'quiet grief, not yet ready to move' or 'restless hope with an undertow of doubt'",
    "perspective": "first_person",
    "tempoFeel": "slow",
    "narrativeDirection": "one sentence on where this song is headed emotionally"
  },
  "titles": ["Title 1", "Title 2", "Title 3", "Title 4"],
  "lyrics": {
    "verse1": "Four lines. Natural speech rhythm. Concrete image or moment. Not a summary of the theme — an entry into it.",
    "chorus": "Four lines. More open, more expansive than the verse. A statement that earns repeating. Still human — not anthem.",
    "bridge": "Optional. Two lines. A turn or complication. Leave null if the song doesn't need it yet."
  },
  "chords": {
    "key": "e.g. G major",
    "capo": 0,
    "verse": ["G", "D", "Em", "C"],
    "chorus": ["C", "G", "D", "Em"],
    "bridge": null,
    "feel": "one phrase describing the harmonic character",
    "strummingFeel": "e.g. 'fingerpicked verse, open strummed chorus'"
  },
  "structure": ["Verse 1", "Verse 2", "Chorus", "Verse 3", "Chorus", "Bridge", "Chorus"],
  "coreStatement": "One sentence on what this song is trying to say — not a description of the theme, the actual statement the song is making."
}`;
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

function fallbackSeed(_input: SeedInput): SongSeed {
  return {
    id: randomUUID(),
    interpretation: {
      theme: 'unclear — try again with more detail',
      emotionalTone: 'unknown',
      perspective: 'first_person',
      tempoFeel: 'mid',
      narrativeDirection: 'Could not interpret the input.',
    },
    titles: ['Untitled'],
    lyrics: {
      verse1: { id: 'lyric_verse1', text: '' },
      chorus: { id: 'lyric_chorus', text: '' },
      bridge: null,
    },
    chords: {
      key: 'G major',
      capo: 0,
      verse: ['G', 'D', 'Em', 'C'],
      chorus: ['C', 'G', 'D', 'Em'],
      feel: 'neutral',
      strummingFeel: 'medium fingerpick',
    },
    structure: ['Verse 1', 'Chorus', 'Verse 2', 'Chorus'],
    coreStatement: 'Something needs saying — but we need more to go on.',
  };
}

// ─── Public interface ─────────────────────────────────────────────────────────

/**
 * Interpret raw songwriter input and return a structured SongSeed.
 *
 * This is the core intelligence contract: input → interpretation → suggestion.
 * Not generation. The songwriter completes what this starts.
 */
export async function interpretSeed(input: SeedInput): Promise<SongSeed> {
  const prompt = buildSeedPrompt(input);

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2000,
    temperature: 0.8,
    messages: [{ role: 'user', content: prompt }],
  });

  const block = response.content[0];
  if (block.type !== 'text') {
    console.error('[Songwriter] Unexpected response type:', block.type);
    return fallbackSeed(input);
  }

  try {
    const json = extractJSON(block.text);
    const raw = JSON.parse(json);
    // Wrap lyrics in stable {id, text} objects
    const seed: SongSeed = {
      ...raw,
      id: randomUUID(),
      lyrics: {
        verse1: { id: 'lyric_verse1', text: raw.lyrics?.verse1 ?? '' },
        chorus: { id: 'lyric_chorus', text: raw.lyrics?.chorus ?? '' },
        bridge: raw.lyrics?.bridge
          ? { id: 'lyric_bridge', text: raw.lyrics.bridge }
          : null,
      },
    };
    return seed;
  } catch (err) {
    console.error('[Songwriter] Failed to parse seed JSON:', err);
    console.error('[Songwriter] Raw response:', block.text.slice(0, 500));
    return fallbackSeed(input);
  }
}
