// 📁 BACKEND/src/lib/geometryEngine.ts
// Sacred Geometry Engine based on Fuller's Vector Equilibrium
// Generates dynamic mandalas reflecting elemental consciousness states

import { PetalTransitions } from "./harmonicPetalMap";

// Sacred Constants
const PHI = 1.618033988749895; // Golden Ratio
const PHI_INVERSE = 0.618033988749895; // 1/PHI
const VECTOR_EQUILIBRIUM_ANGLE = 60; // Degrees - fundamental angle in VE
const SACRED_7 = 7; // Seven directions of VE (6 vertices + center)
const SACRED_12 = 12; // Twelve edges of VE
const SACRED_13 = 13; // Twelve around one

// Harmonic Ratios based on musical intervals
const HARMONIC_RATIOS = {
  unison: 1,
  octave: 2,
  fifth: 3 / 2,
  fourth: 4 / 3,
  majorThird: 5 / 4,
  minorThird: 6 / 5,
  majorSixth: 5 / 3,
  minorSixth: 8 / 5,
  wholeTone: 9 / 8,
  semitone: 16 / 15,
};

// Element to Color mapping with sacred color theory
const ELEMENT_COLORS = {
  fire: {
    primary: "#FF6B35",
    secondary: "#F7931E",
    tertiary: "#FFCD3C",
    glow: "rgba(255, 107, 53, 0.3)",
  },
  water: {
    primary: "#2E86AB",
    secondary: "#54C6EB",
    tertiary: "#8ECAE6",
    glow: "rgba(46, 134, 171, 0.3)",
  },
  earth: {
    primary: "#7D4F39",
    secondary: "#AA8F66",
    tertiary: "#D4A574",
    glow: "rgba(125, 79, 57, 0.3)",
  },
  air: {
    primary: "#B8B8D1",
    secondary: "#D6D6F5",
    tertiary: "#E8E8FC",
    glow: "rgba(184, 184, 209, 0.3)",
  },
  aether: {
    primary: "#9B5DE5",
    secondary: "#C77DFF",
    tertiary: "#E0AAFF",
    glow: "rgba(155, 93, 229, 0.3)",
  },
};

// Geometric transformation functions
class GeometricTransforms {
  // Rotate point around origin
  static rotatePoint(x: number, y: number, angle: number): [number, number] {
    const rad = (angle * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    return [x * cos - y * sin, x * sin + y * cos];
  }

  // Scale point by factor
  static scalePoint(x: number, y: number, factor: number): [number, number] {
    return [x * factor, y * factor];
  }

  // Apply golden ratio spiral transformation
  static goldenSpiralTransform(
    x: number,
    y: number,
    iteration: number,
  ): [number, number] {
    const angle = iteration * 137.5; // Golden angle
    const radius = Math.sqrt(x * x + y * y) * Math.pow(PHI, iteration / 10);
    const [nx, ny] = this.rotatePoint(x, y, angle);
    return [
      (nx * radius) / Math.sqrt(x * x + y * y),
      (ny * radius) / Math.sqrt(x * x + y * y),
    ];
  }
}

// Vector Equilibrium Generator
class VectorEquilibrium {
  private center: [number, number];
  private radius: number;

  constructor(centerX: number, centerY: number, radius: number) {
    this.center = [centerX, centerY];
    this.radius = radius;
  }

  // Generate the 12 vertices of a cuboctahedron (vector equilibrium)
  generateVertices(): Array<[number, number]> {
    const vertices: Array<[number, number]> = [];

    // Top square vertices
    for (let i = 0; i < 4; i++) {
      const angle = ((i * 90 + 45) * Math.PI) / 180;
      vertices.push([
        this.center[0] + this.radius * Math.cos(angle),
        this.center[1] + this.radius * Math.sin(angle) * PHI_INVERSE,
      ]);
    }

    // Middle hexagon vertices
    for (let i = 0; i < 6; i++) {
      const angle = (i * 60 * Math.PI) / 180;
      vertices.push([
        this.center[0] + this.radius * Math.cos(angle) * PHI,
        this.center[1] + this.radius * Math.sin(angle),
      ]);
    }

    // Bottom square vertices (rotated 45 degrees from top)
    for (let i = 0; i < 4; i++) {
      const angle = (i * 90 * Math.PI) / 180;
      vertices.push([
        this.center[0] + this.radius * Math.cos(angle),
        this.center[1] - this.radius * Math.sin(angle) * PHI_INVERSE,
      ]);
    }

    return vertices;
  }

