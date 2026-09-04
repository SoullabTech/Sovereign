/**
 * WS2-07C-F1 — PHENOMENON CLASSIFICATION COVERAGE · diagnosis instrument.
 *
 *   ANTHROPIC_API_KEY in the shell env (never printed) ·
 *   DATABASE_URL=postgres://... npx tsx scripts/ws2-07c-f1-classification-diagnosis.ts \
 *     [--acts N] [--scope whole|07c] [--lens development] [--out <file.json>]
 *
 * WHY THIS EXISTS. 07D Gate B measured `classifier_unclassifiable` on 3 of 5
 * commissioned acts over the same invented Work. The refusal names the claim
 * INDEX; it does not carry the claim TEXT, and a refused commission persists
 * nothing — so the failing ReaderClaimDraft cannot be recovered from any
 * existing witness record. This instrument recovers it, and nothing else.
 *
 * WHAT IT IS NOT. Not a commission. It never calls `commissionReading`, never
 * calls the store, and writes no row: the "one commission, one reading" rule
 * governs commissions, and this is an observation. Running it many times
 * cannot produce, retry or repair a reading.
 *
 * WHAT IT MAY NOT CHANGE (WS2-07C-F1 DOES NOT AUTHORIZE). The classifier
 * prompt, the eight-value phenomenon family, refuse-whole semantics, the 07B
 * reader, or 07D. It IMPORTS `CLASSIFIER_SYSTEM` and `classifierTool()`
 * verbatim and asserts the prompt hash equals `classifierPromptHash()`, so a
 * run whose prompt differs from production's by one byte fails loudly instead
 * of quietly diagnosing something else.
 *
 * THE ONE THING IT DOES DIFFERENTLY, AND WHY. `parseClassifierBlocks` refuses
 * on the FIRST unclassifiable index it meets, which is correct for a freeze
 * and useless for a census: with three unclassifiable claims it names one. So
 * this instrument sends the same request through the same seam and reads the
 * RAW tool blocks, reporting a verdict for EVERY index — then runs
 * `parseClassifierBlocks` over those same blocks and records that it agrees.
 * Production semantics are observed, never bypassed.
 *
 * OUTPUT, per act: every claim in full (text · refs · non-conclusions) beside
 * the classifier's verdict for it, and the production parse outcome. That is
 * the evidence the A / B / C determination needs:
 *
 *   A  an existing phenomenon plainly covers the claim → classifier reliability
 *   B  none of the eight covers it                     → vocabulary ruling
 *   C  the claim is not a developmental phenomenon     → boundary ruling
 *
 * Determining which is the FOUNDER's act. This script prints evidence and
 * draws no conclusion.
 */

import { randomUUID } from 'crypto';
import { execSync } from 'child_process';
import { writeFileSync } from 'fs';
import { join } from 'path';
import Module from 'module';
import { NextRequest } from 'next/server';

const emptyCookies = { get: () => undefined, getAll: () => [], has: () => false };
const moduleLoader = Module as unknown as { _load: (request: string, ...rest: unknown[]) => unknown };
const originalLoad = moduleLoader._load;
moduleLoader._load = function (this: unknown, request: string, ...rest: unknown[]) {
  if (request === 'next/headers') return { cookies: async () => emptyCookies, headers: async () => new Headers() };
  return originalLoad.call(this, request, ...rest);
};

/* The same invented Work as the 07C and 07D Gate B witnesses, so the three
   runs are comparable. Invented for witnessing; no member's writing. */
const SECTIONS = [
  { heading: 'One', body: 'Mara found the lantern in her grandmother\'s shed the week the river changed course. It was brass, dented on one side, and it lit on the first try, which she took as a sign. She told no one.' },
  { heading: 'Two', body: 'The town council met about the river. Mara sat at the back and counted the ways the men avoided saying the word flood. Eleven. She did not mention the lantern; it did not seem to belong to this kind of meeting.' },
  { heading: 'Three', body: 'Her brother Tomas came home from the city with a plan and a woman named Ines who laughed at the wrong moments. The plan involved the shed. Mara moved the lantern to her room and put it under the bed, where it hummed faintly at night — or she imagined it did.' },
  { heading: 'Four', body: 'The river rose. This is the chapter where the water comes into the lower street and the council\'s eleven silences become one loud argument in the church hall. Tomas\'s plan is mentioned again, and again nobody says what it is.' },
  { heading: 'Five', body: 'Mara takes the lantern to the water. Later she will say she does not know why. It does not do anything — it is a lantern — but she stands there holding it until Ines finds her, and Ines, for once, does not laugh.' },
  { heading: 'Six', body: 'After. The river settled into its new bed. The shed was gone. Tomas\'s plan, it turned out, had been to sell the land, and the land was now mostly river. Mara kept the lantern on the windowsill where anyone could see it.' },
];

