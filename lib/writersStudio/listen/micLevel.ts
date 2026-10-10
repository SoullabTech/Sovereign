/**
 * Private, transient audio-level calculations for Writer's Studio Listen.
 * WebAudio samples are normalized to [-1, 1].
 * These are approximate digital peaks, not a calibrated SPL or LUFS meter.
 */
export type MicLevels = {
  rmsDbfs: number;
  peakDbfs: number;
  heldPeakDbfs: number;
  clipped: boolean;
};

const FLOOR_DBFS = -60;

export function amplitudeToDbfs(amplitude: number): number {
  if (!Number.isFinite(amplitude) || amplitude <= 0) return FLOOR_DBFS;
  return Math.min(0, Math.max(FLOOR_DBFS, 20 * Math.log10(amplitude)));
}

export function meterPercentage(dbfs: number): number {
  if (!Number.isFinite(dbfs)) return 0;
  return Math.max(0, Math.min(100, ((dbfs - FLOOR_DBFS) / -FLOOR_DBFS) * 100));
}

export function measureMicLevels(samples: Float32Array, heldPeakDbfs = FLOOR_DBFS): MicLevels {
  if (samples.length === 0) {
    return { rmsDbfs: FLOOR_DBFS, peakDbfs: FLOOR_DBFS, heldPeakDbfs, clipped: heldPeakDbfs >= -1 };
  }
  let squared = 0;
  let absolutePeak = 0;
  for (const sample of samples) {
    const abs = Math.abs(sample);
    if (abs > absolutePeak) absolutePeak = abs;
    squared += sample * sample;
  }
  const peakDbfs = amplitudeToDbfs(absolutePeak);
  const rmsDbfs = amplitudeToDbfs(Math.sqrt(squared / samples.length));
  const newHeld = Math.max(heldPeakDbfs, peakDbfs);
  return {
    rmsDbfs,
    peakDbfs,
    heldPeakDbfs: newHeld,
    clipped: newHeld >= -1,
  };
}

export const QUIET_MIC_LEVELS: MicLevels = {
  rmsDbfs: FLOOR_DBFS,
  peakDbfs: FLOOR_DBFS,
  heldPeakDbfs: FLOOR_DBFS,
  clipped: false,
};
