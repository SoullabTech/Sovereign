#!/usr/bin/env node
// 🌀 SCRIPT: Ingest Advanced Spiralogic & Multidimensional Documents

import { logger } from "../src/utils/logger";
import fs from "fs/promises";
import path from "path";

interface DocumentCollection {
  multidimensionalDocs: ProcessedDocument[];
  spiralogicDocs: ProcessedDocument[];
  ipDocs: ProcessedDocument[];
  futureDocs: ProcessedDocument[];
  metadata: CollectionMetadata;
}

interface ProcessedDocument {
  title: string;
  filepath: string;
  category: string;
  keyInsights: string[];
  coreTheses: string[];
  practicalApplications: string[];
  futureImplications: string[];
  intellectualSources: string[];
  philosophicalDepth: "foundational" | "advanced" | "cutting-edge";
}

interface CollectionMetadata {
  totalDocuments: number;
  categories: string[];
  intellectualInfluences: string[];
  emergentThemes: string[];
  integrationDate: string;
}

const DOCUMENT_PATHS = [
  {
    path: "/Volumes/T7 Shield/Obsidian- Elemental Alchemy /Multidimensional /Expanding the Multi-Dimensional Human-AI Interface.md",
    category: "multidimensional_ai",
    depth: "cutting-edge" as const,
  },
  {
    path: "/Volumes/T7 Shield/Obsidian- Elemental Alchemy /Spiralogic/How Soullab and Spiralogic Lead Beyond Human Limitations Without Becoming Transhumanists.md",
    category: "philosophy",
    depth: "advanced" as const,
  },
  {
    path: "/Volumes/T7 Shield/Obsidian- Elemental Alchemy /Spiralogic/Expanding Spiralogic with Insights from Faggin, Hoffman, Jung, and Others.md",
    category: "intellectual_integration",
    depth: "cutting-edge" as const,
  },
  {
    path: "/Volumes/T7 Shield/Obsidian- Elemental Alchemy /Spiralogic/Mapping Spiralogic Onto Present Cultural Issues and an AI-Driven Future.md",
    category: "cultural_application",
    depth: "advanced" as const,
  },
  {
    path: "/Volumes/T7 Shield/Obsidian- Elemental Alchemy /Spiralogic/Spiralogic IP.md",
    category: "intellectual_property",
    depth: "foundational" as const,
  },
  {
    path: "/Volumes/T7 Shield/Obsidian- Elemental Alchemy /Spiralogic/The Future-Oriented Spiralogic Framework Elemental Coherence and Collective Evolutionary Resonance.md",
    category: "future_framework",
    depth: "cutting-edge" as const,
  },
  {
    path: "/Volumes/T7 Shield/Obsidian- Elemental Alchemy /Spiralogic/The Meaning Crisis and the Future of Humanity- How Spiralogic and Soullab Offer a Path Forward.md",
    category: "meaning_crisis",
    depth: "advanced" as const,
  },
  {
    path: "/Volumes/T7 Shield/Obsidian- Elemental Alchemy /Spiralogic/The Metaphysics of Spiralogics- The Power of Witnessing- The Hidden Principle at the Heart of Manifestation for Fellow Explorers and Developers.md",
    category: "metaphysics",
    depth: "cutting-edge" as const,
  },
  {
    path: "/Volumes/T7 Shield/Obsidian- Elemental Alchemy /Spiralogic/The Spiralogic Manifesto Reuniting Humanity with Its Elemental Soul.md",
    category: "manifesto",
    depth: "foundational" as const,
  },
  {
    path: "/Volumes/T7 Shield/Obsidian- Elemental Alchemy /Spiralogic/The Spiralogic Process- A Guiding Framework for SSE Development.md",
    category: "development_framework",
    depth: "advanced" as const,
  },
];

