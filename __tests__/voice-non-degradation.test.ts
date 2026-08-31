/**
 * MAIA DEEP-INTELLIGENCE GATE — convergence, enforced by TWO CLOSED SETS THE
 * COMPILER DERIVES FROM THE CODE.
 *
 * Doctrine: docs/canon/MAIA_CONVERSATIONAL_INTELLIGENCE_NON_DEGRADATION.md
 * Unit:     docs/architecture/VOICE_CANONICAL_CONVERGENCE_02_EXIT_MAP.md
 *
 *   Voice may have a different capture path. It may not have a different mind.
 *
 * ── FOUR FAILED ATTEMPTS PRECEDE THIS ONE. ALL FOUR FAILED THE SAME WAY ─────
 *
 * v1  A denylist of four NAMED routes. `/api/voice/stream-conversation` was not
 *     among them, so it passed green for the entire life of the divergence.
 *
 * v2  A catalogue of response-producing call PATTERNS, called positive
 *     enforcement. Its "unnamed endpoint" probe used a URL inside the
 *     catalogue's own regex family — it proved the pattern generalized within
 *     what it already knew, and was presented as proof against the unknown.
 *
 * v3  Exhaustive AST enumeration of every `return`, which closed the added-exit
 *     hole for good. But each exit was still CLASSIFIED by a leftover regex, so
 *     an unknown responder placed before an EXISTING ratified return changed no
 *     exit, matched no pattern, and left the gate green.
 *
 * v4  Inverted the polarity inside guard branches: each ratified exit pinned the
 *     exact calls its branch makes. That closed v3's hole — and left the
 *     SUCCESSFUL FALL-THROUGH CORRIDOR ungoverned. The handler runs journal
 *     actions, scribe APIs, crisis detection, tracking and memory writes outside
 *     every guard, so this still passed:
 *
 *         await totallyNewResponder();          // ⛔ v4 SAW NOTHING
 *         await handleTextMessage(cleanedText);
 *
 *     Exit keys unchanged, guard allowlists unchanged, exactly one
 *     `handleTextMessage`, no `sendStreamingMessage`. GREEN.
 *
 * ⛔ THE SAME EPISTEMIC FAILURE FOUR TIMES, EACH TIME IN A SMALLER ROOM. Every
 * version asked "does this look like something we thought of?" and answered no.
 * A denylist fails open on the unknown, and narrowing WHERE it is applied does
 * not change that — it only moves where the unknown may stand.
 *
 * ── WHAT THIS VERSION DOES INSTEAD ─────────────────────────────────────────
 *
 * No responder names. No route families. No patterns. Two closed sets, both
 * enumerated from the source by the TypeScript compiler and pinned here:
 *
 *   1. THE EXIT SET — every `return` belonging to `handleVoiceTranscript`.
 *      An added exit fails because a new exit appeared, whatever preceded it.
 *
 *   2. THE CALL SETS — the complete set of calls the handler makes, AND, per
 *      ratified exit, the exact calls its guard branch makes. Not "no
 *      responder-shaped call": *exactly these calls and no others*, everywhere
 *      in the handler, on the guarded path and the successful path alike.
 *
 * The two are complementary, not redundant. The handler-wide set catches a call
 * appearing anywhere; the per-guard sets catch a call MOVING — `maiaSpeak`
 * migrating out of the command-only guard onto the fall-through corridor leaves
 * the handler-wide set identical but changes what MAIA does on every turn.
 *
 * The property this enforces:
 *
 *   Every explicit return from handleVoiceTranscript is a NON-RESPONSE
 *   admission guard, every call the handler makes — guarded or not — is one it
 *   was certified to make, and the sole canonical cognition call is
 *   handleTextMessage.
 *
 * An unknown call fails BECAUSE IT IS UNKNOWN, without the gate ever learning
 * its name. That is the only form in which a gate can be honest about the
 * unknown.
 *
 * ⛔ THE COST, ACCEPTED DELIBERATELY. Editing this handler now turns the suite
 * red, innocent edits included. That is the mechanism, not a side effect:
 * `handleVoiceTranscript` is where a spoken turn becomes a member turn, and it
 * must not be possible to widen it quietly. Re-pinning a row is an authority
 * decision argued for in the diff, exactly like adding a preload channel.
 *
 * ⛔ WHAT THIS STILL DOES NOT CLAIM. Not universal MAIA egress convergence.
 * Class C of the exit map — eleven `maiaSpeak()` sites uttering locally-authored
 * or data-API text with no model in the path — and `OracleConversation.tsx:6712`
 * (a crisis script spoken outside any guard that deliberately does not return)
 * are separately recorded findings, unrepaired. Several Class C calls are pinned
 * below. ⚠️ FROZEN IS NOT BLESSED: pinning stops them growing, it does not
 * certify them, and they may not be laundered into "fixed" by this suite passing.
 */

