// harmonicCodex.ts
// Maps Grant's sacred constants to elemental transitions and breath-geometry patterns
// Generates personalized spiral evolution paths based on harmonic resonance

import { PetalTransitions } from "../lib/harmonicPetalMap";
import { ElementalBalance } from "../lib/geometryEngine";
import {
  VectorEquilibrium,
  JitterbugPhase,
} from "../services/vectorEquilibrium";

// Grant's Sacred Constants
export const GRANT_CONSTANTS = {
  SQRT_10: 3.16227766017, // √10 - Breath foundation
  PHI: 1.618033988749895, // φ - Golden ratio
  E: 2.718281828459045, // e - Natural growth
  PI: 3.141592653589793, // π - Circle constant
} as const;

// Harmonic ratios derived from Grant's constants
export const HARMONIC_RATIOS = {
  BREATH_CYCLE: GRANT_CONSTANTS.SQRT_10, // 3.162... Basic breath rhythm
  GOLDEN_BREATH: GRANT_CONSTANTS.PHI * GRANT_CONSTANTS.SQRT_10, // 5.118... Extended breath
  NATURAL_SPIRAL: GRANT_CONSTANTS.E / GRANT_CONSTANTS.PHI, // 1.680... Growth factor
  CIRCLE_BREATH: GRANT_CONSTANTS.PI / GRANT_CONSTANTS.SQRT_10, // 0.994... Return cycle
  UNITY: GRANT_CONSTANTS.PI / GRANT_CONSTANTS.E, // 1.155... Integration
} as const;

// Elemental breath patterns based on Grant's work
export interface BreathPattern {
  inhale: number; // Duration in seconds
  hold: number; // Retention
  exhale: number; // Release
  pause: number; // Rest before next cycle
  ratio: number; // Harmonic constant used
  geometry: string; // SVG path for visualization
}

// Breath-geometry correspondences
export const ELEMENTAL_BREATH_PATTERNS: Record<string, BreathPattern> = {
  fire: {
    inhale: GRANT_CONSTANTS.SQRT_10,
    hold: GRANT_CONSTANTS.PHI,
    exhale: GRANT_CONSTANTS.SQRT_10 * 2,
    pause: 1,
    ratio: HARMONIC_RATIOS.BREATH_CYCLE,
    geometry: "M 0 0 L 100 -100 L 200 0", // Upward triangle
  },
  water: {
    inhale: GRANT_CONSTANTS.PI,
    hold: GRANT_CONSTANTS.PHI * 2,
    exhale: GRANT_CONSTANTS.PI * GRANT_CONSTANTS.PHI,
    pause: GRANT_CONSTANTS.E,
    ratio: HARMONIC_RATIOS.CIRCLE_BREATH,
    geometry: "M 0 0 Q 100 100 200 0", // Wave curve
  },
  earth: {
    inhale: GRANT_CONSTANTS.SQRT_10 * 2,
    hold: GRANT_CONSTANTS.SQRT_10 * 2,
    exhale: GRANT_CONSTANTS.SQRT_10 * 2,
    pause: GRANT_CONSTANTS.SQRT_10 * 2,
    ratio: HARMONIC_RATIOS.BREATH_CYCLE,
    geometry: "M 0 0 L 0 -100 L 100 -100 L 100 0 Z", // Square
  },
  air: {
    inhale: GRANT_CONSTANTS.E,
    hold: 0.5,
    exhale: GRANT_CONSTANTS.E * GRANT_CONSTANTS.PHI,
    pause: GRANT_CONSTANTS.PHI,
    ratio: HARMONIC_RATIOS.NATURAL_SPIRAL,
    geometry: "M 0 0 A 50 50 0 1 1 100 0", // Circle arc
  },
  aether: {
    inhale: GRANT_CONSTANTS.PHI * GRANT_CONSTANTS.E,
    hold: GRANT_CONSTANTS.PI,
    exhale: GRANT_CONSTANTS.PHI * GRANT_CONSTANTS.E,
    pause: GRANT_CONSTANTS.PI,
    ratio: HARMONIC_RATIOS.GOLDEN_BREATH,
    geometry: "M 0 0 L 30 -95 L 95 -30 L 65 70 L -65 70 L -95 -30 L -30 -95 Z", // Heptagon
  },
};

