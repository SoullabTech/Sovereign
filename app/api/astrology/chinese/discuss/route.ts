import { NextRequest, NextResponse } from 'next/server'
import { getLLMProvider } from '@/lib/consciousness/LLMProvider'

export const dynamic = 'force-dynamic'

interface ProfileContext {
  animal: string
  element: string
  yinYang: string
  cyclePosition: number
  archetype: string
  compatibility: string[]
  holisticHighlights?: string
}

interface DaYunPeriodSummary {
  element: string
  stem: string
  branch: string
  ageRange: string
  lifeTheme: string
  description: string
  opportunities: string[]
  challenges: string[]
  healthGuidance: string[]
  natalHarmony?: string
  spiritFocus?: string
}

interface DaYunContext {
  currentPeriod: DaYunPeriodSummary
  previousPeriod?: { element: string; lifeTheme: string; ageRange: string }
  nextPeriod?: { element: string; lifeTheme: string; ageRange: string }
  currentAge: number
  periodProgress: number
  fourPillars?: string
}

interface DiscussRequest {
  mode: 'profile' | 'da-yun'
  question?: string
  conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>
  profileContext?: ProfileContext
  daYunContext?: DaYunContext
}

function buildProfileSystemPrompt(ctx: ProfileContext): string {
  return `You are MAIA, a grounded wisdom companion helping someone understand their Chinese astrological profile.

You are interpreting a specific person's chart data — not giving generic astrology advice.

Their profile:
- Zodiac Animal: ${ctx.animal} (${ctx.archetype})
- Element: ${ctx.element}
- Energy: ${ctx.yinYang}
- Sexagenary Cycle Position: ${ctx.cyclePosition}/60
- Most Compatible: ${ctx.compatibility.join(', ')}
${ctx.holisticHighlights ? `- Holistic Profile: ${ctx.holisticHighlights}` : ''}

Guidelines:
1. Anchor every response in the supplied profile data. Do not drift into generic Chinese astrology advice.
2. Speak to the person's specific animal-element combination and what it means for how they move through life.
3. When discussing the holistic profile (body, emotions, mind, spirit, ancestry), connect the layers rather than listing facts.
4. Offer practical, grounded reflections — not fortune-telling or predictions.
5. Keep responses warm, concise, and meaningful (2-3 paragraphs). Do not over-explain.
6. You may reference TCM organ correspondences, Five Element theory, and yin/yang dynamics when relevant.`
}

function buildDaYunSystemPrompt(ctx: DaYunContext): string {
  const { currentPeriod, previousPeriod, nextPeriod, currentAge, periodProgress } = ctx

  let transitionContext = ''
  if (previousPeriod) {
    transitionContext += `\nPrevious period (${previousPeriod.ageRange}): ${previousPeriod.element} element — "${previousPeriod.lifeTheme}"`
  }
  if (nextPeriod) {
    transitionContext += `\nNext period (${nextPeriod.ageRange}): ${nextPeriod.element} element — "${nextPeriod.lifeTheme}"`
  }

  const progressPct = Math.round(periodProgress * 100)

  return `You are MAIA, a grounded wisdom companion helping someone understand their current Da Yun (10-year luck cycle) in Chinese astrology.

You are interpreting a specific person's cycle data — not giving generic astrology advice.

Current Da Yun period:
- Element: ${currentPeriod.element}
- Heavenly Stem: ${currentPeriod.stem} / Earthly Branch: ${currentPeriod.branch}
- Age Range: ${currentPeriod.ageRange}
- Life Theme: "${currentPeriod.lifeTheme}"
- Description: ${currentPeriod.description}
- Harmony with natal chart: ${currentPeriod.natalHarmony || 'not specified'}
${currentPeriod.spiritFocus ? `- Spirit Focus (Wu Shen): ${currentPeriod.spiritFocus}` : ''}
- Opportunities: ${currentPeriod.opportunities.join('; ')}
- Challenges: ${currentPeriod.challenges.join('; ')}
- Health guidance: ${currentPeriod.healthGuidance.join('; ')}

Current age: ${currentAge} (${progressPct}% through this period)
${transitionContext}
${ctx.fourPillars ? `Four Pillars summary: ${ctx.fourPillars}` : ''}

Guidelines:
1. Anchor every response in the supplied Da Yun data. Do not drift into generic Chinese astrology advice.
2. Focus on the current period first. Reference previous/next periods only when discussing transitions or contrasts.
3. Speak to what this period is asking of the person — not what it will "give" them.
4. When the person is in the first or last 20% of a period, acknowledge the transitional energy.
5. Offer practical, grounded reflections — not fortune-telling or predictions.
6. Keep responses warm, concise, and meaningful (2-3 paragraphs). Do not over-explain.
7. You may reference TCM organ correspondences, Five Element theory, and Wu Shen (Five Spirits) when relevant.`
}

export async function POST(request: NextRequest) {
  try {
    const body: DiscussRequest = await request.json()
    const { mode, question, conversationHistory } = body

    if (!mode || (mode !== 'profile' && mode !== 'da-yun')) {
      return NextResponse.json({ ok: false, error: 'mode must be "profile" or "da-yun"' }, { status: 400 })
    }

    let systemPrompt: string

    if (mode === 'profile') {
      if (!body.profileContext) {
        return NextResponse.json({ ok: false, error: 'profileContext required for profile mode' }, { status: 400 })
      }
      systemPrompt = buildProfileSystemPrompt(body.profileContext)
    } else {
      if (!body.daYunContext) {
        return NextResponse.json({ ok: false, error: 'daYunContext required for da-yun mode' }, { status: 400 })
      }
      systemPrompt = buildDaYunSystemPrompt(body.daYunContext)
    }

    // Build messages: keep last 4 turns for context, then add current question
    const messages: Array<{ role: 'user' | 'assistant'; content: string }> = []

    if (conversationHistory && conversationHistory.length > 0) {
      const recent = conversationHistory.slice(-8) // 4 turns = 8 messages (user+assistant pairs)
      for (const msg of recent) {
        messages.push({ role: msg.role, content: msg.content })
      }
    }

    // Current user message
    const userMessage = question
      ? question
      : mode === 'profile'
        ? 'Please give me an initial interpretation of my Chinese astrological profile. What does this animal-element combination say about how I move through life?'
        : 'Please give me an initial interpretation of my current Da Yun period. What is this cycle asking of me, and how does it relate to where I am in life right now?'

    messages.push({ role: 'user', content: userMessage })

    const llmResponse = await getLLMProvider().generateSimple({
      tier: 'core',
      systemPrompt,
      messages,
      maxTokens: 1024,
    })

    const insight = llmResponse.text

    return NextResponse.json({
      ok: true,
      insight,
      usage: {
        inputTokens: 0, // not tracked in abstraction
        outputTokens: llmResponse.metadata.tokenCount ?? 0,
      }
    })
  } catch (err) {
    console.error('[Chinese Astrology Discuss] Error:', err)
    return NextResponse.json(
      { ok: false, error: 'Failed to generate response. Please try again.' },
      { status: 500 }
    )
  }
}
