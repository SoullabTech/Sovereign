#!/usr/bin/env node
/**
 * build-community-library-manifest.js
 *
 * Bakes the allowlisted set of Community Library markdown files into a
 * generated TypeScript module that ships inside the production bundle.
 *
 * WHY THIS EXISTS
 * ---------------
 * The Community Library page references ~35 markdown files that live in
 * `Community-Commons/`, `docs/community-library/`, and `docs/papers/`.
 * Those directories are excluded from the Docker build context by
 * `.dockerignore` (large doc trees, *.md is blanket-ignored). Without
 * this manifest, the production container has no copy of the source
 * markdown, so any runtime fetch would 404.
 *
 * Rather than weaken `.dockerignore` or build a generic file-server API
 * (path traversal risk), we generate a TypeScript module containing only
 * the explicitly allowlisted articles. The module ships in `lib/`, which
 * IS included in the build context. The component imports the manifest
 * directly — no API, no runtime filesystem read, no path traversal
 * surface, no way to reach a file that isn't in this allowlist.
 *
 * GUARDRAILS
 * ----------
 * - The allowlist below is the only set of files that can ever be served.
 * - The script fails fast (non-zero exit) if any allowlisted file is
 *   missing on disk, so a broken build is impossible to ship.
 * - The generated file is committed; CI / dev should re-run this script
 *   whenever a referenced markdown file changes:
 *     npm run build:library-manifest
 *
 * HOW IT MAPS TO THE COMPONENT
 * ----------------------------
 * The keys are the `id` field of articles in
 * `components/community/CommunityLibrary.tsx`. The component looks up
 * each article's id in this manifest at render time. Articles whose
 * `content` field is inline markdown (e.g. the dream guides) are NOT in
 * the manifest — the component renders their `content` directly.
 */

const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '..');
const OUT_PATH = path.join(REPO_ROOT, 'lib', 'community-library', 'manifest.generated.ts');

/**
 * Article id → repo-relative path.
 * THIS IS THE WHITELIST. Adding an entry here is the only way to make a
 * new markdown file readable by the Community Library page.
 *
 * Keep in sync with `components/community/CommunityLibrary.tsx` article
 * `id` and `content` fields.
 */
// Pass 2 cull (2026-04-08): library reduced from 42 → 17 articles after a
// field-coherence pass. The classification (F/A/P/I/X) is documented in
// docs/curation/community-library-audit.md. Cuts made:
//
//   X (cut entirely): 14 — duplicates, stubs, marketing material, generic
//     wisdom, vision indexes, tone-violating field-claims-as-fact.
//   I (relocated off public shelf): 11 — product docs, training methods,
//     Community Commons orientation files, dream how-tos. Move targets
//     are noted in the audit worksheet but not actioned in this pass.
//
// What survives is the public reading shelf:
//   F (foundations, 5)        — calibration-grade, authored, structural
//   A (archetypal maps, 11)   — Hillman/Jungian lineage, framed as map
//   P (principles, 1)         — system transparency
//
// Do not re-add anything cut here without re-running the field-coherence
// pass. The shelf's job is to be small enough to actually mean something.
const ALLOWLIST = {
  // --- philosophical-foundations (F + A + F) ---
  'presence-continuity': 'docs/papers/presence-continuity.md',
  'jungian-alchemy-framework': 'docs/community-library/JUNGIAN_ALCHEMY_FRAMEWORK.md',
  'disposable-pixel-philosophy': 'docs/community-library/DISPOSABLE_PIXEL_PHILOSOPHY.md',

  // --- advanced-mastery (F + F + A) ---
  'spiral-mastery': 'Community-Commons/02-Thematic-Essays/_Published/Spiralogic of Soul.md',
  'technology-transcendence': 'Community-Commons/HUMANE_AI_MANIFESTO.md',
  'service-integration': 'Community-Commons/01-Core-Concepts/_Published/Soul vs Spirit.md',

  // --- platform-developments (F) ---
  'opus-axioms-system': 'Community-Commons/MAIA_OPUS_AXIOMS_SYSTEM_PAPER.md',

  // --- transformation-stories — alchemical stages (5 × A) ---
  'nigredo-descent': 'Community-Commons/01-Core-Concepts/_Published/Nigredo - The Sacred Descent.md',
  'albedo-purification': 'Community-Commons/01-Core-Concepts/_Published/Albedo - The White Light.md',
  'citrinitas-dawn': 'Community-Commons/01-Core-Concepts/_Published/Citrinitas - The Golden Dawn.md',
  'rubedo-completion': 'Community-Commons/01-Core-Concepts/_Published/Rubedo - The Red Work.md',
  'coniunctio-union': 'Community-Commons/01-Core-Concepts/_Published/Coniunctio - Sacred Union.md',

  // --- daily-integration — Hillman lineage essays (4 × A) ---
  'spiritual-bypass': 'Community-Commons/02-Thematic-Essays/_Published/Spiritual Bypass vs Soul Work.md',
  'depression-soul-work': 'Community-Commons/02-Thematic-Essays/_Published/Depression as Soul Work.md',
  'stick-with-image': 'Community-Commons/02-Thematic-Essays/_Published/Stick with the Image.md',
  'against-literalization': 'Community-Commons/02-Thematic-Essays/_Published/Against Literalization.md',

  // --- wisdom-engine (P) ---
  'how-wisdom-engine-learns': 'Community-Commons/HOW_THE_WISDOM_ENGINE_LEARNS.md',
};

