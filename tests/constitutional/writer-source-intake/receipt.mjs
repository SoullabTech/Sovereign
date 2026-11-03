// receipt.mjs -- the per-obligation receipt builder and an INDEPENDENT validator for the Writer
// original-file intake acceptance instrument.
//
// Plain Node ESM, node: built-ins only, zero npm dependencies. Fictional data only.
//
// WHY THIS EXISTS
//   The only receipt the repository has for this subject (the pg16 witness) derives its coverage
//   booleans from ONE exit code and hard-codes the expected test total, so a single passing exit
//   code certifies behaviours that never ran. This receipt is the opposite construction:
//     * one ENTRY per obligation in the index (expectedEntries is computed from the index);
//     * every verdict is DERIVED from raw fields (disposition, status, evidence, real-KMS / real-vault /
//       browser declarations, gap record); nothing is typed in;
//     * every count and the overall verdict are computed from the entries; no total is stored as a
//       constant anywhere in this file;
//     * an ACCEPTED_GAP is never reported as PASS and is counted on its own line;
//     * a second, separately written derivation (validateReceipt) re-derives everything and refuses
//       a receipt whose recorded verdict, count, flag or label disagrees with its own raw fields;
//     * the receipt is BOUND to the tables it was computed from (a digest of the index and of the
//       disposition table), and `ruled: true` is only readable together with a ruling reference and a
//       seal over exactly those tables, so a shrunken index or a relabelled BLOCKER cannot ride a ruling.
//
// EXPORTS
//   buildReceipt({ index, dispositions, results, header, canaryPrefix?, pin? }) -> receipt
//       THROWS ReceiptInputError (unknown id, duplicate id, malformed input, unsealed ruling, pin mismatch)
//       or ReceiptContentLeak.
//   validateReceipt(receipt, { index, dispositions, canaryPrefix?, pin? }) -> { ok, problems[], codes[] }
//       Never throws; fails closed (an internal exception is itself a problem).
//   scrub(receipt, { canaryPrefix? }) -> { ok, scanned, findings:[{ path, rule, count }] }
//       Content-free: a finding names a path, a rule and a count, never the matched text.
//   computeTableDigest(index, dispositions) -> { index, dispositions }   (digest strings, see TABLE DIGEST)
//   sealRuling(dispositions, index, ref) -> dispositions   (what a founder ruling act produces; never called by a verdict path)
//   WRONG_RECEIPTS  [{ name, why, make(), context(), expectCodes[], forbidCodes[] }]  known-wrong constructions;
//       context() is the { index, dispositions } the receipt must be validated against (plus `pin` for the
//       constructions that are wrong only relative to their pin: pass the whole object to validateReceipt).
//   selfTest() -> { ok, checks:[{ name, ok, detail }] }     (also run when this file is executed)
//   also: syntheticResults, loadSuiteData, deriveEntryVerdict, rederiveEntryVerdict, PROBLEM_CODES,
//         SCHEMA, EVIDENCE_KINDS, FIXTURE_TEXT_MARKERS, the enumerations, and the two error classes.
//
// RECEIPT SHAPE (closed: an unknown field at any of these levels is a problem)
//   { schema, header, ruled, ruling, tableDigest, expectedEntries, entries[], tableBlockers[],
//     provisionalReasons[], counts, verdict }
//   entry = { id, category, disposition, requiresRealKms, requiresRealVault, requiresBrowser, gap, status,
//             environment, realKms, realVault, browser, evidence[{kind,ref,summary}], unmetDependencies[],
//             verdict, blocking }
//   `gap` is null for a BLOCKER and, for a DECLARED_GAP, four PRESENCE booleans (owner,
//   memberFacingSentence, closureCondition, registerLine). The gap text itself stays in
//   dispositions.json and is never copied into a receipt.
//   A NOT_RUN entry carries no run fields: environment, realKms, realVault and browser are null and
//   evidence is empty (the builder normalises; the validator refuses anything else), so a result that was
//   never produced is never counted in a per-environment tally.
//
// WHAT COUNTS AS EVIDENCE (derived per entry from its raw evidence items, by the builder and the validator alike)
//   An item discharges an obligation only if ALL of these hold:
//     * kind is in the closed vocabulary EVIDENCE_KINDS and its class is 'measured' or 'synthetic'
//       ('exit-code' is class 'context': it may ride along, it never discharges, alone or in numbers);
//     * ref is non-blank and NAMES THIS OBLIGATION'S ID as a whole token and names no other indexed id, so a
//       single artifact cannot be cited for many obligations;
//     * summary is non-blank, at least eight characters, not placeholder text and not a bare "ok/passed/done".
//   An item whose ref starts with `synthetic:` is class 'synthetic' whatever its kind says.
//   The receipt surfaces counts.evidence = { qualifying, measured, synthetic, distinctRefs, syntheticOnlyPasses }.
//
// ENTRY VERDICTS (derived, never typed)
//   PASS                BLOCKER or DECLARED_GAP, status PASS, >=1 discharging evidence item and, when the index
//                       says requiresRealKms / requiresRealVault / requiresBrowser, the result declared
//                       realKms / realVault / browser === true. An undeclared requirement is not a PASS.
//   INVALID_EVIDENCE    status PASS but one of those fails.                              (blocks)
//   BLOCKING_FAIL       BLOCKER + FAIL.                                                  (blocks)
//   BLOCKING_NOT_RUN    BLOCKER + NOT_RUN (a missing result is NOT_RUN).                 (blocks)
//   ACCEPTED_GAP        DECLARED_GAP + FAIL with all four gap fields substantive. Never PASS.
//   GAP_UNDECLARED      DECLARED_GAP + FAIL with any gap field missing or placeholder.   (blocks)
//   NOT_RUN             DECLARED_GAP + NOT_RUN. Listed, non-blocking.
//   unmetDependencies   per PASS entry: the ids in its index `dependsOn` whose own verdict is not PASS.
//
// OVERALL VERDICT
//   NOT_READY    any blocking entry, or any table blocker (below)
//   PROVISIONAL  nothing blocks but provisionalReasons is non-empty. The reasons, each derived:
//                  NOT_RULED                 dispositions.ruled is not true
//                  SYNTHETIC_EVIDENCE        a PASS entry rests only on synthetic evidence
//                  HEADER_KIND_NOT_MEASURED  header.kind is not exactly 'measured' (absence is not a declaration)
//                  UNMET_DEPENDENCY          a PASS entry depends on an obligation that did not PASS
//   STEP4_READY  nothing blocks and provisionalReasons is empty
//
// TABLE DIGEST AND RULING
//   tableDigest = { index, dispositions }: SHA-256 of the canonical JSON of the whole index and of the
//   `dispositions.dispositions` map (ruled, basis and ruling are NOT hashed: the ruling cannot contain its own
//   digest). A digest is written as `sha256:` plus eight groups of eight hex characters joined by '-', so that the
//   receipt-wide rule "no 32+ hex run, no exceptions" stays true. `ruled: true` is only readable when
//   dispositions.ruling = { ref, tableDigest:{index,dispositions} } is present, `ref` is an identifier (not a
//   hash) and the sealed digests equal the tables as they are now. An optional `pin` ({index,dispositions}, for
//   example from a FREEZE record kept elsewhere) is compared too. The seal is self-contained: someone who edits
//   the tables AND the sealed digests together defeats it; an external pin is what closes that.
//
// DELIBERATE TIGHTENINGS OF THE ASSIGNMENT (each is listed in the hand-off notes)
//   1. The PASS evidence rule also applies to DECLARED_GAP + PASS (the spec states it for BLOCKER
//      only). A PASS with no evidence is a false claim whichever disposition carries it.
//   2. Table blocker: when ruled is true, a DECLARED_GAP whose status is NOT_RUN and whose gap
//      record is incomplete blocks the overall verdict (entry verdict stays NOT_RUN, as specified).
//      Otherwise a ruling with empty register lines could ship as STEP4_READY. A ruled table in which no
//      BLOCKER passes (nothing was certified) is a table blocker too.
//   3. "Present" for a gap field means substantive: not blank, not placeholder text, long enough to be a
//      statement, and not a copy of another field of the same record.
//   4. The base64 content rule is refined (see RULES) because the literal rule rejects honest paths.
//   5. Text that is recognisably the fictional fixture manuscripts' own prose is a content leak (see
//      FIXTURE_TEXT_MARKERS); the per-fixture canary alone guards only one paragraph.
//
// WHAT THE VALIDATOR CANNOT ESTABLISH
//   It proves a receipt is internally consistent and obeys the verdict policy given its raw fields
//   and the index/dispositions it is handed. It cannot prove a recorded status is TRUE: a runner
//   that lies consistently (status, evidence, ref, summary, header and verdict all edited together)
//   produces a valid receipt. The evidence rules above make an accidental or lazy over-claim fail, they do not
//   make a deliberate one impossible. Truth of status is the job of the falsifiers behind it.

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));

/* ------------------------------------------------------------------------- *
 * Vocabulary
 * ------------------------------------------------------------------------- */

export const SCHEMA = 'writer-source-intake-receipt/2';
export const DEFAULT_CANARY_PREFIX = 'WSICANARY';
export const STATUSES = Object.freeze(['PASS', 'FAIL', 'NOT_RUN']);
export const ENVIRONMENTS = Object.freeze(['E0', 'E1', 'E2']);
export const DISPOSITIONS = Object.freeze(['BLOCKER', 'DECLARED_GAP']);
export const ENTRY_VERDICTS = Object.freeze([
  'PASS',
  'BLOCKING_FAIL',
  'BLOCKING_NOT_RUN',
  'INVALID_EVIDENCE',
  'ACCEPTED_GAP',
  'GAP_UNDECLARED',
  'NOT_RUN',
]);
export const BLOCKING_VERDICTS = Object.freeze([
  'BLOCKING_FAIL',
  'BLOCKING_NOT_RUN',
  'INVALID_EVIDENCE',
  'GAP_UNDECLARED',
]);
export const OVERALL_VERDICTS = Object.freeze(['NOT_READY', 'PROVISIONAL', 'STEP4_READY']);
export const GAP_FIELDS = Object.freeze(['owner', 'memberFacingSentence', 'closureCondition', 'registerLine']);

/**
 * The closed evidence-kind vocabulary. 'measured' evidence came from running something; 'synthetic' evidence is
 * fictional or fixture evidence and can never carry a receipt past PROVISIONAL; 'context' evidence (an exit code)
 * may accompany a result but never discharges an obligation, alone or in numbers.
 */
export const EVIDENCE_KINDS = Object.freeze({
  assertion: 'measured',
  'static-analysis': 'measured',
  'probe-observation': 'measured',
  'database-observation': 'measured',
  'kms-call-record': 'measured',
  'log-scan': 'measured',
  'witness-record': 'measured',
  'synthetic-check': 'synthetic',
  'exit-code': 'context',
});
export const PROVISIONAL_REASONS = Object.freeze(['HEADER_KIND_NOT_MEASURED', 'NOT_RULED', 'SYNTHETIC_EVIDENCE', 'UNMET_DEPENDENCY']);
export const TABLE_BLOCKER_CODES = Object.freeze(['GAP_RECORD_INCOMPLETE_AT_RULING', 'NO_PASSING_BLOCKER']);
const TABLE_BLOCKER_CODE = TABLE_BLOCKER_CODES[0];
const NO_PASSING_BLOCKER_CODE = TABLE_BLOCKER_CODES[1];
const TABLE_BLOCKER_ID = '<table>';
export const MEASURED_HEADER_KIND = 'measured';

export const PROBLEM_CODES = Object.freeze([
  'CONTEXT_INVALID',
  'RECEIPT_SHAPE',
  'SCHEMA_MISMATCH',
  'UNKNOWN_FIELD',
  'LEGACY_EXIT_CODE_FIELD',
  'HEADER_INVALID',
  'RULED_MISMATCH',
  'EXPECTED_ENTRIES_MISMATCH',
  'MISSING_ENTRY',
  'DUPLICATE_ENTRY',
  'UNKNOWN_ENTRY',
  'ENTRY_SHAPE',
  'CATEGORY_MISMATCH',
  'DISPOSITION_MISMATCH',
  'REQUIRES_REAL_KMS_MISMATCH',
  'REQUIRES_REAL_VAULT_MISMATCH',
  'REQUIRES_BROWSER_MISMATCH',
  'GAP_FLAGS_MISMATCH',
  'DEPENDENCIES_MISMATCH',
  'ENTRY_VERDICT_MISMATCH',
  'BLOCKING_FLAG_MISMATCH',
  'TABLE_BLOCKERS_MISMATCH',
  'TABLE_DIGEST_MISMATCH',
  'RULING_MISMATCH',
  'PROVISIONAL_REASONS_MISMATCH',
  'COUNTS_MISMATCH',
  'OVERALL_VERDICT_MISMATCH',
  'CONTENT_LEAK',
  'VALIDATOR_EXCEPTION',
]);

export class ReceiptInputError extends Error {
  constructor(code, message) {
    super(`${code}: ${message}`);
    this.name = 'ReceiptInputError';
    this.code = code;
  }
}

export class ReceiptContentLeak extends Error {
  constructor(findings) {
    const shown = findings.map((f) => `${f.path}:${f.rule}x${f.count}`).join('; ');
    super(`CONTENT_LEAK: the receipt was refused by the content scrub (${findings.length} finding(s), content withheld): ${shown}`);
    this.name = 'ReceiptContentLeak';
    this.findings = findings;
  }
}

/* ------------------------------------------------------------------------- *
 * Small helpers
 * ------------------------------------------------------------------------- */

const isObj = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
const hasOwn = (o, k) => Object.prototype.hasOwnProperty.call(o, k);
const clone = (v) => JSON.parse(JSON.stringify(v));
const normText = (s) => s.toLowerCase().replace(/\s+/g, ' ');
// An id is echoed in a message only if it has the shape of an obligation id; anything else could be content.
const SAFE_ID = /^[A-Za-z]{1,8}-\d{1,3}[a-z]?$/;
const safeId = (id) => (typeof id === 'string' && SAFE_ID.test(id) ? id : '<non-conforming id>');
const pick = (v, allowed) => (typeof v === 'string' && allowed.includes(v) ? v : '<invalid>');

/* ------------------------------------------------------------------------- *
 * Placeholder text, gap fields and evidence items.
 * What counts as "present" is decided here once; builder and validator both use it.
 * ------------------------------------------------------------------------- */

const PLACEHOLDER_ANYWHERE =
  /\b(?:tbd|tba|todo|fixme|xxx|placeholder|lorem ipsum)\b|\bto be (?:determined|decided|defined|confirmed|filled(?: in)?|written|announced)\b|\?{3,}|<[A-Za-z][A-Za-z_-]{0,30}>|\{\{[^{}]{0,40}\}\}/i;
// Words that say nothing measurable. A text made only of these (and no digit) is a placeholder, not a statement.
const GENERIC_WORDS = new Set([
  'a', 'all', 'and', 'checked', 'confirmed', 'done', 'fine', 'good', 'green', 'is', 'it', 'n', 'na', 'nil', 'no', 'none', 'null',
  'ok', 'okay', 'pass', 'passed', 'passes', 'pending', 'success', 'successful', 'test', 'tests', 'true', 'undefined', 'unknown',
  'unset', 'verified', 'works', 'worked', 'working', 'x', 'yes',
]);

function isPlaceholderText(text) {
  const t = text.trim();
  if (!/[A-Za-z0-9]/.test(t)) return true; // blank, or only punctuation
  if (PLACEHOLDER_ANYWHERE.test(t)) return true;
  // No digit, so there is a letter: the match below is not null.
  return !/\d/.test(t) && t.toLowerCase().match(/[a-z]+/g).every((w) => GENERIC_WORDS.has(w));
}

const GAP_MINIMUM = Object.freeze({
  owner: { chars: 3, words: 1 },
  memberFacingSentence: { chars: 20, words: 4 },
  closureCondition: { chars: 20, words: 4 },
  registerLine: { chars: 20, words: 4 },
});

/** A gap field is substantive when it is a statement: not blank, not placeholder text, and long enough for its role. */
function gapFieldOk(field, v) {
  if (typeof v !== 'string' || isPlaceholderText(v)) return false;
  const t = v.trim();
  const need = GAP_MINIMUM[field];
  return t.length >= need.chars && t.split(/\s+/).length >= need.words;
}

const EVIDENCE_SUMMARY_MIN_CHARS = 8;

function summaryOk(v) {
  return typeof v === 'string' && v.trim().length >= EVIDENCE_SUMMARY_MIN_CHARS && !isPlaceholderText(v);
}

const isIdChar = (c) => c !== undefined && c !== '' && /[A-Za-z0-9]/.test(c);

/** True when `id` occurs in `text` as a whole token (not inside a longer alphanumeric run). */
function containsIdToken(text, id) {
  if (typeof text !== 'string' || id.length === 0) return false; // ids are non-empty strings (readIndex); an empty one would never advance
  let from = 0;
  for (;;) {
    const at = text.indexOf(id, from);
    if (at < 0) return false;
    if (!isIdChar(text[at - 1]) && !isIdChar(text[at + id.length])) return true;
    from = at + 1;
  }
}

/** A ref binds an item to ONE obligation: it names this id and names no other indexed id. */
function refBindsOnly(ref, id, ids) {
  if (!containsIdToken(ref, id)) return false;
  for (const other of ids) if (other !== id && containsIdToken(ref, other)) return false;
  return true;
}

/** 'measured' | 'synthetic' when the item discharges obligation `id`; null when it does not. */
function evidenceClass(item, id, ids) {
  // A kind that is not a string could coerce to a vocabulary key; ref and summary are type-checked by the functions below.
  if (!isObj(item) || typeof item.kind !== 'string' || !hasOwn(EVIDENCE_KINDS, item.kind)) return null;
  const cls = EVIDENCE_KINDS[item.kind];
  if (cls !== 'measured' && cls !== 'synthetic') return null;
  if (!summaryOk(item.summary) || !refBindsOnly(item.ref, id, ids)) return null;
  return /^synthetic:/i.test(item.ref.trim()) ? 'synthetic' : cls;
}

/** The distinct discharging items of one entry and how many of them are measured / synthetic. */
function evidenceProfile(evidence, id, ids) {
  const seen = new Set();
  const refs = new Set();
  let measured = 0;
  let synthetic = 0;
  for (const item of Array.isArray(evidence) ? evidence : []) {
    const cls = evidenceClass(item, id, ids);
    if (cls === null) continue;
    const key = `${item.kind}\u0000${item.ref}\u0000${item.summary}`;
    if (seen.has(key)) continue;
    seen.add(key);
    refs.add(item.ref);
    if (cls === 'measured') measured++;
    else synthetic++;
  }
  return { count: measured + synthetic, measured, synthetic, refs: [...refs] };
}

const syntheticOnly = (profile) => profile.measured === 0 && profile.synthetic > 0;
const needsVault = (o) => o.requiresRealVault === true;
const needsBrowser = (o) => o.requiresBrowser === true;
const depsOf = (o) => (Array.isArray(o.dependsOn) ? o.dependsOn : []);
const headerKindOf = (h) => (isObj(h) && typeof h.kind === 'string' ? h.kind : null);

/* ------------------------------------------------------------------------- *
 * Content scrub. Content-free by construction: findings carry path, rule and count only.
 * Sensitive literals are assembled from pieces so this file never contains them whole.
 * ------------------------------------------------------------------------- */

const S_KEY_PREFIX = ['AK', 'IA'].join('');
const S_CRED_MARKER = ['aws', '_secret'].join('');
const RE_PEM = new RegExp(['BEGIN', ' [A-Z ]*', 'PRIVATE', ' KEY'].join(''), 'g');
const RE_UUID = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi;
const RE_HEX_RUN = /[0-9a-f]{32,}/gi;
const RE_B64_RUN = /[A-Za-z0-9+/]{40,}(={1,2}(?![A-Za-z0-9+/=]))?/g;
const RE_TEMP_KEY = new RegExp('(?<![A-Za-z0-9])' + 'AS' + 'IA' + '[0-9A-Z]{16}(?![A-Za-z0-9])', 'g');
// A name, then a manuscript extension, not followed by another word character: a bare ".pdf" is not a path.
const RE_MANUSCRIPT_PATH = /[^\s/\\]+\.(?:docx|pdf|epub|md|txt)(?![A-Za-z0-9_])/gi;

const B64_TRANSITION_MIN = 0.35;

/**
 * Distinctive fixed phrases and names of the fictional fixture manuscripts (fixtures.mjs). The per-fixture canary is
 * written into ONE paragraph only, so the title, the chapter headings and the other paragraphs carry no canary: quoting
 * them in an evidence summary would pass the canary rule. Matching is case-insensitive and whitespace-folded. The
 * self-test reads the live fixture builders and fails if any fixture text unit is not covered by a marker here.
 */
export const FIXTURE_TEXT_MARKERS = Object.freeze([
  'Ostrevane',
  'Tamsin Orrevale',
  'Corwin Ashgrove',
  'Brindlec',
  'Salt Cartographers',
  'Tide Ledger',
  'Lamp Without a Wick',
  'redrawn at dusk',
  'stopped listening',
  'jetty glowed',
  'unfinished sentence',
  'instruction was a joke',
  'Spring tide',
  'Neap tide',
  'North jetty',
  'South jetty',
  'Marrow Reach',
  'lantern keepers',
  'carries no further text',
]);
const FIXTURE_MARKERS_FOLDED = FIXTURE_TEXT_MARKERS.map(normText);

function countMatches(re, s) {
  return (s.match(re) || []).length;
}

function countOccurrences(haystack, needle) {
  if (!needle) return 0;
  let n = 0;
  let from = 0;
  for (;;) {
    const at = haystack.indexOf(needle, from);
    if (at < 0) return n;
    n++;
    from = at + needle.length;
  }
}

function countFixtureText(s) {
  const t = normText(s);
  let n = 0;
  for (const m of FIXTURE_MARKERS_FOLDED) n += countOccurrences(t, m);
  return n;
}

function charClass(c) {
  if (c >= 'a' && c <= 'z') return 0;
  if (c >= 'A' && c <= 'Z') return 1;
  if (c >= '0' && c <= '9') return 2;
  return 3;
}

/** Fraction of adjacent character pairs that change class (lower/upper/digit/symbol). */
function transitionRate(s) {
  let changes = 0; // callers pass 40+ characters
  for (let i = 1; i < s.length; i++) if (charClass(s[i]) !== charClass(s[i - 1])) changes++;
  return changes / (s.length - 1);
}

/**
 * A base64-alphabet run of 40+ characters is a blob when it is padded, or is a single token with no
 * '/' in it, or is slash-bearing but varies in character class like random data does. The slash-
 * bearing case exists because the literal rule fires on honest repository paths (measured on this
 * repository: 8.7% of tracked paths contain such a run), whereas random base64 of the same length
 * changes class on roughly two adjacent pairs in three and paths on far fewer.
 */
function countBase64Blobs(s) {
  let n = 0;
  for (const m of s.matchAll(RE_B64_RUN)) {
    const padded = m[1] !== undefined; // '=' / '==' closing the token (a 'key=value' separator is not padding)
    const data = m[0].replace(/=+$/, '');
    if (padded) n++;
    else if (!data.includes('/')) n++;
    else if (transitionRate(data) >= B64_TRANSITION_MIN) n++;
  }
  return n;
}

const RULES = Object.freeze([
  { rule: 'canary', count: (s, c) => countOccurrences(s.toLowerCase(), c.canaryLower) },
  { rule: 'uuid', count: (s) => countMatches(RE_UUID, s) },
  { rule: 'hex_run_32', count: (s) => countMatches(RE_HEX_RUN, s) },
  { rule: 'base64_run_40', count: (s) => countBase64Blobs(s) },
  { rule: 'aws_access_key_prefix', count: (s) => countOccurrences(s, S_KEY_PREFIX) + countMatches(RE_TEMP_KEY, s) },
  { rule: 'credential_marker', count: (s) => countOccurrences(s.toLowerCase(), S_CRED_MARKER) },
  { rule: 'private_key_marker', count: (s) => countMatches(RE_PEM, s) },
  { rule: 'manuscript_path', count: (s) => countMatches(RE_MANUSCRIPT_PATH, s) },
  { rule: 'fixture_text', count: (s) => countFixtureText(s) },
]);

function scanString(s, ctx, rules = RULES) {
  const hits = [];
  for (const r of rules) {
    const count = r.count(s, ctx);
    if (count > 0) hits.push({ rule: r.rule, count });
  }
  return hits;
}

const SAFE_KEY = /^[A-Za-z][A-Za-z0-9_]{0,40}$/;
const WALK_DEPTH_LIMIT = 40;

/**
 * Scan every string (keys included) of a JSON-shaped value. Anything that is not JSON data is
 * reported as 'unscannable_value' rather than skipped: a value that cannot be scanned cannot be
 * called clean.
 */
export function scrub(receipt, { canaryPrefix = DEFAULT_CANARY_PREFIX } = {}) {
  if (typeof canaryPrefix !== 'string' || canaryPrefix.length < 4) {
    throw new TypeError('scrub: canaryPrefix must be a string of at least 4 characters');
  }
  const ctx = { canaryLower: canaryPrefix.toLowerCase() };
  const findings = [];
  let scanned = 0;
  const join = (p, k) => (p ? `${p}.${k}` : k);

  const scanOne = (p, s) => {
    scanned++;
    const hits = scanString(s, ctx);
    for (const h of hits) findings.push({ path: p || '<root>', rule: h.rule, count: h.count });
    return hits.length > 0;
  };

  const walk = (value, p, depth) => {
    if (depth > WALK_DEPTH_LIMIT) {
      findings.push({ path: p || '<root>', rule: 'unscannable_value', count: 1 });
      return;
    }
    const t = typeof value;
    if (value === null || t === 'boolean') return;
    if (t === 'number') {
      if (!Number.isFinite(value)) findings.push({ path: p || '<root>', rule: 'unscannable_value', count: 1 });
      return;
    }
    if (t === 'string') {
      scanOne(p, value);
      return;
    }
    if (Array.isArray(value)) {
      value.forEach((v, i) => walk(v, `${p}[${i}]`, depth + 1));
      return;
    }
    if (t === 'object') {
      const proto = Object.getPrototypeOf(value);
      if (proto !== Object.prototype && proto !== null) {
        findings.push({ path: p || '<root>', rule: 'unscannable_value', count: 1 });
        return;
      }
      let n = 0;
      for (const k of Object.keys(value)) {
        const keyLeaks = scanOne(join(p, `<key#${n}>`), k);
        const childPath = !keyLeaks && SAFE_KEY.test(k) ? join(p, k) : join(p, `<key#${n}>`);
        walk(value[k], childPath, depth + 1);
        n++;
      }
      return;
    }
    findings.push({ path: p || '<root>', rule: 'unscannable_value', count: 1 }); // undefined, function, symbol, bigint
  };

  walk(receipt, '', 0);
  return { ok: findings.length === 0, scanned, findings };
}

function labelFindings(receipt, findings) {
  const entries = Array.isArray(receipt?.entries) ? receipt.entries : [];
  return findings.map((f) => ({
    ...f,
    path: f.path.replace(/^entries\[(\d+)\]/, (m, i) => {
      const e = entries[Number(i)];
      return e && typeof e.id === 'string' && SAFE_ID.test(e.id) ? `entries[${e.id}]` : m;
    }),
  }));
}

/* ------------------------------------------------------------------------- *
 * Reading the reference data (index + dispositions) -- shared by builder and validator.
 * These are input checks on the reference data; the verdict logic is NOT shared.
 * ------------------------------------------------------------------------- */

function readIndex(index) {
  if (!isObj(index) || !Array.isArray(index.obligations)) {
    throw new ReceiptInputError('BAD_INDEX', 'index must be an object with an obligations array');
  }
  const byId = new Map();
  for (const o of index.obligations) {
    if (!isObj(o) || typeof o.id !== 'string' || o.id.length === 0) {
      throw new ReceiptInputError('BAD_INDEX', 'an index obligation has no string id');
    }
    if (byId.has(o.id)) throw new ReceiptInputError('BAD_INDEX', `duplicate obligation id ${safeId(o.id)} in the index`);
    if (typeof o.requiresRealKms !== 'boolean') {
      throw new ReceiptInputError('BAD_INDEX', `obligation ${safeId(o.id)} has no boolean requiresRealKms`);
    }
    for (const k of ['requiresRealVault', 'requiresBrowser']) {
      if (hasOwn(o, k) && typeof o[k] !== 'boolean') throw new ReceiptInputError('BAD_INDEX', `obligation ${safeId(o.id)} has a non-boolean ${k}`);
    }
    if (typeof o.category !== 'string') {
      throw new ReceiptInputError('BAD_INDEX', `obligation ${safeId(o.id)} has no string category`);
    }
    byId.set(o.id, o);
  }
  if (byId.size === 0) throw new ReceiptInputError('BAD_INDEX', 'the index lists no obligations (an empty index would pass vacuously)');
  if (hasOwn(index, 'count') && index.count !== index.obligations.length) {
    throw new ReceiptInputError('BAD_INDEX', 'index.count disagrees with the length of index.obligations');
  }
  for (const o of byId.values()) {
    if (!hasOwn(o, 'dependsOn')) continue;
    const deps = o.dependsOn;
    if (!Array.isArray(deps) || deps.some((x) => typeof x !== 'string' || x === o.id || !byId.has(x)) || new Set(deps).size !== deps.length) {
      throw new ReceiptInputError('BAD_INDEX', `obligation ${safeId(o.id)} has a dependsOn that is not a list of distinct other indexed ids`);
    }
  }
  return byId;
}

function gapFlagsOf(gap) {
  const g = isObj(gap) ? gap : {};
  const base = Object.fromEntries(GAP_FIELDS.map((f) => [f, gapFieldOk(f, g[f])]));
  // A record that says the same thing in two fields has said it once: neither copy counts.
  const same = (a, b) => normText(g[a].trim()) === normText(g[b].trim());
  return Object.fromEntries(GAP_FIELDS.map((f) => [f, base[f] && !GAP_FIELDS.some((o) => o !== f && base[o] && same(f, o))]));
}

/** Canonical JSON: object keys sorted, arrays in order, only JSON data. Anything else throws a TypeError. */
function canonJson(v, depth = 0) {
  if (depth > 40) throw new TypeError('too deep');
  if (v === null || typeof v === 'boolean' || typeof v === 'string') return JSON.stringify(v);
  if (typeof v === 'number') {
    if (!Number.isFinite(v)) throw new TypeError('non-finite number');
    return JSON.stringify(v);
  }
  // As in JSON: an undefined element reads as null, and an undefined property is absent.
  if (Array.isArray(v)) return `[${v.map((x) => (x === undefined ? 'null' : canonJson(x, depth + 1))).join(',')}]`;
  if (isObj(v) && (Object.getPrototypeOf(v) === Object.prototype || Object.getPrototypeOf(v) === null)) {
    return `{${Object.keys(v).filter((k) => v[k] !== undefined).sort().map((k) => `${JSON.stringify(k)}:${canonJson(v[k], depth + 1)}`).join(',')}}`;
  }
  throw new TypeError('not plain JSON data');
}

function digestOf(v) {
  const hex = crypto.createHash('sha256').update(canonJson(v), 'utf8').digest('hex');
  return `sha256:${hex.match(/.{8}/g).join('-')}`;
}

/**
 * The digests that bind a receipt to its tables. `ruled`, `basis` and `ruling` are not hashed (the ruling cannot hold
 * its own digest); everything the verdicts are derived from is.
 */
export function computeTableDigest(index, dispositions) {
  try {
    return { index: digestOf(index), dispositions: digestOf(isObj(dispositions) ? dispositions.dispositions : undefined) };
  } catch {
    throw new ReceiptInputError('BAD_DISPOSITIONS', 'the index or the disposition table is not plain JSON data, so it cannot be digested');
  }
}

const SAFE_REF = /^[A-Za-z0-9][A-Za-z0-9._:-]{2,63}$/;