// Spiral evolution parameters
export interface SpiralEvolution {
  currentRadius: number;
  expansionRate: number;
  rotationAngle: number;
  breathPhase: number;
  harmonicResonance: number;
}

// Main Harmonic Codex class
export class HarmonicCodex {
  private elementalBalance: ElementalBalance;
  private currentBreathPattern: BreathPattern;
  private spiralEvolution: SpiralEvolution;
  private breathCycle: number = 0;
  private ve: VectorEquilibrium;

  constructor(elementalBalance: ElementalBalance) {
    this.elementalBalance = elementalBalance;
    this.ve = new VectorEquilibrium(0, 0, 0, 100);

    // Initialize with dominant element's breath pattern
    const dominantElement = this.getDominantElement();
    this.currentBreathPattern = ELEMENTAL_BREATH_PATTERNS[dominantElement];

    // Initialize spiral evolution
    this.spiralEvolution = {
      currentRadius: GRANT_CONSTANTS.SQRT_10 * 10,
      expansionRate: GRANT_CONSTANTS.PHI,
      rotationAngle: 0,
      breathPhase: 0,
      harmonicResonance: 1,
    };
  }

  // Generate breath-geometry pattern for current state
  generateBreathGeometry(timeElapsed: number): string {
    // Update breath phase
    const totalBreathDuration = this.getTotalBreathDuration();
    this.breathCycle =
      (timeElapsed % totalBreathDuration) / totalBreathDuration;

    // Calculate current breath phase
    const phase = this.calculateBreathPhase();

    // Generate spiral coordinates
    const spiralCoords = this.calculateSpiralCoordinates(phase);

    // Create SVG path
    return this.createBreathGeometrySVG(spiralCoords, phase);
  }

  // Calculate harmonic transition between elements
  calculateHarmonicTransition(
    fromElement: string,
    toElement: string,
  ): {
    duration: number;
    harmonicPath: number[];
    breathTransition: BreathPattern[];
  } {
    const fromPattern = ELEMENTAL_BREATH_PATTERNS[fromElement];
    const toPattern = ELEMENTAL_BREATH_PATTERNS[toElement];

    // Find petal transition
    const petalTransition = PetalTransitions.find(
      (t) => t.from === fromElement && t.to === toElement,
    );

    // Calculate transition duration using Grant's constants
    const duration = petalTransition
      ? petalTransition.duration * GRANT_CONSTANTS.PHI
      : GRANT_CONSTANTS.PI * GRANT_CONSTANTS.SQRT_10;

    // Generate harmonic interpolation path
    const steps = Math.ceil(duration);
    const harmonicPath: number[] = [];
    const breathTransition: BreathPattern[] = [];

    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const harmonicT = this.applyHarmonicEasing(t);

      // Interpolate harmonic values
      harmonicPath.push(
        fromPattern.ratio + (toPattern.ratio - fromPattern.ratio) * harmonicT,
      );

      // Interpolate breath patterns
      breathTransition.push({
        inhale: this.interpolate(
          fromPattern.inhale,
          toPattern.inhale,
          harmonicT,
        ),
        hold: this.interpolate(fromPattern.hold, toPattern.hold, harmonicT),
        exhale: this.interpolate(
          fromPattern.exhale,
          toPattern.exhale,
          harmonicT,
        ),
        pause: this.interpolate(fromPattern.pause, toPattern.pause, harmonicT),
        ratio: harmonicPath[i],
        geometry: this.interpolateGeometry(
          fromPattern.geometry,
          toPattern.geometry,
          harmonicT,
        ),
      });
    }

