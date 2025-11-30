// 📁 BACKEND/src/lib/harmonicPetalMap.ts
export const HarmonicConstants = {
  SQRT_10: 3.1623,
  PHI: 1.618,
  PI: 3.1416,
  E: 2.7182,
};

export const PetalTransitions = [
  { from: "Aether", to: "Fire", multiplier: HarmonicConstants.SQRT_10 },
  { from: "Fire", to: "Earth", multiplier: HarmonicConstants.PHI },
  { from: "Earth", to: "Water", multiplier: HarmonicConstants.PHI },
  { from: "Water", to: "Air", multiplier: HarmonicConstants.PI },
  { from: "Air", to: "Aether", multiplier: HarmonicConstants.E },
];
