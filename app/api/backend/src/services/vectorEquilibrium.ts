// vectorEquilibrium.ts
// Foundational geometric structure for Aether center using Fuller's Vector Equilibrium
// Models phase transitions through jitterbug transformation

import { ElementalBalance } from "../lib/geometryEngine";

// Sacred geometric constants
const PHI = 1.618033988749895;
const SQRT_2 = 1.41421356237;
const SQRT_3 = 1.73205080757;

// Vector Equilibrium has 12 vertices around 1 center (13 total)
const VE_VERTICES = 12;
const VE_EDGES = 24;
const VE_FACES = 14; // 8 triangles + 6 squares

// Jitterbug transformation phases (Fuller's discovery)
export enum JitterbugPhase {
  VECTOR_EQUILIBRIUM = "vector_equilibrium", // Fully expanded - perfect balance
  ICOSAHEDRON = "icosahedron", // First contraction - water dominant
  OCTAHEDRON = "octahedron", // Further contraction - fire/air
  TETRAHEDRON = "tetrahedron", // Maximum contraction - earth
  REVERSE_TETRAHEDRON = "reverse_tetrahedron", // Inversion point - void/death
  EXPANDING_OCTAHEDRON = "expanding_octahedron", // Rebirth begins
  EXPANDING_ICOSAHEDRON = "expanding_icosahedron", // Life force returns
  RETURN_TO_VE = "return_to_ve", // Complete cycle
}

// Elemental correspondences to jitterbug phases
const PHASE_ELEMENTS = {
  [JitterbugPhase.VECTOR_EQUILIBRIUM]: "aether",
  [JitterbugPhase.ICOSAHEDRON]: "water",
  [JitterbugPhase.OCTAHEDRON]: "air",
  [JitterbugPhase.TETRAHEDRON]: "earth",
  [JitterbugPhase.REVERSE_TETRAHEDRON]: "void", // Water 2 - death state
  [JitterbugPhase.EXPANDING_OCTAHEDRON]: "fire",
  [JitterbugPhase.EXPANDING_ICOSAHEDRON]: "water", // Water rebirth
  [JitterbugPhase.RETURN_TO_VE]: "aether",
};

// Transformation ratios for each phase
const PHASE_RATIOS = {
  [JitterbugPhase.VECTOR_EQUILIBRIUM]: 1.0,
  [JitterbugPhase.ICOSAHEDRON]: 0.951057, // cos(18°)
  [JitterbugPhase.OCTAHEDRON]: 0.707107, // 1/√2
  [JitterbugPhase.TETRAHEDRON]: 0.612372, // Complex ratio
  [JitterbugPhase.REVERSE_TETRAHEDRON]: 0.5, // Midpoint of void
  [JitterbugPhase.EXPANDING_OCTAHEDRON]: 0.707107,
  [JitterbugPhase.EXPANDING_ICOSAHEDRON]: 0.951057,
  [JitterbugPhase.RETURN_TO_VE]: 1.0,
};

// Vertex class for VE points
export class Vertex {
  constructor(
    public x: number,
    public y: number,
    public z: number,
    public element?: string,
  ) {}

  // Transform vertex according to jitterbug phase
  transform(phase: JitterbugPhase, center: Vertex): Vertex {
    const ratio = PHASE_RATIOS[phase];
    const dx = this.x - center.x;
    const dy = this.y - center.y;
    const dz = this.z - center.z;

    // Apply phase-specific transformations
    switch (phase) {
      case JitterbugPhase.REVERSE_TETRAHEDRON:
        // Inversion through center (death/void state)
        return new Vertex(
          center.x - dx * ratio,
          center.y - dy * ratio,
          center.z - dz * ratio,
          "void",
        );

      case JitterbugPhase.ICOSAHEDRON:
      case JitterbugPhase.EXPANDING_ICOSAHEDRON:
        // Twist transformation for water phases
        const angle =
          phase === JitterbugPhase.ICOSAHEDRON ? Math.PI / 5 : -Math.PI / 5;
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        return new Vertex(
          center.x + (dx * cos - dy * sin) * ratio,
          center.y + (dx * sin + dy * cos) * ratio,
          center.z + dz * ratio,
          "water",
        );

      default:
        // Simple radial scaling for other phases
        return new Vertex(
          center.x + dx * ratio,
          center.y + dy * ratio,
          center.z + dz * ratio,
          PHASE_ELEMENTS[phase],
        );
    }
  }