    return { duration, harmonicPath, breathTransition };
  }

  // Apply Grant's harmonic constants to spiral evolution
  evolveSpiral(deltaTime: number): void {
    // Update rotation using golden angle
    const goldenAngle =
      (2 * Math.PI) / (GRANT_CONSTANTS.PHI * GRANT_CONSTANTS.PHI);
    this.spiralEvolution.rotationAngle += goldenAngle * deltaTime;

    // Update radius using natural growth
    const growthFactor =
      1 + (HARMONIC_RATIOS.NATURAL_SPIRAL - 1) * deltaTime * 0.01;
    this.spiralEvolution.currentRadius *= growthFactor;

    // Update harmonic resonance based on elemental balance
    this.updateHarmonicResonance();

    // Apply breath influence to expansion
    const breathInfluence = Math.sin(this.breathCycle * 2 * Math.PI);
    this.spiralEvolution.expansionRate =
      GRANT_CONSTANTS.PHI + breathInfluence * 0.1;
  }

  // Generate Grant-encoded evolution metrics
  getEvolutionMetrics(): {
    spiralDensity: number;
    harmonicCoherence: number;
    breathAlignment: number;
    geometricResonance: number;
    evolutionStage: string;
  } {
    // Calculate spiral density using √10
    const spiralDensity =
      this.spiralEvolution.currentRadius /
      (GRANT_CONSTANTS.SQRT_10 * this.spiralEvolution.rotationAngle);

    // Harmonic coherence based on VE state
    const veMetrics = this.ve.getCoherence();
    const harmonicCoherence =
      veMetrics * this.spiralEvolution.harmonicResonance;

    // Breath alignment with natural rhythm
    const breathAlignment = this.calculateBreathAlignment();

    // Geometric resonance with Grant's constants
    const geometricResonance = this.calculateGeometricResonance();

    // Determine evolution stage
    const evolutionStage = this.determineEvolutionStage();

    return {
      spiralDensity: Math.min(1, spiralDensity),
      harmonicCoherence: harmonicCoherence / 100,
      breathAlignment,
      geometricResonance,
      evolutionStage,
    };
  }

  // Create sacred geometry based on breath and Grant's constants
  generateSacredBreathMandala(
    width: number = 800,
    height: number = 800,
  ): string {
    const cx = width / 2;
    const cy = height / 2;

    let svg = `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">`;

    // Background with breath gradient
    svg += this.createBreathGradient(cx, cy);

    // Grant's constant circles
    const circles = [
      { r: GRANT_CONSTANTS.SQRT_10 * 50, stroke: "#FF6B35", label: "√10" },
      { r: GRANT_CONSTANTS.PHI * 50, stroke: "#2E86AB", label: "φ" },
      { r: GRANT_CONSTANTS.E * 50, stroke: "#7D4F39", label: "e" },
      { r: GRANT_CONSTANTS.PI * 50, stroke: "#B8B8D1", label: "π" },
    ];

    circles.forEach((circle) => {
      svg += `<circle cx="${cx}" cy="${cy}" r="${circle.r}"
              fill="none" stroke="${circle.stroke}" stroke-width="1" opacity="0.3" />`;
    });

    // Breath spiral
    svg += this.createBreathSpiral(cx, cy);

    // Elemental markers at Grant positions
    svg += this.createElementalMarkers(cx, cy);

    // Current breath phase indicator
    svg += this.createBreathPhaseIndicator(cx, cy);

    svg += "</svg>";
    return svg;
  }

  // Private helper methods
  private getDominantElement(): string {
    let maxElement = "aether";
    let maxValue = 0;

    Object.entries(this.elementalBalance).forEach(([element, value]) => {
      if (value && value > maxValue) {
        maxValue = value;
        maxElement = element;
      }
    });

    return maxElement;
  }

  private getTotalBreathDuration(): number {
    const p = this.currentBreathPattern;
    return p.inhale + p.hold + p.exhale + p.pause;
  }

  private calculateBreathPhase(): "inhale" | "hold" | "exhale" | "pause" {
    const p = this.currentBreathPattern;
    const totalDuration = this.getTotalBreathDuration();
    const currentTime = this.breathCycle * totalDuration;

    if (currentTime < p.inhale) return "inhale";
    if (currentTime < p.inhale + p.hold) return "hold";
    if (currentTime < p.inhale + p.hold + p.exhale) return "exhale";
    return "pause";
  }

  private calculateSpiralCoordinates(phase: string): {
    x: number;
    y: number;
    z: number;
  } {
    const angle = this.spiralEvolution.rotationAngle;
    const r = this.spiralEvolution.currentRadius;

    // Apply breath phase modulation
    const phaseModulation =
      {
        inhale: 1 + 0.1 * Math.sin(this.breathCycle * Math.PI),
        hold: 1.1,
        exhale: 1 - 0.1 * Math.sin(this.breathCycle * Math.PI),
        pause: 0.95,
      }[phase] || 1;

    const modR = r * phaseModulation;

    return {
      x: modR * Math.cos(angle),
      y: modR * Math.sin(angle),
      z: modR * this.breathCycle * GRANT_CONSTANTS.PHI,
    };
  }

  private createBreathGeometrySVG(
    coords: { x: number; y: number; z: number },
    phase: string,
  ): string {
    // Project 3D to 2D using Grant's perspective
    const scale = 200 / (200 + coords.z);
    const x2d = coords.x * scale;
    const y2d = coords.y * scale;

    // Create phase-specific geometry
    const baseGeometry = this.currentBreathPattern.geometry;
    const transform = `translate(${x2d}, ${y2d}) scale(${scale})`;

    return `<g transform="${transform}">${baseGeometry}</g>`;
  }

  private applyHarmonicEasing(t: number): number {
    // Use Grant's constants for easing
    return (
      Math.pow(t, GRANT_CONSTANTS.PHI) /
      (Math.pow(t, GRANT_CONSTANTS.PHI) + Math.pow(1 - t, GRANT_CONSTANTS.PHI))
    );
  }

  private interpolate(from: number, to: number, t: number): number {
    return from + (to - from) * t;
  }

  private interpolateGeometry(
    fromPath: string,
    toPath: string,
    t: number,
  ): string {
    // Simple linear interpolation of path (would need proper path interpolation in production)
    return t < 0.5 ? fromPath : toPath;
  }

  private updateHarmonicResonance(): void {
    // Calculate resonance based on elemental balance alignment with Grant's ratios
    const elements = Object.entries(this.elementalBalance);
    let resonance = 0;

    elements.forEach(([element, value], i) => {
      if (value) {
        const grantRatio = Object.values(GRANT_CONSTANTS)[i % 4];
        const alignment = 1 - Math.abs(value / 100 - grantRatio / 10);
        resonance += alignment;
      }
    });

    this.spiralEvolution.harmonicResonance = resonance / elements.length;
  }

  private calculateBreathAlignment(): number {
    // Check if current breath matches natural rhythms
    const naturalRhythm = GRANT_CONSTANTS.SQRT_10;
    const currentRhythm = this.getTotalBreathDuration();

    return 1 - Math.abs(currentRhythm - naturalRhythm) / naturalRhythm;
  }

  private calculateGeometricResonance(): number {
    // Measure alignment with sacred geometry
    const angle = this.spiralEvolution.rotationAngle % (2 * Math.PI);
    const sacredAngles = [
      0, // 0°
      Math.PI / 6, // 30°
      Math.PI / 4, // 45°
      Math.PI / 3, // 60°
      Math.PI / 2, // 90°
      (2 * Math.PI) / GRANT_CONSTANTS.PHI, // Golden angle
      Math.PI, // 180°
    ];

    let minDistance = Math.PI;
    sacredAngles.forEach((sacred) => {
      const distance = Math.abs(angle - sacred);
      minDistance = Math.min(minDistance, distance);
    });

    return 1 - minDistance / Math.PI;
  }

  private determineEvolutionStage(): string {
    const radius = this.spiralEvolution.currentRadius;
    const rotations = this.spiralEvolution.rotationAngle / (2 * Math.PI);

    if (rotations < GRANT_CONSTANTS.PHI) return "initiation";
    if (rotations < GRANT_CONSTANTS.E * GRANT_CONSTANTS.PHI) return "expansion";
    if (rotations < GRANT_CONSTANTS.PI * GRANT_CONSTANTS.E)
      return "integration";
    if (rotations < GRANT_CONSTANTS.SQRT_10 * GRANT_CONSTANTS.PI)
      return "mastery";
    return "transcendence";
  }

  private createBreathGradient(cx: number, cy: number): string {
    const phase = this.calculateBreathPhase();
    const colors = {
      inhale: ["#FF6B35", "#F7931E"],
      hold: ["#2E86AB", "#54C6EB"],
      exhale: ["#7D4F39", "#AA8F66"],
      pause: ["#B8B8D1", "#D6D6F5"],
    }[phase] || ["#9B5DE5", "#C77DFF"];

    return `
      <defs>
        <radialGradient id="breathGradient">
          <stop offset="0%" stop-color="${colors[0]}" stop-opacity="0.2" />
          <stop offset="100%" stop-color="${colors[1]}" stop-opacity="0.05" />
        </radialGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#breathGradient)" />
    `;
  }

  private createBreathSpiral(cx: number, cy: number): string {
    let path = `M ${cx} ${cy}`;
    const points = 1000;

    for (let i = 0; i < points; i++) {
      const t = i / points;
      const angle = t * 6 * Math.PI; // 3 full rotations
      const r = t * 200 * Math.pow(GRANT_CONSTANTS.PHI, t);

      // Apply breath modulation
      const breathMod = 1 + 0.1 * Math.sin(t * 20 * Math.PI);
      const x = cx + r * Math.cos(angle) * breathMod;
      const y = cy + r * Math.sin(angle) * breathMod;

      path += ` L ${x} ${y}`;
    }

    return `<path d="${path}" fill="none" stroke="#FFFFFF" stroke-width="0.5" opacity="0.3" />`;
  }

  private createElementalMarkers(cx: number, cy: number): string {
    let markers = "";
    const elements = Object.keys(this.elementalBalance);

    elements.forEach((element, i) => {
      const angle = (i / elements.length) * 2 * Math.PI - Math.PI / 2;
      const r = 150;
      const x = cx + r * Math.cos(angle);
      const y = cy + r * Math.sin(angle);

      const value =
        this.elementalBalance[element as keyof ElementalBalance] || 0;
      const size = 10 + value * 0.3;

      markers += `<circle cx="${x}" cy="${y}" r="${size}"
                  fill="${this.getElementColor(element)}" opacity="0.6" />`;
    });

    return markers;
  }

  private createBreathPhaseIndicator(cx: number, cy: number): string {
    const phase = this.calculateBreathPhase();
    const phaseProgress = this.breathCycle;
    const angle = phaseProgress * 2 * Math.PI - Math.PI / 2;

    const r = 100;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);

    return `
      <g id="breath-indicator">
        <circle cx="${x}" cy="${y}" r="8" fill="#FFFFFF" opacity="0.8" />
        <text x="${cx}" y="${cy + 250}" text-anchor="middle"
              fill="#FFFFFF" font-size="14" opacity="0.6">
          ${phase} (${(phaseProgress * 100).toFixed(0)}%)
        </text>
      </g>
    `;
  }

  private getElementColor(element: string): string {
    const colors: Record<string, string> = {
      fire: "#FF6B35",
      water: "#2E86AB",
      earth: "#7D4F39",
      air: "#B8B8D1",
      aether: "#9B5DE5",
    };
    return colors[element] || "#FFFFFF";
  }
}

