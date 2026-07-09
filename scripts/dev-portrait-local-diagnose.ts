/**
 * Dev diagnostic: what does the local deep tier actually return for the
 * literary portrait contract? Prints raw-output metrics only (no secrets).
 *   LOCAL_TIER_ENABLED=true OLLAMA_MODEL_DEEP=qwen2.5:7b npx tsx scripts/dev-portrait-local-diagnose.ts
 */
import { calculateBirthChart } from '../lib/astrology/ephemerisCalculator';
import { getLLMProvider } from '../lib/consciousness/LLMProvider';
import { chartSummaryText, portraitSystemPrompt } from '../lib/soulPortrait/generator/portraitPrompt';

async function main() {
  const chart = await calculateBirthChart({
    date: '1985-03-15',
    time: '07:42',
    location: { lat: 39.7392, lng: -104.9903, timezone: 'America/Denver' },
  });
  const llm = await getLLMProvider().generateSimple({
    tier: 'deep',
    systemPrompt: portraitSystemPrompt({ name: 'River Hartwell', mode: 'gift' }),
    messages: [{ role: 'user', content: `Here are River Hartwell's natal placements and whole-chart shape. Write their Soul Portrait as the JSON object specified.\n\n${chartSummaryText(chart)}` }],
    temperature: 0.7,
    maxTokens: 12000,
  });
  const raw = llm.text || '';
  console.log(`raw chars: ${raw.length}`);
  console.log(`ends with: ...${JSON.stringify(raw.slice(-80))}`);
  try {
    const j = JSON.parse(raw.trim().replace(/^```(json)?/i, '').replace(/```$/, ''));
    report(j);
  } catch {
    console.log('strict parse: FAIL (repair path would run)');
    const first = raw.indexOf('{');
    const last = raw.lastIndexOf('}');
    try {
      const j = JSON.parse(raw.slice(first, last + 1));
      report(j);
    } catch (e: any) {
      console.log('slice parse also failed:', e?.message);
    }
  }
}

function report(j: any) {
  const ch = Array.isArray(j.chapters) ? j.chapters : [];
  console.log(`chapters: ${ch.length}`);
  for (const c of ch) console.log(`- "${c?.title}" — ${String(c?.body || '').length} chars`);
}

main().catch((e) => { console.error('FAILED:', e?.message); process.exit(1); });
