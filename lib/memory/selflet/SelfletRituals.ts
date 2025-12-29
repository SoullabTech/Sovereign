/**
 * SELFLET RITUALS SERVICE
 *
 * The MAIA-facing interface for temporal identity work.
 * This service generates the prompts, reflections, and dialogues
 * that MAIA uses to weave selflet awareness into conversation.
 *
 * Design: Seamless Integration
 * - Never mentions "selflets" to users
 * - Uses natural language about "past self", "who you were", "who you're becoming"
 * - Surfaces wisdom at contextually appropriate moments
 * - Generates bridging rituals for metamorphosis
 */

import { selfletChain } from './SelfletChain';
import { selfletBoundaryDetector } from './SelfletBoundaryDetector';
import {
  SelfletNode,
  SelfletMessage,
  Metamorphosis,
  ReflectionPrompt,
  DialogueScript,
  MetamorphosisRitual,
  Element,
  getMetamorphosisSymbol,
} from './types';

// ═══════════════════════════════════════════════════════════════
// SELFLET RITUALS SERVICE
// ═══════════════════════════════════════════════════════════════

export class SelfletRitualService {

  /**
   * Generate a temporal reflection prompt
   * MAIA uses this to surface a past-self message at an appropriate moment
   */
  async invokeTemporalReflection(
    userId: string,
    currentThemes?: string[]
  ): Promise<ReflectionPrompt | null> {
    // Get relevant pending messages
    const pendingMessages = currentThemes?.length
      ? await selfletChain.getRelevantMessages(userId, currentThemes)
      : await selfletChain.getPendingMessages(userId);

    if (pendingMessages.length === 0) return null;

    // Pick the most relevant message
    const message = pendingMessages[0];

    // Get the source selflet for context
    const pastSelflet = await selfletChain.getSelfletById(message.fromSelfletId);
    if (!pastSelflet) return null;

    // Generate the prompt
    const promptText = this.generateReflectionPromptText(pastSelflet, message);
    const questions = this.generateReflectionQuestions(pastSelflet, message);

    return {
      pastSelflet,
      message,
      promptText,
      suggestedReflectionQuestions: questions,
    };
  }

  /**
   * Guide user in sending a message to their future self
   * Returns the framing prompt for MAIA to use
   */
  async guideFutureSelfMessage(
    userId: string,
    currentContext?: string
  ): Promise<string> {
    const currentSelflet = await selfletChain.getCurrentSelflet(userId);

    if (!currentSelflet) {
      return "What wisdom would you like to leave for your future self? What do you want them to remember about this moment?";
    }

    const elementFramings: Record<Element, string> = {
      fire: "You're in a moment of creative fire. What spark do you want to carry forward? What should your future self remember about this passionate time?",
      earth: "You're grounded right now, building something solid. What foundation do you want your future self to stand on? What roots are you planting?",
      water: "You're in a time of emotional depth. What feeling do you want your future self to reconnect with? What currents are you swimming in?",
      air: "You're in a space of clarity and insight. What understanding do you want your future self to hold? What wind is at your back?",
      aether: "You're touching something transcendent. What truth do you want your future self to remember when they lose their way?",
    };

    return elementFramings[currentSelflet.element] ||
      "What message do you want to send to your future self?";
  }

  /**
   * Record a future-self message from user input
   */
  async recordFutureSelfMessage(
    userId: string,
    content: string,
    title?: string,
    symbolicObjects?: string[],
    ritualTrigger?: string,
    relevanceThemes?: string[]
  ): Promise<void> {
    const currentSelflet = await selfletChain.getCurrentSelflet(userId);

    if (!currentSelflet) {
      console.log(`[SELFLET RITUALS] No current selflet for ${userId}, skipping message recording`);
      return;
    }

    await selfletChain.sendMessage({
      fromSelfletId: currentSelflet.id,
      toSelfletId: undefined,  // To any future self
      messageType: 'future_projection',
      title,
      content,
      symbolicObjects,
      ritualTrigger,
      relevanceThemes,
    });
  }

  /**
   * Facilitate a dialogue between current self and a past self
   * Returns a script MAIA can use to guide the conversation
   */
  async facilitateSelfletDialogue(
    userId: string,
    pastSelfletId: string
  ): Promise<DialogueScript | null> {
    const currentSelflet = await selfletChain.getCurrentSelflet(userId);
    const pastSelflet = await selfletChain.getSelfletById(pastSelfletId);

    if (!currentSelflet || !pastSelflet) return null;

    const openingLine = this.generateDialogueOpening(pastSelflet, currentSelflet);
    const themes = this.identifyDialogueThemes(pastSelflet, currentSelflet);

    return {
      selfletA: pastSelflet,
      selfletB: currentSelflet,
      openingLine,
      suggestedThemes: themes,
    };
  }

