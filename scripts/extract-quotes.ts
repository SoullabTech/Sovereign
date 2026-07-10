/**
 * CLI for lib/analysis/extractQuotes.ts — run quote extraction on any text file.
 *
 * Usage:
 *   npx tsx scripts/extract-quotes.ts <file> [--max 7] [--kind journal|manuscript|soul-portrait|general]
 *                                            [--guidance "..."] [--canon] [--canon-max 5]
 *
 *   --canon       also suggest famous quotes (authors, poets, mystics, scientists)
 *                 that resonate with the writing. Attributions are model-proposed
 *                 unless marked curated — verify before publishing.
 *
 * Requires ANTHROPIC_API_KEY in the environment (or a local Ollama for fallback).
 */

import { readFileSync } from 'fs';
import {
  extractQuotes,
  suggestCanonQuotes,
  ExtractQuotesOptions,
} from '../lib/analysis/extractQuotes';

function arg(flag: string): string | undefined {
  const i = process.argv.indexOf(flag);
  return i !== -1 ? process.argv[i + 1] : undefined;
}

function has(flag: string): boolean {
  return process.argv.includes(flag);
}

async function main() {
  const file = process.argv[2];
  if (!file || file.startsWith('--')) {
    console.error(
      'Usage: npx tsx scripts/extract-quotes.ts <file> [--max N] [--kind K] [--guidance "..."] [--canon] [--canon-max N]'
    );
    process.exit(1);
  }

  const text = readFileSync(file, 'utf8');
  const kind = arg('--kind') as ExtractQuotesOptions['kind'];
  const guidance = arg('--guidance');
  const max = arg('--max');
  const canonMax = arg('--canon-max');

  const result = await extractQuotes(text, {
    maxQuotes: max ? parseInt(max, 10) : undefined,
    kind,
    guidance,
  });

  console.log(`\n# Quotes from ${file}\n`);
  console.log(`## From the work itself\n`);
  console.log(
    `_${result.quotes.length} verified verbatim · ${result.rejected.length} rejected · ${result.chunkCount} chunk(s) · provider: ${result.provider}_\n`
  );

  for (const q of result.quotes) {
    console.log(`> ${q.text}\n`);
    console.log(`  — score ${q.score}, chars ${q.start}–${q.end}. ${q.resonance}\n`);
  }

  if (result.rejected.length > 0) {
    console.log('### Rejected candidates\n');
    for (const r of result.rejected) {
      console.log(`- [${r.reason}] "${r.text.slice(0, 80)}${r.text.length > 80 ? '…' : ''}"`);
    }
    console.log('');
  }

  if (has('--canon')) {
    const canon = await suggestCanonQuotes(text, {
      maxQuotes: canonMax ? parseInt(canonMax, 10) : undefined,
      kind,
      guidance,
    });

    console.log(`## From the canon\n`);
    console.log(
      `_${canon.quotes.length} suggested · provider: ${canon.provider} · attributions marked [model-attributed] are the model's claim — verify author + work before publishing_\n`
    );

    for (const q of canon.quotes) {
      const source = q.work ? `${q.author}, *${q.work}*` : q.author;
      console.log(`> ${q.text}\n`);
      console.log(`  — ${source} [${q.provenance}, confidence: ${q.confidence}]`);
      console.log(`  ${q.resonance}`);
      if (q.anchor) {
        console.log(`  Resonates with (chars ${q.anchor.start}–${q.anchor.end}): "${q.anchor.text}"`);
      }
      console.log('');
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
