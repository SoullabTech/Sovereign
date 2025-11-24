// breathGeometryIntegration.ts
// Integrates Grant's harmonic codex with breath curves and voice patterns
// Creates living breath-geometry visualizations for oracle sessions

import {
  HarmonicCodex,
  GRANT_CONSTANTS,
  ELEMENTAL_BREATH_PATTERNS,
  generateHarmonicSignature,
} from "./harmonicCodex";
import { voiceToBreathCurve } from "../lib/breathCurve";
import { ElementalBalance } from "../lib/geometryEngine";
import { VectorEquilibrium } from "../services/vectorEquilibrium";
import {
  getRelevantMemories,
  getSpiritualPatternInsights,
} from "../services/memoryService";

// Enhanced breath curve with Grant's harmonics
export interface EnhancedBreathCurve {
  rawCurve: string; // Original voice curve
  harmonicCurve: string; // Grant-enhanced curve
  elementalResonance: number[]; // Resonance with each element
  phaseAlignment: number; // Alignment with natural breath phases
  spiralCoordinate: { r: number; theta: number; z: number };
}

// Breath session state
export interface BreathSession {
  userId: string;
  startTime: number;
  codex: HarmonicCodex;
  voiceSamples: number[][];
  breathCycles: EnhancedBreathCurve[];
  currentElement: string;
  transitionPhase: number;
  evolutionMetrics: ReturnType<HarmonicCodex["getEvolutionMetrics"]>;
}

// Main breath-geometry integration class
export class BreathGeometryIntegration {
  private sessions: Map<string, BreathSession> = new Map();

  // Initialize breath session for user
  async initializeSession(userId: string): Promise<BreathSession> {
    // Get user's elemental balance from memories
    const memories = await getRelevantMemories(userId, undefined, 100);
    const patterns = await getSpiritualPatternInsights(userId);

    const elementalBalance: ElementalBalance = patterns.elementalBalance || {
      fire: 20,
      water: 20,
      earth: 20,
      air: 20,
      aether: 20,
    };

    // Create harmonic codex
    const codex = new HarmonicCodex(elementalBalance);

    // Initialize session
    const session: BreathSession = {
      userId,
      startTime: Date.now(),
      codex,
      voiceSamples: [],
      breathCycles: [],
      currentElement: this.getDominantElement(elementalBalance),
      transitionPhase: 0,
      evolutionMetrics: codex.getEvolutionMetrics(),
    };

    this.sessions.set(userId, session);
    return session;
  }

  // Process voice sample through Grant's harmonics
  processVoiceSample(
    userId: string,
    voiceSample: number[],
  ): EnhancedBreathCurve {
    const session = this.sessions.get(userId);
    if (!session) throw new Error("No active breath session");

    // Store raw sample
    session.voiceSamples.push(voiceSample);

    // Generate basic breath curve
    const rawCurve = voiceToBreathCurve(voiceSample);

    // Apply Grant's harmonic enhancement
    const harmonicCurve = this.applyHarmonicEnhancement(voiceSample, session);

    // Calculate elemental resonance
    const elementalResonance = this.calculateElementalResonance(
      voiceSample,
      session,
    );

    // Determine phase alignment
    const phaseAlignment = this.calculatePhaseAlignment(voiceSample, session);

    // Calculate spiral position
    const elapsedTime = (Date.now() - session.startTime) / 1000;
    const spiralCoordinate = this.calculateSpiralPosition(elapsedTime, session);

    // Create enhanced breath curve
    const enhancedCurve: EnhancedBreathCurve = {
      rawCurve,
      harmonicCurve,
      elementalResonance,
      phaseAlignment,
      spiralCoordinate,
    };

    // Store in session
    session.breathCycles.push(enhancedCurve);

    // Update evolution metrics
    session.codex.evolveSpiral(1); // 1 second per sample
    session.evolutionMetrics = session.codex.getEvolutionMetrics();

    return enhancedCurve;
  }

  // Generate real-time breath-geometry visualization
  generateBreathVisualization(userId: string): string {
    const session = this.sessions.get(userId);
    if (!session) return "<svg></svg>";

    const width = 800;
    const height = 800;
    const cx = width / 2;
    const cy = height / 2;

    let svg = `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">`;

    // Background with current element gradient
    svg += this.createElementalBackground(session.currentElement);

    // Grant's constant guide circles
    svg += this.createGrantCircles(cx, cy);

    // Breath spiral from all samples
    svg += this.createBreathSpiral(session, cx, cy);

    // Current breath phase geometry
    const elapsedTime = (Date.now() - session.startTime) / 1000;
    svg += session.codex.generateBreathGeometry(elapsedTime);

    // Elemental resonance indicators
    svg += this.createResonanceIndicators(session, cx, cy);

    // Evolution metrics overlay
    svg += this.createEvolutionOverlay(session);

    // Voice waveform integration
    if (session.voiceSamples.length > 0) {
      svg += this.createVoiceWaveform(session);
    }

    svg += "</svg>";
    return svg;
  }

