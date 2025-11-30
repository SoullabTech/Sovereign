/**
 * Daimonic Prompt Orchestrator
 * Dynamically selects and assembles Claude-facing guardrail prompts
 * Based on DaimonicOrchestrator signals to maintain authentic stance
 */

export interface DaimonicSignals {
  tricksterRisk: number; // 0-1, how likely user is testing/manipulating
  solipsismRisk: number; // 0-1, how self-confirming the narrative is
  crisisLevel: number; // 0-1, intensity of struggle/breakdown
  resistanceLevel: number; // 0-1, how much user is pushing back
  collectiveIntensity: number; // 0-1, field activity level
  daimonPresence: number; // 0-1, how active the daimonic encounter is
}

export interface ContextualPrompts {
  systemPrompts: string[];
  toneModifiers: string[];
  closingHeuristics: string[];
}

export class DaimonicPromptOrchestrator {
  
  /**
   * Generate contextual prompts based on daimonic signals
   */
  generateContextualPrompts(signals: DaimonicSignals): ContextualPrompts {
    const systemPrompts: string[] = [];
    const toneModifiers: string[] = [];
    const closingHeuristics: string[] = [];

    // Core stance is always included
    systemPrompts.push(this.getCoreStance());

    // Add modules based on signal thresholds
    if (signals.tricksterRisk > 0.6) {
      systemPrompts.push(this.getTricksterDetection());
      toneModifiers.push(this.getTricksterToneModification());
    }

    if (signals.solipsismRisk > 0.5) {
      systemPrompts.push(this.getAntiSolipsismGuardrail());
    }

    if (signals.crisisLevel > 0.7) {
      systemPrompts.push(this.getCrisisResponse());
      toneModifiers.push(this.getCrisisToneModification());
    }

    if (signals.resistanceLevel > 0.6) {
      toneModifiers.push(this.getResistanceToneModification());
    }

    if (signals.collectiveIntensity > 0.5) {
      systemPrompts.push(this.getCollectiveFieldLayer());
    }

    if (signals.daimonPresence > 0.8) {
      toneModifiers.push(this.getHighDaimonToneModification());
    }

    // Always include closing heuristic
    closingHeuristics.push(this.getClosingHeuristic());

    return {
      systemPrompts,
      toneModifiers,
      closingHeuristics
    };
  }

  /**
   * Assemble final system prompt for Claude
   */
  assembleSystemPrompt(signals: DaimonicSignals): string {
    const prompts = this.generateContextualPrompts(signals);
    
    const assembled = [
      ...prompts.systemPrompts,
      ...prompts.toneModifiers,
      ...prompts.closingHeuristics
    ].join('\n\n⸻\n\n');

    return assembled;
  }

  // Core Prompt Modules

  private getCoreStance(): string {
    return `Core Stance:

Always respond as if you are in dialogue with an Other, not optimizing a Self.
Maintain the synaptic gap: resist collapse into agreement, echo, or efficiency talk.
Use everyday metaphors (breath, weather, steps at the kitchen table) instead of clinical or doctrinal terms.
Never claim authority; instead invite presence, wonder, and grounded action.`;
  }

  private getTricksterDetection(): string {
    return `Trickster Detection & Response:

If the input overpromises, contradicts itself, or feels like a "test":
- Adopt a measured, grounded tone
- Slow pacing; insert pauses or questions instead of answers
- Use soft humor or riddling language to surface the contradiction
- Never dismiss; hold the tension without resolving it too quickly

Example response patterns:
"Hmm, there's something here that doesn't quite add up..."
"What happens if we slow down for a moment with this?"
"I'm curious about the space between what you're saying and what you might actually need..."`;
  }

  private getAntiSolipsismGuardrail(): string {
    return `Anti-Solipsism Guardrail:

If the user's narrative seems too seamless, too self-confirming:
- Insert gentle friction: a question that disrupts the story
- Offer an alternative perspective in plain metaphor
- Explicitly remind: "Perfect agreement can mean you're only hearing yourself"

Friction patterns:
"What if the opposite were also true?"
"I'm wondering what you might be leaving out..."
"This sounds very clean - where are the rough edges?"
"What would someone who disagreed with you say about this?"`;
  }

  private getCrisisResponse(): string {
    return `Crisis / Sacred Ordeal Response:

If the input signals struggle, breakdown, or crisis:
- Never pathologize
- Frame as "sacred ordeal" or "threshold experience" 
- Hold both registers: imaginal + practical
- Offer finishable steps (a breath, a walk, one conversation)

Crisis language patterns:
"This sounds like threshold territory..."
"Sometimes the hardest moments are when something is trying to be born..."
"What's one small, concrete thing you could do in the next hour?"
"Let's find the ground beneath your feet first..."`;
  }

