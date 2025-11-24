// src/routes/notionIngest.routes.ts

import { Router } from "express";
import logger from "../utils/logger";
import { notionIngestService } from "../services/notionIngestService";

const router = Router();

/**
 * POST /api/notion/ingest/notion
 * Trigger an ingestion process from Notion pages.
 */
router.post("/notion", async (_req, res) => {
  try {
    const { pages, results } = await notionIngestService.ingestFromNotion();

    res.status(200).json({
      importedPages: pages.length,
      successes: results.filter((r) => r.status === "fulfilled").length,
      failures: results.filter((r) => r.status === "rejected").length,
      details: results,
    });
  } catch (err: any) {
    logger.error("❌ Notion ingestion failed", err);
    res.status(500).json({
      error: err.message || "Unknown error during Notion ingestion.",
    });
  }
});

/**
 * POST /api/notion/ingest/local
 * Trigger ingestion of local knowledge base JSON files.
 */
router.post("/local", async (_req, res) => {
  try {
    const { files, results } = await notionIngestService.ingestFromLocalJson();

    res.status(200).json({
      loadedFiles: files.length,
      successes: results.filter((r) => r.status === "fulfilled").length,
      failures: results.filter((r) => r.status === "rejected").length,
      details: results,
    });
  } catch (err: any) {
    logger.error("❌ Local JSON ingestion failed", err);
    res.status(500).json({
      error: err.message || "Unknown error during local ingestion.",
    });
  }
});

export default router;
