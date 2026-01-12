#!/usr/bin/env npx tsx
/**
 * Chapter Illustration Generator for Elemental Alchemy
 *
 * Extracts key themes from each chapter and generates art prompts
 * for DALL-E, Midjourney, or other AI image generators.
 *
 * Usage:
 *   npx tsx scripts/generate-chapter-illustrations.ts
 *   npx tsx scripts/generate-chapter-illustrations.ts --generate  # Also generate with DALL-E
 *   npx tsx scripts/generate-chapter-illustrations.ts --chapter 5  # Specific chapter only
 */

import fs from 'fs'
import path from 'path'
import Anthropic from '@anthropic-ai/sdk'
import OpenAI from 'openai'
import { config } from 'dotenv'

config({ path: '.env.local' })

const anthropic = new Anthropic()
const openai = new OpenAI()

const BOOK_PATH = './app/api/_backend/data/founder-knowledge/elemental-alchemy-full.json'
const OUTPUT_DIR = './audiobook-output/illustrations'

// Elemental color palettes and aesthetics
const ELEMENTAL_AESTHETICS = {
  fire: {
    colors: 'deep crimson, golden amber, phoenix orange, ember glow',
    mood: 'transformative, passionate, illuminating, fierce yet purifying',
    symbols: 'flames, phoenix, sun, candle, volcano, lightning',
    style: 'dynamic brushstrokes, warm radiating light, upward movement'
  },
  water: {
    colors: 'deep ocean blue, silver moonlight, turquoise, pearl white',
    mood: 'flowing, emotional depth, reflective, cleansing, intuitive',
    symbols: 'ocean waves, moon, tears, rain, rivers, chalice',
    style: 'fluid forms, reflections, depth and transparency, curves'
  },
  earth: {
    colors: 'rich soil brown, forest green, terracotta, gold ochre',
    mood: 'grounded, stable, nurturing, abundant, embodied',
    symbols: 'mountains, trees, crystals, roots, seeds, stone circles',
    style: 'textured, layered, solid forms, natural patterns'
  },
  air: {
    colors: 'sky blue, cloud white, pale lavender, silver gray',
    mood: 'expansive, clear, communicative, swift, intellectual',
    symbols: 'feathers, birds, clouds, wind spirals, breath, smoke',
    style: 'light and airy, movement, transparency, ascending forms'
  },
  aether: {
    colors: 'violet, indigo, starlight white, cosmic purple, iridescent',
    mood: 'transcendent, infinite, unified, sacred, mystical',
    symbols: 'stars, spirals, infinity, torus, mandala, cosmic web',
    style: 'luminous, sacred geometry, celestial, dreamlike, holographic'
  },
  general: {
    colors: 'balanced earth tones with spiritual luminosity',
    mood: 'wisdom, integration, journey, transformation',
    symbols: 'spiral, torus, four elements unified, alchemical symbols',
    style: 'harmonious blend of all elements, sacred and grounded'
  }
}

interface Chapter {
  number: number
  title: string
  element?: string
  sections?: Array<{ title: string; content: string }>
  fullContent?: string
}

interface BookData {
  title: string
  author: string
  content: {
    preface?: string
    introduction?: string
    chapters: Chapter[]
  }
}

interface IllustrationPrompt {
  chapter: string
  element: string
  title: string
  themes: string[]
  visualElements: string[]
  dallePrompt: string
  midjourneyPrompt: string
  negativePrompt: string
}

