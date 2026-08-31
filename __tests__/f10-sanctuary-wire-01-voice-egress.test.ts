/**
 * F10-SANCTUARY-WIRE-01 — Sanctuary must cross the wire.
 *
 * F10 (#1128) put a `!sanctuary` guard on the voice route's MemoryBundle build.
 * The guard was correct and it never fired, because the client never told the
 * route it was in Sanctuary.
 *
 *   UI            Sanctuary selected
 *   CLIENT WIRE   `sanctuary` absent from the POST body
 *   ROUTE         `sanctuary = false`  (stream-conversation/route.ts:621)
 *   RESULT        attempted=true · retrieval ran · memory reached the prompt
 *                 · the turn was persisted
 *
 * Witnessed in production on turn 4fde4e90-4f09-4ff7-8021-d30cc94887d8, whose
 * `voice:memory_trace` read `attempted=true notAttemptedReason=n/a` while the
 * member had Sanctuary on. A server-side guard cannot defend a boundary the
 * client declines to declare.
 *
 * ⭐ WHY SOURCE PINS. Both surfaces are React client code with no exported
 * seam: the emission is an inline `fetch` body inside a `useCallback`, and the
 * dispatch is one call inside a streaming branch of a 10k-line component. Same
 * precedent as the F10 boundary proof and VOICE-MIC-LABEL-01 — pin the call
 * site itself.
 *
 * ⛔ WHAT MUST NOT COME BACK.
 *   1. `sanctuary` as a hook OPTION. `sendMessage` is a useCallback with a
 *      17-entry dependency array; an option would make this boundary depend on
 *      that array staying correct, and a missed entry ships a stale `false`.
 *   2. An OPTIONAL parameter. A caller that forgets must fail to compile. The
 *      absent value is precisely what caused the breach.
 *   3. A CONDITIONAL send (`...(sanctuary && { sanctuary })`). The route cannot
 *      distinguish "not in Sanctuary" from "the client forgot to say".
 */

import fs from 'fs';
import path from 'path';
import ts from 'typescript';

const HOOK = path.join(process.cwd(), 'hooks/useStreamingVoice.ts');
const COMPONENT = path.join(process.cwd(), 'components/OracleConversation.tsx');
const ROUTE = path.join(process.cwd(), 'app/api/voice/stream-conversation/route.ts');

/**
 * Strip comments before matching.
 *
 * Both files deliberately quote the pre-repair shape while explaining why it is
 * gone. Without this, that reasoning would fail the tests it exists to
 * document, and a future author could go green by deleting the explanation.
 */
const strip = (s: string) =>
  s.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/(^|[^:])\/\/[^\n]*/g, '$1');

const hookSrc = () => strip(fs.readFileSync(HOOK, 'utf8'));
const componentSrc = () => strip(fs.readFileSync(COMPONENT, 'utf8'));

/** The object literal passed as the POST body to the voice route. */
function readRequestBody(): string {
  const src = hookSrc();
  const call = src.indexOf("apiFetch('/api/voice/stream-conversation'");
  expect(call).toBeGreaterThan(-1); // the route must still be called at all

  const body = src.indexOf('JSON.stringify({', call);
  expect(body).toBeGreaterThan(-1);

  // Walk braces so a nested object cannot truncate the body early.
  let depth = 0;
  for (let i = src.indexOf('{', body); i < src.length; i++) {
    if (src[i] === '{') depth++;
    else if (src[i] === '}') {
      depth--;
      if (depth === 0) return src.slice(body, i + 1);
    }
  }
  throw new Error('unterminated request body');
}

/** The parameter list of the hook's sendMessage useCallback. */
function readSendMessageParams(): string {
  const src = hookSrc();
  const start = src.indexOf('const sendMessage = useCallback(async (');
  expect(start).toBeGreaterThan(-1);
  const open = src.indexOf('(', src.indexOf('useCallback', start));
  let depth = 0;
  for (let i = open; i < src.length; i++) {
    if (src[i] === '(') depth++;
    else if (src[i] === ')') {
      depth--;
      if (depth === 0) return src.slice(open, i + 1);
    }
  }
  throw new Error('unterminated sendMessage params');
}

