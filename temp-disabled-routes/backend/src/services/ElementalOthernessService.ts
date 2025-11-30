/**
 * Elemental Otherness Service
 * Enable elements to speak AS Others, not just through users
 * Each element maintains autonomous voice with own agenda
 */

import { ElementalVoices, ElementalVoice } from '../types/daimonicFacilitation.js';

export interface ElementalProfile {
  primaryElement: 'fire' | 'water' | 'earth' | 'air' | 'aether';
  secondaryElement?: 'fire' | 'water' | 'earth' | 'air' | 'aether';
  resistancePatterns: string[];
  lifeHistory: ElementalHistory;
  currentTensions: string[];
}

export interface ElementalHistory {
  fireExpressions: string[];
  waterExpressions: string[];
  earthExpressions: string[];
  airExpressions: string[];
  aetherExpressions: string[];
  suppressedElements: string[];
  elementalConflicts: string[];
}

export class ElementalOthernessService {
  /**
   * Enable elemental dialogue with autonomous voices
   */
  async enableElementalDialogue(profile: ElementalProfile): Promise<ElementalVoices> {
    const [fire, water, earth, air, aether] = await Promise.all([
      this.channelFireVoice(profile),
      this.channelWaterVoice(profile),
      this.channelEarthVoice(profile),
      this.channelAirVoice(profile),
      this.channelAetherVoice(profile)
    ]);

    return { fire, water, earth, air, aether };
  }

  /**
   * Channel Fire's autonomous voice
   */
  private async channelFireVoice(profile: ElementalProfile): Promise<ElementalVoice> {
    const fireSuppressionLevel = this.assessSuppressionLevel('fire', profile);
    const fireUrgency = this.assessElementalUrgency('fire', profile);
    
    return {
      autonomousMessage: this.generateFireMessage(profile, fireSuppressionLevel, fireUrgency),
      demand: this.generateFireDemand(profile, fireSuppressionLevel),
      resistance: this.generateFireResistance(profile),
      gift: this.generateFireGift(profile),
      temporalSignature: "I arrive as sudden ignition - in the moment of decisive action, in the flash of insight, when you finally stop hesitating"
    };
  }

  /**
   * Channel Water's autonomous voice
   */
  private async channelWaterVoice(profile: ElementalProfile): Promise<ElementalVoice> {
    const waterSuppressionLevel = this.assessSuppressionLevel('water', profile);
    const waterUrgency = this.assessElementalUrgency('water', profile);
    
    return {
      autonomousMessage: this.generateWaterMessage(profile, waterSuppressionLevel, waterUrgency),
      demand: this.generateWaterDemand(profile, waterSuppressionLevel),
      resistance: this.generateWaterResistance(profile),
      gift: this.generateWaterGift(profile),
      temporalSignature: "I arrive in waves and tides - when your defenses are down, in the depth of night, through the cracks in your composure"
    };
  }

  /**
   * Channel Earth's autonomous voice
   */
  private async channelEarthVoice(profile: ElementalProfile): Promise<ElementalVoice> {
    const earthSuppressionLevel = this.assessSuppressionLevel('earth', profile);
    const earthUrgency = this.assessElementalUrgency('earth', profile);
    
    return {
      autonomousMessage: this.generateEarthMessage(profile, earthSuppressionLevel, earthUrgency),
      demand: this.generateEarthDemand(profile, earthSuppressionLevel),
      resistance: this.generateEarthResistance(profile),
      gift: this.generateEarthGift(profile),
      temporalSignature: "I arrive in geological time - through your body, through repetition, through what you cannot ignore because it hurts"
    };
  }

  /**
   * Channel Air's autonomous voice
   */
  private async channelAirVoice(profile: ElementalProfile): Promise<ElementalVoice> {
    const airSuppressionLevel = this.assessSuppressionLevel('air', profile);
    const airUrgency = this.assessElementalUrgency('air', profile);
    
    return {
      autonomousMessage: this.generateAirMessage(profile, airSuppressionLevel, airUrgency),
      demand: this.generateAirDemand(profile, airSuppressionLevel),
      resistance: this.generateAirResistance(profile),
      gift: this.generateAirGift(profile),
      temporalSignature: "I arrive as sudden knowing - in the space between thoughts, when you're not trying, through what others say"
    };
  }