  // Calculate distance to another vertex
  distanceTo(other: Vertex): number {
    const dx = this.x - other.x;
    const dy = this.y - other.y;
    const dz = this.z - other.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }
}

// Main Vector Equilibrium class
export class VectorEquilibrium {
  private vertices: Vertex[] = [];
  private center: Vertex;
  private radius: number;
  private currentPhase: JitterbugPhase = JitterbugPhase.VECTOR_EQUILIBRIUM;
  private phaseTransition: number = 0; // 0-1 for smooth transitions

  constructor(
    centerX: number = 0,
    centerY: number = 0,
    centerZ: number = 0,
    radius: number = 100,
  ) {
    this.center = new Vertex(centerX, centerY, centerZ, "aether");
    this.radius = radius;
    this.initializeVertices();
  }

  // Initialize the 12 vertices of the VE
  private initializeVertices(): void {
    this.vertices = [];

    // VE vertices are at the corners of a cuboctahedron
    // 4 vertices in upper square
    const upperSquareY = this.radius / SQRT_2;
    const squareRadius = this.radius / SQRT_2;

    for (let i = 0; i < 4; i++) {
      const angle = (i * Math.PI) / 2 + Math.PI / 4;
      this.vertices.push(
        new Vertex(
          this.center.x + squareRadius * Math.cos(angle),
          this.center.y + upperSquareY,
          this.center.z + squareRadius * Math.sin(angle),
          i < 2 ? "fire" : "air",
        ),
      );
    }

    // 4 vertices in lower square (rotated 45°)
    const lowerSquareY = -this.radius / SQRT_2;

    for (let i = 0; i < 4; i++) {
      const angle = (i * Math.PI) / 2;
      this.vertices.push(
        new Vertex(
          this.center.x + squareRadius * Math.cos(angle),
          this.center.y + lowerSquareY,
          this.center.z + squareRadius * Math.sin(angle),
          i < 2 ? "earth" : "water",
        ),
      );
    }

    // 4 vertices in middle square (equator)
    for (let i = 0; i < 4; i++) {
      const angle = (i * Math.PI) / 2 + Math.PI / 4;
      this.vertices.push(
        new Vertex(
          this.center.x + this.radius * Math.cos(angle),
          this.center.y,
          this.center.z + this.radius * Math.sin(angle),
          "aether",
        ),
      );
    }
  }

  // Get current vertices (with transformations applied)
  getVertices(): Vertex[] {
    if (this.phaseTransition === 0) {
      return this.vertices.map((v) =>
        v.transform(this.currentPhase, this.center),
      );
    }

    // Interpolate between phases
    const fromPhase = this.currentPhase;
    const toPhase = this.getNextPhase(fromPhase);

    return this.vertices.map((v) => {
      const from = v.transform(fromPhase, this.center);
      const to = v.transform(toPhase, this.center);

      return new Vertex(
        from.x + (to.x - from.x) * this.phaseTransition,
        from.y + (to.y - from.y) * this.phaseTransition,
        from.z + (to.z - from.z) * this.phaseTransition,
        this.phaseTransition > 0.5 ? to.element : from.element,
      );
    });
  }