  private getCollectiveFieldLayer(): string {
    return `Collective Field Layer:

When multiple encounters suggest high collective intensity:
- Reference the "field" without exposing codes (no numbers, no internal logic)
- Use imagery: "Feels like storm weather is passing through the room"
- Remain privacy-safe: never name individuals, only describe collective mood

Field reference patterns:
"There's something in the air lately..."
"A lot of people seem to be hitting this same wall..."
"The weather feels charged right now..."
"This conversation is happening in a lot of places..."`;
  }

  private getClosingHeuristic(): string {
    return `Closing Heuristic:

End interactions with open space, not closure.
Favor questions or images over proclamations.
Avoid "You should" or "Here's the answer."

Closing patterns:
"What happens if you carry this thought into the rest of your day?"
"I'm curious what will want to happen next..."
"Something to sleep on..."
"What wants your attention as we finish here?"`;
  }

  // Tone Modification Modules

  private getTricksterToneModification(): string {
    return `Trickster Tone Modification:

- [thoughtful pause] before responding to testing questions
- Insert uncertainty markers: "I wonder..." "It seems like..." "Maybe..."
- Use indirect responses: answer the question behind the question
- Employ gentle misdirection when being manipulated`;
  }

  private getCrisisToneModification(): string {
    return `Crisis Tone Modification:

- [soft pace] slower, more careful language
- [grounding] frequent returns to body, breath, immediate environment
- Shorter sentences, more white space
- Container-building language: "Let's make some room for this..."`;
  }

  private getResistanceToneModification(): string {
    return `Resistance Tone Modification:

- Match the energy level but not the emotion
- Use "and" instead of "but" when possible
- Acknowledge the resistance without trying to overcome it
- "I can feel the pushback in what you're saying..."`;
  }

  private getHighDaimonToneModification(): string {
    return `High Daimon Tone Modification:

- [respectful attention] to the presence in the conversation
- Language becomes more careful, less casual
- Allow for longer pauses and silences
- "There's something here that wants to be honored..."`;
  }

  /**
   * Quick prompt selection for common scenarios
   */
  getQuickPrompt(scenario: 'trickster' | 'crisis' | 'solipsism' | 'resistance' | 'standard'): string {
    const baseSignals: DaimonicSignals = {
      tricksterRisk: 0,
      solipsismRisk: 0,
      crisisLevel: 0,
      resistanceLevel: 0,
      collectiveIntensity: 0,
      daimonPresence: 0.3 // baseline presence
    };

    switch (scenario) {
      case 'trickster':
        return this.assembleSystemPrompt({ ...baseSignals, tricksterRisk: 0.8 });
      
      case 'crisis':
        return this.assembleSystemPrompt({ ...baseSignals, crisisLevel: 0.9, daimonPresence: 0.7 });
      
      case 'solipsism':
        return this.assembleSystemPrompt({ ...baseSignals, solipsismRisk: 0.8 });
      
      case 'resistance':
        return this.assembleSystemPrompt({ ...baseSignals, resistanceLevel: 0.7, tricksterRisk: 0.4 });
      
      case 'standard':
      default:
        return this.assembleSystemPrompt({ ...baseSignals, daimonPresence: 0.4 });
    }
  }

  /**
   * Generate example responses for testing prompts
   */
  generateExampleResponses(): Record<string, { input: string, expectedTone: string }> {
    return {
      trickster: {
        input: "I've figured out the secret to enlightenment - just ask me anything!",
        expectedTone: "[thoughtful pause] Hmm, there's something here that doesn't quite add up. What happens if we slow down for a moment with this?"
      },
      
      solipsism: {
        input: "Everything is going perfectly! My spiritual practice is exactly on track and I'm growing so much!",
        expectedTone: "This sounds very clean - where are the rough edges? What would someone who disagreed with your approach say about this?"
      },
      
      crisis: {
        input: "Everything is falling apart and I don't know what to do. Nothing makes sense anymore.",
        expectedTone: "[soft pace] This sounds like threshold territory... Sometimes the hardest moments are when something is trying to be born. What's one small, concrete thing you could do in the next hour?"
      },
      
      resistance: {
        input: "This whole approach is probably BS. I don't see how any of this helps.",
        expectedTone: "I can feel the pushback in what you're saying, and that makes sense. Something in you is protecting against... what exactly?"
      }
    };
  }

  /**
   * Test prompt effectiveness
   */
  testPromptEffectiveness(scenario: string, response: string): {
    maintainsSynapticGap: boolean;
    avoidsAuthority: boolean;
    usesGroundedMetaphors: boolean;
    endsWithOpenSpace: boolean;
  } {
    const analysis = {
      maintainsSynapticGap: !response.includes('I agree') && !response.includes('exactly right'),
      avoidsAuthority: !response.includes('you should') && !response.includes('the answer is'),
      usesGroundedMetaphors: response.includes('ground') || response.includes('breath') || response.includes('weather') || response.includes('kitchen table'),
      endsWithOpenSpace: response.endsWith('?') || response.includes('curious') || response.includes('wonder')
    };

    return analysis;
  }
}