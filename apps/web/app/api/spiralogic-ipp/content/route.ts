import { NextRequest, NextResponse } from 'next/server';
import { readFileSync, existsSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

export const dynamic = 'force-dynamic';

// Spiralogic-IPP Content API - Provides access to all IPP content for MAIA integration
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'assessment', 'guidance', 'scripts', 'concepts', 'all'
    const format = searchParams.get('format') || 'json'; // 'json', 'markdown', 'meta'

    // Path to the Spiralogic-IPP content in the project
    const contentPath = join(process.cwd(), 'apps', 'web', 'docs', 'community-library', 'spiralogic-ipp');

    if (!existsSync(contentPath)) {
      return NextResponse.json({
        error: 'Spiralogic-IPP content not found',
        path: contentPath
      }, { status: 404 });
    }

    // Get all available files
    const files = readdirSync(contentPath)
      .filter(file => file.endsWith('.md') || file.endsWith('.pdf'))
      .map(file => {
        const fullPath = join(contentPath, file);
        const stats = statSync(fullPath);
        return {
          filename: file,
          path: fullPath,
          size: stats.size,
          modified: stats.mtime,
          type: getContentType(file)
        };
      });

    // Filter by type if requested
    let filteredFiles = files;
    if (type && type !== 'all') {
      filteredFiles = files.filter(file => file.type === type);
    }

    // Return metadata only if requested
    if (format === 'meta') {
      return NextResponse.json({
        contentPath,
        totalFiles: files.length,
        filteredFiles: filteredFiles.length,
        availableTypes: [...new Set(files.map(f => f.type))],
        files: filteredFiles.map(({ path, ...rest }) => rest)
      });
    }

    // Load and return content
    const content = filteredFiles.map(file => {
      if (file.filename.endsWith('.pdf')) {
        return {
          ...file,
          content: '[PDF content - use dedicated PDF endpoint]',
          contentType: 'pdf'
        };
      }

      try {
        const rawContent = readFileSync(file.path, 'utf-8');

        if (format === 'markdown') {
          return {
            ...file,
            content: rawContent,
            contentType: 'markdown'
          };
        }

        // Parse markdown content for JSON format
        const parsed = parseMarkdownContent(rawContent, file.filename);
        return {
          ...file,
          content: parsed,
          contentType: 'parsed'
        };
      } catch (error) {
        return {
          ...file,
          content: null,
          error: `Failed to read file: ${error instanceof Error ? error.message : 'Unknown error'}`,
          contentType: 'error'
        };
      }
    });

    return NextResponse.json({
      success: true,
      contentPath,
      requestedType: type || 'all',
      format,
      totalFiles: filteredFiles.length,
      content
    });

  } catch (error) {
    console.error('Spiralogic-IPP content API error:', error);
    return NextResponse.json({
      error: 'Failed to retrieve Spiralogic-IPP content',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// POST endpoint for adding/updating content (future use)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // For now, just return the structure for future implementation
    return NextResponse.json({
      message: 'Spiralogic-IPP content update endpoint (not yet implemented)',
      received: body,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    return NextResponse.json({
      error: 'Invalid request',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 400 });
  }
}

// Helper functions
function getContentType(filename: string): string {
  const typeMap: Record<string, string> = {
    'Spiralogic-IPP-Assessment.md': 'assessment',
    'Spiralogic-IPP-Assessment-Survey.md': 'assessment',
    'Spiralogic-IPP-Guided-Imagery-Scripts.md': 'scripts',
    'MAIA-Spiralogic-IPP-User-Instructions.md': 'guidance',
    'Engaging-Maia-In-Spiralogic-IPP.md': 'guidance',
    'Spiralogic-Ideal-Parenting-Protocol.md': 'concepts',
    'Research-Backed-Parenting-Implementation.md': 'concepts',
    'Archetypal-Parenting.md': 'concepts'
  };

  return typeMap[filename] || 'general';
}

function parseMarkdownContent(content: string, filename: string) {
  const lines = content.split('\n');
  let metadata: any = {};
  let mainContent = '';
  let inFrontmatter = false;
  let sections: any[] = [];
  let currentSection: any = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Parse YAML frontmatter
    if (line === '---' && i === 0) {
      inFrontmatter = true;
      continue;
    }
    if (line === '---' && inFrontmatter) {
      inFrontmatter = false;
      continue;
    }
    if (inFrontmatter) {
      const [key, ...valueParts] = line.split(':');
      if (key && valueParts.length) {
        metadata[key.trim()] = valueParts.join(':').trim();
      }
      continue;
    }

    // Parse headers for sections
    if (line.startsWith('#')) {
      if (currentSection) {
        sections.push(currentSection);
      }
      const level = line.match(/^#+/)?.[0].length || 1;
      currentSection = {
        level,
        title: line.replace(/^#+\s*/, ''),
        content: [],
        subsections: []
      };
    } else if (currentSection) {
      currentSection.content.push(line);
    } else {
      mainContent += line + '\n';
    }
  }

  if (currentSection) {
    sections.push(currentSection);
  }

  return {
    metadata,
    sections,
    mainContent: mainContent.trim(),
    filename,
    totalLines: lines.length
  };
}