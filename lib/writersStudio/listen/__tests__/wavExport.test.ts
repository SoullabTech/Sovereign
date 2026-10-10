import { describe, expect, it } from 'vitest';
import { encodePcm24Wav, WAV_EXPORT_MAX_BYTES, WAV_EXPORT_SAMPLE_RATE } from '../wavExport';

const ascii = (data: DataView, at: number, n: number) =>
  Array.from({ length: n }, (_, i) => String.fromCharCode(data.getUint8(at + i))).join('');

describe('Listen · explicitly converted 24-bit PCM WAV', () => {
  it('encodes correct RIFF, signed 24-bit mono and 48-kHz header fields', () => {
    const sample = new Float32Array([-1, 0, 1]);
    const before = Array.from(sample);
    const data = new DataView(encodePcm24Wav([sample]));
    expect(ascii(data, 0, 4)).toBe('RIFF');
    expect(ascii(data, 8, 4)).toBe('WAVE');
    expect(ascii(data, 12, 4)).toBe('fmt ');
    expect(ascii(data, 36, 4)).toBe('data');
    expect(data.getUint32(4, true)).toBe(45);
    expect(data.getUint32(40, true)).toBe(9);
    expect(data.getUint16(20, true)).toBe(1);
    expect(data.getUint16(22, true)).toBe(1);
    expect(data.getUint32(24, true)).toBe(WAV_EXPORT_SAMPLE_RATE);
    expect(data.getUint32(28, true)).toBe(144_000);
    expect(data.getUint16(32, true)).toBe(3);
    expect(data.getUint16(34, true)).toBe(24);
    expect([...new Uint8Array(data.buffer, 44)]).toEqual([
      0, 0, 128, // -8388608
      0, 0, 0,
      255, 255, 127, // +8388607
    ]);
    expect(Array.from(sample)).toEqual(before);
  });

  it('interleaves stereo PCM correctly without inventing channels', () => {
    const data = new DataView(encodePcm24Wav([new Float32Array([1, 0]), new Float32Array([0, -1])]));
    expect(data.getUint16(22, true)).toBe(2);
    expect(data.getUint16(32, true)).toBe(6);
    expect(data.getUint32(28, true)).toBe(288_000);
    expect([...new Uint8Array(data.buffer, 44)]).toEqual([
      255, 255, 127, 0, 0, 0,
      0, 0, 0, 0, 0, 128,
    ]);
  });

  it('clamps overs and replaces invalid samples with digital silence rather than crashing', () => {
    const data = new DataView(encodePcm24Wav([new Float32Array([10, -10, Number.NaN])]));
    expect([...new Uint8Array(data.buffer, 44)]).toEqual([
      255, 255, 127, 0, 0, 128, 0, 0, 0,
    ]);
  });

  it('rejects empty, mismatched, or unsupported multi-channel export', () => {
    expect(() => encodePcm24Wav([])).toThrow(/one or two/);
    expect(() => encodePcm24Wav([new Float32Array([])])).toThrow(/nonempty/);
    expect(() => encodePcm24Wav([new Float32Array(1), new Float32Array(2)])).toThrow(/equal/);
    expect(() => encodePcm24Wav([new Float32Array(1), new Float32Array(1), new Float32Array(1)])).toThrow(/one or two/);
  });

  it('refuses oversized output before allocating a WAV and never changes the source', () => {
    const tooLong = Math.floor(WAV_EXPORT_MAX_BYTES / 3) + 1;
    expect(() => encodePcm24Wav([{ length: tooLong } as Float32Array])).toThrow(/too long/);
  });
});