async function extractThemes(chapterTitle: string, content: string, element: string): Promise<{
  themes: string[]
  visualElements: string[]
  keyImagery: string
}> {
  const aesthetic = ELEMENTAL_AESTHETICS[element as keyof typeof ELEMENTAL_AESTHETICS] || ELEMENTAL_AESTHETICS.general

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    system: `You are an art director creating visual concepts for a spiritual/philosophical book called "Elemental Alchemy" by Kelly Nezat.

The book explores consciousness, personal transformation, and the elements (fire, water, earth, air, aether) as metaphors for aspects of human experience.

For this chapter, the primary element is: ${element}
Elemental aesthetic: ${JSON.stringify(aesthetic)}

Extract visual themes that would make beautiful, meaningful illustrations. Focus on:
- Symbolic imagery (not literal scenes)
- Archetypal symbols
- Nature and cosmic imagery
- Sacred geometry where appropriate
- Emotional/spiritual resonance

Respond in JSON format only.`,
    messages: [{
      role: 'user',
      content: `Chapter: "${chapterTitle}"

Content excerpt (first 3000 chars):
${content.substring(0, 3000)}

Extract:
1. themes: 3-5 core themes as short phrases
2. visualElements: 5-7 specific visual elements/symbols that could appear in artwork
3. keyImagery: One sentence describing the central visual concept for this chapter

Respond as JSON: { "themes": [...], "visualElements": [...], "keyImagery": "..." }`
    }]
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : ''

  try {
    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }
  } catch (e) {
    console.error('Failed to parse themes:', e)
  }

  return {
    themes: ['transformation', 'consciousness', 'elemental wisdom'],
    visualElements: ['spiral', 'light', 'nature'],
    keyImagery: 'A symbolic representation of spiritual transformation'
  }
}

function generatePrompts(
  chapterTitle: string,
  element: string,
  themes: string[],
  visualElements: string[],
  keyImagery: string
): { dallePrompt: string; midjourneyPrompt: string; negativePrompt: string } {
  const aesthetic = ELEMENTAL_AESTHETICS[element as keyof typeof ELEMENTAL_AESTHETICS] || ELEMENTAL_AESTHETICS.general

  const dallePrompt = `A mystical, symbolic illustration for "${chapterTitle}" from the book Elemental Alchemy.

${keyImagery}

Visual elements: ${visualElements.slice(0, 4).join(', ')}.
Color palette: ${aesthetic.colors}.
Style: ${aesthetic.style}.
Mood: ${aesthetic.mood}.

Digital art, highly detailed, spiritual and ethereal, no text or words, suitable for book illustration, 16:9 aspect ratio.`

  const midjourneyPrompt = `${keyImagery}, ${visualElements.slice(0, 4).join(', ')}, ${aesthetic.symbols.split(', ').slice(0, 2).join(', ')}, ${aesthetic.colors}, ${aesthetic.style}, spiritual book illustration, mystical, ethereal, highly detailed, no text --ar 16:9 --v 6 --style raw`

  const negativePrompt = `text, words, letters, watermark, signature, humans, faces, people, photorealistic, cartoon, anime, low quality, blurry`

  return { dallePrompt, midjourneyPrompt, negativePrompt }
}

async function generateDalleImage(prompt: string, outputPath: string): Promise<string | null> {
  try {
    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt: prompt,
      n: 1,
      size: '1792x1024',
      quality: 'hd',
      style: 'vivid'
    })

    const imageUrl = response.data[0]?.url
    if (!imageUrl) return null

    // Download the image
    const imageResponse = await fetch(imageUrl)
    const buffer = await imageResponse.arrayBuffer()
    fs.writeFileSync(outputPath, Buffer.from(buffer))

    return outputPath
  } catch (error) {
    console.error('DALL-E generation failed:', error)
    return null
  }
}

