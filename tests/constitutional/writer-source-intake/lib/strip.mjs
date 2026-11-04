// lib/strip.mjs -- comment stripping for the Writer original-file intake acceptance instrument.
//
// Plain Node ESM, node: built-ins only, zero npm dependencies.
//
// WHY THIS EXISTS (the historic lesson, stated once):
//   A scanner that matches a forbidden token against RAW source fails a file that merely
//   DOCUMENTS the token's absence ("nothing here reads <token>"). The cure is to scan the
//   code with comments removed. The opposite failure is worse and silent: a stripper that
//   mistakes code for a comment HIDES a violation. Every function here therefore:
//     - replaces comment characters with spaces and keeps every newline, so the output has the
//       SAME LENGTH as the input and every offset and line number is unchanged (evidence can cite
//       real line numbers);
//     - never touches the inside of string / template / regex literals;
//     - reports constructs it could not close (`issues`) so a caller can refuse to treat a
//       half-understood file as clean.
//
// EXPORTS
//   stripComments(source, { jsx = true } = {})   -> string   (TS / TSX / JS / MJS / JSONC)
//   stripCommentsDetailed(source, opts)          -> { text, issues: [{ kind, line }] }
//   stripSqlComments(source)                     -> string   (PostgreSQL flavoured)
//   stripSqlCommentsDetailed(source)             -> { text, issues }
//   stripYamlComments(source, { blockScalars })  -> string   blockScalars: 'preserve' (default) | 'run' | 'comments'
//   stripYamlCommentsDetailed(source, opts)      -> { text, issues }   issues come from shell bodies only, with FILE line numbers
//   stripShellComments(source)                   -> string   (sh / bash)
//   stripShellCommentsDetailed(source)           -> { text, issues }
//   stripDockerfileComments(source)              -> string   (+ ...Detailed)
//   stripDotenvComments(source)                  -> string   (+ ...Detailed)
//   stripCaddyfileComments(source)               -> string   (+ ...Detailed)
//   selfTest()                                   -> { ok, checks: [{ name, ok, detail }] }
//   mutationAudit()                              -> Promise<{ ok, results }>   (node lib/strip.mjs --mutation-audit)
//
// KNOWN LIMITS (honest list -- none of these is a bug report, each is a heuristic boundary):
//  JS/TS
//   * Regex-vs-division is decided from the previous significant token. `/` is a regex start after
//     a punctuator or one of the keywords return/typeof/instanceof/in/of/new/delete/void/throw/
//     case/do/else/yield/await/default. After an identifier, number, string, `)`, `]` or `}` it is
//     division. So `if (x) /re/.test(y)` and a regex statement right after a block `}` are read as
//     division. A would-be regex that does not close on its own line is re-read as division.
//     When the heuristic is wrong the damage is local: a `//` inside such a regex can blank the
//     rest of its line (false-negative direction) -- keep regexes after `(`, `=`, `,`, `:` etc.
//   * JSX is detected, not parsed: a `<` at an expression-start position followed by a tag name
//     (or `>` for a fragment) is tried as an element. Attributes, `{...}` containers, nested
//     elements and the CLOSING TAG NAME must all line up, otherwise the attempt is rolled back
//     (every blanked comment restored) and `<` is read as an operator. Inside a confirmed element,
//     children text is left untouched (so `//` and apostrophes in JSX text survive) and `{...}`
//     containers are scanned as code. NOT handled: type arguments on elements (`<Select<T> ...>`),
//     JSX directly after `)` or `}`, and anything the strict name-match refuses. If detection
//     fails, a `//` in JSX text is read as a comment and can blank the rest of its line.
//     `{ jsx: false }` turns the attempt off (use it for .ts/.mts/.cts where `<T>x` is a cast).
//   * Silent mis-parses cannot be detected from inside; `issues` only reports constructs that
//     reached end-of-file or end-of-line unclosed (string, template, `${`, block comment).
//   * Line numbers count '\n'. A CR-only file would be miscounted (but offsets stay exact).
//  SQL
//   * Block comments NEST (PostgreSQL semantics). Dollar-quoted bodies ($$...$$, $tag$...$tag$)
//     are treated as CODE, so comments inside a function body are stripped (strings inside it are
//     still protected). E'..' strings honour backslash escapes; plain '..' strings do not.
//  YAML
//   * `#` starts a comment only at line start or after whitespace and outside quotes. A quote opens
//     a scalar only at a value position (line start, after `:`/`-`/`?`/`,`/`[`/`{`, or after a
//     tag/anchor), so `don't # c` is a plain scalar followed by a comment. Quoted scalars may span
//     lines. Block scalars (`|`, `>`, with chomp/indent indicators, tags, anchors and quoted keys)
//     are YAML content: by default their bodies are preserved verbatim (a `#` there is NOT a YAML
//     comment). `{ blockScalars: 'run' }` strips SHELL comments (stripShellComments, so quotes,
//     here-documents and substitutions are understood) from the body of a block scalar whose key is
//     exactly `run` -- a GitHub Actions step script -- and nowhere else. `{ blockScalars: 'comments' }`
//     does the same for EVERY block scalar (a markdown `# heading` in a `body: |` would vanish: use
//     it only when every block scalar is known to be a script). A `script:` list item, a bare `- |`
//     item or any other key is NOT treated as shell by 'run'. Indentation-indicator digits are ignored.
//  SHELL
//   * A `#` is a comment only where a shell word BEGINS (start of text, after whitespace or one of
//     ; | & ( ) < >) and outside quotes, $'..', ${..}, $(..), backticks, arithmetic and here-document
//     bodies. Every doubt resolves to "content": the dangerous failure is hiding code. Here-document
//     bodies are data and are never touched. `let x=1<<2` (an unquoted shift outside $(( ))) is read
//     as a here-document and reported as `unterminated-heredoc`. A `case` pattern's `)` inside
//     `$( ... )` ends that substitution early (bash's own parser is context-sensitive there); the rest
//     is then scanned as the enclosing context, which treats quotes and comments the same way.
//     Comments inside backticks are NOT stripped. Verified (outside selfTest, needs bash) by
//     `bash --pretty-print`: for all 292 tracked *.sh / *.bash files of the repository at the time of
//     writing, bash's canonical form of the stripped text equals that of the original.
//  DOCKERFILE
//   * Only FULL-LINE comments (first non-blank character `#`) are removed; a `#` later on an
//     instruction line belongs to the shell and is kept. `# syntax=`, `# escape=`, `# check=` at the very
//     top are parser directives and are kept. Here-document bodies of RUN/COPY/ADD are kept; a
//     heredoc marker on a backslash-continued line starts its body on the next physical line.
//  DOTENV
//   * Only FULL-LINE comments are removed (parsers disagree about trailing ones); a full-line `#` inside
//     a multi-line quoted value is data.
//  CADDYFILE
//   * A `#` starts a comment only at the start of a token and outside "..." / `...` / `<<MARKER` bodies.

import { readFileSync, realpathSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const WS_RE = /\s/;

function isLineTerm(c) {
  return c === '\n' || c === '\r' || c === '\u2028' || c === '\u2029';
}

function isWs(c) {
  if (c === ' ' || c === '\n' || c === '\t' || c === '\r') return true;
  const k = c.charCodeAt(0);
  return (k > 127 || c === '\v' || c === '\f') && WS_RE.test(c);
}

function isIdentStart(c) {
  const k = c.charCodeAt(0);
  if (k < 128) {
    return (k >= 65 && k <= 90) || (k >= 97 && k <= 122) || k === 95 || k === 36 || k === 92 || k === 35;
  }
  return !WS_RE.test(c);
}

function isIdentPart(c) {
  const k = c.charCodeAt(0);
  if (k < 128) {
    return (k >= 48 && k <= 57) || (k >= 65 && k <= 90) || (k >= 97 && k <= 122) || k === 95 || k === 36 || k === 92;
  }
  return !WS_RE.test(c);
}

function isNumPart(c) {
  const k = c.charCodeAt(0);
  return (k >= 48 && k <= 57) || (k >= 65 && k <= 90) || (k >= 97 && k <= 122) || k === 95 || k === 46;
}

function isJsxNameStart(c) {
  if (c === undefined) return false;
  const k = c.charCodeAt(0);
  if (k < 128) return (k >= 65 && k <= 90) || (k >= 97 && k <= 122) || k === 95 || k === 36;
  return !WS_RE.test(c);
}

function isJsxNameChar(c) {
  const k = c.charCodeAt(0);
  if (k < 128) {
    return (k >= 48 && k <= 57) || (k >= 65 && k <= 90) || (k >= 97 && k <= 122) || k === 95 || k === 36 || k === 45 || k === 46 || k === 58;
  }
  return !WS_RE.test(c);
}

// Keywords after which `/` begins a regex and `<` may begin a JSX element.
const KW_EXPR = new Set([
  'return', 'typeof', 'instanceof', 'in', 'of', 'new', 'delete', 'void', 'throw',
  'case', 'do', 'else', 'yield', 'await', 'default',
]);

// ---------------------------------------------------------------------------------------------
// JS / TS / TSX
// ---------------------------------------------------------------------------------------------

export function stripCommentsDetailed(source, options = {}) {
  if (typeof source !== 'string') throw new TypeError('stripComments: source must be a string');
  const jsx = options.jsx !== false;
  const src = source;
  const n = src.length;
  const out = src.split(''); // UTF-16 code units; length is preserved in code units
  const issues = [];
  const journal = []; // flat [from, to, from, to, ...] of blanked ranges, only while speculating
  let spec = 0;
  let i = 0;
  let nlIndex = null;

  const lineNo = (pos) => {
    if (nlIndex === null) {
      nlIndex = [];
      for (let k = 0; k < n; k++) if (src.charCodeAt(k) === 10) nlIndex.push(k);
    }
    let lo = 0;
    let hi = nlIndex.length;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (nlIndex[mid] < pos) lo = mid + 1;
      else hi = mid;
    }
    return lo + 1;
  };
  const note = (kind, pos) => {
    if (issues.length < 100) issues.push({ kind, line: lineNo(pos) });
  };

  function blank(a, b) {
    if (b > n) b = n;
    for (let k = a; k < b; k++) if (!isLineTerm(out[k])) out[k] = ' ';
    if (spec > 0) journal.push(a, b);
  }
  function rollback(mark) {
    for (let k = journal.length - 2; k >= mark; k -= 2) {
      const a = journal[k];
      const b = journal[k + 1];
      for (let j = a; j < b; j++) out[j] = src[j];
    }
    journal.length = mark;
  }
  function speculate(fn) {
    const mark = journal.length;
    const savedI = i;
    const savedIssues = issues.length;
    spec++;
    let ok = false;
    try {
      ok = fn();
    } finally {
      spec--;
    }
    if (!ok) {
      rollback(mark);
      i = savedI;
      issues.length = savedIssues;
    } else if (spec === 0) {
      journal.length = 0;
    }
    return ok;
  }

  function lineComment() {
    let e = i;
    while (e < n && !isLineTerm(src[e])) e++;
    blank(i, e);
    i = e;
  }
  function blockComment() {
    const e = src.indexOf('*/', i + 2);
    if (e === -1) {
      note('unterminated-block-comment', i);
      blank(i, n);
      i = n;
    } else {
      blank(i, e + 2);
      i = e + 2;
    }
  }
  function skipTrivia() {
    while (i < n) {
      const c = src[i];
      if (isWs(c)) {
        i++;
        continue;
      }
      if (c === '/' && src[i + 1] === '/') {
        lineComment();
        continue;
      }
      if (c === '/' && src[i + 1] === '*') {
        blockComment();
        continue;
      }
      return;
    }
  }

  function scanString(q) {
    const start = i;
    i++;
    while (i < n) {
      const c = src[i];
      if (c === '\\') {
        if (src[i + 1] === '\r' && src[i + 2] === '\n') i += 3;
        else i += 2;
        continue;
      }
      if (c === q) {
        i++;
        return true;
      }
      if (c === '\n' || c === '\r') break; // JS strings cannot span lines: resync here
      i++;
    }
    if (i > n) i = n;
    note('unterminated-string', start);
    return false;
  }

  function scanTemplate() {
    const start = i;
    i++;
    while (i < n) {
      const c = src[i];
      if (c === '\\') {
        i += 2;
        continue;
      }
      if (c === '`') {
        i++;
        return true;
      }
      if (c === '$' && src[i + 1] === '{') {
        i += 2;
        if (!scanCode(true)) {
          note('unterminated-template-expression', start);
          i = n;
          return false;
        }
        i++; // the closing '}' of the expression
        continue;
      }
      i++;
    }
    if (i > n) i = n;
    note('unterminated-template', start);
    return false;
  }

  function tryRegex() {
    let j = i + 1;
    let inClass = false;
    while (j < n) {
      const c = src[j];
      if (isLineTerm(c)) return false;
      if (c === '\\') {
        if (j + 1 >= n || isLineTerm(src[j + 1])) return false;
        j += 2;
        continue;
      }
      if (inClass) {
        if (c === ']') inClass = false;
        j++;
        continue;
      }
      if (c === '[') {
        inClass = true;
        j++;
        continue;
      }
      if (c === '/') {
        j++;
        while (j < n) {
          const f = src[j];
          if ((f >= 'a' && f <= 'z') || (f >= 'A' && f <= 'Z')) j++;
          else break;
        }
        i = j;
        return true;
      }
      j++;
    }
    return false;
  }

  function readNumber() {
    while (i < n && isNumPart(src[i])) i++;
  }

  // ---- JSX (heuristic; every attempt runs under speculate() and is fully undone on failure) ----
  function jsxStartsAt(p) {
    const c = src[p + 1];
    return c === '>' || isJsxNameStart(c);
  }
  function readJsxName() {
    const s = i;
    while (i < n && isJsxNameChar(src[i])) i++;
    return src.slice(s, i);
  }
  function scanContainer() {
    // i is just past '{'. Scan code up to the matching '}' and consume it.
    if (!scanCode(true)) return false;
    i++;
    return true;
  }
  function jsxElement() {
    // i is at '<'. Returns true only for a complete, correctly closed element.
    i++;
    let name = '';
    if (src[i] !== '>') {
      name = readJsxName();
      if (name === '') return false;
    }
    for (;;) {
      skipTrivia();
      if (i >= n) return false;
      const c = src[i];
      if (c === '>') {
        i++;
        break;
      }
      if (c === '/') {
        i++;
        skipTrivia();
        if (src[i] !== '>') return false;
        i++;
        return true; // self-closing
      }
      if (c === '{') {
        i++;
        if (!scanContainer()) return false; // spread attribute
        continue;
      }
      if (isJsxNameStart(c)) {
        readJsxName();
        skipTrivia();
        if (src[i] === '=') {
          i++;
          skipTrivia();
          const v = src[i];
          if (v === '"' || v === "'") {
            const e = src.indexOf(v, i + 1); // JSX attribute strings have no escapes
            if (e === -1) return false;
            i = e + 1;
          } else if (v === '{') {
            i++;
            if (!scanContainer()) return false;
          } else if (v === '<') {
            if (!jsxElement()) return false;
          } else {
            return false;
          }
        }
        continue;
      }
      return false;
    }
    // children
    while (i < n) {
      const c = src[i];
      if (c === '{') {
        i++;
        if (!scanContainer()) return false;
        continue;
      }
      if (c === '<') {
        if (src[i + 1] === '/') {
          i += 2;
          while (i < n && isWs(src[i])) i++;
          const closeName = readJsxName();
          while (i < n && isWs(src[i])) i++;
          if (src[i] !== '>') return false;
          i++;
          return closeName === name; // strict: a mismatched close means we mis-detected
        }
        if (!jsxElement()) return false;
        continue;
      }
      i++; // raw JSX text: never a comment, never a string
    }
    return false; // ran off the end
  }

  // ---- main code scanner ----
  // inBraces: stop (without consuming) at the first unmatched '}' and return true; return false at EOF.
  function scanCode(inBraces) {
    let exprStart = true; // may the next '/' start a regex, the next '<' start JSX?
    let depth = 0;
    let afterDot = false;
    while (i < n) {
      const c = src[i];
      if (isWs(c)) {
        i++;
        continue;
      }
      if (c === '/') {
        const d = src[i + 1];
        if (d === '/') {
          lineComment();
          continue;
        }
        if (d === '*') {
          blockComment();
          continue;
        }
      }
      const wasDot = afterDot;
      afterDot = false;
      if (c === '"' || c === "'") {
        scanString(c);
        exprStart = false;
        continue;
      }
      if (c === '`') {
        scanTemplate();
        exprStart = false;
        continue;
      }
      if (c === '/') {
        if (exprStart && tryRegex()) {
          exprStart = false;
          continue;
        }
        i++;
        exprStart = true;
        continue;
      }
      if (c === '{') {
        depth++;
        i++;
        exprStart = true;
        continue;
      }
      if (c === '}') {
        if (depth === 0 && inBraces) return true;
        if (depth > 0) depth--;
        i++;
        exprStart = false;
        continue;
      }
      if (c === ')' || c === ']') {
        i++;
        exprStart = false;
        continue;
      }
      if (c === '<') {
        if (jsx && exprStart && jsxStartsAt(i) && speculate(jsxElement)) {
          exprStart = false;
          continue;
        }
        i++;
        exprStart = true;
        continue;
      }
      if (c === '.') {
        if (src[i + 1] === '.' && src[i + 2] === '.') {
          i += 3;
          exprStart = true;
          continue;
        }
        const d = src[i + 1];
        if (d !== undefined && d >= '0' && d <= '9') {
          i++;
          readNumber();
          exprStart = false;
          continue;
        }
        i++;
        afterDot = true;
        continue;
      }
      if (c >= '0' && c <= '9') {
        readNumber();
        exprStart = false;
        continue;
      }
      if (c === '+' || c === '-') {
        if (src[i + 1] === c) {
          i += 2; // ++ / -- : read as postfix, so a following '/' is division
          exprStart = false;
          continue;
        }
        i++;
        exprStart = true;
        continue;
      }
      if (isIdentStart(c)) {
        const s = i;
        i++;
        while (i < n && isIdentPart(src[i])) i++;
        exprStart = !wasDot && KW_EXPR.has(src.slice(s, i));
        continue;
      }
      i++; // any other punctuator
      exprStart = true;
    }
    return false;
  }

  if (src.startsWith('#!')) lineComment(); // hashbang line
  scanCode(false);
  return { text: out.join(''), issues };
}

export function stripComments(source, options = {}) {
  return stripCommentsDetailed(source, options).text;
}

// ---------------------------------------------------------------------------------------------
// SQL (PostgreSQL flavoured)
// ---------------------------------------------------------------------------------------------

const SQL_TAG_RE = /\$(?:[A-Za-z_\u0080-\uffff][A-Za-z0-9_\u0080-\uffff]*)?\$/y;
const sqlIdentChar = (c) => /[A-Za-z0-9_$\u0080-\uffff]/.test(c);

