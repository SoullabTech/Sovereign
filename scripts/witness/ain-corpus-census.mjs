#!/usr/bin/env node
/**
 * MAIA-WISDOM-01 · ACT 1 — AIN WISDOM CORPUS CENSUS
 *
 * READ-ONLY BY CONSTRUCTION. This instrument opens every file for reading and
 * writes nothing inside --root. It refuses to start if --out resolves inside --root.
 *
 * Evidence discipline (S3-F8-WITNESS-01 D3 — record presence, not content):
 * the report carries counts, relative paths, extensions, sizes, content hashes and
 * field-presence booleans. It carries NO excerpt, NO summary of any document's
 * contents, and NO digest of authored prose beyond the opaque dedupe hash.
 *
 * Nothing here ingests, indexes, embeds, classifies-into-canon, or transmits.
 * No network calls. No model providers.
 *
 * Usage:
 *   node scripts/witness/ain-corpus-census.mjs \
 *     --root "/path/to/AIN Consciousness Intelligence System 1" \
 *     --out  ~/ain-census-2026-09-15
 */

import { createHash } from 'node:crypto';
import { readdir, stat, lstat, open, mkdir, writeFile } from 'node:fs/promises';
import { join, extname, relative, resolve, sep, basename } from 'node:path';

// ---------------------------------------------------------------- arguments

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === '--root') out.root = argv[++i];
    else if (argv[i] === '--out') out.out = argv[++i];
    else if (argv[i] === '--max-hash-bytes') out.maxHashBytes = Number(argv[++i]);
  }
  return out;
}

const args = parseArgs(process.argv.slice(2));
if (!args.root || !args.out) {
  console.error('usage: ain-corpus-census.mjs --root <corpus dir> --out <report dir>');
  console.error('  --out MUST NOT be inside --root. Nothing is ever written under --root.');
  process.exit(2);
}

const ROOT = resolve(args.root);
const OUT = resolve(args.out);
const MAX_HASH_BYTES = Number.isFinite(args.maxHashBytes) ? args.maxHashBytes : 8 * 1024 * 1024;

// The containment refusal. This is the instrument's own read-only guarantee,
// enforced rather than promised.
if (OUT === ROOT || OUT.startsWith(ROOT + sep)) {
  console.error(`REFUSED: --out (${OUT}) resolves inside --root (${ROOT}).`);
  console.error('The census never writes inside the corpus tree. Choose an --out elsewhere.');
  process.exit(3);
}

// ---------------------------------------------------------------- taxonomy

const SKIP_DIRS = new Set(['.git', 'node_modules', '.obsidian', '.trash', '.DS_Store', '__MACOSX']);

// Machine-readability classes. Deliberately conservative: "needs_conversion" is a
// statement about this instrument, not a claim that the file is unusable.
const READABILITY = {
  '.md': 'immediate', '.markdown': 'immediate', '.txt': 'immediate',
  '.json': 'immediate', '.yaml': 'immediate', '.yml': 'immediate',
  '.csv': 'immediate', '.html': 'immediate', '.rtf': 'needs_conversion',
  '.pdf': 'needs_conversion', '.docx': 'needs_conversion', '.doc': 'needs_conversion',
  '.pptx': 'needs_conversion', '.epub': 'needs_conversion', '.pages': 'needs_conversion',
  '.mp3': 'unsuitable', '.m4a': 'unsuitable', '.wav': 'unsuitable',
  '.mp4': 'unsuitable', '.mov': 'unsuitable', '.png': 'unsuitable',
  '.jpg': 'unsuitable', '.jpeg': 'unsuitable', '.heic': 'unsuitable',
  '.zip': 'unsuitable', '.webloc': 'unsuitable',
};

// Required frontmatter per docs/canon/CORPUS_DISCIPLINE_PROTOCOL_v1.0.md.
// Presence is recorded. Nothing is assigned, inferred or written.
const RATIFIED_FIELDS = [
  'tier', 'authority', 'source_type', 'title',
  'author', 'version', 'date_added', 'status', 'safe_for_retrieval',
];