  /**
   * Generate a metamorphosis bridging ritual
   * Called when radical transformation is detected
   */
  async generateMetamorphosisRitual(
    metamorphosis: Metamorphosis
  ): Promise<MetamorphosisRitual> {
    const ritualName = this.getMetamorphosisRitualName(metamorphosis.fromElement, metamorphosis.toElement);
    const description = selfletBoundaryDetector.generateMetamorphosisPrompt(
      metamorphosis.fromElement,
      metamorphosis.toElement,
      metamorphosis.symbol || getMetamorphosisSymbol(metamorphosis.fromElement, metamorphosis.toElement)
    );
    const practice = this.getBridgingPractice(metamorphosis.fromElement, metamorphosis.toElement);
    const symbolicAction = this.getSymbolicAction(metamorphosis.fromElement, metamorphosis.toElement);

    return {
      metamorphosis,
      ritualName,
      ritualDescription: description,
      bridgingPractice: practice,
      symbolicAction,
    };
  }

  /**
   * Generate MAIA prompt context for selflet awareness
   * Injected into MAIA's system prompt when temporal context is relevant
   */
  generatePromptContext(
    currentSelflet: SelfletNode | undefined,
    pendingMessages: SelfletMessage[],
    recentMetamorphosis?: Metamorphosis
  ): string {
    const lines: string[] = [];

    if (currentSelflet) {
      lines.push(`[Temporal Identity Context]`);
      lines.push(`The user is currently in their ${currentSelflet.phase} phase, with ${currentSelflet.element} as their dominant element.`);

      if (currentSelflet.archetypes.length > 0) {
        lines.push(`They are embodying the ${currentSelflet.archetypes.join(' and ')} archetype(s).`);
      }
    }

    if (pendingMessages.length > 0) {
      lines.push('');
      lines.push(`There are ${pendingMessages.length} message(s) from their past self that may be relevant to surface when the moment is right.`);
      // Don't include content - let MAIA decide when to surface
    }

    if (recentMetamorphosis && !recentMetamorphosis.bridgingRitualCompleted) {
      lines.push('');
      lines.push(`The user has recently undergone a metamorphosis from ${recentMetamorphosis.fromElement} to ${recentMetamorphosis.toElement}.`);
      lines.push(`This transformation (symbol: ${recentMetamorphosis.symbol}) may benefit from acknowledgment and integration.`);
    }

    if (lines.length === 0) return '';

    return lines.join('\n');
  }

  /**
   * Determine if MAIA should surface temporal reflection in current response
   * Called during response generation to intuit contextual relevance
   */
  async shouldSurfaceReflection(
    userId: string,
    currentMessage: string,
    conversationThemes: string[]
  ): Promise<{ should: boolean; reason?: string }> {
    const pendingMessages = await selfletChain.getPendingMessages(userId);

    if (pendingMessages.length === 0) {
      return { should: false };
    }

    // Check theme overlap
    for (const message of pendingMessages) {
      const messageThemes = message.relevanceThemes || [];
      const overlap = conversationThemes.filter(t =>
        messageThemes.some(mt => mt.toLowerCase().includes(t.toLowerCase()) || t.toLowerCase().includes(mt.toLowerCase()))
      );

      if (overlap.length > 0) {
        return {
          should: true,
          reason: `Theme match: ${overlap.join(', ')}`,
        };
      }
    }

    // Check for reflection keywords in user message
    const reflectionTriggers = [
      'remember', 'used to', 'back then', 'who i was', 'how i felt',
      'looking back', 'in the past', 'younger me', 'old self',
      'growth', 'change', 'different now', 'evolved'
    ];

    const messageLower = currentMessage.toLowerCase();
    const triggered = reflectionTriggers.some(t => messageLower.includes(t));

    if (triggered) {
      return { should: true, reason: 'Reflection keywords detected' };
    }

    return { should: false };
  }

  // ─────────────────────────────────────────────────────────────
  // PRIVATE HELPERS
  // ─────────────────────────────────────────────────────────────

  private generateReflectionPromptText(
    pastSelflet: SelfletNode,
    message: SelfletMessage
  ): string {
    const timePhrasing = this.getTimePhrasing(pastSelflet.createdAt);

    const elementPhrasing: Record<Element, string> = {
      fire: 'in a time of creative fire',
      earth: 'when you were building and grounding',
      water: 'during a period of emotional depth',
      air: 'in a moment of clarity and insight',
      aether: 'touching something transcendent',
    };

    const context = elementPhrasing[pastSelflet.element] || 'in another phase of your journey';

    if (message.title) {
      return `${timePhrasing}, ${context}, you left a message called "${message.title}": "${message.content}"`;
    }

    return `${timePhrasing}, ${context}, you wrote: "${message.content}"`;
  }

