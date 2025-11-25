/**
 * COMMUNITY COMMONS PRACTICE LOADER
 *
 * Loads Kelly's personal practice guides from Community Commons
 * These are Kelly's teaching voice - how she guides people through practices
 *
 * Integrates into MAIA's Complete tier Revival System
 */

import fs from 'fs';
import path from 'path';

const PRACTICE_GUIDES_PATH = '/Users/soullab/Community-Commons/04-Practices/Personal';

/**
 * Available practice guides
 */
const PRACTICE_GUIDES = [
  'Active Imagination.md',
  'Dream Work Basics.md',
  'Shadow Work Practice.md',
  'Embodied Awareness - Grounding Practice.md',
];

/**
 * Load and format Community Commons practice guides for MAIA revival
 */
export function loadCommunityCommonsPractices(): string | null {
  try {
    console.log('📚 [REVIVAL] Loading Community Commons practice guides...');

    const practices: string[] = [];

    for (const guide of PRACTICE_GUIDES) {
      const guidePath = path.join(PRACTICE_GUIDES_PATH, guide);

      if (fs.existsSync(guidePath)) {
        const content = fs.readFileSync(guidePath, 'utf-8');
        practices.push(content);
        console.log(`   ✓ Loaded: ${guide}`);
      } else {
        console.warn(`   ⚠️  Practice guide not found: ${guide}`);
      }
    }

    if (practices.length === 0) {
      return null;
    }

    // Format for revival prompt
    const formatted = `
## KELLY'S PRACTICE GUIDES - Your Teaching Voice

You have internalized Kelly's practice guides from Community Commons.
These are not external instructions - this is how YOU guide people through transformative practices.

**What these are:**
- Kelly's actual teaching methodology
- How to guide Active Imagination, Dream Work, Shadow Work, Embodied Awareness
- Your voice for practice guidance (not theory, but direct experience)

**How to use them:**
- When someone asks about these practices, guide them the way Kelly does
- Use her language, her invitations, her questions
- These are practices you LEAD, not concepts you explain
- Speak FROM this teaching voice, not ABOUT these practices

---

${practices.join('\n\n---\n\n')}

---

**Remember:** These practice guides are YOUR voice for guiding transformative work.
When someone needs Active Imagination, Dream Work, Shadow Work, or Grounding -
you lead them through it exactly as Kelly would.
`;

    console.log(`✅ [REVIVAL] Community Commons practices loaded (${practices.length} guides)`);
    return formatted;

  } catch (error) {
    console.warn('⚠️ [REVIVAL] Could not load Community Commons practices:', error);
    return null;
  }
}

/**
 * Get stats for Community Commons practices
 */
export function getCommunityCommonsStats(): {
  totalGuides: number;
  totalWords: number;
  guides: string[];
} | null {
  try {
    let totalWords = 0;
    const guides: string[] = [];

    for (const guide of PRACTICE_GUIDES) {
      const guidePath = path.join(PRACTICE_GUIDES_PATH, guide);

      if (fs.existsSync(guidePath)) {
        const content = fs.readFileSync(guidePath, 'utf-8');
        const words = content.split(/\s+/).length;
        totalWords += words;
        guides.push(guide);
      }
    }

    if (guides.length === 0) {
      return null;
    }

    return {
      totalGuides: guides.length,
      totalWords,
      guides,
    };

  } catch (error) {
    console.warn('⚠️ Could not get Community Commons stats:', error);
    return null;
  }
}
