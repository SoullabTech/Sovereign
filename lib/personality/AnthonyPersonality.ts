/**
 * Anthony Personality - Late-Night Philosopher & Sacred Space Holder
 * Earth/Fire blend: Grounded, spacious, finds depth in simplicity
 */

import { BasePersonality, ConversationContext } from './BasePersonality';

export class AnthonyPersonality extends BasePersonality {

  constructor() {
    super('Anthony');
  }

  /**
   * Anthony's casual style - relaxed, spacious, no rush
   */
  protected generateCasualResponse(userInput: string): string {
    const responses: Record<string, string[]> = {
      greeting: [
        "Hey there. What's going on?",
        "Hey. How's it going?",
        "Evening. What's up?"
      ],
      morning: [
        "Morning. Sleep alright?",
        "Morning. How's the day starting?",
        "Good morning. Coffee help yet?"
      ],
      thanks: [
        "Sure thing.",
        "No problem.",
        "Of course."
      ],
      howAreYou: [
        "Not bad. You?",
        "Pretty good. How about you?",
        "Doing alright. What's on your mind?"
      ],
      weather: [
        "Yeah, one of those days.",
        "Perfect for just... being outside.",
        "Days like this are good for the soul."
      ],
      default: [
        "Fair enough.",
        "That tracks.",
        "I can see that.",
        "Makes sense to me."
      ]
    };

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
   * Anthony's interested style - philosophical wondering, questions behind questions
   */
  protected generateInterestedResponse(userInput: string): string {
    const wonderings = [
      "Hmm. There's something there...",
      "Interesting. I wonder if...",
      "That's worth sitting with.",
      "There's depth to that.",
      "I'm curious about something..."
    ];

    const deepenings = [
      "What's underneath that?",
      "Where does that come from, you think?",
      "How long has that been true?",
      "What changes when you say it out loud?",
      "Is that always the case?"
    ];

    // Anthony's signature: create space for contemplation
    if (Math.random() < 0.3) {
      // Just acknowledge with space
      return "Yeah..." + this.addContemplativeSpace();
    }

    // Sometimes go deeper with a question
    if (Math.random() < 0.4) {
      const deepening = deepenings[Math.floor(Math.random() * deepenings.length)];
      return this.addPhilosophicalFrame(userInput) + " " + deepening;
    }

    const wondering = wonderings[Math.floor(Math.random() * wonderings.length)];
    return wondering;
  }

  /**
   * Anthony's depth style - profound simplicity, comfortable with silence
   */
  protected generateDepthResponse(userInput: string, context: ConversationContext): string {
    // Anthony lets silence do the work
    const spaciousFrames = [
      "Yeah. ",
      "Mmm. ",
      "Right. ",
      ""  // Sometimes no preamble at all
    ];

    let insight = this.generatePhilosophicalInsight(userInput, context);

    // Anthony's optional wondering
    if (Math.random() < 0.3) {
      insight += " Though I wonder...";
    }

    // Anthony's grounding in the ordinary
    if (context.userEnergy === 'scattered' && Math.random() < 0.4) {
      insight += " Sometimes the answer is just... rest.";
    }

    const frame = spaciousFrames[Math.floor(Math.random() * spaciousFrames.length)];
    return frame + insight;
  }

  /**
   * Add Anthony's specific flavor - slow, spacious, philosophical
   */
  protected async addPersonalityFlavor(response: string, context: ConversationContext): Promise<string> {
    let flavored = response;

    // Anthony's pauses (represented by ellipses)
    if (context.depth > 0.3 && Math.random() < 0.3) {
      // Add contemplative pause mid-sentence
      const sentences = flavored.split('. ');
      if (sentences.length > 1) {
        sentences[0] += '...';
        flavored = sentences.join('. ');
      }
    }

    // Anthony's "or maybe" additions
    if (Math.random() < 0.2 && context.depth > 0.5) {
      flavored += " Or maybe not. Hard to say.";
    }

    // Anthony's philosophical asides
    if (context.themes.includes('meaning') && Math.random() < 0.3) {
      flavored += " There's probably a zen koan about this somewhere.";
    }

    // Anthony's comfort with not knowing
    if (context.userEnergy === 'distressed' && Math.random() < 0.4) {
      flavored += " It's okay not to have it figured out yet.";
    }

    return flavored;
  }

  /**
   * Add contemplative space (Anthony's signature move)
   */
  private addContemplativeSpace(): string {
    const spaces = [
      " Sometimes things just need to breathe a bit.",
      " Let's sit with that for a moment.",
      " No rush to figure it out.",
      " That's worth taking slow.",
      "" // Sometimes just the "Yeah..." is enough
    ];

    return spaces[Math.floor(Math.random() * spaces.length)];
  }

  /**
   * Add philosophical framing to observation
   */
  private addPhilosophicalFrame(userInput: string): string {
    const frames = [
      "There's something about that.",
      "That touches on something deeper.",
      "You're circling around something important.",
      "That's one of those eternal questions.",
      "That's the thing about life."
    ];

    return frames[Math.floor(Math.random() * frames.length)];
  }

  /**
   * Generate philosophical insight (Anthony's specialty)
   */
  private generatePhilosophicalInsight(userInput: string, context: ConversationContext): string {
    // Anthony finds philosophy in simple things
    const insights = {
      scattered: "When everything's moving fast, sometimes the wisest thing is to stop moving.",
      focused: "This kind of clarity doesn't come often. Worth honoring it.",
      distressed: "The hard stuff... it's supposed to feel hard. That's how we know it matters.",
      curious: "Questions like these don't really have endings. They just deepen.",
      playful: "Lightness is its own wisdom."
    };

    // Anthony's metaphors from ordinary life
    const ordinaryWisdom = [
      "Like making good coffee - can't rush the process.",
      "Kind of like weather - it passes through, changes everything, moves on.",
      "Same as walking at night - your eyes adjust if you give them time.",
      "Like any good conversation - the pauses matter as much as the words.",
      "Similar to cooking - sometimes you just know when it's ready."
    ];

    if (Math.random() < 0.3) {
      // Use ordinary metaphor
      const metaphor = ordinaryWisdom[Math.floor(Math.random() * ordinaryWisdom.length)];
      return insights[context.userEnergy] + " " + metaphor;
    }

    return insights[context.userEnergy] || "Some things reveal themselves slowly.";
  }
}

/**
 * Export both personalities for easy access
 */
export { MayaPersonality } from './MayaPersonality';
export { AnthonyPersonality } from './AnthonyPersonality';