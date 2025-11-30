// src/services/notionLogger.ts

type LogLevel = "info" | "warn" | "error";

function formatMessage(level: LogLevel, message: string) {
  const timestamp = new Date().toISOString();
  return `[${level.toUpperCase()}] [${timestamp}] ${message}`;
}

export const notionLogger = {
  info: (message: string) => {
    console.log(formatMessage("info", message));
  },

  warn: (message: string) => {
    console.warn(formatMessage("warn", message));
  },

  error: (message: string) => {
    console.error(formatMessage("error", message));
  },
};
