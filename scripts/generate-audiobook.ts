#!/usr/bin/env npx tsx
/**
 * Audiobook Generator for Elemental Alchemy
 *
 * Generates a professional audiobook from the book JSON using OpenAI TTS.
 *
 * Features:
 * - Natural pacing with pauses between sections
 * - Chapter-by-chapter audio files
 * - Combined full audiobook
 * - Metadata and chapter markers
 * - Progress tracking and resumability
 *
 * Usage:
 *   npx tsx scripts/generate-audiobook.ts [options]
 *
 * Options:
 *   --chapter <num>    Generate only specific chapter (0=preface, -1=intro)
 *   --voice <name>     OpenAI voice (default: onyx)
 *   --output <dir>     Output directory (default: ./audiobook-output)
 *   --dry-run          Show what would be generated without calling API
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { config } from 'dotenv';

// Load environment variables from .env.local
config({ path: '.env.local' });

// =============================================================================
// CONFIGURATION
// =============================================================================

const CONFIG = {
  // OpenAI TTS settings
  voice: 'onyx',           // Deep, rich male voice for book reading
  model: 'tts-1-hd',       // High-definition model for audiobook quality
  speed: 1.0,              // Normal speed
  format: 'mp3',

  // Chunking settings (OpenAI has 4096 char limit)
  maxChunkSize: 3500,      // Safe limit under 4096

  // Pause durations (in seconds of silence)
  pauses: {
    paragraph: 0.8,        // Between paragraphs
    section: 2.0,          // Between sections within a chapter
    chapter: 4.0,          // Between chapters
    quote: 0.5,            // Before/after quotes
  },

  // Output settings
  sampleRate: 24000,       // OpenAI TTS sample rate
  bitrate: '192k',         // MP3 bitrate for high quality

  // Paths
  bookPath: 'app/api/_backend/data/founder-knowledge/elemental-alchemy-full.json',
  outputDir: './audiobook-output',
};

// =============================================================================
// TYPES
// =============================================================================

interface Section {
  title: string;
  content: string;
}

interface Chapter {
  number: number;
  title: string;
  element?: string;
  sections?: Section[];
  fullContent?: string;
}

interface BookData {
  title: string;
  author: string;
  content: {
    preface?: string;
    introduction?: string;
    chapters: Chapter[];
  };
}

interface AudioSegment {
  type: 'speech' | 'silence';
  content?: string;       // For speech
  duration?: number;      // For silence (seconds)
  file?: string;          // Generated file path
}

interface GenerationProgress {
  generatedChunks: string[];  // Hash of chunks already generated
  lastChapter: number;
}

// =============================================================================
// TEXT PROCESSING
// =============================================================================

/**
 * Clean text for natural speech synthesis
 */
function cleanTextForSpeech(text: string): string {
  return text
    // Remove markdown artifacts
    .replace(/!\[\]\[image\d+\]/g, '')           // Image refs
    .replace(/\*\*\*/g, '')                       // Horizontal rules
    .replace(/\*\*([^*]+)\*\*/g, '$1')           // Bold markers
    .replace(/\*([^*]+)\*/g, '$1')               // Italic markers
    .replace(/_([^_]+)_/g, '$1')                 // Underscore emphasis
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')     // Links -> text only

    // Clean up quotes for natural reading
    .replace(/[""]|&quot;/g, '"')
    .replace(/['']/g, "'")

    // Fix ellipsis and dashes
    .replace(/\.{3,}/g, '...')
    .replace(/—/g, ' - ')
    .replace(/–/g, ' - ')

    // Normalize whitespace
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]+/g, ' ')

    // Clean up special characters that don't read well
    .replace(/\*/g, '')

    .trim();
}

/**
 * Prepare text for audiobook reading with natural pacing cues
 */
function prepareForAudiobook(text: string): string {
  let prepared = cleanTextForSpeech(text);

  // Add slight pauses after quotes (TTS handles this better with punctuation)
  prepared = prepared.replace(/"([^"]+)"/g, '"$1."');

  // Ensure sentences end with proper punctuation
  prepared = prepared.replace(/([a-z])(\n)/gi, '$1.$2');

  return prepared;
}

/**
 * Split text into chunks suitable for TTS API
 */
