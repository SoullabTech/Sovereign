/**
 * The browser MediaRecorder path is compressed. A reported microphone rate
 * describes the capture track, NOT the encoded file's sample rate or bit depth.
 * Do not claim 24-bit WAV from MediaRecorder metadata.
 */
export type BrowserCaptureInfo = {
  microphoneSampleRateHz: number | null;
  microphoneChannels: number | null;
  microphoneSampleSizeBits: number | null;
  outputMimeType: string;
  echoCancellation: boolean | null;
  noiseSuppression: boolean | null;
  autoGainControl: boolean | null;
};

export function recordingConstraints(deviceId?: string): MediaTrackConstraints {
  return {
    ...(deviceId ? { deviceId: { ideal: deviceId } } : {}),
    sampleRate: { ideal: 48000 },
    channelCount: { ideal: 1 },
    echoCancellation: false,
    noiseSuppression: false,
    autoGainControl: false,
  };
}

/**
 * Prefer Safari/WebKit's native M4A/AAC recorder when the engine supports it.
 * Real WebKit synthetic 48 kHz mono captures exposed an Opus packet warning
 * to an independent decoder even though WebM advertised support; equivalent
 * M4A captures decoded without that warning. Do not guess codec support from
 * the UA alone: verify each requested MIME with MediaRecorder first.
 *
 * Blink/Gecko keep their original WebM-first sequence. iOS Chrome and Firefox
 * also use Apple WebKit, so their CriOS/FxiOS labels must not force Blink order.
 */
export function preferredRecorderMime(userAgent?: string): string {
  if (typeof MediaRecorder === 'undefined' || typeof MediaRecorder.isTypeSupported !== 'function') return '';
  const ua = userAgent ?? (typeof navigator !== 'undefined' ? navigator.userAgent : '');
  const appleWebKitEngine = /AppleWebKit\//.test(ua)
    && !/(?:Chrome|Chromium|Edg|OPR)\//.test(ua);
  const candidates = appleWebKitEngine
    ? ['audio/mp4', 'audio/webm;codecs=opus', 'audio/webm']
    : ['audio/webm;codecs=opus', 'audio/mp4', 'audio/webm'];
  return candidates.find((mime) => MediaRecorder.isTypeSupported(mime)) ?? '';
}

export function browserCaptureInfo(settings: MediaTrackSettings, outputMimeType: string): BrowserCaptureInfo {
  return {
    microphoneSampleRateHz: Number.isFinite(settings.sampleRate) ? settings.sampleRate! : null,
    microphoneChannels: Number.isFinite(settings.channelCount) ? settings.channelCount! : null,
    microphoneSampleSizeBits: Number.isFinite(settings.sampleSize) ? settings.sampleSize! : null,
    outputMimeType,
    echoCancellation: typeof settings.echoCancellation === 'boolean' ? settings.echoCancellation : null,
    noiseSuppression: typeof settings.noiseSuppression === 'boolean' ? settings.noiseSuppression : null,
    autoGainControl: typeof settings.autoGainControl === 'boolean' ? settings.autoGainControl : null,
  };
}

export function outputFormatLabel(mime: string): string {
  const lowered = mime.toLowerCase();
  if (lowered.includes('webm')) return 'WebM / Opus (compressed)';
  if (lowered.includes('mp4')) return 'MP4 / M4A (compressed)';
  return mime ? mime + ' (browser-encoded)' : 'Browser recording (format not yet reported)';
}
