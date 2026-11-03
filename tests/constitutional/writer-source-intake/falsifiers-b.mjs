// falsifiers-b.mjs -- static falsifiers about LIBRARY, KMS, ERASURE and OPERATIONS for the Writer
// original-file intake (SF-10 ... SF-19; SF-16 is split into SF-16a and SF-16b).
//
// The brief called these nine falsifiers; SF-10 .. SF-19 with SF-16 split in two is eleven objects. Nothing was
// merged or dropped to make the number nine.
//
// Plain Node ESM, node: built-ins plus ./lib/tree.mjs and ./lib/strip.mjs only. Fictional data only. Every
// check reads the repository through an immutable Tree (comment-stripped, and where a token must be CODE
// rather than text, string-literal-blanked as well), and every evidence line is content-free: a path, a line
// number, a count, a fixed phrase of this module. Never a matched source line, never a quoted string.
//
// EXPORTS
//   FALSIFIERS_B   the falsifier objects (contract in the lane brief): SF-10 SF-11 SF-12 SF-13 SF-14 SF-15
//                  SF-16a SF-16b SF-17 SF-18 SF-19
//   checkSource    pure helper behind SF-13: checkSource(rawTsSource, { bearing }) -> { ok, evidence, findings }
//   selfTest()     { ok, checks } -- the lethality proof (see section 9)
//   Run directly:  node falsifiers-b.mjs   -> compact result, exit 0 on ok, 1 otherwise
//
// THE CONTRACT, AS IMPLEMENTED
//   { id, title, law, obligations, claims, kind, expectedToday, whyExpected, rulingPending,
//     check(tree) -> { ok, evidence[] }, defeats[{ name, kind:'break'|'fix', apply(tree), expect }] }
//   GREEN = the law HOLDS (check.ok); RED = the law is VIOLATED today. A GREEN falsifier carries >=1 'break'
//   defeat expecting RED; a RED falsifier carries >=1 'fix' defeat expecting GREEN.
//   Extra defeats are allowed and used on purpose:
//     * a 'fix' that must STAY RED   -- a fix-looking change that does not satisfy the law (an await only in a
//       comment, a mount on the wrong path, a credential added to every service). Its name starts WRONG FIX.
//     * a defeat whose name carries SUBTLE -- a change a naive text search would misjudge (a guard kept only
//       inside a comment).
//   Two OPTIONAL fields beyond the contract, ignored by anything that does not know them:
//     defeat.diesBecause   a fragment that MUST appear in the evidence of a RED outcome, so a defeat cannot
//                          "pass" by making a file unreadable or for any reason other than the named one
//     falsifier.decoys     realistic edits that a NAIVE check would misjudge but the law does not: each keeps
//                          the real-tree outcome (a comment, a test-file mention, a defence-in-depth guard)
//
// FAIL-CLOSED EVERYWHERE: a missing file, a file the comment stripper could not close, or a function this
// module cannot locate yields an "INCONCLUSIVE:" evidence line and ok:false. UNKNOWN is never GREEN, and a
// defeat that "works" only because a file became unreadable is rejected by selfTest.
//
// KNOWN LIMITS (read, not hidden; each is repeated where it bites)
//   * Static text analysis, not execution. "Calls X" means a call expression for X appears in code (not in a
//     comment or a string); it does not mean the line is reachable at run time. A library or app file counts as
//     DEPLOYED only when it is reachable by static import from a Next entry file (route, page, layout ...), root
//     middleware, or a script that the production compose file (or a Dockerfile it builds) names; a dynamic
//     dispatch, a path assembled from a string and a framework convention this module does not know are not followed.
//   * Function ranges (SF-13) are recognised for `function NAME(` declarations, `const NAME = ...` arrows with a
//     block or a concise body, function expressions, object-literal and class methods and property values.
//     Calls are matched by bare name (or by a name the import or a const renamed it to), which over-detects - the
//     safe side for a "must not call" law - and under-detects a callee reached through a computed property, a
//     dynamic import or an array of functions. Outside lib/manuscript/source a file is scanned when it IMPORTS a
//     library module, so a callee reached only through a second hop of unrelated wrappers is not seen.
//   * A guard whose throw is delegated to a helper function (SF-19) is not recognised and reads RED, the safe
//     direction: the refusal must be a throw statement of the guard itself, unconditional in its block.
//   * The YAML reader (section 5) covers what docker-compose uses: block maps and sequences, anchors, aliases,
//     merge keys, flow lists/maps, quoted and plain scalars, block scalars. During development it was compared
//     with an independent parser over every compose file in the repository and over synthetic documents with
//     anchors, merge keys and flow forms: identical structure. It differs on ONE thing, block scalar chomping
//     and folding (a `>` block is not folded and the trailing newline is dropped), which only matters for
//     text search inside a command. The comparison is a development fact, not a run-time check (zero
//     dependencies); selfTest pins the constructs this module relies on. A bare `KEY:` and `KEY: ""` read the
//     same, so an empty FILE_STORAGE_PATH is treated as unresolved, never as the default.
//   * Test files are recognised by path (a test directory, a .test./.spec. name). Only a SCRIPT under
//     scripts/witness or named like a probe or witness is treated as a harness (it is not a caller); a library or
//     app file is deployed code whatever it is called, and only test paths are excused from the library scans.
//   * Compose files are read as COMMITTED. The live stack adds git-absent overrides and an uncommitted
//     .env.production; nothing here can see them, and where that matters the evidence says so.
//   * SF-15 judges each service at the vault root ITS OWN committed environment sets. A service on the
//     application image that starts something other than the server or a repo script this check can read is
//     UNCLASSIFIED in the production compose, and unclassified is INCONCLUSIVE, never "does not sweep". A script
//     runs the sweep when its imports (or the scripts a shell script runs) reach a file that calls or defines it.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { randomBytes } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { createTree, VacuousMutation } from './lib/tree.mjs';
import { stripCommentsDetailed } from './lib/strip.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '../../..');

// =====================================================================================================
// 1. SOURCE ANALYSIS PRIMITIVES
// =====================================================================================================

const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** 1-based line of an index. The comment stripper and the literal blanker both preserve every offset. */
function lineAt(text, idx) {
  let n = 1;
  const end = Math.min(idx, text.length);
  for (let i = 0; i < end; i++) if (text.charCodeAt(i) === 10) n++;
  return n;
}

const RX_WORDS = new Set(['return', 'typeof', 'case', 'in', 'of', 'delete', 'void', 'throw', 'new', 'else', 'do', 'yield', 'await', 'instanceof']);
const RX_PREV = '(,=:[!&|?{};+-*%~^';

/**
 * Lex comment-stripped TS/JS. Returns { bl, spans, issues }:
 *   bl      same length as the input; the CONTENT of string literals, template TEXT and regex literals is
 *           replaced by spaces (newlines kept), quotes/backticks kept. Code inside a template `${ ... }` is
 *           KEPT AS CODE (a call there is a real call) and strings nested in it are blanked in turn.
 *   spans   [{ start, end, kind }] content ranges that were blanked ('str' | 'tpl' | 'regex')
 *   issues  unterminated string / template (reported, never guessed at)
 * After this, a token can only be matched where it is CODE.
 */
function lexCode(code) {
  const n = code.length;
  const out = code.split('');
  const spans = [];
  const issues = [];
  const lineOf = (idx) => lineAt(code, idx);
  const blank = (a, b, kind) => {
    if (b <= a) return;
    for (let k = a; k < b; k++) {
      const c = out[k];
      if (c !== '\n' && c !== '\r') out[k] = ' ';
    }
    spans.push({ start: a, end: b, kind });
  };

  function scanString(i, q) {
    let j = i + 1;
    while (j < n) {
      const ch = code[j];
      if (ch === '\\') { j += 2; continue; }
      if (ch === q) { blank(i + 1, j, 'str'); return j + 1; }
      if (ch === '\n') { issues.push({ kind: 'unterminated-string', line: lineOf(i) }); blank(i + 1, j, 'str'); return j; }
      j++;
    }
    issues.push({ kind: 'unterminated-string', line: lineOf(i) });
    blank(i + 1, n, 'str');
    return n;
  }

  function scanTemplate(i) {
    let j = i + 1;
    let seg = j;
    while (j < n) {
      const ch = code[j];
      if (ch === '\\') { j += 2; continue; }
      if (ch === '`') { blank(seg, j, 'tpl'); return j + 1; }
      if (ch === '$' && code[j + 1] === '{') {
        blank(seg, j, 'tpl');
        const close = scanCode(j + 2, true);
        if (close >= n) { issues.push({ kind: 'unterminated-template', line: lineOf(i) }); return n; }
        j = close + 1;
        seg = j;
        continue;
      }
      j++;
    }
    issues.push({ kind: 'unterminated-template', line: lineOf(i) });
    blank(seg, n, 'tpl');
    return n;
  }

  function scanCode(start, inExpr) {
    let i = start;
    let depth = 0;
    let prev = '';
    let prevWord = '';
    while (i < n) {
      const ch = code[i];
      if (ch === ' ' || ch === '\t' || ch === '\n' || ch === '\r') { i++; continue; }
      if (ch === "'" || ch === '"') { i = scanString(i, ch); prev = ch; prevWord = ''; continue; }
      if (ch === '`') { i = scanTemplate(i); prev = '`'; prevWord = ''; continue; }
      if (ch === '{') depth++;
      else if (ch === '}') {
        if (inExpr && depth === 0) return i;
        depth--;
      } else if (ch === '/') {
        const regexOk = prev === '' || RX_PREV.includes(prev) || RX_WORDS.has(prevWord);
        if (regexOk && code[i + 1] !== '/' && code[i + 1] !== '*') {
          let j = i + 1;
          let inClass = false;
          let closed = -1;
          while (j < n) {
            const c = code[j];
            if (c === '\\') { j += 2; continue; }
            if (c === '\n') break;
            if (c === '[') inClass = true;
            else if (c === ']') inClass = false;
            else if (c === '/' && !inClass) { closed = j; break; }
            j++;
          }
          if (closed > 0) {
            blank(i + 1, closed, 'regex');
            j = closed + 1;
            while (j < n && /[a-z]/i.test(code[j])) j++;
            i = j;
            prev = ')';
            prevWord = '';
            continue;
          }
        }
      } else if (/[A-Za-z0-9_$]/.test(ch)) {
        let j = i;
        while (j < n && /[A-Za-z0-9_$]/.test(code[j])) j++;
        prevWord = code.slice(i, j);
        prev = code[j - 1];
        i = j;
        continue;
      }
      prev = ch;
      prevWord = '';
      i++;
    }
    return n;
  }

  scanCode(0, false);
  return { bl: out.join(''), spans, issues };
}

/** Index of the bracket closing the one at `open` (same bracket type), or -1. Run on blanked text only. */
function matchClose(t, open) {
  const o = t[open];
  const c = o === '(' ? ')' : o === '{' ? '}' : o === '[' ? ']' : null;
  if (!c) return -1;
  let d = 0;
  for (let i = open; i < t.length; i++) {
    const ch = t[i];
    if (ch === o) d++;
    else if (ch === c) {
      d--;
      if (d === 0) return i;
    }
  }
  return -1;
}

/**
 * Index of the `{` that opens the BODY of a function whose parameter list closed at `pc`. A return type may
 * itself contain braces (`Promise<{ a: string }>`, `: { a: 1 }`); those are type literals and are skipped.
 */
function findBodyOpen(bl, pc) {
  let i = pc + 1;
  let angle = 0;
  while (i < bl.length) {
    const c = bl[i];
    if (c === '<') { angle++; i++; continue; }
    if (c === '>') {
      if (bl[i - 1] === '=') { i++; continue; }
      if (angle > 0) angle--;
      i++;
      continue;
    }
    if (angle > 0) { i++; continue; }
    if (c === '(' || c === '[') {
      const e = matchClose(bl, i);
      if (e < 0) return -1;
      i = e + 1;
      continue;
    }
    if (c === '{') {
      let k = i - 1;
      while (k > pc && /\s/.test(bl[k])) k--;
      const pv = bl[k];
      if (pv === ':' || pv === '|' || pv === '&' || pv === ',' || pv === '=') {
        const e = matchClose(bl, i);
        if (e < 0) return -1;
        i = e + 1;
        continue;
      }
      return i;
    }
    if (c === ';') return -1;
    i++;
  }
  return -1;
}

const FN_DECL_RE = /(?:^|[\n;}])\s*(?:export\s+)?(?:default\s+)?(?:async\s+)?function\s*\*?\s*([A-Za-z_$][\w$]*)\s*(?:<[^()]*?>)?\s*\(/g;
const FN_ARROW_RE = /(?:^|[\n;}])\s*(?:export\s+)?const\s+([A-Za-z_$][\w$]*)\s*(?::[^=\n]+)?=\s*(?:async\s*)?\(/g;

/** Every named function of a blanked file (nested ones too): [{ name, start, open, close, params }]. */
function functionsIn(bl) {
  const found = [];
  const take = (m, arrow) => {
    const name = m[1];
    const p = m.index + m[0].length - 1;
    const pc = matchClose(bl, p);
    if (pc < 0) return;
    let open;
    if (arrow) {
      const a = bl.indexOf('=>', pc);
      if (a < 0) return;
      let k = a + 2;
      while (k < bl.length && /\s/.test(bl[k])) k++;
      if (bl[k] !== '{') return;
      open = k;
    } else {
      open = findBodyOpen(bl, pc);
    }
    if (open < 0) return;
    const close = matchClose(bl, open);
    if (close < 0) return;
    found.push({ name, start: m.index, open, close, params: bl.slice(p + 1, pc) });
  };
  for (const m of bl.matchAll(FN_DECL_RE)) take(m, false);
  for (const m of bl.matchAll(FN_ARROW_RE)) take(m, true);
  found.sort((a, b) => a.start - b.start);
  return found;
}

/**
 * Outermost named functions of a blanked file. Functions nested inside another are not listed (calls inside
 * them attribute to the outer one).
 */
function topLevelFunctions(bl) {
  const outer = [];
  for (const f of functionsIn(bl)) {
    const last = outer[outer.length - 1];
    if (last && f.start > last.open && f.start < last.close) continue;
    outer.push(f);
  }
  return outer;
}

/** Every `if (...)` statement in [from, to), with offsets so the ORIGINAL text can be read at the same place. */
function ifGates(bl, from, to) {
  const out = [];
  const re = /\bif\s*\(/g;
  re.lastIndex = from;
  let m;
  while ((m = re.exec(bl)) && m.index < to) {
    const open = m.index + m[0].length - 1;
    const close = matchClose(bl, open);
    if (close < 0) continue;
    let k = close + 1;
    while (k < bl.length && /\s/.test(bl[k])) k++;
    let bodyStart;
    let bodyEnd;
    if (bl[k] === '{') {
      bodyStart = k + 1;
      bodyEnd = matchClose(bl, k);
      if (bodyEnd < 0) continue;
    } else {
      bodyStart = k;
      const semi = bl.indexOf(';', k);
      bodyEnd = semi < 0 ? bl.length : semi + 1;
    }
    out.push({
      pos: m.index,
      condStart: open + 1,
      condEnd: close,
      bodyStart,
      bodyEnd,
      cond: bl.slice(open + 1, close),
      body: bl.slice(bodyStart, bodyEnd),
      throws: /\bthrow\b/.test(bl.slice(bodyStart, bodyEnd)),
      returns: /\b(?:return|throw)\b/.test(bl.slice(bodyStart, bodyEnd)),
    });
  }
  return out;
}

/** Brace depth of statement blocks at `to`, ignoring braces inside parentheses (object literals in calls). */
function blockDepthAt(bl, from, to) {
  let depth = 0;
  let paren = 0;
  for (let i = from; i < to; i++) {
    const c = bl[i];
    if (c === '(') paren++;
    else if (c === ')') paren = Math.max(0, paren - 1);
    else if (paren === 0) {
      if (c === '{') depth++;
      else if (c === '}') depth--;
    }
  }
  return depth;
}

/**
 * Call expressions for NAME in [from, to) of blanked code, as [{ idx, start }]: idx is the identifier, start is
 * where the whole expression begins (a namespace or member chain such as ns.NAME( starts earlier). A
 * declaration (function NAME( ) is not a call site. newOnly matches `new NAME(`.
 */
function callSitesDetailed(bl, name, from = 0, to = bl.length, { newOnly = false } = {}) {
  const out = [];
  if (newOnly) {
    const re = new RegExp(`\\bnew\\s+${esc(name)}\\s*\\(`, 'g');
    re.lastIndex = from;
    let m;
    while ((m = re.exec(bl)) && m.index < to) out.push({ idx: m.index + m[0].indexOf(name), start: m.index });
    return out;
  }
  const re = new RegExp(`(?<![\\w$])${esc(name)}\\s*\\(`, 'g');
  re.lastIndex = from;
  let m;
  while ((m = re.exec(bl)) && m.index < to) {
    const idx = m.index;
    const head = bl.slice(Math.max(0, idx - 10), idx);
    if (/\bfunction\s+$/.test(head) || /\bnew\s+$/.test(head)) continue;
    // walk back over a namespace or member chain: ns.NAME( and x?.ns.NAME(
    let start = idx;
    for (;;) {
      let j = start;
      while (j > 0 && /\s/.test(bl[j - 1])) j--;
      if (bl[j - 1] !== '.') break;
      let q = j - 1;
      if (bl[q - 1] === '?') q--;
      while (q > 0 && /\s/.test(bl[q - 1])) q--;
      let r = q;
      while (r > 0 && /[\w$]/.test(bl[r - 1])) r--;
      if (r === q) break;
      start = r;
    }
    out.push({ idx, start });
  }
  return out;
}

function callSites(bl, name, from = 0, to = bl.length, opts = {}) {
  return callSitesDetailed(bl, name, from, to, opts).map((x) => x.idx);
}

/** Arguments range of the call whose `(` follows the identifier at `idx`: { open, close } or null. */
function callParens(bl, idx, name) {
  const p = bl.indexOf('(', idx + name.length);
  if (p < 0) return null;
  const c = matchClose(bl, p);
  return c < 0 ? null : { open: p, close: c };
}

/** The top-level function (from topLevelFunctions) whose body contains idx, or null. */
function enclosing(fns, idx) {
  for (const f of fns) if (idx > f.open && idx < f.close) return f;
  return null;
}

/** True when the path is a test file or a test-support directory. */
function isTestPath(rel) {
  return /(?:^|\/)(?:__tests__|__mocks__|__fixtures__|tests?|e2e)\//.test(rel) || /\.(?:test|spec)\.[cm]?[jt]sx?$/.test(rel);
}

/**
 * True when the SCRIPT is a witness or probe harness rather than deployed code. It applies to files under
 * scripts/ ONLY: a library or app file is deployed whatever it is called, so a name such as kmsHealthProbe.ts
 * or providerWitness.ts never excuses it (a "KMS health probe" is this module's own break scenario for SF-14).
 */
function isWitnessPath(rel) {
  if (!rel.startsWith('scripts/')) return false;
  return /^scripts\/(?:witness|witnesses|probe|probes)\//.test(rel) || /(?:^|\/)[^/]*(?:probe|witness)[^/]*\.[cm]?[jt]sx?$/i.test(rel);
}

const SOURCE_EXTS = ['.ts', '.tsx', '.mts', '.mjs', '.js', '.cjs'];

// =====================================================================================================
// 2. REPORTING AND PER-TREE FACTS
// =====================================================================================================

function report() {
  const lines = [];
  let bad = 0;
  let unknown = 0;
  return {
    ok(m) { lines.push(`ok: ${m}`); },
    bad(m) { bad++; lines.push(`VIOLATION: ${m}`); },
    state(m) { lines.push(`state: ${m}`); },
    ctx(m) { lines.push(`context: ${m}`); },
    unknown(m) { unknown++; lines.push(`INCONCLUSIVE: ${m}`); },
    inconclusive() { return unknown > 0; },
    violations() { return bad; },
    done() { return { ok: bad === 0 && unknown === 0, evidence: lines.slice() }; },
  };
}

const FACTS = new WeakMap();
const RAW_MEMO = new Map();
/** Answer of fn(raw) memoised by the file text: a full-text scan of the whole repository is paid once, not once per defeat. */
function memoRaw(raw, key, fn) {
  let m = RAW_MEMO.get(raw);
  if (!m) {
    m = new Map();
    RAW_MEMO.set(raw, m);
  }
  if (!m.has(key)) m.set(key, fn(raw));
  return m.get(key);
}
const rawHas = (raw, token) => memoRaw(raw, `has:${token}`, (r) => r.includes(token));
const LEX_CACHE = new Map();
/** lexCode, memoised by the comment-stripped text: the same file is read for the real tree and for every defeat of it. */
function lexCached(code) {
  let r = LEX_CACHE.get(code);
  if (!r) {
    r = lexCode(code);
    if (LEX_CACHE.size > 400) LEX_CACHE.delete(LEX_CACHE.keys().next().value);
    LEX_CACHE.set(code, r);
  }
  return r;
}

/** Per-tree memoised facts about one TS/JS file: raw, code (comment-stripped), bl (also string-blanked). */
function sourceFacts(tree, rel) {
  let m = FACTS.get(tree);
  if (!m) {
    m = new Map();
    FACTS.set(tree, m);
  }
  if (m.has(rel)) return m.get(rel);
  const raw = tree.read(rel);
  let f;
  if (raw === null) {
    f = { rel, missing: true };
  } else {
    const kind = tree.codeKind(rel);
    const code = tree.code(rel);
    const stripIssues = tree.codeIssues(rel);
    const lx = lexCached(code);
    f = { rel, missing: false, kind, raw, code, stripIssues, bl: lx.bl, spans: lx.spans, literalIssues: lx.issues };
  }
  m.set(rel, f);
  return f;
}

/** Facts for a TS/JS file this module needs, or null after recording WHY it cannot be established. */
function need(tree, rel, rep, opts = {}) {
  const f = sourceFacts(tree, rel);
  if (f.missing) {
    rep.unknown(`${rel} is missing, so the law cannot be established there`);
    return null;
  }
  if (f.kind !== 'ts' && f.kind !== 'js') {
    rep.unknown(`${rel} has no comment stripper (kind ${f.kind}); a scan would match comments`);
    return null;
  }
  if (f.stripIssues && f.stripIssues.length > 0) {
    rep.unknown(`${rel}:${f.stripIssues[0].line} the comment stripper left an unclosed ${f.stripIssues[0].kind}`);
    return null;
  }
  if (!opts.tolerateLiterals && f.literalIssues.length > 0) {
    rep.unknown(`${rel}:${f.literalIssues[0].line} the literal scanner left an unclosed ${f.literalIssues[0].kind}`);
    return null;
  }
  return f;
}

const loc = (f, idx) => `${f.rel}:${lineAt(f.bl, idx)}`;

/** Comment-stripped text of a non-TS file (yaml, Dockerfile, dotenv, sh), or null when no stripper exists. */
function strictCode(tree, rel, rep) {
  const raw = tree.read(rel);
  if (raw === null) {
    rep.unknown(`${rel} is missing, so the law cannot be established there`);
    return null;
  }
  if (tree.codeKind(rel) === 'none') {
    rep.unknown(`${rel} has no comment stripper; a scan would match comments`);
    return null;
  }
  const issues = tree.codeIssues(rel);
  if (issues && issues.length > 0) {
    rep.unknown(`${rel}:${issues[0].line} the comment stripper left an unclosed ${issues[0].kind}`);
    return null;
  }
  return tree.code(rel);
}

/** Sorted non-test source files under the given directories, never an empty scan. */
function sourceFilesUnder(tree, dirs, rep, { includeWitness = false } = {}) {
  const out = [];
  for (const d of dirs) {
    for (const rel of tree.list(d, { ext: SOURCE_EXTS })) {
      if (isTestPath(rel)) continue;
      if (!includeWitness && isWitnessPath(rel)) continue;
      out.push(rel);
    }
  }
  out.sort();
  if (out.length === 0) rep.unknown(`no source files were found under ${dirs.join(', ')} (a scan of nothing)`);
  return out;
}

// ---- condition and guard analysis (SF-19) ------------------------------------------------------------

/** Offsets [a, b) of the top-level operands of bl[a0, b0) split at `op` ('||' or '&&'); brackets are skipped. */
function splitRanges(bl, a0, b0, op) {
  const out = [];
  let d = 0;
  let from = a0;
  for (let i = a0; i < b0; i++) {
    const c = bl[i];
    if (c === '(' || c === '[' || c === '{') d++;
    else if (c === ')' || c === ']' || c === '}') d--;
    else if (d === 0 && c === op[0] && bl[i + 1] === op[1]) {
      out.push([from, i]);
      from = i + 2;
      i++;
    }
  }
  out.push([from, b0]);
  return out;
}

/** Shrink [a, b) past whitespace and past any parentheses that enclose the WHOLE range. */
function unwrapRange(bl, a, b) {
  let x = a;
  let y = b;
  for (;;) {
    while (x < y && /\s/.test(bl[x])) x++;
    while (y > x && /\s/.test(bl[y - 1])) y--;
    if (bl[x] === '(' && matchClose(bl, x) === y - 1) { x++; y--; continue; }
    return [x, y];
  }
}

/**
 * An if-condition as a disjunction of conjunctions of operand texts: [[operand, ...], ...]. && binds tighter
 * than ||, so this is the exact normal form of the top level; a parenthesised operand that itself contains
 * || or && stays ONE opaque operand (never guessed at).
 */
function conditionDnf(code, bl, a, b) {
  return splitRanges(bl, a, b, '||').map(([x, y]) => {
    const [x2, y2] = unwrapRange(bl, x, y);
    return splitRanges(bl, x2, y2, '&&').map(([p, q]) => {
      const [p2, q2] = unwrapRange(bl, p, q);
      return code.slice(p2, q2).trim();
    });
  });
}

/** Parenthesis depth at `to`, counting from `from` (a throw inside a call argument is not a statement). */
function parenDepthAt(bl, from, to) {
  let d = 0;
  for (let i = from; i < to; i++) {
    if (bl[i] === '(') d++;
    else if (bl[i] === ')') d = Math.max(0, d - 1);
  }
  return d;
}

/**
 * Index of a `throw` that RUNS whenever the body [from, to) runs: a statement of its own (it follows a
 * statement boundary, not a condition, an else or an operator), at block depth 0 and parenthesis depth 0
 * (so not inside a nested block or a closure that may never be called), with no return, break or continue
 * anywhere before it. -1 when there is none.
 */
function unconditionalThrow(bl, from, to) {
  const body = bl.slice(from, to);
  for (const m of body.matchAll(/\bthrow\b/g)) {
    const at = from + m.index;
    if (blockDepthAt(bl, from, at) !== 0 || parenDepthAt(bl, from, at) !== 0) continue;
    let k = at - 1;
    while (k >= from && /\s/.test(bl[k])) k--;
    const prev = k < from ? '' : bl[k];
    if (prev !== '' && prev !== ';' && prev !== '{' && prev !== '}') continue;
    if (/\b(?:return|break|continue)\b/.test(body.slice(0, m.index))) continue;
    return at;
  }
  return -1;
}

/** Index of a `return` that runs whenever the body [from, to) runs (a statement of its own at depth 0), or -1. */
function unconditionalReturn(bl, from, to) {
  const body = bl.slice(from, to);
  for (const m of body.matchAll(/\breturn\b/g)) {
    const at = from + m.index;
    if (blockDepthAt(bl, from, at) !== 0 || parenDepthAt(bl, from, at) !== 0) continue;
    let k = at - 1;
    while (k >= from && /\s/.test(bl[k])) k--;
    const prev = k < from ? '' : bl[k];
    if (prev === '' || prev === ';' || prev === '{' || prev === '}') return at;
  }
  return -1;
}

// ---- named functions of every shape (SF-13) ----------------------------------------------------------

const NOT_A_METHOD = new Set(['if', 'for', 'while', 'switch', 'catch', 'with', 'function', 'return', 'typeof', 'await', 'new', 'delete', 'void', 'throw', 'else', 'do', 'super', 'import', 'yield', 'in', 'of', 'instanceof']);

/** End of a concise arrow body that starts at k: the first terminator at depth 0 (;  ,  an unmatched closer, or an ASI line break). */
function conciseEnd(bl, k) {
  let d = 0;
  let last = '';
  for (let i = k; i < bl.length; i++) {
    const c = bl[i];
    if (c === '(' || c === '[' || c === '{') d++;
    else if (c === ')' || c === ']' || c === '}') {
      if (d === 0) return i;
      d--;
    } else if (d === 0 && (c === ';' || c === ',')) return i;
    else if (d === 0 && c === '\n' && last !== '') {
      let j = i + 1;
      while (j < bl.length && /\s/.test(bl[j])) j++;
      if (j >= bl.length || (!/[.?:&|+\-*/%=<>,([`]/.test(bl[j]) && !/[=(,?:&|+\-*/%<>.[]/.test(last))) return i;
    }
    if (!/\s/.test(c)) last = c;
  }
  return bl.length;
}

/**
 * Every NAMED function-like thing of a blanked file, nested ones included, in the shapes the older
 * functionsIn does not read: concise arrows (`const f = (x) => expr`, `x => expr`), function expressions
 * (`const f = function (...) {}`), object-literal and class methods (`load(x) {}`, `async load(x) {}`) and
 * property values (`load: (x) => ...`, `load: async function (x) {}`). Returns [{ name, start, open, close }].
 * Over-detection is the safe direction here: a spurious name only makes a call more suspect.
 */
function namedFunctionsAll(bl) {
  const found = [...functionsIn(bl).map((f) => ({ name: f.name, start: f.start, open: f.open, close: f.close }))];
  const seen = new Set(found.map((f) => `${f.name}@${f.open}`));
  const push = (name, start, open, close) => {
    const key = `${name}@${open}`;
    if (seen.has(key)) return;
    seen.add(key);
    found.push({ name, start, open, close });
  };
  const bodyAfterArrow = (arrowAt) => {
    let k = arrowAt + 2;
    while (k < bl.length && /\s/.test(bl[k])) k++;
    if (bl[k] === '{') {
      const e = matchClose(bl, k);
      return e < 0 ? null : { open: k, close: e };
    }
    return { open: k - 1, close: conciseEnd(bl, k) };
  };
  // const NAME = (params) => body | const NAME = x => body | const NAME = async ... (every body shape)
  for (const m of bl.matchAll(/(?:^|[\n;}])\s*(?:export\s+)?(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*(?::[^=\n]+)?=\s*(?:async\s*)?(?:<[^()]*?>\s*)?(\(|[A-Za-z_$][\w$]*\s*=>)/g)) {
    let arrowAt;
    if (m[2] === '(') {
      const p = m.index + m[0].length - 1;
      const pc = matchClose(bl, p);
      if (pc < 0) continue;
      arrowAt = bl.indexOf('=>', pc);
      if (arrowAt < 0 || /[;]/.test(bl.slice(pc, arrowAt))) continue;
    } else {
      arrowAt = m.index + m[0].length - 2;
    }
    const b = bodyAfterArrow(arrowAt);
    if (b) push(m[1], m.index, b.open, b.close);
  }
  // const NAME = function [name](...) { ... }
  for (const m of bl.matchAll(/(?:^|[\n;}])\s*(?:export\s+)?(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*(?::[^=\n]+)?=\s*(?:async\s+)?function\b[^(]*\(/g)) {
    const pc = matchClose(bl, m.index + m[0].length - 1);
    if (pc < 0) continue;
    const open = findBodyOpen(bl, pc);
    const close = open < 0 ? -1 : matchClose(bl, open);
    if (close > 0) push(m[1], m.index, open, close);
  }
  // property values: NAME: (params) => body | NAME: async function (...) { }
  for (const m of bl.matchAll(/(?:^|[{,\n])\s*([A-Za-z_$][\w$]*)\s*:\s*(?:async\s*)?(function\b[^(]*\(|\(|[A-Za-z_$][\w$]*\s*=>)/g)) {
    if (m[2].startsWith('function')) {
      const pc = matchClose(bl, m.index + m[0].length - 1);
      if (pc < 0) continue;
      const open = findBodyOpen(bl, pc);
      const close = open < 0 ? -1 : matchClose(bl, open);
      if (close > 0) push(m[1], m.index, open, close);
    } else if (m[2] === '(') {
      const pc = matchClose(bl, m.index + m[0].length - 1);
      if (pc < 0) continue;
      const arrowAt = bl.indexOf('=>', pc);
      if (arrowAt < 0 || /[;{}]/.test(bl.slice(pc, arrowAt))) continue;
      const b = bodyAfterArrow(arrowAt);
      if (b) push(m[1], m.index, b.open, b.close);
    } else {
      const b = bodyAfterArrow(m.index + m[0].length - 2);
      if (b) push(m[1], m.index, b.open, b.close);
    }
  }
  // methods: NAME(params) { ... } in an object literal or a class (a statement-position call is never followed by a block)
  for (const m of bl.matchAll(/(?:^|[{,;}\n])\s*(?:(?:public|private|protected|static|readonly|get|set)\s+)*(?:async\s+)?\*?\s*([A-Za-z_$][\w$]*)\s*(?:<[^()]*?>)?\s*\(/g)) {
    if (NOT_A_METHOD.has(m[1])) continue;
    const p = m.index + m[0].length - 1;
    const pc = matchClose(bl, p);
    if (pc < 0) continue;
    const open = findBodyOpen(bl, pc);
    if (open < 0 || /[;]|=>/.test(bl.slice(pc, open))) continue;
    const close = matchClose(bl, open);
    if (close > 0) push(m[1], m.index, open, close);
  }
  found.sort((a, b) => a.start - b.start);
  return found;
}

/** Local names a function is reachable by in a blanked file: `x as y` (import / export) and `const y = x`. */
function aliasesInBl(bl, name) {
  const out = new Set();
  for (const m of bl.matchAll(new RegExp(`\\b${esc(name)}\\s+as\\s+([A-Za-z_$][\\w$]*)`, 'g'))) out.add(m[1]);
  for (const m of bl.matchAll(new RegExp(`\\b(?:const|let|var)\\s+([A-Za-z_$][\\w$]*)\\s*(?::[^=\\n;]+)?=\\s*${esc(name)}\\s*(?=[;,)\\n]|$)`, 'g'))) out.add(m[1]);
  return [...out];
}

// ---- what is deployed: the import graph and the production wiring (SF-10, SF-15) ---------------------

/** Runtime import specifiers of a comment-stripped TS/JS text (type-only imports are not runtime edges). */
const SPEC_CACHE = new Map();
function importSpecs(code) {
  const hit = SPEC_CACHE.get(code);
  if (hit) return hit;
  const out = new Set();
  const take = (re, idx) => { for (const m of code.matchAll(re)) out.add(m[idx]); };
  take(/\b(?:import|export)\s+(?!type\b)[\w$*{}\s,]*?\s*from\s*(['"])([^'"\n]+)\1/g, 2);
  take(/\bimport\s*(['"])([^'"\n]+)\1/g, 2);
  take(/\bimport\s*\(\s*(['"])([^'"\n]+)\1\s*\)/g, 2);
  take(/\brequire\s*\(\s*(['"])([^'"\n]+)\1\s*\)/g, 2);
  const res = [...out];
  SPEC_CACHE.set(code, res);
  return res;
}

const RESOLVE_SUFFIXES = ['', '.ts', '.tsx', '.mts', '.js', '.mjs', '.cjs', '.jsx', '/index.ts', '/index.tsx', '/index.js', '/index.mjs'];

/** The repo-relative file an import specifier names, among `known`, or null (a package, or not a source file). */
function resolveImport(fromRel, spec, known) {
  let base;
  if (spec.startsWith('@/')) base = spec.slice(2);
  else if (spec.startsWith('./') || spec.startsWith('../')) base = path.posix.normalize(path.posix.join(path.posix.dirname(fromRel), spec));
  else return null;
  const stems = [base];
  if (/\.(?:js|mjs|cjs)$/.test(base)) stems.push(base.replace(/\.(?:js|mjs|cjs)$/, ''));
  for (const stem of stems) for (const suf of RESOLVE_SUFFIXES) if (known.has(stem + suf)) return stem + suf;
  return null;
}

const ENTRY_BASENAME = /^(?:route|page|layout|template|default|error|global-error|loading|not-found)\.[cm]?[jt]sx?$/;

/**
 * Predicate rel -> "this file is reachable from something that RUNS in production": a Next entry file under
 * app/ (route, page, layout, ...), root middleware or instrumentation, or a script that the production
 * compose file or its Dockerfile names - and everything those import, transitively. A library file that
 * nothing imports is dead code however well it calls things. Computed lazily, once per call.
 */
function deployedReach(tree, files, wired) {
  const known = new Set(files);
  for (const rel of ['middleware.ts', 'middleware.js', 'instrumentation.ts', 'instrumentation.js']) if (tree.read(rel) !== null) known.add(rel);
  const edges = (rel) => {
    const code = tree.code(rel);
    const out = [];
    if (code) for (const spec of importSpecs(code)) { const to = resolveImport(rel, spec, known); if (to) out.push(to); }
    return out;
  };
  const walk = (starts) => {
    const seen = new Set(starts);
    const queue = [...starts];
    while (queue.length) for (const to of edges(queue.pop())) if (!seen.has(to)) { seen.add(to); queue.push(to); }
    return seen;
  };
  let reached = null;
  const compute = () => {
    const roots = [];
    for (const rel of known) {
      const base = rel.slice(rel.lastIndexOf('/') + 1);
      if ((rel.startsWith('app/') && ENTRY_BASENAME.test(base)) || (rel.startsWith('scripts/') && wired(rel)) || /^(?:middleware|instrumentation)\.[cm]?[jt]s$/.test(rel)) roots.push(rel);
    }
    return walk(roots);
  };
  const reach = (rel) => {
    if (!reached) reached = compute();
    return reached.has(rel);
  };
  const closures = new Map();
  /** Every file `rel` imports, transitively (itself included): does a caller even know the module it claims to call? */
  reach.closure = (rel) => {
    if (!closures.has(rel)) closures.set(rel, walk([rel]));
    return closures.get(rel);
  };
  return reach;
}

// =====================================================================================================
// 3. THE FALSIFIERS, PART ONE: SF-10 stranded-intent door, SF-11 awaited replay loads, SF-12 KMS timeouts
// =====================================================================================================

const LANDING = 'lib/manuscript/source/encryptedLanding.ts';
const ARRIVALS = 'lib/manuscript/source/arrivals.ts';
const KEY_AUTHORITY = 'lib/manuscript/source/sourceKeyAuthority.ts';
const ENVELOPE = 'lib/manuscript/source/sourceEnvelope.ts';
const DISCARD = 'lib/manuscript/source/discardUnclaimedArrival.ts';
const SOURCE_DIR = 'lib/manuscript/source';
const DELETE_WORK = 'lib/writersStudio/deleteWork.ts';
const RELEASE_AUTHORITY = 'lib/writersStudio/releaseAuthority.ts';
const COMPOSE_PROD = 'docker-compose.production.yml';
const MEDIA_WORKER = 'scripts/run-media-worker.ts';

/** A defeat: realistic edit + the outcome it must produce (+ optional fragment the RED evidence must carry). */
const defeat = (name, kind, expect, apply, diesBecause) => ({ name, kind, expect, apply, ...(diesBecause ? { diesBecause } : {}) });

function aliasesOf(code, name) {
  const out = [];
  for (const m of code.matchAll(new RegExp(`\\b${esc(name)}\\s+as\\s+([A-Za-z_$][\\w$]*)`, 'g'))) out.push(m[1]);
  return out;
}

/**
 * Predicate over repo-relative script paths: is this script named by the PRODUCTION compose file or by a
 * Dockerfile it builds? A dev or staging compose, an override SAMPLE and a Dockerfile nothing builds deploy
 * nothing, so naming a script there wires nothing.
 */
function wiredChecker(tree) {
  const texts = [];
  if (tree.read(COMPOSE_PROD) !== null && tree.codeKind(COMPOSE_PROD) !== 'none') {
    const comp = tree.code(COMPOSE_PROD) ?? '';
    texts.push(comp);
    for (const m of comp.matchAll(/^\s*dockerfile:\s*["']?([^\s"'#]+)/gm)) {
      const rel = path.posix.normalize(m[1]);
      if (!rel.startsWith('..') && !rel.startsWith('/') && tree.read(rel) !== null && tree.codeKind(rel) !== 'none') texts.push(tree.code(rel) ?? '');
    }
  }
  return (rel) => texts.some((t) => t.includes(rel));
}

/**
 * Non-test callers of each named function. A file that DEFINES the function is not an outside caller of it.
 * A script caller counts only when the production compose or a Dockerfile it builds names that script, and
 * (when `reach` is given) any caller counts only when it is reachable from something that runs: otherwise it
 * is reported as unwired or unreachable and satisfies nothing.
 */
function findCallers(tree, files, names, rep, wired, reach = null) {
  const res = new Map(names.map((n) => [n, { defs: [], callers: [], unwired: [], unreachable: [], foreign: [] }]));
  for (const rel of files) {
    const raw = tree.read(rel);
    if (raw === null) continue;
    const hit = names.filter((n) => rawHas(raw, n));
    if (hit.length === 0) continue;
    const f = need(tree, rel, rep, { tolerateLiterals: true });
    if (!f) continue;
    for (const n of hit) {
      const r = res.get(n);
      if (new RegExp(`\\bfunction\\s+${esc(n)}\\b|\\b(?:const|let|var)\\s+${esc(n)}\\s*(?::[^=\\n]+)?=`).test(f.bl)) {
        r.defs.push(rel);
        continue;
      }
      let calls = 0;
      for (const a of [n, ...aliasesOf(f.code, n)]) calls += callSites(f.bl, a).length;
      if (calls === 0) continue;
      if (rel.startsWith('scripts/') && !wired(rel)) r.unwired.push(rel);
      else if (reach && !reach(rel)) r.unreachable.push(rel);
      else r.callers.push({ rel, calls });
    }
  }
  if (reach) {
    // a call of the same NAME is not a call of THIS function unless the caller reaches the defining module by imports
    for (const r of res.values()) {
      if (r.defs.length === 0) continue;
      r.foreign = r.callers.filter((c) => !r.defs.some((d) => reach.closure(c.rel).has(d))).map((c) => c.rel);
      r.callers = r.callers.filter((c) => !r.foreign.includes(c.rel));
    }
  }
  return res;
}

// ---- SF-10 -----------------------------------------------------------------------------------------

const SF10_FUNCS = ['inspectMemberIncompleteLandings', 'discardUnclaimedArrival'];
const INTENTS_TABLE = 'writer_source_landing_intents';
const NON_RECORDED_STATES = Object.freeze(['PENDING_BYTES', 'WRITING_BYTES', 'BYTES_VERIFIED']);
const BYTES_QUEUED = /\bvault_erasure_queue\b|\bdestroyVaultBytes\s*\(/;

/**
 * Does the WHERE clause of a DELETE reach EVERY non-recorded state? Either it spares exactly the recorded
 * state (state <> 'ARRIVAL_RECORDED', NOT IN of that one value) or it names all three. A sweep that deletes
 * only PENDING_BYTES strands WRITING_BYTES and BYTES_VERIFIED rows behind no door at all, and a negation
 * applied to any other state, or a positive narrowing next to the spare, is read as incomplete (the safe side).
 */
function coversAllNonRecorded(stmt) {
  for (const m of stmt.matchAll(/(?:<>|!=)\s*'([A-Z_]+)'/g)) if (m[1] !== 'ARRIVAL_RECORDED') return false;
  for (const m of stmt.matchAll(/\bNOT\s+IN\s*\(([^)]*)\)/gi)) {
    const items = m[1].split(',').map((s) => s.trim()).filter(Boolean);
    if (!(items.length === 1 && items[0] === "'ARRIVAL_RECORDED'")) return false;
  }
  const named = NON_RECORDED_STATES.filter((s) => stmt.includes(`'${s}'`));
  const spares = /(?:<>|!=)\s*'ARRIVAL_RECORDED'|\bNOT\s+IN\s*\(\s*'ARRIVAL_RECORDED'\s*\)/i.test(stmt);
  if (spares) return named.length === 0 || named.length === NON_RECORDED_STATES.length;
  return named.length === NON_RECORDED_STATES.length && !/\bNOT\b|<>|!=/i.test(stmt);
}

/** The statement text of a DELETE found at idx of comment-stripped code (up to the closing backtick or semicolon). */
function statementAt(code, idx) {
  const tick = code.indexOf('`', idx);
  const semi = code.indexOf(';', idx);
  const ends = [tick, semi].filter((x) => x >= 0);
  return code.slice(idx, ends.length ? Math.min(...ends) : Math.min(code.length, idx + 600));
}

/**
 * DELETE statements on the intents table, with the function that CONTAINS each:
 *   kind 'sweep' - removes non-recorded rows by age: { rel, line, fn, complete (all three states), queuesBytes }
 *   kind 'door'  - removes ONE intent by its own id (a member gesture that needs no arrival row): { rel, line, fn, queuesBytes }
 * queuesBytes is read from the CONTAINING FUNCTION, not from anywhere in the file, and `fn` is the outermost
 * named function holding the statement (null at module level), so liveness can be bound to the function that
 * actually deletes.
 */
function intentDeletes(tree, files, rep) {
  const out = [];
  for (const rel of files) {
    const raw = tree.read(rel);
    if (raw === null || !rawHas(raw, INTENTS_TABLE)) continue;
    const f = need(tree, rel, rep, { tolerateLiterals: true });
    if (!f) continue;
    const fns = topLevelFunctions(f.bl);
    for (const m of f.code.matchAll(new RegExp(`\\bDELETE\\s+FROM\\s+${INTENTS_TABLE}\\b`, 'gi'))) {
      const stmt = statementAt(f.code, m.index);
      const host = enclosing(fns, m.index);
      const scope = host ? f.code.slice(host.open, host.close) : f.code;
      const base = { rel, line: lineAt(f.code, m.index), fn: host ? host.name : null, queuesBytes: BYTES_QUEUED.test(scope) };
      const timed = /\binterval\b|clock_timestamp\s*\(|\bnow\s*\(\s*\)|current_timestamp|expires_at/i.test(stmt);
      const keyedById = /\b(?:intent_)?id\s*=\s*(?:ANY\s*\()?\s*\$\d/i.test(stmt) && !timed;
      if (timed && /\b(?:PENDING_BYTES|WRITING_BYTES|BYTES_VERIFIED)\b|(?:<>|!=)\s*'ARRIVAL_RECORDED'|NOT\s+IN\s*\([^)]*ARRIVAL_RECORDED/i.test(stmt)) out.push({ ...base, kind: 'sweep', complete: coversAllNonRecorded(stmt) });
      else if (keyedById) out.push({ ...base, kind: 'door' });
    }
  }
  return out;
}

/**
 * Is the function `fnName` of file `rel` RUN by something deployed? It is when a reachable non-test file calls
 * it, or when another function of the same file that is itself run calls it, or (for a statement at module
 * level) when the file itself is reachable. A function nothing calls - however exported, however named - is
 * not run, and an unrelated exported function of the same file confers nothing on it.
 */
function functionIsRun(tree, files, rel, fnName, ctx, seen = new Set()) {
  const { rep, wired, reach } = ctx;
  if (fnName === null) return reach(rel);
  const key = `${rel}#${fnName}`;
  if (seen.has(key)) return false;
  seen.add(key);
  const outside = findCallers(tree, files, [fnName], rep, wired, reach).get(fnName);
  if (outside.callers.length > 0) return true;
  const f = sourceFacts(tree, rel);
  if (f.missing) return false;
  const fns = topLevelFunctions(f.bl);
  const me = fns.find((x) => x.name === fnName);
  if (!me) return false;
  for (const other of fns) {
    if (other === me) continue;
    if (callSites(f.bl, fnName, other.open, other.close).length > 0 && functionIsRun(tree, files, rel, other.name, ctx, seen)) return true;
  }
  return false;
}

function sf10Check(tree) {
  const rep = report();
  const files = sourceFilesUnder(tree, ['app', 'lib', 'scripts'], rep);
  if (rep.inconclusive()) return rep.done();
  const wired = wiredChecker(tree);
  const reach = deployedReach(tree, files, wired);
  const ctx = { rep, wired, reach };
  const found = findCallers(tree, files, SF10_FUNCS, rep, wired, reach);
  const deletes = intentDeletes(tree, files, rep);
  if (rep.inconclusive()) return rep.done();

  // a sweep or a door counts only when the FUNCTION that holds the DELETE is run, and only when it queues the bytes
  const live = (d) => functionIsRun(tree, files, d.rel, d.fn, ctx);
  const sweeps = deletes.filter((d) => d.kind === 'sweep');
  const doors = deletes.filter((d) => d.kind === 'door');
  const liveSweeps = sweeps.filter(live);
  const completeSweeps = liveSweeps.filter((s) => s.queuesBytes && s.complete);
  const liveDoors = doors.filter((d) => d.queuesBytes && live(d));

  const callersOk = SF10_FUNCS.every((n) => found.get(n).callers.length > 0);
  const doorsOk = callersOk && liveDoors.length > 0;
  const sweepOk = completeSweeps.length > 0;
  const lawHolds = doorsOk || sweepOk;

  for (const n of SF10_FUNCS) {
    const r = found.get(n);
    const where = r.defs.length ? `defined in ${r.defs.join(', ')}` : 'definition not found';
    if (r.callers.length > 0) rep.ok(`${n} has ${r.callers.length} reachable non-test caller file(s): ${r.callers.map((c) => c.rel).join(', ')}`);
    else {
      const extra = [
        r.unwired.length ? `${r.unwired.length} script caller(s) are named by no production compose file or Dockerfile` : '',
        r.unreachable.length ? `${r.unreachable.length} caller file(s) are imported by no route and no wired script` : '',
        r.foreign.length ? `${r.foreign.length} file(s) call a function of the same name without importing the module that defines it` : '',
      ].filter(Boolean).map((x) => `; ${x}`).join('');
      const line = `${n} has no reachable non-test caller in app, lib or scripts (${where}${extra})`;
      if (lawHolds) rep.state(`${line}; the other alternative of the law holds`);
      else rep.bad(line);
    }
  }
  if (liveDoors.length > 0) rep.ok(`a removal door reaches an intent by its own id and queues the stored bytes: ${liveDoors.map((s) => `${s.rel}:${s.line}`).join(', ')}`);
  else {
    const why = doors.length === 0
      ? 'no statement deletes one intent by its own id, so an intent with no arrival row (PENDING_BYTES, WRITING_BYTES, BYTES_VERIFIED) is outside every door'
      : doors.some((d) => !d.queuesBytes) && !doors.some((d) => live(d)) ? 'such a door exists but nothing runs it and it does not queue the stored bytes' : doors.some((d) => d.queuesBytes) ? 'such a door exists but nothing runs it' : 'such a door exists but it does not queue the stored bytes for erasure';
    const line = `no door removes an intent by its own id (${why})`;
    if (lawHolds) rep.state(`${line}; the other alternative of the law holds`);
    else rep.bad(line);
  }
  if (completeSweeps.length > 0) rep.ok(`an expiry sweep covering every non-recorded state is implemented, run and queues the stored bytes: ${completeSweeps.map((s) => `${s.rel}:${s.line}`).join(', ')}`);
  else {
    const why = sweeps.length === 0
      ? 'no statement deletes non-recorded rows of the intents table by age'
      : liveSweeps.length === 0
        ? `${sweeps.length} such statement(s) exist but the function holding the DELETE is run by nothing`
        : liveSweeps.some((s) => s.queuesBytes) ? `${liveSweeps.length} such sweep(s) run but none covers all three non-recorded states` : `${liveSweeps.length} such sweep(s) run but none queues the stored bytes for erasure`;
    const line = `no expiry sweep for non-recorded intents is implemented (${why})`;
    if (lawHolds) rep.state(`${line}; the other alternative of the law holds`);
    else rep.bad(line);
  }

  // context, not verdict: why callers alone would not be the whole answer
  const df = sourceFacts(tree, DISCARD);
  if (!df.missing && df.code) {
    const refs = [...df.code.matchAll(new RegExp(`\\bFROM\\s+${INTENTS_TABLE}\\b`, 'g'))];
    const byArrival = refs.length > 0 && refs.every((m) => /\barrival_id\b/.test(df.code.slice(m.index, m.index + 160)));
    if (byArrival) rep.ctx(`${DISCARD} reaches an intent only through its arrival_id, so an intent with no arrival row (the three non-recorded states) is outside the discard door; callers of it alone do not satisfy the law`);
  }
  const mig = 'database/migrations/20261022000002_writer_source_arrival_retention_index.sql';
  if (tree.read(mig) !== null && /24-hour/.test(tree.read(mig)) && !/24-hour/.test(tree.code(mig) ?? '')) rep.ctx(`${mig} describes a 24-hour retention sweep in a SQL comment only; a comment implements nothing`);
  rep.ctx('scripts count only when production compose or its Dockerfile names them; lib and app files only when a route or wired script imports them; a sweep or door only when its own function is called');
  return rep.done();
}

const SF10_ROUTE = 'app/api/writers-studio/sources/incomplete/route.ts';
const SF10_INTENT_DOOR = 'lib/manuscript/source/discardIncompleteLanding.ts';
const SF10_DOOR_IMPORT = "import { discardIncompleteLanding } from '@/lib/manuscript/source/discardIncompleteLanding';\n";
const SF10_DOOR_BRANCH = "  const { intentId } = (await request.clone().json()) as { intentId?: string };\n  if (intentId) return NextResponse.json({ ok: await discardIncompleteLanding(intentId, memberId) });\n";
const sf10Route = (inspectBody, discardBody, { door = false } = {}) => `import { NextRequest, NextResponse } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { inspectMemberIncompleteLandings } from '@/lib/manuscript/source/encryptedLanding';
import { discardUnclaimedArrival } from '@/lib/manuscript/source/discardUnclaimedArrival';
${door ? SF10_DOOR_IMPORT : ''}
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const memberId = await getMemberIdFromRequest(request);
  if (!memberId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  ${inspectBody}
}

export async function DELETE(request: NextRequest) {
  const memberId = await getMemberIdFromRequest(request);
  if (!memberId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
${door ? SF10_DOOR_BRANCH : ''}  const { arrivalId } = (await request.json()) as { arrivalId: string };
  ${discardBody}
}
`;
/** A member door that removes ONE unfinished upload by its own intent id (it has no arrival row yet). */
const sf10IntentDoor = ({ queueBytes = true } = {}) => `import { transaction } from '@/lib/db/postgres';

/** Discard one unfinished upload by its intent id; an intent that never reached an arrival has no other door. */
export async function discardIncompleteLanding(intentId: string, memberId: string): Promise<boolean> {
  return transaction(async (tx) => {
    const gone = await tx.query<{ artifact_ref: string }>(
      \`DELETE FROM writer_source_landing_intents
        WHERE id = $1 AND member_id = $2 AND state <> 'ARRIVAL_RECORDED'
        RETURNING artifact_ref\`,
      [intentId, memberId],
    );
${queueBytes ? `    for (const row of gone.rows) {
      await tx.query('INSERT INTO vault_erasure_queue (artifact_ref) VALUES ($1)', [row.artifact_ref]);
    }
` : ''}    return gone.rows.length === 1;
  });
}
`;
const SF10_EXPIRE = 'lib/manuscript/source/expireIncompleteLandings.ts';
const SF10_STATES = Object.freeze({
  spare: "state <> 'ARRIVAL_RECORDED'",
  list: "state IN ('PENDING_BYTES', 'WRITING_BYTES', 'BYTES_VERIFIED')",
  pending: "state = 'PENDING_BYTES'",
});
const sf10Expire = (queueBytes, { timed = true, name = 'expireIncompleteLandings', states = 'spare', exported = true, wrapper = null } = {}) => `import { transaction } from '@/lib/db/postgres';

const MAX_AGE_HOURS = 24;

/** Expire landing intents that never reached ARRIVAL_RECORDED${queueBytes ? ' and queue their ciphertext for erasure' : ''}. */
${exported ? 'export ' : ''}async function ${name}(): Promise<number> {
  return transaction(async (tx) => {
    const expired = await tx.query<{ artifact_ref: string }>(
      \`DELETE FROM writer_source_landing_intents
        WHERE ${SF10_STATES[states]}${timed ? `
          AND modified_at < clock_timestamp() - ($1::int * interval '1 hour')` : ''}
        RETURNING artifact_ref\`,
      ${timed ? '[MAX_AGE_HOURS]' : '[]'},
    );
${queueBytes ? `    for (const row of expired.rows) {
      await tx.query('INSERT INTO vault_erasure_queue (artifact_ref) VALUES ($1)', [row.artifact_ref]);
    }
` : ''}    return expired.rows.length;
  });
}
${wrapper ? `\nexport async function ${wrapper}(): Promise<number> {\n  return ${name}();\n}\n` : ''}`;
const wireExpiry = (t, name = 'expireIncompleteLandings', file = 'expireIncompleteLandings') => t
  .replace(MEDIA_WORKER, "import { sweepVaultErasureQueue } from '../lib/manuscript/source/eraseManuscript';", `import { sweepVaultErasureQueue } from '../lib/manuscript/source/eraseManuscript';\nimport { ${name} } from '../lib/manuscript/source/${file}';`)
  .replace(MEDIA_WORKER, '    const { destroyed, remaining } = await sweepVaultErasureQueue();', `    await ${name}();\n    const { destroyed, remaining } = await sweepVaultErasureQueue();`);
const SF10_BOTH_CALLS = (rel) => `import { inspectMemberIncompleteLandings } from '${rel}/encryptedLanding';\nimport { discardUnclaimedArrival } from '${rel}/discardUnclaimedArrival';\nexport async function run(m: string, a: string) { await inspectMemberIncompleteLandings(m); return discardUnclaimedArrival(a, m); }\n`;
const OVERRIDE_SAMPLE = 'docker-compose.production.override.sample.yml';
const SF10_OPS_SCRIPT = (name) => `import { ${name} } from '../../lib/manuscript/source/expireIncompleteLandings';\nawait ${name}();\n`;
const sampleService = (script) => (t) => t.edit(OVERRIDE_SAMPLE, (s) => `${s.replace(/\s*$/, '')}\n  maia-ops-sweeper:\n    image: maia-sovereign:prod\n    command: ["npx", "tsx", "${script}"]\n`);
const withDoorAndRoute = (t, inspectBody, discardBody) => t.add(SF10_INTENT_DOOR, sf10IntentDoor()).add(SF10_ROUTE, sf10Route(inspectBody, discardBody, { door: true }));

const SF10 = {
  id: 'SF-10',
  title: 'Stranded-intent door',
  law: 'Every held row can be removed from a deployed path: either inspectMemberIncompleteLandings and discardUnclaimedArrival are called from deployed code AND a door removes an intent by its own id, or a run expiry sweep covers every non-recorded state and queues the stored bytes.',
  obligations: ['WSI-20', 'WSI-21', 'FILL-1b'],
  claims: ['C17'],
  kind: 'law',
  expectedToday: 'RED',
  whyExpected: 'Read from the code: both functions are exported and neither has a caller in app, lib or scripts outside tests (inspectMemberIncompleteLandings has no caller anywhere; discardUnclaimedArrival is called only from test files and named in one doc comment of arrivals.ts). The 24-hour sweep is a SQL comment on an index, and no statement deletes anything from the intents table. The structural gap behind it is part of the law, not a footnote: discardUnclaimedArrival keys on the arrival row, so an intent with no arrival row (PENDING_BYTES, WRITING_BYTES, BYTES_VERIFIED) is outside its reach even once it has a caller, so callers of the two functions alone never satisfy WSI-20 (everything held for a member is removable) or plan D3 (list with discard, plus a bounded sweep): the door alternative also needs a deployed door that removes an intent by its own id. What counts as deployed is stated, not assumed: a script counts only when the production compose file or a Dockerfile it builds names it; a lib or app file counts only when a route, middleware or wired script imports it (transitively); and a sweep or door counts only when the FUNCTION holding the DELETE is called by such code (an unrelated exported function in the same file confers nothing). A sweep must cover all three non-recorded states and queue the ciphertext it strands. Reachability is by static import, so a dynamic dispatch is not seen.',
  rulingPending: 'D3',
  check: sf10Check,
  defeats: [
    defeat('FIX: a member route lists unfinished uploads (GET) and discards one (DELETE, by arrival id or by intent id), calling both functions and a door that removes an intent by its own id', 'fix', 'GREEN',
      (t) => withDoorAndRoute(t, 'return NextResponse.json({ incomplete: await inspectMemberIncompleteLandings(memberId) });', 'return NextResponse.json(await discardUnclaimedArrival(arrivalId, memberId));')),
    defeat('FIX: the route imports both functions under local names and calls them by those names, plus the intent-id door', 'fix', 'GREEN',
      (t) => t.add(SF10_INTENT_DOOR, sf10IntentDoor()).add(SF10_ROUTE, sf10Route('return NextResponse.json({ incomplete: await listIncomplete(memberId) });', 'return NextResponse.json(await discardIncomplete(arrivalId, memberId));', { door: true })
        .replace('import { inspectMemberIncompleteLandings }', 'import { inspectMemberIncompleteLandings as listIncomplete }')
        .replace('import { discardUnclaimedArrival }', 'import { discardUnclaimedArrival as discardIncomplete }'))),
    defeat('FIX: add an age-based expiry sweep over every non-recorded state that queues the ciphertext, and run it from the media worker loop', 'fix', 'GREEN',
      (t) => wireExpiry(t.add(SF10_EXPIRE, sf10Expire(true)))),
    defeat('FIX: the sweep names the three non-recorded states in an IN list instead of sparing the recorded one', 'fix', 'GREEN',
      (t) => wireExpiry(t.add(SF10_EXPIRE, sf10Expire(true, { states: 'list' })))),
    defeat('FIX: the sweep is a non-exported function that an exported wrapper calls, and the media worker calls the wrapper', 'fix', 'GREEN',
      (t) => wireExpiry(t.add(SF10_EXPIRE, sf10Expire(true, { exported: false, wrapper: 'runIncompleteRetention' })), 'runIncompleteRetention')),
    defeat('WRONG FIX: the route calls both functions, but an intent with no arrival row is still outside every door (the arrival door alone)', 'fix', 'RED',
      (t) => t.add(SF10_ROUTE, sf10Route('return NextResponse.json({ incomplete: await inspectMemberIncompleteLandings(memberId) });', 'return NextResponse.json(await discardUnclaimedArrival(arrivalId, memberId));')), 'no door removes an intent by its own id'),
    defeat('WRONG FIX: the intent-id door exists and is wired, but it deletes the row and never queues the stored bytes', 'fix', 'RED',
      (t) => t.add(SF10_INTENT_DOOR, sf10IntentDoor({ queueBytes: false })).add(SF10_ROUTE, sf10Route('return NextResponse.json({ incomplete: await inspectMemberIncompleteLandings(memberId) });', 'return NextResponse.json(await discardUnclaimedArrival(arrivalId, memberId));', { door: true })), 'does not queue the stored bytes'),
    defeat('WRONG FIX: the route calls inspect only; nothing calls the discard function', 'fix', 'RED',
      (t) => t.add(SF10_ROUTE, sf10Route('return NextResponse.json({ incomplete: await inspectMemberIncompleteLandings(memberId) });', 'return NextResponse.json({ error: \'not implemented\' }, { status: 501 });').replace("import { discardUnclaimedArrival } from '@/lib/manuscript/source/discardUnclaimedArrival';\n", '')), 'discardUnclaimedArrival has no reachable non-test caller'),
    defeat('WRONG FIX: the route imports both functions and calls neither', 'fix', 'RED',
      (t) => t.add(SF10_ROUTE, sf10Route('return NextResponse.json({ incomplete: [] });', 'return NextResponse.json({ ok: true });')), 'has no reachable non-test caller'),
    defeat('WRONG FIX: SUBTLE the calls exist only inside comments of the new route', 'fix', 'RED',
      (t) => t.add(SF10_ROUTE, sf10Route('/* inspectMemberIncompleteLandings(memberId) is wired next */ return NextResponse.json({ incomplete: [] });', '// await discardUnclaimedArrival(arrivalId, memberId);\n  return NextResponse.json({ ok: true });')), 'has no reachable non-test caller'),
    defeat('WRONG FIX: the callers are added under __tests__, which is not deployed', 'fix', 'RED',
      (t) => t.add('app/api/writers-studio/sources/incomplete/__tests__/route.test.ts', sf10Route('return NextResponse.json({ incomplete: await inspectMemberIncompleteLandings(memberId) });', 'return NextResponse.json(await discardUnclaimedArrival(arrivalId, memberId));')), 'has no reachable non-test caller'),
    defeat('WRONG FIX: the callers are added to a witness script, which is a harness and not deployed code', 'fix', 'RED',
      (t) => t.add('scripts/witness/ws-incomplete-landing-witness.ts', SF10_BOTH_CALLS('../../lib/manuscript/source')), 'has no reachable non-test caller'),
    defeat('WRONG FIX: the callers are a script that no compose file or Dockerfile runs', 'fix', 'RED',
      (t) => t.add('scripts/ops/clear-incomplete-landings.ts', SF10_BOTH_CALLS('../../lib/manuscript/source')), 'script caller'),
    defeat('WRONG FIX: the callers are a script named only in the override SAMPLE compose, which deploys nothing', 'fix', 'RED',
      (t) => sampleService('scripts/ops/clear-incomplete-landings.ts')(t.add('scripts/ops/clear-incomplete-landings.ts', SF10_BOTH_CALLS('../../lib/manuscript/source'))), 'script caller'),
    defeat('WRONG FIX: the callers sit in a helper under __tests__ whose name has no .test. in it', 'fix', 'RED',
      (t) => t.add('app/api/writers-studio/sources/incomplete/__tests__/helpers.ts', SF10_BOTH_CALLS('@/lib/manuscript/source')), 'has no reachable non-test caller'),
    defeat('WRONG FIX: the callers sit in a lib file with a witness-like name that nothing imports (a name excuses nothing, and neither does dead code)', 'fix', 'RED',
      (t) => t.add('lib/manuscript/source/incompleteLandingWitness.ts', SF10_BOTH_CALLS('.')), 'imported by no route'),
    defeat('WRONG FIX: the callers sit in a lib facade that nothing imports, so no route or worker ever reaches them', 'fix', 'RED',
      (t) => t.add('lib/manuscript/source/incompleteLandingFacade.ts', SF10_BOTH_CALLS('.')), 'imported by no route'),
    defeat('WRONG FIX: a "sweep" deletes every non-recorded intent with no age limit, which would also kill uploads in flight', 'fix', 'RED',
      (t) => wireExpiry(t.add('lib/manuscript/source/purgeIncompleteLandings.ts', sf10Expire(true, { timed: false, name: 'purgeIncompleteLandings' })), 'purgeIncompleteLandings', 'purgeIncompleteLandings'), 'no statement deletes non-recorded rows'),
    defeat('WRONG FIX: a sweep file is added but nothing runs it', 'fix', 'RED',
      (t) => t.add(SF10_EXPIRE, sf10Expire(true)), 'run by nothing'),
    defeat('WRONG FIX: the sweep is run but deletes only the rows and never queues the stored bytes', 'fix', 'RED',
      (t) => wireExpiry(t.add(SF10_EXPIRE, sf10Expire(false))), 'none queues the stored bytes'),
    defeat('WRONG FIX: the wired sweep deletes only PENDING_BYTES, leaving WRITING_BYTES and BYTES_VERIFIED rows stranded', 'fix', 'RED',
      (t) => wireExpiry(t.add(SF10_EXPIRE, sf10Expire(true, { states: 'pending' }))), 'none covers all three non-recorded states'),
    defeat('WRONG FIX: SUBTLE the DELETE sits in a function nothing calls, while an unrelated exported function of the same file is called by a route', 'fix', 'RED',
      (t) => t.add('lib/manuscript/source/intentRetention.ts', `${sf10Expire(true, { exported: false, name: 'neverCalledSweep' })}\nexport function intentRetentionHours(): number {\n  return 24;\n}\n`)
        .add('app/api/writers-studio/sources/retention/route.ts', "import { intentRetentionHours } from '@/lib/manuscript/source/intentRetention';\nexport async function GET() {\n  return Response.json({ hours: intentRetentionHours() });\n}\n"), 'run by nothing'),
    defeat('WRONG FIX: the sweep is called only by a script that is named in the override sample compose, which deploys nothing', 'fix', 'RED',
      (t) => sampleService('scripts/ops/expire-incomplete.ts')(t.add(SF10_EXPIRE, sf10Expire(true)).add('scripts/ops/expire-incomplete.ts', SF10_OPS_SCRIPT('expireIncompleteLandings'))), 'run by nothing'),
  ],
  decoys: [
    defeat('DECOY: a doc comment elsewhere also names both functions (the real tree has one already)', 'fix', 'RED',
      (t) => t.edit(ARRIVALS, (s) => `${s}\n// inspectMemberIncompleteLandings() and discardUnclaimedArrival() are the doors; see WSI-20\n`)),
  ],
};

// ---- SF-11 -----------------------------------------------------------------------------------------

/** Every call of loadRecordedArrival in a lexed file: { idx, line, awaited, isReturn, inTry, fn }. */
function loadRecordedCalls(f) {
  const tries = [];
  for (const m of f.bl.matchAll(/\btry\s*\{/g)) {
    const open = m.index + m[0].length - 1;
    const close = matchClose(f.bl, open);
    if (close > 0) tries.push({ open, close });
  }
  const fns = topLevelFunctions(f.bl);
  return callSitesDetailed(f.bl, 'loadRecordedArrival').map(({ idx, start }) => {
    const tail = f.bl.slice(Math.max(0, start - 48), start);
    return {
      idx,
      line: lineAt(f.bl, idx),
      awaited: /\bawait\s*(?:\(\s*)*(?:Promise\s*\.\s*(?:all|allSettled|race|any)\s*\(\s*(?:\[\s*)?)?$/.test(tail),
      isReturn: /\breturn\s*(?:\(\s*)*(?:await\s*(?:\(\s*)*)?$/.test(tail),
      inTry: tries.some((t) => idx > t.open && idx < t.close),
      fn: enclosing(fns, idx)?.name ?? '<module>',
    };
  });
}

function sf11Check(tree) {
  const rep = report();
  const f = need(tree, LANDING, rep);
  if (!f) return rep.done();
  const calls = loadRecordedCalls(f);
  const inTry = calls.filter((c) => c.inTry);
  if (inTry.length === 0) {
    rep.unknown(`${LANDING} has no call of loadRecordedArrival inside a try block, so the law cannot be established (a rename would otherwise read as a pass)`);
    return rep.done();
  }
  const bad = inTry.filter((c) => !c.awaited);
  for (const c of bad) rep.bad(`${LANDING}:${c.line} unawaited ${c.isReturn ? 'return' : 'call'} of loadRecordedArrival inside a try block (in ${c.fn}); a rejection escapes the catch wrapper`);
  if (bad.length === 0) rep.ok(`${inTry.length} of ${inTry.length} calls of loadRecordedArrival inside a try block are awaited`);
  else rep.state(`${bad.length} of ${inTry.length} calls inside a try block are unawaited, across ${new Set(bad.map((c) => c.fn)).size} function(s)`);
  const outside = calls.length - inTry.length;
  if (outside > 0) rep.ctx(`${outside} further call(s) of loadRecordedArrival sit outside any try block and are not part of this law`);
  const wrapped = [...f.code.matchAll(/\bcatch\b[^{]*\{[^}]*?\bnew\s+SourceLandingIncompleteError\s*\(/g)].length;
  rep.ctx(`${wrapped} catch block(s) wrap errors in SourceLandingIncompleteError, so an escaped rejection skips that wrapper`);
  return rep.done();
}

const RLA = 'return loadRecordedArrival(';
const SF11 = {
  id: 'SF-11',
  title: 'Awaited replay loads',
  law: 'Every return of loadRecordedArrival inside the landing try block is awaited.',
  obligations: ['WSI-12'],
  claims: ['C12'],
  kind: 'law',
  expectedToday: 'RED',
  whyExpected: 'Confirmed by the count on comment-stripped code: ten unawaited returns of loadRecordedArrival inside the try of recordEncryptedArtifactArrival (five) and recordEncryptedLegacyReplacementArrival (five). The helper reads the database, so a failing read on a replay rejects a promise that is returned without await; the rejection leaves the try and the generic 500 replaces the wrapped, member-safe error. The one awaited return in each function is commitEncryptedArrival, which is a different callee.',
  rulingPending: null,
  check: sf11Check,
  defeats: [
    defeat('FIX: await every returned loadRecordedArrival', 'fix', 'GREEN', (t) => t.replace(LANDING, RLA, 'return await loadRecordedArrival(')),
    defeat('FIX: parenthesised form return (await loadRecordedArrival(...)) also counts as awaited', 'fix', 'GREEN', (t) => t.replace(LANDING, RLA, 'return (await loadRecordedArrival(').replace(LANDING, /return \(await loadRecordedArrival\((\w+)\);/g, 'return (await loadRecordedArrival($1));')),
    defeat('WRONG FIX: SUBTLE await written only inside a comment on every return', 'fix', 'RED', (t) => t.replace(LANDING, RLA, 'return /* await */ loadRecordedArrival('), 'unawaited return'),
    defeat('WRONG FIX: SUBTLE await only in a trailing comment on every return', 'fix', 'RED', (t) => t.replace(LANDING, /return loadRecordedArrival\((\w+)\);/g, 'return loadRecordedArrival($1); // await'), 'unawaited return'),
    defeat('WRONG FIX: SUBTLE the word await appears only in a string next to every return', 'fix', 'RED', (t) => t.replace(LANDING, /return loadRecordedArrival\((\w+)\);/g, "return loadRecordedArrival($1) ?? 'await';"), 'unawaited return'),
    defeat('WRONG FIX: only recordEncryptedArtifactArrival is repaired; the legacy-replacement function keeps five', 'fix', 'RED',
      (t) => t.edit(LANDING, (s) => { const cut = s.indexOf('export async function recordEncryptedLegacyReplacementArrival'); return cut < 0 ? s : s.slice(0, cut).split(RLA).join('return await loadRecordedArrival(') + s.slice(cut); }), 'recordEncryptedLegacyReplacementArrival'),
    defeat('WRONG FIX: chained .then(...) is still a returned promise that nothing awaits', 'fix', 'RED', (t) => t.replace(LANDING, /return loadRecordedArrival\((\w+)\);/g, 'return loadRecordedArrival($1).then((r) => r);'), 'unawaited return'),
    defeat('WRONG FIX: one await added elsewhere in the file does not touch the ten returns', 'fix', 'RED', (t) => t.edit(LANDING, (s) => `${s}\nexport async function awaitedElsewhere(i: EncryptedLandingRow) { return await loadRecordedArrival(i); }\n`), 'unawaited return'),
  ],
  decoys: [
    defeat('DECOY: a comment above the first return says it is awaited (the real tree stays RED)', 'fix', 'RED', (t) => t.edit(LANDING, (s) => s.replace(RLA, `/* await this */ ${RLA}`)), 'unawaited return'),
  ],
};

// ---- SF-12 -----------------------------------------------------------------------------------------

/** Value expression of property `key` in an object literal body (bl text), or null. Stops at a top-level comma. */
function propertyValue(bl, key) {
  const m = new RegExp(`(?<![\\w$.])${esc(key)}\\s*:`).exec(bl);
  if (!m) return null;
  let i = m.index + m[0].length;
  const start = i;
  let d = 0;
  for (; i < bl.length; i++) {
    const c = bl[i];
    if (c === '(' || c === '{' || c === '[') d++;
    else if (c === ')' || c === '}' || c === ']') { if (d === 0) break; d--; }
    else if (c === ',' && d === 0) break;
  }
  return bl.slice(start, i).trim();
}

/**
 * Is this value a timeout that actually bounds the wait? A number must parse (underscores, decimals, exponents,
 * hex) and be finite and above zero: 0, 0.0, 0e0, Infinity and NaN bound nothing. An expression or a named
 * constant this check cannot evaluate is accepted (it cannot be proved zero from the text).
 */
function isBoundedTimeout(v0) {
  const v = v0.replace(/(?<=\d)_(?=\d)/g, '').trim();
  if (v.length === 0) return false;
  if (/^[+-]?(?:undefined|null|false|NaN|Infinity)$|^Number\s*\.\s*(?:POSITIVE_INFINITY|NEGATIVE_INFINITY|NaN)$/.test(v)) return false;
  if (/^[+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?$/i.test(v) || /^0x[0-9a-f]+$/i.test(v)) {
    const n = Number(v);
    return Number.isFinite(n) && n > 0;
  }
  return true;
}

/** Does `text` define key with a bounded value (shorthand counts when the name is an identifier)? */
function hasNonzero(text, key) {
  const v = propertyValue(text, key);
  if (v !== null) return isBoundedTimeout(v);
  return new RegExp(`(?<![\\w$.])${esc(key)}(?=\\s*[,}])`).test(text);
}

/**
 * KMS client construction sites of one lexed file: [{ idx, line, kind, text }].
 *   literal      the configuration is an object literal (written in place, or a const of this file that holds one)
 *   passthrough  the configuration is the parameter of the factory arrow inside kmsClient(): it is judged where
 *                the factory is CALLED, so it counts as no site of its own (only inside kmsClient of the key authority)
 *   unresolved   anything else (a call result, an import, a parameter elsewhere): this check cannot read it
 */
function kmsClientSites(f, isKeyAuthority) {
  const out = [];
  const fns = topLevelFunctions(f.bl);
  const home = isKeyAuthority ? fns.find((x) => x.name === 'kmsClient') : null;
  const consider = (idx, name, newOnly) => {
    const p = callParens(f.bl, idx, name);
    if (!p) return;
    const inner = f.bl.slice(p.open + 1, p.close).trim();
    const line = lineAt(f.bl, idx);
    if (inner.startsWith('{')) { out.push({ idx, line, kind: 'literal', text: f.bl.slice(p.open + 1, p.close) }); return; }
    if (/^[A-Za-z_$][\w$]*$/.test(inner)) {
      if (home && idx > home.open && idx < home.close && new RegExp(`\\(\\s*${esc(inner)}\\s*(?::[^),]+)?\\)\\s*=>`).test(f.bl.slice(home.open, idx))) { out.push({ idx, line, kind: 'passthrough', text: inner }); return; }
      const decl = declaredValue(f, inner);
      if (decl !== null && decl.trim().startsWith('{')) { out.push({ idx, line, kind: 'literal', text: decl }); return; }
    }
    out.push({ idx, line, kind: 'unresolved', text: inner });
    void newOnly;
  };
  if (home) for (const idx of callSites(f.bl, 'factory', home.open, home.close)) consider(idx, 'factory', false);
  for (const name of ['KMSClient', ...aliasesInBl(f.bl, 'KMSClient')]) for (const idx of callSites(f.bl, name, 0, f.bl.length, { newOnly: true })) consider(idx, name, true);
  out.sort((a, b) => a.idx - b.idx);
  return out;
}

function declaredValue(f, ident) {
  const m = new RegExp(`\\b(?:const|let)\\s+${esc(ident)}\\s*(?::[^=]+)?=`).exec(f.bl);
  if (!m) return null;
  let i = m.index + m[0].length;
  const start = i;
  let d = 0;
  for (; i < f.bl.length; i++) {
    const c = f.bl[i];
    if (c === '(' || c === '{' || c === '[') d++;
    else if (c === ')' || c === '}' || c === ']') d--;
    else if (c === ';' && d <= 0) break;
  }
  return f.bl.slice(start, i);
}

function sf12Check(tree) {
  const rep = report();
  const f = need(tree, KEY_AUTHORITY, rep);
  if (!f) return rep.done();
  const sites = kmsClientSites(f, true).map((x) => ({ ...x, f }));
  if (sites.filter((x) => x.kind !== 'passthrough').length === 0) {
    rep.unknown(`${KEY_AUTHORITY} has no KMS client construction with a configuration this check can read, so the law cannot be established`);
    return rep.done();
  }
  // every OTHER KMS client built in deployed code is held to the same law (a standby or region-check client is still a client)
  const files = sourceFilesUnder(tree, ['app', 'lib', 'scripts'], rep, { includeWitness: true });
  if (rep.inconclusive()) return rep.done();
  for (const rel of files) {
    if (rel === KEY_AUTHORITY) continue;
    const raw = tree.read(rel);
    if (raw === null || !rawHas(raw, 'KMSClient')) continue;
    const g = need(tree, rel, rep, { tolerateLiterals: true });
    if (!g) continue;
    for (const x of kmsClientSites(g, false)) sites.push({ ...x, f: g });
  }
  if (rep.inconclusive()) return rep.done();
  for (const s of sites) {
    if (s.kind === 'passthrough') continue;
    const where = `${s.f.rel}:${s.line}`;
    if (s.kind === 'unresolved') { rep.unknown(`${where} the KMS client configuration is not an object literal this check can read, so its timeouts cannot be established`); continue; }
    let handler = propertyValue(s.text, 'requestHandler');
    if (handler === null) {
      if (/\.\.\./.test(s.text)) rep.unknown(`${where} the KMS client configuration spreads another object, so a requestHandler may come from it and cannot be read here`);
      else rep.bad(`${where} the KMS client configuration has no requestHandler, so it sets no connection timeout and no request timeout`);
      continue;
    }
    if (/^[A-Za-z_$][\w$]*$/.test(handler)) {
      const decl = declaredValue(s.f, handler);
      if (decl === null) { rep.bad(`${where} requestHandler names an identifier that is not declared in the file`); continue; }
      handler = decl;
    }
    const ctor = /\bnew\s+([A-Za-z_$][\w$]*)\s*\(/.exec(handler);
    if (ctor && !new RegExp(`\\bimport\\b[^;]*\\b${esc(ctor[1])}\\b[^;]*\\bfrom\\b`).test(s.f.code) && !new RegExp(`\\bclass\\s+${esc(ctor[1])}\\b`).test(s.f.bl)) {
      rep.bad(`${where} requestHandler constructs a handler class that is not imported or declared in the file`);
      continue;
    }
    const conn = hasNonzero(handler, 'connectionTimeout');
    const req = hasNonzero(handler, 'requestTimeout') || hasNonzero(handler, 'socketTimeout');
    if (!conn) rep.bad(`${where} requestHandler carries no non-zero connection timeout`);
    if (!req) rep.bad(`${where} requestHandler carries no non-zero request timeout`);
    if (conn && req) rep.ok(`${where} the KMS client is built with explicit connection and request timeouts`);
  }
  const ma = /\bmaxAttempts\s*:\s*(\d+)/.exec(f.bl);
  if (ma) rep.ctx(`maxAttempts is ${ma[1]}: each retry repeats the wait, so an unbounded call is repeated ${ma[1]} times`);
  rep.ctx(`${sites.filter((x) => x.kind !== 'passthrough').length} KMS client construction site(s) were read across app, lib and scripts; the SDK default timeouts were not read (node_modules is not part of this check); the law asks for explicit values at every site`);
  return rep.done();
}

const KMS_CALL = '  kmsClientCache = factory({ region, maxAttempts: 3 });';
const CRYPTO_IMPORT = "import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';";
const withHandlerImport = (t) => t.replace(KEY_AUTHORITY, CRYPTO_IMPORT, `${CRYPTO_IMPORT}\nimport { NodeHttpHandler } from '@smithy/node-http-handler';`);
const withConfig = (t, extra) => t.replace(KEY_AUTHORITY, KMS_CALL, `  kmsClientCache = factory({\n    region,\n    maxAttempts: 3,\n${extra}\n  });`);
const SF12 = {
  id: 'SF-12',
  title: 'KMS client timeouts',
  law: 'The KMS client is constructed with explicit request and connection timeouts.',
  obligations: ['WSI-32', 'FILL-6b'],
  claims: ['C04'],
  kind: 'law',
  expectedToday: 'RED',
  whyExpected: 'Confirmed in the code: kmsClient() passes only region and maxAttempts to the factory, which builds new KMSClient(config). No requestHandler, no connectionTimeout, no requestTimeout, no endpoint and no credentials are set, so the wait is whatever the SDK default is, repeated up to three times. The repository has no in-repo idiom to copy (its two S3 clients under app/api/_backend set no timeouts either), so the fixes use the standard SDK v3 forms: a NodeHttpHandler instance or the equivalent options object. node_modules is absent in this lane, so the SDK default itself is not read. The law binds EVERY KMS client built in app, lib and scripts (only one exists today): a configuration held in a const of the file is read through it, a configuration this check cannot read as a literal (a call result, a spread) is INCONCLUSIVE, and a timeout of 0, 0.0, 0e0, Infinity or NaN bounds nothing.',
  rulingPending: 'D9',
  check: sf12Check,
  defeats: [
    defeat('FIX: requestHandler is a NodeHttpHandler carrying connectionTimeout and requestTimeout (handler imported)', 'fix', 'GREEN',
      (t) => withConfig(withHandlerImport(t), '    requestHandler: new NodeHttpHandler({ connectionTimeout: 3_000, requestTimeout: 10_000 }),')),
    defeat('FIX: requestHandler given as the SDK options object with both timeouts', 'fix', 'GREEN',
      (t) => withConfig(t, '    requestHandler: { connectionTimeout: 3_000, requestTimeout: 10_000 },')),
    defeat('FIX: the timeouts live in a named constant that the client configuration uses', 'fix', 'GREEN',
      (t) => withConfig(t.replace(KEY_AUTHORITY, 'const KEY_BYTES = 32;', 'const KMS_HTTP = { connectionTimeout: 3_000, requestTimeout: 10_000 };\nconst KEY_BYTES = 32;'), '    requestHandler: KMS_HTTP,')),
    defeat('WRONG FIX: only a request timeout is set; the connection can still hang', 'fix', 'RED',
      (t) => withConfig(t, '    requestHandler: { requestTimeout: 10_000 },'), 'no non-zero connection timeout'),
    defeat('WRONG FIX: both timeouts are zero, which disables them', 'fix', 'RED',
      (t) => withConfig(t, '    requestHandler: { connectionTimeout: 0, requestTimeout: 0 },'), 'no non-zero'),
    defeat('WRONG FIX: SUBTLE the timeouts exist only in a comment inside the configuration', 'fix', 'RED',
      (t) => t.replace(KEY_AUTHORITY, KMS_CALL, '  // requestHandler: new NodeHttpHandler({ connectionTimeout: 3_000, requestTimeout: 10_000 })\n  kmsClientCache = factory({ region, maxAttempts: 3 });'), 'no requestHandler'),
    defeat('WRONG FIX: SUBTLE a constant with both timeouts is declared but never passed to the client', 'fix', 'RED',
      (t) => t.replace(KEY_AUTHORITY, 'const KEY_BYTES = 32;', 'const KMS_HTTP = { connectionTimeout: 3_000, requestTimeout: 10_000 };\nconst KEY_BYTES = 32;'), 'no requestHandler'),
    defeat('WRONG FIX: the client uses a named constant that carries only the request timeout', 'fix', 'RED',
      (t) => withConfig(t.replace(KEY_AUTHORITY, 'const KEY_BYTES = 32;', 'const KMS_HTTP = { requestTimeout: 10_000 };\nconst KEY_BYTES = 32;'), '    requestHandler: KMS_HTTP,'), 'no non-zero connection timeout'),
    defeat('WRONG FIX: the client names a constant that is not declared anywhere in the file', 'fix', 'RED',
      (t) => withConfig(t, '    requestHandler: KMS_HTTP,'), 'not declared'),
    defeat('WRONG FIX: a NodeHttpHandler is used but never imported, so the file would not compile', 'fix', 'RED',
      (t) => withConfig(t, '    requestHandler: new NodeHttpHandler({ connectionTimeout: 3_000, requestTimeout: 10_000 }),'), 'not imported'),
    defeat('WRONG FIX: the main client gets timeouts but a second client is built elsewhere in the file without them', 'fix', 'RED',
      (t) => withConfig(t, '    requestHandler: { connectionTimeout: 3_000, requestTimeout: 10_000 },').edit(KEY_AUTHORITY, (s) => `${s}\nexport function standbyKmsClient(region: string): KMSClient {\n  return new KMSClient({ region });\n}\n`), 'has no requestHandler'),
    defeat('WRONG FIX: raising maxAttempts is not a timeout', 'fix', 'RED',
      (t) => t.replace(KEY_AUTHORITY, 'maxAttempts: 3', 'maxAttempts: 5'), 'no requestHandler'),
    defeat('FIX: the timeouts are written with an exponent and digit separators', 'fix', 'GREEN',
      (t) => withConfig(t, '    requestHandler: { connectionTimeout: 2.5e3, requestTimeout: 1_0000 },')),
    defeat('WRONG FIX: the timeouts are written as 0.0, which disables them just as 0 does', 'fix', 'RED',
      (t) => withConfig(t, '    requestHandler: { connectionTimeout: 0.0, requestTimeout: 0.0 },'), 'no non-zero'),
    defeat('WRONG FIX: the timeouts are Infinity, which bounds nothing', 'fix', 'RED',
      (t) => withConfig(t, '    requestHandler: { connectionTimeout: Infinity, requestTimeout: Infinity },'), 'no non-zero'),
    defeat('WRONG FIX: the main client is fixed but a standby client is built from a configuration variable with no timeouts', 'fix', 'RED',
      (t) => withConfig(t, '    requestHandler: { connectionTimeout: 3_000, requestTimeout: 10_000 },').edit(KEY_AUTHORITY, (s) => `${s}\nexport function standbyKmsClient(region: string): KMSClient {\n  const cfg = { region };\n  return new KMSClient(cfg);\n}\n`), 'has no requestHandler'),
    defeat('WRONG FIX: the main client is fixed but a second client is built in another library file with no timeouts', 'fix', 'RED',
      (t) => withConfig(t, '    requestHandler: { connectionTimeout: 3_000, requestTimeout: 10_000 },').add(`${SOURCE_DIR}/kmsRegionCheck.ts`, "import { KMSClient } from '@aws-sdk/client-kms';\n\nexport function regionCheckClient(region: string): KMSClient {\n  return new KMSClient({ region });\n}\n"), 'kmsRegionCheck.ts'),
  ],
  decoys: [
    defeat('DECOY: a timeout mentioned in the error text next to the client does not configure it', 'fix', 'RED',
      (t) => t.replace(KEY_AUTHORITY, "'writer_source_kms_region_missing_or_invalid'", "'writer_source_kms_region_missing_or_invalid_connectionTimeout_requestTimeout'"), 'no requestHandler'),
  ],
};

// =====================================================================================================
// 4. SF-13 no KMS call inside a database transaction, SF-14 KMS call model
// =====================================================================================================

/** Names whose call can reach KMS: the SDK commands (built with `new`) and the wrappers above them. */
const KMS_SEED_NAMES = ['DecryptCommand', 'GenerateDataKeyCommand', 'unwrapSourceDataKey', 'generateSourceDataKey', 'decryptOriginalSource', 'encryptOriginalSource', 'materializeOriginalSourceCiphertext'];
const isCommandName = (n) => /Command$/.test(n);
/** The default bearing set for checkSource when the caller supplies none (what the real tree resolves to). */
const DEFAULT_BEARING = [...KMS_SEED_NAMES, 'recoverEncryptedLandingBytes', 'inspectEncryptedStoredObject', 'inspectMemberIncompleteLandings', 'markEncryptedBytesVerified', 'commitEncryptedArrival', 'verifyCustody'];

function bearingCallSites(bl, name, from, to) {
  return callSites(bl, name, from, to, { newOnly: isCommandName(name) });
}

/** Identifiers followed by `(` in [from, to) of blanked code (calls, constructions and member calls alike). */
function calledNames(bl, from, to) {
  const out = new Set();
  const re = /([A-Za-z_$][\w$]*)\s*\(/g;
  re.lastIndex = from;
  let m;
  while ((m = re.exec(bl)) && m.index < to) out.add(m[1]);
  return out;
}

const NAMED_CACHE = new Map();
/** namedFunctionsAll, memoised by the blanked text (the same file is read for many trees). */
function namedFunctionsCached(bl) {
  let r = NAMED_CACHE.get(bl);
  if (!r) {
    r = namedFunctionsAll(bl);
    NAMED_CACHE.set(bl, r);
  }
  return r;
}

/**
 * Grow `seed` with every function (by name) whose body calls a member of the set, over several files. A
 * function counts in EVERY shape it can be written: declarations, arrow consts with a block or a concise body,
 * function expressions, object-literal and class methods, property values - and a name it is imported or
 * assigned under (`x as y`, `const y = x`) is the same function. Matching is by bare name, which over-detects
 * (a method called load makes every .load( call suspect): the safe direction for a "must not call" law.
 */
function growBearing(files, seed) {
  const set = new Set(seed);
  const table = [];
  for (const f of files) for (const fn of namedFunctionsCached(f.bl)) table.push({ name: fn.name, calls: calledNames(f.bl, fn.open, fn.close) });
  const aliased = new Set();
  let changed = true;
  while (changed) {
    changed = false;
    for (const n of [...set]) {
      if (aliased.has(n)) continue;
      aliased.add(n);
      for (const f of files) if (f.bl.includes(n)) for (const a of aliasesInBl(f.bl, n)) if (!set.has(a)) { set.add(a); changed = true; }
    }
    for (const row of table) {
      if (set.has(row.name)) continue;
      for (const c of row.calls) {
        if (set.has(c)) {
          set.add(row.name);
          changed = true;
          break;
        }
      }
    }
  }
  return set;
}

/**
 * The transaction callbacks of a lexed file: [{ open, close, line, fn, byName? }]. The argument range of every
 * transaction( call is one - whatever the call is spelled: transaction<T>( with a type argument, a name the
 * import renamed (`transaction as inTx`), db.transaction( - and a callback passed BY NAME (transaction(runClaim))
 * also contributes the body of the named function, because brace-matching the arguments alone would never see it.
 * With `code` (the comment-stripped text, strings kept) a hand-written transaction counts too: from
 * query('BEGIN') to the next query('COMMIT') in the same function.
 */
function transactionCallbacks(bl, code = null) {
  const out = [];
  const all = namedFunctionsCached(bl);
  const fns = topLevelFunctions(bl);
  const names = ['transaction', ...aliasesInBl(bl, 'transaction')];
  const re = new RegExp(`(?<![\\w$])(?<!\\bfunction\\s+)(?:${names.map(esc).join('|')})\\s*(?:<[^()]*?>)?\\s*\\(`, 'g');
  for (const m of bl.matchAll(re)) {
    const open = m.index + m[0].length - 1;
    const close = matchClose(bl, open);
    if (close < 0) continue;
    const line = lineAt(bl, m.index);
    const fn = enclosing(fns, m.index)?.name ?? '<module>';
    out.push({ open, close, line, fn });
    const first = /^\s*([A-Za-z_$][\w$]*)\s*(?:,|$)/.exec(bl.slice(open + 1, close));
    const target = first ? all.find((x) => x.name === first[1]) : null;
    if (target) out.push({ open: target.open, close: target.close, line, fn, byName: target.name });
  }
  if (code) {
    for (const m of code.matchAll(/\.query\s*\(\s*(['"`])\s*(?:BEGIN|START\s+TRANSACTION)\b/gi)) {
      const host = enclosing(fns, m.index);
      const limit = host ? host.close : bl.length;
      const end = /\.query\s*\(\s*(['"`])\s*COMMIT\b/gi;
      end.lastIndex = m.index + 1;
      const x = end.exec(code);
      out.push({ open: m.index, close: x && x.index < limit ? x.index : limit, line: lineAt(bl, m.index), fn: host?.name ?? '<module>', manual: true });
    }
  }
  return out;
}

/** Calls into bearing functions inside any transaction callback: [{ line, callee, fn }]. */
function callsInsideTransactions(bl, bearing, code = null) {
  const found = [];
  for (const tx of transactionCallbacks(bl, code)) {
    for (const b of bearing) {
      for (const idx of bearingCallSites(bl, b, tx.open + 1, tx.close)) found.push({ idx, line: lineAt(bl, idx), callee: b, fn: tx.fn });
    }
  }
  found.sort((a, b) => a.idx - b.idx);
  return found.filter((x, i) => i === 0 || x.idx !== found[i - 1].idx || x.callee !== found[i - 1].callee);
}

/**
 * Pure logic behind SF-13, independent of any file: strip comments, lex, grow the bearing set with the
 * file-local functions that reach it, brace-match every transaction( callback and report each call into a
 * bearing function inside one. No transaction callback at all is INCONCLUSIVE (a check of nothing), never ok.
 */
export function checkSource(src, opts = {}) {
  const rep = report();
  const sd = stripCommentsDetailed(String(src), { jsx: false });
  if (sd.issues.length > 0) {
    rep.unknown(`the comment stripper left an unclosed ${sd.issues[0].kind} at line ${sd.issues[0].line}`);
    return { ...rep.done(), findings: [], transactions: 0 };
  }
  const lx = lexCode(sd.text);
  if (lx.issues.length > 0) {
    rep.unknown(`the literal scanner left an unclosed ${lx.issues[0].kind} at line ${lx.issues[0].line}`);
    return { ...rep.done(), findings: [], transactions: 0 };
  }
  const bearing = growBearing([{ bl: lx.bl }], opts.bearing ?? DEFAULT_BEARING);
  const txs = transactionCallbacks(lx.bl, sd.text);
  if (txs.length === 0) {
    rep.unknown('no transaction callback was found in the source (a check of nothing)');
    return { ...rep.done(), findings: [], transactions: 0 };
  }
  const findings = callsInsideTransactions(lx.bl, bearing, sd.text);
  for (const x of findings) rep.bad(`line ${x.line} ${x.callee} is called inside a transaction callback (in ${x.fn})`);
  if (findings.length === 0) rep.ok(`${txs.length} transaction callback(s) contain no call that can reach KMS`);
  return { ...rep.done(), findings, transactions: txs.length };
}

const SF13_SCOPE = SOURCE_DIR;

function sf13Check(tree) {
  const rep = report();
  const files = sourceFilesUnder(tree, [SF13_SCOPE], rep).filter((r) => r.endsWith('.ts'));
  if (rep.inconclusive()) return rep.done();
  const facts = files.map((rel) => need(tree, rel, rep)).filter(Boolean);
  if (rep.inconclusive()) return rep.done();

  // the rest of the deployed code that calls into the library is held to the same law: a file is pulled in when it
  // IMPORTS a library module (selection by import, never by a bare name, so a generic method name such as load
  // cannot drag the whole repository in)
  const outside = sourceFilesUnder(tree, ['app', 'lib', 'scripts'], rep).filter((r) => !r.startsWith(`${SF13_SCOPE}/`));
  if (rep.inconclusive()) return rep.done();
  const libKnown = new Set(files);
  const stems = files.map((r) => r.slice(r.lastIndexOf('/') + 1).replace(/\.ts$/, ''));
  const extra = [];
  let unlexable = 0;
  for (const rel of outside) {
    const raw = tree.read(rel);
    if (raw === null || !stems.some((n) => rawHas(raw, n))) continue;
    if (!importSpecs(tree.code(rel) ?? '').some((spec) => resolveImport(rel, spec, libKnown) !== null)) continue;
    const g = need(tree, rel, rep, { tolerateLiterals: true });
    if (!g) continue;
    if (g.literalIssues.length > 0) { unlexable++; continue; }
    extra.push(g);
  }
  if (rep.inconclusive()) return rep.done();
  const scanned = [...facts, ...extra];
  const bearing = growBearing(scanned, KMS_SEED_NAMES);

  // the anchor: the claim transaction of arrivals.ts was actually read
  const af = facts.find((f) => f.rel === ARRIVALS);
  if (!af) { rep.unknown(`${ARRIVALS} is not among the scanned files`); return rep.done(); }
  const claim = topLevelFunctions(af.bl).find((x) => x.name === 'claimArrival');
  if (!claim) { rep.unknown(`${ARRIVALS} has no recognisable claimArrival function`); return rep.done(); }
  const txs = transactionCallbacks(af.bl, af.code).filter((t) => t.fn === 'claimArrival');
  if (txs.length === 0) { rep.unknown(`claimArrival in ${ARRIVALS} has no transaction callback, so the law cannot be established there`); return rep.done(); }

  // the verdict: EVERY transaction callback in the scanned code, claimArrival named first
  let total = 0;
  let inClaim = 0;
  for (const f of scanned) {
    for (const x of callsInsideTransactions(f.bl, bearing, f.code)) {
      total++;
      if (f.rel === ARRIVALS && x.fn === 'claimArrival') {
        inClaim++;
        rep.bad(`${ARRIVALS}:${x.line} ${x.callee} (which can reach KMS Decrypt) is called inside the transaction of claimArrival`);
      } else {
        rep.bad(`${f.rel}:${x.line} ${x.callee} (which can reach KMS Decrypt) is called inside a database transaction (in ${x.fn})`);
      }
    }
  }
  if (total === 0) rep.ok(`no transaction callback in ${scanned.length} scanned files (${SF13_SCOPE} and ${extra.length} caller file(s) elsewhere) contains a call that can reach KMS; the claimArrival transaction was read`);
  // the lock evidence: the same callback takes row locks, so the call holds them
  if (inClaim > 0) {
    const first = Math.min(...callsInsideTransactions(af.bl, bearing, af.code).filter((x) => x.fn === 'claimArrival').map((x) => x.idx));
    const lockLines = [...af.code.slice(txs[0].open, first).matchAll(/\bFOR\s+UPDATE\b/gi)].length;
    if (lockLines > 0) rep.state(`the claimArrival transaction takes ${lockLines} FOR UPDATE row lock(s) before the call, so a slow KMS call holds them and a pooled connection`);
  }
  rep.ctx(`${scanned.length} files scanned (${files.length} in ${SF13_SCOPE}, ${extra.length} elsewhere that import it), ${bearing.size} KMS-bearing names${unlexable ? `; ${unlexable} caller file(s) could not be lexed and were not scanned` : ''}; a callee reached only through dynamic dispatch is not seen`);
  return rep.done();
}

// ---- SF-14 -----------------------------------------------------------------------------------------

/** Names whose call sites make up the KMS call model, as call expressions (the two commands are built with new). */
const SF14_NAMES = ['GenerateDataKeyCommand', 'DecryptCommand', 'generateAwsDataKey', 'unwrapAwsDataKey', 'generateSourceDataKey', 'unwrapSourceDataKey', 'encryptOriginalSource', 'decryptOriginalSource', 'materializeOriginalSourceCiphertext', 'recoverEncryptedLandingBytes', 'inspectEncryptedStoredObject'];

/**
 * What a lexed file imports from the KMS SDK: { commands: Map(local name -> SDK command name), namespaces: [local],
 * importsSdk }. Every command class of the SDK is a KMS call (Encrypt, ReEncrypt, DescribeKey, GenerateDataKey
 * WithoutPlaintext, ...), not only the two the declared model lists, and an `as` rename is the same class.
 */
function kmsSdkImports(f) {
  const out = { commands: new Map(), namespaces: [], importsSdk: f.code.includes('@aws-sdk/client-kms') };
  for (const m of f.code.matchAll(/\bimport\s*(?!type\b)\{([^}]*)\}\s*from\s*(['"])@aws-sdk\/client-kms\2/g)) {
    for (const part of m[1].split(',')) {
      const t = part.trim().replace(/^type\s+/, '');
      if (!t) continue;
      const am = /^([A-Za-z_$][\w$]*)\s+as\s+([A-Za-z_$][\w$]*)$/.exec(t);
      const imported = am ? am[1] : t;
      const local = am ? am[2] : t;
      if (/Command$/.test(imported)) out.commands.set(local, imported);
    }
  }
  for (const m of f.code.matchAll(/\bimport\s*\*\s*as\s+([A-Za-z_$][\w$]*)\s+from\s*(['"])@aws-sdk\/client-kms\2/g)) out.namespaces.push(m[1]);
  return out;
}

/** key `file#function` -> Map(callee -> count) over the non-test TypeScript files of the Source library. */
function kmsCallTable(tree, rep) {
  const files = sourceFilesUnder(tree, [SOURCE_DIR], rep).filter((r) => r.endsWith('.ts'));
  const table = new Map();
  const bump = (key, callee) => {
    if (!table.has(key)) table.set(key, new Map());
    table.get(key).set(callee, (table.get(key).get(callee) ?? 0) + 1);
  };
  for (const rel of files) {
    const f = need(tree, rel, rep);
    if (!f) continue;
    const fns = topLevelFunctions(f.bl);
    const keyAt = (idx) => `${path.posix.basename(rel)}#${enclosing(fns, idx)?.name ?? '<module>'}`;
    for (const name of SF14_NAMES) for (const idx of callSites(f.bl, name, 0, f.bl.length, { newOnly: isCommandName(name) })) bump(keyAt(idx), name);
    const sdk = kmsSdkImports(f);
    // every other SDK command, and a renamed import of one of the two modelled commands, counted under the SDK name
    for (const [local, imported] of sdk.commands) {
      if (local === imported && SF14_NAMES.includes(imported)) continue;
      for (const idx of callSites(f.bl, local, 0, f.bl.length, { newOnly: true })) bump(keyAt(idx), imported);
    }
    for (const ns of sdk.namespaces) for (const m of f.bl.matchAll(new RegExp(`\\bnew\\s+${esc(ns)}\\s*\\.\\s*([A-Za-z_$][\\w$]*Command)\\s*\\(`, 'g'))) bump(keyAt(m.index), m[1]);
    // a send on ANY receiver (a local `const c = kmsClient(); c.send(...)` included) in a file that imports the SDK
    const sends = sdk.importsSdk ? f.bl.matchAll(/\.send\s*\(/g) : f.bl.matchAll(/\bkmsClient\s*\(\s*\)\s*\.send\s*\(/g);
    for (const m of sends) bump(keyAt(m.index), 'kmsClient.send');
  }
  return table;
}

/** Files outside the Source library that build a KMS client or command or send on one: [{ rel, n }]. */
function kmsSitesOutside(tree, rep) {
  const files = sourceFilesUnder(tree, ['app', 'lib', 'scripts'], rep, { includeWitness: true }).filter((r) => !r.startsWith(`${SOURCE_DIR}/`));
  const out = [];
  for (const rel of files) {
    const raw = tree.read(rel);
    if (raw === null || !rawHas(raw, '@aws-sdk/client-kms')) continue;
    const f = need(tree, rel, rep, { tolerateLiterals: true });
    if (!f) continue;
    const sdk = kmsSdkImports(f);
    let n = 0;
    for (const local of sdk.commands.keys()) n += callSites(f.bl, local, 0, f.bl.length, { newOnly: true }).length;
    for (const ns of sdk.namespaces) n += [...f.bl.matchAll(new RegExp(`\\bnew\\s+${esc(ns)}\\s*\\.\\s*\\w+Command\\s*\\(`, 'g'))].length;
    n += [...f.bl.matchAll(/\.send\s*\(/g)].length;
    for (const name of ['KMSClient', ...aliasesInBl(f.bl, 'KMSClient')]) n += callSites(f.bl, name, 0, f.bl.length, { newOnly: true }).length;
    if (n > 0) out.push({ rel, n });
  }
  return out;
}

/** Non-test files outside the Source library that call one of its KMS-bearing functions (context for the model, not a verdict). */
function kmsCallersOutside(tree, rep) {
  const files = sourceFilesUnder(tree, ['app', 'lib', 'scripts'], rep).filter((r) => !r.startsWith(`${SOURCE_DIR}/`));
  const names = SF14_NAMES.filter((n) => !isCommandName(n));
  const out = [];
  for (const rel of files) {
    const raw = tree.read(rel);
    if (raw === null || !names.some((n) => rawHas(raw, n))) continue;
    const f = need(tree, rel, rep, { tolerateLiterals: true });
    if (!f) continue;
    if (names.some((n) => [n, ...aliasesInBl(f.bl, n)].some((a) => callSites(f.bl, a).length > 0))) out.push(rel);
  }
  return out;
}

/** The declared model: every KMS-bearing call site of the landing library, by function. */
const KMS_MODEL = Object.freeze({
  'sourceKeyAuthority.ts#generateAwsDataKey': { GenerateDataKeyCommand: 1, 'kmsClient.send': 1 },
  'sourceKeyAuthority.ts#unwrapAwsDataKey': { DecryptCommand: 1, 'kmsClient.send': 1 },
  'sourceKeyAuthority.ts#generateSourceDataKey': { generateAwsDataKey: 1 },
  'sourceKeyAuthority.ts#unwrapSourceDataKey': { unwrapAwsDataKey: 1 },
  'sourceEnvelope.ts#encryptOriginalSource': { generateSourceDataKey: 1 },
  'sourceEnvelope.ts#materializeOriginalSourceCiphertext': { unwrapSourceDataKey: 1 },
  'sourceEnvelope.ts#decryptOriginalSource': { unwrapSourceDataKey: 1 },
  'encryptedLanding.ts#prepareEncryptedWrite': { encryptOriginalSource: 1 },
  'encryptedLanding.ts#recoverEncryptedLandingBytes': { decryptOriginalSource: 1 },
  'encryptedLanding.ts#inspectEncryptedStoredObject': { decryptOriginalSource: 1 },
  'encryptedLanding.ts#resumeWritingLanding': { materializeOriginalSourceCiphertext: 1, inspectEncryptedStoredObject: 1 },
  'encryptedLanding.ts#markEncryptedBytesVerified': { inspectEncryptedStoredObject: 1 },
  'encryptedLanding.ts#commitEncryptedArrival': { inspectEncryptedStoredObject: 1 },
  'encryptedLanding.ts#inspectMemberIncompleteLandings': { inspectEncryptedStoredObject: 1 },
  'arrivals.ts#claimArrival': { recoverEncryptedLandingBytes: 1 },
  'arrivals.ts#verifyCustody': { recoverEncryptedLandingBytes: 1 },
});

/** Where each Decrypt on the declared landing path sits, by the name the plan gives it. */
const KMS_ROLES = Object.freeze([
  ['verify', 'markEncryptedBytesVerified'],
  ['commit inspection', 'commitEncryptedArrival'],
  ['claim', 'claimArrival'],
  ['verifyCustody', 'verifyCustody'],
]);

const sig = (m) => [...m.entries()].map(([k, v]) => `${k}x${v}`).sort().join(',');

/** Calls to KMS implied by calling function `name`, derived from the extracted table: { gdk, dec }. */
function kmsCost(table, name, seen = new Set()) {
  if (seen.has(name)) return { gdk: 0, dec: 0 };
  const rows = [...table.entries()].filter(([k]) => k.endsWith(`#${name}`));
  const total = { gdk: 0, dec: 0 };
  const next = new Set(seen).add(name);
  for (const [, calls] of rows) {
    for (const [callee, count] of calls) {
      if (callee === 'GenerateDataKeyCommand') total.gdk += count;
      else if (callee === 'DecryptCommand') total.dec += count;
      else if (callee === 'kmsClient.send') continue;
      else {
        const c = kmsCost(table, callee, next);
        total.gdk += c.gdk * count;
        total.dec += c.dec * count;
      }
    }
  }
  return total;
}

const addCost = (a, b) => ({ gdk: a.gdk + b.gdk, dec: a.dec + b.dec });

function sf14Check(tree, model = KMS_MODEL) {
  const rep = report();
  const table = kmsCallTable(tree, rep);
  if (rep.inconclusive()) return rep.done();
  if (table.size === 0) {
    rep.unknown(`no KMS-bearing call site was found under ${SOURCE_DIR} (a count of nothing)`);
    return rep.done();
  }
  let matched = 0;
  for (const key of [...new Set([...Object.keys(model), ...table.keys()])].sort()) {
    const want = model[key] ? new Map(Object.entries(model[key])) : null;
    const have = table.get(key) ?? null;
    if (want && have && sig(want) === sig(have)) { matched++; continue; }
    if (!want) rep.bad(`${key} has KMS-bearing call(s) the declared model does not list: ${sig(have)}`);
    else if (!have) rep.bad(`${key} is in the declared model (${sig(want)}) but the code no longer calls it`);
    else rep.bad(`${key} calls ${sig(have)} where the declared model has ${sig(want)}`);
  }
  // a KMS client or command built anywhere ELSE in deployed code is a site the declared model does not list
  const stray = kmsSitesOutside(tree, rep);
  if (rep.inconclusive()) return rep.done();
  for (const o of stray) rep.bad(`${o.rel} builds or sends on a KMS client or command (${o.n} site(s)) outside ${SOURCE_DIR}, so it is not part of the declared model`);
  if (rep.violations() === 0) rep.ok(`${matched} of ${Object.keys(model).length} declared KMS-bearing call sites match the code exactly, and no other KMS SDK command, client or send site exists in app, lib or scripts`);

  const upload = ['prepareEncryptedWrite', 'markEncryptedBytesVerified', 'commitEncryptedArrival'].map((n) => kmsCost(table, n)).reduce(addCost, { gdk: 0, dec: 0 });
  const claim = kmsCost(table, 'claimArrival');
  const verify = kmsCost(table, 'verifyCustody');
  const total = addCost(upload, claim);
  if (total.gdk === 1 && total.dec === 3) rep.ok('derived from the call sites: one upload plus its claim costs 1 GenerateDataKey and 3 Decrypt (verify, commit inspection, claim)');
  else rep.bad(`derived from the call sites: one upload plus its claim costs ${total.gdk} GenerateDataKey and ${total.dec} Decrypt, where the declared model is 1 and 3`);
  if (verify.gdk === 0 && verify.dec === 1) rep.ok('derived: each verifyCustody adds exactly 1 Decrypt and no GenerateDataKey');
  else rep.bad(`derived: verifyCustody costs ${verify.gdk} GenerateDataKey and ${verify.dec} Decrypt, where the declared model is 0 and 1`);
  for (const [role, fnName] of KMS_ROLES) {
    const c = kmsCost(table, fnName);
    rep.state(`${role} (${fnName}): ${c.dec} Decrypt, ${c.gdk} GenerateDataKey per call`);
  }
  const callers = kmsCallersOutside(tree, rep);
  rep.ctx(callers.length === 0 ? `no non-test file outside ${SOURCE_DIR} calls a KMS-bearing library function` : `${callers.length} non-test file(s) outside ${SOURCE_DIR} call KMS-bearing library functions (${callers.slice(0, 4).join(', ')}${callers.length > 4 ? ', ...' : ''}); each call costs what the model says, and is not a new site`);
  const resume = kmsCost(table, 'resumeWritingLanding');
  rep.ctx(`the resume path (resumeWritingLanding) costs ${resume.dec} Decrypt and is outside the declared per-upload model; the model is the uninterrupted path`);
  return rep.done();
}

const SF13_CLAIM_CALL = /const bytes = encryptedLanding\s*\?\s*await recoverEncryptedLandingBytes\(encryptedLanding\)\s*:\s*await readVaultBytes\(source\.artifact_ref\);/;
const SF13_TX = 'return transaction(async (tx) => {';
/** Repair shaped like commitEncryptedArrival: decrypt first, then open the transaction and compare inside it. */
const decryptBeforeTransaction = (t) => t
  .replace(ARRIVALS, SF13_TX, `const recovered = encryptedLanding ? await recoverEncryptedLandingBytes(encryptedLanding) : null;\n  ${SF13_TX}`)
  .replace(ARRIVALS, SF13_CLAIM_CALL, 'const bytes = recovered ?? await readVaultBytes(source.artifact_ref);');

const SF13_LANDING_T = 'Parameters<typeof recoverEncryptedLandingBytes>[0] | null';
const claimVia = (t, call) => t.replace(ARRIVALS, SF13_CLAIM_CALL, `const bytes = ${call};`);
const appendTo = (rel, text) => (t) => t.edit(rel, (s) => `${s}\n${text}\n`);
/** A file that decrypts under a transaction, in the shape given; the claim of arrivals.ts is repaired first so only this file is wrong. */
const sf13Reverify = ({ dbImport = "import { transaction } from '@/lib/db/postgres';", open = 'return transaction(async (tx) => {', close = '  });' } = {}) =>
  `${dbImport}\nimport { recoverEncryptedLandingBytes } from './encryptedLanding';\n\nexport async function reverifyLanding(row: never): Promise<number> {\n  ${open}\n    await tx.query('SELECT 1 FOR UPDATE');\n    return (await recoverEncryptedLandingBytes(row)).length;\n${close}\n}\n`;
const sf13ManualBegin = "import { getClient } from '@/lib/db/postgres';\nimport { recoverEncryptedLandingBytes } from './encryptedLanding';\n\nexport async function reverifyLanding(row: never): Promise<number> {\n  const client = await getClient();\n  await client.query('BEGIN');\n  await client.query('SELECT 1 FOR UPDATE');\n  const n = (await recoverEncryptedLandingBytes(row)).length;\n  await client.query('COMMIT');\n  return n;\n}\n";

const SF13 = {
  id: 'SF-13',
  title: 'No KMS Decrypt inside the claim transaction',
  law: 'KMS Decrypt is not invoked while a database transaction holds row locks.',
  obligations: ['WSI-32'],
  claims: ['C19'],
  kind: 'law',
  expectedToday: 'RED',
  whyExpected: 'Confirmed by brace-matching the callback of claimArrival in arrivals.ts on comment-stripped code: inside transaction() it takes FOR UPDATE on the arrival and on the destination Work, then for an ARTIFACT_EXTRACTION arrival calls recoverEncryptedLandingBytes, which is decryptOriginalSource, which is unwrapSourceDataKey, which is a KMS Decrypt on the aws-kms provider. The static check cannot see the provider branch, only that the call sits in the callback; with the local-test provider the same call is an in-process unwrap and costs no lock time. The same library already shows the safe shape: commitEncryptedArrival inspects (a Decrypt) before it opens its transaction, and the rest of the scanned code has no other call of this kind. The verdict is not limited to claimArrival: every transaction callback in lib/manuscript/source and in the files elsewhere that import it is checked - transaction( with or without a type argument, a transaction imported under another name, and a hand-written BEGIN ... COMMIT block - for a call that can reach KMS in any shape a function can be written (declaration, block or concise arrow, function expression, object or class method, property value, renamed import). Library and app files are scanned whatever they are called; only tests are excused.',
  rulingPending: null,
  check: sf13Check,
  defeats: [
    defeat('FIX: decrypt before opening the transaction, as commitEncryptedArrival does, and compare the hash inside it', 'fix', 'GREEN', decryptBeforeTransaction),
    defeat('FIX: SUBTLE the repair leaves a comment inside the transaction that still names the old call', 'fix', 'GREEN',
      (t) => decryptBeforeTransaction(t).replace(ARRIVALS, 'if (arrival.rows.length !== 1) return false;', '// recoverEncryptedLandingBytes(encryptedLanding) now runs before the lock; see above\n    if (arrival.rows.length !== 1) return false;')),
    defeat('WRONG FIX: the call is moved into a small helper that the transaction still calls', 'fix', 'RED',
      (t) => t.replace(ARRIVALS, SF13_CLAIM_CALL, 'const bytes = await loadClaimBytes(encryptedLanding, source.artifact_ref);')
        .edit(ARRIVALS, (s) => `${s}\nasync function loadClaimBytes(landing: Parameters<typeof recoverEncryptedLandingBytes>[0] | null, ref: string): Promise<Buffer> {\n  return landing ? recoverEncryptedLandingBytes(landing) : readVaultBytes(ref);\n}\n`), 'loadClaimBytes'),
    defeat('WRONG FIX: a timeout race around the decrypt still holds both row locks while it waits', 'fix', 'RED',
      (t) => t.replace(ARRIVALS, SF13_CLAIM_CALL, "const bytes = encryptedLanding\n        ? await Promise.race([recoverEncryptedLandingBytes(encryptedLanding), new Promise<Buffer>((_, no) => setTimeout(() => no(new Error('kms_timeout')), 5000))])\n        : await readVaultBytes(source.artifact_ref);"), 'recoverEncryptedLandingBytes'),
    defeat('WRONG FIX: a second, earlier decrypt is added before the transaction but the one inside stays', 'fix', 'RED',
      (t) => t.replace(ARRIVALS, SF13_TX, `await (encryptedLanding ? recoverEncryptedLandingBytes(encryptedLanding) : null);\n  ${SF13_TX}`), 'inside the transaction of claimArrival'),
    defeat('FIX: the claim is repaired and another transaction in the library does no KMS call at all', 'fix', 'GREEN',
      (t) => decryptBeforeTransaction(t).add(`${SOURCE_DIR}/touchArrival.ts`, "import { transaction } from '@/lib/db/postgres';\n\nexport async function touchArrival(id: string): Promise<void> {\n  await transaction(async (tx) => {\n    await tx.query('UPDATE manuscript_source_arrivals SET id = id WHERE id = $1', [id]);\n  });\n}\n")),
    defeat('WRONG FIX: the call hides behind a concise-arrow helper (no braces, so a body-block reader never sees it)', 'fix', 'RED',
      (t) => appendTo(ARRIVALS, `const loadClaimBytes = (l: ${SF13_LANDING_T}, ref: string) => (l ? recoverEncryptedLandingBytes(l) : readVaultBytes(ref));`)(claimVia(t, 'await loadClaimBytes(encryptedLanding, source.artifact_ref)')), 'loadClaimBytes'),
    defeat('WRONG FIX: the call hides behind an object-literal method', 'fix', 'RED',
      (t) => appendTo(ARRIVALS, `const custody = { load(l: ${SF13_LANDING_T}, ref: string) { return l ? recoverEncryptedLandingBytes(l) : readVaultBytes(ref); } };`)(claimVia(t, 'await custody.load(encryptedLanding, source.artifact_ref)')), 'load (which can reach KMS'),
    defeat('WRONG FIX: the call hides behind an object property that holds an arrow', 'fix', 'RED',
      (t) => appendTo(ARRIVALS, `const custody = { load: async (l: ${SF13_LANDING_T}, ref: string) => (l ? recoverEncryptedLandingBytes(l) : readVaultBytes(ref)) };`)(claimVia(t, 'await custody.load(encryptedLanding, source.artifact_ref)')), 'load (which can reach KMS'),
    defeat('WRONG FIX: the call hides behind a function expression held in a const', 'fix', 'RED',
      (t) => appendTo(ARRIVALS, `const loadClaimBytes = async function (l: ${SF13_LANDING_T}, ref: string) { return l ? recoverEncryptedLandingBytes(l) : readVaultBytes(ref); };`)(claimVia(t, 'await loadClaimBytes(encryptedLanding, source.artifact_ref)')), 'loadClaimBytes'),
    defeat('WRONG FIX: the import is renamed (recoverEncryptedLandingBytes as getLandingBytes) and the renamed name is called inside the transaction', 'fix', 'RED',
      (t) => claimVia(t.replace(ARRIVALS, '  recoverEncryptedLandingBytes,\n} from', '  recoverEncryptedLandingBytes as getLandingBytes,\n} from'), 'encryptedLanding ? await getLandingBytes(encryptedLanding) : await readVaultBytes(source.artifact_ref)'), 'getLandingBytes'),
    defeat('WRONG FIX: the claim is repaired but another library file decrypts under FOR UPDATE inside a transaction', 'fix', 'RED',
      (t) => decryptBeforeTransaction(t).add(`${SOURCE_DIR}/reverify.ts`, sf13Reverify()), 'reverify.ts'),
    defeat('WRONG FIX: the claim is repaired but another file decrypts inside transaction<number>( with a type argument', 'fix', 'RED',
      (t) => decryptBeforeTransaction(t).add(`${SOURCE_DIR}/reverify.ts`, sf13Reverify({ open: 'return transaction<number>(async (tx) => {' })), 'reverify.ts'),
    defeat('WRONG FIX: the claim is repaired but another file decrypts inside a transaction imported under another name', 'fix', 'RED',
      (t) => decryptBeforeTransaction(t).add(`${SOURCE_DIR}/reverify.ts`, sf13Reverify({ dbImport: "import { transaction as inTx } from '@/lib/db/postgres';", open: 'return inTx(async (tx) => {' })), 'reverify.ts'),
    defeat('WRONG FIX: the claim is repaired but another file decrypts between a hand-written BEGIN and COMMIT', 'fix', 'RED',
      (t) => decryptBeforeTransaction(t).add(`${SOURCE_DIR}/reverify.ts`, sf13ManualBegin), 'reverify.ts'),
    defeat('WRONG FIX: the same transaction sits in a file named like a probe, which is deployed code all the same', 'fix', 'RED',
      (t) => decryptBeforeTransaction(t).add(`${SOURCE_DIR}/reverifyProbe.ts`, sf13Reverify()), 'reverifyProbe.ts'),
    defeat('WRONG FIX: the claim is repaired but a caller OUTSIDE the library decrypts inside a transaction', 'fix', 'RED',
      (t) => decryptBeforeTransaction(t).add('lib/manuscript/other/reverifyElsewhere.ts', sf13Reverify().replace("from './encryptedLanding'", "from '@/lib/manuscript/source/encryptedLanding'")), 'reverifyElsewhere.ts'),
  ],
  decoys: [
    defeat('DECOY: the call is named in a comment and in a string inside the transaction (it is still the real call that counts)', 'fix', 'RED',
      (t) => t.replace(ARRIVALS, 'if (arrival.rows.length !== 1) return false;', "// do not call recoverEncryptedLandingBytes here\n    const note = 'recoverEncryptedLandingBytes(';\n    if (arrival.rows.length !== 1 || note.length === 0) return false;"), 'inside the transaction of claimArrival'),
  ],
};

/** Hand-written samples that prove the pure logic, independent of the real file. */
const SF13_SAMPLES = Object.freeze([
  {
    name: 'GREEN: decrypt first, transaction compares the hash',
    ok: true,
    src: `export async function claim(id: string, row: R) {
  const bytes = await recoverEncryptedLandingBytes(row);
  return transaction(async (tx) => {
    const r = await tx.query('SELECT h FROM t WHERE id = $1 FOR UPDATE', [id]);
    return hashBytes(bytes) === r.rows[0].h;
  });
}`,
  },
  {
    name: 'RED: decrypt inside the transaction callback',
    ok: false,
    count: 1,
    src: `export async function claim(id: string, row: R) {
  return transaction(async (tx) => {
    const r = await tx.query('SELECT h FROM t WHERE id = $1 FOR UPDATE', [id]);
    const bytes = await recoverEncryptedLandingBytes(row);
    return hashBytes(bytes) === r.rows[0].h;
  });
}`,
  },
  {
    name: 'RED: a file-local helper hides the decrypt',
    ok: false,
    count: 1,
    src: `async function load(row: R) { return recoverEncryptedLandingBytes(row); }
export async function claim(id: string, row: R) {
  return transaction(async (tx) => {
    await tx.query('SELECT 1 FOR UPDATE');
    return (await load(row)).length > 0;
  });
}`,
  },
  {
    name: 'RED: the callback is passed by name, so brace-matching the arguments alone sees nothing',
    ok: false,
    count: 1,
    src: `async function work(tx: Tx) {
  await tx.query('SELECT 1 FOR UPDATE');
  return (await decryptOriginalSource(c, m, x)).length;
}
export async function claim() {
  return transaction(work);
}`,
  },
  {
    name: 'RED: the call sits in a nested arrow and a template expression inside the callback',
    ok: false,
    count: 2,
    src: `export async function claim(rows: R[]) {
  return transaction(async (tx) => {
    const sizes = await Promise.all(rows.map(async (r) => (await unwrapSourceDataKey(r.w, r.c)).keyId));
    const note = \`n=\${(await recoverEncryptedLandingBytes(rows[0])).length}\`;
    return sizes.length + note.length;
  });
}`,
  },
  {
    name: 'RED: a namespace-qualified call is still a call',
    ok: false,
    count: 1,
    src: `import * as landing from './encryptedLanding';
export async function claim(row: R) {
  return transaction(async (tx) => {
    await tx.query('SELECT 1 FOR UPDATE');
    return landing.inspectEncryptedStoredObject(row);
  });
}`,
  },
  {
    name: 'GREEN: the names appear only in comments, strings and lookalike identifiers inside the callback',
    ok: true,
    src: `export async function claim(id: string) {
  return transaction(async (tx) => {
    // recoverEncryptedLandingBytes(row) must never run here
    const msg = 'do not call inspectEncryptedStoredObject( inside a transaction';
    const recoverEncryptedLandingBytesLater = 1;
    await tx.query('SELECT 1 FOR UPDATE', [id]);
    return msg.length + recoverEncryptedLandingBytesLater;
  });
}`,
  },
  {
    name: 'RED: a concise-arrow helper hides the decrypt (no braces, so a block-body reader never lists it)',
    ok: false,
    count: 1,
    src: `const load = (row: R) => recoverEncryptedLandingBytes(row);
export async function claim(row: R) {
  return transaction(async (tx) => {
    await tx.query('SELECT 1 FOR UPDATE');
    return (await load(row)).length;
  });
}`,
  },
  {
    name: 'RED: an object-literal method hides the decrypt',
    ok: false,
    count: 1,
    src: `const custody = { load(row: R) { return recoverEncryptedLandingBytes(row); } };
export async function claim(row: R) {
  return transaction(async (tx) => {
    await tx.query('SELECT 1 FOR UPDATE');
    return (await custody.load(row)).length;
  });
}`,
  },
  {
    name: 'RED: an object property that holds an arrow hides the decrypt',
    ok: false,
    count: 1,
    src: `const custody = { load: async (row: R) => recoverEncryptedLandingBytes(row) };
export async function claim(row: R) {
  return transaction(async (tx) => {
    await tx.query('SELECT 1 FOR UPDATE');
    return (await custody.load(row)).length;
  });
}`,
  },
  {
    name: 'RED: a renamed import is the same function (x as y)',
    ok: false,
    count: 1,
    src: `import { recoverEncryptedLandingBytes as getBytes } from './encryptedLanding';
export async function claim(row: R) {
  return transaction(async (tx) => {
    await tx.query('SELECT 1 FOR UPDATE');
    return (await getBytes(row)).length;
  });
}`,
  },
  {
    name: 'RED: transaction<T>( with a type argument is still a transaction',
    ok: false,
    count: 1,
    src: `export async function claim(row: R) {
  return transaction<number>(async (tx) => {
    await tx.query('SELECT 1 FOR UPDATE');
    return (await recoverEncryptedLandingBytes(row)).length;
  });
}`,
  },
  {
    name: 'RED: a transaction imported under another name is still a transaction',
    ok: false,
    count: 1,
    src: `import { transaction as inTx } from '@/lib/db/postgres';
export async function claim(row: R) {
  return inTx(async (tx) => {
    await tx.query('SELECT 1 FOR UPDATE');
    return (await recoverEncryptedLandingBytes(row)).length;
  });
}`,
  },
  {
    name: 'RED: a hand-written BEGIN ... COMMIT block is a transaction',
    ok: false,
    count: 1,
    src: `export async function claim(row: R) {
  const client = await getClient();
  await client.query('BEGIN');
  await client.query('SELECT 1 FOR UPDATE');
  const n = (await recoverEncryptedLandingBytes(row)).length;
  await client.query('COMMIT');
  return n;
}`,
  },
  {
    name: 'GREEN: the decrypt runs BEFORE a hand-written BEGIN and only a hash is compared inside it',
    ok: true,
    src: `export async function claim(row: R) {
  const bytes = await recoverEncryptedLandingBytes(row);
  const client = await getClient();
  await client.query('BEGIN');
  await client.query('SELECT 1 FOR UPDATE');
  const n = bytes.length;
  await client.query('COMMIT');
  return n;
}`,
  },
  {
    name: 'INCONCLUSIVE: no transaction callback at all is a check of nothing, not a pass',
    ok: false,
    inconclusive: true,
    src: `export async function nothing(row: R) { return recoverEncryptedLandingBytes(row); }`,
  },
]);

// ---- SF-14 objects ---------------------------------------------------------------------------------

const COMMIT_CHECK = "throw new Error('source_landing_artifact_changed');\n  }";
const SF14_PROBE = `
export async function probeKmsDataKey(contextSha256: string): Promise<void> {
  const result = await kmsClient().send(new GenerateDataKeyCommand({
    KeyId: requireKeyId(process.env.WRITER_SOURCE_KMS_KEY_ARN, 'writer_source_kms_key_arn'),
    KeySpec: 'AES_256',
    EncryptionContext: kmsEncryptionContext(contextSha256),
  }));
  result.Plaintext?.fill(0);
}
`;

const SF14 = {
  id: 'SF-14',
  title: 'KMS call model',
  law: 'The number and placement of KMS calls on the landing path match the declared model: one GenerateDataKey, and Decrypt in verify, commit inspection, claim and verifyCustody.',
  obligations: ['WSI-36'],
  claims: ['C20'],
  kind: 'state',
  expectedToday: 'GREEN',
  whyExpected: 'Read and counted: the library has exactly two SDK call sites (one GenerateDataKeyCommand in generateAwsDataKey, one DecryptCommand in unwrapAwsDataKey), and sixteen functions in all contain a KMS-bearing call, which are the rows of the declared model. Derived by following the call sites: encryptedLanding prepare costs 1 GenerateDataKey; markEncryptedBytesVerified, commitEncryptedArrival and claimArrival each cost 1 Decrypt (so one upload plus its claim is 1 GenerateDataKey and 3 Decrypt) and verifyCustody adds 1. The resume path (a WRITING_BYTES intent) costs two more Decrypts and is outside the per-upload model by design. The model pins call sites in lib/manuscript/source; callers elsewhere are reported as context. Every command the SDK exports (Encrypt, ReEncrypt, DescribeKey, GenerateDataKeyWithoutPlaintext and the rest, under any imported name), a send on any receiver in a file that imports the SDK, and any KMS client or command built outside the library count as sites the model does not list.',
  rulingPending: null,
  check: sf14Check,
  defeats: [
    defeat('BREAK: the commit path re-reads and re-hashes the plaintext, an extra Decrypt on every upload', 'break', 'RED',
      (t) => t.replace(LANDING, COMMIT_CHECK, `${COMMIT_CHECK}\n  const reread = await recoverEncryptedLandingBytes(row);\n  if (hashBytes(reread) !== row.original_sha256) throw new Error('source_landing_artifact_changed');`), 'encryptedLanding.ts#commitEncryptedArrival calls'),
    defeat('BREAK: a health probe adds a second GenerateDataKey call site to the key authority', 'break', 'RED',
      (t) => t.edit(KEY_AUTHORITY, (s) => `${s}${SF14_PROBE}`), 'sourceKeyAuthority.ts#probeKmsDataKey has KMS-bearing'),
    defeat('BREAK: a new file in the library builds its own DecryptCommand', 'break', 'RED',
      (t) => t.add(`${SOURCE_DIR}/kmsHealth.ts`, "import { DecryptCommand, KMSClient } from '@aws-sdk/client-kms';\n\nexport async function kmsHealth(client: KMSClient, blob: Uint8Array): Promise<boolean> {\n  try {\n    await client.send(new DecryptCommand({ CiphertextBlob: blob }));\n    return true;\n  } catch {\n    return false;\n  }\n}\n"), 'kmsHealth.ts#kmsHealth has KMS-bearing'),
    defeat('BREAK: the verify step stops decrypting (a Decrypt silently removed from the model)', 'break', 'RED',
      (t) => t.replace(LANDING, 'const status = await inspectEncryptedStoredObject(row);', "const status: LandingObjectStatus = 'MATCHED';"), 'encryptedLanding.ts#markEncryptedBytesVerified is in the declared model'),
    defeat('BREAK: the verify step inspects twice (a repeat of an existing call, so the set of callees is unchanged)', 'break', 'RED',
      (t) => t.replace(LANDING, 'const status = await inspectEncryptedStoredObject(row);', 'const status = await inspectEncryptedStoredObject(row);\n  await inspectEncryptedStoredObject(row);'), 'markEncryptedBytesVerified calls inspectEncryptedStoredObjectx2'),
    defeat('BREAK: claimArrival recovers the bytes twice (a repeat of an existing call on the claim path)', 'break', 'RED',
      (t) => t.replace(ARRIVALS, SF13_CLAIM_CALL, "const bytes = encryptedLanding\n        ? (await recoverEncryptedLandingBytes(encryptedLanding), await recoverEncryptedLandingBytes(encryptedLanding))\n        : await readVaultBytes(source.artifact_ref);"), 'arrivals.ts#claimArrival calls recoverEncryptedLandingBytesx2'),
    defeat('BREAK: the incomplete-landings listing inspects each stored object twice (off the per-upload path, so only the count of calls moves)', 'break', 'RED',
      (t) => t.replace(LANDING, 'for (const row of rows.rows) {\n    result.push({', "for (const row of rows.rows) {\n    if (row.state !== 'PENDING_BYTES') await inspectEncryptedStoredObject(row);\n    result.push({"), 'inspectMemberIncompleteLandings calls inspectEncryptedStoredObjectx2'),
    defeat('BREAK: the incomplete-landings listing stops inspecting and reports every object as matched (off the per-upload path)', 'break', 'RED',
      (t) => t.replace(LANDING, ': await inspectEncryptedStoredObject(row),', ": 'MATCHED' as const,"), 'inspectMemberIncompleteLandings is in the declared model'),
    defeat('BREAK: SUBTLE the extra Decrypt hides inside a new wrapper that claimArrival now calls instead of the old function', 'break', 'RED',
      (t) => t
        .edit(LANDING, (s) => `${s}\nexport async function recoverAndVerifyLandingBytes(row: EncryptedLandingRow, expectedSha256: string): Promise<Buffer> {\n  const bytes = await recoverEncryptedLandingBytes(row);\n  if (hashBytes(bytes) !== expectedSha256) throw new Error('source_landing_artifact_changed');\n  await inspectEncryptedStoredObject(row);\n  return bytes;\n}\n`)
        .replace(ARRIVALS, '  recoverEncryptedLandingBytes,\n} from', '  recoverEncryptedLandingBytes,\n  recoverAndVerifyLandingBytes,\n} from')
        .replace(ARRIVALS, SF13_CLAIM_CALL, "const bytes = encryptedLanding\n        ? await recoverAndVerifyLandingBytes(encryptedLanding, source.artifact_hash ?? '')\n        : await readVaultBytes(source.artifact_ref);"), 'recoverAndVerifyLandingBytes has KMS-bearing'),
    defeat('BREAK: an Encrypt call through a local client variable in the key authority', 'break', 'RED',
      (t) => t.replace(KEY_AUTHORITY, '  GenerateDataKeyCommand,\n', '  GenerateDataKeyCommand,\n  EncryptCommand,\n').edit(KEY_AUTHORITY, (s) => `${s}\nexport async function sidecarEncrypt(): Promise<void> {\n  const client = kmsClient();\n  await client.send(new EncryptCommand({ KeyId: 'x', Plaintext: new Uint8Array(1) }));\n}\n`), 'sourceKeyAuthority.ts#sidecarEncrypt has KMS-bearing'),
    defeat('BREAK: a DescribeKeyCommand health check in a new library file', 'break', 'RED',
      (t) => t.add(`${SOURCE_DIR}/kmsDescribe.ts`, "import { DescribeKeyCommand, KMSClient } from '@aws-sdk/client-kms';\n\nexport async function describeKey(client: KMSClient): Promise<unknown> {\n  return client.send(new DescribeKeyCommand({ KeyId: 'x' }));\n}\n"), 'kmsDescribe.ts#describeKey has KMS-bearing'),
    defeat('BREAK: a GenerateDataKeyWithoutPlaintextCommand in a new library file', 'break', 'RED',
      (t) => t.add(`${SOURCE_DIR}/kmsWrapOnly.ts`, "import { GenerateDataKeyWithoutPlaintextCommand, KMSClient } from '@aws-sdk/client-kms';\n\nexport async function wrapOnly(client: KMSClient): Promise<unknown> {\n  return client.send(new GenerateDataKeyWithoutPlaintextCommand({ KeyId: 'x', KeySpec: 'AES_256' }));\n}\n"), 'kmsWrapOnly.ts#wrapOnly has KMS-bearing'),
    defeat('BREAK: SUBTLE the modelled DecryptCommand is imported under another name in a new library file', 'break', 'RED',
      (t) => t.add(`${SOURCE_DIR}/kmsRenamed.ts`, "import { DecryptCommand as Unwrap, KMSClient } from '@aws-sdk/client-kms';\n\nexport async function unwrapAgain(client: KMSClient, blob: Uint8Array): Promise<unknown> {\n  return client.send(new Unwrap({ CiphertextBlob: blob }));\n}\n"), 'kmsRenamed.ts#unwrapAgain has KMS-bearing'),
    defeat('BREAK: SUBTLE a namespace import builds a ReEncryptCommand in a new library file', 'break', 'RED',
      (t) => t.add(`${SOURCE_DIR}/kmsReencrypt.ts`, "import * as kms from '@aws-sdk/client-kms';\n\nexport async function reencrypt(client: kms.KMSClient, blob: Uint8Array): Promise<unknown> {\n  return client.send(new kms.ReEncryptCommand({ CiphertextBlob: blob, DestinationKeyId: 'x' }));\n}\n"), 'kmsReencrypt.ts#reencrypt has KMS-bearing'),
    defeat('BREAK: a KMS health probe in a library file whose name says probe is deployed code like any other', 'break', 'RED',
      (t) => t.add(`${SOURCE_DIR}/kmsHealthProbe.ts`, "import { DecryptCommand, KMSClient } from '@aws-sdk/client-kms';\n\nexport async function kmsHealth(client: KMSClient, blob: Uint8Array): Promise<boolean> {\n  await client.send(new DecryptCommand({ CiphertextBlob: blob }));\n  return true;\n}\n"), 'kmsHealthProbe.ts#kmsHealth has KMS-bearing'),
    defeat('BREAK: a KMS Decrypt outside the library, in another lib directory', 'break', 'RED',
      (t) => t.add('lib/other/kmsOutside.ts', "import { DecryptCommand, KMSClient } from '@aws-sdk/client-kms';\n\nexport async function outside(client: KMSClient): Promise<unknown> {\n  return client.send(new DecryptCommand({ CiphertextBlob: new Uint8Array(1) }));\n}\n"), 'lib/other/kmsOutside.ts builds or sends on a KMS client'),
    defeat('BREAK: an operator script builds its own KMS client and sends on it', 'break', 'RED',
      (t) => t.add('scripts/ops/kms-ping.ts', "import { KMSClient, ListKeysCommand } from '@aws-sdk/client-kms';\n\nconst client = new KMSClient({ region: 'us-east-1' });\nawait client.send(new ListKeysCommand({}));\n"), 'scripts/ops/kms-ping.ts builds or sends on a KMS client'),
  ],
  decoys: [
    defeat('DECOY: a file outside the library imports only a TYPE from the KMS SDK and builds nothing', 'break', 'GREEN',
      (t) => t.add('lib/other/kmsTypes.ts', "import type { KMSClientConfig } from '@aws-sdk/client-kms';\n\nexport type KmsConfig = KMSClientConfig;\n")),
    defeat('DECOY: a commented-out extra Decrypt in the commit path does not exist', 'break', 'GREEN',
      (t) => t.replace(LANDING, COMMIT_CHECK, `${COMMIT_CHECK}\n  // await recoverEncryptedLandingBytes(row); // second look, removed`)),
    defeat('DECOY: a call inside a test file of the library is not part of the deployed model', 'break', 'GREEN',
      (t) => t.add(`${SOURCE_DIR}/__tests__/extraDecrypt.test.ts`, "import { recoverEncryptedLandingBytes } from '../encryptedLanding';\nexport const t = (r: never) => recoverEncryptedLandingBytes(r);\n")),
    defeat('DECOY: the name inside a string constant is not a call', 'break', 'GREEN',
      (t) => t.edit(LANDING, (s) => `${s}\nexport const KMS_NOTE = 'recoverEncryptedLandingBytes(row) decrypts';\n`)),
  ],
};

// =====================================================================================================
// 5. A SMALL YAML READER FOR COMPOSE FILES, AND THE COMPOSE MODEL
// =====================================================================================================
//
// Covers what docker-compose uses: block maps and sequences (a sequence may sit at the same indent as its
// key), anchors, aliases, merge keys (<<), flow lists and maps, single/double quoted and plain scalars
// (plain scalars may continue on deeper-indented lines), block scalars (| and >). Everything is returned as
// strings, plain objects (null prototype) and arrays. It does NOT cover tags, complex keys, multiple
// documents or tabs; anything it cannot place is recorded in `issues`, never guessed at.
//
// WHY IT EXISTS: SF-15 and SF-16b must answer "which SERVICE has this mount / variable", and a line-oriented
// grep cannot, once anchors and merge keys can hand one service another's volumes. During development it was
// compared with an independent parser over every compose file in the repository (see the file header).

function deepClone(v) {
  if (Array.isArray(v)) return v.map(deepClone);
  if (v && typeof v === 'object') {
    const o = Object.create(null);
    for (const k of Object.keys(v)) o[k] = deepClone(v[k]);
    return o;
  }
  return v;
}

const isSeqItem = (t) => t === '-' || t.startsWith('- ');

/** Index of the colon that ends the key of a `key: value` line, or -1 when the line is not a map entry. */
function keyColon(t) {
  const c0 = t[0];
  if (c0 === '"' || c0 === "'") {
    let i = 1;
    for (; i < t.length; i++) {
      if (t[i] === '\\' && c0 === '"') { i++; continue; }
      if (t[i] === c0) {
        if (c0 === "'" && t[i + 1] === "'") { i++; continue; }
        break;
      }
    }
    if (i >= t.length) return -1;
    let j = i + 1;
    while (t[j] === ' ') j++;
    return t[j] === ':' && (j + 1 >= t.length || t[j + 1] === ' ') ? j : -1;
  }
  if (c0 === '[' || c0 === '{' || c0 === '*' || c0 === '|' || c0 === '>') return -1;
  for (let i = 0; i < t.length; i++) if (t[i] === ':' && (i + 1 === t.length || t[i + 1] === ' ')) return i;
  return -1;
}

function unquoteDouble(s) {
  return s.replace(/\\(["\\/nrt0]|x[0-9a-fA-F]{2}|u[0-9a-fA-F]{4})/g, (m, c) => {
    if (c === 'n') return '\n';
    if (c === 'r') return '\r';
    if (c === 't') return '\t';
    if (c === '0') return '\0';
    if (c[0] === 'x' || c[0] === 'u') return String.fromCharCode(parseInt(c.slice(1), 16));
    return c;
  });
}

/** Read one quoted scalar starting at s[i]: [value, nextIndex] or null when it does not close. */
function readQuoted(s, i) {
  const q = s[i];
  let j = i + 1;
  let raw = '';
  while (j < s.length) {
    const c = s[j];
    if (q === '"' && c === '\\') { raw += c + (s[j + 1] ?? ''); j += 2; continue; }
    if (c === q) {
      if (q === "'" && s[j + 1] === "'") { raw += "'"; j += 2; continue; }
      return [q === '"' ? unquoteDouble(raw) : raw, j + 1];
    }
    raw += c;
    j++;
  }
  return null;
}

function parseYaml(text, { resolveAliases = true } = {}) {
  const issues = [];
  const L = String(text).split(/\r?\n/).map((raw, i) => {
    const m = /^( *)(.*?)\s*$/.exec(raw);
    const body = m[2];
    return { indent: m[1].length, text: body, raw, blank: body === '' || body.startsWith('#') || body === '---' || body === '...', no: i + 1 };
  });
  let pos = 0;
  const anchors = new Map();
  const peek = () => {
    while (pos < L.length && L[pos].blank) pos++;
    return pos < L.length ? L[pos] : null;
  };
  const issue = (kind, line) => issues.push({ kind, line });

  function alias(name, line) {
    if (!resolveAliases) return { alias: name };
    if (!anchors.has(name)) { issue('unknown-alias', line); return ''; }
    return deepClone(anchors.get(name));
  }

  // ---- flow collections and scalars inside them ----
  function skipWs(s, i) { while (i < s.length && /\s/.test(s[i])) i++; return i; }
  function flowParse(s, i0, line) {
    let i = skipWs(s, i0);
    const c = s[i];
    if (c === '[') {
      const arr = [];
      i++;
      for (;;) {
        i = skipWs(s, i);
        if (i >= s.length) { issue('unterminated-flow', line); break; }
        if (s[i] === ']') { i++; break; }
        const [v, ni] = flowParse(s, i, line);
        arr.push(v);
        i = skipWs(s, ni);
        if (s[i] === ',') i++;
      }
      return [arr, i];
    }
    if (c === '{') {
      const obj = Object.create(null);
      const merges = [];
      i++;
      for (;;) {
        i = skipWs(s, i);
        if (i >= s.length) { issue('unterminated-flow', line); break; }
        if (s[i] === '}') { i++; break; }
        let key;
        if (s[i] === '"' || s[i] === "'") {
          const q = readQuoted(s, i);
          if (!q) { issue('unterminated-flow', line); break; }
          [key, i] = q;
        } else {
          let j = i;
          while (j < s.length && s[j] !== ':' && s[j] !== ',' && s[j] !== '}') j++;
          key = s.slice(i, j).trim();
          i = j;
        }
        i = skipWs(s, i);
        let val = '';
        if (s[i] === ':') {
          const [v, ni] = flowParse(s, i + 1, line);
          val = v;
          i = ni;
        }
        if (key === '<<') merges.push(val); else obj[key] = val;
        i = skipWs(s, i);
        if (s[i] === ',') i++;
      }
      for (const m of merges) for (const mm of Array.isArray(m) ? m : [m]) if (mm && typeof mm === 'object' && !Array.isArray(mm)) for (const k of Object.keys(mm)) if (!(k in obj)) obj[k] = deepClone(mm[k]);
      return [obj, i];
    }
    if (c === '"' || c === "'") {
      const q = readQuoted(s, i);
      if (!q) { issue('unterminated-quote', line); return ['', s.length]; }
      return q;
    }
    if (c === '*') {
      let j = i + 1;
      while (j < s.length && !/[\s,\]}]/.test(s[j])) j++;
      return [alias(s.slice(i + 1, j), line), j];
    }
    if (c === '&') {
      let j = i + 1;
      while (j < s.length && !/\s/.test(s[j])) j++;
      const name = s.slice(i + 1, j);
      const [v, ni] = flowParse(s, j, line);
      anchors.set(name, v);
      return [v, ni];
    }
    let j = i;
    while (j < s.length && s[j] !== ',' && s[j] !== ']' && s[j] !== '}') j++;
    return [s.slice(i, j).trim(), j];
  }

  function flowBalanced(s) {
    let d = 0;
    for (let i = 0; i < s.length; i++) {
      const c = s[i];
      if (c === '"' || c === "'") { const q = readQuoted(s, i); if (!q) return false; i = q[1] - 1; continue; }
      if (c === '[' || c === '{') d++;
      else if (c === ']' || c === '}') d--;
    }
    return d <= 0;
  }

  function parseFlowValue(rest, line) {
    let buf = rest;
    while (!flowBalanced(buf) && pos < L.length) { buf += ` ${L[pos].text}`; pos++; }
    return flowParse(buf, 0, line)[0];
  }

  function parseBlockScalar(parentIndent) {
    const out = [];
    let blockIndent = -1;
    while (pos < L.length) {
      const raw = L[pos].raw;
      const ind = /^ */.exec(raw)[0].length;
      if (raw.trim() === '') { out.push(''); pos++; continue; }
      if (ind <= parentIndent) break;
      if (blockIndent < 0) blockIndent = ind;
      out.push(raw.slice(Math.min(blockIndent, ind)).replace(/\s+$/, ''));
      pos++;
    }
    while (out.length && out[out.length - 1] === '') out.pop();
    return out.join('\n');
  }

  function parsePlain(rest, parentIndent) {
    let v = rest;
    for (;;) {
      let q = pos;
      while (q < L.length && L[q].blank) q++;
      if (q < L.length && L[q].indent > parentIndent) { v += ` ${L[q].text}`; pos = q + 1; continue; }
      break;
    }
    return v;
  }

  function parseQuoted(rest, line) {
    let buf = rest;
    for (;;) {
      const q = readQuoted(buf, 0);
      if (q) return q[0];
      if (pos >= L.length) { issue('unterminated-quote', line); return buf.slice(1); }
      buf += ` ${L[pos].text}`;
      pos++;
    }
  }

  function parseValue(restIn, parentIndent, line) {
    let rest = restIn;
    let anchor = null;
    const am = /^&(\S+)\s*(.*)$/.exec(rest);
    if (am) { anchor = am[1]; rest = am[2]; }
    let val;
    if (rest === '') {
      const nx = peek();
      if (nx && nx.indent > parentIndent) val = parseNode(parentIndent);
      else if (nx && nx.indent === parentIndent && isSeqItem(nx.text)) val = parseSeq(parentIndent);
      else val = '';
    } else if (rest[0] === '*' && !/\s/.test(rest)) val = alias(rest.slice(1), line);
    else if (/^[|>][-+0-9]*$/.test(rest)) val = parseBlockScalar(parentIndent);
    else if (rest[0] === '[' || rest[0] === '{') val = parseFlowValue(rest, line);
    else if (rest[0] === '"' || rest[0] === "'") val = parseQuoted(rest, line);
    else val = parsePlain(rest, parentIndent);
    if (anchor) anchors.set(anchor, val);
    return val;
  }

  function parseNode(parentIndent) {
    const ln = peek();
    if (!ln || ln.indent <= parentIndent) return '';
    if (isSeqItem(ln.text)) return parseSeq(ln.indent);
    if (keyColon(ln.text) >= 0) return parseMap(ln.indent);
    pos++;
    return parseValue(ln.text, parentIndent, ln.no);
  }

  function parseMap(indent) {
    const obj = Object.create(null);
    const merges = [];
    for (;;) {
      const ln = peek();
      if (!ln || ln.indent !== indent || isSeqItem(ln.text)) break;
      const ci = keyColon(ln.text);
      if (ci < 0) { issue('not-a-mapping-entry', ln.no); pos++; continue; }
      let key = ln.text.slice(0, ci).trim();
      if (key[0] === '"' || key[0] === "'") key = readQuoted(key, 0)?.[0] ?? key;
      const rest = ln.text.slice(ci + 1).trim();
      pos++;
      const val = parseValue(rest, indent, ln.no);
      if (key === '<<') merges.push(val); else obj[key] = val;
    }
    for (const m of merges) for (const mm of Array.isArray(m) ? m : [m]) if (mm && typeof mm === 'object' && !Array.isArray(mm)) for (const k of Object.keys(mm)) if (!(k in obj)) obj[k] = deepClone(mm[k]);
    return obj;
  }

  function parseSeq(indent) {
    const arr = [];
    for (;;) {
      const ln = peek();
      if (!ln || ln.indent !== indent || !isSeqItem(ln.text)) break;
      const after = ln.text.slice(1);
      const rest = after.trimStart();
      const off = 1 + (after.length - rest.length);
      pos++;
      if (rest === '') {
        const nx = peek();
        arr.push(nx && nx.indent > indent ? parseNode(indent) : '');
        continue;
      }
      if (isSeqItem(rest)) {
        L[pos - 1] = { ...ln, indent: indent + off, text: rest };
        pos--;
        arr.push(parseSeq(indent + off));
        continue;
      }
      if (keyColon(rest) >= 0) {
        L[pos - 1] = { ...ln, indent: indent + off, text: rest };
        pos--;
        arr.push(parseMap(indent + off));
        continue;
      }
      arr.push(parseValue(rest, indent, ln.no));
    }
    return arr;
  }

  const value = parseNode(-1);
  const left = peek();
  if (left) issue('unparsed-content', left.no);
  return { value, issues };
}

/** Split a short-syntax volume entry on colons that are not inside ${...}. */
function splitVolume(s) {
  const parts = [];
  let cur = '';
  let d = 0;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (c === '$' && s[i + 1] === '{') { d++; cur += c; continue; }
    if (c === '}' && d > 0) { d--; cur += c; continue; }
    if (c === ':' && d === 0) { parts.push(cur); cur = ''; continue; }
    cur += c;
  }
  parts.push(cur);
  return parts;
}

const HOSTISH = /^(?:\.{1,2}\/|\/|~|\$)/;

/** One compose `volumes:` entry as { kind, source, target, readOnly, createHostPath }, or null. */
function parseMount(item) {
  if (typeof item === 'string') {
    const p = splitVolume(item);
    if (p.length === 1) return { kind: 'anonymous', source: '', target: p[0], readOnly: false, createHostPath: null };
    return {
      kind: HOSTISH.test(p[0]) ? 'bind' : 'volume',
      source: p[0],
      target: p[1],
      readOnly: (p[2] ?? '').split(',').includes('ro'),
      createHostPath: null,
    };
  }
  if (item && typeof item === 'object' && !Array.isArray(item)) {
    const source = typeof item.source === 'string' ? item.source : '';
    const type = typeof item.type === 'string' && item.type ? item.type : HOSTISH.test(source) ? 'bind' : 'volume';
    const chp = item.bind && typeof item.bind === 'object' ? item.bind.create_host_path : undefined;
    return {
      kind: type,
      source,
      target: typeof item.target === 'string' ? item.target : '',
      readOnly: String(item.read_only) === 'true',
      createHostPath: chp === undefined ? null : String(chp),
    };
  }
  return null;
}

function serviceModel(svc) {
  const argv = (v) => (Array.isArray(v) ? v.map(String).join(' ') : typeof v === 'string' ? v : '');
  const env = new Map();
  const e = svc.environment;
  if (Array.isArray(e)) {
    for (const it of e) {
      const s = String(it);
      const i = s.indexOf('=');
      env.set(i < 0 ? s : s.slice(0, i), i < 0 ? null : s.slice(i + 1));
    }
  } else if (e && typeof e === 'object') {
    for (const [k, v] of Object.entries(e)) env.set(k, typeof v === 'string' ? v : v == null ? null : String(v));
  }
  const ef = svc.env_file;
  const envFiles = (Array.isArray(ef) ? ef : typeof ef === 'string' ? [ef] : []).map((x) => (typeof x === 'string' ? x : x && typeof x.path === 'string' ? x.path : '')).filter(Boolean);
  return {
    command: argv(svc.command),
    entrypoint: argv(svc.entrypoint),
    image: typeof svc.image === 'string' ? svc.image : '',
    build: typeof svc.build === 'string'
      ? { context: svc.build, dockerfile: 'Dockerfile' }
      : svc.build && typeof svc.build === 'object' && !Array.isArray(svc.build)
        ? { context: typeof svc.build.context === 'string' ? svc.build.context : '.', dockerfile: typeof svc.build.dockerfile === 'string' ? svc.build.dockerfile : 'Dockerfile' }
        : null,
    env,
    envFiles,
    mounts: (Array.isArray(svc.volumes) ? svc.volumes : []).map(parseMount).filter(Boolean),
  };
}

/** Compose text -> { ok, services: Map(name -> model), issues } (ok false when there is no services mapping). */
function composeModel(text) {
  const y = parseYaml(text);
  const root = y.value;
  if (!root || typeof root !== 'object' || Array.isArray(root) || !root.services || typeof root.services !== 'object') return { ok: false, services: new Map(), issues: y.issues };
  const services = new Map();
  for (const [name, svc] of Object.entries(root.services)) if (svc && typeof svc === 'object' && !Array.isArray(svc)) services.set(name, serviceModel(svc));
  return { ok: true, services, issues: y.issues };
}

/** docker-compose*.yml and the Compose-spec defaults (compose.yaml, compose.yml, compose.override.yaml, ...). */
const COMPOSE_BASENAME = /^(?:docker-)?compose(?:[.-][^/]*)?\.ya?ml$/i;

/** Parsed compose file of a tree, or null after recording why not. */
function composeOf(tree, rel, rep) {
  const code = strictCode(tree, rel, rep);
  if (code === null) return null;
  const m = composeModel(code);
  if (!m.ok) { rep.unknown(`${rel} has no services mapping that this reader could place`); return null; }
  if (m.issues.length > 0) { rep.unknown(`${rel}:${m.issues[0].line} the compose reader could not place a construct (${m.issues[0].kind})`); return null; }
  return m;
}

const normPath = (p) => p.replace(/\/+$/, '');

// =====================================================================================================
// 6. THE FALSIFIERS, PART TWO: SF-15 worker mount parity, SF-16a / SF-16b credential channel
// =====================================================================================================

const FILE_VAULT = 'lib/storage/fileVault.ts';
const SWEEP_FN = 'sweepVaultErasureQueue';
const ENTRYPOINT = 'scripts/entrypoint.sh';

/** The vault root the code uses when FILE_STORAGE_PATH is unset, read from the code. */
function vaultRootDefault(tree, rep) {
  const f = need(tree, FILE_VAULT, rep);
  if (!f) return null;
  const m = /process\.env\.FILE_STORAGE_PATH\s*\|\|\s*(['"])(\/[^'"\n]+)\1/.exec(f.code);
  if (!m) { rep.unknown(`${FILE_VAULT} has no recognisable default vault root`); return null; }
  return normPath(m[2]);
}

/**
 * The vault root ONE service sweeps: its own FILE_STORAGE_PATH when the compose environment sets an absolute
 * literal, else the code default. A pass-through (no value), an interpolation or a relative path cannot be
 * resolved from committed text and is reported as such, never guessed.
 */
function serviceVaultRoot(svc, codeDefault) {
  if (!svc.env.has('FILE_STORAGE_PATH')) return { root: codeDefault };
  const v = svc.env.get('FILE_STORAGE_PATH');
  // a bare `KEY:` is a pass-through from the host in Compose, and this reader cannot tell it from an empty string: both are unresolved
  if (v === null || v === undefined || v === '') return { root: null, why: 'passes FILE_STORAGE_PATH through from the host environment (or leaves it empty)' };
  if (v.includes('${') || !v.startsWith('/')) return { root: null, why: 'sets FILE_STORAGE_PATH to something other than an absolute literal path' };
  return { root: normPath(v) };
}

const SCRIPT_TOKEN = /(?:^|[\s"'=])(?:\.\/|\/app\/)?(scripts\/[\w./-]+\.(?:[cm]?[jt]sx?|sh))(?=$|[\s"';&|])/g;

/** The ts/js scripts a shell script runs: the repo scripts its text names, following other shell scripts a few levels down. */
function shellScriptRefs(tree, rel, depth = 3, seen = new Set()) {
  if (seen.has(rel) || depth < 0) return [];
  seen.add(rel);
  const text = tree.codeKind(rel) === 'none' ? tree.read(rel) : tree.code(rel);
  const out = [];
  for (const m of String(text ?? '').matchAll(SCRIPT_TOKEN)) {
    if (tree.read(m[1]) === null) continue;
    if (/\.sh$/.test(m[1])) out.push(...shellScriptRefs(tree, m[1], depth - 1, seen));
    else out.push(m[1]);
  }
  return out;
}

/** What one service starts: { kind: 'default-cmd' | 'web' | 'sweeper' | 'other' | 'unclassified', via? }. */
function classifyCommand(tree, svc, entries) {
  const cmd = `${svc.command} ${svc.entrypoint}`.trim();
  if (cmd === '') return { kind: 'default-cmd' };
  if (entries.entrypointRunsServer && /entrypoint\.sh|server\.js/.test(cmd)) return { kind: 'web', via: 'the web app process' };
  const scripts = [];
  for (const m of cmd.matchAll(SCRIPT_TOKEN)) if (tree.read(m[1]) !== null) scripts.push(m[1]);
  if (scripts.length === 0) return { kind: 'unclassified' };
  // a script runs the sweep when it, or anything it imports (or any script a shell script runs), reaches a file that calls or defines it
  for (const sc of scripts) {
    const starts = /\.sh$/.test(sc) ? shellScriptRefs(tree, sc) : [sc];
    for (const st of starts) {
      if (entries.scripts.includes(st) || [...entries.closure(st)].some((x) => entries.sinks.has(x))) return { kind: 'sweeper', via: `script ${st}` };
    }
  }
  return { kind: 'other' };
}

/**
 * Sort the services of a compose model: { runners: [{ name, via }], hasWeb, unclassified: [name] }.
 * A service that shares the application image and starts nothing of its own runs the image default command
 * (the Next server), so the web service is recognised without reading any command text. A service on the
 * application image whose command is neither the server nor a repo script this check can read is
 * UNCLASSIFIED: whether it sweeps is unknown, and unknown is never treated as "no".
 */
function classifyServices(tree, model, entries) {
  const base = new Map();
  for (const [name, svc] of model.services) base.set(name, classifyCommand(tree, svc, entries));
  const appImages = new Set();
  for (const [name, svc] of model.services) {
    const k = base.get(name).kind;
    if (svc.image && (k === 'web' || k === 'sweeper' || k === 'other')) appImages.add(svc.image);
  }
  const runners = [];
  const unclassified = [];
  let hasWeb = false;
  for (const [name, svc] of model.services) {
    let c = base.get(name);
    const onAppImage = Boolean(svc.image) && appImages.has(svc.image);
    if (c.kind === 'default-cmd') c = onAppImage ? { kind: 'web', via: 'the image default command (node server.js)' } : { kind: 'foreign' };
    if (c.kind === 'web') {
      if (entries.webHosted) { runners.push({ name, via: c.via }); hasWeb = true; }
    } else if (c.kind === 'sweeper') runners.push({ name, via: c.via });
    else if (c.kind === 'unclassified' && onAppImage) unclassified.push(name);
  }
  return { runners, hasWeb, unclassified };
}

/** The mount that provides `root` inside a service: the longest target that is root or one of its parents. */
function mountFor(svc, root) {
  let best = null;
  for (const m of svc.mounts) {
    const t = normPath(m.target);
    if (t === root || root.startsWith(`${t}/`)) if (!best || t.length > normPath(best.target).length) best = m;
  }
  return best;
}

const mountKey = (m) => `${m.kind} ${m.source} at ${normPath(m.target)}`;

/**
 * Parity of the vault mount across the services that run the sweep: { bad[], ok[], state[], unknown[] }.
 * Each runner is judged at ITS OWN root (rootOf may be a string or name -> { root, why }); the roots must also
 * agree. One runner has nothing to be in parity WITH, so by default it is reported and not failed here; with
 * strictSingle (the production compose) a lone runner that mounts nothing at its root is a violation too,
 * because the sweep then looks at a directory that is image-local while the files live elsewhere.
 */
function vaultParity(model, runners, rootOf, { strictSingle = false } = {}) {
  const bad = [];
  const ok = [];
  const state = [];
  const unknown = [];
  const rootFn = typeof rootOf === 'function' ? rootOf : () => ({ root: rootOf });
  const roots = new Map();
  for (const r of runners) {
    const x = rootFn(r.name);
    if (!x.root) unknown.push(`${r.name} ${x.why}, so where its sweep looks cannot be established`);
    else roots.set(r.name, x.root);
  }
  if (unknown.length > 0) return { bad, ok, state, unknown };
  const distinctRoots = new Set(roots.values());
  if (distinctRoots.size > 1) bad.push(`the services that run the sweep use different vault roots: ${[...roots.entries()].map(([n, r]) => `${n} (${r})`).join('; ')}`);
  if (runners.length === 1 && !strictSingle) {
    const root = roots.get(runners[0].name);
    const m = mountFor(model.services.get(runners[0].name), root);
    state.push(`only ${runners[0].name} runs the sweep, so mount parity holds trivially (${m ? `it mounts ${mountKey(m)}` : 'its vault root is image-local there'})`);
    return { bad, ok, state, unknown };
  }
  const keys = new Map();
  for (const r of runners) {
    const root = roots.get(r.name);
    const m = mountFor(model.services.get(r.name), root);
    if (!m) { bad.push(`${r.name} runs the sweep (via ${r.via}) but mounts nothing at ${root}, so it sees the image-local directory`); continue; }
    if (m.readOnly) { bad.push(`${r.name} mounts the vault read-only, but the sweep must unlink files`); continue; }
    keys.set(r.name, mountKey(m));
  }
  const distinct = new Set(keys.values());
  if (distinct.size > 1) bad.push(`the services that run the sweep mount different vaults: ${[...keys.entries()].map(([n, k]) => `${n} (${k})`).join('; ')}`);
  else if (bad.length === 0 && distinct.size === 1) ok.push(`${runners.length} services run the sweep and all mount ${[...distinct][0]}`);
  return { bad, ok, state, unknown };
}

function sweepEntries(tree, rep) {
  const files = sourceFilesUnder(tree, ['app', 'lib', 'scripts'], rep);
  if (rep.inconclusive()) return null;
  const found = findCallers(tree, files, [SWEEP_FN], rep, () => true).get(SWEEP_FN);
  if (found.defs.length === 0) { rep.unknown(`no definition of ${SWEEP_FN} was found, so what runs the sweep cannot be established`); return null; }
  const scripts = found.callers.map((c) => c.rel).filter((r) => r.startsWith('scripts/'));
  const webHosted = found.callers.some((c) => c.rel.startsWith('app/'));
  const ep = tree.read(ENTRYPOINT);
  const entrypointRunsServer = ep !== null && /\bnode\s+server\.js\b/.test(tree.code(ENTRYPOINT) ?? '');
  if (webHosted && !entrypointRunsServer) {
    rep.unknown(`the web app calls the sweep in request, but ${ENTRYPOINT} was not recognised as starting the Next server, so which service hosts it cannot be established`);
    return null;
  }
  const reach = deployedReach(tree, files, () => true);
  return { scripts, webHosted, entrypointRunsServer, defs: found.defs, callers: found.callers, closure: reach.closure, sinks: new Set([...found.defs, ...found.callers.map((c) => c.rel)]) };
}

function sf15Check(tree) {
  const rep = report();
  const codeDefault = vaultRootDefault(tree, rep);
  const entries = sweepEntries(tree, rep);
  if (!codeDefault || !entries) return rep.done();
  rep.state(`the sweep is run by ${entries.scripts.length} script(s) (${entries.scripts.join(', ') || 'none'}) and, in request, by the web app (${entries.webHosted ? 'yes' : 'no'}); the vault root defaults to ${codeDefault}`);

  const files = tree.list('').filter((r) => COMPOSE_BASENAME.test(r.slice(r.lastIndexOf('/') + 1)) && ['docker-compose.production.yml', 'docker-compose.yml', 'docker-compose.staging.yml'].includes(r));
  if (!files.includes(COMPOSE_PROD)) { rep.unknown(`${COMPOSE_PROD} is missing, so the deployed services cannot be listed`); return rep.done(); }
  for (const rel of files) {
    const model = composeOf(tree, rel, rep);
    if (!model) continue;
    const cl = classifyServices(tree, model, entries);
    if (rel === COMPOSE_PROD) {
      // the deployed stack must be fully accounted for: a web service nobody could tie to the in-request sweep, or a service on
      // the application image that starts something this check cannot read, would drop out of the set and let parity pass vacuously
      if (entries.webHosted && !cl.hasWeb) rep.unknown(`${rel} has no service that this check can tie to the web app, which runs the sweep in request (UNKNOWN where it runs; a missing service is not a pass)`);
      for (const u of cl.unclassified) rep.unknown(`${rel}: ${u} shares the application image but starts something that is neither the server nor a repo script this check can read, so whether it runs the sweep is UNKNOWN`);
    }
    const runners = cl.runners;
    if (runners.length === 0) {
      if (rel === COMPOSE_PROD) rep.unknown(`${rel} has no service that this check can tie to the sweep (UNKNOWN where it runs; a vacuous parity is not a pass)`);
      else rep.ctx(`${rel}: no service names a sweep entry point or the server entry point, so what runs the sweep there is UNKNOWN from committed text`);
      continue;
    }
    const p = vaultParity(model, runners, (name) => serviceVaultRoot(model.services.get(name), codeDefault), { strictSingle: rel === COMPOSE_PROD });
    for (const u of p.unknown) rep.unknown(`${rel}: ${u}`);
    for (const b of p.bad) rep.bad(`${rel}: ${b}`);
    for (const o of p.ok) rep.ok(`${rel}: ${o}`);
    for (const x of p.state) rep.state(`${rel}: ${x}`);
  }
  if (rep.inconclusive()) return rep.done();

  // context: why a missing mount is not a loud failure
  const df = tree.read('Dockerfile') !== null && tree.codeKind('Dockerfile') === 'dockerfile' ? tree.code('Dockerfile') : null;
  if (df !== null && new RegExp(`mkdir\\s+-p[^\\n]*${esc(codeDefault)}\\b`).test(df)) rep.ctx(`Dockerfile creates ${codeDefault} in the shared image, so a container without the volume still has a resolvable, empty vault root`);
  const vf = sourceFacts(tree, FILE_VAULT);
  if (!vf.missing) {
    const d = topLevelFunctions(vf.bl).find((x) => x.name === 'destroyVaultBytes');
    if (d && /ENOENT/.test(vf.code.slice(d.open, d.close)) && /\bdurablyConfirmVaultAbsence\s*\(/.test(vf.bl.slice(d.open, d.close))) rep.ctx('destroyVaultBytes treats an absent file under a resolvable root as erased, so a worker without the volume can clear a queue row while the real bytes remain');
  }
  rep.ctx('compose is read as COMMITTED: the live stack adds git-absent overrides and a FILE_STORAGE_PATH in an uncommitted .env.production cannot be seen here; each service is judged at the root its own committed environment sets');
  rep.ctx(`${ENTRYPOINT} ${entries.entrypointRunsServer ? 'starts the Next server, so the web service is a sweep runner in request' : 'was not recognised as starting the server'}`);
  return rep.done();
}

const MEDIA_COMPOSE_ANCHOR = /(command: \["npx", "tsx", "scripts\/run-media-worker\.ts"\]\s+volumes:\s+- media_data:\/app\/data\/media)/;
const addWorkerMount = (line) => (t) => t.replace(COMPOSE_PROD, MEDIA_COMPOSE_ANCHOR, `$1\n      ${line}`);

const WEB_REPLICA_ANCHOR = '      - maia-public     # Caddy -> livekit:7880 (signaling WS only)\n';
const addWebReplica = (t) => t.replace(COMPOSE_PROD, WEB_REPLICA_ANCHOR, `${WEB_REPLICA_ANCHOR}\n  maia-web2:\n    build: *maia_build\n    image: *maia_image\n    env_file:\n      - .env.production\n`);
const MEDIA_COMMAND = 'command: ["npx", "tsx", "scripts/run-media-worker.ts"]';
const COMMS_COMMAND = 'command: ["npx", "tsx", "scripts/run-comms-analysis-worker.ts"]';
const MAIA_VAULT_MOUNT = '      - vault_data:/app/data/vault\n';
const withVaultRoot = (root, who) => (t) => t.replace(COMPOSE_PROD, who === 'maia' ? '      PORT: "3000"\n' : '      MEDIA_STORAGE_PATH: "/app/data/media"\n', `${who === 'maia' ? '      PORT: "3000"\n' : '      MEDIA_STORAGE_PATH: "/app/data/media"\n'}      FILE_STORAGE_PATH: "${root}"\n`);
const SF15 = {
  id: 'SF-15',
  title: 'Worker mount parity',
  law: 'Every service that runs the vault erasure sweep mounts the same vault volume at the same path.',
  obligations: ['WSI-27', 'FILL-6a'],
  claims: ['C22'],
  kind: 'law',
  expectedToday: 'RED',
  whyExpected: 'What runs the sweep, read from the code: sweepVaultErasureQueue is called in request by the living-works routes (and inline by eraseManuscript), and from the poll loop of scripts/run-media-worker.ts (every VAULT_ERASURE_EVERY_N_LOOPS loops), the command of maia-media-worker; scripts/ops/sweep-vault-erasure-queue.ts is an operator script that no compose service runs. The default vault root is /app/data/vault (fileVault.ts). In docker-compose.production.yml the maia service mounts vault_data there and maia-media-worker mounts only media_data at /app/data/media, so the worker sweeps an image-local directory the Dockerfile creates empty; destroyVaultBytes then treats the absent file as already erased. That is a committed-text finding only: the live stack uses git-absent overrides and an uncommitted .env.production (a FILE_STORAGE_PATH there would change the root), none of which this check can read. The dev and staging compose files each have one web service, where parity holds trivially. Each runner is judged at the root its OWN committed environment sets (FILE_STORAGE_PATH, else the code default), and the roots must agree. The web service is recognised without reading command text (it is the service on the application image that starts nothing of its own, or starts the server), a script runs the sweep when its imports reach a file that calls or defines it, and a service on the application image that starts something this check cannot read makes the production verdict INCONCLUSIVE; a lone runner with no mount at its root is a violation in the production compose. Caveat on fixes: the law is also satisfied by stopping the worker from sweeping, which would remove the independent consumer WS-DELETE-01 requires; that is another obligation, not this one.',
  rulingPending: null,
  check: sf15Check,
  defeats: [
    defeat('FIX: the media worker mounts vault_data at /app/data/vault, like maia', 'fix', 'GREEN', addWorkerMount('- vault_data:/app/data/vault')),
    defeat('FIX: the same volume and path written in long form also counts', 'fix', 'GREEN', addWorkerMount('- type: volume\n        source: vault_data\n        target: /app/data/vault')),
    defeat('FIX: the vault root moves in the code and both services mount the volume at the new path (the root is read from the code, not assumed)', 'fix', 'GREEN',
      (t) => t.replace(FILE_VAULT, "process.env.FILE_STORAGE_PATH || '/app/data/vault'", "process.env.FILE_STORAGE_PATH || '/srv/vault'")
        .replace(COMPOSE_PROD, '- vault_data:/app/data/vault\n', '- vault_data:/srv/vault\n')
        .replace(COMPOSE_PROD, MEDIA_COMPOSE_ANCHOR, '$1\n      - vault_data:/srv/vault')),
    defeat('WRONG FIX: the vault root moves in the code but neither service mount follows, so nobody mounts the new root', 'fix', 'RED',
      (t) => t.replace(FILE_VAULT, "process.env.FILE_STORAGE_PATH || '/app/data/vault'", "process.env.FILE_STORAGE_PATH || '/srv/vault'"), 'mounts nothing at /srv/vault'),
    defeat('WRONG FIX: the right volume at the wrong path leaves /app/data/vault image-local', 'fix', 'RED', addWorkerMount('- vault_data:/data/vault'), 'mounts nothing at'),
    defeat('WRONG FIX: the right path with the wrong volume (the media volume) is not the same vault', 'fix', 'RED', addWorkerMount('- media_data:/app/data/vault'), 'different vaults'),
    defeat('WRONG FIX: the vault is mounted read-only, but the sweep must unlink', 'fix', 'RED', addWorkerMount('- vault_data:/app/data/vault:ro'), 'read-only'),
    defeat('WRONG FIX: SUBTLE the mount is written only as a comment line', 'fix', 'RED', addWorkerMount('# - vault_data:/app/data/vault'), 'mounts nothing at'),
    defeat('WRONG FIX: SUBTLE the mount is added to a different service (maia-api) and the worker still lacks it', 'fix', 'RED',
      (t) => t.replace(COMPOSE_PROD, /(container_name: maia-api\b)/, '$1\n    volumes:\n      - vault_data:/app/data/vault'), 'maia-media-worker runs the sweep'),
    defeat('FIX: the root moves to /srv/vault in each service environment and both mount the volume there', 'fix', 'GREEN',
      (t) => withVaultRoot('/srv/vault', 'worker')(withVaultRoot('/srv/vault', 'maia')(t.replace(COMPOSE_PROD, MAIA_VAULT_MOUNT, '      - vault_data:/srv/vault\n').replace(COMPOSE_PROD, MEDIA_COMPOSE_ANCHOR, '$1\n      - vault_data:/srv/vault')))),
    defeat('FIX: the worker stops sweeping (it runs another repo script) and maia keeps its vault mount: a lone runner is in parity with itself', 'fix', 'GREEN',
      (t) => t.replace(COMPOSE_PROD, MEDIA_COMMAND, COMMS_COMMAND)),
    defeat('WRONG FIX: maia moves its root to a path nothing mounts while the worker mounts the default root', 'fix', 'RED',
      (t) => withVaultRoot('/srv/other', 'maia')(addWorkerMount('- vault_data:/app/data/vault')(t)), 'maia runs the sweep (via the web app process) but mounts nothing at /srv/other'),
    defeat('WRONG FIX: both mount the same volume but at different roots (maia moves to /srv/vault, the worker keeps the default)', 'fix', 'RED',
      (t) => withVaultRoot('/srv/vault', 'maia')(addWorkerMount('- vault_data:/app/data/vault')(t.replace(COMPOSE_PROD, MAIA_VAULT_MOUNT, '      - vault_data:/srv/vault\n'))), 'different vault roots'),
    defeat('WRONG FIX: the worker is fixed but a second web replica on the application image, with no command at all, mounts nothing', 'fix', 'RED',
      (t) => addWebReplica(addWorkerMount('- vault_data:/app/data/vault')(t)), 'maia-web2 runs the sweep'),
    defeat('WRONG FIX: the worker stops sweeping and maia drops its vault mount, so the lone runner sweeps an image-local directory', 'fix', 'RED',
      (t) => t.replace(COMPOSE_PROD, MEDIA_COMMAND, COMMS_COMMAND).replace(COMPOSE_PROD, MAIA_VAULT_MOUNT, ''), 'maia runs the sweep'),
  ],
  decoys: [
    defeat('DECOY: an unrelated mount on the worker (a host log directory) changes nothing about the vault', 'fix', 'RED', addWorkerMount('- ./logs:/app/logs'), 'mounts nothing at'),
  ],
};

// ---- SF-16a ----------------------------------------------------------------------------------------

const AWS_STATIC_NAMES = Object.freeze(['AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY', 'AWS_SESSION_TOKEN']);
/** The shape of an access key id, assembled here so no key-shaped literal is committed. */
const KEY_ID_SHAPE = new RegExp(`\\b(?:${'A'}${'KIA'}|${'A'}${'SIA'})[0-9A-Z]{16}\\b`);
/** A fictional key-id-shaped value, generated at run time, never committed. */
const fakeKeyId = () => `${'A'}${'KIA'}${randomBytes(8).toString('hex').toUpperCase()}`;
const fakeSecret = () => randomBytes(18).toString('base64').replace(/[^A-Za-z0-9]/g, 'x');

/** .env.example and its relatives: env.example, .env.docker.template, name.env.sample, example.env. */
const ENV_EXAMPLE_RE = /^(?:\.?env(?:\.[^/]*)?|[^/]+\.env)\.(?:example|sample|template)$|^(?:example|sample|template)\.env$/i;
/** Dockerfile, Dockerfile.x, name.Dockerfile, Containerfile and Containerfile.x. */
const DOCKERFILE_RE = /^(?:Dockerfile(?:\.[^/]*)?|[^/]+\.Dockerfile|Containerfile(?:\.[^/]*)?)$/i;
/**
 * A 40-character value in the base64 alphabet with an upper-case letter, a lower-case letter and a digit: the
 * shape of an AWS secret access key, whatever the variable is called. A git SHA (hex, no upper case), a digest
 * (64 hex) and a word are not that shape.
 */
const SECRET_SHAPE = /(?<![A-Za-z0-9/+=_-])[A-Za-z0-9/+]{40}(?![A-Za-z0-9/+=_-])/g;
const looksLikeSecret = (tok) => /[A-Z]/.test(tok) && /[a-z]/.test(tok) && /[0-9]/.test(tok);
/** A fictional 40-character secret-shaped value, generated at run time, never committed. */
const fakeSecret40 = () => {
  for (;;) {
    const t = randomBytes(36).toString('base64').replace(/=+$/, '').slice(0, 40);
    if (t.length === 40 && looksLikeSecret(t) && !t.includes('/') && !t.includes('+')) return t;
  }
};

/** Committed compose files, Dockerfiles and env examples: { files: [{rel, group}], skipped }. */
function credentialSurfaces(tree) {
  const files = [];
  let skipped = 0;
  for (const rel of tree.list('')) {
    const base = rel.slice(rel.lastIndexOf('/') + 1);
    const group = COMPOSE_BASENAME.test(base) ? 'compose' : DOCKERFILE_RE.test(base) ? 'Dockerfile' : ENV_EXAMPLE_RE.test(base) ? 'env example' : null;
    if (!group) continue;
    if (tree.codeKind(rel) === 'none' && group !== 'env example') continue;
    const st = tree.trackingState(rel);
    if (st === 'untracked' || st === 'ignored') { skipped++; continue; }
    files.push({ rel, group });
  }
  return { files, skipped };
}

/** Text of a credential surface with its comments gone. An env example the dotenv stripper does not recognise by name (env.example) loses its full-line comments here. */
function surfaceText(tree, rel, group, rep) {
  if (tree.codeKind(rel) !== 'none') return strictCode(tree, rel, rep);
  if (group !== 'env example') { rep.unknown(`${rel} has no comment stripper; a scan would match comments`); return null; }
  const raw = tree.read(rel);
  if (raw === null) { rep.unknown(`${rel} is missing, so the law cannot be established there`); return null; }
  return raw.split('\n').map((l) => (/^\s*#/.test(l) ? '' : l)).join('\n');
}

function sf16aCheck(tree) {
  const rep = report();
  const { files, skipped } = credentialSurfaces(tree);
  const counts = { compose: 0, Dockerfile: 0, 'env example': 0 };
  for (const g of Object.keys(counts)) counts[g] = files.filter((f) => f.group === g).length;
  for (const g of Object.keys(counts)) if (counts[g] === 0) rep.unknown(`no committed ${g} file was found, so the scan would be vacuous for that group`);
  if (rep.inconclusive()) return rep.done();
  for (const { rel, group } of files) {
    const code = surfaceText(tree, rel, group, rep);
    if (code === null) continue;
    const lines = code.split('\n');
    lines.forEach((ln, i) => {
      for (const name of AWS_STATIC_NAMES) {
        if (new RegExp(`\\b${name}\\b`).test(ln)) {
          const valued = new RegExp(`\\b${name}\\b\\s*[:=]\\s*\\S`).test(ln);
          rep.bad(`${rel}:${i + 1} names ${name} ${valued ? 'with a value' : 'without a value (a pass-through or empty entry is still the environment channel)'}`);
        }
      }
      if (KEY_ID_SHAPE.test(ln)) rep.bad(`${rel}:${i + 1} carries a value shaped like an AWS access key id`);
      if ([...ln.matchAll(SECRET_SHAPE)].some((m) => looksLikeSecret(m[0]))) rep.bad(`${rel}:${i + 1} carries a 40-character value shaped like an AWS secret access key (whatever the variable is called)`);
    });
  }
  if (rep.inconclusive()) return rep.done();
  if (rep.violations() === 0) rep.ok(`scanned ${counts.compose} compose, ${counts.Dockerfile} Dockerfile and ${counts['env example']} env-example files: none names a static AWS credential variable or carries a key-id-shaped or secret-key-shaped value`);
  if (skipped > 0) rep.ctx(`${skipped} matching file(s) are untracked or ignored on this machine and were skipped: this law is about what is committed`);
  rep.ctx('comment-only lines are removed by the stripper first; AWS_SHARED_CREDENTIALS_FILE (a path) is not a credential and is not matched');
  return rep.done();
}

const PORT_LINE = '      PORT: "3000"\n';
const withMaiaEnv = (line) => (t) => t.replace(COMPOSE_PROD, PORT_LINE, `${PORT_LINE}      ${line}\n`);

const SF16A = {
  id: 'SF-16a',
  title: 'No static AWS credential committed',
  law: 'No static AWS credential is committed in compose, a Dockerfile or an env example.',
  obligations: ['WSI-03', 'FILL-6b'],
  claims: ['C05'],
  kind: 'law',
  expectedToday: 'GREEN',
  whyExpected: 'Searched every tracked compose file, Dockerfile and env example (7, 30 and 4 of them at c051385b, all tracked) for AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_SESSION_TOKEN and for an access-key-id-shaped value: none. The only AWS variable the plan mentions, AWS_SHARED_CREDENTIALS_FILE, appears only in the runbook. A name-only entry (a pass-through such as a bare variable name) counts as a violation on purpose: it is the environment channel the runbook forbids, even though it commits no value. Untracked or ignored files on the machine (a git-absent override, a real .env) are skipped, because the law is about what is committed. The surfaces include the Compose-spec default names (compose.yaml), name.Dockerfile and env.example, and a 40-character value in the base64 alphabet with a capital letter, a lower-case letter and a digit counts as a secret access key under ANY variable name (a git SHA does not).',
  rulingPending: null,
  check: sf16aCheck,
  defeats: [
    defeat('BREAK: a literal access key id is set in the maia service environment', 'break', 'RED', (t) => withMaiaEnv(`AWS_ACCESS_KEY_ID: ${fakeKeyId()}`)(t), 'AWS_ACCESS_KEY_ID'),
    defeat('BREAK: a secret access key is baked into the image with ENV', 'break', 'RED', (t) => t.replace('Dockerfile', 'USER node\nEXPOSE 3000', `ENV AWS_SECRET_ACCESS_KEY=${fakeSecret()}\nUSER node\nEXPOSE 3000`), 'AWS_SECRET_ACCESS_KEY'),
    defeat('BREAK: an env example documents the key pair', 'break', 'RED', (t) => t.edit('.env.example', (s) => `${s}\nAWS_ACCESS_KEY_ID=${fakeKeyId()}\n`), 'AWS_ACCESS_KEY_ID'),
    defeat('BREAK: SUBTLE a key-id-shaped value under an unrelated variable name', 'break', 'RED', (t) => withMaiaEnv(`WRITER_SOURCE_BACKUP_USER: ${fakeKeyId()}`)(t), 'shaped like an AWS access key id'),
    defeat('BREAK: SUBTLE a bare pass-through name with no value is still the environment channel', 'break', 'RED', (t) => withMaiaEnv('AWS_SESSION_TOKEN:')(t), 'without a value'),
    defeat('BREAK: a key id in a Compose-spec default file (compose.yaml)', 'break', 'RED',
      (t) => t.add('compose.yaml', `services:\n  a:\n    image: x\n    environment:\n      X: ${fakeKeyId()}\n`), 'compose.yaml'),
    defeat('BREAK: a key id in a Dockerfile named like web.Dockerfile', 'break', 'RED',
      (t) => t.add('web.Dockerfile', `FROM scratch\nENV X=${fakeKeyId()}\n`), 'web.Dockerfile'),
    defeat('BREAK: a key id in env.example (no leading dot)', 'break', 'RED',
      (t) => t.add('env.example', `X=${fakeKeyId()}\n`), 'env.example'),
    defeat('BREAK: SUBTLE a 40-character secret under a neutral variable name in the production compose', 'break', 'RED',
      (t) => withMaiaEnv(`BACKUP_UPLOADER_VALUE: "${fakeSecret40()}"`)(t), 'shaped like an AWS secret access key'),
  ],
  decoys: [
    defeat('DECOY: a 40-character git SHA (hex, no capital letters) is not a secret', 'break', 'GREEN', (t) => withMaiaEnv(`BUILD_REF: "${randomBytes(20).toString('hex')}"`)(t)),
    defeat('DECOY: a 40-character identifier with no digit is not a secret', 'break', 'GREEN', (t) => withMaiaEnv(`SERVICE_LABEL: "${'Ab'.repeat(20)}"`)(t)),
    defeat('DECOY: a commented-out key line in compose is not committed configuration', 'break', 'GREEN', (t) => t.replace(COMPOSE_PROD, PORT_LINE, `${PORT_LINE}      # AWS_ACCESS_KEY_ID: removed, use the credential file\n`)),
    defeat('DECOY: a commented-out example in the env example file is not a value', 'break', 'GREEN', (t) => t.edit('.env.example', (s) => `${s}\n# AWS_SECRET_ACCESS_KEY=never put a key here\n`)),
    defeat('DECOY: the path variable for the credential file is not a credential', 'break', 'GREEN', (t) => withMaiaEnv('AWS_SHARED_CREDENTIALS_FILE: "/run/secrets/aws_credentials"')(t)),
  ],
};

// ---- SF-16b ----------------------------------------------------------------------------------------

const CRED_VAR = 'AWS_SHARED_CREDENTIALS_FILE';
/** An env_file path that names an AWS credential file. */
const CREDENTIAL_NAMED = /aws|credential/i;

/** How one service stands on the credential channel: { hasVar, path, mount, staticVars[], problems[] }. */
function credentialChannel(svc) {
  const path0 = svc.env.get(CRED_VAR);
  const hasVar = svc.env.has(CRED_VAR);
  const staticVars = AWS_STATIC_NAMES.filter((n) => svc.env.has(n));
  const filePath = typeof path0 === 'string' && path0.startsWith('/') && !path0.includes('${') ? normPath(path0) : null;
  const mount = filePath ? svc.mounts.find((m) => normPath(m.target) === filePath) ?? null : null;
  const touchedByMount = svc.mounts.some((m) => /aws|credential/i.test(m.target) || /aws/i.test(m.source));
  const problems = [];
  if (!hasVar) problems.push(`${CRED_VAR} is not set`);
  else if (!filePath) problems.push(`${CRED_VAR} is not an absolute literal path`);
  if (filePath && !mount) problems.push(`no mount provides ${filePath}`);
  if (mount) {
    if (mount.kind !== 'bind' || !mount.source.startsWith('/') || mount.source.endsWith('/')) problems.push('the credential is not a bind mount of a single host file');
    if (!mount.readOnly) problems.push('the credential mount is not read-only');
    if (mount.createHostPath !== 'false') problems.push('the credential mount does not set create_host_path false, so a missing host file would be created as a directory and the SDK could fall back to another credential source');
  }
  return { hasVar, filePath, mount, staticVars, problems, touched: hasVar || Boolean(mount) || staticVars.length > 0 || touchedByMount };
}

function sf16bCheck(tree) {
  const rep = report();
  const model = composeOf(tree, COMPOSE_PROD, rep);
  if (!model) return rep.done();
  const owner = 'maia';
  if (!model.services.has(owner)) { rep.unknown(`${COMPOSE_PROD} has no ${owner} service`); return rep.done(); }
  const touched = [];
  for (const [name, svc] of model.services) {
    const ch = credentialChannel(svc);
    if (ch.staticVars.length > 0) rep.bad(`${COMPOSE_PROD}: ${name} sets ${ch.staticVars.join(', ')} in its environment (the environment channel, never allowed)`);
    if (name === owner) {
      for (const p of ch.problems) rep.bad(`${COMPOSE_PROD}: ${owner} ${p}`);
      if (ch.problems.length === 0) rep.ok(`${COMPOSE_PROD}: ${owner} gets the credential as a read-only host-file bind through ${CRED_VAR}, with a loud failure when the file is missing`);
    } else if (ch.touched && ch.staticVars.length === 0) {
      touched.push(name);
    }
  }
  if (touched.length > 0) rep.bad(`${COMPOSE_PROD}: the credential channel also reaches ${touched.length} other service(s): ${touched.join(', ')}`);
  else rep.ok(`${COMPOSE_PROD}: no service other than ${owner} carries the credential variable or mount`);
  // the env_file channel: a credential file listed as an env_file on ANY service puts the credential in the environment of that service
  for (const [name, svc] of model.services) {
    for (const ef of svc.envFiles.filter((x) => CREDENTIAL_NAMED.test(x))) rep.bad(`${COMPOSE_PROD}: ${name} reads env_file ${ef}, which is named as an AWS credential file (the env_file channel, never allowed)`);
  }
  // the shared image: a credential copied or pointed at in a Dockerfile reaches every service built from it
  const built = new Set();
  let unreadable = 0;
  for (const [, svc] of model.services) {
    if (!svc.build) continue;
    const ctx = svc.build.context.startsWith('${') || svc.build.context === '.' || svc.build.context === './' ? '' : svc.build.context;
    const rel = path.posix.normalize(path.posix.join(ctx, svc.build.dockerfile));
    if (rel.startsWith('..') || rel.startsWith('/') || tree.read(rel) === null || tree.codeKind(rel) === 'none') { unreadable++; continue; }
    built.add(rel);
  }
  for (const rel of [...built].sort()) {
    const code = tree.code(rel) ?? '';
    code.split('\n').forEach((ln, i) => {
      if (/^\s*(?:COPY|ADD)\b/i.test(ln) && /\.aws\b|\baws[-_.]?cred|\bcredentials?\b/i.test(ln)) rep.bad(`${rel}:${i + 1} copies a credential file into the image, so every service built from it carries the credential`);
      if (/^\s*(?:ENV|ARG)\b/i.test(ln) && /\bAWS_(?:SHARED_CREDENTIALS_FILE|CONFIG_FILE|WEB_IDENTITY_TOKEN_FILE|CONTAINER_CREDENTIALS_\w+)\b/.test(ln)) rep.bad(`${rel}:${i + 1} sets an AWS credential-source variable in the image, so every service built from it inherits it`);
    });
  }
  if (built.size === 0) rep.unknown(`${COMPOSE_PROD} names no Dockerfile this check can read, so the shared image cannot be inspected for a credential`);
  else rep.ok(`${built.size} Dockerfile(s) built by ${COMPOSE_PROD} copy no credential file and set no credential-source variable${unreadable ? `; ${unreadable} service build(s) point at a Dockerfile this check cannot read` : ''}`);
  const shared = [...model.services].filter(([, s]) => s.envFiles.some((f) => /\.env\.production$/.test(f))).length;
  rep.ctx(`${shared} of ${model.services.size} services read env_file .env.production, which is not committed: a credential placed there would reach all of them and cannot be seen from the repository`);
  rep.ctx('the owner-only file mode and the container uid are host facts that compose cannot express; they belong to the host preflight (WSI-03), not to this text check');
  return rep.done();
}

const SMTP_ENV = '      SMTP_PASSWORD_FILE: "/run/secrets/smtp_password"\n';
const SMTP_BIND = /(target: \/run\/secrets\/smtp_password\n\s+read_only: true\n\s+bind:\n\s+create_host_path: false\n)/;
const awsMountBlock = ({ kind = 'bind', readOnly = true, createHost = false, source = '/home/soullab/.config/soullab-aws/writer-source.credentials' } = {}) =>
  `      - type: ${kind}\n        source: ${source}\n        target: /run/secrets/aws_credentials\n${readOnly ? '        read_only: true\n' : ''}${kind === 'bind' ? `        bind:\n          create_host_path: ${createHost}\n` : ''}`;
/** Add the credential variable and/or mount to the maia service only. */
const awsForMaia = ({ env = true, mount = true, ...mountOpts } = {}) => (t) => {
  let r = t;
  if (env) r = r.replace(COMPOSE_PROD, SMTP_ENV, `${SMTP_ENV}      ${CRED_VAR}: "/run/secrets/aws_credentials"\n`);
  if (mount) r = r.replace(COMPOSE_PROD, SMTP_BIND, `$1${awsMountBlock(mountOpts)}`);
  return r;
};

const SF16B = {
  id: 'SF-16b',
  title: 'Credential channel reaches only maia, as a file',
  law: 'The AWS credential reaches only the maia service, as an owner-only file via AWS_SHARED_CREDENTIALS_FILE, never as an env_file value.',
  obligations: ['WSI-03', 'FILL-6b'],
  claims: ['C05'],
  kind: 'law',
  expectedToday: 'RED',
  whyExpected: 'Expected RED because the runbook step that adds the channel is not done: the committed maia service sets no AWS_SHARED_CREDENTIALS_FILE and mounts no AWS credential (its only secret bind is the SMTP token, which is the house precedent the fix copies). No other service carries a credential channel and no service sets a static AWS key, so the part of the law about not widening it holds today and would have to stay true. Read as committed text: the live stack adds git-absent overrides, and .env.production is not committed, so "never as an env_file value" is checked only for what compose itself declares; fourteen services read that file (counted at c051385b), which the evidence reports without being able to see inside it. Owner-only mode is a host property and is left to the host preflight. The env_file channel is checked on every service (a credential file listed there reaches the whole environment of that service) and so are the Dockerfiles the production compose builds (a credential copied into the shared image, or an AWS credential-source variable set in it, reaches every service built from it).',
  rulingPending: 'runbook step 2',
  check: sf16bCheck,
  defeats: [
    defeat('FIX: maia alone gets AWS_SHARED_CREDENTIALS_FILE and a read-only host-file bind with create_host_path false', 'fix', 'GREEN', awsForMaia()),
    defeat('WRONG FIX: the credential is added through a shared anchor to maia and to the media worker as well', 'fix', 'RED',
      (t) => t
        .replace(COMPOSE_PROD, '\nservices:\n', `\nx-aws-credential: &aws_credential_mount\n  type: bind\n  source: /home/soullab/.config/soullab-aws/writer-source.credentials\n  target: /run/secrets/aws_credentials\n  read_only: true\n  bind:\n    create_host_path: false\nx-aws-env: &aws_env\n  ${CRED_VAR}: "/run/secrets/aws_credentials"\n\nservices:\n`)
        .replace(COMPOSE_PROD, SMTP_ENV, `${SMTP_ENV}      <<: *aws_env\n`)
        .replace(COMPOSE_PROD, SMTP_BIND, '$1      - *aws_credential_mount\n')
        .replace(COMPOSE_PROD, MEDIA_COMPOSE_ANCHOR, '$1\n      - *aws_credential_mount')
        .replace(COMPOSE_PROD, /(MEDIA_STORAGE_PATH: "\/app\/data\/media"\n)/, '$1      <<: *aws_env\n'), 'also reaches'),
    defeat('WRONG FIX: the static key pair is placed in the maia environment instead of a file', 'fix', 'RED',
      (t) => t.replace(COMPOSE_PROD, PORT_LINE, `${PORT_LINE}      AWS_ACCESS_KEY_ID: ${fakeKeyId()}\n      AWS_SECRET_ACCESS_KEY: ${fakeSecret()}\n`), 'environment channel'),
    defeat('WRONG FIX: the variable is set but no mount provides the file', 'fix', 'RED', awsForMaia({ mount: false }), 'no mount provides'),
    defeat('WRONG FIX: the mount is added but the variable is not set, so the SDK never reads it', 'fix', 'RED', awsForMaia({ env: false }), 'is not set'),
    defeat('WRONG FIX: a named volume is used instead of a host file', 'fix', 'RED', awsForMaia({ kind: 'volume', source: 'aws_credentials' }), 'single host file'),
    defeat('WRONG FIX: the credential mount is writable', 'fix', 'RED', awsForMaia({ readOnly: false }), 'not read-only'),
    defeat('WRONG FIX: create_host_path is left true, so a missing file becomes a directory', 'fix', 'RED', awsForMaia({ createHost: true }), 'create_host_path'),
    defeat('WRONG FIX: SUBTLE the whole channel is written as comments', 'fix', 'RED',
      (t) => t.replace(COMPOSE_PROD, SMTP_ENV, `${SMTP_ENV}      # ${CRED_VAR}: "/run/secrets/aws_credentials"\n`), 'is not set'),
    defeat('WRONG FIX: maia gets the channel but the Dockerfile copies a credential file into the shared image', 'fix', 'RED',
      (t) => awsForMaia()(t).replace('Dockerfile', 'USER node\nEXPOSE 3000', 'COPY .aws/credentials /home/node/.aws/credentials\nUSER node\nEXPOSE 3000'), 'copies a credential file into the image'),
    defeat('WRONG FIX: maia gets the channel but the Dockerfile sets the credential-file variable for every service', 'fix', 'RED',
      (t) => awsForMaia()(t).replace('Dockerfile', 'USER node\nEXPOSE 3000', `ENV ${CRED_VAR}=/home/node/.aws/credentials\nUSER node\nEXPOSE 3000`), 'credential-source variable'),
    defeat('WRONG FIX: maia gets the channel but the media worker also reads an AWS credential env_file', 'fix', 'RED',
      (t) => awsForMaia()(t).replace(COMPOSE_PROD, '    env_file:\n      - .env.production\n\n    environment:\n      NODE_ENV: production\n      MEDIA_STORAGE_PATH', '    env_file:\n      - .env.production\n      - .env.aws\n\n    environment:\n      NODE_ENV: production\n      MEDIA_STORAGE_PATH'), 'reads env_file .env.aws'),
  ],
  decoys: [
    defeat('DECOY: a comment above the SMTP bind that mentions the AWS credential changes nothing', 'fix', 'RED', (t) => t.replace(COMPOSE_PROD, SMTP_ENV, `      # AWS credential: mount it exactly like the SMTP token\n${SMTP_ENV}`), 'is not set'),
  ],
};

// =====================================================================================================
// 7. THE FALSIFIERS, PART THREE: SF-17 Delete Work copy, SF-18 hold-pin inventory, SF-19 local-test provider
// =====================================================================================================

// ---- SF-17 -----------------------------------------------------------------------------------------

const COPY_SCOPE_DIRS = Object.freeze(['lib/writersStudio', 'app/writers-studio', 'app/dev/writers-studio-pc3-live']);
/** Shared component directories: a claim there counts when its own text is about the Work, so a pasted copy cannot hide outside the scope above. */
const COPY_SCOPE_TOPICAL_DIRS = Object.freeze(['components']);
const WORK_TOPIC = /\b(?:works?|manuscripts?|writings?|original\s+files?|drafts?|sections?)\b/i;

/**
 * The sentences that tell a member that nothing of theirs is kept after Delete, in the families they come in:
 * nothing kept / nothing left / no copy; no archive; permanently deletes; erased, wiped, destroyed; deleted
 * for good; cannot be recovered. Imperative button labels (Delete permanently) are actions, not statements
 * about what is kept, and are not claims; plain irreversibility ("cannot be undone") is not a claim about
 * what remains; a statement of INTENT qualified with "on purpose" says what we do not do deliberately, not
 * that nothing remains.
 */
const ERASURE_CLAIMS = Object.freeze([
  { id: 'nothing-kept', re: /\bnothing(?:\s+of\s+yours)?\s+(?:is|will\s+be|remains?)\s+(?:being\s+)?(?:kept|retained|stored|held)\b(?!\s+on\s+purpose)/gi },
  { id: 'nothing-left', re: /\bnothing(?:\s+of\s+yours)?\s+(?:is\s+|will\s+be\s+)?(?:left|remains?|remaining)\b|\bno\s+cop(?:y|ies)\b[^.!?\n]{0,30}?\b(?:is|are|will\s+be|remains?|exists?|kept|left|retained)\b/gi },
  { id: 'no-archive', re: /\bno\s+archive\b/gi },
  { id: 'permanently-deletes', re: /\bpermanently\s+(?:deletes|erases|removes|destroys)\b|\b(?:is|are|was|were|been|gets?|will\s+be)\s+permanently\s+(?:deleted|erased|removed|destroyed|gone)\b/gi },
  { id: 'erased', hedgeable: true, re: /(?:\b(?:is|are|was|were|been|gets?|will\s+be|being)\s+(?:(?:permanently|completely|entirely|fully|securely|irreversibly)\s+)?(?:erased|wiped|destroyed|purged|obliterated)\b|\b(?:erases|wipes|destroys|purges|obliterates)\b)/gi },
  { id: 'for-good', hedgeable: true, re: /(?:\b(?:delete[sd]?|erase[sd]?|remove[sd]?|destroy(?:s|ed)?|wipe[sd]?)\b[^.!?\n]{0,60}?\bfor\s+(?:good|ever)\b|\bgone\s+(?:for\s+good|forever|for\s+ever)\b|\b(?:deleted|erased|removed)\s+forever\b)/gi },
  { id: 'unrecoverable', re: /\b(?:cannot|can\s*not|can't|won't|will\s+not|never)\s+be\s+(?:recovered|restored|retrieved|brought\s+back)\b|\b(?:un|ir)recoverable\b|\birretrievabl[ey]\b|\bno\s+way\s+(?:to|of)\s+(?:recover|restore|get\s+(?:it|them)\s+back)\b|\bbeyond\s+recovery\b/gi },
]);
/**
 * A qualification is a statement that backups MAY still hold a copy (may, can, remain, retain, keep, expire,
 * for a limited time ...) and it counts only when it is not negated in the same copy unit: "we keep no
 * backups" and "(no backups are kept)" mention the word and make the claim STRONGER.
 */
const BACKUP_MAY_KEEP = /\bback-?ups?\b[^.!?\n]{0,80}?\b(?:may|might|can|could|remain|remains|retain|retains|keep|keeps|hold|holds|still|expire|expires|expiry|lapse|lapses|age|ages|for\s+a\s+(?:limited|short)\s+(?:time|period)|up\s+to)\b|\b(?:cop(?:y|ies)|remains?)\b[^.!?\n]{0,60}?\b(?:held|kept|stored|retained)\s+in\s+back-?ups?\b|\bin\s+back-?ups?\b[^.!?\n]{0,40}?\b(?:can|may|might|remain|remains|persist|persists)\b/i;
const BACKUP_NEGATED = /\bno\s+back-?ups?\b|\bwithout\s+(?:any\s+)?back-?ups?\b|\bnot\s+(?:kept|stored|held|retained|copied|saved)\s+(?:in|on|to)\s+(?:any\s+)?back-?ups?\b|\bnot\s+(?:in|on)\s+(?:any\s+)?back-?ups?\b|\bnever\s+(?:in|on|to)\s+back-?ups?\b|\bback-?ups?\b[^.!?\n]{0,40}?\b(?:are\s+not|aren't|is\s+not|isn't|never|none)\b/i;
const backupQualified = (text) => BACKUP_MAY_KEEP.test(text) && !BACKUP_NEGATED.test(text);
/**
 * A hedged sentence is not a claim: "we could not confirm the original file was destroyed" says the opposite of
 * "the file is destroyed". For the claim families marked hedgeable, a match preceded in its own sentence (the
 * gap may cross the line break of a literal chain, never a . ! or ?) by "could not confirm / verify / be sure"
 * is skipped. Only that verification doubt hedges: a loose word such as whether or if does not, or a claim could
 * be given a prefix that switches the rule off.
 */
const HEDGE_BEFORE = /\b(?:could\s+not|couldn't|unable\s+to|not\s+able\s+to|cannot|can't)\s+(?:yet\s+)?(?:confirm|verify|establish|be\s+sure|tell)\b[^.!?]{0,120}$/i;
const isHedged = (code, idx) => HEDGE_BEFORE.test(code.slice(Math.max(0, idx - 160), idx));

/**
 * The copy unit around a claim: the chain of string literals joined by `+` that holds it (a long sentence is
 * written as several literals), or - when the file cannot be lexed or the text is not in a literal - its line.
 */
function copyUnit(f, idx) {
  const lineStart = f.code.lastIndexOf('\n', idx) + 1;
  const lineEnd = f.code.indexOf('\n', idx);
  const line = f.code.slice(lineStart, lineEnd < 0 ? f.code.length : lineEnd);
  if (f.literalIssues.length > 0) return { text: line, how: 'line' };
  const spans = f.spans.filter((s) => s.kind === 'str' || s.kind === 'tpl').sort((a, b) => a.start - b.start);
  let i = spans.findIndex((s) => idx >= s.start && idx < s.end);
  if (i < 0) return { text: line, how: 'line' };
  let lo = i;
  let hi = i;
  const joined = (a, b) => /^\s*\+\s*$/.test(f.code.slice(a.end + 1, b.start - 1));
  while (lo > 0 && joined(spans[lo - 1], spans[lo])) lo--;
  while (hi < spans.length - 1 && joined(spans[hi], spans[hi + 1])) hi++;
  return { text: spans.slice(lo, hi + 1).map((s) => f.code.slice(s.start, s.end)).join(' '), how: 'literal chain' };
}

/** Name of the exported constant whose initialiser holds idx, or null. */
function exportedConstAt(f, idx) {
  let name = null;
  for (const m of f.bl.matchAll(/\bexport\s+const\s+([A-Za-z_$][\w$]*)\b/g)) {
    if (m.index > idx) break;
    name = m[1];
  }
  return name;
}

/** The value of permanentErasureCertified in the release-authority object literal: true, false or null. */
function erasureCertified(tree, rep) {
  const f = need(tree, RELEASE_AUTHORITY, rep);
  if (!f) return null;
  const hits = [...f.bl.matchAll(/\bpermanentErasureCertified\s*:\s*(true|false)\b/g)];
  if (hits.length !== 1) {
    rep.unknown(`${RELEASE_AUTHORITY} has ${hits.length} literal values for permanentErasureCertified (one is needed)`);
    return null;
  }
  return { value: hits[0][1] === 'true', line: lineAt(f.bl, hits[0].index) };
}

/** Evidence that the Delete Work copy itself was read: DELETE_WORK_COPY with non-empty body and hint, or null. */
function deleteCopyAnchor(tree) {
  const f = sourceFacts(tree, DELETE_WORK);
  if (f.missing || (f.kind !== 'ts' && f.kind !== 'js')) return null;
  const m = /\bexport\s+const\s+DELETE_WORK_COPY\s*=\s*\{/.exec(f.bl);
  if (!m) return null;
  const open = m.index + m[0].length - 1;
  const close = matchClose(f.bl, open);
  if (close < 0) return null;
  const inner = f.code.slice(open, close);
  const props = ['body', 'hint'].filter((k) => new RegExp(`\\b${k}\\s*:\\s*['"\`]`).test(inner));
  return props.length === 2 ? { line: lineAt(f.bl, m.index), props } : null;
}

function sf17Check(tree) {
  const rep = report();
  const cert = erasureCertified(tree, rep);
  const files = sourceFilesUnder(tree, COPY_SCOPE_DIRS, rep);
  const topicalFiles = sourceFilesUnder(tree, COPY_SCOPE_TOPICAL_DIRS, rep);
  if (rep.inconclusive()) return rep.done();
  const found = [];
  for (const rel of [...files, ...topicalFiles]) {
    const raw = tree.read(rel);
    if (raw === null || !memoRaw(raw, 'erasure-claim', (r) => ERASURE_CLAIMS.some((c) => new RegExp(c.re.source, c.re.flags).test(r)))) continue;
    const f = need(tree, rel, rep, { tolerateLiterals: true });
    if (!f) continue;
    const topical = !files.includes(rel);
    for (const c of ERASURE_CLAIMS) {
      for (const m of f.code.matchAll(new RegExp(c.re.source, c.re.flags))) {
        if (c.hedgeable && isHedged(f.code, m.index)) continue;
        const unit = copyUnit(f, m.index);
        // outside the Writer directories a claim counts only when its own copy is about the Work (this unit, or the lines around a JSX text)
        if (topical && !WORK_TOPIC.test(unit.text) && !WORK_TOPIC.test(f.code.slice(f.code.lastIndexOf('\n', Math.max(0, m.index - 1)) - 160, m.index + 200))) continue;
        found.push({ rel, f, id: c.id, idx: m.index, line: lineAt(f.code, m.index), qualified: backupQualified(unit.text), how: unit.how, owner: exportedConstAt(f, m.index) });
      }
    }
  }
  if (rep.inconclusive() || cert === null) return rep.done();
  if (found.length === 0) {
    // zero claims is a pass only if the Delete Work copy was actually read: otherwise a moved or renamed copy would read as clean
    const anchor = deleteCopyAnchor(tree);
    if (!anchor) {
      rep.unknown(`DELETE_WORK_COPY with a body and a hint was not found in ${DELETE_WORK}, and no claim was found under ${[...COPY_SCOPE_DIRS, ...COPY_SCOPE_TOPICAL_DIRS].join(', ')}: a scan that finds nothing proves nothing`);
      return rep.done();
    }
    rep.ok(`${DELETE_WORK}:${anchor.line} DELETE_WORK_COPY (${anchor.props.join(', ')}) was read and no sentence in scope tells a member that nothing is kept`);
  }
  rep.state(`${RELEASE_AUTHORITY}:${cert.line} permanentErasureCertified is ${cert.value}`);
  for (const c of found) {
    const where = `${c.rel}:${c.line}`;
    if (cert.value) rep.ok(`${where} ${c.id} claim is allowed because the manifest certifies permanent erasure`);
    else if (c.qualified) rep.ok(`${where} ${c.id} claim is qualified about backups in the same ${c.how}`);
    else rep.bad(`${where} ${c.id} claim appears with no backup qualification while permanentErasureCertified is false`);
  }
  // context: does the copy reach a member? how many other non-test files use the constant that holds it
  for (const owner of new Set(found.filter((c) => c.owner && !c.qualified).map((c) => `${c.rel}\u0000${c.owner}`))) {
    const [rel, name] = owner.split('\u0000');
    const users = [...files, ...topicalFiles].filter((r) => r !== rel && (tree.read(r) ?? '').includes(name));
    rep.ctx(`${name} (${rel}) is referenced by ${users.length} other non-test file(s): ${users.slice(0, 4).join(', ')}${users.length > 4 ? ', ...' : ''}`);
  }
  rep.ctx('pinning tests (deleteWork.test.ts, homeDeleteWriting.test.tsx) assert the current wording, so rewording is a requalification, not a free edit');
  rep.ctx('the sentence about a custody that could not be confirmed says nothing is kept on purpose; that states intent, not an outcome, and is not counted as a claim');
  return rep.done();
}

const BODY_TAIL = "from. It cannot be undone and there is no archive — nothing is kept.',";
const HINT_LINE = "hint: 'Permanently deletes this Work and its writing.',";
const FIXTURE_REL = 'app/writers-studio/full-redesign/fixtures.ts';
const FIXTURE_HINT = "hint: 'Permanently deletes this Work and its writing.' },";
const rewordCopy = (t) => t
  .replace(DELETE_WORK, BODY_TAIL, "from. It cannot be undone. Copies held in backups can remain for a limited time after deletion.',")
  .replace(DELETE_WORK, HINT_LINE, "hint: 'Deletes this Work and its writing. Backups can keep a copy for a limited time.',")
  .replace(FIXTURE_REL, FIXTURE_HINT, "hint: 'Deletes this Work and its writing. Backups can keep a copy for a limited time.' },");

const SF17 = {
  id: 'SF-17',
  title: 'Delete Work copy honesty',
  law: 'Copy that tells the member nothing is kept appears only where permanentErasureCertified is true, or the wording is qualified about backups.',
  obligations: ['WSI-26', 'WSI-30', 'WSI-39'],
  claims: ['C23'],
  kind: 'law',
  expectedToday: 'RED',
  whyExpected: 'Read from the code: DELETE_WORK_COPY.body in lib/writersStudio/deleteWork.ts says there is no archive and nothing is kept, and DELETE_WORK_COPY.hint says Permanently deletes this Work and its writing; the founder-review fixtures file mirrors the hint word for word and the live PC3 home imports that mirror. releaseAuthority.ts sets permanentErasureCertified to the literal false, and no sentence mentions backups. Judgment calls, stated: an imperative button label (Delete permanently) is an action and is not counted; the custody_incomplete refusal says nothing of yours is being kept on purpose, which states intent after an admitted failure and is not counted. A claim gated at run time by reading the flag is not recognised (it would read RED, the safe direction). Rewording is not free: deleteWork.test.ts and homeDeleteWriting.test.tsx assert the current words. The claim families are nothing kept / nothing left / no copy, no archive, permanently deletes, erased or wiped or destroyed, deleted for good, and cannot be recovered; a sentence that doubts the outcome (we could not confirm the original file was destroyed) is not a claim. A qualification must say that backups MAY still hold a copy and must not be negated in the same copy unit (we keep no backups makes the claim stronger). Shared components are scanned too, where a claim counts when its own copy is about the Work.',
  rulingPending: 'D5',
  check: sf17Check,
  defeats: [
    defeat('FIX: reword the body and both hints so nothing says nothing is kept, and say backups can keep a copy', 'fix', 'GREEN', rewordCopy),
    defeat('FIX: keep the strong words but qualify each in the same sentence about backups', 'fix', 'GREEN',
      (t) => t
        .replace(DELETE_WORK, BODY_TAIL, "from. It cannot be undone and there is no archive — nothing is kept, apart from backups that expire in time.',")
        .replace(DELETE_WORK, HINT_LINE, "hint: 'Permanently deletes this Work and its writing (backups expire in time).',")
        .replace(FIXTURE_REL, FIXTURE_HINT, "hint: 'Permanently deletes this Work and its writing (backups expire in time).' },")),
    defeat('FIX: the backups sentence sits in the FIRST piece of the sentence chain that holds the claim', 'fix', 'GREEN',
      (t) => t
        .replace(DELETE_WORK, "'This deletes the writing, its sections and drafts, and the original file it came '", "'Backups can keep a copy for a limited time. This deletes the writing, its sections and drafts, and the original file it came '")
        .replace(DELETE_WORK, HINT_LINE, "hint: 'Permanently deletes this Work and its writing (backups expire in time).',")
        .replace(FIXTURE_REL, FIXTURE_HINT, "hint: 'Permanently deletes this Work and its writing (backups expire in time).' },")),
    defeat('FIX (the law is conditional on the manifest): permanentErasureCertified is true, which this law accepts and WSI-26 and WSI-30 must justify', 'fix', 'GREEN',
      (t) => t.replace(RELEASE_AUTHORITY, 'permanentErasureCertified: false,', 'permanentErasureCertified: true,')),
    defeat('WRONG FIX: only deleteWork.ts is reworded; the fixtures mirror that the live home imports keeps the claim', 'fix', 'RED',
      (t) => t.replace(DELETE_WORK, BODY_TAIL, "from. It cannot be undone. Copies held in backups can remain for a limited time after deletion.',").replace(DELETE_WORK, HINT_LINE, "hint: 'Deletes this Work and its writing. Backups can keep a copy for a limited time.',"), 'fixtures.ts'),
    defeat('WRONG FIX: SUBTLE backups are mentioned only in a comment beside the unchanged sentence', 'fix', 'RED',
      (t) => t.replace(DELETE_WORK, BODY_TAIL, `${BODY_TAIL} // backups may keep a copy; wording to follow`), 'nothing-kept'),
    defeat('WRONG FIX: SUBTLE backups are mentioned in a different sentence (the Remove copy), not beside the claim', 'fix', 'RED',
      (t) => t.replace(DELETE_WORK, "hint: 'Keeps your writing in Your Writings.',", "hint: 'Keeps your writing in Your Writings; backups are separate.',"), 'nothing-kept'),
    defeat('WRONG FIX: a synonym keeps the claim (nothing is retained)', 'fix', 'RED',
      (t) => rewordCopy(t).replace(DELETE_WORK, "Copies held in backups can remain for a limited time after deletion.", 'There is no archive. Nothing is retained.'), 'no-archive'),
    defeat('WRONG FIX: SUBTLE the flag is named only in a comment that says the sentence is gated', 'fix', 'RED',
      (t) => t.replace(DELETE_WORK, BODY_TAIL, `${BODY_TAIL} // shown only when permanentErasureCertified`), 'nothing-kept'),
    defeat('FIX: the strong words of the erased family are kept but qualified in the same sentence about backups', 'fix', 'GREEN',
      (t) => t
        .replace(DELETE_WORK, BODY_TAIL, "from. Your writing is erased, though backups can keep a copy for a limited time.',")
        .replace(DELETE_WORK, HINT_LINE, "hint: 'Deletes this Work and its writing for good (backups can keep a copy for a limited time).',")
        .replace(FIXTURE_REL, FIXTURE_HINT, "hint: 'Deletes this Work and its writing for good (backups can keep a copy for a limited time).' },")),
    defeat('WRONG FIX: the same claim reworded - erased, cannot be recovered, gone for good - with no word about backups', 'fix', 'RED',
      (t) => t
        .replace(DELETE_WORK, BODY_TAIL, "from. Your writing and the original file are erased and cannot be recovered.',")
        .replace(DELETE_WORK, HINT_LINE, "hint: 'Deletes this Work and its writing for good.',")
        .replace(FIXTURE_REL, FIXTURE_HINT, "hint: 'Deletes this Work and its writing for good.' },"), 'erased claim appears'),
    defeat('WRONG FIX: the word backups is added as a NEGATION (we keep none), which is a stronger claim and not a qualification', 'fix', 'RED',
      (t) => t
        .replace(DELETE_WORK, BODY_TAIL, "from. It cannot be undone and there is no archive — nothing is kept. We keep no backups.',")
        .replace(DELETE_WORK, HINT_LINE, "hint: 'Permanently deletes this Work and its writing (no backups are kept).',")
        .replace(FIXTURE_REL, FIXTURE_HINT, "hint: 'Permanently deletes this Work and its writing (no backups are kept).' },"), 'nothing-kept claim appears'),
    defeat('WRONG FIX: the Writer copy is honest but the claim is pasted into a shared component about the Work', 'fix', 'RED',
      (t) => rewordCopy(t).add('components/studio/WorkDeleteNote.tsx', "export const WORK_DELETE_NOTE = 'Permanently deletes this Work and its writing.';\n"), 'components/studio/WorkDeleteNote.tsx'),
  ],
  decoys: [
    defeat('DECOY: an unrelated shared component says nothing is stored (it is not about the Work) and adds no claim', 'fix', 'RED',
      (t) => t.add('components/studio/StorageNote.tsx', "export const STORAGE_NOTE = 'Nothing is stored beyond this device.';\n"), 'nothing-kept claim appears'),
    defeat('DECOY: a comment near the body says backups are out of scope (the real sentence is unchanged)', 'fix', 'RED',
      (t) => t.replace(DELETE_WORK, BODY_TAIL, `${BODY_TAIL} // backups: see the retention note`), 'nothing-kept'),
  ],
};

// ---- SF-18 -----------------------------------------------------------------------------------------

const SUITE_PREFIX = 'tests/constitutional/writer-source-intake/';
const HOLD_FLAG = /\bsourceIntakeReleased\s*:\s*false\b/;
const HOLD_COPY = /Original-file import is held|SOURCE-LAUNCH-HOLD/;

/** What the finding listed (C10), by file name, before this module checked the tree. */
const FINDING_LISTED = Object.freeze(['transportBoundary.test.ts', 'encryptedSourceUploadContract.test.ts', 'p4r1ImportHoldHonesty.test.ts', 'routeHold.test.ts', 'journey.spec.ts']);

/** The set of tests that pin the held intake state, as measured on the tree: path -> classes. */
const DECLARED_HOLD_PINS = Object.freeze({
  'app/api/sovereign/manuscripts/[id]/render/__tests__/route.test.ts': ['held-manifest fixture'],
  'app/api/sovereign/manuscripts/[id]/render/__tests__/routeHold.test.ts': ['held-manifest fixture'],
  'app/api/sovereign/manuscripts/ingest/__tests__/transportBoundary.test.ts': ['manifest source pin'],
  'app/writers-studio/__tests__/encryptedSourceUploadContract.test.ts': ['manifest source pin'],
  'app/writers-studio/__tests__/importPublishContext.test.ts': ['held-manifest fixture'],
  'app/writers-studio/__tests__/p4r1ImportHoldHonesty.test.ts': ['manifest source pin', 'held copy'],
  'app/writers-studio/__tests__/p4r1PublishReleaseHold.test.ts': ['held-manifest fixture'],
  'tests/e2e/writers-journey/journey.spec.ts': ['held copy'],
});

/**
 * Every test file of the repository, wherever it lives: the whole tree is walked (a top-level __tests__ or e2e
 * directory, hooks/, src/, packages/, config/, jarvis-desktop/ ... as well as app, lib, components, tests and
 * scripts), not a fixed list of five roots. This suite's own directory is excluded by design.
 */
function allTestFiles(tree) {
  const out = [];
  for (const rel of tree.list('', { ext: SOURCE_EXTS })) if (isTestPath(rel) && !rel.startsWith(SUITE_PREFIX)) out.push(rel);
  return out.sort();
}

/** Tests carrying a marker of the held state: Map(rel -> Set(class)). A test that exists only on this machine (untracked or ignored) is not part of the repository and is counted aside. */
function holdPinsOf(tree, rep) {
  const out = new Map();
  const tests = allTestFiles(tree);
  let aside = 0;
  if (tests.length === 0) rep.unknown('no test file was found, so the inventory would be vacuous');
  for (const rel of tests) {
    const raw = tree.read(rel);
    if (raw === null || !memoRaw(raw, 'hold-marker', (r) => r.includes('sourceIntakeReleased') || HOLD_COPY.test(r))) continue;
    const st = tree.trackingState(rel);
    if (st === 'untracked' || st === 'ignored') { aside++; continue; }
    const f = need(tree, rel, rep, { tolerateLiterals: true });
    if (!f) continue;
    const classes = new Set();
    const flag = new RegExp(HOLD_FLAG.source, 'g').exec(f.code);
    if (flag) {
      const inLiteral = f.literalIssues.length === 0 && f.spans.some((s) => (s.kind === 'str' || s.kind === 'tpl') && flag.index >= s.start && flag.index < s.end);
      classes.add(inLiteral ? 'manifest source pin' : 'held-manifest fixture');
    }
    if (HOLD_COPY.test(f.code)) classes.add('held copy');
    if (classes.size > 0) out.set(rel, classes);
  }
  return { pins: out, scanned: tests.length, aside };
}

function sf18Check(tree, declared = DECLARED_HOLD_PINS) {
  const rep = report();
  const { pins, scanned, aside } = holdPinsOf(tree, rep);
  if (rep.inconclusive()) return rep.done();
  if (Object.keys(declared).length === 0) { rep.unknown('the declared set is empty, so equality would be vacuous'); return rep.done(); }
  for (const rel of [...pins.keys()].filter((r) => !declared[r]).sort()) rep.bad(`${rel} pins the held intake state (${[...pins.get(rel)].join(', ')}) but is not in the declared set, so a flip would not requalify it`);
  for (const rel of Object.keys(declared).sort()) {
    if (!pins.has(rel)) {
      const gone = tree.read(rel) === null;
      rep.bad(`${rel} is declared as a hold pin but ${gone ? 'is gone' : 'no longer carries a held-state marker'}`);
      continue;
    }
    const have = [...pins.get(rel)].sort().join(' + ');
    const want = [...declared[rel]].sort().join(' + ');
    if (have !== want) rep.bad(`${rel} still carries a marker but its kind changed from ${want} to ${have}, so it no longer pins what it was declared to pin`);
  }
  const same = [...pins.keys()].filter((r) => declared[r]);
  if (rep.violations() === 0) rep.ok(`the ${pins.size} tests that pin the held intake state equal the declared set exactly (${scanned} test files scanned)`);
  const byClass = new Map();
  for (const rel of same) for (const c of pins.get(rel)) byClass.set(c, (byClass.get(c) ?? 0) + 1);
  rep.state(`by kind: ${[...byClass.entries()].sort().map(([c, n]) => `${n} ${c}`).join(', ')}`);
  const listed = new Set(FINDING_LISTED);
  const extra = Object.keys(declared).filter((r) => !listed.has(r.slice(r.lastIndexOf('/') + 1))).map((r) => r.slice(r.lastIndexOf('/') + 1));
  const missing = FINDING_LISTED.filter((n) => !Object.keys(declared).some((r) => r.endsWith(`/${n}`)));
  rep.ctx(`the finding listed ${FINDING_LISTED.length} tests; the tree has ${Object.keys(declared).length}. Not in the finding: ${extra.join(', ') || 'none'} (held-manifest fixtures that go stale at a flip). In the finding but absent: ${missing.join(', ') || 'none'}`);
  const released = allTestFiles(tree).filter((r) => /\bsourceIntakeReleased\s*:\s*true\b/.test(tree.code(r) ?? ''));
  if (aside > 0) rep.ctx(`${aside} test file(s) carrying a held-state marker are untracked or ignored on this machine and were set aside: this law is about the committed set`);
  rep.ctx('a pin is recognised by a marker (sourceIntakeReleased, or the hold copy) in a test file; a pin written some other way (a bare status assertion, a snapshot, a helper) is not seen');
  if (released.length > 0) rep.ctx(`${released.length} test(s) build a released-intake fixture (${released.map((r) => r.slice(r.lastIndexOf('/') + 1)).join(', ')}); they do not pin the held state and are not in the set`);
  return rep.done();
}

const HOLD_TEST_NEW = 'app/writers-studio/__tests__/newReleaseHold.test.ts';
const holdTestSrc = (flag) => `describe('intake release', () => {\n  it('keeps the manifest held', () => {\n    const authority = { sourceIntakeReleased: ${flag}, exportsCertified: { pdf: false, epub: false } };\n    expect(authority.sourceIntakeReleased).toBe(${flag});\n  });\n});\n`;
const CONTRACT_TEST = 'app/writers-studio/__tests__/encryptedSourceUploadContract.test.ts';

const SF18 = {
  id: 'SF-18',
  title: 'Hold-pinning test inventory',
  law: 'The set of tests pinning the held intake state equals the declared set, so a flip requalifies all of them.',
  obligations: ['WSI-43'],
  claims: ['C10'],
  kind: 'inventory',
  expectedToday: 'GREEN',
  whyExpected: 'Measured against the tree at c051385b: eight test files carry a marker of the held state, three more than the five the finding listed. Three are source pins that assert the literal text of the manifest (transportBoundary, encryptedSourceUploadContract, p4r1ImportHoldHonesty), four are fixtures that build a held manifest (render route.test.ts and routeHold.test.ts, importPublishContext, p4r1PublishReleaseHold), and two assert the held copy (p4r1ImportHoldHonesty and the browser walk journey.spec.ts). The declared set in this module IS that corrected list, so it is GREEN by construction today; its value is the break defeats: a new pin nobody declared, or a declared pin that is weakened, moved or deleted, turns it RED. A test that builds a RELEASED fixture (p4r1IntegratedImport) is deliberately not a pin. Detection is by marker text in test files, over every test file of the repository (the whole tree, including a top-level __tests__ or e2e directory, hooks/, src/ and packages/); a test that exists only on this machine (untracked or ignored) is set aside and counted. A pin written some other way (a bare status assertion, a snapshot, a helper) is not seen.',
  rulingPending: null,
  check: (tree) => sf18Check(tree),
  defeats: [
    defeat('BREAK: a new test pins a held manifest and nobody declared it', 'break', 'RED', (t) => t.add(HOLD_TEST_NEW, holdTestSrc('false')), 'not in the declared set'),
    defeat('BREAK: a declared source pin is weakened so it no longer says false', 'break', 'RED',
      (t) => t.replace(CONTRACT_TEST, "expect(releaseAuthority).toContain('sourceIntakeReleased: false');", "expect(releaseAuthority).toContain('sourceIntakeReleased');"), 'no longer carries'),
    defeat('BREAK: a declared pin is deleted', 'break', 'RED', (t) => t.remove(CONTRACT_TEST), 'is gone'),
    defeat('BREAK: SUBTLE a held fixture is quietly flipped to released, so it no longer pins the held state', 'break', 'RED',
      (t) => t.replace('app/writers-studio/__tests__/importPublishContext.test.ts', 'sourceIntakeReleased:false', 'sourceIntakeReleased:true'), 'no longer carries'),
    defeat('BREAK: SUBTLE the pin is moved out of the test tree, so it still exists but is no longer a test', 'break', 'RED',
      (t) => t.add('app/writers-studio/holdPinHelper.ts', t.read(CONTRACT_TEST)).remove(CONTRACT_TEST), 'is gone'),
    defeat('BREAK: SUBTLE a source pin becomes a tautology: the test builds its own held object instead of reading the manifest source', 'break', 'RED',
      (t) => t.replace(CONTRACT_TEST, "expect(releaseAuthority).toContain('sourceIntakeReleased: false');", "const authority = { sourceIntakeReleased: false };\n    expect(authority.sourceIntakeReleased).toBe(false);"), 'its kind changed from manifest source pin to held-manifest fixture'),
    defeat('BREAK: the browser walk stops asserting the held copy', 'break', 'RED',
      (t) => t.replace('tests/e2e/writers-journey/journey.spec.ts', "Original-file import is held on this Writer image.", 'Import is available.'), 'no longer carries'),
    defeat('BREAK: a new undeclared pin in the repository top-level __tests__ directory', 'break', 'RED',
      (t) => t.add('__tests__/writersIntakeHold.test.ts', holdTestSrc('false')), 'not in the declared set'),
    defeat('BREAK: a new undeclared pin in a top-level e2e directory', 'break', 'RED',
      (t) => t.add('e2e/writers-hold.spec.ts', holdTestSrc('false')), 'not in the declared set'),
    defeat('BREAK: a new undeclared pin under hooks/, src/ and packages/', 'break', 'RED',
      (t) => t.add('hooks/__tests__/holdPin.test.ts', holdTestSrc('false')).add('src/__tests__/holdPin.test.ts', holdTestSrc('false')).add('packages/x/__tests__/holdPin.test.ts', holdTestSrc('false')), 'packages/x/__tests__/holdPin.test.ts'),
  ],
  decoys: [
    defeat('DECOY: the marker appears only in a comment of a new test', 'break', 'GREEN', (t) => t.add(HOLD_TEST_NEW, '// sourceIntakeReleased: false is pinned elsewhere\ndescribe("x", () => { it("y", () => {}); });\n')),
    defeat('DECOY: the marker appears in a source file that is not a test', 'break', 'GREEN', (t) => t.add('app/writers-studio/heldDefaults.ts', 'export const HELD = { sourceIntakeReleased: false };\n')),
    defeat('DECOY: a new test builds a RELEASED fixture, which does not pin the held state', 'break', 'GREEN', (t) => t.add(HOLD_TEST_NEW, holdTestSrc('true'))),
    defeat('DECOY: this suite itself carries the literal and is excluded by design', 'break', 'GREEN', (t) => t.add(`${SUITE_PREFIX}__tests__/selfPin.test.ts`, holdTestSrc('false'))),
  ],
};

// ---- SF-19 -----------------------------------------------------------------------------------------

/** process.env.NODE_ENV compared as NOT 'test' (either operand order, or a negated equality). */
const NODE_ENV_NOT_TEST = /process\s*\.\s*env\s*\.\s*NODE_ENV\s*(?:!==|!=)\s*(['"])test\1|(['"])test\2\s*(?:!==|!=)\s*process\s*\.\s*env\s*\.\s*NODE_ENV|!\s*\(\s*process\s*\.\s*env\s*\.\s*NODE_ENV\s*(?:===|==)\s*(['"])test\3\s*\)/;
const NODE_ENV_OPERAND = new RegExp(`^(?:${NODE_ENV_NOT_TEST.source})$`);
const LOCAL_TEST_LITERAL = /(['"])local-test\1/;
/** The operand that makes a combined condition "this IS the local-test branch": the provider compared with 'local-test'. */
const LOCAL_PROVIDER_OPERAND = /^(?:(?:provider|process\s*\.\s*env\s*\.\s*WRITER_SOURCE_KEY_PROVIDER)\s*(?:===|==)\s*(['"])local-test\1|(['"])local-test\2\s*(?:===|==)\s*(?:provider|process\s*\.\s*env\s*\.\s*WRITER_SOURCE_KEY_PROVIDER))$/;

/**
 * Does this if-gate refuse whenever NODE_ENV is not test? Its condition must have a disjunct made ONLY of the
 * NODE_ENV-not-test comparison (plus, for the selection guard, the local-test provider comparison that merely
 * says which branch this is); a further operand - an env flag, a random draw, anything - makes the refusal
 * opt-in, and an || operand can only widen it. And its body must contain a throw that RUNS: a statement of
 * its own, at block depth 0, in no closure, after no return (a throw inside a function that is never called,
 * or under another condition, refuses nothing).
 */
function refusingGate(f, g, { allowLocalProvider = false } = {}) {
  const dnf = conditionDnf(f.code, f.bl, g.condStart, g.condEnd);
  const conditionOk = dnf.some((conj) => conj.some((o) => NODE_ENV_OPERAND.test(o)) && conj.every((o) => NODE_ENV_OPERAND.test(o) || (allowLocalProvider && LOCAL_PROVIDER_OPERAND.test(o))));
  if (!conditionOk) return null;
  const at = unconditionalThrow(f.bl, g.bodyStart, g.bodyEnd);
  return at < 0 ? null : { pos: g.pos, throwAt: at };
}

function sf19Check(tree) {
  const rep = report();
  const f = need(tree, KEY_AUTHORITY, rep);
  if (!f) return rep.done();
  const fns = topLevelFunctions(f.bl);
  const sel = fns.find((x) => x.name === 'selectedProvider');
  const ring = fns.find((x) => x.name === 'loadLocalKeyRing');
  if (!sel) rep.unknown(`${KEY_AUTHORITY} has no recognisable selectedProvider`);
  if (!ring) rep.unknown(`${KEY_AUTHORITY} has no recognisable loadLocalKeyRing`);
  if (!sel || !ring) return rep.done();
  const condOf = (g) => f.code.slice(g.condStart, g.condEnd);

  // provider selection: the local-test branch refuses outside NODE_ENV test, either nested or in one condition
  const gates = ifGates(f.bl, sel.open, sel.close);
  let selOk = null;
  for (const g of gates) {
    if (!LOCAL_TEST_LITERAL.test(condOf(g))) continue;
    // one combined condition: it must itself run on every call (function depth 0) and no earlier path may hand back local-test
    const combined = refusingGate(f, g, { allowLocalProvider: true });
    if (combined && blockDepthAt(f.bl, sel.open + 1, g.pos) === 0 && parenDepthAt(f.bl, sel.open + 1, g.pos) === 0) {
      // no path before the guard may hand back local-test: an unconditional return, or an earlier branch for local-test that returns
      const earlyReturn = unconditionalReturn(f.bl, sel.open + 1, g.pos) >= 0 || gates.some((h) => h.pos < g.pos && h !== g && LOCAL_TEST_LITERAL.test(condOf(h)) && /\breturn\b/.test(h.body));
      if (!earlyReturn) { selOk = { pos: g.pos, how: 'one combined condition' }; break; }
    }
    // a guard inside the local-test branch: unconditional there, and before the branch can return
    const ret = f.bl.slice(g.bodyStart, g.bodyEnd).search(/\breturn\b/);
    for (const h of gates) {
      if (h.pos <= g.bodyStart || h.pos >= g.bodyEnd) continue;
      if (blockDepthAt(f.bl, g.bodyStart, h.pos) !== 0 || parenDepthAt(f.bl, g.bodyStart, h.pos) !== 0) continue;
      if (!(ret < 0 || h.pos < g.bodyStart + ret)) continue;
      const inner = refusingGate(f, h, { allowLocalProvider: true });
      if (inner) { selOk = { pos: inner.pos, how: 'a guard inside the local-test branch' }; break; }
    }
    if (selOk) break;
  }
  if (selOk) rep.ok(`${loc(f, selOk.pos)} selectedProvider refuses the local-test provider outside NODE_ENV test (${selOk.how})`);
  else rep.bad(`${KEY_AUTHORITY}:${lineAt(f.bl, sel.start)} selectedProvider has no throwing guard that refuses the local-test provider when NODE_ENV is not test`);

  // key ring loader: an unconditional throwing guard, exactly the NODE_ENV comparison, before anything can return
  const rgates = ifGates(f.bl, ring.open, ring.close);
  const rg = rgates.map((g) => ({ g, ok: refusingGate(f, g) })).find(({ g, ok }) => ok && blockDepthAt(f.bl, ring.open + 1, g.pos) === 0 && parenDepthAt(f.bl, ring.open + 1, g.pos) === 0 && !/\breturn\b/.test(f.bl.slice(ring.open + 1, g.pos)));
  if (rg) rep.ok(`${loc(f, rg.g.pos)} loadLocalKeyRing refuses outside NODE_ENV test before it can return a key ring`);
  else rep.bad(`${KEY_AUTHORITY}:${lineAt(f.bl, ring.start)} loadLocalKeyRing has no unconditional throwing guard that runs before its return when NODE_ENV is not test`);

  // there is one place the provider is chosen and one place the local key material is read (a probe or witness
  // script that chooses a provider is a second place too: only TEST files are excused)
  const files = sourceFilesUnder(tree, ['app', 'lib', 'scripts'], rep, { includeWitness: true });
  if (rep.inconclusive()) return rep.done();
  for (const token of ['WRITER_SOURCE_KEY_PROVIDER', 'WRITER_SOURCE_KEK']) {
    const holders = [];
    for (const rel of files) {
      const raw = tree.read(rel);
      if (raw === null || !rawHas(raw, token)) continue;
      const g = need(tree, rel, rep, { tolerateLiterals: true });
      if (g && new RegExp(`\\b${token}`).test(g.code)) holders.push(rel);
    }
    if (rep.inconclusive()) return rep.done();
    const extra = holders.filter((r) => r !== KEY_AUTHORITY);
    if (holders.length === 0) rep.bad(`no non-test file reads ${token}, so the selection point cannot be located`);
    else if (extra.length > 0) rep.bad(`${token} is also read in ${extra.join(', ')}: a second selection site the guards above do not cover`);
    else rep.ok(`${token} is read in exactly one non-test file (${KEY_AUTHORITY})`);
  }

  // context: depth beyond the two required guards, and the configuration that decides NODE_ENV
  const unwrap = fns.find((x) => x.name === 'unwrapLocalDataKey');
  if (unwrap) {
    const ug = ifGates(f.bl, unwrap.open, unwrap.close).find((g) => NODE_ENV_NOT_TEST.test(condOf(g)) && g.throws);
    rep.ctx(ug ? 'unwrapLocalDataKey also refuses outside NODE_ENV test (defence in depth; not required, the loader already refuses)' : 'unwrapLocalDataKey has no NODE_ENV guard of its own; the loader guard is what protects the unwrap path');
  }
  const cm = (() => { const r2 = report(); const m = composeOf(tree, COMPOSE_PROD, r2); return m; })();
  const nodeEnv = cm?.services.get('maia')?.env.get('NODE_ENV');
  if (nodeEnv !== undefined) rep.ctx(nodeEnv === 'test' ? 'the committed maia service sets NODE_ENV to test, which would allow the local provider' : 'the committed maia service sets NODE_ENV to a value other than test; an uncommitted .env.production could still override it');
  return rep.done();
}

const SEL_GUARD = /(if \(provider === 'local-test'\) \{\n)\s*if \(process\.env\.NODE_ENV !== 'test'\) \{\n\s*throw new Error\('writer_source_local_key_provider_forbidden'\);\n\s*\}\n/;
const RING_HEAD = 'function loadLocalKeyRing(): Map<string, Buffer> {\n';
const RING_GUARD = /(function loadLocalKeyRing\(\): Map<string, Buffer> \{\n)\s*if \(process\.env\.NODE_ENV !== 'test'\) \{\n\s*throw new Error\('writer_source_local_key_provider_forbidden'\);\n\s*\}\n/;
const SEL_GUARD_TEXT = "    if (process.env.NODE_ENV !== 'test') {\n      throw new Error('writer_source_local_key_provider_forbidden');\n    }\n";

const SF19 = {
  id: 'SF-19',
  title: 'Local-test provider confinement',
  law: 'The local-test key provider cannot be selected outside NODE_ENV=test: both the provider selection and the key ring loader refuse when NODE_ENV is not test.',
  obligations: ['WSI-01', 'WSI-05'],
  claims: ['C04'],
  kind: 'law',
  expectedToday: 'GREEN',
  whyExpected: 'Read in sourceKeyAuthority.ts: selectedProvider throws writer_source_local_key_provider_forbidden inside its local-test branch unless NODE_ENV is test; loadLocalKeyRing throws the same as its first statement; unwrapLocalDataKey carries a third guard (defence in depth, reported but not required). WRITER_SOURCE_KEY_PROVIDER and the KEK variables are read in no other non-test file, so there is no second selection point. The guards are an allow-list on the value test, not a block-list on production. What the text cannot show: whether NODE_ENV is test on a deployed host is set by the compose environment and an uncommitted .env.production; the evidence reports the committed maia value as context only. Each guard must refuse EXACTLY when NODE_ENV is not test: an extra && operand (an environment flag, a random draw) makes the refusal opt-in and is rejected, an extra || operand can only widen it, and the throw must be a statement of the guard itself at block depth 0 with no return before it (a throw in a closure that is never called, or under another condition, refuses nothing). A second place that selects the provider is a violation wherever it lives except in tests: a file named probe or witness is not excused.',
  rulingPending: null,
  check: sf19Check,
  defeats: [
    defeat('BREAK: the guard in the provider selection is removed', 'break', 'RED', (t) => t.replace(KEY_AUTHORITY, SEL_GUARD, '$1'), 'selectedProvider has no throwing guard'),
    defeat('BREAK: the guard in the key ring loader is removed', 'break', 'RED', (t) => t.replace(KEY_AUTHORITY, RING_GUARD, '$1'), 'loadLocalKeyRing has no unconditional'),
    defeat('BREAK: SUBTLE the selection guard text survives only inside a comment', 'break', 'RED',
      (t) => t.replace(KEY_AUTHORITY, SEL_GUARD, "$1    // if (process.env.NODE_ENV !== 'test') { throw new Error('writer_source_local_key_provider_forbidden'); }\n"), 'selectedProvider has no throwing guard'),
    defeat('BREAK: SUBTLE the loader guard text survives only inside a block comment', 'break', 'RED',
      (t) => t.replace(KEY_AUTHORITY, RING_GUARD, "$1  /* if (process.env.NODE_ENV !== 'test') throw new Error('writer_source_local_key_provider_forbidden'); */\n"), 'loadLocalKeyRing has no unconditional'),
    defeat('BREAK: the loader guard no longer throws, it only warns', 'break', 'RED',
      (t) => t.replace(KEY_AUTHORITY, RING_GUARD, "$1  if (process.env.NODE_ENV !== 'test') {\n    console.warn('writer_source_local_key_provider_forbidden');\n  }\n"), 'loadLocalKeyRing has no unconditional'),
    defeat('BREAK: the selection guard is inverted and now throws inside NODE_ENV test', 'break', 'RED',
      (t) => t.replace(KEY_AUTHORITY, SEL_GUARD, "$1    if (process.env.NODE_ENV === 'test') {\n      throw new Error('writer_source_local_key_provider_forbidden');\n    }\n"), 'selectedProvider has no throwing guard'),
    defeat('BREAK: the selection guard no longer throws, it only warns', 'break', 'RED',
      (t) => t.replace(KEY_AUTHORITY, SEL_GUARD, "$1    if (process.env.NODE_ENV !== 'test') {\n      console.warn('writer_source_local_key_provider_forbidden');\n    }\n"), 'selectedProvider has no throwing guard'),
    defeat('BREAK: the selection guard is folded into the branch condition but only warns', 'break', 'RED',
      (t) => t.replace(KEY_AUTHORITY, SEL_GUARD, "if (provider === 'local-test' && process.env.NODE_ENV !== 'test') {\n    console.warn('writer_source_local_key_provider_forbidden');\n  }\n  if (provider === 'local-test') {\n"), 'selectedProvider has no throwing guard'),
    defeat('BREAK: the loader guard only runs when a key ring is supplied, so a lone key skips it', 'break', 'RED',
      (t) => t.replace(KEY_AUTHORITY, RING_GUARD, "$1  if (process.env.WRITER_SOURCE_KEK_RING_JSON) {\n    if (process.env.NODE_ENV !== 'test') {\n      throw new Error('writer_source_local_key_provider_forbidden');\n    }\n  }\n"), 'loadLocalKeyRing has no unconditional'),
    defeat('BREAK: the guard is a block-list on production, so staging and development are allowed', 'break', 'RED',
      (t) => t.replace(KEY_AUTHORITY, SEL_GUARD, "$1    if (process.env.NODE_ENV === 'production') {\n      throw new Error('writer_source_local_key_provider_forbidden');\n    }\n"), 'selectedProvider has no throwing guard'),
    defeat('BREAK: SUBTLE the loader guard is moved after the return, where it can never run', 'break', 'RED',
      (t) => t.replace(KEY_AUTHORITY, RING_GUARD, '$1').replace(KEY_AUTHORITY, '  ring.set(currentId, parseLocalKey(current, \'writer_source_kek\'));\n  return ring;\n', "  ring.set(currentId, parseLocalKey(current, 'writer_source_kek'));\n  return ring;\n  if (process.env.NODE_ENV !== 'test') {\n    throw new Error('writer_source_local_key_provider_forbidden');\n  }\n"), 'loadLocalKeyRing has no unconditional'),
    defeat('BREAK: a second file chooses the provider from the environment with no guard', 'break', 'RED',
      (t) => t.add(`${SOURCE_DIR}/altKeyProvider.ts`, "export function altProvider(): 'aws-kms' | 'local-test' {\n  return process.env.WRITER_SOURCE_KEY_PROVIDER === 'local-test' ? 'local-test' : 'aws-kms';\n}\n"), 'second selection site'),
    defeat('BREAK: SUBTLE both guards become opt-in: an extra && operand makes the refusal depend on an environment flag', 'break', 'RED',
      (t) => t
        .replace(KEY_AUTHORITY, SEL_GUARD, "$1    if (process.env.NODE_ENV !== 'test' && process.env.WRITER_SOURCE_STRICT === '1') {\n      throw new Error('writer_source_local_key_provider_forbidden');\n    }\n")
        .replace(KEY_AUTHORITY, RING_GUARD, "$1  if (process.env.NODE_ENV !== 'test' && process.env.WRITER_SOURCE_STRICT === '1') {\n    throw new Error('writer_source_local_key_provider_forbidden');\n  }\n"), 'selectedProvider has no throwing guard'),
    defeat('BREAK: SUBTLE the loader throw lives in a closure that is defined and never called', 'break', 'RED',
      (t) => t.replace(KEY_AUTHORITY, RING_GUARD, "$1  if (process.env.NODE_ENV !== 'test') {\n    const refuse = () => { throw new Error('writer_source_local_key_provider_forbidden'); };\n    void refuse;\n  }\n"), 'loadLocalKeyRing has no unconditional'),
    defeat('BREAK: SUBTLE the selection guard is wrapped in an unrelated condition', 'break', 'RED',
      (t) => t.replace(KEY_AUTHORITY, SEL_GUARD, "$1    if (process.env.SOMETHING_ELSE) {\n      if (process.env.NODE_ENV !== 'test') {\n        throw new Error('writer_source_local_key_provider_forbidden');\n      }\n    }\n"), 'selectedProvider has no throwing guard'),
    defeat('BREAK: SUBTLE the loader throws only when a random draw is negative, which never happens', 'break', 'RED',
      (t) => t.replace(KEY_AUTHORITY, RING_GUARD, "$1  if (process.env.NODE_ENV !== 'test') {\n    if (Math.random() < 0) throw new Error('writer_source_local_key_provider_forbidden');\n  }\n"), 'loadLocalKeyRing has no unconditional'),
    defeat('BREAK: SUBTLE the selection guard throws only in an else branch of an unrelated test', 'break', 'RED',
      (t) => t.replace(KEY_AUTHORITY, SEL_GUARD, "$1    if (process.env.NODE_ENV !== 'test') {\n      if (process.env.LOUD) throw new Error('writer_source_local_key_provider_forbidden');\n    }\n"), 'selectedProvider has no throwing guard'),
    defeat('BREAK: a probe-named library file chooses the provider from the environment (a name excuses nothing)', 'break', 'RED',
      (t) => t.add(`${SOURCE_DIR}/providerProbe.ts`, "export function probeProvider(): string {\n  return process.env.WRITER_SOURCE_KEY_PROVIDER === 'local-test' ? 'a' : 'b';\n}\n"), 'second selection site'),
    defeat('BREAK: an operator script named like a witness chooses the provider from the environment', 'break', 'RED',
      (t) => t.add('scripts/ops/provider-witness.ts', "export const chosen = process.env.WRITER_SOURCE_KEY_PROVIDER ?? 'aws-kms';\n"), 'second selection site'),
  ],
  decoys: [
    defeat('DECOY: the loader guard also refuses on an extra || condition (it can only widen the refusal)', 'break', 'GREEN',
      (t) => t.replace(KEY_AUTHORITY, RING_GUARD, "$1  if (process.env.NODE_ENV !== 'test' || process.env.WRITER_SOURCE_KEK_DISABLED === '1') {\n    throw new Error('writer_source_local_key_provider_forbidden');\n  }\n")),
    defeat('DECOY: the loader guard is wrapped in redundant parentheses', 'break', 'GREEN',
      (t) => t.replace(KEY_AUTHORITY, RING_GUARD, "$1  if ((process.env.NODE_ENV !== 'test')) {\n    throw new Error('writer_source_local_key_provider_forbidden');\n  }\n")),
    defeat('DECOY: the defence-in-depth guard in unwrapLocalDataKey is removed; the two required guards still hold', 'break', 'GREEN',
      (t) => t.replace(KEY_AUTHORITY, "if (process.env.NODE_ENV !== 'test' || wrapped.keyProvider !== 'local-test' ||", "if (wrapped.keyProvider !== 'local-test' ||")),
    defeat('DECOY: the guard is written with the operands reversed and double quotes', 'break', 'GREEN',
      (t) => t.replace(KEY_AUTHORITY, SEL_GUARD, "$1    if (\"test\" !== process.env.NODE_ENV) {\n      throw new Error('writer_source_local_key_provider_forbidden');\n    }\n")),
    defeat('DECOY: the selection guard is folded into the branch condition', 'break', 'GREEN',
      (t) => t.replace(KEY_AUTHORITY, SEL_GUARD, "if (provider === 'local-test' && process.env.NODE_ENV !== 'test') {\n    throw new Error('writer_source_local_key_provider_forbidden');\n  }\n  if (provider === 'local-test') {\n")),
  ],
};

// =====================================================================================================
// 8. THE EXPORTED SET
// =====================================================================================================

export const FALSIFIERS_B = Object.freeze([SF10, SF11, SF12, SF13, SF14, SF15, SF16A, SF16B, SF17, SF18, SF19]);

// =====================================================================================================
// 9. SELF-TEST (the lethality proof)
// =====================================================================================================
//
// What it proves, in order: (0) each analysis primitive on known inputs AND on a known-wrong control that must
// disagree, so a primitive that stopped working would be caught; (1) the shape of every falsifier; (2) the
// real tree gives the declared verdict, from files that were actually read, with content-free evidence;
// (3) every defeat and decoy flips (or holds) as declared, FOR ITS NAMED REASON; (4) the fail-closed paths: a
// scan of nothing, a missing file or an unrecognised structure is INCONCLUSIVE and never GREEN.

const TOKEN_FREE = /^[^\n'"`]{1,260}$/;
const verdict = (r) => (r.ok ? 'GREEN' : 'RED');

function runCheck(falsifier, tree) {
  try {
    const r = falsifier.check(tree);
    if (!r || typeof r.ok !== 'boolean' || !Array.isArray(r.evidence)) return { ok: false, evidence: ['INCONCLUSIVE: check returned a malformed result'], threw: 'malformed' };
    return r;
  } catch (e) {
    return { ok: false, evidence: [`INCONCLUSIVE: check threw ${e.name}`], threw: `${e.name}: ${e.message}` };
  }
}

function tryApply(d, tree) {
  try {
    return { tree: d.apply(tree) };
  } catch (e) {
    return { error: `${e.name}: ${e.message}` };
  }
}

const hasLine = (r, prefix, frag) => r.evidence.some((l) => l.startsWith(prefix) && (!frag || l.includes(frag)));

/** A throw-away git repository: tracked files committed, untracked files left alone. */
function makeRepo(label, tracked, untracked = {}) {
  const base = fs.mkdtempSync(path.join(fs.realpathSync(process.env.TMPDIR || '/tmp'), `wsi-fb-${label}-`));
  const w = (rel, content) => {
    const f = path.join(base, rel);
    fs.mkdirSync(path.dirname(f), { recursive: true });
    fs.writeFileSync(f, content);
  };
  for (const [rel, c] of Object.entries(tracked)) w(rel, c);
  const env = { ...Object.fromEntries(Object.entries(process.env).filter(([k]) => !k.startsWith('GIT_'))), HOME: base, GIT_CONFIG_GLOBAL: '/dev/null', GIT_CONFIG_NOSYSTEM: '1', GIT_AUTHOR_NAME: 'wsi', GIT_AUTHOR_EMAIL: 'wsi@example.invalid', GIT_COMMITTER_NAME: 'wsi', GIT_COMMITTER_EMAIL: 'wsi@example.invalid' };
  const git = (...args) => {
    const r = spawnSync('git', args, { cwd: base, env, encoding: 'utf8' });
    if (r.error || r.status !== 0) throw new Error(`git ${args[0]} failed`);
  };
  git('init', '-q');
  git('add', '-A');
  git('-c', 'commit.gpgsign=false', 'commit', '-q', '-m', 'm1');
  for (const [rel, c] of Object.entries(untracked)) w(rel, c);
  return base;
}

export function selfTest() {
  const checks = [];
  const add = (name, ok, detail = '') => checks.push({ name, ok: Boolean(ok), detail: String(detail) });
  const tree = createTree(ROOT);
  const synthDirs = [];
  /** A throw-away in-memory tree over an empty directory: only the given files exist. */
  const synth = (files) => {
    const d = fs.mkdtempSync(path.join(fs.realpathSync(process.env.TMPDIR || '/tmp'), 'wsi-fb-synth-'));
    synthDirs.push(d);
    return createTree(d, files);
  };

  // ---------- 0. the machinery, each piece with a known-wrong control ----------
  {
    const src = "const a = \"// not a comment\"; const b = `t ${f('x')} u`; const c = /a'b/.test(x);\nif (a) { return g(); }\n";
    const lx = lexCode(src);
    add('machinery: lexCode blanks string, template text and regex content, keeps template expression code, keeps length', lx.bl.length === src.length && !lx.bl.includes('not a comment') && !lx.bl.includes("a'b") && lx.bl.includes("f(' ')") && lx.issues.length === 0, JSON.stringify(lx.issues));
    add('machinery: the lexCode assertion FAILS for an identity lexer (lethal control)', src.includes('not a comment'));
    const bad = lexCode('const a = "never closed\nconst b = 1;\n');
    add('machinery: an unterminated string is reported, not guessed', bad.issues.length === 1 && bad.issues[0].kind === 'unterminated-string');
    const tpl = lexCode('const a = `x ${y(`inner ${z()}`)} end`;');
    add('machinery: nested templates keep their expression code and balance', tpl.issues.length === 0 && tpl.bl.includes('y(') && tpl.bl.includes('z()') && !tpl.bl.includes('inner') && !tpl.bl.includes(' end'));
  }
  {
    const src = 'export async function f(a: string): Promise<{ x: number; y: string }> { if (a) { return { x: 1, y: "s" }; } return { x: 2, y: "t" }; }\nfunction g(): { z: 1 } { return { z: 1 }; }\nconst h = async (q: number): Promise<void> => { await q; };\nfunction outer() {\n  function inner() { return 1; }\n  return inner();\n}\n';
    const bl = lexCode(src).bl;
    const fns = topLevelFunctions(bl);
    const names = fns.map((x) => x.name).join(',');
    add('machinery: topLevelFunctions finds declarations, object return types and arrow consts, and lists nested ones under their parent only', names === 'f,g,h,outer', names);
    const f = fns[0];
    add('machinery: the body of a function with an object return type is its real body, not the type literal', bl.slice(f.open, f.open + 12).includes('if (a)') && f.close > f.open + 40);
    const naive = bl.indexOf('{', bl.indexOf(')'));
    add('machinery: the findBodyOpen assertion FAILS for a first-brace-after-paren finder (lethal control)', !(naive === f.open));
    add('machinery: functionsIn also lists the nested function', functionsIn(bl).some((x) => x.name === 'inner'));
    const g = fns.find((x) => x.name === 'g');
    add('machinery: a function whose return type is a bare object type still gets its real body', bl.slice(g.open, g.close).includes('return') && !fns.find((x) => x.name === 'h').params.includes('return'), bl.slice(g.open, g.close));
  }
  {
    const yes = ['app/x/__tests__/helpers.ts', 'tests/e2e/a.ts', 'lib/x.test.ts', 'lib/x.spec.mjs', 'app/y/__mocks__/m.ts'];
    const no = ['lib/testing/x.ts', 'lib/latest/x.ts', 'lib/contest.ts', 'app/api/route.ts', 'scripts/run-media-worker.ts'];
    add('machinery: isTestPath recognises a test directory, a .test. name and a .spec. name, and not lookalikes', yes.every(isTestPath) && no.every((r) => !isTestPath(r)), yes.filter((r) => !isTestPath(r)).concat(no.filter(isTestPath)).join(','));
    add('machinery: isWitnessPath recognises scripts/witness and script names with probe or witness, and not ordinary scripts', isWitnessPath('scripts/witness/a.ts') && isWitnessPath('scripts/ops/fooProbe.ts') && isWitnessPath('scripts/kms-witness.mts') && !isWitnessPath('scripts/run-media-worker.ts') && !isWitnessPath('lib/storage/fileVault.ts'));
    add('machinery: isWitnessPath excuses NOTHING outside scripts/: a deployed lib or app file named probe or witness is still deployed code (lethal control: the old name-only rule excused all of these)',
      ['lib/manuscript/source/kmsHealthProbe.ts', 'lib/manuscript/source/kmsWitness.ts', 'lib/manuscript/source/probeKms.ts', 'lib/x/incompleteLandingWitness.ts', 'app/api/probe/route.ts'].every((r) => !isWitnessPath(r))
        && ['lib/manuscript/source/kmsHealthProbe.ts', 'lib/manuscript/source/kmsWitness.ts', 'lib/manuscript/source/probeKms.ts'].every((r) => /(?:^|\/)[^/]*(?:probe|witness)[^/]*\.[cm]?[jt]sx?$/i.test(r)));
  }
  {
    const bl = lexCode("a(); ns.b(); x?.ns.b(); function b() {} const q = new C(); obj.c(); // trailing\nd(b());").bl;
    add('machinery: callSites finds a plain, namespace-qualified and optional-chained call, and not the declaration', callSites(bl, 'b').length === 3, `${callSites(bl, 'b').length}`);
    add('machinery: callSites with newOnly finds only constructions', callSites(bl, 'C', 0, bl.length, { newOnly: true }).length === 1 && callSites(bl, 'C').length === 0);
    add('machinery: the callSites start index is the head of a qualified call, the idx is the name', callSitesDetailed(bl, 'b').some((s) => bl.slice(s.start, s.idx) === 'ns.'));
  }
  {
    const calls = loadRecordedCalls({
      bl: lexCode(`async function f(i: R) {
  try {
    if (a) return loadRecordedArrival(i);
    if (b) return await loadRecordedArrival(i);
    if (c) return (await loadRecordedArrival(i));
    if (d) return loadRecordedArrival(i).then((r) => r);
    const x = await Promise.all([loadRecordedArrival(i)]);
  } catch (e) { throw e; }
  return loadRecordedArrival(i);
}`).bl,
    });
    const inTry = calls.filter((c) => c.inTry);
    add('machinery: loadRecordedCalls separates calls inside a try block from the one outside', calls.length === 6 && inTry.length === 5, `${calls.length}/${inTry.length}`);
    add('machinery: await, parenthesised await and await Promise.all([...]) count as awaited; a bare return and .then do not', inTry.map((c) => c.awaited).join() === 'false,true,true,false,true', inTry.map((c) => c.awaited).join());
    const trailingSrc = 'async function f(i: R) {\n  try {\n    return loadRecordedArrival(i); // await\n  } catch (e) { throw e; }\n}';
    const stripped = stripCommentsDetailed(trailingSrc, { jsx: false }).text;
    const tc = loadRecordedCalls({ bl: lexCode(stripped).bl });
    add('machinery: a trailing comment saying await does not make the call awaited, though a word-on-the-line check says it does (lethal control)', tc.length === 1 && tc[0].awaited === false && /\bawait\b/.test(trailingSrc.split('\n')[2]));
  }
  {
    const cases = [
      ['  maxAttempts: 3,', 'connectionTimeout', false],
      ['connectionTimeout: 3_000, requestTimeout: 10_000', 'connectionTimeout', true],
      ['connectionTimeout: 0', 'connectionTimeout', false],
      ['connectionTimeout, requestTimeout', 'connectionTimeout', true],
      ['connectionTimeout: undefined', 'connectionTimeout', false],
    ];
    add('machinery: hasNonzero accepts a number, a shorthand and rejects absent, zero and undefined', cases.every(([t, k, want]) => hasNonzero(t, k) === want), cases.filter(([t, k, want]) => hasNonzero(t, k) !== want).map((c) => c[0]).join(' | '));
    add('machinery: propertyValue stops at a top-level comma and reads through a nested call', propertyValue('region, requestHandler: new H({ a: 1, b: 2 }), maxAttempts: 3', 'requestHandler') === 'new H({ a: 1, b: 2 })');
  }
  {
    const yaml = "x-m: &m\n  type: bind\n  source: /h/f\n  target: /t/f\n  read_only: true\nx-e: &e\n  K1: v1\nservices:\n  one:\n    environment:\n      <<: *e\n      K2: v2\n    volumes:\n      - *m\n      - named:/data\n  two:\n    volumes:\n    - /host/path:/c:ro\n    command: [\"a\", \"b c\"]\n";
    const m = composeModel(yaml);
    const one = m.services.get('one');
    const two = m.services.get('two');
    add('machinery: the YAML reader resolves an alias in a sequence, a merge key into a map, a same-indent sequence and a flow list',
      m.ok && m.issues.length === 0 && one.env.get('K1') === 'v1' && one.env.get('K2') === 'v2' && one.mounts[0].source === '/h/f' && one.mounts[0].readOnly === true && one.mounts[1].kind === 'volume' && two.mounts[0].readOnly === true && two.command === 'a b c', JSON.stringify([m.issues, one?.env && [...one.env], one?.mounts]));
    const off = parseYaml(yaml, { resolveAliases: false });
    add('machinery: the alias assertions FAIL when aliases are not resolved (lethal control)', off.value.services.one.volumes[0].alias === 'm' && !off.value.services.one.volumes[0].source);
    const interp = composeModel("services:\n  s:\n    volumes:\n      - ${DATA_DIR:-./data}:/app/data\n      - 'q:/q'\n").services.get('s');
    add('machinery: a colon inside ${...} does not split a volume entry', interp.mounts[0].target === '/app/data' && interp.mounts[0].kind === 'bind' && interp.mounts[1].target === '/q');
    const broken = composeModel('services:\n  s:\n    command: "never closed\n');
    add('machinery: an unterminated quote is reported, not guessed', broken.issues.length > 0);
  }
  {
    const svc = (mounts) => ({ mounts: mounts.map((m) => ({ kind: 'volume', readOnly: false, createHostPath: null, ...m })), env: new Map(), envFiles: [], command: '', entrypoint: '', image: '' });
    const model = (a, b) => ({ services: new Map([['web', svc(a)], ['worker', svc(b)]]) });
    const run = [{ name: 'web', via: 'the web app process' }, { name: 'worker', via: 'script s' }];
    const v = (a, b) => vaultParity(model(a, b), run, '/v');
    const V = { source: 'vault_data', target: '/v' };
    add('machinery: vaultParity is satisfied by the same volume at the same path', v([V], [V]).bad.length === 0 && v([V], [V]).ok.length === 1);
    add('machinery: vaultParity fails a service with no mount, a different volume, a read-only mount, and accepts an ancestor mount of the same volume',
      v([V], []).bad.length === 1 && v([V], [{ source: 'other', target: '/v' }]).bad.length === 1 && v([V], [{ ...V, readOnly: true }]).bad.length === 1 && v([{ source: 'vault_data', target: '/' }], [{ source: 'vault_data', target: '/' }]).bad.length === 0);
    add('machinery: vaultParity never fails a single runner (it has nothing to be in parity with) and reports it as a state', vaultParity(model([V], []), [run[0]], '/v').bad.length === 0 && vaultParity(model([], []), [run[1]], '/v').state.length === 1);
    add('machinery: a checker that only asks whether ANY service mounts the vault would pass the case vaultParity fails (lethal control)', [V].length > 0 && v([V], []).bad.length === 1);
  }
  {
    const ok = { env: new Map([[CRED_VAR, '/run/secrets/c']]), mounts: [{ kind: 'bind', source: '/h/f', target: '/run/secrets/c', readOnly: true, createHostPath: 'false' }], envFiles: [] };
    const probe = (patch) => credentialChannel({ ...ok, ...patch }).problems.length;
    add('machinery: credentialChannel accepts a read-only host-file bind with create_host_path false', probe({}) === 0);
    add('machinery: credentialChannel rejects a missing variable, a missing mount, a writable mount, a named volume and a directory-creating mount',
      probe({ env: new Map() }) >= 1 && probe({ mounts: [] }) === 1 && probe({ mounts: [{ ...ok.mounts[0], readOnly: false }] }) === 1 && probe({ mounts: [{ ...ok.mounts[0], kind: 'volume', source: 'v' }] }) >= 1 && probe({ mounts: [{ ...ok.mounts[0], createHostPath: null }] }) === 1);
    add('machinery: credentialChannel reports a static key in the environment', credentialChannel({ ...ok, env: new Map([['AWS_SECRET_ACCESS_KEY', 'x']]) }).staticVars.length === 1);
  }
  {
    const sentences = {
      'nothing-kept': ['It cannot be undone and there is no archive — nothing is kept.', 'Nothing is retained after this.', 'nothing of yours remains stored'],
      'no-archive': ['there is no archive'],
      'permanently-deletes': ['Permanently deletes this Work and its writing.', 'The file is permanently deleted.'],
    };
    const matches = (id, s) => new RegExp(ERASURE_CLAIMS.find((c) => c.id === id).re.source, 'i').test(s);
    add('machinery: each erasure-claim pattern matches its sentences', Object.entries(sentences).every(([id, list]) => list.every((s) => matches(id, s))));
    const not = ['This one is ours to finish — nothing of yours is being kept on purpose.', 'Delete permanently', 'Keeps your writing in Your Writings.', 'It cannot be undone.'];
    add('machinery: the patterns do not match a statement of intent, an imperative button label, or plain irreversibility', not.every((s) => ERASURE_CLAIMS.every((c) => !new RegExp(c.re.source, 'i').test(s))));
    add('machinery: the exclusions matter - a bare "kept" pattern WOULD have flagged the statement of intent (lethal control)', /\bkept\b/.test(not[0]));
    const f = { code: "const A = {\n  body: 'one ' + 'two nothing is kept.',\n  hint: 'Permanently deletes it, backups too.',\n};\n", literalIssues: [], spans: [] };
    const lx = lexCode(f.code);
    f.spans = lx.spans;
    const i = f.code.indexOf('nothing is kept');
    const u = copyUnit(f, i);
    add('machinery: copyUnit joins string literals chained with + into one unit and keeps another property out of it', u.how === 'literal chain' && u.text.includes('one') && !u.text.includes('backups'), JSON.stringify(u));
    const u2 = copyUnit({ ...f, literalIssues: [{ kind: 'x', line: 1 }] }, i);
    add('machinery: copyUnit falls back to the line when the file cannot be lexed', u2.how === 'line');
  }
  {
    // SF-13's pure logic, on hand-written samples, against a naive detector that must disagree with the truth
    const naive = (src) => {
      const t = src.indexOf('transaction(');
      if (t < 0) return null;
      const end = src.indexOf('});', t);
      const body = src.slice(t, end < 0 ? src.length : end);
      return !DEFAULT_BEARING.some((n) => body.includes(n));
    };
    let disagree = 0;
    for (const s of SF13_SAMPLES) {
      const r = checkSource(s.src);
      const incon = hasLine(r, 'INCONCLUSIVE:');
      const good = r.ok === s.ok && (s.count === undefined || r.findings.length === s.count) && incon === Boolean(s.inconclusive);
      add(`SF-13 sample: ${s.name}`, good, `ok=${r.ok} findings=${r.findings.length}`);
      const nv = naive(s.src);
      if (nv !== null && nv !== s.ok) disagree++;
    }
    add('SF-13 the samples are lethal: a naive "name appears between transaction( and the first closing" detector is wrong on at least three of them', disagree >= 3, `${disagree}`);
    add('SF-13 checkSource accepts an explicit bearing set, and an unknown name is then not bearing', checkSource(SF13_SAMPLES[1].src, { bearing: ['somethingElse'] }).ok === true);
  }

  {
    // SF-19: a refusing guard must refuse EXACTLY when NODE_ENV is not test, with a throw that runs
    const NE = "process.env.NODE_ENV !== 'test'";
    const probe = (cond, body, opts) => {
      const code = `function g() { if (${cond}) ${body} }`;
      const f = { code, bl: lexCode(code).bl };
      const g = ifGates(f.bl, 0, code.length)[0];
      return refusingGate(f, g, opts) !== null;
    };
    const THROW = "{ throw new Error('x'); }";
    const yes = [
      [NE, THROW], [`(${NE})`, THROW], [`${NE} || process.env.WIDEN === '1'`, THROW], [NE, "throw new Error('x');"],
      [`"test" !== process.env.NODE_ENV`, THROW], [`!(process.env.NODE_ENV === 'test')`, THROW],
    ];
    const no = [
      [`${NE} && process.env.WRITER_SOURCE_STRICT === '1'`, THROW],
      [`${NE} && Math.random() < 0.5`, THROW],
      [NE, "{ console.warn('x'); }"],
      [NE, "{ const refuse = () => { throw new Error('x'); }; void refuse; }"],
      [NE, "{ if (Math.random() < 0) throw new Error('x'); }"],
      [NE, "{ if (process.env.LOUD) throw new Error('x'); }"],
      [NE, "{ return; throw new Error('x'); }"],
      [NE, "{ [1].forEach(() => { throw new Error('x'); }); }"],
      ["process.env.NODE_ENV === 'production'", THROW],
      ["process.env.NODE_ENV === 'test'", THROW],
    ];
    add('SF-19 machinery: refusingGate accepts a plain, parenthesised, widened (||), unbraced, reversed and negated NODE_ENV-not-test guard that throws', yes.every(([c, b]) => probe(c, b)), yes.filter(([c, b]) => !probe(c, b)).map((x) => x[0]).join(' | '));
    add('SF-19 machinery: refusingGate rejects an extra && operand, a warn, a throw in a never-called closure, under another condition, after a return, in a callback, and a block-list', no.every(([c, b]) => !probe(c, b)), no.filter(([c, b]) => probe(c, b)).map((x) => `${x[0]} ${x[1]}`).join(' | '));
    add('SF-19 machinery: the local-test provider operand is accepted only where the caller says it names the branch', probe("provider === 'local-test' && " + NE, THROW, { allowLocalProvider: true }) && !probe("provider === 'local-test' && " + NE, THROW) && !probe("provider === 'aws-kms' && " + NE, THROW, { allowLocalProvider: true }));
    // lethal control: the old substring rule (the NODE_ENV comparison appears in the condition, a throw token appears anywhere in the body)
    const naive = (cond, body) => NODE_ENV_NOT_TEST.test(cond) && /\bthrow\b/.test(body);
    add('SF-19 machinery: the old substring guard rule accepts every opt-in or never-running guard the new rule rejects (lethal control)', no.filter(([c, b]) => naive(c, b)).length >= 5, `${no.filter(([c, b]) => naive(c, b)).length} of ${no.length}`);
    add('SF-19 machinery: unconditionalReturn finds a statement-level return and ignores one under a condition', unconditionalReturn('x(); return y;', 0, 14) >= 0 && unconditionalReturn('if (a) return y;', 0, 16) < 0 && unconditionalReturn('if (a) { return y; }', 0, 20) < 0);
  }
  {
    // SF-13: a function counts in every shape it can be written in
    const src = `const a = (x) => foo(x);
const b = async (x: number): Promise<void> => { await foo(x); };
const c = x => foo(x)
const d = function (x) { return foo(x); };
const o = { m(x) { return foo(x); }, p: (x) => foo(x), q: async function (x) { return foo(x); }, async r(x) { return foo(x); } };
class K { s(x) { return foo(x); } static t(x) { return foo(x); } }
const e = (x) => bar(x)
const z = () => baz();
const g = async <T,>(x: T) => foo(x);
if (cond) { foo(x); }
foo(1);
`;
    const bl = lexCode(src).bl;
    const names = namedFunctionsAll(bl).map((x) => x.name);
    const want = ['a', 'b', 'c', 'd', 'g', 'm', 'p', 'q', 'r', 's', 't'];
    add('SF-13 machinery: namedFunctionsAll lists concise arrows, block arrows, function expressions, methods and property values', want.every((n) => names.includes(n)), `missing: ${want.filter((n) => !names.includes(n)).join(',')}`);
    add('SF-13 machinery: namedFunctionsAll does not list a control-flow header or a statement call as a function', !names.includes('if') && !names.includes('foo') && !names.includes('cond'));
    const oldNames = functionsIn(bl).map((x) => x.name);
    add('SF-13 machinery: the older functionsIn registry misses the concise arrows, methods and property values (lethal control)', ['a', 'c', 'm', 'p', 's'].every((n) => !oldNames.includes(n)), oldNames.join(','));
    const grown = growBearing([{ bl }], ['foo']);
    add('SF-13 machinery: growBearing makes a function bearing in every shape, and stops a concise body at its line end', want.every((n) => grown.has(n)) && !grown.has('e') && !grown.has('z'), [...grown].join(','));
    const withAlias = lexCode("import { foo as g1 } from './x';\nconst g2 = foo;\nconst h = () => g1(1);\nconst k = () => g2(2);\n").bl;
    add('SF-13 machinery: a renamed import and a const alias are the same function (x as y, const y = x)', aliasesInBl(withAlias, 'foo').sort().join() === 'g1,g2' && ['h', 'k'].every((n) => growBearing([{ bl: withAlias }], ['foo']).has(n)));
    const txSrc = "transaction<number>(async (tx) => 1);\ninTx(async (tx) => 2);\nimport { transaction as inTx } from 'x';\nawait c.query('BEGIN');\nawait c.query('COMMIT');\n";
    const sd = stripCommentsDetailed(txSrc, { jsx: false });
    add('SF-13 machinery: transactionCallbacks sees transaction<T>(, a renamed transaction and a hand-written BEGIN block', transactionCallbacks(lexCode(sd.text).bl, sd.text).length === 3, `${transactionCallbacks(lexCode(sd.text).bl, sd.text).length}`);
  }
  {
    // SF-12: a timeout must actually bound the wait
    const yes = ['3_000', '10000', '2.5e3', '0x10', 'KMS_CONNECT_MS', 'Number(process.env.T) || 5000'];
    const no = ['0', '0.0', '0e0', '00', 'Infinity', 'NaN', '-5', 'Number.POSITIVE_INFINITY', 'undefined', 'null', 'false', ''];
    add('SF-12 machinery: isBoundedTimeout accepts a positive number (underscores, exponent, hex) or an expression it cannot evaluate', yes.every(isBoundedTimeout), yes.filter((v) => !isBoundedTimeout(v)).join(' | '));
    add('SF-12 machinery: isBoundedTimeout rejects zero in every spelling, Infinity, NaN, a negative, undefined, null, false and nothing', no.every((v) => !isBoundedTimeout(v)), no.filter(isBoundedTimeout).join(' | '));
    const oldRule = (v) => !/^(?:0+|undefined|null|false)$/.test(v.replace(/_/g, '')) && v.length > 0;
    add('SF-12 machinery: the old zero rule treated 0.0, 0e0, Infinity, NaN and -5 as bounded timeouts (lethal control)', ['0.0', '0e0', 'Infinity', 'NaN', '-5'].every(oldRule));
    const site = (code) => { const f = { bl: lexCode(code).bl }; return kmsClientSites(f, false); };
    add('SF-12 machinery: kmsClientSites reads an in-place literal, a const literal and reports a call result or an import as unresolved',
      site('new KMSClient({ region })')[0]?.kind === 'literal' && site('const cfg = { region }; new KMSClient(cfg)')[0]?.kind === 'literal' && site('new KMSClient(makeConfig())')[0]?.kind === 'unresolved' && site('new KMSClient(cfg)')[0]?.kind === 'unresolved');
  }
  {
    // SF-10: which rows a DELETE reaches, and who runs the function that holds it
    const yes = ["DELETE FROM t WHERE state <> 'ARRIVAL_RECORDED'", "DELETE FROM t WHERE state != 'ARRIVAL_RECORDED'", "DELETE FROM t WHERE state NOT IN ('ARRIVAL_RECORDED')", "DELETE FROM t WHERE state IN ('PENDING_BYTES','WRITING_BYTES','BYTES_VERIFIED')", "DELETE FROM t WHERE state = 'PENDING_BYTES' OR state = 'WRITING_BYTES' OR state = 'BYTES_VERIFIED'"];
    const no = ["DELETE FROM t WHERE state = 'PENDING_BYTES'", "DELETE FROM t WHERE state IN ('PENDING_BYTES','WRITING_BYTES')", "DELETE FROM t WHERE state <> 'ARRIVAL_RECORDED' AND state <> 'WRITING_BYTES'", "DELETE FROM t WHERE state NOT IN ('ARRIVAL_RECORDED','PENDING_BYTES')", "DELETE FROM t WHERE state <> 'ARRIVAL_RECORDED' AND state = 'PENDING_BYTES'", 'DELETE FROM t WHERE id = $1'];
    add('SF-10 machinery: coversAllNonRecorded accepts sparing the recorded state or naming all three, and rejects one or two states, an extra negation, a narrowing AND and no state at all', yes.every(coversAllNonRecorded) && no.every((x) => !coversAllNonRecorded(x)), [...yes.filter((x) => !coversAllNonRecorded(x)), ...no.filter(coversAllNonRecorded)].join(' | '));
    const oldRule = (x) => /\b(?:PENDING_BYTES|WRITING_BYTES|BYTES_VERIFIED)\b|(?:<>|!=)\s*'ARRIVAL_RECORDED'/i.test(x);
    add('SF-10 machinery: the old rule counted a sweep that names ONE state as covering the non-recorded rows (lethal control)', oldRule("DELETE FROM t WHERE state = 'PENDING_BYTES'") && !coversAllNonRecorded("DELETE FROM t WHERE state = 'PENDING_BYTES'"));
    add('SF-10 machinery: importSpecs reads static, re-exported, side-effect, dynamic and require imports, and not a type-only import',
      JSON.stringify(importSpecs("import { a } from './x'; import type { T } from './t'; export * from '@/lib/y'; import './side'; const z = await import('./dyn'); const r = require('./r');")) === JSON.stringify(['./x', '@/lib/y', './side', './dyn', './r']));
    const known = new Set(['lib/a/x.ts', 'lib/y/index.ts', 'lib/a/w.ts', 'lib/c.ts']);
    add('SF-10 machinery: resolveImport maps a relative path, the @/ alias, a directory index and a .js specifier onto a repo file, and a package onto nothing',
      resolveImport('lib/a/b.ts', './x', known) === 'lib/a/x.ts' && resolveImport('lib/a/b.ts', '@/lib/y', known) === 'lib/y/index.ts' && resolveImport('lib/a/b.ts', './w.js', known) === 'lib/a/w.ts' && resolveImport('lib/a/b.ts', '../c', known) === 'lib/c.ts' && resolveImport('lib/a/b.ts', 'react', known) === null);
    const st = synth({
      'docker-compose.production.yml': 'services:\n  w:\n    command: ["npx", "tsx", "scripts/wired.ts"]\n',
      'app/api/x/route.ts': "import { a } from '@/lib/a';\nexport const GET = () => a();\n",
      'lib/a.ts': "import { b } from './b';\nexport const a = () => b();\n",
      'lib/b.ts': 'export const b = () => 1;\n',
      'lib/dead.ts': "import { b } from './b';\nexport const dead = () => b();\n",
      'scripts/wired.ts': "import { b } from '../lib/b';\nb();\n",
      'scripts/loose.ts': "import { dead } from '../lib/dead';\ndead();\n",
    });
    const files = ['app/api/x/route.ts', 'lib/a.ts', 'lib/b.ts', 'lib/dead.ts', 'scripts/wired.ts', 'scripts/loose.ts'];
    const wired = wiredChecker(st);
    const reach = deployedReach(st, files, wired);
    add('SF-10 machinery: a route, what it imports, and a script the production compose names are reachable; a library file nothing imports and an unwired script are not',
      reach('app/api/x/route.ts') && reach('lib/a.ts') && reach('lib/b.ts') && reach('scripts/wired.ts') && !reach('lib/dead.ts') && !reach('scripts/loose.ts'));
    add('SF-10 machinery: closure lists what a file imports transitively and nothing it does not', reach.closure('lib/a.ts').has('lib/b.ts') && !reach.closure('lib/a.ts').has('lib/dead.ts') && reach.closure('scripts/loose.ts').has('lib/b.ts'));
    const sampleOnly = synth({ 'docker-compose.production.yml': 'services:\n  w:\n    image: x\n', 'docker-compose.production.override.sample.yml': 'services:\n  w:\n    command: ["npx", "tsx", "scripts/ops/x.ts"]\n' });
    add('SF-10 machinery: a script named only in an override SAMPLE compose is not wired (lethal control: the old rule read every docker-compose file)', !wiredChecker(sampleOnly)('scripts/ops/x.ts') && /^docker-compose[^/]*\.ya?ml$/i.test('docker-compose.production.override.sample.yml'));
  }
  {
    // SF-15: per-service roots, a lone runner, and recognising services without command text
    const env = (o) => new Map(Object.entries(o));
    const base = { mounts: [], envFiles: [], command: '', entrypoint: '', image: '', build: null };
    add('SF-15 machinery: serviceVaultRoot reads an absolute literal FILE_STORAGE_PATH, falls back on none, and refuses an empty value, an interpolation, a relative path and a pass-through',
      serviceVaultRoot({ ...base, env: env({ FILE_STORAGE_PATH: '/srv/v/' }) }, '/d').root === '/srv/v' && serviceVaultRoot({ ...base, env: env({}) }, '/d').root === '/d' && serviceVaultRoot({ ...base, env: env({ FILE_STORAGE_PATH: '' }) }, '/d').root === null
      && serviceVaultRoot({ ...base, env: env({ FILE_STORAGE_PATH: '${DATA}/v' }) }, '/d').root === null && serviceVaultRoot({ ...base, env: env({ FILE_STORAGE_PATH: 'rel/v' }) }, '/d').root === null && serviceVaultRoot({ ...base, env: new Map([['FILE_STORAGE_PATH', null]]) }, '/d').root === null);
    const svc = (mounts, e = {}) => ({ ...base, env: env(e), mounts: mounts.map((m) => ({ kind: 'volume', readOnly: false, createHostPath: null, ...m })) });
    const model = (a, b) => ({ services: new Map([['web', a], ['worker', b]]) });
    const run = [{ name: 'web', via: 'the web app process' }, { name: 'worker', via: 'script s' }];
    const rootOf = (m) => (n) => serviceVaultRoot(m.services.get(n), '/app/data/vault');
    const V = (t) => ({ source: 'vault_data', target: t });
    const same = model(svc([V('/app/data/vault')]), svc([V('/app/data/vault')]));
    const diverged = model(svc([V('/srv/vault')], { FILE_STORAGE_PATH: '/srv/vault' }), svc([V('/app/data/vault')]));
    const imageLocal = model(svc([V('/app/data/vault')], { FILE_STORAGE_PATH: '/srv/other' }), svc([V('/app/data/vault')]));
    const moved = model(svc([V('/srv/vault')], { FILE_STORAGE_PATH: '/srv/vault' }), svc([V('/srv/vault')], { FILE_STORAGE_PATH: '/srv/vault' }));
    add('SF-15 machinery: vaultParity judges each runner at its own root: a legitimate move to /srv/vault passes (no false RED), two roots fail, a root nobody mounts fails', vaultParity(moved, run, rootOf(moved)).bad.length === 0 && vaultParity(moved, run, rootOf(moved)).ok.length === 1 && vaultParity(diverged, run, rootOf(diverged)).bad.some((b) => b.includes('different vault roots')) && vaultParity(imageLocal, run, rootOf(imageLocal)).bad.some((b) => b.includes('mounts nothing at /srv/other')) && vaultParity(same, run, rootOf(same)).bad.length === 0);
    add('SF-15 machinery: the old rule judged every service at the code default, so the same /srv/other service passed (lethal control)', vaultParity(imageLocal, run, '/app/data/vault').bad.length === 0 && vaultParity(moved, run, '/app/data/vault').bad.length === 2);
    const lone = model(svc([]), svc([V('/app/data/vault')]));
    add('SF-15 machinery: a lone runner with no mount is a violation under strictSingle (production) and only a state otherwise; an unresolvable root is UNKNOWN',
      vaultParity(lone, [run[0]], '/app/data/vault', { strictSingle: true }).bad.length === 1 && vaultParity(lone, [run[0]], '/app/data/vault').bad.length === 0 && vaultParity(lone, [run[1]], '/app/data/vault', { strictSingle: true }).bad.length === 0
      && vaultParity(lone, run, () => ({ root: null, why: 'sets FILE_STORAGE_PATH to something other than an absolute literal path' })).unknown.length === 2);
    // classification: a service tied to the sweep by what it IS, not by the words of its command
    const t2 = synth({
      'scripts/a.ts': "import { sink } from '../lib/sink';\nsink();\n", 'scripts/b.ts': "import { other } from '../lib/other';\nother();\n", 'scripts/c.sh': 'npx tsx scripts/a.ts\n',
      'lib/sink.ts': 'export const sink = () => 1;\n', 'lib/other.ts': 'export const other = () => 2;\n',
    });
    const entries = { entrypointRunsServer: true, webHosted: true, scripts: [], closure: (st) => new Set([st, ...(st === 'scripts/a.ts' ? ['lib/sink.ts'] : st === 'scripts/b.ts' ? ['lib/other.ts'] : [])]), sinks: new Set(['lib/sink.ts']) };
    const mk = (image, command) => ({ ...base, env: env({}), image, command });
    const cl = classifyServices(t2, { services: new Map([['web', mk('app:1', '')], ['w1', mk('app:1', 'npx tsx scripts/a.ts')], ['w2', mk('app:1', 'npx tsx scripts/b.ts')], ['w3', mk('app:1', 'npm start')], ['w4', mk('app:1', './scripts/c.sh')], ['db', mk('postgres:16', 'postgres -c x')]]) }, entries);
    add('SF-15 machinery: classifyServices ties the web service to the sweep with no command text, finds a script runner through imports and through a shell script, leaves a non-sweeping script out, and reports an unreadable command as unclassified',
      cl.runners.map((r) => r.name).sort().join() === 'w1,w4,web' && cl.unclassified.join() === 'w3' && cl.hasWeb, JSON.stringify(cl));
    const namedOnly = [...new Map([['web', mk('app:1', '')], ['w1', mk('app:1', 'npx tsx scripts/a.ts')]])].filter(([, v]) => /entrypoint\.sh|server\.js/.test(`${v.command} ${v.entrypoint}`) || v.command.includes('scripts/a.ts')).map(([n]) => n);
    add('SF-15 machinery: the old command-text rule recognised only the script runner and let the web service drop out of the set (lethal control)', namedOnly.join() === 'w1' && cl.runners.some((r) => r.name === 'web'));
  }
  {
    // SF-14: every SDK command counts, under the name the SDK gives it
    const f = { code: "import { DecryptCommand as D, type X, EncryptCommand } from '@aws-sdk/client-kms';\nimport * as kms from '@aws-sdk/client-kms';\nimport type { KMSClientConfig } from '@aws-sdk/client-kms';\n" };
    const sdk = kmsSdkImports(f);
    add('SF-14 machinery: kmsSdkImports maps a renamed command to the SDK name, lists a namespace import, and ignores a type-only import',
      sdk.commands.get('D') === 'DecryptCommand' && sdk.commands.get('EncryptCommand') === 'EncryptCommand' && !sdk.commands.has('X') && sdk.namespaces.join() === 'kms' && sdk.importsSdk);
    add('SF-14 machinery: the old two-name list could not see an EncryptCommand or a renamed DecryptCommand (lethal control)', !SF14_NAMES.includes('EncryptCommand') && sdk.commands.get('D') !== undefined && !SF14_NAMES.includes('D'));
  }
  {
    // SF-17: the families of claim, the hedge, and a qualification that is not a negation
    const sentences = {
      'nothing-left': ['Nothing remains.', 'nothing of yours is left', 'No copy is kept.'],
      erased: ['Your writing and the original file are erased.', 'It is wiped.', 'Erases this Work and its writing.', 'The file was permanently destroyed.'],
      'for-good': ['Deletes this Work and its writing for good.', 'It is gone forever.', 'Removed for ever.'],
      unrecoverable: ['It cannot be recovered.', 'This is unrecoverable.', 'There is no way to get it back.', 'It is beyond recovery.'],
    };
    const hit = (id, x) => new RegExp(ERASURE_CLAIMS.find((c) => c.id === id).re.source, 'i').test(x);
    add('SF-17 machinery: the added families (nothing left, erased, for good, unrecoverable) each match their sentences', Object.entries(sentences).every(([id, list]) => list.every((x) => hit(id, x))), Object.entries(sentences).flatMap(([id, list]) => list.filter((x) => !hit(id, x))).join(' | '));
    const hedged = 'This work was removed, but we could not confirm the original file was destroyed, so we are not going to tell you it is gone.';
    const m = new RegExp(ERASURE_CLAIMS.find((c) => c.id === 'erased').re.source, 'gi').exec(hedged);
    const prefixed = 'Whether you like it or not, your writing is erased.';
    const m2 = new RegExp(ERASURE_CLAIMS.find((c) => c.id === 'erased').re.source, 'gi').exec(prefixed);
    add('SF-17 machinery: a hedged sentence (we could not confirm ... was destroyed) is skipped by the hedge rule, an unhedged one is not, and a loose prefix such as whether does not switch the rule off', m !== null && isHedged(hedged, m.index) && !isHedged('Your writing is erased.', 5) && m2 !== null && !isHedged(prefixed, m2.index));
    const qual = ['Copies held in backups can remain for a limited time after deletion.', 'Backups can keep a copy for a limited time.', 'nothing is kept, apart from backups that expire in time', 'Permanently deletes this Work (backups expire in time).'];
    const neg = ['We keep no backups.', 'Permanently deletes this Work (no backups are kept).', 'This happens without any backups.', 'Backups are not kept.', 'backups never hold a copy', 'There is no word about it.'];
    add('SF-17 machinery: backupQualified accepts a statement that backups may keep a copy, and rejects a negation or no mention', qual.every(backupQualified) && neg.every((x) => !backupQualified(x)), [...qual.filter((x) => !backupQualified(x)), ...neg.filter(backupQualified)].join(' | '));
    add('SF-17 machinery: the old rule (the word backups anywhere) accepted every negation (lethal control)', neg.slice(0, 5).every((x) => /\bback-?ups?\b/i.test(x)));
    add('SF-17 machinery: an erasure claim about the Work is recognised in a shared component only when its own copy is about the Work', WORK_TOPIC.test('Permanently deletes this Work and its writing.') && !WORK_TOPIC.test('Nothing is stored beyond this device.'));
  }
  {
    // SF-16: file-name families and the shape of an AWS secret key
    const comp = ['compose.yaml', 'compose.yml', 'compose.override.yaml', 'docker-compose.yml', 'docker-compose.production.yml'];
    const notComp = ['composer.yml', 'compose.md', 'my-compose.txt'];
    add('SF-16 machinery: COMPOSE_BASENAME accepts docker-compose*.yml and the Compose-spec compose.y(a)ml, and not lookalikes', comp.every((n) => COMPOSE_BASENAME.test(n)) && notComp.every((n) => !COMPOSE_BASENAME.test(n)));
    add('SF-16 machinery: DOCKERFILE_RE accepts Dockerfile, Dockerfile.x, name.Dockerfile and Containerfile', ['Dockerfile', 'Dockerfile.fast', 'web.Dockerfile', 'Containerfile'].every((n) => DOCKERFILE_RE.test(n)) && !DOCKERFILE_RE.test('Dockerfile'.toLowerCase().replace('d', 'x')));
    const envs = ['.env.example', 'env.example', '.env.docker.template', 'monitor.env.example', 'env.template', 'example.env'];
    add('SF-16 machinery: ENV_EXAMPLE_RE accepts .env.example and its relatives (env.example, name.env.example, env.template), and not a source file', envs.every((n) => ENV_EXAMPLE_RE.test(n)) && !['env.ts', 'environment.example', 'envelope.template'].some((n) => ENV_EXAMPLE_RE.test(n)));
    const sec = fakeSecret40();
    add('SF-16 machinery: a runtime-generated 40-character secret has the secret shape; a git SHA, a digit-free identifier and a 41-character run do not',
      looksLikeSecret(sec) && [...`X: ${sec}`.matchAll(SECRET_SHAPE)].length === 1 && ![...`X: ${randomBytes(20).toString('hex')}`.matchAll(SECRET_SHAPE)].some((x) => looksLikeSecret(x[0])) && ![...`X: ${'Ab'.repeat(20)}`.matchAll(SECRET_SHAPE)].some((x) => looksLikeSecret(x[0])) && [...`X: ${sec}Q`.matchAll(SECRET_SHAPE)].length === 0);
    add('SF-16 machinery: the key-id shape alone could not see that secret (lethal control)', !KEY_ID_SHAPE.test(`X: ${sec}`) && !AWS_STATIC_NAMES.some((n) => `BACKUP_UPLOADER_VALUE: ${sec}`.includes(n)));
  }

  // ---------- 1. shape of every falsifier ----------
  let obligationIds = new Set();
  try {
    const idx = JSON.parse(fs.readFileSync(path.join(HERE, 'obligation-index.json'), 'utf8'));
    obligationIds = new Set((idx.obligations ?? idx).map((o) => o.id));
  } catch {
    /* reported below */
  }
  add('obligation-index.json is readable and non-empty', obligationIds.size > 0, `${obligationIds.size} ids`);
  const ids = FALSIFIERS_B.map((x) => x.id);
  add('exactly SF-10 .. SF-19 with SF-16 split into SF-16a and SF-16b, in order', JSON.stringify(ids) === JSON.stringify(['SF-10', 'SF-11', 'SF-12', 'SF-13', 'SF-14', 'SF-15', 'SF-16a', 'SF-16b', 'SF-17', 'SF-18', 'SF-19']), ids.join(','));
  const wantRuling = { 'SF-10': 'D3', 'SF-12': 'D9', 'SF-16b': 'runbook step 2', 'SF-17': 'D5' };
  for (const F of FALSIFIERS_B) {
    const shape =
      typeof F.title === 'string' && typeof F.law === 'string' && F.law.length > 20 && typeof F.whyExpected === 'string' && F.whyExpected.length > 40 &&
      Array.isArray(F.obligations) && F.obligations.length > 0 && Array.isArray(F.claims) && F.claims.length > 0 &&
      ['law', 'inventory', 'state'].includes(F.kind) && ['GREEN', 'RED'].includes(F.expectedToday) &&
      (F.rulingPending === null || typeof F.rulingPending === 'string') && typeof F.check === 'function' && Array.isArray(F.defeats);
    add(`${F.id}: contract shape`, shape);
    add(`${F.id}: rulingPending is ${wantRuling[F.id] ? wantRuling[F.id] : 'null'}`, F.rulingPending === (wantRuling[F.id] ?? null), String(F.rulingPending));
    const missing = F.obligations.filter((o) => !obligationIds.has(o));
    add(`${F.id}: every obligation id exists in obligation-index.json`, missing.length === 0, missing.join(','));
    const wantKind = F.expectedToday === 'GREEN' ? 'break' : 'fix';
    const wantExpect = F.expectedToday === 'GREEN' ? 'RED' : 'GREEN';
    add(`${F.id}: has a '${wantKind}' defeat expecting ${wantExpect}`, F.defeats.some((d) => d.kind === wantKind && d.expect === wantExpect));
    add(`${F.id}: every defeat has a legal kind, a legal expectation and an apply function`, F.defeats.every((d) => ['break', 'fix'].includes(d.kind) && ['GREEN', 'RED'].includes(d.expect) && typeof d.apply === 'function' && typeof d.name === 'string'));
    add(`${F.id}: a 'break' defeat only on a GREEN falsifier and expecting RED`, F.defeats.every((d) => d.kind !== 'break' || (F.expectedToday === 'GREEN' && d.expect === 'RED')));
    add(`${F.id}: a 'fix' defeat only on a RED falsifier`, F.defeats.every((d) => d.kind !== 'fix' || F.expectedToday === 'RED'));
    add(`${F.id}: carries a SUBTLE defeat or decoys that a naive check would misjudge`, F.defeats.some((d) => /SUBTLE/.test(d.name)) || (F.decoys ?? []).length > 0);
    const holds = F.expectedToday === 'RED' ? F.defeats.some((d) => d.kind === 'fix' && d.expect === 'RED') : (F.decoys ?? []).some((d) => d.expect === 'GREEN');
    add(`${F.id}: has a change that looks like a ${F.expectedToday === 'RED' ? 'fix' : 'break'} but must not flip the verdict (a check that only ever flips is not proven discriminating)`, holds);
  }

  // ---------- 2. real tree outcome == expectedToday; evidence is content-free ----------
  for (const F of FALSIFIERS_B) {
    const r = runCheck(F, tree);
    add(`${F.id}: real tree is ${F.expectedToday}`, verdict(r) === F.expectedToday && !r.threw, `got ${verdict(r)}${r.threw ? ` (${r.threw})` : ''}`);
    add(`${F.id}: real-tree evidence has no INCONCLUSIVE line (the verdict rests on files that were read)`, !hasLine(r, 'INCONCLUSIVE:'), r.evidence.filter((l) => l.startsWith('INCONCLUSIVE:')).join(' | '));
    add(`${F.id}: evidence is non-empty, single-line, quote-free and bounded (content-free by construction)`, r.evidence.length > 0 && r.evidence.every((l) => TOKEN_FREE.test(l)), r.evidence.filter((l) => !TOKEN_FREE.test(l)).slice(0, 2).join(' | '));
    if (F.expectedToday === 'RED') add(`${F.id}: a RED real tree states a VIOLATION, not only an inconclusive file`, hasLine(r, 'VIOLATION:'));
    if (F.expectedToday === 'GREEN') add(`${F.id}: a GREEN real tree states at least one ok: line (no vacuous pass)`, hasLine(r, 'ok:'));
  }

  // ---------- 3. every defeat and decoy flips (or holds) as declared, for its named reason ----------
  for (const F of FALSIFIERS_B) {
    for (const d of [...F.defeats, ...(F.decoys ?? []).map((x) => ({ ...x, decoy: true }))]) {
      const a = tryApply(d, tree);
      if (a.error) {
        add(`${F.id} ${d.decoy ? 'decoy' : 'defeat'} applies: ${d.name}`, false, a.error);
        continue;
      }
      const r = runCheck(F, a.tree);
      const got = verdict(r);
      add(`${F.id} ${d.decoy ? 'decoy' : 'defeat'} -> ${d.expect}: ${d.name}`, got === d.expect && !r.threw && (!d.decoy || d.expect === F.expectedToday), `got ${got}`);
      if (d.expect === 'RED') {
        add(`${F.id} dies for its named reason, not by making a file unreadable: ${d.name}`, !hasLine(r, 'INCONCLUSIVE:') && (!d.diesBecause || r.evidence.some((l) => l.includes(d.diesBecause))), `wanted "${d.diesBecause ?? ''}" in: ${r.evidence.filter((l) => l.startsWith('VIOLATION:')).join(' | ').slice(0, 200)}`);
      } else {
        add(`${F.id} leaves no VIOLATION or INCONCLUSIVE line: ${d.name}`, !hasLine(r, 'VIOLATION:') && !hasLine(r, 'INCONCLUSIVE:'), r.evidence.filter((l) => l.startsWith('VIOLATION:') || l.startsWith('INCONCLUSIVE:')).join(' | ').slice(0, 200));
      }
      add(`${F.id} evidence is content-free: ${d.name}`, r.evidence.every((l) => TOKEN_FREE.test(l)));
      add(`${F.id} changed the tree (it is not a vacuous mutation): ${d.name}`, a.tree.touched().length > 0);
    }
  }

  // ---------- 4. fail-closed paths and extra lethality ----------
  const scratch = [];
  const emptyTree = () => {
    const d = fs.mkdtempSync(path.join(fs.realpathSync(process.env.TMPDIR || '/tmp'), 'wsi-fb-empty-'));
    scratch.push(d);
    return createTree(d);
  };
  {
    const incon = (F, t) => {
      const r = runCheck(F, t);
      return !r.ok && hasLine(r, 'INCONCLUSIVE:') && !r.threw;
    };
    add('SF-10 a tree with no source files is INCONCLUSIVE, never GREEN', incon(SF10, emptyTree()));
    add('SF-11 renaming the callee so no call remains is INCONCLUSIVE, not a pass', incon(SF11, tree.replace(LANDING, 'loadRecordedArrival', 'loadRecordedRow')));
    add('SF-11 a missing file is INCONCLUSIVE', incon(SF11, tree.remove(LANDING)));
    add('SF-12 a missing key authority is INCONCLUSIVE', incon(SF12, tree.remove(KEY_AUTHORITY)));
    add('SF-12 a client built from a bare config variable (no literal to read) is INCONCLUSIVE', incon(SF12, tree.replace(KEY_AUTHORITY, KMS_CALL, '  kmsClientCache = factory(buildConfig(region));')));
    add('SF-13 a claim function with no transaction is INCONCLUSIVE', incon(SF13, tree.replace(ARRIVALS, SF13_TX, 'return run(async (tx) => {')));
    add('SF-13 a file the stripper cannot close is INCONCLUSIVE', incon(SF13, tree.edit(ARRIVALS, (s) => `${s}\n/* never closed`)));
    add('SF-14 an emptied library is INCONCLUSIVE', incon(SF14, emptyTree()));
    add('SF-15 a missing production compose is INCONCLUSIVE', incon(SF15, tree.remove(COMPOSE_PROD)));
    add('SF-15 an entrypoint that no longer starts the server is INCONCLUSIVE (the web service would otherwise drop out of the set and parity pass vacuously)', incon(SF15, tree.replace(ENTRYPOINT, 'exec node server.js', 'exec npm start')));
    add('SF-16a a tree with no env example is INCONCLUSIVE, never GREEN', incon(SF16A, ['.env.android.template', '.env.docker.template', '.env.example', 'ios/App/.env.example', 'clients/templates/env.template', 'scripts/monitor.env.example'].reduce((t, r) => t.remove(r), tree)));
    add('SF-16b a compose file with no maia service is INCONCLUSIVE', incon(SF16B, tree.replace(COMPOSE_PROD, '\n  maia:\n    build: *maia_build', '\n  maia-renamed:\n    build: *maia_build')));
    add('SF-17 the Delete Work copy moved out of the scanned directories is INCONCLUSIVE, not a pass',
      incon(SF17, tree
        .edit(DELETE_WORK, (s) => { const a = s.indexOf('export const DELETE_WORK_COPY = {'); const b = s.indexOf('} as const;', a); return a < 0 || b < 0 ? s : `${s.slice(0, a)}export { DELETE_WORK_COPY } from '@/lib/copy/deleteWorkCopy';${s.slice(b + '} as const;'.length)}`; })
        .add('lib/copy/deleteWorkCopy.ts', "export const DELETE_WORK_COPY = { body: 'This deletes the writing. Nothing is kept.', hint: 'Permanently deletes it.' } as const;\n")
        .replace(FIXTURE_REL, FIXTURE_HINT, "hint: 'Deletes this Work and its writing.' },")));
    add('SF-17 a manifest with no literal permanentErasureCertified is INCONCLUSIVE', incon(SF17, tree.replace(RELEASE_AUTHORITY, 'permanentErasureCertified: false,', 'permanentErasureCertified: computed(),')));
    add('SF-18 an empty declared set is INCONCLUSIVE', !sf18Check(tree, {}).ok && hasLine(sf18Check(tree, {}), 'INCONCLUSIVE:'));
    add('SF-19 a key authority without selectedProvider is INCONCLUSIVE', incon(SF19, tree.replace(KEY_AUTHORITY, 'function selectedProvider(', 'function chooseProvider(')));
  }
  {
    const incon = (F, t) => {
      const r = runCheck(F, t);
      return !r.ok && hasLine(r, 'INCONCLUSIVE:') && !r.threw;
    };
    const fixedWorker = (t) => t.replace(COMPOSE_PROD, MEDIA_COMPOSE_ANCHOR, '$1\n      - vault_data:/app/data/vault');
    add('SF-15 a web service started by a script this check cannot read (boot.sh) is INCONCLUSIVE, so the sweep cannot be left out of the set', incon(SF15, fixedWorker(tree.replace(COMPOSE_PROD, 'command: ["./scripts/entrypoint.sh"]', 'command: ["./scripts/boot.sh"]'))));
    add('SF-15 a web service started by npm start is INCONCLUSIVE', incon(SF15, fixedWorker(tree.replace(COMPOSE_PROD, 'command: ["./scripts/entrypoint.sh"]', 'command: ["npm", "start"]'))));
    add('SF-15 a worker started by npm run is INCONCLUSIVE (it may still sweep an image-local directory)', incon(SF15, tree.replace(COMPOSE_PROD, 'command: ["npx", "tsx", "scripts/run-media-worker.ts"]', 'command: ["npm", "run", "worker:media"]')));
    add('SF-15 a FILE_STORAGE_PATH written as an interpolation is INCONCLUSIVE, never read as the default', incon(SF15, tree.replace(COMPOSE_PROD, '      PORT: "3000"\n', '      PORT: "3000"\n      FILE_STORAGE_PATH: "${VAULT_ROOT}"\n')));
    add('SF-15 a FILE_STORAGE_PATH passed through from the host is INCONCLUSIVE', incon(SF15, tree.replace(COMPOSE_PROD, '      PORT: "3000"\n', '      PORT: "3000"\n      FILE_STORAGE_PATH:\n')));
    add('SF-12 a client configuration that spreads another object is INCONCLUSIVE, since a requestHandler may arrive through it', incon(SF12, tree.replace(KEY_AUTHORITY, KMS_CALL, '  kmsClientCache = factory({ region, maxAttempts: 3, ...baseConfig });')));
    add('SF-12 a second client built from a call result in another file is INCONCLUSIVE', incon(SF12, withConfig(tree, '    requestHandler: { connectionTimeout: 3_000, requestTimeout: 10_000 },').add(`${SOURCE_DIR}/kmsOther.ts`, "import { KMSClient } from '@aws-sdk/client-kms';\nexport const other = (region: string) => new KMSClient(buildConfig(region));\n")));
    add('SF-13 a library file the literal scanner cannot close is INCONCLUSIVE rather than skipped', incon(SF13, tree.add(`${SOURCE_DIR}/broken.ts`, "export const x = 'never closed;\nexport const y = 1;\n")));
  }
  {
    // a stale defeat must raise instead of silently doing nothing, or a defeat could pass by changing nothing
    let threw = null;
    try { tree.replace(LANDING, 'this text is not in the file', 'x'); } catch (e) { threw = e; }
    add('a defeat built from text that is no longer in the file throws VacuousMutation instead of doing nothing', threw instanceof VacuousMutation, threw ? threw.name : 'did not throw');
    let threw2 = null;
    try { tree.replace(LANDING, 'return loadRecordedArrival(', 'return loadRecordedArrival('); } catch (e) { threw2 = e; }
    add('a defeat that rewrites text to itself throws VacuousMutation too', threw2 instanceof VacuousMutation, threw2 ? threw2.name : 'did not throw');
  }
  {
    // SF-14: the derived 1 + 3 totals do not depend on the declared table. Bless the table of a wrong tree (so every
    // row matches) and the law about the totals must still fail.
    const blessed = (t) => Object.fromEntries([...kmsCallTable(t, report())].map(([k, v]) => [k, Object.fromEntries(v)]));
    const commitExtra = SF14.defeats[0].apply(tree);
    const verifyTwice = SF14.defeats.find((d) => /inspects twice/.test(d.name)).apply(tree);
    const a = sf14Check(commitExtra, blessed(commitExtra));
    const b = sf14Check(verifyTwice, blessed(verifyTwice));
    add('SF-14 an extra Decrypt in the commit path still fails the 1 + 3 totals when the declared table is edited to match', !a.ok && hasLine(a, 'VIOLATION:', '4 Decrypt') && !hasLine(a, 'VIOLATION:', 'declared model has'), a.evidence.filter((l) => l.startsWith('VIOLATION')).join(' | ').slice(0, 220));
    add('SF-14 a repeated call in the verify step still fails the 1 + 3 totals when the declared table is edited to match', !b.ok && hasLine(b, 'VIOLATION:', '4 Decrypt'), b.evidence.filter((l) => l.startsWith('VIOLATION')).join(' | ').slice(0, 220));
    const claimTwice = SF14.defeats.find((d) => /claimArrival recovers the bytes twice/.test(d.name)).apply(tree);
    const d2 = sf14Check(claimTwice, blessed(claimTwice));
    add('SF-14 a repeated recover on the claim path still fails the 1 + 3 totals when the declared table is edited to match', !d2.ok && hasLine(d2, 'VIOLATION:', '4 Decrypt'), d2.evidence.filter((l) => l.startsWith('VIOLATION')).join(' | ').slice(0, 220));
    const c = sf14Check(tree, blessed(tree));
    add('SF-14 blessing the real tree changes nothing (the declared table IS the real table)', c.ok);
  }
  {
    // SF-16a reads what is COMMITTED: an untracked git-absent override on the host must not count, a tracked one must
    const files = { 'docker-compose.yml': 'services:\n  a:\n    image: x\n', Dockerfile: 'FROM scratch\n', '.env.example': 'A=1\n' };
    const leak = `services:\n  a:\n    environment:\n      AWS_ACCESS_KEY_ID: ${fakeKeyId()}\n`;
    let dirs = [];
    try {
      const d1 = makeRepo('untracked', files, { 'docker-compose.override.yml': leak });
      const d2 = makeRepo('tracked', { ...files, 'docker-compose.override.yml': leak });
      dirs = [d1, d2];
      const r1 = sf16aCheck(createTree(d1));
      const r2 = sf16aCheck(createTree(d2));
      add('SF-16a an untracked override carrying a key is skipped (the law is about what is committed) and said so', r1.ok && hasLine(r1, 'context:', 'untracked or ignored'), r1.evidence.join(' | ').slice(0, 200));
      add('SF-16a the same override once tracked is a violation', !r2.ok && hasLine(r2, 'VIOLATION:', 'AWS_ACCESS_KEY_ID'), r2.evidence.join(' | ').slice(0, 200));
    } catch (e) {
      add('SF-16a the tracked-versus-untracked control could run (git is available)', false, e.message);
    } finally {
      for (const d of dirs) fs.rmSync(d, { recursive: true, force: true });
    }
  }
  {
    // the module itself stays free of anything key-shaped, and runs without a network or a child other than git
    const me = fs.readFileSync(fileURLToPath(import.meta.url), 'utf8');
    add('this module carries no key-id-shaped literal, no ARN and no private-key marker', !KEY_ID_SHAPE.test(me) && !new RegExp(`arn${':'}aws${':'}`).test(me) && !new RegExp(`BEGIN [A-Z ]*PRIV${'ATE'} KEY`).test(me));
    const header = me.slice(0, me.indexOf('const HERE'));
    const imports = [...header.matchAll(/^import .* from '([^']+)';$/gm)].map((m) => m[1]);
    add('this module imports only node: built-ins and the two suite libraries', imports.length > 0 && imports.every((m) => m.startsWith('node:') || m === './lib/tree.mjs' || m === './lib/strip.mjs'), imports.join(','));
  }

  for (const d of [...scratch, ...synthDirs]) fs.rmSync(d, { recursive: true, force: true });
  return { ok: checks.every((c) => c.ok), checks };
}

// =====================================================================================================
// 10. RUN DIRECTLY
// =====================================================================================================

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const r = selfTest();
  const bad = r.checks.filter((c) => !c.ok);
  const real = FALSIFIERS_B.map((F) => {
    const x = runCheck(F, createTree(ROOT));
    return `${F.id} ${verdict(x)}${verdict(x) === F.expectedToday ? '' : ' (UNEXPECTED)'}`;
  });
  const defeats = FALSIFIERS_B.reduce((n, F) => n + F.defeats.length, 0);
  const decoys = FALSIFIERS_B.reduce((n, F) => n + (F.decoys ?? []).length, 0);
  console.log(`falsifiers-b self-test: ${r.ok ? 'PASS' : 'FAIL'} ${r.checks.length - bad.length}/${r.checks.length} checks; ${FALSIFIERS_B.length} falsifiers, ${defeats} defeats, ${decoys} decoys`);
  console.log(`real tree: ${real.join(' | ')}`);
  for (const c of bad) console.log(`  FAIL ${c.name}${c.detail ? ` -- ${c.detail}` : ''}`);
  process.exit(r.ok ? 0 : 1);
}
