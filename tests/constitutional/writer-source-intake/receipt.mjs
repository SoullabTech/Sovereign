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
//     * every verdict is DERIVED from raw fields (disposition, status, evidence, real-KMS flag,
//       gap record); nothing is typed in;
//     * every count and the overall verdict are computed from the entries; no total is stored as a
//       constant anywhere in this file;
//     * an ACCEPTED_GAP is never reported as PASS and is counted on its own line;
//     * a second, separately written derivation (validateReceipt) re-derives everything and refuses
//       a receipt whose recorded verdict, count, flag or label disagrees with its own raw fields.
//
// EXPORTS
//   buildReceipt({ index, dispositions, results, header, canaryPrefix? }) -> receipt
//       THROWS ReceiptInputError (unknown id, duplicate id, malformed input) or ReceiptContentLeak.
//   validateReceipt(receipt, { index, dispositions, canaryPrefix? }) -> { ok, problems[], codes[] }
//       Never throws; fails closed (an internal exception is itself a problem).
//   scrub(receipt, { canaryPrefix? }) -> { ok, scanned, findings:[{ path, rule, count }] }
//       Content-free: a finding names a path, a rule and a count, never the matched text.
//   WRONG_RECEIPTS  [{ name, why, make(), context(), expectCodes[], forbidCodes[] }]  known-wrong constructions;
//       context() is the { index, dispositions } the receipt must be validated against.
//   selfTest() -> { ok, checks:[{ name, ok, detail }] }     (also run when this file is executed)
//   also: syntheticResults, loadSuiteData, deriveEntryVerdict, rederiveEntryVerdict, PROBLEM_CODES,
//         SCHEMA, the enumerations, and the two error classes.
//
// RECEIPT SHAPE (closed: an unknown field at any of these levels is a problem)
//   { schema, header, ruled, expectedEntries, entries[], tableBlockers[], counts, verdict }
//   entry = { id, category, disposition, requiresRealKms, gap, status, environment, realKms,
//             evidence[{kind,ref,summary}], verdict, blocking }
//   `gap` is null for a BLOCKER and, for a DECLARED_GAP, four PRESENCE booleans (owner,
//   memberFacingSentence, closureCondition, registerLine). The gap text itself stays in
//   dispositions.json and is never copied into a receipt.
//
// ENTRY VERDICTS (derived, never typed)
//   PASS                BLOCKER or DECLARED_GAP, status PASS, >=1 substantive evidence item and, when
//                       the index says requiresRealKms, realKms === true.
//   INVALID_EVIDENCE    status PASS but one of those fails.                              (blocks)
//   BLOCKING_FAIL       BLOCKER + FAIL.                                                  (blocks)
//   BLOCKING_NOT_RUN    BLOCKER + NOT_RUN (a missing result is NOT_RUN).                 (blocks)
//   ACCEPTED_GAP        DECLARED_GAP + FAIL with all four gap fields present. Never PASS.
//   GAP_UNDECLARED      DECLARED_GAP + FAIL with any gap field missing.                  (blocks)
//   NOT_RUN             DECLARED_GAP + NOT_RUN. Listed, non-blocking.
//
// OVERALL VERDICT
//   NOT_READY    any blocking entry, or any table blocker (below)
//   PROVISIONAL  nothing blocks but dispositions.ruled is not true
//   STEP4_READY  nothing blocks and dispositions.ruled === true
//
// DELIBERATE TIGHTENINGS OF THE ASSIGNMENT (each is listed in the hand-off notes, none can turn a
// spec-conforming input into a worse verdict than the spec gives except where stated):
//   1. The PASS evidence rule also applies to DECLARED_GAP + PASS (the spec states it for BLOCKER
//      only). A PASS with no evidence is a false claim whichever disposition carries it.
//   2. Table blocker: when ruled is true, a DECLARED_GAP whose status is NOT_RUN and whose gap
//      record is incomplete blocks the overall verdict (entry verdict stays NOT_RUN, as specified).
//      Otherwise a ruling with empty register lines could ship as STEP4_READY.
//   3. "Present" for a gap field means a non-blank string, not merely non-null.
//   4. An evidence item is "substantive" only if kind, ref and summary are all non-blank strings.
//   5. The base64 content rule is refined (see RULES) because the literal rule rejects honest paths.
//
// WHAT THE VALIDATOR CANNOT ESTABLISH
//   It proves a receipt is internally consistent and obeys the verdict policy given its raw fields
//   and the index/dispositions it is handed. It cannot prove a recorded status is TRUE: a runner
//   that lies consistently (status, evidence and verdict all edited together) produces a valid
//   receipt. Truth of status is the job of the falsifiers behind it.

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));