async function main() {
  const args = process.argv.slice(2)
  const shouldGenerate = args.includes('--generate')
  const chapterArg = args.find(a => a.startsWith('--chapter'))
  const specificChapter = chapterArg ? parseInt(args[args.indexOf('--chapter') + 1]) : null

  console.log('🎨 Elemental Alchemy Illustration Generator')
  console.log('==========================================\n')

  // Load book
  const book: BookData = JSON.parse(fs.readFileSync(BOOK_PATH, 'utf-8'))

  // Create output directory
  fs.mkdirSync(OUTPUT_DIR, { recursive: true })
  fs.mkdirSync(path.join(OUTPUT_DIR, 'images'), { recursive: true })

  const allPrompts: IllustrationPrompt[] = []

  // Process preface
  if (!specificChapter || specificChapter === 0) {
    console.log('📖 Processing: Preface')
    const prefaceThemes = await extractThemes('Preface', book.content.preface || '', 'general')
    const prefacePrompts = generatePrompts('Preface', 'general', prefaceThemes.themes, prefaceThemes.visualElements, prefaceThemes.keyImagery)

    allPrompts.push({
      chapter: 'preface',
      element: 'general',
      title: 'Preface',
      themes: prefaceThemes.themes,
      visualElements: prefaceThemes.visualElements,
      ...prefacePrompts
    })
    console.log(`   ✅ Themes: ${prefaceThemes.themes.join(', ')}`)

    if (shouldGenerate) {
      console.log('   🖼️  Generating DALL-E image...')
      await generateDalleImage(prefacePrompts.dallePrompt, path.join(OUTPUT_DIR, 'images', 'preface.png'))
    }
  }

  // Process introduction
  if (!specificChapter || specificChapter === -1) {
    console.log('📖 Processing: Introduction')
    const introThemes = await extractThemes('Introduction', book.content.introduction || '', 'general')
    const introPrompts = generatePrompts('Introduction', 'general', introThemes.themes, introThemes.visualElements, introThemes.keyImagery)

    allPrompts.push({
      chapter: 'introduction',
      element: 'general',
      title: 'Introduction',
      themes: introThemes.themes,
      visualElements: introThemes.visualElements,
      ...introPrompts
    })
    console.log(`   ✅ Themes: ${introThemes.themes.join(', ')}`)

    if (shouldGenerate) {
      console.log('   🖼️  Generating DALL-E image...')
      await generateDalleImage(introPrompts.dallePrompt, path.join(OUTPUT_DIR, 'images', 'introduction.png'))
    }
  }

  // Process chapters
  for (const chapter of book.content.chapters) {
    if (specificChapter && chapter.number !== specificChapter) continue

    console.log(`📖 Processing: ${chapter.title}`)

    // Determine element from chapter title or content
    let element = chapter.element || 'general'
    const titleLower = chapter.title.toLowerCase()
    if (titleLower.includes('fire')) element = 'fire'
    else if (titleLower.includes('water')) element = 'water'
    else if (titleLower.includes('earth')) element = 'earth'
    else if (titleLower.includes('air')) element = 'air'
    else if (titleLower.includes('aether') || titleLower.includes('ether')) element = 'aether'

    const content = chapter.fullContent ||
      (chapter.sections ? chapter.sections.map(s => `${s.title}\n${s.content}`).join('\n\n') : '')

    const themes = await extractThemes(chapter.title, content, element)
    const prompts = generatePrompts(chapter.title, element, themes.themes, themes.visualElements, themes.keyImagery)

    const slug = `ch${String(chapter.number).padStart(2, '0')}`
    allPrompts.push({
      chapter: slug,
      element,
      title: chapter.title,
      themes: themes.themes,
      visualElements: themes.visualElements,
      ...prompts
    })

    console.log(`   🔮 Element: ${element}`)
    console.log(`   ✅ Themes: ${themes.themes.join(', ')}`)

    if (shouldGenerate) {
      console.log('   🖼️  Generating DALL-E image...')
      const imagePath = await generateDalleImage(prompts.dallePrompt, path.join(OUTPUT_DIR, 'images', `${slug}.png`))
      if (imagePath) {
        console.log(`   ✅ Saved: ${imagePath}`)
      }
    }
  }

  // Save all prompts to JSON
  const promptsPath = path.join(OUTPUT_DIR, 'illustration-prompts.json')
  fs.writeFileSync(promptsPath, JSON.stringify(allPrompts, null, 2))
  console.log(`\n📝 Saved prompts to: ${promptsPath}`)

  // Save Midjourney-ready prompts
  const mjPromptsPath = path.join(OUTPUT_DIR, 'midjourney-prompts.txt')
  const mjContent = allPrompts.map(p => `## ${p.title}\n${p.midjourneyPrompt}\n`).join('\n')
  fs.writeFileSync(mjPromptsPath, mjContent)
  console.log(`📝 Saved Midjourney prompts to: ${mjPromptsPath}`)

  console.log('\n==========================================')
  console.log('🎨 Done!')

  if (!shouldGenerate) {
    console.log('\nTo generate images with DALL-E, run:')
    console.log('  npx tsx scripts/generate-chapter-illustrations.ts --generate')
    console.log('\nOr use the Midjourney prompts in midjourney-prompts.txt')
  }
}

main().catch(console.error)
