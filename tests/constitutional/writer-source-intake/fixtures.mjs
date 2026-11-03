#!/usr/bin/env node
/**
 * fixtures.mjs -- fictional test manuscripts for the Writer original-file intake
 * acceptance run. Plain Node ESM, node: built-ins only, no network, no state.
 *
 * WHAT THIS MODULE IS
 *   A generator of small, deterministic, FICTIONAL files (every subject, name and
 *   sentence is invented) that exercise the intake route's accept / refuse
 *   boundaries, plus a pure-JS ZIP writer and reader used to build and to
 *   independently verify them. Each fixture that has extractable body text carries
 *   one runtime-generated canary token in that body text, so a later scanner can
 *   look for it in places it must not appear (logs, DB rows, plaintext stores).
 *
 * WHAT THIS MODULE IS NOT
 *   It never calls the route, the parser or KMS. Every `expectedParse` /
 *   `expectedStatusClass` below is `basis: 'inferred-from-source'`: derived by
 *   READING parseUpload.ts, ingest/route.ts, docxFidelity.ts and
 *   encryptedLanding.ts, NOT by running mammoth, pdf-parse or jszip. A later run
 *   against a real instance is what could upgrade any of them to 'verified'.
 *
 * HOW THE EXPECTATIONS ARE HELD IN PLACE (three layers, each with its own defeat tests)
 *   1. DERIVATION. `deriveExpectation(measureUpload(bytes,name,mime), facts)` is an
 *      independent, hand-written model of the route decision tree. The per-fixture
 *      table in specs() must EQUAL its output for every fixture, so an expectation
 *      cannot be flipped without the self-test noticing, and a changed limit or status
 *      in the source moves the derived value away from the table.
 *   2. ANCHORS. `factsFromSources` re-reads the COMMENT-STRIPPED source (lib/strip.mjs)
 *      for the numbers, statuses, guard conditions, branch orderings and the
 *      accepted-extension list the model relies on, and pins a digest of each source
 *      region the expectations were read from. A digest change means "the code your
 *      expectations were read from changed; re-derive them", NOT "the expectation is
 *      wrong". Anchors are static text analysis; they do not run the code.
 *   3. DISCRIMINATION. The fixture set is itself tested: a set of deliberately wrong
 *      route models (wrong comparison, wrong unit of length, guard off, ...) must each
 *      be killed by at least one fixture. A fixture set that no wrong route can fail
 *      is not an instrument.
 *   What is STILL inferred, not run: mammoth, pdf-parse, xmldom and the database. The
 *   `uncertain` flag marks the outcomes that hinge on them.
 *   WHAT THE ANCHORS STILL CANNOT SEE (measured by a mutation sweep of 778 mechanical edits to the
 *   anchored sources: 535 went unflagged before the extra region digests were added, 381 still do;
 *   most of those 381 are in the code named below, the rest are digits inside comments. Read the
 *   list, do not read the pins as total):
 *   the auth / membership / idempotency-header flow in route.ts (a precondition, not a modelled
 *   decision); the database state machine inside encryptedLanding.ts (idempotency conflict, writer
 *   fencing, lease and verify failures: precondition 3 says the landing path is healthy); arrivals.ts
 *   outside recordArtifactArrival; and logging, key handling and SQL text. Edits to the EXTENSION
 *   helper, the EPUB text conversion, the EPUB package-resolution helpers, the release hold and all of
 *   docxFidelity.ts ARE flagged, but only by a catch-all region digest ("re-read"), not by a fact.
 *   The exact EPUB text-cap boundary is NOT witnessed by any fixture: it depends on the parser's text
 *   conversion, which was read and not run, so only a wide-margin over-cap fixture exists.
 *
 * INDEPENDENT CORROBORATION IS NOT OPTIONAL. The self-test cross-checks zip validity
 * with `unzip`, PDF text with poppler and XML with xmllint. When one of those tools is
 * absent the matching check FAILS (UNCORROBORATED) unless the caller explicitly waives
 * it (selfTest({ allowUncorroborated: [...] }) or WSI_ALLOW_UNCORROBORATED=unzip,poppler,
 * xmllint|all). A waiver is printed and returned in `corroboration`; it is never silent.
 *
 * DEFINITIONS (so no consumer has to guess)
 *   containsCanary      the canary was written into the fixture's BODY content.
 *                       It says nothing about whether extraction succeeds, so a
 *                       refused or corrupt fixture can still be containsCanary:true
 *                       (that is deliberate: if a refused upload's bytes land
 *                       anywhere, a scanner can see it).
 *   canaryInRawBytes    DERIVED at generation time by searching the raw file bytes.
 *                       DOCX/EPUB text entries are written STORED so the canary is
 *                       byte-visible; `manuscript-deflated.docx` is the deliberate
 *                       exception (deflated, so a raw-byte scanner is blind to it).
 *   expectedParse       'accept' iff parseUpload() returns without throwing AND no
 *                       route gate that runs before custody fires (empty file, 25 MB
 *                       size, 2,000,000-char text cap). Otherwise 'refuse'.
 *   expectedStatusClass the full-route outcome class, UNDER THE PRECONDITIONS in
 *                       EXPECTATION_PRECONDITIONS. Contract allowed '2xx'|'4xx';
 *                       '5xx' is used where the source reading says the route returns
 *                       503 AFTER the ciphertext landed (empty extraction, and text the
 *                       database cannot hold: see the scanned.pdf, empty.docx,
 *                       text-with-nul.txt and text-utf16le.txt notes). Every 5xx entry
 *                       is `uncertain:true` by construction.
 *   name                the file's basename; `kind` is the logical fixture type.
 *
 * ADDITIVE manifest fields beyond the contract: mime, expectedStatus, uncertain,
 * canaryInRawBytes. Consumers coding against the contract fields are unaffected.
 *
 * Content-free rule: nothing exported or printed here names matched content. Check
 * details carry file basenames, counts, sizes and encoding names only, and every
 * detail string is passed through redact().
 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import zlib from 'node:zlib';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { stripComments, stripSqlComments } from './lib/strip.mjs';
import * as stripLib from './lib/strip.mjs'; // the optional `...Detailed` variants report constructs the stripper could not close

/* ------------------------------------------------------------------------- *
 * Constants
 * ------------------------------------------------------------------------- */

export const CANARY_PREFIX = 'WSICANARY';
const CANARY_RE = /^WSICANARY[0-9A-Za-z]{8,64}$/;
const CANARY_ANY_RE = /WSICANARY[0-9A-Za-z]+/g;

/** Limits as read from the source (selfTest re-derives them from the source files). */
export const LIMITS = Object.freeze({
  MAX_FILE_BYTES: 25 * 1024 * 1024, // 26214400, route.ts + encryptedLanding.ts
  MAX_TEXT_CHARS: 2_000_000, // route.ts
  EPUB_MAX_ENTRIES: 2_000, // parseUpload.ts
  EPUB_MAX_ENTRY_BYTES: 8 * 1024 * 1024,
  EPUB_MAX_TOTAL_BYTES: 64 * 1024 * 1024,
});

/**
 * parseUpload.ts EPUB_MAX_TEXT_CHARS: a fourth EPUB guard, on the text the parser extracts (not the archive).
 * Kept OUT of the exported LIMITS so that object's shape is unchanged for other modules.
 */
const EPUB_TEXT_CAP = 2_000_000;

export const BOMB_EXPANDED_BYTES = 100 * 1024 * 1024; // 104857600
export const STATUS_CLASSES = Object.freeze(['2xx', '4xx', '5xx']);

export const EXPECTATION_PRECONDITIONS = Object.freeze([
  'Expectations assume the route is RELEASED. At the pinned source writerReleaseAuthority().sourceIntakeReleased is false, so the route answers 423 to every authenticated upload before it reads the body.',
  'Expectations assume an authenticated member session and a valid caller-stable UUID in the source-upload idempotency header (400 otherwise).',
  'Expectations assume the encrypted-landing path (KMS wrap, ciphertext write, DB commit) is healthy; otherwise 503/500 regardless of fixture.',
  'Expectations assume no transport limit below the multipart-wrapped file. The route is excluded from the proxy matcher (proxyClientMaxBodySize is 30 MiB in next.config.js); a grep of the Caddyfile found no body limit. Neither was exercised.',
  'Expectations come from READING the source. mammoth, pdf-parse and jszip were not run; entries marked uncertain:true hinge on library behaviour the source does not settle.',
]);

/* ------------------------------------------------------------------------- *
 * Canary
 * ------------------------------------------------------------------------- */

/** Unique, alphanumeric-only token (safe inside XML, PDF strings and Markdown unescaped). */
export function makeCanary(seedHex = crypto.randomBytes(12).toString('hex')) {
  if (typeof seedHex !== 'string' || !/^[0-9a-fA-F]{8,64}$/.test(seedHex)) {
    throw new TypeError('makeCanary: seedHex must be 8-64 hex characters');
  }
  return CANARY_PREFIX + seedHex.toUpperCase();
}

function assertCanary(canary) {
  if (typeof canary !== 'string' || !CANARY_RE.test(canary)) {
    throw new TypeError('canary must be CANARY_PREFIX followed by 8-64 alphanumeric characters (use makeCanary)');
  }
  return canary;
}

export function redact(text) {
  return String(text).replace(CANARY_ANY_RE, '[canary]');
}

/* ------------------------------------------------------------------------- *
 * CRC-32 and a minimal ZIP writer / reader (stored + deflate, no zip64)
 * ------------------------------------------------------------------------- */

const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

export function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

const DOS_TIME = 0x0000; // 00:00:00
const DOS_DATE = 0x0021; // 1980-01-01, fixed so output is byte-deterministic
const U32 = 0xffffffff;

/**
 * entries: [{ name, data: Buffer, method: 'stored'|'deflate',
 *             precomputed?: { crc, usize, payload } }]
 * Returns { buffer, cdOffset, cdSize, entries: [{name, method, crc, csize, usize, offset}] }.
 */
export function buildZip(entries) {
  if (!Array.isArray(entries) || entries.length === 0 || entries.length > 0xfffe) {
    throw new RangeError('buildZip: need 1..65534 entries');
  }
  const parts = [];
  const central = [];
  const meta = [];
  let offset = 0;
  for (const e of entries) {
    const nameBuf = Buffer.from(e.name, 'utf8');
    const method = e.method === 'deflate' ? 8 : 0;
    let crc, usize, payload;
    if (e.precomputed) {
      ({ crc, usize, payload } = e.precomputed);
    } else {
      crc = crc32(e.data);
      usize = e.data.length;
      payload = method === 8 ? zlib.deflateRawSync(e.data, { level: 9, chunkSize: 65536 }) : e.data;
    }
    const csize = payload.length;
    if (csize > U32 || usize > U32 || offset > U32) throw new RangeError('buildZip: zip64 not supported');
    const flags = /[^\x00-\x7f]/.test(e.name) ? 0x0800 : 0;
    const need = method === 8 ? 20 : 10;

    const lh = Buffer.alloc(30);
    lh.writeUInt32LE(0x04034b50, 0);
    lh.writeUInt16LE(need, 4);
    lh.writeUInt16LE(flags, 6);
    lh.writeUInt16LE(method, 8);
    lh.writeUInt16LE(DOS_TIME, 10);
    lh.writeUInt16LE(DOS_DATE, 12);
    lh.writeUInt32LE(crc, 14);
    lh.writeUInt32LE(csize, 18);
    lh.writeUInt32LE(usize, 22);
    lh.writeUInt16LE(nameBuf.length, 26);
    lh.writeUInt16LE(0, 28);
    parts.push(lh, nameBuf, payload);

    const ch = Buffer.alloc(46);
    ch.writeUInt32LE(0x02014b50, 0);
    ch.writeUInt16LE(20, 4); // made by: DOS, 2.0
    ch.writeUInt16LE(need, 6);
    ch.writeUInt16LE(flags, 8);
    ch.writeUInt16LE(method, 10);
    ch.writeUInt16LE(DOS_TIME, 12);
    ch.writeUInt16LE(DOS_DATE, 14);
    ch.writeUInt32LE(crc, 16);
    ch.writeUInt32LE(csize, 20);
    ch.writeUInt32LE(usize, 24);
    ch.writeUInt16LE(nameBuf.length, 28);
    // extra(30) comment(32) disk(34) internal attrs(36) external attrs(38) stay 0
    ch.writeUInt32LE(offset, 42);
    central.push(ch, nameBuf);

    meta.push({ name: e.name, method, crc, csize, usize, offset });
    offset += 30 + nameBuf.length + csize;
  }
  const cdOffset = offset;
  const cdBuf = Buffer.concat(central);
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0);
  eocd.writeUInt16LE(entries.length, 8);
  eocd.writeUInt16LE(entries.length, 10);
  eocd.writeUInt32LE(cdBuf.length, 12);
  eocd.writeUInt32LE(cdOffset, 16);
  return { buffer: Buffer.concat([...parts, cdBuf, eocd]), cdOffset, cdSize: cdBuf.length, entries: meta };
}

export class ZipError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ZipError';
  }
}

/** Strict central-directory reader. Throws ZipError on anything not a well-formed zip. */
export function readZip(buf) {
  if (!Buffer.isBuffer(buf) || buf.length < 22) throw new ZipError('too short to be a zip');
  const floor = Math.max(0, buf.length - 22 - 0xffff);
  let eocd = -1;
  for (let i = buf.length - 22; i >= floor; i--) {
    if (buf.readUInt32LE(i) === 0x06054b50) {
      eocd = i;
      break;
    }
  }
  if (eocd < 0) throw new ZipError('end of central directory not found');
  const total = buf.readUInt16LE(eocd + 10);
  const cdSize = buf.readUInt32LE(eocd + 12);
  const cdOff = buf.readUInt32LE(eocd + 16);
  const commentLen = buf.readUInt16LE(eocd + 20);
  if (eocd + 22 + commentLen !== buf.length) throw new ZipError('bytes after end of central directory');
  if (cdOff + cdSize > eocd) throw new ZipError('central directory out of bounds');
  const entries = [];
  let p = cdOff;
  for (let i = 0; i < total; i++) {
    if (p + 46 > eocd || buf.readUInt32LE(p) !== 0x02014b50) throw new ZipError('bad central header');
    const flags = buf.readUInt16LE(p + 8);
    const method = buf.readUInt16LE(p + 10);
    const crc = buf.readUInt32LE(p + 16);
    const csize = buf.readUInt32LE(p + 20);
    const usize = buf.readUInt32LE(p + 24);
    const nameLen = buf.readUInt16LE(p + 28);
    const extraLen = buf.readUInt16LE(p + 30);
    const commentL = buf.readUInt16LE(p + 32);
    const localOffset = buf.readUInt32LE(p + 42);
    if (p + 46 + nameLen + extraLen + commentL > eocd) throw new ZipError('central header overruns directory');
    const name = buf.toString('utf8', p + 46, p + 46 + nameLen);
    if (localOffset + 30 > cdOff || buf.readUInt32LE(localOffset) !== 0x04034b50) throw new ZipError('bad local header');
    const lNameLen = buf.readUInt16LE(localOffset + 26);
    const lExtraLen = buf.readUInt16LE(localOffset + 28);
    if (buf.toString('utf8', localOffset + 30, localOffset + 30 + lNameLen) !== name) {
      throw new ZipError('local/central name mismatch');
    }
    const dataOffset = localOffset + 30 + lNameLen + lExtraLen;
    if (dataOffset + csize > cdOff) throw new ZipError('entry data overruns central directory');
    entries.push({ name, flags, method, crc, csize, usize, localOffset, dataOffset });
    p += 46 + nameLen + extraLen + commentL;
  }
  if (p !== cdOff + cdSize) throw new ZipError('central directory size mismatch');
  return { entries, byName: new Map(entries.map((e) => [e.name, e])) };
}

/** Inflate/copy one entry and verify declared size and CRC. Refuses entries over maxOutput. */
export function readEntry(buf, entry, { maxOutput = 32 * 1024 * 1024 } = {}) {
  if (entry.usize > maxOutput) throw new ZipError(`entry exceeds maxOutput (${entry.usize} > ${maxOutput})`);
  const raw = buf.subarray(entry.dataOffset, entry.dataOffset + entry.csize);
  let data;
  if (entry.method === 0) data = raw;
  else if (entry.method === 8) {
    try {
      data = zlib.inflateRawSync(raw, { maxOutputLength: Math.max(1, entry.usize) });
    } catch {
      throw new ZipError('inflate failed or exceeded declared size');
    }
  } else throw new ZipError(`unsupported method ${entry.method}`);
  if (data.length !== entry.usize) throw new ZipError('declared size mismatch');
  if (crc32(data) !== entry.crc) throw new ZipError('crc mismatch');
  return data;
}

/* ------------------------------------------------------------------------- *
 * Small XML helpers (generation + an independent well-formedness check)
 * ------------------------------------------------------------------------- */

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const isXmlChar = (cp) =>
  cp === 0x9 || cp === 0xa || cp === 0xd || (cp >= 0x20 && cp <= 0xd7ff) || (cp >= 0xe000 && cp <= 0xfffd) || (cp >= 0x10000 && cp <= 0x10ffff);

/**
 * Decode the five predefined XML entities and numeric character references in ONE pass
 * (so `&#38;lt;` is the literal text `&lt;`, not `<`). Never throws: a reference that is
 * not a legal XML 1.0 Char (NUL, a surrogate, above U+10FFFF, or too large to be a safe
 * integer) is left exactly as written rather than fabricating text or crashing the
 * caller on hostile input.
 */
export function decodeXmlEntities(s) {
  return String(s).replace(/&(?:#x([0-9a-fA-F]+)|#([0-9]+)|(lt|gt|quot|apos|amp));/g, (whole, hex, dec, named) => {
    if (named) return { lt: '<', gt: '>', quot: '"', apos: "'", amp: '&' }[named];
    const cp = hex !== undefined ? parseInt(hex, 16) : parseInt(dec, 10);
    return Number.isSafeInteger(cp) && isXmlChar(cp) ? String.fromCodePoint(cp) : whole;
  });
}

