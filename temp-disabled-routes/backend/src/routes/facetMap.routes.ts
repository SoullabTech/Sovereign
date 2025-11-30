// oracle-backend/src/routes/facetMap.routes.ts

import express from "express";
import { supabase } from "../server";
import { asyncHandler, createError } from "../middleware/errorHandler";
import { logger } from "../utils/logger";

const router = express.Router();

// Get the full elemental facet map
router.get(
  "/",
  asyncHandler(async (_req, res) => {
    const { data, error } = await supabase
      .from("facet_map")
      .select("*")
      .order("element")
      .order("facet");

    if (error) {
      logger.error("Error fetching facet map:", error);
      throw createError("Unable to retrieve facet map", 500);
    }

    res.json({ facets: data });
  }),
);

// Get a specific facet by ID or name
router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const facetId = req.params.id;

    const { data, error } = await supabase
      .from("facet_map")
      .select("*")
      .or(`id.eq.${facetId},facet.eq.${facetId}`)
      .single();

    if (error) {
      logger.error("Error fetching specific facet:", error);
      throw createError("Facet not found", 404);
    }

    res.json({ facet: data });
  }),
);

export default router;
