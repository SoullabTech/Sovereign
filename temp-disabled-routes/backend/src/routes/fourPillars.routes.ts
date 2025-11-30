import { Router, Request, Response } from "express";
import {
  generateFourPillars,
  calculateElementalBalance,
  getElementalPersonality,
} from "../../services/fourPillarsService";
import {
  suggestTaoistRituals,
  getDailyRitual,
  getSeasonalRitual,
  generateRitualSequence,
  getElementalAffirmations,
} from "../../services/taoistRitualEngine";
import { authenticateToken } from "../../middleware/authenticateToken";
import { logger } from "../../lib/logger";
import { z } from "zod";

const router = Router();

// Validation schema for Four Pillars request
const fourPillarsSchema = z.object({
  birth: z.string().datetime(),
  tzOffsetMinutes: z.number().optional().default(0),
});

/**
 * @route POST /api/astrology/four-pillars
 * @desc Generate Four Pillars (Ba Zi) profile and Taoist ritual suggestions
 * @access Public (for demo) - can be made private by adding authenticateToken
 */
router.post("/", async (req: Request, res: Response) => {
  try {
    // Validate request body
    const validation = fourPillarsSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: "Invalid request data",
        details: validation.error.errors,
      });
    }

    const { birth, tzOffsetMinutes } = validation.data;

    logger.info(`Generating Four Pillars for birth: ${birth}`);

    // Generate Four Pillars profile
    const profile = generateFourPillars(new Date(birth), tzOffsetMinutes);

    // Get ritual suggestions
    const rituals = suggestTaoistRituals(profile);
    const dailyRitual = getDailyRitual(profile);
    const seasonalRitual = getSeasonalRitual();

    // Additional insights
    const balanceScore = calculateElementalBalance(profile);
    const personality = getElementalPersonality(profile.dominant);
    const affirmations = profile.deficient.flatMap((element) =>
      getElementalAffirmations(element),
    );

    res.json({
      success: true,
      profile,
      rituals,
      insights: {
        balanceScore,
        personality,
        affirmations,
        dailyRitual,
        seasonalRitual,
      },
      message: "Four Pillars profile generated successfully",
    });
  } catch (error: any) {
    logger.error("Error generating Four Pillars:", error);
    res.status(500).json({
      success: false,
      error: "Failed to generate Four Pillars profile",
      message: error.message || "An unexpected error occurred",
    });
  }
});

/**
 * @route POST /api/astrology/four-pillars/ritual-sequence
 * @desc Generate personalized ritual sequence
 * @access Public
 */
router.post("/ritual-sequence", async (req: Request, res: Response) => {
  try {
    const { birth, tzOffsetMinutes = 0, duration = 30 } = req.body;

    if (!birth) {
      return res.status(400).json({
        success: false,
        error: "Birth date is required",
      });
    }

    const profile = generateFourPillars(new Date(birth), tzOffsetMinutes);
    const sequence = generateRitualSequence(profile, duration);

    res.json({
      success: true,
      sequence,
      totalDuration: sequence.reduce(
        (sum, ritual) => sum + ritual.durationMin,
        0,
      ),
      profile: {
        dominant: profile.dominant,
        deficient: profile.deficient,
        elementTally: profile.elementTally,
      },
    });
  } catch (error: any) {
    logger.error("Error generating ritual sequence:", error);
    res.status(500).json({
      success: false,
      error: "Failed to generate ritual sequence",
      message: error.message,
    });
  }
});

/**
 * @route GET /api/astrology/four-pillars/daily
 * @desc Get daily elemental guidance
 * @access Public
 */
