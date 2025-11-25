/**
 * Pattern Resonance Graph - Living Graph of Meaning
 *
 * Unlike a knowledge graph (keyword connections), this is a FIELD MAP:
 * - Nodes pulse based on energetic activity
 * - Links form through symbolic coherence, not just shared words
 * - Resonance strengthens or decays based on temporal patterns
 */

import { ElementalCard, Element, Archetype, Pattern, Symbol } from './ElementalCard';

export interface GraphNode {
  id: string;
  type: 'card' | 'pattern' | 'symbol' | 'archetype' | 'element';
  label: string;

  // Visual properties
  energy: number; // 0-1, affects pulse/glow
  size: number; // Relative importance
  color: string; // Element-based coloring

  // Temporal activity
  lastActivated: Date;
  activationHistory: Date[];

  // Metadata
  metadata: {
    element?: Element;
    archetype?: Archetype;
    pattern?: Pattern;
    symbol?: Symbol;
    cardId?: string;
  };
}

export interface GraphEdge {
  id: string;
  source: string; // Node ID
  target: string; // Node ID

  connectionType: 'symbolic' | 'elemental' | 'archetypal' | 'temporal' | 'thematic' | 'transformation';
  strength: number; // 0-1
  resonance: number; // 0-1, how much this connection "rings"

  // Temporal properties
  createdAt: Date;
  lastActivated: Date;

  // Visual properties
  thickness: number;
  opacity: number;
  color: string;

  // Metadata
  description?: string;
  frequency: number; // How many times this connection has been activated
}

export interface ResonanceCluster {
  id: string;
  name: string;
  centerNode: string; // Central node ID
  nodes: string[]; // Member node IDs
  density: number; // How tightly connected
  element?: Element;
  energy: number; // Collective energy of cluster
}

/**
 * Pattern Resonance Graph Engine
 */
export class PatternResonanceGraph {
  private nodes: Map<string, GraphNode> = new Map();
  private edges: Map<string, GraphEdge> = new Map();
  private clusters: Map<string, ResonanceCluster> = new Map();

  // Decay parameters
  private readonly ENERGY_DECAY_RATE = 0.95; // Energy decays 5% per day
  private readonly CONNECTION_DECAY_RATE = 0.98; // Connections decay 2% per day
  private readonly MIN_ENERGY = 0.1; // Minimum energy before node becomes dormant

  /**
   * Add an Elemental Card to the graph
   */
  async addCard(card: ElementalCard): Promise<void> {
    // Create card node
    const cardNode: GraphNode = {
      id: card.id,
      type: 'card',
      label: card.title,
      energy: card.energyLevel,
      size: this.calculateNodeSize(card),
      color: this.getElementColor(card.elemental.primary),
      lastActivated: card.createdAt,
      activationHistory: [card.createdAt],
      metadata: { cardId: card.id }
    };

    this.nodes.set(cardNode.id, cardNode);

    // Create pattern nodes and connect
    for (const pattern of card.patterns) {
      await this.addOrUpdatePatternNode(pattern, card);
    }

    // Create symbol nodes and connect
    for (const symbol of card.symbols) {
      await this.addOrUpdateSymbolNode(symbol, card);
    }

    // Create archetype nodes and connect
    for (const archetypalPresence of card.archetypes) {
      await this.addOrUpdateArchetypeNode(archetypalPresence.archetype, archetypalPresence.strength, card);
    }

    // Create element node and connect
    await this.addOrUpdateElementNode(card.elemental.primary, card);

    // Find and create connections to existing cards
    await this.discoverConnections(card);

    // Update clusters
    await this.updateClusters();
  }

  /**
   * Add or update a pattern node
   */
  private async addOrUpdatePatternNode(pattern: Pattern, card: ElementalCard): Promise<void> {
    const nodeId = `pattern_${pattern.id}`;

    let node = this.nodes.get(nodeId);
    if (!node) {
      node = {
        id: nodeId,
        type: 'pattern',
        label: pattern.name,
        energy: pattern.strength,
        size: 1 + (pattern.recurrence * 0.1),
        color: this.getElementColor(pattern.element),
        lastActivated: card.createdAt,
        activationHistory: [card.createdAt],
        metadata: { pattern }
      };
      this.nodes.set(nodeId, node);
    } else {
      // Update existing node
      node.energy = Math.max(node.energy, pattern.strength);
      node.size = 1 + (pattern.recurrence * 0.1);
      node.lastActivated = card.createdAt;
      node.activationHistory.push(card.createdAt);
    }

    // Create edge from card to pattern
    const edge: GraphEdge = {
      id: `${card.id}_to_${nodeId}`,
      source: card.id,
      target: nodeId,
      connectionType: 'thematic',
      strength: pattern.strength,
      resonance: pattern.strength,
      createdAt: card.createdAt,
      lastActivated: card.createdAt,
      thickness: pattern.strength * 3,
      opacity: pattern.strength,
      color: this.getElementColor(pattern.element),
      frequency: 1
    };

    this.edges.set(edge.id, edge);
  }

