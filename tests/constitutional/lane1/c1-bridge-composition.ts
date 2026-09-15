/**
 * C1-BRIDGE · COMPOSITION-LEVEL ACCEPTANCE — P1 / N1 / N2 at the SERVING seam.
 *
 * ⭐⭐ WHY THIS EXISTS SEPARATELY. It is not enough that `recoverViaBridge()` returns an
 * abstention. The serving path must also hand the member nothing. Otherwise the N2 law
 * is an internal detail of one pure function while composition quietly violates it —
 * the mechanism says "there is no grounded path" and the member still receives
 * [2,3,36].
 *
 * ⛔ Same frozen corpora as the function-level set, imported rather than re-derived, so
 *    the two levels cannot drift apart.
 */
import { P1, N1, N2, MARKER, type BridgeExchange } from './c1-bridge-acceptance';
import { recoverForTier } from '../../../lib/sovereign/maiaService';

const APERTURE = 3;   // prefix 38,39,40 · displaced 0..37 — the frozen acceptance shape

function serve(corpus: BridgeExchange[]) {
  const all = corpus.map(e => ({
    exchangeKey: `k${e.index}`, index: e.index,
    timestamp: new Date(1_700_000_000_000 + e.index * 60_000).toISOString(),
    userMessage: e.userMessage, maiaResponse: e.maiaResponse,
  }));
  const probe = all.find(e => e.index === 40)?.userMessage
    ?? all[all.length - 1]!.userMessage;
  return recoverForTier({ utterance: probe, allSessionExchanges: all, apertureCount: APERTURE });
}

let pass = 0, fail = 0;
const ok = (n: string, c: boolean, d = '') => {
  if (c) { pass++; console.log(`  ✅ ${n}`); } else { fail++; console.log(`  ❌ ${n}${d ? ` — ${d}` : ''}`); }
};

console.log('C1-BRIDGE · COMPOSITION (serving seam: recoverForTier)\n');

const p1 = serve(P1.corpus);
ok(`P1 · serving recovers ${MARKER}`,
   p1.recovered.some(e => e.index === MARKER),
   `got [${p1.recovered.map(e => e.index)}]`);
ok('P1 · a prompt block is produced', p1.block.length > 0);

const n1 = serve(N1.corpus);
ok(`N1 · serving does NOT recover ${MARKER}`,
   !n1.recovered.some(e => e.index === MARKER),
   `got [${n1.recovered.map(e => e.index)}]`);

const n2 = serve(N2.corpus);
ok('N2 · serving recovers NOTHING', n2.recovered.length === 0,
   `got [${n2.recovered.map(e => e.index)}]`);
ok('N2 · and emits NO prompt block', n2.block === '',
   `block length ${n2.block.length}`);

// ⭐ The decisive one: composition must not fall through to the opaque scorer, which
// returns [2,3,36] on this corpus. If any of those appear on N2, the law was violated
// at the seam even though the pure function abstained.
const FALLTHROUGH = [2, 3, 36];
ok('N2 · no fall-through to the opaque scorer',
   !n2.recovered.some(e => FALLTHROUGH.includes(e.index)),
   `got [${n2.recovered.map(e => e.index)}] — scorer would give [${FALLTHROUGH}]`);

console.log(`\n${'─'.repeat(60)}\nCOMPOSITION: ${pass} passed · ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