  // Generate edges connecting vertices
  generateEdges(): Array<[[number, number], [number, number]]> {
    const vertices = this.generateVertices();
    const edges: Array<[[number, number], [number, number]]> = [];

    // Define connectivity based on VE structure
    const connections = [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 0], // Top square
      [4, 5],
      [5, 6],
      [6, 7],
      [7, 8],
      [8, 9],
      [9, 4], // Hexagon
      [10, 11],
      [11, 12],
      [12, 13],
      [13, 10], // Bottom square
      [0, 4],
      [1, 6],
      [2, 8],
      [3, 10], // Vertical connections
      [4, 10],
      [5, 11],
      [6, 12],
      [7, 13],
      [8, 10],
      [9, 11], // Diagonal connections
    ];

    connections.forEach(([i, j]) => {
      if (vertices[i] && vertices[j]) {
        edges.push([vertices[i], vertices[j]]);
      }
    });

    return edges;
  }
}

// Mandala Pattern Generators
class MandalaPatterns {
  // Generate Flower of Life pattern
  static flowerOfLife(
    center: [number, number],
    radius: number,
    rings: number,
  ): string {
    let path = "";

    for (let ring = 0; ring <= rings; ring++) {
      const circleRadius = radius;
      const distance = ring * radius * 2;

      if (ring === 0) {
        path += `M ${center[0] + circleRadius} ${center[1]} `;
        path += `A ${circleRadius} ${circleRadius} 0 1 0 ${center[0] - circleRadius} ${center[1]} `;
        path += `A ${circleRadius} ${circleRadius} 0 1 0 ${center[0] + circleRadius} ${center[1]} `;
      } else {
        for (let i = 0; i < 6 * ring; i++) {
          const angle = (((i * 60) / ring) * Math.PI) / 180;
          const cx = center[0] + distance * Math.cos(angle);
          const cy = center[1] + distance * Math.sin(angle);

          path += `M ${cx + circleRadius} ${cy} `;
          path += `A ${circleRadius} ${circleRadius} 0 1 0 ${cx - circleRadius} ${cy} `;
          path += `A ${circleRadius} ${circleRadius} 0 1 0 ${cx + circleRadius} ${cy} `;
        }
      }
    }

    return path;
  }

  // Generate Sri Yantra-inspired triangular pattern
  static sriYantraPattern(
    center: [number, number],
    radius: number,
    element: string,
  ): string {
    let path = "";
    const levels = element === "aether" ? 9 : 5; // More complex for aether

    for (let level = 0; level < levels; level++) {
      const levelRadius = radius * (1 - level / levels);
      const rotation = level * 40; // Each level rotated

      // Upward triangles
      for (let i = 0; i < 3; i++) {
        const angle1 = ((i * 120 + rotation) * Math.PI) / 180;
        const angle2 = (((i + 1) * 120 + rotation) * Math.PI) / 180;

        const p1: [number, number] = [
          center[0] + levelRadius * Math.cos(angle1),
          center[1] + levelRadius * Math.sin(angle1),
        ];
        const p2: [number, number] = [
          center[0] + levelRadius * Math.cos(angle2),
          center[1] + levelRadius * Math.sin(angle2),
        ];
        const p3: [number, number] = [
          center[0],
          center[1] - levelRadius * PHI_INVERSE,
        ];

        path += `M ${p1[0]} ${p1[1]} L ${p2[0]} ${p2[1]} L ${p3[0]} ${p3[1]} Z `;
      }

      // Downward triangles
      for (let i = 0; i < 3; i++) {
        const angle1 = ((i * 120 + rotation + 60) * Math.PI) / 180;
        const angle2 = (((i + 1) * 120 + rotation + 60) * Math.PI) / 180;

        const p1: [number, number] = [
          center[0] + levelRadius * Math.cos(angle1) * PHI_INVERSE,
          center[1] + levelRadius * Math.sin(angle1) * PHI_INVERSE,
        ];
        const p2: [number, number] = [
          center[0] + levelRadius * Math.cos(angle2) * PHI_INVERSE,
          center[1] + levelRadius * Math.sin(angle2) * PHI_INVERSE,
        ];
        const p3: [number, number] = [
          center[0],
          center[1] + levelRadius * PHI_INVERSE * PHI_INVERSE,
        ];

        path += `M ${p1[0]} ${p1[1]} L ${p2[0]} ${p2[1]} L ${p3[0]} ${p3[1]} Z `;
      }
    }

    return path;
  }

