/**
 * AIN v2 Learning Loop
 *
 * Post-turn learning that happens AFTER the conversation,
 * not during. This is how the system improves over time
 * without becoming scripted.
 *
 * Key principle: Learning is curation, not auto-routing.
 */

import { insertOne, query } from '@/lib/db/postgres';
import type {
  TurnLearning,
  LibrarianProposal,
  Council,
} from './types';

/**
 * Log a turn's learning data
 *
 * Called after each turn where council was consulted.
 * This creates the dataset the Librarian uses for improvement.
 */
export async function logTurnLearning(learning: TurnLearning): Promise<void> {
  try {
    await insertOne('ain_turn_learning', {
      session_id: learning.sessionId,
      turn_number: learning.turnNumber,
      timestamp: learning.timestamp.toISOString(),
      question: learning.question,
      council_consulted: learning.councilConsulted,
      framings_used: JSON.stringify(learning.framingsUsed),
      maia_response: learning.maiaResponse,
      insights_incorporated: JSON.stringify(learning.insightsIncorporated),
      insights_ignored: JSON.stringify(learning.insightsIgnored),
      member_reaction: learning.memberReaction,
      follow_up_tone: learning.followUpTone,
      what_worked: learning.whatWorked,
      what_missed: learning.whatMissed,
    });

    console.log(`[AIN Learning] Logged turn ${learning.turnNumber} for session ${learning.sessionId.slice(0, 8)}...`);
  } catch (err) {
    console.error('[AIN Learning] Failed to log turn:', err);
    // Non-blocking - don't break conversation flow
  }
}

/**
 * Get recent learning records for analysis
 */
export async function getRecentLearnings(options: {
  days?: number;
  limit?: number;
  council?: Council;
}): Promise<TurnLearning[]> {
  const { days = 7, limit = 1000, council } = options;

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);

  let sql = `
    SELECT * FROM ain_turn_learning
    WHERE timestamp >= $1
  `;
  const params: any[] = [cutoff.toISOString()];

  if (council) {
    sql += ` AND council_consulted = $2`;
    params.push(council);
  }

  sql += ` ORDER BY timestamp DESC LIMIT $${params.length + 1}`;
  params.push(limit);

  try {
    const rows = await query(sql, params);
    return rows.map(row => ({
      sessionId: row.session_id,
      turnNumber: row.turn_number,
      timestamp: new Date(row.timestamp),
      question: row.question,
      councilConsulted: row.council_consulted,
      framingsUsed: JSON.parse(row.framings_used || '[]'),
      maiaResponse: row.maia_response,
      insightsIncorporated: JSON.parse(row.insights_incorporated || '[]'),
      insightsIgnored: JSON.parse(row.insights_ignored || '[]'),
      memberReaction: row.member_reaction,
      followUpTone: row.follow_up_tone,
      whatWorked: row.what_worked,
      whatMissed: row.what_missed,
    }));
  } catch (err) {
    console.error('[AIN Learning] Failed to fetch learnings:', err);
    return [];
  }
}

/**
 * Analyze patterns in learning data
 */
export interface LearningPatterns {
  // Framing effectiveness
  framingEffectiveness: Record<string, number>; // framing -> incorporation rate

  // Council usage
  councilUsage: Record<string, number>;         // council -> usage count

  // Member reactions
  reactionDistribution: {
    positive: number;
    neutral: number;
    negative: number;
    unknown: number;
  };

  // What's working
  topWorkingPatterns: string[];

  // What's missing
  missingPerspectives: string[];

  // Rupture patterns (when things went wrong)
  rupturePatterns: Array<{
    pattern: string;
    description: string;
    count: number;
  }>;
}

export function analyzePatterns(learnings: TurnLearning[]): LearningPatterns {
  const framingCounts: Record<string, { used: number; incorporated: number }> = {};
  const councilCounts: Record<string, number> = {};
  const reactions = { positive: 0, neutral: 0, negative: 0, unknown: 0 };
  const workingPatterns: Record<string, number> = {};
  const missedPerspectives: Record<string, number> = {};
  const ruptures: Array<{ pattern: string; description: string; count: number }> = [];

  for (const learning of learnings) {
    // Track framing effectiveness
    for (const framing of learning.framingsUsed) {
      if (!framingCounts[framing]) {
        framingCounts[framing] = { used: 0, incorporated: 0 };
      }
      framingCounts[framing].used++;

      if (learning.insightsIncorporated.some(i => i.toLowerCase().includes(framing))) {
        framingCounts[framing].incorporated++;
      }
    }

    // Track council usage
    if (learning.councilConsulted) {
      councilCounts[learning.councilConsulted] = (councilCounts[learning.councilConsulted] || 0) + 1;
    }

    // Track reactions
    reactions[learning.memberReaction]++;

    // Track what worked
    if (learning.whatWorked) {
      workingPatterns[learning.whatWorked] = (workingPatterns[learning.whatWorked] || 0) + 1;
    }

    // Track what was missed
    if (learning.whatMissed) {
      missedPerspectives[learning.whatMissed] = (missedPerspectives[learning.whatMissed] || 0) + 1;
    }

    // Detect rupture patterns (negative reaction + clear miss)
    if (learning.memberReaction === 'negative' && learning.whatMissed) {
      const existingRupture = ruptures.find(r => r.pattern === learning.whatMissed);
      if (existingRupture) {
        existingRupture.count++;
      } else {
        ruptures.push({
          pattern: learning.whatMissed,
          description: `${learning.councilConsulted || 'no-council'}: ${learning.whatMissed}`,
          count: 1,
        });
      }
    }
  }

  // Calculate effectiveness rates
  const framingEffectiveness: Record<string, number> = {};
  for (const [framing, counts] of Object.entries(framingCounts)) {
    framingEffectiveness[framing] = counts.used > 0
      ? counts.incorporated / counts.used
      : 0;
  }

  // Find top working patterns
  const topWorkingPatterns = Object.entries(workingPatterns)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([pattern]) => pattern);

  // Find missing perspectives
  const missingPerspectives = Object.entries(missedPerspectives)
    .filter(([_, count]) => count >= 2) // Only if missed multiple times
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([perspective]) => perspective);

  return {
    framingEffectiveness,
    councilUsage: councilCounts,
    reactionDistribution: reactions,
    topWorkingPatterns,
    missingPerspectives,
    rupturePatterns: ruptures.filter(r => r.count >= 2), // Only repeating ruptures
  };
}

