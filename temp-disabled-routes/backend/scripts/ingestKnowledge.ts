// scripts/ingestKnowledge.ts
import "dotenv/config";
import logger from "../src/utils/logger";
import { ingestNotion, ingestLocalJson } from "../src/services/ingestService";

async function main() {
  try {
    const { pages, results: notionResults } = await ingestNotion();
    const { files, results: localResults } = await ingestLocalJson();

    const all = [
      ...notionResults.map((r) => ({ ...r, source: "notion" })),
      ...localResults.map((r) => ({ ...r, source: "local" })),
    ];

    const total = all.length;
    const succeeded = all.filter((r) => r.status === "fulfilled").length;
    const failed = all.filter((r) => r.status === "rejected");

    logger.info("✅ Ingestion complete", {
      total,
      succeeded,
      failed: failed.length,
    });
    failed.forEach((f) => logger.error("Ingestion failure:", f.reason || f));

    process.exit(failed.length > 0 ? 1 : 0);
  } catch (err) {
    logger.error("❌ Fatal error during ingestion:", err);
    process.exit(1);
  }
}

main();
