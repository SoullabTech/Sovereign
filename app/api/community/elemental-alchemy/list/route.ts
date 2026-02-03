export const dynamic = 'force-dynamic';
// app/api/community/elemental-alchemy/route.ts
/**
 * ELEMENTAL ALCHEMY BOOK API
 *
 * Serves Kelly Nezat's "Elemental Alchemy: The Ancient Art of Living a Phenomenal Life"
 * with optional filtering by element and chapter.
 */

import { NextRequest, NextResponse } from 'next/server'

export const revalidate = false;
import fs from 'fs'
import path from 'path'

// Skip during static export (Capacitor builds)

// Use the full book with complete chapter content
const BOOK_PATH = path.join(
  process.cwd(),
  'app/api/_backend/data/founder-knowledge/elemental-alchemy-full.json'
)

export async function GET(request: NextRequest) {
  // During static export, return empty response
  if (process.env.CAPACITOR_BUILD === '1') {
    return NextResponse.json({ chapters: [] });
  }

  const { searchParams } = new URL(request.url)
  const element = searchParams.get('element')
  const chapterNum = searchParams.get('chapter')

  try {
    if (!fs.existsSync(BOOK_PATH)) {
      return NextResponse.json(
        { error: 'Book data not found' },
        { status: 404 }
      )
    }

    const bookContent = fs.readFileSync(BOOK_PATH, 'utf-8')
    const bookData = JSON.parse(bookContent)

    // If requesting specific chapter
    if (chapterNum) {
      const chapter = bookData.content.chapters.find(
        (ch: { number: number }) => ch.number === parseInt(chapterNum)
      )
      if (!chapter) {
        return NextResponse.json(
          { error: 'Chapter not found' },
          { status: 404 }
        )
      }
      return NextResponse.json({
        title: bookData.title,
        author: bookData.author,
        chapter
      })
    }

    // If filtering by element
    if (element) {
      const filteredChapters = bookData.content.chapters.filter(
        (ch: { element?: string }) => (ch.element || 'intro') === element
      )
      return NextResponse.json({
        title: bookData.title,
        author: bookData.author,
        element,
        content: { chapters: filteredChapters }
      })
    }

    // Return full book
    return NextResponse.json(bookData)

  } catch (err) {
    console.error('[Elemental Alchemy] API error:', err)
    return NextResponse.json(
      { error: 'Failed to load book data' },
      { status: 500 }
    )
  }
}
