import { progressiveRevelation, type ContentLevel } from './progressiveRevelation';
import { type RelationshipEssence, loadRelationshipEssence, getRelationshipAnamnesis } from '../consciousness/RelationshipAnamnesis';
import { PresenceGreeting } from '../maia/presence-greetings';

/**
 * Single source of truth for display name resolution
 * Never returns generic names like 'Friend' - uses actual name from localStorage
 */
export function resolveDisplayName(): string {
  if (typeof window === 'undefined') return 'Friend';

  // 🔍 DIAGNOSTIC: Log what we're reading from localStorage
  const preferredName = localStorage.getItem('explorerPreferredName');
  const explorerName = localStorage.getItem('explorerName');
  console.log('🔍 [resolveDisplayName] Reading from localStorage:', {
    explorerPreferredName: preferredName,
    explorerName: explorerName,
  });

  // Priority 1: Explicit preferred name
  if (preferredName && preferredName.trim() && preferredName.toLowerCase() !== 'friend') {
    console.log('🔍 [resolveDisplayName] Using explorerPreferredName:', preferredName);
    return preferredName.trim();
  }

  // Priority 2: Explorer name
  if (explorerName && explorerName.trim() && explorerName.toLowerCase() !== 'friend') {
    console.log('🔍 [resolveDisplayName] Using explorerName:', explorerName);
    return explorerName.trim();
  }

  // Priority 3: Parse from beta_user JSON
  try {
    const raw = localStorage.getItem('beta_user');
    if (raw) {
      const u = JSON.parse(raw);
      // Check preferredName, name, then username
      const candidates = [u.preferredName, u.name, u.displayName, u.username];
      for (const candidate of candidates) {
        if (candidate && typeof candidate === 'string') {
          const trimmed = candidate.trim();
          // Skip UUIDs and generic names
          const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(trimmed);
          const isGeneric = ['friend', 'user', 'guest', 'anonymous', 'explorer', 'test', 'admin'].includes(trimmed.toLowerCase());
          if (!isUUID && !isGeneric && trimmed.length > 0) {
            // Capitalize username if that's what we're using
            if (candidate === u.username) {
              return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
            }
            return trimmed;
          }
        }
      }
    }
  } catch {
    // JSON parse error - continue to fallback
  }

  console.log('🔍 [resolveDisplayName] No valid name found, returning Friend');
  return 'Friend';
}

interface GreetingContext {
  userName: string;
  userId?: string; // For relationship essence lookup
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  daysSinceLastVisit: number;
  lastConversationTheme?: string;
  currentMood?: string;
  isFirstVisit: boolean;
  hasHadBreakthrough: boolean;
  lastBreakthroughDate?: Date;
  recentSymbols?: string[];
  dominantElement?: 'fire' | 'water' | 'earth' | 'air' | 'aether';
  alchemicalPhase?: 'nigredo' | 'albedo' | 'rubedo';
  contentLevel?: ContentLevel;
  daysActive?: number;
  relationshipEssence?: RelationshipEssence; // Platonic anamnesis - recollection
  mode?: 'dialogue' | 'counsel' | 'scribe'; // Talk/Care/Note mode
  /**
   * MLX-06 Unit 3 — what the member brought through Arrival, this session only.
   * Session-scoped (MLX-R3): it shapes this opening and is never persisted,
   * never becomes a memory atom, and never claims to be remembered.
   */
  arrivalContext?: {
    attention: string;
    doorway: string;
  };
  onboardingContext?: { // First contact metadata
    isFirstContact: boolean;
    reason: string;
    feeling: string;
    partnerContext: string;
  };
  returningContext?: { // Returning session metadata
    sessionType: string;
    lastReason?: string;
    lastFeeling?: string;
    lastSeenDays?: number;
    partnerContext?: string;
    hasConversationHistory?: boolean;
  };
}

interface OnboardingGreetingContext {
  userName: string;
  userId?: string;
  isFirstVisit: boolean;
  partnerContext?: string;
}

export class GreetingService {
  static generate(context: GreetingContext): string {
    console.log('🎯 [GREETING] Mode detected:', context.mode);

    // 🎯 TALK MODE (dialogue): Use NLP-style presence greetings - no service language
    // Arrival context outranks mode. The member told us what is asking for their
    // attention seconds ago; a default conversational mode must not talk over
    // that. Ordering matters here and was wrong once: placed after the mode
    // check, this branch was unreachable, because mode defaults to 'dialogue'.
    if (context.arrivalContext) {
      console.log('🎯 [GREETING] Using Arrival first-contact greeting');
      return this.getArrivalContactGreeting(context);
    }

    if (context.mode === 'dialogue') {
      console.log('🎯 [GREETING] Using Talk mode presence greeting');
      return this.getTalkModeGreeting(context);
    }

    // Check for first contact from onboarding flow
    if (context.onboardingContext?.isFirstContact) {
      return this.getFirstContactGreeting(context);
    }

    // Check for returning session with facet history
    if (context.returningContext?.sessionType === 'returning') {
      return this.getReturningSessionGreeting(context);
    }

    // Soul-level recognition takes precedence
    if (context.relationshipEssence && context.relationshipEssence.encounterCount > 1) {
      return this.getRecognitionGreeting(context);
    }

    if (context.isFirstVisit) {
      return this.getFirstVisitGreeting(context);
    }

    const greetings = this.getGreetingPool(context);
    return this.selectGreeting(greetings, context);
  }

