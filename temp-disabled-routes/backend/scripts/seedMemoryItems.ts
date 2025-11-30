// scripts/seedMemoryItems.ts
import "dotenv/config";

import { createClient } from "@supabase/supabase-js";
import { v4 as uuidv4 } from "uuid";

console.log("Loaded SUPABASE_URL:", process.env.SUPABASE_URL);
console.log("Loaded SERVICE_ROLE_KEY:", process.env.SUPABASE_SERVICE_ROLE_KEY);

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

const seedData = [
  {
    userId: uuidv4(),
    sourceAgent: "FireOracle",
    isCollective: false,
    theme: "transformation",
    content:
      "The phoenix rose in my dream last night. I felt the ache of grief, but also the fire of something new.",
  },
  {
    userId: uuidv4(),
    sourceAgent: "WaterOracle",
    isCollective: false,
    theme: "grief",
    content:
      "My tears mirrored the ocean’s sadness. I placed a mirror on my altar. I saw my mother’s eyes in it.",
  },
  {
    userId: uuidv4(),
    sourceAgent: "ShadowAgent",
    isCollective: true,
    theme: "shadow",
    content:
      "I walked a labyrinth of doubt. Each step felt like a question: who am I beneath these masks?",
  },
  {
    userId: uuidv4(),
    sourceAgent: "AetherOracle",
    isCollective: false,
    theme: "integration",
    content:
      "There was a doorway of light. I crossed it and left behind a part of me I had clung to. The sky opened.",
  },
];

async function seed() {
  const entries = seedData.map((item) => ({
    user_id: item.userId,
    source_agent: item.sourceAgent,
    is_collective: item.isCollective,
    theme: item.theme,
    content: item.content,
    created_at: new Date().toISOString(),
  }));

  const result = await supabase.from("memory_items").insert(entries);

  console.log("Full Supabase response:", JSON.stringify(result, null, 2));
}

seed();
