/**
 * Refusal Registry — falsification harness (shared runtime)
 *
 * Companion to docs/architecture/REFUSAL_REGISTRY.md.
 *
 * A refusal in the Registry is a claim: "the runtime is structurally prevented
 * from taking action X." A test here is a PROOF ATTEMPT against that claim — it
 * tries to demonstrate the refusal is real, or surfaces that it is not.
 *
 * These are SOURCE-LEVEL structural assertions (absence of a construct across a
 * module), not behavioural tests — because the claims are of the form "no code
 * path exists," which behaviour on exercised paths can never prove. This mirrors
 * the project's established idiom (scripts/verify-colab-boundaries.ts,
 * scripts/check-*.ts, scripts/guards/*.ts): structurally enforced, not assumed.
 *
 * Each check carries its jurisdiction discipline explicitly:
 *   - refusal                    what is refused
 *   - enforcedBy                 the file/path that enforces it
 *   - violationAttempted         what this proof attempt tries to find
 *   - passingAuthorizes          what a PASS lets you claim
 *   - passingDoesNotAuthorize    what a PASS does NOT let you claim
 *   - hostileForkMustChange      the diff a fork would need to defeat it
 *
 * Usage:
 *   npx tsx tests/constitutional/refusal-registry/index.ts
 *
 * Exit code is non-zero if any refusal is falsified (FAIL). WARN does not fail
 * the suite but is surfaced. States: PASS / FAIL / WARN / NOTE — current
 * structural assessments, not declarations. Canon: docs/canon/VERIFICATION_STATES.md
 */

import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { execSync } from 'node:child_process';

export const REPO_ROOT = process.cwd();

export interface CheckIO {
  pass(label: string, detail?: string): void;
  fail(label: string, detail?: string): void;
  warn(label: string, detail?: string): void;
  note(label: string, detail?: string): void;
  /** Read a repo-relative file. Throws (→ FAIL for the check) if missing. */
  read(relPath: string): string;
  /** Return matching `path:line:text` lines for an extended-regex across paths. */
  grep(pattern: string, paths: string[]): string[];
  exists(relPath: string): boolean;
}

/**
 * A check could not locate its own anchor, so it can prove NOTHING either way.
 *
 * This is a TOOLING failure, never a demonstrated breach. It exists because the
 * opposite — a detector that silently degrades and then reports a red that reads
 * like a constitutional violation — is worse than no detector at all: it spends
 * the registry's credibility on noise, and it hides real breaches inside a
 * failure everyone learns to ignore.
 *
 * Provenance: on 2026-09-04 five assertions across R19 and R21 reported red with
 * `@NaN` line numbers while every guard they police was intact and correctly
 * ordered. Cause: `lineOf()` parsed field [1] of a `path:line:text` grep line,
 * but GNU grep OMITS the filename when `-r` is given exactly one non-directory
 * operand (BSD grep and ugrep include it). Field [1] was therefore the source
 * text, and `parseInt('      await …')` → NaN; every `NaN < NaN` comparison is
 * false, so each ordering assertion failed closed and looked like a breach.
 * Whether the registry was red depended on which grep was first on PATH.
 */
export class DetectorDefect extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DetectorDefect';
  }
}

/** The format every `grep()` result line is contractually required to have. */
const GREP_LINE = /^(.*?):(\d+):/;

/**
 * Line number of the first match.
 *
 * Returns -1 for NO MATCHES — an absent anchor is a substantive result the
 * caller must interpret (a missing guard is a breach; a missing INSERT is not).
 * It never returns NaN: an unparseable match is a DetectorDefect, not a verdict.
 */
export function lineOf(matches: string[]): number {
  if (matches.length === 0) return -1;
  const m = GREP_LINE.exec(matches[0]);
  if (!m) {
    throw new DetectorDefect(
      `grep output did not match the required "path:line:text" contract, so no line ` +
        `number could be located. Offending line: ${JSON.stringify(matches[0])}`
    );
  }
  return parseInt(m[2], 10);
}

/**
 * Line number of the first match, where ABSENCE means the detector has lost its
 * anchor rather than that a guard is missing. Use for structural landmarks
 * (a handler signature, the INSERT an assertion orders a guard against) whose
 * disappearance invalidates the assertion instead of proving a violation.
 */
