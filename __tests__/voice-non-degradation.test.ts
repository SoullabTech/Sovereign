/**
 * MAIA DEEP-INTELLIGENCE GATE — convergence, enforced by EXHAUSTIVE ENUMERATION.
 *
 * Doctrine: docs/canon/MAIA_CONVERSATIONAL_INTELLIGENCE_NON_DEGRADATION.md
 * Unit:     docs/architecture/VOICE_CANONICAL_CONVERGENCE_02_EXIT_MAP.md
 *
 *   Voice may have a different capture path. It may not have a different mind.
 *
 * ── TWO FAILED ATTEMPTS PRECEDE THIS ONE, AND BOTH FAILED THE SAME WAY ───────
 *
 * v1 asserted four NAMED routes were absent from the voice handler.
 * `/api/voice/stream-conversation` was not among them, so it passed while the
 * DEFAULT spoken turn went to a second mind.
 *
 * v2 replaced that with a catalogue of response-producing call patterns and
 * called it positive enforcement. It was not: anything response-producing that
 * did not match a listed pattern stayed invisible. Its "unnamed endpoint" probe
 * used a URL inside the catalogue's own regex family — it proved the pattern
 * generalized within what it already knew, and was presented as proof against
 * the unknown.
 *
 * ⛔ BOTH WERE CATALOGUES OF THINGS WE HAD THOUGHT OF. A catalogue can only
 * ever fail to find what it was not told to look for.
 *
 * ── WHAT THIS VERSION DOES INSTEAD ──────────────────────────────────────────
 *
 * It enumerates, via the TypeScript AST, EVERY `return` statement belonging to
 * `handleVoiceTranscript` — not calls, not routes, not names. Exits are a
 * closed set the compiler can enumerate exhaustively; responder names are not.
 *
 * The property, which the exit map established and this now enforces:
 *
 *   Every explicit return from handleVoiceTranscript is a NON-RESPONSE
 *   admission guard. The single response-producing path is the fall-through to
 *   handleTextMessage — the canonical cognition spine.
 *
 * So an added exit fails because A NEW EXIT APPEARED, whatever preceded it, and
 * whether or not anyone has ever heard of it.
 *
 * ⛔ WHAT THIS STILL DOES NOT CLAIM. Not universal MAIA egress convergence.
 * Class C of the exit map — eleven `maiaSpeak()` sites uttering locally-authored
 * or data-API text with no model in the path — and `OracleConversation.tsx:6712`
 * (a crisis script spoken outside any guard that deliberately does not return)
 * are separately recorded findings, unrepaired. They may not be laundered into
 * "fixed" by this suite passing.
 */

import { describe, it, expect } from '@jest/globals';
import ts from 'typescript';
import fs from 'node:fs';
import path from 'node:path';

const read = (rel: string) => fs.readFileSync(path.resolve(__dirname, '..', rel), 'utf8');
const ORACLE = read('components/OracleConversation.tsx');
const MAIA_PAGE = read('app/maia/page.tsx');

/**
 * ⭐ THE RATIFIED EXIT SET.
 *
 * Every explicit return from `handleVoiceTranscript`, keyed by its own log
 * marker or enclosing condition — text, not line numbers, so ordinary edits
 * above do not churn it. Each is an ADMISSION GUARD: the turn is refused before
 * it becomes a member turn, so there is correctly no cognition and no
 * convergence.
 *
 * ⛔ ADDING A ROW IS AN AUTHORITY DECISION. A new exit must be argued for and
 * classified, exactly like a preload channel. If a future exit is
 * response-producing, this file is the wrong place to record it — the invariant
 * is broken and the architecture, not the list, needs the repair.
 *
 * ⭐ Note three separate echo defences below. MAIA hearing herself has been
 * fought more than once.
 */
const RATIFIED_EXITS = [
  '⚠️ Empty transcript, returning',
  '🔇 [Voice Feedback Prevention] Rejecting transcript - MAIA is speaking',
  '⚠️ Duplicate transcript detected (${timeSinceLastProcess}ms ago), igno',
  "if isStandaloneCommand && !voiceCmd.action?.includes('reflect')",
  '✅ [Voice Command] Command-only, no content to process',
  '⚠️ Ignoring empty/punctuation-only transcript:',
  '👻 Ghost transcript detected (YouTube/video audio):',
  '[Echo Suppressed] Ignoring input during ${remainingMs}ms cooldown',
  "[Echo Suppressed] Transcript appears to be MAIA\\",
  '⚠️ Already processing, ignoring duplicate transcript',
  '⚠️ Duplicate transcript detected, ignoring',
  '📝 [Scribe Mode] Recording voice transcript passively:',
] as const;

