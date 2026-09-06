import fs from 'fs';
import path from 'path';
import { decideInjection } from '../injection';

/**
 * Acceptance cases for the in-place reflection handoff (2026-09-04).
 *
 * Cases 2 is a true behavioral test of the decision rule. Cases 1 and 3 are
 * SOURCE INVARIANTS, not render tests: this repo has no React renderer wired
 * into jest (node env, `.ts`-only testMatch, no @testing-library/react), and
 * OracleConversation is ~11k lines. So they pin the properties that would break
 * if the injection path were ever rewritten to behave like the seed path —
 * which is exactly the regression that matters. They are weaker than a render
 * test and should be replaced by one if a renderer is ever configured.
 */

// ACCEPTANCE NUMBERING: shared with place.test.ts — see the note there. Grep
// BOTH files for the next free number before adding a case.

const oracleSource = fs.readFileSync(
  path.join(__dirname, '../../../../components/OracleConversation.tsx'),
  'utf8',
);
const discussSource = fs.readFileSync(
  path.join(__dirname, '../../../../components/reflections/DiscussWithMaia.tsx'),
  'utf8',
);
const presenceSource = fs.readFileSync(
  path.join(__dirname, '../../../../components/maia/presence/MaiaPresence.tsx'),
  'utf8',
);

/**
 * Strip comments so these guards assert on CODE, not on prose. Without this a
 * comment saying "no setMessages([]) here" would fail the very check it
 * describes — and, worse, deleting the comment would "fix" it.
 */
function code(source: string): string {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .split('\n')
    .map(line => line.replace(/(^|\s)\/\/.*$/, '$1'))
    .join('\n');
}

/** Code of the effect that handles injectedMessage, comments removed. */
function injectionEffect(): string {
  const start = oracleSource.indexOf('IN-PLACE MESSAGE INJECTION');
  expect(start).toBeGreaterThan(-1);
  const end = oracleSource.indexOf('}, [injectedMessage, handleTextMessage]);', start);
  expect(end).toBeGreaterThan(start);
  return code(oracleSource.slice(start, end));
}

describe('decideInjection — ACCEPTANCE 2: re-render vs deliberate resend', () => {
  it('sends a new nonce and reports it as handled', () => {
    const d = decideInjection(null, { text: 'A reflection I kept', nonce: 1 });
    expect(d).toEqual({ send: true, nonce: 1, text: 'A reflection I kept' });
  });

  it('the SAME injected object re-rendering does not send twice', () => {
    const injected = { text: 'A reflection I kept', nonce: 1 };
    expect(decideInjection(null, injected).send).toBe(true);
    // Effect re-runs (handleTextMessage identity changed, parent re-rendered…)
    expect(decideInjection(1, injected).send).toBe(false);
    expect(decideInjection(1, injected).send).toBe(false);
  });

  it('the same TEXT with a new nonce is an explicit resend, not a duplicate', () => {
    // Deduping on text would silently swallow a member pressing discuss twice.
    const d = decideInjection(1, { text: 'A reflection I kept', nonce: 2 });
    expect(d).toEqual({ send: true, nonce: 2, text: 'A reflection I kept' });
  });

  it('no injection, empty text, and malformed nonces never send', () => {
    expect(decideInjection(null, null).send).toBe(false);
    expect(decideInjection(null, undefined).send).toBe(false);
    expect(decideInjection(null, { text: '   ', nonce: 3 }).send).toBe(false);
    expect(decideInjection(null, { text: 'x', nonce: NaN as number }).send).toBe(false);
  });

  it('an empty gesture is still consumed so a re-render cannot revive it', () => {
    expect(decideInjection(null, { text: '', nonce: 4 }).nonce).toBe(4);
  });

  it('trims what travels', () => {
    expect(decideInjection(null, { text: '  kept  ', nonce: 5 }).text).toBe('kept');
  });
});

describe('ACCEPTANCE 1: injection appends — prior turns survive', () => {
  const effect = injectionEffect();

  it('the injection path does not clear the transcript', () => {
    // The seed processor deliberately does all of these; injection must not.
    expect(effect).not.toMatch(/setMessages\(\[\]\)/);
    expect(effect).not.toMatch(/historicalMessagesRef\.current = \[\]/);
    expect(effect).not.toMatch(/localStorage\.removeItem/);
    expect(effect).not.toMatch(/lastSyncedCountRef/);
  });

  it('the seed processor still clears — the two paths stay distinct', () => {
    // Guards the contrast itself: if seeding stopped clearing, this test is
    // asserting nothing and should be revisited rather than deleted.
    const seedStart = oracleSource.indexOf('SEED PROMPT PROCESSOR');
    const seedBlock = code(oracleSource.slice(seedStart, oracleSource.indexOf('IN-PLACE MESSAGE INJECTION')));
    expect(seedBlock).toMatch(/setMessages\(\[\]\)/);
  });

  it('sends through the same handler as a typed message', () => {
    // No second cognition path: an injected message is an ordinary member turn.
    expect(effect).toMatch(/handleTextMessage\(decision\.text\)/);
  });
});

