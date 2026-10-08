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

test('initial known Sanctuary ON is reaffirmed when coordinator mounts', () => {
  const notify = jest.fn(async () => 'acknowledged');
  const stop = coordinateSourcePosture(window, notify, () => true);
  expect(notify).toHaveBeenCalledTimes(1);
  stop();
});
test('initial OFF or unreadable posture never unlocks source persistence', () => {
  const notify = jest.fn(async () => 'acknowledged');
  const stop = coordinateSourcePosture(window, notify, () => { throw new Error('unreadable'); });
  expect(notify).not.toHaveBeenCalled();
  stop();
  const stop2 = coordinateSourcePosture(window, notify, () => false);
  expect(notify).not.toHaveBeenCalled();
  stop2();
});
