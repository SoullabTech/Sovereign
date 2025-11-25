/**
 * Obsidian Knowledge Integration for MAIA/Soullab
 * Dynamic, ever-expanding IP management through Obsidian's linked knowledge system
 *
 * This integration allows your complete IP to live and grow in Obsidian while
 * maintaining real-time connection to MAIA's consciousness engine.
 */

import { watch } from 'chokidar';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { IntellectualPropertyEngine } from './intellectual-property-engine';
import { VectorEmbeddingService } from './vector-embeddings';

export interface ObsidianNote {
  path: string;
  title: string;
  content: string;
  frontmatter: any;
  links: string[];
  tags: string[];
  lastModified: Date;
  embeddings?: number[];
}

export interface FrameworkRelationship {
  framework1: string;
  framework2: string;
  relationshipType: 'complements' | 'extends' | 'synthesizes' | 'contrasts' | 'maps_to';
  description: string;
  insights: string[];
}

export interface ConceptNode {
  id: string;
  concept: string;
  frameworks: string[]; // Which frameworks this concept appears in
  elements: ('fire' | 'water' | 'earth' | 'air' | 'aether')[];
  brainHemisphere?: 'left' | 'right' | 'integrated';
  facets?: string[]; // From your 12 facets system
  connections: Map<string, string>; // Connected concepts and relationship type
}

export interface DynamicKnowledgeGraph {
  nodes: Map<string, ConceptNode>;
  frameworks: Map<string, Framework>;
  relationships: FrameworkRelationship[];
  lastUpdated: Date;
}

export interface Framework {
  name: string;
  description: string;
  sourceNotes: string[]; // Obsidian note paths
  concepts: string[];
  practices: string[];
  integratesWithh: string[]; // Other frameworks
  metadata: any;
}

/**
 * Main Obsidian Integration Engine
 * Watches your Obsidian vault and maintains living knowledge connection
 */
export class ObsidianKnowledgeIntegration {
  private vaultPath: string;
  private ipEngine: IntellectualPropertyEngine;
  private vectorService: VectorEmbeddingService;
  private knowledgeGraph: DynamicKnowledgeGraph;
  private notes: Map<string, ObsidianNote> = new Map();
  private watcher: any;
  private updateQueue: string[] = [];
  private isProcessing: boolean = false;

  constructor(vaultPath: string) {
    this.vaultPath = vaultPath;
    this.ipEngine = new IntellectualPropertyEngine();
    this.vectorService = new VectorEmbeddingService({
      openaiApiKey: process.env.OPENAI_API_KEY!,
      dimension: 1536
    });

    this.knowledgeGraph = {
      nodes: new Map(),
      frameworks: new Map(),
      relationships: [],
      lastUpdated: new Date()
    };
  }

  /**
   * Initialize and start watching Obsidian vault
   */
  async initialize(): Promise<void> {
    console.log(`[Obsidian] Initializing integration with vault: ${this.vaultPath}`);

    // Initialize IP engine
    await this.ipEngine.initialize();

    // Initial scan of vault
    await this.scanVault();

    // Set up file watcher for real-time updates
    this.setupWatcher();

    // Build initial knowledge graph
    await this.buildKnowledgeGraph();

    console.log(`[Obsidian] Integration initialized with ${this.notes.size} notes`);
  }

  /**
   * Scan entire Obsidian vault
   */
  private async scanVault(): Promise<void> {
    console.log('[Obsidian] Scanning vault for knowledge...');

    const scanDirectory = async (dirPath: string) => {
      const entries = fs.readdirSync(dirPath, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);

        if (entry.isDirectory() && !entry.name.startsWith('.')) {
          await scanDirectory(fullPath);
        } else if (entry.isFile() && entry.name.endsWith('.md')) {
          await this.processNote(fullPath);
        }
      }
    };