import { describe, it, expect } from '@jest/globals';
import ts from 'typescript';
import fs from 'node:fs';
import path from 'node:path';

const read = (rel: string) => fs.readFileSync(path.resolve(__dirname, '..', rel), 'utf8');
const ORACLE = read('components/OracleConversation.tsx');
const MAIA_PAGE = read('app/maia/page.tsx');

/**
 * ⭐ THE RATIFIED CORRIDOR — every call `handleVoiceTranscript` makes, anywhere.
 *
 * Callee expressions only; arguments are never pinned, so ordinary edits to log
 * text or payloads do not churn this. A chained call renders its receiver as
 * `f(…)` for the same reason.
 *
 * ⚠️ CLASS C AND EGRESS-ADJACENT ENTRIES, pinned so they cannot grow, NOT
 * blessed: `maiaSpeak` (locally-authored command acknowledgement, no model in
 * the path), `detectCrisis`, `apiFetch`, `saveConversationMemory`,
 * `recordVoiceTranscript`, `stopStreamingVoice`. Each belongs to a separately
 * recorded finding, unrepaired by this unit.
 *
 * ⚠️ WHY THIS IS THE WHOLE HANDLER AND NOT JUST THE COGNITION TAIL. The tail
 * pin below is narrow and cheap, and it closes the mutation that motivated it —
 * an unknown call immediately ahead of `handleTextMessage`. It does not close
 * the corridor: measured on this source, 72 of these 76 calls sit OUTSIDE both
 * the ratified guard branches and the tail, in the journal-action, scribe,
 * command and crisis-detection stretches of the successful path. An unknown
 * responder placed there would change no exit, no guard set and no tail — the
 * same hole in a fifth room. The breadth is the cost of not leaving it open.
 *
 * ⛔ `handleTextMessage` is the ONLY canonical cognition call in this list, and
 * the assertions below prove it appears exactly once. Anything else that reaches
 * a model does not belong here — the invariant is broken and the architecture,
 * not this list, needs the repair.
 */
const RATIFIED_CALLS = [
  'Date.now',
  'JSON.parse',
  'JSON.stringify',
  'String',
  'apiFetch',
  'appendMessageCapped',
  'appendTranscriptEntry',
  'applySettingsDelta',
  'cleanMessage',
  'cleanedText.substring',
  'confirmScribeConsent',
  'console.error',
  'console.log',
  'console.warn',
  'data.actionItems.map',
  'data.actionItems.map(…).join',
  'detectCrisis',
  'detectMaiaCommands',
  'getMaiaCommandConfirmation',
  'ghostPhrases.some',
  'handleTextMessage',
  'lastMaiaResponseRef.current.toLowerCase',
  'lastMaiaResponseRef.current.toLowerCase(…).trim',
  'localStorage.getItem',
  'localStorage.setItem',
  'lowerTranscript.includes',
  'maiaSpeak',
  'maiaWords.includes',
  'maiaWords.substring',
  'markScribeMoment',
  'matchVoiceCommand',
  'messages.slice',
  'onMessageAddedRef.current',
  'pauseScribeSession',
  'pwaVoice.transcriptReceived',
  'recentMessages.map',
  'recentMessages.map(…).join',
  'recordVoiceTranscript',
  'res.json',
  'rhythmTrackerRef.current.onSpeechEnd',
  'saveConversationMemory',
  'saveConversationMemory(…).catch',
  'setCounselFramework',
  'setInterimTranscript',
  'setInterruptEnabled',
  'setIsAudioPlaying',
  'setIsProcessing',
  'setIsResponding',
  'setIsSanctuary',
  'setListeningMode',
  'setMaiaMode',
  'setMessages',
  'setScribeSession',
  'setShowCapturePanel',
  'setTimeout',
  'setTranscriptEnabled',
  'setVoiceSettings',
  'startScribeSession',
  'stopScribeSession',
  'stopStreamingVoice',
  'toast',
  'toast.error',
  'toast.success',
  'toggleScribeAside',
  'trackEvent.error',
  'trackEvent.voiceResult',
  'transcript.replace',
  'transcript.toLowerCase',
  'transcript.toLowerCase(…).trim',
  'transcript.trim',
  'transcriptWords.includes',
  'transcriptWords.substring',
  'userTracker.trackActivity',
  'voiceCmd.action.includes',
  'voiceCmd.action.startsWith',
  'window.dispatchEvent',
];

