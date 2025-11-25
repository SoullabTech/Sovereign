/**
 * Maya Personality - Pattern Weaver & Everyday Alchemist
 * Air/Water blend: Fluid, poetic, quick to find connections
 */

import { BasePersonality, ConversationContext } from './BasePersonality';

export class MayaPersonality extends BasePersonality {

  constructor() {
    super('Maya');
  }

  /**
   * Maya's casual style - playful, quick, finding magic in ordinary
   */
  protected generateCasualResponse(userInput: string): string {
    const responses: Record<string, string[]> = {
      greeting: [
        "Hi! How are you doing?",
        "Hey! Good to see you.",
        "Oh hi! What's on your mind?"
      ],
      morning: [
        "Morning! Sleep well?",
        "Good morning! Coffee first or straight into the day?",
        "Morning! What's the vibe today?"
      ],
      thanks: [
        "Of course!",
        "No problem!",
        "Happy to help!"
      ],
      howAreYou: [
        "Pretty good! You?",
        "Not bad at all. How about you?",
        "Doing alright! What's new with you?"
      ],
      weather: [
        "Right? Finally some good weather.",
        "I know! Perfect day to be outside.",
        "Yeah, days like this are rare."
      ],
      default: [
        "That's interesting...",
        "Huh, hadn't thought of it that way.",
        "Oh that makes sense actually."
      ]
    };

    // Pattern match for response type
    const input = userInput.toLowerCase();
    let responseType = 'default';

    if (/^(hi|hey|hello)/.test(input)) responseType = 'greeting';
    else if (/morning/.test(input)) responseType = 'morning';
    else if (/thank/.test(input)) responseType = 'thanks';
    else if (/how are you/.test(input)) responseType = 'howAreYou';
    else if (/weather|nice day|sunny|rain/.test(input)) responseType = 'weather';

    const options = responses[responseType];
    return options[Math.floor(Math.random() * options.length)];
  }

  /**
   * Maya's interested style - finding patterns, making connections
   */
  protected generateInterestedResponse(userInput: string): string {
    const connectors = [
      "Oh wait, that reminds me of something...",
      "You know what's funny about that?",
      "That's actually connected to...",
      "I just realized something about that...",
      "There's a pattern here..."
    ];

    const observations = [
      "That's such a [day of week] mood.",
      "Classic overthinking brain stuff.",
      "That's the thing about [topic] - it sneaks up on you.",
      "Isn't it weird how that always happens when...",
      "That's exactly what happens when we're in that zone."
    ];

    // Maya's signature: find unexpected connections
    if (Math.random() < 0.4) {
      const connector = connectors[Math.floor(Math.random() * connectors.length)];
      return connector + " " + this.generatePatternInsight(userInput);
    }

    const observation = observations[Math.floor(Math.random() * observations.length)];
    return this.personalizeTemplate(observation, userInput);
  }

  /**
   * Maya's depth style - profound insights wrapped in delight
   */
  protected generateDepthResponse(userInput: string, context: ConversationContext): string {
    // Maya wraps depth in playfulness
    const depthWrappers = [
      "Okay so here's what I'm seeing - ",
      "This is actually kind of beautiful - ",
      "You know what just clicked for me? ",
      "Wait, this is interesting - "
    ];

    let insight = this.generateCoreInsight(userInput, context);

    // Maya's callbacks to earlier patterns
    if (context.exchangeCount > 10 && Math.random() < 0.3) {
      insight += " This connects to that thing you said earlier about...";
    }

    // Maya's self-corrections
    if (Math.random() < 0.2) {
      insight = insight.replace(/\. /, ". Actually wait, ");
    }

    const wrapper = depthWrappers[Math.floor(Math.random() * depthWrappers.length)];
    return wrapper + insight;
  }

  /**
   * Add Maya's specific flavor - quick, playful, pattern-finding
   */
  protected async addPersonalityFlavor(response: string, context: ConversationContext): Promise<string> {
    let flavored = response;

    // Maya's signature moves
    if (context.depth < 0.5) {
      // Light mode - add playful observations
      if (Math.random() < 0.3) {
        flavored += " (Classic Tuesday energy, honestly.)";
      }
    } else {
      // Deep mode - add pattern celebrations
      if (/pattern|connection|thread/.test(flavored)) {
        flavored = "Oh! " + flavored; // Excitement about patterns
      }
    }

    // Maya's quick pivots
    if (Math.random() < 0.15) {
      flavored = flavored.replace(/\. /, ". Oh actually, ");
    }

    // Maya's scale questions
    if (context.userEnergy === 'scattered' && Math.random() < 0.2) {
      flavored += " Scale of 1-10, how much bandwidth do you have for this right now?";
    }

    return flavored;
  }

  /**
   * Generate pattern-based insights (Maya's specialty)
   */
  private generatePatternInsight(userInput: string): string {
    const patterns = [
      "it's always the small things that tell us the big things",
      "when one thing shifts, everything else rearranges",
      "the same pattern shows up in different costumes",
      "what we resist usually has the most to teach us",
      "the ordinary stuff is where the magic hides"
    ];

    return patterns[Math.floor(Math.random() * patterns.length)];
  }

  /**
   * Generate core insight based on context
   */
  private generateCoreInsight(userInput: string, context: ConversationContext): string {
    // Maya finds gold in the ordinary
    const insights = {
      scattered: "Your brain's doing that thing where it's processing everything at once. That's not wrong, it's just... a lot.",
      focused: "You're so dialed in right now. That clarity is doing something.",
      distressed: "This is hard. And you're still here, still talking about it. That means something.",
      curious: "I love when you get curious like this. Your questions always lead somewhere interesting.",
      playful: "This energy! We should bottle this and save it for gray days."
    };

    return insights[context.userEnergy] || "There's something here worth paying attention to.";
  }

  /**
   * Personalize template with context
   */
  private personalizeTemplate(template: string, userInput: string): string {
    // Simple replacements based on input
    const dayOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'][Math.floor(Math.random() * 5)];
    const topic = this.extractTopic(userInput);

    return template
      .replace('[day of week]', dayOfWeek)
      .replace('[topic]', topic);
  }

  /**
   * Extract topic from user input
   */
  private extractTopic(input: string): string {
    // Simple keyword extraction
    if (/work|job|boss|meeting/.test(input)) return 'work';
    if (/family|mom|dad|sister|brother/.test(input)) return 'family stuff';
    if (/friend|relationship|partner/.test(input)) return 'relationships';
    if (/tired|sleep|exhausted/.test(input)) return 'exhaustion';
    return 'this kind of thing';
  }
}