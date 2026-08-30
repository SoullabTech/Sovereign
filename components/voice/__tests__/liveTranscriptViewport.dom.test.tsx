/**
 * @jest-environment jsdom
 */
/**
 * DESKTOP-VOICE-LIVE-TRANSCRIPT-VIEWPORT-01 — the member must be able to see
 * what MAIA is currently hearing.
 *
 * WHAT THE DEVICE WITNESS ESTABLISHED. During a long spoken turn the live
 * interim row kept updating but the newest words left the visible region; after
 * the turn committed, the SAME sentence appeared complete in the conversation.
 * The content survived end to end. So this is not an STT truncation defect, not
 * a VAD defect, not a dispatch defect and not an acoustic-admission defect —
 * it is presentation loss, and the repair is bounded to this row's layout.
 *
 * WHAT THIS SUITE PROVES. That the row wraps, that it is bounded so it cannot
 * shove the voice controls off-screen, and — the load-bearing part — that it
 * FOLLOWS its own growth. A bounded box that does not follow is the same defect
 * wearing different clothes: the member would see the first lines and lose the
 * live edge.
 *
 * ⛔ THE FOLLOW TEST MUST DISTINGUISH GROWTH FROM MOUNT. An effect that only
 * ran once would still leave scrollTop looking "set" on a single render. The
 * scroll height is therefore CHANGED between readings and the assertion tracks
 * the new value, so an effect that does not re-run per reading fails.
 */

import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { VoiceInteractionBar, type VoiceInteractionState } from '../VoiceInteractionBar';

// jsdom performs no layout, so scrollHeight is always 0 and the follow effect
// would be unfalsifiable. A configurable getter supplies the one geometry fact
// the effect consumes; nothing else about layout is simulated or claimed.
let scrollHeightPx = 0;
const realScrollHeight = Object.getOwnPropertyDescriptor(Element.prototype, 'scrollHeight');

beforeAll(() => {
  Object.defineProperty(Element.prototype, 'scrollHeight', {
    configurable: true,
    get() { return scrollHeightPx; },
  });
});
afterAll(() => {
  if (realScrollHeight) Object.defineProperty(Element.prototype, 'scrollHeight', realScrollHeight);
});

let container: HTMLDivElement;
let root: Root;

const render = (state: VoiceInteractionState, interim: string) => {
  act(() => {
    root.render(
      <VoiceInteractionBar
        voiceState={state}
        interimTranscript={interim}
        onStop={() => {}}
        onInterrupt={() => {}}
        onTextSubmit={() => {}}
      />
    );
  });
};

const viewport = () => container.querySelector<HTMLDivElement>('[data-testid="interim-viewport"]');
const interimText = () => viewport()?.querySelector('p');

beforeEach(() => {
  scrollHeightPx = 0;
  container = document.createElement('div');
  document.body.appendChild(container);
  act(() => { root = createRoot(container); });
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

const SHORT = 'and now this is the third time';
const LONG = Array(14).fill('and now this is the third time you have heard me say this').join(' ');

describe('a short partial is visible', () => {
  it('renders the interim text while listening', () => {
    render('listening', SHORT);
    expect(interimText()?.textContent).toBe(SHORT);
  });

  it('labels it as provisional — the member can tell it has not become a turn', () => {
    render('listening', SHORT);
    expect(container.textContent).toContain('hearing · not sent yet');
  });
});

describe('a long partial wraps and stays bounded', () => {
  it('the text wraps rather than running off one line', () => {
    // FAILS IF: `truncate` (white-space:nowrap + overflow:hidden + ellipsis)
    // returns — the exact defect witnessed on device.
    render('listening', LONG);
    const cls = interimText()!.className;
    expect(cls).not.toContain('truncate');
    expect(cls).toContain('whitespace-pre-wrap');
    expect(cls).toContain('break-words');
  });

  it('the whole partial is present in the DOM, not clipped away', () => {
    render('listening', LONG);
    expect(interimText()?.textContent).toBe(LONG);
  });

  it('growth is capped and scrolls internally, so the voice controls cannot be pushed off-screen', () => {
    // FAILS IF: the ceiling is removed (an unbounded panel) or the internal
    // scroller is removed (a bounded box that hides its own overflow).
    render('listening', LONG);
    const cls = viewport()!.className;
    expect(cls).toMatch(/max-h-/);
    expect(cls).toContain('overflow-y-auto');
  });
});

describe('the newest words stay visible as the partial grows', () => {
  it('follows the live edge on every reading, not merely on mount', () => {
    // ⛔ THE LOAD-BEARING ASSERTION. The scroll height CHANGES between
    // readings; an effect that ran only at mount would leave scrollTop at the
    // first value and fail the second expectation.
    scrollHeightPx = 40;
    render('listening', SHORT);
    expect(viewport()!.scrollTop).toBe(40);

    scrollHeightPx = 420;
    render('listening', `${SHORT} you have heard me say this ${LONG}`);
    expect(viewport()!.scrollTop).toBe(420);

    scrollHeightPx = 900;
    render('listening', `${LONG} ${LONG}`);
    expect(viewport()!.scrollTop).toBe(900);
  });

  it('does not follow on a re-render that changes nothing about the transcript', () => {
    // Guards the dependency: following on unrelated renders would fight a
    // member who deliberately scrolled back within the row.
    scrollHeightPx = 40;
    render('listening', SHORT);
    viewport()!.scrollTop = 5;
    scrollHeightPx = 999;
    render('listening', SHORT);
    expect(viewport()!.scrollTop).toBe(5);
  });
});

describe('commit behaviour is unchanged', () => {
  it('the interim row disappears once listening ends — it does not linger beside the committed turn', async () => {
    // ⛔ The removal is an AnimatePresence EXIT, so it is not synchronous: the
    // subtree stays mounted (still showing the last provisional text) until the
    // 0.15 s exit finishes. Asserting immediately after the state change would
    // fail on the animation rather than on the behaviour, so the exit is
    // allowed to complete first. It must still actually complete — a row that
    // never unmounted would leave provisional text sitting beside the
    // committed turn, which is exactly what must not happen.
    render('listening', LONG);
    expect(viewport()).not.toBeNull();
    render('thinking', '');
    await act(async () => { await new Promise((r) => setTimeout(r, 400)); });
    expect(viewport()).toBeNull();
    expect(container.textContent).not.toContain('hearing · not sent yet');
  });

  it('no interim row is shown outside listening, even if a stale partial is still held', () => {
    render('idle', SHORT);
    expect(viewport()).toBeNull();
  });
});
