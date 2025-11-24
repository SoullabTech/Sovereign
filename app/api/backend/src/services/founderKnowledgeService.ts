// 🌀 FOUNDER KNOWLEDGE INGESTION SERVICE
// Processes and integrates organizational wisdom documents

import { logger } from "../utils/logger";
import { SoullabFounderAgent } from "../core/agents/soullabFounderAgent";
import fs from "fs/promises";
import path from "path";

interface ManifestoContent {
  title: string;
  version: string;
  sections: ManifestoSection[];
  corePrinciples: string[];
  keywords: string[];
  lastUpdated: Date;
}

interface ManifestoSection {
  heading: string;
  content: string;
  tags: string[];
  keyInsights: string[];
}

interface ElementalAlchemyBook {
  title: string;
  author: string;
  chapters: ElementalChapter[];
  elementalWisdom: ElementalWisdom;
  coreTeachings: string[];
  practicalApplications: string[];
  metadata: BookMetadata;
}

interface ElementalChapter {
  number: number;
  title: string;
  element?: string;
  keyTeachings: string[];
  content_excerpt: string;
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
  keywords: string[];
  integrationDate: string;
}

export class FounderKnowledgeService {
  private founderAgent: SoullabFounderAgent;

  constructor() {
    this.founderAgent = new SoullabFounderAgent();
  }

  /**
   * Process the Elemental Alchemy Book
   */
  async ingestElementalAlchemyBook(): Promise<ElementalAlchemyBook> {
    try {
      logger.info("FounderKnowledge: Loading Elemental Alchemy Book knowledge");

      const knowledgePath = path.join(
        __dirname,
        "../../data/founder-knowledge/elemental-alchemy-book.json",
      );

      // Check if the book has been processed
      try {
        const content = await fs.readFile(knowledgePath, "utf-8");
        const bookData = JSON.parse(content);

        // Transform the data structure for founder agent
        const elementalBook: ElementalAlchemyBook = {
          title: bookData.title,
          author: bookData.author,
          chapters: bookData.content.chapters,
          elementalWisdom: bookData.content.elementalWisdom,
          coreTeachings: bookData.content.coreTeachings,
          practicalApplications: bookData.content.practicalApplications,
          metadata: {
            ...bookData.metadata,
            keywords: bookData.metadata.keywords || [
              "elemental alchemy",
              "transformation",
              "consciousness",
            ],
            integrationDate: bookData.processed_at,
          },
        };

        // Update founder agent with elemental wisdom
        await this.updateFounderWithElementalWisdom(elementalBook);

        logger.info(
          "FounderKnowledge: Elemental Alchemy Book successfully integrated",
          {
            chapters: elementalBook.chapters.length,
            teachings: elementalBook.coreTeachings.length,
          },
        );

        return elementalBook;
      } catch (fileError) {
        logger.error(
          "FounderKnowledge: Elemental Alchemy Book not found - run ingestion script first",
          { fileError },
        );
        throw new Error(
          "Elemental Alchemy Book not processed yet. Please run the ingestion script first.",
        );
      }
    } catch (error) {
      logger.error(
        "FounderKnowledge: Error loading Elemental Alchemy Book",
        error,
      );
      throw error;
    }
  }

  /**
   * Process the Spiralogic Process Manifesto
   */
  async ingestSpiralogicManifesto(filePath: string): Promise<ManifestoContent> {
    try {
      logger.info("FounderKnowledge: Ingesting Spiralogic Process Manifesto", {
        filePath,
      });

      // Read the manifesto file
      const content = await fs.readFile(filePath, "utf-8");

      // Parse the manifesto structure
      const manifesto = this.parseManifesto(
        content,
        "Spiralogic Process Manifesto",
      );

      // Extract core insights
      const coreInsights = this.extractSpiralogicInsights(manifesto);

      // Update founder agent knowledge base
      await this.updateFounderKnowledge(manifesto, coreInsights);

      logger.info(
        "FounderKnowledge: Spiralogic Manifesto successfully integrated",
        {
          sections: manifesto.sections.length,
          principles: manifesto.corePrinciples.length,
        },
      );

      return manifesto;
    } catch (error) {
      logger.error(
        "FounderKnowledge: Error ingesting Spiralogic Manifesto",
        error,
      );
      throw error;
    }
  }

