/**
 * Copyright © 2025 Soullab® Inc.
 * All Rights Reserved.
 *
 * PDF KNOWLEDGE LOADER
 * Extracts wisdom from Kelly's reference library for MAIA's Complete tier intelligence
 *
 * Human-Authored IP: Kelly Nezat's curated library
 * Implementation: Built with Claude Code assistance
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * A single book/document from Kelly's library
 */
export interface ReferenceBook {
  id: string;
  title: string;
  filepath: string;
  author?: string;
  category: BookCategory;
  textContent: string;
  metadata: {
    pageCount?: number;
    wordCount: number;
    extractionDate: Date;
    relevanceScore: number;
    topics: string[];
  };
}

/**
 * Book categories aligned with MAIA's knowledge domains
 */
export type BookCategory =
  | 'jung'                    // Jungian psychology and alchemy
  | 'hillman'                 // Archetypal psychology
  | 'family_constellations'   // Systemic work
  | 'astrology'               // Astrological frameworks
  | 'i_ching'                 // I Ching philosophy
  | 'human_design'            // Human Design system
  | 'reiki'                   // Energy healing
  | 'alchemy'                 // Alchemical traditions
  | 'consciousness'           // General consciousness studies
  | 'other';

/**
 * Curated excerpt from a book
 */
export interface BookExcerpt {
  bookId: string;
  bookTitle: string;
  category: BookCategory;
  excerpt: string;
  wordCount: number;
  relevanceScore: number;
  topics: string[];
  context?: string;           // Why this excerpt matters for MAIA
}

/**
 * Configuration for PDF loading
 */
export interface PDFLoaderConfig {
  libraryPath: string;
  maxBooksToLoad?: number;
  maxWordsPerBook?: number;   // Limit extraction per book
  minRelevanceScore?: number; // Only load highly relevant books
  priorityCategories?: BookCategory[];
  forceIncludeFiles?: string[]; // File patterns to force-include regardless of relevance score
}

/**
 * PDF Knowledge Loader - Extracts wisdom from Kelly's reference library
 */
export class PDFKnowledgeLoader {
  private config: PDFLoaderConfig;

  constructor(config: PDFLoaderConfig) {
    this.config = {
      maxBooksToLoad: 30,        // Increased for broader coverage
      maxWordsPerBook: 5000,     // ~20 pages per book
      minRelevanceScore: 0.5,    // Lowered to include more traditions
      priorityCategories: ['jung', 'hillman', 'alchemy', 'family_constellations', 'astrology', 'i_ching', 'human_design'],
      ...config,
    };
  }

  /**
   * Load all reference books from library
   */
  async loadAll(): Promise<ReferenceBook[]> {
    console.log(`📚 [PDF LOADER] Loading from: ${this.config.libraryPath}`);

    // Find all PDFs
    const pdfFiles = await this.findPDFFiles(this.config.libraryPath);
    console.log(`📄 [PDF LOADER] Found ${pdfFiles.length} PDF files`);

    const books: ReferenceBook[] = [];

    for (const filepath of pdfFiles) {
      try {
        const book = await this.loadBook(filepath);

        // Apply relevance filter (or force-include)
        const isForceIncluded = this.config.forceIncludeFiles?.some(pattern =>
          filepath.toLowerCase().includes(pattern.toLowerCase())
        );

        if (isForceIncluded || book.metadata.relevanceScore >= (this.config.minRelevanceScore || 0)) {
          if (isForceIncluded && book.metadata.relevanceScore < (this.config.minRelevanceScore || 0)) {
            console.log(`✨ [PDF LOADER] Force-including: ${book.title} (score: ${book.metadata.relevanceScore})`);
          }
          books.push(book);
        } else {
          console.log(`⏭️  [PDF LOADER] Skipping low-relevance: ${book.title} (score: ${book.metadata.relevanceScore})`);
        }
      } catch (error) {
        console.warn(`⚠️  [PDF LOADER] Failed to load ${path.basename(filepath)}:`, error);
      }
    }

    console.log(`✅ [PDF LOADER] Loaded ${books.length} books (after relevance filtering)`);

    return books;
  }

  /**
   * Load a single PDF book
   */
  private async loadBook(filepath: string): Promise<ReferenceBook> {
    const filename = path.basename(filepath, '.pdf');

    console.log(`📖 [PDF LOADER] Extracting text from: ${filename}`);

    // Extract text from PDF using pdftotext (part of poppler-utils)
    // This is a standard macOS/Linux utility for PDF text extraction
    const textContent = await this.extractTextFromPDF(filepath);

    // Parse metadata from filename
    const { author, title } = this.parseFilename(filename);
    const category = this.categorizeBook(filename, textContent);
    const topics = this.extractTopics(textContent, category);

    // Calculate relevance score
    const relevanceScore = this.calculateRelevance(category, topics, textContent);

    // Truncate to max words if needed
    const truncatedContent = this.truncateContent(textContent, this.config.maxWordsPerBook || 5000);
    const wordCount = truncatedContent.split(/\s+/).length;

    return {
      id: this.generateId(filename),
      title,
      filepath,
      author,
      category,
      textContent: truncatedContent,
      metadata: {
        wordCount,
        extractionDate: new Date(),
        relevanceScore,
        topics,
      },
    };
  }

