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

describe('C. the dispatch — the component supplies live state', () => {
  it('FALSIFIES: the call site passes isSanctuary', () => {
    expect(componentSrc()).toMatch(
      /sendStreamingMessage\(\s*cleanedText\s*,\s*conversationHistory\s*,\s*isSanctuary\s*\)/,
    );
  });

  it('pins the exact pre-repair call as forbidden', () => {
    // Negative control. If this two-argument form returns, the breach returns.
    expect(componentSrc()).not.toMatch(
      /sendStreamingMessage\(\s*cleanedText\s*,\s*conversationHistory\s*\)/,
    );
  });

  it('passes state, not a literal or a stale capture', () => {
    const src = componentSrc();
    expect(src).not.toMatch(/sendStreamingMessage\([^)]*,\s*(true|false)\s*\)/);
    // isSanctuary must still be the component's own state, not a prop or const.
    expect(src).toMatch(/const \[isSanctuary, setIsSanctuary\] = useState/);
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
