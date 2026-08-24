#!/usr/bin/env node
/**
 * JARVIS — deterministic context derivation
 * ═══════════════════════════════════════════════════════════════════════════
 * Closes the gap between "JARVIS is bound to a repository" and "the worker was
 * shown any of it".
 *
 * The C1 lane already had a canonical materializer (jarvis-context.mjs) and a
 * canonical verifier (verifyEvidence). What it did not have was a way to obtain
 * `context_selectors` when the task did not carry them by hand. A repo-inspection
 * task therefore reached the worker with NO fragments, the worker answered from
 * its weights, and the verifier — correctly — refused to certify the result.
 * That refusal was right. The missing piece was perception, not judgement.
 *
 * THIS MODULE ONLY SELECTS. It materializes nothing, renders nothing, verifies
 * nothing, and decides no correctness. It emits the same selector objects a task
 * author would have written by hand, and hands them to the existing canonical
 * machinery unchanged. It is not a retrieval system: no embeddings, no vector
 * index, no model call, no ranking learned from anything. Same repo + same
 * prompt ⇒ same selectors, byte for byte.
 *
 * Evidence comes only from `git grep` over TRACKED files, so untracked scratch
 * files, build output and node_modules can never enter evidence. Read-only: this
 * module never writes to the repository.
 *
 * What it deliberately does NOT do: guarantee it finds anything. A prompt with
 * no repository purchase yields [] — and [] must remain UNVERIFIED downstream.
 * Deriving evidence is allowed to fail; manufacturing it is not.
 */

import { execFileSync } from 'node:child_process';

// Terms shorter than this match too much to be evidence of anything.
const MIN_TERM = 4;
// Bounded so one derivation cannot walk the whole repository.
const MAX_TERMS = 14;
const MAX_FILES_PER_TERM = 40;
// A term present in this share of the repository locates nothing — in
// MAIA-SOVEREIGN "MAIA" is in 4,600 of 10,800 tracked files. Such a term is
// dropped rather than allowed to outvote one that does locate something. This
// is frequency measured in THIS repository, not semantics: no model judges the
// word, and the threshold scales with the tree instead of being a magic count.
const UBIQUITY_RATIO = 0.25;

/**
 * Words that appear in almost any engineering request. Matching on these
 * selects noise and buries the terms that actually locate the subject.
 */
const STOPWORDS = new Set([
  'about', 'actual', 'actually', 'after', 'again', 'against', 'answer', 'anything',
  'because', 'been', 'before', 'being', 'below', 'between', 'both', 'build',
  'call', 'called', 'calls', 'change', 'changed', 'check', 'code', 'could',
  'current', 'currently', 'does', 'doing', 'done', 'down', 'during', 'each',
  'else', 'error', 'every', 'exactly', 'example', 'file', 'files', 'find',
  'first', 'from', 'full', 'give', 'goes', 'happen', 'happens', 'have', 'having',
  'here', 'high', 'how', 'implementation', 'implemented', 'inspect', 'into',
  'issue', 'just', 'know', 'like', 'line', 'lines', 'look', 'made', 'make',
  'many', 'more', 'most', 'much', 'must', 'need', 'needs', 'never', 'next',
  'not', 'now', 'only', 'other', 'over', 'part', 'please', 'point', 'problem',
  'question', 'really', 'report', 'return', 'returns', 'review', 'right', 'same',
  'says', 'see', 'seems', 'send', 'sends', 'sent', 'should', 'show', 'shows',
  'since', 'some', 'source', 'still', 'such', 'sure', 'system', 'take', 'tell',
  'than', 'that', 'the', 'their', 'them', 'then', 'there', 'these', 'they',
  'thing', 'this', 'those', 'through', 'time', 'told', 'under', 'until', 'use',
  'used', 'uses', 'using', 'very', 'want', 'was', 'well', 'were', 'what', 'when',
  'where', 'which', 'while', 'who', 'why', 'will', 'with', 'without', 'work',
  'working', 'works', 'would', 'your',
]);