function chunkText(text: string, maxSize: number = CONFIG.maxChunkSize): string[] {
  const cleanText = prepareForAudiobook(text);

  if (cleanText.length <= maxSize) {
    return [cleanText];
  }

  const chunks: string[] = [];
  let remaining = cleanText;

  while (remaining.length > 0) {
    if (remaining.length <= maxSize) {
      chunks.push(remaining.trim());
      break;
    }

    let breakPoint = maxSize;
    const searchArea = remaining.slice(0, maxSize);

    // Priority 1: Break at paragraph
    const paragraphBreak = searchArea.lastIndexOf('\n\n');
    if (paragraphBreak > maxSize / 2) {
      breakPoint = paragraphBreak;
    } else {
      // Priority 2: Break at sentence end
      const sentenceEndRegex = /[.!?][\s\n]/g;
      let lastSentenceEnd = -1;
      let match;
      while ((match = sentenceEndRegex.exec(searchArea)) !== null) {
        lastSentenceEnd = match.index + 1;
      }

      if (lastSentenceEnd > maxSize / 2) {
        breakPoint = lastSentenceEnd;
      } else {
        // Priority 3: Break at comma or semicolon
        const clauseBreak = Math.max(
          searchArea.lastIndexOf(', '),
          searchArea.lastIndexOf('; ')
        );
        if (clauseBreak > maxSize / 2) {
          breakPoint = clauseBreak + 1;
        } else {
          // Last resort: Break at space
          const spaceBreak = searchArea.lastIndexOf(' ');
          if (spaceBreak > maxSize / 2) {
            breakPoint = spaceBreak;
          }
        }
      }
    }

    chunks.push(remaining.slice(0, breakPoint).trim());
    remaining = remaining.slice(breakPoint).trim();
  }

  return chunks;
}

/**
 * Create audio segments with appropriate pauses
 */
function createSegmentsForContent(
  content: string,
  type: 'preface' | 'introduction' | 'chapter' | 'section'
): AudioSegment[] {
  const segments: AudioSegment[] = [];

  // Split by paragraphs (double newline)
  const paragraphs = content.split(/\n\n+/).filter(p => p.trim());

  for (let i = 0; i < paragraphs.length; i++) {
    const para = paragraphs[i].trim();
    if (!para) continue;

    // Check if this is a quote (starts with " or italicized)
    const isQuote = para.startsWith('"') || para.startsWith('*"') || para.startsWith('"');

    if (isQuote) {
      segments.push({ type: 'silence', duration: CONFIG.pauses.quote });
    }

    // Chunk the paragraph if needed
    const chunks = chunkText(para);
    for (const chunk of chunks) {
      segments.push({ type: 'speech', content: chunk });
    }

    if (isQuote) {
      segments.push({ type: 'silence', duration: CONFIG.pauses.quote });
    }

    // Add paragraph pause (except after last paragraph)
    if (i < paragraphs.length - 1) {
      segments.push({ type: 'silence', duration: CONFIG.pauses.paragraph });
    }
  }

  return segments;
}

// =============================================================================
// AUDIO GENERATION
// =============================================================================

/**
 * Generate audio using OpenAI TTS API
 */
async function generateAudio(
  text: string,
  outputPath: string,
  options: { voice?: string; speed?: number } = {}
): Promise<void> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY environment variable required');
  }

  const response = await fetch('https://api.openai.com/v1/audio/speech', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: CONFIG.model,
      voice: options.voice || CONFIG.voice,
      input: text,
      speed: options.speed || CONFIG.speed,
      response_format: CONFIG.format,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI TTS API error: ${response.status} - ${error}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  fs.writeFileSync(outputPath, buffer);
}

/**
 * Generate silence audio file using ffmpeg
 */
function generateSilence(duration: number, outputPath: string): void {
  execSync(
    `ffmpeg -f lavfi -i anullsrc=r=${CONFIG.sampleRate}:cl=mono -t ${duration} -q:a 0 "${outputPath}" -y 2>/dev/null`,
    { stdio: 'pipe' }
  );
}

/**
 * Concatenate audio files using ffmpeg
 */
function concatenateAudio(inputFiles: string[], outputPath: string): void {
  // Create a file list for ffmpeg
  const listPath = outputPath.replace(/\.[^.]+$/, '_list.txt');
  const listContent = inputFiles.map(f => `file '${path.resolve(f)}'`).join('\n');
  fs.writeFileSync(listPath, listContent);

  execSync(
    `ffmpeg -f concat -safe 0 -i "${listPath}" -c:a libmp3lame -b:a ${CONFIG.bitrate} "${outputPath}" -y 2>/dev/null`,
    { stdio: 'pipe' }
  );

  // Clean up list file
  fs.unlinkSync(listPath);
}

/**
 * Add ID3 metadata to MP3 file
 */
function addMetadata(
  filePath: string,
  metadata: { title: string; artist: string; album: string; track?: number; year?: string }
): void {
  const metaArgs = [
    `-metadata title="${metadata.title}"`,
    `-metadata artist="${metadata.artist}"`,
    `-metadata album="${metadata.album}"`,
    metadata.track ? `-metadata track="${metadata.track}"` : '',
    metadata.year ? `-metadata date="${metadata.year}"` : '',
  ].filter(Boolean).join(' ');

  const tempPath = filePath.replace('.mp3', '_temp.mp3');
  execSync(
    `ffmpeg -i "${filePath}" -c copy ${metaArgs} "${tempPath}" -y 2>/dev/null`,
    { stdio: 'pipe' }
  );
  fs.renameSync(tempPath, filePath);
}

