import { describe, expect, it } from 'vitest';
import { browserCaptureInfo, outputFormatLabel, recordingConstraints } from '../browserCaptureInfo';

describe('Listen · honest capture information', () => {
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
