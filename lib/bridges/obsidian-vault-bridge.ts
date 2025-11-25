/**
 * OBSIDIAN VAULT BRIDGE
 *
 * Connects to your Obsidian knowledge base for:
 * - Vector semantic search
 * - Knowledge graph traversal
 * - RAG (Retrieval Augmented Generation)
 * - Note connections and backlinks
 * - Tag-based wisdom retrieval
 */

import * as fs from 'fs';
import * as path from 'path';
import { createHash } from 'crypto';

export interface VaultConfig {
  vaultPath: string;
  cacheEnabled: boolean;
  vectorDBPath?: string;
  indexUpdateInterval?: number;
}

export interface KnowledgeQuery {
  context: string;
  memories?: any;
  semanticSearch?: boolean;
  maxResults?: number;
  tags?: string[];
  noteTypes?: string[];
}

export interface KnowledgeResult {
  knowledge: NoteContent[];
  connections: Connection[];
  relevance: number;
  tags: string[];
}

export interface NoteContent {
  title: string;
  content: string;
  path: string;
  tags: string[];
  backlinks: string[];
  frontmatter: any;
  relevance?: number;
}

export interface Connection {
  from: string;
  to: string;
  type: string;
  strength: number;
}

export class ObsidianVaultBridge {
  private config: VaultConfig;
  private noteCache: Map<string, NoteContent> = new Map();
  private graphCache: Map<string, Connection[]> = new Map();
  private initialized: boolean = false;
  private lastIndexTime: number = 0;

  constructor(config?: Partial<VaultConfig>) {
    this.config = {
      vaultPath: process.env.OBSIDIAN_VAULT_PATH || '',
      cacheEnabled: true,
      vectorDBPath: process.env.VECTOR_DB_PATH || './vectors',
      indexUpdateInterval: 3600000, // 1 hour
      ...config
    };
  }

  /**
   * Connect to Obsidian Vault
   */
  async connect(): Promise<void> {
    console.log('📚 Establishing Obsidian Vault connection...');

    // Verify vault exists
    if (!this.config.vaultPath) {
      console.warn('⚠️ No Obsidian vault path configured');
      this.initialized = true; // Allow operation without vault
      return;
    }

    if (!fs.existsSync(this.config.vaultPath)) {
      console.warn(`⚠️ Obsidian vault not found at: ${this.config.vaultPath}`);
      this.initialized = true;
      return;
    }

    // Index the vault
    await this.indexVault();

    // Set up file watchers for real-time updates
    if (this.config.cacheEnabled) {
      this.setupFileWatchers();
    }

    this.initialized = true;
    console.log('✓ Obsidian Vault connected successfully');
  }

  /**
   * Query the knowledge base
   */
  async query(query: KnowledgeQuery): Promise<KnowledgeResult> {
    if (!this.initialized) {
      await this.connect();
    }

    console.log('🔍 Querying Obsidian Vault...');

    // Perform different types of search
    let results: NoteContent[] = [];

    if (query.semanticSearch) {
      results = await this.semanticSearch(query.context, query.maxResults || 10);
    } else {
      results = await this.keywordSearch(query.context, query.maxResults || 10);
    }

    // Filter by tags if specified
    if (query.tags && query.tags.length > 0) {
      results = results.filter(note =>
        query.tags!.some(tag => note.tags.includes(tag))
      );
    }

    // Get connections between notes
    const connections = this.findConnections(results);

    // Calculate overall relevance
    const relevance = this.calculateRelevance(results, query);

    // Extract all unique tags
    const allTags = new Set<string>();
    results.forEach(note => note.tags.forEach(tag => allTags.add(tag)));

    return {
      knowledge: results,
      connections,
      relevance,
      tags: Array.from(allTags)
    };
  }