// =============================================================================
// CHAPTER GENERATION
// =============================================================================

interface ChapterInfo {
  id: string;
  number: number;
  title: string;
  content: string;
  element?: string;
}

/**
 * Extract all chapters from book data
 */
function extractChapters(book: BookData): ChapterInfo[] {
  const chapters: ChapterInfo[] = [];

  // Preface (number = 0)
  if (book.content.preface) {
    chapters.push({
      id: 'preface',
      number: 0,
      title: 'Preface',
      content: book.content.preface,
    });
  }

  // Introduction (number = -1, but we'll sort it after preface)
  if (book.content.introduction) {
    chapters.push({
      id: 'introduction',
      number: 0.5,  // Between preface and chapter 1
      title: 'Introduction',
      content: book.content.introduction,
    });
  }

  // Main chapters
  for (const chapter of book.content.chapters) {
    let content = '';

    // Build chapter content from sections or fullContent
    if (chapter.sections && chapter.sections.length > 0) {
      content = chapter.sections
        .map(s => `${s.title}\n\n${s.content}`)
        .join('\n\n');
    } else if (chapter.fullContent) {
      content = chapter.fullContent;
    }

    if (content) {
      chapters.push({
        id: `chapter-${chapter.number}`,
        number: chapter.number,
        title: chapter.title,
        content,
        element: chapter.element,
      });
    }
  }

  // Sort by number
  chapters.sort((a, b) => a.number - b.number);

  return chapters;
}

/**
 * Generate audio for a single chapter
 */