  /**
   * Add or update a symbol node
   */
  private async addOrUpdateSymbolNode(symbol: Symbol, card: ElementalCard): Promise<void> {
    const nodeId = `symbol_${symbol.name.toLowerCase().replace(/\s/g, '_')}`;

    let node = this.nodes.get(nodeId);
    if (!node) {
      node = {
        id: nodeId,
        type: 'symbol',
        label: symbol.name,
        energy: symbol.resonance,
        size: 1 + (symbol.frequency * 0.2),
        color: this.getElementColor(card.elemental.primary),
        lastActivated: card.createdAt,
        activationHistory: [card.createdAt],
        metadata: { symbol }
      };
      this.nodes.set(nodeId, node);
    } else {
      node.energy = Math.max(node.energy, symbol.resonance);
      node.size += symbol.frequency * 0.1;
      node.lastActivated = card.createdAt;
      node.activationHistory.push(card.createdAt);
    }

    // Create edge
    const edge: GraphEdge = {
      id: `${card.id}_to_${nodeId}`,
      source: card.id,
      target: nodeId,
      connectionType: 'symbolic',
      strength: symbol.resonance,
      resonance: symbol.resonance * symbol.frequency,
      createdAt: card.createdAt,
      lastActivated: card.createdAt,
      thickness: symbol.resonance * 2,
      opacity: symbol.resonance * 0.8,
      color: this.getElementColor(card.elemental.primary),
      frequency: symbol.frequency
    };

    this.edges.set(edge.id, edge);
  }

  /**
   * Add or update an archetype node
   */
  private async addOrUpdateArchetypeNode(archetype: Archetype, strength: number, card: ElementalCard): Promise<void> {
    const nodeId = `archetype_${archetype}`;

    let node = this.nodes.get(nodeId);
    if (!node) {
      node = {
        id: nodeId,
        type: 'archetype',
        label: archetype.charAt(0).toUpperCase() + archetype.slice(1),
        energy: strength,
        size: 2,
        color: this.getArchetypeColor(archetype),
        lastActivated: card.createdAt,
        activationHistory: [card.createdAt],
        metadata: { archetype }
      };
      this.nodes.set(nodeId, node);
    } else {
      node.energy = Math.max(node.energy, strength);
      node.lastActivated = card.createdAt;
      node.activationHistory.push(card.createdAt);
    }

    // Create edge
    const edge: GraphEdge = {
      id: `${card.id}_to_${nodeId}`,
      source: card.id,
      target: nodeId,
      connectionType: 'archetypal',
      strength,
      resonance: strength,
      createdAt: card.createdAt,
      lastActivated: card.createdAt,
      thickness: strength * 2.5,
      opacity: strength * 0.7,
      color: this.getArchetypeColor(archetype),
      frequency: 1
    };

    this.edges.set(edge.id, edge);
  }

  /**
   * Add or update an element node
   */
  private async addOrUpdateElementNode(element: Element, card: ElementalCard): Promise<void> {
    const nodeId = `element_${element}`;

    const elementalStrength = card.elemental[element];

    let node = this.nodes.get(nodeId);
    if (!node) {
      node = {
        id: nodeId,
        type: 'element',
        label: element.charAt(0).toUpperCase() + element.slice(1),
        energy: elementalStrength,
        size: 3,
        color: this.getElementColor(element),
        lastActivated: card.createdAt,
        activationHistory: [card.createdAt],
        metadata: { element }
      };
      this.nodes.set(nodeId, node);
    } else {
      node.energy = Math.max(node.energy, elementalStrength);
      node.lastActivated = card.createdAt;
      node.activationHistory.push(card.createdAt);
    }

    // Create edge
    const edge: GraphEdge = {
      id: `${card.id}_to_${nodeId}`,
      source: card.id,
      target: nodeId,
      connectionType: 'elemental',
      strength: elementalStrength,
      resonance: elementalStrength,
      createdAt: card.createdAt,
      lastActivated: card.createdAt,
      thickness: elementalStrength * 3,
      opacity: elementalStrength * 0.6,
      color: this.getElementColor(element),
      frequency: 1
    };

    this.edges.set(edge.id, edge);
  }

