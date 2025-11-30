import type { ElementalProfile } from "../types/survey";

interface PersonalityAdjustment {
  tone: string;
  style: string;
  emphasis: string[];
}

export function computePersonalityAdjustment(
  profile: ElementalProfile,
): PersonalityAdjustment {
  // Find dominant element
  const elements = ["fire", "water", "earth", "air", "aether"] as const;
  const dominantElement = elements.reduce((prev, curr) =>
    profile[curr] > profile[prev] ? curr : prev,
  );

  // Base adjustments for each element
  const adjustments: Record<(typeof elements)[number], PersonalityAdjustment> =
    {
      fire: {
        tone: "passionate",
        style: "energetic",
        emphasis: ["creativity", "inspiration", "action"],
      },
      water: {
        tone: "flowing",
        style: "empathetic",
        emphasis: ["emotion", "intuition", "connection"],
      },
      earth: {
        tone: "grounded",
        style: "practical",
        emphasis: ["stability", "manifestation", "structure"],
      },
      air: {
        tone: "intellectual",
        style: "analytical",
        emphasis: ["thought", "communication", "clarity"],
      },
      aether: {
        tone: "mystical",
        style: "intuitive",
        emphasis: ["spirituality", "transcendence", "unity"],
      },
    };

  // Get base adjustment for dominant element
  const baseAdjustment = adjustments[dominantElement];

  // Add crystal focus emphasis if available
  if (profile.crystal_focus) {
    switch (profile.crystal_focus.type) {
      case "career":
        baseAdjustment.emphasis.push("professional growth", "leadership");
        break;
      case "spiritual":
        baseAdjustment.emphasis.push("consciousness", "meaning");
        break;
      case "relational":
        baseAdjustment.emphasis.push("connection", "emotional intelligence");
        break;
      case "health":
        baseAdjustment.emphasis.push("wellbeing", "vitality");
        break;
      case "creative":
        baseAdjustment.emphasis.push("expression", "innovation");
        break;
    }
  }

  return baseAdjustment;
}

export function getElementalGuidance(profile: ElementalProfile): string {
  // Find weakest element
  const elements = ["fire", "water", "earth", "air", "aether"] as const;
  const weakestElement = elements.reduce((prev, curr) =>
    profile[curr] < profile[prev] ? curr : prev,
  );

  const baseGuidance = {
    fire: "Consider exploring creative activities to ignite your inner flame.",
    water: "Take time to connect with your emotions and intuitive wisdom.",
    earth: "Focus on grounding practices and practical steps forward.",
    air: "Engage in intellectual pursuits and clear communication.",
    aether: "Explore spiritual practices and higher consciousness.",
  }[weakestElement];

  // Add crystal focus context if available
  if (profile.crystal_focus) {
    return `${baseGuidance} This will particularly support your journey in ${
      profile.crystal_focus.type === "other"
        ? profile.crystal_focus.customDescription
        : profile.crystal_focus.type
    }.`;
  }

  return baseGuidance;
}
