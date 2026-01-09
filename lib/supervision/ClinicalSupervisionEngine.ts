/**
 * MAIA Clinical Supervision Engine
 *
 * Analyzes clinical sessions using LOCAL LLM only (Ollama/DeepSeek).
 * HIPAA compliant - no PHI sent to external APIs.
 *
 * Analysis types:
 * - Pattern recognition (recurring themes, defense mechanisms)
 * - Countertransference detection (therapist emotional reactions)
 * - Intervention quality (timing, depth, attunement)
 * - Stuck point / rupture detection
 * - Documentation generation (SOAP notes)
 */

import { safeGenerateWithLocalModel, localModelHealthCheck } from '@/lib/ai/safe-local-model';
import {
  TranscriptSegment,
  SupervisionInsight,
  addInsight,
  getRecentTranscript
} from './SupervisionStore';

// Clinical supervision prompts - designed for local LLM processing
const CLINICAL_PROMPTS = {

  PATTERN_ANALYSIS: `You are a clinical supervisor analyzing a therapy session transcript.
Identify recurring patterns, themes, and dynamics. Focus on:
- Defense mechanisms (denial, projection, rationalization, etc.)
- Attachment patterns
- Relational dynamics
- Recurring themes or imagery
- Emotional regulation patterns

Transcript:
{{TRANSCRIPT}}

Provide 2-3 key patterns observed, with specific examples from the transcript.
Be concise and clinically specific.`,

  COUNTERTRANSFERENCE: `You are a clinical supervisor helping a therapist recognize countertransference.
Review this session transcript and identify moments where the therapist's responses may reflect:
- Personal emotional reactions to the client
- Over-identification or distancing
- Rescue fantasies or frustration
- Unresolved personal material being activated
- Boundary considerations

Transcript:
{{TRANSCRIPT}}

Identify 1-3 potential countertransference moments with gentle, supportive framing.
This is for the therapist's growth, not criticism.`,

  INTERVENTION_QUALITY: `You are a clinical supervisor assessing intervention quality.
Review this session and evaluate:
- Timing of interventions (premature, well-timed, delayed)
- Depth (surface vs. process-level)
- Attunement to client's emotional state
- Balance of support vs. challenge
- Missed opportunities

Transcript:
{{TRANSCRIPT}}

Provide specific feedback on 2-3 interventions with suggestions for alternatives where relevant.`,

  STUCK_POINT_DETECTION: `You are a clinical supervisor identifying therapeutic impasses.
Review this session for signs of:
- Stuck points or impasses
- Relationship ruptures (misattunements, disconnections)
- Circular patterns that aren't progressing
- Client resistance that may signal unmet needs
- Therapist-client misalignment

Transcript:
{{TRANSCRIPT}}

Identify any stuck points or ruptures observed, and suggest possible ways to address them.`,

  ATTUNEMENT_MOMENTS: `You are a clinical supervisor highlighting moments of therapeutic attunement.
Review this session for:
- Moments of deep connection
- Accurate empathic reflections
- Well-timed silence or presence
- Client feeling understood
- Meaningful therapeutic alliance moments

Transcript:
{{TRANSCRIPT}}

Identify 2-3 moments of strong attunement to reinforce what's working well.`,

  DOCUMENTATION: `You are a clinical supervisor helping with session documentation.
Create a brief SOAP note summary:

S (Subjective): Client's reported experience and concerns
O (Objective): Observable behaviors, affect, engagement
A (Assessment): Clinical impressions, progress, patterns
P (Plan): Interventions used, homework, next session focus

Transcript:
{{TRANSCRIPT}}

Keep the SOAP note concise (4-6 sentences per section).`
};

type InsightType = SupervisionInsight['insight_type'];

interface AnalysisResult {
  insightType: InsightType;
  content: string;
  significance: number;
  processingTimeMs: number;
  modelUsed: string;
}

/**
 * Clinical Supervision Engine
 * All analysis runs on local LLM - no external API calls
 */
export class ClinicalSupervisionEngine {
  private sessionId: string;

  constructor(sessionId: string) {
    this.sessionId = sessionId;
  }

  /**
   * Check if local LLM is available for clinical analysis
   */
  static async isAvailable(): Promise<boolean> {
    const health = await localModelHealthCheck();
    return health?.status === 'healthy';
  }

  /**
   * Format transcript segments for analysis
   */
  private formatTranscript(segments: TranscriptSegment[]): string {
    return segments.map(seg => {
      const timestamp = this.formatTimestamp(seg.start_ms);
      return `[${timestamp}] ${seg.speaker.toUpperCase()}: ${seg.text}`;
    }).join('\n');
  }

