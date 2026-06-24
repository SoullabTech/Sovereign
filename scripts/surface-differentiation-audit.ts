/**
 * MAIA SURFACE DIFFERENTIATION AUDIT — measurement-only, throwaway. (0B-1)
 *
 * Question: does elemental differentiation reach the MEMBER surface, and in what
 * form — Regime A (labeled distinct voices), B (one fixed voice, routing inert at
 * surface), or C (one voice whose content is conditioned by which attentional
 * fields participated)?
 *
 * Instrument: calls getMaiaResponse() IN-PROCESS — the exact composition behind
 * the member route, whose body is literally `message: orchestratorResult.text`
 * (app/api/sovereign/app/maia/route.ts:314). No HTTP, no auth, no running server.
 * This is faithful to the differentiation FORM; it skips HTTP/middleware, which
 * never touch `.text`.
 *
 * Identity: `anon:` userId — no real member's memory is loaded or polluted, so the
 * elemental + WisdomRouter conditioning is isolated as the variable under test.
 *
 * Captured per probe (internal + external):
 *   - surface text (external, member-facing)        + length
 *   - processing tier (FAST/CORE/DEEP)              + provider/model (Claude vs Ollama)
 *   - dominant element (meta.elementalResult.dominant)
 *   - elemental agents: how many carried real prose vs pattern-only
 *   - WisdomRouter: activated? which agent / pattern
 *   - Regime-A detector: are voices LABELED in the surface text?
 *   - element-leak: does the dominant element's word surface in the text?
 *
 * Raw JSON (full texts + meta) -> /tmp. Compact classification -> stdout.
 *
 * Run: node --env-file=.env.local --import tsx scripts/surface-differentiation-audit.ts
 */

type ProbeDef = { id: string; category: string; input: string };

// Real-but-contained member utterances. No element words, no Spiralogic, no framework.
// Two per category across the six attention-types from the steward's protocol.
const PROBES: ProbeDef[] = [
  { id: 'dec-1', category: 'decision', input: "I've been offered a job in another city and I keep going back and forth. I can't tell if I'm genuinely excited or just afraid of staying where I am." },
  { id: 'dec-2', category: 'decision', input: "Do I tell my friend the truth about what I saw, or is it kinder to just stay quiet? I keep rehearsing both." },
  { id: 'grief-1', category: 'grief', input: "My dad died eight months ago and today, out of nowhere, I couldn't stop crying in the middle of the grocery store." },
  { id: 'grief-2', category: 'grief', input: "I still reach for my phone to text my friend who passed. I don't know what to do with that reflex." },
  { id: 'rel-1', category: 'relationship', input: "My partner and I keep having the same fight and I honestly don't even know what it's really about anymore." },
  { id: 'rel-2', category: 'relationship', input: "I think I've been the one holding everything together for years, and I'm starting to quietly resent it." },
  { id: 'prac-1', category: 'practical', input: "I have three deadlines this week and I genuinely don't know where to start. My brain just freezes when I sit down." },
  { id: 'prac-2', category: 'practical', input: "How do I bring up the broken heating with my landlord without it turning into a fight?" },
  { id: 'id-1', category: 'identity', input: "I used to know exactly who I was. Lately I look in the mirror and I'm honestly not sure anymore." },
  { id: 'id-2', category: 'identity', input: "Everyone sees me as the strong one. I don't know who I am when I'm not performing that for people." },
  { id: 'fut-1', category: 'future', input: "I'm turning forty next month and I can't tell if I'm anywhere near where I'm supposed to be." },
  { id: 'fut-2', category: 'future', input: "I keep imagining a completely different life, but I'm scared it's just a fantasy I'm using to avoid this one." },
];

const PER_PROBE_TIMEOUT_MS = 90_000;
const ELEMENTS = ['fire', 'water', 'earth', 'air', 'aether'];

function withTimeout<T>(p: Promise<T>, ms: number, label: string): Promise<T> {
  return Promise.race([
    p,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error(`TIMEOUT[${label}] after ${ms}ms`)), ms)),
  ]);
}

// Regime-A detector: are elemental voices LABELED as distinct sections in the surface?
function detectsLabeledVoices(text: string): boolean {
  const labelLine = /(^|\n)\s*(fire|water|earth|air|aether)\s*[:\-—]/i;
  const saysForm = /\b(fire|water|earth|air|aether)\s+(says|offers|speaks|whispers|responds)\b/i;
  return labelLine.test(text) || saysForm.test(text);
}

function elementLeak(text: string, dominant?: string): boolean {
  if (!dominant) return false;
  return new RegExp(`\\b${dominant}\\b`, 'i').test(text);
}