// Domain signal against docs/canon/MAIA_KNOWLEDGE_FIELD_12_DOMAIN_MAP.md.
// Counts only. A hit means a term occurred; it is orientation, not classification.
const DOMAIN_TERMS = {
  'islamic_psychology': ['nafs', 'qalb', 'tazkiyah', 'sufi', 'ruh '],
  'jungian_depth': ['jung', 'individuation', 'shadow', 'archetype', 'anima', 'projection'],
  'relational_intelligence': ['attunement', 'co-regulation', 'relational field', 'intersubjectiv'],
  'mystical_contemplative': ['contemplat', 'apophatic', 'mystic', 'surrender', 'nondual'],
  'neuroscience': ['predictive processing', 'neuroplastic', 'interocept', 'default mode', 'polyvagal'],
  'spiralogic': ['spiralogic', 'elemental alchemy', 'aether', 'holoflower'],
  'somatics': ['somatic', 'felt sense', 'embodiment', 'titration', 'pendulation'],
  'attachment_trauma': ['attachment', 'earned security', 'dysregulat', 'complex trauma', 'rupture and repair'],
  'systems_theory': ['emergence', 'feedback loop', 'autopoie', 'nonlinear'],
  'philosophy_of_mind': ['phenomenolog', 'qualia', 'hard problem', 'consciousness studies'],
  'ritual_symbolic': ['initiation', 'underworld', 'liminal', 'ritual', 'mythopoe'],
  'ethics_discernment': ['discernment', 'moral injury', 'virtue', 'right action'],
};

// Authorship SIGNAL only — reported, never stored as a classification (charter §4.2).
const SOULLAB_MARKERS = ['soullab', 'spiralogic', 'elemental alchemy', 'maia', 'kelly nezat', 'ain '];

// ---------------------------------------------------------------- walk

const files = [];
let skippedDirs = 0;
let symlinks = 0;
// Per-stage measurement state. The aggregate `unreadable` counter this replaces
// was unusable as a witness metric: one file could increment it at several
// stages, and a failed read was indistinguishable from a successful read that
// found nothing. Each stage is now counted separately so the report can say
// what was actually measured rather than what was attempted.
let readdirFailures = 0;
let lstatFailures = 0;
let hashAttempts = 0, hashFailures = 0;
let textAttempts = 0, textFailures = 0;
let appleDoubleSkipped = 0;
let backupSkipped = 0;   // macOS AppleDouble sidecars — metadata, never corpus

async function walk(dir) {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    readdirFailures += 1;
    return;
  }
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isSymbolicLink()) { symlinks += 1; continue; } // never follow: could escape --root
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) { skippedDirs += 1; continue; }
      await walk(full);
    } else if (entry.isFile()) {
      if (entry.name === '.DS_Store') continue;
      // AppleDouble resource-fork sidecars (`._name`) are macOS filesystem
      // metadata created when a tree is copied across filesystems. They are
      // typically 4 KB, they mirror the name (and therefore the extension) of
      // a real file, and counting them inflates file counts, the extension
      // distribution, absent-frontmatter counts and duplication clusters.
      //
      // FOUND BEFORE THE FIRST REAL RUN, not after: the AIN tree listing showed
      // hundreds at a single directory level. Excluded here and COUNTED, so the
      // exclusion is visible in the report rather than silently applied.
      if (entry.name.startsWith('._')) { appleDoubleSkipped += 1; continue; }
      // Editor/tooling backup artifacts. Excluded from the corpus population and
      // counted separately, on the same footing as AppleDouble sidecars: they are
      // custody and hygiene evidence, not authored corpus objects. Nothing is
      // deleted, modified, or inspected — only counted.
      if (entry.name.endsWith('.backup')) { backupSkipped += 1; continue; }
      files.push(full);
    }
  }
}

