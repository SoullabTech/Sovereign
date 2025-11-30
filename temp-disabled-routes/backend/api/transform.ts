// oracle-backend/api/transform.ts

import { supabase } from "../src/lib/supabaseClient";
import type { NextApiRequest, NextApiResponse } from "next";
import { OpenAI } from "openai";

export const config = { api: { bodyParser: true } };

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

// mode → prompt templates
const PROMPTS: Record<string, (text: string) => string> = {
  poetic: (text) =>
    `Turn this journal entry into a poetic elemental reflection:\n\n${text}\n\n“””`,
  tarot: (text) =>
    `Interpret this journal entry as a Tarot-style insight, using archetypal imagery:\n\n${text}\n\n“””`,
  bullets: (text) =>
    `Summarize this journal entry into concise bullet points for action steps:\n\n${text}\n\n“””`,
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end();
  }

  const { memoryId, mode } = req.body as { memoryId: string; mode: string };
  if (!memoryId || !PROMPTS[mode]) {
    return res.status(400).json({ error: "Missing or invalid memoryId/mode" });
  }

  // 1. fetch the original transcript
  const { data: mem, error: memErr } = await supabase
    .from("memory")
    .select("transcript")
    .eq("id", memoryId)
    .single();
  if (memErr || !mem) {
    return res
      .status(500)
      .json({ error: memErr?.message || "Memory not found" });
  }

  // 2. call OpenAI
  try {
    const prompt = PROMPTS[mode](mem.transcript || "");
    const chat = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
    });
    const output = chat.choices[0].message?.content?.trim();
    if (!output) throw new Error("Empty response");

    // 3. return the transformed text
    return res.status(200).json({ transformed: output });
  } catch (err: any) {
    console.error("Transform error", err);
    return res.status(500).json({ error: err.message });
  }
}
