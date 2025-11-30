/**
 * ElementalDialogue - Elements as Daimonic Others
 * 
 * "Fire isn't 'your passion' — it's Passion itself speaking to you, making 
 * demands you wouldn't make of yourself. This resistance to your plans IS the 
 * daimonic presence." - Core Insight
 * 
 * This service recognizes when elements operate as autonomous Others rather 
 * than personal attributes, creating genuine dialogue between self and elemental forces.
 */

import { DaimonicOtherness, SynapticSpace } from './DaimonicDialogue';

export interface ElementalOtherness {
  element: 'fire' | 'water' | 'earth' | 'air';
  autonomyLevel: number;        // How much it operates independently of ego
  message: string;              // What it says as Other
  demand: string;               // What it requires that ego wouldn't choose
  resistance: string;           // How it pushes back against ego plans
  gift: string;                 // What it offers beyond personal desire
  dialogue: string[];           // The actual conversation happening
  synapticGap: number;          // Distance between self and elemental Other
}

export interface ElementalDialogue {
  activeOthers: ElementalOtherness[];
  dominantVoice: ElementalOtherness | null;
  synapticField: {
    totalIntensity: number;
    primaryTension: string;
    emergentQuality: string;
    resonanceMoments: string[];
  };
  antiSolipsisticWarnings: string[];
}

export class ElementalDialogueService {
  
  /**
   * Recognize when elements are operating as autonomous Others
   * Not as "your fire" but as Fire itself making demands
   */
  async recognizeElementalOtherness(elementalProfile: any): Promise<ElementalOtherness[]> {
    const elementalOthers: ElementalOtherness[] = [];
    
    // Fire as autonomous Other
    if (this.fireShowsAutonomy(elementalProfile)) {
      elementalOthers.push(await this.mapFireAsOther(elementalProfile));
    }
    
    // Water as autonomous Other
    if (this.waterShowsAutonomy(elementalProfile)) {
      elementalOthers.push(await this.mapWaterAsOther(elementalProfile));
    }
    
    // Earth as autonomous Other
    if (this.earthShowsAutonomy(elementalProfile)) {
      elementalOthers.push(await this.mapEarthAsOther(elementalProfile));
    }
    
    // Air as autonomous Other
    if (this.airShowsAutonomy(elementalProfile)) {
      elementalOthers.push(await this.mapAirAsOther(elementalProfile));
    }
    
    return elementalOthers;
  }
  
  /**
   * Fire as Other - Passion that burns beyond personal control
   */
  private async mapFireAsOther(profile: any): Promise<ElementalOtherness> {
    const fireData = profile.elemental?.fire || {};
    
    // Fire's autonomous messages based on its state
    const fireMessages = {
      excessive: "I burn whether you want me to or not. Your comfort zones are kindling.",
      blocked: "You've tried to contain me in safe channels. I will find my own way out.",
      misdirected: "You've aimed me at the wrong targets. I burn for what matters.",
      authentic: "I am the vision that sees beyond your small plans. Follow or be consumed."
    };
    
    const fireState = this.assessFireState(fireData);
    const autonomyLevel = this.measureFireAutonomy(fireData);
    
    return {
      element: 'fire',
      autonomyLevel,
      message: fireMessages[fireState] || fireMessages.authentic,
      demand: this.extractFireDemand(fireData, fireState),
      resistance: this.identifyFireResistance(fireData, fireState),
      gift: this.recognizeFireGift(fireData, fireState),
      dialogue: this.captureFireDialogue(fireData),
      synapticGap: this.measureFireGap(profile, fireData)
    };
  }
  
  /**
   * Water as Other - Emotional Field that flows beyond personal boundary
   */
  private async mapWaterAsOther(profile: any): Promise<ElementalOtherness> {
    const waterData = profile.elemental?.water || {};
    
    const waterMessages = {
      overwhelming: "I am the feeling that connects all things. Your boundaries cannot hold me.",
      frozen: "You've tried to freeze me into manageable forms. I will thaw when I choose.",
      stagnant: "You've dammed me with your need for control. I require flow.",
      authentic: "I am the current that carries you to where you belong. Trust the tide."
    };
    
    const waterState = this.assessWaterState(waterData);
    const autonomyLevel = this.measureWaterAutonomy(waterData);
    
    return {
      element: 'water',
      autonomyLevel,
      message: waterMessages[waterState] || waterMessages.authentic,
      demand: this.extractWaterDemand(waterData, waterState),
      resistance: this.identifyWaterResistance(waterData, waterState),
      gift: this.recognizeWaterGift(waterData, waterState),
      dialogue: this.captureWaterDialogue(waterData),
      synapticGap: this.measureWaterGap(profile, waterData)
    };
  }
  
