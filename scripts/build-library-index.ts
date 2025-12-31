#!/usr/bin/env npx tsx
/**
 * Build Library Index
 * Scans Community-Commons and docs for markdown files,
 * extracts metadata, and generates a searchable JSON index.
 *
 * Run: npx tsx scripts/build-library-index.ts
 */

import * as fs from 'fs';
import * as path from 'path';

interface ArticleIndex {
  id: string;
  title: string;
  description: string;
  content: string; // First 500 chars for search
  path: string;
  category: string;
  tags: string[];
  lastModified: string;
}

interface LibraryIndex {
  generated: string;
  totalArticles: number;
  categories: Record<string, { name: string; count: number }>;
  articles: ArticleIndex[];
}

const SCAN_DIRECTORIES = [
  'Community-Commons',
  'docs/community-library',
];

const IGNORED_PATTERNS = [
  /node_modules/,
  /\.git/,
  /_Templates/,
  /_Strategy/,
  /_Substack/,
];

// Strip emojis from text
function stripEmojis(text: string): string {
  return text
    .replace(/[\u{1F300}-\u{1F9FF}]/gu, '') // Most emojis
    .replace(/[\u{2600}-\u{26FF}]/gu, '')   // Misc symbols
    .replace(/[\u{2700}-\u{27BF}]/gu, '')   // Dingbats
    .replace(/[\u{FE00}-\u{FE0F}]/gu, '')   // Variation selectors
    .replace(/[\u{1F000}-\u{1F02F}]/gu, '') // Mahjong
    .replace(/[\u{1F0A0}-\u{1F0FF}]/gu, '') // Playing cards
    .replace(/\*\*/g, '')                    // Markdown bold
    .trim();
}

