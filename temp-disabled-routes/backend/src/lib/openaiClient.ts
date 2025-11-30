// src/lib/openaiClient.ts
import OpenAI from "openai";

// Lazy-load OpenAI client to prevent build failures
let openaiInstance: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!openaiInstance) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY environment variable is not set");
    }
    openaiInstance = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openaiInstance;
}

// Export a getter for backward compatibility
export const openai = new Proxy({} as OpenAI, {
  get(target, prop) {
    const client = getOpenAIClient();
    return client[prop as keyof OpenAI];
  }
});

export const openaiClient = {
  async generateResponse(prompt: string) {
    try {
      // Only instantiate when actually needed
      if (!process.env.OPENAI_API_KEY) {
        console.warn("OpenAI API key not set, returning fallback response");
        return { content: `[Limited mode] Response for: ${prompt}` };
      }
      
      const client = getOpenAIClient();
      const response = await client.chat.completions.create({
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
      });
      return { content: response.choices[0]?.message?.content || "" };
    } catch (error) {
      console.error("OpenAI API error:", error);
      return { content: `Generated response for prompt: ${prompt}` };
    }
  },
};
