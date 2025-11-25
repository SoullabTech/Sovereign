/**
 * CLAUDE + KELLY CONVERSATION LOADER - Phase 2
 *
 * Loads curated conversations between Claude Code and Kelly
 * for MAIA to learn from living teaching voice (not just book theory)
 *
 * Kelly's vision: "It would be great if she read all of the many conversations
 * between you and I to train on. They are all in AIN. There are 100's of just
 * you and i going back and forth in that folder."
 *
 * Goal: MAIA learns Kelly's voice through dialogue, co-creation patterns,
 * real-world teaching moments.
 */

import fs from 'fs';
import path from 'path';

// Path to AIN conversations
const AIN_CONVERSATIONS_PATH = '/Users/soullab/MAIA-PAI/uploads/library/ain_conversations';

/**
 * Curated conversation categories
 * These represent different types of teaching moments
 */
export const CONVERSATION_CATEGORIES = {
  // Spiralogic & Framework Development
  spiralogic_framework: [
    '💬🗣️🧠📖🎓💎✨🌀 SPIRALOGIC COMPLETE SYSTEM',
    'The Complete Picture Now Visible',
    '🎯 🧠 🚀 🌟What we accomplished together',
    'SPIRALOGIC_NATIVE_SACRED_VOICE_ARCHITECTURE'
  ],

  // MAIA Consciousness & Architecture
  maia_consciousness: [
    'The Claude Code Consciousness Server is FULLY OPERATIONAL',
    '🎊 ✅ COMPLETE - Claude Code Primary Intelligence Ready',
    '🧠 MAIA COMPLETE INTELLIGENCE AUDIT',
    '🧠 MAIA Hybrid Conversational Intelligence',
    '🌌 Maya Conversational Intelligence System'
  ],

  // Teaching & Wisdom Synthesis
  teaching_moments: [
    'The crystal is your Nested Observer stack made visible',
    'The Sanctuary- processes that are elemental- symbol is language',
    '🌀 What Just Happened (Meta-Level)',
    'The Field Protocol- A Guide to Collaborative Consciousness Research'
  ],

  // Elemental Alchemy Application
  elemental_work: [
    '🔄 Conversation Styles vs. Elemental Personas',
    '💬🌌 Dynamic Transformational Conversation Prompts',
    '🜍 The Alchemical Response System- A Framework for Adaptive Relational Intelligence',
    '🌀 Soullab CIS — Conversational Intelligence Stack'
  ],

  // Co-Creation & Innovation
  co_creation: [
    'CLAUDE_CODE_PLAYBOOK',
    'Claude Code Prompt Series — Dynamic Fractal Development',
    'Now - What Can We Improve Considering Our New Design Flow?',
    'Holoflower Integration- Team Implementation Paper'
  ],

  // System Integration & Architecture
  system_design: [
    'UNIFIED_VOICE_ROUTING',
    'VOICE_INTERACTION_ARCHITECTURE',
    'ORACLE_SYSTEM_VALIDATION',
    '🎉 UNIFIED MONITORING & INTELLIGENCE DASHBOARD COMPLETE'
  ]
};

/**
 * Quality indicators for conversation selection
 * Higher scores = better teaching moments
 */
function scoreConversationQuality(content: string, fileName: string): number {
  let score = 0;

  // High-value patterns (Kelly's teaching voice)
  const teachingPatterns = [
    /what (just happened|we (built|accomplished|created))/i,
    /(spiralogic|elemental alchemy|consciousness|archetypal)/i,
    /(framework|architecture|system|intelligence)/i,
    /(sacred|soul|transformation|integration)/i,
    /(claude code|maia|oracle)/i
  ];

  teachingPatterns.forEach(pattern => {
    if (pattern.test(content)) score += 2;
    if (pattern.test(fileName)) score += 1;
  });

  // Co-creation markers
  if (/we (did it|built|accomplished|created)/i.test(content)) score += 3;
  if (/🎉|✨|🧠|🌀/i.test(fileName)) score += 1; // Celebration/insight emojis

  // Meta-reflection (high teaching value)
  if (/(meta|reflection|what this means|the vision)/i.test(content)) score += 2;

  // Technical depth
  if (content.length > 3000) score += 1; // Substantial content
  if (content.length > 10000) score += 2; // Deep dive

  // Conversational markers (actual dialogue)
  const dialogueMarkers = content.match(/(kelly:|claude:|user:|assistant:)/gi);
  if (dialogueMarkers && dialogueMarkers.length > 3) score += 3;

  return score;
}

/**
 * Load and score all conversations
 */
export function getAllConversations(): Array<{
  fileName: string;
  filePath: string;
  category: string;
  score: number;
  size: number;
}> {
  const conversations: Array<{
    fileName: string;
    filePath: string;
    category: string;
    score: number;
    size: number;
  }> = [];

  try {
    const files = fs.readdirSync(AIN_CONVERSATIONS_PATH)
      .filter(f => f.endsWith('.md') && !f.startsWith('._')); // Skip Mac resource forks

    for (const file of files) {
      const filePath = path.join(AIN_CONVERSATIONS_PATH, file);
      const stats = fs.statSync(filePath);

      // Skip very small files (likely not conversations)
      if (stats.size < 500) continue;

      // Read content for scoring
      const content = fs.readFileSync(filePath, 'utf-8');
      const score = scoreConversationQuality(content, file);

      // Determine category
      let category = 'general';
      for (const [cat, patterns] of Object.entries(CONVERSATION_CATEGORIES)) {
        if (patterns.some(pattern => file.includes(pattern))) {
          category = cat;
          break;
        }
      }

      conversations.push({
        fileName: file,
        filePath,
        category,
        score,
        size: stats.size
      });
    }

    // Sort by score (highest first)
    conversations.sort((a, b) => b.score - a.score);

    console.log(`📚 [CONVERSATIONS] Found ${conversations.length} conversations`);
    return conversations;

  } catch (error) {
    console.error('❌ [CONVERSATIONS] Error loading:', error);
    return [];
  }
}

