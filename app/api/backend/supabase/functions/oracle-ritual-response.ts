// 📁 BACKEND: /supabase/functions/oracle-ritual-response.ts
import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!,
);
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export const handler = async (req: Request): Promise<Response> => {
  const { ritualNotes, element, archetype, phase } = await req.json();

  const prompt = `You are an elemental oracle. Based on the following notes from a ritual experience, offer insight, encouragement, and a symbolic action or follow-up ritual.

Context:
Element: ${element}
Archetype: ${archetype}
Phase: ${phase}

User Notes:
"""
${ritualNotes}
"""

Reply with:
1. Insight (1–2 sentences)
2. Encouragement (1 sentence)
3. Suggested follow-up ritual (1 sentence)`;

  const completion = await openai.chat.completions.create({
    messages: [
      { role: "system", content: "You are a compassionate elemental oracle." },
      { role: "user", content: prompt },
    ],
    model: "gpt-4",
  });

  const reply = completion.choices[0]?.message.content ?? "";

  return new Response(JSON.stringify({ reply }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