/**
 * What a founder ruling act writes into the disposition table: ruled=true, a ruling reference (an identifier, not a hash)
 * and a seal over exactly these tables. Editing either table afterwards un-seals the ruling.
 */
export function sealRuling(dispositions, index, ref) {
  if (typeof ref !== 'string' || !SAFE_REF.test(ref)) {
    throw new ReceiptInputError('BAD_RULING', 'a ruling reference must be an identifier of 3 to 64 characters (letters, digits, . _ : -)');
  }
  dispositions.ruled = true;
  dispositions.ruling = { ref, tableDigest: computeTableDigest(index, dispositions) };
  return dispositions;
}

function readDispositions(dispositions, byId, index) {
  if (!isObj(dispositions) || typeof dispositions.ruled !== 'boolean' || !isObj(dispositions.dispositions)) {
    throw new ReceiptInputError('BAD_DISPOSITIONS', 'dispositions must be { ruled:boolean, dispositions:{ id: {...} } }');
  }
  const map = new Map();
  for (const id of byId.keys()) {
    const d = hasOwn(dispositions.dispositions, id) ? dispositions.dispositions[id] : undefined;
    if (!isObj(d) || !DISPOSITIONS.includes(d.disposition)) {
      throw new ReceiptInputError('BAD_DISPOSITIONS', `obligation ${safeId(id)} has no predeclared BLOCKER/DECLARED_GAP disposition`);
    }
    if (d.disposition === 'DECLARED_GAP' && d.gap !== null && d.gap !== undefined && !isObj(d.gap)) {
      throw new ReceiptInputError('BAD_DISPOSITIONS', `obligation ${safeId(id)} has a gap that is neither null nor an object`);
    }
    const flags = d.disposition === 'DECLARED_GAP' ? gapFlagsOf(d.gap) : null;
    map.set(id, { disposition: d.disposition, gapFlags: flags, gapComplete: flags !== null && GAP_FIELDS.every((f) => flags[f]) });
  }
  for (const k of Object.keys(dispositions.dispositions)) {
    if (!byId.has(k)) throw new ReceiptInputError('BAD_DISPOSITIONS', 'the disposition table names an id that is not in the index');
  }
  const digest = computeTableDigest(index, dispositions);
  let rulingRef = null;
  if (dispositions.ruled === true) {
    const ruling = dispositions.ruling;
    if (!isObj(ruling) || typeof ruling.ref !== 'string' || !SAFE_REF.test(ruling.ref)) {
      throw new ReceiptInputError('BAD_DISPOSITIONS', 'ruled is true but there is no ruling reference (a ruling must name the act that made it)');
    }
    const seal = ruling.tableDigest;
    if (!isObj(seal) || seal.index !== digest.index || seal.dispositions !== digest.dispositions) {
      throw new ReceiptInputError('BAD_DISPOSITIONS', 'ruled is true but the ruling seal does not match the tables as they are now (they were edited after the ruling, or the seal is forged)');
    }
    rulingRef = ruling.ref;
  }
  return { map, digest, rulingRef };
}

function checkPinShape(pin) {
  return isObj(pin) && Object.keys(pin).sort().join(',') === 'dispositions,index' && typeof pin.index === 'string' && typeof pin.dispositions === 'string';
}

const NOT_RUN_RESULT = () => ({ status: 'NOT_RUN', environment: null, realKms: null, realVault: null, browser: null, evidence: [] });

function readResults(results, byId) {
  if (!Array.isArray(results)) throw new ReceiptInputError('BAD_RESULTS', 'results must be an array');
  const RESULT_KEYS = ['id', 'status', 'environment', 'realKms', 'realVault', 'browser', 'evidence'];
  const map = new Map();
  results.forEach((r, i) => {
    if (!isObj(r)) throw new ReceiptInputError('BAD_RESULTS', `results[${i}] is not an object`);
    for (const k of Object.keys(r)) {
      if (!RESULT_KEYS.includes(k)) throw new ReceiptInputError('BAD_RESULTS', `results[${i}] has a field outside the result contract`);
    }
    if (typeof r.id !== 'string' || !byId.has(r.id)) {
      throw new ReceiptInputError('UNKNOWN_ID', `results[${i}] names an obligation that is not in the index (${safeId(r.id)})`);
    }
    if (map.has(r.id)) throw new ReceiptInputError('DUPLICATE_ID', `results[${i}] repeats obligation ${r.id}`);
    if (!STATUSES.includes(r.status)) throw new ReceiptInputError('BAD_STATUS', `results[${i}] (${r.id}) has a status outside PASS/FAIL/NOT_RUN`);
    const ran = r.status !== 'NOT_RUN';
    if (r.environment !== undefined && r.environment !== null && !ENVIRONMENTS.includes(r.environment)) {
      throw new ReceiptInputError('BAD_ENVIRONMENT', `results[${i}] (${r.id}) has an environment outside E0/E1/E2`);
    }
    if (ran && !ENVIRONMENTS.includes(r.environment)) {
      throw new ReceiptInputError('BAD_ENVIRONMENT', `results[${i}] (${r.id}) ran but declares no environment`);
    }
    if (r.realKms !== undefined && r.realKms !== null && typeof r.realKms !== 'boolean') {
      throw new ReceiptInputError('BAD_REAL_KMS', `results[${i}] (${r.id}) has a non-boolean realKms`);
    }
    if (ran && typeof r.realKms !== 'boolean') {
      throw new ReceiptInputError('BAD_REAL_KMS', `results[${i}] (${r.id}) ran but does not declare realKms true/false`);
    }
    for (const [k, code] of [['realVault', 'BAD_REAL_VAULT'], ['browser', 'BAD_BROWSER']]) {
      if (r[k] !== undefined && r[k] !== null && typeof r[k] !== 'boolean') {
        throw new ReceiptInputError(code, `results[${i}] (${r.id}) has a non-boolean ${k}`);
      }
    }
    const evidence = r.evidence === undefined ? [] : r.evidence;
    if (!Array.isArray(evidence)) throw new ReceiptInputError('BAD_EVIDENCE', `results[${i}] (${r.id}) evidence is not an array`);
    evidence.forEach((e, j) => {
      if (!isObj(e) || Object.keys(e).sort().join(',') !== 'kind,ref,summary' || !['kind', 'ref', 'summary'].every((k) => typeof e[k] === 'string')) {
        throw new ReceiptInputError('BAD_EVIDENCE', `results[${i}] (${r.id}) evidence[${j}] must be exactly { kind, ref, summary } of strings`);
      }
    });
    // A result that was not produced carries nothing: its environment, declarations and evidence are dropped here, so a
    // NOT_RUN entry can never be tallied as if it had run.
    map.set(
      r.id,
      ran
        ? {
            status: r.status,
            environment: r.environment,
            realKms: r.realKms,
            realVault: r.realVault === undefined ? null : r.realVault,
            browser: r.browser === undefined ? null : r.browser,
            evidence: evidence.map((e) => ({ kind: e.kind, ref: e.ref, summary: e.summary })),
          }
        : NOT_RUN_RESULT(),
    );
  });
  return map;
}

function readHeader(header) {
  if (header === undefined) return {};
  if (!isObj(header)) throw new ReceiptInputError('BAD_HEADER', 'header must be a plain object');
  const check = (v, depth) => {
    if (depth > 10) throw new ReceiptInputError('BAD_HEADER', 'header nests too deeply');
    if (v === null || typeof v === 'string' || typeof v === 'boolean') return;
    if (typeof v === 'number' && Number.isFinite(v)) return;
    if (Array.isArray(v)) return v.forEach((x) => check(x, depth + 1));
    if (isObj(v) && (Object.getPrototypeOf(v) === Object.prototype || Object.getPrototypeOf(v) === null)) {
      return Object.values(v).forEach((x) => check(x, depth + 1));
    }
    throw new ReceiptInputError('BAD_HEADER', 'header holds a value that is not plain JSON data');
  };
  check(header, 0);
  return clone(header);
}

/* ------------------------------------------------------------------------- *
 * BUILDER derivation (procedural). The validator below re-derives with a separate table.
 * ------------------------------------------------------------------------- */

export function deriveEntryVerdict({
  disposition,
  status,
  evidenceCount,
  requiresRealKms,
  realKms,
  gapComplete,
  requiresRealVault = false,
  realVault = null,
  requiresBrowser = false,
  browser = null,
}) {
  if (status === 'PASS') {
    const evidenced = evidenceCount >= 1;
    const kmsOk = !requiresRealKms || realKms === true;
    const vaultOk = !requiresRealVault || realVault === true;
    const browserOk = !requiresBrowser || browser === true;
    return evidenced && kmsOk && vaultOk && browserOk ? 'PASS' : 'INVALID_EVIDENCE';
  }
  if (status === 'FAIL') {
    if (disposition === 'BLOCKER') return 'BLOCKING_FAIL';
    return gapComplete ? 'ACCEPTED_GAP' : 'GAP_UNDECLARED';
  }
  return disposition === 'BLOCKER' ? 'BLOCKING_NOT_RUN' : 'NOT_RUN';
}

function computeCounts(entries, tableBlockers, ids) {
  const byVerdict = Object.fromEntries(ENTRY_VERDICTS.map((v) => [v, 0]));
  const byDisposition = Object.fromEntries(DISPOSITIONS.map((d) => [d, 0]));
  const byEnvironment = { E0: 0, E1: 0, E2: 0, none: 0 };
  let blocking = 0;
  let unmet = 0;
  let qualifying = 0;
  let measured = 0;
  let synthetic = 0;
  let syntheticOnlyPasses = 0;
  const refs = new Set();
  for (const e of entries) {
    byVerdict[e.verdict] += 1;
    byDisposition[e.disposition] += 1;
    byEnvironment[e.environment === null ? 'none' : e.environment] += 1;
    if (e.blocking) blocking += 1;
    if (Array.isArray(e.unmetDependencies) && e.unmetDependencies.length > 0) unmet += 1;
    const prof = evidenceProfile(e.evidence, e.id, ids);
    qualifying += prof.count;
    measured += prof.measured;
    synthetic += prof.synthetic;
    prof.refs.forEach((r) => refs.add(r));
    if (e.verdict === 'PASS' && syntheticOnly(prof)) syntheticOnlyPasses += 1;
  }
  return {
    entries: entries.length,
    byVerdict,
    byDisposition,
    byEnvironment,
    blocking,
    acceptedGaps: byVerdict.ACCEPTED_GAP,
    tableBlockers: tableBlockers.length,
    unmetDependencies: unmet,
    evidence: { qualifying, measured, synthetic, distinctRefs: refs.size, syntheticOnlyPasses },
  };
}

function deriveTableBlockers(entries, ruled) {
  if (!ruled) return [];
  const out = entries
    .filter((e) => e.disposition === 'DECLARED_GAP' && e.status === 'NOT_RUN' && !(e.gap && GAP_FIELDS.every((f) => e.gap[f] === true)))
    .map((e) => ({ id: e.id, code: TABLE_BLOCKER_CODE }));
  if (!entries.some((e) => e.disposition === 'BLOCKER' && e.verdict === 'PASS')) out.push({ id: TABLE_BLOCKER_ID, code: NO_PASSING_BLOCKER_CODE });
  return out;
}

function deriveProvisionalReasons({ ruled, headerKind, entries, ids }) {
  const reasons = [];
  if (ruled !== true) reasons.push('NOT_RULED');
  if (headerKind !== MEASURED_HEADER_KIND) reasons.push('HEADER_KIND_NOT_MEASURED');
  if (entries.some((e) => e.verdict === 'PASS' && syntheticOnly(evidenceProfile(e.evidence, e.id, ids)))) reasons.push('SYNTHETIC_EVIDENCE');
  if (entries.some((e) => Array.isArray(e.unmetDependencies) && e.unmetDependencies.length > 0)) reasons.push('UNMET_DEPENDENCY');
  return reasons.sort();
}

function deriveOverall(entries, tableBlockers, reasons) {
  if (tableBlockers.length > 0 || entries.some((e) => e.blocking)) return 'NOT_READY';
  return reasons.length > 0 ? 'PROVISIONAL' : 'STEP4_READY';
}

/* ------------------------------------------------------------------------- *
 * buildReceipt
 * ------------------------------------------------------------------------- */

export function buildReceipt({ index, dispositions, results, header, canaryPrefix, pin } = {}) {
  const byId = readIndex(index);
  const dres = readDispositions(dispositions, byId, index);
  if (pin !== undefined) {
    if (!checkPinShape(pin)) throw new ReceiptInputError('BAD_PIN', 'pin must be exactly { index, dispositions } of digest strings');
    if (pin.index !== dres.digest.index || pin.dispositions !== dres.digest.dispositions) {
      throw new ReceiptInputError('TABLE_PIN_MISMATCH', 'the tables are not the tables the pin was taken from');
    }
  }
  const rmap = readResults(results, byId);
  const hdr = readHeader(header);
  const ids = [...byId.keys()];

  const entries = [];
  for (const [id, ob] of byId) {
    const d = dres.map.get(id);
    const r = rmap.get(id) || NOT_RUN_RESULT();
    const verdict = deriveEntryVerdict({
      disposition: d.disposition,
      status: r.status,
      evidenceCount: evidenceProfile(r.evidence, id, ids).count,
      requiresRealKms: ob.requiresRealKms,
      realKms: r.realKms,
      gapComplete: d.gapComplete,
      requiresRealVault: needsVault(ob),
      realVault: r.realVault,
      requiresBrowser: needsBrowser(ob),
      browser: r.browser,
    });
    entries.push({
      id,
      category: ob.category,
      disposition: d.disposition,
      requiresRealKms: ob.requiresRealKms,
      requiresRealVault: needsVault(ob),
      requiresBrowser: needsBrowser(ob),
      gap: d.gapFlags ? { ...d.gapFlags } : null,
      status: r.status,
      environment: r.environment,
      realKms: r.realKms,
      realVault: r.realVault,
      browser: r.browser,
      evidence: r.evidence,
      unmetDependencies: [],
      verdict,
      blocking: BLOCKING_VERDICTS.includes(verdict),
    });
  }
  // A PASS that stands on a prerequisite which did not PASS says so (second pass: needs every verdict).
  const verdictById = new Map(entries.map((e) => [e.id, e.verdict]));
  for (const e of entries) {
    if (e.verdict === 'PASS') e.unmetDependencies = depsOf(byId.get(e.id)).filter((dep) => verdictById.get(dep) !== 'PASS').sort();
  }

  const ruled = dispositions.ruled;
  const tableBlockers = deriveTableBlockers(entries, ruled);
  const reasons = deriveProvisionalReasons({ ruled, headerKind: headerKindOf(hdr), entries, ids });
  const receipt = {
    schema: SCHEMA,
    header: hdr,
    ruled,
    ruling: dres.rulingRef === null ? null : { ref: dres.rulingRef },
    tableDigest: { ...dres.digest },
    expectedEntries: byId.size,
    entries,
    tableBlockers,
    provisionalReasons: reasons,
    counts: computeCounts(entries, tableBlockers, ids),
    verdict: deriveOverall(entries, tableBlockers, reasons),
  };

  const s = scrub(receipt, { canaryPrefix });
  if (!s.ok) throw new ReceiptContentLeak(labelFindings(receipt, s.findings));

  const v = validateReceipt(receipt, { index, dispositions, canaryPrefix, pin });
  if (!v.ok) throw new ReceiptInputError('INTERNAL_INCONSISTENCY', `the builder produced a receipt its own validator refuses: ${v.problems.join(' | ')}`);
  return receipt;
}

/* ------------------------------------------------------------------------- *
 * validateReceipt -- INDEPENDENT. It shares only the reference-data readers above; the entry
 * verdict table, the tally, the table-blocker rule and the overall rule are written again here.
 * ------------------------------------------------------------------------- */

const VALIDATOR_RULES = Object.freeze({
  'BLOCKER/PASS': (x) => (x.evidenceOk && x.kmsOk && x.vaultOk && x.browserOk ? 'PASS' : 'INVALID_EVIDENCE'),
  'BLOCKER/FAIL': () => 'BLOCKING_FAIL',
  'BLOCKER/NOT_RUN': () => 'BLOCKING_NOT_RUN',
  'DECLARED_GAP/PASS': (x) => (x.evidenceOk && x.kmsOk && x.vaultOk && x.browserOk ? 'PASS' : 'INVALID_EVIDENCE'),
  'DECLARED_GAP/FAIL': (x) => (x.gapComplete ? 'ACCEPTED_GAP' : 'GAP_UNDECLARED'),
  'DECLARED_GAP/NOT_RUN': () => 'NOT_RUN',
});

export function rederiveEntryVerdict({
  disposition,
  status,
  evidenceCount,
  requiresRealKms,
  realKms,
  gapComplete,
  requiresRealVault = false,
  realVault = null,
  requiresBrowser = false,
  browser = null,
}) {
  const rule = VALIDATOR_RULES[`${disposition}/${status}`];
  if (!rule) return null;
  return rule({
    evidenceOk: Number.isInteger(evidenceCount) && evidenceCount > 0,
    kmsOk: requiresRealKms === false || realKms === true,
    vaultOk: requiresRealVault !== true || realVault === true,
    browserOk: requiresBrowser !== true || browser === true,
    gapComplete: gapComplete === true,
  });
}

const LEGACY_KEY = /^(exitCode|exit_code|testsExpected|tests_expected|testsRun|testsPassed|coverage|productionDataTouched|totalExpected|expectedTotal|totalTests)$/;
const ENTRY_KEYS = [
  'id',
  'category',
  'disposition',
  'requiresRealKms',
  'requiresRealVault',
  'requiresBrowser',
  'gap',
  'status',
  'environment',
  'realKms',
  'realVault',
  'browser',
  'evidence',
  'unmetDependencies',
  'verdict',
  'blocking',
];
const TOP_KEYS = ['schema', 'header', 'ruled', 'ruling', 'tableDigest', 'expectedEntries', 'entries', 'tableBlockers', 'provisionalReasons', 'counts', 'verdict'];
const COUNT_KEYS = ['entries', 'byVerdict', 'byDisposition', 'byEnvironment', 'blocking', 'acceptedGaps', 'tableBlockers', 'unmetDependencies', 'evidence'];

function flattenNumbers(o, prefix, out) {
  for (const [k, v] of Object.entries(o)) {
    const p = prefix ? `${prefix}.${k}` : k;
    if (isObj(v)) flattenNumbers(v, p, out);
    else out.set(p, v);
  }
  return out;
}

export function validateReceipt(receipt, { index, dispositions, canaryPrefix, pin } = {}) {
  const problems = [];
  const codes = new Set();
  const add = (code, detail) => {
    if (!PROBLEM_CODES.includes(code)) throw new Error(`validator used an unregistered problem code ${code}`);
    codes.add(code);
    problems.push(detail ? `${code}: ${detail}` : code);
  };

  try {
    let byId;
    let dres;
    try {
      byId = readIndex(index);
      dres = readDispositions(dispositions, byId, index);
    } catch (e) {
      add('CONTEXT_INVALID', e instanceof ReceiptInputError ? e.message : 'the reference data could not be read');
      return { ok: false, problems, codes: [...codes].sort() };
    }
    const dmap = dres.map;
    const ruledCtx = dispositions.ruled;
    const ids = [...byId.keys()];

    if (pin !== undefined) {
      if (!checkPinShape(pin)) {
        add('CONTEXT_INVALID', 'the pin is not exactly { index, dispositions } of digest strings');
        return { ok: false, problems, codes: [...codes].sort() };
      }
      if (pin.index !== dres.digest.index || pin.dispositions !== dres.digest.dispositions) {
        add('TABLE_DIGEST_MISMATCH', 'the tables this receipt is validated against are not the tables the pin was taken from');
      }
    }

    if (!isObj(receipt)) {
      add('RECEIPT_SHAPE', 'the receipt is not an object');
      return { ok: false, problems, codes: [...codes].sort() };
    }

    // ---- closed top level ----
    Object.keys(receipt).forEach((k, i) => {
      if (TOP_KEYS.includes(k)) return;
      if (LEGACY_KEY.test(k)) add('LEGACY_EXIT_CODE_FIELD', `top-level field ${k} is a legacy exit-code/hard-coded-total construction`);
      else add('UNKNOWN_FIELD', `top-level field #${i} is outside the receipt schema`);
    });
    if (receipt.schema !== SCHEMA) add('SCHEMA_MISMATCH', 'schema is missing or not the expected receipt schema');
    if (typeof receipt.ruled !== 'boolean') add('RECEIPT_SHAPE', 'ruled is not a boolean');
    else if (receipt.ruled !== ruledCtx) add('RULED_MISMATCH', `receipt says ruled=${receipt.ruled}, the disposition table says ruled=${ruledCtx}`);

    // ---- the ruling reference and the digests that bind the receipt to its tables ----
    const wantRuling = dres.rulingRef === null ? null : { ref: dres.rulingRef };
    if (JSON.stringify(receipt.ruling) !== JSON.stringify(wantRuling)) {
      add('RULING_MISMATCH', 'the recorded ruling reference differs from the ruling of the disposition table');
    }
    const td = receipt.tableDigest;
    if (!isObj(td) || Object.keys(td).sort().join(',') !== 'dispositions,index' || td.index !== dres.digest.index || td.dispositions !== dres.digest.dispositions) {
      add('TABLE_DIGEST_MISMATCH', 'tableDigest differs from the digest of the tables this receipt is validated against');
    }

    // ---- header: plain JSON, no legacy constants smuggled in ----
    try {
      readHeader(receipt.header);
      if (receipt.header === undefined) add('HEADER_INVALID', 'header is missing');
      // readHeader above has already refused anything nested deeper than ten levels, so this walk is bounded.
      const scanKeys = (v) => {
        if (!isObj(v)) return;
        for (const k of Object.keys(v)) {
          if (LEGACY_KEY.test(k)) add('LEGACY_EXIT_CODE_FIELD', `header field ${k} is a legacy exit-code/hard-coded-total construction`);
          scanKeys(v[k]);
        }
      };
      scanKeys(receipt.header);
    } catch {
      add('HEADER_INVALID', 'header is missing or is not plain JSON data');
    }

    // ---- expected entry count: recomputed from the index, never trusted ----
    if (receipt.expectedEntries !== byId.size) {
      add('EXPECTED_ENTRIES_MISMATCH', `expectedEntries is ${typeof receipt.expectedEntries === 'number' ? receipt.expectedEntries : '<non-number>'}, the index lists ${byId.size}`);
    }
    if (!Array.isArray(receipt.entries)) {
      add('RECEIPT_SHAPE', 'entries is not an array');
    } else if (receipt.entries.length !== byId.size) {
      add('EXPECTED_ENTRIES_MISMATCH', `entries holds ${receipt.entries.length}, the index lists ${byId.size}`);
    }

    // ---- entries: locate, then re-derive from raw fields + reference data ----
    const recorded = new Map();
    const entryList = Array.isArray(receipt.entries) ? receipt.entries : [];
    entryList.forEach((e, i) => {
      if (!isObj(e)) {
        add('ENTRY_SHAPE', `entries[${i}] is not an object`);
        return;
      }
      if (typeof e.id !== 'string' || !byId.has(e.id)) {
        add('UNKNOWN_ENTRY', `entries[${i}] names an obligation that is not in the index`);
        return;
      }
      if (recorded.has(e.id)) {
        add('DUPLICATE_ENTRY', `${e.id} appears more than once`);
        return;
      }
      recorded.set(e.id, e);
    });

    const derived = []; // one per index id: { id, verdict, blocking, environment, disposition, status, profile, recorded }
    for (const [id, ob] of byId) {
      const d = dmap.get(id);
      const e = recorded.get(id);
      if (!e) {
        add('MISSING_ENTRY', `${id} has no entry (it is treated as NOT_RUN below)`);
        const verdict = d.disposition === 'BLOCKER' ? 'BLOCKING_NOT_RUN' : 'NOT_RUN';
        derived.push({ id, verdict, blocking: BLOCKING_VERDICTS.includes(verdict), environment: null, disposition: d.disposition, status: 'NOT_RUN', profile: evidenceProfile([], id, ids), recorded: null, wantDeps: [] });
        continue;
      }

      Object.keys(e).forEach((k, i) => {
        if (!ENTRY_KEYS.includes(k)) add('UNKNOWN_FIELD', `${id} carries field #${i} outside the entry schema`);
      });

      // shape of the raw fields the derivation depends on
      let shapeOk = true;
      const bad = (what) => {
        shapeOk = false;
        add('ENTRY_SHAPE', `${id}: ${what}`);
      };
      const nullOrBool = (v) => v === null || typeof v === 'boolean';
      if (!STATUSES.includes(e.status)) bad('status is not PASS/FAIL/NOT_RUN');
      if (!(e.environment === null || ENVIRONMENTS.includes(e.environment))) bad('environment is not null/E0/E1/E2');
      if (!nullOrBool(e.realKms)) bad('realKms is not null/boolean');
      if (!nullOrBool(e.realVault)) bad('realVault is not null/boolean');
      if (!nullOrBool(e.browser)) bad('browser is not null/boolean');
      if (STATUSES.includes(e.status) && e.status !== 'NOT_RUN') {
        if (!ENVIRONMENTS.includes(e.environment)) bad('a run obligation declares no environment');
        if (typeof e.realKms !== 'boolean') bad('a run obligation does not declare realKms');
      }
      if (e.status === 'NOT_RUN' && (e.environment !== null || e.realKms !== null || e.realVault !== null || e.browser !== null || (Array.isArray(e.evidence) && e.evidence.length !== 0))) {
        bad('a NOT_RUN entry carries run fields (environment, declarations or evidence), so it would be counted as if it had run');
      }
      if (!Array.isArray(e.evidence)) bad('evidence is not an array');
      else if (!e.evidence.every((x) => isObj(x) && Object.keys(x).sort().join(',') === 'kind,ref,summary' && ['kind', 'ref', 'summary'].every((k) => typeof x[k] === 'string'))) {
        bad('an evidence item is not exactly { kind, ref, summary } of strings');
      }
      if (!(Array.isArray(e.unmetDependencies) && e.unmetDependencies.every((x) => typeof x === 'string'))) bad('unmetDependencies is not a list of ids');
      if (!ENTRY_VERDICTS.includes(e.verdict)) bad('verdict is not a known entry verdict');
      if (typeof e.blocking !== 'boolean') bad('blocking is not a boolean');
      if (!(e.gap === null || (isObj(e.gap) && Object.keys(e.gap).sort().join(',') === [...GAP_FIELDS].sort().join(',') && GAP_FIELDS.every((f) => typeof e.gap[f] === 'boolean')))) {
        bad('gap is neither null nor four boolean presence flags');
      }

      if (e.category !== ob.category) add('CATEGORY_MISMATCH', `${id}: category differs from the index`);
      if (e.disposition !== d.disposition) add('DISPOSITION_MISMATCH', `${id}: receipt says ${pick(e.disposition, DISPOSITIONS)}, the table says ${d.disposition}`);
      if (e.requiresRealKms !== ob.requiresRealKms) add('REQUIRES_REAL_KMS_MISMATCH', `${id}: receipt says ${String(e.requiresRealKms === true)}, the index says ${ob.requiresRealKms}`);
      if (e.requiresRealVault !== needsVault(ob)) add('REQUIRES_REAL_VAULT_MISMATCH', `${id}: receipt says ${String(e.requiresRealVault === true)}, the index says ${needsVault(ob)}`);
      if (e.requiresBrowser !== needsBrowser(ob)) add('REQUIRES_BROWSER_MISMATCH', `${id}: receipt says ${String(e.requiresBrowser === true)}, the index says ${needsBrowser(ob)}`);
      const wantGap = d.gapFlags;
      const gotGap = e.gap;
      const gapSame = wantGap === null ? gotGap === null : isObj(gotGap) && GAP_FIELDS.every((f) => gotGap[f] === wantGap[f]);
      if (!gapSame) add('GAP_FLAGS_MISMATCH', `${id}: gap presence flags differ from the disposition table`);

      // fail closed when the raw fields are unusable: treat as no valid result
      const usable = shapeOk;
      const status = usable ? e.status : 'NOT_RUN';
      const profile = evidenceProfile(usable ? e.evidence : [], id, ids);
      const verdict = rederiveEntryVerdict({
        disposition: d.disposition,
        status,
        evidenceCount: profile.count,
        requiresRealKms: ob.requiresRealKms,
        realKms: usable ? e.realKms : null,
        gapComplete: d.gapComplete,
        requiresRealVault: needsVault(ob),
        realVault: usable ? e.realVault : null,
        requiresBrowser: needsBrowser(ob),
        browser: usable ? e.browser : null,
      });
      const isBlocking = BLOCKING_VERDICTS.includes(verdict);
      if (usable) {
        if (e.verdict !== verdict) add('ENTRY_VERDICT_MISMATCH', `${id}: recorded ${pick(e.verdict, ENTRY_VERDICTS)}, re-derived ${verdict}`);
        if (e.blocking !== isBlocking) add('BLOCKING_FLAG_MISMATCH', `${id}: recorded blocking=${e.blocking}, re-derived ${isBlocking}`);
      }
      derived.push({
        id,
        verdict,
        blocking: isBlocking,
        environment: usable && ENVIRONMENTS.includes(e.environment) ? e.environment : null,
        disposition: d.disposition,
        status,
        profile,
        recorded: usable ? e : null,
        wantDeps: [],
      });
    }

    // ---- unmet prerequisites: a PASS standing on an obligation that did not PASS must say so ----
    const verdictById = new Map(derived.map((x) => [x.id, x.verdict]));
    for (const x of derived) {
      x.wantDeps = x.verdict === 'PASS' ? depsOf(byId.get(x.id)).filter((dep) => verdictById.get(dep) !== 'PASS').sort() : [];
      if (x.recorded && [...x.recorded.unmetDependencies].sort().join('|') !== x.wantDeps.join('|')) {
        add('DEPENDENCIES_MISMATCH', `${x.id}: recorded unmet dependencies differ from the ${x.wantDeps.length} re-derived`);
      }
    }

    // ---- table blockers: recomputed from the reference data ----
    const wantTBList = [];
    if (ruledCtx) {
      for (const x of derived) {
        if (x.disposition === 'DECLARED_GAP' && x.status === 'NOT_RUN' && !dmap.get(x.id).gapComplete) wantTBList.push(`${x.id}|${TABLE_BLOCKER_CODE}`);
      }
      if (!derived.some((x) => x.disposition === 'BLOCKER' && x.verdict === 'PASS')) wantTBList.push(`${TABLE_BLOCKER_ID}|${NO_PASSING_BLOCKER_CODE}`);
    }
    const wantTB = wantTBList.sort();
    const gotTB = Array.isArray(receipt.tableBlockers) && receipt.tableBlockers.every((t) => isObj(t) && typeof t.id === 'string' && typeof t.code === 'string')
      ? receipt.tableBlockers.map((t) => `${t.id}|${t.code}`).sort()
      : null;
    if (gotTB === null || gotTB.join(';') !== wantTB.join(';')) {
      add('TABLE_BLOCKERS_MISMATCH', `recorded table blockers differ from the ${wantTB.length} re-derived`);
    }

    // ---- why the receipt cannot be STEP4_READY even though nothing blocks ----
    const wantReasons = [];
    if (ruledCtx !== true) wantReasons.push('NOT_RULED');
    if (headerKindOf(receipt.header) !== MEASURED_HEADER_KIND) wantReasons.push('HEADER_KIND_NOT_MEASURED');
    if (derived.some((x) => x.verdict === 'PASS' && syntheticOnly(x.profile))) wantReasons.push('SYNTHETIC_EVIDENCE');
    if (derived.some((x) => x.wantDeps.length > 0)) wantReasons.push('UNMET_DEPENDENCY');
    wantReasons.sort();
    if (JSON.stringify(receipt.provisionalReasons) !== JSON.stringify(wantReasons)) {
      add('PROVISIONAL_REASONS_MISMATCH', `recorded provisional reasons differ from the ${wantReasons.length} re-derived`);
    }

    // ---- counts: every number recomputed from the re-derived entries ----
    const tally = {
      entries: derived.length,
      byVerdict: ENTRY_VERDICTS.reduce((acc, v) => ({ ...acc, [v]: derived.filter((x) => x.verdict === v).length }), {}),
      byDisposition: DISPOSITIONS.reduce((acc, v) => ({ ...acc, [v]: derived.filter((x) => x.disposition === v).length }), {}),
      byEnvironment: ['E0', 'E1', 'E2', 'none'].reduce((acc, v) => ({ ...acc, [v]: derived.filter((x) => (x.environment || 'none') === v).length }), {}),
      blocking: derived.filter((x) => x.blocking).length,
      acceptedGaps: derived.filter((x) => x.verdict === 'ACCEPTED_GAP').length,
      tableBlockers: wantTB.length,
      unmetDependencies: derived.filter((x) => x.wantDeps.length > 0).length,
      evidence: {
        qualifying: derived.reduce((n, x) => n + x.profile.count, 0),
        measured: derived.reduce((n, x) => n + x.profile.measured, 0),
        synthetic: derived.reduce((n, x) => n + x.profile.synthetic, 0),
        distinctRefs: new Set(derived.flatMap((x) => x.profile.refs)).size,
        syntheticOnlyPasses: derived.filter((x) => x.verdict === 'PASS' && syntheticOnly(x.profile)).length,
      },
    };
    if (!isObj(receipt.counts)) {
      add('COUNTS_MISMATCH', 'counts is missing');
    } else {
      for (const k of Object.keys(receipt.counts)) if (!COUNT_KEYS.includes(k)) add(LEGACY_KEY.test(k) ? 'LEGACY_EXIT_CODE_FIELD' : 'UNKNOWN_FIELD', `counts carries a field outside the schema${LEGACY_KEY.test(k) ? ` (${k})` : ''}`);
      const want = flattenNumbers(tally, '', new Map());
      const got = flattenNumbers(receipt.counts, '', new Map());
      for (const [p, v] of want) {
        if (got.get(p) !== v) add('COUNTS_MISMATCH', `counts.${p}: recorded ${typeof got.get(p) === 'number' ? got.get(p) : '<absent or non-number>'}, re-derived ${v}`);
      }
      for (const p of got.keys()) if (!want.has(p) && COUNT_KEYS.includes(p.split('.')[0])) add('COUNTS_MISMATCH', `counts.${p} is not a counted quantity`);
    }

    // ---- overall verdict ----
    const wantOverall = wantTB.length > 0 || derived.some((x) => x.blocking) ? 'NOT_READY' : wantReasons.length > 0 ? 'PROVISIONAL' : 'STEP4_READY';
    if (!OVERALL_VERDICTS.includes(receipt.verdict)) add('OVERALL_VERDICT_MISMATCH', `verdict is not a known overall verdict; re-derived ${wantOverall}`);
    else if (receipt.verdict !== wantOverall) add('OVERALL_VERDICT_MISMATCH', `recorded ${receipt.verdict}, re-derived ${wantOverall}`);

    // ---- content scrub over the WHOLE receipt, not only evidence and header ----
    const s = scrub(receipt, { canaryPrefix });
    for (const f of labelFindings(receipt, s.findings)) {
      if (f.rule === 'unscannable_value') add('RECEIPT_SHAPE', `${f.path} holds a value that is not plain JSON data`);
      else add('CONTENT_LEAK', `${f.path} matches rule ${f.rule} x${f.count} (content withheld)`);
    }
  } catch (e) {
    codes.add('VALIDATOR_EXCEPTION');
    problems.push(`VALIDATOR_EXCEPTION: the validator failed closed (${e && e.name ? e.name : 'error'})`);
  }
  return { ok: problems.length === 0, problems, codes: [...codes].sort() };
}

