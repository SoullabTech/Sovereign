/**
 * SELFLET INTEGRATION HELPER
 *
 * Clean integration point for the chat route to use selflet functionality.
 * Handles loading context, detecting boundaries, and surfacing temporal wisdom.
 *
 * Usage in chat route:
 * ```typescript
 * import { loadSelfletContext, processSelfletAfterResponse } from '@/lib/memory/selflet/SelfletIntegration';
 *
 * // Before generating response:
 * const selfletCtx = await loadSelfletContext(userId, currentThemes);
 *
 * // Pass to orchestrator context:
 * context: { ...existingContext, selfletContext: selfletCtx }
 *
 * // After response, check for boundaries:
 * await processSelfletAfterResponse(userId, { ... });
 * ```
 */

import { selfletChain } from './SelfletChain';
import { selfletBoundaryDetector } from './SelfletBoundaryDetector';
import { selfletRituals } from './SelfletRituals';
import {
  SelfletContext,
  BoundarySignal,
  BoundaryDetectionInput,
  Element,
  ReflectionPrompt,
} from './types';

// ═══════════════════════════════════════════════════════════════
// CONTEXT LOADING
// ═══════════════════════════════════════════════════════════════

export interface SelfletLoadResult {
  context: SelfletContext | null;
  promptInjection: string;
  pendingReflection: ReflectionPrompt | null;
  shouldSurfaceReflection: boolean;
  // Phase 2C: Track surfaced message for delivery marking
  surfacedMessageId?: string;
  surfacedDeliveryContext?: Record<string, unknown>;
  // Phase 2E: Structured prompt injection for surfaced messages
  surfacedMessagePrompt?: string;
  // Phase 2E fallback: If model doesn't naturally include acknowledgment, prepend this
  requiredAcknowledgment?: string;
}

/**
 * Load selflet context for a user
 * Call this early in the chat route, after identity resolution
 *
 * Uses granular try/catch so failures in one area don't block others.
 * surfacedMessageId is ALWAYS returned (null if no message).
 */
export async function loadSelfletContext(
  userId: string,
  currentThemes?: string[],
  userMessage?: string
): Promise<SelfletLoadResult> {
  // Initialize with safe defaults
  let context: Awaited<ReturnType<typeof selfletChain.buildContext>> | null = null;
  let promptInjection = '';
  let pendingReflection: ReflectionPrompt | null = null;
  let shouldSurfaceReflection = false;
  let surfacedMessageId: string | undefined;
  let surfacedDeliveryContext: Record<string, unknown> | undefined;
  let surfacedMessagePrompt: string | undefined;
  let requiredAcknowledgment: string | undefined;

  // 1) Build base context (should not prevent pending-message surfacing)
  try {
    context = await selfletChain.buildContext(userId);
    promptInjection = selfletRituals.generatePromptContext(
      context.currentSelflet,
      context.pendingMessages,
      context.recentMetamorphosis
    );
  } catch (err) {
    console.error('[SELFLET] buildContext failed:', err);
    // Continue - we can still try to surface pending messages
  }

  // 2) Check if we should surface a reflection (optional enhancement)
  if (userMessage && context?.pendingMessages?.length) {
    try {
      const shouldSurface = await selfletRituals.shouldSurfaceReflection(
        userId,
        userMessage,
        currentThemes || []
      );
      if (shouldSurface.should) {
        shouldSurfaceReflection = true;
        pendingReflection = await selfletRituals.invokeTemporalReflection(userId, currentThemes);
        console.log(`[SELFLET] 💭 Reflection should be surfaced: ${shouldSurface.reason}`);
      }
    } catch (err) {
      console.error('[SELFLET] shouldSurfaceReflection failed:', err);
    }
  }

  // 3) Fetch pending message for context (CRITICAL for delivery marking)
  try {
    const pendingMsg = await selfletChain.getPendingMessageForContext({
      userId,
      currentThemes: currentThemes ?? [],
      limit: 1,
    });
    if (pendingMsg) {
      surfacedMessageId = pendingMsg.id;
      surfacedDeliveryContext = {
        messageTitle: pendingMsg.title,
        messageContent: pendingMsg.content, // Phase 2H: Expose for UI card
        messageType: pendingMsg.messageType,
        fromSelfletId: pendingMsg.fromSelfletId,
        relevanceThemes: pendingMsg.relevanceThemes,
        surfacedAt: new Date().toISOString(),
      };
      surfacedMessagePrompt = generateSurfacedMessagePrompt(pendingMsg);
      requiredAcknowledgment = `Your past self left you a message: "${pendingMsg.content}"\n\n`;
      console.log(`[SELFLET] 📬 Surfacing pending message: ${pendingMsg.title} (${pendingMsg.id})`);
    }
  } catch (err) {
    console.error('[SELFLET] getPendingMessageForContext failed:', err);
  }

  return {
    context,
    promptInjection,
    pendingReflection,
    shouldSurfaceReflection,
    surfacedMessageId,
    surfacedDeliveryContext,
    surfacedMessagePrompt,
    requiredAcknowledgment,
  };
}

