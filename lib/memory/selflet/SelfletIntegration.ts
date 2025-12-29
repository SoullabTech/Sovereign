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
}

/**
 * Load selflet context for a user
 * Call this early in the chat route, after identity resolution
 */
export async function loadSelfletContext(
  userId: string,
  currentThemes?: string[],
  userMessage?: string
): Promise<SelfletLoadResult> {
  try {
    // Build base context
    const context = await selfletChain.buildContext(userId);

    // Generate prompt injection for MAIA
    const promptInjection = selfletRituals.generatePromptContext(
      context.currentSelflet,
      context.pendingMessages,
      context.recentMetamorphosis
    );

    // Check if we should surface a reflection
    let pendingReflection: ReflectionPrompt | null = null;
    let shouldSurfaceReflection = false;

    // Phase 2C: Track surfaced message for delivery marking
    let surfacedMessageId: string | undefined;
    let surfacedDeliveryContext: Record<string, unknown> | undefined;

    if (userMessage && context.pendingMessages.length > 0) {
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
    }

    // Phase 2C: Fetch pending message by theme relevance (if themes provided)
    if (currentThemes && currentThemes.length > 0) {
      const pendingMsg = await selfletChain.getPendingMessageForContext({
        userId,
        currentThemes,
        limit: 1,
      });
      if (pendingMsg) {
        surfacedMessageId = pendingMsg.id;
        surfacedDeliveryContext = {
          messageTitle: pendingMsg.title,
          messageType: pendingMsg.messageType,
          fromSelfletId: pendingMsg.fromSelfletId,
          relevanceThemes: pendingMsg.relevanceThemes,
          surfacedAt: new Date().toISOString(),
        };
        console.log(`[SELFLET] 📬 Surfacing pending message: ${pendingMsg.title} (${pendingMsg.id})`);
      }
    }

    return {
      context,
      promptInjection,
      pendingReflection,
      shouldSurfaceReflection,
      surfacedMessageId,
      surfacedDeliveryContext,
    };
  } catch (error) {
    // Graceful degradation - selflet system is optional
    console.log('[SELFLET] Could not load context (table may not exist):', error);
    return {
      context: null,
      promptInjection: '',
      pendingReflection: null,
      shouldSurfaceReflection: false,
    };
  }
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

    // Detect boundary
    const boundary = await selfletBoundaryDetector.detectBoundary(detectionInput);

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

    // Phase 2C: Mark surfaced message as delivered + store reinterpretation
    if (input.surfacedSelfletMessageId) {
      try {
        // Mark the message as delivered
        await selfletChain.markMessageDeliveredById({
          messageId: input.surfacedSelfletMessageId,
          deliveryContext: {
            ...(input.surfacedDeliveryContext || {}),
            deliveredAt: new Date().toISOString(),
            assistantResponseExcerpt: input.assistantResponse.slice(0, 300),
          },
        });

        // Insert a basic reinterpretation record
        await selfletChain.insertReinterpretationFromDelivery({
          messageId: input.surfacedSelfletMessageId,
          userId,
          interpretation: `Message surfaced during: ${boundary.trigger}`,
          integrationDepth: boundary.strength,
          emotionalResonance: input.emotionalShift?.to ?? null,
          translationNotes: null,
        });
        console.log(`[SELFLET] ✅ Marked message ${input.surfacedSelfletMessageId} as delivered`);
      } catch (deliveryErr) {
        console.log('[SELFLET] Failed to mark message delivered (non-fatal):', deliveryErr);
      }
    }

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
