// MAIA Desktop — Float32 PCM → 16-bit WAV.
//
// DESKTOP-CONVERSATION-01. Pure: no Node APIs beyond Buffer-free typed arrays,
// no audio context, no I/O. The transcription route expects a real audio file in
// multipart form data; the AudioWorklet gives us Float32 samples. This is the
// only thing between them.
//
// 16-bit PCM mono, because that is what Whisper wants and because a float WAV
// would double the payload for no accuracy the model can use.

'use strict';

// Whisper resamples everything to 16 kHz internally, so sending 48 kHz means
// sending three times the bytes for accuracy the model cannot use. The device
// walk (2026-08-27) made that concrete: bodies over ~512 KB were rejected
// upstream of the route, and at 48 kHz a 5-second turn is already 480 KB.
const WHISPER_RATE = 16000;

/**
 * Decimate by averaging over the source window. A point-sampling resampler
 * aliases speech harmonics down into the formant range — a box average over the
 * window is a crude low-pass, which is the cheapest thing that is not wrong.
 *
 * @param {ArrayLike<number>} samples
 * @param {number} from source rate
 * @param {number} to target rate
 * @returns {Float32Array}
 */
function resample(samples, from, to) {
  if (!from || !to || from === to || from < to) return Float32Array.from(samples);
  const ratio = from / to;
  const out = new Float32Array(Math.floor(samples.length / ratio));
  for (let i = 0; i < out.length; i++) {
    const start = Math.floor(i * ratio);
    const end = Math.min(samples.length, Math.floor((i + 1) * ratio));
    let sum = 0;
    for (let j = start; j < end; j++) sum += samples[j];
    out[i] = end > start ? sum / (end - start) : 0;
  }
  return out;
}

/**
 * @param {Float32Array|number[]} samples mono, nominally [-1, 1]
 * @param {number} sampleRate
 * @param {{targetRate?: number}} [opts]
 * @returns {Uint8Array} a complete RIFF/WAVE file
 */
function encodeWav(input, inputRate, opts = {}) {
  const targetRate = opts.targetRate === undefined ? WHISPER_RATE : opts.targetRate;
  const samples = resample(input, inputRate, targetRate);
  const sampleRate = inputRate > targetRate ? targetRate : inputRate;
  const n = samples.length;
  const bytes = new Uint8Array(44 + n * 2);
  const view = new DataView(bytes.buffer);

  const ascii = (off, s) => { for (let i = 0; i < s.length; i++) view.setUint8(off + i, s.charCodeAt(i)); };

  ascii(0, 'RIFF');
  view.setUint32(4, 36 + n * 2, true);
  ascii(8, 'WAVE');
  ascii(12, 'fmt ');
  view.setUint32(16, 16, true);          // PCM chunk size
  view.setUint16(20, 1, true);           // format = PCM
  view.setUint16(22, 1, true);           // channels = mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true); // byte rate
  view.setUint16(32, 2, true);           // block align
  view.setUint16(34, 16, true);          // bits per sample
  ascii(36, 'data');
  view.setUint32(40, n * 2, true);

  // Clamp before scaling: a sample slightly outside [-1,1] would wrap to the
  // opposite sign as a 16-bit int, which is audible as a click and can look to
  // a model like a consonant that was never spoken.
  for (let i = 0; i < n; i++) {
    let s = samples[i];
    if (s > 1) s = 1; else if (s < -1) s = -1;
    view.setInt16(44 + i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }
  return bytes;
}

module.exports = { encodeWav, resample, WHISPER_RATE };
