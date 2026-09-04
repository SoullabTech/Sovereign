/**
 * BUILD-07B — GATE A · structural witness for the developmental reader.
 *
 * Exercises contract falsifiers F1–F20 (docs/programme/WS2-07-BUILD-07B_READER_CONTRACT_2026-09-04.md §3)
 * with the inference seam REFUSING — no model participates. Gate A proves the
 * architecture; it does not close the unit. Gate B (one bounded live read
 * against the pinned candidate SHA) is a separate act.
 *
 *   npx tsx scripts/ws2-07b-reader-gate-a.ts
 *
 * No database. No network. The run forces MAIA_INFERENCE_MODE=sovereign for
 * its own process so the seam refuses by policy (F14), and installs a module
 * hook that fails the witness if the provider adapter is ever loaded.
 *
 * Output ends with `<n> checks · <k> failure(s)` and the candidate identity:
 * git HEAD, DEVELOPMENTAL-READER-01, and the prompt-contract hash.
 */

import { createHash } from 'crypto';
import { execSync } from 'child_process';
import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';
import Module from 'module';

process.env.MAIA_INFERENCE_MODE = 'sovereign';

let adapterLoaded = false;
const moduleLoader = Module as unknown as { _load: (request: string, ...rest: unknown[]) => unknown };
const originalLoad = moduleLoader._load;
moduleLoader._load = function (this: unknown, request: string, ...rest: unknown[]) {
  if (/anthropicStructuredAdapter|@anthropic-ai\/sdk/.test(request)) adapterLoaded = true;
  return originalLoad.call(this, request, ...rest);
};

let checks = 0;
let failures = 0;
const failed: string[] = [];
function check(id: string, ok: boolean, detail = ''): void {
  checks += 1;
  if (ok) {
    console.log(`  ✓ ${id}`);
  } else {
    failures += 1;
    failed.push(id);
    console.log(`  ✗ ${id}${detail ? ` — ${detail}` : ''}`);
  }
}
const refusalOf = (r: { outcome: string; refusal?: string }) => r.outcome === 'refused' ? r.refusal : r.outcome;