  // Get edges connecting vertices
  getEdges(): Array<[number, number]> {
    const edges: Array<[number, number]> = [];

    // Upper square edges
    for (let i = 0; i < 4; i++) {
      edges.push([i, (i + 1) % 4]);
    }

    // Lower square edges
    for (let i = 4; i < 8; i++) {
      edges.push([i, 4 + ((i - 4 + 1) % 4)]);
    }

    // Middle square edges
    for (let i = 8; i < 12; i++) {
      edges.push([i, 8 + ((i - 8 + 1) % 4)]);
    }

    // Vertical edges connecting squares
    edges.push([0, 8], [1, 10], [2, 8], [3, 10]); // Upper to middle
    edges.push([4, 9], [5, 11], [6, 9], [7, 11]); // Lower to middle
    edges.push([0, 5], [1, 4], [2, 7], [3, 6]); // Upper to lower diagonals

    return edges;
  }

  // Get triangular faces
  getTriangularFaces(): Array<[number, number, number]> {
    return [
      // Upper triangles
      [0, 1, 10],
      [1, 2, 8],
      [2, 3, 10],
      [3, 0, 8],
      // Lower triangles
      [4, 5, 11],
      [5, 6, 9],
      [6, 7, 11],
      [7, 4, 9],
    ];
  }

  // Get square faces
  getSquareFaces(): Array<[number, number, number, number]> {
    return [
      [0, 1, 4, 5],
      [1, 2, 7, 4],
      [2, 3, 6, 7],
      [3, 0, 5, 6],
      [8, 9, 11, 10],
      [0, 1, 2, 3], // Middle and upper squares
    ];
  }

  // Jitterbug transformation control
  setPhase(phase: JitterbugPhase, transition: number = 0): void {
    this.currentPhase = phase;
    this.phaseTransition = Math.max(0, Math.min(1, transition));
  }

  // Animate through jitterbug transformation
  animateJitterbug(deltaTime: number, speed: number = 1.0): void {
    this.phaseTransition += deltaTime * speed;

    if (this.phaseTransition >= 1.0) {
      this.currentPhase = this.getNextPhase(this.currentPhase);
      this.phaseTransition = 0;
    }
  }

  // Get next phase in jitterbug cycle
  private getNextPhase(current: JitterbugPhase): JitterbugPhase {
    const phases = Object.values(JitterbugPhase);
    const currentIndex = phases.indexOf(current);
    return phases[(currentIndex + 1) % phases.length];
  }

  // Calculate current coherence/balance
  getCoherence(): number {
    const vertices = this.getVertices();
    let totalDeviation = 0;
    let edgeCount = 0;

    // Check edge length consistency
    const edges = this.getEdges();
    const idealLength = this.radius * PHASE_RATIOS[this.currentPhase];

    edges.forEach(([i, j]) => {
      const length = vertices[i].distanceTo(vertices[j]);
      totalDeviation += Math.abs(length - idealLength);
      edgeCount++;
    });

    // Return coherence as percentage (100% = perfect VE)
    return Math.max(0, 100 - (totalDeviation / edgeCount / idealLength) * 100);
  }