export function requireLine(matches: string[], anchor: string): number {
  if (matches.length === 0) {
    throw new DetectorDefect(
      `anchor not found: ${anchor}. This assertion orders other code against this ` +
        `landmark; without it the assertion proves nothing either way. Re-point the ` +
        `detector at where the construct moved — do not relax the assertion.`
    );
  }
  return lineOf(matches);
}

/**
 * Line numbers of EVERY match, in grep order.
 *
 * `lineOf` answers "where is the first one" — adequate for existence, and the
 * reason R21's ordering assertions were weaker than they read: comparing the
 * first guard against the first write cannot speak about the second write.
 * An unparseable match is a DetectorDefect here too, never a NaN in the array.
 */
export function linesOf(matches: string[]): number[] {
  return matches.map((raw) => {
    const m = GREP_LINE.exec(raw);
    if (!m) {
      throw new DetectorDefect(
        `grep output did not match the required "path:line:text" contract, so no line ` +
          `number could be located. Offending line: ${JSON.stringify(raw)}`
      );
    }
    return parseInt(m[2], 10);
  });
}

/**
 * Line numbers of every match, where ABSENCE means the detector lost its anchor.
 * Multi-match sibling of `requireLine`.
 */
export function requireLines(matches: string[], anchor: string): number[] {
  if (matches.length === 0) {
    throw new DetectorDefect(
      `anchor not found: ${anchor}. This assertion orders other code against this ` +
        `landmark; without it the assertion proves nothing either way. Re-point the ` +
        `detector at where the construct moved — do not relax the assertion.`
    );
  }
  return linesOf(matches);
}

/* ────────────────────────────────────────────────────────────────────────────
 * Guard domination
 *
 * Line order alone is too weak to prove a guard governs a write. A guard on
 * line 113 precedes an INSERT on line 281, but if the guard is in `addTurn`
 * and the INSERT is in `addExchange` it governs nothing about that INSERT.
 * A hostile or careless fork could add an unguarded write anywhere BELOW the
 * first guard and a first-match ordering assertion would still report green.
 *
 * Domination here means BOTH: the guard precedes the write, AND the guard sits
 * in the same innermost function scope as the write. Scopes come from a real
 * tokenizer (strings, template literals and comments masked out), because
 * brace-counting over raw source miscounts on the very SQL string literals
 * these stores are made of.
 * ──────────────────────────────────────────────────────────────────────────── */

/** A function body: the span a guard's authority reaches, and no further. */
export interface Scope {
  name: string;
  startLine: number;
  endLine: number;
}

type ScanMode =
  | { kind: 'code' }
  | { kind: 'line' }
  | { kind: 'block' }
  | { kind: 'sq' }
  | { kind: 'dq' }
  | { kind: 'tpl' }
  | { kind: 'expr'; depth: number };

/**
 * Mask of "this character is real code" — 0 inside strings, template literals
 * and comments. Unterminated constructs raise DetectorDefect rather than
 * silently shifting every scope boundary in the file.
 */
