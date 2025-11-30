// spiralLogic.ts
export type Element = "Fire" | "Water" | "Earth" | "Air" | "Aether";

export const getElementalPhase = (input: string): Element => {
  const lower = input.toLowerCase();
  if (lower.includes("vision") || lower.includes("ignite")) return "Fire";
  if (lower.includes("emotion") || lower.includes("dream")) return "Water";
  if (lower.includes("structure") || lower.includes("practice")) return "Earth";
  if (lower.includes("clarity") || lower.includes("signal")) return "Air";
  return "Aether"; // fallback
};

export const spiralPhaseDescription = {
  Fire: "Initiation & Purpose",
  Water: "Transformation & Emotion",
  Earth: "Stability & Practice",
  Air: "Communication & Strategy",
  Aether: "Integration & Coherence",
};