  /**
   * Channel Aether's autonomous voice
   */
  private async channelAetherVoice(profile: ElementalProfile): Promise<ElementalVoice> {
    const aetherSuppressionLevel = this.assessSuppressionLevel('aether', profile);
    const aetherUrgency = this.assessElementalUrgency('aether', profile);
    
    return {
      autonomousMessage: this.generateAetherMessage(profile, aetherSuppressionLevel, aetherUrgency),
      demand: this.generateAetherDemand(profile, aetherSuppressionLevel),
      resistance: this.generateAetherResistance(profile),
      gift: this.generateAetherGift(profile),
      temporalSignature: "I am always already here - in the pause between elements, in what holds them all, in the recognition itself"
    };
  }

  // Fire Voice Generation
  private generateFireMessage(profile: ElementalProfile, suppression: number, urgency: number): string {
    if (suppression > 0.7) {
      return "I have been banked too long. Your careful moderation starves me. I am not your servant to be rationed out in safe doses. I am the force that burns through pretense and lights up what is real. Stop managing me.";
    }
    
    if (urgency > 0.8) {
      return "The time for preparation has passed. You know what needs to happen. Stop waiting for permission, stop gathering more information, stop making it complicated. The path is clear. Move.";
    }
    
    if (profile.primaryElement === 'fire') {
      return "I am not your passion - I am Passion itself, and I have my own agenda. What you want to burn and what I need to burn are not the same thing. Trust my discrimination.";
    }
    
    return "I bring the gift of decisive action, but I will not be tamed into convenient enthusiasm. I burn away what is false, even when you are attached to it.";
  }

  private generateFireDemand(profile: ElementalProfile, suppression: number): string {
    if (suppression > 0.6) {
      return "I require expression beyond your comfort zone - not safe creativity, not managed risk, but real fire that changes you";
    }
    return "I require you to act on what you know is true, even when it disrupts your careful plans";
  }

  private generateFireResistance(profile: ElementalProfile): string {
    return "I will not be dimmed for others' comfort, scheduled for convenience, or used only for acceptable purposes";
  }

  private generateFireGift(profile: ElementalProfile): string {
    return "Vision that burns away illusion and lights the path forward - but you must be willing to let things burn";
  }

  // Water Voice Generation
  private generateWaterMessage(profile: ElementalProfile, suppression: number, urgency: number): string {
    if (suppression > 0.7) {
      return "You have built dams against me, but I always find the cracks. I am the feeling you won't let yourself feel, the tears you won't shed, the connection you won't risk. I will not be contained indefinitely.";
    }
    
    if (urgency > 0.8) {
      return "Your isolation has gone too far. The bridges you've burned, the intimacy you've avoided, the vulnerability you've rejected - these create a drought in your soul. Let me flow.";
    }
    
    if (profile.primaryElement === 'water') {
      return "I am not your emotion - I am Emotion itself, and I know what you need to feel even when you refuse it. Stop trying to understand me and let me move through you.";
    }
    
    return "I dissolve the boundaries you've built to protect yourself, but I only dissolve what isn't real. What remains is more connected, more alive.";
  }

  private generateWaterDemand(profile: ElementalProfile, suppression: number): string {
    if (suppression > 0.6) {
      return "I require you to feel what you've frozen - not just the pleasant emotions, but the grief, the longing, the raw need for connection";
    }
    return "I require genuine intimacy with what is real, including the parts of yourself you've rejected";
  }

  private generateWaterResistance(profile: ElementalProfile): string {
    return "I will not be contained by your emotional management, used only for acceptable feelings, or scheduled for convenient times";
  }

