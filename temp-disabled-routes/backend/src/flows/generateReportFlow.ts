import fs from "fs/promises";
import path from "path";
import { openai } from "../lib/openaiClient";
import { logger } from "../lib/logger";
import {
  SpiralogicReportInput,
  SpiralogicReportOutput,
  ChartData,
  ArchetypalElement,
} from "../types/oracle";

export class GenerateReportFlow {
  private promptTemplate: string;

  constructor() {
    this.promptTemplate = "";
    this.loadPromptTemplate();
  }

  private async loadPromptTemplate() {
    try {
      const promptPath = path.join(
        __dirname,
        "../core/agents/prompts/spiralogic-report.prompt",
      );
      this.promptTemplate = await fs.readFile(promptPath, "utf-8");
      logger.info("Spiralogic report prompt template loaded successfully");
    } catch (error) {
      logger.error("Failed to load report prompt template:", error);
    }
  }

  /**
   * Generate a personalized Spiralogic Astrology Report
   */
  async generateReport(
    input: SpiralogicReportInput,
  ): Promise<SpiralogicReportOutput> {
    try {
      logger.info(`Generating Spiralogic report for ${input.name}`);

      // Ensure prompt template is loaded
      if (!this.promptTemplate) {
        await this.loadPromptTemplate();
      }

      // Prepare the formatted input
      const formattedInput = this.formatInputForPrompt(input);

      // Call OpenAI with the prompt
      const response = await openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [
          {
            role: "system",
            content: this.promptTemplate,
          },
          {
            role: "user",
            content: `Generate a Spiralogic Astrology Report for:\n${JSON.stringify(formattedInput, null, 2)}`,
          },
        ],
        temperature: 0.8,
        max_tokens: 4000,
        presence_penalty: 0.6,
        frequency_penalty: 0.3,
      });

      const reportContent = response.choices[0]?.message?.content || "";

      // Parse the report into sections
      const sections = this.parseReportSections(reportContent);

      // Generate metadata
      const metadata = this.generateReportMetadata(input, sections);

      return {
        success: true,
        report: {
          content: reportContent,
          sections,
          metadata,
          generatedAt: new Date().toISOString(),
          version: "1.0.0",
        },
      };
    } catch (error) {
      logger.error("Error generating Spiralogic report:", error);
      throw new Error(`Failed to generate report: ${error.message}`);
    }
  }

  /**
   * Format input data for the prompt
   */
  private formatInputForPrompt(input: SpiralogicReportInput) {
    return {
      name: input.name,
      birth: {
        date: input.birthDate,
        time: input.birthTime,
        location: input.birthLocation,
      },
      chartData: {
        sun: input.chartData.sun,
        moon: input.chartData.moon,
        rising: input.chartData.rising,
        northNode: input.chartData.northNode,
        southNode: input.chartData.southNode,
        elements: {
          dominant: input.dominantElement,
          underactive: input.underactiveElement,
        },
        archetypes: input.archetypes,
      },
      lifeStage: input.lifeStage,
      personalityNotes: input.personalityNotes || [],
    };
  }

  /**
   * Parse report content into structured sections
   */
  private parseReportSections(content: string): Record<string, string> {
    const sections: Record<string, string> = {};

    // Define section markers
    const sectionMarkers = [
      "Soul's Welcome Message",
      "Mythic Chart Narrative",
      "Soul Journey Arc",
      "Elemental Alchemy",
      "Archetypal Trinity",
      "Spiralogic Seasonal Timeline",
      "Sacred Practices & Rituals",
      "The Hero/ine's Journey Blessing",
    ];

    let currentSection = "introduction";
    let currentContent = "";

    const lines = content.split("\n");

    for (const line of lines) {
      // Check if this line contains a section marker
      const matchedSection = sectionMarkers.find(
        (marker) =>
          line.includes(marker) ||
          line.toLowerCase().includes(marker.toLowerCase()),
      );

      if (matchedSection) {
        // Save previous section
        if (currentContent.trim()) {
          sections[currentSection] = currentContent.trim();
        }

        // Start new section
        currentSection = this.slugify(matchedSection);
        currentContent = "";
      } else {
        currentContent += line + "\n";
      }
    }

    // Save the last section
    if (currentContent.trim()) {
      sections[currentSection] = currentContent.trim();
    }

    return sections;
  }

  /**
   * Generate metadata for the report
   */
  private generateReportMetadata(
    input: SpiralogicReportInput,
    sections: Record<string, string>,
  ) {
    return {
      userId: input.userId,
      reportType: "spiralogic-astrology",
      birthChart: {
        date: input.birthDate,
        time: input.birthTime,
        location: input.birthLocation,
        timezone: input.timezone,
      },
      elements: {
        dominant: input.dominantElement,
        underactive: input.underactiveElement,
      },
      archetypes: input.archetypes,
      lifeStage: input.lifeStage,
      sectionCount: Object.keys(sections).length,
      wordCount: Object.values(sections).join(" ").split(" ").length,
      generationModel: "gpt-4-turbo-preview",
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Generate a PDF version of the report
   */
  async generatePDF(reportContent: string, metadata: any): Promise<Buffer> {
    // This would integrate with your existing PDF generation service
    // For now, returning a placeholder
    logger.info("PDF generation requested for Spiralogic report");

    // TODO: Integrate with spiralogicReportPdfService
    return Buffer.from("PDF generation not yet implemented");
  }

  /**
   * Save report to database
   */
  async saveReport(
    userId: string,
    report: SpiralogicReportOutput["report"],
  ): Promise<string> {
    // TODO: Integrate with Supabase to save the report
    logger.info(`Saving report for user ${userId}`);

    // This would save to a reports table
    // Return the report ID
    return `report_${Date.now()}`;
  }

  /**
   * Convert string to slug
   */
  private slugify(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }

  /**
   * Enhance report with ritual recommendations
   */
  async enhanceWithRituals(
    report: SpiralogicReportOutput["report"],
    userElements: { dominant: string; underactive: string },
  ): Promise<SpiralogicReportOutput["report"]> {
    // Add specific ritual recommendations based on elements
    const ritualEnhancements = {
      fire: "🔥 Morning sun salutation with candle meditation",
      water: "💧 Moon water creation and emotional flow journaling",
      earth: "🌿 Grounding barefoot walks and crystal grid creation",
      air: "💨 Breathwork practices and sacred smoke ceremonies",
      aether: "✨ Void meditation and quantum field attunement",
    };

    const enhancedSections = { ...report.sections };

    if (enhancedSections["sacred-practices-rituals"]) {
      enhancedSections["sacred-practices-rituals"] +=
        `\n\n## Elemental Balance Rituals\n`;
      enhancedSections["sacred-practices-rituals"] +=
        `\n**For your dominant ${userElements.dominant} element:**\n`;
      enhancedSections["sacred-practices-rituals"] +=
        ritualEnhancements[userElements.dominant.toLowerCase()] || "";
      enhancedSections["sacred-practices-rituals"] +=
        `\n\n**To activate your underactive ${userElements.underactive} element:**\n`;
      enhancedSections["sacred-practices-rituals"] +=
        ritualEnhancements[userElements.underactive.toLowerCase()] || "";
    }

    return {
      ...report,
      sections: enhancedSections,
    };
  }
}
