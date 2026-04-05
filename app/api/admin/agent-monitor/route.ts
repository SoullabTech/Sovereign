import { NextRequest, NextResponse } from 'next/server'
import { getAgentRuns, getAgentRunById, getAgentRunEvents, getAgentRunSummaryCounts } from '@/lib/ai/agentMonitorQueries'
import { updateAgentRunHumanReview, HumanReviewStatus } from '@/lib/ai/agentMonitor'

export const dynamic = 'force-dynamic'

const VALID_REVIEW_STATUSES: HumanReviewStatus[] = ['pending', 'approved', 'revised', 'rejected']

export async function GET(request: NextRequest) {
  const memberId = request.headers.get('x-member-id')
  if (!memberId) {
    return NextResponse.json({ error: 'Member ID required' }, { status: 401 })
  }

  const params = request.nextUrl.searchParams
  const runId = params.get('id')

  // Single run detail with events
  if (runId) {
    try {
      const [run, events] = await Promise.all([
        getAgentRunById(runId),
        getAgentRunEvents(runId),
      ])

      if (!run) {
        return NextResponse.json({ error: 'Run not found' }, { status: 404 })
      }

      return NextResponse.json({ run, events })
    } catch (error) {
      console.error('[AgentMonitor] GET detail error:', error)
      return NextResponse.json({ error: 'Failed to fetch run' }, { status: 500 })
    }
  }

  // List runs with filters + summary counts
  try {
    const [runs, counts] = await Promise.all([
      getAgentRuns({
        agentName: params.get('agentName') || undefined,
        status: params.get('status') || undefined,
        flaggedOnly: params.get('flaggedOnly') === 'true',
        humanReviewStatus: params.get('humanReviewStatus') || undefined,
        sourceType: params.get('sourceType') || undefined,
        limit: parseInt(params.get('limit') || '50'),
      }),
      getAgentRunSummaryCounts(),
    ])

    return NextResponse.json({ runs, counts })
  } catch (error) {
    console.error('[AgentMonitor] GET list error:', error)
    return NextResponse.json({ error: 'Failed to fetch runs' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  const memberId = request.headers.get('x-member-id')
  if (!memberId) {
    return NextResponse.json({ error: 'Member ID required' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { agentRunId, humanReviewStatus, humanReviewNotes } = body

    if (!agentRunId || !humanReviewStatus) {
      return NextResponse.json({ error: 'agentRunId and humanReviewStatus required' }, { status: 400 })
    }

    if (!VALID_REVIEW_STATUSES.includes(humanReviewStatus)) {
      return NextResponse.json({ error: 'Invalid review status' }, { status: 400 })
    }

    await updateAgentRunHumanReview({
      agentRunId,
      humanReviewStatus,
      humanReviewNotes: humanReviewNotes || undefined,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[AgentMonitor] PATCH error:', error)
    return NextResponse.json({ error: 'Failed to update review' }, { status: 500 })
  }
}
