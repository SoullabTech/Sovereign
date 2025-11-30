import { DaimonicDetected, DaimonicEvent } from '../types/daimonic';
import { EventEmitter } from 'events';

export class DaimonicDetectionService {
  private eventEmitter: EventEmitter;

  constructor(eventEmitter: EventEmitter) {
    this.eventEmitter = eventEmitter;
  }

  async detectDaimonicSignatures(
    userIdHash: string,
    shiftData: any,
    elementalScores: Record<string, number>,
    expert: boolean = false
  ): Promise<DaimonicDetected> {
    const now = new Date().toISOString();
    
    // Liminal detection
    const liminal = this.detectLiminal(shiftData, now);
    
    // Spirit/Soul pull analysis
    const spiritSoul = this.analyzeSpiritSoulPull(elementalScores, shiftData);
    
    // Trickster risk assessment
    const trickster = this.assessTricksterRisk(shiftData);
    
    // Both-and signature detection
    const bothAnd = this.detectBothAndSignature(shiftData);
    
    // Phase hint inference
    const phaseHint = this.inferPhaseHint(shiftData, liminal, spiritSoul);

    const detection: DaimonicDetected = {
      userIdHash,
      ts: now,
      liminal,
      spiritSoul,
      trickster,
      bothAnd,
      elements: elementalScores,
      phaseHint,
      expert
    };

    // Emit privacy-safe event
    this.eventEmitter.emit('daimonic.experience.detected', detection);

    return detection;
  }

  private detectLiminal(shiftData: any, timestamp: string): DaimonicDetected['liminal'] {
    const hour = new Date(timestamp).getHours();
    
    // Dawn: 5-7am
    if (hour >= 5 && hour <= 7) {
      return { weight: 0.7, label: 'dawn' };
    }
    
    // Dusk: 6-8pm
    if (hour >= 18 && hour <= 20) {
      return { weight: 0.6, label: 'dusk' };
    }
    
    // Midnight: 11pm-1am
    if (hour >= 23 || hour <= 1) {
      return { weight: 0.8, label: 'midnight' };
    }
    
    // Transition markers in content
    const transitionKeywords = ['threshold', 'edge', 'between', 'shifting', 'crossing'];
    const hasTransition = transitionKeywords.some(word => 
      JSON.stringify(shiftData).toLowerCase().includes(word)
    );
    
    if (hasTransition) {
      return { weight: 0.5, label: 'transition' };
    }
    
    return { weight: 0.1, label: 'none' };
  }

  private analyzeSpiritSoulPull(
    elements: Record<string, number>, 
    shiftData: any
  ): DaimonicDetected['spiritSoul'] {
    const fire = elements.fire || 0;
    const air = elements.air || 0;
    const water = elements.water || 0;
    const earth = elements.earth || 0;
    
    const spiritScore = (fire + air) / 2;
    const soulScore = (water + earth) / 2;
    const integrationBand = Math.abs(spiritScore - soulScore);
    
    if (integrationBand < 8) {
      return { 
        pull: 'integrated', 
        notes: 'Ascent and descent in dialogue' 
      };
    }
    
    if (spiritScore > soulScore + 10) {
      return { 
        pull: 'spirit', 
        notes: 'Lift in the system, needs embodied grounding' 
      };
    }
    
    if (soulScore > spiritScore + 10) {
      return { 
        pull: 'soul', 
        notes: 'Depth leading, keep it specific' 
      };
    }
    
    return { pull: 'integrated' };
  }

  private assessTricksterRisk(shiftData: any): DaimonicDetected['trickster'] {
    const content = JSON.stringify(shiftData).toLowerCase();
    const reasons: string[] = [];
    let riskScore = 0;
    
    // Contradiction markers
    const contradictionWords = ['but', 'however', 'although', 'paradox', 'contradiction'];
    if (contradictionWords.some(word => content.includes(word))) {
      reasons.push('contradiction');
      riskScore += 0.2;
    }
    
    // Promise/future-heavy language
    const promiseWords = ['will', 'should', 'must', 'need to', 'have to'];
    const promiseCount = promiseWords.filter(word => content.includes(word)).length;
    if (promiseCount > 3) {
      reasons.push('promise');
      riskScore += 0.3;
    }
    
    // Wink markers (humor, lightness, play)
    const winkWords = ['playful', 'funny', 'joke', 'tease', 'wink'];
    if (winkWords.some(word => content.includes(word))) {
      reasons.push('wink');
      riskScore += 0.1;
    }
    
    // Test/challenge language
    const testWords = ['test', 'challenge', 'try', 'experiment'];
    if (testWords.some(word => content.includes(word))) {
      reasons.push('test');
      riskScore += 0.2;
    }
    
    return { risk: Math.min(riskScore, 1), reasons };
  }

  private detectBothAndSignature(shiftData: any): DaimonicDetected['bothAnd'] {
    const content = JSON.stringify(shiftData).toLowerCase();
    
    // Material and imaginal language present
    const materialWords = ['body', 'concrete', 'practical', 'real', 'physical'];
    const imaginalWords = ['dream', 'symbol', 'meaning', 'story', 'metaphor'];
    
    const hasMaterial = materialWords.some(word => content.includes(word));
    const hasImaginal = imaginalWords.some(word => content.includes(word));
    
    if (hasMaterial && hasImaginal) {
      return {
        signature: true,
        guidance: 'Hold fact and symbol at once; don\'t collapse the mystery into either box'
      };
    }
    
    return {
      signature: false,
      guidance: ''
    };
  }

  private inferPhaseHint(
    shiftData: any, 
    liminal: DaimonicDetected['liminal'],
    spiritSoul: DaimonicDetected['spiritSoul']
  ): string | undefined {
    if (liminal.weight > 0.5 && spiritSoul.pull === 'spirit') {
      return 'initiation-threshold';
    }
    
    if (liminal.weight > 0.5 && spiritSoul.pull === 'soul') {
      return 'integration-descent';
    }
    
    return undefined;
  }
}