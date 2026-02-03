/**
 * AIN Knowledge Chunking Service
 *
 * Splits source texts into semantic chunks for embedding.
 * Chunks are sized for optimal retrieval (500-1000 tokens).
 */

import * as fs from 'fs';
import * as path from 'path';

export interface KnowledgeChunk {
  sourceFile: string;
  sourceTitle: string;
  chunkIndex: number;
  chunkText: string;
  chunkTokens: number;
  categories: string[];
  domain: string;
  author?: string;
}

// Category patterns for auto-classification
const CATEGORY_PATTERNS: Record<string, RegExp[]> = {
  cbt: [/cbt/i, /cognitive.?behavio/i, /dbt/i, /beck/i],
  somatic: [/somatic/i, /breath/i, /vagus/i, /body/i, /interocepti/i],
  jungian: [/jung/i, /archetype/i, /shadow/i, /anima/i, /animus/i, /hillman/i, /von.?franz/i],
  gestalt: [/gestalt/i, /wheeler/i],
  existential: [/existential/i, /heidegger/i, /being.?and.?time/i, /deurzen/i],
  attachment: [/attachment/i],
  schema: [/schema/i],
  ptsd: [/ptsd/i, /trauma/i],
  psychodynamic: [/psychoanaly/i, /freud/i],
  humanistic: [/humanistic/i, /rogers/i],
  enneagram: [/enneagram/i],
  human_design: [/human.?design/i, /gates/i, /centers/i],
  iching: [/i.?ching/i, /hexagram/i],
  astrology: [/astrology/i, /mayan/i, /zodiac/i],
  alchemy: [/alchemy/i, /alchemical/i, /hermet/i],
  kabbalah: [/kabbalah/i, /tree.?of.?life/i],
  consciousness: [/consciousness/i, /panpsych/i, /whitehead/i, /maturana/i, /autopoie/i],
  flow: [/flow/i, /csikszentmihalyi/i],
  divided_brain: [/mcgilchrist/i, /divided.?brain/i, /hemisphere/i, /emissary/i],
  mythology: [/myth/i, /folklore/i],
  neuroscience: [/neuro/i, /brain/i, /dopamine/i],
  autism: [/autism/i, /neurodiver/i],
  shamanic: [/shaman/i, /mindell/i],
};

// Domain classification
const DOMAIN_PATTERNS: Record<string, RegExp[]> = {
  therapeutic: [/cbt/i, /dbt/i, /therapy/i, /psychotherap/i, /counsell/i, /treatment/i, /ptsd/i, /attachment/i, /schema/i],
  divination: [/enneagram/i, /human.?design/i, /i.?ching/i, /astrology/i, /zodiac/i, /tarot/i],
  philosophy: [/whitehead/i, /heidegger/i, /panpsych/i, /phenomenolog/i, /existential/i],
  somatic: [/breath/i, /vagus/i, /somatic/i, /body/i, /interocepti/i],
  jungian: [/jung/i, /archetype/i, /alchemy/i, /hillman/i, /shadow/i, /anima/i],
  consciousness: [/consciousness/i, /divided.?brain/i, /mcgilchrist/i, /maturana/i],
};

/**
 * Extract clean title from filename
 */