describe('ACCEPTANCE 3: the member is not moved', () => {
  it('the presence path in DiscussWithMaia returns before any navigation', () => {
    const discussCode = code(discussSource);
    const openIdx = discussCode.indexOf('presence.openMaiaWith(prompt)');
    const pushIdx = discussCode.indexOf("router.push('/maia')");
    expect(openIdx).toBeGreaterThan(-1);
    expect(pushIdx).toBeGreaterThan(openIdx);
    // Everything between the in-place send and the fallback navigation must be
    // the early return — no navigation on the path a hosted member takes.
    expect(discussCode.slice(openIdx, pushIdx)).toMatch(/return;/);
  });

  it('the fallback navigation is reached only when presence cannot host', () => {
    expect(code(discussSource)).toMatch(/if \(presence\?\.canHost\)/);
  });
});

describe('ACCEPTANCE 4: hosted reflection conversation stays inside its sheet', () => {
  it('the presence host explicitly requests contained, text-only presentation', () => {
    const presenceCode = code(presenceSource);
    expect(presenceCode).toMatch(/voiceEnabled=\{false\}/);
    expect(presenceCode).toMatch(/initialShowChatInterface=\{true\}/);
    expect(presenceCode).toMatch(/presentationMode="contained"/);
  });

  it('text chat remains renderable when voice is disabled', () => {
    expect(code(oracleSource)).toMatch(/\(voiceEnabled \|\| showChatInterface\)/);
  });

  it('contained mode establishes a local fixed-position containing block', () => {
    const oracleCode = code(oracleSource);
    expect(oracleCode).toMatch(/isContainedPresentation \? 'h-full min-h-0' : 'min-h-screen'/);
    expect(oracleCode).toMatch(/transform: 'translateZ\(0\)'/);
  });

  it('contained transcript and composer use host-relative widths', () => {
    const oracleCode = code(oracleSource);
    expect(oracleCode).toMatch(/\? 'top-2 left-0 right-0 w-full opacity-100'/);
    expect(oracleCode).toMatch(/\? 'inset-x-0' : 'left-14 right-0 sm:inset-x-0'/);
  });
});

describe('ACCEPTANCE 5: an empty 200 is a protocol failure, not a MAIA sentence (F1)', () => {
  const oracleCode = code(oracleSource);

  it('no placeholder stands in for a response that never came', () => {
    // The route persists the assistant half only when sovereignText exists, so
    // a generation that produced nothing leaves the member's utterance standing
    // ALONE by design. The old `|| "I'm here. What wants your attention?"` tail
    // fabricated exactly that turn: shown to the member, absent from
    // conversation_turns, indistinguishable from a real reply.
    expect(oracleCode).not.toMatch(/What wants your attention\?'\)/);
    expect(oracleCode).toMatch(/responseData\.message \|\| ''/);
  });

  it('the empty case bails instead of rendering an oracle message', () => {
    const bail = oracleCode.slice(oracleCode.indexOf('if (!cleanedMaiaText.trim())'));
    expect(bail.slice(0, 400)).toMatch(/setInputSubmitError/);
    expect(bail.slice(0, 400)).toMatch(/return;/);
  });

  it('the member turn is not mislabelled as undelivered', () => {
    // It WAS delivered: a 200 came back, and the route makes the member turn
    // durable at acceptance, before generation. Only the response is missing —
    // so no markFailed here, and the banner says exactly that.
    const bail = oracleCode.slice(
      oracleCode.indexOf('if (!cleanedMaiaText.trim())'),
      oracleCode.indexOf('responseText = cleanedMaiaText;'),
    );
    expect(bail).not.toMatch(/markFailed/);
    expect(oracleSource).toMatch(/Your message was received, but no response came back/);
  });

  it('the ruled network-mode presence fallback is left untouched', () => {
    // Narrowness guard: generatePresenceFallback is a separate, documented,
    // banner-mitigated design (it flags isFallback). This repair must not have
    // quietly removed it while removing the unflagged placeholder.
    expect(oracleCode).toMatch(/generatePresenceFallback\(/);
    expect(oracleCode).toMatch(/isFallback: true/);
  });
});
