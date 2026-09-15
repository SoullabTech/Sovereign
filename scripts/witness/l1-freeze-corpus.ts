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
const pseudo = (tok: string) => {
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

  // Veil the probe with the SAME mapping, or overlap would be destroyed.
  const veiledProbe = veil(probe);

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
    probe: veiledProbe,
    corpus,
  }, null, 2));
}

main().catch(e => { console.error(String(e?.message ?? e)); process.exit(1); });
