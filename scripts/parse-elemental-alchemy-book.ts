/**
 * Parse Elemental Alchemy book markdown into structured JSON
 * with full chapter content for the interactive reading experience
 */

import * as fs from 'fs';
import * as path from 'path';

interface Section {
  title: string;
  content: string;
}

interface Chapter {
  number: number;
  title: string;
  element?: string;
  sections: Section[];
  fullContent: string;
}

interface BookData {
  type: string;
  title: string;
  author: string;
  content: {
    preface: string;
    introduction: string;
    chapters: Chapter[];
    appendix: string;
  };
}

const ELEMENT_MAP: Record<number, string> = {
  5: 'fire',
  6: 'water',
  7: 'earth',
  8: 'air',
  9: 'aether'
};

function parseBook(markdownContent: string): BookData {
  const lines = markdownContent.split('\n');

  // Find key markers
  const prefaceStart = lines.findIndex(l => l.trim() === '## Preface');
  const introStart = lines.findIndex(l => l.includes('Introduction') && lines.indexOf(l) > prefaceStart + 50);
  const chapter1Start = lines.findIndex(l => l.includes('Chapter 1:') && l.startsWith('#'));
  // Find the actual Appendix heading (starts with ###), not table of contents mentions
  const appendixStart = lines.findIndex(l => l.match(/^###?\s+Appendix/i));

  // Extract preface (between ## Preface and Introduction section)
  let preface = '';
  if (prefaceStart !== -1) {
    const prefaceEnd = introStart !== -1 ? introStart : chapter1Start;
    preface = lines.slice(prefaceStart, prefaceEnd).join('\n');
  }

  // Extract introduction
  let introduction = '';
  if (introStart !== -1 && chapter1Start !== -1) {
    introduction = lines.slice(introStart, chapter1Start).join('\n');
  }

  // Find all chapter starts
  const chapterStarts: { index: number; number: number; title: string }[] = [];
  lines.forEach((line, index) => {
    const match = line.match(/^#+\s*Chapter\s+(\d+):\s*(.+)/i);
    if (match) {
      chapterStarts.push({
        index,
        number: parseInt(match[1]),
        title: match[2].trim()
      });
    }
  });

  // Parse each chapter
  const chapters: Chapter[] = [];

  for (let i = 0; i < chapterStarts.length; i++) {
    const start = chapterStarts[i];
    const endIndex = i < chapterStarts.length - 1
      ? chapterStarts[i + 1].index
      : (appendixStart !== -1 ? appendixStart : lines.length);

    const chapterLines = lines.slice(start.index, endIndex);
    const fullContent = chapterLines.join('\n');

    // Parse sections within chapter
    const sections: Section[] = [];
    let currentSection: Section | null = null;
    let sectionContent: string[] = [];

    for (const line of chapterLines.slice(1)) { // Skip chapter title line
      const sectionMatch = line.match(/^###?\s+\*?\*?(.+?)\*?\*?\s*$/);

      if (sectionMatch && !line.includes('image')) {
        // Save previous section
        if (currentSection && sectionContent.length > 0) {
          currentSection.content = cleanContent(sectionContent.join('\n'));
          if (currentSection.content.length > 50) {
            sections.push(currentSection);
          }
        }
        // Start new section
        currentSection = {
          title: sectionMatch[1].replace(/\*\*/g, '').trim(),
          content: ''
        };
        sectionContent = [];
      } else if (currentSection) {
        sectionContent.push(line);
      }
    }

    // Save last section
    if (currentSection && sectionContent.length > 0) {
      currentSection.content = cleanContent(sectionContent.join('\n'));
      if (currentSection.content.length > 50) {
        sections.push(currentSection);
      }
    }

    chapters.push({
      number: start.number,
      title: `Chapter ${start.number}: ${start.title}`,
      element: ELEMENT_MAP[start.number],
      sections,
      fullContent: cleanContent(fullContent)
    });
  }

  // Extract appendix
  let appendix = '';
  if (appendixStart !== -1) {
    appendix = lines.slice(appendixStart).join('\n');
  }

  return {
    type: 'elemental_alchemy_book_full',
    title: 'Elemental Alchemy: The Ancient Art of Living a Phenomenal Life',
    author: 'Kelly Nezat',
    content: {
      preface: cleanContent(preface),
      introduction: cleanContent(introduction),
      chapters,
      appendix: cleanContent(appendix)
    }
  };
}

function cleanContent(text: string): string {
  return text
    .replace(/!\[\]\[image\d+\]/g, '') // Remove image refs
    .replace(/\\-/g, '-') // Fix escaped dashes
    .replace(/\\!/g, '!') // Fix escaped exclamation
    .replace(/\*\*\*+/g, '') // Remove excessive asterisks
    .replace(/^#+\s*/gm, '') // Remove heading markers for cleaner reading
    .replace(/\n{4,}/g, '\n\n\n') // Collapse excessive newlines
    .trim();
}

// Main execution
const sourcePath = path.join(__dirname, '../data/ain/source/Elemental Alchemy_ The Ancient Art of Living a Phenomenal Life.md');
const outputPath = path.join(__dirname, '../app/api/_backend/data/founder-knowledge/elemental-alchemy-full.json');

console.log('Reading source file...');
const markdown = fs.readFileSync(sourcePath, 'utf-8');

console.log('Parsing book...');
const bookData = parseBook(markdown);

console.log(`Found ${bookData.content.chapters.length} chapters`);
bookData.content.chapters.forEach(ch => {
  console.log(`  Chapter ${ch.number}: ${ch.sections.length} sections`);
});

console.log('Writing output...');
fs.writeFileSync(outputPath, JSON.stringify(bookData, null, 2));

console.log(`Done! Output written to ${outputPath}`);
