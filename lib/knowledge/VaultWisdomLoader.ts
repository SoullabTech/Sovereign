/**
 * VAULT WISDOM LOADER - Second Brain Access
 *
 * Gives MAIA conversational access to the AIN vault (2,744 markdown files + 53 PDFs)
 * Simple keyword-based retrieval without expensive semantic search
 *
 * Kelly's vision: "like a second brain" - accessible knowledge, not retrieval system
 */

import fs from 'fs';
import path from 'path';

// Vault locations - Updated to connect to live AIN Obsidian vault
const VAULT_PATHS = {
  // Live AIN vault with integrated tag system supporting MAIA
  ain_live: '/Users/soullab/Library/Mobile Documents/iCloud~md~obsidian/Documents/AIN',
  ain_maia_system: '/Users/soullab/Library/Mobile Documents/iCloud~md~obsidian/Documents/AIN/_MAIA_SYSTEM',

  // Soullab Dev Tools Obsidian vaults (multiple locations)
  soullab_main: '/Users/soullab/Library/Mobile Documents/iCloud~md~obsidian/Documents/Soullab',
  soullab_writing: '/Users/soullab/Library/Mobile Documents/iCloud~md~obsidian/Documents/Soullab Writing Vault',

  // MAIA Consciousness vault
  maia_consciousness: '/Users/soullab/Obsidian Vaults/MAIA-Consciousness',

  // Legacy paths (backup)
  ain_conversations: '/Users/soullab/MAIA-PAI/uploads/library/ain_conversations',
  spiralogic: '/Users/soullab/MAIA-PAI/uploads/library/spiralogic',

  // Additional AIN locations found
  ain_archive: '/Users/soullab/MAIA-ARCHIVE/MAIA-FRESH/AIN',
  ain_pai: '/Users/soullab/MAIA-ARCHIVE/SoullabTech/MAIA-PAI/AIN'
};

/**
 * Keyword map for different wisdom domains
 * These help MAIA find relevant vault materials based on conversation
 * Updated to include Kelly's book and new breakthrough insights
 */
const WISDOM_KEYWORDS = {
  // Kelly Nezat & Core Teachings
  kelly: ['kelly', 'kelly nezat', 'creator', 'founder'],
  elemental_alchemy_book: ['elemental alchemy', 'ancient art', 'phenomenal living', 'chapter 9', 'book'],

  // Spiralogic & Development (Kelly's 12-facet system)
  spiralogic: ['spiralogic', 'spiral', 'regression', 'progression', 'werner', 'developmental', 'chapter 9', '12 facet', '12-facet'],
  elemental: ['fire', 'water', 'earth', 'air', 'aether', 'element'],

  // Historic Breakthrough - Corpus Callosum & Temporal Orchestration
  breakthrough: ['historic breakthrough', 'corpus callosum', 'temporal orchestration', 'field emergent', 'consciousness revolution'],
  corpus_callosum: ['corpus callosum', 'categories', 'brain hemisphere', 'mcgilchrist', 'divided brain', 'sacred separator'],
  temporal_aether: ['aether temporal', 'temporal intelligence', 'timing orchestrator', 'breath coupled', 'coherence gates'],

  // AI Sovereignty System (Multi-model support)
  ai_sovereignty: ['claude code', 'mistral', 'deepseek', 'multi-model', 'sovereign system', 'ai support'],
  consciousness_engineering: ['consciousness engineering', 'stereoscopic depth', 'orchestrated differentiation'],

  // AIN Tag System
  ain_system: ['tag system', 'integrated tags', 'community library', 'field delivered'],

  // Depth Psychology
  jung: ['jung', 'archetype', 'shadow', 'anima', 'animus', 'collective unconscious', 'mysterium', 'coniunctionis'],
  hillman: ['hillman', 'archetypal psychology', 'soul', 'imaginal', 'polytheistic'],

  // Family Constellations
  constellations: ['constellation', 'family system', 'bert hellinger', 'systemic', 'entanglement'],

  // NLP & Transformation
  nlp: ['nlp', 'neuro-linguistic', 'reframe', 'anchor', 'submodality', 'milton model'],
  hypnosis: ['hypnosis', 'trance', 'ericksonian', 'suggestion', 'induction'],

  // MAIA Architecture & Sacred Technology
  maia: ['maia', 'oracle', 'consciousness', 'agents', 'architecture', 'sacred mirror', 'soul transformation'],
  soullab: ['soullab', 'platform', 'sacred', 'technology', 'dev tools'],

  // Philosophical & Neuroscience
  mcgilchrist: ['mcgilchrist', 'hemisphere', 'divided brain', 'master', 'emissary'],
  phenomenology: ['phenomenology', 'merleau-ponty', 'embodied', 'lived experience'],

  // Resonance & Field Theory
  resonance: ['resonance', 'unified field', 'field theory', 'resonance breath', 'field resonance']
};