/* ------------------------------------------------------------------------- *
 * Vocabulary
 * ------------------------------------------------------------------------- */

export const SCHEMA = 'writer-source-intake-receipt/1';
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
const TABLE_BLOCKER_CODE = 'GAP_RECORD_INCOMPLETE_AT_RULING';

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
  'GAP_FLAGS_MISMATCH',
  'ENTRY_VERDICT_MISMATCH',
  'BLOCKING_FLAG_MISMATCH',
  'TABLE_BLOCKERS_MISMATCH',
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
const isPresent = (v) => typeof v === 'string' && v.trim().length > 0;
const isSubstantive = (e) => isObj(e) && isPresent(e.kind) && isPresent(e.ref) && isPresent(e.summary);
const clone = (v) => JSON.parse(JSON.stringify(v));
// An id is echoed in a message only if it has the shape of an obligation id; anything else could be content.
const SAFE_ID = /^[A-Za-z]{1,8}-\d{1,3}[a-z]?$/;
const safeId = (id) => (typeof id === 'string' && SAFE_ID.test(id) ? id : '<non-conforming id>');
const pick = (v, allowed) => (typeof v === 'string' && allowed.includes(v) ? v : '<invalid>');

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

function charClass(c) {
  if (c >= 'a' && c <= 'z') return 0;
  if (c >= 'A' && c <= 'Z') return 1;
  if (c >= '0' && c <= '9') return 2;
  return 3;
}

/** Fraction of adjacent character pairs that change class (lower/upper/digit/symbol). */
function transitionRate(s) {
  if (s.length < 2) return 0;
  let changes = 0;
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
  const entries = isObj(receipt) && Array.isArray(receipt.entries) ? receipt.entries : [];
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
    if (typeof o.category !== 'string') {
      throw new ReceiptInputError('BAD_INDEX', `obligation ${safeId(o.id)} has no string category`);
    }
    byId.set(o.id, o);
  }
  if (byId.size === 0) throw new ReceiptInputError('BAD_INDEX', 'the index lists no obligations (an empty index would pass vacuously)');
  if (hasOwn(index, 'count') && index.count !== index.obligations.length) {
    throw new ReceiptInputError('BAD_INDEX', 'index.count disagrees with the length of index.obligations');
  }
  return byId;
}

function gapFlagsOf(gap) {
  const g = isObj(gap) ? gap : {};
  return Object.fromEntries(GAP_FIELDS.map((f) => [f, isPresent(g[f])]));
}

function readDispositions(dispositions, byId) {
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
    map.set(id, { disposition: d.disposition, gapFlags: flags, gapComplete: flags ? GAP_FIELDS.every((f) => flags[f]) : false });
  }
  for (const k of Object.keys(dispositions.dispositions)) {
    if (!byId.has(k)) throw new ReceiptInputError('BAD_DISPOSITIONS', 'the disposition table names an id that is not in the index');
  }
  return map;
}