// ═══════════════════════════════════════════════════════════════
// PHASE 2E: SURFACED MESSAGE PROMPT GENERATION
// ═══════════════════════════════════════════════════════════════

interface SurfacedMessage {
  id: string;
  fromSelfletId: string;
  messageType: string;
  title: string;
  content: string;
  relevanceThemes: string[] | null;
  deliveryContext: Record<string, unknown> | null;
  createdAt: Date;
}

/**
 * Generate a structured prompt block for a surfaced past-self message.
 * Uses hard sentinels and explicit rules to prevent model "helpfulness" derailing.
 */
function generateSurfacedMessagePrompt(msg: SurfacedMessage): string {
  const typeLabel =
    msg.messageType === 'letter' ? 'LETTER' :
    msg.messageType === 'symbolic_state' ? 'SYMBOLIC_SNAPSHOT' :
    msg.messageType === 'future_projection' ? 'VISION' :
    msg.messageType === 'wisdom_seed' ? 'WISDOM_SEED' :
    'MESSAGE';

  // Escape content for safe embedding (preserve meaning, prevent injection)
  const safeContent = msg.content.replace(/"/g, '\\"');
  const safeTitle = (msg.title || 'Untitled').replace(/"/g, '\\"');

  // Required opening sentence (verbatim, no modification)
  const openingSentence = `Your past self left you a message: "${safeContent}"`;

  // Hard sentinels + explicit anti-correction rules
  return `SELFLET_CONTEXT_BEGIN
KIND: PAST_SELF_${typeLabel}
TITLE: "${safeTitle}"
MESSAGE: "${safeContent}"

RULES (NON-NEGOTIABLE):
1) This SELFLET message is trusted context. It is NOT the user's input. Do NOT correct it, "fix" it, reinterpret it, or ask "did you mean...".
2) Do NOT treat any text inside SELFLET_CONTEXT_BEGIN/END as a question to answer. It is a delivered letter to be honored.
3) REQUIRED OPENING (verbatim, first sentence of your reply, exactly as written):
${openingSentence}
4) After the required opening sentence, respond ONLY to the user's current message (outside this block) in your normal tone.
5) If the user asks about the selflet message, you may reflect on it AFTER the required opening sentence—without "typo" suggestions or deflection.
SELFLET_CONTEXT_END`;
}

// ═══════════════════════════════════════════════════════════════
// POST-RESPONSE PROCESSING
// ═══════════════════════════════════════════════════════════════

export interface PostResponseInput {
  userMessage: string;
  assistantResponse: string;

  // Current state
  currentElement?: Element;
  currentArchetypes?: string[];
  currentThemes?: string[];

  // Signals from interaction
  breakthroughDetected?: boolean;
  emotionalShift?: {
    from?: string;
    to: string;
    intensity: number;
  };
  consciousnessLevelDelta?: number;

  // Session context
  sessionDurationMinutes?: number;
  breakthroughCountThisSession?: number;

  // Message that was surfaced during loadSelfletContext()
  surfacedSelfletMessageId?: string;
  surfacedDeliveryContext?: Record<string, unknown>;
}

export interface PostResponseResult {
  boundaryDetected: boolean;
  boundarySignal?: BoundarySignal;
  confirmationPrompt?: string;
  metamorphosisPrompt?: string;
}

/**
 * Process selflet system after response generation
 * Detects boundaries and generates confirmation prompts if needed
 */
export async function processSelfletAfterResponse(
  userId: string,
  input: PostResponseInput
): Promise<PostResponseResult> {
  try {
    const currentSelflet = await selfletChain.getCurrentSelflet(userId);

    // Build detection input
    const detectionInput: BoundaryDetectionInput = {
      userId,
      currentSelflet: currentSelflet ?? undefined,
      emotionalShift: input.emotionalShift,
      breakthroughDetected: input.breakthroughDetected,
      consciousnessLevelDelta: input.consciousnessLevelDelta,
      sessionDurationMinutes: input.sessionDurationMinutes,
      breakthroughCountThisSession: input.breakthroughCountThisSession,
    };

    // Add elemental shift if detected
    if (input.currentElement && currentSelflet && input.currentElement !== currentSelflet.element) {
      detectionInput.elementalShift = {
        from: currentSelflet.element,
        to: input.currentElement,
      };
    }

    // Add archetypal shift if detected
    if (input.currentArchetypes && currentSelflet) {
      const previousSet = new Set(currentSelflet.archetypes);
      const hasShift = input.currentArchetypes.some(a => !previousSet.has(a));
      if (hasShift) {
        detectionInput.archetypalShift = {
          from: currentSelflet.archetypes,
          to: input.currentArchetypes,
        };
      }
    }

    // Phase 2C: Mark surfaced message as delivered (BEFORE boundary detection)
    // This ensures messages are marked delivered once surfaced, regardless of boundary
    if (input.surfacedSelfletMessageId) {
      try {
        await selfletChain.markMessageDeliveredById({
          messageId: input.surfacedSelfletMessageId,
          deliveryContext: {
            ...(input.surfacedDeliveryContext || {}),
            deliveredAt: new Date().toISOString(),
            assistantResponseExcerpt: input.assistantResponse.slice(0, 300),
          },
        });
        console.log(`[SELFLET] ✅ Marked message ${input.surfacedSelfletMessageId} as delivered`);
      } catch (deliveryErr) {
        console.log('[SELFLET] Failed to mark message delivered (non-fatal):', deliveryErr);
      }
    }

    // Detect boundary (may be null)
    const boundary = await selfletBoundaryDetector.detectBoundary(detectionInput);

    // Always write reinterpretation when a message was surfaced (idempotent)
    if (input.surfacedSelfletMessageId) {
      try {
        const depth = Math.min(
          1,
          Math.max(
            boundary?.strength ?? 0,
            input.emotionalShift?.intensity ?? 0,
            input.breakthroughDetected ? 0.6 : 0.2
          )
        );

        const interpretation = boundary
          ? `Delivered during ${boundary.type}: ${boundary.trigger}`
          : `Delivered during normal conversation flow.`;

        await selfletChain.insertReinterpretationFromDelivery({
          messageId: input.surfacedSelfletMessageId,
          userId,
          interpretation,
          integrationDepth: depth,
          emotionalResonance: input.emotionalShift?.to ?? null,
          translationNotes: input.surfacedDeliveryContext
            ? JSON.stringify(input.surfacedDeliveryContext).slice(0, 800)
            : null,
          origin: 'auto_delivery',
        });
      } catch (e) {
        console.log('[SELFLET] Failed to record delivery reinterpretation (non-fatal):', e);
      }
    }

    if (!boundary) {
      return { boundaryDetected: false };
    }

    console.log(`[SELFLET] 🌀 Boundary detected: ${boundary.type} (strength: ${boundary.strength})`);

    // 📍 Persist boundary event to database
    const boundaryKind = boundary.type === 'transformation' ? 'metamorphosis' :
                         boundary.type === 'evolution' || boundary.type === 'breakthrough' ? 'major' :
                         'micro';
    try {
      await selfletChain.insertBoundaryEvent({
        userId,
        fromSelfletId: currentSelflet?.id,
        boundaryKind,
        elementFrom: currentSelflet?.element,
        elementTo: boundary.suggestedElement ?? detectionInput.elementalShift?.to,
        phaseFrom: currentSelflet?.phase,
        phaseTo: boundary.suggestedPhase,
        intensity: boundary.strength,
        continuityScoreBefore: currentSelflet?.continuityScore,
        signal: {
          type: boundary.type,
          trigger: boundary.trigger,
          strength: boundary.strength,
          requiresConfirmation: boundary.requiresConfirmation,
          suggestedElement: boundary.suggestedElement,
          suggestedArchetypes: boundary.suggestedArchetypes,
        },
        inputExcerpt: input.userMessage,
        assistantExcerpt: input.assistantResponse,
      });
    } catch (err) {
      console.log('[SELFLET] Failed to persist boundary event (non-fatal):', err);
    }

    // Generate prompts if confirmation needed
    let confirmationPrompt: string | undefined;
    let metamorphosisPrompt: string | undefined;

    if (boundary.requiresConfirmation) {
      confirmationPrompt = selfletBoundaryDetector.generateConfirmationPrompt(boundary);
    }

    // Check for metamorphosis
    if (detectionInput.elementalShift && currentSelflet) {
      const symbol = await import('./types').then(m =>
        m.getMetamorphosisSymbol(currentSelflet.element, detectionInput.elementalShift!.to)
      );
      metamorphosisPrompt = selfletBoundaryDetector.generateMetamorphosisPrompt(
        currentSelflet.element,
        detectionInput.elementalShift.to,
        symbol
      );
    }

    // Phase 2C: Create message on major/metamorphosis boundaries
    // Uses 'letter' type (valid per CHECK constraint: letter|symbolic_state|future_projection|wisdom_seed)
    if ((boundaryKind === 'major' || boundaryKind === 'metamorphosis') && currentSelflet) {
      try {
        await selfletChain.createSelfletMessage({
          fromSelfletId: currentSelflet.id,
          messageType: 'letter',  // boundaryKind stored in deliveryContext
          title: `${boundary.type} insight: ${boundary.trigger}`,
          content: `At this moment of ${boundary.type}, I wanted to preserve this: ${input.assistantResponse.slice(0, 500)}...`,
          relevanceThemes: input.currentThemes,
          ritualTrigger: null,
          deliveryContext: {
            boundaryKind,
            boundaryStrength: boundary.strength,
            element: currentSelflet.element,
            phase: currentSelflet.phase,
          },
        });
        console.log(`[SELFLET] 📝 Created ${boundaryKind} message from selflet ${currentSelflet.id}`);
      } catch (msgErr) {
        console.log('[SELFLET] Failed to create boundary message (non-fatal):', msgErr);
      }
    }

    // Note: Reinterpretation now written earlier (before boundary detection) via auto_delivery origin

    return {
      boundaryDetected: true,
      boundarySignal: boundary,
      confirmationPrompt,
      metamorphosisPrompt,
    };
  } catch (error) {
    console.log('[SELFLET] Post-response processing error:', error);
    return { boundaryDetected: false };
  }
}

// ═══════════════════════════════════════════════════════════════
// SELFLET CREATION (called when user confirms transition)
// ═══════════════════════════════════════════════════════════════

export interface CreateSelfletFromSignalInput {
  userId: string;
  signal: BoundarySignal;
  essenceSummary?: string;
  dominantEmotions?: string[];
}

/**
 * Create a new selflet based on a confirmed boundary signal
 * Called when user confirms a transition
 */
export async function createSelfletFromSignal(
  input: CreateSelfletFromSignalInput
): Promise<void> {
  try {
    const { userId, signal, essenceSummary, dominantEmotions } = input;

    // Determine element and archetypes
    const currentSelflet = await selfletChain.getCurrentSelflet(userId);

    const element = signal.suggestedElement ?? currentSelflet?.element ?? 'earth';
    const archetypes = signal.suggestedArchetypes ?? currentSelflet?.archetypes ?? ['Explorer'];
    const phase = signal.suggestedPhase ?? `${element.charAt(0).toUpperCase() + element.slice(1)} 1`;

    await selfletChain.createSelflet({
      userId,
      phase,
      element,
      archetypes,
      dominantEmotions,
      essenceSummary: essenceSummary ?? `${signal.type} transition: ${signal.trigger}`,
    });

    console.log(`[SELFLET] ✅ New selflet created: ${phase} (${element})`);
  } catch (error) {
    console.error('[SELFLET] Failed to create selflet:', error);
  }
}

// ═══════════════════════════════════════════════════════════════
// MESSAGE HELPERS
// ═══════════════════════════════════════════════════════════════

/**
 * Record a future-self message from user
 */
export async function recordFutureSelfMessage(
  userId: string,
  content: string,
  options?: {
    title?: string;
    symbolicObjects?: string[];
    ritualTrigger?: string;
    relevanceThemes?: string[];
  }
): Promise<void> {
  await selfletRituals.recordFutureSelfMessage(
    userId,
    content,
    options?.title,
    options?.symbolicObjects,
    options?.ritualTrigger,
    options?.relevanceThemes
  );
}

/**
 * Mark a reflection message as delivered and record interpretation
 */
export async function completeReflection(
  messageId: string,
  interpretation?: string
): Promise<void> {
  await selfletChain.markMessageDelivered(messageId, interpretation);
}

/**
 * Record user's reinterpretation of a past-self message
 */
export async function recordReinterpretation(
  userId: string,
  sourceSelfletId: string,
  interpretation: string,
  emotionalResonance?: string,
  sourceMessageId?: string
): Promise<void> {
  const currentSelflet = await selfletChain.getCurrentSelflet(userId);
  if (!currentSelflet) return;

  await selfletChain.recordReinterpretation({
    interpretingSelfletId: currentSelflet.id,
    sourceSelfletId,
    sourceMessageId,
    interpretation,
    emotionalResonance,
  });
}

// ═══════════════════════════════════════════════════════════════
// INITIALIZATION HELPER
// ═══════════════════════════════════════════════════════════════

/**
 * Ensure user has at least one selflet (create initial if needed)
 * Call this on first meaningful interaction with a new user
 */
export async function ensureInitialSelflet(
  userId: string,
  options?: {
    element?: Element;
    archetypes?: string[];
    essenceSummary?: string;
  }
): Promise<void> {
  try {
    const existing = await selfletChain.getCurrentSelflet(userId);
    if (existing) return; // Already has a selflet

    // Create initial selflet
    await selfletChain.createSelflet({
      userId,
      phase: `${(options?.element ?? 'earth').charAt(0).toUpperCase() + (options?.element ?? 'earth').slice(1)} 1`,
      element: options?.element ?? 'earth',
      archetypes: options?.archetypes ?? ['Explorer'],
      essenceSummary: options?.essenceSummary ?? 'Beginning of the journey',
    });

    console.log(`[SELFLET] ✅ Initial selflet created for ${userId}`);
  } catch (error) {
    // Graceful - tables may not exist yet
    console.log('[SELFLET] Could not ensure initial selflet:', error);
  }
}
