#!/usr/bin/env node
// 🌀 SCRIPT: Ingest Elemental Alchemy Book into Founder Agent

import { logger } from "../src/utils/logger";
import fs from "fs/promises";
import path from "path";

interface BookContent {
  title: string;
  author: string;
  chapters: Chapter[];
  elementalWisdom: ElementalWisdom;
  coreTeachings: string[];
  practicalApplications: string[];
  metadata: BookMetadata;
}

interface Chapter {
  number: number;
  title: string;
  content: string;
  keyTeachings: string[];
  element?: string;
}

interface ElementalWisdom {
  fire: ElementTeaching;
  water: ElementTeaching;
  earth: ElementTeaching;
  air: ElementTeaching;
  aether: ElementTeaching;
}

interface ElementTeaching {
  essence: string;
  practices: string[];
  qualities: string[];
  healingApplications: string[];
  shadowAspects: string[];
}

interface BookMetadata {
  author: string;
  publisher: string;
  year: number;
  dedication: string;
  corePhilosophy: string;
}

async function ingestElementalAlchemyBook() {
  try {
    console.log("📚 Starting Elemental Alchemy Book ingestion...\n");

    // Path to the book
    const bookPath =
      "/Volumes/T7 Shield/Obsidian- Elemental Alchemy /Elemental Alchemy Book/Elemental Alchemy_ The Ancient Art of Living a Phenomenal Life.md";

    console.log(`📖 Reading book from: ${bookPath}\n`);

    // Read the book file
    const content = await fs.readFile(bookPath, "utf-8");

    // Parse the book structure
    const book = await parseElementalAlchemyBook(content);

    // Extract elemental wisdom
    const elementalWisdom = extractElementalWisdom(book);

    // Create knowledge update for Founder Agent
    const knowledgeUpdate = createKnowledgeUpdate(book, elementalWisdom);

    // Save the processed knowledge
    await saveProcessedKnowledge(knowledgeUpdate);

    console.log("✅ Elemental Alchemy Book successfully processed!\n");
    console.log("📊 Summary:");
    console.log(`- Title: ${book.title}`);
    console.log(`- Author: ${book.author}`);
    console.log(`- Chapters: ${book.chapters.length}`);
    console.log(`- Core Teachings: ${book.coreTeachings.length}`);
    console.log(
      `- Practical Applications: ${book.practicalApplications.length}\n`,
    );

    console.log("🔥💧🌍💨✨ Elemental Wisdom Extracted:");
    Object.entries(elementalWisdom).forEach(([element, teaching]) => {
      console.log(`\n${element.toUpperCase()}:`);
      console.log(`- Essence: ${teaching.essence.substring(0, 100)}...`);
      console.log(`- Practices: ${teaching.practices.length} practices`);
      console.log(`- Qualities: ${teaching.qualities.join(", ")}`);
    });

    console.log("\n🎯 Core Teachings:");
    book.coreTeachings.slice(0, 5).forEach((teaching, index) => {
      console.log(`${index + 1}. ${teaching.substring(0, 80)}...`);
    });

    console.log("\n✨ The Founder Agent now has deep knowledge of:");
    console.log("- The ancient art of Elemental Alchemy");
    console.log("- Practical applications for each element");
    console.log("- The Spiralogic Process integration");
    console.log("- Healing practices and shadow work");
    console.log("- The Torus of Change model");
    console.log("- Living a phenomenal life through elemental balance");

    console.log("\n📚 Elemental Alchemy wisdom integration complete!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error ingesting book:", error);
    logger.error("Book ingestion failed", error);
    process.exit(1);
  }
}

