import { Request, Response } from "express";
import { personalOracle } from "../core/agents/adjusterAgent";
import { getUserProfile } from "../services/profileService";

export async function getGuideInfo(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const profile = await getUserProfile(userId);

    return res.status(200).json({
      personal_guide_name: profile.personal_guide_name,
      guide_gender: profile.guide_gender,
      voice_id: profile.voice_id,
      guide_language: profile.guide_language,
    });
  } catch (err) {
    console.error("[getGuideInfo] Error:", err);
    return res.status(500).json({ error: "Failed to retrieve guide info." });
  }
}

export async function askPersonalOracle(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    const { input } = req.body;

    if (!input || !userId) {
      return res.status(400).json({ error: "Missing input or userId" });
    }

    const response = await personalOracle.process({ userId, input });

    return res.status(200).json({ success: true, response });
  } catch (err) {
    console.error("[askPersonalOracle] Error:", err);
    return res
      .status(500)
      .json({ error: "Failed to process personal guide query." });
  }
}