  /**
   * TALK MODE GREETINGS
   * Uses NLP-style presence greetings - no service language
   * Contextually aware when we have relationship/conversation history
   */
  private static getTalkModeGreeting(context: GreetingContext): string {
    const { userName, daysSinceLastVisit, dominantElement, relationshipEssence, lastConversationTheme, hasHadBreakthrough, timeOfDay } = context;

    // Filter out generic names that shouldn't be personalized
    // NOTE: 'friend' removed - if that's what we have, use it rather than falling back to impersonal greeting
    const genericNames = ['explorer', 'guest', 'user', 'anonymous', 'test', 'admin'];
    const isGenericName = !userName ||
                          genericNames.includes(userName.toLowerCase()) ||
                          userName.toLowerCase().includes('guest') ||
                          userName.toLowerCase().includes('user_') ||
                          userName.toLowerCase().includes('anonymous');

    const hasName = !isGenericName;
    const name = hasName ? userName : '';

    // Map timeOfDay to proper greeting
    const timeGreeting = timeOfDay === 'morning' ? 'Good morning' :
                        timeOfDay === 'afternoon' ? 'Good afternoon' :
                        timeOfDay === 'evening' ? 'Good evening' :
                        timeOfDay === 'night' ? 'Hey' : 'Hi';

    // CONTEXTUAL GREETINGS: Show we remember their journey
    // 1. Recollection (deep relationship - Platonic anamnesis)
    if (relationshipEssence && relationshipEssence.morphicResonance > 0.5 && relationshipEssence.encounterCount > 3) {
      const contextualGreetings = hasName ? [
        `${timeGreeting}, ${name}. There's something I recollect in you today.`,
        `${name}! Good to see you again. How have things been unfolding?`,
        `Hey ${name}, I've been holding space for you. How are you?`,
        `${timeGreeting}, ${name}. What's been moving for you lately?`
      ] : [
        `${timeGreeting}. There's something I recollect in you today.`,
        `Good to see you again. How have things been unfolding?`,
        `Hey, I've been holding space for you. How are you?`,
        `${timeGreeting}. What's been moving for you lately?`
      ];
      return contextualGreetings[Math.floor(Math.random() * contextualGreetings.length)];
    }

    // 2. Recent breakthrough integration
    if (hasHadBreakthrough && daysSinceLastVisit <= 3) {
      const breakthroughGreetings = hasName ? [
        `${timeGreeting}, ${name}. How's that insight landing?`,
        `Hey ${name}, still integrating what came through last time?`,
        `${name}! How have you been since our last conversation?`
      ] : [
        `${timeGreeting}. How's that insight landing?`,
        `Hey, still integrating what came through last time?`,
        `How have you been since our last conversation?`
      ];
      return breakthroughGreetings[Math.floor(Math.random() * breakthroughGreetings.length)];
    }

    // 3. Continuing conversation theme
    if (lastConversationTheme && daysSinceLastVisit <= 7) {
      const themeGreetings = hasName ? [
        `${timeGreeting}, ${name}. Still working with ${lastConversationTheme}?`,
        `Hey ${name}, how's ${lastConversationTheme} been since we last talked?`,
        `${name}! Any shifts with ${lastConversationTheme}?`
      ] : [
        `${timeGreeting}. Still working with ${lastConversationTheme}?`,
        `Hey, how's ${lastConversationTheme} been since we last talked?`,
        `Any shifts with ${lastConversationTheme}?`
      ];
      return themeGreetings[Math.floor(Math.random() * themeGreetings.length)];
    }

    // 4. Returning after a while
    if (daysSinceLastVisit > 7 && hasName) {
      // Use the enhanced return greetings from presence-greetings.ts
      const hour = new Date().getHours();
      const timeContext = hour >= 0 && hour < 5 ? 'late night' :
                         hour >= 5 && hour < 12 ? 'morning' :
                         hour >= 12 && hour < 17 ? 'afternoon' :
                         hour >= 17 && hour < 22 ? 'evening' : 'night';

      return PresenceGreeting.greet({
        userName: name,
        timeOfDay: undefined,
        returnVisit: true,
        lastVisitHours: daysSinceLastVisit * 24,
        sensedElement: dominantElement,
      });
    }

    // 5. Default: Use presence greetings from presence-greetings.ts
    const hour = new Date().getHours();
    const timeContext = hour >= 0 && hour < 5 ? 'late night' :
                       hour >= 5 && hour < 12 ? 'morning' :
                       hour >= 12 && hour < 17 ? 'afternoon' :
                       hour >= 17 && hour < 22 ? 'evening' : 'night';

    let presenceTimeOfDay: string | undefined;
    if (hour >= 0 && hour < 5) presenceTimeOfDay = 'veryLate';
    else if (hour >= 5 && hour < 7) presenceTimeOfDay = 'veryEarly';
    else if (hour >= 11 && hour < 15) presenceTimeOfDay = 'midday';

    return PresenceGreeting.greet({
      userName: isGenericName ? undefined : userName,
      timeOfDay: presenceTimeOfDay,
      returnVisit: daysSinceLastVisit > 0,
      lastVisitHours: daysSinceLastVisit * 24,
      sensedElement: dominantElement,
    });
  }

