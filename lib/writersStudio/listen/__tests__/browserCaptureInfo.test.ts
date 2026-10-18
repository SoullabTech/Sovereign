import { afterEach, describe, expect, it, vi } from 'vitest';
import { browserCaptureInfo, outputFormatLabel, preferredRecorderMime, recordingConstraints } from '../browserCaptureInfo';

describe('Listen · honest capture information', () => {
  afterEach(() => vi.unstubAllGlobals());
  const safariMac='Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Safari/605.1.15';
  const iosChrome='Mozilla/5.0 (iPhone; CPU iPhone OS 26_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/141 Mobile/15E148 Safari/604.1';
  const chromeMac='Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36';
  const setSupported=(supported:string[])=>vi.stubGlobal('MediaRecorder',{
    isTypeSupported:(mime:string)=>supported.includes(mime),
  });

  it('selects clean M4A/AAC first on Safari and iPhone WebKit with capability evidence', () => {
    setSupported(['audio/webm;codecs=opus','audio/mp4','audio/webm']);
    expect(preferredRecorderMime(safariMac)).toBe('audio/mp4');
    expect(preferredRecorderMime(iosChrome)).toBe('audio/mp4');
    expect(preferredRecorderMime('Mozilla/5.0 AppleWebKit/605.1.15 FxiOS/140 Safari/605')).toBe('audio/mp4');
  });

  it('preserves existing WebM-first selection for desktop Chromium and Gecko', () => {
    setSupported(['audio/webm;codecs=opus','audio/mp4','audio/webm']);
    expect(preferredRecorderMime(chromeMac)).toBe('audio/webm;codecs=opus');
    expect(preferredRecorderMime('Mozilla/5.0 AppleWebKit/537.36 Edg/141.0 Safari/537.36')).toBe('audio/webm;codecs=opus');
    expect(preferredRecorderMime('Mozilla/5.0 Gecko/20100101 Firefox/140')).toBe('audio/webm;codecs=opus');
  });

  it('falls back conservatively when browser rejects a preferred MIME', () => {
    setSupported(['audio/webm;codecs=opus']);
    expect(preferredRecorderMime(safariMac)).toBe('audio/webm;codecs=opus');
    setSupported(['audio/webm']);
    expect(preferredRecorderMime(safariMac)).toBe('audio/webm');
    setSupported([]);
    expect(preferredRecorderMime(safariMac)).toBe('');
  });

  it('never invents recording capability when the browser has no MediaRecorder', () => {
    vi.stubGlobal('MediaRecorder',undefined);
    expect(preferredRecorderMime(safariMac)).toBe('');
    vi.stubGlobal('MediaRecorder',{});
    expect(preferredRecorderMime(safariMac)).toBe('');
  });
  it('requests 48 kHz mono without claiming a guaranteed hardware setting', () => {
    const requested = recordingConstraints('microphone-1');
    expect(requested.sampleRate).toEqual({ ideal: 48000 });
    expect(requested.channelCount).toEqual({ ideal: 1 });
    expect(requested.echoCancellation).toBe(false);
    expect(requested.noiseSuppression).toBe(false);
    expect(requested.autoGainControl).toBe(false);
    expect(requested.deviceId).toEqual({ ideal: 'microphone-1' });
  });

  it('reports only observed browser input settings, not invented file bit depth', () => {
    const actual = browserCaptureInfo(
      { sampleRate: 44100, channelCount: 2, sampleSize: 16, echoCancellation: true },
      'audio/webm;codecs=opus',
    );
    expect(actual.microphoneSampleRateHz).toBe(44100);
    expect(actual.microphoneChannels).toBe(2);
    expect(actual.microphoneSampleSizeBits).toBe(16);
    expect(actual.echoCancellation).toBe(true);
    expect(actual.noiseSuppression).toBeNull();
    expect(actual.outputMimeType).toContain('webm');
    expect('outputBitDepth' in actual).toBe(false);
    expect(outputFormatLabel(actual.outputMimeType)).toContain('compressed');
  });

  it('leaves unavailable capture facts explicitly unknown', () => {
    const unknown = browserCaptureInfo({}, '');
    expect(unknown.microphoneSampleRateHz).toBeNull();
    expect(unknown.microphoneSampleSizeBits).toBeNull();
    expect(outputFormatLabel('')).toContain('not yet reported');
  });

  it('distinguishes MP4 from WebM without claiming either is 24-bit WAV', () => {
    expect(outputFormatLabel('audio/mp4')).toBe('MP4 / M4A (compressed)');
    expect(outputFormatLabel('audio/webm;codecs=opus')).toBe('WebM / Opus (compressed)');
  });
});
