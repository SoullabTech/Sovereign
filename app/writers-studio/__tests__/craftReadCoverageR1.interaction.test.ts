/** @jest-environment jsdom */
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import Companion, { type MaiaCraftCompanionR1Props } from '@/app/dev/writers-studio-pc3-live/MaiaCraftCompanionR1';

describe('Craft reading coverage stays visible beside the conversation', () => {
  it('keeps a partial-reading notice visible after the model reply, without opening a dashboard', async () => {
    (globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;
    const host = document.createElement('div'); document.body.appendChild(host);
    const root = createRoot(host);
    const notice = 'Partial chapter reread: 1/8 editorial lenses. Not completed: arc, voice. Saved manuscript only; your working copy is compared separately.';
    const props: MaiaCraftCompanionR1Props = {
      title: 'Synthetic chapter', thread: null, version: null, lastMaiaTurn: null,
      busy: true, message: null, activity: 'Reading…', dialogue: [], readingNotice: notice,
      editLatitude: 1, onEditLatitude: jest.fn(), mayRemoveParagraphs: false,
      onMayRemoveParagraphs: jest.fn(), mayProposeImmediately: false, onMayProposeImmediately: jest.fn(),
      sessionPosture: { resolved: true, sanctuary: false }, onChooseSessionPosture: jest.fn(),
      onSend: jest.fn(), onDepth: jest.fn(), onReturn: jest.fn(),
    };
    try {
      await act(async () => root.render(React.createElement(Companion, props)));
      expect(host.querySelector('[data-craft-reading-coverage]')?.textContent).toBe(notice);
      await act(async () => root.render(React.createElement(Companion, {
        ...props, busy: false, activity: null,
        dialogue: [{ key: 'test', speaker: 'maia', body: 'We can discuss the completed reading without assuming the rest.' }],
      })));
      expect(host.querySelector('[data-craft-reading-coverage]')?.textContent).toBe(notice);
      expect(host.querySelectorAll('textarea')).toHaveLength(1);
      expect(host.querySelector('[aria-label="Ways to work with MAIA"]')).toBeNull();
      expect(props.onSend).not.toHaveBeenCalled();
    } finally {
      await act(async () => root.unmount()); host.remove();
    }
  });
});
