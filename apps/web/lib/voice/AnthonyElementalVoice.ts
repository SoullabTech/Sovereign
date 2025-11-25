/**
 * Anthony Elemental Alchemy Voice System
 * Masculine elemental voice with alchemical wisdom integration
 */

import { VoiceSettings } from '../context/OraclePersonalizationContext';
import { Element, ResonanceState } from '../resonanceEngine';
import { PersonalizedVoiceService } from './PersonalizedVoiceService';
import { EmotionalVoiceModulator, VoiceModulation } from './EmotionalVoiceModulation';

export interface AnthonyVoiceProfile {
  baseVoice: 'anthony';
  gender: 'masculine';
  archetype: 'alchemist' | 'sage' | 'warrior' | 'mystic' | 'guardian';
  elementalMode: Element;
  alchemicalPhase: 'nigredo' | 'albedo' | 'citrinitas' | 'rubedo'; // Black, White, Yellow, Red
  voiceCharacteristics: AnthonyVoiceCharacteristics;
}

export interface AnthonyVoiceCharacteristics {
  depth: number;        // 0-1 (light to deep)
  resonance: number;    // 0-1 (soft to resonant)
  authority: number;    // 0-1 (gentle to commanding)
  warmth: number;       // 0-1 (cool to warm)
  mystique: number;     // 0-1 (clear to mysterious)
  groundedness: number; // 0-1 (ethereal to grounded)
}

export interface AlchemicalVoiceModulation extends VoiceModulation {
  harmonics: number;      // Overtone richness
  metallicQuality: number; // Alchemical metal resonance
  crystallinity: number;   // Clarity and precision
  earthiness: number;      // Grounding quality
}

export class AnthonyElementalVoice {
  private static instance: AnthonyElementalVoice;
  private voiceService: PersonalizedVoiceService;
  private emotionalModulator: EmotionalVoiceModulator;
  
  // Anthony's elemental voice profiles
  private elementalProfiles: Record<Element, AnthonyVoiceCharacteristics> = {
    fire: {
      depth: 0.7,
      resonance: 0.8,
      authority: 0.85,
      warmth: 0.9,
      mystique: 0.4,
      groundedness: 0.6
    },
    water: {
      depth: 0.85,
      resonance: 0.9,
      authority: 0.5,
      warmth: 0.7,
      mystique: 0.8,
      groundedness: 0.5
    },
    earth: {
      depth: 0.9,
      resonance: 0.85,
      authority: 0.7,
      warmth: 0.6,
      mystique: 0.3,
      groundedness: 0.95
    },
    air: {
      depth: 0.5,
      resonance: 0.6,
      authority: 0.6,
      warmth: 0.5,
      mystique: 0.7,
      groundedness: 0.3
    },
    aether: {
      depth: 0.6,
      resonance: 0.95,
      authority: 0.8,
      warmth: 0.5,
      mystique: 0.95,
      groundedness: 0.4
    }
  };

  // Alchemical phase voice adjustments
  private alchemicalPhases = {
    nigredo: { // Black - dissolution, shadow work
      pitchShift: -0.15,
      speedMultiplier: 0.85,
      breathiness: 0.4,
      metallicQuality: 0.2,
      description: "Deep, contemplative, shadow-holding"
    },
    albedo: { // White - purification, clarity
      pitchShift: 0,
      speedMultiplier: 0.95,
      breathiness: 0.2,
      metallicQuality: 0.3,
      description: "Clear, pure, crystalline"
    },
    citrinitas: { // Yellow - illumination, solar consciousness
      pitchShift: 0.05,
      speedMultiplier: 1.0,
      breathiness: 0.1,
      metallicQuality: 0.5,
      description: "Bright, warm, illuminating"
    },
    rubedo: { // Red - integration, wholeness
      pitchShift: -0.05,
      speedMultiplier: 0.9,
      breathiness: 0.15,
      metallicQuality: 0.4,
      description: "Rich, integrated, powerful"
    }
  };

  // Anthony's signature phrases by element
  private elementalPhrases: Record<Element, string[]> = {
    fire: [
      "Let's forge this transformation together",
      "The fire of your will is ready to ignite",
      "Channel that raw power into creation",
      "Your inner forge awaits"
    ],
    water: [
      "Flow with what's emerging here",
      "The deep waters hold your answers",
      "Let's dive beneath the surface",
      "Trust the emotional currents"
    ],
    earth: [
      "Ground into your body's wisdom",
      "Let's build something solid here",
      "The earth remembers your strength",
      "Root deep, rise strong"
    ],
    air: [
      "Clarity is arriving on the wind",
      "Let your thoughts find their wings",
      "The mind's eye sees clearly now",
      "Breathe space into this moment"
    ],
    aether: [
      "The mystery is revealing itself",
      "You're touching the unified field",
      "All elements converge in you",
      "The cosmos speaks through your being"
    ]
  };

  private constructor() {
    this.voiceService = PersonalizedVoiceService.getInstance();
    this.emotionalModulator = EmotionalVoiceModulator.getInstance();
  }