export function extractTitle(filename: string): string {
  // Remove numeric prefix and extension
  let title = filename
    .replace(/^\d+-/, '')
    .replace(/\.txt$/, '')
    .replace(/\.md$/, '')
    .replace(/-/g, ' ')
    .replace(/_/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // Title case
  return title.split(' ').map(w =>
    w.length > 2 ? w.charAt(0).toUpperCase() + w.slice(1).toLowerCase() : w.toLowerCase()
  ).join(' ');
}

/**
 * Classify source file into categories
 */
export function classifySource(filename: string, content: string): { categories: string[]; domain: string } {
  const categories: string[] = [];
  const testText = filename.toLowerCase() + ' ' + content.substring(0, 5000).toLowerCase();

  for (const [category, patterns] of Object.entries(CATEGORY_PATTERNS)) {
    if (patterns.some(p => p.test(testText))) {
      categories.push(category);
    }
  }

  // Determine primary domain
  let domain = 'general';
  for (const [d, patterns] of Object.entries(DOMAIN_PATTERNS)) {
    if (patterns.some(p => p.test(testText))) {
      domain = d;
      break;
    }
  }

  return { categories, domain };
}

/**
 * Estimate token count (rough approximation)
 */
export function estimateTokens(text: string): number {
  // ~4 chars per token average for English text
  return Math.ceil(text.length / 4);
}

/**
 * Split text into semantic chunks
 */
export function chunkText(
  text: string,
  options: {
    maxTokens?: number;
    overlapTokens?: number;
    minChunkTokens?: number;
  } = {}
): string[] {
  const {
    maxTokens = 800,
    overlapTokens = 100,
    minChunkTokens = 50
  } = options;

  const maxChars = maxTokens * 4;
  const overlapChars = overlapTokens * 4;
  const minChars = minChunkTokens * 4;

  // Clean text
  const cleanText = text
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  // Split by paragraphs first
  const paragraphs = cleanText.split(/\n\n+/);

  const chunks: string[] = [];
  let currentChunk = '';

  for (const para of paragraphs) {
    const trimmedPara = para.trim();
    if (!trimmedPara) continue;

    // If adding this paragraph exceeds max, start new chunk
    if (currentChunk.length + trimmedPara.length > maxChars && currentChunk.length > 0) {
      chunks.push(currentChunk.trim());

      // Start next chunk with overlap from end of current
      if (overlapChars > 0 && currentChunk.length > overlapChars) {
        // Find a good break point for overlap
        const overlapStart = currentChunk.length - overlapChars;
        const spaceIndex = currentChunk.indexOf(' ', overlapStart);
        currentChunk = spaceIndex > 0 ? currentChunk.substring(spaceIndex).trim() : '';
      } else {
        currentChunk = '';
      }
    }

    // Add paragraph to current chunk
    currentChunk = currentChunk ? currentChunk + '\n\n' + trimmedPara : trimmedPara;

    // Handle very long paragraphs
    while (currentChunk.length > maxChars) {
      const breakPoint = findBreakPoint(currentChunk, maxChars);
      chunks.push(currentChunk.substring(0, breakPoint).trim());
      currentChunk = currentChunk.substring(breakPoint - overlapChars).trim();
    }
  }

  // Add remaining content
  if (currentChunk.length >= minChars) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}

/**
 * Find a good break point (sentence or word boundary)
 */
function findBreakPoint(text: string, maxPos: number): number {
  // Try to break at sentence boundary
  const sentenceBreak = text.lastIndexOf('. ', maxPos);
  if (sentenceBreak > maxPos * 0.5) return sentenceBreak + 1;

  // Fall back to word boundary
  const wordBreak = text.lastIndexOf(' ', maxPos);
  if (wordBreak > maxPos * 0.5) return wordBreak;

  // Last resort: hard break
  return maxPos;
}

/**
 * Process a single source file into chunks
 */
export function processSourceFile(filePath: string): KnowledgeChunk[] {
  const filename = path.basename(filePath);
  const content = fs.readFileSync(filePath, 'utf-8');

  const title = extractTitle(filename);
  const { categories, domain } = classifySource(filename, content);
  const textChunks = chunkText(content);

  return textChunks.map((chunkText, index) => ({
    sourceFile: filename,
    sourceTitle: title,
    chunkIndex: index,
    chunkText,
    chunkTokens: estimateTokens(chunkText),
    categories,
    domain,
  }));
}

/**
 * Process all source files in directory
 */
export async function processAllSources(sourceDir: string): Promise<KnowledgeChunk[]> {
  const files = fs.readdirSync(sourceDir)
    .filter(f => f.endsWith('.txt') || f.endsWith('.md'));

  const allChunks: KnowledgeChunk[] = [];

  for (const file of files) {
    const filePath = path.join(sourceDir, file);
    try {
      const chunks = processSourceFile(filePath);
      allChunks.push(...chunks);
      console.log(`[AIN] Chunked ${file}: ${chunks.length} chunks`);
    } catch (error) {
      console.error(`[AIN] Error processing ${file}:`, error);
    }
  }

  console.log(`[AIN] Total: ${allChunks.length} chunks from ${files.length} files`);
  return allChunks;
}
