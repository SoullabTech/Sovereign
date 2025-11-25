/**
 * MAIA INSIGHTS LOADER
 *
 * Loads the accumulating insights file that Kelly can edit directly.
 * No coding required - just edit MAIA_INSIGHTS.md like a journal.
 */

import fs from 'fs';
import path from 'path';

const INSIGHTS_PATH = path.join(process.cwd(), 'MAIA_INSIGHTS.md');

/**
 * Load MAIA's accumulating insights
 * Returns empty string if file doesn't exist (graceful degradation)
 */
export function loadMaiaInsights(): string {
  try {
    if (!fs.existsSync(INSIGHTS_PATH)) {
      console.log('ℹ️  [INSIGHTS] No insights file found yet');
      return '';
    }

    const content = fs.readFileSync(INSIGHTS_PATH, 'utf-8');
    const wordCount = content.split(/\s+/).length;

    console.log(`✅ [INSIGHTS] Loaded accumulating insights: ${wordCount} words`);

    return `
---

# MAIA EMERGING INSIGHTS - Living Knowledge

These are insights that have accumulated through practice. This is your living edge -
what you're learning through actual conversations, refinements, and discoveries.

${content}

---
`;
  } catch (error) {
    console.warn('⚠️  [INSIGHTS] Could not load insights file:', error);
    return '';
  }
}

/**
 * Get insights statistics
 */
export function getInsightsStats(): {
  exists: boolean;
  wordCount: number;
  estimatedTokens: number;
} {
  try {
    if (!fs.existsSync(INSIGHTS_PATH)) {
      return { exists: false, wordCount: 0, estimatedTokens: 0 };
    }

    const content = fs.readFileSync(INSIGHTS_PATH, 'utf-8');
    const wordCount = content.split(/\s+/).filter(w => w.length > 0).length;

    return {
      exists: true,
      wordCount,
      estimatedTokens: Math.ceil(wordCount * 1.3)
    };
  } catch (error) {
    return { exists: false, wordCount: 0, estimatedTokens: 0 };
  }
}
