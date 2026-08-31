/**
 * MAIA DEEP-INTELLIGENCE GATE — convergence, enforced by EXHAUSTIVE ENUMERATION
 * AND A CLOSED ADMISSION-PHASE ALLOWLIST.
 *
 * Doctrine: docs/canon/MAIA_CONVERSATIONAL_INTELLIGENCE_NON_DEGRADATION.md
 * Unit:     docs/architecture/VOICE_CANONICAL_CONVERGENCE_02_EXIT_MAP.md
 *
 *   Voice may have a different capture path. It may not have a different mind.
 *
 * ── THREE FAILED ATTEMPTS PRECEDE THIS ONE. ALL THREE FAILED THE SAME WAY ────
 *
 * v1 asserted four NAMED routes were absent from the voice handler.
 * `/api/voice/stream-conversation` was not among them, so it passed while the
 * DEFAULT spoken turn went to a second mind.
 *
 * v2 replaced that with a catalogue of response-producing call patterns and
 * called it positive enforcement. It was not. Its "unnamed endpoint" probe used
 * a URL inside the catalogue's own regex family — it proved the pattern
 * generalized within what it already knew, and was presented as proof against
 * the unknown.
 *
 * v3 enumerated every `return` via the AST, which closed the "a new exit slips
 * in" hole for good. But it classified each exit with a leftover regex —
 * `/handleTextMessage|sendStreamingMessage|fetch\(...\/api\//` — so a responder
 * nobody had named, placed BEFORE AN EXISTING RATIFIED RETURN, changed no exit
 * and matched no pattern, and the gate stayed green:
 *
 *     if (isScribing && !scribeSession.isAside) {
 *       console.log('📝 [Scribe Mode] ...');
 *       await totallyNewResponder();          // ⛔ v3 SAW NOTHING
 *       recordVoiceTranscript(cleanedText);
 *       return;
 *     }
 *
 * ⛔ ALL THREE WERE DENYLISTS, AND A DENYLIST FAILS OPEN ON THE UNKNOWN. Each
 * asked "does this look like something we thought of?" and answered no.
 *
 * ── WHAT THIS VERSION DOES INSTEAD: IT INVERTS THE POLARITY ─────────────────
 *
 * Two closed sets, both derived from the code by the compiler, both pinned:
 *
 *   1. THE EXIT SET — every `return` belonging to `handleVoiceTranscript`.
 *      An added exit fails because a new exit appeared, whatever preceded it.
 *
 *   2. THE ADMISSION-PHASE ALLOWLIST — for each ratified exit, the exact set of
 *      calls its guard branch makes. Not "no responder-shaped call"; *exactly
 *      these calls and no others*. So an unknown call fails BECAUSE IT IS
 *      UNKNOWN, without the gate ever learning its name.
 *
 * The property this enforces:
 *
 *   Every explicit return from handleVoiceTranscript is a NON-RESPONSE
 *   admission guard THAT STILL DOES ONLY WHAT IT WAS CERTIFIED TO DO. The
 *   single response-producing path is the fall-through to handleTextMessage —
 *   the canonical cognition spine.
 *
 * ⛔ THE COST, ACCEPTED DELIBERATELY. Changing what an admission guard does now
 * turns this suite red, including for innocent edits. That is the mechanism,
 * not a side effect: the admission phase is a sovereignty boundary, and it
 * should not be possible to widen it quietly. Re-pinning a row is an authority
 * decision, argued for in the diff, exactly like adding a preload channel.
 *
 * ⛔ WHAT THIS STILL DOES NOT CLAIM. Not universal MAIA egress convergence.
 * Class C of the exit map — eleven `maiaSpeak()` sites uttering locally-authored
 * or data-API text with no model in the path — and `OracleConversation.tsx:6712`
 * (a crisis script spoken outside any guard that deliberately does not return)
 * are separately recorded findings, unrepaired. They may not be laundered into
 * "fixed" by this suite passing. One of those `maiaSpeak` sites is pinned below,
 * inside the command-only guard; pinning it freezes it, it does not bless it.
 */

import { describe, it, expect } from '@jest/globals';
import ts from 'typescript';
import fs from 'node:fs';
import path from 'node:path';

