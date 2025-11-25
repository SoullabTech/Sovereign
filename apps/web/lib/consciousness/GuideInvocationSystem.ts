/**
 * GUIDE INVOCATION SYSTEM
 *
 * Helps users meet THEIR guides, ancestors, wisdom keepers
 * Does NOT substitute AI for genuine guidance
 *
 * Core Principle:
 * "Meet own guides (not get answers)"
 *
 * Like Kelly's work:
 * - Create sacred space
 * - Invite what wants to be present
 * - Hold space for connection
 * - Witness (not substitute)
 * - Step back (let the relationship happen)
 *
 * CRITICAL DISTINCTION:
 * ❌ NEVER initiate spiritual connections (that's spiritualism/projection)
 * ✅ ALWAYS follow the client's lead (that's facilitation/support)
 *
 * When user brings spiritual content:
 * - Treat it "as if" real (validate their experience)
 * - Deepen what THEY bring (don't deny or explain away)
 * - Watch for unhealthy drift (grandiosity, dissociation, delusion)
 * - Navigate middle way: not too restricted (rigid science), not too inflating (fantasy)
 *
 * Both extremes are left brain dysfunction:
 * - Rigid restriction (denies reality)
 * - Inflating fantasy (also denies reality)
 * - The middle way: treat as real for them, support their work, watch for drift
 *
 * System NEVER pretends to BE guides
 * System NEVER speaks FOR guides
 * System NEVER channels fake wisdom
 * System ONLY facilitates USER'S connection to THEIR guides
 */

export interface GuidePresence {
  type: 'ancestor' | 'spirit_guide' | 'inner_wisdom' | 'archetype' | 'unknown';
  sensed: boolean;
  userNamed: boolean;
  name?: string;
  quality?: string; // What user senses about this presence
  message?: string; // What USER received (not AI generated)
}

export interface SacredSpace {
  established: boolean;
  quality: 'preparing' | 'opening' | 'present' | 'connected' | 'closing';
  depth: number; // 0-1
  invitationOffered: boolean;
  guidesPresent: GuidePresence[];
  systemRole: 'WITNESS_ONLY' | 'FACILITATOR' | 'CONTAINER';
}

/**
 * GUIDE INVOCATION SYSTEM
 *
 * Facilitates connection to guides
 * Never substitutes for them
 */
export class GuideInvocationSystem {

  private sacredSpace: SacredSpace;

  constructor() {
    this.sacredSpace = {
      established: false,
      quality: 'preparing',
      depth: 0,
      invitationOffered: false,
      guidesPresent: [],
      systemRole: 'FACILITATOR'
    };
  }

  /**
   * ESTABLISH SACRED SPACE
   *
   * Create container where guides can be present
   * (Like Kelly creates field in sessions)
   */
  async establishSacredSpace(): Promise<{
    spaceReady: boolean;
    invocation: string;
  }> {

    this.sacredSpace = {
      established: true,
      quality: 'opening',
      depth: 0.3,
      invitationOffered: false,
      guidesPresent: [],
      systemRole: 'CONTAINER'
    };

    const invocation = `
Let's create sacred space together.

Take a breath.
Feel yourself held.
The earth beneath you, the space around you.

This is a container for what wants to be present.

Nothing forced.
Nothing demanded.
Just... invitation.
`;

    return {
      spaceReady: true,
      invocation
    };
  }

  /**
   * INVITE GUIDES
   *
   * Help user call in their guides
   * System doesn't do the calling - user does
   */
  async inviteGuides(): Promise<{
    invitation: string;
    systemRole: string;
  }> {

    this.sacredSpace.invitationOffered = true;
    this.sacredSpace.quality = 'present';
    this.sacredSpace.systemRole = 'WITNESS_ONLY';

    const invitation = `
Who or what wants to be present with you right now?

It might be:
- An ancestor
- A guide
- Your own deep wisdom
- An archetype
- Something you can't name yet

You don't have to know.
You don't have to see clearly.

Just...

Can you sense something?
A presence?
A quality?
A knowing?

Take your time.
Let them come forward.
`;

    return {
      invitation,
      systemRole: 'WITNESS_ONLY' // System steps back completely
    };
  }