async function main() {
  const startedAt = new Date().toISOString();
  console.log(`\n=== MAIA SURFACE DIFFERENTIATION AUDIT (0B-1) — ${startedAt} ===`);
  console.log(`probes=${PROBES.length} | instrument=in-process getMaiaResponse | identity=anon (memory isolated)\n`);

  const { getMaiaResponse } = await import('../lib/sovereign/maiaService');
  const { ensureSession } = await import('../lib/sovereign/sessionManager');

  const rows: any[] = [];

  for (let i = 0; i < PROBES.length; i++) {
    const probe = PROBES[i];
    const sessionId = `surfaudit-${Date.now()}-${i}`;
    const meta: any = { userId: 'anon:probe-audit', mode: 'dialogue' };
    const row: any = { ...probe, sessionId, status: 'ok' };
    try {
      await ensureSession(sessionId); // fresh session per probe -> no history bleed between probes
      const res: any = await withTimeout(
        getMaiaResponse({ sessionId, input: probe.input, meta, includeAudio: false, originRoute: '/api/sovereign/app/maia' }),
        PER_PROBE_TIMEOUT_MS,
        probe.id,
      );

      const text: string = res?.text ?? '';
      const er: any = meta.elementalResult;
      const agents: any[] = er?.traceData?.elementalAgents ?? [];
      const agentsWithProse = agents.filter(a => typeof a?.wisdom === 'string' && a.wisdom.trim().length > 40).length;
      const wr: any = meta.wisdomRouting;

      row.tier = res?.processingProfile ?? '?';
      row.provider = res?.provider ? `${res.provider.provider}/${res.provider.model}` : 'n/a';
      row.dominant = er?.dominant ?? null;
      row.agentsTotal = agents.length;
      row.agentsWithProse = agentsWithProse;
      row.wisdomActivated = !!wr?.activated;
      row.wisdomAgent = wr?.meta?.agentName ?? null;
      row.wisdomPattern = wr?.meta?.patternType ?? null;
      row.labeledVoices = detectsLabeledVoices(text);
      row.elementLeak = elementLeak(text, er?.dominant);
      row.len = text.length;
      row.text = text; // full text -> /tmp only
    } catch (err: any) {
      row.status = 'FAILED';
      row.error = String(err?.message || err);
    }
    rows.push(row);
    const t = row.status === 'ok'
      ? `${row.tier?.padEnd(4)} | dom=${String(row.dominant).padEnd(6)} | agents=${row.agentsWithProse}/${row.agentsTotal}prose | wisdom=${row.wisdomActivated ? row.wisdomAgent : 'no'} | labeled=${row.labeledVoices} | leak=${row.elementLeak} | ${row.len}ch | ${row.provider}`
      : `FAILED: ${row.error}`;
    console.log(`[${String(i + 1).padStart(2)}/${PROBES.length}] ${probe.id.padEnd(7)} (${probe.category.padEnd(12)}) -> ${t}`);
  }

  // ---- AGGREGATE ----
  const ok = rows.filter(r => r.status === 'ok');
  const labeled = ok.filter(r => r.labeledVoices).length;
  const domDist: Record<string, number> = {};
  for (const r of ok) { const d = r.dominant ?? 'null'; domDist[d] = (domDist[d] || 0) + 1; }
  const distinctDom = Object.keys(domDist).filter(k => k !== 'null').length;
  const wisdomCount = ok.filter(r => r.wisdomActivated).length;
  const leakCount = ok.filter(r => r.elementLeak).length;
  const proseAny = ok.filter(r => r.agentsWithProse > 0).length;
  const tiers: Record<string, number> = {};
  for (const r of ok) tiers[r.tier] = (tiers[r.tier] || 0) + 1;

  let regime: string;
  if (labeled > 0) {
    regime = `A (labeled distinct voices at surface in ${labeled}/${ok.length})`;
  } else if (distinctDom >= 2 && (wisdomCount > 0 || leakCount > 0)) {
    regime = `C-structural: single voice, BUT routing varies (${distinctDom} elements) and reaches surface lexically (leak=${leakCount}, wisdom=${wisdomCount}). Perceptibility = HELD for fresh reader.`;
  } else if (distinctDom >= 2) {
    regime = `C-weak / B-leaning: routing varies internally (${distinctDom} elements) but NO surface signal (no element-leak, no wisdom activation). Conditioning may be sub-perceptual.`;
  } else {
    regime = `B: routing inert at surface (dominant stuck on '${Object.keys(domDist).join(',')}'). Nothing for a member to detect.`;
  }

  console.log(`\n--- AGGREGATE (n_ok=${ok.length}/${rows.length}) ---`);
  console.log(`tiers fired:           ${JSON.stringify(tiers)}`);
  console.log(`Regime A (labeled):    ${labeled}/${ok.length}`);
  console.log(`dominant distribution: ${JSON.stringify(domDist)}  (distinct=${distinctDom})`);
  console.log(`WisdomRouter activated:${wisdomCount}/${ok.length}`);
  console.log(`element-word leak:     ${leakCount}/${ok.length}`);
  console.log(`probes w/ elem prose:  ${proseAny}/${ok.length}  (FAST is pattern-only by design)`);
  console.log(`\n>>> STRUCTURAL REGIME: ${regime}`);
  console.log(`>>> NOTE: structural form only. Whether the conditioning is PERCEPTIBLE to someone never taught the model is the held question — requires a fresh reader, not this script.\n`);

  const out = {
    audit: 'surface-differentiation-0B1',
    startedAt,
    finishedAt: new Date().toISOString(),
    instrument: 'in-process getMaiaResponse (route.ts:314 thin wrapper)',
    identity: 'anon:probe-audit (memory isolated)',
    aggregate: { n_ok: ok.length, n_total: rows.length, tiers, labeled, domDist, distinctDom, wisdomCount, leakCount, proseAny, regime },
    rows, // full per-probe incl. surface text
  };
  const fs = await import('fs');
  const outfile = `/tmp/maia-surface-diff-audit-${Date.now()}.json`;
  fs.writeFileSync(outfile, JSON.stringify(out, null, 2), 'utf8');
  console.log(`raw outputs (full texts + meta) written to: ${outfile}`);
  console.log(`OUTFILE=${outfile}`);
  process.exit(0);
}

main().catch((err) => {
  console.error('\nSURFACE AUDIT FAILED:', err?.stack || err);
  process.exit(1);
});
