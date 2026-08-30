/** @jest-environment jsdom */

/**
 * DESKTOP-SOVEREIGN-STT-01 — Desktop must never reach browser recognition.
 *
 * ⛔ THE TEST THE FOUNDER SPECIFIED, and the one that would have caught
 * VOICE-PATH-SELECTION-01 outright:
 *
 *     platform = desktop
 *       → selectedTransport === 'sovereign-whisper'
 *       → SpeechRecognition unreachable
 *
 * The defect was never a broken transport. It was a taxonomy with two
 * categories — Capacitor-native and web — into which Desktop fell as "web",
 * and from there onto a browser-managed, network-dependent recognition service
 * contrary to D01 §XII. So these are written as attempts to make a Desktop
 * surface resolve to `web-speech`.
 */

import { describe, it, expect } from '@jest/globals';
import fs from 'node:fs';
import path from 'node:path';
import {
  selectVoiceTransport,
  isDesktopShell,
  type VoiceTransportFacts,
} from '../platformDetection';

/** The real Desktop UA, copied from a device walk (2026-08-29 witness logs). */
const DESKTOP_UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) maia-desktop/0.0.1-d01 Chrome/120';
const CHROME_UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
const FIREFOX_UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:128.0) Gecko/20100101 Firefox/128.0';

const facts = (o: Partial<VoiceTransportFacts>): VoiceTransportFacts => ({
  isNative: false, isDesktop: false, hasSpeechRecognition: true, canRecordAudio: true, ...o,
});

describe('Desktop is a first-class platform, never generic web', () => {
  it('recognises the real Desktop user agent', () => {
    expect(isDesktopShell(DESKTOP_UA)).toBe(true);
  });

  it('does not mistake ordinary browsers for Desktop', () => {
    for (const ua of [CHROME_UA, FIREFOX_UA, '', 'Mozilla/5.0 (iPhone) Safari']) {
      expect(isDesktopShell(ua), ua.slice(0, 40)).toBe(false);
    }
  });

  it('is not fooled by a site or path that merely contains the name', () => {
    // The marker requires the `maia-desktop/` product token, not the substring.
    expect(isDesktopShell('Mozilla/5.0 evil.com/maia-desktop-lookalike')).toBe(false);
    expect(isDesktopShell('Mozilla/5.0 (X11) maia-desktopish/1.0')).toBe(false);
  });
});

describe('S1/S2 — Desktop resolves to sovereign-whisper, never web-speech', () => {
  it('THE DEFECT, as a test: Desktop HAS Web Speech and still must not use it', () => {
    // ⛔ Chromium ships SpeechRecognition. A rule of the form "use Whisper when
    // Web Speech is missing" — which is what existed — silently returns Desktop
    // to the browser service. This asserts the classification wins over the
    // capability.
    expect(selectVoiceTransport(facts({ isDesktop: true, hasSpeechRecognition: true })))
      .toBe('sovereign-whisper');
  });

  it('no combination of facts yields web-speech on Desktop', () => {
    for (const hasSpeechRecognition of [true, false]) {
      for (const canRecordAudio of [true, false]) {
        const t = selectVoiceTransport(facts({ isDesktop: true, hasSpeechRecognition, canRecordAudio }));
        expect(t, `speech=${hasSpeechRecognition} record=${canRecordAudio}`).not.toBe('web-speech');
      }
    }
  });

  it('S12 — a Desktop that cannot record fails honestly rather than degrading', () => {
    // Never 'web-speech'. An unavailable sovereign transport is reported as
    // unavailable; it is not quietly rerouted to the path canon forbids.
    expect(selectVoiceTransport(facts({ isDesktop: true, canRecordAudio: false }))).toBe('none');
  });
});

describe('S11 — every other platform is unchanged', () => {
  it('Capacitor native still takes the native speech path, Desktop flag or not', () => {
    expect(selectVoiceTransport(facts({ isNative: true }))).toBe('native-speech');
    expect(selectVoiceTransport(facts({ isNative: true, isDesktop: true }))).toBe('native-speech');
  });

  it('ordinary web with Web Speech is untouched', () => {
    expect(selectVoiceTransport(facts({}))).toBe('web-speech');
  });

  it('Firefox/Zen keep the existing no-Web-Speech Whisper route', () => {
    expect(selectVoiceTransport(facts({ hasSpeechRecognition: false }))).toBe('sovereign-whisper');
  });

  it('a browser with neither Web Speech nor recording gets none, as before', () => {
    expect(selectVoiceTransport(facts({ hasSpeechRecognition: false, canRecordAudio: false }))).toBe('none');
  });

  it('a native build is native even if its UA carries the marker', () => {
    // Capacitor wins. Belt and braces against a future native shell whose
    // user agent inherits the desktop product token.
    expect(selectVoiceTransport(facts({ isNative: true, isDesktop: true, hasSpeechRecognition: false })))
      .toBe('native-speech');
  });
});

describe('S2 — the refusal is structural in the component, not advisory', () => {
  const src = fs.readFileSync(
    path.join(__dirname, '..', '..', '..', 'components', 'voice', 'ContinuousConversation.tsx'),
    'utf8',
  );

  it('the single SpeechRecognition construction site refuses Desktop first', () => {
    const init = src.slice(src.indexOf('const initializeSpeechRecognition'));
    const guard = init.indexOf('isDesktopShell()');
    const construct = init.indexOf('new SpeechRecognition()');
    expect(guard, 'Desktop is not refused at the construction site').toBeGreaterThan(-1);
    expect(construct).toBeGreaterThan(-1);
    expect(guard, 'the Desktop refusal comes after construction').toBeLessThan(construct);
  });

  it('there is only ONE construction site, so one guard covers it', () => {
    expect(src.split('new SpeechRecognition()').length - 1).toBe(1);
  });

  it('Desktop is routed to the sovereign branch by classification, not capability', () => {
    expect(src).toContain('(info.isDesktop || !hasSpeechRecognitionAPI()) && canRecordAudio');
  });

  it('S10 — this unit added no preload, Node, filesystem or shell access', () => {
    for (const forbidden of ['require(', 'window.maia', 'ipcRenderer', 'electron']) {
      expect(src.toLowerCase()).not.toContain(forbidden.toLowerCase());
    }
  });
});