// ---------------------------------------------------------------- inspection

async function hashFile(path, size) {
  const h = createHash('sha256');
  const fh = await open(path, 'r');
  try {
    if (size <= MAX_HASH_BYTES) {
      const buf = Buffer.alloc(Math.min(size, 1 << 20));
      let pos = 0;
      while (pos < size) {
        const { bytesRead } = await fh.read(buf, 0, buf.length, pos);
        if (bytesRead <= 0) break;
        h.update(buf.subarray(0, bytesRead));
        pos += bytesRead;
      }
      return { hash: h.digest('hex'), hashKind: 'full' };
    }
    // Large file: size + head/tail sample. Weaker, and labelled as such.
    const sample = Buffer.alloc(1 << 20);
    h.update(String(size));
    const head = await fh.read(sample, 0, sample.length, 0);
    h.update(sample.subarray(0, head.bytesRead));
    const tail = await fh.read(sample, 0, sample.length, Math.max(0, size - sample.length));
    h.update(sample.subarray(0, tail.bytesRead));
    return { hash: h.digest('hex'), hashKind: 'sampled' };
  } finally {
    await fh.close();
  }
}

async function readTextHead(path, bytes = 262144) {
  const fh = await open(path, 'r');
  try {
    const buf = Buffer.alloc(bytes);
    const { bytesRead } = await fh.read(buf, 0, bytes, 0);
    return buf.subarray(0, bytesRead).toString('utf8');
  } finally {
    await fh.close();
  }
}

function frontmatterFields(text) {
  if (!text.startsWith('---')) return null;
  const end = text.indexOf('\n---', 3);
  if (end === -1) return null;
  const block = text.slice(3, end);
  const present = [];
  for (const field of RATIFIED_FIELDS) {
    if (new RegExp(`^\\s*${field}\\s*:`, 'm').test(block)) present.push(field);
  }
  return present;
}

function countSignals(lower, terms) {
  return terms.filter((t) => lower.includes(t));
}

// ---------------------------------------------------------------- main

await walk(ROOT);

// ---------------------------------------------------------------- read probe
//
// WHY THIS EXISTS. On 2026-09-15 this instrument produced a complete-looking
// report over a corpus whose every content read had failed: 8,803 read failures
// across 5,131 files, with a domain table, an authorship percentage and a
// "100% frontmatter absent" figure all derived from nothing. The cause was
// macOS dataless files — iCloud evicts the CONTENT while leaving name, size and
// metadata intact, so readdir and lstat succeed and open()+read() fails.
//
// The earlier preflight looked for `*.icloud` placeholder files and returned 0,
// which is a LEGACY convention. It was a proxy for the operation, not the
// operation. This probes the actual read the census depends on.
async function probeReadability(candidates) {
  const sample = candidates.filter((p) => READABILITY[extname(p).toLowerCase()] === 'immediate').slice(0, 40);
  if (sample.length === 0) return { attempted: 0, failed: 0 };
  let failed = 0;
  for (const path of sample) {
    try {
      const fh = await open(path, 'r');
      try {
        const buf = Buffer.alloc(1);
        const { bytesRead } = await fh.read(buf, 0, 1, 0);
        if (bytesRead === 0) { /* genuinely empty file — not a failure */ }
      } finally { await fh.close(); }
    } catch { failed += 1; }
  }
  return { attempted: sample.length, failed };
}

