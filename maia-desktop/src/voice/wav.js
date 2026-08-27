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

/**
 * @param {Float32Array|number[]} samples mono, nominally [-1, 1]
 * @param {number} sampleRate
 * @returns {Uint8Array} a complete RIFF/WAVE file
 */
function encodeWav(samples, sampleRate) {
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

module.exports = { encodeWav };
