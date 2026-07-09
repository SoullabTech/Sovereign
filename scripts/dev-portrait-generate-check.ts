/**
 * Dev check: live Soul Portrait generation — literary form, both providers.
 * Fictional subject (no real member data). Prints structure metrics + a short
 * register sample, never the full text and never any secret.
 *
 *   Anthropic:  ANTHROPIC_API_KEY=... npx tsx scripts/dev-portrait-generate-check.ts
 *   Local qwen: LOCAL_TIER_ENABLED=true OLLAMA_MODEL_DEEP=qwen2.5:7b npx tsx scripts/dev-portrait-generate-check.ts
 */
import { generateSoulPortrait } from '../lib/soulPortrait/generator/generatePortrait';

async function main() {
  const started = Date.now();
  const draft = await generateSoulPortrait({
    name: 'River Hartwell',
    slug: 'river-devtest',
    mode: 'gift',
    birthData: {
      date: '1985-03-15',
      time: '07:42',
      location: { lat: 39.7392, lng: -104.9903, timezone: 'America/Denver' },
    },
    birthPlace: 'Denver, Colorado',
  });
  const secs = ((Date.now() - started) / 1000).toFixed(0);

  console.log(`\n=== GENERATED in ${secs}s ===`);
  console.log(`chapters: ${draft.chapters.length}`);
  for (const c of draft.chapters) {
    const paras = c.body.split(/\n\s*\n/).filter(Boolean).length;
    console.log(`- "${c.title}"${c.element ? ` [${c.element}]` : ''} — ${paras} paras, ${c.body.length} chars`);
  }
  console.log(`placements: ${draft.natalChartSummary?.placements.length} · synthesis chars: ${draft.natalChartSummary?.synthesis.length}`);
  console.log(`mentorEnabled: ${draft.mentorEnabled}`);
  console.log('\n--- register sample (chapter 1, first 600 chars) ---');
  console.log(draft.chapters[0]?.body.slice(0, 600));
}

main().catch((e) => {
  console.error('FAILED:', e?.message || e);
  process.exit(1);
});
