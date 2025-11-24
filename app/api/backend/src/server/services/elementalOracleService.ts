// src/services/elementalOracleService.ts

export type ElementalTheme = "Fire" | "Water" | "Earth" | "Air" | "Aether";

export interface OracleRequest {
  theme: ElementalTheme;
  prompt: string;
}

export interface OracleResponse {
  message: string;
  symbols?: string[];
  insight?: string;
}

export const elementalOracleService = {
  generateStory: ({ theme, prompt }: OracleRequest): OracleResponse => {
    const intro = `Invoking the wisdom of the ${theme} element...`;
    const message = `${intro} You asked: "${prompt}". Here is a symbolic response.`;

    const symbols = {
      Fire: ["Phoenix", "Candle", "Volcano"],
      Water: ["Moon", "Cup", "Ocean"],
      Earth: ["Mountain", "Tree", "Stone"],
      Air: ["Feather", "Cloud", "Spiral"],
      Aether: ["Star", "Circle", "Portal"],
    }[theme];

    return {
      message,
      symbols,
      insight: `The ${theme} element invites reflection on your current journey. What is being revealed through this symbol?`,
    };
  },
};
