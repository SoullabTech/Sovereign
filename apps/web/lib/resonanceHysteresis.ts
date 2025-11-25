/**
 * 🌊 Resonance Hysteresis - Smooth Style Transitions
 * 
 * Like a thermostat that doesn't flip at every tiny change,
 * Maya maintains style stability while remaining responsive
 * to genuine frequency shifts.
 * 
 * Core: Grace in transition, stability in presence
 */

import { CommunicationStyle } from "./styleResonanceCalibrator";

export interface ResonanceState {
  currentStyle: CommunicationStyle;
  styleConfidence: number; // 0-1, how sure we are
  transitionBuffer: CommunicationStyle[]; // Recent style signals
  shiftMomentum: number; // 0-1, building toward change
  anchorStyle: CommunicationStyle; // User's home frequency
}

export class ResonanceHysteresis {
  private state: ResonanceState;
  private readonly SHIFT_THRESHOLD = 0.7; // Momentum needed to change
  private readonly BUFFER_SIZE = 5; // Recent signals to track
  private readonly DECAY_RATE = 0.2; // How fast momentum fades
  
  constructor(initialStyle: CommunicationStyle = 'soulful') {
    this.state = {
      currentStyle: initialStyle,
      styleConfidence: 0.5,
      transitionBuffer: [initialStyle],
      shiftMomentum: 0,
      anchorStyle: initialStyle
    };
  }
  
  /**
   * Process new style signal with hysteresis
   */
  processStyleSignal(
    detectedStyle: CommunicationStyle,
    signalStrength: number = 0.5
  ): CommunicationStyle {
    // Add to buffer
    this.updateBuffer(detectedStyle);
    
    // If same as current, strengthen confidence
    if (detectedStyle === this.state.currentStyle) {
      this.strengthenCurrent(signalStrength);
      return this.state.currentStyle;
    }
    
    // If different, build momentum
    this.buildMomentum(detectedStyle, signalStrength);
    
    // Check if momentum crosses threshold
    if (this.state.shiftMomentum >= this.SHIFT_THRESHOLD) {
      return this.executeTransition(detectedStyle);
    }
    
    // Otherwise, maintain current with blended elements
    return this.blendTransition();
  }
  
  /**
   * Strengthen confidence in current style
   */
  private strengthenCurrent(signalStrength: number): void {
    this.state.styleConfidence = Math.min(
      1,
      this.state.styleConfidence + (signalStrength * 0.1)
    );
    // Decay any building momentum
    this.state.shiftMomentum = Math.max(
      0,
      this.state.shiftMomentum - this.DECAY_RATE
    );
  }
  
  /**
   * Build momentum toward style shift
   */
  private buildMomentum(
    targetStyle: CommunicationStyle,
    signalStrength: number
  ): void {
    // Check if this style is appearing consistently
    const recentOccurrences = this.state.transitionBuffer
      .filter(s => s === targetStyle).length;
    
    const consistencyBonus = recentOccurrences / this.BUFFER_SIZE;
    
    // Build momentum based on signal strength and consistency
    this.state.shiftMomentum = Math.min(
      1,
      this.state.shiftMomentum + (signalStrength * 0.3) + (consistencyBonus * 0.2)
    );
    
    // Slightly reduce confidence in current
    this.state.styleConfidence = Math.max(
      0.3,
      this.state.styleConfidence - 0.1
    );
  }
  
  /**
   * Execute smooth transition to new style
   */
  private executeTransition(newStyle: CommunicationStyle): CommunicationStyle {
    // Check if this is a return to anchor
    const returningHome = newStyle === this.state.anchorStyle;
    
    // Smooth transition based on relationship
    if (this.areCompatibleStyles(this.state.currentStyle, newStyle)) {
      // Compatible styles: quick transition
      this.state.currentStyle = newStyle;
      this.state.styleConfidence = returningHome ? 0.8 : 0.6;
    } else {
      // Incompatible styles: gradual transition
      this.state.currentStyle = newStyle;
      this.state.styleConfidence = 0.4; // Lower confidence initially
    }
    
    // Reset momentum
    this.state.shiftMomentum = 0;
    
    // Update anchor if we've settled here
    if (this.state.transitionBuffer.filter(s => s === newStyle).length > 3) {
      this.state.anchorStyle = newStyle;
    }
    
    return this.state.currentStyle;
  }
  
  /**
   * Create blended response during transition
   */
  private blendTransition(): CommunicationStyle {
    // If momentum is building, return a hybrid indicator
    if (this.state.shiftMomentum > 0.4) {
      // We're in transition zone - maintain current but soften edges
      return this.state.currentStyle;
    }
    
    return this.state.currentStyle;
  }
  
  /**
   * Check if two styles can transition smoothly
   */
  private areCompatibleStyles(
    style1: CommunicationStyle,
    style2: CommunicationStyle
  ): boolean {
    const compatibility: Record<string, string[]> = {
      'technical': ['pragmatic', 'philosophical'],
      'philosophical': ['technical', 'soulful', 'shadow_work'],
      'dramatic': ['playful', 'shadow_work'],
      'soulful': ['philosophical', 'playful', 'shadow_work'],
      'pragmatic': ['technical', 'playful'],
      'playful': ['dramatic', 'pragmatic', 'soulful'],
      'shadow_work': ['soulful', 'philosophical', 'dramatic']
    };
    
    return compatibility[style1]?.includes(style2) || false;
  }
  
  /**
   * Update transition buffer
   */
  private updateBuffer(style: CommunicationStyle): void {
    this.state.transitionBuffer.push(style);
    if (this.state.transitionBuffer.length > this.BUFFER_SIZE) {
      this.state.transitionBuffer.shift();
    }
  }
  
  /**
   * Get transition metadata for logging
   */
  getTransitionState(): {
    stable: boolean;
    transitioning: boolean;
    confidence: number;
    momentum: number;
  } {
    return {
      stable: this.state.styleConfidence > 0.7,
      transitioning: this.state.shiftMomentum > 0.3,
      confidence: this.state.styleConfidence,
      momentum: this.state.shiftMomentum
    };
  }
  
  /**
   * Detect crisis or breakthrough moments that need immediate shift
   */
  detectCriticalShift(input: string): boolean {
    const crisisMarkers = /suicide|emergency|dying|can't go on|ending it/i;
    const breakthroughMarkers = /realized|understand now|breakthrough|see it|awakening/i;
    
    return crisisMarkers.test(input) || breakthroughMarkers.test(input);
  }
  
  /**
   * Force immediate transition for critical moments
   */
  forceTransition(style: CommunicationStyle): void {
    this.state.currentStyle = style;
    this.state.styleConfidence = 1.0;
    this.state.shiftMomentum = 0;
    // Don't change anchor - this might be temporary
  }
}