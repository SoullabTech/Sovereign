import { StreamingPcm16Resampler } from '@/lib/voice/predictors/pcm16Resampler';

describe('TURN-02 streaming PCM converter', () => {
  it('converts 48 kHz mono into ~16 kHz with correct bounds', () => {
    const r = new StreamingPcm16Resampler(48000);
    const input = Float32Array.from({ length: 480 }, (_, i) => i % 2 ? 0.5 : -0.5);
    const out = r.push(input);
    expect(out.length).toBe(160);
    expect(Math.max(...out)).toBeLessThanOrEqual(32767);
    expect(Math.min(...out)).toBeGreaterThanOrEqual(-32768);
  });

  it('preserves timing across chunk boundaries', () => {
    const all = Float32Array.from({ length: 960 }, (_, i) => Math.sin(i / 17));
    const whole = new StreamingPcm16Resampler(48000).push(all);
    const splitR = new StreamingPcm16Resampler(48000);
    const a = splitR.push(all.slice(0, 333));
    const b = splitR.push(all.slice(333, 701));
    const c = splitR.push(all.slice(701));
    expect(Array.from(Int16Array.from([...a, ...b, ...c]))).toEqual(Array.from(whole));
  });

  it('supports 44.1 kHz sources without assuming an integer ratio', () => {
    const r = new StreamingPcm16Resampler(44100);
    const out = r.push(new Float32Array(441).fill(0.25));
    expect(out.length).toBeGreaterThanOrEqual(159);
    expect(out.length).toBeLessThanOrEqual(161);
  });

  it('reset starts a new source-time epoch', () => {
    const r = new StreamingPcm16Resampler(48000);
    const first = r.push(new Float32Array(480).fill(0.1));
    r.reset();
    const second = r.push(new Float32Array(480).fill(0.1));
    expect(Array.from(second)).toEqual(Array.from(first));
  });
});