  /**
   * Parse markdown manifesto into structured format
   */
  private parseManifesto(content: string, title: string): ManifestoContent {
    const lines = content.split("\n");
    const sections: ManifestoSection[] = [];
    let currentSection: ManifestoSection | null = null;
    const corePrinciples: string[] = [];
    const keywords = new Set<string>();

    for (const line of lines) {
      // Extract hashtags as keywords
      const tags = line.match(/#(\w+)/g);
      if (tags) {
        tags.forEach((tag) => keywords.add(tag.substring(1)));
      }

      // Parse section headers
      if (line.startsWith("### ")) {
        if (currentSection) {
          sections.push(currentSection);
        }
        currentSection = {
          heading: line.replace(/### \*\*|\*\*|###/g, "").trim(),
          content: "",
          tags: tags ? tags.map((t) => t.substring(1)) : [],
          keyInsights: [],
        };
      }
      // Parse subsection headers
      else if (line.startsWith("#### ")) {
        if (currentSection) {
          currentSection.content +=
            "\n\n" + line.replace(/####/g, "").trim() + "\n";
        }
      }
      // Extract principles
      else if (
        line.includes("**") &&
        line.includes(":") &&
        currentSection?.heading.includes("Principles")
      ) {
        const principle = line.replace(/\*\*/g, "").trim();
        corePrinciples.push(principle);
        if (currentSection) {
          currentSection.content += "\n" + line;
        }
      }
      // Regular content
      else if (line.trim() && currentSection) {
        currentSection.content += "\n" + line;
      }
    }

    // Add the last section
    if (currentSection) {
      sections.push(currentSection);
    }

    // Extract key insights from each section
    sections.forEach((section) => {
      section.keyInsights = this.extractKeyInsights(section.content);
    });

    return {
      title,
      version: "1.0",
      sections,
      corePrinciples,
      keywords: Array.from(keywords),
      lastUpdated: new Date(),
    };
  }

  /**
   * Extract key insights from section content
   */
  private extractKeyInsights(content: string): string[] {
    const insights: string[] = [];

    // Extract bullet points as insights
    const bulletPoints = content.match(/^[\s]*[-•]\s*(.+)$/gm);
    if (bulletPoints) {
      bulletPoints.forEach((point) => {
        const cleaned = point.replace(/^[\s]*[-•]\s*/, "").trim();
        if (cleaned.length > 20) {
          // Only substantial points
          insights.push(cleaned);
        }
      });
    }

    // Extract bolded key concepts
    const boldConcepts = content.match(/\*\*([^*]+)\*\*/g);
    if (boldConcepts) {
      boldConcepts.forEach((concept) => {
        const cleaned = concept.replace(/\*\*/g, "").trim();
        if (cleaned.length > 10 && !insights.includes(cleaned)) {
          insights.push(cleaned);
        }
      });
    }

    return insights;
  }

  /**
   * Extract Spiralogic-specific insights
   */
  private extractSpiralogicInsights(
    manifesto: ManifestoContent,
  ): SpiralogicInsights {
    const insights: SpiralogicInsights = {
      elements: {},
      spiralDynamics: "",
      integrationPrinciples: [],
      practicalApplications: [],
    };

    // Extract elemental definitions
    manifesto.sections.forEach((section) => {
      if (
        section.heading.includes("Quadrants") ||
        section.heading.includes("Elements")
      ) {
        // Fire element
        const fireMatch = section.content.match(/Fire[^:]*:([^-]+)-/s);
        if (fireMatch) {
          insights.elements.fire = {
            name: "Fire",
            aspect: "Vision and Creativity",
            description: fireMatch[1].trim(),
            quadrant: "upper-right",
            brainFunction: "right prefrontal cortex",
          };
        }

        // Water element
        const waterMatch = section.content.match(/Water[^:]*:([^-]+)-/s);
        if (waterMatch) {
          insights.elements.water = {
            name: "Water",
            aspect: "Emotion and Flow",
            description: waterMatch[1].trim(),
            quadrant: "lower-right",
            brainFunction: "right hemisphere",
          };
        }

        // Earth element
        const earthMatch = section.content.match(/Earth[^:]*:([^-]+)-/s);
        if (earthMatch) {
          insights.elements.earth = {
            name: "Earth",
            aspect: "Embodiment and Stability",
            description: earthMatch[1].trim(),
            quadrant: "lower-left",
            brainFunction: "left hemisphere",
          };
        }

        // Air element
        const airMatch = section.content.match(/Air[^:]*:([^-]+)-/s);
        if (airMatch) {
          insights.elements.air = {
            name: "Air",
            aspect: "Expression and Clarity",
            description: airMatch[1].trim(),
            quadrant: "upper-left",
            brainFunction: "left prefrontal cortex",
          };
        }

        // Aether element
        const aetherMatch = section.content.match(/Aether[^:]*:([^,]+),/s);
        if (aetherMatch) {
          insights.elements.aether = {
            name: "Aether",
            aspect: "Crystal Focus",
            description: aetherMatch[1].trim(),
            quadrant: "center",
            brainFunction: "unified field",
          };
        }
      }

      // Extract spiral movement
      if (
        section.heading.includes("Spiral") ||
        section.heading.includes("Movement")
      ) {
        insights.spiralDynamics = section.content;
      }

      // Extract principles
      if (section.heading.includes("Principles")) {
        insights.integrationPrinciples = section.keyInsights;
      }
    });

    // Extract core principles
    insights.integrationPrinciples = manifesto.corePrinciples;

    return insights;
  }

  /**
   * Update founder agent with Elemental Alchemy wisdom
   */
  private async updateFounderWithElementalWisdom(
    book: ElementalAlchemyBook,
  ): Promise<void> {
    try {
      // Create structured knowledge update for elemental wisdom
      const elementalKnowledgeUpdate = {
        type: "elemental_alchemy_book" as const,
        title: book.title,
        author: book.author,
        content: {
          chapters: book.chapters,
          elementalWisdom: book.elementalWisdom,
          coreTeachings: book.coreTeachings.slice(0, 100), // Limit for performance
          practicalApplications: book.practicalApplications,
          dedication: book.metadata.dedication,
        },
        metadata: {
          ...book.metadata,
          accessibility: "public" as const,
          ingestionDate: new Date().toISOString(),
          sourceType: "book",
          elementCount: Object.keys(book.elementalWisdom).length,
          chapterCount: book.chapters.length,
          teachingCount: book.coreTeachings.length,
        },
      };

      // Store in a format the agent can reference
      await this.storeElementalKnowledge(elementalKnowledgeUpdate);

      // Create elemental wisdom summary for quick agent reference
      const elementalSummary = this.createElementalWisdomSummary(
        book.elementalWisdom,
      );
      await this.storeElementalSummary(elementalSummary);

      logger.info(
        "FounderKnowledge: Elemental Alchemy wisdom integrated into founder agent",
        {
          elements: Object.keys(book.elementalWisdom),
          chapters: book.chapters.length,
          teachings: book.coreTeachings.length,
        },
      );
    } catch (error) {
      logger.error(
        "FounderKnowledge: Error updating founder with elemental wisdom",
        error,
      );
      throw error;
    }
  }

  /**
   * Create a summary of elemental wisdom for quick agent access
   */
  private createElementalWisdomSummary(wisdom: ElementalWisdom): any {
    return {
      type: "elemental_wisdom_summary",
      created_at: new Date().toISOString(),
      elements: {
        fire: {
          essence: wisdom.fire.essence,
          key_qualities: wisdom.fire.qualities.slice(0, 3),
          primary_practice:
            wisdom.fire.practices[0] ||
            "Vision meditation and creative expression",
          shadow_aspect:
            wisdom.fire.shadowAspects[0] || "Burnout and scattered energy",
        },
        water: {
          essence: wisdom.water.essence,
          key_qualities: wisdom.water.qualities.slice(0, 3),
          primary_practice:
            wisdom.water.practices[0] ||
            "Emotional flow and feeling integration",
          shadow_aspect:
            wisdom.water.shadowAspects[0] ||
            "Emotional overwhelm and stagnation",
        },
        earth: {
          essence: wisdom.earth.essence,
          key_qualities: wisdom.earth.qualities.slice(0, 3),
          primary_practice:
            wisdom.earth.practices[0] || "Grounding and embodiment practices",
          shadow_aspect:
            wisdom.earth.shadowAspects[0] ||
            "Rigidity and resistance to change",
        },
        air: {
          essence: wisdom.air.essence,
          key_qualities: wisdom.air.qualities.slice(0, 3),
          primary_practice:
            wisdom.air.practices[0] || "Clarity meditation and communication",
          shadow_aspect:
            wisdom.air.shadowAspects[0] || "Overthinking and disconnection",
        },
        aether: {
          essence: wisdom.aether.essence,
          key_qualities: wisdom.aether.qualities.slice(0, 3),
          primary_practice:
            wisdom.aether.practices[0] || "Integration and unity meditation",
          shadow_aspect:
            wisdom.aether.shadowAspects[0] ||
            "Spiritual bypassing and dissociation",
        },
      },
      integration_principles: [
        "Each element offers unique gifts and challenges for personal transformation",
        "Balance among elements creates wholeness and authentic power",
        "Shadow work with elements reveals hidden potential and wisdom",
        "Practical application brings elemental wisdom into daily life",
        "The Spiralogic Process guides elemental integration journey",
      ],
    };
  }

  /**
   * Store elemental knowledge for agent retrieval
   */
  private async storeElementalKnowledge(knowledge: any): Promise<void> {
    const knowledgePath = path.join(
      __dirname,
      "../../data/founder-knowledge/elemental-alchemy-processed.json",
    );

    try {
      await fs.mkdir(path.dirname(knowledgePath), { recursive: true });
      await fs.writeFile(knowledgePath, JSON.stringify(knowledge, null, 2));
      logger.info(
        "FounderKnowledge: Elemental knowledge stored for agent access",
        { path: knowledgePath },
      );
    } catch (error) {
      logger.error(
        "FounderKnowledge: Error storing elemental knowledge",
        error,
      );
      throw error;
    }
  }

  /**
   * Store elemental wisdom summary for quick agent reference
   */
  private async storeElementalSummary(summary: any): Promise<void> {
    const summaryPath = path.join(
      __dirname,
      "../../data/founder-knowledge/elemental-wisdom-summary.json",
    );

    try {
      await fs.writeFile(summaryPath, JSON.stringify(summary, null, 2));
      logger.info("FounderKnowledge: Elemental wisdom summary stored", {
        path: summaryPath,
      });
    } catch (error) {
      logger.error("FounderKnowledge: Error storing elemental summary", error);
      throw error;
    }
  }

  /**
   * Update the founder agent's knowledge base
   */
  private async updateFounderKnowledge(
    manifesto: ManifestoContent,
    insights: SpiralogicInsights,
  ): Promise<void> {
    // Create structured knowledge update
    const knowledgeUpdate = {
      type: "manifesto" as const,
      title: manifesto.title,
      content: JSON.stringify(manifesto),
      metadata: {
        version: manifesto.version,
        keywords: manifesto.keywords,
        insights: insights,
        accessibility: "public" as const,
        lastUpdated: manifesto.lastUpdated,
      },
    };

    // In a real implementation, this would update the agent's knowledge repository
    logger.info(
      "FounderKnowledge: Knowledge base updated with Spiralogic insights",
      {
        elements: Object.keys(insights.elements),
        principles: insights.integrationPrinciples.length,
      },
    );

    // Store in a format the agent can reference
    await this.storeManifestoKnowledge(knowledgeUpdate);
  }

  /**
   * Store manifesto knowledge for agent retrieval
   */
  private async storeManifestoKnowledge(knowledge: any): Promise<void> {
    // In production, this would store to a vector database or similar
    // For now, we'll create a JSON file the agent can reference
    const knowledgePath = path.join(
      __dirname,
      "../../data/founder-knowledge/spiralogic-manifesto.json",
    );

    try {
      await fs.mkdir(path.dirname(knowledgePath), { recursive: true });
      await fs.writeFile(knowledgePath, JSON.stringify(knowledge, null, 2));
      logger.info("FounderKnowledge: Manifesto knowledge stored", {
        path: knowledgePath,
      });
    } catch (error) {
      logger.error("FounderKnowledge: Error storing manifesto", error);
    }
  }
}

// Type definitions
interface SpiralogicInsights {
  elements: {
    [key: string]: ElementDefinition;
  };
  spiralDynamics: string;
  integrationPrinciples: string[];
  practicalApplications: string[];
}

interface ElementDefinition {
  name: string;
  aspect: string;
  description: string;
  quadrant: string;
  brainFunction: string;
}

// Export singleton instance
export const founderKnowledgeService = new FounderKnowledgeService();

/**
 * 🌀 FOUNDER KNOWLEDGE SERVICE
 *
 * This service processes organizational wisdom documents and integrates them
 * into the Founder Agent's knowledge base. It:
 *
 * 1. Parses manifestos and extracts structured insights
 * 2. Identifies core principles and elemental mappings
 * 3. Updates the agent's knowledge repository
 * 4. Maintains version history and accessibility levels
 *
 * The Spiralogic Process Manifesto integration extracts:
 * - Elemental quadrants and their meanings
 * - Spiral movement dynamics
 * - Core integration principles
 * - Brain function mappings
 * - Alchemical refinement process
 */