/**
 * Pull candidate search terms out of a task prompt, most locating first.
 *
 * Three classes, in descending confidence that a hit means something:
 *   paths       — `app/api/members/email-code` : the author named a location
 *   identifiers — camelCase / snake_case / dotted : the author named a symbol
 *   words       — ordinary prose nouns that survive the stoplist
 *
 * @returns {{term:string, kind:'path'|'identifier'|'word'}[]}
 */
export function extractTerms(prompt) {
  const text = String(prompt || '');
  const seen = new Set();
  const out = [];
  const push = (raw, kind) => {
    const term = raw.trim().replace(/^[`'"(\[]+|[`'"),.\]:;]+$/g, '');
    if (term.length < MIN_TERM) return;
    const key = term.toLowerCase();
    if (seen.has(key)) return;
    if (kind === 'word' && STOPWORDS.has(key)) return;
    seen.add(key);
    out.push({ term, kind });
  };

  // 1. Path-shaped tokens — a slash and no whitespace.
  for (const m of text.matchAll(/[A-Za-z0-9_@.-]+(?:\/[A-Za-z0-9_@.[\]-]+)+(?:\.[A-Za-z0-9]+)?/g)) {
    push(m[0], 'path');
  }
  // 2. Identifier-shaped tokens — camelCase, snake_case, kebab-case, dotted.
  for (const m of text.matchAll(/\b[A-Za-z][A-Za-z0-9]*(?:[_-][A-Za-z0-9]+)+\b|\b[a-z]+[A-Z][A-Za-z0-9]*\b|\b[A-Z][a-z]+[A-Z][A-Za-z0-9]*\b/g)) {
    push(m[0], 'identifier');
  }
  // 3. Plain words.
  for (const m of text.matchAll(/\b[A-Za-z][A-Za-z0-9]{3,}\b/g)) {
    push(m[0], 'word');
  }

  const rank = { path: 0, identifier: 1, word: 2 };
  return out.sort((a, b) => rank[a.kind] - rank[b.kind]).slice(0, MAX_TERMS);
}

/**
 * Grammar only. Compounds are built from what the author actually typed, so the
 * prose stoplist must NOT be applied here: "code", "file" and "route" are
 * uninformative as lone search words and essential as parts of `email-code`.
 * Only words that cannot be part of a name are removed.
 */
const CONNECTIVES = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'but', 'by', 'do', 'does', 'for',
  'from', 'how', 'in', 'into', 'is', 'it', 'its', 'of', 'on', 'or', 'that',
  'the', 'this', 'to', 'was', 'were', 'what', 'when', 'where', 'which', 'why',
  'with',
]);

/**
 * Paths that hold PROOFS ABOUT code rather than the code itself: tests, specs,
 * fixtures, benchmarks, evaluation harnesses.
 *
 * These are legitimate evidence for a question about a test. They are not
 * primary evidence for a question about an implementation, and the difference
 * is structural rather than a matter of degree: a proof artifact is *written
 * about* the subject, so it reliably contains the subject's vocabulary — its
 * paths, its symbols, and in an adversarial proof the very fabrication under
 * test. On lexical selection it therefore beats the implementation it guards,
 * and the worker is handed a description of the code in place of the code.
 *
 * Witnessed on 2026-08-24: for "inspect the MAIA signup implementation", the
 * top-ranked evidence was the proof file asserting what that inspection should
 * find — including the fabricated Java path it exists to reject, which the
 * worker then repeated back as though it were source.
 */
const PROOF_PATH = new RegExp(
  [
    '(^|/)(tests?|__tests__|__mocks__|spec|specs|e2e|fixtures?|benchmarks?|evals?)(/|$)',
    '\\.(test|spec)\\.[cm]?[jt]sx?$',
    '(^|/)[\\w.-]*(proof|benchmark|fixture)[\\w.-]*\\.[cm]?[jt]sx?$',
  ].join('|'),
  'i',
);

