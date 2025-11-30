// 📁 BACKEND/src/lib/breathCurve.ts
export function voiceToBreathCurve(voiceSample: number[]): string {
  return voiceSample.map((v, i) => `${i * 10},${v * 100}`).join(" ");
}
