import { Router } from "express";
import {
  performDivinationReading,
  getDailyDivination,
  getQuickDivination,
  getDivinationMethods,
  validateDivinationQuery,
} from "../api/oracle/divination";

const router = Router();

/**
 * Sacred Divination Routes
 *
 * Provides access to multiple divination methods:
 * - Tarot: Card wisdom and archetypal guidance
 * - I Ching: Traditional Chinese oracle of change
 * - Yi Jing: Spiritual I Ching for soul journey
 * - Astrology: Cosmic timing and archetypal energy
 * - Unified: Multi-method synthesis
 */

// Main divination endpoint
router.post("/", performDivinationReading);

// Daily guidance
router.get("/daily", getDailyDivination);

// Quick readings
router.post("/quick", getQuickDivination);

// Method information
router.get("/methods", getDivinationMethods);

// Query validation
router.post("/validate", validateDivinationQuery);

export default router;
