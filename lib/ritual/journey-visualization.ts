/**
 * JOURNEY VISUALIZATION
 *
 * Visual representations of the sacred journey
 * Spirals, elemental petals, and symbolic maps
 */

export interface JourneyVisual {
  type: 'spiral' | 'flower' | 'mandala' | 'constellation';
  elements: ElementNode[];
  connections: Connection[];
  center: Point;
  depth: number;
}

export interface ElementNode {
  element: string;
  position: Point;
  intensity: number;
  visits: number;
  symbol: string;
}

export interface Connection {
  from: string;
  to: string;
  strength: number;
  path: string;
}

export interface Point {
  x: number;
  y: number;
}

export class JourneyVisualization {
  /**
   * Create spiral visualization
   */
  static createSpiral(journey: any[]): string {
    const radius = 50;
    const angleStep = (2 * Math.PI) / 6; // For 6 elements
    let spiral = '';

    // ASCII art spiral
    const lines: string[][] = Array(11).fill(null).map(() => Array(21).fill(' '));

    // Center
    lines[5][10] = '◉';

    // Place elements in spiral
    const elements = ['fire', 'water', 'earth', 'air', 'aether', 'shadow'];
    const symbols = ['🔥', '💧', '🌍', '💨', '✨', '🌑'];

    elements.forEach((elem, i) => {
      const angle = i * angleStep;
      const x = Math.round(10 + Math.cos(angle) * 8);
      const y = Math.round(5 + Math.sin(angle) * 4);

      if (x >= 0 && x < 21 && y >= 0 && y < 11) {
        // Check if this element was visited
        const visited = journey.some(j =>
          j.element === elem || (j.metadata?.elements && j.metadata.elements.includes(elem))
        );

        lines[y][x] = visited ? symbols[i] : '○';
      }
    });

    // Convert to string
    spiral = lines.map(line => line.join('')).join('\n');

    return spiral;
  }

  /**
   * Create elemental flower/mandala
   */
  static createElementalFlower(elementVisits: Record<string, number>): string {
    const maxVisits = Math.max(...Object.values(elementVisits), 1);

    // Create petals based on visit frequency
    const petals = [];

    Object.entries(elementVisits).forEach(([element, visits]) => {
      const intensity = visits / maxVisits;
      const petalSize = Math.ceil(intensity * 3);

      let petal = '';
      if (petalSize === 1) petal = '•';
      else if (petalSize === 2) petal = '◉';
      else petal = '◈';

      petals.push({ element, petal, visits });
    });

    // Arrange in flower pattern
    const flower = `
         ${petals[0]?.petal || ' '}
      ${petals[5]?.petal || ' '}  ${petals[1]?.petal || ' '}
        ◉
      ${petals[4]?.petal || ' '}  ${petals[2]?.petal || ' '}
         ${petals[3]?.petal || ' '}
    `;

    return flower;
  }

  /**
   * Create journey constellation
   */
  static createConstellation(journey: any[]): string {
    if (journey.length === 0) return '◉';

    // Map journey points
    const points = journey.map((j, i) => ({
      symbol: this.getElementSymbol(j.element),
      depth: j.depth || 0.5,
      index: i
    }));

    // Create constellation view
    let constellation = '';

    points.forEach((point, i) => {
      if (i > 0) {
        // Draw connection
        const connection = point.depth > 0.7 ? '═══' : '───';
        constellation += connection;
      }
      constellation += point.symbol;
    });

    return constellation;
  }

  /**
   * Create depth indicator
   */
  static createDepthIndicator(depth: number): string {
    const percentage = Math.round(depth * 100);
    const filled = Math.round(depth * 10);
    const empty = 10 - filled;

    return `[${'\u2588'.repeat(filled)}${'\u2591'.repeat(empty)}] ${percentage}%`;
  }

  /**
   * Create element balance chart
   */
  static createElementBalance(elementCounts: Record<string, number>): string {
    const elements = ['fire', 'water', 'earth', 'air', 'aether', 'shadow'];
    const max = Math.max(...Object.values(elementCounts), 1);

    let chart = 'ELEMENTAL BALANCE:\n';

    elements.forEach(elem => {
      const count = elementCounts[elem] || 0;
      const bars = Math.round((count / max) * 10);
      const symbol = this.getElementSymbol(elem);

      chart += `${symbol} ${elem.padEnd(8)} [${'█'.repeat(bars)}${'░'.repeat(10 - bars)}] ${count}\n`;
    });

    return chart;
  }