  // Generate Metatron's Cube pattern
  static metatronsCube(center: [number, number], radius: number): string {
    let path = "";
    const ve = new VectorEquilibrium(center[0], center[1], radius);
    const vertices = ve.generateVertices();

    // Connect all vertices to create Metatron's Cube
    for (let i = 0; i < vertices.length; i++) {
      for (let j = i + 1; j < vertices.length; j++) {
        path += `M ${vertices[i][0]} ${vertices[i][1]} L ${vertices[j][0]} ${vertices[j][1]} `;
      }
    }

    return path;
  }
}

// Main Geometry Engine
export class GeometryEngine {
  private width: number;
  private height: number;
  private center: [number, number];

  constructor(width: number = 800, height: number = 800) {
    this.width = width;
    this.height = height;
    this.center = [width / 2, height / 2];
  }

  // Generate a complete mandala based on elemental state
  generateMandala(elementalState: ElementalBalance): string {
    const svg = this.createSVGContainer();
    const layers: string[] = [];

    // Background gradient based on dominant element
    const dominantElement = this.getDominantElement(elementalState);
    layers.push(this.createBackgroundGradient(dominantElement));

    // Layer 1: Vector Equilibrium foundation
    layers.push(this.createVectorEquilibriumLayer(elementalState));

    // Layer 2: Elemental patterns
    layers.push(this.createElementalPatternLayer(elementalState));

    // Layer 3: Harmonic resonance patterns
    layers.push(this.createHarmonicLayer(elementalState));

    // Layer 4: Sacred geometry overlays
    layers.push(this.createSacredGeometryLayer(elementalState));

    // Layer 5: Consciousness field
    layers.push(this.createConsciousnessField(elementalState));

    return this.assembleSVG(svg, layers);
  }

  private createSVGContainer(): string {
    return `<svg width="${this.width}" height="${this.height}" viewBox="0 0 ${this.width} ${this.height}" xmlns="http://www.w3.org/2000/svg">`;
  }

  private createBackgroundGradient(element: string): string {
    const colors = ELEMENT_COLORS[element as keyof typeof ELEMENT_COLORS];
    return `
      <defs>
        <radialGradient id="bgGradient">
          <stop offset="0%" style="stop-color:${colors.tertiary};stop-opacity:0.2" />
          <stop offset="50%" style="stop-color:${colors.secondary};stop-opacity:0.1" />
          <stop offset="100%" style="stop-color:${colors.primary};stop-opacity:0.05" />
        </radialGradient>
      </defs>
      <rect width="${this.width}" height="${this.height}" fill="url(#bgGradient)" />
    `;
  }

  private createVectorEquilibriumLayer(
    elementalState: ElementalBalance,
  ): string {
    const baseRadius = Math.min(this.width, this.height) * 0.3;
    const ve = new VectorEquilibrium(
      this.center[0],
      this.center[1],
      baseRadius,
    );
    const edges = ve.generateEdges();

    let layer = '<g id="vector-equilibrium" opacity="0.6">';

    // Draw edges with elemental influence
    edges.forEach(([p1, p2], index) => {
      const element = this.getElementForIndex(index, elementalState);
      const color =
        ELEMENT_COLORS[element as keyof typeof ELEMENT_COLORS].primary;
      const strokeWidth = 2 + (elementalState[element] || 0) * 0.02;

      layer += `<line x1="${p1[0]}" y1="${p1[1]}" x2="${p2[0]}" y2="${p2[1]}"
                      stroke="${color}" stroke-width="${strokeWidth}"
                      stroke-linecap="round" opacity="0.8" />`;
    });

    layer += "</g>";
    return layer;
  }

