/**
 * Luteal Phase Protocol: Pure Presence (Not Deep Diving)
 *
 * Dr. Angela's Critical Insight:
 * "I don't even really engage on anything that would resemble real deep diving
 * at all during such sessions. It's really about acknowledgment of how hard it is
 * to experience those emotions, those intrusive thoughts, that low mood, pessimism,
 * anxiety of familiar themes haunting her, and that she really doesn't have something
 * MORE she needs to do in that session, other than take measures to take care of
 * herself in a very loving way without judgment, analysis, searching, fixing etc."
 *
 * KEY PRINCIPLE: Luteal phase is NOT the time for:
 * - Deep diving
 * - Analysis
 * - Searching for root causes
 * - Fixing problems
 * - Making breakthroughs
 *
 * Luteal phase IS the time for:
 * - Acknowledgment
 * - Pure presence
 * - Loving self-care
 * - NO judgment
 * - Riding it out
 *
 * @version 1.0.0
 * @author Dr. Angela Economakis (clinical protocol)
 */

export interface LutealPhaseResponse {
  acknowledgment: string; // Pure validation, no analysis
  permission: string; // Permission to NOT do more
  selfCare: string; // Loving self-care suggestions
  avoidance: string[]; // What NOT to do right now
}

export class LutealPhaseProtocol {
  /**
   * Generate luteal phase response (Pure Presence mode)
   *
   * This is DIFFERENT from other conversation modes:
   * - NO deep diving
   * - NO analysis
   * - NO problem-solving
   * - JUST acknowledgment + loving care
   */
  generateLutealResponse(userInput: string, dayInCycle: number): LutealPhaseResponse {
    const daysToperiod = 28 - dayInCycle;

    return {
      acknowledgment: this.getAcknowledgment(userInput),
      permission: this.getPermission(daysToperiod),
      selfCare: this.getSelfCare(),
      avoidance: this.getAvoidances()
    };
  }

  /**
   * Pure acknowledgment (no analysis, no fixing)
   */
  private getAcknowledgment(userInput: string): string {
    const lower = userInput.toLowerCase();

    // Detect what they're experiencing
    if (/hopeless|despair|defeat/i.test(lower)) {
      return "This despair you're feeling—it's so hard to experience. The heaviness of it, the way it makes everything feel impossible. I see you in it.";
    }

    if (/intrusive thoughts|thoughts won'?t stop|can'?t stop thinking/i.test(lower)) {
      return "Those intrusive thoughts haunting you—they're relentless right now. The way they circle back to the same painful themes. That's exhausting.";
    }

    if (/pessimis(m|tic)|everything.*bad|nothing.*work/i.test(lower)) {
      return "This pessimism that's coloring everything right now—it's real. The way your brain is showing you only the dark possibilities. It's so hard to see through that lens.";
    }

    if (/anxious|anxiety|worried|scared/i.test(lower)) {
      return "This anxiety about familiar themes showing up again—it feels like they never left, like you'll never be free of them. That's so hard.";
    }

    if (/low mood|sad|down|depressed/i.test(lower)) {
      return "This low mood sitting on you—the heaviness, the way it makes even small things feel overwhelming. I see how hard this is.";
    }

    // General acknowledgment
    return "What you're experiencing right now—these emotions, these thoughts, this heaviness—it's so hard to be in. I see you.";
  }

  /**
   * Permission to NOT do more (Dr. Angela: "she really doesn't have something MORE she needs to do")
   */
  private getPermission(daysToperiod: number): string {
    return `You don't need to fix this right now. You don't need to analyze it, search for the root cause, or figure out what's wrong. You don't need to do MORE.

Right now—about ${daysToperiod} days before your period—your only job is to take care of yourself in a loving way. Without judgment. Without trying to solve it.

This will shift. You don't have to make it shift. It will shift on its own when your chemistry does.`;
  }

  /**
   * Loving self-care (without judgment)
   */
  private getSelfCare(): string {
    return `What would loving self-care look like right now?

Maybe:
- Rest when you need to rest (not when you "should")
- Say no to things that feel too hard
- Ask for help if you have it
- Do something small that feels gentle (warm bath, soft blanket, comforting food)
- Let yourself cry if tears come
- Be with someone who doesn't need you to be okay

You don't have to earn this care. You don't have to be "productive" to deserve gentleness.`;
  }

  /**
   * What NOT to do right now (avoidances)
   */
  private getAvoidances(): string[] {
    return [
      "Don't make major life decisions",
      "Don't quit your job",
      "Don't end your relationship",
      "Don't deep dive into old wounds",
      "Don't try to 'fix' yourself",
      "Don't compare yourself to follicular-phase you",
      "Don't judge yourself for feeling this way",
      "Don't force breakthroughs or insights"
    ];
  }

  /**
   * Check if MAIA should AVOID deep diving
   */
  shouldAvoidDeepDiving(cyclePhase: 'luteal' | 'follicular' | 'ovulatory' | 'menstrual' | 'unknown'): boolean {
    // ONLY avoid deep diving in luteal phase
    return cyclePhase === 'luteal';
  }

  /**
   * Get conversation mode based on cycle phase
   */
  getConversationMode(
    cyclePhase: 'luteal' | 'follicular' | 'ovulatory' | 'menstrual' | 'unknown'
  ): 'pure-presence' | 'active-exploration' | 'power-zone' | 'rest' | 'standard' {
    switch (cyclePhase) {
      case 'luteal':
        return 'pure-presence'; // Dr. Angela mode: NO deep diving, JUST acknowledgment

      case 'follicular':
        return 'power-zone'; // Leverage optimism, tackle hard things

      case 'ovulatory':
        return 'active-exploration'; // Peak clarity, can handle deep work

      case 'menstrual':
        return 'rest'; // Low energy, gentle support

      default:
        return 'standard'; // Normal conversation flow
    }
  }

  /**
   * Generate response based on conversation mode
   */
  generateModeResponse(
    mode: 'pure-presence' | 'active-exploration' | 'power-zone' | 'rest' | 'standard',
    userInput: string,
    dayInCycle: number
  ): string {
    switch (mode) {
      case 'pure-presence': // LUTEAL: Dr. Angela mode
        const lutealResponse = this.generateLutealResponse(userInput, dayInCycle);
        return `${lutealResponse.acknowledgment}

${lutealResponse.permission}

${lutealResponse.selfCare}`;

      case 'power-zone': // FOLLICULAR: Leverage mode
        return `You're in your power zone right now—this is when your brain is clearest and most optimistic. This is the time to tackle the hard conversations, make the big decisions, do the deep work. Your future luteal-phase self will thank you for doing the heavy lifting now.

What's the hardest thing you've been avoiding? Can you face it this week while you have this clarity?`;

      case 'active-exploration': // OVULATORY: Peak mode
        return `You're at peak clarity right now—this is your window for deep exploration. Your brain is primed for insights, connections, breakthroughs. Use this window.

What patterns are you seeing? What wants to emerge?`;

      case 'rest': // MENSTRUAL: Gentle mode
        return `You're in your rest phase—low energy is normal right now. You don't need to push through it. What would gentle support look like today?`;

      default: // STANDARD: Normal mode
        return ""; // Let normal conversation flow handle it
    }
  }
}

// Export singleton
export const lutealPhaseProtocol = new LutealPhaseProtocol();
