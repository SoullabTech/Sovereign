/**
 * Copyright © 2025 Soullab® Inc.
 * All Rights Reserved.
 *
 * KELLY↔CLAUDE DIALOGUE LOADER
 * Loads teaching dialogues from AIN vault for MAIA's Complete tier intelligence
 *
 * Human-Authored IP: Kelly Nezat, 2025
 * Implementation: Built with Claude Code assistance
 */

import * as fs from 'fs/promises';
import * as path from 'path';

/**
 * A single dialogue from Kelly↔Claude conversations
 */
export interface TeachingDialogue {
  id: string;
  title: string;
  filepath: string;
  content: string;
  metadata: {
    dateCreated?: Date;
    wordCount: number;
    topics?: string[];          // Extracted themes (myth, consciousness, etc.)
    dialogueType?: string;      // teaching, session, philosophical, technical
  };
}

/**
 * Configuration for dialogue loading
 */
export interface DialogueLoaderConfig {
  vaultPath: string;            // Path to AIN Obsidian vault
  maxDialogues?: number;        // Limit how many to load
  minWordCount?: number;        // Ignore short notes
  excludePatterns?: string[];   // Filenames to skip
  includeSubdirectories?: boolean;
}

/**
 * Curated selection criteria for best dialogues
 */
export interface DialogueSelectionCriteria {
  topics?: string[];            // Required topics (e.g., ['consciousness', 'myth'])
  minDepth?: number;            // Minimum philosophical depth (0-1)
  maxLength?: number;           // Skip overly long dialogues
  preferenceScore?: (dialogue: TeachingDialogue) => number; // Custom scoring
}

/**
 * Dialogue Loader - Loads Kelly↔Claude teaching conversations from AIN vault
 */
export class DialogueLoader {
  private config: DialogueLoaderConfig;

  constructor(config: DialogueLoaderConfig) {
    this.config = {
      maxDialogues: 50,          // Default: load 50 best dialogues
      minWordCount: 500,          // Default: skip short notes
      excludePatterns: ['Untitled', 'test', 'draft'],
      includeSubdirectories: false,
      ...config,
    };
  }

  /**
   * Load all dialogues from vault
   */
  async loadAll(): Promise<TeachingDialogue[]> {
    console.log(`📚 Loading dialogues from: ${this.config.vaultPath}`);

    // Get all markdown files
    const files = await this.findMarkdownFiles(this.config.vaultPath);
    console.log(`📄 Found ${files.length} markdown files`);

    // Load and parse each file
    const dialogues: TeachingDialogue[] = [];

    for (const filepath of files) {
      try {
        const dialogue = await this.loadDialogue(filepath);

        // Apply filters
        if (this.shouldInclude(dialogue)) {
          dialogues.push(dialogue);
        }
      } catch (error) {
        console.warn(`⚠️  Failed to load ${path.basename(filepath)}:`, error);
      }
    }

    console.log(`✅ Loaded ${dialogues.length} dialogues (after filtering)`);

    return dialogues;
  }

  /**
   * Load a single dialogue file
   */
  private async loadDialogue(filepath: string): Promise<TeachingDialogue> {
    const content = await fs.readFile(filepath, 'utf-8');
    const filename = path.basename(filepath, '.md');

    // Extract metadata
    const stats = await fs.stat(filepath);
    const wordCount = content.split(/\s+/).length;
    const topics = this.extractTopics(content);
    const dialogueType = this.classifyDialogue(filename, content);

    return {
      id: this.generateId(filename),
      title: filename,
      filepath,
      content,
      metadata: {
        dateCreated: stats.birthtime,
        wordCount,
        topics,
        dialogueType,
      },
    };
  }

  /**
   * Find all markdown files in vault
   */
  private async findMarkdownFiles(dir: string): Promise<string[]> {
    const files: string[] = [];

    const entries = await fs.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      // Skip metadata files (._*), .obsidian, etc.
      if (entry.name.startsWith('._') || entry.name.startsWith('.')) {
        continue;
      }

      if (entry.isDirectory() && this.config.includeSubdirectories) {
        const subFiles = await this.findMarkdownFiles(fullPath);
        files.push(...subFiles);
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        files.push(fullPath);
      }
    }