  // Calculate harmonic transition recommendation
  async recommendTransition(userId: string): Promise<{
    shouldTransition: boolean;
    targetElement: string;
    harmonicPath: number[];
    breathGuidance: string;
  }> {
    const session = this.sessions.get(userId);
    if (!session) throw new Error("No active breath session");

    // Analyze breath patterns for transition indicators
    const recentCycles = session.breathCycles.slice(-10);
    const avgResonance = this.calculateAverageResonance(recentCycles);
    const phaseCoherence = this.calculatePhaseCoherence(recentCycles);

    // Check if current element is exhausted
    const currentElementIndex = Object.keys(ELEMENTAL_BREATH_PATTERNS).indexOf(
      session.currentElement,
    );
    const currentResonance = avgResonance[currentElementIndex] || 0;

    // Find element with highest resonance
    const maxResonanceIndex = avgResonance.indexOf(Math.max(...avgResonance));
    const targetElement = Object.keys(ELEMENTAL_BREATH_PATTERNS)[
      maxResonanceIndex
    ];

    // Should transition if resonance differs significantly
    const shouldTransition =
      Math.abs(currentResonance - avgResonance[maxResonanceIndex]) > 0.3;

    // Calculate harmonic path
    const transition = session.codex.calculateHarmonicTransition(
      session.currentElement,
      targetElement,
    );

    // Generate breath guidance
    const breathGuidance = this.generateBreathGuidance(
      session.currentElement,
      targetElement,
      session.evolutionMetrics.evolutionStage,
    );

    return {
      shouldTransition,
      targetElement,
      harmonicPath: transition.harmonicPath,
      breathGuidance,
    };
  }

  // Private helper methods
  private applyHarmonicEnhancement(
    voiceSample: number[],
    session: BreathSession,
  ): string {
    const enhanced = voiceSample.map((sample, i) => {
      // Apply Grant's constants as harmonic filters
      const phi_mod = Math.sin(
        ((i * GRANT_CONSTANTS.PHI) / voiceSample.length) * Math.PI,
      );
      const sqrt10_mod = Math.cos(
        ((i * GRANT_CONSTANTS.SQRT_10) / voiceSample.length) * Math.PI,
      );
      const e_mod = Math.exp(-i / voiceSample.length) * GRANT_CONSTANTS.E;

      // Combine modulations
      const enhanced_value =
        sample *
        (1 + phi_mod * 0.3) *
        (1 + sqrt10_mod * 0.2) *
        (e_mod / GRANT_CONSTANTS.E);

      return `${i * 10},${enhanced_value * 100}`;
    });

    return enhanced.join(" ");
  }

  private calculateElementalResonance(
    voiceSample: number[],
    session: BreathSession,
  ): number[] {
    const elements = Object.keys(ELEMENTAL_BREATH_PATTERNS);
    const resonances: number[] = [];

    elements.forEach((element) => {
      const pattern = ELEMENTAL_BREATH_PATTERNS[element];
      const totalDuration =
        pattern.inhale + pattern.hold + pattern.exhale + pattern.pause;

      // Calculate frequency match
      const sampleFreq = this.calculateDominantFrequency(voiceSample);
      const elementFreq = 1 / totalDuration;
      const freqMatch = 1 - Math.abs(sampleFreq - elementFreq) / elementFreq;

      // Calculate amplitude match
      const sampleAmplitude = this.calculateAverageAmplitude(voiceSample);
      const elementAmplitude = pattern.ratio / GRANT_CONSTANTS.SQRT_10;
      const ampMatch =
        1 - Math.abs(sampleAmplitude - elementAmplitude) / elementAmplitude;

      // Combined resonance
      resonances.push((freqMatch + ampMatch) / 2);
    });

    return resonances;
  }

  private calculatePhaseAlignment(
    voiceSample: number[],
    session: BreathSession,
  ): number {
    // Detect breath phases in voice sample
    const phases = this.detectBreathPhases(voiceSample);
    const pattern = ELEMENTAL_BREATH_PATTERNS[session.currentElement];

    // Compare detected phases with ideal pattern
    const idealRatios = {
      inhale:
        pattern.inhale /
        (pattern.inhale + pattern.hold + pattern.exhale + pattern.pause),
      hold:
        pattern.hold /
        (pattern.inhale + pattern.hold + pattern.exhale + pattern.pause),
      exhale:
        pattern.exhale /
        (pattern.inhale + pattern.hold + pattern.exhale + pattern.pause),
      pause:
        pattern.pause /
        (pattern.inhale + pattern.hold + pattern.exhale + pattern.pause),
    };

    let alignment = 0;
    Object.entries(phases).forEach(([phase, duration]) => {
      const idealDuration = idealRatios[phase as keyof typeof idealRatios] || 0;
      alignment += 1 - Math.abs(duration - idealDuration);
    });

    return alignment / 4; // Average across 4 phases
  }