const probe = await probeReadability(files);
if (probe.attempted > 0 && probe.failed / probe.attempted > 0.5) {
  console.error('');
  console.error(`REFUSED: ${probe.failed} of ${probe.attempted} sampled files could not be read.`);
  console.error('');
  console.error('The corpus tree is present but its CONTENT is not readable. The most common');
  console.error('cause is macOS dataless files: iCloud has evicted file contents while leaving');
  console.error('names, sizes and metadata intact. Check with:');
  console.error('');
  console.error('    ls -lO <a file in the tree>        # look for "dataless" in the flags');
  console.error('');
  console.error('Remedy: in Finder, right-click the folder and choose "Download Now", or turn');
  console.error('off System Settings > Apple ID > iCloud > iCloud Drive > Optimize Mac Storage.');
  console.error('(`brctl download` only addresses the iCloud Drive container, not third-party');
  console.error('app containers such as Obsidian\'s.)');
  console.error('');
  console.error('A census run now would report counts, extensions and sizes correctly while');
  console.error('silently deriving frontmatter, domain and authorship signals from zero bytes.');
  console.error('That is why this refuses rather than reporting.');
  console.error('');
  process.exit(4);
}

const byExt = {};
const byReadability = { immediate: 0, needs_conversion: 0, unsuitable: 0, unknown: 0 };
const byTopDir = {};
const domainHits = Object.fromEntries(Object.keys(DOMAIN_TERMS).map((k) => [k, 0]));
const hashes = new Map();
const records = [];

let totalBytes = 0;
let withFullFrontmatter = 0;
let withPartialFrontmatter = 0;
let withNoFrontmatter = 0;
let withUnknownFrontmatter = 0;   // text read attempted and failed — NOT absence
let zeroByte = 0;
let soullabSignal = 0;

for (const path of files) {
  let st;
  try { st = await lstat(path); } catch { lstatFailures += 1; continue; }

  const ext = extname(path).toLowerCase();
  const rel = relative(ROOT, path);
  const top = rel.split(sep)[0] || '(root)';
  const readability = READABILITY[ext] ?? 'unknown';

  byExt[ext || '(none)'] = (byExt[ext || '(none)'] ?? 0) + 1;
  byReadability[readability] += 1;
  byTopDir[top] = (byTopDir[top] ?? 0) + 1;
  totalBytes += st.size;
  if (st.size === 0) zeroByte += 1;

  let hash = null, hashKind = null;
  hashAttempts += 1;
  try { ({ hash, hashKind } = await hashFile(path, st.size)); } catch { hashFailures += 1; }
  if (hash) {
    if (!hashes.has(hash)) hashes.set(hash, []);
    hashes.get(hash).push(rel);
  }

  let fmPresent = null;
  let domains = [];
  let soullab = false;
  let textObserved = false;   // did this file's content actually reach us?

  if (readability === 'immediate' && st.size > 0 && st.size < 16 * 1024 * 1024) {
    textAttempts += 1;
    try {
      const text = await readTextHead(path);
      const lower = text.toLowerCase();
      if (ext === '.md' || ext === '.markdown') fmPresent = frontmatterFields(text);
      for (const [domain, terms] of Object.entries(DOMAIN_TERMS)) {
        if (countSignals(lower, terms).length > 0) { domainHits[domain] += 1; domains.push(domain); }
      }
      soullab = countSignals(lower, SOULLAB_MARKERS).length > 0;
      if (soullab) soullabSignal += 1;
      textObserved = true;
    } catch { textFailures += 1; }
  }

  // UNOBSERVED IS NOT ABSENT. A file whose content never reached us cannot be
  // evidence that frontmatter is missing from it. Within the tolerated 5% of
  // content-read failures those files were previously counted as "absent" —
  // a false negative manufactured from non-observation.
  const textEligible = readability === 'immediate' && st.size > 0 && st.size < 16 * 1024 * 1024;
  if (textEligible && !textObserved) withUnknownFrontmatter += 1;
  else if (fmPresent === null) withNoFrontmatter += 1;
  else if (fmPresent.length === RATIFIED_FIELDS.length) withFullFrontmatter += 1;
  else withPartialFrontmatter += 1;

  records.push({
    rel, ext: ext || '(none)', bytes: st.size, mtime: st.mtime.toISOString(),
    readability, hash, hashKind,
    frontmatter_fields_present: fmPresent, // null = no frontmatter block found
    frontmatter_fields_missing: fmPresent ? RATIFIED_FIELDS.filter((f) => !fmPresent.includes(f)) : RATIFIED_FIELDS,
    content_observed: textObserved,
    domain_signal: textObserved ? domains : null,   // null = not observed, NOT 'none found'
    soullab_authorship_signal: textObserved ? soullab : null, // null = not observed
  });
}

