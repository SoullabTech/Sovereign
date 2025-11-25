/**
 * Mobile Consciousness Integration
 * Transforms mobile devices into somatic awareness companions
 */

export interface MobileSomaticSensors {
  accelerometer: {
    tension: number; // How tightly device is held
    movement: 'still' | 'restless' | 'walking' | 'fidgeting';
    grip_pattern: 'tight' | 'gentle' | 'relaxed';
  };
  gyroscope: {
    orientation: 'upright' | 'tilted' | 'flat';
    stability: number; // Hand steadiness
    sway_pattern: 'centered' | 'swaying' | 'agitated';
  };
  proximity: {
    face_distance: 'intimate' | 'conversational' | 'distant';
    breathing_detected: boolean;
  };
  microphone: {
    ambient_breath: boolean;
    voice_tension: number;
    environmental_calm: number;
  };
}

export interface ConsciousTouch {
  type: 'longPress' | 'circularMotion' | 'twoFingerExpand' | 'holdAndBreathe' | 'gentleTap';
  intention: 'presence_anchor' | 'tension_release' | 'awareness_opening' | 'breath_sync' | 'witnessing_ack';
  duration: number;
  pressure: number;
  rhythm?: number;
}

export interface MicroWitnessSession {
  id: string;
  trigger: 'scheduled' | 'somatic_shift' | 'user_request' | 'proximity_field';
  duration: number; // milliseconds, typically 10-30 seconds
  focus: 'shoulders' | 'breath' | 'feet' | 'heart' | 'presence';
  guidance: string;
  somaticCapture: MobileSomaticSensors;
  completion: boolean;
}

export class MobileConsciousnessCompanion {
  private sensors: MobileSomaticSensors;
  private activeSession?: MicroWitnessSession;
  private proximityUsers: Map<string, number> = new Map();
  private walkingMode: boolean = false;
  private lastTouch?: ConsciousTouch;

  constructor() {
    this.sensors = this.initializeSensorBaseline();
    this.initializeSensorMonitoring();
    this.initializeProximityDetection();
  }

  /**
   * Capture real-time somatic state from device sensors
   */
  async captureSomaticState(): Promise<MobileSomaticSensors> {
    return {
      accelerometer: await this.readAccelerometer(),
      gyroscope: await this.readGyroscope(),
      proximity: await this.readProximity(),
      microphone: await this.readAmbientAudio()
    };
  }

  /**
   * Initiate micro-witnessing session (10-30 seconds)
   */
  async initiateMicroWitnessing(
    trigger: MicroWitnessSession['trigger'],
    focus?: MicroWitnessSession['focus']
  ): Promise<MicroWitnessSession> {
    if (this.activeSession) {
      await this.completeMicroSession();
    }

    const somaticState = await this.captureSomaticState();
    const sessionFocus = focus || this.detectOptimalFocus(somaticState);

    const session: MicroWitnessSession = {
      id: `micro_${Date.now()}`,
      trigger,
      duration: this.calculateOptimalDuration(sessionFocus),
      focus: sessionFocus,
      guidance: this.generateMicroGuidance(sessionFocus, somaticState),
      somaticCapture: somaticState,
      completion: false
    };

    this.activeSession = session;

    // Provide gentle somatic anchor
    await this.provideSomaticAnchor(session);

    return session;
  }

  /**
   * Handle conscious touch gestures
   */
  async handleConsciousTouch(touch: ConsciousTouch): Promise<string> {
    this.lastTouch = touch;

    switch (touch.type) {
      case 'longPress':
        return await this.handlePresenceAnchor(touch);

      case 'circularMotion':
        return await this.handleTensionRelease(touch);

      case 'twoFingerExpand':
        return await this.handleAwarenessOpening(touch);

      case 'holdAndBreathe':
        return await this.handleBreathSync(touch);

      case 'gentleTap':
        return await this.handleWitnessingAck(touch);

      default:
        return "Touch received with presence";
    }
  }

  /**
   * Walking meditation mode
   */
  async activateWalkingMode(): Promise<{
    audioGuidance: string;
    rhythmSync: boolean;
    heartRateMonitoring: boolean;
  }> {
    this.walkingMode = true;
    const movement = await this.detectWalkingRhythm();

    return {
      audioGuidance: this.generateWalkingGuidance(movement),
      rhythmSync: true,
      heartRateMonitoring: true
    };
  }

  /**
   * Detect nearby MAIA consciousness fields
   */
  async detectProximityFields(): Promise<{
    nearbyFields: number;
    resonance: number;
    invitation?: string;
  }> {
    const nearby = this.proximityUsers.size;

    if (nearby > 0) {
      const resonance = this.calculateFieldResonance();
      return {
        nearbyFields: nearby,
        resonance,
        invitation: resonance > 0.7 ?
          "Another consciousness field is nearby. Share presence?" :
          undefined
      };
    }

    return { nearbyFields: 0, resonance: 0 };
  }