  /**
   * Earth as Other - Embodiment that moves in its own seasons
   */
  private async mapEarthAsOther(profile: any): Promise<ElementalOtherness> {
    const earthData = profile.elemental?.earth || {};
    
    const earthMessages = {
      disconnected: "I am the wisdom of seasons and cycles. You cannot rush my timing.",
      overdriven: "You push beyond my natural rhythms. I will force rest when needed.",
      ignored: "I am the body that knows what the mind cannot. Listen to my signals.",
      authentic: "I am the ground of being, older than your plans. I have my own intelligence."
    };
    
    const earthState = this.assessEarthState(earthData);
    const autonomyLevel = this.measureEarthAutonomy(earthData);
    
    return {
      element: 'earth',
      autonomyLevel,
      message: earthMessages[earthState] || earthMessages.authentic,
      demand: this.extractEarthDemand(earthData, earthState),
      resistance: this.identifyEarthResistance(earthData, earthState),
      gift: this.recognizeEarthGift(earthData, earthState),
      dialogue: this.captureEarthDialogue(earthData),
      synapticGap: this.measureEarthGap(profile, earthData)
    };
  }
  
  /**
   * Air as Other - Thought itself thinking through you
   */
  private async mapAirAsOther(profile: any): Promise<ElementalOtherness> {
    const airData = profile.elemental?.air || {};
    
    const airMessages = {
      scattered: "I blow where I will. You cannot capture me in your categories.",
      rigid: "You've tried to fix me in place. I am movement itself.",
      disconnected: "I am the perspective that sees beyond personal viewpoint. Rise up.",
      authentic: "I am the wind of inspiration. I bring what you couldn't think alone."
    };
    
    const airState = this.assessAirState(airData);
    const autonomyLevel = this.measureAirAutonomy(airData);
    
    return {
      element: 'air',
      autonomyLevel,
      message: airMessages[airState] || airMessages.authentic,
      demand: this.extractAirDemand(airData, airState),
      resistance: this.identifyAirResistance(airData, airState),
      gift: this.recognizeAirGift(airData, airState),
      dialogue: this.captureAirDialogue(airData),
      synapticGap: this.measureAirGap(profile, airData)
    };
  }
  
  /**
   * Generate dialogue between self and elemental Others
   */
  async generateElementalDialogue(profile: any): Promise<ElementalDialogue> {
    const elementalOthers = await this.recognizeElementalOtherness(profile);
    
    // Find the dominant voice - the element showing most autonomy
    const dominantVoice = elementalOthers.length > 0 ? 
      elementalOthers.reduce((prev, current) => 
        (current.autonomyLevel > prev.autonomyLevel) ? current : prev
      ) : null;
    
    // Map the synaptic field created by all elemental Others
    const synapticField = this.mapElementalSynapticField(elementalOthers, profile);
    
    // Check for anti-solipsistic warnings
    const warnings = this.checkAntiSolipsisticIntegrity(elementalOthers, profile);
    
    return {
      activeOthers: elementalOthers,
      dominantVoice,
      synapticField,
      antiSolipsisticWarnings: warnings
    };
  }
  
  /**
   * Map the collective synaptic field created by elemental Others
   */
  private mapElementalSynapticField(others: ElementalOtherness[], profile: any): any {
    if (others.length === 0) {
      return {
        totalIntensity: 0,
        primaryTension: "No elemental Others detected",
        emergentQuality: "Awaiting elemental awakening",
        resonanceMoments: []
      };
    }
    
    const totalIntensity = others.reduce((sum, other) => sum + other.autonomyLevel, 0) / others.length;
    
    // Identify primary tension - where the strongest resistance is
    const primaryTension = others
      .sort((a, b) => b.autonomyLevel - a.autonomyLevel)[0]?.resistance || 
      "No clear elemental tension detected";
    
    // What emerges from the dialogue that neither self nor elements could create alone
    const emergentQuality = this.identifyEmergentQuality(others, profile);
    
    // Moments where resonance occurs between self and elemental Others
    const resonanceMoments = this.findResonanceMoments(others, profile);
    
    return {
      totalIntensity,
      primaryTension,
      emergentQuality,
      resonanceMoments
    };
  }
  