  /**
   * Extract text from PDF or TXT file
   */
  private async extractTextFromPDF(filepath: string): Promise<string> {
    // If it's a .txt file, just read it directly
    if (filepath.toLowerCase().endsWith('.txt')) {
      try {
        const content = await fs.readFile(filepath, 'utf-8');
        return content;
      } catch (error) {
        throw new Error(`Could not read text file: ${filepath}`);
      }
    }

    // For PDFs, use pdftotext
    try {
      // Try using pdftotext (comes with most macOS systems via Homebrew poppler)
      const { stdout } = await execAsync(`pdftotext "${filepath}" -`);
      return stdout;
    } catch (error) {
      // Fallback: Try using macOS's built-in textutil
      try {
        const { stdout } = await execAsync(`textutil -convert txt -stdout "${filepath}"`);
        return stdout;
      } catch (fallbackError) {
        throw new Error(`Could not extract text from PDF: ${filepath}. Install poppler-utils: brew install poppler`);
      }
    }
  }

  /**
   * Parse author and title from filename
   * Format: "123456-Author-Name-Book-Title.pdf"
   */
  private parseFilename(filename: string): { author?: string; title: string } {
    // Remove leading numbers (e.g., "123456-")
    const cleaned = filename.replace(/^\d+-/, '');

    // Common patterns
    const jungPattern = /jung/i;
    const hillmanPattern = /hillman/i;
    const eddingerPattern = /edinger/i;

    let author: string | undefined;
    let title = cleaned;

    if (jungPattern.test(cleaned)) {
      author = 'Carl Jung';
    } else if (hillmanPattern.test(cleaned)) {
      author = 'James Hillman';
    } else if (eddingerPattern.test(cleaned)) {
      author = 'Edward Edinger';
    }

    // Clean up title (replace hyphens with spaces, trim)
    title = cleaned.replace(/-/g, ' ').trim();

    return { author, title };
  }

  /**
   * Categorize book based on filename and content
   */
  private categorizeBook(filename: string, content: string): BookCategory {
    const lower = (filename + ' ' + content.substring(0, 2000)).toLowerCase();

    // Category detection patterns
    if (lower.includes('jung') || lower.includes('red book') || lower.includes('liber novus')) {
      return 'jung';
    }
    if (lower.includes('hillman') || lower.includes('archetypal psychology')) {
      return 'hillman';
    }
    if (lower.includes('family constellation') || lower.includes('hellinger') || lower.includes('systemic')) {
      return 'family_constellations';
    }
    if (lower.includes('astrology') || lower.includes('astrological') || lower.includes('planets')) {
      return 'astrology';
    }
    if (lower.includes('i ching') || lower.includes('i-ching') || lower.includes('book of changes')) {
      return 'i_ching';
    }
    if (lower.includes('human design') || lower.includes('ra uru hu') || lower.includes('rave')) {
      return 'human_design';
    }
    if (lower.includes('reiki') || lower.includes('energy healing')) {
      return 'reiki';
    }
    if (lower.includes('alchemy') || lower.includes('alchemical')) {
      return 'alchemy';
    }
    if (lower.includes('consciousness') || lower.includes('awareness') || lower.includes('individuation')) {
      return 'consciousness';
    }

    return 'other';
  }

  /**
   * Extract topics from book content
   */
  private extractTopics(content: string, category: BookCategory): string[] {
    const topics: string[] = [];
    const lower = content.toLowerCase();

    // Topic patterns
    const topicPatterns: Record<string, RegExp[]> = {
      archetypes: [/archetype/i, /anima/i, /animus/i, /shadow/i, /self/i],
      individuation: [/individuation/i, /wholeness/i, /integration/i],
      alchemy: [/alchemy/i, /conjunctio/i, /nigredo/i, /albedo/i, /rubedo/i],
      collective_unconscious: [/collective unconscious/i, /universal/i],
      synchronicity: [/synchronicity/i, /meaningful coincidence/i],
      symbols: [/symbol/i, /symbolic/i, /image/i, /imagination/i],
      transformation: [/transformation/i, /metamorphosis/i, /change/i],
      soul: [/soul/i, /psyche/i, /spirit/i],
      mythology: [/myth/i, /mythological/i, /gods/i, /goddess/i],
      healing: [/healing/i, /therapeutic/i, /therapy/i],
      systemic: [/systemic/i, /system/i, /family system/i],
      energy: [/energy/i, /chakra/i, /meridian/i],
    };

    for (const [topic, patterns] of Object.entries(topicPatterns)) {
      if (patterns.some(pattern => pattern.test(lower))) {
        topics.push(topic);
      }
    }

    // Always include category as topic
    topics.push(category);

    return [...new Set(topics)]; // Remove duplicates
  }

