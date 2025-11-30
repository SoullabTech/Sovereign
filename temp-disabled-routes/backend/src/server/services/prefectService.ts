// src/services/prefectService.ts
import axios from "axios";
import { logger } from "../../utils/logger";

const PREFECT_API_URL = process.env.PREFECT_API_URL || "https://api.prefect.io"; // Prefect Cloud API
const PREFECT_API_KEY = process.env.PREFECT_API_KEY; // Your Prefect API key

export async function triggerDailyJournalFlow(
  userId: string,
  journalEntry: string,
) {
  try {
    const response = await axios.post(
      `${PREFECT_API_URL}/flows/daily_journal_processing`,
      {
        headers: {
          Authorization: `Bearer ${PREFECT_API_KEY}`,
        },
        data: {
          userId,
          journalEntry,
        },
      },
    );

    logger.info("Triggered Prefect Flow: daily_journal_processing", { userId });
    return response.data;
  } catch (error) {
    logger.error("Error triggering Prefect flow", { error });
    throw new Error("Failed to trigger Prefect flow");
  }
}
