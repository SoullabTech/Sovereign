#!/usr/bin/env npx tsx
/**
 * Prosody Listening Harness
 *
 * Renders 10 representative MAIA utterances across all stances and selected
 * elements. Each utterance is synthesized with its derived TTS instructions
 * and saved as an MP3. Listen side by side to evaluate felt integrity.
 *
 * Usage:
 *   OPENAI_API_KEY=sk-... npx tsx scripts/prosody-harness.ts
 *   # or if OPENAI_API_KEY is in .env.local:
 *   npx dotenv -e .env.local -- npx tsx scripts/prosody-harness.ts
 *
 * Output:
 *   tmp/prosody-harness/[n]-[stance]-[element].mp3
 *   tmp/prosody-harness/manifest.txt
 *
 * What to listen for:
 *   - Does each stance sound distinctly different, or do they blur together?
 *   - Does the element flavor register without overwhelming the stance?
 *   - Does the guide stance avoid sounding ceremonial?
 *   - Does challenge sound grounded, not aggressive?
 *   - Does hold_silence feel minimal, not theatrical?
 */

import OpenAI from 'openai';
import * as fs from 'fs';
import * as path from 'path';
import { buildTTSInstructions } from '../lib/maia/maiaPlanner';

// ── Utterances ──────────────────────────────────────────────────────────────
// Representative MAIA phrases — one or two per stance.
// Chosen to stress-test prosody differences: emotional content, question,
// declaration, short clause, directive.

const CASES = [
  // WITNESS — holding space, not filling it
  {
    n: 1, stance: 'witness' as const, element: 'water' as const,
    text: "That sounds like it's been sitting with you for a while.",
  },
  {
    n: 2, stance: 'witness' as const, element: 'aether' as const,
    text: "I'm here with that.",
  },

  // MIRROR — returning without adding
  {
    n: 3, stance: 'mirror' as const, element: 'air' as const,
    text: "What I'm hearing is that the certainty is gone now.",
  },
  {
    n: 4, stance: 'mirror' as const, element: 'water' as const,
    text: "You said it felt like a door closing.",
  },

  // GUIDE — one clear thing, practical
  {
    n: 5, stance: 'guide' as const, element: 'earth' as const,
    text: "There's one thing here that's clearer than it feels right now.",
  },
  {
    n: 6, stance: 'guide' as const, element: 'air' as const,
    text: "What would it look like to take one step, not all of them?",
  },

  // CHALLENGE — direct, not harsh
  {
    n: 7, stance: 'challenge' as const, element: 'fire' as const,
    text: "That's not actually what you said you wanted.",
  },
  {
    n: 8, stance: 'challenge' as const, element: 'earth' as const,
    text: "There's a pattern here you haven't named yet.",
  },

  // HOLD_SILENCE — minimal, present
  {
    n: 9, stance: 'hold_silence' as const, element: 'aether' as const,
    text: "Yes.",
  },
  {
    n: 10, stance: 'hold_silence' as const, element: 'water' as const,
    text: "I hear that.",
  },
] as const;

const VOICE = 'alloy'; // maia_core default
const MODEL = 'gpt-4o-mini-tts';
const SPEED = 0.92;

// ── Main ─────────────────────────────────────────────────────────────────────

async function run() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error('Error: OPENAI_API_KEY not set.');
    process.exit(1);
  }

  const outDir = path.join(process.cwd(), 'tmp', 'prosody-harness');
  fs.mkdirSync(outDir, { recursive: true });

  const client = new OpenAI({ apiKey });
  const manifest: string[] = [
    `Prosody Harness — ${new Date().toISOString()}`,
    `Model: ${MODEL}  Voice: ${VOICE}  Speed: ${SPEED}`,
    '',
  ];

  for (const c of CASES) {
    const instructions = buildTTSInstructions({
      stance: c.stance,
      element: c.element,
      tone: { warmth: 0.7, directness: 0.5, poetry: 0.3 },
      maxWords: 60,
    });

    const filename = `${String(c.n).padStart(2, '0')}-${c.stance}-${c.element}.mp3`;
    const outPath = path.join(outDir, filename);

    process.stdout.write(`[${c.n}/10] ${filename} ... `);

    try {
      const response = await client.audio.speech.create({
        model: MODEL,
        voice: VOICE,
        input: c.text,
        speed: SPEED,
        // @ts-ignore — instructions field is supported but not yet in all SDK typings
        instructions,
      });

      const buffer = Buffer.from(await response.arrayBuffer());
      fs.writeFileSync(outPath, buffer);
      process.stdout.write(`done (${buffer.length} bytes)\n`);
    } catch (err: any) {
      process.stdout.write(`FAILED: ${err.message}\n`);
    }

    manifest.push(`[${c.n}] ${filename}`);
    manifest.push(`  stance:  ${c.stance}`);
    manifest.push(`  element: ${c.element}`);
    manifest.push(`  text:    "${c.text}"`);
    manifest.push(`  instr:   ${instructions}`);
    manifest.push('');
  }

  const manifestPath = path.join(outDir, 'manifest.txt');
  fs.writeFileSync(manifestPath, manifest.join('\n'));

  console.log(`\nDone. Files in: ${outDir}`);
  console.log(`Manifest:       ${manifestPath}`);
  console.log('\nListening notes:');
  console.log('  1-2  witness  — holding space, no emotional display');
  console.log('  3-4  mirror   — close, returning without interpreting');
  console.log('  5-6  guide    — one clear thing, not preachy');
  console.log('  7-8  challenge — direct, grounded, not aggressive');
  console.log('  9-10 hold_silence — minimal, present, nothing added');
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
