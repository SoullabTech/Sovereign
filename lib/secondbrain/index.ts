/**
 * Second Brain System
 *
 * A personal knowledge management loop built on Nate B Jones's "8 Building Blocks":
 *
 * 1. Dropbox (capture) - Quick frictionless input
 * 2. Sorter (classify) - AI routes to correct bucket
 * 3. Form (schema) - YAML frontmatter structure
 * 4. Filing Cabinet (storage) - Obsidian vault
 * 5. Receipt (audit trail) - Inbox Log
 * 6. Bouncer (confidence filter) - Low confidence → needs_review
 * 7. Tap on Shoulder (surfacing) - Daily/weekly digests
 * 8. Fix Button (corrections) - Re-classify with hints
 *
 * Memory: Obsidian vault (local markdown + YAML)
 * Compute: MAIA/Claude (classify, extract, summarize)
 * Interface: CLI, voice, or direct API
 */

import { getObsidianClient, ObsidianRestClient } from '@/lib/obsidian/ObsidianRestClient';
import { classifyCapture, reclassify } from './secondBrainClassifier';
import {
  writeSecondBrainItem,
  writeRawCapture,
  writeDailyDigest,
  writeWeeklyReview,
  type SB_Classified,
  type SB_RawCapture,
  type SB_WriteResult,
  type SB_Source,
} from './secondBrainWriter';

// ═══════════════════════════════════════════════════════════════════════════════
// Main Capture Function (the complete loop)
// ═══════════════════════════════════════════════════════════════════════════════

export interface CaptureOptions {
  /** The raw text to capture */
  text: string;
  /** Where this capture came from */
  source?: SB_Source;
  /** Skip classification and write directly to inbox */
  skipClassification?: boolean;
  /** Custom confidence threshold (default 0.6) */
  confidenceThreshold?: number;
  /** Pre-initialized Obsidian client */
  obsidian?: ObsidianRestClient;
}

export interface CaptureResult {
  success: boolean;
  /** Where the note was filed */
  path: string;
  /** Whether it needs manual review */
  needsReview: boolean;
  /** The classified item (if classification succeeded) */
  classified?: SB_Classified;
  /** Error message (if failed) */
  error?: string;
}

/**
 * Capture a thought to your Second Brain
 *
 * This is the main entry point - it runs the full loop:
 * 1. Takes raw text input
 * 2. Classifies it with Claude
 * 3. Routes it to the correct folder
 * 4. Logs the action
 * 5. Returns the result
 *
 * Low-confidence items are held in the Inbox for review.
 */
export async function capture(opts: CaptureOptions): Promise<CaptureResult> {
  const obsidian = opts.obsidian ?? getObsidianClient();

  try {
    // Check Obsidian availability
    const isHealthy = await obsidian.healthCheck();
    if (!isHealthy) {
      return {
        success: false,
        path: '',
        needsReview: false,
        error: 'Obsidian Local REST API not available. Is Obsidian running with the plugin enabled?',
      };
    }

    // Skip classification if requested
    if (opts.skipClassification) {
      const path = await writeRawCapture({
        obsidian,
        capture: {
          text: opts.text,
          source: opts.source,
          captured_at: new Date(),
        },
      });

      return {
        success: true,
        path,
        needsReview: true,
      };
    }

    // Classify the capture
    const rawCapture: SB_RawCapture = {
      text: opts.text,
      source: opts.source,
      captured_at: new Date(),
    };

    const classified = await classifyCapture(rawCapture);

    // Write to vault
    const result = await writeSecondBrainItem({
      obsidian,
      item: classified,
      confidenceThreshold: opts.confidenceThreshold,
    });

    return {
      success: true,
      path: result.filedPath,
      needsReview: result.needsReview,
      classified,
    };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('❌ SecondBrain capture failed:', errorMessage);

    return {
      success: false,
      path: '',
      needsReview: false,
      error: errorMessage,
    };
  }
}

/**
 * Re-classify an existing item with a hint (the "Fix Button")
 */
export async function fix(opts: {
  text: string;
  hint: string;
  obsidian?: ObsidianRestClient;
}): Promise<CaptureResult> {
  const obsidian = opts.obsidian ?? getObsidianClient();

  try {
    const classified = await reclassify({
      text: opts.text,
      hint: opts.hint,
      source: 'manual',
    });

    const result = await writeSecondBrainItem({
      obsidian,
      item: classified,
    });

    return {
      success: true,
      path: result.filedPath,
      needsReview: result.needsReview,
      classified,
    };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      path: '',
      needsReview: false,
      error: errorMessage,
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// Re-exports
// ═══════════════════════════════════════════════════════════════════════════════

export {
  // Writer
  writeSecondBrainItem,
  writeRawCapture,
  writeDailyDigest,
  writeWeeklyReview,
  // Classifier
  classifyCapture,
  reclassify,
  // Client
  getObsidianClient,
  ObsidianRestClient,
  // Types
  type SB_Classified,
  type SB_RawCapture,
  type SB_WriteResult,
  type SB_Source,
};
