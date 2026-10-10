/**
 * Local-only, post-capture export. The browser's original (possibly lossy)
 * recording remains unchanged. A WAV built from it is NOT a lossless master.
 */
export const WAV_EXPORT_SAMPLE_RATE = 48_000;
export const WAV_EXPORT_MAX_BYTES = 180 * 1024 * 1024;

export function encodePcm24Wav(channels: readonly Float32Array[], sampleRate = WAV_EXPORT_SAMPLE_RATE): ArrayBuffer {
  if (!Number.isInteger(sampleRate) || sampleRate <= 0 || sampleRate > 192_000) {
    throw new Error('Invalid WAV sample rate.');
  }
  if (channels.length < 1 || channels.length > 2) {
    throw new Error('WAV export supports one or two audio channels.');
  }
  const frames = channels[0]!.length;
  if (!Number.isSafeInteger(frames) || frames === 0 || channels.some((samples) => samples.length !== frames)) {
    throw new Error('Audio channels must contain equal, nonempty sample counts.');
  }

  const dataLength = frames * channels.length * 3;
  if (!Number.isSafeInteger(dataLength) || dataLength > WAV_EXPORT_MAX_BYTES || dataLength > 0xffffffff - 36) {
    throw new Error('This take is too long for a browser WAV export. Keep the original recording.');
  }
  const buffer = new ArrayBuffer(44 + dataLength);
  const view = new DataView(buffer);
  const ascii = (offset: number, value: string) => {
    for (let i = 0; i < value.length; i += 1) view.setUint8(offset + i, value.charCodeAt(i));
  };
  ascii(0, 'RIFF');
  view.setUint32(4, 36 + dataLength, true);
  ascii(8, 'WAVE');
  ascii(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // linear PCM, not IEEE float
  view.setUint16(22, channels.length, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * channels.length * 3, true);
  view.setUint16(32, channels.length * 3, true);
  view.setUint16(34, 24, true);
  ascii(36, 'data');
  view.setUint32(40, dataLength, true);
  let offset = 44;
  for (let frame = 0; frame < frames; frame += 1) {
    for (const channel of channels) {
      const raw = channel[frame]!;
      const sample = Number.isFinite(raw) ? Math.max(-1, Math.min(1, raw)) : 0;
      const pcm = Math.round(sample * (sample < 0 ? 8388608 : 8388607));
      view.setUint8(offset++, pcm & 255);
      view.setUint8(offset++, (pcm >> 8) & 255);
      view.setUint8(offset++, (pcm >> 16) & 255);
    }
  }
  return buffer;
}

/** Decode an existing browser take, resample to 48 kHz, and encode 24-bit PCM.
 * This never accesses the microphone or writes to any server.
 */
export async function convertedWavBlob(source: Blob): Promise<Blob> {
  if (typeof AudioContext === 'undefined' || typeof OfflineAudioContext === 'undefined') {
    throw new Error('WAV conversion is unavailable in this browser. Download the original instead.');
  }
  const context = new AudioContext();
  try {
    const decoded = await context.decodeAudioData(await source.arrayBuffer());
    if (!Number.isFinite(decoded.duration) || decoded.duration <= 0 || decoded.numberOfChannels > 2) {
      throw new Error('This recording cannot be converted to a WAV file.');
    }
    const frames = Math.ceil(decoded.duration * WAV_EXPORT_SAMPLE_RATE);
    if (frames * decoded.numberOfChannels * 3 > WAV_EXPORT_MAX_BYTES) {
      throw new Error('This take is too long for browser WAV conversion. Download the original.');
    }
    const offline = new OfflineAudioContext(decoded.numberOfChannels, frames, WAV_EXPORT_SAMPLE_RATE);
    const player = offline.createBufferSource();
    player.buffer = decoded;
    player.connect(offline.destination);
    player.start();
    const rendered = await offline.startRendering();
    const channels = Array.from({ length: rendered.numberOfChannels }, (_, index) => rendered.getChannelData(index));
    return new Blob([encodePcm24Wav(channels, rendered.sampleRate)], { type: 'audio/wav' });
  } finally {
    await context.close().catch(() => {});
  }
}