function extractTitle(content: string): string {
  // Try to find first # heading
  const headingMatch = content.match(/^#\s+(.+)$/m);
  if (headingMatch) {
    return stripEmojis(headingMatch[1].trim());
  }

  // Fallback: first non-empty line
  const lines = content.split('\n').filter(l => l.trim());
  return stripEmojis(lines[0]?.replace(/^#+\s*/, '').trim() || 'Untitled');
}

function extractDescription(content: string): string {
  // Skip title and find first paragraph
  const lines = content.split('\n');
  let inParagraph = false;
  let paragraph = '';

  for (const line of lines) {
    const trimmed = line.trim();

    // Skip headings and empty lines at start
    if (trimmed.startsWith('#') || trimmed === '') {
      if (inParagraph && paragraph) break;
      continue;
    }

    // Skip code blocks, lists at start
    if (trimmed.startsWith('```') || trimmed.startsWith('-') || trimmed.startsWith('*')) {
      if (inParagraph && paragraph) break;
      continue;
    }

    inParagraph = true;
    paragraph += ' ' + trimmed;

    if (paragraph.length > 200) break;
  }

  return stripEmojis(paragraph.trim().slice(0, 200) || 'No description available');
}

function extractTags(content: string, filePath: string): string[] {
  const tags: Set<string> = new Set();

  // Extract from frontmatter if present
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (frontmatterMatch) {
    const tagsMatch = frontmatterMatch[1].match(/tags:\s*\[([^\]]+)\]/);
    if (tagsMatch) {
      tagsMatch[1].split(',').forEach(t => {
        // Clean tag: remove #, quotes, and normalize
        const cleaned = t.trim()
          .replace(/^["']|["']$/g, '') // Remove quotes
          .replace(/^#/, '')            // Remove leading #
          .toLowerCase()
          .replace(/[^a-z0-9-]/g, '-')  // Only alphanumeric and dashes
          .replace(/-+/g, '-')          // Collapse multiple dashes
          .replace(/^-|-$/g, '');       // Trim dashes from ends
        if (cleaned && cleaned.length > 1) {
          tags.add(cleaned);
        }
      });
    }
  }

  // Add category-based tags
  const pathParts = filePath.split('/');
  if (pathParts.includes('01-Core-Concepts')) tags.add('core-concepts');
  if (pathParts.includes('02-Thematic-Essays')) tags.add('essays');
  if (pathParts.includes('00-START-HERE')) tags.add('getting-started');
  if (pathParts.includes('09-Technical')) tags.add('technical');
  if (pathParts.includes('04-Practices')) tags.add('practices');
  if (pathParts.includes('07-Community-Contributions')) tags.add('community');

  // Content-based tags
  const lowerContent = content.toLowerCase();
  if (lowerContent.includes('alchemy') || lowerContent.includes('alchemical')) tags.add('alchemy');
  if (lowerContent.includes('consciousness')) tags.add('consciousness');
  if (lowerContent.includes('spiralogic')) tags.add('spiralogic');
  if (lowerContent.includes('maia')) tags.add('maia');
  if (lowerContent.includes('jung') || lowerContent.includes('jungian')) tags.add('jungian');
  if (lowerContent.includes('shadow')) tags.add('shadow-work');
  if (lowerContent.includes('archetype')) tags.add('archetypes');
  if (lowerContent.includes('soul')) tags.add('soul');
  if (lowerContent.includes('meditation')) tags.add('meditation');
  if (lowerContent.includes('dream')) tags.add('dreams');

  return Array.from(tags);
}

function getCategoryFromPath(filePath: string): string {
  const parts = filePath.split('/');

  // Find the Community-Commons subdirectory
  const ccIndex = parts.indexOf('Community-Commons');
  if (ccIndex !== -1 && parts[ccIndex + 1]) {
    return parts[ccIndex + 1];
  }

  // For docs
  const docsIndex = parts.indexOf('docs');
  if (docsIndex !== -1 && parts[docsIndex + 1]) {
    return parts[docsIndex + 1];
  }

  return 'general';
}

function getCategoryName(category: string): string {
  const names: Record<string, string> = {
    '00-START-HERE': 'Getting Started',
    '01-Core-Concepts': 'Core Concepts',
    '02-Thematic-Essays': 'Thematic Essays',
    '04-Practices': 'Practices',
    '06-Resources': 'Resources',
    '07-Community-Contributions': 'Community Contributions',
    '08-Demos': 'Demos',
    '09-Technical': 'Technical Documentation',
    'community-library': 'Community Library',
    'general': 'General',
  };
  return names[category] || category;
}

function scanDirectory(dir: string, articles: ArticleIndex[]): void {
  const fullPath = path.join(process.cwd(), dir);

  if (!fs.existsSync(fullPath)) {
    console.log(`  Skipping ${dir} (not found)`);
    return;
  }

  const entries = fs.readdirSync(fullPath, { withFileTypes: true });

  for (const entry of entries) {
    const entryPath = path.join(dir, entry.name);

    // Check ignored patterns
    if (IGNORED_PATTERNS.some(p => p.test(entryPath))) {
      continue;
    }

    if (entry.isDirectory()) {
      scanDirectory(entryPath, articles);
    } else if (entry.name.endsWith('.md')) {
      try {
        const content = fs.readFileSync(path.join(process.cwd(), entryPath), 'utf-8');
        const stats = fs.statSync(path.join(process.cwd(), entryPath));

        const article: ArticleIndex = {
          id: entryPath.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase(),
          title: extractTitle(content),
          description: extractDescription(content),
          content: content.slice(0, 500).replace(/\n/g, ' '), // For search
          path: entryPath,
          category: getCategoryFromPath(entryPath),
          tags: extractTags(content, entryPath),
          lastModified: stats.mtime.toISOString(),
        };

        articles.push(article);
      } catch (err) {
        console.error(`  Error processing ${entryPath}:`, err);
      }
    }
  }
}

function buildIndex(): LibraryIndex {
  console.log('Building library index...\n');

  const articles: ArticleIndex[] = [];

  for (const dir of SCAN_DIRECTORIES) {
    console.log(`Scanning ${dir}...`);
    scanDirectory(dir, articles);
  }

  // Build category counts
  const categories: Record<string, { name: string; count: number }> = {};
  for (const article of articles) {
    if (!categories[article.category]) {
      categories[article.category] = {
        name: getCategoryName(article.category),
        count: 0,
      };
    }
    categories[article.category].count++;
  }

  // Sort articles by title
  articles.sort((a, b) => a.title.localeCompare(b.title));

  const index: LibraryIndex = {
    generated: new Date().toISOString(),
    totalArticles: articles.length,
    categories,
    articles,
  };

  console.log(`\nIndexed ${articles.length} articles across ${Object.keys(categories).length} categories`);

  return index;
}

// Main execution
const index = buildIndex();

// Write to public directory for client-side access
const outputPath = path.join(process.cwd(), 'public', 'library-index.json');
fs.writeFileSync(outputPath, JSON.stringify(index, null, 2));
console.log(`\nIndex written to ${outputPath}`);

// Also write a TypeScript type file
const typesPath = path.join(process.cwd(), 'lib', 'library', 'types.ts');
const typesDir = path.dirname(typesPath);
if (!fs.existsSync(typesDir)) {
  fs.mkdirSync(typesDir, { recursive: true });
}

fs.writeFileSync(typesPath, `// Auto-generated by scripts/build-library-index.ts

export interface ArticleIndex {
  id: string;
  title: string;
  description: string;
  content: string;
  path: string;
  category: string;
  tags: string[];
  lastModified: string;
}

export interface LibraryIndex {
  generated: string;
  totalArticles: number;
  categories: Record<string, { name: string; count: number }>;
  articles: ArticleIndex[];
}
`);
console.log(`Types written to ${typesPath}`);