// Utility function to generate user's harmonic signature
export function generateHarmonicSignature(
  elementalBalance: ElementalBalance,
  birthData?: { moonPhase?: string; season?: string; numerology?: number },
): {
  primaryHarmonic: number;
  secondaryHarmonic: number;
  breathSignature: BreathPattern;
  evolutionPath: string[];
} {
  const codex = new HarmonicCodex(elementalBalance);

  // Calculate primary harmonic from elemental balance
  let primaryHarmonic = 0;
  let totalWeight = 0;

  Object.entries(elementalBalance).forEach(([element, value], i) => {
    if (value) {
      const grantConstant = Object.values(GRANT_CONSTANTS)[i % 4];
      primaryHarmonic += grantConstant * value;
      totalWeight += value;
    }
  });

  primaryHarmonic =
    totalWeight > 0 ? primaryHarmonic / totalWeight : GRANT_CONSTANTS.PHI;

  // Calculate secondary harmonic from birth data
  let secondaryHarmonic = GRANT_CONSTANTS.SQRT_10;

  if (birthData?.numerology) {
    secondaryHarmonic *= birthData.numerology / 9; // Normalize to 0-1
  }

  if (birthData?.moonPhase?.includes("full")) {
    secondaryHarmonic *= GRANT_CONSTANTS.PHI;
  }

  // Determine breath signature
  const dominantElement = Object.entries(elementalBalance).sort(
    ([, a], [, b]) => (b || 0) - (a || 0),
  )[0][0];
  const breathSignature = ELEMENTAL_BREATH_PATTERNS[dominantElement];

  // Generate evolution path
  const evolutionPath = generateEvolutionPath(elementalBalance);

  return {
    primaryHarmonic,
    secondaryHarmonic,
    breathSignature,
    evolutionPath,
  };
}

// Generate optimal evolution path through elements
function generateEvolutionPath(balance: ElementalBalance): string[] {
  const elements = Object.entries(balance)
    .sort(([, a], [, b]) => (a || 0) - (b || 0))
    .map(([element]) => element);

  // Start with weakest, end with strongest for balance
  return [...elements, "aether"];
}

export default HarmonicCodex;