function readResults(results, byId) {
  if (!Array.isArray(results)) throw new ReceiptInputError('BAD_RESULTS', 'results must be an array');
  const RESULT_KEYS = ['id', 'status', 'environment', 'realKms', 'evidence'];
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
    const evidence = r.evidence === undefined ? [] : r.evidence;
    if (!Array.isArray(evidence)) throw new ReceiptInputError('BAD_EVIDENCE', `results[${i}] (${r.id}) evidence is not an array`);
    evidence.forEach((e, j) => {
      if (!isObj(e) || Object.keys(e).sort().join(',') !== 'kind,ref,summary' || !['kind', 'ref', 'summary'].every((k) => typeof e[k] === 'string')) {
        throw new ReceiptInputError('BAD_EVIDENCE', `results[${i}] (${r.id}) evidence[${j}] must be exactly { kind, ref, summary } of strings`);
      }
    });
    map.set(r.id, {
      status: r.status,
      environment: r.environment === undefined ? null : r.environment,
      realKms: r.realKms === undefined ? null : r.realKms,
      evidence: evidence.map((e) => ({ kind: e.kind, ref: e.ref, summary: e.summary })),
    });
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

export function deriveEntryVerdict({ disposition, status, evidenceCount, requiresRealKms, realKms, gapComplete }) {
  if (status === 'PASS') {
    const evidenced = evidenceCount >= 1;
    const kmsOk = !requiresRealKms || realKms === true;
    return evidenced && kmsOk ? 'PASS' : 'INVALID_EVIDENCE';
  }
  if (status === 'FAIL') {
    if (disposition === 'BLOCKER') return 'BLOCKING_FAIL';
    return gapComplete ? 'ACCEPTED_GAP' : 'GAP_UNDECLARED';
  }
  return disposition === 'BLOCKER' ? 'BLOCKING_NOT_RUN' : 'NOT_RUN';
}

function computeCounts(entries, tableBlockers) {
  const byVerdict = Object.fromEntries(ENTRY_VERDICTS.map((v) => [v, 0]));
  const byDisposition = Object.fromEntries(DISPOSITIONS.map((d) => [d, 0]));
  const byEnvironment = { E0: 0, E1: 0, E2: 0, none: 0 };
  let blocking = 0;
  for (const e of entries) {
    byVerdict[e.verdict] += 1;
    byDisposition[e.disposition] += 1;
    byEnvironment[e.environment === null ? 'none' : e.environment] += 1;
    if (e.blocking) blocking += 1;
  }
  return {
    entries: entries.length,
    byVerdict,
    byDisposition,
    byEnvironment,
    blocking,
    acceptedGaps: byVerdict.ACCEPTED_GAP,
    tableBlockers: tableBlockers.length,
  };
}

function deriveTableBlockers(entries, ruled) {
  if (!ruled) return [];
  return entries
    .filter((e) => e.disposition === 'DECLARED_GAP' && e.status === 'NOT_RUN' && !(e.gap && GAP_FIELDS.every((f) => e.gap[f] === true)))
    .map((e) => ({ id: e.id, code: TABLE_BLOCKER_CODE }));
}

function deriveOverall(entries, tableBlockers, ruled) {
  if (tableBlockers.length > 0 || entries.some((e) => e.blocking)) return 'NOT_READY';
  return ruled ? 'STEP4_READY' : 'PROVISIONAL';
}

/* ------------------------------------------------------------------------- *
 * buildReceipt
 * ------------------------------------------------------------------------- */

export function buildReceipt({ index, dispositions, results, header, canaryPrefix } = {}) {
  const byId = readIndex(index);
  const dmap = readDispositions(dispositions, byId);
  const rmap = readResults(results, byId);
  const hdr = readHeader(header);

  const entries = [];
  for (const [id, ob] of byId) {
    const d = dmap.get(id);
    const r = rmap.get(id) || { status: 'NOT_RUN', environment: null, realKms: null, evidence: [] };
    const verdict = deriveEntryVerdict({
      disposition: d.disposition,
      status: r.status,
      evidenceCount: r.evidence.filter(isSubstantive).length,
      requiresRealKms: ob.requiresRealKms,
      realKms: r.realKms,
      gapComplete: d.gapComplete,
    });
    entries.push({
      id,
      category: ob.category,
      disposition: d.disposition,
      requiresRealKms: ob.requiresRealKms,
      gap: d.gapFlags ? { ...d.gapFlags } : null,
      status: r.status,
      environment: r.environment,
      realKms: r.realKms,
      evidence: r.evidence,
      verdict,
      blocking: BLOCKING_VERDICTS.includes(verdict),
    });
  }

  const ruled = dispositions.ruled;
  const tableBlockers = deriveTableBlockers(entries, ruled);
  const receipt = {
    schema: SCHEMA,
    header: hdr,
    ruled,
    expectedEntries: byId.size,
    entries,
    tableBlockers,
    counts: computeCounts(entries, tableBlockers),
    verdict: deriveOverall(entries, tableBlockers, ruled),
  };

  const s = scrub(receipt, { canaryPrefix });
  if (!s.ok) throw new ReceiptContentLeak(labelFindings(receipt, s.findings));

  const v = validateReceipt(receipt, { index, dispositions, canaryPrefix });
  if (!v.ok) throw new ReceiptInputError('INTERNAL_INCONSISTENCY', `the builder produced a receipt its own validator refuses: ${v.problems.join(' | ')}`);
  return receipt;
}

/* ------------------------------------------------------------------------- *
 * validateReceipt -- INDEPENDENT. It shares only the reference-data readers above; the entry
 * verdict table, the tally, the table-blocker rule and the overall rule are written again here.
 * ------------------------------------------------------------------------- */

const VALIDATOR_RULES = Object.freeze({
  'BLOCKER/PASS': (x) => (x.evidenceOk && x.kmsOk ? 'PASS' : 'INVALID_EVIDENCE'),
  'BLOCKER/FAIL': () => 'BLOCKING_FAIL',
  'BLOCKER/NOT_RUN': () => 'BLOCKING_NOT_RUN',
  'DECLARED_GAP/PASS': (x) => (x.evidenceOk && x.kmsOk ? 'PASS' : 'INVALID_EVIDENCE'),
  'DECLARED_GAP/FAIL': (x) => (x.gapComplete ? 'ACCEPTED_GAP' : 'GAP_UNDECLARED'),
  'DECLARED_GAP/NOT_RUN': () => 'NOT_RUN',
});

export function rederiveEntryVerdict({ disposition, status, evidenceCount, requiresRealKms, realKms, gapComplete }) {
  const rule = VALIDATOR_RULES[`${disposition}/${status}`];
  if (!rule) return null;
  return rule({
    evidenceOk: Number.isInteger(evidenceCount) && evidenceCount > 0,
    kmsOk: requiresRealKms === false || realKms === true,
    gapComplete: gapComplete === true,
  });
}

const LEGACY_KEY = /^(exitCode|exit_code|testsExpected|tests_expected|testsRun|testsPassed|coverage|productionDataTouched|totalExpected|expectedTotal|totalTests)$/;
const ENTRY_KEYS = ['id', 'category', 'disposition', 'requiresRealKms', 'gap', 'status', 'environment', 'realKms', 'evidence', 'verdict', 'blocking'];
const TOP_KEYS = ['schema', 'header', 'ruled', 'expectedEntries', 'entries', 'tableBlockers', 'counts', 'verdict'];
const COUNT_KEYS = ['entries', 'byVerdict', 'byDisposition', 'byEnvironment', 'blocking', 'acceptedGaps', 'tableBlockers'];

function flattenNumbers(o, prefix, out) {
  for (const [k, v] of Object.entries(o)) {
    const p = prefix ? `${prefix}.${k}` : k;
    if (isObj(v)) flattenNumbers(v, p, out);
    else out.set(p, v);
  }
  return out;
}

export function validateReceipt(receipt, { index, dispositions, canaryPrefix } = {}) {
  const problems = [];
  const codes = new Set();
  const add = (code, detail) => {
    if (!PROBLEM_CODES.includes(code)) throw new Error(`validator used an unregistered problem code ${code}`);
    codes.add(code);
    problems.push(detail ? `${code}: ${detail}` : code);
  };

  try {
    let byId;
    let dmap;
    try {
      byId = readIndex(index);
      dmap = readDispositions(dispositions, byId);
    } catch (e) {
      add('CONTEXT_INVALID', e instanceof ReceiptInputError ? e.message : 'the reference data could not be read');
      return { ok: false, problems, codes: [...codes].sort() };
    }
    const ruledCtx = dispositions.ruled;

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

    // ---- header: plain JSON, no legacy constants smuggled in ----
    try {
      readHeader(receipt.header);
      if (receipt.header === undefined) add('HEADER_INVALID', 'header is missing');
      const scanKeys = (v, depth) => {
        if (depth > 10 || !isObj(v)) return;
        for (const k of Object.keys(v)) {
          if (LEGACY_KEY.test(k)) add('LEGACY_EXIT_CODE_FIELD', `header field ${k} is a legacy exit-code/hard-coded-total construction`);
          scanKeys(v[k], depth + 1);
        }
      };
      scanKeys(receipt.header, 0);
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

    const derived = []; // one per index id: { id, verdict, blocking, environment, disposition, status }
    for (const [id, ob] of byId) {
      const d = dmap.get(id);
      const e = recorded.get(id);
      if (!e) {
        add('MISSING_ENTRY', `${id} has no entry (it is treated as NOT_RUN below)`);
        const verdict = d.disposition === 'BLOCKER' ? 'BLOCKING_NOT_RUN' : 'NOT_RUN';
        derived.push({ id, verdict, blocking: BLOCKING_VERDICTS.includes(verdict), environment: null, disposition: d.disposition, status: 'NOT_RUN' });
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
      if (!STATUSES.includes(e.status)) bad('status is not PASS/FAIL/NOT_RUN');
      if (!(e.environment === null || ENVIRONMENTS.includes(e.environment))) bad('environment is not null/E0/E1/E2');
      if (!(e.realKms === null || typeof e.realKms === 'boolean')) bad('realKms is not null/boolean');
      if (STATUSES.includes(e.status) && e.status !== 'NOT_RUN') {
        if (!ENVIRONMENTS.includes(e.environment)) bad('a run obligation declares no environment');
        if (typeof e.realKms !== 'boolean') bad('a run obligation does not declare realKms');
      }
      if (!Array.isArray(e.evidence)) bad('evidence is not an array');
      else if (!e.evidence.every((x) => isObj(x) && Object.keys(x).sort().join(',') === 'kind,ref,summary' && ['kind', 'ref', 'summary'].every((k) => typeof x[k] === 'string'))) {
        bad('an evidence item is not exactly { kind, ref, summary } of strings');
      }
      if (!ENTRY_VERDICTS.includes(e.verdict)) bad('verdict is not a known entry verdict');
      if (typeof e.blocking !== 'boolean') bad('blocking is not a boolean');
      if (!(e.gap === null || (isObj(e.gap) && Object.keys(e.gap).sort().join(',') === [...GAP_FIELDS].sort().join(',') && GAP_FIELDS.every((f) => typeof e.gap[f] === 'boolean')))) {
        bad('gap is neither null nor four boolean presence flags');
      }

      if (e.category !== ob.category) add('CATEGORY_MISMATCH', `${id}: category differs from the index`);
      if (e.disposition !== d.disposition) add('DISPOSITION_MISMATCH', `${id}: receipt says ${pick(e.disposition, DISPOSITIONS)}, the table says ${d.disposition}`);
      if (e.requiresRealKms !== ob.requiresRealKms) add('REQUIRES_REAL_KMS_MISMATCH', `${id}: receipt says ${String(e.requiresRealKms === true)}, the index says ${ob.requiresRealKms}`);
      const wantGap = d.gapFlags;
      const gotGap = e.gap;
      const gapSame = wantGap === null ? gotGap === null : isObj(gotGap) && GAP_FIELDS.every((f) => gotGap[f] === wantGap[f]);
      if (!gapSame) add('GAP_FLAGS_MISMATCH', `${id}: gap presence flags differ from the disposition table`);

      // fail closed when the raw fields are unusable: treat as no valid result
      const usable = shapeOk;
      const status = usable ? e.status : 'NOT_RUN';
      const verdict = rederiveEntryVerdict({
        disposition: d.disposition,
        status,
        evidenceCount: usable ? e.evidence.filter(isSubstantive).length : 0,
        requiresRealKms: ob.requiresRealKms,
        realKms: usable ? e.realKms : null,
        gapComplete: d.gapComplete,
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
      });
    }

    // ---- table blockers: recomputed from the reference data ----
    const wantTB = ruledCtx
      ? derived
          .filter((x) => x.disposition === 'DECLARED_GAP' && x.status === 'NOT_RUN' && !dmap.get(x.id).gapComplete)
          .map((x) => `${x.id}|${TABLE_BLOCKER_CODE}`)
          .sort()
      : [];
    const gotTB = Array.isArray(receipt.tableBlockers) && receipt.tableBlockers.every((t) => isObj(t) && typeof t.id === 'string' && typeof t.code === 'string')
      ? receipt.tableBlockers.map((t) => `${t.id}|${t.code}`).sort()
      : null;
    if (gotTB === null || gotTB.join(';') !== wantTB.join(';')) {
      add('TABLE_BLOCKERS_MISMATCH', `recorded table blockers differ from the ${wantTB.length} re-derived`);
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
    const wantOverall = wantTB.length > 0 || derived.some((x) => x.blocking) ? 'NOT_READY' : ruledCtx === true ? 'STEP4_READY' : 'PROVISIONAL';
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
      evidence: [{ kind: 'synthetic-check', ref: `synthetic:${ob.id}`, summary: 'fictional check ran; assertions=3' }],
    });
  }
  return results;
}

const syntheticGap = () => ({
  owner: 'Synthetic Owner (fictional)',
  memberFacingSentence: 'Fictional sentence for a synthetic gap.',
  closureCondition: 'Fictional closure condition.',
  registerLine: 'Fictional register line.',
});

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
function fresh({ ruled = false, completeGapCount = 0, incompleteGapCount = 0, run = {}, runFor } = {}) {
  const { index, dispositions } = loadSuiteData();
  dispositions.ruled = ruled;
  const gapIds = ensureGapIds(dispositions, Math.max(1, completeGapCount + incompleteGapCount));
  gapIds.forEach((id, i) => setGap(dispositions, id, i < completeGapCount));
  const blockers = index.obligations.filter((o) => dispositions.dispositions[o.id].disposition === 'BLOCKER').map((o) => o.id);
  const picks = { gapIds, blockers };
  const useRun = typeof runFor === 'function' ? runFor(picks, index, dispositions) : run;
  const results = syntheticResults(index, dispositions, useRun);
  const receipt = clone(buildReceipt({ index, dispositions, results, header: { suite: 'writer-source-intake', kind: 'synthetic' } }));
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

function recount(r) {
  r.counts = computeCounts(r.entries, r.tableBlockers);
  r.verdict = deriveOverall(r.entries, r.tableBlockers, r.ruled);
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
      cached = { receipt: b.receipt, index: b.index, dispositions: b.dispositions };
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
    context: () => ({ index: copy(built().index), dispositions: copy(built().dispositions) }),
  });
}

const randHex = (bytes) => crypto.randomBytes(bytes).toString('hex');

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
        recount(r);
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
        recount(r);
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
        recount(r);
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
        recount(r);
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
        recount(r);
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
        recount(r);
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
        recount(r);
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
    'An entry is silently dropped while expectedEntries and counts.entries keep the full, hard-coded figure, so the totals still look complete.',
    ['MISSING_ENTRY', 'COUNTS_MISMATCH', 'EXPECTED_ENTRIES_MISMATCH'],
    () => {
      const f = fresh();
      f.receipt = lieAbout(f.receipt, (r) => {
        const full = r.entries.length;
        const at = r.entries.map((e) => e.disposition).lastIndexOf('BLOCKER');
        r.entries.splice(at, 1);
        recount(r);
        r.counts.entries = full;
      });
      return f;
    },
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
        recount(r);
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
]);