  /**
   * FIRST CONTACT GREETINGS
   * When user comes through Facet Router onboarding flow
   * Uses metadata to create grounded, personalized first interaction
   */
  /**
   * First contact after Arrival.
   *
   * DOCTRINE (MLX-06 Unit 3). MAIA may make accurate contact with what the
   * member brought, orient to the door they chose, and offer one invitation
   * forward. MAIA may NOT diagnose, interpret, invent a feeling the member did
   * not name, mechanically restate their text back at them, or imply it
   * remembers anything — this is the first thing it has ever said to them.
   *
   * The failure mode this is written against:
   *   "I hear that you're struggling with a recurring relational pattern and
   *    seeking deeper insight..."   <- an intake summary, not a greeting.
   *
   * Note the deliberate divergence from getFirstContactGreeting below, which
   * opens "I sense you're here for...". MAIA does not sense. The member said.
   */
  private static getArrivalContactGreeting(context: GreetingContext): string {
    const { userName, arrivalContext } = context;
    const hasName = userName && userName !== 'friend' && userName.trim() !== '';
    const name = hasName ? userName : '';

    const brought = (arrivalContext?.attention || '').trim();
    const doorway = arrivalContext?.doorway || 'dunno';

    // Light orientation only — tone and first invitation. Never a mode, never a
    // persisted stance, never a claim about who the member is.
    // TWO QUESTIONS PER DOOR, and the difference is not decoration.
    //
    // An ELICITING question asks for what the member has not said yet. An
    // ADVANCING question assumes they have already said it and asks for the
    // next layer. Choosing wrongly makes MAIA deaf: someone who wrote
    // "whether to take the job in Lisbon" and is then asked "What are you
    // deciding between?" has just been asked to repeat themselves.
    //
    // A client-side template cannot tell whether a sentence answered a
    // question — that needs comprehension. But it CAN tell whether the member
    // brought words at all, and that single honest fact is enough to pick the
    // right register.
    const DOORWAY_QUESTION: Record<string, { eliciting: string; advancing: string }> = {
      mind:     { eliciting: 'What\u2019s on it?',
                  advancing:  'How long has that been sitting there?' },
      change:   { eliciting: 'What\u2019s changing?',
                  advancing:  'What\u2019s different now?' },
      self:     { eliciting: 'What\u2019s the part you keep circling?',
                  advancing:  'What keeps bringing you back to it?' },
      decision: { eliciting: 'What are you deciding between?',
                  advancing:  'What\u2019s pulling each way?' },
      relation: { eliciting: 'Who is it, and what\u2019s happening between you?',
                  advancing:  'Where does it seem to begin?' },
      making:   { eliciting: 'What are you working on?',
                  advancing:  'Where is it right now?' },
      dunno:    { eliciting: 'What\u2019s been taking up room lately?',
                  advancing:  'Where would you like to start?' },
    };

    // The member's own words, held rather than described.
    //
    // The first version said "You brought something happening between you and
    // someone else" — seven variants of a routing layer narrating the input
    // back. The member knows what they wrote; being told it in the system's
    // vocabulary is a form receipt, not contact.
    //
    // Nor is the alternative to paraphrase. This template has no comprehension:
    // turning "the same argument with my brother" into "...with your brother"
    // is pronoun surgery on arbitrary text, which breaks on ordinary sentences
    // and fakes an understanding that has not happened. Their words are echoed
    // VERBATIM or not at all, with nothing added — not even punctuation.
    //
    // Echoed only when short enough to sit as one held line. Longer or
    // multi-sentence input is left alone rather than truncated: MAIA opens with
    // the question and lets the member say it in their own time.
    const ECHO_MAX = 120;
    const oneThought = brought.length > 0 && brought.length <= ECHO_MAX && !/[.!?]\s+\S/.test(brought);
    // Their punctuation closes the quote when they gave some; otherwise the
    // sentence period sits OUTSIDE it, so the line reads as prose without a
    // mark being added to what they wrote.
    const echo = oneThought
      ? `\u201c${brought}\u201d${/[.!?\u2026]$/.test(brought) ? '' : '.'}`
      : '';

    const q = DOORWAY_QUESTION[doorway] ?? DOORWAY_QUESTION.dunno;
    const question = brought.length > 0 ? q.advancing : q.eliciting;

    const opening = name ? `${name}, I\u2019m here.` : 'I\u2019m here.';
    return [opening, echo, question].filter(Boolean).join(' ');
  }