/**
 * Save Librarian proposals for review
 */
export async function saveLibrarianProposals(
  proposals: LibrarianProposal[]
): Promise<void> {
  for (const proposal of proposals) {
    try {
      await insertOne('ain_librarian_proposals', {
        type: proposal.type,
        target: proposal.target,
        reason: proposal.reason,
        confidence: proposal.confidence,
        suggested_content: proposal.suggestedContent,
        evidence: proposal.evidence ? JSON.stringify(proposal.evidence) : null,
        status: 'pending',
        created_at: new Date().toISOString(),
      });
    } catch (err) {
      console.error('[AIN Librarian] Failed to save proposal:', err);
    }
  }
}

/**
 * Get pending Librarian proposals
 */
export async function getPendingProposals(): Promise<LibrarianProposal[]> {
  try {
    const rows = await query(
      `SELECT * FROM ain_librarian_proposals WHERE status = 'pending' ORDER BY confidence DESC`,
      []
    );

    return rows.map(row => ({
      type: row.type,
      target: row.target,
      reason: row.reason,
      confidence: row.confidence,
      suggestedContent: row.suggested_content,
      evidence: row.evidence ? JSON.parse(row.evidence) : undefined,
    }));
  } catch (err) {
    console.error('[AIN Librarian] Failed to fetch proposals:', err);
    return [];
  }
}

/**
 * Mark a proposal as reviewed
 */
export async function reviewProposal(
  target: string,
  decision: 'approved' | 'rejected' | 'deferred',
  notes?: string
): Promise<void> {
  try {
    await query(
      `UPDATE ain_librarian_proposals
       SET status = $1, reviewed_at = $2, review_notes = $3
       WHERE target = $4 AND status = 'pending'`,
      [decision, new Date().toISOString(), notes || null, target]
    );
  } catch (err) {
    console.error('[AIN Librarian] Failed to update proposal:', err);
  }
}

/**
 * Database migration SQL for learning tables
 */
export const LEARNING_MIGRATION_SQL = `
-- AIN Turn Learning
CREATE TABLE IF NOT EXISTS ain_turn_learning (
  id SERIAL PRIMARY KEY,
  session_id TEXT NOT NULL,
  turn_number INTEGER NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  question TEXT NOT NULL,
  council_consulted TEXT,
  framings_used JSONB DEFAULT '[]',
  maia_response TEXT,
  insights_incorporated JSONB DEFAULT '[]',
  insights_ignored JSONB DEFAULT '[]',
  member_reaction TEXT CHECK (member_reaction IN ('positive', 'neutral', 'negative', 'unknown')),
  follow_up_tone TEXT CHECK (follow_up_tone IN ('deepening', 'shifting', 'closing')),
  what_worked TEXT,
  what_missed TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ain_turn_learning_session ON ain_turn_learning(session_id);
CREATE INDEX IF NOT EXISTS idx_ain_turn_learning_timestamp ON ain_turn_learning(timestamp);
CREATE INDEX IF NOT EXISTS idx_ain_turn_learning_council ON ain_turn_learning(council_consulted);

-- AIN Librarian Proposals
CREATE TABLE IF NOT EXISTS ain_librarian_proposals (
  id SERIAL PRIMARY KEY,
  type TEXT NOT NULL,
  target TEXT NOT NULL,
  reason TEXT NOT NULL,
  confidence REAL NOT NULL DEFAULT 0.5,
  suggested_content TEXT,
  evidence JSONB,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'deferred')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_ain_librarian_proposals_status ON ain_librarian_proposals(status);
CREATE INDEX IF NOT EXISTS idx_ain_librarian_proposals_type ON ain_librarian_proposals(type);
`;