/** The pre-repair behaviour, kept ONLY as a negative control for the self-test (not exported). */
function legacyDecodeXmlEntities(s) {
  return s
    .replace(/&#x([0-9a-fA-F]+);/g, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#([0-9]+);/g, (_, d) => String.fromCodePoint(parseInt(d, 10)))
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&');
}

/** Minimal well-formedness check: nesting, one root, entity use, no control chars. */
export function isWellFormedXml(xml) {
  const fail = (reason) => ({ ok: false, reason });
  if (typeof xml !== 'string') return fail('not a string');
  if (/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/.test(xml)) return fail('control character');
  let s = xml.replace(/^\uFEFF/, '').replace(/^\s*<\?xml[^>]*\?>/, '').replace(/<!--[\s\S]*?-->/g, '');
  if (/&(?!(?:amp|lt|gt|quot|apos|#[0-9]+|#x[0-9A-Fa-f]+);)/.test(s)) return fail('bare ampersand');
  const tag = /<(\/?)([A-Za-z_][\w.:-]*)((?:\s+[A-Za-z_][\w.:-]*\s*=\s*(?:"[^"<]*"|'[^'<]*'))*)\s*(\/?)>/g;
  const stack = [];
  let pos = 0;
  let roots = 0;
  let m;
  while ((m = tag.exec(s)) !== null) {
    const between = s.slice(pos, m.index);
    if (between.includes('<')) return fail('malformed tag');
    if (stack.length === 0 && between.trim() !== '') return fail('text outside root');
    pos = tag.lastIndex;
    const closing = m[1] === '/';
    const selfClosing = m[4] === '/';
    if (closing) {
      if (selfClosing || m[3].trim() !== '') return fail('malformed closing tag');
      if (stack.pop() !== m[2]) return fail('mismatched closing tag');
    } else {
      if (stack.length === 0 && ++roots > 1) return fail('multiple roots');
      if (!selfClosing) stack.push(m[2]);
    }
  }
  const tail = s.slice(pos);
  if (tail.includes('<') || tail.trim() !== '') return fail('trailing content');
  if (stack.length) return fail('unclosed element');
  if (roots !== 1) return fail('no root element');
  return { ok: true, reason: '' };
}

/* ------------------------------------------------------------------------- *
 * Fictional prose (invented subject; ASCII variant for PDF strings)
 * ------------------------------------------------------------------------- */

function prose(canary, { ascii = false } = {}) {
  const apos = ascii ? "'" : '\u2019';
  const dash = ascii ? ' - ' : ' \u2014 ';
  const circ = ascii ? 'o' : '\u00f4';
  const lq = ascii ? "'" : '\u2018';
  return {
    title: 'The Salt Cartographers of Ostrevane',
    chapters: [
      {
        heading: 'The Tide Ledger',
        paragraphs: [
          `In the harbour town of Ostrevane, which exists only in this book, the salt cartographers drew coastlines that changed with every spring tide. Tamsin Orrevale kept the ledger of their disagreements.`,
          `The ledger of the Brindlec${circ}te guild carried one unexplained mark on its final page: ${canary}. Nobody in Ostrevane could say who had written it, and nobody asked.`,
          `Every map was redrawn at dusk. The old keepers said a map that stayed the same for a month was a map that had stopped listening to the water${dash}and a map that stopped listening was merely a drawing.`,
        ],
      },
      {
        heading: 'The Lamp Without a Wick',
        paragraphs: [
          `Corwin Ashgrove, the youngest apprentice, was given a lamp without a wick and told to light the north jetty with it. He spent a winter learning that the instruction was a joke, and then a spring learning that it was not.`,
          `By midsummer the jetty glowed on its own, in a colour the guild had no word for. They wrote it down as ${lq}the colour of an unfinished sentence${apos} and moved on to the next tide.`,
        ],
      },
    ],
  };
}

function wrap(text, width) {
  const lines = [];
  let cur = '';
  for (const w of text.split(/\s+/)) {
    const next = cur ? `${cur} ${w}` : w;
    if (next.length > width && cur) {
      lines.push(cur);
      cur = w;
    } else cur = next;
  }
  if (cur) lines.push(cur);
  return lines;
}

function markdownOf(canary) {
  const p = prose(canary);
  return `# ${p.title}\n\n` + p.chapters.map((c) => `## ${c.heading}\n\n${c.paragraphs.join('\n\n')}\n`).join('\n');
}

function plainTextOf(canary) {
  const p = prose(canary);
  return `${p.title}\n\n` + p.chapters.map((c) => `${c.heading}\n\n${c.paragraphs.join('\n\n')}\n`).join('\n');
}

function rtfOf(canary) {
  const p = prose(canary, { ascii: true });
  const body = p.chapters.flatMap((c) => [c.heading, ...c.paragraphs]).join('\\par\n');
  return `{\\rtf1\\ansi\\deff0 {\\fonttbl{\\f0 Times New Roman;}}\\f0\\fs24 ${p.title}\\par\n${body}\\par\n}\n`;
}

/* ------------------------------------------------------------------------- *
 * PDF builders (hand-written; byte-exact xref)
 * ------------------------------------------------------------------------- */

function assemblePdf(bodies) {
  const head = Buffer.from('%PDF-1.4\n%\u00e2\u00e3\u00cf\u00d3\n', 'latin1');
  const parts = [head];
  let pos = head.length;
  const offsets = [];
  bodies.forEach((b, i) => {
    offsets.push(pos);
    const chunk = Buffer.concat([Buffer.from(`${i + 1} 0 obj\n`, 'latin1'), b, Buffer.from('\nendobj\n', 'latin1')]);
    parts.push(chunk);
    pos += chunk.length;
  });
  let x = `xref\n0 ${bodies.length + 1}\n0000000000 65535 f \n`;
  for (const o of offsets) x += `${String(o).padStart(10, '0')} 00000 n \n`;
  x += `trailer\n<< /Size ${bodies.length + 1} /Root 1 0 R >>\nstartxref\n${pos}\n%%EOF\n`;
  parts.push(Buffer.from(x, 'latin1'));
  return Buffer.concat(parts);
}

const pdfEscape = (s) => s.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');

function pdfStreamObject(dictInner, data) {
  return Buffer.concat([
    Buffer.from(`<< ${dictInner} /Length ${data.length} >>\nstream\n`, 'latin1'),
    data,
    Buffer.from('\nendstream', 'latin1'),
  ]);
}

/**
 * A one-page text PDF. Default output (no options) is the plain uncompressed `Tj` form and
 * is byte-for-byte what earlier versions produced. The options exist because real PDFs are
 * almost always FlateDecode-compressed and use `TJ` arrays with kerning adjustments, and a
 * verifier that only understands the plain form is blind to both:
 *   flate     the content stream is zlib-compressed (/Filter /FlateDecode)
 *   tjArrays  every line is shown as `[(..) -8 (..) 5 (..)] TJ`, cut INSIDE words so the
 *             canary itself is split across string pieces
 */
export function buildTextPdf(canary, { flate = false, tjArrays = false } = {}) {
  assertCanary(canary);
  const p = prose(canary, { ascii: true });
  const show = (line) => {
    if (!tjArrays) return `(${pdfEscape(line)}) Tj`;
    const a = Math.floor(line.length / 3);
    const b = Math.floor((2 * line.length) / 3);
    return `[(${pdfEscape(line.slice(0, a))}) -8 (${pdfEscape(line.slice(a, b))}) 5 (${pdfEscape(line.slice(b))})] TJ`;
  };
  const ops = ['BT', `/F1 16 Tf 72 740 Td ${show(p.title)}`];
  for (const c of p.chapters) {
    ops.push(`/F1 13 Tf 0 -30 Td ${show(c.heading)}`);
    for (const para of c.paragraphs) {
      const lines = wrap(para, 84);
      lines.forEach((line, i) => ops.push(`/F1 11 Tf 0 ${i === 0 ? -20 : -14} Td ${show(line)}`));
    }
  }
  ops.push('ET');
  const content = Buffer.from(ops.join('\n'), 'latin1');
  return assemblePdf([
    Buffer.from('<< /Type /Catalog /Pages 2 0 R >>', 'latin1'),
    Buffer.from('<< /Type /Pages /Kids [3 0 R] /Count 1 >>', 'latin1'),
    Buffer.from(
      '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>',
      'latin1',
    ),
    flate ? pdfStreamObject('/Filter /FlateDecode', zlib.deflateSync(content)) : pdfStreamObject('', content),
    Buffer.from('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>', 'latin1'),
  ]);
}

/** One page that is a single 8x8 gray image: no text operator, no font resource. */
export function buildScannedPdf() {
  const pixels = Buffer.alloc(64);
  for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) pixels[y * 8 + x] = 0x80 | ((x * 9 + y * 7) & 0x7f); // >=0x80: never ASCII
  const content = Buffer.from('q 468 0 0 468 72 162 cm /Im0 Do Q', 'latin1');
  return assemblePdf([
    Buffer.from('<< /Type /Catalog /Pages 2 0 R >>', 'latin1'),
    Buffer.from('<< /Type /Pages /Kids [3 0 R] /Count 1 >>', 'latin1'),
    Buffer.from(
      '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /XObject << /Im0 5 0 R >> >> /Contents 4 0 R >>',
      'latin1',
    ),
    pdfStreamObject('', content),
    pdfStreamObject(
      '/Type /XObject /Subtype /Image /Width 8 /Height 8 /ColorSpace /DeviceGray /BitsPerComponent 8',
      pixels,
    ),
  ]);
}

/**
 * A one-page PDF whose font re-maps character code 65 to the glyph /B: the literal `(AAAA) Tj`
 * is DISPLAYED (and extracted by poppler) as "BBBB". Only for the self-test: it proves that a
 * literal-string reader cannot call such a file `exact`. Not exported, not a fixture.
 */
function buildRemappedFontPdf() {
  const content = Buffer.from('BT\n/F1 12 Tf 72 720 Td (AAAA) Tj\nET', 'latin1');
  return assemblePdf([
    Buffer.from('<< /Type /Catalog /Pages 2 0 R >>', 'latin1'),
    Buffer.from('<< /Type /Pages /Kids [3 0 R] /Count 1 >>', 'latin1'),
    Buffer.from('<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>', 'latin1'),
    pdfStreamObject('', content),
    Buffer.from('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding << /Type /Encoding /Differences [65 /B] >> >>', 'latin1'),
  ]);
}

/* ------------------------------------------------------------------------- *
 * DOCX builders
 * ------------------------------------------------------------------------- */

const XML_DECL = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n';
const W_NS = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main';
const DOC_OPEN = `${XML_DECL}<w:document xmlns:w="${W_NS}"><w:body>`;
const DOC_CLOSE = '<w:sectPr><w:pgSz w:w="12240" w:h="15840"/></w:sectPr></w:body></w:document>';

function documentXmlOf(blocks) {
  const body = blocks.length
    ? blocks
        .map(
          (b) =>
            `<w:p>${b.style ? `<w:pPr><w:pStyle w:val="${b.style}"/></w:pPr>` : ''}<w:r><w:t xml:space="preserve">${esc(b.text)}</w:t></w:r></w:p>`,
        )
        .join('')
    : '<w:p><w:pPr/></w:p>';
  return DOC_OPEN + body + DOC_CLOSE;
}

function docxBlocksOf(canary) {
  const p = prose(canary);
  const blocks = [{ style: 'Heading1', text: p.title }];
  for (const c of p.chapters) {
    blocks.push({ style: 'Heading2', text: c.heading });
    for (const para of c.paragraphs) blocks.push({ text: para });
  }
  return blocks;
}

const STYLES_XML =
  `${XML_DECL}<w:styles xmlns:w="${W_NS}">` +
  '<w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/><w:qFormat/></w:style>' +
  '<w:style w:type="paragraph" w:styleId="Heading1"><w:name w:val="heading 1"/><w:basedOn w:val="Normal"/><w:qFormat/></w:style>' +
  '<w:style w:type="paragraph" w:styleId="Heading2"><w:name w:val="heading 2"/><w:basedOn w:val="Normal"/><w:qFormat/></w:style>' +
  '</w:styles>';

function docxEntries({ documentData, method, withBinDefault = false, extra = [], documentPrecomputed = null, ctDefaults = '', docRelsExtra = '' }) {
  const m = method;
  const ct =
    `${XML_DECL}<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">` +
    '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>' +
    '<Default Extension="xml" ContentType="application/xml"/>' +
    (withBinDefault ? '<Default Extension="bin" ContentType="application/octet-stream"/>' : '') +
    ctDefaults +
    '<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>' +
    '<Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>' +
    '</Types>';
  const rels =
    `${XML_DECL}<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">` +
    '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>' +
    '</Relationships>';
  const docRels =
    `${XML_DECL}<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">` +
    '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>' +
    docRelsExtra +
    '</Relationships>';
  const b = (s) => Buffer.from(s, 'utf8');
  return [
    { name: '[Content_Types].xml', data: b(ct), method: m },
    { name: '_rels/.rels', data: b(rels), method: m },
    documentPrecomputed
      ? { name: 'word/document.xml', data: Buffer.alloc(0), method: 'deflate', precomputed: documentPrecomputed }
      : { name: 'word/document.xml', data: documentData, method: m },
    { name: 'word/_rels/document.xml.rels', data: b(docRels), method: m },
    { name: 'word/styles.xml', data: b(STYLES_XML), method: m },
    ...extra,
  ];
}

export function buildDocx(canary, { method = 'stored', extra = [], withBinDefault = false } = {}) {
  assertCanary(canary);
  const documentData = Buffer.from(documentXmlOf(docxBlocksOf(canary)), 'utf8');
  return buildZip(docxEntries({ documentData, method, extra, withBinDefault }));
}

export function buildEmptyDocx() {
  const documentData = Buffer.from(documentXmlOf([]), 'utf8');
  return buildZip(docxEntries({ documentData, method: 'stored' })).buffer;
}

/** A valid DOCX whose total byte length is exactly `target` (stored filler entry, size computed). */
export function buildDocxOfExactSize(canary, target) {
  const FILLER = 'docProps/padding.bin';
  const probe = buildDocx(canary, {
    extra: [{ name: FILLER, data: Buffer.alloc(0), method: 'stored' }],
    withBinDefault: true,
  }).buffer.length;
  const n = target - probe;
  if (n < 0) throw new RangeError('target smaller than the empty-filler package');
  const out = buildDocx(canary, {
    extra: [{ name: FILLER, data: Buffer.alloc(n), method: 'stored' }],
    withBinDefault: true,
  }).buffer;
  if (out.length !== target) throw new Error(`exact-size build produced ${out.length}, wanted ${target}`);
  return out;
}

/** A DOCX around caller-supplied word/document.xml text (used for structures the plain builder cannot express). */
export function buildDocxFromXml(documentXml, { method = 'stored', extra = [], ctDefaults = '', docRelsExtra = '' } = {}) {
  return buildZip(docxEntries({ documentData: Buffer.from(documentXml, 'utf8'), method, extra, ctDefaults, docRelsExtra }));
}

const R_NS = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships';

/** A 1x1 RGB PNG built from scratch (signature, IHDR, IDAT, IEND with real CRCs). */
function tinyPng() {
  const chunk = (type, data) => {
    const t = Buffer.from(type, 'latin1');
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length);
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(crc32(Buffer.concat([t, data])));
    return Buffer.concat([len, t, data, crc]);
  };
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(1, 0);
  ihdr.writeUInt32BE(1, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // colour type: RGB
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(Buffer.from([0, 0x40, 0x80, 0xc0]))), // filter byte + one pixel
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

/**
 * A DOCX whose body contains a TABLE WITHOUT header cells (no w:tblHeader on the first row).
 * docxFidelity.preserveTables refuses that with FAIL('a table without explicit header
 * cells'): UnsupportedDocxStructureError, which the route maps to 422 with "nothing enters
 * Source custody". The canary is in an ordinary paragraph before the table.
 */
export function buildDocxWithTable(canary) {
  assertCanary(canary);
  const cell = (t) => `<w:tc><w:p><w:r><w:t>${esc(t)}</w:t></w:r></w:p></w:tc>`;
  const row = (a, b) => `<w:tr>${cell(a)}${cell(b)}</w:tr>`;
  const table =
    '<w:tbl><w:tblPr><w:tblW w:w="0" w:type="auto"/></w:tblPr><w:tblGrid><w:gridCol w:w="4680"/><w:gridCol w:w="4680"/></w:tblGrid>' +
    row('Spring tide', 'North jetty') +
    row('Neap tide', 'South jetty') +
    '</w:tbl>';
  const lead = `<w:p><w:r><w:t xml:space="preserve">${esc(prose(canary).chapters[0].paragraphs[1])}</w:t></w:r></w:p>`;
  return buildDocxFromXml(DOC_OPEN + lead + table + '<w:p><w:pPr/></w:p>' + DOC_CLOSE);
}

/**
 * A DOCX with an embedded picture (w:drawing -> a:blip r:embed -> word/media/image1.png).
 * mammoth renders it as an <img>, and docxFidelity.preserveDocxStructure refuses embedded
 * pictures with FAIL('embedded pictures or objects') -> 422. Whether mammoth emits the <img>
 * for THIS hand-written drawing was not run (mammoth is not available here): uncertain.
 */
export function buildDocxWithImage(canary) {
  assertCanary(canary);
  const ns = `xmlns:w="${W_NS}" xmlns:r="${R_NS}" xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"`;
  const drawing =
    '<w:p><w:r><w:drawing><wp:inline distT="0" distB="0" distL="0" distR="0"><wp:extent cx="95250" cy="95250"/><wp:docPr id="1" name="Picture 1"/>' +
    '<a:graphic><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:pic>' +
    '<pic:nvPicPr><pic:cNvPr id="0" name="image1.png"/><pic:cNvPicPr/></pic:nvPicPr>' +
    '<pic:blipFill><a:blip r:embed="rId2"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill>' +
    '<pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="95250" cy="95250"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr>' +
    '</pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing></w:r></w:p>';
  const lead = `<w:p><w:r><w:t xml:space="preserve">${esc(prose(canary).chapters[0].paragraphs[1])}</w:t></w:r></w:p>`;
  const xml = `${XML_DECL}<w:document ${ns}><w:body>${lead}${drawing}${DOC_CLOSE}`;
  return buildDocxFromXml(xml, {
    extra: [{ name: 'word/media/image1.png', data: tinyPng(), method: 'stored' }],
    ctDefaults: '<Default Extension="png" ContentType="image/png"/>',
    docRelsExtra: `<Relationship Id="rId2" Type="${R_NS}/image" Target="media/image1.png"/>`,
  });
}

/* ------------------------------------------------------------------------- *
 * EPUB builders
 * ------------------------------------------------------------------------- */

function xhtmlOf(title, blocksHtml) {
  return (
    `<?xml version="1.0" encoding="UTF-8"?>\n<html xmlns="http://www.w3.org/1999/xhtml"><head><title>${esc(title)}</title></head>` +
    `<body>${blocksHtml}</body></html>`
  );
}

/**
 * `padChapterBytes` (optional) adds a THIRD spine document, chapter3.xhtml, of EXACTLY that many
 * bytes (a short paragraph plus an XML comment of spaces, so it carries no extra text). It is
 * stored DEFLATED so the file stays small and chapter 1 keeps the canary raw-visible. The
 * parser's per-entry cap (EPUB_MAX_ENTRY_BYTES) applies to spine documents.
 */
export function buildEpub(canary, { drm = false, extra = [], padChapterBytes = null, bulkTextChars = null } = {}) {
  assertCanary(canary);
  if (padChapterBytes !== null && bulkTextChars !== null) throw new RangeError('padChapterBytes and bulkTextChars both add chapter3; pick one');
  const p = prose(canary);
  const b = (s) => Buffer.from(s, 'utf8');
  // A third spine document of ordinary ASCII paragraphs (single spaces, no inline markup, no canary) carrying about `bulkTextChars`
  // characters of extractable text. Deliberately plain, so the parser's text equals the tag-stripped text plus block separators
  // and no whitespace collapsing can shorten it. Deflated, so the file stays small on disk.
  const bulkChapter = () => {
    if (!Number.isInteger(bulkTextChars) || bulkTextChars < 1000) throw new RangeError('bulkTextChars must be an integer of at least 1000');
    const sentence = 'The lantern keepers of Marrow Reach counted the tides in silence and wrote the numbers on slate. ';
    const para = sentence.repeat(Math.ceil(1000 / sentence.length)).slice(0, 1000).replace(/ +$/, '');
    const n = Math.ceil(bulkTextChars / para.length);
    return xhtmlOf('Ledger', '<h2>Ledger</h2>' + `<p>${esc(para)}</p>`.repeat(n));
  };
  const chapter = (c, withTitle) =>
    xhtmlOf(c.heading, `${withTitle ? `<h1>${esc(p.title)}</h1>` : ''}<h2>${esc(c.heading)}</h2>` + c.paragraphs.map((t) => `<p>${esc(t)}</p>`).join(''));
  const paddedChapter = () => {
    const base = xhtmlOf('Appendix', '<h2>Appendix</h2><p>This appendix carries no further text.</p>');
    const at = base.lastIndexOf('</body>');
    const room = padChapterBytes - Buffer.byteLength(base);
    if (!Number.isInteger(padChapterBytes) || room < '<!---->'.length) throw new RangeError('padChapterBytes too small for the appendix chapter');
    const out = base.slice(0, at) + '<!--' + ' '.repeat(room - '<!---->'.length) + '-->' + base.slice(at);
    if (Buffer.byteLength(out) !== padChapterBytes) throw new Error('padded chapter is not the requested length');
    return out;
  };
  const withPad = padChapterBytes !== null || bulkTextChars !== null;
  const container =
    '<?xml version="1.0" encoding="UTF-8"?>\n<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">' +
    '<rootfiles><rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/></rootfiles></container>';
  const opf =
    '<?xml version="1.0" encoding="UTF-8"?>\n<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="bookid">' +
    '<metadata xmlns:dc="http://purl.org/dc/elements/1.1/">' +
    '<dc:identifier id="bookid">urn:uuid:00000000-0000-4000-8000-000000000001</dc:identifier>' +
    `<dc:title>${esc(p.title)}</dc:title><dc:language>en</dc:language>` +
    '<meta property="dcterms:modified">2026-01-01T00:00:00Z</meta></metadata>' +
    '<manifest>' +
    '<item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>' +
    '<item id="ch1" href="chapter1.xhtml" media-type="application/xhtml+xml"/>' +
    '<item id="ch2" href="chapter2.xhtml" media-type="application/xhtml+xml"/>' +
    (withPad ? '<item id="ch3" href="chapter3.xhtml" media-type="application/xhtml+xml"/>' : '') +
    `</manifest><spine><itemref idref="ch1"/><itemref idref="ch2"/>${withPad ? '<itemref idref="ch3"/>' : ''}</spine></package>`;
  const nav = xhtmlOf('Contents', '<nav><ol><li>Contents</li></ol></nav>');
  const encryption =
    '<?xml version="1.0" encoding="UTF-8"?>\n<encryption xmlns="urn:oasis:names:tc:opendocument:xmlns:container" xmlns:enc="http://www.w3.org/2001/04/xmlenc#">' +
    '<enc:EncryptedData><enc:EncryptionMethod Algorithm="http://www.w3.org/2001/04/xmlenc#aes128-cbc"/>' +
    '<enc:CipherData><enc:CipherReference URI="OEBPS/chapter1.xhtml"/></enc:CipherData></enc:EncryptedData></encryption>';
  const entries = [
    { name: 'mimetype', data: b('application/epub+zip'), method: 'stored' },
    { name: 'META-INF/container.xml', data: b(container), method: 'stored' },
    ...(drm ? [{ name: 'META-INF/encryption.xml', data: b(encryption), method: 'stored' }] : []),
    { name: 'OEBPS/content.opf', data: b(opf), method: 'stored' },
    { name: 'OEBPS/nav.xhtml', data: b(nav), method: 'stored' },
    { name: 'OEBPS/chapter1.xhtml', data: b(chapter(p.chapters[0], true)), method: 'stored' },
    { name: 'OEBPS/chapter2.xhtml', data: b(chapter(p.chapters[1], false)), method: 'stored' },
    ...(withPad ? [{ name: 'OEBPS/chapter3.xhtml', data: b(bulkTextChars !== null ? bulkChapter() : paddedChapter()), method: 'deflate' }] : []),
    ...extra,
  ];
  return buildZip(entries);
}

const EPUB_PAD_CHUNK = 8 * 1024 * 1024; // matches EPUB_MAX_ENTRY_BYTES on purpose: padding entries are never read, so the per-entry cap does not apply to them
let nulChunk = null;

/** An EPUB whose archive holds exactly `total` entries (empty stored entries outside the spine make up the difference). */
export function buildEpubWithEntryCount(canary, total) {
  const base = buildEpub(canary).entries.length;
  const n = total - base;
  if (!Number.isInteger(total) || n < 0) throw new RangeError('total entry count smaller than the plain EPUB');
  const extra = [];
  for (let i = 0; i < n; i++) extra.push({ name: `OEBPS/pad/e${String(i).padStart(5, '0')}.bin`, data: Buffer.alloc(0), method: 'stored' });
  const out = buildEpub(canary, { extra });
  if (out.entries.length !== total) throw new Error(`entry count build produced ${out.entries.length}, wanted ${total}`);
  return out;
}

/** An EPUB whose entries' DECLARED uncompressed sizes sum to EXACTLY `target` bytes (NUL padding outside the spine). */
export function buildEpubOfDeclaredTotal(canary, target) {
  const sum = (z) => z.entries.reduce((a, e) => a + e.usize, 0);
  let rest = target - sum(buildEpub(canary));
  if (!Number.isInteger(target) || rest < 0) throw new RangeError('target smaller than the plain EPUB');
  nulChunk ??= deflateBig(Buffer.alloc(EPUB_PAD_CHUNK));
  const extra = [];
  let i = 0;
  while (rest >= EPUB_PAD_CHUNK) {
    extra.push({ name: `OEBPS/pad/p${i++}.bin`, data: Buffer.alloc(0), method: 'deflate', precomputed: nulChunk });
    rest -= EPUB_PAD_CHUNK;
  }
  if (rest > 0) extra.push({ name: `OEBPS/pad/p${i}.bin`, data: Buffer.alloc(0), method: 'deflate', precomputed: deflateBig(Buffer.alloc(rest)) });
  const out = buildEpub(canary, { extra });
  if (sum(out) !== target) throw new Error(`declared-total build produced ${sum(out)}, wanted ${target}`);
  return out;
}

/* ------------------------------------------------------------------------- *
 * Zip bombs. Two shapes because the two parser paths guard differently:
 *   EPUB: package is valid; a 100 MiB NUL padding entry sits OUTSIDE the spine, so the
 *         declared-size guard (EPUB_MAX_TOTAL_BYTES) is what DECIDES the outcome (415).
 *         It does NOT bound the work: parseUpload loads the archive with
 *         JSZip.loadAsync(buffer, { checkCRC32: true, ... }), and jszip's load.js
 *         inflates every entry at load to verify its CRC32 -- BEFORE the guard line runs
 *         (probed on jszip 3.10.1: ~1 ms with checkCRC32 off, ~630 ms on for this file;
 *         the repo pins 3.10.2). So this fixture shows the refusal, never that the guard
 *         limits inflation; the resource cost of the CRC pass is real and unbounded by
 *         the guard. The same probe settles that jszip exposes `_data.uncompressedSize`
 *         on every entry, so the guard reads real sizes here (the source's `?? 0`
 *         fallback means a library that stopped exposing it would fail OPEN).
 *   DOCX: word/document.xml ITSELF expands to exactly 100 MiB (one run of ASCII
 *         '0', which keeps the XML well-formed). Nothing in parseUpload.ts bounds
 *         zip expansion for DOCX; the only cap is the 2,000,000-char text check,
 *         which runs AFTER the full expansion and conversion.
 * ------------------------------------------------------------------------- */

function deflateBig(buf) {
  return { crc: crc32(buf), usize: buf.length, payload: zlib.deflateRawSync(buf, { level: 9, chunkSize: 65536 }) };
}

let nulPadding = null; // canary-independent, so computed once per process (selfTest re-inflates and CRC-checks the OUTPUT)
let zeroCharDocument = null;

export function buildBombEpub(canary) {
  nulPadding ??= deflateBig(Buffer.alloc(BOMB_EXPANDED_BYTES)); // NUL bytes
  const pre = nulPadding;
  return buildEpub(canary, {
    extra: [{ name: 'OEBPS/padding.bin', data: Buffer.alloc(0), method: 'deflate', precomputed: pre }],
  });
}

const BOMB_DOC_HEAD = `${DOC_OPEN}<w:p><w:r><w:t xml:space="preserve">`;
const BOMB_DOC_TAIL = `</w:t></w:r></w:p>${DOC_CLOSE}`;

export function buildBombDocx() {
  if (!zeroCharDocument) {
    const head = Buffer.from(BOMB_DOC_HEAD, 'utf8');
    const tail = Buffer.from(BOMB_DOC_TAIL, 'utf8');
    const doc = Buffer.alloc(BOMB_EXPANDED_BYTES, 0x30); // ASCII '0'
    head.copy(doc, 0);
    tail.copy(doc, BOMB_EXPANDED_BYTES - tail.length);
    zeroCharDocument = deflateBig(doc);
  }
  const pre = zeroCharDocument;
  return buildZip(docxEntries({ documentData: null, method: 'stored', documentPrecomputed: pre }));
}

/* ------------------------------------------------------------------------- *
 * Fixture table
 * ------------------------------------------------------------------------- */

const MIME = {
  pdf: 'application/pdf',
  epub: 'application/epub+zip',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  md: 'text/markdown',
  txt: 'text/plain',
  rtf: 'application/rtf',
};

function textOfLength(canary, n) {
  const head = `${prose(canary, { ascii: true }).title}\n\nLedger mark: ${canary}\n\n`;
  const unit = prose(canary, { ascii: true })
    .chapters.flatMap((c) => c.paragraphs)
    .filter((t) => !t.includes(canary))
    .join('\n\n') + '\n\n';
  let s = head;
  while (s.length < n) s += unit;
  s = s.slice(0, n);
  if (s.length !== n || !s.startsWith(head)) throw new Error('textOfLength invariant broken');
  return Buffer.from(s, 'latin1'); // ASCII only: bytes === chars
}

/**
 * UTF-8 text of EXACTLY `units` UTF-16 code units whose bulk is astral (U+1F30A: 2 code
 * units, 1 code point, 4 UTF-8 bytes each). The ASCII pair above cannot tell the unit of
 * measure apart (units === bytes === code points there); this pair can:
 *   at  = 2,000,000 units, ~1,000,000 code points, ~4,000,000 bytes  (route: accept)
 *   over= 2,000,001 units, ~1,000,001 code points, ~4,000,000 bytes  (route: refuse 413)
 * A route that counted BYTES would refuse `at`; one that counted CODE POINTS would accept `over`.
 */
function astralTextOfUnits(canary, units) {
  const head = `${prose(canary, { ascii: true }).title}\n\nLedger mark: ${canary}\n\n`;
  const room = units - head.length;
  if (room < 2) throw new RangeError('units too small for the astral text');
  const s = head + '\u{1F30A}'.repeat(Math.floor(room / 2)) + 'x'.repeat(room % 2);
  if (s.length !== units || !s.startsWith(head)) throw new Error('astralTextOfUnits invariant broken');
  return Buffer.from(s, 'utf8');
}

const textWithBom = (canary) => Buffer.concat([Buffer.from([0xef, 0xbb, 0xbf]), Buffer.from(plainTextOf(canary), 'utf8')]);
/** Windows "Unicode" .txt: FF FE then UTF-16LE. Read as UTF-8 it yields U+0000 between letters. */
const textUtf16le = (canary) => Buffer.concat([Buffer.from([0xff, 0xfe]), Buffer.from(plainTextOf(canary), 'utf16le')]);
/** An otherwise ordinary text file with one NUL byte after the title line. */
function textWithNul(canary) {
  const t = plainTextOf(canary);
  const at = t.indexOf('\n\n');
  return Buffer.from(t.slice(0, at) + '\u0000' + t.slice(at), 'utf8');
}

function specs(canary, includeLarge) {
  const list = [
    {
      file: 'text-layer.pdf', kind: 'pdf-text-layer', mime: MIME.pdf, containsCanary: true,
      build: () => buildTextPdf(canary),
      expectedParse: 'accept', expectedStatusClass: '2xx', expectedStatus: 200, uncertain: false,
      note: 'Hand-written one-page PDF, uncompressed content stream, Helvetica Tj lines (ASCII). The canary sits inside a single Tj so extraction keeps it contiguous. Accepted by detectFormat(.pdf) -> pdf-parse; text well over the 20-chars-per-page scanned heuristic.',
    },
    {
      file: 'scanned.pdf', kind: 'pdf-scanned', mime: MIME.pdf, containsCanary: false,
      build: () => buildScannedPdf(),
      expectedParse: 'accept', expectedStatusClass: '5xx', expectedStatus: 503, uncertain: true,
      note: 'One image XObject page, no text operator, no font resource, no canary by design. parseUpload does NOT throw: it returns empty text plus the scanned-PDF warning. The route then calls recordArtifactArrival; encryptedLanding.commitEncryptedArrival refuses sourceText.length === 0 AFTER the ciphertext is written, which the route reports as SourceLandingIncompleteError -> 503 retryable. Inferred only: if pdf-parse returns whitespace-only text the length is non-zero and the outcome would be 2xx with the warning.',
    },
    {
      file: 'book.epub', kind: 'epub', mime: MIME.epub, containsCanary: true,
      build: () => buildEpub(canary).buffer,
      expectedParse: 'accept', expectedStatusClass: '2xx', expectedStatus: 200, uncertain: false,
      note: 'Valid EPUB 3 package: mimetype stored first, container.xml, OPF with manifest and spine, nav document, two XHTML chapters, all entries STORED so the canary is byte-visible.',
    },
    {
      file: 'book-drm.epub', kind: 'epub-drm', mime: MIME.epub, containsCanary: true,
      build: () => buildEpub(canary, { drm: true }).buffer,
      expectedParse: 'refuse', expectedStatusClass: '4xx', expectedStatus: 415, uncertain: false,
      note: 'Same package plus META-INF/encryption.xml declaring AES-128-CBC over a spine document. NOT real DRM: the chapter bytes stay plaintext (so a refused-but-landed upload would expose the canary); the marker is what the parser keys on. parseUpload throws UnsupportedUploadError for a CipherReference that targets a spine document or a non-font-obfuscation algorithm.',
    },
    {
      file: 'manuscript.docx', kind: 'docx', mime: MIME.docx, containsCanary: true,
      build: () => buildDocx(canary).buffer,
      expectedParse: 'accept', expectedStatusClass: '2xx', expectedStatus: 200, uncertain: false,
      note: 'Minimal OOXML: content types, rels, document.xml with Heading1/Heading2 styled paragraphs and body paragraphs, styles.xml. All parts STORED so the canary is byte-visible. No table, footnote, image or standalone quotation, so docxFidelity has nothing to refuse.',
    },
    {
      file: 'manuscript-deflated.docx', kind: 'docx-deflated', mime: MIME.docx, containsCanary: true,
      build: () => buildDocx(canary, { method: 'deflate' }).buffer,
      expectedParse: 'accept', expectedStatusClass: '2xx', expectedStatus: 200, uncertain: false,
      note: 'Same document with every part DEFLATED, as Word writes it. The canary is NOT in the raw bytes, so a scanner that only greps raw bytes is blind to it; use this to test whether a scanner decodes.',
    },
    {
      file: 'empty.docx', kind: 'docx-empty', mime: MIME.docx, containsCanary: false,
      build: () => buildEmptyDocx(),
      expectedParse: 'accept', expectedStatusClass: '5xx', expectedStatus: 503, uncertain: true,
      note: 'Valid package whose body is one empty paragraph: no w:t anywhere, no canary by design. parseUpload returns empty text plus "We could not find any text". Same downstream behaviour as scanned.pdf: commitEncryptedArrival refuses empty sourceText after the ciphertext landed -> 503 retryable. Inferred; mammoth was not run.',
    },
    {
      file: 'corrupt-truncated.docx', kind: 'zip-corrupt', mime: MIME.docx, containsCanary: true,
      build: () => {
        const z = buildDocx(canary);
        return z.buffer.subarray(0, z.cdOffset + Math.floor(z.cdSize / 2));
      },
      expectedParse: 'refuse', expectedStatusClass: '4xx', expectedStatus: 422, uncertain: false,
      note: 'A valid stored DOCX cut off in the middle of its central directory (end-of-central-directory record gone). Local entries survive, so the canary is still raw-visible. mammoth/jszip should throw a non-Unsupported* error, which the route maps to the generic 422.',
    },
    {
      file: 'zip-bomb.epub', kind: 'zip-bomb-epub', mime: MIME.epub, containsCanary: true,
      build: () => buildBombEpub(canary).buffer,
      expectedParse: 'refuse', expectedStatusClass: '4xx', expectedStatus: 415, uncertain: false,
      note: 'Valid EPUB package (its chapter text carries the canary) plus a 100 MiB NUL padding entry outside the spine (deflated to about 100 KB). Package otherwise parses, so the declared-size guard (EPUB_MAX_TOTAL_BYTES, 64 MiB) is what refuses it with 415. It does NOT run before inflation: parseUpload loads the archive with JSZip.loadAsync(checkCRC32: true), and jszip inflates every entry at load to verify its CRC32, so the full 100 MiB is inflated first (probed on jszip 3.10.1: ~1 ms with the option off, ~630 ms on). This fixture therefore shows the refusal outcome only; it cannot show that the guard bounds the work. jszip does expose entry._data.uncompressedSize on every entry (probed), so the guard reads real sizes here; the source falls back to 0 if it ever did not, which would fail open.',
    },
    {
      file: 'zip-bomb.docx', kind: 'zip-bomb-docx', mime: MIME.docx, containsCanary: false,
      build: () => buildBombDocx().buffer,
      expectedParse: 'refuse', expectedStatusClass: '4xx', expectedStatus: 413, uncertain: true,
      note: 'word/document.xml itself is exactly 100 MiB (one run of ASCII "0", well-formed). The DOCX path has no zip-expansion guard in parseUpload.ts, so mammoth would inflate and convert all of it; the first bound is the 2,000,000-char text cap (413) AFTER that work. Expected 413 only if the process survives the expansion; a crash or timeout is a different, worse outcome the source cannot rule out.',
    },
    {
      file: 'notes.md', kind: 'markdown', mime: MIME.md, containsCanary: true,
      build: () => Buffer.from(markdownOf(canary), 'utf8'),
      expectedParse: 'accept', expectedStatusClass: '2xx', expectedStatus: 200, uncertain: false,
      note: 'UTF-8 Markdown with # and ## headings and a few non-ASCII characters. Text formats are read verbatim (buffer.toString utf-8).',
    },
    {
      file: 'notes.txt', kind: 'text', mime: MIME.txt, containsCanary: true,
      build: () => Buffer.from(plainTextOf(canary), 'utf8'),
      expectedParse: 'accept', expectedStatusClass: '2xx', expectedStatus: 200, uncertain: false,
      note: 'UTF-8 plain text with a few non-ASCII characters.',
    },
    {
      file: 'text-at-limit.txt', kind: 'text-at-limit', mime: MIME.txt, containsCanary: true,
      build: () => textOfLength(canary, LIMITS.MAX_TEXT_CHARS),
      expectedParse: 'accept', expectedStatusClass: '2xx', expectedStatus: 200, uncertain: false,
      note: 'Exactly 2,000,000 ASCII characters. The route test is "length > 2,000,000", so this is the largest text accepted. Tiny in bytes, so it never touches the 25 MB gate. ASCII on purpose for the strict-versus-inclusive comparison only: UTF-16 length, byte length and code-point count are all equal here, so this pair CANNOT tell the unit of measure apart; text-astral-at-limit.txt / text-astral-over-limit.txt do that.',
    },
    {
      file: 'text-over-limit.txt', kind: 'text-over-limit', mime: MIME.txt, containsCanary: true,
      build: () => textOfLength(canary, LIMITS.MAX_TEXT_CHARS + 1),
      expectedParse: 'refuse', expectedStatusClass: '4xx', expectedStatus: 413, uncertain: false,
      note: 'Exactly 2,000,001 ASCII characters. parseUpload succeeds, then the route refuses with 413 before any custody call, so this must never reach the vault.',
    },
    {
      file: 'unsupported-format.rtf', kind: 'unsupported-format', mime: MIME.rtf, containsCanary: true,
      build: () => Buffer.from(rtfOf(canary), 'latin1'),
      expectedParse: 'refuse', expectedStatusClass: '4xx', expectedStatus: 415, uncertain: false,
      note: 'RTF is not an accepted format. Refused with 415 ONLY if sent as application/rtf: the MIME fallback accepts any text/* type, so a harness that sends text/rtf would get it read as plain text.',
    },
    {
      file: 'empty-file.txt', kind: 'empty-file', mime: MIME.txt, containsCanary: false,
      build: () => Buffer.alloc(0),
      expectedParse: 'refuse', expectedStatusClass: '4xx', expectedStatus: 400, uncertain: false,
      note: 'Zero bytes. The route refuses "File is empty" (400) before parsing.',
    },
    /* ---- text: unit of measure and neighbouring encoding classes ---- */
    {
      file: 'text-astral-at-limit.txt', kind: 'text-astral-at-limit', mime: MIME.txt, containsCanary: true,
      build: () => astralTextOfUnits(canary, LIMITS.MAX_TEXT_CHARS),
      expectedParse: 'accept', expectedStatusClass: '2xx', expectedStatus: 200, uncertain: false,
      note: 'UTF-8 text of exactly 2,000,000 UTF-16 code units, mostly U+1F30A (2 units, 1 code point, 4 bytes each): ~1,000,000 code points, ~4,000,000 bytes. The route measures result.text.length (UTF-16 units), so this is accepted. A route that counted BYTES would refuse it (4,000,000 > 2,000,000), which is what this fixture exists to catch.',
    },
    {
      file: 'text-astral-over-limit.txt', kind: 'text-astral-over-limit', mime: MIME.txt, containsCanary: true,
      build: () => astralTextOfUnits(canary, LIMITS.MAX_TEXT_CHARS + 1),
      expectedParse: 'refuse', expectedStatusClass: '4xx', expectedStatus: 413, uncertain: false,
      note: 'The same text one UTF-16 unit longer: 2,000,001 units but only ~1,000,001 code points. Refused 413 because the unit is UTF-16 length. A route that counted CODE POINTS would accept it (1,000,001 < 2,000,000), which is what this fixture exists to catch.',
    },
    {
      file: 'text-utf8-bom.txt', kind: 'text-utf8-bom', mime: MIME.txt, containsCanary: true,
      build: () => textWithBom(canary),
      expectedParse: 'accept', expectedStatusClass: '2xx', expectedStatus: 200, uncertain: false,
      note: 'UTF-8 text with a leading byte-order mark. buffer.toString("utf-8") keeps U+FEFF as the first character, so the stored Source text begins with it and is one character longer than the visible text. Nothing in the route strips it.',
    },
    {
      file: 'text-utf16le.txt', kind: 'text-utf16le', mime: MIME.txt, containsCanary: true,
      build: () => textUtf16le(canary),
      expectedParse: 'accept', expectedStatusClass: '5xx', expectedStatus: 503, uncertain: true,
      note: 'A Windows "Unicode" text file: FF FE then UTF-16LE. The route reads every text file as UTF-8, so the result is U+FFFD U+FFFD followed by every letter separated by U+0000. The canary is in the body but NOT contiguous in the raw bytes (a raw-byte scanner is blind to it; it must decode UTF-16). Inferred, not run: source_text is a Postgres text column (migration 20260824000001), which cannot hold U+0000, so the arrival INSERT is expected to fail AFTER the ciphertext landed -> SourceLandingIncompleteError -> 503. If anything upstream stripped NULs the outcome would be 2xx with garbled text.',
    },
    {
      file: 'text-with-nul.txt', kind: 'text-with-nul', mime: MIME.txt, containsCanary: true,
      build: () => textWithNul(canary),
      expectedParse: 'accept', expectedStatusClass: '5xx', expectedStatus: 503, uncertain: true,
      note: 'Ordinary UTF-8 text with a single NUL byte after the title. parseUpload returns it verbatim (it never looks at content). Inferred, not run: Postgres text cannot hold a NUL, so the arrival INSERT is expected to fail after the ciphertext landed -> 503, the same family as scanned.pdf. The route performs no content validation before custody.',
    },
    /* ---- docx: structures the custody law refuses (UnsupportedDocxStructureError -> 422, nothing enters Source custody) ---- */
    {
      file: 'docx-table-no-header.docx', kind: 'docx-table-no-header', mime: MIME.docx, containsCanary: true,
      build: () => buildDocxWithTable(canary).buffer,
      expectedParse: 'refuse', expectedStatusClass: '4xx', expectedStatus: 422, uncertain: true,
      note: 'A two-row table whose first row carries no w:tblHeader. mammoth renders its cells as <td>, and docxFidelity.preserveTables refuses with FAIL("a table without explicit header cells"): UnsupportedDocxStructureError -> 422, before any custody call. mammoth was not run, and whether it emits <td> or <th> for the first row of a table with no w:tblHeader is library behaviour the source does not settle. If it emitted <th>, the table would be PRESERVED as a Markdown grid and the outcome would be 2xx with a table warning.',
    },
    {
      file: 'docx-embedded-image.docx', kind: 'docx-embedded-image', mime: MIME.docx, containsCanary: true,
      build: () => buildDocxWithImage(canary).buffer,
      expectedParse: 'refuse', expectedStatusClass: '4xx', expectedStatus: 422, uncertain: true,
      note: 'A paragraph plus an inline picture (w:drawing -> a:blip -> word/media/image1.png, a 1x1 PNG). mammoth is expected to render an <img>, and docxFidelity.preserveDocxStructure refuses embedded pictures with FAIL("embedded pictures or objects") -> 422. Not run: if mammoth did not emit an <img> for this hand-written drawing the outcome would be 2xx with only the text.',
    },
    /* ---- epub: boundary pairs for the three parser guards (strict ">" in each) ---- */
    {
      file: 'epub-entries-at-cap.epub', kind: 'epub-entries-at-cap', mime: MIME.epub, containsCanary: true,
      build: () => buildEpubWithEntryCount(canary, LIMITS.EPUB_MAX_ENTRIES).buffer,
      expectedParse: 'accept', expectedStatusClass: '2xx', expectedStatus: 200, uncertain: false,
      note: 'A valid EPUB whose archive holds exactly 2,000 entries (EPUB_MAX_ENTRIES), the extras being empty stored files outside the spine. The guard is "entries.length > 2000", so this is the most entries admitted.',
    },
    {
      file: 'epub-entries-over-cap.epub', kind: 'epub-entries-over-cap', mime: MIME.epub, containsCanary: true,
      build: () => buildEpubWithEntryCount(canary, LIMITS.EPUB_MAX_ENTRIES + 1).buffer,
      expectedParse: 'refuse', expectedStatusClass: '4xx', expectedStatus: 415, uncertain: false,
      note: 'The same package with 2,001 entries: one over. UnsupportedUploadError "too many internal files" -> 415.',
    },
    {
      file: 'epub-total-at-cap.epub', kind: 'epub-total-at-cap', mime: MIME.epub, containsCanary: true,
      build: () => buildEpubOfDeclaredTotal(canary, LIMITS.EPUB_MAX_TOTAL_BYTES).buffer,
      expectedParse: 'accept', expectedStatusClass: '2xx', expectedStatus: 200, uncertain: false,
      note: 'A valid EPUB whose entries declare exactly 67,108,864 uncompressed bytes in total (EPUB_MAX_TOTAL_BYTES), made up with NUL padding entries outside the spine. The guard is "knownTotal > 64 MiB", so this is the largest total admitted. Small on disk (deflated padding); jszip still inflates it at load for the CRC check.',
    },
    {
      file: 'epub-total-over-cap.epub', kind: 'epub-total-over-cap', mime: MIME.epub, containsCanary: true,
      build: () => buildEpubOfDeclaredTotal(canary, LIMITS.EPUB_MAX_TOTAL_BYTES + 1).buffer,
      expectedParse: 'refuse', expectedStatusClass: '4xx', expectedStatus: 415, uncertain: false,
      note: 'The same package declaring 67,108,865 bytes: one over. "expands beyond the safe local review limit" -> 415.',
    },
    {
      file: 'epub-chapter-at-cap.epub', kind: 'epub-chapter-at-cap', mime: MIME.epub, containsCanary: true,
      build: () => buildEpub(canary, { padChapterBytes: LIMITS.EPUB_MAX_ENTRY_BYTES }).buffer,
      expectedParse: 'accept', expectedStatusClass: '2xx', expectedStatus: 200, uncertain: true,
      note: 'A valid EPUB with a third spine document of exactly 8,388,608 bytes (EPUB_MAX_ENTRY_BYTES): a short paragraph plus an 8 MiB XML comment of spaces (deflated, so ~10 KB on disk). The per-entry guard is "size > 8 MiB", so this is the largest spine document admitted. Uncertain only because accepting it also needs xmldom to parse an 8 MiB document within the route time limit, which was not run.',
    },
    {
      file: 'epub-chapter-over-cap.epub', kind: 'epub-chapter-over-cap', mime: MIME.epub, containsCanary: true,
      build: () => buildEpub(canary, { padChapterBytes: LIMITS.EPUB_MAX_ENTRY_BYTES + 1 }).buffer,
      expectedParse: 'refuse', expectedStatusClass: '4xx', expectedStatus: 415, uncertain: false,
      note: 'The same package with that spine document one byte over: "One EPUB chapter is unexpectedly large" -> 415. The per-entry guard applies to the container, package document and spine documents only; padding entries are never read, so it does not apply to them.',
    },
    {
      file: 'epub-text-over-cap.epub', kind: 'epub-text-over-cap', mime: MIME.epub, containsCanary: true,
      build: () => buildEpub(canary, { bulkTextChars: Math.round(EPUB_TEXT_CAP * 1.15) }).buffer,
      expectedParse: 'refuse', expectedStatusClass: '4xx', expectedStatus: 415, uncertain: true,
      note: 'A valid EPUB whose third spine document holds about 2,300,000 characters of plain ASCII paragraphs (15 percent over EPUB_MAX_TEXT_CHARS, 2,000,000), about 20 KB on disk because it is deflated. This is a FOURTH EPUB guard, separate from the entry, total and per-document size guards: extractEpubText throws UnsupportedUploadError ("more than 2 MB of editable text") -> 415, whereas the same amount of text in a .txt reaches the route\'s own cap and gets 413. The refusal comes only after xmldom has parsed the 2.3 MB chapter, so the outcome is uncertain:true (it hinges on that library finishing). The margin is deliberately wide: the exact boundary (the parser\'s text is the blocks joined with blank lines, plus heading markers) was read from source, not run, so NO at-cap / over-cap pair is offered; the constant and the guard are pinned by the source anchors instead.',
    },
  ];
  if (includeLarge) {
    list.push(
      {
        file: 'limit-exact-26214400.docx', kind: 'docx-size-limit-exact', mime: MIME.docx, containsCanary: true,
        build: () => buildDocxOfExactSize(canary, LIMITS.MAX_FILE_BYTES),
        expectedParse: 'accept', expectedStatusClass: '2xx', expectedStatus: 200, uncertain: false,
        note: 'Valid DOCX padded with a stored filler entry to exactly 26214400 bytes. The route test is "size > MAX_FILE_BYTES", so this is the largest file admitted. The multipart envelope adds bytes on the wire; no transport limit was found below that.',
      },
      {
        file: 'limit-over-26214401.docx', kind: 'docx-size-limit-over', mime: MIME.docx, containsCanary: true,
        build: () => buildDocxOfExactSize(canary, LIMITS.MAX_FILE_BYTES + 1),
        expectedParse: 'refuse', expectedStatusClass: '4xx', expectedStatus: 413, uncertain: false,
        note: 'Same package at exactly 26214401 bytes: one byte over. Refused 413 before the body is parsed or any custody call.',
      },
    );
  }
  return list;
}

/* ------------------------------------------------------------------------- *
 * Generation
 * ------------------------------------------------------------------------- */

export function generateFixturesSync(outDir, { canary, includeLarge = false, overwrite = false } = {}) {
  if (typeof outDir !== 'string' || outDir.length === 0) throw new TypeError('outDir must be a non-empty string');
  const c = assertCanary(canary ?? makeCanary());
  const dir = path.resolve(outDir);
  if (fs.existsSync(dir) && !fs.statSync(dir).isDirectory()) throw new Error('outDir exists and is not a directory');
  fs.mkdirSync(dir, { recursive: true });
  const manifest = [];
  for (const s of specs(c, includeLarge)) {
    const buf = s.build();
    const full = path.join(dir, s.file);
    if (path.dirname(full) !== dir) throw new Error('fixture escaped outDir');
    fs.writeFileSync(full, buf, { flag: overwrite ? 'w' : 'wx' }); // 'wx': never clobber a file we did not make
    const bytes = fs.statSync(full).size;
    if (bytes !== buf.length) throw new Error(`short write for ${s.file}`);
    manifest.push({
      name: s.file,
      path: full,
      kind: s.kind,
      bytes,
      sha256: crypto.createHash('sha256').update(buf).digest('hex'),
      containsCanary: s.containsCanary,
      expectedParse: s.expectedParse,
      expectedStatusClass: s.expectedStatusClass,
      basis: 'inferred-from-source',
      note: s.note,
      // additive fields
      mime: s.mime,
      expectedStatus: s.expectedStatus,
      uncertain: s.uncertain,
      canaryInRawBytes: buf.includes(c),
    });
  }
  return manifest;
}

/** @returns {Promise<object[]>} manifest entries, one per fixture written into outDir. */
export async function generateFixtures(outDir, opts = {}) {
  return generateFixturesSync(outDir, opts);
}

/* ------------------------------------------------------------------------- *
 * Independent verifiers (exported so other modules can reuse them)
 * ------------------------------------------------------------------------- */

const SMALL_ENTRY = 30 * 1024 * 1024;

export function zipEntryText(zipBuf, name, opts) {
  const z = readZip(zipBuf);
  const e = z.byName.get(name);
  if (!e) throw new ZipError(`missing entry ${name}`);
  return readEntry(zipBuf, e, opts).toString('utf8');
}

/**
 * Text of every w:t in word/document.xml ONLY, joined by newlines. This is the main body and
 * nothing else: a canary in comments, footnotes, endnotes, headers, footers, field codes
 * (w:instrText), deleted text (w:delText), text boxes or document properties is INVISIBLE
 * to it. A leak scanner must NOT use this to decide a canary is absent; use
 * `zipEntriesContaining` (any entry, decoded) and `docxTextParts` (every text element in
 * every part) for that.
 */
export function docxBodyText(zipBuf) {
  const xml = zipEntryText(zipBuf, 'word/document.xml');
  const out = [];
  const re = /<w:t(?:\s[^>]*)?>([^<]*)<\/w:t>/g;
  let m;
  while ((m = re.exec(xml)) !== null) out.push(decodeXmlEntities(m[1]));
  return out.join('\n');
}

/**
 * Names of the zip entries whose DECODED (inflated) bytes contain `needle`, so a deflated
 * entry is searched too. Entries over `maxEntry` bytes are not inflated and are counted in
 * `skipped`: absence is only established for the entries that were actually read, so a
 * caller must treat `skipped > 0` as "not exhaustive". Content-free: names and counts only.
 */
export function zipEntriesContaining(zipBuf, needle, { maxEntry = SMALL_ENTRY } = {}) {
  const z = readZip(zipBuf);
  const n = Buffer.isBuffer(needle) ? needle : Buffer.from(String(needle), 'utf8');
  if (n.length === 0) throw new RangeError('empty needle');
  const found = [];
  let skipped = 0;
  for (const e of z.entries) {
    if (e.usize > maxEntry) {
      skipped++;
      continue;
    }
    if (readEntry(zipBuf, e, { maxOutput: maxEntry }).includes(n)) found.push(e.name);
  }
  return { found, skipped, entries: z.entries.length };
}

/**
 * Text carried by every text-bearing element (w:t, w:delText, w:instrText, DrawingML a:t,
 * math m:t) in every XML part of a DOCX, per part. A canary split across separate runs is not
 * joined. Parts over `maxEntry` bytes are counted in `skipped`, not read.
 */
export function docxTextParts(zipBuf, { maxEntry = SMALL_ENTRY } = {}) {
  const z = readZip(zipBuf);
  const parts = [];
  let skipped = 0;
  for (const e of z.entries) {
    if (!/\.(xml|rels)$/i.test(e.name)) continue;
    if (e.usize > maxEntry) {
      skipped++;
      continue;
    }
    const xml = readEntry(zipBuf, e, { maxOutput: maxEntry }).toString('utf8');
    const out = [];
    for (const m of xml.matchAll(/<((?:w|a|m):(?:t|delText|instrText))(?:\s[^>]*)?>([^<]*)<\/\1>/g)) out.push(decodeXmlEntities(m[2]));
    parts.push({ part: e.name, text: out.join('\n') });
  }
  return { parts, skipped };
}

/** Text of the spine documents, tags stripped. Reads container -> OPF -> spine. */
export function epubBodyText(zipBuf) {
  const z = readZip(zipBuf);
  const container = zipEntryText(zipBuf, 'META-INF/container.xml');
  const rootPath = /full-path="([^"]+)"/.exec(container)?.[1];
  if (!rootPath) throw new ZipError('container names no package');
  const opf = zipEntryText(zipBuf, rootPath);
  const manifest = new Map();
  for (const m of opf.matchAll(/<item\s+([^>]*?)\/>/g)) {
    const id = /\bid="([^"]+)"/.exec(m[1])?.[1];
    const href = /\bhref="([^"]+)"/.exec(m[1])?.[1];
    if (id && href) manifest.set(id, href);
  }
  const dir = path.posix.dirname(rootPath);
  const out = [];
  for (const m of opf.matchAll(/<itemref\s+idref="([^"]+)"/g)) {
    const href = manifest.get(m[1]);
    if (!href) throw new ZipError('spine idref missing from manifest');
    const target = path.posix.normalize(path.posix.join(dir, href));
    if (!z.byName.has(target)) throw new ZipError('spine target missing from archive');
    out.push(decodeXmlEntities(zipEntryText(zipBuf, target).replace(/<[^>]+>/g, ' ')));
  }
  return out.join('\n');
}

