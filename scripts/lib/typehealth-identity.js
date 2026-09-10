'use strict';

/**
 * scripts/lib/typehealth-identity.js
 *
 * Union-order canonicalization for the type-health gate's diagnostic identity.
 *
 * DEFECT REPAIRED (2026-09-10)
 * ---------------------------
 * Diagnostic identity was `file | code | normalized-message`, where the message
 * was tsc's text with only the repo root stripped and whitespace collapsed.
 *
 * tsc's print order for the members of a union type is NOT stable. It follows
 * the order in which the union's constituents were first encountered while
 * checking, which moves when files enter or leave the program. So adding
 * unrelated files re-printed already-baselined errors with their union members
 * permuted, and the gate reported one unchanged error as simultaneously
 * "fixed" and "NEW". Observed on three pre-existing errors:
 *
 *   "gentle" | "direct" | "exploratory" | "supportive"   (baseline)
 *   "direct" | "supportive" | "gentle" | "exploratory"   (after +10 files)
 *
 * Same file, same TS code, same line, same count, same members — order only.
 *
 * SCOPE OF THE REPAIR
 * -------------------
 * Order only. This function:
 *   - SORTS union members; it never deduplicates them
 *   - never adds, removes, or rewrites a member
 *   - never changes an error count
 *   - never rewrites typecheck-baseline.json — `message` stays exactly as tsc
 *     printed it, for display and for the record
 *
 * It is applied to BOTH sides of the comparison, immediately before the
 * identity key is built, and nowhere else.
 *
 * A `|` is treated as a union separator ONLY inside the single-quoted type
 * regions tsc uses to print types, and only at bracket depth zero outside a
 * "…" string-literal type. A `|` in ordinary prose, in a filename, or inside a
 * string-literal type is left exactly where it is.
 */

const OPEN = { '{': '}', '(': ')', '[': ']', '<': '>' };
const CLOSERS = new Set(['}', ')', ']', '>']);

/** A `>` immediately preceded by `=` is the tail of `=>`, not a closer. */
function isArrowTail(s, j) {
  return s[j] === '>' && s[j - 1] === '=';
}

/** Index of the bracket closing the one at `i`, or -1 if unbalanced. */
function matchingClose(s, i) {
  const open = s[i];
  const close = OPEN[open];
  let depth = 0;
  let inStr = false;
  for (let j = i; j < s.length; j++) {
    const c = s[j];
    if (inStr) {
      if (c === '"') inStr = false;
      continue;
    }
    if (c === '"') {
      inStr = true;
      continue;
    }
    if (c === open) {
      depth += 1;
    } else if (c === close) {
      if (isArrowTail(s, j)) continue;
      depth -= 1;
      if (depth === 0) return j;
    }
  }
  return -1;
}

/**
 * Split `s` on any of `sepChars` occurring at bracket depth zero and outside a
 * "…" string literal. Returns the raw segments and the separators between them.
 */
function splitTopLevel(s, sepChars) {
  const parts = [];
  const seps = [];
  let depth = 0;
  let inStr = false;
  let start = 0;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (inStr) {
      if (c === '"') inStr = false;
      continue;
    }
    if (c === '"') {
      inStr = true;
      continue;
    }
    if (OPEN[c]) {
      depth += 1;
      continue;
    }
    if (CLOSERS.has(c)) {
      if (isArrowTail(s, i)) continue;
      depth = Math.max(0, depth - 1);
      continue;
    }
    if (depth === 0 && sepChars.includes(c)) {
      parts.push(s.slice(start, i));
      seps.push(c);
      start = i + 1;
    }
  }
  parts.push(s.slice(start));
  return { parts, seps };
}

function topLevelIndexOf(s, ch) {
  const { parts } = splitTopLevel(s, ch);
  if (parts.length < 2) return -1;
  return parts[0].length;
}

/** A run of type text that may itself be a union. */
function canonicalizeTypeRegion(s) {
  const text = s.replace(/\s+/g, ' ').trim();
  const { parts } = splitTopLevel(text, '|');
  if (parts.length >= 2) {
    // sort, never deduplicate: the members are preserved exactly
    return parts
      .map((p) => canonicalizeMember(p))
      .sort()
      .join(' | ');
  }
  return canonicalizeMember(text);
}

/** One member of a union, or one member of an object type. */
function canonicalizeMember(s) {
  const t = s.replace(/\s+/g, ' ').trim();
  const colon = topLevelIndexOf(t, ':');
  if (colon > 0) {
    return `${t.slice(0, colon).trim()}: ${canonicalizeTypeRegion(t.slice(colon + 1))}`;
  }
  return canonicalizeBrackets(t);
}

/** Descend into bracketed regions so nested unions are reached. */
function canonicalizeBrackets(s) {
  let out = '';
  let i = 0;
  let inStr = false;
  while (i < s.length) {
    const c = s[i];
    if (inStr) {
      out += c;
      if (c === '"') inStr = false;
      i += 1;
      continue;
    }
    if (c === '"') {
      out += c;
      inStr = true;
      i += 1;
      continue;
    }
    if (OPEN[c]) {
      const close = matchingClose(s, i);
      if (close < 0) {
        out += c;
        i += 1;
        continue;
      }
      out += `${c}${canonicalizeBody(s.slice(i + 1, close))}${s[close]}`;
      i = close + 1;
      continue;
    }
    out += c;
    i += 1;
  }
  return out;
}

/**
 * The inside of a bracket. Members are separated by `;` or `,` and their ORDER
 * IS PRESERVED — only the unions within each member are canonicalized.
 */
function canonicalizeBody(body) {
  const { parts, seps } = splitTopLevel(body, ';,');
  if (parts.length === 1) return ` ${canonicalizeTypeRegion(body)} `.replace(/^ +$/, '');
  let out = '';
  for (let i = 0; i < parts.length; i += 1) {
    const p = parts[i].trim();
    if (p !== '') out += (out === '' ? '' : ' ') + canonicalizeMember(p);
    if (i < seps.length && p !== '') out += seps[i];
  }
  return out === '' ? body : ` ${out} `;
}

/**
 * Canonicalize union member ORDER inside every single-quoted type region of a
 * tsc diagnostic message. Text outside those regions is returned untouched.
 */
function canonicalizeMessage(msg) {
  if (typeof msg !== 'string' || msg.indexOf("'") === -1) return msg;
  let out = '';
  let i = 0;
  while (i < msg.length) {
    const c = msg[i];
    if (c === "'") {
      const close = closingTypeQuote(msg, i);
      if (close < 0) {
        out += c;
        i += 1;
        continue;
      }
      out += `'${canonicalizeTypeRegion(msg.slice(i + 1, close))}'`;
      i = close + 1;
      continue;
    }
    out += c;
    i += 1;
  }
  return out;
}

function closingTypeQuote(s, i) {
  let inStr = false;
  for (let j = i + 1; j < s.length; j += 1) {
    const c = s[j];
    if (inStr) {
      if (c === '"') inStr = false;
      continue;
    }
    if (c === '"') {
      inStr = true;
      continue;
    }
    if (c === "'") return j;
  }
  return -1;
}

/** The identity key for one diagnostic. The single place identity is defined. */
function identityKey(file, code, message) {
  return `${file}|${code}|${canonicalizeMessage(message)}`;
}

module.exports = { canonicalizeMessage, identityKey };
