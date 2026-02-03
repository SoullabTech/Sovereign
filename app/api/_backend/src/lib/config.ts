// @ts-nocheck
// src/lib/config.ts
import { z } from "zod";

// Define all env vars you use anywhere in your stack
const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),

  // ChatGPT Oracle endpoints (only needed server-side)
  VITE_CHATGPT_ORACLE_URL: z.string().url().optional(),
  VITE_CHATGPT_ORACLE_API_KEY: z.string().optional(),
});

function validateEnv() {
  const raw = {
    NODE_ENV: process.env.NODE_ENV,
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