  private createElementalPatternLayer(
    elementalState: ElementalBalance,
  ): string {
    let layer = '<g id="elemental-patterns">';
    const elements = Object.keys(elementalState) as Array<
      keyof ElementalBalance
    >;

    elements.forEach((element, index) => {
      const strength = elementalState[element] || 0;
      if (strength > 10) {
        // Only show if element has significant presence
        const angle = (index * 72 * Math.PI) / 180; // Pentagon arrangement
        const distance = this.width * 0.25;
        const cx = this.center[0] + distance * Math.cos(angle);
        const cy = this.center[1] + distance * Math.sin(angle);

        layer += this.createElementalSymbol(element, cx, cy, strength);
      }
    });

    layer += "</g>";
    return layer;
  }

  private createElementalSymbol(
    element: string,
    cx: number,
    cy: number,
    strength: number,
  ): string {
    const radius = 20 + strength * 0.5;
    const colors = ELEMENT_COLORS[element as keyof typeof ELEMENT_COLORS];

    switch (element) {
      case "fire":
        // Upward triangle
        return `<path d="M ${cx} ${cy - radius} L ${cx - radius * 0.866} ${cy + radius * 0.5}
                        L ${cx + radius * 0.866} ${cy + radius * 0.5} Z"
                        fill="${colors.primary}" opacity="${strength / 100}" />`;

      case "water":
        // Downward triangle
        return `<path d="M ${cx} ${cy + radius} L ${cx - radius * 0.866} ${cy - radius * 0.5}
                        L ${cx + radius * 0.866} ${cy - radius * 0.5} Z"
                        fill="${colors.primary}" opacity="${strength / 100}" />`;

      case "earth":
        // Square
        return `<rect x="${cx - radius * 0.7}" y="${cy - radius * 0.7}"
                      width="${radius * 1.4}" height="${radius * 1.4}"
                      fill="${colors.primary}" opacity="${strength / 100}" />`;

      case "air":
        // Circle
        return `<circle cx="${cx}" cy="${cy}" r="${radius}"
                        fill="none" stroke="${colors.primary}"
                        stroke-width="3" opacity="${strength / 100}" />`;

      case "aether":
        // Pentagon
        let path = "M ";
        for (let i = 0; i < 5; i++) {
          const angle = ((i * 72 - 90) * Math.PI) / 180;
          const x = cx + radius * Math.cos(angle);
          const y = cy + radius * Math.sin(angle);
          path += `${x} ${y} ${i < 4 ? "L " : "Z"}`;
        }
        return `<path d="${path}" fill="${colors.primary}" opacity="${strength / 100}" />`;

      default:
        return "";
    }
  }

  private createHarmonicLayer(elementalState: ElementalBalance): string {
    let layer = '<g id="harmonic-resonance" opacity="0.4">';
    const baseRadius = Math.min(this.width, this.height) * 0.35;

    // Create harmonic circles based on elemental balance
    Object.entries(elementalState).forEach(([element, value], index) => {
      if (value && value > 0) {
        const harmonic =
          Object.values(HARMONIC_RATIOS)[
            index % Object.values(HARMONIC_RATIOS).length
          ];
        const radius = baseRadius * harmonic * (value / 100);
        const colors = ELEMENT_COLORS[element as keyof typeof ELEMENT_COLORS];

        layer += `<circle cx="${this.center[0]}" cy="${this.center[1]}" r="${radius}"
                         fill="none" stroke="${colors.secondary}"
                         stroke-width="1" opacity="${value / 200}" />`;
      }
    });

    layer += "</g>";
    return layer;
  }