  private calculateSpiralPosition(
    elapsedTime: number,
    session: BreathSession,
  ): { r: number; theta: number; z: number } {
    // Use Grant's constants for spiral calculation
    const cycles = session.breathCycles.length;
    const theta = (cycles * 2 * Math.PI) / GRANT_CONSTANTS.PHI; // Golden angle
    const r =
      GRANT_CONSTANTS.SQRT_10 * Math.pow(GRANT_CONSTANTS.PHI, cycles / 10);
    const z = cycles * GRANT_CONSTANTS.E;

    return { r, theta, z };
  }

  private getDominantElement(balance: ElementalBalance): string {
    return Object.entries(balance).sort(
      ([, a], [, b]) => (b || 0) - (a || 0),
    )[0][0];
  }

  private createElementalBackground(element: string): string {
    const colors = {
      fire: ["#FF6B35", "#F7931E"],
      water: ["#2E86AB", "#54C6EB"],
      earth: ["#7D4F39", "#AA8F66"],
      air: ["#B8B8D1", "#D6D6F5"],
      aether: ["#9B5DE5", "#C77DFF"],
    }[element] || ["#9B5DE5", "#C77DFF"];

    return `
      <defs>
        <radialGradient id="elementBg">
          <stop offset="0%" stop-color="${colors[0]}" stop-opacity="0.1" />
          <stop offset="100%" stop-color="${colors[1]}" stop-opacity="0.05" />
        </radialGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#elementBg)" />
    `;
  }

  private createGrantCircles(cx: number, cy: number): string {
    let circles = '<g id="grant-circles" opacity="0.2">';

    Object.entries(GRANT_CONSTANTS).forEach(([name, value], i) => {
      const r = value * 50;
      const color = ["#FF6B35", "#2E86AB", "#7D4F39", "#B8B8D1"][i];

      circles += `<circle cx="${cx}" cy="${cy}" r="${r}"
                  fill="none" stroke="${color}" stroke-width="1" />`;
      circles += `<text x="${cx + r + 5}" y="${cy}"
                  fill="${color}" font-size="10" opacity="0.5">${name}</text>`;
    });

    circles += "</g>";
    return circles;
  }

  private createBreathSpiral(
    session: BreathSession,
    cx: number,
    cy: number,
  ): string {
    if (session.breathCycles.length === 0) return "";

    let path = `M ${cx} ${cy}`;

    session.breathCycles.forEach((cycle, i) => {
      const coord = cycle.spiralCoordinate;
      const x = cx + coord.r * Math.cos(coord.theta);
      const y = cy + coord.r * Math.sin(coord.theta);

      path += ` L ${x} ${y}`;
    });

    return `<path d="${path}" fill="none" stroke="#FFFFFF"
            stroke-width="2" opacity="0.3" />`;
  }

  private createResonanceIndicators(
    session: BreathSession,
    cx: number,
    cy: number,
  ): string {
    let indicators = '<g id="resonance-indicators">';

    if (session.breathCycles.length > 0) {
      const lastCycle = session.breathCycles[session.breathCycles.length - 1];
      const elements = Object.keys(ELEMENTAL_BREATH_PATTERNS);

      elements.forEach((element, i) => {
        const angle = (i / elements.length) * 2 * Math.PI - Math.PI / 2;
        const baseR = 200;
        const resonance = lastCycle.elementalResonance[i];
        const r = baseR + resonance * 50;

        const x = cx + r * Math.cos(angle);
        const y = cy + r * Math.sin(angle);

        indicators += `<circle cx="${x}" cy="${y}" r="${5 + resonance * 10}"
                      fill="${this.getElementColor(element)}" opacity="${0.3 + resonance * 0.5}" />`;
      });
    }

    indicators += "</g>";
    return indicators;
  }

  private createEvolutionOverlay(session: BreathSession): string {
    const metrics = session.evolutionMetrics;
    const y = 20;

    return `
      <g id="evolution-overlay" font-family="Arial" font-size="12" fill="#FFFFFF" opacity="0.7">
        <text x="10" y="${y}">Stage: ${metrics.evolutionStage}</text>
        <text x="10" y="${y + 20}">Coherence: ${(metrics.harmonicCoherence * 100).toFixed(0)}%</text>
        <text x="10" y="${y + 40}">Breath Alignment: ${(metrics.breathAlignment * 100).toFixed(0)}%</text>
        <text x="10" y="${y + 60}">Spiral Density: ${(metrics.spiralDensity * 100).toFixed(0)}%</text>
      </g>
    `;
  }