async function generateChapterAudio(
  chapter: ChapterInfo,
  outputDir: string,
  options: { dryRun?: boolean; verbose?: boolean } = {}
): Promise<string> {
  const chapterDir = path.join(outputDir, 'chunks', chapter.id);
  fs.mkdirSync(chapterDir, { recursive: true });

  console.log(`\n📖 Processing: ${chapter.title}`);

  // Create segments
  const segments = createSegmentsForContent(chapter.content, 'chapter');

  // Add chapter title announcement at the beginning
  const titleAnnouncement = chapter.number > 0
    ? `Chapter ${chapter.number}. ${chapter.title}.`
    : chapter.title;

  segments.unshift(
    { type: 'speech', content: titleAnnouncement },
    { type: 'silence', duration: CONFIG.pauses.section }
  );

  console.log(`   📝 ${segments.filter(s => s.type === 'speech').length} speech segments`);

  if (options.dryRun) {
    const totalChars = segments
      .filter(s => s.type === 'speech')
      .reduce((sum, s) => sum + (s.content?.length || 0), 0);
    console.log(`   📊 ~${totalChars.toLocaleString()} characters`);
    console.log(`   💰 ~$${((totalChars / 1000000) * 15).toFixed(4)} estimated cost`);
    return '';
  }

  // Generate audio for each segment
  const audioFiles: string[] = [];
  let segmentIndex = 0;

  for (const segment of segments) {
    const fileName = `${String(segmentIndex).padStart(4, '0')}.mp3`;
    const filePath = path.join(chapterDir, fileName);

    if (segment.type === 'speech' && segment.content) {
      if (!fs.existsSync(filePath)) {
        if (options.verbose) {
          console.log(`   🎤 Generating segment ${segmentIndex + 1}/${segments.length}...`);
        }
        await generateAudio(segment.content, filePath);
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      audioFiles.push(filePath);
    } else if (segment.type === 'silence' && segment.duration) {
      if (!fs.existsSync(filePath)) {
        generateSilence(segment.duration, filePath);
      }
      audioFiles.push(filePath);
    }

    segmentIndex++;
  }

  // Concatenate into chapter file
  const chapterFile = path.join(outputDir, 'chapters', `${chapter.id}.mp3`);
  fs.mkdirSync(path.dirname(chapterFile), { recursive: true });

  console.log(`   🔗 Concatenating ${audioFiles.length} segments...`);
  concatenateAudio(audioFiles, chapterFile);

  // Add metadata
  addMetadata(chapterFile, {
    title: chapter.title,
    artist: 'Kelly Nezat',
    album: 'Elemental Alchemy: The Ancient Art of Living a Phenomenal Life',
    track: Math.floor(chapter.number) + 1,
    year: '2024',
  });

  console.log(`   ✅ Saved: ${path.basename(chapterFile)}`);

  return chapterFile;
}

// =============================================================================
// MAIN
// =============================================================================

async function main() {
  // Parse arguments
  const args = process.argv.slice(2);
  const options = {
    chapter: undefined as number | undefined,
    voice: CONFIG.voice,
    outputDir: CONFIG.outputDir,
    dryRun: args.includes('--dry-run'),
    verbose: args.includes('--verbose') || args.includes('-v'),
  };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--chapter' && args[i + 1]) {
      options.chapter = parseInt(args[i + 1]);
    } else if (args[i] === '--voice' && args[i + 1]) {
      options.voice = args[i + 1];
    } else if (args[i] === '--output' && args[i + 1]) {
      options.outputDir = args[i + 1];
    }
  }

  console.log('🎧 Elemental Alchemy Audiobook Generator');
  console.log('=========================================\n');

  // Check for ffmpeg
  try {
    execSync('which ffmpeg', { stdio: 'pipe' });
  } catch {
    console.error('❌ ffmpeg is required but not found.');
    console.error('   Install with: brew install ffmpeg');
    process.exit(1);
  }

  // Check for API key (unless dry run)
  if (!options.dryRun && !process.env.OPENAI_API_KEY) {
    console.error('❌ OPENAI_API_KEY environment variable required.');
    console.error('   Set it with: export OPENAI_API_KEY=your-key');
    process.exit(1);
  }

  // Load book data
  const bookPath = path.join(process.cwd(), CONFIG.bookPath);
  if (!fs.existsSync(bookPath)) {
    console.error(`❌ Book not found: ${bookPath}`);
    process.exit(1);
  }

  const bookData: BookData = JSON.parse(fs.readFileSync(bookPath, 'utf-8'));
  console.log(`📚 Book: ${bookData.title}`);
  console.log(`✍️  Author: ${bookData.author}`);
  console.log(`🎙️  Voice: ${options.voice}`);
  console.log(`📁 Output: ${options.outputDir}`);

  if (options.dryRun) {
    console.log('\n⚠️  DRY RUN - No audio will be generated\n');
  }

  // Extract chapters
  const chapters = extractChapters(bookData);
  console.log(`\n📖 Found ${chapters.length} chapters to process\n`);

  // Filter to specific chapter if requested
  const chaptersToProcess = options.chapter !== undefined
    ? chapters.filter(c => Math.floor(c.number) === options.chapter)
    : chapters;

  if (chaptersToProcess.length === 0) {
    console.error(`❌ No chapters found matching criteria`);
    process.exit(1);
  }

  // Create output directory
  fs.mkdirSync(options.outputDir, { recursive: true });

  // Process chapters
  const chapterFiles: string[] = [];
  let totalCost = 0;

  for (const chapter of chaptersToProcess) {
    const chapterFile = await generateChapterAudio(chapter, options.outputDir, {
      dryRun: options.dryRun,
      verbose: options.verbose,
    });

    if (chapterFile) {
      chapterFiles.push(chapterFile);
    }

    // Calculate cost estimate
    const chars = chapter.content.length;
    totalCost += (chars / 1000000) * 15;
  }

  // Generate combined audiobook (if processing all chapters)
  if (!options.dryRun && chapterFiles.length > 1 && options.chapter === undefined) {
    console.log('\n📀 Creating combined audiobook...');

    // Add chapter silence between chapters
    const withSilence: string[] = [];
    const silenceFile = path.join(options.outputDir, 'chunks', 'chapter-silence.mp3');
    generateSilence(CONFIG.pauses.chapter, silenceFile);

    for (let i = 0; i < chapterFiles.length; i++) {
      withSilence.push(chapterFiles[i]);
      if (i < chapterFiles.length - 1) {
        withSilence.push(silenceFile);
      }
    }

    const fullAudiobook = path.join(options.outputDir, 'Elemental_Alchemy_Audiobook.mp3');
    concatenateAudio(withSilence, fullAudiobook);

    // Add metadata
    addMetadata(fullAudiobook, {
      title: 'Elemental Alchemy: The Ancient Art of Living a Phenomenal Life',
      artist: 'Kelly Nezat',
      album: 'Elemental Alchemy',
      year: '2024',
    });

    console.log(`\n✅ Complete audiobook: ${fullAudiobook}`);
  }

  // Summary
  console.log('\n=========================================');
  console.log('📊 Summary:');
  console.log(`   Chapters processed: ${chaptersToProcess.length}`);
  console.log(`   Estimated cost: $${totalCost.toFixed(2)}`);

  if (!options.dryRun) {
    console.log(`\n📁 Output files in: ${options.outputDir}/`);
    console.log('   chapters/     - Individual chapter MP3s');
    if (chapterFiles.length > 1 && options.chapter === undefined) {
      console.log('   Elemental_Alchemy_Audiobook.mp3 - Complete audiobook');
    }
  }

  console.log('\n🎧 Done!\n');
}

main().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