function codeMask(src: string, relPath: string): Uint8Array {
  const mask = new Uint8Array(src.length);
  const stack: ScanMode[] = [{ kind: 'code' }];
  let i = 0;

  while (i < src.length) {
    const top = stack[stack.length - 1];
    const c = src[i];
    const d = i + 1 < src.length ? src[i + 1] : '';

    if (top.kind === 'line') {
      if (c === '\n') stack.pop();
      i++;
      continue;
    }
    if (top.kind === 'block') {
      if (c === '*' && d === '/') {
        stack.pop();
        i += 2;
        continue;
      }
      i++;
      continue;
    }
    if (top.kind === 'sq' || top.kind === 'dq') {
      if (c === '\\') {
        i += 2;
        continue;
      }
      // A quote never spans a newline in valid TS; recovering at EOL keeps one
      // apostrophe in a comment from swallowing the rest of the file.
      if (c === '\n') {
        stack.pop();
        i++;
        continue;
      }
      if ((top.kind === 'sq' && c === "'") || (top.kind === 'dq' && c === '"')) stack.pop();
      i++;
      continue;
    }
    if (top.kind === 'tpl') {
      if (c === '\\') {
        i += 2;
        continue;
      }
      if (c === '`') {
        stack.pop();
        i++;
        continue;
      }
      if (c === '$' && d === '{') {
        stack.push({ kind: 'expr', depth: 0 });
        i += 2;
        continue;
      }
      i++;
      continue;
    }

    // 'code' and 'expr' both behave as executable context.
    if (c === '/' && d === '/') {
      stack.push({ kind: 'line' });
      i += 2;
      continue;
    }
    if (c === '/' && d === '*') {
      stack.push({ kind: 'block' });
      i += 2;
      continue;
    }
    if (c === "'") {
      stack.push({ kind: 'sq' });
      i++;
      continue;
    }
    if (c === '"') {
      stack.push({ kind: 'dq' });
      i++;
      continue;
    }
    if (c === '`') {
      stack.push({ kind: 'tpl' });
      i++;
      continue;
    }
    if (top.kind === 'expr') {
      if (c === '{') {
        top.depth++;
      } else if (c === '}') {
        if (top.depth === 0) {
          stack.pop();
          i++;
          continue;
        }
        top.depth--;
      }
    }
    mask[i] = 1;
    i++;
  }

  if (stack.length !== 1 || stack[0].kind !== 'code') {
    throw new DetectorDefect(
      `could not tokenize ${relPath}: an unterminated ${stack[stack.length - 1].kind} ` +
        `construct left the scanner mid-literal, so function boundaries cannot be ` +
        `located and no domination claim can be adjudicated.`
    );
  }
  return mask;
}

/** Statement keywords that take a parenthesis but are not function definitions. */
const NOT_A_FUNCTION = new Set([
  'if', 'for', 'while', 'switch', 'catch', 'return', 'await', 'typeof', 'new',
  'do', 'else', 'yield', 'throw', 'void', 'delete', 'in', 'of', 'case', 'with',
]);

