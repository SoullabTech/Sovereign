/** @jest-environment jsdom */
import { coordinateSourcePosture, sanctuaryFromSettingsEvent } from '../sourcePostureCoordinator';
test('only literal booleans are recognized', () => {
  expect(sanctuaryFromSettingsEvent({ detail: { sanctuary: true } })).toBe(true);
  expect(sanctuaryFromSettingsEvent({ detail: { sanctuary: 'false' } })).toBeNull();
  expect(sanctuaryFromSettingsEvent({ detail: null })).toBeNull();
});
test('notifies only on entry; local exit cannot unlock source saving', () => {
  const notify = jest.fn(async () => 'acknowledged');
  const stop = coordinateSourcePosture(window, notify);
  window.dispatchEvent(new CustomEvent('maia-settings-changed', { detail: { sanctuary: false } }));
  expect(notify).not.toHaveBeenCalled();
  window.dispatchEvent(new CustomEvent('maia-settings-changed', { detail: { sanctuary: true } }));
  expect(notify).toHaveBeenCalledTimes(1);
  expect(notify).toHaveBeenCalledWith(true);
  stop();
  window.dispatchEvent(new CustomEvent('maia-settings-changed', { detail: { sanctuary: true } }));
  expect(notify).toHaveBeenCalledTimes(1);
});
test('unusable event is not an affirmative server permission', () => {
  const notify = jest.fn(async () => 'acknowledged');
  const stop = coordinateSourcePosture(window, notify);
  window.dispatchEvent(new CustomEvent('maia-settings-changed', { detail: { sanctuary: 'true' } }));
  expect(notify).not.toHaveBeenCalled();
  stop();
});