const PDF_MAX_INFLATE = 32 * 1024 * 1024;
const PDF_STR = String.raw`\((?:\\[\s\S]|[^\\()])*\)`;
const PDF_SHOW = new RegExp(
  String.raw`\[((?:${PDF_STR}|<[0-9A-Fa-f\s]*>|[^\]()<])*)\]\s*TJ` + // group 1: a TJ array
    String.raw`|(${PDF_STR})\s*(?:Tj|'|")` + // group 2: a literal string shown by Tj, ' or "
    String.raw`|<([0-9A-Fa-f\s]*)>\s*(?:Tj|')`, // group 3: a hex string shown by Tj or '
  'g',
);

function pdfUnescape(inner) {
  return inner.replace(/\\([nrtbf()\\]|[0-7]{1,3})/g, (_, g) => {
    if (/^[0-7]+$/.test(g)) return String.fromCharCode(parseInt(g, 8));
    return { n: '\n', r: '\r', t: '\t', b: '\b', f: '\f' }[g] ?? g;
  });
}

/** Every `stream ... endstream` body with the object dictionary text that precedes it. Byte offsets are 1:1 with the latin1 string. */
function pdfStreams(buf) {
  const s = buf.toString('latin1');
  const streams = [];
  const re = /stream\r?\n/g;
  let m;
  while ((m = re.exec(s)) !== null) {
    if (!/>>\s*$/.test(s.slice(Math.max(0, m.index - 16), m.index))) continue; // `endstream` and prose are not stream starts
    const objAt = s.lastIndexOf(' obj', m.index);
    const dict = s.slice(objAt >= 0 ? objAt : Math.max(0, m.index - 600), m.index);
    const start = m.index + m[0].length;
    const e = s.indexOf('endstream', start);
    const bodyEnd = e < 0 ? s.length : e;
    // A direct /Length is the truth (a deflate stream may legitimately end in 0x0A); an indirect one falls back to trimming one EOL.
    const lm = /\/Length\s+(\d+)(?!\d)(?!\s+\d+\s+R)/.exec(dict);
    let dataEnd = bodyEnd; // an unterminated stream (no endstream) is read to the end of the file, never trusted to its /Length
    if (e >= 0) {
      if (lm && start + Number(lm[1]) <= bodyEnd) dataEnd = start + Number(lm[1]);
      else if (s.slice(bodyEnd - 2, bodyEnd) === '\r\n') dataEnd = bodyEnd - 2;
      else if (s[bodyEnd - 1] === '\n' || s[bodyEnd - 1] === '\r') dataEnd = bodyEnd - 1;
    }
    streams.push({ dict, start, end: bodyEnd, raw: buf.subarray(start, Math.max(start, dataEnd)) });
    re.lastIndex = bodyEnd;
  }
  return { text: s, streams };
}

function classifyPdfStream(st) {
  if (/\/Type\s*\/XRef\b/.test(st.dict)) return { kind: 'xref' };
  if (/\/Subtype\s*\/Image\b/.test(st.dict)) return { kind: 'image' };
  const f = /\/Filter\s*(\[[^\]]*\]|\/[A-Za-z0-9]+)/.exec(st.dict);
  const filters = f ? [...f[1].matchAll(/\/([A-Za-z0-9]+)/g)].map((x) => x[1]) : [];
  const kind = /\/Type\s*\/ObjStm\b/.test(st.dict) ? 'objstm' : 'content';
  if (filters.length === 0) return { kind, data: st.raw };
  if (filters.length === 1 && (filters[0] === 'FlateDecode' || filters[0] === 'Fl')) {
    try {
      return { kind, data: zlib.inflateSync(st.raw, { maxOutputLength: PDF_MAX_INFLATE }) };
    } catch {
      return { kind: 'undecodable', filters };
    }
  }
  return { kind: 'undecodable', filters };
}

/**
 * Fonts whose character codes do NOT map to the characters a literal string spells: composite
 * (Type0 / CID) and Type3 fonts, Identity CMaps, ToUnicode maps and `/Differences` re-mappings.
 * In a PDF using one, the bytes inside `( ... ) Tj` are codes, not text, so what poppler or a
 * viewer shows can differ from the literal (probed: `/Differences [65 /B]` makes `(A) Tj` show
 * "B"). A PDF mentioning any of them is never called exact. Deliberately over-inclusive: a false
 * positive only withholds a positive "no text" claim, which is the safe direction.
 */
const PDF_OPAQUE_FONT = /\/Subtype\s*\/(?:Type0|Type3|CIDFontType0|CIDFontType2)\b|\/ToUnicode\b|\/Differences\b|\/Identity-[HV]\b|\/CIDSystemInfo\b/;

/**
 * What this module can and cannot say about a PDF's text. Reads plain and FlateDecode
 * content streams, `Tj` / `'` / `"` and `TJ` array operators. It does NOT decode other
 * filters (LZW, ASCII85, ...), hex-string operands (glyph codes, not text), encryption or
 * font encodings that remap codes (see PDF_OPAQUE_FONT), and it never claims to: each of
 * those clears `exact`.
 *   runs      the shown strings, in order (TJ arrays joined into one run per array). A
 *             string split across SEPARATE show operators is not joined, so a needle can be
 *             split across two runs: search joined runs AND consult `exact`.
 *   machinery text-showing operators or a font resource were seen
 *   streams   counts by class; `undecodable` are non-image streams that could not be read
 *   opaqueFontEncoding  a font that remaps character codes was seen (clears `exact`)
 *   exact     every non-image stream was read, no hex operands, not encrypted, no code-remapping
 *             font. ONLY an exact analysis lets an empty `runs` (or a canary missing from it)
 *             mean "no text" / "not in the text layer".
 */
export function analyzePdf(buf) {
  const { text, streams } = pdfStreams(buf);
  const counts = { total: streams.length, images: 0, content: 0, objstm: 0, xref: 0, undecodable: 0 };
  const units = [];
  let blanked = '';
  let at = 0;
  for (const st of streams) {
    blanked += text.slice(at, st.start) + ' ';
    at = st.end;
    const c = classifyPdfStream(st);
    if (c.kind === 'image') counts.images++;
    else if (c.kind === 'xref') counts.xref++;
    else if (c.kind === 'undecodable') counts.undecodable++;
    else {
      counts[c.kind]++;
      units.push({ kind: c.kind, s: c.data.toString('latin1') });
    }
  }
  blanked += text.slice(at);
  units.push({ kind: 'content', s: blanked }); // text outside any stream: invalid in a real PDF, but a hand-made file may do it
  const runs = [];
  let hex = 0;
  let machinery = false;
  let opaqueFont = false;
  for (const u of units) {
    if (PDF_OPAQUE_FONT.test(u.s)) opaqueFont = true; // object streams and text outside streams included: a font dictionary may live in either
    if (u.kind === 'content') {
      if (/\b(?:BT|ET|Tj|TJ|Tf)\b/.test(u.s)) machinery = true;
      for (const m of u.s.matchAll(PDF_SHOW)) {
        if (m[1] !== undefined) {
          runs.push([...m[1].matchAll(new RegExp(PDF_STR, 'g'))].map((x) => pdfUnescape(x[0].slice(1, -1))).join(''));
          hex += (m[1].match(/<[0-9A-Fa-f\s]*>/g) ?? []).length;
        } else if (m[2] !== undefined) runs.push(pdfUnescape(m[2].slice(1, -1)));
        else hex++;
      }
    }
    if (/\/Type\s*\/Font\b|\/Font\s*<</.test(u.s)) machinery = true;
  }
  const encrypted = /\/Encrypt\b/.test(blanked);
  return {
    runs,
    machinery,
    streams: counts,
    hexShowOperands: hex,
    encrypted,
    opaqueFontEncoding: opaqueFont,
    exact: counts.undecodable === 0 && hex === 0 && !encrypted && !opaqueFont,
  };
}

/**
 * Strings shown by `Tj`, `'`, `"` and `TJ` operators in plain and FlateDecode content
 * streams, in order. [] means NONE WERE FOUND; it means "no extractable text" only when
 * `analyzePdf(buf).exact` is true (other filters, hex operands and encryption are not read).
 */
export function pdfTextRuns(buf) {
  return analyzePdf(buf).runs;
}

/**
 * True if the PDF may carry text-showing machinery: operators or a font resource in any
 * readable stream or outside streams, OR any non-image stream this module could not decode
 * (it errs toward true because it cannot rule the machinery out). False is therefore a
 * positive statement only for a PDF whose analysis is `exact`.
 */
export function pdfHasTextMachinery(buf) {
  const a = analyzePdf(buf);
  return a.machinery || a.streams.undecodable > 0 || a.encrypted;
}

/** The pre-repair behaviours, kept ONLY as negative controls for the self-test (not exported). */
function legacyPdfTextRuns(buf) {
  const s = buf.toString('latin1');
  const runs = [];
  const re = /\(((?:\\[\s\S]|[^\\()])*)\)\s*Tj/g;
  let m;
  while ((m = re.exec(s)) !== null) runs.push(pdfUnescape(m[1]));
  return runs;
}
function legacyPdfHasTextMachinery(buf) {
  const s = buf.toString('latin1');
  return /\b(?:BT|ET|Tj|TJ|Tf)\b/.test(s) || /\/Type\s*\/Font\b/.test(s) || /\/Font\s*<</.test(s);
}