    await scanDirectory(this.vaultPath);
  }

  /**
   * Process individual Obsidian note
   */
  private async processNote(filePath: string): Promise<void> {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const parsed = matter(content);
      const relativePath = path.relative(this.vaultPath, filePath);

      // Extract links (Obsidian [[link]] format)
      const links = this.extractLinks(parsed.content);

      // Extract tags (#tag format)
      const tags = this.extractTags(parsed.content);

      // Create note object
      const note: ObsidianNote = {
        path: relativePath,
        title: parsed.data.title || path.basename(filePath, '.md'),
        content: parsed.content,
        frontmatter: parsed.data,
        links,
        tags,
        lastModified: fs.statSync(filePath).mtime
      };

      // Store note
      this.notes.set(relativePath, note);

      // Process based on note type/tags
      await this.categorizeAndProcess(note);

    } catch (error) {
      console.error(`[Obsidian] Error processing note ${filePath}:`, error);
    }
  }

  /**
   * Categorize note and process accordingly
   */
  private async categorizeAndProcess(note: ObsidianNote): Promise<void> {
    const frontmatter = note.frontmatter;

    // Check if this is a framework note
    if (note.tags.includes('framework') || frontmatter.type === 'framework') {
      await this.processFrameworkNote(note);
    }

    // Check if this is an IP/book content note
    if (note.tags.includes('book') || note.tags.includes('ip') || frontmatter.type === 'content') {
      await this.processIPContent(note);
    }

    // Check if this is a practice note
    if (note.tags.includes('practice') || note.tags.includes('exercise')) {
      await this.processPracticeNote(note);
    }

    // Check if this is a concept note
    if (note.tags.includes('concept') || frontmatter.type === 'concept') {
      await this.processConceptNote(note);
    }

    // Special processing for McGilchrist brain model notes
    if (note.tags.includes('brain-hemisphere') || note.content.includes('McGilchrist')) {
      await this.processBrainModelNote(note);
    }

    // Special processing for elemental notes
    if (note.tags.some(tag => ['fire', 'water', 'earth', 'air', 'aether'].includes(tag))) {
      await this.processElementalNote(note);
    }
  }

  /**
   * Process framework integration notes (like McGilchrist + Elements)
   */
  private async processFrameworkNote(note: ObsidianNote): Promise<void> {
    const frameworkName = note.frontmatter.framework || note.title;

    const framework: Framework = {
      name: frameworkName,
      description: note.frontmatter.description || this.extractFirstParagraph(note.content),
      sourceNotes: [note.path],
      concepts: this.extractConcepts(note),
      practices: this.extractPractices(note),
      integratesWithh: note.frontmatter.integrates_with || [],
      metadata: {
        ...note.frontmatter,
        elements: this.detectElements(note.content),
        brainModel: this.detectBrainModel(note.content)
      }
    };

    this.knowledgeGraph.frameworks.set(frameworkName, framework);

    // Look for framework relationships
    if (note.frontmatter.relationships) {
      this.processFrameworkRelationships(frameworkName, note.frontmatter.relationships);
    }
  }

  /**
   * Process IP/book content for vectorization
   */
  private async processIPContent(note: ObsidianNote): Promise<void> {
    // Generate embeddings for semantic search
    const embedding = await this.vectorService.generateEmbedding(
      `${note.title} ${note.content}`
    );

    note.embeddings = embedding;

    // Add to IP engine
    await this.ipEngine.addIPContent({
      title: note.title,
      content: note.content,
      category: this.determineCategory(note),
      metadata: {
        keywords: note.tags,
        concepts: this.extractConcepts(note),
        archetypes: this.detectArchetypes(note.content),
        elements: this.detectElements(note.content),
        consciousnessLevel: this.assessConsciousnessLevel(note.content),
        relevantQuestions: this.generateQuestions(note)
      },
      relationships: this.mapRelationships(note)
    });
  }

  /**
   * Process concept notes for knowledge graph
   */
  private async processConceptNote(note: ObsidianNote): Promise<void> {
    const conceptId = note.frontmatter.id || note.title.toLowerCase().replace(/\s/g, '_');

    const conceptNode: ConceptNode = {
      id: conceptId,
      concept: note.title,
      frameworks: note.frontmatter.frameworks || [],
      elements: this.detectElements(note.content),
      brainHemisphere: this.detectHemisphere(note.content),
      facets: this.extractFacets(note),
      connections: new Map()
    };

    // Map connections from links
    note.links.forEach(link => {
      conceptNode.connections.set(link, 'relates_to');
    });

    this.knowledgeGraph.nodes.set(conceptId, conceptNode);
  }

  /**
   * Process brain model integration notes
   */
  private async processBrainModelNote(note: ObsidianNote): Promise<void> {
    const brainMapping = {
      hemisphere: note.frontmatter.hemisphere || this.detectHemisphere(note.content),
      elements: this.detectElements(note.content),
      facets: this.extractFacets(note),
      qualities: this.extractQualities(note),
      integration: note.frontmatter.integration_notes || []
    };

    // Create relationships between brain model and elements
    if (brainMapping.elements.length > 0) {
      this.knowledgeGraph.relationships.push({
        framework1: 'McGilchrist Brain Model',
        framework2: 'Elemental Framework',
        relationshipType: 'maps_to',
        description: `${brainMapping.hemisphere} hemisphere maps to ${brainMapping.elements.join(', ')}`,
        insights: this.extractInsights(note)
      });
    }
  }

  /**
   * Real-time file watching
   */
  private setupWatcher(): void {
    this.watcher = watch(path.join(this.vaultPath, '**/*.md'), {
      ignored: /(^|[\/\\])\../, // Ignore hidden files
      persistent: true,
      ignoreInitial: true
    });

    this.watcher
      .on('add', (filePath: string) => this.queueUpdate(filePath, 'add'))
      .on('change', (filePath: string) => this.queueUpdate(filePath, 'change'))
      .on('unlink', (filePath: string) => this.queueUpdate(filePath, 'delete'));

    // Process queue periodically
    setInterval(() => this.processUpdateQueue(), 5000);
  }

  /**
   * Queue file updates for batch processing
   */
  private queueUpdate(filePath: string, action: string): void {
    console.log(`[Obsidian] File ${action}: ${path.basename(filePath)}`);
    this.updateQueue.push(filePath);
  }

  /**
   * Process queued updates
   */
  private async processUpdateQueue(): Promise<void> {
    if (this.isProcessing || this.updateQueue.length === 0) return;

    this.isProcessing = true;
    const batch = this.updateQueue.splice(0, 10); // Process up to 10 files at once

    for (const filePath of batch) {
      if (fs.existsSync(filePath)) {
        await this.processNote(filePath);
      } else {
        // File was deleted
        const relativePath = path.relative(this.vaultPath, filePath);
        this.notes.delete(relativePath);
      }
    }

    // Rebuild knowledge graph after updates
    await this.buildKnowledgeGraph();

    this.isProcessing = false;
  }

  /**
   * Build/rebuild the dynamic knowledge graph
   */
  private async buildKnowledgeGraph(): Promise<void> {
    console.log('[Obsidian] Building knowledge graph...');

    // Clear existing relationships
    this.knowledgeGraph.relationships = [];

    // Analyze all notes for relationships
    for (const [notePath, note] of this.notes) {
      // Find framework integrations
      if (note.frontmatter.integrates) {
        this.processIntegrations(note);
      }

      // Map concept relationships through links
      note.links.forEach(linkedNote => {
        this.mapConceptRelationship(note.title, linkedNote);
      });
    }

    this.knowledgeGraph.lastUpdated = new Date();

    console.log(`[Obsidian] Knowledge graph built with ${this.knowledgeGraph.nodes.size} nodes`);
  }

  /**
   * Query the knowledge graph for synthesis
   */
  async synthesizeKnowledge(query: string, context?: any): Promise<any> {
    // Search across all notes
    const relevantNotes = await this.searchNotes(query);

    // Find relevant frameworks
    const relevantFrameworks = this.findRelevantFrameworks(query, context);

    // Traverse concept graph for connections
    const conceptNetwork = this.traverseConceptNetwork(query);

    // Synthesize insights
    return {
      notes: relevantNotes,
      frameworks: relevantFrameworks,
      concepts: conceptNetwork,
      synthesis: await this.generateSynthesis(relevantNotes, relevantFrameworks, conceptNetwork)
    };
  }

  /**
   * Search notes using semantic similarity
   */
  private async searchNotes(query: string): Promise<ObsidianNote[]> {
    const queryEmbedding = await this.vectorService.generateEmbedding(query);
    const results: Array<{ note: ObsidianNote; similarity: number }> = [];

    for (const [path, note] of this.notes) {
      if (note.embeddings) {
        const similarity = this.cosineSimilarity(queryEmbedding, note.embeddings);
        if (similarity > 0.7) {
          results.push({ note, similarity });
        }
      }
    }

    return results
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 5)
      .map(r => r.note);
  }

  /**
   * Find frameworks relevant to query
   */
  private findRelevantFrameworks(query: string, context?: any): Framework[] {
    const relevant: Framework[] = [];
    const queryLower = query.toLowerCase();

    for (const [name, framework] of this.knowledgeGraph.frameworks) {
      // Check if query mentions framework concepts
      const hasRelevantConcepts = framework.concepts.some(concept =>
        queryLower.includes(concept.toLowerCase())
      );

      // Check if context matches framework metadata
      const contextMatch = context && this.matchesContext(framework.metadata, context);

      if (hasRelevantConcepts || contextMatch) {
        relevant.push(framework);
      }
    }

    return relevant;
  }

  /**
   * Traverse concept network from query
   */
  private traverseConceptNetwork(query: string, maxDepth: number = 3): ConceptNode[] {
    const visited = new Set<string>();
    const network: ConceptNode[] = [];
    const queryLower = query.toLowerCase();

    // Find starting nodes
    const startNodes: ConceptNode[] = [];
    for (const [id, node] of this.knowledgeGraph.nodes) {
      if (node.concept.toLowerCase().includes(queryLower) ||
          queryLower.includes(node.concept.toLowerCase())) {
        startNodes.push(node);
      }
    }

    // Breadth-first traversal
    const queue = startNodes.map(node => ({ node, depth: 0 }));

    while (queue.length > 0) {
      const { node, depth } = queue.shift()!;

      if (visited.has(node.id) || depth > maxDepth) continue;

      visited.add(node.id);
      network.push(node);

      // Add connected nodes to queue
      for (const [connectedId, relationship] of node.connections) {
        const connectedNode = this.knowledgeGraph.nodes.get(connectedId);
        if (connectedNode && !visited.has(connectedId)) {
          queue.push({ node: connectedNode, depth: depth + 1 });
        }
      }
    }

    return network;
  }

  /**
   * Generate synthesis from search results
   */
  private async generateSynthesis(
    notes: ObsidianNote[],
    frameworks: Framework[],
    concepts: ConceptNode[]
  ): Promise<string> {
    // This would use AI to synthesize insights
    // For now, return structured summary

    const synthesis = {
      mainThemes: this.extractMainThemes(notes),
      frameworkInsights: frameworks.map(f => ({
        name: f.name,
        relevance: f.description
      })),
      conceptualConnections: this.mapConceptualConnections(concepts),
      practicalApplications: this.extractApplications(notes, frameworks)
    };

    return JSON.stringify(synthesis, null, 2);
  }

  // Helper methods
  private extractLinks(content: string): string[] {
    const linkRegex = /\[\[([^\]]+)\]\]/g;
    const links: string[] = [];
    let match;

    while ((match = linkRegex.exec(content)) !== null) {
      links.push(match[1]);
    }

    return links;
  }

  private extractTags(content: string): string[] {
    const tagRegex = /#([a-zA-Z0-9_-]+)/g;
    const tags: string[] = [];
    let match;

    while ((match = tagRegex.exec(content)) !== null) {
      tags.push(match[1]);
    }

    return tags;
  }

  private extractConcepts(note: ObsidianNote): string[] {
    // Extract from frontmatter or content
    return note.frontmatter.concepts || [];
  }

  private extractPractices(note: ObsidianNote): string[] {
    // Extract practices mentioned
    return note.frontmatter.practices || [];
  }

  private detectElements(content: string): ('fire' | 'water' | 'earth' | 'air' | 'aether')[] {
    const elements: ('fire' | 'water' | 'earth' | 'air' | 'aether')[] = [];
    const elementKeywords = {
      fire: ['fire', 'flame', 'passion', 'energy', 'breakthrough'],
      water: ['water', 'flow', 'emotion', 'feeling', 'intuition'],
      earth: ['earth', 'ground', 'body', 'practical', 'manifest'],
      air: ['air', 'breath', 'thought', 'communication', 'clarity'],
      aether: ['aether', 'spirit', 'consciousness', 'transcendent', 'unity']
    };

    Object.entries(elementKeywords).forEach(([element, keywords]) => {
      if (keywords.some(keyword => content.toLowerCase().includes(keyword))) {
        elements.push(element as any);
      }
    });

    return elements;
  }

  private detectHemisphere(content: string): 'left' | 'right' | 'integrated' | undefined {
    const leftKeywords = ['analytical', 'logical', 'sequential', 'categorical', 'left hemisphere'];
    const rightKeywords = ['holistic', 'intuitive', 'relational', 'contextual', 'right hemisphere'];

    const hasLeft = leftKeywords.some(k => content.toLowerCase().includes(k));
    const hasRight = rightKeywords.some(k => content.toLowerCase().includes(k));

    if (hasLeft && hasRight) return 'integrated';
    if (hasLeft) return 'left';
    if (hasRight) return 'right';
    return undefined;
  }

  private detectBrainModel(content: string): any {
    return {
      hasMcGilchrist: content.includes('McGilchrist'),
      hasFourBrain: content.includes('four brain') || content.includes('prefrontal'),
      hemisphericBalance: this.detectHemisphere(content)
    };
  }

  private extractFacets(note: ObsidianNote): string[] {
    // Extract 12 facets if mentioned
    const facets = [
      'Experience', 'Expression', 'Expansion',
      'Heart', 'Healing', 'Holiness',
      'Mission', 'Means', 'Medicine',
      'Connection', 'Community', 'Consciousness'
    ];

    return facets.filter(facet =>
      note.content.toLowerCase().includes(facet.toLowerCase())
    );
  }

  private extractQualities(note: ObsidianNote): string[] {
    // Extract qualities mentioned
    return note.frontmatter.qualities || [];
  }

  private extractInsights(note: ObsidianNote): string[] {
    // Extract key insights
    return note.frontmatter.insights || [];
  }

  private determineCategory(note: ObsidianNote): any {
    if (note.tags.includes('practice')) return 'sacred_practice';
    if (note.tags.includes('teaching')) return 'core_teaching';
    if (note.tags.includes('principle')) return 'consciousness_principle';
    return 'elemental_wisdom';
  }

  private detectArchetypes(content: string): string[] {
    const archetypes = ['healer', 'mystic', 'sage', 'warrior', 'lover', 'magician'];
    return archetypes.filter(arch => content.toLowerCase().includes(arch));
  }

  private assessConsciousnessLevel(content: string): number {
    // Simple assessment based on depth indicators
    const depthIndicators = ['consciousness', 'awareness', 'presence', 'being', 'transcendent'];
    const count = depthIndicators.filter(indicator =>
      content.toLowerCase().includes(indicator)
    ).length;
    return Math.min(1, count * 0.2);
  }

  private generateQuestions(note: ObsidianNote): string[] {
    return [
      `How might the wisdom in "${note.title}" apply to your current situation?`,
      `What wants to emerge from your engagement with this teaching?`
    ];
  }

  private mapRelationships(note: ObsidianNote): any[] {
    return note.links.map(link => ({
      relatedContentId: link,
      relationshipType: 'references',
      strength: 0.8
    }));
  }

  private extractFirstParagraph(content: string): string {
    const paragraphs = content.split('\n\n');
    return paragraphs[0] || content.substring(0, 200);
  }

  private processFrameworkRelationships(frameworkName: string, relationships: any[]): void {
    relationships.forEach(rel => {
      this.knowledgeGraph.relationships.push({
        framework1: frameworkName,
        framework2: rel.framework,
        relationshipType: rel.type || 'relates_to',
        description: rel.description || '',
        insights: rel.insights || []
      });
    });
  }

  private processIntegrations(note: ObsidianNote): void {
    // Process framework integrations
  }

  private mapConceptRelationship(concept1: string, concept2: string): void {
    // Map relationships between concepts
  }

  private matchesContext(metadata: any, context: any): boolean {
    // Check if metadata matches context
    return false; // Simplified
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    const dotProduct = a.reduce((sum, ai, i) => sum + ai * b[i], 0);
    const magnitudeA = Math.sqrt(a.reduce((sum, ai) => sum + ai * ai, 0));
    const magnitudeB = Math.sqrt(b.reduce((sum, bi) => sum + bi * bi, 0));
    return dotProduct / (magnitudeA * magnitudeB);
  }

  private extractMainThemes(notes: ObsidianNote[]): string[] {
    // Extract main themes from notes
    return [];
  }

  private mapConceptualConnections(concepts: ConceptNode[]): any {
    // Map connections between concepts
    return {};
  }

  private extractApplications(notes: ObsidianNote[], frameworks: Framework[]): string[] {
    // Extract practical applications
    return [];
  }

  private processElementalNote(note: ObsidianNote): Promise<void> {
    // Process elemental-specific notes
    return Promise.resolve();
  }

  private processPracticeNote(note: ObsidianNote): Promise<void> {
    // Process practice notes
    return Promise.resolve();
  }

  /**
   * Get current knowledge status
   */
  getStatus(): {
    totalNotes: number;
    frameworks: number;
    concepts: number;
    relationships: number;
    lastUpdated: Date;
  } {
    return {
      totalNotes: this.notes.size,
      frameworks: this.knowledgeGraph.frameworks.size,
      concepts: this.knowledgeGraph.nodes.size,
      relationships: this.knowledgeGraph.relationships.length,
      lastUpdated: this.knowledgeGraph.lastUpdated
    };
  }

  /**
   * Export knowledge graph for visualization
   */
  exportKnowledgeGraph(): DynamicKnowledgeGraph {
    return this.knowledgeGraph;
  }

  /**
   * Cleanup and close watchers
   */
  destroy(): void {
    if (this.watcher) {
      this.watcher.close();
    }
  }
}

export default ObsidianKnowledgeIntegration;