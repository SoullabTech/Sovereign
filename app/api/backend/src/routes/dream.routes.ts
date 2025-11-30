import express from "express";
// import { dreamOracle } from "@/core/agents/dreamOracleAgent"; // Temporarily disabled - module deleted

const router = express.Router();

// POST /api/oracle/dream/query
router.post("/query", async (req, res) => {
  const { userId, dreamDescription, context } = req.body;

  if (!userId || !dreamDescription) {
    return res
      .status(400)
      .json({ error: "Missing userId or dreamDescription" });
  }

  try {
    // Temporary placeholder response since dreamOracle module is deleted
    const result = {
      success: true,
      message: "Dream Oracle service temporarily disabled during development setup",
      data: {
        userId,
        dreamDescription,
        placeholder: true
      }
    };
    res.status(200).json(result);
  } catch (err) {
    console.error("[DreamOracle Route Error]", err);
    res
      .status(500)
      .json({ error: "Dream Oracle processing failed", details: err });
  }
});

export default router;