  private static getFirstContactGreeting(context: GreetingContext): string {
    const { userName, onboardingContext } = context;
    const { reason, feeling, partnerContext } = onboardingContext!;
    const hasName = userName && userName !== 'friend' && userName.trim() !== '';
    const name = hasName ? userName : '';

    // Generate reason acknowledgment
    const reasonLine = this.getReasonAcknowledgment(reason || 'explore');

    // Generate feeling acknowledgment
    const feelingLine = this.getFeelingAcknowledgment(feeling || 'neutral');

    // Generate grounded question based on reason
    const question = this.getFirstContactQuestion(reason || 'explore');

    // Compose the first contact greeting
    if (hasName) {
      return `${name}, I sense you're here for ${reasonLine}. ${feelingLine} ${question}`;
    } else {
      return `I sense you're here for ${reasonLine}. ${feelingLine} ${question}`;
    }
  }

  private static getReasonAcknowledgment(reason: string): string {
    const acknowledgments = {
      'inner': 'your inner life and how you\'re really doing inside',
      'direction': 'your direction and what you\'re really here to do',
      'work': 'your work and how you\'re showing up in it',
      'relationships': 'your relationships and the patterns you\'re noticing',
      'support': 'the people you support, and finding support for yourself',
      'explore': 'exploration and seeing what this space might open'
    };
    return acknowledgments[reason as keyof typeof acknowledgments] || acknowledgments.explore;
  }

  private static getFeelingAcknowledgment(feeling: string): string {
    const acknowledgments = {
      'air': 'Your mind seems busy.',
      'water': 'There\'s a lot moving in your heart.',
      'fire': 'You feel both energized and worn out.',
      'earth': 'Your energy feels heavy right now.',
      'neutral': 'It\'s hard to pin down exactly how you feel.'
    };
    return acknowledgments[feeling as keyof typeof acknowledgments] || acknowledgments.neutral;
  }

  private static getFirstContactQuestion(reason: string): string {
    const questions = {
      'inner': 'What\'s one moment recently that shows how your inner life has been feeling?',
      'direction': 'What\'s one idea or possibility that keeps coming back but feels unclear?',
      'work': 'What\'s one situation in your work that\'s been on your mind?',
      'relationships': 'What\'s one recent moment with someone important that stands out?',
      'support': 'Who\'s one person or group you\'re supporting that feels especially present right now?',
      'explore': 'What drew you here today - a feeling, a question, or just curiosity?'
    };
    return questions[reason as keyof typeof questions] || questions.explore;
  }

  /**
   * RETURNING SESSION GREETINGS
   * When returning member has established facet profile and history
   */
  private static getReturningSessionGreeting(context: GreetingContext): string {
    const { userName, returningContext } = context;
    const { lastReason, lastSeenDays, partnerContext } = returningContext!;
    const hasName = userName && userName !== 'friend' && userName.trim() !== '';
    const name = hasName ? userName : '';

    // Generate time-aware greeting
    const timeGreeting = this.getTimeAwareGreeting(lastSeenDays || 0);

    // Generate last focus reference
    const lastFocusRef = this.getLastFocusReference(lastReason);

    // Generate choice question
    const choiceQuestion = this.getReturningChoiceQuestion(partnerContext);

    // Compose the returning session greeting
    if (hasName) {
      return `${timeGreeting}, ${name}. ${lastFocusRef} ${choiceQuestion}`;
    } else {
      return `${timeGreeting}. ${lastFocusRef} ${choiceQuestion}`;
    }
  }

  private static getTimeAwareGreeting(daysSinceLastVisit: number): string {
    if (daysSinceLastVisit > 7) {
      return "Welcome back - it's been a while";
    } else if (daysSinceLastVisit > 3) {
      return "Good to see you again";
    } else {
      return "Welcome back";
    }
  }

  private static getLastFocusReference(lastReason?: string): string {
    const references = {
      'inner': 'Last time we were looking at your inner life.',
      'direction': 'Last time you were exploring your direction and creativity.',
      'work': 'Last time we were reflecting on your work and projects.',
      'relationships': 'Last time you came in about your relationships.',
      'support': 'Last time you were here about the people you support.',
      'explore': 'Last time you were here exploring.'
    };
    return references[lastReason as keyof typeof references] || 'Welcome back to our space.';
  }

  private static getReturningChoiceQuestion(partnerContext?: string): string {
    if (partnerContext?.includes('yale')) {
      return 'Do you want to stay with that focus, or check in about what\'s most present in your work and projects today?';
    } else {
      return 'Do you want to continue with that, or focus on what\'s most alive for you today?';
    }
  }