/** True when `ref` is a proof/evaluation artifact rather than shipping code. */
export function isProofArtifact(ref) {
  return PROOF_PATH.test(String(ref || ''));
}

/**
 * Did the author ask ABOUT proofs? Then proofs are the subject, not a
 * substitute for it, and the tiering below must not fire.
 */
function asksAboutProofs(terms, compounds) {
  // Boundaried, not substring: "inspect" contains "spec", so a raw substring
  // probe reads every inspection request as a request about specs and disables
  // the tiering exactly when it is most needed. Witnessed here on 2026-08-24.
  const probe = /(^|[^a-z])(tests?|specs?|proofs?|benchmarks?|fixtures?|evals?)([^a-z]|$)/i;
  return terms.some((t) => probe.test(t.term)) || compounds.some((c) => probe.test(c));
}

/**
 * Code names things by joining words: "email code" is `email-code` on disk.
 * Rejoining adjacent prompt words in the four conventions a repository actually
 * uses turns a phrase into a candidate PATH, and a path hit is the strongest
 * evidence available — `email-code` matches 3 tracked paths here, where the bare
 * word "email" matches 866 files and locates nothing.
 *
 * This is the whole of the "understanding" in this module: adjacency in the
 * sentence, and the four join characters. No model, no synonyms, no learning.
 */
export function compoundCandidates(prompt) {
  const words = String(prompt || '')
    .split(/[^A-Za-z0-9]+/)
    .filter((w) => w.length >= 2 && !CONNECTIVES.has(w.toLowerCase()));
  const out = [];
  const seen = new Set();
  for (let i = 0; i < words.length - 1; i++) {
    const [a, b] = [words[i], words[i + 1]];
    for (const joined of [`${a}-${b}`, `${a}_${b}`, `${a}${b}`, `${a}/${b}`]) {
      const key = joined.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(joined);
    }
  }
  return out;
}

function git(repo, args) {
  try {
    return execFileSync('git', ['-C', repo, ...args], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
      maxBuffer: 8 * 1024 * 1024,
    });
  } catch {
    // git grep exits 1 on "no matches" — an empty result, not a failure.
    return '';
  }
}

/**
 * Files whose CONTENT contains the term. Tracked files only.
 *
 * Plain words match on word boundaries; paths and identifiers match as
 * substrings. Without that split, `-F` substring matching makes "resent" hit
 * every "present" and "represent" in the tree — 2,763 files of pure noise,
 * measured here on 2026-08-24.
 */
function filesMatching(repo, term, kind) {
  const flags = kind === 'word' ? ['-l', '-I', '-F', '-i', '-w'] : ['-l', '-I', '-F', '-i'];
  const all = git(repo, ['grep', ...flags, '--', term]).split('\n').filter(Boolean);
  return { files: all.slice(0, MAX_FILES_PER_TERM), total: all.length };
}

/** How many files the repository tracks — the denominator for ubiquity. */
function trackedCount(repo) {
  return git(repo, ['ls-files']).split('\n').filter(Boolean).length;
}

/**
 * Files whose PATH contains the term at a SEGMENT BOUNDARY.
 *
 * The boundary is what makes a path hit trustworthy. Bare substring matching
 * let the compound "email-and" select `qri-outreach-email-andres.txt` — a hit
 * on a word fragment, presented as though the author had named that file.
 * A term must start at `/` or the path start and end at `/`, `.`, `-` or the
 * end, so `email-code` matches `app/api/members/email-code/route.ts` and does
 * not match `outreach-email-andres.txt`.
 */
function pathsMatching(repo, term) {
  const esc = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const boundary = new RegExp(`(^|/)${esc}([/.-]|$)`, 'i');
  const all = git(repo, ['ls-files', '--', `*${term}*`])
    .split('\n')
    .filter(Boolean)
    .filter((f) => boundary.test(f));
  return { files: all.slice(0, MAX_FILES_PER_TERM), total: all.length };
}