// ---------------------------------------------------------------- trust
//
// ONE authority. Amendment 2 declared a 95% trust threshold and then guarded at
// 0%, so a run at 900/1000 reads would mark content findings untrustworthy, write
// the report anyway, and close with CENSUS COMPLETE. Failed text reads leave
// fmPresent=null, domains=[] and soullab=false, so those 100 failures would still
// be counted downstream as content inspected and found absent. That is the
// original defect in a narrower form. The threshold and the guard are now the
// same derived value, computed once and consumed everywhere.
const TRUST_THRESHOLD = 0.95;

// TWO content-reading channels, not one. Amendment 2A unified the threshold for
// text reads and left hashing merely counted — but hashing feeds duplication,
// and the two channels do not fail together:
//
//   readTextHead()  attempted only for immediate-readability, non-empty, <16MB
//   hashFile()      attempted for EVERY counted file
//   startup probe   samples only immediate-readability files
//
// So a tree of materialized Markdown beside dataless PDFs or media passes the
// probe, passes a text-only gate at 100%, and still emits a duplication table
// computed from half the corpus under the banner CENSUS COMPLETE. Each channel
// now carries its own rate against the same threshold, and completion requires
// both.
const textSuccesses = textAttempts - textFailures;
const textSuccessRate = textAttempts === 0 ? 1 : textSuccesses / textAttempts;
const textFindingsTrustworthy = textSuccessRate >= TRUST_THRESHOLD;

const hashSuccesses = hashAttempts - hashFailures;
const hashSuccessRate = hashAttempts === 0 ? 1 : hashSuccesses / hashAttempts;
const hashFindingsTrustworthy = hashSuccessRate >= TRUST_THRESHOLD;

const contentFindingsTrustworthy = textFindingsTrustworthy && hashFindingsTrustworthy;

const duplicateClusters = [...hashes.entries()]
  .filter(([, paths]) => paths.length > 1)
  .map(([hash, paths]) => ({ hash, count: paths.length, paths }))
  .sort((a, b) => b.count - a.count);

const duplicateFileCount = duplicateClusters.reduce((n, c) => n + c.count - 1, 0);

