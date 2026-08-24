// Desktop evidence aperture — how Desktop ASKS the runtime to reason from evidence.
//
// The seam this closes: the router/runtime already know how to reason from
// materialized evidence and to score an answer's containment inside it. Desktop
// had no way to ask. Every GUI C1 task shipped `{bounded_for_local, input_chars,
// prompt}` and nothing else, so it always materialized zero fragments and always
// came back UNVERIFIED — NO_EVIDENCE_CONTEXT.
//
// This does NOT introduce a second retrieval system, a second verifier, or a
// second selector schema:
//   • retrieval  — the registered C0 capabilities `repo.grep` / `repo.find_file`
//                  (git grep / git ls-files), passed in as runCapability
//   • limits     — the canonical `budget()` from jarvis-context.mjs
//   • schema     — the canonical {ref, selector:{type:'lines',start,end}, why}
//   • truth      — untouched; materializePacket + verifyEvidence still decide
//
// Selection is DETERMINISTIC, matching the canonical constraint recorded in
// jarvis-context.mjs: no embeddings, no vector search, no LLM-based selection.
// The same prompt against the same repo at the same sha yields the same
// selectors, and the derivation record says why each file was chosen.
//
// It proposes evidence. It never asserts that evidence supports an answer.

'use strict';

const fs = require('node:fs');
const path = require('node:path');

const MAX_FILES = 3;                 // fragments offered to the worker
const WINDOW = 12;                   // lines of context each side of a hit
const MAX_LINES_PER_FRAGMENT = 60;
const TERM_MAX_FILES = 40;           // a term hitting more files than this is too common to localize
const MIN_TERM_LEN = 4;
const GREP_MAX_RESULTS = 200;        // capability's own ceiling

// Low-signal words. Deliberately small and literal: this list exists to stop
// "what/does/the/with" from being grepped, not to understand English.
const STOPWORDS = new Set([
  'what','when','where','which','while','whose','why','how','who','does','did','doing','done',
  'the','this','that','these','those','there','their','them','then','than','they',
  'with','without','within','from','into','onto','over','under','about','after','before',
  'have','has','had','been','being','are','was','were','will','would','should','could','can',
  'and','but','for','not','you','your','our','its','it','is','of','to','in','on','at','a','an',
  'file','files','code','line','lines','show','tell','find','look','give','make','used','use',
  'work','works','working','happen','happens','value','values','thing','things','some','any',
  'currently','actually','really','please','explain','describe','something','anything',
]);

/** Tokens that look like a repository path: contains a slash and an extension. */
const PATH_RE = /\b[\w.-]+(?:\/[\w.-]+)+\.\w{1,6}\b/g;
const WORD_RE = /[A-Za-z_][A-Za-z0-9_]*/g;

/**
 * A term earns a grep only if it carries shape. Identifier-shaped tokens
 * (snake_case, camelCase, PascalCase, SCREAMING_CASE) are high signal; plain
 * lowercase words are kept only when long enough and not a stopword.
 */
function isCandidateTerm(w) {
  if (w.length < MIN_TERM_LEN) return false;
  if (STOPWORDS.has(w.toLowerCase())) return false;
  if (w.includes('_')) return true;
  if (/[a-z][A-Z]/.test(w)) return true;         // camelCase / PascalCase boundary
  if (/^[A-Z][a-zA-Z]+$/.test(w)) return true;   // Capitalized identifier
  return w.length >= 5;                          // ordinary word, must be substantial
}

function extractTerms(prompt) {
  const text = String(prompt || '');
  const paths = Array.from(new Set(text.match(PATH_RE) || []));
  const seen = new Set();
  const words = [];
  for (const m of text.matchAll(WORD_RE)) {
    const w = m[0];
    if (!isCandidateTerm(w)) continue;
    const key = w.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    words.push(w);
  }
  // Longer/odder terms first — they localize better and we grep a bounded number.
  words.sort((a, b) => b.length - a.length || a.localeCompare(b));
  return { paths, words };
}

/** `git grep --null -n` emits: path \0 lineno \0 content */
function parseGrep(stdout) {
  const out = [];
  for (const line of String(stdout || '').split('\n')) {
    if (!line) continue;
    const p1 = line.indexOf('\0');
    if (p1 < 0) continue;
    const p2 = line.indexOf('\0', p1 + 1);
    if (p2 < 0) continue;
    const file = line.slice(0, p1);
    const lineNo = Number(line.slice(p1 + 1, p2));
    if (!Number.isInteger(lineNo) || lineNo < 1) continue;
    out.push({ file, line: lineNo, text: line.slice(p2 + 1) });
  }
  return out;
}

// Evidence for a repository question comes from repository SOURCE. Corpora,
// build output and vendored trees are not evidence about how the system behaves,
// and letting them in produced a literal Sumerian-mythology .txt as "evidence"
// during development of this module.
const CODE_EXT = /\.(ts|tsx|js|jsx|mjs|cjs|py|sql|sh|bash|ya?ml|json|mdx?|css|scss|html)$/i;
const EXCLUDED_PATH = /(^|\/)(node_modules|dist|build|\.next|out|coverage|backups|training-data|books|static-sites|public|data|assets|golden-states|patches)\//;

