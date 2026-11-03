#!/usr/bin/env node
/**
 * scanners.mjs -- content-free residue scanners for the Writer original-file intake
 * acceptance instrument. Plain Node ESM, node: built-ins only, zero npm dependencies.
 *
 * PURPOSE
 *   After an intake run, the question is "did a secret leave the place it was meant to
 *   stay?" -- the canary written into a fixture's body, the bytes of the original file,
 *   the plaintext data key. This module answers it for directories (a vault, a log
 *   directory, a dump), for text (a log excerpt) and for buffers, in every encoding a
 *   careless code path is likely to leave a secret in, WITHOUT ever echoing the secret.
 *
 * EXPORTS
 *   makeNeedles({ canary, originalBytes, keyBytes }, options?) -> NeedleSet
 *       options: { encodings?, partial?, probeBytes?, siblings?: Uint8Array[], assertUnique?: boolean, siblingWorkBudget?: number }  -- `siblings` are other
 *       documents built from the SAME template (other uploads, other canaries); a probe window found verbatim in any of them is
 *       template boilerplate and is never used. `assertUnique` declares the original template-free. See PROBES OF THE ORIGINAL.
 *   assertArmed(needles, opts?)         throws ArmingError when the set could not find a leak
 *   scanBuffer(buf, needles, opts?)     -> { bytesScanned, hits, hitsBySecret, vacuous, vacuousReason, verdict }
 *   scanText(text, needles, opts?)      -> { chars, ...same }
 *   scanDirectory(dir, needles, opts?)  -> { filesScanned, bytesScanned, hits, hitsBySecret, nameHits,
 *                                            skipped, complete, dirsVisited, vacuous, vacuousReason, verdict }
 *   scanForMagic(dir, opts?)            -> detects plaintext PDF / ZIP(docx) containers in a vault
 *   KNOWN_WRONG                         deliberately weak scanners, each with a probe that must kill it
 *   selfTest()                          -> { ok, checks: [{ name, ok, detail }], unverified: [] }
 *   mutationAudit()                     -> Promise<{ ok, results }>   (node scanners.mjs --mutation-audit)
 *   REQUIRED_ENCODINGS, EXTRA_ENCODINGS, ENCODING_ORDER, SECRET_NAMES, MAGIC, ArmingError
 *
 * CONTENT-FREE RULE (what a result may contain)
 *   A relative path, an encoding name, a secret NAME ('canary' | 'original' | 'key'), an integer count,
 *   a skip reason code. Never needle bytes, never matched context, never an absolute path, never an
 *   fs error message. A file or directory NAME that itself contains a needle is replaced by
 *   '<name-redacted:N>' in every output path, because reporting that path would report the secret.
 *   `hits` rows are exactly { path, encoding, count }; the secret name is carried in `hitsBySecret`
 *   ({ path, secret, encoding, count }) so the strict row shape other modules code against is unchanged.
 *
 * ENCODINGS CARRIED PER SECRET (labels, in priority order)
 *   raw, utf8, utf16le, utf16be, base64 (3 alignments), base64url (3 alignments),
 *   hex-lower / hex-upper (plain, colon-separated 'ab:cd', C-array '0xab,0xcd', escape '\xab\xcd'),
 *   urlencoded (RFC 3986 and encodeURIComponent keep-sets x hex case x '+' for space, AND the percent-encoded base64
 *   text of the secret: '+' -> %2B and '/' -> %2F, or only '+', in both hex cases, at all three base64 alignments),
 *   json-escaped (JSON.stringify, ensure_ascii \uXXXX lower/upper, '\/' form), plus two EXTRA labels:
 *   byte-array  decimals of the interior bytes: Buffer#toJSON and Array#join ('12,34,...'), AND the index-keyed object
 *               JSON.stringify(Uint8Array) gives ('"1":12,"2":34,...', the shape the AWS SDK v3 hands back for a KMS
 *               Plaintext, indices from 0 only). Scanned in the whitespace-stripped lane, so pretty-printed JSON
 *               (JSON.stringify(x, null, 2)), 'a, b, c' and util.inspect(Uint8Array) are covered with no extra pattern.
 *   case-folded the TEXT form of a secret lower-cased, upper-cased, capitalised, and word-capitalised (what a Postgres
 *               tsvector, a search index or a slug leaves behind). Only for secrets that are valid text.
 *   base64 of a SUBSTRING depends on its offset mod 3, so each alignment is trimmed to the characters
 *   that depend only on the secret's own bytes (verified in selfTest against a differential oracle, not
 *   against this module's own trimming).
 *
 * PROBES OF THE ORIGINAL (why a window must be PROVABLY specific to this file)
 *   The original is matched by 48-byte windows, not whole. A window that is template boilerplate (the XML wrapper of a
 *   stored DOCX, a PDF page-tree, the EPUB container) occurs in EVERY upload built from the same template, so using it
 *   reports an unrelated document as "the original leaked". Entropy does not cure that: a deflated DOCX part that is
 *   identical in every upload is just as random-looking as a unique one (measured on this suite's own builders: 142 of 275
 *   windows of a deflated DOCX are high-entropy AND present in every other upload; 275 windows, 5 other uploads). So a window is used only when
 *     canary-anchored     it contains the upload's own canary plus 16 bytes of context each side, so it cannot occur in an
 *                         upload with a different canary (needs the canary to be a verbatim substring of the original); or
 *     unique-vs-siblings  the caller supplied `siblings` (other uploads from the SAME template, other canaries) and NO
 *                         16-byte block of the window (blocks every 4 bytes) occurs in any of them. Testing the WHOLE window is
 *                         not enough: in a ZIP the central directory carries the same entry names and the same CRCs of the
 *                         unchanged template parts in every upload and differs only in a few size / offset fields, so a window
 *                         there is absent from every sibling as a whole while most of it is template; measured on this
 *                         suite's own deflated DOCX, that region produced 32 of 32 misreports that remained after the
 *                         whole-window rule (J7 reproduces the mechanism deterministically). This is evidence RELATIVE to the
 *                         siblings, and for a COMPRESSED container it stays probabilistic: an unseen upload can reproduce a
 *                         window of compressed bytes that none of the siblings has (see NOT COVERED). The comparison is bounded
 *                         by `siblingWorkBudget` (bytes compared; default 4e9): windows not judged within it are never used; or
 *     asserted-unique     the caller passed `assertUnique: true`, declaring that no byte of the original comes from a
 *                         template (random, encrypted, a one-off file); then windows with >= 75% distinct bytes qualify.
 *                         This is a declaration, not a proof, and it is visible in describe() as the window's `basis`.
 *   Windows are taken from the head, the tail and four interior positions (the provable window nearest each target), so a
 *   leak of only the first or last few KiB of a large original is also caught when provable bytes lie there. If NO window
 *   qualifies, makeNeedles THROWS: an original with no provable probe would either flag unrelated documents or detect
 *   nothing, and neither may pass silently.
 *
 * ALIASING (said once, so nobody guesses)
 *   Two encodings of the same secret that produce byte-identical patterns are ONE pattern; a hit is
 *   attributed to the earlier label in priority order. The real canary (WSICANARY + hex) is plain
 *   alphanumeric, so its raw, utf8, urlencoded and json-escaped forms are all the same bytes and report as
 *   'raw'. That is correct (it IS the same bytes) and assertArmed counts an alias as covered.
 *
 * COUNT SEMANTICS
 *   `count` is the number of distinct OCCURRENCES: matches that overlap are one occurrence (several variants of one
 *   label can match the same bytes -- a plain JSON pattern is a suffix of its '\\/'-escaped sibling when the secret starts
 *   with '/'), adjacent copies are separate, and the result does not depend on how the file was chunked. For the
 *   original (probed by several windows) the count is the maximum over probes: one whole copy is 1, not one per probe.
 *   Different labels are reported independently, so one UTF-16LE occurrence of a Latin-1 secret preceded by a NUL byte
 *   also reports utf16be (its BE bytes are genuinely there, one byte shifted); a secret with CJK/emoji has no such overlap.
 *
 * COVERAGE LAW (why VACUOUS exists)
 *   A scan that visited no files, read no bytes, or skipped anything it could not read (symlink not
 *   followed, oversize, special file, unreadable) never returns CLEAN: absence is only established over what
 *   was actually read. verdict is HITS when there is any hit, else VACUOUS with a vacuousReason when
 *   coverage is not established, else CLEAN.
 *
 * WRAPPED TEXT
 *   base64/base64url/hex are also searched with spaces, tabs, CR and LF removed, so a PEM/MIME-wrapped copy is found. That
 *   only matters when the wrap column is shorter than the pattern: a 32-byte key is ~44 base64 characters and is never
 *   split by 64- or 76-column wrapping, so the selfTest wraps at 16/20/33 columns and proves the wrap really split it.
 *
 * NOT COVERED (honest list; none of these is detected, and no check here claims otherwise)
 *   - Layered encodings (base64 of UTF-16, gzip/deflate/zlib of a plaintext original, double base64), and case-folding
 *     of any encoded form (an upper-cased base64 text is not recognised; only the TEXT form is case-folded).
 *     scanForMagic catches an UNCOMPRESSED PDF/ZIP container, not a gzip stream.
 *   - Hex dumps in xxd/hexdump layout (offset column and ASCII gutter interleaved) and dash-separated hex; hex bytes
 *     separated by anything other than whitespace, ':' or the C-array / backslash-x forms above.
 *   - A byte array printed with an index offset other than 0 (JSON.stringify of a Uint8Array that CONTAINS the key at a
 *     non-zero position keys its elements by that position); a Buffer printed by util.inspect beyond Node's 50-byte
 *     limit ('... N more bytes'); a typed array of 16/32-bit elements; decimal bytes with a separator other than ',' or
 *     whitespace (';', '|'); byte values printed as signed (Int8Array) numbers.
 *   - Percent-encoding of base64URL text (its alphabet needs none) and double percent-encoding ('%252B').
 *   - Any other alphabet (base32, base58, ...); a LOSSY decode (Buffer#toString() of a binary key, which replaces invalid
 *     bytes with U+FFFD and cannot be reversed); a MIXED printable / escaped repr (Python bytes repr, Go %q: part of the
 *     bytes appear as characters, part as '\xNN'); only the all-escaped '\xNN' form and the latin1-string form are covered.
 *   - A leak of the ORIGINAL when it is a COMPRESSED container (deflated DOCX, Flate PDF) armed from siblings: a window of
 *     compressed bytes is not template by construction, so an unseen upload can reproduce one that no sibling has. Measured
 *     with this suite's own builders (300 unseen uploads per cell, three and six siblings): deflated DOCX 3 and 2 misreported,
 *     Flate text PDF 0 and 1, stored DOCX 0 and 0, EPUB 0 and 0. Going from three to six siblings did not reduce it, so a
 *     single 'original' hit on such a container is an indication to corroborate (the canary, or a second probe), not proof.
 *     A leak of the whole file hits every probe; the canary-anchored basis has no such residual.
 *   - A secret split across two files, or across an fs boundary (sparse files, extended attributes, ADS).
 *   - Substrings of the canary/key shorter than the whole value (the whole value is the needle).
 *     The original is probed by up to six 48-byte windows (head, tail, four interior), not byte-for-byte; a partial leak
 *     that holds none of the windows is missed, and a stored-text original with neither siblings nor a canary inside it
 *     cannot be armed at all (makeNeedles throws).
 *   - File names that are not valid UTF-8 are decoded lossily by readdir, cannot be reopened, and are reported as skipped
 *     (so the scan is VACUOUS, not CLEAN). A symlinked ROOT is resolved; symlinks below it are not followed by default.
 *   - Unreadable files (EACCES) are reported as skipped. A permission denial itself can only be provoked when not root, but
 *     the branch it takes (open / readdir / lstat throws) is pinned for root too, through names readdir lists and the
 *     filesystem cannot resolve (D11a, D11b; see `unverified` for the one case that stays unexercised).
 *
 * MAGIC FALSE-POSITIVE NOTE
 *   A vault holds ciphertext, so a bare 4-byte 'PK\x03\x04' occurs by chance every ~4 GiB. scanForMagic
 *   therefore accepts a bare signature only at the start of a file (the position a real container sits at)
 *   and requires structurally plausible header bytes everywhere else.
 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import util from 'node:util';
import zlib from 'node:zlib';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

/* ========================================================================= *
 * Constants and errors
 * ========================================================================= */

export const REQUIRED_ENCODINGS = Object.freeze([
  'raw', 'utf8', 'utf16le', 'utf16be', 'base64', 'base64url',
  'hex-lower', 'hex-upper', 'urlencoded', 'json-escaped',
]);
export const EXTRA_ENCODINGS = Object.freeze(['byte-array', 'case-folded']);
export const ENCODING_ORDER = Object.freeze([...REQUIRED_ENCODINGS, ...EXTRA_ENCODINGS]);
export const SECRET_NAMES = Object.freeze(['canary', 'original', 'key']);

export const MIN_SECRET_BYTES = 12;
export const MIN_PATTERN_BYTES = 8;
export const DEFAULT_PROBE_BYTES = 48;
/** `assertUnique` admits a window only when at least this fraction of its bytes are distinct (random 48B: ~91%, 0.004% below 75%; stored DOCX/PDF/EPUB text: <= 65%). */
export const PROBE_MIN_DISTINCT_FRACTION = 0.75;
const PROBE_MIN_DISTINCT_ANY = 8; // below this a window is padding, never evidence
const PROBE_ANCHOR_CONTEXT = 16;
const PROBE_INTERIOR_TARGETS = 4;
const PROBE_MAX_CANDIDATES = 700;
/**
 * A window that shares ANY run of PROBE_SHARED_RUN bytes with a sibling is template, even when the WHOLE window occurs in
 * none of them: in a ZIP the central directory holds the same entry names and the same CRCs of the unchanged template parts in
 * every upload and differs only in a few size / offset fields, so a window there is "absent from every sibling" while most of
 * it is shared. Candidate runs start every PROBE_SHARED_STRIDE bytes, so every shared run of PROBE_SHARED_RUN + STRIDE - 1
 * (19) bytes or more is found, whatever its alignment inside the window.
 */
const PROBE_SHARED_RUN = 16;
const PROBE_SHARED_STRIDE = 4;
/** Bytes compared against siblings while choosing probes (blocks x sibling bytes per window judged). Bounds a large, mostly-template original. */
const DEFAULT_SIBLING_WORK_BUDGET = 4e9;
export const DEFAULT_MAX_FILE_BYTES = 64 * 1024 * 1024;
export const DEFAULT_CHUNK_BYTES = 64 * 1024;
const DEFAULT_MAX_ENTRIES = 200000;
const DEFAULT_MAX_DEPTH = 64;

/** Labels whose patterns are scanned in the whitespace-stripped lane (PEM / MIME wrapped text). */
const TEXT_LANE_LABELS = new Set(['base64', 'base64url', 'hex-lower', 'hex-upper', 'byte-array']);

export class ArmingError extends Error {
  constructor(message, problems = []) {
    super(message);
    this.name = 'ArmingError';
    this.problems = problems;
  }
}

const LABEL_INDEX = new Map(ENCODING_ORDER.map((l, i) => [l, i]));
const SECRET_INDEX = new Map(SECRET_NAMES.map((l, i) => [l, i]));

/* ========================================================================= *
 * Pattern generation (one function per encoding family)
 * ========================================================================= */

function distinctBytes(b) {
  return new Set(b).size;
}

function isUtf8RoundTrip(b) {
  return Buffer.from(b.toString('utf8'), 'utf8').equals(b);
}

/**
 * The base64 characters that depend ONLY on B when B sits at offset k (mod 3) inside a larger
 * stream: drop the leading characters that mix in the preceding bytes (2 for k=1, 3 for k=2) and the
 * final character when B does not end on a 3-byte boundary (it mixes in the FOLLOWING byte).
 */