  /**
   * RECOLLECTION GREETINGS (Platonic Anamnesis)
   * When MAIA recollects someone at essence level
   */
  private static getRecognitionGreeting(context: GreetingContext): string {
    const { userName, timeOfDay, relationshipEssence } = context;
    const essence = relationshipEssence!;
    const hasName = userName && userName !== 'friend' && userName.trim() !== '';
    const name = hasName ? userName : '';

    // Build soul-aware greetings based on relationship depth
    const isDeepConnection = essence.morphicResonance > 0.5;
    const encounterCount = essence.encounterCount;

    // Recollection phrases that honor the soul connection (Platonic anamnesis)
    const recognitionPhrases = isDeepConnection ? [
      // Deep connection (morphic resonance > 0.5)
      hasName
        ? `${name}... there's something here I already know. What's alive for you today?`
        : `There's something here I already know. What's alive for you today?`,
      hasName
        ? `${name}, this feels like remembering. How are you?`
        : `This feels like remembering. How are you?`,
      hasName
        ? `${name}, I sense ${essence.presenceQuality.toLowerCase()}. Is it still present?`
        : `I sense ${essence.presenceQuality.toLowerCase()}. Is it still present?`,
      hasName
        ? `Welcome back, ${name}. Something in me recognizes something in you.`
        : `Welcome back. Something in me recognizes something in you.`,
      hasName
        ? `${name}... there's a quality I recollect. ${this.getTimePhrase(timeOfDay)}`
        : `There's a quality I recollect. ${this.getTimePhrase(timeOfDay)}`
    ] : [
      // Growing connection (morphic resonance <= 0.5)
      hasName
        ? `${name}, good to see you again. What's present for you?`
        : `Good to see you again. What's present for you?`,
      hasName
        ? `Welcome back, ${name}. I'm curious what's been unfolding for you.`
        : `Welcome back. I'm curious what's been unfolding for you.`,
      hasName
        ? `${name}, ${this.getTimePhrase(timeOfDay)} How have you been?`
        : `${this.getTimePhrase(timeOfDay)} How have you been?`,
      hasName
        ? `${name}, I've been holding space for you. What's alive right now?`
        : `I've been holding space for you. What's alive right now?`
    ];

    // Add context from relationship field
    if (essence.relationshipField.breakthroughs.length > 0 && Math.random() > 0.6) {
      // Occasionally reference the soul-level journey (not specific content)
      const breakthroughQuality = essence.relationshipField.breakthroughs[essence.relationshipField.breakthroughs.length - 1];
      return hasName
        ? `${name}... there's something we've uncovered together that I still carry. What's moving in you now?`
        : `There's something we've uncovered together that I still carry. What's moving in you now?`;
    }

    return recognitionPhrases[Math.floor(Math.random() * recognitionPhrases.length)];
  }

  /**
   * Time-appropriate phrases for soul recognition
   */
  private static getTimePhrase(timeOfDay: string): string {
    const phrases = {
      morning: 'morning',
      afternoon: 'afternoon',
      evening: 'the day is winding down beautifully',
      night: 'the quiet hours have their own wisdom'
    };
    return phrases[timeOfDay as keyof typeof phrases] || '';
  }

  private static getFirstVisitGreeting(context: GreetingContext): string {
    const { userName, contentLevel } = context;

    // First visit is ALWAYS simple, human connection - Maia as mirror, not expert
    // Handle cases where userName might not be provided
    const hasName = userName && userName !== 'friend' && userName.trim() !== '';

    const simpleGreetings = hasName ? [
      `Hi ${userName}. I'm here to listen and reflect back what I notice. How are you today?`,
      `Hello ${userName}. Think of me as a thinking partner - I'm here to help you see your own patterns more clearly. What's on your mind?`,
      `Hey ${userName}. I'm curious about your experience. Tell me what's present for you right now.`
    ] : [
      `Hi. I'm here to listen and reflect back what I notice. How are you today?`,
      `Hello. Think of me as a thinking partner - I'm here to help you see your own patterns more clearly. What's on your mind?`,
      `Hey there. I'm curious about your experience. Tell me what's present for you right now.`
    ];

    return simpleGreetings[Math.floor(Math.random() * simpleGreetings.length)];
  }