// ───────────────────────────────────────────────────────────────────────────
describe('A. the wire — sanctuary reaches the route', () => {
  it('FALSIFIES: the POST body carries sanctuary', () => {
    // Pre-repair this body had 13 fields and none was this one.
    expect(readRequestBody()).toMatch(/(^|[\s,{])sanctuary\s*[,}]/);
  });

  it('sends it unconditionally, never spread or gated', () => {
    // `...(sanctuary && { sanctuary })` would omit the key when false, which is
    // indistinguishable at the route from the client forgetting.
    const body = readRequestBody();
    expect(body).not.toMatch(/\.\.\.\s*\(?\s*sanctuary/);
    expect(body).not.toMatch(/sanctuary\s*\?\s*/);
    expect(body).not.toMatch(/sanctuary:\s*(true|false)\b/);
  });

  it('PRESERVES: the rest of the body is intact', () => {
    // The repair must not be achievable by rewriting the request.
    const body = readRequestBody();
    for (const field of ['message', 'userId', 'sessionId', 'conversationId', 'conversationHistory']) {
      expect(body).toContain(field);
    }
  });
});

describe('B. the parameter — required, and read at dispatch', () => {
  it('FALSIFIES: sendMessage takes sanctuary as a required parameter', () => {
    const params = readSendMessageParams();
    expect(params).toMatch(/sanctuary\s*:\s*boolean/);
    // Optional would let a caller omit it and silently send undefined → false.
    expect(params).not.toMatch(/sanctuary\?\s*:/);
    expect(params).not.toMatch(/sanctuary\s*:\s*boolean\s*=/);
  });

  it('is NOT a hook option', () => {
    // A destructured option would be captured by the useCallback and depend on
    // its 17-entry dependency array staying correct.
    const src = hookSrc();
    const optionsStart = src.indexOf('export function useStreamingVoice(options');
    expect(optionsStart).toBeGreaterThan(-1);
    const destructureEnd = src.indexOf('} = options;', optionsStart);
    expect(destructureEnd).toBeGreaterThan(-1);
    expect(src.slice(optionsStart, destructureEnd)).not.toMatch(/\bsanctuary\b/);
  });
});

/**
 * ── SECTION C, AMENDED BY VOICE-CANONICAL-CONVERGENCE-02 ────────────────────
 *
 * C formerly required the voice handler to dispatch
 *   `sendStreamingMessage(cleanedText, conversationHistory, isSanctuary)`
 * That requirement is now OBSOLETE, because it pinned the very dispatch #1157
 * correctly removes: voice no longer reaches a second cognition path, so there
 * is no streaming call from the handler left to carry Sanctuary on.
 *
 * ⛔ THE BOUNDARY IS NOT WEAKENED, IT MOVED. Sanctuary now crosses on the
 * canonical sender, and the reason the original hazard does NOT follow it is
 * structural rather than incidental:
 *
 *   The header forbids Sanctuary as a hook OPTION because `sendMessage`'s own
 *   17-entry dependency array could go stale and ship a silent `false`.
 *   `handleTextMessage` is not in that position — it is the STATE-OWNING
 *   closure, and it declares `isSanctuary` as its own dependency.
 *
 *     isSanctuary state
 *           ↓ dependency
 *     handleTextMessage ──── body: sanctuary: isSanctuary ──→ canonical route
 *           ↑ dependency
 *     handleVoiceTranscript
 *
 * So the voice callback follows the refreshed canonical sender instead of
 * capturing Sanctuary independently. Four structural facts hold that chain,
 * asserted below, plus two probes proving the assertions can actually go RED.
 */

/** A `useCallback`'s declaration, located structurally rather than by slicing. */
function callbackDecl(name: string): ts.VariableDeclaration {
  const sf = ts.createSourceFile(
    'o.tsx',
    fs.readFileSync(COMPONENT, 'utf8'),
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );
  let found: ts.VariableDeclaration | null = null;
  const walk = (n: ts.Node): void => {
    if (ts.isVariableDeclaration(n) && n.name.getText() === name) found = n;
    ts.forEachChild(n, walk);
  };
  walk(sf);
  expect(found).not.toBeNull();
  return found!;
}

/** The dependency array text of a `useCallback`, comments stripped. */
const depsOf = (name: string): string => {
  const call = callbackDecl(name).initializer as ts.CallExpression;
  const deps = call.arguments[1];
  expect(deps).toBeDefined(); // a useCallback with no dep array is itself the hazard
  return strip(deps.getText()).replace(/\s+/g, ' ');
};

/** A callback's whole body text, nested functions included, comments stripped. */
const bodyOf = (name: string): string =>
  strip((callbackDecl(name).initializer as ts.CallExpression).arguments[0].getText());

describe('C. the dispatch — Sanctuary crosses on the canonical sender', () => {
  it('FALSIFIES: the canonical request body carries sanctuary: isSanctuary', () => {
    expect(bodyOf('handleTextMessage')).toMatch(/\bsanctuary:\s*isSanctuary\b/);
  });

  it('FALSIFIES: handleTextMessage declares isSanctuary as a dependency', () => {
    // Without this the state-owning closure goes stale and ships `false` — the
    // exact failure mode the header forbids for hook options.
    expect(depsOf('handleTextMessage')).toMatch(/\bisSanctuary\b/);
  });

  it('FALSIFIES: handleVoiceTranscript follows the canonical sender', () => {
    // Voice must not capture Sanctuary on its own. It depends on the sender, so
    // it is recreated whenever Sanctuary changes.
    expect(depsOf('handleVoiceTranscript')).toMatch(/\bhandleTextMessage\b/);
  });

  it('⛔ voice dispatches no streaming send — the old egress is gone', () => {
    expect(bodyOf('handleVoiceTranscript')).not.toMatch(/\bsendStreamingMessage\s*\(/);
  });

  it('sends it unconditionally, and as state — never a literal', () => {
    const body = bodyOf('handleTextMessage');
    expect(body).not.toMatch(/\bsanctuary:\s*(true|false)\b/);
    expect(body).not.toMatch(/\.\.\.\(\s*isSanctuary\s*&&/); // no conditional spread
    expect(componentSrc()).toMatch(/const \[isSanctuary, setIsSanctuary\] = useState/);
  });
});

describe('C-PROBES — the amended assertions can actually fail', () => {
  // ⭐ An assertion that cannot go RED is decoration. These mutate the real
  // source in memory and require the checks above to reject the mutation.
  it('⛔ removing isSanctuary from handleTextMessage deps → RED', () => {
    const deps = depsOf('handleTextMessage');
    const mutated = deps.replace(/,?\s*\bisSanctuary\b/, '');
    expect(mutated).not.toBe(deps); // the probe must actually change something
    expect(mutated).not.toMatch(/\bisSanctuary\b/);
  });

  it('⛔ replacing sanctuary: isSanctuary with sanctuary: false → RED', () => {
    const body = bodyOf('handleTextMessage');
    const mutated = body.replace(/\bsanctuary:\s*isSanctuary\b/, 'sanctuary: false');
    expect(mutated).not.toBe(body);
    expect(mutated).not.toMatch(/\bsanctuary:\s*isSanctuary\b/);
    expect(mutated).toMatch(/\bsanctuary:\s*(true|false)\b/); // the forbidden literal form
  });
});

describe('D. why the client is the fix — recorded, not assumed', () => {
  it('the route defaults sanctuary to false when the body omits it', () => {
    // This is the fail-OPEN default that turned a missing field into a
    // non-Sanctuary turn. It is recorded here rather than changed: the route is
    // not in this unit's lease. If it is ever made fail-closed, this pin should
    // be revisited deliberately, not silently.
    const route = fs.readFileSync(ROUTE, 'utf8');
    expect(route).toMatch(/sanctuary\s*=\s*false\s*,/);
  });

  it('the route already gates retrieval on it — the guard was never the problem', () => {
    const route = fs.readFileSync(ROUTE, 'utf8');
    expect(route).toMatch(/memoryNotAttemptedReason\s*=\s*'sanctuary'/);
    expect(route).toMatch(/if\s*\(\s*userId\s*&&\s*!sanctuary\s*\)/);
  });
});
