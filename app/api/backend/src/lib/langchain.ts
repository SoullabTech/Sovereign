// 📁 src/lib/langchain.ts

export function promptTemplate(
  templateId: string,
  context: Record<string, any>,
): string {
  if (templateId === "personal_oracle_reflection") {
    return `
🌌 Oracle Name: ${context.oracleName}
🎭 Tone: ${context.tone}
🪞 Symbols: ${context.symbols?.join(", ") || "None"}
💓 Emotions: ${JSON.stringify(context.emotions)}

✨ Reflection:
"From the threads of experience, something sacred is weaving. Listen..."
    `.trim();
  }

  return `Unknown template: ${templateId}`;
}
