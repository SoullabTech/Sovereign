// src/lib/config.ts
import { z } from "zod";

// 🧠 Define all env vars you use anywhere in your stack
const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),

  // backend Supabase (no VITE_ prefix)
  SUPABASE_URL: z.string().url(),
  SUPABASE_ANON_KEY: z.string(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),

  // frontend‐only (Vite will expose these to client code)
  VITE_SUPABASE_URL: z.string().url(),
  VITE_SUPABASE_ANON_KEY: z.string(),

  // your ChatGPT Oracle endpoints (only needed server-side)
  VITE_CHATGPT_ORACLE_URL: z.string().url().optional(),
  VITE_CHATGPT_ORACLE_API_KEY: z.string().optional(),
});

function validateEnv() {
  const raw = {
    NODE_ENV: process.env.NODE_ENV,
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL,
    VITE_SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY,
    VITE_CHATGPT_ORACLE_URL: process.env.VITE_CHATGPT_ORACLE_URL,
    VITE_CHATGPT_ORACLE_API_KEY: process.env.VITE_CHATGPT_ORACLE_API_KEY,
  };

  const parsed = envSchema.safeParse(raw);
  if (!parsed.success) {
    console.error(
      "❌ Invalid environment variables:",
      parsed.error.flatten().fieldErrors,
    );
    throw new Error("Invalid environment variables");
  }
  return parsed.data;
}

export const env = validateEnv();
