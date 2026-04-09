#!/usr/bin/env node
/**
 * audit-community-library.js
 *
 * Generates a curation worksheet for the Community Library — a single
 * markdown file that surfaces every article in one place with just enough
 * information to bucket it on first read.
 *
 * WHY THIS EXISTS
 * ---------------
 * The library currently has 42 articles spread across 8 collections, in at
 * least four different registers (foundational papers, archetypal concept
 * cards, thematic essays, product docs). Reading them one-by-one in the
 * live UI is slow and loses overview. This script produces a single-screen-
 * per-article worksheet so a curator can rapidly bucket the whole shelf
 * into:
 *
 *   F  Foundations         — calibration-grade, original thought
 *   A  Archetypal Maps     — referential, framed as map not doctrine
 *   P  Practice            — applied, tied to MAIA architecture
 *   I  Internal / Move     — keep, but not on the public shelf
 *   X  Cut                 — does not belong in any layer
 *
 * Once the worksheet is filled in, the cuts are applied via the manifest
 * (delete entries from scripts/build-community-library-manifest.js and
 * remove the corresponding article objects from
 * components/community/CommunityLibrary.tsx).
 *
 * USAGE
 * -----
 *   node scripts/audit-community-library.js
 *
 * OUTPUT
 * ------
 *   docs/curation/community-library-audit.md
 *
 * The output file is committed (not in .dockerignore — docs/curation/ is)
 * so it lives outside the production build. It is a working document, not
 * shipped code.
 */

const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '..');
const COMPONENT_PATH = path.join(REPO_ROOT, 'components/community/CommunityLibrary.tsx');
const OUTPUT_PATH = path.join(REPO_ROOT, 'docs/curation/community-library-audit.md');

// ---------------------------------------------------------------------------
// Parse CommunityLibrary.tsx to extract every article entry.
// ---------------------------------------------------------------------------
//
// The file declares an `insightCollections: InsightCollection[] = [...]`
// array. Each collection has shape:
//
//   {
//     id: 'philosophical-foundations',
//     title: '...',
//     description: '...',
//     icon: '',
//     articles: [
//       {
//         id: 'presence-continuity',
//         title: '...',
//         description: '...',
//         content: 'docs/papers/presence-continuity.md',  ← OR ← `multi-line template literal`
//         tags: [...],
//         relatedTechnologies: [...]
//       },
//       ...
//     ]
//   }
//
// The technologyCategories declaration that follows uses the same `id:`
// pattern at the same indentation, so we stop parsing when we hit it.
//
// We use line-based scanning rather than a real parser because this is a
// one-shot working tool, not a build dependency.

const src = fs.readFileSync(COMPONENT_PATH, 'utf8');
const lines = src.split('\n');

const articles = [];
let currentCollectionId = null;
let currentCollectionTitle = null;
let i = 0;

