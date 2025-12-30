#!/usr/bin/env node
// 🌀 SCRIPT: Ingest Spiralogic Process Manifesto into Founder Agent

import { founderKnowledgeService } from "../src/services/founderKnowledgeService";
import { logger } from "../src/utils/logger";
import path from "path";

async function ingestSpiralogicManifesto() {
  try {
    console.log("🌀 Starting Spiralogic Process Manifesto ingestion...\n");

    // Path to the manifesto
    const manifestoPath =
      "/Volumes/T7 Shield/Obsidian- Elemental Alchemy /Manifestos and Whitepapers/Manifesto- Spiralogic Process.md";

    console.log(`📄 Reading manifesto from: ${manifestoPath}\n`);

    // Ingest the manifesto
    const result =
      await founderKnowledgeService.ingestSpiralogicManifesto(manifestoPath);

    console.log("✅ Manifesto successfully ingested!\n");
    console.log("📊 Summary:");
    console.log(`- Title: ${result.title}`);
    console.log(`- Version: ${result.version}`);
    console.log(`- Sections: ${result.sections.length}`);
    console.log(`- Core Principles: ${result.corePrinciples.length}`);
    console.log(`- Keywords: ${result.keywords.join(", ")}\n`);

    console.log("🔑 Core Principles Extracted:");
    result.corePrinciples.forEach((principle, index) => {
      console.log(`${index + 1}. ${principle}`);
    });

    console.log("\n📑 Sections Processed:");
    result.sections.forEach((section) => {
      console.log(
        `- ${section.heading} (${section.keyInsights.length} insights)`,
      );
    });

    console.log("\n🎯 Key Insights per Section:");
    result.sections.forEach((section) => {
      if (section.keyInsights.length > 0) {
        console.log(`\n${section.heading}:`);
        section.keyInsights.slice(0, 3).forEach((insight) => {
          console.log(`  • ${insight.substring(0, 80)}...`);
        });
      }
    });

    console.log("\n✨ The Founder Agent now has deep knowledge of:");
    console.log("- The four elemental quadrants (Fire, Water, Earth, Air)");
    console.log("- The spiral movement and alchemical refinement process");
    console.log("- Core integration principles");
    console.log("- The unifying Aether/Crystal Focus");
    console.log("- Brain function mappings to elements");

    console.log("\n🌀 Spiralogic wisdom integration complete!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error ingesting manifesto:", error);
    logger.error("Manifesto ingestion failed", error);
    process.exit(1);
  }
}

// Run the ingestion
ingestSpiralogicManifesto();

/**
 * 🌀 SPIRALOGIC MANIFESTO INGESTION
 *
 * This script processes the Spiralogic Process Manifesto and integrates it
 * into the Soullab Founder Agent's knowledge base.
 *
 * Usage:
 * npm run scripts:ingest-manifesto
 *
 * Or directly:
 * ts-node scripts/ingestSpiralogicManifesto.ts
 *
 * The script will:
 * 1. Read the manifesto markdown file
 * 2. Parse its structure and extract key insights
 * 3. Identify elemental mappings and principles
 * 4. Update the Founder Agent's knowledge repository
 * 5. Display a summary of what was learned
 */
