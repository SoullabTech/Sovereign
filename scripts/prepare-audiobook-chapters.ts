#!/usr/bin/env npx tsx
/**
 * Prepare Audiobook Chapters for Reader
 *
 * Copies generated MP3s to public folder and creates manifests with segment timings.
 * Run after audiobook generation completes.
 *
 * Usage: npx tsx scripts/prepare-audiobook-chapters.ts
 */

import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'

const AUDIOBOOK_OUTPUT = './audiobook-output/chapters'
const PUBLIC_AUDIOBOOK = './public/audiobook/elemental-alchemy'
const BOOK_PATH = './app/api/_backend/data/founder-knowledge/elemental-alchemy-full.json'

interface BookData {
  title: string
  author: string
  content: {
    preface?: string
    introduction?: string
    chapters: Array<{
      number: number
      title: string
      element?: string
      sections?: Array<{ title: string; content: string }>
      fullContent?: string
    }>
  }
}

function getChapterSlug(title: string, index: number): string {
  if (title.toLowerCase() === 'preface') return 'preface'
  if (title.toLowerCase() === 'introduction') return 'introduction'
  return `ch${String(index).padStart(2, '0')}`
}

function getChapterContent(book: BookData, index: number): string {
  if (index === 0) return book.content.preface || ''
  if (index === 1) return book.content.introduction || ''

  const chapter = book.content.chapters[index - 2]
  if (!chapter) return ''

  if (chapter.fullContent) return chapter.fullContent
  if (chapter.sections) {
    return chapter.sections.map(s => `${s.title}\n\n${s.content}`).join('\n\n')
  }
  return ''
}

function getDuration(mp3Path: string): number {
  try {
    const result = execSync(
      `ffprobe -i "${mp3Path}" -show_entries format=duration -v quiet -of csv="p=0"`,
      { encoding: 'utf-8' }
    )
    return Math.round(parseFloat(result.trim()) * 1000)
  } catch {
    return 0
  }
}

function createManifest(
  chapterSlug: string,
  title: string,
  content: string,
  durationMs: number,
  chapterNumber: number
): object {
  const paragraphs = content.split(/\n\n+/).filter(p => p.trim().length > 0)
  const totalChars = content.length
  const msPerChar = durationMs / totalChars

  let currentTime = 0
  const segments = paragraphs.map((text, idx) => {
    const cleanText = text.replace(/[#*_`]/g, '').trim()
    const startMs = Math.round(currentTime)
    const duration = cleanText.length * msPerChar
    currentTime += duration + 800 // 800ms pause between paragraphs

    return {
      text: cleanText,
      startMs,
      endMs: Math.round(currentTime - 800),
      type: cleanText.length < 80 && (idx === 0 || cleanText.match(/^(Chapter|Part|Section)/i))
        ? 'heading'
        : 'paragraph'
    }
  })

  return {
    id: `${chapterSlug}-001`,
    title,
    audioFile: `${chapterSlug}.mp3`,
    durationMs,
    chapterNumber,
    segmentCount: segments.length,
    segments
  }
}

async function main() {
  console.log('📚 Preparing audiobook chapters for reader...\n')

  // Load book data
  const book: BookData = JSON.parse(fs.readFileSync(BOOK_PATH, 'utf-8'))

  // Get list of generated MP3s
  const mp3Files = fs.readdirSync(AUDIOBOOK_OUTPUT)
    .filter(f => f.endsWith('.mp3'))
    .sort()

  console.log(`Found ${mp3Files.length} chapter MP3s\n`)

  const chapterList: Array<{ slug: string; label: string }> = []

  for (const mp3File of mp3Files) {
    const baseName = mp3File.replace('.mp3', '')
    const mp3Path = path.join(AUDIOBOOK_OUTPUT, mp3File)

    // Determine chapter info
    let title: string
    let chapterNumber: number
    let slug: string
    let content: string

    if (baseName === 'preface') {
      title = 'Preface'
      chapterNumber = 0
      slug = 'preface'
      content = book.content.preface || ''
    } else if (baseName === 'introduction') {
      title = 'Introduction'
      chapterNumber = 1
      slug = 'introduction'
      content = book.content.introduction || ''
    } else {
      // Extract chapter number from filename (e.g., "chapter-01" or "ch01")
      const match = baseName.match(/(\d+)/)
      if (!match) {
        console.log(`  ⚠️ Skipping ${mp3File} - can't determine chapter number`)
        continue
      }
      const num = parseInt(match[1], 10)
      const chapter = book.content.chapters[num - 1]
      if (!chapter) {
        console.log(`  ⚠️ Skipping ${mp3File} - chapter ${num} not found in book`)
        continue
      }
      title = chapter.title
      chapterNumber = num + 1 // +1 because preface=0, intro=1
      slug = `ch${String(num).padStart(2, '0')}`
      content = getChapterContent(book, num + 1)
    }

    // Create output directory
    const outDir = path.join(PUBLIC_AUDIOBOOK, slug)
    fs.mkdirSync(outDir, { recursive: true })

    // Copy MP3
    const destMp3 = path.join(outDir, `${slug}.mp3`)
    if (!fs.existsSync(destMp3)) {
      fs.copyFileSync(mp3Path, destMp3)
      console.log(`  ✅ Copied ${slug}.mp3`)
    } else {
      console.log(`  ⏭️  ${slug}.mp3 already exists`)
    }

    // Get duration and create manifest
    const durationMs = getDuration(destMp3)
    const manifest = createManifest(slug, title, content, durationMs, chapterNumber)

    const manifestPath = path.join(outDir, 'manifest.json')
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2))
    console.log(`  ✅ Created manifest (${(manifest as any).segmentCount} segments, ${Math.round(durationMs/1000/60)}min)`)

    chapterList.push({ slug, label: title })
  }

  // Output chapter list for reader page
  console.log('\n📋 Chapter list for reader page:\n')
  console.log('const CHAPTERS: ChapterOption[] = [')
  for (const ch of chapterList) {
    console.log(`  { slug: '${ch.slug}', label: '${ch.label}' },`)
  }
  console.log(']')

  console.log('\n✨ Done!')
}

main().catch(console.error)