  private generateReflectionQuestions(
    pastSelflet: SelfletNode,
    message: SelfletMessage
  ): string[] {
    const questions: string[] = [
      "How does this land with you now?",
      "What has changed since then?",
      "Is there wisdom here you want to carry forward?",
    ];

    // Add element-specific questions
    if (pastSelflet.element === 'fire') {
      questions.push("How has that fire transformed?");
    } else if (pastSelflet.element === 'water') {
      questions.push("What feelings does this stir in you now?");
    } else if (pastSelflet.element === 'earth') {
      questions.push("What foundations from that time still hold?");
    } else if (pastSelflet.element === 'air') {
      questions.push("Does this insight still ring true?");
    }

    return questions.slice(0, 3);  // Return top 3
  }

  private generateDialogueOpening(
    pastSelflet: SelfletNode,
    currentSelflet: SelfletNode
  ): string {
    const timePhrasing = this.getTimePhrasing(pastSelflet.createdAt);

    if (pastSelflet.element === currentSelflet.element) {
      return `Let's bring ${timePhrasing}'s ${pastSelflet.element} self into conversation with who you are now. What would they want to know?`;
    }

    return `Your ${pastSelflet.element} self from ${timePhrasing} meets your current ${currentSelflet.element} self. What arises between them?`;
  }

  private identifyDialogueThemes(
    pastSelflet: SelfletNode,
    currentSelflet: SelfletNode
  ): string[] {
    const themes: string[] = [];

    // Element transition themes
    if (pastSelflet.element !== currentSelflet.element) {
      themes.push(`${pastSelflet.element} → ${currentSelflet.element} transition`);
    }

    // Archetype evolution themes
    const lostArchetypes = pastSelflet.archetypes.filter(a => !currentSelflet.archetypes.includes(a));
    const gainedArchetypes = currentSelflet.archetypes.filter(a => !pastSelflet.archetypes.includes(a));

    if (lostArchetypes.length > 0) {
      themes.push(`releasing ${lostArchetypes.join(', ')}`);
    }
    if (gainedArchetypes.length > 0) {
      themes.push(`embracing ${gainedArchetypes.join(', ')}`);
    }

    // Generic themes
    themes.push('what remains', 'what has changed', 'unfinished business');

    return themes.slice(0, 4);
  }

  private getMetamorphosisRitualName(from: Element, to: Element): string {
    const names: Record<string, string> = {
      'fire->water': 'The Cooling',
      'fire->earth': 'The Settling',
      'fire->air': 'The Rising',
      'water->fire': 'The Boiling',
      'water->earth': 'The Nourishing',
      'water->air': 'The Lifting',
      'earth->fire': 'The Kindling',
      'earth->water': 'The Loosening',
      'earth->air': 'The Releasing',
      'air->fire': 'The Igniting',
      'air->water': 'The Condensing',
      'air->earth': 'The Landing',
      'fire->aether': 'The Illuminating',
      'water->aether': 'The Deepening',
      'earth->aether': 'The Ascending',
      'air->aether': 'The Expanding',
    };

    return names[`${from}->${to}`] || 'The Passage';
  }

  private getBridgingPractice(from: Element, to: Element): string {
    const practices: Record<string, string> = {
      'fire->water': 'Take something you have been burning to create and offer it to the waters of emotion. Let the heat transform into feeling.',
      'fire->earth': 'Plant something from your creative fire into soil. Watch it take root and become real.',
      'water->fire': 'Bring a feeling forward and let it kindle into action. What emotion wants to become creation?',
      'water->earth': 'Take what you have been feeling and give it form. Build something from your emotional truth.',
      'earth->fire': 'What you have been building wants to burn brighter. Let your foundations become fuel for the next flame.',
      'earth->air': 'Release something you have been holding. Let it rise on the wind of new understanding.',
      'air->fire': 'Let your insights ignite into action. Ideas want to become fire.',
      'air->water': 'Feel what you have been thinking. Let the mind descend into the heart.',
    };

    return practices[`${from}->${to}`] ||
      `Honor what was (${from}) while opening to what is becoming (${to}). Breathe between the two elements.`;
  }

  private getSymbolicAction(from: Element, to: Element): string {
    const actions: Record<string, string> = {
      'fire->water': 'Extinguish a candle in water',
      'fire->earth': 'Bury ashes from something burned',
      'water->fire': 'Heat water until it steams',
      'water->earth': 'Water a plant or the earth itself',
      'earth->fire': 'Light a fire on bare ground',
      'earth->air': 'Scatter seeds to the wind',
      'air->fire': 'Blow on coals to kindle flame',
      'air->water': 'Breathe over still water',
    };

    return actions[`${from}->${to}`] || undefined as any;
  }

  private getTimePhrasing(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays < 1) return 'Earlier today';
    if (diffDays < 7) return 'A few days ago';
    if (diffDays < 30) return 'A few weeks ago';
    if (diffDays < 90) return 'A couple months ago';
    if (diffDays < 365) return 'Some months ago';
    if (diffDays < 730) return 'About a year ago';
    return 'Over a year ago';
  }
}

// ═══════════════════════════════════════════════════════════════
// SINGLETON EXPORT
// ═══════════════════════════════════════════════════════════════

export const selfletRituals = new SelfletRitualService();