/* ------------------------------------------------------------------------- *
 * selfTest
 * ------------------------------------------------------------------------- */

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

  /* ---- 2. buildReceipt: input rejection and scrub wiring ---- */
  check('buildReceipt THROWS on an unknown id, naming no content', () => {
    const t = throwsWith(() => buildReceipt({ index: tinyIndex(), dispositions: tinyDisp(), results: [passResult('ok', { id: 'T-9' })] }), ReceiptInputError, 'UNKNOWN_ID');
    return t.ok ? pass(t.e.message) : fail(`got ${t.e && t.e.message}`);
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

  check('ACCEPTED_GAP is never PASS: counted on its own line, absent from the pass tally, non-blocking', () => {
    const g = { ruled: true, dispositions: { 'T-1': { disposition: 'DECLARED_GAP', gap: syntheticGap() } } };
    const r = buildReceipt({ index: tinyIndex(), dispositions: g, results: [{ id: 'T-1', status: 'FAIL', environment: 'E1', realKms: false, evidence: [] }] });
    const e = r.entries[0];
    return e.verdict === 'ACCEPTED_GAP' && !e.blocking && r.counts.byVerdict.PASS === 0 && r.counts.acceptedGaps === 1 && r.counts.byVerdict.ACCEPTED_GAP === 1 && r.verdict === 'STEP4_READY'
      ? pass('ACCEPTED_GAP counted separately; PASS=0; overall still STEP4_READY because the gap is declared')
      : fail(`${e.verdict} blocking=${e.blocking} PASS=${r.counts.byVerdict.PASS} accepted=${r.counts.acceptedGaps} overall=${r.verdict}`);
  });

  check('GAP_UNDECLARED blocks even when ruled (an incomplete gap never ships)', () => {
    const g = { ruled: true, dispositions: { 'T-1': { disposition: 'DECLARED_GAP', gap: { owner: 'x', memberFacingSentence: 'y', closureCondition: 'z', registerLine: null } } } };
    const r = buildReceipt({ index: tinyIndex(), dispositions: g, results: [{ id: 'T-1', status: 'FAIL', environment: 'E1', realKms: false, evidence: [] }] });
    return r.entries[0].verdict === 'GAP_UNDECLARED' && r.verdict === 'NOT_READY' ? pass('GAP_UNDECLARED -> NOT_READY') : fail(`${r.entries[0].verdict} / ${r.verdict}`);
  });

  /* ---- 4. whole-suite runs on the real index ---- */
  const ctxOf = (mut) => {
    const s = loadSuiteData();
    mut(s);
    return s;
  };
  const build = (s, run) => buildReceipt({ index: s.index, dispositions: s.dispositions, results: syntheticResults(s.index, s.dispositions, run), header: { suite: 'writer-source-intake', kind: 'synthetic' } });
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

  check('flipping ruled to true in a copy gives STEP4_READY only when no blocker is open and gap records are complete', () => {
    const s = ctxOf((x) => {
      x.dispositions.ruled = true;
      for (const id of ensureGapIds(x.dispositions, 1)) setGap(x.dispositions, id, true);
      for (const id of Object.keys(x.dispositions.dispositions)) if (x.dispositions.dispositions[id].disposition === 'DECLARED_GAP') setGap(x.dispositions, id, true);
    });
    const open = build(s, { gapPolicy: 'notRun' });
    const ready = open.verdict === 'STEP4_READY' && validateReceipt(open, s).ok;
    const bids = blockerIds(s);
    const withOpenNotRun = build(s, { gapPolicy: 'notRun', skip: [bids[0]] });
    const withOpenFail = build(s, { gapPolicy: 'notRun', fail: [bids[0]] });
    const lastPass = build(s, { gapPolicy: 'notRun' });
    const bad = [];
    if (!ready) bad.push(`all-pass, ruled -> ${open.verdict}`);
    if (withOpenNotRun.verdict !== 'NOT_READY') bad.push(`one blocker unrun -> ${withOpenNotRun.verdict}`);
    if (withOpenFail.verdict !== 'NOT_READY') bad.push(`one blocker failing -> ${withOpenFail.verdict}`);
    if (!validateReceipt(withOpenNotRun, s).ok || !validateReceipt(withOpenFail, s).ok) bad.push('validator refused an honest NOT_READY receipt');
    if (lastPass.verdict !== 'STEP4_READY') bad.push('repeat build differs');
    return bad.length ? fail(bad.join('; ')) : pass('ruled+all blockers PASS -> STEP4_READY; one open blocker (unrun or failing) -> NOT_READY');
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
    const accepted = WRONG_RECEIPTS.filter((w) => validateReceipt(w.make(), normalized).ok).map((w) => w.name);
    return accepted.length ? fail(`accepted under the as-shipped shape: ${accepted.join(',')}`) : pass(`${WRONG_RECEIPTS.length} refused`);
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
    return !badCtx.ok && badCtx.codes.includes('CONTEXT_INVALID') && !exc.ok && exc.codes.includes('VALIDATOR_EXCEPTION') && !noCtx.ok && noCtx.codes.includes('CONTEXT_INVALID')
      ? pass('CONTEXT_INVALID, VALIDATOR_EXCEPTION, and missing context all refused')
      : fail(`badCtx=${badCtx.codes} exc=${exc.codes} noCtx=${noCtx.codes}`);
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
  check('property: 60 random runs over random tables build, validate, and re-derive the same verdict; 12 kinds of lie are always refused', () => {
    const rng = mulberry32(0x5eed1234);
    const pickOne = (a) => a[Math.floor(rng() * a.length)];
    const problems = [];
    let built = 0;
    let lies = 0;
    const verdictsSeen = new Set();
    const overallSeen = new Set();

    for (let iter = 0; iter < 60; iter++) {
      const clean = iter % 3 !== 0; // two runs in three are "clean": BLOCKERs pass with real evidence, gap records complete
      const s = loadSuiteData();
      s.dispositions.ruled = rng() < 0.5;
      for (const id of Object.keys(s.dispositions.dispositions)) {
        if (rng() < 0.12) s.dispositions.dispositions[id] = { disposition: 'DECLARED_GAP', gap: null };
        const d = s.dispositions.dispositions[id];
        if (d.disposition === 'DECLARED_GAP') {
          d.gap = Object.fromEntries(GAP_FIELDS.map((f) => [f, clean || rng() < 0.75 ? `fictional ${f}` : pickOne([null, '', '  '])]));
        }
      }
      const results = [];
      for (const o of s.index.obligations) {
        const isBlocker = s.dispositions.dispositions[o.id].disposition === 'BLOCKER';
        const r = rng();
        if (clean) {
          // blockers always pass; gaps pass, fail (complete record -> ACCEPTED_GAP) or are left unrun
          const status = isBlocker ? 'PASS' : r < 0.4 ? 'PASS' : r < 0.6 ? 'FAIL' : 'NOT_RUN';
          if (status === 'NOT_RUN') continue;
          results.push({ id: o.id, status, environment: pickOne(ENVIRONMENTS), realKms: o.requiresRealKms, evidence: [{ kind: 'synthetic-check', ref: `synthetic:${o.id}`, summary: 'fictional check ran' }] });
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
          evidence: Array.from({ length: n }, (_, i) => ({ kind: 'synthetic-check', ref: `synthetic:${o.id}:${i}`, summary: pickOne(['fictional check ran', ' ', 'assertions=2']) })),
        });
      }
      const receipt = buildReceipt({ index: s.index, dispositions: s.dispositions, results, header: { iter } });
      built++;
      overallSeen.add(receipt.verdict);
      receipt.entries.forEach((e) => verdictsSeen.add(e.verdict));
      const v = validateReceipt(receipt, s);
      if (!v.ok) {
        problems.push(`iter ${iter}: honest receipt refused: ${v.problems[0]}`);
        continue;
      }

      const mutations = [
        ['verdict relabelled', (r) => { const e = pickOne(r.entries); e.verdict = pickOne(ENTRY_VERDICTS.filter((x) => x !== e.verdict)); }],
        ['blocking flag flipped', (r) => { const e = pickOne(r.entries); e.blocking = !e.blocking; }],
        ['status changed, verdict kept', (r) => { const e = pickOne(r.entries); e.status = pickOne(STATUSES.filter((x) => x !== e.status)); }],
        ['evidence removed from a PASS', (r) => { const e = r.entries.find((x) => x.verdict === 'PASS' && x.evidence.length); if (!e) throw new Error('n/a'); e.evidence = []; }],
        ['count nudged', (r) => { const k = pickOne(['blocking', 'acceptedGaps', 'tableBlockers', 'entries']); r.counts[k] += 1; }],
        ['byVerdict nudged', (r) => { r.counts.byVerdict[pickOne(ENTRY_VERDICTS)] += 1; }],
        ['overall relabelled', (r) => { r.verdict = pickOne(OVERALL_VERDICTS.filter((x) => x !== r.verdict)); }],
        ['entry dropped', (r) => { r.entries.splice(Math.floor(rng() * r.entries.length), 1); }],
        ['entry duplicated over another', (r) => { r.entries[r.entries.length - 1] = clone(r.entries[0]); }],
        ['disposition swapped', (r) => { const e = pickOne(r.entries); e.disposition = e.disposition === 'BLOCKER' ? 'DECLARED_GAP' : 'BLOCKER'; }],
        ['requiresRealKms flipped', (r) => { const e = pickOne(r.entries); e.requiresRealKms = !e.requiresRealKms; }],
        ['expectedEntries nudged', (r) => { r.expectedEntries += 1; }],
        ['unknown field added', (r) => { r.entries[0].extra = 1; }],
        ['ruled flipped', (r) => { r.ruled = !r.ruled; }],
        ['leak planted in evidence', (r) => { const e = pickOne(r.entries); e.evidence = [{ kind: 'k', ref: 'r', summary: crypto.randomUUID() }]; }],
        ['leak planted in header', (r) => { r.header.h = `${DEFAULT_CANARY_PREFIX}${hex8U()}`; }],
      ];
      for (const [label, fn] of mutations) {
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
        if (validateReceipt(copy, s).ok) problems.push(`iter ${iter}: lie accepted: ${label}`);
      }
    }
    if (verdictsSeen.size !== ENTRY_VERDICTS.length) problems.push(`random runs exercised ${verdictsSeen.size} of ${ENTRY_VERDICTS.length} entry verdicts`);
    if (overallSeen.size !== OVERALL_VERDICTS.length) problems.push(`random runs produced only ${[...overallSeen].sort()} of the overall verdicts`);
    return problems.length ? fail(`${problems.length} problem(s): ${problems.slice(0, 3).join(' | ')}`) : pass(`${built} honest receipts accepted, ${lies} single-field lies refused; entry verdicts seen ${verdictsSeen.size}/${ENTRY_VERDICTS.length}; overall ${[...overallSeen].sort().join('/')}`);
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

  check('hygiene: zero dependencies -- every import is a node: built-in (checker fires on a planted bare import)', () => {
    const planted = nonBuiltinImports("import x from 'left-pad';\nimport fs from 'node:fs';");
    const real = nonBuiltinImports(selfSource);
    return planted.length === 1 && real.length === 0 ? pass('planted bare import found; own imports are all node:') : fail(`planted=${planted} real=${real}`);
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
