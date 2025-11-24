// STUB: Complete spiralogic facets data module
// This is a placeholder to prevent import errors

import { SpiralFacet } from './spiralogic-facets';

export interface CompleteSpiralFacet extends SpiralFacet {
  subLevels: string[];
  integrationPoints: string[];
  shadowAspects: string[];
  practices: string[];
}

export const completeSpiralFacets: CompleteSpiralFacet[] = [
  {
    name: "Survival",
    level: 1,
    color: "#FF0000",
    description: "Basic survival needs and security",
    themes: ["safety", "security", "survival"],
    subLevels: ["Basic needs", "Safety", "Stability"],
    integrationPoints: ["Grounding", "Security", "Foundation"],
    shadowAspects: ["Fear", "Scarcity", "Rigidity"],
    practices: ["Grounding exercises", "Security practices", "Safety protocols"]
  },
  {
    name: "Tribal",
    level: 2,
    color: "#FF6600",
    description: "Belonging and tribal identity",
    themes: ["belonging", "community", "tradition"],
    subLevels: ["Family bonds", "Cultural identity", "Group belonging"],
    integrationPoints: ["Community", "Tradition", "Support"],
    shadowAspects: ["Conformity", "Exclusion", "Dependency"],
    practices: ["Community rituals", "Cultural practices", "Group activities"]
  },
  {
    name: "Power",
    level: 3,
    color: "#FFCC00",
    description: "Personal power and achievement",
    themes: ["power", "achievement", "success"],
    subLevels: ["Personal agency", "Goal achievement", "Leadership"],
    integrationPoints: ["Confidence", "Achievement", "Leadership"],
    shadowAspects: ["Dominance", "Exploitation", "Ego"],
    practices: ["Goal setting", "Leadership development", "Personal empowerment"]
  },
  {
    name: "Heart",
    level: 4,
    color: "#00FF00",
    description: "Love and emotional connection",
    themes: ["love", "empathy", "compassion"],
    subLevels: ["Self-love", "Romantic love", "Universal love"],
    integrationPoints: ["Compassion", "Empathy", "Connection"],
    shadowAspects: ["Codependency", "Possessiveness", "Emotional manipulation"],
    practices: ["Heart meditation", "Compassion practice", "Emotional healing"]
  },
  {
    name: "Expression",
    level: 5,
    color: "#0066FF",
    description: "Creative expression and truth",
    themes: ["creativity", "truth", "expression"],
    subLevels: ["Creative expression", "Truth telling", "Authentic communication"],
    integrationPoints: ["Creativity", "Authenticity", "Communication"],
    shadowAspects: ["Deception", "Suppression", "Manipulation"],
    practices: ["Creative arts", "Truth practices", "Authentic communication"]
  },
  {
    name: "Vision",
    level: 6,
    color: "#6600FF",
    description: "Intuitive vision and insight",
    themes: ["intuition", "wisdom", "vision"],
    subLevels: ["Intuitive insight", "Spiritual vision", "Transcendent wisdom"],
    integrationPoints: ["Intuition", "Vision", "Wisdom"],
    shadowAspects: ["Illusion", "Spiritual bypassing", "Detachment"],
    practices: ["Meditation", "Visionary practices", "Wisdom cultivation"]
  },
  {
    name: "Unity",
    level: 7,
    color: "#FFFFFF",
    description: "Spiritual connection and unity",
    themes: ["spirituality", "unity", "transcendence"],
    subLevels: ["Spiritual awareness", "Cosmic consciousness", "Unity consciousness"],
    integrationPoints: ["Unity", "Transcendence", "Consciousness"],
    shadowAspects: ["Spiritual ego", "Disconnection", "Nihilism"],
    practices: ["Unity practices", "Consciousness expansion", "Service to all"]
  }
];

export default completeSpiralFacets;