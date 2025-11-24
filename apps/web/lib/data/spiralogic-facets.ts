// STUB: Spiralogic facets data module
// This is a placeholder to prevent import errors

export interface SpiralFacet {
  name: string;
  level: number;
  color: string;
  description: string;
  themes: string[];
}

export const spiralFacets: SpiralFacet[] = [
  {
    name: "Survival",
    level: 1,
    color: "#FF0000",
    description: "Basic survival needs and security",
    themes: ["safety", "security", "survival"]
  },
  {
    name: "Tribal",
    level: 2,
    color: "#FF6600",
    description: "Belonging and tribal identity",
    themes: ["belonging", "community", "tradition"]
  },
  {
    name: "Power",
    level: 3,
    color: "#FFCC00",
    description: "Personal power and achievement",
    themes: ["power", "achievement", "success"]
  },
  {
    name: "Heart",
    level: 4,
    color: "#00FF00",
    description: "Love and emotional connection",
    themes: ["love", "empathy", "compassion"]
  },
  {
    name: "Expression",
    level: 5,
    color: "#0066FF",
    description: "Creative expression and truth",
    themes: ["creativity", "truth", "expression"]
  },
  {
    name: "Vision",
    level: 6,
    color: "#6600FF",
    description: "Intuitive vision and insight",
    themes: ["intuition", "wisdom", "vision"]
  },
  {
    name: "Unity",
    level: 7,
    color: "#FFFFFF",
    description: "Spiritual connection and unity",
    themes: ["spirituality", "unity", "transcendence"]
  }
];

export default spiralFacets;