  /**
   * Calculate relevance score for MAIA's knowledge
   */
  private calculateRelevance(
    category: BookCategory,
    topics: string[],
    content: string
  ): number {
    let score = 0;

    // Category priority
    const priorityCategories = this.config.priorityCategories || [];
    if (priorityCategories.includes(category)) {
      score += 0.4;
    }

    // Topic diversity (more topics = more connections)
    score += Math.min(topics.length * 0.05, 0.3);

    // Key concepts already in MAIA's knowledge
    const keyConceptPatterns = [
      /spiralogic/i,
      /elemental/i,
      /consciousness/i,
      /transformation/i,
      /archetypal/i,
      /collective unconscious/i,
      /individuation/i,
      /alchemy/i,
      /mysterium/i,
      /conjunctio/i,
    ];

    const conceptMatches = keyConceptPatterns.filter(pattern =>
      pattern.test(content)
    ).length;

    score += Math.min(conceptMatches * 0.05, 0.3);

    return Math.min(score, 1.0); // Cap at 1.0
  }

  /**
   * Truncate content to max words while preserving complete sentences
   */
  private truncateContent(content: string, maxWords: number): string {
    const words = content.split(/\s+/);

    if (words.length <= maxWords) {
      return content;
    }

    // Find sentence boundary near maxWords
    const truncated = words.slice(0, maxWords).join(' ');
    const lastPeriod = truncated.lastIndexOf('.');

    if (lastPeriod > truncated.length * 0.8) {
      // If we're close to a sentence end, truncate there
      return truncated.substring(0, lastPeriod + 1);
    }

    // Otherwise just truncate at word boundary
    return truncated + '...';
  }