  private createVoiceWaveform(session: BreathSession): string {
    const lastSample = session.voiceSamples[session.voiceSamples.length - 1];
    if (!lastSample) return "";

    let path = "M 50 400";

    lastSample.forEach((value, i) => {
      const x = 50 + (i / lastSample.length) * 700;
      const y = 400 + value * 100;
      path += ` L ${x} ${y}`;
    });

    return `<path d="${path}" fill="none" stroke="#FFFFFF"
            stroke-width="1" opacity="0.5" />`;
  }

  private calculateAverageResonance(cycles: EnhancedBreathCurve[]): number[] {
    if (cycles.length === 0) return [0, 0, 0, 0, 0];

    const sums = new Array(5).fill(0);
    cycles.forEach((cycle) => {
      cycle.elementalResonance.forEach((res, i) => {
        sums[i] += res;
      });
    });

    return sums.map((sum) => sum / cycles.length);
  }

  private calculatePhaseCoherence(cycles: EnhancedBreathCurve[]): number {
    if (cycles.length === 0) return 0;

    const avgAlignment =
      cycles.reduce((sum, cycle) => sum + cycle.phaseAlignment, 0) /
      cycles.length;
    return avgAlignment;
  }

  private generateBreathGuidance(
    from: string,
    to: string,
    stage: string,
  ): string {
    const guidance = [
      `Transitioning from ${from} to ${to} consciousness...`,
      `Current evolution stage: ${stage}`,
      "",
      "Breath guidance:",
      `- Begin with ${ELEMENTAL_BREATH_PATTERNS[from].inhale.toFixed(1)}s inhale`,
      `- Gradually shift to ${ELEMENTAL_BREATH_PATTERNS[to].inhale.toFixed(1)}s inhale`,
      `- Use Grant's √10 (${GRANT_CONSTANTS.SQRT_10.toFixed(2)}) as your base rhythm`,
      `- Allow the golden ratio (${GRANT_CONSTANTS.PHI.toFixed(3)}) to guide expansion`,
      "",
      "Visualize the elemental shift in your breath geometry.",
    ];

    return guidance.join("\n");
  }

  private calculateDominantFrequency(samples: number[]): number {
    // Simple peak detection for breath frequency
    let peaks = 0;
    for (let i = 1; i < samples.length - 1; i++) {
      if (samples[i] > samples[i - 1] && samples[i] > samples[i + 1]) {
        peaks++;
      }
    }
    return peaks / samples.length;
  }

  private calculateAverageAmplitude(samples: number[]): number {
    return (
      samples.reduce((sum, val) => sum + Math.abs(val), 0) / samples.length
    );
  }

  private detectBreathPhases(samples: number[]): Record<string, number> {
    // Simplified breath phase detection
    const totalLength = samples.length;
    const threshold = this.calculateAverageAmplitude(samples) * 0.7;

    let phases = {
      inhale: 0,
      hold: 0,
      exhale: 0,
      pause: 0,
    };

    let currentPhase: keyof typeof phases = "inhale";
    let phaseStart = 0;

    for (let i = 1; i < samples.length; i++) {
      const rising = samples[i] > samples[i - 1];
      const high = samples[i] > threshold;
      const low = samples[i] < threshold * 0.3;

      // Simple state machine
      if (currentPhase === "inhale" && !rising && high) {
        phases.inhale = i - phaseStart;
        currentPhase = "hold";
        phaseStart = i;
      } else if (currentPhase === "hold" && !high) {
        phases.hold = i - phaseStart;
        currentPhase = "exhale";
        phaseStart = i;
      } else if (currentPhase === "exhale" && low) {
        phases.exhale = i - phaseStart;
        currentPhase = "pause";
        phaseStart = i;
      }
    }

    // Normalize to ratios
    const total = Object.values(phases).reduce((sum, val) => sum + val, 1);
    Object.keys(phases).forEach((key) => {
      phases[key as keyof typeof phases] /= total;
    });

    return phases;
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

// Singleton instance
export const breathGeometry = new BreathGeometryIntegration();

// Export convenience functions
export async function initializeBreathSession(userId: string) {
  return breathGeometry.initializeSession(userId);
}

export function processVoiceBreath(userId: string, voiceSample: number[]) {
  return breathGeometry.processVoiceSample(userId, voiceSample);
}

export function getBreathVisualization(userId: string) {
  return breathGeometry.generateBreathVisualization(userId);
}

export async function getBreathTransitionGuidance(userId: string) {
  return breathGeometry.recommendTransition(userId);
}
