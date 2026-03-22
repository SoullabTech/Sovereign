export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth/serverSessions';
import Anthropic from '@anthropic-ai/sdk';
import type { SongSeed, ChordSuggestion, LyricSection } from '@/lib/songwriter/types';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY || '' });

// ─── POST /api/songwriter/refine ──────────────────────────────────────────────
//
// Two operations:
//   action: 'regenerate' — rewrite a section from scratch, preserving song context
//   action: 'refine'     — push a section toward more personal, specific language

interface RefineRequest {
  action: 'regenerate' | 'refine';
  section: 'verse1' | 'chorus' | 'bridge' | 'chords';
  seed: SongSeed;
  currentLyrics: {
    verse1: LyricSection;
    chorus: LyricSection;
    bridge: LyricSection | null;
  };
  currentChords: ChordSuggestion;
  seedPrompt: string;
}

export async function POST(req: NextRequest) {
  const session = await getCurrentSession();
  if (!session?.memberId) {
    return NextResponse.json({ error: 'Session required' }, { status: 401 });
  }

  const body: RefineRequest = await req.json();
  const { action, section, seed, currentLyrics, currentChords, seedPrompt } = body;

  try {
    if (action === 'regenerate') {
      const result = await regenerateSection(section, seed, currentLyrics, currentChords, seedPrompt);
      return NextResponse.json(result);
    } else {
      const result = await refineSection(section, seed, currentLyrics, currentChords);
      return NextResponse.json(result);
    }
  } catch (err) {
    console.error('[POST /api/songwriter/refine]', err);
    return NextResponse.json({ error: 'Refinement failed' }, { status: 500 });
  }
}

// ─── Regenerate ───────────────────────────────────────────────────────────────

async function regenerateSection(
  section: RefineRequest['section'],
  seed: SongSeed,
  currentLyrics: RefineRequest['currentLyrics'],
  currentChords: ChordSuggestion,
  seedPrompt: string
) {
  const ctx = buildContext(seed, currentLyrics, currentChords, seedPrompt);

  const sectionInstructions: Record<RefineRequest['section'], string> = {
    verse1: `Write a new Verse 1. Four lines. A different angle into the same theme — a different concrete image or moment. Keep it rough and singable. Do not repeat the existing verse.
Existing verse (for reference, do NOT reuse): ${currentLyrics.verse1.text}
Return JSON: { "text": "the new verse text" }`,

    chorus: `Write a new Chorus. Four lines. Same emotional lane as the verse, more open and expansive. Should earn repeating. Do not repeat the existing chorus.
Existing chorus (for reference, do NOT reuse): ${currentLyrics.chorus.text}
Return JSON: { "text": "the new chorus text" }`,

    bridge: `Write a new Bridge. Two lines. A turn or complication — something the verse and chorus haven't said yet. Spare.
Return JSON: { "text": "the new bridge text" }`,

    chords: `Suggest a different chord progression for this song. Keep it acoustic-playable. Different key or feel from the current one.
Current chords: key=${currentChords.key}, verse=${currentChords.verse.join('-')}, chorus=${currentChords.chorus.join('-')}
Return JSON matching this shape exactly: { "key": "...", "capo": 0, "verse": [...], "chorus": [...], "bridge": null, "feel": "...", "strummingFeel": "..." }`,
  };

  const prompt = `You are a songwriting collaborator. The songwriter is reworking one section of their song.

${ctx}

Task: ${sectionInstructions[section]}

Return ONLY the JSON object. No explanation, no markdown.`;

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 500,
    temperature: 0.85,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = response.content[0].type === 'text' ? response.content[0].text : '';
  const json = extractJSON(text);
  const data = JSON.parse(json);

  if (section === 'chords') {
    return { chords: data };
  }
  return {
    lyric: { id: `lyric_${section}`, text: data.text },
    section,
  };
}

// ─── Refine ───────────────────────────────────────────────────────────────────

async function refineSection(
  section: RefineRequest['section'],
  seed: SongSeed,
  currentLyrics: RefineRequest['currentLyrics'],
  currentChords: ChordSuggestion
) {
  if (section === 'chords') {
    return NextResponse.json({ error: 'Chords do not support refine' }, { status: 400 });
  }

  const sectionText = section === 'verse1'
    ? currentLyrics.verse1.text
    : section === 'chorus'
    ? currentLyrics.chorus.text
    : currentLyrics.bridge?.text ?? '';

  const others = [
    section !== 'verse1' ? `Verse 1: ${currentLyrics.verse1.text}` : '',
    section !== 'chorus' ? `Chorus: ${currentLyrics.chorus.text}` : '',
  ].filter(Boolean).join('\n');

  const prompt = `You are a songwriting collaborator helping refine one section.

Song context:
- Theme: ${seed.interpretation.theme}
- Emotional tone: ${seed.interpretation.emotionalTone}
- Core statement: ${seed.coreStatement}

Other sections (for continuity):
${others}

Current ${section} to refine:
${sectionText}

Your task:
Rewrite this section to feel more personal, specific, and human — while preserving the original meaning and singability.

Rules:
- Make images more concrete (replace generic phrases with specific ones)
- Remove any phrase that sounds like it could be anyone's song
- Keep the same line count and general shape
- Do not make it prettier or more polished — make it more true
- Preserve singability — natural phrasing, human breath

Return ONLY JSON: { "text": "the refined section text" }`;

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 400,
    temperature: 0.7,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = response.content[0].type === 'text' ? response.content[0].text : '';
  const json = extractJSON(text);
  const data = JSON.parse(json);

  return {
    lyric: { id: `lyric_${section}`, text: data.text },
    section,
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildContext(
  seed: SongSeed,
  lyrics: RefineRequest['currentLyrics'],
  chords: ChordSuggestion,
  seedPrompt: string
) {
  return `Original input: "${seedPrompt}"
Theme: ${seed.interpretation.theme}
Emotional tone: ${seed.interpretation.emotionalTone}
Core statement: ${seed.coreStatement}
Key: ${chords.key}${chords.capo > 0 ? `, capo ${chords.capo}` : ''}

Current lyrics:
Verse 1: ${lyrics.verse1.text}
Chorus: ${lyrics.chorus.text}
${lyrics.bridge ? `Bridge: ${lyrics.bridge.text}` : ''}`;
}

function extractJSON(text: string): string {
  let json = text.trim();
  if (json.startsWith('```json')) {
    json = json.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim();
  } else if (json.startsWith('```')) {
    json = json.replace(/^```\n?/, '').replace(/\n?```$/, '').trim();
  }
  return json;
}