/** Line numbers inside one file where a term occurs. */
function lineHits(repo, file, term, kind) {
  const flags = kind === 'word' ? ['-n', '-I', '-F', '-i', '-w'] : ['-n', '-I', '-F', '-i'];
  const out = git(repo, ['grep', ...flags, '--', term, '--', file]);
  return out
    .split('\n')
    .filter(Boolean)
    .map((l) => Number(l.split(':')[1]))
    .filter((n) => Number.isInteger(n));
}

function fileLineCount(repo, file) {
  const out = git(repo, ['show', `HEAD:${file}`]);
  return out ? out.split('\n').length : 0;
}

/**
 * Choose the densest window of hits: the line with the most neighbours inside
 * `window`. Deterministic — ties resolve to the earliest line.
 */
function densestWindow(hits, window, lineCount) {
  if (!hits.length) return null;
  const sorted = [...hits].sort((a, b) => a - b);
  let best = sorted[0];
  let bestCount = -1;
  for (const h of sorted) {
    const count = sorted.filter((o) => Math.abs(o - h) <= window / 2).length;
    if (count > bestCount) { bestCount = count; best = h; }
  }
  const half = Math.floor(window / 2);
  const start = Math.max(1, best - half);
  const end = Math.min(lineCount, start + window - 1);
  return { start, end: Math.max(start, end) };
}

/**
 * Derive bounded `context_selectors` for a task prompt against a bound repo.
 *
 * @param {string} prompt
 * @param {string} repo   absolute path to the bound repository
 * @param {object} [opts]
 * @param {number} [opts.maxFiles=6]  how many files may enter evidence
 * @param {number} [opts.window=80]   lines materialized per file
 * @returns {{ref:string, why:string, selector:{type:'lines',start:number,end:number}}[]}
 *          Empty when nothing in the repository answers to the prompt. Empty is
 *          a legitimate result and MUST remain UNVERIFIED downstream.
 */
