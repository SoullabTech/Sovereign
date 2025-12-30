// /api/oracle-agent/insight.ts
import { NextApiRequest, NextApiResponse } from "next";
import { generateOracleInsight } from "@/core/agents/oracleInsightComposer";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { phase, userSeed } = req.body;

  if (!phase) {
    return res.status(400).json({ error: "Missing required field: phase" });
  }

  try {
    const insight = generateOracleInsight({ phase, userSeed });
    return res.status(200).json({ insight });
  } catch (error) {
    console.error("Insight generation failed:", error);
    return res
      .status(500)
      .json({ error: "Oracle Insight failed to generate." });
  }
}