  /**
   * Discover connections between this card and existing cards
   */
  private async discoverConnections(newCard: ElementalCard): Promise<void> {
    const existingCards = Array.from(this.nodes.values())
      .filter(node => node.type === 'card' && node.id !== newCard.id);

    for (const existingNode of existingCards) {
      const existingCardId = existingNode.metadata.cardId!;

      // Calculate resonance between cards
      // This would be more sophisticated in production
      const resonance = await this.calculateResonance(newCard, existingCardId);

      if (resonance > 0.3) { // Threshold for creating connection
        const edge: GraphEdge = {
          id: `${newCard.id}_to_${existingCardId}`,
          source: newCard.id,
          target: existingCardId,
          connectionType: 'thematic',
          strength: resonance,
          resonance,
          createdAt: newCard.createdAt,
          lastActivated: newCard.createdAt,
          thickness: resonance * 2,
          opacity: resonance * 0.5,
          color: this.blendColors(
            this.getElementColor(newCard.elemental.primary),
            existingNode.color
          ),
          frequency: 1
        };

        this.edges.set(edge.id, edge);
      }
    }
  }

  /**
   * Calculate resonance between two cards
   */
  private async calculateResonance(card1: ElementalCard, card2Id: string): Promise<number> {
    // TODO: Implement sophisticated resonance calculation
    // For now, return placeholder
    return 0.5;
  }

  /**
   * Update clusters based on current graph state
   */
  private async updateClusters(): Promise<void> {
    // TODO: Implement clustering algorithm
    // Could use community detection, modularity optimization, etc.
  }

  /**
   * Apply temporal decay to all nodes and edges
   */
  async applyDecay(): Promise<void> {
    const now = new Date();

    // Decay node energy
    for (const node of this.nodes.values()) {
      const daysSinceActivation = (now.getTime() - node.lastActivated.getTime()) / (1000 * 60 * 60 * 24);
      node.energy *= Math.pow(this.ENERGY_DECAY_RATE, daysSinceActivation);

      if (node.energy < this.MIN_ENERGY) {
        node.energy = this.MIN_ENERGY;
      }
    }

    // Decay edge strength
    for (const edge of this.edges.values()) {
      const daysSinceActivation = (now.getTime() - edge.lastActivated.getTime()) / (1000 * 60 * 60 * 24);
      edge.strength *= Math.pow(this.CONNECTION_DECAY_RATE, daysSinceActivation);
      edge.opacity = edge.strength * 0.8;
      edge.thickness = edge.strength * 3;
    }
  }

  /**
   * Get graph data for visualization
   */
  getGraphData(): { nodes: GraphNode[]; edges: GraphEdge[] } {
    return {
      nodes: Array.from(this.nodes.values()),
      edges: Array.from(this.edges.values())
    };
  }

  /**
   * Filter graph by element
   */
  filterByElement(element: Element): { nodes: GraphNode[]; edges: GraphEdge[] } {
    const elementNodeIds = new Set<string>();

    // Find all nodes related to this element
    for (const node of this.nodes.values()) {
      if (node.metadata.element === element ||
          (node.type === 'element' && node.metadata.element === element)) {
        elementNodeIds.add(node.id);
      }
    }

    // Find all edges connected to these nodes
    const relevantEdges = Array.from(this.edges.values()).filter(edge =>
      elementNodeIds.has(edge.source) || elementNodeIds.has(edge.target)
    );

    // Expand to include connected nodes
    relevantEdges.forEach(edge => {
      elementNodeIds.add(edge.source);
      elementNodeIds.add(edge.target);
    });

    return {
      nodes: Array.from(this.nodes.values()).filter(n => elementNodeIds.has(n.id)),
      edges: relevantEdges
    };
  }

  /**
   * Helper: Calculate node size
   */
  private calculateNodeSize(card: ElementalCard): number {
    return 1 + (card.activationCount * 0.1) + (card.energyLevel * 0.5);
  }

  /**
   * Helper: Get element color
   */
  private getElementColor(element: Element): string {
    const colors = {
      fire: '#ef4444',    // Red
      water: '#3b82f6',   // Blue
      earth: '#84cc16',   // Green
      air: '#fbbf24',     // Yellow/Gold
      aether: '#9333ea'   // Purple
    };
    return colors[element];
  }

  /**
   * Helper: Get archetype color
   */
  private getArchetypeColor(archetype: Archetype): string {
    const colors = {
      creator: '#f59e0b',
      healer: '#10b981',
      shadow: '#6b7280',
      sage: '#8b5cf6',
      warrior: '#dc2626',
      lover: '#ec4899',
      magician: '#a855f7',
      innocent: '#60a5fa'
    };
    return colors[archetype];
  }

  /**
   * Helper: Blend two hex colors
   */
  private blendColors(color1: string, color2: string): string {
    // Simple color blending - could be more sophisticated
    return color1; // For now, just return first color
  }
}