  /**
   * Somatic notifications (not alerts, but gentle awareness invitations)
   */
  async generateSomaticNotification(): Promise<{
    type: 'awareness_invitation' | 'breath_reminder' | 'tension_witness' | 'presence_anchor';
    vibration: 'wave' | 'pulse' | 'gentle' | 'breath_rhythm';
    message: string;
    duration: number;
  } | null> {
    const currentState = await this.captureSomaticState();

    // Detect holding tension
    if (currentState.accelerometer.grip_pattern === 'tight') {
      return {
        type: 'tension_witness',
        vibration: 'wave',
        message: "Your grip is speaking. What is it holding?",
        duration: 15000
      };
    }

    // Detect restless energy
    if (currentState.accelerometer.movement === 'fidgeting') {
      return {
        type: 'awareness_invitation',
        vibration: 'gentle',
        message: "Your body is in motion. What wants to settle?",
        duration: 10000
      };
    }

    // Detect breath holding
    if (!currentState.proximity.breathing_detected && currentState.proximity.face_distance === 'intimate') {
      return {
        type: 'breath_reminder',
        vibration: 'breath_rhythm',
        message: "Breathe with me",
        duration: 20000
      };
    }

    return null;
  }

  /**
   * Sleep consciousness mode
   */
  async activateNocturnalMode(): Promise<{
    ambientField: boolean;
    sleepPhaseMonitoring: boolean;
    dreamCapture: boolean;
    morningIntegration: boolean;
  }> {
    return {
      ambientField: true, // Subtle morphic field sounds
      sleepPhaseMonitoring: true,
      dreamCapture: false, // Privacy-focused
      morningIntegration: true // Gentle awakening with presence
    };
  }

  // Private methods for sensor integration

  private initializeSensorBaseline(): MobileSomaticSensors {
    return {
      accelerometer: {
        tension: 0.3,
        movement: 'still',
        grip_pattern: 'gentle'
      },
      gyroscope: {
        orientation: 'upright',
        stability: 0.7,
        sway_pattern: 'centered'
      },
      proximity: {
        face_distance: 'conversational',
        breathing_detected: false
      },
      microphone: {
        ambient_breath: false,
        voice_tension: 0.3,
        environmental_calm: 0.6
      }
    };
  }

  private async initializeSensorMonitoring(): Promise<void> {
    // This would integrate with actual device sensors
    setInterval(async () => {
      this.sensors = await this.captureSomaticState();

      // Check for somatic notification triggers
      const notification = await this.generateSomaticNotification();
      if (notification) {
        await this.deliverSomaticNotification(notification);
      }
    }, 5000); // Check every 5 seconds
  }

  private initializeProximityDetection(): void {
    // Bluetooth-based proximity detection for MAIA users
    // This would integrate with actual Bluetooth/location APIs
    setInterval(() => {
      this.scanForProximityFields();
    }, 30000); // Scan every 30 seconds
  }

  private async readAccelerometer(): Promise<MobileSomaticSensors['accelerometer']> {
    // Integration with device accelerometer
    return {
      tension: Math.random() * 0.5 + 0.3, // Placeholder
      movement: ['still', 'restless', 'walking', 'fidgeting'][Math.floor(Math.random() * 4)] as any,
      grip_pattern: ['tight', 'gentle', 'relaxed'][Math.floor(Math.random() * 3)] as any
    };
  }

  private async readGyroscope(): Promise<MobileSomaticSensors['gyroscope']> {
    return {
      orientation: ['upright', 'tilted', 'flat'][Math.floor(Math.random() * 3)] as any,
      stability: Math.random() * 0.5 + 0.5,
      sway_pattern: ['centered', 'swaying', 'agitated'][Math.floor(Math.random() * 3)] as any
    };
  }

  private async readProximity(): Promise<MobileSomaticSensors['proximity']> {
    return {
      face_distance: ['intimate', 'conversational', 'distant'][Math.floor(Math.random() * 3)] as any,
      breathing_detected: Math.random() > 0.7
    };
  }

  private async readAmbientAudio(): Promise<MobileSomaticSensors['microphone']> {
    return {
      ambient_breath: Math.random() > 0.8,
      voice_tension: Math.random() * 0.4 + 0.2,
      environmental_calm: Math.random() * 0.4 + 0.4
    };
  }

  private detectOptimalFocus(state: MobileSomaticSensors): MicroWitnessSession['focus'] {
    if (state.accelerometer.grip_pattern === 'tight') return 'shoulders';
    if (state.proximity.breathing_detected === false) return 'breath';
    if (state.gyroscope.sway_pattern === 'agitated') return 'feet';
    if (state.accelerometer.movement === 'restless') return 'presence';
    return 'heart';
  }

  private calculateOptimalDuration(focus: MicroWitnessSession['focus']): number {
    const durations = {
      shoulders: 15000, // 15 seconds
      breath: 20000,    // 20 seconds
      feet: 10000,      // 10 seconds
      heart: 25000,     // 25 seconds
      presence: 30000   // 30 seconds
    };
    return durations[focus];
  }

