import { VoicePreset, DaimonicDetected } from '../types/daimonic';

export class DaimonicVoiceService {
  private static instance: DaimonicVoiceService;

  static getInstance(): DaimonicVoiceService {
    if (!DaimonicVoiceService.instance) {
      DaimonicVoiceService.instance = new DaimonicVoiceService();
    }
    return DaimonicVoiceService.instance;
  }

  // ==========================================================================
  // VOICE PRESET SELECTION
  // ==========================================================================

  selectPreset(detection: DaimonicDetected): VoicePreset {
    // Trickster caution - measured pace, grounded tone
    if (detection.trickster.risk >= 0.5) {
      return {
        name: 'trickster-caution',
        pace: 'measured',
        tone: 'grounded',
        pauses: true
      };
    }

    // Threshold time - soft pace, thoughtful tone
    if (detection.liminal.weight >= 0.5) {
      return {
        name: 'threshold',
        pace: 'soft',
        tone: 'thoughtful',
        pauses: true
      };
    }

    // Both-and - warm, spacious tone
    if (detection.bothAnd.signature) {
      return {
        name: 'both-and',
        pace: 'normal',
        tone: 'warm',
        pauses: false
      };
    }

    // Anti-solipsism nudge - gentle humor
    const hasAntiSolipsism = this.checkForAntiSolipsism(detection);
    if (hasAntiSolipsism) {
      return {
        name: 'anti-solipsism',
        pace: 'normal',
        tone: 'neutral',
        pauses: false,
        humor: 'gentle'
      };
    }

    // Default - natural flow
    return {
      name: 'natural',
      pace: 'normal',
      tone: 'neutral',
      pauses: false
    };
  }

  // ==========================================================================
  // VOICE TAG GENERATION
  // ==========================================================================

  generateVoiceTags(preset: VoicePreset): string[] {
    const tags: string[] = [];

    // Pace tags
    switch (preset.pace) {
      case 'soft':
        tags.push('[soft pace]');
        break;
      case 'measured':
        tags.push('[measured]');
        break;
      case 'spacious':
        tags.push('[spacious]');
        break;
    }

    // Tone tags
    switch (preset.tone) {
      case 'thoughtful':
        tags.push('[thoughtful pause]');
        break;
      case 'grounded':
        tags.push('[grounded tone]');
        break;
      case 'warm':
        tags.push('[warm]');
        break;
    }

    // Pause tags
    if (preset.pauses) {
      if (!tags.some(tag => tag.includes('pause'))) {
        tags.push('[thoughtful pause]');
      }
    }

    // Humor tags
    if (preset.humor === 'gentle') {
      tags.push('[gentle humor]');
    }

    return tags;
  }

  // ==========================================================================
  // PERSONALITY-SPECIFIC APPLICATIONS
  // ==========================================================================

  applyPersonalityModulation(preset: VoicePreset, personality: string): VoicePreset {
    switch (personality) {
      case 'aunt-annie':
        if (preset.name === 'trickster-caution') {
          return {
            ...preset,
            tone: 'warm',
            // Aunt Annie's gentle approach to trickster energy
          };
        }
        break;

      case 'emily':
        if (preset.name === 'trickster-caution') {
          return {
            ...preset,
            pace: 'measured',
            // Emily's more analytical approach
          };
        }
        break;
    }

    return preset;
  }

  // ==========================================================================
  // CONTEXT-AWARE VOICE ADJUSTMENTS
  // ==========================================================================

  adjustForContext(
    preset: VoicePreset,
    context: {
      timeOfDay?: string;
      elementalDominance?: string;
      userHistory?: any;
    }
  ): VoicePreset {
    const adjusted = { ...preset };

    // Time of day adjustments
    if (context.timeOfDay === 'dawn' || context.timeOfDay === 'dusk') {
      adjusted.pace = 'soft';
      adjusted.tone = 'thoughtful';
    }

    // Elemental adjustments
    if (context.elementalDominance === 'fire') {
      // Fire energy might need grounding
      if (preset.name === 'trickster-caution') {
        adjusted.tone = 'grounded';
      }
    }

    return adjusted;
  }

  // ==========================================================================
  // GROUNDING PROMPTS
  // ==========================================================================

  generateGroundingPrompts(detection: DaimonicDetected): string[] {
    const prompts: string[] = [];

    if (detection.trickster.risk >= 0.5) {
      prompts.push('Let\'s take this slowly…');
      prompts.push('Try one small check-in with reality before moving.');
    }

    if (detection.liminal.weight >= 0.6) {
      prompts.push('Notice what feels solid and real right now.');
    }

    if (detection.spiritSoul.pull === 'spirit') {
      prompts.push('What\'s one concrete step you can take?');
    }

    return prompts;
  }

  // ==========================================================================
  // INTEGRATION WITH EXISTING VOICE SYSTEM
  // ==========================================================================

  enhanceVoiceRequest(
    originalRequest: any,
    detection: DaimonicDetected
  ): any {
    const preset = this.selectPreset(detection);
    const voiceTags = this.generateVoiceTags(preset);
    const groundingPrompts = this.generateGroundingPrompts(detection);

    // Prepend voice tags to text
    let enhancedText = originalRequest.text;
    if (voiceTags.length > 0) {
      enhancedText = voiceTags.join(' ') + ' ' + enhancedText;
    }

    // Add grounding prompts if needed
    if (groundingPrompts.length > 0 && detection.trickster.risk >= 0.5) {
      enhancedText = groundingPrompts[0] + ' ' + enhancedText;
    }

    return {
      ...originalRequest,
      text: enhancedText,
      daimonicPreset: preset,
      daimonicTags: voiceTags,
      daimonicContext: {
        tricksterRisk: detection.trickster.risk,
        liminalWeight: detection.liminal.weight,
        bothAndSignature: detection.bothAnd.signature
      }
    };
  }

  // ==========================================================================
  // HELPER METHODS
  // ==========================================================================

  private checkForAntiSolipsism(detection: DaimonicDetected): boolean {
    // Simple heuristic: if all elements are balanced and no trickster energy
    const elements = Object.values(detection.elements);
    const allBalanced = elements.every(score => score >= 40 && score <= 70);
    const lowTrickster = detection.trickster.risk < 0.2;
    
    return allBalanced && lowTrickster;
  }
}