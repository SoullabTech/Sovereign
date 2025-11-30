/**
 * Oracle Orchestrator
 * The unified entry point for all Oracle interactions
 * Maintains single coherent presence across all subsystems
 */

import { collectClaims, CollectionContext, validateContext, enrichContext } from './collectClaims';
import { OrchestrationDecision, applyConfidenceGovernor } from './priorityResolver';
import { ElementalArchetype } from '../../../web/lib/types/elemental';
import { logger } from '../utils/logger';

export interface OracleIdentity {
  chosenName: string;           // "Maya", "Anthony", or user-defined
  coreEssence: 'witness';       // Always the witness paradigm
  voiceConsistency: number;     // 0-1 how consistent the voice remains
}

export interface OracleSession {
  sessionId: string;
  userId: string;
  startTime: Date;
  exchangeCount: number;
  currentElement: ElementalArchetype;
  depth: 'surface' | 'moderate' | 'deep';
  conversationHistory: ConversationEntry[];
  activeProtocols: Set<string>;
  lastActivity: Date;
}

export interface ConversationEntry {
  role: 'user' | 'oracle';
  content: string;
  timestamp: Date;
  metadata?: {
    subsystem?: string;
    element?: ElementalArchetype;
    confidence?: number;
  };
}

export interface OracleResponse {
  response: string;              // What the user sees
  metadata: {
    sessionId: string;
    exchangeNumber: number;
    leadingSystem: string;
    confidence: number;
    element: ElementalArchetype;
    processingTime: number;
  };
}

export interface OrchestratorConfig {
  identity: OracleIdentity;
  monitoringEnabled?: boolean;
  confidenceThreshold?: number;  // Minimum confidence for non-witness responses
  maxHistoryLength?: number;     // Max conversation entries to keep
  sessionTimeout?: number;       // Session timeout in milliseconds
}

/**
 * Main Orchestrator Class
 */
export class OracleOrchestrator {
  private identity: OracleIdentity;
  private sessions: Map<string, OracleSession> = new Map();
  private monitoring: boolean;
  private confidenceThreshold: number;
  private maxHistoryLength: number;
  private sessionTimeout: number;

  constructor(config: OrchestratorConfig) {
    this.identity = config.identity;
    this.monitoring = config.monitoringEnabled ?? true;
    this.confidenceThreshold = config.confidenceThreshold ?? 0.4;
    this.maxHistoryLength = config.maxHistoryLength ?? 100;
    this.sessionTimeout = config.sessionTimeout ?? 3600000; // 1 hour default

    // Start session cleanup interval
    this.startSessionCleanup();

    logger.info(`Oracle Orchestrator initialized as ${this.identity.chosenName}`);
  }

  /**
   * Main entry point for handling user input
   */
  public async handleInput(
    userId: string,
    userInput: string,
    sessionId?: string
  ): Promise<OracleResponse> {
    const startTime = Date.now();

    try {
      // Get or create session
      const session = this.getOrCreateSession(userId, sessionId);

      // Build context for claim collection
      const context = this.buildContext(session, userInput);

      // Validate and enrich context
      if (!validateContext(context)) {
        throw new Error('Invalid context for orchestration');
      }
      const enrichedContext = enrichContext(context, userInput);

      // Collect claims from all subsystems
      const decision = await collectClaims(userInput, enrichedContext);

      // Apply confidence governor
      const finalDecision = applyConfidenceGovernor(decision, this.confidenceThreshold);

      // Apply identity wrapper
      const unifiedResponse = this.applyIdentity(finalDecision.response, session);

      // Update session
      this.updateSession(session, userInput, unifiedResponse, finalDecision);

      // Log if monitoring enabled
      if (this.monitoring) {
        this.logInteraction(userId, userInput, finalDecision, Date.now() - startTime);
      }

      // Return response
      return {
        response: unifiedResponse,
        metadata: {
          sessionId: session.sessionId,
          exchangeNumber: session.exchangeCount,
          leadingSystem: finalDecision.leader,
          confidence: finalDecision.confidence,
          element: session.currentElement,
          processingTime: Date.now() - startTime
        }
      };

    } catch (error) {
      logger.error('Error in Oracle orchestration:', error);

      // Fallback to safe witness response
      return {
        response: this.getSafetyResponse(),
        metadata: {
          sessionId: sessionId || 'error',
          exchangeNumber: 0,
          leadingSystem: 'safety',
          confidence: 1.0,
          element: ElementalArchetype.WATER,
          processingTime: Date.now() - startTime
        }
      };
    }
  }

  /**
   * Get or create session
   */
  private getOrCreateSession(userId: string, sessionId?: string): OracleSession {
    const id = sessionId || this.generateSessionId(userId);

    let session = this.sessions.get(id);

    if (!session) {
      session = {
        sessionId: id,
        userId,
        startTime: new Date(),
        exchangeCount: 0,
        currentElement: ElementalArchetype.WATER,
        depth: 'surface',
        conversationHistory: [],
        activeProtocols: new Set(),
        lastActivity: new Date()
      };
      this.sessions.set(id, session);

      logger.info(`New session created: ${id} for user: ${userId}`);
    } else {
      // Check if session is expired
      if (this.isSessionExpired(session)) {
        // Reset session but keep ID
        session.startTime = new Date();
        session.exchangeCount = 0;
        session.depth = 'surface';
        session.conversationHistory = [];
        session.activeProtocols.clear();

        logger.info(`Session reset due to timeout: ${id}`);
      }
    }

    session.lastActivity = new Date();
    return session;
  }