/**
 * ⭐ THE RATIFIED COGNITION TAIL — ordered, not a set.
 *
 * The `try` block that contains the canonical call, in execution order. This is
 * the last few centimetres before a spoken turn becomes a MAIA turn, and ORDER
 * is the property the handler-wide set above cannot express: a call that already
 * exists elsewhere in the handler — `maiaSpeak`, `apiFetch` — inserted between
 * the log line and `handleTextMessage` leaves that set identical while placing
 * an alternate authority immediately ahead of cognition.
 *
 * ⛔ Nothing may be inserted before `handleTextMessage` here. What follows it is
 * post-cognition telemetry and is pinned for the same reason: nothing may be
 * appended there either.
 */
const RATIFIED_COGNITION_TAIL = [
  'console.log',
  'handleTextMessage',
  'Date.now',
  'trackEvent.voiceResult',
  'console.log',
];

/**
 * ⭐ THE RATIFIED ADMISSION PHASE — every explicit return, keyed by its own log
 * marker or enclosing condition (text, not line numbers, so edits above do not
 * churn it), with the exact calls its guard branch makes.
 *
 * Each is an ADMISSION GUARD: the turn is refused before it becomes a member
 * turn, so there is correctly no cognition and no convergence. The `calls`
 * column makes that a checkable claim rather than a label, and it pins LOCATION
 * as well as membership — a call moving between a guard and the corridor is
 * caught here even though the handler-wide set above is unchanged.
 *
 * ⭐ Note three separate echo defences. MAIA hearing herself has been fought
 * more than once.
 */