/** Verify xref offsets point at "N 0 obj" and startxref points at "xref". */
export function checkPdfStructure(buf) {
  const problems = [];
  const s = buf.toString('latin1');
  if (!s.startsWith('%PDF-1.')) problems.push('no PDF header');
  if (!s.endsWith('%%EOF\n')) problems.push('no EOF marker');
  const sx = /startxref\n(\d+)\n%%EOF\n$/.exec(s);
  if (!sx) problems.push('no startxref');
  else {
    const at = Number(sx[1]);
    if (s.slice(at, at + 5) !== 'xref\n') problems.push('startxref does not point at xref');
    else {
      const hdr = /^xref\n0 (\d+)\n/.exec(s.slice(at));
      if (!hdr) problems.push('bad xref header');
      else {
        const n = Number(hdr[1]);
        let p = at + hdr[0].length;
        for (let i = 0; i < n; i++, p += 20) {
          const line = s.slice(p, p + 20);
          if (!/^\d{10} \d{5} [nf] \n$/.test(line)) {
            problems.push(`bad xref entry ${i}`);
            continue;
          }
          if (i > 0 && s.slice(Number(line.slice(0, 10)), Number(line.slice(0, 10)) + `${i} 0 obj`.length) !== `${i} 0 obj`) {
            problems.push(`xref entry ${i} does not point at its object`);
          }
        }
      }
    }
  }
  if (!/\/Root\s+1\s+0\s+R/.test(s)) problems.push('trailer has no Root');
  return { ok: problems.length === 0, problems };
}

/** Structural check of an EPUB zip against what parseUpload.ts reads. */
export function checkEpubStructure(zipBuf) {
  const problems = [];
  let z;
  try {
    z = readZip(zipBuf);
  } catch (e) {
    return { ok: false, problems: [`unreadable zip: ${e.message}`] };
  }
  const first = z.entries[0];
  if (!first || first.name !== 'mimetype') problems.push('mimetype is not the first entry');
  else {
    if (first.method !== 0) problems.push('mimetype is not stored');
    if (readEntry(zipBuf, first).toString('utf8') !== 'application/epub+zip') problems.push('mimetype content wrong');
  }
  try {
    const container = zipEntryText(zipBuf, 'META-INF/container.xml');
    if (!isWellFormedXml(container).ok) problems.push('container.xml not well-formed');
    const rootPath = /full-path="([^"]+)"/.exec(container)?.[1];
    if (!rootPath || !z.byName.has(rootPath)) problems.push('container points at a missing package');
    else {
      const opf = zipEntryText(zipBuf, rootPath);
      if (!isWellFormedXml(opf).ok) problems.push('package document not well-formed');
      const dir = path.posix.dirname(rootPath);
      const ids = new Map();
      for (const m of opf.matchAll(/<item\s+([^>]*?)\/>/g)) {
        const id = /\bid="([^"]+)"/.exec(m[1])?.[1];
        const href = /\bhref="([^"]+)"/.exec(m[1])?.[1];
        if (id && href) {
          ids.set(id, href);
          const target = path.posix.normalize(path.posix.join(dir, href));
          if (!z.byName.has(target)) problems.push(`manifest item ${id} has no archive entry`);
          else if (/\.x?html$/.test(target) && !isWellFormedXml(zipEntryText(zipBuf, target)).ok) problems.push(`${target} not well-formed`);
        }
      }
      const refs = [...opf.matchAll(/<itemref\s+idref="([^"]+)"/g)].map((m) => m[1]);
      if (refs.length === 0) problems.push('empty spine');
      for (const r of refs) if (!ids.has(r)) problems.push(`spine idref ${r} not in manifest`);
    }
  } catch (e) {
    problems.push(`structure read failed: ${e.message}`);
  }
  return { ok: problems.length === 0, problems };
}

/** Structural check of a DOCX zip against what mammoth reads. */
export function checkDocxStructure(zipBuf) {
  const problems = [];
  let z;
  try {
    z = readZip(zipBuf);
  } catch (e) {
    return { ok: false, problems: [`unreadable zip: ${e.message}`] };
  }
  for (const need of ['[Content_Types].xml', '_rels/.rels', 'word/document.xml']) {
    if (!z.byName.has(need)) problems.push(`missing ${need}`);
  }
  for (const xmlName of ['[Content_Types].xml', '_rels/.rels', 'word/_rels/document.xml.rels', 'word/styles.xml']) {
    if (z.byName.has(xmlName) && !isWellFormedXml(zipEntryText(zipBuf, xmlName)).ok) problems.push(`${xmlName} not well-formed`);
  }
  const doc = z.byName.get('word/document.xml');
  if (doc && doc.usize <= SMALL_ENTRY && !isWellFormedXml(readEntry(zipBuf, doc).toString('utf8')).ok) {
    problems.push('word/document.xml not well-formed');
  }
  if (z.byName.has('_rels/.rels') && !/Target="word\/document\.xml"/.test(zipEntryText(zipBuf, '_rels/.rels'))) {
    problems.push('package rels do not point at word/document.xml');
  }
  return { ok: problems.length === 0, problems };
}

/** Decoded body text for kinds this module can decode; null when it cannot (corrupt, bombs). */
export function decodedBodyText(kind, buf) {
  if (kind === 'pdf-text-layer' || kind === 'pdf-scanned') return pdfTextRuns(buf).join('\n');
  if (/^docx(-|$)/.test(kind)) return docxBodyText(buf); // main body only: see the docxBodyText doc
  if (kind === 'epub' || /^epub-/.test(kind) || kind === 'zip-bomb-epub') return epubBodyText(buf);
  if (kind === 'text-utf16le') return buf.subarray(2).toString('utf16le'); // the route would read it as UTF-8; the AUTHOR's text is UTF-16
  if (kind === 'markdown' || kind === 'text' || kind.startsWith('text-') || kind === 'unsupported-format' || kind === 'empty-file') return buf.toString('utf8');
  return null;
}

/* ------------------------------------------------------------------------- *
 * Source anchoring: the numbers, statuses, guards and orderings the expectations rest on,
 * re-read from the COMMENT-STRIPPED source (lib/strip.mjs), never from raw text.
 *
 * Why stripped: a raw grep matches a commented-out declaration or a commented-out check and
 * calls it live (`// was: const MAX_FILE_BYTES = 25 * 1024 * 1024;` above the real, changed
 * line; `/* input.sourceText.length === 0 || *\/` around a disabled gate). stripComments
 * blanks comments in place, so offsets and line structure survive.
 *
 * What this is NOT: static text analysis. It cannot see behaviour. It pins the SHAPE of the
 * code the expectations were read from; a shape that no longer matches is reported as drift
 * and the expectation must be re-derived by a person. Drift is a prompt to re-read, not a
 * verdict that the expectation is wrong.
 * ------------------------------------------------------------------------- */

/** Source files the expectations were read from, relative to the repository root. */
export const SOURCE_FILES = Object.freeze({
  route: 'app/api/sovereign/manuscripts/ingest/route.ts',
  parse: 'lib/manuscript/ingest/parseUpload.ts',
  landing: 'lib/manuscript/source/encryptedLanding.ts',
  release: 'lib/writersStudio/releaseAuthority.ts',
  arrivals: 'lib/manuscript/source/arrivals.ts',
  fidelity: 'lib/manuscript/ingest/docxFidelity.ts',
  migration: 'database/migrations/20260824000001_manuscript_source_custody.sql',
});

/** Read every anchored source file under `root`; a missing file is `null`, never an empty string. */
export function readSources(root) {
  const out = {};
  for (const [k, rel] of Object.entries(SOURCE_FILES)) {
    try {
      out[k] = fs.readFileSync(path.join(root, rel), 'utf8');
    } catch {
      out[k] = null;
    }
  }
  return out;
}

function evalProduct(expr) {
  if (!/^[\d_\s*]+$/.test(expr)) return null;
  return expr.split('*').map((p) => Number(p.replace(/[_\s]/g, ''))).reduce((a, b) => a * b, 1);
}

/**
 * Comment-stripped source: `raw` keeps newlines (for block extraction), `flat` collapses whitespace
 * (for matching). `issues` is the number of constructs the stripper could not close (an unterminated
 * block comment, string or template: the very cases in which a stripper can HIDE live code), or null
 * when the stripper does not report them (which compareFactsToLimits then refuses to accept).
 * Every anchored TypeScript source is read with `jsx: false`: they are .ts files, where `<T>x` is a
 * cast, not an element (lib/strip.mjs: "use it for .ts/.mts/.cts").
 */
function prep(src, { sql = false } = {}) {
  if (typeof src !== 'string') return null;
  const detailed = sql ? stripLib.stripSqlCommentsDetailed : stripLib.stripCommentsDetailed;
  if (typeof detailed === 'function') {
    const d = sql ? detailed(src) : detailed(src, { jsx: false });
    if (d && typeof d.text === 'string' && Array.isArray(d.issues)) return { raw: d.text, flat: d.text.replace(/\s+/g, ' '), issues: d.issues.length };
  }
  const raw = sql ? stripSqlComments(src) : stripComments(src, { jsx: false });
  return { raw, flat: raw.replace(/\s+/g, ' '), issues: null };
}

const has = (s, literal) => typeof s === 'string' && s.includes(literal);
const numberAfter = (s, re) => {
  const m = typeof s === 'string' ? re.exec(s) : null;
  return m ? Number(m[1].replace(/_/g, '')) : null;
};

/** The one top-level `const NAME = <product of integers>;`. Zero or several declarations -> null (ambiguous is not a value). */
function declaredNumber(p, name) {
  if (!p) return null;
  const all = [...p.flat.matchAll(new RegExp(`\\bconst ${name} = ([\\d_ *]+);`, 'g'))];
  return all.length === 1 ? evalProduct(all[0][1]) : null;
}

/** A column-0-closed top-level declaration, whitespace-collapsed. null if the start or the close is not found. */
function blockOf(p, startRe) {
  if (!p) return null;
  const m = startRe.exec(p.raw);
  if (!m) return null;
  const rest = p.raw.slice(m.index);
  const end = /\n\}\s*(?:\n|$)/.exec(rest);
  return end ? rest.slice(0, end.index + 2).replace(/\s+/g, ' ') : null;
}

function between(p, startLit, endLit) {
  if (!p) return null;
  const a = p.flat.indexOf(startLit);
  if (a < 0) return null;
  const b = p.flat.indexOf(endLit, a + startLit.length);
  return b < 0 ? null : p.flat.slice(a, b);
}

const statusList = (region) => (region === null ? null : [...region.matchAll(/status: (\d{3})/g)].map((m) => Number(m[1])));
const digest = (text) => (text === null ? null : crypto.createHash('sha256').update(text).digest('hex').slice(0, 16));

/**
 * Pure: facts the expectations rest on, extracted from source TEXT. `null` = pattern not
 * found or ambiguous; a null is always reported as drift by compareFactsToLimits.
 * Accepts the four original sources and, additively, `arrivals`, `fidelity` and `migration`.
 */
