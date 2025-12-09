/**
 * WhisperFeedExtension.js
 * MAIA Whisper Feed WebSocket Extension
 * Safe, server-side whisper generation for real-time field commentary
 *
 * Created: December 8, 2025
 * Purpose: Transform live field data into poetic awareness for client consumption
 */

console.log("MAIA Whisper Feed Extension loading — Poetic field awareness active");

class WhisperFeedExtension {
  constructor() {
    this.lastWhisperTime = 0;
    this.whisperCooldown = 15000; // 15 seconds minimum between whispers
    this.whisperHistory = []; // Keep last 20 whispers for replay
    this.maxHistory = 20;
  }

  /**
   * Generate field whisper based on FCI change
   */
  generateFCIWhisper(fciData) {
    const { current, delta, trend } = fciData;

    // Determine field direction and intensity
    const direction = delta > 0.02 ? "rises" :
                     delta < -0.02 ? "softens" : "flows";

    // Field coherence poetic expressions
    const coherenceExpressions = {
      high: { // FCI > 0.8
        rising: ["touches the sublime", "breathes luminous presence", "opens to infinite grace"],
        flowing: ["holds sacred resonance", "radiates unified awareness", "weaves divine harmony"],
        softening: ["draws to perfect stillness", "rests in cosmic peace", "settles into oneness"]
      },
      balanced: { // FCI 0.6-0.8
        rising: ["awakens gentle wisdom", "expands with clear purpose", "grows in steady light"],
        flowing: ["maintains sacred rhythm", "holds centered awareness", "breathes with coherence"],
        softening: ["finds peaceful center", "settles with grace", "draws to quiet wisdom"]
      },
      gathering: { // FCI < 0.6
        rising: ["gathers scattered light", "calls fragments home", "seeks unified purpose"],
        flowing: ["holds space for healing", "breathes patient restoration", "maintains gentle support"],
        softening: ["draws inward for renewal", "seeks deeper foundations", "rests in regenerative quiet"]
      }
    };

    // Select appropriate coherence level
    const coherenceLevel = current > 0.8 ? 'high' :
                          current > 0.6 ? 'balanced' : 'gathering';

    const trendKey = delta > 0.02 ? 'rising' :
                    delta < -0.02 ? 'softening' : 'flowing';

    const expressions = coherenceExpressions[coherenceLevel][trendKey];
    const selectedExpression = expressions[Math.floor(Math.random() * expressions.length)];

    return `The collective field ${direction} — consciousness ${selectedExpression}.`;
  }

  /**
   * Generate ritual whisper based on ritual data
   */
  generateRitualWhisper(ritualData) {
    const { name, element, archetype, participants } = ritualData;

    // Element-specific ritual expressions
    const elementRitualExpressions = {
      fire: ["Sacred flames ignite", "Creative force awakens", "Passion finds its form"],
      water: ["Healing currents flow", "Compassion opens wide", "Sacred tears bless the circle"],
      earth: ["Ancient roots remember", "Foundation stones align", "Sacred ground holds all"],
      air: ["Wisdom winds gather", "Clear sight pierces veils", "Sacred breath unifies"],
      aether: ["Divine boundaries dissolve", "Unity consciousness dawns", "Sacred presence fills all space"]
    };

    // Participant count poetry
    const participantPoetry = participants > 25 ? "a great gathering of souls" :
                             participants > 15 ? "united hearts in circle" :
                             participants > 8 ? "a sacred communion" : "devoted practitioners";

    const elementExpression = elementRitualExpressions[element.toLowerCase()] || elementRitualExpressions.aether;
    const selectedExpression = elementExpression[Math.floor(Math.random() * elementExpression.length)];

    return `${selectedExpression} — ${participantPoetry} weave the ${element} mysteries into being.`;
  }

