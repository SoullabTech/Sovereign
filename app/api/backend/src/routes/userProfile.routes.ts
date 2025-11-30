import { Router } from "express";
import { authenticate } from "../middleware/authenticate";
import {
  getUserProfile,
  updateUserProfile,
  getProfileStats,
} from "../services/profileService";

const router = Router();

// Public route for basic health check
router.get("/health", (_req, res) => {
  res.status(200).json({
    status: "OK",
    message: "Spiralogic Oracle backend is running",
    timestamp: new Date().toISOString(),
  });
});

// All routes below this require authentication
router.use(authenticate);

/**
 * POST /update-profile
 * Body: { fire, water, earth, air, aether, crystal_focus }
 */
router.post("/update-profile", async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "No user found in token" });
    }

    const { fire, water, earth, air, aether, crystal_focus } = req.body;

    if (
      [fire, water, earth, air, aether].some(
        (n) => typeof n !== "number" || n < 0 || n > 100,
      )
    ) {
      return res.status(400).json({ message: "Profile validation failed" });
    }

    const updatedProfile = await updateUserProfile(userId, {
      user_id: userId,
      fire,
      water,
      earth,
      air,
      aether,
      crystal_focus,
      updated_at: new Date().toISOString(),
    });

    res.status(200).json(updatedProfile);
  } catch (err: any) {
    console.error("❌ Error in /update-profile:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * GET /profile → Get current user profile
 */
router.get("/profile", async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthenticated" });
    }

    const profile = await getUserProfile(userId);
    res.status(200).json(profile);
  } catch (err) {
    console.error("❌ Error fetching profile:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * GET /profile/stats → Get elemental stats for visualization
 */
router.get("/profile/stats", async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthenticated" });
    }

    const stats = await getProfileStats(userId);
    res.status(200).json(stats);
  } catch (err) {
    console.error("❌ Error fetching profile stats:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