function isEligibleFile(f) {
  return CODE_EXT.test(f) && !EXCLUDED_PATH.test(f);
}

/**
 * Does this line look like where the term is DEFINED, rather than merely
 * mentioned? Deterministic and syntactic — no parsing, no inference.
 */
function looksLikeDefinition(text, term) {
  const t = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(
    `(export\\s+)?(async\\s+)?(function|class|const|let|var|def|interface|type|enum)\\s+${t}\\b`
    + `|${t}\\s*[:=]\\s*(function|async|\\(|\\{)`
    + `|^\\s*(export\\s+)?${t}\\s*[:(]`
  ).test(String(text || ''));
}

/**
 * Identifier-shaped terms name things in the system. Plain lowercase words are
 * ordinary English that happens to appear in source.
 */
function isIdentifierShaped(term) {
  const t = String(term).replace(/ \(substring\)$/, '');
  return t.includes('/') || t.includes('_') || /[a-z][A-Z]/.test(t) || /^[A-Z]{2,}/.test(t);
}

/**
 * Evidence must be offered on a real signal, not a coincidence of vocabulary.
 *
 * A file qualifies only if it matched more than one question term, OR contains a
 * definition of a matched term, OR was matched by an identifier-shaped term. A
 * single ordinary English word matching an unrelated file is a coincidence, and
 * offering it as evidence invites an answer that is CONTAINED but useless —
 * verifyEvidence scores containment, never relevance. Declining here is what
 * keeps "no eligible evidence" honest instead of manufacturing something
 * citable so the badge reads VERIFIED.
 */
function qualifies(entry) {
  if (entry.termCount >= 2) return true;
  if (entry.defs >= 1) return true;
  return Array.from(entry.termsSet).some(isIdentifierShaped);
}

/** Deprioritise tests and docs unless the question is actually about them. */
function isSupportingFile(f) {
  return /(^|\/)(__tests__|test|tests|docs)\//.test(f) || /\.test\.|\.spec\./.test(f);
}

function mergeWindows(lineNos, fileLineCount) {
  const sorted = Array.from(new Set(lineNos)).sort((a, b) => a - b);
  const ranges = [];
  for (const n of sorted) {
    const start = Math.max(1, n - WINDOW);
    const end = Math.min(fileLineCount, n + WINDOW);
    const last = ranges[ranges.length - 1];
    if (last && start <= last.end + 1) last.end = Math.max(last.end, end);
    else ranges.push({ start, end });
  }
  // Keep the densest single range, capped. One range per file keeps the offered
  // evidence legible and the citation surface small.
  const best = ranges.sort((a, b) => (b.end - b.start) - (a.end - a.start))[0];
  if (!best) return null;
  if (best.end - best.start + 1 > MAX_LINES_PER_FRAGMENT) {
    best.end = Math.min(fileLineCount, best.start + MAX_LINES_PER_FRAGMENT - 1);
  }
  return best;
}

function countLines(root, ref) {
  try {
    return fs.readFileSync(path.join(root, ref), 'utf8').split('\n').length;
  } catch { return 0; }
}

/**
 * Derive canonical context_selectors for a bounded repository question.
 *
 * @param {object}   io
 * @param {string}   io.prompt          the founder's question, verbatim
 * @param {string}   io.root            the bound operated repository
 * @param {Function} io.runCapability   deterministic.mjs runCapability (C0 retrieval)
 * @param {Function} [io.budget]        jarvis-context.mjs budget() — canonical limit
 * @returns {{selectors: Array, derivation: object}}
 *
 * Fails CLOSED: any failure yields zero selectors and a stated reason, so the
 * C1 lane reports UNVERIFIED — NO_EVIDENCE_CONTEXT rather than guessing. Missing
 * evidence must never become confidence.
 */
