#!/usr/bin/env npx tsx
/**
 * JARVIS-VOICE-PROSODY-ALLOY-01 — latency + A/B/C listening harness.
 *
 * Synthesizes ONE identical sentence under three different relational
 * postures, on both the legacy speed channel (tts-1) and the instruction
 * channel (gpt-4o-mini-tts), and reports:
 *
 *   - request → first audio byte (TTFB)
 *   - total synthesis time
 *   - the exact instruction string MAIA sent
 *
 * It also writes the audio to disk so the runtime acceptance test can be run
 * blind: the three files differ ONLY in delivery, because the input text is
 * byte-identical across all of them (asserted below).
 *
 * ── WHY THIS IS A SCRIPT AND NOT A TEST ─────────────────────────────────────
 *
 * It costs money and leaves the machine. It is deliberately NOT part of
 * `npm test`, and it refuses to run unless cloud voice has been explicitly
 * re-permitted — the same gate the production path uses. Under the current
 * canon (`MAIA_ALLOW_CLOUD_VOICE` unset) it will refuse, which is correct.
 *
 *   MAIA_ALLOW_CLOUD_VOICE=1 OPENAI_API_KEY=sk-... \
 *     npx tsx scripts/bench-openai-tts-prosody.ts
 *
 * ⚠️ SANCTUARY: this harness synthesizes a fixed literal sentence. Never point
 * it at member content, and never run it inside a sanctuary session.
 */

import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { cloudVoicePermitted, CLOUD_VOICE_ENV } from '../lib/tts/cloudVoicePolicy';
import { resolveOpenAISpeechDelivery } from '../lib/tts/openaiSpeechAdapter';
import { synthesizeSpeech } from '../lib/tts/openaiTts';
import type { ProsodyHints } from '../src/types/voice';
import type { MoveIntent } from '../lib/voice/moshi/MoshiSessionManager';

/** The words never change. That is the whole point. */
const TEXT = "I'm here. We can stay with this.";

const CASES: { label: string; moveIntent: MoveIntent; hints: ProsodyHints }[] = [
  {
    label: 'A_MEET_REGULATE',
    moveIntent: 'MEET_REGULATE',
    hints: {
      energy: 'low', warmth: 'very_warm', pace: 'slow', clarity: 'soft',
      emphasis: 'minimal', pauseMs: { beforeSentence: 120, afterSentence: 180 },
      intentTag: 'regulate', ssmlOk: true,
    },
  },
  {
    label: 'B_MIRROR_REFLECT',
    moveIntent: 'MIRROR_REFLECT',
    hints: {
      energy: 'medium', warmth: 'warm', pace: 'steady', clarity: 'clear',
      emphasis: 'selective', pauseMs: { beforeSentence: 80, afterSentence: 120 },
      intentTag: 'attune', ssmlOk: true,
    },
  },
  {
    label: 'C_MOVE_NEXT_STEP',
    moveIntent: 'MOVE_NEXT_STEP',
    hints: {
      energy: 'medium', warmth: 'neutral', pace: 'brisk', clarity: 'clear',
      emphasis: 'selective', pauseMs: { beforeSentence: 50, afterSentence: 80 },
      intentTag: 'encourage', ssmlOk: true,
    },
  },
];

const MODELS = ['tts-1', 'gpt-4o-mini-tts'];
const RUNS = Number(process.env.BENCH_RUNS) || 3;
const OUT_DIR = process.env.BENCH_OUT_DIR || '/tmp/maia-prosody-abc';

async function main() {
  if (!cloudVoicePermitted()) {
    console.error(
      `Refusing to run: cloud voice is not permitted under the current canon.\n` +
      `Set ${CLOUD_VOICE_ENV}=1 deliberately to benchmark the cloud path.`,
    );
    process.exit(2);
  }
  if (!process.env.OPENAI_API_KEY) {
    console.error('Refusing to run: OPENAI_API_KEY is not set.');
    process.exit(2);
  }

  mkdirSync(OUT_DIR, { recursive: true });
  const rows: Record<string, unknown>[] = [];

  for (const model of MODELS) {
    for (const c of CASES) {
      const delivery = resolveOpenAISpeechDelivery({
        model,
        baseSpeed: c.hints.pace === 'slow' ? 0.93 : c.hints.pace === 'brisk' ? 1.05 : 1.0,
        hints: c.hints,
        moveIntent: c.moveIntent,
      });

      const ttfbs: number[] = [];
      const totals: number[] = [];
      let bytes = 0;

      for (let i = 0; i < RUNS; i++) {
        const t0 = performance.now();
        const res = await synthesizeSpeech({
          text: TEXT,               // ← identical every single time
          voice: 'alloy',
          format: 'mp3',
          model: delivery.model,
          speed: delivery.speed,
          instructions: delivery.instructions,
        });
        // The SDK resolves the Response as soon as headers land; the body is
        // read separately, so this is a genuine first-audio measurement.
        const tHeaders = performance.now();
        const buf = Buffer.from(await res.arrayBuffer());
        const tDone = performance.now();

        ttfbs.push(tHeaders - t0);
        totals.push(tDone - t0);
        bytes = buf.length;

        if (i === 0) {
          writeFileSync(join(OUT_DIR, `${model}__${c.label}.mp3`), buf);
        }
      }

      const median = (xs: number[]) =>
        [...xs].sort((a, b) => a - b)[Math.floor(xs.length / 2)];

      rows.push({
        model,
        case: c.label,
        control: delivery.channel,
        ttfb_ms: Math.round(median(ttfbs)),
        total_ms: Math.round(median(totals)),
        bytes,
        instructions: delivery.instructions ?? null,
        speed: delivery.speed ?? null,
      });
      console.log(`✓ ${model} ${c.label} — ttfb ${Math.round(median(ttfbs))}ms total ${Math.round(median(totals))}ms`);
    }
  }

  console.log('\n── RESULTS (median of %d runs) ──', RUNS);
  console.table(rows.map(({ instructions, ...r }) => r));
  console.log('\n── INSTRUCTIONS SENT ──');
  for (const r of rows) {
    if (r.instructions) console.log(`\n[${r.model} ${r.case}]\n${r.instructions}`);
  }
  console.log(`\nAudio for blind A/B/C listening written to: ${OUT_DIR}`);
  console.log('All files speak byte-identical text; only delivery differs.');

  writeFileSync(join(OUT_DIR, 'results.json'), JSON.stringify({ text: TEXT, runs: RUNS, rows }, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