  private formatTimestamp(ms: number): string {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  /**
   * Run analysis with local LLM
   */
  private async runAnalysis(
    promptTemplate: string,
    transcript: string,
    insightType: InsightType
  ): Promise<AnalysisResult> {
    const startTime = Date.now();

    const prompt = promptTemplate.replace('{{TRANSCRIPT}}', transcript);

    const result = await safeGenerateWithLocalModel({
      systemPrompt: 'You are an experienced clinical supervisor providing thoughtful, supportive feedback.',
      userInput: prompt,
      fallbackToSimple: true
    });

    // Verify we're using local model (HIPAA requirement)
    if (result.source !== 'local-model' && result.source !== 'consciousness-engine') {
      console.warn('⚠️ [SUPERVISION] Non-local model used - this should not happen with PHI');
    }

    const processingTimeMs = Date.now() - startTime;

    // Estimate significance based on content length and keywords
    const significance = this.estimateSignificance(result.content, insightType);

    return {
      insightType,
      content: result.content,
      significance,
      processingTimeMs,
      modelUsed: result.source === 'local-model' ? 'deepseek-r1:latest' : result.source
    };
  }

  /**
   * Estimate insight significance (0-1)
   */
  private estimateSignificance(content: string, type: InsightType): number {
    let score = 0.5;

    // Boost for specific clinical terms
    const clinicalTerms = [
      'rupture', 'countertransference', 'defense', 'transference',
      'attachment', 'resistance', 'impasse', 'attunement'
    ];

    for (const term of clinicalTerms) {
      if (content.toLowerCase().includes(term)) {
        score += 0.1;
      }
    }

    // Boost for actionable insights
    if (content.includes('suggest') || content.includes('consider') || content.includes('opportunity')) {
      score += 0.1;
    }

    // Type-specific boosts
    if (type === 'rupture' || type === 'countertransference') {
      score += 0.1; // These are high-priority insights
    }

    return Math.min(score, 1.0);
  }

  /**
   * Analyze patterns in the session
   */
  async analyzePatterns(segments: TranscriptSegment[]): Promise<SupervisionInsight> {
    const transcript = this.formatTranscript(segments);
    const result = await this.runAnalysis(
      CLINICAL_PROMPTS.PATTERN_ANALYSIS,
      transcript,
      'pattern'
    );

    return addInsight({
      sessionId: this.sessionId,
      insightType: result.insightType,
      content: result.content,
      significance: result.significance,
      modelUsed: result.modelUsed,
      processingTimeMs: result.processingTimeMs,
      timeRangeStartMs: segments[0]?.start_ms,
      timeRangeEndMs: segments[segments.length - 1]?.end_ms
    });
  }

  /**
   * Detect countertransference
   */
  async analyzeCountertransference(segments: TranscriptSegment[]): Promise<SupervisionInsight> {
    const transcript = this.formatTranscript(segments);
    const result = await this.runAnalysis(
      CLINICAL_PROMPTS.COUNTERTRANSFERENCE,
      transcript,
      'countertransference'
    );

    return addInsight({
      sessionId: this.sessionId,
      insightType: result.insightType,
      content: result.content,
      significance: result.significance,
      modelUsed: result.modelUsed,
      processingTimeMs: result.processingTimeMs,
      timeRangeStartMs: segments[0]?.start_ms,
      timeRangeEndMs: segments[segments.length - 1]?.end_ms
    });
  }

  /**
   * Evaluate intervention quality
   */
  async analyzeInterventions(segments: TranscriptSegment[]): Promise<SupervisionInsight> {
    const transcript = this.formatTranscript(segments);
    const result = await this.runAnalysis(
      CLINICAL_PROMPTS.INTERVENTION_QUALITY,
      transcript,
      'intervention'
    );

    return addInsight({
      sessionId: this.sessionId,
      insightType: result.insightType,
      content: result.content,
      significance: result.significance,
      modelUsed: result.modelUsed,
      processingTimeMs: result.processingTimeMs,
      timeRangeStartMs: segments[0]?.start_ms,
      timeRangeEndMs: segments[segments.length - 1]?.end_ms
    });
  }

  /**
   * Detect stuck points and ruptures
   */
  async detectRuptures(segments: TranscriptSegment[]): Promise<SupervisionInsight> {
    const transcript = this.formatTranscript(segments);
    const result = await this.runAnalysis(
      CLINICAL_PROMPTS.STUCK_POINT_DETECTION,
      transcript,
      'stuck_point'
    );

    return addInsight({
      sessionId: this.sessionId,
      insightType: result.insightType,
      content: result.content,
      significance: result.significance,
      modelUsed: result.modelUsed,
      processingTimeMs: result.processingTimeMs,
      timeRangeStartMs: segments[0]?.start_ms,
      timeRangeEndMs: segments[segments.length - 1]?.end_ms
    });
  }

  /**
   * Highlight attunement moments
   */
  async analyzeAttunement(segments: TranscriptSegment[]): Promise<SupervisionInsight> {
    const transcript = this.formatTranscript(segments);
    const result = await this.runAnalysis(
      CLINICAL_PROMPTS.ATTUNEMENT_MOMENTS,
      transcript,
      'attunement'
    );

    return addInsight({
      sessionId: this.sessionId,
      insightType: result.insightType,
      content: result.content,
      significance: result.significance,
      modelUsed: result.modelUsed,
      processingTimeMs: result.processingTimeMs,
      timeRangeStartMs: segments[0]?.start_ms,
      timeRangeEndMs: segments[segments.length - 1]?.end_ms
    });
  }

  /**
   * Generate SOAP documentation
   */
  async generateDocumentation(segments: TranscriptSegment[]): Promise<SupervisionInsight> {
    const transcript = this.formatTranscript(segments);
    const result = await this.runAnalysis(
      CLINICAL_PROMPTS.DOCUMENTATION,
      transcript,
      'documentation'
    );

    return addInsight({
      sessionId: this.sessionId,
      insightType: result.insightType,
      content: result.content,
      significance: 0.8, // Documentation is always useful
      modelUsed: result.modelUsed,
      processingTimeMs: result.processingTimeMs,
      timeRangeStartMs: segments[0]?.start_ms,
      timeRangeEndMs: segments[segments.length - 1]?.end_ms
    });
  }

  /**
   * Run full analysis suite on session
   */
  async runFullAnalysis(segments: TranscriptSegment[]): Promise<SupervisionInsight[]> {
    console.log(`🔬 [SUPERVISION] Running full analysis on ${segments.length} segments`);

    const insights: SupervisionInsight[] = [];

    // Run analyses in parallel for speed
    const [patterns, countertransference, interventions, ruptures, attunement, documentation] = await Promise.all([
      this.analyzePatterns(segments),
      this.analyzeCountertransference(segments),
      this.analyzeInterventions(segments),
      this.detectRuptures(segments),
      this.analyzeAttunement(segments),
      this.generateDocumentation(segments)
    ]);

    insights.push(patterns, countertransference, interventions, ruptures, attunement, documentation);

    console.log(`✅ [SUPERVISION] Generated ${insights.length} insights`);

    return insights;
  }

  /**
   * Run incremental analysis on recent transcript (for real-time mode)
   * Called every 2 minutes during live session
   */
  async runIncrementalAnalysis(sinceMs: number): Promise<SupervisionInsight[]> {
    const recentSegments = await getRecentTranscript(this.sessionId, sinceMs);

    if (recentSegments.length < 3) {
      // Not enough new content to analyze
      return [];
    }

    console.log(`🔬 [SUPERVISION] Incremental analysis on ${recentSegments.length} new segments`);

    // For real-time, focus on high-priority analyses
    const insights: SupervisionInsight[] = [];

    // Always check for ruptures (time-sensitive)
    const ruptures = await this.detectRuptures(recentSegments);
    if (ruptures.significance && ruptures.significance > 0.6) {
      insights.push(ruptures);
    }

    // Check for countertransference
    const countertransference = await this.analyzeCountertransference(recentSegments);
    if (countertransference.significance && countertransference.significance > 0.5) {
      insights.push(countertransference);
    }

    // Highlight attunement (positive reinforcement)
    const attunement = await this.analyzeAttunement(recentSegments);
    insights.push(attunement);

    return insights;
  }
}

/**
 * Convenience function to run full post-session analysis
 */
export async function analyzeSession(sessionId: string, segments: TranscriptSegment[]): Promise<SupervisionInsight[]> {
  const engine = new ClinicalSupervisionEngine(sessionId);
  return engine.runFullAnalysis(segments);
}

/**
 * Convenience function for real-time incremental analysis
 */
export async function analyzeRecentActivity(sessionId: string, sinceMs: number): Promise<SupervisionInsight[]> {
  const engine = new ClinicalSupervisionEngine(sessionId);
  return engine.runIncrementalAnalysis(sinceMs);
}