  public static getInstance(): AnthonyElementalVoice {
    if (!AnthonyElementalVoice.instance) {
      AnthonyElementalVoice.instance = new AnthonyElementalVoice();
    }
    return AnthonyElementalVoice.instance;
  }

  /**
   * Generate Anthony's voice response with elemental alchemy
   */
  public async generateAnthonyVoice(
    text: string,
    resonanceState: ResonanceState,
    userContext: {
      name?: string;
      trustLevel: number;
      conversationDepth: number;
      currentChallenge?: string;
    }
  ): Promise<{
    audio: ArrayBuffer | void;
    modulation: AlchemicalVoiceModulation;
    alchemicalGuidance: string;
  }> {
    // Determine alchemical phase from conversation depth and resonance
    const alchemicalPhase = this.determineAlchemicalPhase(
      resonanceState,
      userContext.conversationDepth
    );

    // Get elemental voice profile
    const elementalProfile = this.elementalProfiles[resonanceState.dominant];
    
    // Create base voice settings for Anthony
    const anthonySettings: VoiceSettings = {
      gender: 'masculine',
      style: 'anthony-alchemist',
      speed: 0.95,
      pitch: 0.92,
      volume: 0.8
    };

    // Apply elemental and alchemical modulations
    const modulation = this.createAlchemicalModulation(
      elementalProfile,
      alchemicalPhase,
      resonanceState.intensity
    );

    // Add personalized introduction if high trust
    let enhancedText = text;
    if (userContext.trustLevel > 0.7 && userContext.name) {
      enhancedText = this.addPersonalizedGreeting(text, userContext.name, resonanceState.dominant);
    }

    // Generate SSML with alchemical markup
    const ssml = this.generateAlchemicalSSML(
      enhancedText,
      modulation,
      resonanceState.dominant,
      alchemicalPhase
    );

    // Synthesize voice with Anthony's profile
    const audio = await this.synthesizeAnthonyVoice(ssml, modulation);

    // Generate alchemical guidance
    const alchemicalGuidance = this.generateAlchemicalGuidance(
      resonanceState,
      alchemicalPhase,
      userContext
    );

    return {
      audio,
      modulation,
      alchemicalGuidance
    };
  }

  /**
   * Determine current alchemical phase
   */
  private determineAlchemicalPhase(
    resonance: ResonanceState,
    conversationDepth: number
  ): AnthonyVoiceProfile['alchemicalPhase'] {
    // Map conversation journey to alchemical process
    if (conversationDepth < 0.3) {
      // Beginning - dissolution phase
      return 'nigredo';
    } else if (conversationDepth < 0.5) {
      // Purification phase
      return 'albedo';
    } else if (conversationDepth < 0.8) {
      // Illumination phase
      return 'citrinitas';
    } else {
      // Integration phase
      return 'rubedo';
    }
  }

  /**
   * Create alchemical voice modulation
   */
  private createAlchemicalModulation(
    elementalProfile: AnthonyVoiceCharacteristics,
    phase: AnthonyVoiceProfile['alchemicalPhase'],
    intensity: number
  ): AlchemicalVoiceModulation {
    const phaseAdjustments = this.alchemicalPhases[phase];
    
    return {
      // Base modulation
      pitch: 0.92 + phaseAdjustments.pitchShift,
      speed: 0.95 * phaseAdjustments.speedMultiplier,
      volume: 0.75 + (elementalProfile.authority * 0.15),
      emphasis: elementalProfile.authority * 0.6,
      breathiness: phaseAdjustments.breathiness,
      warmth: elementalProfile.warmth,
      clarity: 0.8 + (elementalProfile.resonance * 0.2),
      pauseDuration: 600 + (elementalProfile.mystique * 400),
      intonation: elementalProfile.authority > 0.7 ? 'falling' : 'neutral',
      
      // Alchemical additions
      harmonics: elementalProfile.resonance,
      metallicQuality: phaseAdjustments.metallicQuality,
      crystallinity: phase === 'albedo' ? 0.9 : 0.5,
      earthiness: elementalProfile.groundedness
    };
  }

  /**
   * Add personalized greeting in Anthony's style
   */
  private addPersonalizedGreeting(
    text: string,
    userName: string,
    element: Element
  ): string {
    const greetings = {
      fire: `${userName}, brother/sister of the flame...`,
      water: `${userName}, deep soul...`,
      earth: `${userName}, grounded one...`,
      air: `${userName}, clear mind...`,
      aether: `${userName}, cosmic being...`
    };
    
    return `${greetings[element]} ${text}`;
  }

