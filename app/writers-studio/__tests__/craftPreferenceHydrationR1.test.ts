/** @jest-environment jsdom */
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { useEditingLatitude } from '@/app/writers-studio/insight/EditingLatitude';
import { sequenceOverrideKey } from '@/lib/writersStudio/editingLatitude';
import { craftArrivalPolicy } from '@/lib/writersStudio/craftSuggestionPolicyR1';

describe('Craft suggestion preference hydration', () => {
  it('never treats a protective first paint or a previous Work setting as the current choice', async () => {
    (globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;
    localStorage.clear();
    localStorage.setItem(sequenceOverrideKey('work-a'), '1');
    const arrivals: Array<{ work: string; resolved: boolean; policy: string | null }> = [];
    function Probe({ work }: { work: string }) {
      const setting = useEditingLatitude(work);
      const policy = craftArrivalPolicy({ resolved: setting.resolved, proactive: setting.mayProposeImmediately });
      arrivals.push({ work, resolved: setting.resolved, policy: policy?.proposalPolicy ?? null });
      return null;
    }
    const host = document.createElement('div');
    const root = createRoot(host);
    try {
      await act(async () => root.render(React.createElement(Probe, { work: 'work-a' })));
      expect(arrivals[0]).toEqual({ work: 'work-a', resolved: false, policy: null });
      expect(arrivals.at(-1)).toEqual({ work: 'work-a', resolved: true, policy: 'allow' });
      await act(async () => root.render(React.createElement(Probe, { work: 'work-b' })));
      const workB = arrivals.filter(entry => entry.work === 'work-b');
      expect(workB[0]).toEqual({ work: 'work-b', resolved: false, policy: null });
      expect(workB.at(-1)).toEqual({ work: 'work-b', resolved: true, policy: 'reply_only' });
      expect(localStorage.getItem(sequenceOverrideKey('work-a'))).toBe('1');
      expect(localStorage.getItem(sequenceOverrideKey('work-b'))).toBeNull();
    } finally {
      await act(async () => root.unmount());
      localStorage.clear();
    }
  });
});