  // Special Water 2 death/rebirth transformation
  initiateDeathRebirth(duration: number = 5000): Promise<void> {
    return new Promise((resolve) => {
      // Move to death state (reverse tetrahedron)
      this.setPhase(JitterbugPhase.REVERSE_TETRAHEDRON, 0);

      // Animate through void
      const startTime = Date.now();
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = elapsed / duration;

        if (progress < 0.5) {
          // Contraction to void
          this.phaseTransition = progress * 2;
        } else if (progress < 1.0) {
          // Expansion from void
          this.setPhase(
            JitterbugPhase.EXPANDING_OCTAHEDRON,
            (progress - 0.5) * 2,
          );
        } else {
          // Complete rebirth
          this.setPhase(JitterbugPhase.VECTOR_EQUILIBRIUM, 0);
          resolve();
          return;
        }

        // Use setTimeout instead of requestAnimationFrame for Node.js
        setTimeout(animate, 16); // ~60fps equivalent
      };

      animate();
    });
  }

  // Calculate elemental balance based on current phase
  getElementalBalance(): ElementalBalance {
    const vertices = this.getVertices();
    const balance: ElementalBalance = {
      fire: 0,
      water: 0,
      earth: 0,
      air: 0,
      aether: 0,
    };

    // Count vertices by element
    vertices.forEach((v) => {
      if (v.element && v.element in balance) {
        balance[v.element as keyof ElementalBalance]++;
      }
    });

    // Add phase-specific weighting
    const phaseElement = PHASE_ELEMENTS[this.currentPhase];
    if (phaseElement in balance) {
      balance[phaseElement as keyof ElementalBalance] += 20;
    }

    // Normalize to percentages
    const total = Object.values(balance).reduce((sum, val) => sum + val, 0);
    Object.keys(balance).forEach((key) => {
      balance[key as keyof ElementalBalance] = Math.round(
        (balance[key as keyof ElementalBalance]! / total) * 100,
      );
    });

    return balance;
  }

  // Generate SVG representation of current state
  generateSVG(width: number = 400, height: number = 400): string {
    const vertices = this.getVertices();
    const edges = this.getEdges();
    const centerX = width / 2;
    const centerY = height / 2;
    const scale = Math.min(width, height) / (this.radius * 4);

    let svg = `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">`;

    // Background
    svg += `<rect width="${width}" height="${height}" fill="#0a0a0a" />`;

    // Draw edges
    svg += '<g id="edges" stroke="#ffffff" stroke-width="1" opacity="0.6">';
    edges.forEach(([i, j]) => {
      const v1 = vertices[i];
      const v2 = vertices[j];
      const x1 = centerX + (v1.x - this.center.x) * scale;
      const y1 = centerY - (v1.y - this.center.y) * scale; // Flip Y for SVG
      const x2 = centerX + (v2.x - this.center.x) * scale;
      const y2 = centerY - (v2.y - this.center.y) * scale;

      svg += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" />`;
    });
    svg += "</g>";

    // Draw vertices
    svg += '<g id="vertices">';
    vertices.forEach((v, i) => {
      const x = centerX + (v.x - this.center.x) * scale;
      const y = centerY - (v.y - this.center.y) * scale;
      const color = this.getElementColor(v.element);

      svg += `<circle cx="${x}" cy="${y}" r="5" fill="${color}" opacity="0.8" />`;
    });
    svg += "</g>";

    // Draw center
    svg += `<circle cx="${centerX}" cy="${centerY}" r="8" fill="#9B5DE5" opacity="0.9" />`;

    // Phase indicator
    svg += `<text x="10" y="20" fill="#ffffff" font-family="Arial" font-size="14">Phase: ${this.currentPhase}</text>`;
    svg += `<text x="10" y="40" fill="#ffffff" font-family="Arial" font-size="14">Coherence: ${this.getCoherence().toFixed(1)}%</text>`;

    svg += "</svg>";
    return svg;
  }

  private getElementColor(element?: string): string {
    const colors: Record<string, string> = {
      fire: "#FF6B35",
      water: "#2E86AB",
      earth: "#7D4F39",
      air: "#B8B8D1",
      aether: "#9B5DE5",
      void: "#1a1a1a",
    };
    return colors[element || "aether"] || "#ffffff";
  }
}

// Water 2 Death/Rebirth Process Manager
export class Water2Process {
  private ve: VectorEquilibrium;
  private stage: "descent" | "void" | "ascent" | "integration" = "descent";
  private progress: number = 0;

  constructor(ve: VectorEquilibrium) {
    this.ve = ve;
  }

  // Initiate the death/rebirth cycle
  async initiate(): Promise<void> {
    this.stage = "descent";
    this.progress = 0;

    // Phase 1: Descent into void
    await this.descend();

    // Phase 2: Void state (integration of shadow)
    await this.voidState();

    // Phase 3: Ascent/Rebirth
    await this.ascend();

    // Phase 4: Integration
    await this.integrate();
  }

