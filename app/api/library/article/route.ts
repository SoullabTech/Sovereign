import { NextRequest, NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';

// Skip during static export (Capacitor builds)
export const dynamic = 'force-dynamic';

const ALLOWED_DIRECTORIES = [
  'Community-Commons',
  'docs/community-library',
  'docs',
];

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const articlePath = searchParams.get('path');

  if (!articlePath) {
    return NextResponse.json({ error: 'Missing path parameter' }, { status: 400 });
  }

  // Security: Validate the path is within allowed directories
  const normalizedPath = path.normalize(articlePath);
  const isAllowed = ALLOWED_DIRECTORIES.some(dir => normalizedPath.startsWith(dir));

  if (!isAllowed || normalizedPath.includes('..')) {
    return NextResponse.json({ error: 'Invalid path' }, { status: 403 });
  }

  // Only allow .md files
  if (!normalizedPath.endsWith('.md')) {
    return NextResponse.json({ error: 'Only markdown files allowed' }, { status: 400 });
  }

  const fullPath = path.join(process.cwd(), normalizedPath);

  try {
    if (!fs.existsSync(fullPath)) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    const content = fs.readFileSync(fullPath, 'utf-8');

    return new NextResponse(content, {
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      },
    });
  } catch (error) {
    console.error('Error reading article:', error);
    return NextResponse.json({ error: 'Failed to read article' }, { status: 500 });
  }
}
