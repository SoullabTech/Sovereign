import Anthropic from '@anthropic-ai/sdk'
import { ExtractedContent, TransformedContent } from './types'

const anthropic = new Anthropic()

export async function transformContent(extracted: ExtractedContent): Promise<TransformedContent> {
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    system: `You are transforming manuscript excerpts into multiple content formats for Kelly Nezat. Her voice is: symbolic but grounded, direct but warm, mythic but never vague. She does not write like a wellness influencer. She writes like someone who has done the work and is naming what she found. Return valid JSON only, no markdown fences.`,
    messages: [{
      role: 'user',
      content: `Transform these passages into distributable content.

SUMMARY:
${extracted.summary}

PASSAGES:
${JSON.stringify(extracted.passages)}

QUOTES:
${JSON.stringify(extracted.quotes)}

Return this exact JSON shape:
{
  "shortPosts": ["3-5 posts, each 1-3 sentences — clear, direct, scroll-stopping"],
  "longPosts": ["2-3 posts, each 2-4 paragraphs — reflective, draws the reader in deeper"],
  "poeticPosts": ["2-3 posts — symbolic, elegant, the kind of thing someone screenshots"],
  "audioScripts": ["1-2 scripts — natural spoken tone, as if Kelly is talking to one person"]
}

Rules:
- Every output must sound like Kelly wrote it, not an AI
- shortPosts: punch, don't preach
- longPosts: depth without sprawl
- poeticPosts: image-forward, not decorative
- audioScripts: conversational warmth, not performative
- Do not add hashtags, CTAs, or platform-specific formatting`
    }]
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : ''

  return JSON.parse(text)
}