function main() {
  const errors = [];
  const entries = {};

  for (const [id, relPath] of Object.entries(ALLOWLIST)) {
    const abs = path.join(REPO_ROOT, relPath);
    if (!fs.existsSync(abs)) {
      errors.push(`MISSING: ${id}\n  expected: ${relPath}`);
      continue;
    }
    try {
      const content = fs.readFileSync(abs, 'utf8');
      entries[id] = content;
    } catch (e) {
      errors.push(`READ FAILED: ${id} (${relPath}): ${e.message}`);
    }
  }

  if (errors.length > 0) {
    console.error('\nâ Œ Community library manifest build failed:\n');
    for (const err of errors) console.error('  ' + err);
    console.error(
      '\n  Either fix the source path in scripts/build-community-library-manifest.js'
    );
    console.error('  or remove the entry from the ALLOWLIST.\n');
    process.exit(1);
  }

  // Write the generated TS module.
  const banner = [
    '/**',
    ' * AUTO-GENERATED. DO NOT EDIT.',
    ' *',
    ' * Generated by scripts/build-community-library-manifest.js',
    ' * Re-run: npm run build:library-manifest',
    ' *',
    ' * Contains the markdown bodies of the allowlisted Community Library',
    ' * articles. The keys are article ids that match',
    ' * components/community/CommunityLibrary.tsx.',
    ' */',
    '',
    '/* eslint-disable */',
    '',
    'export const COMMUNITY_LIBRARY_ARTICLES: Record<string, string> = {',
  ].join('\n');

  const body = Object.entries(entries)
    .map(([id, md]) => {
      // Escape backticks and ${ sequences so the template literal is safe.
      const escaped = md.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$\{/g, '\\${');
      return `  ${JSON.stringify(id)}: \`${escaped}\`,`;
    })
    .join('\n');

  const footer = '};\n';

  const out = banner + '\n' + body + '\n' + footer;

  fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
  fs.writeFileSync(OUT_PATH, out, 'utf8');

  const sizeKB = (Buffer.byteLength(out, 'utf8') / 1024).toFixed(1);
  console.log(
    `âœ"  Wrote ${Object.keys(entries).length} articles to ${path.relative(REPO_ROOT, OUT_PATH)} (${sizeKB} KB)`
  );
}

main();