export function stripSqlCommentsDetailed(source) {
  if (typeof source !== 'string') throw new TypeError('stripSqlComments: source must be a string');
  const src = source;
  const n = src.length;
  const out = src.split('');
  const issues = [];
  let i = 0;
  let nlIndex = null;
  const lineNo = (pos) => {
    if (nlIndex === null) {
      nlIndex = [];
      for (let k = 0; k < n; k++) if (src.charCodeAt(k) === 10) nlIndex.push(k);
    }
    let lo = 0;
    let hi = nlIndex.length;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (nlIndex[mid] < pos) lo = mid + 1;
      else hi = mid;
    }
    return lo + 1;
  };
  const note = (kind, pos) => {
    if (issues.length < 100) issues.push({ kind, line: lineNo(pos) });
  };
  const blank = (a, b) => {
    if (b > n) b = n;
    for (let k = a; k < b; k++) if (!isLineTerm(out[k])) out[k] = ' ';
  };

  // closer: null at top level, or the dollar-quote tag whose body is being scanned as code.
  function scan(closer) {
    while (i < n) {
      const c = src[i];
      const d = src[i + 1];
      if (closer !== null && c === '$' && src.startsWith(closer, i)) {
        i += closer.length;
        return true;
      }
      if (c === '-' && d === '-') {
        let e = i;
        while (e < n && src[e] !== '\n' && src[e] !== '\r') e++;
        if (closer !== null) {
          const k = src.indexOf(closer, i);
          if (k !== -1 && k < e) e = k; // a body comment cannot swallow its own closing tag
        }
        blank(i, e);
        i = e;
        continue;
      }
      if (c === '/' && d === '*') {
        const start = i;
        let depth = 1;
        let j = i + 2;
        while (j < n && depth > 0) {
          if (src[j] === '/' && src[j + 1] === '*') {
            depth++;
            j += 2;
          } else if (src[j] === '*' && src[j + 1] === '/') {
            depth--;
            j += 2;
          } else {
            j++;
          }
        }
        if (depth > 0) note('unterminated-block-comment', start);
        blank(start, j);
        i = j;
        continue;
      }
      if (c === "'") {
        const start = i;
        const esc = i > 0 && (src[i - 1] === 'E' || src[i - 1] === 'e') && (i < 2 || !sqlIdentChar(src[i - 2]));
        i++;
        for (;;) {
          if (i >= n) {
            note('unterminated-string', start);
            break;
          }
          const ch = src[i];
          if (esc && ch === '\\') {
            i += 2;
            continue;
          }
          if (ch === "'") {
            if (src[i + 1] === "'") {
              i += 2;
              continue;
            }
            i++;
            break;
          }
          i++;
        }
        if (i > n) i = n;
        continue;
      }
      if (c === '"') {
        const start = i;
        i++;
        for (;;) {
          if (i >= n) {
            note('unterminated-quoted-identifier', start);
            break;
          }
          if (src[i] === '"') {
            if (src[i + 1] === '"') {
              i += 2;
              continue;
            }
            i++;
            break;
          }
          i++;
        }
        continue;
      }
      if (c === '$' && (i === 0 || !sqlIdentChar(src[i - 1]))) {
        SQL_TAG_RE.lastIndex = i;
        const m = SQL_TAG_RE.exec(src);
        if (m) {
          const start = i;
          i += m[0].length;
          if (!scan(m[0])) note('unterminated-dollar-quote', start);
          continue;
        }
      }
      i++;
    }
    return false;
  }

  scan(null);
  return { text: out.join(''), issues };
}

export function stripSqlComments(source) {
  return stripSqlCommentsDetailed(source).text;
}

// ---------------------------------------------------------------------------------------------
// SHELL (POSIX sh / bash flavoured)
// ---------------------------------------------------------------------------------------------
// Conservative by construction: every uncertainty resolves to "this `#` is CONTENT", because the
// dangerous failure of a stripper is hiding code, not leaving a comment behind. A `#` is a comment
// only where a shell word BEGINS (start of text, after whitespace or one of ; | & ( ) < >), outside
// quotes, `$(...)`/`${...}` text that is not a command position, here-document bodies and
// arithmetic. Here-document bodies are DATA and are never touched. Unclosed constructs are
// reported in `issues`; a caller must treat any issue as "half-understood file".

const SH_META = ';|&()<>';

export function stripShellCommentsDetailed(source) {
  if (typeof source !== 'string') throw new TypeError('stripShellComments: source must be a string');
  const src = source;
  const n = src.length;
  const out = src.split('');
  const issues = [];
  let i = 0;
  let nlIndex = null;
  const lineNo = (pos) => {
    if (nlIndex === null) {
      nlIndex = [];
      for (let k = 0; k < n; k++) if (src.charCodeAt(k) === 10) nlIndex.push(k);
    }
    let lo = 0;
    let hi = nlIndex.length;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (nlIndex[mid] < pos) lo = mid + 1;
      else hi = mid;
    }
    return lo + 1;
  };
  const note = (kind, pos) => {
    if (issues.length < 100) issues.push({ kind, line: lineNo(pos) });
  };
  const blank = (a, b) => {
    if (b > n) b = n;
    for (let k = a; k < b; k++) if (!isLineTerm(out[k])) out[k] = ' ';
  };
  const isSpace = (c) => c === ' ' || c === '\t' || c === '\r' || c === '\v' || c === '\f';

  function scanSq() {
    const start = i;
    const e = src.indexOf("'", i + 1);
    if (e === -1) {
      note('unterminated-string', start);
      i = n;
      return false;
    }
    i = e + 1;
    return true;
  }
  function scanAnsiC() {
    // i is at '$' of $'...'
    const start = i;
    i += 2;
    while (i < n) {
      const c = src[i];
      if (c === '\\') {
        i += 2;
        continue;
      }
      if (c === "'") {
        i++;
        return true;
      }
      i++;
    }
    note('unterminated-string', start);
    i = n;
    return false;
  }
  function scanDq() {
    const start = i;
    i++;
    while (i < n) {
      const c = src[i];
      if (c === '\\') {
        i += 2;
        continue;
      }
      if (c === '"') {
        i++;
        return true;
      }
      if (c === '$') {
        dollar(true);
        continue;
      }
      if (c === '`') {
        const s = i;
        i++;
        if (!scanCode('tick')) note('unterminated-backtick', s);
        continue;
      }
      i++;
    }
    note('unterminated-string', start);
    i = n;
    return false;
  }
  function scanParam(inDq, start) {
    // i is just past '${'
    while (i < n) {
      const c = src[i];
      if (c === '\\') {
        i += 2;
        continue;
      }
      if (c === '}') {
        i++;
        return true;
      }
      if (c === '"') {
        scanDq();
        continue;
      }
      if (c === "'" && !inDq) {
        scanSq();
        continue;
      }
      if (c === '$') {
        dollar(inDq);
        continue;
      }
      if (c === '`') {
        const s = i;
        i++;
        if (!scanCode('tick')) note('unterminated-backtick', s);
        continue;
      }
      i++;
    }
    note('unterminated-parameter-expansion', start);
    i = n;
    return false;
  }
  function dollar(inDq) {
    // i is at '$'
    const start = i;
    const d = src[i + 1];
    if (d === '(') {
      if (src[i + 2] === '(') {
        i += 3;
        if (!scanCode('arith')) note('unterminated-arithmetic', start);
        else if (src[i] === ')') i++;
      } else {
        i += 2;
        if (!scanCode('cmd')) note('unterminated-command-substitution', start);
      }
      return;
    }
    if (d === '{') {
      i += 2;
      scanParam(inDq, start);
      return;
    }
    if (d === "'" && !inDq) {
      scanAnsiC();
      return;
    }
    i++;
  }
  function heredocSpec(list) {
    // i is at '<<'. For a here-STRING (`<<<`) the delimiter word is empty (`<` is a metacharacter),
    // so nothing is queued and the redirect is skipped.
    const pos = i;
    let j = i + 2;
    let dash = false;
    if (src[j] === '-') {
      dash = true;
      j++;
    }
    while (j < n && (src[j] === ' ' || src[j] === '\t')) j++;
    let word = '';
    while (j < n) {
      const ch = src[j];
      if (ch === "'") {
        const e = src.indexOf("'", j + 1);
        if (e === -1) {
          j = n;
          break;
        }
        word += src.slice(j + 1, e);
        j = e + 1;
        continue;
      }
      if (ch === '"') {
        j++;
        while (j < n && src[j] !== '"') {
          if (src[j] === '\\' && j + 1 < n) j++;
          word += src[j];
          j++;
        }
        j++;
        continue;
      }
      if (ch === '\\') {
        if (j + 1 < n) word += src[j + 1];
        j += 2;
        continue;
      }
      if (isSpace(ch) || ch === '\n' || SH_META.includes(ch)) break;
      word += ch;
      j++;
    }
    if (word === '') {
      i += 2; // `<<` with no delimiter word: nothing to follow
      return;
    }
    list.push({ word, dash, pos });
    i = Math.min(j, n);
  }
  function readHeredocs(list) {
    // i is just past the newline that ends the command line; bodies are DATA and stay untouched.
    for (const h of list) {
      for (;;) {
        if (i >= n) {
          note('unterminated-heredoc', h.pos);
          break;
        }
        const e = src.indexOf('\n', i);
        const lineEnd = e === -1 ? n : e;
        let line = src.slice(i, lineEnd);
        if (line.endsWith('\r')) line = line.slice(0, -1);
        const cmp = h.dash ? line.replace(/^\t+/, '') : line;
        i = e === -1 ? n : e + 1;
        if (cmp === h.word) break;
      }
    }
    list.length = 0;
  }

  // kind: 'top' | 'cmd' ($( ... )) | 'arith' ($(( ... )) or (( ... ))) | 'tick' (`...`).
  // 'cmd'/'arith' return true after consuming their closing ')'; 'tick' after its closing backtick.
  function scanCode(kind) {
    let depth = 0;
    let wordStart = true;
    const heredocs = [];
    const comments = kind === 'top' || kind === 'cmd';
    while (i < n) {
      const c = src[i];
      if (c === '\n') {
        i++;
        wordStart = true;
        if (heredocs.length) readHeredocs(heredocs);
        continue;
      }
      if (isSpace(c)) {
        i++;
        wordStart = true;
        continue;
      }
      if (c === '\\') {
        const d = src[i + 1];
        if (d === '\n') i += 2;
        else if (d === '\r' && src[i + 2] === '\n') i += 3;
        else {
          i += 2;
          wordStart = false;
        }
        continue;
      }
      if (c === '#' && wordStart && comments) {
        let e = src.indexOf('\n', i);
        if (e === -1) e = n;
        blank(i, e);
        i = e;
        continue;
      }
      if (c === "'") {
        scanSq();
        wordStart = false;
        continue;
      }
      if (c === '"') {
        scanDq();
        wordStart = false;
        continue;
      }
      if (c === '`') {
        if (kind === 'tick') {
          i++;
          return true;
        }
        const s = i;
        i++;
        if (!scanCode('tick')) note('unterminated-backtick', s);
        wordStart = false;
        continue;
      }
      if (c === '$') {
        dollar(false);
        wordStart = false;
        continue;
      }
      if (c === '(') {
        if (src[i + 1] === '(') {
          const s = i;
          i += 2;
          if (!scanCode('arith')) note('unterminated-arithmetic', s);
          else if (src[i] === ')') i++;
          wordStart = true;
          continue;
        }
        depth++;
        i++;
        wordStart = true;
        continue;
      }
      if (c === ')') {
        if ((kind === 'cmd' || kind === 'arith') && depth === 0) {
          i++;
          return true;
        }
        if (depth > 0) depth--;
        i++;
        wordStart = true;
        continue;
      }
      if (c === '<') {
        if (kind !== 'arith' && src[i + 1] === '<') {
          heredocSpec(heredocs);
          wordStart = true;
          continue;
        }
        i++;
        wordStart = true;
        continue;
      }
      if (c === ';' || c === '|' || c === '&' || c === '>') {
        i++;
        wordStart = true;
        continue;
      }
      i++;
      wordStart = false;
    }
    if (heredocs.length) for (const h of heredocs) note('unterminated-heredoc', h.pos);
    return kind === 'top';
  }

  scanCode('top');
  return { text: out.join(''), issues };
}

export function stripShellComments(source) {
  return stripShellCommentsDetailed(source).text;
}

// ---------------------------------------------------------------------------------------------
// DOCKERFILE
// ---------------------------------------------------------------------------------------------
// Docker comments are FULL-LINE only (`#` as the first non-blank character). A `#` later on an
// instruction line is passed to the shell, so it is left alone (the safe direction). Parser
// directives at the very top (`# syntax=`, `# escape=`, `# check=`) are instructions in comment
// clothing and are kept. Here-document bodies (RUN/COPY/ADD <<WORD ... WORD) are data and are kept.

const DOCKER_DIRECTIVE_RE = /^#[ \t]*(syntax|escape|check)[ \t]*=[ \t]*\S/i;
const DOCKER_HEREDOC_RE = /<<(-?)(?:"([^"\r\n]+)"|'([^'\r\n]+)'|([A-Za-z_][A-Za-z0-9_]*))/g;
const blankKeep = (s) => s.replace(/[^\n\r\u2028\u2029]/g, ' ');

export function stripDockerfileCommentsDetailed(source) {
  if (typeof source !== 'string') throw new TypeError('stripDockerfileComments: source must be a string');
  const parts = source.split(/(\r\n|\n)/);
  const issues = [];
  const outParts = [];
  let directives = true;
  let pending = []; // here-document delimiters waiting for their body
  let instr = ''; // keyword of the logical instruction being read
  let continued = false;
  let heredocFrom = 0;
  let lineNo = 0;
  for (let p = 0; p < parts.length; p += 2) {
    const line = parts[p];
    const eol = parts[p + 1] === undefined ? '' : parts[p + 1];
    lineNo++;
    if (pending.length) {
      outParts.push(line, eol);
      const cmp = pending[0].dash ? line.replace(/^\t+/, '') : line;
      if (cmp === pending[0].word) pending.shift();
      continue;
    }
    if (directives) {
      if (DOCKER_DIRECTIVE_RE.test(line)) {
        outParts.push(line, eol);
        continue;
      }
      directives = false;
    }
    if (/^[ \t]*#/.test(line)) {
      outParts.push(blankKeep(line), eol);
      continue;
    }
    if (!continued) {
      const m = /^[ \t]*([A-Za-z]+)/.exec(line);
      instr = m ? m[1].toUpperCase() : '';
    }
    continued = /\\[ \t\r]*$/.test(line);
    if (instr === 'RUN' || instr === 'COPY' || instr === 'ADD') {
      DOCKER_HEREDOC_RE.lastIndex = 0;
      let m;
      while ((m = DOCKER_HEREDOC_RE.exec(line)) !== null) {
        pending.push({ word: m[2] || m[3] || m[4], dash: m[1] === '-' });
        heredocFrom = lineNo;
      }
    }
    outParts.push(line, eol);
  }
  if (pending.length) issues.push({ kind: 'unterminated-heredoc', line: heredocFrom });
  return { text: outParts.join(''), issues };
}

export function stripDockerfileComments(source) {
  return stripDockerfileCommentsDetailed(source).text;
}

// ---------------------------------------------------------------------------------------------
// DOTENV (.env, .env.*, *.env)
// ---------------------------------------------------------------------------------------------
// Dotenv parsers DISAGREE about trailing comments (`KEY=v # c`: a comment for some, part of the
// value for `docker run --env-file`), so only FULL-LINE `#` comments are removed -- the safe
// direction. A full-line `#` inside a multi-line quoted value is data and is kept.

