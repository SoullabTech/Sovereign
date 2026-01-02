import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

// Skip during static export (Capacitor builds)
export const dynamic = 'force-dynamic';

/**
 * Community Commons Content API
 *
 * Serves markdown content from the Community-Commons directory.
 * No database required - reads directly from filesystem.
 */

const COMMONS_ROOT = path.join(process.cwd(), 'Community-Commons')

// Map UI paths to actual file paths
const CONTENT_MAP: Record<string, string> = {
  // Core Concepts
  'concepts/nigredo': '01-Core-Concepts/_Published/nigredo.md',
  'concepts/albedo': '01-Core-Concepts/_Published/albedo.md',
  'concepts/citrinitas': '01-Core-Concepts/_Published/citrinitas.md',
  'concepts/soul-spirit': '01-Core-Concepts/soullab-philosophy-spiritual-foundations.md',
  'concepts/dialectical-scaffold': '01-Core-Concepts/The-Dialectical-Scaffold.md',
  'concepts/sacred-architecture': '01-Core-Concepts/THE_SACRED_ARCHITECTURE.md',

  // Thematic Essays
  'essays/against-literalization': '02-Thematic-Essays/_Published/against-literalization.md',
  'essays/stick-with-image': '02-Thematic-Essays/_Published/stick-with-image.md',
  'essays/depression-soul-work': '02-Thematic-Essays/Shadow Work and Conscious Development.md',
  'essays/spiralogic': '02-Thematic-Essays/Spiritual Maturity and Developmental Stages.md',
  'essays/archetypal-patterns': '02-Thematic-Essays/Archetypal Patterns in Personal Transformation.md',
  'essays/elemental-balance': '02-Thematic-Essays/Elemental Balance in Modern Life.md',
  'essays/embodied-wisdom': '02-Thematic-Essays/Embodied Wisdom and Somatic Intelligence.md',

  // Practices
  'practices/active-imagination': '04-Practices/Personal/active-imagination.md',
  'practices/shadow-work': '04-Practices/Personal/shadow-work.md',
  'practices/dream-work': '04-Practices/Personal/dream-work.md',
  'practices/embodied-awareness': '04-Practices/Personal/embodied-awareness.md',
  'practices/sacred-mirror': '04-Practices/sacred-mirror-principle-practices.md',
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const contentPath = searchParams.get('path')
  const listDir = searchParams.get('list')

  // List available content
  if (listDir) {
    try {
      const categories = await listContentCategories()
      return NextResponse.json({ categories })
    } catch (error) {
      return NextResponse.json({ error: 'Failed to list content' }, { status: 500 })
    }
  }

  if (!contentPath) {
    return NextResponse.json({ error: 'Missing path parameter' }, { status: 400 })
  }

  try {
    // First check the content map
    let filePath = CONTENT_MAP[contentPath]

    // If not in map, try direct path resolution
    if (!filePath) {
      // Sanitize path to prevent directory traversal
      const sanitizedPath = contentPath.replace(/\.\./g, '').replace(/^\//, '')
      filePath = sanitizedPath + '.md'
    }

    const fullPath = path.join(COMMONS_ROOT, filePath)

    // Security check: ensure we're still within COMMONS_ROOT
    if (!fullPath.startsWith(COMMONS_ROOT)) {
      return NextResponse.json({ error: 'Invalid path' }, { status: 403 })
    }

    // Check if file exists
    if (!fs.existsSync(fullPath)) {
      // Try alternative locations
      const alternatives = await findAlternativePaths(contentPath)
      if (alternatives.length > 0) {
        return NextResponse.json({
          error: 'Content not found at expected path',
          suggestions: alternatives
        }, { status: 404 })
      }
      return NextResponse.json({ error: 'Content not found' }, { status: 404 })
    }

    const content = fs.readFileSync(fullPath, 'utf-8')
    const metadata = extractMetadata(content)

    return NextResponse.json({
      path: contentPath,
      content,
      metadata,
      lastModified: fs.statSync(fullPath).mtime
    })

  } catch (error) {
    console.error('Error reading content:', error)
    return NextResponse.json({ error: 'Failed to read content' }, { status: 500 })
  }
}

// Extract frontmatter metadata if present
function extractMetadata(content: string): Record<string, string> {
  const metadata: Record<string, string> = {}

  // Check for YAML frontmatter
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/)
  if (frontmatterMatch) {
    const frontmatter = frontmatterMatch[1]
    const lines = frontmatter.split('\n')
    for (const line of lines) {
      const [key, ...valueParts] = line.split(':')
      if (key && valueParts.length > 0) {
        metadata[key.trim()] = valueParts.join(':').trim()
      }
    }
  }

  // Extract title from first H1 if no frontmatter title
  if (!metadata.title) {
    const titleMatch = content.match(/^#\s+(.+)$/m)
    if (titleMatch) {
      metadata.title = titleMatch[1]
    }
  }

  return metadata
}

// List all content categories
async function listContentCategories() {
  const categories: Array<{
    id: string
    name: string
    items: Array<{ path: string; title: string }>
  }> = []

  const dirs = [
    { id: 'concepts', name: 'Core Concepts', path: '01-Core-Concepts' },
    { id: 'essays', name: 'Thematic Essays', path: '02-Thematic-Essays' },
    { id: 'practices', name: 'Practices', path: '04-Practices' },
    { id: 'resources', name: 'Resources', path: '06-Resources' },
    { id: 'technical', name: 'Technical', path: '09-Technical' }
  ]

  for (const dir of dirs) {
    const fullPath = path.join(COMMONS_ROOT, dir.path)
    if (fs.existsSync(fullPath)) {
      const items = await listMarkdownFiles(fullPath, dir.id)
      categories.push({
        id: dir.id,
        name: dir.name,
        items
      })
    }
  }

  return categories
}

// Recursively list markdown files
async function listMarkdownFiles(dirPath: string, prefix: string): Promise<Array<{ path: string; title: string }>> {
  const items: Array<{ path: string; title: string }> = []

  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true })

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name)

      if (entry.isDirectory() && !entry.name.startsWith('_') && !entry.name.startsWith('.')) {
        // Recurse into subdirectories
        const subItems = await listMarkdownFiles(fullPath, `${prefix}/${entry.name}`)
        items.push(...subItems)
      } else if (entry.isFile() && entry.name.endsWith('.md') && !entry.name.startsWith('_')) {
        const content = fs.readFileSync(fullPath, 'utf-8')
        const metadata = extractMetadata(content)
        const slug = entry.name.replace('.md', '').toLowerCase().replace(/\s+/g, '-')

        items.push({
          path: `${prefix}/${slug}`,
          title: metadata.title || entry.name.replace('.md', '').replace(/-/g, ' ')
        })
      }
    }
  } catch (error) {
    console.error(`Error listing ${dirPath}:`, error)
  }

  return items
}

// Find alternative paths for content
async function findAlternativePaths(contentPath: string): Promise<string[]> {
  const suggestions: string[] = []
  const searchTerm = contentPath.split('/').pop()?.toLowerCase() || ''

  // Search through all mapped paths
  for (const [key, value] of Object.entries(CONTENT_MAP)) {
    if (key.toLowerCase().includes(searchTerm) || value.toLowerCase().includes(searchTerm)) {
      suggestions.push(key)
    }
  }

  return suggestions.slice(0, 5)
}