export function deriveContextSelectors(prompt, repo, opts = {}) {
  const maxFiles = Number(opts.maxFiles ?? 6);
  const window = Number(opts.window ?? 80);
  const terms = extractTerms(prompt);
  if (!terms.length) return [];

  // Weight by term class. A path the author typed is near-certain evidence of
  // where they mean; a camelCase symbol is strong; a plain English word is weak
  // and — critically — earns NO bonus for appearing in a filename, or every
  // *.routes.ts in the tree outranks the one file the question is about.
  const KIND_WEIGHT = { path: 6, identifier: 3, word: 1 };
  const PATH_BONUS = { path: 6, identifier: 3, word: 0 };

  // file → Map(term → weight contributed)
  const scored = new Map();
  const kindOf = new Map(terms.map((t) => [t.term, t.kind]));
  const note = (file, term, weight) => {
    if (!scored.has(file)) scored.set(file, new Map());
    const e = scored.get(file);
    e.set(term, Math.max(e.get(term) ?? 0, weight));
  };

  const ubiquity = Math.max(200, Math.floor(trackedCount(repo) * UBIQUITY_RATIO));

  // Compound candidates are probed against PATHS only. A phrase that names a
  // directory is evidence of where the author means; the same phrase is not
  // expected to appear verbatim in file bodies.
  const located = new Set();
  const compounds = compoundCandidates(prompt);
  for (const compound of compounds) {
    const hit = pathsMatching(repo, compound);
    if (!hit.total || hit.total > ubiquity) continue;
    const rarity = 1 / Math.log2(hit.total + 2);
    for (const f of hit.files) {
      note(f, compound, (KIND_WEIGHT.path + PATH_BONUS.path) * rarity);
      located.add(f);
    }
    kindOf.set(compound, 'path');
  }

  for (const { term, kind } of terms) {
    const byPath = pathsMatching(repo, term);
    const byBody = filesMatching(repo, term, kind);
    // Document frequency across BOTH lookups, measured before capping so a
    // ubiquitous term cannot look rare just because its list was truncated.
    const df = byPath.total + byBody.total;
    if (df === 0 || df > ubiquity) continue;
    // Rarer terms weigh more. Deterministic, computed from this repository's
    // own counts — no corpus, no model, no learned parameters.
    const rarity = 1 / Math.log2(df + 2);
    for (const f of byPath.files) note(f, term, (KIND_WEIGHT[kind] + PATH_BONUS[kind]) * rarity);
    for (const f of byBody.files) note(f, term, KIND_WEIGHT[kind] * rarity);
  }
  if (!scored.size) return [];

  // When the prompt named a location that exists, evidence comes from THAT
  // location. Files that merely share vocabulary with the question are dropped
  // rather than ranked against it — the failure this replaces was a worker
  // answering about a subject it had never been shown, and a launch plan that
  // happens to contain the words "beta" and "email" is not the signup route.
  if (located.size) {
    for (const file of [...scored.keys()]) if (!located.has(file)) scored.delete(file);
  }

  // Rank by accumulated weight, then breadth of distinct terms, then the
  // shorter path, then lexicographic. Every tier is deterministic.
  const byWeight = [...scored.entries()]
    .map(([file, m]) => ({
      file,
      weight: [...m.values()].reduce((a, b) => a + b, 0),
      termScore: m.size,
      terms: [...m.keys()],
    }))
    .sort((a, b) =>
      b.weight - a.weight ||
      b.termScore - a.termScore ||
      a.file.length - b.file.length ||
      a.file.localeCompare(b.file));

  // A TIER, not a weight. No score a proof artifact can accumulate lifts it
  // above shipping code, because the problem is not that proofs scored too
  // highly — they scored correctly on vocabulary they legitimately contain.
  // Tuning the weight would only move the threshold at which the same
  // substitution happens again. Proofs still reach the worker as secondary
  // evidence when implementation does not fill the slots, and when the author
  // asked about proofs they are the subject and this ordering does not apply.
  // EXCLUSION, not a tier. Ordering was tried first and witnessed to fail on
  // 2026-08-24: with the implementation ranked first and the proof artifact
  // last, the worker read the proof anyway and answered from it. "Available as
  // secondary evidence" is not a safe state for a proof artifact — anything
  // placed in the packet is authorized source as far as the worker is
  // concerned, and a proof reads as an authoritative statement ABOUT the
  // subject, which is exactly what a worker looking for an answer will prefer.
  //
  // So for an implementation question, if any implementation evidence
  // qualifies, proof artifacts do not enter the packet at all. They become
  // eligible again when the author asks about a proof, or when nothing else
  // matched — evidence that is only a proof still beats no evidence, and the
  // verifier remains the thing that decides truth either way.
  const implementation = byWeight.filter((r) => !isProofArtifact(r.file));
  const ranked = (asksAboutProofs(terms, compounds) || implementation.length === 0)
    ? byWeight.slice(0, maxFiles)
    : implementation.slice(0, maxFiles);

  const selectors = [];
  for (const r of ranked) {
    const lineCount = fileLineCount(repo, r.file);
    if (!lineCount) continue;
    const hits = r.terms.flatMap((t) => lineHits(repo, r.file, t, kindOf.get(t)));
    // A path-only match has no body hit to centre on: open at the top of the
    // file, which is where a route's contract and comments live.
    const span = hits.length
      ? densestWindow(hits, window, lineCount)
      : { start: 1, end: Math.min(lineCount, window) };
    if (!span) continue;
    selectors.push({
      ref: r.file,
      why: `derived${isProofArtifact(r.file) ? ' (proof artifact — secondary evidence)' : ''}: `
        + `matched ${r.terms.slice(0, 4).join(', ')}`,
      selector: { type: 'lines', start: span.start, end: span.end },
    });
  }
  return selectors;
}

export default { deriveContextSelectors, extractTerms };