export function stripDotenvCommentsDetailed(source) {
  if (typeof source !== 'string') throw new TypeError('stripDotenvComments: source must be a string');
  const parts = source.split(/(\r\n|\n)/);
  const issues = [];
  const outParts = [];
  let open = ''; // quote character of a multi-line value still open
  let openLine = 0;
  let lineNo = 0;
  const closeIn = (text, q, from) => {
    for (let j = from; j < text.length; j++) {
      if (q !== '`' && q !== "'" && text[j] === '\\') {
        j++;
        continue;
      }
      if (text[j] === q) return j;
    }
    return -1;
  };
  for (let p = 0; p < parts.length; p += 2) {
    const line = parts[p];
    const eol = parts[p + 1] === undefined ? '' : parts[p + 1];
    lineNo++;
    if (open !== '') {
      outParts.push(line, eol);
      if (closeIn(line, open, 0) !== -1) open = '';
      continue;
    }
    if (/^[ \t]*#/.test(line)) {
      outParts.push(blankKeep(line), eol);
      continue;
    }
    outParts.push(line, eol);
    const m = /^[ \t]*(?:export[ \t]+)?[A-Za-z_][A-Za-z0-9_.-]*[ \t]*=[ \t]*(["'`])/.exec(line);
    if (m) {
      const q = m[1];
      if (closeIn(line, q, m[0].length) === -1) {
        open = q;
        openLine = lineNo;
      }
    }
  }
  if (open !== '') issues.push({ kind: 'unterminated-string', line: openLine });
  return { text: outParts.join(''), issues };
}

export function stripDotenvComments(source) {
  return stripDotenvCommentsDetailed(source).text;
}

// ---------------------------------------------------------------------------------------------
// CADDYFILE
// ---------------------------------------------------------------------------------------------
// A `#` begins a comment only at the START OF A TOKEN (after whitespace or at line start) and
// outside "..." / `...` strings and here-documents (`<<MARKER` ... MARKER).

export function stripCaddyfileCommentsDetailed(source) {
  if (typeof source !== 'string') throw new TypeError('stripCaddyfileComments: source must be a string');
  const src = source;
  const n = src.length;
  const out = src.split('');
  const issues = [];
  let i = 0;
  let wordStart = true;
  let marker = null; // here-document marker waiting for its body
  let markerPos = 0;
  const lineOf = (pos) => {
    let c = 1;
    for (let k = 0; k < pos && k < n; k++) if (src.charCodeAt(k) === 10) c++;
    return c;
  };
  while (i < n) {
    const c = src[i];
    if (c === '\n') {
      i++;
      wordStart = true;
      if (marker !== null) {
        for (;;) {
          if (i >= n) {
            issues.push({ kind: 'unterminated-heredoc', line: lineOf(markerPos) });
            break;
          }
          const e = src.indexOf('\n', i);
          const line = src.slice(i, e === -1 ? n : e).trim();
          i = e === -1 ? n : e + 1;
          if (line === marker || line.startsWith(marker + ' ') || line.startsWith(marker + '\t')) break; // `HTML 200` may follow
        }
        marker = null;
      }
      continue;
    }
    if (c === ' ' || c === '\t' || c === '\r') {
      i++;
      wordStart = true;
      continue;
    }
    if (c === '#' && wordStart) {
      let e = src.indexOf('\n', i);
      if (e === -1) e = n;
      for (let k = i; k < e; k++) if (!isLineTerm(out[k])) out[k] = ' ';
      i = e;
      continue;
    }
    if (c === '"') {
      const start = i;
      i++;
      let closed = false;
      while (i < n) {
        if (src[i] === '\\') {
          i += 2;
          continue;
        }
        if (src[i] === '"') {
          i++;
          closed = true;
          break;
        }
        i++;
      }
      if (!closed) {
        issues.push({ kind: 'unterminated-string', line: lineOf(start) });
        i = n;
      }
      wordStart = false;
      continue;
    }
    if (c === '`') {
      const start = i;
      const e = src.indexOf('`', i + 1);
      if (e === -1) {
        issues.push({ kind: 'unterminated-string', line: lineOf(start) });
        i = n;
      } else {
        i = e + 1;
      }
      wordStart = false;
      continue;
    }
    if (c === '\\') {
      i += 2;
      wordStart = false;
      continue;
    }
    if (c === '<' && wordStart && src[i + 1] === '<') {
      const m = /^<<([A-Za-z0-9_]+)[ \t]*(?=\r?\n|$)/.exec(src.slice(i, i + 200));
      if (m) {
        marker = m[1];
        markerPos = i;
        i += m[0].length;
        wordStart = false;
        continue;
      }
    }
    i++;
    wordStart = false;
  }
  if (marker !== null) issues.push({ kind: 'unterminated-heredoc', line: lineOf(markerPos) });
  return { text: out.join(''), issues };
}

export function stripCaddyfileComments(source) {
  return stripCaddyfileCommentsDetailed(source).text;
}

// ---------------------------------------------------------------------------------------------
// YAML
// ---------------------------------------------------------------------------------------------

const YAML_BLOCK_HEADER_RE =
  /^(\s*(?:-[ \t]+)*)(?:(?:"[^"]*"|'[^']*'|[^\s#'"-][^:#]*?)[ \t]*:[ \t]+)?(?:[!&]\S+[ \t]+)*([|>])([1-9]?[+-]?|[+-][1-9]?)$/;
const YAML_KEY_RE = /^("[^"]*"|'[^']*'|[^\s#'"-][^:#]*?)[ \t]*:[ \t]+/;

function yamlCanOpenQuote(line, j) {
  let k = j - 1;
  while (k >= 0 && (line[k] === ' ' || line[k] === '\t')) k--;
  const hadSpace = k < j - 1;
  if (k < 0) return true; // first thing on the line
  const p = line[k];
  if (p === ':' || p === ',' || p === '[' || p === '{') return true;
  if (p === '-' || p === '?') return hadSpace && (k === 0 || line[k - 1] === ' ' || line[k - 1] === '\t');
  if (hadSpace) {
    let s = k;
    while (s >= 0 && line[s] !== ' ' && line[s] !== '\t') s--;
    const tok = line.slice(s + 1, k + 1);
    if (tok[0] === '!' || tok[0] === '&') return true; // tag or anchor directly before the scalar
  }
  return false;
}

export function stripYamlComments(source, options = {}) {
  return stripYamlCommentsDetailed(source, options).text;
}

// `issues` are the ones raised by shell bodies (see blockScalars), with FILE line numbers; YAML itself
// has no unclosed-construct notes (an unterminated YAML quote is not reported).
export function stripYamlCommentsDetailed(source, options = {}) {
  if (typeof source !== 'string') throw new TypeError('stripYamlComments: source must be a string');
  const issues = [];
  // blockScalars: 'preserve' (default) keeps every block scalar body verbatim; 'run' removes shell
  // comments from the body of a block scalar whose KEY is `run` (a GitHub Actions step script);
  // 'comments' does the same for every block scalar.
  const mode = options.blockScalars === 'comments' ? 'comments' : options.blockScalars === 'run' ? 'run' : 'preserve';
  const parts = source.split(/(\r\n|\n|\r)/); // line, eol, line, eol, ... , line
  let quote = ''; // carried across lines: quoted scalars may span lines
  let block = null; // { parentIndent, shell, held, firstLine } while inside a block scalar body
  const outParts = [];
  const flushBlock = () => {
    // A shell body is stripped as ONE text: here-documents and quotes may span its lines.
    if (block !== null && block.held.length) {
      const r = stripShellCommentsDetailed(block.held.join(''));
      outParts.push(r.text);
      for (const x of r.issues) if (issues.length < 100) issues.push({ kind: x.kind, line: x.line + block.firstLine - 1 });
    }
    block = null;
  };
  for (let p = 0; p < parts.length; p += 2) {
    const line = parts[p];
    const eol = parts[p + 1] === undefined ? '' : parts[p + 1];

    if (block !== null) {
      const isBlank = /^[ \t]*$/.test(line);
      const indent = line.length - line.replace(/^[ \t]+/, '').length;
      if (isBlank || indent > block.parentIndent) {
        if (block.shell) block.held.push(line, eol);
        else outParts.push(line, eol);
        continue;
      }
      flushBlock();
    }

    const startedInQuote = quote !== '';
    let j = 0;
    let cut = -1;
    while (j < line.length) {
      const c = line[j];
      if (quote === "'") {
        if (c === "'") {
          if (line[j + 1] === "'") {
            j += 2;
            continue;
          }
          quote = '';
        }
        j++;
        continue;
      }
      if (quote === '"') {
        if (c === '\\') {
          j += 2;
          continue;
        }
        if (c === '"') quote = '';
        j++;
        continue;
      }
      if (c === '#' && (j === 0 || line[j - 1] === ' ' || line[j - 1] === '\t')) {
        cut = j;
        break;
      }
      if ((c === '"' || c === "'") && yamlCanOpenQuote(line, j)) {
        quote = c;
        j++;
        continue;
      }
      j++;
    }
    const code = cut >= 0 ? line.slice(0, cut) : line;
    outParts.push(cut >= 0 ? code + ' '.repeat(line.length - cut) : line, eol);

    if (quote === '' && !startedInQuote) {
      const m = YAML_BLOCK_HEADER_RE.exec(code.replace(/[ \t]+$/, ''));
      if (m) {
        const prefix = m[1];
        const hasKey = /:[ \t]+[!&|>]/.test(code.slice(prefix.length)) || /^(?:"[^"]*"|'[^']*'|[^\s#'"-][^:#]*?)[ \t]*:/.test(code.slice(prefix.length));
        let parentIndent;
        if (hasKey) parentIndent = prefix.length;
        else if (prefix.includes('-')) parentIndent = prefix.lastIndexOf('-');
        else parentIndent = prefix.length - 1;
        const km = YAML_KEY_RE.exec(code.slice(prefix.length));
        const keyName = km ? km[1].replace(/^(["'])(.*)\1$/, '$2').trim() : null;
        block = { parentIndent, shell: mode === 'comments' || (mode === 'run' && keyName === 'run'), held: [], firstLine: p / 2 + 2 };
      }
    }
  }
  flushBlock();
  return { text: outParts.join(''), issues };
}

// ---------------------------------------------------------------------------------------------
// SELF-TEST
// ---------------------------------------------------------------------------------------------
// Design: data-driven cases + invariants + KNOWN-WRONG controls. A control is a deliberately naive
// stripper; the self-test passes a "lethality" check only if the control FAILS the case it is
// meant to fail, while the real stripper passes it. A case whose markers are not even present in
// its input is itself an error (that would be a vacuous pass).

const bt = (s) => s.replaceAll('§', '`'); // '§' stands for a backtick inside test sources

function shapeProblem(input, output) {
  if (output.length !== input.length) return `length ${input.length} -> ${output.length}`;
  for (let k = 0; k < input.length; k++) {
    const a = input[k];
    const b = output[k];
    if (a === b) continue;
    if (isLineTerm(a)) return `line terminator altered at offset ${k}`;
    if (b !== ' ') return `non-blank replacement at offset ${k}`;
  }
  return null;
}

function countOf(hay, needle) {
  let c = 0;
  let from = 0;
  for (;;) {
    const k = hay.indexOf(needle, from);
    if (k === -1) return c;
    c++;
    from = k + needle.length;
  }
}

const IMPLS = {
  js: (s, o) => stripCommentsDetailed(s, o),
  sql: (s) => stripSqlCommentsDetailed(s),
  yaml: (s, o) => stripYamlCommentsDetailed(s, o),
  sh: (s) => stripShellCommentsDetailed(s),
  docker: (s) => stripDockerfileCommentsDetailed(s),
  dotenv: (s) => stripDotenvCommentsDetailed(s),
  caddy: (s) => stripCaddyfileCommentsDetailed(s),
};

// Returns a list of problems (empty = case passes). Never contains source content, only the
// case's own marker names (which are fictional labels).
function judge(c, impl) {
  const problems = [];
  let res;
  try {
    res = impl(c.input, c.opts);
  } catch (e) {
    return [`threw ${e && e.name}`];
  }
  const text = res.text;
  const sp = shapeProblem(c.input, text);
  if (sp) problems.push(`shape: ${sp}`);
  for (const s of c.survive || []) if (!text.includes(s)) problems.push(`lost code marker ${JSON.stringify(s)}`);
  for (const v of c.vanish || []) if (text.includes(v)) problems.push(`comment marker survived ${JSON.stringify(v)}`);
  for (const [tok, want] of c.counts || []) {
    const got = countOf(text, tok);
    if (got !== want) problems.push(`count(${tok}) = ${got}, wanted ${want}`);
  }
  if (c.issues) {
    const kinds = res.issues.map((x) => x.kind).sort().join(',');
    const want = [...c.issues].sort().join(',');
    if (kinds !== want) problems.push(`issues [${kinds}] != [${want}]`);
  } else if (c.noIssues && res.issues.length) {
    problems.push(`unexpected issues [${res.issues.map((x) => x.kind).join(',')}]`);
  }
  return problems;
}

function caseIsNonVacuous(c) {
  const bad = [];
  const n = (c.survive || []).length + (c.vanish || []).length + (c.counts || []).length + (c.issues ? 1 : 0);
  if (n === 0) bad.push('no assertions');
  for (const s of c.survive || []) if (!c.input.includes(s)) bad.push(`survive marker absent from input: ${JSON.stringify(s)}`);
  for (const v of c.vanish || []) if (!c.input.includes(v)) bad.push(`vanish marker absent from input: ${JSON.stringify(v)}`);
  for (const [tok, want] of c.counts || []) {
    if (want === 0 && !c.input.includes(tok)) bad.push(`count-0 token absent from input: ${tok}`);
  }
  return bad;
}

const CASES = [
  // ---------------------------------------------------------------- JS / TS / TSX
  { name: 'js/line-comment', kind: 'js', input: 'const a = 1; // CMT_J1\nconst b = 2;\n', survive: ['const a = 1;', 'const b = 2;'], vanish: ['CMT_J1'], noIssues: true },
  { name: 'js/block-comment-multiline', kind: 'js', input: 'x();\n/* CMT_J2\n   still CMT_J2 */\ny();\n', survive: ['x();', 'y();'], vanish: ['CMT_J2'], noIssues: true },
  { name: 'js/string-with-slashes', kind: 'js', input: 'const u = "http://host.test/a"; // CMT_J3\nconst v = \'a /* KEEP_J3 */ b\';\n', survive: ['http://host.test/a', 'a /* KEEP_J3 */ b'], vanish: ['CMT_J3'] },
  { name: 'js/escaped-quote-in-string', kind: 'js', input: 'const s = "say \\" // KEEP_J4"; // CMT_J4\nconst t = 1;', survive: ['// KEEP_J4', 'const t = 1;'], vanish: ['CMT_J4'] },
  { name: 'js/string-escaped-backslash-then-quote', kind: 'js', input: 'const s = "a\\\\"; // CMT_J36 "\nconst k = 26;', survive: ['"a\\\\"', 'const k = 26;'], vanish: ['CMT_J36'] },
  { name: 'js/string-line-continuation', kind: 'js', input: "const s = 'a \\\n // KEEP_J5 \\\n b'; // CMT_J5\nconst t = 2;", survive: ['// KEEP_J5', 'const t = 2;'], vanish: ['CMT_J5'] },
  { name: 'js/template-text-slashes', kind: 'js', input: bt('const t = §a // KEEP_J6 b /* KEEP_J6b */§; // CMT_J6\nconst z = 1;'), survive: ['// KEEP_J6 b', '/* KEEP_J6b */', 'const z = 1;'], vanish: ['CMT_J6'] },
  { name: 'js/template-escaped-backtick', kind: 'js', input: bt('const t = §a \\§ // KEEP_J35 b§; // CMT_J35\nconst k = 25;'), survive: ['// KEEP_J35 b', 'const k = 25;'], vanish: ['CMT_J35'] },
  { name: 'js/template-expr-comment', kind: 'js', input: bt('const t = §x ${ y /* CMT_J7 */ } z // KEEP_J7§; // CMT_J7b\nconst k = 1;'), survive: ['} z // KEEP_J7', 'const k = 1;'], vanish: ['CMT_J7'] },
  { name: 'js/template-nested', kind: 'js', input: bt('const t = §o ${ §i ${ q /* CMT_J8 */ } // KEEP_J8§ } // KEEP_J8b§; // CMT_J8b\nconst k = 2;'), survive: ['// KEEP_J8', '// KEEP_J8b', 'const k = 2;'], vanish: ['CMT_J8'] },
  { name: 'js/template-expr-line-comment', kind: 'js', input: bt('const t = §a ${\n  y // CMT_J9\n} b // KEEP_J9§;\nconst k = 3;'), survive: ['} b // KEEP_J9', 'const k = 3;'], vanish: ['CMT_J9'] },
  { name: 'js/template-brace-in-expr', kind: 'js', input: bt('const t = §${ {a: 1}.a } // KEEP_J10§; // CMT_J10\nconst k = 4;'), survive: ['{a: 1}.a', '// KEEP_J10', 'const k = 4;'], vanish: ['CMT_J10'] },
  { name: 'js/regex-slashes', kind: 'js', input: 'const r = /\\/\\/ KEEP_J11/g; // CMT_J11\nconst k = 5;', survive: ['/\\/\\/ KEEP_J11/g', 'const k = 5;'], vanish: ['CMT_J11'] },
  { name: 'js/regex-class-with-comment-opener', kind: 'js', input: 'const r = /[/*]x/; const k = 6;\n// CMT_J12\nconst m = /y*/; const q = /[///] KEEP_J12/; const z = 6;\n', survive: ['/[/*]x/', 'const k = 6;', 'const m = /y*/;', '/[///] KEEP_J12/', 'const z = 6;'], vanish: ['CMT_J12'] },
  { name: 'js/regex-ending-in-escaped-slash', kind: 'js', input: 'if (/^https?:\\/\\//.test(u)) go(); // CMT_J33\nconst k = 21;', survive: ['/^https?:\\/\\//.test(u)', 'const k = 21;'], vanish: ['CMT_J33'] },
  { name: 'js/division-not-regex', kind: 'js', input: "const q = a / b; // CMT_J13 don't / x\nconst w = c / d; const k = 7;", survive: ['a / b', 'c / d', 'const k = 7;'], vanish: ['CMT_J13'] },
  { name: 'js/division-after-paren-bracket-postfix', kind: 'js', input: 'const q = (a + b) / 2; // CMT_J14 / end\nconst r = arr[0] / 2; // CMT_J14b / end\nlet i = 0; const s = i++ / 2; // CMT_J14c / end\nconst t = 7 / 2; // CMT_J14d / end\nconst k = 8;', survive: ['(a + b) / 2', 'arr[0] / 2', 'i++ / 2', '7 / 2', 'const k = 8;'], vanish: ['CMT_J14'] },
  { name: 'js/regex-after-return-arrow-array', kind: 'js', input: 'function f(s) { return /[//] KEEP_J15/.test(s); } // CMT_J15\nconst g = (s) => /[//] KEEP_J15b/.exec(s); // CMT_J15b\nconst h = [/[//] KEEP_J15c/, /e/];\nconst k = 9;', survive: ['/[//] KEEP_J15/.test', '/[//] KEEP_J15b/.exec', '/[//] KEEP_J15c/', 'const k = 9;'], vanish: ['CMT_J15'] },
  { name: 'js/regex-with-quote-char', kind: 'js', input: "const r = s.replace(/'/g, ''); // CMT_J16\nconst k = 10;", survive: ["/'/g", 'const k = 10;'], vanish: ['CMT_J16'] },
  { name: 'js/jsx-text-slashes', kind: 'js', input: 'const el = (<p>see http://host.test // KEEP_J17</p>); // CMT_J17\nconst k = 11;', survive: ['http://host.test // KEEP_J17</p>', 'const k = 11;'], vanish: ['CMT_J17'] },
  { name: 'js/jsx-text-apostrophe', kind: 'js', input: "const el = <p>don't {x} stop</p>; // CMT_J18\nconst k = 12;", survive: ["don't {x} stop</p>", 'const k = 12;'], vanish: ['CMT_J18'] },
  { name: 'js/jsx-comment-container-and-attr', kind: 'js', input: 'const el = (\n  <div className="a // KEEP_J19" onClick={() => go("/x") /* CMT_J19 */}>\n    {/* CMT_J19b */}\n    <b>KEEP_J19b</b>\n  </div>\n);\nconst k = 13;', survive: ['"a // KEEP_J19"', 'KEEP_J19b', 'const k = 13;'], vanish: ['CMT_J19'] },
  { name: 'js/jsx-selfclosing-and-fragment', kind: 'js', input: 'const el = <><br /><img src="//cdn.test/x.png" alt="" /> text // KEEP_J20 </>; // CMT_J20\nconst k = 14;', survive: ['//cdn.test/x.png', 'text // KEEP_J20 </>', 'const k = 14;'], vanish: ['CMT_J20'] },
  { name: 'js/jsx-template-in-attr', kind: 'js', input: bt('const el = <a href={§/x/${id /* CMT_J21 */}§} title="t">go // KEEP_J21</a>;\nconst k = 15;'), survive: ['go // KEEP_J21</a>', 'const k = 15;'], vanish: ['CMT_J21'] },
  { name: 'js/jsx-comments-between-attributes', kind: 'js', input: 'const el = <div /* CMT_J30 */ a="1" // CMT_J30b\n  b="2">KEEP_J30 // text</div>;\nconst k = 23;', survive: ['KEEP_J30 // text</div>', 'const k = 23;'], vanish: ['CMT_J30'] },
  { name: 'js/jsx-spread-attribute', kind: 'js', input: 'const el = <div {...p /* CMT_J31 */} id="x">KEEP_J31 // text</div>;\nconst k = 24;', survive: ['KEEP_J31 // text</div>', 'const k = 24;'], vanish: ['CMT_J31'] },
  { name: 'js/failed-jsx-attempt-restores-what-it-blanked', kind: 'js', input: "const x = <T>it's {/* KEEP_J34 */} here'</Z>;\nconst y = 1; // CMT_J34\nconst k = 22;", survive: ["'s {/* KEEP_J34 */} here'", 'const k = 22;'], vanish: ['CMT_J34'] },
  { name: 'js/tsx-generic-arrow-rolls-back', kind: 'js', input: 'const id = <T,>(x: T) => x; // CMT_J22\nconst f = <T extends object>(x: T) => x; // CMT_J22b\nconst k = 16;', survive: ['<T,>(x: T) => x', '<T extends object>(x: T) => x', 'const k = 16;'], vanish: ['CMT_J22'] },
  { name: 'ts/type-assertion-jsx-off', kind: 'js', opts: { jsx: false }, input: 'const x = <any>y; const s = "</div>"; // CMT_J23\nconst k = 17;', survive: ['<any>y', '"</div>"', 'const k = 17;'], vanish: ['CMT_J23'] },
  { name: 'ts/type-assertion-jsx-on-mismatch-rolls-back', kind: 'js', input: 'const x = <any>y; const s = "</div>"; // CMT_J24\nconst k = 18;', survive: ['<any>y', '"</div>"', 'const k = 18;'], vanish: ['CMT_J24'] },
  { name: 'js/unterminated-string-resyncs-at-newline', kind: 'js', input: "const a = 'oops;\nconst b = 1; // CMT_J25\n", survive: ['const b = 1;'], vanish: ['CMT_J25'], issues: ['unterminated-string'] },
  { name: 'js/unterminated-block-comment-reported', kind: 'js', input: 'const a = 1;\n/* CMT_J26 never closed\nconst b = 2;\n', survive: ['const a = 1;'], vanish: ['CMT_J26', 'const b = 2;'], issues: ['unterminated-block-comment'] },
  { name: 'js/hashbang', kind: 'js', input: "#!/usr/bin/env node --flag='CMT_J27\nconst k = 19; // CMT_J27b\n", survive: ['const k = 19;'], vanish: ['CMT_J27'] },
  { name: 'js/crlf-and-line-separator', kind: 'js', input: 'a(); // CMT_J28\r\nb(); /* CMT_J28b */ c();\r\nd(); // CMT_J28c\u2028e();\r\n', survive: ['b();', 'c();', 'e();'], vanish: ['CMT_J28'] },
  { name: 'js/property-named-like-keyword-is-division', kind: 'js', input: 'const q = o.return / 2; // CMT_J29 / end\nconst r = o.in / 4; // CMT_J29b / end\nconst k = 20;', survive: ['o.return / 2', 'o.in / 4', 'const k = 20;'], vanish: ['CMT_J29'] },
  // The historic lesson, as a pair: documented absence must not match; the same token in real
  // code must (otherwise the scan could never fail).
  { name: 'js/documented-absence-does-not-match', kind: 'js', input: '/**\n * This module never touches FORBIDDEN_TOKEN (documented absence).\n */\n// also: no FORBIDDEN_TOKEN here\nexport const ok = 1;\n', survive: ['export const ok = 1;'], counts: [['FORBIDDEN_TOKEN', 0]] },
  { name: 'js/forbidden-token-in-real-code-still-matches', kind: 'js', input: 'export const x = FORBIDDEN_TOKEN; // FORBIDDEN_TOKEN\n', survive: ['x = FORBIDDEN_TOKEN;'], counts: [['FORBIDDEN_TOKEN', 1]] },
  { name: 'js/forbidden-token-in-string-still-matches', kind: 'js', input: 'export const x = "FORBIDDEN_TOKEN // not a comment";\n', counts: [['FORBIDDEN_TOKEN', 1]] },
  // ---------------------------------------------------------------- SQL
  { name: 'sql/line-comment', kind: 'sql', input: 'SELECT 1; -- CMT_S1\nSELECT 2;\n', survive: ['SELECT 1;', 'SELECT 2;'], vanish: ['CMT_S1'], noIssues: true },
  { name: 'sql/dashes-in-string', kind: 'sql', input: "INSERT INTO t VALUES ('a -- KEEP_S2'); -- CMT_S2\n", survive: ["'a -- KEEP_S2'"], vanish: ['CMT_S2'] },
  { name: 'sql/doubled-quote-string', kind: 'sql', input: "SELECT 'it''s -- KEEP_S3 /* KEEP_S3b */'; -- CMT_S3\nSELECT 1;", survive: ["'it''s -- KEEP_S3 /* KEEP_S3b */'", 'SELECT 1;'], vanish: ['CMT_S3'] },
  { name: 'sql/nested-block-comment', kind: 'sql', input: '/* CMT_S4 /* inner CMT_S4 */ still CMT_S4 */ SELECT 4;\n', survive: ['SELECT 4;'], vanish: ['CMT_S4'] },
  { name: 'sql/quoted-identifier', kind: 'sql', input: 'SELECT "a"" -- KEEP_S5", "c -- KEEP_S5b" FROM t; -- CMT_S5\n', survive: ['"a"" -- KEEP_S5"', '"c -- KEEP_S5b"'], vanish: ['CMT_S5'] },
  { name: 'sql/escape-string-backslash-quote', kind: 'sql', input: "SELECT E'it\\'s -- KEEP_S6'; -- CMT_S6\nSELECT 6;", survive: ['-- KEEP_S6', 'SELECT 6;'], vanish: ['CMT_S6'] },
  { name: 'sql/escape-string-with-doubled-quote', kind: 'sql', input: "SELECT E'it''s \\' -- KEEP_S3c'; -- CMT_S3c\nSELECT 3;", survive: ["-- KEEP_S3c'", 'SELECT 3;'], vanish: ['CMT_S3c'] },
  { name: 'sql/plain-string-backslash-is-literal', kind: 'sql', input: "SELECT 'C:\\'; -- CMT_S7\nSELECT 7;", survive: ["'C:\\'", 'SELECT 7;'], vanish: ['CMT_S7'] },
  { name: 'sql/dollar-body-comments-stripped-strings-kept', kind: 'sql', input: "DO $$\nBEGIN\n  -- CMT_S8 inside body\n  PERFORM 'x -- KEEP_S8';\nEND\n$$; -- CMT_S8b\nSELECT 8;\n", survive: ["'x -- KEEP_S8'", 'SELECT 8;'], vanish: ['CMT_S8'], noIssues: true },
  { name: 'sql/dollar-tag-and-positional-param', kind: 'sql', input: 'SELECT $1, $fn$ a -- CMT_S9 $fn$; -- CMT_S9b\nSELECT 9;', survive: ['SELECT $1', 'SELECT 9;'], vanish: ['CMT_S9'] },
  { name: 'sql/body-comment-cannot-swallow-closer', kind: 'sql', input: 'SELECT $$ x -- CMT_S10 $$; SELECT 10; -- CMT_S10b\n', survive: ['SELECT 10;'], vanish: ['CMT_S10'] },
  { name: 'sql/unterminated-block-reported', kind: 'sql', input: 'SELECT 1; /* CMT_S11 never closed\nSELECT 2;', survive: ['SELECT 1;'], vanish: ['CMT_S11'], issues: ['unterminated-block-comment'] },
  { name: 'sql/documented-absence-does-not-match', kind: 'sql', input: '-- This migration never uses FORBIDDEN_TOKEN\nCREATE TABLE t (id int); /* no FORBIDDEN_TOKEN either */\n', survive: ['CREATE TABLE t (id int);'], counts: [['FORBIDDEN_TOKEN', 0]] },
  { name: 'sql/forbidden-token-in-real-sql-still-matches', kind: 'sql', input: 'CREATE TABLE FORBIDDEN_TOKEN (id int); -- FORBIDDEN_TOKEN\n', counts: [['FORBIDDEN_TOKEN', 1]] },
  // ---------------------------------------------------------------- YAML
  { name: 'yaml/full-line-and-trailing', kind: 'yaml', input: '# CMT_Y1\nkey: value # CMT_Y1b\nother: 2\n', survive: ['key: value', 'other: 2'], vanish: ['CMT_Y1'] },
  { name: 'yaml/hash-without-leading-space-is-content', kind: 'yaml', input: 'url: http://host.test/a#KEEP_Y2 # CMT_Y2\nnext: 1\n', survive: ['http://host.test/a#KEEP_Y2', 'next: 1'], vanish: ['CMT_Y2'] },
  { name: 'yaml/double-quoted', kind: 'yaml', input: 'key: "a # KEEP_Y3 b" # CMT_Y3\nnext: 1\n', survive: ['"a # KEEP_Y3 b"', 'next: 1'], vanish: ['CMT_Y3'] },
  { name: 'yaml/single-quoted-doubled', kind: 'yaml', input: "key: 'it''s # KEEP_Y4' # CMT_Y4\nnext: 1\n", survive: ["'it''s # KEEP_Y4'", 'next: 1'], vanish: ['CMT_Y4'] },
  { name: 'yaml/multiline-double-quoted', kind: 'yaml', input: 'key: "first line\n  # KEEP_Y5 still inside the quotes\n  end" # CMT_Y5\nnext: 1\n', survive: ['# KEEP_Y5 still inside the quotes', 'next: 1'], vanish: ['CMT_Y5'] },
  { name: 'yaml/apostrophe-in-plain-scalar', kind: 'yaml', input: "msg: don't panic # CMT_Y6\nnext: 1\n", survive: ["don't panic", 'next: 1'], vanish: ['CMT_Y6'] },
  { name: 'yaml/block-scalar-preserved-by-default', kind: 'yaml', input: 'run: |\n  echo hi # KEEP_Y7\n  # KEEP_Y7b\nnext: 1 # CMT_Y7\n', survive: ['echo hi # KEEP_Y7', '# KEEP_Y7b', 'next: 1'], vanish: ['CMT_Y7'] },
  { name: 'yaml/block-scalar-shell-comments-mode', kind: 'yaml', opts: { blockScalars: 'comments' }, input: 'run: |\n  echo hi # CMT_Y8\n  echo "a # KEEP_Y8"\n  # CMT_Y8b\nnext: 1 # CMT_Y8c\n', survive: ['echo hi', 'echo "a # KEEP_Y8"', 'next: 1'], vanish: ['CMT_Y8'] },
  { name: 'yaml/seq-item-block-scalar-ends-on-dedent', kind: 'yaml', input: 'steps:\n  - name: x\n    run: |\n      echo # KEEP_Y9\n  - name: y # CMT_Y9\n', survive: ['echo # KEEP_Y9', '- name: y'], vanish: ['CMT_Y9'] },
  { name: 'yaml/seq-dash-block-scalar-key-inline', kind: 'yaml', input: 'steps:\n  - run: |\n      echo # KEEP_Y10\n  - run: echo ok # CMT_Y10\n', survive: ['echo # KEEP_Y10', 'echo ok'], vanish: ['CMT_Y10'] },
  { name: 'yaml/tag-then-quote', kind: 'yaml', input: 'key: !!str "a # KEEP_Y11" # CMT_Y11\nnext: 1\n', survive: ['"a # KEEP_Y11"', 'next: 1'], vanish: ['CMT_Y11'] },
  { name: 'yaml/flow-sequence-quotes', kind: 'yaml', input: 'list: ["a # KEEP_Y12", \'b # KEEP_Y12b\'] # CMT_Y12\nnext: 1\n', survive: ['"a # KEEP_Y12"', "'b # KEEP_Y12b'", 'next: 1'], vanish: ['CMT_Y12'] },
  { name: 'yaml/sequence-items-quoted', kind: 'yaml', input: 'list:\n  - "a # KEEP_Y14"\n  - \'b # KEEP_Y14b\' # CMT_Y14\n  - c # CMT_Y14c\n', survive: ['"a # KEEP_Y14"', "'b # KEEP_Y14b'", '- c'], vanish: ['CMT_Y14'] },
  { name: 'yaml/crlf', kind: 'yaml', input: 'a: 1 # CMT_Y13\r\nb: 2\r\n', survive: ['a: 1', 'b: 2'], vanish: ['CMT_Y13'] },
  { name: 'yaml/documented-absence-does-not-match', kind: 'yaml', input: '# never uses FORBIDDEN_TOKEN\nkey: value # no FORBIDDEN_TOKEN\n', survive: ['key: value'], counts: [['FORBIDDEN_TOKEN', 0]] },
  { name: 'yaml/forbidden-token-in-real-value-still-matches', kind: 'yaml', input: 'key: FORBIDDEN_TOKEN # FORBIDDEN_TOKEN\n', counts: [['FORBIDDEN_TOKEN', 1]] },
  // -- YAML block scalars: header indicators, tags, anchors, quoted keys (a missed header makes the
  //    body parse as YAML, where ` #` starts a comment and REAL CONTENT is blanked) -----------------
  { name: 'yaml/block-header-chomp-and-indent-indicators', kind: 'yaml', input: 'a: |-\n  echo "build #1" # KEEP_Y15\nb: >+\n  x # KEEP_Y15b\nc: |2\n    y # KEEP_Y15c\nd: >2-\n  w # KEEP_Y15d\nz: 1 # CMT_Y15\n', survive: ['echo "build #1" # KEEP_Y15', 'x # KEEP_Y15b', 'y # KEEP_Y15c', 'w # KEEP_Y15d', 'z: 1'], vanish: ['CMT_Y15'] },
  { name: 'yaml/block-header-tag-and-anchor', kind: 'yaml', input: 'a: !!str |\n  x # KEEP_Y16\nb: &anc >\n  y # KEEP_Y16b\nc: !!str &an2 |-\n  w # KEEP_Y16c\nz: 1 # CMT_Y16\n', survive: ['x # KEEP_Y16', 'y # KEEP_Y16b', 'w # KEEP_Y16c', 'z: 1'], vanish: ['CMT_Y16'] },
  { name: 'yaml/block-header-quoted-key', kind: 'yaml', input: '"run": |\n  x # KEEP_Y17\n\'k:y\': >-\n  y # KEEP_Y17b\nz: 1 # CMT_Y17\n', survive: ['x # KEEP_Y17', 'y # KEEP_Y17b', 'z: 1'], vanish: ['CMT_Y17'] },
  { name: 'yaml/block-header-in-sequence-with-key-and-chomp', kind: 'yaml', input: 'steps:\n  - run: |-\n      echo "a #b" # KEEP_Y24\n  - run: echo ok # CMT_Y24\n', survive: ['echo "a #b" # KEEP_Y24', 'echo ok'], vanish: ['CMT_Y24'] },
  { name: 'yaml/double-quoted-backslash-escape', kind: 'yaml', input: 'k: "say \\"hi # KEEP_Y18\\" now" # CMT_Y18\nn: 1\n', survive: ['"say \\"hi # KEEP_Y18\\" now"', 'n: 1'], vanish: ['CMT_Y18'] },
  { name: 'yaml/double-quoted-escaped-backslash-then-quote', kind: 'yaml', input: 'k: "a\\\\" # CMT_Y25\nn: 1 # CMT_Y25b\n', survive: ['"a\\\\"', 'n: 1'], vanish: ['CMT_Y25'] },
  { name: 'yaml/run-mode-reports-unclosed-shell-constructs', kind: 'yaml', opts: { blockScalars: 'run' }, input: 'steps:\n  - run: |\n      echo "oops\n      # KEEP_Y30 inside the open string\n', survive: ['# KEEP_Y30 inside the open string'], issues: ['unterminated-string'] },
  { name: 'yaml/default-mode-reports-nothing-about-shell-bodies', kind: 'yaml', input: 'steps:\n  - run: |\n      echo "oops\n', survive: ['echo "oops'], noIssues: true },
  { name: 'yaml/closing-line-of-a-multi-line-quote-is-not-a-block-header', kind: 'yaml', input: "k: 'open\na': |\n  text # CMT_Y29\nz: 1\n", survive: ['text', 'z: 1'], vanish: ['CMT_Y29'] },
  // -- YAML run-mode: shell comments are removed from `run:` bodies ONLY ---------------------------------
  { name: 'yaml/run-mode-strips-shell-comments-in-run-bodies-only', kind: 'yaml', opts: { blockScalars: 'run' }, input: 'steps:\n  - run: |\n      # CMT_Y19 documented absence\n      echo hi # CMT_Y19b\n      echo "a # KEEP_Y19"\n      cat <<EOS\n      # KEEP_Y19b\n      EOS\n  - name: x\n    with:\n      body: |\n        # KEEP_Y19c heading is content\n  - run: |-\n      # CMT_Y19d\n      echo KEEP_Y19e\n', survive: ['echo hi', 'echo "a # KEEP_Y19"', '# KEEP_Y19b', '# KEEP_Y19c heading is content', 'echo KEEP_Y19e'], vanish: ['CMT_Y19', 'CMT_Y19b', 'CMT_Y19d'] },
  { name: 'yaml/run-mode-quoted-key-and-bare-sequence-dash', kind: 'yaml', opts: { blockScalars: 'run' }, input: 'steps:\n  - "run": |\n      # CMT_Y20\n      echo KEEP_Y20\n  - |\n    # KEEP_Y20b a bare sequence item has no key, so it is not a run body\n', survive: ['echo KEEP_Y20', '# KEEP_Y20b'], vanish: ['CMT_Y20'] },
  { name: 'yaml/run-mode-key-must-be-exactly-run', kind: 'yaml', opts: { blockScalars: 'run' }, input: 'env:\n  SCRIPT: |\n    # KEEP_Y21 key is SCRIPT\n  rerun: |\n    # KEEP_Y21b key is rerun\n  run-extra: |\n    # KEEP_Y21c key is run-extra\n', survive: ['# KEEP_Y21 key is SCRIPT', '# KEEP_Y21b', '# KEEP_Y21c'], counts: [['KEEP_Y21', 3]] },
  { name: 'yaml/run-mode-body-at-end-of-file-without-newline', kind: 'yaml', opts: { blockScalars: 'run' }, input: 'steps:\n  - run: |\n      echo hi # CMT_Y22', survive: ['echo hi'], vanish: ['CMT_Y22'] },
  { name: 'yaml/run-mode-dedent-ends-the-body', kind: 'yaml', opts: { blockScalars: 'run' }, input: 'steps:\n  - run: |\n      echo a # CMT_Y23\n  - name: y # CMT_Y23b\n    note: z # CMT_Y23c\n', survive: ['echo a', '- name: y', 'note: z'], vanish: ['CMT_Y23'] },
  { name: 'yaml/run-mode-quotes-span-lines-in-shell', kind: 'yaml', opts: { blockScalars: 'run' }, input: "steps:\n  - run: |\n      echo 'first\n      # KEEP_Y26 inside a multi-line quote\n      second' # CMT_Y26\n", survive: ['# KEEP_Y26 inside a multi-line quote', "second'"], vanish: ['CMT_Y26'] },
  { name: 'yaml/run-mode-documented-absence-does-not-match', kind: 'yaml', opts: { blockScalars: 'run' }, input: 'jobs:\n  a:\n    steps:\n      - run: |\n          # documented absence of FORBIDDEN_TOKEN\n          echo hi\n', survive: ['echo hi'], counts: [['FORBIDDEN_TOKEN', 0]] },
  { name: 'yaml/run-mode-forbidden-token-in-real-script-still-matches', kind: 'yaml', opts: { blockScalars: 'run' }, input: 'jobs:\n  a:\n    steps:\n      - run: |\n          FORBIDDEN_TOKEN=1 # FORBIDDEN_TOKEN\n', counts: [['FORBIDDEN_TOKEN', 1]] },
  { name: 'yaml/default-mode-keeps-run-body-comments (documented, the safe direction)', kind: 'yaml', input: 'steps:\n  - run: |\n      echo hi # KEEP_Y27\n', survive: ['echo hi # KEEP_Y27'] },
  { name: 'yaml/comments-mode-strips-every-block-scalar', kind: 'yaml', opts: { blockScalars: 'comments' }, input: 'a: |\n  x # CMT_Y28\nb: >\n  y # CMT_Y28b\n  z\n', survive: ['x', 'y', 'z'], vanish: ['CMT_Y28'] },
  // -- JS: CRLF continuation, JSX dotted/namespaced names and nested elements, template notes ------------
  { name: 'js/string-crlf-line-continuation', kind: 'js', input: "const s = 'a \\\r\n // KEEP_J37 \\\r\n b'; // CMT_J37\r\nconst t = 27;", survive: ['// KEEP_J37', 'const t = 27;'], vanish: ['CMT_J37'] },
  { name: 'js/jsx-dotted-and-namespaced-names', kind: 'js', input: 'const el = <Foo.Bar a="1">see http://h.test // KEEP_J38</Foo.Bar>; // CMT_J38\nconst el2 = <svg:rect x="1">see http://h.test // KEEP_J38b</svg:rect>; // CMT_J38b\nconst el3 = <my-el>see http://h.test // KEEP_J38c</my-el>; // CMT_J38c\nconst k = 28;', survive: ['// KEEP_J38</Foo.Bar>', '// KEEP_J38b</svg:rect>', '// KEEP_J38c</my-el>', 'const k = 28;'], vanish: ['CMT_J38'] },
  { name: 'js/jsx-nested-elements', kind: 'js', input: 'const el = <div><span>a // KEEP_J39</span><b>{/* CMT_J39 */}c // KEEP_J39b</b></div>; // CMT_J39b\nconst k = 29;', survive: ['a // KEEP_J39</span>', 'c // KEEP_J39b</b>', 'const k = 29;'], vanish: ['CMT_J39'] },
  { name: 'js/jsx-nested-element-as-attribute-value', kind: 'js', input: 'const el = <A icon=<I>x // KEEP_J42</I> b="1">t // KEEP_J42b</A>; // CMT_J42\nconst k = 31;', survive: ['x // KEEP_J42</I>', 't // KEEP_J42b</A>', 'const k = 31;'], vanish: ['CMT_J42'] },
  { name: 'js/regex-after-spread', kind: 'js', input: 'const a = [.../[//] KEEP_J44/.exec(s)]; // CMT_J44\nconst k = 32;', survive: ['/[//] KEEP_J44/.exec(s)', 'const k = 32;'], vanish: ['CMT_J44'] },
  { name: 'js/division-after-closing-brace', kind: 'js', input: 'const x = {} / 2; // CMT_J45\nconst k = 33;', survive: ['{} / 2;', 'const k = 33;'], vanish: ['CMT_J45'] },
  { name: 'js/regex-after-opening-brace', kind: 'js', input: 'if (a) { /[//] KEEP_J46/.test(s); } // CMT_J46\nconst k = 34;', survive: ['/[//] KEEP_J46/.test(s)', 'const k = 34;'], vanish: ['CMT_J46'] },
  { name: 'js/regex-after-binary-plus-minus', kind: 'js', input: 'const v = 1 + /[//] KEEP_J47/.test(s) ? 1 : 2; // CMT_J47\nconst w = 1 - /[//] KEEP_J47b/.test(s); // CMT_J47b\nconst k = 35;', survive: ['/[//] KEEP_J47/.test(s)', '/[//] KEEP_J47b/.test(s)', 'const k = 35;'], vanish: ['CMT_J47'] },
  { name: 'js/regex-after-less-than-operator', kind: 'js', input: 'const v = a < /[//] KEEP_J48/.source.length; // CMT_J48\nconst k = 36;', survive: ['/[//] KEEP_J48/.source.length', 'const k = 36;'], vanish: ['CMT_J48'] },
  { name: 'js/jsx-attribute-string-has-no-escapes', kind: 'js', input: 'const el = <a b="x\\" c="y // KEEP_J49">t</a>; // CMT_J49\nconst k = 37;', survive: ['c="y // KEEP_J49">t</a>', 'const k = 37;'], vanish: ['CMT_J49'] },
  { name: 'js/non-ascii-whitespace-is-whitespace', kind: 'js', input: 'const x = a\u00a0/ 2; // CMT_J50 /\nconst y = b\u3000/ 3; // CMT_J50b /\nconst k = 38;', survive: ['a\u00a0/ 2;', 'b\u3000/ 3;', 'const k = 38;'], vanish: ['CMT_J50'] },
  { name: 'js/private-name-spelling-a-keyword-is-division', kind: 'js', input: 'class A { f() { return this.#return / 2; } } // CMT_J51 /\nconst k = 39;', survive: ['this.#return / 2;', 'const k = 39;'], vanish: ['CMT_J51'] },
  { name: 'js/failed-jsx-attempt-takes-its-issues-back', kind: 'js', input: "const x = <T>{ 'oops }</Z>;\nconst k = 40;\n", survive: ['const k = 40;'], issues: ['unterminated-string'] },
  { name: 'js/unterminated-template-reported', kind: 'js', input: bt('const t = §abc // KEEP_J40\nconst k = 30;\n'), survive: ['// KEEP_J40', 'const k = 30;'], issues: ['unterminated-template'] },
  { name: 'js/unterminated-template-expression-reported', kind: 'js', input: bt('const t = §a ${ b // CMT_J41\n'), vanish: ['CMT_J41'], issues: ['unterminated-template-expression'] },
  { name: 'js/unterminated-string-swallows-the-rest-of-its-line (documented limit)', kind: 'js', input: "const a = 1;\nconst b = 'oops; // KEEP_J43\nconst c = 2; // CMT_J43\n", survive: ['// KEEP_J43', 'const c = 2;'], vanish: ['CMT_J43'], issues: ['unterminated-string'] },
  // -- SQL: unterminated constructs are reported, never swallowed silently ------------------------------
  { name: 'sql/cr-only-line-endings', kind: 'sql', input: 'SELECT 1; -- CMT_S15\rSELECT 2;\r-- CMT_S15b\rSELECT 3;\r', survive: ['SELECT 2;', 'SELECT 3;'], vanish: ['CMT_S15'], noIssues: true },
  { name: 'sql/dollar-after-identifier-character-is-not-a-quote', kind: 'sql', input: 'SELECT a$b$c FROM t; -- CMT_S16\nSELECT 2;\n', survive: ['a$b$c FROM t;', 'SELECT 2;'], vanish: ['CMT_S16'], noIssues: true },
  { name: 'sql/E-after-identifier-character-is-not-an-escape-string', kind: 'sql', input: "SELECT fooE'C:\\' -- CMT_S17\nSELECT 3;\n", survive: ["fooE'C:\\'", 'SELECT 3;'], vanish: ['CMT_S17'], noIssues: true },
  { name: 'sql/unterminated-string-reported', kind: 'sql', input: "SELECT 'oops\n-- KEEP_S12 inside the open string\nSELECT 2;\n", survive: ['-- KEEP_S12 inside the open string', 'SELECT 2;'], issues: ['unterminated-string'] },
  { name: 'sql/unterminated-quoted-identifier-reported', kind: 'sql', input: 'SELECT "oops\n-- KEEP_S13 inside the open identifier\n', survive: ['-- KEEP_S13 inside the open identifier'], issues: ['unterminated-quoted-identifier'] },
  { name: 'sql/unterminated-dollar-quote-reported', kind: 'sql', input: 'DO $$ BEGIN -- CMT_S14\nPERFORM 1;\n', survive: ['PERFORM 1;'], vanish: ['CMT_S14'], issues: ['unterminated-dollar-quote'] },
  // ---------------------------------------------------------------- SHELL
  { name: 'sh/full-line-and-trailing', kind: 'sh', input: 'echo a # CMT_H1\n# CMT_H1b\n   # CMT_H1c\necho b\n', survive: ['echo a', 'echo b'], vanish: ['CMT_H1'], noIssues: true },
  { name: 'sh/hash-inside-quotes-is-content', kind: 'sh', input: 'echo "a # KEEP_H2" \'b # KEEP_H2b\' c # CMT_H2\n', survive: ['"a # KEEP_H2"', "'b # KEEP_H2b'"], vanish: ['CMT_H2'], noIssues: true },
  { name: 'sh/hash-inside-a-word-is-content', kind: 'sh', input: 'echo a#KEEP_H3 ${x#KEEP_H3b} ${#x} $# $$ x=#KEEP_H3c # CMT_H3\n', survive: ['a#KEEP_H3', '${x#KEEP_H3b}', '${#x}', '$# $$', 'x=#KEEP_H3c'], vanish: ['CMT_H3'] },
  { name: 'sh/heredoc-body-is-data', kind: 'sh', input: 'cat <<EOS\n# KEEP_H4 data\nEOS\n# CMT_H4\necho done\n', survive: ['# KEEP_H4 data', 'echo done'], vanish: ['CMT_H4'], noIssues: true },
  { name: 'sh/heredoc-quoted-delimiter-and-dash-tabs', kind: 'sh', input: "cat <<-'EOS'\n\t# KEEP_H5\n\tEOS\necho x # CMT_H5\n", survive: ['# KEEP_H5', 'echo x'], vanish: ['CMT_H5'], noIssues: true },
  { name: 'sh/two-heredocs-on-one-line', kind: 'sh', input: 'cat <<A <<B\n# KEEP_H6a\nA\n# KEEP_H6b\nB\n# CMT_H6\necho z\n', survive: ['# KEEP_H6a', '# KEEP_H6b', 'echo z'], vanish: ['CMT_H6'], noIssues: true },
  { name: 'sh/here-string-is-not-a-heredoc', kind: 'sh', input: 'cat <<< "x" # CMT_H7\n# CMT_H7b\necho KEEP_H7\n', survive: ['echo KEEP_H7'], vanish: ['CMT_H7'], noIssues: true },
  { name: 'sh/arithmetic-shift-is-not-a-heredoc', kind: 'sh', input: 'echo $((1<<2)) # CMT_H8\n# CMT_H8b\n(( y = 1 << 3 )) # CMT_H8c\necho KEEP_H8\n', survive: ['$((1<<2))', '(( y = 1 << 3 ))', 'echo KEEP_H8'], vanish: ['CMT_H8'], noIssues: true },
  { name: 'sh/escaped-hash-and-escaped-quote', kind: 'sh', input: 'echo \\# KEEP_H9 \\" # CMT_H9\necho \\\\# KEEP_H9b\n', survive: ['\\# KEEP_H9 \\"', '\\\\# KEEP_H9b'], vanish: ['CMT_H9'], noIssues: true },
  { name: 'sh/command-substitution-backtick-and-nested-quotes', kind: 'sh', input: 'x=$(echo "a # KEEP_H10" # CMT_H10\n) # CMT_H10b\ny=§echo "b # KEEP_H10b"§ # CMT_H10c\nz=$(echo $(echo "c # KEEP_H10c")) # CMT_H10d\n'.replaceAll('§', '`'), survive: ['"a # KEEP_H10"', '"b # KEEP_H10b"', '"c # KEEP_H10c"'], vanish: ['CMT_H10'], noIssues: true },
  { name: 'sh/parameter-expansion-with-nested-quotes', kind: 'sh', input: 'echo "${x:-"a # KEEP_H11"}" # CMT_H11\necho ${y:-\'b # KEEP_H11b\'} # CMT_H11b\necho "${z:-it\'s # KEEP_H11c}" # CMT_H11c\necho "${w:-"a } # KEEP_H11d"}" # CMT_H11d\n', survive: ['"a # KEEP_H11"', "'b # KEEP_H11b'", "it's # KEEP_H11c", '"a } # KEEP_H11d"'], vanish: ['CMT_H11'], noIssues: true },
  { name: 'sh/ansi-c-quote', kind: 'sh', input: "echo $'it\\'s # KEEP_H12' # CMT_H12\necho 1\n", survive: ["$'it\\'s # KEEP_H12'", 'echo 1'], vanish: ['CMT_H12'], noIssues: true },
  { name: 'sh/line-continuation-keeps-word-state', kind: 'sh', input: 'echo a \\\n  b # CMT_H13\necho c\\\n# KEEP_H13\n', survive: ['echo a', 'echo c\\\n# KEEP_H13'], vanish: ['CMT_H13'], noIssues: true },
  { name: 'sh/shebang-is-a-comment', kind: 'sh', input: '#!/bin/bash -e CMT_H14\necho KEEP_H14\n', survive: ['echo KEEP_H14'], vanish: ['CMT_H14'], noIssues: true },
  { name: 'sh/crlf-files', kind: 'sh', input: 'echo a # CMT_H15\r\n# CMT_H15b\r\necho b\r\ncat <<EOS\r\n# KEEP_H15\r\nEOS\r\n', survive: ['echo a', 'echo b', '# KEEP_H15'], vanish: ['CMT_H15'], noIssues: true },
  { name: 'sh/comment-after-metacharacters', kind: 'sh', input: 'echo a;# CMT_H16\necho b&&# CMT_H16b\n(echo c)# CMT_H16c\n', survive: ['echo a;', 'echo b&&', '(echo c)'], vanish: ['CMT_H16'], noIssues: true },
  { name: 'sh/comment-text-with-openers-does-not-open-anything', kind: 'sh', input: "# CMT_H17 ' \" ` ${ $( <<EOS\necho KEEP_H17\n", survive: ['echo KEEP_H17'], vanish: ['CMT_H17'], noIssues: true },
  { name: 'sh/function-braces-and-case-patterns', kind: 'sh', input: 'f() { # CMT_H18\n  echo "{#}" KEEP_H18\n}\ncase $x in\n  a) echo A ;; # CMT_H18b\n  *) echo B ;;\nesac\n', survive: ['"{#}" KEEP_H18', 'a) echo A ;;', '*) echo B ;;'], vanish: ['CMT_H18'], noIssues: true },
  { name: 'sh/unterminated-string-reported', kind: 'sh', input: 'echo "oops\n# KEEP_H19 inside the open string\n', survive: ['# KEEP_H19 inside the open string'], issues: ['unterminated-string'] },
  { name: 'sh/unterminated-heredoc-reported', kind: 'sh', input: 'cat <<EOS\n# KEEP_H20 body never closed\n', survive: ['# KEEP_H20 body never closed'], issues: ['unterminated-heredoc'] },
  { name: 'sh/unterminated-command-substitution-reported', kind: 'sh', input: 'echo $(foo # CMT_H21\n', vanish: ['CMT_H21'], issues: ['unterminated-command-substitution'] },
  { name: 'sh/unterminated-parameter-expansion-reported', kind: 'sh', input: 'echo ${x:-oops\n# KEEP_H22\n', survive: ['# KEEP_H22'], issues: ['unterminated-parameter-expansion'] },
  { name: 'sh/unterminated-backtick-reported', kind: 'sh', input: 'echo §foo\n# KEEP_H23 no comments inside backticks\n'.replaceAll('§', '`'), survive: ['# KEEP_H23'], issues: ['unterminated-backtick'] },
  { name: 'sh/unterminated-arithmetic-reported', kind: 'sh', input: 'echo $((1 +\n# KEEP_H24\n', survive: ['# KEEP_H24'], issues: ['unterminated-arithmetic'] },
  { name: 'sh/crlf-line-continuation-keeps-word-state', kind: 'sh', input: 'echo a \\\r\n  b # CMT_H25\r\necho c\\\r\n# KEEP_H25\r\n', survive: ['echo a', 'echo c\\\r\n# KEEP_H25'], vanish: ['CMT_H25'], noIssues: true },
  { name: 'sh/escaped-quote-inside-double-quotes', kind: 'sh', input: 'echo "say \\" # KEEP_H26" # CMT_H26\n', survive: ['"say \\" # KEEP_H26"'], vanish: ['CMT_H26'], noIssues: true },
  { name: 'sh/escaped-quote-inside-parameter-expansion', kind: 'sh', input: 'echo ${x:-\\"} # CMT_H27\necho KEEP_H27\n', survive: ['${x:-\\"}', 'echo KEEP_H27'], vanish: ['CMT_H27'], noIssues: true },
  { name: 'sh/subshell-parentheses-inside-command-substitution', kind: 'sh', input: 'x="$( (echo a); echo "b # KEEP_H28" )" # CMT_H28\n', survive: ['"b # KEEP_H28"'], vanish: ['CMT_H28'], noIssues: true },
  { name: 'sh/arithmetic-inside-command-substitution-inside-quotes', kind: 'sh', input: 'x="$(echo $((1+2)) "k # KEEP_H29")" # CMT_H29\n', survive: ['"k # KEEP_H29"'], vanish: ['CMT_H29'], noIssues: true },
  { name: 'sh/hash-glued-to-a-quoted-string-is-content', kind: 'sh', input: "echo \"a\"#KEEP_H30 'b'#KEEP_H30b $(c)#KEEP_H30c # CMT_H30\n", survive: ['"a"#KEEP_H30', "'b'#KEEP_H30b", '$(c)#KEEP_H30c'], vanish: ['CMT_H30'], noIssues: true },
  { name: 'sh/unterminated-single-quote-reported', kind: 'sh', input: "echo 'oops\n# KEEP_H31 inside the open string\n", survive: ['# KEEP_H31 inside the open string'], issues: ['unterminated-string'] },
  { name: 'sh/unterminated-double-paren-arithmetic-reported', kind: 'sh', input: '(( 1 +\n# KEEP_H32\n', survive: ['# KEEP_H32'], issues: ['unterminated-arithmetic'] },
  { name: 'sh/heredoc-marker-on-the-last-line-without-newline', kind: 'sh', input: 'cat <<EOS', survive: ['cat <<EOS'], issues: ['unterminated-heredoc'] },
  { name: 'sh/arithmetic-spanning-lines-is-not-a-heredoc', kind: 'sh', input: 'echo $((1<<2\n + 3)) # CMT_H33\n# CMT_H33b\necho KEEP_H33\n', survive: ['$((1<<2\n + 3))', 'echo KEEP_H33'], vanish: ['CMT_H33'], noIssues: true },
  { name: 'sh/documented-absence-does-not-match', kind: 'sh', input: '#!/bin/sh\n# never calls FORBIDDEN_TOKEN\necho ok # no FORBIDDEN_TOKEN here\n', survive: ['echo ok'], counts: [['FORBIDDEN_TOKEN', 0]] },
  { name: 'sh/forbidden-token-in-real-code-still-matches', kind: 'sh', input: 'FORBIDDEN_TOKEN=1 # FORBIDDEN_TOKEN\n', counts: [['FORBIDDEN_TOKEN', 1]] },
  { name: 'sh/forbidden-token-in-string-and-heredoc-still-matches', kind: 'sh', input: 'echo "FORBIDDEN_TOKEN # x"\ncat <<EOS\n# FORBIDDEN_TOKEN\nEOS\n', counts: [['FORBIDDEN_TOKEN', 2]] },
  // ---------------------------------------------------------------- DOCKERFILE
  { name: 'docker/full-line-comments', kind: 'docker', input: '# CMT_D1\nFROM scratch\n  # CMT_D1b\nRUN echo hi\n', survive: ['FROM scratch', 'RUN echo hi'], vanish: ['CMT_D1'], noIssues: true },
  { name: 'docker/trailing-hash-is-content', kind: 'docker', input: 'RUN echo hi # KEEP_D2\nENV A="b # KEEP_D2b"\n', survive: ['RUN echo hi # KEEP_D2', 'ENV A="b # KEEP_D2b"'], noIssues: true },
  { name: 'docker/parser-directive-is-kept-at-the-top', kind: 'docker', input: '# syntax=docker/dockerfile:1\n# escape=`\n# CMT_D3 an ordinary comment\nFROM x\n', survive: ['# syntax=docker/dockerfile:1', '# escape=`', 'FROM x'], vanish: ['CMT_D3'], noIssues: true },
  { name: 'docker/directive-after-a-comment-is-only-a-comment', kind: 'docker', input: '# CMT_D4\n# syntax=docker/dockerfile:1\nFROM x\n', survive: ['FROM x'], vanish: ['CMT_D4', 'dockerfile:1'], noIssues: true },
  { name: 'docker/heredoc-body-is-data', kind: 'docker', input: 'RUN <<EOF\n# KEEP_D5\necho x\nEOF\n# CMT_D5\nFROM y\n', survive: ['# KEEP_D5', 'echo x', 'FROM y'], vanish: ['CMT_D5'], noIssues: true },
  { name: 'docker/comment-inside-a-continued-instruction', kind: 'docker', input: 'RUN a \\\n  # CMT_D6\n  && b\n', survive: ['RUN a', '&& b'], vanish: ['CMT_D6'], noIssues: true },
  { name: 'docker/crlf', kind: 'docker', input: '# CMT_D7\r\nFROM x\r\nRUN <<EOF\r\n# KEEP_D7\r\nEOF\r\n', survive: ['FROM x', '# KEEP_D7'], vanish: ['CMT_D7'], noIssues: true },
  { name: 'docker/heredoc-only-for-run-copy-add', kind: 'docker', input: 'ENV A=<<X\n# CMT_D8\nFROM z\n', survive: ['ENV A=<<X', 'FROM z'], vanish: ['CMT_D8'], noIssues: true },
  { name: 'docker/unterminated-heredoc-reported', kind: 'docker', input: 'RUN <<EOF\n# KEEP_D9 never closed\n', survive: ['# KEEP_D9 never closed'], issues: ['unterminated-heredoc'] },
  { name: 'docker/heredoc-dash-strips-leading-tabs-of-the-terminator', kind: 'docker', input: 'RUN <<-EOF\n\t# KEEP_D10\n\tEOF\n# CMT_D10\nFROM q\n', survive: ['# KEEP_D10', 'FROM q'], vanish: ['CMT_D10'], noIssues: true },
  { name: 'docker/heredoc-marker-on-a-continued-line', kind: 'docker', input: 'RUN a \\\n  && cat <<EOF\n# KEEP_D11\nEOF\n# CMT_D11\nFROM r\n', survive: ['# KEEP_D11', 'FROM r'], vanish: ['CMT_D11'], noIssues: true },
  { name: 'docker/heredoc-quoted-delimiter', kind: 'docker', input: "COPY <<'EOF' /x\n# KEEP_D12\nEOF\n# CMT_D12\nFROM s\n", survive: ['# KEEP_D12', 'FROM s'], vanish: ['CMT_D12'], noIssues: true },
  { name: 'docker/documented-absence-does-not-match', kind: 'docker', input: '# no FORBIDDEN_TOKEN\nFROM scratch\n', survive: ['FROM scratch'], counts: [['FORBIDDEN_TOKEN', 0]] },
  { name: 'docker/forbidden-token-in-instruction-still-matches', kind: 'docker', input: 'ENV FORBIDDEN_TOKEN=1 # FORBIDDEN_TOKEN\n', counts: [['FORBIDDEN_TOKEN', 2]] },
  // ---------------------------------------------------------------- DOTENV
  { name: 'dotenv/full-line-only', kind: 'dotenv', input: '# CMT_E1\nA=1\n   # CMT_E1b\nB=2 # KEEP_E1\n', survive: ['A=1', 'B=2 # KEEP_E1'], vanish: ['CMT_E1'], noIssues: true },
  { name: 'dotenv/multi-line-quoted-value-is-data', kind: 'dotenv', input: 'K="line1\n# KEEP_E2\nline3\n# KEEP_E2b\nline5"\n# CMT_E2\nZ=1\n', survive: ['# KEEP_E2\n', '# KEEP_E2b', 'Z=1'], vanish: ['CMT_E2'], noIssues: true },
  { name: 'dotenv/single-quote-backtick-and-export', kind: 'dotenv', input: "export K='a\n# KEEP_E3\nb'\nL=§c\n# KEEP_E3b\n§\n# CMT_E3\n".replaceAll('§', '`'), survive: ['# KEEP_E3\n', '# KEEP_E3b'], vanish: ['CMT_E3'], noIssues: true },
  { name: 'dotenv/escaped-quote-does-not-close-the-value', kind: 'dotenv', input: 'K="a \\"\n# KEEP_E4\n"\n# CMT_E4\n', survive: ['# KEEP_E4'], vanish: ['CMT_E4'], noIssues: true },
  { name: 'dotenv/backslash-does-not-escape-in-single-quotes', kind: 'dotenv', input: "K='a\\'\n# CMT_E6\nZ=1\n", survive: ['K=\'a\\\'', 'Z=1'], vanish: ['CMT_E6'], noIssues: true },
  { name: 'dotenv/unterminated-value-reported', kind: 'dotenv', input: 'K="never closed\n# KEEP_E5\n', survive: ['# KEEP_E5'], issues: ['unterminated-string'] },
  { name: 'dotenv/documented-absence-does-not-match', kind: 'dotenv', input: '# never sets FORBIDDEN_TOKEN\nA=1\n', survive: ['A=1'], counts: [['FORBIDDEN_TOKEN', 0]] },
  { name: 'dotenv/forbidden-token-in-value-still-matches', kind: 'dotenv', input: 'FORBIDDEN_TOKEN=1\nB=x # FORBIDDEN_TOKEN\n', counts: [['FORBIDDEN_TOKEN', 2]] },
  // ---------------------------------------------------------------- CADDYFILE
  { name: 'caddy/full-line-and-token-start', kind: 'caddy', input: '# CMT_C1\nexample.test { # CMT_C1b\n  respond "a # KEEP_C1" 200 # CMT_C1c\n}\n', survive: ['example.test {', 'respond "a # KEEP_C1" 200'], vanish: ['CMT_C1'], noIssues: true },
  { name: 'caddy/hash-inside-a-token-is-content', kind: 'caddy', input: 'redir /x/#KEEP_C2 https://h.test/#KEEP_C2b # CMT_C2\n{$SITE} { # CMT_C2b\n}\n', survive: ['/x/#KEEP_C2', 'https://h.test/#KEEP_C2b', '{$SITE} {'], vanish: ['CMT_C2'], noIssues: true },
  { name: 'caddy/backtick-string-spans-lines', kind: 'caddy', input: 'respond §a\n# KEEP_C3\nb§ # CMT_C3\nnext\n'.replaceAll('§', '`'), survive: ['# KEEP_C3', 'next'], vanish: ['CMT_C3'], noIssues: true },
  { name: 'caddy/heredoc-body-is-data', kind: 'caddy', input: 'respond <<HTML\n  # KEEP_C4\n  HTML 200\n# CMT_C4\nnext\n', survive: ['# KEEP_C4', 'next'], vanish: ['CMT_C4'], noIssues: true },
  { name: 'caddy/escaped-hash-and-escaped-quote', kind: 'caddy', input: 'a \\# KEEP_C5 "b \\" # KEEP_C5b" c # CMT_C5\n', survive: ['\\# KEEP_C5', '"b \\" # KEEP_C5b"'], vanish: ['CMT_C5'], noIssues: true },
  { name: 'caddy/hash-glued-to-a-quoted-string-is-content (conservative)', kind: 'caddy', input: 'respond "a"#KEEP_C8 200 # CMT_C8\n', survive: ['"a"#KEEP_C8'], vanish: ['CMT_C8'], noIssues: true },
  { name: 'caddy/escaped-space-keeps-the-token-open', kind: 'caddy', input: 'a\\ #KEEP_C9 b # CMT_C9\n', survive: ['a\\ #KEEP_C9 b'], vanish: ['CMT_C9'], noIssues: true },
  { name: 'caddy/heredoc-marker-on-the-last-line-without-newline', kind: 'caddy', input: 'respond <<HTML', survive: ['respond <<HTML'], issues: ['unterminated-heredoc'] },
  { name: 'caddy/unterminated-string-reported', kind: 'caddy', input: 'respond "never closed\n# KEEP_C6\n', survive: ['# KEEP_C6'], issues: ['unterminated-string'] },
  { name: 'caddy/unterminated-heredoc-reported', kind: 'caddy', input: 'respond <<HTML\n# KEEP_C7 never closed\n', survive: ['# KEEP_C7 never closed'], issues: ['unterminated-heredoc'] },
  { name: 'caddy/documented-absence-does-not-match', kind: 'caddy', input: '# never proxies to FORBIDDEN_TOKEN\nexample.test {\n}\n', survive: ['example.test {'], counts: [['FORBIDDEN_TOKEN', 0]] },
  { name: 'caddy/forbidden-token-in-real-directive-still-matches', kind: 'caddy', input: 'reverse_proxy FORBIDDEN_TOKEN:80 # FORBIDDEN_TOKEN\n', counts: [['FORBIDDEN_TOKEN', 1]] },
];

// ---- KNOWN-WRONG controls (never exported, used only by the lethality checks) ----------------
function wrongRegexLine(src) {
  return { text: src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, ''), issues: [] };
}
function wrongStateful(src, { keepNewlines = true } = {}) {
  // Knows quotes, // and /* */. Does NOT know templates or regex literals or JSX.
  const n = src.length;
  const out = src.split('');
  let i = 0;
  const blank = (a, b) => {
    for (let k = a; k < b; k++) if (!keepNewlines || !isLineTerm(out[k])) out[k] = ' ';
  };
  while (i < n) {
    const c = src[i];
    if (c === '"' || c === "'") {
      i++;
      while (i < n && src[i] !== c && src[i] !== '\n') {
        if (src[i] === '\\') i++;
        i++;
      }
      i++;
      continue;
    }
    if (c === '/' && src[i + 1] === '/') {
      let e = i;
      while (e < n && src[e] !== '\n') e++;
      blank(i, e);
      i = e;
      continue;
    }
    if (c === '/' && src[i + 1] === '*') {
      let e = src.indexOf('*/', i + 2);
      e = e === -1 ? n : e + 2;
      blank(i, e);
      i = e;
      continue;
    }
    i++;
  }
  return { text: out.join(''), issues: [] };
}
const wrongHashAnywhere = (src) => ({ text: src.replace(/#[^\n]*/g, (m) => ' '.repeat(m.length)), issues: [] });
// knows "a # starts a comment only at a word start" but is blind to quotes, here-documents and substitutions
const wrongShellWordStartRegex = (src) => ({ text: src.replace(/(^|[ \t;|&(])#[^\n]*/gm, (m, p) => p + ' '.repeat(m.length - p.length)), issues: [] });
// removes EVERY full-line comment: no directives, no here-document or multi-line-quote awareness
const wrongFullLineOnly = (src) => ({ text: src.replace(/^[ \t]*#[^\n]*/gm, (m) => ' '.repeat(m.length)), issues: [] });
// a YAML stripper that has never heard of block scalars
const wrongYamlNoBlocks = (src) => ({ text: src.split('\n').map((l) => l.replace(/(^|[ \t])#.*$/, (m, p) => p + ' '.repeat(m.length - p.length))).join('\n'), issues: [] });
const wrongSql = (src) => ({ text: src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/--.*$/gm, ''), issues: [] });
const wrongYaml = (src) => ({ text: src.replace(/#.*$/gm, ''), issues: [] });

// ---- deterministic oracle fuzz ------------------------------------------------------------------
function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// '@' = fragment index, '§' = backtick. K markers must survive, G markers must vanish.
const FRAGMENTS = [
  { s: 'const v@_ = "// K@a_"; // G@a_', keep: ['K@a_'], gone: ['G@a_'] },
  { s: "const v@_ = '/* K@a_ */'; /* G@a_ */", keep: ['K@a_'], gone: ['G@a_'] },
  { s: 'const v@_ = §t ${ w@_ /* G@a_ */ } // K@a_ /* K@b_ */§; // G@b_', keep: ['w@_', 'K@a_', 'K@b_'], gone: ['G@a_', 'G@b_'] },
  { s: 'const v@_ = /\\/\\/ K@a_/g; // G@a_', keep: ['K@a_'], gone: ['G@a_'] },
  { s: 'const v@_ = b@_ / c@_ / d@_; // G@a_', keep: ['b@_ / c@_ / d@_'], gone: ['G@a_'] },
  { s: 'const v@_ = (<p>http://h.test // K@a_</p>); // G@a_', keep: ['// K@a_</p>'], gone: ['G@a_'] },
  { s: 'const v@_ = <div>{/* G@a_ */}<b>K@a_</b></div>;', keep: ['K@a_'], gone: ['G@a_'] },
  { s: '/* G@a_ // G@b_ */', keep: [], gone: ['G@a_', 'G@b_'] },
  { s: '// G@a_ \'x "y §z ${', keep: [], gone: ['G@a_'] },
  { s: 'const v@_ = "it\'s K@a_"; // G@a_', keep: ["it's K@a_"], gone: ['G@a_'] },
  { s: "const v@_ = k@_ ? /r\\/K@a_/ : 'y'; // G@a_", keep: ['K@a_'], gone: ['G@a_'] },
  { s: 'const v@_ = §${ §${ n@_ /* G@a_ */ }§ } K@a_§;', keep: ['n@_', 'K@a_'], gone: ['G@a_'] },
  { s: 'if (K@a_) { run(); } // G@a_', keep: ['K@a_'], gone: ['G@a_'] },
  { s: 'const v@_ = {\n  a: 1, // G@a_\n  b: "// K@a_",\n};', keep: ['K@a_'], gone: ['G@a_'] },
  { s: 'const v@_ = x.replace(/\'/g, "K@a_"); // G@a_', keep: ["/'/g", 'K@a_'], gone: ['G@a_'] },
  { s: 'const v@_ = <a href="//cdn.test/K@a_" b={§/x/${ id@_ /* G@a_ */ }§}>go // K@b_</a>;', keep: ['//cdn.test/K@a_', 'id@_', 'go // K@b_</a>'], gone: ['G@a_'] },
];

// Shell fragments for the same oracle ('@' = fragment index, '§' = backtick).
const SH_FRAGMENTS = [
  { s: 'echo "K@a_ # K@b_" # G@a_', keep: ['K@a_ # K@b_'], gone: ['G@a_'] },
  { s: "echo 'K@a_ # K@b_' x@_ # G@a_", keep: ['K@a_ # K@b_'], gone: ['G@a_'] },
  { s: 'v@_=$(echo K@a_ # G@a_\n) # G@b_', keep: ['K@a_'], gone: ['G@a_', 'G@b_'] },
  { s: 'cat <<EOS@_\n# K@a_\nEOS@_\n# G@a_', keep: ['# K@a_'], gone: ['G@a_'] },
  { s: 'echo $# ${#v@_} ${w@_#K@a_} a#K@b_ # G@a_', keep: ['${w@_#K@a_}', 'a#K@b_'], gone: ['G@a_'] },
  { s: 'echo $((1<<2)) K@a_ # G@a_', keep: ['$((1<<2)) K@a_'], gone: ['G@a_'] },
  { s: 'echo "${v@_:-"K@a_ # K@b_"}" # G@a_', keep: ['"K@a_ # K@b_"'], gone: ['G@a_'] },
  { s: 'echo \\# K@a_ \\" # G@a_', keep: ['\\# K@a_'], gone: ['G@a_'] },
  { s: 'echo a@_;# G@a_\necho K@a_', keep: ['echo K@a_'], gone: ['G@a_'] },
  { s: "# G@a_ ' \" § ${ $( <<EOS", keep: [], gone: ['G@a_'] },
  { s: 'echo §echo "K@a_ # K@b_"§ # G@a_', keep: ['"K@a_ # K@b_"'], gone: ['G@a_'] },
  { s: "cat <<-'EOS'\n\t# K@a_\n\tEOS\necho K@b_ # G@a_", keep: ['# K@a_', 'echo K@b_'], gone: ['G@a_'] },
  { s: "echo $'it\\'s # K@a_' # G@a_", keep: ["$'it\\'s # K@a_'"], gone: ['G@a_'] },
  { s: 'f@_() { # G@a_\n  echo K@a_\n}', keep: ['echo K@a_'], gone: ['G@a_'] },
  { s: 'echo a \\\n  b@_ # G@a_', keep: ['b@_'], gone: ['G@a_'] },
];

function fuzzJs(impl, programs, seed, frags = FRAGMENTS) {
  const rnd = mulberry32(seed);
  const seps = ['\n', '\n\n', '\r\n'];
  let failures = 0;
  let firstFailure = null;
  let keepMarkers = 0;
  let goneMarkers = 0;
  for (let p = 0; p < programs; p++) {
    const count = 1 + Math.floor(rnd() * 8);
    const parts = [];
    const keep = [];
    const gone = [];
    for (let f = 0; f < count; f++) {
      const frag = frags[Math.floor(rnd() * frags.length)];
      const fill = (s) => bt(s.replaceAll('@', String(f)));
      parts.push(fill(frag.s));
      for (const k of frag.keep) keep.push(fill(k));
      for (const g of frag.gone) gone.push(fill(g));
    }
    const input = parts.join(seps[Math.floor(rnd() * seps.length)]);
    keepMarkers += keep.length;
    goneMarkers += gone.length;
    let bad = null;
    try {
      const { text } = impl(input);
      const sp = shapeProblem(input, text);
      if (sp) bad = `shape: ${sp}`;
      else if (keep.some((k) => !text.includes(k))) bad = 'lost a code marker';
      else if (gone.some((g) => text.includes(g))) bad = 'a comment marker survived';
      else if (impl(text).text !== text) bad = 'not idempotent';
    } catch (e) {
      bad = `threw ${e && e.name}`;
    }
    if (bad) {
      failures++;
      if (!firstFailure) firstFailure = `program #${p} (${count} fragments): ${bad}`;
    }
  }
  return { failures, firstFailure, keepMarkers, goneMarkers };
}

export function selfTest() {
  const checks = [];
  const add = (name, ok, detail = '') => checks.push({ name, ok: !!ok, detail: String(detail) });
  const real = (c) => judge(c, IMPLS[c.kind]);

  // 1. Every case is non-vacuous (its markers exist in its own input) and passes.
  const seenNames = new Set();
  for (const c of CASES) {
    if (seenNames.has(c.name)) add(`case-name-unique:${c.name}`, false, 'duplicate case name');
    seenNames.add(c.name);
    const vac = caseIsNonVacuous(c);
    const problems = vac.length ? vac.map((v) => `VACUOUS CASE: ${v}`) : real(c);
    add(c.name, problems.length === 0, problems.join('; '));
  }

  // 2. Invariants over every case: shape preserved, idempotent, line numbers preserved.
  {
    const bad = [];
    for (const c of CASES) {
      const out = IMPLS[c.kind](c.input, c.opts).text;
      const sp = shapeProblem(c.input, out);
      if (sp) bad.push(`${c.name}: ${sp}`);
      const again = IMPLS[c.kind](out, c.opts).text;
      if (again !== out) bad.push(`${c.name}: not idempotent`);
      const nlIn = countOf(c.input, '\n');
      const nlOut = countOf(out, '\n');
      if (nlIn !== nlOut) bad.push(`${c.name}: newline count ${nlIn} -> ${nlOut}`);
    }
    add('invariant/shape-idempotent-newlines-over-all-cases', bad.length === 0, bad.slice(0, 3).join('; '));
  }

  // 3. Evidence line numbers are real: a marker after 3 comment lines is reported on its input line.
  {
    const input = 'a();\n/* c1\nc2 */\n// c3\nconst MARK = 1;\n';
    const out = stripComments(input);
    const lineIn = input.slice(0, input.indexOf('MARK')).split('\n').length;
    const lineOut = out.slice(0, out.indexOf('MARK')).split('\n').length;
    add('line-numbers/marker-stays-on-its-line', lineIn === 5 && lineIn === lineOut, `in=${lineIn} out=${lineOut}`);
  }
  {
    const input = "ok();\nconst a = 'oops;\nok2();\n";
    const { issues } = stripCommentsDetailed(input);
    add('issues/report-the-input-line', issues.length === 1 && issues[0].kind === 'unterminated-string' && issues[0].line === 2, JSON.stringify(issues));
  }

  // 3b. Every stripper reports an unclosed construct on the line it OPENED on, and caps its issue list.
  {
    const probes = [
      ['js', "a();\nb();\nconst s = 'oops;\n", (x) => stripCommentsDetailed(x), 'unterminated-string', 3],
      ['sql', "SELECT 1;\nSELECT 2;\nSELECT 'oops;\n", stripSqlCommentsDetailed, 'unterminated-string', 3],
      ['sql-doubled-quote-inside-identifier', 'SELECT "a\n""b\n', stripSqlCommentsDetailed, 'unterminated-quoted-identifier', 1],
      ['sh', 'echo a\necho b\necho "oops\n', stripShellCommentsDetailed, 'unterminated-string', 3],
      ['docker', 'FROM x\nRUN a\nRUN <<EOF\nbody\n', stripDockerfileCommentsDetailed, 'unterminated-heredoc', 3],
      ['dotenv', 'A=1\nB=2\nK="oops\n', stripDotenvCommentsDetailed, 'unterminated-string', 3],
      ['caddy', 'a\nb\nrespond "oops\n', stripCaddyfileCommentsDetailed, 'unterminated-string', 3],
      ['yaml-run-body', 'a: 1\nsteps:\n  - run: |\n      echo ok\n      echo "oops\n', (x) => stripYamlCommentsDetailed(x, { blockScalars: 'run' }), 'unterminated-string', 5],
      ['yaml-second-run-body', 'steps:\n  - run: |\n      echo ok\n  - run: |\n      cat <<EOS\n      body\n', (x) => stripYamlCommentsDetailed(x, { blockScalars: 'run' }), 'unterminated-heredoc', 5],
    ];
    const bad = [];
    for (const [label, input, fn, kind, line] of probes) {
      const got = JSON.stringify(fn(input).issues);
      const want = JSON.stringify([{ kind, line }]);
      if (got !== want) bad.push(`${label}: ${got}`);
    }
    add('issues/every-stripper-reports-the-line-the-construct-opened-on', bad.length === 0, bad.join('; '));
    const many = (n, f) => Array.from({ length: n }, (_, k) => f(k)).join('');
    const caps = [
      ['js', stripCommentsDetailed(many(150, () => "'x\n")).issues.length],
      ['sql', stripSqlCommentsDetailed(many(150, (k) => `$t${k}$ `)).issues.length],
      ['sh', stripShellCommentsDetailed('cat ' + many(150, (k) => `<<H${k} `) + '\n').issues.length],
    ];
    add('issues/lists-are-capped-at-100 (and the inputs really produce more)', caps.every(([, c]) => c === 100), JSON.stringify(caps));
  }

  // 4. API contract.
  {
    const threw = [];
    for (const f of [stripComments, stripSqlComments, stripYamlComments, stripYamlCommentsDetailed, stripCommentsDetailed, stripSqlCommentsDetailed, stripShellComments, stripShellCommentsDetailed, stripDockerfileComments, stripDockerfileCommentsDetailed, stripDotenvComments, stripDotenvCommentsDetailed, stripCaddyfileComments, stripCaddyfileCommentsDetailed]) {
      try {
        f(null);
        threw.push(f.name + ':no-throw');
      } catch (e) {
        if (!(e instanceof TypeError)) threw.push(f.name + ':wrong-error');
      }
    }
    add('api/non-string-input-throws-TypeError', threw.length === 0, threw.join(','));
    add('api/empty-input-is-empty-output', [stripComments, stripSqlComments, stripYamlComments, stripShellComments, stripDockerfileComments, stripDotenvComments, stripCaddyfileComments].every((f) => f('') === ''), '');
    add('api/stripComments-equals-detailed-text', (() => {
      const s = 'a // x\n"//"';
      return stripComments(s) === stripCommentsDetailed(s).text;
    })(), '');
  }

  // 5. The runner itself can fail (the meta-lethality check): wrong expectations must be reported.
  {
    const wrongLost = { kind: 'js', input: 'a(); // CMT_M1', survive: ['CMT_M1'] }; // claims the comment survives
    const wrongKept = { kind: 'js', input: 'a(); // CMT_M2', vanish: ['a();'] }; // claims code vanishes
    const wrongCount = { kind: 'js', input: 'a(); // FORBIDDEN_TOKEN', counts: [['FORBIDDEN_TOKEN', 1]] };
    const wrongIssue = { kind: 'js', input: 'a();', issues: ['unterminated-string'] };
    const r = [wrongLost, wrongKept, wrongCount, wrongIssue].map((c) => real(c).length > 0);
    add('meta/runner-rejects-wrong-expectations', r.every(Boolean), JSON.stringify(r));
    const vacuous = caseIsNonVacuous({ kind: 'js', input: 'a();', vanish: ['NOT_IN_INPUT'] });
    add('meta/vacuous-case-is-detected', vacuous.length > 0, vacuous.join(';'));
    add('meta/empty-case-is-detected', caseIsNonVacuous({ kind: 'js', input: 'a();' }).length > 0, '');
  }

  // 6. Lethality: known-wrong strippers must FAIL the cases that exist to catch them, while the
  //    real stripper passes them; and a control must still PASS the easy cases (so it is a
  //    plausible implementation, not a strawman that fails everything).
  const byName = new Map(CASES.map((c) => [c.name, c]));
  const lethal = (label, impl, mustFail, mustPass = []) => {
    const problems = [];
    for (const n of mustFail) {
      const c = byName.get(n);
      if (!c) {
        problems.push(`unknown case ${n}`);
        continue;
      }
      if (real(c).length) problems.push(`REAL stripper fails ${n}`);
      if (judge(c, impl).length === 0) problems.push(`control SURVIVES ${n}`);
    }
    for (const n of mustPass) {
      const c = byName.get(n);
      if (!c) {
        problems.push(`unknown case ${n}`);
        continue;
      }
      if (judge(c, impl).length) problems.push(`control unexpectedly fails easy case ${n}`);
    }
    add(`lethality/${label}`, problems.length === 0, problems.join('; '));
  };
  lethal(
    'regex-line-deleter-killed (shape + strings + templates + regex + jsx)',
    wrongRegexLine,
    ['js/line-comment', 'js/string-with-slashes', 'js/template-text-slashes', 'js/regex-slashes', 'js/jsx-text-slashes'],
  );
  lethal(
    'quote-aware-but-template-regex-jsx-blind-stripper-killed',
    (s) => wrongStateful(s),
    ['js/template-text-slashes', 'js/template-expr-comment', 'js/regex-class-with-comment-opener', 'js/regex-with-quote-char', 'js/jsx-text-apostrophe', 'js/jsx-text-slashes'],
    ['js/line-comment', 'js/block-comment-multiline', 'js/string-with-slashes', 'js/escaped-quote-in-string'],
  );
  lethal(
    'newline-eating-stripper-killed (line numbers)',
    (s) => wrongStateful(s, { keepNewlines: false }),
    ['js/block-comment-multiline'],
    ['js/line-comment'],
  );
  lethal('sql-dash-regex-killed', wrongSql, ['sql/dashes-in-string', 'sql/doubled-quote-string', 'sql/quoted-identifier', 'sql/line-comment']);
  lethal(
    'yaml-hash-regex-killed',
    wrongYaml,
    ['yaml/hash-without-leading-space-is-content', 'yaml/double-quoted', 'yaml/single-quoted-doubled', 'yaml/multiline-double-quoted'],
  );
  lethal(
    'shell-hash-anywhere-stripper-killed',
    wrongHashAnywhere,
    ['sh/hash-inside-quotes-is-content', 'sh/hash-inside-a-word-is-content', 'sh/heredoc-body-is-data', 'sh/forbidden-token-in-string-and-heredoc-still-matches'],
    ['sh/full-line-and-trailing', 'sh/documented-absence-does-not-match'],
  );
  lethal(
    'shell-word-start-regex-stripper-killed (quotes, heredocs, substitutions)',
    wrongShellWordStartRegex,
    ['sh/hash-inside-quotes-is-content', 'sh/heredoc-body-is-data', 'sh/command-substitution-backtick-and-nested-quotes', 'sh/parameter-expansion-with-nested-quotes', 'sh/ansi-c-quote'],
    ['sh/full-line-and-trailing', 'sh/hash-inside-a-word-is-content'],
  );
  lethal(
    'dockerfile-hash-anywhere-stripper-killed',
    wrongHashAnywhere,
    ['docker/trailing-hash-is-content', 'docker/parser-directive-is-kept-at-the-top', 'docker/heredoc-body-is-data'],
    ['docker/full-line-comments', 'docker/documented-absence-does-not-match'],
  );
  lethal(
    'dockerfile-every-full-line-stripper-killed (directives, heredocs)',
    wrongFullLineOnly,
    ['docker/parser-directive-is-kept-at-the-top', 'docker/heredoc-body-is-data'],
    ['docker/full-line-comments', 'docker/trailing-hash-is-content'],
  );
  lethal(
    'dotenv-hash-anywhere-stripper-killed',
    wrongHashAnywhere,
    ['dotenv/full-line-only', 'dotenv/multi-line-quoted-value-is-data', 'dotenv/forbidden-token-in-value-still-matches'],
    ['dotenv/documented-absence-does-not-match'],
  );
  lethal(
    'dotenv-multi-line-blind-stripper-killed',
    wrongFullLineOnly,
    ['dotenv/multi-line-quoted-value-is-data', 'dotenv/single-quote-backtick-and-export', 'dotenv/escaped-quote-does-not-close-the-value'],
    ['dotenv/full-line-only', 'dotenv/documented-absence-does-not-match'],
  );
  lethal(
    'caddyfile-hash-anywhere-stripper-killed',
    wrongHashAnywhere,
    ['caddy/hash-inside-a-token-is-content', 'caddy/full-line-and-token-start', 'caddy/backtick-string-spans-lines', 'caddy/heredoc-body-is-data'],
    ['caddy/documented-absence-does-not-match'],
  );
  lethal(
    'yaml-stripper-blind-to-block-scalars-killed (indicators, tags, quoted keys)',
    wrongYamlNoBlocks,
    ['yaml/block-scalar-preserved-by-default', 'yaml/block-header-chomp-and-indent-indicators', 'yaml/block-header-tag-and-anchor', 'yaml/block-header-quoted-key'],
    ['yaml/full-line-and-trailing', 'yaml/documented-absence-does-not-match'],
  );
  lethal(
    'yaml-stripper-ignoring-run-mode-killed',
    (s) => ({ text: stripYamlComments(s), issues: [] }),
    ['yaml/run-mode-strips-shell-comments-in-run-bodies-only', 'yaml/run-mode-documented-absence-does-not-match', 'yaml/run-mode-body-at-end-of-file-without-newline'],
    ['yaml/default-mode-keeps-run-body-comments (documented, the safe direction)'],
  );
  lethal(
    'yaml-stripper-treating-every-block-as-run-killed (would hide content)',
    (s) => ({ text: stripYamlComments(s, { blockScalars: 'comments' }), issues: [] }),
    ['yaml/run-mode-strips-shell-comments-in-run-bodies-only', 'yaml/run-mode-key-must-be-exactly-run', 'yaml/run-mode-quoted-key-and-bare-sequence-dash'],
    ['yaml/comments-mode-strips-every-block-scalar'],
  );
  {
    // The historic lesson itself, run against a RAW scan (no stripping at all): the raw scan must
    // flag the documented-absence file (that is the false positive we exist to remove)...
    const doc = byName.get('js/documented-absence-does-not-match');
    const rawHits = countOf(doc.input, 'FORBIDDEN_TOKEN');
    const strippedHits = countOf(stripComments(doc.input), 'FORBIDDEN_TOKEN');
    add('lethality/raw-scan-false-positive-removed-by-strip', rawHits >= 2 && strippedHits === 0, `raw=${rawHits} stripped=${strippedHits}`);
    // ...and a stripper that over-strips (drops string contents) must be caught by the control file.
    const ctl = byName.get('js/forbidden-token-in-string-still-matches');
    const overStrip = (s) => ({ text: s.replace(/"[^"]*"/g, ''), issues: [] });
    add('lethality/over-stripping-stripper-killed (would hide a violation)', judge(ctl, overStrip).length > 0 && real(ctl).length === 0, '');
  }

  // 7. Deterministic oracle fuzz: real stripper clean, naive stripper dirty (so the oracle can fail).
  {
    const f = fuzzJs((s) => stripCommentsDetailed(s), 1500, 20260101);
    add('fuzz/oracle-clean-on-real-stripper (1500 programs)', f.failures === 0, f.firstFailure || '');
    add('fuzz/oracle-is-not-vacuous', f.keepMarkers > 1500 && f.goneMarkers > 1500, `keep=${f.keepMarkers} gone=${f.goneMarkers}`);
    const w = fuzzJs((s) => wrongStateful(s), 400, 20260101);
    add('lethality/fuzz-oracle-kills-quote-aware-naive-stripper', w.failures > 100, `naive failures=${w.failures}/400`);
  }

  // 7b. The same oracle for the shell stripper (real clean; the naive strippers must be dirty).
  {
    const f = fuzzJs((s) => stripShellCommentsDetailed(s), 1000, 20260102, SH_FRAGMENTS);
    add('fuzz/shell-oracle-clean-on-real-stripper (1000 programs)', f.failures === 0, f.firstFailure || '');
    add('fuzz/shell-oracle-is-not-vacuous', f.keepMarkers > 1000 && f.goneMarkers > 1000, `keep=${f.keepMarkers} gone=${f.goneMarkers}`);
    const w1 = fuzzJs(wrongHashAnywhere, 400, 20260102, SH_FRAGMENTS);
    add('lethality/shell-fuzz-oracle-kills-hash-anywhere-stripper', w1.failures > 100, `failures=${w1.failures}/400`);
    const w2 = fuzzJs(wrongShellWordStartRegex, 400, 20260102, SH_FRAGMENTS);
    add('lethality/shell-fuzz-oracle-kills-word-start-regex-stripper', w2.failures > 100, `failures=${w2.failures}/400`);
  }

  // 8. Documented limitation is real and bounded: with JSX detection OFF, a `//` in JSX text DOES
  //    blank the rest of its line. This pins the limit so nobody mistakes it for exactness.
  {
    const src = 'const el = <p>see http://h.test // LIM_J</p>; const k = 1;';
    const off = stripComments(src, { jsx: false });
    const on = stripComments(src);
    add('limits/jsx-off-reads-jsx-text-slashes-as-comment (documented limit)', !off.includes('const k = 1;') && on.includes('const k = 1;'), '');
  }

  return { ok: checks.every((c) => c.ok), checks };
}

// ---------------------------------------------------------------------------------------------
// MUTATION AUDIT (reproducible lethality proof for the IMPLEMENTATION, not just the controls).
//   node lib/strip.mjs --mutation-audit
// Each mutation damages exactly one behaviour of the implementation half of this file (everything
// above the self-test banner). The mutated module is imported from a data: URL and its selfTest()
// MUST fail; a mutant that survives means some behaviour is asserted by no case, and the repair
// is to strengthen the SUITE, never to weaken the mutant. A mutation whose `from` text is missing
// or ambiguous is reported as BAD-MUTATION (the audit then fails) instead of being skipped.
const L = (...lines) => lines.join('\n');
const MUTATIONS = [
  ['template-literal-blind', L("      if (c === '\x60') {", '        scanTemplate();'), L("      if (c === '\\u0000') {", '        scanTemplate();')],
  ['template-escape-ignored', L("      if (c === '\\\\') {", '        i += 2;', '        continue;', '      }', "      if (c === '\x60') {"), L('      if (false) {', '        i += 2;', '        continue;', '      }', "      if (c === '\x60') {")],
  ['template-expr-not-scanned-as-code', L('        if (!scanCode(true)) {', "          note('unterminated-template-expression', start);"), L("        if (!(i = src.indexOf('}', i), i >= 0)) {", "          note('unterminated-template-expression', start);")],
  ['regex-disabled', 'if (exprStart && tryRegex())', 'if (false && tryRegex())'],
  ['regex-class-ignored', L("      if (c === '[') {", '        inClass = true;'), L('      if (false) {', '        inClass = true;')],
  ['regex-escape-ignored', L("      if (c === '\\\\') {", '        if (j + 1 >= n || isLineTerm(src[j + 1])) return false;'), L('      if (false) {', '        if (j + 1 >= n || isLineTerm(src[j + 1])) return false;')],
  ['kw-return-removed', "'return', 'typeof',", "'typeof',"],
  ['afterdot-keyword-still-keyword', 'exprStart = !wasDot && KW_EXPR', 'exprStart = KW_EXPR'],
  ['ident-then-regex', 'exprStart = !wasDot && KW_EXPR.has(src.slice(s, i));', 'exprStart = true;'],
  ['paren-bracket-then-regex', L("      if (c === ')' || c === ']') {", '        i++;', '        exprStart = false;'), L("      if (c === ')' || c === ']') {", '        i++;', '        exprStart = true;')],
  ['number-then-regex', L("      if (c >= '0' && c <= '9') {", '        readNumber();', '        exprStart = false;'), L("      if (c >= '0' && c <= '9') {", '        readNumber();', '        exprStart = true;')],
  ['postfix-then-regex', L("i += 2; // ++ / -- : read as postfix, so a following '/' is division", '          exprStart = false;'), L('i += 2;', '          exprStart = true;')],
  ['string-escape-ignored', L("      if (c === '\\\\') {", "        if (src[i + 1] === '\\r' && src[i + 2] === '\\n') i += 3;"), L('      if (false) {', "        if (src[i + 1] === '\\r' && src[i + 2] === '\\n') i += 3;")],
  ['string-newline-resync-removed', "if (c === '\\n' || c === '\\r') break;", 'if (false) break;'],
  ['blank-eats-newlines', L("if (!isLineTerm(out[k])) out[k] = ' ';", '    if (spec > 0) journal.push(a, b);'), L("out[k] = ' ';", '    if (spec > 0) journal.push(a, b);')],
  ['unterminated-block-comment-silent', "      note('unterminated-block-comment', i);\n", ''],
  ['hashbang-ignored', "if (src.startsWith('#!')) lineComment();", ''],
  ['jsx-disabled', 'if (jsx && exprStart && jsxStartsAt(i)', 'if (false && exprStart && jsxStartsAt(i)'],
  ['jsx-no-rollback', L('      rollback(mark);', '      i = savedI;'), '      i = savedI;'],
  ['jsx-close-name-not-checked', 'return closeName === name;', 'return true;'],
  ['jsx-tag-trivia-comments-ignored', L('        blockComment();', '        continue;', '      }', '      return;'), L('        return;', '      }', '      return;')],
  ['jsx-spread-attribute-unsupported', 'if (!scanContainer()) return false; // spread attribute', 'return false;'],
  ['jsx-attr-container-unsupported', L("          } else if (v === '{') {", '            i++;'), L("          } else if (v === '{') {", '            return false;')],
  ['sql-comments-not-nested', L("          if (src[j] === '/' && src[j + 1] === '*') {", '            depth++;'), L('          if (false) {', '            depth++;')],
  ['sql-doubled-quote-ignored', 'if (src[i + 1] === "\'") {', 'if (false) {'],
  ['sql-E-escape-ignored', "if (esc && ch === '\\\\') {", 'if (false) {'],
  ['sql-dollar-quote-ignored', "if (c === '$' && (i === 0 || !sqlIdentChar(src[i - 1]))) {", 'if (false) {'],
  ['sql-body-comment-swallows-closer', 'if (k !== -1 && k < e) e = k;', ''],
  ['yaml-quote-always-opens', 'function yamlCanOpenQuote(line, j) {', 'function yamlCanOpenQuote(line, j) {\n  return true;'],
  ['yaml-quote-never-opens', 'function yamlCanOpenQuote(line, j) {', 'function yamlCanOpenQuote(line, j) {\n  return false;'],
  ['yaml-tag-anchor-quote-unsupported', "if (tok[0] === '!' || tok[0] === '&') return true;", ''],
  ['yaml-flow-quote-open-unsupported', "if (p === ':' || p === ',' || p === '[' || p === '{') return true;", "if (p === ':') return true;"],
  ['yaml-seq-dash-quote-unsupported', "if (p === '-' || p === '?') return hadSpace", 'if (p === \'-\' || p === \'?\') return false && hadSpace'],
  ['yaml-hash-needs-no-space', "if (c === '#' && (j === 0 || line[j - 1] === ' ' || line[j - 1] === '\\t')) {", "if (c === '#') {"],
  ['yaml-multiline-quote-reset', "const startedInQuote = quote !== '';", "const startedInQuote = quote !== ''; quote = '';"],
  ["yaml-comments-mode-ignored", "shell: mode === 'comments' || (mode === 'run' && keyName === 'run')", "shell: (mode === 'run' && keyName === 'run')"],
  ["yaml-run-mode-ignored", "(mode === 'run' && keyName === 'run')", "false"],
  ["yaml-run-key-not-checked", "(mode === 'run' && keyName === 'run')", "(mode === 'run')"],
  ["yaml-run-key-prefix-match", "keyName === 'run'", "(keyName || '').startsWith('run')"],
  ["yaml-run-key-quotes-not-removed", "km[1].replace(/^([\"'])(.*)\\1$/, '$2').trim()", "km[1].trim()"],
  ["yaml-run-body-not-flushed-on-dedent", "      flushBlock();\n    }\n\n    const startedInQuote", "      block = null;\n    }\n\n    const startedInQuote"],
  ["yaml-run-body-lines-not-held", "if (block.shell) block.held.push(line, eol);\n        else outParts.push(line, eol);", "outParts.push(line, eol);"],
  ["yaml-header-no-chomp-indent", "([1-9]?[+-]?|[+-][1-9]?)$/;", "()$/;"],
  ["yaml-header-no-tag-anchor", "(?:[!&]\\S+[ \\t]+)*([|>])", "([|>])"],
  ["yaml-header-no-seq-dash", "/^(\\s*(?:-[ \\t]+)*)(?:(?:\"", "/^(\\s*)(?:(?:\""],
  ["yaml-header-no-quoted-key", "(?:(?:\"[^\"]*\"|'[^']*'|[^\\s#'\"-][^:#]*?)[ \\t]*:[ \\t]+)?(?:[!&]", "(?:(?:[^\\s#'\"-][^:#]*?)[ \\t]*:[ \\t]+)?(?:[!&]"],
  ["yaml-key-regex-no-quoted-key", "const YAML_KEY_RE = /^(\"[^\"]*\"|'[^']*'|[^\\s#'\"-][^:#]*?)[ \\t]*:[ \\t]+/;", "const YAML_KEY_RE = /^([^\\s#'\"-][^:#]*?)[ \\t]*:[ \\t]+/;"],
  ["yaml-dq-escape-ignored", "      if (quote === '\"') {\n        if (c === '\\\\') {\n          j += 2;\n          continue;\n        }\n        if (c === '\"') quote = '';", "      if (quote === '\"') {\n        if (c === '\"') quote = '';"],
  ["yaml-sq-doubled-quote-ignored", "if (line[j + 1] === \"'\") {\n            j += 2;\n            continue;\n          }\n          quote = '';", "quote = '';"],
  ["string-crlf-continuation-unhandled", "if (src[i + 1] === '\\r' && src[i + 2] === '\\n') i += 3;\n        else i += 2;", "i += 2;"],
  ["jsx-dotted-names-unsupported", "k === 45 || k === 46 || k === 58;", "k === 45 || k === 58;"],
  ["jsx-namespaced-names-unsupported", "k === 45 || k === 46 || k === 58;", "k === 45 || k === 46;"],
  ["jsx-hyphenated-names-unsupported", "k === 45 || k === 46 || k === 58;", "k === 46 || k === 58;"],
  ["jsx-nested-elements-unsupported", "if (!jsxElement()) return false;\n        continue;\n      }\n      i++; // raw JSX text", "i++; continue;\n      }\n      i++; // raw JSX text"],
  ["jsx-element-attribute-value-unsupported", "} else if (v === '<') {\n            if (!jsxElement()) return false;", "} else if (v === '<') {\n            return false;"],
  ["js-template-unterminated-note-removed", "note('unterminated-template', start);\n    return false;", "return false;"],
  ["js-template-expr-unterminated-note-removed", "note('unterminated-template-expression', start);\n          i = n;", "i = n;"],
  ["js-string-unterminated-note-removed", "note('unterminated-string', start);\n    return false;", "return false;"],
  ["sql-unterminated-string-note-removed", "note('unterminated-string', start);\n            break;", "break;"],
  ["sql-unterminated-ident-note-removed", "note('unterminated-quoted-identifier', start);\n            break;", "break;"],
  ["sql-unterminated-dollar-note-removed", "if (!scan(m[0])) note('unterminated-dollar-quote', start);", "scan(m[0]);"],
  ["sh-hash-needs-no-word-start", "if (c === '#' && wordStart && comments) {", "if (c === '#' && comments) {"],
  ["sh-comments-everywhere", "const comments = kind === 'top' || kind === 'cmd';", "const comments = true;"],
  ["sh-comments-not-in-command-substitution", "const comments = kind === 'top' || kind === 'cmd';", "const comments = kind === 'top';"],
  ["sh-single-quote-blind", "if (c === \"'\") {\n        scanSq();\n        wordStart = false;", "if (false) {\n        scanSq();\n        wordStart = false;"],
  ["sh-double-quote-blind", "if (c === '\"') {\n        scanDq();\n        wordStart = false;", "if (false) {\n        scanDq();\n        wordStart = false;"],
  ["sh-dollar-blind", "if (c === '$') {\n        dollar(false);\n        wordStart = false;", "if (false) {\n        dollar(false);\n        wordStart = false;"],
  ["sh-dollar-leaves-word-start-open", "dollar(false);\n        wordStart = false;", "dollar(false);\n        wordStart = true;"],
  ["sh-backslash-escape-blind", "if (c === '\\\\') {\n        const d = src[i + 1];", "if (false) {\n        const d = src[i + 1];"],
  ["sh-continuation-resets-word-state", "if (d === '\\n') i += 2;", "if (d === '\\n') { i += 2; wordStart = true; }"],
  ["sh-crlf-continuation-unhandled", "else if (d === '\\r' && src[i + 2] === '\\n') i += 3;", ""],
  ["sh-arithmetic-allows-heredoc", "if (kind !== 'arith' && src[i + 1] === '<') {", "if (src[i + 1] === '<') {"],
  ["sh-double-paren-command-unsupported", "if (src[i + 1] === '(') {\n          const s = i;", "if (false) {\n          const s = i;"],
  ["sh-heredoc-ignored", "heredocSpec(heredocs);\n          wordStart = true;", "i += 2;\n          wordStart = true;"],
  ["sh-heredoc-dash-tabs-ignored", "const cmp = h.dash ? line.replace(/^\\t+/, '') : line;", "const cmp = line;"],
  ["sh-heredoc-quoted-delimiter-unsupported", "if (ch === \"'\") {\n        const e = src.indexOf(\"'\", j + 1);", "if (false) {\n        const e = src.indexOf(\"'\", j + 1);"],
  ["sh-heredoc-crlf-terminator", "if (line.endsWith('\\r')) line = line.slice(0, -1);\n        const cmp", "const cmp"],
  ["sh-heredoc-unterminated-note-removed", "note('unterminated-heredoc', h.pos);\n          break;", "break;"],
  ["sh-heredoc-pending-at-eof-not-reported", "if (heredocs.length) for (const h of heredocs) note('unterminated-heredoc', h.pos);", ""],
  ["sh-parameter-single-quote-in-dq", "if (c === \"'\" && !inDq) {\n        scanSq();\n        continue;\n      }\n      if (c === '$') {\n        dollar(inDq);", "if (c === \"'\") {\n        scanSq();\n        continue;\n      }\n      if (c === '$') {\n        dollar(inDq);"],
  ["sh-parameter-nested-double-quote-blind", "if (c === '\"') {\n        scanDq();\n        continue;\n      }\n      if (c === \"'\" && !inDq) {", "if (false) {\n        scanDq();\n        continue;\n      }\n      if (c === \"'\" && !inDq) {"],
  ["sh-parameter-escape-blind", "if (c === '\\\\') {\n        i += 2;\n        continue;\n      }\n      if (c === '}') {", "if (false) {\n        i += 2;\n        continue;\n      }\n      if (c === '}') {"],
  ["sh-double-quote-escape-blind", "if (c === '\\\\') {\n        i += 2;\n        continue;\n      }\n      if (c === '\"') {\n        i++;\n        return true;\n      }", "if (false) {\n        i += 2;\n        continue;\n      }\n      if (c === '\"') {\n        i++;\n        return true;\n      }"],
  ["sh-ansi-c-quote-unsupported", "if (d === \"'\" && !inDq) {\n      scanAnsiC();", "if (false) {\n      scanAnsiC();"],
  ["sh-ansi-c-escape-blind", "if (c === '\\\\') {\n        i += 2;\n        continue;\n      }\n      if (c === \"'\") {\n        i++;\n        return true;\n      }", "if (false) {\n        i += 2;\n        continue;\n      }\n      if (c === \"'\") {\n        i++;\n        return true;\n      }"],
  ["sh-substitution-parenthesis-depth-ignored", "if ((kind === 'cmd' || kind === 'arith') && depth === 0) {", "if (kind === 'cmd' || kind === 'arith') {"],
  ["sh-arithmetic-second-paren-not-consumed", "if (!scanCode('arith')) note('unterminated-arithmetic', start);\n        else if (src[i] === ')') i++;", "if (!scanCode('arith')) note('unterminated-arithmetic', start);"],
  ["sh-backtick-closer-unrecognised", "if (kind === 'tick') {\n          i++;\n          return true;\n        }", "if (false) {\n          i++;\n          return true;\n        }"],
  ["sh-metacharacter-keeps-word-open", "if (c === ';' || c === '|' || c === '&' || c === '>') {\n        i++;\n        wordStart = true;", "if (c === ';' || c === '|' || c === '&' || c === '>') {\n        i++;\n        wordStart = false;"],
  ["sh-close-paren-keeps-word-open", "if (depth > 0) depth--;\n        i++;\n        wordStart = true;", "if (depth > 0) depth--;\n        i++;\n        wordStart = false;"],
  ["sh-space-keeps-word-open", "if (isSpace(c)) {\n        i++;\n        wordStart = true;", "if (isSpace(c)) {\n        i++;\n        wordStart = false;"],
  ["sh-newline-keeps-word-open", "i++;\n        wordStart = true;\n        if (heredocs.length) readHeredocs(heredocs);", "i++;\n        wordStart = false;\n        if (heredocs.length) readHeredocs(heredocs);"],
  ["sh-ordinary-char-opens-word", "i++;\n      wordStart = false;\n    }\n    if (heredocs.length)", "i++;\n      wordStart = true;\n    }\n    if (heredocs.length)"],
  ["sh-quoted-string-opens-word", "if (c === \"'\") {\n        scanSq();\n        wordStart = false;", "if (c === \"'\") {\n        scanSq();\n        wordStart = true;"],
  ["sh-single-quote-unterminated-note-removed", "if (e === -1) {\n      note('unterminated-string', start);", "if (e === -1) {"],
  ["sh-double-quote-unterminated-note-removed", "note('unterminated-string', start);\n    i = n;\n    return false;\n  }\n  function scanParam", "i = n;\n    return false;\n  }\n  function scanParam"],
  ["sh-substitution-unterminated-note-removed", "if (!scanCode('cmd')) note('unterminated-command-substitution', start);", "scanCode('cmd');"],
  ["sh-backtick-unterminated-note-removed", "if (!scanCode('tick')) note('unterminated-backtick', s);\n        wordStart = false;", "scanCode('tick');\n        wordStart = false;"],
  ["sh-parameter-unterminated-note-removed", "note('unterminated-parameter-expansion', start);\n    i = n;", "i = n;"],
  ["docker-directive-not-kept", "if (DOCKER_DIRECTIVE_RE.test(line)) {", "if (false) {"],
  ["docker-directive-window-never-closes", "directives = false;\n    }\n    if (/^[ \\t]*#/.test(line)) {", "}\n    if (/^[ \\t]*#/.test(line)) {"],
  ["docker-heredoc-ignored", "if (instr === 'RUN' || instr === 'COPY' || instr === 'ADD') {", "if (false) {"],
  ["docker-heredoc-on-any-instruction", "if (instr === 'RUN' || instr === 'COPY' || instr === 'ADD') {", "if (true) {"],
  ["docker-continued-line-forgets-instruction", "if (!continued) {\n      const m = /^[ \\t]*([A-Za-z]+)/.exec(line);", "if (true) {\n      const m = /^[ \\t]*([A-Za-z]+)/.exec(line);"],
  ["docker-heredoc-quoted-delimiter-unsupported", "(?:\"([^\"\\r\\n]+)\"|'([^'\\r\\n]+)'|([A-Za-z_][A-Za-z0-9_]*))/g;", "(?:()()([A-Za-z_][A-Za-z0-9_]*))/g;"],
  ["docker-heredoc-unterminated-note-removed", "if (pending.length) issues.push({ kind: 'unterminated-heredoc', line: heredocFrom });", ""],
  ["docker-trailing-hash-stripped", "if (/^[ \\t]*#/.test(line)) {\n      outParts.push(blankKeep(line), eol);\n      continue;\n    }\n    if (!continued) {", "if (/^[ \\t]*#/.test(line) || /\\s#/.test(line)) {\n      outParts.push(blankKeep(line), eol);\n      continue;\n    }\n    if (!continued) {"],
  ["dotenv-multi-line-value-ignored", "if (closeIn(line, q, m[0].length) === -1) {", "if (false) {"],
  ["dotenv-open-value-closes-after-one-line", "if (closeIn(line, open, 0) !== -1) open = '';", "open = '';"],
  ["dotenv-double-quote-escape-ignored", "if (q !== '`' && q !== \"'\" && text[j] === '\\\\') {", "if (false) {"],
  ["dotenv-single-quote-escape-honoured", "if (q !== '`' && q !== \"'\" && text[j] === '\\\\') {", "if (text[j] === '\\\\') {"],
  ["dotenv-export-prefix-unsupported", "(?:export[ \\t]+)?[A-Za-z_]", "[A-Za-z_]"],
  ["dotenv-unterminated-note-removed", "if (open !== '') issues.push({ kind: 'unterminated-string', line: openLine });", ""],
  ["dotenv-trailing-hash-stripped", "if (/^[ \\t]*#/.test(line)) {\n      outParts.push(blankKeep(line), eol);\n      continue;\n    }\n    outParts.push(line, eol);\n    const m", "if (/^[ \\t]*#/.test(line) || /\\s#/.test(line)) {\n      outParts.push(blankKeep(line), eol);\n      continue;\n    }\n    outParts.push(line, eol);\n    const m"],
  ["caddy-hash-needs-no-token-start", "if (c === '#' && wordStart) {", "if (c === '#') {"],
  ["caddy-double-quote-escape-ignored", "if (src[i] === '\\\\') {\n          i += 2;\n          continue;\n        }\n        if (src[i] === '\"') {", "if (src[i] === '\"') {"],
  ["caddy-backtick-string-unsupported", "if (c === '`') {\n      const start = i;", "if (false) {\n      const start = i;"],
  ["caddy-heredoc-unsupported", "if (c === '<' && wordStart && src[i + 1] === '<') {", "if (false) {"],
  ["caddy-heredoc-closer-with-trailing-tokens", " || line.startsWith(marker + ' ') || line.startsWith(marker + '\\t')", ""],
  ["caddy-backslash-escape-ignored", "if (c === '\\\\') {\n      i += 2;\n      wordStart = false;", "if (false) {\n      i += 2;\n      wordStart = false;"],
  ["caddy-quoted-string-opens-token-boundary", "i = n;\n      }\n      wordStart = false;\n      continue;\n    }\n    if (c === '`') {", "i = n;\n      }\n      wordStart = true;\n      continue;\n    }\n    if (c === '`') {"],
  ["caddy-unterminated-string-note-removed", "if (!closed) {\n        issues.push({ kind: 'unterminated-string', line: lineOf(start) });", "if (!closed) {"],
  ["caddy-unterminated-heredoc-at-eof-not-reported", "if (marker !== null) issues.push({ kind: 'unterminated-heredoc', line: lineOf(markerPos) });\n  return", "return"],
  ["sh-heredoc-delimiter-may-contain-redirect", "const SH_META = ';|&()<>';", "const SH_META = ';|&()>';"],
  ["sh-double-paren-unterminated-note-removed", "if (!scanCode('arith')) note('unterminated-arithmetic', s);\n          else if (src[i] === ')') i++;", "scanCode('arith');\n          if (src[i] === ')') i++;"],
  ["docker-heredoc-dash-tabs-ignored", "const cmp = pending[0].dash ? line.replace(/^\\t+/, '') : line;", "const cmp = line;"],
  ["js-issue-line-number-off-by-one", "return lo + 1;\n  };\n  const note = (kind, pos) => {\n    if (issues.length < 100) issues.push({ kind, line: lineNo(pos) });\n  };\n\n  function blank(a, b) {", "return lo;\n  };\n  const note = (kind, pos) => {\n    if (issues.length < 100) issues.push({ kind, line: lineNo(pos) });\n  };\n\n  function blank(a, b) {"],
  ["js-issue-list-uncapped", "    if (issues.length < 100) issues.push({ kind, line: lineNo(pos) });\n  };\n\n  function blank(a, b) {", "    issues.push({ kind, line: lineNo(pos) });\n  };\n\n  function blank(a, b) {"],
  ["sql-issue-line-number-off-by-one", "return lo + 1;\n  };\n  const note = (kind, pos) => {\n    if (issues.length < 100) issues.push({ kind, line: lineNo(pos) });\n  };\n  const blank = (a, b) => {\n    if (b > n) b = n;\n    for (let k = a; k < b; k++) if (!isLineTerm(out[k])) out[k] = ' ';\n  };\n\n  // closer", "return lo;\n  };\n  const note = (kind, pos) => {\n    if (issues.length < 100) issues.push({ kind, line: lineNo(pos) });\n  };\n  const blank = (a, b) => {\n    if (b > n) b = n;\n    for (let k = a; k < b; k++) if (!isLineTerm(out[k])) out[k] = ' ';\n  };\n\n  // closer"],
  ["sql-issue-list-uncapped", "    if (issues.length < 100) issues.push({ kind, line: lineNo(pos) });\n  };\n  const blank = (a, b) => {\n    if (b > n) b = n;\n    for (let k = a; k < b; k++) if (!isLineTerm(out[k])) out[k] = ' ';\n  };\n\n  // closer", "    issues.push({ kind, line: lineNo(pos) });\n  };\n  const blank = (a, b) => {\n    if (b > n) b = n;\n    for (let k = a; k < b; k++) if (!isLineTerm(out[k])) out[k] = ' ';\n  };\n\n  // closer"],
  ["sh-issue-line-number-off-by-one", "return lo + 1;\n  };\n  const note = (kind, pos) => {\n    if (issues.length < 100) issues.push({ kind, line: lineNo(pos) });\n  };\n  const blank = (a, b) => {\n    if (b > n) b = n;\n    for (let k = a; k < b; k++) if (!isLineTerm(out[k])) out[k] = ' ';\n  };\n  const isSpace", "return lo;\n  };\n  const note = (kind, pos) => {\n    if (issues.length < 100) issues.push({ kind, line: lineNo(pos) });\n  };\n  const blank = (a, b) => {\n    if (b > n) b = n;\n    for (let k = a; k < b; k++) if (!isLineTerm(out[k])) out[k] = ' ';\n  };\n  const isSpace"],
  ["sh-issue-list-uncapped", "    if (issues.length < 100) issues.push({ kind, line: lineNo(pos) });\n  };\n  const blank = (a, b) => {\n    if (b > n) b = n;\n    for (let k = a; k < b; k++) if (!isLineTerm(out[k])) out[k] = ' ';\n  };\n  const isSpace", "    issues.push({ kind, line: lineNo(pos) });\n  };\n  const blank = (a, b) => {\n    if (b > n) b = n;\n    for (let k = a; k < b; k++) if (!isLineTerm(out[k])) out[k] = ' ';\n  };\n  const isSpace"],
  ["docker-issue-line-number-lost", "lineNo++;\n    if (pending.length) {", "if (pending.length) {"],
  ["dotenv-issue-line-number-lost", "lineNo++;\n    if (open !== '') {", "if (open !== '') {"],
  ["caddy-issue-line-number-off-by-one", "let c = 1;\n    for (let k = 0; k < pos", "let c = 0;\n    for (let k = 0; k < pos"],
  ["yaml-closing-quote-line-read-as-header", "if (quote === '' && !startedInQuote) {", "if (quote === '') {"],
  ["sql-cr-line-ending-unrecognised", "src[e] !== '\\n' && src[e] !== '\\r'", "src[e] !== '\\n'"],
  ["sql-dollar-quote-opens-after-identifier", "(i === 0 || !sqlIdentChar(src[i - 1]))", "true"],
  ["sql-E-escape-after-identifier-character", "&& (i < 2 || !sqlIdentChar(src[i - 2]))", ""],
  ["sql-dollar-closer-ignored", "if (closer !== null && c === '$' && src.startsWith(closer, i)) {", "if (false) {"],
  ["js-regex-after-spread-unrecognised", "i += 3;\n          exprStart = true;", "i += 3;\n          exprStart = false;"],
  ["js-regex-after-closing-brace", "if (depth > 0) depth--;\n        i++;\n        exprStart = false;\n        continue;\n      }\n      if (c === ')' || c === ']') {", "if (depth > 0) depth--;\n        i++;\n        exprStart = true;\n        continue;\n      }\n      if (c === ')' || c === ']') {"],
  ["js-division-after-opening-brace", "depth++;\n        i++;\n        exprStart = true;", "depth++;\n        i++;\n        exprStart = false;"],
  ["js-division-after-binary-plus-minus", "i++;\n        exprStart = true;\n        continue;\n      }\n      if (isIdentStart(c)) {", "i++;\n        exprStart = false;\n        continue;\n      }\n      if (isIdentStart(c)) {"],
  ["js-division-after-less-than", "i++;\n        exprStart = true;\n        continue;\n      }\n      if (c === '.') {", "i++;\n        exprStart = false;\n        continue;\n      }\n      if (c === '.') {"],
  ["jsx-attribute-string-honours-escapes", "const e = src.indexOf(v, i + 1); // JSX attribute strings have no escapes", "let e = i + 1; while (e < n && src[e] !== v) { if (src[e] === '\\\\') e++; e++; } if (e >= n) e = -1;"],
  ["js-non-ascii-whitespace-unrecognised", "return (k > 127 || c === '\\v' || c === '\\f') && WS_RE.test(c);", "return (c === '\\v' || c === '\\f') && WS_RE.test(c);"],
  ["js-private-name-not-an-identifier", "k === 36 || k === 92 || k === 35;", "k === 36 || k === 92;"],
  ["js-failed-jsx-attempt-keeps-its-issues", "issues.length = savedIssues;", ""],
  ["sql-quoted-identifier-doubled-quote-ignored", "if (src[i + 1] === '\"') {", "if (false) {"],
  ["yaml-run-body-issue-line-offset", "line: x.line + block.firstLine - 1", "line: x.line"],
  ["yaml-run-body-issues-dropped", "for (const x of r.issues) if (issues.length < 100) issues.push({ kind: x.kind, line: x.line + block.firstLine - 1 });", ""],
  ["yaml-run-body-first-line-off-by-one", "firstLine: p / 2 + 2", "firstLine: p / 2 + 1"],
  ["yaml-block-scalar-undetected", "block = { parentIndent, shell: mode === 'comments' || (mode === 'run' && keyName === 'run'), held: [], firstLine: p / 2 + 2 };", "block = null;"],
  ["yaml-run-body-not-flushed-at-eof", "  flushBlock();\n  return { text: outParts.join(''), issues };", "  return { text: outParts.join(''), issues };"],
];

export async function mutationAudit() {
  const full = readFileSync(fileURLToPath(import.meta.url), 'utf8');
  const cut = full.indexOf('// SELF' + '-TEST'); // the banner; everything before it is the implementation
  if (cut < 0) return { ok: false, results: [{ name: '(setup)', status: 'BAD-MUTATION', detail: 'banner not found' }] };
  // The unmutated module must be GREEN first: otherwise every mutant would "die" of the baseline.
  const baseline = selfTest();
  if (!baseline.ok) {
    const names = baseline.checks.filter((c) => !c.ok).map((c) => c.name);
    return { ok: false, results: [{ name: '(baseline)', status: 'BAD-MUTATION', detail: `unmutated selfTest is not green: ${names.slice(0, 3).join(' | ')}` }] };
  }
  const impl = full.slice(0, cut);
  const rest = full.slice(cut);
  const results = [];
  for (const [name, from, to] of MUTATIONS) {
    const first = impl.indexOf(from);
    if (first === -1 || impl.indexOf(from, first + 1) !== -1) {
      results.push({ name, status: 'BAD-MUTATION', detail: first === -1 ? 'from-text not found' : 'from-text ambiguous' });
      continue;
    }
    const mutated = impl.replace(from, () => to) + rest;
    if (mutated === full) {
      results.push({ name, status: 'BAD-MUTATION', detail: 'mutation changed nothing' });
      continue;
    }
    let verdict;
    try {
      const mod = await import('data:text/javascript;base64,' + Buffer.from(mutated, 'utf8').toString('base64'));
      verdict = mod.selfTest();
    } catch (e) {
      // A mutant that cannot even run has NOT been killed by a check (harness or syntax failure):
      // count it as a bad mutation so it can never inflate the score.
      results.push({ name, status: 'BAD-MUTATION', detail: `mutant did not run: ${e && e.name}: ${e && e.message}` });
      continue;
    }
    const failing = verdict.checks.filter((c) => !c.ok).map((c) => c.name);
    results.push(verdict.ok ? { name, status: 'SURVIVED', detail: '' } : { name, status: 'killed', detail: failing.slice(0, 2).join(' | ') + (failing.length > 2 ? ` (+${failing.length - 2})` : '') });
  }
  return { ok: results.every((r) => r.status === 'killed'), results };
}

// ---------------------------------------------------------------------------------------------
function isMain(metaUrl) {
  try {
    return !!process.argv[1] && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(metaUrl));
  } catch {
    return false;
  }
}

if (isMain(import.meta.url) && process.argv.includes('--mutation-audit')) {
  // .then(), not top-level await: a TLA module cannot be require()d by a CommonJS caller.
  mutationAudit().then(
    (a) => {
      for (const r of a.results) console.log(`${r.status.padEnd(12)} ${r.name.padEnd(38)} ${r.detail}`);
      const bad = a.results.filter((r) => r.status !== 'killed').length;
      console.log(`strip.mjs mutation-audit: ${a.ok ? 'PASS' : 'FAIL'} (${a.results.length - bad}/${a.results.length} mutants killed)`);
      process.exitCode = a.ok ? 0 : 1;
    },
    (e) => {
      console.log(`strip.mjs mutation-audit: ERROR ${e && e.name}: ${e && e.message}`);
      process.exitCode = 1;
    },
  );
} else if (isMain(import.meta.url)) {
  const r = selfTest();
  const failed = r.checks.filter((c) => !c.ok);
  const verbose = process.argv.includes('--verbose');
  if (verbose) for (const c of r.checks) console.log(`${c.ok ? 'ok  ' : 'FAIL'} ${c.name}${c.detail ? ' -- ' + c.detail : ''}`);
  else for (const c of failed) console.log(`FAIL ${c.name} -- ${c.detail}`);
  console.log(`strip.mjs selfTest: ${r.ok ? 'PASS' : 'FAIL'} (${r.checks.length - failed.length}/${r.checks.length} checks)`);
  process.exitCode = r.ok ? 0 : 1;
}
