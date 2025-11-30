import { Router } from "express";
import {
  getIChingAstroProfile,
  postIChingAstroProfile,
  calculateIChingCompatibility,
  getAllTrigrams,
  getYearlyGuidance,
} from "../api/iching/astro";

const router = Router();

/**
 * I Ching Astrology Routes
 *
 * Provides complete I Ching astrology calculations based on:
 * - Joel Seigneur's I Ching Astrology system
 * - Katya Walter's Tao of Chaos fractal patterns
 * - Traditional trigram/hexagram correspondences
 */

// Main astrology profile endpoints
router.get("/astro", getIChingAstroProfile);
router.post("/astro", postIChingAstroProfile);

// Compatibility analysis
router.post("/compatibility", calculateIChingCompatibility);

// Reference data
router.get("/trigrams", getAllTrigrams);

// Yearly guidance
router.get("/yearly-guidance", getYearlyGuidance);

export default router;