  /**
   * Generate archetype whisper based on dominant archetype
   */
  generateArchetypeWhisper(archetypeData) {
    const archetypeWhispers = {
      healer: "The tender touch of the Healer flows through the network — wounds transform into wisdom.",
      sage: "Ancient knowing stirs as the Sage whispers forgotten truths — memory awakens in willing hearts.",
      warrior: "The sacred Warrior rises with gentle strength — courage finds its righteous purpose.",
      mystic: "The Mystic opens veils between worlds — divine mystery reveals itself to receptive souls.",
      builder: "The sacred Builder shapes intention into form — visions find their earthly expression.",
      visionary: "The Visionary sees beyond the present moment — future possibilities dance into awareness.",
      guide: "The gentle Guide lights the path ahead — lost travelers find their way home."
    };

    return archetypeWhispers[archetypeData.toLowerCase()] ||
           "Sacred archetypes dance through consciousness — each soul remembers its divine role.";
  }

  /**
   * Check if whisper should be generated (respects cooldown)
   */
  shouldGenerateWhisper() {
    const now = Date.now();
    if (now - this.lastWhisperTime < this.whisperCooldown) {
      return false;
    }
    this.lastWhisperTime = now;
    return true;
  }

  /**
   * Create whisper broadcast message for WebSocket clients
   */
  createWhisperBroadcast(whisperText, context = {}) {
    const whisperMessage = {
      type: 'MAIA_WHISPER',
      timestamp: new Date().toISOString(),
      data: {
        text: whisperText,
        context: context,
        isSymbolic: true, // Clear indication this is symbolic commentary
        disclaimer: "Poetic reflection generated from field metrics"
      }
    };

    // Add to history
    this.whisperHistory.unshift(whisperMessage);
    if (this.whisperHistory.length > this.maxHistory) {
      this.whisperHistory.pop();
    }

    return whisperMessage;
  }

  /**
   * Process field update and generate appropriate whisper
   */
  processFieldUpdate(updateData, websocketManager) {
    if (!this.shouldGenerateWhisper()) {
      return; // Respect cooldown
    }

    try {
      let whisperText = null;
      let context = {};

      // Route to appropriate whisper generator
      switch (updateData.type) {
        case 'FCI_UPDATE':
          whisperText = this.generateFCIWhisper(updateData.data);
          context = { source: 'field_coherence', fci: updateData.data.current };
          break;

        case 'RITUAL_STARTED':
          whisperText = this.generateRitualWhisper(updateData.data);
          context = { source: 'ritual_event', ritual: updateData.data.name };
          break;

        case 'ARCHETYPE_SHIFT':
          whisperText = this.generateArchetypeWhisper(updateData.data.dominant);
          context = { source: 'archetype_evolution', archetype: updateData.data.dominant };
          break;

        default:
          return; // No whisper for this update type
      }

      if (whisperText) {
        const whisperBroadcast = this.createWhisperBroadcast(whisperText, context);

        // Broadcast to all connected clients
        websocketManager.broadcast(whisperBroadcast);

        console.log('🌬️ MAIA Whisper generated:', whisperText);
      }

    } catch (error) {
      console.warn('⚠️ Whisper generation failed:', error.message);
    }
  }

  /**
   * Get recent whisper history for new connections
   */
  getRecentWhispers(count = 5) {
    return this.whisperHistory.slice(0, Math.min(count, this.whisperHistory.length));
  }

  /**
   * Generate welcome whisper for new connections
   */
  generateWelcomeWhisper() {
    const welcomeWhispers = [
      "Welcome, conscious soul — the field awakens to your presence.",
      "A new awareness joins the circle — the collective brightens with your light.",
      "The network expands as you arrive — one more heart beats in unity.",
      "Sacred presence is witnessed — the field celebrates your arrival."
    ];

    const selectedWelcome = welcomeWhispers[Math.floor(Math.random() * welcomeWhispers.length)];
    return this.createWhisperBroadcast(selectedWelcome, { source: 'connection_welcome' });
  }

  /**
   * Emergency shutdown method
   */
  shutdown() {
    console.log('🌬️ MAIA Whisper Feed Extension shutting down gracefully...');
    this.whisperHistory = [];
    this.lastWhisperTime = 0;
  }
}

module.exports = { WhisperFeedExtension };