/**
 * Search vault files by keywords
 * Returns array of matching file paths
 */
export function searchVaultFiles(keywords: string[]): string[] {
  const matchingFiles: string[] = [];

  try {
    // Search both vault directories
    for (const [vaultName, vaultPath] of Object.entries(VAULT_PATHS)) {
      if (!fs.existsSync(vaultPath)) {
        console.warn(`⚠️ [VAULT] Path not found: ${vaultPath}`);
        continue;
      }

      // Get all markdown files in vault
      const files = fs.readdirSync(vaultPath)
        .filter(file => file.endsWith('.md') && !file.startsWith('._')); // Skip Mac resource forks

      // Check each file for keyword matches
      for (const file of files) {
        const fileName = file.toLowerCase();
        const hasMatch = keywords.some(keyword => fileName.includes(keyword.toLowerCase()));

        if (hasMatch) {
          matchingFiles.push(path.join(vaultPath, file));
        }
      }
    }

    console.log(`📚 [VAULT] Found ${matchingFiles.length} files matching keywords`);
    return matchingFiles;

  } catch (error) {
    console.error('❌ [VAULT] Error searching vault:', error);
    return [];
  }
}

/**
 * Load content from specific vault file
 * Returns first ~1000 words (safe for context)
 */
export function loadVaultFile(filePath: string, maxWords: number = 1000): string | null {
  try {
    if (!fs.existsSync(filePath)) {
      console.warn(`⚠️ [VAULT] File not found: ${filePath}`);
      return null;
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    const words = content.split(/\s+/);

    // Truncate to maxWords
    const truncated = words.slice(0, maxWords).join(' ');

    const fileName = path.basename(filePath, '.md');
    console.log(`📖 [VAULT] Loaded ${words.length} words from: ${fileName}`);

    return truncated;

  } catch (error) {
    console.error(`❌ [VAULT] Error loading ${filePath}:`, error);
    return null;
  }
}

/**
 * Detect which wisdom domains are being discussed
 * Returns relevant keywords to search vault
 */
export function detectWisdomDomains(userMessage: string): string[] {
  const message = userMessage.toLowerCase();
  const detectedKeywords: string[] = [];

  // Check each wisdom domain
  for (const [domain, keywords] of Object.entries(WISDOM_KEYWORDS)) {
    const hasMatch = keywords.some(keyword => message.includes(keyword.toLowerCase()));

    if (hasMatch) {
      detectedKeywords.push(...keywords);
      console.log(`🔍 [VAULT] Detected ${domain} domain`);
    }
  }

  return detectedKeywords;
}

/**
 * Load relevant vault wisdom based on conversation context
 * Main function MAIA uses to access second brain
 */
export async function loadVaultWisdom(userMessage: string): Promise<string> {
  // Detect what wisdom domains are being discussed
  const keywords = detectWisdomDomains(userMessage);

  if (keywords.length === 0) {
    // No specific wisdom domain detected - don't load anything
    return '';
  }

  // Search vault for relevant files
  const matchingFiles = searchVaultFiles(keywords);

  if (matchingFiles.length === 0) {
    console.log('📚 [VAULT] No matching files found');
    return '';
  }

  // Load the first matching file (most relevant based on filename)
  const firstFile = matchingFiles[0];
  const content = loadVaultFile(firstFile, 800); // Keep context manageable

  if (!content) {
    return '';
  }

  // Format for MAIA's context
  const fileName = path.basename(firstFile, '.md');

  return `
## VAULT WISDOM - From Kelly's Second Brain

**Source:** ${fileName}

The following is from Kelly's knowledge vault - years of wisdom, conversations, and teachings.
Use this to inform your understanding, but synthesize in your own voice. Don't cite "the vault says" - speak from what you know.

---

${content}

---

(Remember: This is background knowledge to enrich your wisdom. Weave it naturally when relevant.)
`;
}

/**
 * Get vault statistics for debugging
 */
export function getVaultStats(): { totalMarkdown: number; totalPDFs: number; domains: string[] } {
  let totalMarkdown = 0;
  let totalPDFs = 0;

  try {
    for (const vaultPath of Object.values(VAULT_PATHS)) {
      if (fs.existsSync(vaultPath)) {
        const files = fs.readdirSync(vaultPath);
        totalMarkdown += files.filter(f => f.endsWith('.md') && !f.startsWith('._')).length;
        totalPDFs += files.filter(f => f.endsWith('.pdf')).length;
      }
    }
  } catch (error) {
    console.error('❌ [VAULT] Error getting stats:', error);
  }

  return {
    totalMarkdown,
    totalPDFs,
    domains: Object.keys(WISDOM_KEYWORDS)
  };
}