async function main() {
  const { evidenceAtRev1, liveDraft, revisionOf } = await import('@/lib/manuscript/development/__tests__/fixture');
  const { recoverEvidence } = await import('@/lib/manuscript/development/resolve');
  const { freezeReadState } = await import('@/lib/manuscript/development/readState');
  const {
    DEVELOPMENTAL_LENSES, DEVELOPMENTAL_NON_CONCLUSIONS, DEVELOPMENTAL_READ_CEILING_CODE_POINTS,
  } = await import('@/lib/manuscript/developmentalReader/contract');
  const {
    codePointLength, promptContractHash, READER_SYSTEM, READER_VERSION, readerTool, renderRequest, TOOL_NAME,
  } = await import('@/lib/manuscript/developmentalReader/render');
  const { validateRequest } = await import('@/lib/manuscript/developmentalReader/validate');
  const { readDevelopmentally, readerIdentity, resultFromBlocks } = await import('@/lib/manuscript/developmentalReader/read');

  type Evidence = ReturnType<typeof evidenceAtRev1>['evidence'];
  const recoveredFor = (evidence: Evidence, content: string) =>
    Object.entries(evidence.coverage.sections).filter(([, d]) => d === 'body').map(([sectionId]) => {
      const r = recoverEvidence({ kind: 'section' as const, sectionId }, evidence.readState, content);
      if (!r.ok || r.value.kind !== 'text') throw new Error('fixture recover failed');
      return r.value;
    });
  const request = (o: { withStructure?: boolean; lens?: string } = {}) => {
    const { revision, evidence } = evidenceAtRev1({ withStructure: o.withStructure });
    return { req: { commissionedLens: (o.lens ?? 'development') as 'development', evidence, recovered: recoveredFor(evidence, revision.content) }, revision, evidence };
  };
  const ID = readerIdentity('witness-model');
  const call = (input: unknown, name = TOOL_NAME) => ({ type: 'tool_use' as const, id: 't', name, input });
  const claim = (over: Record<string, unknown> = {}) => ({
    text: 'The lantern in s0 is not mentioned in s1.',
    refs: [{ kind: 'section', sectionId: 's0' }, { kind: 'section', sectionId: 's1' }],
    doesNotEstablish: ['across-unread-span'],
    ...over,
  });

  console.log('\nBUILD-07B · GATE A · structural witness (seam refusing)\n');

  /* F1 · F6 — prose provenance */
  {
    const { req, revision, evidence } = request();
    check('F1 valid request validates and renders body sections only', validateRequest(req).ok && renderRequest(req).includes('=== SECTION s1 ·') && !renderRequest(req).includes('=== SECTION s2 ·'));
    const tampered = { ...req, recovered: req.recovered.map((r, i) => i === 0 ? { ...r, text: r.text.replace('lantern', 'lamp') } : r) };
    const v1 = validateRequest(tampered);
    check('F1 one altered code point → recovered_integrity_failure', !v1.ok && v1.refusal === 'recovered_integrity_failure');
    const s2 = recoverEvidence({ kind: 'section', sectionId: 's2' }, evidence.readState, revision.content);
    if (!s2.ok || s2.value.kind !== 'text') throw new Error('fixture recover failed for s2');
    const v2 = validateRequest({ ...req, recovered: [...req.recovered, s2.value] });
    check('F6 position-depth section as prose → recovered_not_body_coverage', !v2.ok && v2.refusal === 'recovered_not_body_coverage');
    const v3 = validateRequest({ ...req, recovered: req.recovered.slice(1) });
    check('F6 body-depth section without recovered text → recovered_integrity_failure', !v3.ok && v3.refusal === 'recovered_integrity_failure');
    const v4 = validateRequest({ ...req, recovered: [...req.recovered, { ...req.recovered[0], sectionId: 'ghost' }] });
    check('F6 section outside the frozen state → recovered_not_in_read_state', !v4.ok && v4.refusal === 'recovered_not_in_read_state');
  }

  /* F2 · F3 — module-graph gates (re-run the same assertions the jest gates make) */
  {
    const root = join(__dirname, '..');
    const strip = (s: string) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
    const imports = (code: string) => [...code.matchAll(/from\s+'([^']+)'/g)].map((m) => m[1]);
    const dev = join(root, 'lib', 'manuscript', 'development');
    const devBad = readdirSync(dev).filter((f) => f.endsWith('.ts')).flatMap((f) =>
      imports(strip(readFileSync(join(dev, f), 'utf8'))).filter((s) =>
        /developmentalReader|structure\/maiaReader|ask\/askReader|lib\/ai|lib\/maia|lib\/oracle|@anthropic-ai|openai|ollama/.test(s)));
    check('F2 development/** imports no reader, model, or AI seam', devBad.length === 0, devBad.join(', '));
    const rdr = join(root, 'lib', 'manuscript', 'developmentalReader');
    const allowed = [/^\.\/(contract|render|validate|parse|read)$/, /^\.\.\/development\/(evidenceRef|readState|resolve|bind)$/,
      /^\.\.\/structure\/readerProvenance$/, /^\.\.\/\.\.\/ai\/structured\/(router|types)$/, /^crypto$/];
    const rdrBad = readdirSync(rdr).filter((f) => f.endsWith('.ts')).flatMap((f) =>
      imports(strip(readFileSync(join(rdr, f), 'utf8'))).filter((s) => !allowed.some((re) => re.test(s))));
    check('F3 reader imports only the 07A vocabulary, resolve, bind, the identity type, and the seam', rdrBad.length === 0, rdrBad.join(', '));
    const bindUsers = readdirSync(rdr).filter((f) => f.endsWith('.ts') && imports(strip(readFileSync(join(rdr, f), 'utf8'))).some((s) => s.endsWith('development/bind')));
    check('F3 bindEvidence reached only by the host loop', bindUsers.length === 1 && bindUsers[0] === 'read.ts', bindUsers.join(', '));
    const names = readdirSync(rdr).filter((f) => f.endsWith('.ts')).flatMap((f) => {
      const code = strip(readFileSync(join(rdr, f), 'utf8'));
      return ['LiveDraftState', 'LiveWork', 'captureEvidence', 'readStructureRows', 'HeadedSection', 'request_sections', 'INSERT INTO', 'fetch('].filter((n) => code.includes(n)).map((n) => `${f}:${n}`);
    });
    check('F3/F12/F15/F16 reader names no live Work, capture, heading channel, second tool, write, or fetch', names.length === 0, names.join(', '));
  }

  /* F4 — lens */
  {
    const okAll = DEVELOPMENTAL_LENSES.every((lens) => validateRequest(request({ lens }).req).ok);
    const bad = validateRequest({ ...request().req, commissionedLens: 'Development' as never });
    check('F4 each canonical lens accepted; anything else → invalid_lens', okAll && !bad.ok && bad.refusal === 'invalid_lens');
    const r = resultFromBlocks([call({ outcome: 'claims', claims: [claim({ lens: 'development' })] })], request().req, ID);
    check('F4 lens on a claim → foreign_field', refusalOf(r) === 'foreign_field');
  }

  /* F5 — ceiling */
  {
    const big = (n: number) => {
      const draft = liveDraft({ s0: '😀'.repeat(n), s1: '', s2: 'x', s3: 'y' });
      const revision = revisionOf(draft);
      const f = freezeReadState({ draft, revision, bodyScope: ['s0', 's1'] });
      if (!f.ok) throw new Error(f.refusal);
      return { commissionedLens: 'voice' as const, evidence: f.value, recovered: recoveredFor(f.value, revision.content) };
    };
    const at = validateRequest(big(DEVELOPMENTAL_READ_CEILING_CODE_POINTS));
    const over = validateRequest(big(DEVELOPMENTAL_READ_CEILING_CODE_POINTS + 1));
    check('F5 exactly 60,000 code points passes (astral: 120,000 UTF-16 units)', at.ok && at.bodyCodePoints === 60_000);
    check('F5 60,001 → ceiling_exceeded, refused whole', !over.ok && over.refusal === 'ceiling_exceeded' && /nothing trimmed/.test(over.detail));
    const host = await readDevelopmentally(big(DEVELOPMENTAL_READ_CEILING_CODE_POINTS + 1));
    check('F5 host loop refuses over-ceiling before the seam', refusalOf(host) === 'ceiling_exceeded');
  }

  /* F7 — structure only from the frozen context */
  {
    const withS = renderRequest(request({ withStructure: true }).req);
    check('F7 frozen authored units rendered with the member\'s words; proposed row absent', withS.includes('unit u1 ·') && withS.includes('"chapter · One"') && !withS.includes('p9'));
    const r = resultFromBlocks([call({ outcome: 'claims', claims: [claim(), claim({ refs: [{ kind: 'structure-unit', unitId: 'u1' }] })] })], request({ withStructure: false }).req, ID);
    check('F7 structural claim with no frozen structure → claim_unbindable(structure_not_supplied), whole result', refusalOf(r) === 'claim_unbindable' && r.outcome === 'refused' && r.index === 1 && /structure_not_supplied/.test(r.detail));
    check('F7 request has exactly commissionedLens · evidence · recovered', Object.keys(request().req).sort().join(',') === 'commissionedLens,evidence,recovered');
  }

  /* F8 · F9 — claim accountability */
  {
    const { req } = request({ withStructure: true });
    const good = resultFromBlocks([call({ outcome: 'claims', claims: [claim(), claim({ refs: [{ kind: 'section-run', sectionIds: ['s1', 's2', 's3'] }, { kind: 'structure-topology' }] })] })], req, ID);
    check('F8 bindable claims come back bound with identity', good.outcome === 'claims' && good.claims.length === 2 && good.reader.readerVersion === READER_VERSION);
    const bad = resultFromBlocks([call({ outcome: 'claims', claims: [claim(), claim({ refs: [{ kind: 'section', sectionId: 's3' }] })] })], req, ID);
    check('F8 one unbindable ref refuses the whole result, never the subset', bad.outcome === 'refused' && bad.refusal === 'claim_unbindable' && bad.index === 1 && /body_not_read/.test(bad.detail));
    const empty = resultFromBlocks([call({ outcome: 'claims', claims: [claim({ refs: [] })] })], req, ID);
    check('F8 empty refs → claim_unbindable(no_evidence)', empty.outcome === 'refused' && /no_evidence/.test(empty.detail));
    const missing = resultFromBlocks([call({ outcome: 'claims', claims: [claim({ doesNotEstablish: [] })] })], req, ID);
    const unknown = resultFromBlocks([call({ outcome: 'claims', claims: [claim({ doesNotEstablish: ['not-sure'] })] })], req, ID);
    check('F9 empty doesNotEstablish → non_conclusion_missing; foreign value → non_conclusion_unknown', refusalOf(missing) === 'non_conclusion_missing' && refusalOf(unknown) === 'non_conclusion_unknown');
    const schema = JSON.stringify(readerTool().input_schema);
    check('F9 the eight ratified values are in the tool schema and the prompt verbatim', DEVELOPMENTAL_NON_CONCLUSIONS.length === 8 && DEVELOPMENTAL_NON_CONCLUSIONS.every((v) => schema.includes(`"${v}"`) && READER_SYSTEM.includes(v)));
  }

  /* F10 · F11 · F12 · F13 */
  {
    const { req } = request();
    const forbidden = ['id', 'observationKey', 'phenomenon', 'interpretation', 'questions', 'possibilities', 'uncertainty', 'severity', 'priority', 'score', 'confidence', 'rank', 'lens'];
    const schema = JSON.stringify(readerTool().input_schema);
    check('F10 tool schema names no 07C-shaped field', forbidden.every((f) => !new RegExp(`"${f}"\\s*:`).test(schema)));
    check('F10 any 07C-shaped field on a claim → foreign_field', forbidden.every((f) => refusalOf(resultFromBlocks([call({ outcome: 'claims', claims: [claim({ [f]: 'x' })] })], req, ID)) === 'foreign_field'));
    const none = resultFromBlocks([call({ outcome: 'none' })], req, ID);
    const noneWith = resultFromBlocks([call({ outcome: 'none', claims: [] })], req, ID);
    const emptyClaims = resultFromBlocks([call({ outcome: 'claims', claims: [] })], req, ID);
    check('F11 none is complete with identity; none+claims → foreign_field; claims+[] → malformed_output', none.outcome === 'none' && none.reader.model === 'witness-model' && refusalOf(noneWith) === 'foreign_field' && refusalOf(emptyClaims) === 'malformed_output');
    const asks = resultFromBlocks([call({ sectionIds: ['s2'] }, 'request_sections')], req, ID);
    check('F12 a request for more sections → read_request_attempted', refusalOf(asks) === 'read_request_attempted');
    const textOnly = resultFromBlocks([{ type: 'text', text: 'nothing' }], req, ID);
    const two = resultFromBlocks([call({ outcome: 'none' }), call({ outcome: 'none' })], req, ID);
    check('F13 text-only and double tool call → malformed_output, never none', refusalOf(textOnly) === 'malformed_output' && refusalOf(two) === 'malformed_output');
  }

  /* F14 — the seam refuses under sovereign; the adapter never loads */
  {
    const r = await readDevelopmentally(request().req);
    check('F14 sovereign mode → structured_inference_unavailable, unchanged', refusalOf(r) === 'structured_inference_unavailable');
    check('F14 provider adapter never loaded', adapterLoaded === false);
  }

  /* F15 — headings */
  {
    const rendered = renderRequest(request({ withStructure: true }).req);
    const outside = rendered.split('SECTION TEXT')[0];
    check('F15 no section heading outside the recovered prose; no heading channel', !/The First Movement|The Second Movement|heading/i.test(outside));
  }

  /* F17 · F20 — provenance and determinism */
  {
    const expected = createHash('sha256').update(READER_SYSTEM, 'utf8').update('\u0000').update(JSON.stringify(readerTool()), 'utf8').digest('hex');
    check('F17 promptContractHash = sha256(system ⧺ NUL ⧺ tool)', promptContractHash() === expected);
    check('F17 identity: anthropic · DEVELOPMENTAL-READER-01 · no frozenAt', ID.provider === 'anthropic' && ID.readerVersion === 'DEVELOPMENTAL-READER-01' && !('frozenAt' in ID));
    const { req } = request({ withStructure: true });
    check('F20 rendering is deterministic under recovered reordering', renderRequest(req) === renderRequest({ ...req, recovered: [...req.recovered].reverse() }));
    check('F20 code points, not UTF-16 units', codePointLength('😀a') === 2);
  }

  /* F18 · F19 */
  {
    const r = resultFromBlocks([call({ outcome: 'claims', claims: [claim()] })], request().req, ID);
    check('F18 a draft is text · refs · doesNotEstablish and nothing else — no BoundEvidence, no identity', r.outcome === 'claims' && Object.keys(r.claims[0]).sort().join(',') === 'doesNotEstablish,refs,text');
    const a = await readDevelopmentally(request().req);
    const b = await readDevelopmentally(request({ withStructure: false }).req);
    check('F19 two invocations share nothing (both independently refused by the seam)', refusalOf(a) === refusalOf(b) && a !== b);
  }

  let head = 'unknown';
  try { head = execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim(); } catch { /* not a checkout */ }
  console.log(`\n${checks} checks · ${failures} failure(s)`);
  if (failures > 0) console.log(`failed: ${failed.join(' | ')}`);
  console.log(`\nCANDIDATE  git HEAD ${head}`);
  console.log(`READER     ${READER_VERSION}`);
  console.log(`PROMPT     ${promptContractHash()}`);
  console.log(`GATE A     ${failures === 0 ? 'PASS — STRUCTURALLY PROVED · NOT CLOSED (Gate B pending)' : 'FAIL'}\n`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((err) => { console.error(err); process.exit(2); });
