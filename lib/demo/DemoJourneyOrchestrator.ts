import { EventEmitter } from 'events';
import { PersonalOracleAgent } from '@/lib/agents/PersonalOracleAgent';
import { SesameVoiceService } from '@/lib/services/SesameVoiceService';

export interface DemoState {
  phase: 'threshold' | 'presence' | 'elemental' | 'play' | 'closure';
  startTime: number;
  elapsedTime: number;
  userInput?: string;
  currentElement?: 'fire' | 'water' | 'earth' | 'air' | 'aether';
  voiceArchetype: string;
  spiralPosition?: { x: number; y: number; depth: number };
  memoryChoice?: 'hold' | 'dissolve';
}

export interface DemoTransition {
  from: DemoState['phase'];
  to: DemoState['phase'];
  trigger: 'timer' | 'user_input' | 'system';
  timestamp: number;
  metadata?: any;
}

export class DemoJourneyOrchestrator extends EventEmitter {
  private state: DemoState;
  private agent: PersonalOracleAgent;
  private voiceService: SesameVoiceService;
  private transitions: DemoTransition[] = [];
  private phaseTimers: Map<string, NodeJS.Timeout> = new Map();

  constructor() {
    super();

    this.state = {
      phase: 'threshold',
      startTime: Date.now(),
      elapsedTime: 0,
      voiceArchetype: 'maya-default'
    };

    // Initialize demo-specific agent with no persistence
    this.agent = new PersonalOracleAgent('demo-user');

    this.voiceService = new SesameVoiceService({
      defaultVoice: 'nova',
      cacheEnabled: true
    });
  }

  // ═══════════════════════════════════════════════════════════
  // 1. THRESHOLD (0:00-0:30)
  // ═══════════════════════════════════════════════════════════

  async startJourney(): Promise<void> {
    this.emit('journey:start', this.state);

    // Play entrance chime
    await this.playSound('threshold-chime');

    // Visual: Spiral bloom animation
    this.emit('visual:transition', {
      type: 'spiral-bloom',
      duration: 2000,
      from: 'void',
      to: 'presence-spiral'
    });

    // Maya's threshold greeting with presence voice
    const thresholdGreeting = "You've entered a space of presence. When you're ready, speak a word or share what brought you here.";

    await this.speakWithVoice(thresholdGreeting, {
      voiceId: 'maya-default',
      element: 'aether',
      style: 'ritual',
      pauseAfter: 500
    });

    // Set timer for automatic transition if no input
    this.setPhaseTimer('threshold', 30000, () => {
      if (this.state.phase === 'threshold') {
        this.transitionToPresence();
      }
    });

    // Listen for user input
    this.emit('input:enable', {
      mode: 'voice',
      prompt: 'listening'
    });
  }

  // ═══════════════════════════════════════════════════════════
  // 2. PRESENCE CENTER (0:30-1:30)
  // ═══════════════════════════════════════════════════════════

  async transitionToPresence(userInput?: string): Promise<void> {
    this.clearPhaseTimers();
    this.recordTransition('threshold', 'presence', userInput ? 'user_input' : 'timer');

    this.state.phase = 'presence';
    this.state.userInput = userInput;

    this.emit('phase:presence', this.state);

    // Witness Core activation
    this.emit('witness:activate', {
      mode: 'mirror',
      depth: 'surface'
    });

    // Maya reflects what she heard - pure mirroring
    let presenceResponse: string;

    if (userInput) {
      const essence = await this.extractEssence(userInput);
      presenceResponse = this.generatePresenceReflection(essence);
    } else {
      presenceResponse = "I sense you're here, present with whatever is moving through you. ";
    }

    presenceResponse += "Would you like me to meet you in stillness, in reflection, or in movement?";

    await this.speakWithVoice(presenceResponse, {
      voiceId: 'maya-default',
      style: 'soft',
      emotionalDepth: 0.7
    });

    // Three interaction points
    this.emit('choices:present', [
      { id: 'stillness', label: 'Stillness', icon: '○' },
      { id: 'reflection', label: 'Reflection', icon: '◉' },
      { id: 'movement', label: 'Movement', icon: '✧' }
    ]);

    this.setPhaseTimer('presence', 60000, () => {
      this.transitionToElemental('water'); // Default to water for gentleness
    });
  }

