/** @jest-environment jsdom */
import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import CraftsmansTableR1, { type CraftsmansTableR1Props } from '@/app/dev/writers-studio-pc3-live/CraftsmansTableR1';
import type { RebuildSection } from '@/lib/writersStudio/rebuild/model';

const source = 'Change is a constant.\n\nThe stars turn as we watch.\n\nAnother passage remains.';
const section: RebuildSection = {
  draftSectionId: 'chapter-1', sourceSectionId: null, position: 0,
  heading: 'The Dance of Transformation', headingDepth: 2, headingSignal: null,
  editable: true, body: source,
};

describe('Next focus as a writer-owned editorial continuation', () => {
  let host: HTMLDivElement;
  let root: Root;
  let props: CraftsmansTableR1Props;
  let onContinue: jest.Mock;
  let onChoose: jest.Mock;
  let onAskMaia: jest.Mock;

  async function draw() {
    await act(async () => {
      root.render(React.createElement(CraftsmansTableR1, props));
    });
  }
  async function click(label: string) {
    const button = [...host.querySelectorAll('button')]
      .find(node => node.textContent?.trim() === label || node.querySelector('b')?.textContent?.trim() === label);
    if (!button) throw new Error('Missing button: ' + label);
    await act(async () => button.click());
  }

  beforeEach(async () => {
    (globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;
    host = document.createElement('div');
    document.body.appendChild(host);
    root = createRoot(host);
    onContinue = jest.fn(() => true);
    onChoose = jest.fn();
    onAskMaia = jest.fn();
    props = {
      sections: [section], bodyOf: () => source,
      held: { draftSectionId: section.draftSectionId, start: 0,
        end: 'Change is a constant.'.length,
        text: 'Change is a constant.', revisionNumber: 3 },
      thread: null, version: null, busy: false,
      onSend: jest.fn(), onSaveMember: jest.fn(async () => true),
      onApply: jest.fn(), appliedVersionId: null,
      nextFocus: {
        nextLabel: 'The stars turn as we watch.',
        onContinue, onChoose, onAskMaia,
      },
    };
    await draw();
  });

  afterEach(async () => {
    await act(async () => root.unmount());
    host.remove();
  });

  it('keeps the focus unchanged until the author chooses a destination', async () => {
    await click('Next focus →');
    const choices = host.querySelector('[aria-label="Choose next focus"]');
    expect(choices).not.toBeNull();
    expect(choices?.textContent).toContain('Continue in order');
    expect(choices?.textContent).toContain("I'll choose");
    expect(choices?.textContent).toContain('Ask MAIA');
    expect(choices?.textContent).toContain('The stars turn as we watch.');
    expect(onContinue).not.toHaveBeenCalled();
    expect(onChoose).not.toHaveBeenCalled();
    expect(onAskMaia).not.toHaveBeenCalled();
    expect(props.onApply).not.toHaveBeenCalled();
    await click("I'll choose");
    expect(onChoose).toHaveBeenCalledTimes(1);
    expect(onContinue).not.toHaveBeenCalled();
    expect(onAskMaia).not.toHaveBeenCalled();
    expect(host.querySelector('[aria-label="Choose next focus"]')).toBeNull();
  });

  it('asks MAIA for grounded suggestions without moving focus', async () => {
    await click('Next focus →');
    await click('Ask MAIA');
    expect(onAskMaia).toHaveBeenCalledTimes(1);
    expect(onContinue).not.toHaveBeenCalled();
    expect(onChoose).not.toHaveBeenCalled();
    expect(props.onApply).not.toHaveBeenCalled();
  });

  it('continues in order only when explicitly chosen', async () => {
    await click('Next focus →');
    await click('Continue in order');
    expect(onContinue).toHaveBeenCalledTimes(1);
    expect(onAskMaia).not.toHaveBeenCalled();
    expect(props.onApply).not.toHaveBeenCalled();
    expect(host.querySelector('[aria-label="Choose next focus"]')).toBeNull();
  });

  it('warns when leaving an unsaved working copy, without applying anything', async () => {
    props = { ...props, restoreSnapshot: {
      key: JSON.stringify([section.draftSectionId, 0, 'Change is a constant.'.length, 'Change is a constant.']),
      candidateVersion: null, decisions: [], manualText: 'Change remains a constant.',
      manualFromVersionId: null, directDraft: '', directEditing: false,
      customDraft: '', customEditId: null, writerHasActed: true,
      activeEditId: null, view: 'preview', notation: 'guided', kept: [],
      workingText: 'Change remains a constant.', original: 'Change is a constant.',
    } };
    await draw();
    await click('Next focus →');
    expect(host.querySelector('[data-next-focus-draft-notice]')?.textContent).toContain('not saved');
    expect(onContinue).not.toHaveBeenCalled();
    expect(props.onApply).not.toHaveBeenCalled();
  });

  it('truthfully disables sequential movement when no next passage exists', async () => {
    props = {
      ...props, nextFocus: {
        nextLabel: null, onContinue, onChoose, onAskMaia,
      },
    };
    await draw();
    await click('Next focus →');
    expect([...host.querySelectorAll('button')].find(node => node.textContent?.includes('Continue in order'))?.disabled).toBe(true);
    expect(host.textContent).toContain('No later passage in this chapter');
    expect(onContinue).not.toHaveBeenCalled();
  });
});