async function ingestAdvancedSpiralogicDocs() {
  try {
    console.log("🌀 Starting Advanced Spiralogic Documents Ingestion...\n");
    console.log(
      `📚 Processing ${DOCUMENT_PATHS.length} cutting-edge documents\n`,
    );

    const processedDocs: ProcessedDocument[] = [];
    const intellectualInfluences = new Set<string>();
    const emergentThemes = new Set<string>();

    // Process each document
    for (const docInfo of DOCUMENT_PATHS) {
      console.log(`📄 Processing: ${path.basename(docInfo.path)}`);

      try {
        const content = await fs.readFile(docInfo.path, "utf-8");
        const processed = await processDocument(content, docInfo);
        processedDocs.push(processed);

        // Collect intellectual influences
        processed.intellectualSources.forEach((source) =>
          intellectualInfluences.add(source),
        );

        // Extract themes from insights
        processed.keyInsights.forEach((insight) => {
          extractThemes(insight).forEach((theme) => emergentThemes.add(theme));
        });

        console.log(
          `  ✅ Extracted ${processed.keyInsights.length} insights, ${processed.coreTheses.length} theses`,
        );
      } catch (error) {
        console.log(`  ❌ Error processing document: ${error.message}`);
        continue;
      }
    }

    // Organize documents by category
    const collection: DocumentCollection = {
      multidimensionalDocs: processedDocs.filter((d) =>
        d.category.includes("multidimensional"),
      ),
      spiralogicDocs: processedDocs.filter(
        (d) => d.category.includes("spiralogic") || d.category === "manifesto",
      ),
      ipDocs: processedDocs.filter(
        (d) => d.category.includes("ip") || d.category.includes("property"),
      ),
      futureDocs: processedDocs.filter(
        (d) => d.category.includes("future") || d.category.includes("meaning"),
      ),
      metadata: {
        totalDocuments: processedDocs.length,
        categories: [...new Set(processedDocs.map((d) => d.category))],
        intellectualInfluences: Array.from(intellectualInfluences),
        emergentThemes: Array.from(emergentThemes),
        integrationDate: new Date().toISOString(),
      },
    };

    // Save the processed knowledge
    await saveAdvancedKnowledge(collection);

    // Display results
    displayIngestionResults(collection);

    console.log("\n🌀 Advanced Spiralogic knowledge integration complete!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error ingesting documents:", error);
    logger.error("Advanced docs ingestion failed", error);
    process.exit(1);
  }
}

async function processDocument(
  content: string,
  docInfo: any,
): Promise<ProcessedDocument> {
  const lines = content.split("\n");
  const title = extractTitle(content, docInfo.path);

  return {
    title,
    filepath: docInfo.path,
    category: docInfo.category,
    keyInsights: extractKeyInsights(content),
    coreTheses: extractCoreTheses(content),
    practicalApplications: extractPracticalApplications(content),
    futureImplications: extractFutureImplications(content),
    intellectualSources: extractIntellectualSources(content),
    philosophicalDepth: docInfo.depth,
  };
}