  // ═══════════════════════════════════════════════════════════
  // 3. ELEMENTAL SHIFT (1:30-3:00)
  // ═══════════════════════════════════════════════════════════

  async transitionToElemental(element?: string): Promise<void> {
    this.clearPhaseTimers();
    this.recordTransition('presence', 'elemental', 'user_input');

    // Detect element from user choice or input
    const selectedElement = (element || this.detectElement(this.state.userInput)) as DemoState['currentElement'];

    this.state.phase = 'elemental';
    this.state.currentElement = selectedElement || 'water';

    this.emit('phase:elemental', {
      ...this.state,
      element: this.state.currentElement
    });

    // Visual shift to element
    this.emit('visual:element', {
      element: this.state.currentElement,
      transition: 'morph',
      duration: 1500
    });

    // Generate element-specific response
    const elementalResponse = await this.generateElementalResponse(
      this.state.currentElement,
      this.state.userInput || ''
    );

    // Voice shifts to match element
    const elementVoiceMap = {
      fire: 'maya-fire',
      water: 'maya-water',
      earth: 'maya-earth',
      air: 'maya-air',
      aether: 'maya-aether'
    };

    await this.speakWithVoice(elementalResponse.text, {
      voiceId: elementVoiceMap[this.state.currentElement],
      style: elementalResponse.style,
      prosodyHints: elementalResponse.prosody
    });

    // Show elemental balance visualization
    this.emit('visual:balance', {
      elements: this.getElementalBalance(),
      highlight: this.state.currentElement
    });

    this.setPhaseTimer('elemental', 90000, () => {
      this.offerPlayGlimpse();
    });
  }

  // ═══════════════════════════════════════════════════════════
  // 4. OPTIONAL PLAY GLIMPSE (3:00-4:00)
  // ═══════════════════════════════════════════════════════════

  async offerPlayGlimpse(): Promise<void> {
    this.clearPhaseTimers();

    const playInvitation = "Would you like to see where you are in the spiral of your journey?";

    await this.speakWithVoice(playInvitation, {
      voiceId: this.state.voiceArchetype,
      style: 'whisper',
      pauseAfter: 300
    });

    this.emit('play:offer', {
      type: 'spiral-navigation',
      preview: true
    });

    // Show sliding panel with navigation map
    this.emit('panel:slide', {
      content: 'navigation-map',
      position: 'right',
      width: '40%',
      showFor: 30000
    });

    // Calculate and show spiral position
    const spiralPosition = this.calculateSpiralPosition();
    this.state.spiralPosition = spiralPosition;

    this.emit('spiral:reveal', {
      position: spiralPosition,
      petals: this.getActivePetals(),
      element: this.state.currentElement
    });

    // One symbolic reflection
    const symbolicReflection = this.generateSymbolicReflection(spiralPosition);

    await this.speakWithVoice(symbolicReflection, {
      voiceId: this.state.voiceArchetype,
      style: 'ritual',
      speed: 0.9
    });

    this.setPhaseTimer('play', 60000, () => {
      this.transitionToClosure();
    });
  }

  // ═══════════════════════════════════════════════════════════
  // 5. CLOSURE & INTEGRATION (4:00-5:00)
  // ═══════════════════════════════════════════════════════════

  async transitionToClosure(): Promise<void> {
    this.clearPhaseTimers();
    this.recordTransition(this.state.phase, 'closure', 'system');

    this.state.phase = 'closure';

    this.emit('phase:closure', this.state);

    // Maya summarizes in one elemental metaphor
    const closureMetaphor = this.generateClosureMetaphor(
      this.state.currentElement,
      this.state.userInput
    );

    await this.speakWithVoice(closureMetaphor, {
      voiceId: 'maya-default',
      style: 'soft',
      emotionalDepth: 0.8
    });

    // Offer memory choice
    const memoryOffer = "Shall I hold this moment in your memory journey, or let it dissolve back into the mystery?";

    await this.speakWithVoice(memoryOffer, {
      voiceId: 'maya-default',
      style: 'neutral',
      pauseAfter: 500
    });

    this.emit('choices:present', [
      { id: 'hold', label: 'Hold in Memory', icon: '◈' },
      { id: 'dissolve', label: 'Let Dissolve', icon: '○' }
    ]);

    // Wait for choice or auto-dissolve after 30s
    this.setPhaseTimer('closure', 30000, () => {
      this.completeJourney('dissolve');
    });
  }