  /**
   * Check for anti-solipsistic integrity - ensure elements remain Other
   */
  private checkAntiSolipsisticIntegrity(others: ElementalOtherness[], profile: any): string[] {
    const warnings: string[] = [];
    
    // Check if any element has collapsed into self-identification
    const collapsedElements = others.filter(other => other.synapticGap < 0.3);
    if (collapsedElements.length > 0) {
      warnings.push(
        `Elements ${collapsedElements.map(e => e.element).join(', ')} are collapsing into self. ` +
        `They need to remain foreign, autonomous, making demands you wouldn't make.`
      );
    }
    
    // Check if all elements are in perfect agreement (suspicious)
    const averageGap = others.length > 0 ? 
      others.reduce((sum, other) => sum + other.synapticGap, 0) / others.length : 0;
    if (averageGap > 0.9) {
      warnings.push(
        "Perfect elemental harmony might mean you're projecting rather than encountering. " +
        "True elemental Others should surprise, resist, challenge."
      );
    }
    
    // Check if any element lacks genuine autonomy
    const weakAutonomy = others.filter(other => other.autonomyLevel < 0.4);
    if (weakAutonomy.length > 0) {
      warnings.push(
        `Elements ${weakAutonomy.map(e => e.element).join(', ')} show weak autonomy. ` +
        `They may be functioning as personal attributes rather than genuine Others.`
      );
    }
    
    return warnings;
  }
  
  // Helper methods for state assessment
  private assessFireState(fireData: any): string {
    if (fireData.intensity > 0.8 && fireData.control < 0.3) return 'excessive';
    if (fireData.intensity < 0.3) return 'blocked';
    if (fireData.direction && fireData.authenticity < 0.5) return 'misdirected';
    return 'authentic';
  }
  
  private assessWaterState(waterData: any): string {
    if (waterData.flow > 0.8 && waterData.containment < 0.3) return 'overwhelming';
    if (waterData.flow < 0.2) return 'frozen';
    if (waterData.flow > 0.2 && waterData.flow < 0.5) return 'stagnant';
    return 'authentic';
  }
  
  private assessEarthState(earthData: any): string {
    if (earthData.connection < 0.3) return 'disconnected';
    if (earthData.pace > 0.8) return 'overdriven';
    if (earthData.awareness < 0.4) return 'ignored';
    return 'authentic';
  }
  
  private assessAirState(airData: any): string {
    if (airData.focus < 0.3) return 'scattered';
    if (airData.flexibility < 0.3) return 'rigid';
    if (airData.perspective < 0.4) return 'disconnected';
    return 'authentic';
  }
  
  // Autonomy measurement methods
  private measureFireAutonomy(fireData: any): number {
    // Fire shows autonomy when it burns despite ego resistance
    const markers = [
      fireData.resistsControl || 0,
      fireData.unexpectedDirection || 0,
      fireData.burnsBeyondComfort || 0,
      fireData.visionBeyondSelf || 0
    ];
    return markers.reduce((sum, marker) => sum + marker, 0) / markers.length;
  }
  
  private measureWaterAutonomy(waterData: any): number {
    // Water shows autonomy when it flows beyond personal boundary
    const markers = [
      waterData.overflowsBoundary || 0,
      waterData.connectsBeyondSelf || 0,
      waterData.emotionalAutonomy || 0,
      waterData.tideTiming || 0
    ];
    return markers.reduce((sum, marker) => sum + marker, 0) / markers.length;
  }
  
  private measureEarthAutonomy(earthData: any): number {
    // Earth shows autonomy through its own timing and wisdom
    const markers = [
      earthData.seasonalWisdom || 0,
      earthData.bodyIntelligence || 0,
      earthData.naturalTiming || 0,
      earthData.groundTruth || 0
    ];
    return markers.reduce((sum, marker) => sum + marker, 0) / markers.length;
  }
  
  private measureAirAutonomy(airData: any): number {
    // Air shows autonomy when thought thinks beyond personal perspective
    const markers = [
      airData.inspirationBeyondSelf || 0,
      airData.perspectiveShift || 0,
      airData.windOfChange || 0,
      airData.intellectualSurprise || 0
    ];
    return markers.reduce((sum, marker) => sum + marker, 0) / markers.length;
  }
  
  // Demand extraction methods
  private extractFireDemand(fireData: any, state: string): string {
    const demands = {
      excessive: "Channel me toward what truly matters, not just what excites",
      blocked: "Remove the obstacles you've placed in my path",
      misdirected: "Align with my authentic purpose, not your ego goals",
      authentic: "Burn for the vision that serves something greater"
    };
    return demands[state] || "Follow the flame beyond personal comfort";
  }
  