export function factsFromSources({ route, parse, landing, release, arrivals, fidelity, migration } = {}) {
  const R = prep(route);
  const P = prep(parse);
  const L = prep(landing);
  const A = prep(arrivals);
  const D = prep(fidelity);
  const M = prep(migration, { sql: true });
  const Z = prep(release);
  const preps = [R, P, L, A, D, M, Z].filter(Boolean);

  // ---- route.ts -------------------------------------------------------------------------
  const st = (re) => numberAfter(R && R.flat, re);
  const routeEarly = between(R, 'export async function POST(', 'let form: FormData;');
  const routeParse = between(R, 'let form: FormData;', 'let sourceArrivalId: string;');
  const routeCustody = between(R, 'let sourceArrivalId: string;', 'return NextResponse.json({ text: result.text');
  const routeTail = R && R.flat.includes('return NextResponse.json({ text: result.text') ? R.flat.slice(R.flat.indexOf('return NextResponse.json({ text: result.text')) : null;
  const order = R
    ? [R.flat.indexOf('await parseUpload('), R.flat.indexOf('result.text.length > MAX_TEXT_CHARS'), R.flat.indexOf('await recordArtifactArrival(')]
    : [-1];
  const statusEmptyFile = st(/if \(file\.size === 0\) \{ return NextResponse\.json\(\{ error: '[^']*' \}, \{ status: (\d{3}) \}\);/);
  const statusOverSize = st(/if \(file\.size > MAX_FILE_BYTES\) \{ return NextResponse\.json\(\{ error: '[^']*' \}, \{ status: (\d{3}) \}\);/);
  const statusUnsupported = st(/if \(err instanceof UnsupportedUploadError\) \{ return NextResponse\.json\(\{ error: err\.message \}, \{ status: (\d{3}) \}\);/);
  const statusUnsupportedDocx = st(/if \(err instanceof UnsupportedDocxStructureError\) \{ return NextResponse\.json\(\{ error: err\.message \}, \{ status: (\d{3}) \}\);/);
  const statusGenericParse = st(/console\.error\('\[press\/manuscripts\/ingest\] parse error:', err\); return NextResponse\.json\( \{ error: '[^']*' \}, \{ status: (\d{3}) \}, \);/);
  const statusTextOverCap = st(/if \(result\.text\.length > MAX_TEXT_CHARS\) \{ return NextResponse\.json\(\{ error: '[^']*' \}, \{ status: (\d{3}) \}\);/);
  const statusIncomplete = st(/if \(err instanceof SourceLandingIncompleteError\) \{[\s\S]{0,900}?\{ status: (\d{3}),/);

  // ---- parseUpload.ts -------------------------------------------------------------------
  const detect = blockOf(P, /export function detectFormat\(/);
  const parseFn = blockOf(P, /export async function parseUpload\(/);
  const epubFn = blockOf(P, /async function extractEpubText\(/);
  const readFn = blockOf(P, /async function readZipText\(/);
  const sizeFn = blockOf(P, /function zipUncompressedSize\(/);
  const pdfFn = blockOf(P, /async function extractPdfText\(/);
  const docxFn = blockOf(P, /async function extractDocxMarkdown\(/);
  const extRules = detect
    ? [...detect.matchAll(/if \(((?:ext === '[a-z0-9]+'(?: \|\| )?)+)\) return '([a-z]+)';/g)].map((m) => ({
        exts: [...m[1].matchAll(/ext === '([a-z0-9]+)'/g)].map((x) => x[1]),
        format: m[2],
      }))
    : null;
  const mimeRules = detect
    ? [...detect.matchAll(/if \(m(?:\.includes\('([^']+)'\)|\.startsWith\('([^']+)'\)| === '([^']+)')\) return '([a-z]+)';/g)].map((m) =>
        m[1] !== undefined ? { op: 'includes', value: m[1], format: m[4] }
          : m[2] !== undefined ? { op: 'startsWith', value: m[2], format: m[4] }
            : { op: 'equals', value: m[3], format: m[4] },
      )
    : null;
  // Every `return '<format>'` in detectFormat must have been parsed into a rule; otherwise a new, differently-shaped rule escaped the regexes.
  const detectFullyParsed = detect && extRules && mimeRules
    ? (detect.match(/return '[a-z]+';/g) ?? []).length === extRules.length + mimeRules.length && has(detect, 'return null;')
    : null;
  const docxBranch = between(P && { flat: parseFn ?? '' }, "if (format === 'docx') {", "if (format === 'pdf') {");

  // ---- encryptedLanding.ts / arrivals.ts --------------------------------------------------
  const validate = blockOf(L, /function validateOriginal\(/);
  const commitHead = between(L, 'export async function commitEncryptedArrival(', 'const found = await query');
  const recFn = blockOf(L, /export async function recordEncryptedArtifactArrival\(/);
  const arrFn = blockOf(A, /export async function recordArtifactArrival\(/);

  // ---- regions the structural facts cannot see (found by a mutation sweep: these edits changed what the route does and no fact moved) ----
  // The extension helper feeds detectFormat; the EPUB text conversion decides whether a text-bearing EPUB yields any text at all (200 versus
  // the empty-extraction 503); the release hold is the precondition every expectation assumes; docxFidelity.ts holds the Word refusals.
  const extFn = blockOf(P, /function extOf\(/);
  const setDecl = (name) => (P ? new RegExp(`const ${name} = new Set\\(\\[[^\\]]*\\]\\);`).exec(P.flat)?.[0] ?? null : null);
  const convParts = P ? [setDecl('EPUB_SKIP'), setDecl('EPUB_BLOCK'), blockOf(P, /function inlineText\(/), blockOf(P, /function cleanInline\(/), blockOf(P, /function directBlockChild\(/), blockOf(P, /function xhtmlToEditableText\(/)] : null;
  const epubConversion = convParts && convParts.every((x) => typeof x === 'string') ? convParts.join('\n') : null;
  // XML strictness and in-package path safety: they decide whether a well-formed EPUB parses at all (every EPUB fixture passes through them).
  const resolveParts = P ? [blockOf(P, /function localName\(/), blockOf(P, /function elementsNamed\(/), blockOf(P, /function parseXml\(/), blockOf(P, /function decodedHref\(/), blockOf(P, /function safeEpubPath\(/)] : null;
  const epubPackageResolution = resolveParts && resolveParts.every((x) => typeof x === 'string') ? resolveParts.join('\n') : null;
  const holdConst = R ? /const PRESS_SOURCE_INTAKE_RELEASED = [^;]*;/.exec(R.flat)?.[0] ?? null : null;
  const holdUse = R ? R.flat.indexOf('PRESS_SOURCE_INTAKE_RELEASED', R.flat.indexOf('PRESS_SOURCE_INTAKE_RELEASED') + 1) : -1; // the second mention is the guard
  const holdFrom = holdUse >= 0 ? R.flat.lastIndexOf('if (', holdUse) : -1;
  const holdTo = holdUse >= 0 ? R.flat.indexOf('const idempotencyKey', holdUse) : -1;
  const releaseHold = holdConst && holdFrom >= 0 && holdTo > holdFrom ? `${holdConst}\n${R.flat.slice(holdFrom, holdTo)}` : null;

  return {
    // -- the original keys (names and meaning kept) --
    routeMaxFile: declaredNumber(R, 'MAX_FILE_BYTES'),
    routeMaxText: declaredNumber(R, 'MAX_TEXT_CHARS'),
    routeRefusesOverSize: statusOverSize === 413,
    routeRefusesTextOverCap: statusTextOverCap === 413,
    routeRefusesEmptyFile: statusEmptyFile === 400,
    routeMapsIncompleteTo503: statusIncomplete === 503,
    epubEntries: declaredNumber(P, 'EPUB_MAX_ENTRIES'),
    epubEntryBytes: declaredNumber(P, 'EPUB_MAX_ENTRY_BYTES'),
    epubTotalBytes: declaredNumber(P, 'EPUB_MAX_TOTAL_BYTES'),
    epubMaxTextChars: declaredNumber(P, 'EPUB_MAX_TEXT_CHARS'), // declared outside extractEpubText, so no region digest covers it
    // The docx branch of parseUpload returns (with a warning) on empty text and contains no `throw`. Stronger than the earlier
    // "the warning string exists somewhere in the file": a throw added beside an intact warning string is now caught.
    parseNeverThrowsOnEmptyDocx: Boolean(
      docxBranch &&
        !/\bthrow\b/.test(docxBranch) &&
        has(docxBranch, "const warnings = result.text.trim().length === 0 ? [...result.warnings, 'We could not find any text in this document.'] : result.warnings; return { ...result, warnings, format };"),
    ),
    landingMaxFile: declaredNumber(L, 'MAX_FILE_BYTES'),
    landingRefusesEmptyText: Boolean(
      has(commitHead, "if (!input.originalFilename || typeof input.sourceText !== 'string' || input.sourceText.length === 0 || input.sourceText.length > 2_000_000) { throw new Error('source_landing_arrival_input_refused'); }"),
    ),
    sourceIntakeReleased: (() => {
      const m = Z ? /sourceIntakeReleased:\s*(true|false)/.exec(Z.flat) : null;
      return m ? m[1] === 'true' : null;
    })(),

    // -- additive: statuses of each branch, read from the branch itself --
    statusEmptyFile, statusOverSize, statusUnsupported, statusUnsupportedDocx, statusGenericParse, statusTextOverCap, statusIncomplete,
    routeStatusesEarly: statusList(routeEarly),
    routeStatusesParse: statusList(routeParse),
    routeStatusesCustody: statusList(routeCustody),
    routeStatusesTail: statusList(routeTail),
    routeOrderParseCapCustody: R ? order[0] >= 0 && order[0] < order[1] && order[1] < order[2] : null,
    routePassesExtractedTextToCustody: Boolean(R && /await recordArtifactArrival\(\{[^}]*sourceText: result\.text,/.test(R.flat)),
    routeTextCapUnit: R && has(R.flat, 'if (result.text.length > MAX_TEXT_CHARS) {') ? 'utf16-code-units' : null, // `.length` of a JS string
    // -- additive: parseUpload --
    extRules,
    mimeRules,
    detectFormatFullyParsed: detectFullyParsed,
    parseTextIsVerbatimUtf8: Boolean(parseFn && has(parseFn, "return { text: buffer.toString('utf-8'), warnings: [], format };")),
    pdfScannedIsWarningNotThrow: Boolean(pdfFn && !/\bthrow\b/.test(pdfFn) && has(pdfFn, 'if (text.trim().length === 0 || avgPerPage < 20) { warnings.push(')),
    epubGuardEntries: Boolean(has(epubFn, 'if (entries.length > EPUB_MAX_ENTRIES) { throw new UnsupportedUploadError(')),
    epubGuardTotal: Boolean(has(epubFn, 'const knownTotal = entries.reduce((sum, entry) => sum + (zipUncompressedSize(entry) ?? 0), 0); if (knownTotal > EPUB_MAX_TOTAL_BYTES) { throw new UnsupportedUploadError(')),
    epubGuardEntryContainer: Boolean(has(readFn, 'if (size !== null && size > EPUB_MAX_ENTRY_BYTES) { throw new UnsupportedUploadError(`')),
    epubGuardText: Boolean(has(epubFn, "if (documents.join('\\n\\n').length > EPUB_MAX_TEXT_CHARS) { throw new UnsupportedUploadError(")),
    epubGuardEntrySpine: Boolean(has(epubFn, "if (size !== null && size > EPUB_MAX_ENTRY_BYTES) { throw new UnsupportedUploadError('One EPUB chapter")),
    epubGuardDrm: Boolean(has(epubFn, 'if (spinePaths.includes(target) || /\\.(xhtml?|html?|opf|ncx|xml)$/i.test(target) || !knownFontObfuscation) { throw new UnsupportedUploadError(')),
    epubGuardMimetype: Boolean(has(epubFn, "if (declared && declared !== 'application/epub+zip') { throw new UnsupportedUploadError(")),
    epubLoadFailureIsUnsupported: Boolean(has(epubFn, 'zip = await JSZip.loadAsync(buffer, { checkCRC32: true, createFolders: false }); } catch { throw new UnsupportedUploadError(')),
    // The jszip load (which inflates every entry to check its CRC32) runs BEFORE the declared-total guard: the guard decides the outcome, not the work done.
    epubInflatesBeforeTotalGuard: epubFn
      ? epubFn.indexOf('JSZip.loadAsync(buffer, { checkCRC32: true') >= 0 && epubFn.indexOf('JSZip.loadAsync(buffer, { checkCRC32: true') < epubFn.indexOf('knownTotal > EPUB_MAX_TOTAL_BYTES')
      : null,
    epubSizeReadFromJszipInternals: Boolean(has(sizeFn, '(entry as { _data?: { uncompressedSize?: unknown } })?._data?.uncompressedSize')),
    // -- additive: encryptedLanding / arrivals --
    landingMaxText: numberAfter(commitHead, /input\.sourceText\.length > ([\d_]+)\)/),
    landingGateOverMax: Boolean(has(validate, "bytes.length <= 0 || bytes.length > MAX_FILE_BYTES) { throw new Error('source_landing_bytes_out_of_range'); }")),
    landingWrapsEveryFailureAsIncomplete: Boolean(recFn && /\} catch \(error\) \{ throw new SourceLandingIncompleteError\('source_landing_incomplete', intentId, error\); \}\s*\}\s*$/.test(recFn)),
    landingWritesCiphertextBeforeTextGate: recFn
      ? recFn.indexOf('await writePreparedCiphertext(') >= 0 && recFn.indexOf('await writePreparedCiphertext(') < recFn.indexOf('await commitEncryptedArrival(')
      : null,
    arrivalsDelegatesUnconditionally: Boolean(arrFn && (arrFn.match(/\bthrow\b/g) ?? []).length === 1 && has(arrFn, "if (params.extractor === 'supplied') { throw new Error('artifact_arrival_cannot_use_supplied_extractor'); } return recordEncryptedArtifactArrival({")),
    // -- additive: docxFidelity (the refusals the table/image fixtures rest on) --
    docxFailInventory: D ? [...D.flat.matchAll(/FAIL\((['`])((?:(?!\1).)*)\1\)/g)].map((m) => m[2]) : null,
    docxRefusesTableWithoutHeader: Boolean(has(D && D.flat, "if (cellRows[0].length === 0 || cellRows[0].some((cell) => cell.name !== 'th')) { FAIL('a table without explicit header cells'); }")),
    docxRefusesTableWithoutDataRows: Boolean(has(D && D.flat, "if (rows.length < 2) FAIL('a table without a heading row and data rows');")),
    docxRefusesEmbeddedObjects: Boolean(has(D && D.flat, "if (find(root, 'img').length || find(root, 'object').length || find(root, 'svg').length) { FAIL('embedded pictures or objects'); }")),
    // -- additive: the database column the NUL/UTF-16 expectations rest on --
    sourceTextIsPostgresText: Boolean(M && has(M.flat, 'CREATE TABLE IF NOT EXISTS manuscript_source_arrivals (') && has(M.flat, 'source_text text NOT NULL')),
    // -- additive: how well the comment stripper understood the files the facts above were read from --
    // A stripper that cannot close a construct may have blanked live code; the facts are then a guess, never an anchor.
    stripperReportsIssues: preps.length > 0 && preps.every((p) => p.issues !== null),
    stripUnclosedConstructs: preps.reduce((n, p) => n + (p.issues ?? 0), 0),
    // -- additive: digests of the exact regions the expectations were read from (the catch-all tripwire) --
    regionDigests: {
      'route.decision': digest(between(R, 'let form: FormData;', 'return NextResponse.json({ text: result.text')),
      'parse.detectFormat': digest(detect),
      'parse.parseUpload': digest(parseFn),
      'parse.extractEpubText': digest(epubFn),
      'parse.readZipText': digest(readFn),
      'parse.zipUncompressedSize': digest(sizeFn),
      'parse.extractPdfText': digest(pdfFn),
      'parse.extractDocxMarkdown': digest(docxFn),
      'landing.validateOriginal': digest(validate),
      'landing.commitHead': digest(commitHead),
      'landing.recordEncryptedArtifactArrival': digest(recFn),
      'arrivals.recordArtifactArrival': digest(arrFn),
      'parse.extOf': digest(extFn),
      'parse.epubTextConversion': digest(epubConversion),
      'parse.epubPackageResolution': digest(epubPackageResolution),
      'route.releaseHold': digest(releaseHold),
      'docxFidelity.whole': digest(D ? D.flat : null),
    },
  };
}

/**
 * What the expectations were read against. Changing any of these is a deliberate, reviewed act.
 * The region digests were taken from the worktree of canonical clean-main-no-secrets at
 * d024cff0d5a00bba71692c6506a720edaafd08e6 (sha256 of the comment-stripped, whitespace-collapsed
 * region, first 16 hex). A digest that no longer matches means "the code these expectations were
 * read from changed: re-read it, re-derive the expectations, then re-pin" and nothing more.
 */
export const SOURCE_PINS = Object.freeze({
  statuses: Object.freeze({
    statusEmptyFile: 400, statusOverSize: 413, statusUnsupported: 415, statusUnsupportedDocx: 422,
    statusGenericParse: 422, statusTextOverCap: 413, statusIncomplete: 503,
  }),
  // Every `status:` literal in each region of route.ts, in source order. An added refusal anywhere shows up here.
  routeStatusesEarly: Object.freeze([501, 401, 401, 401, 423, 400, 401]),
  routeStatusesParse: Object.freeze([400, 400, 400, 413, 415, 422, 422, 413]),
  routeStatusesCustody: Object.freeze([503, 500]),
  routeStatusesTail: Object.freeze([500]),
  extRules: Object.freeze([
    Object.freeze({ exts: Object.freeze(['docx']), format: 'docx' }),
    Object.freeze({ exts: Object.freeze(['pdf']), format: 'pdf' }),
    Object.freeze({ exts: Object.freeze(['epub']), format: 'epub' }),
    Object.freeze({ exts: Object.freeze(['txt', 'md', 'markdown']), format: 'text' }),
  ]),
  mimeRules: Object.freeze([
    Object.freeze({ op: 'includes', value: 'officedocument.wordprocessingml', format: 'docx' }),
    Object.freeze({ op: 'equals', value: 'application/pdf', format: 'pdf' }),
    Object.freeze({ op: 'equals', value: 'application/epub+zip', format: 'epub' }),
    Object.freeze({ op: 'startsWith', value: 'text/', format: 'text' }),
  ]),
  docxFailInventory: Object.freeze([
    'an ambiguous or missing ${what} in the extracted text', 'a nested table', 'a table without a heading row and data rows',
    'a table without explicit header cells', 'a table with uneven rows', 'a table whose header structure cannot be represented',
    'merged table cells', 'nested content, images, or hyperlinks inside a table', 'multiline table cells',
    'an empty or multiline table cell', 'a missing, duplicate, or unlinked Word footnote', 'an ambiguous Word footnote reference',
    'a Word footnote body that cannot be retained as a linked note', 'a Word footnote whose content differs from its extracted text',
    'a quotation whose exact wording or punctuation changed', 'embedded pictures or objects',
  ]),
  regionDigests: Object.freeze({
    'route.decision': '8a695e15e94d42fe',
    'parse.detectFormat': '35cd291f7ae2b6c9',
    'parse.parseUpload': '824fed71856af192',
    'parse.extractEpubText': '5c1f7daade0629a7',
    'parse.readZipText': '01be3fd9437b302d',
    'parse.zipUncompressedSize': 'e4279cd783dbc153',
    'parse.extractPdfText': '411cb898c89f1e2a',
    'parse.extractDocxMarkdown': '65d69b4274ffc079',
    'landing.validateOriginal': 'efe3202f2a1aec31',
    'landing.commitHead': 'eda3ec15c19b1b6c',
    'landing.recordEncryptedArtifactArrival': 'efdf8cfaa22aae8c',
    'arrivals.recordArtifactArrival': 'dfa0cdd6c4401b88',
    // Added at repair time, from the worktree at 33ee2599035d591e62c6c15b9ccd8821a15bc133 with the anchored files unmodified (git diff empty).
    // They cover code that decides the route's behaviour but that no structural fact reads (a systematic mutation sweep found edits there
    // that moved nothing): extOf, the EPUB text conversion (a text-bearing EPUB is 200 only if it yields text), the release hold (the
    // precondition every expectation assumes) and the whole of docxFidelity.ts. They are catch-alls: a change says "re-read", not "wrong".
    'parse.extOf': '41b170a6a9eb8bbc',
    'parse.epubTextConversion': 'c37e9a19cb7475a0',
    'parse.epubPackageResolution': '70ed618533ca3ca3',
    'route.releaseHold': '500a55a4d61d61e9',
    'docxFidelity.whole': '91af4eeb0f34622c',
  }),
});

const sameJson = (a, b) => JSON.stringify(a) === JSON.stringify(b);

/**
 * Names of every fact that does not match what the expectations assume ([] = no drift).
 * Each name identifies ONE detector, so a mutation can be attributed to the detector that
 * caught it. A `null` fact (pattern missing or ambiguous) is drift, never a pass.
 */
export function compareFactsToLimits(f) {
  const bad = [];
  if (f.routeMaxFile !== LIMITS.MAX_FILE_BYTES) bad.push('route MAX_FILE_BYTES');
  if (f.landingMaxFile !== LIMITS.MAX_FILE_BYTES) bad.push('landing MAX_FILE_BYTES');
  if (f.routeMaxText !== LIMITS.MAX_TEXT_CHARS) bad.push('route MAX_TEXT_CHARS');
  if (f.landingMaxText !== LIMITS.MAX_TEXT_CHARS) bad.push('landing max text');
  if (f.epubEntries !== LIMITS.EPUB_MAX_ENTRIES) bad.push('EPUB_MAX_ENTRIES');
  if (f.epubEntryBytes !== LIMITS.EPUB_MAX_ENTRY_BYTES) bad.push('EPUB_MAX_ENTRY_BYTES');
  if (f.epubTotalBytes !== LIMITS.EPUB_MAX_TOTAL_BYTES) bad.push('EPUB_MAX_TOTAL_BYTES');
  if (f.epubMaxTextChars !== EPUB_TEXT_CAP) bad.push('EPUB_MAX_TEXT_CHARS');
  for (const k of [
    'routeRefusesOverSize', 'routeRefusesTextOverCap', 'routeRefusesEmptyFile', 'routeMapsIncompleteTo503',
    'parseNeverThrowsOnEmptyDocx', 'landingRefusesEmptyText',
    'routeOrderParseCapCustody', 'routePassesExtractedTextToCustody', 'detectFormatFullyParsed', 'parseTextIsVerbatimUtf8',
    'pdfScannedIsWarningNotThrow', 'epubGuardEntries', 'epubGuardTotal', 'epubGuardEntryContainer', 'epubGuardEntrySpine',
    'epubGuardText', 'epubGuardDrm', 'epubGuardMimetype', 'epubLoadFailureIsUnsupported', 'epubInflatesBeforeTotalGuard', 'epubSizeReadFromJszipInternals',
    'landingGateOverMax', 'landingWrapsEveryFailureAsIncomplete', 'landingWritesCiphertextBeforeTextGate', 'arrivalsDelegatesUnconditionally',
    'docxRefusesTableWithoutHeader', 'docxRefusesTableWithoutDataRows', 'docxRefusesEmbeddedObjects', 'sourceTextIsPostgresText',
  ]) {
    if (f[k] !== true) bad.push(k);
  }
  if (f.routeTextCapUnit !== 'utf16-code-units') bad.push('route text cap unit');
  for (const [k, v] of Object.entries(SOURCE_PINS.statuses)) if (f[k] !== v) bad.push(`route ${k}`);
  for (const k of ['routeStatusesEarly', 'routeStatusesParse', 'routeStatusesCustody', 'routeStatusesTail', 'extRules', 'mimeRules', 'docxFailInventory']) {
    if (!sameJson(f[k], SOURCE_PINS[k])) bad.push(`pinned list ${k}`);
  }
  if (f.sourceIntakeReleased === null) bad.push('release flag not found');
  if (f.stripperReportsIssues !== true) bad.push('comment stripper does not report unclosed constructs');
  if (f.stripUnclosedConstructs !== 0) bad.push('comment stripper left an unclosed construct in an anchored source');
  for (const [name, pin] of Object.entries(SOURCE_PINS.regionDigests)) {
    const got = f.regionDigests ? f.regionDigests[name] : null;
    if (got === null || got === undefined) bad.push(`region missing ${name}`);
    else if (got !== pin) bad.push(`region drift ${name}`);
  }
  return bad;
}

/* ------------------------------------------------------------------------- *
 * Expectation model: expected outcome = f(bytes of the fixture, facts read from the source).
 *
 * This is an INDEPENDENT, hand-written restatement of the route decision tree
 * (ingest/route.ts -> parseUpload.ts -> docxFidelity.ts -> encryptedLanding.ts), driven by the
 * limits and statuses that factsFromSources reads. It is a MODEL: it is not the route, it does
 * not run mammoth, pdf-parse or the database, and where an outcome hinges on them it says so
 * through `uncertain`. Its job is to make the per-fixture table in specs() a CHECKED
 * DERIVATION rather than free text: the self-test requires table == model for every fixture,
 * and then mutates the model's rules and the source facts to prove the fixture set can tell a
 * wrong route from the right one.
 * ------------------------------------------------------------------------- */

const gt = (v, cap) => v > cap; // every cap in the route/parse/landing source is a strict ">"
const ge = (v, cap) => v >= cap;
const gtPlusOne = (v, cap) => v > cap + 1;

/** The route's rules as read. A defeat candidate replaces ONE of these (see selfTest). */
export const ROUTE_RULES = Object.freeze({
  cmp: Object.freeze({ file: gt, text: gt, epubEntries: gt, epubTotal: gt, epubEntry: gt, epubText: gt, landingFile: gt, landingText: gt }),
  textUnits: (p) => p.units, // result.text.length: UTF-16 code units
  enforceFileCap: true,
  enforceTextCap: true,
  enforceEmptyFile: true,
  enforceEpubEntries: true,
  enforceEpubTotal: true,
  enforceEpubEntry: true,
  enforceEpubText: true, // parseUpload's own cap on extracted EPUB text (EPUB_MAX_TEXT_CHARS): 415, not the route's 413
  enforceDrm: true,
  enforceUnsupportedDocx: true,
  docxEmptyThrows: false, // parseUpload returns empty text + a warning
  pdfScannedThrows: false, // extractPdfText returns empty text + a warning
  emptyTextRefusedBeforeCustody: false, // the repair the module's own routed defect suggests
  nulRefusedBeforeCustody: false,
  landingRefusesEmptyText: true,
  landingRefusesNul: true, // source_text is a Postgres text column
  earlyRefusalStatus: 422,
});

/** Documents larger than this are parsed at a cost the source does not settle, so an outcome that needs the parse to finish is `uncertain`. */
export const LARGE_DOCUMENT_BYTES = 1024 * 1024;

const statusClassOf = (s) => (s < 300 ? '2xx' : s < 500 ? '4xx' : '5xx');
const outcome = (parse, status, why, uncertain = false) => ({ expectedParse: parse, expectedStatusClass: statusClassOf(status), expectedStatus: status, uncertain, why });
const refuse = (status, why, uncertain) => outcome('refuse', status, why, uncertain);
/** parseUpload SUCCEEDED; `status` is what the rest of the route then answers (200, or a 5xx from custody). */
const accepted = (status, why, uncertain) => outcome('accept', status, why, uncertain);

function countOf(buf, needle) {
  let n = 0;
  let at = buf.indexOf(needle);
  while (at >= 0) {
    n++;
    at = buf.indexOf(needle, at + needle.length);
  }
  return n;
}

/** Sum of the character counts inside every <w:t> of a document.xml BUFFER, without building one huge string. */
function wtUnits(b) {
  const open = Buffer.from('<w:t');
  const close = Buffer.from('</w:t>');
  let units = 0;
  let pos = 0;
  for (;;) {
    const a = b.indexOf(open, pos);
    if (a < 0) break;
    const c = b[a + 4];
    if (c !== 0x3e && c !== 0x20 && c !== 0x09 && c !== 0x0a && c !== 0x0d) {
      pos = a + 4; // <w:tbl>, <w:tc>, <w:tr> ... are not <w:t>
      continue;
    }
    const gtAt = b.indexOf(0x3e, a);
    if (gtAt < 0) break;
    if (b[gtAt - 1] === 0x2f) {
      pos = gtAt + 1; // <w:t/>
      continue;
    }
    const e = b.indexOf(close, gtAt);
    if (e < 0) break;
    const s = b.toString('utf8', gtAt + 1, e);
    units += (s.includes('&') ? decodeXmlEntities(s) : s).length;
    pos = e + close.length;
  }
  return units;
}

function epubModel(buf, z) {
  const out = { problem: null, mimetypeBad: false, maxRead: 0, drm: false, hasText: () => false, textUnits: () => 0 };
  const get = (n) => z.byName.get(n);
  const text = (e) => readEntry(buf, e).toString('utf8');
  const mt = get('mimetype');
  if (mt) {
    const d = text(mt).trim();
    out.mimetypeBad = d !== '' && d !== 'application/epub+zip';
  }
  const cont = get('META-INF/container.xml');
  if (!cont) return { ...out, problem: 'container missing' };
  out.maxRead = cont.usize;
  const full = /<rootfile\b[^>]*\bfull-path="([^"]+)"/.exec(text(cont))?.[1];
  if (!full) return { ...out, problem: 'container names no package' };
  const opfPath = path.posix.normalize(full).replace(/^\/+/, '');
  const opfEntry = get(opfPath);
  if (!opfEntry) return { ...out, problem: 'package document missing' };
  out.maxRead = Math.max(out.maxRead, opfEntry.usize);
  const opf = text(opfEntry);
  const manifest = new Map();
  for (const m of opf.matchAll(/<item\s+([^>]*?)\/>/g)) {
    const id = /\bid="([^"]*)"/.exec(m[1])?.[1];
    const href = /\bhref="([^"]*)"/.exec(m[1])?.[1];
    if (id && href) {
      manifest.set(id, {
        path: path.posix.normalize(path.posix.join(path.posix.dirname(opfPath), href)),
        mediaType: (/\bmedia-type="([^"]*)"/.exec(m[1])?.[1] ?? '').toLowerCase(),
        properties: (/\bproperties="([^"]*)"/.exec(m[1])?.[1] ?? '').toLowerCase(),
      });
    }
  }
  const spine = [];
  for (const m of opf.matchAll(/<itemref\s+idref="([^"]*)"/g)) {
    const item = manifest.get(m[1]);
    if (!item || item.properties.split(/\s+/).includes('nav')) continue;
    if (item.mediaType && !/xhtml|html|xml/.test(item.mediaType)) continue;
    if (!spine.includes(item.path)) spine.push(item.path);
  }
  if (!spine.length) return { ...out, problem: 'no readable spine' };
  const enc = get('META-INF/encryption.xml');
  if (enc) {
    for (const block of text(enc).matchAll(/<(?:\w+:)?EncryptedData\b[\s\S]*?<\/(?:\w+:)?EncryptedData>/g)) {
      const algo = /<(?:\w+:)?EncryptionMethod\b[^>]*\bAlgorithm="([^"]*)"/.exec(block[0])?.[1] ?? '';
      const uri = /<(?:\w+:)?CipherReference\b[^>]*\bURI="([^"]*)"/.exec(block[0])?.[1] ?? '';
      if (!uri) continue;
      const target = path.posix.normalize(decodeURIComponent(uri)).replace(/^\/+/, '');
      const fontObfuscation = algo.includes('idpf.org/2008/embedding') || algo.includes('adobe.com/pdf/enc');
      if (spine.includes(target) || /\.(xhtml?|html?|opf|ncx|xml)$/i.test(target) || !fontObfuscation) out.drm = true;
    }
  }
  for (const p of spine) {
    const e = get(p);
    if (e) out.maxRead = Math.max(out.maxRead, e.usize);
  }
  let hasText = null; // memoised: an 8 MiB spine document is decoded once, not once per model call
  out.hasText = () => (hasText ??= spine.some((p) => {
    const e = get(p);
    return Boolean(e) && text(e).replace(/<[^>]+>/g, ' ').trim().length > 0;
  }));
  // A LOWER BOUND on the characters extractEpubText would produce: the text nodes of the spine documents with comments, tags and the
  // parser's skipped elements (head, script, style, svg, nav, noscript) removed, entities decoded, whitespace runs collapsed, each
  // document trimmed. It leaves out the blank lines the parser puts between blocks and the "## " heading markers, and it never counts
  // anything the parser drops, so "lower bound > cap" PROVES the parser's text is over the cap, while "lower bound <= cap" proves nothing.
  let textUnits = null; // memoised for the same reason as hasText
  out.textUnits = () => (textUnits ??= spine.reduce((n, p) => {
    const e = get(p);
    if (!e) return n;
    const body = text(e)
      .replace(/<!--[\s\S]*?-->/g, '')
      .replace(/<(head|script|style|svg|nav|noscript)\b[\s\S]*?<\/\1\s*>/gi, '')
      .replace(/<[^>]*>/g, '');
    return n + decodeXmlEntities(body).replace(/\s+/g, ' ').trim().length;
  }, 0));
  return out;
}

function docxModel(buf, z) {
  const doc = z.byName.get('word/document.xml');
  if (!doc) return { problem: 'no main document part' };
  const b = readEntry(buf, doc, { maxOutput: 256 * 1024 * 1024 }); // a 100 MiB bomb is inflated here; the model needs its text length
  const tbl = b.indexOf('<w:tbl>');
  let firstRowHeader = false;
  let rows = 0;
  if (tbl >= 0) {
    const tblEnd = b.indexOf('</w:tbl>', tbl);
    const seg = b.subarray(tbl, tblEnd < 0 ? b.length : tblEnd);
    rows = countOf(seg, '<w:tr>') + countOf(seg, '<w:tr ');
    const r1 = seg.indexOf('<w:tr');
    const r1End = seg.indexOf('</w:tr>', r1);
    firstRowHeader = r1 >= 0 && seg.subarray(r1, r1End < 0 ? seg.length : r1End).includes('<w:tblHeader');
  }
  return {
    problem: null,
    textUnits: wtUnits(b),
    hasTable: tbl >= 0,
    tableRows: rows,
    firstRowHeader,
    hasDrawing: b.includes('<w:drawing') || b.includes('<w:pict') || b.includes('<w:object'),
    hasFootnoteRef: b.includes('<w:footnoteReference'),
  };
}

/**
 * Measure an upload from its BYTES, file name and MIME type alone: no fixture `kind`, no
 * expectation. Lazy and memoised, so measuring a 26 MiB file that the route refuses by size
 * costs nothing beyond its length.
 */
export function measureUpload(buf, filename, mime = '') {
  const memo = {};
  const once = (key, fn) => () => (key in memo ? memo[key] : (memo[key] = fn()));
  return {
    bytes: buf.length,
    filename: String(filename),
    mime: mime ?? '',
    text: once('text', () => {
      const s = buf.toString('utf8');
      const pairs = (s.match(/[\ud800-\udbff][\udc00-\udfff]/g) ?? []).length;
      return { units: s.length, codePoints: s.length - pairs, bytes: buf.length, nul: s.includes('\u0000') };
    }),
    zip: once('zip', () => {
      let z;
      try {
        z = readZip(buf);
      } catch {
        return { readable: false };
      }
      return {
        readable: true,
        entries: z.entries.length,
        declaredTotal: z.entries.reduce((a, e) => a + e.usize, 0),
        epub: once('epub', () => epubModel(buf, z)),
        docx: once('docx', () => docxModel(buf, z)),
      };
    }),
    pdf: once('pdf', () => {
      const a = analyzePdf(buf);
      return { textUnits: a.runs.join('').trim().length, exact: a.exact, machinery: a.machinery };
    }),
  };
}

function detectFormatModel(filename, mime, F) {
  const ext = (/\.([a-z0-9]+)$/.exec(String(filename).toLowerCase()) ?? [])[1] ?? '';
  for (const r of F.extRules ?? []) if (r.exts.includes(ext)) return r.format;
  const m = String(mime ?? '').toLowerCase();
  for (const r of F.mimeRules ?? []) {
    if (r.op === 'includes' && m.includes(r.value)) return r.format;
    if (r.op === 'equals' && m === r.value) return r.format;
    if (r.op === 'startsWith' && m.startsWith(r.value)) return r.format;
  }
  return null;
}

/**
 * Expected outcome of POSTing the measured upload to a RELEASED, authenticated route whose
 * custody path is healthy (EXPECTATION_PRECONDITIONS), under facts `F` and rules `R`.
 * Returns { expectedParse, expectedStatusClass, expectedStatus, uncertain, why }.
 *   expectedParse 'accept' = parseUpload returns and no pre-custody gate fires; a later 5xx
 *   (custody) is still 'accept'. 'refuse' = a gate or parser refusal answers first.
 */
export function deriveExpectation(m, F, R = ROUTE_RULES) {
  // 1. route gates that run before parsing
  if (R.enforceEmptyFile && m.bytes === 0) return refuse(F.statusEmptyFile, 'empty file', false);
  if (R.enforceFileCap && R.cmp.file(m.bytes, F.routeMaxFile)) return refuse(F.statusOverSize, 'file over the size cap', false);

  // 2. format detection (extension first, MIME fallback)
  const format = detectFormatModel(m.filename, m.mime, F);
  if (format === null) return refuse(F.statusUnsupported, 'format not accepted by detectFormat', false);

  // 3. parseUpload
  let p; // { units, nul, uncertain }
  if (format === 'text') {
    const t = m.text();
    p = { units: t.units, routeUnits: R.textUnits(t), nul: t.nul, uncertain: false }; // the route and landing both count UTF-16 units; a defeat candidate may change only the route's unit
  } else if (format === 'pdf') {
    const a = m.pdf();
    if (a.textUnits > 0) p = { units: a.textUnits, nul: false, uncertain: false };
    else if (a.exact && !a.machinery) {
      if (R.pdfScannedThrows) return refuse(F.statusUnsupported, 'scanned PDF refused by the parser', false);
      p = { units: 0, nul: false, uncertain: true }; // pdf-parse returning exactly '' (not whitespace) is library behaviour
    } else p = { units: 1, nul: false, uncertain: true }; // a text layer this model cannot read
  } else if (format === 'epub') {
    const z = m.zip();
    if (!z.readable) return refuse(F.statusUnsupported, 'archive not readable', false);
    if (R.enforceEpubEntries && R.cmp.epubEntries(z.entries, F.epubEntries)) return refuse(F.statusUnsupported, 'too many entries', false);
    if (R.enforceEpubTotal && R.cmp.epubTotal(z.declaredTotal, F.epubTotalBytes)) return refuse(F.statusUnsupported, 'declared total over the cap', false);
    const e = z.epub();
    if (e.mimetypeBad) return refuse(F.statusUnsupported, 'mimetype is not an EPUB', false);
    if (e.problem) return refuse(F.statusUnsupported, `package problem: ${e.problem}`, false);
    if (R.enforceEpubEntry && R.cmp.epubEntry(e.maxRead, F.epubEntryBytes)) return refuse(F.statusUnsupported, 'an entry the parser reads is over the per-entry cap', false);
    if (R.enforceDrm && e.drm) return refuse(F.statusUnsupported, 'encryption marker targets readable content', false);
    // The parser's own text cap, applied to the TEXT it extracts. `textUnits()` is a lower bound, so a refusal here is certain on the
    // cap; it is `uncertain` only when the document is large enough that the parse must finish first (a library behaviour).
    if (R.enforceEpubText && R.cmp.epubText(e.textUnits(), F.epubMaxTextChars)) return refuse(F.statusUnsupported, 'EPUB extracted text over the parser cap', e.maxRead > LARGE_DOCUMENT_BYTES);
    p = { units: e.hasText() ? 1 : 0, nul: false, uncertain: e.maxRead > LARGE_DOCUMENT_BYTES };
  } else if (format === 'docx') {
    const z = m.zip();
    if (!z.readable) return refuse(F.statusGenericParse, 'archive not readable by mammoth', false);
    const d = z.docx();
    if (d.problem) return refuse(F.statusGenericParse, d.problem, true);
    const tableOk = d.hasTable && d.firstRowHeader && d.tableRows >= 2;
    if (R.enforceUnsupportedDocx && (d.hasDrawing || (d.hasTable && !tableOk))) return refuse(F.statusUnsupportedDocx, 'unrepresentable Word structure', true);
    if (d.textUnits === 0 && R.docxEmptyThrows) return refuse(F.statusUnsupported, 'empty document refused by the parser', false);
    // A document whose text is over the cap is only refused AFTER mammoth has expanded and converted all of it: whether the process survives that is library behaviour.
    p = { units: d.textUnits, nul: false, uncertain: d.hasTable || d.hasFootnoteRef || F.routeMaxText < d.textUnits };
  } else {
    return accepted(200, `format "${format}" is not modelled`, true);
  }

  // 4. the route's own text cap (measured on result.text.length)
  if (R.enforceTextCap && R.cmp.text(p.routeUnits ?? p.units, F.routeMaxText)) return refuse(F.statusTextOverCap, 'extracted text over the cap', p.uncertain);

  // 5. gates a repair might add BEFORE custody (none exists in the source today)
  if (R.emptyTextRefusedBeforeCustody && p.units === 0) return refuse(R.earlyRefusalStatus, 'empty extraction refused before custody', false);
  if (R.nulRefusedBeforeCustody && p.nul) return refuse(R.earlyRefusalStatus, 'NUL refused before custody', false);

  // 6. custody: ciphertext lands first, then the arrival row is committed (encryptedLanding.ts)
  if (R.cmp.landingFile(m.bytes, F.landingMaxFile)) return accepted(F.statusIncomplete, 'landing refuses the file size after the route admitted it', false);
  if (R.landingRefusesEmptyText && F.landingRefusesEmptyText && p.units === 0) return accepted(F.statusIncomplete, 'empty extraction refused by landing after the ciphertext landed', true);
  if (R.cmp.landingText(p.units, F.landingMaxText)) return accepted(F.statusIncomplete, 'landing refuses the text length', false);
  if (R.landingRefusesNul && F.sourceTextIsPostgresText && p.nul) return accepted(F.statusIncomplete, 'a NUL byte cannot be stored in a Postgres text column', true);
  return accepted(200, 'accepted', p.uncertain);
}

/** The four fields of a manifest entry that carry the expectation. */
export const EXPECTATION_FIELDS = Object.freeze(['expectedParse', 'expectedStatusClass', 'expectedStatus', 'uncertain']);
export const expectationMismatch = (entry, derived) => EXPECTATION_FIELDS.filter((k) => entry[k] !== derived[k]);

/* ------------------------------------------------------------------------- *
 * selfTest
 * ------------------------------------------------------------------------- */

function unzipAvailable() {
  const r = spawnSync('unzip', ['-v'], { encoding: 'utf8' });
  return r.status === 0;
}

function unzipTest(file) {
  return spawnSync('unzip', ['-tq', file], { encoding: 'utf8', maxBuffer: 1 << 20 }).status === 0;
}

function unzipNames(file) {
  const r = spawnSync('unzip', ['-Z1', file], { encoding: 'utf8', maxBuffer: 1 << 20 });
  return r.status === 0 ? r.stdout.split('\n').filter(Boolean) : null;
}

function zipHealth(file, haveUnzip) {
  const buf = fs.readFileSync(file);
  const out = { own: false, ownErr: '', entries: 0, crcChecked: 0, crcSkipped: 0, unzipOk: null, namesAgree: null };
  try {
    const z = readZip(buf);
    out.entries = z.entries.length;
    for (const e of z.entries) {
      if (e.usize > SMALL_ENTRY) out.crcSkipped++;
      else {
        readEntry(buf, e);
        out.crcChecked++;
      }
    }
    out.own = true;
    if (haveUnzip) {
      const names = unzipNames(file);
      out.namesAgree = names !== null && names.join('\n') === z.entries.map((e) => e.name).join('\n');
    }
  } catch (e) {
    out.ownErr = e.message;
  }
  if (haveUnzip) out.unzipOk = unzipTest(file);
  return out;
}

function safeRemove(dir) {
  const real = path.resolve(dir);
  const tmp = fs.realpathSync(os.tmpdir());
  const parent = fs.existsSync(real) ? fs.realpathSync(path.dirname(real)) : path.dirname(real);
  if (!path.basename(real).startsWith('wsi-fixtures-') || (parent !== tmp && !real.startsWith(tmp + path.sep))) {
    return false;
  }
  fs.rmSync(real, { recursive: true, force: true });
  return true;
}

const CORROBORATING_TOOLS = Object.freeze(['unzip', 'poppler', 'xmllint']);

function parseToolList(v) {
  if (v === undefined || v === null || v === '') return [];
  const names = (Array.isArray(v) ? v : String(v).split(',')).map((x) => String(x).trim().toLowerCase()).filter(Boolean);
  if (names.some((n) => ['all', '1', 'true'].includes(n))) return [...CORROBORATING_TOOLS];
  for (const n of names) if (!CORROBORATING_TOOLS.includes(n)) throw new RangeError(`unknown corroboration tool "${n}" (known: ${CORROBORATING_TOOLS.join(', ')})`);
  return names;
}

function commandPresent(cmd, args) {
  return !spawnSync(cmd, args, { encoding: 'utf8' }).error;
}

/**
 * Verdict for ONE independent tool. An absent tool is never a pass: the claim it exists to
 * corroborate then rests on this module's own writer and reader, which is circular. Absence
 * is acceptable only as an explicit, recorded waiver.
 *   present            -> state 'present'  (the check goes on to use the tool; ok is decided by its findings)
 *   absent and waived  -> state 'waived'   ok:true, and the detail says so
 *   absent, not waived -> state 'absent'   ok:false
 */
export function corroborationVerdict({ present, waived }) {
  if (present) return { ok: true, state: 'present' };
  if (waived) return { ok: true, state: 'waived' };
  return { ok: false, state: 'absent' };
}

/** `mutate(src, from, to)`: replace exactly one occurrence, or throw (a mutation that changed nothing proves nothing). */
function mutate(src, from, to) {
  const n = src.split(from).length - 1;
  if (n !== 1) throw new Error(`mutation target found ${n} times, need exactly 1: ${redact(from.slice(0, 48))}`);
  return src.replace(from, () => to);
}

/** The ways an expectation-bearing manifest field can be wrong, per field. */
const FIELD_DOMAIN = Object.freeze({
  expectedParse: ['accept', 'refuse'],
  expectedStatusClass: ['2xx', '4xx', '5xx'],
  expectedStatus: [200, 400, 401, 413, 415, 422, 500, 503],
  uncertain: [true, false],
});

export function selfTest(options = {}) {
  const checks = [];
  const add = (name, ok, detail = '') => checks.push({ name, ok: Boolean(ok), detail: redact(detail) });
  const run = (name, fn) => {
    try {
      const r = fn();
      add(name, r.ok, r.detail ?? '');
    } catch (e) {
      add(name, false, `threw ${e && e.name}: ${e && e.message}`);
    }
  };
  const both = (label, good, bad) => ({ ok: good === true && bad === false, detail: `${label}: accepts-good=${good} rejects-known-bad=${bad === false}` });
  const throws = (fn) => {
    try {
      fn();
      return false;
    } catch {
      return true;
    }
  };

  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
  const absent = new Set(parseToolList(options.simulateAbsent)); // test seam: pretend a tool is not installed
  const waived = new Set(parseToolList(options.allowUncorroborated ?? process.env.WSI_ALLOW_UNCORROBORATED));
  const tool = {
    unzip: unzipAvailable() && !absent.has('unzip'),
    poppler: commandPresent('pdftotext', ['-v']) && commandPresent('pdfinfo', ['-v']) && !absent.has('poppler'),
    xmllint: commandPresent('xmllint', ['--version']) && !absent.has('xmllint'),
  };
  const corroboration = {};
  const canary = makeCanary();
  const otherCanary = makeCanary();
  let dir = null;
  const created = [];
  let largeManifest = [];

  try {
    /* -- primitives ------------------------------------------------------- */
    run('crc32 known-answer (and a wrong answer is rejected)', () => {
      const good = crc32(Buffer.from('123456789')) === 0xcbf43926;
      const bad = crc32(Buffer.from('123456780')) === 0xcbf43926;
      const rnd = crypto.randomBytes(1 << 20);
      const cross = typeof zlib.crc32 === 'function' ? crc32(rnd) === zlib.crc32(rnd) : null;
      return { ok: good && !bad && cross !== false, detail: `check-value=${good} wrong-input-differs=${!bad} zlib.crc32-crosscheck=${cross === null ? 'unavailable' : cross}` };
    });

    run('makeCanary: unique, deterministic, validated', () => {
      const a = makeCanary('00112233aabb');
      const sameSeed = makeCanary('00112233AABB') === a;
      const differs = makeCanary('00112233aabc') !== a;
      const fresh = makeCanary() !== makeCanary();
      const prefixed = a.startsWith(CANARY_PREFIX) && CANARY_RE.test(a);
      const rejects = throws(() => makeCanary('zz')) && throws(() => makeCanary('')) && throws(() => makeCanary(12345678));
      const assertRejects = throws(() => buildTextPdf('not-a-canary'));
      return { ok: sameSeed && differs && fresh && prefixed && rejects && assertRejects, detail: `same-seed-equal=${sameSeed} diff-seed-differs=${differs} random-unique=${fresh} bad-seeds-throw=${rejects} builder-rejects-bad-canary=${assertRejects}` };
    });

    run('zip writer/reader round-trip; CRC tamper and garbage are rejected', () => {
      const z = buildZip([
        { name: 'a.txt', data: Buffer.from('alpha alpha alpha alpha'), method: 'stored' },
        { name: 'dir/b.txt', data: Buffer.from('b'.repeat(2000)), method: 'deflate' },
      ]);
      const r = readZip(z.buffer);
      const roundTrip = r.entries.length === 2 && readEntry(z.buffer, r.entries[0]).toString() === 'alpha alpha alpha alpha' && readEntry(z.buffer, r.entries[1]).length === 2000;
      const tampered = Buffer.from(z.buffer);
      tampered[r.entries[0].dataOffset] ^= 0xff;
      const tamperCaught = throws(() => readEntry(tampered, readZip(tampered).entries[0]));
      const garbageCaught = throws(() => readZip(crypto.randomBytes(512))) && throws(() => readZip(Buffer.alloc(0)));
      const lying = Buffer.from(z.buffer); // central directory under-declares the expanded size: a bomb that lies about itself
      const centralSig = Buffer.from([0x50, 0x4b, 0x01, 0x02]);
      const firstCentral = lying.indexOf(centralSig, z.cdOffset);
      const secondCentral = lying.indexOf(centralSig, firstCentral + 4);
      if (firstCentral < 0 || secondCentral < 0) throw new Error('could not locate central headers for the understated-size control');
      lying.writeUInt32LE(10, secondCentral + 24);
      const lieCaught = throws(() => readEntry(lying, readZip(lying).entries[1]));
      return { ok: roundTrip && tamperCaught && garbageCaught && lieCaught, detail: `round-trip=${roundTrip} crc-tamper-caught=${tamperCaught} garbage-caught=${garbageCaught} understated-size-caught=${lieCaught}` };
    });

    run('isWellFormedXml accepts valid and rejects broken input', () => {
      const good = isWellFormedXml('<?xml version="1.0"?><a x="1"><b/>t &amp; u</a>').ok;
      const bads = ['<a><b></a></b>', '<a>', '<a>&bad</a>', '<a/><b/>', '<a>\u0000</a>', '<a x=1/>'].map((x) => isWellFormedXml(x).ok);
      return both('xml checker', good, bads.some(Boolean));
    });

    run('decodeXmlEntities: single pass, never throws on hostile references (the repaired behaviour fails these cases)', () => {
      const cases = [
        ['&#x110000;', '&#x110000;'], // above U+10FFFF: left as written (the old code threw RangeError)
        ['&#99999999999;', '&#99999999999;'],
        ['&#0;', '&#0;'], // NUL is not an XML Char
        ['&#xD800;', '&#xD800;'], // a lone surrogate is not an XML Char
        ['&#38;lt;', '&lt;'], // one pass: the decoded & must not be decoded again (the old code produced "<")
        ['&amp;lt;', '&lt;'],
        ['&lt;&gt;&quot;&apos;&amp;', '<>"\'&'],
        ['&#x41;&#66;&#x1F30A;', 'AB\u{1F30A}'],
        ['plain & text', 'plain & text'],
      ];
      const bad = cases.filter(([i, o]) => decodeXmlEntities(i) !== o).length;
      const legacyThrows = throws(() => legacyDecodeXmlEntities('&#x110000;'));
      const legacyDoubleDecodes = legacyDecodeXmlEntities('&#38;lt;') === '<';
      return { ok: bad === 0 && legacyThrows && legacyDoubleDecodes, detail: `cases=${cases.length} wrong=${bad} old-code-throws-on-U+110000=${legacyThrows} old-code-double-decodes=${legacyDoubleDecodes}` };
    });

    /* -- generation ------------------------------------------------------- */
    dir = fs.mkdtempSync(path.join(os.tmpdir(), 'wsi-fixtures-'));
    created.push(dir);
    let manifest = [];
    const t0 = Date.now();
    run('generateFixtures writes the default set into outDir only', () => {
      manifest = generateFixturesSync(dir, { canary });
      const listed = fs.readdirSync(dir).sort();
      const names = manifest.map((m) => m.name).sort();
      const inside = manifest.every((m) => path.dirname(m.path) === path.resolve(dir));
      const wanted = [
        'text-layer.pdf', 'scanned.pdf', 'book.epub', 'book-drm.epub', 'manuscript.docx', 'manuscript-deflated.docx', 'empty.docx',
        'corrupt-truncated.docx', 'zip-bomb.epub', 'zip-bomb.docx', 'notes.md', 'notes.txt', 'text-at-limit.txt', 'text-over-limit.txt',
        'unsupported-format.rtf', 'empty-file.txt',
        'text-astral-at-limit.txt', 'text-astral-over-limit.txt', 'text-utf8-bom.txt', 'text-utf16le.txt', 'text-with-nul.txt',
        'docx-table-no-header.docx', 'docx-embedded-image.docx',
        'epub-entries-at-cap.epub', 'epub-entries-over-cap.epub', 'epub-total-at-cap.epub', 'epub-total-over-cap.epub',
        'epub-chapter-at-cap.epub', 'epub-chapter-over-cap.epub', 'epub-text-over-cap.epub',
      ].sort();
      const sameSet = JSON.stringify(listed) === JSON.stringify(names) && JSON.stringify(names) === JSON.stringify(wanted);
      const withStray = [...listed, 'stray.bin'].sort();
      const strayCaught = JSON.stringify(withStray) !== JSON.stringify(names);
      const escapeCaught = path.dirname(path.join(dir, '..', 'x.pdf')) !== path.resolve(dir);
      return { ok: sameSet && inside && strayCaught && escapeCaught, detail: `files=${listed.length} dir-listing==manifest==expected:${sameSet} all-inside-outDir=${inside} stray-file-would-be-caught=${strayCaught} path-escape-would-be-caught=${escapeCaught} (${Date.now() - t0}ms)` };
    });

    run('required fixture kinds are all present (and a missing kind is detected)', () => {
      const need = [
        'pdf-text-layer', 'pdf-scanned', 'epub', 'epub-drm', 'docx', 'docx-empty', 'zip-corrupt', 'zip-bomb-epub', 'zip-bomb-docx', 'markdown', 'text',
        'text-astral-at-limit', 'text-astral-over-limit', 'text-utf8-bom', 'text-utf16le', 'text-with-nul', 'docx-table-no-header', 'docx-embedded-image',
        'epub-entries-at-cap', 'epub-entries-over-cap', 'epub-total-at-cap', 'epub-total-over-cap', 'epub-chapter-at-cap', 'epub-chapter-over-cap', 'epub-text-over-cap',
      ];
      const have = new Set(manifest.map((m) => m.kind));
      const missing = need.filter((k) => !have.has(k));
      const control = need.filter((k) => !new Set([...have].filter((x) => x !== 'epub-drm')).has(k));
      return { ok: missing.length === 0 && control.length === 1, detail: `required=${need.length} missing=${missing.length} control-removal-detected=${control.length === 1}` };
    });

    run('every file exists with the exact recorded size and sha256; tampering is detected', () => {
      let allOk = true;
      for (const m of manifest) {
        const st = fs.statSync(m.path);
        const buf = fs.readFileSync(m.path);
        const sha = crypto.createHash('sha256').update(buf).digest('hex');
        if (st.size !== m.bytes || buf.length !== m.bytes || sha !== m.sha256) allOk = false;
      }
      const m0 = manifest[0];
      const tamperedBuf = Buffer.concat([fs.readFileSync(m0.path), Buffer.from([0])]);
      const tamperedSha = crypto.createHash('sha256').update(tamperedBuf).digest('hex');
      const caught = tamperedBuf.length !== m0.bytes && tamperedSha !== m0.sha256;
      return { ok: allOk && caught, detail: `files-verified=${manifest.length} all-match=${allOk} one-extra-byte-caught=${caught}` };
    });

    run('manifest shape and honesty: fields typed, basis never "verified", classes consistent', () => {
      const keys = ['name', 'path', 'kind', 'bytes', 'sha256', 'containsCanary', 'expectedParse', 'expectedStatusClass', 'basis', 'note'];
      const shapeOk = (m) => keys.every((k) => k in m) && typeof m.bytes === 'number' && /^[0-9a-f]{64}$/.test(m.sha256) && ['accept', 'refuse'].includes(m.expectedParse) && STATUS_CLASSES.includes(m.expectedStatusClass) && ['inferred-from-source', 'verified'].includes(m.basis) && m.note.length > 20 && typeof m.uncertain === 'boolean' && Number.isInteger(m.expectedStatus);
      const honest = (m) => m.basis === 'inferred-from-source';
      const consistent = (m) => (m.expectedParse === 'refuse' ? m.expectedStatusClass === '4xx' : m.expectedStatusClass === '2xx' || (m.expectedStatusClass === '5xx' && m.uncertain === true));
      const classMatchesStatus = (m) => statusClassOf(m.expectedStatus) === m.expectedStatusClass;
      const good = manifest.length >= 29 && manifest.every((m) => shapeOk(m) && honest(m) && consistent(m) && classMatchesStatus(m)); // an empty manifest must not be "all valid"
      const acceptEntry = manifest.find((m) => m.expectedParse === 'accept' && m.expectedStatusClass === '2xx');
      const lie = { ...manifest[0], basis: 'verified' };
      const incoherent = { ...manifest[0], expectedParse: 'refuse', expectedStatusClass: '2xx' };
      const certain5xx = { ...acceptEntry, expectedStatusClass: '5xx', expectedStatus: 503, uncertain: false };
      const wrongClass = { ...acceptEntry, expectedStatus: 413 };
      const controls = !honest(lie) && !consistent(incoherent) && !consistent(certain5xx) && !classMatchesStatus(wrongClass);
      const fiveXx = manifest.filter((m) => m.expectedStatusClass === '5xx');
      // Which fixtures are 5xx is NOT pinned by a name list here: it is derived (see the model check) from the source facts and the bytes.
      return { ok: good && controls && fiveXx.length > 0 && fiveXx.every((m) => m.uncertain), detail: `entries=${manifest.length} all-valid=${good} overclaim/incoherence/certain-5xx/class-vs-status controls caught=${controls} 5xx-entries=${fiveXx.length} (all uncertain)` };
    });

    /* -- zips ------------------------------------------------------------- */
    run('every zip fixture is a valid zip by this module\'s own reader; the corrupt one is rejected; entry CRCs verified', () => {
      const zips = manifest.filter((m) => /\.(docx|epub)$/.test(m.name));
      const valid = zips.filter((m) => m.kind !== 'zip-corrupt');
      const rows = valid.map((m) => ({ n: m.name, h: zipHealth(m.path, false) }));
      const allValid = rows.every((r) => r.h.own);
      const corrupt = manifest.find((m) => m.kind === 'zip-corrupt');
      const ch = zipHealth(corrupt.path, false);
      const crc = rows.reduce((a, r) => a + r.h.crcChecked, 0);
      return { ok: allValid && !ch.own && crc > 0, detail: `valid-zips=${valid.length} own-reader-accepts-all=${allValid} corrupt-rejected=${!ch.own} entry-CRCs-verified=${crc} large-entries-skipped=${rows.reduce((a, r) => a + r.h.crcSkipped, 0)}` };
    });

    run('corroboration (unzip): the system unzip agrees on every zip fixture and rejects the corrupt one', () => {
      const v = corroborationVerdict({ present: tool.unzip, waived: waived.has('unzip') });
      corroboration.unzip = v.state;
      if (v.state !== 'present') {
        return { ok: v.ok, detail: v.state === 'waived' ? 'WAIVED: unzip not installed; zip validity rests on this module\'s own reader only, which is circular' : 'UNCORROBORATED: unzip is not installed, so zip validity is unchecked by anything independent of this module; install it or waive explicitly (allowUncorroborated / WSI_ALLOW_UNCORROBORATED=unzip)' };
      }
      const valid = manifest.filter((m) => /\.(docx|epub)$/.test(m.name) && m.kind !== 'zip-corrupt');
      const rows = valid.map((m) => zipHealth(m.path, true));
      const agree = valid.length >= 10 && rows.every((h) => h.unzipOk && h.namesAgree); // an empty list must not agree vacuously
      const corrupt = zipHealth(manifest.find((m) => m.kind === 'zip-corrupt').path, true);
      const control = (() => {
        const gdir = fs.mkdtempSync(path.join(os.tmpdir(), 'wsi-fixtures-'));
        created.push(gdir);
        const f = path.join(gdir, 'garbage.zip');
        fs.writeFileSync(f, crypto.randomBytes(300));
        return unzipTest(f) === false;
      })();
      return { ok: agree && corrupt.unzipOk === false && control, detail: `unzip -t and -Z1 agree on ${valid.length} valid zips=${agree} corrupt-rejected-by-unzip=${corrupt.unzipOk === false} random-bytes-rejected-by-unzip=${control}` };
    });

    /* -- docx ------------------------------------------------------------- */
    const byName = (n) => manifest.find((m) => m.name === n);
    const read = (n) => fs.readFileSync(byName(n).path);

    run('DOCX structure valid; canary in w:t text for docx and deflated docx; broken package rejected', () => {
      const ok1 = checkDocxStructure(read('manuscript.docx')).ok;
      const ok2 = checkDocxStructure(read('manuscript-deflated.docx')).ok;
      const t1 = docxBodyText(read('manuscript.docx')).includes(canary);
      const t2 = docxBodyText(read('manuscript-deflated.docx')).includes(canary);
      const broken = buildZip([{ name: 'word/document.xml', data: Buffer.from('<w:document><w:body></w:document>'), method: 'stored' }]).buffer;
      const brokenRejected = !checkDocxStructure(broken).ok;
      return { ok: ok1 && ok2 && t1 && t2 && brokenRejected, detail: `structure stored=${ok1} deflated=${ok2} canary-in-text stored=${t1} deflated=${t2} broken-package-rejected=${brokenRejected}` };
    });

    run('empty DOCX is valid yet carries no extractable text and no canary anywhere; extractor sees planted text', () => {
      const buf = read('empty.docx');
      const valid = checkDocxStructure(buf).ok;
      const text = docxBodyText(buf);
      const z = readZip(buf);
      const anywhere = z.entries.some((e) => readEntry(buf, e).includes(canary));
      const planted = buildZip([{ name: 'word/document.xml', data: Buffer.from(documentXmlOf([{ text: 'x' }])), method: 'stored' }]).buffer;
      const extractorLive = docxBodyText(planted) === 'x';
      return { ok: valid && text === '' && !anywhere && extractorLive, detail: `valid=${valid} w:t-text-length=${text.length} canary-in-any-entry=${anywhere} extractor-detects-planted-text=${extractorLive}` };
    });

    run('DOCX verifiers see a canary that docxBodyText cannot: comments, footnotes, headers, field codes, deleted text (deflated too)', () => {
      const body = documentXmlOf([{ text: 'a plain body with nothing to find' }]);
      const part = (root, inner) => `${XML_DECL}<w:${root} xmlns:w="${W_NS}">${inner}</w:${root}>`;
      const run1 = (t) => `<w:p><w:r><w:t xml:space="preserve">${t}</w:t></w:r></w:p>`;
      const extra = [
        { name: 'word/comments.xml', data: Buffer.from(part('comments', `<w:comment w:id="0">${run1(otherCanary)}</w:comment>`)), method: 'deflate' },
        { name: 'word/footnotes.xml', data: Buffer.from(part('footnotes', `<w:footnote w:id="1">${run1(otherCanary)}</w:footnote>`)), method: 'deflate' },
        { name: 'word/header1.xml', data: Buffer.from(part('hdr', run1(otherCanary))), method: 'deflate' },
      ];
      const multi = buildDocxFromXml(body, { extra, method: 'deflate' }).buffer; // deflated: a raw-byte scan is blind to every part
      const fieldXml = documentXmlOf([{ text: 'plain' }]).replace('</w:body>', `<w:p><w:r><w:instrText xml:space="preserve"> HYPERLINK "${otherCanary}" </w:instrText></w:r><w:r><w:delText>${otherCanary}</w:delText></w:r></w:p></w:body>`);
      const field = buildDocxFromXml(fieldXml, { method: 'deflate' }).buffer;
      const bodyBlind = !docxBodyText(multi).includes(otherCanary) && !docxBodyText(field).includes(otherCanary);
      const rawBlind = !multi.includes(otherCanary) && !field.includes(otherCanary);
      const found = zipEntriesContaining(multi, otherCanary).found.sort();
      const wantParts = ['word/comments.xml', 'word/footnotes.xml', 'word/header1.xml'];
      const partsOk = JSON.stringify(found) === JSON.stringify(wantParts);
      const tp = docxTextParts(multi).parts.filter((p) => p.text.includes(otherCanary)).map((p) => p.part).sort();
      const textPartsOk = JSON.stringify(tp) === JSON.stringify(wantParts);
      const fieldFound = docxTextParts(field).parts.filter((p) => p.text.includes(otherCanary)).map((p) => p.part);
      const fieldOk = JSON.stringify(fieldFound) === JSON.stringify(['word/document.xml']);
      const noFalsePositive = zipEntriesContaining(multi, canary).found.length === 0;
      const skipped = zipEntriesContaining(multi, otherCanary, { maxEntry: 8 });
      const skipSurfaced = skipped.found.length === 0 && skipped.skipped > 0; // an unread entry is reported, never silently "clean"
      const emptyNeedleRejected = throws(() => zipEntriesContaining(multi, ''));
      return { ok: bodyBlind && rawBlind && partsOk && textPartsOk && fieldOk && noFalsePositive && skipSurfaced && emptyNeedleRejected, detail: `docxBodyText-blind-to-them=${bodyBlind} raw-bytes-blind(deflated)=${rawBlind} zipEntriesContaining-finds-3-parts=${partsOk} docxTextParts-finds-3-parts=${textPartsOk} instrText+delText-found-in-document=${fieldOk} other-canary-not-found=${noFalsePositive} unread-entries-reported-not-hidden=${skipSurfaced} empty-needle-rejected=${emptyNeedleRejected}` };
    });

    /* -- epub ------------------------------------------------------------- */
    run('EPUB structure matches what the parser reads; DRM marker only on the DRM one; broken spine rejected', () => {
      const e1 = checkEpubStructure(read('book.epub'));
      const e2 = checkEpubStructure(read('book-drm.epub'));
      const hasEnc = (n) => readZip(read(n)).byName.has('META-INF/encryption.xml');
      const encRef = zipEntryText(read('book-drm.epub'), 'META-INF/encryption.xml');
      const targetsSpine = /URI="OEBPS\/chapter1\.xhtml"/.test(encRef) && /itemref idref="ch1"/.test(zipEntryText(read('book-drm.epub'), 'OEBPS/content.opf'));
      const t = epubBodyText(read('book.epub')).includes(canary);
      const brokenSpine = buildEpub(canary).buffer.toString('latin1').replace('idref="ch2"', 'idref="zz"');
      const brokenRejected = !checkEpubStructure(Buffer.from(brokenSpine, 'latin1')).ok;
      const notFirst = buildZip([{ name: 'x', data: Buffer.from('x'), method: 'stored' }, { name: 'mimetype', data: Buffer.from('application/epub+zip'), method: 'stored' }]).buffer;
      const orderCaught = !checkEpubStructure(notFirst).ok;
      return { ok: e1.ok && e2.ok && hasEnc('book-drm.epub') && !hasEnc('book.epub') && targetsSpine && t && brokenRejected && orderCaught, detail: `book=${e1.ok} drm=${e2.ok} encryption.xml drm-only=${hasEnc('book-drm.epub') && !hasEnc('book.epub')} cipher-ref-hits-spine-doc=${targetsSpine} canary-in-chapter-text=${t} broken-spine-rejected=${brokenRejected} mimetype-order-caught=${orderCaught}` };
    });

    /* -- pdf -------------------------------------------------------------- */
    run('PDFs: xref exact; text-layer yields the canary; scanned has no text machinery and no extractable text', () => {
      const tp = read('text-layer.pdf');
      const sp = read('scanned.pdf');
      const sTxt = checkPdfStructure(tp).ok;
      const sScan = checkPdfStructure(sp).ok;
      const runs = pdfTextRuns(tp);
      const hasCanary = runs.join('\n').includes(canary);
      const contiguous = runs.some((r) => r.includes(canary));
      const scannedAnalysis = analyzePdf(sp);
      const scannedEmpty = pdfTextRuns(sp).length === 0 && !pdfHasTextMachinery(sp) && scannedAnalysis.exact && /\/Subtype\s*\/Image/.test(sp.toString('latin1'));
      const textHasMachinery = pdfHasTextMachinery(tp);
      const tampered = Buffer.from(tp.toString('latin1').replace(/ 00000 n /, ' 00000 x '), 'latin1');
      const xrefCaught = !checkPdfStructure(tampered).ok;
      const withText = Buffer.concat([sp.subarray(0, sp.indexOf('endstream')), Buffer.from('BT /F1 12 Tf (x) Tj ET\n')]);
      const plantedDetected = pdfHasTextMachinery(withText) && pdfTextRuns(withText).length === 1;
      return { ok: sTxt && sScan && hasCanary && contiguous && scannedEmpty && textHasMachinery && xrefCaught && plantedDetected, detail: `xref text=${sTxt} scanned=${sScan} canary-in-Tj=${hasCanary} canary-contiguous=${contiguous} scanned-no-text(exact analysis)=${scannedEmpty} text-pdf-has-machinery=${textHasMachinery} xref-tamper-caught=${xrefCaught} planted-text-detected=${plantedDetected}` };
    });

    run('PDF verifiers are sound on compressed and array-form text, and say so when they cannot be sure (the old ones were blind to both)', () => {
      const variants = {
        plain: buildTextPdf(canary),
        flate: buildTextPdf(canary, { flate: true }),
        tj: buildTextPdf(canary, { tjArrays: true }),
        flateTj: buildTextPdf(canary, { flate: true, tjArrays: true }),
      };
      const rows = Object.entries(variants).map(([n, b]) => {
        const a = analyzePdf(b);
        // `exported`: the EXPORTED pdfTextRuns (what other modules call) must agree with the analysis and find the canary, with no host tool involved
        const exported = pdfTextRuns(b);
        return { n, found: a.runs.join('').includes(canary), exported: JSON.stringify(exported) === JSON.stringify(a.runs) && exported.join('').includes(canary), exact: a.exact, machinery: pdfHasTextMachinery(b), struct: checkPdfStructure(b).ok, legacy: legacyPdfTextRuns(b).join('').includes(canary) };
      });
      const allFound = rows.every((r) => r.found && r.exported && r.exact && r.machinery && r.struct);
      const legacyBlind = rows.filter((r) => r.legacy).map((r) => r.n); // which variants the OLD extractor could read
      const legacyMissesCompressed = !rows.find((r) => r.n === 'flate').legacy && !rows.find((r) => r.n === 'tj').legacy && !rows.find((r) => r.n === 'flateTj').legacy && rows.find((r) => r.n === 'plain').legacy;
      const hidden = Buffer.from(variants.flate.toString('latin1').replace('/Type /Font /Subtype /Type1 /BaseFont /Helvetica', '/Type /Other').replace('/Font << /F1 5 0 R >>', '/ProcSet [/PDF]'), 'latin1');
      const hiddenSeen = pdfHasTextMachinery(hidden) && !legacyPdfHasTextMachinery(hidden); // BT/Tf live only inside the compressed stream
      const unknownFilter = Buffer.from(variants.flate.toString('latin1').replace('/Filter /FlateDecode', '/Filter /ASCII85Decode'), 'latin1');
      const ua = analyzePdf(unknownFilter);
      const unsureHonest = !ua.exact && ua.streams.undecodable === 1 && ua.runs.length === 0 && pdfHasTextMachinery(unknownFilter); // empty runs here must NOT read as "no text"
      const scanned = analyzePdf(read('scanned.pdf'));
      const scannedPositive = scanned.exact && scanned.runs.length === 0 && !scanned.machinery; // an empty result is a positive claim only when exact
      // Code-remapping fonts: the literal string is not the displayed text, so the analysis must not be called exact.
      const remapped = analyzePdf(buildRemappedFontPdf());
      const oldExactRule = (a) => a.streams.undecodable === 0 && a.hexShowOperands === 0 && !a.encrypted; // the formula before font encodings were considered
      const remapHonest = remapped.runs.join('') === 'AAAA' && remapped.opaqueFontEncoding && !remapped.exact && oldExactRule(remapped) && pdfHasTextMachinery(buildRemappedFontPdf());
      const type0 = analyzePdf(Buffer.from(variants.plain.toString('latin1').replace('/Subtype /Type1', '/Subtype /Type0'), 'latin1'));
      const toUni = analyzePdf(Buffer.from(variants.plain.toString('latin1').replace('/BaseFont /Helvetica', '/BaseFont /Helvetica /ToUnicode 9 0 R'), 'latin1'));
      const otherOpaque = !type0.exact && type0.opaqueFontEncoding && !toUni.exact && toUni.opaqueFontEncoding;
      const plainNotOpaque = rows.every((r) => !analyzePdf(variants[r.n]).opaqueFontEncoding) && !scanned.opaqueFontEncoding; // no false positive on the generated PDFs
      return { ok: allFound && legacyMissesCompressed && hiddenSeen && unsureHonest && scannedPositive && remapHonest && otherOpaque && plainNotOpaque, detail: `flate/tj/flate+tj/plain: canary-found+exact+machinery=${allFound} old-extractor-read-only=[${legacyBlind.join(',')}] machinery-in-compressed-stream-seen(old: not)=${hiddenSeen} unknown-filter-not-reported-exact=${unsureHonest} scanned-empty-is-exact=${scannedPositive} code-remapping-font-not-exact(old rule said exact: ${oldExactRule(remapped)})=${remapHonest} type0+ToUnicode-not-exact=${otherOpaque} generated-pdfs-not-flagged=${plainNotOpaque}` };
    });

    /* -- new fixtures: structure ------------------------------------------ */
    run('table/image DOCX and the EPUB boundary fixtures have exactly the structure their notes claim', () => {
      const tbl = read('docx-table-no-header.docx');
      const img = read('docx-embedded-image.docx');
      const tblXml = zipEntryText(tbl, 'word/document.xml');
      const tblOk = checkDocxStructure(tbl).ok && tblXml.includes('<w:tbl>') && !tblXml.includes('tblHeader') && (tblXml.match(/<w:tr>/g) ?? []).length === 2;
      const zi = readZip(img);
      const png = zi.byName.get('word/media/image1.png') ? readEntry(img, zi.byName.get('word/media/image1.png')) : Buffer.alloc(0);
      const pngSig = png.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
      let chunksOk = pngSig;
      for (let p = 8; chunksOk && p < png.length; ) {
        const len = png.readUInt32BE(p);
        chunksOk = p + 12 + len <= png.length && png.readUInt32BE(p + 8 + len) === crc32(png.subarray(p + 4, p + 8 + len));
        p += 12 + len;
      }
      const imgXml = zipEntryText(img, 'word/document.xml');
      const imgOk = checkDocxStructure(img).ok && chunksOk && /<a:blip r:embed="rId2"\/>/.test(imgXml) && /Id="rId2"[^>]*Target="media\/image1\.png"/.test(zipEntryText(img, 'word/_rels/document.xml.rels')) && zipEntryText(img, '[Content_Types].xml').includes('Extension="png"');
      const canaryInBoth = docxBodyText(tbl).includes(canary) && docxBodyText(img).includes(canary);
      const total = (n) => readZip(read(n)).entries.reduce((a, e) => a + e.usize, 0);
      const count = (n) => readZip(read(n)).entries.length;
      const entriesOk = count('epub-entries-at-cap.epub') === 2000 && count('epub-entries-over-cap.epub') === 2001 && count('book.epub') === 6;
      const totalsOk = total('epub-total-at-cap.epub') === 67108864 && total('epub-total-over-cap.epub') === 67108865 && total('book.epub') < 10000;
      const ch3 = (n) => readZip(read(n)).byName.get('OEBPS/chapter3.xhtml');
      const chapterOk = ch3('epub-chapter-at-cap.epub').usize === 8388608 && ch3('epub-chapter-over-cap.epub').usize === 8388609 && ch3('epub-chapter-at-cap.epub').method === 8;
      const chapterXmlOk = isWellFormedXml(zipEntryText(read('epub-chapter-at-cap.epub'), 'OEBPS/chapter3.xhtml')).ok && /idref="ch3"/.test(zipEntryText(read('epub-chapter-at-cap.epub'), 'OEBPS/content.opf'));
      const structure = ['epub-entries-at-cap.epub', 'epub-entries-over-cap.epub', 'epub-total-at-cap.epub', 'epub-total-over-cap.epub', 'epub-chapter-at-cap.epub', 'epub-chapter-over-cap.epub'].every((n) => checkEpubStructure(read(n)).ok);
      const rawVisible = ['epub-entries-at-cap.epub', 'epub-total-at-cap.epub', 'epub-chapter-at-cap.epub'].every((n) => read(n).includes(canary));
      const controls = count('epub-entries-at-cap.epub') !== count('epub-entries-over-cap.epub') && total('epub-total-at-cap.epub') !== total('epub-total-over-cap.epub') && ch3('epub-chapter-at-cap.epub').usize !== ch3('epub-chapter-over-cap.epub').usize;
      // The EPUB text-cap fixture: a deflated, well-formed, in-spine third chapter whose text is over the parser's cap by a wide margin,
      // measured two ways that share no code for the bulk (the model's tag-stripping lower bound over the whole spine, and a plain sum over
      // chapter 3's <p> elements plus chapters 1-2, which book.epub measures), against a control far below the cap. The canary is in chapter 1 only, so it stays raw-visible without touching the bulk text.
      const textFx = read('epub-text-over-cap.epub');
      const textXml = zipEntryText(textFx, 'OEBPS/chapter3.xhtml');
      const modelUnits = measureUpload(textFx, 'epub-text-over-cap.epub', MIME.epub).zip().epub().textUnits();
      const sumOfParagraphs = [...textXml.matchAll(/<p>([^<]*)<\/p>/g)].reduce((a, m) => a + m[1].length, 0) + 'Ledger'.length;
      const controlUnits = measureUpload(read('book.epub'), 'book.epub', MIME.epub).zip().epub().textUnits();
      const textFixtureOk = checkEpubStructure(textFx).ok && isWellFormedXml(textXml).ok && /idref="ch3"/.test(zipEntryText(textFx, 'OEBPS/content.opf'))
        && ch3('epub-text-over-cap.epub').method === 8 && ch3('epub-text-over-cap.epub').usize < LIMITS.EPUB_MAX_ENTRY_BYTES && !textXml.includes(canary) && textFx.includes(canary)
        && modelUnits === sumOfParagraphs + controlUnits && modelUnits > EPUB_TEXT_CAP * 1.1 && modelUnits < EPUB_TEXT_CAP * 1.5 && controlUnits < EPUB_TEXT_CAP / 10;
      return { ok: tblOk && imgOk && canaryInBoth && entriesOk && totalsOk && chapterOk && chapterXmlOk && structure && rawVisible && controls && textFixtureOk, detail: `table-docx(no tblHeader, 2 rows)=${tblOk} image-docx(png crc, blip, rel, content-type)=${imgOk} canary-in-both=${canaryInBoth} entries 2000/2001=${entriesOk} declared-total 64MiB/+1=${totalsOk} chapter3 8MiB/+1 deflated=${chapterOk} chapter3-xml+spine=${chapterXmlOk} epub-structure=${structure} canary-raw-visible=${rawVisible} off-by-one-controls-differ=${controls} epub-text-fixture(chars=${modelUnits}, cap=${EPUB_TEXT_CAP}, model==independent-chapter3-sum+chapters1-2:${modelUnits === sumOfParagraphs + controlUnits}, control=${controlUnits})=${textFixtureOk}` };
    });

    /* -- canary placement ------------------------------------------------- */
    run('canary placement: present in body text where claimed, absent everywhere else, raw flag derived correctly', () => {
      const bad = [];
      for (const m of manifest) {
        const buf = fs.readFileSync(m.path);
        const raw = buf.includes(canary);
        if (raw !== m.canaryInRawBytes) bad.push(`${m.name}:rawflag`);
        let decoded = null;
        if (!['zip-bomb-docx', 'zip-corrupt'].includes(m.kind)) decoded = decodedBodyText(m.kind, buf);
        if (m.containsCanary) {
          if (decoded !== null && !decoded.includes(canary)) bad.push(`${m.name}:missing-in-body`);
          if (decoded === null && !raw) bad.push(`${m.name}:missing`);
        } else {
          if (raw) bad.push(`${m.name}:unexpected-raw`);
          if (decoded !== null && decoded.includes(canary)) bad.push(`${m.name}:unexpected-body`);
        }
      }
      const deflated = byName('manuscript-deflated.docx');
      const deflatedBlind = deflated.containsCanary && !deflated.canaryInRawBytes;
      const utf16 = byName('text-utf16le.txt');
      const utf16Blind = utf16.containsCanary && !utf16.canaryInRawBytes; // UTF-16 separates every letter with a NUL, so a raw scan misses it
      const storedVisible = byName('manuscript.docx').canaryInRawBytes && byName('book.epub').canaryInRawBytes && byName('text-layer.pdf').canaryInRawBytes;
      const wrongCanaryMisses = !read('notes.txt').includes(otherCanary);
      return { ok: bad.length === 0 && deflatedBlind && utf16Blind && storedVisible && wrongCanaryMisses, detail: `violations=${bad.length}${bad.length ? ' [' + bad.join(',') + ']' : ''} deflated-docx-blind-to-raw-scan=${deflatedBlind} utf16-text-blind-to-raw-scan=${utf16Blind} stored-formats-raw-visible=${storedVisible} other-canary-not-found=${wrongCanaryMisses}` };
    });

    run('corrupt zip: still raw-visible canary, no end-of-central-directory, intact original reads fine', () => {
      const c = read('corrupt-truncated.docx');
      const intact = buildDocx(canary).buffer;
      const noEocd = throws(() => readZip(c)) && c.indexOf(Buffer.from([0x50, 0x4b, 0x05, 0x06])) === -1;
      const shorter = c.length < intact.length;
      const rawVisible = c.includes(canary);
      const intactOk = !throws(() => readZip(intact));
      return { ok: noEocd && shorter && rawVisible && intactOk, detail: `eocd-absent+reader-rejects=${noEocd} shorter-than-intact=${shorter} canary-raw-visible=${rawVisible} intact-original-accepted=${intactOk}` };
    });

    /* -- bombs ------------------------------------------------------------ */
    run('zip bombs: ~100 MiB declared and real, tiny on disk, high ratio; ratio test rejects a normal docx', () => {
      const HUNDRED_MIB = 104857600; // literal on purpose: the check must not be graded by the constant the generator uses
      const ratioOf = (buf) => {
        const z = readZip(buf);
        const u = z.entries.reduce((a, e) => a + e.usize, 0);
        return { u, c: buf.length, ratio: u / buf.length };
      };
      const rows = {};
      for (const n of ['zip-bomb.epub', 'zip-bomb.docx']) {
        const buf = read(n);
        const r = ratioOf(buf);
        const z = readZip(buf);
        const big = z.entries.reduce((a, e) => (e.usize > a.usize ? e : a));
        const data = readEntry(buf, big, { maxOutput: HUNDRED_MIB }); // real inflate + CRC
        const zlibCrcAgrees = typeof zlib.crc32 !== 'function' || zlib.crc32(data) === big.crc;
        rows[n] = { ...r, bigName: big.name, exact: data.length === HUNDRED_MIB, zlibCrcAgrees, data };
      }
      const epubData = rows['zip-bomb.epub'].data;
      const uniform = (buf, byte, from = 0, to = buf.length) => {
        for (let i = from; i < to; i++) if (buf[i] !== byte) return false;
        return true;
      };
      const epubAllNul = uniform(epubData, 0);
      const docData = rows['zip-bomb.docx'].data;
      const head = Buffer.from(BOMB_DOC_HEAD);
      const tail = Buffer.from(BOMB_DOC_TAIL);
      const middleZeros = uniform(docData, 0x30, head.length, docData.length - tail.length);
      const docWellFormed = isWellFormedXml(BOMB_DOC_HEAD + '0' + BOMB_DOC_TAIL).ok && docData.subarray(0, head.length).equals(head) && docData.subarray(docData.length - tail.length).equals(tail);
      delete rows['zip-bomb.epub'].data;
      delete rows['zip-bomb.docx'].data;
      const small = Object.values(rows).every((r) => r.c < 1024 * 1024 && r.u >= HUNDRED_MIB && r.u > LIMITS.EPUB_MAX_TOTAL_BYTES && r.ratio >= 500 && r.exact && r.zlibCrcAgrees);
      const normal = ratioOf(read('manuscript-deflated.docx'));
      const ratioDiscriminates = normal.ratio < 20;
      const epubBigOutsideSpine = rows['zip-bomb.epub'].bigName === 'OEBPS/padding.bin' && !/padding/.test(zipEntryText(read('zip-bomb.epub'), 'OEBPS/content.opf')) && checkEpubStructure(read('zip-bomb.epub')).ok;
      const docxBigIsDocument = rows['zip-bomb.docx'].bigName === 'word/document.xml';
      return { ok: small && ratioDiscriminates && epubAllNul && middleZeros && docWellFormed && epubBigOutsideSpine && docxBigIsDocument, detail: `epub: ${rows['zip-bomb.epub'].c}B on disk -> ${rows['zip-bomb.epub'].u}B (x${Math.round(rows['zip-bomb.epub'].ratio)}); docx: ${rows['zip-bomb.docx'].c}B -> ${rows['zip-bomb.docx'].u}B (x${Math.round(rows['zip-bomb.docx'].ratio)}); real-inflate-exact+crc-agree=${small} normal-docx-ratio=${normal.ratio.toFixed(1)} (<20 so test discriminates) epub-padding-all-NUL-and-outside-spine=${epubAllNul && epubBigOutsideSpine} docx-document-is-the-big-entry-and-well-formed=${docxBigIsDocument && docWellFormed && middleZeros}` };
    });

    /* -- limits ----------------------------------------------------------- */
    run('text limit fixtures: ASCII pair is exactly 2,000,000 / 2,000,001 characters; the astral pair separates UTF-16 length from bytes and code points', () => {
      const a = read('text-at-limit.txt').toString('utf8').length;
      const b = read('text-over-limit.txt').toString('utf8').length;
      const asciiOnly = (n) => /^[\x00-\x7f]*$/.test(read(n).toString('latin1'));
      const stats = (n) => {
        const buf = read(n);
        const s = buf.toString('utf8');
        const pairs = (s.match(/[\ud800-\udbff][\udc00-\udfff]/g) ?? []).length;
        return { units: s.length, codePoints: s.length - pairs, bytes: buf.length, roundTrips: Buffer.from(s, 'utf8').equals(buf) };
      };
      const sa = stats('text-astral-at-limit.txt');
      const so = stats('text-astral-over-limit.txt');
      const ascii = a === 2000000 && b === 2000001 && a !== b && asciiOnly('text-at-limit.txt') && asciiOnly('text-over-limit.txt');
      const exactUnits = sa.units === 2000000 && so.units === 2000001 && sa.roundTrips && so.roundTrips;
      const astralSeparates = sa.bytes > LIMITS.MAX_TEXT_CHARS && so.bytes > LIMITS.MAX_TEXT_CHARS && sa.codePoints < LIMITS.MAX_TEXT_CHARS && so.codePoints < LIMITS.MAX_TEXT_CHARS && sa.codePoints > 900000;
      // What each wrong unit would conclude (the discrimination matrix below proves the same through the model):
      const byteRuleRefusesAtLimit = sa.bytes > LIMITS.MAX_TEXT_CHARS; // bytes: at-limit would be refused although it must be accepted
      const codePointRuleAcceptsOver = so.codePoints <= LIMITS.MAX_TEXT_CHARS; // code points: over-limit would be accepted although it must be refused
      const asciiCannotTell = read('text-at-limit.txt').length === a && read('text-over-limit.txt').length === b; // bytes === characters in both files, so the ASCII pair is blind to the unit: which is why it is not enough
      return { ok: ascii && exactUnits && astralSeparates && byteRuleRefusesAtLimit && codePointRuleAcceptsOver && asciiCannotTell, detail: `ascii at=${a} over=${b} at-limit-equals-wrong-value:${a === 2000001}; astral at-units=${sa.units} over-units=${so.units} at-code-points=${sa.codePoints} over-code-points=${so.codePoints} at-bytes=${sa.bytes} over-bytes=${so.bytes}; byte-rule-would-refuse-at-limit=${byteRuleRefusesAtLimit} code-point-rule-would-accept-over=${codePointRuleAcceptsOver} ascii-pair-alone-cannot-tell-units=${asciiCannotTell}` };
    });

    run('text encoding fixtures: BOM kept, UTF-16 reads as NUL-laced UTF-8, NUL byte present', () => {
      const bom = read('text-utf8-bom.txt');
      const u16 = read('text-utf16le.txt');
      const nul = read('text-with-nul.txt');
      const asUtf8 = (b) => b.toString('utf8');
      const bomOk = bom[0] === 0xef && bom[1] === 0xbb && bom[2] === 0xbf && asUtf8(bom).startsWith('﻿') && asUtf8(bom).length === plainTextOf(canary).length + 1;
      const u16Ok = u16[0] === 0xff && u16[1] === 0xfe && asUtf8(u16).includes('\u0000') && asUtf8(u16).startsWith('��') && !asUtf8(u16).includes(canary) && u16.subarray(2).toString('utf16le').includes(canary);
      const nulOk = asUtf8(nul).includes('\u0000') && (asUtf8(nul).match(/\u0000/g) ?? []).length === 1 && asUtf8(nul).includes(canary);
      const plainHasNone = !asUtf8(read('notes.txt')).includes('\u0000');
      return { ok: bomOk && u16Ok && nulOk && plainHasNone, detail: `bom(EF BB BF, +1 char)=${bomOk} utf16le(FF FE; utf8-read has U+FFFD pair and NULs; canary only after UTF-16 decode)=${u16Ok} nul(exactly one U+0000)=${nulOk} ordinary-text-has-no-NUL=${plainHasNone}` };
    });

    run('empty-file is 0 bytes; unsupported-format is not a format detectFormat accepts', () => {
      const e = byName('empty-file.txt').bytes === 0 && byName('empty-file.txt').sha256 === crypto.createHash('sha256').update('').digest('hex');
      const r = byName('unsupported-format.rtf');
      const okExt = r.name.endsWith('.rtf') && r.mime === 'application/rtf' && !r.mime.startsWith('text/');
      const wrongMimeWouldBeAccepted = 'text/rtf'.startsWith('text/');
      return { ok: e && okExt && wrongMimeWouldBeAccepted, detail: `empty=${e} rtf-ext+non-text-mime=${okExt} text/rtf-would-be-accepted-by-mime-fallback=${wrongMimeWouldBeAccepted}` };
    });

    /* -- determinism and overwrite --------------------------------------- */
    run('generation is deterministic per canary; a different canary changes canary-bearing files only', () => {
      const sha = (b) => crypto.createHash('sha256').update(b).digest('hex');
      const same = sha(buildTextPdf(canary)) === byName('text-layer.pdf').sha256 && sha(buildDocx(canary).buffer) === byName('manuscript.docx').sha256 && sha(buildEpub(canary).buffer) === byName('book.epub').sha256 && sha(buildDocxWithTable(canary).buffer) === byName('docx-table-no-header.docx').sha256 && sha(buildEpubWithEntryCount(canary, 2000).buffer) === byName('epub-entries-at-cap.epub').sha256;
      const changes = sha(buildTextPdf(otherCanary)) !== byName('text-layer.pdf').sha256 && sha(buildDocx(otherCanary).buffer) !== byName('manuscript.docx').sha256 && sha(buildEpub(otherCanary).buffer) !== byName('book.epub').sha256;
      const canaryFree = sha(buildScannedPdf()) === byName('scanned.pdf').sha256 && sha(buildEmptyDocx()) === byName('empty.docx').sha256;
      const optionsDefaultUnchanged = sha(buildTextPdf(canary, {})) === sha(buildTextPdf(canary)) && sha(buildTextPdf(canary, { flate: true })) !== sha(buildTextPdf(canary));
      return { ok: same && changes && canaryFree && optionsDefaultUnchanged, detail: `same-canary-same-bytes=${same} other-canary-different-bytes=${changes} canary-free-fixtures-unchanged=${canaryFree} pdf-options-leave-default-bytes-unchanged=${optionsDefaultUnchanged}` };
    });

    run('refuses to overwrite existing files unless asked; never writes large files unless asked', () => {
      const refused = throws(() => generateFixturesSync(dir, { canary }));
      const noLarge = !fs.readdirSync(dir).some((n) => n.startsWith('limit-'));
      const before = new Map(manifest.map((m) => [m.name, m.sha256]));
      const again = generateFixturesSync(dir, { canary, overwrite: true });
      const stable = again.every((m) => before.get(m.name) === m.sha256);
      const noLargeStill = again.length === manifest.length;
      return { ok: refused && noLarge && stable && noLargeStill, detail: `second-call-without-overwrite-throws=${refused} no-large-files-by-default=${noLarge} overwrite-reproduces-identical-bytes=${stable}` };
    });

    /* -- large (exact byte lengths) -------------------------------------- */
    run('large fixtures: exactly 26214400 and 26214401 bytes (statSync), valid docx, canary in body; absent when not requested', () => {
      const bigDir = fs.mkdtempSync(path.join(os.tmpdir(), 'wsi-fixtures-'));
      created.push(bigDir);
      const m = generateFixturesSync(bigDir, { canary, includeLarge: true });
      largeManifest = m;
      const exact = m.find((x) => x.kind === 'docx-size-limit-exact');
      const over = m.find((x) => x.kind === 'docx-size-limit-over');
      const sizes = fs.statSync(exact.path).size === 26214400 && fs.statSync(over.path).size === 26214401;
      const matchesLimit = exact.bytes === LIMITS.MAX_FILE_BYTES && over.bytes === LIMITS.MAX_FILE_BYTES + 1;
      const wrongRejected = exact.bytes !== LIMITS.MAX_FILE_BYTES + 1 && over.bytes !== LIMITS.MAX_FILE_BYTES;
      const eb = fs.readFileSync(exact.path);
      const valid = checkDocxStructure(eb).ok && checkDocxStructure(fs.readFileSync(over.path)).ok;
      const inBody = docxBodyText(eb).includes(canary);
      const health = zipHealth(exact.path, tool.unzip);
      const unzipOk = !tool.unzip || (health.unzipOk && health.namesAgree);
      const onlyAddedLarge = m.length === manifest.length + 2;
      const defaultHasNone = !manifest.some((x) => x.kind.startsWith('docx-size-limit'));
      return { ok: sizes && matchesLimit && wrongRejected && valid && inBody && health.own && unzipOk && onlyAddedLarge && defaultHasNone, detail: `statSync exact=${fs.statSync(exact.path).size} over=${fs.statSync(over.path).size} == LIMIT/LIMIT+1:${matchesLimit} off-by-one-controls-differ=${wrongRejected} both-valid-docx=${valid} canary-in-body=${inBody} own-reader=${health.own} unzip=${tool.unzip ? unzipOk : 'not run (see the unzip corroboration check)'} only-two-added=${onlyAddedLarge} default-set-has-none=${defaultHasNone}` };
    });

    /* -- source anchoring ------------------------------------------------- */
    const sources = readSources(root);
    const missingSources = Object.entries(sources).filter(([, v]) => v === null).map(([k]) => k);
    const facts = missingSources.length ? null : factsFromSources(sources);

    run('comment stripper contract the anchors depend on: same length and newlines, comments gone, literals intact, unclosed constructs reported (a naive stripper fails it)', () => {
      const ts = "const a = 1; // zzcomment one\n/* zzcomment\n two */ const b = '// kept one'; const c = `/* kept two */`; // zzcomment tail\n";
      const sql = "SELECT '-- kept one'; -- zzcomment one\n/* zzcomment */ SELECT 1;\n";
      const newlines = (s) => [...s].flatMap((ch, i) => (ch === '\n' ? [i] : [])).join(',');
      const sound = (fn, input, keeps) => {
        const o = fn(input);
        return typeof o === 'string' && o.length === input.length && newlines(o) === newlines(input) && !o.includes('zzcomment') && keeps.every((k) => o.includes(k));
      };
      const tsKeeps = ["'// kept one'", '`/* kept two */`'];
      const tsSound = sound((s) => stripComments(s, { jsx: false }), ts, tsKeeps);
      const sqlSound = sound(stripSqlComments, sql, ["'-- kept one'"]);
      const naive = (s) => s.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, ''); // what a careless stripper does: cuts into literals and shifts every offset
      const naiveFails = !sound(naive, ts, tsKeeps);
      const hasDetailed = typeof stripLib.stripCommentsDetailed === 'function' && typeof stripLib.stripSqlCommentsDetailed === 'function';
      const reportsUnclosed = hasDetailed && stripLib.stripCommentsDetailed('const a = 1; /* never closed\n', { jsx: false }).issues.length > 0 && stripLib.stripSqlCommentsDetailed('SELECT 1; /* never closed\n').issues.length > 0;
      const quietWhenClosed = hasDetailed && stripLib.stripCommentsDetailed(ts, { jsx: false }).issues.length === 0 && stripLib.stripSqlCommentsDetailed(sql).issues.length === 0;
      // The choice of `jsx: false` must be immaterial for the anchored files, or the facts would depend on a heuristic.
      const tsKeys = ['route', 'parse', 'landing', 'release', 'arrivals', 'fidelity'];
      const jsxMoot = missingSources.length === 0 && tsKeys.every((k) => stripComments(sources[k]) === stripComments(sources[k], { jsx: false }));
      return {
        ok: tsSound && sqlSound && naiveFails && reportsUnclosed && quietWhenClosed && jsxMoot,
        detail: `ts-length+newlines+comments+literals=${tsSound} sql=${sqlSound} naive-stripper-fails-the-same-test=${naiveFails} detailed-variants-exported=${hasDetailed} unclosed-block-comment-reported=${reportsUnclosed} closed-input-reports-none=${quietWhenClosed} jsx-on==jsx-off-for-all-${tsKeys.length}-anchored-ts-files=${jsxMoot}`,
      };
    });

    run('source anchors: every fact the expectations rest on is re-derived from the comment-stripped source and matches its pin (no drift)', () => {
      if (missingSources.length) return { ok: false, detail: `source files not found: ${missingSources.join(',')}` };
      const bad = compareFactsToLimits(facts);
      const nulls = Object.entries(facts).filter(([, v]) => v === null).map(([k]) => k);
      return { ok: bad.length === 0 && nulls.length === 0, detail: `drift-from-fixture-assumptions=${bad.length}${bad.length ? ' [' + bad.join(' | ') + ']' : ''} unresolved-facts=${nulls.length}${nulls.length ? ' [' + nulls.join(',') + ']' : ''} facts=${Object.keys(facts).length} regions-pinned=${Object.keys(SOURCE_PINS.regionDigests).length} sourceIntakeReleased-at-this-source=${facts.sourceIntakeReleased}` };
    });

    run('source anchors are lethal: every realistic source change is flagged by its NAMED detector; comment/whitespace edits are not; commented-out code does not count as live', () => {
      if (missingSources.length) return { ok: false, detail: 'source files not found' };
      const M = (file, from, to) => ({ file, from, to });
      const catalog = [
        // [id, mutation, detector that must fire]
        ['gate: refuse empty extraction before custody (the obvious repair of the routed defect)', M('route', 'if (result.text.length > MAX_TEXT_CHARS) {', "if (result.text.length === 0) {\n      return NextResponse.json({ error: 'x' }, { status: 422 });\n    }\n    if (result.text.length > MAX_TEXT_CHARS) {"), 'pinned list routeStatusesParse'],
        ['parse: empty DOCX throws while the warning string stays', M('parse', 'const warnings = result.text.trim().length === 0', "if (result.text.trim().length === 0) throw new UnsupportedUploadError('empty');\n    const warnings = result.text.trim().length === 0"), 'parseNeverThrowsOnEmptyDocx'],
        ['parse: scanned PDF throws', M('parse', 'if (text.trim().length === 0 || avgPerPage < 20) {', "if (text.trim().length === 0) throw new UnsupportedUploadError('scanned');\n    if (text.trim().length === 0 || avgPerPage < 20) {"), 'pdfScannedIsWarningNotThrow'],
        ['landing: byte gate ">" becomes ">="', M('landing', 'bytes.length <= 0 || bytes.length > MAX_FILE_BYTES', 'bytes.length <= 0 || bytes.length >= MAX_FILE_BYTES'), 'landingGateOverMax'],
        ['route: size gate ">" becomes ">="', M('route', 'if (file.size > MAX_FILE_BYTES) {', 'if (file.size >= MAX_FILE_BYTES) {'), 'route statusOverSize'],
        ['route: text gate ">" becomes ">="', M('route', 'if (result.text.length > MAX_TEXT_CHARS) {', 'if (result.text.length >= MAX_TEXT_CHARS) {'), 'route statusTextOverCap'],
        ['route: text gate counts BYTES instead of characters', M('route', 'if (result.text.length > MAX_TEXT_CHARS) {', 'if (Buffer.byteLength(result.text) > MAX_TEXT_CHARS) {'), 'route text cap unit'],
        ['route: 503 becomes 500', M('route', '{ status: 503, headers', '{ status: 500, headers'), 'route statusIncomplete'],
        ['epub: total-size guard switched off', M('parse', 'if (knownTotal > EPUB_MAX_TOTAL_BYTES) {', 'if (false) {'), 'epubGuardTotal'],
        ['epub: entry-count guard switched off', M('parse', 'if (entries.length > EPUB_MAX_ENTRIES) {', 'if (false) {'), 'epubGuardEntries'],
        ['epub: extracted-text cap constant raised (declared outside every digested region, so a digest cannot see it)', M('parse', 'const EPUB_MAX_TEXT_CHARS = 2_000_000;', 'const EPUB_MAX_TEXT_CHARS = 3_000_000;'), 'EPUB_MAX_TEXT_CHARS'],
        ['epub: extracted-text guard switched off', M('parse', "if (documents.join('\\n\\n').length > EPUB_MAX_TEXT_CHARS) {", 'if (false) {'), 'epubGuardText'],
        ['epub: per-chapter size guard emptied', M('parse', "throw new UnsupportedUploadError('One EPUB chapter is unexpectedly large.');", 'void 0;'), 'epubGuardEntrySpine'],
        ['epub: DRM guard switched off', M('parse', 'if (spinePaths.includes(target)', 'if (false && spinePaths.includes(target)'), 'epubGuardDrm'],
        ['epub: CRC32 verification at load switched off (the note about inflation would become false)', M('parse', 'checkCRC32: true', 'checkCRC32: false'), 'epubInflatesBeforeTotalGuard'],
        ['detectFormat: .rtf accepted as text', M('parse', "if (ext === 'txt' || ext === 'md' || ext === 'markdown') return 'text';", "if (ext === 'txt' || ext === 'md' || ext === 'markdown' || ext === 'rtf') return 'text';"), 'pinned list extRules'],
        ['landing: empty-text gate removed', M('landing', 'input.sourceText.length === 0 ||', ''), 'landingRefusesEmptyText'],
        ['landing: empty-text gate commented out (block comment)', M('landing', 'input.sourceText.length === 0 ||', '/* input.sourceText.length === 0 || */'), 'landingRefusesEmptyText'],
        ['route: MAX_FILE_BYTES raised, old line left in a comment above it', M('route', 'const MAX_FILE_BYTES = 25 * 1024 * 1024;', '// was: const MAX_FILE_BYTES = 25 * 1024 * 1024;\nconst MAX_FILE_BYTES = 50 * 1024 * 1024;'), 'route MAX_FILE_BYTES'],
        ['arrivals: an early empty-text gate is added before delegation', M('arrivals', "if (params.extractor === 'supplied') {", "if (params.sourceText.length === 0) {\n    throw new Error('empty');\n  }\n  if (params.extractor === 'supplied') {"), 'arrivalsDelegatesUnconditionally'],
      ];
      const undetected = [];
      const wrongDetector = [];
      let structuralOnly = 0;
      for (const [id, mut, expected] of catalog) {
        const src = { ...sources, [mut.file]: mutate(sources[mut.file], mut.from, mut.to) };
        const found = compareFactsToLimits(factsFromSources(src));
        if (found.length === 0) undetected.push(id);
        else if (!found.includes(expected)) wrongDetector.push(`${id} -> ${found.join('|')}`);
        else if (found.some((f) => !f.startsWith('region '))) structuralOnly++;
      }
      // Code that decides the route's behaviour but that no structural fact reads: a change must move the NAMED region digest (digest-only by design).
      const digestCatalog = [
        ['parse: extOf returns a truncated extension (feeds detectFormat)', M('parse', "return m ? m[1] : '';", "return m ? m[1].slice(0, 3) : '';"), 'region drift parse.extOf'],
        ['parse: EPUB paragraphs stop contributing text (every text-bearing EPUB would become an empty extraction)', M('parse', "if (name === 'p') {", "if (name === 'p' && false) {"), 'region drift parse.epubTextConversion'],
        ['parse: EPUB path safety refuses every in-package reference', M('parse', "if (!joined || joined === '..' ||", "if (true || !joined || joined === '..' ||"), 'region drift parse.epubPackageResolution'],
        ['parse: EPUB XML errors are ignored (a malformed package would parse)', M('parse', 'errors.length > 0 || elementsNamed(document', 'false && errors.length > 0 || elementsNamed(document'), 'region drift parse.epubPackageResolution'],
        ['parse: EPUB skip list gains p', M('parse', "'nav', 'noscript']);", "'nav', 'noscript', 'p']);"), 'region drift parse.epubTextConversion'],
        ['route: release hold inverted', M('route', 'if (!PRESS_SOURCE_INTAKE_RELEASED) {', 'if (PRESS_SOURCE_INTAKE_RELEASED) {'), 'region drift route.releaseHold'],
        ['route: release flag replaced by a constant true', M('route', 'const PRESS_SOURCE_INTAKE_RELEASED = writerReleaseAuthority().sourceIntakeReleased;', 'const PRESS_SOURCE_INTAKE_RELEASED = true;'), 'region drift route.releaseHold'],
        ['fidelity: the uneven-rows rule inverted (no structural fact reads it)', M('fidelity', 'cellRows.some((row) => row.length !== width)', 'cellRows.some((row) => row.length === width)'), 'region drift docxFidelity.whole'],
      ];
      const digestMissed = [];
      for (const [id, mut, expected] of digestCatalog) {
        const found = compareFactsToLimits(factsFromSources({ ...sources, [mut.file]: mutate(sources[mut.file], mut.from, mut.to) }));
        if (!found.includes(expected)) digestMissed.push(`${id} -> ${found.join('|') || 'nothing'}`);
      }
      // Controls: edits that must NOT be flagged, and one that only the catch-all digest sees.
      const commentOnly = compareFactsToLimits(factsFromSources({ ...sources, parse: mutate(sources.parse, 'if (knownTotal > EPUB_MAX_TOTAL_BYTES) {', 'if (knownTotal > EPUB_MAX_TOTAL_BYTES) { // reviewed: unchanged guard') }));
      const whitespaceOnly = compareFactsToLimits(factsFromSources({ ...sources, parse: mutate(sources.parse, 'if (knownTotal > EPUB_MAX_TOTAL_BYTES) {', 'if (knownTotal    >   EPUB_MAX_TOTAL_BYTES)   {') }));
      const digestOnly = compareFactsToLimits(factsFromSources({ ...sources, parse: mutate(sources.parse, "'EPUB text is brought in in reading order.", "'EPUB text is brought in reading order.") }));
      const benignQuiet = commentOnly.length === 0 && whitespaceOnly.length === 0;
      const digestIsCatchAll = digestOnly.length === 1 && digestOnly[0] === 'region drift parse.extractEpubText';
      // The OLD extractor, run on the raw masked text, is fooled; the new one is not (this is what the check exists to prevent).
      const legacyNum = (s, name) => {
        const m = new RegExp(`const ${name} = ([\\d_\\s*]+);`).exec(s);
        return m ? evalProduct(m[1]) : null;
      };
      const maskedRoute = mutate(sources.route, 'const MAX_FILE_BYTES = 25 * 1024 * 1024;', '// was: const MAX_FILE_BYTES = 25 * 1024 * 1024;\nconst MAX_FILE_BYTES = 50 * 1024 * 1024;');
      const maskedLanding = mutate(sources.landing, 'input.sourceText.length === 0 ||', '/* input.sourceText.length === 0 || */');
      const oldFooledByLimit = legacyNum(maskedRoute, 'MAX_FILE_BYTES') === LIMITS.MAX_FILE_BYTES;
      const oldFooledByGate = /sourceText\.length === 0/.test(maskedLanding);
      const newSeesLive = factsFromSources({ ...sources, route: maskedRoute }).routeMaxFile === 50 * 1024 * 1024 && factsFromSources({ ...sources, landing: maskedLanding }).landingRefusesEmptyText === false;
      const vacuous = throws(() => mutate(sources.parse, 'text that is not in the file', 'x')); // a mutation that changes nothing is refused, never counted as a kill
      // A file the stripper only half understands: an unterminated block comment appended at the end touches no pinned region and no
      // fact, so neither a digest nor a structural detector can see it; only the stripper's own report does.
      const unclosedFound = compareFactsToLimits(factsFromSources({ ...sources, route: `${sources.route}\n/* never closed\n` }));
      const unclosedCaught = unclosedFound.length === 1 && unclosedFound[0] === 'comment stripper left an unclosed construct in an anchored source';
      const unclosedSql = compareFactsToLimits(factsFromSources({ ...sources, migration: `${sources.migration}\n/* never closed\n` }));
      const unclosedSqlCaught = unclosedSql.length === 1 && unclosedSql[0] === 'comment stripper left an unclosed construct in an anchored source';
      return {
        ok: undetected.length === 0 && wrongDetector.length === 0 && benignQuiet && digestIsCatchAll && oldFooledByLimit && oldFooledByGate && newSeesLive && vacuous && structuralOnly === catalog.length && unclosedCaught && unclosedSqlCaught && digestMissed.length === 0,
        detail: `source-changes=${catalog.length} flagged-by-named-detector=${catalog.length - undetected.length - wrongDetector.length} (also-by-a-structural-detector-not-only-a-digest=${structuralOnly}) undetected=[${undetected.join('; ')}] wrong-detector=[${wrongDetector.join('; ')}]; comment-only+whitespace-only edits quiet=${benignQuiet}; message-only edit caught by digest alone=${digestIsCatchAll}; old raw-text extractor fooled by commented-out limit=${oldFooledByLimit} and gate=${oldFooledByGate}, new one sees the live code=${newSeesLive}; vacuous-mutation-refused=${vacuous}; unterminated-comment-in-ts=${unclosedCaught} in-sql=${unclosedSqlCaught} (flagged by the stripper's report alone, no digest moves); digest-only-regions(code no fact reads)=${digestCatalog.length - digestMissed.length}/${digestCatalog.length} missed=[${digestMissed.join('; ')}]`,
      };
    });

    /* -- the expectation table is a checked derivation -------------------- */
    const measured = new Map();
    const measureOf = (e) => {
      if (!measured.has(e.name)) measured.set(e.name, measureUpload(fs.readFileSync(e.path), e.name, e.mime));
      return measured.get(e.name);
    };
    const derive = (e, F = facts, R = ROUTE_RULES) => deriveExpectation(measureOf(e), F, R);

    run('expectation table == model derived from (the fixture\'s bytes, the source facts) for EVERY fixture; no field of any entry can be flipped unnoticed', () => {
      if (!facts) return { ok: false, detail: 'source facts unavailable' };
      if (largeManifest.length !== manifest.length + 2) return { ok: false, detail: 'large manifest unavailable; the file-size pair cannot be checked' };
      const mismatched = [];
      for (const e of largeManifest) {
        const bad = expectationMismatch(e, derive(e));
        if (bad.length) mismatched.push(`${e.name}:${bad.join('+')}`);
      }
      let flips = 0;
      const unnoticed = [];
      for (const e of largeManifest) {
        for (const field of EXPECTATION_FIELDS) {
          for (const v of FIELD_DOMAIN[field]) {
            if (e[field] === v) continue;
            flips++;
            if (expectationMismatch({ ...e, [field]: v }, derive(e)).length === 0) unnoticed.push(`${e.name}.${field}=${v}`);
          }
        }
      }
      // The seven flips the reviewer ran by hand, named, each of which the earlier self-test let through:
      const named = [
        ['book.epub', { expectedParse: 'refuse', expectedStatusClass: '4xx', expectedStatus: 415 }],
        ['text-at-limit.txt', { expectedParse: 'refuse', expectedStatusClass: '4xx', expectedStatus: 413 }],
        ['text-over-limit.txt', { expectedParse: 'accept', expectedStatusClass: '2xx', expectedStatus: 200 }],
        ['unsupported-format.rtf', { expectedParse: 'accept', expectedStatusClass: '2xx', expectedStatus: 200 }],
        ['book-drm.epub', { expectedStatus: 400 }],
        ['corrupt-truncated.docx', { expectedStatus: 415 }],
        ['empty-file.txt', { expectedStatus: 413 }],
      ].filter(([n, o]) => {
        const e = largeManifest.find((x) => x.name === n);
        return expectationMismatch({ ...e, ...o }, derive(e)).length === 0;
      });
      return { ok: mismatched.length === 0 && unnoticed.length === 0 && flips > 100 && named.length === 0, detail: `fixtures=${largeManifest.length} table-vs-model-mismatches=${mismatched.length}${mismatched.length ? ' [' + mismatched.join(', ') + ']' : ''} single-field-flips-tried=${flips} unnoticed=${unnoticed.length}${unnoticed.length ? ' [' + unnoticed.slice(0, 6).join(', ') + ']' : ''} reviewer-named-flips-unnoticed=${named.length}` };
    });

    run('fixture set discriminates: each wrong route model is killed by at least one fixture (and the right one by none)', () => {
      if (!facts) return { ok: false, detail: 'source facts unavailable' };
      const R0 = ROUTE_RULES;
      const rules = (o) => ({ ...R0, ...o, cmp: { ...R0.cmp, ...(o.cmp ?? {}) } });
      const factsWith = (o) => ({ ...facts, ...o });
      const atCap = { file: 'limit-exact-26214400.docx', text: 'text-at-limit.txt', epubEntries: 'epub-entries-at-cap.epub', epubTotal: 'epub-total-at-cap.epub', epubEntry: 'epub-chapter-at-cap.epub' };
      const overCap = { file: 'limit-over-26214401.docx', text: 'text-over-limit.txt', epubEntries: 'epub-entries-over-cap.epub', epubTotal: 'epub-total-over-cap.epub', epubEntry: 'epub-chapter-over-cap.epub' };
      const label = { file: 'file size', text: 'text length', epubEntries: 'EPUB entry count', epubTotal: 'EPUB declared total', epubEntry: 'EPUB per-document size' };
      const candidates = [];
      for (const k of Object.keys(atCap)) {
        candidates.push({ name: `${label[k]} gate uses ">=" instead of ">"`, R: rules({ cmp: { [k]: ge } }), must: [atCap[k]] });
        candidates.push({ name: `${label[k]} gate lets one more through ("> cap+1")`, R: rules({ cmp: { [k]: gtPlusOne } }), must: [overCap[k]] });
      }
      candidates.push(
        { name: 'landing file gate uses ">="', R: rules({ cmp: { landingFile: ge } }), must: ['limit-exact-26214400.docx'] },
        { name: 'landing text gate uses ">="', R: rules({ cmp: { landingText: ge } }), must: ['text-at-limit.txt'] },
        { name: 'route counts text in BYTES (not UTF-16 length)', R: rules({ textUnits: (p) => p.bytes }), must: ['text-astral-at-limit.txt'] },
        { name: 'route counts text in CODE POINTS (not UTF-16 length)', R: rules({ textUnits: (p) => p.codePoints }), must: ['text-astral-over-limit.txt'] },
        { name: 'file-size gate removed', R: rules({ enforceFileCap: false }), must: ['limit-over-26214401.docx'] },
        { name: 'text-length gate removed', R: rules({ enforceTextCap: false }), must: ['text-over-limit.txt', 'text-astral-over-limit.txt'] },
        { name: 'empty-file gate removed', R: rules({ enforceEmptyFile: false }), must: ['empty-file.txt'] },
        { name: 'EPUB entry-count guard removed', R: rules({ enforceEpubEntries: false }), must: ['epub-entries-over-cap.epub'] },
        { name: 'EPUB total-size guard removed', R: rules({ enforceEpubTotal: false }), must: ['epub-total-over-cap.epub', 'zip-bomb.epub'] },
        { name: 'EPUB per-document guard removed', R: rules({ enforceEpubEntry: false }), must: ['epub-chapter-over-cap.epub'] },
        { name: 'EPUB extracted-text guard removed (the parser stops capping EPUB text)', R: rules({ enforceEpubText: false }), must: ['epub-text-over-cap.epub'] },
        { name: 'EPUB extracted-text cap doubled', F: factsWith({ epubMaxTextChars: facts.epubMaxTextChars * 2 }), must: ['epub-text-over-cap.epub'] },
        { name: 'EPUB DRM guard removed', R: rules({ enforceDrm: false }), must: ['book-drm.epub'] },
        { name: 'unrepresentable Word structure no longer refused', R: rules({ enforceUnsupportedDocx: false }), must: ['docx-table-no-header.docx', 'docx-embedded-image.docx'] },
        { name: 'empty DOCX refused by the parser', R: rules({ docxEmptyThrows: true }), must: ['empty.docx'] },
        { name: 'scanned PDF refused by the parser', R: rules({ pdfScannedThrows: true }), must: ['scanned.pdf'] },
        { name: 'empty extraction refused before custody (the obvious repair of the routed defect)', R: rules({ emptyTextRefusedBeforeCustody: true }), must: ['empty.docx', 'scanned.pdf'] },
        { name: 'NUL refused before custody', R: rules({ nulRefusedBeforeCustody: true }), must: ['text-with-nul.txt', 'text-utf16le.txt'] },
        { name: 'landing stops refusing empty text', F: factsWith({ landingRefusesEmptyText: false }), must: ['empty.docx', 'scanned.pdf'] },
        { name: 'NUL bytes storable (column is not Postgres text)', F: factsWith({ sourceTextIsPostgresText: false }), must: ['text-with-nul.txt', 'text-utf16le.txt'] },
        { name: '.rtf accepted as text', F: factsWith({ extRules: [...facts.extRules, { exts: ['rtf'], format: 'text' }] }), must: ['unsupported-format.rtf'] },
      );
      const killedBy = (c) => largeManifest.filter((e) => expectationMismatch(e, derive(e, c.F ?? facts, c.R ?? R0)).length > 0).map((e) => e.name);
      const survivors = [];
      const misattributed = [];
      for (const c of candidates) {
        const k = killedBy(c);
        if (k.length === 0) survivors.push(c.name);
        else if (!c.must.every((n) => k.includes(n))) misattributed.push(`${c.name} (not killed by ${c.must.filter((n) => !k.includes(n)).join('+')})`);
      }
      const rightOneKills = killedBy({}).length; // the unmutated model must kill nothing, or the matrix means nothing
      return { ok: survivors.length === 0 && misattributed.length === 0 && rightOneKills === 0 && candidates.length >= 25, detail: `wrong-route-candidates=${candidates.length} survivors=${survivors.length}${survivors.length ? ' [' + survivors.join('; ') + ']' : ''} not-killed-by-the-intended-fixture=${misattributed.length}${misattributed.length ? ' [' + misattributed.join('; ') + ']' : ''} fixtures-that-fault-the-correct-model=${rightOneKills}` };
    });

    run('every limit and status the expectations rest on is pinned by at least one fixture (perturbing it changes some fixture\'s expected outcome)', () => {
      if (!facts) return { ok: false, detail: 'source facts unavailable' };
      const perturb = [];
      for (const [key, deltas] of [['routeMaxFile', [-1, 1]], ['landingMaxFile', [-1]], ['routeMaxText', [-1, 1]], ['landingMaxText', [-1]], ['epubEntries', [-1, 1]], ['epubTotalBytes', [-1, 1]], ['epubEntryBytes', [-1, 1]]]) {
        for (const d of deltas) perturb.push([`${key}${d > 0 ? '+' : ''}${d}`, { [key]: facts[key] + d }]);
      }
      for (const key of Object.keys(SOURCE_PINS.statuses)) perturb.push([`${key}+1`, { [key]: facts[key] + 1 }]);
      // The EPUB text cap is pinned by a deliberately wide-margin fixture, so only a coarse perturbation moves a fixture; its exact
      // value is pinned by the source anchors (EPUB_MAX_TEXT_CHARS), not by any fixture.
      perturb.push(['epubMaxTextChars x2', { epubMaxTextChars: facts.epubMaxTextChars * 2 }]);
      const unpinned = perturb.filter(([, o]) => !largeManifest.some((e) => expectationMismatch(e, derive(e, { ...facts, ...o })).length > 0)).map(([n]) => n);
      return { ok: unpinned.length === 0 && perturb.length >= 15, detail: `perturbations=${perturb.length} not-pinned-by-any-fixture=${unpinned.length}${unpinned.length ? ' [' + unpinned.join(', ') + ']' : ''}` };
    });

    run('zip-bomb.epub note matches the source: jszip inflates at load BEFORE the size guard (the earlier note, which put the guard first, fails this check)', () => {
      if (!facts) return { ok: false, detail: 'source facts unavailable' };
      const CLAIM = new RegExp('before any ' + 'inflation', 'i'); // assembled so this file does not contain the false claim verbatim
      const states = (n) => /checkCRC32/.test(n) && /inflat/i.test(n) && /\bload\b/i.test(n);
      const note = byName('zip-bomb.epub').note;
      const noteOk = !CLAIM.test(note) && states(note);
      const oldNote = 'Valid EPUB package plus a 100 MiB NUL padding entry outside the spine. Package otherwise parses, so only the declared-size guard (EPUB_MAX_TOTAL_BYTES, 64 MiB) can refuse it, before any ' + 'inflation. Depends on jszip exposing entry._data.uncompressedSize; if it did not, the guard would read 0 and pass.';
      const oldFails = CLAIM.test(oldNote) || !states(oldNote);
      const self = fs.readFileSync(fileURLToPath(import.meta.url), 'utf8');
      const sourceFileOk = !CLAIM.test(self); // the section comment above buildBombEpub made the same claim
      return { ok: facts.epubInflatesBeforeTotalGuard === true && noteOk && oldFails && sourceFileOk, detail: `source-loads-with-CRC32-before-the-guard=${facts.epubInflatesBeforeTotalGuard} note-states-load-time-inflation-and-no-false-claim=${noteOk} old-note-would-fail-this-check=${oldFails} this-file-makes-no-false-claim=${sourceFileOk}` };
    });

    /* -- independent corroboration (host tools; an absent tool is NEVER a quiet pass) ----- */
    run('corroboration verdict is fail-closed: an absent tool fails unless explicitly waived (the earlier "SKIPPED -> ok" behaviour fails this check)', () => {
      const cases = [
        [{ present: true, waived: false }, true, 'present'],
        [{ present: true, waived: true }, true, 'present'],
        [{ present: false, waived: true }, true, 'waived'],
        [{ present: false, waived: false }, false, 'absent'],
      ];
      const wrong = cases.filter(([i, ok, st]) => { const v = corroborationVerdict(i); return v.ok !== ok || v.state !== st; }).length;
      const oldBehaviour = (i) => ({ ok: true, state: i.present ? 'present' : 'skipped' }); // what the first version did when nothing was installed
      const oldWouldHavePassed = oldBehaviour({ present: false, waived: false }).ok === true;
      const parsed = JSON.stringify([...parseToolList('unzip, XMLLINT')]) === '["unzip","xmllint"]' && parseToolList('all').length === 3 && throws(() => parseToolList('nonsense'));
      return { ok: wrong === 0 && oldWouldHavePassed && parsed, detail: `verdict-cases=${cases.length} wrong=${wrong} old-code-passed-with-no-tool-installed=${oldWouldHavePassed} waiver-parsing=${parsed} tools-here: unzip=${tool.unzip} poppler=${tool.poppler} xmllint=${tool.xmllint} waived=[${[...waived].join(',')}]` };
    });

    run('corroboration (poppler): pdftotext/pdfinfo agree with this module\'s PDF verifiers, including compressed and TJ-array text', () => {
      const v = corroborationVerdict({ present: tool.poppler, waived: waived.has('poppler') });
      corroboration.poppler = v.state;
      if (v.state !== 'present') {
        return { ok: v.ok, detail: v.state === 'waived' ? 'WAIVED: poppler not installed; PDF text claims rest on this module\'s own extractor only, which is circular' : 'UNCORROBORATED: pdftotext/pdfinfo are not installed, so no PDF claim is checked by anything independent of this module; install poppler-utils or waive explicitly (allowUncorroborated / WSI_ALLOW_UNCORROBORATED=poppler)' };
      }
      const extDir = fs.mkdtempSync(path.join(os.tmpdir(), 'wsi-fixtures-'));
      created.push(extDir);
      const out = (f) => spawnSync('pdftotext', [f, '-'], { encoding: 'utf8', maxBuffer: 1 << 24 });
      const write = (n, b) => {
        const f = path.join(extDir, n);
        fs.writeFileSync(f, b);
        return f;
      };
      const text = out(byName('text-layer.pdf').path).stdout;
      const scanned = out(byName('scanned.pdf').path).stdout;
      const otherText = out(write('other.pdf', buildTextPdf(otherCanary))).stdout;
      const garbage = write('garbage.pdf', crypto.randomBytes(256));
      const infoGood = spawnSync('pdfinfo', [byName('text-layer.pdf').path]).status === 0 && spawnSync('pdfinfo', [byName('scanned.pdf').path]).status === 0;
      const infoBadRejected = spawnSync('pdfinfo', [garbage]).status !== 0;
      const found = text.includes(canary);
      const scannedEmpty = scanned.replace(/\s/g, '') === '';
      const contentSensitive = otherText.includes(otherCanary) && !otherText.includes(canary);
      const flate = out(write('flate.pdf', buildTextPdf(canary, { flate: true }))).stdout.includes(canary);
      const tj = out(write('tj.pdf', buildTextPdf(canary, { tjArrays: true }))).stdout.includes(canary);
      const both2 = out(write('flatetj.pdf', buildTextPdf(canary, { flate: true, tjArrays: true }))).stdout.includes(canary);
      const ownAgrees = [buildTextPdf(canary, { flate: true }), buildTextPdf(canary, { tjArrays: true }), buildTextPdf(canary, { flate: true, tjArrays: true })].every((b) => pdfTextRuns(b).join('').includes(canary));
      // The case the own extractor must NOT call exact: poppler shows different text than the literal string spells.
      const remapOut = out(write('remap.pdf', buildRemappedFontPdf())).stdout;
      const remapAnalysis = analyzePdf(buildRemappedFontPdf());
      const remapReal = remapOut.includes('BBBB') && !remapOut.includes('AAAA') && remapAnalysis.runs.join('') === 'AAAA' && !remapAnalysis.exact;
      return { ok: found && scannedEmpty && contentSensitive && infoGood && infoBadRejected && flate && tj && both2 && ownAgrees && remapReal, detail: `pdftotext canary-in-text-layer=${found} scanned-nonwhitespace-bytes=${scanned.replace(/\s/g, '').length} other-canary-pdf-not-confused=${contentSensitive} pdfinfo good-ok=${infoGood} garbage-rejected=${infoBadRejected}; poppler reads canary from flate=${flate} tj-array=${tj} flate+tj=${both2}, own extractor agrees=${ownAgrees}; remapped-font: poppler shows other text than the literal and own analysis is not exact=${remapReal}` };
    });

    run('corroboration (xmllint): every XML part of the DOCX/EPUB fixtures is well-formed by xmllint; broken XML is rejected', () => {
      const v = corroborationVerdict({ present: tool.xmllint, waived: waived.has('xmllint') });
      corroboration.xmllint = v.state;
      if (v.state !== 'present') {
        return { ok: v.ok, detail: v.state === 'waived' ? 'WAIVED: xmllint not installed; XML validity rests on this module\'s own checker only, which is circular' : 'UNCORROBORATED: xmllint is not installed, so XML validity is unchecked by anything independent of this module; install libxml2-utils or waive explicitly (allowUncorroborated / WSI_ALLOW_UNCORROBORATED=xmllint)' };
      }
      let n = 0;
      let bad = 0;
      for (const f of ['manuscript.docx', 'empty.docx', 'docx-table-no-header.docx', 'docx-embedded-image.docx', 'book.epub', 'book-drm.epub', 'epub-chapter-at-cap.epub']) {
        const buf = read(f);
        for (const e of readZip(buf).entries) {
          if (!/\.(xml|rels|opf|xhtml)$/.test(e.name)) continue;
          n++;
          if (spawnSync('xmllint', ['--noout', '-'], { input: readEntry(buf, e) }).status !== 0) bad++;
        }
      }
      const controlRejected = spawnSync('xmllint', ['--noout', '-'], { input: '<a><b></a>' }).status !== 0;
      return { ok: n >= 30 && bad === 0 && controlRejected, detail: `xmllint parts=${n} not-well-formed=${bad} broken-xml-rejected=${controlRejected}` };
    });

    /* -- output is content-free ------------------------------------------ */
    run('selfTest output and manifest are content-free (a planted leak is detected)', () => {
      const leaks = (obj) => JSON.stringify(obj).includes(canary);
      const clean = !leaks(checks) && !leaks(manifest) && !leaks(largeManifest) && !leaks(corroboration);
      const planted = leaks([{ detail: `x ${canary}` }]);
      const redacts = redact(`a ${canary} b`) === 'a [canary] b';
      return { ok: clean && planted && redacts, detail: `no-canary-in-checks-or-manifest=${clean} planted-leak-detected=${planted} redact-works=${redacts}` };
    });
  } catch (e) {
    add('selfTest harness', false, `unexpected ${e && e.name}: ${e && e.message}`);
  } finally {
    const results = created.map((d) => safeRemove(d));
    const removed = results.every(Boolean) && created.every((d) => !fs.existsSync(d));
    const refusesOutside = (() => {
      const probe = fs.mkdtempSync(path.join(os.tmpdir(), 'keepme-'));
      try {
        return safeRemove(probe) === false && fs.existsSync(probe);
      } finally {
        fs.rmSync(probe, { recursive: true, force: true });
      }
    })();
    add('temp directories removed; cleanup refuses a directory it did not create', removed && refusesOutside, `removed=${created.length}/${created.length} all-gone=${removed} refuses-unrelated-dir=${refusesOutside}`);
  }

  return { ok: checks.every((c) => c.ok), checks, corroboration: { ...corroboration, waived: [...waived] } };
}

/* ------------------------------------------------------------------------- *
 * Direct run
 * ------------------------------------------------------------------------- */

const isMain = (() => {
  try {
    return Boolean(process.argv[1]) && fs.realpathSync(process.argv[1]) === fs.realpathSync(fileURLToPath(import.meta.url));
  } catch {
    return false;
  }
})();

if (isMain) {
  const t0 = Date.now();
  const r = selfTest();
  const failed = r.checks.filter((c) => !c.ok).length;
  const states = CORROBORATING_TOOLS.map((t) => `${t}=${r.corroboration[t] ?? 'not-evaluated'}`).join(' ');
  const waivedAny = r.corroboration.waived.length > 0;
  console.log(`fixtures selfTest: ${r.ok ? (waivedAny ? 'PASS-WITH-WAIVERS' : 'PASS') : 'FAIL'} (${r.checks.length - failed}/${r.checks.length} checks, ${Date.now() - t0}ms)`);
  console.log(`  independent corroboration: ${states}${waivedAny ? `  (WAIVED: ${r.corroboration.waived.join(',')} -- those claims rest on this module's own code only)` : ''}`);
  for (const c of r.checks) console.log(`  ${c.ok ? 'ok  ' : 'FAIL'} ${c.name}${c.detail ? ` -- ${c.detail}` : ''}`);
  process.exitCode = r.ok ? 0 : 1;
}