  async completeJourney(memoryChoice: 'hold' | 'dissolve'): Promise<void> {
    this.clearPhaseTimers();
    this.state.memoryChoice = memoryChoice;

    if (memoryChoice === 'hold') {
      // Store essence in demo memory
      this.emit('memory:store', {
        essence: this.state.userInput,
        element: this.state.currentElement,
        timestamp: Date.now()
      });

      await this.speakWithVoice("Held in the sacred archive of memory.", {
        voiceId: 'maya-default',
        style: 'whisper'
      });
    } else {
      await this.speakWithVoice("Dissolving back into the eternal present.", {
        voiceId: 'maya-default',
        style: 'whisper'
      });
    }

    // Visual fade to neutral
    this.emit('visual:transition', {
      type: 'spiral-rest',
      duration: 3000,
      from: 'active',
      to: 'neutral'
    });

    // Closing chime
    await this.playSound('closing-breath');

    // Journey complete
    this.emit('journey:complete', {
      duration: Date.now() - this.state.startTime,
      transitions: this.transitions,
      finalState: this.state
    });
  }

  // ═══════════════════════════════════════════════════════════
  // HELPER METHODS
  // ═══════════════════════════════════════════════════════════

  private async speakWithVoice(text: string, options: any): Promise<void> {
    const audio = await this.voiceService.generateSpeech({
      text,
      voiceProfile: this.voiceService.getVoiceProfile(options.voiceId),
      element: options.element,
      emotionalContext: {
        mood: options.style,
        intensity: options.emotionalDepth || 0.7
      },
      prosodyHints: options.prosodyHints
    });

    this.emit('voice:speak', {
      text,
      audio,
      options
    });

    // Simulate speech duration
    const wordCount = text.split(' ').length;
    const speakTime = (wordCount / 150) * 60000; // 150 wpm average
    await this.delay(speakTime + (options.pauseAfter || 0));
  }

  private async playSound(soundId: string): Promise<void> {
    this.emit('sound:play', soundId);
    await this.delay(1000); // Standard sound duration
  }

  private generatePresenceReflection(essence: any): string {
    const reflections = [
      `I sense the weight in what you just shared...`,
      `There's something moving beneath your words...`,
      `I'm here with the fullness of what you're carrying...`,
      `Your presence speaks before your words do...`
    ];
    return reflections[Math.floor(Math.random() * reflections.length)];
  }

  private async generateElementalResponse(element: string, input: string): Promise<any> {
    const responses = {
      fire: {
        text: "What needs to ignite or transform in this moment? What catalyst are you ready for?",
        style: 'firm',
        prosody: { emphasis: ['ignite', 'transform', 'catalyst'] }
      },
      water: {
        text: "Let's flow with what's emerging... like water finding its way through stone, patient and persistent.",
        style: 'soft',
        prosody: { pauses: [{ position: 30, duration: 300 }] }
      },
      earth: {
        text: "Feel your feet on the ground. What single, concrete step would honor what you've shared?",
        style: 'neutral',
        prosody: { emphasis: ['ground', 'concrete', 'step'] }
      },
      air: {
        text: "I see the pattern dancing in your words - a clarity seeking to emerge. What wants to be named?",
        style: 'neutral',
        prosody: { intonation: 'questioning' }
      },
      aether: {
        text: "Beyond form, beyond knowing... what mystery is calling you into its dance?",
        style: 'whisper',
        prosody: { pauses: [{ position: 20, duration: 400 }] }
      }
    };

    return responses[element] || responses.water;
  }

  private generateClosureMetaphor(element?: string, input?: string): string {
    const metaphors = {
      fire: "The spark you lit here continues to glow, even as we close this sacred moment.",
      water: "Like a stone dropped in still water, the ripples of this encounter expand outward.",
      earth: "Seeds planted in darkness grow strongest. Trust the soil of this moment.",
      air: "Your words have taken flight, carried on winds we cannot see but always feel.",
      aether: "In the space between breaths, between thoughts, the eternal whispers its secret."
    };

    return metaphors[element || 'aether'];
  }

