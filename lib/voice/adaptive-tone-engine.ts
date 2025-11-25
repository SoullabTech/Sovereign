import { SoulprintSnapshot } from '@/lib/memory/soulprint';

export type VoiceTone = {
  pitch: number;
  rate: number;
  style: string;
};

function applyPhaseModifiers(base: VoiceTone, phase: string): VoiceTone {
  let modPitch = base.pitch;
  let modRate = base.rate;
  let style = base.style;

  switch (phase) {
    case "emergence":
      modPitch *= 1.1;
      modRate *= 1.1;
      style = style + "-bright";
      break;
    case "integration":
      modPitch *= 0.95;
      modRate *= 0.95;
      style = style + "-steady";
      break;
    case "unity":
      modPitch *= 1.0;
      modRate *= 0.85;
      style = style + "-calm";
      break;
    default:
      break;
  }

  return { pitch: modPitch, rate: modRate, style };
}

export function getToneFromSoulprint(soulprint: SoulprintSnapshot | null): VoiceTone {
  if (!soulprint) {
    return { pitch: 1.0, rate: 1.0, style: "balanced" };
  }

  const dominant = soulprint.dominantElement ?? "air";
  const phase = soulprint.spiralHistory?.[soulprint.spiralHistory.length - 1] ?? "integration";

  let base: VoiceTone;

  switch (dominant) {
    case "fire":
      base = { pitch: 1.1, rate: 1.15, style: "fire-energetic" };
      break;
    case "water":
      base = { pitch: 0.95, rate: 0.9, style: "water-flowing" };
      break;
    case "earth":
      base = { pitch: 0.85, rate: 0.85, style: "earth-grounded" };
      break;
    case "air":
      base = { pitch: 1.05, rate: 1.05, style: "air-airy" };
      break;
    case "aether":
    default:
      base = { pitch: 1.0, rate: 1.0, style: "aether-balanced" };
      break;
  }

  const result = applyPhaseModifiers(base, phase);

  // Dev-only console trace
  if (process.env.NODE_ENV === "development") {
    console.debug(
      `[Tone] ${dominant.toUpperCase()} + ${phase} → pitch=${result.pitch.toFixed(
        2
      )}, rate=${result.rate.toFixed(2)}, style=${result.style}`
    );
  }

  return result;
}