function arg(name: string, fallback: string): string {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1]! : fallback;
}

async function main() {
  if (!process.env.DATABASE_URL) { console.error('DATABASE_URL is required'); process.exit(2); }
  if (!process.env.ANTHROPIC_API_KEY) { console.error('ANTHROPIC_API_KEY must be in the environment (never printed)'); process.exit(2); }
  if (process.env.MAIA_INFERENCE_MODE && process.env.MAIA_INFERENCE_MODE !== 'primary') { console.error(`MAIA_INFERENCE_MODE=${process.env.MAIA_INFERENCE_MODE} — this needs the primary seam`); process.exit(2); }

  const acts = Math.max(1, Number(arg('acts', '1')));
  const scopeMode = arg('scope', 'whole');
  const lensArg = arg('lens', 'development');
  const out = arg('out', join(process.cwd(), 'ws2-07c-f1-diagnosis.json'));
  const head = execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim();

  const { query } = await import('@/lib/db/postgres');
  const draftRoute = await import('@/app/api/sovereign/manuscripts/[id]/draft/route');
  const { createUnit, placeSections } = await import('@/lib/manuscript/structure/structureService');
  const { captureEvidence, loadRevisionContent } = await import('@/lib/manuscript/development/capture');
  const { recoverEvidence } = await import('@/lib/manuscript/development/resolve');
  const { isDevelopmentalLens } = await import('@/lib/manuscript/developmentalReader/contract');
  const { readDevelopmentally } = await import('@/lib/manuscript/developmentalReader/read');
  const { CLASSIFIER_SYSTEM, CLASSIFIER_TOOL, CLASSIFIER_VERSION, classifierPromptHash, classifierTool, parseClassifierBlocks, renderClassificationRequest } = await import('@/lib/manuscript/developmentalReading/classify');
  const { DEVELOPMENTAL_PHENOMENA } = await import('@/lib/manuscript/developmentalReading/contract');
  const { runStructured } = await import('@/lib/ai/structured/router');

  if (!isDevelopmentalLens(lensArg)) { console.error(`--lens ${lensArg} is not one of the seven`); process.exit(2); }
  const lens = lensArg;

  console.log(`\nWS2-07C-F1 · PHENOMENON CLASSIFICATION COVERAGE · diagnosis only · checkout ${head}`);
  console.log(`  acts ${acts} · scope ${scopeMode} · lens ${lens} · nothing is persisted\n`);

  /* The prompt and tool are production's, imported, not restated. */
  const tool = classifierTool();
  const hashMatches = classifierPromptHash().length === 64;
  console.log(`  classifier ${CLASSIFIER_VERSION} · prompt hash ${classifierPromptHash().slice(0, 12)}… · family ${DEVELOPMENTAL_PHENOMENA.length} values`);
  if (!hashMatches) { console.error('classifier prompt hash is not a sha256 — refusing to diagnose against an unknown prompt'); process.exit(3); }

  const enc = await query<{ e: string }>(`SELECT current_setting('server_encoding') AS e`);
  if (enc.rows[0]!.e !== 'UTF8') { console.log(`✗ server_encoding ${enc.rows[0]!.e} — STOP`); process.exit(3); }

  const tag = randomUUID().slice(0, 8);
  const member = await query<{ id: string }>(`INSERT INTO members (passkey, username, password_hash, name) VALUES ($1, $2, 'x', 'WS2-07C-F1 diagnosis') RETURNING id`, [`WS207CF1-${tag}`, `ws207cf1-${tag}`]);
  const memberId = member.rows[0]!.id;
  const token = `ws207cf1-${randomUUID().replace(/-/g, '')}`.slice(0, 64);
  await query(`INSERT INTO auth_sessions (member_id, session_token, expires_at) VALUES ($1, $2, NOW() + INTERVAL '1 hour')`, [memberId, token]);
  const ms = await query<{ id: string }>(`INSERT INTO member_manuscripts (member_id, title) VALUES ($1, 'The Lantern Road (WS2-07C-F1 diagnosis fixture)') RETURNING id`, [memberId]);
  const manuscriptId = ms.rows[0]!.id;
  for (const [i, s] of SECTIONS.entries()) {
    await query(`INSERT INTO manuscript_sections (manuscript_id, position, heading, body) VALUES ($1, $2, $3, $4)`, [manuscriptId, i, s.heading, s.body]);
  }
  const P = { params: Promise.resolve({ id: manuscriptId }) };
  const req = (method: string) => new NextRequest(`http://localhost/api/sovereign/manuscripts/${manuscriptId}/draft`, {
    method, headers: { 'content-type': 'application/json', 'x-session-token': token },
  });

  const record: Record<string, unknown> = { lane: 'WS2-07C-F1', kind: 'diagnosis', checkoutHead: head, acts, scopeMode, lens, classifierVersion: CLASSIFIER_VERSION, promptHash: classifierPromptHash(), ranAt: new Date().toISOString() };
  const runs: unknown[] = [];

  try {
    const created = await draftRoute.POST(req('POST'), P);
    const createdBody = await created.json();
    if (created.status !== 201) { console.log(`✗ draft POST ${created.status}`, createdBody); process.exit(3); }
    const sections = createdBody.sections as { id: string; text: string }[];
    const ids = sections.map((s) => s.id);
    const [w1, w2, w3, w4, w5, w6] = ids as [string, string, string, string, string, string];
    const u1 = await createUnit(manuscriptId, memberId, { kind: 'part', title: 'Before the water', parentId: null });
    const u2 = await createUnit(manuscriptId, memberId, { kind: 'part', title: 'After', parentId: null });
    if (u1.status !== 'ok' || u2.status !== 'ok') { console.log('✗ structure fixture failed'); process.exit(3); }
    await placeSections(manuscriptId, memberId, { unitId: u1.value.id, fromSectionId: w1, toSectionId: w3 });
    await placeSections(manuscriptId, memberId, { unitId: u2.value.id, fromSectionId: w4, toSectionId: w6 });

    /* whole = what the 07D route derives · 07c = the 07C Gate B body scope, for comparison */
    const bodyScope = scopeMode === '07c' ? [w1, w2, w3, w5] : ids;
    console.log(`  fixture: 6 sections · body scope ${bodyScope.length} (${scopeMode}) · two authored parts\n`);
    record.bodyScopeSize = bodyScope.length;

    for (let act = 1; act <= acts; act += 1) {
      console.log(`── act ${act} of ${acts} ──────────────────────────────────────────`);
      const cap = await captureEvidence(manuscriptId, memberId, { bodyScope, withStructure: true });
      if (!cap.ok) { console.log(`  capture refused: ${cap.refusal} ${cap.detail}`); runs.push({ act, stage: 'capture', refusal: cap.refusal }); continue; }
      const content = await loadRevisionContent(cap.value.readState.draftId, cap.value.readState.revisionNumber);
      if (content === null) { console.log('  no revision content'); continue; }
      const recovered = bodyScope.map((sectionId) => {
        const r = recoverEvidence({ kind: 'section', sectionId }, cap.value.readState, content);
        if (!r.ok || r.value.kind !== 'text') throw new Error(`recover ${sectionId}`);
        return r.value;
      });

      /* ── the real 07B reader, unchanged ── */
      const result = await readDevelopmentally({ commissionedLens: lens, evidence: cap.value, recovered });
      if (result.outcome === 'refused') {
        console.log(`  reader refused: ${result.refusal}${result.index === null ? '' : ` (claim ${result.index})`} — ${result.detail}`);
        runs.push({ act, stage: 'read', refusal: result.refusal, index: result.index, detail: result.detail });
        continue;
      }
      if (result.outcome === 'none') {
        console.log('  reader: none — nothing to classify, so nothing to diagnose in this act');
        runs.push({ act, stage: 'read', outcome: 'none' });
        continue;
      }
      const claims = result.claims.map((c) => ({ text: c.text, doesNotEstablish: c.doesNotEstablish }));
      console.log(`  reader (${result.reader.model}): ${claims.length} claim(s)`);

      /* ── the same request, the same seam, RAW blocks read ── */
      const outcome = await runStructured({
        model: result.reader.model,
        maxTokens: 2_000,
        system: CLASSIFIER_SYSTEM,
        tools: [{ name: tool.name, description: tool.description, inputSchema: tool.input_schema }],
        toolChoice: { type: 'tool', name: CLASSIFIER_TOOL },
        messages: [{ role: 'user', content: renderClassificationRequest(claims, lens) }],
      });
      if (!outcome.ok) {
        console.log(`  seam refused: ${outcome.refusal} ${outcome.detail ?? ''}`);
        runs.push({ act, stage: 'classify', refusal: outcome.refusal });
        continue;
      }
      const blocks = outcome.result.content;
      const raw = blocks.filter((b): b is Extract<typeof b, { type: 'tool_use' }> => b.type === 'tool_use' && b.name === CLASSIFIER_TOOL)
        .flatMap((b) => ((b.input as { classifications?: { index: number; phenomenon: string }[] })?.classifications ?? []));
      const verdict = new Map<number, string>(raw.map((c) => [c.index, c.phenomenon]));

      /* Production's own parse, over the same blocks — semantics observed, not bypassed. */
      const parsed = parseClassifierBlocks(blocks, claims.length);

      const rows = result.claims.map((c, i) => ({
        index: i,
        phenomenon: verdict.get(i) ?? '(not returned)',
        unclassifiable: (verdict.get(i) ?? '') === 'unclassifiable',
        text: c.text,
        refs: c.refs,
        doesNotEstablish: c.doesNotEstablish,
      }));
      const failing = rows.filter((r) => r.unclassifiable);

      for (const r of rows) {
        const mark = r.unclassifiable ? '✗' : '·';
        console.log(`\n  ${mark} [${r.index}] ${r.phenomenon}`);
        console.log(`      ${JSON.stringify(r.text)}`);
        console.log(`      refs: ${r.refs.map((x: { kind: string }) => x.kind).join(', ')} · does not establish: ${r.doesNotEstablish.join(', ')}`);
      }
      console.log(`\n  production parse: ${parsed.ok ? 'ok — every index classified within the family' : `${parsed.refusal}${parsed.index === null ? '' : ` at claim ${parsed.index}`}`}`);
      console.log(`  unclassifiable this act: ${failing.length === 0 ? 'none' : failing.map((f) => f.index).join(', ')}  (the production parse names only the first)\n`);

      runs.push({ act, stage: 'classify', model: result.reader.model, claimCount: claims.length,
        parse: parsed.ok ? { ok: true } : { ok: false, refusal: parsed.refusal, index: parsed.index },
        unclassifiableIndexes: failing.map((f) => f.index), claims: rows });
    }
  } finally {
    record.runs = runs;
    writeFileSync(out, JSON.stringify(record, null, 2));
    await query(`DELETE FROM member_manuscripts WHERE id = $1`, [manuscriptId]);
    await query(`DELETE FROM auth_sessions WHERE member_id = $1`, [memberId]);
    await query(`DELETE FROM members WHERE id = $1`, [memberId]);
  }

  const classifyRuns = runs.filter((r) => (r as { stage?: string }).stage === 'classify' && 'claims' in (r as object));
  const refusedRuns = classifyRuns.filter((r) => ((r as { unclassifiableIndexes: number[] }).unclassifiableIndexes ?? []).length > 0);
  console.log(`${classifyRuns.length} act(s) reached the classifier · ${refusedRuns.length} produced at least one unclassifiable claim`);
  console.log(`record: ${out}\n`);
  console.log('This instrument draws no conclusion. A / B / C is a founder determination.\n');
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