  /**
   * Index the entire vault
   */
  private async indexVault(): Promise<void> {
    if (!this.config.vaultPath) return;

    console.log('  📖 Indexing vault contents...');

    const startTime = Date.now();
    this.noteCache.clear();
    this.graphCache.clear();

    await this.walkDirectory(this.config.vaultPath);

    const elapsed = Date.now() - startTime;
    console.log(`  ✓ Indexed ${this.noteCache.size} notes in ${elapsed}ms`);

    this.lastIndexTime = Date.now();
  }

  /**
   * Walk directory recursively
   */
  private async walkDirectory(dir: string): Promise<void> {
    const files = fs.readdirSync(dir);

    for (const file of files) {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory() && !file.startsWith('.')) {
        await this.walkDirectory(fullPath);
      } else if (file.endsWith('.md')) {
        await this.indexNote(fullPath);
      }
    }
  }

  /**
   * Index a single note
   */
  private async indexNote(filePath: string): Promise<void> {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const relativePath = path.relative(this.config.vaultPath, filePath);

      // Parse frontmatter
      const frontmatter = this.parseFrontmatter(content);

      // Extract tags
      const tags = this.extractTags(content, frontmatter);

      // Extract backlinks
      const backlinks = this.extractBacklinks(content);

      // Extract title
      const title = this.extractTitle(content, relativePath);

      const note: NoteContent = {
        title,
        content: this.cleanContent(content),
        path: relativePath,
        tags,
        backlinks,
        frontmatter
      };

      this.noteCache.set(relativePath, note);

      // Build graph connections
      backlinks.forEach(link => {
        const connection: Connection = {
          from: relativePath,
          to: link,
          type: 'backlink',
          strength: 1.0
        };

        if (!this.graphCache.has(relativePath)) {
          this.graphCache.set(relativePath, []);
        }
        this.graphCache.get(relativePath)!.push(connection);
      });
    } catch (error) {
      console.error(`Failed to index ${filePath}:`, error);
    }
  }

  /**
   * Parse frontmatter from content
   */
  private parseFrontmatter(content: string): any {
    const match = content.match(/^---\n([\s\S]*?)\n---/);
    if (!match) return {};

    try {
      // Enhanced YAML parsing for Kelly's vault structure
      const lines = match[1].split('\n');
      const frontmatter: any = {};

      lines.forEach(line => {
        // Handle arrays in YAML
        if (line.includes('[') && line.includes(']')) {
          const [key, value] = line.split(':');
          if (key && value) {
            const arrayContent = value.match(/\[(.*?)\]/);
            if (arrayContent) {
              frontmatter[key.trim()] = arrayContent[1]
                .split(',')
                .map(item => item.trim());
            }
          }
        } else {
          const [key, ...valueParts] = line.split(':');
          if (key && valueParts.length > 0) {
            const value = valueParts.join(':').trim();
            // Convert string booleans
            if (value === 'true') frontmatter[key.trim()] = true;
            else if (value === 'false') frontmatter[key.trim()] = false;
            else frontmatter[key.trim()] = value;
          }
        }
      });

      // Process framework-specific metadata
      if (frontmatter.type === 'framework') {
        frontmatter.isFramework = true;
      }
      if (frontmatter.type === 'concept') {
        frontmatter.isConcept = true;
      }
      if (frontmatter.type === 'practice') {
        frontmatter.isPractice = true;
      }
      if (frontmatter.type === 'integration') {
        frontmatter.isIntegration = true;
      }

      return frontmatter;
    } catch {
      return {};
    }
  }

  /**
   * Extract tags from content
   */
  private extractTags(content: string, frontmatter: any): string[] {
    const tags = new Set<string>();

    // Tags from frontmatter
    if (frontmatter.tags) {
      const fmTags = frontmatter.tags.replace(/[\[\]]/g, '').split(',');
      fmTags.forEach((tag: string) => tags.add(tag.trim()));
    }

    // Inline tags (#tag)
    const inlineTags = content.match(/#[a-zA-Z0-9_-]+/g) || [];
    inlineTags.forEach(tag => tags.add(tag.substring(1)));

    return Array.from(tags);
  }

  /**
   * Extract backlinks from content
   */
  private extractBacklinks(content: string): string[] {
    const links = new Set<string>();

    // Wiki-style links [[Note Name]]
    const wikiLinks = content.match(/\[\[([^\]]+)\]\]/g) || [];
    wikiLinks.forEach(link => {
      const noteName = link.replace(/[\[\]]/g, '');
      links.add(noteName + '.md');
    });

    // Markdown links [text](path.md)
    const mdLinks = content.match(/\[([^\]]+)\]\(([^)]+\.md)\)/g) || [];
    mdLinks.forEach(link => {
      const match = link.match(/\]\(([^)]+\.md)\)/);
      if (match) links.add(match[1]);
    });

    return Array.from(links);
  }

  /**
   * Extract title from content
   */
  private extractTitle(content: string, filePath: string): string {
    // Try to get title from first H1
    const h1Match = content.match(/^# (.+)$/m);
    if (h1Match) return h1Match[1];

    // Try frontmatter title
    const frontmatter = this.parseFrontmatter(content);
    if (frontmatter.title) return frontmatter.title;

    // Use filename without extension
    return path.basename(filePath, '.md');
  }

  /**
   * Clean content for processing
   */
  private cleanContent(content: string): string {
    // Remove frontmatter
    content = content.replace(/^---\n[\s\S]*?\n---\n/, '');

    // Remove code blocks but keep their context
    content = content.replace(/```[\s\S]*?```/g, '[code block]');

    // Clean up multiple newlines
    content = content.replace(/\n{3,}/g, '\n\n');

    return content.trim();
  }

  /**
   * Semantic search using embeddings
   */
  private async semanticSearch(query: string, maxResults: number): Promise<NoteContent[]> {
    // In production, this would use actual vector embeddings
    // For now, fall back to keyword search with relevance scoring

    const results = await this.keywordSearch(query, maxResults * 2);

    // Calculate semantic relevance
    results.forEach(note => {
      note.relevance = this.calculateSemanticRelevance(query, note.content);
    });

    // Sort by relevance and return top results
    results.sort((a, b) => (b.relevance || 0) - (a.relevance || 0));

    return results.slice(0, maxResults);
  }

  /**
   * Keyword search
   */
  private async keywordSearch(query: string, maxResults: number): Promise<NoteContent[]> {
    const queryTerms = query.toLowerCase().split(/\s+/);
    const results: NoteContent[] = [];

    for (const [path, note] of this.noteCache) {
      const searchText = `${note.title} ${note.content} ${note.tags.join(' ')}`.toLowerCase();

      // Calculate match score
      let score = 0;
      queryTerms.forEach(term => {
        if (searchText.includes(term)) {
          score += (searchText.match(new RegExp(term, 'g')) || []).length;
        }
      });

      if (score > 0) {
        results.push({
          ...note,
          relevance: score / queryTerms.length
        });
      }
    }

    // Sort by relevance
    results.sort((a, b) => (b.relevance || 0) - (a.relevance || 0));

    return results.slice(0, maxResults);
  }

  /**
   * Calculate semantic relevance (simplified)
   */
  private calculateSemanticRelevance(query: string, content: string): number {
    // This is a simplified relevance calculation
    // In production, use proper embeddings and cosine similarity

    const queryWords = new Set(query.toLowerCase().split(/\s+/));
    const contentWords = new Set(content.toLowerCase().split(/\s+/));

    let overlap = 0;
    queryWords.forEach(word => {
      if (contentWords.has(word)) overlap++;
    });

    return overlap / queryWords.size;
  }

  /**
   * Find connections between notes
   */
  private findConnections(notes: NoteContent[]): Connection[] {
    const connections: Connection[] = [];
    const notePaths = new Set(notes.map(n => n.path));

    notes.forEach(note => {
      const noteConnections = this.graphCache.get(note.path) || [];

      noteConnections.forEach(conn => {
        if (notePaths.has(conn.to)) {
          connections.push(conn);
        }
      });

      // Also check for connections TO this note
      note.backlinks.forEach(backlink => {
        if (notePaths.has(backlink)) {
          connections.push({
            from: backlink,
            to: note.path,
            type: 'reference',
            strength: 0.8
          });
        }
      });
    });

    return connections;
  }

  /**
   * Calculate overall relevance
   */
  private calculateRelevance(results: NoteContent[], query: KnowledgeQuery): number {
    if (results.length === 0) return 0;

    const avgRelevance = results.reduce((sum, note) =>
      sum + (note.relevance || 0), 0
    ) / results.length;

    // Boost relevance if specific tags were found
    let tagBoost = 1.0;
    if (query.tags && query.tags.length > 0) {
      const matchingTags = results.filter(note =>
        query.tags!.some(tag => note.tags.includes(tag))
      ).length;
      tagBoost = 1 + (matchingTags / results.length) * 0.5;
    }

    return Math.min(avgRelevance * tagBoost, 1.0);
  }

  /**
   * Set up file watchers for real-time updates
   */
  private setupFileWatchers(): void {
    if (!this.config.vaultPath) return;

    // In production, use chokidar or similar for file watching
    // For now, periodically re-index
    setInterval(() => {
      if (Date.now() - this.lastIndexTime > this.config.indexUpdateInterval!) {
        this.indexVault().catch(console.error);
      }
    }, this.config.indexUpdateInterval);
  }

  /**
   * Get specific note by path
   */
  async getNote(notePath: string): Promise<NoteContent | null> {
    if (!this.initialized) {
      await this.connect();
    }

    return this.noteCache.get(notePath) || null;
  }

  /**
   * Get notes by tag
   */
  async getNotesByTag(tag: string): Promise<NoteContent[]> {
    if (!this.initialized) {
      await this.connect();
    }

    const results: NoteContent[] = [];

    for (const [_, note] of this.noteCache) {
      if (note.tags.includes(tag)) {
        results.push(note);
      }
    }

    return results;
  }

  /**
   * Get graph connections for a note
   */
  async getConnections(notePath: string): Promise<Connection[]> {
    if (!this.initialized) {
      await this.connect();
    }

    return this.graphCache.get(notePath) || [];
  }

  /**
   * Search by frontmatter property
   */
  async searchByFrontmatter(key: string, value: any): Promise<NoteContent[]> {
    if (!this.initialized) {
      await this.connect();
    }

    const results: NoteContent[] = [];

    for (const [_, note] of this.noteCache) {
      if (note.frontmatter[key] === value) {
        results.push(note);
      }
    }

    return results;
  }

  /**
   * Get all frameworks from Kelly's vault
   */
  async getFrameworks(): Promise<NoteContent[]> {
    return await this.searchByFrontmatter('type', 'framework');
  }

  /**
   * Get all concepts
   */
  async getConcepts(element?: string): Promise<NoteContent[]> {
    const concepts = await this.searchByFrontmatter('type', 'concept');

    if (element) {
      return concepts.filter(c =>
        c.frontmatter.elements?.includes(element) ||
        c.tags.includes(`#${element}`)
      );
    }

    return concepts;
  }

  /**
   * Get all practices
   */
  async getPractices(element?: string): Promise<NoteContent[]> {
    const practices = await this.searchByFrontmatter('type', 'practice');

    if (element) {
      return practices.filter(p =>
        p.frontmatter.elements?.includes(element) ||
        p.tags.includes(`#${element}`)
      );
    }

    return practices;
  }

  /**
   * Get all integrations
   */
  async getIntegrations(): Promise<NoteContent[]> {
    return await this.searchByFrontmatter('type', 'integration');
  }

  /**
   * Get framework by name
   */
  async getFramework(name: string): Promise<NoteContent | null> {
    const frameworks = await this.getFrameworks();
    return frameworks.find(f =>
      f.frontmatter.framework === name ||
      f.title === name
    ) || null;
  }

  /**
   * Get integration between frameworks
   */
  async getIntegration(framework1: string, framework2: string): Promise<NoteContent | null> {
    const integrations = await this.getIntegrations();

    return integrations.find(i => {
      const frameworks = i.frontmatter.frameworks || [];
      return frameworks.includes(framework1) && frameworks.includes(framework2);
    }) || null;
  }

  /**
   * Get concepts by facet (from 12 facets system)
   */
  async getConceptsByFacet(facet: string): Promise<NoteContent[]> {
    const concepts = await this.getConcepts();

    return concepts.filter(c =>
      c.frontmatter.facets?.includes(facet) ||
      c.tags.includes(`#${facet}`)
    );
  }

  /**
   * Get content by brain hemisphere
   */
  async getByHemisphere(hemisphere: 'left' | 'right' | 'integrated'): Promise<NoteContent[]> {
    const results: NoteContent[] = [];

    for (const [_, note] of this.noteCache) {
      if (note.frontmatter.hemisphere === hemisphere ||
          note.frontmatter.hemisphere?.includes(hemisphere)) {
        results.push(note);
      }
    }

    return results;
  }

  /**
   * Get Kelly's book content
   */
  async getBookContent(bookName?: string): Promise<NoteContent[]> {
    const results: NoteContent[] = [];

    for (const [path, note] of this.noteCache) {
      if (path.includes('Books/')) {
        if (!bookName || path.includes(bookName)) {
          results.push(note);
        }
      }
    }

    return results;
  }

  /**
   * Get wisdom for specific element
   */
  async getElementalWisdom(element: string): Promise<any> {
    const concepts = await this.getConcepts(element);
    const practices = await this.getPractices(element);
    const frameworks = await this.getFrameworks();

    // Find frameworks that include this element
    const relevantFrameworks = frameworks.filter(f =>
      f.frontmatter.elements?.includes(element)
    );

    return {
      element,
      concepts: concepts.map(c => ({
        title: c.title,
        definition: this.extractDefinition(c.content),
        connections: c.backlinks
      })),
      practices: practices.map(p => ({
        title: p.title,
        purpose: this.extractPurpose(p.content),
        duration: p.frontmatter.duration,
        difficulty: p.frontmatter.difficulty
      })),
      frameworks: relevantFrameworks.map(f => ({
        name: f.title,
        elementMapping: this.extractElementMapping(f.content, element)
      }))
    };
  }

  /**
   * Extract definition from concept note
   */
  private extractDefinition(content: string): string {
    const match = content.match(/## Definition\n([\s\S]*?)(?=\n##|$)/);
    return match ? match[1].trim() : '';
  }

  /**
   * Extract purpose from practice note
   */
  private extractPurpose(content: string): string {
    const match = content.match(/## Purpose\n([\s\S]*?)(?=\n##|$)/);
    return match ? match[1].trim() : '';
  }

  /**
   * Extract element mapping from framework
   */
  private extractElementMapping(content: string, element: string): string {
    const regex = new RegExp(`\\*\\*${element}[^:]*\\*\\*:\\s*([^\\n]+)`, 'i');
    const match = content.match(regex);
    return match ? match[1].trim() : '';
  }

  /**
   * Get synthesis opportunities
   */
  async findSynthesisOpportunities(): Promise<any[]> {
    const frameworks = await this.getFrameworks();
    const integrations = await this.getIntegrations();
    const opportunities = [];

    // Find framework pairs without integrations
    for (let i = 0; i < frameworks.length; i++) {
      for (let j = i + 1; j < frameworks.length; j++) {
        const framework1 = frameworks[i].title;
        const framework2 = frameworks[j].title;

        const existingIntegration = integrations.find(int => {
          const intFrameworks = int.frontmatter.frameworks || [];
          return intFrameworks.includes(framework1) &&
                 intFrameworks.includes(framework2);
        });

        if (!existingIntegration) {
          opportunities.push({
            type: 'missing_integration',
            frameworks: [framework1, framework2],
            suggestion: `Create integration between ${framework1} and ${framework2}`
          });
        }
      }
    }

    return opportunities;
  }
}

export default ObsidianVaultBridge;