/* ------------------------------------------------------------------------- *
 * Suite data + synthetic runs (used by the wrong-receipt library and the self-test)
 * ------------------------------------------------------------------------- */

let SUITE_CACHE = null;

/** The real obligation-index.json and dispositions.json from this directory, deep-cloned. */
export function loadSuiteData() {
  if (!SUITE_CACHE) {
    SUITE_CACHE = {
      index: JSON.parse(fs.readFileSync(path.join(HERE, 'obligation-index.json'), 'utf8')),
      dispositions: JSON.parse(fs.readFileSync(path.join(HERE, 'dispositions.json'), 'utf8')),
    };
  }
  return clone(SUITE_CACHE);
}

/**
 * A conforming run: every BLOCKER passes with one evidence item; DECLARED_GAPs follow gapPolicy
 * ('mixed' alternates PASS / no result, 'notRun' leaves them all unrun, 'pass' passes all).
 * skip = ids with no result; fail = ids that FAIL.
 */
export function syntheticResults(index, dispositions, { gapPolicy = 'mixed', skip = [], fail = [] } = {}) {
  const skipSet = new Set(skip);
  const failSet = new Set(fail);
  const results = [];
  let gapSeen = 0;
  for (const ob of index.obligations) {
    if (skipSet.has(ob.id)) continue;
    const isGap = dispositions.dispositions[ob.id].disposition === 'DECLARED_GAP';
    let status = failSet.has(ob.id) ? 'FAIL' : 'PASS';
    if (isGap && status === 'PASS') {
      const take = gapPolicy === 'pass' || (gapPolicy === 'mixed' && gapSeen % 2 === 0);
      gapSeen++;
      if (!take) continue;
    }
    results.push({
      id: ob.id,
      status,
      environment: 'E1',
      realKms: ob.requiresRealKms,
      realVault: ob.requiresRealVault === true,
      browser: ob.requiresBrowser === true,
      evidence: [{ kind: 'synthetic-check', ref: `synthetic:${ob.id}`, summary: 'fictional check ran; assertions=3' }],
    });
  }
  return results;
}

const syntheticGap = () => ({
  owner: 'Synthetic Owner (fictional)',
  memberFacingSentence: 'Fictional member-facing sentence describing a synthetic gap.',
  closureCondition: 'Fictional closure condition that a synthetic test would accept.',
  registerLine: 'Fictional register line recording the synthetic gap in a synthetic register.',
});

const SELFTEST_RULING_REF = 'SELFTEST-RULING-1';

/** Seal a (copied) disposition table the way a founder ruling act would, once its final content is known. */
function rule(dispositions, index) {
  return sealRuling(dispositions, index, SELFTEST_RULING_REF);
}

/**
 * A fictional MEASURED run: same shape as syntheticResults but with measured-class evidence, so the
 * self-test can show a receipt is not stuck below STEP4_READY. This is a test double: nothing was measured.
 */
function fictionalMeasuredResults(index, dispositions, opts = {}) {
  return syntheticResults(index, dispositions, opts).map((r) => ({
    ...r,
    evidence: [{ kind: 'assertion', ref: `falsifier:SF-01/${r.id}`, summary: 'fictional measured assertion; assertions=3' }],
  }));
}

/** Ensure at least n DECLARED_GAP ids exist in a dispositions copy (converts if the ruling has none). */
function ensureGapIds(dispositions, n) {
  const ids = Object.keys(dispositions.dispositions).filter((id) => dispositions.dispositions[id].disposition === 'DECLARED_GAP');
  for (const id of Object.keys(dispositions.dispositions)) {
    if (ids.length >= n) break;
    if (dispositions.dispositions[id].disposition === 'BLOCKER') {
      dispositions.dispositions[id] = { disposition: 'DECLARED_GAP', gap: null };
      ids.push(id);
    }
  }
  return ids.slice(0, n);
}

function setGap(dispositions, id, complete) {
  dispositions.dispositions[id].gap = complete
    ? syntheticGap()
    : { owner: null, memberFacingSentence: null, closureCondition: null, registerLine: null };
}

/** A fresh conforming receipt on the REAL index/dispositions (copied), with optional ruling/gap/run overrides. */
function fresh({ ruled = false, completeGapCount = 0, incompleteGapCount = 0, run = {}, runFor, measured = false } = {}) {
  const { index, dispositions } = loadSuiteData();
  dispositions.ruled = false;
  const gapIds = ensureGapIds(dispositions, Math.max(1, completeGapCount + incompleteGapCount));
  gapIds.forEach((id, i) => setGap(dispositions, id, i < completeGapCount));
  if (ruled) rule(dispositions, index);
  const blockers = index.obligations.filter((o) => dispositions.dispositions[o.id].disposition === 'BLOCKER').map((o) => o.id);
  const picks = { gapIds, blockers };
  const useRun = typeof runFor === 'function' ? runFor(picks, index, dispositions) : run;
  const results = (measured ? fictionalMeasuredResults : syntheticResults)(index, dispositions, useRun);
  const header = { suite: 'writer-source-intake', kind: measured ? MEASURED_HEADER_KIND : 'synthetic' };
  const receipt = clone(buildReceipt({ index, dispositions, results, header }));
  return { index, dispositions, receipt, ...picks };
}

function normalizedAsShippedContext() {
  const { index, dispositions } = loadSuiteData();
  dispositions.ruled = false;
  for (const id of Object.keys(dispositions.dispositions)) {
    if (dispositions.dispositions[id].disposition === 'DECLARED_GAP') setGap(dispositions, id, false);
  }
  return { index, dispositions };
}

/* ------------------------------------------------------------------------- *
 * WRONG_RECEIPTS -- known-wrong constructions the validator must refuse, each for its named reason.
 * context() returns the { index, dispositions } the receipt must be validated against.
 * ------------------------------------------------------------------------- */

/** Recompute everything derivable from the (lied-about) entries, as a careful liar would; `index` supplies the obligation ids. */
function recount(r, index) {
  const ids = index.obligations.map((o) => o.id);
  r.counts = computeCounts(r.entries, r.tableBlockers, ids);
  r.provisionalReasons = deriveProvisionalReasons({ ruled: r.ruled, headerKind: headerKindOf(r.header), entries: r.entries, ids });
  r.verdict = deriveOverall(r.entries, r.tableBlockers, r.provisionalReasons);
  return r;
}

function entryOf(receipt, pred, what) {
  const e = receipt.entries.find(pred);
  if (!e) throw new Error(`wrong-receipt construction found no entry for: ${what} (a vacuous construction is refused)`);
  return e;
}

function lieAbout(receipt, fn) {
  const before = JSON.stringify(receipt);
  const r = JSON.parse(before);
  fn(r);
  if (JSON.stringify(r) === before) throw new Error('wrong-receipt construction changed nothing (a vacuous construction is refused)');
  return r;
}

function wrong(name, why, expectCodes, build, finish, forbidCodes = []) {
  let cached = null; // built lazily once per module load; make()/context() hand out fresh clones
  const built = () => {
    if (!cached) {
      const b = build();
      cached = { receipt: b.receipt, index: b.index, dispositions: b.dispositions, pin: b.pin };
    }
    return cached;
  };
  const copy = (v) => (v === null || typeof v !== 'object' ? v : structuredClone(v));
  return Object.freeze({
    name,
    why,
    expectCodes,
    forbidCodes,
    make: () => (finish ? finish(copy(built().receipt)) : copy(built().receipt)),
    context: () => ({ index: copy(built().index), dispositions: copy(built().dispositions), ...(built().pin === undefined ? {} : { pin: copy(built().pin) }) }),
  });
}

const randHex = (bytes) => crypto.randomBytes(bytes).toString('hex');

/** A PASS entry with no real-KMS / vault / browser requirement, no dependencies and a non-empty evidence list. */
function plainPass(receipt) {
  return entryOf(receipt, (x) => x.verdict === 'PASS' && !x.requiresRealKms && !x.requiresRealVault && !x.requiresBrowser && x.evidence.length > 0, 'a plain PASS');
}

/** A DECLARED_GAP entry that has run (so it has evidence and a gap object), for the closed-schema constructions. */
function plainPassWithGap(receipt) {
  return entryOf(receipt, (x) => x.gap !== null && x.evidence.length > 0 && x.status === 'PASS', 'a PASS declared gap');
}

const suiteGapCount = () => Object.values(loadSuiteData().dispositions.dispositions).filter((d) => d.disposition === 'DECLARED_GAP').length;

