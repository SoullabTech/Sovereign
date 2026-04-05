import { NextRequest, NextResponse } from 'next/server'
import { runContentPipeline } from '@/lib/content/pipeline'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const memberId = request.headers.get('x-member-id')

  if (!memberId) {
    return NextResponse.json({ error: 'Member ID required' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { title, body: text, element } = body

    if (!title || !text) {
      return NextResponse.json({ error: 'title and body required' }, { status: 400 })
    }

    const result = await runContentPipeline({
      id: `pipeline-${Date.now()}`,
      title,
      body: text,
      element,
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('[ContentPipeline] Error:', error)
    return NextResponse.json({ error: 'Pipeline failed' }, { status: 500 })
  }
}
