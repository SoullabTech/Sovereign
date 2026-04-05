import Anthropic from '@anthropic-ai/sdk'
import { ContentSource, ExtractedContent } from './types'

const anthropic = new Anthropic()

export async function extractContent(source: ContentSource): Promise<ExtractedContent> {
  const elementContext = source.element
    ? `\nThis text carries a ${source.element} quality — let that inform which passages feel most alive.`
    : ''

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    system: `You are a careful reader extracting meaningful structure from a manuscript by Kelly Nezat. Preserve her voice — symbolic, grounded, precise. Return valid JSON only, no markdown fences.`,
    messages: [{
      role: 'user',
      content: `Extract structure from this manuscript section.
${elementContext}

TITLE: ${source.title}

TEXT:
${source.body}

Return this exact JSON shape:
{
  "summary": "A 2-3 sentence distillation of the core meaning",
  "passages": ["5-10 meaningful passages that carry the weight of the text — not summaries, actual excerpts or close paraphrases that preserve the author's language"],
  "quotes": ["Short, impactful lines — the kind that stop someone mid-scroll"]
}

Rules:
- passages: 5-10 sections that could stand alone
- quotes: pithy, resonant — the sentences someone would underline
- preserve the author's tone and imagery, do not flatten into generic self-help language`
    }]
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : ''

  return JSON.parse(text)
}
