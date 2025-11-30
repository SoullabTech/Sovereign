// src/utils/prefectClient.ts

import axios from "axios";

const API_URL = process.env.PREFECT_API_URL;
const API_KEY = process.env.PREFECT_API_KEY;

if (!API_URL || !API_KEY) {
  throw new Error("Prefect API credentials are missing from environment");
}

/**
 * Triggers a Prefect flow with parameters.
 * @param flowSlug Deployment slug or ID from Prefect
 * @param parameters Key-value payload
 */
export async function triggerPrefectFlow(
  flowSlug: string,
  parameters: Record<string, any>,
) {
  try {
    const response = await axios.post(
      `${API_URL}/deployments/${flowSlug}/create_flow_run`,
      { parameters },
      {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
        },
      },
    );

    return response.data;
  } catch (err) {
    console.error("[Prefect] Flow trigger failed:", err);
    throw err;
  }
}
