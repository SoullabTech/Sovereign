// 📁 File: src/lib/emotionParser.ts

const emotionKeywords: Record<string, string[]> = {
  grief: ["loss", "mourning", "absence", "longing", "tears"],
  inspiration: ["vision", "light", "awakening", "breakthrough", "spark"],
  shadow: ["fear", "conflict", "doubt", "dark", "mirror"],
  awe: ["mystery", "cosmos", "vast", "grand", "beauty"],
  clarity: ["focus", "insight", "resolve", "truth", "understanding"],
};

export function parseEmotions(text: string): Record<string, number> {
  const scores: Record<string, number> = {};

  for (const [emotion, keywords] of Object.entries(emotionKeywords)) {
    scores[emotion] = keywords.reduce((acc, word) => {
      const regex = new RegExp(`\\b${word}\\b`, "gi");
      const matches = text.match(regex);
      return acc + (matches ? matches.length : 0);
    }, 0);
  }

  const max = Math.max(...Object.values(scores));
  if (max > 0) {
    for (const key in scores) {
      scores[key] = parseFloat((scores[key] / max).toFixed(2));
    }
  }

  return scores;
}