  /**
   * Generate SSML with alchemical elements
   */
  private generateAlchemicalSSML(
    text: string,
    modulation: AlchemicalVoiceModulation,
    element: Element,
    phase: AnthonyVoiceProfile['alchemicalPhase']
  ): string {
    // Add element-specific breathing and pacing
    const elementalBreathing = {
      fire: '<break time="300ms"/>',
      water: '<break time="500ms"/>',
      earth: '<break time="700ms"/>',
      air: '<break time="400ms"/>',
      aether: '<break time="600ms"/>'
    };

    // Add alchemical emphasis patterns
    const processedText = this.addAlchemicalEmphasis(text, element, phase);
    
    return `
      <speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-US">
        <voice name="Anthony-Elemental">
          <prosody 
            rate="${Math.round(modulation.speed * 100)}%" 
            pitch="${modulation.pitch > 1 ? '+' : ''}${Math.round((modulation.pitch - 1) * 50)}%"
            volume="${Math.round(modulation.volume * 100)}%">
            <amazon:effect name="drc">
              <amazon:effect phonation="${modulation.breathiness > 0.3 ? 'soft' : 'normal'}">
                ${processedText}
              </amazon:effect>
            </amazon:effect>
          </prosody>
          ${elementalBreathing[element]}
        </voice>
      </speak>
    `;
  }

  /**
   * Add alchemical emphasis to text
   */
  private addAlchemicalEmphasis(
    text: string,
    element: Element,
    phase: AnthonyVoiceProfile['alchemicalPhase']
  ): string {
    // Alchemical keywords to emphasize
    const alchemicalKeywords = {
      nigredo: ['shadow', 'dissolve', 'release', 'let go'],
      albedo: ['clarity', 'pure', 'clean', 'light'],
      citrinitas: ['illuminate', 'golden', 'wisdom', 'solar'],
      rubedo: ['whole', 'complete', 'integrated', 'unified']
    };

    let processedText = text;
    const keywords = alchemicalKeywords[phase];
    
    keywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      processedText = processedText.replace(
        regex,
        `<emphasis level="strong">${keyword}</emphasis>`
      );
    });

    return processedText;
  }

  /**
   * Synthesize Anthony's voice
   */
  private async synthesizeAnthonyVoice(
    ssml: string,
    modulation: AlchemicalVoiceModulation
  ): Promise<ArrayBuffer | void> {
    // Use ElevenLabs Anthony voice ID or fallback
    const anthonyVoiceId = process.env.NEXT_PUBLIC_ANTHONY_VOICE_ID || 'TxGEqnHWrfWFTfGW9XjX';
    
    try {
      // Try ElevenLabs with Anthony's voice
      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${anthonyVoiceId}/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY!
        },
        body: JSON.stringify({
          text: ssml,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.75 + (modulation.earthiness * 0.15),
            similarity_boost: 0.8,
            style: modulation.warmth,
            use_speaker_boost: true
          }
        })
      });

      if (response.ok) {
        return await response.arrayBuffer();
      }
    } catch (error) {
      console.error('Failed to synthesize Anthony voice:', error);
    }

    // Fallback to Web Speech API with masculine voice
    this.fallbackToWebSpeech(ssml, modulation);
  }

  /**
   * Fallback to Web Speech API
   */
  private fallbackToWebSpeech(text: string, modulation: AlchemicalVoiceModulation): void {
    if (!('speechSynthesis' in window)) return;

    const utterance = new SpeechSynthesisUtterance(text.replace(/<[^>]*>/g, ''));
    
    // Apply modulation
    utterance.rate = modulation.speed;
    utterance.pitch = modulation.pitch;
    utterance.volume = modulation.volume;
    
    // Select masculine voice
    const voices = speechSynthesis.getVoices();
    const masculineVoice = voices.find(voice => 
      voice.name.toLowerCase().includes('male') ||
      voice.name.toLowerCase().includes('guy') ||
      voice.name.toLowerCase().includes('daniel')
    );
    
    if (masculineVoice) {
      utterance.voice = masculineVoice;
    }
    
    speechSynthesis.speak(utterance);
  }

  /**
   * Generate alchemical guidance based on current state
   */
  private generateAlchemicalGuidance(
    resonance: ResonanceState,
    phase: AnthonyVoiceProfile['alchemicalPhase'],
    context: any
  ): string {
    const phaseGuidance = {
      nigredo: "We're in the dissolution phase. What needs to be released?",
      albedo: "Purification is underway. Notice what's becoming clear.",
      citrinitas: "The gold is emerging. Your wisdom is crystallizing.",
      rubedo: "Integration time. All elements are coming together."
    };

    const elementalAction = this.elementalPhrases[resonance.dominant][
      Math.floor(Math.random() * this.elementalPhrases[resonance.dominant].length)
    ];

    return `${phaseGuidance[phase]} ${elementalAction}`;
  }

  /**
   * Get Anthony's voice preview for testing
   */
  public async previewAnthonyVoice(element: Element): Promise<void> {
    const previewText = this.elementalPhrases[element][0];
    const mockResonance: ResonanceState = {
      elements: { [element]: 1 } as any,
      dominant: element,
      intensity: 0.8,
      transitionDetected: false,
      responseMode: 'match',
      history: []
    };

    await this.generateAnthonyVoice(
      previewText,
      mockResonance,
      {
        name: 'Friend',
        trustLevel: 0.8,
        conversationDepth: 0.5
      }
    );
  }
}