  /**
   * Build context for claim collection
   */
  private buildContext(session: OracleSession, userInput: string): CollectionContext {
    return {
      userId: session.userId,
      sessionId: session.sessionId,
      exchangeCount: session.exchangeCount,
      conversationHistory: session.conversationHistory.map(entry => ({
        role: entry.role,
        content: entry.content,
        timestamp: entry.timestamp
      })),
      currentElement: session.currentElement,
      depth: session.depth,
      userPreferences: {
        oracleName: this.identity.chosenName
      }
    };
  }

  /**
   * Apply identity consistency to response
   */
  private applyIdentity(response: string, session: OracleSession): string {
    // Ensure voice consistency
    const { chosenName } = this.identity;

    // Apply subtle personalization based on chosen name
    // This is simplified - in production would use more sophisticated voice modeling

    // For now, just ensure clean response without system artifacts
    let cleanResponse = response
      .replace(/^\s*Oracle:\s*/i, '')
      .replace(/^\s*Maya:\s*/i, '')
      .replace(/^\s*Anthony:\s*/i, '')
      .trim();

    // Optional: Add name prefix if configured
    // return `${chosenName}: ${cleanResponse}`;

    // Or return clean response without name
    return cleanResponse;
  }

  /**
   * Update session after interaction
   */
  private updateSession(
    session: OracleSession,
    userInput: string,
    response: string,
    decision: OrchestrationDecision
  ): void {
    // Add user input to history
    session.conversationHistory.push({
      role: 'user',
      content: userInput,
      timestamp: new Date()
    });

    // Add oracle response to history
    session.conversationHistory.push({
      role: 'oracle',
      content: response,
      timestamp: new Date(),
      metadata: {
        subsystem: decision.leader,
        confidence: decision.confidence,
        element: session.currentElement
      }
    });

    // Trim history if too long
    if (session.conversationHistory.length > this.maxHistoryLength) {
      session.conversationHistory = session.conversationHistory.slice(-this.maxHistoryLength);
    }

    // Update exchange count
    session.exchangeCount++;

    // Update depth based on exchange count
    if (session.exchangeCount < 2) {
      session.depth = 'surface';
    } else if (session.exchangeCount > 5) {
      session.depth = 'deep';
    } else {
      session.depth = 'moderate';
    }

    // Track active protocols
    session.activeProtocols.add(decision.leader);

    // Update elemental state if changed
    const elementalClaim = decision.log.claims.find(c => c.subsystem === 'elementalResonance');
    if (elementalClaim && elementalClaim.metadata?.elemental) {
      session.currentElement = elementalClaim.metadata.elemental as ElementalArchetype;
    }

    session.lastActivity = new Date();
  }

  /**
   * Log interaction for monitoring
   */
  private logInteraction(
    userId: string,
    input: string,
    decision: OrchestrationDecision,
    processingTime: number
  ): void {
    const logEntry = {
      timestamp: new Date().toISOString(),
      userId,
      inputLength: input.length,
      leader: decision.leader,
      confidence: decision.confidence,
      claimCount: decision.log.claims.length,
      processingTime,
      claims: decision.log.claims.map(c => ({
        subsystem: c.subsystem,
        confidence: c.confidence,
        priority: c.priority
      }))
    };

    logger.info('Oracle interaction:', logEntry);

    // Also log decision path for debugging
    if (decision.log.decisionPath.length > 0) {
      logger.debug('Decision path:', decision.log.decisionPath);
    }
  }

  /**
   * Get safety fallback response
   */
  private getSafetyResponse(): string {
    return "I'm here with you. Please share what feels right in this moment.";
  }

  /**
   * Generate session ID
   */
  private generateSessionId(userId: string): string {
    return `${userId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Check if session is expired
   */
  private isSessionExpired(session: OracleSession): boolean {
    const timeSinceActivity = Date.now() - session.lastActivity.getTime();
    return timeSinceActivity > this.sessionTimeout;
  }

  /**
   * Start session cleanup interval
   */
  private startSessionCleanup(): void {
    setInterval(() => {
      const now = Date.now();
      const expiredSessions: string[] = [];

      this.sessions.forEach((session, id) => {
        if (now - session.lastActivity.getTime() > this.sessionTimeout) {
          expiredSessions.push(id);
        }
      });

      expiredSessions.forEach(id => {
        this.sessions.delete(id);
        logger.info(`Session expired and removed: ${id}`);
      });

      if (expiredSessions.length > 0) {
        logger.info(`Cleaned up ${expiredSessions.length} expired sessions`);
      }
    }, 300000); // Clean up every 5 minutes
  }

  /**
   * Get session info (for debugging/monitoring)
   */
  public getSessionInfo(sessionId: string): OracleSession | undefined {
    return this.sessions.get(sessionId);
  }

  /**
   * Get all active sessions (for monitoring)
   */
  public getActiveSessions(): string[] {
    return Array.from(this.sessions.keys());
  }

  /**
   * Clear all sessions (for testing/reset)
   */
  public clearAllSessions(): void {
    this.sessions.clear();
    logger.info('All sessions cleared');
  }

  /**
   * Update identity (for name changes)
   */
  public updateIdentity(newName: string): void {
    const oldName = this.identity.chosenName;
    this.identity.chosenName = newName;
    logger.info(`Oracle identity updated: ${oldName} → ${newName}`);
  }
}

/**
 * Create singleton instance with default configuration
 */
export function createOracleOrchestrator(
  chosenName: string = 'Maya',
  config?: Partial<OrchestratorConfig>
): OracleOrchestrator {
  return new OracleOrchestrator({
    identity: {
      chosenName,
      coreEssence: 'witness',
      voiceConsistency: 0.95
    },
    ...config
  });
}

// Export singleton for convenience
export const defaultOrchestrator = createOracleOrchestrator();