  /**
   * Create journey timeline
   */
  static createTimeline(journey: any[]): string {
    if (journey.length === 0) return 'No journey yet';

    let timeline = 'JOURNEY TIMELINE:\n';
    timeline += '├─ START\n';

    journey.forEach((point, i) => {
      const isLast = i === journey.length - 1;
      const connector = isLast ? '└─' : '├─';
      const time = new Date(point.timestamp).toLocaleTimeString();
      const symbol = this.getElementSymbol(point.element);

      timeline += `${connector} ${time} ${symbol} ${point.essence || ''}\n`;
    });

    return timeline;
  }

  /**
   * Create integration map
   */
  static createIntegrationMap(patterns: string[], territories: Record<string, number>): string {
    let map = '╔══════════════════════════════╗\n';
    map += '║     INTEGRATION MAP          ║\n';
    map += '╠══════════════════════════════╣\n';

    // Show territories
    map += '║ Territories Explored:        ║\n';
    Object.entries(territories).forEach(([territory, visits]) => {
      if (visits > 0) {
        const symbol = this.getElementSymbol(territory);
        map += `║  ${symbol} ${territory.padEnd(10)} × ${visits}     ║\n`;
      }
    });

    map += '╠══════════════════════════════╣\n';

    // Show patterns
    map += '║ Active Patterns:             ║\n';
    patterns.forEach(pattern => {
      map += `║  ◈ ${pattern.padEnd(20)}  ║\n`;
    });

    map += '╚══════════════════════════════╝';

    return map;
  }

  /**
   * Create ASCII mandala
   */
  static createMandala(depth: number, elements: string[]): string {
    const layers = Math.ceil(depth * 3) + 1;
    const size = layers * 2 + 1;
    const center = Math.floor(size / 2);

    // Create grid
    const grid: string[][] = Array(size).fill(null).map(() => Array(size).fill(' '));

    // Center
    grid[center][center] = '◉';

    // Add layers
    for (let layer = 1; layer <= layers; layer++) {
      const symbols = this.getLayerSymbols(layer, elements);

      // Top and bottom
      for (let x = center - layer; x <= center + layer; x++) {
        if (x >= 0 && x < size) {
          if (center - layer >= 0) grid[center - layer][x] = symbols[0];
          if (center + layer < size) grid[center + layer][x] = symbols[1];
        }
      }

      // Left and right
      for (let y = center - layer + 1; y < center + layer; y++) {
        if (y >= 0 && y < size) {
          if (center - layer >= 0) grid[y][center - layer] = symbols[2];
          if (center + layer < size) grid[y][center + layer] = symbols[3];
        }
      }
    }

    return grid.map(row => row.join(' ')).join('\n');
  }

  /**
   * Get layer symbols for mandala
   */
  private static getLayerSymbols(layer: number, elements: string[]): string[] {
    const patterns = [
      ['·', '·', '·', '·'],
      ['○', '○', '○', '○'],
      ['◉', '◉', '◉', '◉'],
      ['◈', '◈', '◈', '◈']
    ];

    return patterns[Math.min(layer - 1, patterns.length - 1)];
  }

  /**
   * Get element symbol
   */
  private static getElementSymbol(element: string): string {
    const symbols: Record<string, string> = {
      fire: '🔥',
      water: '💧',
      earth: '🌍',
      air: '💨',
      aether: '✨',
      shadow: '🌑'
    };

    return symbols[element] || '◉';
  }

  /**
   * Create journey summary card
   */
  static createSummaryCard(stats: any): string {
    const card = `
╭─────────────────────────────╮
│    JOURNEY SUMMARY          │
├─────────────────────────────┤
│ Duration: ${stats.duration || '0'} min        │
│ Depth: ${this.createDepthIndicator(stats.depth || 0)}
│ Elements: ${stats.elements?.join(', ') || 'none'}
│ Pattern: ${stats.pattern || 'emerging'}
├─────────────────────────────┤
│ Next: ${stats.nextInvitation || 'Continue exploring'}
╰─────────────────────────────╯
    `;

    return card;
  }
}

export default JourneyVisualization;