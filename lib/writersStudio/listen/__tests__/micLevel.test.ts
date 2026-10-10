import { describe, expect, it } from 'vitest';
import { amplitudeToDbfs, measureMicLevels, meterPercentage, QUIET_MIC_LEVELS, voiceLevelGuidance } from '../micLevel';

describe('Listen · live microphone indicators', () => {
  it('maps silence to the visible quiet floor without inventing audio', () => {
    expect(amplitudeToDbfs(0)).toBe(-60);
    expect(measureMicLevels(new Float32Array(32))).toEqual(QUIET_MIC_LEVELS);
    expect(meterPercentage(-60)).toBe(0);
    expect(meterPercentage(0)).toBe(100);
  });

  it('tracks RMS and instant peak of a normal microphone sample', () => {
    const values = new Float32Array([0, 0.25, -0.25, 0]);
    const sample = measureMicLevels(values);
    expect(sample.peakDbfs).toBeCloseTo(-12.04, 1);
    expect(sample.rmsDbfs).toBeCloseTo(-15.05, 1);
    expect(sample.clipped).toBe(false);
  });

  it('holds a prior peak while the level falls', () => {
    const first = measureMicLevels(new Float32Array([0.4, -0.4]));
    const later = measureMicLevels(new Float32Array([0.02, -0.02]), first.heldPeakDbfs);
    expect(later.peakDbfs).toBeLessThan(first.peakDbfs);
    expect(later.heldPeakDbfs).toBe(first.heldPeakDbfs);
  });

  it('warns of near-digital clipping without normalizing or altering samples', () => {
    const values = new Float32Array([0.99, -1, 0.5]);
    const before = [...values];
    const sample = measureMicLevels(values);
    expect(sample.clipped).toBe(true);
    expect(sample.heldPeakDbfs).toBe(0);
    expect([...values]).toEqual(before);
  });

  it('clamps the meter display at 0 to 100 percent', () => {
    expect(meterPercentage(-100)).toBe(0);
    expect(meterPercentage(10)).toBe(100);
  });

  it('teaches the spoken-word peak zones without moving the thresholds', () => {
    expect(voiceLevelGuidance(-20).state).toBe('quiet');
    expect(voiceLevelGuidance(-15).state).toBe('good');
    expect(voiceLevelGuidance(-12).state).toBe('ideal');
    expect(voiceLevelGuidance(-7.7).state).toBe('ideal');
    expect(voiceLevelGuidance(-6).state).toBe('ideal');
    expect(voiceLevelGuidance(-5).state).toBe('hot');
    expect(voiceLevelGuidance(-2).state).toBe('risk');
    expect(voiceLevelGuidance(-0.5).state).toBe('clip');
  });
});