while (i < lines.length) {
  const line = lines[i];

  // Stop at the technologyCategories declaration.
  if (/^const technologyCategories\s*:/.test(line)) break;

  // Detect a collection id at 4-space indent.
  const collMatch = line.match(/^ {4}id:\s*'([^']+)',/);
  if (collMatch) {
    currentCollectionId = collMatch[1];
    const titleLine = lines[i + 1];
    const titleMatch = titleLine && titleLine.match(/^ {4}title:\s*'([^']+)',/);
    currentCollectionTitle = titleMatch ? titleMatch[1] : currentCollectionId;
    i++;
    continue;
  }

  // Detect an article id at 8-space indent. (Collection-level properties
  // are at 4 spaces; article objects open at 6; article fields at 8.)
  const artMatch = line.match(/^ {8}id:\s*'([^']+)',/);
  if (artMatch && currentCollectionId) {
    const article = {
      id: artMatch[1],
      collection: currentCollectionId,
      collectionTitle: currentCollectionTitle,
    };

    // Title and description follow on the next two lines.
    const titleMatch = lines[i + 1] && lines[i + 1].match(/^ {8}title:\s*'((?:[^'\\]|\\.)*)',/);
    article.title = titleMatch ? titleMatch[1].replace(/\\'/g, "'") : article.id;

    const descMatch = lines[i + 2] && lines[i + 2].match(/^ {8}description:\s*'((?:[^'\\]|\\.)*)',/);
    article.description = descMatch ? descMatch[1].replace(/\\'/g, "'") : '';

    // Find the `content:` line (next few lines).
    let j = i + 1;
    while (j < lines.length && j < i + 8 && !/^ {8}content:/.test(lines[j])) j++;
    if (j >= i + 8) {
      // Couldn't locate content; skip this entry.
      i++;
      continue;
    }

    const contentLine = lines[j];
    const fileMatch = contentLine.match(/^ {8}content:\s*'([^']+\.md)',/);

    if (fileMatch) {
      article.contentType = 'file';
      article.contentSource = fileMatch[1];
      const abs = path.join(REPO_ROOT, fileMatch[1]);
      if (fs.existsSync(abs)) {
        article.contentBody = fs.readFileSync(abs, 'utf8');
      } else {
        article.contentBody = '';
        article.missing = true;
      }
      i = j + 1;
    } else if (/^ {8}content:\s*`/.test(contentLine)) {
      // Inline template literal — capture until the closing backtick.
      article.contentType = 'inline';
      article.contentSource = '(inline in component)';
      const bodyLines = [];
      let k = j + 1;
      while (k < lines.length) {
        // The closing backtick appears on its own line indented like `,
        if (/^`,/.test(lines[k]) || /^\s*`,$/.test(lines[k])) break;
        bodyLines.push(lines[k]);
        k++;
      }
      article.contentBody = bodyLines.join('\n');
      i = k + 1;
    } else {
      // Unknown content shape; skip.
      i++;
      continue;
    }

    articles.push(article);
    continue;
  }

  i++;
}

// ---------------------------------------------------------------------------
// Helpers for opening preview / word count.
// ---------------------------------------------------------------------------

function stripFrontmatter(md) {
  if (!md) return '';
  return md.replace(/^---\n[\s\S]*?\n---\n/, '');
}

function wordCount(md) {
  if (!md) return 0;
  return stripFrontmatter(md).trim().split(/\s+/).filter(Boolean).length;
}