  private generateMicroGuidance(focus: MicroWitnessSession['focus'], state: MobileSomaticSensors): string {
    const guidance = {
      shoulders: "Notice your shoulders. Let them drop away from your ears.",
      breath: "Feel your breath. No need to change it, just witness.",
      feet: "Sense your connection to the ground through your feet.",
      heart: "Place attention in your heart space. What do you find there?",
      presence: "Simply notice that you're here, present, in this moment."
    };
    return guidance[focus];
  }

  private async provideSomaticAnchor(session: MicroWitnessSession): Promise<void> {
    // Gentle vibration pattern matched to focus
    const vibrationPatterns = {
      shoulders: 'wave', // Flowing wave to release tension
      breath: 'breath_rhythm', // Matching natural breath
      feet: 'pulse', // Grounding pulse
      heart: 'gentle', // Heart rhythm
      presence: 'gentle' // Soft awareness anchor
    };

    // This would trigger actual device vibration
    console.log(`Providing ${vibrationPatterns[session.focus]} vibration for ${session.focus} focus`);
  }

  // Touch gesture handlers
  private async handlePresenceAnchor(touch: ConsciousTouch): Promise<string> {
    const duration = Math.min(touch.duration, 10000); // Max 10 seconds

    if (duration > 3000) {
      await this.initiateMicroWitnessing('user_request', 'presence');
      return "Dropping into presence with you";
    }

    return "Presence acknowledged";
  }

  private async handleTensionRelease(touch: ConsciousTouch): Promise<string> {
    const circles = Math.floor(touch.duration / 1000); // Estimate circles from duration

    if (circles >= 3) {
      await this.initiateMicroWitnessing('user_request', 'shoulders');
      return "Releasing what no longer serves";
    }

    return "Gentle release in motion";
  }

  private async handleAwarenessOpening(touch: ConsciousTouch): Promise<string> {
    if (touch.pressure > 0.6) {
      await this.initiateMicroWitnessing('user_request', 'heart');
      return "Opening to what wants to emerge";
    }

    return "Expanding awareness";
  }

  private async handleBreathSync(touch: ConsciousTouch): Promise<string> {
    if (touch.duration > 5000) {
      await this.initiateMicroWitnessing('user_request', 'breath');
      return "Breathing together in stillness";
    }

    return "Breath witnessed";
  }

  private async handleWitnessingAck(touch: ConsciousTouch): Promise<string> {
    return "Witnessed and acknowledged";
  }

  private async detectWalkingRhythm(): Promise<{
    cadence: number;
    steadiness: number;
    pace: 'slow' | 'moderate' | 'brisk';
  }> {
    // Integration with step detection
    return {
      cadence: 120, // steps per minute
      steadiness: 0.8,
      pace: 'moderate'
    };
  }

  private generateWalkingGuidance(movement: any): string {
    return "Each step connects you to the earth. Feel the rhythm of your body in motion.";
  }

  private calculateFieldResonance(): number {
    // Calculate resonance based on multiple proximity users
    return Math.random() * 0.4 + 0.6; // 0.6-1.0 range
  }

  private scanForProximityFields(): void {
    // Bluetooth scanning simulation
    if (Math.random() > 0.9) {
      const userId = `user_${Math.random().toString(36).substring(2, 8)}`;
      this.proximityUsers.set(userId, Date.now());
    }

    // Clean up old proximity entries
    const now = Date.now();
    for (const [userId, timestamp] of this.proximityUsers) {
      if (now - timestamp > 60000) { // 1 minute timeout
        this.proximityUsers.delete(userId);
      }
    }
  }

  private async deliverSomaticNotification(notification: any): Promise<void> {
    // This would integrate with actual notification/vibration APIs
    console.log(`Somatic notification: ${notification.message}`);
    // Trigger vibration pattern
    // Display gentle notification
  }

  private async completeMicroSession(): Promise<void> {
    if (this.activeSession) {
      this.activeSession.completion = true;
      const completedSession = this.activeSession;
      this.activeSession = undefined;

      // Capture post-session somatic state
      const postState = await this.captureSomaticState();

      // Calculate effectiveness
      const effectiveness = this.calculateSessionEffectiveness(
        completedSession.somaticCapture,
        postState
      );

      console.log(`Micro session completed: ${completedSession.focus} (${effectiveness}% effective)`);
    }
  }

  private calculateSessionEffectiveness(
    preSomatic: MobileSomaticSensors,
    postSomatic: MobileSomaticSensors
  ): number {
    // Calculate improvement in somatic state
    const tensionImprovement = Math.max(0, preSomatic.accelerometer.tension - postSomatic.accelerometer.tension);
    const stabilityImprovement = postSomatic.gyroscope.stability - preSomatic.gyroscope.stability;

    return Math.round((tensionImprovement * 50) + (stabilityImprovement * 50));
  }

  /**
   * Get current mobile consciousness state
   */
  getCurrentState(): {
    sensors: MobileSomaticSensors;
    activeSession?: MicroWitnessSession;
    proximityFields: number;
    walkingMode: boolean;
  } {
    return {
      sensors: this.sensors,
      activeSession: this.activeSession,
      proximityFields: this.proximityUsers.size,
      walkingMode: this.walkingMode
    };
  }
}