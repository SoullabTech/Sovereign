// app/api/community/search/route.ts
/**
 * COMMUNITY SEARCH API
 *
 * Unified search across all community content:
 * - Posts (all territories)
 * - Library content (Community-Commons markdown)
 * - Elemental Alchemy book chapters
 */

import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db/postgres'
import fs from 'fs'
import path from 'path'

const COMMONS_ROOT = path.join(process.cwd(), 'Community-Commons')
const BOOK_PATH = path.join(
  process.cwd(),
  'app/api/_backend/data/founder-knowledge/elemental-alchemy-book.json'
)

interface SearchResult {
  id: string
  type: 'post' | 'library' | 'book_chapter'
  title: string
  excerpt: string
  url: string
  territory?: string
  element?: string
  relevance: number
  metadata?: Record<string, unknown>
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q')
  const types = searchParams.get('types')?.split(',') || ['post', 'library', 'book_chapter']
  const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50)

  if (!q || q.trim().length < 2) {
    return NextResponse.json({
      ok: false,
      error: 'Search query must be at least 2 characters'
    }, { status: 400 })
  }

  const searchTerm = q.trim().toLowerCase()
  const results: SearchResult[] = []

  try {
    // 1. Search Posts
    if (types.includes('post')) {
      const postResults = await query(`
        SELECT
          p.id, p.title, p.excerpt, p.content_type, p.element,
          t.slug as territory_slug, t.name as territory_name
        FROM community_posts p
        LEFT JOIN community_territories t ON p.territory_id = t.id
        WHERE p.status = 'published'
          AND (
            p.title ILIKE $1 OR
            p.content ILIKE $1 OR
            p.excerpt ILIKE $1
          )
        ORDER BY
          CASE WHEN p.title ILIKE $1 THEN 1 ELSE 2 END,
          p.heart_count DESC
        LIMIT $2
      `, [`%${searchTerm}%`, Math.ceil(limit / 3)])

      for (const row of postResults.rows) {
        results.push({
          id: `post-${row.id}`,
          type: 'post',
          title: row.title,
          excerpt: row.excerpt || '',
          url: `/maia/community/post/${row.id}`,
          territory: row.territory_name,
          element: row.element,
          relevance: row.title.toLowerCase().includes(searchTerm) ? 1 : 0.7,
          metadata: {
            contentType: row.content_type,
            territorySlug: row.territory_slug
          }
        })
      }
    }

    // 2. Search Library (Community-Commons markdown files)
    if (types.includes('library')) {
      const libraryResults = await searchLibrary(searchTerm, Math.ceil(limit / 3))
      results.push(...libraryResults)
    }

    // 3. Search Elemental Alchemy Book
    if (types.includes('book_chapter')) {
      const bookResults = await searchBook(searchTerm, Math.ceil(limit / 3))
      results.push(...bookResults)
    }

    // Sort by relevance
    results.sort((a, b) => b.relevance - a.relevance)

    return NextResponse.json({
      ok: true,
      query: q,
      results: results.slice(0, limit),
      counts: {
        posts: results.filter(r => r.type === 'post').length,
        library: results.filter(r => r.type === 'library').length,
        book: results.filter(r => r.type === 'book_chapter').length
      }
    })

  } catch (err) {
    console.error('[Search] Error:', err)
    return NextResponse.json(
      { ok: false, error: 'Search failed' },
      { status: 500 }
    )
  }
}