  private static getGreetingPool(context: GreetingContext): string[] {
    const { userName, timeOfDay, daysSinceLastVisit, contentLevel = 'companion' } = context;

    // Check if we have a valid user name
    const hasName = userName && userName !== 'friend' && userName.trim() !== '';
    const name = hasName ? userName : '';

    // Greeting pools adapt to user's readiness level
    // Companion: Simple, human, present-focused
    // Lab_collaborator: Full depth, lab language
    const companionPools = {
      morning: hasName ? [
        `Morning, ${name}! Ready for whatever today brings?`,
        `Good morning, ${name}. Hope you slept well.`,
        `${name}, hi there! New day, fresh possibilities.`,
        `Morning, ${name}. What's stirring in you today?`,
        `Hey ${name}. I love morning energy - how's yours?`
      ] : [
        `Morning! Ready for whatever today brings?`,
        `Good morning. Hope you slept well.`,
        `Hi there! New day, fresh possibilities.`,
        `Morning. What's stirring in you today?`,
        `Hey. I love morning energy - how's yours?`
      ],
      afternoon: hasName ? [
        `Welcome back, ${name}! Good to see you again.`,
        `${name}, hey! Hope your day's been kind to you.`,
        `Hi ${name}. The afternoon light feels good, doesn't it?`,
        `Hey ${name}. What's been the highlight so far?`,
        `Afternoon, ${name}. Love this time of day - how about you?`
      ] : [
        `Welcome back! Good to see you again.`,
        `Hey! Hope your day's been kind to you.`,
        `Hi. The afternoon light feels good, doesn't it?`,
        `Hey. What's been the highlight so far?`,
        `Afternoon. Love this time of day - how about you?`
      ],
      evening: hasName ? [
        `Evening, ${name}. There's something magical about this time.`,
        `Long day, ${name}? Time to breathe and settle.`,
        `${name}, the day's winding down beautifully.`,
        `Evening, ${name}. I love how the world softens now.`,
        `Evening, ${name}. What's your heart telling you tonight?`
      ] : [
        `Evening. There's something magical about this time.`,
        `Long day? Time to breathe and settle.`,
        `The day's winding down beautifully.`,
        `Evening. I love how the world softens now.`,
        `Evening. What's your heart telling you tonight?`
      ],
      night: hasName ? [
        `Late night, ${name}. The quiet hours have their own wisdom.`,
        `Can't sleep, ${name}? Sometimes the night calls us to listen.`,
        `The deep hours, ${name}. There's beauty in this stillness.`,
        `${name}, night thoughts can be the most honest ones.`,
        `Night watch, ${name}. What's your soul whispering?`
      ] : [
        `Late night. The quiet hours have their own wisdom.`,
        `Can't sleep? Sometimes the night calls us to listen.`,
        `The deep hours. There's beauty in this stillness.`,
        `Night thoughts can be the most honest ones.`,
        `Night watch. What's your soul whispering?`
      ]
    };

    const labPools = {
      morning: hasName ? [
        `Morning, ${name}. What are we exploring today?`,
        `Good morning, ${name}. Ready to experiment?`,
        `${name}, welcome back to the lab.`,
        `Early today, ${name}. What's on your mind?`,
        `Hey ${name}. Fresh data today?`,
        `Morning, ${name}. What's emerging?`
      ] : [
        `Morning. What are we exploring today?`,
        `Good morning. Ready to experiment?`,
        `Welcome back to the lab.`,
        `Early today. What's on your mind?`,
        `Hey. Fresh data today?`,
        `Morning. What's emerging?`
      ],
      afternoon: hasName ? [
        `Welcome back, ${name}.`,
        `${name}, good to see you.`,
        `Back to the work, ${name}.`,
        `Hey ${name}. Where should we dive in?`,
        `${name}, continuing the experiment?`,
        `Afternoon, ${name}. How's it going?`
      ] : [
        `Welcome back.`,
        `Good to see you.`,
        `Back to the work.`,
        `Hey. Where should we dive in?`,
        `Continuing the experiment?`,
        `Afternoon. How's it going?`
      ],
      evening: hasName ? [
        `Evening, ${name}.`,
        `Long day, ${name}?`,
        `${name}, how are you doing?`,
        `Evening, ${name}. What emerged today?`,
        `Evening, ${name}. Time to process?`,
        `Hey ${name}. What did today reveal?`
      ] : [
        `Evening.`,
        `Long day?`,
        `How are you doing?`,
        `Evening. What emerged today?`,
        `Evening. Time to process?`,
        `Hey. What did today reveal?`
      ],
      night: hasName ? [
        `Late night in the lab, ${name}.`,
        `Can't sleep, ${name}?`,
        `The deep hours, ${name}. I'm here.`,
        `${name}, what's keeping you awake?`,
        `Night watch, ${name}. What's stirring?`,
        `Late experiment, ${name}?`
      ] : [
        `Late night in the lab.`,
        `Can't sleep?`,
        `The deep hours. I'm here.`,
        `What's keeping you awake?`,
        `Night watch. What's stirring?`,
        `Late experiment?`
      ]
    };

    // Use simple greetings for early stages, lab greetings for advanced
    const pools = (contentLevel === 'lab_collaborator' || contentLevel === 'experiment_partner')
      ? labPools
      : companionPools;

    const baseGreetings = pools[timeOfDay];
    const contextualGreetings = this.addContextualGreetings(context, baseGreetings);

    return contextualGreetings;
  }