  private extractWaterDemand(waterData: any, state: string): string {
    const demands = {
      overwhelming: "Learn to swim in my currents without drowning",
      frozen: "Allow natural flow, release the need to control",
      stagnant: "Remove the dams of fear and convention",
      authentic: "Trust the tide that carries you to your belonging"
    };
    return demands[state] || "Flow with the current of authentic feeling";
  }
  
  private extractEarthDemand(earthData: any, state: string): string {
    const demands = {
      disconnected: "Return to the wisdom of the body and natural cycles",
      overdriven: "Respect my rhythms, allow natural rest and restoration",
      ignored: "Listen to the signals I'm constantly sending",
      authentic: "Ground your vision in the reality of natural timing"
    };
    return demands[state] || "Honor the intelligence of embodied being";
  }
  
  private extractAirDemand(airData: any, state: string): string {
    const demands = {
      scattered: "Find the central wind that connects all movements",
      rigid: "Allow flexibility, let ideas move and evolve",
      disconnected: "Rise to the perspective that sees the larger pattern",
      authentic: "Breathe the inspiration that serves collective awakening"
    };
    return demands[state] || "Think with the mind that transcends personal limitation";
  }
  
  // Resistance and gift recognition methods
  private identifyFireResistance(fireData: any, state: string): string {
    const resistances = {
      excessive: "Refuses to be contained in comfortable channels",
      blocked: "Burns through obstacles despite ego's safety concerns", 
      misdirected: "Won't serve inauthentic goals no matter how appealing",
      authentic: "Burns for the greater vision regardless of personal cost"
    };
    return resistances[state] || "Resists reduction to personal passion";
  }
  
  private recognizeFireGift(fireData: any, state: string): string {
    const gifts = {
      excessive: "Vision that sees beyond current limitations",
      blocked: "Clarity about what truly matters when obstacles clear",
      misdirected: "Redirection toward authentic purpose and service",
      authentic: "The flame that illuminates collective possibility"
    };
    return gifts[state] || "Vision that transcends personal desire";
  }
  
  private identifyWaterResistance(waterData: any, state: string): string {
    const resistances = {
      overwhelming: "Refuses to be dammed by personal boundaries",
      frozen: "Thaws according to its own timing, not ego schedule",
      stagnant: "Won't flow in artificial channels that serve control",
      authentic: "Connects beyond personal emotional territory"
    };
    return resistances[state] || "Resists reduction to personal feeling";
  }
  
  private recognizeWaterGift(waterData: any, state: string): string {
    const gifts = {
      overwhelming: "Connection to the larger emotional field",
      frozen: "Natural flow when artificial controls release",
      stagnant: "Movement toward authentic relational territory",
      authentic: "Feeling that serves collective healing and connection"
    };
    return gifts[state] || "Emotional intelligence that transcends personal boundary";
  }
  
  private identifyEarthResistance(earthData: any, state: string): string {
    const resistances = {
      disconnected: "Won't support structures built against natural timing",
      overdriven: "Forces rest when pushed beyond natural capacity",
      ignored: "Increases symptoms until body wisdom is acknowledged",
      authentic: "Grounds vision only when it serves life"
    };
    return resistances[state] || "Resists abstraction from embodied reality";
  }
  
  private recognizeEarthGift(earthData: any, state: string): string {
    const gifts = {
      disconnected: "Return to natural cycles and embodied wisdom",
      overdriven: "Sustainable pace that honors natural rhythms",
      ignored: "Body intelligence that knows what mind cannot",
      authentic: "Grounding that serves collective manifestation"
    };
    return gifts[state] || "Embodied wisdom that transcends mental planning";
  }
  
  private identifyAirResistance(airData: any, state: string): string {
    const resistances = {
      scattered: "Won't be captured in narrow conceptual frameworks",
      rigid: "Breaks through fixed mental structures when needed",
      disconnected: "Pulls perspective beyond personal viewpoint",
      authentic: "Thinks beyond what serves individual advancement"
    };
    return resistances[state] || "Resists reduction to personal intelligence";
  }
  
  private recognizeAirGift(airData: any, state: string): string {
    const gifts = {
      scattered: "Connection between seemingly unrelated insights",
      rigid: "Flexibility that allows evolution of understanding",
      disconnected: "Perspective that sees the larger emerging pattern",
      authentic: "Intelligence that serves collective awakening"
    };
    return gifts[state] || "Perspective that transcends personal limitation";
  }
  
