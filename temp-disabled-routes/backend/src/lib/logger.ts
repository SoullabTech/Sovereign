import { createClient } from "@supabase/supabase-js";
import winston from "winston";
import path from "path";

// -- Supabase Client (Server Role) --
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

// -- Winston Logger Config --
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const colors = {
  error: "red",
  warn: "yellow",
  info: "green",
  http: "magenta",
  debug: "white",
};

winston.addColors(colors);

const format = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss:ms" }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`,
  ),
);

const transports = [
  new winston.transports.Console(),
  new winston.transports.File({
    filename: path.join(process.cwd(), "logs", "error.log"),
    level: "error",
  }),
  new winston.transports.File({
    filename: path.join(process.cwd(), "logs", "all.log"),
  }),
];

// -- Exported Logger --
const logger = winston.createLogger({
  level: process.env.NODE_ENV === "development" ? "debug" : "info",
  levels,
  format,
  transports,
});

export default logger;

//
// 🧠 SUPABASE LOGGING HELPERS
//

/**
 * Logs a message from any intelligent agent (e.g., GuideAgent, ShadowAgent).
 */
export async function logAgentInteraction({
  userId,
  agent,
  content,
  phase,
}: {
  userId: string;
  agent: string;
  content: string;
  phase?: string;
}) {
  const { error } = await supabase.from("adjuster_logs").insert({
    user_id: userId,
    agent,
    message: content,
    spiral_phase: phase || null,
  });

  if (error) logger.error(`Supabase Agent log failed: ${error.message}`);
}

/**
 * Logs a journal entry with optional emotion tagging and symbolic extraction.
 */
export async function logJournalEntry({
  userId,
  content,
  emotionTag,
  symbols,
}: {
  userId: string;
  content: string;
  emotionTag?: string;
  symbols?: string[];
}) {
  const { error } = await supabase.from("memory_items").insert({
    user_id: userId,
    content,
    emotion_tag: emotionTag || null,
    symbols: symbols || [],
  });

  if (error) logger.error(`Supabase Journal log failed: ${error.message}`);
}

/**
 * Logs a system-generated insight or reflection from the Adjuster Agent.
 */
export async function logAdjusterInsight({
  userId,
  content,
  phase,
}: {
  userId: string;
  content: string;
  phase?: string;
}) {
  const { error } = await supabase.from("adjuster_logs").insert({
    user_id: userId,
    agent: "AdjusterAgent",
    message: content,
    spiral_phase: phase || null,
  });

  if (error) logger.error(`Supabase Insight log failed: ${error.message}`);
}