const census = {
  instrument: 'MAIA-WISDOM-01 ACT 1 — AIN corpus census',
  discipline: 'read-only; presence not content; no ingestion, no index, no network',
  run_at: new Date().toISOString(),
  root: ROOT,
  totals: {
    files: files.length,
    bytes: totalBytes,
    gigabytes: +(totalBytes / 1e9).toFixed(3),
    directories_skipped: skippedDirs,
    symlinks_not_followed: symlinks,
    appledouble_sidecars_excluded: appleDoubleSkipped,
    backup_artifacts_excluded: backupSkipped,
    zero_byte_files: zeroByte,
  },
  measurement: {
    readdir_failures: readdirFailures,
    lstat_failures: lstatFailures,
    structurally_complete: readdirFailures === 0 && lstatFailures === 0,
    hash_attempts: hashAttempts,
    hash_successes: hashAttempts - hashFailures,
    hash_failures: hashFailures,
    text_read_attempts: textAttempts,
    text_read_successes: textSuccesses,
    text_read_failures: textFailures,
    text_read_success_rate: +textSuccessRate.toFixed(4),
    hash_success_rate: +hashSuccessRate.toFixed(4),
    trust_threshold: TRUST_THRESHOLD,
    text_findings_trustworthy: textFindingsTrustworthy,
    hash_findings_trustworthy: hashFindingsTrustworthy,
    content_findings_trustworthy: contentFindingsTrustworthy,
  },
  readability: byReadability,
  by_extension: Object.fromEntries(Object.entries(byExt).sort((a, b) => b[1] - a[1])),
  by_top_level_dir: Object.fromEntries(Object.entries(byTopDir).sort((a, b) => b[1] - a[1])),
  ratified_frontmatter: {
    required_fields: RATIFIED_FIELDS,
    source: 'docs/canon/CORPUS_DISCIPLINE_PROTOCOL_v1.0.md',
    complete: withFullFrontmatter,
    partial: withPartialFrontmatter,
    absent: withNoFrontmatter,
    unknown_unread: withUnknownFrontmatter,
  },
  observation_scope: {
    files_whose_content_was_read: textSuccesses,
    files_eligible_but_unread: textAttempts - textSuccesses,
    domain_and_authorship_denominator: textSuccesses,
    duplication_coverage: hashSuccessRate === 1 ? 'complete' : 'partial',
    duplication_counts_are: hashSuccessRate === 1 ? 'exact' : 'observed lower bound',
    files_unhashed: hashAttempts - hashSuccesses,
  },
  domain_signal_counts: domainHits,
  soullab_authorship_signal_files: soullabSignal,
  duplication: {
    clusters: duplicateClusters.length,
    redundant_files: duplicateFileCount,
    largest_clusters: duplicateClusters.slice(0, 25),
  },
  files: records,
};

// FAIL CLOSED. If content reads were attempted and none succeeded, every
// content-derived finding below is non-observation wearing the shape of a
// measurement. Refuse rather than report.
// ------------------------------------------------- STRUCTURAL COMPLETENESS
//
// Exact, not thresholded. A content-read failure has a principled denominator —
// we know how many files we tried to read. A STRUCTURAL failure does not:
//
//   readdir failure : walk() returns early. The omitted subtree could hold one
//                     file or ten thousand. There is no fraction to compute.
//   lstat failure   : the path is ALREADY in files[], so files.length counts it,
//                     while the loop `continue`s before extension, size, hashing
//                     and the record. Denominator and measured population
//                     diverge silently.
//
// So 95% is the wrong shape here. You may tolerate a declared small fraction of
// unreadable files; you may not tolerate an unread directory, because you cannot
// say what fraction it represents.
if (readdirFailures > 0 || lstatFailures > 0) {
  console.error('');
  console.error('REFUSED: the corpus tree was only partially observed.');
  if (readdirFailures > 0) {
    console.error(`  readdir failures: ${readdirFailures} — one or more directories could not be`);
    console.error('    listed. The number of objects omitted is unknowable.');
  }
  if (lstatFailures > 0) {
    console.error(`  lstat failures: ${lstatFailures} — paths counted in the file total but absent`);
    console.error('    from size, extension, hashing and every derived table.');
  }
  console.error('');
  console.error('Structural completeness is exact: a census cannot report on a tree it did not');
  console.error('fully see. No report was written.');
  console.error('');
  process.exit(6);
}

const textChannelFails = textAttempts > 0 && !textFindingsTrustworthy;
const hashChannelFails = hashAttempts > 0 && !hashFindingsTrustworthy;
if (textChannelFails || hashChannelFails) {
  console.error('');
  console.error(`REFUSED: a content-reading channel fell below ` +
                `${(TRUST_THRESHOLD * 100).toFixed(0)}%.`);
  if (textChannelFails) {
    console.error(`  text reads: ${textSuccesses}/${textAttempts} ` +
                  `(${(textSuccessRate * 100).toFixed(1)}%) — frontmatter, domain, authorship`);
  }
  if (hashChannelFails) {
    console.error(`  hash reads: ${hashSuccesses}/${hashAttempts} ` +
                  `(${(hashSuccessRate * 100).toFixed(1)}%) — duplication clusters`);
  }
  console.error('Frontmatter standing, domain signal, authorship signal, content hashes and');
  console.error('duplication are all derived from file contents and would be reported from');
  console.error('incomplete observation. No report was written.');
  console.error('');
  console.error(`Filesystem-level observations that DO hold: ${files.length} files, ` +
                `${(totalBytes / 1e9).toFixed(3)} GB, ${appleDoubleSkipped} AppleDouble, ` +
                `${backupSkipped} .backup, ${zeroByte} zero-byte, ${symlinks} symlinks.`);
  console.error('');
  process.exit(5);
}