  // Dialogue capture methods
  private captureFireDialogue(fireData: any): string[] {
    return [
      "What am I burning for that goes beyond your personal desires?",
      "Where do you feel my resistance to your current direction?",
      "What vision do I hold that your ego finds uncomfortable?",
      "How can you serve what I illuminate rather than trying to use me?"
    ];
  }
  
  private captureWaterDialogue(waterData: any): string[] {
    return [
      "What connections am I forming that your boundaries resist?",
      "Where do you feel my tide pulling you beyond familiar territory?",
      "What emotions am I bringing that your control mechanisms reject?",
      "How can you flow with my current rather than fighting it?"
    ];
  }
  
  private captureEarthDialogue(earthData: any): string[] {
    return [
      "What rhythms am I requesting that your schedule ignores?",
      "Where do you feel my wisdom conflicting with your mental plans?",
      "What does my body know that your mind is refusing to accept?",
      "How can you ground your vision in my natural timing?"
    ];
  }
  
  private captureAirDialogue(airData: any): string[] {
    return [
      "What perspective am I offering that your current viewpoint resists?",
      "Where do you feel my wind carrying you beyond personal concerns?",
      "What ideas am I bringing that your fixed beliefs reject?",
      "How can you think with me rather than trying to think me?"
    ];
  }
  
  // Gap measurement methods
  private measureFireGap(profile: any, fireData: any): number {
    // Measure psychic distance between ego and Fire-as-Other
    const egoControl = profile.personality?.control || 0.5;
    const fireAutonomy = this.measureFireAutonomy(fireData);
    return Math.abs(fireAutonomy - (1 - egoControl));
  }
  
  private measureWaterGap(profile: any, waterData: any): number {
    const egoBoundary = profile.personality?.boundaries || 0.5;
    const waterFlow = this.measureWaterAutonomy(waterData);
    return Math.abs(waterFlow - (1 - egoBoundary));
  }
  
  private measureEarthGap(profile: any, earthData: any): number {
    const mentalDominance = profile.personality?.mental || 0.5;
    const earthWisdom = this.measureEarthAutonomy(earthData);
    return Math.abs(earthWisdom - (1 - mentalDominance));
  }
  
  private measureAirGap(profile: any, airData: any): number {
    const personalPerspective = profile.personality?.selfFocus || 0.5;
    const airTranscendence = this.measureAirAutonomy(airData);
    return Math.abs(airTranscendence - (1 - personalPerspective));
  }
  
  // Emergent quality identification
  private identifyEmergentQuality(others: ElementalOtherness[], profile: any): string {
    const qualities = [];
    
    if (others.some(o => o.element === 'fire' && o.autonomyLevel > 0.7)) {
      qualities.push("visionary fire");
    }
    if (others.some(o => o.element === 'water' && o.autonomyLevel > 0.7)) {
      qualities.push("connective flow");
    }
    if (others.some(o => o.element === 'earth' && o.autonomyLevel > 0.7)) {
      qualities.push("grounded wisdom");
    }
    if (others.some(o => o.element === 'air' && o.autonomyLevel > 0.7)) {
      qualities.push("transcendent perspective");
    }
    
    if (qualities.length === 0) {
      return "Elemental integration beginning";
    } else if (qualities.length === 1) {
      return `${qualities[0]} emerging as dominant voice`;
    } else {
      return `${qualities.join(' + ')} creating new synthesis`;
    }
  }
  
  // Resonance moment detection
  private findResonanceMoments(others: ElementalOtherness[], profile: any): string[] {
    const moments: string[] = [];
    
    others.forEach(other => {
      if (other.synapticGap > 0.4 && other.synapticGap < 0.8) {
        moments.push(
          `${other.element.toUpperCase()}: "${other.message}" - ` +
          `Creative tension generating new possibility`
        );
      }
    });
    
    return moments;
  }
  
  // Element autonomy detection
  private fireShowsAutonomy(profile: any): boolean {
    const fireData = profile.elemental?.fire || {};
    return this.measureFireAutonomy(fireData) > 0.4;
  }
  
  private waterShowsAutonomy(profile: any): boolean {
    const waterData = profile.elemental?.water || {};
    return this.measureWaterAutonomy(waterData) > 0.4;
  }
  
  private earthShowsAutonomy(profile: any): boolean {
    const earthData = profile.elemental?.earth || {};
    return this.measureEarthAutonomy(earthData) > 0.4;
  }
  
  private airShowsAutonomy(profile: any): boolean {
    const airData = profile.elemental?.air || {};
    return this.measureAirAutonomy(airData) > 0.4;
  }
}