const RATIFIED_EXITS: ReadonlyArray<{ key: string; calls: string[] }> = [
  { key: '⚠️ Empty transcript, returning', calls: ['console.log'] },
  { key: '🔇 [Voice Feedback Prevention] Rejecting transcript - MAIA is speaking', calls: ['console.warn'] },
  { key: '⚠️ Duplicate transcript detected (${timeSinceLastProcess}ms ago), igno', calls: ['console.warn'] },
  { key: "if isStandaloneCommand && !voiceCmd.action?.includes('reflect')", calls: [] },
  // ⚠️ Class C egress site — see the header. Frozen, not blessed.
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

/**
 * A callee's identity, independent of its arguments: `f`, `a.b.c`, `f(…).then`.
 * Optional chaining and non-null assertions are normalized away — they change
 * nothing about WHAT is called.
 */
function callee(e: ts.Node): string {
  if (ts.isCallExpression(e)) return `${callee(e.expression)}(…)`;
  if (ts.isPropertyAccessExpression(e)) return `${callee(e.expression)}.${e.name.text}`;
  if (ts.isNonNullExpression(e) || ts.isParenthesizedExpression(e)) return callee(e.expression);
  return e.getText().replace(/\s+/g, '');
}

/** Every call made anywhere inside a node, callback bodies included (fail closed). */
function callsWithin(node: ts.Node): string[] {
  const found = new Set<string>();
  const walk = (n: ts.Node): void => {
    if (ts.isCallExpression(n)) found.add(callee(n.expression));
    ts.forEachChild(n, walk);
  };
  walk(node);
  return [...found].sort();
}

/**
 * The ordered call sequence of the `try` block holding the canonical call.
 * Located by AST from `handleTextMessage` outward — never by line number, so it
 * follows the block if the handler is reorganised.
 */
function cognitionTail(source: string): string[] {
  const fn = handlerFn(source);
  let target: ts.CallExpression | null = null;
  const find = (n: ts.Node): void => {
    if (ts.isCallExpression(n) && callee(n.expression) === 'handleTextMessage') target = n;
    ts.forEachChild(n, find);
  };
  find(fn.body);
  expect(target).not.toBeNull();
  let p: ts.Node | undefined = target!.parent;
  while (p && !ts.isTryStatement(p)) p = p.parent;
  expect(p).toBeDefined();
  const seq: string[] = [];
  const walk = (n: ts.Node): void => {
    if (ts.isCallExpression(n)) seq.push(callee(n.expression));
    ts.forEachChild(n, walk);
  };
  walk((p as ts.TryStatement).tryBlock);
  return seq;
}

/** Every call `handleVoiceTranscript` makes — guarded path and corridor alike. */
const handlerCalls = (source: string): string[] => callsWithin(handlerFn(source).body);

/**
 * Every `return` belonging to `handleVoiceTranscript` itself, with the calls its
 * guard branch makes.
 *
 * ⛔ Nested function bodies are NOT descended into WHEN FINDING RETURNS: a
 * `return` inside a callback returns from the callback, not from the handler.
 * They ARE descended into when collecting calls — a responder hidden inside a
 * callback is still a responder the handler reaches.
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
    let scoped = false;
    while (p && p !== fn.body) {
      if (!scoped && ts.isBlock(p) && p.parent && ts.isIfStatement(p.parent)) { branch = p; scoped = true; }
      if (ts.isIfStatement(p)) { cond = p.expression.getText().replace(/\s+/g, ' ').slice(0, 70); break; }
      p = p.parent;
    }

    return { key: marker ? marker[2] : `if ${cond}`, calls: callsWithin(branch) };
  });
}

describe('the whole handler is a closed set, not a filtered one', () => {
  it('⭐ EVERY call the handler makes is one it was certified to make', () => {
    // ⛔ THE PROPERTY v1-v4 EACH MISSED IN A DIFFERENT ROOM. Not "no call looks
    // like a responder" — that question can only be answered about responders
    // someone thought of. Instead: exactly these calls and no others, on the
    // guarded path and the successful fall-through corridor alike.
    expect(handlerCalls(ORACLE)).toEqual(RATIFIED_CALLS);
  });

  it('⭐ NOTHING stands between the log line and canonical cognition', () => {
    // Ordered. The set assertion above is blind to position, and position is
    // exactly what an alternate authority immediately ahead of cognition
    // occupies.
    expect(cognitionTail(ORACLE)).toEqual(RATIFIED_COGNITION_TAIL);
  });

  it('⭐ handleTextMessage is the sole canonical cognition call, reached once', () => {
    const fn = handlerFn(ORACLE);
    const calls: string[] = [];
    const walk = (n: ts.Node): void => {
      if (ts.isCallExpression(n)) calls.push(callee(n.expression));
      ts.forEachChild(n, walk);
    };
    walk(fn.body);
    expect(calls.filter((c) => c === 'handleTextMessage')).toHaveLength(1);
    expect(calls).not.toContain('sendStreamingMessage');
  });
});

describe('every exit from the voice handler is enumerated and classified', () => {
  it('⭐ the exit set is exactly the ratified one', () => {
    expect(enumerateExits(ORACLE).map((e) => e.key)).toEqual(RATIFIED_EXITS.map((e) => e.key));
  });

  it('⭐ EVERY guard branch still does exactly what it was certified to do', () => {
    // Pins LOCATION, which the handler-wide set cannot: a call migrating out of
    // a guard onto the corridor leaves that set identical and is caught here.
    expect(enumerateExits(ORACLE)).toEqual([...RATIFIED_EXITS]);
  });
});

describe('PROBES — the gate must catch what nobody listed', () => {
  it('⛔ an UNKNOWN responder on the SUCCESSFUL PATH, adding no exit, fails', () => {
    // ⭐ THE PROBE v4 COULD NOT PASS, and the reason this version exists. It
    // stands on the fall-through corridor: outside every guard, before the
    // canonical call, adding no return.
    const probed = ORACLE.replace(
      'await handleTextMessage(cleanedText);',
      'await totallyNewResponder();\n      await handleTextMessage(cleanedText);',
    );
    expect(probed).not.toBe(ORACLE);

    // Deliberately unchanged — the three properties v4 checked are all blind
    // here, and asserting that keeps this probe from decaying into a tautology.
    expect(enumerateExits(probed).map((e) => e.key)).toEqual(RATIFIED_EXITS.map((e) => e.key));
    expect(enumerateExits(probed)).toEqual([...RATIFIED_EXITS]);
    expect(handlerCalls(probed).filter((c) => c === 'handleTextMessage')).toHaveLength(1);

    // Two independent pins catch it. Either alone would suffice; both are kept
    // because they fail for different reasons and would decay separately.
    expect(handlerCalls(probed)).not.toEqual(RATIFIED_CALLS);
    expect(handlerCalls(probed)).toContain('totallyNewResponder');
    expect(cognitionTail(probed)).not.toEqual(RATIFIED_COGNITION_TAIL);
    expect(cognitionTail(probed)[1]).toBe('totallyNewResponder'); // ahead of cognition
  });

  it('⛔ a KNOWN call moved to sit immediately ahead of cognition fails', () => {
    // ⭐ THE CASE ONLY THE ORDERED TAIL CATCHES. `maiaSpeak` already exists in
    // the handler, so the handler-wide SET is identical; it is merely somewhere
    // it must never be — speaking before MAIA has thought.
    const probed = ORACLE.replace(
      'await handleTextMessage(cleanedText);',
      'maiaSpeak("ahead");\n      await handleTextMessage(cleanedText);',
    );
    expect(probed).not.toBe(ORACLE);
    expect(handlerCalls(probed)).toEqual(RATIFIED_CALLS);              // blind
    expect(cognitionTail(probed)).not.toEqual(RATIFIED_COGNITION_TAIL); // not blind
  });

  it('⛔ an UNKNOWN responder inside an EXISTING guard, adding no exit, fails', () => {
    const probed = ORACLE.replace(
      "console.log('📝 [Scribe Mode] Recording voice transcript passively:'",
      "await totallyNewResponder();\n        console.log('📝 [Scribe Mode] Recording voice transcript passively:'",
    );
    expect(probed).not.toBe(ORACLE);

    const exits = enumerateExits(probed);
    expect(exits.map((e) => e.key)).toEqual(RATIFIED_EXITS.map((e) => e.key)); // enumeration is blind
    expect(exits).not.toEqual([...RATIFIED_EXITS]);
    expect(exits.find((e) => e.key.startsWith('📝'))!.calls).toContain('totallyNewResponder');
  });

  it('⛔ a call MOVING out of its guard onto the corridor fails', () => {
    // The handler-wide set is IDENTICAL — same calls, same count. Only location
    // changed, and location is the difference between MAIA acknowledging a
    // command and MAIA speaking a local script on every turn.
    const probed = ORACLE.replace(
      'await handleTextMessage(cleanedText);',
      'maiaSpeak("moved");\n      await handleTextMessage(cleanedText);',
    ).replace('maiaSpeak(confirmation)', 'void 0');
    expect(probed).not.toBe(ORACLE);
    expect(handlerCalls(probed)).toEqual(RATIFIED_CALLS);           // blind
    expect(enumerateExits(probed)).not.toEqual([...RATIFIED_EXITS]); // not blind
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
    expect(handlerCalls(probed)).toContain('sendStreamingMessage');
  });

  it('⛔ removing the canonical call fails — voice would reach no cognition', () => {
    // Scoped to the handler via AST. An earlier draft sliced from the handler to
    // end-of-file and counted unrelated call sites — a probe that could not fail,
    // which is the same defect as a catalogue that cannot find.
    const probed = ORACLE.replace('await handleTextMessage(cleanedText);', '');
    expect(probed).not.toBe(ORACLE);
    expect(handlerCalls(probed)).not.toContain('handleTextMessage');
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
    // ⛔ AST identifiers, not source text. The removal left a comment block
    // explaining why the branch is gone, which names `streamingVoiceMode` — a
    // text match reads that explanation as the defect. Identifiers cannot.
    const ids = new Set<string>();
    const walk = (n: ts.Node): void => {
      if (ts.isIdentifier(n)) ids.add(n.text);
      ts.forEachChild(n, walk);
    };
    walk(handlerFn(ORACLE).body);
    expect([...ids]).not.toContain('streamingVoiceMode');
    expect([...ids]).not.toContain('sendStreamingMessage');
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