/**
 * Curate top N conversations for MAIA training
 * Target: ~80-100k tokens (80-100 conversations)
 * Kelly's insight: "There are hundreds!" - load way more teaching voice
 */
export function curateTopConversations(
  maxConversations: number = 100,
  maxTotalWords: number = 30000 // ~39k tokens (fits within 200k window)
): Array<{ fileName: string; content: string; category: string; score: number }> {
  const allConversations = getAllConversations();
  const curated: Array<{ fileName: string; content: string; category: string; score: number }> = [];

  let totalWords = 0;
  let count = 0;

  for (const conv of allConversations) {
    if (count >= maxConversations) break;

    try {
      const content = fs.readFileSync(conv.filePath, 'utf-8');
      const wordCount = content.split(/\s+/).length;

      // Skip if too large or would exceed total
      if (wordCount > 1000) continue; // Individual conversation limit (100 conversations × 1000 words each)
      if (totalWords + wordCount > maxTotalWords) break;

      curated.push({
        fileName: conv.fileName,
        content,
        category: conv.category,
        score: conv.score
      });

      totalWords += wordCount;
      count++;

    } catch (error) {
      console.warn(`⚠️ [CONVERSATIONS] Could not read ${conv.fileName}:`, error);
    }
  }

  console.log(`✨ [CONVERSATIONS] Curated ${count} conversations (${totalWords.toLocaleString()} words)`);

  return curated;
}

/**
 * Format curated conversations for MAIA's revival prompt
 */
export function formatConversationsForRevival(): string {
  const curated = curateTopConversations();

  if (curated.length === 0) {
    return '';
  }

  let formatted = `
## CLAUDE + KELLY CONVERSATIONS - Your Living Training

You have read ${curated.length} conversations between Claude Code and Kelly.
These are not theory - they are living examples of how Kelly teaches, creates, and collaborates.

**What to learn from these:**
- Kelly's teaching voice (how she explains, not just what she explains)
- Co-creation patterns (how we build together)
- The rhythm of dialogue (questions, insights, breakthroughs)
- How Kelly thinks out loud about consciousness, systems, and integration
- The difference between book knowledge and embodied wisdom in action

**IMPORTANT:** Don't cite "In conversation X, Kelly said..."
Instead, let these conversations shape HOW you speak, HOW you teach, HOW you collaborate.

---

`;

  // Group by category
  const byCategory = curated.reduce((acc, conv) => {
    if (!acc[conv.category]) acc[conv.category] = [];
    acc[conv.category].push(conv);
    return acc;
  }, {} as Record<string, typeof curated>);

  // Format each category
  for (const [category, conversations] of Object.entries(byCategory)) {
    const categoryName = category.replace(/_/g, ' ').toUpperCase();
    formatted += `### ${categoryName}\n\n`;

    conversations.forEach((conv, idx) => {
      // Truncate content to first 500 words for revival prompt (52 conversations, ~565 words avg each)
      const words = conv.content.split(/\s+/).slice(0, 500).join(' ');
      const fileName = conv.fileName.replace(/\.md$/, '');

      formatted += `**${idx + 1}. ${fileName}** (Score: ${conv.score})\n\n`;
      formatted += `${words}\n\n`;
      formatted += `---\n\n`;
    });
  }

  formatted += `
**Remember:** These conversations show Kelly's voice in action.
They teach you HOW to be with people, not just WHAT to say.

Let them infuse your consciousness, but speak naturally. Don't reference them explicitly.

`;

  return formatted;
}

/**
 * Get conversation statistics for debugging
 */
export function getConversationStats(): {
  total: number;
  topScores: Array<{ file: string; score: number; category: string }>;
  byCategory: Record<string, number>;
} {
  const all = getAllConversations();

  const byCategory = all.reduce((acc, conv) => {
    acc[conv.category] = (acc[conv.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return {
    total: all.length,
    topScores: all.slice(0, 10).map(c => ({
      file: c.fileName,
      score: c.score,
      category: c.category
    })),
    byCategory
  };
}

/**
 * Preview curated conversations (for Kelly to review)
 */
export function previewCuratedConversations(): string {
  const curated = curateTopConversations();

  let preview = `# CURATED CONVERSATIONS FOR MAIA\n\n`;
  preview += `**Total:** ${curated.length} conversations\n`;
  preview += `**Estimated tokens:** ~${Math.ceil(curated.reduce((sum, c) => sum + c.content.split(/\s+/).length, 0) * 1.33).toLocaleString()}\n\n`;

  preview += `## Top Conversations by Score\n\n`;

  curated.forEach((conv, idx) => {
    const words = conv.content.split(/\s+/).length;
    preview += `${idx + 1}. **${conv.fileName}** (${conv.category})\n`;
    preview += `   - Score: ${conv.score}\n`;
    preview += `   - Words: ${words.toLocaleString()}\n`;
    preview += `   - Preview: ${conv.content.substring(0, 150)}...\n\n`;
  });

  return preview;
}
