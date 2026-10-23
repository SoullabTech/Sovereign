/** @jest-environment jsdom */

import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { SessionRitualOpening } from '../SessionRitualOpening';
import { SessionRitualClosing } from '../SessionRitualClosing';
import { ResumeSessionPrompt } from '../ResumeSessionPrompt';
import { SessionTimeAwareness } from '../SessionTimeAwareness';
import { SessionTimer } from '@/lib/session/SessionTimer';

describe('MAIA ritual and visible timer — client-only P0 regressions', () => {
  let host: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    host = document.createElement('div');
    document.body.appendChild(host);
    root = createRoot(host);
  });

  afterEach(() => {
    act(() => root.unmount());
    host.remove();
    jest.useRealTimers();
  });

  it('never calls closing during idle mount, rerenders or StrictMode replay', () => {
    const initialClose = jest.fn();
    const nextClose = jest.fn();
    const view = (isOpen: boolean, onComplete: () => void) =>
      React.createElement(
        React.StrictMode,
        null,
        React.createElement(SessionRitualClosing, {
          isOpen, onComplete, onSkip: jest.fn(),
        }),
      );

    act(() => root.render(view(false, initialClose)));
    expect(initialClose).not.toHaveBeenCalled();
    expect(host.querySelector('[role="dialog"]')).toBeNull();

    act(() => root.render(view(false, nextClose)));
    expect(initialClose).not.toHaveBeenCalled();
    expect(nextClose).not.toHaveBeenCalled();

    act(() => root.render(view(true, nextClose)));
    expect(nextClose).not.toHaveBeenCalled();
    const dialog = host.querySelector('[role="dialog"]');
    expect(dialog).not.toBeNull();

    const request = Array.from(host.querySelectorAll('button')).find(
      (button) => button.textContent?.includes('Request session close'),
    );
    expect(request).toBeDefined();
    act(() => { request?.click(); request?.click(); });
    expect(nextClose).toHaveBeenCalledTimes(1);
  });

  it('opens once per true opening transition despite callback identity changes', () => {
    const first = jest.fn();
    const replacement = jest.fn();
    const view = (isOpen: boolean, onComplete: () => void) =>
      React.createElement(
        React.StrictMode,
        null,
        React.createElement(SessionRitualOpening, { isOpen, onComplete }),
      );

    act(() => root.render(view(false, first)));
    expect(first).not.toHaveBeenCalled();
    act(() => root.render(view(true, first)));
    expect(first).toHaveBeenCalledTimes(1);
    act(() => root.render(view(true, replacement)));
    expect(first).toHaveBeenCalledTimes(1);
    expect(replacement).not.toHaveBeenCalled();

    act(() => root.render(view(false, replacement)));
    act(() => root.render(view(true, replacement)));
    expect(replacement).toHaveBeenCalledTimes(1);
  });

  it('renders the actual extended timer, not a fixed thirty-minute default', () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-10-22T12:00:00.000Z'));
    const timer = new SessionTimer({ durationMinutes: 50 });
    act(() => root.render(React.createElement(SessionTimeAwareness, { timer })));
    expect(host.textContent).toContain('0:00 / 50:00');

    timer.extend(15);
    act(() => jest.advanceTimersByTime(1000));
    expect(host.textContent).toContain('0:01 / 65:00');
    expect(host.querySelector('[role="progressbar"]')?.getAttribute('aria-valuenow')).toBe('0');

    // The displayed seconds should advance independently from MAIA's
    // intentionally rounded, minute-level response context.
    act(() => jest.advanceTimersByTime(89_000));
    expect(host.textContent).toContain('1:30 / 65:00');
  });
  it('never offers unverified resume or New; dismissed notice carries no session authority', () => {
    const onResume = jest.fn();
    const onStartNew = jest.fn();
    const onDismiss = jest.fn();
    const view = (isOpen: boolean, verified: boolean) =>
      React.createElement(ResumeSessionPrompt, {
        isOpen,
        onResume,
        onStartNew,
        onDismiss,
        verifiedResumeAdmission: verified,
        verifiedNewConversationAdmission: verified,
      });

    act(() => root.render(view(false, false)));
    expect(host.querySelector('[role="dialog"]')).toBeNull();

    act(() => root.render(view(true, false)));
    expect(host.querySelector('[role="dialog"]')).not.toBeNull();
    const buttons = Array.from(host.querySelectorAll('button'));
    expect(buttons).toHaveLength(3);
    expect(buttons[0].disabled).toBe(true);
    expect(buttons[1].disabled).toBe(true);
    expect(buttons[2].disabled).toBe(false);

    act(() => { buttons[0].click(); buttons[1].click(); buttons[2].click(); });
    expect(onResume).not.toHaveBeenCalled();
    expect(onStartNew).not.toHaveBeenCalled();
    expect(onDismiss).toHaveBeenCalledTimes(1);

    // These inputs can only come from a future server-verified parent
    // admission. No local storage value makes them true by default.
    act(() => root.render(view(true, true)));
    const allowed = Array.from(host.querySelectorAll('button'));
    expect(allowed[0].disabled).toBe(false);
    expect(allowed[1].disabled).toBe(false);
    act(() => { allowed[0].click(); allowed[1].click(); });
    expect(onResume).toHaveBeenCalledTimes(1);
    expect(onStartNew).toHaveBeenCalledTimes(1);
  });

});
