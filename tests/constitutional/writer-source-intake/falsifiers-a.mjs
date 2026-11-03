// falsifiers-a.mjs -- nine static falsifiers about ROUTES, AUDIENCE and HOLDS for the Writer
// original-file intake (SF-01 ... SF-09).
//
// Plain Node ESM, node: built-ins plus ./lib/tree.mjs only. Fictional data only. Every check reads the
// repository through an immutable Tree (comment-stripped, then string-literal-blanked, so neither a comment
// nor a string can satisfy or defeat a law), and every evidence line is content-free: a path, a line number,
// a count, a fixed phrase of this module. Never a matched source line.
//
// EXPORTS
//   FALSIFIERS_A   the nine falsifier objects (contract in the lane brief)
//   selfTest()     { ok, checks } -- the lethality proof (see below)
//   Run directly:  node falsifiers-a.mjs   -> compact result, exit 0 on ok, 1 otherwise
//
// THE CONTRACT, AS IMPLEMENTED
//   { id, title, law, obligations, claims, kind, expectedToday, whyExpected, rulingPending,
//     check(tree) -> { ok, evidence[] }, defeats[{ name, kind:'break'|'fix', apply(tree), expect }] }
//   GREEN = the law HOLDS (check.ok); RED = the law is VIOLATED today. A GREEN falsifier carries >=1 'break'
//   defeat expecting RED; a RED falsifier carries >=1 'fix' defeat expecting GREEN.
//   Two OPTIONAL fields beyond the contract, ignored by anything that does not know them:
//     defeat.diesBecause  a fragment that MUST appear in the evidence of a RED outcome, so a defeat cannot
//                         "pass" by making the file unreadable or by any reason other than the named one
//     falsifier.decoys    the opposite of a defeat: realistic edits that a NAIVE check would misjudge
//                         (a comment, a string, an ignored result, a gate placed too late). Each declares the
//                         outcome the real law requires, which is always the unchanged real-tree outcome.
//
// FAIL-CLOSED EVERYWHERE: a missing file, a file the comment stripper or the literal scanner could not close, or
// a handler this module cannot locate yields an "INCONCLUSIVE:" evidence line and ok:false. UNKNOWN is never
// GREEN, and a defeat that "works" only because a file became unreadable is rejected by selfTest.
//
// HOW A GATE IS RECOGNISED (section 1b). Not by the tokens it mentions but by what it DOES in the world the law
// is about. Each law names a hazard (the manifest says held, the audience predicate denies, the text is empty,
// the session is in Sanctuary, the claim returned false); a small three-valued partial evaluator gives that
// hazard's atom its value, leaves every other input UNKNOWN, and a condition counts as a gate only if it comes out
// definitely TRUE. So `!HOLD && header` (unknown), `HOLD || env` (unknown), an inverted test (false) and a gate
// whose arm returns 200 are all "not a gate", while a gate behind a helper function, a destructured local or an
// aliased constant is followed to the same answer. selfTest checks the evaluator against brute force: a verdict
// of "definitely true" is never contradicted by trying every combination of the open inputs.
//
// KNOWN LIMITS (read, not hidden)
//   * Gates are statement-level `if (<cond>) { ... }` or `if (<cond>) return ...;` that run on every request
//     (not inside a branch, loop, callback or braceless if; an else-if carries the negation of the links before
//     it). A hold written as a ternary or an `&&` chain statement is NOT recognised and reads as RED (the safe
//     direction: an unrecognised hold never counts as a hold).
//   * A helper is followed when it is a function whose body is a single `return EXPR` (any preceding statements
//     being const declarations) or a chain of `if (c) return <4xx/5xx response>` ending in `return null`. Loops,
//     try/catch, reassigned variables and anything the expression parser cannot read are UNKNOWN, never a hold.
//   * An earlier `return` that plainly SUCCEEDS (2xx/3xx or a statusless response) before a gate means the gate
//     can be skipped and it is not credited; a bare `return value` or `return helper()` is not classified.
//   * Handlers are recognised as a declaration, a const arrow, an alias (`export const POST = handler`, `export {
//     handler as POST }`) or the first function inside a wrapper call. A POST export in any other form (re-export,
//     factory) is INCONCLUSIVE for SF-01 and every other law, never "no handler".
//   * SF-03 finds an upload door by (a) a direct `.formData(`, (b) a route that reaches a file with one through up
//     to three local imports, (c) a handler that reads its request with arrayBuffer/blob/body AND a file that
//     stores something. A door that reads its body through a function it is not handed the request for (a global
//     or a closure), or a store this vocabulary does not name, is not seen. A "stores nothing" claim is tested
//     against the broad storage vocabulary, not a short list of write names.
//   * Name resolution is by file and brace scope, not a full symbol table: a parameter that shadows a module
//     constant of the same name resolves to the constant.
//   * JSX text containing an apostrophe cannot be told from a string start; SF-09's TSX scan is line-local.
//   * This is static text analysis, not execution.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createTree, VacuousMutation } from './lib/tree.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '../../..');
const SUITE_REL = path.relative(ROOT, HERE).split(path.sep).join('/');
const DISPOSITIONS_REL = `${SUITE_REL}/dispositions.json`;

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

/**
 * Replace the CONTENT of string, template and regex literals with spaces (quotes stay, newlines stay, every
 * offset is preserved). Run on already comment-stripped code, so after this a token can only be matched where
 * it is CODE. Returns { text, issues }; an unterminated literal is reported, never guessed at.
 */
function blankLiterals(code) {
  const n = code.length;
  const out = code.split('');
  const issues = [];
  const lineOf = (idx) => lineAt(code, idx);
  const blank = (a, b) => {
    for (let k = a; k < b; k++) {
      const c = out[k];
      if (c !== '\n' && c !== '\r') out[k] = ' ';
    }
  };
  function quoted(i, q) {
    let j = i + 1;
    while (j < n) {
      const ch = code[j];
      if (ch === '\\') { j += 2; continue; }
      if (ch === q) { blank(i + 1, j); return j + 1; }
      if (ch === '\n') { issues.push({ kind: 'unterminated-string', line: lineOf(i) }); blank(i + 1, j); return j; }
      j++;
    }
    issues.push({ kind: 'unterminated-string', line: lineOf(i) });
    blank(i + 1, n);
    return n;
  }
  function template(i) {
    let j = i + 1;
    while (j < n) {
      const ch = code[j];
      if (ch === '\\') { j += 2; continue; }
      if (ch === '`') { blank(i + 1, j); return j + 1; }
      if (ch === '$' && code[j + 1] === '{') {
        // A substitution holds CODE, not text: strings, regex literals and nested templates inside it must be
        // recognised by the same scanner as the rest of the file, or a quote inside a regex (`${n.replace(/"/g, '')}`)
        // opens a string that never closes and the rest of the file is blanked.
        j = scanCode(j + 2, true);
        continue;
      }
      j++;
    }
    issues.push({ kind: 'unterminated-template', line: lineOf(i) });
    blank(i + 1, n);
    return n;
  }
  const RX_WORDS = new Set(['return', 'typeof', 'case', 'in', 'of', 'delete', 'void', 'throw', 'new', 'else', 'do', 'yield', 'await', 'instanceof']);
  const RX_PREV = '(,=:[!&|?{};+-*%~^';
  // Scan code from `start`. With `inSubst` it stops after the `}` that closes the enclosing `${`; otherwise it runs
  // to the end of the text. Strings, templates and regex literals are blanked as they are met.
  function scanCode(start, inSubst) {
    let i = start;
    let depth = 0;
    let prev = '';
    let prevWord = '';
    while (i < n) {
      const ch = code[i];
      if (ch === ' ' || ch === '\t' || ch === '\n' || ch === '\r') { i++; continue; }
      if (ch === "'" || ch === '"') { i = quoted(i, ch); prev = ch; prevWord = ''; continue; }
      if (ch === '`') { i = template(i); prev = '`'; prevWord = ''; continue; }
      if (inSubst) {
        if (ch === '{') depth++;
        else if (ch === '}') {
          if (depth === 0) return i + 1;
          depth--;
        }
      }
      if (ch === '/') {
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
            blank(i + 1, closed);
            j = closed + 1;
            while (j < n && /[a-z]/i.test(code[j])) j++;
            i = j;
            prev = ')';
            prevWord = '';
            continue;
          }
        }
        prev = '/';
        prevWord = '';
        i++;
        continue;
      }
      if (/[A-Za-z0-9_$]/.test(ch)) {
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
  return { text: out.join(''), issues };
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

function firstMatch(text, re, from = 0, to = text.length) {
  const g = new RegExp(re.source, re.flags.includes('g') ? re.flags : `${re.flags}g`);
  g.lastIndex = from;
  const m = g.exec(text);
  return m && m.index < to ? m : null;
}

function allMatches(text, re, from = 0, to = text.length) {
  const g = new RegExp(re.source, re.flags.includes('g') ? re.flags : `${re.flags}g`);
  g.lastIndex = from;
  const out = [];
  let m;
  while ((m = g.exec(text)) && m.index < to) {
    out.push(m);
    if (m[0].length === 0) g.lastIndex++;
  }
  return out;
}

/** A named function / const arrow handler: { name, start, open, close, params }. */
function functionRange(bl, name) {
  const re = new RegExp(`(?:export\\s+)?(?:async\\s+)?function\\s+${esc(name)}\\b`);
  let m = re.exec(bl);
  if (m) {
    const p = bl.indexOf('(', m.index + m[0].length);
    if (p < 0) return null;
    const pc = matchClose(bl, p);
    if (pc < 0) return null;
    const o = bl.indexOf('{', pc);
    if (o < 0) return null;
    const c = matchClose(bl, o);
    if (c < 0) return null;
    return { name, start: m.index, open: o, close: c, params: bl.slice(p + 1, pc) };
  }
  m = new RegExp(`(?:export\\s+)?const\\s+${esc(name)}\\s*(?::[^=]*?)?=(?![=>])`).exec(bl);
  if (m) {
    const arrow = bl.indexOf('=>', m.index);
    if (arrow < 0) return null;
    const between = bl.slice(m.index + m[0].length, arrow);
    if (!/^\s*(?:async\s*)?(?:\([^)]*\)|[\w$]+)\s*(?::[^=]*)?$/.test(between)) return null; // not an arrow of this const
    let i = arrow + 2;
    while (i < bl.length && /\s/.test(bl[i])) i++;
    if (bl[i] !== '{') return null;
    const c = matchClose(bl, i);
    if (c < 0) return null;
    const p = bl.indexOf('(', m.index);
    const params = p >= 0 && p < arrow ? bl.slice(p + 1, matchClose(bl, p)) : '';
    return { name, start: m.index, open: i, close: c, params };
  }
  return null;
}

/** Does the module export `name`? 'yes' (a declaration or an export list names it), 'maybe' (export * / CommonJS), 'no'. */
function exportKind(bl, name) {
  const n = esc(name);
  if (new RegExp(`\\bexport\\s+(?:async\\s+)?function\\s*\\*?\\s*${n}\\b`).test(bl)) return 'yes';
  if (new RegExp(`\\bexport\\s+(?:const|let|var)\\s+${n}\\b`).test(bl)) return 'yes';
  for (const m of bl.matchAll(/\bexport\s*(?:type\s*)?\{([^}]*)\}/g)) {
    for (const part of m[1].split(',')) {
      const bits = part.trim().replace(/^type\s+/, '').split(/\s+as\s+/);
      if (bits[bits.length - 1] === name) return 'yes';
    }
  }
  if (/\bexport\s*\*/.test(bl)) return 'maybe';
  if (new RegExp(`\\b(?:module\\s*\\.\\s*)?exports\\s*\\.\\s*${n}\\b`).test(bl) || /\bmodule\s*\.\s*exports\s*=/.test(bl)) return 'maybe';
  return 'no';
}

/**
 * The exported handler `name` of a route module, however it is written:
 *   null                   the module does not export `name` (no such door)
 *   { H }                  the handler body range (a declaration, an arrow, an alias, or the first function inside
 *                          a wrapper call such as `export const POST = withMember(async (req) => { ... })`)
 *   { unresolved: true }   the module exports `name` in a form this module cannot locate. Callers must treat that
 *                          as UNKNOWN, never as "no handler": an export that cannot be found is not an export that
 *                          is absent.
 */
