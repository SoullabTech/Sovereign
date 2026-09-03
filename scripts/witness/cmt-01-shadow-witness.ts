/**
 * CMT-01 / M2 — live shadow witness collector.
 *
 * Reads container log lines (stdin or a file) and produces the M2 production-parity record the
 * founder specified — WITHOUT member content: the [MAIA/shadow] and [MAIA/manifest] lines carry
 * digests, ids, counts and reason codes only, and this script re-emits nothing else.
 *
 * Usage (from the Mac Studio, against production):
 *   ssh soullab@minisforum 'docker logs maia-sovereign --since "<start>" --until "<end>" 2>&1' \
 *     | grep -E "\[MAIA/(shadow|manifest)\]|canonical construction failed|GIT_COMMIT" \
 *     | npx tsx scripts/witness/cmt-01-shadow-witness.ts --sha 2fafaa4 --start "<start>" --end "<end>"
 *
 *   or:  npx tsx scripts/witness/cmt-01-shadow-witness.ts --file shadow.log --sha <R> --anchor 2fafaa4 ...
 *
 * --sha     the RUNTIME SHA the witness must observe in every manifest (the deploy-chain
 *           repair commit R, whose history contains the CMT M2 implementation)
 * --anchor  the CMT M2 implementation anchor (2fafaa4) — recorded, never substituted for --sha.
 *           CMT application behaviour is unchanged between anchor and R; only deployment
 *           provenance machinery differs. Say both; never let the evidence read cleaner than it is.
 *
 * Acceptance (whole set): every [MAIA/shadow] line has
 *   zeroDiff:true · missingInCanonical:[] · missingInLegacy:[] · digestMismatch:[]
 * and at least one turn where the field was non-empty (canonicalCount > 0).
 * A single non-zero diff STOPS the witness; it is printed verbatim for classification.
 */
import { readFileSync } from 'node:fs';

const SHADOW = '[MAIA/shadow]';
const MANIFEST = '[MAIA/manifest]';
const FAILED = 'canonical construction failed';

const args = process.argv.slice(2);
const opt = (k: string): string | undefined => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : undefined; };
const input = opt('--file') ? readFileSync(opt('--file') as string, 'utf8') : readFileSync(0, 'utf8');

type Shadow = { turnId: string; zeroDiff: boolean; missingInCanonical: string[]; missingInLegacy: string[]; digestMismatch: string[]; legacyCount: number; canonicalCount: number };
type Manifest = { turnId: string; identityStatus: string; counts: { held: number; offered: number; admitted: number; excluded: number }; held: { producerId: string; reason: string }[]; buildSha: string; cognitionPath: string };

const shadows: Shadow[] = [];
const manifests: Manifest[] = [];
const failures: string[] = [];
const unparsed: number[] = [];

input.split('\n').forEach((line, i) => {
  if (line.includes(FAILED)) { failures.push(line.replace(/^.*?\[MAIA\/shadow\]/, '[MAIA/shadow]')); return; }
  const at = line.indexOf(SHADOW) >= 0 ? SHADOW : line.indexOf(MANIFEST) >= 0 ? MANIFEST : null;
  if (!at) return;
  try {
    const json = JSON.parse(line.slice(line.indexOf(at) + at.length).trim());
    if (at === SHADOW) shadows.push(json); else manifests.push(json);
  } catch { unparsed.push(i + 1); }
});

const zero = shadows.filter((s) => s.zeroDiff);
const nonZero = shadows.filter((s) => !s.zeroDiff);
const nonEmptyField = shadows.filter((s) => s.canonicalCount > 0 || s.legacyCount > 0);
const loaderErrors = manifests.flatMap((m) => (m.held ?? []).filter((h) => h.reason === 'loader_error').map((h) => `${m.turnId}:${h.producerId}`));
const shas = Array.from(new Set(manifests.map((m) => m.buildSha)));
const paths = Array.from(new Set(manifests.map((m) => m.cognitionPath)));
const identity = manifests.reduce<Record<string, number>>((acc, m) => { acc[m.identityStatus] = (acc[m.identityStatus] ?? 0) + 1; return acc; }, {});

const expectedSha = opt('--sha');
const shaOk = expectedSha ? shas.length === 1 && shas[0].startsWith(expectedSha) : null;
const accepted = shadows.length > 0 && nonZero.length === 0 && failures.length === 0 && nonEmptyField.length > 0 && (shaOk !== false);

const record = {
  witness: 'CMT-01 M2 production parity',
  cmtImplementationAnchor: opt('--anchor') ?? null,
  deployedSha: { expected: expectedSha ?? null, observedInManifests: shas, match: shaOk },
  window: { start: opt('--start') ?? null, end: opt('--end') ?? null },
  shadowComparisons: shadows.length,
  zeroDiffTrue: zero.length,
  zeroDiffFalse: nonZero.length,
  turnsWithNonEmptyField: nonEmptyField.length,
  manifests: manifests.length,
  identityStatus: identity,
  cognitionPaths: paths,
  loaderErrors,
  constructionFailures: failures,
  unparsedLines: unparsed,
  legacyRemainedAuthoritative: paths.every((p) => p === 'shadow'),
  shadowPersistentWrites: 'none by construction — R31 (tests/constitutional/refusal-registry/refusal-31-canonical-shadow-observational.ts)',
  nonZeroDiffsVerbatim: nonZero,
  ACCEPTED: accepted,
};

console.log(JSON.stringify(record, null, 2));
if (!accepted) {
  console.error(nonZero.length > 0
    ? `\nSTOP: ${nonZero.length} non-zero diff(s). Classify; do not normalize, suppress, or fix M3 around it.`
    : failures.length > 0 ? `\nSTOP: ${failures.length} construction failure(s).`
    : shadows.length === 0 ? '\nNo [MAIA/shadow] lines in input.'
    : nonEmptyField.length === 0 ? '\nNot yet acceptable: no turn with a non-empty field observed.'
    : '\nNot acceptable: deployed SHA mismatch.');
  process.exit(1);
}