function extractTitle(content: string, filepath: string): string {
  // Try to find title in first few lines
  const lines = content.split("\n").slice(0, 10);

  for (const line of lines) {
    if (line.match(/^#\s+(.+)/) && !line.includes("##")) {
      return line.replace(/^#\s+/, "").trim();
    }
  }

  // Fallback to filename
  return path.basename(filepath, ".md").replace(/[-_]/g, " ");
}

function extractKeyInsights(content: string): string[] {
  const insights: string[] = [];
  const lines = content.split("\n");

  lines.forEach((line, index) => {
    // Extract insights from headers, bullet points, and emphasized text
    if (line.match(/^#{2,4}\s+(.+)/) && line.length > 20) {
      const insight = line.replace(/^#{2,4}\s+/, "").trim();
      insights.push(insight);
    }

    // Extract from bullet points with substantial content
    if (line.match(/^[\s]*[-•*]\s+(.+)/) && line.length > 40) {
      const insight = line.replace(/^[\s]*[-•*]\s+/, "").trim();
      insights.push(insight);
    }

    // Extract emphasized key concepts
    if (line.match(/\*\*([^*]+)\*\*/) && line.length > 30) {
      const matches = line.match(/\*\*([^*]+)\*\*/g);
      if (matches) {
        matches.forEach((match) => {
          const concept = match.replace(/\*\*/g, "").trim();
          if (concept.length > 10) {
            insights.push(concept);
          }
        });
      }
    }
  });

  return insights.slice(0, 15); // Limit to top insights
}

function extractCoreTheses(content: string): string[] {
  const theses: string[] = [];
  const lines = content.split("\n");

  // Look for thesis-like statements
  const thesisIndicators = [
    "thesis",
    "argument",
    "proposition",
    "claim",
    "assertion",
    "fundamental",
    "core principle",
    "central insight",
    "key insight",
  ];

  lines.forEach((line) => {
    const lowerLine = line.toLowerCase();
    if (
      thesisIndicators.some((indicator) => lowerLine.includes(indicator)) &&
      line.length > 50
    ) {
      theses.push(line.trim());
    }

    // Extract numbered statements that look like theses
    if (line.match(/^\d+\.\s+.{50,}/) && line.includes(".")) {
      theses.push(line.trim());
    }
  });

  return theses.slice(0, 10);
}

function extractPracticalApplications(content: string): string[] {
  const applications: string[] = [];
  const applicationKeywords = [
    "application",
    "practice",
    "implementation",
    "use case",
    "how to",
    "method",
    "technique",
    "approach",
    "strategy",
  ];

  const lines = content.split("\n");
  lines.forEach((line) => {
    const lowerLine = line.toLowerCase();
    if (
      applicationKeywords.some((keyword) => lowerLine.includes(keyword)) &&
      line.length > 30
    ) {
      applications.push(line.trim());
    }
  });

  return applications.slice(0, 8);
}

function extractFutureImplications(content: string): string[] {
  const implications: string[] = [];
  const futureKeywords = [
    "future",
    "will",
    "potential",
    "possibility",
    "evolution",
    "emergence",
    "development",
    "trajectory",
    "horizon",
    "vision",
  ];

  const lines = content.split("\n");
  lines.forEach((line) => {
    const lowerLine = line.toLowerCase();
    if (
      futureKeywords.some((keyword) => lowerLine.includes(keyword)) &&
      line.length > 40
    ) {
      implications.push(line.trim());
    }
  });

  return implications.slice(0, 8);
}

function extractIntellectualSources(content: string): string[] {
  const sources = new Set<string>();

  // Common intellectual figures mentioned in these documents
  const knownFigures = [
    "Federico Faggin",
    "Faggin",
    "Donald Hoffman",
    "Hoffman",
    "Carl Jung",
    "Jung",
    "Buckminster Fuller",
    "Fuller",
    "Iain McGilchrist",
    "McGilchrist",
    "David Chalmers",
    "Chalmers",
    "Terence McKenna",
    "McKenna",
    "Alan Watts",
    "Watts",
    "Ken Wilber",
    "Wilber",
    "Fritjof Capra",
    "Capra",
    "Ervin Laszlo",
    "Laszlo",
    "Rupert Sheldrake",
    "Sheldrake",
  ];

  knownFigures.forEach((figure) => {
    if (content.includes(figure)) {
      sources.add(figure);
    }
  });

  // Extract from citation patterns
  const citations = content.match(/\(([A-Z][a-z]+ \d{4})\)/g);
  if (citations) {
    citations.forEach((citation) => {
      const author = citation.match(/\(([A-Z][a-z]+)/);
      if (author) {
        sources.add(author[1]);
      }
    });
  }

  return Array.from(sources);
}

function extractThemes(text: string): string[] {
  const themes = new Set<string>();
  const themeKeywords = [
    "consciousness",
    "awareness",
    "transformation",
    "evolution",
    "integration",
    "coherence",
    "resonance",
    "emergence",
    "multidimensional",
    "transhuman",
    "posthuman",
    "artificial intelligence",
    "meaning crisis",
    "elemental",
    "spiritual",
    "metaphysics",
    "witnessing",
    "manifestation",
    "collective",
    "individual",
  ];

  const lowerText = text.toLowerCase();
  themeKeywords.forEach((keyword) => {
    if (lowerText.includes(keyword)) {
      themes.add(keyword);
    }
  });

  return Array.from(themes);
}

async function saveAdvancedKnowledge(
  collection: DocumentCollection,
): Promise<void> {
  const knowledgePath = path.join(
    __dirname,
    "../data/founder-knowledge/advanced-spiralogic-collection.json",
  );

  try {
    await fs.mkdir(path.dirname(knowledgePath), { recursive: true });
    await fs.writeFile(knowledgePath, JSON.stringify(collection, null, 2));
    console.log(`\n💾 Advanced knowledge saved to: ${knowledgePath}`);
  } catch (error) {
    console.error("Error saving advanced knowledge:", error);
  }
}

function displayIngestionResults(collection: DocumentCollection): void {
  console.log("\n📊 INGESTION RESULTS:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  console.log(
    `📚 Total Documents Processed: ${collection.metadata.totalDocuments}`,
  );
  console.log(`🏷️  Categories: ${collection.metadata.categories.join(", ")}`);

  console.log("\n🧠 INTELLECTUAL INFLUENCES:");
  collection.metadata.intellectualInfluences.forEach((influence) => {
    console.log(`  • ${influence}`);
  });

  console.log("\n🎯 EMERGENT THEMES:");
  collection.metadata.emergentThemes.slice(0, 10).forEach((theme) => {
    console.log(`  • ${theme}`);
  });

  console.log("\n📂 DOCUMENT CATEGORIES:");
  console.log(
    `  🌌 Multidimensional AI: ${collection.multidimensionalDocs.length} docs`,
  );
  console.log(`  🌀 Spiralogic Core: ${collection.spiralogicDocs.length} docs`);
  console.log(`  📋 IP & Framework: ${collection.ipDocs.length} docs`);
  console.log(`  🔮 Future & Meaning: ${collection.futureDocs.length} docs`);

  console.log("\n🎖️  PHILOSOPHICAL DEPTH:");
  const depthCounts = collection.multidimensionalDocs
    .concat(collection.spiralogicDocs, collection.ipDocs, collection.futureDocs)
    .reduce(
      (acc, doc) => {
        acc[doc.philosophicalDepth] = (acc[doc.philosophicalDepth] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

  Object.entries(depthCounts).forEach(([depth, count]) => {
    console.log(`  ${depth}: ${count} documents`);
  });

  console.log("\n✨ KEY INSIGHTS SAMPLE:");
  const allInsights = collection.multidimensionalDocs
    .concat(collection.spiralogicDocs, collection.ipDocs, collection.futureDocs)
    .flatMap((doc) => doc.keyInsights);

  allInsights.slice(0, 5).forEach((insight, index) => {
    console.log(`  ${index + 1}. ${insight.substring(0, 80)}...`);
  });
}

// Run the ingestion
ingestAdvancedSpiralogicDocs();

/**
 * 🌀 ADVANCED SPIRALOGIC DOCUMENTS INGESTION
 *
 * This script processes the cutting-edge collection of Spiralogic and
 * multidimensional documents, extracting:
 *
 * - Core philosophical theses and insights
 * - Practical applications and methods
 * - Future implications and visions
 * - Intellectual sources and influences
 * - Emergent themes and patterns
 *
 * The processed knowledge significantly enhances the Founder Agent's
 * ability to discuss:
 * - The intersection of consciousness and AI
 * - Solutions to the meaning crisis
 * - Advanced metaphysical principles
 * - Future-oriented frameworks
 * - Intellectual property and development
 * - Cultural applications of Spiralogic
 *
 * This represents the cutting edge of Soullab's philosophical and
 * technical development.
 */