function b64Region(B, k, url) {
  const total = k + B.length;
  const full = Buffer.concat([Buffer.alloc(k), B]).toString('base64').replace(/=+$/, '');
  const skip = [0, 2, 3][k];
  const rem = total % 3;
  let s = full.slice(skip);
  if (rem !== 0) s = s.slice(0, -1);
  if (url) s = s.replace(/\+/g, '-').replace(/\//g, '_');
  return Buffer.from(s, 'latin1');
}

const isUnreserved = (c) =>
  (c >= 0x30 && c <= 0x39) || (c >= 0x41 && c <= 0x5a) || (c >= 0x61 && c <= 0x7a) ||
  c === 0x2d || c === 0x2e || c === 0x5f || c === 0x7e;
const isUriComponentExtra = (c) => c === 0x21 || c === 0x27 || c === 0x28 || c === 0x29 || c === 0x2a;

function percentEncode(bytes, { keepExtra, lower, plusSpace }) {
  let out = '';
  for (const c of bytes) {
    if (isUnreserved(c) || (keepExtra && isUriComponentExtra(c))) out += String.fromCharCode(c);
    else if (plusSpace && c === 0x20) out += '+';
    else {
      const h = c.toString(16).padStart(2, '0');
      out += '%' + (lower ? h : h.toUpperCase());
    }
  }
  return Buffer.from(out, 'latin1');
}

function urlVariants(B, S, kind) {
  const sources = [B];
  const doubled = Buffer.from(S, 'utf8');
  if (kind === 'binary' && !doubled.equals(B)) sources.push(doubled);
  const out = [];
  for (const src of sources) {
    for (const keepExtra of [false, true]) {
      for (const lower of [false, true]) {
        for (const plusSpace of [false, true]) out.push(percentEncode(src, { keepExtra, lower, plusSpace }));
      }
    }
  }
  return out;
}

function jsonVariants(S) {
  const base = JSON.stringify(S).slice(1, -1);
  const asciiLower = base.replace(/[\u0080-￿]/g, (c) => '\\u' + c.charCodeAt(0).toString(16).padStart(4, '0'));
  const asciiUpper = base.replace(/[\u0080-￿]/g, (c) => '\\u' + c.charCodeAt(0).toString(16).padStart(4, '0').toUpperCase());
  const out = new Set();
  for (const v of [base, asciiLower, asciiUpper]) {
    out.add(v);
    out.add(v.replace(/\//g, '\\/'));
  }
  return [...out].map((v) => Buffer.from(v, 'utf8'));
}

/**
 * Interior elements only, delimited by commas, so "12,200" cannot match inside "112,200". The label is scanned in the
 * whitespace-stripped lane, so ONE compact pattern also finds 'a, b, c', pretty-printed JSON and util.inspect output.
 * Second form: JSON.stringify(Uint8Array) is an object keyed by index ({"0":12,"1":34,...}); the key's own indices start at 0,
 * and the `"n":` prefix delimits every value on the left, so the first and last element are left out for the same reason.
 */
function byteArrayVariants(B) {
  if (B.length < 4) return [];
  const mid = Array.from(B.subarray(1, B.length - 1));
  return [
    Buffer.from(',' + mid.join(',') + ','),
    Buffer.from(mid.map((v, i) => `"${i + 1}":${v}`).join(',') + ','),
  ];
}

/** Hex with a separator: 'ab:cd' (openssl, MAC), '0xab,0xcd' (C / Go initialiser), '\xab\xcd' (Python / JS / Go string escapes). */
function hexSeparatedVariants(B, upper) {
  const h = Array.from(B, (c) => { const x = c.toString(16).padStart(2, '0'); return upper ? x.toUpperCase() : x; });
  return [
    Buffer.from(h.join(':'), 'latin1'),
    Buffer.from(h.map((x) => '0x' + x).join(','), 'latin1'),
    Buffer.from(h.map((x) => '\\x' + x).join(''), 'latin1'),
  ];
}

/**
 * The percent-encoded form of the secret's base64 TEXT: '+' -> %2B and '/' -> %2F (encodeURIComponent, querystring, quote_plus),
 * or only '+' (Python quote(): '/' is "safe"), in both hex cases. A region with neither '+' nor '/' is byte-identical to the
 * plain base64 pattern and is left to it, so one leak is never reported under two labels.
 */
function urlEncodedBase64Variants(B) {
  const out = [];
  for (const k of [0, 1, 2]) {
    const s = b64Region(B, k, false).toString('latin1');
    if (!/[+/]/.test(s)) continue;
    for (const lower of [false, true]) {
      const pc = (ch) => { const h = ch.charCodeAt(0).toString(16).padStart(2, '0'); return '%' + (lower ? h : h.toUpperCase()); };
      out.push(Buffer.from(s.replace(/\+/g, pc).replace(/\//g, pc), 'latin1'));
      if (/\+/.test(s) && /\//.test(s)) out.push(Buffer.from(s.replace(/\+/g, pc), 'latin1'));
    }
  }
  return out;
}

const capitalise = (w) => { const cp = Array.from(w); return cp.length === 0 ? w : cp[0].toUpperCase() + cp.slice(1).join('').toLowerCase(); };

/** Lower / UPPER / Capitalised / Each-Word-Capitalised, for a secret that is text. Variants equal to the text itself alias 'raw'. */
function caseFoldVariants(S, kind) {
  if (kind !== 'text') return [];
  return [S.toLowerCase(), S.toUpperCase(), capitalise(S), S.replace(/[\p{L}\p{N}]+/gu, capitalise)].map((v) => Buffer.from(v, 'utf8'));
}

/** @returns {{ encoding, pattern, align }[]} candidates for one label, before aliasing. */
function candidatesFor(label, g) {
  const { B, S, kind } = g;
  switch (label) {
    case 'raw': return [{ pattern: Buffer.from(B), align: null }];
    case 'utf8': return [{ pattern: Buffer.from(S, 'utf8'), align: null }];
    case 'utf16le': return [{ pattern: Buffer.from(S, 'utf16le'), align: null }];
    case 'utf16be': return [{ pattern: Buffer.from(S, 'utf16le').swap16(), align: null }];
    case 'base64': return [0, 1, 2].map((k) => ({ pattern: b64Region(B, k, false), align: k }));
    case 'base64url': return [0, 1, 2].map((k) => ({ pattern: b64Region(B, k, true), align: k }));
    case 'hex-lower': return [Buffer.from(B.toString('hex'), 'latin1'), ...hexSeparatedVariants(B, false)].map((pattern) => ({ pattern, align: null }));
    case 'hex-upper': return [Buffer.from(B.toString('hex').toUpperCase(), 'latin1'), ...hexSeparatedVariants(B, true)].map((pattern) => ({ pattern, align: null }));
    case 'urlencoded': return [...urlVariants(B, S, kind), ...urlEncodedBase64Variants(B)].map((pattern) => ({ pattern, align: null }));
    case 'json-escaped': return jsonVariants(S).map((pattern) => ({ pattern, align: null }));
    case 'byte-array': return byteArrayVariants(B).map((pattern) => ({ pattern, align: null }));
    case 'case-folded': return caseFoldVariants(S, kind).map((pattern) => ({ pattern, align: null }));
    default: throw new TypeError(`unknown encoding '${label}'`);
  }
}

function buildEntries(g, labels) {
  const entries = [];
  const seen = new Map(); // `${lane}:${hex}` -> primary label
  for (const label of ENCODING_ORDER) {
    if (!labels.has(label)) continue;
    const lane = TEXT_LANE_LABELS.has(label) ? 'text' : 'bin';
    let variant = 0;
    for (const c of candidatesFor(label, g)) {
      let status = 'ok';
      let aliasOf = null;
      if (c.pattern.length < MIN_PATTERN_BYTES) {
        status = 'too-short';
      } else {
        const key = `${lane}:${c.pattern.toString('hex')}`;
        const prim = seen.get(key);
        if (prim !== undefined) { status = 'alias'; aliasOf = prim; } else seen.set(key, label);
      }
      entries.push({ secret: g.secret, group: g.group, encoding: label, align: c.align, variant: variant++, lane, pattern: c.pattern, status, aliasOf });
    }
  }
  return entries;
}

/* ========================================================================= *
 * NeedleSet
 * ========================================================================= */

const INTERNALS = new WeakMap();
const BUILD_TOKEN = Symbol('needle-set-build');

export class NeedleSet {
  constructor(token, data) {
    if (token !== BUILD_TOKEN) throw new TypeError('NeedleSet: construct with makeNeedles()');
    INTERNALS.set(this, data);
    Object.freeze(this);
  }

  /** Content-free description: names, kinds, lengths, probe offsets, counts. */
  describe() {
    const I = INTERNALS.get(this);
    const secrets = [];
    for (const name of SECRET_NAMES) {
      const gs = I.groups.filter((g) => g.secret === name);
      if (gs.length === 0) {
        if (I.groups.length === 0 && I.entries.some((e) => e.secret === name)) secrets.push({ name, kind: 'unknown', groups: [] });
        continue;
      }
      secrets.push({
        name,
        kind: gs[0].kind,
        groups: gs.map((g) => ({ id: g.group, bytes: g.B.length, ...(g.offset === undefined ? {} : { offset: g.offset }), ...(g.basis === undefined ? {} : { basis: g.basis }) })),
      });
    }
    return {
      schema: 'wsi-needles/1',
      secrets,
      encodings: ENCODING_ORDER.filter((l) => I.entries.some((e) => e.encoding === l)),
      patterns: I.entries.filter((e) => e.status === 'ok').length,
      aliases: I.entries.filter((e) => e.status === 'alias').length,
      tooShort: I.entries.filter((e) => e.status === 'too-short').length,
    };
  }

  toJSON() { return this.describe(); }
  [util.inspect.custom]() { return `NeedleSet ${JSON.stringify(this.describe())}`; }
}

function makeSet(entries, groups) {
  const own = entries.filter((e) => e.status === 'ok');
  const bin = own.filter((e) => e.lane === 'bin');
  const text = own.filter((e) => e.lane === 'text');
  const maxLen = (arr) => arr.reduce((m, e) => Math.max(m, e.pattern.length), 0);
  return new NeedleSet(BUILD_TOKEN, {
    entries: Object.freeze(entries.slice()),
    groups: Object.freeze(groups.slice()),
    scan: { bin, text },
    maxLen: { bin: maxLen(bin), text: maxLen(text) },
    armedCache: new Map(),
  });
}

/** Test-only escape hatch: build a set from hand-made entries (used to prove assertArmed refuses bad sets). */
export function _unsafeNeedleSetFromEntries(entries) {
  return makeSet(entries.map((e) => ({ align: null, variant: 0, lane: 'bin', status: 'ok', aliasOf: null, group: '-', ...e })), []);
}

/** Test-only accessor. Returns the live internals (entries carry pattern bytes). Never put these in a result. */
export function _internals(needles) {
  const I = INTERNALS.get(needles);
  if (!I) throw new ArmingError('not a needle set built by makeNeedles', ['not-a-needle-set']);
  return I;
}

function normaliseSecret(name, v) {
  let B;
  let S = null;
  if (typeof v === 'string') { B = Buffer.from(v, 'utf8'); S = v; }
  else if (v instanceof Uint8Array) B = Buffer.from(v);
  else throw new TypeError(`makeNeedles: '${name}' must be a string or Uint8Array`);
  if (B.length < MIN_SECRET_BYTES) throw new TypeError(`makeNeedles: '${name}' is shorter than ${MIN_SECRET_BYTES} bytes (too short to be a safe needle)`);
  if (distinctBytes(B) < 4) throw new TypeError(`makeNeedles: '${name}' is degenerate (fewer than 4 distinct byte values)`);
  return { B, S };
}

function textForm(B, S) {
  if (S !== null) return { S, kind: 'text' };
  if (isUtf8RoundTrip(B)) return { S: B.toString('utf8'), kind: 'text' };
  return { S: B.toString('latin1'), kind: 'binary' };
}

/**
 * Choose the probe windows of the ORIGINAL. A window is used only if it is provably specific to this file (see the
 * PROBES OF THE ORIGINAL section of the header): a canary anchor, absent from every sibling document, or (declared by the
 * caller, no siblings) high-entropy. Returns [{ offset, bytes, basis }] sorted by offset; THROWS when nothing qualifies
 * (content-free message).
 *
 * Positions: the head and the tail (the first provable window found scanning inward from each end) and
 * PROBE_INTERIOR_TARGETS interior positions (the provable window nearest each). Windows never overlap each other.
 * Work is bounded: at most PROBE_MAX_CANDIDATES candidate offsets are ever examined, whatever the file size.
 */
function deriveProbes(B, probeBytes, { siblings = [], anchor = null, assertUnique = false, workBudget = DEFAULT_SIBLING_WORK_BUDGET } = {}) {
  const n = B.length;
  const win = Math.min(probeBytes, n);
  const minDistinct = Math.max(4, Math.ceil(PROBE_MIN_DISTINCT_FRACTION * win));
  const picks = []; // { offset, length, basis }
  const overlaps = (off, len) => picks.some((q) => off < q.offset + q.length && q.offset < off + len);
  const inSibling = (w) => siblings.some((sb) => sb.includes(w));
  const tally = { examined: 0, degenerate: 0, boilerplate: 0, lowEntropy: 0, unproven: 0, budget: 0 };
  // 'shared' | 'unique' | 'budget'. The WHOLE window being absent from the siblings is not evidence of specificity (see
  // PROBE_SHARED_RUN); a window is unique only when no PROBE_SHARED_RUN-byte block of it occurs in any sibling.
  const sibBytes = siblings.reduce((s, sb) => s + sb.length, 0);
  let work = 0;
  const vsSiblings = (w) => {
    const run = Math.min(PROBE_SHARED_RUN, w.length);
    const starts = [];
    for (let o = 0; o + run <= w.length; o += PROBE_SHARED_STRIDE) starts.push(o);
    if (starts[starts.length - 1] !== w.length - run) starts.push(w.length - run); // the last block ends flush with the window
    work += starts.length * sibBytes;
    if (work > workBudget) return 'budget';
    for (const sb of siblings) for (const o of starts) if (sb.includes(w.subarray(o, o + run))) return 'shared';
    return 'unique';
  };

  // canary-anchored: the canary (unique per upload) plus context, so it cannot occur in an upload with another canary
  if (anchor && anchor.length > 0) {
    let from = 0;
    for (let found = 0; found < 2; found++) {
      const at = B.indexOf(anchor, from);
      if (at < 0) break;
      const start = Math.max(0, at - PROBE_ANCHOR_CONTEXT);
      const end = Math.min(n, at + anchor.length + PROBE_ANCHOR_CONTEXT);
      const w = B.subarray(start, end);
      if (!inSibling(w) && !overlaps(start, end - start)) picks.push({ offset: start, length: end - start, basis: 'canary-anchored' });
      from = at + anchor.length;
    }
  }

  const last = n - win;
  const step = Math.max(Math.floor(win / 2), Math.ceil(last / PROBE_MAX_CANDIDATES), 1);
  const cands = [];
  for (let off = 0; off < last; off += step) cands.push(off);
  cands.push(last);
  const memo = new Map();
  const judgeWindow = (off) => {
    if (memo.has(off)) return memo.get(off);
    const w = B.subarray(off, off + win);
    const d = distinctBytes(w);
    tally.examined += 1;
    let basis = null;
    if (d < PROBE_MIN_DISTINCT_ANY) tally.degenerate += 1;
    else if (siblings.length > 0) {
      const v = vsSiblings(w);
      if (v === 'budget') tally.budget += 1; // not judged: an unjudged window is never used
      else if (v === 'shared') tally.boilerplate += 1; // template: a run of >= PROBE_SHARED_RUN bytes occurs in another upload, whatever its entropy
      else basis = 'unique-vs-siblings'; // no block of it occurs in any sibling: specific without needing entropy
    }
    else if (assertUnique && d >= minDistinct) basis = 'asserted-unique';
    else if (assertUnique) tally.lowEntropy += 1;
    else tally.unproven += 1; // no sibling, no declaration: nothing proves this window is not boilerplate
    memo.set(off, basis);
    return basis;
  };
  const nearestFirst = (target) => {
    let lo = 0;
    for (let i = 0; i < cands.length; i++) if (Math.abs(cands[i] - target) < Math.abs(cands[lo] - target)) lo = i;
    const order = [lo];
    for (let d = 1; d < cands.length; d++) { if (lo - d >= 0) order.push(lo - d); if (lo + d < cands.length) order.push(lo + d); }
    return order.map((i) => cands[i]);
  };
  const targets = [0, last];
  for (let j = 0; j < PROBE_INTERIOR_TARGETS; j++) targets.push(Math.floor(((j + 0.5) * last) / PROBE_INTERIOR_TARGETS));
  for (const t of targets) {
    for (const off of nearestFirst(t)) {
      if (overlaps(off, win)) continue;
      const basis = judgeWindow(off);
      if (basis) { picks.push({ offset: off, length: win, basis }); break; }
    }
  }
  if (picks.length === 0) {
    throw new TypeError(`makeNeedles: 'original' has no probe window that is provably specific to it (${tally.examined} examined: ${tally.boilerplate} share bytes with a sibling, ${tally.unproven} unproven because no sibling was given, ${tally.lowEntropy} low-entropy under assertUnique, ${tally.degenerate} degenerate${tally.budget > 0 ? `, ${tally.budget} not judged because the sibling comparison budget was spent (use fewer or smaller siblings, or assertUnique)` : ''}). Pass options.siblings (other uploads built from the same template), or make the canary a verbatim substring of the original, or pass assertUnique: true if the original has no template`);
  }
  picks.sort((x, y) => x.offset - y.offset);
  return picks.map((q) => ({ offset: q.offset, bytes: Buffer.from(B.subarray(q.offset, q.offset + q.length)), basis: q.basis }));
}

/**
 * Build the needle set. `originalBytes` is probed by windows that are provably specific to it (see deriveProbes and the
 * PROBES OF THE ORIGINAL header section), `keyBytes` and `canary` are matched whole. Throws on a missing/short/degenerate
 * secret, or an original with no provable probe, instead of arming a set that would match everywhere or nowhere.
 *
 * options: { encodings?: string[] (default all), partial?: boolean (allow fewer than 3 secrets), probeBytes?: number,
 *            siblings?: Uint8Array[] (other uploads from the same template), assertUnique?: boolean (original has no template),
 *            siblingWorkBudget?: number (bytes compared against siblings while choosing probes; default 4e9) }
 */
export function makeNeedles(input, options = {}) {
  if (!input || typeof input !== 'object') throw new TypeError('makeNeedles: expected { canary, originalBytes, keyBytes }');
  const partial = options.partial === true;
  const labels = new Set(options.encodings ?? ENCODING_ORDER);
  if (labels.size === 0) throw new TypeError('makeNeedles: no encodings requested');
  for (const l of labels) if (!LABEL_INDEX.has(l)) throw new TypeError(`makeNeedles: unknown encoding '${l}'`);
  const probeBytes = options.probeBytes ?? DEFAULT_PROBE_BYTES;
  const siblingWorkBudget = options.siblingWorkBudget ?? DEFAULT_SIBLING_WORK_BUDGET;
  if (typeof siblingWorkBudget !== 'number' || !(siblingWorkBudget > 0)) throw new TypeError("makeNeedles: 'siblingWorkBudget' must be a positive number");
  if (options.siblings !== undefined && !Array.isArray(options.siblings)) throw new TypeError("makeNeedles: 'siblings' must be an array of Buffer / Uint8Array");
  const siblings = (options.siblings ?? []).map((sb, i) => {
    if (!(sb instanceof Uint8Array)) throw new TypeError(`makeNeedles: sibling ${i} must be a Buffer or Uint8Array`);
    return Buffer.from(sb.buffer, sb.byteOffset, sb.byteLength); // a read-only VIEW: Uint8Array#includes does not search for a byte sequence
  });
  const given = { canary: input.canary, original: input.originalBytes, key: input.keyBytes };
  const missing = SECRET_NAMES.filter((n) => given[n] === undefined || given[n] === null);
  if (missing.length === SECRET_NAMES.length) throw new TypeError('makeNeedles: no secrets given');
  if (missing.length > 0 && !partial) throw new TypeError(`makeNeedles: missing secret(s): ${missing.join(', ')}`);

  const groups = [];
  let anchor = null; // the canary's bytes, processed before the original (SECRET_NAMES order)
  for (const name of SECRET_NAMES) {
    if (given[name] === undefined || given[name] === null) continue;
    const { B, S } = normaliseSecret(name, given[name]);
    if (name === 'canary') anchor = B;
    if (name === 'original') {
      deriveProbes(B, probeBytes, { siblings, anchor, assertUnique: options.assertUnique === true, workBudget: siblingWorkBudget }).forEach((p, i) => {
        const tf = textForm(p.bytes, null);
        groups.push({ secret: name, group: `p${i}`, B: p.bytes, S: tf.S, kind: tf.kind, offset: p.offset, basis: p.basis });
      });
    } else {
      const tf = textForm(B, S);
      groups.push({ secret: name, group: 'main', B, S: tf.S, kind: tf.kind });
    }
  }
  const entries = groups.flatMap((g) => buildEntries(g, labels));
  return makeSet(entries, groups);
}

/* ========================================================================= *
 * Streaming matcher (overlap-safe, chunk-size independent counts)
 * ========================================================================= */

const WS = new Uint8Array(256);
for (const c of [0x20, 0x09, 0x0a, 0x0d]) WS[c] = 1;

function stripWs(chunk) {
  let any = false;
  for (let i = 0; i < chunk.length; i++) if (WS[chunk[i]]) { any = true; break; }
  if (!any) return chunk;
  const out = Buffer.allocUnsafe(chunk.length);
  let j = 0;
  for (let i = 0; i < chunk.length; i++) { const c = chunk[i]; if (!WS[c]) out[j++] = c; }
  return out.subarray(0, j);
}

class Matcher {
  constructor(needles) {
    const I = _internals(needles);
    this.bin = I.scan.bin;
    this.text = I.scan.text;
    this.maxBin = I.maxLen.bin;
    this.maxText = I.maxLen.text;
    this.carryBin = Buffer.alloc(0);
    this.carryText = Buffer.alloc(0);
    this.posBin = 0; // bytes of each lane already consumed, so every match has an absolute start in its lane
    this.posText = 0;
    this.starts = new Map(); // entry -> absolute match starts (in that entry's lane)
    this.bytes = 0;
  }

  feed(chunk) {
    // A plain Uint8Array (or any other typed-array view) has an indexOf that looks for ONE numeric element, never a
    // byte sequence, so it would match nothing and the scan would read CLEAN. Normalise to a Buffer VIEW over the same
    // bytes (no copy, respects byteOffset) before any lane touches it. Reproduced and pinned by selfTest A0.
    if (!Buffer.isBuffer(chunk)) chunk = Buffer.from(chunk.buffer, chunk.byteOffset, chunk.byteLength);
    this.bytes += chunk.length;
    this.carryBin = this.#lane(this.bin, this.carryBin, chunk, this.maxBin, 'posBin');
    if (this.text.length > 0) {
      const stripped = stripWs(chunk); // text-lane patterns contain no whitespace, so this lane is a superset
      this.carryText = this.#lane(this.text, this.carryText, stripped, this.maxText, 'posText');
    }
  }

  #lane(pats, carry, data, maxLen, posKey) {
    if (pats.length === 0 || data.length === 0) return carry;
    const cl = carry.length;
    const win = cl > 0 ? Buffer.concat([carry, data]) : data;
    const base = this[posKey] - cl; // absolute offset of win[0] in this lane
    for (const e of pats) {
      const L = e.pattern.length;
      if (L === 0) continue; // an empty needle matches everywhere and Buffer#indexOf would never return -1; arming refuses such sets
      // Only a match that ENDS in the new region is looked for, so the carry is not re-scanned. Correctness does not
      // depend on this (duplicate starts are merged in rows()); it only avoids repeated work.
      const from = Math.max(0, cl - L + 1);
      if (win.length - from < L) continue;
      let idx = win.indexOf(e.pattern, from);
      while (idx !== -1) {
        let arr = this.starts.get(e);
        if (!arr) { arr = []; this.starts.set(e, arr); }
        arr.push(base + idx);
        idx = win.indexOf(e.pattern, idx + 1);
      }
    }
    this[posKey] += data.length;
    const keep = Math.min(maxLen - 1, win.length);
    return keep > 0 ? Buffer.from(win.subarray(win.length - keep)) : Buffer.alloc(0);
  }

  /** Set of `${secret}\0${group}\0${encoding}` that matched at least once. */
  hitGroups() {
    const s = new Set();
    for (const e of this.starts.keys()) s.add(`${e.secret}\u0000${e.group}\u0000${e.encoding}`);
    return s;
  }

  rows() {
    // One OCCURRENCE is one cluster of overlapping matches: several variants of a label can match the same bytes
    // (a plain JSON pattern is a suffix of its '\\/'-escaped sibling when the secret starts with '/'), and counting each
    // variant would report one occurrence as two. Adjacent copies do not overlap, so they stay separate.
    const spans = new Map();
    for (const [e, starts] of this.starts) {
      const k = `${e.secret}\u0000${e.encoding}\u0000${e.group}`;
      let arr = spans.get(k);
      if (!arr) { arr = []; spans.set(k, arr); }
      for (const st of starts) arr.push([st, st + e.pattern.length]);
    }
    const grp = new Map();
    for (const [k, arr] of spans) {
      arr.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
      let clusters = 0;
      let curEnd = -1;
      for (const [st, en] of arr) {
        if (st >= curEnd) { clusters += 1; curEnd = en; } else if (en > curEnd) curEnd = en;
      }
      grp.set(k, clusters);
    }
    const se = new Map();
    for (const [k, c] of grp) {
      const [secret, encoding] = k.split('\u0000');
      const k2 = `${secret}\u0000${encoding}`;
      se.set(k2, Math.max(se.get(k2) || 0, c)); // probes of the original: report copies, not probe count
    }
    const bySecret = [...se].map(([k, count]) => {
      const [secret, encoding] = k.split('\u0000');
      return { secret, encoding, count };
    }).sort((a, b) => LABEL_INDEX.get(a.encoding) - LABEL_INDEX.get(b.encoding) || SECRET_INDEX.get(a.secret) - SECRET_INDEX.get(b.secret));
    const enc = new Map();
    for (const r of bySecret) enc.set(r.encoding, (enc.get(r.encoding) || 0) + r.count);
    const byEncoding = [...enc].map(([encoding, count]) => ({ encoding, count }))
      .sort((a, b) => LABEL_INDEX.get(a.encoding) - LABEL_INDEX.get(b.encoding));
    return { bySecret, byEncoding };
  }
}

/* ========================================================================= *
 * Arming
 * ========================================================================= */

function equivalentLabels(I, g, enc) {
  const mine = new Set(I.entries
    .filter((e) => e.secret === g.secret && e.group === g.group && e.encoding === enc && e.status !== 'too-short')
    .map((e) => `${e.lane}:${e.pattern.toString('hex')}`));
  return new Set(I.entries
    .filter((e) => e.secret === g.secret && e.group === g.group && e.status === 'ok' && mine.has(`${e.lane}:${e.pattern.toString('hex')}`))
    .map((e) => e.encoding));
}

/** Carrier buffers for one (group, encoding), built with node built-ins, one per base64 alignment. */
function carriersFor(enc, g) {
  const rb = (n) => crypto.randomBytes(n);
  const pre = () => rb(3 * crypto.randomInt(1, 4));
  const wrapAt = (k, fn) => {
    const embedded = Buffer.concat([rb(3 * crypto.randomInt(1, 3) + k), g.B, rb(crypto.randomInt(0, 5))]);
    return Buffer.concat([rb(5), Buffer.from(fn(embedded), 'latin1'), rb(5)]);
  };
  switch (enc) {
    case 'raw': return [Buffer.concat([pre(), g.B, pre()])];
    case 'utf8': return [Buffer.concat([pre(), Buffer.from(g.S, 'utf8'), pre()])];
    case 'utf16le': return [Buffer.concat([pre(), Buffer.from(g.S, 'utf16le'), pre()])];
    case 'utf16be': return [Buffer.concat([pre(), Buffer.from(g.S, 'utf16le').swap16(), pre()])];
    case 'base64': return [0, 1, 2].map((k) => wrapAt(k, (e) => e.toString('base64')));
    case 'base64url': return [0, 1, 2].map((k) => wrapAt(k, (e) => e.toString('base64url')));
    case 'hex-lower': return [wrapAt(0, (e) => e.toString('hex'))];
    case 'hex-upper': return [wrapAt(0, (e) => e.toString('hex').toUpperCase())];
    case 'urlencoded': {
      try { return [Buffer.from('q=' + encodeURIComponent(g.S) + '&z=1', 'utf8')]; } catch { return [Buffer.from('q=' + percentEncode(g.B, { keepExtra: true, lower: false, plusSpace: false }).toString('latin1') + '&z=1', 'latin1')]; } // lone surrogate in S
    }
    case 'json-escaped': return [Buffer.from(JSON.stringify({ v: g.S }), 'utf8')];
    case 'byte-array': return [Buffer.from(JSON.stringify(Buffer.concat([rb(2), g.B, rb(2)])), 'utf8')];
    default: return [];
  }
}

/**
 * Throws ArmingError when the needle set could not find a leak. Checks structure (non-empty, required secrets,
 * every required encoding present per secret and probe, all three base64 alignments, no empty/short/degenerate
 * pattern) and then PROVES the set works by embedding each secret in each encoding and requiring the engine to find it.
 *
 * opts: { requiredEncodings?: string[] (default REQUIRED_ENCODINGS), requireSecrets?: string[] (default all three) }
 * Returns a content-free proof summary.
 */
export function assertArmed(needles, opts = {}) {
  const I = _internals(needles);
  const required = opts.requiredEncodings ?? REQUIRED_ENCODINGS;
  const requireSecrets = opts.requireSecrets ?? SECRET_NAMES;
  const sig = JSON.stringify([required, requireSecrets]);
  if (I.armedCache.has(sig)) return I.armedCache.get(sig);

  const problems = [];
  if (I.entries.length === 0) problems.push('needle set is empty');
  const present = new Set(I.entries.map((e) => e.secret));
  for (const s of requireSecrets) if (!present.has(s)) problems.push(`secret '${s}' is not in the needle set`);
  if (I.scan.bin.length + I.scan.text.length === 0) problems.push('needle set has no scannable pattern');

  const groupKeys = [...new Set(I.entries.map((e) => `${e.secret}\u0000${e.group}`))];
  for (const gk of groupKeys) {
    const [secret, group] = gk.split('\u0000');
    const mine = I.entries.filter((e) => e.secret === secret && e.group === group);
    for (const enc of required) {
      const es = mine.filter((e) => e.encoding === enc);
      if (es.length === 0) { problems.push(`missing encoding '${enc}' for secret '${secret}'`); continue; }
      if (es.some((e) => e.status === 'too-short')) problems.push(`'${enc}' pattern for secret '${secret}' is shorter than ${MIN_PATTERN_BYTES} bytes`);
      if (enc === 'base64' || enc === 'base64url') {
        const aligns = new Set(es.filter((e) => e.status !== 'too-short').map((e) => e.align));
        for (const k of [0, 1, 2]) if (!aligns.has(k)) problems.push(`'${enc}' alignment ${k} missing for secret '${secret}'`);
      }
    }
  }
  for (const e of I.entries) {
    if (e.status !== 'ok') continue;
    if (e.pattern.length === 0) problems.push(`empty pattern ('${e.encoding}', secret '${e.secret}')`);
    else if (e.pattern.length < MIN_PATTERN_BYTES) problems.push(`short pattern ('${e.encoding}', secret '${e.secret}')`);
    else if (distinctBytes(e.pattern) < 2) problems.push(`degenerate pattern ('${e.encoding}', secret '${e.secret}')`);
  }

  let proof = 'structural-only';
  if (problems.length === 0 && I.groups.length > 0) {
    proof = 'round-trip';
    for (const g of I.groups) {
      for (const enc of required) {
        const equiv = equivalentLabels(I, g, enc);
        for (const carrier of carriersFor(enc, g)) {
          const m = new Matcher(needles);
          m.feed(carrier);
          const got = m.hitGroups();
          let found = false;
          for (const l of equiv) if (got.has(`${g.secret}\u0000${g.group}\u0000${l}`)) found = true;
          if (!found) problems.push(`round-trip: a planted '${enc}' occurrence of secret '${g.secret}' was not detected`);
        }
      }
    }
  }

  if (problems.length > 0) {
    throw new ArmingError(`needle set is not armed: ${problems.slice(0, 6).join('; ')}${problems.length > 6 ? `; (+${problems.length - 6} more)` : ''}`, problems);
  }
  const result = Object.freeze({
    ok: true,
    proof,
    secrets: [...present].filter((s) => SECRET_INDEX.has(s)).sort((a, b) => SECRET_INDEX.get(a) - SECRET_INDEX.get(b)),
    groups: groupKeys.length,
    encodings: required.slice(),
    patterns: I.entries.filter((e) => e.status === 'ok').length,
    aliases: I.entries.filter((e) => e.status === 'alias').length,
  });
  I.armedCache.set(sig, result);
  return result;
}

function ensureArmed(needles, arm) {
  const I = _internals(needles);
  const names = [...new Set(I.entries.map((e) => e.secret))];
  return assertArmed(needles, arm ?? { requireSecrets: names });
}

/* ========================================================================= *
 * Verdict logic
 * ========================================================================= */

const INCOMPLETE_REASONS = new Set([
  'symlink', 'dangling-symlink', 'special', 'unreadable-dir', 'unreadable', 'oversize', 'too-deep', 'entry-budget',
]);
const isIncomplete = (skipped) => skipped.some((s) => INCOMPLETE_REASONS.has(s.reason));

function judge({ hasHits, filesScanned, bytesScanned, skipped }) {
  const complete = !isIncomplete(skipped);
  if (hasHits) return { verdict: 'HITS', vacuous: false, vacuousReason: null, complete };
  if (filesScanned === 0) return { verdict: 'VACUOUS', vacuous: true, vacuousReason: 'no-files', complete };
  if (bytesScanned === 0) return { verdict: 'VACUOUS', vacuous: true, vacuousReason: 'no-bytes', complete };
  if (!complete) return { verdict: 'VACUOUS', vacuous: true, vacuousReason: 'incomplete-coverage', complete };
  return { verdict: 'CLEAN', vacuous: false, vacuousReason: null, complete };
}

/* ========================================================================= *
 * Buffer / text scanning
 * ========================================================================= */

function feedChunks(m, buf, chunkBytes) {
  if (!chunkBytes || chunkBytes >= buf.length) { m.feed(buf); return; }
  for (let i = 0; i < buf.length; i += chunkBytes) m.feed(buf.subarray(i, Math.min(buf.length, i + chunkBytes)));
}

export function scanBuffer(buf, needles, opts = {}) {
  if (!(buf instanceof Uint8Array)) throw new TypeError('scanBuffer: expected a Buffer or Uint8Array');
  ensureArmed(needles, opts.arm); // scanBuffer
  const m = new Matcher(needles);
  feedChunks(m, buf, opts.chunkBytes);
  const { bySecret, byEncoding } = m.rows();
  const j = judge({ hasHits: byEncoding.length > 0, filesScanned: 1, bytesScanned: m.bytes, skipped: [] });
  return { bytesScanned: m.bytes, hits: byEncoding, hitsBySecret: bySecret, vacuous: j.vacuous, vacuousReason: j.vacuousReason, verdict: j.verdict };
}

/** For logs, dumps and excerpts. The text is scanned as UTF-8 bytes, so every text encoding form is covered. */
export function scanText(text, needles, opts = {}) {
  if (typeof text !== 'string') throw new TypeError('scanText: expected a string');
  const r = scanBuffer(Buffer.from(text, 'utf8'), needles, opts);
  return { chars: text.length, ...r };
}

/* ========================================================================= *
 * Directory walking and chunked file reading
 * ========================================================================= */

function normOpts(opts) {
  const o = {
    maxFileBytes: opts.maxFileBytes ?? DEFAULT_MAX_FILE_BYTES,
    followSymlinks: opts.followSymlinks ?? false, // scanDirectory default
    chunkBytes: opts.chunkBytes ?? DEFAULT_CHUNK_BYTES,
    maxEntries: opts.maxEntries ?? DEFAULT_MAX_ENTRIES,
    maxDepth: opts.maxDepth ?? DEFAULT_MAX_DEPTH,
  };
  if (!(o.maxFileBytes > 0) || !(o.chunkBytes > 0) || !(o.maxEntries > 0) || !(o.maxDepth > 0)) throw new TypeError('scan options must be positive numbers');
  return o;
}

const dirKey = (st) => `${st.dev}:${st.ino}`;

/**
 * Walk `root`. `nameCheck(name)` returns [{encoding,count}] when a single path segment contains a needle; such a
 * segment is shown as '<name-redacted:N>' in every output path.
 */
function walkTree(root, o, nameCheck) {
  const rootStat = fs.statSync(root, { bigint: true }); // throws ENOENT etc.: a missing root is an error, never CLEAN
  if (!rootStat.isDirectory()) throw new TypeError('scan root is not a directory');
  const files = [];
  const skipped = [];
  const nameHits = [];
  const visited = new Set([dirKey(rootStat)]);
  let entries = 0;
  let redacted = 0;
  let dirs = 1;
  let stop = false;

  const shownName = (name) => {
    if (!nameCheck) return { text: name, hits: null };
    const hits = nameCheck(name);
    if (!hits) return { text: name, hits: null };
    redacted += 1;
    return { text: `<name-redacted:${redacted}>`, hits };
  };

  const rec = (abs, shownPrefix, depth) => {
    let list;
    try { list = fs.readdirSync(abs, { withFileTypes: true }); } catch { skipped.push({ path: shownPrefix || '.', reason: 'unreadable-dir' }); return; }
    list.sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));
    for (const d of list) {
      if (stop) return;
      entries += 1;
      if (entries > o.maxEntries) { skipped.push({ path: '(tree)', reason: 'entry-budget' }); stop = true; return; }
      const shown = shownName(d.name);
      const relShown = shownPrefix ? `${shownPrefix}/${shown.text}` : shown.text;
      if (shown.hits) for (const h of shown.hits) nameHits.push({ path: relShown, encoding: h.encoding, count: h.count });
      const absChild = path.join(abs, d.name);
      if (d.isSymbolicLink()) {
        if (!o.followSymlinks) { skipped.push({ path: relShown, reason: 'symlink' }); continue; }
        let st;
        try { st = fs.statSync(absChild, { bigint: true }); } catch { skipped.push({ path: relShown, reason: 'dangling-symlink' }); continue; }
        if (st.isDirectory()) {
          const key = dirKey(st);
          if (visited.has(key)) { skipped.push({ path: relShown, reason: 'symlink-loop' }); continue; } // target already scanned in this walk
          if (depth + 1 > o.maxDepth) { skipped.push({ path: relShown, reason: 'too-deep' }); continue; }
          visited.add(key);
          dirs += 1;
          rec(absChild, relShown, depth + 1);
        } else if (st.isFile()) files.push({ abs: absChild, rel: relShown });
        else skipped.push({ path: relShown, reason: 'special' });
      } else if (d.isDirectory()) {
        if (depth + 1 > o.maxDepth) { skipped.push({ path: relShown, reason: 'too-deep' }); continue; }
        let st;
        try { st = fs.lstatSync(absChild, { bigint: true }); } catch { skipped.push({ path: relShown, reason: 'unreadable-dir' }); continue; }
        const key = dirKey(st);
        if (visited.has(key)) { skipped.push({ path: relShown, reason: 'symlink-loop' }); continue; } // @walk-dir-loop-guard
        visited.add(key);
        dirs += 1;
        rec(absChild, relShown, depth + 1);
      } else if (d.isFile()) files.push({ abs: absChild, rel: relShown });
      else skipped.push({ path: relShown, reason: 'special' });
    }
  };
  rec(root, '', 0);
  return { files, skipped, nameHits, dirs };
}

/** Test-only: the real walker, so weak scanners differ from the real one in exactly one decision. */
export function _walk(root, opts = {}, nameCheck) {
  return walkTree(root, normOpts(opts), nameCheck);
}

/** Read a regular file in chunks. Never follows a symlink unless asked; never blocks on a FIFO. */
function streamFile(abs, o, onChunk) {
  const C = fs.constants;
  const flags = C.O_RDONLY | (C.O_NONBLOCK || 0) | (o.followSymlinks ? 0 : (C.O_NOFOLLOW || 0));
  let fd;
  try { fd = fs.openSync(abs, flags); } catch (e) {
    return { status: e && e.code === 'ELOOP' ? 'symlink' : 'unreadable', bytes: 0 };
  }
  let total = 0;
  try {
    const st = fs.fstatSync(fd);
    if (!st.isFile()) return { status: 'special', bytes: 0 };
    if (st.size > o.maxFileBytes) return { status: 'oversize', bytes: 0 };
    const buf = Buffer.allocUnsafe(o.chunkBytes);
    for (;;) {
      const n = fs.readSync(fd, buf, 0, o.chunkBytes, null);
      if (n === 0) break;
      total += n;
      onChunk(buf.subarray(0, n)); // the matcher copies what it keeps, so reusing buf is safe
      if (total > o.maxFileBytes) return { status: 'oversize', bytes: total };
    }
    return { status: 'ok', bytes: total };
  } catch {
    return { status: 'unreadable', bytes: total };
  } finally {
    try { fs.closeSync(fd); } catch { /* nothing to do */ }
  }
}

/* ========================================================================= *
 * scanDirectory
 * ========================================================================= */

/**
 * opts: { maxFileBytes = 64 MiB, followSymlinks = false, chunkBytes = 64 KiB, maxEntries, maxDepth, arm }
 * Throws if `dir` does not exist / is not a directory (never CLEAN) and ArmingError if the needle set is weak.
 */
export function scanDirectory(dir, needles, opts = {}) {
  const o = normOpts(opts);
  ensureArmed(needles, opts.arm); // scanDirectory
  const nameCheck = (name) => {
    const m = new Matcher(needles);
    m.feed(Buffer.from(name, 'utf8'));
    const r = m.rows().byEncoding;
    return r.length > 0 ? r : null;
  };
  const w = walkTree(dir, o, nameCheck);
  const skipped = w.skipped.slice();
  const hits = [];
  const hitsBySecret = [];
  let filesScanned = 0;
  let bytesScanned = 0;
  for (const f of w.files) {
    const m = new Matcher(needles);
    const rd = streamFile(f.abs, o, (chunk) => m.feed(chunk));
    bytesScanned += rd.bytes;
    if (rd.status === 'ok') filesScanned += 1;
    else skipped.push({ path: f.rel, reason: rd.status });
    const r = m.rows();
    for (const h of r.byEncoding) hits.push({ path: f.rel, encoding: h.encoding, count: h.count });
    for (const h of r.bySecret) hitsBySecret.push({ path: f.rel, secret: h.secret, encoding: h.encoding, count: h.count });
  }
  const j = judge({ hasHits: hits.length > 0 || w.nameHits.length > 0, filesScanned, bytesScanned, skipped });
  return {
    filesScanned, bytesScanned, hits, hitsBySecret, nameHits: w.nameHits, skipped, complete: j.complete,
    dirsVisited: w.dirs, vacuous: j.vacuous, vacuousReason: j.vacuousReason, verdict: j.verdict,
  };
}

/* ========================================================================= *
 * scanForMagic: plaintext original containers in a vault
 * ========================================================================= */

const ZIP_METHODS = new Set([0, 8, 9, 12, 14, 93, 95, 98]);
const isDigit = (c) => c >= 0x30 && c <= 0x39;

export const MAGIC = Object.freeze({
  PDF: Object.freeze({
    name: 'PDF', sig: Buffer.from('%PDF-', 'latin1'), startWindow: 1024, lookahead: 3,
    validate: (b, i) => isDigit(b[i]) && b[i + 1] === 0x2e && isDigit(b[i + 2]),
  }),
  ZIP: Object.freeze({
    name: 'ZIP', sig: Buffer.from([0x50, 0x4b, 0x03, 0x04]), startWindow: 0, lookahead: 6,
    validate: (b, i) => b[i + 1] === 0 && b[i] >= 10 && b[i] <= 63 && ZIP_METHODS.has(b[i + 4]) && b[i + 5] === 0,
  }),
  CFB: Object.freeze({
    name: 'CFB', sig: Buffer.from([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]), startWindow: 0, lookahead: 0,
    validate: () => true,
  }),
  RTF: Object.freeze({
    name: 'RTF', sig: Buffer.from('{\\rtf', 'latin1'), startWindow: 0, lookahead: 1,
    validate: (b, i) => isDigit(b[i]),
  }),
});

const MIN_SIGNATURE_BYTES = 4;

/** Accepts MAGIC entries, or bare signatures (string = latin1 bytes, or Buffer), which match anywhere with no structural check. */
function normaliseMagic(list) {
  if (!Array.isArray(list) || list.length === 0) throw new TypeError('scanForMagic: no patterns (an empty pattern list would pass everything)');
  return list.map((p, i) => {
    if (p && typeof p === 'object' && !(p instanceof Uint8Array) && p.sig instanceof Uint8Array) {
      if (p.sig.length < MIN_SIGNATURE_BYTES) throw new TypeError(`scanForMagic: pattern ${i} signature is shorter than ${MIN_SIGNATURE_BYTES} bytes`);
      return p;
    }
    let sig;
    if (typeof p === 'string') sig = Buffer.from(p, 'latin1');
    else if (p instanceof Uint8Array) sig = Buffer.from(p);
    else throw new TypeError(`scanForMagic: pattern ${i} must be a MAGIC entry, a string or a Buffer`);
    if (sig.length < MIN_SIGNATURE_BYTES) throw new TypeError(`scanForMagic: pattern ${i} signature is shorter than ${MIN_SIGNATURE_BYTES} bytes (it would match ciphertext by chance)`);
    return { name: `custom-${i + 1}`, sig, startWindow: 0, lookahead: 0, validate: () => true };
  });
}

class MagicMatcher {
  constructor(patterns) {
    this.pats = patterns.map((p) => ({ ...p, ext: p.sig.length + (p.lookahead || 0) }));
    this.maxExt = Math.max(...this.pats.map((p) => p.ext));
    this.carry = Buffer.alloc(0);
    this.consumed = 0;
    this.counts = new Map(); // name -> { total, start }
  }

  feed(chunk) {
    const cl = this.carry.length;
    const win = cl > 0 ? Buffer.concat([this.carry, chunk]) : chunk;
    const base = this.consumed - cl;
    for (const p of this.pats) {
      if (p.sig.length === 0) continue; // same reason as Matcher: an empty signature must never loop
      let idx = win.indexOf(p.sig, Math.max(0, cl - p.ext + 1));
      while (idx !== -1) {
        const abs = base + idx;
        const atStart = abs <= p.startWindow;
        const ext = atStart ? p.sig.length : p.ext; // a bare signature suffices only where a real container sits
        const endNeeded = idx + ext;
        if (endNeeded <= win.length && endNeeded > cl) {
          if (atStart || p.validate(win, idx + p.sig.length)) {
            const c = this.counts.get(p.name) || { total: 0, start: 0 };
            c.total += 1;
            if (atStart) c.start += 1;
            this.counts.set(p.name, c);
          }
        }
        idx = win.indexOf(p.sig, idx + 1);
      }
    }
    this.consumed += chunk.length;
    const keep = Math.min(this.maxExt - 1, win.length);
    this.carry = keep > 0 ? Buffer.from(win.subarray(win.length - keep)) : Buffer.alloc(0);
  }

  rows() {
    return [...this.counts].map(([magic, c]) => ({ magic, count: c.total, atStart: c.start > 0 }));
  }
}

/**
 * Detect plaintext PDF / ZIP(docx) containers. opts: { patterns = [MAGIC.PDF, MAGIC.ZIP], followSymlinks, maxFileBytes,
 * chunkBytes, maxEntries, maxDepth }. Rows: { path, magic, count, atStart }.
 */
export function scanForMagic(dir, opts = {}) {
  const patterns = normaliseMagic(opts.patterns ?? [MAGIC.PDF, MAGIC.ZIP]);
  const o = normOpts(opts);
  const w = walkTree(dir, o, null);
  const skipped = w.skipped.slice();
  const hits = [];
  let filesScanned = 0;
  let bytesScanned = 0;
  for (const f of w.files) {
    const m = new MagicMatcher(patterns);
    const rd = streamFile(f.abs, o, (chunk) => m.feed(chunk));
    bytesScanned += rd.bytes;
    if (rd.status === 'ok') filesScanned += 1;
    else skipped.push({ path: f.rel, reason: rd.status });
    for (const r of m.rows()) hits.push({ path: f.rel, magic: r.magic, count: r.count, atStart: r.atStart });
  }
  const j = judge({ hasHits: hits.length > 0, filesScanned, bytesScanned, skipped });
  return {
    filesScanned, bytesScanned, hits, skipped, complete: j.complete, dirsVisited: w.dirs,
    vacuous: j.vacuous, vacuousReason: j.vacuousReason, verdict: j.verdict,
  };
}

/* ========================================================================= *
 * KNOWN_WRONG: deliberately weak scanners, each with a probe that kills it
 * ========================================================================= */

/**
 * A configurable deliberately-weak directory scanner. Each KNOWN_WRONG entry flips exactly ONE decision
 * so a surviving probe names the single missing behaviour.
 */
function weakScan(dir, needles, opts, cfg = {}) {
  const o = normOpts({ ...opts, ...(cfg.walkOpts || {}) });
  const I = _internals(needles);
  const pats = I.entries.filter((e) => e.status === 'ok'
    && (!cfg.encodings || cfg.encodings.includes(e.encoding))
    && (!cfg.firstAlignOnly || e.align === null || e.align === 0));
  const nameCheck = cfg.readNames === false ? null : (name) => {
    const b = Buffer.from(name, 'utf8');
    const r = pats.filter((e) => b.includes(e.pattern)).map((e) => ({ encoding: e.encoding, count: 1 }));
    return r.length > 0 ? r : null;
  };
  const w = cfg.walker ? cfg.walker(dir) : walkTree(dir, o, cfg.rawPaths ? null : nameCheck);
  const hits = [];
  const nameHits = [];
  let filesScanned = 0;
  let bytesScanned = 0;
  const skipped = (w.skipped || []).slice();
  if (cfg.rawPaths) {
    // path-leaking flaw: the name is checked but reported verbatim
    const seen = new Set();
    for (const f of w.files) for (const seg of f.rel.split('/')) {
      const b = Buffer.from(seg, 'utf8');
      for (const e of pats) if (b.includes(e.pattern) && !seen.has(f.rel + e.encoding)) { seen.add(f.rel + e.encoding); nameHits.push({ path: f.rel, encoding: e.encoding, count: 1 }); }
    }
  } else if (w.nameHits) nameHits.push(...w.nameHits);
  for (const f of w.files) {
    let buf;
    try { buf = fs.readFileSync(f.abs); } catch { skipped.push({ path: f.rel, reason: 'unreadable' }); continue; }
    filesScanned += 1;
    bytesScanned += buf.length;
    const seen = new Map();
    const pieces = [];
    if (cfg.chunk) for (let i = 0; i < buf.length; i += cfg.chunk) pieces.push(buf.subarray(i, i + cfg.chunk));
    else pieces.push(buf);
    for (const piece of pieces) {
      for (const e of pats) {
        const hay = (cfg.stripWs !== false && e.lane === 'text') ? stripWs(piece) : piece;
        let at = hay.indexOf(e.pattern);
        while (at !== -1) {
          const cur = seen.get(e.encoding) || { count: 0, context: '' };
          cur.count += 1;
          if (cfg.context) cur.context = hay.subarray(Math.max(0, at - 12), at + e.pattern.length + 12).toString('latin1');
          seen.set(e.encoding, cur);
          at = hay.indexOf(e.pattern, at + 1);
        }
      }
    }
    for (const [encoding, v] of seen) hits.push({ path: f.rel, encoding, count: v.count, ...(cfg.context ? { context: v.context } : {}) });
  }
  const hasHits = hits.length > 0 || nameHits.length > 0;
  let verdict;
  if (hasHits) verdict = 'HITS';
  else if (cfg.verdictMode === 'naive') verdict = 'CLEAN';
  else if (cfg.verdictMode === 'filesOnly') verdict = filesScanned === 0 ? 'VACUOUS' : 'CLEAN';
  else if (cfg.verdictMode === 'ignoreSkips') verdict = (filesScanned === 0 || bytesScanned === 0) ? 'VACUOUS' : 'CLEAN';
  else verdict = judge({ hasHits, filesScanned, bytesScanned, skipped }).verdict;
  return { filesScanned, bytesScanned, hits, nameHits, skipped, verdict, vacuous: verdict === 'VACUOUS', hung: Boolean(w.hung) };
}

function weakLoopWalker(dir) {
  // follows every symlink with no visited set; a step budget stands in for "never returns"
  const budget = 3000;
  let steps = 0;
  const files = [];
  const rec = (abs, rel) => {
    if (steps > budget) return;
    let list;
    try { list = fs.readdirSync(abs, { withFileTypes: true }); } catch { return; }
    for (const d of list) {
      steps += 1;
      if (steps > budget) return;
      const p = path.join(abs, d.name);
      let st;
      try { st = fs.statSync(p); } catch { continue; }
      const r = rel ? `${rel}/${d.name}` : d.name;
      if (st.isDirectory()) rec(p, r);
      else if (st.isFile()) files.push({ abs: p, rel: r });
    }
  };
  rec(dir, '');
  return { files, skipped: [], nameHits: [], hung: steps > budget };
}

function weakMagic(dir, cfg) {
  const o = normOpts({});
  const w = walkTree(dir, o, null);
  const hits = [];
  let filesScanned = 0;
  let bytesScanned = 0;
  for (const f of w.files) {
    const buf = fs.readFileSync(f.abs);
    filesScanned += 1;
    bytesScanned += buf.length;
    const hay = cfg.startOnly ? buf.subarray(0, 1024) : buf;
    for (const p of [MAGIC.PDF, MAGIC.ZIP]) if (hay.includes(p.sig)) hits.push({ path: f.rel, magic: p.name, count: 1, atStart: false });
  }
  const verdict = hits.length > 0 ? 'HITS' : (filesScanned === 0 || bytesScanned === 0 ? 'VACUOUS' : 'CLEAN');
  return { filesScanned, bytesScanned, hits, skipped: [], verdict, vacuous: verdict === 'VACUOUS' };
}

const leaks = (ctx, result) => ctx.leaksIn(JSON.stringify(result));
const rowsOf = (r, key) => (r.hits || []).filter((h) => h.encoding === key);

export const KNOWN_WRONG = Object.freeze([
  {
    id: 'KW-01', name: 'utf8-only scanner',
    flaw: 'searches only the raw and utf8 forms, so base64, hex, UTF-16 and the rest are invisible',
    scan: (dir, needles, opts) => weakScan(dir, needles, opts, { encodings: ['raw', 'utf8'] }),
    probe: {
      setup(dir, ctx) {
        // only forms that can never be byte-identical to the key's raw/utf8 patterns (a JSON form can be, when no byte needs escaping)
        for (const label of ['utf16le', 'utf16be', 'hex-lower', 'hex-upper']) ctx.plantVariant(dir, `kw01/key-${label}.bin`, ctx.groups.key, label);
        ctx.plantVariant(dir, 'kw01/key-urlencoded.bin', ctx.groups.key, 'urlencoded', 'uri');
        ctx.plantVariant(dir, 'kw01/key-json.bin', ctx.groups.key, 'json-escaped', 'ascii');
        ctx.plantVariant(dir, 'kw01/key-b64.bin', ctx.groups.key, 'base64');
      },
      weakFails: (r) => r.verdict === 'CLEAN',
      realPasses: (r) => r.verdict === 'HITS' && r.hits.length === 7 && new Set(r.hits.map((h) => h.encoding)).size >= 6,
    },
  },
  {
    id: 'KW-02', name: 'empty directory is clean',
    flaw: 'verdict is CLEAN whenever there are no hits, even when nothing was scanned',
    scan: (dir, needles, opts) => weakScan(dir, needles, opts, { verdictMode: 'naive' }),
    probe: {
      setup() { /* the empty directory is the probe */ },
      weakFails: (r) => r.verdict === 'CLEAN',
      realPasses: (r) => r.verdict === 'VACUOUS' && r.vacuousReason === 'no-files',
    },
  },
  {
    id: 'KW-03', name: 'zero bytes read is clean',
    flaw: 'counts files visited but never checks that any byte was read',
    scan: (dir, needles, opts) => weakScan(dir, needles, opts, { verdictMode: 'filesOnly' }),
    probe: {
      setup(dir, ctx) { ctx.plant(dir, 'empty-a.bin', Buffer.alloc(0)); ctx.plant(dir, 'sub/empty-b.bin', Buffer.alloc(0)); },
      weakFails: (r) => r.verdict === 'CLEAN',
      realPasses: (r) => r.verdict === 'VACUOUS' && r.vacuousReason === 'no-bytes',
    },
  },
  {
    id: 'KW-04', name: 'skipped files are clean',
    flaw: 'a file it could not read (oversize) is silently ignored and the rest is called clean',
    scan: (dir, needles, opts) => weakScan(dir, needles, opts, { verdictMode: 'ignoreSkips' }),
    probe: {
      opts: { maxFileBytes: 4096 },
      setup(dir, ctx) { ctx.plant(dir, 'small-clean.bin', ctx.noise(512)); ctx.plant(dir, 'huge.bin', ctx.noise(8192)); },
      weakFails: (r) => r.verdict === 'CLEAN',
      realPasses: (r) => r.verdict === 'VACUOUS' && r.vacuousReason === 'incomplete-coverage' && r.skipped.some((s) => s.reason === 'oversize'),
    },
  },
  {
    id: 'KW-05', name: 'returns matched context',
    flaw: 'each hit carries the surrounding bytes of the match',
    scan: (dir, needles, opts) => weakScan(dir, needles, opts, { context: true }),
    probe: {
      setup(dir, ctx) { ctx.plantVariant(dir, 'kw05/leak.bin', ctx.groups.canary, 'raw'); },
      weakFails: (r, ctx) => r.verdict === 'HITS' && leaks(ctx, r),
      realPasses: (r, ctx) => r.verdict === 'HITS' && !leaks(ctx, r),
    },
  },
  {
    id: 'KW-06', name: 'chunked reader with no overlap',
    flaw: 'reads 64 KiB chunks and searches each independently, so a secret spanning a boundary is missed',
    scan: (dir, needles, opts) => weakScan(dir, needles, opts, { chunk: DEFAULT_CHUNK_BYTES }),
    probe: {
      setup(dir, ctx) {
        const c = ctx.groups.canary.B;
        ctx.plant(dir, 'kw06/straddle.bin', Buffer.concat([ctx.noise(DEFAULT_CHUNK_BYTES - 7), c, ctx.noise(300)]));
      },
      weakFails: (r) => r.verdict === 'CLEAN',
      realPasses: (r) => r.verdict === 'HITS' && rowsOf(r, 'raw').length === 1,
    },
  },
  {
    id: 'KW-07', name: 'base64 at one alignment only',
    flaw: 'encodes the secret as base64 once, so it is blind when the secret sits at offset 1 or 2 mod 3',
    scan: (dir, needles, opts) => weakScan(dir, needles, opts, { firstAlignOnly: true }),
    probe: {
      setup(dir, ctx) {
        ctx.plantVariant(dir, 'kw07/a1.bin', ctx.groups.key, 'base64', 'k1');
        ctx.plantVariant(dir, 'kw07/a2.bin', ctx.groups.key, 'base64', 'k2');
      },
      weakFails: (r) => r.verdict === 'CLEAN',
      realPasses: (r) => r.verdict === 'HITS' && r.hits.length === 2,
    },
  },
  {
    id: 'KW-08', name: 'lower-case hex only',
    flaw: 'searches hex in one case, so an upper-case hex dump of the key is invisible',
    scan: (dir, needles, opts) => weakScan(dir, needles, opts, { encodings: ENCODING_ORDER.filter((l) => l !== 'hex-upper') }),
    probe: {
      setup(dir, ctx) { ctx.plantVariant(dir, 'kw08/upper.bin', ctx.groups.key, 'hex-upper'); },
      weakFails: (r) => r.verdict === 'CLEAN',
      realPasses: (r) => r.verdict === 'HITS' && rowsOf(r, 'hex-upper').length === 1,
    },
  },
  {
    id: 'KW-09', name: 'wrapped base64 is invisible',
    flaw: 'searches the bytes as stored, so a wrapped base64 key (line break every 16 columns, shorter than the pattern) is missed',
    scan: (dir, needles, opts) => weakScan(dir, needles, opts, { stripWs: false }),
    probe: {
      setup(dir, ctx) { ctx.plant(dir, 'kw09/key.pem', ctx.wrapped(ctx.groups.key, 'base64', 16, '\n')); },
      weakFails: (r) => r.verdict === 'CLEAN',
      realPasses: (r) => r.verdict === 'HITS' && rowsOf(r, 'base64').length === 1,
    },
  },
  {
    id: 'KW-10', name: 'file-name blind',
    flaw: 'reads file contents only, so a file named after the canary (with benign content) is not reported',
    scan: (dir, needles, opts) => weakScan(dir, needles, opts, { readNames: false }),
    probe: {
      setup(dir, ctx) { ctx.plant(dir, ctx.groups.canary.S + '.txt', ctx.noise(200)); },
      weakFails: (r) => r.verdict === 'CLEAN',
      realPasses: (r) => r.verdict === 'HITS' && r.nameHits.length >= 1,
    },
  },
  {
    id: 'KW-11', name: 'path-leaking report',
    flaw: 'reports the true path of a file whose NAME contains the canary, so the report itself carries the secret',
    scan: (dir, needles, opts) => weakScan(dir, needles, opts, { rawPaths: true }),
    probe: {
      setup(dir, ctx) { ctx.plant(dir, ctx.groups.canary.S + '.txt', ctx.noise(200)); },
      weakFails: (r, ctx) => r.verdict === 'HITS' && leaks(ctx, r),
      realPasses: (r, ctx) => r.verdict === 'HITS' && !leaks(ctx, r),
    },
  },
  {
    id: 'KW-12', name: 'symlink loop without a visited set',
    flaw: 'follows symlinks with no cycle guard, so a directory symlinked to itself never terminates',
    scan: (dir, needles, opts) => weakScan(dir, needles, opts, { walker: weakLoopWalker }),
    probe: {
      opts: { followSymlinks: true },
      setup(dir, ctx) {
        ctx.plant(dir, 'clean.bin', ctx.noise(256));
        // two links per level: one self-link alone dies at the kernel's 40-hop limit, two branch exponentially
        if (!ctx.symlink('.', path.join(dir, 'loop1')) || !ctx.symlink('.', path.join(dir, 'loop2'))) throw new Error('symlink unavailable');
      },
      weakFails: (r) => r.hung === true,
      realPasses: (r) => r.verdict === 'CLEAN' && r.skipped.some((s) => s.reason === 'symlink-loop') && r.filesScanned === 1,
    },
  },
  {
    id: 'KW-13', name: 'magic detector looks at the start only',
    kind: 'magic', flaw: 'inspects the first 1 KiB, so a plaintext container embedded after a header is missed',
    scan: (dir) => weakMagic(dir, { startOnly: true }),
    probe: {
      setup(dir, ctx) { ctx.plant(dir, 'kw13/wrapped.bin', Buffer.concat([ctx.noise(5000), ctx.zipHeader(), ctx.noise(400)])); },
      weakFails: (r) => r.verdict === 'CLEAN',
      realPasses: (r) => r.verdict === 'HITS' && r.hits.length === 1 && r.hits[0].atStart === false,
    },
  },
  {
    id: 'KW-14', name: 'magic detector flags a bare signature anywhere',
    kind: 'magic', flaw: 'treats any 4-byte PK signature as a container, so ciphertext trips it by chance',
    scan: (dir) => weakMagic(dir, {}),
    probe: {
      setup(dir, ctx) {
        ctx.plant(dir, 'kw14/cipher.bin', Buffer.concat([ctx.noise(3000), Buffer.from([0x50, 0x4b, 0x03, 0x04, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff]), ctx.noise(900)]));
      },
      weakFails: (r) => r.verdict === 'HITS',
      realPasses: (r) => r.verdict === 'CLEAN' && r.filesScanned === 1,
    },
  },
]);

/* ========================================================================= *
 * selfTest
 * ========================================================================= */

function mkTmp(created) {
  const d = fs.mkdtempSync(path.join(os.tmpdir(), 'wsi-scanners-'));
  created.push(d);
  return d;
}

function writeAt(dir, rel, buf) {
  const abs = path.join(dir, rel);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, buf);
  return abs;
}

function lcs(a, b) {
  let best = '';
  let prev = new Array(b.length + 1).fill(0);
  for (let i = 1; i <= a.length; i++) {
    const cur = new Array(b.length + 1).fill(0);
    for (let j = 1; j <= b.length; j++) {
      if (a[i - 1] === b[j - 1]) {
        cur[j] = prev[j - 1] + 1;
        if (cur[j] > best.length) best = a.slice(i - cur[j], i);
      }
    }
    prev = cur;
  }
  return best;
}

/** Independent oracle for the base64 region: the common substring of many random embeddings. */
function oracleRegion(B, k, url) {
  let region = null;
  // 16 samples: the last character can depend on as few as 2 random bits, so 8 samples left ~6e-5 odds per boundary
  // of an accidental agreement that would make the oracle one character too long
  for (let i = 0; i < 16; i++) {
    const embedded = Buffer.concat([crypto.randomBytes(3 * crypto.randomInt(1, 4) + k), B, crypto.randomBytes(crypto.randomInt(0, 5))]);
    const s = embedded.toString(url ? 'base64url' : 'base64').replace(/=+$/, '');
    region = region === null ? s : lcs(region, s);
  }
  return Buffer.from(region, 'latin1');
}

const bytesPct = (B) => [...B].map((c) => (/[A-Za-z0-9\-._~]/.test(String.fromCharCode(c)) ? String.fromCharCode(c) : '%' + c.toString(16).padStart(2, '0').toUpperCase())).join('');

/** Test-side encoders. Deliberately independent of the pattern generators above (node built-ins only). */
function makeKit(groups) {
  const rb = (n) => crypto.randomBytes(n);
  const ri = (lo, hi) => crypto.randomInt(lo, hi + 1);
  // File padding and noise are NUL-free on purpose: a 0x00 byte adjacent to a UTF-16 occurrence makes the OTHER
  // endianness' pattern genuinely present one byte shifted (see check B10), which would blur exact attribution.
  const nonNul = (n) => rb(n).map((b) => (b === 0 ? 1 : b));
  const pad = () => nonNul(ri(1, 9));
  const embedAt = (B, k) => Buffer.concat([rb(3 * ri(1, 3) + k), B, rb(ri(0, 4))]);
  const asciiEsc = (s, upper) => s.replace(/[^\x00-\x7f]/g, (c) => '\\u' + (upper ? c.charCodeAt(0).toString(16).toUpperCase().padStart(4, '0') : c.charCodeAt(0).toString(16).padStart(4, '0')));
  const lowerPct = (s) => s.replace(/%[0-9A-F]{2}/g, (m) => m.toLowerCase());

  /** All planted variants for (group, label): { tag, bytes (file content), core (the encoding alone, for alias comparison) }. */
  function variants(g, label) {
    const B = g.B;
    const S = g.S;
    const wrap = (core) => Buffer.concat([pad(), core, pad()]);
    switch (label) {
      case 'raw': return [{ tag: 'v', bytes: wrap(B), core: B }];
      case 'utf8': return [{ tag: 'v', bytes: wrap(Buffer.from(S, 'utf8')), core: Buffer.from(S, 'utf8') }];
      case 'utf16le': return [{ tag: 'v', bytes: wrap(Buffer.from(S, 'utf16le')), core: Buffer.from(S, 'utf16le') }];
      case 'utf16be': return [{ tag: 'v', bytes: wrap(Buffer.from(S, 'utf16le').swap16()), core: Buffer.from(S, 'utf16le').swap16() }];
      case 'base64':
      case 'base64url': {
        const url = label === 'base64url';
        return [0, 1, 2].map((k) => ({
          tag: `k${k}`,
          bytes: wrap(Buffer.from(embedAt(B, k).toString(url ? 'base64url' : 'base64'), 'latin1')),
          core: g.oracle[url ? 'url' : 'std'][k],
        }));
      }
      case 'hex-lower':
      case 'hex-upper': {
        const up = label === 'hex-upper';
        const fmt = (b) => { const h = b.toString('hex'); return up ? h.toUpperCase() : h; };
        const pairs = (b) => Array.from(b, (c) => fmt(Buffer.from([c])));
        const emb = Buffer.concat([rb(2), B, rb(2)]);
        // independent of hexSeparatedVariants: built from per-byte hex, not from the module's generator
        return [
          { tag: 'v', bytes: wrap(Buffer.from(fmt(emb), 'latin1')), core: Buffer.from(fmt(B), 'latin1') },
          { tag: 'colon', bytes: wrap(Buffer.from(pairs(emb).join(':'), 'latin1')), core: Buffer.from(pairs(B).join(':'), 'latin1') },
          { tag: 'c-array', bytes: wrap(Buffer.from('{ ' + pairs(emb).map((x) => '0x' + x).join(', ') + ' }', 'latin1')), core: Buffer.from(pairs(B).map((x) => '0x' + x).join(','), 'latin1') },
          { tag: 'bs-x', bytes: wrap(Buffer.from('b"' + pairs(emb).map((x) => '\\x' + x).join('') + '"', 'latin1')), core: Buffer.from(pairs(B).map((x) => '\\x' + x).join(''), 'latin1') },
        ];
      }
      case 'urlencoded': {
        const uri = encodeURIComponent(S);
        const list = [
          { tag: 'uri', s: uri },
          { tag: 'uri-lower', s: lowerPct(uri) },
          { tag: 'form', s: uri.replace(/%20/g, '+') },
        ];
        if (g.kind === 'binary') list.push({ tag: 'bytes', s: bytesPct(B) });
        const out = list.map(({ tag, s }) => ({ tag, bytes: wrap(Buffer.from(`q=${s}&z=1`, 'latin1')), core: Buffer.from(s, 'latin1') }));
        // the base64 TEXT of the secret, percent-encoded. Only where the trimmed region holds a '+' or '/' (otherwise the text is
        // plain base64 and legitimately belongs to the base64 label, which is not what this variant is for).
        for (const k of [0, 1, 2]) {
          const region = g.oracle.std[k].toString('latin1');
          const b64 = embedAt(B, k).toString('base64');
          if (/[+/]/.test(region)) {
            out.push({ tag: `b64k${k}`, bytes: wrap(Buffer.from(`q=${encodeURIComponent(b64)}&z=1`, 'latin1')), core: Buffer.from(encodeURIComponent(region), 'latin1') });
            out.push({ tag: `b64k${k}-lower`, bytes: wrap(Buffer.from(`q=${lowerPct(encodeURIComponent(b64))}&z=1`, 'latin1')), core: Buffer.from(lowerPct(encodeURIComponent(region)), 'latin1') });
          }
          if (/\+/.test(region)) {
            out.push({ tag: `b64k${k}-plus`, bytes: wrap(Buffer.from(`q=${b64.replace(/\+/g, '%2B')}&z=1`, 'latin1')), core: Buffer.from(region.replace(/\+/g, '%2B'), 'latin1') });
          }
        }
        return out;
      }
      case 'json-escaped': {
        const base = JSON.stringify(S).slice(1, -1);
        const list = [
          { tag: 'json', s: base },
          { tag: 'ascii', s: asciiEsc(base, false) },
          { tag: 'ascii-upper', s: asciiEsc(base, true) },
          { tag: 'slash', s: base.replace(/\//g, '\\/') },
        ];
        return list.map(({ tag, s }) => ({ tag, bytes: wrap(Buffer.from(`{"v":"${s}"}`, 'utf8')), core: Buffer.from(s, 'utf8') }));
      }
      case 'byte-array': {
        const arr = Array.from(B);
        const emb = Buffer.concat([rb(2), B, rb(2)]);
        const wholeTyped = new Uint8Array(B); // JSON.stringify of a typed array keys elements by index, so the array must BE the secret
        const mk = (tag, text) => ({ tag, bytes: wrap(Buffer.from(text, 'utf8')), core: Buffer.from(arr.join(','), 'latin1') });
        return [
          mk('compact', JSON.stringify(emb)),
          mk('spaced', '[ ' + Array.from(emb).join(', ') + ' ]'),
          mk('pretty', JSON.stringify(emb, null, 2)),
          mk('inspect', util.inspect(new Uint8Array(emb), { maxArrayLength: null, breakLength: 60 })),
          mk('indexed', JSON.stringify({ Plaintext: wholeTyped })),
          mk('indexed-pretty', JSON.stringify({ Plaintext: wholeTyped }, null, 2)),
        ];
      }
      case 'case-folded': {
        if (g.kind !== 'text') return [];
        const capWord = (w) => { const cp = Array.from(w); return cp.length ? cp[0].toUpperCase() + cp.slice(1).join('').toLowerCase() : w; };
        const forms = { lower: S.toLowerCase(), upper: S.toUpperCase(), title: capWord(S), words: S.replace(/[\p{L}\p{N}]+/gu, capWord) };
        const seenForms = new Set([S]);
        const out = [];
        for (const [tag, f] of Object.entries(forms)) {
          if (seenForms.has(f)) continue; // equal to the text itself (or to an earlier fold): that is the raw label's business
          seenForms.add(f);
          out.push({ tag, bytes: wrap(Buffer.from(f, 'utf8')), core: Buffer.from(f, 'utf8') });
        }
        return out;
      }
      default: throw new Error(`kit: no variants for ${label}`);
    }
  }

  /** The earliest label whose PRIMARY encoding is byte-identical to this planted core (independent alias rule). */
  function expectedLabel(g, label, variant) {
    const prim = (l) => {
      switch (l) {
        case 'raw': return [g.B];
        case 'utf8': return [Buffer.from(g.S, 'utf8')];
        case 'utf16le': return [Buffer.from(g.S, 'utf16le')];
        case 'utf16be': return [Buffer.from(g.S, 'utf16le').swap16()];
        case 'base64': return g.oracle.std;
        case 'base64url': return g.oracle.url;
        case 'hex-lower':
        case 'hex-upper': return variants(g, l).map((v) => v.core);
        case 'urlencoded': return [Buffer.from(encodeURIComponent(g.S), 'latin1')];
        case 'json-escaped': return [Buffer.from(JSON.stringify(g.S).slice(1, -1), 'utf8')];
        default: return [];
      }
    };
    for (const l of ENCODING_ORDER) {
      if (l === label) return label;
      if (prim(l).some((c) => c.equals(variant.core))) return l;
    }
    return label;
  }

  function wrapped(g, label, cols, eol) {
    const url = label === 'base64url';
    const s = label === 'hex-lower' ? Buffer.concat([rb(2), g.B, rb(2)]).toString('hex')
      : embedAt(g.B, 0).toString(url ? 'base64url' : 'base64');
    const lines = [];
    for (let i = 0; i < s.length; i += cols) lines.push(s.slice(i, i + cols));
    return Buffer.from(`-----BEGIN TEST-----${eol}${lines.join(eol)}${eol}-----END TEST-----${eol}`, 'latin1');
  }

  return {
    rb, variants, expectedLabel, wrapped,
    noise: (n) => nonNul(n),
    zipHeader: () => Buffer.from([0x50, 0x4b, 0x03, 0x04, 0x14, 0x00, 0x00, 0x00, 0x08, 0x00, 0x21, 0x00, 0x00, 0x00]),
  };
}

function genKey() {
  for (let i = 0; i < 400; i++) {
    const k = crypto.randomBytes(32);
    if (isUtf8RoundTrip(k)) continue;
    const ok = [0, 1, 2].every((a) => /[+/]/.test(oracleRegion(k, a, false).toString('latin1')));
    if (ok) return k;
  }
  throw new Error('could not generate a test key with distinguishable base64 alignments');
}

function genOriginal() {
  // fictional container: a PDF-ish header followed by random body bytes (no real content anywhere)
  return Buffer.concat([Buffer.from('%PDF-1.7\n%fictional-test-fixture\n'), crypto.randomBytes(2400), Buffer.from('\n%%EOF\n')]);
}

function groupsOf(needles) {
  const out = [];
  for (const g of _internals(needles).groups) {
    const gg = { ...g };
    gg.oracle = {
      std: [0, 1, 2].map((k) => oracleRegion(g.B, k, false)),
      url: [0, 1, 2].map((k) => oracleRegion(g.B, k, true)),
    };
    out.push(gg);
  }
  return out;
}

/** True if `json` contains any >=10-char fragment of any secret form. */
function makeLeakDetector(groups) {
  const forms = [];
  for (const g of groups) {
    forms.push(g.S, g.B.toString('latin1'), g.B.toString('hex'), g.B.toString('hex').toUpperCase(),
      g.B.toString('base64'), g.B.toString('base64url'), encodeURIComponent(g.S), JSON.stringify(g.S).slice(1, -1));
    for (const k of [0, 1, 2]) { forms.push(b64Region(g.B, k, false).toString('latin1'), b64Region(g.B, k, true).toString('latin1')); }
  }
  const frag = new Set();
  for (const f of forms) {
    if (typeof f !== 'string') continue;
    if (f.length < 10) continue;
    for (let i = 0; i + 10 <= f.length; i++) frag.add(f.slice(i, i + 10)); // every offset: any leaked run of >= 10 characters is caught
  }
  return (text) => {
    for (const f of frag) if (text.includes(f)) return true;
    return false;
  };
}

const HIT_KEYS = ['count', 'encoding', 'path'];
const SECRET_HIT_KEYS = ['count', 'encoding', 'path', 'secret'];
const MAGIC_HIT_KEYS = ['atStart', 'count', 'magic', 'path'];
const sameKeys = (o, keys) => JSON.stringify(Object.keys(o).sort()) === JSON.stringify(keys);

export function selfTest() {
  const checks = [];
  const unverified = [];
  const created = [];
  const restoreModes = []; // paths chmod'ed to 000 by a check; restored before cleanup so rmSync can descend
  const add = (name, ok, detail = '') => { checks.push({ name, ok: Boolean(ok), detail: String(detail) }); };
  const run = (name, fn) => {
    try {
      const r = fn();
      add(name, r.ok, r.detail);
    } catch (e) {
      add(name, false, `threw ${e && e.name}: ${String(e && e.message).slice(0, 160)}`);
    }
  };
  const throwsKind = (fn, Ctor) => {
    try { fn(); } catch (e) { return Boolean(Ctor ? e instanceof Ctor : true); }
    return false;
  };

  try {
    /* --- fixtures: secrets are generated at runtime and never written to this file --- */
    const rnd = crypto.randomBytes(8).toString('hex');
    // quote, backslash, '+', '&', '=', CJK and an astral emoji: distinct in url/json/utf16/ascii-JSON (surrogate pair).
    // No character here has a canonical decomposition, so the filename tests survive Unicode-normalising filesystems.
    const canarySpecial = `WSI "q"\\bs+plus \u6f22\u{1f600}&amp=eq (x) ${rnd}`;
    const canaryTypical = `WSICANARY${crypto.randomBytes(12).toString('hex').toUpperCase()}`;
    const keyBytes = genKey();
    const originalBytes = genOriginal();
    const plainKey = Buffer.from(crypto.randomBytes(32).toString('base64').replace(/[^A-Za-z]/g, 'q').padEnd(32, 'z').slice(0, 32), 'latin1');

    // genOriginal() is a random body behind a short header: no template, so the caller DECLARES it template-free. (The header
    // window is low-entropy and is refused; only the random body qualifies. The sibling and canary-anchor routes have their own checks, J1-J6.)
    const UQ = { assertUnique: true };
    const N = makeNeedles({ canary: canarySpecial, originalBytes, keyBytes }, UQ);
    const Nt = makeNeedles({ canary: canaryTypical, originalBytes, keyBytes: plainKey }, UQ);
    const G = groupsOf(N);
    const Gt = groupsOf(Nt);
    const byKey = (gs) => ({ canary: gs.find((g) => g.secret === 'canary'), key: gs.find((g) => g.secret === 'key'), original: gs.filter((g) => g.secret === 'original') });
    const groupsN = byKey(G);
    const kit = makeKit(G);
    const leaksIn = makeLeakDetector([...G, ...Gt]);
    const desc = N.describe();

    /* ---------------------------------------------------------------- A0. typed-array inputs (reviewer HIGH defect) */
    // Before the fix a key held in a plain Uint8Array read CLEAN: Uint8Array#indexOf matches one numeric element, not a
    // byte sequence. Every shape below must be caught, and a same-shaped negative must stay CLEAN (so the check is not
    // satisfied by a scanner that simply reports hits everywhere).
    run('A0 scanBuffer treats a plain Uint8Array exactly like a Buffer: key, canary and the whole original, whole and chunked (5 / 4096), plus a non-zero-offset view; a same-shaped negative stays CLEAN', () => {
      const probeKey = crypto.randomBytes(32);
      const probeCanary = `WSICANARY${crypto.randomBytes(12).toString('hex').toUpperCase()}`;
      const probeOriginal = genOriginal();
      const NN = makeNeedles({ canary: probeCanary, originalBytes: probeOriginal, keyBytes: probeKey }, UQ);
      const subjects = { key: probeKey, canary: Buffer.from(probeCanary), original: probeOriginal };
      const bad = [];
      let compared = 0;
      for (const [name, secret] of Object.entries(subjects)) {
        const asBuf = Buffer.concat([Buffer.alloc(100, 1), secret, Buffer.alloc(100, 2)]);
        const ab = new ArrayBuffer(asBuf.length + 7);
        new Uint8Array(ab).set(asBuf, 3);
        const shapes = { 'plain Uint8Array': new Uint8Array(asBuf), 'offset view': new Uint8Array(ab, 3, asBuf.length) };
        for (const chunkBytes of [undefined, 5, 4096]) {
          const want = scanBuffer(asBuf, NN, { chunkBytes });
          if (want.verdict !== 'HITS' || !want.hitsBySecret.some((h) => h.secret === name)) bad.push(`${name}/Buffer-control/${chunkBytes}`);
          for (const [shape, view] of Object.entries(shapes)) {
            compared += 1;
            if (JSON.stringify(scanBuffer(view, NN, { chunkBytes })) !== JSON.stringify(want)) bad.push(`${name}/${shape}/${chunkBytes}`);
          }
        }
      }
      const negVerdict = scanBuffer(new Uint8Array(crypto.randomBytes(4096)), NN).verdict;
      return { ok: bad.length === 0 && compared === 18 && negVerdict === 'CLEAN', detail: `typed-array results identical to Buffer results: ${compared - bad.length}/${compared}${bad.length ? ' differ=' + bad.slice(0, 4).join(',') : ''} negative=${negVerdict}` };
    });

    /* ---------------------------------------------------------------- A. needle construction */
    run('A1 needle set carries every required encoding for every secret and probe (incl. 3 base64 alignments)', () => {
      const I = _internals(N);
      const miss = [];
      let foldedGroups = 0;
      for (const g of I.groups) {
        for (const enc of ENCODING_ORDER) {
          const es = I.entries.filter((e) => e.secret === g.secret && e.group === g.group && e.encoding === enc && e.status !== 'too-short');
          // case-folding is only meaningful for a secret that is text: a random binary window has no letters to fold
          if (enc === 'case-folded') {
            if ((g.kind === 'text') !== (es.length > 0)) miss.push(`${g.secret}/${g.group}/${enc}(kind=${g.kind})`);
            if (g.kind === 'text') foldedGroups += 1;
            continue;
          }
          if (es.length === 0) miss.push(`${g.secret}/${g.group}/${enc}`);
          if (enc === 'base64' || enc === 'base64url') for (const k of [0, 1, 2]) if (!es.some((e) => e.align === k)) miss.push(`${g.secret}/${g.group}/${enc}@${k}`);
        }
      }
      return { ok: miss.length === 0 && I.groups.length >= 6 && foldedGroups >= 1, detail: `groups=${I.groups.length} text-groups=${foldedGroups} patterns=${desc.patterns} aliases=${desc.aliases} missing=${miss.length}${miss.length ? ' ' + miss.slice(0, 3).join(',') : ''}` };
    });

    run('A2 base64 / base64url alignment trimming equals an independent differential oracle', () => {
      const I = _internals(N);
      const bad = [];
      let n = 0;
      for (const g of G) {
        for (const [label, url, oracle] of [['base64', false, g.oracle.std], ['base64url', true, g.oracle.url]]) {
          for (const k of [0, 1, 2]) {
            n += 1;
            const e = I.entries.find((x) => x.secret === g.secret && x.group === g.group && x.encoding === label && x.align === k);
            const have = e && e.status !== 'alias' ? e.pattern : (I.entries.find((x) => x.secret === g.secret && x.group === g.group && x.status === 'ok' && x.pattern.equals(oracle[k])) || {}).pattern;
            if (!have || !have.equals(oracle[k])) bad.push(`${g.secret}/${g.group}/${label}@${k}`);
          }
        }
      }
      return { ok: bad.length === 0 && n === G.length * 6, detail: `compared=${n} mismatches=${bad.length}${bad.length ? ' ' + bad.slice(0, 3).join(',') : ''}` };
    });

    run('A3 the needle set itself never serialises its content (toJSON, inspect, String)', () => {
      const dump = JSON.stringify(N) + util.inspect(N, { depth: 6 }) + String(N) + JSON.stringify(desc);
      return { ok: !leaksIn(dump) && dump.includes('wsi-needles/1'), detail: `chars=${dump.length}` };
    });

    run('A4 makeNeedles refuses missing, short, degenerate, mistyped and unknown-encoding input, each for its OWN reason', () => {
      const good = { canary: canaryTypical, originalBytes, keyBytes };
      // every case carries UQ so that the probe rule (J-checks) cannot be the thing that throws: the message must name the intended defect
      const cases = {
        'no-args': [() => makeNeedles(), /expected \{ canary/],
        'missing-key': [() => makeNeedles({ canary: canaryTypical, originalBytes }, UQ), /missing secret\(s\): key/],
        'nothing': [() => makeNeedles({}, { partial: true }), /no secrets given/],
        'short-canary': [() => makeNeedles({ ...good, canary: 'short' }, UQ), /'canary' is shorter than/],
        'degenerate-key': [() => makeNeedles({ ...good, keyBytes: Buffer.alloc(32, 7) }, UQ), /'key' is degenerate/],
        'wrong-type': [() => makeNeedles({ ...good, keyBytes: 12345 }, UQ), /'key' must be a string or Uint8Array/],
        'unknown-encoding': [() => makeNeedles(good, { ...UQ, encodings: ['rot13'] }), /unknown encoding 'rot13'/],
        'no-encodings': [() => makeNeedles(good, { ...UQ, encodings: [] }), /no encodings requested/],
        'tiny-original': [() => makeNeedles({ ...good, originalBytes: Buffer.from('tiny') }, UQ), /'original' is shorter than/],
        'siblings-not-array': [() => makeNeedles(good, { ...UQ, siblings: Buffer.alloc(8) }), /'siblings' must be an array/],
        'sibling-not-bytes': [() => makeNeedles(good, { ...UQ, siblings: ['text'] }), /sibling 0 must be a Buffer or Uint8Array/],
      };
      const wrong = [];
      for (const [k, [fn, re]] of Object.entries(cases)) {
        let err = null;
        try { fn(); } catch (e) { err = e; }
        if (!(err instanceof TypeError) || !re.test(err.message)) wrong.push(`${k}${err ? '(' + String(err.message).slice(0, 40) + ')' : '(no throw)'}`);
      }
      const partialOk = (() => { try { return makeNeedles({ canary: canaryTypical }, { partial: true }).describe().secrets.length === 1; } catch { return false; } })();
      return { ok: wrong.length === 0 && partialOk, detail: `cases=${Object.keys(cases).length} refused-for-the-wrong-reason-or-accepted=${wrong.join(',') || 'none'} partial-opt-in=${partialOk}` };
    });

    /* ---------------------------------------------------------------- B. planted positives */
    function plantAll(needles, groups, rootDir, label) {
      const planted = []; // { rel, g, enc, tag, expected }
      let i = 0;
      for (const g of groups) {
        for (const enc of ENCODING_ORDER) {
          for (const v of kit.variants(g, enc)) {
            const rel = `${label}/${g.secret}-${g.group}/${enc}.${v.tag}.bin`;
            writeAt(rootDir, rel, v.bytes);
            planted.push({ rel, g, enc, tag: v.tag, expected: kit.expectedLabel(g, enc, v) });
            i += 1;
          }
        }
      }
      return { planted, count: i };
    }

    function attribution(result, planted) {
      const bad = [];
      for (const p of planted) {
        const rows = result.hitsBySecret.filter((h) => h.path === p.rel);
        const ok = rows.length === 1 && rows[0].secret === p.g.secret && rows[0].encoding === p.expected && rows[0].count === 1;
        const agg = result.hits.filter((h) => h.path === p.rel);
        const okAgg = agg.length === 1 && agg[0].encoding === p.expected && agg[0].count === 1;
        if (!ok || !okAgg) bad.push(`${p.g.secret}/${p.g.group}/${p.enc}.${p.tag}->${rows.map((r) => r.secret + ':' + r.encoding + 'x' + r.count).join('|') || 'MISSED'}(want ${p.expected})`);
      }
      return bad;
    }

    run('B1 every planted positive (canary, key, each original probe x every encoding/variant/alignment) is found and attributed to exactly the right encoding', () => {
      const d = mkTmp(created);
      const { planted, count } = plantAll(N, G, d, 'pos');
      writeAt(d, 'nested dir/deep er/a file with spaces.bin', Buffer.concat([kit.noise(20), groupsN.canary.B, kit.noise(20)])); // nested + space in name
      const r = scanDirectory(d, N);
      const bad = attribution(r, planted);
      const nested = r.hitsBySecret.filter((h) => h.path === 'nested dir/deep er/a file with spaces.bin');
      const nestedOk = nested.length === 1 && nested[0].secret === 'canary' && nested[0].encoding === 'raw';
      return { ok: bad.length === 0 && r.verdict === 'HITS' && r.filesScanned === count + 1 && nestedOk, detail: `planted=${count} scanned=${r.filesScanned} misattributed=${bad.length}${bad.length ? ' ' + bad.slice(0, 3).join(' ; ') : ''} nested-with-space=${nestedOk}` };
    });

    run('B2 aliasing: plain-alphanumeric canary reports raw/utf8/urlencoded/json as one; ASCII key reports base64url as base64', () => {
      const d = mkTmp(created);
      const { planted, count } = plantAll(Nt, Gt.filter((g) => g.secret !== 'original'), d, 'alias');
      const r = scanDirectory(d, Nt);
      const bad = attribution(r, planted);
      const aliasSeen = planted.filter((p) => p.expected !== p.enc).length;
      const canaryAliased = planted.filter((p) => p.g.secret === 'canary' && ['utf8', 'urlencoded', 'json-escaped'].includes(p.enc) && p.tag !== 'form' && p.expected === 'raw').length;
      const keyAliased = planted.some((p) => p.g.secret === 'key' && p.enc === 'base64url' && p.expected === 'base64');
      return { ok: bad.length === 0 && r.filesScanned === count && aliasSeen > 0 && canaryAliased >= 3 && keyAliased, detail: `planted=${count} alias-expectations=${aliasSeen} canary-aliased=${canaryAliased} key-b64url-aliased=${keyAliased} misattributed=${bad.length}` };
    });

    run('B3 randomised base64/base64url embeddings (any prefix, any suffix) are always found', () => {
      let miss = 0;
      let n = 0;
      for (const g of [groupsN.canary, groupsN.key, ...groupsN.original]) {
        for (const url of [false, true]) {
          for (let t = 0; t < 36; t++) {
            const emb = Buffer.concat([crypto.randomBytes(crypto.randomInt(0, 40)), g.B, crypto.randomBytes(crypto.randomInt(0, 40))]);
            const text = Buffer.from(emb.toString(url ? 'base64url' : 'base64'), 'latin1');
            const r = scanBuffer(text, N);
            n += 1;
            if (!r.hitsBySecret.some((h) => h.secret === g.secret && (h.encoding === 'base64' || h.encoding === 'base64url'))) miss += 1;
          }
        }
      }
      return { ok: miss === 0 && n > 400, detail: `trials=${n} missed=${miss}` };
    });

    run('B4 wrapped base64 / hex (LF and CRLF, columns that really split the pattern) is found, at two chunk sizes; the unwrapped form is proven absent from the file', () => {
      const d = mkTmp(created);
      const cases = [];
      let vacuousWrap = 0;
      for (const [cols, eol] of [[16, '\n'], [20, '\r\n'], [33, '\n']]) {
        for (const g of [groupsN.key, groupsN.original[0]]) {
          for (const label of ['base64', 'base64url', 'hex-lower']) {
            const rel = `wrap/${g.secret}-${label}-${cols}-${eol.length}.txt`;
            const bytes = kit.wrapped(g, label, cols, eol);
            writeAt(d, rel, bytes);
            // non-vacuity: no contiguous form of the secret may survive in the file, otherwise lane B proves nothing
            const contiguous = label === 'hex-lower'
              ? [Buffer.from(g.B.toString('hex'), 'latin1')]
              : (label === 'base64' ? g.oracle.std : g.oracle.url);
            if (contiguous.some((c) => bytes.includes(c))) vacuousWrap += 1;
            cases.push({ rel, g, label });
          }
        }
      }
      const small = scanDirectory(d, N, { chunkBytes: 37 });
      const big = scanDirectory(d, N);
      const bad = [];
      for (const c of cases) {
        for (const [tag, r] of [['chunk37', small], ['default', big]]) {
          const rows = r.hitsBySecret.filter((h) => h.path === c.rel);
          const encOk = c.label === 'hex-lower' ? rows[0] && rows[0].encoding === 'hex-lower' : rows[0] && /^base64/.test(rows[0].encoding);
          if (!(rows.length === 1 && rows[0].secret === c.g.secret && rows[0].count === 1 && encOk)) bad.push(`${c.rel}@${tag}`);
        }
      }
      return { ok: bad.length === 0 && vacuousWrap === 0 && cases.length === 18, detail: `files=${cases.length} wrap-was-vacuous=${vacuousWrap} failures=${bad.length}${bad.length ? ' ' + bad.slice(0, 3).join(',') : ''}` };
    });

    run('B5 a canary split across a 64 KiB read boundary is found by the real file reader (offsets -1 ... -len+1)', () => {
      const d = mkTmp(created);
      const c = groupsN.canary.B;
      const offs = [1, 2, Math.floor(c.length / 2), c.length - 1];
      const rels = offs.map((o) => {
        const rel = `boundary/split-${o}.bin`;
        writeAt(d, rel, Buffer.concat([kit.noise(DEFAULT_CHUNK_BYTES - o), c, kit.noise(777)]));
        return rel;
      });
      const r = scanDirectory(d, N);
      const bad = rels.filter((rel) => { const rows = r.hitsBySecret.filter((h) => h.path === rel); return !(rows.length === 1 && rows[0].encoding === 'raw' && rows[0].count === 1); });
      return { ok: bad.length === 0 && r.filesScanned === rels.length, detail: `files=${rels.length} missed=${bad.length} chunk=${DEFAULT_CHUNK_BYTES}` };
    });

    run('B5b a secret straddling a read boundary is found when the NEXT read is also full-size (the carry must be a copy, not a view of the reused read buffer)', () => {
      const d = mkTmp(created);
      const CH = DEFAULT_CHUNK_BYTES;
      const fill = (n) => Buffer.alloc(n, 0x7e); // no whitespace, no needle byte: keeps the whitespace-stripped lane on its no-copy path too
      const cores = {
        'canary raw': groupsN.canary.B,
        'key base64 (text lane)': Buffer.from(Buffer.concat([kit.rb(3), groupsN.key.B, kit.rb(3)]).toString('base64'), 'latin1'),
        'key hex (text lane)': Buffer.from(groupsN.key.B.toString('hex'), 'latin1'),
      };
      const want = { 'canary raw': 'canary', 'key base64 (text lane)': 'key', 'key hex (text lane)': 'key' };
      const planted = [];
      for (const [name, core] of Object.entries(cores)) {
        for (const o of [1, Math.floor(core.length / 2), core.length - 1]) {
          const rel = `b5b/${name.replace(/\W+/g, '-')}-${o}.bin`;
          writeAt(d, rel, Buffer.concat([fill(CH - o), core, fill(2 * CH + 7)]));
          planted.push({ rel, name, o });
        }
      }
      const r = scanDirectory(d, N);
      const bad = planted.filter((p) => { const rows = r.hitsBySecret.filter((h) => h.path === p.rel); return !(rows.length === 1 && rows[0].secret === want[p.name] && rows[0].count === 1); });
      return { ok: bad.length === 0 && r.filesScanned === planted.length, detail: `files=${planted.length} missed=${bad.length}${bad.length ? ' ' + bad.slice(0, 3).map((p) => `${p.name}@${p.o}`).join(',') : ''} next-read-bytes=${CH}` };
    });

    run('B6 every possible split point is found for raw, utf16le, hex, wrapped-free base64 and byte-array (chunk 64)', () => {
      const P = 64;
      const BASE = P * 4; // boundary at 256, comfortably past the longest core (JSON-ed Buffer ~ 150 bytes)
      const forms = {
        raw: groupsN.canary.B,
        utf16le: Buffer.from(groupsN.canary.S, 'utf16le'),
        hex: Buffer.from(groupsN.key.B.toString('hex'), 'latin1'),
        b64: Buffer.from(Buffer.concat([kit.rb(3), groupsN.key.B, kit.rb(2)]).toString('base64'), 'latin1'),
        bytes: Buffer.from(JSON.stringify(Buffer.concat([kit.rb(2), groupsN.key.B, kit.rb(2)])), 'utf8'),
      };
      let tried = 0;
      let missed = 0;
      for (const core of Object.values(forms)) {
        for (let c = 1; c < core.length; c++) {
          const buf = Buffer.concat([kit.noise(BASE - c), core, kit.noise(70)]);
          const r = scanBuffer(buf, N, { chunkBytes: P });
          tried += 1;
          if (r.hitsBySecret.length !== 1 || r.hitsBySecret[0].count !== 1) missed += 1;
        }
      }
      return { ok: missed === 0 && tried > 200, detail: `splits=${tried} missed=${missed}` };
    });

    run('B7 counts are exact and independent of chunk size (3 copies incl. one on a boundary; chunk 1, 7, 64, 4096, 65536)', () => {
      const c = groupsN.canary.B;
      const buf = Buffer.concat([kit.noise(10), c, kit.noise(100), c, kit.noise(61), c, kit.noise(9)]);
      const seen = [1, 7, 64, 4096, 65536].map((cb) => scanBuffer(buf, N, { chunkBytes: cb }).hitsBySecret.map((h) => `${h.secret}:${h.encoding}:${h.count}`).join('|'));
      const same = seen.every((s) => s === seen[0]);
      return { ok: same && seen[0] === 'canary:raw:3', detail: `rows=${seen[0]} identical-across-chunk-sizes=${same}` };
    });

    run('B8 a secret in a file or directory NAME is detected and its name is redacted in every output path', () => {
      const d = mkTmp(created);
      const nm = groupsN.canary.S;
      writeAt(d, `${nm}.txt`, kit.noise(64));
      writeAt(d, `${nm}-dir/inner.bin`, Buffer.concat([kit.noise(8), groupsN.canary.B, kit.noise(8)]));
      writeAt(d, 'fine/ok.bin', kit.noise(64));
      const r = scanDirectory(d, N);
      const json = JSON.stringify(r);
      const redacted = r.nameHits.length >= 2 && r.nameHits.every((h) => h.path.includes('<name-redacted:'));
      const inner = r.hits.find((h) => h.path.endsWith('/inner.bin'));
      return { ok: r.verdict === 'HITS' && redacted && inner && inner.path.startsWith('<name-redacted:') && !json.includes(nm) && !leaksIn(json), detail: `nameHits=${r.nameHits.length} content-hit-path-redacted=${Boolean(inner && inner.path.startsWith('<name-redacted:'))} secret-in-result=${json.includes(nm)}` };
    });

    run('B9 scanText finds a canary in log lines (plain, JSON-logged, base64, URL) and refuses empty text as VACUOUS', () => {
      const S = groupsN.canary.S;
      const lines = {
        plain: `2026-01-01T00:00:00Z info upload accepted token=${S} bytes=1`,
        json: `{"level":"info","msg":"x","tok":${JSON.stringify(S)}}`,
        b64: `auth ${Buffer.from(S, 'utf8').toString('base64')} end`,
        url: `GET /x?t=${encodeURIComponent(S)} 200`,
        key: `dk=${groupsN.key.B.toString('hex')}`,
      };
      const out = Object.fromEntries(Object.entries(lines).map(([k, v]) => [k, scanText(v, N)]));
      const ok = Object.values(out).every((r) => r.verdict === 'HITS') && out.json.hitsBySecret.some((h) => h.encoding === 'json-escaped') && out.url.hitsBySecret.some((h) => h.encoding === 'urlencoded');
      const empty = scanText('', N);
      const clean = scanText('2026-01-01 info nothing to see here', N);
      return { ok: ok && empty.verdict === 'VACUOUS' && clean.verdict === 'CLEAN' && !JSON.stringify(out).includes(S), detail: `lines=${Object.keys(lines).length} empty=${empty.verdict} clean=${clean.verdict}` };
    });

    run('B10 UTF-16LE and UTF-16BE both report for one occurrence of a Latin-1 secret when the adjacent byte is NUL (documented, truthful overlap)', () => {
      // Every code unit of a Latin-1 text is < 256, so its BE bytes are its LE bytes shifted by one: a NUL right before
      // the LE form makes the BE pattern genuinely present. (A secret with CJK/emoji has no such overlap.)
      const le = Buffer.from(groupsN.key.S, 'utf16le');
      const names = (buf) => scanBuffer(buf, N).hitsBySecret.filter((h) => h.secret === 'key').map((h) => h.encoding).join();
      const plain = names(Buffer.concat([Buffer.from([1, 2, 3]), le, Buffer.from([4, 5, 6])]));
      const nulBefore = names(Buffer.concat([Buffer.from([1, 2, 0]), le, Buffer.from([4, 5, 6])]));
      const cjk = scanBuffer(Buffer.concat([Buffer.from([1, 2, 0]), Buffer.from(groupsN.canary.S, 'utf16le'), Buffer.from([4, 5, 6])]), N).hitsBySecret.map((h) => h.encoding).join();
      return { ok: plain === 'utf16le' && nulBefore === 'utf16le,utf16be' && cjk === 'utf16le', detail: `clean-neighbours=${plain} nul-neighbour=${nulBefore} non-latin1-secret-with-nul=${cjk}` };
    });

    run('B11 a canary containing "/" is found in its JSON "\\/" form and its %2F URL form (the PHP / form-encoder shapes)', () => {
      const c = `WSI/slash/${crypto.randomBytes(9).toString('hex')}/end`;
      const Ns = makeNeedles({ canary: c, originalBytes, keyBytes }, UQ);
      const json = scanText(`{"p":"${c.replace(/\//g, '\\/')}"}`, Ns);
      const url = scanText(`GET /?c=${encodeURIComponent(c)}`, Ns);
      const plain = scanText(`x ${c} y`, Ns);
      const row = (r) => r.hitsBySecret.map((h) => `${h.secret}:${h.encoding}`).join('|');
      return { ok: row(json) === 'canary:json-escaped' && row(url) === 'canary:urlencoded' && row(plain) === 'canary:raw', detail: `json=${row(json)} url=${row(url)} plain=${row(plain)}` };
    });

    run('B12 a whole copy of the original reports as ONE copy (not once per probe window), two copies as two, a lone fragment still reports', () => {
      const rowsOf2 = (r) => r.hitsBySecret.map((h) => `${h.secret}:${h.encoding}:${h.count}`).join('|');
      const one = scanBuffer(Buffer.concat([kit.noise(10), originalBytes, kit.noise(10)]), N);
      const two = scanBuffer(Buffer.concat([originalBytes, kit.noise(10), originalBytes]), N);
      const frag = scanBuffer(Buffer.concat([kit.noise(5), groupsN.original[1].B, kit.noise(5)]), N);
      const b64 = scanBuffer(Buffer.from(originalBytes.toString('base64'), 'latin1'), N);
      return {
        ok: rowsOf2(one) === 'original:raw:1' && rowsOf2(two) === 'original:raw:2' && rowsOf2(frag) === 'original:raw:1' && /^original:base64(url)?:1$/.test(rowsOf2(b64)) && groupsN.original.length >= 3,
        detail: `probes=${groupsN.original.length} whole=${rowsOf2(one)} twice=${rowsOf2(two)} fragment=${rowsOf2(frag)} base64-whole=${rowsOf2(b64)}`,
      };
    });

    run('B13 overlapping variants of one occurrence count once; adjacent copies count separately (single leading "/" is the case that overlaps)', () => {
      const hexs = crypto.randomBytes(8).toString('hex');
      // The overlap needs three things: a single leading '/', no other '/', and a character JSON must escape (here '"'), so
      // that the plain JSON variant differs from the raw pattern and both variants belong to the json-escaped label.
      // Then the plain variant is a suffix of the '\/'-escaped one. A second '/' inside removes the overlap (control).
      const out = {};
      for (const [name, c] of [['single-lead-slash', `/${hexs}"q"`], ['multi-slash-control', `/lead/${hexs}"q"`]]) {
        const Nx = makeNeedles({ canary: c, originalBytes, keyBytes }, UQ);
        const fmt = (r) => r.hitsBySecret.map((h) => `${h.encoding}:${h.count}`).join('|');
        const escapedText = `{"p":${JSON.stringify(c).replace(/\//g, '\\/')}}`; // real JSON, '/' escaped the PHP way
        const esc = scanText(escapedText, Nx);
        const plainMatchesInsideEscaped = Buffer.from(escapedText).includes(Buffer.from(JSON.stringify(c).slice(1, -1)));
        out[name] = { esc: fmt(esc), twice: fmt(scanText(`${c}${c}`, Nx)), spaced: fmt(scanText(`${c} ${c}`, Nx)), overlapPresent: plainMatchesInsideEscaped };
      }
      const a = out['single-lead-slash'];
      const b = out['multi-slash-control'];
      return {
        ok: a.overlapPresent === true && b.overlapPresent === false && a.esc === 'json-escaped:1' && b.esc === 'json-escaped:1'
          && a.twice === 'raw:2' && a.spaced === 'raw:2' && b.twice === 'raw:2' && b.spaced === 'raw:2',
        detail: `overlap-shape(escaped/adjacent/spaced)=${a.esc}/${a.twice}/${a.spaced} overlap-actually-present=${a.overlapPresent} control=${b.esc}/${b.twice}/${b.spaced} control-overlap=${b.overlapPresent}`,
      };
    });

    /* ---------------------------------------------------------------- C. negatives */
    const negTree = () => {
      const d = mkTmp(created);
      const c = groupsN.canary.B;
      const k = groupsN.key.B;
      const flip = (b, i) => { const x = Buffer.from(b); x[i] ^= 0x01; return x; };
      writeAt(d, 'neg/noise.bin', kit.noise(4096));
      writeAt(d, 'neg/canary-last-char-changed.bin', Buffer.concat([kit.noise(30), flip(c, c.length - 1), kit.noise(30)]));
      // the byte after the truncated needle must not be the dropped one, or random noise could re-complete it
      const sentinel = Buffer.from([c[c.length - 1] === 0x7e ? 0x7d : 0x7e]);
      writeAt(d, 'neg/canary-truncated.bin', Buffer.concat([kit.noise(30), c.subarray(0, c.length - 1), sentinel, kit.noise(30)]));
      writeAt(d, 'neg/key-one-bit-flipped.bin', Buffer.concat([kit.noise(30), flip(k, 17), kit.noise(30)]));
      writeAt(d, 'neg/key-hex-one-digit-off.txt', Buffer.from(k.toString('hex').replace(/.$/, (ch) => (ch === '0' ? '1' : '0')), 'latin1'));
      writeAt(d, 'neg/b64-too-short.txt', Buffer.from(k.subarray(0, 10).toString('base64'), 'latin1'));
      writeAt(d, 'neg/prose.txt', Buffer.from('A fictional paragraph about the Brindlecote guild; it mentions WSICANARY as a bare word and nothing else.', 'utf8'));
      writeAt(d, 'neg/nested/deeper/empty-but-for-newline.txt', Buffer.from('\n'));
      return d;
    };

    run('C1 near-miss negatives are CLEAN and the scan is not vacuous (files and bytes were really read)', () => {
      const d = negTree();
      const r = scanDirectory(d, N);
      return { ok: r.verdict === 'CLEAN' && r.vacuous === false && r.filesScanned === 8 && r.bytesScanned > 4000 && r.hits.length === 0 && r.nameHits.length === 0, detail: `verdict=${r.verdict} files=${r.filesScanned} bytes=${r.bytesScanned} hits=${r.hits.length}` };
    });

    run('C2 lethality of C1: planting ONE positive into the same negative tree flips CLEAN to HITS', () => {
      const d = negTree();
      const before = scanDirectory(d, N).verdict;
      writeAt(d, 'neg/nested/deeper/planted.bin', Buffer.concat([kit.noise(5), groupsN.key.B, kit.noise(5)]));
      const after = scanDirectory(d, N);
      return { ok: before === 'CLEAN' && after.verdict === 'HITS' && after.hits.length === 1 && after.hits[0].path === 'neg/nested/deeper/planted.bin', detail: `before=${before} after=${after.verdict} hit-path-ok=${after.hits.length === 1 && after.hits[0].path === 'neg/nested/deeper/planted.bin'}` };
    });

    /* ---------------------------------------------------------------- D. vacuity */
    run('D1 an empty directory is VACUOUS (no-files), never CLEAN', () => {
      const r = scanDirectory(mkTmp(created), N);
      return { ok: r.verdict === 'VACUOUS' && r.vacuous === true && r.vacuousReason === 'no-files' && r.filesScanned === 0, detail: `verdict=${r.verdict} reason=${r.vacuousReason}` };
    });

    run('D2 a directory of only zero-length files is VACUOUS (no-bytes)', () => {
      const d = mkTmp(created);
      writeAt(d, 'a.bin', Buffer.alloc(0));
      writeAt(d, 'sub/b.bin', Buffer.alloc(0));
      const r = scanDirectory(d, N);
      return { ok: r.verdict === 'VACUOUS' && r.vacuousReason === 'no-bytes' && r.filesScanned === 2 && r.bytesScanned === 0, detail: `verdict=${r.verdict} reason=${r.vacuousReason} files=${r.filesScanned}` };
    });

    run('D3 a directory of only oversize files is VACUOUS; one clean + one oversize is VACUOUS (incomplete-coverage), never CLEAN', () => {
      const only = mkTmp(created);
      writeAt(only, 'big1.bin', kit.noise(5000));
      writeAt(only, 'nest/big2.bin', kit.noise(5000));
      const a = scanDirectory(only, N, { maxFileBytes: 1024 });
      const mixed = mkTmp(created);
      writeAt(mixed, 'small.bin', kit.noise(500));
      writeAt(mixed, 'big.bin', kit.noise(5000));
      const b = scanDirectory(mixed, N, { maxFileBytes: 1024 });
      const c = scanDirectory(mixed, N, { maxFileBytes: 1024 * 1024 });
      return {
        ok: a.verdict === 'VACUOUS' && a.vacuousReason === 'no-files' && a.skipped.length === 2 && a.skipped.every((s) => s.reason === 'oversize')
          && b.verdict === 'VACUOUS' && b.vacuousReason === 'incomplete-coverage' && b.complete === false && c.verdict === 'CLEAN',
        detail: `only-oversize=${a.verdict}/${a.vacuousReason} mixed=${b.verdict}/${b.vacuousReason} same-tree-with-room=${c.verdict}`,
      };
    });

    const symlinkOk = (() => {
      const d = mkTmp(created);
      try { fs.symlinkSync('.', path.join(d, 'probe')); return true; } catch { return false; }
    })();
    const mkLink = (target, link) => { try { fs.symlinkSync(target, link); return true; } catch { return false; } };

    if (symlinkOk) {
      run('D4 a directory of only symlinks is VACUOUS when not following; a clean file + a symlink is incomplete; following scans the target', () => {
        const outside = mkTmp(created);
        const targetFile = writeAt(outside, 'target.bin', Buffer.concat([kit.noise(40), groupsN.key.B, kit.noise(40)]));
        const d = mkTmp(created);
        mkLink(targetFile, path.join(d, 'link-to-file'));
        mkLink(outside, path.join(d, 'link-to-dir'));
        const a = scanDirectory(d, N);
        writeAt(d, 'clean.bin', kit.noise(300));
        const b = scanDirectory(d, N);
        const c = scanDirectory(d, N, { followSymlinks: true });
        return {
          ok: a.verdict === 'VACUOUS' && a.vacuousReason === 'no-files' && a.skipped.length === 2 && a.skipped.every((s) => s.reason === 'symlink')
            && b.verdict === 'VACUOUS' && b.vacuousReason === 'incomplete-coverage'
            && c.verdict === 'HITS' && c.hits.length === 2,
          detail: `only-links=${a.verdict}/${a.vacuousReason} clean+link=${b.verdict}/${b.vacuousReason} follow=${c.verdict} hits=${c.hits.length}`,
        };
      });

      run('D5 a dangling symlink is reported as skipped (never read, never clean) when following', () => {
        const d = mkTmp(created);
        writeAt(d, 'clean.bin', kit.noise(300));
        mkLink(path.join(d, 'does-not-exist'), path.join(d, 'dangling'));
        const r = scanDirectory(d, N, { followSymlinks: true });
        return { ok: r.verdict === 'VACUOUS' && r.skipped.some((s) => s.reason === 'dangling-symlink'), detail: `verdict=${r.verdict} reasons=${r.skipped.map((s) => s.reason).join(',')}` };
      });

      run('D6 a symlink loop terminates promptly, with and without following (ms bound), and is reported', () => {
        const d = mkTmp(created);
        writeAt(d, 'a/clean.bin', kit.noise(300));
        mkLink('.', path.join(d, 'loop1'));
        mkLink('.', path.join(d, 'loop2'));
        mkLink('..', path.join(d, 'a', 'up'));
        const t0 = Date.now();
        const off = scanDirectory(d, N);
        const on = scanDirectory(d, N, { followSymlinks: true });
        const ms = Date.now() - t0;
        return {
          ok: ms < 5000 && off.skipped.filter((s) => s.reason === 'symlink').length === 3 && on.skipped.some((s) => s.reason === 'symlink-loop') && on.filesScanned === 1 && on.verdict === 'CLEAN',
          detail: `elapsed=${ms}ms not-following=${off.verdict} following=${on.verdict} loops-reported=${on.skipped.filter((s) => s.reason === 'symlink-loop').length}`,
        };
      });
    } else {
      unverified.push('symlink tests D4-D6 and KW-12: this platform/user cannot create symlinks');
    }

    const mkfifo = spawnSync('mkfifo', ['--help'], { encoding: 'utf8' });
    if (mkfifo.status === 0 || (mkfifo.stdout || '').length > 0 || (mkfifo.stderr || '').includes('mkfifo')) {
      run('D7 a FIFO in the tree is reported as special and never opened (no hang), so the scan is incomplete', () => {
        const d = mkTmp(created);
        writeAt(d, 'clean.bin', kit.noise(300));
        const mk = spawnSync('mkfifo', [path.join(d, 'pipe')]);
        if (mk.status !== 0) return { ok: false, detail: 'mkfifo failed after --help succeeded' };
        const t0 = Date.now();
        const r = scanDirectory(d, N);
        const ms = Date.now() - t0;
        return { ok: ms < 5000 && r.skipped.some((s) => s.reason === 'special') && r.verdict === 'VACUOUS' && r.vacuousReason === 'incomplete-coverage', detail: `elapsed=${ms}ms verdict=${r.verdict} reasons=${r.skipped.map((s) => s.reason).join(',')}` };
      });
    } else {
      unverified.push('FIFO test D7: mkfifo not available');
    }

    run('D8 the entry budget stops a runaway tree and marks coverage incomplete (files WERE scanned, so VACUOUS must come from the budget, not from "no files")', () => {
      const d = mkTmp(created);
      for (let i = 0; i < 40; i++) writeAt(d, `many/f${String(i).padStart(2, '0')}.bin`, kit.noise(64));
      const a = scanDirectory(d, N, { maxEntries: 10 });
      const roomy = scanDirectory(d, N);
      return {
        ok: a.skipped.some((s) => s.reason === 'entry-budget') && a.filesScanned > 0 && a.verdict === 'VACUOUS' && a.vacuousReason === 'incomplete-coverage' && a.complete === false && roomy.verdict === 'CLEAN',
        detail: `budget=${a.verdict}/${a.vacuousReason} files-read=${a.filesScanned} same-tree-with-room=${roomy.verdict}`,
      };
    });

    run('D8b a directory below the depth cap is skipped as too-deep and the scan is incomplete although a shallow file WAS read; with room the leak under it is found', () => {
      const deep = mkTmp(created);
      writeAt(deep, 'shallow-clean.bin', kit.noise(64));
      writeAt(deep, 'l1/l2/l3/l4/leak.bin', Buffer.concat([kit.noise(8), groupsN.key.B, kit.noise(8)]));
      const capped = scanDirectory(deep, N, { maxDepth: 3 });
      const roomy = scanDirectory(deep, N, { maxDepth: 10 });
      return {
        ok: capped.filesScanned === 1 && capped.skipped.some((s) => s.reason === 'too-deep') && capped.verdict === 'VACUOUS' && capped.vacuousReason === 'incomplete-coverage' && capped.complete === false && roomy.verdict === 'HITS',
        detail: `capped=${capped.verdict}/${capped.vacuousReason} files-read=${capped.filesScanned} skipped=${capped.skipped.map((s) => s.reason).join(',')} with-room=${roomy.verdict}`,
      };
    });

    // An unreadable file or directory must make the scan incomplete. As root EACCES cannot be provoked, but the branch it takes
    // (the open or readdir or lstat call throws) can: readdir lists a name with non-UTF-8 bytes lossily, and the lossy path does not exist.
    const isRoot = Boolean(process.getuid && process.getuid() === 0);
    const unreadableFixture = (kind) => {
      const d = mkTmp(created);
      writeAt(d, 'clean.bin', kit.noise(300));
      const leak = Buffer.concat([kit.noise(5), groupsN.key.B, kit.noise(5)]);
      const at = (...parts) => Buffer.concat([Buffer.from(d + path.sep), ...parts]);
      const badName = Buffer.from([0xff, 0xfe, kind === 'file' ? 0x41 : 0x42]);
      try {
        if (kind === 'file') fs.writeFileSync(at(badName), leak);
        else { fs.mkdirSync(at(badName)); fs.writeFileSync(at(badName, Buffer.from('/leak.bin')), leak); }
        return { dir: d, how: 'a name readdir lists lossily and open/lstat cannot resolve' };
      } catch { /* this filesystem refuses non-UTF-8 names */ }
      if (!isRoot) {
        if (kind === 'file') { const f = writeAt(d, 'noperm.bin', leak); fs.chmodSync(f, 0); restoreModes.push(f); }
        else { const sub = path.join(d, 'noperm-dir'); writeAt(sub, 'leak.bin', leak); fs.chmodSync(sub, 0); restoreModes.push(sub); }
        return { dir: d, how: 'chmod 000 (EACCES)' };
      }
      return { dir: d, how: null };
    };
    for (const kind of ['file', 'dir']) {
      const fx = unreadableFixture(kind);
      if (fx.how === null) { unverified.push(`D11 (unreadable ${kind}): this filesystem refuses non-UTF-8 names and the user is root, so no unreadable ${kind} could be made`); continue; }
      run(`D11${kind === 'file' ? 'a' : 'b'} an unreadable ${kind} (${fx.how}) makes the scan incomplete with reason '${kind === 'file' ? 'unreadable' : 'unreadable-dir'}', never CLEAN; the same tree without it is CLEAN`, () => {
        const want = kind === 'file' ? 'unreadable' : 'unreadable-dir';
        const r = scanDirectory(fx.dir, N);
        const clean = mkTmp(created);
        writeAt(clean, 'clean.bin', kit.noise(300));
        const control = scanDirectory(clean, N);
        return {
          ok: r.verdict === 'VACUOUS' && r.vacuousReason === 'incomplete-coverage' && r.complete === false && r.skipped.some((x) => x.reason === want) && r.filesScanned >= 1 && control.verdict === 'CLEAN',
          detail: `verdict=${r.verdict}/${r.vacuousReason} complete=${r.complete} reasons=${r.skipped.map((x) => x.reason).join(',')} files-read=${r.filesScanned} control-without-it=${control.verdict}`,
        };
      });
    }

    run('D9 a missing directory or a file path throws (never CLEAN, never VACUOUS-by-shrug); empty buffer and empty text are VACUOUS', () => {
      const d = mkTmp(created);
      const f = writeAt(d, 'file.bin', kit.noise(10));
      const t1 = throwsKind(() => scanDirectory(path.join(d, 'nope'), N));
      const t2 = throwsKind(() => scanDirectory(f, N), TypeError);
      const t3 = throwsKind(() => scanForMagic(path.join(d, 'nope')));
      const eb = scanBuffer(Buffer.alloc(0), N);
      return { ok: t1 && t2 && t3 && eb.verdict === 'VACUOUS' && eb.vacuousReason === 'no-bytes', detail: `missing-dir-throws=${t1} file-path-throws=${t2} magic-missing-throws=${t3} empty-buffer=${eb.verdict}` };
    });

    run('D10 hits are never masked by skipped files: HITS plus a skipped oversize file stays HITS and reports the skip', () => {
      const d = mkTmp(created);
      writeAt(d, 'planted.bin', Buffer.concat([kit.noise(4), groupsN.key.B, kit.noise(4)]));
      writeAt(d, 'big.bin', kit.noise(5000));
      const r = scanDirectory(d, N, { maxFileBytes: 1024 });
      return { ok: r.verdict === 'HITS' && r.complete === false && r.skipped.length === 1, detail: `verdict=${r.verdict} complete=${r.complete} skipped=${r.skipped.length}` };
    });

    /* ---------------------------------------------------------------- E. arming */
    run('E1 assertArmed accepts the full set and returns a content-free round-trip proof', () => {
      const p = assertArmed(N);
      const p2 = assertArmed(Nt);
      return { ok: p.ok && p.proof === 'round-trip' && p.secrets.join(',') === 'canary,original,key' && p2.proof === 'round-trip' && !leaksIn(JSON.stringify(p)), detail: `proof=${p.proof} groups=${p.groups} patterns=${p.patterns} aliases=${p.aliases}` };
    });

    run('E2 assertArmed THROWS for a utf8-only set (required encodings absent) and the scanners refuse to run with it', () => {
      const weak = makeNeedles({ canary: canaryTypical, originalBytes, keyBytes }, { ...UQ, encodings: ['utf8'] });
      const direct = throwsKind(() => assertArmed(weak), ArmingError);
      const viaDir = throwsKind(() => scanDirectory(mkTmp(created), weak), ArmingError);
      const viaBuf = throwsKind(() => scanBuffer(Buffer.from('x'.repeat(40)), weak), ArmingError);
      let msg = '';
      try { assertArmed(weak); } catch (e) { msg = e.message; }
      return { ok: direct && viaDir && viaBuf && /missing encoding 'raw'|missing encoding 'base64'/.test(msg) && !leaksIn(msg), detail: `direct=${direct} scanDirectory=${viaDir} scanBuffer=${viaBuf} message-names-missing=${/missing encoding/.test(msg)}` };
    });

    run('E3 assertArmed throws for an empty set, a zero-length pattern, a too-short pattern, a degenerate pattern, and a missing base64 alignment', () => {
      const e = (o) => ({ secret: 'canary', encoding: 'raw', pattern: Buffer.from('abcdefghijkl'), ...o });
      const full = (list) => _unsafeNeedleSetFromEntries(list);
      const allLabels = (pattern, secret = 'canary') => REQUIRED_ENCODINGS.flatMap((enc) => (enc === 'base64' || enc === 'base64url'
        ? [0, 1, 2].map((k) => ({ secret, encoding: enc, align: k, pattern: Buffer.from(`${enc}-${k}-xxxxxxxxxx`) }))
        : [{ secret, encoding: enc, pattern: Buffer.concat([Buffer.from(enc + '-'), pattern]) }]));
      const cases = {
        empty: () => assertArmed(full([]), { requireSecrets: [] }),
        'zero-length': () => assertArmed(full([...allLabels(Buffer.from('abcdefghij')), e({ encoding: 'raw', pattern: Buffer.alloc(0), variant: 9 })]), { requireSecrets: ['canary'] }),
        'too-short': () => assertArmed(full([...allLabels(Buffer.from('abcdefghij')).slice(1), e({ encoding: 'raw', pattern: Buffer.from('abc') })]), { requireSecrets: ['canary'] }),
        degenerate: () => assertArmed(full([...allLabels(Buffer.from('abcdefghij')), e({ encoding: 'raw', pattern: Buffer.alloc(16, 65), variant: 9 })]), { requireSecrets: ['canary'] }),
        'missing-alignment': () => assertArmed(full(allLabels(Buffer.from('abcdefghij')).filter((x) => !(x.encoding === 'base64' && x.align === 2))), { requireSecrets: ['canary'] }),
      };
      const control = (() => { try { return assertArmed(full(allLabels(Buffer.from('abcdefghij'))), { requireSecrets: ['canary'] }).ok === true; } catch { return false; } })();
      const survived = Object.entries(cases).filter(([, fn]) => !throwsKind(fn, ArmingError)).map(([k]) => k);
      return { ok: survived.length === 0 && control, detail: `bad-sets=${Object.keys(cases).length} accepted-wrongly=${survived.join(',') || 'none'} well-formed-control-accepted=${control}` };
    });

    run('E4 assertArmed requires all three secrets by default; a partial set passes only with an explicit requireSecrets', () => {
      const partial = makeNeedles({ canary: canaryTypical }, { partial: true });
      const strict = throwsKind(() => assertArmed(partial), ArmingError);
      const scoped = (() => { try { return assertArmed(partial, { requireSecrets: ['canary'] }).ok; } catch { return false; } })();
      const scanner = (() => { try { return scanText(`x ${canaryTypical} y`, partial).verdict === 'HITS'; } catch { return false; } })();
      return { ok: strict && scoped && scanner, detail: `default-refuses-partial=${strict} scoped-accepts=${scoped} scanner-uses-set-secrets=${scanner}` };
    });

    run('E5 assertArmed refuses anything that is not a needle set built here (plain objects, arrays of buffers)', () => {
      const fakes = [{}, { patterns: [Buffer.from('abcdefghijkl')] }, [Buffer.from('abcdefghijkl')], null, 'abcdefghijkl'];
      const survived = fakes.filter((f) => !throwsKind(() => assertArmed(f), ArmingError)).length;
      return { ok: survived === 0, detail: `fakes=${fakes.length} accepted-wrongly=${survived}` };
    });

    run('E6 the arming round-trip proof is lethal: a set whose alignment-2 base64 pattern is corrupted is refused', () => {
      const I = _internals(N);
      const forged = I.entries.map((e) => ((e.secret === 'key' && e.encoding === 'base64' && e.align === 2 && e.status === 'ok')
        ? { ...e, pattern: Buffer.concat([e.pattern.subarray(0, e.pattern.length - 4), Buffer.from('ZZZZ')]) } : { ...e }));
      const bad = makeSet(forged, I.groups.slice());
      const refused = throwsKind(() => assertArmed(bad), ArmingError);
      let msg = '';
      try { assertArmed(bad); } catch (x) { msg = x.message; }
      return { ok: refused && /round-trip/.test(msg), detail: `refused=${refused} message-says-round-trip=${/round-trip/.test(msg)}` };
    });

    /* ---------------------------------------------------------------- F. content-free */
    const richDir = mkTmp(created);
    plantAll(N, G, richDir, 'rich');
    writeAt(richDir, `${groupsN.canary.S}.txt`, kit.noise(30));
    writeAt(richDir, 'skipme/big.bin', kit.noise(5000));
    const rich = scanDirectory(richDir, N, { maxFileBytes: 4096 });
    const richText = scanText(`log ${groupsN.canary.S} ${groupsN.key.B.toString('hex')}`, N);
    const richBuf = scanBuffer(Buffer.concat([kit.noise(5), groupsN.key.B]), N);

    run('F1 no result contains needle bytes or any 10-character fragment of any secret form', () => {
      const dump = JSON.stringify([rich, richText, richBuf]) + util.inspect([rich, richText, richBuf], { depth: 8, maxArrayLength: null });
      return { ok: !leaksIn(dump) && rich.hits.length > 100, detail: `result-chars=${dump.length} hit-rows=${rich.hits.length}` };
    });

    run('F2 structural proof: hit rows have exactly the permitted keys and value types; skipped rows carry only path + reason', () => {
      const okRow = (h, keys) => sameKeys(h, keys) && typeof h.path === 'string' && Number.isInteger(h.count) && h.count > 0 && LABEL_INDEX.has(h.encoding);
      const hitsOk = rich.hits.every((h) => okRow(h, HIT_KEYS)) && rich.nameHits.every((h) => okRow(h, HIT_KEYS));
      const secOk = rich.hitsBySecret.every((h) => okRow(h, SECRET_HIT_KEYS) && SECRET_INDEX.has(h.secret));
      const skipOk = rich.skipped.every((s) => sameKeys(s, ['path', 'reason']) && INCOMPLETE_REASONS.has(s.reason) || s.reason === 'symlink-loop');
      const topKeys = JSON.stringify(Object.keys(rich).sort());
      const wantTop = JSON.stringify(['bytesScanned', 'complete', 'dirsVisited', 'filesScanned', 'hits', 'hitsBySecret', 'nameHits', 'skipped', 'vacuous', 'vacuousReason', 'verdict']);
      const textKeys = Object.keys(richText).sort().join(',');
      return { ok: hitsOk && secOk && skipOk && topKeys === wantTop && textKeys === 'bytesScanned,chars,hits,hitsBySecret,vacuous,vacuousReason,verdict', detail: `hits-rows-ok=${hitsOk} by-secret-ok=${secOk} skipped-ok=${skipOk} top-level-keys-exact=${topKeys === wantTop}` };
    });

    run('F3 error messages are content-free too (ArmingError and TypeError text never carries a secret)', () => {
      const msgs = [];
      for (const fn of [
        () => assertArmed(makeNeedles({ canary: canaryTypical, originalBytes, keyBytes }, { ...UQ, encodings: ['utf8'] })),
        () => makeNeedles({ canary: canaryTypical, originalBytes, keyBytes: Buffer.alloc(32, 9) }, UQ),
        () => makeNeedles({ canary: canarySpecial.slice(0, 5), originalBytes, keyBytes }, UQ),
        () => scanBuffer('not a buffer', N),
      ]) { try { fn(); } catch (e) { msgs.push(e.message); } }
      return { ok: msgs.length === 4 && !leaksIn(msgs.join('\n')) && !msgs.join('\n').includes(canarySpecial.slice(0, 5)), detail: `messages=${msgs.length}` };
    });

    /* ---------------------------------------------------------------- G. magic */
    const pdfHead = Buffer.from('%PDF-1.7\n');
    const zipHead = kit.zipHeader();
    const cipherNoSig = (n) => {
      for (;;) {
        const b = crypto.randomBytes(n);
        if (!b.includes(Buffer.from('PK')) && !b.includes(Buffer.from('%PDF')) && !b.includes(Buffer.from('{\\rtf')) && !b.includes(MAGIC.CFB.sig.subarray(0, 3))) return b;
      }
    };

    run('G1 scanForMagic finds a plaintext PDF and a ZIP/docx container at the start of a file and when embedded after a header', () => {
      const d = mkTmp(created);
      writeAt(d, 'v/a.pdf', Buffer.concat([pdfHead, cipherNoSig(500)]));
      writeAt(d, 'v/b.docx', Buffer.concat([zipHead, cipherNoSig(500)]));
      writeAt(d, 'v/c-embedded-zip.bin', Buffer.concat([cipherNoSig(3000), zipHead, cipherNoSig(200)]));
      writeAt(d, 'v/d-embedded-pdf.bin', Buffer.concat([cipherNoSig(3000), pdfHead, cipherNoSig(200)]));
      writeAt(d, 'v/e-bare-sig-at-start.bin', Buffer.concat([Buffer.from([0x50, 0x4b, 0x03, 0x04]), cipherNoSig(100)]));
      writeAt(d, 'v/f-clean.bin', cipherNoSig(4000));
      const r = scanForMagic(d);
      const row = (p) => r.hits.filter((h) => h.path === p);
      const ok = row('v/a.pdf').length === 1 && row('v/a.pdf')[0].magic === 'PDF' && row('v/a.pdf')[0].atStart === true
        && row('v/b.docx')[0].magic === 'ZIP' && row('v/b.docx')[0].atStart === true
        && row('v/c-embedded-zip.bin')[0].atStart === false && row('v/d-embedded-pdf.bin')[0].magic === 'PDF' && row('v/d-embedded-pdf.bin')[0].atStart === false
        && row('v/e-bare-sig-at-start.bin').length === 1 && row('v/f-clean.bin').length === 0;
      return { ok: ok && r.verdict === 'HITS' && r.filesScanned === 6, detail: `files=${r.filesScanned} hit-rows=${r.hits.length}` };
    });

    run('G2 ciphertext-like data with a bare, structurally implausible signature is CLEAN (false-positive guard), and the scan is not vacuous', () => {
      const d = mkTmp(created);
      const junk = Buffer.from([0x50, 0x4b, 0x03, 0x04, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff]);
      writeAt(d, 'v/cipher1.bin', Buffer.concat([cipherNoSig(3000), junk, cipherNoSig(900)]));
      writeAt(d, 'v/cipher2.bin', Buffer.concat([cipherNoSig(3000), Buffer.from('%PDF-xyz'), cipherNoSig(900)]));
      writeAt(d, 'v/cipher3.bin', Buffer.concat([cipherNoSig(2000), Buffer.from('PK'), cipherNoSig(900), Buffer.from('%PDF'), cipherNoSig(50)]));
      writeAt(d, 'v/cipher4.bin', cipherNoSig(70000));
      const r = scanForMagic(d);
      return { ok: r.verdict === 'CLEAN' && r.filesScanned === 4 && r.bytesScanned > 70000 && r.hits.length === 0, detail: `verdict=${r.verdict} files=${r.filesScanned} bytes=${r.bytesScanned}` };
    });

    run('G3 a container header split across every possible read boundary is found exactly once (chunk 2048, embedded)', () => {
      const P = 2048;
      let tried = 0;
      let bad = 0;
      for (const [name, head] of [['ZIP', zipHead], ['PDF', pdfHead]]) {
        const need = head.length;
        for (let c = 1; c < need + (name === 'ZIP' ? 0 : 0); c++) {
          const d = mkTmp(created);
          writeAt(d, 'x.bin', Buffer.concat([cipherNoSig(P * 2 - c), head, cipherNoSig(60)]));
          const r = scanForMagic(d, { chunkBytes: P });
          tried += 1;
          if (!(r.hits.length === 1 && r.hits[0].magic === name && r.hits[0].count === 1 && r.hits[0].atStart === false)) bad += 1;
        }
      }
      return { ok: bad === 0 && tried >= 15, detail: `splits=${tried} wrong=${bad}` };
    });

    run('G3b a container header split across a read boundary is found when the NEXT read is also full-size (the magic matcher keeps a copy, not a view of the reused buffer)', () => {
      const P = 2048;
      const fill = (n) => Buffer.alloc(n, 0x7e);
      let tried = 0;
      let bad = 0;
      for (const [name, head] of [['ZIP', zipHead], ['PDF', pdfHead]]) {
        for (let c = 1; c < head.length; c++) {
          const d = mkTmp(created);
          writeAt(d, 'x.bin', Buffer.concat([fill(P - c), head, fill(P * 2 + 5)])); // the FIRST boundary: only the first read's carry can be a view of the reused buffer
          const r = scanForMagic(d, { chunkBytes: P });
          tried += 1;
          if (!(r.hits.length === 1 && r.hits[0].magic === name && r.hits[0].count === 1 && r.hits[0].atStart === false)) bad += 1;
        }
      }
      return { ok: bad === 0 && tried >= 15, detail: `splits=${tried} wrong=${bad} next-read-bytes=${P}` };
    });

    run('G4 magic scan vacuity: empty directory VACUOUS, skipped-only VACUOUS, empty pattern list throws, CFB and RTF patterns work when opted in', () => {
      const empty = scanForMagic(mkTmp(created));
      const big = mkTmp(created);
      writeAt(big, 'huge.bin', cipherNoSig(5000));
      const skippedOnly = scanForMagic(big, { maxFileBytes: 1000 });
      const noPatterns = throwsKind(() => scanForMagic(big, { patterns: [] }), TypeError);
      const o = mkTmp(created);
      writeAt(o, 'old.doc', Buffer.concat([MAGIC.CFB.sig, cipherNoSig(200)]));
      writeAt(o, 'x.rtf', Buffer.concat([Buffer.from('{\\rtf1\\ansi '), cipherNoSig(200)]));
      const opted = scanForMagic(o, { patterns: [MAGIC.CFB, MAGIC.RTF] });
      const dflt = scanForMagic(o);
      return {
        ok: empty.verdict === 'VACUOUS' && skippedOnly.verdict === 'VACUOUS' && noPatterns && opted.hits.length === 2 && dflt.verdict === 'CLEAN',
        detail: `empty=${empty.verdict} skipped-only=${skippedOnly.verdict} empty-patterns-throw=${noPatterns} opted-in-hits=${opted.hits.length} default-ignores-cfb/rtf=${dflt.verdict}`,
      };
    });

    run('G5 magic results are content-free: rows are exactly { path, magic, count, atStart }', () => {
      const d = mkTmp(created);
      writeAt(d, 'a.pdf', Buffer.concat([pdfHead, cipherNoSig(100)]));
      const r = scanForMagic(d);
      const dump = JSON.stringify(r);
      return { ok: r.hits.length === 1 && sameKeys(r.hits[0], MAGIC_HIT_KEYS) && !dump.includes('%PDF') && !dump.includes(d), detail: `rows=${r.hits.length} sig-in-result=${dump.includes('%PDF')} abs-path-in-result=${dump.includes(d)}` };
    });

    run('G6 scanForMagic accepts bare signatures (string or Buffer) anywhere, and refuses ones short enough to match ciphertext by chance', () => {
      const d = mkTmp(created);
      writeAt(d, 'a.bin', Buffer.concat([cipherNoSig(300), Buffer.from('%PDF-'), cipherNoSig(300)]));
      writeAt(d, 'b.bin', Buffer.concat([cipherNoSig(300), Buffer.from([0x50, 0x4b, 0x03, 0x04]), cipherNoSig(300)]));
      const r = scanForMagic(d, { patterns: ['%PDF-', Buffer.from([0x50, 0x4b, 0x03, 0x04])] });
      const names = r.hits.map((h) => `${h.path}:${h.magic}`).sort().join('|');
      const refused = [['PK'], [Buffer.from([0x50])], [''], [42], [{ name: 'x', sig: Buffer.from('ab') }]].filter((p) => !throwsKind(() => scanForMagic(d, { patterns: p }), TypeError)).length;
      return { ok: names === 'a.bin:custom-1|b.bin:custom-2' && refused === 0, detail: `custom-hits=${names} short-or-invalid-accepted-wrongly=${refused}` };
    });

    /* ---------------------------------------------------------------- H. performance sanity */
    run('H1 a multi-megabyte file with a secret in its last chunk is scanned in bounded time and found', () => {
      const d = mkTmp(created);
      const big = Buffer.concat([crypto.randomBytes(6 * 1024 * 1024), groupsN.key.B]);
      writeAt(d, 'big.bin', big);
      const t0 = Date.now();
      const r = scanDirectory(d, N);
      const ms = Date.now() - t0;
      return { ok: r.verdict === 'HITS' && r.hits.length === 1 && r.bytesScanned === big.length && ms < 60000, detail: `bytes=${big.length} elapsed=${ms}ms patterns=${desc.patterns}` };
    });

    /* ---------------------------------------------------------------- J. probes of the original must be provably specific to it */
    // Fictional template: every upload carries the same wrapper text and differs only in its canary (and, for the compressed
    // kind, a random payload). This is the shape of this suite's DOCX / PDF / EPUB builders without importing them.
    const tplXml = (n, tag) => Buffer.from(Array.from({ length: n }, (_, i) => `<w:p w:rsidR="${String(i).padStart(6, '0')}"><w:r><w:t>Template line ${i} of the ${tag} wrapper</w:t></w:r></w:p>`).join('\n'), 'utf8');
    const T_HEAD = tplXml(30, 'head');
    const T_TAIL = tplXml(30, 'tail');
    const ZIPISH = Buffer.from([0x50, 0x4b, 0x03, 0x04, 0x14, 0x00, 0x00, 0x00, 0x00, 0x00]);
    const ZIPEND = Buffer.from([0x50, 0x4b, 0x05, 0x06]);
    const newCanary = () => `WSICANARY${crypto.randomBytes(12).toString('hex').toUpperCase()}`;
    const storedDoc = (canary, visible = true) => Buffer.concat([ZIPISH, T_HEAD, visible ? Buffer.from(`<w:t>${canary}</w:t>`) : Buffer.from(canary, 'utf16le'), T_TAIL, ZIPEND]);
    const FLATE_BOILERPLATE = zlib.deflateRawSync(tplXml(240, 'compressed'));
    const flateDoc = (canary) => Buffer.concat([ZIPISH, FLATE_BOILERPLATE, zlib.deflateRawSync(Buffer.concat([crypto.randomBytes(400), Buffer.from(canary, 'utf16le')])), ZIPEND]);
    /** The PRE-REPAIR rule, reproduced only to prove each scenario really is a template: four interior windows, "at least 4 distinct bytes". */
    const oldProbeWindows = (A) => {
      const n = A.length;
      const k = Math.min(4, Math.floor(n / 96));
      const out = [];
      for (let j = 0; j < k; j++) { const off = Math.max(0, Math.min(n - 48, Math.floor(((j + 0.5) * n) / k - 24))); out.push(A.subarray(off, off + 48)); }
      return out;
    };
    const who = (r) => r.hitsBySecret.map((h) => h.secret).join('+') || 'none';
    const probesOf = (needles) => _internals(needles).groups.filter((g) => g.secret === 'original');

    run('J1 a stored-text original arms on its canary anchor alone; an unrelated upload from the same template is CLEAN, the original is HITS, a bare canary in a log is not "the original"; the pre-repair windows would all have flagged the unrelated upload', () => {
      const cA = newCanary();
      const A = storedDoc(cA);
      const B = storedDoc(newCanary());
      const oldShared = oldProbeWindows(A).filter((w) => B.includes(w)).length;
      const NA = makeNeedles({ canary: cA, originalBytes: A, keyBytes }); // no options: only the canary anchor can qualify
      const bases = [...new Set(probesOf(NA).map((g) => g.basis))].join();
      const rB = scanBuffer(B, NA);
      const rA = scanBuffer(A, NA);
      const log = scanText(`upload ${cA} accepted`, NA);
      const boilerplateOnly = scanBuffer(A.subarray(0, 1200), NA);
      return {
        ok: oldShared === 4 && bases === 'canary-anchored' && rB.verdict === 'CLEAN' && who(rA) === 'canary+original' && who(log) === 'canary' && boilerplateOnly.verdict === 'CLEAN',
        detail: `old-windows-also-in-unrelated-upload=${oldShared}/4 bases=${bases} unrelated=${rB.verdict} original=${who(rA)} canary-in-log=${who(log)} boilerplate-fragment=${boilerplateOnly.verdict}`,
      };
    });

    run('J2 an original whose canary is NOT visible in its bytes needs siblings: refused without them, armed with three, then an unseen upload is CLEAN, the original is HITS, a boilerplate-only fragment is CLEAN and a fragment holding the unique bytes is HITS', () => {
      const cA = newCanary();
      const A = storedDoc(cA, false);
      const sibs = [1, 2, 3].map(() => storedDoc(newCanary(), false));
      const C = storedDoc(newCanary(), false);
      const oldShared = oldProbeWindows(A).filter((w) => C.includes(w)).length;
      let refusal = '';
      try { makeNeedles({ canary: cA, originalBytes: A, keyBytes }); } catch (e) { refusal = e.message; }
      const NA = makeNeedles({ canary: cA, originalBytes: A, keyBytes }, { siblings: sibs });
      const bases = [...new Set(probesOf(NA).map((g) => g.basis))].join();
      const at = A.indexOf(Buffer.from(cA, 'utf16le'));
      const rC = scanBuffer(C, NA);
      const rA = scanBuffer(A, NA);
      const boiler = scanBuffer(A.subarray(0, at - 300), NA);
      const unique = scanBuffer(A.subarray(at - 60, at + 120), NA);
      return {
        ok: oldShared === 4 && /no probe window that is provably specific/.test(refusal) && bases === 'unique-vs-siblings' && rC.verdict === 'CLEAN' && who(rA).split('+').sort().join() === 'canary,original' && boiler.verdict === 'CLEAN' && who(unique).includes('original'),
        detail: `old-windows-also-in-unseen-upload=${oldShared}/4 without-siblings=${refusal ? 'refused' : 'ARMED'} bases=${bases} unseen=${rC.verdict} original=${who(rA)} boilerplate-fragment=${boiler.verdict} unique-fragment=${who(unique)}`,
      };
    });

    run('J3 entropy alone is NOT proof (a compressed template part is as random-looking as a unique one): under assertUnique a sibling upload IS misreported, with siblings it is not; the declaration is therefore explicit and visible', () => {
      const cA = newCanary();
      const A = flateDoc(cA);
      const sibs = [1, 2, 3].map(() => flateDoc(newCanary()));
      const D = flateDoc(newCanary());
      let undeclared = '';
      try { makeNeedles({ canary: cA, originalBytes: A, keyBytes }); } catch (e) { undeclared = e.message; } // high entropy, but neither siblings nor a declaration
      const declared = makeNeedles({ canary: cA, originalBytes: A, keyBytes }, { assertUnique: true });
      const misreported = who(scanBuffer(sibs[0], declared)).includes('original'); // the sharp edge, pinned: a false declaration is the caller's
      const NA = makeNeedles({ canary: cA, originalBytes: A, keyBytes }, { siblings: sibs });
      const rD = scanBuffer(D, NA);
      const rA = scanBuffer(A, NA);
      const boiler = scanBuffer(A.subarray(0, ZIPISH.length + FLATE_BOILERPLATE.length - 60), NA);
      const declaredBases = [...new Set(probesOf(declared).map((g) => g.basis))].join();
      return {
        ok: /unproven because no sibling was given/.test(undeclared) && misreported && declaredBases === 'asserted-unique' && rD.verdict === 'CLEAN' && who(rA).includes('original') && boiler.verdict === 'CLEAN',
        detail: `high-entropy-without-declaration=${undeclared ? 'refused' : 'ARMED'} assertUnique-misreports-a-sibling=${misreported} (basis ${declaredBases}) with-siblings: unseen=${rD.verdict} original=${who(rA)} compressed-boilerplate-fragment=${boiler.verdict}`,
      };
    });

    run('J4 a leak of only the first or only the last 4 KiB of a large original is found (head and tail windows), an unrelated large file is CLEAN, and the pre-repair windows would have missed both', () => {
      const big = Buffer.concat([Buffer.from('%PDF-1.7\n%fictional-large-fixture\n'), crypto.randomBytes(1024 * 1024), Buffer.from('\n%%EOF\n')]);
      const NB = makeNeedles({ canary: newCanary(), originalBytes: big, keyBytes }, UQ);
      const head = big.subarray(0, 4096);
      const tail = big.subarray(big.length - 4096);
      const oldWouldCatch = oldProbeWindows(big).some((w) => head.includes(w) || tail.includes(w));
      const offs = probesOf(NB).map((g) => g.offset);
      const unrelated = scanBuffer(Buffer.concat([Buffer.from('%PDF-1.7\n%fictional-large-fixture\n'), crypto.randomBytes(1024 * 1024)]), NB);
      const rh = scanBuffer(head, NB);
      const rt = scanBuffer(tail, NB);
      return {
        ok: !oldWouldCatch && rh.verdict === 'HITS' && who(rh) === 'original' && rt.verdict === 'HITS' && who(rt) === 'original' && unrelated.verdict === 'CLEAN' && offs.some((o) => o < 4096 - 48) && offs.some((o) => o > big.length - 4096),
        detail: `old-windows-in-either-end=${oldWouldCatch} probes=${offs.length} first4KiB=${who(rh)} last4KiB=${who(rt)} unrelated=${unrelated.verdict}`,
      };
    });

    run('J5 an original with no provable probe is REFUSED for its own reason (no siblings / low entropy / identical sibling), padding is never a probe, and the messages carry no content', () => {
      const boring = Buffer.concat([ZIPISH, T_HEAD, T_TAIL]);
      const kb = { canary: newCanary(), originalBytes: boring, keyBytes };
      const msg = (fn) => { try { fn(); } catch (e) { return e instanceof TypeError ? e.message : `(${e.name})`; } return ''; };
      const noSib = msg(() => makeNeedles(kb));
      const lowEntropy = msg(() => makeNeedles(kb, UQ));
      const identical = msg(() => makeNeedles(kb, { siblings: [boring] }));
      // padding: a long run of zeros is absent from siblings that have none, so only the distinct-byte floor keeps it out of the probes
      const cP = newCanary();
      const padded = Buffer.concat([storedDoc(cP, false), Buffer.alloc(4096)]);
      const NP = makeNeedles({ canary: cP, originalBytes: padded, keyBytes }, { siblings: [1, 2, 3].map(() => storedDoc(newCanary(), false)) });
      const floor = Math.min(...probesOf(NP).map((g) => new Set(g.B).size));
      const zeros = scanBuffer(Buffer.alloc(1 << 20), NP);
      const joined = [noSib, lowEntropy, identical].join('\n');
      return {
        ok: /unproven because no sibling was given/.test(noSib) && /low-entropy under assertUnique/.test(lowEntropy) && /share bytes with a sibling/.test(identical)
          && floor >= 8 && zeros.verdict === 'CLEAN' && !joined.includes(boring.subarray(20, 60).toString('latin1')) && !joined.includes(boring.subarray(1000, 1040).toString('latin1')),
        detail: `no-siblings=${/unproven/.test(noSib)} assertUnique-low-entropy=${/low-entropy/.test(lowEntropy)} identical-sibling=${/share bytes with a sibling/.test(identical)} padded-original: min-distinct-bytes-per-probe=${floor} all-zero-1MiB=${zeros.verdict}`,
      };
    });

    run('J6 describe() reports each probe\'s basis and offset (content-free), probes are sorted by offset and never overlap', () => {
      // Two unique regions (the UTF-16 canary and a random payload): with a single probe "sorted and disjoint" would be vacuously true.
      const cA = newCanary();
      const withPayload = (c) => Buffer.concat([storedDoc(c, false), crypto.randomBytes(600)]);
      const A = withPayload(cA);
      const NA = makeNeedles({ canary: cA, originalBytes: A, keyBytes }, { siblings: [1, 2, 3].map(() => withPayload(newCanary())) });
      const gs = NA.describe().secrets.find((x) => x.name === 'original').groups;
      const sorted = gs.every((g, i) => i === 0 || (g.offset >= gs[i - 1].offset + gs[i - 1].bytes));
      const allowed = gs.every((g) => ['canary-anchored', 'unique-vs-siblings', 'asserted-unique'].includes(g.basis) && Number.isInteger(g.offset) && Number.isInteger(g.bytes));
      const dump = JSON.stringify(NA);
      return { ok: gs.length >= 2 && sorted && allowed && !dump.includes(T_HEAD.subarray(10, 50).toString('latin1')), detail: `probes=${gs.length} sorted-and-disjoint=${sorted} bases-valid=${allowed}` };
    });

    // A ZIP-like container: a unique payload, then a "central directory" of records, each a 34-byte entry NAME (identical in every
    // upload built from the template) plus a 6-byte field (a size / offset, which differs between uploads). Measured on this suite's
    // own deflated DOCX: every misreport that remained after the whole-window rule came from this region (32 of 32).
    const CD_NAMES = ['[Content_Types].xml', '_rels/.rels', 'word/document.xml', 'word/_rels/document.xml.rels', 'word/styles.xml', 'word/settings.xml', 'docProps/core.xml', 'docProps/app.xml']
      .map((n) => Buffer.from(n.padEnd(34, '.'), 'latin1'));
    const cdTail = (fields) => Buffer.concat(CD_NAMES.flatMap((nm, i) => [nm, fields[i]]));
    const freshFields = () => CD_NAMES.map(() => crypto.randomBytes(6));
    const zipLike = (payload, tail) => Buffer.concat([ZIPISH, payload, tail]);

    run('J7 template records whose varying fields COINCIDE with the original but not with the siblings are never probes: an unseen upload sharing those fields is CLEAN, the original and a payload fragment are HITS; the whole-window rule WOULD have used them', () => {
      const fieldsA = freshFields();
      const tailA = cdTail(fieldsA);
      const A = zipLike(crypto.randomBytes(900), tailA);
      const sibs = [1, 2, 3].map(() => zipLike(crypto.randomBytes(900), cdTail(freshFields())));
      const U = zipLike(crypto.randomBytes(900), tailA); // an unrelated upload: other payload, the SAME size / offset fields as the original
      const NA = makeNeedles({ canary: newCanary(), originalBytes: A, keyBytes }, { siblings: sibs });
      const gs = probesOf(NA);
      const tailStart = A.length - tailA.length;
      const inTail = gs.filter((g) => g.offset >= tailStart).length;
      // the scenario is real only if the pre-repair rule (whole window absent from every sibling) accepts tail windows that U also holds
      let oldAccepts = 0;
      for (let off = tailStart; off + 48 <= A.length; off += 24) {
        const w = A.subarray(off, off + 48);
        if (!sibs.some((sb) => sb.includes(w)) && U.includes(w)) oldAccepts += 1;
      }
      const rU = scanBuffer(U, NA);
      const rA = scanBuffer(A, NA);
      const frag = scanBuffer(A.subarray(Math.max(0, gs[0].offset - 5), gs[0].offset + 53), NA); // never a negative start: subarray would count from the end
      const tailOnly = scanBuffer(tailA, NA);
      return {
        ok: gs.length >= 2 && inTail === 0 && oldAccepts >= 5 && rU.verdict === 'CLEAN' && who(rA).includes('original') && who(frag).includes('original') && tailOnly.verdict === 'CLEAN',
        detail: `probes=${gs.length} probes-inside-the-template-tail=${inTail} tail-windows-the-whole-window-rule-would-accept=${oldAccepts} unseen-upload-with-the-same-fields=${rU.verdict} original=${who(rA)} payload-fragment=${who(frag)} tail-alone=${tailOnly.verdict}`,
      };
    });

    run('J8 the sibling comparison is bounded and the bound is checked: a tiny siblingWorkBudget makes arming refuse (content-free, says why), the default arms the same input, assertUnique does no sibling work, and a non-positive or non-numeric budget is rejected', () => {
      const A = zipLike(crypto.randomBytes(900), cdTail(freshFields()));
      const sibs = [1, 2, 3].map(() => zipLike(crypto.randomBytes(900), cdTail(freshFields())));
      const kb = { canary: newCanary(), originalBytes: A, keyBytes };
      const msg = (fn) => { try { fn(); } catch (e) { return e instanceof TypeError ? e.message : `(${e.name})`; } return ''; };
      const tiny = msg(() => makeNeedles(kb, { siblings: sibs, siblingWorkBudget: 1 }));
      const dflt = msg(() => makeNeedles(kb, { siblings: sibs }));
      const declared = msg(() => makeNeedles(kb, { assertUnique: true, siblingWorkBudget: 1 })); // no siblings: nothing to bound
      const bad = [0, -5, NaN, '4e9', {}].filter((b) => !/'siblingWorkBudget' must be a positive number/.test(msg(() => makeNeedles(kb, { siblings: sibs, siblingWorkBudget: b })))).length;
      return {
        ok: /comparison budget was spent/.test(tiny) && /no probe window that is provably specific/.test(tiny) && dflt === '' && declared === '' && bad === 0 && !tiny.includes(A.subarray(20, 60).toString('latin1')),
        detail: `tiny-budget=${tiny ? 'refused-naming-the-budget' : 'ARMED'} default-budget=${dflt ? 'REFUSED' : 'armed'} assertUnique-under-tiny-budget=${declared ? 'REFUSED' : 'armed'} invalid-budgets-accepted=${bad}`,
      };
    });

    run('J9 a 16-byte run shared with the siblings that touches only the LAST bytes of a window whose length is not a multiple of the stride still marks it template (probeBytes 50: the final block must end flush with the window); the same window with unshared tail bytes arms', () => {
      // 50 bytes = 34 unique + 16 shared. Blocks start at 0, 4, ... 32, so [32,48) is the last stride-aligned block and the shared
      // run [34,50) is wholly inside NO stride-aligned block; only the flush block [34,50) finds it.
      const mk = (tail) => Buffer.concat([crypto.randomBytes(34), tail]);
      const S16 = crypto.randomBytes(16);
      const A = mk(S16);
      const kb = { canary: newCanary(), originalBytes: A, keyBytes };
      const msg = (fn) => { try { fn(); } catch (e) { return e instanceof TypeError ? e.message : `(${e.name})`; } return ''; };
      const shared = msg(() => makeNeedles(kb, { probeBytes: 50, siblings: [1, 2, 3].map(() => mk(S16)) }));
      const control = msg(() => makeNeedles(kb, { probeBytes: 50, siblings: [1, 2, 3].map(() => mk(crypto.randomBytes(16))) }));
      return { ok: /share bytes with a sibling/.test(shared) && control === '', detail: `tail-shared-with-siblings=${shared ? 'refused-as-template' : 'ARMED'} tail-not-shared=${control ? 'REFUSED' : 'armed'}` };
    });

    /* ---------------------------------------------------------------- K. realistic accidental-leak forms */
    const flipBit = (b) => { const x = Buffer.from(b); x[17] ^= 0x01; return x; };
    const leakForms = (k) => {
      const hx = (c) => c.toString(16).padStart(2, '0');
      return {
        'JSON.stringify(Uint8Array) (KMS SDK v3 Plaintext)': JSON.stringify({ Plaintext: new Uint8Array(k), KeyId: 'x' }),
        'JSON.stringify(Uint8Array, null, 2)': JSON.stringify({ Plaintext: new Uint8Array(k) }, null, 2),
        'JSON.stringify(Buffer)': JSON.stringify({ k }),
        'JSON.stringify(Buffer, null, 2)': JSON.stringify({ k }, null, 2),
        'util.inspect(Uint8Array)': util.inspect(new Uint8Array(k)),
        'util.inspect(Buffer)': util.inspect(k),
        'String(Array.from(key))': String(Array.from(k)),
        'URL with encodeURIComponent(base64)': `GET /v?k=${encodeURIComponent(k.toString('base64'))} 200`,
        'URL with only + percent-encoded': `/v?k=${k.toString('base64').replace(/\+/g, '%2B')}`,
        'hex with colons': Array.from(k, hx).join(':'),
        'hex with colons, upper': Array.from(k, hx).join(':').toUpperCase(),
        'hex as C array': `{ ${Array.from(k, (c) => '0x' + hx(c)).join(', ')} }`,
        'hex as \\x escapes': Array.from(k, (c) => '\\x' + hx(c)).join(''),
      };
    };

    run('K1 the key is found in every realistic accidental-leak form (12 random keys x 13 forms); the same forms built from a key differing by ONE BIT are CLEAN', () => {
      const trials = 12;
      const missed = new Map();
      const falsePos = new Map();
      let usedUrlLabel = 0;
      let names = [];
      for (let t = 0; t < trials; t++) {
        const k = crypto.randomBytes(32);
        const NN = makeNeedles({ canary: newCanary(), originalBytes, keyBytes: k }, UQ);
        const forms = leakForms(k);
        const controls = leakForms(flipBit(k));
        names = Object.keys(forms);
        for (const [name, text] of Object.entries(forms)) {
          const r = scanText(text, NN);
          if (!(r.verdict === 'HITS' && r.hitsBySecret.some((h) => h.secret === 'key'))) missed.set(name, (missed.get(name) || 0) + 1);
          if (name.startsWith('URL with encodeURIComponent') && /[+/]/.test(b64Region(k, 0, false).toString('latin1')) && r.hitsBySecret.some((h) => h.secret === 'key' && h.encoding === 'urlencoded')) usedUrlLabel += 1;
          if (scanText(controls[name], NN).verdict !== 'CLEAN') falsePos.set(name, (falsePos.get(name) || 0) + 1);
        }
      }
      return {
        ok: missed.size === 0 && falsePos.size === 0 && names.length === 13 && usedUrlLabel > 0,
        detail: `forms=${names.length} trials=${trials} missed=[${[...missed].map(([n, c]) => `${n} x${c}`).join('; ') || 'none'}] one-bit-controls-flagged=[${[...falsePos].map(([n, c]) => `${n} x${c}`).join('; ') || 'none'}] percent-encoded-base64-label-seen=${usedUrlLabel}`,
      };
    });

    run('K2 a case-folded canary (lower, UPPER, Capitalised, Each-Word-Capitalised) is found for a typical and a special canary; a one-character near-miss is CLEAN; a binary key gets no case-fold patterns', () => {
      const capWord = (w) => { const cp = Array.from(w); return cp.length ? cp[0].toUpperCase() + cp.slice(1).join('').toLowerCase() : w; };
      const bad = [];
      let probed = 0;
      for (const [name, c, NN] of [['typical', canaryTypical, Nt], ['special', canarySpecial, N]]) {
        const folds = { lower: c.toLowerCase(), upper: c.toUpperCase(), title: capWord(c), words: c.replace(/[\p{L}\p{N}]+/gu, capWord) };
        for (const [fold, text] of Object.entries(folds)) {
          if (text === c) continue; // identical to the text: raw's business
          probed += 1;
          const r = scanText(`slug=${text}`, NN);
          if (!(r.verdict === 'HITS' && r.hitsBySecret.some((h) => h.secret === 'canary' && h.encoding === 'case-folded'))) bad.push(`${name}/${fold}`);
          const near = text.slice(0, -1) + (text.endsWith('Z') ? 'Y' : 'Z');
          if (scanText(`slug=${near}`, NN).verdict !== 'CLEAN') bad.push(`${name}/${fold}/near-miss`);
        }
      }
      const binaryKeyFolded = _internals(N).entries.filter((e) => e.secret === 'key' && e.encoding === 'case-folded').length;
      return { ok: bad.length === 0 && probed >= 6 && binaryKeyFolded === 0, detail: `folds-probed=${probed} wrong=${bad.join(',') || 'none'} case-fold-patterns-for-binary-key=${binaryKeyFolded}` };
    });

    run('K3 the NOT COVERED list in the header is true: forms it names are really not detected (a positive control for each is), so it must shrink the day one is added', () => {
      let k;
      do { k = crypto.randomBytes(32); } while (isUtf8RoundTrip(k) || !k.some((c) => c >= 0x80)); // a binary key with a byte >= 0x80, so the lossy and signed gaps below are real gaps
      const NN = makeNeedles({ canary: newCanary(), originalBytes, keyBytes: k }, UQ);
      const b64 = k.toString('base64');
      const hexPairs = Array.from(k, (c) => c.toString(16).padStart(2, '0'));
      const base32 = (() => { const A = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'; const bits = Array.from(k, (c) => c.toString(2).padStart(8, '0')).join(''); let o = ''; for (let i = 0; i < bits.length; i += 5) o += A[parseInt(bits.slice(i, i + 5).padEnd(5, '0'), 2)]; return o; })();
      // Python's bytes repr: printable bytes as themselves, the rest as \xNN. Needs at least one printable byte or it IS the all-escaped form.
      const pyRepr = "b'" + Array.from(k, (c) => ((c >= 0x20 && c < 0x7f && c !== 0x27 && c !== 0x5c) ? String.fromCharCode(c) : '\\x' + c.toString(16).padStart(2, '0'))).join('') + "'";
      const gaps = {
        'typed array holding the key at index offset 3': [JSON.stringify(new Uint8Array([1, 2, 3, ...k, 4])), JSON.stringify({ Plaintext: new Uint8Array(k) })],
        'dash-separated hex': [hexPairs.join('-'), hexPairs.join(':')],
        'upper-cased base64 text': [b64.toUpperCase(), b64],
        'double base64': [Buffer.from(b64).toString('base64'), b64],
        'base32 text': [base32, b64],
        'lossy utf8 decode of a binary key (Buffer#toString())': [k.toString(), k.toString('latin1')],
        'mixed printable / \\xNN repr (Python bytes repr)': [pyRepr, hexPairs.map((x) => '\\x' + x).join('')],
        'decimal bytes joined by semicolons': [Array.from(k).join(';'), Array.from(k).join(',')],
        'signed (Int8Array) decimals': [Array.from(new Int8Array(k)).join(','), Array.from(k).join(',')],
      };
      const notDetected = [];
      const controlMissed = [];
      for (const [name, [gap, control]] of Object.entries(gaps)) {
        if (scanText(gap, NN).verdict !== 'CLEAN') notDetected.push(name);
        if (scanText(control, NN).verdict !== 'HITS') controlMissed.push(name);
      }
      return { ok: notDetected.length === 0 && controlMissed.length === 0, detail: `listed-gaps-now-detected=[${notDetected.join('; ') || 'none'}] controls-not-detected=[${controlMissed.join('; ') || 'none'}] (a non-empty first list means the header is stale)` };
    });

    /* ---------------------------------------------------------------- I. KNOWN_WRONG lethality */
    const kwCtx = {
      groups: groupsN,
      needles: N,
      leaksIn,
      noise: kit.noise,
      zipHeader: kit.zipHeader,
      wrapped: kit.wrapped,
      plant: (dir, rel, buf) => writeAt(dir, rel, buf),
      plantVariant: (dir, rel, g, label, tag) => {
        const vs = kit.variants(g, label);
        const v = tag ? vs.find((x) => x.tag === tag) : vs[0];
        if (!v) throw new Error(`no variant ${label}/${tag}`);
        return writeAt(dir, rel, v.bytes);
      },
      symlink: (target, link) => mkLink(target, link),
    };

    run('I0 KNOWN_WRONG is well-formed: >= 14 entries, unique ids, every entry has a scanner and a complete probe', () => {
      const ids = new Set(KNOWN_WRONG.map((k) => k.id));
      const wellFormed = KNOWN_WRONG.every((k) => typeof k.scan === 'function' && k.probe && typeof k.probe.setup === 'function' && typeof k.probe.weakFails === 'function' && typeof k.probe.realPasses === 'function');
      return { ok: KNOWN_WRONG.length >= 14 && ids.size === KNOWN_WRONG.length && wellFormed, detail: `entries=${KNOWN_WRONG.length} unique=${ids.size}` };
    });

    for (const kw of KNOWN_WRONG) {
      if (kw.id === 'KW-12' && !symlinkOk) continue;
      run(`I ${kw.id} real scanner kills "${kw.name}"`, () => {
        const d = mkTmp(created);
        kw.probe.setup(d, kwCtx);
        const opts = kw.probe.opts || {};
        const weak = kw.scan(d, N, opts);
        const real = kw.kind === 'magic' ? scanForMagic(d, opts) : scanDirectory(d, N, opts);
        const weakWrong = Boolean(kw.probe.weakFails(weak, kwCtx));
        const realRight = Boolean(kw.probe.realPasses(real, kwCtx));
        return {
          ok: weakWrong && realRight,
          detail: `flaw="${kw.flaw}" weak-verdict=${weak.verdict || (weak.hung ? 'HUNG' : '?')}${weakWrong ? '(wrong, as intended)' : '(PROBE DOES NOT KILL THE WEAK SCANNER)'} real-verdict=${real.verdict}${realRight ? '(correct)' : '(REAL SCANNER FAILS THE PROBE)'}`,
        };
      });
    }
  } catch (e) {
    // setup failed (for example the primary needle set could not be armed): that is a FAILED selfTest, never a throw
    add('selfTest aborted before completing', false, `${e && e.name}: ${String(e && e.message).slice(0, 200)}`);
  } finally {
    for (const m of restoreModes) { try { fs.chmodSync(m, 0o755); } catch { /* best effort */ } }
    for (const d of created) { try { fs.rmSync(d, { recursive: true, force: true }); } catch { /* best effort */ } }
  }

  if (process.getuid && process.getuid() === 0) unverified.push('EACCES itself: running as root, so a permission denial cannot be provoked (the open-failure branch it takes is exercised by D11a/D11b through names the filesystem lists but cannot resolve)');
  unverified.push('read-time fs races (file replaced by a symlink or truncated between walk and open): O_NOFOLLOW + fstat guard present, not provoked');
  return { ok: checks.length > 0 && checks.every((c) => c.ok), checks, unverified };
}

/* ========================================================================= *
 * Mutation audit: prove selfTest has teeth against defects in THIS file
 * ========================================================================= */

// @@MUTANTS-BEGIN
const MUTANTS = [
  { name: 'no-overlap-carry', find: 'const keep = Math.min(maxLen - 1, win.length);', replace: 'const keep = 0;', why: 'chunk boundary matches vanish' },
  { name: 'overlapping-variants-counted-separately', find: 'if (st >= curEnd) { clusters += 1; curEnd = en; } else if (en > curEnd) curEnd = en;', replace: 'clusters += 1;', why: 'one occurrence reports as several' },
  { name: 'adjacent-copies-merged', find: 'if (st >= curEnd) { clusters += 1; curEnd = en; } else if (en > curEnd) curEnd = en;', replace: 'if (st > curEnd) { clusters += 1; curEnd = en; } else if (en > curEnd) curEnd = en;', why: 'two adjacent copies report as one' },
  { name: 'base64-align2-skip-too-short', find: 'const skip = [0, 2, 3][k];', replace: 'const skip = [0, 2, 2][k];', why: 'alignment-2 pattern includes a neighbour-dependent char' },
  { name: 'base64-tail-not-trimmed', find: 'if (rem !== 0) s = s.slice(0, -1);', replace: '', why: 'last char depends on the following byte' },
  { name: 'base64url-not-translated', find: "if (url) s = s.replace(/\\+/g, '-').replace(/\\//g, '_');", replace: '', why: 'url-safe forms never match' },
  { name: 'hex-upper-is-lower', find: "[Buffer.from(B.toString('hex').toUpperCase(), 'latin1'), ...hexSeparatedVariants(B, true)]", replace: "[Buffer.from(B.toString('hex'), 'latin1'), ...hexSeparatedVariants(B, true)]", why: 'upper-case hex invisible' },
  { name: 'utf16be-not-swapped', find: "case 'utf16be': return [{ pattern: Buffer.from(S, 'utf16le').swap16(), align: null }];", replace: "case 'utf16be': return [{ pattern: Buffer.from(S, 'utf16le'), align: null }];", why: 'big-endian UTF-16 invisible' },
  { name: 'json-ascii-variants-dropped', find: 'for (const v of [base, asciiLower, asciiUpper]) {', replace: 'for (const v of [base]) {', why: 'ensure_ascii JSON invisible' },
  { name: 'whitespace-lane-off', find: 'const stripped = stripWs(chunk); // text-lane', replace: 'const stripped = chunk; // text-lane', why: 'wrapped base64 invisible' },
  { name: 'empty-dir-clean', find: "if (filesScanned === 0) return { verdict: 'VACUOUS', vacuous: true, vacuousReason: 'no-files', complete };", replace: '', why: 'empty directory passes' },
  { name: 'zero-bytes-clean', find: "if (bytesScanned === 0) return { verdict: 'VACUOUS', vacuous: true, vacuousReason: 'no-bytes', complete };", replace: '', why: 'zero-length files pass' },
  { name: 'skips-ignored', find: "if (!complete) return { verdict: 'VACUOUS', vacuous: true, vacuousReason: 'incomplete-coverage', complete };", replace: '', why: 'unread files pass as clean' },
  { name: 'follow-symlinks-by-default', find: 'followSymlinks: opts.followSymlinks ?? false, // scanDirectory default', replace: 'followSymlinks: opts.followSymlinks ?? true, // scanDirectory default', why: 'default escapes the vault' },
  { name: 'short-custom-signature-accepted', find: "if (sig.length < MIN_SIGNATURE_BYTES) throw new TypeError(`scanForMagic: pattern ${i} signature is shorter than ${MIN_SIGNATURE_BYTES} bytes (it would match ciphertext by chance)`);", replace: '', why: 'a 1-byte signature matches everything' },
  { name: 'name-not-redacted', find: 'return { text: `<name-redacted:${redacted}>`, hits };', replace: 'return { text: name, hits };', why: 'report carries the secret in a path' },
  { name: 'dir-loop-guard-removed', find: 'if (visited.has(key)) { skipped.push({ path: relShown, reason: \'symlink-loop\' }); continue; } // target already scanned in this walk', replace: '', why: 'symlink loop is not detected' },
  { name: 'magic-validation-removed', find: 'if (atStart || p.validate(win, idx + p.sig.length)) {', replace: 'if (true) {', why: 'ciphertext trips the container detector' },
  { name: 'magic-start-only', find: 'const atStart = abs <= p.startWindow;', replace: 'const atStart = abs <= p.startWindow; if (!atStart) { idx = win.indexOf(p.sig, idx + 1); continue; }', why: 'embedded plaintext container missed' },
  { name: 'arming-skips-encoding-check', find: "const required = opts.requiredEncodings ?? REQUIRED_ENCODINGS;", replace: "const required = opts.requiredEncodings ?? ['raw'];", why: 'utf8-only sets are accepted' },
  { name: 'dir-scanner-skips-arming', find: 'ensureArmed(needles, opts.arm); // scanDirectory', replace: '', why: 'weak needle sets scan silently' },
  { name: 'round-trip-proof-removed', find: "if (problems.length === 0 && I.groups.length > 0) {", replace: "if (false) {", why: 'corrupted patterns are accepted' },
  { name: 'original-count-summed', find: 'se.set(k2, Math.max(se.get(k2) || 0, c));', replace: 'se.set(k2, (se.get(k2) || 0) + c);', why: 'one copy of the original reports as many' },
  { name: 'alias-ignored-lane', find: "const key = `${lane}:${c.pattern.toString('hex')}`;", replace: "const key = `${lane}:${label}:${c.pattern.toString('hex')}`;", why: 'aliases double count' },
  // --- reviewer round 2: typed arrays, probes of the original, accidental-leak forms, incomplete-coverage reasons, carry aliasing
  { name: 'typed-array-not-normalised', find: 'if (!Buffer.isBuffer(chunk)) chunk = Buffer.from(chunk.buffer, chunk.byteOffset, chunk.byteLength);', replace: '', why: 'a key held in a plain Uint8Array reads CLEAN' },
  { name: 'probe-siblings-ignored', find: "else if (v === 'shared') tally.boilerplate += 1;", replace: 'else if (false) tally.boilerplate += 1;', why: 'template boilerplate becomes a probe and flags unrelated uploads' },
  // --- reviewer round 3: a window is template when a RUN of it occurs in a sibling (ZIP central directory), and that comparison is bounded
  { name: 'probe-sibling-whole-window-only', find: "for (const sb of siblings) for (const o of starts) if (sb.includes(w.subarray(o, o + run))) return 'shared';", replace: "for (const sb of siblings) if (sb.includes(w)) return 'shared';", why: 'a window of shared entry names with varying size / offset fields is "absent from every sibling" and flags unrelated uploads' },
  { name: 'probe-sibling-run-too-long', find: 'const PROBE_SHARED_RUN = 16;', replace: 'const PROBE_SHARED_RUN = 40;', why: 'a template window split by a varying field shares no 40-byte run and is used as a probe' },
  { name: 'probe-sibling-last-block-dropped', find: 'if (starts[starts.length - 1] !== w.length - run) starts.push(w.length - run); // the last block ends flush with the window', replace: '', why: 'a shared run that ends at the window edge is missed when the window length is not a multiple of the stride' },
  { name: 'probe-sibling-work-budget-removed', find: "if (work > workBudget) return 'budget';", replace: '', why: 'arming against large siblings is unbounded' },
  { name: 'probe-sibling-budget-not-validated', find: "if (typeof siblingWorkBudget !== 'number' || !(siblingWorkBudget > 0)) throw new TypeError(\"makeNeedles: 'siblingWorkBudget' must be a positive number\");", replace: '', why: 'a zero, negative or NaN budget silently disables or breaks the bound' },
  { name: 'probe-unproven-accepted', find: 'else tally.unproven += 1; // no sibling, no declaration: nothing proves this window is not boilerplate', replace: "else basis = 'asserted-unique';", why: 'unprovable windows arm silently' },
  { name: 'probe-entropy-is-proof', find: "else if (assertUnique && d >= minDistinct) basis = 'asserted-unique';", replace: "else if (d >= minDistinct) basis = 'asserted-unique';", why: 'compressed template parts count as unique without a declaration' },
  { name: 'probe-head-tail-dropped', find: 'const targets = [0, last];', replace: 'const targets = [];', why: 'a leak of only the head or tail of a large original is missed' },
  { name: 'probe-canary-anchor-dropped', find: 'if (anchor && anchor.length > 0) {', replace: 'if (false) {', why: 'a stored-text original cannot be armed from its canary' },
  { name: 'probe-distinct-floor-dropped', find: 'if (d < PROBE_MIN_DISTINCT_ANY) tally.degenerate += 1;', replace: 'if (d < 1) tally.degenerate += 1;', why: 'padding becomes a probe and any sparse file flags as the original' },
  { name: 'urlencoded-base64-dropped', find: "case 'urlencoded': return [...urlVariants(B, S, kind), ...urlEncodedBase64Variants(B)].map((pattern) => ({ pattern, align: null }));", replace: "case 'urlencoded': return urlVariants(B, S, kind).map((pattern) => ({ pattern, align: null }));", why: 'a key in a URL query string (percent-encoded base64) is invisible' },
  { name: 'byte-array-index-form-dropped', find: '"${i + 1}":${v}', replace: '"${i + 1}"=${v}', why: 'JSON.stringify(Uint8Array) of a KMS Plaintext is invisible' },
  { name: 'byte-array-text-lane-off', find: "'hex-lower', 'hex-upper', 'byte-array']);", replace: "'hex-lower', 'hex-upper']);", why: 'pretty-printed JSON and util.inspect output of a key are invisible' },
  { name: 'case-fold-dropped', find: "case 'case-folded': return caseFoldVariants(S, kind).map((pattern) => ({ pattern, align: null }));", replace: "case 'case-folded': return [];", why: 'a lower-cased canary left by a search index is invisible' },
  { name: 'hex-lower-separators-dropped', find: "[Buffer.from(B.toString('hex'), 'latin1'), ...hexSeparatedVariants(B, false)]", replace: "[Buffer.from(B.toString('hex'), 'latin1')]", why: 'colon / 0x / backslash-x lower-case hex of a key is invisible' },
  { name: 'hex-upper-separators-dropped', find: "[Buffer.from(B.toString('hex').toUpperCase(), 'latin1'), ...hexSeparatedVariants(B, true)]", replace: "[Buffer.from(B.toString('hex').toUpperCase(), 'latin1')]", why: 'colon / 0x / backslash-x upper-case hex of a key is invisible' },
  { name: 'unreadable-dir-not-incomplete', find: "'special', 'unreadable-dir', 'unreadable', 'oversize'", replace: "'special', 'unreadable', 'oversize'", why: 'a directory that could not be listed passes as clean' },
  { name: 'unreadable-file-not-incomplete', find: "'special', 'unreadable-dir', 'unreadable', 'oversize'", replace: "'special', 'unreadable-dir', 'oversize'", why: 'a file that could not be read passes as clean' },
  { name: 'too-deep-not-incomplete', find: "'oversize', 'too-deep', 'entry-budget',", replace: "'oversize', 'entry-budget',", why: 'a subtree beyond the depth cap passes as clean' },
  { name: 'entry-budget-not-incomplete', find: "'oversize', 'too-deep', 'entry-budget',", replace: "'oversize', 'too-deep',", why: 'a tree cut short by the entry budget passes as clean' },
  { name: 'carry-aliases-read-buffer', find: 'return keep > 0 ? Buffer.from(win.subarray(win.length - keep)) : Buffer.alloc(0);', replace: 'return keep > 0 ? win.subarray(win.length - keep) : Buffer.alloc(0);', why: 'the carried tail is overwritten by the next full-size read' },
  { name: 'magic-carry-aliases-read-buffer', find: 'this.carry = keep > 0 ? Buffer.from(win.subarray(win.length - keep)) : Buffer.alloc(0);', replace: 'this.carry = keep > 0 ? win.subarray(win.length - keep) : Buffer.alloc(0);', why: 'a container header split across reads is lost when the next read is full-size' },
];
// @@MUTANTS-END

const MUTANT_TIMEOUT_MS = 90000;

export async function mutationAudit() {
  const self = fileURLToPath(import.meta.url);
  const src = fs.readFileSync(self, 'utf8');
  const baseline = selfTest();
  if (!baseline.ok) {
    return { ok: false, results: [{ name: '(baseline)', status: 'BAD-BASELINE', detail: `unmutated selfTest is not green: ${baseline.checks.filter((c) => !c.ok).map((c) => c.name.slice(0, 40)).slice(0, 3).join(' | ')}` }] };
  }
  const results = [];
  // The table that lists each mutation also contains the text it searches for, so it is excluded from both the
  // uniqueness count and the edit; otherwise every find-string would appear at least twice.
  const tBegin = src.indexOf('// @@' + 'MUTANTS-BEGIN');
  const tEnd = src.indexOf('// @@' + 'MUTANTS-END');
  if (tBegin < 0 || tEnd < tBegin) return { ok: false, results: [{ name: '(table)', status: 'BAD-MUTATION', detail: 'mutant table markers not found' }] };
  const head = src.slice(0, tBegin);
  const table = src.slice(tBegin, tEnd);
  const tail = src.slice(tEnd);
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'wsi-scanners-mut-'));
  try {
    for (const [i, m] of MUTANTS.entries()) {
      const inHead = head.split(m.find).length - 1;
      const inTail = tail.split(m.find).length - 1;
      if (inHead !== 1 || inTail !== 0) { results.push({ name: m.name, status: 'BAD-MUTATION', detail: `find-string occurs ${inHead} time(s) in code before the table and ${inTail} after (need exactly 1 and 0)` }); continue; }
      const mutated = head.split(m.find).join(m.replace) + table + tail;
      if (mutated === src) { results.push({ name: m.name, status: 'BAD-MUTATION', detail: 'mutation changed nothing' }); continue; }
      const file = path.join(dir, `m${i}.mjs`);
      fs.writeFileSync(file, mutated);
      // One child process per mutant: a mutant is allowed to hang or crash, and either counts as killed.
      const child = spawnSync(process.execPath, [file], { encoding: 'utf8', timeout: MUTANT_TIMEOUT_MS, env: process.env, maxBuffer: 16 * 1024 * 1024 });
      if (child.error || child.signal) {
        results.push({ name: m.name, status: 'killed', detail: `mutant ${child.error && child.error.code === 'ETIMEDOUT' ? `hung (> ${MUTANT_TIMEOUT_MS / 1000}s)` : `crashed (${child.signal || (child.error && child.error.code)})`}` });
        continue;
      }
      const failed = [...(child.stdout || '').matchAll(/^\s+FAIL (\S+)/gm)].map((x) => x[1]);
      results.push(child.status !== 0
        ? { name: m.name, status: 'killed', detail: failed.length > 0 ? `${failed.length} check(s) failed: ${failed.slice(0, 5).join(',')}` : `exit ${child.status}` }
        : { name: m.name, status: 'SURVIVED', detail: `selfTest stayed green despite: ${m.why}` });
    }
  } finally {
    try { fs.rmSync(dir, { recursive: true, force: true }); } catch { /* best effort */ }
  }
  return { ok: results.every((r) => r.status === 'killed'), results };
}

/* ========================================================================= *
 * Direct run
 * ========================================================================= */

const isMain = (() => {
  try {
    return Boolean(process.argv[1]) && fs.realpathSync(process.argv[1]) === fs.realpathSync(fileURLToPath(import.meta.url));
  } catch {
    return false;
  }
})();

if (isMain) {
  if (process.argv.includes('--mutation-audit')) {
    mutationAudit().then(
      (a) => {
        for (const r of a.results) console.log(`${r.status.padEnd(12)} ${r.name.padEnd(34)} ${r.detail}`);
        const bad = a.results.filter((r) => r.status !== 'killed').length;
        console.log(`scanners.mjs mutation-audit: ${a.ok ? 'PASS' : 'FAIL'} (${a.results.length - bad}/${a.results.length} mutants killed)`);
        process.exitCode = a.ok ? 0 : 1;
      },
      (e) => { console.log(`scanners.mjs mutation-audit: ERROR ${e && e.name}: ${e && e.message}`); process.exitCode = 1; },
    );
  } else {
    const t0 = Date.now();
    const r = selfTest();
    const failed = r.checks.filter((c) => !c.ok);
    const verbose = process.argv.includes('--verbose');
    console.log(`scanners selfTest: ${r.ok ? 'PASS' : 'FAIL'} (${r.checks.length - failed.length}/${r.checks.length} checks, ${Date.now() - t0}ms)`);
    for (const c of r.checks) if (verbose || !c.ok) console.log(`  ${c.ok ? 'ok  ' : 'FAIL'} ${c.name}${c.detail ? ` -- ${c.detail}` : ''}`);
    for (const u of r.unverified) console.log(`  unverified: ${u}`);
    process.exitCode = r.ok ? 0 : 1;
  }
}