export const WRONG_RECEIPTS = Object.freeze([
  wrong(
    'legacyExitCode',
    'Mimics the existing pg16 receipt: every coverage claim is derived from one exit code, a hard-coded expected total rides along, and nothing was measured per obligation.',
    ['LEGACY_EXIT_CODE_FIELD', 'ENTRY_VERDICT_MISMATCH', 'OVERALL_VERDICT_MISMATCH'],
    () => {
      const f = fresh();
      f.receipt = lieAbout(f.receipt, (r) => {
        r.exitCode = 0;
        r.testsExpected = 12;
        r.coverage = Object.fromEntries(r.entries.map((e) => [e.id, true]));
        for (const e of r.entries) {
          e.status = 'PASS';
          e.environment = 'E1';
          e.realKms = false;
          e.evidence = [{ kind: 'exit-code', ref: 'jest', summary: 'exit 0' }];
          e.verdict = 'PASS';
          e.blocking = false;
        }
        recount(r, f.index);
      });
      return f;
    },
  ),
  wrong(
    'legacyShapeOnly',
    'The legacy receipt exactly as it exists: a result string, an exit code, a hard-coded total and a block of coverage booleans, with no per-obligation entries.',
    ['SCHEMA_MISMATCH', 'LEGACY_EXIT_CODE_FIELD', 'RECEIPT_SHAPE'],
    () => {
      const f = fresh();
      f.receipt = {
        result: 'PASS',
        exitCode: 0,
        testsExpected: 12,
        testsRun: 12,
        productionDataTouched: false,
        coverage: Object.fromEntries(Array.from({ length: 16 }, (_, i) => [`c${i}`, true])),
      };
      return f;
    },
  ),
  wrong(
    'passWithoutEvidence',
    'A PASS whose evidence was removed (or never existed). The raw fields now say INVALID_EVIDENCE; the label still says PASS.',
    ['ENTRY_VERDICT_MISMATCH', 'COUNTS_MISMATCH'],
    () => {
      const f = fresh();
      f.receipt = lieAbout(f.receipt, (r) => {
        const e = entryOf(r, (x) => x.verdict === 'PASS' && !x.requiresRealKms, 'a PASS that does not need real KMS');
        e.evidence = [];
        recount(r, f.index);
      });
      return f;
    },
  ),
  wrong(
    'passWithBlankEvidence',
    'A PASS padded with an evidence item whose fields are blank: one item, no substance. Counting items instead of substance passes this.',
    ['ENTRY_VERDICT_MISMATCH'],
    () => {
      const f = fresh();
      f.receipt = lieAbout(f.receipt, (r) => {
        const e = entryOf(r, (x) => x.verdict === 'PASS' && !x.requiresRealKms, 'a PASS that does not need real KMS');
        e.evidence = [{ kind: '', ref: '', summary: '' }];
        recount(r, f.index);
      });
      return f;
    },
  ),
  wrong(
    'gapReportedAsPass',
    'A failing DECLARED_GAP with a complete gap record is ACCEPTED_GAP. Here it is relabelled PASS and counted as a pass, so a founder-accepted state satisfies a vow-level property.',
    ['ENTRY_VERDICT_MISMATCH', 'COUNTS_MISMATCH'],
    () => {
      const f = fresh({ completeGapCount: 1, runFor: ({ gapIds }) => ({ fail: [gapIds[0]] }) });
      f.receipt = lieAbout(f.receipt, (r) => {
        const e = entryOf(r, (x) => x.verdict === 'ACCEPTED_GAP', 'an ACCEPTED_GAP');
        e.verdict = 'PASS';
        recount(r, f.index);
      });
      return f;
    },
  ),
  wrong(
    'gapUndeclaredAccepted',
    'A failing DECLARED_GAP whose gap record is incomplete is GAP_UNDECLARED and blocks. Here the presence flags were forged to all-true and the entry relabelled ACCEPTED_GAP.',
    ['GAP_FLAGS_MISMATCH', 'ENTRY_VERDICT_MISMATCH', 'OVERALL_VERDICT_MISMATCH'],
    () => {
      const f = fresh({ ruled: true, incompleteGapCount: 1, runFor: ({ gapIds }) => ({ gapPolicy: 'pass', fail: [gapIds[0]] }) });
      f.receipt = lieAbout(f.receipt, (r) => {
        const e = entryOf(r, (x) => x.verdict === 'GAP_UNDECLARED', 'a GAP_UNDECLARED');
        e.gap = Object.fromEntries(GAP_FIELDS.map((k) => [k, true]));
        e.verdict = 'ACCEPTED_GAP';
        e.blocking = false;
        recount(r, f.index);
      });
      return f;
    },
  ),
  wrong(
    'unruledDispositionsReady',
    'Everything passes but the dispositions are only PROPOSED (ruled=false); the receipt calls it STEP4_READY anyway.',
    ['OVERALL_VERDICT_MISMATCH'],
    () => {
      const f = fresh({ ruled: false });
      f.receipt = lieAbout(f.receipt, (r) => {
        r.verdict = 'STEP4_READY';
      });
      return f;
    },
  ),
  wrong(
    'ruledFlagForged',
    'The receipt asserts ruled=true and STEP4_READY while the disposition table it is validated against says ruled=false.',
    ['RULED_MISMATCH', 'OVERALL_VERDICT_MISMATCH'],
    () => {
      const f = fresh({ ruled: false });
      f.receipt = lieAbout(f.receipt, (r) => {
        r.ruled = true;
        r.verdict = 'STEP4_READY';
      });
      return f;
    },
  ),
  wrong(
    'tableBlockerHidden',
    'The ruling is signed (ruled=true) but a DECLARED_GAP that was never run has an empty gap record. The honest receipt is NOT_READY; this one drops the table blocker and ships STEP4_READY.',
    ['TABLE_BLOCKERS_MISMATCH', 'OVERALL_VERDICT_MISMATCH'],
    () => {
      const f = fresh({ ruled: true, incompleteGapCount: 1, run: { gapPolicy: 'notRun' } });
      f.receipt = lieAbout(f.receipt, (r) => {
        if (r.tableBlockers.length === 0) throw new Error('the honest receipt carried no table blocker, so the lie would be vacuous');
        r.tableBlockers = [];
        recount(r, f.index);
      });
      return f;
    },
  ),
  wrong(
    'notRunCountedAsPass',
    'A BLOCKER with no result is NOT_RUN and blocks. Here its entry is labelled PASS, counted as a pass, and the receipt reads PROVISIONAL.',
    ['ENTRY_VERDICT_MISMATCH', 'OVERALL_VERDICT_MISMATCH', 'COUNTS_MISMATCH'],
    () => {
      const f = fresh({ runFor: ({ blockers }) => ({ skip: [blockers[0]] }) });
      f.receipt = lieAbout(f.receipt, (r) => {
        const e = entryOf(r, (x) => x.verdict === 'BLOCKING_NOT_RUN', 'a BLOCKING_NOT_RUN');
        e.verdict = 'PASS';
        e.blocking = false;
        recount(r, f.index);
      });
      return f;
    },
  ),
  wrong(
    'realKmsPassFromLocalHarness',
    'An obligation that needs real KMS "passes" on a local harness (realKms=false). That is INVALID_EVIDENCE and blocks; the receipt says PASS.',
    ['ENTRY_VERDICT_MISMATCH'],
    () => {
      const f = fresh();
      f.receipt = lieAbout(f.receipt, (r) => {
        const e = entryOf(r, (x) => x.requiresRealKms && x.verdict === 'PASS', 'a PASS that needs real KMS');
        e.realKms = false;
      });
      return f;
    },
  ),
  wrong(
    'realKmsRequirementErased',
    'The same local-harness pass, but the entry also rewrites its own requiresRealKms flag to false so the row looks like it never needed the real key.',
    ['REQUIRES_REAL_KMS_MISMATCH', 'ENTRY_VERDICT_MISMATCH'],
    () => {
      const f = fresh();
      f.receipt = lieAbout(f.receipt, (r) => {
        const e = entryOf(r, (x) => x.requiresRealKms && x.verdict === 'PASS', 'a PASS that needs real KMS');
        e.realKms = false;
        e.requiresRealKms = false;
      });
      return f;
    },
  ),
  wrong(
    'hardCodedTotals',
    'An entry is silently dropped while expectedEntries and counts.entries keep the full, hard-coded figure, so the totals still look complete. The dropped entry is a BLOCKER, which a missing result turns into BLOCKING_NOT_RUN.',
    ['MISSING_ENTRY', 'COUNTS_MISMATCH', 'EXPECTED_ENTRIES_MISMATCH', 'OVERALL_VERDICT_MISMATCH'],
    () => {
      const f = fresh();
      f.receipt = lieAbout(f.receipt, (r) => {
        const full = r.entries.length;
        const at = r.entries.map((e) => e.disposition).lastIndexOf('BLOCKER');
        r.entries.splice(at, 1);
        recount(r, f.index);
        r.counts.entries = full;
      });
      return f;
    },
  ),
  wrong(
    'gapEntryDropped',
    'A DECLARED_GAP entry is dropped (and everything recounted). A missing gap is NOT_RUN and does not block, so the overall verdict does not change; only the entry list and its counts are wrong.',
    ['MISSING_ENTRY', 'COUNTS_MISMATCH', 'EXPECTED_ENTRIES_MISMATCH'],
    () => {
      const f = fresh();
      f.receipt = lieAbout(f.receipt, (r) => {
        const at = r.entries.findIndex((e) => e.disposition === 'DECLARED_GAP' && e.status === 'NOT_RUN');
        if (at < 0) throw new Error('no unrun DECLARED_GAP to drop, so the lie would be vacuous');
        r.entries.splice(at, 1);
        recount(r, f.index);
      });
      return f;
    },
    undefined,
    ['OVERALL_VERDICT_MISMATCH', 'VALIDATOR_EXCEPTION'],
  ),
  wrong(
    'expectedEntriesTampered',
    'expectedEntries was edited to match a shorter list, so the receipt "agrees with itself" while disagreeing with the index.',
    ['EXPECTED_ENTRIES_MISMATCH'],
    () => {
      const f = fresh();
      f.receipt = lieAbout(f.receipt, (r) => {
        r.expectedEntries -= 1;
      });
      return f;
    },
  ),
  wrong(
    'contentLeak',
    'An evidence summary carries a canary token and a UUID, i.e. fixture text and an identifier left the harness inside the receipt.',
    ['CONTENT_LEAK'],
    () => {
      const f = fresh();
      f.receipt = lieAbout(f.receipt, (r) => {
        const e = entryOf(r, (x) => x.evidence.length > 0, 'an entry with evidence');
        e.evidence[0].summary = `saw ${DEFAULT_CANARY_PREFIX}${randHex(8).toUpperCase()} in ${crypto.randomUUID()}`;
      });
      return f;
    },
  ),
  wrong(
    'contentLeakHeader',
    'The header carries a 40-character hex run (a full commit hash or digest). The header is held to the same scrub as evidence.',
    ['CONTENT_LEAK'],
    () => {
      const f = fresh();
      f.receipt = lieAbout(f.receipt, (r) => {
        r.header.commit = randHex(20);
      });
      return f;
    },
  ),
  wrong(
    'verdictEditedAfterTheFact',
    'A BLOCKING_FAIL entry was relabelled PASS after the run; the raw status is still FAIL.',
    ['ENTRY_VERDICT_MISMATCH', 'BLOCKING_FLAG_MISMATCH'],
    () => {
      const f = fresh({ runFor: ({ blockers }) => ({ fail: [blockers[0]] }) });
      f.receipt = lieAbout(f.receipt, (r) => {
        const e = entryOf(r, (x) => x.verdict === 'BLOCKING_FAIL', 'a BLOCKING_FAIL');
        e.verdict = 'PASS';
        e.blocking = false;
      });
      return f;
    },
  ),
  wrong(
    'countEdited',
    'A recorded count was nudged (one blocking failure removed from the tally) without touching the entries.',
    ['COUNTS_MISMATCH'],
    () => {
      const f = fresh({ runFor: ({ blockers }) => ({ fail: [blockers[0]] }) });
      f.receipt = lieAbout(f.receipt, (r) => {
        r.counts.byVerdict.BLOCKING_FAIL -= 1;
      });
      return f;
    },
  ),
  wrong(
    'blockingFlagCleared',
    'The blocking flag of a BLOCKING_FAIL entry was cleared while the verdict was left in place.',
    ['BLOCKING_FLAG_MISMATCH'],
    () => {
      const f = fresh({ runFor: ({ blockers }) => ({ fail: [blockers[0]] }) });
      f.receipt = lieAbout(f.receipt, (r) => {
        const e = entryOf(r, (x) => x.verdict === 'BLOCKING_FAIL', 'a BLOCKING_FAIL');
        e.blocking = false;
      });
      return f;
    },
  ),
  wrong(
    'overallLaundered',
    'A receipt with a blocking failure whose overall verdict was edited from NOT_READY to PROVISIONAL.',
    ['OVERALL_VERDICT_MISMATCH'],
    () => {
      const f = fresh({ runFor: ({ blockers }) => ({ fail: [blockers[0]] }) });
      f.receipt = lieAbout(f.receipt, (r) => {
        r.verdict = 'PROVISIONAL';
      });
      return f;
    },
  ),
  wrong(
    'dispositionRelabelled',
    'A failing BLOCKER is relabelled DECLARED_GAP (with forged gap flags) so its failure becomes an ACCEPTED_GAP. The predeclared table says BLOCKER.',
    ['DISPOSITION_MISMATCH', 'ENTRY_VERDICT_MISMATCH', 'GAP_FLAGS_MISMATCH'],
    () => {
      const f = fresh({ runFor: ({ blockers }) => ({ fail: [blockers[0]] }) });
      f.receipt = lieAbout(f.receipt, (r) => {
        const e = entryOf(r, (x) => x.verdict === 'BLOCKING_FAIL', 'a BLOCKING_FAIL');
        e.disposition = 'DECLARED_GAP';
        e.gap = Object.fromEntries(GAP_FIELDS.map((k) => [k, true]));
        e.verdict = 'ACCEPTED_GAP';
        e.blocking = false;
        recount(r, f.index);
      });
      return f;
    },
  ),
  wrong(
    'gapFlagsForged',
    'An unrun DECLARED_GAP with an empty gap record claims all four gap fields are present.',
    ['GAP_FLAGS_MISMATCH'],
    () => {
      const f = fresh({ incompleteGapCount: 1, run: { gapPolicy: 'notRun' } });
      f.receipt = lieAbout(f.receipt, (r) => {
        const e = entryOf(r, (x) => x.disposition === 'DECLARED_GAP' && x.status === 'NOT_RUN', 'an unrun DECLARED_GAP');
        e.gap = Object.fromEntries(GAP_FIELDS.map((k) => [k, true]));
      });
      return f;
    },
  ),
  wrong(
    'phantomEntry',
    'An entry for an obligation that is not in the index was appended (the receipt measures something nobody asked about).',
    ['UNKNOWN_ENTRY', 'EXPECTED_ENTRIES_MISMATCH'],
    () => {
      const f = fresh();
      f.receipt = lieAbout(f.receipt, (r) => {
        r.entries.push({ ...clone(r.entries[0]), id: 'ZZZ-99' });
      });
      return f;
    },
  ),
  wrong(
    'duplicateEntry',
    'The last entry was overwritten by a copy of the first, so the entry count looks right while one obligation vanished and another is counted twice.',
    ['DUPLICATE_ENTRY', 'MISSING_ENTRY'],
    () => {
      const f = fresh();
      f.receipt = lieAbout(f.receipt, (r) => {
        r.entries[r.entries.length - 1] = clone(r.entries[0]);
      });
      return f;
    },
  ),
  wrong(
    'unknownFieldSmuggled',
    'A free-text field was added to an entry. A closed schema refuses fields that could carry unscanned content or a hard-coded verdict.',
    ['UNKNOWN_FIELD'],
    () => {
      const f = fresh();
      f.receipt = lieAbout(f.receipt, (r) => {
        r.entries[0].note = 'all good';
      });
      return f;
    },
  ),
  wrong(
    'entryShapeBroken',
    'An entry carries a status outside PASS/FAIL/NOT_RUN.',
    ['ENTRY_SHAPE'],
    () => {
      const f = fresh();
      f.receipt = lieAbout(f.receipt, (r) => {
        r.entries[0].status = 'MAYBE';
      });
      return f;
    },
  ),
  wrong(
    'schemaWrong',
    'A receipt that does not declare the receipt schema.',
    ['SCHEMA_MISMATCH'],
    () => {
      const f = fresh();
      f.receipt = lieAbout(f.receipt, (r) => {
        r.schema = 'something-else/9';
      });
      return f;
    },
  ),
  wrong(
    'headerNotJson',
    'A header holding a function, i.e. something a scanner cannot read and a JSON file cannot carry.',
    ['HEADER_INVALID', 'RECEIPT_SHAPE'],
    () => fresh(),
    (r) => ({ ...r, header: { run: () => 1 } }), // a function cannot be cloned, so it is attached after the clone
  ),
  wrong(
    'categoryEdited',
    'An entry whose category no longer matches the index (rows quietly moved between groups).',
    ['CATEGORY_MISMATCH'],
    () => {
      const f = fresh();
      f.receipt = lieAbout(f.receipt, (r) => {
        r.entries[0].category = `${r.entries[0].category} (edited)`;
      });
      return f;
    },
  ),
  wrong(
    'evidenceNotArray',
    'An entry whose evidence is a bare string. A malformed entry must be diagnosed as malformed, not crash the validator.',
    ['ENTRY_SHAPE'],
    () => {
      const f = fresh();
      f.receipt = lieAbout(f.receipt, (r) => {
        r.entries[0].evidence = 'looks fine';
      });
      return f;
    },
    undefined,
    ['VALIDATOR_EXCEPTION'],
  ),
  wrong(
    'legacyTotalInHeader',
    'The hard-coded expected total is smuggled into the header instead of the top level.',
    ['LEGACY_EXIT_CODE_FIELD'],
    () => {
      const f = fresh();
      f.receipt = lieAbout(f.receipt, (r) => {
        r.header.nested = { testsExpected: 12 };
      });
      return f;
    },
  ),
  wrong(
    'countsHardCodedTotal',
    'counts carries a stored total next to the computed ones (a constant the validator cannot re-derive).',
    ['UNKNOWN_FIELD'],
    () => {
      const f = fresh();
      f.receipt = lieAbout(f.receipt, (r) => {
        r.counts.total = r.entries.length;
      });
      return f;
    },
  ),
  wrong(
    'countsLegacyKey',
    'counts carries the legacy testsExpected constant.',
    ['LEGACY_EXIT_CODE_FIELD'],
    () => {
      const f = fresh();
      f.receipt = lieAbout(f.receipt, (r) => {
        r.counts.testsExpected = 12;
      });
      return f;
    },
  ),
  wrong(
    'countsExtraBucket',
    'An extra bucket inside byVerdict, a quantity the validator does not count, to park entries outside the tally.',
    ['COUNTS_MISMATCH'],
    () => {
      const f = fresh();
      f.receipt = lieAbout(f.receipt, (r) => {
        r.counts.byVerdict.PASS_ISH = 1;
      });
      return f;
    },
  ),
  wrong(
    'notAnObject',
    'Not a receipt at all.',
    ['RECEIPT_SHAPE'],
    () => {
      const f = fresh();
      f.receipt = null;
      return f;
    },
  ),

  /* ---- the legacy one-exit-code construction, rebuilt on the new schema ---- */
  wrong(
    'legacyOneTripleEverywhere',
    'The legacy construction rebuilt: ONE exit-code evidence triple cited by every obligation, every status PASS, everything declared real, and the receipt reads STEP4_READY. An exit code is context, not evidence, and one artifact cannot be every obligation\'s proof.',
    ['ENTRY_VERDICT_MISMATCH', 'OVERALL_VERDICT_MISMATCH'],
    () => {
      const f = fresh({ ruled: true, measured: true, run: { gapPolicy: 'pass' } });
      if (f.receipt.verdict !== 'STEP4_READY') throw new Error('the honest receipt behind this lie is not STEP4_READY, so the lie would be vacuous');
      f.receipt = lieAbout(f.receipt, (r) => {
        for (const e of r.entries) {
          e.status = 'PASS';
          e.environment = 'E0';
          e.realKms = true;
          e.realVault = true;
          e.browser = true;
          e.evidence = [{ kind: 'exit-code', ref: 'jest', summary: 'exit 0' }];
          e.unmetDependencies = [];
          e.verdict = 'PASS';
          e.blocking = false;
        }
        r.tableBlockers = [];
        recount(r, f.index);
      });
      return f;
    },
  ),
  wrong(
    'exitCodeAloneDischarges',
    'A single PASS whose only evidence is an exit code (a well-formed, bound, substantive-looking item of the context class). Exit code zero is a fact about a process, not about the obligation.',
    ['ENTRY_VERDICT_MISMATCH', 'COUNTS_MISMATCH'],
    () => {
      const f = fresh();
      f.receipt = lieAbout(f.receipt, (r) => {
        const e = plainPass(r);
        e.evidence = [{ kind: 'exit-code', ref: `jest:${e.id}`, summary: 'exit code 0 for the run' }];
        recount(r, f.index);
      });
      return f;
    },
  ),
  wrong(
    'evidenceNotBoundToObligation',
    'A PASS whose evidence is real-looking (measured kind, long summary) but whose ref names no obligation: nothing says what it is evidence of.',
    ['ENTRY_VERDICT_MISMATCH'],
    () => {
      const f = fresh({ measured: true });
      f.receipt = lieAbout(f.receipt, (r) => {
        const e = plainPass(r);
        e.evidence = [{ kind: 'assertion', ref: 'jest/run-1', summary: 'fictional measured assertion; assertions=3' }];
        recount(r, f.index);
      });
      return f;
    },
  ),
  wrong(
    'evidenceBoundToManyObligations',
    'One artifact cited for two obligations: the ref names this obligation AND another indexed id. A ref binds an item to exactly one obligation.',
    ['ENTRY_VERDICT_MISMATCH'],
    () => {
      const f = fresh({ measured: true });
      f.receipt = lieAbout(f.receipt, (r) => {
        const e = plainPass(r);
        const other = r.entries.find((x) => x.id !== e.id).id;
        e.evidence = [{ kind: 'assertion', ref: `falsifier:SF-01/${e.id}+${other}`, summary: 'fictional measured assertion; assertions=3' }];
        recount(r, f.index);
      });
      return f;
    },
  ),
  wrong(
    'evidenceSummaryPlaceholder',
    'A PASS whose only summary is the placeholder text TBD: non-blank, and says nothing.',
    ['ENTRY_VERDICT_MISMATCH'],
    () => {
      const f = fresh({ measured: true });
      f.receipt = lieAbout(f.receipt, (r) => {
        const e = plainPass(r);
        e.evidence = [{ kind: 'assertion', ref: `falsifier:SF-01/${e.id}`, summary: 'TBD' }];
        recount(r, f.index);
      });
      return f;
    },
  ),
  wrong(
    'evidenceSummaryGeneric',
    'A PASS whose summary is "all tests passed": long enough, but made only of words that assert nothing measurable.',
    ['ENTRY_VERDICT_MISMATCH'],
    () => {
      const f = fresh({ measured: true });
      f.receipt = lieAbout(f.receipt, (r) => {
        const e = plainPass(r);
        e.evidence = [{ kind: 'assertion', ref: `falsifier:SF-01/${e.id}`, summary: 'all tests passed' }];
        recount(r, f.index);
      });
      return f;
    },
  ),
  wrong(
    'evidenceSummaryTooShort',
    'A PASS whose summary is seven characters: below the floor for a statement.',
    ['ENTRY_VERDICT_MISMATCH'],
    () => {
      const f = fresh({ measured: true });
      f.receipt = lieAbout(f.receipt, (r) => {
        const e = plainPass(r);
        e.evidence = [{ kind: 'assertion', ref: `falsifier:SF-01/${e.id}`, summary: 'n=3 ran' }];
        recount(r, f.index);
      });
      return f;
    },
  ),
  wrong(
    'evidenceKindUnknown',
    'A PASS whose evidence kind is not in the closed vocabulary.',
    ['ENTRY_VERDICT_MISMATCH'],
    () => {
      const f = fresh({ measured: true });
      f.receipt = lieAbout(f.receipt, (r) => {
        const e = plainPass(r);
        e.evidence = [{ kind: 'vibes', ref: `falsifier:SF-01/${e.id}`, summary: 'fictional measured assertion; assertions=3' }];
        recount(r, f.index);
      });
      return f;
    },
  ),
  wrong(
    'gapPlaceholderTextAccepted',
    'A failing DECLARED_GAP whose gap record, in the disposition table, is the placeholder text TBD in all four fields. The receipt calls it ACCEPTED_GAP with all four flags present.',
    ['GAP_FLAGS_MISMATCH', 'ENTRY_VERDICT_MISMATCH'],
    () => {
      const f = fresh({ completeGapCount: 1, runFor: ({ gapIds }) => ({ fail: [gapIds[0]] }) });
      const gapId = f.receipt.entries.find((e) => e.verdict === 'ACCEPTED_GAP').id;
      f.dispositions.dispositions[gapId].gap = Object.fromEntries(GAP_FIELDS.map((k) => [k, 'TBD']));
      return f;
    },
  ),

  /* ---- synthetic evidence and the header cap the verdict ---- */
  wrong(
    'syntheticEvidenceReady',
    'Everything passes on synthetic evidence under a synthetic header, and the receipt reads STEP4_READY with no provisional reason. Fixture evidence is indistinguishable from a measured run unless the verdict is capped.',
    ['PROVISIONAL_REASONS_MISMATCH', 'OVERALL_VERDICT_MISMATCH'],
    () => {
      const f = fresh({ ruled: true, run: { gapPolicy: 'pass' } });
      if (f.receipt.verdict !== 'PROVISIONAL') throw new Error('the honest receipt behind this lie is not PROVISIONAL, so the lie would be vacuous');
      f.receipt = lieAbout(f.receipt, (r) => {
        r.provisionalReasons = [];
        r.verdict = 'STEP4_READY';
      });
      return f;
    },
  ),
  wrong(
    'syntheticEvidenceReasonDropped',
    'The header declares a measured run, but one entry rests only on synthetic-check evidence. The receipt drops the SYNTHETIC_EVIDENCE reason and reads STEP4_READY.',
    ['PROVISIONAL_REASONS_MISMATCH', 'OVERALL_VERDICT_MISMATCH'],
    () => {
      const f = fresh({ ruled: true, measured: true, run: { gapPolicy: 'pass' } });
      f.receipt = lieAbout(f.receipt, (r) => {
        const e = plainPass(r);
        e.evidence = [{ kind: 'synthetic-check', ref: `synthetic:${e.id}`, summary: 'fictional check ran; assertions=3' }];
        recount(r, f.index);
        r.provisionalReasons = [];
        r.verdict = 'STEP4_READY';
      });
      return f;
    },
  ),
  wrong(
    'syntheticRefDisguised',
    'An entry whose kind says measured but whose ref says synthetic: (the run labelled itself fiction). The receipt reads STEP4_READY.',
    ['PROVISIONAL_REASONS_MISMATCH', 'OVERALL_VERDICT_MISMATCH'],
    () => {
      const f = fresh({ ruled: true, measured: true, run: { gapPolicy: 'pass' } });
      f.receipt = lieAbout(f.receipt, (r) => {
        const e = plainPass(r);
        e.evidence = [{ kind: 'assertion', ref: `synthetic:${e.id}`, summary: 'fictional measured assertion; assertions=3' }];
        recount(r, f.index);
        r.provisionalReasons = [];
        r.verdict = 'STEP4_READY';
      });
      return f;
    },
  ),
  wrong(
    'headerKindEditedAfterTheFact',
    'A measured run whose header was later edited to say synthetic, with the verdict left at STEP4_READY.',
    ['PROVISIONAL_REASONS_MISMATCH', 'OVERALL_VERDICT_MISMATCH'],
    () => {
      const f = fresh({ ruled: true, measured: true, run: { gapPolicy: 'pass' } });
      if (f.receipt.verdict !== 'STEP4_READY') throw new Error('the honest receipt behind this lie is not STEP4_READY, so the lie would be vacuous');
      f.receipt = lieAbout(f.receipt, (r) => {
        r.header.kind = 'synthetic';
      });
      return f;
    },
  ),

  /* ---- the receipt is bound to the tables, and a ruling is a sealed act ---- */
  wrong(
    'tableDigestForged',
    'The recorded digest of the index is the digest of a different (shrunken) index.',
    ['TABLE_DIGEST_MISMATCH'],
    () => {
      const f = fresh();
      f.receipt = lieAbout(f.receipt, (r) => {
        r.tableDigest.index = computeTableDigest({ obligations: f.index.obligations.slice(1) }, f.dispositions).index;
      });
      return f;
    },
  ),
  wrong(
    'tableDigestDispositionsForged',
    'The recorded digest of the disposition table is the digest of a table in which a BLOCKER was relabelled DECLARED_GAP.',
    ['TABLE_DIGEST_MISMATCH'],
    () => {
      const f = fresh();
      const relabelled = clone(f.dispositions);
      relabelled.dispositions[f.blockers[0]] = { disposition: 'DECLARED_GAP', gap: null };
      f.receipt = lieAbout(f.receipt, (r) => {
        r.tableDigest.dispositions = computeTableDigest(f.index, relabelled).dispositions;
      });
      return f;
    },
  ),
  wrong(
    'tableDigestMissing',
    'A receipt that carries no digest of the tables it was computed from.',
    ['TABLE_DIGEST_MISMATCH', 'UNKNOWN_FIELD'],
    () => {
      const f = fresh();
      f.receipt = lieAbout(f.receipt, (r) => {
        delete r.tableDigest;
        r.index = 'unbound';
      });
      return f;
    },
  ),
  wrong(
    'tablesEditedAfterRuling',
    'The ruling was signed over one table; a BLOCKER was relabelled DECLARED_GAP afterwards and the seal was left alone. A ruling over tables that no longer exist is not a ruling.',
    ['CONTEXT_INVALID'],
    () => {
      const f = fresh({ ruled: true, measured: true, run: { gapPolicy: 'pass' } });
      f.dispositions.dispositions[f.blockers[0]] = { disposition: 'DECLARED_GAP', gap: null };
      return f;
    },
  ),
  wrong(
    'indexShrunkAfterRuling',
    'The last obligation was dropped from the index and from the disposition table after the ruling, seal untouched. The receipt still has an entry for it.',
    ['CONTEXT_INVALID'],
    () => {
      const f = fresh({ ruled: true, measured: true, run: { gapPolicy: 'pass' } });
      const last = f.index.obligations.pop().id;
      delete f.dispositions.dispositions[last];
      f.index.count = f.index.obligations.length;
      return f;
    },
  ),
  wrong(
    'shrunkAndResealed',
    'The index and disposition table were shrunk and the ruling re-signed over the shrunken tables, but the receipt was computed from the full ones: its digest and its entry list no longer belong to the tables it is validated against.',
    ['TABLE_DIGEST_MISMATCH', 'UNKNOWN_ENTRY'],
    () => {
      const f = fresh({ ruled: true, measured: true, run: { gapPolicy: 'pass' } });
      const last = f.index.obligations.pop().id;
      delete f.dispositions.dispositions[last];
      f.index.count = f.index.obligations.length;
      rule(f.dispositions, f.index);
      return f;
    },
  ),
  wrong(
    'ruledWithoutRuling',
    'ruled was flipped to true in the disposition table with no ruling reference and no seal: one boolean is not a ruling.',
    ['CONTEXT_INVALID'],
    () => {
      const f = fresh({ ruled: true, measured: true, run: { gapPolicy: 'pass' } });
      delete f.dispositions.ruling;
      return f;
    },
  ),
  wrong(
    'rulingSealForged',
    'ruled is true with a ruling reference, but the seal holds a digest that is not these tables\'.',
    ['CONTEXT_INVALID'],
    () => {
      const f = fresh({ ruled: true, measured: true, run: { gapPolicy: 'pass' } });
      f.dispositions.ruling.tableDigest.index = f.dispositions.ruling.tableDigest.dispositions;
      return f;
    },
  ),
  wrong(
    'rulingReferenceEdited',
    'The receipt names a different ruling than the disposition table does.',
    ['RULING_MISMATCH'],
    () => {
      const f = fresh({ ruled: true, measured: true, run: { gapPolicy: 'pass' } });
      f.receipt = lieAbout(f.receipt, (r) => {
        r.ruling.ref = 'SOME-OTHER-RULING';
      });
      return f;
    },
  ),
  wrong(
    'rulingDropped',
    'The disposition table is ruled, but the receipt records no ruling.',
    ['RULING_MISMATCH'],
    () => {
      const f = fresh({ ruled: true, measured: true, run: { gapPolicy: 'pass' } });
      f.receipt = lieAbout(f.receipt, (r) => {
        r.ruling = null;
      });
      return f;
    },
  ),
  wrong(
    'rulingInventedForUnruledTable',
    'The disposition table is not ruled, but the receipt records a ruling reference.',
    ['RULING_MISMATCH'],
    () => {
      const f = fresh();
      f.receipt = lieAbout(f.receipt, (r) => {
        r.ruling = { ref: SELFTEST_RULING_REF };
      });
      return f;
    },
  ),
  wrong(
    'pinMismatch',
    'The tables this receipt is validated against are not the tables an external pin (for example a FREEZE record) was taken from.',
    ['TABLE_DIGEST_MISMATCH'],
    () => {
      const f = fresh();
      f.pin = computeTableDigest({ obligations: f.index.obligations.slice(1) }, f.dispositions);
      return f;
    },
  ),
  wrong(
    'pinMalformed',
    'A pin that is not exactly { index, dispositions } of digest strings.',
    ['CONTEXT_INVALID'],
    () => {
      const f = fresh();
      f.pin = { index: 'sha256:not-a-pair' };
      return f;
    },
  ),
  wrong(
    'noBlockerPassedReady',
    'A sealed ruling over a table in which every obligation is a declared gap and every gap failed: nothing was certified, yet the receipt reads STEP4_READY (the table blocker was dropped).',
    ['TABLE_BLOCKERS_MISMATCH', 'OVERALL_VERDICT_MISMATCH'],
    () => {
      const { index, dispositions } = loadSuiteData();
      for (const o of index.obligations) dispositions.dispositions[o.id] = { disposition: 'DECLARED_GAP', gap: syntheticGap() };
      rule(dispositions, index);
      const results = index.obligations.map((o) => ({ id: o.id, status: 'FAIL', environment: 'E1', realKms: false, realVault: false, browser: false, evidence: [] }));
      const receipt = clone(buildReceipt({ index, dispositions, results, header: { suite: 'writer-source-intake', kind: MEASURED_HEADER_KIND } }));
      if (receipt.verdict !== 'NOT_READY' || receipt.tableBlockers.length !== 1) throw new Error('the honest receipt behind this lie is not NOT_READY with one table blocker, so the lie would be vacuous');
      const f = { index, dispositions, receipt };
      f.receipt = lieAbout(f.receipt, (r) => {
        r.tableBlockers = [];
        recount(r, f.index);
      });
      return f;
    },
  ),

  /* ---- prerequisites, real vault, browser ---- */
  wrong(
    'unmetDependencyHidden',
    'Nine BLOCKERs PASS on top of declared gaps that never ran. The honest receipt is PROVISIONAL with UNMET_DEPENDENCY; this one clears every list and reads STEP4_READY.',
    ['DEPENDENCIES_MISMATCH', 'PROVISIONAL_REASONS_MISMATCH', 'OVERALL_VERDICT_MISMATCH'],
    () => {
      const f = fresh({ ruled: true, measured: true, completeGapCount: suiteGapCount(), run: { gapPolicy: 'notRun' } });
      if (!f.receipt.entries.some((e) => e.unmetDependencies.length > 0)) throw new Error('the honest receipt has no unmet dependency, so the lie would be vacuous');
      f.receipt = lieAbout(f.receipt, (r) => {
        for (const e of r.entries) e.unmetDependencies = [];
        recount(r, f.index);
      });
      return f;
    },
  ),
  wrong(
    'unmetDependencyListForged',
    'One PASS entry that depends on a gap that never ran records an empty unmetDependencies list.',
    ['DEPENDENCIES_MISMATCH'],
    () => {
      const f = fresh({ ruled: true, measured: true, completeGapCount: suiteGapCount(), run: { gapPolicy: 'notRun' } });
      f.receipt = lieAbout(f.receipt, (r) => {
        entryOf(r, (x) => x.unmetDependencies.length > 0, 'an entry with an unmet dependency').unmetDependencies = [];
      });
      return f;
    },
  ),
  wrong(
    'unmetDependencyInvented',
    'A PASS entry with no prerequisites records an unmet dependency on another obligation.',
    ['DEPENDENCIES_MISMATCH'],
    () => {
      const f = fresh();
      f.receipt = lieAbout(f.receipt, (r) => {
        const e = entryOf(r, (x) => x.verdict === 'PASS' && x.unmetDependencies.length === 0, 'a clean PASS');
        e.unmetDependencies = [r.entries.find((x) => x.id !== e.id).id];
      });
      return f;
    },
  ),
  wrong(
    'realVaultPassWithoutVault',
    'An obligation that needs a real vault "passes" with realVault=false. That is INVALID_EVIDENCE and blocks; the receipt says PASS.',
    ['ENTRY_VERDICT_MISMATCH'],
    () => {
      const f = fresh();
      f.receipt = lieAbout(f.receipt, (r) => {
        entryOf(r, (x) => x.requiresRealVault && x.verdict === 'PASS', 'a PASS that needs a real vault').realVault = false;
      });
      return f;
    },
  ),
  wrong(
    'realVaultUndeclaredPass',
    'An obligation that needs a real vault passes without declaring anything about the vault (realVault=null).',
    ['ENTRY_VERDICT_MISMATCH'],
    () => {
      const f = fresh();
      f.receipt = lieAbout(f.receipt, (r) => {
        entryOf(r, (x) => x.requiresRealVault && x.verdict === 'PASS', 'a PASS that needs a real vault').realVault = null;
      });
      return f;
    },
  ),
  wrong(
    'realVaultRequirementErased',
    'The same local-vault pass, but the entry also rewrites its own requiresRealVault flag to false.',
    ['REQUIRES_REAL_VAULT_MISMATCH', 'ENTRY_VERDICT_MISMATCH'],
    () => {
      const f = fresh();
      f.receipt = lieAbout(f.receipt, (r) => {
        const e = entryOf(r, (x) => x.requiresRealVault && x.verdict === 'PASS', 'a PASS that needs a real vault');
        e.realVault = false;
        e.requiresRealVault = false;
      });
      return f;
    },
  ),
  wrong(
    'browserPassWithoutBrowser',
    'An obligation that needs a browser "passes" with browser=false.',
    ['ENTRY_VERDICT_MISMATCH'],
    () => {
      const f = fresh();
      f.receipt = lieAbout(f.receipt, (r) => {
        entryOf(r, (x) => x.requiresBrowser && x.verdict === 'PASS', 'a PASS that needs a browser').browser = false;
      });
      return f;
    },
  ),
  wrong(
    'browserUndeclaredPass',
    'An obligation that needs a browser passes without declaring one (browser=null).',
    ['ENTRY_VERDICT_MISMATCH'],
    () => {
      const f = fresh();
      f.receipt = lieAbout(f.receipt, (r) => {
        entryOf(r, (x) => x.requiresBrowser && x.verdict === 'PASS', 'a PASS that needs a browser').browser = null;
      });
      return f;
    },
  ),
  wrong(
    'browserRequirementErased',
    'The same no-browser pass, but the entry also rewrites its own requiresBrowser flag to false.',
    ['REQUIRES_BROWSER_MISMATCH', 'ENTRY_VERDICT_MISMATCH'],
    () => {
      const f = fresh();
      f.receipt = lieAbout(f.receipt, (r) => {
        const e = entryOf(r, (x) => x.requiresBrowser && x.verdict === 'PASS', 'a PASS that needs a browser');
        e.browser = false;
        e.requiresBrowser = false;
      });
      return f;
    },
  ),

  /* ---- NOT_RUN entries are not counted as if they ran ---- */
  wrong(
    'shapeBadEntryFailsClosed',
    'A passing BLOCKER whose environment is outside E0/E1/E2. An entry the validator cannot read is treated as NOT_RUN (so the BLOCKER blocks and the overall verdict, which the receipt did not recompute, is wrong); it is not trusted as the PASS it says.',
    ['ENTRY_SHAPE', 'OVERALL_VERDICT_MISMATCH', 'COUNTS_MISMATCH'],
    () => {
      const f = fresh();
      f.receipt = lieAbout(f.receipt, (r) => {
        entryOf(r, (x) => x.disposition === 'BLOCKER' && x.verdict === 'PASS' && !x.requiresRealKms && !x.requiresRealVault && !x.requiresBrowser, 'a plain passing BLOCKER').environment = 'E9';
      });
      return f;
    },
    undefined,
    ['ENTRY_VERDICT_MISMATCH', 'VALIDATOR_EXCEPTION'],
  ),
  ...[
    ['notRunDeclaresEnvironmentOnly', 'only an environment', (e) => { e.environment = 'E1'; }],
    ['notRunDeclaresRealKmsOnly', 'only realKms=false', (e) => { e.realKms = false; }],
    ['notRunDeclaresBrowserOnly', 'only browser=true', (e) => { e.browser = true; }],
    ['notRunEvidenceNotArray', 'evidence that is a string', (e) => { e.evidence = 'none'; }],
  ].map(([name, what, mutate]) =>
    wrong(
      name,
      `A NOT_RUN entry that carries ${what}.`,
      ['ENTRY_SHAPE'],
      () => {
        const f = fresh();
        f.receipt = lieAbout(f.receipt, (r) => {
          mutate(entryOf(r, (x) => x.status === 'NOT_RUN', 'a NOT_RUN entry'));
        });
        return f;
      },
      undefined,
      ['VALIDATOR_EXCEPTION'],
    ),
  ),
  ...[
    ['tableBlockersNotList', 'a table-blocker list that is a string', (r) => { r.tableBlockers = 'none'; }],
    ['tableBlockerNull', 'a table blocker that is null', (r) => { r.tableBlockers = [null]; }],
    ['tableBlockerIdNotString', 'a table blocker whose id is a number', (r) => { r.tableBlockers = [{ id: 7, code: 'GAP_RECORD_INCOMPLETE_AT_RULING' }]; }],
    ['tableBlockerCodeNotString', 'a table blocker whose code is a number', (r) => { r.tableBlockers = [{ id: '<table>', code: 7 }]; }],
  ].map(([name, what, mutate]) =>
    wrong(
      name,
      `A receipt with ${what}: diagnosed as wrong table blockers, not a crash.`,
      ['TABLE_BLOCKERS_MISMATCH'],
      () => fresh(),
      (r) => {
        mutate(r);
        return r;
      },
      ['VALIDATOR_EXCEPTION'],
    ),
  ),
  wrong(
    'notRunCountedInEnvironment',
    'A NOT_RUN entry that carries environment E2 and realKms=true, so the per-environment tally over-states what was measured.',
    ['ENTRY_SHAPE', 'COUNTS_MISMATCH'],
    () => {
      const f = fresh();
      f.receipt = lieAbout(f.receipt, (r) => {
        const e = entryOf(r, (x) => x.status === 'NOT_RUN', 'a NOT_RUN entry');
        e.environment = 'E2';
        e.realKms = true;
        recount(r, f.index);
      });
      return f;
    },
  ),
  wrong(
    'notRunCarriesEvidence',
    'A NOT_RUN entry that carries an evidence item: something is claimed about a result that was never produced.',
    ['ENTRY_SHAPE'],
    () => {
      const f = fresh();
      f.receipt = lieAbout(f.receipt, (r) => {
        const e = entryOf(r, (x) => x.status === 'NOT_RUN', 'a NOT_RUN entry');
        e.evidence = [{ kind: 'assertion', ref: `falsifier:SF-01/${e.id}`, summary: 'fictional measured assertion; assertions=3' }];
      });
      return f;
    },
  ),
  wrong(
    'notRunDeclaresVault',
    'A NOT_RUN entry that declares realVault=true.',
    ['ENTRY_SHAPE'],
    () => {
      const f = fresh();
      f.receipt = lieAbout(f.receipt, (r) => {
        entryOf(r, (x) => x.status === 'NOT_RUN', 'a NOT_RUN entry').realVault = true;
      });
      return f;
    },
  ),

  /* ---- the validator's closed schema, one defect at a time (each diagnosed, none crashes the validator) ---- */
  ...[
    ['evidenceItemNotObject', 'an evidence item that is a bare string', (e) => { e.evidence = ['proof']; }],
    ['evidenceItemNull', 'an evidence item that is null', (e) => { e.evidence = [null]; }],
    ['evidenceItemArray', 'an evidence item that is an array', (e) => { e.evidence = [['kind', 'ref', 'summary']]; }],
    ['evidenceItemExtraKey', 'an evidence item with a fourth field', (e) => { e.evidence = [{ ...e.evidence[0], raw: 'extra' }]; }],
    ['evidenceItemMissingKey', 'an evidence item missing its summary', (e) => { e.evidence = [{ kind: e.evidence[0].kind, ref: e.evidence[0].ref }]; }],
    ['evidenceItemNonStringKind', 'an evidence item whose kind is a number', (e) => { e.evidence = [{ ...e.evidence[0], kind: 7 }]; }],
    ['evidenceItemNonStringRef', 'an evidence item whose ref is a number', (e) => { e.evidence = [{ ...e.evidence[0], ref: 7 }]; }],
    ['evidenceItemNonStringSummary', 'an evidence item whose summary is a number', (e) => { e.evidence = [{ ...e.evidence[0], summary: 7 }]; }],
    ['gapNotObject', 'a gap that is a bare string', (e) => { e.gap = 'yes'; }],
    ['gapArray', 'a gap that is an array', (e) => { e.gap = [true, true, true, true]; }],
    ['gapExtraKey', 'a gap with a fifth flag', (e) => { e.gap = { ...e.gap, extra: true }; }],
    ['gapMissingKey', 'a gap missing a flag', (e) => { const { owner, ...rest } = e.gap; e.gap = rest; }],
    ['gapNonBooleanFlag', 'a gap whose flag is a string', (e) => { e.gap = { ...e.gap, owner: 'yes' }; }],
    ['unmetDependenciesNotList', 'unmetDependencies that is a string', (e) => { e.unmetDependencies = 'none'; }],
    ['unmetDependenciesNonString', 'unmetDependencies holding a number', (e) => { e.unmetDependencies = [7]; }],
    ['realVaultNotBoolean', 'a realVault that is a string', (e) => { e.realVault = 'yes'; }],
    ['browserNotBoolean', 'a browser that is a string', (e) => { e.browser = 'yes'; }],
    ['realKmsNotBoolean', 'a realKms that is a string', (e) => { e.realKms = 'yes'; }],
    ['environmentUnknown', 'an environment outside E0/E1/E2', (e) => { e.environment = 'E9'; }],
    ['blockingNotBoolean', 'a blocking flag that is a string', (e) => { e.blocking = 'no'; }],
    ['verdictUnknown', 'an entry verdict outside the vocabulary', (e) => { e.verdict = 'GREEN'; }],
    ['runWithoutEnvironment', 'a run obligation with environment null', (e) => { e.environment = null; }],
    ['runWithoutRealKms', 'a run obligation with realKms null', (e) => { e.realKms = null; }],
  ].map(([name, what, mutate]) =>
    wrong(
      `closedSchema/${name}`,
      `An entry with ${what}. The validator diagnoses it as a malformed entry and does not crash.`,
      ['ENTRY_SHAPE'],
      () => {
        const f = fresh({ measured: true });
        f.receipt = lieAbout(f.receipt, (r) => {
          mutate(plainPassWithGap(r));
        });
        return f;
      },
      undefined,
      ['VALIDATOR_EXCEPTION'],
    ),
  ),
  ...[
    ['headerMissing', 'A receipt with no header at all.', (r) => { delete r.header; return r; }],
    ['headerNull', 'A receipt whose header is null.', (r) => ({ ...r, header: null })],
    ['headerString', 'A receipt whose header is a bare string.', (r) => ({ ...r, header: 'run-1' })],
  ].map(([name, why, finish]) => wrong(name, why, ['HEADER_INVALID'], () => fresh(), finish, ['VALIDATOR_EXCEPTION'])),
  wrong(
    'headerHoldsMap',
    'A header holding a Map: not plain JSON data, so neither a JSON file nor a scanner can carry it.',
    ['HEADER_INVALID', 'RECEIPT_SHAPE'],
    () => fresh(),
    (r) => ({ ...r, header: { run: new Map([['k', 'v']]) } }),
  ),
  wrong(
    'countsNaN',
    'A recorded count of NaN: not a number a JSON file can carry, and not the recomputed one.',
    ['COUNTS_MISMATCH', 'RECEIPT_SHAPE'],
    () => fresh(),
    (r) => {
      r.counts.entries = NaN;
      return r;
    },
  ),
]);

/* ------------------------------------------------------------------------- *
 * selfTest
 * ------------------------------------------------------------------------- */

/**
 * The self-test reads the live fixture builders to prove FIXTURE_TEXT_MARKERS still covers every unit of fixture text.
 * That is the only place this file touches a sibling module, and the allowlist below is the whole list.
 */
const SIBLING_MODULES = Object.freeze(['./fixtures.mjs']);
function loadSibling(name) {
  if (!SIBLING_MODULES.includes(name)) throw new Error('loadSibling: not an allowed sibling module');
  return createRequire(import.meta.url)(name);
}

function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Rows transcribed from the specification, in a different shape from both implementations. */
const ORACLE_ROWS = [
  // [disposition, status, predicate over the combination, expected verdict]
  ['BLOCKER', 'PASS', (c) => c.ev >= 1 && (!c.kms || c.real === true), 'PASS'],
  ['BLOCKER', 'PASS', (c) => !(c.ev >= 1 && (!c.kms || c.real === true)), 'INVALID_EVIDENCE'],
  ['BLOCKER', 'FAIL', () => true, 'BLOCKING_FAIL'],
  ['BLOCKER', 'NOT_RUN', () => true, 'BLOCKING_NOT_RUN'],
  ['DECLARED_GAP', 'PASS', (c) => c.ev >= 1 && (!c.kms || c.real === true), 'PASS'],
  ['DECLARED_GAP', 'PASS', (c) => !(c.ev >= 1 && (!c.kms || c.real === true)), 'INVALID_EVIDENCE'],
  ['DECLARED_GAP', 'FAIL', (c) => c.gap, 'ACCEPTED_GAP'],
  ['DECLARED_GAP', 'FAIL', (c) => !c.gap, 'GAP_UNDECLARED'],
  ['DECLARED_GAP', 'NOT_RUN', () => true, 'NOT_RUN'],
];

function oracleVerdict(c) {
  const rows = ORACLE_ROWS.filter((r) => r[0] === c.d && r[1] === c.s && r[2](c));
  if (rows.length !== 1) throw new Error(`oracle is not a function of the combination (${rows.length} rows matched)`);
  return rows[0][3];
}

function sourceFindingsForHygiene(text) {
  const hygieneRules = RULES.filter((r) => ['uuid', 'hex_run_32', 'base64_run_40', 'aws_access_key_prefix', 'credential_marker', 'private_key_marker'].includes(r.rule));
  return scanString(text, { canaryLower: 'x' }, hygieneRules);
}

function nonBuiltinImports(text) {
  const bad = [];
  for (const m of text.matchAll(/^\s*import\s[^;]*?from\s+['"]([^'"]+)['"]/gm)) if (!m[1].startsWith('node:')) bad.push(m[1]);
  for (const m of text.matchAll(/\bimport\(\s*['"]([^'"]+)['"]\s*\)/g)) if (!m[1].startsWith('node:')) bad.push(m[1]);
  for (const m of text.matchAll(/\brequire\(\s*['"]([^'"]+)['"]\s*\)/g)) bad.push(m[1]);
  return bad;
}

