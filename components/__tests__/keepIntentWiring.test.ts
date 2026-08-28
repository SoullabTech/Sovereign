/**
 * KEEP-INTENT-01 wiring — recognition must not consume the member's turn, and
 * must not carry persistence authority.
 *
 * The defect this guards against is subtle and has already happened once in this
 * codebase: detectJournalCommand() recognizes "capture this" in
 * handleTextMessage and RETURNS — the message is never sent, so MAIA never
 * replies. Recognizing an affordance made her mute. "Can we keep this?" is
 * relational speech addressed to her, and the interface must not answer it on
 * her behalf.
 *
 * ⚠️ Asserted against source text: the properties here are structural — which
 * function a call sits inside, whether a branch returns, whether a guard
 * precedes a call. jsdom renders none of this, and a behavioural test would need
 * to drive a full streaming conversation to reach the seam.
 */

import { readFileSync } from 'fs';
import { join } from 'path';

const SOURCE = readFileSync(
  join(__dirname, '..', 'OracleConversation.tsx'),
  'utf8',
);

/** The Keep-intent block at the response seam. */
const KEEP_BLOCK = (() => {
  const start = SOURCE.indexOf('const keepIntent = detectKeepIntent(cleanedText);');
  expect(start).toBeGreaterThan(-1);
  const end = SOURCE.indexOf('// 🚪 CLIENT-SIDE INTENT DETECTION', start);
  expect(end).toBeGreaterThan(start);
  return SOURCE.slice(start, end);
})();

/** handleTextMessage, where the swallowing journal detector lives. */
const TEXT_HANDLER = (() => {
  const start = SOURCE.indexOf('const handleTextMessage = useCallback(');
  expect(start).toBeGreaterThan(-1);
  return SOURCE.slice(start, start + 4000);
})();

describe('the member\'s turn survives recognition', () => {
  it('Keep intent is recognized at the response seam, after a reply exists', () => {
    // `oracleMessage` only exists once MAIA has responded.
    const seam = SOURCE.indexOf('const keepIntent = detectKeepIntent(cleanedText);');
    const reply = SOURCE.indexOf('const oracleMessage');
    expect(reply).toBeGreaterThan(-1);
    expect(seam).toBeGreaterThan(reply);
  });

  it('is NOT wired into handleTextMessage beside the swallowing detector', () => {
    expect(TEXT_HANDLER).not.toContain('detectKeepIntent');
  });

  it('the Keep block never returns early — nothing short-circuits the turn', () => {
    expect(KEEP_BLOCK).not.toMatch(/\breturn\b/);
  });

  it('detectJournalCommand is left exactly as it was — no keep phrases added', () => {
    // Kelly: do not route Keep phrases through the detector that consumes the
    // utterance. If someone adds them there, MAIA goes mute on "keep this".
    const detector = readFileSync(
      join(__dirname, '..', '..', 'lib', 'services', 'conversationEssenceExtractor.ts'),
      'utf8',
    );
    const triggers = detector.slice(
      detector.indexOf('const journalTriggers = ['),
      detector.indexOf('];', detector.indexOf('const journalTriggers = [')),
    );
    expect(triggers).not.toContain('keep this');
    expect(triggers).not.toContain('mark this');
  });
});

describe('recognition does not commit', () => {
  it('the material branch surfaces a doorway, it does not open the panel', () => {
    const material = KEEP_BLOCK.slice(KEEP_BLOCK.indexOf("keepIntent.kind === 'open_keep'"));
    const doorway = material.slice(material.indexOf('} else if'));
    expect(doorway).toContain('buildUiAction');
    expect(doorway).not.toContain('handleCaptureSpiritRef');
  });

  it('nothing in the block persists anything', () => {
    expect(KEEP_BLOCK).not.toMatch(/apiFetch|createCapsule|\/api\/capsules/);
  });

  it('the doorway names the member as the one who asked, not MAIA as noticer', () => {
    expect(KEEP_BLOCK).toContain("leadIn: 'You asked to keep this.'");
  });
});

describe('explicit "open Keep" opens Keep, and only opens it', () => {
  it('the explicit branch invokes the capture handler', () => {
    const open = KEEP_BLOCK.slice(
      KEEP_BLOCK.indexOf("keepIntent.kind === 'open_keep'"),
    );
    expect(open).toContain('handleCaptureSpiritRef.current?.()');
  });

  it('opening is safe because the open seam no longer writes', () => {
    // The precondition Kelly set before authorizing this wire.
    const route = readFileSync(
      join(__dirname, '..', '..', 'app', 'api', 'capsules', 'from-chat-window', 'route.ts'),
      'utf8',
    ).replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
    expect(route).not.toMatch(/\bcreateCapsule\s*\(/);
  });
});

describe('Sanctuary suppresses the doorway and the panel', () => {
  it('the Sanctuary branch comes first and does neither', () => {
    const guard = KEEP_BLOCK.indexOf('if (isSanctuary) {');
    const open = KEEP_BLOCK.indexOf("keepIntent.kind === 'open_keep'");
    expect(guard).toBeGreaterThan(-1);
    expect(guard).toBeLessThan(open);

    const branch = KEEP_BLOCK.slice(guard, open);
    expect(branch).not.toContain('handleCaptureSpiritRef');
    expect(branch).not.toContain('buildUiAction');
  });

  it('isSanctuary is a dependency of the enclosing callback', () => {
    expect(SOURCE).toContain('pendingLensConsent, isSanctuary]);');
  });

  it('the source guard in handleCaptureSpirit still backs this up', () => {
    // Even if the branch above were bypassed, the handler refuses.
    const handler = SOURCE.slice(
      SOURCE.indexOf('const handleCaptureSpirit = useCallback'),
      SOURCE.indexOf('}, [userId, messages, sessionId, isSanctuary]);'),
    );
    expect(handler).toMatch(/if \(isSanctuary\) \{/);
  });
});

describe('MAIA cannot claim the Keep completed', () => {
  it('the speech-act boundary still forbids asserting a capture', () => {
    const voice = readFileSync(
      join(__dirname, '..', '..', 'lib', 'sovereign', 'maiaVoice.ts'),
      'utf8',
    );
    expect(voice).toContain('MEMORY SPEECH-ACT BOUNDARY (non-negotiable)');
    expect(voice).toContain('you must not assert that it was captured');
  });

  it('the platform map repeats it at the Keep entry, which FAST also receives', () => {
    const map = readFileSync(
      join(__dirname, '..', '..', 'lib', 'sovereign', 'platformKnowledge.ts'),
      'utf8',
    );
    expect(map).toContain('Naming Keep is not claiming a keep happened');
  });
});