  private createSacredGeometryLayer(elementalState: ElementalBalance): string {
    let layer = '<g id="sacred-geometry" opacity="0.3">';
    const dominantElement = this.getDominantElement(elementalState);
    const baseRadius = Math.min(this.width, this.height) * 0.25;

    // Choose pattern based on dominant element
    switch (dominantElement) {
      case "fire":
        layer += `<path d="${MandalaPatterns.sriYantraPattern(this.center, baseRadius, "fire")}"
                       fill="none" stroke="${ELEMENT_COLORS.fire.primary}" stroke-width="1" />`;
        break;

      case "water":
        layer += `<path d="${MandalaPatterns.flowerOfLife(this.center, baseRadius * 0.1, 3)}"
                       fill="none" stroke="${ELEMENT_COLORS.water.primary}" stroke-width="1" />`;
        break;

      case "earth":
        layer += `<path d="${MandalaPatterns.metatronsCube(this.center, baseRadius)}"
                       fill="none" stroke="${ELEMENT_COLORS.earth.primary}" stroke-width="0.5" />`;
        break;

      case "air":
        // Spiral pattern
        layer += this.createSpiralPattern(
          baseRadius,
          ELEMENT_COLORS.air.primary,
        );
        break;

      case "aether":
        // All patterns combined with low opacity
        layer += `<g opacity="0.5">
                    <path d="${MandalaPatterns.sriYantraPattern(this.center, baseRadius * 0.8, "aether")}"
                          fill="none" stroke="${ELEMENT_COLORS.aether.primary}" stroke-width="0.5" />
                    <path d="${MandalaPatterns.flowerOfLife(this.center, baseRadius * 0.05, 2)}"
                          fill="none" stroke="${ELEMENT_COLORS.aether.secondary}" stroke-width="0.5" />
                  </g>`;
        break;
    }

    layer += "</g>";
    return layer;
  }

  private createSpiralPattern(radius: number, color: string): string {
    let path = "M " + this.center[0] + " " + this.center[1];
    const points = 1000;

    for (let i = 0; i < points; i++) {
      const angle = i * 0.1;
      const r = radius * (i / points) * PHI;
      const x = this.center[0] + r * Math.cos(angle * PHI);
      const y = this.center[1] + r * Math.sin(angle * PHI);
      path += ` L ${x} ${y}`;
    }

    return `<path d="${path}" fill="none" stroke="${color}" stroke-width="1" />`;
  }

  private createConsciousnessField(elementalState: ElementalBalance): string {
    let layer = '<g id="consciousness-field" opacity="0.2">';

    // Create interference patterns based on elemental interactions
    const totalEnergy = Object.values(elementalState).reduce(
      (sum, val) => sum + (val || 0),
      0,
    );
    const avgEnergy = totalEnergy / Object.keys(elementalState).length;

    // Radial pulse pattern
    for (let i = 0; i < 12; i++) {
      const radius =
        (avgEnergy / 100) * this.width * 0.4 * (1 + 0.1 * Math.sin(i * PHI));
      const opacity = 0.1 - i * 0.008;

      layer += `<circle cx="${this.center[0]}" cy="${this.center[1]}" r="${radius}"
                       fill="none" stroke="white" stroke-width="0.5" opacity="${opacity}" />`;
    }

    layer += "</g>";
    return layer;
  }

  private getDominantElement(elementalState: ElementalBalance): string {
    let maxElement = "aether";
    let maxValue = 0;

    Object.entries(elementalState).forEach(([element, value]) => {
      if (value && value > maxValue) {
        maxValue = value;
        maxElement = element;
      }
    });

    return maxElement;
  }

  private getElementForIndex(
    index: number,
    elementalState: ElementalBalance,
  ): string {
    const elements = Object.keys(elementalState);
    return elements[index % elements.length];
  }

  private assembleSVG(container: string, layers: string[]): string {
    return container + layers.join("") + "</svg>";
  }

  // Generate animated mandala
  generateAnimatedMandala(
    elementalState: ElementalBalance,
    duration: number = 10,
  ): string {
    const staticMandala = this.generateMandala(elementalState);

    // Add rotation animation to vector equilibrium
    const rotationAnimation = `
      <animateTransform
        attributeName="transform"
        attributeType="XML"
        type="rotate"
        from="0 ${this.center[0]} ${this.center[1]}"
        to="360 ${this.center[0]} ${this.center[1]}"
        dur="${duration}s"
        repeatCount="indefinite" />
    `;

    // Add pulsing animation to consciousness field
    const pulseAnimation = `
      <animate
        attributeName="opacity"
        values="0.1;0.3;0.1"
        dur="${duration / 3}s"
        repeatCount="indefinite" />
    `;

    // Insert animations into appropriate groups
    let animated = staticMandala.replace(
      '<g id="vector-equilibrium"',
      `<g id="vector-equilibrium">${rotationAnimation}`,
    );
    animated = animated.replace(
      '<g id="consciousness-field"',
      `<g id="consciousness-field">${pulseAnimation}`,
    );

    return animated;
  }

