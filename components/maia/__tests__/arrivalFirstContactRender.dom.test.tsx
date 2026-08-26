/**
 * @jest-environment jsdom
 *
 * MAIA's first contact — proven in RENDERED OUTPUT.
 *
 * WHY THIS SHAPE. The transcript lives inside OracleConversation: 10,794 lines,
 * 116 imports, 63 media/browser API touchpoints. Mounting it would mean mocking
 * twenty-plus services until the test asserted the mocks rather than the product.
 * So the seam under test is the one that actually decides what the member sees —
 * the visibility predicate the real transcript filter uses — rendered through
 * react-dom, following the pattern already established by
 * app/press/manuscript/__tests__/WriterField.dom.test.tsx.
 *
 * WHAT THIS PROVES: the Arrival first contact reaches rendered DOM, and legacy
 * greeting banners still do not.
 *
 * WHAT IT DOES NOT PROVE: bubble chrome, animation, scroll, or the authenticated
 * browser walk. Those remain unproven and are named as such in the report.
 */

import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import {
  isMemberVisibleTurn,
  firstContactId,
  ARRIVAL_CONTACT_PREFIX,
  LEGACY_GREETING_PREFIX,
  type TranscriptTurn,
} from '@/lib/maia/transcriptVisibility';

let container: HTMLDivElement;
let root: Root;

beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
});
afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

/** The real transcript filter, rendered. */
function Transcript({ messages }: { messages: TranscriptTurn[] }) {
  return (
    <div data-testid="transcript">
      {messages.filter(isMemberVisibleTurn).map((m, i) => (
        <p key={m.id ?? i}>{m.text ?? m.content}</p>
      ))}
    </div>
  );
}

const ARRIVAL_CONTACT =
  'Ada, I’m here. You brought something happening between you and someone else. Where does it seem to begin?';

const mount = (messages: TranscriptTurn[]) => {
  act(() => { root.render(<Transcript messages={messages} />); });
  return container.textContent ?? '';
};

describe('the member sees MAIA meet what they brought', () => {
  it('renders the Arrival first contact into visible output', () => {
    const seen = mount([{ id: firstContactId(true, 1), text: ARRIVAL_CONTACT }]);
    expect(seen).toContain('Ada, I’m here.');
    expect(seen).toContain('You brought something happening between you and someone else.');
    expect(seen).toContain('Where does it seem to begin?');
  });

  it('puts it in the DOM as a real element, not just in state', () => {
    mount([{ id: firstContactId(true, 1), text: ARRIVAL_CONTACT }]);
    const para = container.querySelector('[data-testid="transcript"] p');
    expect(para).not.toBeNull();
    expect(para!.textContent).toBe(ARRIVAL_CONTACT);
  });
});

describe('legacy greeting banners stay out of the transcript', () => {
  it('does not render a legacy greeting', () => {
    const seen = mount([{ id: `${LEGACY_GREETING_PREFIX}1`, text: 'Good afternoon, Ada' }]);
    expect(seen).not.toContain('Good afternoon');
    expect(container.querySelectorAll('p')).toHaveLength(0);
  });

  it('renders the arrival contact while filtering a legacy greeting beside it', () => {
    const seen = mount([
      { id: `${LEGACY_GREETING_PREFIX}1`, text: 'Good afternoon, Ada' },
      { id: firstContactId(true, 2), text: ARRIVAL_CONTACT },
    ]);
    expect(seen).not.toContain('Good afternoon');
    expect(seen).toContain('Ada, I’m here.');
  });
});

describe('id policy', () => {
  it('marks a first contact WITH arrival context as a real turn', () => {
    expect(firstContactId(true, 7)).toBe(`${ARRIVAL_CONTACT_PREFIX}7`);
    expect(isMemberVisibleTurn({ id: firstContactId(true, 7) })).toBe(true);
  });

  it('leaves a first contact WITHOUT arrival context filtered, as before', () => {
    expect(firstContactId(false, 7)).toBe(`${LEGACY_GREETING_PREFIX}7`);
    expect(isMemberVisibleTurn({ id: firstContactId(false, 7) })).toBe(false);
  });

  it('renders ordinary member and MAIA turns unchanged', () => {
    const seen = mount([
      { id: 'user-1', text: 'hello' },
      { id: 'maia-1', text: 'I hear you' },
    ]);
    expect(seen).toContain('hello');
    expect(seen).toContain('I hear you');
  });
});

describe('no duplication', () => {
  it('renders the arrival contact exactly once', () => {
    mount([{ id: firstContactId(true, 1), text: ARRIVAL_CONTACT }]);
    expect(container.querySelectorAll('p')).toHaveLength(1);
  });

  it('a re-render does not duplicate it', () => {
    const msgs = [{ id: firstContactId(true, 1), text: ARRIVAL_CONTACT }];
    mount(msgs); mount(msgs);
    expect(container.querySelectorAll('p')).toHaveLength(1);
  });
});