const FUNCTION_STARTS: RegExp[] = [
  // export async function name( … )   |   function* name( … )
  /^\s*(?:export\s+)?(?:default\s+)?(?:async\s+)?function\s*\*?\s*([A-Za-z_$][\w$]*)\s*[<(]/,
  // const name = async ( … ) =>   |   const name = function ( … )
  /^\s*(?:export\s+)?(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*(?::[^=]+)?=\s*(?:async\s+)?(?:function\s*\*?\s*[A-Za-z_$][\w$]*\s*)?[<(]/,
  // object-literal / class method:   async name( … )   |   name( … )
  /^\s*(?:(?:public|private|protected|static|override|readonly|get|set)\s+)*(?:async\s+)?\*?\s*([A-Za-z_$][\w$]*)\s*(?:<[^(){};]*>)?\s*\(/,
];

/**
 * Every function body in a source file, as line spans.
 *
 * Detection is deliberately conservative: a construct we fail to recognise
 * yields NO scope, and a write that lands in no scope raises DetectorDefect
 * (the detector says "I cannot tell") rather than being credited to whatever
 * guard happens to sit above it.
 */
export function scopesOf(source: string, relPath: string): Scope[] {
  const mask = codeMask(source, relPath);
  // Code-only view with offsets preserved, so positions map back to `source`.
  //
  // Indexed by UTF-16 unit, NOT code point: `Array.from` would iterate code
  // points and collapse each surrogate pair (an emoji in a log string is
  // enough) into one element, silently shifting every offset after it and
  // truncating the enclosing scope.
  const chars: string[] = new Array(source.length);
  for (let i = 0; i < source.length; i++) {
    chars[i] = mask[i] ? source[i] : source[i] === '\n' ? '\n' : ' ';
  }
  const code = chars.join('');

  const lineStart: number[] = [0];
  for (let i = 0; i < source.length; i++) if (source[i] === '\n') lineStart.push(i + 1);
  const lineOfIndex = (idx: number): number => {
    let lo = 0;
    let hi = lineStart.length - 1;
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1;
      if (lineStart[mid] <= idx) lo = mid;
      else hi = mid - 1;
    }
    return lo + 1;
  };

  const scopes: Scope[] = [];

  for (let ln = 0; ln < lineStart.length; ln++) {
    const from = lineStart[ln];
    const to = ln + 1 < lineStart.length ? lineStart[ln + 1] - 1 : code.length;
    const text = code.slice(from, to);

    let name: string | null = null;
    for (const re of FUNCTION_STARTS) {
      const m = re.exec(text);
      if (m && !NOT_A_FUNCTION.has(m[1])) {
        name = m[1];
        break;
      }
    }
    if (!name) continue;

    // Walk the parameter list to its close, then the body brace, then match it.
    let i = from;
    while (i < to && code[i] !== '(') i++;
    if (i >= to) continue;

    let paren = 0;
    let closed = -1;
    for (; i < code.length; i++) {
      if (code[i] === '(') paren++;
      else if (code[i] === ')') {
        paren--;
        if (paren === 0) {
          closed = i;
          break;
        }
      }
    }
    if (closed < 0) continue;

    // The body brace is the first `{` after the signature that is NOT inside a
    // return-type annotation. `Promise<{ … }>` puts a brace at angle-depth 1,
    // so tracking `<`/`>` is what separates the type from the body. A `;` at
    // angle-depth 0 first means an overload declaration — no span to police.
    let open = -1;
    let angle = 0;
    for (let j = closed + 1; j < code.length; j++) {
      const ch = code[j];
      if (ch === '<') angle++;
      // `=>` is an arrow, not a closing angle bracket.
      else if (ch === '>' && code[j - 1] !== '=') angle = Math.max(0, angle - 1);
      else if (angle === 0 && ch === '{') {
        open = j;
        break;
      } else if (angle === 0 && ch === ';') break;
    }
    if (open < 0) continue;

    let depth = 0;
    let close = -1;
    for (let j = open; j < code.length; j++) {
      if (code[j] === '{') depth++;
      else if (code[j] === '}') {
        depth--;
        if (depth === 0) {
          close = j;
          break;
        }
      }
    }
    if (close < 0) continue;

    scopes.push({ name, startLine: ln + 1, endLine: lineOfIndex(close) });
  }

  return scopes;
}

/** The tightest function body containing `line`, or undefined if none does. */
export function enclosingScope(scopes: Scope[], line: number): Scope | undefined {
  let best: Scope | undefined;
  for (const s of scopes) {
    if (line < s.startLine || line > s.endLine) continue;
    if (!best || s.endLine - s.startLine < best.endLine - best.startLine) best = s;
  }
  return best;
}

export interface DominatedWrite {
  line: number;
  scope: string;
  guardLine: number;
}

export interface UndominatedWrite {
  line: number;
  scope: string;
}

export interface DominationReport {
  ok: boolean;
  dominated: DominatedWrite[];
  undominated: UndominatedWrite[];
  scopes: Scope[];
}

/**
 * Prove EVERY write is individually dominated by a guard: one that precedes it
 * AND shares its innermost function scope.
 *
 * A write in no recognised scope raises DetectorDefect — the detector cannot
 * see the boundary, so it must not issue a verdict either way. A write in a
 * scope with no preceding guard is a genuine finding: `ok` goes false.
 */
export function guardDomination(params: {
  relPath: string;
  source: string;
  guardLines: number[];
  writeLines: number[];
}): DominationReport {
  const { relPath, source, guardLines, writeLines } = params;
  const scopes = scopesOf(source, relPath);

  const dominated: DominatedWrite[] = [];
  const undominated: UndominatedWrite[] = [];

  for (const write of writeLines) {
    const scope = enclosingScope(scopes, write);
    if (!scope) {
      throw new DetectorDefect(
        `${relPath}:${write} — this write lies in no recognised function scope, so ` +
          `the detector cannot tell which guard (if any) governs it. Re-point the ` +
          `scope parser at the construct that moved — do not relax the assertion.`
      );
    }
    const guard = guardLines
      .filter((g) => g < write && enclosingScope(scopes, g) === scope)
      .pop();
    if (guard === undefined) undominated.push({ line: write, scope: scope.name });
    else dominated.push({ line: write, scope: scope.name, guardLine: guard });
  }

  return { ok: undominated.length === 0, dominated, undominated, scopes };
}

export interface RefusalCheck {
  id: string;
  refusal: string;
  grade: 'A' | 'A-minus' | 'B' | 'C' | 'Proposed';
  enforcedBy: string;
  evidence: string;
  violationAttempted: string;
  passingAuthorizes: string;
  passingDoesNotAuthorize: string;
  hostileForkMustChange: string;
  run(io: CheckIO): void;
}

export interface Tally {
  passed: number;
  failed: number;
  warned: number;
}

const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const DIM = '\x1b[2m';
const BOLD = '\x1b[1m';
const RESET = '\x1b[0m';

export function grep(pattern: string, paths: string[]): string[] {
  const quotedPaths = paths.map((p) => JSON.stringify(p)).join(' ');
  let out: string;
  try {
    // -H is REQUIRED, not decorative: GNU grep omits the filename when -r is
    // given exactly one non-directory operand, while BSD grep and ugrep include
    // it. Without -H the "path:line:text" contract that every ordering
    // assertion parses is implementation-dependent (see DetectorDefect).
    out = execSync(`grep -rHInE ${JSON.stringify(pattern)} ${quotedPaths}`, {
      cwd: REPO_ROOT,
      encoding: 'utf8',
    });
  } catch (e: unknown) {
    // grep exits 1 when there are no matches — that is a valid empty result.
    if (typeof e === 'object' && e !== null && (e as { status?: number }).status === 1) {
      return [];
    }
    throw e;
  }

  const lines = out.trim().split('\n').filter(Boolean);
  // Tripwire: enforce the format contract at the single place it is produced,
  // so a future grep-behaviour drift surfaces as a named tooling failure rather
  // than silently corrupting the line arithmetic of every downstream assertion.
  const malformed = lines.find((l) => !GREP_LINE.test(l));
  if (malformed !== undefined) {
    throw new DetectorDefect(
      `grep(${JSON.stringify(pattern)}) over [${paths.join(', ')}] returned a line ` +
        `that is not "path:line:text": ${JSON.stringify(malformed)}. The registry ` +
        `cannot locate source positions and therefore cannot adjudicate this refusal.`
    );
  }
  return lines;
}

export function read(relPath: string): string {
  return readFileSync(join(REPO_ROOT, relPath), 'utf8');
}

/** Run one refusal check, printing its jurisdiction card + results. */
export function runCheck(check: RefusalCheck, tally: Tally): void {
  console.log(`\n${BOLD}── [${check.id}] ${check.refusal}${RESET}`);
  console.log(`${DIM}   grade: ${check.grade}  ·  enforced by: ${check.enforcedBy}${RESET}`);
  console.log(`${DIM}   attempts to violate: ${check.violationAttempted}${RESET}`);

  const io: CheckIO = {
    pass: (label, detail) => {
      console.log(`   ${GREEN}✅ PASS${RESET}  ${label}${detail ? `  ${DIM}(${detail})${RESET}` : ''}`);
      tally.passed++;
    },
    fail: (label, detail) => {
      console.log(`   ${RED}❌ FAIL${RESET}  ${label}${detail ? `  ${RED}→ ${detail}${RESET}` : ''}`);
      tally.failed++;
    },
    warn: (label, detail) => {
      console.log(`   ${YELLOW}⚠️  WARN${RESET}  ${label}${detail ? `  ${DIM}(${detail})${RESET}` : ''}`);
      tally.warned++;
    },
    note: (label, detail) => {
      console.log(`   ${DIM}·  NOTE  ${label}${detail ? `  — ${detail}` : ''}${RESET}`);
    },
    read,
    grep,
    exists: (relPath) => existsSync(join(REPO_ROOT, relPath)),
  };

  try {
    check.run(io);
  } catch (e: unknown) {
    if (e instanceof DetectorDefect) {
      // Distinguished from a breach on purpose: this red says the instrument is
      // broken, NOT that the refusal was violated. Repair the detector; do not
      // relax the assertion, and do not read this as a demonstrated violation.
      io.fail(
        'DETECTOR DEFECT — this check could not locate its own anchor and proves NOTHING either way (tooling failure, not a demonstrated breach)',
        e.message
      );
    } else {
      io.fail('check threw', e instanceof Error ? e.message : String(e));
    }
  }

  console.log(`${DIM}   ✔ a PASS authorizes: ${check.passingAuthorizes}${RESET}`);
  console.log(`${DIM}   ✘ a PASS does NOT authorize: ${check.passingDoesNotAuthorize}${RESET}`);
  console.log(`${DIM}   ↯ hostile fork must change: ${check.hostileForkMustChange}${RESET}`);
}