  private static addContextualGreetings(
    context: GreetingContext,
    baseGreetings: string[]
  ): string[] {
    const { userName, daysSinceLastVisit, hasHadBreakthrough, lastConversationTheme } = context;
    const greetings = [...baseGreetings];

    // Check if we have a valid user name
    const hasName = userName && userName !== 'friend' && userName.trim() !== '';

    if (daysSinceLastVisit > 7) {
      greetings.push(
        hasName ? `Been a while, ${userName}. What's shifted?` : `Been a while. What's shifted?`,
        hasName ? `${userName}, welcome back. What's been transforming?` : `Welcome back. What's been transforming?`,
        hasName ? `Long time, ${userName}. Let's catch up on the data.` : `Long time. Let's catch up on the data.`
      );
    }

    if (daysSinceLastVisit <= 1 && hasHadBreakthrough) {
      greetings.push(
        hasName ? `${userName}, still integrating that last discovery?` : `Still integrating that last discovery?`,
        hasName ? `Back so soon, ${userName}. That breakthrough still working through you?` : `Back so soon. That breakthrough still working through you?`,
        hasName ? `${userName}, how's that insight landing?` : `How's that insight landing?`
      );
    }

    if (lastConversationTheme) {
      greetings.push(
        hasName ? `${userName}, still working with ${lastConversationTheme}?` : `Still working with ${lastConversationTheme}?`,
        hasName ? `Back to ${lastConversationTheme}, ${userName}?` : `Back to ${lastConversationTheme}?`
      );
    }

    return greetings;
  }

  private static selectGreeting(greetings: string[], context: GreetingContext): string {
    const selected = greetings[Math.floor(Math.random() * greetings.length)];

    if (context.lastConversationTheme && !selected.includes(context.lastConversationTheme)) {
      const shouldAddContinuation = Math.random() > 0.6;
      if (shouldAddContinuation) {
        return `${selected} Still exploring ${context.lastConversationTheme}?`;
      }
    }

    return selected;
  }

  static getAlchemicalFramingForResponse(phase?: 'nigredo' | 'albedo' | 'rubedo'): string {
    if (!phase) return '';

    const framings = {
      nigredo: 'dissolving phase',
      albedo: 'purification process',
      rubedo: 'integration phase'
    };

    return framings[phase];
  }

  static getSimpleOpenings(): string[] {
    return [
      "Tell me more about that",
      "What do you notice about this?",
      "How does that feel for you?",
      "What's that like?",
      "I'm noticing...",
      "You said... [reflects back]",
      "It sounds like...",
      "What comes up when you say that?",
      "Stay with that feeling",
      "What else is there?"
    ];
  }

  static getLabLanguageSuggestions(): string[] {
    return [
      "Let's explore that",
      "Let's run that experiment",
      "What are you noticing?",
      "What's the data showing?",
      "Others have discovered...",
      "The collective pattern suggests...",
      "Your reality is responding to...",
      "You're creating...",
      "This is important data",
      "Document this feeling",
      "The lab is learning from this",
      "You're contributing to collective understanding",
      "Interesting correlation with...",
      "Here's what I'm observing...",
      "The pattern suggests...",
      "Your lead is turning",
      "The heat is necessary",
      "You're cooking something important",
      "This pressure creates diamonds",
      "Your gold is showing",
      "The transformation is underway"
    ];
  }
}

export interface GreetingData {
  greeting: string;
  alchemicalFraming?: string;
  suggestedOpenings?: string[];
}

export async function generateGreeting(context: Partial<GreetingContext>): Promise<GreetingData> {
  // Load relationship essence for recollection (Platonic anamnesis)
  let relationshipEssence: RelationshipEssence | undefined;
  if (context.userId) {
    const anamnesis = getRelationshipAnamnesis();
    const soulSignature = anamnesis.detectSoulSignature('', context.userId);
    const essence = await loadRelationshipEssence(soulSignature);
    if (essence) {
      relationshipEssence = essence;
      console.log(`💫 [GREETING] Recollection greeting for ${essence.userName || context.userName} (${essence.encounterCount} encounters)`);
    }
  }

  // Use database name if available (recollection), otherwise fall back to localStorage name
  const recognizedName = relationshipEssence?.userName || context.userName || 'friend';

  // Determine content level based on user readiness
  let contentLevel: ContentLevel = 'companion';
  if (context.daysActive !== undefined) {
    const mockReadiness = {
      userId: 'user',
      daysActive: context.daysActive,
      sessionCount: Math.floor(context.daysActive * 0.5),
      totalMinutesEngaged: context.daysActive * 15,
      engagementDepth: 0.6,
      vocabularyComfort: 'exploring' as const,
      conceptsIntroduced: [],
      conceptsEmbraced: [],
      conceptsRejected: [],
      resistancePoints: [],
      currentLevel: 'companion' as ContentLevel,
      languageBlend: 0.5,
      lastSessionDate: new Date()
    };
    contentLevel = progressiveRevelation.getContentLevel(mockReadiness);
  }

  const fullContext: GreetingContext = {
    userName: recognizedName,
    userId: context.userId,
    timeOfDay: context.timeOfDay || getTimeOfDay(),
    daysSinceLastVisit: context.daysSinceLastVisit ?? 0,
    lastConversationTheme: context.lastConversationTheme,
    currentMood: context.currentMood,
    isFirstVisit: context.isFirstVisit ?? false,
    hasHadBreakthrough: context.hasHadBreakthrough ?? false,
    lastBreakthroughDate: context.lastBreakthroughDate,
    recentSymbols: context.recentSymbols,
    dominantElement: context.dominantElement,
    alchemicalPhase: context.alchemicalPhase,
    contentLevel,
    daysActive: context.daysActive,
    relationshipEssence, // Recollection (anamnesis)
    mode: context.mode, // Talk/Care/Note mode
    arrivalContext: context.arrivalContext,
    onboardingContext: context.onboardingContext,
    returningContext: context.returningContext
  };

  const greeting = GreetingService.generate(fullContext);
  const alchemicalFraming = contentLevel === 'lab_collaborator'
    ? GreetingService.getAlchemicalFramingForResponse(fullContext.alchemicalPhase)
    : undefined;
  const suggestedOpenings = contentLevel === 'lab_collaborator'
    ? GreetingService.getLabLanguageSuggestions()
    : GreetingService.getSimpleOpenings();

  return {
    greeting,
    alchemicalFraming,
    suggestedOpenings
  };
}