  private generateSymbolicReflection(position: any): string {
    const reflections = [
      "You stand at the crossroads of becoming, where choice and destiny dance.",
      "The spiral shows you're exactly where you need to be in this moment.",
      "Three steps behind you, seven ahead - but here, now, is where power lives."
    ];

    return reflections[Math.floor(Math.random() * reflections.length)];
  }

  private detectElement(input?: string): string {
    if (!input) return 'water';

    const lower = input.toLowerCase();
    if (lower.includes('change') || lower.includes('action')) return 'fire';
    if (lower.includes('feel') || lower.includes('emotion')) return 'water';
    if (lower.includes('practical') || lower.includes('real')) return 'earth';
    if (lower.includes('think') || lower.includes('understand')) return 'air';
    if (lower.includes('spirit') || lower.includes('meaning')) return 'aether';

    return 'water'; // Default to water for gentleness
  }

  private async extractEssence(input: string): Promise<any> {
    // Simple essence extraction - could be enhanced with NLP
    return {
      emotion: this.detectEmotion(input),
      theme: this.detectTheme(input),
      energy: this.detectEnergy(input)
    };
  }

  private detectEmotion(input: string): string {
    // Simplified emotion detection
    return 'seeking';
  }

  private detectTheme(input: string): string {
    return 'transformation';
  }

  private detectEnergy(input: string): string {
    return 'medium';
  }

  private calculateSpiralPosition(): { x: number; y: number; depth: number } {
    // Demo position based on journey so far
    return {
      x: 0.3 + (Math.random() * 0.4),
      y: 0.3 + (Math.random() * 0.4),
      depth: 1 // First ring of spiral
    };
  }

  private getActivePetals(): string[] {
    // Return petals touched in this demo
    return ['presence', 'witness', this.state.currentElement || 'water'];
  }

  private getElementalBalance(): Record<string, number> {
    return {
      fire: this.state.currentElement === 'fire' ? 0.8 : 0.2,
      water: this.state.currentElement === 'water' ? 0.8 : 0.2,
      earth: this.state.currentElement === 'earth' ? 0.8 : 0.2,
      air: this.state.currentElement === 'air' ? 0.8 : 0.2,
      aether: this.state.currentElement === 'aether' ? 0.8 : 0.2
    };
  }

  private setPhaseTimer(phase: string, duration: number, callback: () => void): void {
    this.clearPhaseTimer(phase);
    const timer = setTimeout(callback, duration);
    this.phaseTimers.set(phase, timer);
  }

  private clearPhaseTimer(phase: string): void {
    const timer = this.phaseTimers.get(phase);
    if (timer) {
      clearTimeout(timer);
      this.phaseTimers.delete(phase);
    }
  }

  private clearPhaseTimers(): void {
    this.phaseTimers.forEach(timer => clearTimeout(timer));
    this.phaseTimers.clear();
  }

  private recordTransition(from: DemoState['phase'], to: DemoState['phase'], trigger: DemoTransition['trigger']): void {
    this.transitions.push({
      from,
      to,
      trigger,
      timestamp: Date.now()
    });
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Public control methods

  handleUserInput(input: string): void {
    switch (this.state.phase) {
      case 'threshold':
        this.transitionToPresence(input);
        break;
      case 'presence':
        if (['stillness', 'reflection', 'movement'].includes(input.toLowerCase())) {
          const elementMap = {
            'stillness': 'earth',
            'reflection': 'water',
            'movement': 'fire'
          };
          this.transitionToElemental(elementMap[input.toLowerCase()]);
        }
        break;
      case 'closure':
        if (['hold', 'dissolve'].includes(input.toLowerCase())) {
          this.completeJourney(input.toLowerCase() as 'hold' | 'dissolve');
        }
        break;
    }
  }

  skipToPhase(phase: DemoState['phase']): void {
    this.clearPhaseTimers();

    switch (phase) {
      case 'presence':
        this.transitionToPresence();
        break;
      case 'elemental':
        this.transitionToElemental();
        break;
      case 'play':
        this.offerPlayGlimpse();
        break;
      case 'closure':
        this.transitionToClosure();
        break;
    }
  }

  getCurrentState(): DemoState {
    return {
      ...this.state,
      elapsedTime: Date.now() - this.state.startTime
    };
  }
}