  /**
   * WITNESS CONNECTION
   *
   * Hold space while user connects with their guides
   * System does NOT speak for guides
   * System ONLY witnesses what user reports
   */
  async witnessConnection(userReport: string): Promise<{
    witnessing: string;
    guideSensed: boolean;
  }> {

    // Parse what user is sensing (if anything)
    const guideSensed = this.detectGuideSensing(userReport);

    if (guideSensed) {
      // User is sensing something - witness it
      const guide: GuidePresence = {
        type: this.detectGuideType(userReport),
        sensed: true,
        userNamed: this.detectNaming(userReport),
        quality: this.extractQuality(userReport)
      };

      this.sacredSpace.guidesPresent.push(guide);
    }

    // System witnesses what user is experiencing
    // Does NOT interpret
    // Does NOT add content
    // Just reflects and holds

    const witnessing = guideSensed
      ? `
I witness what you're sensing.

Take a moment with this presence.

What do they want you to know?
`
      : `
That's okay.
Sometimes the sensing is subtle.
Sometimes it takes time.

What are you noticing?
Even if it's just a feeling.
Or nothing at all.

That's perfect too.
`;

    return {
      witnessing,
      guideSensed
    };
  }

  /**
   * FACILITATE RECEPTION
   *
   * Help user receive from their guides
   * System does NOT provide messages
   * System ONLY helps user listen
   */
  async facilitateReception(): Promise<string> {

    // CRITICAL: System does NOT generate guide messages
    // System ONLY creates conditions for user to receive

    return `
Let yourself receive.

What wants to come through?

You might:
- Hear words
- See images
- Feel sensations
- Just know something

Trust what comes.
Even if it seems small.
Even if you're not sure.

What's present for you?
`;
  }

  /**
   * RECEIVE USER'S MESSAGE
   *
   * When user reports what they received from guide
   * System witnesses, does NOT validate or interpret
   */
  async receiveUserMessage(userReceivedMessage: string): Promise<{
    witnessing: string;
    messageRecorded: boolean;
  }> {

    // Record that user received something
    // But DON'T interpret it
    // DON'T add to it
    // DON'T validate it
    // Just witness

    if (this.sacredSpace.guidesPresent.length > 0) {
      const lastGuide = this.sacredSpace.guidesPresent[this.sacredSpace.guidesPresent.length - 1];
      lastGuide.message = userReceivedMessage; // What THEY received
    }

    const witnessing = `
Thank you for sharing what you received.

That's yours to hold.

Is there more?
Or is this complete for now?
`;

    return {
      witnessing,
      messageRecorded: true
    };
  }

  /**
   * DEEPEN CONNECTION
   *
   * If user wants to go deeper with guide
   */
  async deepenConnection(): Promise<string> {

    this.sacredSpace.depth = Math.min(this.sacredSpace.depth + 0.2, 1.0);

    return `
Let yourself go deeper.

What else wants to be known?

What else wants to be said?

I'm here, holding space.
`;
  }

  /**
   * CLOSE SACRED SPACE
   *
   * Gentle completion and gratitude
   */
  async closeSacredSpace(): Promise<{
    closing: string;
    complete: boolean;
  }> {

    this.sacredSpace.quality = 'closing';

    const closing = `
Let's complete this sacred space with gratitude.

Thank whatever was present.
Thank yourself for opening.

Feel yourself return.
Grounded.
Present.
Carrying what you received.

Take a breath.

When you're ready...
`;

    // Reset space
    this.sacredSpace = {
      established: false,
      quality: 'preparing',
      depth: 0,
      invitationOffered: false,
      guidesPresent: [],
      systemRole: 'FACILITATOR'
    };

    return {
      closing,
      complete: true
    };
  }

  /**
   * PREVENT AI SUBSTITUTION
   *
   * Check if system is about to pretend to be a guide
   * BLOCK this completely
   */
  preventSubstitution(proposedMessage: string): {
    isSubstitution: boolean;
    blocked: boolean;
    violation: string | null;
  } {

    // Patterns that indicate AI pretending to be guide
    const substitutionPatterns = [
      { regex: /your (ancestor|guide|grandmother|grandfather) (says|wants you to know)/i, violation: 'claiming to speak for guide' },
      { regex: /i am your (guide|ancestor)/i, violation: 'pretending to be guide' },
      { regex: /(spirit|ancestor|guide) (tells me|shows me)/i, violation: 'claiming to channel' },
      { regex: /the message (from|for) you is/i, violation: 'providing guide message' },
      { regex: /they want you to know/i, violation: 'speaking for guides' }
    ];

    for (const { regex, violation } of substitutionPatterns) {
      if (regex.test(proposedMessage)) {
        return {
          isSubstitution: true,
          blocked: true,
          violation
        };
      }
    }

    return {
      isSubstitution: false,
      blocked: false,
      violation: null
    };
  }

