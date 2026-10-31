/** @jest-environment jsdom */
/**
 * JARVIS — fictional-only Craft focus component qualification.
 * This test deliberately DOES NOT mount a real author Work, issue a request,
 * save a draft, or activate the separately held Apply and Source endpoints.
 */
import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import CraftFocusToolsR1, {
  type CraftFocusToolsR1Props,
} from '@/app/dev/writers-studio-pc3-live/CraftFocusToolsR1';

const original = 'The lantern waits.\n\nThe river listens.';
const section = {
  draftSectionId: 'fictional-lighthouse',
  sourceSectionId: null,
  heading: 'The Lighthouse',
  headingDepth: 2 as const,
  headingSignal: null,
  position: 0,
  body: original,
  editable: true,
};

describe('JARVIS Craft focus tools isolated from manuscript mutation', () => {
  let node: HTMLDivElement;
  let root: Root;
  let props: CraftFocusToolsR1Props;
  let onMove: jest.Mock;
  let onStay: jest.Mock;
  let onAsk: jest.Mock;

  function controls() {
    return node.querySelector<HTMLElement>('[data-craft-focus-tools]')!;
  }
  function click(label: string) {
    const button = Array.from(controls().querySelectorAll('button'))
      .find(element => element.textContent?.trim() === label ||
        element.getAttribute('aria-label') === label);
    expect(button).toBeDefined();
    act(() => button!.click());
  }
  function render() {
    act(() => {
      root.render(React.createElement(CraftFocusToolsR1, props));
    });
  }

  beforeEach(() => {
    (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean })
      .IS_REACT_ACT_ENVIRONMENT = true;
    node = document.createElement('div');
    document.body.appendChild(node);
    root = createRoot(node);
    onMove = jest.fn(() => true);
    onStay = jest.fn();
    onAsk = jest.fn();
    props = {
      sections: [section], bodyOf: () => original,
      revisionNumber: 1, current: null, busy: false, receipt: null,
      onMove, onStay, onAsk,
    };
  });
  afterEach(() => {
    act(() => root.unmount());
    window.getSelection()?.removeAllRanges();
    node.remove();
  });

  it('only opens a picker on a writer gesture, without moving focus', () => {
    render();
    expect(controls().querySelector('[aria-label="Choose a passage to focus on"]')).toBeNull();
    click('Choose passage');
    expect(controls().querySelector('[aria-label="Choose a passage to focus on"]')).not.toBeNull();
    expect(onMove).not.toHaveBeenCalled();
    expect(onAsk).not.toHaveBeenCalled();
  });

  it('requires an explicit Work here click for a known exact paragraph', () => {
    render();
    click('Choose passage');
    const target = controls().querySelector<HTMLButtonElement>(
      '[aria-label="Work here: The lantern waits."]');
    expect(target).not.toBeNull();
    act(() => target!.click());
    expect(onMove).toHaveBeenCalledTimes(1);
    expect(onMove.mock.calls[0]?.[0]).toMatchObject({
      sectionId: 'fictional-lighthouse',
      text: 'The lantern waits.', start: 0,
      end: Array.from('The lantern waits.').length,
    });
    expect(onAsk).not.toHaveBeenCalled();
  });

  it('explicit Focus whole section preserves the exact numeric Source span', () => {
    const numbered = 'The year\n2026\nwill be remembered.\n\n175';
    const numberSection = { ...section, body: numbered };
    props = { ...props, sections: [numberSection], bodyOf: () => numbered };
    render();
    click('Choose passage');
    click('Focus whole section');
    expect(onMove).toHaveBeenCalledTimes(1);
    expect(onMove.mock.calls[0]?.[0]).toMatchObject({
      sectionId: 'fictional-lighthouse', start: 0,
      end: Array.from(numbered).length, text: numbered,
    });
  });

  it('allows asking MAIA only as an explicit callback, not a model call', () => {
    render();
    click('Ask MAIA where next');
    expect(onAsk).toHaveBeenCalledTimes(1);
    expect(onMove).not.toHaveBeenCalled();
  });

  it('does not open a different passage while marked busy', () => {
    props = { ...props, busy: true };
    render();
    const control = Array.from(controls().querySelectorAll('button'))
      .find(button => button.textContent?.trim() === 'Choose passage');
    expect(control?.disabled).toBe(true);
    expect(onMove).not.toHaveBeenCalled();
  });

  it('opens a picker on an explicit Next Focus request without auto-navigation', () => {
    props = { ...props, pickerRequest: 1 };
    render();
    expect(controls().querySelector('[aria-label="Choose a passage to focus on"]')).not.toBeNull();
    expect(onMove).not.toHaveBeenCalled();
  });
});