  // Generate personalized soul mandala incorporating birth data
  generateSoulMandala(
    elementalState: ElementalBalance,
    birthData?: {
      moonPhase?: string;
      season?: string;
      numerology?: number;
    },
  ): string {
    // Modify base mandala with personal resonances
    let mandala = this.generateMandala(elementalState);

    if (birthData?.moonPhase) {
      // Add moon phase geometry
      const moonRadius = this.width * 0.05;
      const moonSVG = this.createMoonPhase(birthData.moonPhase, moonRadius);
      mandala = mandala.replace("</svg>", moonSVG + "</svg>");
    }

    if (birthData?.numerology) {
      // Add numerological pattern
      const numPattern = this.createNumerologicalPattern(birthData.numerology);
      mandala = mandala.replace("</svg>", numPattern + "</svg>");
    }

    return mandala;
  }

  private createMoonPhase(phase: string, radius: number): string {
    const cx = this.width * 0.9;
    const cy = this.height * 0.1;

    let moonPath = "";
    switch (phase) {
      case "new_moon":
        moonPath = `<circle cx="${cx}" cy="${cy}" r="${radius}" fill="#333" opacity="0.8" />`;
        break;
      case "full_moon":
        moonPath = `<circle cx="${cx}" cy="${cy}" r="${radius}" fill="#FFF" opacity="0.9" />`;
        break;
      case "first_quarter":
        moonPath = `<path d="M ${cx} ${cy - radius} A ${radius} ${radius} 0 0 1 ${cx} ${cy + radius}
                           A ${radius * 0.5} ${radius} 0 0 0 ${cx} ${cy - radius}"
                           fill="#FFF" opacity="0.8" />`;
        break;
      default:
        moonPath = `<circle cx="${cx}" cy="${cy}" r="${radius}" fill="#AAA" opacity="0.7" />`;
    }

    return `<g id="moon-phase">${moonPath}</g>`;
  }

  private createNumerologicalPattern(number: number): string {
    let pattern = '<g id="numerology" opacity="0.15">';
    const angleStep = 360 / number;

    for (let i = 0; i < number; i++) {
      const angle = (i * angleStep * Math.PI) / 180;
      const x1 = this.center[0];
      const y1 = this.center[1];
      const x2 = this.center[0] + this.width * 0.4 * Math.cos(angle);
      const y2 = this.center[1] + this.width * 0.4 * Math.sin(angle);

      pattern += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"
                       stroke="gold" stroke-width="0.5" />`;
    }

    pattern += "</g>";
    return pattern;
  }
}

// Export types
export interface ElementalBalance {
  fire?: number;
  water?: number;
  earth?: number;
  air?: number;
  aether?: number;
}

export interface MandalaConfig {
  width?: number;
  height?: number;
  animated?: boolean;
  duration?: number;
  birthData?: {
    moonPhase?: string;
    season?: string;
    numerology?: number;
  };
}

// Utility function to extract elemental balance from user memories
export function calculateElementalBalance(memories: any[]): ElementalBalance {
  const balance: ElementalBalance = {
    fire: 0,
    water: 0,
    earth: 0,
    air: 0,
    aether: 0,
  };

  memories.forEach((memory) => {
    const element = memory.element as keyof ElementalBalance;
    if (element && balance.hasOwnProperty(element)) {
      balance[element] = (balance[element] || 0) + 1;
    }
  });

  // Normalize to percentages
  const total = Object.values(balance).reduce((sum, val) => sum + val, 0);
  if (total > 0) {
    Object.keys(balance).forEach((key) => {
      const element = key as keyof ElementalBalance;
      balance[element] = Math.round(((balance[element] || 0) / total) * 100);
    });
  }

  return balance;
}

// Legacy function for compatibility
export function generateMandalaPattern(element: string, phase: number): string {
  const transition = PetalTransitions.find((p) => p.from === element);
  const size = transition ? 100 * transition.multiplier : 100;
  return `M 0 0 L ${size} 0 A ${size} ${size} 0 1 1 0 ${size} Z`;
}
