// src/utils/facetUtil.ts

import { elementalFacetMap } from "./elementalFacetMap";

export type ElementalFacet = {
  facet: string;
  element: "Fire" | "Water" | "Earth" | "Air";
  phase: number; // 1–3
};

const facetKeywords: Record<string, string[]> = {
  Experience: ["vision", "ignite", "drive", "initiate", "desire"],
  Expression: ["speak", "perform", "articulate", "display", "share"],
  Expansion: ["grow", "expand", "scale", "reach", "broadcast"],

  Heart: ["emotion", "love", "pain", "grief", "compassion"],
  Healing: ["recover", "trauma", "wound", "repair", "release"],
  Holiness: ["soul", "ritual", "mystic", "sacred", "devotion"],

  Mission: ["build", "create", "project", "structure", "task"],
  Means: ["tool", "method", "plan", "strategy", "resource"],
  Medicine: ["remedy", "balance", "nurture", "practice", "sustain"],

  Connection: ["relate", "talk", "bond", "connect", "listen"],
  Community: ["group", "team", "network", "collaborate", "tribe"],
  Consciousness: ["thought", "clarity", "perception", "awareness", "mind"],
};

export function detectFacetFromInput(
  input: string,
): ElementalFacet | undefined {
  const lowerInput = input.toLowerCase();

  for (const [facet, keywords] of Object.entries(facetKeywords)) {
    if (keywords.some((word) => lowerInput.includes(word))) {
      return elementalFacetMap[facet];
    }
  }

  return undefined;
}