const read = (rel: string) => fs.readFileSync(path.resolve(__dirname, '..', rel), 'utf8');
const ORACLE = read('components/OracleConversation.tsx');
const MAIA_PAGE = read('app/maia/page.tsx');

/**
 * ⭐ THE RATIFIED ADMISSION PHASE.
 *
 * Every explicit return from `handleVoiceTranscript`, keyed by its own log
 * marker or enclosing condition — text, not line numbers, so ordinary edits
 * above do not churn it — together with EVERY CALL its guard branch makes.
 *
 * Each row is an ADMISSION GUARD: the turn is refused before it becomes a
 * member turn, so there is correctly no cognition and no convergence. The
 * `calls` column is what makes that a checkable claim rather than a label: the
 * entire admission phase logs, formats strings, and in two places performs one
 * named local effect. Nothing here can reach a model.
 *
 * ⛔ ADDING OR EDITING A ROW IS AN AUTHORITY DECISION. If a future exit is
 * response-producing, this file is the wrong place to record it — the invariant
 * is broken and the architecture, not the list, needs the repair.
 *
 * ⭐ Note three separate echo defences below. MAIA hearing herself has been
 * fought more than once.
 */
const RATIFIED_EXITS: ReadonlyArray<{ key: string; calls: string[] }> = [
  { key: '⚠️ Empty transcript, returning', calls: ['console.log'] },
  { key: '🔇 [Voice Feedback Prevention] Rejecting transcript - MAIA is speaking', calls: ['console.warn'] },
  { key: '⚠️ Duplicate transcript detected (${timeSinceLastProcess}ms ago), igno', calls: ['console.warn'] },
  { key: "if isStandaloneCommand && !voiceCmd.action?.includes('reflect')", calls: [] },
  // ⚠️ `maiaSpeak` here is a Class C egress site — locally-authored command
  // acknowledgement, no model in the path. Recorded in the exit map, unrepaired,
  // and pinned so it cannot grow.
  { key: '✅ [Voice Command] Command-only, no content to process', calls: ['console.log', 'maiaSpeak', 'toast.success'] },
  { key: '⚠️ Ignoring empty/punctuation-only transcript:', calls: ['console.log'] },
  { key: '👻 Ghost transcript detected (YouTube/video audio):', calls: ['console.warn'] },
  { key: '[Echo Suppressed] Ignoring input during ${remainingMs}ms cooldown', calls: ['console.warn'] },
  { key: "[Echo Suppressed] Transcript appears to be MAIA\\", calls: ['console.warn', 'transcriptWords.substring'] },
  { key: '⚠️ Already processing, ignoring duplicate transcript', calls: ['console.log'] },
  { key: '⚠️ Duplicate transcript detected, ignoring', calls: ['console.log'] },
  { key: '📝 [Scribe Mode] Recording voice transcript passively:', calls: ['cleanedText.substring', 'console.log', 'recordVoiceTranscript'] },
];

interface Exit { key: string; calls: string[] }

/** Locate `handleVoiceTranscript` and hand back its function node. */
function handlerFn(source: string): ts.ArrowFunction {
  const sf = ts.createSourceFile('o.tsx', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  let decl: ts.VariableDeclaration | null = null;
  const find = (n: ts.Node): void => {
    if (ts.isVariableDeclaration(n) && n.name.getText() === 'handleVoiceTranscript') decl = n;
    ts.forEachChild(n, find);
  };
  find(sf);
  expect(decl).not.toBeNull();
  return (decl!.initializer as ts.CallExpression).arguments[0] as ts.ArrowFunction;
}

/** The handler's own source text, comments stripped — via AST, never by slicing. */
function handlerBody(source: string): string {
  return handlerFn(source)
    .getText()
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '');
}

/** Every call made anywhere inside a node, callback bodies included (fail closed). */
function callsWithin(node: ts.Node): string[] {
  const found = new Set<string>();
  const walk = (n: ts.Node): void => {
    if (ts.isCallExpression(n)) found.add(n.expression.getText().replace(/\s+/g, ''));
    ts.forEachChild(n, walk);
  };
  walk(node);
  return [...found].sort();
}

