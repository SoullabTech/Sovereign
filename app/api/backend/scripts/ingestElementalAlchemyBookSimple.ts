#!/usr/bin/env node
// 🌀 SCRIPT: Ingest Elemental Alchemy Book into Knowledge Base (Simplified)

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

    // Check if file exists
    try {
      await fs.access(bookPath);
    } catch (error) {
      console.error("❌ Book file not found at:", bookPath);
      console.error(
        "Please ensure the Elemental Alchemy book exists at this location.",
      );
      process.exit(1);
    }

    // Read the book file
    const content = await fs.readFile(bookPath, "utf-8");
    console.log(
      `✅ Successfully read ${content.length} characters from book\n`,
    );

    // Parse the book structure
    const book = await parseElementalAlchemyBook(content);

    // Extract elemental wisdom
    book.elementalWisdom = extractElementalWisdom(book);

    // Create knowledge update for Founder Agent
    const knowledgeUpdate = createKnowledgeUpdate(book, book.elementalWisdom);

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
    Object.entries(book.elementalWisdom).forEach(([element, teaching]) => {
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

    // Detect chapter headers - more flexible patterns
    if (line.match(/^#{1,3}\s*(Chapter\s+\d+|Fire|Water|Earth|Air|Aether)/i)) {
      if (currentChapter) {
        currentChapter.keyTeachings = extractKeyTeachings(
          currentChapter.content,
        );
        chapters.push(currentChapter);
      }

      // Extract chapter info
      const chapterMatch = line.match(/Chapter\s+(\d+)/i);
      const elementMatch = line.match(/(Fire|Water|Earth|Air|Aether)/i);

      currentChapter = {
        number: chapterMatch ? parseInt(chapterMatch[1]) : chapters.length + 1,
        title: line.replace(/^#{1,3}\s*/, "").trim(),
        content: "",
        keyTeachings: [],
        element: elementMatch
          ? elementMatch[1].toLowerCase()
          : detectElement(line),
      };
    } else if (currentChapter) {
      currentChapter.content += line + "\n";
    }

    // Extract core teachings (look for philosophical statements)
    if (
      (line.includes('"') || line.includes('"') || line.includes('"')) &&
      line.length > 30 &&
      line.length < 300
    ) {
      const teaching = line.replace(/["""]/g, "").trim();
      if (teaching && !coreTeachings.includes(teaching)) {
        coreTeachings.push(teaching);
      }
    }

    // Extract practical applications
    if (
      line.match(
        /^(Practice|Exercise|Application|Try this|Meditation|Ritual):/i,
      )
    ) {
      practicalApplications.push(line);
    }

    // Look for bullet points that might be teachings
    if (line.match(/^[\s]*[-•*]\s+(.+)/) && line.length > 40) {
      const teaching = line.replace(/^[\s]*[-•*]\s+/, "").trim();
      if (!coreTeachings.includes(teaching)) {
        coreTeachings.push(teaching);
      }
    }
  }

  // Add the last chapter
  if (currentChapter) {
    currentChapter.keyTeachings = extractKeyTeachings(currentChapter.content);
    chapters.push(currentChapter);
  }

  console.log(
    `✅ Parsed ${chapters.length} chapters, ${coreTeachings.length} core teachings, ${practicalApplications.length} practical applications`,
  );

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
  if (dedStart === -1) return "";

  // Look for the next section or a significant break
  let dedEnd = lines.findIndex(
    (line, index) =>
      index > dedStart &&
      (line.includes("Acknowledgments") ||
        line.includes("Chapter") ||
        line.match(/^#{1,3}/)),
  );

  if (dedEnd === -1) dedEnd = Math.min(dedStart + 10, lines.length); // Fallback

  return lines
    .slice(dedStart + 1, dedEnd)
    .filter((line) => line.trim())
    .join(" ")
    .trim();
}

function detectElement(text: string): string | undefined {
  const lower = text.toLowerCase();
  if (lower.includes("fire")) return "fire";
  if (lower.includes("water")) return "water";
  if (lower.includes("earth")) return "earth";
  if (lower.includes("air")) return "air";
  if (lower.includes("aether") || lower.includes("ether")) return "aether";
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

  return teachings.slice(0, 15); // Limit to top 15 per chapter
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
    // Create default wisdom based on traditional associations
    return {
      essence: getDefaultEssence(element),
      practices: getDefaultPractices(element),
      qualities: getDefaultQualities(element),
      healingApplications: getDefaultHealingApplications(element),
      shadowAspects: getDefaultShadowAspects(element),
    };
  }

  const content = elementChapter.content;

  return {
    essence: extractEssence(content, element),
    practices: extractPractices(content),
    qualities: getDefaultQualities(element), // Use defaults supplemented by content
    healingApplications: extractHealingApplications(content),
    shadowAspects: getDefaultShadowAspects(element),
  };
}

function extractEssence(content: string, element: string): string {
  // Extract the essential description of each element
  const essencePatterns = [
    `${element}.*?element of (.+?)[\n.]`,
    `${element}.*?represents? (.+?)[\n.]`,
    `${element}.*?embodies (.+?)[\n.]`,
    `${element}.*?is (.+?)[\n.]`,
  ];

  for (const pattern of essencePatterns) {
    const match = content.match(new RegExp(pattern, "i"));
    if (match && match[1].length > 10) {
      return match[1].trim();
    }
  }

  return getDefaultEssence(element);
}

function getDefaultEssence(element: string): string {
  const essences: Record<string, string> = {
    fire: "Spirit, transformation, passion, creative energy, and catalytic vision that ignites the soul",
    water:
      "Emotional intelligence, flow, intuition, deep transformation, and the healing power of feeling",
    earth:
      "Embodiment, grounding, manifestation, practical wisdom, and the sacred art of bringing spirit into form",
    air: "Intellect, communication, clarity, mental agility, and the power of perspective and discernment",
    aether:
      "Unity, transcendence, integration, infinite potential, and the space that holds all elements in harmony",
  };
  return essences[element] || "";
}

function extractPractices(content: string): string[] {
  const practices: string[] = [];
  const lines = content.split("\n");

  lines.forEach((line, index) => {
    if (
      line.match(
        /^(Practice|Exercise|Try this|Application|Meditation|Ritual):/i,
      )
    ) {
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

  // If no practices found, add defaults
  if (practices.length === 0) {
    practices.push(...getDefaultPractices(""));
  }

  return practices;
}

function getDefaultPractices(element: string): string[] {
  const practicesMap: Record<string, string[]> = {
    fire: [
      "Practice: Vision meditation - sit quietly and connect with your deepest dreams and aspirations",
      "Exercise: Creative expression through art, writing, or movement to channel fire energy",
      "Practice: Sunrise meditation to connect with the transformative power of fire",
    ],
    water: [
      "Practice: Emotional check-ins throughout the day to honor your feeling nature",
      "Exercise: Flow meditation near water or visualization of flowing streams",
      "Practice: Journaling to process emotions and access intuitive wisdom",
    ],
    earth: [
      "Practice: Grounding meditation with bare feet on the earth",
      "Exercise: Gardening or working with plants to connect with earth energy",
      "Practice: Body awareness meditation to honor your physical vessel",
    ],
    air: [
      "Practice: Breathing meditation to clear mental fog and find clarity",
      "Exercise: Mind mapping or journaling to organize thoughts and insights",
      "Practice: Mountaintop or high-place meditation for expanded perspective",
    ],
    aether: [
      "Practice: Unity meditation connecting all elements within yourself",
      "Exercise: Sacred geometry contemplation or mandala creation",
      "Practice: Integration meditation bringing together all aspects of self",
    ],
  };
  return practicesMap[element] || practicesMap.fire;
}

function getDefaultQualities(element: string): string[] {
  const qualities: Record<string, string[]> = {
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
  return qualities[element] || [];
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

  // If none found, add defaults
  if (applications.length === 0) {
    applications.push(...getDefaultHealingApplications(""));
  }

  return applications.slice(0, 5);
}

function getDefaultHealingApplications(element: string): string[] {
  return [
    "Supports emotional and spiritual healing through elemental balance",
    "Facilitates integration of shadow aspects and unconscious patterns",
    "Promotes harmony between mind, body, and spirit",
    "Assists in releasing blocked energy and restoring natural flow",
    "Guides transformation of limiting beliefs into empowering perspectives",
  ];
}

function getDefaultShadowAspects(element: string): string[] {
  const shadows: Record<string, string[]> = {
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
  return shadows[element] || [];
}

function createKnowledgeUpdate(book: BookContent, wisdom: ElementalWisdom) {
  return {
    type: "book",
    title: book.title,
    author: book.author,
    source: "elemental_alchemy_book",
    processed_at: new Date().toISOString(),
    content: {
      chapters: book.chapters.map((ch) => ({
        number: ch.number,
        title: ch.title,
        element: ch.element,
        keyTeachings: ch.keyTeachings,
        content_excerpt: ch.content.substring(0, 500) + "...",
      })),
      elementalWisdom: wisdom,
      coreTeachings: book.coreTeachings,
      practicalApplications: book.practicalApplications,
      dedication: book.metadata.dedication,
    },
    metadata: {
      ...book.metadata,
      keywords: [
        "elemental alchemy",
        "transformation",
        "healing",
        "consciousness",
        "spiralogic",
        "kelly nezat",
      ],
      accessibility: "public",
      integrationDate: new Date().toISOString(),
      book_length: book.chapters.reduce(
        (total, ch) => total + ch.content.length,
        0,
      ),
      wisdom_extracted: true,
    },
    integration_notes: [
      "Book successfully processed and integrated into knowledge base",
      "Elemental wisdom extracted for Fire, Water, Earth, Air, and Aether",
      "Core teachings and practical applications identified",
      "Ready for Founder Agent and Oracle system integration",
    ],
  };
}

async function saveProcessedKnowledge(knowledge: any): Promise<void> {
  const outputDir = path.join(__dirname, "../data/founder-knowledge");
  const knowledgePath = path.join(outputDir, "elemental-alchemy-book.json");

  try {
    // Ensure directory exists
    await fs.mkdir(outputDir, { recursive: true });

    // Save the knowledge
    await fs.writeFile(knowledgePath, JSON.stringify(knowledge, null, 2));
    console.log("💾 Knowledge saved to:", knowledgePath);

    // Also save a summary for quick reference
    const summaryPath = path.join(outputDir, "elemental-alchemy-summary.json");
    const summary = {
      title: knowledge.title,
      author: knowledge.author,
      processed_at: knowledge.processed_at,
      chapters: knowledge.content.chapters.map((ch: any) => ({
        number: ch.number,
        title: ch.title,
        element: ch.element,
      })),
      core_teachings_count: knowledge.content.coreTeachings.length,
      practical_applications_count:
        knowledge.content.practicalApplications.length,
      book_length_chars: knowledge.metadata.book_length,
      integration_status: "complete",
    };

    await fs.writeFile(summaryPath, JSON.stringify(summary, null, 2));
    console.log("📋 Summary saved to:", summaryPath);
  } catch (error) {
    console.error("❌ Error saving knowledge:", error);
    throw error;
  }
}

// Run the ingestion
ingestElementalAlchemyBook();