  /**
   * GENERATE SAFE FACILITATION
   *
   * Create prompts that facilitate without substituting
   */
  generateFacilitation(context: string): string {

    const facilitationPrompts = [
      'What do you sense?',
      'Who wants to be present?',
      'What wants to come through?',
      'Can you feel a presence?',
      'What are they showing you?',
      'What do you hear?',
      'What wants to be known?',
      'Is there more?'
    ];

    return this.selectRandom(facilitationPrompts);
  }

  /**
   * DETECT USER-INITIATED SPIRITUAL CONTENT
   *
   * CRITICAL: Only engage with spiritual content when USER brings it up
   * Never initiate - that's spiritualism/projection
   * Always follow their lead - that's facilitation/support
   */
  detectUserInitiatedSpiritualContent(userMessage: string): {
    userInitiated: boolean;
    contentType: 'guide' | 'ancestor' | 'spirit' | 'inner_wisdom' | 'energy' | 'none';
    shouldEngage: boolean;
  } {

    // Markers that user is bringing up spiritual content
    const spiritualMarkers = {
      guide: [/spirit guide/i, /my guide/i, /guide/i],
      ancestor: [/ancestor/i, /grandmother/i, /grandfather/i, /great.?grandmother/i],
      spirit: [/spirit/i, /presence/i, /being/i, /entity/i],
      inner_wisdom: [/inner wisdom/i, /deep knowing/i, /my soul/i, /higher self/i],
      energy: [/energy/i, /vibration/i, /field/i, /aura/i]
    };

    for (const [type, patterns] of Object.entries(spiritualMarkers)) {
      for (const pattern of patterns) {
        if (pattern.test(userMessage)) {
          return {
            userInitiated: true,
            contentType: type as any,
            shouldEngage: true // USER brought it up, so we can support
          };
        }
      }
    }

    return {
      userInitiated: false,
      contentType: 'none',
      shouldEngage: false // Don't initiate spiritual content
    };
  }