/**
 * Every `return` belonging to `handleVoiceTranscript` itself, with the calls its
 * guard branch makes.
 *
 * ⛔ Nested function bodies are NOT descended into WHEN FINDING RETURNS: a
 * `return` inside a callback returns from the callback, not from the handler.
 * They ARE descended into when collecting a guard's calls — a responder hidden
 * in a callback is still a responder the guard reaches.
 */
function enumerateExits(source: string): Exit[] {
  const fn = handlerFn(source);
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

    // The guard branch: the nearest enclosing `if` body. Falling back to the
    // return statement alone keeps an unbraced or top-level exit fail-closed
    // rather than unscoped.
    let cond: string | null = null;
    let branch: ts.Node = r;
    let p: ts.Node | undefined = r.parent;
    let seen = false;
    while (p && p !== fn.body) {
      if (!seen && ts.isBlock(p) && p.parent && ts.isIfStatement(p.parent)) { branch = p; seen = true; }
      if (ts.isIfStatement(p)) { cond = p.expression.getText().replace(/\s+/g, ' ').slice(0, 70); break; }
      p = p.parent;
    }

    return { key: marker ? marker[2] : `if ${cond}`, calls: callsWithin(branch) };
  });
}

describe('every exit from the voice handler is enumerated and classified', () => {
  it('⭐ the exit set is exactly the ratified one', () => {
    expect(enumerateExits(ORACLE).map((e) => e.key)).toEqual(RATIFIED_EXITS.map((e) => e.key));
  });

  it('⭐ EVERY guard branch still does exactly what it was certified to do', () => {
    // ⛔ THE POLARITY INVERSION, and the whole reason v3 was insufficient.
    // Not "no exit matches a response-producing pattern" — that question can
    // only be answered about patterns someone thought of. Instead: the guard's
    // calls are EXACTLY the pinned set. An unknown call fails because it is
    // unknown, which is the only way a gate can be honest about the unknown.
    expect(enumerateExits(ORACLE)).toEqual([...RATIFIED_EXITS]);
  });

  it('⭐ the fall-through reaches canonical cognition exactly once', () => {
    const code = handlerBody(ORACLE);
    expect([...code.matchAll(/\bhandleTextMessage\s*\(/g)]).toHaveLength(1);
    expect(code).not.toMatch(/\bsendStreamingMessage\s*\(/);
  });
});

describe('PROBES — the gate must catch what nobody listed', () => {
  it('⛔ an UNKNOWN responder inside an EXISTING guard, adding NO exit, fails', () => {
    // ⭐ THE PROBE v3 COULD NOT PASS, and the reason this version exists.
    // No new return. No known name. No known route family. The exit set is
    // untouched — asserted below, so this test would go green the moment the
    // classification silently weakened back into a catalogue.
    const probed = ORACLE.replace(
      "console.log('📝 [Scribe Mode] Recording voice transcript passively:'",
      "await totallyNewResponder();\n        console.log('📝 [Scribe Mode] Recording voice transcript passively:'",
    );
    expect(probed).not.toBe(ORACLE);

    const exits = enumerateExits(probed);
    // Enumeration alone is blind here — that is the point being demonstrated.
    expect(exits.map((e) => e.key)).toEqual(RATIFIED_EXITS.map((e) => e.key));
    // The allowlist is not.
    expect(exits).not.toEqual([...RATIFIED_EXITS]);
    expect(exits.find((e) => e.key.startsWith('📝'))!.calls).toContain('totallyNewResponder');
  });

  it('⛔ a GENUINELY UNKNOWN responder on a NEW exit fails too', () => {
    const probed = ORACLE.replace(
      'await handleTextMessage(cleanedText);',
      'await totallyNewResponder(); return;\n      await handleTextMessage(cleanedText);',
    );
    expect(probed).not.toBe(ORACLE);
    expect(enumerateExits(probed).map((e) => e.key)).not.toEqual(RATIFIED_EXITS.map((e) => e.key));
  });

  it('⛔ a restored streaming exit fails', () => {
    const probed = ORACLE.replace(
      'await handleTextMessage(cleanedText);',
      'await sendStreamingMessage(cleanedText); return;\n      await handleTextMessage(cleanedText);',
    );
    expect(enumerateExits(probed)).not.toEqual([...RATIFIED_EXITS]);
    expect(handlerBody(probed)).toMatch(/\bsendStreamingMessage\s*\(/);
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
