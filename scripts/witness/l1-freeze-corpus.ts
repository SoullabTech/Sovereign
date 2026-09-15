/**
 * L1 · freeze the production counterexample as a CONTENT-FREE corpus.
 *
 * Authority: founder ruling 2026-09-15 — make the actual 41-exchange session the
 * authoritative C1 falsifier.
 *
 * ⛔⛔ THE SESSION'S TEXT NEVER ENTERS THE REPOSITORY. That conversation contains the
 * member's account of his ten-year-old self, among the most personal material in the
 * system. This lane's own evidence discipline (S3 `D3`) is: record presence, never
 * content. A verbatim test corpus would violate it permanently and in public.
 *
 * ⭐ STRUCTURAL EXACTNESS WITHOUT THE TEXT. The scorer only ever sees TOKENS. Document
 * frequency, idf overlap, rarity and recurrence all depend on token IDENTITY — never on
 * what a word means. So replacing each token with a stable pseudonym reproduces every
 * computation bit-for-bit:
 *
 *     df(token)            preserved — same tokens co-occur in the same documents
 *     idfOverlap           preserved — probe/exchange matches are identity matches
 *     rarity, recurrence   preserved — derived from df
 *     exchange INDEX       preserved — the positional trap survives
 *     token COUNT          preserved — length asymmetry survives
 *
 * ⭐ The salt is random per run and DISCARDED, so the mapping cannot be inverted or
 * dictionary-attacked afterwards. ⛔ Do not persist it.
 *
 * Tokenization mirrors `sessionRecovery.tokenize` — stopwords and short words are
 * dropped BEFORE pseudonymization, so they never leave the host either.
 *
 * Run on minisforum:
 *   docker exec maia-sovereign sh -c \
 *     'cd /app && npx tsx scripts/witness/l1-freeze-corpus.ts <sessionId> <probe>'
 */
import { randomBytes, createHash } from 'crypto';
import { getSessionContinuityWindow } from '../../lib/sovereign/sessionManager';

const STOPWORDS = new Set([
  'a','an','the','and','or','but','if','of','to','in','on','at','by','for','with',
  'about','as','is','are','was','were','be','been','being','it','its','this','that',
  'these','those','i','you','we','they','he','she','me','my','your','our','their',
  'do','does','did','have','has','had','not','no','so','than','then','there','here',
  'what','which','who','whom','when','where','why','how','can','could','would',
  'should','will','just','from','up','out','into','over','again','more','some','any',
  'all','very','really','like','get','got','know','think','one','thing','things',
]);
const tokenize = (t: string) =>
  t.toLowerCase().replace(/[^a-z0-9\s'-]/g, ' ').split(/\s+/)
   .filter(x => x.length > 2 && !STOPWORDS.has(x));

const SALT = randomBytes(32).toString('hex');   // ⛔ never printed, never stored
const seen = new Map<string, string>();

/**
 * ⭐⭐ THE PROBE'S OWN TOKENS ARE IDENTITY-MAPPED, and this is load-bearing.
 *
 * A first freeze veiled everything, and the CONTROL correctly rejected it: the deployed
 * scorer recovered NOTHING, because `retrospectiveDemand` is the one part of the scorer
 * that reads words AS WORDS — it matches " earlier ", " i shared ", " remember " on the
 * raw string. Veiling erased them, demand fell to 0, and the gate never opened. The
 * freeze was faithful for every RANKING input and destroyed the GATE.
 *
 * ⭐ So the probe's own content tokens map to themselves. Demand then computes exactly
 * as production logged it, and overlap survives — including the accidental match that
 * made the long passage win, which is the adversarial part that must not be softened.
 *
 * ⛔ What this reveals is only the probe's own words, which are generic and already
 * quoted openly. No member-authored content is exposed: every other token stays veiled.
 */
let identityTokens = new Set<string>();

const pseudo = (tok: string) => {
  if (identityTokens.has(tok)) return tok;
  let p = seen.get(tok);
  if (!p) {
    p = 'tk' + createHash('sha256').update(SALT + tok).digest('hex').slice(0, 8);
    seen.set(tok, p);
  }
  return p;
};
const veil = (text: string) => tokenize(text).map(pseudo).join(' ');

async function main() {
  const [sessionId, ...probeParts] = process.argv.slice(2);
  const probe = probeParts.join(' ');
  if (!sessionId || !probe) {
    console.error('usage: l1-freeze-corpus.ts <sessionId> <probe text…>');
    process.exit(2);
  }

  const w = await getSessionContinuityWindow(sessionId, 10);
  const all = w.allExchanges;

  // Identity-map the probe's tokens BEFORE veiling anything, so the gate survives.
  identityTokens = new Set(tokenize(probe));

  const corpus = all.map(e => ({
    index: e.index,
    userMessage: veil(e.userMessage),
    maiaResponse: veil(e.maiaResponse),
    memberTokenCount: tokenize(e.userMessage).length,
  }));

  console.log(JSON.stringify({
    note: 'CONTENT-FREE. Tokens are salted pseudonyms; the salt was discarded. ' +
          'Structure (df, overlap, rarity, recurrence, index, length) is exact.',
    sessionDepth: all.length,
    // ⭐ VERBATIM. The scorer must see the real question or the demand gate cannot fire.
    probe,
    probeDemandNote: 'verbatim; its tokens are identity-mapped in the corpus',
    corpus,
  }, null, 2));
}

main().catch(e => { console.error(String(e?.message ?? e)); process.exit(1); });