function deriveSelectors({ prompt, root, runCapability, budget }) {
  const derivation = {
    method: 'deterministic-grep-aperture',
    terms_considered: [], terms_used: [], terms_dropped: [],
    files_ranked: [], dropped_for_budget: [], reason: null,
  };
  if (!root || typeof runCapability !== 'function') {
    derivation.reason = 'APERTURE_UNAVAILABLE — no bound repository or no capability runner';
    return { selectors: [], derivation };
  }

  try {
    const { paths, words } = extractTerms(prompt);
    derivation.terms_considered = [...paths, ...words];

    const fileHits = new Map();   // file -> {terms:Set, lines:[], defs:number}
    const note = (file, line, term, text) => {
      if (!isEligibleFile(file)) return;
      if (!fileHits.has(file)) fileHits.set(file, { terms: new Set(), lines: [], defs: 0 });
      const e = fileHits.get(file);
      e.terms.add(term);
      if (line) e.lines.push(line);
      if (text && looksLikeDefinition(text, term)) { e.defs++; e.defLine = line; }
    };

    // Explicit paths are honoured first — the founder named them.
    for (const p of paths) {
      const r = runCapability('repo.find_file', { pattern: `*${p.split('/').pop()}` }, root);
      const match = String(r.stdout || '').split('\n').find((f) => f && (f === p || f.endsWith(`/${p}`) || p.endsWith(f)));
      if (match) { note(match, null, p); derivation.terms_used.push(p); }
      else derivation.terms_dropped.push({ term: p, why: 'no such tracked file' });
    }

    // Bounded number of greps; terms that hit too much of the repo cannot localize.
    for (const w of words.slice(0, 8)) {
      // Word-boundary first. If that finds nothing, fall back to a substring
      // match: `_` is a word character, so `\boversized\b` cannot see
      // `rejected_oversized` — the exact case that made this aperture pick
      // unrelated files during development.
      let hits = [];
      let matchMode = 'word-boundary';
      for (const [mode, pattern] of [['word-boundary', `\\b${w}\\b`], ['substring', w]]) {
        try {
          const r = runCapability('repo.grep', { pattern, max_results: GREP_MAX_RESULTS }, root);
          hits = parseGrep(r.stdout).filter((h) => isEligibleFile(h.file));
        } catch { hits = []; }
        matchMode = mode;
        if (hits.length) break;
      }
      if (!hits.length) { derivation.terms_dropped.push({ term: w, why: 'no matches in eligible source files' }); continue; }
      const distinctFiles = new Set(hits.map((h) => h.file));
      if (distinctFiles.size > TERM_MAX_FILES) {
        derivation.terms_dropped.push({ term: w, why: `too common (${distinctFiles.size} files > ${TERM_MAX_FILES})` });
        continue;
      }
      derivation.terms_used.push(matchMode === 'substring' ? `${w} (substring)` : w);
      for (const h of hits) note(h.file, h.line, w, h.text);
    }

    if (!fileHits.size) {
      derivation.reason = 'NO_ELIGIBLE_EVIDENCE — no sufficiently specific term in the question resolved to repository content';
      return { selectors: [], derivation };
    }


    // Rank: distinct terms dominate; hit count breaks ties; supporting files
    // (tests/docs) yield to source; path sort makes the result reproducible.
    const ranked = Array.from(fileHits.entries())
      .map(([file, e]) => ({ file, termCount: e.terms.size, defs: e.defs, hits: e.lines.length, supporting: isSupportingFile(file), lines: e.lines, termsSet: e.terms }))
      .filter((e) => {
        if (qualifies(e)) return true;
        derivation.terms_dropped.push({ term: Array.from(e.termsSet).join(', '), why: `weak match in ${e.file} — single ordinary word, no definition` });
        return false;
      })
      .sort((a, b) =>
        (b.termCount - a.termCount)
        // where a term is DEFINED beats where it is merely mentioned
        || (b.defs - a.defs)
        || (a.supporting === b.supporting ? 0 : a.supporting ? 1 : -1)
        || (b.hits - a.hits)
        || a.file.localeCompare(b.file));
    derivation.files_ranked = ranked.slice(0, 8).map(({ lines, termsSet, ...m }) => m);

    if (!ranked.length) {
      derivation.reason = 'NO_ELIGIBLE_EVIDENCE — candidate files matched only ordinary words, with no definition and no identifier-shaped term';
      return { selectors: [], derivation };
    }

    let selectors = [];
    for (const r of ranked) {
      if (selectors.length >= MAX_FILES) break;
      const total = countLines(root, r.file);
      if (!total) continue;
      const range = r.lines.length ? mergeWindows(r.lines, total) : { start: 1, end: Math.min(total, MAX_LINES_PER_FRAGMENT) };
      if (!range) continue;
      selectors.push({
        ref: r.file,
        selector: { type: 'lines', start: range.start, end: range.end },
        why: `matched ${r.termCount} question term(s): ${Array.from(fileHits.get(r.file).terms).join(', ')}`,
      });
    }

    // Canonical containment limit. Drop the lowest-ranked fragment until the
    // packet fits rather than inventing a private cap.
    if (typeof budget === 'function') {
      while (selectors.length) {
        let b;
        try { b = budget({ context_selectors: selectors }, root, String(prompt || '').length); }
        catch { break; }
        if (b.within_budget) break;
        const dropped = selectors.pop();
        derivation.dropped_for_budget.push({ ref: dropped.ref, status: b.status });
      }
    }

    if (!selectors.length) {
      derivation.reason = derivation.dropped_for_budget.length
        ? 'NO_ELIGIBLE_EVIDENCE — every candidate fragment exceeded the context budget'
        : 'NO_ELIGIBLE_EVIDENCE — candidates found but none could be materialized';
    }
    return { selectors, derivation };
  } catch (e) {
    derivation.reason = `APERTURE_FAILED — ${String(e.message).slice(0, 200)}`;
    return { selectors: [], derivation };
  }
}

module.exports = { deriveSelectors, extractTerms, parseGrep, isCandidateTerm, isEligibleFile, looksLikeDefinition, isIdentifierShaped };
