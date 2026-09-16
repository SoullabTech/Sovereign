/**
 * C1-BRIDGE-01 — read-only evidence act on the authoritative frozen corpus.
 *
 * QUESTION, and only this: does a deterministic evidentiary path exist from the current
 * retrospective demand, through the ACTIVE PREFIX, to displaced index 22?
 *
 * ⛔ No behavioural code. No weights. No deployment. ⛔ The corpus is asked what
 * relations it already contains — the bridge hypothesis is NOT assumed correct and a
 * fixture is NOT built for it.
 *
 * ⭐ Member-originated and assistant-originated evidence are kept separate throughout,
 * because a rule that lets MAIA's own echo manufacture a target is the same defect the
 * recurrence inquiry already refused.
 */
import corpus from './l1-frozen-production-corpus.json';

const SW = new Set(['a','an','the','and','or','but','if','of','to','in','on','at','by','for','with','about','as','is','are','was','were','be','been','being','it','its','this','that','these','those','i','you','we','they','he','she','me','my','your','our','their','do','does','did','have','has','had','not','no','so','than','then','there','here','what','which','who','whom','when','where','why','how','can','could','would','should','will','just','from','up','out','into','over','again','more','some','any','all','very','really','like','get','got','know','think','one','thing','things']);
const tok = (t: string) => t.toLowerCase().replace(/[^a-z0-9\s'-]/g,' ').split(/\s+/).filter(x => x.length>2 && !SW.has(x));

const byIdx = new Map(corpus.corpus.map(e => [e.index, e]));
const PROBE_IDX = 40, MARKER = 22;
const PREFIX = [38, 39];
const DISPLACED = corpus.corpus.filter(e => e.index <= 37);

const probeTokens = new Set(tok(byIdx.get(PROBE_IDX)!.userMessage));
console.log(`probe(${PROBE_IDX}) member tokens: [${[...probeTokens]}]\n`);

// ── HOP 1 · probe → active prefix ───────────────────────────────────────────
console.log('── HOP 1 · probe → ACTIVE PREFIX ──');
const hop1: { idx: number; member: string[]; assistant: string[] }[] = [];
for (const i of PREFIX) {
  const e = byIdx.get(i)!;
  const m = [...new Set(tok(e.userMessage))].filter(t => probeTokens.has(t));
  const a = [...new Set(tok(e.maiaResponse))].filter(t => probeTokens.has(t));
  hop1.push({ idx: i, member: m, assistant: a });
  console.log(`  idx ${i}  member:[${m}]  assistant:[${a}]`);
}

// ── HOP 2 · linked prefix → displaced ───────────────────────────────────────
console.log('\n── HOP 2 · prefix → DISPLACED (member-originated links only) ──');
for (const h of hop1) {
  if (h.member.length === 0) { console.log(`  idx ${h.idx}: no member link to probe — cannot bridge`); continue; }
  const src = byIdx.get(h.idx)!;
  const srcMember = new Set(tok(src.userMessage));
  const hits = DISPLACED.map(d => {
    const dm = [...new Set(tok(d.userMessage))].filter(t => srcMember.has(t));
    const da = [...new Set(tok(d.maiaResponse))].filter(t => srcMember.has(t));
    return { idx: d.index, viaMember: dm, viaAssistant: da };
  }).filter(x => x.viaMember.length > 0)
    .sort((a, b) => b.viaMember.length - a.viaMember.length);
  console.log(`  from idx ${h.idx} (linked to probe via member:[${h.member}]):`);
  for (const x of hits.slice(0, 6)) {
    console.log(`     → displaced ${String(x.idx).padStart(2)}  member-shared:[${x.viaMember}]` +
                (x.idx === MARKER ? '   ⭐ MARKER' : ''));
  }
  console.log(`     (${hits.length} displaced exchanges share member tokens with idx ${h.idx})`);
}

// ── THE PATH ────────────────────────────────────────────────────────────────
console.log('\n── DETERMINISTIC PATH? ──');
let found: string | null = null;
for (const h of hop1) {
  if (h.member.length === 0) continue;
  const srcMember = new Set(tok(byIdx.get(h.idx)!.userMessage));
  const shared = [...new Set(tok(byIdx.get(MARKER)!.userMessage))].filter(t => srcMember.has(t));
  if (shared.length > 0) found = `${PROBE_IDX} →[${h.member}]→ ${h.idx} →[${shared}]→ ${MARKER}`;
}
console.log(found
  ? `  ⭐ PATH EXISTS (member-originated at both hops):\n     ${found}`
  : '  ⛔ NO member-originated path from the probe to the marker');

// ── THE DANGEROUS INVERSE ───────────────────────────────────────────────────
console.log('\n── INVERSE · could ASSISTANT echo alone manufacture a bridge? ──');
for (const h of hop1) {
  if (h.member.length > 0 || h.assistant.length === 0) continue;
  console.log(`  ⚠️ idx ${h.idx} links to the probe ONLY through MAIA's words:[${h.assistant}]`);
}
const assistantOnlyTargets = DISPLACED.filter(d => {
  const src = byIdx.get(39)!;
  const srcMember = new Set(tok(src.userMessage));
  const dm = [...new Set(tok(d.userMessage))].filter(t => srcMember.has(t));
  const da = [...new Set(tok(d.maiaResponse))].filter(t => srcMember.has(t));
  return dm.length === 0 && da.length > 0;
});
console.log(`  ${assistantOnlyTargets.length} displaced exchanges would be reachable from idx 39` +
            ` ONLY via MAIA's echo: [${assistantOnlyTargets.map(d => d.index)}]`);
console.log('  ⭐ These are exactly what a bridge rule must NOT admit on assistant evidence alone.');
