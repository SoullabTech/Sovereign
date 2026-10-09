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

export function preferredRecorderMime(): string {
  if (typeof MediaRecorder === 'undefined' || typeof MediaRecorder.isTypeSupported !== 'function') return '';
  return ['audio/webm;codecs=opus', 'audio/mp4', 'audio/webm']
    .find((mime) => MediaRecorder.isTypeSupported(mime)) ?? '';
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
