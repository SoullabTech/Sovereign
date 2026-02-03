// Location: /oracle-backend/api/oracle/personal/insight.ts

import { PersonalOracleAgent } from "@/core/agents/PersonalOracleAgent";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { phase, reflection } = req.body;
    const userId = (req.headers["x-user-id"] as string) || "demo-user";

    const agent = new PersonalOracleAgent({
      userId,
      oracleName: "The Oracle Within",
      tone: "poetic",
    });

    const insight = await agent.getArchetypalInsight(phase, reflection);
    return res.status(200).json(insight);
  } catch (error) {
    console.error("Oracle insight error:", error);
    return res.status(500).json({ error: "Oracle reflection failed." });
  }
}