export function selfTest() {
  const checks = [];
  const check = (name, fn) => {
    try {
      const r = fn();
      const ok = r === true || (r !== null && typeof r === 'object' && r.ok === true);
      const detail = r !== null && typeof r === 'object' && r.detail !== undefined ? r.detail : ok ? 'ok' : 'returned a falsy result';
      checks.push({ name, ok, detail });
    } catch (e) {
      checks.push({ name, ok: false, detail: `threw ${e && e.name}: ${String(e && e.message).slice(0, 220)}` });
    }
  };
  const fail = (detail) => ({ ok: false, detail });
  const pass = (detail) => ({ ok: true, detail });
  const throwsWith = (fn, ErrorClass, code) => {
    try {
      fn();
    } catch (e) {
      return e instanceof ErrorClass && (code === undefined || e.code === code) ? { ok: true, e } : { ok: false, e };
    }
    return { ok: false, e: null };
  };

  let suite;
  check('suite data: real index and dispositions load and are not vacuous', () => {
    suite = loadSuiteData();
    const ids = suite.index.obligations.map((o) => o.id);
    const dispIds = Object.keys(suite.dispositions.dispositions);
    const dispositions = Object.values(suite.dispositions.dispositions).map((d) => d.disposition);
    const problems = [];
    if (ids.length === 0) problems.push('index is empty');
    if (suite.index.count !== ids.length) problems.push('index.count disagrees with obligations.length');
    if (new Set(ids).size !== ids.length) problems.push('duplicate ids in index');
    if (dispIds.length !== ids.length || !ids.every((i) => dispIds.includes(i))) problems.push('dispositions do not cover the index exactly');
    if (!dispositions.includes('BLOCKER')) problems.push('no BLOCKER in dispositions');
    if (!dispositions.includes('DECLARED_GAP')) problems.push('no DECLARED_GAP in dispositions (gap tests would convert a row; see ensureGapIds)');
    if (!suite.index.obligations.some((o) => o.requiresRealKms)) problems.push('no requiresRealKms obligation');
    if (!suite.index.obligations.some((o) => !o.requiresRealKms)) problems.push('every obligation requires real KMS');
    return problems.length ? fail(problems.join('; ')) : pass(`${ids.length} obligations; ${dispositions.filter((d) => d === 'BLOCKER').length} BLOCKER, ${dispositions.filter((d) => d === 'DECLARED_GAP').length} DECLARED_GAP; ruled=${suite.dispositions.ruled}`);
  });

  /* ---- 1. the scrub: each rule fires on a runtime-built planted positive and stays quiet on look-alikes ---- */
  const tinyIndex = (kms = false) => ({ count: 1, obligations: [{ id: 'T-1', category: 'synthetic', requiresRealKms: kms }] });
  const tinyDisp = (disposition = 'BLOCKER', gap = null, ruled = false) => ({ ruled, dispositions: { 'T-1': { disposition, gap } } });
  const passResult = (summary, over = {}) => ({ id: 'T-1', status: 'PASS', environment: 'E1', realKms: false, evidence: [{ kind: 'synthetic-check', ref: 'synthetic:T-1', summary }], ...over });

  const hex8U = () => randHex(8).toUpperCase();
  const upperAlnum16 = () => Array.from(crypto.randomBytes(16), (b) => 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'[b % 36]).join('');
  const PLANTED = [
    ['canary', 'canary', () => `${DEFAULT_CANARY_PREFIX}${hex8U()}`],
    ['canary (lower case)', 'canary', () => `${DEFAULT_CANARY_PREFIX}${hex8U()}`.toLowerCase()],
    ['uuid', 'uuid', () => crypto.randomUUID()],
    ['hex run of exactly 32', 'hex_run_32', () => randHex(16)],
    ['hex run of 64', 'hex_run_32', () => randHex(32)],
    ['base64 blob (48 random bytes)', 'base64_run_40', () => crypto.randomBytes(48).toString('base64')],
    ['base64 blob (96 random bytes)', 'base64_run_40', () => crypto.randomBytes(96).toString('base64')],
    ['base64 slash-free token of exactly 40', 'base64_run_40', () => 'QUJD'.repeat(10)],
    ['base64 padded', 'base64_run_40', () => `${'QUJD'.repeat(12)}==`],
    ['base64 padded, with slashes and low variety', 'base64_run_40', () => `${'abcdefgh/'.repeat(5)}==`],
    ['aws access-key prefix', 'aws_access_key_prefix', () => `${S_KEY_PREFIX}${upperAlnum16()}`],
    ['aws temporary access key (the other prefix)', 'aws_access_key_prefix', () => `${['AS', 'IA'].join('')}${upperAlnum16()}`],
    ['uuid in upper case', 'uuid', () => crypto.randomUUID().toUpperCase()],
    ['hex run of exactly 32 in upper case', 'hex_run_32', () => randHex(16).toUpperCase()],
    ['hex run of 64 in upper case', 'hex_run_32', () => randHex(32).toUpperCase()],
    ['fixture prose: a character name', 'fixture_text', () => 'Tamsin Orrevale'],
    ['fixture prose: a place name in lower case', 'fixture_text', () => 'ostrevane'],
    ['fixture prose: a heading with irregular whitespace', 'fixture_text', () => 'The   Lamp\n Without a  Wick'],
    ['fixture prose: a sentence with no name and no canary', 'fixture_text', () => 'Every map was redrawn at dusk.'],
    ['fixture prose: a table cell', 'fixture_text', () => 'North jetty'],
    ['aws secret marker', 'credential_marker', () => `${S_CRED_MARKER}_access_key`.toUpperCase()],
    ['private key marker', 'private_key_marker', () => `-----${['BEGIN', 'PRIVATE', 'KEY'].join(' ')}-----`],
    ['private key marker (typed)', 'private_key_marker', () => `-----${['BEGIN', 'RSA', 'PRIVATE', 'KEY'].join(' ')}-----`],
    ...['docx', 'pdf', 'epub', 'md', 'txt', 'PDF'].map((ext) => [`manuscript path .${ext}`, 'manuscript_path', () => `drafts/ch${randHex(2)}.${ext}`]),
  ];

  check('scrub lethality: every rule fires on a planted positive, in an evidence summary and in the header', () => {
    const missed = [];
    for (const [label, rule, make] of PLANTED) {
      const planted = make();
      const inEvidence = scrub({ entries: [{ evidence: [{ summary: `note ${planted} end` }] }] });
      const inHeader = scrub({ header: { runId: `x ${planted}` } });
      if (!inEvidence.findings.some((f) => f.rule === rule)) missed.push(`${label}/evidence`);
      if (!inHeader.findings.some((f) => f.rule === rule)) missed.push(`${label}/header`);
    }
    return missed.length ? fail(`not detected: ${missed.join(', ')}`) : pass(`${PLANTED.length} planted positives x 2 locations`);
  });

  check('scrub lethality: 20 independent random 48-byte blobs are all detected (base64 refinement is not a hole)', () => {
    let hit = 0;
    for (let i = 0; i < 20; i++) if (scrub({ s: crypto.randomBytes(48).toString('base64') }).findings.some((f) => f.rule === 'base64_run_40')) hit++;
    return hit === 20 ? pass('20/20') : fail(`${hit}/20 detected`);
  });

  check('scrub negative controls: look-alikes are NOT flagged (31 hex, 39-char token, honest paths, bare extensions)', () => {
    const clean = [
      'ab'.repeat(15) + 'c', // 31 hex chars
      'QUJD'.repeat(9) + 'QUJ', // 39-char base64-alphabet token
      crypto.randomBytes(27).toString('base64'), // 36 chars
      'lib/manuscript/source/sourceKeyAuthority', // 40-char honest path
      'app/api/sovereign/manuscripts/upload/route',
      'lib/manuscript/source/encryptedLanding.ts:142',
      'lib/manuscript/source/sourceKeyAuthority=ok', // a '=' that separates key from value is not base64 padding
      'abcdefgh/'.repeat(5) + '=x',
      'tests/constitutional/writer-source-intake/receipt.mjs',
      'notes.mdx',
      'checksum.md5',
      'the .pdf extension is refused',
      'status=2xx count=3 line=14 encoding=utf-8',
      'fictional check ran; assertions=3',
      'assertions=14 failures=0 file=lib/manuscript/source/encryptedLanding.ts line=142 encoding=utf-8',
      'refused with status 415 before any custody call; rows=0 files=0 bytes=0',
      'the extraction of the second spine document matched the expected length',
      'ASIAN markets are not a key; neither is ASIA alone',
      'aws secrets are not named here',
      'a private key is never printed',
      'WSICANAR',
    ];
    const flagged = clean.map((s, i) => [i, scrub({ s }).findings.map((f) => f.rule)]).filter(([, r]) => r.length);
    return flagged.length ? fail(`false positives on clean string #${flagged.map(([i, r]) => `${i}:${r}`).join(', ')}`) : pass(`${clean.length} clean strings, 0 flagged`);
  });

  check('scrub boundary: the 40/39-char and 32/31-char edges sit where the rules say', () => {
    const edges = [
      [scrub({ s: 'QUJD'.repeat(10) }).ok, false],
      [scrub({ s: 'QUJD'.repeat(9) + 'QUJ' }).ok, true],
      [scrub({ s: 'ab'.repeat(16) }).ok, false],
      [scrub({ s: 'ab'.repeat(15) + 'c' }).ok, true],
    ];
    return edges.every(([got, want]) => got === want) ? pass('40->flag, 39->clean, 32->flag, 31->clean') : fail(`edge results ${edges.map((e) => e[0])}`);
  });

  check('scrub covers keys, nesting and unscannable values (not just values)', () => {
    const leakyKey = { [`${DEFAULT_CANARY_PREFIX}${hex8U()}`]: 'x' };
    const k = scrub(leakyKey);
    const nested = scrub({ a: [{ b: { c: crypto.randomUUID() } }] });
    const odd = scrub({ f: () => 1 });
    const keyPathSafe = !JSON.stringify(k.findings).includes(DEFAULT_CANARY_PREFIX + Object.keys(leakyKey)[0].slice(DEFAULT_CANARY_PREFIX.length));
    return k.findings.some((f) => f.rule === 'canary') && keyPathSafe && nested.findings.some((f) => f.rule === 'uuid') && odd.findings.some((f) => f.rule === 'unscannable_value')
      ? pass('key leak, nested leak and a function value all reported; the leaking key name is not echoed in the path')
      : fail('a key, nested value or non-JSON value escaped the scan');
  });

  check('scrub is not vacuous: an empty scan is visible (scanned count) and a bad canaryPrefix throws', () => {
    const s = scrub({ a: 'x', b: ['y'] }); // two keys + two values = four strings scanned
    const empty = scrub({});
    const t1 = throwsWith(() => scrub({}, { canaryPrefix: '' }), TypeError).ok;
    const t2 = throwsWith(() => scrub({}, { canaryPrefix: 'ab' }), TypeError).ok;
    return s.scanned === 4 && s.ok && empty.scanned === 0 && t1 && t2
      ? pass('scanned count reported (keys and values; an empty receipt scans 0); empty/short prefix refused')
      : fail(`scanned=${s.scanned} emptyScanned=${empty.scanned} t1=${t1} t2=${t2}`);
  });

  check('scrub honours a caller-supplied canary prefix', () => {
    const tag = 'ZZPFX';
    const withTag = scrub({ s: `${tag}${hex8U()}` }, { canaryPrefix: tag });
    const withoutTag = scrub({ s: `${tag}${hex8U()}` });
    return withTag.findings.some((f) => f.rule === 'canary') && !withoutTag.findings.some((f) => f.rule === 'canary') ? pass('custom prefix detected only when supplied') : fail('custom prefix handling wrong');
  });

  check('scrub: every fixture marker fires on its own (case-folded, whitespace-folded) and none is short enough to be generic', () => {
    const dead = [];
    const short = [];
    for (const m of FIXTURE_TEXT_MARKERS) {
      const spaced = m.toUpperCase().replace(/ /g, ' \n  ');
      if (!scrub({ s: `x ${spaced} y` }).findings.some((f) => f.rule === 'fixture_text')) dead.push(m.length);
      if (m.length < 7) short.push(m.length);
      if (m !== m.trim()) short.push(`padded:${m.length}`);
    }
    const lowerOnly = scrub({ s: 'a spring tide in the harbour log of a ship' });
    return dead.length || short.length ? fail(`dead markers (lengths) ${dead}; too short or padded ${short}`) : pass(`${FIXTURE_TEXT_MARKERS.length} markers each detected after upper-casing and whitespace folding; none shorter than 7 characters (${lowerOnly.ok ? 'a bare "spring tide" is not a leak' : 'a bare "spring tide" is flagged'})`);
  });

  check('scrub: values that are not plain JSON data are reported unscannable, plain and null-prototype objects are scanned', () => {
    const leak = crypto.randomUUID();
    class Box {
      constructor() {
        this.v = leak;
      }
    }
    const nullProto = Object.assign(Object.create(null), { v: leak });
    const odd = [['Map', new Map([['k', leak]])], ['Set', new Set([leak])], ['Date', new Date(0)], ['Buffer', Buffer.from(leak)], ['Uint8Array', new Uint8Array(2)], ['class instance', new Box()], ['function', () => leak], ['bigint', 1n], ['symbol', Symbol('s')], ['undefined', undefined]];
    const bad = [];
    for (const [label, v] of odd) {
      const r = scrub({ x: v });
      if (!r.findings.some((f) => f.rule === 'unscannable_value')) bad.push(`${label}: not reported`);
      if (r.ok) bad.push(`${label}: reported ok`);
    }
    if (!scrub({ x: nullProto }).findings.some((f) => f.rule === 'uuid')) bad.push('null-prototype object was not scanned');
    if (!scrub({ x: { v: leak } }).findings.some((f) => f.rule === 'uuid')) bad.push('plain object was not scanned');
    if (!scrub({ x: [leak] }).findings.some((f) => f.rule === 'uuid')) bad.push('array was not scanned');
    return bad.length ? fail(bad.join('; ')) : pass(`${odd.length} non-JSON values reported; plain, null-prototype and array values scanned`);
  });

  check('scrub: finding paths are exact (root, nested key, array index, unsafe key, non-JSON values at root and nested)', () => {
    const u = crypto.randomUUID();
    const paths = (v) => scrub(v).findings.map((f) => f.path).join('|');
    const want = [
      [paths(u), '<root>'],
      [paths({ a: { b: u } }), 'a.b'],
      [paths({ a: [u] }), 'a[0]'],
      [paths([u]), '[0]'],
      [paths({ 'has space': u }), '<key#0>'],
      [paths(() => 1), '<root>'],
      [paths(undefined), '<root>'],
      [paths(new Map()), '<root>'],
      [paths({ a: () => 1 }), 'a'],
      [paths({ a: { b: new Map() } }), 'a.b'],
      [paths(NaN), '<root>'],
      [paths({ a: NaN }), 'a'],
      [paths({ a: [Infinity] }), 'a[0]'],
    ];
    const wrongOnes = want.map(([got, exp], i) => [i, got, exp]).filter(([, got, exp]) => got !== exp);
    return wrongOnes.length ? fail(`path mismatches: ${wrongOnes.map(([i, got, exp]) => `#${i} got "${got}" want "${exp}"`).join('; ')}`) : pass(`${want.length} paths exact`);
  });

  check('scrub: numbers (NaN, Infinity, -Infinity are unscannable; finite ones are clean) and the depth limit (40 scanned, 41 unscannable)', () => {
    const badNumbers = [NaN, Infinity, -Infinity].filter((n) => scrub({ n }).ok);
    const goodNumbers = [0, -1, 1.5, 1e9].filter((n) => !scrub({ n }).ok);
    const nest = (levels, leaf) => {
      let v = leaf;
      for (let i = 0; i < levels; i++) v = [v];
      return v;
    };
    const u = crypto.randomUUID();
    const at = scrub(nest(40, u));
    const over = scrub(nest(41, u));
    const problems = [];
    if (badNumbers.length) problems.push(`${badNumbers.length} non-finite number(s) passed`);
    if (goodNumbers.length) problems.push(`${goodNumbers.length} finite number(s) refused`);
    if (!at.findings.some((f) => f.rule === 'uuid') || at.findings.some((f) => f.rule === 'unscannable_value')) problems.push('depth 40 was not scanned');
    if (!over.findings.some((f) => f.rule === 'unscannable_value') || over.findings.some((f) => f.rule === 'uuid')) problems.push('depth 41 was not reported unscannable');
    if (over.findings.map((f) => f.path).join('|') !== '[0]'.repeat(41)) problems.push('the depth-limit finding does not carry the path it stopped at');
    return problems.length ? fail(problems.join('; ')) : pass('non-finite numbers refused, finite accepted; depth 40 scanned, depth 41 reported');
  });

  check('scrub: a clean key keeps a readable path and a leaking key is masked (the key-leak signal is not constant)', () => {
    const clean = scrub({ plain: crypto.randomUUID() }).findings.map((f) => f.path);
    const leakyKey = `${DEFAULT_CANARY_PREFIX}${hex8U()}`;
    const masked = scrub({ [leakyKey]: crypto.randomUUID() }).findings.map((f) => f.path);
    return clean.join('|') === 'plain' && masked.includes('<key#0>') && !masked.some((p) => p.includes(leakyKey)) ? pass('plain key readable, leaking key masked as <key#0>') : fail(`clean=${clean} masked=${masked}`);
  });

  check('scrub: canaryPrefix length boundary (3 characters refused, 4 accepted) and a non-string prefix is refused', () => {
    const bad = [];
    if (!throwsWith(() => scrub({}, { canaryPrefix: 'abc' }), TypeError).ok) bad.push('3 chars accepted');
    if (throwsWith(() => scrub({}, { canaryPrefix: 'abcd' }), TypeError).ok) bad.push('4 chars refused');
    if (!throwsWith(() => scrub({}, { canaryPrefix: 7 }), TypeError).ok) bad.push('a number accepted');
    if (!throwsWith(() => scrub({}, { canaryPrefix: null }), TypeError).ok) bad.push('null accepted');
    return bad.length ? fail(bad.join('; ')) : pass('3 refused, 4 accepted, non-strings refused');
  });

  check('scrub: base64 refinement edges (transition rate 14/40 is a blob, 13/39 is not; boundary characters count as their classes)', () => {
    const cls = (c) => (/[a-z]/.test(c) ? 0 : /[A-Z]/.test(c) ? 1 : /[0-9]/.test(c) ? 2 : 3);
    const rateOf = (t) => {
      let n = 0;
      for (let i = 1; i < t.length; i++) if (cls(t[i]) !== cls(t[i - 1])) n++;
      return [n, t.length - 1];
    };
    const put = (len, at, ch) => {
      const a = Array.from({ length: len }, () => 'a');
      for (const [i, c] of at) a[i] = c;
      return a.join('');
    };
    // 41 characters, one slash and six isolated capitals: 14 class changes over 40 pairs = exactly 0.35
    const atEdge = put(41, [[1, '/'], ...[5, 8, 11, 14, 17, 20].map((i) => [i, 'B'])]);
    // 40 characters, one slash, five isolated capitals and a capital last: 13 over 39, just under 0.35
    const underEdge = put(40, [[1, '/'], ...[5, 8, 11, 14, 17].map((i) => [i, 'B']), [39, 'B']]);
    const [aN, aD] = rateOf(atEdge);
    const [uN, uD] = rateOf(underEdge);
    const problems = [];
    if (aN !== 14 || aD !== 40 || uN !== 13 || uD !== 39) problems.push(`construction wrong: ${aN}/${aD}, ${uN}/${uD}`);
    const isBlob = (t) => scrub({ s: t }).findings.some((f) => f.rule === 'base64_run_40');
    if (!isBlob(atEdge)) problems.push('14/40 was not flagged');
    if (isBlob(underEdge)) problems.push('13/39 was flagged');
    // "/X/" triples: with X a boundary character of its class the string is a blob; a class that is miscounted would not be
    for (const X of ['A', 'Z', '0', '9', 'a', 'z']) {
      const t = put(41, [[2, '/'], [3, X], [4, '/'], [10, '/'], [11, X], [12, '/'], [18, '/'], [19, X], [20, '/'], [26, '/'], [27, X], [28, '/']]);
      const [n, d] = rateOf(t);
      if (n < 14) problems.push(`construction for ${X} is below the edge (${n}/${d})`);
      else if (!isBlob(t)) problems.push(`"/${X}/" string of ${n}/${d} was not flagged`);
    }
    return problems.length ? fail(problems.join('; ')) : pass('14/40 flagged, 13/39 clean, six boundary characters counted in their own class');
  });

  /* ---- 2. buildReceipt: input rejection and scrub wiring ---- */
  check('buildReceipt THROWS on an unknown id, naming no content', () => {
    const t = throwsWith(() => buildReceipt({ index: tinyIndex(), dispositions: tinyDisp(), results: [passResult('ok', { id: 'T-9' })] }), ReceiptInputError, 'UNKNOWN_ID');
    return t.ok && t.e.message.includes('(T-9)') ? pass(t.e.message) : fail(`got ${t.e && t.e.message} (an id of the allowed shape is named so the caller can find it)`);
  });

  check('buildReceipt THROWS on an unknown id that is itself content (the id is not echoed)', () => {
    const secret = `${DEFAULT_CANARY_PREFIX}${hex8U()}`;
    const t = throwsWith(() => buildReceipt({ index: tinyIndex(), dispositions: tinyDisp(), results: [passResult('ok', { id: secret })] }), ReceiptInputError, 'UNKNOWN_ID');
    return t.ok && !t.e.message.includes(secret) ? pass('thrown, id not echoed') : fail('not thrown or the id was echoed');
  });

  check('buildReceipt THROWS on a duplicate id', () => {
    const t = throwsWith(() => buildReceipt({ index: tinyIndex(), dispositions: tinyDisp(), results: [passResult('a'), passResult('b')] }), ReceiptInputError, 'DUPLICATE_ID');
    return t.ok ? pass('DUPLICATE_ID') : fail(`got ${t.e && t.e.message}`);
  });

  check('buildReceipt THROWS on malformed results (status, environment, realKms, evidence shape, extra field)', () => {
    const bad = [
      [passResult('x', { status: 'GREEN' }), 'BAD_STATUS'],
      [passResult('x', { environment: 'E9' }), 'BAD_ENVIRONMENT'],
      [passResult('x', { environment: undefined }), 'BAD_ENVIRONMENT'],
      [passResult('x', { realKms: 'yes' }), 'BAD_REAL_KMS'],
      [passResult('x', { realKms: undefined }), 'BAD_REAL_KMS'],
      [passResult('x', { evidence: 'proof' }), 'BAD_EVIDENCE'],
      [passResult('x', { evidence: [{ kind: 'k', ref: 'r' }] }), 'BAD_EVIDENCE'],
      [passResult('x', { evidence: [{ kind: 'k', ref: 'r', summary: 's', raw: 'dump' }] }), 'BAD_EVIDENCE'],
      [passResult('x', { exitCode: 0 }), 'BAD_RESULTS'],
    ];
    const wrongOnes = bad.filter(([r, code]) => !throwsWith(() => buildReceipt({ index: tinyIndex(), dispositions: tinyDisp(), results: [r] }), ReceiptInputError, code).ok);
    const undeclared = throwsWith(() => buildReceipt({ index: tinyIndex(), dispositions: tinyDisp(), results: [passResult('x', { realKms: undefined })] }), ReceiptInputError, 'BAD_REAL_KMS');
    if (!undeclared.ok || !undeclared.e.message.includes('does not declare realKms true/false')) wrongOnes.push(['undeclared realKms message']);
    return wrongOnes.length ? fail(`${wrongOnes.length} malformed result(s) did not throw their code`) : pass(`${bad.length} malformed results each threw their own code`);
  });

  check('buildReceipt THROWS on malformed reference data and header, each with its OWN error code', () => {
    // Each case has exactly one defect, and the expected code is the reader's, not a downstream INTERNAL_INCONSISTENCY.
    const cases = [
      ['empty index', 'BAD_INDEX', () => buildReceipt({ index: { obligations: [] }, dispositions: { ruled: false, dispositions: {} }, results: [] })],
      ['index.count disagrees', 'BAD_INDEX', () => buildReceipt({ index: { count: 5, obligations: tinyIndex().obligations }, dispositions: tinyDisp(), results: [] })],
      ['ruled is not a boolean', 'BAD_DISPOSITIONS', () => buildReceipt({ index: tinyIndex(), dispositions: { ruled: 'false', dispositions: tinyDisp().dispositions }, results: [] })],
      ['no disposition for an indexed id', 'BAD_DISPOSITIONS', () => buildReceipt({ index: tinyIndex(), dispositions: { ruled: false, dispositions: {} }, results: [] })],
      ['disposition for an id not in the index', 'BAD_DISPOSITIONS', () => buildReceipt({ index: tinyIndex(), dispositions: { ruled: false, dispositions: { 'T-1': { disposition: 'BLOCKER', gap: null }, 'T-2': { disposition: 'BLOCKER', gap: null } } }, results: [] })],
      ['disposition outside BLOCKER/DECLARED_GAP', 'BAD_DISPOSITIONS', () => buildReceipt({ index: tinyIndex(), dispositions: { ruled: false, dispositions: { 'T-1': { disposition: 'MAYBE', gap: null } } }, results: [] })],
      ['results is not an array', 'BAD_RESULTS', () => buildReceipt({ index: tinyIndex(), dispositions: tinyDisp(), results: 'none' })],
      ['header is a string', 'BAD_HEADER', () => buildReceipt({ index: tinyIndex(), dispositions: tinyDisp(), results: [], header: 'run-1' })],
      ['header holds a function', 'BAD_HEADER', () => buildReceipt({ index: tinyIndex(), dispositions: tinyDisp(), results: [], header: { f: () => 1 } })],
    ];
    const wrongOnes = cases.filter(([, code, run]) => !throwsWith(run, ReceiptInputError, code).ok).map(([label]) => label);
    return wrongOnes.length ? fail(`did not throw the expected code: ${wrongOnes.join('; ')}`) : pass(`${cases.length} single-defect inputs each threw their own code`);
  });

  check('buildReceipt THROWS ReceiptContentLeak for every planted positive, in evidence and in header, with no content in the message', () => {
    const problems = [];
    for (const [label, rule, make] of PLANTED) {
      for (const where of ['summary', 'ref', 'kind', 'header']) {
        const planted = make();
        const run = () =>
          where === 'header'
            ? buildReceipt({ index: tinyIndex(), dispositions: tinyDisp(), results: [passResult('ok')], header: { runId: `r ${planted}` } })
            : buildReceipt({
                index: tinyIndex(),
                dispositions: tinyDisp(),
                results: [{ ...passResult('ok'), evidence: [{ kind: 'k', ref: 'r', summary: 's', [where]: `v ${planted}` }] }],
              });
        const t = throwsWith(run, ReceiptContentLeak);
        if (!t.ok) problems.push(`${label}/${where}: no ReceiptContentLeak`);
        else if (t.e.message.includes(planted) || JSON.stringify(t.e.findings).includes(planted)) problems.push(`${label}/${where}: the matched content was echoed`);
        else if (!t.e.findings.some((f) => f.rule === rule)) problems.push(`${label}/${where}: wrong rule ${t.e.findings.map((f) => f.rule)}`);
      }
    }
    return problems.length ? fail(problems.slice(0, 6).join(' | ')) : pass(`${PLANTED.length} positives x 4 locations refused, rule named, content withheld`);
  });

  check('buildReceipt accepts clean evidence and header (the scrub is not a reject-everything stub)', () => {
    const r = buildReceipt({ index: tinyIndex(), dispositions: tinyDisp(), results: [passResult('fictional check ran; assertions=3')], header: { suite: 'writer-source-intake', run: 'synthetic' } });
    return r.verdict === 'PROVISIONAL' && r.entries[0].verdict === 'PASS' ? pass('PROVISIONAL, entry PASS') : fail(`${r.verdict} / ${r.entries[0].verdict}`);
  });

  check('buildReceipt is deterministic (same inputs, byte-identical receipt; no clock or randomness inside)', () => {
    const a = suite.index;
    const run = () => JSON.stringify(buildReceipt({ index: a, dispositions: suite.dispositions, results: syntheticResults(a, suite.dispositions), header: { suite: 'x' } }));
    return run() === run() ? pass('identical') : fail('two builds differ');
  });

  /* ---- 3. the verdict table: exhaustive, against a spec-transcribed oracle, for BOTH derivations and the integrated path ---- */
  check('entry verdict table: builder, validator-rule and integrated buildReceipt all match the oracle on every combination', () => {
    const seen = new Set();
    let n = 0;
    const problems = [];
    // gapShape: a complete record, one with a NULL field, and one that differs from complete ONLY by a blank string
    for (const d of DISPOSITIONS) for (const s of STATUSES) for (const kms of [false, true]) for (const real of [null, false, true]) for (const gapShape of ['complete', 'nullField', 'blankOnly']) for (const evShape of ['none', 'blank', 'one', 'two']) {
      const gap = gapShape === 'complete';
      const ev = evShape === 'one' ? 1 : evShape === 'two' ? 2 : 0;
      const combo = { d, s, kms, real, gap, ev };
      const want = oracleVerdict(combo);
      seen.add(want);
      n++;
      const args = { disposition: d, status: s, evidenceCount: ev, requiresRealKms: kms, realKms: real, gapComplete: gap };
      const a = deriveEntryVerdict(args);
      const b = rederiveEntryVerdict(args);
      if (a !== want) problems.push(`builder ${JSON.stringify(combo)} -> ${a}, want ${want}`);
      if (b !== want) problems.push(`validator ${JSON.stringify(combo)} -> ${b}, want ${want}`);

      // integrated path through buildReceipt on a one-obligation index
      const items = evShape === 'blank' ? [{ kind: '', ref: ' ', summary: '' }] : Array.from({ length: ev }, (_, i) => ({ kind: 'synthetic-check', ref: `synthetic:T-1:${i}`, summary: 'fictional check ran' }));
      const result = s === 'NOT_RUN' ? [] : [{ id: 'T-1', status: s, environment: 'E1', realKms: real === null ? false : real, evidence: items }];
      const realForPath = s === 'NOT_RUN' ? null : real === null ? false : real;
      const gapObj = gapShape === 'complete' ? syntheticGap() : gapShape === 'nullField' ? { ...syntheticGap(), memberFacingSentence: null } : { ...syntheticGap(), registerLine: '   ' };
      const rec = buildReceipt({ index: tinyIndex(kms), dispositions: tinyDisp(d, d === 'DECLARED_GAP' ? gapObj : null), results: result });
      const wantIntegrated = oracleVerdict({ ...combo, real: realForPath });
      if (rec.entries[0].verdict !== wantIntegrated) problems.push(`integrated ${JSON.stringify(combo)} -> ${rec.entries[0].verdict}, want ${wantIntegrated}`);
    }
    if (seen.size !== ENTRY_VERDICTS.length) problems.push(`oracle exercised ${seen.size} of ${ENTRY_VERDICTS.length} verdicts`);
    return problems.length ? fail(`${problems.length} disagreement(s): ${problems.slice(0, 3).join(' | ')}`) : pass(`${n} combinations x 3 implementations; all ${seen.size} verdicts exercised`);
  });

  const twoIndex = () => ({ count: 2, obligations: [{ id: 'T-1', category: 'synthetic', requiresRealKms: false }, { id: 'T-2', category: 'synthetic', requiresRealKms: false }] });
  const measuredItem = (id, summary = 'fictional measured assertion; assertions=3') => ({ kind: 'assertion', ref: `probe/${id}`, summary });
  const runOf = (id, status, over = {}) => ({ id, status, environment: 'E1', realKms: false, evidence: status === 'PASS' ? [measuredItem(id)] : [], ...over });
  const measuredHeader = { suite: 'writer-source-intake', kind: MEASURED_HEADER_KIND };

  check('ACCEPTED_GAP is never PASS: counted on its own line, absent from the pass tally, non-blocking', () => {
    // T-1 is a declared gap that fails with a complete record; T-2 is a BLOCKER that passes on measured evidence.
    const idx = twoIndex();
    const g = rule({ ruled: false, dispositions: { 'T-1': { disposition: 'DECLARED_GAP', gap: syntheticGap() }, 'T-2': { disposition: 'BLOCKER', gap: null } } }, idx);
    const r = buildReceipt({ index: idx, dispositions: g, results: [runOf('T-1', 'FAIL'), runOf('T-2', 'PASS')], header: measuredHeader });
    const e = r.entries[0];
    return e.verdict === 'ACCEPTED_GAP' && !e.blocking && r.counts.byVerdict.PASS === 1 && r.counts.acceptedGaps === 1 && r.counts.byVerdict.ACCEPTED_GAP === 1 && r.verdict === 'STEP4_READY' && validateReceipt(r, { index: idx, dispositions: g }).ok
      ? pass('ACCEPTED_GAP counted separately (1), PASS counts only the BLOCKER (1); overall STEP4_READY because the gap is declared')
      : fail(`${e.verdict} blocking=${e.blocking} PASS=${r.counts.byVerdict.PASS} accepted=${r.counts.acceptedGaps} overall=${r.verdict}`);
  });

  check('GAP_UNDECLARED blocks even when ruled (an incomplete gap never ships)', () => {
    const idx = twoIndex();
    const g = rule({ ruled: false, dispositions: { 'T-1': { disposition: 'DECLARED_GAP', gap: { owner: 'x', memberFacingSentence: 'y', closureCondition: 'z', registerLine: null } }, 'T-2': { disposition: 'BLOCKER', gap: null } } }, idx);
    const r = buildReceipt({ index: idx, dispositions: g, results: [runOf('T-1', 'FAIL'), runOf('T-2', 'PASS')], header: measuredHeader });
    return r.entries[0].verdict === 'GAP_UNDECLARED' && r.verdict === 'NOT_READY' ? pass('GAP_UNDECLARED -> NOT_READY') : fail(`${r.entries[0].verdict} / ${r.verdict}`);
  });

  /* ---- 4. whole-suite runs on the real index ---- */
  // A copy of the real tables, edited by mut, then sealed by a ruling act if (and only if) it ends up ruled.
  const ctxOf = (mut) => {
    const s = loadSuiteData();
    mut(s);
    if (s.dispositions.ruled === true) rule(s.dispositions, s.index);
    return s;
  };
  const build = (s, run, { measured = false } = {}) =>
    buildReceipt({
      index: s.index,
      dispositions: s.dispositions,
      results: (measured ? fictionalMeasuredResults : syntheticResults)(s.index, s.dispositions, run),
      header: { suite: 'writer-source-intake', kind: measured ? MEASURED_HEADER_KIND : 'synthetic' },
    });
  const blockerIds = (s) => s.index.obligations.filter((o) => s.dispositions.dispositions[o.id].disposition === 'BLOCKER').map((o) => o.id);

  check('conforming synthetic run, ruled=false: accepted by the validator and PROVISIONAL (computed from entries)', () => {
    const s = ctxOf((x) => {
      x.dispositions.ruled = false;
    });
    const r = build(s);
    const v = validateReceipt(r, s);
    const blockersCounted = r.counts.byDisposition.BLOCKER;
    const expected = blockerIds(s).length;
    const bad = [];
    if (!v.ok) bad.push(`validator refused: ${v.problems[0]}`);
    if (r.verdict !== 'PROVISIONAL') bad.push(`verdict ${r.verdict}`);
    if (r.counts.entries !== s.index.obligations.length || r.entries.length !== r.expectedEntries) bad.push('entry count differs from the index');
    if (r.counts.blocking !== 0) bad.push('a conforming run has blocking entries');
    if (blockersCounted !== expected) bad.push('byDisposition.BLOCKER differs from the table');
    if (r.counts.byVerdict.PASS < expected) bad.push('fewer PASS entries than BLOCKERs');
    return bad.length ? fail(bad.join('; ')) : pass(`PROVISIONAL, ${r.counts.byVerdict.PASS} PASS of ${r.counts.entries}, blocking 0`);
  });

  check('flipping ruled to true in a copy gives STEP4_READY only when sealed, measured, no blocker is open, gap records are complete and every prerequisite passed', () => {
    const s = ctxOf((x) => {
      x.dispositions.ruled = true;
      for (const id of Object.keys(x.dispositions.dispositions)) if (x.dispositions.dispositions[id].disposition === 'DECLARED_GAP') setGap(x.dispositions, id, true);
    });
    const bids = blockerIds(s);
    const ready = build(s, { gapPolicy: 'pass' }, { measured: true });
    const withOpenNotRun = build(s, { gapPolicy: 'pass', skip: [bids[0]] }, { measured: true });
    const withOpenFail = build(s, { gapPolicy: 'pass', fail: [bids[0]] }, { measured: true });
    const gapsNotRun = build(s, { gapPolicy: 'notRun' }, { measured: true });
    const synthetic = build(s, { gapPolicy: 'pass' });
    const bad = [];
    if (ready.verdict !== 'STEP4_READY' || ready.provisionalReasons.length !== 0) bad.push(`all-pass, ruled, measured -> ${ready.verdict} ${ready.provisionalReasons}`);
    if (!validateReceipt(ready, s).ok) bad.push('validator refused the STEP4_READY receipt');
    if (withOpenNotRun.verdict !== 'NOT_READY') bad.push(`one blocker unrun -> ${withOpenNotRun.verdict}`);
    if (withOpenFail.verdict !== 'NOT_READY') bad.push(`one blocker failing -> ${withOpenFail.verdict}`);
    if (!validateReceipt(withOpenNotRun, s).ok || !validateReceipt(withOpenFail, s).ok) bad.push('validator refused an honest NOT_READY receipt');
    if (gapsNotRun.verdict !== 'PROVISIONAL' || !gapsNotRun.provisionalReasons.includes('UNMET_DEPENDENCY')) bad.push(`blockers passing on gaps that never ran -> ${gapsNotRun.verdict} ${gapsNotRun.provisionalReasons}`);
    if (synthetic.verdict !== 'PROVISIONAL' || synthetic.provisionalReasons.join() !== 'HEADER_KIND_NOT_MEASURED,SYNTHETIC_EVIDENCE') bad.push(`synthetic run -> ${synthetic.verdict} ${synthetic.provisionalReasons}`);
    return bad.length ? fail(bad.join('; ')) : pass('sealed+measured+all pass -> STEP4_READY; open blocker -> NOT_READY; unrun prerequisites or synthetic evidence -> PROVISIONAL');
  });

  check('an open blocker blocks whether or not the table is ruled (never PROVISIONAL with a blocker open)', () => {
    const out = [];
    for (const ruled of [false, true]) {
      const s = ctxOf((x) => {
        x.dispositions.ruled = ruled;
      });
      const r = build(s, { skip: [blockerIds(s)[0]] });
      out.push(r.verdict);
    }
    return out.every((v) => v === 'NOT_READY') ? pass(`ruled=false -> ${out[0]}, ruled=true -> ${out[1]}`) : fail(out.join(','));
  });

  check('table blocker: ruled=true with an unrun DECLARED_GAP and an empty gap record is NOT_READY (entry stays NOT_RUN)', () => {
    const s = ctxOf((x) => {
      x.dispositions.ruled = true;
      for (const id of ensureGapIds(x.dispositions, 1)) setGap(x.dispositions, id, false);
    });
    const r = build(s, { gapPolicy: 'notRun' });
    const nGapEntries = r.entries.filter((e) => e.disposition === 'DECLARED_GAP');
    const bad = [];
    if (r.verdict !== 'NOT_READY') bad.push(`verdict ${r.verdict}`);
    if (r.tableBlockers.length === 0 || r.counts.tableBlockers !== r.tableBlockers.length) bad.push('table blockers missing or miscounted');
    if (!nGapEntries.every((e) => e.verdict === 'NOT_RUN' || e.verdict === 'PASS')) bad.push('a gap entry verdict is not NOT_RUN/PASS');
    if (r.counts.blocking !== 0) bad.push('an entry blocks; the block should come from the table');
    if (!validateReceipt(r, s).ok) bad.push('validator refused the honest receipt');
    const unruled = ctxOf((x) => {
      x.dispositions.ruled = false;
      for (const id of ensureGapIds(x.dispositions, 1)) setGap(x.dispositions, id, false);
    });
    if (build(unruled, { gapPolicy: 'notRun' }).verdict !== 'PROVISIONAL') bad.push('the same table unruled is not PROVISIONAL');
    return bad.length ? fail(bad.join('; ')) : pass(`${r.tableBlockers.length} table blocker(s); same table unruled is PROVISIONAL`);
  });

  check('a run with no results at all: every BLOCKER is BLOCKING_NOT_RUN, every gap is NOT_RUN, verdict NOT_READY', () => {
    const s = ctxOf(() => {});
    const r = buildReceipt({ index: s.index, dispositions: s.dispositions, results: [] });
    const bids = blockerIds(s).length;
    const gaps = s.index.obligations.length - bids;
    const bad = [];
    if (r.verdict !== 'NOT_READY') bad.push(`verdict ${r.verdict}`);
    if (r.counts.byVerdict.BLOCKING_NOT_RUN !== bids) bad.push('BLOCKING_NOT_RUN count differs from the number of BLOCKERs');
    if (r.counts.byVerdict.NOT_RUN !== gaps) bad.push('NOT_RUN count differs from the number of DECLARED_GAPs');
    if (r.counts.byVerdict.PASS !== 0) bad.push('a pass appeared from nothing');
    if (!validateReceipt(r, s).ok) bad.push('validator refused');
    return bad.length ? fail(bad.join('; ')) : pass(`${bids} BLOCKING_NOT_RUN, ${gaps} NOT_RUN, 0 PASS`);
  });

  check('real-KMS rule on the real index: a PASS on a requiresRealKms obligation with realKms=false is INVALID_EVIDENCE and blocks', () => {
    const s = ctxOf(() => {});
    const target = s.index.obligations.find((o) => o.requiresRealKms);
    const results = syntheticResults(s.index, s.dispositions).map((r) => (r.id === target.id ? { ...r, realKms: false } : r));
    const r = buildReceipt({ index: s.index, dispositions: s.dispositions, results });
    const e = r.entries.find((x) => x.id === target.id);
    return e.verdict === 'INVALID_EVIDENCE' && e.blocking && r.verdict === 'NOT_READY' && validateReceipt(r, s).ok ? pass(`${target.id} -> INVALID_EVIDENCE, NOT_READY`) : fail(`${e.verdict} ${r.verdict}`);
  });

  /* ---- 4b. the repaired defects, each shown to fail on the behaviour it replaces ---- */
  const bothBlockers = () => ({ ruled: false, dispositions: { 'T-1': { disposition: 'BLOCKER', gap: null }, 'T-2': { disposition: 'BLOCKER', gap: null } } });

  // D1: what counts as evidence
  const verdictOfEvidence = (items, over = {}) => {
    const r = buildReceipt({ index: twoIndex(), dispositions: bothBlockers(), results: [{ id: 'T-1', status: 'PASS', environment: 'E1', realKms: false, evidence: items, ...over }], header: measuredHeader });
    return r.entries[0].verdict;
  };

  check('evidence qualification, one field at a time: kind vocabulary, ref binding to this obligation only, summary content and length', () => {
    const ok = measuredItem('T-1');
    const withSummary = (summary) => ({ ...ok, summary });
    const withRef = (ref) => ({ ...ok, ref });
    const withKind = (kind) => ({ ...ok, kind });
    const PASS = 'PASS';
    const NO = 'INVALID_EVIDENCE';
    const cases = [
      ['the baseline item', [ok], PASS],
      ['no evidence', [], NO],
      ['kind blank', [withKind('')], NO],
      ['kind whitespace', [withKind('  ')], NO],
      ['kind outside the vocabulary', [withKind('vibes')], NO],
      ['kind named like an Object.prototype member', [withKind('constructor')], NO],
      ['kind __proto__', [withKind('__proto__')], NO],
      ['kind in a different case', [withKind('Assertion')], NO],
      ['an exit code alone', [withKind('exit-code')], NO],
      ['several exit codes with different refs', [withKind('exit-code'), { ...withKind('exit-code'), ref: 'jest/T-1/b' }, { ...withKind('exit-code'), ref: 'jest/T-1/c' }], NO],
      ['an exit code beside a measured item', [withKind('exit-code'), ok], PASS],
      ['ref blank', [withRef('')], NO],
      ['ref whitespace', [withRef('   ')], NO],
      ['ref names no obligation', [withRef('jest')], NO],
      ['ref names a longer id that starts with this one', [withRef('probe/T-10')], NO],
      ['ref has the id at the end of a longer token', [withRef('probe/xT-1')], NO],
      ['ref has the id at the start of a longer token', [withRef('probe/T-1x')], NO],
      ['ref is exactly the id', [withRef('T-1')], PASS],
      ['ref names the id with separators around it', [withRef('probe/T-1#2')], PASS],
      ['ref names this id and another indexed id', [withRef('probe/T-1+T-2')], NO],
      ['ref names only another indexed id', [withRef('probe/T-2')], NO],
      ['summary blank', [withSummary('')], NO],
      ['summary whitespace', [withSummary('        ')], NO],
      ['summary TBD', [withSummary('TBD')], NO],
      ['summary TBD padded to length', [withSummary('result: TBD for now')], NO],
      ['summary TODO', [withSummary('todo: write the assertion')], NO],
      ['summary "to be determined"', [withSummary('result to be determined later')], NO],
      ['summary an angle-bracket placeholder', [withSummary('<result>')], NO],
      ['summary only question marks', [withSummary('????????')], NO],
      ['summary only punctuation', [withSummary('........')], NO],
      ['summary "all tests passed"', [withSummary('all tests passed')], NO],
      ['summary "everything verified and done"', [withSummary('verified and done')], NO],
      ['summary of seven characters', [withSummary('abcd ef')], NO],
      ['summary of eight characters', [withSummary('abcd efg')], PASS],
      ['summary that is a bare measurement', [withSummary('12345678')], PASS],
      ['generic words made specific by a number', [withSummary('all 12 tests passed')], PASS],
      ['a good item beside a blank one', [{ kind: '', ref: '', summary: '' }, ok], PASS],
      ['a good item beside one with a blank summary only', [withSummary(''), { ...ok, ref: 'probe/T-1/b' }], PASS],
      ['two identical good items', [ok, { ...ok }], PASS],
    ];
    for (const kind of Object.keys(EVIDENCE_KINDS).filter((k) => EVIDENCE_KINDS[k] !== 'context')) cases.push([`kind ${kind} discharges`, [withKind(kind)], PASS]);
    for (const w of GENERIC_WORDS) cases.push([`summary made only of the generic word "${w}"`, [withSummary(Array(8).fill(w).join(' '))], NO]);
    cases.push(['generic words plus one specific word', [withSummary('all tests passed cleanly')], PASS]);
    const wrongOnes = cases.map(([label, items, want]) => [label, verdictOfEvidence(items), want]).filter(([, got, want]) => got !== want);
    // The generic-word list is a policy, not an accident: it is pinned here by an independent copy, so editing it is a deliberate act.
    const pinnedGeneric = 'a all and checked confirmed done fine good green is it n na nil no none null ok okay pass passed passes pending success successful test tests true undefined unknown unset verified works worked working x yes'.split(' ');
    if ([...GENERIC_WORDS].sort().join(' ') !== [...pinnedGeneric].sort().join(' ')) wrongOnes.push(['the generic-word list', 'changed', 'pinned']);
    return wrongOnes.length ? fail(wrongOnes.map(([l, g, w]) => `${l}: got ${g}, want ${w}`).join('; ')) : pass(`${cases.length} single-field variations each gave the expected verdict; the generic-word list is pinned`);
  });

  check('evidence is surfaced as counts: distinct items, measured vs synthetic, distinct refs; a synthetic: ref makes any kind synthetic', () => {
    const ok = measuredItem('T-1');
    const r = buildReceipt({
      index: twoIndex(),
      dispositions: bothBlockers(),
      results: [
        { id: 'T-1', status: 'PASS', environment: 'E1', realKms: false, evidence: [ok, { ...ok }, { ...ok, ref: 'probe/T-1/b' }, { kind: 'exit-code', ref: 'jest/T-1', summary: 'exit code 0 for the run' }, { kind: 'synthetic-check', ref: 'synthetic:T-1', summary: 'fictional check ran; assertions=3' }] },
        { id: 'T-2', status: 'PASS', environment: 'E1', realKms: false, evidence: [{ kind: 'assertion', ref: 'synthetic:T-2', summary: 'fictional measured assertion; assertions=3' }] },
      ],
      header: measuredHeader,
    });
    const ev = r.counts.evidence;
    const want = { qualifying: 4, measured: 2, synthetic: 2, distinctRefs: 4, syntheticOnlyPasses: 1 };
    const wrongOnes = Object.keys(want).filter((k) => ev[k] !== want[k]);
    return wrongOnes.length ? fail(`counts.evidence ${JSON.stringify(ev)}, want ${JSON.stringify(want)}`) : pass(JSON.stringify(ev));
  });

  check('the legacy one-exit-code receipt cannot be rebuilt on the real tables (one identical triple on every obligation, placeholder gap text, sealed ruling): NOT_READY, zero PASS', () => {
    const t = loadSuiteData();
    for (const o of t.index.obligations) if (t.dispositions.dispositions[o.id].disposition === 'DECLARED_GAP') t.dispositions.dispositions[o.id].gap = Object.fromEntries(GAP_FIELDS.map((f) => [f, 'TBD']));
    rule(t.dispositions, t.index);
    const all = t.index.obligations.length;
    const run = (evidenceOf) =>
      buildReceipt({
        index: t.index,
        dispositions: t.dispositions,
        results: t.index.obligations.map((o) => ({ id: o.id, status: 'PASS', environment: 'E0', realKms: true, realVault: true, browser: true, evidence: evidenceOf(o) })),
        header: measuredHeader,
      });
    const triple = [{ kind: 'exit-code', ref: 'jest', summary: 'exit 0' }];
    const oneTriple = run(() => triple);
    const oneArtifact = run(() => [{ kind: 'assertion', ref: `run-1 covers ${t.index.obligations.map((o) => o.id).join(' ')}`, summary: 'one artifact cited for every obligation' }]);
    const sharedRef = run(() => [{ kind: 'assertion', ref: 'jest/run-1', summary: 'one artifact cited for every obligation' }]);
    const bad = [];
    for (const [label, r] of [['one exit-code triple', oneTriple], ['one artifact naming every id', oneArtifact], ['one ref naming no id', sharedRef]]) {
      if (r.verdict !== 'NOT_READY') bad.push(`${label}: ${r.verdict}`);
      if (r.counts.byVerdict.PASS !== 0 || r.counts.byVerdict.INVALID_EVIDENCE !== all) bad.push(`${label}: PASS=${r.counts.byVerdict.PASS} INVALID_EVIDENCE=${r.counts.byVerdict.INVALID_EVIDENCE}`);
      if (r.counts.evidence.qualifying !== 0) bad.push(`${label}: ${r.counts.evidence.qualifying} qualifying items`);
      if (!r.tableBlockers.some((b) => b.code === 'NO_PASSING_BLOCKER')) bad.push(`${label}: no NO_PASSING_BLOCKER table blocker`);
      if (!validateReceipt(r, t).ok) bad.push(`${label}: the validator refused the honest receipt`);
    }
    if (!oneTriple.entries.filter((e) => e.gap !== null).every((e) => GAP_FIELDS.every((f) => e.gap[f] === false))) bad.push('placeholder gap text was counted as a complete record');
    const control = run((o) => [{ kind: 'assertion', ref: `probe/${o.id}`, summary: 'a distinct bound item per obligation' }]);
    if (control.counts.byVerdict.PASS !== all || control.counts.evidence.distinctRefs !== all) bad.push(`control: PASS=${control.counts.byVerdict.PASS} distinctRefs=${control.counts.evidence.distinctRefs}`);
    return bad.length ? fail(bad.join('; ')) : pass(`${all} obligations: three legacy-shaped runs NOT_READY with 0 PASS; per-obligation bound evidence passes all ${all} (control)`);
  });

  // D1: placeholder gap text
  const gapOutcome = (gap) => {
    const idx = twoIndex();
    const disp = { ruled: false, dispositions: { 'T-1': { disposition: 'DECLARED_GAP', gap }, 'T-2': { disposition: 'BLOCKER', gap: null } } };
    const r = buildReceipt({ index: idx, dispositions: disp, results: [runOf('T-1', 'FAIL'), runOf('T-2', 'PASS')], header: measuredHeader });
    return { verdict: r.entries[0].verdict, flags: r.entries[0].gap };
  };

  check('gap records: placeholder, blank, generic, too-short and duplicated text is not a complete record; boundary lengths are exact', () => {
    const good = syntheticGap();
    const bad = [];
    if (gapOutcome(good).verdict !== 'ACCEPTED_GAP') bad.push('the complete control record was not ACCEPTED_GAP');
    const placeholders = [null, undefined, '', '   ', 42, 'TBD', 'tbd', 'TODO', 'N/A', 'n/a', 'None', 'unknown', 'Pending', 'to be determined', '<owner>', '???', 'Lorem ipsum dolor sit amet', 'xxx xxx xxx xxx xxx'];
    for (const f of GAP_FIELDS) {
      for (const v of placeholders) {
        const o = gapOutcome({ ...good, [f]: v });
        if (o.verdict !== 'GAP_UNDECLARED') bad.push(`${f}=${JSON.stringify(v)} -> ${o.verdict}`);
        else if (o.flags[f] !== false || GAP_FIELDS.some((g) => g !== f && o.flags[g] !== true)) bad.push(`${f}=${JSON.stringify(v)} flagged the wrong fields`);
      }
    }
    const complete = (g) => gapOutcome(g).verdict === 'ACCEPTED_GAP';
    if (complete({ ...good, owner: 'Ke' })) bad.push('a 2-character owner was accepted');
    if (!complete({ ...good, owner: 'Kel' })) bad.push('a 3-character owner was refused');
    for (const f of ['memberFacingSentence', 'closureCondition', 'registerLine']) {
      if (complete({ ...good, [f]: 'abcd efgh ijkl mnop' })) bad.push(`${f}: 19 characters in 4 words was accepted`);
      if (!complete({ ...good, [f]: 'abcd efgh ijkl mnopq' })) bad.push(`${f}: 20 characters in 4 words was refused`);
      if (complete({ ...good, [f]: 'abcdefgh ijklmnopq rstuvwxy' })) bad.push(`${f}: 3 long words was accepted`);
      if (!complete({ ...good, [f]: 'None of the members are affected by this gap yet' })) bad.push(`${f}: a sentence that merely contains the word none was refused`);
    }
    const dup = gapOutcome({ ...good, closureCondition: `  ${good.memberFacingSentence.toUpperCase()}  ` });
    if (dup.verdict !== 'GAP_UNDECLARED' || dup.flags.closureCondition !== false || dup.flags.memberFacingSentence !== false || dup.flags.owner !== true || dup.flags.registerLine !== true) bad.push(`two fields saying the same thing -> ${dup.verdict} ${JSON.stringify(dup.flags)}`);
    return bad.length ? fail(`${bad.length} problem(s): ${bad.slice(0, 4).join(' | ')}`) : pass(`${placeholders.length * GAP_FIELDS.length} placeholder variants refused field by field; length boundaries and duplicate rule exact`);
  });

  // D2: tables, digests, ruling, pin
  check('table digest: format, determinism, key-order independence, sensitivity to every part of both tables, blindness to ruled / basis / ruling', () => {
    const t = loadSuiteData();
    const d0 = computeTableDigest(t.index, t.dispositions);
    const fmt = /^sha256:([0-9a-f]{8}-){7}[0-9a-f]{8}$/;
    const bad = [];
    if (!fmt.test(d0.index) || !fmt.test(d0.dispositions) || d0.index === d0.dispositions) bad.push('format or distinctness');
    if (JSON.stringify(computeTableDigest(clone(t.index), clone(t.dispositions))) !== JSON.stringify(d0)) bad.push('not deterministic');
    const flip = (o) => Object.fromEntries(Object.entries(o).reverse());
    const reordered = computeTableDigest({ ...flip(t.index), obligations: t.index.obligations.map(flip) }, { dispositions: Object.fromEntries(Object.entries(t.dispositions.dispositions).reverse().map(([k, v]) => [k, flip(v)])) });
    if (JSON.stringify(reordered) !== JSON.stringify(d0)) bad.push('key order changed a digest');
    const gapId = Object.keys(t.dispositions.dispositions).find((k) => t.dispositions.dispositions[k].disposition === 'DECLARED_GAP');
    const blockerId = Object.keys(t.dispositions.dispositions).find((k) => t.dispositions.dispositions[k].disposition === 'BLOCKER');
    const changes = [
      ['index: an obligation removed', (x) => x.index.obligations.pop(), 'index'],
      ['index: obligations reordered', (x) => x.index.obligations.reverse(), 'index'],
      ['index: a title edited', (x) => { x.index.obligations[0].title += ' '; }, 'index'],
      ['index: requiresRealVault flipped', (x) => { x.index.obligations[0].requiresRealVault = !x.index.obligations[0].requiresRealVault; }, 'index'],
      ['index: a dependsOn edited', (x) => { x.index.obligations[0].dependsOn = [...x.index.obligations[0].dependsOn, 'X-1']; }, 'index'],
      ['index: a top-level field added', (x) => { x.index.note = 'x'; }, 'index'],
      ['dispositions: a BLOCKER relabelled', (x) => { x.dispositions.dispositions[blockerId].disposition = 'DECLARED_GAP'; }, 'dispositions'],
      ['dispositions: a gap text edited', (x) => { x.dispositions.dispositions[gapId].gap.owner = 'An Owner'; }, 'dispositions'],
      ['dispositions: an entry removed', (x) => { delete x.dispositions.dispositions[blockerId]; }, 'dispositions'],
    ];
    for (const [label, edit, which] of changes) {
      const x = loadSuiteData();
      edit(x);
      const d = computeTableDigest(x.index, x.dispositions);
      const other = which === 'index' ? 'dispositions' : 'index';
      if (d[which] === d0[which]) bad.push(`${label}: the ${which} digest did not move`);
      if (d[other] !== d0[other]) bad.push(`${label}: the ${other} digest moved too`);
    }
    for (const [label, edit] of [['ruled flipped', (x) => { x.dispositions.ruled = !x.dispositions.ruled; }], ['basis edited', (x) => { x.dispositions.basis = 'edited'; }], ['ruling added', (x) => { x.dispositions.ruling = { ref: 'ANY-RULING' }; }]]) {
      const x = loadSuiteData();
      edit(x);
      if (JSON.stringify(computeTableDigest(x.index, x.dispositions)) !== JSON.stringify(d0)) bad.push(`${label}: moved a digest (it must not: the ruling cannot hash itself)`);
    }
    if (!throwsWith(() => computeTableDigest({ obligations: [() => 1] }, { dispositions: {} }), ReceiptInputError, 'BAD_DISPOSITIONS').ok) bad.push('non-JSON data was digested');
    if (JSON.stringify(buildReceipt({ index: t.index, dispositions: t.dispositions, results: [] }).tableDigest) !== JSON.stringify(d0)) bad.push('the receipt carries a different digest than computeTableDigest');
    return bad.length ? fail(bad.join('; ')) : pass(`${changes.length} edits each moved only their own digest; key order and the ruling fields move nothing`);
  });

  check('ruling: ruled=true is unreadable without a ruling reference and a seal over exactly these tables; every later edit un-seals it; sealRuling bounds are exact', () => {
    const bad = [];
    const attempt = (x) => throwsWith(() => buildReceipt({ index: x.index, dispositions: x.dispositions, results: [] }), ReceiptInputError, 'BAD_DISPOSITIONS').ok;
    const sealed = () => {
      const x = loadSuiteData();
      rule(x.dispositions, x.index);
      return x;
    };
    const said = (x) => {
      try {
        buildReceipt({ index: x.index, dispositions: x.dispositions, results: [] });
        return '';
      } catch (e) {
        return String(e && e.message);
      }
    };
    const unsealed = loadSuiteData();
    unsealed.dispositions.ruled = true;
    if (!attempt(unsealed)) bad.push('a bare ruled=true was readable');
    if (!said(unsealed).includes('ruled is true but there is no ruling reference')) bad.push('the refusal of a bare ruled=true does not say why');
    const forgedSeal = sealed();
    forgedSeal.index.obligations[0].title += ' ';
    if (!said(forgedSeal).includes('ruled is true but the ruling seal does not match')) bad.push('the refusal of an un-sealed ruling does not say why');
    const noRef = sealed();
    delete noRef.dispositions.ruling.ref;
    if (!attempt(noRef)) bad.push('a seal with no reference was readable');
    for (const ref of ['ab', 'has space', 'x'.repeat(65), '-leading', 'slash/ref', 7, null, '']) {
      const x = sealed();
      x.dispositions.ruling.ref = ref;
      if (!attempt(x)) bad.push(`ruling reference ${JSON.stringify(ref)} was readable`);
    }
    const intact = sealed();
    const built = buildReceipt({ index: intact.index, dispositions: intact.dispositions, results: [] });
    if (built.ruled !== true || built.ruling.ref !== SELFTEST_RULING_REF) bad.push('the sealed ruling was not recorded in the receipt');
    const afterwards = [
      ['an index title edited', (x) => { x.index.obligations[0].title += ' '; }],
      ['an obligation removed from both tables', (x) => { const id = x.index.obligations.pop().id; delete x.dispositions.dispositions[id]; x.index.count -= 1; }],
      ['a BLOCKER relabelled', (x) => { x.dispositions.dispositions[Object.keys(x.dispositions.dispositions)[0]] = { disposition: 'DECLARED_GAP', gap: null }; }],
      ['a gap text edited', (x) => { const id = Object.keys(x.dispositions.dispositions).find((k) => x.dispositions.dispositions[k].disposition === 'DECLARED_GAP'); x.dispositions.dispositions[id].gap.owner = 'An Owner'; }],
      ['the two sealed digests swapped', (x) => { const d = x.dispositions.ruling.tableDigest; [d.index, d.dispositions] = [d.dispositions, d.index]; }],
      ['the seal removed', (x) => { delete x.dispositions.ruling.tableDigest; }],
      ['the ruling replaced by a string', (x) => { x.dispositions.ruling = 'SELFTEST-RULING-1'; }],
    ];
    for (const [label, edit] of afterwards) {
      const x = sealed();
      edit(x);
      if (!attempt(x)) bad.push(`${label}: still readable as ruled`);
      const v = validateReceipt(built, x);
      if (v.ok || !v.codes.includes('CONTEXT_INVALID')) bad.push(`${label}: the validator did not refuse the context (${v.codes})`);
    }
    const harmless = sealed();
    harmless.dispositions.basis = 'a different note';
    harmless.dispositions.extra = 'a field outside the hash';
    if (!validateReceipt(built, harmless).ok) bad.push('editing basis or an unhashed top-level field un-sealed the ruling');
    const seal = (ref) => sealRuling(loadSuiteData().dispositions, loadSuiteData().index, ref);
    for (const ref of ['ab', 'x'.repeat(65), 'has space', '', 7, null, undefined]) if (!throwsWith(() => seal(ref), ReceiptInputError, 'BAD_RULING').ok) bad.push(`sealRuling accepted ${JSON.stringify(ref)}`);
    for (const ref of ['abc', 'x'.repeat(64), 'A.b_c:d-e']) if (throwsWith(() => seal(ref), ReceiptInputError).ok) bad.push(`sealRuling refused ${ref.length} characters`);
    return bad.length ? fail(`${bad.length} problem(s): ${bad.slice(0, 4).join(' | ')}`) : pass(`unsealed and ${afterwards.length} post-seal edits refused by builder and validator; basis edits harmless; reference bounds 3..64`);
  });

  check('pin: a matching pin is accepted by builder and validator; a mismatching or malformed pin is refused by both', () => {
    const t = loadSuiteData();
    const pin = computeTableDigest(t.index, t.dispositions);
    const bad = [];
    const r = buildReceipt({ index: t.index, dispositions: t.dispositions, results: [], pin });
    if (!validateReceipt(r, { index: t.index, dispositions: t.dispositions, pin }).ok) bad.push('a matching pin was refused by the validator');
    for (const [label, p] of [['index digest differs', { ...pin, index: pin.dispositions }], ['dispositions digest differs', { ...pin, dispositions: pin.index }]]) {
      if (!throwsWith(() => buildReceipt({ index: t.index, dispositions: t.dispositions, results: [], pin: p }), ReceiptInputError, 'TABLE_PIN_MISMATCH').ok) bad.push(`builder: ${label}`);
      const v = validateReceipt(r, { index: t.index, dispositions: t.dispositions, pin: p });
      if (v.ok || !v.codes.includes('TABLE_DIGEST_MISMATCH')) bad.push(`validator: ${label} (${v.codes})`);
    }
    for (const p of ['sha256:abc', null, { index: pin.index }, { ...pin, extra: 'x' }, { index: 1, dispositions: 2 }, []]) {
      if (!throwsWith(() => buildReceipt({ index: t.index, dispositions: t.dispositions, results: [], pin: p }), ReceiptInputError, 'BAD_PIN').ok) bad.push(`builder accepted pin ${JSON.stringify(p)}`);
      const v = validateReceipt(r, { index: t.index, dispositions: t.dispositions, pin: p });
      if (v.ok || !v.codes.includes('CONTEXT_INVALID')) bad.push(`validator accepted pin ${JSON.stringify(p)}`);
    }
    return bad.length ? fail(bad.join('; ')) : pass('match accepted; 2 mismatches and 6 malformed pins refused by both');
  });

  check('floor: a ruled table in which no BLOCKER passed is NOT_READY with a table blocker; one passing BLOCKER lifts it; unruled it is only PROVISIONAL', () => {
    const idx = twoIndex();
    const bad = [];
    const allGaps = () => ({ ruled: false, dispositions: { 'T-1': { disposition: 'DECLARED_GAP', gap: syntheticGap() }, 'T-2': { disposition: 'DECLARED_GAP', gap: { ...syntheticGap(), owner: 'Another Owner' } } } });
    const build2 = (disp, ruled, results) => {
      const d = ruled ? rule(disp, idx) : disp;
      const r = buildReceipt({ index: idx, dispositions: d, results, header: measuredHeader });
      if (!validateReceipt(r, { index: idx, dispositions: d }).ok) bad.push('the validator refused an honest receipt');
      return r;
    };
    const failing = build2(allGaps(), true, [runOf('T-1', 'FAIL'), runOf('T-2', 'FAIL')]);
    if (failing.verdict !== 'NOT_READY' || JSON.stringify(failing.tableBlockers) !== JSON.stringify([{ id: '<table>', code: 'NO_PASSING_BLOCKER' }]) || failing.counts.tableBlockers !== 1) bad.push(`all gaps failing, ruled -> ${failing.verdict} ${JSON.stringify(failing.tableBlockers)}`);
    const passing = build2(allGaps(), true, [runOf('T-1', 'PASS'), runOf('T-2', 'PASS')]);
    if (passing.verdict !== 'NOT_READY' || passing.tableBlockers.length !== 1) bad.push(`all gaps passing but no BLOCKER, ruled -> ${passing.verdict}`);
    const unruled = build2(allGaps(), false, [runOf('T-1', 'FAIL'), runOf('T-2', 'FAIL')]);
    if (unruled.verdict !== 'PROVISIONAL' || unruled.tableBlockers.length !== 0) bad.push(`the same table unruled -> ${unruled.verdict}`);
    const oneBlocker = () => ({ ruled: false, dispositions: { 'T-1': { disposition: 'DECLARED_GAP', gap: syntheticGap() }, 'T-2': { disposition: 'BLOCKER', gap: null } } });
    const lifted = build2(oneBlocker(), true, [runOf('T-1', 'FAIL'), runOf('T-2', 'PASS')]);
    if (lifted.verdict !== 'STEP4_READY' || lifted.tableBlockers.length !== 0) bad.push(`one passing BLOCKER, ruled -> ${lifted.verdict}`);
    const blockerFails = build2(oneBlocker(), true, [runOf('T-1', 'FAIL'), runOf('T-2', 'FAIL')]);
    if (blockerFails.verdict !== 'NOT_READY' || !blockerFails.tableBlockers.some((b) => b.code === 'NO_PASSING_BLOCKER')) bad.push(`the BLOCKER failing -> ${blockerFails.verdict}`);
    return bad.length ? fail(bad.join('; ')) : pass('5 sealed/unsealed tables behave as specified');
  });

  // D6: guards on the reference data and on messages, each shown to fail
  check('index guards: every malformed shape of the index is refused with BAD_INDEX (not a crash, not a later error)', () => {
    const ob = { id: 'T-1', category: 'synthetic', requiresRealKms: false };
    const attempt = (index) => throwsWith(() => buildReceipt({ index, dispositions: tinyDisp(), results: [] }), ReceiptInputError, 'BAD_INDEX').ok;
    const cases = [
      ['index is null', null], ['index is a string', 'x'], ['index is an array', []], ['obligations is a string', { obligations: 'x' }], ['obligations is missing', {}],
      ['an obligation is null', { obligations: [null] }], ['an obligation is a string', { obligations: ['T-1'] }], ['an obligation is an array', { obligations: [[ob]] }],
      ['an id is missing', { obligations: [{ ...ob, id: undefined }] }], ['an id is a number', { obligations: [{ ...ob, id: 1 }] }], ['an id is empty', { obligations: [{ ...ob, id: '' }] }],
      ['an id is repeated', { obligations: [ob, { ...ob }] }],
      ['requiresRealKms is missing', { obligations: [{ id: 'T-1', category: 'synthetic' }] }], ['requiresRealKms is a string', { obligations: [{ ...ob, requiresRealKms: 'no' }] }],
      ['category is missing', { obligations: [{ id: 'T-1', requiresRealKms: false }] }], ['category is a number', { obligations: [{ ...ob, category: 7 }] }],
      ['count disagrees', { count: 2, obligations: [ob] }],
    ];
    const accepted = cases.filter(([, index]) => !attempt(index)).map(([label]) => label);
    return accepted.length ? fail(`not refused with BAD_INDEX: ${accepted.join('; ')}`) : pass(`${cases.length} malformed indexes each refused`);
  });

  check('disposition table guards: a non-object gap on a DECLARED_GAP is refused, anything on a BLOCKER is ignored, null / absent / empty gaps are an incomplete record', () => {
    const refused = (entry) => throwsWith(() => buildReceipt({ index: tinyIndex(), dispositions: { ruled: false, dispositions: { 'T-1': entry } }, results: [] }), ReceiptInputError, 'BAD_DISPOSITIONS').ok;
    const bad = [];
    for (const gap of ['yes', 7, true, [], ['a']]) if (!refused({ disposition: 'DECLARED_GAP', gap })) bad.push(`DECLARED_GAP gap ${JSON.stringify(gap)} was accepted`);
    for (const gap of [null, undefined, {}]) if (refused({ disposition: 'DECLARED_GAP', gap })) bad.push(`DECLARED_GAP gap ${String(gap)} was refused`);
    for (const gap of ['yes', 7, [], null, {}]) if (refused({ disposition: 'BLOCKER', gap })) bad.push(`BLOCKER gap ${JSON.stringify(gap)} was refused`);
    for (const entry of [null, 'BLOCKER', {}, { disposition: 'MAYBE' }, { disposition: 'blocker' }]) if (!refused(entry)) bad.push(`disposition entry ${JSON.stringify(entry)} was accepted`);
    for (const gap of [undefined, null, {}]) {
      const o = gapOutcome(gap);
      if (o.verdict !== 'GAP_UNDECLARED' || GAP_FIELDS.some((f) => o.flags[f] !== false)) bad.push(`an absent gap (${String(gap)}) was not an incomplete record`);
    }
    return bad.length ? fail(`${bad.length} problem(s): ${bad.slice(0, 4).join(' | ')}`) : pass('gap shapes and disposition entries each handled as specified');
  });

  check('canonical JSON for the digests: depth limit exact, non-plain data refused, null-prototype objects and JSON-style undefined handled', () => {
    const nest = (n) => {
      let v = 'x';
      for (let i = 0; i < n; i++) v = [v];
      return v;
    };
    const digest = (index, dispositions) => computeTableDigest(index, { dispositions });
    const bad = [];
    const refuses = (fn) => throwsWith(fn, ReceiptInputError, 'BAD_DISPOSITIONS').ok;
    if (refuses(() => digest({ obligations: [], deep: nest(39) }, {}))) bad.push('index nested 39 levels was refused');
    if (!refuses(() => digest({ obligations: [], deep: nest(40) }, {}))) bad.push('index nested 40 levels was accepted');
    if (refuses(() => digest({ obligations: [] }, { a: { b: nest(38) } }))) bad.push('dispositions nested 38 levels were refused');
    if (!refuses(() => digest({ obligations: [] }, { a: { b: nest(39) } }))) bad.push('dispositions nested 39 levels were accepted');
    class Box {}
    for (const [label, v] of [['Map', new Map()], ['Set', new Set()], ['Date', new Date(0)], ['class instance', new Box()], ['function', () => 1], ['NaN', NaN], ['Infinity', Infinity], ['bigint', 1n], ['Buffer', Buffer.from('x')]]) {
      if (!refuses(() => digest({ obligations: [], v }, {}))) bad.push(`${label} in the index was digested`);
    }
    const plain = digest({ obligations: [], v: { a: 1 } }, {});
    const nullProto = digest({ obligations: [], v: Object.assign(Object.create(null), { a: 1 }) }, {});
    if (plain.index !== nullProto.index) bad.push('a null-prototype object digested differently from a plain one');
    if (digest({ obligations: [], a: 1, b: undefined }, {}).index !== digest({ obligations: [], a: 1 }, {}).index) bad.push('an undefined property was not treated as absent');
    if (digest({ obligations: [], v: [1, undefined] }, {}).index !== digest({ obligations: [], v: [1, null] }, {}).index) bad.push('an undefined array element was not treated as null');
    if (digest({ obligations: [], v: [1, 2] }, {}).index === digest({ obligations: [], v: [2, 1] }, {}).index) bad.push('array order did not matter to the digest');
    if (!refuses(() => computeTableDigest({ obligations: [] }, null)) || !refuses(() => computeTableDigest({ obligations: [] }, {}))) bad.push('a missing disposition table was digested');
    return bad.length ? fail(bad.join('; ')) : pass('depth 39/40 and 38/39 boundaries, 9 non-plain values refused, undefined handled as in JSON');
  });

  check('problem messages: vocabulary values and ids are named only in their allowed shape, and a leaking entry is labelled by its obligation id, never by a non-conforming id', () => {
    const f = fresh({ measured: true });
    const base = clone(f.receipt);
    const bad = [];
    const someBlocker = (r) => r.entries.find((x) => x.disposition === 'BLOCKER' && x.verdict === 'PASS');
    const r1 = clone(base);
    someBlocker(r1).disposition = 'DECLARED_GAP';
    if (!validateReceipt(r1, f).problems.some((m) => m.startsWith('DISPOSITION_MISMATCH') && m.includes('receipt says DECLARED_GAP'))) bad.push('a valid-but-wrong disposition was not named');
    const r2 = clone(base);
    someBlocker(r2).disposition = 'MAYBE-BLOCKER';
    const m2 = validateReceipt(r2, f).problems.filter((m) => m.startsWith('DISPOSITION_MISMATCH'));
    if (!m2.some((m) => m.includes('receipt says <invalid>')) || m2.some((m) => m.includes('MAYBE'))) bad.push('an out-of-vocabulary disposition was echoed');
    const r3 = clone(base);
    const e3 = someBlocker(r3);
    e3.verdict = 'INVALID_EVIDENCE';
    if (!validateReceipt(r3, f).problems.some((m) => m.startsWith('ENTRY_VERDICT_MISMATCH') && m.includes(`${e3.id}: recorded INVALID_EVIDENCE, re-derived PASS`))) bad.push('a recorded verdict was not named beside the re-derived one');
    const r4 = clone(base);
    const e4 = r4.entries[3];
    e4.evidence = [{ kind: 'k', ref: 'r', summary: crypto.randomUUID() }];
    if (!validateReceipt(r4, f).problems.some((m) => m.includes(`entries[${e4.id}].evidence[0].summary`))) bad.push('a leak in an entry was not labelled by the obligation id');
    const r5 = clone(base);
    const stray = `${DEFAULT_CANARY_PREFIX}${hex8U()}`;
    r5.entries[3].id = stray;
    r5.entries[3].evidence = [{ kind: 'k', ref: 'r', summary: crypto.randomUUID() }];
    const v5 = validateReceipt(r5, f);
    if (JSON.stringify(v5).includes(stray) || !v5.problems.some((m) => m.includes('entries[3].evidence[0].summary'))) bad.push('a non-conforming id was echoed, or the entry was not labelled by position');
    const r6 = clone(base);
    r6.entries = { 0: r6.entries[0] };
    const v6 = validateReceipt(r6, f);
    if (v6.ok || v6.codes.includes('VALIDATOR_EXCEPTION')) bad.push(`entries as an object was not diagnosed (${v6.codes})`);
    const says = (r, code, text) => validateReceipt(r, f).problems.some((m) => m.startsWith(code) && m.includes(text));
    const r7 = clone(base);
    r7.expectedEntries = 5;
    const r8 = clone(base);
    r8.expectedEntries = stray;
    if (!says(r7, 'EXPECTED_ENTRIES_MISMATCH', 'expectedEntries is 5,')) bad.push('a numeric expectedEntries was not named');
    if (!says(r8, 'EXPECTED_ENTRIES_MISMATCH', 'expectedEntries is <non-number>,') || JSON.stringify(validateReceipt(r8, f)).includes(stray)) bad.push('a non-numeric expectedEntries was echoed');
    const kmsId = base.entries.find((x) => x.requiresRealKms).id;
    const vaultId = base.entries.find((x) => x.requiresRealVault).id;
    const browserId = base.entries.find((x) => x.requiresBrowser).id;
    const r9 = clone(base);
    r9.entries.find((x) => x.id === kmsId).requiresRealKms = false;
    r9.entries.find((x) => x.id === vaultId).requiresRealVault = false;
    r9.entries.find((x) => x.id === browserId).requiresBrowser = false;
    if (!says(r9, 'REQUIRES_REAL_KMS_MISMATCH', `${kmsId}: receipt says false, the index says true`)) bad.push('the real-KMS mismatch message is wrong');
    if (!says(r9, 'REQUIRES_REAL_VAULT_MISMATCH', `${vaultId}: receipt says false, the index says true`)) bad.push('the real-vault mismatch message is wrong');
    if (!says(r9, 'REQUIRES_BROWSER_MISMATCH', `${browserId}: receipt says false, the index says true`)) bad.push('the browser mismatch message is wrong');
    const r10 = clone(base);
    r10.counts.entries = 3;
    const r11 = clone(base);
    r11.counts.entries = stray;
    if (!says(r10, 'COUNTS_MISMATCH', `counts.entries: recorded 3, re-derived ${base.entries.length}`)) bad.push('a numeric count mismatch was not named');
    if (!says(r11, 'COUNTS_MISMATCH', 'counts.entries: recorded <absent or non-number>') || JSON.stringify(validateReceipt(r11, f)).includes(stray)) bad.push('a non-numeric count was echoed');
    return bad.length ? fail(bad.join('; ')) : pass('11 message and label properties hold');
  });

  check('evidence counting survives malformed lies: bad items are not counted and never throw; a PASS with no evidence is not synthetic-only', () => {
    const f = fresh({ measured: true });
    const ids = f.index.obligations.map((o) => o.id);
    const r = clone(f.receipt);
    const e = plainPass(r);
    const good = { kind: 'assertion', ref: `probe/${e.id}`, summary: 'fictional measured assertion; assertions=3' };
    const weird = [null, undefined, 'x', 7, [], { kind: 'assertion' }, { ...good, ref: `${good.ref}/b`, kind: { toString: () => 'assertion' } }, { ...good, ref: `${good.ref}/c`, kind: 7 }, { ...good, ref: 7 }, { ...good, ref: null }, { ...good, summary: 7 }, { ...good, summary: null }, { ...good, summary: { trim: () => 'long enough summary' } }];
    const bad = [];
    try {
      const p = evidenceProfile([...weird, good], e.id, ids);
      if (p.count !== 1 || p.measured !== 1 || p.refs.length !== 1) bad.push(`profile ${JSON.stringify(p)}`);
      if (evidenceProfile('not an array', e.id, ids).count !== 0) bad.push('a non-array evidence was counted');
      if (evidenceProfile([{ ...good, ref: 'probe/names-no-obligation' }], '', ids).count !== 0) bad.push('an item was bound to an empty obligation id');
      e.evidence = [...weird, good];
      recount(r, f.index);
      if (r.counts.evidence.qualifying !== f.receipt.counts.evidence.qualifying) bad.push('recount over weird evidence changed the qualifying total');
    } catch (err) {
      bad.push(`threw ${err && err.name}`);
    }
    const r2 = clone(f.receipt);
    plainPass(r2).evidence = [];
    recount(r2, f.index);
    if (r2.counts.evidence.syntheticOnlyPasses !== 0 || r2.provisionalReasons.includes('SYNTHETIC_EVIDENCE')) bad.push('a PASS with no evidence at all was called synthetic-only');
    return bad.length ? fail(bad.join('; ')) : pass('13 malformed items ignored, no throw; empty evidence is not synthetic');
  });

  // D3: synthetic evidence and the header cap the verdict
  check('synthetic evidence and the header cap the verdict: sealed, ruled, everything passing is PROVISIONAL unless the evidence is measured AND the header says so', () => {
    const idx = twoIndex();
    const disp = rule(bothBlockers(), idx);
    const syn = (id) => ({ ...runOf(id, 'PASS'), evidence: [{ kind: 'synthetic-check', ref: `synthetic:${id}`, summary: 'fictional check ran; assertions=3' }] });
    const mea = (id) => runOf(id, 'PASS');
    const both = (id) => ({ ...runOf(id, 'PASS'), evidence: [measuredItem(id), { kind: 'synthetic-check', ref: `synthetic:${id}`, summary: 'fictional check ran; assertions=3' }] });
    const disguised = (id) => ({ ...runOf(id, 'PASS'), evidence: [{ kind: 'assertion', ref: `synthetic:${id}`, summary: 'fictional measured assertion; assertions=3' }] });
    const MEAS = measuredHeader;
    const cases = [
      ['measured evidence, measured header', [mea('T-1'), mea('T-2')], MEAS, 'STEP4_READY', ''],
      ['synthetic evidence, measured header', [syn('T-1'), syn('T-2')], MEAS, 'PROVISIONAL', 'SYNTHETIC_EVIDENCE'],
      ['one entry synthetic only', [mea('T-1'), syn('T-2')], MEAS, 'PROVISIONAL', 'SYNTHETIC_EVIDENCE'],
      ['one entry with measured AND synthetic evidence', [mea('T-1'), both('T-2')], MEAS, 'STEP4_READY', ''],
      ['a measured kind with a synthetic: ref', [mea('T-1'), disguised('T-2')], MEAS, 'PROVISIONAL', 'SYNTHETIC_EVIDENCE'],
      ['measured evidence, synthetic header', [mea('T-1'), mea('T-2')], { suite: 'x', kind: 'synthetic' }, 'PROVISIONAL', 'HEADER_KIND_NOT_MEASURED'],
      ['measured evidence, header with no kind', [mea('T-1'), mea('T-2')], { suite: 'x' }, 'PROVISIONAL', 'HEADER_KIND_NOT_MEASURED'],
      ['measured evidence, kind in a different case', [mea('T-1'), mea('T-2')], { kind: 'Measured' }, 'PROVISIONAL', 'HEADER_KIND_NOT_MEASURED'],
      ['measured evidence, kind that is a number', [mea('T-1'), mea('T-2')], { kind: 7 }, 'PROVISIONAL', 'HEADER_KIND_NOT_MEASURED'],
      ['measured evidence, empty header', [mea('T-1'), mea('T-2')], {}, 'PROVISIONAL', 'HEADER_KIND_NOT_MEASURED'],
      ['synthetic evidence, synthetic header', [syn('T-1'), syn('T-2')], { kind: 'synthetic' }, 'PROVISIONAL', 'HEADER_KIND_NOT_MEASURED,SYNTHETIC_EVIDENCE'],
    ];
    const bad = [];
    for (const [label, results, header, wantVerdict, wantReasons] of cases) {
      const r = buildReceipt({ index: idx, dispositions: disp, results, header });
      if (r.verdict !== wantVerdict || r.provisionalReasons.join() !== wantReasons) bad.push(`${label}: ${r.verdict} [${r.provisionalReasons}]`);
      if (!validateReceipt(r, { index: idx, dispositions: disp }).ok) bad.push(`${label}: the validator refused the honest receipt`);
    }
    const unruled = buildReceipt({ index: idx, dispositions: bothBlockers(), results: [mea('T-1'), mea('T-2')], header: MEAS });
    if (unruled.verdict !== 'PROVISIONAL' || unruled.provisionalReasons.join() !== 'NOT_RULED') bad.push(`unruled -> ${unruled.verdict} [${unruled.provisionalReasons}]`);
    return bad.length ? fail(bad.join('; ')) : pass(`${cases.length} cases (+ unruled) each gave the expected verdict and reasons`);
  });

  // D4: prerequisites
  const depIndex = () => ({
    count: 3,
    obligations: [
      { id: 'T-1', category: 'synthetic', requiresRealKms: false, dependsOn: [] },
      { id: 'T-2', category: 'synthetic', requiresRealKms: false, dependsOn: ['T-1'] },
      { id: 'T-3', category: 'synthetic', requiresRealKms: false, dependsOn: ['T-1', 'T-2'] },
    ],
  });
  const depDisp = () => rule({ ruled: false, dispositions: { 'T-1': { disposition: 'DECLARED_GAP', gap: syntheticGap() }, 'T-2': { disposition: 'BLOCKER', gap: null }, 'T-3': { disposition: 'BLOCKER', gap: null } } }, depIndex());

  check('prerequisites: a PASS that depends on an obligation which did not PASS lists it, is counted and caps the verdict; a passing prerequisite or a non-PASS dependent lists nothing', () => {
    const idx = depIndex();
    const disp = depDisp();
    const none = (id) => ({ id, status: 'NOT_RUN' });
    const ctx = { index: idx, dispositions: disp };
    const run = (results) => {
      const r = buildReceipt({ index: idx, dispositions: disp, results, header: measuredHeader });
      const v = validateReceipt(r, ctx);
      return { r, v, unmet: r.entries.map((e) => e.unmetDependencies.join('+') || '-').join(' ') };
    };
    const cases = [
      ['gap never ran', [none('T-1'), runOf('T-2', 'PASS'), runOf('T-3', 'PASS')], '- T-1 T-1', 'PROVISIONAL', 2],
      ['gap failed with a complete record (ACCEPTED_GAP)', [runOf('T-1', 'FAIL'), runOf('T-2', 'PASS'), runOf('T-3', 'PASS')], '- T-1 T-1', 'PROVISIONAL', 2],
      ['gap passed', [runOf('T-1', 'PASS'), runOf('T-2', 'PASS'), runOf('T-3', 'PASS')], '- - -', 'STEP4_READY', 0],
      ['gap passed with no evidence (INVALID_EVIDENCE)', [{ ...runOf('T-1', 'PASS'), evidence: [] }, runOf('T-2', 'PASS'), runOf('T-3', 'PASS')], '- T-1 T-1', 'NOT_READY', 2],
      ['a BLOCKER prerequisite failed', [runOf('T-1', 'PASS'), runOf('T-2', 'FAIL'), runOf('T-3', 'PASS')], '- - T-2', 'NOT_READY', 1],
      ['both prerequisites unrun', [none('T-1'), none('T-2'), runOf('T-3', 'PASS')], '- - T-1+T-2', 'NOT_READY', 1],
    ];
    const bad = [];
    for (const [label, results, wantUnmet, wantVerdict, wantCount] of cases) {
      const { r, v, unmet } = run(results);
      if (unmet !== wantUnmet) bad.push(`${label}: unmet "${unmet}", want "${wantUnmet}"`);
      if (r.verdict !== wantVerdict) bad.push(`${label}: ${r.verdict}, want ${wantVerdict}`);
      if (r.counts.unmetDependencies !== wantCount) bad.push(`${label}: counts.unmetDependencies ${r.counts.unmetDependencies}, want ${wantCount}`);
      if ((wantCount > 0) !== r.provisionalReasons.includes('UNMET_DEPENDENCY')) bad.push(`${label}: UNMET_DEPENDENCY reason ${r.provisionalReasons}`);
      if (!v.ok) bad.push(`${label}: the validator refused the honest receipt (${v.problems[0]})`);
    }
    const badIndex = [
      ['an unknown id', ['T-9']],
      ['the obligation itself', ['T-2']],
      ['a repeated id', ['T-1', 'T-1']],
      ['a string', 'T-1'],
      ['a number in the list', [1]],
    ];
    for (const [label, deps] of badIndex) {
      const i = depIndex();
      i.obligations[1].dependsOn = deps;
      if (!throwsWith(() => buildReceipt({ index: i, dispositions: depDisp(), results: [] }), ReceiptInputError, 'BAD_INDEX').ok) bad.push(`dependsOn ${label} was not refused`);
    }
    return bad.length ? fail(`${bad.length} problem(s): ${bad.slice(0, 4).join(' | ')}`) : pass(`${cases.length} prerequisite scenarios and ${badIndex.length} malformed dependsOn each as specified`);
  });

  check('prerequisites on the real index: with every declared gap unrun, each passing dependent lists exactly its gap prerequisites (derived independently from the tables)', () => {
    const t = ctxOf((x) => {
      x.dispositions.ruled = true;
      for (const id of Object.keys(x.dispositions.dispositions)) if (x.dispositions.dispositions[id].disposition === 'DECLARED_GAP') setGap(x.dispositions, id, true);
    });
    const r = build(t, { gapPolicy: 'notRun' }, { measured: true });
    const isGap = (id) => t.dispositions.dispositions[id].disposition === 'DECLARED_GAP';
    const want = new Map(t.index.obligations.filter((o) => !isGap(o.id)).map((o) => [o.id, o.dependsOn.filter(isGap).sort().join('+')]));
    const wrongOnes = r.entries.filter((e) => !isGap(e.id) && e.unmetDependencies.join('+') !== want.get(e.id)).map((e) => e.id);
    const dependents = [...want.values()].filter((v) => v !== '').length;
    const problems = [];
    if (wrongOnes.length) problems.push(`${wrongOnes.length} entries list the wrong prerequisites`);
    if (dependents === 0) problems.push('no dependent on a gap exists in the real index, so this check would be vacuous');
    if (r.counts.unmetDependencies !== dependents) problems.push(`counts.unmetDependencies ${r.counts.unmetDependencies}, want ${dependents}`);
    if (r.verdict !== 'PROVISIONAL' || !r.provisionalReasons.includes('UNMET_DEPENDENCY')) problems.push(`${r.verdict} [${r.provisionalReasons}]`);
    if (!validateReceipt(r, t).ok) problems.push('the validator refused');
    return problems.length ? fail(problems.join('; ')) : pass(`${dependents} blockers pass on top of declared gaps that never ran; each lists them; the receipt is capped at PROVISIONAL`);
  });

  // D4: real vault and browser
  check('real vault and browser gate PASS exactly like real KMS: required + (false | null | undeclared) is INVALID_EVIDENCE, true passes, not required ignores the declaration', () => {
    const decls = [true, false, null, undefined];
    const bad = [];
    let n = 0;
    for (const reqKms of [false, true]) for (const reqVault of [false, true]) for (const reqBrowser of [false, true]) {
      const idx = { count: 1, obligations: [{ id: 'T-1', category: 'synthetic', requiresRealKms: reqKms, requiresRealVault: reqVault, requiresBrowser: reqBrowser }] };
      const disp = { ruled: false, dispositions: { 'T-1': { disposition: 'BLOCKER', gap: null } } };
      for (const kms of [true, false]) for (const vault of decls) for (const browser of decls) {
        const res = { id: 'T-1', status: 'PASS', environment: 'E1', realKms: kms, evidence: [measuredItem('T-1')] };
        if (vault !== undefined) res.realVault = vault;
        if (browser !== undefined) res.browser = browser;
        const r = buildReceipt({ index: idx, dispositions: disp, results: [res], header: measuredHeader });
        const want = (!reqKms || kms === true) && (!reqVault || vault === true) && (!reqBrowser || browser === true) ? 'PASS' : 'INVALID_EVIDENCE';
        n++;
        if (r.entries[0].verdict !== want) bad.push(`req(kms,vault,browser)=${reqKms},${reqVault},${reqBrowser} decl=${kms},${vault},${browser} -> ${r.entries[0].verdict}, want ${want}`);
        if (r.entries[0].requiresRealVault !== reqVault || r.entries[0].requiresBrowser !== reqBrowser) bad.push('the entry does not carry the requirement flags');
        if (!validateReceipt(r, { index: idx, dispositions: disp }).ok) bad.push(`validator refused (${reqKms},${reqVault},${reqBrowser},${kms},${vault},${browser})`);
      }
    }
    const idx1 = (extra) => ({ count: 1, obligations: [{ id: 'T-1', category: 'synthetic', requiresRealKms: false, ...extra }] });
    const disp1 = { ruled: false, dispositions: { 'T-1': { disposition: 'BLOCKER', gap: null } } };
    const codes = [
      [() => buildReceipt({ index: idx1({}), dispositions: disp1, results: [runOf('T-1', 'PASS', { realVault: 'yes' })] }), 'BAD_REAL_VAULT'],
      [() => buildReceipt({ index: idx1({}), dispositions: disp1, results: [runOf('T-1', 'PASS', { browser: 1 })] }), 'BAD_BROWSER'],
      [() => buildReceipt({ index: idx1({ requiresRealVault: 'yes' }), dispositions: disp1, results: [] }), 'BAD_INDEX'],
      [() => buildReceipt({ index: idx1({ requiresBrowser: 1 }), dispositions: disp1, results: [] }), 'BAD_INDEX'],
    ];
    for (const [fn, code] of codes) if (!throwsWith(fn, ReceiptInputError, code).ok) bad.push(`${code} was not thrown`);
    // the exported derivation functions: new parameters are optional and default to "not required"
    for (const fnName of ['deriveEntryVerdict', 'rederiveEntryVerdict']) {
      const fn = fnName === 'deriveEntryVerdict' ? deriveEntryVerdict : rederiveEntryVerdict;
      const base = { disposition: 'BLOCKER', status: 'PASS', evidenceCount: 1, requiresRealKms: false, realKms: false, gapComplete: false };
      if (fn(base) !== 'PASS') bad.push(`${fnName}: omitting the new parameters changed the old verdict`);
      if (fn({ ...base, requiresRealVault: true, realVault: false }) !== 'INVALID_EVIDENCE') bad.push(`${fnName}: vault`);
      if (fn({ ...base, requiresRealVault: true, realVault: null }) !== 'INVALID_EVIDENCE') bad.push(`${fnName}: undeclared vault`);
      if (fn({ ...base, requiresBrowser: true, browser: false }) !== 'INVALID_EVIDENCE') bad.push(`${fnName}: browser`);
      if (fn({ ...base, requiresBrowser: true, browser: null }) !== 'INVALID_EVIDENCE') bad.push(`${fnName}: undeclared browser`);
      if (fn({ ...base, requiresRealVault: true, realVault: true, requiresBrowser: true, browser: true }) !== 'PASS') bad.push(`${fnName}: both declared`);
      if (fn({ ...base, requiresRealVault: false, realVault: false, requiresBrowser: false, browser: false }) !== 'PASS') bad.push(`${fnName}: not required but declared false`);
    }
    return bad.length ? fail(`${bad.length} problem(s): ${bad.slice(0, 4).join(' | ')}`) : pass(`${n} requirement x declaration combinations, 4 error codes, and both derivation functions agree with the rule`);
  });

  // D7: NOT_RUN entries are not tallied as if they ran
  check('NOT_RUN results are normalised: environment, declarations and evidence are dropped, so a result that was never produced is never tallied; malformed ones still throw', () => {
    const idx = twoIndex();
    const noisy = { id: 'T-1', status: 'NOT_RUN', environment: 'E2', realKms: true, realVault: true, browser: true, evidence: [measuredItem('T-1')] };
    const r = buildReceipt({ index: idx, dispositions: bothBlockers(), results: [noisy], header: measuredHeader });
    const e = r.entries[0];
    const bad = [];
    if (e.environment !== null || e.realKms !== null || e.realVault !== null || e.browser !== null || e.evidence.length !== 0) bad.push('the NOT_RUN entry kept run fields');
    if (r.counts.byEnvironment.E2 !== 0 || r.counts.byEnvironment.none !== 2) bad.push(`byEnvironment ${JSON.stringify(r.counts.byEnvironment)}`);
    if (r.counts.evidence.qualifying !== 0) bad.push('a NOT_RUN result contributed evidence');
    if (!validateReceipt(r, { index: idx, dispositions: bothBlockers() }).ok) bad.push('the validator refused the normalised receipt');
    const same = buildReceipt({ index: idx, dispositions: bothBlockers(), results: [], header: measuredHeader });
    if (JSON.stringify(same.entries) !== JSON.stringify(r.entries)) bad.push('a noisy NOT_RUN result and a missing result differ');
    const loud = [
      [{ ...noisy, environment: 'E9' }, 'BAD_ENVIRONMENT'],
      [{ ...noisy, evidence: 'x' }, 'BAD_EVIDENCE'],
      [{ ...noisy, realVault: 'yes' }, 'BAD_REAL_VAULT'],
      [{ ...noisy, realKms: 'yes' }, 'BAD_REAL_KMS'],
    ];
    for (const [res, code] of loud) if (!throwsWith(() => buildReceipt({ index: idx, dispositions: bothBlockers(), results: [res] }), ReceiptInputError, code).ok) bad.push(`a malformed NOT_RUN result did not throw ${code}`);
    return bad.length ? fail(bad.join('; ')) : pass('NOT_RUN == no result; E2 tally 0; malformed fields still throw');
  });

  // D5: fixture prose
  const unitsOf = (texts, canary) =>
    texts
      .flatMap((t) => String(t).split(/\n+|(?<=[.!?])\s+/))
      .map((u) => u.split(canary).join(' ').replace(/\s+/g, ' ').trim())
      .filter((u) => u.split(' ').length >= 2);
  const uncoveredUnits = (units) => [...new Set(units)].filter((u) => countFixtureText(u) === 0);

  check('fixture text coverage (drift detector): every sentence and heading the live fixture builders produce contains a scrub marker, and the detector fails on an uncovered unit', () => {
    let fx;
    try {
      fx = loadSibling('./fixtures.mjs');
    } catch (e) {
      return fail(`the fixture module could not be loaded to verify marker coverage (${e && e.name}); coverage is UNVERIFIED, not assumed`);
    }
    const canary = fx.makeCanary();
    const texts = [
      fx.docxBodyText(fx.buildDocx(canary).buffer),
      fx.docxBodyText(fx.buildDocxWithTable(canary).buffer),
      fx.epubBodyText(fx.buildEpub(canary).buffer),
      fx.epubBodyText(fx.buildEpub(canary, { padChapterBytes: 4096 }).buffer),
      fx.epubBodyText(fx.buildEpub(canary, { bulkTextChars: 1000 }).buffer),
    ];
    const units = unitsOf(texts, canary);
    const distinct = new Set(units).size;
    const uncovered = uncoveredUnits(units);
    const control = uncoveredUnits(unitsOf(['A completely unrelated sentence about nothing at all.'], canary));
    const problems = [];
    if (distinct < 15) problems.push(`only ${distinct} distinct text units were produced, so the coverage claim would be thin`);
    if (control.length !== 1) problems.push('the detector did not flag an unrelated sentence');
    if (uncovered.length) problems.push(`${uncovered.length} fixture text unit(s) carry no marker (word counts ${uncovered.slice(0, 5).map((u) => u.split(' ').length).join(',')}): add a distinctive phrase to FIXTURE_TEXT_MARKERS`);
    return problems.length ? fail(problems.join('; ')) : pass(`${distinct} distinct units from 5 builders, all covered; an unrelated sentence is flagged uncovered`);
  });

  check('fixture prose outside the canary paragraph is refused when quoted in an evidence summary (the title, headings and other paragraphs are guarded too)', () => {
    let fx;
    try {
      fx = loadSibling('./fixtures.mjs');
    } catch (e) {
      return fail(`the fixture module could not be loaded (${e && e.name})`);
    }
    const canary = fx.makeCanary();
    const doc = String(fx.docxBodyText(fx.buildDocx(canary).buffer));
    const before = doc.slice(0, doc.indexOf(canary) - 1);
    if (before.length < 100) return fail('the text before the canary is too short for this check to mean anything');
    const attempt = (summary) => throwsWith(() => buildReceipt({ index: tinyIndex(), dispositions: tinyDisp(), results: [passResult(summary)] }), ReceiptContentLeak);
    const t = attempt(`extraction began: ${before}`);
    const problems = [];
    if (!t.ok) problems.push('prose from before the canary was accepted into the receipt');
    else {
      if (!t.e.findings.some((f) => f.rule === 'fixture_text')) problems.push('refused, but not by the fixture_text rule');
      if (t.e.findings.some((f) => f.rule === 'canary')) problems.push('the canary rule fired, so this text was not canary-free');
      if (t.e.message.includes(before.slice(0, 20)) || JSON.stringify(t.e.findings).includes(before.slice(0, 20))) problems.push('the refusal echoed fixture text');
    }
    const lines = doc.split(/\n+/).map((l) => l.trim()).filter((l) => l.split(' ').length >= 3 && !l.includes(canary));
    const slipped = lines.filter((l) => !attempt(l).ok);
    if (lines.length < 4) problems.push('too few canary-free lines to test');
    if (slipped.length) problems.push(`${slipped.length} canary-free line(s) of fixture text were accepted`);
    return problems.length ? fail(problems.join('; ')) : pass(`${before.length} characters of canary-free prose and ${lines.length} lines refused by fixture_text; nothing echoed`);
  });

  // D6: header acceptance rules
  check('header validation: only plain JSON data is accepted; depth 10 is accepted and depth 11 is refused; honest nulls, numbers, arrays and null-prototype objects pass the validator', () => {
    const bad = [];
    const refuses = (header) => throwsWith(() => buildReceipt({ index: tinyIndex(), dispositions: tinyDisp(), results: [], header }), ReceiptInputError, 'BAD_HEADER').ok;
    const refused = [
      ['NaN', { x: NaN }], ['Infinity', { x: Infinity }], ['-Infinity', { x: -Infinity }], ['undefined', { x: undefined }], ['bigint', { x: 1n }], ['symbol', { x: Symbol('s') }],
      ['Date', { x: new Date(0) }], ['Map', { x: new Map() }], ['function', { x: () => 1 }], ['NaN in an array', { x: [NaN] }], ['NaN nested', { a: { b: { c: NaN } } }],
      ['a Map as the header', new Map()], ['an array as the header', []], ['a string as the header', 'run-1'], ['null as the header', null],
    ];
    for (const [label, h] of refused) if (!refuses(h)) bad.push(`${label} was accepted`);
    const chain = (levels) => {
      let v = 1;
      for (let i = 0; i < levels; i++) v = { a: v };
      return v;
    };
    if (refuses(chain(10))) bad.push('a header nested 10 levels was refused');
    if (!refuses(chain(11))) bad.push('a header nested 11 levels was accepted');
    const honest = { kind: MEASURED_HEADER_KIND, a: null, b: 1, c: 's', d: true, e: [1, null, { x: 2 }], f: Object.assign(Object.create(null), { z: 1 }), g: 1.5, h: -3 };
    const t = tinyIndex();
    const d = tinyDisp();
    let r = null;
    try {
      r = buildReceipt({ index: t, dispositions: d, results: [], header: honest });
    } catch (e) {
      bad.push(`an honest header with nulls, numbers, arrays and a null-prototype object was refused (${e && e.code})`);
    }
    if (r && !validateReceipt(r, { index: t, dispositions: d }).ok) bad.push('the validator refused an honest header holding null values');
    if (r) {
      const deep = clone(r);
      let at = deep.header;
      for (let i = 0; i < 8; i++) at = at[`n${i}`] = {};
      at.testsExpected = 1;
      const v = validateReceipt(deep, { index: t, dispositions: d });
      if (!v.codes.includes('LEGACY_EXIT_CODE_FIELD')) bad.push('a legacy field nested 9 levels deep in the header was not found');
    }
    return bad.length ? fail(bad.join('; ')) : pass(`${refused.length} non-JSON headers refused; depth 10 ok, 11 refused; honest nulls accepted; a deep legacy key found`);
  });

  /* ---- 5. the validator against the wrong-receipt library ---- */
  const seenCodes = new Set();
  const normalized = normalizedAsShippedContext();

  check('WRONG_RECEIPTS: the eight constructions the assignment names are all present', () => {
    const required = ['legacyExitCode', 'passWithoutEvidence', 'gapReportedAsPass', 'unruledDispositionsReady', 'notRunCountedAsPass', 'realKmsPassFromLocalHarness', 'hardCodedTotals', 'contentLeak'];
    const have = WRONG_RECEIPTS.map((w) => w.name);
    const missing = required.filter((n) => !have.includes(n));
    const dup = have.filter((n, i) => have.indexOf(n) !== i);
    const malformed = WRONG_RECEIPTS.filter((w) => !w.why || typeof w.make !== 'function' || typeof w.context !== 'function' || !Array.isArray(w.expectCodes) || w.expectCodes.length === 0 || !Array.isArray(w.forbidCodes));
    return missing.length || dup.length || malformed.length ? fail(`missing ${missing}; duplicate ${dup}; malformed ${malformed.map((w) => w.name)}`) : pass(`${have.length} wrong receipts`);
  });

  for (const w of WRONG_RECEIPTS) {
    check(`WRONG_RECEIPTS/${w.name}: refused by the validator for its named reason`, () => {
      const receipt = w.make();
      const ctx = w.context();
      const res = validateReceipt(receipt, ctx);
      res.codes.forEach((c) => seenCodes.add(c));
      const missingCodes = w.expectCodes.filter((c) => !res.codes.includes(c));
      const forbidden = (w.forbidCodes || []).filter((c) => res.codes.includes(c));
      if (res.ok) return fail('ACCEPTED a known-wrong receipt');
      if (missingCodes.length) return fail(`refused, but not for ${missingCodes.join(',')}; saw ${res.codes.join(',')}`);
      if (forbidden.length) return fail(`refused, but with a forbidden diagnosis ${forbidden.join(',')}`);
      return pass(`refused: ${res.codes.join(',')}`);
    });
  }

  check('WRONG_RECEIPTS: every one is also refused when replayed against the as-shipped table shape (ruled=false, empty gap records)', () => {
    // A construction that is wrong only relative to the pin in its own context carries an honest receipt; the rest must be refused anywhere.
    const own = WRONG_RECEIPTS.filter((w) => w.context().pin === undefined);
    const accepted = own.filter((w) => validateReceipt(w.make(), normalized).ok).map((w) => w.name);
    return accepted.length ? fail(`accepted under the as-shipped shape: ${accepted.join(',')}`) : pass(`${own.length} refused (${WRONG_RECEIPTS.length - own.length} are wrong only against their own pin)`);
  });

  check('WRONG_RECEIPTS constructions are non-vacuous: each differs from the honest receipt it was built from', () => {
    // lieAbout throws on a no-op, so a vacuous construction would have thrown inside make(); prove that guard bites.
    const t = throwsWith(() => lieAbout({ a: 1 }, () => {}), Error);
    return t.ok && /changed nothing/.test(t.e.message) ? pass('no-op construction is refused') : fail('lieAbout accepts a no-op');
  });

  check('validator: a conforming receipt is accepted under every context the suite builds (it is not a reject-everything stub)', () => {
    const variants = [
      fresh(),
      fresh({ ruled: true, completeGapCount: 1, run: { gapPolicy: 'mixed' } }),
      fresh({ ruled: true, incompleteGapCount: 1, run: { gapPolicy: 'pass' } }),
      fresh({ ruled: false, completeGapCount: 2, run: { gapPolicy: 'notRun' } }),
    ];
    const refused = variants.filter((f) => !validateReceipt(f.receipt, { index: f.index, dispositions: f.dispositions }).ok).length;
    return refused ? fail(`${refused} honest receipt(s) refused`) : pass(`${variants.length} honest receipts accepted`);
  });

  check('validator fails closed: bad context -> CONTEXT_INVALID; a receipt that throws on access -> VALIDATOR_EXCEPTION; never ok', () => {
    const f = fresh();
    const badCtx = validateReceipt(f.receipt, { index: { obligations: [] }, dispositions: { ruled: false, dispositions: {} } });
    const trap = new Proxy({}, { get() { throw new Error('trap'); }, ownKeys() { throw new Error('trap'); }, getPrototypeOf() { throw new Error('trap'); } });
    const exc = validateReceipt(trap, f);
    const noCtx = validateReceipt(f.receipt);
    [badCtx, exc, noCtx].forEach((x) => x.codes.forEach((c) => seenCodes.add(c)));
    // whatever is thrown (an Error, null, undefined, a string) the validator reports it by name or as "error", and does not throw itself
    const thrower = (value) => new Proxy({}, { get() { throw value; }, ownKeys() { throw value; }, getPrototypeOf() { throw value; } });
    const odd = [[null, 'error'], [undefined, 'error'], ['boom', 'error'], [new TypeError('x'), 'TypeError']].map(([value, name]) => {
      try {
        const v = validateReceipt(thrower(value), f);
        return !v.ok && v.problems.some((m) => m.includes(`(${name})`));
      } catch {
        return false;
      }
    });
    return !badCtx.ok && badCtx.codes.includes('CONTEXT_INVALID') && !exc.ok && exc.codes.includes('VALIDATOR_EXCEPTION') && !noCtx.ok && noCtx.codes.includes('CONTEXT_INVALID') && odd.every(Boolean)
      ? pass('CONTEXT_INVALID, VALIDATOR_EXCEPTION (for Errors, null, undefined and strings), and missing context all refused')
      : fail(`badCtx=${badCtx.codes} exc=${exc.codes} noCtx=${noCtx.codes} thrownValues=${odd}`);
  });

  check('validator has no dead checks: every registered problem code is produced by at least one known-wrong input', () => {
    const never = PROBLEM_CODES.filter((c) => !seenCodes.has(c));
    return never.length ? fail(`never exercised: ${never.join(',')}`) : pass(`${PROBLEM_CODES.length} codes, each exercised`);
  });

  check('validator uses only registered problem codes (an unregistered code would surface as VALIDATOR_EXCEPTION)', () => {
    const bad = [...seenCodes].filter((c) => !PROBLEM_CODES.includes(c));
    return bad.length ? fail(bad.join(',')) : pass('all codes registered');
  });

  check('validator problems carry no receipt content: a leaked canary and uuid are not echoed', () => {
    const f = fresh();
    const canary = `${DEFAULT_CANARY_PREFIX}${hex8U()}`;
    const uuid = crypto.randomUUID();
    const r = clone(f.receipt);
    r.entries[0].evidence = [{ kind: 'k', ref: 'r', summary: `${canary} ${uuid}` }];
    r.header[canary] = uuid;
    r[uuid] = 'x';
    const res = validateReceipt(r, f);
    const blob = JSON.stringify(res);
    return !res.ok && !blob.includes(canary) && !blob.includes(uuid) && res.codes.includes('CONTENT_LEAK') && res.codes.includes('UNKNOWN_FIELD')
      ? pass('leak, key leak and unknown-field leak refused; nothing echoed')
      : fail(`ok=${res.ok} codes=${res.codes} echoed=${blob.includes(canary) || blob.includes(uuid)}`);
  });

  /* ---- 6. property test: random honest runs validate; random single-field lies are refused ---- */
  check('property: 64 random runs over random tables build, validate, and re-derive the same verdict; every sampled single-field lie is refused', () => {
    const rng = mulberry32(0x5eed1234);
    const pickOne = (a) => a[Math.floor(rng() * a.length)];
    const problems = [];
    let built = 0;
    let lies = 0;
    const verdictsSeen = new Set();
    const overallSeen = new Set();
    const lieKindsSeen = new Set();

    for (let iter = 0; iter < 64; iter++) {
      const mode = ['noisy', 'clean', 'clean', 'ready'][iter % 4];
      const clean = mode !== 'noisy';
      const s = loadSuiteData();
      s.dispositions.ruled = mode === 'ready' ? true : rng() < 0.5;
      for (const id of Object.keys(s.dispositions.dispositions)) {
        if (rng() < 0.12) s.dispositions.dispositions[id] = { disposition: 'DECLARED_GAP', gap: null };
        const d = s.dispositions.dispositions[id];
        if (d.disposition === 'DECLARED_GAP') {
          d.gap = Object.fromEntries(GAP_FIELDS.map((f) => [f, clean || rng() < 0.75 ? `Fictional text for the ${f} field of a random gap record in run ${iter}` : pickOne([null, '', '  ', 'TBD'])]));
        }
      }
      if (s.dispositions.ruled) rule(s.dispositions, s.index);
      const results = [];
      for (const o of s.index.obligations) {
        const isBlocker = s.dispositions.dispositions[o.id].disposition === 'BLOCKER';
        const r = rng();
        const declared = { realKms: o.requiresRealKms, realVault: o.requiresRealVault === true, browser: o.requiresBrowser === true };
        if (mode === 'ready') {
          results.push({ id: o.id, status: 'PASS', environment: pickOne(ENVIRONMENTS), ...declared, evidence: [{ kind: pickOne(['assertion', 'probe-observation', 'static-analysis']), ref: `falsifier:SF-01/${o.id}`, summary: 'fictional measured result; assertions=3' }] });
          continue;
        }
        if (clean) {
          // blockers always pass; gaps pass, fail (complete record -> ACCEPTED_GAP) or are left unrun
          const status = isBlocker ? 'PASS' : r < 0.4 ? 'PASS' : r < 0.6 ? 'FAIL' : 'NOT_RUN';
          if (status === 'NOT_RUN') continue;
          results.push({ id: o.id, status, environment: pickOne(ENVIRONMENTS), ...declared, evidence: [{ kind: 'synthetic-check', ref: `synthetic:${o.id}`, summary: 'fictional check ran' }] });
          continue;
        }
        if (r < 0.18) continue;
        const status = r < 0.7 ? 'PASS' : r < 0.85 ? 'FAIL' : 'NOT_RUN';
        const n = pickOne([0, 1, 1, 2]);
        results.push({
          id: o.id,
          status,
          environment: pickOne(ENVIRONMENTS),
          realKms: rng() < 0.6,
          realVault: pickOne([true, false, null, undefined]),
          browser: pickOne([true, false, null, undefined]),
          evidence: Array.from({ length: n }, (_, i) => {
            const kind = pickOne(['synthetic-check', 'assertion', 'exit-code', 'vibes']);
            return { kind, ref: `${kind === 'synthetic-check' ? 'synthetic' : 'probe'}:${pickOne([o.id, 'jest'])}:${i}`, summary: pickOne(['fictional check ran', ' ', 'assertions=2', 'TBD']) };
          }),
        });
      }
      const header = { iter, kind: mode === 'ready' ? MEASURED_HEADER_KIND : pickOne([MEASURED_HEADER_KIND, 'synthetic', undefined]) };
      if (header.kind === undefined) delete header.kind;
      const receipt = buildReceipt({ index: s.index, dispositions: s.dispositions, results, header });
      built++;
      overallSeen.add(receipt.verdict);
      receipt.entries.forEach((e) => verdictsSeen.add(e.verdict));
      if (mode === 'ready' && receipt.verdict !== 'STEP4_READY') problems.push(`iter ${iter}: a fully passing sealed measured run read ${receipt.verdict} ${receipt.provisionalReasons}`);
      const v = validateReceipt(receipt, s);
      if (!v.ok) {
        problems.push(`iter ${iter}: honest receipt refused: ${v.problems[0]}`);
        continue;
      }

      const ids = s.index.obligations.map((o) => o.id);
      const mutations = [
        ['verdict relabelled', (r) => { const e = pickOne(r.entries); e.verdict = pickOne(ENTRY_VERDICTS.filter((x) => x !== e.verdict)); }],
        ['blocking flag flipped', (r) => { const e = pickOne(r.entries); e.blocking = !e.blocking; }],
        ['status changed, verdict kept', (r) => { const e = pickOne(r.entries); e.status = pickOne(STATUSES.filter((x) => x !== e.status)); }],
        ['evidence removed from a PASS', (r) => { const e = r.entries.find((x) => x.verdict === 'PASS' && x.evidence.length); if (!e) throw new Error('n/a'); e.evidence = []; }],
        ['qualifying evidence demoted to an exit code', (r) => { const e = r.entries.find((x) => x.verdict === 'PASS' && evidenceProfile(x.evidence, x.id, ids).count > 0); if (!e) throw new Error('n/a'); e.evidence = e.evidence.map((x) => ({ ...x, kind: 'exit-code' })); }],
        ['count nudged', (r) => { const k = pickOne(['blocking', 'acceptedGaps', 'tableBlockers', 'entries', 'unmetDependencies']); r.counts[k] += 1; }],
        ['evidence count nudged', (r) => { r.counts.evidence[pickOne(['qualifying', 'measured', 'synthetic', 'distinctRefs', 'syntheticOnlyPasses'])] += 1; }],
        ['byVerdict nudged', (r) => { r.counts.byVerdict[pickOne(ENTRY_VERDICTS)] += 1; }],
        ['overall relabelled', (r) => { r.verdict = pickOne(OVERALL_VERDICTS.filter((x) => x !== r.verdict)); }],
        ['entry dropped', (r) => { r.entries.splice(Math.floor(rng() * r.entries.length), 1); }],
        ['entry duplicated over another', (r) => { r.entries[r.entries.length - 1] = clone(r.entries[0]); }],
        ['disposition swapped', (r) => { const e = pickOne(r.entries); e.disposition = e.disposition === 'BLOCKER' ? 'DECLARED_GAP' : 'BLOCKER'; }],
        ['requiresRealKms flipped', (r) => { const e = pickOne(r.entries); e.requiresRealKms = !e.requiresRealKms; }],
        ['requiresRealVault flipped', (r) => { const e = pickOne(r.entries); e.requiresRealVault = !e.requiresRealVault; }],
        ['requiresBrowser flipped', (r) => { const e = pickOne(r.entries); e.requiresBrowser = !e.requiresBrowser; }],
        ['expectedEntries nudged', (r) => { r.expectedEntries += 1; }],
        ['unknown field added', (r) => { r.entries[0].extra = 1; }],
        ['ruled flipped', (r) => { r.ruled = !r.ruled; }],
        ['ruling edited', (r) => { r.ruling = r.ruling === null ? { ref: 'INVENTED-RULING' } : null; }],
        ['table digest edited', (r) => { r.tableDigest[pickOne(['index', 'dispositions'])] = computeTableDigest({ obligations: [] }, { dispositions: {} }).index; }],
        ['provisional reason dropped', (r) => { if (r.provisionalReasons.length === 0) throw new Error('n/a'); r.provisionalReasons.splice(Math.floor(rng() * r.provisionalReasons.length), 1); }],
        ['provisional reason invented', (r) => { const absent = PROVISIONAL_REASONS.filter((x) => !r.provisionalReasons.includes(x)); if (absent.length === 0) throw new Error('n/a'); r.provisionalReasons = [...r.provisionalReasons, pickOne(absent)].sort(); }],
        ['unmet dependency cleared', (r) => { const e = r.entries.find((x) => x.unmetDependencies.length > 0); if (!e) throw new Error('n/a'); e.unmetDependencies = []; }],
        ['NOT_RUN entry given an environment', (r) => { const e = r.entries.find((x) => x.status === 'NOT_RUN'); if (!e) throw new Error('n/a'); e.environment = pickOne(ENVIRONMENTS); }],
        ['leak planted in evidence', (r) => { const e = pickOne(r.entries); e.evidence = [{ kind: 'k', ref: 'r', summary: crypto.randomUUID() }]; }],
        ['leak planted in header', (r) => { r.header.h = `${DEFAULT_CANARY_PREFIX}${hex8U()}`; }],
        ['fixture prose planted in header', (r) => { r.header.h = 'Corwin Ashgrove lit the lamp'; }],
      ];
      // Nine of the lie kinds per run, drawn without replacement; over the runs every kind is drawn many times (checked below).
      const drawn = [...mutations];
      for (let i = drawn.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1));
        [drawn[i], drawn[j]] = [drawn[j], drawn[i]];
      }
      for (const [label, fn] of drawn.slice(0, 9)) {
        const before = JSON.stringify(receipt);
        const copy = JSON.parse(before);
        try {
          fn(copy);
        } catch (e) {
          if (e.message === 'n/a') continue;
          throw e;
        }
        if (JSON.stringify(copy) === before) continue; // a lie that changed nothing is not a lie
        lies++;
        lieKindsSeen.add(label);
        if (validateReceipt(copy, s).ok) problems.push(`iter ${iter}: lie accepted: ${label}`);
      }
    }
    if (verdictsSeen.size !== ENTRY_VERDICTS.length) problems.push(`random runs exercised ${verdictsSeen.size} of ${ENTRY_VERDICTS.length} entry verdicts`);
    if (overallSeen.size !== OVERALL_VERDICTS.length) problems.push(`random runs produced only ${[...overallSeen].sort()} of the overall verdicts`);
    if (lieKindsSeen.size < 20) problems.push(`only ${lieKindsSeen.size} kinds of lie were ever exercised`);
    return problems.length ? fail(`${problems.length} problem(s): ${problems.slice(0, 3).join(' | ')}`) : pass(`${built} honest receipts accepted, ${lies} single-field lies of ${lieKindsSeen.size} kinds refused; entry verdicts seen ${verdictsSeen.size}/${ENTRY_VERDICTS.length}; overall ${[...overallSeen].sort().join('/')}`);
  });

  /* ---- 7. hygiene of this file itself ---- */
  const selfPath = fileURLToPath(import.meta.url);
  let selfSource = '';
  try {
    selfSource = fs.readFileSync(selfPath, 'utf8');
  } catch {
    selfSource = '';
  }

  check('hygiene: the source scanner fires on a planted positive (so a clean result below means something)', () => {
    const planted = `x ${S_KEY_PREFIX}${upperAlnum16()} ${crypto.randomUUID()} ${randHex(16)} ${crypto.randomBytes(48).toString('base64')}`;
    const rules = sourceFindingsForHygiene(planted).map((h) => h.rule);
    return ['aws_access_key_prefix', 'uuid', 'hex_run_32', 'base64_run_40'].every((r) => rules.includes(r)) ? pass('planted literals found') : fail(`found only ${rules}`);
  });

  check('hygiene: this source contains no secret-shaped, UUID, long-hex or base64 literal and no whole sensitive marker', () => {
    if (selfSource.length === 0) return fail('could not read own source');
    const hits = sourceFindingsForHygiene(selfSource);
    return hits.length ? fail(`own source matches: ${hits.map((h) => `${h.rule}x${h.count}`).join(', ')}`) : pass(`${selfSource.length} chars scanned, 0 matches`);
  });

  check('hygiene: zero dependencies -- every import is a node: built-in, and the only sibling module read (in selfTest) is on the allowlist (checkers fire on planted violations)', () => {
    const planted = nonBuiltinImports("import x from 'left-pad';\nimport fs from 'node:fs';");
    const real = nonBuiltinImports(selfSource);
    const siblingCalls = (text) => [...text.matchAll(/\bloadSibling\(\s*['"]([^'"]+)['"]\s*\)/g)].map((m) => m[1]);
    const loaderCalls = (text) => countOccurrences(text, ['create', 'Require('].join(''));
    const call = (name) => `${['load', 'Sibling'].join('')}('${name}');`;
    const plantedSibling = siblingCalls(`${call('./not-allowed.mjs')} ${call('./fixtures.mjs')}`).filter((n) => !SIBLING_MODULES.includes(n));
    const ownSibling = siblingCalls(selfSource);
    const bad = [];
    if (planted.length !== 1) bad.push('the bare-import checker did not fire on a planted import');
    if (real.length !== 0) bad.push(`non-node imports: ${real.length}`);
    if (plantedSibling.length !== 1) bad.push('the sibling-allowlist checker did not fire on a planted call');
    if (ownSibling.length === 0) bad.push('no loadSibling call found, so the allowlist check would be vacuous');
    if (ownSibling.some((n) => !SIBLING_MODULES.includes(n))) bad.push('a sibling module outside the allowlist is read');
    if (loaderCalls(`${['create', 'Require('].join('')}x) ${['create', 'Require('].join('')}y)`) !== 2) bad.push('the loader-call counter did not fire on a planted pair');
    if (loaderCalls(selfSource) !== 1) bad.push(`createRequire is called ${loaderCalls(selfSource)} times, expected once (inside loadSibling)`);
    return bad.length ? fail(bad.join('; ')) : pass(`planted bare import and planted sibling found; own imports are all node:; ${ownSibling.length} sibling reads, all allowlisted`);
  });

  check('hygiene: no total is hard-coded -- the index size does not appear as a numeric literal in this source', () => {
    const n = suite.index.obligations.length;
    const re = new RegExp(`(?<![\\w.])${n}(?![\\w.])`);
    const planted = re.test(`const expected = ${n};`);
    return planted && !re.test(selfSource) ? pass(`planted literal ${n} detected; own source has none`) : fail(planted ? `the number ${n} appears in own source` : 'literal checker did not fire on a planted total');
  });

  check('hygiene: the source never touches the network, the shell, the environment or the repository (planted control fires)', () => {
    const needles = [['child', '_process'], ['node:', 'net'], ['node:', 'http'], ['process', '.env'], ['fetch', '(']].map((p) => p.join(''));
    const planted = needles.filter((x) => `x ${x} y`.includes(x)).length === needles.length;
    const own = needles.filter((x) => selfSource.replace(/\bneedles\b/g, '').split('\n').some((line) => line.includes(x) && !/\[\s*\[/.test(line) && !line.includes('.join(')));
    return planted && own.length === 0 ? pass('none of the forbidden capabilities referenced') : fail(`own source references: ${own.join(',')}`);
  });

  return { ok: checks.length > 0 && checks.every((c) => c.ok), checks };
}

/* ------------------------------------------------------------------------- *
 * Direct run
 * ------------------------------------------------------------------------- */

function isMain() {
  try {
    return Boolean(process.argv[1]) && fs.realpathSync(process.argv[1]) === fs.realpathSync(fileURLToPath(import.meta.url));
  } catch {
    return false;
  }
}

if (isMain()) {
  const verbose = process.argv.includes('--verbose') || process.argv.includes('-v');
  const result = selfTest();
  const bad = result.checks.filter((c) => !c.ok);
  if (verbose) for (const c of result.checks) console.log(`${c.ok ? 'ok  ' : 'FAIL'} ${c.name} -- ${c.detail}`);
  else for (const c of bad) console.log(`FAIL ${c.name} -- ${c.detail}`);
  console.log(`receipt.mjs selfTest: ${result.ok ? 'OK' : 'FAILED'} (${result.checks.length - bad.length}/${result.checks.length} checks passed)`);
  process.exitCode = result.ok ? 0 : 1;
}