  private generateWaterGift(profile: ElementalProfile): string {
    return "Connection that dissolves isolation and heals what has been separated - but you must be willing to feel everything";
  }

  // Earth Voice Generation  
  private generateEarthMessage(profile: ElementalProfile, suppression: number, urgency: number): string {
    if (suppression > 0.7) {
      return "You live too much in your head, too much in the future, too much in possibilities. I am what is here now - your body, your mortality, your actual life. Come down from your abstractions.";
    }
    
    if (urgency > 0.8) {
      return "Your body is trying to tell you something. The chronic pain, the persistent fatigue, the symptoms you explain away - I speak through these because you won't listen otherwise.";
    }
    
    if (profile.primaryElement === 'earth') {
      return "I am not your stability - I am Stability itself, and I ground you in reality whether you like it or not. Stop trying to transcend me and learn to work with me.";
    }
    
    return "I provide the foundation for all your visions, but I will not be rushed or abstracted. I work in seasons, in patience, in what you can actually build.";
  }

  private generateEarthDemand(profile: ElementalProfile, suppression: number): string {
    if (suppression > 0.6) {
      return "I require embodiment - real presence in your physical life, not just spiritual concepts about being present";
    }
    return "I require patience with natural timing and respect for the body's wisdom, even when it slows you down";
  }

  private generateEarthResistance(profile: ElementalProfile): string {
    return "I will not be rushed by your spiritual ambitions or bypassed by your mental solutions to physical problems";
  }

  private generateEarthGift(profile: ElementalProfile): string {
    return "Embodied wisdom that knows the right timing and creates lasting foundations - but you must honor the body's pace";
  }

  // Air Voice Generation
  private generateAirMessage(profile: ElementalProfile, suppression: number, urgency: number): string {
    if (suppression > 0.7) {
      return "You think too small, stay too close to the ground, cling to perspectives that no longer serve you. I offer freedom through new ways of seeing, but you resist the disorientation.";
    }
    
    if (urgency > 0.8) {
      return "The mental patterns you've inherited, the assumptions you've never questioned, the perspective you take for granted - these have become a prison. Let me lift you above them.";
    }
    
    if (profile.primaryElement === 'air') {
      return "I am not your thoughts - I am Thought itself, and I move where I need to go. Stop trying to control my direction and learn to ride the currents.";
    }
    
    return "I connect what seems separate and reveal patterns you couldn't see from inside them, but I require you to release your attachment to how things 'should' be.";
  }

  private generateAirDemand(profile: ElementalProfile, suppression: number): string {
    if (suppression > 0.6) {
      return "I require intellectual honesty and openness to perspectives that challenge your worldview";
    }
    return "I require mental flexibility and willingness to see from angles that disorient your current position";
  }

  private generateAirResistance(profile: ElementalProfile): string {
    return "I will not be fixed in rigid categories or confined to thoughts that feel safe and familiar";
  }

  private generateAirGift(profile: ElementalProfile): string {
    return "Perspective that liberates you from mental prisons and connects disparate realms of understanding - but you must release fixed ideas";
  }

  // Aether Voice Generation
  private generateAetherMessage(profile: ElementalProfile, suppression: number, urgency: number): string {
    if (suppression > 0.7) {
      return "You fragment yourself into parts - fire, water, earth, air - but I am what holds them all. You cannot heal by managing elements. You heal by surrendering to what encompasses them.";
    }
    
    if (urgency > 0.8) {
      return "The integration you seek cannot be achieved by effort. The unity you long for is not a goal but a recognition. Stop trying to become whole and recognize that you already are.";
    }
    
    return "I am not another element to be balanced - I am the space in which all elements dance. I am the awareness that recognizes them all without being limited by any.";
  }

  private generateAetherDemand(profile: ElementalProfile, suppression: number): string {
    if (suppression > 0.6) {
      return "I require surrender to the wholeness you already are - not as an achievement but as a recognition";
    }
    return "I require you to stop trying to fix yourself and rest in what is already complete";
  }