/** A call that turns a member turn into a MAIA response. */
const RESPONSE_PRODUCING = /\b(handleTextMessage|sendStreamingMessage)\s*\(|(apiFetch|fetch)\s*\(\s*['"`][^'"`]*\/api\//;

interface Exit { key: string; precededByResponder: boolean }

/** The handler's own source text, comments stripped — via AST, never by slicing. */
function handlerBody(source: string): string {
  const sf = ts.createSourceFile('o.tsx', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  let decl: ts.VariableDeclaration | null = null;
  const find = (n: ts.Node): void => {
    if (ts.isVariableDeclaration(n) && n.name.getText() === 'handleVoiceTranscript') decl = n;
    ts.forEachChild(n, find);
  };
  find(sf);
  expect(decl).not.toBeNull();
  return (decl!.initializer as ts.CallExpression).arguments[0]
    .getText()
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '');
}

/**
 * Every `return` belonging to `handleVoiceTranscript` itself.
 *
 * ⛔ Nested function bodies are NOT descended into: a `return` inside a
 * callback returns from the callback, not from the handler, and counting those
 * would make the set unstable for reasons unrelated to the invariant.
 */
function enumerateExits(source: string): Exit[] {
  const sf = ts.createSourceFile('o.tsx', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  let decl: ts.VariableDeclaration | null = null;
  const find = (n: ts.Node): void => {
    if (ts.isVariableDeclaration(n) && n.name.getText() === 'handleVoiceTranscript') decl = n;
    ts.forEachChild(n, find);
  };
  find(sf);
  expect(decl).not.toBeNull();

  const fn = (decl!.initializer as ts.CallExpression).arguments[0] as ts.ArrowFunction;
  const returns: ts.ReturnStatement[] = [];
  const walk = (n: ts.Node): void => {
    if (n !== fn && (ts.isArrowFunction(n) || ts.isFunctionExpression(n) || ts.isFunctionDeclaration(n))) return;
    if (ts.isReturnStatement(n)) returns.push(n);
    ts.forEachChild(n, walk);
  };
  walk(fn.body);

  return returns.map((r) => {
    const before = source.slice(Math.max(0, r.getStart() - 420), r.getStart());
    const marker = [...before.matchAll(/console\.(log|warn|error)\(\s*['"`]([^'"`]{0,70})/g)].pop();
    let cond: string | null = null;
    let p: ts.Node | undefined = r.parent;
    while (p && !ts.isArrowFunction(p)) {
      if (ts.isIfStatement(p)) { cond = p.expression.getText().replace(/\s+/g, ' ').slice(0, 70); break; }
      p = p.parent;
    }
    return {
      key: marker ? marker[2] : `if ${cond}`,
      precededByResponder: RESPONSE_PRODUCING.test(before),
    };
  });
}

describe('every exit from the voice handler is enumerated and classified', () => {
  it('⭐ the exit set is exactly the ratified one', () => {
    expect(enumerateExits(ORACLE).map((e) => e.key)).toEqual([...RATIFIED_EXITS]);
  });

  it('⭐ EVERY explicit return is a non-response admission guard', () => {
    // The whole property. Not "the bad routes are absent" — no exit produces a
    // response at all. The canonical path is the fall-through.
    for (const exit of enumerateExits(ORACLE)) {
      expect({ exit: exit.key, producesResponse: exit.precededByResponder })
        .toEqual({ exit: exit.key, producesResponse: false });
    }
  });

  it('⭐ the fall-through reaches canonical cognition exactly once', () => {
    const code = handlerBody(ORACLE);
    expect([...code.matchAll(/\bhandleTextMessage\s*\(/g)]).toHaveLength(1);
    expect(code).not.toMatch(/\bsendStreamingMessage\s*\(/);
  });
});

describe('PROBES — the gate must catch what nobody listed', () => {
  it('⛔ a GENUINELY UNKNOWN responder fails, because a new exit appeared', () => {
    // Not a known name, not a known route family, not in any catalogue. It
    // fails because the ENUMERATED EXIT SET changed — which is the property.
    const probed = ORACLE.replace(
      'await handleTextMessage(cleanedText);',
      'await totallyNewResponder(); return;\n      await handleTextMessage(cleanedText);',
    );
    expect(probed).not.toBe(ORACLE);
    expect(enumerateExits(probed).map((e) => e.key)).not.toEqual([...RATIFIED_EXITS]);
  });

  it('⛔ a restored streaming exit fails', () => {
    const probed = ORACLE.replace(
      'await handleTextMessage(cleanedText);',
      'await sendStreamingMessage(cleanedText); return;\n      await handleTextMessage(cleanedText);',
    );
    const exits = enumerateExits(probed);
    expect(exits.map((e) => e.key)).not.toEqual([...RATIFIED_EXITS]);
    expect(exits.some((e) => e.precededByResponder)).toBe(true);
  });

  it('⛔ removing the canonical call fails — voice would reach no cognition', () => {
    // Scoped to the handler via AST. An earlier draft sliced from the handler
    // to end-of-file and counted unrelated call sites — a probe that could not
    // fail, which is the same defect as a catalogue that cannot find.
    const probed = ORACLE.replace('await handleTextMessage(cleanedText);', '');
    expect(probed).not.toBe(ORACLE);
    expect([...handlerBody(probed).matchAll(/\bhandleTextMessage\s*\(/g)]).toHaveLength(0);
  });
});

describe('the streaming implementation is preserved, only unreachable from voice', () => {
  it('⛔ NOT DELETED — the hook, route and SSE protocol remain as evidence', () => {
    expect(ORACLE).toContain('sendMessage: sendStreamingMessage');
    for (const f of ['hooks/useStreamingVoice.ts', 'app/api/voice/stream-conversation/route.ts']) {
      expect(fs.existsSync(path.resolve(__dirname, '..', f))).toBe(true);
    }
  });

  it('⛔ STRUCTURAL, not defaulted off — no flag can restore the exit', () => {
    expect(handlerBody(ORACLE)).not.toMatch(/streamingVoiceMode/);
  });
});

describe('the canonical endpoint is passed, never inherited from the default', () => {
  it('⚠️ /maia passes apiEndpoint explicitly at every mount', () => {
    const mounts = [...MAIA_PAGE.matchAll(/<OracleConversation\b/g)];
    expect(mounts.length).toBeGreaterThan(0);
    expect([...MAIA_PAGE.matchAll(/apiEndpoint=["'{]/g)].length).toBe(mounts.length);
    expect(MAIA_PAGE).toContain('apiEndpoint="/api/sovereign/app/maia/list"');
  });
});