    return files;
  }

  /**
   * Determine if dialogue should be included
   */
  private shouldInclude(dialogue: TeachingDialogue): boolean {
    // Check word count
    if (dialogue.metadata.wordCount < (this.config.minWordCount || 0)) {
      return false;
    }

    // Check exclude patterns
    for (const pattern of this.config.excludePatterns || []) {
      if (dialogue.title.toLowerCase().includes(pattern.toLowerCase())) {
        return false;
      }
    }

    return true;
  }

  /**
   * Extract topics from dialogue content
   */
  private extractTopics(content: string): string[] {
    const topics: string[] = [];
    const lower = content.toLowerCase();

    // Topic detection patterns
    const topicPatterns: Record<string, RegExp[]> = {
      consciousness: [/consciousness/i, /awareness/i, /presence/i],
      myth: [/myth/i, /archetypal/i, /jung/i, /collective unconscious/i],
      spiralogic: [/spiralogic/i, /elemental/i, /fire.*water.*earth.*air/i],
      philosophy: [/philosophy/i, /metaphysics/i, /ontology/i],
      transformation: [/transformation/i, /breakthrough/i, /integration/i],
      embodiment: [/embodiment/i, /somatic/i, /body/i],
      session: [/session/i, /client/i, /facilitation/i],
      technical: [/code/i, /implementation/i, /api/i, /database/i],
      maia_development: [/maia/i, /oracle/i, /platform/i],
    };

    for (const [topic, patterns] of Object.entries(topicPatterns)) {
      if (patterns.some(pattern => pattern.test(lower))) {
        topics.push(topic);
      }
    }

    return topics;
  }

  /**
   * Classify dialogue type
   */
  private classifyDialogue(filename: string, content: string): string {
    const lower = filename.toLowerCase() + ' ' + content.toLowerCase();

    if (lower.includes('session') || lower.includes('client')) {
      return 'session';
    }
    if (lower.includes('philosophy') || lower.includes('consciousness')) {
      return 'philosophical';
    }
    if (lower.includes('code') || lower.includes('implementation')) {
      return 'technical';
    }
    if (lower.includes('myth') || lower.includes('archetypal')) {
      return 'teaching';
    }

    return 'general';
  }

  /**
   * Generate unique ID from filename
   */
  private generateId(filename: string): string {
    return filename
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  /**
   * Curate: Select best dialogues based on criteria
   */
  async selectBest(
    criteria: DialogueSelectionCriteria
  ): Promise<TeachingDialogue[]> {
    const allDialogues = await this.loadAll();

    let filtered = allDialogues;

    // Filter by topics
    if (criteria.topics && criteria.topics.length > 0) {
      filtered = filtered.filter(d =>
        criteria.topics!.some(topic => d.metadata.topics?.includes(topic))
      );
    }

    // Filter by length
    if (criteria.maxLength) {
      filtered = filtered.filter(d => d.metadata.wordCount <= criteria.maxLength!);
    }

    // Score and sort
    if (criteria.preferenceScore) {
      filtered.sort((a, b) => {
        const scoreA = criteria.preferenceScore!(a);
        const scoreB = criteria.preferenceScore!(b);
        return scoreB - scoreA; // Highest score first
      });
    } else {
      // Default: sort by word count (longer = more substantive)
      filtered.sort((a, b) => b.metadata.wordCount - a.metadata.wordCount);
    }

    // Limit to max dialogues
    if (this.config.maxDialogues) {
      filtered = filtered.slice(0, this.config.maxDialogues);
    }

    console.log(`🎯 Curated ${filtered.length} best dialogues`);

    return filtered;
  }

  /**
   * Format dialogues for inclusion in MAIA's system prompt
   */
  formatForRevivalPrompt(dialogues: TeachingDialogue[]): string {
    let prompt = '\n\n## KELLY↔CLAUDE TEACHING DIALOGUES\n\n';
    prompt += '*These are actual conversations between Kelly and Claude, demonstrating Kelly\'s teaching style, philosophical depth, and facilitation approach.*\n\n';
    prompt += '---\n\n';

    for (const dialogue of dialogues) {
      prompt += `### ${dialogue.title}\n\n`;

      if (dialogue.metadata.topics && dialogue.metadata.topics.length > 0) {
        prompt += `**Topics:** ${dialogue.metadata.topics.join(', ')}\n\n`;
      }

      // Include full dialogue content
      prompt += dialogue.content;

      prompt += '\n\n---\n\n';
    }

    return prompt;
  }

  /**
   * Get statistics about loaded dialogues
   */
  async getStats(): Promise<{
    totalDialogues: number;
    totalWords: number;
    byTopic: Record<string, number>;
    byType: Record<string, number>;
  }> {
    const dialogues = await this.loadAll();

    const stats = {
      totalDialogues: dialogues.length,
      totalWords: dialogues.reduce((sum, d) => sum + d.metadata.wordCount, 0),
      byTopic: {} as Record<string, number>,
      byType: {} as Record<string, number>,
    };

    for (const dialogue of dialogues) {
      // Count by topic
      for (const topic of dialogue.metadata.topics || []) {
        stats.byTopic[topic] = (stats.byTopic[topic] || 0) + 1;
      }

      // Count by type
      const type = dialogue.metadata.dialogueType || 'unknown';
      stats.byType[type] = (stats.byType[type] || 0) + 1;
    }

    return stats;
  }
}

/**
 * Example usage:
 *
 * const loader = new DialogueLoader({
 *   vaultPath: '/path/to/AIN/vault',
 *   maxDialogues: 30,
 *   minWordCount: 1000,
 * });
 *
 * // Load best philosophical and teaching dialogues
 * const bestDialogues = await loader.selectBest({
 *   topics: ['consciousness', 'myth', 'transformation'],
 *   maxLength: 20000, // Skip very long dialogues
 *   preferenceScore: (d) => {
 *     // Prefer recent, substantive, philosophical dialogues
 *     let score = 0;
 *     if (d.metadata.dialogueType === 'philosophical') score += 2;
 *     if (d.metadata.dialogueType === 'teaching') score += 1.5;
 *     if (d.metadata.wordCount > 5000) score += 1;
 *     return score;
 *   },
 * });
 *
 * // Format for MAIA's revival prompt
 * const revivalPrompt = loader.formatForRevivalPrompt(bestDialogues);
 *
 * // Save to Complete tier
 * await fs.writeFile('./prompts/revival/tier3-complete-dialogues.txt', revivalPrompt);
 */
