/**
 * Stateful mono Float32 -> predictor-rate PCM16 converter for TURN-02.
 *
 * Keeps source-time continuity across arbitrary WebAudio chunks. This is a
 * transport utility, not voice activity or turn intelligence.
 */
export class StreamingPcm16Resampler {
  private readonly step: number;
  private totalInput = 0;
  private nextSourcePosition = 0;
  private previousSample: number | null = null;

  constructor(
    readonly inputRateHz: number,
    readonly outputRateHz = 16000,
  ) {
    if (!Number.isFinite(inputRateHz) || inputRateHz <= 0) throw new Error('inputRateHz must be positive');
    if (!Number.isFinite(outputRateHz) || outputRateHz <= 0) throw new Error('outputRateHz must be positive');
    this.step = inputRateHz / outputRateHz;
  }

  reset(): void {
    this.totalInput = 0;
    this.nextSourcePosition = 0;
    this.previousSample = null;
  }

  push(input: Float32Array): Int16Array {
    if (input.length === 0) return new Int16Array(0);

    const hasPrevious = this.previousSample !== null;
    const bufferStart = hasPrevious ? this.totalInput - 1 : this.totalInput;
    const buffer = new Float32Array(input.length + (hasPrevious ? 1 : 0));
    if (hasPrevious) buffer[0] = this.previousSample as number;
    buffer.set(input, hasPrevious ? 1 : 0);
    const lastAbsoluteIndex = this.totalInput + input.length - 1;
    const output: number[] = [];

    while (Math.ceil(this.nextSourcePosition) <= lastAbsoluteIndex) {
      const floor = Math.floor(this.nextSourcePosition);
      const ceil = Math.ceil(this.nextSourcePosition);
      const i0 = floor - bufferStart;
      const i1 = ceil - bufferStart;
      if (i0 < 0 || i1 < 0 || i0 >= buffer.length || i1 >= buffer.length) break;
      const fraction = this.nextSourcePosition - floor;
      const sample = buffer[i0] + (buffer[i1] - buffer[i0]) * fraction;
      const clamped = Math.max(-1, Math.min(1, sample));
      output.push(clamped < 0 ? Math.round(clamped * 32768) : Math.round(clamped * 32767));
      this.nextSourcePosition += this.step;
    }

    this.totalInput += input.length;
    this.previousSample = input[input.length - 1];
    return Int16Array.from(output);
  }
}