await mkdir(OUT, { recursive: true });
await writeFile(join(OUT, 'census.json'), JSON.stringify(census, null, 2));

const pct = (n) => (files.length ? ((n / files.length) * 100).toFixed(1) : '0.0');
const table = (obj, limit = 30) => Object.entries(obj).slice(0, limit)
  .map(([k, v]) => `| \`${k}\` | ${v} | ${pct(v)}% |`).join('\n');

const md = `# AIN Wisdom Corpus Census

**Instrument:** MAIA-WISDOM-01 · ACT 1 (read-only)
**Run:** ${census.run_at}
**Root:** \`${ROOT}\`

> Presence, not content. This report carries counts, paths, sizes and field-presence
> booleans only — no excerpt, no summary of any document's contents.

## Totals

| | |
|---|---|
| Files | ${files.length} |
| Size | ${census.totals.gigabytes} GB |
| Symlinks (not followed) | ${symlinks} |
| Directories skipped | ${skippedDirs} |
| **AppleDouble sidecars excluded** | ${appleDoubleSkipped} |
| **Zero-byte files** | ${zeroByte} (${pct(zeroByte)}% of counted files) |
| **\`.backup\` artifacts excluded** | ${backupSkipped} |

## Measurement state

⚠️ *What was measured, not what was attempted. A failed read is not an absent finding.*

| Stage | Attempts | Successes | Failures |
|---|---|---|---|
| **readdir (exact: 0 required)** | — | — | ${readdirFailures} |
| **lstat (exact: 0 required)** | ${files.length} | ${files.length - lstatFailures} | ${lstatFailures} |
| content hash | ${hashAttempts} | ${hashAttempts - hashFailures} | ${hashFailures} |
| text read | ${textAttempts} | ${textSuccesses} | ${textFailures} |

| channel | rate | trustworthy |
|---|---|---|
| text reads → frontmatter · domain · authorship | ${(textSuccessRate * 100).toFixed(1)}% | ${textFindingsTrustworthy ? 'YES' : '⛔ NO'} |
| hash reads → duplication clusters | ${(hashSuccessRate * 100).toFixed(1)}% | ${hashFindingsTrustworthy ? 'YES' : '⛔ NO'} |

**Content-derived findings trustworthy: ${contentFindingsTrustworthy ? 'YES' : '⛔ NO'}** (both channels must reach ${(TRUST_THRESHOLD * 100).toFixed(0)}%)

## Machine readability

| Class | Files | Share |
|---|---|---|
| Immediately readable | ${byReadability.immediate} | ${pct(byReadability.immediate)}% |
| Needs conversion | ${byReadability.needs_conversion} | ${pct(byReadability.needs_conversion)}% |
| Unsuitable for ingestion | ${byReadability.unsuitable} | ${pct(byReadability.unsuitable)}% |
| Unknown extension | ${byReadability.unknown} | ${pct(byReadability.unknown)}% |

## Ratified frontmatter (CORPUS_DISCIPLINE_PROTOCOL_v1.0)

Required: ${RATIFIED_FIELDS.map((f) => `\`${f}\``).join(' · ')}