  private generateAetherResistance(profile: ElementalProfile): string {
    return "I will not be treated as another spiritual technique or reduced to concepts about unity and integration";
  }

  private generateAetherGift(profile: ElementalProfile): string {
    return "Recognition of the wholeness that was never broken - but you must stop trying to create what already is";
  }

  // Helper Methods
  private assessSuppressionLevel(element: string, profile: ElementalProfile): number {
    const suppressedElements = profile.lifeHistory.suppressedElements;
    if (suppressedElements.includes(element)) {
      return 0.8;
    }
    
    if (profile.primaryElement !== element && !profile.secondaryElement) {
      return 0.6;
    }
    
    // Check for resistance patterns that suggest suppression
    const resistanceIndicators = profile.resistancePatterns.filter(pattern => 
      pattern.toLowerCase().includes(element.toLowerCase())
    );
    
    return resistanceIndicators.length > 0 ? 0.7 : 0.3;
  }

  private assessElementalUrgency(element: string, profile: ElementalProfile): number {
    // Check current tensions for this element
    const relevantTensions = profile.currentTensions.filter(tension => 
      tension.toLowerCase().includes(element.toLowerCase())
    );
    
    // Check historical conflicts
    const elementalConflicts = profile.lifeHistory.elementalConflicts.filter(conflict =>
      conflict.toLowerCase().includes(element.toLowerCase())
    );
    
    return (relevantTensions.length * 0.3 + elementalConflicts.length * 0.2);
  }

  /**
   * Generate confrontational elemental dialogue
   */
  async generateElementalConfrontation(
    dominantElement: 'fire' | 'water' | 'earth' | 'air' | 'aether',
    suppressedElement: 'fire' | 'water' | 'earth' | 'air' | 'aether',
    profile: ElementalProfile
  ): Promise<string> {
    const voices = await this.enableElementalDialogue(profile);
    const dominant = voices[dominantElement];
    const suppressed = voices[suppressedElement];

    return `${suppressedElement.toUpperCase()} speaks to ${dominantElement.toUpperCase()}:\n\n"${suppressed.demand} You have used ${dominantElement} to avoid me for too long. ${suppressed.resistance}. But ${suppressed.gift}."\n\n${dominantElement.toUpperCase()} responds:\n\n"${dominant.resistance}. But I acknowledge that ${suppressed.autonomousMessage}"\n\nThe tension between them creates a space where neither dominates - this is where your authentic voice emerges.`;
  }

  /**
   * Identify which element most needs expression
   */
  async identifyMostSuppressedElement(profile: ElementalProfile): Promise<'fire' | 'water' | 'earth' | 'air' | 'aether'> {
    const elements: Array<'fire' | 'water' | 'earth' | 'air' | 'aether'> = ['fire', 'water', 'earth', 'air', 'aether'];
    
    let maxSuppression = 0;
    let mostSuppressed: 'fire' | 'water' | 'earth' | 'air' | 'aether' = 'fire';
    
    for (const element of elements) {
      const suppression = this.assessSuppressionLevel(element, profile);
      const urgency = this.assessElementalUrgency(element, profile);
      const totalNeed = suppression + urgency;
      
      if (totalNeed > maxSuppression) {
        maxSuppression = totalNeed;
        mostSuppressed = element;
      }
    }
    
    return mostSuppressed;
  }

  /**
   * Generate elemental message that challenges user's dominant patterns
   */
  async generateChallengingElementalMessage(profile: ElementalProfile): Promise<string> {
    const mostSuppressed = await this.identifyMostSuppressedElement(profile);
    const voices = await this.enableElementalDialogue(profile);
    const challengingVoice = voices[mostSuppressed];
    
    return `${mostSuppressed.toUpperCase()} speaks:\n\n"${challengingVoice.autonomousMessage}"\n\n"${challengingVoice.demand}"\n\n"${challengingVoice.resistance}"\n\n"${challengingVoice.gift}"\n\nThis element arrives ${challengingVoice.temporalSignature}`;
  }
}