function resolveHandler(f, name) {
  const bl = f.bl;
  const ek = exportKind(bl, name);
  if (ek === 'no') return null;
  const direct = functionRange(bl, name);
  if (direct) return { H: direct };
  // alias: `export const POST = handler;`
  const n = esc(name);
  const al = new RegExp(`\\bexport\\s+(?:const|let|var)\\s+${n}\\s*(?::[^=]*?)?=\\s*([A-Za-z_$][\\w$]*)\\s*(?:;|$|\\n)`).exec(bl);
  if (al) {
    const h = functionRange(bl, al[1]);
    return h ? { H: h } : { unresolved: true };
  }
  // alias: `export { handler as POST }`
  for (const m of bl.matchAll(/\bexport\s*\{([^}]*)\}(?!\s*from)/g)) {
    for (const part of m[1].split(',')) {
      const bits = part.trim().split(/\s+as\s+/);
      if (bits[bits.length - 1] === name && bits[0]) {
        const h = functionRange(bl, bits[0]);
        return h ? { H: h } : { unresolved: true };
      }
    }
  }
  // wrapper: `export const POST = withMember(async (req) => { ... })`
  const wr = new RegExp(`\\bexport\\s+(?:const|let|var)\\s+${n}\\s*(?::[^=]*?)?=\\s*[A-Za-z_$][\\w$.]*\\s*\\(`).exec(bl);
  if (wr) {
    const open = wr.index + wr[0].length - 1;
    const close = matchClose(bl, open);
    if (close > 0) {
      const inner = /(?:async\s*)?(?:function\s*[\w$]*\s*\(([^)]*)\)\s*(?::[^{]*)?\{|\(([^)]*)\)\s*(?::[^=]*?)?=>\s*\{|([A-Za-z_$][\w$]*)\s*=>\s*\{)/g;
      inner.lastIndex = open;
      const im = inner.exec(bl);
      if (im && im.index < close) {
        const bo = im.index + im[0].length - 1;
        const bc = matchClose(bl, bo);
        if (bc > 0 && bc < close) return { H: { name, start: wr.index, open: bo, close: bc, params: im[1] ?? im[2] ?? im[3] ?? '' }, wrapped: true };
      }
    }
  }
  return { unresolved: true };
}

/** What precedes an `if` at `pos`: 'else' (it continues an else-if chain), 'nested' (it is the braceless body of another control statement), or null. */
function ifPrefix(bl, pos) {
  let k = pos - 1;
  while (k >= 0 && /\s/.test(bl[k])) k--;
  if (k < 0) return null;
  if (bl[k] === ')') {
    let d = 0;
    let j = k;
    for (; j >= 0; j--) {
      if (bl[j] === ')') d++;
      else if (bl[j] === '(') { d--; if (d === 0) break; }
    }
    if (j < 0) return null;
    let w = j - 1;
    while (w >= 0 && /\s/.test(bl[w])) w--;
    const word = /[A-Za-z_$][\w$]*$/.exec(bl.slice(Math.max(0, w - 12), w + 1));
    return word && ['if', 'for', 'while', 'switch', 'with', 'catch'].includes(word[0]) ? 'nested' : null;
  }
  const wm = /[A-Za-z_$][\w$]*$/.exec(bl.slice(Math.max(0, k - 12), k + 1));
  if (wm && wm[0] === 'else') return 'else';
  if (wm && wm[0] === 'do') return 'nested';
  return null;
}

/**
 * Every `if (...)` statement in [from, to): its condition, body, else-body and whether the body leaves, plus
 *   prevConds  the conditions of the earlier links of an else-if chain (the body runs only when all of them failed)
 *   nested     true when the `if` is the braceless body of another control statement, or an `else if` whose chain
 *              starts before `from` (its real guard is not visible, so it is not treated as unconditional)
 *   bodyFrom/bodyTo/elseFrom/elseTo  character spans (elseTo -1 when there is no else block)
 */
function ifGates(bl, from, to) {
  const out = [];
  const chains = new Map();
  const re = /\bif\s*\(/g;
  re.lastIndex = from;
  let m;
  while ((m = re.exec(bl)) && m.index < to) {
    const open = m.index + m[0].length - 1;
    const close = matchClose(bl, open);
    if (close < 0) continue;
    const cond = bl.slice(open + 1, close);
    let k = close + 1;
    while (k < bl.length && /\s/.test(bl[k])) k++;
    let body;
    let bodyEnd;
    let bodyFrom;
    if (bl[k] === '{') {
      bodyEnd = matchClose(bl, k);
      if (bodyEnd < 0) continue;
      body = bl.slice(k + 1, bodyEnd);
      bodyFrom = k + 1;
    } else {
      const semi = bl.indexOf(';', k);
      bodyEnd = semi < 0 ? bl.length : semi;
      body = bl.slice(k, bodyEnd + 1);
      bodyFrom = k;
    }
    let e = bodyEnd + 1;
    while (e < bl.length && /\s/.test(bl[e])) e++;
    let elseBody = '';
    let elseFrom = -1;
    let elseTo = -1;
    if (bl.startsWith('else', e) && !/[\w$]/.test(bl[e + 4] ?? ' ')) {
      let q = e + 4;
      while (q < bl.length && /\s/.test(bl[q])) q++;
      if (bl[q] === '{') {
        const qc = matchClose(bl, q);
        if (qc > 0) { elseBody = bl.slice(q + 1, qc); elseFrom = q + 1; elseTo = qc; }
      } else if (bl.startsWith('if', q) && !/[\w$]/.test(bl[q + 2] ?? ' ')) {
        chains.set(q, [...(chains.get(m.index) ?? []), { cond, condStart: open + 1 }]);
      } else {
        const semi = bl.indexOf(';', q);
        elseBody = bl.slice(q, semi < 0 ? bl.length : semi + 1);
        elseFrom = q;
        elseTo = semi < 0 ? bl.length : semi;
      }
    }
    const prevConds = chains.get(m.index) ?? [];
    const prefix = ifPrefix(bl, m.index);
    out.push({
      pos: m.index,
      condStart: open + 1,
      cond,
      body,
      bodyFrom,
      bodyTo: bodyEnd,
      elseBody,
      elseFrom,
      elseTo,
      prevConds,
      nested: prefix === 'nested' || (prefix === 'else' && prevConds.length === 0),
      returns: /\b(?:return|throw)\b/.test(body),
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
 * Is the `return` that carries index `pos` a direct, unconditional statement of the handler body? A return
 * under an `if (..)`, an `else`, a `case`, a `try`/`catch` block, or any nested block is NOT unconditional.
 */
function unconditionalReturnAt(bl, H, pos) {
  let r = -1;
  const re = /\breturn\b/g;
  re.lastIndex = H.open + 1;
  let m;
  while ((m = re.exec(bl)) && m.index < pos) r = m.index;
  if (r < 0) return false;
  if (blockDepthAt(bl, H.open + 1, r) !== 0) return false;
  let k = r - 1;
  while (k > H.open && /\s/.test(bl[k])) k--;
  if (k <= H.open) return true;
  const prev = bl[k];
  return prev === ';' || prev === '}' || prev === '{';
}

/**
 * Is `pos` inside a block that runs only on some paths (if / else / for / while / switch / catch / a nested
 * callback)? Plain containers are the handler body itself, `try` / `finally` and bare blocks. Braces inside
 * parentheses (object literals in calls) are not statement blocks and are skipped.
 */
function inConditionalBlock(bl, H, pos) {
  const stack = [];
  let paren = 0;
  for (let i = H.open; i < pos; i++) {
    const c = bl[i];
    if (c === '(') paren++;
    else if (c === ')') paren = Math.max(0, paren - 1);
    else if (paren === 0 && c === '{') {
      const head = bl.slice(Math.max(H.open, i - 80), i);
      let plain = false;
      if (i === H.open) plain = true;
      else if (/\b(?:try|finally)\s*$/.test(head)) plain = true;
      else if (/(?:^|[;{}])\s*$/.test(head)) plain = true;
      stack.push(plain);
    } else if (paren === 0 && c === '}') stack.pop();
  }
  return stack.some((p) => !p);
}

// ---- per-tree memoised facts about one file -----------------------------------------------------------
const FACTS = new WeakMap();

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
    const b = blankLiterals(code);
    f = { rel, missing: false, kind, code, stripIssues, bl: b.text, literalIssues: b.issues };
  }
  m.set(rel, f);
  return f;
}

/** Facts for a file this module needs, or null after recording WHY it cannot be established. */
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

function handlerOf(f, name, rep) {
  const r = resolveHandler(f, name);
  if (r && r.H) return r.H;
  if (r && r.unresolved) rep.unknown(`${f.rel} exports ${name} in a form this module cannot locate (wrapped, aliased or re-exported)`);
  else rep.unknown(`${f.rel} has no recognisable ${name} handler`);
  return null;
}

const loc = (f, idx) => `${f.rel}:${lineAt(f.bl, idx)}`;

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
    done() { return { ok: bad === 0 && unknown === 0, evidence: lines.slice() }; },
  };
}

// ---- recognisers shared by several falsifiers ----------------------------------------------------------

/** Local name an exported function is imported under, if it comes from a module matching specRe. */
function importedAs(code, name, specRe) {
  const re = /import\s+(?:type\s+)?\{([^}]*)\}\s*from\s*(['"])([^'"]+)\2/g;
  let m;
  while ((m = re.exec(code))) {
    if (!specRe.test(m[3])) continue;
    for (const part of m[1].split(',')) {
      const bits = part.trim().replace(/^type\s+/, '').split(/\s+as\s+/);
      if (bits[0] === name) return bits[bits.length - 1];
    }
  }
  return null;
}

/** The first parameter name of a handler (the request), if any. */
function requestNames(H) {
  const m = /^\s*([A-Za-z_$][\w$]*)/.exec(H.params);
  return m ? [m[1]] : [];
}

const FORM_RE = /\.\s*formData\s*(?:\?\.\s*)?\(/;
const ENVELOPE_RE = /\b(?:recordArtifactArrival|recordEncryptedArtifactArrival|beginEncryptedLanding|commitEncryptedArrival)\s*\(/;
const PERSIST_RE = /\b(?:writeOriginal|writeReviewed|writeDraft|writeFile|writeFileSync|writeVaultBytes|writeDurableVaultBytes|storeFile)\s*\(/;
// Anything that stores something: a SQL call, a tagged `sql` template, a filesystem or vault write, a call whose
// name begins with a storing verb. Deliberately broad: it is used to ask "did anything get stored BEFORE this
// refusal?" and "is a store that is NOT the envelope still present?", and in both questions an unrecognised
// storing call must count (a missed one is the unsafe direction).
const STORAGE_VERBS = 'query|insertOne|insertMany|upsertOne|writeOriginal|writeReviewed|writeDraft|writeFile|writeFileSync|appendFile|appendFileSync|copyFile|copyFileSync|rename|renameSync|createWriteStream|writeVaultBytes|writeDurableVaultBytes|storeFile|storeChunk|putObject';
const STORAGE_EFFECT_RE = new RegExp(`\\b(?:${STORAGE_VERBS})\\s*\\(|\\bsql\\s*\`|\\.\\s*(?:insert|upsert|put|save|store|persist|write)[A-Za-z0-9_]*\\s*\\(|\\b(?:save|store|persist|record|write|append|insert|upsert|enqueue)[A-Z][A-Za-z0-9_]*\\s*\\(`);
const ENVELOPE_NAMES = new Set(['recordArtifactArrival', 'recordEncryptedArtifactArrival', 'beginEncryptedLanding', 'commitEncryptedArrival']);

/** First storing call in [from, to), envelope entrypoints included. */
function firstEffect(bl, from, to) {
  return firstMatch(bl, STORAGE_EFFECT_RE, from, to);
}

/** First storing call in [from, to) that is NOT one of the encrypted-envelope entrypoints. */
function plainEffect(bl, from, to) {
  for (const m of allMatches(bl, STORAGE_EFFECT_RE, from, to)) {
    const name = /[A-Za-z_$][\w$]*/.exec(m[0]);
    if (name && ENVELOPE_NAMES.has(name[0])) continue;
    return m;
  }
  return null;
}

/** First body-reading token in the handler: any .formData(), or request.json/text/arrayBuffer/blob/body. */
function firstBodyRead(f, H) {
  const hits = [];
  const fm = firstMatch(f.bl, FORM_RE, H.open, H.close);
  if (fm) hits.push(fm.index);
  const req = requestNames(H);
  if (req.length > 0) {
    const re = new RegExp(`\\b(?:${req.map(esc).join('|')})\\s*(?:\\.\\s*clone\\s*\\(\\s*\\)\\s*)?\\.\\s*(?:json|text|arrayBuffer|blob|body|formData)\\b`);
    const m = firstMatch(f.bl, re, H.open, H.close);
    if (m) hits.push(m.index);
  }
  const bracket = firstMatch(f.code, /\[\s*['"]formData['"]\s*\]\s*\(/, H.open, H.close);
  if (bracket) hits.push(bracket.index);
  return hits.length ? Math.min(...hits) : null;
}

/** An unconditional `status: 423` return that precedes every body read and every storage or SQL effect, with no earlier return that succeeds around it. */
function hardHold(f, H) {
  const bodyRead = firstBodyRead(f, H);
  const effect = firstEffect(f.bl, H.open, H.close);
  for (const m of allMatches(f.bl, /\bstatus\s*:\s*423\b/, H.open, H.close)) {
    if (!unconditionalReturnAt(f.bl, H, m.index)) continue;
    if (successBypassBefore(f, H, m.index) >= 0) continue;
    const early = (bodyRead === null || m.index < bodyRead) && (!effect || m.index < effect.index);
    if (early) return { pos: m.index, bodyRead, effectPos: effect ? effect.index : null };
  }
  return null;
}

// ---- worlds: what each hazard looks like to the expression engine ---------------------------------------
// A world gives the hazard's atom a concrete value and leaves everything else UNKNOWN. A name is given a meaning
// only when it is IMPORTED from the real module (`owns`): a local function that shares the name means nothing.

const RELEASE_SPEC = /writersStudio\/releaseAuthority$/;

/** The release manifest as it reads when `sourceIntakeReleased` is M (false = held, true = released). */
function releaseWorld(M) {
  return {
    call: (name, _args, cx) => (importedAs(cx.f.code, 'writerReleaseAuthority', RELEASE_SPEC) === name ? worldObj('AUTH', { sourceIntakeReleased: M }) : undefined),
    owns: (name) => name === 'writerReleaseAuthority',
  };
}

/** An audience predicate (`fn`, from `spec`) that DENIES: its allow field reads false. */
function audienceWorld(fn, spec, allowField) {
  return {
    call: (name, _args, cx) => (importedAs(cx.f.code, fn, spec) === name ? worldObj('AUDIENCE', { [allowField]: false }) : undefined),
    owns: (name) => name === fn,
  };
}

/** parseUpload returned EMPTY extracted text. */
function parsedWorld() {
  const spec = /manuscript\/ingest\/parseUpload$/;
  return {
    call: (name, _args, cx) => (importedAs(cx.f.code, 'parseUpload', spec) === name ? worldObj('PARSED', { text: '' }) : undefined),
    owns: (name) => name === 'parseUpload',
  };
}

/** claimArrival returned FALSE. */
function claimWorld() {
  const spec = /manuscript\/source\/arrivals$/;
  return {
    call: (name, _args, cx) => (importedAs(cx.f.code, 'claimArrival', spec) === name ? false : undefined),
    owns: (name) => name === 'claimArrival',
  };
}

/**
 * The session is in Sanctuary. A posture API answers with the Sanctuary answer UNLESS its input is a literal that
 * cannot carry one (a hard-coded `{ sanctuary: false }`, `shouldPersistTurn(false)`): a request-derived input IS the
 * signal. So a gate built on a hard-coded posture is dead in this world, and a gate on a real one fires.
 */
function sanctuaryWorld() {
  const TP = /sanctuary\/turnPosture$/;
  const SG = /sanctuary\/sanctuaryGuards$/;
  const CP = /sanctuary\/currentClientPosture$/;
  const CS = /provenance\/consentState$/;
  const sig = (v) => (isU(v) ? true : v === true || v === 'true');
  const postureOf = (arg, cx) => {
    if (!arg) return worldObj('POSTURE', { sanctuary: false });
    const v = ev(arg, cx);
    if (isU(v)) return worldObj('POSTURE', { sanctuary: true });
    if (v && typeof v === 'object' && v.k === 'obj') {
      if (v.open) return worldObj('POSTURE', { sanctuary: true });
      const m = v.props.get('meta');
      const nested = m && typeof m === 'object' && m.k === 'obj' ? (m.open ? true : sig(m.props.get('sanctuary'))) : isU(m);
      return worldObj('POSTURE', { sanctuary: sig(v.props.get('sanctuary')) || nested });
    }
    return worldObj('POSTURE', { sanctuary: false });
  };
  const owned = new Set(['contentWritable', 'shouldPersistTurn', 'shouldPersistKeep', 'readCurrentSanctuaryPosture', 'resolveRecordedPosture']);
  return {
    call: (name, args, cx) => {
      if (importedAs(cx.f.code, 'contentWritable', TP) === name) {
        const p = ev(args[0], cx);
        if (isU(p)) return false;
        if (p && typeof p === 'object' && p.tag === 'POSTURE') return !p.props.get('sanctuary');
        return U;
      }
      for (const g of ['shouldPersistTurn', 'shouldPersistKeep']) {
        if (importedAs(cx.f.code, g, SG) === name) {
          const x = ev(args[0], cx);
          return isU(x) ? false : x !== true;
        }
      }
      if (importedAs(cx.f.code, 'readCurrentSanctuaryPosture', CP) === name) return worldObj('CLIENT_POSTURE', { resolved: true, sanctuary: true });
      if (importedAs(cx.f.code, 'resolveRecordedPosture', CS) === name) return 'sanctuary';
      return undefined;
    },
    method: (recv, method, args, cx) => (method === 'resolve' && importedAs(cx.f.code, 'TurnPosture', TP) === recv ? postureOf(args[0], cx) : undefined),
    owns: (name) => owned.has(name),
  };
}

function localImports(tree, rel) {
  const code = tree.code(rel) ?? '';
  const specs = new Set();
  for (const re of [/(?:import|export)\s[^;'"]*?from\s*['"]([^'"]+)['"]/g, /import\s*['"]([^'"]+)['"]/g, /import\(\s*['"]([^'"]+)['"]\s*\)/g]) {
    let m;
    while ((m = re.exec(code))) specs.add(m[1]);
  }
  const out = new Set();
  for (const s of specs) {
    let base = null;
    if (s.startsWith('@/')) base = s.slice(2);
    else if (s.startsWith('./') || s.startsWith('../')) base = path.posix.normalize(path.posix.join(path.posix.dirname(rel), s));
    if (base === null || base.startsWith('..')) continue;
    for (const cand of [base, `${base}.ts`, `${base}.tsx`, `${base}.js`, `${base}.mjs`, `${base}/index.ts`, `${base}/index.tsx`]) {
      if (tree.isFile(cand)) {
        out.add(cand);
        break;
      }
    }
  }
  return [...out].sort();
}

// =====================================================================================================
// 1b. EXPRESSION ENGINE -- a small partial evaluator for the conditions that gate a handler
// =====================================================================================================
//
// WHY: the first version recognised a gate by TOKENS ("the condition mentions the manifest flag"). A token is
// not a structure: `!HOLD && request.headers.get('x-skip')`, `HOLD = flag || process.env.X`, an inverted
// polarity and an `else if` all mention the token and none of them holds. The question a falsifier really asks
// is: "in the world where the law's hazard is present (the manifest says held, the member is not admitted, the
// text is empty, the session is in Sanctuary), does this condition come out TRUE whatever every OTHER input is?"
// That is a three-valued evaluation: the hazard's atom gets a concrete value, every other atom is UNKNOWN, and a
// condition counts as a gate only if it is definitely true. Kleene logic makes `x && UNKNOWN` unknown and
// `x || UNKNOWN` true only when x is true, which is exactly the distinction the token check could not draw.
//
// What it understands: ! && || ?? ternary === !== == != < > <= >= + - * / %, member and optional access, calls
// (an imported or local function whose body is a single `return EXPR`, or a chain of `if (c) return <refusal>`
// followed by a null return, is inlined with its parameters and defaults), const bindings and destructuring
// (module level or in the handler), string and regex methods on concrete strings. What it does not: loops,
// reassigned variables (UNKNOWN), exceptions, `as` casts, anything it cannot parse (UNKNOWN). Every unknown
// resolves toward "this is not a gate", the safe direction.

const UNK = '?'; // tri-state truth value: unknown
const U = Object.freeze({ k: 'u' });
const U_T = Object.freeze({ k: 'u', tr: true });
const U_F = Object.freeze({ k: 'u', tr: false });
const isU = (v) => v !== null && typeof v === 'object' && v.k === 'u';
const isObj = (v) => v !== null && typeof v === 'object' && (v.k === 'obj' || v.k === 're');
function truthy(v) {
  if (isU(v)) return v.tr === undefined ? UNK : v.tr;
  if (isObj(v)) return true;
  return Boolean(v);
}
const triNot = (t) => (t === UNK ? UNK : !t);
const fromTri = (t) => (t === UNK ? U : t);

// ---- tokenizer ------------------------------------------------------------------------------------------
const OPS = ['===', '!==', '...', '**', '&&', '||', '??', '==', '!=', '<=', '>=', '=>', '?.', '++', '--', '+', '-', '*', '/', '%', '<', '>', '!', '?', ':', '.', ',', '(', ')', '[', ']', '{', '}', '=', '&', '|', '^', '~', ';'];
const KW = new Set(['typeof', 'await', 'void', 'new', 'instanceof', 'in', 'as', 'of']);
const LIT_WORDS = { true: true, false: false, null: null, undefined: undefined };

/** Tokens of an expression, or null when it holds something this tokenizer does not understand. */
function tokenize(src, base = 0) {
  const toks = [];
  const n = src.length;
  let i = 0;
  const prevAllowsRegex = () => {
    const p = toks[toks.length - 1];
    if (!p) return true;
    if (p.t === 'op') return p.v !== ')' && p.v !== ']' && p.v !== '}';
    return p.t === 'kw';
  };
  while (i < n) {
    const c = src[i];
    if (c === ' ' || c === '\t' || c === '\n' || c === '\r') { i++; continue; }
    const pos = base + i;
    if (c === '/') {
      if (src[i + 1] === '/' || src[i + 1] === '*') return null;
      if (prevAllowsRegex()) {
        let j = i + 1;
        let inClass = false;
        let close = -1;
        while (j < n) {
          const ch = src[j];
          if (ch === '\\') { j += 2; continue; }
          if (ch === '\n') break;
          if (ch === '[') inClass = true;
          else if (ch === ']') inClass = false;
          else if (ch === '/' && !inClass) { close = j; break; }
          j++;
        }
        if (close < 0) return null;
        let k = close + 1;
        while (k < n && /[a-z]/i.test(src[k])) k++;
        toks.push({ t: 're', src: src.slice(i + 1, close), flags: src.slice(close + 1, k), pos });
        i = k;
        continue;
      }
    }
    if (c === "'" || c === '"') {
      let j = i + 1;
      let out = '';
      while (j < n && src[j] !== c) {
        if (src[j] === '\\') {
          const e = src[j + 1];
          out += e === 'n' ? '\n' : e === 't' ? '\t' : e === 'r' ? '\r' : (e ?? '');
          j += 2;
          continue;
        }
        if (src[j] === '\n') return null;
        out += src[j];
        j++;
      }
      if (j >= n) return null;
      toks.push({ t: 'str', v: out, pos });
      i = j + 1;
      continue;
    }
    if (c === '`') {
      let j = i + 1;
      let out = '';
      let subst = false;
      let depth = 0;
      while (j < n) {
        const ch = src[j];
        if (ch === '\\') { if (depth === 0) out += src[j + 1] ?? ''; j += 2; continue; }
        if (ch === '`' && depth === 0) break;
        if (ch === '$' && src[j + 1] === '{') { subst = true; depth++; j += 2; continue; }
        if (depth > 0) {
          if (ch === '{') depth++;
          else if (ch === '}') depth--;
        } else out += ch;
        j++;
      }
      if (j >= n) return null;
      toks.push({ t: 'tpl', v: subst ? undefined : out, subst, pos });
      i = j + 1;
      continue;
    }
    if (/[0-9]/.test(c) || (c === '.' && /[0-9]/.test(src[i + 1] ?? ''))) {
      const m = /^(?:0[xX][0-9a-fA-F_]+|(?:[0-9][0-9_]*)?\.?[0-9_]+(?:[eE][+-]?[0-9]+)?|[0-9][0-9_]*\.?)/.exec(src.slice(i));
      if (!m) return null;
      toks.push({ t: 'num', v: Number(m[0].replace(/_/g, '')), pos });
      i += m[0].length;
      continue;
    }
    if (/[A-Za-z_$]/.test(c)) {
      const m = /^[A-Za-z_$][\w$]*/.exec(src.slice(i));
      const w = m[0];
      if (Object.prototype.hasOwnProperty.call(LIT_WORDS, w)) toks.push({ t: 'lit', v: LIT_WORDS[w], pos });
      else if (KW.has(w)) toks.push({ t: 'kw', v: w, pos });
      else toks.push({ t: 'id', v: w, pos });
      i += w.length;
      continue;
    }
    const op = OPS.find((o) => src.startsWith(o, i));
    if (!op) return null;
    toks.push({ t: 'op', v: op, pos });
    i += op.length;
  }
  return toks;
}

// ---- parser ---------------------------------------------------------------------------------------------
const PARSE_FAIL = new Error('parse');

/** An AST for the whole token list, or null (never a partial parse). */
function parseExpression(toks) {
  if (!toks || toks.length === 0) return null;
  let i = 0;
  const fail = () => { throw PARSE_FAIL; };
  const peek = (o = 0) => toks[i + o];
  const isOp = (v, o = 0) => { const t = toks[i + o]; return Boolean(t) && t.t === 'op' && t.v === v; };
  const eatOp = (v) => { if (isOp(v)) { i++; return true; } return false; };
  const expectOp = (v) => { if (!eatOp(v)) fail(); };

  function skipBalanced() {
    // at an opening bracket: advance past its matching close
    let d = 0;
    for (; i < toks.length; i++) {
      const t = toks[i];
      if (t.t !== 'op') continue;
      if (t.v === '(' || t.v === '[' || t.v === '{') d++;
      else if (t.v === ')' || t.v === ']' || t.v === '}') { d--; if (d === 0) { i++; return; } }
    }
    fail();
  }
  function arrowAhead() {
    let j = i;
    if (toks[j] && toks[j].t === 'id' && toks[j].v === 'async' && !(toks[j + 1] && toks[j + 1].t === 'op' && toks[j + 1].v === '=>')) j++;
    const t = toks[j];
    if (!t) return false;
    if (t.t === 'id' && toks[j + 1] && toks[j + 1].t === 'op' && toks[j + 1].v === '=>') return true;
    if (t.t === 'op' && t.v === '(') {
      let d = 0;
      for (let k = j; k < toks.length; k++) {
        const q = toks[k];
        if (q.t !== 'op') continue;
        if (q.v === '(' || q.v === '[' || q.v === '{') d++;
        else if (q.v === ')' || q.v === ']' || q.v === '}') {
          d--;
          if (d === 0) { const nx = toks[k + 1]; return Boolean(nx) && nx.t === 'op' && nx.v === '=>'; }
        }
      }
    }
    return false;
  }
  function skipArrow() {
    // consume a function expression whole; its body is never evaluated
    let d = 0;
    for (; i < toks.length; i++) {
      const t = toks[i];
      if (t.t !== 'op') continue;
      if (t.v === '(' || t.v === '[' || t.v === '{') d++;
      else if (t.v === ')' || t.v === ']' || t.v === '}') d--;
      else if (t.v === '=>' && d === 0) { i++; break; }
    }
    if (isOp('{')) skipBalanced();
    else parseTernary();
    return { t: 'unk' };
  }
  function parseArgs() {
    const args = [];
    if (eatOp(')')) return args;
    for (;;) {
      if (arrowAhead()) args.push(skipArrow());
      else if (eatOp('...')) { parseTernary(); args.push({ t: 'unk' }); } else args.push(parseTernary());
      if (eatOp(',')) { if (eatOp(')')) return args; continue; }
      expectOp(')');
      return args;
    }
  }
  function parseTernary() {
    const c = parseNullish();
    if (isOp('?')) {
      i++;
      const a = parseTernary();
      expectOp(':');
      const b = parseTernary();
      return { t: 'cond', c, a, b };
    }
    return c;
  }
  function parseNullish() {
    let l = parseOr();
    while (isOp('??')) { i++; l = { t: 'log', op: '??', l, r: parseOr() }; }
    return l;
  }
  function parseOr() {
    let l = parseAnd();
    while (isOp('||')) { i++; l = { t: 'log', op: '||', l, r: parseAnd() }; }
    return l;
  }
  function parseAnd() {
    let l = parseEq();
    while (isOp('&&')) { i++; l = { t: 'log', op: '&&', l, r: parseEq() }; }
    return l;
  }
  function parseEq() {
    let l = parseRel();
    while (isOp('===') || isOp('!==') || isOp('==') || isOp('!=')) { const op = toks[i++].v; l = { t: 'bin', op, l, r: parseRel() }; }
    return l;
  }
  function parseRel() {
    let l = parseAdd();
    for (;;) {
      const t = peek();
      if (t && t.t === 'op' && (t.v === '<' || t.v === '>' || t.v === '<=' || t.v === '>=')) { i++; l = { t: 'bin', op: t.v, l, r: parseAdd() }; } else if (t && t.t === 'kw' && (t.v === 'instanceof' || t.v === 'in')) { i++; l = { t: 'bin', op: t.v, l, r: parseAdd() }; } else break;
    }
    return l;
  }
  function parseAdd() {
    let l = parseMul();
    while (isOp('+') || isOp('-')) { const op = toks[i++].v; l = { t: 'bin', op, l, r: parseMul() }; }
    return l;
  }
  function parseMul() {
    let l = parseUnary();
    while (isOp('*') || isOp('/') || isOp('%') || isOp('**')) { const op = toks[i++].v; l = { t: 'bin', op, l, r: parseUnary() }; }
    return l;
  }
  function parseUnary() {
    const t = peek();
    if (!t) fail();
    if (t.t === 'op' && (t.v === '!' || t.v === '-' || t.v === '+' || t.v === '~')) {
      i++;
      const x = parseUnary();
      return { t: t.v === '!' ? 'not' : t.v === '-' ? 'neg' : 'unk', x };
    }
    if (t.t === 'kw' && (t.v === 'typeof' || t.v === 'await' || t.v === 'void')) { i++; return { t: t.v, x: parseUnary() }; }
    return parsePostfix();
  }
  function parsePostfix() {
    let e = parsePrimary();
    for (;;) {
      const t = peek();
      if (!t || t.t !== 'op') break;
      if (t.v === '.' || t.v === '?.') {
        const optional = t.v === '?.';
        const nx = peek(1);
        if (optional && nx && nx.t === 'op' && nx.v === '(') { i += 2; e = { t: 'call', c: e, a: parseArgs(), opt: true, pos: t.pos }; continue; }
        if (optional && nx && nx.t === 'op' && nx.v === '[') { i += 2; const idx = parseTernary(); expectOp(']'); e = { t: 'idx', o: e, i: idx, opt: true }; continue; }
        if (!nx || !(nx.t === 'id' || nx.t === 'kw')) fail();
        i += 2;
        e = { t: 'mem', o: e, p: nx.v, opt: optional, pos: nx.pos };
        continue;
      }
      if (t.v === '[') { i++; const idx = parseTernary(); expectOp(']'); e = { t: 'idx', o: e, i: idx }; continue; }
      if (t.v === '(') { i++; e = { t: 'call', c: e, a: parseArgs(), pos: t.pos }; continue; }
      if (t.v === '!') { i++; continue; } // TypeScript non-null assertion
      break;
    }
    return e;
  }
  function parsePrimary() {
    const t = peek();
    if (!t) fail();
    if (arrowAhead()) return skipArrow();
    i++;
    if (t.t === 'num' || t.t === 'str' || t.t === 'lit') return { t: 'lit', v: t.v };
    if (t.t === 'tpl') return t.subst ? { t: 'unk' } : { t: 'lit', v: t.v };
    if (t.t === 're') return { t: 're', src: t.src, flags: t.flags };
    if (t.t === 'id') return { t: 'id', n: t.v, pos: t.pos };
    if (t.t === 'kw' && t.v === 'new') {
      parsePostfixCalleeOnly();
      return { t: 'new' };
    }
    if (t.t === 'op' && t.v === '(') { const e = parseTernary(); expectOp(')'); return e; }
    if (t.t === 'op' && t.v === '[') { i--; skipBalanced(); return { t: 'arr' }; }
    if (t.t === 'op' && t.v === '{') return parseObject();
    return fail();
  }
  function parsePostfixCalleeOnly() {
    // new Foo.Bar<T>(args): consume a dotted path and an optional argument list
    if (!(peek() && peek().t === 'id')) fail();
    i++;
    while (isOp('.') && peek(1) && peek(1).t === 'id') i += 2;
    if (eatOp('(')) parseArgs();
  }
  function parseObject() {
    const props = [];
    let open = false;
    if (eatOp('}')) return { t: 'obj', props, open };
    for (;;) {
      const t = peek();
      if (!t) fail();
      if (t.t === 'op' && t.v === '...') { i++; parseTernary(); open = true; } else if (t.t === 'op' && t.v === '[') { skipBalanced(); expectOp(':'); parseTernary(); open = true; } else if (t.t === 'id' || t.t === 'str' || t.t === 'num' || t.t === 'kw' || t.t === 'lit') {
        i++;
        const key = String(t.v);
        if (eatOp(':')) props.push({ k: key, v: arrowAhead() ? skipArrow() : parseTernary() });
        else if (t.t === 'id' && (isOp(',') || isOp('}'))) props.push({ k: key, v: { t: 'id', n: key, pos: t.pos } });
        else fail();
      } else fail();
      if (eatOp(',')) { if (eatOp('}')) return { t: 'obj', props, open }; continue; }
      expectOp('}');
      return { t: 'obj', props, open };
    }
  }

  try {
    const e = parseTernary();
    return i === toks.length ? e : null;
  } catch (err) {
    if (err === PARSE_FAIL) return null;
    throw err;
  }
}

const parseSrc = (src, base = 0) => parseExpression(tokenize(src, base));

// ---- declarations (const bindings), definitions (functions) and imports ----------------------------------

/** End of the expression that starts at `from`: the first top-level `;` or `,`, or the closing bracket of the container. */
function endOfExpr(bl, from) {
  let d = 0;
  for (let i = from; i < bl.length; i++) {
    const c = bl[i];
    if (c === '(' || c === '[' || c === '{') d++;
    else if (c === ')' || c === ']' || c === '}') { d--; if (d < 0) return i; } else if ((c === ';' || c === ',') && d === 0) return i;
  }
  return bl.length;
}

/** Index of the `=` that starts an initializer after `from` (skipping a type annotation), or -1. */
function findEq(bl, from) {
  let d = 0;
  for (let i = from; i < bl.length; i++) {
    const c = bl[i];
    if (c === '(' || c === '[' || c === '{' || c === '<') d++;
    else if (c === ')' || c === ']' || c === '}' || c === '>') {
      if (c === '>' && bl[i - 1] === '=') continue;
      d--;
      if (d < 0) return -1;
    } else if (c === ';' && d <= 0) return -1;
    else if (c === '=' && d <= 0) {
      if (bl[i + 1] === '=') { i++; continue; }
      if (bl[i + 1] === '>') continue;
      return i;
    }
  }
  return -1;
}

const DECLS = new WeakMap();
const MUTABLE = new WeakMap();

/** Every `const|let|var NAME = EXPR` and `const { a, b: c } = EXPR` of a file, with the span of EXPR. */
function declsOf(f) {
  let ds = DECLS.get(f);
  if (ds) return ds;
  ds = [];
  DECLS.set(f, ds);
  const bl = f.bl;
  const re = /\b(const|let|var)\s+/g;
  let depthPos = 0;
  let depth = 0;
  let m;
  while ((m = re.exec(bl))) {
    for (; depthPos < m.index; depthPos++) {
      const c = bl[depthPos];
      if (c === '{') depth++;
      else if (c === '}') depth--;
    }
    const p = re.lastIndex;
    const base = { kind: m[1], pos: m.index, modLevel: depth === 0 };
    if (bl[p] === '{') {
      const close = matchClose(bl, p);
      if (close < 0) continue;
      const eq = findEq(bl, close + 1);
      if (eq < 0 || /\S/.test(bl.slice(close + 1, eq).replace(/^\s*:[\s\S]*$/, ''))) continue;
      const rhsFrom = eq + 1;
      const rhsTo = endOfExpr(bl, rhsFrom);
      let part = '';
      const parts = [];
      let dd = 0;
      for (const ch of bl.slice(p + 1, close)) {
        if (ch === '{' || ch === '[' || ch === '(') dd++;
        else if (ch === '}' || ch === ']' || ch === ')') dd--;
        if (ch === ',' && dd === 0) { parts.push(part); part = ''; } else part += ch;
      }
      parts.push(part);
      for (const raw of parts) {
        const s = raw.trim();
        if (!s || s.startsWith('...')) continue;
        const mm = /^([A-Za-z_$][\w$]*)\s*(?::\s*([A-Za-z_$][\w$]*)\s*)?(=)?/.exec(s);
        if (!mm) continue;
        if (/^[A-Za-z_$][\w$]*\s*:\s*[{[]/.test(s)) continue;
        ds.push({ ...base, name: mm[2] ?? mm[1], prop: mm[1], hasDefault: Boolean(mm[3]), eqPos: eq, rhsFrom, rhsTo });
      }
      continue;
    }
    if (bl[p] === '[') continue;
    const nm = /^[A-Za-z_$][\w$]*/.exec(bl.slice(p, p + 120));
    if (!nm) continue;
    let q = p + nm[0].length;
    while (q < bl.length && /\s/.test(bl[q])) q++;
    if (bl[q] === '!') q++;
    let eq = -1;
    if (bl[q] === ':') eq = findEq(bl, q);
    else if (bl[q] === '=' && bl[q + 1] !== '=' && bl[q + 1] !== '>') eq = q;
    if (eq < 0) continue;
    ds.push({ ...base, name: nm[0], prop: null, hasDefault: false, eqPos: eq, rhsFrom: eq + 1, rhsTo: endOfExpr(bl, eq + 1) });
  }
  return ds;
}

/** Is `name` assigned anywhere other than the declaration's own initializer? (then no declaration speaks for it) */
function isMutable(f, name) {
  let mm = MUTABLE.get(f);
  if (!mm) { mm = new Map(); MUTABLE.set(f, mm); }
  if (mm.has(name)) return mm.get(name);
  const eqs = new Set(declsOf(f).filter((d) => d.name === name).map((d) => d.eqPos));
  let mut = false;
  const re = new RegExp(`(?<![\\w$.])${esc(name)}\\s*(?:[-+*/%&|^]|\\*\\*|\\?\\?|&&|\\|\\||<<|>>>?)?=(?![=>])`, 'g');
  let m;
  while ((m = re.exec(f.bl))) {
    if (!eqs.has(m.index + m[0].length - 1)) { mut = true; break; }
  }
  if (!mut && new RegExp(`(?<![\\w$.])${esc(name)}\\s*(?:\\+\\+|--)|(?:\\+\\+|--)\\s*${esc(name)}\\b`).test(f.bl)) mut = true;
  mm.set(name, mut);
  return mut;
}

function visibleFrom(bl, declPos, usePos) {
  let d = 0;
  for (let i = declPos; i < usePos; i++) {
    const c = bl[i];
    if (c === '{') d++;
    else if (c === '}') { d--; if (d < 0) return false; }
  }
  return true;
}

/** The declaration of `name` in scope at `usePos`: the nearest visible earlier one, else the module-level one. */
function lookupDecl(f, name, usePos) {
  const list = declsOf(f).filter((d) => d.name === name);
  if (list.length === 0) return null;
  let best = null;
  for (const d of list) {
    if (!d.modLevel && d.pos < usePos && visibleFrom(f.bl, d.pos, usePos) && (!best || d.pos > best.pos)) best = d;
  }
  return best ?? list.find((d) => d.modLevel) ?? null;
}

function importBinding(code, name) {
  const re = /import\s+(?:type\s+)?(?:[\w$]+\s*,\s*)?\{([^}]*)\}\s*from\s*(['"])([^'"]+)\2/g;
  let m;
  while ((m = re.exec(code))) {
    for (const part of m[1].split(',')) {
      const bits = part.trim().replace(/^type\s+/, '').split(/\s+as\s+/);
      if (bits[bits.length - 1] === name && bits[0]) return { spec: m[3], orig: bits[0] };
    }
  }
  return null;
}

function resolveSpec(tree, fromRel, spec) {
  let base = null;
  if (spec.startsWith('@/')) base = spec.slice(2);
  else if (spec.startsWith('./') || spec.startsWith('../')) base = path.posix.normalize(path.posix.join(path.posix.dirname(fromRel), spec));
  if (base === null || base.startsWith('..')) return null;
  for (const cand of [base, `${base}.ts`, `${base}.tsx`, `${base}.js`, `${base}.mjs`, `${base}/index.ts`, `${base}/index.tsx`]) {
    if (tree.isFile(cand)) return cand;
  }
  return null;
}

/** Split a parameter list into [{ name, defSrc, defPos }] (destructured parameters carry name null). */
function parseParams(text, baseOffset) {
  const out = [];
  let d = 0;
  let angle = 0;
  let start = 0;
  const cut = (end) => {
    const rawStart = start;
    const raw = text.slice(rawStart, end);
    start = end + 1;
    if (!raw.trim()) return;
    const lead = raw.length - raw.trimStart().length;
    const s = raw.trim();
    if (s.startsWith('{') || s.startsWith('[') || s.startsWith('...')) { out.push({ name: null, defSrc: null, defPos: 0 }); return; }
    const nm = /^([A-Za-z_$][\w$]*)\s*\??/.exec(s);
    if (!nm) { out.push({ name: null, defSrc: null, defPos: 0 }); return; }
    const eq = findEq(s, nm[0].length);
    if (eq < 0) { out.push({ name: nm[1], defSrc: null, defPos: 0 }); return; }
    out.push({ name: nm[1], defSrc: s.slice(eq + 1), defPos: baseOffset + rawStart + lead + eq + 1 });
  };
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '(' || c === '[' || c === '{') d++;
    else if (c === ')' || c === ']' || c === '}') d--;
    else if (c === '<') angle++;
    else if (c === '>' && text[i - 1] !== '=') angle = Math.max(0, angle - 1);
    else if (c === ',' && d === 0 && angle === 0) cut(i);
  }
  cut(text.length);
  return out;
}

/** A function declaration or `const NAME = (...) => ...` of a file: { kind, params, open, close } or { kind:'expr', from, to }. */
function defRange(f, name) {
  const bl = f.bl;
  const fn = new RegExp(`(?:export\\s+)?(?:async\\s+)?function\\s*\\*?\\s*${esc(name)}\\s*(?:<[^>(]*>)?\\s*\\(`).exec(bl);
  if (fn) {
    const p = fn.index + fn[0].length - 1;
    const pc = matchClose(bl, p);
    if (pc < 0) return null;
    let o = pc + 1;
    let angle = 0;
    for (; o < bl.length; o++) {
      const c = bl[o];
      if (c === '<') angle++;
      else if (c === '>' && bl[o - 1] !== '=') angle--;
      else if (c === '{' && angle <= 0) break;
      else if (c === ';' && angle <= 0) return null;
    }
    const close = matchClose(bl, o);
    if (o >= bl.length || close < 0) return null;
    return { kind: 'block', name, params: parseParams(f.code.slice(p + 1, pc), p + 1), open: o, close };
  }
  const ar = new RegExp(`(?:export\\s+)?const\\s+${esc(name)}\\s*(?::[^=]+?)?=\\s*(?:async\\s*)?`).exec(bl);
  if (ar) {
    let q = ar.index + ar[0].length;
    let params;
    if (bl[q] === '(') {
      const pc = matchClose(bl, q);
      if (pc < 0) return null;
      params = parseParams(f.code.slice(q + 1, pc), q + 1);
      q = pc + 1;
    } else {
      const idm = /^[A-Za-z_$][\w$]*/.exec(bl.slice(q, q + 80));
      if (!idm) return null;
      params = [{ name: idm[0], defSrc: null, defPos: 0 }];
      q += idm[0].length;
    }
    while (q < bl.length && /\s/.test(bl[q])) q++;
    if (bl[q] === ':') {
      while (q < bl.length && !(bl[q] === '=' && bl[q + 1] === '>')) q++;
    }
    if (!(bl[q] === '=' && bl[q + 1] === '>')) return null;
    q += 2;
    while (q < bl.length && /\s/.test(bl[q])) q++;
    if (bl[q] === '{') {
      const close = matchClose(bl, q);
      return close < 0 ? null : { kind: 'block', name, params, open: q, close };
    }
    return { kind: 'expr', name, params, from: q, to: endOfExpr(bl, q) };
  }
  return null;
}

function findDef(name, cx) {
  const local = defRange(cx.f, name);
  if (local) return { ...local, f: cx.f };
  const ib = importBinding(cx.f.code, name);
  if (!ib) return null;
  const rel = resolveSpec(cx.tree, cx.f.rel, ib.spec);
  if (!rel) return null;
  const f2 = sourceFacts(cx.tree, rel);
  if (f2.missing || !f2.bl || (f2.kind !== 'ts' && f2.kind !== 'js') || (f2.stripIssues && f2.stripIssues.length > 0)) return null;
  const d = defRange(f2, ib.orig);
  return d ? { ...d, f: f2 } : null;
}

// ---- gates ----------------------------------------------------------------------------------------------

function parseCond(f, start, len) {
  const key = `${start}:${len}`;
  let cache = COND_AST.get(f);
  if (!cache) { cache = new Map(); COND_AST.set(f, cache); }
  if (cache.has(key)) return cache.get(key);
  const ast = parseSrc(f.code.slice(start, start + len), start);
  cache.set(key, ast);
  return ast;
}
const COND_AST = new WeakMap();

/** The condition under which the body of `g` runs: its own condition and the negation of every earlier link of its else-if chain. */
function effCond(f, g) {
  let node = parseCond(f, g.condStart, g.cond.length);
  if (!node) return null;
  for (const pc of g.prevConds) {
    const pa = parseCond(f, pc.condStart, pc.cond.length);
    if (!pa) return null;
    node = { t: 'log', op: '&&', l: { t: 'not', x: pa }, r: node };
  }
  return node;
}

/** The status family of the return inside a gate body: 'refuse' (every status >= 400, or a throw), 'success', 'delegated' (`return v` where v is in the condition), 'none'. */
function refusalOf(g) {
  if (!g.returns) return 'none';
  const codes = [...g.body.matchAll(/\bstatus\s*:\s*(\d{3})\b/g)].map((m) => Number(m[1]));
  if (codes.length > 0) return codes.every((c) => c >= 400) ? 'refuse' : 'success';
  if (/\bthrow\b/.test(g.body)) return 'refuse';
  const rv = /\breturn\s+([A-Za-z_$][\w$]*)\s*;?\s*$/.exec(g.body.trim());
  if (rv && new RegExp(`\\b${esc(rv[1])}\\b`).test(g.cond)) return 'delegated';
  return 'none';
}

/** Position of an earlier `return` that plainly SUCCEEDS (a 2xx/3xx or statusless response), which a later gate cannot stop. -1 if none. */
function successBypassBefore(f, H, pos) {
  for (const m of allMatches(f.bl, /\breturn\b/, H.open + 1, pos)) {
    const stmt = f.bl.slice(m.index, endOfExpr(f.bl, m.index + 6));
    const codes = [...stmt.matchAll(/\bstatus\s*:\s*(\d{3})\b/g)].map((x) => Number(x[1]));
    if (codes.length > 0) { if (codes.some((c) => c < 400)) return m.index; continue; }
    if (/\bNextResponse\s*\.\s*(?:next|redirect|rewrite)\s*\(/.test(stmt)) return m.index;
    if (!/\bstatus\b/.test(stmt) && (/\b(?:NextResponse|Response)\s*\.\s*json\s*\(/.test(stmt) || /\bnew\s+(?:NextResponse|Response)\s*\(/.test(stmt))) return m.index;
  }
  return -1;
}

/** Statement-level gates of a handler that run on every request: not inside a branch, loop, callback or braceless `if`. */
function topGates(f, H, from = H.open, to = H.close) {
  return ifGates(f.bl, from, to).filter((g) => !g.nested && !inConditionalBlock(f.bl, H, g.pos));
}

/** Truth value (true | false | UNK) of a gate's effective condition under a world. */
function gateTruth(tree, f, g, world, over = null) {
  const ast = effCond(f, g);
  if (!ast) return UNK;
  return truthy(ev(ast, { tree, f, world, params: over, depth: 0, seen: new Set(), stack: [], steps: { n: 0 } }));
}

/**
 * The first gate of `H` that DEFINITELY refuses in the world: it runs on every request, its condition is true for
 * every value of every input the world leaves open, its body refuses, and no earlier statement can return success
 * around it. { gate } or { gate:null, why }.
 */
function creditedGate(tree, f, H, world, opts = {}) {
  let why = null;
  for (const g of topGates(f, H)) {
    if (opts.before !== undefined && opts.before !== null && g.pos >= opts.before) continue;
    if (gateTruth(tree, f, g, world, opts.over ?? null) !== true) continue;
    const r = refusalOf(g);
    if (r === 'none' || r === 'success') { why = why ?? 'refuses-nothing'; continue; }
    if (successBypassBefore(f, H, g.pos) >= 0) { why = why ?? 'bypassed'; continue; }
    return { gate: g, why: null };
  }
  return { gate: null, why };
}

// ---- evaluation -----------------------------------------------------------------------------------------

function strictEq(a, b) {
  if (isU(a) || isU(b)) return UNK;
  const oa = isObj(a);
  const ob = isObj(b);
  if (oa || ob) return oa && ob ? (a === b ? true : UNK) : false;
  return a === b;
}
function looseEq(a, b) {
  if (isU(a) || isU(b)) return UNK;
  const na = a === null || a === undefined;
  const nb = b === null || b === undefined;
  if (na || nb) return na && nb;
  if (isObj(a) || isObj(b)) return isObj(a) && isObj(b) ? (a === b ? true : UNK) : UNK;
  // eslint-disable-next-line eqeqeq
  return a == b;
}

function getMember(o, name, node) {
  if (isU(o)) return U;
  if (o === null || o === undefined) return node.opt ? undefined : U;
  if (typeof o === 'string') return name === 'length' ? o.length : U;
  if (typeof o !== 'object') return U;
  if (o.k === 'obj') {
    if (o.props.has(name)) return o.props.get(name);
    return o.open ? U : undefined;
  }
  return U;
}

const STR_METHODS = new Set(['trim', 'trimStart', 'trimEnd', 'toLowerCase', 'toUpperCase', 'normalize', 'replace', 'replaceAll', 'slice', 'substring', 'startsWith', 'endsWith', 'includes', 'indexOf', 'charAt']);

function toJsArg(v) {
  if (isU(v)) throw PARSE_FAIL;
  if (v && typeof v === 'object') {
    if (v.k === 're') return new RegExp(v.src, v.flags);
    throw PARSE_FAIL;
  }
  return v;
}

function callMethod(recv, name, argNodes, cx) {
  if (isU(recv)) return U;
  if (typeof recv === 'string' && STR_METHODS.has(name)) {
    try {
      const args = argNodes.map((a) => toJsArg(ev(a, cx)));
      const out = String.prototype[name].apply(recv, args);
      return typeof out === 'string' || typeof out === 'number' || typeof out === 'boolean' ? out : U;
    } catch {
      return U;
    }
  }
  if (isObj(recv) && recv.k === 're' && name === 'test' && argNodes.length === 1) {
    const a = ev(argNodes[0], cx);
    if (isU(a) || (a && typeof a === 'object')) return U;
    try {
      return new RegExp(recv.src, recv.flags.replace(/[gy]/g, '')).test(a);
    } catch {
      return U;
    }
  }
  return U;
}

function evId(node, cx) {
  const name = node.n;
  if (cx.params && cx.params.has(name)) return cx.params.get(name);
  const d = lookupDecl(cx.f, name, node.pos);
  if (d) return isMutable(cx.f, name) ? U : evalDecl(d, cx);
  const wv = cx.world && cx.world.id ? cx.world.id(name, cx) : undefined;
  if (wv !== undefined) return wv;
  const ib = importBinding(cx.f.code, name);
  if (ib) {
    const rel = resolveSpec(cx.tree, cx.f.rel, ib.spec);
    if (rel) {
      const f2 = sourceFacts(cx.tree, rel);
      if (!f2.missing && f2.bl && (f2.kind === 'ts' || f2.kind === 'js') && !(f2.stripIssues && f2.stripIssues.length > 0)) {
        const d2 = declsOf(f2).find((x) => x.name === ib.orig && x.modLevel);
        if (d2 && !isMutable(f2, ib.orig)) return evalDecl(d2, { ...cx, f: f2, params: null });
      }
    }
  }
  return U;
}

function evalDecl(d, cx) {
  if (cx.seen.has(d) || cx.depth > 12) return U;
  if (d.ast === undefined) d.ast = parseSrc(cx.f.code.slice(d.rhsFrom, d.rhsTo), d.rhsFrom);
  if (d.ast === null) return U;
  const cx2 = { ...cx, depth: cx.depth + 1, seen: new Set([...cx.seen, d]) };
  const v = ev(d.ast, cx2);
  if (d.prop === null) return v;
  const got = getMember(v, d.prop, { opt: false });
  if (d.hasDefault && (got === undefined || isU(got))) return U;
  return got;
}

function evalSrc(src, base, cx) {
  const ast = parseSrc(src, base);
  return ast ? ev(ast, cx) : U;
}

function inlineCall(name, argNodes, cx) {
  if (cx.depth > 6) return U;
  const def = findDef(name, cx);
  if (!def) return U;
  const key = `${def.f.rel}#${def.name}`;
  if (cx.stack.includes(key)) return U;
  const args = argNodes.map((a) => ev(a, cx));
  const params = new Map();
  const cx2 = { ...cx, f: def.f, params, depth: cx.depth + 1, stack: [...cx.stack, key], seen: new Set() };
  def.params.forEach((p, idx) => {
    if (!p.name) return;
    let v = idx < args.length ? args[idx] : undefined;
    if (v === undefined && p.defSrc) v = evalSrc(p.defSrc, p.defPos, cx2);
    params.set(p.name, v);
  });
  if (def.kind === 'expr') return evalSrc(def.f.code.slice(def.from, def.to), def.from, cx2);
  return runBlock(def, cx2);
}

function runBlock(def, cx2) {
  const f = def.f;
  const bl = f.bl;
  const rets = allMatches(bl, /\breturn\b/, def.open + 1, def.close);
  if (rets.length === 1) {
    const r = rets[0];
    const exprFrom = r.index + 6;
    const exprTo = endOfExpr(bl, exprFrom);
    const before = bl.slice(def.open + 1, r.index);
    const after = bl.slice(exprTo, def.close).replace(/^[\s;]*/, '').trim();
    if (/^(?:\s*(?:const|let|var)\b[^;]*;)*\s*$/.test(before) && after === '') return evalSrc(f.code.slice(exprFrom, exprTo), exprFrom, cx2);
  }
  // a chain of `if (c) return <refusal>;` followed by `return null;` (or nothing): truthy iff some condition holds
  const H2 = { open: def.open, close: def.close };
  const gates = topGates(f, H2, def.open + 1, def.close);
  if (gates.length === 0) return U;
  let tailFrom = def.open + 1;
  for (const g of gates) tailFrom = Math.max(tailFrom, g.elseTo > 0 ? g.elseTo + 1 : g.bodyTo + 1);
  const tail = bl.slice(tailFrom, def.close).trim();
  const tailReturns = /^(?:return\s*(?:null|undefined|false)?\s*;?)?$/.test(tail);
  if (!tailReturns) return U;
  const tailCount = /\breturn\b/.test(tail) ? 1 : 0;
  let inGates = 0;
  for (const g of gates) inGates += allMatches(g.body, /\breturn\b/).length;
  if (rets.length !== inGates + tailCount) return U;
  let nullMask = false;
  let anyTrue = false;
  let anyMaybe = false;
  for (const g of gates) {
    const t = truthy(ev(effCond(f, g) ?? { t: 'unk' }, cx2));
    const rv = /\breturn\s*([^;]*?)\s*;?\s*$/.exec(g.body.trim());
    const isNull = Boolean(rv) && /^(?:null|undefined|false)?$/.test(rv[1]);
    if (isNull) { if (t !== false) nullMask = true; continue; }
    if (refusalOf(g) !== 'refuse') return U;
    if (t === true) anyTrue = true;
    else if (t === UNK) anyMaybe = true;
  }
  if (nullMask) return U;
  if (anyTrue) return U_T;
  if (anyMaybe) return U;
  return null;
}

function evCall(node, cx) {
  const c = node.c;
  if (c.t === 'id') {
    const w = cx.world && cx.world.call ? cx.world.call(c.n, node.a, cx) : undefined;
    if (w !== undefined) return w;
    if (c.n === 'Boolean') return node.a.length === 1 ? fromTri(truthy(ev(node.a[0], cx))) : U;
    // a name the world gives a meaning to (the manifest, an audience predicate, a posture API) means that thing only
    // when it is imported from the real module; a local function that merely shares the name is NOT inlined
    if (cx.world && cx.world.owns && cx.world.owns(c.n, cx)) return U;
    return inlineCall(c.n, node.a, cx);
  }
  if (c.t === 'mem') {
    if (c.o.t === 'id') {
      const w = cx.world && cx.world.method ? cx.world.method(c.o.n, c.p, node.a, cx) : undefined;
      if (w !== undefined) return w;
      if ((c.o.n === 'NextResponse' || c.o.n === 'Response') && ['json', 'redirect', 'next', 'rewrite'].includes(c.p)) return U_T;
    }
    return callMethod(ev(c.o, cx), c.p, node.a, cx);
  }
  return U;
}

function ev(node, cx) {
  if (!node) return U;
  if (cx.steps && ++cx.steps.n > 20000) return U;
  switch (node.t) {
    case 'lit': return node.v;
    case 're': return { k: 're', src: node.src, flags: node.flags };
    case 'id': return evId(node, cx);
    case 'not': return fromTri(triNot(truthy(ev(node.x, cx))));
    case 'neg': { const v = ev(node.x, cx); return typeof v === 'number' ? -v : U; }
    case 'await': return ev(node.x, cx);
    case 'void': return undefined;
    case 'typeof': { const v = ev(node.x, cx); return isU(v) ? U : isObj(v) ? 'object' : typeof v; }
    case 'log': {
      const l = ev(node.l, cx);
      const tl = truthy(l);
      if (node.op === '&&') {
        if (tl === false) return l;
        if (tl === true) return ev(node.r, cx);
        return truthy(ev(node.r, cx)) === false ? U_F : U;
      }
      if (node.op === '||') {
        if (tl === true) return l;
        if (tl === false) return ev(node.r, cx);
        return truthy(ev(node.r, cx)) === true ? U_T : U;
      }
      if (isU(l)) return U;
      return l === null || l === undefined ? ev(node.r, cx) : l;
    }
    case 'bin': {
      const a = ev(node.l, cx);
      const b = ev(node.r, cx);
      switch (node.op) {
        case '===': return fromTri(strictEq(a, b));
        case '!==': return fromTri(triNot(strictEq(a, b)));
        case '==': return fromTri(looseEq(a, b));
        case '!=': return fromTri(triNot(looseEq(a, b)));
        case '<': case '>': case '<=': case '>=': {
          if ((typeof a === 'number' && typeof b === 'number') || (typeof a === 'string' && typeof b === 'string')) {
            return node.op === '<' ? a < b : node.op === '>' ? a > b : node.op === '<=' ? a <= b : a >= b;
          }
          return U;
        }
        case '+': return (typeof a === 'number' && typeof b === 'number') || (typeof a === 'string' && typeof b === 'string') ? a + b : U;
        case '-': return typeof a === 'number' && typeof b === 'number' ? a - b : U;
        case '*': return typeof a === 'number' && typeof b === 'number' ? a * b : U;
        case '/': return typeof a === 'number' && typeof b === 'number' && b !== 0 ? a / b : U;
        case '%': return typeof a === 'number' && typeof b === 'number' && b !== 0 ? a % b : U;
        default: return U;
      }
    }
    case 'cond': {
      const t = truthy(ev(node.c, cx));
      if (t === true) return ev(node.a, cx);
      if (t === false) return ev(node.b, cx);
      const a = ev(node.a, cx);
      const b = ev(node.b, cx);
      const ta = truthy(a);
      const tb = truthy(b);
      if (ta !== UNK && ta === tb) return ta ? U_T : U_F;
      return U;
    }
    case 'mem': return getMember(ev(node.o, cx), node.p, node);
    case 'idx': {
      const k = ev(node.i, cx);
      const o = ev(node.o, cx);
      return typeof k === 'string' || typeof k === 'number' ? getMember(o, String(k), node) : U;
    }
    case 'call': return evCall(node, cx);
    case 'obj': {
      const props = new Map();
      for (const p of node.props) props.set(p.k, ev(p.v, cx));
      return { k: 'obj', props, open: node.open };
    }
    case 'arr': return { k: 'obj', props: new Map(), open: true };
    case 'new': return U_T;
    default: return U;
  }
}

/** A world object: an opaque result whose named members are given and whose other members are unknown. */
const worldObj = (tag, members) => ({ k: 'obj', tag, props: new Map(Object.entries(members)), open: true });


// ---- tree edit helpers (every anchor must exist exactly once, else the defeat is STALE, not vacuous) ---

function stale(rel, why) {
  return new VacuousMutation(`stale defeat: ${why}`, { rel, op: 'edit', reason: 'no-match' });
}

function once(src, anchor, rel) {
  const first = src.indexOf(anchor);
  if (first < 0) throw stale(rel, `anchor not found: ${anchor.slice(0, 48)}`);
  if (src.indexOf(anchor, first + anchor.length) >= 0) throw stale(rel, `anchor not unique: ${anchor.slice(0, 48)}`);
  return first;
}

const insertBefore = (tree, rel, anchor, text) =>
  tree.edit(rel, (s) => {
    const i = once(s, anchor, rel);
    return s.slice(0, i) + text + s.slice(i);
  });

const insertAfter = (tree, rel, anchor, text) =>
  tree.edit(rel, (s) => {
    const i = once(s, anchor, rel);
    return s.slice(0, i + anchor.length) + text + s.slice(i + anchor.length);
  });

const swap = (tree, rel, anchor, text) =>
  tree.edit(rel, (s) => {
    const i = once(s, anchor, rel);
    return s.slice(0, i) + text + s.slice(i + anchor.length);
  });

/** Cut `if (ifMarker) { ... }` (optionally starting earlier, at fromMarker) out of the source, return both. */
function cutIfBlock(src, rel, ifMarker, fromMarker = ifMarker) {
  const ifIdx = once(src, ifMarker, rel);
  const p = src.indexOf('(', ifIdx);
  const pc = matchClose(src, p);
  const brace = src.indexOf('{', pc);
  const end = matchClose(src, brace);
  if (p < 0 || pc < 0 || brace < 0 || end < 0) throw stale(rel, `cannot brace-match block at ${ifMarker.slice(0, 40)}`);
  const fromIdx = once(src, fromMarker, rel);
  const start = src.lastIndexOf('\n', fromIdx) + 1;
  const block = src.slice(start, end + 1);
  let rest = src.slice(end + 1);
  if (rest.startsWith('\n')) rest = rest.slice(1);
  return { before: src.slice(0, start), block: `${block}\n`, after: rest };
}

// =====================================================================================================
// 2. FILE NAMES
// =====================================================================================================

const SOURCES_ROUTE = 'app/api/writers-studio/sources/route.ts';
const WORKBENCH_ROUTE = 'app/api/book-studio/workbench/uploads/route.ts';
const INGEST_ROUTE = 'app/api/sovereign/manuscripts/ingest/route.ts';
const MANUSCRIPTS_ROUTE = 'app/api/sovereign/manuscripts/route.ts';
const RELEASE_AUTHORITY = 'lib/writersStudio/releaseAuthority.ts';
const IMPORT_ROOM = 'app/dev/writers-studio-pc3-live/P4R1ImportManuscript.tsx';
const RENDER_ROUTE = 'app/api/sovereign/manuscripts/[id]/render/route.ts';
const EXPORT_RELEASE = 'lib/manuscript/render/memberBookExportRelease.ts';
const EXPORT_RELEASE_CITED = 'lib/writersStudio/memberBookExportRelease.ts'; // the path in the lane brief; absent at this commit

// =====================================================================================================
// 3. SF-01 -- the sources POST is hard-held, or goes through the envelope; never plaintext ingest
// =====================================================================================================

function checkSf01(tree) {
  const rep = report();
  const f = need(tree, SOURCES_ROUTE, rep);
  if (!f) return rep.done();
  const r = resolveHandler(f, 'POST');

  // The plaintext intake must be unreachable from this route: by name, by import, or via a direct import.
  const plain = [];
  for (const m of allMatches(f.bl, /\bingestWorkbenchUpload\b/)) plain.push(m.index);
  const imp = firstMatch(f.code, /(?:import|export)\s[^;]*?from\s*['"][^'"]*lib\/workbench\/(?:intake|storage)['"]/);
  if (imp) plain.push(imp.index);
  const directImports = localImports(tree, SOURCES_ROUTE);
  let scannedImports = 0;
  for (const dep of directImports) {
    if (dep === 'lib/workbench/intake.ts') continue;
    const df = sourceFacts(tree, dep);
    if (df.missing || !df.bl) continue;
    scannedImports++;
    if (/\bingestWorkbenchUpload\b/.test(df.bl)) rep.bad(`${dep} (a direct import of the route) references the plaintext ingestWorkbenchUpload`);
  }
  if (plain.length > 0) rep.bad(`${loc(f, plain[0])} the route reaches the plaintext ingestWorkbenchUpload`);
  else rep.ok(`${f.rel} does not reference ingestWorkbenchUpload (route plus ${scannedImports} direct local imports scanned)`);

  // No export of POST at all is a closed door. An export this module cannot LOCATE is not: UNKNOWN, never GREEN.
  if (r === null) {
    rep.ok(`${f.rel} exports no POST handler, so there is no upload door`);
    return rep.done();
  }
  if (r.unresolved) {
    rep.unknown(`${f.rel} exports POST in a form this module cannot locate (wrapped, aliased or re-exported), so the door cannot be shown closed`);
    return rep.done();
  }
  const H = r.H;
  const hold = hardHold(f, H);
  const envelope = firstMatch(f.bl, ENVELOPE_RE, H.open, H.close);
  const bodyRead = firstBodyRead(f, H);
  if (hold) {
    rep.ok(`${loc(f, hold.pos)} POST is hard-held: an unconditional 423 return precedes any body read and any storage or SQL${hold.bodyRead === null ? ' (the handler reads no body at all)' : ''}`);
  } else if (envelope) {
    // The envelope is a way to land an original, not a licence to ALSO write one in the clear.
    const other = plainEffect(f.bl, H.open, H.close);
    if (other) rep.bad(`${loc(f, other.index)} POST calls the encrypted envelope entrypoint but also stores outside it`);
    else rep.ok(`${loc(f, envelope.index)} POST lands through the encrypted envelope entrypoint and stores nothing outside it`);
  } else {
    const holdAny = firstMatch(f.bl, /\bstatus\s*:\s*423\b/, H.open, H.close);
    if (bodyRead !== null) rep.bad(`${loc(f, bodyRead)} POST reads the request body and is neither hard-held before it nor routed through the envelope`);
    else rep.bad(`${loc(f, H.open)} POST has no unconditional 423 before storage or SQL and no envelope entrypoint`);
    if (holdAny && !unconditionalReturnAt(f.bl, H, holdAny.index)) rep.state(`${loc(f, holdAny.index)} a 423 exists but is conditional, so it is not a hard hold`);
    else if (holdAny && bodyRead !== null && holdAny.index > bodyRead) rep.state(`${loc(f, holdAny.index)} a 423 exists but only after the body was read`);
  }
  return rep.done();
}

const SF01_LIVE_POST = `export async function POST(request: NextRequest) {
  const memberId = await getMemberIdFromRequest(request);
  if (!memberId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const form = await request.formData();
  const file = form.get('file');
  if (!(file instanceof File)) return NextResponse.json({ error: 'Missing file' }, { status: 400 });
  const out = await ingestWorkbenchUpload(memberId, file);
  return NextResponse.json({ source: out }, { status: 201 });
}`;

function replacePost(tree, newPost, prefix = '') {
  return tree.edit(SOURCES_ROUTE, (s) => {
    const i = once(s, 'export async function POST() {', SOURCES_ROUTE);
    const open = s.indexOf('{', i);
    const end = matchClose(s, open);
    if (end < 0) throw stale(SOURCES_ROUTE, 'cannot brace-match the POST stub');
    return prefix + s.slice(0, i) + newPost + s.slice(end + 1);
  });
}

const SF01_WRAPPED = `export const POST = withMember(async (request: NextRequest, memberId: string) => {
  const form = await request.formData();
  const file = form.get('file');
  await fs.promises.writeFile('/tmp/original.bin', Buffer.from(await (file as File).arrayBuffer()));
  await query('INSERT INTO workbench_uploads (arranger_id) VALUES ($1)', [memberId]);
  return NextResponse.json({ ok: true }, { status: 201 });
});`;
const SF01_ALIAS_OPEN = (tail) => `async function handler(request: NextRequest) {
  const form = await request.formData();
  await query('INSERT INTO workbench_uploads (original_name) VALUES ($1)', [String(form.get('name'))]);
  return NextResponse.json({ ok: true }, { status: 201 });
}
${tail}`;

const SF01 = {
  id: 'SF-01',
  title: 'The sources upload POST is hard-held before any body is read, or lands through the envelope',
  law: 'the sources upload POST is either hard-held before any body is read, or routes through the encrypted envelope; it never reaches plaintext ingestWorkbenchUpload',
  obligations: ['WSI-40', 'WSI-41'],
  claims: ['C01'],
  kind: 'law',
  expectedToday: 'GREEN',
  whyExpected:
    'POST on app/api/writers-studio/sources/route.ts takes no parameter and returns a bare 423 as its only statement, so no body read, storage or SQL can precede it; the route and its direct local imports do not reference the plaintext ingestWorkbenchUpload, which has no non-test caller at this commit.',
  rulingPending: null,
  check: checkSf01,
  defeats: [
    {
      name: 'the door branch: a live POST that authenticates, reads multipart and calls plaintext ingestWorkbenchUpload',
      kind: 'break',
      expect: 'RED',
      diesBecause: 'reaches the plaintext ingestWorkbenchUpload',
      apply: (t) => replacePost(t, SF01_LIVE_POST, "import { ingestWorkbenchUpload } from '@/lib/workbench/intake';\n"),
    },
    {
      name: 'SUBTLE: the 423 is still there but returned only AFTER await request.formData()',
      kind: 'break',
      expect: 'RED',
      diesBecause: 'reads the request body and is neither hard-held before it',
      apply: (t) =>
        replacePost(
          t,
          `export async function POST(request: NextRequest) {
  await request.formData();
  return NextResponse.json(
    { error: 'Source uploads are temporarily unavailable.' },
    { status: 423, headers: { 'Cache-Control': 'no-store' } },
  );
}`,
        ),
    },
    {
      name: 'SUBTLE: the original bytes are pulled into memory with request.arrayBuffer() BEFORE the 423 is returned',
      kind: 'break',
      expect: 'RED',
      diesBecause: 'reads the request body and is neither hard-held before it',
      apply: (t) =>
        replacePost(
          t,
          `export async function POST(request: NextRequest) {
  const bytes = Buffer.from(await request.arrayBuffer());
  void bytes.length;
  return NextResponse.json({ error: 'held' }, { status: 423 });
}`,
        ),
    },
    {
      name: 'an environment-variable hold: conditional 423, then the body is read and stored (the manifest forbids env holds)',
      kind: 'break',
      expect: 'RED',
      diesBecause: 'neither hard-held before it nor routed through the envelope',
      apply: (t) =>
        replacePost(
          t,
          `export async function POST(request: NextRequest) {
  if (process.env.WRITER_SOURCE_UPLOADS_HELD !== '0') {
    return NextResponse.json({ error: 'held' }, { status: 423 });
  }
  const form = await request.formData();
  const file = form.get('file');
  if (!(file instanceof File)) return NextResponse.json({ error: 'Missing file' }, { status: 400 });
  await query('INSERT INTO workbench_uploads (original_name) VALUES ($1)', [file.name]);
  return NextResponse.json({ ok: true }, { status: 201 });
}`,
        ),
    },
    {
      name: 'a row is inserted BEFORE the 423 is returned (the hold no longer precedes storage or SQL)',
      kind: 'break',
      expect: 'RED',
      diesBecause: 'before storage or SQL',
      apply: (t) =>
        replacePost(
          t,
          `export async function POST(request: NextRequest) {
  await query('INSERT INTO workbench_uploads (original_name) VALUES ($1)', ['pending']);
  return NextResponse.json({ error: 'held' }, { status: 423 });
}`,
        ),
    },
    {
      name: 'SUBTLE: the route imports a new bridge module whose function calls ingestWorkbenchUpload (indirect reach through a direct import)',
      kind: 'break',
      expect: 'RED',
      diesBecause: 'a direct import of the route',
      apply: (t) =>
        insertAfter(
          t.add('lib/workbench/sourcesBridge.ts', "import { ingestWorkbenchUpload } from './intake';\n\nexport const bridge = (memberId: string, file: File) => ingestWorkbenchUpload(memberId, file);\n"),
          SOURCES_ROUTE,
          "import { query } from '@/lib/db/postgres';\n",
          "import { bridge } from '@/lib/workbench/sourcesBridge';\n",
        ),
    },
    {
      name: 'the stub imports the plaintext intake module (the import alone re-opens the route to it)',
      kind: 'break',
      expect: 'RED',
      diesBecause: 'reaches the plaintext ingestWorkbenchUpload',
      apply: (t) => insertAfter(t, SOURCES_ROUTE, "import { query } from '@/lib/db/postgres';\n", "import { ingestWorkbenchUpload } from '@/lib/workbench/intake';\n"),
    },
    {
      name: 'the wrapped door: POST = withMember(async ...) re-opens the sources route, reads multipart and stores plaintext',
      kind: 'break',
      expect: 'RED',
      diesBecause: 'neither hard-held before it nor routed through the envelope',
      apply: (t) => replacePost(t, SF01_WRAPPED),
    },
    {
      name: 'the aliased door: handler is exported as POST through an export list',
      kind: 'break',
      expect: 'RED',
      diesBecause: 'neither hard-held before it nor routed through the envelope',
      apply: (t) => replacePost(t, SF01_ALIAS_OPEN('export { handler as POST };')),
    },
    {
      name: 'the aliased door: export const POST = handler',
      kind: 'break',
      expect: 'RED',
      diesBecause: 'neither hard-held before it nor routed through the envelope',
      apply: (t) => replacePost(t, SF01_ALIAS_OPEN('export const POST = handler;')),
    },
    {
      name: 'the envelope entrypoint is called but the plaintext original is also written and a row inserted beside it',
      kind: 'break',
      expect: 'RED',
      diesBecause: 'also stores outside it',
      apply: (t) =>
        replacePost(
          t,
          `export async function POST(request: NextRequest) {
  const form = await request.formData();
  await fs.promises.writeFile('/tmp/original.bin', Buffer.from('x'));
  await query('INSERT INTO workbench_uploads (id) VALUES ($1)', ['x']);
  await recordArtifactArrival({ memberId: 'm' });
  return NextResponse.json({ ok: true }, { status: 201 });
}`,
        ),
    },
    {
      name: 'a row is written with insertOne() BEFORE the 423 (a storing call the short verb list never named)',
      kind: 'break',
      expect: 'RED',
      diesBecause: 'before storage or SQL',
      apply: (t) => replacePost(t, "export async function POST() {\n  await insertOne('workbench_uploads', { id: 'x' });\n  return NextResponse.json({ error: 'held' }, { status: 423 });\n}"),
    },
    {
      name: 'a row is written with a sql tagged template BEFORE the 423',
      kind: 'break',
      expect: 'RED',
      diesBecause: 'before storage or SQL',
      apply: (t) => replacePost(t, "export async function POST() {\n  await sql`INSERT INTO workbench_uploads (id) VALUES (1)`;\n  return NextResponse.json({ error: 'held' }, { status: 423 });\n}"),
    },
    {
      name: 'an early return that SUCCEEDS (a conditional 200) sits ahead of the 423, so the "hold" can be skipped',
      kind: 'break',
      expect: 'RED',
      diesBecause: 'no unconditional 423 before storage or SQL',
      apply: (t) => replacePost(t, "export async function POST(request: NextRequest) {\n  if (request.nextUrl.searchParams.get('x') === '1') return NextResponse.json({ ok: true }, { status: 200 });\n  return NextResponse.json({ error: 'held' }, { status: 423 });\n}"),
    },
  ],
  decoys: [
    {
      name: 'POST is removed entirely (no upload door at all is a stronger hold than a 423)',
      expect: 'GREEN',
      apply: (t) => replacePost(t, ''),
    },
    {
      name: 'the legitimate alternative: POST authenticates, reads multipart and lands the original through the encrypted envelope entrypoint',
      expect: 'GREEN',
      apply: (t) =>
        replacePost(
          t,
          `export async function POST(request: NextRequest) {
  const memberId = await getMemberIdFromRequest(request);
  if (!memberId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const form = await request.formData();
  const file = form.get('file');
  if (!(file instanceof File)) return NextResponse.json({ error: 'Missing file' }, { status: 400 });
  const bytes = Buffer.from(await file.arrayBuffer());
  await recordArtifactArrival({ memberId, bytes, originalFilename: file.name, mimeType: file.type || null, sourceText: 'fictional', extractor: 'text', idempotencyKey: null });
  return NextResponse.json({ ok: true }, { status: 201 });
}`,
          "import { recordArtifactArrival } from '@/lib/manuscript/source/arrivals';\n",
        ),
    },
    {
      name: 'a comment recalls the old plaintext call inside POST (a naive substring check would fail)',
      expect: 'GREEN',
      apply: (t) => insertAfter(t, SOURCES_ROUTE, 'export async function POST() {\n', '  // formerly: await ingestWorkbenchUpload(memberId, file) after request.formData()\n'),
    },
    {
      name: 'the 423 message is reworded to mention the plaintext call and formData as TEXT (strings are not code)',
      expect: 'GREEN',
      apply: (t) =>
        swap(
          t,
          SOURCES_ROUTE,
          "{ error: 'Source uploads are temporarily unavailable pending independent security and recovery acceptance.' }",
          "{ error: 'ingestWorkbenchUpload() and request.formData() are unavailable' }",
        ),
    },
    {
      name: 'the wrapped handler is still a hard hold (a wrapper does not make a 423 any less unconditional)',
      expect: 'GREEN',
      apply: (t) => replacePost(t, "export const POST = withMember(async () => {\n  return NextResponse.json({ error: 'held' }, { status: 423, headers: { 'Cache-Control': 'no-store' } });\n});"),
    },
    {
      name: 'the aliased handler is still a hard hold',
      expect: 'GREEN',
      apply: (t) => replacePost(t, "async function handler() {\n  return NextResponse.json({ error: 'held' }, { status: 423 });\n}\nexport { handler as POST };"),
    },
  ],
};

// =====================================================================================================
// 4. SF-02 -- a route that persists original bytes is gated by the release manifest or uses the envelope
// =====================================================================================================

function codebaseFacts(tree, rep) {
  // C02, as context: who imports the key authority / envelope / landing / release authority?
  const dirs = ['lib/workbench', 'app/api/book-studio', 'app/api/writers-studio'];
  const importRe = /(?:from\s*|import\s*\(\s*|import\s+)['"][^'"]*(?:sourceKeyAuthority|sourceEnvelope|encryptedLanding|source\/arrivals|releaseAuthority)['"]/;
  let files = 0;
  const importers = [];
  for (const d of dirs) {
    for (const rel of tree.list(d, { ext: ['.ts', '.tsx'] })) {
      if (/\/__tests__\//.test(rel) || /\.test\.tsx?$/.test(rel)) continue;
      files++;
      const code = tree.code(rel);
      if (code && importRe.test(code)) importers.push(rel);
    }
  }
  if (files === 0) rep.unknown('no source files found under lib/workbench, app/api/book-studio and app/api/writers-studio');
  else rep.ctx(`${importers.length} of ${files} non-test files under lib/workbench, app/api/book-studio and app/api/writers-studio import the key authority, envelope, landing or release authority${importers.length ? ` (${importers.join(', ')})` : ''}`);
  // C03, as context: do the committed Caddyfiles carry any 423 hold for the upload doors?
  const caddies = ['Caddyfile', 'Caddyfile.staging', 'infra/Caddyfile'].filter((r) => tree.isFile(r));
  let holds = 0;
  for (const r of caddies) {
    const c = tree.code(r) ?? '';
    if (/\b423\b/.test(c) || /workbench\/uploads|writers-studio\/sources/.test(c)) holds++;
  }
  if (caddies.length === 0) rep.unknown('no committed Caddyfile found to test for edge holds');
  else rep.ctx(`${holds} of ${caddies.length} committed Caddyfiles carry a 423 rule or name an upload door; the edge holds named in the plan are not in the repository`);
}

function checkSf02(tree) {
  const rep = report();
  const f = need(tree, WORKBENCH_ROUTE, rep);
  if (!f) return rep.done();
  const H = handlerOf(f, 'POST', rep);
  if (!H) return rep.done();

  const persist = firstMatch(f.bl, PERSIST_RE, H.open, H.close);
  const bodyRead = firstBodyRead(f, H);
  const founder = firstMatch(f.bl, /\brequireFounder\s*\(/, H.open, H.close);
  const envelope = firstMatch(f.bl, ENVELOPE_RE, H.open, H.close);
  const stored = plainEffect(f.bl, H.open, H.close);
  const anyManifestRef = firstMatch(f.bl, /\b(?:writerReleaseAuthority|sourceIntakeReleased)\b/);

  if (founder) rep.state(`${loc(f, founder.index)} POST authenticates with requireFounder: an audience check, not a release gate`);
  if (bodyRead !== null) rep.state(`${loc(f, bodyRead)} POST reads the multipart body`);
  if (persist) rep.state(`${loc(f, persist.index)} POST persists the uploaded original bytes on the host filesystem`);
  codebaseFacts(tree, rep);

  if (!persist && !envelope) {
    rep.ok(`${f.rel} POST persists no original bytes, so the law does not apply there`);
    return rep.done();
  }
  if (envelope) {
    // landing through the envelope is the answer only if nothing is ALSO written outside it
    if (stored) rep.bad(`${loc(f, stored.index)} POST calls the encrypted envelope entrypoint but also stores outside it`);
    else rep.ok(`${loc(f, envelope.index)} POST writes through the encrypted envelope entrypoint and stores nothing outside it`);
    return rep.done();
  }

  // THE HAZARD (plan finding F2): this store is plaintext, and the lift runbook removes the edge rule that holds it at
  // the very moment the manifest flips. So the in-code hold must engage when the manifest RELEASES intake. A gate that
  // refuses while intake is HELD is the opposite: it opens the plaintext store at the flip.
  const early = (pos) => (bodyRead === null || pos < bodyRead) && (!stored || pos < stored.index) && (!persist || pos < persist.index);
  const hard = hardHold(f, H);
  const onRelease = creditedGate(tree, f, H, releaseWorld(true));
  if (hard && early(hard.pos)) {
    rep.ok(`${loc(f, hard.pos)} POST is hard-held: an unconditional 423 precedes any body read and any storage, so no manifest change can open it`);
    return rep.done();
  }
  if (onRelease.gate && early(onRelease.gate.pos)) {
    rep.ok(`${loc(f, onRelease.gate.pos)} POST refuses whenever the manifest releases intake, before any body read or persistence`);
    return rep.done();
  }
  const whileHeld = creditedGate(tree, f, H, releaseWorld(false));
  if (onRelease.gate) rep.bad(`${loc(f, onRelease.gate.pos)} the release-manifest gate exists but comes after the body read or the persistence`);
  else if (whileHeld.gate) rep.bad(`${loc(f, whileHeld.gate.pos)} the only manifest gate refuses while intake is HELD, so the plaintext store opens the moment the manifest releases it (the hazard polarity)`);
  else if (anyManifestRef) rep.bad(`${loc(f, anyManifestRef.index)} the route names the release manifest but has no gate that refuses once the manifest releases intake`);
  else rep.bad(`${loc(f, persist ? persist.index : H.open)} POST persists original bytes with no release-manifest gate and no envelope entrypoint`);
  return rep.done();
}

const WB_IMPORT_ANCHOR = "import { NextRequest, NextResponse } from 'next/server';\n";
const WB_RELEASE_IMPORT = "import { writerReleaseAuthority } from '@/lib/writersStudio/releaseAuthority';\n";
const WB_AFTER_AUTH = '  const arrangerId = auth.memberId;\n';
// THE LIFT-SAFE GATE: refuse once the manifest releases intake (and, in the hard form, always).
const WB_GATE = `
  if (writerReleaseAuthority().sourceIntakeReleased) {
    return NextResponse.json(
      { error: 'Original uploads are not available on this Writer image.' },
      { status: 423, headers: { 'Cache-Control': 'no-store' } },
    );
  }
`;
const WB_HAZARD_GATE = WB_GATE.replace('if (writerReleaseAuthority()', 'if (!writerReleaseAuthority()');
const WB_HOLD_HELPER_REL = 'lib/workbench/plaintextStoreHold.ts';
// The shape of the repository's own D2 repair (hardening branch 0d87ff7c): the hold lives in a helper that is
// held when the manifest releases intake AND the store is not envelope-encrypted, and the route calls it.
const WB_HOLD_HELPER = `import type { WriterReleaseAuthority } from '@/lib/writersStudio/releaseAuthority';

export const WORKBENCH_STORE_IS_ENVELOPE_ENCRYPTED = false;

export function workbenchPlaintextStoreHeld(
  authority: Pick<WriterReleaseAuthority, 'sourceIntakeReleased'>,
  envelopeEncrypted: boolean = WORKBENCH_STORE_IS_ENVELOPE_ENCRYPTED,
): boolean {
  return authority.sourceIntakeReleased !== false && envelopeEncrypted !== true;
}
`;
const wbHelperFix = (t, helperSrc = WB_HOLD_HELPER) =>
  insertAfter(
    insertAfter(t.add(WB_HOLD_HELPER_REL, helperSrc), WORKBENCH_ROUTE, WB_IMPORT_ANCHOR, `${WB_RELEASE_IMPORT}import { workbenchPlaintextStoreHeld } from '@/lib/workbench/plaintextStoreHold';\n`),
    WORKBENCH_ROUTE,
    WB_AFTER_AUTH,
    "\n  if (workbenchPlaintextStoreHeld(writerReleaseAuthority())) {\n    return NextResponse.json({ error: 'Original uploads are not available on this Writer image.', code: 'workbench_plaintext_store_held' }, { status: 423, headers: { 'Cache-Control': 'no-store' } });\n  }\n",
  );
const wbGate = (t, text) => insertAfter(insertAfter(t, WORKBENCH_ROUTE, WB_IMPORT_ANCHOR, WB_RELEASE_IMPORT), WORKBENCH_ROUTE, WB_AFTER_AUTH, text);

const SF02 = {
  id: 'SF-02',
  title: 'A route that persists uploaded originals is held in code by the release manifest at the lift, or lands through the envelope',
  law: 'a route that persists uploaded original bytes in plaintext is held in code the moment the release manifest releases intake (or is hard-held, or writes through the envelope); a gate that refuses only while intake is held is not a hold, it is the hazard, and founder-only auth is not a release gate',
  obligations: ['WSI-07', 'WSI-41'],
  claims: ['C02', 'C03'],
  kind: 'law',
  expectedToday: 'RED',
  whyExpected:
    'POST on app/api/book-studio/workbench/uploads/route.ts is gated only by requireFounder, reads multipart, and writes original.<ext> through writeOriginal to the host filesystem; it never references the release manifest, the envelope or the landing library, and no committed Caddyfile carries the edge hold the plan relies on. The plan (F2) records why the manifest tie matters: the lift runbook removes the edge hold at the moment the manifest flips, so the in-code hold must engage when the manifest RELEASES intake.',
  rulingPending: null,
  check: checkSf02,
  defeats: [
    {
      name: 'FIX: a gate that refuses whenever writerReleaseAuthority().sourceIntakeReleased is true, before the body is read',
      kind: 'fix',
      expect: 'GREEN',
      apply: (t) => wbGate(t, WB_GATE),
    },
    {
      name: 'FIX (fail closed): the gate refuses unless the manifest flag is literally false',
      kind: 'fix',
      expect: 'GREEN',
      apply: (t) => wbGate(t, "\n  if (writerReleaseAuthority().sourceIntakeReleased !== false) return NextResponse.json({ error: 'held' }, { status: 423 });\n"),
    },
    {
      name: 'SUBTLE FIX: the flag is destructured from the manifest first and the gate tests the local name',
      kind: 'fix',
      expect: 'GREEN',
      apply: (t) => wbGate(t, "\n  const { sourceIntakeReleased: intakeOpen } = writerReleaseAuthority();\n  if (intakeOpen) return NextResponse.json({ error: 'Original uploads are not available on this Writer image.' }, { status: 423 });\n"),
    },
    {
      name: "SUBTLE FIX (the repository's own D2 repair): the hold is a helper, held when the manifest releases intake and the store is not envelope-encrypted",
      kind: 'fix',
      expect: 'GREEN',
      apply: (t) => wbHelperFix(t),
    },
    {
      name: 'FIX (hard hold): an unconditional 423 before the body is read, which no manifest change can open',
      kind: 'fix',
      expect: 'GREEN',
      apply: (t) => insertAfter(t, WORKBENCH_ROUTE, WB_AFTER_AUTH, "\n  return NextResponse.json({ error: 'Original uploads are not available on this Writer image.' }, { status: 423, headers: { 'Cache-Control': 'no-store' } });\n"),
    },
  ],
  decoys: [
    {
      name: 'THE HAZARD GATE: refuses while the manifest HOLDS intake, so it opens the plaintext store at the lift',
      expect: 'RED',
      diesBecause: 'the hazard polarity',
      apply: (t) => wbGate(t, WB_HAZARD_GATE),
    },
    {
      name: 'the hazard gate, and then the lift itself: sourceIntakeReleased flips to true (the store is now open to founders with no hold)',
      expect: 'RED',
      diesBecause: 'the hazard polarity',
      apply: (t) => swap(wbGate(t, WB_HAZARD_GATE), RELEASE_AUTHORITY, '  sourceIntakeReleased: false,', '  sourceIntakeReleased: true,'),
    },
    {
      name: 'the lift-safe gate exists but only runs when an environment variable asks for it (conditional enforcement)',
      expect: 'RED',
      apply: (t) => wbGate(t, "\n  if (process.env.WRITER_ENFORCE_RELEASE === '1') {\n    if (writerReleaseAuthority().sourceIntakeReleased) {\n      return NextResponse.json({ error: 'held' }, { status: 423 });\n    }\n  }\n"),
    },
    {
      name: 'the lift-safe gate carries an environment conjunct (&& process.env flag), so with the flag unset the store is open',
      expect: 'RED',
      apply: (t) => wbGate(t, "\n  if (writerReleaseAuthority().sourceIntakeReleased && process.env.WRITER_ENFORCE_RELEASE === '1') return NextResponse.json({ error: 'held' }, { status: 423 });\n"),
    },
    {
      name: 'the lift-safe gate has a bypass in its negation (unless an environment override is set)',
      expect: 'RED',
      apply: (t) => wbGate(t, "\n  if (writerReleaseAuthority().sourceIntakeReleased && !(process.env.WRITER_FORCE_OPEN === '1')) return NextResponse.json({ error: 'held' }, { status: 423 });\n"),
    },
    {
      name: 'the lift-safe gate sits behind an else-if whose first branch an environment variable can take',
      expect: 'RED',
      apply: (t) => wbGate(t, "\n  if (process.env.WRITER_BYPASS === '1') {\n    // proceed\n  } else if (writerReleaseAuthority().sourceIntakeReleased) {\n    return NextResponse.json({ error: 'held' }, { status: 423 });\n  }\n"),
    },
    {
      name: 'a request header can skip an early return that proceeds with the upload, ahead of the lift-safe gate',
      expect: 'RED',
      apply: (t) => wbGate(t, "\n  if (req.headers.get('x-skip-hold') === '1') return NextResponse.json({ ok: true });\n  if (writerReleaseAuthority().sourceIntakeReleased) return NextResponse.json({ error: 'held' }, { status: 423 });\n"),
    },
    {
      name: 'the helper hold keys on an environment variable instead of the manifest',
      expect: 'RED',
      apply: (t) => wbHelperFix(t, "export function workbenchPlaintextStoreHeld(_authority: unknown): boolean {\n  return process.env.WORKBENCH_HOLD === '1';\n}\n"),
    },
    {
      name: 'the helper hold is written for the manifest but its envelope constant is true (the store is declared encrypted, the hold never engages)',
      expect: 'RED',
      apply: (t) => wbHelperFix(t, WB_HOLD_HELPER.replace('IS_ENVELOPE_ENCRYPTED = false', 'IS_ENVELOPE_ENCRYPTED = true')),
    },
    {
      name: 'a second, stricter founder check is added (more audience, still no release gate)',
      expect: 'RED',
      apply: (t) => insertAfter(t, WORKBENCH_ROUTE, WB_AFTER_AUTH, '  const again = await requireFounder();\n  if (!again.ok) return NextResponse.json({ error: again.error }, { status: again.status });\n'),
    },
    {
      name: 'a gate keyed on an environment variable (not the manifest, which no env var may lift)',
      expect: 'RED',
      apply: (t) => insertAfter(t, WORKBENCH_ROUTE, WB_AFTER_AUTH, "\n  if (process.env.WRITER_SOURCE_INTAKE !== '1') {\n    return NextResponse.json({ error: 'held' }, { status: 423 });\n  }\n"),
    },
    {
      name: 'the lift-safe gate is placed AFTER the multipart body was read and the row inserted (too late)',
      expect: 'RED',
      apply: (t) => insertBefore(insertAfter(t, WORKBENCH_ROUTE, WB_IMPORT_ANCHOR, WB_RELEASE_IMPORT), WORKBENCH_ROUTE, '  // Create the row first so we have an upload id', WB_GATE),
    },
    {
      name: 'a LOCAL function named writerReleaseAuthority stands in for the manifest (not imported from the release authority)',
      expect: 'RED',
      apply: (t) =>
        insertAfter(
          insertBefore(t, WORKBENCH_ROUTE, 'const MAX_BYTES = ', 'function writerReleaseAuthority() {\n  return { sourceIntakeReleased: true };\n}\n\n'),
          WORKBENCH_ROUTE,
          WB_AFTER_AUTH,
          "\n  if (writerReleaseAuthority().sourceIntakeReleased) {\n    return NextResponse.json({ error: 'held' }, { status: 423 });\n  }\n",
        ),
    },
    {
      name: 'the manifest is consulted but the branch only logs; nothing is refused',
      expect: 'RED',
      apply: (t) => wbGate(t, "\n  if (writerReleaseAuthority().sourceIntakeReleased) {\n    console.warn('[WorkbenchUpload] intake released');\n  }\n"),
    },
    {
      name: 'the lift-safe gate refuses with a 200 (a refusal that reports success)',
      expect: 'RED',
      apply: (t) => wbGate(t, "\n  if (writerReleaseAuthority().sourceIntakeReleased) return NextResponse.json({ error: 'held' }, { status: 200 });\n"),
    },
    {
      name: 'the gate exists only in a comment',
      expect: 'RED',
      apply: (t) => insertAfter(t, WORKBENCH_ROUTE, WB_AFTER_AUTH, '\n  // if (writerReleaseAuthority().sourceIntakeReleased) return NextResponse.json({}, { status: 423 });\n'),
    },
    {
      name: 'the encrypted envelope is called but the plaintext original is still written beside it',
      expect: 'RED',
      apply: (t) => insertAfter(t, WORKBENCH_ROUTE, WB_AFTER_AUTH, '  await recordArtifactArrival({ memberId: arrangerId });\n'),
    },
  ],
};

// =====================================================================================================
// 5. SF-03 -- the multipart inventory
// =====================================================================================================

const MULTIPART_ROUTE_FILE = /(?:^|\/)route\.(?:ts|tsx|js|mjs)$/;
const GATE_TOKENS = /\b(?:writerReleaseAuthority|sourceIntakeReleased|recordArtifactArrival|recordEncryptedArtifactArrival|beginEncryptedLanding)\b/;
const REVIEWED = '2026-11-03';

const R = (s) => new RegExp(s);
const MEMBER = R('\\bgetMemberIdFromRequest\\s*\\(');
const ANY_WRITE = R('\\b(?:writeFile|writeFileSync|writeVaultBytes|writeOriginal|storeFile|createWriteStream)\\s*\\(');

/**
 * The DECLARED inventory: every Next route handler that reads a multipart body, with a reviewed disposition.
 * Each entry is verified against the code every run (class facts, `must`, `mustNot`, ordering), so a
 * disposition can neither be softened (the code contradicts it) nor go stale silently (the code moved).
 *   HARD_HELD / RELEASE_GATED / ENVELOPE         protected in code (verified)
 *   PLAINTEXT_FOUNDER_ONLY                       writes uploaded bytes in plaintext; requireFounder is the only gate
 *   PLAINTEXT_MEMBER                             writes uploaded bytes in plaintext; reachable by a member (or anyone)
 *   OTHER_REVIEWED                               not a plaintext original-file store (transcribe-and-discard, OAuth
 *                                                form_post, offline-only package import, loopback-only review,
 *                                                a signature-verified payment webhook)
 * An entry flagged `noStore` claims that NOTHING is stored; that claim is checked against the broad storage
 * vocabulary (SQL, filesystem and vault writes, any storing verb), not a short list of write names, so a route
 * that later starts persisting through appendFile or a new saveRecording() helper loses its declared class.
 * The inventory covers every route that reads a request body as an UPLOAD: multipart (`request.formData()`),
 * multipart through a local helper, and a raw byte body (arrayBuffer, blob, body) that the route stores.
 * The class vocabulary has no "anonymous" class: a route open to anonymous callers is classed with the nearest
 * plaintext class and says so in `auth`.
 */
const INVENTORY = {
  'app/api/sovereign/manuscripts/ingest/route.ts': {
    cls: 'RELEASE_GATED', also: ['ENVELOPE'], auth: 'member + access matrix', reviewed: REVIEWED,
    note: 'held by the release manifest at module load; lands through recordArtifactArrival (encrypted)',
    must: [MEMBER, R('\\bderiveVerifiedAccess\\s*\\('), R('\\brecordArtifactArrival\\s*\\(')], mustNot: [],
  },
  'app/api/book-studio/workbench/uploads/route.ts': {
    cls: 'PLAINTEXT_FOUNDER_ONLY', auth: 'founder', reviewed: REVIEWED,
    note: 'plain fs.writeFile of original.<ext> plus plaintext text columns; requireFounder is the only gate',
    must: [R('\\brequireFounder\\s*\\('), R('\\bwriteOriginal\\s*\\(')], mustNot: [],
  },
  'app/api/sovereign/living-works/[id]/visual/route.ts': {
    cls: 'PLAINTEXT_MEMBER', auth: 'member + Work ownership', reviewed: REVIEWED,
    note: 'writes the uploaded image bytes to the shared vault in plaintext (mode 0600); no roster, rate limit or release gate',
    must: [MEMBER, R('\\bwriteVaultBytes\\s*\\('), R('\\bownedWork\\s*\\(')], mustNot: [R('\\brequireFounder\\b')],
  },
  'app/api/book-studio/import-docx/route.ts': {
    cls: 'PLAINTEXT_MEMBER', auth: 'none in the route; the access matrix prefix admits any authenticated member', reviewed: REVIEWED,
    note: 'writes the uploaded .docx to a temp directory in plaintext, converts with pandoc, removes it; no persistence beyond the request',
    must: [R('\\bwriteFileSync\\s*\\('), R('\\bexecFileSync\\s*\\(')], mustNot: [R('\\brequireFounder\\b'), MEMBER],
  },
  'app/api/bugs/route.ts': {
    cls: 'PLAINTEXT_MEMBER', auth: 'none or member (open to anyone by design)', reviewed: REVIEWED,
    note: 'stores pasted or attached screenshots through the bug service; not an original-manuscript door',
    must: [R('\\bprocessUploadedBugImages\\s*\\('), R('\\bcreateBugReport\\s*\\(')], mustNot: [R('\\brequireFounder\\b')],
  },
  'app/api/journal/quick/audio/route.ts': {
    cls: 'PLAINTEXT_MEMBER', auth: 'member + entitlement + storage consent', reviewed: REVIEWED,
    note: 'writes voice-journal audio to local storage in plaintext; gated by a deploy flag, tier and consent',
    must: [MEMBER, R('\\bwriteFile\\s*\\(')], mustNot: [R('\\brequireFounder\\b')],
  },
  'app/api/practitioner/materials/route.ts': {
    cls: 'PLAINTEXT_MEMBER', auth: 'member + practitioner profile', reviewed: REVIEWED,
    note: 'writes practitioner material files to the vault in plaintext',
    must: [R('\\bgetPractitionerIdForMember\\s*\\('), R('\\bwriteFile\\s*\\(')], mustNot: [R('\\brequireFounder\\b')],
  },
  'app/api/supervision/upload/route.ts': {
    cls: 'PLAINTEXT_MEMBER', auth: 'member', reviewed: REVIEWED,
    note: 'writes a supervision audio recording to local storage in plaintext, then queues transcription',
    must: [MEMBER, R('\\bwriteFile\\s*\\(')], mustNot: [R('\\brequireFounder\\b')],
  },
  'app/api/voice/transcribe/route.ts': {
    cls: 'PLAINTEXT_MEMBER', auth: 'member + deploy flag', reviewed: REVIEWED,
    note: 'writes the uploaded audio to an upload directory in plaintext, transcribes it locally, removes it after a delay',
    must: [MEMBER, R('\\bwriteFile\\s*\\(')], mustNot: [R('\\brequireFounder\\b')],
  },
  'app/api/media/projects/[projectId]/upload/route.ts': {
    cls: 'PLAINTEXT_MEMBER', auth: 'member (a development fallback identity exists)', reviewed: REVIEWED,
    note: 'stores the uploaded media file on the local filesystem in plaintext and queues processing',
    must: [MEMBER, R('\\bstoreFile\\s*\\(')], mustNot: [R('\\brequireFounder\\b')],
  },
  'app/api/studio/files/route.ts': {
    cls: 'PLAINTEXT_MEMBER', auth: 'member + practitioner profile', reviewed: REVIEWED,
    note: 'writes practitioner files to the vault in plaintext',
    must: [MEMBER, R('\\bgetPractitionerIdForMember\\s*\\('), R('\\bwriteFile\\s*\\(')], mustNot: [R('\\brequireFounder\\b')],
  },
  'app/api/studio/sessions/[sessionId]/voice-notes/route.ts': {
    cls: 'PLAINTEXT_MEMBER', auth: 'member + practitioner profile + deploy flag', reviewed: REVIEWED,
    note: 'writes voice-note audio to the vault in plaintext and transcribes it locally',
    must: [MEMBER, R('\\bwriteFile\\s*\\(')], mustNot: [R('\\brequireFounder\\b')],
  },
  'app/api/writers-studio/local-review/import/route.ts': {
    cls: 'OTHER_REVIEWED', auth: 'process capability + loopback host (no member)', reviewed: REVIEWED,
    note: 'founder-local review parser; custody none; verifyLocalReviewAuthority runs before the multipart read',
    must: [R('\\bverifyLocalReviewAuthority\\s*\\(')], mustNot: [R('\\brecordArtifactArrival\\b'), ANY_WRITE, MEMBER], noStore: true,
    before: [[R('\\bverifyLocalReviewAuthority\\s*\\('), FORM_RE]],
  },
  'app/api/voice/transcribe-simple/route.ts': {
    cls: 'OTHER_REVIEWED', auth: 'member + deploy flag', reviewed: REVIEWED,
    note: 'forwards the audio to the local transcriber and returns text; nothing is stored',
    must: [MEMBER, R('\\bfetch\\s*\\(')], mustNot: [ANY_WRITE, R('\\bquery\\s*\\('), R('\\bINSERT\\b')], noStore: true,
  },
  'app/api/caseload/transcribe/route.ts': {
    cls: 'OTHER_REVIEWED', auth: 'member', reviewed: REVIEWED,
    note: 'audio in, transcript out via the local transcriber; stated no storage and verified here',
    must: [MEMBER, R('\\bfetch\\s*\\(')], mustNot: [ANY_WRITE, R('\\bquery\\s*\\('), R('\\bINSERT\\b')], noStore: true,
  },
  'app/api/first-witness/transcribe/route.ts': {
    cls: 'OTHER_REVIEWED', auth: 'NONE (the witness is standalone)', reviewed: REVIEWED,
    note: 'unauthenticated transcribe-and-discard through the local transcriber; no persistence',
    must: [R('\\bfetch\\s*\\(')], mustNot: [MEMBER, R('\\brequireFounder\\b'), ANY_WRITE, R('\\bquery\\s*\\(')], noStore: true,
  },
  'app/api/supervision/transcript/stream/route.ts': {
    cls: 'OTHER_REVIEWED', auth: 'member', reviewed: REVIEWED,
    note: 'transcribes a supervision audio chunk locally and stores TEXT segments; the audio itself is not written to disk here',
    must: [MEMBER, R('\\baddTranscriptSegment\\s*\\(')], mustNot: [ANY_WRITE],
  },
  'app/api/auth/signin/apple/callback/route.ts': {
    cls: 'OTHER_REVIEWED', auth: 'public OAuth callback (state + id_token verification)', reviewed: REVIEWED,
    note: 'form_post sign-in fields only (code, id_token, state); no file is read',
    must: [R('\\bjwtVerify\\b'), R('\\bcreateSession\\s*\\(')], mustNot: [ANY_WRITE],
  },
  'app/api/media/projects/[projectId]/upload-chunk/route.ts': {
    cls: 'PLAINTEXT_MEMBER', auth: 'member (a development fallback identity exists); the practitioner id is a constant', reviewed: REVIEWED,
    note: 'raw-body chunked upload: each chunk is stored in plaintext in the media store, assembled, and recorded in media_assets; no roster, rate limit or release gate',
    must: [MEMBER, R('\\bstoreChunk\\s*\\('), R('\\bassembleChunks\\s*\\(')], mustNot: [R('\\brequireFounder\\b')],
  },
  'app/api/open/threshold/[token]/stream/[streamId]/route.ts': {
    cls: 'PLAINTEXT_MEMBER', auth: 'PUBLIC and token-scoped (verifyThresholdToken); no member session', reviewed: REVIEWED,
    note: 'PUT appends a raw media chunk of an evidence stream to a file in the vault in plaintext; a recording-evidence door, not a manuscript door, but an unauthenticated plaintext byte store',
    must: [R('\\bverifyThresholdToken\\s*\\('), R('\\bappendFile\\s*\\(')], mustNot: [MEMBER, R('\\brequireFounder\\b')],
  },
  'app/api/stripe/webhook/route.ts': {
    cls: 'OTHER_REVIEWED', auth: 'public webhook (Stripe signature verification)', reviewed: REVIEWED,
    note: 'reads the raw body only to verify the Stripe signature and parse a JSON event; stores payment and membership rows, never a file',
    must: [R('\\bconstructEvent\\s*\\('), R('\\bgetRawBody\\s*\\(')], mustNot: [ANY_WRITE, MEMBER],
  },
  'app/api/cabin/context/import/route.ts': {
    cls: 'OTHER_REVIEWED', auth: 'offline Cabin session', reviewed: REVIEWED,
    note: 'offline-mode only (404 otherwise); validates and places a bounded JSON context package, not an original file',
    must: [R('\\bMAIA_CABIN_MODE\\b'), R('\\bcabinMemberFromRequest\\s*\\('), R('\\bwriteCabinContextPackage\\b')], mustNot: [MEMBER],
  },
};

const RAW_NAMES_NOT_REQUESTS = new Set(['response', 'res', 'resp']);

/**
 * A route that takes the request body AS BYTES and stores it: a handler for a body-carrying method whose request
 * (a handler parameter, or the first parameter of a function in the same file) is read with arrayBuffer(), blob() or
 * body, in a file that also stores something. A raw PUT or a chunked POST is as much an upload door as a multipart
 * one, and `request.formData()` never appears in it.
 */
function rawBodyUpload(tree, rel) {
  const raw = tree.read(rel);
  if (raw === null || !/\.\s*(?:arrayBuffer|blob)\s*\(|\.\s*body\b/.test(raw)) return null;
  const f = sourceFacts(tree, rel);
  if (f.missing || !f.bl || (f.stripIssues && f.stripIssues.length > 0)) return null;
  if (!['POST', 'PUT', 'PATCH'].some((m) => exportKind(f.bl, m) !== 'no')) return null;
  const names = new Set();
  for (const m of ['POST', 'PUT', 'PATCH']) {
    const r = resolveHandler(f, m);
    if (r && r.H) for (const n of requestNames(r.H)) names.add(n);
  }
  if (names.size === 0) return null;
  // a same-file helper that is HANDED the request reads it under its own parameter name (`getRawBody(request)`)
  const handed = [...names];
  const helperDefs = [
    ...f.bl.matchAll(/\bfunction\s+([A-Za-z_$][\w$]*)\s*\(\s*([A-Za-z_$][\w$]*)/g),
    ...f.bl.matchAll(/\bconst\s+([A-Za-z_$][\w$]*)\s*=\s*(?:async\s*)?\(\s*([A-Za-z_$][\w$]*)/g),
  ];
  for (const [, fn, param] of helperDefs) {
    if (handed.some((h) => new RegExp(`\\b${esc(fn)}\\s*\\(\\s*(?:await\\s+)?${esc(h)}\\b`).test(f.bl))) names.add(param);
  }
  for (const n of RAW_NAMES_NOT_REQUESTS) names.delete(n);
  const read = firstMatch(f.bl, new RegExp(`\\b(?:${[...names].map(esc).join('|')})\\s*(?:\\.\\s*clone\\s*\\(\\s*\\)\\s*)?\\.\\s*(?:arrayBuffer|blob|body)\\b`));
  if (!read) return null;
  return plainEffect(f.bl, 0, f.bl.length) ? { rel, idx: read.index } : null;
}

/**
 * Files outside the route modules that read a multipart body (`x.formData()`), and the route modules that reach one
 * through their local imports (up to three hops). A route that delegates the parse to a helper has no `.formData(`
 * of its own and would otherwise be invisible to the inventory.
 */
function delegatedMultipart(tree, directRoutes) {
  const files = [...tree.list('app', { ext: ['.ts', '.tsx'] }), ...tree.list('lib', { ext: ['.ts', '.tsx'] })].filter((r) => !/\/__tests__\//.test(r) && !/\.test\.tsx?$/.test(r));
  const readers = new Set();
  for (const rel of files) {
    if (MULTIPART_ROUTE_FILE.test(rel)) continue;
    const raw = tree.read(rel);
    if (raw === null || !/formData/.test(raw)) continue;
    const f = sourceFacts(tree, rel);
    if (!f.missing && f.bl && (firstMatch(f.bl, FORM_RE) || firstMatch(f.code, /\[\s*['"]formData['"]\s*\]\s*\(/))) readers.add(rel);
  }
  const via = new Map();
  let frontier = [...readers];
  const reached = new Set(frontier);
  for (let hop = 0; hop < 3 && frontier.length > 0; hop++) {
    const next = [];
    for (const target of frontier) {
      const stem = path.posix.basename(target).replace(/\.[a-z]+$/, '');
      const needle = stem === 'index' ? path.posix.basename(path.posix.dirname(target)) : stem;
      for (const rel of files) {
        if (reached.has(rel) || directRoutes.has(rel)) continue;
        const raw = tree.read(rel);
        if (raw === null || !raw.includes(needle)) continue;
        if (!localImports(tree, rel).includes(target)) continue;
        reached.add(rel);
        if (MULTIPART_ROUTE_FILE.test(rel)) via.set(rel, target);
        else next.push(rel);
      }
    }
    frontier = next;
  }
  return via;
}

/** The route files under app/ that read a body as an upload (multipart, delegated multipart, raw bytes), sorted. */
function multipartRoutes(tree) {
  const files = tree.listNonEmpty('app', { ext: ['.ts', '.tsx', '.js', '.mjs'] }).filter((r) => MULTIPART_ROUTE_FILE.test(r));
  const found = [];
  const unreadable = [];
  const direct = new Set();
  for (const rel of files) {
    const code = tree.code(rel);
    if (code === null) continue;
    const issues = tree.codeIssues(rel);
    if (issues && issues.length > 0) {
      unreadable.push(`${rel}:${issues[0].line}`);
      continue;
    }
    if (!/formData/.test(code)) continue;
    const f = sourceFacts(tree, rel);
    // A literal scanner that lost its place blanks the rest of the file; a reader after that point would not be seen.
    if (f.literalIssues.length > 0) {
      unreadable.push(`${rel}:${f.literalIssues[0].line}`);
      continue;
    }
    const m = firstMatch(f.bl, FORM_RE) ?? firstMatch(f.code, /\[\s*['"]formData['"]\s*\]\s*\(/);
    if (m) { found.push({ rel, idx: m.index, how: 'multipart' }); direct.add(rel); }
  }
  for (const [rel, helper] of delegatedMultipart(tree, direct)) {
    const f = sourceFacts(tree, rel);
    if (f.missing || !f.bl) continue;
    found.push({ rel, idx: 0, how: 'delegated', helper });
    direct.add(rel);
  }
  for (const rel of files) {
    if (direct.has(rel)) continue;
    const r = rawBodyUpload(tree, rel);
    if (r) found.push({ ...r, how: 'raw-body' });
  }
  found.sort((x, y) => (x.rel < y.rel ? -1 : 1));
  return { scanned: files.length, found, unreadable };
}

function scopeOf(f, idx) {
  for (const name of ['POST', 'PUT', 'PATCH', 'DELETE', 'GET']) {
    const r = resolveHandler(f, name);
    const H = r && r.H;
    if (H && idx > H.open && idx < H.close) return H;
  }
  return { name: '(file)', start: 0, open: 0, close: f.bl.length, params: '' };
}

function verifyEntry(tree, rel, entry, idx) {
  const problems = [];
  const f = sourceFacts(tree, rel);
  const scope = scopeOf(f, idx);
  const cls = entry.cls;
  const firstForm = firstMatch(f.bl, FORM_RE, scope.open, scope.close)?.index ?? idx;
  const gate = scope.name === '(file)' ? null : creditedGate(tree, f, scope, releaseWorld(false), { before: firstForm }).gate;
  const hold = scope.name === '(file)' ? null : hardHold(f, scope);
  const envelope = firstMatch(f.bl, ENVELOPE_RE);
  const gated = Boolean(gate && gate.pos < firstForm);
  const held = Boolean(hold && hold.pos < firstForm);
  if (cls === 'RELEASE_GATED' && !gated) problems.push(`declared RELEASE_GATED but no refusing release-manifest gate precedes the multipart read`);
  if (cls === 'HARD_HELD' && !held) problems.push(`declared HARD_HELD but no unconditional 423 precedes the multipart read`);
  if ((entry.also ?? []).includes('ENVELOPE') && !envelope) problems.push(`declared ENVELOPE but no envelope entrypoint is called`);
  if (cls === 'ENVELOPE' && !envelope) problems.push(`declared ENVELOPE but no envelope entrypoint is called`);
  if (cls.startsWith('PLAINTEXT_')) {
    if (gated || held) problems.push(`declared ${cls} but the code now holds or gates it before the multipart read`);
    if (GATE_TOKENS.test(f.bl)) problems.push(`declared ${cls} but the file references the release manifest or the envelope`);
    if (cls === 'PLAINTEXT_FOUNDER_ONLY' && !/\brequireFounder\s*\(/.test(f.bl)) problems.push('declared PLAINTEXT_FOUNDER_ONLY but requireFounder is absent');
  }
  if (entry.noStore) {
    const st = firstEffect(f.bl, 0, f.bl.length);
    if (st) problems.push(`declared as storing nothing but the code now calls a storing function (line ${lineAt(f.bl, st.index)})`);
  }
  entry.must.forEach((re, i) => {
    if (!re.test(f.bl)) problems.push(`required fact #${i + 1} no longer holds in the code`);
  });
  entry.mustNot.forEach((re, i) => {
    if (re.test(f.bl)) problems.push(`excluded fact #${i + 1} is now present in the code`);
  });
  (entry.before ?? []).forEach(([a, b], i) => {
    const ma = firstMatch(f.bl, a, scope.open, scope.close);
    const mb = firstMatch(f.bl, b, scope.open, scope.close);
    if (!ma || !mb || ma.index >= mb.index) problems.push(`ordering fact #${i + 1} no longer holds (authority before the multipart read)`);
  });
  return problems;
}

function makeInventoryCheck(inventory) {
  return function checkInventory(tree) {
    const rep = report();
    let scan;
    try {
      scan = multipartRoutes(tree);
    } catch (e) {
      rep.unknown(`the route scan could not run (${e.name})`);
      return rep.done();
    }
    if (scan.unreadable.length > 0) rep.unknown(`${scan.unreadable.length} route file(s) could not be read to the end (an unclosed comment, string or template), first at ${scan.unreadable[0]}; a reader after that point would be invisible`);
    if (scan.found.length === 0) {
      rep.unknown(`0 multipart readers found among ${scan.scanned} route files: a scan that finds nothing proves nothing`);
      return rep.done();
    }
    const foundSet = new Map(scan.found.map((x) => [x.rel, x.idx]));
    const counts = {};
    const hows = { multipart: 0, delegated: 0, 'raw-body': 0 };
    for (const { rel, idx, how, helper } of scan.found) {
      hows[how] = (hows[how] ?? 0) + 1;
      const entry = inventory[rel];
      const f = sourceFacts(tree, rel);
      if (!entry) {
        if (how === 'delegated') rep.bad(`${rel} undeclared multipart reader (delegated: the multipart parse is in ${helper}): no reviewed disposition`);
        else if (how === 'raw-body') rep.bad(`${loc(f, idx)} undeclared raw-body upload (the request body is read as bytes and stored): no reviewed disposition`);
        else rep.bad(`${loc(f, idx)} undeclared multipart reader: no reviewed disposition`);
        continue;
      }
      counts[entry.cls] = (counts[entry.cls] ?? 0) + 1;
      const problems = verifyEntry(tree, rel, entry, idx);
      for (const p of problems) rep.bad(`${loc(f, idx)} ${p}`);
      if (entry.cls.startsWith('PLAINTEXT_')) rep.state(`${loc(f, idx)} ${entry.cls}: ${entry.cls === 'PLAINTEXT_FOUNDER_ONLY' ? 'founder-only plaintext writer' : 'plaintext writer with no Writer roster check'}`);
    }
    for (const rel of Object.keys(inventory)) {
      if (!foundSet.has(rel)) rep.bad(`${rel} is declared in the inventory but no longer reads a multipart body or an upload body (or no longer exists): review and update`);
    }
    const order = ['HARD_HELD', 'RELEASE_GATED', 'ENVELOPE', 'PLAINTEXT_FOUNDER_ONLY', 'PLAINTEXT_MEMBER', 'OTHER_REVIEWED'];
    rep.state(`classes: ${order.map((k) => `${k}=${counts[k] ?? 0}`).join(' ')}`);
    rep.ok(`${scan.scanned} route files scanned under app; ${scan.found.length} read a body as an upload (${hows.multipart} multipart, ${hows.delegated} delegated, ${hows['raw-body']} raw-body); ${Object.keys(inventory).length} declared`);
    // context: Express routes under app/api/_backend are not Next route handlers and are outside this inventory
    let express = 0;
    for (const rel of tree.list('app/api/_backend', { ext: ['.ts', '.js'] })) {
      if (/\/__tests__\//.test(rel) || /\.test\./.test(rel)) continue;
      const code = tree.code(rel) ?? '';
      if (/from\s*['"](?:busboy|formidable|multiparty|multer)['"]|require\(\s*['"](?:busboy|formidable|multiparty|multer)['"]\s*\)/.test(code)) express++;
    }
    rep.ctx(`${express} file(s) under app/api/_backend import a multipart parser; they are Express modules, not Next route handlers, and are outside this inventory`);
    return rep.done();
  };
}

const checkSf03 = makeInventoryCheck(INVENTORY);

const GHOST = 'app/api/sovereign/ghost-upload/route.ts';
const GHOST_BODY = (readExpr) => `import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const form = ${readExpr};
  const file = form.get('file');
  return NextResponse.json({ received: file instanceof File });
}
`;

const GHOST_REGEX_HELPER = `import { NextRequest, NextResponse } from 'next/server';

function safeName(n: string) {
  const h = \`inline; filename="\${n.replace(/"/g, '')}"\`;
  return h;
}

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const file = form.get('file');
  return NextResponse.json({ received: file instanceof File, header: safeName('x') });
}
`;
const HOLD_BYPASS_CONST = 'const PRESS_SOURCE_INTAKE_RELEASED = writerReleaseAuthority().sourceIntakeReleased;';
const HOLD_BYPASS_NAME = 'a file name that will never be tested: ';
const TRANSCRIBE_SIMPLE = 'app/api/voice/transcribe-simple/route.ts';
const withinPostOf = (t, rel, line) => t.edit(rel, (src) => src.replace(/(export async function POST\([^)]*\)[^{]*\{)/, `$1\n${line}`));

const SF03 = {
  id: 'SF-03',
  title: 'Every route handler that reads a multipart body is in the declared inventory with a reviewed disposition',
  law: 'every route handler that reads a request body as an upload (request.formData() or req.formData(), a multipart parse behind a local helper, or a raw byte body that it stores) is in the declared inventory with a reviewed disposition',
  obligations: ['WSI-41'],
  claims: ['C01', 'C02', 'C21'],
  kind: 'inventory',
  expectedToday: 'GREEN',
  whyExpected:
    'Nineteen Next route handlers under app/ read a multipart body and three more take the request body as raw bytes (a chunked media upload, a token-scoped evidence stream and a payment webhook); no route reaches a multipart parse through a local helper today. All twenty-two are declared with a reviewed class, and the declared class of each is verified against the code (gate, hold, envelope, plaintext writer, required and excluded facts, and for the routes declared to store nothing the whole storage vocabulary). The living-works visual route and every member-reachable plaintext writer are classed PLAINTEXT_MEMBER, not softened. The obligation mapping (WSI-41, parallel doors) is this module author\'s inference.',
  rulingPending: null,
  check: checkSf03,
  defeats: [
    {
      name: 'a NEW route file reads request.formData() with no declared disposition',
      kind: 'break',
      expect: 'RED',
      diesBecause: 'undeclared multipart reader',
      apply: (t) => t.add(GHOST, GHOST_BODY('await request.formData()')),
    },
    {
      name: 'SUBTLE: a new route reads multipart through bracket access, request[\'formData\']()',
      kind: 'break',
      expect: 'RED',
      diesBecause: 'undeclared multipart reader',
      apply: (t) => t.add(GHOST, GHOST_BODY("await request['formData']()")),
    },
    {
      name: 'SUBTLE: a new route reads multipart through a cloned request and an optional call split over lines',
      kind: 'break',
      expect: 'RED',
      diesBecause: 'undeclared multipart reader',
      apply: (t) => t.add(GHOST, GHOST_BODY('await request\n    .clone()\n    .formData?.()')),
    },
    {
      name: 'the ingest route loses its release-manifest hold (declared RELEASE_GATED is no longer true)',
      kind: 'break',
      expect: 'RED',
      diesBecause: 'declared RELEASE_GATED but no refusing release-manifest gate',
      apply: (t) =>
        t.edit(INGEST_ROUTE, (s) => {
          const c = cutIfBlock(s, INGEST_ROUTE, 'if (!PRESS_SOURCE_INTAKE_RELEASED)');
          return c.before + c.after;
        }),
    },
    {
      name: 'the workbench route gains the manifest hold (declared PLAINTEXT_FOUNDER_ONLY is now stale; the inventory must be re-reviewed)',
      kind: 'break',
      expect: 'RED',
      diesBecause: 'declared PLAINTEXT_FOUNDER_ONLY but',
      apply: (t) => SF02.defeats[0].apply(t),
    },
    {
      name: 'the loopback-only local-review route checks its process capability only AFTER reading the multipart body',
      kind: 'break',
      expect: 'RED',
      diesBecause: 'ordering fact #1 no longer holds',
      apply: (t) => {
        const rel = 'app/api/writers-studio/local-review/import/route.ts';
        const lines = "  const authority = verifyLocalReviewAuthority(request);\n  if (!authority.ok) return noStore({ error: authority.error }, authority.status);\n";
        const cut = swap(t, rel, lines, '');
        return insertAfter(cut, rel, "  const file = form.get('file');\n", lines);
      },
    },
    {
      name: 'a declared route is moved to a new path with the same content (stale entry plus undeclared reader)',
      kind: 'break',
      expect: 'RED',
      diesBecause: 'declared in the inventory but no longer reads a multipart body',
      apply: (t) => {
        const old = 'app/api/caseload/transcribe/route.ts';
        const body = t.read(old);
        return t.remove(old).add('app/api/caseload/transcribe-v2/route.ts', body);
      },
    },
    {
      name: 'SUBTLE: a new upload route whose filename sanitiser holds a regex with a quote inside a template substitution (the literal scanner used to lose its place and blank the reader)',
      kind: 'break',
      expect: 'RED',
      diesBecause: 'undeclared multipart reader',
      apply: (t) => t.add(GHOST, GHOST_REGEX_HELPER),
    },
    {
      name: 'SUBTLE: a new route delegates the multipart parse to a lib helper and stores the file (no .formData( in the route itself)',
      kind: 'break',
      expect: 'RED',
      diesBecause: 'delegated',
      apply: (t) =>
        t
          .add('lib/uploads/readUploadForm.ts', 'export async function readUploadForm(req: Request) {\n  return req.formData();\n}\n')
          .add(GHOST, "import { NextRequest, NextResponse } from 'next/server';\nimport { writeFile } from 'node:fs/promises';\nimport { readUploadForm } from '@/lib/uploads/readUploadForm';\n\nexport async function POST(request: NextRequest) {\n  const form = await readUploadForm(request);\n  const file = form.get('file');\n  if (file instanceof File) await writeFile('/tmp/original.bin', Buffer.from(await file.arrayBuffer()));\n  return NextResponse.json({ ok: true });\n}\n"),
    },
    {
      name: 'SUBTLE: a new PUT route takes the request body as raw bytes and writes them to disk (no multipart at all)',
      kind: 'break',
      expect: 'RED',
      diesBecause: 'undeclared raw-body upload',
      apply: (t) => t.add('app/api/sovereign/ghost-put/route.ts', "import { NextRequest, NextResponse } from 'next/server';\nimport { writeFile } from 'node:fs/promises';\n\nexport async function PUT(request: NextRequest) {\n  await writeFile('/tmp/upload.bin', Buffer.from(await request.arrayBuffer()));\n  return NextResponse.json({ ok: true });\n}\n"),
    },
    {
      name: 'the ingest hold constant is bound `|| process.env.X` (an environment variable can lift a manifest hold)',
      kind: 'break',
      expect: 'RED',
      diesBecause: 'declared RELEASE_GATED but no refusing release-manifest gate',
      apply: (t) => swap(t, INGEST_ROUTE, HOLD_BYPASS_CONST, 'const PRESS_SOURCE_INTAKE_RELEASED = writerReleaseAuthority().sourceIntakeReleased || process.env.WRITER_FORCE_INTAKE === "1";'),
    },
    {
      name: 'the ingest hold sits in an else-if behind a branch an environment variable can take',
      kind: 'break',
      expect: 'RED',
      diesBecause: 'declared RELEASE_GATED but no refusing release-manifest gate',
      apply: (t) => swap(t, INGEST_ROUTE, 'if (!PRESS_SOURCE_INTAKE_RELEASED) {', "if (process.env.WRITER_BYPASS === '1') {} else if (!PRESS_SOURCE_INTAKE_RELEASED) {"),
    },
    {
      name: 'the ingest hold carries a request-header conjunct',
      kind: 'break',
      expect: 'RED',
      diesBecause: 'declared RELEASE_GATED but no refusing release-manifest gate',
      apply: (t) => swap(t, INGEST_ROUTE, 'if (!PRESS_SOURCE_INTAKE_RELEASED) {', "if (!PRESS_SOURCE_INTAKE_RELEASED && request.headers.get('x-skip-hold') !== '1') {"),
    },
    {
      name: 'the audio route that is declared to store nothing starts appending to a log with appendFile (a verb the short list never named)',
      kind: 'break',
      expect: 'RED',
      diesBecause: 'declared as storing nothing',
      apply: (t) => withinPostOf(t, TRANSCRIBE_SIMPLE, "  await appendFile('/data/audio-log.bin', Buffer.from('x'));"),
    },
    {
      name: 'the audio route that is declared to store nothing starts calling a new saveRecording() helper',
      kind: 'break',
      expect: 'RED',
      diesBecause: 'declared as storing nothing',
      apply: (t) => withinPostOf(t, TRANSCRIBE_SIMPLE, "  await saveRecording('m', Buffer.from('x'));"),
    },
    {
      name: 'the ingest hold moves to AFTER the multipart read (declared RELEASE_GATED is no longer true: the body is read while intake is held)',
      kind: 'break',
      expect: 'RED',
      diesBecause: 'declared RELEASE_GATED but no refusing release-manifest gate',
      apply: (t) =>
        t.edit(INGEST_ROUTE, (src) => {
          const c = cutIfBlock(src, INGEST_ROUTE, HOLD_IF);
          const rest = c.before + c.after;
          const i = once(rest, FILE_ANCHOR, INGEST_ROUTE);
          return rest.slice(0, i) + c.block + '\n' + rest.slice(i);
        }),
    },
  ],
  decoys: [
    {
      name: 'a new route that only MENTIONS formData in a comment and a string, and builds an outbound FormData',
      expect: 'GREEN',
      apply: (t) =>
        t.add(
          'app/api/sovereign/ghost-note/route.ts',
          "// request.formData() is not read here\nexport async function POST() {\n  const out = new FormData();\n  out.set('note', 'we never call request.formData() in this handler');\n  return Response.json({ ok: true });\n}\n",
        ),
    },
    {
      name: 'a TEST file named route.test.ts that reads formData (tests are not route handlers)',
      expect: 'GREEN',
      apply: (t) => t.add('app/api/sovereign/ghost-test/route.test.ts', GHOST_BODY('await request.formData()')),
    },
    {
      name: 'a new route has the regex-with-a-quote helper but never reads a multipart body (the scanner must not invent a reader)',
      expect: 'GREEN',
      apply: (t) => t.add('app/api/sovereign/ghost-label/route.ts', GHOST_REGEX_HELPER.replace("  const form = await request.formData();\n  const file = form.get('file');\n  return NextResponse.json({ received: file instanceof File, header: safeName('x') });", "  return NextResponse.json({ header: safeName('x') });")),
    },
    {
      name: 'a new route imports a lib helper that does not read a request body (importing a helper is not reading multipart)',
      expect: 'GREEN',
      apply: (t) => t.add('lib/uploads/formatName.ts', 'export const formatName = (n: string) => n.trim();\n').add('app/api/sovereign/ghost-name/route.ts', "import { NextResponse } from 'next/server';\nimport { formatName } from '@/lib/uploads/formatName';\n\nexport async function GET() {\n  return NextResponse.json({ name: formatName(' x ') });\n}\n"),
    },
    {
      name: 'the ingest hold is moved into a same-file helper that returns the refusal (a hold behind a helper is still a hold)',
      expect: 'GREEN',
      apply: (t) =>
        insertBefore(
          swap(t, INGEST_ROUTE, 'if (!PRESS_SOURCE_INTAKE_RELEASED) {', 'const held = intakeHeldResponse();\n    if (held) return held;\n    if (false) {'),
          INGEST_ROUTE,
          'export async function POST(request: NextRequest) {',
          "function intakeHeldResponse(): NextResponse | null {\n  if (!PRESS_SOURCE_INTAKE_RELEASED) {\n    return NextResponse.json({ error: 'held' }, { status: 423 });\n  }\n  return null;\n}\n\n",
        ),
    },
  ],
};

// =====================================================================================================
// 6. SF-04 -- the ingest route enforces the declared Writer audience in code
// =====================================================================================================

const AUDIENCE_FNS = [
  ['writerStudioAdmissionForMember', /writersStudio\/admissionServer$/, 'allowed'],
  ['writerStudioPlanForMember', /writersStudio\/planAccessServer$/, 'pilotEligible'],
  ['writersStudioBetaAccess', /writersStudio\/betaAccessServer$/, 'eligible'],
];

/** A function (local or imported) the handler calls whose body calls an audience predicate: the check lives behind a helper. */
function helperCallingAudience(tree, f, H) {
  const seen = new Set();
  for (const m of allMatches(f.bl, /\b([A-Za-z_$][\w$]*)\s*\(/, H.open, H.close)) {
    const name = m[1];
    if (seen.has(name) || ['if', 'for', 'while', 'switch', 'catch', 'function', 'return', 'await', 'typeof'].includes(name)) continue;
    seen.add(name);
    const def = findDef(name, { tree, f });
    if (!def) continue;
    const body = def.kind === 'block' ? def.f.bl.slice(def.open, def.close) : def.f.bl.slice(def.from, def.to);
    for (const [fn, spec] of AUDIENCE_FNS) {
      const local = importedAs(def.f.code, fn, spec);
      if (local && new RegExp(`\\b${esc(local)}\\s*\\(`).test(body)) return name;
    }
  }
  return null;
}

function checkSf04(tree) {
  const rep = report();
  const f = need(tree, INGEST_ROUTE, rep);
  if (!f) return rep.done();
  const H = handlerOf(f, 'POST', rep);
  if (!H) return rep.done();
  const formPos = firstMatch(f.bl, FORM_RE, H.open, H.close)?.index ?? null;
  if (formPos === null) {
    rep.unknown(`${f.rel} POST has no multipart read to order the audience gate against`);
    return rep.done();
  }
  const readPos = Math.min(formPos, firstBodyRead(f, H) ?? formPos);

  // Context: how the page is gated, and why that gate does not reach this door.
  const proxy = sourceFacts(tree, 'proxy.ts');
  if (!proxy.missing) {
    const a = firstMatch(proxy.code, /\bisWriterStudioRestrictedPath\s*\(\s*pathname\s*\)/);
    const b = firstMatch(proxy.code, /\bwriterStudioAdmissionForMember\s*\(/);
    const mx = firstMatch(proxy.code, /api\/sovereign\/manuscripts\/ingest\$/);
    if (a && b) rep.ctx(`proxy.ts:${lineAt(proxy.code, b.index)} the Writer page and API corridor is admitted by writerStudioAdmissionForMember, applied where isWriterStudioRestrictedPath matches (line ${lineAt(proxy.code, a.index)})`);
    if (mx) rep.ctx(`proxy.ts:${lineAt(proxy.code, mx.index)} the proxy matcher excludes the ingest path, so that admission never runs for this door`);
  }
  const corridor = tree.code('lib/writersStudio/restrictedCorridor.ts');
  if (corridor !== null) rep.ctx(`lib/writersStudio/restrictedCorridor.ts ${/ingest/.test(corridor) ? 'names' : 'does not name'} the ingest path, so it is ${/ingest/.test(corridor) ? 'possibly' : 'not'} classified as a restricted Writer path`);

  // The law, as a world: the audience predicate DENIES (its allow field is false) and nothing else is known. A gate
  // counts only if it refuses in that world whatever every other input is -- so an inverted test, a conjunct on an
  // environment flag, a comparison on another field and a "refusal" that returns 200 all fail, and a check hidden
  // behind a helper (`const denied = await requireAudience(id); if (denied) return denied;`) is followed into it.
  for (const [fn, spec, field] of AUDIENCE_FNS) {
    const credit = creditedGate(tree, f, H, audienceWorld(fn, spec, field), { before: readPos });
    if (credit.gate) {
      rep.ok(`${loc(f, credit.gate.pos)} the ingest handler refuses a caller ${fn} does not admit, at line ${lineAt(f.bl, credit.gate.pos)}, before the multipart read at line ${lineAt(f.bl, formPos)}`);
      return rep.done();
    }
  }

  const calls = [];
  for (const [fn, spec] of AUDIENCE_FNS) {
    const local = importedAs(f.code, fn, spec);
    if (!local) continue;
    for (const m of allMatches(f.bl, new RegExp(`\\b${esc(local)}\\s*\\(`), H.open, H.close)) calls.push({ fn, local, pos: m.index });
  }
  const viaHelper = helperCallingAudience(tree, f, H);
  if (calls.length === 0 && !viaHelper) {
    rep.bad(`${loc(f, formPos)} the ingest handler never calls the Writer audience predicate (admission, plan or beta access) before or after reading the body`);
    rep.state(`${loc(f, H.open)} authentication is the only audience control on this door; roster membership is not consulted`);
    return rep.done();
  }
  const early = calls.filter((c) => c.pos < readPos);
  if (calls.length > 0 && early.length === 0) rep.bad(`${loc(f, calls[0].pos)} the audience predicate is called only AFTER the multipart read at line ${lineAt(f.bl, formPos)}`);
  else rep.bad(`${loc(f, early[0] ? early[0].pos : H.open)} the audience predicate is called${viaHelper && calls.length === 0 ? ' (behind a helper)' : ''} but its result never gates an unconditional refusal before the multipart read`);
  return rep.done();
}

const SF04_IMPORT = "import { writerStudioAdmissionForMember } from '@/lib/writersStudio/admissionServer';\n";
const SF04_BETA_IMPORT = "import { writersStudioBetaAccess } from '@/lib/writersStudio/betaAccessServer';\n";
const INGEST_IMPORT_ANCHOR = "import { writerReleaseAuthority } from '@/lib/writersStudio/releaseAuthority';\n";
const INGEST_IDEMPOTENCY_COMMENT = '    // Every released upload carries a caller-stable UUID.';
const SF04_ADMISSION = `    const admission = await writerStudioAdmissionForMember(memberId);
    if (!admission.allowed) {
      return NextResponse.json(
        { error: 'Forbidden', code: admission.code },
        { status: 403, headers: { 'Cache-Control': 'private, no-store' } },
      );
    }

`;
const SF04_BETA = `    const access = await writersStudioBetaAccess(memberId);
    if (!access.eligible) {
      return NextResponse.json({ refusal: 'not_in_beta_pilot' }, { status: 403, headers: { 'Cache-Control': 'private, no-store' } });
    }

`;

const SF04_AT_GATE = (body) => (t) => insertBefore(insertAfter(t, INGEST_ROUTE, INGEST_IMPORT_ANCHOR, SF04_IMPORT), INGEST_ROUTE, INGEST_IDEMPOTENCY_COMMENT, `    const admission = await writerStudioAdmissionForMember(memberId);\n${body}\n\n`);
const R403 = "return NextResponse.json({ error: 'Forbidden' }, { status: 403 });";

const SF04 = {
  id: 'SF-04',
  title: 'The ingest route enforces the declared Writer audience in code, not only at the page',
  law: 'the ingest route enforces the declared Writer audience in code, not only at the page',
  obligations: ['WSI-42', 'FILL-7a'],
  claims: ['C21'],
  kind: 'law',
  expectedToday: 'RED',
  whyExpected:
    'The Writer roster is enforced by proxy.ts (isWriterStudioRestrictedPath then writerStudioAdmissionForMember), not by page code; the ingest path is excluded from the proxy matcher and is not a restricted path, and the route itself authenticates a member but never calls the admission, plan or beta-access predicate.',
  rulingPending: 'D1',
  check: checkSf04,
  defeats: [
    {
      name: 'FIX: writerStudioAdmissionForMember gates the handler before the multipart read',
      kind: 'fix',
      expect: 'GREEN',
      apply: (t) => insertBefore(insertAfter(t, INGEST_ROUTE, INGEST_IMPORT_ANCHOR, SF04_IMPORT), INGEST_ROUTE, INGEST_IDEMPOTENCY_COMMENT, SF04_ADMISSION),
    },
    {
      name: 'FIX: writersStudioBetaAccess (the roster predicate the capabilities hook reads) gates the handler before the multipart read',
      kind: 'fix',
      expect: 'GREEN',
      apply: (t) => insertBefore(insertAfter(t, INGEST_ROUTE, INGEST_IMPORT_ANCHOR, SF04_BETA_IMPORT), INGEST_ROUTE, INGEST_IDEMPOTENCY_COMMENT, SF04_BETA),
    },
    {
      name: 'SUBTLE FIX: the admission call sits inside the if-condition (no named result), awaited and parenthesised',
      kind: 'fix',
      expect: 'GREEN',
      apply: (t) =>
        insertBefore(
          insertAfter(t, INGEST_ROUTE, INGEST_IMPORT_ANCHOR, SF04_IMPORT),
          INGEST_ROUTE,
          INGEST_IDEMPOTENCY_COMMENT,
          "    if (!(await writerStudioAdmissionForMember(memberId)).allowed) {\n      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });\n    }\n\n",
        ),
    },
    {
      name: 'SUBTLE FIX: the allowed flag is destructured under another name and the gate tests that name',
      kind: 'fix',
      expect: 'GREEN',
      apply: (t) => insertBefore(insertAfter(t, INGEST_ROUTE, INGEST_IMPORT_ANCHOR, SF04_IMPORT), INGEST_ROUTE, INGEST_IDEMPOTENCY_COMMENT, `    const { allowed: roster } = await writerStudioAdmissionForMember(memberId);\n    if (!roster) ${R403}\n\n`),
    },
    {
      name: 'SUBTLE FIX: the audience check lives in a same-file helper that returns the refusal, and the handler returns it',
      kind: 'fix',
      expect: 'GREEN',
      apply: (t) =>
        insertBefore(
          insertBefore(insertAfter(t, INGEST_ROUTE, INGEST_IMPORT_ANCHOR, SF04_IMPORT), INGEST_ROUTE, 'export async function POST(request: NextRequest) {', `async function audienceRefusal(id: string): Promise<NextResponse | null> {\n  const admission = await writerStudioAdmissionForMember(id);\n  if (!admission.allowed) ${R403}\n  return null;\n}\n\n`),
          INGEST_ROUTE,
          INGEST_IDEMPOTENCY_COMMENT,
          '    const denied = await audienceRefusal(memberId);\n    if (denied) return denied;\n\n',
        ),
    },
  ],
  decoys: [
    {
      name: 'the admission gate only runs when an environment variable asks for it (conditional enforcement is not enforcement)',
      expect: 'RED',
      apply: (t) =>
        insertBefore(
          insertAfter(t, INGEST_ROUTE, INGEST_IMPORT_ANCHOR, SF04_IMPORT),
          INGEST_ROUTE,
          INGEST_IDEMPOTENCY_COMMENT,
          `    if (process.env.WRITER_ROSTER_CHECK === '1') {\n${SF04_ADMISSION.split('\n').map((l) => (l ? `  ${l}` : l)).join('\n')}    }\n\n`,
        ),
    },
    {
      name: 'the admission gate is placed AFTER the multipart body was already read',
      expect: 'RED',
      apply: (t) => insertBefore(insertAfter(t, INGEST_ROUTE, INGEST_IMPORT_ANCHOR, SF04_IMPORT), INGEST_ROUTE, "    const file = form.get('file');", SF04_ADMISSION),
    },
    {
      name: 'the admission predicate is called but its result is thrown away',
      expect: 'RED',
      apply: (t) => insertBefore(insertAfter(t, INGEST_ROUTE, INGEST_IMPORT_ANCHOR, SF04_IMPORT), INGEST_ROUTE, INGEST_IDEMPOTENCY_COMMENT, '    await writerStudioAdmissionForMember(memberId);\n\n'),
    },
    {
      name: 'the path classifier is consulted instead of an admission decision (it classifies, it admits nobody)',
      expect: 'RED',
      apply: (t) =>
        insertBefore(
          insertAfter(t, INGEST_ROUTE, INGEST_IMPORT_ANCHOR, "import { isWriterStudioRestrictedPath } from '@/lib/writersStudio/restrictedCorridor';\n"),
          INGEST_ROUTE,
          INGEST_IDEMPOTENCY_COMMENT,
          "    if (!isWriterStudioRestrictedPath(INGEST_PATHNAME)) {\n      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });\n    }\n\n",
        ),
    },
    {
      name: 'the gate is written only in a comment',
      expect: 'RED',
      apply: (t) => insertBefore(t, INGEST_ROUTE, INGEST_IDEMPOTENCY_COMMENT, '    // const admission = await writerStudioAdmissionForMember(memberId); if (!admission.allowed) return 403;\n'),
    },
    {
      name: 'a local function with the same name as the admission predicate (not imported from the real module)',
      expect: 'RED',
      apply: (t) =>
        insertBefore(
          insertBefore(t, INGEST_ROUTE, 'const UUID_PATTERN = ', "async function writerStudioAdmissionForMember(_id: string) { return { allowed: true, code: 'ok' }; }\n"),
          INGEST_ROUTE,
          INGEST_IDEMPOTENCY_COMMENT,
          SF04_ADMISSION,
        ),
    },
    {
      name: 'the gate is inverted: it refuses the callers the predicate ADMITS',
      expect: 'RED',
      apply: SF04_AT_GATE(`    if (admission.allowed) ${R403}`),
    },
    {
      name: 'the gate carries an environment conjunct, so with the flag unset the door is open',
      expect: 'RED',
      apply: SF04_AT_GATE(`    if (!admission.allowed && process.env.WRITER_ROSTER_CHECK === '1') ${R403}`),
    },
    {
      name: 'the gate "refuses" with a 200',
      expect: 'RED',
      apply: SF04_AT_GATE("    if (!admission.allowed) return NextResponse.json({ error: 'Forbidden' }, { status: 200 });"),
    },
    {
      name: 'the gate compares a field that never decides admission',
      expect: 'RED',
      apply: SF04_AT_GATE(`    if (admission.code === 'never_happens') ${R403}`),
    },
    {
      name: 'the audience check lives in a helper whose refusal is conditional on an environment variable',
      expect: 'RED',
      diesBecause: 'the audience predicate is called (behind a helper)',
      apply: (t) =>
        insertBefore(
          insertBefore(insertAfter(t, INGEST_ROUTE, INGEST_IMPORT_ANCHOR, SF04_IMPORT), INGEST_ROUTE, 'export async function POST(request: NextRequest) {', `async function audienceRefusal(id: string): Promise<NextResponse | null> {\n  const admission = await writerStudioAdmissionForMember(id);\n  if (!admission.allowed && process.env.WRITER_ROSTER_CHECK === '1') ${R403}\n  return null;\n}\n\n`),
          INGEST_ROUTE,
          INGEST_IDEMPOTENCY_COMMENT,
          '    const denied = await audienceRefusal(memberId);\n    if (denied) return denied;\n\n',
        ),
    },
  ],
};

// =====================================================================================================
// 7. SF-05 -- empty extracted text is refused before any custody
// =====================================================================================================

/**
 * Names the handler assigns the parseUpload result to (`result = await parseUpload(...)`, also after a bare
 * `let result;`), and whether the text is destructured straight out of it (`const { text } = await parseUpload(...)`).
 */
function parsedBindings(bl, H) {
  const window = bl.slice(H.open, H.close);
  const names = new Set();
  for (const m of window.matchAll(/\b([A-Za-z_$][\w$]*)\s*=\s*(?:await\s+)?parseUpload\s*\(/g)) names.add(m[1]);
  const destructured = /\b(?:const|let)\s*\{[^}]*\}\s*=\s*(?:await\s+)?parseUpload\s*\(/.test(window);
  return { names, destructured };
}

function checkSf05(tree) {
  const rep = report();
  const f = need(tree, INGEST_ROUTE, rep);
  if (!f) return rep.done();
  const H = handlerOf(f, 'POST', rep);
  if (!H) return rep.done();
  const parse = firstMatch(f.bl, /\bparseUpload\s*\(/, H.open, H.close);
  const custody = firstMatch(f.bl, /\brecordArtifactArrival\s*\(/, H.open, H.close);
  if (!parse || !custody) {
    rep.unknown(`${f.rel} POST lacks ${!parse ? 'the parseUpload call' : 'the recordArtifactArrival call'} this law is ordered against`);
    return rep.done();
  }
  const { names, destructured } = parsedBindings(f.bl, H);
  if (names.size === 0 && !destructured) {
    rep.unknown(`${loc(f, parse.index)} the variable holding the parsed text could not be identified`);
    return rep.done();
  }
  // The law, as a world: parseUpload returned EMPTY text and nothing else is known. A gate counts only if it refuses
  // in that world whatever every other input is -- so an emptiness test joined to a format test or an environment
  // flag does not count, while any lawful spelling of "this text is empty" does (trim().length, a regex, a replace,
  // a destructured local, an alias).
  const over = new Map([...names].map((n) => [n, worldObj('PARSED', { text: '' })]));
  const world = parsedWorld();
  const between = topGates(f, H, parse.index, custody.index);
  const empty = between.find((g) => gateTruth(tree, f, g, world, over) === true && refusalOf(g) === 'refuse' && successBypassBefore(f, H, g.pos) < 0);
  const upper = between.find((g) => /\.\s*length\s*>/.test(g.cond));
  if (empty) {
    rep.ok(`${loc(f, empty.pos)} an emptiness test on the parsed text refuses before custody at line ${lineAt(f.bl, custody.index)}`);
  } else {
    rep.bad(`${loc(f, custody.index)} no emptiness test on the parsed text lies between parseUpload (line ${lineAt(f.bl, parse.index)}) and recordArtifactArrival`);
    if (upper) rep.state(`${loc(f, upper.pos)} only an upper-bound length check precedes custody; it does not refuse empty text`);
    const bytesEmpty = firstMatch(f.bl, /\.\s*size\s*===?\s*0\b/, H.open, parse.index);
    if (bytesEmpty) rep.state(`${loc(f, bytesEmpty.index)} the zero-byte check is on the file, which is not the extracted text`);
    // Where the refusal actually lives: after the ciphertext is written.
    const el = sourceFacts(tree, 'lib/manuscript/source/encryptedLanding.ts');
    if (!el.missing) {
      const commit = functionRange(el.bl, 'commitEncryptedArrival');
      const orch = functionRange(el.bl, 'recordEncryptedArtifactArrival');
      const refusal = commit ? firstMatch(el.bl, /\bsourceText\s*\.\s*length\s*===?\s*0\b/, commit.open, commit.close) : null;
      const write = orch ? firstMatch(el.bl, /\bwritePreparedCiphertext\s*\(/, orch.open, orch.close) : null;
      const commitCall = orch ? firstMatch(el.bl, /\bcommitEncryptedArrival\s*\(/, orch.open, orch.close) : null;
      if (refusal && write && commitCall && write.index < commitCall.index) {
        rep.state(`lib/manuscript/source/encryptedLanding.ts:${lineAt(el.bl, refusal.index)} the only empty-text refusal is inside commitEncryptedArrival, reached after writePreparedCiphertext at line ${lineAt(el.bl, write.index)}`);
      } else {
        rep.ctx('lib/manuscript/source/encryptedLanding.ts: could not confirm where the late empty-text refusal lives');
      }
    }
  }
  return rep.done();
}

const SF05_EMPTY_GATE = `    if (result.text.trim().length === 0) {
      return NextResponse.json({ error: 'No editable text was found in that file.' }, { status: 422 });
    }

`;
const MAX_TEXT_ANCHOR = '    if (result.text.length > MAX_TEXT_CHARS) {';

const SF05_BEFORE_MAX = (cond, status = 422) => (t) => insertBefore(t, INGEST_ROUTE, MAX_TEXT_ANCHOR, `    if (${cond}) {\n      return NextResponse.json({ error: 'No editable text was found in that file.' }, { status: ${status} });\n    }\n\n`);

const SF05 = {
  id: 'SF-05',
  title: 'Empty extracted text is refused before any ciphertext or intent is written',
  law: 'empty extracted text is refused before any ciphertext or intent is written',
  obligations: ['WSI-11', 'FILL-3b'],
  claims: ['C16'],
  kind: 'law',
  expectedToday: 'RED',
  whyExpected:
    'In the ingest route the only length check on the parsed text is an upper bound (MAX_TEXT_CHARS) and the only zero check is on the file bytes; parseUpload turns empty DOCX text into a warning, and the empty-text refusal lives in commitEncryptedArrival, which runs after the ciphertext has been written and verified.',
  rulingPending: null,
  check: checkSf05,
  defeats: [
    {
      name: 'FIX: result.text.trim().length === 0 refuses with a 422 before custody',
      kind: 'fix',
      expect: 'GREEN',
      apply: (t) => insertBefore(t, INGEST_ROUTE, MAX_TEXT_ANCHOR, SF05_EMPTY_GATE),
    },
    {
      name: 'SUBTLE FIX (alias): the text is copied to a local and tested with !extracted before custody',
      kind: 'fix',
      expect: 'GREEN',
      apply: (t) =>
        insertBefore(
          t,
          INGEST_ROUTE,
          MAX_TEXT_ANCHOR,
          "    const extracted = result.text;\n    if (!extracted) {\n      return NextResponse.json({ error: 'No editable text was found in that file.' }, { status: 422 });\n    }\n\n",
        ),
    },
    {
      name: 'SUBTLE FIX: the text is stripped of whitespace with a replace and the empty string is falsy',
      kind: 'fix',
      expect: 'GREEN',
      apply: SF05_BEFORE_MAX('!result.text.replace(/\\s/g, "")'),
    },
    {
      name: 'SUBTLE FIX: a regular expression tests for nothing but whitespace',
      kind: 'fix',
      expect: 'GREEN',
      apply: SF05_BEFORE_MAX('/^\\s*$/.test(result.text)'),
    },
    {
      name: 'SUBTLE FIX: the text is destructured out of the result and measured',
      kind: 'fix',
      expect: 'GREEN',
      apply: (t) => insertBefore(t, INGEST_ROUTE, MAX_TEXT_ANCHOR, "    const { text } = result;\n    if (text.length === 0) {\n      return NextResponse.json({ error: 'No editable text was found in that file.' }, { status: 422 });\n    }\n\n"),
    },
  ],
  decoys: [
    {
      name: 'the emptiness test covers only DOCX files (nested under a format condition)',
      expect: 'RED',
      apply: (t) =>
        insertBefore(t, INGEST_ROUTE, MAX_TEXT_ANCHOR, "    if (result.format === 'docx') {\n      if (result.text.trim().length === 0) {\n        return NextResponse.json({ error: 'No editable text was found in that file.' }, { status: 422 });\n      }\n    }\n\n"),
    },
    {
      name: 'the emptiness test is written only in a comment',
      expect: 'RED',
      apply: (t) => insertBefore(t, INGEST_ROUTE, MAX_TEXT_ANCHOR, '    // if (result.text.trim().length === 0) return NextResponse.json({}, { status: 422 });\n'),
    },
    {
      name: 'the emptiness test is placed AFTER recordArtifactArrival (the ciphertext is already written)',
      expect: 'RED',
      apply: (t) => insertBefore(t, INGEST_ROUTE, '    // Log marker: counts and provenance only, never content.', SF05_EMPTY_GATE),
    },
    {
      name: 'the emptiness test only logs; nothing is refused',
      expect: 'RED',
      apply: (t) => insertBefore(t, INGEST_ROUTE, MAX_TEXT_ANCHOR, "    if (result.text.trim().length === 0) {\n      console.warn('[press/manuscripts/ingest] empty text');\n    }\n\n"),
    },
    {
      name: 'the test is on the wrong value (the warnings list), not the extracted text',
      expect: 'RED',
      apply: (t) => insertBefore(t, INGEST_ROUTE, MAX_TEXT_ANCHOR, "    if (result.warnings.length === 0) {\n      return NextResponse.json({ error: 'No warnings' }, { status: 422 });\n    }\n\n"),
    },
    {
      name: 'the upper-bound check is rewritten as a different upper bound (a length check is not an emptiness check)',
      expect: 'RED',
      apply: (t) => swap(t, INGEST_ROUTE, MAX_TEXT_ANCHOR, '    if (result.text.length >= MAX_TEXT_CHARS) {'),
    },
    {
      name: 'the emptiness test is joined to a format test (empty PDFs and text files still reach custody)',
      expect: 'RED',
      apply: SF05_BEFORE_MAX("result.format === 'docx' && result.text.trim().length === 0"),
    },
    {
      name: 'the emptiness test is joined to an environment flag',
      expect: 'RED',
      apply: SF05_BEFORE_MAX("result.text.trim().length === 0 && process.env.REFUSE_EMPTY === '1'"),
    },
    {
      name: 'the emptiness test "refuses" with a 200',
      expect: 'RED',
      apply: SF05_BEFORE_MAX('result.text.trim().length === 0', 200),
    },
  ],
};

// =====================================================================================================
// 8. SF-06 -- gate order on the ingest route
// =====================================================================================================

function checkSf06(tree) {
  const rep = report();
  const f = need(tree, INGEST_ROUTE, rep);
  if (!f) return rep.done();
  const H = handlerOf(f, 'POST', rep);
  if (!H) return rep.done();
  // The hold is whatever DEFINITELY refuses while the manifest holds intake -- not whatever mentions the flag. A
  // conjunct on a header or an environment variable, a flag bound `|| process.env.X`, an else-if behind a bypass
  // branch, an earlier return that succeeds and an inverted polarity are all "not a hold".
  const credit = creditedGate(tree, f, H, releaseWorld(false));
  const hold = credit.gate;
  // The idempotency VALIDATION, not just the read of the header: the 400 for an absent or malformed key must come
  // after the hold (no oracle while held) and before the body. It is a gate that refuses when the key is absent.
  const keyDecls = declsOf(f).filter((d) => d.pos > H.open && d.pos < H.close && /\bheaders\s*\.\s*get\s*\(\s*SOURCE_UPLOAD_IDEMPOTENCY_HEADER\b/.test(f.bl.slice(d.rhsFrom, d.rhsTo)));
  const keyVar = keyDecls.length > 0 ? keyDecls[0].name : null;
  let validation = null;
  if (keyVar) {
    const over = new Map([[keyVar, null]]);
    validation = topGates(f, H).find((g) => new RegExp(`\\b${esc(keyVar)}\\b`).test(g.cond) && gateTruth(tree, f, g, null, over) === true && refusalOf(g) === 'refuse') ?? null;
  }
  const tokens = [
    ['authority (deriveVerifiedAccess)', firstMatch(f.bl, /\bderiveVerifiedAccess\s*\(/, H.open, H.close)?.index ?? null],
    ['identity (getMemberIdFromRequest)', firstMatch(f.bl, /\bgetMemberIdFromRequest\s*\(/, H.open, H.close)?.index ?? null],
    ['release hold (refusing manifest gate)', hold ? hold.pos : null],
    ['idempotency header read', firstMatch(f.bl, /\bheaders\s*\.\s*get\s*\(\s*SOURCE_UPLOAD_IDEMPOTENCY_HEADER\b/, H.open, H.close)?.index ?? null],
    ['idempotency validation (refusing gate)', validation ? validation.pos : null],
    ['first request-body read', firstBodyRead(f, H)],
    ['parse (parseUpload)', firstMatch(f.bl, /\bparseUpload\s*\(/, H.open, H.close)?.index ?? null],
    ['custody (recordArtifactArrival)', firstMatch(f.bl, /\brecordArtifactArrival\s*\(/, H.open, H.close)?.index ?? null],
  ];
  const missing = tokens.filter(([, p]) => p === null);
  for (const [name] of missing) {
    if (name.startsWith('release hold') && credit.why === 'bypassed') rep.bad(`${f.rel} has no ${name} inside POST: a gate exists but an earlier return can succeed around it`);
    else rep.bad(`${f.rel} has no ${name} inside POST, so the order cannot hold`);
  }
  if (missing.length > 0) return rep.done();
  let broken = false;
  for (let i = 1; i < tokens.length; i++) {
    if (!(tokens[i - 1][1] < tokens[i][1])) {
      broken = true;
      rep.bad(`${f.rel} order broken: ${tokens[i][0]} (line ${lineAt(f.bl, tokens[i][1])}) does not come after ${tokens[i - 1][0]} (line ${lineAt(f.bl, tokens[i - 1][1])})`);
    }
  }
  if (!broken) {
    rep.ok(`${f.rel} strict order holds: ${tokens.map(([n, p]) => `${n.split(' (')[0]} L${lineAt(f.bl, p)}`).join(' < ')}`);
  }
  return rep.done();
}

const HOLD_IF = 'if (!PRESS_SOURCE_INTAKE_RELEASED)';
const IDEM_CONST = '    const idempotencyKey = request.headers.get(SOURCE_UPLOAD_IDEMPOTENCY_HEADER);';
const IDEM_IF = 'if (!idempotencyKey || !UUID_PATTERN.test(idempotencyKey))';
const FILE_ANCHOR = "    const file = form.get('file');";

const SF06 = {
  id: 'SF-06',
  title: 'Gate order on the ingest route: auth, hold, idempotency header, formData, parse, custody',
  law: 'auth, then hold, then idempotency header, then formData, then parse, then custody',
  obligations: ['WSI-40', 'WSI-43'],
  claims: ['C15'],
  kind: 'law',
  expectedToday: 'GREEN',
  whyExpected:
    'Inside POST of the ingest route the first deriveVerifiedAccess, the first getMemberIdFromRequest, the refusing PRESS_SOURCE_INTAKE_RELEASED gate, the idempotency header read, request.formData(), parseUpload and recordArtifactArrival occur in exactly that source order; the hold constant is bound to writerReleaseAuthority().sourceIntakeReleased at module load.',
  rulingPending: null,
  check: checkSf06,
  defeats: [
    {
      name: 'SUBTLE: the hold constant is still defined at the top, a commented copy of the gate stays in place, but the real gate moves AFTER formData',
      kind: 'break',
      expect: 'RED',
      diesBecause: 'does not come after release hold',
      apply: (t) =>
        t.edit(INGEST_ROUTE, (s) => {
          const c = cutIfBlock(s, INGEST_ROUTE, HOLD_IF);
          const rest = c.before + '    // if (!PRESS_SOURCE_INTAKE_RELEASED) { return 423 }  (moved below)\n' + c.after;
          const i = once(rest, FILE_ANCHOR, INGEST_ROUTE);
          return rest.slice(0, i) + c.block + '\n' + rest.slice(i);
        }),
    },
    {
      name: 'the hold runs BEFORE authentication (the 423 becomes an oracle for unauthenticated callers)',
      kind: 'break',
      expect: 'RED',
      diesBecause: 'order broken: release hold',
      apply: (t) =>
        t.edit(INGEST_ROUTE, (s) => {
          const c = cutIfBlock(s, INGEST_ROUTE, HOLD_IF);
          const rest = c.before + c.after;
          const anchor = '    const rid = requestId();\n';
          const i = once(rest, anchor, INGEST_ROUTE);
          return rest.slice(0, i + anchor.length) + '\n' + c.block + rest.slice(i + anchor.length);
        }),
    },
    {
      name: 'the idempotency validation runs BEFORE the hold (the validation becomes an oracle while intake is held)',
      kind: 'break',
      expect: 'RED',
      diesBecause: 'order broken: idempotency header read',
      apply: (t) =>
        t.edit(INGEST_ROUTE, (s) => {
          const c = cutIfBlock(s, INGEST_ROUTE, IDEM_IF, IDEM_CONST);
          const rest = c.before + c.after;
          const i = once(rest, `    ${HOLD_IF}`.replace('    ', '    '), INGEST_ROUTE);
          return rest.slice(0, i) + c.block + '\n' + rest.slice(i);
        }),
    },
    {
      name: 'the idempotency header is validated only AFTER the multipart body was read',
      kind: 'break',
      expect: 'RED',
      diesBecause: 'order broken: first request-body read',
      apply: (t) =>
        t.edit(INGEST_ROUTE, (s) => {
          const c = cutIfBlock(s, INGEST_ROUTE, IDEM_IF, IDEM_CONST);
          const rest = c.before + c.after;
          const i = once(rest, FILE_ANCHOR, INGEST_ROUTE);
          return rest.slice(0, i) + c.block + '\n' + rest.slice(i);
        }),
    },
    {
      name: 'the hold is wrapped so that it only runs in production (a conditional hold is not a hold)',
      kind: 'break',
      expect: 'RED',
      diesBecause: 'has no release hold (refusing manifest gate)',
      apply: (t) =>
        t.edit(INGEST_ROUTE, (s) => {
          const c = cutIfBlock(s, INGEST_ROUTE, HOLD_IF);
          const wrapped = `    if (process.env.NODE_ENV === 'production') {\n${c.block.split('\n').map((l) => (l ? `  ${l}` : l)).join('\n')}    }\n`;
          return c.before + wrapped + c.after;
        }),
    },
    {
      name: 'the hold stays in place but only logs; the request proceeds',
      kind: 'break',
      expect: 'RED',
      diesBecause: 'has no release hold (refusing manifest gate)',
      apply: (t) =>
        t.edit(INGEST_ROUTE, (s) => {
          const c = cutIfBlock(s, INGEST_ROUTE, HOLD_IF);
          return c.before + "    if (!PRESS_SOURCE_INTAKE_RELEASED) {\n      console.warn('[press/manuscripts/ingest] intake not released');\n    }\n" + c.after;
        }),
    },
    {
      name: 'the hold has inverted polarity (refuses once intake is released)',
      kind: 'break',
      expect: 'RED',
      diesBecause: 'has no release hold (refusing manifest gate)',
      apply: (t) => swap(t, INGEST_ROUTE, HOLD_IF, 'if (PRESS_SOURCE_INTAKE_RELEASED)'),
    },
    {
      name: 'the hold carries a request-header conjunct, so a caller who sends the header skips it',
      kind: 'break',
      expect: 'RED',
      diesBecause: 'has no release hold (refusing manifest gate)',
      apply: (t) => swap(t, INGEST_ROUTE, HOLD_IF, "if (!PRESS_SOURCE_INTAKE_RELEASED && request.headers.get('x-skip-hold') !== '1')"),
    },
    {
      name: 'the hold constant is bound `|| process.env.X`, so an environment variable can lift the manifest hold',
      kind: 'break',
      expect: 'RED',
      diesBecause: 'has no release hold (refusing manifest gate)',
      apply: (t) => swap(t, INGEST_ROUTE, 'const PRESS_SOURCE_INTAKE_RELEASED = writerReleaseAuthority().sourceIntakeReleased;', 'const PRESS_SOURCE_INTAKE_RELEASED = writerReleaseAuthority().sourceIntakeReleased || process.env.WRITER_FORCE_INTAKE === "1";'),
    },
    {
      name: 'SUBTLE: the hold is the else-if of a branch an environment variable can take (an else-if sits outside the earlier if braces)',
      kind: 'break',
      expect: 'RED',
      diesBecause: 'has no release hold (refusing manifest gate)',
      apply: (t) => swap(t, INGEST_ROUTE, HOLD_IF, "if (process.env.WRITER_BYPASS === '1') {} else if (!PRESS_SOURCE_INTAKE_RELEASED)"),
    },
    {
      name: 'SUBTLE: the hold is the braceless body of another if',
      kind: 'break',
      expect: 'RED',
      diesBecause: 'has no release hold (refusing manifest gate)',
      apply: (t) => swap(t, INGEST_ROUTE, HOLD_IF, 'if (process.env.X) if (!PRESS_SOURCE_INTAKE_RELEASED)'),
    },
    {
      name: 'an earlier return that succeeds can skip the hold',
      kind: 'break',
      expect: 'RED',
      diesBecause: 'an earlier return can succeed around it',
      apply: (t) => insertBefore(t, INGEST_ROUTE, `    ${HOLD_IF}`, "    if (process.env.WRITER_BYPASS === '1') return NextResponse.json({ ok: true });\n"),
    },
    {
      name: 'the 400 for a missing or malformed retry identifier moves AFTER the multipart read (the read of the header stays where it was)',
      kind: 'break',
      expect: 'RED',
      diesBecause: 'order broken: first request-body read',
      apply: (t) =>
        t.edit(INGEST_ROUTE, (s) => {
          const c = cutIfBlock(s, INGEST_ROUTE, IDEM_IF, IDEM_IF);
          const rest = c.before + c.after;
          const i = once(rest, FILE_ANCHOR, INGEST_ROUTE);
          return rest.slice(0, i) + c.block + '\n' + rest.slice(i);
        }),
    },
    {
      name: 'the request body is pulled into memory with request.clone().arrayBuffer() BEFORE the hold (only formData counted as a body read)',
      kind: 'break',
      expect: 'RED',
      diesBecause: 'order broken: first request-body read',
      apply: (t) => insertBefore(t, INGEST_ROUTE, `    ${HOLD_IF}`, '    const early = Buffer.from(await request.clone().arrayBuffer());\n    void early;\n'),
    },
    {
      name: 'an earlier return that succeeds with an explicit 202 can skip the hold',
      kind: 'break',
      expect: 'RED',
      diesBecause: 'an earlier return can succeed around it',
      apply: (t) => insertBefore(t, INGEST_ROUTE, `    ${HOLD_IF}`, "    if (process.env.WRITER_BYPASS === '1') return NextResponse.json({ ok: true }, { status: 202 });\n"),
    },
    {
      name: 'the retry-identifier validation only LOGS (it no longer refuses a missing or malformed identifier)',
      kind: 'break',
      expect: 'RED',
      diesBecause: 'has no idempotency validation (refusing gate)',
      apply: (t) => swap(t, INGEST_ROUTE, IDEM_IF + ' {', IDEM_IF + " { console.warn('no retry id'); }\n    if (false) {"),
    },
  ],
  decoys: [
    {
      name: 'the hold constant is renamed everywhere (detection follows the data flow, not a name)',
      expect: 'GREEN',
      apply: (t) => t.replace(INGEST_ROUTE, 'PRESS_SOURCE_INTAKE_RELEASED', 'SOURCE_HOLD_CLEARED'),
    },
    {
      name: 'the gate reads the manifest inline instead of through the module constant',
      expect: 'GREEN',
      apply: (t) => swap(t, INGEST_ROUTE, HOLD_IF, 'if (!writerReleaseAuthority().sourceIntakeReleased)'),
    },
    {
      name: 'comments and strings mention formData and parseUpload before the hold',
      expect: 'GREEN',
      apply: (t) => insertBefore(t, INGEST_ROUTE, `    ${HOLD_IF}`, "    console.log('later: request.formData() then parseUpload() then recordArtifactArrival()');\n    // await request.formData(); await parseUpload(); await recordArtifactArrival();\n"),
    },
    {
      name: 'the hold lives in a same-file helper that returns the refusal, and the handler returns it (a hold behind a helper is still a hold)',
      expect: 'GREEN',
      apply: (t) =>
        insertBefore(
          swap(t, INGEST_ROUTE, HOLD_IF, 'const held = intakeHeldResponse();\n    if (held) return held;\n    if (false)'),
          INGEST_ROUTE,
          'export async function POST(request: NextRequest) {',
          "function intakeHeldResponse(): NextResponse | null {\n  if (!PRESS_SOURCE_INTAKE_RELEASED) {\n    return NextResponse.json({ error: 'held' }, { status: 423 });\n  }\n  return null;\n}\n\n",
        ),
    },
    {
      name: 'the gate reads the manifest flag through a destructured local',
      expect: 'GREEN',
      apply: (t) => swap(swap(t, INGEST_ROUTE, HOLD_IF, 'if (!intakeOpen)'), INGEST_ROUTE, 'const PRESS_SOURCE_INTAKE_RELEASED = writerReleaseAuthority().sourceIntakeReleased;', 'const PRESS_SOURCE_INTAKE_RELEASED = writerReleaseAuthority().sourceIntakeReleased;\nconst { sourceIntakeReleased: intakeOpen } = writerReleaseAuthority();'),
    },
  ],
};

// =====================================================================================================
// 9. SF-07 -- export and erasure certification are independent of sourceIntakeReleased
// =====================================================================================================

function literalField(lit, name) {
  const m = new RegExp(`\\b${esc(name)}\\s*:\\s*([^,}\\n]+)`).exec(lit);
  return m ? m[1].trim() : null;
}

/** The `{ ... }` of `const NAME ... = Object.freeze({ ... })` in a file, or null. */
function frozenLiteral(f, constName) {
  const m = new RegExp(`\\bconst\\s+${esc(constName)}\\b[^=]*=\\s*Object\\s*\\.\\s*freeze\\s*\\(\\s*\\{`).exec(f.bl);
  if (!m) return null;
  const open = f.bl.indexOf('{', m.index + m[0].length - 1);
  const close = matchClose(f.bl, open);
  return close < 0 ? null : { open, close, text: f.bl.slice(open, close + 1) };
}

function authorityLiteral(f) {
  return frozenLiteral(f, 'AUTHORITY');
}

/** Every `key: value` pair of the exportsCertified object in a manifest-shaped literal (ALL formats, not only the two known today). */
function exportsPairs(text) {
  const exp = /\bexportsCertified\s*:\s*(?:Object\s*\.\s*freeze\s*\(\s*)?\{([^}]*)\}/.exec(text);
  if (!exp) return null;
  return exp[1].split(',').map((x) => x.trim()).filter(Boolean).map((x) => {
    const m = /^([A-Za-z_$][\w$]*)\s*:\s*([\s\S]+)$/.exec(x);
    return m ? [m[1], m[2].trim()] : [x, null];
  });
}

const CERT_TOKEN = /\b(?:exportsCertified|writerExportCertified|permanentErasureCertified|isMemberBookExportReleased)\b/;
const INTAKE_TOKEN = /\bsourceIntakeReleased\b|\bPRESS_SOURCE_INTAKE_RELEASED\b|\bfileIntakeAvailable\b/;

/** The directories (and root files) a certification reader can live in. */
const CERT_SCAN = { dirs: ['app', 'lib', 'components', 'hooks', 'config', 'src', 'packages', 'apps', 'types'], files: ['proxy.ts', 'middleware.ts'] };

/** Non-test files that READ an export or erasure certification. */
function certificationReaders(tree) {
  const skip = new Set([RELEASE_AUTHORITY, 'lib/writersStudio/useWriterReleaseCapabilities.ts']);
  const out = [];
  const consider = (rel) => {
    if (skip.has(rel) || /\/__tests__\//.test(rel) || /\.test\.tsx?$/.test(rel)) return;
    const raw = tree.read(rel);
    if (raw === null || !CERT_TOKEN.test(raw)) return;
    const code = tree.code(rel);
    if (code && CERT_TOKEN.test(code)) out.push(rel);
  };
  for (const dir of CERT_SCAN.dirs) for (const rel of tree.list(dir, { ext: ['.ts', '.tsx'] })) consider(rel);
  for (const rel of CERT_SCAN.files) if (tree.isFile(rel)) consider(rel);
  return out.sort();
}

/** [{ name, from, to }] for each function declaration and const-arrow of a file. */
function functionBodies(f) {
  const out = [];
  const names = new Set();
  for (const m of f.bl.matchAll(/\bfunction\s*\*?\s*([A-Za-z_$][\w$]*)\s*[(<]/g)) names.add(m[1]);
  for (const m of f.bl.matchAll(/\bconst\s+([A-Za-z_$][\w$]*)\s*(?::[^=]+?)?=\s*(?:async\s*)?(?:\([^)]*\)|[\w$]+)\s*(?::[^=]+?)?=>/g)) names.add(m[1]);
  for (const name of names) {
    const d = defRange(f, name);
    if (d) out.push(d.kind === 'block' ? { name, from: d.open, to: d.close } : { name, from: d.from, to: d.to });
  }
  return out;
}

function checkSf07(tree) {
  const rep = report();
  const f = need(tree, RELEASE_AUTHORITY, rep);
  if (!f) return rep.done();
  const lit = authorityLiteral(f);
  if (!lit) {
    rep.unknown(`${f.rel} has no recognisable AUTHORITY object literal`);
    return rep.done();
  }
  const text = lit.text;
  const intake = literalField(text, 'sourceIntakeReleased');
  const erasure = literalField(text, 'permanentErasureCertified');
  const pairs = exportsPairs(text);
  const base = lineAt(f.bl, lit.open);
  rep.state(`${f.rel}:${base} sourceIntakeReleased is ${intake === 'true' || intake === 'false' ? intake : 'not a literal boolean'} (current state, not a law)`);
  const judge = (where, n, v) => {
    if (v === 'false') rep.ok(`${where} ${n} is the literal false`);
    else if (v === 'true') rep.bad(`${where} ${n} is true while the independent certification has not been requalified`);
    else rep.bad(`${where} ${n} is ${v === null ? 'absent' : 'not a literal boolean'}, so independence from sourceIntakeReleased cannot be shown`);
  };
  // EVERY export format in the manifest must be a literal false, not only the two known today: a third format set to
  // true is a certification that follows nothing, and is exactly what the two-name check could not see.
  for (const k of ['pdf', 'epub']) if (!pairs || !pairs.some(([kk]) => kk === k)) judge(f.rel, `exportsCertified.${k}`, null);
  for (const [k, v] of pairs ?? []) judge(f.rel, `exportsCertified.${k}`, v);
  judge(f.rel, 'permanentErasureCertified', erasure);

  // The manifest module's own functions: a function that reads a certification must not also read the intake flag.
  for (const fn of functionBodies(f)) {
    const body = f.bl.slice(fn.from, fn.to);
    if (CERT_TOKEN.test(body) && INTAKE_TOKEN.test(body)) rep.bad(`${f.rel}:${lineAt(f.bl, fn.from)} a function that reads an export or erasure certification also references sourceIntakeReleased`);
  }

  // The client fallback the capability hook shows before the server answers: it must hold every certification false.
  const hook = sourceFacts(tree, 'lib/writersStudio/useWriterReleaseCapabilities.ts');
  if (hook.missing) rep.unknown('lib/writersStudio/useWriterReleaseCapabilities.ts is missing, so the client fallback cannot be inspected');
  else {
    const held = frozenLiteral(hook, 'HELD');
    if (!held) rep.unknown(`${hook.rel} has no recognisable HELD fallback literal`);
    else {
      const hp = exportsPairs(held.text);
      for (const [k, v] of hp ?? []) judge(`${hook.rel} fallback HELD`, `exportsCertified.${k}`, v);
      if (!hp) rep.bad(`${hook.rel} fallback HELD has no exportsCertified object, so independence cannot be shown`);
      judge(`${hook.rel} fallback HELD`, 'permanentErasureCertified', literalField(held.text, 'permanentErasureCertified'));
    }
  }

  // The certification readers: the server render route is required; the rest are discovered.
  const render = sourceFacts(tree, RENDER_ROUTE);
  if (render.missing) rep.unknown(`${RENDER_ROUTE} is missing, so the export gate cannot be inspected`);
  const readers = certificationReaders(tree);
  if (!readers.includes(RENDER_ROUTE) && !render.missing) rep.bad(`${RENDER_ROUTE} no longer reads an export certification`);
  if (readers.length === 0) rep.unknown('no file reading an export or erasure certification was found');
  let coupled = 0;
  for (const rel of readers) {
    const rf = sourceFacts(tree, rel);
    if (rf.missing || !rf.bl) continue;
    const hit = firstMatch(rf.bl, INTAKE_TOKEN);
    if (hit) {
      coupled++;
      rep.bad(`${rel}:${lineAt(rf.bl, hit.index)} a file that reads an export or erasure certification also references sourceIntakeReleased`);
    }
    // a hard-off function must stay hard-off
    if (rel === EXPORT_RELEASE) {
      const fn = functionRange(rf.bl, 'isMemberBookExportReleased');
      const body = fn ? rf.bl.slice(fn.open + 1, fn.close).trim() : null;
      if (body === 'return false;' && fn.params.trim() === '') rep.ok(`${rel}:${lineAt(rf.bl, fn.open)} isMemberBookExportReleased takes no input and returns the literal false`);
      else rep.bad(`${rel} isMemberBookExportReleased is not a parameterless function returning the literal false`);
    }
  }
  if (!render.missing && readers.length > 0 && coupled === 0) rep.ok(`${readers.length} file(s) read an export or erasure certification; none references sourceIntakeReleased`);
  for (const rel of readers) rep.state(`${rel} reads an export or erasure certification`);
  if (!render.missing) {
    const rH = functionRange(render.bl, 'POST');
    if (rH) {
      const a = firstMatch(render.bl, /!\s*isMemberBookExportReleased\s*\(\s*\)/, rH.open, rH.close);
      const b = firstMatch(render.bl, /\bexportsCertified\s*\[\s*format\s*\]\s*!==\s*true/, rH.open, rH.close);
      if (a && b) rep.ok(`${RENDER_ROUTE} POST refuses on both the hard-off release function (line ${lineAt(render.bl, a.index)}) and the manifest certification (line ${lineAt(render.bl, b.index)})`);
      else rep.bad(`${RENDER_ROUTE} POST no longer refuses on both isMemberBookExportReleased and exportsCertified`);
    } else {
      rep.unknown(`${RENDER_ROUTE} has no recognisable POST handler`);
    }
  }
  rep.ctx(`${EXPORT_RELEASE_CITED} ${tree.isFile(EXPORT_RELEASE_CITED) ? 'exists' : 'does not exist at this commit; the module is at ' + EXPORT_RELEASE}`);
  return rep.done();
}

const SF07 = {
  id: 'SF-07',
  title: 'Export certification and erasure certification are independent of sourceIntakeReleased',
  law: 'export certification and erasure certification are independent of sourceIntakeReleased',
  obligations: ['WSI-43'],
  claims: ['C10'],
  kind: 'law',
  expectedToday: 'GREEN',
  whyExpected:
    'AUTHORITY in lib/writersStudio/releaseAuthority.ts holds exportsCertified pdf and epub and permanentErasureCertified as three separate literal falses; the render route refuses on isMemberBookExportReleased (a parameterless function returning false) and on exportsCertified[format]; no file that reads an export or erasure certification references sourceIntakeReleased. The brief names lib/writersStudio/memberBookExportRelease.ts, which does not exist; the module is lib/manuscript/render/memberBookExportRelease.ts and is checked there.',
  rulingPending: null,
  check: checkSf07,
  defeats: [
    {
      name: 'the PDF certification flips to true in the manifest',
      kind: 'break',
      expect: 'RED',
      diesBecause: 'exportsCertified.pdf is true',
      apply: (t) => swap(t, RELEASE_AUTHORITY, 'Object.freeze({ pdf: false, epub: false })', 'Object.freeze({ pdf: true, epub: false })'),
    },
    {
      name: 'permanent erasure is certified in the manifest',
      kind: 'break',
      expect: 'RED',
      diesBecause: 'permanentErasureCertified is true',
      apply: (t) => swap(t, RELEASE_AUTHORITY, '  permanentErasureCertified: false,\n});', '  permanentErasureCertified: true,\n});'),
    },
    {
      name: 'the render route opens exports whenever Source intake is released (coupled gate)',
      kind: 'break',
      expect: 'RED',
      diesBecause: 'also references sourceIntakeReleased',
      apply: (t) => swap(t, RENDER_ROUTE, 'if (release.exportsCertified[format] !== true) {', 'if (release.exportsCertified[format] !== true && !release.sourceIntakeReleased) {'),
    },
    {
      name: 'SUBTLE: the manifest derives all three certifications from one shared constant that happens to be false today',
      kind: 'break',
      expect: 'RED',
      diesBecause: 'not a literal boolean',
      apply: (t) => {
        const a = swap(t, RELEASE_AUTHORITY, 'const AUTHORITY: WriterReleaseAuthority = Object.freeze({', 'const INTAKE_OPEN = false;\nconst AUTHORITY: WriterReleaseAuthority = Object.freeze({');
        const b = swap(a, RELEASE_AUTHORITY, '  sourceIntakeReleased: false,', '  sourceIntakeReleased: INTAKE_OPEN,');
        return swap(b, RELEASE_AUTHORITY, 'Object.freeze({ pdf: false, epub: false })', 'Object.freeze({ pdf: INTAKE_OPEN, epub: INTAKE_OPEN })');
      },
    },
    {
      name: 'the hard-off export function starts reading the intake flag',
      kind: 'break',
      expect: 'RED',
      diesBecause: 'isMemberBookExportReleased is not a parameterless function returning the literal false',
      apply: (t) =>
        t.edit(EXPORT_RELEASE, (s) => {
          const i = once(s, 'return false;', EXPORT_RELEASE);
          return `import { writerReleaseAuthority } from '@/lib/writersStudio/releaseAuthority';\n${s.slice(0, i)}return writerReleaseAuthority().sourceIntakeReleased;${s.slice(i + 'return false;'.length)}`;
        }),
    },
    {
      name: 'the client fallback HELD certifies PDF and EPUB exports (the hook shows a certification the server never gave)',
      kind: 'break',
      expect: 'RED',
      diesBecause: 'fallback HELD exportsCertified.pdf is true',
      apply: (t) => swap(t, 'lib/writersStudio/useWriterReleaseCapabilities.ts', 'exportsCertified: Object.freeze({ pdf: false, epub: false }),', 'exportsCertified: Object.freeze({ pdf: true, epub: true }),'),
    },
    {
      name: 'the client fallback HELD certifies permanent erasure',
      kind: 'break',
      expect: 'RED',
      diesBecause: 'fallback HELD permanentErasureCertified is true',
      apply: (t) => swap(t, 'lib/writersStudio/useWriterReleaseCapabilities.ts', '  permanentErasureCertified: false,\n});', '  permanentErasureCertified: true,\n});'),
    },
    {
      name: 'a third export format is added to the manifest already certified',
      kind: 'break',
      expect: 'RED',
      diesBecause: 'exportsCertified.docx is true',
      apply: (t) => swap(t, RELEASE_AUTHORITY, 'Object.freeze({ pdf: false, epub: false })', 'Object.freeze({ pdf: false, epub: false, docx: true })'),
    },
    {
      name: 'the manifest own writerExportCertified() also requires sourceIntakeReleased (coupling inside the manifest module)',
      kind: 'break',
      expect: 'RED',
      diesBecause: 'a function that reads an export or erasure certification also references sourceIntakeReleased',
      apply: (t) => swap(t, RELEASE_AUTHORITY, 'return writerReleaseAuthority().exportsCertified[format] === true;', 'return writerReleaseAuthority().sourceIntakeReleased && writerReleaseAuthority().exportsCertified[format] === true;'),
    },
    {
      name: 'a component outside app and lib reads an export certification and also keys on sourceIntakeReleased',
      kind: 'break',
      expect: 'RED',
      diesBecause: 'a file that reads an export or erasure certification also references sourceIntakeReleased',
      apply: (t) => t.add('components/ExportGate.tsx', "import { writerReleaseAuthority } from '@/lib/writersStudio/releaseAuthority';\n\nexport function exportOpen() {\n  const r = writerReleaseAuthority();\n  return r.sourceIntakeReleased && r.exportsCertified.pdf;\n}\n"),
    },
  ],
  decoys: [
    {
      name: 'THE LIFT ITSELF: sourceIntakeReleased flips to true while the other certifications stay false (independence means this changes nothing)',
      expect: 'GREEN',
      apply: (t) => swap(t, RELEASE_AUTHORITY, '  sourceIntakeReleased: false,', '  sourceIntakeReleased: true,'),
    },
    {
      name: 'the render route mentions sourceIntakeReleased in a comment and in a message string',
      expect: 'GREEN',
      apply: (t) =>
        swap(t, RENDER_ROUTE, 'const release = writerReleaseAuthority();\n  if (release.exportsCertified[format] !== true) {', "// note: exports do not follow sourceIntakeReleased\n  const release = writerReleaseAuthority();\n  console.log('independent of sourceIntakeReleased');\n  if (release.exportsCertified[format] !== true) {"),
    },
  ],
};

// =====================================================================================================
// 10. SF-08 -- the intake and landing path consults session posture, or a ruling exempts uploads
// =====================================================================================================

const LANDING_ENTRYPOINTS = [
  ['lib/manuscript/source/arrivals.ts', ['recordArtifactArrival', 'recordSuppliedArrival']],
  ['lib/manuscript/source/encryptedLanding.ts', ['recordEncryptedArtifactArrival', 'beginEncryptedLanding', 'prepareEncryptedWrite', 'commitEncryptedArrival']],
];
const ARRIVALS = 'lib/manuscript/source/arrivals.ts';
const POSTURE_IMPORT = "import { TurnPosture, contentWritable } from '@/lib/sanctuary/turnPosture';\n";
// Posture APIs a refusal can be built on. recordConsentState is NOT one of them: it WRITES the resolved posture to
// runtime_consent_state, it does not consult it, so calling it protects nothing.
const POSTURE_API = /\b(?:TurnPosture\s*\.\s*resolve|contentWritable|readCurrentSanctuaryPosture|resolveRecordedPosture|shouldPersistTurn|shouldPersistKeep)\s*\(/;

function rulingRecorded(tree, rep) {
  const raw = tree.read(DISPOSITIONS_REL);
  if (raw === null) {
    rep.ctx(`${DISPOSITIONS_REL} is absent, so no ruling can be recorded there`);
    return false;
  }
  let d;
  try {
    d = JSON.parse(raw);
  } catch {
    rep.unknown(`${DISPOSITIONS_REL} is not valid JSON`);
    return false;
  }
  const ids = ['FILL-2a', 'FILL-2b', 'FILL-2c'];
  const complete = (g) => g && ['owner', 'memberFacingSentence', 'closureCondition', 'registerLine'].every((k) => typeof g[k] === 'string' && g[k].trim() !== '');
  const each = ids.map((id) => {
    const e = d.dispositions?.[id];
    return Boolean(e && e.disposition === 'DECLARED_GAP' && complete(e.gap));
  });
  const ok = d.ruled === true && each.every(Boolean);
  rep.state(`${DISPOSITIONS_REL} ruled=${d.ruled === true}; Sanctuary obligations declared with a complete gap record: ${each.filter(Boolean).length} of ${ids.length}`);
  return ok;
}

function checkSf08(tree) {
  const rep = report();
  const route = need(tree, INGEST_ROUTE, rep);
  if (!route) return rep.done();
  const H = handlerOf(route, 'POST', rep);
  if (!H) return rep.done();
  const formPos = firstMatch(route.bl, FORM_RE, H.open, H.close)?.index ?? null;
  const world = sanctuaryWorld();

  // (a) the door: a gate that DEFINITELY refuses when the session is in Sanctuary, before the multipart read. The
  //     world supplies the Sanctuary answer from every posture API whose input is not a literal, so a hard-coded
  //     `{ sanctuary: false }`, an inverted contentWritable and a conjunct on an environment flag are all dead gates.
  const door = creditedGate(tree, route, H, world, { before: formPos ?? undefined }).gate;
  if (door) rep.ok(`${loc(route, door.pos)} the ingest handler refuses a Sanctuary session before the multipart read`);

  // (b) the landing library: a refusing gate on session posture INSIDE a landing entrypoint. A posture API that is
  //     merely called (its result discarded, logged, or a write like recordConsentState) refuses nothing.
  let landing = null;
  let inspected = 0;
  let scanned = 0;
  let consulted = 0;
  for (const rel of tree.list('lib/manuscript/source', { ext: ['.ts'] })) {
    if (/\/__tests__\//.test(rel) || /\.test\.ts$/.test(rel)) continue;
    if (!sourceFacts(tree, rel).missing) scanned++;
  }
  if (scanned === 0) {
    rep.unknown('no landing library file found under lib/manuscript/source');
    return rep.done();
  }
  for (const [rel, names] of LANDING_ENTRYPOINTS) {
    const lf = sourceFacts(tree, rel);
    if (lf.missing) continue;
    for (const name of names) {
      const fn = functionRange(lf.bl, name);
      if (!fn) continue;
      inspected++;
      if (firstMatch(lf.bl, POSTURE_API, fn.open, fn.close)) consulted++;
      const credit = creditedGate(tree, lf, fn, world);
      if (credit.gate && !landing) landing = { rel, line: lineAt(lf.bl, credit.gate.pos), name };
    }
  }
  if (inspected === 0) {
    rep.unknown('none of the named landing entrypoints could be located, so the landing path cannot be inspected');
    return rep.done();
  }
  if (landing) rep.ok(`${landing.rel}:${landing.line} the landing entrypoint ${landing.name} refuses a Sanctuary session`);
  else if (consulted > 0) rep.state(`${consulted} landing entrypoint(s) call a session-posture API, but none refuses on the answer (a posture that is read and not acted on protects nothing)`);
  rep.state(`${inspected} landing entrypoint(s) in ${scanned} landing library file(s) and the ingest handler scanned for a refusal that follows from session posture (TurnPosture, contentWritable, readCurrentSanctuaryPosture, resolveRecordedPosture, shouldPersist*)`);

  // (c) or a recorded ruling that exempts uploads
  const ruled = rulingRecorded(tree, rep);
  if (ruled) rep.ok(`${DISPOSITIONS_REL} records a ratified ruling that declares the Sanctuary obligations as accepted gaps`);

  if (!door && !landing && !ruled) {
    rep.bad(`${loc(route, H.open)} neither the ingest handler nor the landing library refuses on session posture, and no ratified ruling exempts uploads from Sanctuary`);
  }
  return rep.done();
}

const SF08_IMPORT = "import { TurnPosture, contentWritable } from '@/lib/sanctuary/turnPosture';\n";
const SF08_GATE = `    const sanctuaryHeader = request.headers.get('x-sanctuary');
    if (sanctuaryHeader !== 'true' && sanctuaryHeader !== 'false') {
      return NextResponse.json({ error: 'A Sanctuary posture is required.' }, { status: 400 });
    }
    const posture = TurnPosture.resolve({ sanctuary: sanctuaryHeader === 'true' });
    if (!contentWritable(posture, 'source_intake')) {
      return NextResponse.json({ error: 'Uploads are unavailable while Sanctuary is on.' }, { status: 409 });
    }

`;
const GAP = { owner: 'founder', memberFacingSentence: 'Original uploads are not covered by Sanctuary in this release.', closureCondition: 'a ruling that applies Sanctuary to uploads', registerLine: 'NON-DELIVERY: Sanctuary does not apply to uploads' };

function dispositionsEdit(mutate) {
  return (t) =>
    t.edit(DISPOSITIONS_REL, (src) => {
      const d = JSON.parse(src);
      mutate(d);
      return `${JSON.stringify(d, null, 1)}\n`;
    });
}

const SF08_AT_DOOR = (body, withImport = true) => (t) => insertBefore(withImport ? insertAfter(t, INGEST_ROUTE, INGEST_IMPORT_ANCHOR, SF08_IMPORT) : t, INGEST_ROUTE, INGEST_IDEMPOTENCY_COMMENT, `${body}\n\n`);
const SF08_POSTURE = "    const posture = TurnPosture.resolve({ sanctuary: request.headers.get('x-sanctuary') === 'true' });";
const atLanding = (importLine, body) => (t) => insertBefore(t.edit(ARRIVALS, (src) => importLine + src), ARRIVALS, '  return recordEncryptedArtifactArrival({', body);

const SF08 = {
  id: 'SF-08',
  title: 'The intake and landing path consults session posture, or a recorded ruling exempts uploads from Sanctuary',
  law: 'the intake and landing path consults session posture, or a recorded ruling exempts uploads from Sanctuary',
  obligations: ['FILL-2a', 'FILL-2b', 'FILL-2c'],
  claims: ['C21'],
  kind: 'law',
  expectedToday: 'RED',
  whyExpected:
    'Neither the ingest handler nor any non-test file under lib/manuscript/source calls TurnPosture.resolve, contentWritable, readCurrentSanctuaryPosture, resolveRecordedPosture or shouldPersist*; the posture APIs are used by other manuscript routes (keeps, review-discuss, ask) but not by intake. dispositions.json has ruled=false, so no ruling is recorded. The ruling alternative is read from dispositions.json because the repository defines no other ruling record: that reading is this module author\'s inference.',
  rulingPending: 'D6',
  check: checkSf08,
  defeats: [
    {
      name: 'FIX (code): an explicit boolean posture is required and TurnPosture/contentWritable refuse a Sanctuary upload before the multipart read',
      kind: 'fix',
      expect: 'GREEN',
      apply: (t) => insertBefore(insertAfter(t, INGEST_ROUTE, INGEST_IMPORT_ANCHOR, SF08_IMPORT), INGEST_ROUTE, INGEST_IDEMPOTENCY_COMMENT, SF08_GATE),
    },
    {
      name: 'SUBTLE FIX (code): the posture is resolved into a local and a braceless if refuses on posture.sanctuary',
      kind: 'fix',
      expect: 'GREEN',
      apply: (t) =>
        insertBefore(
          insertAfter(t, INGEST_ROUTE, INGEST_IMPORT_ANCHOR, SF08_IMPORT),
          INGEST_ROUTE,
          INGEST_IDEMPOTENCY_COMMENT,
          "    const intakePosture = TurnPosture.resolve({ sanctuary: request.headers.get('x-sanctuary') !== 'false' });\n    if (intakePosture.sanctuary) return NextResponse.json({ error: 'Uploads are unavailable while Sanctuary is on.' }, { status: 409 });\n\n",
        ),
    },
    {
      name: 'FIX (landing): recordArtifactArrival takes the turn posture and refuses a Sanctuary upload before the encrypted landing begins',
      kind: 'fix',
      expect: 'GREEN',
      apply: (t) => {
        const a = t.edit(ARRIVALS, (src) => POSTURE_IMPORT + src);
        const b = swap(a, ARRIVALS, '  extractor: ExtractorKey;\n  idempotencyKey?: string | null;\n}): Promise<StoredArrival> {', '  extractor: ExtractorKey;\n  idempotencyKey?: string | null;\n  posture: TurnPosture;\n}): Promise<StoredArrival> {');
        return insertBefore(b, ARRIVALS, '  return recordEncryptedArtifactArrival({', "  if (!contentWritable(params.posture, 'source_landing')) {\n    throw new Error('source_landing_sanctuary_refused');\n  }\n");
      },
    },
    {
      name: 'FIX (ruling): a ratified ruling declares the three Sanctuary obligations as accepted gaps with complete gap records',
      kind: 'fix',
      expect: 'GREEN',
      apply: dispositionsEdit((d) => {
        d.ruled = true;
        for (const id of ['FILL-2a', 'FILL-2b', 'FILL-2c']) d.dispositions[id] = { disposition: 'DECLARED_GAP', gap: { ...GAP } };
      }),
    },
  ],
  decoys: [
    {
      name: 'a helper that consults the posture is appended to arrivals.ts but no landing entrypoint calls it',
      expect: 'RED',
      apply: (t) => t.edit(ARRIVALS, (src) => `${POSTURE_IMPORT}${src}\nexport function postureForIntake(meta: unknown) {\n  return contentWritable(TurnPosture.resolve(meta), 'source_landing');\n}\n`),
    },
    {
      name: 'the landing library names the posture API only in a comment and in a string',
      expect: 'RED',
      apply: (t) => t.edit(ARRIVALS, (src) => `// TurnPosture.resolve( and contentWritable( are consulted by the route, not here\n${src}\nexport const LANDING_NOTE = 'recordArtifactArrival calls TurnPosture.resolve( never';\n`),
    },
    {
      name: 'the posture gate only runs for requests that opt in with a header (conditional enforcement)',
      expect: 'RED',
      apply: (t) =>
        insertBefore(
          insertAfter(t, INGEST_ROUTE, INGEST_IMPORT_ANCHOR, SF08_IMPORT),
          INGEST_ROUTE,
          INGEST_IDEMPOTENCY_COMMENT,
          `    if (request.headers.get('x-check-sanctuary') === '1') {\n${SF08_GATE.split('\n').map((l) => (l ? `  ${l}` : l)).join('\n')}    }\n\n`,
        ),
    },
    {
      name: 'a comment names TurnPosture.resolve and contentWritable',
      expect: 'RED',
      apply: (t) => insertBefore(t, INGEST_ROUTE, INGEST_IDEMPOTENCY_COMMENT, '    // const posture = TurnPosture.resolve(meta); if (!contentWritable(posture, "x")) return 409;\n'),
    },
    {
      name: 'a string literal names the posture API',
      expect: 'RED',
      apply: (t) => insertBefore(t, INGEST_ROUTE, INGEST_IDEMPOTENCY_COMMENT, "    console.log('TurnPosture.resolve( and contentWritable( are not called here');\n"),
    },
    {
      name: 'TurnPosture.resolve is called and the result is ignored (no refusal)',
      expect: 'RED',
      apply: (t) => insertBefore(insertAfter(t, INGEST_ROUTE, INGEST_IMPORT_ANCHOR, SF08_IMPORT), INGEST_ROUTE, INGEST_IDEMPOTENCY_COMMENT, '    TurnPosture.resolve({ sanctuary: false });\n\n'),
    },
    {
      name: 'a hard-coded local named sanctuary is tested (no posture API is consulted)',
      expect: 'RED',
      apply: (t) => insertBefore(t, INGEST_ROUTE, INGEST_IDEMPOTENCY_COMMENT, "    const sanctuary = false;\n    if (sanctuary) {\n      return NextResponse.json({ error: 'Uploads are unavailable while Sanctuary is on.' }, { status: 409 });\n    }\n\n"),
    },
    {
      name: 'the posture gate is placed AFTER the multipart body was read',
      expect: 'RED',
      apply: (t) => insertBefore(insertAfter(t, INGEST_ROUTE, INGEST_IMPORT_ANCHOR, SF08_IMPORT), INGEST_ROUTE, FILE_ANCHOR, SF08_GATE.replace(/request\.headers\.get\('x-sanctuary'\)/, "form.get('sanctuary') as string | null")),
    },
    {
      name: 'a ruling is entered with ruled=true but the gap records are incomplete',
      expect: 'RED',
      apply: dispositionsEdit((d) => {
        d.ruled = true;
        for (const id of ['FILL-2a', 'FILL-2b', 'FILL-2c']) d.dispositions[id] = { disposition: 'DECLARED_GAP', gap: { ...GAP, memberFacingSentence: null } };
      }),
    },
    {
      name: 'complete gap records are entered but the founder has not ratified (ruled=false)',
      expect: 'RED',
      apply: dispositionsEdit((d) => {
        for (const id of ['FILL-2a', 'FILL-2b', 'FILL-2c']) d.dispositions[id] = { disposition: 'DECLARED_GAP', gap: { ...GAP } };
      }),
    },
    {
      name: 'a hard-coded posture {sanctuary:false} is refused on (the gate can never fire for a real session)',
      expect: 'RED',
      apply: SF08_AT_DOOR("    if (TurnPosture.resolve({ sanctuary: false }).sanctuary) return NextResponse.json({ error: 'x' }, { status: 423 });"),
    },
    {
      name: 'contentWritable is tested with INVERTED polarity (it refuses the writable sessions)',
      expect: 'RED',
      apply: SF08_AT_DOOR(`${SF08_POSTURE}\n    if (contentWritable(posture, 'x')) return NextResponse.json({ error: 'x' }, { status: 409 });`),
    },
    {
      name: 'the contentWritable gate carries an environment conjunct',
      expect: 'RED',
      apply: SF08_AT_DOOR(`${SF08_POSTURE}\n    if (!contentWritable(posture, 'x') && process.env.ENFORCE_SANCTUARY === '1') return NextResponse.json({ error: 'x' }, { status: 409 });`),
    },
    {
      name: 'the gate refuses a Sanctuary session with a 200',
      expect: 'RED',
      apply: SF08_AT_DOOR(`${SF08_POSTURE}\n    if (!contentWritable(posture, 'x')) return NextResponse.json({ error: 'x' }, { status: 200 });`),
    },
    {
      name: 'LANDING: the landing entrypoint calls contentWritable(TurnPosture.resolve({})) and throws the answer away',
      expect: 'RED',
      apply: atLanding("import { TurnPosture, contentWritable } from '@/lib/sanctuary/turnPosture';\n", "  contentWritable(TurnPosture.resolve({}), 'source_landing');\n"),
    },
    {
      name: 'LANDING: the landing entrypoint only logs shouldPersistTurn(false)',
      expect: 'RED',
      apply: atLanding("import { shouldPersistTurn } from '@/lib/sanctuary/sanctuaryGuards';\n", '  console.log(shouldPersistTurn(false));\n'),
    },
    {
      name: 'LANDING: the landing entrypoint calls recordConsentState, which WRITES the posture and consults nothing',
      expect: 'RED',
      apply: atLanding("import { recordConsentState } from '@/lib/provenance/consentState';\n", "  recordConsentState({ requestId: 'r', posture: params.posture, memberId: params.memberId });\n"),
    },
  ],
};

// =====================================================================================================
// 11. SF-09 -- a failed Source claim is never reported to the member as a held original
// =====================================================================================================

function claimFacts(tree, f, H) {
  const claims = allMatches(f.bl, /\bclaimArrival\s*\(/, H.open, H.close);
  if (claims.length === 0) return null;
  const first = claims[0].index;
  const last = claims[claims.length - 1].index;
  let created = null;
  for (const m of allMatches(f.bl, /\bstatus\s*:\s*201\b/, first, H.close)) created = m;
  if (!created) return null;
  const refusal = /\bstatus\s*:\s*(?:4|5)\d\d\b/;
  const varM = /\b(?:let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*['"]legacy_interpreted_import['"]/.exec(f.code);
  const custodyVar = varM ? varM[1] : null;
  // scan from the handler start: the `if (` that CONTAINS a claim call begins before the call itself
  const allGates = ifGates(f.bl, H.open, created.index);
  const overClaims = (g) => claims.some((c) => c.index >= g.condStart && c.index < g.condStart + g.cond.length);

  // (1) a refusing guard AFTER every claim attempt that is definitely true while the custody label still holds its
  //     legacy default: it covers a throw and a false result alike, because both leave the label at the default --
  //     PROVIDED the label is only ever moved off the default when the claim returned true. A guard over a label that
  //     is assigned unconditionally guards nothing: a claim that returned false would already have been reported held.
  const over = custodyVar ? new Map([[custodyVar, 'legacy_interpreted_import']]) : null;
  const guard = custodyVar
    ? allGates.find((g) => g.pos > last && !g.nested && !inConditionalBlock(f.bl, H, g.pos) && refusalOf(g) === 'refuse' && gateTruth(tree, f, g, null, over) === true)
    : null;
  let ungrounded = 0;
  if (guard) {
    const eqs = new Set(declsOf(f).filter((d) => d.name === custodyVar).map((d) => d.eqPos));
    const world = claimWorld();
    const every = ifGates(f.bl, H.open, H.close);
    for (const m of allMatches(f.bl, new RegExp(`(?<![\\w$.])${esc(custodyVar)}\\s*=(?![=>])`), H.open, H.close)) {
      if (eqs.has(m.index + m[0].length - 1)) continue;
      const inBody = every.some((g) => m.index >= g.bodyFrom && m.index <= g.bodyTo && gateTruth(tree, f, g, world) === false);
      const inElse = every.some((g) => g.elseTo > 0 && m.index >= g.elseFrom && m.index <= g.elseTo && gateTruth(tree, f, { ...g, prevConds: [] }, world) === true);
      if (!inBody && !inElse) ungrounded++;
    }
  }
  // (2) otherwise BOTH failure modes must be refused separately
  let catchRefuses = false;
  for (const m of allMatches(f.bl, /\bcatch\s*(?:\([^)]*\))?\s*\{/, first, created.index)) {
    const open = f.bl.indexOf('{', m.index + 5);
    const close = matchClose(f.bl, open);
    const body = close > 0 ? f.bl.slice(open + 1, close) : '';
    if (/\breturn\b/.test(body) && refusal.test(body)) catchRefuses = true;
  }
  const everyFalseRefuses = claims.every((c) =>
    allGates.some((g) => c.index >= g.condStart && c.index < g.condStart + g.cond.length && ((g.returns && refusal.test(g.body)) || (/\breturn\b/.test(g.elseBody) && refusal.test(g.elseBody)))),
  );
  const refusesBoth = (Boolean(guard) && ungrounded === 0) || (catchRefuses && everyFalseRefuses);
  const anyRefusal = allGates.some((g) => (g.pos > first || overClaims(g)) && ((g.returns && refusal.test(g.body)) || refusal.test(g.elseBody))) || catchRefuses;

  // does the success response carry sourceCustody?
  let surfaces = false;
  const callStart = f.bl.lastIndexOf('NextResponse', created.index);
  if (callStart >= 0) {
    const p = f.bl.indexOf('(', callStart);
    const pc = p >= 0 ? matchClose(f.bl, p) : -1;
    if (pc > created.index) surfaces = /\bsourceCustody\b/.test(f.bl.slice(p, pc));
  }
  const catches = allMatches(f.bl, /\bcatch\s*(?:\([^)]*\))?\s*\{/, first, created.index).length;
  return { claim: first, created: created.index, refusesBoth, partial: anyRefusal && !refusesBoth, ungrounded: Boolean(guard) && ungrounded > 0, surfaces, catches, guardPos: guard ? guard.pos : null };
}

// What shows the member something: a React state setter, a toast or alert, a notify call, or JSX. A console call does not.
const SURFACE_RE = /\bset[A-Z][A-Za-z0-9_]*\s*\(|\b(?:toast|alert|notify|showError|showNotice|showToast|reportError)[A-Za-z0-9_]*\s*\(|<[A-Za-z][\w.]*/;

function tsxCustodyFacts(f) {
  const bl = f.bl;
  const stmtBounds = (idx) => {
    let a = idx;
    while (a > 0 && !';{}'.includes(bl[a - 1])) a--;
    let b = idx;
    while (b < bl.length && !';{}'.includes(bl[b])) b++;
    return [a, b];
  };
  // A READ is a member access (`body.sourceCustody`, `body?.sourceCustody`), a destructured name, or a bare use. A TYPE
  // SLOT (`sourceCustody?: string`, `sourceCustody: string` in an interface or a type literal) declares the field and reads nothing.
  const reads = allMatches(bl, /\bsourceCustody\b/).filter((m) => {
    const before = bl.slice(Math.max(0, m.index - 2), m.index);
    if (/\??\.$/.test(before)) return true;
    return !/^\s*\??\s*:/.test(bl.slice(m.index + 'sourceCustody'.length, m.index + 'sourceCustody'.length + 8));
  });
  const aliases = new Set();
  for (const r of reads) {
    const [a, b] = stmtBounds(r.index);
    const stmt = bl.slice(a, b);
    const m = /^\s*(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*(?::[^=]+)?=/.exec(stmt);
    if (m) aliases.add(m[1]);
    else {
      // An assignment into an EXISTING variable or a ref's `.current` carries the label the same way a declaration does
      // (`ref.current = body?.sourceCustody !== 'source_custodied'`). It still counts as ACTING only if a later branch on
      // that name SHOWS the member something; the assignment alone shows nothing.
      const asg = /^\s*([A-Za-z_$][\w$]*(?:\.current)?)\s*=(?![=>])/.exec(stmt);
      if (asg) aliases.add(asg[1]);
    }
    if (/^\s*(?:const|let|var)\s*\{[^}]*\bsourceCustody\b/.test(stmt)) aliases.add('sourceCustody');
  }
  const refs = [...reads];
  for (const al of aliases) for (const m of allMatches(bl, new RegExp(`\\b${esc(al)}\\b`))) if (!refs.some((r) => r.index === m.index)) refs.push(m);
  // ACTING = a branch on the label whose arm SHOWS the member something. Branching and then logging, or reading the
  // label into a variable nobody uses, shows nothing.
  const gates = ifGates(bl, 0, bl.length);
  let acting = false;
  for (const r of refs) {
    if (gates.some((g) => r.index >= g.condStart && r.index < g.condStart + g.cond.length && (SURFACE_RE.test(g.body) || SURFACE_RE.test(g.elseBody)))) { acting = true; break; }
    const [a, b] = stmtBounds(r.index);
    const stmt = bl.slice(a, b);
    if ((/&&|\|\||(?<![?.])\?(?![?.:])/.test(stmt)) && /\?[^:]*:|&&/.test(stmt) && SURFACE_RE.test(stmt) && !/^\s*(?:const|let|var)\b/.test(stmt)) { acting = true; break; }
  }
  return { reads, acting };
}

function checkSf09(tree) {
  const rep = report();
  const route = need(tree, MANUSCRIPTS_ROUTE, rep);
  const ui = need(tree, IMPORT_ROOM, rep, { tolerateLiterals: true });
  if (!route || !ui) return rep.done();
  const H = handlerOf(route, 'POST', rep);
  if (!H) return rep.done();
  const rf = claimFacts(tree, route, H);
  if (!rf) {
    rep.unknown(`${route.rel} POST: could not locate both the claimArrival attempt and the 201 success response`);
    return rep.done();
  }
  rep.state(`${loc(route, rf.claim)} the claim attempt; ${rf.catches} catch block(s) follow it before the success response at line ${lineAt(route.bl, rf.created)}`);
  if (!rf.refusesBoth) rep.state(`${loc(route, rf.created)} a claim failure (a thrown error or a false result) can still reach the same 201 as a claim success`);
  if (rf.partial) rep.state(`${loc(route, rf.created)} a refusal exists but covers only one claim-failure mode, so the other still ends in the 201`);
  if (rf.ungrounded) rep.state(`${loc(route, rf.created)} a refusing guard tests the custody label, but the label is also set to custodied without the claim returning true, so the guard cannot tell a failed claim from a successful one`);
  if (rf.surfaces) rep.state(`${loc(route, rf.created)} the 201 body carries sourceCustody, so the label is available to a client`);
  else rep.state(`${loc(route, rf.created)} the 201 body does not carry sourceCustody`);

  const uf = tsxCustodyFacts(ui);
  if (uf.reads.length === 0) rep.state(`${ui.rel} never reads sourceCustody from the save response`);
  else rep.state(`${ui.rel}:${lineAt(ui.bl, uf.reads[0].index)} reads sourceCustody${uf.acting ? ' and branches on it' : ' but never branches on it'}`);
  const claimCopy = firstMatch(ui.code, /held as Source|separately held/i);
  if (claimCopy) rep.state(`${ui.rel}:${lineAt(ui.code, claimCopy.index)} a sentence tells the member the original is held, with no condition on the claim outcome`);
  if (ui.literalIssues.length > 0) rep.ctx(`${ui.rel}: ${ui.literalIssues.length} line(s) have an apostrophe in JSX text that the literal scanner treats as a line-local string`);

  const surfacedAndShown = rf.surfaces && uf.reads.length > 0 && uf.acting;
  if (rf.refusesBoth) rep.ok(`${route.rel} refuses on every claim failure (a throw and a false result), so no held-original success is reported`);
  else if (surfacedAndShown) rep.ok(`${route.rel} surfaces sourceCustody and ${ui.rel} reads and branches on it`);
  else {
    rep.bad(`${loc(route, rf.created)} a failed Source claim ends in the same 201 success as a held original, and the member-facing room ${uf.reads.length === 0 ? 'never reads' : 'does not act on'} the custody label`);
  }
  return rep.done();
}

const sf09UiFix = (t) =>
  insertAfter(
    t,
    IMPORT_ROOM,
    "        id = typeof body?.id === 'string' ? body.id : null;\n",
    "        if (body?.sourceCustody !== 'source_custodied') {\n          setError('Your writing was saved, but its original was not held as Source.');\n        }\n",
  );
const CLAIM_CATCH = "      console.error('[press/manuscripts] source custody binding failed', err);\n";
const LOG_MARKER_MS = '    // Log marker: counts and provenance only, never content.\n    console.log(\n      `[MAIA/press] manuscript saved';
const UI_ID_LINE = "        id = typeof body?.id === 'string' ? body.id : null;\n";

const ROOM_FIRST_EXPORT = (t, text) => t.edit(IMPORT_ROOM, (src) => src.replace(/^export /m, `${text}export `));
const GUARD_409 = "    if (custody !== 'source_custodied') {\n      return NextResponse.json({ error: 'The original could not be held as Source.', retryable: true }, { status: 409 });\n    }\n\n";

const SF09 = {
  id: 'SF-09',
  title: 'A failed Source claim is never reported to the member as a held original',
  law: 'a failed Source claim is never reported to the member as a held original',
  obligations: ['WSI-24', 'FILL-3c'],
  claims: ['C18'],
  kind: 'law',
  expectedToday: 'RED',
  whyExpected:
    'In POST /api/sovereign/manuscripts a claimArrival that throws is only logged and one that returns false is ignored, so both end in the same 201 as a success (the body does carry sourceCustody); P4R1ImportManuscript.tsx never reads sourceCustody and a static sentence tells the member the original remains separately held as Source.',
  rulingPending: 'D4',
  check: checkSf09,
  defeats: [
    {
      name: 'FIX (route, the D4 refusal): after the claim attempt a non-custodied result returns a 409 with a retry door instead of the 201',
      kind: 'fix',
      expect: 'GREEN',
      apply: (t) =>
        insertBefore(
          t,
          MANUSCRIPTS_ROUTE,
          LOG_MARKER_MS,
          "    if (custody !== 'source_custodied') {\n      return NextResponse.json(\n        { error: 'Your writing was saved, but its original could not be held as Source. Retry or discard the upload.', retryable: true },\n        { status: 409 },\n      );\n    }\n\n",
        ),
    },
    {
      name: 'SUBTLE FIX (route, per mode): every claim has an else-branch refusal AND the catch refuses (no custody guard at all)',
      kind: 'fix',
      expect: 'GREEN',
      apply: (t) => {
        const refuse = "return NextResponse.json({ error: 'The original could not be held as Source.', retryable: true }, { status: 409 });";
        const a = t.edit(MANUSCRIPTS_ROUTE, (src) => src.replace(/(          custody = 'source_custodied';\n        )\}/g, `$1} else {\n          ${refuse}\n        }`));
        return insertAfter(a, MANUSCRIPTS_ROUTE, CLAIM_CATCH, `      ${refuse}\n`);
      },
    },
    {
      name: 'SUBTLE FIX (route): a braceless positive-compare guard refuses when the label is still the legacy default',
      kind: 'fix',
      expect: 'GREEN',
      apply: (t) =>
        insertBefore(
          t,
          MANUSCRIPTS_ROUTE,
          LOG_MARKER_MS,
          "    if (custody === 'legacy_interpreted_import') return NextResponse.json({ error: 'The original could not be held as Source.', retryable: true }, { status: 409 });\n\n",
        ),
    },
    {
      name: 'FIX (room, the minimum variant): the Import room reads sourceCustody from the save response and tells the member when the original was not held',
      kind: 'fix',
      expect: 'GREEN',
      apply: sf09UiFix,
    },
    {
      name: 'FIX (room, via a ref): the label is stored in a ref and a later branch on that ref tells the member the original was not held',
      kind: 'fix',
      expect: 'GREEN',
      apply: (t) =>
        insertAfter(
          t,
          IMPORT_ROOM,
          UI_ID_LINE,
          "        custodyRef.current = body?.sourceCustody !== 'source_custodied';\n        if (custodyRef.current) { setError('Your writing was saved, but its original was not held as Source.'); }\n",
        ),
    },
    {
      name: 'SUBTLE FIX (route, else-branch): the guard refuses a label still at its default, and the label is moved off the default only in the else of a failed-claim test',
      kind: 'fix',
      expect: 'GREEN',
      apply: (t) => {
        const a = insertBefore(t, MANUSCRIPTS_ROUTE, LOG_MARKER_MS, GUARD_409);
        return a.edit(MANUSCRIPTS_ROUTE, (src) =>
          src.replace(/if \(await claimArrival\((sourceArrivalId|arrival\.id), manuscriptId, memberId\)\) \{\n(\s*)custody = 'source_custodied';\n\s*\}/g, "if (!(await claimArrival($1, manuscriptId, memberId))) {\n$2console.error('[press/manuscripts] claim returned false');\n$2} else {\n$2custody = 'source_custodied';\n$2}"),
        );
      },
    },
  ],
  decoys: [
    {
      name: 'the room reads and branches on sourceCustody, but the route no longer returns it in the 201 body (nothing to read)',
      expect: 'RED',
      apply: (t) => sf09UiFix(swap(t, MANUSCRIPTS_ROUTE, 'sectionCount: clean.length, sourceCustody: custody }', 'sectionCount: clean.length }')),
    },
    {
      name: 'a refusing guard exists but a SECOND claim attempt follows it, so the guard no longer covers the final claim',
      expect: 'RED',
      apply: (t) =>
        insertBefore(
          t,
          MANUSCRIPTS_ROUTE,
          LOG_MARKER_MS,
          "    if (custody !== 'source_custodied') {\n      return NextResponse.json({ error: 'The original could not be held as Source.' }, { status: 409 });\n    }\n    await claimArrival(String(sourceArrivalId), manuscriptId, memberId);\n\n",
        ),
    },
    {
      name: 'PARTIAL FIX: the catch now refuses with a 409, but a claim that returns false still ends in the 201',
      expect: 'RED',
      apply: (t) => insertAfter(t, MANUSCRIPTS_ROUTE, CLAIM_CATCH, "      return NextResponse.json({ error: 'The original could not be held as Source.' }, { status: 409 });\n"),
    },
    {
      name: 'the Import room mentions sourceCustody only in a comment',
      expect: 'RED',
      apply: (t) => insertAfter(t, IMPORT_ROOM, UI_ID_LINE, "        // TODO: if (body?.sourceCustody !== 'source_custodied') tell the member\n"),
    },
    {
      name: 'the Import room mentions sourceCustody only inside a string',
      expect: 'RED',
      apply: (t) => insertAfter(t, IMPORT_ROOM, UI_ID_LINE, "        console.log('check sourceCustody on the response');\n"),
    },
    {
      name: 'the Import room reads sourceCustody into a variable and never uses it',
      expect: 'RED',
      apply: (t) => insertAfter(t, IMPORT_ROOM, UI_ID_LINE, '        const custodyLabel = body?.sourceCustody;\n        void custodyLabel;\n'),
    },
    {
      name: 'the route gains a refusal that only exists in a comment',
      expect: 'RED',
      apply: (t) => insertBefore(t, MANUSCRIPTS_ROUTE, LOG_MARKER_MS, "    // if (custody !== 'source_custodied') return NextResponse.json({}, { status: 409 });\n"),
    },
    {
      name: 'a 4xx refusal is added BEFORE the claim attempt (it cannot see a claim failure)',
      expect: 'RED',
      apply: (t) => insertBefore(t, MANUSCRIPTS_ROUTE, "    let custody = 'legacy_interpreted_import';", "    if (typeof title === 'string' && title.length > 5000) {\n      return NextResponse.json({ error: 'Title too long' }, { status: 400 });\n    }\n"),
    },
    {
      name: 'the catch logs and returns the same 201 (a catch that returns success is not a refusal)',
      expect: 'RED',
      apply: (t) => insertAfter(t, MANUSCRIPTS_ROUTE, CLAIM_CATCH, "      return NextResponse.json({ id: manuscriptId, sourceCustody: custody }, { status: 201 });\n"),
    },
    {
      name: 'the room declares the field in a type (sourceCustody?: string): a declaration reads nothing and shows nothing',
      expect: 'RED',
      apply: (t) => ROOM_FIRST_EXPORT(t, 'type SaveResponseShape = { id?: string; sourceCustody?: string };\n'),
    },
    {
      name: 'the room branches on sourceCustody and only console.logs',
      expect: 'RED',
      apply: (t) => insertAfter(t, IMPORT_ROOM, UI_ID_LINE, "        if (body?.sourceCustody !== 'source_custodied') { console.log('not custodied'); }\n"),
    },
    {
      name: 'the room stores the label in a ref and branches on that ref, but the branch only console.logs',
      expect: 'RED',
      apply: (t) => insertAfter(t, IMPORT_ROOM, UI_ID_LINE, "        custodyRef.current = body?.sourceCustody !== 'source_custodied';\n        if (custodyRef.current) { console.log('not custodied'); }\n"),
    },
    {
      name: 'the room stores the label in a ref and nothing ever reads that ref',
      expect: 'RED',
      apply: (t) => insertAfter(t, IMPORT_ROOM, UI_ID_LINE, "        custodyRef.current = body?.sourceCustody;\n"),
    },
    {
      name: 'the room stores the label in one ref but the member-facing branch tests a DIFFERENT, unrelated ref',
      expect: 'RED',
      apply: (t) => insertAfter(t, IMPORT_ROOM, UI_ID_LINE, "        custodyRef.current = body?.sourceCustody;\n        if (otherRef.current) { setError('Something unrelated happened.'); }\n"),
    },
    {
      name: 'the room defaults the label into a variable that nothing shows',
      expect: 'RED',
      apply: (t) => insertAfter(t, IMPORT_ROOM, UI_ID_LINE, "        const custodyLabel = body?.sourceCustody || 'unknown';\n        void custodyLabel;\n"),
    },
    {
      name: 'a refusing guard is added, but the custody label is set to custodied whether or not the claim returned true',
      expect: 'RED',
      apply: (t) => {
        const a = insertBefore(t, MANUSCRIPTS_ROUTE, LOG_MARKER_MS, GUARD_409);
        return a.edit(MANUSCRIPTS_ROUTE, (src) => src.replace(/if \(await claimArrival\((sourceArrivalId|arrival\.id), manuscriptId, memberId\)\) \{\n(\s*)custody = 'source_custodied';\n\s*\}/g, "await claimArrival($1, manuscriptId, memberId);\n$2custody = 'source_custodied';"));
      },
    },
    {
      name: 'a refusing guard exists but tests a label value the default never takes, so it can never fire',
      expect: 'RED',
      apply: (t) => insertBefore(t, MANUSCRIPTS_ROUTE, LOG_MARKER_MS, "    if (custody === 'unreachable_label') {\n      return NextResponse.json({ error: 'The original could not be held as Source.' }, { status: 409 });\n    }\n\n"),
    },
  ],
};

// =====================================================================================================
// 12. EXPORT
// =====================================================================================================

export const FALSIFIERS_A = Object.freeze([SF01, SF02, SF03, SF04, SF05, SF06, SF07, SF08, SF09]);

// =====================================================================================================
// 12b. THE PRE-REPAIR JUDGEMENTS, kept ONLY as stand-ins
// =====================================================================================================
// An adversarial review found each of these accepting what it should refuse. They are not used by any check; the
// self-test runs them beside the repaired code on the reviewer's inputs so that every repair is pinned by an
// assertion that FAILS on the old behaviour (the stand-in accepts, the repaired check rejects).

const LEGACY = {
  /** SF-02/03/06: a condition "negates the release" if it mentions `!flag` anywhere, whatever else it says. */
  gateByToken: (cond, flag) => new RegExp(`!\\s*\\(?\\s*${esc(flag)}\\b`).test(cond),
  /** SF-04: a gate counts if its condition mentions the admission result variable at all. */
  viaVar: (cond, v) => new RegExp(`\\b${esc(v)}\\b`).test(cond),
  /** SF-09: a statement "branches" if it holds a lone `?`, which also matches the `?:` of an optional property. */
  branches: (stmt) => /(?:===?|!==?)|\bif\s*\(|&&|\|\||(?<![?.])\?(?![?.])/.test(stmt),
  /** SF-01: a module with no recognisable POST declaration has no upload door. */
  noPostIsNoDoor: (bl) => functionRange(bl, 'POST') === null,
  /** The template scanner before the repair: a substitution was scanned for braces, quotes and nested templates only. */
  templateUnterminated: (code) => {
    const n = code.length;
    const q = (i, quote) => { let j = i + 1; while (j < n && code[j] !== quote && code[j] !== '\n') j += code[j] === '\\' ? 2 : 1; return j < n && code[j] === quote ? j + 1 : -1; };
    let i = code.indexOf('`');
    if (i < 0) return false;
    let j = i + 1;
    while (j < n) {
      const ch = code[j];
      if (ch === '\\') { j += 2; continue; }
      if (ch === '`') return false;
      if (ch === '$' && code[j + 1] === '{') {
        let depth = 1;
        let k = j + 2;
        while (k < n && depth > 0) {
          const c2 = code[k];
          if (c2 === '{') depth++;
          else if (c2 === '}') depth--;
          else if (c2 === "'" || c2 === '"') { const e = q(k, c2); if (e < 0) return true; k = e; continue; }
          k++;
        }
        j = k;
        continue;
      }
      j++;
    }
    return true;
  },
};

// =====================================================================================================
// 13. SELF-TEST (the lethality proof)
// =====================================================================================================

const TOKEN_FREE = /^[^\n'"`]{1,260}$/;
const DEFEAT_KINDS = new Set(['break', 'fix']);

function verdict(r) {
  return r.ok ? 'GREEN' : 'RED';
}

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

export function selfTest({ root = ROOT } = {}) {
  const checks = [];
  const add = (name, ok, detail = '') => checks.push({ name, ok: Boolean(ok), detail: String(detail) });
  const tree = createTree(root);

  // ---------- 0. the machinery, each piece with a known-wrong control ----------
  {
    const src = "const a = \"// not a comment\"; const b = `tmplword ${'x'} u`; const c = /a'b/.test(x);\nif (a) { return 1; }\n";
    const b = blankLiterals(src);
    const keepsTokens = b.text.includes('const a =') && b.text.includes('if (a)') && b.text.length === src.length;
    const blanked = !b.text.includes('not a comment') && !b.text.includes("a'b") && !b.text.includes('tmplword');
    add('machinery: blankLiterals blanks string/template/regex content and keeps offsets and code', keepsTokens && blanked && b.issues.length === 0);
    const naive = { text: src };
    add('machinery: the blankLiterals assertion FAILS on an identity blanker (lethal control)', !(!naive.text.includes('not a comment')));
    const unterminated = blankLiterals('const a = "never closed\nconst b = 1;\n');
    add('machinery: an unterminated string is reported, not guessed', unterminated.issues.length === 1 && unterminated.issues[0].kind === 'unterminated-string');
  }
  {
    const s = blankLiterals('function f() { if (a) { x({ y: 1 }); return 2; } else { z(); } if (b) return 3; }').text;
    const g = ifGates(s, 0, s.length);
    const ok = g.length === 2 && g[0].returns && g[0].elseBody.includes('z()') && g[1].returns && g[1].cond.trim() === 'b';
    add('machinery: ifGates extracts condition, body, else-body and "returns" across nested braces', ok);
    const naiveClose = s.indexOf('}', s.indexOf('{ y: 1'));
    const naiveBody = s.slice(s.indexOf('if (a) {') + 8, naiveClose);
    add('machinery: the ifGates assertion FAILS for a first-closing-brace extractor (lethal control)', !naiveBody.includes('return 2'));
  }
  {
    const mk = (body) => {
      const bl = blankLiterals(`export async function POST(request) {${body}}`).text;
      return { bl, H: functionRange(bl, 'POST') };
    };
    const a = mk(" return NextResponse.json({ e: 1 }, { status: 423 });");
    const b = mk(" if (x) { return NextResponse.json({}, { status: 423 }); } return 1;");
    const c = mk(" if (x) return NextResponse.json({}, { status: 423 }); return 1;");
    const d = mk(" await request.formData(); return NextResponse.json({}, { status: 423 });");
    const e = mk(" try { return NextResponse.json({}, { status: 423 }); } catch { return 1; }");
    const pos = (x) => x.bl.search(/status\s*:\s*423/);
    add('machinery: unconditionalReturnAt: bare return is unconditional', unconditionalReturnAt(a.bl, a.H, pos(a)) === true);
    add('machinery: unconditionalReturnAt: return inside if-block, braceless if, and try block are conditional', [b, c, e].every((x) => unconditionalReturnAt(x.bl, x.H, pos(x)) === false));
    const hd = hardHold({ bl: d.bl, code: d.bl }, d.H);
    const ha = hardHold({ bl: a.bl, code: a.bl }, a.H);
    add('machinery: hardHold accepts a 423 before any body read and rejects one after await request.formData()', ha !== null && hd === null);
  }
  {
    const bad = functionRange('export const POST = handler;\nconst later = () => { return 1; };', 'POST');
    const good = functionRange('export const POST = async (req: Request) => { return 1; };', 'POST');
    add('machinery: functionRange refuses a const that is not itself an arrow (it must not borrow a later arrow)', bad === null && good !== null && good.open > 0);
  }
  {
    // the engine: each piece with a known-wrong control. The hazard's atom takes a value, everything else is unknown.
    const run = (src, params = {}, world = null) => {
      const ast = parseSrc(src);
      if (!ast) return 'parse-fail';
      const t = truthy(ev(ast, { tree: null, f: { rel: 'x.ts', code: '', bl: '', kind: 'ts' }, world, params: new Map(Object.entries(params)), depth: 0, seen: new Set(), stack: [], steps: { n: 0 } }));
      return t === UNK ? '?' : t ? 'T' : 'F';
    };
    const held = { HOLD: false };
    const table = [
      ['!HOLD', held, 'T'], ['!HOLD && x', held, '?'], ['!HOLD && h.get("k") !== "1"', held, '?'], ['!HOLD || x', held, 'T'],
      ['HOLD || env.X === "1"', held, '?'], ['!(HOLD || env.X)', held, '?'], ['HOLD', held, 'F'], ['HOLD === false', held, 'T'], ['HOLD !== true', held, 'T'],
      ['x ? !HOLD : !HOLD', held, 'T'], ['x ? !HOLD : y', held, '?'], ['!!HOLD', held, 'F'], ['Boolean(HOLD)', held, 'F'],
    ];
    const bad = table.filter(([src, params, want]) => run(src, params) !== want);
    add('engine: Kleene truth of ! && || ?: === !== and Boolean(), with the hazard atom set and every other atom unknown', bad.length === 0, bad.map(([c, , w]) => `${c} wanted ${w}`).join(' | '));
    const textTable = [
      ['!x', 'T'], ['!x.trim()', 'T'], ['x.length === 0', 'T'], ['x.trim().length === 0', 'T'], ['x.trim().length < 1', 'T'], ["x === ''", 'T'], ['0 === x.length', 'T'], ['!x.length', 'T'], ['x.length <= 0', 'T'],
      ['!x.replace(/\\s/g, "")', 'T'], ['/^\\s*$/.test(x)', 'T'], ['x.length > 5', 'F'], ['x.length >= 5', 'F'], ['!w', '?'], ['w.length === 0', '?'], ['file.size === 0', '?'], ['!x.startsWith(y)', '?'], ['!x.textual', '?'],
      ["f === 'docx' && x.trim().length === 0", '?'], ["x.trim().length === 0 && env.REFUSE_EMPTY === '1'", '?'],
    ];
    const badText = textTable.filter(([src, want]) => run(src, { x: '' }) !== want);
    add('engine: empty-string semantics -- every lawful spelling of "this text is empty" is definitely true, upper bounds and lookalikes are not, a conjunct makes it unknown', badText.length === 0, badText.map(([c, w]) => `${c} wanted ${w}`).join(' | '));
    // lethal control: an engine that treats a conjunct as if it were not there (the token check's blind spot) fails the table
    const tokenOnly = (src) => (/HOLD/.test(src) ? 'T' : '?');
    add('engine: the conjunct row FAILS for a token-matching stand-in (lethal control)', run('!HOLD && x', held) !== tokenOnly('!HOLD && x'));
  }
  {
    // soundness oracle: a condition the engine calls definitely true must be true in EVERY assignment of the open atoms
    // (brute force over a nine-value domain), and a condition it calls definitely false must be false in every one.
    let seed = 20261103;
    const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
    const pick = (a) => a[Math.floor(rnd() * a.length)];
    const LEAVES = ['M', '!M', 'M === false', 'M !== true', 'M === true', 'M !== false', 'a', 'b', 'c', '!a', "a === '1'", "typeof a === 'string'", 'true', 'false', 'a === undefined', 'b != null', '!!c'];
    const gen = (d) => {
      if (d <= 0 || rnd() < 0.25) return pick(LEAVES);
      const k = rnd();
      if (k < 0.3) return `(${gen(d - 1)} && ${gen(d - 1)})`;
      if (k < 0.6) return `(${gen(d - 1)} || ${gen(d - 1)})`;
      if (k < 0.75) return `!(${gen(d - 1)})`;
      if (k < 0.9) return `(${gen(d - 1)} ? ${gen(d - 1)} : ${gen(d - 1)})`;
      return `(${gen(d - 1)} ?? ${gen(d - 1)})`;
    };
    const DOM = [undefined, null, '', '1', 'x', 0, 1, true, false];
    let unsound = 0;
    let decided = 0;
    let total = 0;
    for (const mval of [false, true]) {
      for (let n = 0; n < 400; n++) {
        const src = gen(4);
        const ast = parseSrc(src);
        if (!ast) { unsound++; continue; }
        const got = truthy(ev(ast, { tree: null, f: { rel: 'x.ts', code: '', bl: '', kind: 'ts' }, world: null, params: new Map([['M', mval]]), depth: 0, seen: new Set(), stack: [], steps: { n: 0 } }));
        total++;
        if (got === UNK) continue;
        decided++;
        const fn = new Function('M', 'a', 'b', 'c', `return Boolean(${src});`);
        let all = true;
        let none = true;
        for (const a of DOM) for (const b of DOM) for (const c of DOM) { if (fn(mval, a, b, c)) none = false; else all = false; }
        if ((got === true && !all) || (got === false && !none)) unsound++;
      }
    }
    add('engine: 800 random conditions -- a verdict of definitely true / false is never contradicted by brute force (soundness)', unsound === 0 && decided > 300, `${unsound} unsound, ${decided} of ${total} decided`);
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
  const ids = FALSIFIERS_A.map((x) => x.id);
  add('exactly the nine ids SF-01 .. SF-09, in order', JSON.stringify(ids) === JSON.stringify(['SF-01', 'SF-02', 'SF-03', 'SF-04', 'SF-05', 'SF-06', 'SF-07', 'SF-08', 'SF-09']), ids.join(','));
  for (const F of FALSIFIERS_A) {
    const shape =
      typeof F.title === 'string' && typeof F.law === 'string' && typeof F.whyExpected === 'string' &&
      Array.isArray(F.obligations) && F.obligations.length > 0 && Array.isArray(F.claims) && F.claims.length > 0 &&
      ['law', 'inventory', 'state'].includes(F.kind) && ['GREEN', 'RED'].includes(F.expectedToday) &&
      (F.rulingPending === null || typeof F.rulingPending === 'string') && typeof F.check === 'function' && Array.isArray(F.defeats);
    add(`${F.id}: contract shape`, shape);
    const missing = F.obligations.filter((o) => !obligationIds.has(o));
    add(`${F.id}: every obligation id exists in obligation-index.json`, missing.length === 0, missing.join(','));
    const wantKind = F.expectedToday === 'GREEN' ? 'break' : 'fix';
    const wantExpect = F.expectedToday === 'GREEN' ? 'RED' : 'GREEN';
    const covered = F.defeats.some((d) => d.kind === wantKind && d.expect === wantExpect);
    add(`${F.id}: has a '${wantKind}' defeat expecting ${wantExpect}`, covered);
    add(`${F.id}: every defeat has a legal kind and the direction its kind requires`, F.defeats.every((d) => DEFEAT_KINDS.has(d.kind) && (d.kind === 'break' ? d.expect === 'RED' : d.expect === 'GREEN')) && F.defeats.every((d) => d.kind !== 'break' || F.expectedToday === 'GREEN') && F.defeats.every((d) => d.kind !== 'fix' || F.expectedToday === 'RED'));
    const subtle = F.defeats.some((d) => /SUBTLE/.test(d.name)) || (F.decoys ?? []).length > 0;
    add(`${F.id}: carries a SUBTLE defeat or decoys a naive check would misjudge`, subtle);
  }

  // ---------- 2. real tree outcome == expectedToday; evidence is content-free ----------
  const real = new Map();
  for (const F of FALSIFIERS_A) {
    const r = runCheck(F, tree);
    real.set(F.id, r);
    add(`${F.id}: real tree is ${F.expectedToday}`, verdict(r) === F.expectedToday && !r.threw, `got ${verdict(r)}${r.threw ? ` (${r.threw})` : ''}`);
    add(`${F.id}: real-tree evidence has no INCONCLUSIVE line (the verdict rests on files that were read)`, !r.evidence.some((l) => l.startsWith('INCONCLUSIVE:')), r.evidence.filter((l) => l.startsWith('INCONCLUSIVE:')).join(' | '));
    add(`${F.id}: evidence is non-empty, single-line, quote-free and bounded (content-free by construction)`, r.evidence.length > 0 && r.evidence.every((l) => TOKEN_FREE.test(l)), r.evidence.filter((l) => !TOKEN_FREE.test(l)).slice(0, 2).join(' | '));
    if (F.expectedToday === 'RED') add(`${F.id}: a RED real tree states a VIOLATION, not only an inconclusive file`, r.evidence.some((l) => l.startsWith('VIOLATION:')));
    if (F.expectedToday === 'GREEN') add(`${F.id}: a GREEN real tree states at least one ok: line (no vacuous pass)`, r.evidence.some((l) => l.startsWith('ok:')));
  }

  // ---------- 3. every defeat and every decoy flips (or holds) as declared, for its named reason ----------
  for (const F of FALSIFIERS_A) {
    for (const d of F.defeats) {
      const a = tryApply(d, tree);
      if (a.error) {
        add(`${F.id} defeat applies: ${d.name}`, false, a.error);
        continue;
      }
      const r = runCheck(F, a.tree);
      const got = verdict(r);
      add(`${F.id} defeat -> ${d.expect}: ${d.name}`, got === d.expect && !r.threw, `got ${got}`);
      if (d.expect === 'RED') {
        add(`${F.id} defeat dies for its named reason, not by making a file unreadable: ${d.name}`, !r.evidence.some((l) => l.startsWith('INCONCLUSIVE:')) && (!d.diesBecause || r.evidence.some((l) => l.includes(d.diesBecause))), `wanted "${d.diesBecause ?? ''}" in: ${r.evidence.filter((l) => l.startsWith('VIOLATION:')).join(' | ').slice(0, 220)}`);
      } else {
        add(`${F.id} fix leaves no VIOLATION or INCONCLUSIVE line: ${d.name}`, !r.evidence.some((l) => l.startsWith('VIOLATION:') || l.startsWith('INCONCLUSIVE:')), r.evidence.filter((l) => l.startsWith('VIOLATION:') || l.startsWith('INCONCLUSIVE:')).join(' | ').slice(0, 220));
      }
      add(`${F.id} defeat evidence is content-free: ${d.name}`, r.evidence.every((l) => TOKEN_FREE.test(l)));
      add(`${F.id} defeat changed the tree (it is not a vacuous mutation): ${d.name}`, a.tree.touched().length > 0);
    }
    for (const d of F.decoys ?? []) {
      const a = tryApply(d, tree);
      if (a.error) {
        add(`${F.id} decoy applies: ${d.name}`, false, a.error);
        continue;
      }
      const r = runCheck(F, a.tree);
      const got = verdict(r);
      add(`${F.id} decoy stays ${d.expect} (a naive check would misjudge it): ${d.name}`, got === d.expect && d.expect === F.expectedToday && !r.threw && !r.evidence.some((l) => l.startsWith('INCONCLUSIVE:')), `got ${got}`);
      if (d.diesBecause) add(`${F.id} decoy is rejected for its named reason: ${d.name}`, r.evidence.some((l) => l.includes(d.diesBecause)), `wanted "${d.diesBecause}" in: ${r.evidence.filter((l) => l.startsWith('VIOLATION:')).join(' | ').slice(0, 200)}`);
      add(`${F.id} decoy evidence is content-free: ${d.name}`, r.evidence.every((l) => TOKEN_FREE.test(l)));
    }
  }

  // ---------- 4. extra lethality for the pieces with the most room to be wrong ----------
  {
    // SF-03: classification cannot be softened. Re-declare honest-looking dispositions that the code contradicts.
    const soften = (rel, patch) => makeInventoryCheck({ ...INVENTORY, [rel]: { ...INVENTORY[rel], ...patch } });
    const visual = 'app/api/sovereign/living-works/[id]/visual/route.ts';
    const bench = 'app/api/book-studio/workbench/uploads/route.ts';
    const asOther = soften(visual, { cls: 'OTHER_REVIEWED', must: [], mustNot: [R('\\bwriteVaultBytes\\s*\\(')] });
    const asHeld = soften(visual, { cls: 'HARD_HELD', must: [], mustNot: [] });
    const benchGated = soften(bench, { cls: 'RELEASE_GATED', must: [], mustNot: [] });
    const benchFounderless = soften(bench, { cls: 'PLAINTEXT_MEMBER', must: [R('\\bwriteOriginal\\s*\\('), R('\\bgetMemberIdFromRequest\\s*\\(')], mustNot: [] });
    const verd = (chk) => chk(tree);
    const r1 = verd(asOther);
    const r2 = verd(asHeld);
    const r3 = verd(benchGated);
    const r4 = verd(benchFounderless);
    add('SF-03 softening the living-works visual route to OTHER_REVIEWED is refused by the code (it writes plaintext bytes)', !r1.ok && r1.evidence.some((l) => l.includes('excluded fact')), r1.evidence.filter((l) => l.startsWith('VIOLATION:')).join(' | ').slice(0, 200));
    add('SF-03 declaring the visual route HARD_HELD is refused (no unconditional 423 precedes its multipart read)', !r2.ok && r2.evidence.some((l) => l.includes('declared HARD_HELD')));
    add('SF-03 declaring the workbench route RELEASE_GATED is refused (no manifest gate exists)', !r3.ok && r3.evidence.some((l) => l.includes('declared RELEASE_GATED')));
    add('SF-03 declaring the founder-only workbench route a member route is refused (requireFounder is present)', !r4.ok && r4.evidence.some((l) => l.includes('excluded fact') || l.includes('required fact')));
    const missingEntry = { ...INVENTORY };
    delete missingEntry['app/api/sovereign/living-works/[id]/visual/route.ts'];
    const r5 = makeInventoryCheck(missingEntry)(tree);
    add('SF-03 removing a declared entry makes that route an undeclared reader (inventory completeness is lethal)', !r5.ok && r5.evidence.some((l) => l.includes('undeclared multipart reader')));
    const scan = multipartRoutes(tree);
    add('SF-03 the scan found the planted-positive controls: the ingest and the visual routes are among the readers', scan.found.some((x) => x.rel === INGEST_ROUTE) && scan.found.some((x) => x.rel.includes('living-works')), `${scan.found.length} readers among ${scan.scanned}`);
    add('SF-03 the declared inventory has exactly one entry per upload reader (multipart and raw-body), none missing and none extra', scan.found.length === Object.keys(INVENTORY).length && scan.found.every((x) => INVENTORY[x.rel]) && scan.found.length === 22, `${scan.found.length} vs ${Object.keys(INVENTORY).length}`);
    add('SF-03 every upload reader was read to the end: no route file left the comment stripper or the literal scanner unclosed (a blanked tail would hide a reader)', scan.unreadable.length === 0, scan.unreadable.slice(0, 3).join(' | '));
    add('SF-03 the raw-body doors (chunked media upload, evidence stream, payment webhook) are among the readers, found without a .formData( call', ['app/api/media/projects/[projectId]/upload-chunk/route.ts', 'app/api/open/threshold/[token]/stream/[streamId]/route.ts', 'app/api/stripe/webhook/route.ts'].every((r) => scan.found.some((x) => x.rel === r && x.how === 'raw-body')));
    const empty = makeInventoryCheck(INVENTORY)(createTree(root, Object.fromEntries(scan.found.map((x) => [x.rel, null]))));
    add('SF-03 a scan that finds no multipart reader at all is INCONCLUSIVE, never GREEN (vacuity guard)', !empty.ok && empty.evidence.some((l) => l.startsWith('INCONCLUSIVE:')));
  }
  {
    // SF-01 reacts to a missing route and to an unreadable one, as UNKNOWN rather than GREEN
    const gone = SF01.check(tree.remove(SOURCES_ROUTE));
    add('SF-01 a missing route file is INCONCLUSIVE, not GREEN', !gone.ok && gone.evidence.some((l) => l.startsWith('INCONCLUSIVE:')));
    const broken = SF01.check(tree.edit(SOURCES_ROUTE, (s) => `${s}\n/* never closed`));
    add('SF-01 a route the comment stripper cannot close is INCONCLUSIVE, not GREEN', !broken.ok && broken.evidence.some((l) => l.startsWith('INCONCLUSIVE:')));
  }
  {
    // SF-09: the route half and the room half are independent; each alone is insufficient only when the other is absent
    const both = SF09.defeats[0].apply(SF09.defeats[1].apply(tree));
    add('SF-09 fixing both halves is GREEN as well (the fixes compose)', SF09.check(both).ok);
    const noClaim = SF09.check(tree.edit(MANUSCRIPTS_ROUTE, (s) => s.replaceAll('claimArrival(', 'claimArrivalGone(')));
    add('SF-09 a route with no recognisable claim attempt is INCONCLUSIVE, not GREEN', !noClaim.ok && noClaim.evidence.some((l) => l.startsWith('INCONCLUSIVE:')));
  }
  {
    // SF-07 refuses a route that stops reading any certification (the independence claim would be vacuous)
    const noReader = SF07.check(tree.edit(RENDER_ROUTE, (s) => s.replaceAll('exportsCertified', 'exportsCert').replaceAll('isMemberBookExportReleased', 'isReleased')));
    add('SF-07 a render route that no longer reads any certification fails (independence cannot be vacuous)', !noReader.ok);
  }

  // ---------- 5. one assertion per repaired defect, each of which FAILS on the pre-repair behaviour ----------
  {
    // (token, not structure) the reviewer's conditions: the old recogniser called every one a hold, the engine calls none
    const FLAG = 'PRESS_SOURCE_INTAKE_RELEASED';
    const bypasses = [
      `!${FLAG} && request.headers.get('x-skip-hold') !== '1'`,
      `!(${FLAG} || process.env.WRITER_FORCE_OPEN === '1')`,
      `!${FLAG} && process.env.WRITER_ENFORCE_RELEASE === '1'`,
    ];
    const held = new Map([[FLAG, false]]);
    const verdicts = bypasses.map((c) => {
      const ast = parseSrc(c);
      return { legacy: LEGACY.gateByToken(c, FLAG), engine: ast ? truthy(ev(ast, { tree: null, f: { rel: 'x.ts', code: '', bl: '', kind: 'ts' }, world: null, params: held, depth: 0, seen: new Set(), stack: [], steps: { n: 0 } })) : 'parse' };
    });
    add('repair: the token recogniser ACCEPTED every reviewer bypass condition (the stand-in does), the engine accepts none', verdicts.every((v) => v.legacy === true && v.engine !== true), JSON.stringify(verdicts));
  }
  {
    // brute-force agreement on named conditions: the engine says "always true while the flag is held" exactly when trying every combination agrees
    const cases = [
      ['!H', true], ['H === false', true], ['!H || process.env.X === "1"', true],
      ["!H && request.headers.get('x-skip-hold') !== '1'", false], ['!(H || process.env.WRITER_FORCE_OPEN === "1")', false], ['H', false],
      ["process.env.WRITER_BYPASS === '1' ? false : !H", false], ['!H && !process.env.X', false],
    ];
    const grid = [];
    for (const envVal of [undefined, '1', '0']) for (const hv of [null, '1', '0']) grid.push({ envVal, hv });
    const mismatches = [];
    for (const [cond, want] of cases) {
      const ast = parseSrc(cond);
      const eng = ast ? truthy(ev(ast, { tree: null, f: { rel: 'x.ts', code: '', bl: '', kind: 'ts' }, world: null, params: new Map([['H', false]]), depth: 0, seen: new Set(), stack: [], steps: { n: 0 } })) === true : null;
      const fn = new Function('H', 'process', 'request', `return Boolean(${cond});`);
      const brute = grid.every(({ envVal, hv }) => fn(false, { env: new Proxy({}, { get: () => envVal }) }, { headers: { get: () => hv } }));
      if (eng !== brute || brute !== want) mismatches.push(cond);
    }
    add('repair: on named hold conditions the engine agrees with executing them over every environment and header combination', mismatches.length === 0, mismatches.join(' | '));
  }
  {
    // (SF-02 polarity) simulate the lift: with the manifest flag TRUE, run each inline gate for real
    const grid = [];
    for (const envVal of [undefined, '1', '0']) for (const hv of [null, '1', '0']) grid.push({ envVal, hv });
    const fire = (expr, released, { envVal, hv }) => new Function('writerReleaseAuthority', 'process', 'request', 'req', `const intakeOpen = writerReleaseAuthority().sourceIntakeReleased; return Boolean(${expr});`)(() => ({ sourceIntakeReleased: released }), { env: new Proxy({}, { get: () => envVal }) }, { headers: { get: () => hv } }, { headers: { get: () => hv } });
    const exprOf = (tr) => {
      const f = sourceFacts(tr, WORKBENCH_ROUTE);
      const r = resolveHandler(f, 'POST');
      if (!r || !r.H) return null;
      const g = topGates(f, r.H).find((x) => /\bwriterReleaseAuthority\b|\bintakeOpen\b/.test(x.cond));
      if (!g) return null;
      const raw = (c) => f.code.slice(c.condStart, c.condStart + c.cond.length);
      return [...g.prevConds.map((c) => `!(${raw(c)})`), `(${raw(g)})`].join(' && ');
    };
    const pick = (list, frag) => list.find((d) => d.name.includes(frag));
    const holdsAtLift = (d) => { const e = exprOf(d.apply(tree)); return e !== null && grid.every((g) => fire(e, true, g)); };
    const fixes = ['refuses whenever writerReleaseAuthority', 'unless the manifest flag is literally false', 'destructured from the manifest first'].map((f) => pick(SF02.defeats, f));
    add('repair: every inline SF-02 fix still REFUSES once sourceIntakeReleased is true, whatever an env var or a header says (executed, not read)', fixes.every((d) => d && holdsAtLift(d)), fixes.map((d) => (d ? holdsAtLift(d) : 'missing')).join(','));
    const hazard = pick(SF02.decoys, 'THE HAZARD GATE');
    add('repair: the hazard-polarity gate does NOT refuse once sourceIntakeReleased is true (executed): the plaintext store opens at the lift', Boolean(hazard) && exprOf(hazard.apply(tree)) !== null && !grid.some((g) => fire(exprOf(hazard.apply(tree)), true, g)));
    const holes = ['environment conjunct', 'bypass in its negation', 'else-if'].map((f) => pick(SF02.decoys, f));
    add('repair: each SF-02 bypass decoy has a real hole at the lift (executed): some environment or header leaves the store open', holes.every((d) => d && exprOf(d.apply(tree)) !== null && grid.some((g) => !fire(exprOf(d.apply(tree)), true, g))), holes.map((d) => (d ? 'x' : 'missing')).join(','));
    const hz = hazard.apply(tree);
    const hf = sourceFacts(hz, WORKBENCH_ROUTE);
    const hH = resolveHandler(hf, 'POST').H;
    add('repair: the SAME hazard gate is a hold in the opposite world (manifest held), so the polarity of the world is what separates them', creditedGate(hz, hf, hH, releaseWorld(false)).gate !== null && creditedGate(hz, hf, hH, releaseWorld(true)).gate === null);
  }
  {
    // (SF-04) a gate on the result variable: the old check accepted an inverted one
    add('repair: the old SF-04 check accepted a gate that merely MENTIONS the admission result (the stand-in does); the real check refuses the inverted gate and the 200', LEGACY.viaVar('admission.allowed', 'admission') && SF04.decoys.filter((d) => /INVERTED|refuses the callers|200/.test(d.name)).every((d) => SF04.check(d.apply(tree)).ok === false));
  }
  {
    // (SF-09) a type slot is not a read; the old branch test counted the `?:` of an optional property as a ternary
    add('repair: the old SF-09 branch test read `sourceCustody?: string` as a ternary (the stand-in does); the room check reads it as a declaration', LEGACY.branches('sourceCustody?: string') === true && tsxCustodyFacts({ bl: 'type T = { id?: string; sourceCustody?: string };' }).reads.length === 0);
    const shows = tsxCustodyFacts({ bl: "if (body?.sourceCustody !== 'x') { setError(' '); }" });
    const logs = tsxCustodyFacts({ bl: "if (body?.sourceCustody !== 'x') { console.log(' '); }" });
    add('repair: a branch on sourceCustody that SHOWS the member something is acting; one that only logs, or reads into an unused variable, is not', shows.acting === true && logs.acting === false && tsxCustodyFacts({ bl: "const custodyLabel = body?.sourceCustody || ' '; void custodyLabel;" }).acting === false);
  }
  {
    // (SF-01) an export this module cannot locate is UNKNOWN, never "no door"
    const wrapped = 'export const POST = withMember(async (request: NextRequest) => { return 1; });';
    const star = "export * from './uploadHandlers';";
    const factory = 'export const POST = makeHandler();';
    const local = 'async function POST() { return 1; }';
    const bl = (src) => blankLiterals(src).text;
    add('repair: the old SF-01 treated a wrapped POST as "no upload door" (the stand-in does); the resolver finds the wrapped body', LEGACY.noPostIsNoDoor(bl(wrapped)) === true && Boolean(resolveHandler({ bl: bl(wrapped) }, 'POST')?.H));
    add('repair: a re-exported or factory-made POST is unresolved (UNKNOWN), and an unexported function named POST is no door', resolveHandler({ bl: bl(star) }, 'POST')?.unresolved === true && resolveHandler({ bl: bl(factory) }, 'POST')?.unresolved === true && resolveHandler({ bl: bl(local) }, 'POST') === null);
    const unresolved = (src) => SF01.check(tree.edit(SOURCES_ROUTE, (t) => t.replace(/export async function POST\(\) \{[\s\S]*$/, src)));
    const rStar = unresolved(star);
    const rFactory = unresolved(factory);
    add('repair: SF-01 on a re-exported or factory POST is INCONCLUSIVE, not GREEN', [rStar, rFactory].every((r) => !r.ok && r.evidence.some((l) => l.startsWith('INCONCLUSIVE:'))));
  }
  {
    // (literal scanner) the pre-repair scanner lost its place on a regex that holds a quote inside a template substitution
    const idiom = 'const h = `inline; filename="${n.replace(/"/g, \'\')}"`;\nconst form = await req.formData();\n';
    const b = blankLiterals(idiom);
    add('repair: the pre-repair template scan reports an unterminated template on a regex-with-a-quote substitution (the stand-in does); the repaired scanner closes it and still sees the code after it', LEGACY.templateUnterminated(idiom) === true && b.issues.length === 0 && /\bformData\b/.test(b.text));
    const nested = 'const x = `a ${`b ${"}"} c`} d`; const y = req.formData();\n';
    const bn = blankLiterals(nested);
    add('repair: nested templates, a brace inside a string inside a substitution, and a regex inside a substitution all keep the scanner in step', bn.issues.length === 0 && /\bformData\b/.test(bn.text));
  }
  {
    // (else-if, braceless nesting, early success return) the structure the token check could not see
    const chain = blankLiterals('function f(){ if (a) {} else if (b) { return 1; } if (c) if (d) return 2; }').text;
    const gs = ifGates(chain, 0, chain.length);
    add('repair: ifGates links an else-if to the conditions before it, and marks a braceless nested if', gs.length === 4 && gs[1].prevConds.length === 1 && gs[1].nested === false && gs[3].nested === true && gs[2].nested === false);
    const mid = ifGates(blankLiterals('else if (b) { return 1; }').text, 0, 30);
    add('repair: an else-if whose chain starts before the scan window is NOT treated as unconditional', mid.length === 1 && mid[0].nested === true);
    const H = { open: 0, close: 400 };
    const withBypass = blankLiterals("{ if (x) return NextResponse.json({ ok: true }); return NextResponse.json({}, { status: 423 }); }").text;
    const withRefusal = blankLiterals("{ if (x) return NextResponse.json({}, { status: 401 }); return NextResponse.json({}, { status: 423 }); }").text;
    const at = (t) => t.lastIndexOf('return');
    add('repair: successBypassBefore sees a statusless or 2xx early return and ignores a 4xx one', successBypassBefore({ bl: withBypass }, H, at(withBypass)) >= 0 && successBypassBefore({ bl: withRefusal }, H, at(withRefusal)) < 0);
    const g = (src) => ifGates(blankLiterals(src).text, 0, 200)[0];
    add('repair: refusalOf separates a 4xx or throw refusal from a 200, a statusless body and a bare return', refusalOf(g("if (a) return NextResponse.json({}, { status: 423 });")) === 'refuse' && refusalOf(g("if (a) throw new Error('x');")) === 'refuse' && refusalOf(g("if (a) return NextResponse.json({}, { status: 200 });")) === 'success' && refusalOf(g('if (a) return NextResponse.json({});')) === 'none' && refusalOf(g('if (held) return held;')) === 'delegated');
  }
  {
    // (helper following) the engine follows a hold into a helper, and a helper that keys on the environment is not a hold
    const helperHold = SF06.decoys.find((d) => /same-file helper/.test(d.name));
    const rHelper = helperHold ? SF06.check(helperHold.apply(tree)) : null;
    add('repair: a hold extracted into a same-file helper is still recognised as the hold (GREEN, with the order intact)', Boolean(rHelper) && rHelper.ok === true);
    const envHelper = SF02.decoys.find((d) => /keys on an environment variable instead of the manifest/.test(d.name));
    add('repair: a helper hold that keys on an environment variable instead of the manifest is not a hold', Boolean(envHelper) && SF02.check(envHelper.apply(tree)).ok === false);
  }
  {
    // (SF-03) a "stores nothing" disposition is checked against the broad storing vocabulary
    const probes = ["await appendFile('/x', b);", "await saveRecording('m', b);", "await insertOne('t', {});", 'await sql`INSERT INTO t VALUES (1)`;', "await db.query('INSERT');", "await fs.promises.copyFile('a', 'b');"];
    const miss = probes.filter((p) => !STORAGE_EFFECT_RE.test(blankLiterals(p).text));
    add('repair: the storing vocabulary names appendFile, a save/insert verb, a sql template, db.query and copyFile', miss.length === 0, miss.join(' | '));
    const benign = ['form.append("a", b);', 'const r = await fetch(url, { method: "POST" });', 'return NextResponse.json({ text });'];
    add('repair: the storing vocabulary does not fire on FormData.append, fetch or a JSON response', benign.every((p) => !STORAGE_EFFECT_RE.test(blankLiterals(p).text)));
    const envelopeOnly = 'await recordArtifactArrival({ memberId });';
    add('repair: plainEffect ignores the encrypted-envelope entrypoints and finds anything else that stores', plainEffect(blankLiterals(envelopeOnly).text, 0, 200) === null && plainEffect(blankLiterals(`${envelopeOnly} await writeFile(p, b);`).text, 0, 200) !== null);
  }

  {
    // (SF-03 literal scanner) a route file the literal scanner cannot close hides whatever follows: INCONCLUSIVE, not GREEN or "undeclared"
    const rel = 'app/api/sovereign/probe-jsx/route.tsx';
    const src = "import { NextRequest } from 'next/server';\nconst el = <p>don't</p>;\nexport async function POST(request: NextRequest) {\n  const form = await request.formData();\n  return Response.json({});\n}\n";
    const tr = tree.add(rel, src);
    const r = SF03.check(tr);
    const control = SF03.check(tree.add(rel, src.replace("<p>don't</p>", '1')));
    add('repair: SF-03 on a route file the literal scanner cannot close is INCONCLUSIVE (a blanked tail would hide a reader), never GREEN; the same file without the apostrophe is an undeclared reader', !r.ok && r.evidence.some((l) => l.startsWith('INCONCLUSIVE:') && l.includes('could not be read to the end')) && !control.ok && !control.evidence.some((l) => l.startsWith('INCONCLUSIVE:')) && control.evidence.some((l) => l.includes('undeclared multipart reader')));
  }
  {
    // (SF-05 world) the empty text also reaches the gate when it is destructured straight out of parseUpload
    const rel = 'lib/__probe/destructured.ts';
    const mk = (decl, cond) => `import { parseUpload } from '@/lib/manuscript/ingest/parseUpload';\nimport { NextResponse } from 'next/server';\nexport async function POST(b: Buffer) {\n  ${decl}\n  if (${cond}) {\n    return NextResponse.json({ error: 'x' }, { status: 422 });\n  }\n  return NextResponse.json({ ok: true });\n}\n`;
    const truth = (src) => {
      const tr = tree.add(rel, src);
      const f = sourceFacts(tr, rel);
      const H = resolveHandler(f, 'POST').H;
      return gateTruth(tr, f, topGates(f, H)[0], parsedWorld(), null);
    };
    add('repair: parseUpload\'s text is EMPTY in the world even when destructured out of the call, and its other members stay unknown', truth(mk("const { text } = await parseUpload(b, 'n', 't');", 'text.length === 0')) === true && truth(mk("const { warnings } = await parseUpload(b, 'n', 't');", 'warnings.length === 0')) === UNK && truth(mk("const { text } = await parseUpload(b, 'n', 't');", 'text.length > 5')) === false);
  }
  {
    // (early success) an explicit 2xx return before a gate can skip it, as well as a statusless one
    const H = { open: 0, close: 400 };
    const two = blankLiterals("{ if (x) return NextResponse.json({ ok: true }, { status: 202 }); return NextResponse.json({}, { status: 423 }); }").text;
    add('repair: successBypassBefore sees an explicit 2xx early return', successBypassBefore({ bl: two }, H, two.lastIndexOf('return')) >= 0);
    const hh = (src) => { const bl = blankLiterals(src).text; const Hh = functionRange(bl, 'POST'); return hardHold({ bl, code: src }, Hh); };
    add('repair: hardHold does not credit a 423 that an earlier succeeding return can skip', hh("export async function POST(r) { if (r.x) return NextResponse.json({}, { status: 200 }); return NextResponse.json({}, { status: 423 }); }") === null && hh("export async function POST(r) { return NextResponse.json({}, { status: 423 }); }") !== null);
  }

  return { ok: checks.every((c) => c.ok), checks };
}

// =====================================================================================================
// 14. RUN DIRECTLY
// =====================================================================================================

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const r = selfTest();
  const bad = r.checks.filter((c) => !c.ok);
  const real = FALSIFIERS_A.map((F) => {
    const x = runCheck(F, createTree(ROOT));
    return `${F.id} ${verdict(x)}${verdict(x) === F.expectedToday ? '' : ' (UNEXPECTED)'}`;
  });
  const defeats = FALSIFIERS_A.reduce((n, F) => n + F.defeats.length, 0);
  const decoys = FALSIFIERS_A.reduce((n, F) => n + (F.decoys ?? []).length, 0);
  console.log(`falsifiers-a self-test: ${r.ok ? 'PASS' : 'FAIL'} ${r.checks.length - bad.length}/${r.checks.length} checks; ${FALSIFIERS_A.length} falsifiers, ${defeats} defeats, ${decoys} decoys`);
  console.log(`real tree: ${real.join(' | ')}`);
  for (const c of bad) console.log(`  FAIL ${c.name}${c.detail ? ` -- ${c.detail}` : ''}`);
  process.exit(r.ok ? 0 : 1);
}