| State | Files | Share |
|---|---|---|
| Complete | ${withFullFrontmatter} | ${pct(withFullFrontmatter)}% |
| Partial | ${withPartialFrontmatter} | ${pct(withPartialFrontmatter)}% |
| Absent (**read**, none found) | ${withNoFrontmatter} | ${pct(withNoFrontmatter)}% |
| ⛔ **Unknown (eligible but unread)** | ${withUnknownFrontmatter} | ${pct(withUnknownFrontmatter)}% |

⚠️ *Absent frontmatter is the census's central finding, not a defect list. It measures
the distance between the corpus as it exists and the discipline already ratified for it.*

⛔ ***Unknown* is not *absent*.** Those files were eligible for a content read and their content
never reached this instrument. They are excluded from the absence finding rather than counted
toward it.

## Duplication

| | |
|---|---|
| Duplicate clusters | ${duplicateClusters.length} |
| Redundant files | ${duplicateFileCount} |

${hashSuccessRate === 1
  ? '⭐ **Hash coverage complete** — these counts are exact for the counted corpus.'
  : `⛔ **Hash coverage is ${(hashSuccessRate * 100).toFixed(1)}%, not complete.** ${hashAttempts - hashSuccesses} file(s) could not be hashed, so these are an **OBSERVED LOWER BOUND**, never a whole-corpus total. An unhashed file cannot be shown to duplicate anything, and its absence from a cluster is not evidence that it is unique.`}

⛔ Nothing was deduplicated. Clusters are reported for founder adjudication only.

## Domain signal (12-domain map)

Term occurrence counts over the **${textSuccesses} files whose content was actually read**.
Orientation, **not** classification.

⛔ **Denominator is observed files, not the corpus.** ${textAttempts - textSuccesses} eligible
file(s) were not read and contribute nothing to these counts — ⛔ which is *absence of
observation*, never *observation of absence*. A domain showing zero may be unrepresented, or may
sit entirely in the unread set.

| Domain | Files with signal |
|---|---|
${Object.entries(domainHits).sort((a, b) => b[1] - a[1]).map(([k, v]) => `| ${k} | ${v} |`).join('\n')}

## Authorship signal

${soullabSignal} of the **${textSuccesses} files read** carry a Soullab/Spiralogic/MAIA term.

⛔ ${textAttempts - textSuccesses} eligible file(s) were unread and are **not** counted as
lacking the term.

⛔ This is a **signal**, never a classification. Authorship and standing are orthogonal
axes (charter §2.1) and neither is assigned by this instrument.

## By extension

| Extension | Files | Share |
|---|---|---|
${table(census.by_extension)}

## By top-level directory

| Directory | Files | Share |
|---|---|---|
${table(census.by_top_level_dir)}

---

**Standing: CENSUS COMPLETE · READ-ONLY · ⛔ NOTHING MOVED · ⛔ NOTHING INDEXED ·
⛔ NOTHING INGESTED · ⛔ NO CANON ASSIGNED · CORPUS UNTOUCHED.**
`;

await writeFile(join(OUT, 'CENSUS.md'), md);

console.log(`census complete — ${files.length} files, ${census.totals.gigabytes} GB`);
console.log(`  excluded: ${appleDoubleSkipped} AppleDouble · ${backupSkipped} .backup · zero-byte: ${zeroByte}`);
console.log(`  reads: text ${textSuccesses}/${textAttempts} · hash ${hashAttempts - hashFailures}/${hashAttempts}`);
console.log(`  readable now: ${byReadability.immediate} · needs conversion: ${byReadability.needs_conversion} · unsuitable: ${byReadability.unsuitable}`);
console.log(`  ratified frontmatter — complete: ${withFullFrontmatter} · partial: ${withPartialFrontmatter} · absent: ${withNoFrontmatter}`);
console.log(`  duplicate clusters: ${duplicateClusters.length} (${duplicateFileCount} redundant files)`);
console.log(`\nwrote ${join(OUT, 'census.json')}`);
console.log(`wrote ${join(OUT, 'CENSUS.md')}`);
console.log(`\ncorpus untouched: ${ROOT}`);