function opening(md, n = 280) {
  if (!md) return '_(no content)_';
  const stripped = stripFrontmatter(md).trim();
  // Strip a leading H1 line if present so we don't repeat the title.
  const noH1 = stripped.replace(/^#\s+[^\n]+\n+/, '');
  // Collapse whitespace for compactness.
  const flat = noH1.replace(/\s+/g, ' ').trim();
  return flat.length > n ? flat.slice(0, n) + '…' : flat;
}

// ---------------------------------------------------------------------------
// Group by collection in declaration order.
// ---------------------------------------------------------------------------

const collOrder = [];
for (const a of articles) {
  if (!collOrder.includes(a.collection)) collOrder.push(a.collection);
}
const byCollection = Object.fromEntries(
  collOrder.map((id) => [id, { title: articles.find((a) => a.collection === id).collectionTitle, articles: [] }])
);
for (const a of articles) byCollection[a.collection].articles.push(a);

// ---------------------------------------------------------------------------
// Render the worksheet.
// ---------------------------------------------------------------------------

const fileBacked = articles.filter((a) => a.contentType === 'file').length;
const inlineCount = articles.filter((a) => a.contentType === 'inline').length;

const out = [];
out.push('# Community Library — Curation Audit');
out.push('');
out.push('_Generated by `scripts/audit-community-library.js`. Do not edit by hand — re-run the script after any changes to `components/community/CommunityLibrary.tsx` or referenced markdown files._');
out.push('');
out.push('## How to use this');
out.push('');
out.push('For each article below, mark **one** bucket. After completing the pass, send the marked-up file back and Claude will:');
out.push('');
out.push('1. delete the cut entries from the manifest allowlist + the component data');
out.push('2. regenerate `lib/community-library/manifest.generated.ts`');
out.push('3. (later) restructure the surviving articles into Foundations / Archetypal Maps / Practice sections');
out.push('');
out.push('## Bucket key');
out.push('');
out.push('| Mark | Layer | Standard |');
out.push('|---|---|---|');
out.push('| **F** | Foundations | Calibration-grade. Original thought. Withstands scrutiny. Feels authored. Defines the field. |');
out.push('| **A** | Archetypal Maps | Referential (Jung, alchemy, traditions). Framed as map, not doctrine. Has ethical guardrails. |');
out.push('| **P** | Practice | Applied. Tied to MAIA\'s actual architecture. NOT generic wellness. |');
out.push('| **I** | Internal / Move | Keep, but not on the public shelf — moves to product docs, /about, or internal notes. |');
out.push('| **X** | Cut | Filler, generic, no original insight, no clear authorship, or breaks field coherence. |');
out.push('');
out.push('## Filter rules (use these to decide)');
out.push('');
out.push('Cut if **any** of:');
out.push('');
out.push('- No original insight');
out.push('- No clear authorship (placeholder, "community-commons team" without a person)');
out.push('- No connection to MAIA\'s actual architecture');
out.push('- Reads like filler wisdom');
out.push('- Could exist unchanged on a generic blog → it does not belong here');
out.push('- Stub: under ~150 words and saying nothing distinctive');
out.push('- Product documentation pretending to be a paper');
out.push('');
out.push('## Calibration object');
out.push('');
out.push('**`presence-continuity`** is the calibration object. For every other article, ask:');
out.push('');
out.push('> _"Would encountering this immediately after `presence-continuity` strengthen or weaken the experience of that piece?"_');
out.push('');
out.push('If it weakens — cut or move internal.');
out.push('');
out.push(`Total articles: **${articles.length}** (${fileBacked} file-backed, ${inlineCount} inline)`);
out.push('');
out.push('---');
out.push('');

for (const collId of collOrder) {
  const coll = byCollection[collId];
  if (!coll || coll.articles.length === 0) continue;

  out.push(`## ${coll.title}`);
  out.push('');
  out.push(`_Collection id: \`${collId}\` — ${coll.articles.length} articles_`);
  out.push('');

  for (const a of coll.articles) {
    const wc = wordCount(a.contentBody);
    const op = opening(a.contentBody);
    const sourceLabel = a.contentType === 'file' ? `\`${a.contentSource}\`` : '_(inline in component)_';
    const missingFlag = a.missing ? ' ⚠️ **FILE MISSING**' : '';

    out.push(`### ${a.title}${missingFlag}`);
    out.push('');
    out.push(`- **id:** \`${a.id}\``);
    out.push(`- **source:** ${sourceLabel}`);
    out.push(`- **length:** ${wc.toLocaleString()} words`);
    if (a.description) out.push(`- **dek:** ${a.description}`);
    out.push('');
    out.push(`> ${op}`);
    out.push('');
    out.push('**bucket:** `[ ] F`  `[ ] A`  `[ ] P`  `[ ] I`  `[ ] X`');
    out.push('');
    out.push('**notes:**');
    out.push('');
    out.push('---');
    out.push('');
  }
}

fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
fs.writeFileSync(OUTPUT_PATH, out.join('\n'), 'utf8');

const sizeKB = (Buffer.byteLength(out.join('\n'), 'utf8') / 1024).toFixed(1);
console.log(
  `\u2713  Wrote audit for ${articles.length} articles (${fileBacked} file-backed, ${inlineCount} inline) → ${path.relative(REPO_ROOT, OUTPUT_PATH)} (${sizeKB} KB)`
);

// Stub list — useful for spot-checking
const stubs = articles
  .filter((a) => wordCount(a.contentBody) > 0 && wordCount(a.contentBody) < 150)
  .map((a) => `  - ${a.id} (${wordCount(a.contentBody)} words) — ${a.title}`);
if (stubs.length > 0) {
  console.log(`\nstubs under 150 words (${stubs.length}):`);
  console.log(stubs.join('\n'));
}

const missing = articles.filter((a) => a.missing);
if (missing.length > 0) {
  console.log(`\nmissing files (${missing.length}):`);
  console.log(missing.map((a) => `  - ${a.id} → ${a.contentSource}`).join('\n'));
}