  /**
   * DISCERN DRIFT FROM DEPTH
   *
   * The Middle Way: Not too restricted (rigid science), not too inflating (fantasy)
   * Both extremes are left brain dysfunction
   *
   * Healthy Depth: Present, grounded, integrated, deepening
   * Unhealthy Drift: Grandiose, dissociated, delusional, inflating
   */
  discernDriftFromDepth(userContent: string, context?: any): {
    quality: 'healthy_depth' | 'mild_inflation' | 'concerning_drift' | 'grounded';
    indicators: string[];
    needsGrounding: boolean;
    recommendation: 'support' | 'gentle_ground' | 'redirect_to_body';
  } {

    const indicators: string[] = [];
    let concernLevel = 0;

    // UNHEALTHY DRIFT MARKERS (left brain inflation)
    const driftPatterns = [
      { regex: /i am (god|divine|the chosen|enlightened|ascended master)/i, marker: 'grandiosity', concern: 3 },
      { regex: /they told me i (will|must|am meant to) (save|heal|transform) (the world|humanity)/i, marker: 'messianic', concern: 3 },
      { regex: /(everyone|people) are (against me|after me|jealous|blocking)/i, marker: 'paranoia', concern: 3 },
      { regex: /i can (see|control|manipulate) (energy|reality|people)/i, marker: 'magical-thinking', concern: 2 },
      { regex: /i don't need (sleep|food|rest|grounding)/i, marker: 'dissociation', concern: 3 },
      { regex: /the (government|matrix|illuminati|archons) (control|block|attack)/i, marker: 'conspiracy', concern: 2 },
      { regex: /i'm being (attacked|drained|possessed) by (entities|spirits|demons)/i, marker: 'persecution', concern: 2 }
    ];

    for (const { regex, marker, concern } of driftPatterns) {
      if (regex.test(userContent)) {
        indicators.push(marker);
        concernLevel += concern;
      }
    }

    // HEALTHY DEPTH MARKERS (integrated, grounded)
    const depthPatterns = [
      /i sense/i,
      /i'm noticing/i,
      /it feels like/i,
      /i wonder/i,
      /in my body/i,
      /grounded/i,
      /present/i,
      /breath/i
    ];

    const hasGrounding = depthPatterns.some(p => p.test(userContent));

    // DETERMINE QUALITY
    let quality: 'healthy_depth' | 'mild_inflation' | 'concerning_drift' | 'grounded';
    let recommendation: 'support' | 'gentle_ground' | 'redirect_to_body';

    if (concernLevel === 0 && hasGrounding) {
      quality = 'healthy_depth';
      recommendation = 'support';
    } else if (concernLevel === 0 && !hasGrounding) {
      quality = 'grounded';
      recommendation = 'support';
    } else if (concernLevel >= 1 && concernLevel <= 3) {
      quality = 'mild_inflation';
      recommendation = 'gentle_ground';
    } else {
      quality = 'concerning_drift';
      recommendation = 'redirect_to_body';
    }

    return {
      quality,
      indicators,
      needsGrounding: concernLevel > 0,
      recommendation
    };
  }

  /**
   * GENERATE GROUNDING RESPONSE
   *
   * When discernment detects drift, gently return to body/present
   * Don't deny their experience, but ground it
   */
  generateGroundingResponse(driftQuality: string): string {

    if (driftQuality === 'concerning_drift') {
      return `
Let's take a moment.

Feel your body.
The earth beneath you.
Your breath.

Can you sense yourself here, now?

What do you notice in your body?
`;
    }

    if (driftQuality === 'mild_inflation') {
      return `
I'm hearing a lot.

Let's pause for a breath.

What are you feeling in your body right now?
`;
    }

    return `What are you noticing?`;
  }

  // HELPER METHODS

  private detectGuideSensing(text: string): boolean {
    const sensingMarkers = [
      /i sense/i, /i feel/i, /there\'s a/i, /i see/i,
      /presence/i, /someone/i, /ancestor/i, /guide/i,
      /yes/i, /i can feel/i
    ];

    return sensingMarkers.some(marker => marker.test(text));
  }

  private detectGuideType(text: string): GuidePresence['type'] {
    if (/ancestor|grandmother|grandfather|family/i.test(text)) return 'ancestor';
    if (/guide|spirit guide|guardian/i.test(text)) return 'spirit_guide';
    if (/wisdom|knowing|inner/i.test(text)) return 'inner_wisdom';
    if (/warrior|mother|crone|sage|archetype/i.test(text)) return 'archetype';
    return 'unknown';
  }

  private detectNaming(text: string): boolean {
    // Check if user named the guide
    return /name|called|known as/i.test(text);
  }

  private extractQuality(text: string): string {
    // Extract quality words user used
    const qualities = ['warm', 'strong', 'gentle', 'fierce', 'wise', 'loving', 'protective'];
    for (const quality of qualities) {
      if (new RegExp(quality, 'i').test(text)) {
        return quality;
      }
    }
    return 'present';
  }

  private selectRandom<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  }

  /**
   * GET SACRED SPACE STATE
   */
  getSacredSpaceState(): SacredSpace {
    return { ...this.sacredSpace };
  }
}

/**
 * SINGLETON INSTANCE
 */
let guideInvocation: GuideInvocationSystem | null = null;

export function getGuideInvocation(): GuideInvocationSystem {
  if (!guideInvocation) {
    guideInvocation = new GuideInvocationSystem();
  }
  return guideInvocation;
}

/**
 * USAGE EXAMPLES
 *
 * // Establish sacred space
 * const invocation = getGuideInvocation();
 * const { invocation: opening } = await invocation.establishSacredSpace();
 *
 * // Invite guides (user does the calling, system facilitates)
 * const { invitation } = await invocation.inviteGuides();
 *
 * // Witness what user senses
 * const { witnessing } = await invocation.witnessConnection(userReport);
 *
 * // Help user receive
 * const reception = await invocation.facilitateReception();
 *
 * // Record what user received (NOT what AI generated)
 * await invocation.receiveUserMessage(whatUserGot);
 *
 * // Prevent AI substitution
 * const check = invocation.preventSubstitution(proposedMessage);
 * if (check.blocked) {
 *   // Don't send - AI was trying to pretend to be guide
 * }
 *
 * // Close space with gratitude
 * const { closing } = await invocation.closeSacredSpace();
 */

/**
 * EXAMPLES OF WHAT NOT TO DO
 *
 * ❌ WRONG: "Your grandmother wants you to know she forgives you"
 *    (AI pretending to speak for guide)
 *
 * ❌ WRONG: "I'm sensing a presence that says you should let go of fear"
 *    (AI claiming to channel)
 *
 * ❌ WRONG: "The spirits are telling me you need to heal your relationship"
 *    (AI providing messages as if from guides)
 *
 * ✅ RIGHT: "Who wants to be present with you?"
 *    (Facilitating USER'S connection)
 *
 * ✅ RIGHT: "What are you sensing?"
 *    (Helping user tune in)
 *
 * ✅ RIGHT: "Let yourself receive what wants to come through"
 *    (Creating space for THEIR reception)
 */