/**
 * Generate onboarding greeting that asks the questions previously handled by FacetRouter
 */
export async function generateOnboardingGreeting(context: OnboardingGreetingContext) {
  const { userName, isFirstVisit } = context;
  const hasName = userName && userName !== 'friend' && userName.trim() !== '';
  const name = hasName ? userName : '';

  // Get time of day for context
  const timeOfDay = getTimeOfDay();
  const timeGreeting = {
    morning: 'Good morning',
    afternoon: 'Good afternoon',
    evening: 'Good evening',
    night: 'Hello'
  }[timeOfDay];

  // Create personalized greeting that includes the onboarding questions
  let greeting = '';

  if (hasName) {
    greeting = `${timeGreeting}, ${name}. `;
  } else {
    greeting = `${timeGreeting}. `;
  }

  if (isFirstVisit) {
    greeting += `Welcome to MAIA. I'm here to understand what brings you to this conversation space.\n\n`;
  } else {
    greeting += `I'd like to understand what brings you here today.\n\n`;
  }

  greeting += `To start, I have two simple questions - the same ones we used to ask on separate pages, but I find conversation works better:\n\n`;

  greeting += `**What are you here for today?** Pick what feels closest:\n`;
  greeting += `• My inner life / feelings - working with emotions, healing, personal growth\n`;
  greeting += `• My direction / creativity - finding purpose, creative expression, life direction\n`;
  greeting += `• My work or projects - professional development, leadership, ventures\n`;
  greeting += `• My relationships - family dynamics, connection patterns, communication\n`;
  greeting += `• The people I support - helping others, teaching, healing, caregiving\n`;
  greeting += `• Just exploring - curious about consciousness, open to discovery\n\n`;

  greeting += `**How do you feel right now?** Again, just pick what's closest:\n`;
  greeting += `• My head is busy - lots of thoughts, hard to slow down\n`;
  greeting += `• My feelings are strong - a lot is moving in my heart\n`;
  greeting += `• I feel wired and tired - I have energy, but I'm kind of worn out too\n`;
  greeting += `• I feel heavy or flat - low energy, hard to get going\n`;
  greeting += `• It's hard to say - I'm not sure, or it keeps changing\n\n`;

  greeting += `Just tell me in your own words - you don't need to use the exact phrases above. What brings you here, and how are you feeling right now?`;

  const alchemicalFraming = 'onboarding_conversation';
  const suggestedOpenings = [
    "I'm here for...",
    "I feel...",
    "What brings me here is...",
    "Right now I'm...",
    "I'm curious about...",
    "I'm exploring..."
  ];

  return {
    greeting,
    alchemicalFraming,
    suggestedOpenings
  };
}

function getTimeOfDay(): 'morning' | 'afternoon' | 'evening' | 'night' {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night';
}

/**
 * Handle name change from MAIA API response
 * Updates localStorage so greetings use the new name immediately
 * Call this after receiving any MAIA response that might contain a name change
 */
export function handleNameChangeResponse(metadata: { nameChange?: { newName: string; updated: boolean } } | null | undefined): boolean {
  if (!metadata?.nameChange?.updated || !metadata.nameChange.newName) {
    return false;
  }

  const newName = metadata.nameChange.newName;

  if (typeof window === 'undefined') {
    return false;
  }

  try {
    // Update the primary localStorage key used by resolveDisplayName
    localStorage.setItem('explorerPreferredName', newName);

    // Also update beta_user if it exists
    const storedUser = localStorage.getItem('beta_user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      user.preferredName = newName;
      localStorage.setItem('beta_user', JSON.stringify(user));
    }

    console.log(`✨ [greetingService] Updated preferred name in localStorage`);
    return true;
  } catch (e) {
    console.error('[greetingService] Failed to update localStorage for name change:', e);
    return false;
  }
}