// Search Community-Commons markdown files
async function searchLibrary(searchTerm: string, limit: number): Promise<SearchResult[]> {
  const results: SearchResult[] = []

  try {
    const dirs = ['01-Core-Concepts', '02-Thematic-Essays', '04-Practices', '06-Resources']

    for (const dir of dirs) {
      const dirPath = path.join(COMMONS_ROOT, dir)
      if (!fs.existsSync(dirPath)) continue

      const files = await findMarkdownFiles(dirPath)

      for (const file of files) {
        try {
          const content = fs.readFileSync(file, 'utf-8')
          const title = extractTitle(content) || path.basename(file, '.md')

          if (
            title.toLowerCase().includes(searchTerm) ||
            content.toLowerCase().includes(searchTerm)
          ) {
            const relativePath = path.relative(COMMONS_ROOT, file)
            const slug = relativePath.replace('.md', '').replace(/\s+/g, '-').toLowerCase()

            results.push({
              id: `library-${slug}`,
              type: 'library',
              title,
              excerpt: extractExcerpt(content, searchTerm),
              url: `/maia/community/content/${slug}`,
              relevance: title.toLowerCase().includes(searchTerm) ? 0.9 : 0.6,
              metadata: {
                path: relativePath,
                category: dir
              }
            })

            if (results.length >= limit) break
          }
        } catch {
          // Skip unreadable files
        }
      }

      if (results.length >= limit) break
    }
  } catch (err) {
    console.error('[Search] Library search error:', err)
  }

  return results.slice(0, limit)
}

// Search Elemental Alchemy book
async function searchBook(searchTerm: string, limit: number): Promise<SearchResult[]> {
  const results: SearchResult[] = []

  try {
    if (!fs.existsSync(BOOK_PATH)) return results

    const bookContent = fs.readFileSync(BOOK_PATH, 'utf-8')
    const book = JSON.parse(bookContent)

    for (const chapter of book.content.chapters) {
      const titleMatch = chapter.title.toLowerCase().includes(searchTerm)
      const teachingsMatch = chapter.keyTeachings?.some(
        (t: string) => t.toLowerCase().includes(searchTerm)
      )
      const contentMatch = chapter.content_excerpt?.toLowerCase().includes(searchTerm)

      if (titleMatch || teachingsMatch || contentMatch) {
        results.push({
          id: `book-${chapter.number}`,
          type: 'book_chapter',
          title: chapter.title,
          excerpt: chapter.keyTeachings?.slice(0, 3).join(' • ') || '',
          url: `/maia/community/elemental-alchemy?chapter=${chapter.number}`,
          element: chapter.element,
          relevance: titleMatch ? 0.95 : 0.7,
          metadata: {
            chapterNumber: chapter.number,
            element: chapter.element
          }
        })

        if (results.length >= limit) break
      }
    }
  } catch (err) {
    console.error('[Search] Book search error:', err)
  }

  return results
}

// Helper: Find all markdown files recursively
async function findMarkdownFiles(dir: string): Promise<string[]> {
  const files: string[] = []

  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true })

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name)

      if (entry.isDirectory() && !entry.name.startsWith('_') && !entry.name.startsWith('.')) {
        files.push(...await findMarkdownFiles(fullPath))
      } else if (entry.isFile() && entry.name.endsWith('.md') && !entry.name.startsWith('_')) {
        files.push(fullPath)
      }
    }
  } catch {
    // Skip unreadable directories
  }

  return files
}

// Helper: Extract title from markdown
function extractTitle(content: string): string | null {
  // Try YAML frontmatter
  const frontmatterMatch = content.match(/^---[\s\S]*?title:\s*(.+?)[\r\n][\s\S]*?---/)
  if (frontmatterMatch) return frontmatterMatch[1].trim()

  // Try first H1
  const h1Match = content.match(/^#\s+(.+)$/m)
  if (h1Match) return h1Match[1].trim()

  return null
}

// Helper: Extract excerpt around search term
function extractExcerpt(content: string, searchTerm: string): string {
  const lowerContent = content.toLowerCase()
  const index = lowerContent.indexOf(searchTerm)

  if (index === -1) {
    // Return first 150 chars if term not found
    return content.substring(0, 150).replace(/[#*`]/g, '').trim() + '...'
  }

  // Extract context around the match
  const start = Math.max(0, index - 50)
  const end = Math.min(content.length, index + searchTerm.length + 100)
  let excerpt = content.substring(start, end).replace(/[#*`]/g, '').trim()

  if (start > 0) excerpt = '...' + excerpt
  if (end < content.length) excerpt = excerpt + '...'

  return excerpt
}