router.get("/daily", async (req: Request, res: Response) => {
  try {
    const { birth, tzOffsetMinutes = 0 } = req.query;

    if (!birth || typeof birth !== "string") {
      return res.status(400).json({
        success: false,
        error: "Birth date is required as query parameter",
      });
    }

    const profile = generateFourPillars(
      new Date(birth),
      Number(tzOffsetMinutes),
    );
    const dailyRitual = getDailyRitual(profile);
    const seasonalRitual = getSeasonalRitual();

    const currentHour = new Date().getHours();
    let organClock = "";

    // Traditional Chinese Medicine organ clock
    if (currentHour >= 3 && currentHour < 5)
      organClock = "Lung time - Deep breathing and letting go";
    else if (currentHour >= 5 && currentHour < 7)
      organClock = "Large Intestine time - Release and cleansing";
    else if (currentHour >= 7 && currentHour < 9)
      organClock = "Stomach time - Nourishment and grounding";
    else if (currentHour >= 9 && currentHour < 11)
      organClock = "Spleen time - Stability and worry transformation";
    else if (currentHour >= 11 && currentHour < 13)
      organClock = "Heart time - Joy and circulation";
    else if (currentHour >= 13 && currentHour < 15)
      organClock = "Small Intestine time - Discernment and sorting";
    else if (currentHour >= 15 && currentHour < 17)
      organClock = "Bladder time - Emotional release";
    else if (currentHour >= 17 && currentHour < 19)
      organClock = "Kidney time - Vitality and wisdom";
    else if (currentHour >= 19 && currentHour < 21)
      organClock = "Pericardium time - Heart protection and intimacy";
    else if (currentHour >= 21 && currentHour < 23)
      organClock = "Triple Heater time - Temperature regulation";
    else if (currentHour >= 23 || currentHour < 1)
      organClock = "Gallbladder time - Decision making";
    else organClock = "Liver time - Vision and planning";

    res.json({
      success: true,
      dailyGuidance: {
        dailyRitual,
        seasonalRitual,
        organClock,
        elementFocus:
          profile.deficient.length > 0 ? profile.deficient[0] : "Balance",
        affirmation: getElementalAffirmations(
          profile.deficient[0] || "Water",
        )[0],
      },
      profile: {
        dominant: profile.dominant,
        deficient: profile.deficient,
      },
    });
  } catch (error: any) {
    logger.error("Error getting daily guidance:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get daily guidance",
      message: error.message,
    });
  }
});

/**
 * @route GET /api/astrology/four-pillars/elements
 * @desc Get information about all five elements
 * @access Public
 */
router.get("/elements", (req: Request, res: Response) => {
  const elementInfo = {
    Wood: {
      season: "Spring",
      direction: "East",
      emotion: "Anger/Kindness",
      organ: "Liver/Gallbladder",
      qualities: ["Growth", "Flexibility", "Vision", "Planning"],
      color: "Green",
      sound: "Shh",
      strengthenedBy: "Water",
      weakenedBy: "Metal",
    },
    Fire: {
      season: "Summer",
      direction: "South",
      emotion: "Joy/Overexcitement",
      organ: "Heart/Small Intestine",
      qualities: ["Warmth", "Communication", "Joy", "Circulation"],
      color: "Red",
      sound: "Ha",
      strengthenedBy: "Wood",
      weakenedBy: "Water",
    },
    Earth: {
      season: "Late Summer",
      direction: "Center",
      emotion: "Worry/Sympathy",
      organ: "Spleen/Stomach",
      qualities: ["Stability", "Nourishment", "Grounding", "Support"],
      color: "Yellow",
      sound: "Who",
      strengthenedBy: "Fire",
      weakenedBy: "Wood",
    },
    Metal: {
      season: "Autumn",
      direction: "West",
      emotion: "Grief/Letting Go",
      organ: "Lung/Large Intestine",
      qualities: ["Precision", "Clarity", "Structure", "Refinement"],
      color: "White",
      sound: "Tsu",
      strengthenedBy: "Earth",
      weakenedBy: "Fire",
    },
    Water: {
      season: "Winter",
      direction: "North",
      emotion: "Fear/Wisdom",
      organ: "Kidney/Bladder",
      qualities: ["Fluidity", "Wisdom", "Depth", "Adaptability"],
      color: "Blue/Black",
      sound: "Chui",
      strengthenedBy: "Metal",
      weakenedBy: "Earth",
    },
  };

  res.json({
    success: true,
    elements: elementInfo,
    cycles: {
      generation: "Wood → Fire → Earth → Metal → Water → Wood",
      destruction: "Wood → Earth → Water → Fire → Metal → Wood",
    },
  });
});

export default router;