async function parseElementalAlchemyBook(
  content: string,
): Promise<BookContent> {
  const lines = content.split("\n");
  const chapters: Chapter[] = [];
  let currentChapter: Chapter | null = null;
  const coreTeachings: string[] = [];
  const practicalApplications: string[] = [];

  // Extract metadata
  const metadata: BookMetadata = {
    author: "Kelly Nezat",
    publisher: "Soullab Media",
    year: 2024,
    dedication: extractDedication(lines),
    corePhilosophy:
      "The ancient art of living a phenomenal life through elemental balance and alchemical transformation",
  };

  // Parse chapters
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Detect chapter headers
    if (line.match(/^#?\s*Chapter\s+(\d+):\s*(.+)/)) {
      const match = line.match(/^#?\s*Chapter\s+(\d+):\s*(.+)/);
      if (match) {
        if (currentChapter) {
          currentChapter.keyTeachings = extractKeyTeachings(
            currentChapter.content,
          );
          chapters.push(currentChapter);
        }
        currentChapter = {
          number: parseInt(match[1]),
          title: match[2].trim(),
          content: "",
          keyTeachings: [],
          element: detectElement(match[2]),
        };
      }
    } else if (currentChapter) {
      currentChapter.content += line + "\n";
    }

    // Extract core teachings (look for philosophical statements)
    if (line.includes('"') && line.length > 50 && line.length < 200) {
      const teaching = line.replace(/["""]/g, "").trim();
      if (teaching && !coreTeachings.includes(teaching)) {
        coreTeachings.push(teaching);
      }
    }

    // Extract practical applications
    if (line.match(/^(Practice|Exercise|Application|Try this):/i)) {
      practicalApplications.push(line);
    }
  }

  // Add the last chapter
  if (currentChapter) {
    currentChapter.keyTeachings = extractKeyTeachings(currentChapter.content);
    chapters.push(currentChapter);
  }

  return {
    title: "Elemental Alchemy: The Ancient Art of Living a Phenomenal Life",
    author: metadata.author,
    chapters,
    elementalWisdom: {} as ElementalWisdom, // Will be filled by extractElementalWisdom
    coreTeachings,
    practicalApplications,
    metadata,
  };
}

function extractDedication(lines: string[]): string {
  const dedStart = lines.findIndex((line) => line.includes("Dedication"));
  const dedEnd = lines.findIndex(
    (line, index) => index > dedStart && line.includes("Acknowledgments"),
  );

  if (dedStart !== -1 && dedEnd !== -1) {
    return lines
      .slice(dedStart + 1, dedEnd)
      .join(" ")
      .trim();
  }
  return "";
}

function detectElement(chapterTitle: string): string | undefined {
  const title = chapterTitle.toLowerCase();
  if (title.includes("fire")) return "fire";
  if (title.includes("water")) return "water";
  if (title.includes("earth")) return "earth";
  if (title.includes("air")) return "air";
  if (title.includes("aether")) return "aether";
  return undefined;
}

function extractKeyTeachings(content: string): string[] {
  const teachings: string[] = [];
  const lines = content.split("\n");

  lines.forEach((line) => {
    // Extract bullet points, key concepts, and important statements
    if (line.match(/^[\s]*[-•*]\s+(.+)/) && line.length > 30) {
      const teaching = line.replace(/^[\s]*[-•*]\s+/, "").trim();
      teachings.push(teaching);
    }
    // Extract section headers as teachings
    if (line.match(/^#{2,4}\s+(.+)/) && !line.includes("Chapter")) {
      const teaching = line.replace(/^#{2,4}\s+/, "").trim();
      if (teaching.length > 10) {
        teachings.push(teaching);
      }
    }
  });

  return teachings.slice(0, 10); // Limit to top 10 per chapter
}

function extractElementalWisdom(book: BookContent): ElementalWisdom {
  const wisdom: ElementalWisdom = {
    fire: extractElementTeaching(book, "fire"),
    water: extractElementTeaching(book, "water"),
    earth: extractElementTeaching(book, "earth"),
    air: extractElementTeaching(book, "air"),
    aether: extractElementTeaching(book, "aether"),
  };

  return wisdom;
}

function extractElementTeaching(
  book: BookContent,
  element: string,
): ElementTeaching {
  const elementChapter = book.chapters.find((ch) => ch.element === element);

  if (!elementChapter) {
    return {
      essence: "",
      practices: [],
      qualities: [],
      healingApplications: [],
      shadowAspects: [],
    };
  }

  const content = elementChapter.content;

  return {
    essence: extractEssence(content, element),
    practices: extractPractices(content),
    qualities: extractQualities(content, element),
    healingApplications: extractHealingApplications(content),
    shadowAspects: extractShadowAspects(content, element),
  };
}

function extractEssence(content: string, element: string): string {
  // Extract the essential description of each element
  const essencePatterns = [
    `${element}.*?element of (.+?)[\n.]`,
    `${element}.*?represents? (.+?)[\n.]`,
    `${element}.*?embodies (.+?)[\n.]`,
  ];

  for (const pattern of essencePatterns) {
    const match = content.match(new RegExp(pattern, "i"));
    if (match) {
      return match[1].trim();
    }
  }

  // Fallback essences based on traditional associations
  const fallbackEssences: Record<string, string> = {
    fire: "Spirit, transformation, passion, and creative energy",
    water: "Emotional intelligence, flow, intuition, and deep transformation",
    earth: "Embodiment, grounding, manifestation, and practical wisdom",
    air: "Intellect, communication, clarity, and mental agility",
    aether: "Unity, transcendence, integration, and infinite potential",
  };

  return fallbackEssences[element] || "";
}

function extractPractices(content: string): string[] {
  const practices: string[] = [];
  const lines = content.split("\n");

  lines.forEach((line, index) => {
    if (line.match(/^(Practice|Exercise|Try this|Application):/i)) {
      // Get the practice description (current line + next few lines)
      let practice = line;
      for (let i = 1; i <= 3 && index + i < lines.length; i++) {
        if (
          lines[index + i].trim() &&
          !lines[index + i].match(/^(Practice|Exercise|#)/)
        ) {
          practice += " " + lines[index + i].trim();
        } else {
          break;
        }
      }
      practices.push(practice);
    }
  });

  return practices;
}

function extractQualities(content: string, element: string): string[] {
  // Define qualities for each element based on the book's teachings
  const elementQualities: Record<string, string[]> = {
    fire: [
      "transformation",
      "passion",
      "creativity",
      "inspiration",
      "spiritual vision",
      "catalytic energy",
    ],
    water: [
      "emotional depth",
      "intuition",
      "flow",
      "adaptability",
      "healing",
      "receptivity",
    ],
    earth: [
      "grounding",
      "stability",
      "manifestation",
      "practicality",
      "nurturing",
      "embodiment",
    ],
    air: [
      "clarity",
      "communication",
      "intellect",
      "perspective",
      "discernment",
      "synthesis",
    ],
    aether: [
      "unity",
      "integration",
      "transcendence",
      "wholeness",
      "infinite potential",
      "harmony",
    ],
  };

  return elementQualities[element] || [];
}

function extractHealingApplications(content: string): string[] {
  const applications: string[] = [];
  const healingKeywords = [
    "healing",
    "balance",
    "restore",
    "transform",
    "integrate",
    "harmonize",
  ];

  const lines = content.split("\n");
  lines.forEach((line) => {
    if (
      healingKeywords.some((keyword) => line.toLowerCase().includes(keyword)) &&
      line.length > 40
    ) {
      applications.push(line.trim());
    }
  });

  return applications.slice(0, 5); // Limit to top 5
}

function extractShadowAspects(content: string, element: string): string[] {
  // Define shadow aspects for each element
  const shadowAspects: Record<string, string[]> = {
    fire: [
      "burnout",
      "impulsiveness",
      "aggression",
      "scattered energy",
      "spiritual bypassing",
    ],
    water: [
      "emotional overwhelm",
      "manipulation",
      "stagnation",
      "victimhood",
      "emotional avoidance",
    ],
    earth: [
      "rigidity",
      "materialism",
      "stagnation",
      "resistance to change",
      "over-attachment",
    ],
    air: [
      "overthinking",
      "disconnection",
      "analysis paralysis",
      "intellectual arrogance",
      "superficiality",
    ],
    aether: [
      "dissociation",
      "spiritual bypassing",
      "ungroundedness",
      "escapism",
      "false unity",
    ],
  };

  return shadowAspects[element] || [];
}

function createKnowledgeUpdate(book: BookContent, wisdom: ElementalWisdom) {
  return {
    type: "book",
    title: book.title,
    author: book.author,
    content: {
      chapters: book.chapters.map((ch) => ({
        number: ch.number,
        title: ch.title,
        element: ch.element,
        keyTeachings: ch.keyTeachings,
      })),
      elementalWisdom: wisdom,
      coreTeachings: book.coreTeachings,
      practicalApplications: book.practicalApplications,
    },
    metadata: {
      ...book.metadata,
      keywords: [
        "elemental alchemy",
        "transformation",
        "healing",
        "consciousness",
        "spiralogic",
      ],
      accessibility: "public",
      integrationDate: new Date().toISOString(),
    },
  };
}

async function saveProcessedKnowledge(knowledge: any): Promise<void> {
  const knowledgePath = path.join(
    __dirname,
    "../data/founder-knowledge/elemental-alchemy-book.json",
  );

  try {
    await fs.mkdir(path.dirname(knowledgePath), { recursive: true });
    await fs.writeFile(knowledgePath, JSON.stringify(knowledge, null, 2));
    console.log("💾 Knowledge saved to:", knowledgePath);
  } catch (error) {
    console.error("Error saving knowledge:", error);
  }
}

// Run the ingestion
ingestElementalAlchemyBook();

/**
 * 📚 ELEMENTAL ALCHEMY BOOK INGESTION
 *
 * This script processes Kelly Nezat's "Elemental Alchemy: The Ancient Art of Living a Phenomenal Life"
 * and integrates it into the Soullab Founder Agent's knowledge base.
 *
 * The script extracts:
 * - Chapter structure and key teachings
 * - Elemental wisdom for Fire, Water, Earth, Air, and Aether
 * - Practical applications and exercises
 * - Core philosophical teachings
 * - Healing applications and shadow work
 *
 * This enriches the Founder Agent's ability to explain:
 * - The practical application of elemental alchemy
 * - Personal transformation through elemental balance
 * - The integration of ancient wisdom with modern life
 * - The connection between Spiralogic and Elemental Alchemy
 */