  private async descend(): Promise<void> {
    this.stage = "descent";

    // Contract through phases
    const phases = [
      JitterbugPhase.ICOSAHEDRON,
      JitterbugPhase.OCTAHEDRON,
      JitterbugPhase.TETRAHEDRON,
      JitterbugPhase.REVERSE_TETRAHEDRON,
    ];

    for (const phase of phases) {
      this.ve.setPhase(phase, 0);
      await this.animateTransition(1000);
      this.progress += 0.2;
    }
  }

  private async voidState(): Promise<void> {
    this.stage = "void";

    // Hold in void for integration
    await new Promise((resolve) => setTimeout(resolve, 2000));
    this.progress = 0.5;
  }

  private async ascend(): Promise<void> {
    this.stage = "ascent";

    // Expand through phases
    const phases = [
      JitterbugPhase.EXPANDING_OCTAHEDRON,
      JitterbugPhase.EXPANDING_ICOSAHEDRON,
      JitterbugPhase.RETURN_TO_VE,
    ];

    for (const phase of phases) {
      this.ve.setPhase(phase, 0);
      await this.animateTransition(1000);
      this.progress += 0.15;
    }
  }

  private async integrate(): Promise<void> {
    this.stage = "integration";

    // Return to balanced VE
    this.ve.setPhase(JitterbugPhase.VECTOR_EQUILIBRIUM, 0);
    await this.animateTransition(1000);
    this.progress = 1.0;
  }

  private animateTransition(duration: number): Promise<void> {
    return new Promise((resolve) => {
      const startTime = Date.now();
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        this.ve.setPhase(this.ve["currentPhase"], progress);

        if (progress >= 1) {
          resolve();
        } else {
          // Use setTimeout instead of requestAnimationFrame for Node.js
          setTimeout(animate, 16); // ~60fps equivalent
        }
      };
      animate();
    });
  }

  getStage(): string {
    return this.stage;
  }

  getProgress(): number {
    return this.progress;
  }

  // Get archetypal message for current stage
  getArchetypalMessage(): string {
    switch (this.stage) {
      case "descent":
        return "Releasing form, surrendering to the dissolution of what was...";
      case "void":
        return "In the sacred darkness, all potentials exist simultaneously...";
      case "ascent":
        return "From the depths, new life emerges, transformed and renewed...";
      case "integration":
        return "Wholeness returns, enriched by the journey through shadow...";
      default:
        return "The eternal cycle continues...";
    }
  }
}

// Utility functions for VE calculations
export function calculateVEMetrics(ve: VectorEquilibrium): {
  coherence: number;
  symmetry: number;
  elementalBalance: ElementalBalance;
  phase: JitterbugPhase;
} {
  return {
    coherence: ve.getCoherence(),
    symmetry: calculateSymmetry(ve),
    elementalBalance: ve.getElementalBalance(),
    phase: ve["currentPhase"],
  };
}

function calculateSymmetry(ve: VectorEquilibrium): number {
  const vertices = ve.getVertices();
  const center = vertices.reduce(
    (acc, v) => ({
      x: acc.x + v.x / vertices.length,
      y: acc.y + v.y / vertices.length,
      z: acc.z + v.z / vertices.length,
    }),
    { x: 0, y: 0, z: 0 },
  );

  // Calculate deviation from center
  let totalDeviation = 0;
  vertices.forEach((v) => {
    const dist = Math.sqrt(
      Math.pow(v.x - center.x, 2) +
        Math.pow(v.y - center.y, 2) +
        Math.pow(v.z - center.z, 2),
    );
    totalDeviation += dist;
  });

  const avgDeviation = totalDeviation / vertices.length;
  const maxDeviation = 100; // Arbitrary max for normalization

  return Math.max(0, 100 - (avgDeviation / maxDeviation) * 100);
}

// Export for use in oracle system
export default VectorEquilibrium;