  /**
   * Find all PDF and TXT files in library
   */
  private async findPDFFiles(dir: string): Promise<string[]> {
    const files: string[] = [];

    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        // Skip hidden files
        if (entry.name.startsWith('.')) {
          continue;
        }

        const lowerName = entry.name.toLowerCase();
        if (entry.isFile() && (lowerName.endsWith('.pdf') || lowerName.endsWith('.txt'))) {
          files.push(fullPath);
        } else if (entry.isDirectory()) {
          // Recursively search subdirectories
          const subFiles = await this.findPDFFiles(fullPath);
          files.push(...subFiles);
        }
      }
    } catch (error) {
      console.warn(`⚠️  [PDF LOADER] Could not read directory: ${dir}`);
    }

    return files;
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
   * Curate: Select best books based on priority
   */
  async selectBest(): Promise<ReferenceBook[]> {
    const allBooks = await this.loadAll();

    // Deduplicate by content similarity (remove duplicate files)
    const deduplicated = this.deduplicateBooks(allBooks);
    console.log(`🔍 [PDF LOADER] Deduplicated: ${allBooks.length} → ${deduplicated.length} books`);

    // Sort by relevance score (highest first)
    const sorted = deduplicated.sort((a, b) =>
      b.metadata.relevanceScore - a.metadata.relevanceScore
    );

    // Limit to max books
    const limited = sorted.slice(0, this.config.maxBooksToLoad || 20);

    console.log(`🎯 [PDF LOADER] Curated ${limited.length} best books`);
    console.log(`📊 [PDF LOADER] Categories: ${this.getCategoryBreakdown(limited)}`);

    return limited;
  }

  /**
   * Deduplicate books by content similarity
   * Removes duplicate files (e.g., "book.pdf" and "book (1).pdf")
   */
  private deduplicateBooks(books: ReferenceBook[]): ReferenceBook[] {
    const seen = new Map<string, ReferenceBook>();

    for (const book of books) {
      // Create a normalized key from title (remove numbers, spaces, special chars)
      const normalizedTitle = book.title
        .toLowerCase()
        .replace(/\(?\d+\)?/g, '')  // Remove numbers and (1), (2), etc.
        .replace(/[^a-z0-9]/g, '')   // Remove special characters
        .trim();

      // If we haven't seen this title, add it
      if (!seen.has(normalizedTitle)) {
        seen.set(normalizedTitle, book);
      } else {
        // If we have seen it, keep the one with higher relevance score
        const existing = seen.get(normalizedTitle)!;
        if (book.metadata.relevanceScore > existing.metadata.relevanceScore) {
          seen.set(normalizedTitle, book);
        }
        console.log(`   Duplicate removed: "${book.title}" (keeping better version)`);
      }
    }

    return Array.from(seen.values());
  }

  /**
   * Get category breakdown for logging
   */
  private getCategoryBreakdown(books: ReferenceBook[]): string {
    const counts: Record<string, number> = {};

    for (const book of books) {
      counts[book.category] = (counts[book.category] || 0) + 1;
    }

    return Object.entries(counts)
      .map(([cat, count]) => `${cat}(${count})`)
      .join(', ');
  }

  /**
   * Format books for inclusion in MAIA's Complete tier Revival System
   */
  formatForRevivalPrompt(books: ReferenceBook[]): string {
    let prompt = '\n\n## REFERENCE LIBRARY - KELLY\'S CURATED WISDOM\n\n';
    prompt += '*These are excerpts from Kelly\'s reference library representing the frameworks and wisdom traditions that inform MAIA\'s intelligence. You have read and internalized these teachings.*\n\n';
    prompt += '---\n\n';

    // Group by category
    const byCategory: Record<BookCategory, ReferenceBook[]> = {} as any;

    for (const book of books) {
      if (!byCategory[book.category]) {
        byCategory[book.category] = [];
      }
      byCategory[book.category].push(book);
    }

    // Format each category
    for (const [category, categoryBooks] of Object.entries(byCategory)) {
      prompt += `### ${this.categoryDisplayName(category as BookCategory)}\n\n`;

      for (const book of categoryBooks) {
        prompt += `**${book.title}**`;
        if (book.author) {
          prompt += ` by ${book.author}`;
        }
        prompt += `\n\n`;

        if (book.metadata.topics && book.metadata.topics.length > 0) {
          prompt += `*Topics: ${book.metadata.topics.join(', ')}*\n\n`;
        }

        // Include excerpt (first 2000 words max for each book in prompt)
        const excerpt = book.textContent.split(/\s+/).slice(0, 2000).join(' ');
        prompt += excerpt;

        if (book.textContent.split(/\s+/).length > 2000) {
          prompt += '...\n\n';
        } else {
          prompt += '\n\n';
        }

        prompt += '---\n\n';
      }
    }

    prompt += '\n**Remember:** You have absorbed this wisdom. Speak FROM this understanding, not ABOUT it. These frameworks inform your perception but you don\'t cite them like references.\n\n';

    return prompt;
  }

  /**
   * Get display name for category
   */
  private categoryDisplayName(category: BookCategory): string {
    const names: Record<BookCategory, string> = {
      jung: 'Jungian Psychology & Alchemy',
      hillman: 'Archetypal Psychology (James Hillman)',
      family_constellations: 'Family Constellations & Systemic Work',
      astrology: 'Astrological Frameworks',
      i_ching: 'I Ching Philosophy',
      human_design: 'Human Design System',
      reiki: 'Energy Healing & Reiki',
      alchemy: 'Alchemical Traditions',
      consciousness: 'Consciousness Studies',
      other: 'Additional References',
    };

    return names[category] || category;
  }

  /**
   * Get statistics about loaded books
   */
  async getStats(): Promise<{
    totalBooks: number;
    totalWords: number;
    byCategory: Record<BookCategory, number>;
    byTopic: Record<string, number>;
    averageRelevance: number;
  }> {
    const books = await this.selectBest();

    const stats = {
      totalBooks: books.length,
      totalWords: books.reduce((sum, b) => sum + b.metadata.wordCount, 0),
      byCategory: {} as Record<BookCategory, number>,
      byTopic: {} as Record<string, number>,
      averageRelevance: 0,
    };

    let relevanceSum = 0;

    for (const book of books) {
      // Count by category
      stats.byCategory[book.category] = (stats.byCategory[book.category] || 0) + 1;

      // Count by topic
      for (const topic of book.metadata.topics || []) {
        stats.byTopic[topic] = (stats.byTopic[topic] || 0) + 1;
      }

      relevanceSum += book.metadata.relevanceScore;
    }

    stats.averageRelevance = relevanceSum / books.length;

    return stats;
  }
}

/**
 * Example usage:
 *
 * const loader = new PDFKnowledgeLoader({
 *   libraryPath: '/Users/soullab/Documents/Books',
 *   maxBooksToLoad: 20,
 *   maxWordsPerBook: 5000,
 *   minRelevanceScore: 0.7,
 *   priorityCategories: ['jung', 'hillman', 'alchemy', 'family_constellations'],
 * });
 *
 * const bestBooks = await loader.selectBest();
 * const revivalPrompt = loader.formatForRevivalPrompt(bestBooks);
 *
 * // Save to Complete tier
 * await fs.writeFile('./prompts/revival/tier3-complete-reference-library.txt', revivalPrompt);
 */
