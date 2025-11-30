// 📁 BACKEND/src/services/restorationPathfinder.ts
export function getRestorationPath(phase: string): string[] {
  switch (phase) {
    case "Water 2":
      return ["Dream journaling", "Ritual bath", "Shadow invocation"];
    case "Fire 3":
      return ["Creative expression", "Fire breathwork", "Sacred rage ritual"];
    default:
      return ["Grounding walk", "Nature time", "Breath coherence"];
  }
}
